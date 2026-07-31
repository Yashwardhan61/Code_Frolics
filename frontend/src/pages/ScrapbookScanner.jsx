import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { storyService } from '../api/storyService';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { ScanLine, Play, Volume2, ArrowLeft, RefreshCw, X, Calendar, MapPin, Sparkles, Film } from 'lucide-react';

export default function ScrapbookScanner() {
    const navigate = useNavigate();
    const [scannedResult, setScannedResult] = useState(null);
    const [loadingStory, setLoadingStory] = useState(false);
    const [storyDetails, setStoryDetails] = useState(null);
    const [scanError, setScanError] = useState(null);
    const [activeVideoUrl, setActiveVideoUrl] = useState(null);
    const [activeAudioUrl, setActiveAudioUrl] = useState(null);
    
    const scannerRef = useRef(null);

    // Initialize QR Code scanner in DOM
    useEffect(() => {
        const html5QrcodeScanner = new Html5QrcodeScanner(
            "qr-reader-container",
            { 
                fps: 10, 
                qrbox: { width: 250, height: 250 },
                rememberLastUsedCamera: true
            },
            /* verbose= */ false
        );

        const onScanSuccess = async (decodedText) => {
            console.log("Scan Success:", decodedText);
            setScannedResult(decodedText);
            setScanError(null);
            
            // Try to extract story ID from URL patterns like: http://localhost:5173/story/12
            try {
                const url = new URL(decodedText);
                const pathParts = url.pathname.split('/');
                const storyIdx = pathParts.indexOf('story');
                
                if (storyIdx !== -1 && pathParts[storyIdx + 1]) {
                    const storyId = pathParts[storyIdx + 1];
                    // Pause scanner
                    html5QrcodeScanner.clear();
                    
                    // Fetch story details
                    fetchStory(storyId);
                } else {
                    setScanError("Scanned QR code is valid, but doesn't point to a scrapbook story.");
                }
            } catch (err) {
                // Not a valid URL
                setScanError("Scanned code does not represent a valid scrapbook memory link.");
            }
        };

        const onScanFailure = (error) => {
            // Keep scanning, fail silently
        };

        html5QrcodeScanner.render(onScanSuccess, onScanFailure);
        scannerRef.current = html5QrcodeScanner;

        return () => {
            if (scannerRef.current) {
                scannerRef.current.clear().catch(err => console.error("Scanner clear failure:", err));
            }
        };
    }, []);

    const fetchStory = async (id) => {
        setLoadingStory(true);
        try {
            const data = await storyService.getStoryById(id);
            setStoryDetails(data);
            
            // Check for media attachments
            const videoFile = data.mediaFiles?.find(f => f.mediaType.includes('video'));
            const audioFile = data.mediaFiles?.find(f => f.mediaType.includes('audio'));
            if (videoFile) setActiveVideoUrl(videoFile.mediaUrl);
            if (audioFile) setActiveAudioUrl(audioFile.mediaUrl);
        } catch (err) {
            console.error("Error fetching story", err);
            setScanError("Failed to retrieve story details. Make sure you are logged in and connected.");
        } finally {
            setLoadingStory(false);
        }
    };

    const restartScanner = () => {
        setStoryDetails(null);
        setScannedResult(null);
        setActiveVideoUrl(null);
        setActiveAudioUrl(null);
        setScanError(null);

        // Re-mount scanner
        const html5QrcodeScanner = new Html5QrcodeScanner(
            "qr-reader-container",
            { 
                fps: 10, 
                qrbox: { width: 250, height: 250 },
                rememberLastUsedCamera: true
            },
            false
        );
        html5QrcodeScanner.render(
            async (decodedText) => {
                setScannedResult(decodedText);
                try {
                    const url = new URL(decodedText);
                    const pathParts = url.pathname.split('/');
                    const storyIdx = pathParts.indexOf('story');
                    if (storyIdx !== -1 && pathParts[storyIdx + 1]) {
                        html5QrcodeScanner.clear();
                        fetchStory(pathParts[storyIdx + 1]);
                    } else {
                        setScanError("Scanned code isn't a valid story path.");
                    }
                } catch {
                    setScanError("Scanned code is not a valid story link.");
                }
            },
            () => {}
        );
        scannerRef.current = html5QrcodeScanner;
    };

    const formatDate = (dateString) => {
        if (!dateString) return '';
        return new Date(dateString).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
    };

    return (
        <div className="max-w-3xl mx-auto px-4 py-8">
            {/* Header */}
            <div className="flex items-center gap-3 mb-6">
                <button
                    onClick={() => navigate('/scrapbooks')}
                    className="p-2 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer"
                >
                    <ArrowLeft className="w-5 h-5 text-gray-700" />
                </button>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <ScanLine className="w-6 h-6 text-amber-700" />
                        Scrapbook Memory Scanner
                    </h1>
                    <p className="text-xs text-gray-600 mt-1">
                        Use your camera to scan QR codes on printed scrapbook sheets to play video and audio memories.
                    </p>
                </div>
            </div>

            {/* Error notifications */}
            {scanError && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 flex justify-between items-center">
                    <p className="text-xs font-semibold">{scanError}</p>
                    <button
                        onClick={restartScanner}
                        className="flex items-center gap-1 text-xs bg-white text-red-700 px-3 py-1.5 border border-red-200 rounded-lg hover:bg-red-50 transition-colors cursor-pointer"
                    >
                        <RefreshCw className="w-3.5 h-3.5" />
                        Retry Scan
                    </button>
                </div>
            )}

            {/* Scanning window / loading wrapper */}
            <div className="bg-white border border-gray-150 rounded-2xl p-6 shadow-sm flex flex-col items-center">
                
                {loadingStory && (
                    <div className="py-16 text-center">
                        <RefreshCw className="w-8 h-8 text-amber-700 animate-spin mx-auto mb-3" />
                        <p className="text-sm text-gray-600 font-semibold">Fetching memories from database...</p>
                    </div>
                )}

                {/* QR Scanner Container DOM node */}
                {!storyDetails && !loadingStory && (
                    <div className="w-full flex flex-col items-center">
                        <div id="qr-reader-container" className="w-full max-w-md overflow-hidden rounded-xl border border-gray-150 shadow-inner"></div>
                        <div className="mt-4 text-center">
                            <p className="text-[11px] text-gray-500 font-medium uppercase tracking-wider">Position QR code inside the camera frame</p>
                        </div>
                    </div>
                )}

                {/* Successful Scanned Story details Modal */}
                {storyDetails && !loadingStory && (
                    <div className="w-full animate-in fade-in slide-in-from-bottom-6 duration-300">
                        <div className="flex justify-between items-start border-b border-gray-100 pb-4 mb-4">
                            <div>
                                <span className="bg-amber-50 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded border border-amber-100 uppercase tracking-wider flex items-center gap-1.5 w-fit">
                                    <Sparkles className="w-3 h-3" />
                                    Scanned Memory Found
                                </span>
                                <h2 className="text-xl font-bold text-gray-900 mt-2 font-serif">{storyDetails.title}</h2>
                                <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500 mt-1">
                                    {storyDetails.storyDate && (
                                        <span className="flex items-center gap-1">
                                            <Calendar className="w-3.5 h-3.5" />
                                            {formatDate(storyDetails.storyDate)}
                                        </span>
                                    )}
                                    {storyDetails.location && (
                                        <span className="flex items-center gap-1">
                                            <MapPin className="w-3.5 h-3.5" />
                                            {storyDetails.location}
                                        </span>
                                    )}
                                </div>
                            </div>
                            <button
                                onClick={restartScanner}
                                className="p-2 border border-gray-200 rounded-xl hover:bg-gray-50 text-gray-500 hover:text-gray-700 transition-colors cursor-pointer"
                                title="Scan Next Page"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Media Players (Audio / Video / Image) */}
                        <div className="my-5 flex flex-col items-center gap-4 bg-gray-50 p-4 rounded-xl border border-gray-200/60">
                            {activeVideoUrl ? (
                                <div className="w-full max-w-lg aspect-video rounded-xl overflow-hidden shadow-md bg-black">
                                    <video src={activeVideoUrl} controls autoPlay className="w-full h-full object-contain" />
                                </div>
                            ) : activeAudioUrl ? (
                                <div className="w-full max-w-md bg-white p-4 rounded-xl shadow-sm border border-gray-150 flex flex-col items-center gap-3">
                                    <Volume2 className="w-10 h-10 text-amber-700 animate-pulse" />
                                    <audio src={activeAudioUrl} controls autoPlay className="w-full" />
                                    <span className="text-[10px] text-gray-500 font-semibold uppercase">Playing Recorded Voice Memory</span>
                                </div>
                            ) : storyDetails.mediaFiles?.[0]?.mediaUrl ? (
                                <div className="w-full max-w-md aspect-square rounded-xl overflow-hidden shadow-sm bg-white border border-gray-200">
                                    <img src={storyDetails.mediaFiles[0].mediaUrl} className="w-full h-full object-cover" alt="" />
                                </div>
                            ) : (
                                <div className="p-8 text-center bg-white rounded-xl border border-gray-200 w-full">
                                    <Film className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                                    <p className="text-xs text-gray-500">No media attachments found for this story.</p>
                                </div>
                            )}
                        </div>

                        {/* Story Content Descriptions */}
                        <div className="border-t border-gray-100 pt-4">
                            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Memory Journal</h4>
                            <p className="text-gray-700 text-sm mt-2 leading-relaxed whitespace-pre-line font-serif bg-amber-50/20 p-3.5 rounded-xl border border-amber-800/5">
                                {storyDetails.description || "No text description added to this memory."}
                            </p>
                        </div>

                        {/* Re-scan trigger */}
                        <div className="flex justify-end gap-3 border-t border-gray-100 pt-4 mt-6">
                            <button
                                onClick={restartScanner}
                                className="flex items-center gap-1.5 px-4 py-2 bg-amber-700 hover:bg-amber-800 text-white rounded-xl font-semibold shadow-md transition-colors cursor-pointer"
                            >
                                <RefreshCw className="w-4 h-4" />
                                Scan Next Code
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
