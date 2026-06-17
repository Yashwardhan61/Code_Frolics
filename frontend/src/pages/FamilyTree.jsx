import React, { useState, useEffect, useCallback, useRef } from 'react';
import { familyService } from '../api/familyService';
import { useToast } from '../contexts/ToastContext';
import { TreeDeciduous, Plus, X, Edit2, Trash2, Upload, User, ChevronDown } from 'lucide-react';

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

/* ─── TreeNode card ─────────────────────────────────────────────────────────── */

function TreeNode({ node, onEdit, onDelete, onAddChild, depth = 0 }) {
    const [expanded, setExpanded] = useState(true);
    const hasChildren = node.children && node.children.length > 0;

    return (
        <div className="flex flex-col items-center">
            {/* Card */}
            <div
                className="group relative bg-white border-2 border-amber-100 rounded-2xl shadow-sm hover:shadow-md hover:border-amber-300 transition-all duration-200 w-40 text-center cursor-pointer"
                style={{ minWidth: 140 }}
            >
                {/* Photo */}
                <div className="mt-4 mx-auto w-16 h-16 rounded-full overflow-hidden bg-amber-50 border-2 border-amber-200 flex items-center justify-center">
                    {node.photoUrl ? (
                        <img src={node.photoUrl} alt={node.name} className="w-full h-full object-cover" />
                    ) : (
                        <User className="w-8 h-8 text-amber-300" />
                    )}
                </div>

                <div className="px-3 pb-3 pt-2">
                    <p className="font-semibold text-gray-900 text-sm leading-tight truncate">{node.name}</p>
                    {node.relationship && (
                        <p className="text-[11px] text-amber-600 font-medium mt-0.5">{node.relationship}</p>
                    )}
                    {(node.birthDate || node.deathDate) && (
                        <p className="text-[10px] text-gray-400 mt-0.5">
                            {formatDate(node.birthDate)}{node.deathDate ? ` — ${formatDate(node.deathDate)}` : ''}
                        </p>
                    )}
                </div>

                {/* Action strip - appears on hover */}
                <div className="absolute -top-2 -right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                        onClick={(e) => { e.stopPropagation(); onAddChild(node); }}
                        title="Add child"
                        className="w-6 h-6 rounded-full bg-amber-500 text-white flex items-center justify-center shadow hover:bg-amber-600 transition-colors"
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
                        className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-6 h-6 rounded-full bg-amber-100 border border-amber-300 flex items-center justify-center shadow-sm hover:bg-amber-200 transition-colors"
                    >
                        <ChevronDown className={`w-3 h-3 text-amber-700 transition-transform ${expanded ? '' : '-rotate-90'}`} />
                    </button>
                )}
            </div>

            {/* Children */}
            {hasChildren && expanded && (
                <div className="relative mt-6">
                    {/* Vertical line down from card */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px bg-amber-200" style={{ height: 24 }} />

                    <div className="flex items-start gap-8 relative" style={{ paddingTop: 24 }}>
                        {/* Horizontal connector bar */}
                        {node.children.length > 1 && (
                            <div
                                className="absolute bg-amber-200"
                                style={{
                                    top: 24,
                                    left: `calc(50% - ${(node.children.length - 1) * 0}px)`,
                                    height: 1,
                                    width: `calc(100% - 80px)`,
                                    marginLeft: 40
                                }}
                            />
                        )}
                        {node.children.map((child, i) => (
                            <div key={child.id} className="flex flex-col items-center relative">
                                {/* Vertical line to child */}
                                <div className="w-px bg-amber-200 mb-2" style={{ height: 20 }} />
                                <TreeNode
                                    node={child}
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

    const [modal, setModal] = useState(null);
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [photoTarget, setPhotoTarget] = useState(null);

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

    return (
        <div className="max-w-full py-8">
            {/* Header */}
            <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold" style={{ color: 'var(--brand-brown-800)' }}>Family Tree</h1>
                    <p className="text-gray-500 mt-1 text-sm">{members.length} members in {treeType} tree</p>
                </div>

                <div className="flex items-center gap-3">
                    {/* Tree type tabs */}
                    <div className="flex gap-1 bg-gray-100 p-1 rounded-xl">
                        {['paternal', 'maternal'].map(t => (
                            <button
                                key={t}
                                onClick={() => setTreeType(t)}
                                className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all capitalize ${
                                    treeType === t ? 'bg-white shadow text-amber-700' : 'text-gray-500 hover:text-gray-700'
                                }`}
                            >
                                {t}
                            </button>
                        ))}
                    </div>

                    <button
                        onClick={() => setModal({ mode: 'add', initial: { parentMemberId: null } })}
                        className="flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-medium rounded-xl text-sm transition-colors shadow-sm"
                    >
                        <Plus className="w-4 h-4" />
                        Add Member
                    </button>
                </div>
            </div>

            {/* Tree canvas */}
            <div className="w-full overflow-x-auto pb-8">
                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-700" />
                    </div>
                ) : tree.length === 0 ? (
                    <div className="max-w-7xl mx-auto px-4">
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-16 text-center">
                            <div className="w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                <TreeDeciduous className="w-10 h-10 text-amber-300" />
                            </div>
                            <h3 className="text-xl font-medium text-gray-700 mb-2">No members yet</h3>
                            <p className="text-gray-400 text-sm mb-6">Start building your {treeType} family tree.</p>
                            <button
                                onClick={() => setModal({ mode: 'add', initial: { parentMemberId: null } })}
                                className="inline-flex items-center gap-2 px-6 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-medium rounded-xl text-sm transition-colors"
                            >
                                <Plus className="w-4 h-4" />
                                Add First Member
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="flex gap-12 px-8 pb-4" style={{ minWidth: 'max-content' }}>
                        {tree.map(root => (
                            <TreeNode
                                key={root.id}
                                node={root}
                                onEdit={(node) => setModal({ mode: 'edit', initial: node })}
                                onDelete={(node) => setDeleteTarget(node)}
                                onAddChild={(node) => setModal({ mode: 'add', initial: { parentMemberId: node.id } })}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* Hint bar */}
            {members.length > 0 && (
                <div className="max-w-7xl mx-auto px-4 mt-2">
                    <p className="text-xs text-gray-400 text-center">
                        Hover a card to edit, delete, or add a child member. Click the collapse arrow to fold branches.
                    </p>
                </div>
            )}

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

            {/* Photo upload modal */}
            {photoTarget && (
                <PhotoModal
                    member={photoTarget}
                    treeType={treeType}
                    onClose={() => setPhotoTarget(null)}
                    onUploaded={handlePhotoUploaded}
                    toast={toast}
                />
            )}
        </div>
    );
}
