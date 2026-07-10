import React, { useState, useEffect, useCallback } from 'react';
import { storyService } from '../api/storyService';
import { useToast } from '../contexts/ToastContext';
import { X, ZoomIn, Film, Image as ImageIcon, Play, Volume2 } from 'lucide-react';

export default function Gallery() {
    const [allMedia, setAllMedia] = useState([]);
    const [filter, setFilter] = useState('ALL');
    const [loading, setLoading] = useState(true);
    const [lightbox, setLightbox] = useState(null);
    const toast = useToast();

    useEffect(() => {
        const load = async () => {
            try {
                const stories = await storyService.getAllStories();
                const media = stories.flatMap(story =>
                    (story.mediaFiles || []).map(m => ({
                        ...m,
                        storyTitle: story.title,
                        storyId: story.id,
                        mediaType: m.mediaType || 'IMAGE'
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
        : allMedia.filter(m => m.mediaType?.startsWith(filter));

    const openLightbox = (item) => setLightbox(item);
    const closeLightbox = useCallback(() => setLightbox(null), []);

    // Keyboard close
    useEffect(() => {
        const handler = (e) => { if (e.key === 'Escape') closeLightbox(); };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [closeLightbox]);

    const imageCounts = allMedia.filter(m => m.mediaType?.startsWith('image')).length;
    const videoCounts = allMedia.filter(m => m.mediaType?.startsWith('video')).length;
    const audioCounts = allMedia.filter(m => m.mediaType?.startsWith('audio')).length;

    return (
        <div className="max-w-7xl mx-auto py-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-bold" style={{ color: 'var(--brand-brown-800)' }}>Media Gallery</h1>
                    <p className="text-gray-500 mt-1 text-sm">
                        {allMedia.length} items &mdash; {imageCounts} photos, {videoCounts} videos, {audioCounts} voice notes
                    </p>
                </div>

                {/* Filter tabs */}
                <div className="flex gap-2 bg-gray-100 p-1 rounded-xl">
                    {[
                        { key: 'ALL', label: 'All', icon: null },
                        { key: 'image', label: 'Photos', icon: <ImageIcon className="w-4 h-4" /> },
                        { key: 'video', label: 'Videos', icon: <Film className="w-4 h-4" /> },
                        { key: 'audio', label: 'Voice Notes', icon: <Volume2 className="w-4 h-4" /> },
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
                    <p className="text-gray-400 text-sm">Upload photos or videos to a story to see them here.</p>
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
                            {item.mediaType?.startsWith('video') ? (
                                <div className="relative aspect-video bg-gradient-to-br from-slate-800 via-slate-900 to-slate-950 flex flex-col items-center justify-center p-4 text-white select-none overflow-hidden group-hover:scale-[1.03] transition-transform duration-300">
                                    <div className="absolute top-2 left-2 right-2 flex justify-between opacity-30 text-[8px] tracking-widest font-mono">
                                        <span>00:00:00</span>
                                        <span>16:9 REC</span>
                                    </div>
                                    <div className="w-10 h-10 rounded-full bg-white/10 border border-white/20 flex items-center justify-center mb-1.5 shadow-md">
                                        <Film className="w-5 h-5 text-amber-500 animate-pulse" />
                                    </div>
                                    <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest">Video Memory</span>
                                </div>
                            ) : item.mediaType?.startsWith('audio') ? (
                                <div className="relative aspect-square bg-gradient-to-br from-amber-950 via-amber-900 to-amber-950 flex flex-col items-center justify-center p-4 text-white select-none group-hover:scale-[1.03] transition-transform duration-300">
                                    <div className="w-10 h-10 rounded-full bg-white/15 border border-white/20 flex items-center justify-center mb-1.5 shadow-md">
                                        <Volume2 className="w-5 h-5 text-amber-400 animate-bounce" />
                                    </div>
                                    <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest">Voice Note</span>
                                    
                                    <div className="flex items-center gap-0.5 mt-2 h-3 justify-center opacity-65">
                                        <span className="w-[1.5px] bg-amber-400 rounded-full h-2.5"></span>
                                        <span className="w-[1.5px] bg-amber-300 rounded-full h-4"></span>
                                        <span className="w-[1.5px] bg-amber-400 rounded-full h-5"></span>
                                        <span className="w-[1.5px] bg-amber-300 rounded-full h-4"></span>
                                        <span className="w-[1.5px] bg-amber-400 rounded-full h-2.5"></span>
                                    </div>
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
                        className="relative max-w-5xl max-h-[90vh] w-full flex flex-col items-center"
                        onClick={e => e.stopPropagation()}
                    >
                        {lightbox.mediaType?.startsWith('video') ? (
                            <video
                                src={lightbox.mediaUrl}
                                controls
                                autoPlay
                                className="max-h-[70vh] w-auto rounded-2xl shadow-2xl border border-white/15 bg-black"
                            />
                        ) : lightbox.mediaType?.startsWith('audio') ? (
                            <div className="bg-gradient-to-br from-amber-950 via-stone-900 to-black p-8 rounded-3xl border border-amber-900/20 shadow-2xl flex flex-col items-center justify-center w-full max-w-md text-white animate-in zoom-in-95 duration-200">
                                <div className="w-18 h-18 rounded-full bg-amber-700/10 border border-amber-500/20 flex items-center justify-center mb-6 shadow-inner relative">
                                    <Volume2 className="w-8 h-8 text-amber-400 animate-pulse z-10" />
                                    <div className="absolute inset-0 rounded-full bg-amber-500/5 animate-ping opacity-60"></div>
                                </div>
                                
                                <h4 className="text-lg font-bold text-amber-100 tracking-wide mb-1">Voice Memory</h4>
                                <p className="text-amber-500/60 text-xs uppercase tracking-widest font-semibold mb-6">Audio Playback</p>
                                
                                <audio
                                    src={lightbox.mediaUrl}
                                    controls
                                    autoPlay
                                    className="w-full accent-amber-600 rounded-xl"
                                />
                            </div>
                        ) : (
                            <img
                                src={lightbox.mediaUrl}
                                alt={lightbox.storyTitle}
                                className="max-h-[70vh] max-w-full rounded-2xl shadow-2xl object-contain border border-white/10"
                            />
                        )}
                        <p className="text-white/70 text-sm mt-3 font-medium">{lightbox.storyTitle}</p>
                    </div>
                </div>
            )}
        </div>
    );
}
