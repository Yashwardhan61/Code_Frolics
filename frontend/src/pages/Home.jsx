import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X } from 'lucide-react';

export default function Home() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    
    // Generate random seeds once per mount to prevent flickering but give different images every visit
    const [imageSeeds] = useState(() => 
        Array.from({ length: 8 }, () => Math.floor(Math.random() * 10000))
    );

    return (
        <div className="flex flex-col w-full min-h-screen relative z-10 pt-16">
            {/* Navigation Bar */}
            <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-sm shadow-md">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="flex justify-between items-center h-16">
                        {/* Logo */}
                        <div className="flex-shrink-0 flex items-center">
                            <div className="w-10 h-10 rounded-lg overflow-hidden bg-amber-800 flex items-center justify-center">
                                <span className="text-xl font-bold text-amber-200" style={{ fontFamily: "'Dancing Script', cursive" }}>Y</span>
                            </div>
                            <span className="ml-2 text-lg font-semibold" style={{ color: 'var(--brand-brown-600)' }}>Yaado ka baksa</span>
                        </div>

                        {/* Desktop Menu */}
                        <div className="hidden md:flex items-center space-x-8">
                            <Link to="/about" className="font-medium text-amber-900 hover:text-amber-700 transition-colors">About</Link>
                            <Link to="/login" className="font-medium text-amber-900 hover:text-amber-700 transition-colors">Login</Link>
                            <Link to="/feedback" className="font-medium text-amber-900 hover:text-amber-700 transition-colors">Feedback</Link>
                            <Link to="/contact" className="font-medium text-amber-900 hover:text-amber-700 transition-colors">Contact Us</Link>
                        </div>

                        {/* Mobile Menu Button */}
                        <div className="md:hidden">
                            <button 
                                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} 
                                className="text-amber-900 hover:text-amber-700 focus:outline-none"
                            >
                                {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Mobile Menu Panel */}
                {isMobileMenuOpen && (
                    <div className="md:hidden bg-white border-t border-gray-200">
                        <div className="px-4 pt-2 pb-4 space-y-1 shadow-lg">
                            <Link to="/about" className="block px-3 py-3 rounded-md text-base font-medium text-amber-900 hover:bg-amber-50">About</Link>
                            <Link to="/login" className="block px-3 py-3 rounded-md text-base font-medium text-amber-900 hover:bg-amber-50">Login</Link>
                            <Link to="/feedback" className="block px-3 py-3 rounded-md text-base font-medium text-amber-900 hover:bg-amber-50">Feedback</Link>
                            <Link to="/contact" className="block px-3 py-3 rounded-md text-base font-medium text-amber-900 hover:bg-amber-50">Contact Us</Link>
                        </div>
                    </div>
                )}
            </nav>

            {/* Film Reel Animation */}
            <div className="film-reel-container overflow-hidden w-full h-40 bg-black">
                <div className="film-strip flex animate-scroll">
                    {imageSeeds.map((seed, i) => (
                        <div key={i} className="film-frame">
                            <img src={`https://picsum.photos/seed/${seed}/400/400`} alt="Memory" className="w-full h-full object-cover sepia-[.60] contrast-125 brightness-90 hue-rotate-15 hover:sepia-0 transition-all duration-500" />
                        </div>
                    ))}
                    {/* Duplicate for infinite scroll effect */}
                    {imageSeeds.map((seed, i) => (
                        <div key={`dup-${i}`} className="film-frame">
                            <img src={`https://picsum.photos/seed/${seed}/400/400`} alt="Memory" className="w-full h-full object-cover sepia-[.60] contrast-125 brightness-90 hue-rotate-15 hover:sepia-0 transition-all duration-500" />
                        </div>
                    ))}
                </div>
            </div>

            <div className="flex flex-col items-center justify-center flex-grow text-center px-4 mt-8">
                <h2 className="welcome-text mb-8 text-5xl sm:text-6xl" style={{ fontFamily: "'Dancing Script', cursive", color: "var(--brand-brown-800)" }}>
                    Welcome to Family
                </h2>
                
                <div 
                    className={`treasure-box cursor-pointer ${isModalOpen ? 'open' : ''}`}
                    onClick={() => setIsModalOpen(true)}
                >
                    <div className="treasure-lid">
                        <div className="lock"></div>
                    </div>
                    <div className="treasure-body flex items-center justify-center">
                        <div className="treasure-glow"></div>
                        <h1 className="engraved-text text-2xl sm:text-3xl font-bold brand-text px-4">Yaado ka baksa</h1>
                    </div>
                    <div className="sparkles"></div>
                </div>
                
                <p className="mt-8 text-amber-700 animate-bounce text-lg sm:text-xl font-medium relative z-10">
                    Click to Open the Treasure
                </p>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 fade-in">
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
                    <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-md transform transition-all scale-100 mx-auto relative z-10">
                        <h2 className="text-3xl font-bold mb-6 text-center" style={{ color: "var(--brand-brown-600)" }}>
                            Welcome to Yaado ka baksa
                        </h2>
                        <p className="text-gray-700 mb-8 text-lg leading-relaxed text-center">
                            Welcome to your digital treasure chest of memories! Here, every photo tells a story, every video captures a moment, and every memory becomes a cherished part of your family's legacy. Join us to create, collect, and share the precious moments that make your family unique.
                        </p>
                        <div className="flex justify-center mb-4">
                            <Link to="/welcome" className="inline-block">
                                <button className="bg-gradient-to-r from-amber-700 to-amber-600 text-white px-8 py-3 rounded-lg hover:from-amber-800 hover:to-amber-700 transition-all transform hover:scale-105 text-lg font-semibold shadow-lg border-2 border-amber-300/20">
                                    Begin Your Journey
                                </button>
                            </Link>
                        </div>
                        <button 
                            className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 p-2"
                            onClick={() => setIsModalOpen(false)}
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
