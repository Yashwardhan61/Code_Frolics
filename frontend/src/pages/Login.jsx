import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword, sendPasswordResetEmail, setPersistence, browserLocalPersistence } from 'firebase/auth';
import { auth } from '../config/firebase';
import { authService } from '../api/authService';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { useToast } from '../contexts/ToastContext';
import { useAuth } from '../contexts/AuthContext';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(true);
    const [loading, setLoading] = useState(false);
    const [resetLoading, setResetLoading] = useState(false);
    const navigate = useNavigate();
    const toast = useToast();
    const { currentUser } = useAuth();

    // Auto-redirect if already signed in
    useEffect(() => {
        if (currentUser) {
            navigate('/dashboard', { replace: true });
        }
    }, [currentUser, navigate]);

    // Pre-populate remembered email
    useEffect(() => {
        const savedEmail = localStorage.getItem('legacy_trunk_remember_email');
        if (savedEmail) {
            setEmail(savedEmail);
            setRememberMe(true);
        }
    }, []);

    const handleForgotPassword = async () => {
        if (!email.trim()) {
            toast.error('Please enter your email address first.');
            return;
        }
        try {
            setResetLoading(true);
            const cleanEmail = email.trim().toLowerCase();
            let sent = false;

            // 1. Try Firebase Auth client password reset first
            try {
                await sendPasswordResetEmail(auth, cleanEmail);
                sent = true;
            } catch (fbErr) {
                console.warn('Firebase client password reset error:', fbErr);
            }

            // 2. Also trigger backend reset email / token flow
            try {
                await authService.forgotPassword(cleanEmail);
                sent = true;
            } catch (backendErr) {
                console.warn('Backend custom reset email error:', backendErr);
            }

            if (sent) {
                toast.success('Password reset email sent! Check your inbox.');
            } else {
                toast.error('Could not send reset email. Please ensure the email address is valid.');
            }
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
            const cleanEmail = email.trim().toLowerCase();
            await setPersistence(auth, browserLocalPersistence);
            await signInWithEmailAndPassword(auth, cleanEmail, password);

            if (rememberMe) {
                localStorage.setItem('legacy_trunk_remember_email', cleanEmail);
            } else {
                localStorage.removeItem('legacy_trunk_remember_email');
            }

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
                                type={showPassword ? 'text' : 'password'}
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-xl focus:ring-amber-500 focus:border-amber-500 bg-white/50 transition-colors"
                                placeholder="••••••••"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 cursor-pointer focus:outline-none"
                                aria-label={showPassword ? 'Hide password' : 'Show password'}
                            >
                                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                            </button>
                        </div>
                        <div className="flex items-center justify-between mt-3">
                            <label className="flex items-center gap-2 cursor-pointer select-none text-xs text-gray-600 font-medium">
                                <input
                                    type="checkbox"
                                    checked={rememberMe}
                                    onChange={(e) => setRememberMe(e.target.checked)}
                                    className="rounded border-gray-300 text-amber-600 focus:ring-amber-500 h-4 w-4 bg-transparent cursor-pointer"
                                />
                                <span>Remember my email</span>
                            </label>
                            <button
                                type="button"
                                onClick={handleForgotPassword}
                                disabled={resetLoading}
                                className="text-xs text-amber-700 hover:text-amber-800 font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                            >
                                {resetLoading ? 'Sending...' : 'Forgot Password?'}
                            </button>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-md text-base font-medium text-white bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 transition-all transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
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
