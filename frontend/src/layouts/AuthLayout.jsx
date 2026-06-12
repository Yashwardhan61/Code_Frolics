import React from 'react';
import { Outlet, Link } from 'react-router-dom';

export default function AuthLayout() {
    return (
        <div className="min-h-screen bg-brown-gradient flex flex-col relative" style={{ backgroundImage: "url('/background.jpg')", backgroundSize: 'cover', backgroundPosition: 'center' }}>
            <div className="absolute inset-0 bg-brown-gradient opacity-70"></div>
            
            <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-sm shadow-md">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="flex justify-between items-center h-16">
                        <Link to="/" className="flex-shrink-0 flex items-center">
                            <div className="w-10 h-10 rounded-lg overflow-hidden">
                                <img src="/logo.jpeg" alt="Yaado ka baksa" className="w-full h-full object-cover" />
                            </div>
                            <span className="ml-2 text-lg font-semibold brand-title" style={{ color: 'var(--brand-beige)' }}>Yaado ka baksa</span>
                        </Link>

                        <div className="hidden md:flex items-center space-x-8">
                            <Link to="/" className="nav-link transition-colors">Home</Link>
                            <Link to="/login" className="nav-link transition-colors">Login</Link>
                            <Link to="/register" className="nav-link transition-colors">Register</Link>
                        </div>
                    </div>
                </div>
            </nav>

            <div className="flex-grow flex flex-col relative z-10 pt-16">
                <Outlet />
            </div>
        </div>
    );
}
