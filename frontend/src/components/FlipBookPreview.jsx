import React, { useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, Volume2, ScanLine, Film } from 'lucide-react';
import QRCode from 'qrcode';

// Helper component for asynchronous QR code generation inside 3D preview
const QrCodeGenerator = ({ value }) => {
    const [src, setSrc] = useState('');
    useEffect(() => {
        if (!value) return;
        QRCode.toDataURL(value, { margin: 1, width: 100, color: { dark: '#3d2106', light: '#ffffff' } }, (err, url) => {
            if (!err) setSrc(url);
        });
    }, [value]);
    return src ? <img src={src} className="w-full h-full object-contain" alt="QR Code" /> : <div className="animate-pulse bg-amber-100/50 w-full h-full flex items-center justify-center text-[6px] text-amber-700">QR</div>;
};

export default function FlipBookPreview({ isOpen, onClose, title, pages, backgrounds }) {
    if (!isOpen) return null;

    // We pair scrapbook pages into book page cards
    // Card 0: Front = Cover, Back = Page 1
    // Card 1: Front = Page 2, Back = Page 3
    // Card 2: Front = Page 4, Back = Page 5
    // Card N: Front = Page Last (if odd), Back = Back Cover
    
    // Compile page list including covers
    const bookPages = [];
    bookPages.push({ type: 'cover-front', title }); // Cover front
    
    pages.forEach(p => {
        bookPages.push({ type: 'content', data: p });
    });

    bookPages.push({ type: 'cover-back' }); // Cover back

    if (bookPages.length % 2 !== 0) {
        bookPages.push({ type: 'blank' }); // Ensure even number of pages
    }

    // Create cards: each card has 2 pages (Front, Back)
    const cards = [];
    for (let i = 0; i < bookPages.length; i += 2) {
        cards.push({
            id: i / 2,
            front: bookPages[i],
            back: bookPages[i + 1]
        });
    }

    const [currentCardIndex, setCurrentCardIndex] = useState(0);

    const playFlipSound = () => {
        try {
            // Programmatic retro synth sound for page turn so we don't need external audio asset
            const ctx = new (window.AudioContext || window.webkitAudioContext)();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.connect(gain);
            gain.connect(ctx.destination);
            
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(100, ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.15);
            
            gain.gain.setValueAtTime(0.08, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
            
            osc.start();
            osc.stop(ctx.currentTime + 0.22);
        } catch (e) {
            // fail silently if audio context blocked
        }
    };

    const handleNext = () => {
        if (currentCardIndex < cards.length - 1) {
            playFlipSound();
            setCurrentCardIndex(prev => prev + 1);
        }
    };

    const handlePrev = () => {
        if (currentCardIndex > 0) {
            playFlipSound();
            setCurrentCardIndex(prev => prev - 1);
        }
    };

    // Render inner content of a page
    const renderPageContent = (page) => {
        if (!page) {
            return (
                <div className="w-full h-full bg-stone-100 flex items-center justify-center text-stone-300 font-serif italic text-xs">
                    This page left intentionally blank
                </div>
            );
        }

        if (page.type === 'cover-front') {
            return (
                <div className="w-full h-full bg-gradient-to-br from-amber-900 via-amber-950 to-stone-950 p-6 flex flex-col justify-between items-center relative text-center border-l-4 border-amber-950">
                    <div className="absolute inset-0 bg-[radial-gradient(#ffffff04_1px,transparent_1px)] [background-size:12px_12px] pointer-events-none"></div>
                    
                    {/* Golden metallic leaf borders */}
                    <div className="absolute inset-4 border border-amber-500/25 rounded-md pointer-events-none"></div>
                    <div className="absolute inset-5 border-2 border-amber-500/15 rounded-md pointer-events-none"></div>
                    
                    {/* Metal corners */}
                    <div className="absolute top-4 left-4 w-6 h-6 border-t-2 border-l-2 border-amber-500/40"></div>
                    <div className="absolute top-4 right-4 w-6 h-6 border-t-2 border-r-2 border-amber-500/40"></div>
                    <div className="absolute bottom-4 left-4 w-6 h-6 border-b-2 border-l-2 border-amber-500/40"></div>
                    <div className="absolute bottom-4 right-4 w-6 h-6 border-b-2 border-r-2 border-amber-500/40"></div>

                    <div className="text-[10px] text-amber-500/60 uppercase tracking-widest font-semibold mt-8 select-none">
                        Legacy Trunk Archive
                    </div>

                    <div className="my-auto px-4 z-10">
                        {/* Title plate */}
                        <div className="bg-amber-950/40 backdrop-blur-sm border-2 border-amber-500/35 p-5 rounded-lg shadow-xl shadow-black/35">
                            <h2 className="text-3xl font-extrabold text-amber-100 font-serif leading-tight tracking-wider" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.6)' }}>
                                {page.title}
                            </h2>
                            <div className="w-16 h-0.5 bg-amber-500 mx-auto mt-4 rounded-full"></div>
                        </div>
                    </div>

                    <div className="text-[9px] text-amber-500/40 tracking-wider mb-8 select-none">
                        Yaado Ka Baksa © 2026
                    </div>
                </div>
            );
        }

        if (page.type === 'cover-back') {
            return (
                <div className="w-full h-full bg-gradient-to-br from-amber-950 via-amber-950 to-stone-950 flex items-center justify-center relative border-r-4 border-amber-950">
                    <div className="absolute inset-4 border border-amber-500/25 rounded pointer-events-none"></div>
                    <div className="text-amber-500/20 text-xs font-serif italic select-none">The End of Album</div>
                </div>
            );
        }

        if (page.type === 'blank') {
            return (
                <div className="w-full h-full bg-stone-100 flex items-center justify-center text-stone-300 font-serif italic text-xs">
                    This page left intentionally blank
                </div>
            );
        }

        // Render standard scrapbook canvas layout scaled down
        const canvasBg = backgrounds.find(bg => bg.id === page.data.background) || backgrounds[0];
        
        return (
            <div className="w-full h-full relative overflow-hidden shadow-inner" style={{ ...canvasBg.style }}>
                {/* Center binding page shadows */}
                <div className="absolute inset-y-0 w-8 bg-gradient-to-r from-black/8 to-transparent pointer-events-none z-50 odd:left-0 odd:from-black/10 even:right-0 even:bg-gradient-to-l even:from-black/10"></div>
                
                {/* Page Content Elements */}
                {page.data.elements?.map(elem => {
                    return (
                        <div
                            key={elem.id}
                            className="absolute pointer-events-none"
                            style={{
                                left: `${elem.x}%`,
                                top: `${elem.y}%`,
                                width: `${elem.width}%`,
                                height: `${elem.height}%`,
                                transform: `rotate(${elem.rotation || 0}deg)`,
                                zIndex: elem.zIndex || 1
                            }}
                        >
                            {elem.type === 'text' && (
                                <div
                                    className="w-full h-full flex items-center justify-center p-1 text-[8px] leading-snug break-words text-center"
                                    style={{
                                        fontFamily: elem.style?.fontFamily || 'serif',
                                        fontSize: `calc(${elem.style?.fontSize || '14px'} * 0.45)`,
                                        color: elem.style?.color || '#3d2106',
                                        fontWeight: elem.style?.fontWeight || 'normal'
                                    }}
                                >
                                    {elem.content}
                                </div>
                            )}

                            {elem.type === 'sticker' && (
                                <div className="w-full h-full flex items-center justify-center">
                                    {elem.stickerType === 'tape' ? (
                                        <div className="w-full h-full rounded shadow-sm border border-black/5 opacity-75" style={elem.style}></div>
                                    ) : elem.stickerType === 'badge' ? (
                                        <div className="w-full h-full flex items-center justify-center font-serif text-amber-950 whitespace-nowrap gap-0.5" style={{ fontFamily: 'Dancing Script', fontSize: '11px' }}>
                                            {elem.content}
                                        </div>
                                    ) : (
                                        <span className="text-xl select-none leading-none">{elem.content}</span>
                                    )}
                                </div>
                            )}

                            {elem.type === 'qr' && (
                                <div className="w-full h-full p-0.5 bg-white border border-gray-200 rounded shadow flex flex-col items-center justify-center gap-0.5">
                                    <div className="w-full flex-grow">
                                        <QrCodeGenerator value={elem.qrUrl} />
                                    </div>
                                    <span className="text-[4px] text-amber-900 font-bold uppercase tracking-wider block text-center mt-0.5">Scan Media</span>
                                </div>
                            )}

                            {elem.type === 'memory' && (
                                <div className="w-full h-full bg-white p-1 shadow border border-gray-150 flex flex-col justify-between font-serif relative select-none">
                                    {elem.isPlaceholder ? (
                                        <div className="w-full h-full border border-dashed border-amber-300 bg-amber-50/20 rounded flex flex-col items-center justify-center p-1 text-center">
                                            <span className="text-[8px]">📸</span>
                                            <span className="text-[4px] font-bold text-amber-950 mt-0.5 leading-none">{elem.title}</span>
                                        </div>
                                    ) : (
                                        <>
                                            <div className="w-full relative flex-grow overflow-hidden bg-gray-50 rounded">
                                                {elem.mediaType?.includes('video') ? (
                                                    <div className="w-full h-full bg-gradient-to-br from-slate-800 via-slate-900 to-slate-950 flex flex-col items-center justify-center p-1.5 select-none text-white relative">
                                                        <div className="absolute top-0.5 left-0 right-0 flex justify-between px-1.5 opacity-30 text-[4px] tracking-widest font-mono">
                                                            <span>00:00:00</span>
                                                            <span>16:9 REC</span>
                                                        </div>
                                                        <Film className="w-3.5 h-3.5 text-amber-500 animate-pulse mb-0.5" />
                                                        <span className="text-[5px] font-bold text-amber-400 uppercase tracking-widest leading-none">Video</span>
                                                    </div>
                                                ) : elem.mediaType?.includes('audio') ? (
                                                    <div className="w-full h-full bg-gradient-to-br from-amber-950 via-amber-900 to-amber-950 flex flex-col items-center justify-center p-1.5 select-none text-white relative">
                                                        <Volume2 className="w-3.5 h-3.5 text-amber-400 animate-bounce mb-0.5" />
                                                        <span className="text-[5px] font-bold text-amber-400 uppercase tracking-widest leading-none">Voice</span>
                                                    </div>
                                                ) : (
                                                    <img src={elem.mediaUrl} className="w-full h-full object-cover select-none pointer-events-none" alt="" />
                                                )}

                                                {/* Center Scanner overlay for audio/video memories */}
                                                {elem.hasQrCode && (elem.mediaType?.includes('video') || elem.mediaType?.includes('audio')) && (
                                                    <div className="absolute inset-0 flex items-center justify-center bg-black/35 backdrop-blur-[0.5px]">
                                                        <div className="w-8 h-8 bg-white p-0.5 rounded shadow border border-amber-900/10 flex flex-col items-center justify-center gap-0.5 select-none scale-110">
                                                            <div className="w-full flex-grow">
                                                                <QrCodeGenerator value={elem.qrUrl} />
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                            <div className="pt-0.5 min-h-[16px] flex flex-col justify-end">
                                                {elem.showTitle !== false && (
                                                    <p className="text-[5px] font-bold text-gray-800 truncate text-center leading-none">
                                                        {elem.title}
                                                    </p>
                                                )}
                                            </div>

                                            {/* Corner Scan Code overlay for standard image memories */}
                                            {elem.hasQrCode && !(elem.mediaType?.includes('video') || elem.mediaType?.includes('audio')) && (
                                                <div className="absolute top-1 right-1 w-6 h-6 bg-white p-0.5 rounded shadow border border-amber-900/10 flex items-center justify-center">
                                                    <QrCodeGenerator value={elem.qrUrl} />
                                                </div>
                                            )}
                                        </>
                                    )}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        );
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm select-none">
            <div className="relative w-full max-w-5xl flex flex-col items-center">
                
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="fixed top-4 right-4 p-3 bg-white hover:bg-gray-100 text-gray-900 rounded-full shadow-lg border border-gray-200 hover:scale-105 transition-all cursor-pointer z-50 flex items-center justify-center duration-200"
                    title="Close Preview"
                >
                    <X className="w-6 h-6 text-gray-800" />
                </button>

                {/* Workspace Study Desk Tabletop */}
                <div className="w-full bg-[radial-gradient(circle_at_center,_#3c2b1e_0%,_#1f140e_100%)] p-12 rounded-3xl border border-white/10 shadow-2xl relative flex flex-col items-center justify-center min-h-[620px] select-none">
                    <div className="absolute inset-0 bg-[radial-gradient(#ffffff02_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none"></div>

                    {/* Left and Right Page-Turn Margins */}
                    <button
                        onClick={handlePrev}
                        disabled={currentCardIndex === 0}
                        className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-white/5 hover:bg-white/10 text-amber-100 hover:text-white border border-white/10 rounded-full disabled:opacity-20 transition-all cursor-pointer z-50"
                    >
                        <ChevronLeft className="w-6 h-6" />
                    </button>

                    <button
                        onClick={handleNext}
                        disabled={currentCardIndex === cards.length - 1}
                        className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-white/5 hover:bg-white/10 text-amber-100 hover:text-white border border-white/10 rounded-full disabled:opacity-20 transition-all cursor-pointer z-50"
                    >
                        <ChevronRight className="w-6 h-6" />
                    </button>

                    {/* The Interactive 3D Book */}
                    {/* Width: 840px, Height: 540px. Book has perspective */}
                    <div 
                        className="w-[840px] h-[560px] relative select-none"
                        style={{ perspective: '1600px' }}
                    >
                        <div className="w-full h-full absolute flex">
                            
                            {/* Static Left Side Backing Pages (spans under cards) */}
                            <div className="w-1/2 h-full bg-stone-250 border-r border-stone-300 rounded-l shadow-2xl origin-right"></div>
                            
                            {/* Static Right Side Backing Pages (spans under cards) */}
                            <div className="w-1/2 h-full bg-stone-250 rounded-r shadow-2xl origin-left"></div>
                        </div>

                        {/* Cards Layers rendering */}
                        {cards.map((card, index) => {
                            // Determine transform rotation relative to currentCardIndex
                            let rotation = 0;
                            if (index < currentCardIndex) {
                                rotation = -180; // Flipped to the left side
                            } else {
                                rotation = 0; // Sitting on the right side
                            }

                            // Layer stacking (Z-index calculation)
                            // Cards flipped left: earlier card sits on top of later card
                            // Cards on right: earlier card sits underneath later card
                            let zIndex = 0;
                            if (index < currentCardIndex) {
                                zIndex = index + 1;
                            } else {
                                zIndex = cards.length - index;
                            }

                            return (
                                <div
                                    key={card.id}
                                    className="absolute right-0 top-0 w-1/2 h-full origin-left"
                                    style={{
                                        transformStyle: 'preserve-3d',
                                        transition: 'transform 0.8s cubic-bezier(0.25, 0.8, 0.25, 1)',
                                        transform: `rotateY(${rotation}deg)`,
                                        zIndex: zIndex
                                    }}
                                >
                                    {/* FRONT SIDE OF CARD (Rotated 0 deg) */}
                                    <div 
                                        className="absolute inset-0 w-full h-full bg-white select-none overflow-hidden rounded-r border-r border-stone-200"
                                        style={{ backfaceVisibility: 'hidden' }}
                                    >
                                        {renderPageContent(card.front)}
                                    </div>

                                    {/* BACK SIDE OF CARD (Rotated 180 deg) */}
                                    {/* Must rotate Y 180 to mirror text layout correctly when flipped left */}
                                    <div 
                                        className="absolute inset-0 w-full h-full bg-white select-none overflow-hidden rounded-l border-l border-stone-200"
                                        style={{ 
                                            backfaceVisibility: 'hidden',
                                            transform: 'rotateY(180deg)'
                                        }}
                                    >
                                        {renderPageContent(card.back)}
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Book Metadata Indicator */}
                    <div className="absolute bottom-4 text-center">
                        <p className="text-[11px] text-amber-500/70 font-serif tracking-wider">
                            Book Page {currentCardIndex * 2} - {currentCardIndex * 2 + 1} of {pages.length + 2}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
