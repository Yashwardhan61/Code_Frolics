import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { storyService } from '../api/storyService';
import { useToast } from '../contexts/ToastContext';
import { useAuth } from '../contexts/AuthContext';
import { ImageIcon, X, Loader2, ArrowLeft, Trash2, Mic, Square, Play, Music, Film } from 'lucide-react';

export default function StoryEdit() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { currentUser } = useAuth();
    const toast = useToast();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        storyDate: '',
        location: '',
        tags: []
    });
    const [tagInput, setTagInput] = useState('');
    const [existingMedia, setExistingMedia] = useState([]);
    const [newFiles, setNewFiles] = useState([]);
    const [newPreviews, setNewPreviews] = useState([]);

    // Audio recording state
    const [showRecorder, setShowRecorder] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const [mediaRecorder, setMediaRecorder] = useState(null);
    const [recordingTime, setRecordingTime] = useState(0);
    const [timerInterval, setTimerInterval] = useState(null);
    const [audioBlob, setAudioBlob] = useState(null);
    const [audioUrl, setAudioUrl] = useState(null);

    // Clean up timers on unmount
    useEffect(() => {
        return () => {
            if (timerInterval) {
                clearInterval(timerInterval);
            }
        };
    }, [timerInterval]);

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
            setNewFiles(prev => [...prev, audioFile]);
            setNewPreviews(prev => [...prev, audioUrl]);
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

    useEffect(() => {
        const fetchStory = async () => {
            try {
                const story = await storyService.getStoryById(id);

                // Check authorization
                if (currentUser?.email !== story.authorEmail) {
                    toast.error('You are not authorized to edit this story.');
                    navigate(`/story/${id}`);
                    return;
                }

                setFormData({
                    title: story.title || '',
                    description: story.description || '',
                    storyDate: story.storyDate || '',
                    location: story.location || '',
                    tags: story.tags || []
                });
                setExistingMedia(story.mediaFiles || []);
            } catch (error) {
                console.error('Failed to fetch story', error);
                toast.error('Could not load story for editing.');
                navigate('/dashboard');
            } finally {
                setLoading(false);
            }
        };

        fetchStory();
    }, [id]);

    const handleFileChange = (e) => {
        const selectedFiles = Array.from(e.target.files);
        setNewFiles(prev => [...prev, ...selectedFiles]);
        const previews = selectedFiles.map(file => URL.createObjectURL(file));
        setNewPreviews(prev => [...prev, ...previews]);
    };

    const removeNewFile = (index) => {
        setNewFiles(prev => prev.filter((_, i) => i !== index));
        setNewPreviews(prev => {
            const updated = [...prev];
            URL.revokeObjectURL(updated[index]);
            updated.splice(index, 1);
            return updated;
        });
    };

    const handleAddTag = (e) => {
        if (e.key === 'Enter' && tagInput.trim()) {
            e.preventDefault();
            if (!formData.tags.includes(tagInput.trim())) {
                setFormData({
                    ...formData,
                    tags: [...formData.tags, tagInput.trim()]
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

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setSaving(true);
            await storyService.updateStory(id, formData, newFiles);
            toast.success('Memory updated successfully!');
            navigate(`/story/${id}`);
        } catch (error) {
            console.error('Failed to update story', error);
            toast.error('Failed to update memory: ' + (error.response?.data?.message || error.message));
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-700"></div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto py-8">
            <div className="mb-6 flex items-center">
                <Link to={`/story/${id}`} className="text-gray-500 hover:text-amber-700 transition-colors mr-4">
                    <ArrowLeft className="w-6 h-6" />
                </Link>
                <h1 className="text-3xl font-bold" style={{ color: 'var(--brand-brown-800)' }}>Edit Memory</h1>
            </div>

            <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                <div className="space-y-6">
                    {/* Title */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Story Title *</label>
                        <input 
                            type="text" 
                            required
                            value={formData.title}
                            onChange={(e) => setFormData({...formData, title: e.target.value})}
                            placeholder="A beautiful day at the park..."
                            className="w-full p-3 border border-gray-300 rounded-xl focus:ring-amber-500 focus:border-amber-500"
                        />
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Story Description</label>
                        <textarea 
                            value={formData.description}
                            onChange={(e) => setFormData({...formData, description: e.target.value})}
                            placeholder="Tell us about what happened..."
                            className="w-full p-3 border border-gray-300 rounded-xl focus:ring-amber-500 focus:border-amber-500 min-h-[150px]"
                        />
                    </div>

                    <div className="grid grid-cols-1 gap-6">
                        {/* Location */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                            <input 
                                type="text" 
                                value={formData.location}
                                onChange={(e) => setFormData({...formData, location: e.target.value})}
                                placeholder="E.g. Paris, France"
                                className="w-full p-3 border border-gray-300 rounded-xl focus:ring-amber-500 focus:border-amber-500"
                            />
                        </div>
                    </div>

                    {/* Tags */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Tags</label>
                        <div className="flex flex-wrap gap-2 mb-2">
                            {formData.tags.map(tag => (
                                <span key={tag} className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-amber-100 text-amber-800">
                                    {tag}
                                    <button 
                                        type="button" 
                                        onClick={() => removeTag(tag)}
                                        className="ml-1.5 inline-flex items-center justify-center w-4 h-4 rounded-full hover:bg-amber-200 focus:outline-none"
                                    >
                                        <X className="w-3 h-3" />
                                    </button>
                                </span>
                            ))}
                        </div>
                        <input 
                            type="text" 
                            value={tagInput}
                            onChange={(e) => setTagInput(e.target.value)}
                            onKeyDown={handleAddTag}
                            placeholder="Type a tag and press Enter"
                            className="w-full p-3 border border-gray-300 rounded-xl focus:ring-amber-500 focus:border-amber-500"
                        />
                    </div>

                    {/* Existing Media */}
                    {existingMedia.length > 0 && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Current Media</label>
                            <div className="flex flex-wrap gap-4">
                                {existingMedia.map((media) => {
                                    const isAudio = media.mediaType?.startsWith('audio/') || media.mediaUrl?.endsWith('.webm') || media.mediaUrl?.endsWith('.wav') || media.mediaUrl?.endsWith('.mp3');
                                    const isVideo = media.mediaType?.startsWith('video/');
                                    return (
                                        <div key={media.id} className="relative w-32 h-32 rounded-xl overflow-hidden border border-gray-200 flex items-center justify-center bg-gray-50">
                                            {isAudio ? (
                                                <div className="flex flex-col items-center justify-center p-2 text-center h-full w-full bg-amber-50">
                                                    <Music className="w-8 h-8 text-amber-700 mb-1" />
                                                    <span className="text-[10px] text-gray-600 font-medium truncate w-full px-1">Audio Memory</span>
                                                </div>
                                            ) : isVideo ? (
                                                <div className="flex flex-col items-center justify-center p-2 text-center h-full w-full bg-slate-50">
                                                    <Film className="w-8 h-8 text-slate-700 mb-1" />
                                                    <span className="text-[10px] text-gray-600 font-medium truncate w-full px-1">Video Memory</span>
                                                </div>
                                            ) : (
                                                <img src={media.mediaUrl} alt="" className="w-full h-full object-cover" />
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Add New Media */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Add More Media (Photos/Videos/Audio)</label>
                        <div className="flex flex-wrap gap-4 mb-4">
                            {newPreviews.map((preview, index) => {
                                const file = newFiles[index];
                                const isAudio = file?.type?.startsWith('audio/') || file?.name?.endsWith('.webm') || file?.name?.endsWith('.wav') || file?.name?.endsWith('.mp3');
                                const isVideo = file?.type?.startsWith('video/');

                                return (
                                    <div key={index} className="relative w-32 h-32 rounded-xl overflow-hidden border border-gray-200 group flex items-center justify-center bg-gray-50">
                                        {isAudio ? (
                                            <div className="flex flex-col items-center justify-center p-2 text-center h-full w-full bg-amber-50">
                                                <Music className="w-8 h-8 text-amber-700 mb-1" />
                                                <span className="text-[10px] text-gray-600 font-medium truncate w-full px-1">{file?.name || 'Audio Record'}</span>
                                            </div>
                                        ) : isVideo ? (
                                            <div className="flex flex-col items-center justify-center p-2 text-center h-full w-full bg-slate-50">
                                                <Film className="w-8 h-8 text-slate-700 mb-1" />
                                                <span className="text-[10px] text-gray-600 font-medium truncate w-full px-1">{file?.name || 'Video File'}</span>
                                            </div>
                                        ) : (
                                            <img src={preview} alt={`New ${index}`} className="w-full h-full object-cover" />
                                        )}
                                        <button 
                                            type="button"
                                            onClick={() => removeNewFile(index)}
                                            className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity z-10"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                );
                            })}
                            
                            <label className="w-32 h-32 flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:bg-gray-50 hover:border-amber-500 transition-colors">
                                <ImageIcon className="w-8 h-8 text-gray-400 mb-2" />
                                <span className="text-xs text-gray-500 font-medium text-center">Upload Files</span>
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
                                className="w-32 h-32 flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:bg-gray-50 hover:border-amber-500 transition-colors text-gray-500"
                            >
                                <Mic className="w-8 h-8 text-amber-700 mb-2" />
                                <span className="text-xs text-gray-500 font-medium text-center">Record Audio</span>
                            </button>
                        </div>

                        {/* Audio Recorder Panel */}
                        {showRecorder && (
                            <div className="mt-4 p-4 border border-amber-100 bg-amber-50/40 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 animate-fadeIn">
                                <div className="flex items-center gap-3">
                                    <div className={`w-3.5 h-3.5 rounded-full bg-red-600 ${isRecording ? 'animate-ping' : ''}`} />
                                    <div>
                                        <h4 className="font-semibold text-amber-900 text-sm">
                                            {isRecording ? 'Recording Voice Memory...' : 'Voice Recorder'}
                                        </h4>
                                        <p className="text-xs text-amber-700">
                                            {isRecording ? `Duration: ${formatTime(recordingTime)}` : audioUrl ? 'Recording complete!' : 'Ready to record audio memory'}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    {isRecording ? (
                                        <button
                                            type="button"
                                            onClick={stopRecording}
                                            className="flex items-center gap-1.5 px-4 py-2 bg-red-600 text-white text-xs font-semibold rounded-lg hover:bg-red-700 transition-colors"
                                        >
                                            <Square className="w-3.5 h-3.5" />
                                            Stop Recording
                                        </button>
                                    ) : audioUrl ? (
                                        <div className="flex flex-wrap items-center gap-2">
                                            <audio src={audioUrl} controls className="h-9 max-w-[200px] border border-amber-200 rounded-lg" />
                                            <button
                                                type="button"
                                                onClick={addRecordedAudio}
                                                className="px-3 py-1.5 bg-amber-700 text-white text-xs font-semibold rounded-lg hover:bg-amber-800 transition-colors"
                                            >
                                                Add to Memory
                                            </button>
                                            <button
                                                type="button"
                                                onClick={discardRecording}
                                                className="px-3 py-1.5 bg-gray-200 text-gray-700 text-xs font-semibold rounded-lg hover:bg-gray-300 transition-colors"
                                            >
                                                Discard
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-2">
                                            <button
                                                type="button"
                                                onClick={startRecording}
                                                className="flex items-center gap-1.5 px-4 py-2 bg-amber-700 text-white text-xs font-semibold rounded-lg hover:bg-amber-800 transition-colors"
                                            >
                                                <Mic className="w-3.5 h-3.5" />
                                                Start Recording
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setShowRecorder(false)}
                                                className="px-3 py-1.5 bg-gray-200 text-gray-700 text-xs font-semibold rounded-lg hover:bg-gray-300 transition-colors"
                                            >
                                                Close
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Buttons */}
                    <div className="pt-4 border-t border-gray-100 flex gap-4">
                        <button 
                            type="submit" 
                            disabled={saving || !formData.title.trim()}
                            className="px-8 py-3 bg-gradient-to-r from-amber-600 to-amber-700 text-white font-medium rounded-xl shadow-md hover:from-amber-700 hover:to-amber-800 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                        >
                            {saving ? (
                                <>
                                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                    Saving...
                                </>
                            ) : (
                                'Save Changes'
                            )}
                        </button>
                        <Link 
                            to={`/story/${id}`}
                            className="px-8 py-3 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition-colors flex items-center"
                        >
                            Cancel
                        </Link>
                    </div>
                </div>
            </form>
        </div>
    );
}
