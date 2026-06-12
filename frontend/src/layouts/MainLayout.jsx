import React, { useState } from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { LogOut, Home, User, Users, BookOpen, Menu, X, TreeDeciduous } from 'lucide-react';

export default function MainLayout() {
    const { logout, currentUser } = useAuth();
    const navigate = useNavigate();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const handleLogout = async () => {
        try {
            await logout();
            navigate('/login');
        } catch (error) {
            console.error("Failed to log out", error);
        }
    };

    const navLinks = [
        { name: 'Dashboard', path: '/dashboard', icon: <Home className="w-5 h-5 mr-2" /> },
        { name: 'Family Tree', path: '/family-tree', icon: <TreeDeciduous className="w-5 h-5 mr-2" /> },
        { name: 'Friends', path: '/friends', icon: <Users className="w-5 h-5 mr-2" /> },
        { name: 'Profile', path: '/profile', icon: <User className="w-5 h-5 mr-2" /> },
    ];

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <nav className="fixed top-0 left-0 right-0 z-50 bg-white shadow-md">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="flex justify-between items-center h-16">
                        <Link to="/dashboard" className="flex-shrink-0 flex items-center">
                            <div className="w-10 h-10 rounded-lg overflow-hidden">
                                <img src="/logo.jpeg" alt="Yaado ka baksa" className="w-full h-full object-cover" />
                            </div>
                            <span className="ml-2 text-xl font-semibold brand-title" style={{ color: 'var(--brand-brown-600)' }}>Yaado ka baksa</span>
                        </Link>

                        {/* Desktop Menu */}
                        <div className="hidden md:flex items-center space-x-6">
                            {navLinks.map((link) => (
                                <Link key={link.name} to={link.path} className="flex items-center text-gray-700 hover:text-[color:var(--brand-brown-600)] transition-colors">
                                    {link.icon}
                                    {link.name}
                                </Link>
                            ))}
                            <button onClick={handleLogout} className="flex items-center text-red-600 hover:text-red-700 transition-colors ml-4">
                                <LogOut className="w-5 h-5 mr-2" />
                                Logout
                            </button>
                        </div>

                        {/* Mobile Menu Button */}
                        <div className="md:hidden flex items-center">
                            <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-gray-700 hover:text-gray-900 focus:outline-none">
                                {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Mobile Menu */}
                {isMobileMenuOpen && (
                    <div className="md:hidden bg-white border-t border-gray-200">
                        <div className="px-2 pt-2 pb-3 space-y-1">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.name}
                                    to={link.path}
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="flex items-center px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-[color:var(--brand-brown-600)] hover:bg-gray-50"
                                >
                                    {link.icon}
                                    {link.name}
                                </Link>
                            ))}
                            <button
                                onClick={() => {
                                    setIsMobileMenuOpen(false);
                                    handleLogout();
                                }}
                                className="flex items-center w-full px-3 py-2 rounded-md text-base font-medium text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                                <LogOut className="w-5 h-5 mr-2" />
                                Logout
                            </button>
                        </div>
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
