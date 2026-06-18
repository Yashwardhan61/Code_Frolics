import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export default function About() {
    return (
        <div className="min-h-screen" style={{ background: 'var(--brand-brown-50)' }}>
            {/* Header */}
            <header className="flex items-center justify-center gap-4 py-6 shadow-md"
                style={{ background: 'linear-gradient(45deg, var(--brand-brown-600), var(--brand-accent))' }}>
                <div className="w-14 h-14 rounded-xl bg-white/10 flex items-center justify-center p-1">
                    <span className="text-2xl font-bold text-amber-200" style={{ fontFamily: "'Dancing Script', cursive" }}>Y</span>
                </div>
                <div className="text-center text-white">
                    <h1 className="text-3xl font-bold" style={{ fontFamily: "'Dancing Script', cursive" }}>Yaado Ka Baksa</h1>
                    <p className="text-lg opacity-90">About Us</p>
                </div>
            </header>

            {/* Content */}
            <div className="max-w-3xl mx-auto my-12 px-6">
                <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-10 shadow-lg"
                    style={{ border: '2px solid var(--brand-brown-200)' }}>
                    
                    <h2 className="text-4xl mb-8 text-center"
                        style={{ fontFamily: "'Dancing Script', cursive", background: 'linear-gradient(45deg, var(--brand-brown-600), var(--brand-brown-400))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                        About us
                    </h2>

                    <div className="space-y-6 text-gray-700 text-lg leading-relaxed">
                        <p><strong>Welcome to Yaado Ka Baksa -- a treasure chest of memories.</strong></p>

                        <p>
                            In today's fast-paced world, where generations often drift apart in the rush of time,{' '}
                            <span className="font-semibold" style={{ color: 'var(--brand-brown-600)' }}>Yaado Ka Baksa</span>{' '}
                            brings families closer by preserving what truly matters -- their stories. We are an{' '}
                            <strong>interactive platform</strong> where people of all ages can come together to{' '}
                            <strong>share, listen, and relive family memories</strong> that define who we are.
                        </p>

                        <p>
                            From tales of childhood mischief and handwritten letters to stories of resilience, love, and laughter -- every memory has a place here.{' '}
                            <span className="font-semibold" style={{ color: 'var(--brand-brown-600)' }}>Yaado Ka Baksa</span>{' '}
                            bridges generations by offering a space where grandparents, parents, and children can connect through shared narratives, photos, and reflections.
                        </p>

                        <p>Our mission is simple:</p>

                        <ul className="space-y-2 pl-4">
                            <li className="flex items-start gap-3">
                                <span className="text-amber-600 mt-1">--</span>
                                <span>To keep memories alive.</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <span className="text-amber-600 mt-1">--</span>
                                <span>To celebrate the voices of every generation.</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <span className="text-amber-600 mt-1">--</span>
                                <span>To build a living legacy that families can cherish forever.</span>
                            </li>
                        </ul>

                        <p>
                            Open your <em>baksa</em> of memories -- and let the stories flow. Because every family has a story worth telling, and every story deserves to be remembered.
                        </p>

                        <p><strong>Yaado Ka Baksa -- where memories find a home.</strong></p>
                    </div>
                </div>

                <div className="text-center mt-8">
                    <Link to="/" className="inline-flex items-center gap-2 text-amber-800 hover:text-amber-600 transition-colors font-medium">
                        <ArrowLeft className="w-4 h-4" />
                        Back to Home
                    </Link>
                </div>
            </div>

            {/* Footer */}
            <footer className="text-center py-4 text-white text-sm"
                style={{ background: 'linear-gradient(45deg, var(--brand-brown-600), var(--brand-accent))' }}>
                <p>&copy; 2025 Yaado Ka Baksa. All Rights Reserved.</p>
            </footer>
        </div>
    );
}
