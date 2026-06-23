import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { storyService } from '../api/storyService';
import { useToast } from '../contexts/ToastContext';
import {
    PlusCircle, MapPin, Image as ImageIcon, Clock, Heart,
    MessageCircle, ChevronLeft, ChevronRight, BookOpen, Users,
    CalendarDays, Globe
} from 'lucide-react';

/* ====================================================================
   SUB-COMPONENTS
   ==================================================================== */

/* -- Animated Counter (counts from 0 to target) -- */
function AnimatedCounter({ target, suffix = '', duration = 1200 }) {
    const [count, setCount] = useState(0);
    const ref = useRef(null);
    const hasAnimated = useRef(false);

    useEffect(() => {
        const observer = new IntersectionObserver(([entry]) => {
            if (entry.isIntersecting && !hasAnimated.current) {
                hasAnimated.current = true;
                const start = performance.now();
                const step = (now) => {
                    const elapsed = now - start;
                    const progress = Math.min(elapsed / duration, 1);
                    // Ease-out cubic
                    const eased = 1 - Math.pow(1 - progress, 3);
                    setCount(Math.round(eased * target));
                    if (progress < 1) requestAnimationFrame(step);
                };
                requestAnimationFrame(step);
            }
        }, { threshold: 0.3 });
        if (ref.current) observer.observe(ref.current);
        return () => observer.disconnect();
    }, [target, duration]);

    return <span ref={ref}>{count}{suffix}</span>;
}

/* -- Scroll Reveal Wrapper -- */
function ScrollReveal({ children, delay = 0 }) {
    const ref = useRef(null);
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const observer = new IntersectionObserver(([entry]) => {
            if (entry.isIntersecting) {
                setVisible(true);
                observer.disconnect();
            }
        }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
        if (ref.current) observer.observe(ref.current);
        return () => observer.disconnect();
    }, []);

    return (
        <div
            ref={ref}
            className="transition-all duration-700 ease-out"
            style={{
                transitionDelay: `${delay}ms`,
                opacity: visible ? 1 : 0,
                transform: visible ? 'translateY(0)' : 'translateY(32px)',
            }}
        >
            {children}
        </div>
    );
}

