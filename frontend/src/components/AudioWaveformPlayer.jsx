import React, { useEffect, useRef, useState } from 'react';
import { Play, Pause } from 'lucide-react';

export default function AudioWaveformPlayer({ audioUrl }) {
    const canvasRef = useRef(null);
    const audioRef = useRef(null);
    const audioContextRef = useRef(null);
    const analyserRef = useRef(null);
    const sourceRef = useRef(null);
    const requestRef = useRef(null);
    
    const [isPlaying, setIsPlaying] = useState(false);
    const [duration, setDuration] = useState(0);
    const [currentTime, setCurrentTime] = useState(0);
    const [audioData, setAudioData] = useState(null); // The raw waveform data to draw statically
    const [isLoaded, setIsLoaded] = useState(false);

    // Initialize Audio Context and Fetch Audio Data
    useEffect(() => {
        if (!audioUrl) return;

        const loadAudio = async () => {
            try {
                // Fetch the audio file
                const response = await fetch(audioUrl);
                const arrayBuffer = await response.arrayBuffer();
                
                // Initialize AudioContext if needed
                if (!audioContextRef.current) {
                    const AudioContext = window.AudioContext || window.webkitAudioContext;
                    audioContextRef.current = new AudioContext();
                }
                
                const audioContext = audioContextRef.current;
                const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
                
                setDuration(audioBuffer.duration);
                
                // Extract waveform data (we'll just use the first channel and downsample)
                const rawData = audioBuffer.getChannelData(0); // Float32Array
                const samples = 100; // number of bars to draw
                const blockSize = Math.floor(rawData.length / samples);
                const filteredData = [];
                for (let i = 0; i < samples; i++) {
                    let blockStart = blockSize * i;
                    let sum = 0;
                    for (let j = 0; j < blockSize; j++) {
                        sum = sum + Math.abs(rawData[blockStart + j]);
                    }
                    filteredData.push(sum / blockSize);
                }
                
                // Normalize data
                const multiplier = Math.pow(Math.max(...filteredData), -1);
                const normalizedData = filteredData.map(n => n * multiplier);
                
                setAudioData(normalizedData);
                setIsLoaded(true);
            } catch (error) {
                console.error("Error loading audio data for waveform:", error);
            }
        };

        loadAudio();

        return () => {
            if (audioContextRef.current) {
                audioContextRef.current.close();
            }
        };
    }, [audioUrl]);

    // Draw the waveform
    const drawWaveform = () => {
        if (!canvasRef.current || !audioData) return;
        
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        const width = canvas.width;
        const height = canvas.height;
        
        ctx.clearRect(0, 0, width, height);
        
        const barWidth = (width / audioData.length) - 1;
        const currentProgress = duration > 0 ? currentTime / duration : 0;
        const currentDataIndex = Math.floor(currentProgress * audioData.length);
        
        audioData.forEach((data, i) => {
            const barHeight = Math.max(data * height * 0.8, 4); // min height of 4
            const x = i * (barWidth + 1);
            const y = (height - barHeight) / 2; // vertically center
            
            // Draw past data as amber, future data as gray
            if (i <= currentDataIndex) {
                ctx.fillStyle = '#d97706'; // amber-600
            } else {
                ctx.fillStyle = '#fde68a'; // amber-200
            }
            
            // Rounded corners for bars
            ctx.beginPath();
            ctx.roundRect(x, y, barWidth, barHeight, 2);
            ctx.fill();
        });
    };

    // Animation loop for current time
    useEffect(() => {
        if (isPlaying) {
            requestRef.current = requestAnimationFrame(updateTime);
        } else {
            cancelAnimationFrame(requestRef.current);
            drawWaveform(); // Redraw static state
        }
        return () => cancelAnimationFrame(requestRef.current);
    }, [isPlaying, currentTime, audioData]); // Re-run when these change to ensure smooth redraw

    const updateTime = () => {
        if (audioRef.current) {
            setCurrentTime(audioRef.current.currentTime);
            drawWaveform();
        }
        if (isPlaying) {
            requestRef.current = requestAnimationFrame(updateTime);
        }
    };

    const togglePlayPause = () => {
        if (!audioRef.current || !isLoaded) return;
        
        // Resume audio context if suspended (browser autoplay policy)
        if (audioContextRef.current && audioContextRef.current.state === 'suspended') {
            audioContextRef.current.resume();
        }

        if (isPlaying) {
            audioRef.current.pause();
        } else {
            audioRef.current.play();
        }
        setIsPlaying(!isPlaying);
    };

    const handleCanvasClick = (e) => {
        if (!canvasRef.current || !audioRef.current || !isLoaded) return;
        
        const rect = canvasRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const percent = x / rect.width;
        
        const newTime = percent * duration;
        audioRef.current.currentTime = newTime;
        setCurrentTime(newTime);
        drawWaveform();
    };

    const handleTimeUpdate = () => {
        setCurrentTime(audioRef.current.currentTime);
    };

    const handleEnded = () => {
        setIsPlaying(false);
        setCurrentTime(0);
        drawWaveform();
    };

    const formatTime = (time) => {
        if (isNaN(time)) return "00:00";
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    };

    return (
        <div className="bg-amber-50 rounded-2xl p-4 flex items-center gap-4 border border-amber-200/50 shadow-sm">
            <button
                onClick={togglePlayPause}
                disabled={!isLoaded}
                className="w-12 h-12 flex-shrink-0 bg-amber-600 text-white rounded-full flex items-center justify-center hover:bg-amber-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-amber-600/20"
            >
                {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-1" />}
            </button>
            
            <div className="flex-1 flex flex-col justify-center h-16 relative">
                {!isLoaded && (
                    <div className="absolute inset-0 flex items-center justify-center text-amber-600/50 text-sm font-medium">
                        Loading waveform...
                    </div>
                )}
                <canvas 
                    ref={canvasRef} 
                    width={400} 
                    height={60} 
                    onClick={handleCanvasClick}
                    className={`w-full h-full cursor-pointer ${!isLoaded ? 'opacity-0' : 'opacity-100'}`}
                />
            </div>
            
            <div className="flex-shrink-0 text-sm font-medium text-amber-800 w-16 text-right font-mono">
                {formatTime(currentTime)}
            </div>

            <audio
                ref={audioRef}
                src={audioUrl}
                onTimeUpdate={handleTimeUpdate}
                onEnded={handleEnded}
                preload="metadata"
                className="hidden"
            />
        </div>
    );
}
