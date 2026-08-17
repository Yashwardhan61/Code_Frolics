import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Compass, ArrowLeft, Home, BookOpen } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function NotFound() {
    const navigate = useNavigate();
    const { currentUser } = useAuth();

    return (
        <div className="min-h-screen bg-[#faf8f5] text-[#2c221e] flex flex-col items-center justify-center p-6 select-none relative overflow-hidden">
            {/* Vintage decorative atmospheric elements */}
            <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-amber-200/30 blur-3xl pointer-events-none" />
            <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-orange-200/20 blur-3xl pointer-events-none" />

            <div className="relative z-10 max-w-lg w-full text-center bg-white/80 backdrop-blur-sm border border-amber-900/10 shadow-xl shadow-amber-900/5 rounded-3xl p-8 md:p-12">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-amber-100/60 border border-amber-300/40 text-amber-800 mb-6 shadow-inner">
                    <Compass className="w-10 h-10 animate-[spin_12s_linear_infinite]" />
                </div>

                <span className="text-xs font-semibold tracking-widest uppercase text-amber-800 bg-amber-50 px-3 py-1 rounded-full border border-amber-200/60">
                    Page Not Found
                </span>

                <h1 className="text-6xl md:text-7xl font-serif font-bold text-[#3d271d] mt-4 mb-2 tracking-tight">
                    404
                </h1>

                <h2 className="text-xl md:text-2xl font-serif font-medium text-[#4a3528] mb-4">
                    This Memory is Lost to Time
                </h2>

                <p className="text-sm md:text-base text-[#6e5849] leading-relaxed mb-8">
                    The chapter you are looking for has either been moved, erased, or never penned in the chronicles.
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                    <button
                        onClick={() => navigate(-1)}
                        className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl border border-[#d6c4b2] text-[#4a3528] hover:bg-[#f3ede4] transition-all duration-200 font-medium text-sm cursor-pointer"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Go Back
                    </button>

                    <button
                        onClick={() => navigate(currentUser ? '/dashboard' : '/')}
                        className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-amber-800 hover:bg-amber-900 text-white transition-all duration-200 font-medium text-sm shadow-md shadow-amber-900/10 cursor-pointer"
                    >
                        {currentUser ? (
                            <>
                                <BookOpen className="w-4 h-4" />
                                Return to Trunk
                            </>
                        ) : (
                            <>
                                <Home className="w-4 h-4" />
                                Return Home
                            </>
                        )}
                    </button>
                </div>
            </div>

            <p className="mt-8 text-xs text-[#8c7463] font-serif">
                The Legacy Trunk &middot; Yaado Ka Baksa
            </p>
        </div>
    );
}
