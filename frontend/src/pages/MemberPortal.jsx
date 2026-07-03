import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { storyService } from '../api/storyService';
import { familyService } from '../api/familyService';
import { useToast } from '../contexts/ToastContext';
import { PlusCircle, MapPin, Calendar, Image as ImageIcon, ArrowLeft, Lock } from 'lucide-react';

export default function MemberPortal() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { currentUser } = useAuth();
    const toast = useToast();
    
    const [member, setMember] = useState(null);
    const [stories, setStories] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPortalData = async () => {
            try {
                const memberData = await familyService.getMemberById(id);
                setMember(memberData);
                
                const storiesData = await storyService.getStoriesByMember(id);
                setStories(storiesData);
            } catch (err) {
                console.error('Failed to fetch portal data', err);
                toast.error('Could not load member portal.');
                navigate('/family-tree');
            } finally {
                setLoading(false);
            }
        };

        fetchPortalData();
    }, [id, navigate, toast]);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-700"></div>
            </div>
        );
    }

    if (!member) return null;

    return (
        <div className="max-w-7xl mx-auto py-8">
            <button 
                onClick={() => navigate('/family-tree')}
                className="flex items-center text-amber-700 hover:text-amber-800 mb-6 font-medium transition-colors"
            >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Family Tree
            </button>

            {/* Profile Header */}
            <div className="bg-white rounded-2xl shadow-sm border border-amber-100 p-8 mb-8 flex flex-col md:flex-row items-center md:items-start gap-8 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-amber-400 to-amber-600"></div>
                
                <div className="w-32 h-32 rounded-full border-4 border-amber-50 bg-amber-100 flex-shrink-0 flex items-center justify-center overflow-hidden shadow-inner">
                    {member.photoUrl ? (
                        <img src={member.photoUrl} alt={member.name} className="w-full h-full object-cover" />
                    ) : (
                        <span className="text-4xl font-bold text-amber-700">
                            {member.name.charAt(0).toUpperCase()}
                        </span>
                    )}
                </div>
                
                <div className="flex-1 text-center md:text-left">
                    <h1 className="text-4xl font-bold mb-2" style={{ color: 'var(--brand-brown-800)' }}>
                        {member.name}
                    </h1>
                    <div className="text-amber-700 font-medium mb-4 flex items-center justify-center md:justify-start gap-2">
                        <span className="px-3 py-1 bg-amber-50 rounded-full text-sm border border-amber-100">
                            {member.relationship || 'Family Member'}
                        </span>
                        {member.birthDate && (
                            <span className="text-sm text-gray-500 flex items-center">
                                <Calendar className="w-4 h-4 mr-1 inline" />
                                {member.birthDate} {member.deathDate ? `- ${member.deathDate}` : ''}
                            </span>
                        )}
                    </div>
                    {member.bio && (
                        <p className="text-gray-600 leading-relaxed max-w-2xl text-lg">
                            "{member.bio}"
                        </p>
                    )}
                </div>
                
                <div className="mt-4 md:mt-0">
                    <Link 
                        to={`/story/create?memberId=${member.id}`} 
                        className="flex items-center bg-gradient-to-r from-amber-600 to-amber-700 text-white px-5 py-2.5 rounded-xl hover:from-amber-700 hover:to-amber-800 transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                    >
                        <PlusCircle className="w-5 h-5 mr-2" />
                        Add Memory
                    </Link>
                </div>
            </div>

            <div className="mb-6 flex items-center justify-between border-b border-gray-200 pb-4">
                <h2 className="text-2xl font-bold text-gray-800">
                    Memories of {member.name.split(' ')[0]}
                </h2>
                <span className="text-gray-500 text-sm font-medium">
                    {stories.length} {stories.length === 1 ? 'Story' : 'Stories'}
                </span>
            </div>

            {stories.length === 0 ? (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-16 text-center">
                    <div className="mx-auto w-24 h-24 bg-amber-50 rounded-full flex items-center justify-center mb-6">
                        <ImageIcon className="w-12 h-12 text-amber-300" />
                    </div>
                    <h3 className="text-2xl font-medium text-gray-900 mb-3">No memories yet</h3>
                    <p className="text-gray-500 mb-8 max-w-md mx-auto text-lg">
                        Help preserve {member.name}'s legacy by adding the first memory, photo, or story.
                    </p>
                    <Link 
                        to={`/story/create?memberId=${member.id}`} 
                        className="inline-flex items-center text-amber-700 bg-amber-50 border border-amber-200 px-8 py-3 rounded-xl hover:bg-amber-100 transition-colors font-medium text-lg shadow-sm"
                    >
                        <PlusCircle className="w-5 h-5 mr-2" />
                        Write a Story
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {stories.map(story => (
                        <Link key={story.id} to={`/story/${story.id}`} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow group relative">
                            {/* Cover Image */}
                            <div className="h-48 bg-gray-200 relative overflow-hidden">
                                {story.isLocked ? (
                                    <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-amber-900/10 to-amber-955/5 text-center p-3 select-none">
                                        <Lock className="w-8 h-8 text-amber-800 mb-2" />
                                        <span className="text-[10px] font-bold text-amber-955 uppercase tracking-wider">Time Capsule Locked</span>
                                        {story.unlockDateTime && (
                                            <span className="text-[9px] text-amber-800/80 mt-1 font-mono">
                                                Opens {new Date(story.unlockDateTime).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: '2-digit' })}
                                            </span>
                                        )}
                                    </div>
                                ) : story.mediaFiles && story.mediaFiles.length > 0 ? (
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
                                <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-amber-700 transition-colors line-clamp-1 flex items-center gap-1.5">
                                    {story.title}
                                </h3>
                                
                                {story.isLocked ? (
                                    <p className="text-amber-800/60 text-xs italic mb-4 leading-relaxed flex items-center gap-1.5 bg-[#faf5e6] p-2 rounded-lg border border-amber-900/5">
                                        <Lock className="w-3.5 h-3.5 text-amber-800" />
                                        This memory is locked in a time capsule.
                                    </p>
                                ) : (
                                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                                        {story.description}
                                    </p>
                                )}
                                
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
