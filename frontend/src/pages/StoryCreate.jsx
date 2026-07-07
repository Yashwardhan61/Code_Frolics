import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { storyService } from '../api/storyService';
import { profileService } from '../api/profileService';
import { friendService } from '../api/friendService';
import { aiService } from '../api/aiService';
import { useToast } from '../contexts/ToastContext';
import { 
    ImageIcon, X, Loader2, ArrowLeft, Mic, Square, Music, Film, 
    MapPin, Users, Hash, ChevronRight, ChevronLeft, Plus, 
    ChevronDown, Check, User, Sparkles, Calendar
} from 'lucide-react';

const promptsByCategory = {
    "🌅 Childhood": [
        "What is your earliest childhood memory?",
        "Describe a favorite holiday tradition you had.",
        "What was your favorite childhood game or toy?"
    ],
    "🗺️ Travel": [
        "What was the most adventurous trip you took?",
        "Describe a place that felt like home away from home.",
        "What was the local food you loved on a past trip?"
    ],
    "🏡 Family": [
        "What is a piece of advice your parents/grandparents gave you?",
        "Tell the story of how your family name/tradition originated.",
        "Describe a typical Sunday evening in your family home."
    ],
    "🎓 Milestones": [
        "Describe your first day of school or college.",
        "How did you feel when you achieved a major goal?",
        "What was a major turning point in your life?"
    ]
};



