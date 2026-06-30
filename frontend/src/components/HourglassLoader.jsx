import React from 'react';

export default function HourglassLoader({ size = 'medium', text = 'Loading memories...' }) {
    const isSmall = size === 'small';
    const dimensions = isSmall ? 'w-6 h-6' : 'w-16 h-16';
    const fillSize = isSmall ? 'w-6 h-6' : 'w-16 h-16';

    return (
        <div className="flex flex-col items-center justify-center p-6 text-center select-none">
            <div className={`relative ${dimensions} animate-hourglass-spin`}>
                <svg 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    className={`${fillSize} text-[#b87333]`}
                >
                    {/* Top glass bulb */}
                    <path 
                        d="M5 2h14v2c0 3-3 5-7 6.5" 
                        strokeWidth="1.5" 
                        strokeLinecap="round" 
                    />
                    {/* Bottom glass bulb */}
                    <path 
                        d="M5 22h14v-2c0-3-3-5-7-6.5" 
                        strokeWidth="1.5" 
                        strokeLinecap="round" 
                    />
                    {/* Sand falling flow line */}
                    <line 
                        x1="12" 
                        y1="10.5" 
                        x2="12" 
                        y2="13.5" 
                        stroke="currentColor" 
                        strokeWidth="2" 
                        strokeDasharray="2,2" 
                        className="animate-sand-trickle" 
                    />
                    {/* Sand in top bulb */}
                    <path 
                        d="M7 4h10c0 0-1 2.5-5 2.5S7 4 7 4z" 
                        fill="currentColor" 
                        opacity="0.6" 
                        className="animate-sand-top" 
                    />
                    {/* Sand in bottom bulb */}
                    <path 
                        d="M8 20h8c0 0-1-2.5-4-2.5s-4 2.5-4 2.5z" 
                        fill="currentColor" 
                        opacity="0.6" 
                        className="animate-sand-bottom" 
                    />
                </svg>
            </div>
            {!isSmall && text && (
                <p className="mt-4 font-serif text-sm italic text-amber-900/60 tracking-wider">
                    {text}
                </p>
            )}
        </div>
    );
}
