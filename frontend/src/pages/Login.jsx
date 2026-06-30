import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../config/firebase';
import { authService } from '../api/authService';
import { Mail, Lock } from 'lucide-react';
import { useToast } from '../contexts/ToastContext';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [resetLoading, setResetLoading] = useState(false);
    const navigate = useNavigate();
    const toast = useToast();

    const handleForgotPassword = async () => {
        if (!email.trim()) {
            toast.error('Please enter your email address first.');
            return;
        }
        try {
            setResetLoading(true);
            await authService.forgotPassword(email.trim().toLowerCase());
            toast.success('Password reset email sent! Check your inbox.');
        } catch (err) {
            const msg = err.response?.data?.error || 'Failed to send reset email. Please try again.';
            toast.error(msg);
            console.error(err);
        } finally {
            setResetLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            await signInWithEmailAndPassword(auth, email, password);
            toast.success('Welcome back! Opening your treasure chest...');
            navigate('/dashboard');
        } catch (err) {
            const msg = err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password'
                ? 'Incorrect email or password. Please try again.'
                : err.code === 'auth/user-not-found'
                ? 'No account found with this email.'
                : err.code === 'auth/too-many-requests'
                ? 'Too many attempts. Please wait a moment and try again.'
                : 'Failed to sign in. Please check your credentials.';
            toast.error(msg);
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] p-4 relative z-10 w-full">
            <div className="w-full max-w-md bg-white/90 backdrop-blur-md p-8 rounded-2xl shadow-xl border border-amber-100">
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold text-gray-800 font-serif" style={{ color: 'var(--brand-brown-600)' }}>Welcome Back</h2>
                    <p className="text-gray-600 mt-2">Open your treasure chest of memories</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Mail className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl focus:ring-amber-500 focus:border-amber-500 bg-white/50 transition-colors"
                                placeholder="you@example.com"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Lock className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl focus:ring-amber-500 focus:border-amber-500 bg-white/50 transition-colors"
                                placeholder="••••••••"
                            />
                        </div>
                        <div className="flex justify-end mt-1.5">
                            <button
                                type="button"
                                onClick={handleForgotPassword}
                                disabled={resetLoading}
                                className="text-sm text-amber-600 hover:text-amber-500 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {resetLoading ? 'Sending...' : 'Forgot Password?'}
                            </button>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-md text-base font-medium text-white bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 transition-all transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Opening...' : 'Open Treasure Chest'}
                    </button>
                </form>

                <div className="mt-8 text-center">
                    <p className="text-sm text-gray-600">
                        New to the family?{' '}
                        <Link to="/register" className="font-medium text-amber-600 hover:text-amber-500 transition-colors">
                            Create an account
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
