import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Music, Film, Lock, Image as ImageIcon } from 'lucide-react';

function isAudioMedia(media) {
    return media.mediaType?.startsWith('audio/') ||
        media.mediaUrl?.endsWith('.webm') ||
        media.mediaUrl?.endsWith('.wav') ||
        media.mediaUrl?.endsWith('.mp3');
}

function isVideoMedia(media) {
    return media.mediaType?.startsWith('video/');
}

function useCountdown(targetDateStr) {
    const calculateTimeLeft = () => {
        if (!targetDateStr) return { expired: true };
        const difference = +new Date(targetDateStr) - +new Date();
        let timeLeft = {};

        if (difference > 0) {
            timeLeft = {
                days: Math.floor(difference / (1000 * 60 * 60 * 24)),
                hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
                minutes: Math.floor((difference / 1000 / 60) % 60),
                seconds: Math.floor((difference / 1000) % 60),
                expired: false
            };
        } else {
            timeLeft = { expired: true };
        }
        return timeLeft;
    };

    const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft(calculateTimeLeft());
        }, 1000);

        return () => clearInterval(timer);
    }, [targetDateStr]);

    return timeLeft;
}

export function CapsuleCountdown({ targetDateStr, onUnlock }) {
    const countdown = useCountdown(targetDateStr);

    useEffect(() => {
        if (countdown.expired && onUnlock) {
            onUnlock();
        }
    }, [countdown.expired, onUnlock]);

    if (countdown.expired) {
        return <span className="text-emerald-700 font-bold animate-pulse text-xs">Unlocking now...</span>;
    }

    const parts = [];
    if (countdown.days > 0) parts.push(`${countdown.days}d`);
    parts.push(`${String(countdown.hours || 0).padStart(2, '0')}h`);
    parts.push(`${String(countdown.minutes || 0).padStart(2, '0')}m`);
    parts.push(`${String(countdown.seconds || 0).padStart(2, '0')}s`);

    return (
        <span className="font-mono text-xs font-bold text-amber-800 bg-[#faf5e6] px-2 py-0.5 rounded border border-amber-900/10 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping" />
            {parts.join(' ')}
        </span>
    );
}

export default function MediaCarousel({ mediaFiles, alt, className = '', isLocked = false, unlockDateTime, onUnlock }) {
    const [current, setCurrent] = useState(0);
    const timerRef = useRef(null);
    const total = mediaFiles?.length || 0;

    const resetTimer = useCallback(() => {
        if (timerRef.current) clearInterval(timerRef.current);
        if (total > 1) {
            timerRef.current = setInterval(() => {
                setCurrent(prev => (prev + 1) % total);
            }, 4000);
        }
    }, [total]);

    useEffect(() => {
        resetTimer();
        return () => { if (timerRef.current) clearInterval(timerRef.current); };
    }, [resetTimer]);

    const go = (dir) => {
        setCurrent(prev => (prev + dir + total) % total);
        resetTimer();
    };

    if (isLocked) {
        return (
            <div className={`w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-amber-900/10 to-amber-955/5 p-4 text-center select-none ${className}`}>
                <div className="w-10 h-10 rounded-full bg-amber-800/10 flex items-center justify-center mb-2">
                    <Lock className="w-5 h-5 text-amber-800" />
                </div>
                <span className="text-xs font-bold text-amber-950 uppercase tracking-widest mb-2">Time Capsule Locked</span>
                <CapsuleCountdown targetDateStr={unlockDateTime} onUnlock={onUnlock} />
            </div>
        );
    }

    if (!mediaFiles || total === 0) {
        return (
            <div className={`w-full h-full flex items-center justify-center bg-amber-50 ${className}`}>
                <ImageIcon className="w-12 h-12 text-amber-200" />
            </div>
        );
    }

    return (
        <div className={`relative w-full h-full overflow-hidden ${className}`}
             onMouseEnter={() => { if (timerRef.current) clearInterval(timerRef.current); }}
             onMouseLeave={resetTimer}
        >
            {mediaFiles.map((media, i) => {
                const isActive = i === current;
                const visibilityClass = `transition-opacity duration-700 ease-in-out ${isActive ? 'opacity-100 z-10' : 'opacity-0 z-0'}`;

                if (isAudioMedia(media)) {
                    return (
                        <div
                            key={media.id || i}
                            className={`absolute inset-0 w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-amber-50 via-amber-100 to-orange-50 ${visibilityClass}`}
                        >
                            <div className="w-16 h-16 rounded-full bg-amber-700/90 flex items-center justify-center shadow-lg mb-3">
                                <Music className="w-8 h-8 text-white" />
                            </div>
                            <span className="text-sm font-serif font-semibold text-amber-900">Voice Memory</span>
                            <span className="text-xs text-amber-700/70 mt-1">Audio Recording</span>
                        </div>
                    );
                }

                if (isVideoMedia(media)) {
                    return (
                        <div
                            key={media.id || i}
                            className={`absolute inset-0 w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-slate-800 via-slate-900 to-gray-900 ${visibilityClass}`}
                        >
                            <div className="w-16 h-16 rounded-full bg-white/10 backdrop-blur flex items-center justify-center shadow-lg mb-3 border border-white/20">
                                <Film className="w-8 h-8 text-white" />
                            </div>
                            <span className="text-sm font-serif font-semibold text-white">Video Memory</span>
                            <span className="text-xs text-white/50 mt-1">Video Recording</span>
                        </div>
                    );
                }

                return (
                    <img
                        key={media.id || i}
                        src={media.mediaUrl}
                        alt={`${alt} ${i + 1}`}
                        className={`absolute inset-0 w-full h-full object-cover ${visibilityClass}`}
                    />
                );
            })}

            {total > 1 && (
                <>
                    <button
                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); go(-1); }}
                        className="absolute left-2 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center transition-all opacity-0 group-hover:opacity-100"
                        aria-label="Previous image"
                    >
                        <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); go(1); }}
                        className="absolute right-2 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center transition-all opacity-0 group-hover:opacity-100"
                        aria-label="Next image"
                    >
                        <ChevronRight className="w-5 h-5" />
                    </button>
                    <div className="absolute bottom-2 left-1/2 -translate-x-1/2 z-20 flex space-x-1.5">
                        {mediaFiles.map((_, i) => (
                            <button
                                key={i}
                                onClick={(e) => { e.preventDefault(); e.stopPropagation(); setCurrent(i); resetTimer(); }}
                                className={`w-2 h-2 rounded-full transition-all ${
                                    i === current ? 'bg-white scale-125' : 'bg-white/50 hover:bg-white/80'
                                }`}
                                aria-label={`Go to image ${i + 1}`}
                            />
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}
