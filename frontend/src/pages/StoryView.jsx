import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { storyService } from '../api/storyService';
import { useToast } from '../contexts/ToastContext';
import { ArrowLeft, MapPin, Calendar, Trash2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function StoryView() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { currentUser } = useAuth();
    const toast = useToast();
    const [story, setStory] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeMedia, setActiveMedia] = useState(0);

    useEffect(() => {
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

        fetchStory();
    }, [id]);

    const handleDelete = async () => {
        if (!window.confirm('Are you sure you want to delete this memory? This action cannot be undone.')) return;
        try {
            await storyService.deleteStory(id);
            toast.success('Memory deleted.');
            navigate('/dashboard');
        } catch (error) {
            console.error('Failed to delete story', error);
            toast.error('Failed to delete this memory. Please try again.');
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
                            onClick={handleDelete}
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
                        <img 
                            src={story.mediaFiles[activeMedia].mediaUrl} 
                            alt={`${story.title} - Media ${activeMedia + 1}`}
                            className="max-w-full max-h-full object-contain"
                        />
                        
                        {/* Gallery Thumbnails */}
                        {story.mediaFiles.length > 1 && (
                            <div className="absolute bottom-4 left-0 right-0 flex justify-center space-x-2 px-4">
                                {story.mediaFiles.map((media, idx) => (
                                    <button 
                                        key={media.id}
                                        onClick={() => setActiveMedia(idx)}
                                        className={`w-16 h-16 rounded-md overflow-hidden border-2 transition-all ${activeMedia === idx ? 'border-amber-500 shadow-lg scale-110' : 'border-transparent opacity-60 hover:opacity-100'}`}
                                    >
                                        <img src={media.mediaUrl} alt="" className="w-full h-full object-cover" />
                                    </button>
                                ))}
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
    );
}
