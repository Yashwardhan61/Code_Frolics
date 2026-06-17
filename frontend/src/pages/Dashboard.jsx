import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { storyService } from '../api/storyService';
import { useToast } from '../contexts/ToastContext';
import { PlusCircle, MapPin, Calendar, Image as ImageIcon } from 'lucide-react';

export default function Dashboard() {
    const { currentUser } = useAuth();
    const toast = useToast();
    const [stories, setStories] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStories = async () => {
            try {
                const data = await storyService.getAllStories();
                setStories(data);
            } catch (err) {
                console.error('Failed to fetch stories', err);
                toast.error('Could not load stories. Please refresh and try again.');
            } finally {
                setLoading(false);
            }
        };

        fetchStories();
    }, []);

    return (
        <div className="max-w-7xl mx-auto py-8">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold" style={{ color: 'var(--brand-brown-800)' }}>
                        Welcome back, {currentUser?.displayName || 'Explorer'}
                    </h1>
                    <p className="text-gray-600 mt-2">Here are your family's recent memories</p>
                </div>
                <Link 
                    to="/story/create" 
                    className="flex items-center bg-gradient-to-r from-amber-600 to-amber-700 text-white px-4 py-2 rounded-lg hover:from-amber-700 hover:to-amber-800 transition-colors shadow-md"
                >
                    <PlusCircle className="w-5 h-5 mr-2" />
                    New Memory
                </Link>
            </div>

            {loading ? (
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-700"></div>
                </div>
            ) : stories.length === 0 ? (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
                    <div className="mx-auto w-24 h-24 bg-amber-50 rounded-full flex items-center justify-center mb-4">
                        <ImageIcon className="w-12 h-12 text-amber-600" />
                    </div>
                    <h3 className="text-xl font-medium text-gray-900 mb-2">No memories yet</h3>
                    <p className="text-gray-500 mb-6 max-w-md mx-auto">
                        Your treasure chest is empty. Start adding your precious family memories to share them with your loved ones.
                    </p>
                    <Link 
                        to="/story/create" 
                        className="inline-flex items-center text-amber-700 bg-amber-50 px-6 py-3 rounded-xl hover:bg-amber-100 transition-colors font-medium"
                    >
                        <PlusCircle className="w-5 h-5 mr-2" />
                        Create your first memory
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {stories.map(story => (
                        <Link key={story.id} to={`/story/${story.id}`} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow group">
                            {/* Cover Image */}
                            <div className="h-48 bg-gray-200 relative overflow-hidden">
                                {story.mediaFiles && story.mediaFiles.length > 0 ? (
                                    <img 
                                        src={story.mediaFiles[0].mediaUrl} 
                                        alt={story.title} 
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-amber-50 to-amber-100">
                                        <ImageIcon className="w-12 h-12 text-amber-300" />
                                    </div>
                                )}
                            </div>
                            
                            {/* Content */}
                            <div className="p-5">
                                <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-amber-700 transition-colors line-clamp-1">
                                    {story.title}
                                </h3>
                                
                                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                                    {story.description}
                                </p>
                                
                                <div className="flex items-center text-xs text-gray-500 space-x-4">
                                    {story.storyDate && (
                                        <span className="flex items-center">
                                            <Calendar className="w-3.5 h-3.5 mr-1" />
                                            {story.storyDate}
                                        </span>
                                    )}
                                    {story.location && (
                                        <span className="flex items-center">
                                            <MapPin className="w-3.5 h-3.5 mr-1" />
                                            {story.location}
                                        </span>
                                    )}
                                </div>
                                
                                <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
                                    <div className="flex items-center">
                                        <div className="w-6 h-6 rounded-full bg-amber-100 flex items-center justify-center text-amber-700 font-bold text-xs mr-2 overflow-hidden">
                                            {story.authorPhotoUrl ? (
                                                <img src={story.authorPhotoUrl} alt={story.authorName} className="w-full h-full object-cover" />
                                            ) : (
                                                story.authorName?.charAt(0).toUpperCase()
                                            )}
                                        </div>
                                        <span className="text-xs font-medium text-gray-700">{story.authorName}</span>
                                    </div>
                                    <div className="flex space-x-1">
                                        {story.tags?.slice(0, 2).map(tag => (
                                            <span key={tag} className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-[10px] font-medium">
                                                #{tag}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}
