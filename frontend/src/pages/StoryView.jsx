import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { storyService } from '../api/storyService';
import { useToast } from '../contexts/ToastContext';
import { ArrowLeft, MapPin, Calendar, Trash2, Pencil, Music, Film, Lock, Sparkles } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import AudioWaveformPlayer from '../components/AudioWaveformPlayer';

export function CelebrationOverlay({ onClose }) {
    const [confetti, setConfetti] = useState([]);

    useEffect(() => {
        const colors = ['#f59e0b', '#ef4444', '#3b82f6', '#10b981', '#ec4899', '#8b5cf6', '#06b6d4', '#f43f5e', '#10b981'];
        const shapes = ['circle', 'square', 'triangle', 'star'];
        const pieces = Array.from({ length: 140 }).map((_, i) => ({
            id: i,
            x: Math.random() * 100,
            y: -10 - Math.random() * 20,
            size: Math.random() * 10 + 6,
            color: colors[Math.floor(Math.random() * colors.length)],
            shape: shapes[Math.floor(Math.random() * shapes.length)],
            delay: Math.random() * 4,
            duration: Math.random() * 3 + 2.5,
            rotation: Math.random() * 360
        }));
        setConfetti(pieces);

        const timer = setTimeout(() => {
            onClose();
        }, 7500);
        return () => clearTimeout(timer);
    }, [onClose]);

    return (
        <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black/85 overflow-hidden backdrop-blur-md">
            {/* Confetti pieces */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                {confetti.map((c) => (
                    <div
                        key={c.id}
                        className="absolute animate-fall"
                        style={{
                            left: `${c.x}%`,
                            top: `${c.y}%`,
                            width: `${c.size}px`,
                            height: c.shape === 'triangle' ? '0' : `${c.size}px`,
                            backgroundColor: c.shape === 'triangle' ? 'transparent' : c.color,
                            borderLeft: c.shape === 'triangle' ? `${c.size/2}px solid transparent` : '',
                            borderRight: c.shape === 'triangle' ? `${c.size/2}px solid transparent` : '',
                            borderBottom: c.shape === 'triangle' ? `${c.size}px solid ${c.color}` : '',
                            borderRadius: c.shape === 'circle' ? '50%' : '0%',
                            opacity: 0.85,
                            transform: `rotate(${c.rotation}deg)`,
                            animationDelay: `${c.delay}s`,
                            animationDuration: `${c.duration}s`,
                            animationIterationCount: 'infinite',
                            animationTimingFunction: 'linear'
                        }}
                    />
                ))}
            </div>

            {/* Glowing Celebration Box */}
            <div className="relative z-10 text-center max-w-sm px-8 py-12 bg-white/10 border border-white/20 rounded-3xl backdrop-blur-xl shadow-2xl scale-up-bounce flex flex-col items-center gap-6 mx-4">
                <div className="w-20 h-20 bg-gradient-to-tr from-amber-500 via-orange-500 to-yellow-400 rounded-full flex items-center justify-center text-4xl shadow-lg shadow-orange-500/40 animate-bounce relative">
                    <Sparkles className="absolute -top-1 -right-1 w-6 h-6 text-yellow-200 animate-pulse" />
                    🎉
                </div>
                <div>
                    <h2 className="text-3xl font-extrabold text-white font-serif tracking-wide bg-gradient-to-r from-amber-200 via-yellow-100 to-amber-200 bg-clip-text text-transparent drop-shadow-md">
                        Memory Unlocked!
                    </h2>
                    <p className="text-amber-100/90 text-sm mt-3 font-medium px-2 leading-relaxed">
                        The wait is over! Your locked time capsule memory has just unlocked. Prepare to relive this moment!
                    </p>
                </div>

                <button
                    onClick={onClose}
                    className="mt-4 px-8 py-3.5 bg-gradient-to-r from-amber-500 via-orange-500 to-yellow-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold rounded-xl shadow-xl shadow-orange-500/20 hover:shadow-orange-500/40 transition-all duration-300 transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer text-sm tracking-wide uppercase"
                >
                    Reveal Memory ✨
                </button>
            </div>

            <style dangerouslySetInnerHTML={{__html: `
                @keyframes fall {
                    0% {
                        transform: translateY(0) rotate(0deg);
                        opacity: 0;
                    }
                    10% {
                        opacity: 1;
                    }
                    90% {
                        opacity: 1;
                    }
                    100% {
                        transform: translateY(115vh) rotate(720deg);
                        opacity: 0;
                    }
                }
                .animate-fall {
                    animation-name: fall;
                }
                @keyframes scaleUp {
                    0% { transform: scale(0.92); opacity: 0; }
                    100% { transform: scale(1); opacity: 1; }
                }
                .scale-up-bounce {
                    animation: scaleUp 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
                }
            `}} />
        </div>
    );
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
            const current = calculateTimeLeft();
            setTimeLeft(current);
        }, 1000);

        return () => clearInterval(timer);
    }, [targetDateStr]);

    return timeLeft;
}

