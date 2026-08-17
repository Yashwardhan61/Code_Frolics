import React, { useState } from 'react';
import { X, Sparkles, ChevronDown, ChevronRight, BookOpen } from 'lucide-react';

const promptCategories = [
    {
        id: 'childhood',
        name: 'Childhood & Youth',
        prompts: [
            "What is your earliest childhood memory?",
            "Describe a favorite holiday tradition you had growing up.",
            "What was your favorite childhood game, pastime, or toy?",
            "Tell the story of a childhood best friend and your adventures together."
        ]
    },
    {
        id: 'travel',
        name: 'Journeys & Travel',
        prompts: [
            "What was the most adventurous trip you ever took?",
            "Describe a place that felt like home away from home.",
            "What was the most memorable local dish you experienced on a journey?",
            "Tell the tale of an unexpected detour or journey surprise."
        ]
    },
    {
        id: 'family',
        name: 'Family Heritage',
        prompts: [
            "What is a piece of wisdom your parents or grandparents gave you?",
            "Tell the story of how your family name or a unique tradition originated.",
            "Describe a typical gathering in your ancestral home.",
            "What is an heirloom or keepsake with an unforgettable background?"
        ]
    },
    {
        id: 'milestones',
        name: 'Milestones & Turning Points',
        prompts: [
            "Describe your first day in a new city, school, or career.",
            "How did you feel when you overcame a defining challenge?",
            "What was a major turning point that shaped who you are today?",
            "What achievement brought the deepest sense of gratitude?"
        ]
    }
];

export default function MemoryPromptsModal({ isOpen, onClose, onSelectPrompt }) {
    const [expandedCategory, setExpandedCategory] = useState('childhood');

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl p-6 md:p-8 max-w-lg w-full shadow-2xl border border-[#e5dcd3] animate-in fade-in zoom-in-95 duration-200 max-h-[85vh] flex flex-col">
                <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-4">
                    <div className="flex items-center gap-2.5">
                        <div className="p-2 rounded-xl bg-amber-100/60 text-amber-800">
                            <Sparkles className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="font-serif font-bold text-lg text-gray-900">Memory Prompts</h3>
                            <p className="text-xs text-gray-500">Inspiration to help ignite your storytelling</p>
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

                <div className="overflow-y-auto pr-1 space-y-3 flex-1">
                    {promptCategories.map((cat) => {
                        const isExpanded = expandedCategory === cat.id;
                        return (
                            <div
                                key={cat.id}
                                className="border border-gray-200/80 rounded-2xl overflow-hidden transition-all"
                            >
                                <button
                                    type="button"
                                    onClick={() => setExpandedCategory(isExpanded ? null : cat.id)}
                                    className="w-full flex items-center justify-between p-3.5 bg-gray-50/70 hover:bg-amber-50/40 text-left transition-colors"
                                >
                                    <div className="flex items-center gap-2">
                                        <BookOpen className="w-4 h-4 text-amber-800" />
                                        <span className="font-serif font-semibold text-sm text-gray-900">
                                            {cat.name}
                                        </span>
                                    </div>
                                    {isExpanded ? (
                                        <ChevronDown className="w-4 h-4 text-gray-500" />
                                    ) : (
                                        <ChevronRight className="w-4 h-4 text-gray-400" />
                                    )}
                                </button>

                                {isExpanded && (
                                    <div className="p-3 bg-white space-y-2 border-t border-gray-100">
                                        {cat.prompts.map((prompt, idx) => (
                                            <button
                                                key={idx}
                                                type="button"
                                                onClick={() => {
                                                    onSelectPrompt(prompt);
                                                    onClose();
                                                }}
                                                className="w-full text-left p-3 rounded-xl hover:bg-amber-50/60 border border-transparent hover:border-amber-200 text-xs text-gray-700 transition-all font-sans leading-relaxed flex items-start gap-2 group cursor-pointer"
                                            >
                                                <span className="w-1.5 h-1.5 rounded-full bg-amber-700 mt-1.5 shrink-0 opacity-40 group-hover:opacity-100" />
                                                <span className="flex-1">{prompt}</span>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
