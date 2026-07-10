import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { scrapbookService } from '../api/scrapbookService';
import { storyService } from '../api/storyService';
import { BookOpen, Plus, Trash2, Edit3, Printer, ScanLine, AlertCircle, Calendar, Image, Volume2, Video, FileText, Eye, Tag, Library } from 'lucide-react';
import FlipBookPreview from '../components/FlipBookPreview';

export default function ScrapbookList() {
    const [scrapbooks, setScrapbooks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState(null);
    const [statsLoading, setStatsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [deleteId, setDeleteId] = useState(null);
    const [previewBook, setPreviewBook] = useState(null);
    const [previewOpen, setPreviewOpen] = useState(false);
    const navigate = useNavigate();

    const handleOpenPreview = async (id) => {
        try {
            const fullBook = await scrapbookService.getScrapbookById(id);
            setPreviewBook(fullBook);
            setPreviewOpen(true);
        } catch (err) {
            console.error(err);
            alert("Failed to load scrapbook layout for 3D flipbook.");
        }
    };

    const fetchScrapbooks = async () => {
        setLoading(true);
        try {
            const data = await scrapbookService.getAllScrapbooks();
            setScrapbooks(data);
            setError(null);
        } catch (err) {
            console.error("Error loading scrapbooks", err);
            setError("Unable to load scrapbooks. Please make sure the backend server is running.");
        } finally {
            setLoading(false);
        }
    };

    const fetchStats = async () => {
        setStatsLoading(true);
        try {
            const data = await storyService.getMemoryStatistics();
            setStats(data);
        } catch (err) {
            console.error("Failed to load statistics", err);
        } finally {
            setStatsLoading(false);
        }
    };

    useEffect(() => {
        fetchScrapbooks();
        fetchStats();
    }, []);

    const handleDelete = async (id) => {
        try {
            await scrapbookService.deleteScrapbook(id);
            setScrapbooks(prev => prev.filter(item => item.id !== id));
            setDeleteId(null);
        } catch (err) {
            console.error("Failed to delete scrapbook", err);
            alert("Could not delete scrapbook. Please try again.");
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return '';
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    };

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900 flex items-center gap-2">
                        <BookOpen className="w-8 h-8 text-amber-700" />
                        Memory Scrapbooks
                    </h1>
                    <p className="mt-2 text-sm text-gray-600">
                        Design personal memory albums with templates, stickers, and scan codes for audio/video memories.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => navigate('/scrapbook/scanner')}
                        className="flex items-center gap-2 px-4 py-2 bg-amber-50 text-amber-800 border border-amber-200 rounded-xl hover:bg-amber-100 transition-all font-medium shadow-sm cursor-pointer"
                    >
                        <ScanLine className="w-4 h-4" />
                        Scan Printed Page
                    </button>
                    <button
                        onClick={() => navigate('/scrapbook/create')}
                        className="flex items-center gap-2 px-5 py-2.5 bg-amber-700 hover:bg-amber-800 text-white rounded-xl transition-all font-medium shadow-md shadow-amber-900/10 cursor-pointer"
                    >
                        <Plus className="w-5 h-5" />
                        Create Scrapbook
                    </button>
                </div>
            </div>

            {/* Nostalgic Memory Statistics Card */}
            {!statsLoading && stats && (
                <div className="mb-8 p-6 bg-gradient-to-r from-amber-50/70 to-orange-50/50 border border-amber-100 rounded-2xl shadow-sm relative overflow-hidden select-none flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-amber-200/10 rounded-full blur-2xl pointer-events-none"></div>
                    
                    {/* Left: Total Stories badge */}
                    <div className="flex items-center gap-4 border-b md:border-b-0 md:border-r border-amber-200/50 pb-4 md:pb-0 md:pr-6 flex-shrink-0 w-full md:w-auto">
                        <div className="w-14 h-14 bg-amber-700/15 rounded-full flex items-center justify-center border border-amber-800/10 shadow-inner">
                            <Library className="w-7 h-7 text-amber-800" />
                        </div>
                        <div>
                            <span className="text-[10px] text-amber-800 font-bold uppercase tracking-wider">Historical Chest</span>
                            <h3 className="text-2xl font-extrabold text-amber-950 font-serif leading-none mt-1">
                                {stats.totalStories} <span className="text-xs font-normal text-gray-500">Memories</span>
                            </h3>
                        </div>
                    </div>

                    {/* Middle: Media breakdown list */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 flex-grow w-full">
                        <div className="flex items-center gap-2">
                            <div className="p-2 bg-white rounded-lg border border-gray-100 text-amber-700 shadow-sm">
                                <Image className="w-4 h-4" />
                            </div>
                            <div>
                                <p className="text-[9px] text-gray-450 font-semibold uppercase">Photos</p>
                                <p className="text-sm font-bold text-gray-800">{stats.totalPhotos}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="p-2 bg-white rounded-lg border border-gray-100 text-amber-700 shadow-sm">
                                <Volume2 className="w-4 h-4" />
                            </div>
                            <div>
                                <p className="text-[9px] text-gray-450 font-semibold uppercase">Voice Notes</p>
                                <p className="text-sm font-bold text-gray-800">{stats.totalAudios}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="p-2 bg-white rounded-lg border border-gray-100 text-amber-700 shadow-sm">
                                <Video className="w-4 h-4" />
                            </div>
                            <div>
                                <p className="text-[9px] text-gray-450 font-semibold uppercase">Videos</p>
                                <p className="text-sm font-bold text-gray-800">{stats.totalVideos}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="p-2 bg-white rounded-lg border border-gray-100 text-amber-700 shadow-sm">
                                <FileText className="w-4 h-4" />
                            </div>
                            <div>
                                <p className="text-[9px] text-gray-450 font-semibold uppercase">Letters</p>
                                <p className="text-sm font-bold text-gray-800">{stats.totalTextOnly}</p>
                            </div>
                        </div>
                    </div>

                    {/* Right: Top tags cloud */}
                    {Object.keys(stats.topTags || {}).length > 0 && (
                        <div className="border-t md:border-t-0 md:border-l border-amber-200/50 pt-4 md:pt-0 md:pl-6 w-full md:w-56">
                            <span className="text-[10px] text-amber-800 font-bold uppercase tracking-wider flex items-center gap-1">
                                <Tag className="w-3.5 h-3.5" />
                                Top Nostalgia Tags
                            </span>
                            <div className="flex flex-wrap gap-1.5 mt-2">
                                {Object.entries(stats.topTags).map(([tag, count]) => (
                                    <span
                                        key={tag}
                                        className="text-[9px] bg-white text-amber-900 border border-amber-100 px-2 py-0.5 rounded font-medium shadow-sm"
                                    >
                                        #{tag} ({count})
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Error Message */}
            {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
                    <div>
                        <p className="font-semibold">Connection Issue</p>
                        <p className="text-sm mt-1">{error}</p>
                    </div>
                </div>
            )}

            {/* Main Content */}
            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3].map((n) => (
                        <div key={n} className="bg-white rounded-2xl border border-gray-150 p-6 animate-pulse">
                            <div className="h-48 bg-gray-100 rounded-xl mb-4"></div>
                            <div className="h-6 bg-gray-100 rounded w-3/4 mb-2"></div>
                            <div className="h-4 bg-gray-100 rounded w-1/2"></div>
                        </div>
                    ))}
                </div>
            ) : scrapbooks.length === 0 ? (
                <div className="text-center py-16 px-4 bg-white/50 border border-gray-150 rounded-2xl max-w-2xl mx-auto">
                    <div className="w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-amber-100">
                        <BookOpen className="w-8 h-8 text-amber-700 animate-bounce" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">No scrapbooks created yet</h3>
                    <p className="text-gray-500 text-sm max-w-sm mx-auto mb-6">
                        Start compiling your family stories, polaroids, and dynamic voice clips into a beautiful print-ready scrapbook.
                    </p>
                    <button
                        onClick={() => navigate('/scrapbook/create')}
                        className="px-5 py-2.5 bg-amber-700 hover:bg-amber-800 text-white rounded-xl font-semibold shadow-md transition-all cursor-pointer"
                    >
                        Design Your First Album
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {scrapbooks.map((scrapbook) => (
                        <div
                            key={scrapbook.id}
                            className="group bg-white rounded-2xl border border-gray-150 overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 flex flex-col h-full"
                        >
                            {/* Scrapbook Cover Preview */}
                            <div className="h-48 bg-gradient-to-br from-amber-800 via-amber-900 to-amber-950 p-6 relative flex flex-col justify-between select-none">
                                <div className="absolute inset-0 bg-[radial-gradient(#ffffff0a_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none"></div>
                                <div className="absolute right-4 top-4 bg-white/10 backdrop-blur-md text-[10px] text-amber-100 font-semibold px-2 py-1 rounded border border-white/10 uppercase tracking-wider">
                                    Album
                                </div>
                                <div className="border border-amber-600/35 rounded-lg p-3 flex-1 flex flex-col justify-end">
                                    <h2 className="text-xl font-bold text-amber-100 font-serif leading-tight line-clamp-2">
                                        {scrapbook.title}
                                    </h2>
                                    <div className="w-12 h-1 bg-amber-500 mt-2 rounded"></div>
                                </div>
                            </div>

                            {/* Info */}
                            <div className="p-5 flex-grow flex flex-col justify-between">
                                <div>
                                    <p className="text-xs text-gray-500 flex items-center gap-1 mb-2 font-medium">
                                        <Calendar className="w-3.5 h-3.5 text-gray-400" />
                                        Created: {formatDate(scrapbook.createdAt)}
                                    </p>
                                    <p className="text-sm text-gray-600 line-clamp-3">
                                        {scrapbook.description || "No description provided."}
                                    </p>
                                </div>

                                {/* Actions */}
                                <div className="flex items-center justify-between border-t border-gray-100 pt-4 mt-4">
                                    <button
                                        onClick={() => navigate(`/scrapbook/edit/${scrapbook.id}`)}
                                        className="flex items-center gap-1.5 text-sm font-semibold text-amber-700 hover:text-amber-800 transition-colors cursor-pointer"
                                    >
                                        <Edit3 className="w-4 h-4" />
                                        Open Editor
                                    </button>
                                    <div className="flex items-center gap-1">
                                        <button
                                            onClick={() => handleOpenPreview(scrapbook.id)}
                                            title="Realistic 3D Page Flip Preview"
                                            className="p-2 text-gray-600 hover:text-amber-700 hover:bg-amber-50 rounded-lg transition-colors cursor-pointer"
                                        >
                                            <BookOpen className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => navigate(`/scrapbook/edit/${scrapbook.id}?print=true`)}
                                            title="Print Album / Export PDF"
                                            className="p-2 text-gray-600 hover:text-amber-700 hover:bg-amber-50 rounded-lg transition-colors cursor-pointer"
                                        >
                                            <Printer className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => setDeleteId(scrapbook.id)}
                                            title="Delete Album"
                                            className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Delete Modal */}
            {deleteId && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/55 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl animate-in fade-in zoom-in-95 duration-200">
                        <h3 className="text-lg font-bold text-gray-900 mb-2">Delete Scrapbook</h3>
                        <p className="text-gray-600 text-sm mb-6">
                            Are you sure you want to permanently delete this scrapbook? This action cannot be undone.
                        </p>
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setDeleteId(null)}
                                className="px-4 py-2 border border-gray-200 rounded-xl text-gray-700 font-semibold hover:bg-gray-50 transition-colors cursor-pointer"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => handleDelete(deleteId)}
                                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl font-semibold transition-colors cursor-pointer"
                            >
                                Delete Permanent
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {/* FlipBook 3D Preview Modal */}
            {previewOpen && previewBook && (
                <FlipBookPreview
                    isOpen={previewOpen}
                    onClose={() => { setPreviewOpen(false); setPreviewBook(null); }}
                    title={previewBook.title}
                    pages={JSON.parse(previewBook.canvasData || '{"pages":[]}').pages || []}
                    backgrounds={[
                        { id: 'parchment', name: 'Vintage Parchment', style: { backgroundColor: '#FDFBF7', backgroundImage: 'radial-gradient(#ecdab9 1px, transparent 1px)', backgroundSize: '24px 24px' } },
                        { id: 'kraft', name: 'Kraft Cardboard', style: { backgroundColor: '#EADBC8', backgroundImage: 'linear-gradient(rgba(0,0,0,0.05) 1px, transparent 1px)', backgroundSize: '100% 20px' } },
                        { id: 'grid', name: 'School Journal Grid', style: { backgroundColor: '#F4F6F9', backgroundImage: 'linear-gradient(#e1e5eb 1px, transparent 1px), linear-gradient(90deg, #e1e5eb 1px, transparent 1px)', backgroundSize: '20px 20px' } },
                        { id: 'pastel-rose', name: 'Blush Rose', style: { backgroundColor: '#FFF5F5', backgroundImage: 'radial-gradient(#ffd5d5 1.5px, transparent 1.5px)', backgroundSize: '30px 30px' } },
                        { id: 'vintage-wood', name: 'Antique Wood', style: { backgroundColor: '#DFC15D', backgroundImage: 'repeating-linear-gradient(45deg, #ccae49 0px, #ccae49 10px, #ccae49 10px, #ccae49 20px, #DFC15D 20px, #DFC15D 40px)' } }
                    ]}
                />
            )}
        </div>
    );
}
