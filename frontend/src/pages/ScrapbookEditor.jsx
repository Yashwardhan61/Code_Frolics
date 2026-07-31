import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { scrapbookService } from '../api/scrapbookService';
import { storyService } from '../api/storyService';
import {
    Save, ArrowLeft, Plus, ChevronLeft, ChevronRight, Play, Volume2,
    Type, Sticker as StickerIcon, Image as ImageIcon, Layout, Palette,
    ChevronUp, ChevronDown, RotateCw, Trash2, Printer, Check, Copy, ScanLine, ZoomIn, ZoomOut, Sparkles, BookOpen, Move
} from 'lucide-react';
import QRCode from 'qrcode';
import AutoGenerateModal from '../components/AutoGenerateModal';
import FlipBookPreview from '../components/FlipBookPreview';

// Background styles definition
const BACKGROUNDS = [
    { id: 'parchment', name: 'Vintage Parchment', style: { backgroundColor: '#FDFBF7', backgroundImage: 'radial-gradient(#ecdab9 1px, transparent 1px)', backgroundSize: '24px 24px' } },
    { id: 'kraft', name: 'Kraft Cardboard', style: { backgroundColor: '#EADBC8', backgroundImage: 'linear-gradient(rgba(0,0,0,0.05) 1px, transparent 1px)', backgroundSize: '100% 20px' } },
    { id: 'grid', name: 'School Journal Grid', style: { backgroundColor: '#F4F6F9', backgroundImage: 'linear-gradient(#e1e5eb 1px, transparent 1px), linear-gradient(90deg, #e1e5eb 1px, transparent 1px)', backgroundSize: '20px 20px' } },
    { id: 'pastel-rose', name: 'Blush Rose', style: { backgroundColor: '#FFF5F5', backgroundImage: 'radial-gradient(#ffd5d5 1.5px, transparent 1.5px)', backgroundSize: '30px 30px' } },
    { id: 'vintage-wood', name: 'Antique Wood', style: { backgroundColor: '#DFC15D', backgroundImage: 'repeating-linear-gradient(45deg, #ccae49 0px, #ccae49 10px, #ccae49 10px, #ccae49 20px, #DFC15D 20px, #DFC15D 40px)' } }
];

// Default stickers list
const STICKERS = [
    { id: 'tape_red', type: 'tape', name: 'Plaid Washi Tape', content: 'washi-tape', color: '#c05c5c', style: { opacity: 0.8, background: 'repeating-linear-gradient(45deg, #c05c5c, #c05c5c 10px, #dca8a8 10px, #dca8a8 20px)' } },
    { id: 'tape_teal', type: 'tape', name: 'Teal Washi Tape', content: 'washi-tape', color: '#4a8b8b', style: { opacity: 0.8, background: 'repeating-linear-gradient(90deg, #4a8b8b, #4a8b8b 15px, #86b4b4 15px, #86b4b4 20px)' } },
    { id: 'tape_gold', type: 'tape', name: 'Gold Washi Tape', content: 'washi-tape', color: '#d2ab51', style: { opacity: 0.8, background: 'linear-gradient(to right, #d2ab51, #e3c177, #d2ab51)' } },
    { id: 'tape_stars', type: 'tape', name: 'Teal Stars Washi Tape', content: 'washi-tape', color: '#2f6b6b', style: { opacity: 0.8, background: 'repeating-linear-gradient(45deg, #2f6b6b, #2f6b6b 10px, #4d8c8c 10px, #4d8c8c 20px)' } },
    { id: 'tape_cork', type: 'tape', name: 'Cork Strip Washi Tape', content: 'washi-tape', color: '#b59263', style: { opacity: 0.8, background: 'repeating-linear-gradient(90deg, #b59263, #b59263 12px, #9a7343 12px, #9a7343 24px)' } },
    { id: 'pushpin', type: 'pin', name: 'Red Pushpin', content: '📌' },
    { id: 'paperclip', type: 'pin', name: 'Paperclip', content: '📎' },
    { id: 'badge_memories', type: 'emoji', name: 'Memories Sparkles', content: '✨' },
    { id: 'badge_love', type: 'emoji', name: 'Family Love Heart', content: '❤️' },
    { id: 'badge_story', type: 'emoji', name: 'Our Story Scroll', content: '📜' },
    { id: 'flower', type: 'emoji', name: 'Vintage Rose', content: '🌹' },
    { id: 'sparkles', type: 'emoji', name: 'Sparkles', content: '✨' },
    { id: 'sun', type: 'emoji', name: 'Vintage Sun', content: '☀️' },
    { id: 'heart', type: 'emoji', name: 'Gold Heart', content: '💛' },
    { id: 'leaf', type: 'emoji', name: 'Oak Leaf', content: '🍂' },
    { id: 'camera', type: 'emoji', name: 'Retro Camera', content: '📸' },
    { id: 'balloon', type: 'emoji', name: 'Balloons', content: '🎈' },
    { id: 'cake', type: 'emoji', name: 'Birthday Cake', content: '🎂' },
    { id: 'ring', type: 'emoji', name: 'Wedding Rings', content: '💍' },
    { id: 'trophy', type: 'emoji', name: 'Trophy Award', content: '🏆' },
    { id: 'grad_cap', type: 'emoji', name: 'Graduation Cap', content: '🎓' },
    { id: 'plane', type: 'emoji', name: 'Airplane', content: '✈️' },
    { id: 'suitcase', type: 'emoji', name: 'Suitcase', content: '🧳' },
    { id: 'map', type: 'emoji', name: 'Map', content: '🗺️' }
];

// Fonts
const FONTS = [
    { id: 'Dancing Script', name: 'Handwritten Script', css: "'Dancing Script', cursive" },
    { id: 'Pacifico', name: 'Playful Cursive', css: "'Pacifico', cursive" },
    { id: 'serif', name: 'Vintage Book Serif', css: "Georgia, serif" },
    { id: 'sans-serif', name: 'Clean Modern', css: "system-ui, sans-serif" }
];

// Helper component for asynchronous QR code generation
const QrCodeGenerator = ({ value }) => {
    const [src, setSrc] = useState('');
    useEffect(() => {
        if (!value) return;
        QRCode.toDataURL(value, { margin: 1, width: 140, color: { dark: '#3d2106', light: '#ffffff' } }, (err, url) => {
            if (!err) setSrc(url);
        });
    }, [value]);
    return src ? <img src={src} className="w-full h-full object-contain" alt="QR Code" /> : <div className="animate-pulse bg-amber-100/50 w-full h-full flex items-center justify-center text-[10px] text-amber-700">QR</div>;
};

