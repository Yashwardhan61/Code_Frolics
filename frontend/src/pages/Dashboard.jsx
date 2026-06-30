import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { storyService } from '../api/storyService';
import { friendService } from '../api/friendService';
import { profileService } from '../api/profileService';
import { useToast } from '../contexts/ToastContext';
import { 
    PlusCircle, MapPin, Calendar, Image as ImageIcon, Music, Film, 
    Search, SlidersHorizontal, ArrowUpDown, RefreshCw, ChevronLeft, 
    ChevronRight, BookOpen, User, Tag, Eye 
} from 'lucide-react';

export default function Dashboard() {
    const { currentUser } = useAuth();
    const toast = useToast();

    // Search and filter states
    const [searchQuery, setSearchQuery] = useState('');
    const [debouncedQuery, setDebouncedQuery] = useState('');
    const [showFilters, setShowFilters] = useState(false);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [authorId, setAuthorId] = useState('');
    const [mediaType, setMediaType] = useState(''); // Photos, Videos, Audio, Text
    const [selectedTags, setSelectedTags] = useState([]);
    const [locationFilter, setLocationFilter] = useState('');
    const [sort, setSort] = useState('newest'); // newest, oldest, views, recent
    const [page, setPage] = useState(0);

    // Results and metadata states
    const [stories, setStories] = useState([]);
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);
    const [loading, setLoading] = useState(true);
    const [familyMembers, setFamilyMembers] = useState([]);

    const availableTags = [
        'Childhood', 'Festival', 'Wedding', 'Travel', 
        'Birthday', 'School', 'Parents', 'Grandparents'
    ];

    // Debounce search query input
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedQuery(searchQuery);
            setPage(0); // Reset page on search change
        }, 450);
        return () => clearTimeout(handler);
    }, [searchQuery]);

    // Fetch family circle members (current user + friends list)
    useEffect(() => {
        const fetchFamily = async () => {
            try {
                const profile = await profileService.getProfile();
                const friends = await friendService.getFriends();
                const list = [];
                if (profile && profile.id) {
                    list.push({ userId: profile.id, displayName: `${profile.displayName || 'Me'} (Me)` });
                }
                friends.forEach(f => {
                    if (f.userId) {
                        list.push({ userId: f.userId, displayName: f.displayName || f.email });
                    }
                });
                // De-duplicate list
                const uniqueList = list.filter((v, i, a) => a.findIndex(t => t.userId === v.userId) === i);
                setFamilyMembers(uniqueList);
            } catch (err) {
                console.error('Failed to load friends list', err);
            }
        };
        if (currentUser) fetchFamily();
    }, [currentUser]);

    // Fetch memories/stories with active search and filters
    const fetchStories = async () => {
        setLoading(true);
        try {
            const params = {
                page: page,
                size: 6, // 6 memories per page
                sort: sort
            };
            if (debouncedQuery) params.query = debouncedQuery;
            if (startDate) params.startDate = startDate;
            if (endDate) params.endDate = endDate;
            if (authorId) params.authorId = authorId;
            if (mediaType) params.mediaType = mediaType;
            if (selectedTags.length > 0) params.tags = selectedTags.join(',');
            if (locationFilter) params.location = locationFilter;

            const data = await storyService.searchStories(params);
            setStories(data.content || []);
            setTotalPages(data.totalPages || 0);
            setTotalElements(data.totalElements || 0);
        } catch (err) {
            console.error('Failed to fetch filtered stories', err);
            toast.error('Could not load memories. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    // Re-fetch stories when search/filter/page state changes
    useEffect(() => {
        fetchStories();
    }, [debouncedQuery, startDate, endDate, authorId, mediaType, selectedTags, locationFilter, sort, page]);

    const handleClearFilters = () => {
        setSearchQuery('');
        setStartDate('');
        setEndDate('');
        setAuthorId('');
        setMediaType('');
        setSelectedTags([]);
        setLocationFilter('');
        setSort('newest');
        setPage(0);
        toast.info('All filters cleared.');
    };

    const handleQuickDateFilter = (type) => {
        const today = new Date();
        const todayStr = today.toISOString().split('T')[0];
        setEndDate(todayStr);
        setPage(0);

        if (type === 'today') {
            setStartDate(todayStr);
        } else if (type === 'month') {
            const firstOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
            setStartDate(firstOfMonth.toISOString().split('T')[0]);
        } else if (type === 'year') {
            const firstOfYear = new Date(today.getFullYear(), 0, 1);
            setStartDate(firstOfYear.toISOString().split('T')[0]);
        }
    };

    const toggleTag = (tag) => {
        setPage(0);
        setSelectedTags(prev => 
            prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
        );
    };

    // Keyword highlighter helper function
    const highlightText = (text, searchWord) => {
        if (!text) return "";
        if (!searchWord || !searchWord.trim()) return text;
        
        // Escape special regex chars
        const escapedWord = searchWord.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const regex = new RegExp(`(${escapedWord})`, 'gi');
        const parts = text.split(regex);
        return (
            <span>
                {parts.map((part, i) => 
                    regex.test(part) ? (
                        <mark key={i} className="vintage-highlight">{part}</mark>
                    ) : (
                        part
                    )
                )}
            </span>
        );
    };

    return (
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 vintage-serif">
            {/* Header section with book/diary feel */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 pb-6 border-b-2 border-amber-200/60 relative">
                <div className="paperclip-decoration hidden md:block"></div>
                <div>
                    <h1 className="text-4xl font-bold tracking-tight text-amber-900 flex items-center gap-2">
                        <BookOpen className="w-8 h-8 text-amber-700" />
                        Yaado Ka Baksa
                    </h1>
                    <p className="text-amber-800/70 mt-2 font-serif italic text-sm">
                        Flipping through the pages of your family's history...
                    </p>
                </div>
                <Link 
                    to="/story/create" 
                    className="mt-4 md:mt-0 flex items-center bg-gradient-to-b from-amber-700 to-amber-800 hover:from-amber-800 hover:to-amber-900 text-amber-50 border border-amber-900 px-5 py-2.5 rounded-lg transition-all duration-300 shadow-md font-medium text-sm"
                >
                    <PlusCircle className="w-5 h-5 mr-2" />
                    New Memory
                </Link>
            </div>

            {/* Global Search Bar */}
            <div className="flex gap-4 mb-6">
                <div className="relative flex-grow">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-amber-700/60" />
                    <input 
                        type="text"
                        placeholder="Search by title, description, tags, location or author..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 rounded-xl vintage-search-bar focus:outline-none focus:border-amber-700 transition-all font-serif shadow-sm text-sm"
                    />
                </div>
                <button
                    onClick={() => setShowFilters(!showFilters)}
                    className={`flex items-center px-4 py-3 rounded-xl border transition-all duration-300 font-medium text-sm ${
                        showFilters 
                            ? 'bg-amber-100 border-amber-700 text-amber-900 shadow-sm' 
                            : 'bg-[#fbf8f3] border-amber-200/50 text-amber-800 hover:bg-amber-50'
                    }`}
                >
                    <SlidersHorizontal className="w-5 h-5 mr-2 text-amber-700" />
                    Filters
                </button>
            </div>

            <div className="flex flex-col lg:flex-row gap-8 items-start">
                {/* Vintage Collapsible Sidebar */}
                {showFilters && (
                    <div className="w-full lg:w-80 vintage-sidebar p-6 rounded-2xl border border-amber-200 bg-[#faf6f0] shrink-0 animate-in slide-in-from-left duration-300">
                        <div className="flex justify-between items-center mb-6 pb-2 border-b border-amber-200">
                            <h3 className="text-lg font-bold text-amber-900 flex items-center gap-2">
                                <SlidersHorizontal className="w-4 h-4 text-amber-700" />
                                Archive Filters
                            </h3>
                            <button 
                                onClick={handleClearFilters}
                                className="text-xs text-amber-700 hover:text-amber-900 hover:underline flex items-center gap-1 font-medium"
                            >
                                <RefreshCw className="w-3 h-3" />
                                Clear All
                            </button>
                        </div>

                        {/* Date Range Filter */}
                        <div className="mb-6">
                            <h4 className="text-xs font-bold uppercase tracking-wider text-amber-800 mb-2 flex items-center gap-1.5">
                                <Calendar className="w-4 h-4 text-amber-700" />
                                Date Range
                            </h4>
                            <div className="grid grid-cols-3 gap-1 mb-3">
                                <button 
                                    onClick={() => handleQuickDateFilter('today')}
                                    className="px-2 py-1 text-[10px] rounded bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 font-serif"
                                >
                                    Today
                                </button>
                                <button 
                                    onClick={() => handleQuickDateFilter('month')}
                                    className="px-2 py-1 text-[10px] rounded bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 font-serif"
                                >
                                    This Month
                                </button>
                                <button 
                                    onClick={() => handleQuickDateFilter('year')}
                                    className="px-2 py-1 text-[10px] rounded bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 font-serif"
                                >
                                    This Year
                                </button>
                            </div>
                            <div className="space-y-2 mt-2">
                                <div>
                                    <label className="text-[9px] text-amber-800/70 font-bold block mb-1">FROM</label>
                                    <input 
                                        type="date"
                                        value={startDate}
                                        onChange={(e) => { setStartDate(e.target.value); setPage(0); }}
                                        className="w-full text-xs p-2 rounded border border-amber-200 bg-[#fdfbf7] text-amber-900 focus:outline-none focus:border-amber-700"
                                    />
                                </div>
                                <div>
                                    <label className="text-[9px] text-amber-800/70 font-bold block mb-1">TO</label>
                                    <input 
                                        type="date"
                                        value={endDate}
                                        onChange={(e) => { setEndDate(e.target.value); setPage(0); }}
                                        className="w-full text-xs p-2 rounded border border-amber-200 bg-[#fdfbf7] text-amber-900 focus:outline-none focus:border-amber-700"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Media Type Checkboxes */}
                        <div className="mb-6">
                            <h4 className="text-xs font-bold uppercase tracking-wider text-amber-800 mb-2 flex items-center gap-1.5">
                                <Film className="w-4 h-4 text-amber-700" />
                                Media Type
                            </h4>
                            <div className="space-y-2">
                                {['Photos', 'Videos', 'Audio', 'Text'].map(type => (
                                    <label key={type} className="flex items-center text-sm text-amber-900/80 hover:text-amber-900 cursor-pointer font-serif">
                                        <input 
                                            type="checkbox"
                                            checked={mediaType === type}
                                            onChange={() => {
                                                setMediaType(mediaType === type ? '' : type);
                                                setPage(0);
                                            }}
                                            className="w-4 h-4 rounded text-amber-700 border-amber-300 focus:ring-amber-500 mr-2 bg-[#fdfbf7]"
                                        />
                                        {type}
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Family Member Dropdown */}
                        <div className="mb-6">
                            <h4 className="text-xs font-bold uppercase tracking-wider text-amber-800 mb-2 flex items-center gap-1.5">
                                <User className="w-4 h-4 text-amber-700" />
                                Family Member
                            </h4>
                            <select
                                value={authorId}
                                onChange={(e) => { setAuthorId(e.target.value); setPage(0); }}
                                className="w-full text-xs p-2.5 rounded border border-amber-200 bg-[#fdfbf7] text-amber-900 focus:outline-none focus:border-amber-700 font-serif"
                            >
                                <option value="">All Family Members</option>
                                {familyMembers.map(m => (
                                    <option key={m.userId} value={m.userId}>{m.displayName}</option>
                                ))}
                            </select>
                        </div>

                        {/* Multi-select Tags */}
                        <div className="mb-6">
                            <h4 className="text-xs font-bold uppercase tracking-wider text-amber-800 mb-2 flex items-center gap-1.5">
                                <Tag className="w-4 h-4 text-amber-700" />
                                Tags
                            </h4>
                            <div className="flex flex-wrap gap-1.5">
                                {availableTags.map(tag => {
                                    const isSelected = selectedTags.includes(tag);
                                    return (
                                        <button
                                            key={tag}
                                            onClick={() => toggleTag(tag)}
                                            className={`px-2.5 py-1 text-[10px] rounded-full border transition-all duration-200 ${
                                                isSelected 
                                                    ? 'bg-amber-700 border-amber-900 text-amber-50 shadow-sm' 
                                                    : 'bg-[#fdfbf7] border-amber-200 text-amber-800 hover:bg-amber-50/50'
                                            }`}
                                        >
                                            {tag}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Searchable Location input */}
                        <div className="mb-6">
                            <h4 className="text-xs font-bold uppercase tracking-wider text-amber-800 mb-2 flex items-center gap-1.5">
                                <MapPin className="w-4 h-4 text-amber-700" />
                                Location
                            </h4>
                            <div className="relative">
                                <MapPin className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-amber-700/60" />
                                <input 
                                    type="text"
                                    placeholder="Search location..."
                                    value={locationFilter}
                                    onChange={(e) => { setLocationFilter(e.target.value); setPage(0); }}
                                    className="w-full pl-9 pr-2 py-2 text-xs rounded border border-amber-200 bg-[#fdfbf7] text-amber-900 placeholder-amber-800/30 focus:outline-none focus:border-amber-700 font-serif"
                                />
                            </div>
                        </div>

                        {/* Sorting Selection */}
                        <div>
                            <h4 className="text-xs font-bold uppercase tracking-wider text-amber-800 mb-2 flex items-center gap-1.5">
                                <ArrowUpDown className="w-4 h-4 text-amber-700" />
                                Sort By
                            </h4>
                            <select
                                value={sort}
                                onChange={(e) => { setSort(e.target.value); setPage(0); }}
                                className="w-full text-xs p-2.5 rounded border border-amber-200 bg-[#fdfbf7] text-amber-900 focus:outline-none focus:border-amber-700 font-serif"
                            >
                                <option value="newest">Newest First</option>
                                <option value="oldest">Oldest First</option>
                                <option value="views">Most Viewed</option>
                                <option value="recent">Recently Added</option>
                            </select>
                        </div>
                    </div>
                )}

                {/* Memories Result Grid */}
                <div className="flex-grow w-full">
                    {/* Active Filters Bar */}
                    <div className="flex justify-between items-center mb-4">
                        <span className="text-sm text-amber-850 italic font-serif">
                            {loading ? 'Flipping pages...' : `${totalElements} matching ${totalElements === 1 ? 'memory' : 'memories'} found`}
                        </span>
                        
                        {/* Quick Active Tags indicator */}
                        {(searchQuery || startDate || endDate || authorId || mediaType || selectedTags.length > 0 || locationFilter) && (
                            <button
                                onClick={handleClearFilters}
                                className="text-xs text-amber-700 hover:text-amber-900 hover:underline flex items-center gap-1 font-semibold"
                            >
                                <RefreshCw className="w-3.5 h-3.5 animate-spin-hover" />
                                Reset Search
                            </button>
                        )}
                    </div>

                    {loading ? (
                        <div className="flex justify-center items-center h-80">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-800"></div>
                        </div>
                    ) : stories.length === 0 ? (
                        /* Vintage Empty State */
                        <div className="flex flex-col items-center justify-center p-12 bg-[#fcfaf6] rounded-3xl border border-amber-200/60 shadow-inner text-center max-w-2xl mx-auto my-8">
                            <svg className="w-36 h-36 mb-6 text-amber-800/70" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="2.5">
                                <path d="M20 15h50a8 8 0 0 1 8 8v50a8 8 0 0 1-8 8H20v-66z" fill="#f5eedc" stroke="#5a3509" strokeWidth="3" />
                                <path d="M20 15v66c0-2-3-4-5-4s-5 2-5 4v-66c0 2 3 4 5 4s5-2 5-4z" fill="#e9d8c8" stroke="#5a3509" strokeWidth="3" />
                                <line x1="28" y1="28" x2="65" y2="28" stroke="#704214" strokeWidth="2" strokeLinecap="round" />
                                <line x1="28" y1="38" x2="55" y2="38" stroke="#704214" strokeWidth="2" strokeLinecap="round" />
                                <line x1="28" y1="48" x2="60" y2="48" stroke="#704214" strokeWidth="2" strokeLinecap="round" />
                                <circle cx="65" cy="62" r="16" fill="rgba(255,255,255,0.7)" stroke="#8b5628" strokeWidth="3" />
                                <line x1="76" y1="73" x2="90" y2="87" stroke="#5a3509" strokeWidth="5" strokeLinecap="round" />
                            </svg>
                            <h3 className="text-2xl font-bold text-amber-900 mb-2 font-serif">No memories found</h3>
                            <p className="text-amber-800/60 mb-6 font-serif max-w-sm">
                                "History is silent on this page." Try loosening your search criteria or tags.
                            </p>
                            <button
                                onClick={handleClearFilters}
                                className="px-5 py-2.5 bg-gradient-to-b from-amber-700 to-amber-800 hover:from-amber-800 hover:to-amber-900 text-amber-50 rounded-lg border border-amber-900 shadow-md font-medium font-serif"
                            >
                                Clear Filters
                            </button>
                        </div>
                    ) : (
                        /* Grid of vintage styled paper cards */
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {stories.map(story => (
                                <Link 
                                    key={story.id} 
                                    to={`/story/${story.id}`} 
                                    className="vintage-paper-card overflow-hidden group flex flex-col justify-between"
                                >
                                    {/* Cover Image/Thumbnail */}
                                    <div className="h-44 bg-[#eae3d5] relative overflow-hidden border-b border-amber-100">
                                        {story.mediaFiles && story.mediaFiles.length > 0 ? (
                                            (() => {
                                                const firstMedia = story.mediaFiles[0];
                                                const isAudio = firstMedia.mediaType?.startsWith('audio/') || firstMedia.mediaUrl?.endsWith('.webm') || firstMedia.mediaUrl?.endsWith('.wav') || firstMedia.mediaUrl?.endsWith('.mp3');
                                                const isVideo = firstMedia.mediaType?.startsWith('video/');
                                                
                                                if (isAudio) {
                                                    return (
                                                        <div className="w-full h-full flex flex-col items-center justify-center p-4">
                                                            <Music className="w-10 h-10 text-amber-800 mb-2 group-hover:scale-110 transition-transform duration-300" />
                                                            <span className="text-[10px] text-amber-950 font-semibold font-serif uppercase tracking-wider">Voice Recording</span>
                                                        </div>
                                                    );
                                                }
                                                
                                                if (isVideo) {
                                                    return (
                                                        <div className="w-full h-full relative">
                                                            <video 
                                                                src={firstMedia.mediaUrl} 
                                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                                                muted
                                                                preload="metadata"
                                                            />
                                                            <div className="absolute top-2 right-2 bg-black/60 text-white rounded-full p-1.5 shadow z-10">
                                                                <Film className="w-3.5 h-3.5" />
                                                            </div>
                                                        </div>
                                                    );
                                                }

                                                return (
                                                    <img 
                                                        src={firstMedia.mediaUrl} 
                                                        alt={story.title} 
                                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                                    />
                                                );
                                            })()
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center">
                                                <ImageIcon className="w-12 h-12 text-amber-800/20" />
                                            </div>
                                        )}
                                        
                                        {/* Media type overlay icon */}
                                        <div className="absolute bottom-2 left-2 bg-amber-955/80 text-amber-100 px-2 py-0.5 rounded text-[10px] flex items-center gap-1 font-serif">
                                            {story.mediaFiles && story.mediaFiles.length > 0 ? (
                                                story.mediaFiles[0].mediaType?.startsWith('audio/') ? (
                                                    <><Music className="w-3 h-3 text-amber-200" /> Audio</>
                                                ) : story.mediaFiles[0].mediaType?.startsWith('video/') ? (
                                                    <><Film className="w-3 h-3 text-amber-200" /> Video</>
                                                ) : (
                                                    <><ImageIcon className="w-3 h-3 text-amber-200" /> Photo</>
                                                )
                                            ) : (
                                                <><BookOpen className="w-3 h-3 text-amber-200" /> Text</>
                                            )}
                                        </div>
                                    </div>
                                    
                                    {/* Card Content */}
                                    <div className="p-5 flex-grow flex flex-col justify-between">
                                        <div>
                                            <h3 className="text-lg font-bold text-amber-950 mb-2 group-hover:text-amber-800 transition-colors line-clamp-1">
                                                {highlightText(story.title, searchQuery)}
                                            </h3>
                                            
                                            <p className="text-amber-900/70 text-xs font-serif mb-4 line-clamp-2 leading-relaxed">
                                                {highlightText(story.description, searchQuery)}
                                            </p>
                                        </div>
                                        
                                        <div className="space-y-3 mt-4 pt-3 border-t border-amber-200/50">
                                            <div className="flex justify-between items-center text-[10px] text-amber-800/70 font-serif">
                                                {story.storyDate ? (
                                                    <span className="flex items-center">
                                                        <Calendar className="w-3 h-3 mr-1 text-amber-700" />
                                                        {story.storyDate}
                                                    </span>
                                                ) : <span></span>}
                                                {story.location && (
                                                    <span className="flex items-center max-w-[120px] truncate">
                                                        <MapPin className="w-3 h-3 mr-1 text-amber-700" />
                                                        {highlightText(story.location, searchQuery)}
                                                    </span>
                                                )}
                                            </div>
                                            
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center">
                                                    <div className="w-5 h-5 rounded-full bg-amber-200/60 border border-amber-900/10 flex items-center justify-center text-amber-950 font-bold text-[10px] mr-1.5 overflow-hidden">
                                                        {story.authorPhotoUrl ? (
                                                            <img src={story.authorPhotoUrl} alt={story.authorName} className="w-full h-full object-cover" />
                                                        ) : (
                                                            story.authorName?.charAt(0).toUpperCase()
                                                        )}
                                                    </div>
                                                    <span className="text-[10px] font-medium text-amber-900/80 truncate max-w-[90px]">
                                                        {highlightText(story.authorName, searchQuery)}
                                                    </span>
                                                </div>
                                                
                                                {/* Views counter if present */}
                                                {story.views > 0 && (
                                                    <span className="flex items-center text-[9px] text-amber-800/50 font-serif mr-auto ml-2">
                                                        <Eye className="w-2.5 h-2.5 mr-0.5 text-amber-700/60" />
                                                        {story.views} views
                                                    </span>
                                                )}

                                                <div className="flex gap-1 shrink-0">
                                                    {story.tags?.slice(0, 1).map(tag => (
                                                        <span key={tag} className="px-2 py-0.5 bg-amber-50 text-amber-850 rounded border border-amber-200/30 text-[9px] font-medium font-serif">
                                                            #{tag}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}

                    {/* Pagination Controls */}
                    {totalPages > 1 && (
                        <div className="flex justify-center items-center gap-4 mt-8 pt-4 border-t border-amber-200/30 font-serif">
                            <button
                                onClick={() => setPage(prev => Math.max(0, prev - 1))}
                                disabled={page === 0}
                                className="p-2 rounded-lg border border-amber-200 text-amber-800 bg-[#fdfbf7] disabled:opacity-40 hover:bg-amber-50 transition-colors"
                            >
                                <ChevronLeft className="w-5 h-5" />
                            </button>
                            <span className="text-xs text-amber-900/70 font-medium">
                                Page {page + 1} of {totalPages}
                            </span>
                            <button
                                onClick={() => setPage(prev => Math.min(totalPages - 1, prev + 1))}
                                disabled={page === totalPages - 1}
                                className="p-2 rounded-lg border border-amber-200 text-amber-800 bg-[#fdfbf7] disabled:opacity-40 hover:bg-amber-50 transition-colors"
                            >
                                <ChevronRight className="w-5 h-5" />
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
