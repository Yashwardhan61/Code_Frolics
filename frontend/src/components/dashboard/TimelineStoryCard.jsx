import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Heart, MessageCircle, Lock } from 'lucide-react';
import MediaCarousel, { CapsuleCountdown } from './MediaCarousel';

function ReactionButton({ storyId }) {
    const [liked, setLiked] = useState(false);
    const [animating, setAnimating] = useState(false);

    const toggle = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setLiked(prev => !prev);
        if (!liked) {
            setAnimating(true);
            setTimeout(() => setAnimating(false), 500);
        }
    };

    return (
        <button
            onClick={toggle}
            className={`flex items-center text-xs transition-colors cursor-pointer ${
                liked ? 'text-red-500' : 'text-gray-400 hover:text-red-400'
            }`}
        >
            <Heart
                className={`w-4 h-4 mr-1 transition-transform duration-300 ${
                    liked ? 'fill-red-500' : ''
                } ${animating ? 'scale-150' : 'scale-100'}`}
            />
            {liked ? 1 : 0}
        </button>
    );
}

export default function TimelineStoryCard({ story, rotation = 'rotate-0', onUnlock }) {
    return (
        <Link to={`/story/${story.id}`} className="block focus:outline-none group">
            <div className={`bg-white p-3 pb-6 rounded-lg shadow-md border border-gray-100 hover:shadow-xl transition-all duration-300 transform group-hover:scale-[1.02] ${rotation}`}>
                {/* Photo Area */}
                <div className="relative aspect-[4/3] bg-gray-100 rounded overflow-hidden mb-4 border border-gray-200">
                    <MediaCarousel
                        mediaFiles={story.mediaFiles}
                        alt={story.title}
                        isLocked={story.isLocked}
                        unlockDateTime={story.unlockDateTime}
                        onUnlock={onUnlock}
                    />

                    {/* Family Member Tag */}
                    {!story.isLocked && story.familyMemberName && (
                        <div className="absolute top-3 left-3 z-30 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-xs font-semibold text-amber-800 shadow-sm">
                            {story.familyMemberName}
                        </div>
                    )}

                    {/* Time Capsule Lock Tag */}
                    {story.isLocked && (
                        <div className="absolute top-3 right-3 z-30 bg-amber-900/90 backdrop-blur px-2.5 py-1 rounded-full text-[10px] font-bold text-white shadow-sm flex items-center gap-1">
                            <Lock className="w-3 h-3 text-amber-400" />
                            Capsule
                        </div>
                    )}
                </div>

                {/* Content Area */}
                <div className="px-2">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-medium text-gray-500 italic flex items-center">
                            {story.isLocked ? 'Locked Date' : (story.storyDate || 'A timeless memory')}
                        </span>
                        {!story.isLocked && story.location && (
                            <span className="text-xs text-gray-400 flex items-center">
                                <MapPin className="w-3 h-3 mr-1" />
                                {story.location}
                            </span>
                        )}
                    </div>

                    <h3 className="text-xl font-bold text-gray-900 mb-2 font-serif group-hover:text-amber-700 transition-colors flex items-center gap-1.5">
                        {story.isLocked && <Lock className="w-4 h-4 text-amber-700 shrink-0" />}
                        {story.isLocked ? 'Locked Time Capsule' : story.title}
                    </h3>

                    {story.isLocked ? (
                        <div className="mb-4 flex flex-wrap items-center gap-2 p-2 bg-[#faf5e6] rounded-lg border border-amber-900/5">
                            <div className="flex items-center gap-1.5 text-amber-900 text-xs font-medium">
                                <Lock className="w-3.5 h-3.5 text-amber-800" />
                                Locked:
                            </div>
                            <CapsuleCountdown targetDateStr={story.unlockDateTime} onUnlock={onUnlock} />
                        </div>
                    ) : (
                        <p className="text-gray-600 text-sm line-clamp-2 mb-4 leading-relaxed font-sans">
                            {story.description}
                        </p>
                    )}

                    {/* Interaction Footer */}
                    <div className="flex items-center justify-between pt-3 border-t border-dashed border-gray-200">
                        <div className="flex items-center space-x-3">
                            <ReactionButton storyId={story.id} />
                            <span className="flex items-center text-xs text-gray-400">
                                <MessageCircle className="w-4 h-4 mr-1" /> 0
                            </span>
                        </div>
                        <div className="text-xs font-medium text-amber-700">
                            By {story.isLocked ? 'Sealed' : story.authorName?.split(' ')[0]}
                        </div>
                    </div>
                </div>
            </div>
        </Link>
    );
}
