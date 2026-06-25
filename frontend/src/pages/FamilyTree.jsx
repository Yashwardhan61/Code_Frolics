import React, { useState, useEffect, useCallback, useRef } from 'react';
import { familyService } from '../api/familyService';
import { useToast } from '../contexts/ToastContext';
import { TreeDeciduous, Plus, X, Edit2, Trash2, Upload, User, ChevronDown, Leaf, Users, GitBranch, HelpCircle, Download, Moon, Search, Printer, FileImage, FileCode, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

/* ─── helpers ──────────────────────────────────────────────────────────────── */

function buildTree(members) {
    const map = {};
    members.forEach(m => { map[m.id] = { ...m, children: [] }; });
    const roots = [];
    members.forEach(m => {
        if (m.parentMemberId && map[m.parentMemberId]) {
            map[m.parentMemberId].children.push(map[m.id]);
        } else {
            roots.push(map[m.id]);
        }
    });
    return roots;
}

function formatDate(d) {
    if (!d) return null;
    return new Date(d).getFullYear();
}

function getTreeDepth(nodes) {
    if (!nodes || nodes.length === 0) return 0;
    let maxDepth = 0;
    for (const node of nodes) {
        maxDepth = Math.max(maxDepth, 1 + getTreeDepth(node.children));
    }
    return maxDepth;
}

/* ─── TreeNode card ─────────────────────────────────────────────────────────── */

function TreeNode({ node, onNodeClick, onEdit, onDelete, onAddChild, depth = 0 }) {
    const [expanded, setExpanded] = useState(true);
    const hasChildren = node.children && node.children.length > 0;

    return (
        <div className="flex flex-col items-center">
            {/* Card */}
            <div
                onClick={() => onNodeClick(node.id)}
                className="group relative tree-node-card w-40 text-center cursor-pointer hover:shadow-xl transition-shadow"
                style={{ minWidth: 140 }}
            >
                {/* Photo */}
                <div className="mt-4 mx-auto w-16 h-16 rounded-full overflow-hidden tree-node-photo flex items-center justify-center bg-white">
                    {node.photoUrl ? (
                        <img src={node.photoUrl} alt={node.name} className="w-full h-full object-cover" />
                    ) : (
                        <User className="w-8 h-8" style={{ color: 'var(--theme-accent)' }} />
                    )}
                </div>

                <div className="px-3 pb-3 pt-2">
                    <p className="font-semibold text-gray-900 text-sm leading-tight truncate">{node.name}</p>
                    {node.relationship && (
                        <p className="text-[11px] font-medium mt-0.5" style={{ color: 'var(--theme-primary)' }}>{node.relationship}</p>
                    )}
                    {(node.birthDate || node.deathDate) && (
                        <p className="text-[10px] text-gray-500 mt-0.5">
                            {formatDate(node.birthDate)}{node.deathDate ? ` — ${formatDate(node.deathDate)}` : ''}
                        </p>
                    )}
                </div>

                {/* Action strip - appears on hover */}
                <div className="absolute -top-2 -right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                        onClick={(e) => { e.stopPropagation(); onAddChild(node); }}
                        title="Add child"
                        className="w-6 h-6 rounded-full text-white flex items-center justify-center shadow transition-colors"
                        style={{ backgroundColor: 'var(--theme-accent)' }}
                    >
                        <Plus className="w-3 h-3" />
                    </button>
                    <button
                        onClick={(e) => { e.stopPropagation(); onEdit(node); }}
                        title="Edit"
                        className="w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center shadow hover:bg-blue-600 transition-colors"
                    >
                        <Edit2 className="w-3 h-3" />
                    </button>
                    <button
                        onClick={(e) => { e.stopPropagation(); onDelete(node); }}
                        title="Delete"
                        className="w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center shadow hover:bg-red-600 transition-colors"
                    >
                        <Trash2 className="w-3 h-3" />
                    </button>
                </div>

                {/* Expand/collapse if has children */}
                {hasChildren && (
                    <button
                        onClick={(e) => { e.stopPropagation(); setExpanded(p => !p); }}
                        className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-6 h-6 rounded-full flex items-center justify-center shadow-sm transition-transform hover:scale-110"
                        style={{ backgroundColor: 'var(--theme-light)', border: '1px solid var(--theme-accent)' }}
                    >
                        <ChevronDown className={`w-3 h-3 transition-transform ${expanded ? '' : '-rotate-90'}`} style={{ color: 'var(--theme-primary)' }} />
                    </button>
                )}
            </div>

            {/* Children */}
            {hasChildren && expanded && (
                <div className="relative mt-6">
                    {/* Vertical line down from card */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px" style={{ height: 24, backgroundColor: 'var(--tree-branch-color)' }} />

                    <div className="flex items-start gap-8 relative" style={{ paddingTop: 24 }}>
                        {/* Horizontal connector bar */}
                        {node.children.length > 1 && (
                            <div
                                className="absolute"
                                style={{
                                    top: 24,
                                    left: `calc(50% - ${(node.children.length - 1) * 0}px)`,
                                    height: 2,
                                    width: `calc(100% - 80px)`,
                                    marginLeft: 40,
                                    backgroundColor: 'var(--tree-branch-color)'
                                }}
                            />
                        )}
                        {node.children.map((child, i) => (
                            <div key={child.id} className="flex flex-col items-center relative">
                                {/* Vertical line to child */}
                                <div className="w-px mb-2" style={{ height: 20, backgroundColor: 'var(--tree-branch-color)' }} />
                                <TreeNode
                                    node={child}
                                    onNodeClick={onNodeClick}
                                    onEdit={onEdit}
                                    onDelete={onDelete}
                                    onAddChild={onAddChild}
                                    depth={depth + 1}
                                />
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

/* ─── Member Modal (Add / Edit) ─────────────────────────────────────────────── */

const BLANK_FORM = { name: '', relationship: '', birthDate: '', deathDate: '', birthPlace: '', bio: '', parentMemberId: null };

function MemberModal({ mode, initial, treeType, allMembers, onClose, onSave, toast }) {
    const [form, setForm] = useState({ ...BLANK_FORM, ...initial });
    const [saving, setSaving] = useState(false);

    const set = (k) => (e) => setForm(p => ({ ...p, [k]: e.target.value || null }));

    const submit = async (e) => {
        e.preventDefault();
        if (!form.name?.trim()) { toast.error('Name is required'); return; }
        setSaving(true);
        try {
            const payload = {
                name: form.name,
                relationship: form.relationship || null,
                birthDate: form.birthDate || null,
                deathDate: form.deathDate || null,
                birthPlace: form.birthPlace || null,
                bio: form.bio || null,
                parentMemberId: form.parentMemberId ? Number(form.parentMemberId) : null
            };
            if (mode === 'edit') {
                await onSave(initial.id, payload);
            } else {
                await onSave(payload);
            }
        } catch (err) {
            toast.error(err.response?.data?.message || 'Something went wrong. Please try again.');
            setSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={onClose}>
            <div
                className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto"
                onClick={e => e.stopPropagation()}
            >
                <div className="flex items-center justify-between p-5 border-b border-gray-100">
                    <h2 className="text-lg font-bold text-gray-900">
                        {mode === 'edit' ? 'Edit Member' : 'Add Member'}
                    </h2>
                    <button onClick={onClose} className="p-1 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={submit} className="p-5 space-y-4">

                    <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1">Full Name *</label>
                        <input
                            value={form.name || ''}
                            onChange={set('name')}
                            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-300"
                            placeholder="e.g. Ramesh Kumar"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1">Relationship</label>
                        <select
                            value={form.relationship || ''}
                            onChange={set('relationship')}
                            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-300 bg-white"
                        >
                            <option value="">Select...</option>
                            {['Self', 'Father', 'Mother', 'Grandfather', 'Grandmother', 'Son', 'Daughter',
                              'Brother', 'Sister', 'Uncle', 'Aunt', 'Cousin', 'Spouse', 'Other'].map(r => (
                                <option key={r} value={r}>{r}</option>
                            ))}
                        </select>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-semibold text-gray-600 mb-1">Birth Date</label>
                            <input
                                type="date"
                                value={form.birthDate || ''}
                                onChange={set('birthDate')}
                                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-300"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-600 mb-1">Death Date</label>
                            <input
                                type="date"
                                value={form.deathDate || ''}
                                onChange={set('deathDate')}
                                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-300"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1">Birth Place</label>
                        <input
                            value={form.birthPlace || ''}
                            onChange={set('birthPlace')}
                            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-300"
                            placeholder="City, State"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1">Parent Member</label>
                        <select
                            value={form.parentMemberId || ''}
                            onChange={e => setForm(p => ({ ...p, parentMemberId: e.target.value || null }))}
                            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-300 bg-white"
                        >
                            <option value="">None (root)</option>
                            {allMembers
                                .filter(m => mode !== 'edit' || m.id !== initial.id)
                                .map(m => (
                                    <option key={m.id} value={m.id}>{m.name} ({m.relationship || 'Member'})</option>
                                ))
                            }
                        </select>
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1">Bio</label>
                        <textarea
                            value={form.bio || ''}
                            onChange={set('bio')}
                            rows={3}
                            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-300 resize-none"
                            placeholder="A few words about this person..."
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={saving}
                        className="w-full py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-xl transition-colors disabled:opacity-50 text-sm"
                    >
                        {saving ? 'Saving...' : mode === 'edit' ? 'Save Changes' : 'Add Member'}
                    </button>
                </form>
            </div>
        </div>
    );
}

/* ─── Photo Upload Modal ────────────────────────────────────────────────────── */

function PhotoModal({ member, treeType, onClose, onUploaded, toast }) {
    const [uploading, setUploading] = useState(false);
    const [preview, setPreview] = useState(null);
    const [file, setFile] = useState(null);
    const inputRef = useRef();

    const handleFile = (e) => {
        const f = e.target.files[0];
        if (!f) return;
        setFile(f);
        setPreview(URL.createObjectURL(f));
    };

    const upload = async () => {
        if (!file) return;
        setUploading(true);
        try {
            const data = await familyService.uploadPhoto(treeType, member.id, file);
            onUploaded(member.id, data.photoUrl);
            toast.success('Photo uploaded successfully!');
            onClose();
        } catch (e) {
            console.error(e);
            toast.error('Failed to upload photo. Please try again.');
            setUploading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6" onClick={e => e.stopPropagation()}>
                <div className="flex items-center justify-between mb-4">
                    <h2 className="font-bold text-gray-900">Upload Photo — {member.name}</h2>
                    <button onClick={onClose} className="p-1 rounded text-gray-400 hover:text-gray-700"><X className="w-5 h-5" /></button>
                </div>

                <div
                    className="border-2 border-dashed border-amber-200 rounded-xl p-6 text-center cursor-pointer hover:border-amber-400 transition-colors mb-4"
                    onClick={() => inputRef.current?.click()}
                >
                    {preview ? (
                        <img src={preview} alt="" className="w-32 h-32 object-cover rounded-full mx-auto" />
                    ) : (
                        <>
                            <Upload className="w-8 h-8 text-amber-300 mx-auto mb-2" />
                            <p className="text-sm text-gray-500">Click to choose photo</p>
                        </>
                    )}
                    <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
                </div>

                <button
                    onClick={upload}
                    disabled={!file || uploading}
                    className="w-full py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-xl transition-colors disabled:opacity-40 text-sm"
                >
                    {uploading ? 'Uploading...' : 'Upload'}
                </button>
            </div>
        </div>
    );
}

/* ─── Main Component ─────────────────────────────────────────────────────────── */

export default function FamilyTree() {
    const [treeType, setTreeType] = useState('paternal');
    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(true);
    const toast = useToast();
    const navigate = useNavigate();

    const [modal, setModal] = useState(null);
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [photoTarget, setPhotoTarget] = useState(null);
    const [showHelp, setShowHelp] = useState(false);
    const [showExportOptions, setShowExportOptions] = useState(false);

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const data = await familyService.getTree(treeType);
            setMembers(data);
        } catch (e) {
            console.error(e);
            toast.error('Failed to load family tree. Please refresh.');
        } finally {
            setLoading(false);
        }
    }, [treeType]);

    useEffect(() => { load(); }, [load]);

    const handleSaveAdd = async (payload) => {
        await familyService.addMember(treeType, payload);
        toast.success('Family member added!');
        setModal(null);
        load();
    };

    const handleSaveEdit = async (id, payload) => {
        await familyService.updateMember(treeType, id, payload);
        toast.success('Member updated successfully.');
        setModal(null);
        load();
    };

    const handleDelete = async () => {
        if (!deleteTarget) return;
        try {
            await familyService.deleteMember(treeType, deleteTarget.id);
            toast.success(`${deleteTarget.name} removed from tree.`);
            setDeleteTarget(null);
            load();
        } catch (e) {
            console.error(e);
            toast.error('Failed to remove member. Please try again.');
        }
    };

    const handlePhotoUploaded = (id, url) => {
        setMembers(prev => prev.map(m => m.id === id ? { ...m, photoUrl: url } : m));
    };

    const tree = buildTree(members);
    const depth = getTreeDepth(tree);

    return (
        <div className="family-tree-page relative min-h-screen pb-24" data-theme={treeType} style={{ backgroundColor: 'var(--theme-primary)' }}>
            {/* Background elements */}
            <div className="background-overlay" aria-hidden="true">
                <img src={`https://picsum.photos/seed/${treeType}/1600/900`} alt="Background" />
                <div className="pattern-overlay"></div>
            </div>

            <div className="page-decorations">
                <div className="leaf leaf-1"></div>
                <div className="leaf leaf-2"></div>
                <div className="leaf leaf-3"></div>
                <div className="leaf leaf-4"></div>
            </div>

            {/* Content wrapper */}
            <div className="relative z-10 max-w-full pt-12">
                {/* Header Section */}
                <div className="max-w-4xl mx-auto px-4 mb-12 text-center">
                    <div className="inline-flex items-center justify-center space-x-4 mb-4">
                        <Leaf className="w-8 h-8 opacity-70" style={{ color: 'var(--theme-light)' }} />
                        <h1 className="text-4xl md:text-5xl font-bold tree-title-font" style={{ color: 'white', textShadow: '0 2px 10px rgba(0,0,0,0.3)' }}>
                            {treeType === 'paternal' ? 'Paternal' : 'Maternal'} Family Tree
                        </h1>
                        <Leaf className="w-8 h-8 opacity-70" style={{ color: 'var(--theme-light)' }} />
                    </div>
                    <p className="text-xl tree-subtitle-font mb-8" style={{ color: 'var(--theme-light)' }}>
                        Trace your lineage and preserve your family heritage
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        {/* Theme Toggle Tabs */}
                        <div className="flex bg-black/20 backdrop-blur-sm p-1 rounded-full border border-white/10">
                            {['paternal', 'maternal'].map(t => (
                                <button
                                    key={t}
                                    onClick={() => setTreeType(t)}
                                    className={`px-6 py-2 rounded-full text-sm font-medium transition-all capitalize ${
                                        treeType === t ? 'bg-white shadow-lg text-gray-900' : 'text-white/80 hover:text-white'
                                    }`}
                                >
                                    {t}
                                </button>
                            ))}
                        </div>

                        <button
                            onClick={() => setModal({ mode: 'add', initial: { parentMemberId: null } })}
                            className="flex items-center gap-2 px-6 py-2 bg-white/20 hover:bg-white/30 backdrop-blur-md text-white font-medium rounded-full text-sm transition-colors border border-white/30 shadow-lg"
                        >
                            <Plus className="w-4 h-4" />
                            Add Member
                        </button>
                    </div>
                </div>

            {/* Tree canvas */}
            <div className="w-full overflow-x-auto pb-12 pt-8">
                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white" />
                    </div>
                ) : tree.length === 0 ? (
                    <div className="max-w-3xl mx-auto px-4 relative">
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-white/5 rounded-full blur-3xl pointer-events-none"></div>
                        <div className="bg-white/10 backdrop-blur-md rounded-3xl shadow-2xl border border-white/20 p-12 md:p-16 text-center relative overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent pointer-events-none"></div>
                            <div className="w-24 h-24 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-8 relative">
                                <div className="absolute inset-0 bg-white/20 rounded-full animate-ping opacity-20" style={{ animationDuration: '3s' }}></div>
                                <TreeDeciduous className="w-12 h-12 text-white drop-shadow-md" />
                            </div>
                            <h3 className="text-3xl md:text-4xl font-bold text-white mb-4 tracking-tight drop-shadow-md font-serif">Plant the First Seed</h3>
                            <p className="text-white/80 text-lg mb-10 max-w-xl mx-auto leading-relaxed">
                                Your {treeType} family history is waiting to be written. Begin by adding yourself or your oldest known ancestor and watch your legacy grow.
                            </p>
                            <button
                                onClick={() => setModal({ mode: 'add', initial: { parentMemberId: null } })}
                                className="inline-flex items-center gap-3 px-8 py-4 bg-white text-gray-900 font-bold rounded-full text-lg transition-all hover:scale-105 hover:shadow-[0_0_20px_rgba(255,255,255,0.3)]"
                            >
                                <Plus className="w-6 h-6" />
                                Start Your Family Tree
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="flex justify-center gap-12 px-8" style={{ minWidth: 'max-content' }}>
                        {tree.map(root => (
                            <TreeNode
                                key={root.id}
                                node={root}
                                onNodeClick={(id) => navigate(`/member/${id}/stories`)}
                                onEdit={(node) => setModal({ mode: 'edit', initial: node })}
                                onDelete={(node) => setDeleteTarget(node)}
                                onAddChild={(node) => setModal({ mode: 'add', initial: { parentMemberId: node.id } })}
                            />
                        ))}
                    </div>
                )}
            </div>

            </div> {/* End of z-10 content wrapper */}

            {/* Footer Quick Actions Bar */}
            <div className="fixed bottom-0 left-0 right-0 bg-black/60 backdrop-blur-md border-t border-white/20 text-white z-40 p-3 px-6 flex flex-col sm:flex-row justify-between items-center gap-4">
                <div className="flex items-center gap-4">
                    <button onClick={() => setShowHelp(true)} className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors" title="Help">
                        <HelpCircle className="w-5 h-5" />
                    </button>
                    <button onClick={() => setShowExportOptions(true)} className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors" title="Export">
                        <Download className="w-5 h-5" />
                    </button>
                    <button onClick={() => toast.info('Theme toggle coming soon!')} className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors" title="Toggle Theme">
                        <Moon className="w-5 h-5" />
                    </button>
                    <button onClick={() => toast.info('Zoom functionality coming soon!')} className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors" title="Reset Zoom">
                        <Search className="w-5 h-5" />
                    </button>
                </div>

                <div className="flex items-center gap-6 text-sm font-medium">
                    <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-white/70" />
                        <span>{members.length} members</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <GitBranch className="w-4 h-4 text-white/70" />
                        <span>{depth} generations</span>
                    </div>
                    <div className="hidden md:block opacity-60 text-xs ml-4">
                        Yaado ka Baksa • Family Tree
                    </div>
                </div>
            </div>

            {/* Add / Edit Modal */}
            {modal && (
                <MemberModal
                    mode={modal.mode}
                    initial={modal.initial}
                    treeType={treeType}
                    allMembers={members}
                    onClose={() => setModal(null)}
                    onSave={modal.mode === 'edit' ? handleSaveEdit : handleSaveAdd}
                    toast={toast}
                />
            )}

            {/* Delete confirmation */}
            {deleteTarget && (
                <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
                        <h2 className="font-bold text-gray-900 mb-2">Remove Member</h2>
                        <p className="text-sm text-gray-600 mb-6">
                            Remove <span className="font-semibold">{deleteTarget.name}</span>? Their children will become root nodes.
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setDeleteTarget(null)}
                                className="flex-1 py-2 border border-gray-200 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDelete}
                                className="flex-1 py-2 bg-red-500 hover:bg-red-600 text-white rounded-xl text-sm font-medium transition-colors"
                            >
                                Remove
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Help Modal */}
            {showHelp && (
                <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4" onClick={() => setShowHelp(false)}>
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-between mb-4 pb-4 border-b">
                            <h2 className="font-bold text-gray-900 flex items-center gap-2"><HelpCircle className="w-5 h-5" /> Family Tree Help</h2>
                            <button onClick={() => setShowHelp(false)} className="text-gray-400 hover:text-gray-700"><X className="w-5 h-5" /></button>
                        </div>
                        <div className="space-y-4 text-sm text-gray-600">
                            <div>
                                <h3 className="font-bold text-gray-800 mb-1">Getting Started</h3>
                                <p>Click "Start Your Family Tree" to begin. Add yourself or the oldest ancestor first. Then add relatives by clicking the <Plus className="inline w-3 h-3"/> icon on a person's card.</p>
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-800 mb-1">Managing Your Tree</h3>
                                <p>Hover over any person to edit their details or delete them. Click the arrow button under a person to hide or show their children.</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Export Modal (Placeholder) */}
            {showExportOptions && (
                <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4" onClick={() => setShowExportOptions(false)}>
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-between mb-6 pb-4 border-b">
                            <h2 className="font-bold text-gray-900 flex items-center gap-2"><Download className="w-5 h-5" /> Export Family Tree</h2>
                            <button onClick={() => setShowExportOptions(false)} className="text-gray-400 hover:text-gray-700"><X className="w-5 h-5" /></button>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                            <button className="flex flex-col items-center justify-center p-4 border border-gray-200 rounded-xl hover:bg-amber-50 hover:border-amber-200 transition-colors" onClick={() => {toast.info('PDF Export coming soon!'); setShowExportOptions(false)}}>
                                <FileText className="w-8 h-8 text-amber-600 mb-2" />
                                <span className="font-medium text-gray-800">Save as PDF</span>
                            </button>
                            <button className="flex flex-col items-center justify-center p-4 border border-gray-200 rounded-xl hover:bg-amber-50 hover:border-amber-200 transition-colors" onClick={() => {toast.info('Image Export coming soon!'); setShowExportOptions(false)}}>
                                <FileImage className="w-8 h-8 text-amber-600 mb-2" />
                                <span className="font-medium text-gray-800">Save as Image</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
