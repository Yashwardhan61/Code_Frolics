import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Mail, Phone, MapPin, Clock, Camera, MessageSquare, Hash } from 'lucide-react';

export default function Contact() {
    return (
        <div className="min-h-screen flex flex-col" style={{ background: 'var(--brand-brown-50)' }}>
            {/* Header */}
            <header className="flex items-center justify-center gap-4 py-6 shadow-md"
                style={{ background: 'linear-gradient(45deg, var(--brand-brown-600), var(--brand-accent))' }}>
                <div className="w-14 h-14 rounded-xl bg-white/10 flex items-center justify-center p-1">
                    <span className="text-2xl font-bold text-amber-200" style={{ fontFamily: "'Dancing Script', cursive" }}>Y</span>
                </div>
                <div className="text-center text-white">
                    <h1 className="text-3xl font-bold" style={{ fontFamily: "'Dancing Script', cursive" }}>Yaado Ka Baksa</h1>
                    <p className="text-lg opacity-90">Contact Us</p>
                </div>
            </header>

            {/* Content */}
            <div className="flex-grow flex items-center justify-center px-6 py-12">
                <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-10 shadow-lg w-full max-w-2xl"
                    style={{ border: '2px solid var(--brand-brown-200)' }}>

                    <h2 className="text-4xl mb-8 text-center"
                        style={{ fontFamily: "'Dancing Script', cursive", background: 'linear-gradient(45deg, var(--brand-brown-600), var(--brand-brown-400))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                        We'd love to hear from you!
                    </h2>

                    <div className="space-y-5 text-gray-700 text-lg">
                        <div className="flex items-center gap-4 p-4 rounded-xl bg-amber-50/60">
                            <Mail className="w-6 h-6 text-amber-700 flex-shrink-0" />
                            <div>
                                <p className="font-semibold text-gray-800">Email</p>
                                <p>support@yaadokabaksa.com</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-4 p-4 rounded-xl bg-amber-50/60">
                            <Phone className="w-6 h-6 text-amber-700 flex-shrink-0" />
                            <div>
                                <p className="font-semibold text-gray-800">Phone</p>
                                <p>+91 98765 43210</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-4 p-4 rounded-xl bg-amber-50/60">
                            <MapPin className="w-6 h-6 text-amber-700 flex-shrink-0" />
                            <div>
                                <p className="font-semibold text-gray-800">Address</p>
                                <p>22, Heritage Lane, Jaipur, Rajasthan, India</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-4 p-4 rounded-xl bg-amber-50/60">
                            <Clock className="w-6 h-6 text-amber-700 flex-shrink-0" />
                            <div>
                                <p className="font-semibold text-gray-800">Working Hours</p>
                                <p>Monday - Saturday | 9:00 AM - 6:00 PM</p>
                            </div>
                        </div>

                        <div className="pt-4 border-t" style={{ borderColor: 'var(--brand-brown-200)' }}>
                            <p className="font-semibold text-gray-800 mb-3">Social Media</p>
                            <div className="flex gap-4">
                                <a href="#" className="flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-50 text-amber-800 hover:bg-amber-100 transition-colors text-sm font-medium">
                                    <Camera className="w-4 h-4" /> @yaadokabaksa
                                </a>
                                <a href="#" className="flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-50 text-amber-800 hover:bg-amber-100 transition-colors text-sm font-medium">
                                    <MessageSquare className="w-4 h-4" /> Facebook
                                </a>
                                <a href="#" className="flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-50 text-amber-800 hover:bg-amber-100 transition-colors text-sm font-medium">
                                    <Hash className="w-4 h-4" /> Twitter
                                </a>
                            </div>
                        </div>
                    </div>

                    <div className="text-center mt-8">
                        <Link to="/" className="inline-flex items-center gap-2 text-amber-800 hover:text-amber-600 transition-colors font-medium">
                            <ArrowLeft className="w-4 h-4" />
                            Back to Home
                        </Link>
                    </div>
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
