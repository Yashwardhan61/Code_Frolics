import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { authService } from '../api/authService';
import { KeyRound, CheckCircle, AlertCircle, Loader2, Eye, EyeOff, Check, X } from 'lucide-react';
import { useToast } from '../contexts/ToastContext';

export default function ResetPassword() {
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');
    const toast = useToast();

    const [status, setStatus] = useState('validating'); // validating | input | submitting | success | error
    const [errorMsg, setErrorMsg] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    useEffect(() => {
        if (!token) {
            setStatus('error');
            setErrorMsg('Invalid reset link. No token provided.');
            return;
        }

        const processToken = async () => {
            try {
                // Validate token and check if valid
                await authService.validateResetToken(token);
                setStatus('input');
            } catch (err) {
                setStatus('error');
                const msg = err.response?.data?.error || err.message || 'Something went wrong. Please try again.';
                setErrorMsg(msg);
            }
        };

        processToken();
    }, [token]);

    const passwordsMatch = confirmPassword.length > 0 && password === confirmPassword;

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (password.length < 6) {
            toast.error('Password must be at least 6 characters.');
            return;
        }

        if (password !== confirmPassword) {
            toast.error('Passwords do not match.');
            return;
        }

        try {
            setStatus('submitting');
            await authService.resetPassword(token, password);
            toast.success('Your password has been reset successfully!');
            setStatus('success');
        } catch (err) {
            setStatus('input');
            const msg = err.response?.data?.error || err.message || 'Failed to reset password. Please try again.';
            toast.error(msg);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] p-4 relative z-10 w-full">
            <div className="w-full max-w-md bg-white/90 backdrop-blur-md p-8 rounded-2xl shadow-xl border border-amber-100">

                {status === 'validating' && (
                    <div className="text-center">
                        <Loader2 className="h-12 w-12 text-amber-600 animate-spin mx-auto mb-4" />
                        <h2 className="text-2xl font-bold text-gray-800 font-serif" style={{ color: 'var(--brand-brown-600)' }}>
                            Validating Reset Link...
                        </h2>
                        <p className="text-gray-600 mt-2">Please wait while we verify your request.</p>
                    </div>
                )}

                {(status === 'input' || status === 'submitting') && (
                    <div>
                        <div className="text-center mb-8">
                            <h2 className="text-3xl font-bold text-gray-800 font-serif" style={{ color: 'var(--brand-brown-600)' }}>Reset Password</h2>
                            <p className="text-gray-600 mt-2">Create a secure new password for your account</p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <KeyRound className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        required
                                        disabled={status === 'submitting'}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-xl focus:ring-amber-500 focus:border-amber-500 bg-white/50 transition-colors disabled:opacity-50"
                                        placeholder="••••••••"
                                        minLength="6"
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
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Confirm New Password</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <KeyRound className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        type={showConfirmPassword ? 'text' : 'password'}
                                        required
                                        disabled={status === 'submitting'}
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        className="block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-xl focus:ring-amber-500 focus:border-amber-500 bg-white/50 transition-colors disabled:opacity-50"
                                        placeholder="••••••••"
                                        minLength="6"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 cursor-pointer focus:outline-none"
                                        aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                                    >
                                        {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                    </button>
                                </div>
                                {confirmPassword.length > 0 && (
                                    <div className={`mt-1.5 text-xs flex items-center gap-1.5 pl-1 ${passwordsMatch ? 'text-green-600 font-medium' : 'text-amber-600'}`}>
                                        {passwordsMatch ? (
                                            <>
                                                <Check className="w-3.5 h-3.5 text-green-600" />
                                                Passwords match
                                            </>
                                        ) : (
                                            <>
                                                <X className="w-3.5 h-3.5 text-amber-600" />
                                                Passwords do not match
                                            </>
                                        )}
                                    </div>
                                )}
                            </div>

                            <button
                                type="submit"
                                disabled={status === 'submitting'}
                                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-md text-base font-medium text-white bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 transition-all transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                            >
                                {status === 'submitting' ? 'Resetting Password...' : 'Reset Password'}
                            </button>
                        </form>
                    </div>
                )}

                {status === 'success' && (
                    <div className="text-center">
                        <CheckCircle className="h-14 w-14 text-green-500 mx-auto mb-4" />
                        <h2 className="text-2xl font-bold text-gray-800 font-serif" style={{ color: 'var(--brand-brown-600)' }}>
                            Password Reset Complete!
                        </h2>
                        <p className="text-gray-600 mt-3 leading-relaxed">
                            Your password has been successfully updated. You can now use your new password to log in.
                        </p>
                        <Link
                            to="/login"
                            className="inline-block mt-6 px-6 py-3 bg-gradient-to-r from-amber-600 to-amber-700 text-white rounded-xl font-medium shadow-md hover:from-amber-700 hover:to-amber-800 transition-all transform hover:-translate-y-0.5"
                        >
                            Log In
                        </Link>
                    </div>
                )}

                {status === 'error' && (
                    <div className="text-center">
                        <AlertCircle className="h-14 w-14 text-red-400 mx-auto mb-4" />
                        <h2 className="text-2xl font-bold text-gray-800 font-serif" style={{ color: 'var(--brand-brown-600)' }}>
                            Reset Failed
                        </h2>
                        <p className="text-gray-600 mt-3 leading-relaxed">
                            {errorMsg}
                        </p>
                        <Link
                            to="/login"
                            className="inline-block mt-6 px-6 py-3 bg-gradient-to-r from-amber-600 to-amber-700 text-white rounded-xl font-medium shadow-md hover:from-amber-700 hover:to-amber-800 transition-all transform hover:-translate-y-0.5"
                        >
                            Back to Login
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}
