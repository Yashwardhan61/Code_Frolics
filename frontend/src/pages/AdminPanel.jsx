import React, { useState, useEffect } from 'react';
import { adminService } from '../api/adminService';
import { useToast } from '../contexts/ToastContext';
import { Shield, ShieldCheck, ShieldAlert, Eye, UserCog, Crown, ChevronDown, Search, Users } from 'lucide-react';

const ROLE_CONFIG = {
    ADMIN: {
        label: 'Admin',
        icon: Crown,
        color: '#b45309',
        bg: '#fef3c7',
        border: '#f59e0b',
        description: 'Full control over all content and users'
    },
    MEMBER: {
        label: 'Member',
        icon: ShieldCheck,
        color: '#065f46',
        bg: '#d1fae5',
        border: '#10b981',
        description: 'Can create, edit, and delete own content'
    },
    VIEWER: {
        label: 'Viewer',
        icon: Eye,
        color: '#64748b',
        bg: '#f1f5f9',
        border: '#94a3b8',
        description: 'Read-only access to shared content'
    }
};

function RoleBadge({ role }) {
    const config = ROLE_CONFIG[role] || ROLE_CONFIG.MEMBER;
    const Icon = config.icon;
    return (
        <span
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider"
            style={{
                backgroundColor: config.bg,
                color: config.color,
                border: `1.5px solid ${config.border}`,
            }}
        >
            <Icon className="w-3.5 h-3.5" />
            {config.label}
        </span>
    );
}

