import React, { useState, useEffect, useRef } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { LogOut, Home, User, Users, Menu, X, TreeDeciduous, Images, Bell, Trash2, BookOpen, Gem } from 'lucide-react';
import { notificationService } from '../api/notificationService';

export default function MainLayout() {
    const { logout, currentUser } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isNotifOpen, setIsNotifOpen] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const notifRef = useRef(null);

    const handleLogout = async () => {
        try {
            await logout();
            navigate('/login');
        } catch (error) {
            console.error("Failed to log out", error);
        }
    };

    const fetchNotifications = async () => {
        try {
            const [data, count] = await Promise.all([
                notificationService.getNotifications(),
                notificationService.getUnreadCount()
            ]);
            setNotifications(data);
            setUnreadCount(count);
        } catch {
            // silently fail if backend not yet running
        }
    };

    useEffect(() => {
        fetchNotifications();
        const interval = setInterval(fetchNotifications, 30000);
        return () => clearInterval(interval);
    }, []);

    // Close notif panel when clicking outside
    useEffect(() => {
        const handler = (e) => {
            if (notifRef.current && !notifRef.current.contains(e.target)) {
                setIsNotifOpen(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const handleMarkRead = async (id) => {
        try {
            await notificationService.markAsRead(id);
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (e) {
            console.error(e);
        }
    };

    const handleDeleteNotif = async (id) => {
        try {
            await notificationService.deleteNotification(id);
            const deleted = notifications.find(n => n.id === id);
            setNotifications(prev => prev.filter(n => n.id !== id));
            if (deleted && !deleted.isRead) setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (e) {
            console.error(e);
        }
    };

    const formatTimeAgo = (dateStr) => {
        const diff = Date.now() - new Date(dateStr).getTime();
        const mins = Math.floor(diff / 60000);
        if (mins < 1) return 'just now';
        if (mins < 60) return `${mins}m ago`;
        const hrs = Math.floor(mins / 60);
        if (hrs < 24) return `${hrs}h ago`;
        return `${Math.floor(hrs / 24)}d ago`;
    };

    const navLinks = [
        { name: 'Dashboard', path: '/dashboard', icon: <Home className="w-5 h-5 mr-2" /> },
        { name: 'Family Tree', path: '/family-tree', icon: <TreeDeciduous className="w-5 h-5 mr-2" /> },
        { name: 'Gallery', path: '/gallery', icon: <Images className="w-5 h-5 mr-2" /> },
        { name: 'Heritage', path: '/heritage', icon: <Gem className="w-5 h-5 mr-2" /> },
        { name: 'Friends', path: '/friends', icon: <Users className="w-5 h-5 mr-2" /> },
        { name: 'Profile', path: '/profile', icon: <User className="w-5 h-5 mr-2" /> },
    ];

    const isActive = (path) => location.pathname === path;

    return (
        <div className="min-h-screen flex flex-col" style={{ backgroundColor: 'var(--page-bg)' }}>
            <nav className="fixed top-0 left-0 right-0 z-50 shadow-lg" style={{ backgroundColor: 'var(--nav-bg)' }}>
                <div className="max-w-7xl mx-auto px-4">
                    <div className="flex justify-between items-center h-16">
                        <Link to="/dashboard" className="flex-shrink-0 flex items-center">
                            <div className="w-10 h-10 rounded-lg overflow-hidden">
                                <img src="/logo.jpeg" alt="Yaado ka baksa" className="w-full h-full object-cover" />
                            </div>
                            <span className="ml-2 text-xl font-semibold brand-title" style={{ color: 'var(--nav-text-active)' }}>Yaado ka baksa</span>
                        </Link>

                        {/* Desktop Menu */}
                        <div className="hidden md:flex items-center space-x-1">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.name}
                                    to={link.path}
                                    className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                                        isActive(link.path)
                                            ? 'bg-white/10 text-amber-200'
                                            : 'text-amber-100/70 hover:text-amber-100 hover:bg-white/5'
                                    }`}
                                >
                                    {link.icon}
                                    {link.name}
                                </Link>
                            ))}

                            {/* Notification Bell */}
                            <div className="relative ml-2" ref={notifRef}>
                                <button
                                    id="notif-bell"
                                    onClick={() => setIsNotifOpen(!isNotifOpen)}
                                    className="relative p-2 rounded-lg text-amber-100/70 hover:text-amber-100 hover:bg-white/5 transition-all"
                                >
                                    <Bell className="w-5 h-5" />
                                    {unreadCount > 0 && (
                                        <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                                            {unreadCount > 9 ? '9+' : unreadCount}
                                        </span>
                                    )}
                                </button>

                                {/* Notification Dropdown */}
                                {isNotifOpen && (
                                    <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-50">
                                        <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
                                            <h3 className="font-semibold text-gray-900 text-sm">Notifications</h3>
                                            {unreadCount > 0 && (
                                                <span className="text-xs text-amber-600 font-medium">{unreadCount} unread</span>
                                            )}
                                        </div>

                                        <div className="max-h-80 overflow-y-auto divide-y divide-gray-50">
                                            {notifications.length === 0 ? (
                                                <div className="px-4 py-8 text-center">
                                                    <Bell className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                                                    <p className="text-sm text-gray-400">No notifications yet</p>
                                                </div>
                                            ) : (
                                                notifications.map(notif => (
                                                    <div
                                                        key={notif.id}
                                                        className={`px-4 py-3 flex items-start gap-3 transition-colors ${
                                                            !notif.isRead ? 'bg-amber-50/60' : 'hover:bg-gray-50'
                                                        }`}
                                                    >
                                                        <div className="flex-1 min-w-0">
                                                            {!notif.isRead && (
                                                                <span className="inline-block w-1.5 h-1.5 rounded-full bg-amber-500 mr-1.5 mb-0.5 align-middle" />
                                                            )}
                                                            <p className="text-xs font-semibold text-gray-800 truncate">{notif.title}</p>
                                                            <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{notif.message}</p>
                                                            <p className="text-[10px] text-gray-400 mt-1">{formatTimeAgo(notif.createdAt)}</p>
                                                        </div>
                                                        <div className="flex flex-col gap-1 flex-shrink-0">
                                                            {!notif.isRead && (
                                                                <button
                                                                    onClick={() => handleMarkRead(notif.id)}
                                                                    title="Mark as read"
                                                                    className="p-1 rounded text-amber-500 hover:bg-amber-100 transition-colors"
                                                                >
                                                                    <BookOpen className="w-3 h-3" />
                                                                </button>
                                                            )}
                                                            <button
                                                                onClick={() => handleDeleteNotif(notif.id)}
                                                                title="Delete"
                                                                className="p-1 rounded text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                                                            >
                                                                <Trash2 className="w-3 h-3" />
                                                            </button>
                                                        </div>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>

                            <button
                                id="logout-btn"
                                onClick={handleLogout}
                                className="flex items-center ml-2 px-3 py-2 rounded-lg text-sm font-medium text-red-300 hover:text-red-200 hover:bg-red-900/20 transition-all"
                            >
                                <LogOut className="w-5 h-5 mr-2" />
                                Logout
                            </button>
                        </div>

                        {/* Mobile Menu Button */}
                        <div className="md:hidden flex items-center gap-2">
                            {/* Mobile Bell */}
                            <button
                                onClick={() => setIsNotifOpen(!isNotifOpen)}
                                className="relative p-2 text-amber-100/70"
                            >
                                <Bell className="w-5 h-5" />
                                {unreadCount > 0 && (
                                    <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                                        {unreadCount > 9 ? '9+' : unreadCount}
                                    </span>
                                )}
                            </button>
                            <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-amber-100/80 focus:outline-none">
                                {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Mobile Menu */}
                {isMobileMenuOpen && (
                    <div className="md:hidden border-t border-white/10" style={{ backgroundColor: 'var(--nav-bg)' }}>
                        <div className="px-2 pt-2 pb-3 space-y-1">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.name}
                                    to={link.path}
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className={`flex items-center px-3 py-2 rounded-md text-base font-medium transition-colors ${
                                        isActive(link.path)
                                            ? 'bg-white/10 text-amber-200'
                                            : 'text-amber-100/70 hover:text-amber-100 hover:bg-white/5'
                                    }`}
                                >
                                    {link.icon}
                                    {link.name}
                                </Link>
                            ))}
                            <button
                                onClick={() => { setIsMobileMenuOpen(false); handleLogout(); }}
                                className="flex items-center w-full px-3 py-2 rounded-md text-base font-medium text-red-300 hover:text-red-200 hover:bg-red-900/20"
                            >
                                <LogOut className="w-5 h-5 mr-2" />
                                Logout
                            </button>
                        </div>
                    </div>
                )}

                {/* Mobile notification panel */}
                {isNotifOpen && (
                    <div className="md:hidden bg-white border-t border-gray-100 max-h-64 overflow-y-auto divide-y divide-gray-50">
                        {notifications.length === 0 ? (
                            <div className="px-4 py-6 text-center text-sm text-gray-400">No notifications yet</div>
                        ) : (
                            notifications.map(notif => (
                                <div key={notif.id} className={`px-4 py-3 flex items-start gap-3 ${!notif.isRead ? 'bg-amber-50/60' : ''}`}>
                                    <div className="flex-1">
                                        <p className="text-xs font-semibold text-gray-800">{notif.title}</p>
                                        <p className="text-xs text-gray-500 mt-0.5">{notif.message}</p>
                                    </div>
                                    <div className="flex gap-1">
                                        {!notif.isRead && (
                                            <button onClick={() => handleMarkRead(notif.id)} className="p-1 text-amber-500"><BookOpen className="w-3 h-3" /></button>
                                        )}
                                        <button onClick={() => handleDeleteNotif(notif.id)} className="p-1 text-gray-400"><Trash2 className="w-3 h-3" /></button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}
            </nav>

            <main className="flex-grow pt-16">
                <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                    <Outlet />
                </div>
            </main>
        </div>
    );
}
