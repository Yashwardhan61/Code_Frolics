import React from 'react';
import { Link } from 'react-router-dom';
import { User, UserPlus, ArrowLeft } from 'lucide-react';

export default function Welcome() {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-6 relative"
            style={{ background: 'linear-gradient(135deg, var(--brand-brown-800), var(--brand-brown-600))' }}>
            
            {/* Logo */}
            <div className="mb-8 flex items-center">
                <div className="w-14 h-14 rounded-lg overflow-hidden shadow-lg bg-white/10 flex items-center justify-center">
                    <span className="text-2xl font-bold text-amber-200" style={{ fontFamily: "'Dancing Script', cursive" }}>Y</span>
                </div>
                <h1 className="ml-4 text-4xl text-white" style={{ fontFamily: "'Dancing Script', cursive" }}>
                    Yaado ka baksa
                </h1>
            </div>

            <div className="text-center mb-12">
                <h2 className="text-3xl font-semibold text-white mb-4">Welcome to Your Memory Box</h2>
                <p className="text-gray-200 text-lg">Please tell us about yourself</p>
            </div>

            <div className="flex flex-col md:flex-row gap-8 w-full max-w-4xl mx-auto px-4">
                {/* Existing User */}
                <Link to="/login" className="w-full md:w-1/2 group">
                    <div className="rounded-xl p-8 text-center h-full border-3 border-amber-900/50 transition-all duration-300 group-hover:-translate-y-1.5 group-hover:shadow-2xl"
                        style={{ background: 'linear-gradient(45deg, var(--brand-brown-400), var(--brand-brown-600))', borderWidth: '3px', borderColor: 'var(--brand-brown-800)' }}>
                        <div className="text-white mb-6">
                            <User className="w-16 h-16 mx-auto mb-4 opacity-90" />
                            <h3 className="text-2xl font-bold mb-2">Existing User</h3>
                            <p className="text-gray-200">Welcome back! Access your memories.</p>
                        </div>
                        <span className="inline-block bg-white text-amber-900 px-6 py-2 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
                            Sign In
                        </span>
                    </div>
                </Link>

                {/* New User */}
                <Link to="/register" className="w-full md:w-1/2 group">
                    <div className="rounded-xl p-8 text-center h-full transition-all duration-300 group-hover:-translate-y-1.5 group-hover:shadow-2xl"
                        style={{ background: 'linear-gradient(45deg, var(--brand-brown-400), var(--brand-brown-600))', borderWidth: '3px', borderColor: 'var(--brand-brown-800)' }}>
                        <div className="text-white mb-6">
                            <UserPlus className="w-16 h-16 mx-auto mb-4 opacity-90" />
                            <h3 className="text-2xl font-bold mb-2">New User</h3>
                            <p className="text-gray-200">Start your memory collection journey.</p>
                        </div>
                        <span className="inline-block bg-white text-amber-900 px-6 py-2 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
                            Register
                        </span>
                    </div>
                </Link>
            </div>

            {/* Back Link */}
            <Link to="/" className="mt-12 text-white/70 hover:text-white transition-colors flex items-center gap-2">
                <ArrowLeft className="w-4 h-4" />
                Back to welcome
            </Link>
        </div>
    );
}