export default function AdminPanel() {
    const toast = useToast();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [confirmModal, setConfirmModal] = useState(null);
    const [updating, setUpdating] = useState(false);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const data = await adminService.getAllUsers();
            setUsers(data);
        } catch (err) {
            console.error('Failed to fetch users', err);
            if (err.response?.status === 403) {
                toast.error('Access denied. Admin privileges required.');
            } else {
                toast.error('Failed to load users.');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleRoleChange = (user, newRole) => {
        if (user.role === newRole) return;
        setConfirmModal({ user, newRole });
    };

    const confirmRoleChange = async () => {
        if (!confirmModal) return;
        setUpdating(true);
        try {
            const updated = await adminService.updateUserRole(confirmModal.user.id, confirmModal.newRole);
            setUsers(prev => prev.map(u => u.id === updated.id ? updated : u));
            toast.success(`${confirmModal.user.displayName || confirmModal.user.email} is now ${ROLE_CONFIG[confirmModal.newRole]?.label || confirmModal.newRole}.`);
        } catch (err) {
            const msg = err.response?.data?.message || err.message || 'Failed to update role.';
            toast.error(msg);
        } finally {
            setUpdating(false);
            setConfirmModal(null);
        }
    };

    const filteredUsers = users.filter(u => {
        if (!searchQuery.trim()) return true;
        const q = searchQuery.toLowerCase();
        return (
            u.displayName?.toLowerCase().includes(q) ||
            u.email?.toLowerCase().includes(q) ||
            u.username?.toLowerCase().includes(q) ||
            u.role?.toLowerCase().includes(q)
        );
    });

    const roleCounts = {
        ADMIN: users.filter(u => u.role === 'ADMIN').length,
        MEMBER: users.filter(u => u.role === 'MEMBER').length,
        VIEWER: users.filter(u => u.role === 'VIEWER').length,
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-700"></div>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 pb-6 border-b-2 border-amber-200/60">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3" style={{ color: 'var(--brand-brown-800, #5c2d0e)' }}>
                        <Shield className="w-8 h-8 text-amber-700" />
                        Admin Panel
                    </h1>
                    <p className="text-amber-800/60 mt-1.5 text-sm italic font-serif">
                        Manage user roles and permissions across the family archive.
                    </p>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-3 gap-4 mb-8">
                {Object.entries(ROLE_CONFIG).map(([role, config]) => {
                    const Icon = config.icon;
                    return (
                        <div
                            key={role}
                            className="rounded-xl p-4 flex items-center gap-4 shadow-sm transition-shadow hover:shadow-md"
                            style={{
                                backgroundColor: config.bg,
                                border: `1px solid ${config.border}40`,
                            }}
                        >
                            <div
                                className="w-10 h-10 rounded-lg flex items-center justify-center"
                                style={{ backgroundColor: `${config.color}15` }}
                            >
                                <Icon className="w-5 h-5" style={{ color: config.color }} />
                            </div>
                            <div>
                                <p className="text-2xl font-bold" style={{ color: config.color }}>
                                    {roleCounts[role]}
                                </p>
                                <p className="text-xs font-medium uppercase tracking-wider opacity-70" style={{ color: config.color }}>
                                    {config.label}s
                                </p>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Search Bar */}
            <div className="relative mb-6">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-amber-700/50" />
                <input
                    type="text"
                    placeholder="Search users by name, email, or role..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 rounded-xl bg-amber-50/50 border border-amber-200/60 focus:outline-none focus:border-amber-500 transition-all text-sm"
                    style={{ fontFamily: 'inherit' }}
                />
            </div>

            {/* Users Table */}
            <div className="rounded-2xl border border-amber-200/60 overflow-hidden shadow-sm" style={{ backgroundColor: 'var(--card-bg, #fffdf8)' }}>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-amber-200/60" style={{ backgroundColor: 'rgba(180, 83, 9, 0.04)' }}>
                                <th className="text-left px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-amber-900/70">User</th>
                                <th className="text-left px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-amber-900/70">Email</th>
                                <th className="text-left px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-amber-900/70">Current Role</th>
                                <th className="text-left px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-amber-900/70">Joined</th>
                                <th className="text-left px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-amber-900/70">Change Role</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredUsers.map((user, idx) => (
                                <tr
                                    key={user.id}
                                    className="border-b border-amber-100/50 hover:bg-amber-50/30 transition-colors"
                                >
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-9 h-9 rounded-full bg-amber-100 border-2 border-white shadow-sm flex items-center justify-center overflow-hidden flex-shrink-0">
                                                {user.photoUrl ? (
                                                    <img src={user.photoUrl} alt="" className="w-full h-full object-cover" />
                                                ) : (
                                                    <span className="text-amber-800 font-bold text-sm">
                                                        {user.displayName?.charAt(0)?.toUpperCase() || user.email?.charAt(0)?.toUpperCase() || '?'}
                                                    </span>
                                                )}
                                            </div>
                                            <div>
                                                <p className="text-sm font-semibold text-gray-900">{user.displayName || 'No name set'}</p>
                                                {user.username && (
                                                    <p className="text-xs text-gray-500">@{user.username}</p>
                                                )}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-sm text-gray-600">{user.email}</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <RoleBadge role={user.role} />
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-xs text-gray-500">
                                            {user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '--'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="relative">
                                            <select
                                                value={user.role}
                                                onChange={(e) => handleRoleChange(user, e.target.value)}
                                                className="appearance-none bg-white border border-amber-200 rounded-lg px-3 py-2 pr-8 text-sm text-gray-800 focus:outline-none focus:border-amber-500 cursor-pointer hover:border-amber-400 transition-colors"
                                            >
                                                <option value="ADMIN">Admin</option>
                                                <option value="MEMBER">Member</option>
                                                <option value="VIEWER">Viewer</option>
                                            </select>
                                            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {filteredUsers.length === 0 && (
                    <div className="text-center py-12 text-gray-500">
                        <Users className="w-12 h-12 mx-auto mb-3 text-amber-300" />
                        <p className="text-sm">No users found matching your search.</p>
                    </div>
                )}
            </div>

            {/* Role Legend */}
            <div className="mt-8 p-5 rounded-xl border border-amber-200/40 bg-amber-50/30">
                <h3 className="text-sm font-bold text-amber-900 mb-3 flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4" />
                    Role Permissions
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {Object.entries(ROLE_CONFIG).map(([role, config]) => {
                        const Icon = config.icon;
                        return (
                            <div key={role} className="flex items-start gap-2.5">
                                <Icon className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: config.color }} />
                                <div>
                                    <p className="text-xs font-bold" style={{ color: config.color }}>{config.label}</p>
                                    <p className="text-xs text-gray-500">{config.description}</p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Confirmation Modal */}
            {confirmModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4 border border-amber-100">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
                                <UserCog className="w-5 h-5 text-amber-700" />
                            </div>
                            <h3 className="text-lg font-bold text-gray-900">Change User Role</h3>
                        </div>

                        <p className="text-sm text-gray-600 mb-2">
                            You are about to change the role of:
                        </p>
                        <div className="bg-gray-50 rounded-lg p-3 mb-4">
                            <p className="font-semibold text-gray-900">{confirmModal.user.displayName || confirmModal.user.email}</p>
                            <div className="flex items-center gap-2 mt-2">
                                <RoleBadge role={confirmModal.user.role} />
                                <span className="text-gray-400">-&gt;</span>
                                <RoleBadge role={confirmModal.newRole} />
                            </div>
                        </div>

                        {confirmModal.newRole === 'VIEWER' && (
                            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4 text-xs text-amber-800">
                                <strong>Note:</strong> This user will lose the ability to create, edit, or delete any content. They will only be able to browse.
                            </div>
                        )}

                        {confirmModal.newRole === 'ADMIN' && (
                            <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4 text-xs text-red-800">
                                <strong>Warning:</strong> This user will gain full administrative access, including the ability to manage other users' roles and delete any content.
                            </div>
                        )}

                        <div className="flex gap-3 justify-end mt-6">
                            <button
                                onClick={() => setConfirmModal(null)}
                                className="px-5 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
                                disabled={updating}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmRoleChange}
                                disabled={updating}
                                className="px-5 py-2 rounded-lg text-sm font-medium text-white transition-all shadow-sm hover:shadow-md disabled:opacity-60"
                                style={{ background: 'linear-gradient(135deg, #b45309, #92400e)' }}
                            >
                                {updating ? 'Updating...' : 'Confirm Change'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
