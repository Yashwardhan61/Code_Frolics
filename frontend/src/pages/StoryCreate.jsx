import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { storyService } from '../api/storyService';
import { useToast } from '../contexts/ToastContext';
import { ImageIcon, X, Loader2, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function StoryCreate() {
    const navigate = useNavigate();
    const toast = useToast();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        storyDate: '',
        location: '',
        tags: []
    });
    const [tagInput, setTagInput] = useState('');
    const [files, setFiles] = useState([]);
    const [previews, setPreviews] = useState([]);

    const handleFileChange = (e) => {
        const selectedFiles = Array.from(e.target.files);
        setFiles(prev => [...prev, ...selectedFiles]);
        
        // Generate previews
        const newPreviews = selectedFiles.map(file => URL.createObjectURL(file));
        setPreviews(prev => [...prev, ...newPreviews]);
    };

    const removeFile = (index) => {
        setFiles(prev => prev.filter((_, i) => i !== index));
        setPreviews(prev => {
            const newPreviews = [...prev];
            URL.revokeObjectURL(newPreviews[index]); // Free memory
            newPreviews.splice(index, 1);
            return newPreviews;
        });
    };

    const handleAddTag = (e) => {
        if (e.key === 'Enter' && tagInput.trim()) {
            e.preventDefault();
            if (!formData.tags.includes(tagInput.trim())) {
                setFormData({
                    ...formData,
                    tags: [...formData.tags, tagInput.trim()]
                });
            }
            setTagInput('');
        }
    };

    const removeTag = (tagToRemove) => {
        setFormData({
            ...formData,
            tags: formData.tags.filter(tag => tag !== tagToRemove)
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            await storyService.createStory(formData, files);
            toast.success('Memory saved successfully!');
            navigate('/dashboard');
        } catch (error) {
            console.error('Failed to create story', error);
            toast.error('Failed to save memory: ' + (error.response?.data?.message || error.message));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto py-8">
            <div className="mb-6 flex items-center">
                <Link to="/dashboard" className="text-gray-500 hover:text-amber-700 transition-colors mr-4">
                    <ArrowLeft className="w-6 h-6" />
                </Link>
                <h1 className="text-3xl font-bold" style={{ color: 'var(--brand-brown-800)' }}>Create New Memory</h1>
            </div>

            <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                <div className="space-y-6">
                    {/* Title */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Story Title *</label>
                        <input 
                            type="text" 
                            required
                            value={formData.title}
                            onChange={(e) => setFormData({...formData, title: e.target.value})}
                            placeholder="A beautiful day at the park..."
                            className="w-full p-3 border border-gray-300 rounded-xl focus:ring-amber-500 focus:border-amber-500"
                        />
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Story Description</label>
                        <textarea 
                            value={formData.description}
                            onChange={(e) => setFormData({...formData, description: e.target.value})}
                            placeholder="Tell us about what happened..."
                            className="w-full p-3 border border-gray-300 rounded-xl focus:ring-amber-500 focus:border-amber-500 min-h-[150px]"
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Date */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                            <input 
                                type="date" 
                                value={formData.storyDate}
                                onChange={(e) => setFormData({...formData, storyDate: e.target.value})}
                                className="w-full p-3 border border-gray-300 rounded-xl focus:ring-amber-500 focus:border-amber-500"
                            />
                        </div>

                        {/* Location */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                            <input 
                                type="text" 
                                value={formData.location}
                                onChange={(e) => setFormData({...formData, location: e.target.value})}
                                placeholder="E.g. Paris, France"
                                className="w-full p-3 border border-gray-300 rounded-xl focus:ring-amber-500 focus:border-amber-500"
                            />
                        </div>
                    </div>

                    {/* Tags */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Tags</label>
                        <div className="flex flex-wrap gap-2 mb-2">
                            {formData.tags.map(tag => (
                                <span key={tag} className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-amber-100 text-amber-800">
                                    {tag}
                                    <button 
                                        type="button" 
                                        onClick={() => removeTag(tag)}
                                        className="ml-1.5 inline-flex items-center justify-center w-4 h-4 rounded-full hover:bg-amber-200 focus:outline-none"
                                    >
                                        <X className="w-3 h-3" />
                                    </button>
                                </span>
                            ))}
                        </div>
                        <input 
                            type="text" 
                            value={tagInput}
                            onChange={(e) => setTagInput(e.target.value)}
                            onKeyDown={handleAddTag}
                            placeholder="Type a tag and press Enter"
                            className="w-full p-3 border border-gray-300 rounded-xl focus:ring-amber-500 focus:border-amber-500"
                        />
                    </div>

                    {/* Media Upload */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Media (Photos/Videos)</label>
                        
                        <div className="flex flex-wrap gap-4 mb-4">
                            {previews.map((preview, index) => (
                                <div key={index} className="relative w-32 h-32 rounded-xl overflow-hidden border border-gray-200 group">
                                    {files[index]?.type?.startsWith('video') ? (
                                        <video src={preview} className="w-full h-full object-cover" muted />
                                    ) : (
                                        <img src={preview} alt={`Preview ${index}`} className="w-full h-full object-cover" />
                                    )}
                                    <button 
                                        type="button"
                                        onClick={() => removeFile(index)}
                                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}
                            
                            <label className="w-32 h-32 flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:bg-gray-50 hover:border-amber-500 transition-colors">
                                <ImageIcon className="w-8 h-8 text-gray-400 mb-2" />
                                <span className="text-xs text-gray-500 font-medium">Add Media</span>
                                <input 
                                    type="file" 
                                    multiple 
                                    accept="image/*,video/*"
                                    onChange={handleFileChange}
                                    className="hidden"
                                />
                            </label>
                        </div>
                    </div>

                    {/* Submit Button */}
                    <div className="pt-4 border-t border-gray-100">
                        <button 
                            type="submit" 
                            disabled={loading || !formData.title.trim()}
                            className="w-full md:w-auto px-8 py-3 bg-gradient-to-r from-amber-600 to-amber-700 text-white font-medium rounded-xl shadow-md hover:from-amber-700 hover:to-amber-800 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                    Saving Memory...
                                </>
                            ) : (
                                'Save Memory'
                            )}
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
}