export default function ScrapbookEditor() {
    const { id } = useParams();
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    // Editor configurations & states
    const [title, setTitle] = useState("My Scrapbook Draft");
    const [description, setDescription] = useState("");
    const [pages, setPages] = useState([{ id: 1, background: 'parchment', elements: [] }]);
    const [currentPageIndex, setCurrentPageIndex] = useState(0);
    const [selectedElementId, setSelectedElementId] = useState(null);
    const [stories, setStories] = useState([]);
    const [activeTab, setActiveTab] = useState('templates');
    const [saving, setSaving] = useState(false);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [autoGenOpen, setAutoGenOpen] = useState(false);
    const [previewOpen, setPreviewOpen] = useState(false);
    const [confirmModal, setConfirmModal] = useState(null);

    // Transform dragging mouse tracker
    const [dragState, setDragState] = useState(null); // { type: 'move'|'resize'|'rotate', elementId, startX, startY, startVal }
    
    const containerRef = useRef(null);

    const handleAutoGenerateLayout = (selectedStories, theme) => {
        if (!selectedStories || selectedStories.length === 0) return;
        
        const newPages = [];
        let nextId = pages.length > 0 ? Math.max(...pages.map(p => p.id)) + 1 : 1;

        if (theme === 'legacy_capsule') {
            // Group size 1: place one memory per page
            selectedStories.forEach((story, idx) => {
                const elements = [];
                const mainImage = story.mediaFiles?.find(f => f.mediaType.includes('image'))?.mediaUrl ||
                                  "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=600&auto=format&fit=crop";
                const hasVoice = story.mediaFiles?.some(f => f.mediaType.includes('audio') || f.mediaType.includes('video'));

                // Red Plaid washi tape at top
                elements.push({
                    id: `elem_${Date.now()}_auto_tape_${idx}`,
                    type: 'sticker',
                    stickerType: 'tape',
                    content: 'washi-tape',
                    x: 38,
                    y: 8,
                    width: 24,
                    height: 6,
                    rotation: -6,
                    zIndex: 1,
                    style: { opacity: 0.8, background: 'repeating-linear-gradient(45deg, #c05c5c, #c05c5c 10px, #dca8a8 10px, #dca8a8 20px)' }
                });

                // Main memory block
                elements.push({
                    id: `elem_${Date.now()}_auto_mem_${idx}`,
                    type: 'memory',
                    storyId: story.id,
                    title: story.title,
                    description: story.description || '',
                    mediaUrl: story.mediaFiles?.[0]?.mediaUrl || mainImage,
                    mediaType: story.mediaFiles?.[0]?.mediaType || 'image',
                    hasQrCode: hasVoice,
                    qrUrl: hasVoice ? `${window.location.origin}/story/${story.id}` : null,
                    x: 15,
                    y: 14,
                    width: 70,
                    height: 52,
                    rotation: 2,
                    zIndex: 2
                });

                // Custom script caption block
                elements.push({
                    id: `elem_${Date.now()}_auto_txt_${idx}`,
                    type: 'text',
                    content: story.description || story.title,
                    x: 15,
                    y: 70,
                    width: 70,
                    height: 20,
                    rotation: -1,
                    zIndex: 3,
                    style: { fontFamily: 'Dancing Script', fontSize: '22px', color: '#3d2106', textAlign: 'center' }
                });

                newPages.push({
                    id: nextId++,
                    background: 'parchment',
                    elements
                });
            });

        } else if (theme === 'polaroid_grid') {
            // Group size 2: place two memories per page
            for (let i = 0; i < selectedStories.length; i += 2) {
                const elements = [];
                const story1 = selectedStories[i];
                const story2 = selectedStories[i + 1];

                // Polaroid 1
                if (story1) {
                    const img1 = story1.mediaFiles?.find(f => f.mediaType.includes('image'))?.mediaUrl ||
                                 "https://images.unsplash.com/photo-1501854140801-50d01698950b?w=600&auto=format&fit=crop";
                    const voice1 = story1.mediaFiles?.some(f => f.mediaType.includes('audio') || f.mediaType.includes('video'));
                    
                    elements.push({
                        id: `elem_${Date.now()}_auto_p1_${i}`,
                        type: 'memory',
                        storyId: story1.id,
                        title: story1.title,
                        description: story1.description || '',
                        mediaUrl: story1.mediaFiles?.[0]?.mediaUrl || img1,
                        mediaType: story1.mediaFiles?.[0]?.mediaType || 'image',
                        hasQrCode: voice1,
                        qrUrl: voice1 ? `${window.location.origin}/story/${story1.id}` : null,
                        x: 10,
                        y: 18,
                        width: 38,
                        height: 44,
                        rotation: -3,
                        zIndex: 2
                    });

                    // Teal washi tape
                    elements.push({
                        id: `elem_${Date.now()}_auto_p1_tape_${i}`,
                        type: 'sticker',
                        stickerType: 'tape',
                        content: 'washi-tape',
                        x: 14,
                        y: 13,
                        width: 20,
                        height: 5,
                        rotation: -25,
                        zIndex: 3,
                        style: { opacity: 0.8, background: 'repeating-linear-gradient(90deg, #4a8b8b, #4a8b8b 15px, #86b4b4 15px, #86b4b4 20px)' }
                    });
                }

                // Polaroid 2
                if (story2) {
                    const img2 = story2.mediaFiles?.find(f => f.mediaType.includes('image'))?.mediaUrl ||
                                 "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=600&auto=format&fit=crop";
                    const voice2 = story2.mediaFiles?.some(f => f.mediaType.includes('audio') || f.mediaType.includes('video'));
                    
                    elements.push({
                        id: `elem_${Date.now()}_auto_p2_${i}`,
                        type: 'memory',
                        storyId: story2.id,
                        title: story2.title,
                        description: story2.description || '',
                        mediaUrl: story2.mediaFiles?.[0]?.mediaUrl || img2,
                        mediaType: story2.mediaFiles?.[0]?.mediaType || 'image',
                        hasQrCode: voice2,
                        qrUrl: voice2 ? `${window.location.origin}/story/${story2.id}` : null,
                        x: 52,
                        y: 24,
                        width: 38,
                        height: 44,
                        rotation: 3,
                        zIndex: 4
                    });

                    // Gold tape
                    elements.push({
                        id: `elem_${Date.now()}_auto_p2_tape_${i}`,
                        type: 'sticker',
                        stickerType: 'tape',
                        content: 'washi-tape',
                        x: 62,
                        y: 19,
                        width: 20,
                        height: 5,
                        rotation: 15,
                        zIndex: 5,
                        style: { opacity: 0.8, background: 'linear-gradient(to right, #d2ab51, #e3c177, #d2ab51)' }
                    });
                }

                // Pushpin in the middle
                elements.push({
                    id: `elem_${Date.now()}_auto_pin_${i}`,
                    type: 'sticker',
                    stickerType: 'pin',
                    content: '📌',
                    x: 47,
                    y: 65,
                    width: 6,
                    height: 6,
                    rotation: 0,
                    zIndex: 6
                });

                // Joint caption
                elements.push({
                    id: `elem_${Date.now()}_auto_cap_${i}`,
                    type: 'text',
                    content: story1 && story2 ? `${story1.title} & ${story2.title}` : (story1 ? story1.title : "Nostalgic Moments"),
                    x: 15,
                    y: 72,
                    width: 70,
                    height: 16,
                    rotation: 0,
                    zIndex: 7,
                    style: { fontFamily: 'Pacifico', fontSize: '18px', color: '#3d2106', textAlign: 'center' }
                });

                newPages.push({
                    id: nextId++,
                    background: 'kraft',
                    elements
                });
            }

        } else if (theme === 'vintage_journal') {
            // Group size 1: Explorer style
            selectedStories.forEach((story, idx) => {
                const elements = [];
                const img = story.mediaFiles?.find(f => f.mediaType.includes('image'))?.mediaUrl ||
                            "https://images.unsplash.com/photo-1448375240586-882707db888b?w=600&auto=format&fit=crop";
                const voice = story.mediaFiles?.some(f => f.mediaType.includes('audio') || f.mediaType.includes('video'));

                // Paperclip decoration
                elements.push({
                    id: `elem_${Date.now()}_auto_clip_${idx}`,
                    type: 'sticker',
                    stickerType: 'pin',
                    content: '📎',
                    x: 24,
                    y: 12,
                    width: 8,
                    height: 8,
                    rotation: -15,
                    zIndex: 3
                });

                // Left Photo
                elements.push({
                    id: `elem_${Date.now()}_auto_img_${idx}`,
                    type: 'memory',
                    storyId: story.id,
                    title: story.title,
                    description: story.description || '',
                    mediaUrl: story.mediaFiles?.[0]?.mediaUrl || img,
                    mediaType: story.mediaFiles?.[0]?.mediaType || 'image',
                    hasQrCode: voice,
                    qrUrl: voice ? `${window.location.origin}/story/${story.id}` : null,
                    x: 10,
                    y: 18,
                    width: 44,
                    height: 56,
                    rotation: -2,
                    zIndex: 2
                });

                // Right Text block
                elements.push({
                    id: `elem_${Date.now()}_auto_desc_${idx}`,
                    type: 'text',
                    content: story.description || "Entering a nostalgic note. We gather memories to light up our legacy archives...",
                    x: 58,
                    y: 18,
                    width: 32,
                    height: 56,
                    rotation: 0,
                    zIndex: 4,
                    style: { fontFamily: 'serif', fontSize: '15px', color: '#2e1f0f', textAlign: 'left' }
                });

                // Badge
                elements.push({
                    id: `elem_${Date.now()}_auto_badge_${idx}`,
                    type: 'sticker',
                    stickerType: 'emoji',
                    content: '✨',
                    x: 70,
                    y: 78,
                    width: 10,
                    height: 10,
                    rotation: 4,
                    zIndex: 5
                });

                newPages.push({
                    id: nextId++,
                    background: 'grid',
                    elements
                });
            });
        }

        // Append new pages to local pages state
        setPages([...pages, ...newPages]);
        setCurrentPageIndex(pages.length); // Navigate to the start of new generated pages
    };

    // Load available memories and load scrapbook draft if editing
    useEffect(() => {
        const loadInitialData = async () => {
            setLoading(true);
            try {
                // Fetch posted stories
                const fetchedStories = await storyService.getAllStories();
                setStories(fetchedStories);

                // Fetch scrapbook draft if ID provided
                if (id) {
                    const data = await scrapbookService.getScrapbookById(id);
                    setTitle(data.title);
                    setDescription(data.description || "");
                    if (data.canvasData) {
                        const parsed = JSON.parse(data.canvasData);
                        if (parsed.pages && parsed.pages.length > 0) {
                            setPages(parsed.pages);
                        }
                    }
                }
            } catch (err) {
                console.error("Failed to load initial data", err);
            } finally {
                setLoading(false);
            }
        };
        loadInitialData();
    }, [id]);

    const handlePrintScrapbook = async () => {
        // Pre-generate all QR data URIs
        const qrImages = {};
        for (const p of pages) {
            for (const el of p.elements) {
                if (el.qrUrl || (el.type === 'qr' && el.qrUrl)) {
                    try {
                        const dataUrl = await QRCode.toDataURL(el.qrUrl, { margin: 1, width: 200 });
                        qrImages[el.id] = dataUrl;
                    } catch (err) {
                        console.error(err);
                    }
                }
            }
        }

        // Open the print window
        const printWindow = window.open('', '_blank');
        if (!printWindow) {
            alert("Pop-up blocker is enabled! Please allow pop-ups to print this scrapbook.");
            return;
        }

        // Build the print styles and content
        let html = `
            <html>
            <head>
                <title>${title}</title>
                <link href="https://fonts.googleapis.com/css2?family=Dancing+Script:wght@700&family=Pacifico&family=Inter:wght@400;600;800&display=swap" rel="stylesheet">
                <style>
                    @page {
                        size: A4 portrait;
                        margin: 0;
                    }
                    body {
                        margin: 0;
                        padding: 0;
                        background: #fff;
                        font-family: system-ui, sans-serif;
                        -webkit-print-color-adjust: exact;
                        print-color-adjust: exact;
                    }
                    .print-page {
                        width: 210mm;
                        height: 297mm;
                        position: relative;
                        page-break-after: always;
                        box-sizing: border-box;
                        overflow: hidden;
                        background-repeat: no-repeat;
                        background-size: cover;
                    }
                    .element {
                        position: absolute;
                        box-sizing: border-box;
                    }
                    .washi-tape-sticker {
                        opacity: 0.8;
                    }
                    .caption-title {
                        font-family: 'Dancing Script', cursive;
                        font-size: 14px;
                        font-weight: bold;
                        color: #3d2106;
                        text-align: center;
                        margin: 0;
                        line-height: 1.2;
                    }
                    .caption-desc {
                        font-size: 7px;
                        color: #6b7280;
                        text-align: center;
                        margin: 2px 0 0 0;
                        line-height: 1.3;
                        font-family: Georgia, serif;
                    }
                    @media print {
                        .print-page {
                            page-break-after: always;
                        }
                    }
                </style>
            </head>
            <body>
        `;

        pages.forEach((page, pIdx) => {
            // Find background details
            const bg = BACKGROUNDS.find(b => b.id === page.background) || BACKGROUNDS[0];
            
            // Convert bg styles object to inline CSS string
            let bgStyles = '';
            if (bg.style) {
                bgStyles = Object.entries(bg.style)
                    .map(([k, v]) => `${k.replace(/[A-Z]/g, m => '-' + m.toLowerCase())}: ${v};`)
                    .join(' ');
            }

            html += `<div class="print-page" style="${bgStyles}">`;

            // Draw elements
            page.elements.forEach(elem => {
                const left = elem.x;
                const top = elem.y;
                const width = elem.width;
                const height = elem.height;
                const rot = elem.rotation || 0;
                const z = elem.zIndex || 1;

                let innerContent = '';

                if (elem.type === 'text') {
                    let textStyles = `font-size: ${elem.style?.fontSize || '16px'}; font-family: ${elem.style?.fontFamily || 'Dancing Script'}; color: ${elem.style?.color || '#3d2106'}; text-align: ${elem.style?.textAlign || 'left'};`;
                    innerContent = `<div style="width: 100%; height: 100%; white-space: pre-wrap; font-weight: 500; ${textStyles}">${elem.content}</div>`;
                } else if (elem.type === 'sticker') {
                    if (elem.stickerType === 'tape') {
                        const tapeSticker = STICKERS.find(s => s.id === elem.id || s.name === elem.name) || STICKERS[0];
                        let tapeBg = '';
                        if (elem.style?.background) tapeBg = `background: ${elem.style.background};`;
                        else if (tapeSticker.style?.background) tapeBg = `background: ${tapeSticker.style.background};`;
                        else tapeBg = `background-color: ${elem.color || '#d2ab51'};`;

                        innerContent = `<div class="washi-tape-sticker" style="width: 100%; height: 100%; border-radius: 2px; box-shadow: 0 1px 3px rgba(0,0,0,0.05); ${tapeBg}"></div>`;
                    } else if (elem.stickerType === 'pin') {
                        innerContent = `<div style="font-size: 24px; text-align: center; line-height: 1; transform: translate(-2px, -4px);">${elem.content}</div>`;
                    } else if (elem.stickerType === 'badge') {
                        innerContent = `<div style="font-family: 'Dancing Script', cursive; color: #3d2106; font-size: 26px; text-align: center; white-space: nowrap; width: 100%; height: 100%; display: flex; align-items: center; justify-content: center;">${elem.content}</div>`;
                    } else {
                        innerContent = `<div style="font-size: 28px; text-align: center; line-height: 1;">${elem.content}</div>`;
                    }
                } else if (elem.type === 'qr') {
                    const qrDataUrl = qrImages[elem.id] || '';
                    innerContent = `
                        <div style="width: 100%; height: 100%; padding: 4px; background: white; border: 1px solid #ccc; border-radius: 4px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); display: flex; flex-direction: column; align-items: center; justify-content: center; box-sizing: border-box;">
                            <img src="${qrDataUrl}" style="width: 100%; height: 80%; object-fit: contain;" />
                            <span style="font-size: 6px; font-weight: bold; color: #78350f; text-transform: uppercase; margin-top: 2px;">Scan to Play</span>
                        </div>
                    `;
                } else if (elem.type === 'memory') {
                    if (elem.isPlaceholder) {
                        innerContent = `
                            <div style="width: 100%; height: 100%; border: 2px dashed #f59e0b; background: rgba(254, 243, 199, 0.2); border-radius: 6px; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 12px; box-sizing: border-box;">
                                <span style="font-size: 20px;">📸</span>
                                <span style="font-size: 10px; font-weight: bold; color: #78350f; margin-top: 4px;">Placeholder</span>
                            </div>
                        `;
                    } else {
                        const qrDataUrl = qrImages[elem.id] || '';
                        const showT = elem.showTitle !== false;
                        const showD = elem.showDescription !== false;
                        
                        innerContent = `
                            <div style="width: 100%; height: 100%; background: white; padding: 10px; box-shadow: 0 4px 8px rgba(0,0,0,0.1); border: 1px solid #e5e7eb; display: flex; flex-direction: column; justify-content: space-between; box-sizing: border-box; position: relative;">
                                <div style="width: 100%; flex-grow: 1; overflow: hidden; background: #f9fafb; border: 1px solid #f3f4f6; border-radius: 4px;">
                                    <img src="${elem.mediaUrl}" style="width: 100%; height: 100%; object-fit: cover;" />
                                </div>
                                
                                <div style="padding-top: 8px; min-height: 35px; display: flex; flex-direction: column; justify-content: center;">
                                    ${showT ? `<p class="caption-title">${elem.title}</p>` : ''}
                                    ${showD ? `<p class="caption-desc">${elem.description}</p>` : ''}
                                </div>

                                ${elem.hasQrCode && qrDataUrl ? `
                                    <div style="position: absolute; top: 8px; right: 8px; width: 50px; height: 50px; background: white; padding: 2px; border-radius: 3px; border: 1px solid rgba(120,53,15,0.15); display: flex; flex-direction: column; align-items: center; justify-content: center; box-shadow: 0 2px 5px rgba(0,0,0,0.15);">
                                        <img src="${qrDataUrl}" style="width: 100%; height: 80%; object-fit: contain;" />
                                        <span style="font-size: 4px; font-weight: bold; color: #78350f; text-transform: uppercase; margin-top: 1px; display: block; text-align: center;">Scan Media</span>
                                    </div>
                               ` : ''}
                            </div>
                        `;
                    }
                }

                html += `
                    <div class="element" style="left: ${left}%; top: ${top}%; width: ${width}%; height: ${height}%; transform: rotate(${rot}deg); z-index: ${z};">
                       ${innerContent}
                    </div>
                `;
            });

            html += `</div>`;
        });

        html += `
            <script>
                window.onload = function() {
                    setTimeout(function() {
                        window.print();
                    }, 800);
                };
            </script>
            </body>
            </html>
        `;

        printWindow.document.write(html);
        printWindow.document.close();
    };

    // Handle print triggers automatically from list query parameter
    useEffect(() => {
        if (!loading && searchParams.get('print') === 'true') {
            setTimeout(() => {
                handlePrintScrapbook();
            }, 800);
        }
    }, [loading, searchParams]);

    // Save logic
    const handleSave = async () => {
        if (!title.trim()) {
            alert("Please enter a scrapbook title.");
            return;
        }
        setSaving(true);
        const payload = {
            title,
            description,
            canvasData: JSON.stringify({ pages })
        };
        try {
            if (id) {
                await scrapbookService.updateScrapbook(id, payload);
            } else {
                const created = await scrapbookService.createScrapbook(payload);
                navigate(`/scrapbook/edit/${created.id}`);
            }
            alert("Draft saved successfully!");
        } catch (err) {
            console.error("Failed to save scrapbook", err);
            alert("Error saving scrapbook draft.");
        } finally {
            setSaving(false);
        }
    };

    // Canvas page managers
    const addPage = () => {
        const newId = pages.length > 0 ? Math.max(...pages.map(p => p.id)) + 1 : 1;
        setPages([...pages, { id: newId, background: 'parchment', elements: [] }]);
        setCurrentPageIndex(pages.length);
    };

    const deletePage = (index) => {
        if (pages.length <= 1) return;
        setConfirmModal({
            title: "Delete Page",
            message: "Are you sure you want to delete this page? All elements on it will be lost?",
            confirmText: "Delete",
            isDanger: true,
            onConfirm: () => {
                const newPages = pages.filter((_, idx) => idx !== index);
                setPages(newPages);
                setCurrentPageIndex(Math.max(0, index - 1));
                setSelectedElementId(null);
            }
        });
    };

    const changeBackground = (bgId) => {
        const updated = [...pages];
        updated[currentPageIndex].background = bgId;
        setPages(updated);
    };

    // Canvas element management
    const addElement = (element) => {
        const updated = [...pages];
        const newElement = {
            id: `elem_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            zIndex: updated[currentPageIndex].elements.length + 1,
            rotation: 0,
            x: 20,
            y: 20,
            width: 50,
            height: 25,
            ...element
        };
        updated[currentPageIndex].elements.push(newElement);
        setPages(updated);
        setSelectedElementId(newElement.id);
    };

    const deleteElement = (elemId) => {
        const updated = [...pages];
        updated[currentPageIndex].elements = updated[currentPageIndex].elements.filter(el => el.id !== elemId);
        setPages(updated);
        if (selectedElementId === elemId) setSelectedElementId(null);
    };

    const updateElementProperty = (elemId, key, value) => {
        const updated = [...pages];
        updated[currentPageIndex].elements = updated[currentPageIndex].elements.map(el => {
            if (el.id === elemId) {
                return { ...el, [key]: value };
            }
            return el;
        });
        setPages(updated);
    };

    const duplicateElement = (elemId) => {
        const updated = [...pages];
        const source = updated[currentPageIndex].elements.find(el => el.id === elemId);
        if (!source) return;
        const copy = {
            ...source,
            id: `elem_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            x: Math.min(80, source.x + 5),
            y: Math.min(80, source.y + 5),
            zIndex: updated[currentPageIndex].elements.length + 1
        };
        updated[currentPageIndex].elements.push(copy);
        setPages(updated);
        setSelectedElementId(copy.id);
    };

    const adjustZIndex = (elemId, direction) => {
        const updated = [...pages];
        const elements = updated[currentPageIndex].elements;
        const sourceIndex = elements.findIndex(el => el.id === elemId);
        if (sourceIndex === -1) return;
        
        const newZ = elements[sourceIndex].zIndex + (direction === 'up' ? 1 : -1);
        elements[sourceIndex].zIndex = Math.max(1, newZ);
        
        // Sort elements to clean z-index sequence
        elements.sort((a, b) => a.zIndex - b.zIndex);
        elements.forEach((el, index) => {
            el.zIndex = index + 1;
        });
        
        setPages(updated);
    };

    // Predefined Templates
    const applyTemplate = (templateType) => {
        setConfirmModal({
            title: "Overwrite Layout",
            message: "Applying a template will overwrite current page layout. Do you want to proceed?",
            confirmText: "Apply Template",
            isDanger: false,
            onConfirm: () => {
                applyTemplateImmediate(templateType);
            }
        });
    };

    const applyTemplateImmediate = (templateType) => {
        const updated = [...pages];
        const page = updated[currentPageIndex];
        page.elements = [];

        if (templateType === 'polaroid_grid') {
            page.background = 'kraft';
            // Polaroid 1
            page.elements.push({
                id: `elem_${Date.now()}_1`,
                type: 'text',
                x: 10, y: 5, width: 80, height: 10, rotation: -1, zIndex: 1,
                content: "Beautiful Polaroids",
                style: { fontFamily: 'Dancing Script', fontSize: '32px', color: '#4a2503', textAlign: 'center' }
            });
            page.elements.push({
                id: `elem_${Date.now()}_2`,
                type: 'memory',
                isPlaceholder: true,
                title: "Polaroid Photo 1",
                description: "Sweet nostalgic day with the family.",
                mediaType: "image",
                mediaUrl: "https://images.unsplash.com/photo-1501854140801-50d01698950b?w=600&auto=format&fit=crop",
                x: 10, y: 18, width: 36, height: 42, rotation: -4, zIndex: 2
            });
            // Washi tape for photo 1
            page.elements.push({
                id: `elem_${Date.now()}_3`,
                type: 'sticker',
                stickerType: 'tape',
                content: 'washi-tape',
                style: { opacity: 0.8, background: 'repeating-linear-gradient(45deg, #c05c5c, #c05c5c 10px, #dca8a8 10px, #dca8a8 20px)' },
                x: 12, y: 14, width: 22, height: 6, rotation: -20, zIndex: 3
            });
            // Polaroid 2
            page.elements.push({
                id: `elem_${Date.now()}_4`,
                type: 'memory',
                isPlaceholder: true,
                title: "Polaroid Photo 2",
                description: "Capturing details of our golden heritage.",
                mediaType: "image",
                mediaUrl: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=600&auto=format&fit=crop",
                x: 52, y: 22, width: 36, height: 42, rotation: 3, zIndex: 4
            });
            // Tape for photo 2
            page.elements.push({
                id: `elem_${Date.now()}_5`,
                type: 'sticker',
                stickerType: 'tape',
                content: 'washi-tape',
                style: { opacity: 0.8, background: 'repeating-linear-gradient(90deg, #4a8b8b, #4a8b8b 15px, #86b4b4 15px, #86b4b4 20px)' },
                x: 60, y: 18, width: 22, height: 6, rotation: 15, zIndex: 5
            });
            // Pin decorative
            page.elements.push({
                id: `elem_${Date.now()}_6`,
                type: 'sticker',
                stickerType: 'pin',
                content: '📌',
                x: 48, y: 64, width: 6, height: 6, rotation: 0, zIndex: 6
            });
            // Custom text
            page.elements.push({
                id: `elem_${Date.now()}_7`,
                type: 'text',
                x: 15, y: 68, width: 70, height: 18, rotation: 1, zIndex: 7,
                content: "These photos are frozen moments of absolute bliss. Laughing together is what we do best.",
                style: { fontFamily: 'Pacifico', fontSize: '18px', color: '#2e1f0f', textAlign: 'center' }
            });

        } else if (templateType === 'vintage_journal') {
            page.background = 'parchment';
            page.elements.push({
                id: `elem_${Date.now()}_1`,
                type: 'text',
                x: 12, y: 8, width: 76, height: 12, rotation: 0, zIndex: 1,
                content: "Day Journal Entry",
                style: { fontFamily: 'serif', fontSize: '30px', color: '#3d2106', textAlign: 'left', fontWeight: 'bold' }
            });
            page.elements.push({
                id: `elem_${Date.now()}_2`,
                type: 'memory',
                isPlaceholder: true,
                title: "Journal Picture",
                description: "Vintage landmark from our roots.",
                mediaType: "image",
                mediaUrl: "https://images.unsplash.com/photo-1448375240586-882707db888b?w=600&auto=format&fit=crop",
                x: 12, y: 22, width: 42, height: 50, rotation: -2, zIndex: 2
            });
            page.elements.push({
                id: `elem_${Date.now()}_3`,
                type: 'sticker',
                stickerType: 'pin',
                content: '📎',
                x: 28, y: 18, width: 8, height: 8, rotation: -10, zIndex: 3
            });
            page.elements.push({
                id: `elem_${Date.now()}_4`,
                type: 'text',
                x: 58, y: 22, width: 30, height: 50, rotation: 0, zIndex: 4,
                content: "Entering a quiet space of memories. We felt connected to our ancestors walking down this path. The smell of pine and paper was all around.",
                style: { fontFamily: 'Dancing Script', fontSize: '20px', color: '#4a2503', textAlign: 'left' }
            });
            page.elements.push({
                id: `elem_${Date.now()}_5`,
                type: 'sticker',
                stickerType: 'emoji',
                content: '✨',
                x: 70, y: 78, width: 10, height: 10, rotation: 5, zIndex: 5
            });

        } else if (templateType === 'audio_video_showcase') {
            page.background = 'grid';
            page.elements.push({
                id: `elem_${Date.now()}_1`,
                type: 'text',
                x: 10, y: 6, width: 80, height: 8, rotation: 0, zIndex: 1,
                content: "Scan to Play our Memories",
                style: { fontFamily: 'Dancing Script', fontSize: '32px', color: '#704214', textAlign: 'center' }
            });

            // Find an audio or video memory to use, or default
            const videoStory = stories.find(s => s.mediaFiles?.some(m => m.mediaType.includes('video') || m.mediaType.includes('audio')));
            const displayTitle = videoStory ? videoStory.title : "Family Golden Memories";
            const displayDesc = videoStory ? videoStory.description : "Scan code with your phone to listen/watch this heritage snippet.";
            const qrTargetUrl = videoStory ? `${window.location.origin}/story/${videoStory.id}` : window.location.origin;

            page.elements.push({
                id: `elem_${Date.now()}_2`,
                type: 'memory',
                isPlaceholder: true,
                title: displayTitle,
                description: displayDesc,
                mediaType: videoStory?.mediaFiles?.[0]?.mediaType || "image",
                mediaUrl: videoStory?.mediaFiles?.[0]?.mediaUrl || "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=600&auto=format&fit=crop",
                x: 10, y: 18, width: 50, height: 55, rotation: -2, zIndex: 2
            });

            page.elements.push({
                id: `elem_${Date.now()}_3`,
                type: 'text',
                x: 64, y: 18, width: 26, height: 10, rotation: 0, zIndex: 3,
                content: "🎵 Playback Scan",
                style: { fontFamily: 'sans-serif', fontSize: '14px', color: '#1a1a1a', textAlign: 'center', fontWeight: 'bold' }
            });

            // Render QR Code elements
            page.elements.push({
                id: `elem_${Date.now()}_4`,
                type: 'qr',
                qrUrl: qrTargetUrl,
                x: 64, y: 30, width: 26, height: 26, rotation: 5, zIndex: 4
            });

            page.elements.push({
                id: `elem_${Date.now()}_5`,
                type: 'sticker',
                stickerType: 'emoji',
                content: '🍂',
                x: 74, y: 62, width: 8, height: 8, rotation: 12, zIndex: 5
            });
        } else if (templateType === 'birthday_preset') {
            page.background = 'pastel-rose';
            // Title
            page.elements.push({
                id: `elem_${Date.now()}_title`,
                type: 'text',
                x: 10, y: 5, width: 80, height: 10, rotation: -1, zIndex: 1,
                content: "Happy Birthday! 🎉",
                style: { fontFamily: 'Dancing Script', fontSize: '36px', color: '#c05c5c', textAlign: 'center', fontWeight: 'bold' }
            });
            // Photo Placeholder 1
            page.elements.push({
                id: `elem_${Date.now()}_photo1`,
                type: 'memory',
                isPlaceholder: true,
                title: "Birthday Photo Frame",
                description: "Upload cake cutting or fun memories.",
                mediaUrl: "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=600&auto=format&fit=crop",
                mediaType: "image",
                x: 12, y: 18, width: 36, height: 42, rotation: -3, zIndex: 2
            });
            // Tape
            page.elements.push({
                id: `elem_${Date.now()}_tape1`,
                type: 'sticker',
                stickerType: 'tape',
                content: 'washi-tape',
                style: { opacity: 0.8, background: 'repeating-linear-gradient(45deg, #c05c5c, #c05c5c 10px, #dca8a8 10px, #dca8a8 20px)' },
                x: 14, y: 13, width: 22, height: 6, rotation: -20, zIndex: 3
            });
            // Photo Placeholder 2
            page.elements.push({
                id: `elem_${Date.now()}_photo2`,
                type: 'memory',
                isPlaceholder: true,
                title: "Celebration Snap",
                description: "Family group picture.",
                mediaUrl: "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=600&auto=format&fit=crop",
                mediaType: "image",
                x: 52, y: 22, width: 36, height: 42, rotation: 4, zIndex: 4
            });
            // Cake sticker
            page.elements.push({
                id: `elem_${Date.now()}_cake`,
                type: 'sticker',
                stickerType: 'emoji',
                content: '🎂',
                x: 46, y: 64, width: 8, height: 8, rotation: 0, zIndex: 5
            });
            // Balloons sticker
            page.elements.push({
                id: `elem_${Date.now()}_balloons`,
                type: 'sticker',
                stickerType: 'emoji',
                content: '🎈',
                x: 82, y: 12, width: 8, height: 10, rotation: 12, zIndex: 6
            });
            // Text caption
            page.elements.push({
                id: `elem_${Date.now()}_cap`,
                type: 'text',
                x: 15, y: 72, width: 70, height: 18, rotation: 1, zIndex: 7,
                content: "A beautiful year of laughter, growth, and counting blessings together. Wishing the happiest of days!",
                style: { fontFamily: 'Pacifico', fontSize: '18px', color: '#c05c5c', textAlign: 'center' }
            });

        } else if (templateType === 'anniversary_preset') {
            page.background = 'parchment';
            // Title
            page.elements.push({
                id: `elem_${Date.now()}_title`,
                type: 'text',
                x: 10, y: 6, width: 80, height: 10, rotation: 0, zIndex: 1,
                content: "Our Love Story - Happy Anniversary",
                style: { fontFamily: 'serif', fontSize: '28px', color: '#3d2106', textAlign: 'center', fontWeight: 'bold' }
            });
            // Placeholder 1
            page.elements.push({
                id: `elem_${Date.now()}_photo1`,
                type: 'memory',
                isPlaceholder: true,
                title: "Wedding/Anniversary Memory",
                description: "Vintage wedding snap or dinner memory.",
                mediaUrl: "https://images.unsplash.com/photo-1519741497674-611481863552?w=600&auto=format&fit=crop",
                mediaType: "image",
                x: 14, y: 20, width: 40, height: 48, rotation: -2, zIndex: 2
            });
            // Clip sticker
            page.elements.push({
                id: `elem_${Date.now()}_clip`,
                type: 'sticker',
                stickerType: 'pin',
                content: '📎',
                x: 30, y: 15, width: 8, height: 8, rotation: -15, zIndex: 3
            });
            // Rings sticker
            page.elements.push({
                id: `elem_${Date.now()}_ring`,
                type: 'sticker',
                stickerType: 'emoji',
                content: '💍',
                x: 70, y: 22, width: 8, height: 8, rotation: 15, zIndex: 4
            });
            // Heart sticker
            page.elements.push({
                id: `elem_${Date.now()}_heart`,
                type: 'sticker',
                stickerType: 'emoji',
                content: '❤️',
                x: 64, y: 48, width: 6, height: 6, rotation: 0, zIndex: 5
            });
            // Letter text
            page.elements.push({
                id: `elem_${Date.now()}_letter`,
                type: 'text',
                x: 58, y: 32, width: 32, height: 40, rotation: 0, zIndex: 6,
                content: "Two hearts, one journey. Through all the shared sunsets, cups of tea, and quiet milestones, our bond grew stronger.",
                style: { fontFamily: 'Dancing Script', fontSize: '20px', color: '#4a2503', textAlign: 'left' }
            });

        } else if (templateType === 'achievements_preset') {
            page.background = 'grid';
            // Title
            page.elements.push({
                id: `elem_${Date.now()}_title`,
                type: 'text',
                x: 10, y: 6, width: 80, height: 8, rotation: 0, zIndex: 1,
                content: "Congratulations on the Milestone!",
                style: { fontFamily: 'sans-serif', fontSize: '24px', color: '#111827', textAlign: 'center', fontWeight: 'bold' }
            });
            // Placeholder
            page.elements.push({
                id: `elem_${Date.now()}_photo`,
                type: 'memory',
                isPlaceholder: true,
                title: "Achievement Picture",
                description: "Graduation ceremony, award, or new house snap.",
                mediaUrl: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=600&auto=format&fit=crop",
                mediaType: "image",
                x: 20, y: 16, width: 60, height: 50, rotation: 1, zIndex: 2
            });
            // Washi tape gold
            page.elements.push({
                id: `elem_${Date.now()}_tape`,
                type: 'sticker',
                stickerType: 'tape',
                content: 'washi-tape',
                style: { opacity: 0.8, background: 'linear-gradient(to right, #d2ab51, #e3c177, #d2ab51)' },
                x: 38, y: 11, width: 24, height: 6, rotation: -3, zIndex: 3
            });
            // Trophy
            page.elements.push({
                id: `elem_${Date.now()}_trophy`,
                type: 'sticker',
                stickerType: 'emoji',
                content: '🏆',
                x: 12, y: 70, width: 8, height: 8, rotation: -8, zIndex: 4
            });
            // Grad cap
            page.elements.push({
                id: `elem_${Date.now()}_cap`,
                type: 'sticker',
                stickerType: 'emoji',
                content: '🎓',
                x: 80, y: 70, width: 8, height: 8, rotation: 8, zIndex: 5
            });
            // Text desc
            page.elements.push({
                id: `elem_${Date.now()}_desc`,
                type: 'text',
                x: 22, y: 70, width: 56, height: 18, rotation: 0, zIndex: 6,
                content: "Success is the sum of small efforts, repeated day in and day out. Proud of this milestone!",
                style: { fontFamily: 'serif', fontSize: '15px', color: '#1a1a1a', textAlign: 'center' }
            });

        } else if (templateType === 'travel_preset') {
            page.background = 'kraft';
            // Title
            page.elements.push({
                id: `elem_${Date.now()}_title`,
                type: 'text',
                x: 10, y: 6, width: 80, height: 8, rotation: -2, zIndex: 1,
                content: "Wanderlust - Travel Diary ✈️",
                style: { fontFamily: 'Pacifico', fontSize: '24px', color: '#3d2106', textAlign: 'center' }
            });
            // Placeholder 1
            page.elements.push({
                id: `elem_${Date.now()}_photo1`,
                type: 'memory',
                isPlaceholder: true,
                title: "Adventure Landmark",
                description: "Mountain, beach, or sunset.",
                mediaUrl: "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=600&auto=format&fit=crop",
                mediaType: "image",
                x: 10, y: 18, width: 38, height: 44, rotation: -4, zIndex: 2
            });
            // Placeholder 2
            page.elements.push({
                id: `elem_${Date.now()}_photo2`,
                type: 'memory',
                isPlaceholder: true,
                title: "On the Road Snap",
                description: "Travel group snapshot.",
                mediaUrl: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&auto=format&fit=crop",
                mediaType: "image",
                x: 52, y: 22, width: 38, height: 44, rotation: 3, zIndex: 3
            });
            // Camera sticker
            page.elements.push({
                id: `elem_${Date.now()}_cam`,
                type: 'sticker',
                stickerType: 'emoji',
                content: '📸',
                x: 47, y: 64, width: 6, height: 6, rotation: -5, zIndex: 4
            });
            // Suitcase sticker
            page.elements.push({
                id: `elem_${Date.now()}_case`,
                type: 'sticker',
                stickerType: 'emoji',
                content: '🧳',
                x: 82, y: 12, width: 8, height: 8, rotation: 10, zIndex: 5
            });
            // Map
            page.elements.push({
                id: `elem_${Date.now()}_map`,
                type: 'sticker',
                stickerType: 'emoji',
                content: '🗺️',
                x: 10, y: 64, width: 8, height: 8, rotation: -12, zIndex: 6
            });
            // Text
            page.elements.push({
                id: `elem_${Date.now()}_desc`,
                type: 'text',
                x: 15, y: 72, width: 70, height: 18, rotation: 0, zIndex: 7,
                content: "Collect moments, not things. We wandered through new streets, tasted local spices, and left footprints.",
                style: { fontFamily: 'Dancing Script', fontSize: '20px', color: '#2e1f0f', textAlign: 'center' }
            });
        }
        setPages(updated);
    };

    // Helper functions for Drag and Drop mouse transforms
    const handleMouseDown = (e, elem, dragType) => {
        e.stopPropagation();
        e.preventDefault();

        setSelectedElementId(elem.id);

        const rect = containerRef.current.getBoundingClientRect();
        // Convert screen pixel locations
        const mouseX = e.clientX;
        const mouseY = e.clientY;

        let startVal;
        if (dragType === 'move') {
            startVal = { x: elem.x, y: elem.y };
        } else if (dragType.startsWith('resize')) {
            startVal = { x: elem.x, y: elem.y, width: elem.width, height: elem.height };
        } else if (dragType === 'rotate') {
            // Find center coordinates in pixels relative to viewport
            const elemNode = document.getElementById(elem.id);
            const elemRect = elemNode.getBoundingClientRect();
            const centerX = elemRect.left + elemRect.width / 2;
            const centerY = elemRect.top + elemRect.height / 2;
            startVal = { centerX, centerY, initialRot: elem.rotation };
        }

        setDragState({
            type: dragType,
            elementId: elem.id,
            startX: mouseX,
            startY: mouseY,
            startVal
        });
    };

    const handleMouseMove = (e) => {
        if (!dragState) return;

        const rect = containerRef.current.getBoundingClientRect();
        const currentElement = pages[currentPageIndex].elements.find(el => el.id === dragState.elementId);
        if (!currentElement) return;

        if (dragState.type === 'move') {
            // Convert delta pixels to percentage bounds of container
            const deltaPctX = ((e.clientX - dragState.startX) / rect.width) * 100;
            const deltaPctY = ((e.clientY - dragState.startY) / rect.height) * 100;

            const nextX = Math.max(0, Math.min(100 - currentElement.width, dragState.startVal.x + deltaPctX));
            const nextY = Math.max(0, Math.min(100 - currentElement.height, dragState.startVal.y + deltaPctY));

            updateElementProperty(dragState.elementId, 'x', Math.round(nextX * 10) / 10);
            updateElementProperty(dragState.elementId, 'y', Math.round(nextY * 10) / 10);

        } else if (dragState.type.startsWith('resize')) {
            const deltaPctX = ((e.clientX - dragState.startX) / rect.width) * 100;
            const deltaPctY = ((e.clientY - dragState.startY) / rect.height) * 100;

            let nextX = currentElement.x;
            let nextY = currentElement.y;
            let nextW = currentElement.width;
            let nextH = currentElement.height;

            if (dragState.type === 'resize-br' || dragState.type === 'resize') {
                nextW = Math.max(5, Math.min(100 - currentElement.x, dragState.startVal.width + deltaPctX));
                nextH = Math.max(5, Math.min(100 - currentElement.y, dragState.startVal.height + deltaPctY));
            } else if (dragState.type === 'resize-bl') {
                const tentativeW = dragState.startVal.width - deltaPctX;
                const tentativeX = dragState.startVal.x + deltaPctX;
                if (tentativeW >= 5 && tentativeX >= 0) {
                    nextW = tentativeW;
                    nextX = tentativeX;
                }
                nextH = Math.max(5, Math.min(100 - currentElement.y, dragState.startVal.height + deltaPctY));
            } else if (dragState.type === 'resize-tl') {
                const tentativeW = dragState.startVal.width - deltaPctX;
                const tentativeX = dragState.startVal.x + deltaPctX;
                if (tentativeW >= 5 && tentativeX >= 0) {
                    nextW = tentativeW;
                    nextX = tentativeX;
                }
                const tentativeH = dragState.startVal.height - deltaPctY;
                const tentativeY = dragState.startVal.y + deltaPctY;
                if (tentativeH >= 5 && tentativeY >= 0) {
                    nextH = tentativeH;
                    nextY = tentativeY;
                }
            } else if (dragState.type === 'resize-r') {
                nextW = Math.max(5, Math.min(100 - currentElement.x, dragState.startVal.width + deltaPctX));
            } else if (dragState.type === 'resize-l') {
                const tentativeW = dragState.startVal.width - deltaPctX;
                const tentativeX = dragState.startVal.x + deltaPctX;
                if (tentativeW >= 5 && tentativeX >= 0) {
                    nextW = tentativeW;
                    nextX = tentativeX;
                }
            } else if (dragState.type === 'resize-b') {
                nextH = Math.max(5, Math.min(100 - currentElement.y, dragState.startVal.height + deltaPctY));
            } else if (dragState.type === 'resize-t') {
                const tentativeH = dragState.startVal.height - deltaPctY;
                const tentativeY = dragState.startVal.y + deltaPctY;
                if (tentativeH >= 5 && tentativeY >= 0) {
                    nextH = tentativeH;
                    nextY = tentativeY;
                }
            }

            updateElementProperty(dragState.elementId, 'width', Math.round(nextW * 10) / 10);
            updateElementProperty(dragState.elementId, 'height', Math.round(nextH * 10) / 10);
            updateElementProperty(dragState.elementId, 'x', Math.round(nextX * 10) / 10);
            updateElementProperty(dragState.elementId, 'y', Math.round(nextY * 10) / 10);

        } else if (dragState.type === 'rotate') {
            // Angle vector math between mouse position and center of selected card
            const dy = e.clientY - dragState.startVal.centerY;
            const dx = e.clientX - dragState.startVal.centerX;
            let angle = Math.atan2(dy, dx) * (180 / Math.PI);
            
            // Adjust offset of initial angle on start drag
            const startDy = dragState.startY - dragState.startVal.centerY;
            const startDx = dragState.startX - dragState.startVal.centerX;
            const startAngle = Math.atan2(startDy, startDx) * (180 / Math.PI);
            
            const nextRot = (dragState.startVal.initialRot + (angle - startAngle)) % 360;
            updateElementProperty(dragState.elementId, 'rotation', Math.round(nextRot));
        }
    };

    const handleMouseUp = () => {
        setDragState(null);
    };

    useEffect(() => {
        if (dragState) {
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);
        }
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [dragState]);

    // Active page background config style
    const activePage = pages[currentPageIndex] || { background: 'parchment', elements: [] };
    const selectedBg = BACKGROUNDS.find(bg => bg.id === activePage.background) || BACKGROUNDS[0];

    const currentSelectedElement = activePage.elements?.find(el => el.id === selectedElementId);

    // Filters for memories
    const filteredStories = stories.filter(story =>
        story.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        story.description?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="max-w-7xl mx-auto px-4 py-6 print:p-0 print:max-w-none">
            {/* Header section (hidden during print) */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between border-b border-gray-150 pb-5 mb-6 print:hidden gap-4">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => navigate('/scrapbooks')}
                        className="p-2 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer"
                    >
                        <ArrowLeft className="w-5 h-5 text-gray-700" />
                    </button>
                    <div>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="text-2xl font-bold text-gray-900 border-b border-transparent hover:border-gray-300 focus:border-amber-700 focus:outline-none bg-transparent py-0.5 px-1 font-serif max-w-xs md:max-w-md"
                            placeholder="Title of Scrapbook"
                        />
                        <input
                            type="text"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="text-xs text-gray-500 border-b border-transparent hover:border-gray-300 focus:border-amber-700 focus:outline-none bg-transparent w-full mt-1 px-1"
                            placeholder="Add scrapbook description..."
                        />
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setAutoGenOpen(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-amber-55/60 text-amber-900 border border-amber-200 rounded-xl hover:bg-amber-100 transition-all font-semibold shadow-sm cursor-pointer"
                    >
                        <Sparkles className="w-4 h-4 text-amber-750" />
                        Auto-Layout
                    </button>
                    <button
                        onClick={() => setPreviewOpen(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-white text-gray-700 border border-gray-250 rounded-xl hover:bg-gray-50 transition-all font-medium cursor-pointer"
                    >
                        <BookOpen className="w-4 h-4 text-amber-750" />
                        3D Book Preview
                    </button>
                    <button
                        onClick={handlePrintScrapbook}
                        className="flex items-center gap-2 px-4 py-2 bg-white text-gray-700 border border-gray-250 rounded-xl hover:bg-gray-50 transition-all font-medium cursor-pointer"
                    >
                        <Printer className="w-4 h-4" />
                        Print / PDF
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="flex items-center gap-2 px-5 py-2 bg-amber-700 hover:bg-amber-800 text-white rounded-xl transition-all font-semibold shadow-md shadow-amber-900/10 cursor-pointer disabled:opacity-50"
                    >
                        <Save className="w-4 h-4" />
                        {saving ? "Saving..." : "Save Draft"}
                    </button>
                </div>
            </div>

            {/* Layout Workspace */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start print:grid-cols-1 print:gap-0">
                {/* Left Sidebar Toolbar (hidden during print) */}
                <div className="lg:col-span-4 bg-white rounded-2xl border border-gray-150 shadow-sm overflow-hidden flex flex-col print:hidden max-h-[820px] h-full sticky top-20">
                    {/* Tabs navigation */}
                    <div className="flex border-b border-gray-100 bg-gray-50 text-xs font-semibold text-gray-600">
                        <button
                            onClick={() => setActiveTab('templates')}
                            className={`flex-1 py-3 px-2 text-center border-b-2 transition-all cursor-pointer flex items-center justify-center gap-1 ${activeTab === 'templates' ? 'border-amber-700 text-amber-800 bg-white' : 'border-transparent hover:bg-gray-100'}`}
                        >
                            <Layout className="w-3.5 h-3.5" />
                            Presets
                        </button>
                        <button
                            onClick={() => setActiveTab('memories')}
                            className={`flex-1 py-3 px-2 text-center border-b-2 transition-all cursor-pointer flex items-center justify-center gap-1 ${activeTab === 'memories' ? 'border-amber-700 text-amber-800 bg-white' : 'border-transparent hover:bg-gray-100'}`}
                        >
                            <ImageIcon className="w-3.5 h-3.5" />
                            Memories
                        </button>
                        <button
                            onClick={() => setActiveTab('stickers')}
                            className={`flex-1 py-3 px-2 text-center border-b-2 transition-all cursor-pointer flex items-center justify-center gap-1 ${activeTab === 'stickers' ? 'border-amber-700 text-amber-800 bg-white' : 'border-transparent hover:bg-gray-100'}`}
                        >
                            <StickerIcon className="w-3.5 h-3.5" />
                            Stickers
                        </button>
                        <button
                            onClick={() => setActiveTab('text')}
                            className={`flex-1 py-3 px-2 text-center border-b-2 transition-all cursor-pointer flex items-center justify-center gap-1 ${activeTab === 'text' ? 'border-amber-700 text-amber-800 bg-white' : 'border-transparent hover:bg-gray-100'}`}
                        >
                            <Type className="w-3.5 h-3.5" />
                            Fonts
                        </button>
                    </div>

                    <div className="p-5 overflow-y-auto flex-1 max-h-[500px]">
                        {/* Templates tab */}
                        {activeTab === 'templates' && (
                            <div className="space-y-4">
                                <h3 className="font-bold text-sm text-gray-800">Choose Canvas Template</h3>
                                <div className="grid grid-cols-1 gap-3 max-h-[280px] overflow-y-auto pr-1">
                                    <button
                                        onClick={() => applyTemplate('polaroid_grid')}
                                        className="p-3 border border-gray-150 rounded-xl hover:border-amber-600 hover:bg-amber-50/20 text-left transition-all cursor-pointer"
                                    >
                                        <p className="font-bold text-xs text-amber-900">Classic Polaroid Grid</p>
                                        <p className="text-[11px] text-gray-500 mt-1">Side-by-side retro snapshots stuck with washi tapes.</p>
                                    </button>
                                    <button
                                        onClick={() => applyTemplate('vintage_journal')}
                                        className="p-3 border border-gray-150 rounded-xl hover:border-amber-600 hover:bg-amber-50/20 text-left transition-all cursor-pointer"
                                    >
                                        <p className="font-bold text-xs text-amber-900">Vintage Journal Entry</p>
                                        <p className="text-[11px] text-gray-500 mt-1">Elegant paper clip design with cursive descriptions and stamp borders.</p>
                                    </button>
                                    <button
                                        onClick={() => applyTemplate('audio_video_showcase')}
                                        className="p-3 border border-gray-150 rounded-xl hover:border-amber-600 hover:bg-amber-50/20 text-left transition-all cursor-pointer"
                                    >
                                        <p className="font-bold text-xs text-amber-900">Interactive Audio/Video Board</p>
                                        <p className="text-[11px] text-gray-500 mt-1">Auto-generates scanner QR codes next to dynamic memories.</p>
                                    </button>
                                    <button
                                        onClick={() => applyTemplate('birthday_preset')}
                                        className="p-3 border border-gray-150 rounded-xl hover:border-amber-600 hover:bg-amber-50/20 text-left transition-all cursor-pointer border-dashed"
                                    >
                                        <p className="font-bold text-xs text-amber-900 flex items-center gap-1">🎈 Birthday Celebration</p>
                                        <p className="text-[11px] text-gray-500 mt-1">Balloons, cake decorations, and empty frame placeholders.</p>
                                    </button>
                                    <button
                                        onClick={() => applyTemplate('anniversary_preset')}
                                        className="p-3 border border-gray-150 rounded-xl hover:border-amber-600 hover:bg-amber-50/20 text-left transition-all cursor-pointer border-dashed"
                                    >
                                        <p className="font-bold text-xs text-amber-900 flex items-center gap-1">💍 Anniversary Milestone</p>
                                        <p className="text-[11px] text-gray-500 mt-1">Hearts and ring stickers with a romantic letter layout.</p>
                                    </button>
                                    <button
                                        onClick={() => applyTemplate('achievements_preset')}
                                        className="p-3 border border-gray-150 rounded-xl hover:border-amber-600 hover:bg-amber-50/20 text-left transition-all cursor-pointer border-dashed"
                                    >
                                        <p className="font-bold text-xs text-amber-900 flex items-center gap-1">🏆 Achievement Milestone</p>
                                        <p className="text-[11px] text-gray-500 mt-1">Trophy, grad cap details, and recognition frames.</p>
                                    </button>
                                    <button
                                        onClick={() => applyTemplate('travel_preset')}
                                        className="p-3 border border-gray-150 rounded-xl hover:border-amber-600 hover:bg-amber-50/20 text-left transition-all cursor-pointer border-dashed"
                                    >
                                        <p className="font-bold text-xs text-amber-900 flex items-center gap-1">✈️ Travel Adventure</p>
                                        <p className="text-[11px] text-gray-500 mt-1">Maps, suitcases, sunglasses, and photo slots.</p>
                                    </button>
                                </div>

                                <div className="border-t border-gray-100 pt-4 mt-4">
                                    <h3 className="font-bold text-sm text-gray-800 mb-3 flex items-center gap-1.5">
                                        <Palette className="w-4 h-4 text-amber-700" />
                                        Paper Texture
                                    </h3>
                                    <div className="grid grid-cols-2 gap-2">
                                        {BACKGROUNDS.map(bg => (
                                            <button
                                                key={bg.id}
                                                onClick={() => changeBackground(bg.id)}
                                                className={`p-2 border rounded-xl text-left transition-all flex flex-col gap-1.5 cursor-pointer ${activePage.background === bg.id ? 'border-amber-700 bg-amber-50/40' : 'border-gray-200 hover:border-gray-300'}`}
                                            >
                                                <div className="w-full h-8 rounded border border-gray-200" style={bg.style}></div>
                                                <span className="text-[10px] font-medium text-gray-700 truncate w-full">{bg.name}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Memories tab */}
                        {activeTab === 'memories' && (
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <h3 className="font-bold text-sm text-gray-800">Your Posted Memories</h3>
                                    <span className="text-[10px] bg-amber-50 text-amber-800 font-semibold px-2 py-0.5 rounded-full border border-amber-100">{filteredStories.length} found</span>
                                </div>

                                <input
                                    type="text"
                                    placeholder="Search stories..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full p-2 text-xs border border-gray-200 rounded-xl focus:border-amber-700 focus:outline-none"
                                />

                                <div className="grid grid-cols-1 gap-2.5 max-h-[350px] overflow-y-auto pr-1">
                                    {filteredStories.map(story => {
                                        const mainImage = story.mediaFiles?.find(f => f.mediaType.includes('image'))?.mediaUrl ||
                                                          "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=300&auto=format&fit=crop";
                                        const hasMultimedia = story.mediaFiles?.some(f => f.mediaType.includes('video') || f.mediaType.includes('audio'));
                                        
                                        return (
                                            <div
                                                key={story.id}
                                                className="group/item border border-gray-150 p-2.5 rounded-xl hover:border-amber-700 hover:bg-amber-50/20 transition-all flex gap-3 items-center justify-between cursor-pointer"
                                                onClick={() => addElement({
                                                    type: 'memory',
                                                    storyId: story.id,
                                                    title: story.title,
                                                    description: story.description || '',
                                                    mediaUrl: story.mediaFiles?.[0]?.mediaUrl || mainImage,
                                                    mediaType: story.mediaFiles?.[0]?.mediaType || 'image',
                                                    width: 40,
                                                    height: 45
                                                })}
                                            >
                                                <div className="flex gap-2 items-center min-w-0">
                                                    <img src={mainImage} className="w-10 h-10 object-cover rounded-lg border border-gray-200" alt="" />
                                                    <div className="min-w-0">
                                                        <p className="text-xs font-bold text-gray-800 truncate">{story.title}</p>
                                                        <p className="text-[10px] text-gray-500 truncate">{story.location || 'No location'}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-1.5">
                                                    {hasMultimedia && (
                                                        <Volume2 className="w-3.5 h-3.5 text-amber-700" title="Audio/Video story" />
                                                    )}
                                                    <Plus className="w-4 h-4 text-gray-400 group-hover/item:text-amber-700" />
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* Stickers tab */}
                        {activeTab === 'stickers' && (
                            <div className="space-y-4">
                                <h3 className="font-bold text-sm text-gray-800">Add Vintage Stickers</h3>
                                
                                <div className="grid grid-cols-3 gap-2.5">
                                    {STICKERS.map(sticker => (
                                        <button
                                            key={sticker.id}
                                            onClick={() => addElement({
                                                type: 'sticker',
                                                stickerType: sticker.type,
                                                content: sticker.content,
                                                style: sticker.style || {},
                                                width: sticker.type === 'tape' ? 24 : (sticker.type === 'badge' ? 22 : 10),
                                                height: sticker.type === 'tape' ? 6 : (sticker.type === 'badge' ? 6 : 10)
                                            })}
                                            className="p-2 border border-gray-150 rounded-xl hover:border-amber-700 hover:bg-amber-50/20 flex flex-col items-center justify-center gap-1 transition-all cursor-pointer h-16"
                                        >
                                            {sticker.type === 'tape' ? (
                                                <div className="w-12 h-3 rounded" style={sticker.style}></div>
                                            ) : (
                                                <span className="text-2xl select-none">{sticker.content}</span>
                                            )}
                                            <span className="text-[9px] text-gray-500 font-medium truncate w-full text-center">{sticker.name}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Text / Typography tab */}
                        {activeTab === 'text' && (
                            <div className="space-y-4">
                                <h3 className="font-bold text-sm text-gray-800">Typography Elements</h3>
                                
                                <div className="grid grid-cols-1 gap-2">
                                    <button
                                        onClick={() => addElement({
                                            type: 'text',
                                            content: 'Memory Heading',
                                            width: 60,
                                            height: 10,
                                            style: { fontFamily: 'Dancing Script', fontSize: '32px', color: '#3d2106', textAlign: 'center', fontWeight: 'bold' }
                                        })}
                                        className="p-3 border border-gray-150 rounded-xl hover:border-amber-700 hover:bg-amber-50/20 text-left transition-all cursor-pointer font-serif"
                                    >
                                        <p className="text-lg font-bold font-serif text-amber-900" style={{ fontFamily: 'Dancing Script' }}>Elegant Script Header</p>
                                        <p className="text-[10px] text-gray-500 mt-0.5">Perfect for handwriting signatures or titles.</p>
                                    </button>

                                    <button
                                        onClick={() => addElement({
                                            type: 'text',
                                            content: 'Journal description text. We visited this place on a warm sunny evening...',
                                            width: 50,
                                            height: 25,
                                            style: { fontFamily: 'serif', fontSize: '15px', color: '#4b5563', textAlign: 'left' }
                                        })}
                                        className="p-3 border border-gray-150 rounded-xl hover:border-amber-700 hover:bg-amber-50/20 text-left transition-all cursor-pointer"
                                    >
                                        <p className="text-sm font-semibold font-serif text-gray-800">Vintage Book Serif</p>
                                        <p className="text-[10px] text-gray-500 mt-0.5">Best for longer descriptions or letters.</p>
                                    </button>

                                    <button
                                        onClick={() => addElement({
                                            type: 'text',
                                            content: 'Short memo note...',
                                            width: 40,
                                            height: 12,
                                            style: { fontFamily: 'Pacifico', fontSize: '16px', color: '#8b5628', textAlign: 'center' }
                                        })}
                                        className="p-3 border border-gray-150 rounded-xl hover:border-amber-700 hover:bg-amber-50/20 text-left transition-all cursor-pointer"
                                    >
                                        <p className="text-sm font-semibold text-amber-700" style={{ fontFamily: 'Pacifico' }}>Playful Note</p>
                                        <p className="text-[10px] text-gray-500 mt-0.5">Fun cursive handwriting script.</p>
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Properties editor for selected elements */}
                    {currentSelectedElement && (
                        <div className="border-t border-gray-100 p-4 bg-amber-50/30">
                            <div className="flex items-center justify-between mb-3">
                                <span className="text-[11px] font-bold text-amber-900 uppercase tracking-wider">Properties Editor</span>
                                <button
                                    onClick={() => deleteElement(currentSelectedElement.id)}
                                    className="p-1.5 hover:bg-red-50 text-red-500 hover:text-red-700 rounded-lg transition-colors cursor-pointer"
                                    title="Delete Element"
                                >
                                    <Trash2 className="w-3.5 h-3.5" />
                                </button>
                            </div>

                            {/* Text specific edits */}
                            {currentSelectedElement.type === 'text' && (
                                <div className="space-y-3">
                                    <div>
                                        <label className="text-[10px] text-gray-500 font-semibold uppercase">Content</label>
                                        <textarea
                                            value={currentSelectedElement.content}
                                            onChange={(e) => updateElementProperty(currentSelectedElement.id, 'content', e.target.value)}
                                            className="w-full mt-1 p-2 text-xs border border-gray-200 rounded-lg focus:border-amber-700 focus:outline-none"
                                            rows={3}
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-2">
                                        <div>
                                            <label className="text-[10px] text-gray-500 font-semibold uppercase">Font Face</label>
                                            <select
                                                value={currentSelectedElement.style?.fontFamily || 'Dancing Script'}
                                                onChange={(e) => updateElementProperty(currentSelectedElement.id, 'style', { ...currentSelectedElement.style, fontFamily: e.target.value })}
                                                className="w-full mt-1 p-1 text-xs border border-gray-200 rounded-md bg-white focus:outline-none"
                                            >
                                                {FONTS.map(f => (
                                                    <option key={f.id} value={f.id}>{f.name}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="text-[10px] text-gray-500 font-semibold uppercase">Font Size</label>
                                            <select
                                                value={currentSelectedElement.style?.fontSize || '16px'}
                                                onChange={(e) => updateElementProperty(currentSelectedElement.id, 'style', { ...currentSelectedElement.style, fontSize: e.target.value })}
                                                className="w-full mt-1 p-1 text-xs border border-gray-200 rounded-md bg-white focus:outline-none"
                                            >
                                                {['12px', '14px', '16px', '18px', '22px', '28px', '32px', '40px', '48px'].map(sz => (
                                                    <option key={sz} value={sz}>{sz}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>

                                    <div className="flex gap-2">
                                        <div className="flex-1">
                                            <label className="text-[10px] text-gray-500 font-semibold uppercase">Text Align</label>
                                            <div className="flex border border-gray-200 rounded-md overflow-hidden bg-white mt-1">
                                                {['left', 'center', 'right'].map(align => (
                                                    <button
                                                        key={align}
                                                        onClick={() => updateElementProperty(currentSelectedElement.id, 'style', { ...currentSelectedElement.style, textAlign: align })}
                                                        className={`flex-1 py-1 text-[10px] font-semibold uppercase cursor-pointer text-center ${currentSelectedElement.style?.textAlign === align ? 'bg-amber-100 text-amber-800' : 'hover:bg-gray-50'}`}
                                                    >
                                                        {align}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                        <div>
                                            <label className="text-[10px] text-gray-500 font-semibold uppercase">Color</label>
                                            <input
                                                type="color"
                                                value={currentSelectedElement.style?.color || '#3d2106'}
                                                onChange={(e) => updateElementProperty(currentSelectedElement.id, 'style', { ...currentSelectedElement.style, color: e.target.value })}
                                                className="block w-full h-7 mt-1 p-0 rounded-md border border-gray-200 cursor-pointer"
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Memory specific edits (QR option) */}
                            {currentSelectedElement.type === 'memory' && (
                                <div className="space-y-3">
                                    {currentSelectedElement.isPlaceholder && (
                                        <div className="space-y-2 p-2 bg-amber-50 rounded-lg border border-amber-100">
                                            <label className="text-[10px] text-amber-800 font-bold uppercase block">Link Memory Story</label>
                                            <select
                                                onChange={(e) => {
                                                    const selectedStoryId = e.target.value;
                                                    const selectedStory = stories.find(s => String(s.id) === String(selectedStoryId));
                                                    if (selectedStory) {
                                                        updateElementProperty(currentSelectedElement.id, 'storyId', selectedStory.id);
                                                        updateElementProperty(currentSelectedElement.id, 'title', selectedStory.title);
                                                        updateElementProperty(currentSelectedElement.id, 'description', selectedStory.description || '');
                                                        updateElementProperty(currentSelectedElement.id, 'mediaUrl', selectedStory.mediaFiles?.[0]?.mediaUrl || '');
                                                        updateElementProperty(currentSelectedElement.id, 'mediaType', selectedStory.mediaFiles?.[0]?.mediaType || 'image');
                                                        updateElementProperty(currentSelectedElement.id, 'isPlaceholder', false);
                                                        const hasVoice = selectedStory.mediaFiles?.some(f => f.mediaType.includes('audio') || f.mediaType.includes('video'));
                                                        updateElementProperty(currentSelectedElement.id, 'hasQrCode', hasVoice);
                                                        if (hasVoice) {
                                                            updateElementProperty(currentSelectedElement.id, 'qrUrl', `${window.location.origin}/story/${selectedStory.id}`);
                                                        }
                                                    }
                                                }}
                                                className="w-full p-1 text-xs border border-amber-250 bg-white rounded focus:outline-none"
                                                defaultValue=""
                                            >
                                                <option value="" disabled>-- Select Story --</option>
                                                {stories.map(s => (
                                                    <option key={s.id} value={s.id}>{s.title} ({s.mediaFiles?.[0]?.mediaType.split('/')[0] || 'Text'})</option>
                                                ))}
                                            </select>
                                        </div>
                                    )}

                                    <div className="p-2 bg-white rounded-lg border border-gray-150">
                                        <p className="text-xs font-bold text-gray-800 truncate">{currentSelectedElement.title}</p>
                                        <p className="text-[10px] text-gray-500 line-clamp-2 mt-1">{currentSelectedElement.description || 'No description'}</p>
                                    </div>

                                    {/* Custom Caption Settings */}
                                    <div className="space-y-2 border-t border-gray-100 pt-2.5">
                                        <span className="text-[11px] font-medium text-gray-700 block">Caption Display Options</span>
                                        <div className="flex flex-col gap-1.5">
                                            <label className="flex items-center gap-2 text-xs text-gray-600 cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={currentSelectedElement.showTitle !== false}
                                                    onChange={(e) => updateElementProperty(currentSelectedElement.id, 'showTitle', e.target.checked)}
                                                    className="w-3.5 h-3.5 text-amber-600 border-gray-300 rounded focus:ring-amber-500 cursor-pointer"
                                                />
                                                Show Title
                                            </label>
                                            <label className="flex items-center gap-2 text-xs text-gray-600 cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={currentSelectedElement.showDescription !== false}
                                                    onChange={(e) => updateElementProperty(currentSelectedElement.id, 'showDescription', e.target.checked)}
                                                    className="w-3.5 h-3.5 text-amber-600 border-gray-300 rounded focus:ring-amber-500 cursor-pointer"
                                                />
                                                Show Description
                                            </label>
                                        </div>
                                    </div>

                                    {/* Scan code toggler */}
                                    <div className="flex items-center justify-between border-t border-gray-100 pt-2.5">
                                        <span className="text-[11px] font-medium text-gray-700 flex items-center gap-1.5">
                                            <ScanLine className="w-4 h-4 text-amber-700" />
                                            QR Scanner Code
                                        </span>
                                        <input
                                            type="checkbox"
                                            checked={!!currentSelectedElement.hasQrCode}
                                            onChange={(e) => {
                                                const checked = e.target.checked;
                                                updateElementProperty(currentSelectedElement.id, 'hasQrCode', checked);
                                                if (checked) {
                                                    // Auto place QR Code URL
                                                    const qrUrl = `${window.location.origin}/story/${currentSelectedElement.storyId}`;
                                                    updateElementProperty(currentSelectedElement.id, 'qrUrl', qrUrl);
                                                }
                                            }}
                                            className="w-4 h-4 text-amber-600 border-gray-300 rounded focus:ring-amber-500 cursor-pointer"
                                        />
                                    </div>
                                </div>
                            )}

                            {/* Size & Position sliders */}
                            <div className="border-t border-gray-100 pt-3 mt-3 space-y-2">
                                <span className="text-[10px] text-gray-500 font-semibold uppercase block">Size & Transform Controls</span>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="text-[9px] text-gray-500 flex justify-between">
                                            <span>Width:</span>
                                            <span className="font-bold">{Math.round(currentSelectedElement.width)}%</span>
                                        </label>
                                        <input
                                            type="range"
                                            min="5"
                                            max="100"
                                            value={Math.round(currentSelectedElement.width)}
                                            onChange={(e) => updateElementProperty(currentSelectedElement.id, 'width', parseFloat(e.target.value))}
                                            className="w-full h-1 bg-gray-200 rounded cursor-pointer accent-amber-700"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[9px] text-gray-500 flex justify-between">
                                            <span>Height:</span>
                                            <span className="font-bold">{Math.round(currentSelectedElement.height)}%</span>
                                        </label>
                                        <input
                                            type="range"
                                            min="5"
                                            max="100"
                                            value={Math.round(currentSelectedElement.height)}
                                            onChange={(e) => updateElementProperty(currentSelectedElement.id, 'height', parseFloat(e.target.value))}
                                            className="w-full h-1 bg-gray-200 rounded cursor-pointer accent-amber-700"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="text-[9px] text-gray-500 flex justify-between">
                                        <span>Rotation:</span>
                                        <span className="font-bold">{Math.round(currentSelectedElement.rotation || 0)}°</span>
                                    </label>
                                    <input
                                        type="range"
                                        min="-180"
                                        max="180"
                                        value={Math.round(currentSelectedElement.rotation || 0)}
                                        onChange={(e) => updateElementProperty(currentSelectedElement.id, 'rotation', parseFloat(e.target.value))}
                                        className="w-full h-1 bg-gray-200 rounded cursor-pointer accent-amber-700"
                                    />
                                </div>
                            </div>

                            {/* Layer operations */}
                            <div className="flex gap-2 border-t border-gray-100 pt-3 mt-3">
                                <button
                                    onClick={() => adjustZIndex(currentSelectedElement.id, 'up')}
                                    className="flex-1 py-1 border border-gray-200 hover:bg-gray-50 rounded-lg text-[10px] font-semibold text-gray-600 flex items-center justify-center gap-1 cursor-pointer"
                                >
                                    <ChevronUp className="w-3.5 h-3.5" />
                                    Bring Forward
                                </button>
                                <button
                                    onClick={() => adjustZIndex(currentSelectedElement.id, 'down')}
                                    className="flex-1 py-1 border border-gray-200 hover:bg-gray-50 rounded-lg text-[10px] font-semibold text-gray-600 flex items-center justify-center gap-1 cursor-pointer"
                                >
                                    <ChevronDown className="w-3.5 h-3.5" />
                                    Send Backward
                                </button>
                            </div>
                            
                            <div className="flex gap-2 mt-2">
                                <button
                                    onClick={() => duplicateElement(currentSelectedElement.id)}
                                    className="flex-1 py-1 border border-gray-200 hover:bg-gray-50 rounded-lg text-[10px] font-semibold text-gray-600 flex items-center justify-center gap-1 cursor-pointer"
                                >
                                    <Copy className="w-3.5 h-3.5" />
                                    Duplicate Element
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Right Workspace Canvas */}
                <div className="lg:col-span-8 flex flex-col items-center">
                    {/* Page pagination controller (hidden during print) */}
                    <div className="w-full max-w-[595px] flex items-center justify-between mb-4 bg-white border border-gray-150 px-4 py-2.5 rounded-2xl shadow-sm print:hidden">
                        <div className="flex items-center gap-2">
                            <button
                                disabled={currentPageIndex === 0}
                                onClick={() => { setCurrentPageIndex(currentPageIndex - 1); setSelectedElementId(null); }}
                                className="p-1.5 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-40 transition-colors cursor-pointer"
                            >
                                <ChevronLeft className="w-4 h-4" />
                            </button>
                            <span className="text-xs font-bold text-gray-700">
                                Page {currentPageIndex + 1} of {pages.length}
                            </span>
                            <button
                                disabled={currentPageIndex === pages.length - 1}
                                onClick={() => { setCurrentPageIndex(currentPageIndex + 1); setSelectedElementId(null); }}
                                className="p-1.5 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-40 transition-colors cursor-pointer"
                            >
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>

                        <div className="flex items-center gap-2">
                            <button
                                onClick={addPage}
                                className="flex items-center gap-1 px-3 py-1.5 bg-amber-50 text-amber-800 border border-amber-200 rounded-lg hover:bg-amber-100 transition-colors text-xs font-semibold cursor-pointer"
                            >
                                <Plus className="w-3.5 h-3.5" />
                                Add Page
                            </button>
                            <button
                                disabled={pages.length <= 1}
                                onClick={() => deletePage(currentPageIndex)}
                                className="flex items-center gap-1 px-3 py-1.5 bg-red-50 text-red-700 border border-red-200 rounded-lg hover:bg-red-100 disabled:opacity-40 transition-colors text-xs font-semibold cursor-pointer"
                            >
                                <Trash2 className="w-3.5 h-3.5" />
                                Delete Page
                            </button>
                        </div>
                    </div>

                    {/* A4 Canvas Container */}
                    {/* A4 Ratio is 1 : 1.414. Standard width 595px -> height 842px. Ideal for screen editing and fits exact print constraints */}
                    <div className="relative shadow-xl border border-gray-300 print:shadow-none print:border-none w-full max-w-[595px] print:max-w-none print:w-[21cm] overflow-hidden select-none mb-6">
                        <div
                            ref={containerRef}
                            id="scrapbook-a4-canvas"
                            className="w-full relative bg-white select-none shadow-inner print:shadow-none transition-all"
                            style={{
                                height: '0',
                                paddingBottom: '141.4%', // A4 Aspect Ratio 1:1.414
                                ...selectedBg.style
                            }}
                        >
                            {/* Render elements */}
                            {activePage.elements?.map(elem => {
                                const isSelected = selectedElementId === elem.id;
                                
                                return (
                                    <div
                                        key={elem.id}
                                        id={elem.id}
                                        onClick={(e) => { e.stopPropagation(); setSelectedElementId(elem.id); }}
                                        className={`absolute flex flex-col group/elem transition-shadow ${isSelected ? 'ring-2 ring-amber-600 print:ring-0 shadow-lg' : 'hover:ring-1 hover:ring-amber-500/40 print:hover:ring-0'}`}
                                        style={{
                                            left: `${elem.x}%`,
                                            top: `${elem.y}%`,
                                            width: `${elem.width}%`,
                                            height: `${elem.height}%`,
                                            transform: `rotate(${elem.rotation || 0}deg)`,
                                            zIndex: elem.zIndex || 1,
                                            cursor: dragState ? 'grabbing' : 'grab'
                                        }}
                                        onMouseDown={(e) => handleMouseDown(e, elem, 'move')}
                                    >
                                        {/* Drag anchor controls (hidden during print) */}
                                        {isSelected && !dragState && (
                                            <>
                                                {/* Rotate Handle */}
                                                <button
                                                    onMouseDown={(e) => handleMouseDown(e, elem, 'rotate')}
                                                    className="absolute -top-7 left-1/2 -translate-x-1/2 w-5 h-5 bg-amber-700 text-white rounded-full flex items-center justify-center shadow-md print:hidden cursor-pointer hover:bg-amber-800 z-50"
                                                    title="Rotate"
                                                >
                                                    <RotateCw className="w-3 h-3" />
                                                </button>
                                                
                                                {/* Delete Cross Button */}
                                                <button
                                                    onMouseDown={(e) => {
                                                        e.stopPropagation();
                                                        e.preventDefault();
                                                        deleteElement(elem.id);
                                                    }}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        e.preventDefault();
                                                    }}
                                                    className="absolute -top-3 -right-3 w-6 h-6 bg-red-600 hover:bg-red-700 text-white rounded-full flex items-center justify-center shadow-lg border border-white print:hidden cursor-pointer transition-all hover:scale-110 z-[100]"
                                                    title="Delete"
                                                >
                                                    <span className="text-[10px] font-extrabold select-none">✕</span>
                                                </button>

                                                {/* Corner Resize Handles */}
                                                <div
                                                    onMouseDown={(e) => handleMouseDown(e, elem, 'resize-tl')}
                                                    className="absolute -top-1.5 -left-1.5 w-3.5 h-3.5 bg-amber-700 border-2 border-white rounded-full shadow-md print:hidden cursor-nw-resize z-50 hover:bg-amber-800"
                                                    title="Resize Left-Top"
                                                ></div>
                                                <div
                                                    onMouseDown={(e) => handleMouseDown(e, elem, 'resize-bl')}
                                                    className="absolute -bottom-1.5 -left-1.5 w-3.5 h-3.5 bg-amber-700 border-2 border-white rounded-full shadow-md print:hidden cursor-sw-resize z-50 hover:bg-amber-800"
                                                    title="Resize Left-Bottom"
                                                ></div>
                                                <div
                                                    onMouseDown={(e) => handleMouseDown(e, elem, 'resize-br')}
                                                    className="absolute -bottom-2 -right-2 w-4 h-4 bg-amber-800 border-2 border-white rounded-full shadow-lg print:hidden cursor-se-resize z-50 hover:bg-amber-905 hover:scale-105"
                                                    title="Resize Right-Bottom"
                                                ></div>

                                                {/* Side Edge Resize Handles */}
                                                <div
                                                    onMouseDown={(e) => handleMouseDown(e, elem, 'resize-t')}
                                                    className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-1.5 bg-amber-700 hover:bg-amber-800 border border-white rounded-full cursor-n-resize z-50 print:hidden"
                                                    title="Resize Top"
                                                ></div>
                                                <div
                                                    onMouseDown={(e) => handleMouseDown(e, elem, 'resize-b')}
                                                    className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-4 h-1.5 bg-amber-700 hover:bg-amber-800 border border-white rounded-full cursor-s-resize z-50 print:hidden"
                                                    title="Resize Bottom"
                                                ></div>
                                                <div
                                                    onMouseDown={(e) => handleMouseDown(e, elem, 'resize-l')}
                                                    className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 w-1.5 h-4 bg-amber-700 hover:bg-amber-800 border border-white rounded-full cursor-w-resize z-50 print:hidden"
                                                    title="Resize Left"
                                                ></div>
                                                <div
                                                    onMouseDown={(e) => handleMouseDown(e, elem, 'resize-r')}
                                                    className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-1.5 h-4 bg-amber-700 hover:bg-amber-800 border border-white rounded-full cursor-e-resize z-50 print:hidden"
                                                    title="Resize Right"
                                                ></div>

                                                {/* Move Handle (especially useful for editable text blocks) */}
                                                <button
                                                    onMouseDown={(e) => {
                                                        e.stopPropagation();
                                                        handleMouseDown(e, elem, 'move');
                                                    }}
                                                    className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-6 h-6 bg-amber-700 text-white rounded-full flex items-center justify-center shadow-lg border border-white print:hidden cursor-move hover:bg-amber-800 z-50"
                                                    title="Move"
                                                >
                                                    <Move className="w-3.5 h-3.5" />
                                                </button>
                                            </>
                                        )}

                                        {/* Content Renderers */}
                                        <div className="w-full h-full flex-grow relative overflow-hidden flex flex-col">
                                            
                                            {/* TEXT ELEMENT */}
                                            {elem.type === 'text' && (
                                                <div
                                                    contentEditable={isSelected}
                                                    suppressContentEditableWarning={true}
                                                    onBlur={(e) => {
                                                        updateElementProperty(elem.id, 'content', e.target.innerText);
                                                    }}
                                                    onMouseDown={(e) => {
                                                        if (isSelected) {
                                                            e.stopPropagation(); // Allow text cursor placement and editing, block dragging
                                                        }
                                                    }}
                                                    className="w-full h-full flex items-center justify-center p-2 text-wrap break-words select-text outline-none cursor-text"
                                                    style={{
                                                        fontFamily: FONTS.find(f => f.id === elem.style?.fontFamily)?.css || 'serif',
                                                        fontSize: elem.style?.fontSize || '16px',
                                                        color: elem.style?.color || '#3d2106',
                                                        textAlign: elem.style?.textAlign || 'center',
                                                        fontWeight: elem.style?.fontWeight || 'normal'
                                                    }}
                                                >
                                                    {elem.content}
                                                </div>
                                            )}

                                            {/* STICKER ELEMENT */}
                                            {elem.type === 'sticker' && (
                                                <div className="w-full h-full flex items-center justify-center select-none">
                                                    {elem.stickerType === 'tape' ? (
                                                        <div className="w-full h-full rounded shadow-sm border border-black/5" style={elem.style}></div>
                                                    ) : elem.stickerType === 'badge' ? (
                                                        <div className="w-full h-full flex items-center justify-center font-serif text-amber-950 whitespace-nowrap gap-1" style={{ fontFamily: 'Dancing Script', fontSize: '26px' }}>
                                                            {elem.content}
                                                        </div>
                                                    ) : (
                                                        <span className="text-2xl leading-none select-none">{elem.content}</span>
                                                    )}
                                                </div>
                                            )}

                                            {/* MULTIMEDIA QR WIDGET */}
                                            {elem.type === 'qr' && (
                                                <div className="w-full h-full p-1 bg-white border border-gray-300 rounded shadow-md flex flex-col items-center justify-center gap-0.5 select-none">
                                                    <div className="w-full flex-1">
                                                        <QrCodeGenerator value={elem.qrUrl} />
                                                    </div>
                                                    <span className="text-[7px] text-amber-900 font-bold uppercase tracking-wide">Scan to Play</span>
                                                </div>
                                            )}

                                            {/* MEMORY CARD ELEMENT */}
                                            {elem.type === 'memory' && (
                                                <div className="w-full h-full bg-white p-2.5 shadow-md border border-gray-150 flex flex-col justify-between font-serif relative select-none">
                                                    {elem.isPlaceholder ? (
                                                        <div className="w-full h-full border-2 border-dashed border-amber-300 bg-amber-50/20 hover:bg-amber-50/50 transition-all rounded-md flex flex-col items-center justify-center p-3 text-center">
                                                            <ImageIcon className="w-6 h-6 text-amber-700 mb-1" />
                                                            <p className="text-[10px] font-bold text-amber-950 leading-tight">{elem.title}</p>
                                                            <p className="text-[8px] text-amber-800/70 mt-1 max-w-[90%] font-sans">Choose memory in sidebar dropdown to link</p>
                                                        </div>
                                                    ) : (
                                                        <>
                                                            {/* Polaroid picture style frame */}
                                                            <div className="w-full relative flex-grow overflow-hidden bg-gray-50 border border-gray-100 rounded-md">
                                                                {elem.mediaType?.includes('video') ? (
                                                                    <div className="w-full h-full bg-gradient-to-br from-slate-800 via-slate-900 to-slate-950 flex flex-col items-center justify-center p-3 select-none text-white relative">
                                                                        <div className="absolute top-1.5 left-0 right-0 flex justify-between px-2.5 opacity-30 text-[6px] tracking-widest font-mono">
                                                                            <span>00:00:00</span>
                                                                            <span>16:9 REC</span>
                                                                        </div>
                                                                        <div className="w-9 h-9 rounded-full bg-white/10 border border-white/20 flex items-center justify-center mb-1 shadow-md">
                                                                            <Film className="w-4 h-4 text-amber-500 animate-pulse" />
                                                                        </div>
                                                                        <span className="text-[8px] font-bold text-amber-400 uppercase tracking-widest">Video Memory</span>
                                                                    </div>
                                                                ) : elem.mediaType?.includes('audio') ? (
                                                                    <div className="w-full h-full bg-gradient-to-br from-amber-950 via-amber-900 to-amber-950 flex flex-col items-center justify-center p-3 select-none text-white relative">
                                                                        <div className="w-9 h-9 rounded-full bg-white/15 border border-white/20 flex items-center justify-center mb-1 shadow-md">
                                                                            <Volume2 className="w-4 h-4 text-amber-400 animate-bounce" />
                                                                        </div>
                                                                        <span className="text-[8px] font-bold text-amber-400 uppercase tracking-widest">Voice Recording</span>
                                                                        
                                                                        {/* Animated Waveform */}
                                                                        <div className="flex items-center gap-0.5 mt-1.5 h-3 justify-center">
                                                                            <span className="w-[1.2px] bg-amber-400 rounded-full animate-pulse h-1.5"></span>
                                                                            <span className="w-[1.2px] bg-amber-300 rounded-full animate-pulse h-2.5"></span>
                                                                            <span className="w-[1.2px] bg-amber-400 rounded-full animate-pulse h-3.5"></span>
                                                                            <span className="w-[1.2px] bg-amber-300 rounded-full animate-pulse h-2.5"></span>
                                                                            <span className="w-[1.2px] bg-amber-400 rounded-full animate-pulse h-1.5"></span>
                                                                        </div>
                                                                    </div>
                                                                ) : (
                                                                    <img src={elem.mediaUrl} className="w-full h-full object-cover select-none pointer-events-none" alt="" />
                                                                )}

                                                                {/* Center Scanner overlay for audio/video memories */}
                                                                {elem.hasQrCode && (elem.mediaType?.includes('video') || elem.mediaType?.includes('audio')) && (
                                                                    <div className="absolute inset-0 flex items-center justify-center bg-black/35 backdrop-blur-[1px] animate-in fade-in duration-200">
                                                                        <div className="w-18 h-18 bg-white p-1 rounded-xl shadow-lg border border-amber-900/15 flex flex-col items-center justify-center gap-0.5 select-none hover:scale-105 transition-transform duration-300">
                                                                            <div className="w-full flex-grow">
                                                                                <QrCodeGenerator value={elem.qrUrl} />
                                                                            </div>
                                                                            <span className="text-[5px] text-amber-900 font-bold uppercase tracking-wider block text-center mt-0.5 leading-none">Scan Media</span>
                                                                        </div>
                                                                    </div>
                                                                )}
                                                            </div>
                                                            
                                                            {/* Captions */}
                                                            <div className="pt-2 flex flex-col justify-end min-h-[40px]">
                                                                {elem.showTitle !== false && (
                                                                    <p className="text-[10px] font-bold text-gray-800 line-clamp-1 leading-tight text-center font-serif" style={{ fontFamily: 'Dancing Script', fontSize: '14px' }}>
                                                                        {elem.title}
                                                                    </p>
                                                                )}
                                                                {elem.showDescription !== false && (
                                                                    <p className="text-[7px] text-gray-500 line-clamp-2 text-center mt-0.5 leading-normal">
                                                                        {elem.description}
                                                                    </p>
                                                                )}
                                                            </div>
 
                                                            {/* Overlay Scan Code if requested for image memories */}
                                                            {elem.hasQrCode && !(elem.mediaType?.includes('video') || elem.mediaType?.includes('audio')) && (
                                                                <div className="absolute top-2 right-2 w-14 h-14 bg-white p-0.5 rounded shadow-lg border border-amber-900/10 flex flex-col items-center justify-center gap-0.5 select-none print:block print:w-12 print:h-12">
                                                                    <div className="w-full flex-grow">
                                                                        <QrCodeGenerator value={elem.qrUrl} />
                                                                    </div>
                                                                    <span className="text-[5px] text-amber-900 font-bold uppercase tracking-wider block text-center mt-0.5">Scan Media</span>
                                                                </div>
                                                            )}
                                                        </>
                                                    )}
                                                </div>
                                            )}

                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>

            {/* Custom Print Style Configuration in DOM */}
            <style dangerouslySetInnerHTML={{ __html: `
                @media print {
                    body {
                        background-color: white !important;
                        margin: 0 !important;
                        padding: 0 !important;
                    }
                    nav, .print\\:hidden, #notif-bell, #logout-btn {
                        display: none !important;
                    }
                    .pt-16 {
                        padding-top: 0 !important;
                    }
                    .max-w-7xl, .lg\\:col-span-8, .max-w-\\[595px\\] {
                        max-width: none !important;
                        width: 100% !important;
                        margin: 0 !important;
                        padding: 0 !important;
                    }
                    #scrapbook-a4-canvas {
                        border: none !important;
                        box-shadow: none !important;
                        width: 21cm !important;
                        height: 29.7cm !important;
                        padding-bottom: 0 !important;
                        position: absolute !important;
                        top: 0 !important;
                        left: 0 !important;
                        page-break-after: always !important;
                    }
                }
            ` }} />

            {/* Auto-Generation Wizard Modal */}
            {autoGenOpen && (
                <AutoGenerateModal
                    isOpen={autoGenOpen}
                    onClose={() => setAutoGenOpen(false)}
                    onGenerate={handleAutoGenerateLayout}
                />
            )}

            {/* 3D FlipBook Live Draft Preview Modal */}
            {previewOpen && (
                <FlipBookPreview
                    isOpen={previewOpen}
                    onClose={() => setPreviewOpen(false)}
                    title={title}
                    pages={pages}
                    backgrounds={BACKGROUNDS}
                />
            )}

            {/* Custom styled confirmation modal */}
            {confirmModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/55 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-gray-150 animate-in fade-in zoom-in-95 duration-200">
                        <h3 className="text-lg font-bold text-gray-900 mb-2">{confirmModal.title}</h3>
                        <p className="text-gray-600 text-sm mb-6">
                            {confirmModal.message}
                        </p>
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setConfirmModal(null)}
                                className="px-4 py-2 border border-gray-200 rounded-xl text-gray-700 font-semibold hover:bg-gray-50 transition-colors cursor-pointer"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => {
                                    confirmModal.onConfirm();
                                    setConfirmModal(null);
                                }}
                                className={`px-4 py-2 text-white rounded-xl font-semibold transition-colors cursor-pointer ${
                                    confirmModal.isDanger 
                                        ? "bg-red-600 hover:bg-red-700 shadow-md shadow-red-900/10" 
                                        : "bg-amber-700 hover:bg-amber-800 shadow-md shadow-amber-900/10"
                                }`}
                            >
                                {confirmModal.confirmText || "Confirm"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
