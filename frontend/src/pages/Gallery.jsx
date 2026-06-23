import React, { useState, useEffect, useCallback } from 'react';
import { storyService } from '../api/storyService';
import { useToast } from '../contexts/ToastContext';
import { X, ZoomIn, Film, Image as ImageIcon, Play, Music } from 'lucide-react';

export default function Gallery() {
    const [allMedia, setAllMedia] = useState([]);
    const [filter, setFilter] = useState('ALL');
    const [loading, setLoading] = useState(true);
    const [lightbox, setLightbox] = useState(null);
    const toast = useToast();

    useEffect(() => {
        const getNormalizedType = (mime) => {
            if (!mime) return 'IMAGE';
            const lowerMime = mime.toLowerCase();
            if (lowerMime.startsWith('image/') || lowerMime === 'image') return 'IMAGE';
            if (lowerMime.startsWith('video/') || lowerMime === 'video') return 'VIDEO';
            if (lowerMime.startsWith('audio/') || lowerMime === 'audio') return 'AUDIO';
            return 'IMAGE';
        };

        const load = async () => {
            try {
                const stories = await storyService.getAllStories();
                const media = stories.flatMap(story =>
                    (story.mediaFiles || []).map(m => ({
                        ...m,
                        storyTitle: story.title,
                        storyId: story.id,
                        mediaType: getNormalizedType(m.mediaType)
                    }))
                );
                setAllMedia(media);
            } catch (e) {
                console.error('Failed to load gallery', e);
                toast.error('Could not load gallery media. Please refresh.');
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    const filtered = filter === 'ALL'
        ? allMedia
        : allMedia.filter(m => m.mediaType === filter);

    const openLightbox = (item) => setLightbox(item);
    const closeLightbox = useCallback(() => setLightbox(null), []);

    // Keyboard close
    useEffect(() => {
        const handler = (e) => { if (e.key === 'Escape') closeLightbox(); };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [closeLightbox]);

    const imageCounts = allMedia.filter(m => m.mediaType === 'IMAGE').length;
    const videoCounts = allMedia.filter(m => m.mediaType === 'VIDEO').length;
    const audioCounts = allMedia.filter(m => m.mediaType === 'AUDIO').length;

    return (
        <div className="max-w-7xl mx-auto py-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-bold" style={{ color: 'var(--brand-brown-800)' }}>Media Gallery</h1>
                    <p className="text-gray-500 mt-1 text-sm">
                        {allMedia.length} items &mdash; {imageCounts} photos, {videoCounts} videos, {audioCounts} audios
                    </p>
                </div>

                {/* Filter tabs */}
                <div className="flex gap-2 bg-gray-100 p-1 rounded-xl">
                    {[
                        { key: 'ALL', label: 'All', icon: null },
                        { key: 'IMAGE', label: 'Photos', icon: <ImageIcon className="w-4 h-4" /> },
                        { key: 'VIDEO', label: 'Videos', icon: <Film className="w-4 h-4" /> },
                        { key: 'AUDIO', label: 'Audio', icon: <Music className="w-4 h-4" /> },
                    ].map(tab => (
                        <button
                            key={tab.key}
                            onClick={() => setFilter(tab.key)}
                            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
                                filter === tab.key
                                    ? 'bg-white shadow text-amber-700'
                                    : 'text-gray-500 hover:text-gray-700'
                            }`}
                        >
                            {tab.icon}
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Content */}
            {loading ? (
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-700" />
                </div>
            ) : filtered.length === 0 ? (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-16 text-center">
                    <div className="w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <ImageIcon className="w-10 h-10 text-amber-300" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-700 mb-1">No media found</h3>
                    <p className="text-gray-400 text-sm">Upload photos, videos, or audio to a story to see them here.</p>
                </div>
            ) : (
                /* Masonry-style columns */
                <div className="columns-2 sm:columns-3 lg:columns-4 gap-3 space-y-3">
                    {filtered.map((item, idx) => (
                        <div
                            key={item.id ?? idx}
                            className="break-inside-avoid group relative rounded-xl overflow-hidden cursor-pointer shadow-sm hover:shadow-md transition-shadow bg-gray-100"
                            onClick={() => openLightbox(item)}
                        >
                            {item.mediaType === 'VIDEO' ? (
                                <div className="relative aspect-video bg-gray-900">
                                    <video
                                        src={item.mediaUrl}
                                        className="w-full h-full object-cover opacity-80"
                                        muted
                                        preload="metadata"
                                    />
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <div className="w-10 h-10 rounded-full bg-black/50 flex items-center justify-center">
                                            <Play className="w-5 h-5 text-white ml-0.5" />
                                        </div>
                                    </div>
                                </div>
                            ) : item.mediaType === 'AUDIO' ? (
                                <div className="p-5 bg-gradient-to-br from-amber-50 to-amber-100 border border-amber-200 rounded-xl flex flex-col items-center justify-center gap-2 h-36">
                                    <Music className="w-8 h-8 text-amber-700 animate-bounce" style={{ animationDuration: '4s' }} />
                                    <span className="text-xs text-amber-900 font-serif font-semibold text-center truncate w-full px-1">Audio Memory</span>
                                </div>
                            ) : (
                                <img
                                    src={item.mediaUrl}
                                    alt={item.storyTitle}
                                    loading="lazy"
                                    className="w-full object-cover group-hover:scale-[1.03] transition-transform duration-300"
                                />
                            )}

                            {/* Hover overlay */}
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                                <div className="w-9 h-9 rounded-full bg-white/90 flex items-center justify-center shadow">
                                    <ZoomIn className="w-4 h-4 text-gray-800" />
                                </div>
                            </div>

                            {/* Story label */}
                            <div className="absolute bottom-0 left-0 right-0 px-2.5 py-1.5 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                                <p className="text-white text-xs font-medium truncate">{item.storyTitle}</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Lightbox */}
            {lightbox && (
                <div
                    className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-4"
                    onClick={closeLightbox}
                >
                    <button
                        className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
                        onClick={closeLightbox}
                    >
                        <X className="w-5 h-5" />
                    </button>

                    <div
                        className="relative max-w-5xl max-h-[90vh] w-full flex flex-col items-center animate-fadeIn"
                        onClick={e => e.stopPropagation()}
                    >
                        {lightbox.mediaType === 'VIDEO' ? (
                            <video
                                src={lightbox.mediaUrl}
                                controls
                                autoPlay
                                className="max-h-[80vh] rounded-xl shadow-2xl"
                            />
                        ) : lightbox.mediaType === 'AUDIO' ? (
                            <div className="w-full max-w-md p-8 bg-amber-50 rounded-2xl border border-amber-200 flex flex-col items-center gap-4 text-center mx-4 shadow-2xl z-10">
                                <div className="w-16 h-16 bg-amber-700 text-white rounded-full flex items-center justify-center shadow-lg">
                                    <Music className="w-8 h-8 animate-bounce" style={{ animationDuration: '3s' }} />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-amber-950 font-serif">{lightbox.storyTitle}</h3>
                                    <p className="text-xs text-amber-800 mt-1">Audio Memory</p>
                                </div>
                                <audio 
                                    src={lightbox.mediaUrl} 
                                    controls 
                                    autoPlay
                                    className="w-full mt-2"
                                />
                            </div>
                        ) : (
                            <img
                                src={lightbox.mediaUrl}
                                alt={lightbox.storyTitle}
                                className="max-h-[80vh] max-w-full rounded-xl shadow-2xl object-contain"
                            />
                        )}
                        <p className="text-white/70 text-sm mt-3 font-medium">{lightbox.storyTitle}</p>
                    </div>
                </div>
            )}
        </div>
    );
}
