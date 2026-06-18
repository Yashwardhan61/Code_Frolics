import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Star, Send } from 'lucide-react';
import { useToast } from '../contexts/ToastContext';

export default function Feedback() {
    const toast = useToast();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        feedbackType: 'design',
        rating: 0,
        message: ''
    });
    const [hoveredStar, setHoveredStar] = useState(0);
    const [submitted, setSubmitted] = useState(false);

    const feedbackTypes = [
        { value: 'design', label: 'Website Design' },
        { value: 'navigation', label: 'Ease of Navigation' },
        { value: 'content', label: 'Content Quality' },
        { value: 'performance', label: 'Website Performance' },
        { value: 'feature', label: 'New Feature Suggestion' },
        { value: 'bug', label: 'Technical Issue' },
        { value: 'like', label: 'Positive Feedback' },
        { value: 'other', label: 'Other' }
    ];

    const handleSubmit = (e) => {
        e.preventDefault();
        if (formData.rating === 0) {
            toast.warning('Please select a rating before submitting.');
            return;
        }
        // Show success toast (no backend endpoint for feedback yet)
        toast.success('Thank you for your feedback! We appreciate your input.');
        setSubmitted(true);
    };

    if (submitted) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-6" style={{ background: 'var(--brand-brown-50)' }}>
                <div className="bg-white rounded-2xl p-12 shadow-lg text-center max-w-md" style={{ border: '2px solid var(--brand-brown-200)' }}>
                    <div className="w-20 h-20 rounded-full mx-auto mb-6 flex items-center justify-center" style={{ background: 'linear-gradient(45deg, var(--brand-brown-400), var(--brand-brown-600))' }}>
                        <Star className="w-10 h-10 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold mb-4" style={{ color: 'var(--brand-brown-800)' }}>Thank You!</h2>
                    <p className="text-gray-600 mb-8">Your feedback has been received. We value your input and will use it to improve Yaado Ka Baksa.</p>
                    <Link to="/" className="inline-flex items-center gap-2 px-6 py-3 rounded-lg text-white font-medium transition-all hover:scale-105" style={{ background: 'linear-gradient(45deg, var(--brand-brown-600), var(--brand-accent))' }}>
                        <ArrowLeft className="w-4 h-4" />
                        Back to Home
                    </Link>
                </div>
            </div>
        );
    }

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
                    <p className="text-lg opacity-90">Your Feedback Matters to Us</p>
                </div>
            </header>

            {/* Form */}
            <div className="flex-grow flex items-center justify-center px-6 py-12">
                <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-10 shadow-lg w-full max-w-2xl"
                    style={{ border: '2px solid var(--brand-brown-200)' }}>

                    <h2 className="text-4xl mb-8 text-center"
                        style={{ fontFamily: "'Dancing Script', cursive", background: 'linear-gradient(45deg, var(--brand-brown-600), var(--brand-brown-400))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                        Share Your Thoughts
                    </h2>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label htmlFor="feedback-name" className="block text-sm font-medium text-gray-700 mb-1">Your Name</label>
                            <input id="feedback-name" type="text" required
                                value={formData.name}
                                onChange={(e) => setFormData({...formData, name: e.target.value})}
                                placeholder="Enter your name"
                                className="w-full p-3 rounded-xl transition-all focus:outline-none focus:ring-2"
                                style={{ border: '2px solid var(--brand-brown-200)', focusRingColor: 'var(--brand-brown-400)' }}
                            />
                        </div>

                        <div>
                            <label htmlFor="feedback-email" className="block text-sm font-medium text-gray-700 mb-1">Your Email</label>
                            <input id="feedback-email" type="email" required
                                value={formData.email}
                                onChange={(e) => setFormData({...formData, email: e.target.value})}
                                placeholder="Enter your email"
                                className="w-full p-3 rounded-xl transition-all focus:outline-none focus:ring-2"
                                style={{ border: '2px solid var(--brand-brown-200)' }}
                            />
                        </div>

                        <div>
                            <label htmlFor="feedback-type" className="block text-sm font-medium text-gray-700 mb-1">Type of Feedback</label>
                            <select id="feedback-type"
                                value={formData.feedbackType}
                                onChange={(e) => setFormData({...formData, feedbackType: e.target.value})}
                                className="w-full p-3 rounded-xl transition-all focus:outline-none focus:ring-2"
                                style={{ border: '2px solid var(--brand-brown-200)' }}>
                                {feedbackTypes.map(ft => (
                                    <option key={ft.value} value={ft.value}>{ft.label}</option>
                                ))}
                            </select>
                        </div>

                        {/* Star Rating */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Rating</label>
                            <div className="flex justify-center gap-2">
                                {[1, 2, 3, 4, 5].map(star => (
                                    <button key={star} type="button"
                                        className="text-4xl transition-colors duration-200 cursor-pointer"
                                        style={{ color: star <= (hoveredStar || formData.rating) ? 'var(--brand-accent)' : 'var(--brand-brown-200)' }}
                                        onMouseEnter={() => setHoveredStar(star)}
                                        onMouseLeave={() => setHoveredStar(0)}
                                        onClick={() => setFormData({...formData, rating: star})}>
                                        *
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label htmlFor="feedback-message" className="block text-sm font-medium text-gray-700 mb-1">Your Message</label>
                            <textarea id="feedback-message" rows="5" required
                                value={formData.message}
                                onChange={(e) => setFormData({...formData, message: e.target.value})}
                                placeholder="Write your feedback here..."
                                className="w-full p-3 rounded-xl transition-all focus:outline-none focus:ring-2 resize-none"
                                style={{ border: '2px solid var(--brand-brown-200)' }}
                            />
                        </div>

                        <button type="submit"
                            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-white font-semibold text-lg transition-all hover:-translate-y-0.5 hover:shadow-lg"
                            style={{ background: 'linear-gradient(45deg, var(--brand-brown-600), var(--brand-accent))' }}>
                            <Send className="w-5 h-5" />
                            Submit Feedback
                        </button>
                    </form>

                    <div className="text-center mt-6">
                        <Link to="/" className="inline-flex items-center gap-2 text-amber-800 hover:text-amber-600 transition-colors font-medium text-sm">
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