/* -- Media Carousel (auto-advances every 4s, with arrows) -- */
function MediaCarousel({ mediaFiles, alt, className = '' }) {
    const [current, setCurrent] = useState(0);
    const timerRef = useRef(null);
    const total = mediaFiles?.length || 0;

    const resetTimer = useCallback(() => {
        if (timerRef.current) clearInterval(timerRef.current);
        if (total > 1) {
            timerRef.current = setInterval(() => {
                setCurrent(prev => (prev + 1) % total);
            }, 4000);
        }
    }, [total]);

    useEffect(() => {
        resetTimer();
        return () => { if (timerRef.current) clearInterval(timerRef.current); };
    }, [resetTimer]);

    const go = (dir) => {
        setCurrent(prev => (prev + dir + total) % total);
        resetTimer();
    };

    if (!mediaFiles || total === 0) {
        return (
            <div className={`w-full h-full flex items-center justify-center bg-amber-50 ${className}`}>
                <ImageIcon className="w-12 h-12 text-amber-200" />
            </div>
        );
    }

    return (
        <div className={`relative w-full h-full overflow-hidden ${className}`}
             onMouseEnter={() => { if (timerRef.current) clearInterval(timerRef.current); }}
             onMouseLeave={resetTimer}
        >
            {mediaFiles.map((media, i) => (
                <img
                    key={media.id || i}
                    src={media.mediaUrl}
                    alt={`${alt} ${i + 1}`}
                    className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ease-in-out ${
                        i === current ? 'opacity-100 z-10' : 'opacity-0 z-0'
                    }`}
                />
            ))}

            {total > 1 && (
                <>
                    <button
                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); go(-1); }}
                        className="absolute left-2 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center transition-all opacity-0 group-hover:opacity-100"
                        aria-label="Previous image"
                    >
                        <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); go(1); }}
                        className="absolute right-2 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center transition-all opacity-0 group-hover:opacity-100"
                        aria-label="Next image"
                    >
                        <ChevronRight className="w-5 h-5" />
                    </button>
                    <div className="absolute bottom-2 left-1/2 -translate-x-1/2 z-20 flex space-x-1.5">
                        {mediaFiles.map((_, i) => (
                            <button
                                key={i}
                                onClick={(e) => { e.preventDefault(); e.stopPropagation(); setCurrent(i); resetTimer(); }}
                                className={`w-2 h-2 rounded-full transition-all ${
                                    i === current ? 'bg-white scale-125' : 'bg-white/50 hover:bg-white/80'
                                }`}
                                aria-label={`Go to image ${i + 1}`}
                            />
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}

/* -- Reaction Button (Heart with pop animation) -- */
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
            className={`flex items-center text-xs transition-colors ${
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

/* ====================================================================
   MAIN DASHBOARD
   ==================================================================== */

export default function Dashboard() {
    const { currentUser } = useAuth();
    const toast = useToast();
    const [stories, setStories] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStories = async () => {
            try {
                const data = await storyService.getAllStories();
                const sortedData = data.sort((a, b) => {
                    const dateA = a.storyDate ? new Date(a.storyDate) : new Date(a.createdAt);
                    const dateB = b.storyDate ? new Date(b.storyDate) : new Date(b.createdAt);
                    return dateB - dateA;
                });
                setStories(sortedData);
            } catch (err) {
                console.error('Failed to fetch stories', err);
                toast.error('Could not load your family chronicle.');
            } finally {
                setLoading(false);
            }
        };
        fetchStories();
    }, [toast]);

    /* -- Computed Stats -- */
    const stats = useMemo(() => {
        if (stories.length === 0) return null;
        const locations = new Set(stories.filter(s => s.location).map(s => s.location));
        const members = new Set(stories.filter(s => s.familyMemberName).map(s => s.familyMemberName));
        const years = stories
            .filter(s => s.storyDate)
            .map(s => new Date(s.storyDate).getFullYear())
            .filter(y => !isNaN(y));
        const oldest = years.length > 0 ? Math.min(...years) : null;

        return {
            totalMemories: stories.length,
            totalMembers: members.size,
            totalLocations: locations.size,
            oldestYear: oldest,
        };
    }, [stories]);

    /* -- "On This Day" -- */
    const onThisDayStory = useMemo(() => {
        const today = new Date();
        const todayMonth = today.getMonth();
        const todayDate = today.getDate();

        return stories.find(s => {
            if (!s.storyDate) return false;
            const d = new Date(s.storyDate);
            return d.getMonth() === todayMonth && d.getDate() === todayDate && d.getFullYear() !== today.getFullYear();
        }) || null;
    }, [stories]);

    const yearsAgo = onThisDayStory
        ? new Date().getFullYear() - new Date(onThisDayStory.storyDate).getFullYear()
        : 0;

    /* -- Spotlight & Timeline -- */
    const spotlightStory = stories.length > 0 ? stories[Math.floor(Math.random() * Math.min(3, stories.length))] : null;
    const timelineStories = stories.filter(s => s.id !== spotlightStory?.id && s.id !== onThisDayStory?.id);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-700"></div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">

            {/* ── Header ── */}
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-4xl font-bold brand-text tracking-wide" style={{ color: 'var(--brand-brown-800)' }}>
                        Family Chronicle
                    </h1>
                    <p className="text-amber-700/80 mt-2 font-medium italic">
                        Preserving the moments that matter, {currentUser?.displayName?.split(' ')[0] || 'Explorer'}.
                    </p>
                </div>
                <Link
                    to="/story/create"
                    className="flex items-center text-white px-5 py-2.5 rounded-full transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                    style={{ background: 'linear-gradient(135deg, var(--accent-copper), var(--brand-brown-600))' }}
                >
                    <PlusCircle className="w-5 h-5 mr-2" />
                    Add Memory
                </Link>
            </div>

            {/* ── 1. Stats Strip ── */}
            {stats && (
                <ScrollReveal>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
                        <div className="rounded-xl p-5 flex items-center space-x-4 shadow-sm hover:shadow-md transition-shadow" style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--card-border)' }}>
                            <div className="w-11 h-11 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: 'var(--brand-brown-50)' }}>
                                <BookOpen className="w-5 h-5" style={{ color: 'var(--accent-copper)' }} />
                            </div>
                            <div>
                                <p className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
                                    <AnimatedCounter target={stats.totalMemories} />
                                </p>
                                <p className="text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Memories</p>
                            </div>
                        </div>
                        <div className="rounded-xl p-5 flex items-center space-x-4 shadow-sm hover:shadow-md transition-shadow" style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--card-border)' }}>
                            <div className="w-11 h-11 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: 'var(--brand-brown-50)' }}>
                                <Users className="w-5 h-5" style={{ color: 'var(--accent-copper)' }} />
                            </div>
                            <div>
                                <p className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
                                    <AnimatedCounter target={stats.totalMembers} />
                                </p>
                                <p className="text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Members</p>
                            </div>
                        </div>
                        <div className="rounded-xl p-5 flex items-center space-x-4 shadow-sm hover:shadow-md transition-shadow" style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--card-border)' }}>
                            <div className="w-11 h-11 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: 'var(--brand-brown-50)' }}>
                                <Globe className="w-5 h-5" style={{ color: 'var(--accent-copper)' }} />
                            </div>
                            <div>
                                <p className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
                                    <AnimatedCounter target={stats.totalLocations} />
                                </p>
                                <p className="text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Locations</p>
                            </div>
                        </div>
                        <div className="rounded-xl p-5 flex items-center space-x-4 shadow-sm hover:shadow-md transition-shadow" style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--card-border)' }}>
                            <div className="w-11 h-11 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: 'var(--brand-brown-50)' }}>
                                <CalendarDays className="w-5 h-5" style={{ color: 'var(--accent-copper)' }} />
                            </div>
                            <div>
                                <p className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
                                    {stats.oldestYear ? <AnimatedCounter target={stats.oldestYear} /> : '--'}
                                </p>
                                <p className="text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Oldest Memory</p>
                            </div>
                        </div>
                    </div>
                </ScrollReveal>
            )}

            {stories.length === 0 ? (
                <div className="bg-white rounded-3xl shadow-sm border border-amber-100 p-16 text-center max-w-2xl mx-auto">
                    <div className="mx-auto w-24 h-24 bg-amber-50 rounded-full flex items-center justify-center mb-6">
                        <ImageIcon className="w-12 h-12 text-amber-300" />
                    </div>
                    <h3 className="text-2xl font-medium text-gray-900 mb-3 font-serif">The Pages are Empty</h3>
                    <p className="text-gray-500 mb-8 text-lg">
                        Your memory chest is ready. Start filling these pages with your precious family stories to share with generations.
                    </p>
                    <Link
                        to="/story/create"
                        className="inline-flex items-center text-amber-700 bg-amber-50 border border-amber-200 px-8 py-3 rounded-xl hover:bg-amber-100 transition-colors font-medium text-lg shadow-sm"
                    >
                        <PlusCircle className="w-5 h-5 mr-2" />
                        Write the First Chapter
                    </Link>
                </div>
            ) : (
                <div className="space-y-16">

                    {/* ── 2. "On This Day" Card ── */}
                    {onThisDayStory && (
                        <ScrollReveal>
                            <Link to={`/story/${onThisDayStory.id}`} className="block group">
                                <div className="relative bg-gradient-to-r from-amber-50 via-white to-amber-50 rounded-2xl border-2 border-dashed border-amber-300 p-6 md:p-8 overflow-hidden hover:border-amber-400 transition-colors">
                                    {/* Decorative corner flourish */}
                                    <div className="absolute top-0 right-0 w-24 h-24 opacity-10">
                                        <svg viewBox="0 0 100 100" fill="none">
                                            <path d="M100 0 C60 0, 0 40, 0 100" stroke="currentColor" strokeWidth="2" className="text-amber-700"/>
                                            <path d="M100 20 C70 20, 20 60, 20 100" stroke="currentColor" strokeWidth="1.5" className="text-amber-500"/>
                                        </svg>
                                    </div>

                                    <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                                        {/* Thumbnail */}
                                        {onThisDayStory.mediaFiles?.length > 0 && (
                                            <div className="w-20 h-20 md:w-24 md:h-24 rounded-xl overflow-hidden border-2 border-white shadow-md flex-shrink-0">
                                                <img
                                                    src={onThisDayStory.mediaFiles[0].mediaUrl}
                                                    alt={onThisDayStory.title}
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                        )}

                                        <div className="flex-1 min-w-0">
                                            <div className="inline-flex items-center space-x-2 mb-2 bg-amber-100 px-3 py-1 rounded-full">
                                                <CalendarDays className="w-3.5 h-3.5 text-amber-700" />
                                                <span className="text-xs font-bold text-amber-800 uppercase tracking-wider">
                                                    {yearsAgo} {yearsAgo === 1 ? 'year' : 'years'} ago today
                                                </span>
                                            </div>
                                            <h3 className="text-xl md:text-2xl font-bold text-gray-900 font-serif group-hover:text-amber-700 transition-colors truncate">
                                                {onThisDayStory.title}
                                            </h3>
                                            <p className="text-gray-500 text-sm mt-1 line-clamp-1">
                                                {onThisDayStory.description}
                                            </p>
                                        </div>

                                        <span className="text-amber-600 font-medium text-sm whitespace-nowrap group-hover:text-amber-800 transition-colors">
                                            Revisit memory &rarr;
                                        </span>
                                    </div>
                                </div>
                            </Link>
                        </ScrollReveal>
                    )}

                    {/* ── Spotlight Section ── */}
                    {spotlightStory && (
                        <ScrollReveal delay={100}>
                            <div className="relative group">
                                <div className="absolute -inset-1 bg-gradient-to-r from-amber-200 to-amber-100 rounded-3xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
                                <div className="relative bg-white rounded-2xl shadow-xl border border-amber-100/50 overflow-hidden flex flex-col md:flex-row">
                                    <div className="md:w-1/2 p-8 md:p-12 flex flex-col justify-center">
                                        <div className="inline-flex items-center space-x-2 mb-4">
                                            <Clock className="w-4 h-4 text-amber-500" />
                                            <span className="text-sm font-semibold text-amber-600 uppercase tracking-widest">Memory Spotlight</span>
                                        </div>
                                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 font-serif leading-tight">
                                            {spotlightStory.title}
                                        </h2>
                                        <p className="text-gray-600 mb-6 line-clamp-3 text-lg leading-relaxed">
                                            {spotlightStory.description}
                                        </p>

                                        <div className="flex items-center justify-between mt-auto pt-6 border-t border-amber-50">
                                            <div className="flex items-center space-x-3">
                                                <div className="w-10 h-10 rounded-full bg-amber-100 border-2 border-white shadow-sm flex items-center justify-center overflow-hidden">
                                                    {spotlightStory.authorPhotoUrl ? (
                                                        <img src={spotlightStory.authorPhotoUrl} alt="" className="w-full h-full object-cover" />
                                                    ) : (
                                                        <span className="text-amber-700 font-bold">{spotlightStory.authorName?.charAt(0) || 'U'}</span>
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-gray-900">{spotlightStory.authorName}</p>
                                                    <p className="text-xs text-gray-500 italic">{spotlightStory.storyDate || 'Timeless'}</p>
                                                </div>
                                            </div>
                                            <Link to={`/story/${spotlightStory.id}`} className="text-amber-600 hover:text-amber-800 font-medium text-sm transition-colors">
                                                Read full story &rarr;
                                            </Link>
                                        </div>
                                    </div>
                                    <div className="md:w-1/2 relative min-h-[300px] md:min-h-full bg-amber-50 group">
                                        <MediaCarousel
                                            mediaFiles={spotlightStory.mediaFiles}
                                            alt={spotlightStory.title}
                                            className="absolute inset-0"
                                        />
                                    </div>
                                </div>
                            </div>
                        </ScrollReveal>
                    )}

                    {/* ── Timeline Section ── */}
                    {timelineStories.length > 0 && (
                        <div className="relative mt-20 pt-10">
                            {/* Central Golden Thread */}
                            <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-px -translate-x-1/2 z-0 hidden md:block" style={{ background: 'linear-gradient(to bottom, var(--brand-brown-300), var(--brand-brown-200), transparent)' }}></div>

                            <div className="space-y-12 relative z-10">
                                {timelineStories.map((story, index) => {
                                    const isEven = index % 2 === 0;
                                    const rotation = index % 3 === 0 ? 'rotate-1' : index % 2 === 0 ? '-rotate-1' : 'rotate-2';

                                    return (
                                        <ScrollReveal key={story.id} delay={index * 80}>
                                            <div className={`flex flex-col md:flex-row items-center ${isEven ? '' : 'md:flex-row-reverse'} w-full`}>

                                                {/* Spacer for alternating layout (Desktop) */}
                                                <div className="hidden md:block md:w-1/2"></div>

                                                {/* Timeline Node Point (Desktop) */}
                                                <div className="hidden md:flex absolute left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-amber-400 border-4 border-amber-50 shadow-sm z-20"></div>

                                                {/* Story Card (Polaroid Style) */}
                                                <div className={`w-full md:w-[45%] ${isEven ? 'md:pr-12' : 'md:pl-12'}`}>
                                                    <Link to={`/story/${story.id}`} className="block focus:outline-none group">
                                                        <div className={`bg-white p-3 pb-6 rounded-lg shadow-md border border-gray-100 hover:shadow-xl transition-all duration-300 transform group-hover:scale-[1.02] ${rotation}`}>

                                                            {/* Photo Area */}
                                                            <div className="relative aspect-[4/3] bg-gray-100 rounded overflow-hidden mb-4 border border-gray-200">
                                                                <MediaCarousel
                                                                    mediaFiles={story.mediaFiles}
                                                                    alt={story.title}
                                                                />

                                                                {/* Family Member Tag */}
                                                                {story.familyMemberName && (
                                                                    <div className="absolute top-3 left-3 z-30 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-xs font-semibold text-amber-800 shadow-sm">
                                                                        {story.familyMemberName}
                                                                    </div>
                                                                )}
                                                            </div>

                                                            {/* Content Area */}
                                                            <div className="px-2">
                                                                <div className="flex items-center justify-between mb-2">
                                                                    <span className="text-xs font-medium text-gray-500 italic flex items-center">
                                                                        {story.storyDate || 'A timeless memory'}
                                                                    </span>
                                                                    {story.location && (
                                                                        <span className="text-xs text-gray-400 flex items-center">
                                                                            <MapPin className="w-3 h-3 mr-1" />
                                                                            {story.location}
                                                                        </span>
                                                                    )}
                                                                </div>

                                                                <h3 className="text-xl font-bold text-gray-900 mb-2 font-serif group-hover:text-amber-700 transition-colors">
                                                                    {story.title}
                                                                </h3>

                                                                <p className="text-gray-600 text-sm line-clamp-2 mb-4 leading-relaxed">
                                                                    {story.description}
                                                                </p>

                                                                {/* Interaction Footer */}
                                                                <div className="flex items-center justify-between pt-3 border-t border-dashed border-gray-200">
                                                                    <div className="flex items-center space-x-3">
                                                                        <ReactionButton storyId={story.id} />
                                                                        <span className="flex items-center text-xs text-gray-400">
                                                                            <MessageCircle className="w-4 h-4 mr-1" /> 0
                                                                        </span>
                                                                    </div>
                                                                    <div className="text-xs font-medium text-amber-600">
                                                                        By {story.authorName?.split(' ')[0]}
                                                                    </div>
                                                                </div>
                                                            </div>

                                                        </div>
                                                    </Link>
                                                </div>

                                            </div>
                                        </ScrollReveal>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