export default function StoryCreate() {
    const navigate = useNavigate();
    const toast = useToast();
    const [loading, setLoading] = useState(false);
    const [profile, setProfile] = useState(null);
    const [friends, setFriends] = useState([]);
    const [isShareDropdownOpen, setIsShareDropdownOpen] = useState(false);
    const [activePreviewIndex, setActivePreviewIndex] = useState(0);
    const [showPromptsDrawer, setShowPromptsDrawer] = useState(false);
    const [expandedPromptCategory, setExpandedPromptCategory] = useState(null);
    
    // AI State
    const [aiSuggestion, setAiSuggestion] = useState('');
    const [isEnhancing, setIsEnhancing] = useState(false);

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        storyDate: '',
        location: '',
        tags: [],
        sharedWithUserIds: []
    });
    const [isTimeCapsule, setIsTimeCapsule] = useState(false);
    const [unlockDate, setUnlockDate] = useState('');
    const [unlockTime, setUnlockTime] = useState('');
    const [tagInput, setTagInput] = useState('');
    const [files, setFiles] = useState([]);
    const [previews, setPreviews] = useState([]);

    // Audio recording state
    const [showRecorder, setShowRecorder] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const [mediaRecorder, setMediaRecorder] = useState(null);
    const [recordingTime, setRecordingTime] = useState(0);
    const [timerInterval, setTimerInterval] = useState(null);
    const [audioBlob, setAudioBlob] = useState(null);
    const [audioUrl, setAudioUrl] = useState(null);

    // Clean up timers and URL previews on unmount
    useEffect(() => {
        const loadData = async () => {
            try {
                const profileData = await profileService.getProfile();
                setProfile(profileData);
            } catch (err) {
                console.error('Failed to load profile', err);
            }
            try {
                const friendsData = await friendService.getFriends();
                setFriends(friendsData);
            } catch (err) {
                console.error('Failed to load friends', err);
            }
        };

        loadData();

        return () => {
            if (timerInterval) clearInterval(timerInterval);
            previews.forEach(preview => URL.revokeObjectURL(preview));
        };
    }, [timerInterval]);

    // AI Debounce for Suggestion
    useEffect(() => {
        const text = formData.description;
        if (!text || text.length < 10 || text.endsWith(' ') || text.endsWith('\n')) {
            setAiSuggestion('');
            return;
        }

        const timerId = setTimeout(async () => {
            try {
                const suggestion = await aiService.suggestNextWords(text);
                setAiSuggestion(suggestion);
            } catch (e) {
                console.error("AI Suggestion error", e);
            }
        }, 500); // 500ms debounce

        return () => clearTimeout(timerId);
    }, [formData.description]);

    const handleKeyDown = (e) => {
        if (e.key === 'Tab' && aiSuggestion) {
            e.preventDefault();
            setFormData({ ...formData, description: formData.description + ' ' + aiSuggestion });
            setAiSuggestion('');
        }
    };

    const handleEnhanceDescription = async () => {
        if (!formData.description.trim()) {
            toast.error("Please write a description first.");
            return;
        }
        setIsEnhancing(true);
        try {
            const enhanced = await aiService.enhanceDescription(formData.description);
            if (enhanced) {
                setFormData(prev => ({ ...prev, description: enhanced }));
                toast.success("Description enhanced!");
            }
        } catch (e) {
            toast.error("Failed to enhance description.");
        } finally {
            setIsEnhancing(false);
        }
    };

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const recorder = new MediaRecorder(stream);
            const chunks = [];

            recorder.ondataavailable = (e) => {
                if (e.data.size > 0) chunks.push(e.data);
            };

            recorder.onstop = () => {
                const blob = new Blob(chunks, { type: 'audio/webm' });
                const url = URL.createObjectURL(blob);
                setAudioBlob(blob);
                setAudioUrl(url);
                stream.getTracks().forEach(track => track.stop());
            };

            recorder.start();
            setMediaRecorder(recorder);
            setIsRecording(true);
            setRecordingTime(0);

            const interval = setInterval(() => {
                setRecordingTime(prev => prev + 1);
            }, 1000);
            setTimerInterval(interval);
        } catch (err) {
            console.error('Failed to start recording', err);
            toast.error('Could not access microphone. Please check permissions.');
        }
    };

    const stopRecording = () => {
        if (mediaRecorder && isRecording) {
            mediaRecorder.stop();
            setIsRecording(false);
            if (timerInterval) {
                clearInterval(timerInterval);
                setTimerInterval(null);
            }
        }
    };

    const discardRecording = () => {
        if (audioUrl) {
            URL.revokeObjectURL(audioUrl);
        }
        setAudioBlob(null);
        setAudioUrl(null);
        setRecordingTime(0);
    };

    const addRecordedAudio = () => {
        if (audioBlob) {
            const audioFile = new File([audioBlob], `voice_memory_${Date.now()}.webm`, { type: 'audio/webm' });
            setFiles(prev => [...prev, audioFile]);
            setPreviews(prev => [...prev, audioUrl]);
            setActivePreviewIndex(files.length);
            
            setAudioBlob(null);
            setAudioUrl(null);
            setRecordingTime(0);
            setShowRecorder(false);
            toast.success('Voice memory added successfully!');
        }
    };

    const formatTime = (secs) => {
        const mins = Math.floor(secs / 60);
        const remainingSecs = secs % 60;
        return `${mins.toString().padStart(2, '0')}:${remainingSecs.toString().padStart(2, '0')}`;
    };

    const handleFileChange = (e) => {
        const selectedFiles = Array.from(e.target.files);
        if (selectedFiles.length === 0) return;

        setFiles(prev => [...prev, ...selectedFiles]);
        const newPreviews = selectedFiles.map(file => URL.createObjectURL(file));
        setPreviews(prev => [...prev, ...newPreviews]);
        setActivePreviewIndex(previews.length);
    };

    const removeFile = (index) => {
        setFiles(prev => prev.filter((_, i) => i !== index));
        setPreviews(prev => {
            const newPreviews = [...prev];
            URL.revokeObjectURL(newPreviews[index]);
            newPreviews.splice(index, 1);
            return newPreviews;
        });
        setActivePreviewIndex(prev => {
            if (prev >= index) {
                return Math.max(0, prev - 1);
            }
            return prev;
        });
    };

    const handleAddTag = (e) => {
        if (e.key === 'Enter' && tagInput.trim()) {
            e.preventDefault();
            const cleanTag = tagInput.trim().replace(/^#/, '');
            if (!formData.tags.includes(cleanTag)) {
                setFormData({
                    ...formData,
                    tags: [...formData.tags, cleanTag]
                });
            }
            setTagInput('');
        }
    };

    const removeTag = (tagToRemove) => {
        setFormData({
            ...formData,
            tags: formData.tags.filter(tag => tag !== tagToRemove)
        });
    };

    const handleToggleShare = (userId) => {
        setFormData(prev => {
            const shared = prev.sharedWithUserIds.includes(userId);
            const updated = shared 
                ? prev.sharedWithUserIds.filter(id => id !== userId) 
                : [...prev.sharedWithUserIds, userId];
            return {
                ...prev,
                sharedWithUserIds: updated
            };
        });
    };

    const handleSelectPrompt = (prompt) => {
        setFormData(prev => ({
            ...prev,
            description: `Prompt: ${prompt}\n\n${prev.description}`
        }));
        setShowPromptsDrawer(false);
        toast.success('Story Starter loaded into composer!');
    };



    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.title.trim()) {
            toast.error('Title is required.');
            return;
        }
        
        if (isTimeCapsule) {
            if (!unlockDate || !unlockTime) {
                toast.error('Please specify both unlock date and time for the Time Capsule.');
                return;
            }
            const unlockDateTime = `${unlockDate}T${unlockTime}:00`;
            if (new Date(unlockDateTime) <= new Date()) {
                toast.error('Unlock time must be in the future.');
                return;
            }
        }
        
        try {
            setLoading(true);
            // Capture the current system date at the exact time of upload
            const today = new Date().toLocaleDateString('en-CA'); // YYYY-MM-DD format in local timezone
            const storyData = {
                ...formData,
                storyDate: formData.storyDate || today,
                unlockDateTime: isTimeCapsule ? `${unlockDate}T${unlockTime}:00` : null
            };
            await storyService.createStory(storyData, files);
            toast.success('Memory saved successfully!');
            navigate('/dashboard');
        } catch (error) {
            console.error('Failed to create story', error);
            toast.error('Failed to save memory: ' + (error.response?.data?.message || error.message));
        } finally {
            setLoading(false);
        }
    };

    const activePreview = previews[activePreviewIndex];
    const activeFile = files[activePreviewIndex];
    const isActiveAudio = activeFile?.type?.startsWith('audio/') || activeFile?.name?.endsWith('.webm') || activeFile?.name?.endsWith('.wav') || activeFile?.name?.endsWith('.mp3');
    const isActiveVideo = activeFile?.type?.startsWith('video/');

    return (
        <div className="max-w-5xl mx-auto py-6 px-4">
            <div className="mb-6 flex items-center justify-between">
                <div className="flex items-center">
                    <Link to="/dashboard" className="text-amber-800 hover:text-amber-955 transition-colors mr-3 p-1.5 hover:bg-amber-100/55 rounded-full">
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <h1 className="text-3xl font-extrabold tracking-tight text-amber-950 font-serif">New Memory</h1>
                </div>
                <button 
                    onClick={handleSubmit}
                    disabled={loading || !formData.title.trim()}
                    className="px-5 py-2 bg-gradient-to-r from-amber-800 to-amber-900 hover:scale-105 active:scale-95 transition-all text-white text-sm font-semibold rounded-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-lg shadow-amber-900/10"
                >
                    {loading ? (
                        <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Sharing...
                        </>
                    ) : (
                        'Share Memory'
                    )}
                </button>
            </div>

            <form onSubmit={handleSubmit} className="vintage-paper-container grid grid-cols-1 md:grid-cols-12 min-h-[560px]">
                {/* Left Pane - Media Uploader & Carousel Preview */}
                <div className="md:col-span-7 vintage-desk flex flex-col justify-between relative min-h-[350px] md:min-h-[500px]">
                    {previews.length === 0 ? (
                        // Empty State - Uploader
                        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
                            <div className="w-16 h-16 rounded-3xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400 mb-6 hover:rotate-6 hover:scale-110 transition-all duration-300">
                                <ImageIcon className="w-8 h-8 text-amber-500/80" />
                            </div>
                            <h3 className="text-lg font-bold text-white mb-1">Upload files to your memory</h3>
                            <p className="text-xs text-zinc-400 max-w-xs mb-6">
                                Upload photos, videos, or record a voice note to attach to this memory card.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-3">
                                <label className="px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold rounded-xl cursor-pointer hover:scale-105 transition-transform shadow-lg shadow-amber-600/10 text-center">
                                    Browse Files
                                    <input 
                                        type="file" 
                                        multiple 
                                        accept="image/*,video/*,audio/*"
                                        onChange={handleFileChange}
                                        className="hidden"
                                    />
                                </label>
                                <button
                                    type="button"
                                    onClick={() => setShowRecorder(true)}
                                    className="flex items-center justify-center gap-1.5 px-5 py-2.5 bg-zinc-900 hover:bg-zinc-800 hover:scale-105 text-zinc-200 text-xs font-semibold rounded-xl border border-zinc-800 transition-all"
                                >
                                    <Mic className="w-3.5 h-3.5 text-amber-500" />
                                    Record Audio
                                </button>
                            </div>
                        </div>
                    ) : (
                        // Active Preview Pane
                        <div className="flex-1 flex flex-col justify-between">
                            {/* Header overlay */}
                            <div className="absolute top-4 left-4 z-20 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full text-[11px] text-zinc-300 font-medium select-none">
                                {activePreviewIndex + 1} / {previews.length}
                            </div>
                            <button
                                type="button"
                                onClick={() => removeFile(activePreviewIndex)}
                                className="absolute top-4 right-4 z-20 bg-red-600/80 hover:bg-red-600 text-white rounded-full p-1.5 transition-colors shadow-md hover:scale-110 active:scale-95 duration-150"
                                title="Remove file"
                            >
                                <X className="w-4 h-4" />
                            </button>

                            {/* Active Media */}
                            <div className="flex-1 flex items-center justify-center bg-black/20 overflow-hidden relative min-h-[320px] p-6">
                                <div className="w-full h-full flex items-center justify-center max-h-[380px]">
                                    {isActiveAudio ? (
                                        <div className="w-full h-full flex flex-col items-center justify-center p-8 text-amber-100 min-h-[250px] animate-fadeIn">
                                            <div className="w-20 h-20 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 mb-4 animate-pulse">
                                                <Music className="w-8 h-8" />
                                            </div>
                                            <p className="text-xs font-semibold text-amber-200 truncate max-w-[250px] mb-4">
                                                {activeFile?.name || 'Voice Recording'}
                                            </p>
                                            <audio src={activePreview} controls className="w-full max-w-[280px] h-8 accent-amber-500 bg-amber-950/80 rounded-lg p-1" />
                                        </div>
                                    ) : (
                                        // Scrapbook slot for photos/videos
                                        <div className="scrapbook-photo-slot relative p-4 max-h-[380px] max-w-full flex items-center justify-center rounded-sm">
                                            <div className="photo-corner-tl"></div>
                                            <div className="photo-corner-tr"></div>
                                            <div className="photo-corner-bl"></div>
                                            <div className="photo-corner-br"></div>
                                            {isActiveVideo ? (
                                                <video src={activePreview} controls className="max-h-[340px] max-w-full object-contain rounded-sm" />
                                            ) : (
                                                <img src={activePreview} alt="Preview" className="max-h-[340px] max-w-full object-contain rounded-sm" />
                                            )}
                                        </div>
                                    )}
                                </div>

                                {/* Left & Right Chevrons */}
                                {previews.length > 1 && (
                                    <>
                                        <button
                                            type="button"
                                            onClick={() => setActivePreviewIndex(prev => Math.max(0, prev - 1))}
                                            disabled={activePreviewIndex === 0}
                                            className="absolute left-4 bg-black/50 hover:bg-black/80 hover:scale-105 active:scale-95 text-white rounded-full p-2 disabled:opacity-20 transition-all z-10"
                                        >
                                            <ChevronLeft className="w-5 h-5" />
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setActivePreviewIndex(prev => Math.min(previews.length - 1, prev + 1))}
                                            disabled={activePreviewIndex === previews.length - 1}
                                            className="absolute right-4 bg-black/50 hover:bg-black/80 hover:scale-105 active:scale-95 text-white rounded-full p-2 disabled:opacity-20 transition-all z-10"
                                        >
                                            <ChevronRight className="w-5 h-5" />
                                        </button>
                                    </>
                                )}
                            </div>

                            {/* Thumbnail Tray */}
                            <div className="bg-zinc-950 p-4 border-t border-zinc-900 flex items-center gap-3 overflow-x-auto select-none">
                                <div className="flex gap-2">
                                    {previews.map((prev, idx) => {
                                        const file = files[idx];
                                        const isAudio = file?.type?.startsWith('audio/') || file?.name?.endsWith('.webm') || file?.name?.endsWith('.wav') || file?.name?.endsWith('.mp3');
                                        const isVideo = file?.type?.startsWith('video/');

                                        return (
                                            <button
                                                key={idx}
                                                type="button"
                                                onClick={() => setActivePreviewIndex(idx)}
                                                className={`w-14 h-14 rounded-lg overflow-hidden border-2 flex items-center justify-center flex-shrink-0 bg-zinc-900 transition-all duration-300 hover:scale-105 ${
                                                    idx === activePreviewIndex 
                                                        ? 'border-amber-500 scale-90 ring-2 ring-amber-500/20' 
                                                        : 'border-zinc-800 opacity-60 hover:opacity-100'
                                                }`}
                                            >
                                                {isAudio ? (
                                                    <Music className="w-5 h-5 text-amber-500" />
                                                ) : isVideo ? (
                                                    <Film className="w-5 h-5 text-zinc-400" />
                                                ) : (
                                                    <img src={prev} className="w-full h-full object-cover" alt="" />
                                                )}
                                            </button>
                                        );
                                    })}
                                </div>
                                <label className="w-14 h-14 rounded-lg border-2 border-dashed border-zinc-800 hover:border-amber-500 flex items-center justify-center cursor-pointer transition-all hover:scale-105 flex-shrink-0 text-zinc-500 hover:text-amber-500 bg-zinc-900/40">
                                    <Plus className="w-5 h-5" />
                                    <input 
                                        type="file" 
                                        multiple 
                                        accept="image/*,video/*,audio/*"
                                        onChange={handleFileChange}
                                        className="hidden"
                                    />
                                </label>
                            </div>
                        </div>
                    )}

                    {/* Audio Recorder Slide-up Overlay */}
                    {showRecorder && (
                        <div className="absolute inset-0 bg-zinc-950/95 backdrop-blur-md z-30 flex flex-col items-center justify-center p-6 text-white text-center animate-fadeIn">
                            <div className="w-16 h-16 rounded-full bg-red-600/10 border border-red-600/30 flex items-center justify-center mb-4 text-red-500 animate-pulse">
                                <Mic className="w-8 h-8" />
                            </div>
                            <h4 className="text-lg font-bold mb-1">
                                {isRecording ? 'Recording Voice Memory' : 'Voice Recorder'}
                            </h4>
                            <p className="text-xs text-zinc-400 mb-6">
                                {isRecording ? `Duration: ${formatTime(recordingTime)}` : audioUrl ? 'Recording complete!' : 'Record a voice description for this memory card.'}
                            </p>

                            <div className="flex flex-col gap-3 w-full max-w-[280px]">
                                {isRecording ? (
                                    <button
                                        type="button"
                                        onClick={stopRecording}
                                        className="flex items-center justify-center gap-2 w-full py-2.5 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded-xl transition-all shadow-lg shadow-red-600/20"
                                    >
                                        <Square className="w-4 h-4 fill-white" />
                                        Stop Recording
                                    </button>
                                ) : audioUrl ? (
                                    <>
                                        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-2 mb-2">
                                            <audio src={audioUrl} controls className="w-full h-8 accent-amber-500" />
                                        </div>
                                        <button
                                            type="button"
                                            onClick={addRecordedAudio}
                                            className="w-full py-2.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold rounded-xl transition-all"
                                        >
                                            Attach to Memory
                                        </button>
                                        <button
                                            type="button"
                                            onClick={discardRecording}
                                            className="w-full py-2.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 text-xs font-semibold rounded-xl border border-zinc-800 transition-all"
                                        >
                                            Discard
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <button
                                            type="button"
                                            onClick={startRecording}
                                            className="flex items-center justify-center gap-2 w-full py-2.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold rounded-xl transition-all shadow-lg shadow-amber-600/10"
                                        >
                                            <Mic className="w-4 h-4" />
                                            Start Recording
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setShowRecorder(false)}
                                            className="w-full py-2.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 text-xs font-semibold rounded-xl border border-zinc-800 transition-all"
                                        >
                                            Close
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Right Pane - Details & Composer */}
                <div className="md:col-span-5 flex flex-col justify-between p-6 vintage-journal-page overflow-y-auto max-h-[650px] md:max-h-none border-l border-amber-900/10">
                    {/* Paper clip decoration to enhance vintage feel */}
                    <div className="paperclip-decoration"></div>
                    <div>
                        {/* Profile Header */}
                        <div className="flex items-center gap-3 mb-4 pb-3 border-b border-amber-900/10 pl-10">
                            <div className="w-10 h-10 rounded-full bg-zinc-100 overflow-hidden border border-zinc-200 flex items-center justify-center flex-shrink-0">
                                {profile?.photoUrl ? (
                                    <img src={profile.photoUrl} alt={profile.displayName} className="w-full h-full object-cover" />
                                ) : (
                                    <User className="w-5 h-5 text-zinc-400" />
                                )}
                            </div>
                            <div>
                                <h3 className="font-semibold text-zinc-900 text-sm leading-none">{profile?.displayName || 'Sharing Memory'}</h3>
                                <span className="text-[11px] text-zinc-500">@{profile?.username || 'username'}</span>
                            </div>
                        </div>

                        {/* Story Starters Drawer */}
                        <div className="mb-4 bg-zinc-50 border border-zinc-100 rounded-2xl overflow-hidden transition-all duration-300">
                            <button
                                type="button"
                                onClick={() => setShowPromptsDrawer(!showPromptsDrawer)}
                                className="w-full flex items-center justify-between p-3.5 text-zinc-700 hover:text-amber-800 font-semibold text-xs transition-colors"
                            >
                                <div className="flex items-center gap-2">
                                    <Sparkles className="w-4 h-4 text-amber-500 animate-spin" style={{ animationDuration: '3s' }} />
                                    <span>💡 Need inspiration? Try a Story Starter</span>
                                </div>
                                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showPromptsDrawer ? 'rotate-180' : ''}`} />
                            </button>

                            {showPromptsDrawer && (
                                <div className="p-3 pt-0 space-y-2 border-t border-zinc-100/50 max-h-56 overflow-y-auto animate-fadeIn">
                                    {Object.entries(promptsByCategory).map(([category, questions]) => {
                                        const isCatExpanded = expandedPromptCategory === category;
                                        return (
                                            <div key={category} className="border border-zinc-100 bg-white rounded-xl overflow-hidden">
                                                <button
                                                    type="button"
                                                    onClick={() => setExpandedPromptCategory(isCatExpanded ? null : category)}
                                                    className="w-full flex items-center justify-between p-2.5 text-zinc-800 font-bold text-xs text-left hover:bg-zinc-50 transition-colors"
                                                >
                                                    <span>{category}</span>
                                                    <ChevronDown className={`w-3 h-3 transition-transform ${isCatExpanded ? 'rotate-180' : ''}`} />
                                                </button>
                                                {isCatExpanded && (
                                                    <div className="p-2 pt-0 space-y-1.5 border-t border-zinc-50 bg-zinc-50/50">
                                                        {questions.map((q, idx) => (
                                                            <button
                                                                key={idx}
                                                                type="button"
                                                                onClick={() => handleSelectPrompt(q)}
                                                                className="w-full text-left p-2 hover:bg-amber-50 rounded-lg text-[11px] text-zinc-700 hover:text-amber-900 transition-colors leading-relaxed font-medium bg-white border border-zinc-100"
                                                            >
                                                                {q}
                                                            </button>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        {/* Title & Caption */}
                        <div className="space-y-4 mb-4">
                            <input 
                                type="text" 
                                required
                                value={formData.title}
                                onChange={(e) => setFormData({...formData, title: e.target.value})}
                                placeholder="Give this memory a title..."
                                className="w-full text-xl font-bold text-amber-955 placeholder:text-amber-800/40 vintage-input-title pl-10 focus:ring-0 p-0 focus:outline-none"
                            />
                            <div className="relative">
                                <textarea 
                                    value={formData.description}
                                    onChange={(e) => {
                                        setFormData({...formData, description: e.target.value});
                                        if (aiSuggestion) setAiSuggestion('');
                                    }}
                                    onKeyDown={handleKeyDown}
                                    placeholder="Write the description or story here..."
                                    className="w-full text-sm text-amber-900 placeholder:text-amber-800/40 vintage-textarea-description pl-10 focus:ring-0 p-0 resize-none h-36 focus:outline-none relative z-10 bg-transparent"
                                />
                                {aiSuggestion && (
                                    <div className="absolute inset-0 pointer-events-none pl-10 pt-[2px]">
                                        <span className="text-sm text-transparent">{formData.description}</span>
                                        <span className="text-sm text-amber-600/50 italic ml-1">
                                            {aiSuggestion} <span className="text-[10px] bg-amber-200/50 text-amber-700 px-1 rounded font-bold ml-1">TAB</span>
                                        </span>
                                    </div>
                                )}
                            </div>
                            
                            <div className="pl-10 flex justify-end mt-2">
                                <button
                                    type="button"
                                    onClick={handleEnhanceDescription}
                                    disabled={isEnhancing || !formData.description.trim()}
                                    className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 hover:scale-105 active:scale-95 transition-all text-amber-400 text-[11px] font-semibold rounded-lg disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
                                >
                                    {isEnhancing ? (
                                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                    ) : (
                                        <Sparkles className="w-3.5 h-3.5" />
                                    )}
                                    {isEnhancing ? 'Enhancing...' : '✨ Enhance'}
                                </button>
                            </div>
                        </div>

                        {/* Date of Memory Row */}
                        <div className="flex items-center gap-3 py-3 border-t border-amber-900/10 text-amber-850 pl-10">
                            <Calendar className="w-4 h-4 text-amber-700/60 flex-shrink-0" />
                            <input 
                                type="date" 
                                value={formData.storyDate}
                                onChange={(e) => setFormData({...formData, storyDate: e.target.value})}
                                className="w-full text-xs border-none outline-none focus:ring-0 p-0 text-amber-900 bg-transparent cursor-pointer"
                            />
                        </div>

                        {/* Location Row */}
                        <div className="flex items-center gap-3 py-3 border-t border-amber-900/10 text-amber-850 pl-10">
                            <MapPin className="w-4 h-4 text-amber-700/60 flex-shrink-0" />
                            <input 
                                type="text" 
                                value={formData.location}
                                onChange={(e) => setFormData({...formData, location: e.target.value})}
                                placeholder="Add location (e.g. Paris, France)"
                                className="w-full text-xs border-none outline-none focus:ring-0 p-0 placeholder:text-amber-800/40 text-amber-900 bg-transparent"
                            />
                        </div>

                        {/* Hashtags Row */}
                        <div className="py-3 border-t border-amber-900/10 pl-10">
                            <div className="flex items-center gap-3 text-amber-800 mb-2">
                                <Hash className="w-4 h-4 text-amber-700/60 flex-shrink-0" />
                                <input 
                                    type="text" 
                                    value={tagInput}
                                    onChange={(e) => setTagInput(e.target.value)}
                                    onKeyDown={handleAddTag}
                                    placeholder="Add custom tags (press Enter)"
                                    className="w-full text-xs border-none outline-none focus:ring-0 p-0 placeholder:text-amber-800/40 text-amber-900 bg-transparent"
                                />
                            </div>
                            {formData.tags.length > 0 && (
                                <div className="flex flex-wrap gap-1.5 pl-7 select-none">
                                    {formData.tags.map(tag => (
                                        <span 
                                            key={tag} 
                                            className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#faf5e6] text-amber-950 border border-amber-900/20 hover:scale-105 transition-transform"
                                        >
                                            #{tag}
                                            <button 
                                                type="button" 
                                                onClick={() => removeTag(tag)}
                                                className="hover:text-red-500 text-amber-800/60"
                                            >
                                                <X className="w-2.5 h-2.5" />
                                            </button>
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Friends Privacy Share Settings */}
                        <div className="relative border-t border-b border-amber-900/10 py-3 mb-6 pl-10">
                            <button 
                                type="button" 
                                onClick={() => setIsShareDropdownOpen(!isShareDropdownOpen)} 
                                className="w-full flex items-center justify-between text-amber-800 hover:text-amber-950 text-xs font-semibold"
                            >
                                <div className="flex items-center gap-3">
                                    <Users className="w-4 h-4 text-amber-700/60 flex-shrink-0" />
                                    <span>Share with friends ({formData.sharedWithUserIds.length})</span>
                                </div>
                                <ChevronDown className={`w-4 h-4 text-amber-700/60 transition-transform ${isShareDropdownOpen ? 'rotate-180' : ''}`} />
                            </button>
                            
                            {/* Selected Friends list */}
                            {!isShareDropdownOpen && formData.sharedWithUserIds.length > 0 && (
                                <div className="flex flex-wrap gap-1 mt-2 pl-7 select-none animate-fadeIn">
                                    {friends
                                        .filter(f => formData.sharedWithUserIds.includes(f.userId))
                                        .map(f => (
                                            <span key={f.id} className="inline-flex items-center gap-1 text-[10px] bg-[#faf5e6] text-amber-950 px-2 py-0.5 rounded-full border border-amber-900/20 hover:scale-105 transition-transform">
                                                {f.displayName}
                                                <button type="button" onClick={() => handleToggleShare(f.userId)} className="text-amber-800/60 hover:text-red-500">
                                                    <X className="w-2.5 h-2.5" />
                                                </button>
                                            </span>
                                        ))
                                    }
                                </div>
                            )}

                            {isShareDropdownOpen && (
                                <div className="absolute left-0 right-0 mt-2 bg-[#fdfbf7] border border-amber-900/25 rounded-2xl shadow-xl z-50 max-h-48 overflow-y-auto p-2 animate-fadeIn">
                                    {friends.length === 0 ? (
                                        <div className="text-center p-3 select-none">
                                            <p className="text-[10px] text-amber-800/60 mb-1.5">No friends added yet.</p>
                                            <Link to="/friends" className="text-[10px] text-amber-800 hover:underline font-semibold">
                                                Go to Friends page
                                            </Link>
                                        </div>
                                    ) : (
                                        friends.map(friend => {
                                            const isShared = formData.sharedWithUserIds.includes(friend.userId);
                                            return (
                                                <div 
                                                    key={friend.id} 
                                                    onClick={() => handleToggleShare(friend.userId)} 
                                                    className="flex items-center justify-between p-2 hover:bg-[#faf5e6] rounded-xl cursor-pointer transition-colors"
                                                >
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-7 h-7 rounded-full bg-[#fdfbf7] overflow-hidden flex items-center justify-center border border-amber-900/20">
                                                            {friend.photoUrl ? (
                                                                <img src={friend.photoUrl} alt={friend.displayName} className="w-full h-full object-cover" />
                                                            ) : (
                                                                <User className="w-3.5 h-3.5 text-amber-700/60" />
                                                            )}
                                                        </div>
                                                        <div>
                                                            <p className="text-xs font-semibold text-amber-950">{friend.displayName}</p>
                                                            <p className="text-[10px] text-amber-800/60">@{friend.username}</p>
                                                        </div>
                                                    </div>
                                                    {isShared && <Check className="w-4 h-4 text-amber-800" />}
                                                </div>
                                            );
                                        })
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Time Capsule Settings */}
                    <div className="border-t border-amber-900/10 py-4 pl-10 mb-2">
                        <div className="flex items-center justify-between mb-3">
                            <label className="flex items-center gap-3 text-amber-800 font-semibold text-xs cursor-pointer select-none">
                                <input 
                                    type="checkbox" 
                                    checked={isTimeCapsule}
                                    onChange={(e) => setIsTimeCapsule(e.target.checked)}
                                    className="rounded border-amber-900/30 text-amber-800 focus:ring-amber-500 h-4 w-4 bg-transparent"
                                />
                                <span className="flex items-center gap-1.5">
                                    🔒 Seal in a Time Capsule
                                </span>
                            </label>
                            {isTimeCapsule && (
                                <span className="text-[10px] text-amber-700/60 bg-[#faf5e6] border border-amber-900/20 px-2 py-0.5 rounded-full font-medium">
                                    Locked until set time
                                </span>
                            )}
                        </div>

                        {isTimeCapsule && (
                            <div className="grid grid-cols-2 gap-3 mt-3 animate-fadeIn">
                                <div>
                                    <label className="block text-[10px] font-bold text-amber-800/80 mb-1">Unlock Date</label>
                                    <input 
                                        type="date"
                                        required={isTimeCapsule}
                                        value={unlockDate}
                                        onChange={(e) => setUnlockDate(e.target.value)}
                                        min={new Date().toLocaleDateString('en-CA')}
                                        className="w-full text-xs p-2 rounded-lg border border-amber-900/20 bg-transparent text-amber-900 focus:ring-amber-500 focus:border-amber-500 focus:outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold text-amber-800/80 mb-1">Unlock Time</label>
                                    <input 
                                        type="time"
                                        required={isTimeCapsule}
                                        value={unlockTime}
                                        onChange={(e) => setUnlockTime(e.target.value)}
                                        className="w-full text-xs p-2 rounded-lg border border-amber-900/20 bg-transparent text-amber-900 focus:ring-amber-500 focus:border-amber-500 focus:outline-none"
                                    />
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-amber-900/10 select-none pl-10">
                        <Link 
                            to="/dashboard"
                            className="px-5 py-2.5 border border-amber-900/20 text-amber-800 text-xs font-semibold rounded-xl hover:bg-[#faf5e6] transition-colors"
                        >
                            Cancel
                        </Link>
                    </div>
                </div>
            </form>
        </div>
    );
}