export default function StoryView() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { currentUser, userRole } = useAuth();
    const toast = useToast();
    const [story, setStory] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeMedia, setActiveMedia] = useState(0);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showCelebration, setShowCelebration] = useState(false);
    const [animationFinished, setAnimationFinished] = useState(false);
    const fetchStory = async () => {
        try {
            const data = await storyService.getStoryById(id);
            setStory(data);
            
            // Auto celebrate if unlocked and first time viewing in this browser
            if (!data.isLocked && !localStorage.getItem(`revealed_${id}`)) {
                setShowCelebration(true);
                localStorage.setItem(`revealed_${id}`, 'true');
            }
        } catch (error) {
            console.error('Failed to fetch story', error);
            toast.error('Could not load this story. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStory();
    }, [id]);

    const countdown = useCountdown(story?.unlockDateTime);
    const [notifiedTwoMinutes, setNotifiedTwoMinutes] = useState(false);

    useEffect(() => {
        if (story?.isLocked && countdown.expired) {
            fetchStory();
        }
    }, [countdown.expired, story?.isLocked]);

    useEffect(() => {
        if (story?.isLocked && !notifiedTwoMinutes && story?.unlockDateTime) {
            const difference = +new Date(story.unlockDateTime) - +new Date();
            if (difference > 0 && difference <= 120000) {
                toast.info(`⏰ Get ready! "${story.title}" will unlock in less than 2 minutes!`);
                setNotifiedTwoMinutes(true);
            }
        }
    }, [countdown, story?.isLocked, story?.unlockDateTime, notifiedTwoMinutes, toast, story?.title]);

    const confirmDelete = async () => {
        try {
            await storyService.deleteStory(id);
            toast.success('Memory deleted.');
            setShowDeleteModal(false);
            navigate('/dashboard');
        } catch (error) {
            console.error('Failed to delete story', error);
            toast.error('Failed to delete this memory. Please try again.');
            setShowDeleteModal(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-700"></div>
            </div>
        );
    }

    if (!story) {
        return (
            <div className="max-w-4xl mx-auto py-12 text-center">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Story not found</h2>
                <Link to="/dashboard" className="text-amber-600 hover:text-amber-700 flex items-center justify-center">
                    <ArrowLeft className="w-5 h-5 mr-2" />
                    Back to Dashboard
                </Link>
            </div>
        );
    }

    const isAuthor = currentUser?.email === story.authorEmail;
    const canEdit = (isAuthor || userRole === 'ADMIN') && userRole !== 'VIEWER';

    if (story.isLocked) {
        return (
            <div className="max-w-5xl mx-auto py-8 px-4">
                <div className="mb-6 flex items-center justify-between">
                    <Link to="/dashboard" className="flex items-center text-gray-500 hover:text-amber-700 transition-colors font-medium">
                        <ArrowLeft className="w-5 h-5 mr-2" />
                        Back
                    </Link>
                    
                    {isAuthor && (
                        <div className="flex space-x-3">
                            <button 
                                disabled
                                className="flex items-center text-gray-400 bg-gray-100 px-4 py-2 rounded-lg cursor-not-allowed font-medium opacity-60"
                                title="Editing is disabled while the time capsule is locked"
                            >
                                <Pencil className="w-4 h-4 mr-2" />
                                Edit
                            </button>
                            <button 
                                onClick={() => setShowDeleteModal(true)}
                                className="flex items-center text-red-600 bg-red-50 px-4 py-2 rounded-lg hover:bg-red-100 transition-colors font-medium cursor-pointer"
                            >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete
                            </button>
                        </div>
                    )}
                </div>

                <div className="bg-[#fcfaf2] rounded-2xl shadow-lg border border-amber-900/10 overflow-hidden p-8 md:p-12 text-center min-h-[500px] flex flex-col justify-center items-center relative vintage-journal-page select-none">
                    {/* Retro styling dots/borders */}
                    <div className="absolute top-4 right-4 text-xs font-bold text-amber-850 uppercase tracking-widest">
                        Time Capsule
                    </div>
                    
                    {/* Glowing Lock Box Container */}
                    <div className="w-24 h-24 rounded-3xl bg-amber-900/5 border border-amber-900/20 flex items-center justify-center mb-8 relative shadow-inner">
                        <div className="absolute inset-0 rounded-3xl bg-amber-600/5 animate-pulse" />
                        <Lock className="w-10 h-10 text-amber-800 animate-bounce" style={{ animationDuration: '3s' }} />
                    </div>

                    <h1 className="text-3xl md:text-4xl font-extrabold text-amber-955 font-serif mb-6 leading-tight">
                        🔒 Sealed Time Capsule
                    </h1>

                    {/* Countdown Display Card */}
                    <div className="bg-white border border-amber-900/10 rounded-2xl px-6 py-6 md:px-10 max-w-lg w-full shadow-md mb-8">
                        <p className="text-xs font-bold uppercase tracking-wider text-amber-800/60 mb-4">
                            Time Remaining Until Reveal
                        </p>
                        
                        <div className="grid grid-cols-4 gap-2 md:gap-4">
                            <div className="bg-[#faf5e6] rounded-xl p-2 md:p-3 text-center border border-amber-900/5">
                                <div className="text-2xl md:text-3xl font-extrabold text-amber-950 font-mono">
                                    {String(countdown.days || 0).padStart(2, '0')}
                                </div>
                                <div className="text-[10px] uppercase font-bold text-amber-850 mt-1">Days</div>
                            </div>
                            <div className="bg-[#faf5e6] rounded-xl p-2 md:p-3 text-center border border-amber-900/5">
                                <div className="text-2xl md:text-3xl font-extrabold text-amber-950 font-mono">
                                    {String(countdown.hours || 0).padStart(2, '0')}
                                </div>
                                <div className="text-[10px] uppercase font-bold text-amber-850 mt-1">Hours</div>
                            </div>
                            <div className="bg-[#faf5e6] rounded-xl p-2 md:p-3 text-center border border-amber-900/5">
                                <div className="text-2xl md:text-3xl font-extrabold text-amber-950 font-mono">
                                    {String(countdown.minutes || 0).padStart(2, '0')}
                                </div>
                                <div className="text-[10px] uppercase font-bold text-amber-850 mt-1">Mins</div>
                            </div>
                            <div className="bg-[#faf5e6] rounded-xl p-2 md:p-3 text-center border border-amber-900/5">
                                <div className="text-2xl md:text-3xl font-extrabold text-amber-950 font-mono text-amber-800 animate-pulse">
                                    {String(countdown.seconds || 0).padStart(2, '0')}
                                </div>
                                <div className="text-[10px] uppercase font-bold text-amber-850 mt-1">Secs</div>
                            </div>
                        </div>
                    </div>

                    <p className="text-sm text-amber-900/80 max-w-md leading-relaxed font-serif">
                        This story is sealed in a Time Capsule. The contents and media files will automatically unlock and reveal themselves once the timer reaches zero.
                    </p>
                </div>

                {/* Custom Delete Confirmation Modal */}
                {showDeleteModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 transform transition-all">
                            <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-red-100 rounded-full">
                                <Trash2 className="w-6 h-6 text-red-600" />
                            </div>
                            <h3 className="text-xl font-bold text-center text-gray-900 mb-2 font-serif">
                                Delete this memory?
                            </h3>
                            <p className="text-center text-gray-500 mb-6">
                                Are you sure you want to permanently delete this story? This action cannot be undone.
                            </p>
                            <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
                                <button
                                    onClick={() => setShowDeleteModal(false)}
                                    className="w-full px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={confirmDelete}
                                    className="w-full px-4 py-2 text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors font-medium"
                                >
                                    Yes, Delete
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto py-8">
            {showCelebration && (
                <CelebrationOverlay 
                    onClose={() => {
                        setShowCelebration(false);
                        setAnimationFinished(true);
                    }} 
                />
            )}
            
            <div className={`transition-all duration-1000 ${(!animationFinished && showCelebration) ? 'opacity-0 scale-95 blur-md pointer-events-none' : 'opacity-100 scale-100 blur-0'}`}>
                <div className="mb-6 flex items-center justify-between">
                    <Link to="/dashboard" className="flex items-center text-gray-500 hover:text-amber-700 transition-colors font-medium">
                        <ArrowLeft className="w-5 h-5 mr-2" />
                        Back
                    </Link>
                    
                    <div className="flex space-x-3">
                        {canEdit && (
                            <>
                                <button 
                                    onClick={() => navigate(`/story/${id}/edit`)}
                                    className="flex items-center text-amber-700 bg-amber-50 px-4 py-2 rounded-lg hover:bg-amber-100 transition-colors font-medium cursor-pointer"
                                >
                                    <Pencil className="w-4 h-4 mr-2" />
                                    Edit
                                </button>
                                <button 
                                    onClick={() => setShowDeleteModal(true)}
                                    className="flex items-center text-red-600 bg-red-50 px-4 py-2 rounded-lg hover:bg-red-100 transition-colors font-medium cursor-pointer"
                                >
                                    <Trash2 className="w-4 h-4 mr-2" />
                                    Delete
                                </button>
                            </>
                        )}
                    </div>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                {/* Media Gallery Header */}
                {story.mediaFiles && story.mediaFiles.length > 0 && (
                    <div className="relative bg-black h-96 md:h-[500px] flex items-center justify-center">
                        {(() => {
                            const currentMedia = story.mediaFiles[activeMedia];
                            const isAudio = currentMedia.mediaType?.startsWith('audio/') || currentMedia.mediaUrl?.endsWith('.webm') || currentMedia.mediaUrl?.endsWith('.wav') || currentMedia.mediaUrl?.endsWith('.mp3');
                            const isVideo = currentMedia.mediaType?.startsWith('video/');

                            if (isAudio) {
                                return (
                                    <div className="w-full max-w-md p-8 bg-amber-50 rounded-2xl border border-amber-200 flex flex-col items-center gap-4 text-center z-10 mx-4 shadow-xl">
                                        <div className="w-16 h-16 bg-amber-700 text-white rounded-full flex items-center justify-center shadow-lg">
                                            <Music className="w-8 h-8 animate-bounce" style={{ animationDuration: '3s' }} />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-bold text-amber-950 font-serif">Voice Record / Audio Memory</h3>
                                            <p className="text-xs text-amber-800 mt-1">Audio Recording</p>
                                        </div>
                                        <AudioWaveformPlayer audioUrl={currentMedia.mediaUrl} />
                                    </div>
                                );
                            }

                            if (isVideo) {
                                return (
                                    <video 
                                        src={currentMedia.mediaUrl} 
                                        controls 
                                        className="max-w-full max-h-full object-contain"
                                    />
                                );
                            }

                            return (
                                <img 
                                    src={currentMedia.mediaUrl} 
                                    alt={`${story.title} - Media ${activeMedia + 1}`}
                                    className="max-w-full max-h-full object-contain"
                                />
                            );
                        })()}
                        
                        {/* Gallery Thumbnails */}
                        {story.mediaFiles.length > 1 && (
                            <div className="absolute bottom-4 left-0 right-0 flex justify-center space-x-2 px-4 z-10 bg-black/40 py-2">
                                {story.mediaFiles.map((media, idx) => {
                                    const thumbIsAudio = media.mediaType?.startsWith('audio/') || media.mediaUrl?.endsWith('.webm') || media.mediaUrl?.endsWith('.wav') || media.mediaUrl?.endsWith('.mp3');
                                    const thumbIsVideo = media.mediaType?.startsWith('video/');
                                    return (
                                        <button 
                                            key={media.id}
                                            onClick={() => setActiveMedia(idx)}
                                            className={`w-16 h-16 rounded-md overflow-hidden border-2 transition-all flex items-center justify-center bg-gray-900 ${activeMedia === idx ? 'border-amber-500 shadow-lg scale-110' : 'border-transparent opacity-60 hover:opacity-100'}`}
                                        >
                                            {thumbIsAudio ? (
                                                <div className="w-full h-full flex flex-col items-center justify-center bg-amber-50 p-1">
                                                    <Music className="w-6 h-6 text-amber-700" />
                                                    <span className="text-[8px] text-amber-800 font-medium truncate w-full text-center">Audio</span>
                                                </div>
                                            ) : thumbIsVideo ? (
                                                <div className="w-full h-full flex flex-col items-center justify-center bg-slate-800 p-1">
                                                    <Film className="w-6 h-6 text-white" />
                                                    <span className="text-[8px] text-white/80 font-medium truncate w-full text-center">Video</span>
                                                </div>
                                            ) : (
                                                <img src={media.mediaUrl} alt="" className="w-full h-full object-cover" />
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                )}

                <div className="p-8 md:p-12">
                    <h1 className="text-4xl font-bold text-gray-900 mb-6 font-serif">{story.title}</h1>
                    
                    <div className="flex flex-wrap items-center text-sm text-gray-600 gap-6 mb-8 pb-8 border-b border-gray-100">
                        <div className="flex items-center">
                            <div className="w-10 h-10 rounded-full bg-amber-100 overflow-hidden mr-3">
                                {story.authorPhotoUrl ? (
                                    <img src={story.authorPhotoUrl} alt={story.authorName} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-amber-700 font-bold text-lg">
                                        {story.authorName?.charAt(0).toUpperCase()}
                                    </div>
                                )}
                            </div>
                            <div>
                                <p className="font-medium text-gray-900">{story.authorName}</p>
                                <p className="text-xs">Shared memory</p>
                            </div>
                        </div>
                        
                        {story.storyDate && (
                            <div className="flex items-center bg-gray-50 px-4 py-2 rounded-lg">
                                <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                                <span className="font-medium">{story.storyDate}</span>
                            </div>
                        )}
                        
                        {story.location && (
                            <div className="flex items-center bg-gray-50 px-4 py-2 rounded-lg">
                                <MapPin className="w-4 h-4 mr-2 text-gray-400" />
                                <span className="font-medium">{story.location}</span>
                            </div>
                        )}
                    </div>
                    
                    <div className="prose prose-lg max-w-none text-gray-700 mb-10 whitespace-pre-wrap leading-relaxed">
                        {story.description || <span className="text-gray-400 italic">No description provided.</span>}
                    </div>
                    
                    {story.tags && story.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                            {story.tags.map(tag => (
                                <span key={tag} className="px-3 py-1 bg-amber-50 text-amber-700 border border-amber-100 rounded-full text-sm font-medium">
                                    #{tag}
                                </span>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>

            {/* Custom Delete Confirmation Modal */}
            {showDeleteModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 transform transition-all">
                        <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-red-100 rounded-full">
                            <Trash2 className="w-6 h-6 text-red-600" />
                        </div>
                        <h3 className="text-xl font-bold text-center text-gray-900 mb-2 font-serif">
                            Delete this memory?
                        </h3>
                        <p className="text-center text-gray-500 mb-6">
                            Are you sure you want to permanently delete this story? This action cannot be undone.
                        </p>
                        <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
                            <button
                                onClick={() => setShowDeleteModal(false)}
                                className="w-full px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmDelete}
                                className="w-full px-4 py-2 text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors font-medium"
                            >
                                Yes, Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
