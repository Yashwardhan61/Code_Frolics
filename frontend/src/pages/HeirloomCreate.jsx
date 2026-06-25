import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { heirloomService } from '../api/heirloomService';
import { familyService } from '../api/familyService';
import { Image as ImageIcon, X, Loader, Gem, ArrowLeft, ArrowRight } from 'lucide-react';
import { useToast } from '../contexts/ToastContext';

export default function HeirloomCreate() {
    const navigate = useNavigate();
    const { currentUser } = useAuth();
    const toast = useToast();
    const [loading, setLoading] = useState(false);
    
    // Basic fields
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [currentOwner, setCurrentOwner] = useState('');
    const [nextOwner, setNextOwner] = useState('');
    const [estimatedYear, setEstimatedYear] = useState('');
    
    // Tags and attribution
    const [tagsInput, setTagsInput] = useState('');
    const [tags, setTags] = useState([]);
    const [familyMembers, setFamilyMembers] = useState([]);
    const [selectedFamilyMember, setSelectedFamilyMember] = useState('');
    
    // Media
    const [files, setFiles] = useState([]);
    const [previews, setPreviews] = useState([]);

    useEffect(() => {
        const fetchFamilyMembers = async () => {
            try {
                const [paternal, maternal] = await Promise.all([
                    familyService.getTree('paternal').catch(() => []),
                    familyService.getTree('maternal').catch(() => [])
                ]);
                setFamilyMembers([...paternal, ...maternal]);
            } catch (error) {
                console.error("Failed to fetch family members", error);
            }
        };
        fetchFamilyMembers();
    }, []);

    const handleFileChange = (e) => {
        const selectedFiles = Array.from(e.target.files);
        setFiles(prev => [...prev, ...selectedFiles]);
        
        const newPreviews = selectedFiles.map(file => URL.createObjectURL(file));
        setPreviews(prev => [...prev, ...newPreviews]);
    };

    const removeFile = (index) => {
        setFiles(prev => prev.filter((_, i) => i !== index));
        URL.revokeObjectURL(previews[index]);
        setPreviews(prev => prev.filter((_, i) => i !== index));
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && tagsInput.trim()) {
            e.preventDefault();
            if (!tags.includes(tagsInput.trim())) {
                setTags([...tags, tagsInput.trim()]);
            }
            setTagsInput('');
        }
    };

    const removeTag = (tagToRemove) => {
        setTags(tags.filter(tag => tag !== tagToRemove));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!name.trim()) {
            toast.error("Please provide a name for the heirloom");
            return;
        }

        try {
            setLoading(true);
            const heirloomData = {
                name,
                description,
                currentOwner,
                nextOwner,
                estimatedYear,
                familyMemberId: selectedFamilyMember ? parseInt(selectedFamilyMember) : null,
                tags
            };

            await heirloomService.createHeirloom(heirloomData, files);
            toast.success("Heirloom preserved successfully!");
            navigate('/heritage');
        } catch (error) {
            console.error("Failed to create heirloom:", error);
            toast.error("Failed to save heirloom. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto pb-24">
            <button 
                onClick={() => navigate('/heritage')}
                className="flex items-center text-amber-900 hover:text-amber-700 transition-colors mb-6 group"
            >
                <ArrowLeft className="w-5 h-5 mr-2 transform group-hover:-translate-x-1 transition-transform" />
                Back to Heritage Vault
            </button>

            <form onSubmit={handleSubmit} className="space-y-8">
                {/* Header Section */}
                <div className="bg-white rounded-3xl p-8 shadow-sm border border-amber-900/10">
                    <h1 className="text-3xl font-bold text-gray-900 mb-8 brand-title">Add Family Heirloom</h1>
                    
                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Item Name *</label>
                            <input
                                type="text"
                                required
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all text-lg"
                                placeholder="e.g., Nana's pocket watch"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">History & Significance</label>
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                rows={4}
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all resize-none"
                                placeholder="What is the story behind this item? How did it come into the family?"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Current Owner
                                </label>
                                <input
                                    type="text"
                                    value={currentOwner}
                                    onChange={(e) => setCurrentOwner(e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                                    placeholder="Who has it now?"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Intended Heir (Next Owner)
                                </label>
                                <input
                                    type="text"
                                    value={nextOwner}
                                    onChange={(e) => setNextOwner(e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 bg-amber-50/50"
                                    placeholder="Who should it pass to?"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Estimated Year/Era
                                </label>
                                <input
                                    type="text"
                                    value={estimatedYear}
                                    onChange={(e) => setEstimatedYear(e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                                    placeholder="e.g., 1940s, or exact year"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Media & Tags Section */}
                <div className="bg-white rounded-3xl p-8 shadow-sm border border-amber-900/10">
                    <h2 className="text-xl font-semibold text-gray-900 mb-6">Photos & Details</h2>
                    
                    <div className="space-y-8">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Photos of the Object</label>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {previews.map((preview, idx) => (
                                    <div key={idx} className="relative aspect-square rounded-xl overflow-hidden group">
                                        <img src={preview} alt={`Preview ${idx}`} className="w-full h-full object-cover" />
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                            <button
                                                type="button"
                                                onClick={() => removeFile(idx)}
                                                className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transform hover:scale-110 transition-all"
                                            >
                                                <X className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                                <label className="aspect-square rounded-xl border-2 border-dashed border-gray-300 hover:border-amber-500 hover:bg-amber-50 flex flex-col items-center justify-center cursor-pointer transition-colors group">
                                    <ImageIcon className="w-8 h-8 text-gray-400 group-hover:text-amber-500 mb-2 transition-colors" />
                                    <span className="text-sm font-medium text-gray-500 group-hover:text-amber-600">Add Photos</span>
                                    <input type="file" className="hidden" multiple accept="image/*" onChange={handleFileChange} />
                                </label>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Associated Family Member</label>
                                <select
                                    value={selectedFamilyMember}
                                    onChange={(e) => setSelectedFamilyMember(e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                                >
                                    <option value="">-- Select Original Owner (Optional) --</option>
                                    {familyMembers.map(member => (
                                        <option key={member.id} value={member.id}>
                                            {member.name} ({member.relationship})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Custom Tags</label>
                                <div className="border border-gray-200 rounded-xl p-2 focus-within:ring-2 focus-within:ring-amber-500/20 focus-within:border-amber-500 transition-all bg-white flex flex-wrap gap-2">
                                    {tags.map((tag, idx) => (
                                        <span key={idx} className="flex items-center gap-1 px-3 py-1 bg-amber-100 text-amber-800 text-sm rounded-lg">
                                            #{tag}
                                            <button type="button" onClick={() => removeTag(tag)} className="hover:text-amber-900 ml-1">
                                                <X className="w-3 h-3" />
                                            </button>
                                        </span>
                                    ))}
                                    <input
                                        type="text"
                                        value={tagsInput}
                                        onChange={(e) => setTagsInput(e.target.value)}
                                        onKeyDown={handleKeyDown}
                                        className="flex-1 min-w-[120px] outline-none bg-transparent px-2 py-1 text-sm"
                                        placeholder="Type & press Enter"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex justify-end gap-4">
                    <button
                        type="button"
                        onClick={() => navigate('/heritage')}
                        className="px-6 py-3 text-gray-600 font-medium hover:bg-gray-100 rounded-xl transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        className="flex items-center px-8 py-3 bg-amber-600 text-white font-medium rounded-xl hover:bg-amber-700 disabled:opacity-50 transition-colors shadow-lg shadow-amber-600/20"
                    >
                        {loading ? <Loader className="w-5 h-5 animate-spin mr-2" /> : <Gem className="w-5 h-5 mr-2" />}
                        Save Heirloom
                    </button>
                </div>
            </form>
        </div>
    );
}
