import React, { useState, useEffect } from 'react';
import { storyService } from '../api/storyService';
import { X, Search, Check, Sparkles, Layout, BookOpen, Volume2, AlertCircle } from 'lucide-react';

export default function AutoGenerateModal({ isOpen, onClose, onGenerate }) {
    const [stories, setStories] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedStoryIds, setSelectedStoryIds] = useState([]);
    const [theme, setTheme] = useState('legacy_capsule'); // legacy_capsule, polaroid_grid, vintage_journal
    const [step, setStep] = useState(1); // 1: select, 2: theme

    useEffect(() => {
        if (isOpen) {
            const fetchStories = async () => {
                setLoading(true);
                try {
                    const data = await storyService.getAllStories();
                    setStories(data);
                } catch (err) {
                    console.error("Error loading archive", err);
                } finally {
                    setLoading(false);
                }
            };
            fetchStories();
            // Reset wizard states
            setSelectedStoryIds([]);
            setStep(1);
            setTheme('legacy_capsule');
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleToggleStory = (id) => {
        setSelectedStoryIds(prev => 
            prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
        );
    };

    const handleSelectAll = () => {
        if (selectedStoryIds.length === filteredStories.length) {
            setSelectedStoryIds([]);
        } else {
            setSelectedStoryIds(filteredStories.map(s => s.id));
        }
    };

    const handleNext = () => {
        if (selectedStoryIds.length === 0) {
            alert("Please select at least one memory to compile.");
            return;
        }
        setStep(2);
    };

    const handleBack = () => {
        setStep(1);
    };

    const triggerGeneration = () => {
        const selectedStories = stories.filter(s => selectedStoryIds.includes(s.id));
        onGenerate(selectedStories, theme);
        onClose();
    };

    const filteredStories = stories.filter(s =>
        s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.description?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-white rounded-2xl max-w-2xl w-full flex flex-col max-h-[85vh] shadow-2xl overflow-hidden border border-gray-150 animate-in fade-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-150 bg-amber-50/45 flex items-center justify-between">
                    <div>
                        <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2 font-serif">
                            <Sparkles className="w-5 h-5 text-amber-700 animate-pulse" />
                            Auto-Layout Assistant
                        </h3>
                        <p className="text-[11px] text-gray-500 mt-0.5">We will partition and place your archive onto scrapbook A4 layouts.</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1.5 hover:bg-gray-100 rounded-xl text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Progress Indicators */}
                <div className="flex bg-gray-50 border-b border-gray-100 text-[10px] uppercase font-bold tracking-wider text-gray-500">
                    <div className={`flex-1 py-2 px-6 text-center ${step === 1 ? 'bg-amber-100/50 text-amber-900 border-b-2 border-amber-700' : ''}`}>
                        1. Select Memories ({selectedStoryIds.length} chosen)
                    </div>
                    <div className={`flex-1 py-2 px-6 text-center ${step === 2 ? 'bg-amber-100/50 text-amber-900 border-b-2 border-amber-700' : ''}`}>
                        2. Choose Preset Theme
                    </div>
                </div>

                {/* Step Content */}
                <div className="flex-1 overflow-y-auto p-6 min-h-[300px]">
                    {step === 1 ? (
                        <div className="space-y-4">
                            {/* Search & Select All */}
                            <div className="flex flex-col sm:flex-row gap-3 justify-between items-center">
                                <div className="relative w-full sm:max-w-xs">
                                    <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                    <input
                                        type="text"
                                        placeholder="Search memories..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="w-full pl-9 pr-4 py-2 border border-gray-250 rounded-xl text-xs focus:border-amber-700 focus:outline-none bg-white"
                                    />
                                </div>
                                <button
                                    onClick={handleSelectAll}
                                    className="text-xs font-semibold text-amber-700 hover:text-amber-800 transition-colors w-full sm:w-auto text-right"
                                >
                                    {selectedStoryIds.length === filteredStories.length ? "Deselect All" : "Select All Available"}
                                </button>
                            </div>

                            {/* Archive list */}
                            {loading ? (
                                <div className="space-y-2 py-8 text-center text-xs text-gray-500">
                                    <div className="animate-spin rounded-full h-6 w-6 border-2 border-amber-700 border-t-transparent mx-auto mb-2"></div>
                                    Syncing with your Legacy archive...
                                </div>
                            ) : filteredStories.length === 0 ? (
                                <div className="py-12 border-2 border-dashed border-gray-200 rounded-xl text-center text-gray-400 text-xs">
                                    No matching memories found in your chest.
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[380px] overflow-y-auto pr-1">
                                    {filteredStories.map(story => {
                                        const mainImage = story.mediaFiles?.find(f => f.mediaType.includes('image'))?.mediaUrl ||
                                                          "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=200&auto=format&fit=crop";
                                        const isSelected = selectedStoryIds.includes(story.id);
                                        const hasVoice = story.mediaFiles?.some(f => f.mediaType.includes('audio') || f.mediaType.includes('video'));

                                        return (
                                            <div
                                                key={story.id}
                                                onClick={() => handleToggleStory(story.id)}
                                                className={`p-3 border rounded-xl flex gap-3 items-center justify-between cursor-pointer transition-all ${isSelected ? 'border-amber-700 bg-amber-50/30 shadow-sm' : 'border-gray-200 hover:border-gray-300'}`}
                                            >
                                                <div className="flex gap-2.5 items-center min-w-0">
                                                    <img src={mainImage} className="w-10 h-10 object-cover rounded-lg border border-gray-200 flex-shrink-0" alt="" />
                                                    <div className="min-w-0">
                                                        <p className="text-xs font-bold text-gray-800 truncate">{story.title}</p>
                                                        <p className="text-[10px] text-gray-500 truncate line-clamp-1">{story.description}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    {hasVoice && (
                                                        <Volume2 className="w-3.5 h-3.5 text-amber-700" title="Contains Voice/Video media" />
                                                    )}
                                                    <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${isSelected ? 'bg-amber-700 border-amber-750 text-white' : 'border-gray-300'}`}>
                                                        {isSelected && <Check className="w-3 h-3" />}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="space-y-5">
                            <h4 className="font-bold text-sm text-gray-850">Select Album Layout Styling Preset</h4>

                            <div className="grid grid-cols-1 gap-3">
                                {/* Preset 1: Legacy Capsule */}
                                <button
                                    onClick={() => setTheme('legacy_capsule')}
                                    className={`p-4 border rounded-2xl text-left transition-all flex gap-4 items-start cursor-pointer ${theme === 'legacy_capsule' ? 'border-amber-700 bg-amber-50/40 shadow-sm' : 'border-gray-200 hover:border-gray-300'}`}
                                >
                                    <div className="p-2.5 bg-amber-100 rounded-xl text-amber-900 mt-1 flex-shrink-0">
                                        <Sparkles className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <span className="font-bold text-sm text-amber-950 font-serif">Legacy Capsule</span>
                                            <span className="text-[9px] bg-red-150 text-red-800 font-semibold px-2 py-0.5 rounded border border-red-200 uppercase tracking-wide">Voice Optimized</span>
                                        </div>
                                        <p className="text-[11px] text-gray-600 mt-1.5 leading-relaxed">
                                            Designed for historical family voice-notes. Places polaroid photos and letter sheets styled with handwriting script, bound directly to a **wax-seal styled QR code** overlay so descendants can listen to grandmother's voice easily.
                                        </p>
                                    </div>
                                </button>

                                {/* Preset 2: Polaroid Grid */}
                                <button
                                    onClick={() => setTheme('polaroid_grid')}
                                    className={`p-4 border rounded-2xl text-left transition-all flex gap-4 items-start cursor-pointer ${theme === 'polaroid_grid' ? 'border-amber-700 bg-amber-50/40 shadow-sm' : 'border-gray-200 hover:border-gray-300'}`}
                                >
                                    <div className="p-2.5 bg-amber-100 rounded-xl text-amber-900 mt-1 flex-shrink-0">
                                        <BookOpen className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <span className="font-bold text-sm text-amber-950 font-serif">Nostalgic Polaroid Grid</span>
                                        <p className="text-[11px] text-gray-600 mt-1.5 leading-relaxed">
                                            Creates A4 grids featuring offset polaroid picture cards stuck with cute semi-transparent washi tape stickers, complete with angled titles and custom quotes.
                                        </p>
                                    </div>
                                </button>

                                {/* Preset 3: Vintage Journal */}
                                <button
                                    onClick={() => setTheme('vintage_journal')}
                                    className={`p-4 border rounded-2xl text-left transition-all flex gap-4 items-start cursor-pointer ${theme === 'vintage_journal' ? 'border-amber-700 bg-amber-50/40 shadow-sm' : 'border-gray-200 hover:border-gray-300'}`}
                                >
                                    <div className="p-2.5 bg-amber-100 rounded-xl text-amber-900 mt-1 flex-shrink-0">
                                        <Layout className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <span className="font-bold text-sm text-amber-950 font-serif">Vintage Letter Journal</span>
                                        <p className="text-[11px] text-gray-600 mt-1.5 leading-relaxed">
                                            Emulates an ancient explorer diary. Formats elements onto wood-textured pages using paper clips, large elegant serif texts, stamps, and sepia frames.
                                        </p>
                                    </div>
                                </button>
                            </div>

                            <div className="p-3 bg-amber-50/60 rounded-xl border border-amber-100 text-[10px] text-amber-800 flex items-start gap-2">
                                <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                                <p>
                                    Selected memories will be parsed sequentially. We will automatically generate pages and append them to your current scrapbook project.
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer Controls */}
                <div className="px-6 py-4 border-t border-gray-150 bg-gray-50 flex items-center justify-between">
                    <div>
                        {step === 2 && (
                            <button
                                onClick={handleBack}
                                className="px-4 py-2 border border-gray-250 text-gray-700 hover:bg-gray-100 rounded-xl transition-all text-xs font-semibold cursor-pointer"
                            >
                                Back
                            </button>
                        )}
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 border border-gray-200 text-gray-700 hover:bg-gray-150/40 rounded-xl transition-all text-xs font-semibold cursor-pointer"
                        >
                            Cancel
                        </button>
                        {step === 1 ? (
                            <button
                                onClick={handleNext}
                                className="px-5 py-2 bg-amber-700 hover:bg-amber-800 text-white rounded-xl transition-all text-xs font-bold shadow-md shadow-amber-900/10 cursor-pointer"
                            >
                                Continue to Style
                            </button>
                        ) : (
                            <button
                                onClick={triggerGeneration}
                                className="px-5 py-2 bg-amber-700 hover:bg-amber-800 text-white rounded-xl transition-all text-xs font-bold shadow-md shadow-amber-900/10 flex items-center gap-1.5 cursor-pointer"
                            >
                                <Sparkles className="w-4 h-4" />
                                Compile & Auto-Layout
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
