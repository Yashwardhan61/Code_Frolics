import React from 'react';
import { X, Mic, Square, Volume2, Sparkles } from 'lucide-react';

export default function AudioRecorderModal({
    isOpen,
    onClose,
    isRecording,
    recordingTime,
    audioUrl,
    startRecording,
    stopRecording,
    discardRecording,
    addRecordedAudio
}) {
    if (!isOpen) return null;

    const formatTime = (secs) => {
        const mins = Math.floor(secs / 60);
        const remainingSecs = secs % 60;
        return `${mins.toString().padStart(2, '0')}:${remainingSecs.toString().padStart(2, '0')}`;
    };

    return (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl p-6 md:p-8 max-w-md w-full shadow-2xl border border-[#e5dcd3] animate-in fade-in zoom-in-95 duration-200">
                <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-6">
                    <div className="flex items-center gap-2.5">
                        <div className="p-2 rounded-xl bg-amber-100/60 text-amber-800">
                            <Mic className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="font-serif font-bold text-lg text-gray-900">Record Voice Memory</h3>
                            <p className="text-xs text-gray-500">Capture voice recordings and spoken tales</p>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Recording interface */}
                <div className="flex flex-col items-center justify-center py-6">
                    {isRecording ? (
                        <div className="flex flex-col items-center gap-4">
                            <div className="relative">
                                <div className="w-24 h-24 rounded-full bg-red-100 flex items-center justify-center animate-ping absolute inset-0 opacity-75" />
                                <div className="w-24 h-24 rounded-full bg-red-50 border-2 border-red-500 flex items-center justify-center relative z-10">
                                    <Mic className="w-10 h-10 text-red-600 animate-pulse" />
                                </div>
                            </div>
                            <div className="text-center">
                                <span className="font-mono text-2xl font-bold text-gray-800 tracking-wider">
                                    {formatTime(recordingTime)}
                                </span>
                                <p className="text-xs text-red-600 font-medium mt-1 uppercase tracking-wide">
                                    Recording Audio...
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={stopRecording}
                                className="mt-4 px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-medium flex items-center gap-2 shadow-lg shadow-red-600/20 transition-all cursor-pointer"
                            >
                                <Square className="w-4 h-4 fill-current" />
                                Stop Recording
                            </button>
                        </div>
                    ) : audioUrl ? (
                        <div className="w-full flex flex-col items-center gap-4">
                            <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center text-amber-800">
                                <Volume2 className="w-8 h-8" />
                            </div>
                            <p className="text-sm font-medium text-gray-800">Voice Memory Ready</p>
                            <audio src={audioUrl} controls className="w-full mt-2" />
                            <div className="flex gap-3 w-full mt-4">
                                <button
                                    type="button"
                                    onClick={discardRecording}
                                    className="flex-1 py-2.5 border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-xl font-medium text-sm transition-colors cursor-pointer"
                                >
                                    Rerecord
                                </button>
                                <button
                                    type="button"
                                    onClick={addRecordedAudio}
                                    className="flex-1 py-2.5 bg-amber-800 hover:bg-amber-900 text-white rounded-xl font-medium text-sm transition-colors shadow-md cursor-pointer"
                                >
                                    Attach Audio
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center gap-4 text-center">
                            <div className="w-20 h-20 rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-800">
                                <Mic className="w-8 h-8" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-800">Ready to speak</p>
                                <p className="text-xs text-gray-500 mt-1 max-w-xs">
                                    Click the button below to begin recording your spoken memories.
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={startRecording}
                                className="mt-2 px-6 py-2.5 bg-amber-800 hover:bg-amber-900 text-white rounded-xl font-medium flex items-center gap-2 shadow-md transition-all cursor-pointer"
                            >
                                <Mic className="w-4 h-4" />
                                Start Recording
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
