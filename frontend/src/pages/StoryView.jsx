import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { storyService } from '../api/storyService';
import { useToast } from '../contexts/ToastContext';
import { ArrowLeft, MapPin, Calendar, Trash2, Pencil, Music, Film, Lock } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import AudioWaveformPlayer from '../components/AudioWaveformPlayer';

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
    const { currentUser } = useAuth();
    const toast = useToast();
    const [story, setStory] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeMedia, setActiveMedia] = useState(0);
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    const fetchStory = async () => {
        try {
            const data = await storyService.getStoryById(id);
            setStory(data);
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

                    <h1 className="text-3xl md:text-4xl font-extrabold text-amber-955 font-serif mb-4 leading-tight">
                        {story.title}
                    </h1>

                    {/* Metadata strip */}
                    <div className="flex flex-wrap items-center justify-center text-xs text-amber-900/70 gap-4 mb-8">
                        <span className="flex items-center">
                            By {story.authorName}
                        </span>
                        {story.location && (
                            <span className="flex items-center gap-1">
                                <MapPin className="w-3.5 h-3.5" />
                                {story.location}
                            </span>
                        )}
                    </div>

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
                        This story is sealed in a Time Capsule. The contents and media files will automatically unlock and reveal themselves on:
                        <span className="block mt-2 font-bold text-amber-950 bg-[#faf5e6] border border-amber-900/10 px-4 py-2 rounded-xl text-xs max-w-fit mx-auto">
                            {new Date(story.unlockDateTime).toLocaleString(undefined, {
                                dateStyle: 'long',
                                timeStyle: 'short'
                            })}
                        </span>
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
            <div className="mb-6 flex items-center justify-between">
                <Link to="/dashboard" className="flex items-center text-gray-500 hover:text-amber-700 transition-colors font-medium">
                    <ArrowLeft className="w-5 h-5 mr-2" />
                    Back
                </Link>
                
                {isAuthor && (
                    <div className="flex space-x-3">
                        <button 
                            onClick={() => navigate(`/story/${id}/edit`)}
                            className="flex items-center text-amber-700 bg-amber-50 px-4 py-2 rounded-lg hover:bg-amber-100 transition-colors font-medium"
                        >
                            <Pencil className="w-4 h-4 mr-2" />
                            Edit
                        </button>
                        <button 
                            onClick={() => setShowDeleteModal(true)}
                            className="flex items-center text-red-600 bg-red-50 px-4 py-2 rounded-lg hover:bg-red-100 transition-colors font-medium"
                        >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
                        </button>
                    </div>
                )}
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
