import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { recipeService } from '../api/recipeService';
import { familyService } from '../api/familyService';
import { Image as ImageIcon, X, Plus, Clock, Users, ArrowLeft, Loader, GripVertical, Book } from 'lucide-react';
import { useToast } from '../contexts/ToastContext';

export default function RecipeCreate() {
    const navigate = useNavigate();
    const { currentUser } = useAuth();
    const toast = useToast();
    const [loading, setLoading] = useState(false);
    
    // Basic fields
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [cookingTime, setCookingTime] = useState('');
    const [servings, setServings] = useState('');
    
    // Dynamic lists
    const [ingredients, setIngredients] = useState([{ name: '', quantity: '', unit: '' }]);
    const [steps, setSteps] = useState(['']);
    
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

    // Ingredient Handlers
    const addIngredient = () => {
        setIngredients([...ingredients, { name: '', quantity: '', unit: '' }]);
    };
    
    const updateIngredient = (index, field, value) => {
        const newIngredients = [...ingredients];
        newIngredients[index][field] = value;
        setIngredients(newIngredients);
    };
    
    const removeIngredient = (index) => {
        if (ingredients.length > 1) {
            setIngredients(ingredients.filter((_, i) => i !== index));
        }
    };

    // Step Handlers
    const addStep = () => {
        setSteps([...steps, '']);
    };
    
    const updateStep = (index, value) => {
        const newSteps = [...steps];
        newSteps[index] = value;
        setSteps(newSteps);
    };
    
    const removeStep = (index) => {
        if (steps.length > 1) {
            setSteps(steps.filter((_, i) => i !== index));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!title.trim()) {
            toast.error("Please provide a recipe title");
            return;
        }

        // Clean up empty ingredients/steps
        const cleanedIngredients = ingredients.filter(i => i.name.trim());
        if (cleanedIngredients.length === 0) {
            toast.error("Please add at least one ingredient");
            return;
        }

        const cleanedSteps = steps.filter(s => s.trim());
        if (cleanedSteps.length === 0) {
            toast.error("Please add at least one step");
            return;
        }

        try {
            setLoading(true);
            const recipeData = {
                title,
                description,
                cookingTime,
                servings,
                familyMemberId: selectedFamilyMember ? parseInt(selectedFamilyMember) : null,
                tags,
                ingredients: cleanedIngredients,
                steps: cleanedSteps
            };

            await recipeService.createRecipe(recipeData, files);
            toast.success("Recipe preserved successfully!");
            navigate('/heritage');
        } catch (error) {
            console.error("Failed to create recipe:", error);
            toast.error("Failed to save recipe. Please try again.");
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
                    <h1 className="text-3xl font-bold text-gray-900 mb-8 brand-title">Add Family Recipe</h1>
                    
                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Recipe Name *</label>
                            <input
                                type="text"
                                required
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all text-lg"
                                placeholder="e.g., Dadi ki Dal"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">The Story Behind It</label>
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                rows={3}
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all resize-none"
                                placeholder="Why is this recipe special? When was it usually made?"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    <div className="flex items-center gap-2">
                                        <Clock className="w-4 h-4 text-amber-600" />
                                        Cooking Time
                                    </div>
                                </label>
                                <input
                                    type="text"
                                    value={cookingTime}
                                    onChange={(e) => setCookingTime(e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                                    placeholder="e.g., 45 mins"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    <div className="flex items-center gap-2">
                                        <Users className="w-4 h-4 text-amber-600" />
                                        Servings
                                    </div>
                                </label>
                                <input
                                    type="text"
                                    value={servings}
                                    onChange={(e) => setServings(e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                                    placeholder="e.g., 4-6 people"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Ingredients Section */}
                <div className="bg-white rounded-3xl p-8 shadow-sm border border-amber-900/10">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-semibold text-gray-900">Ingredients *</h2>
                    </div>
                    
                    <div className="space-y-3">
                        {ingredients.map((ing, idx) => (
                            <div key={idx} className="flex items-center gap-3">
                                <GripVertical className="w-5 h-5 text-gray-300 cursor-grab" />
                                <input
                                    type="text"
                                    value={ing.quantity}
                                    onChange={(e) => updateIngredient(idx, 'quantity', e.target.value)}
                                    className="w-24 px-3 py-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                                    placeholder="Qty (e.g. 2)"
                                />
                                <input
                                    type="text"
                                    value={ing.unit}
                                    onChange={(e) => updateIngredient(idx, 'unit', e.target.value)}
                                    className="w-32 px-3 py-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                                    placeholder="Unit (e.g. cups)"
                                />
                                <input
                                    type="text"
                                    value={ing.name}
                                    onChange={(e) => updateIngredient(idx, 'name', e.target.value)}
                                    className="flex-1 px-3 py-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                                    placeholder="Ingredient name (e.g. Basmati Rice)"
                                />
                                <button
                                    type="button"
                                    onClick={() => removeIngredient(idx)}
                                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                                    disabled={ingredients.length === 1}
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                        ))}
                    </div>
                    
                    <button
                        type="button"
                        onClick={addIngredient}
                        className="mt-4 flex items-center gap-2 text-amber-600 hover:text-amber-700 font-medium px-4 py-2 hover:bg-amber-50 rounded-lg transition-colors"
                    >
                        <Plus className="w-4 h-4" /> Add Ingredient
                    </button>
                </div>

                {/* Steps Section */}
                <div className="bg-white rounded-3xl p-8 shadow-sm border border-amber-900/10">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-semibold text-gray-900">Instructions *</h2>
                    </div>
                    
                    <div className="space-y-4">
                        {steps.map((step, idx) => (
                            <div key={idx} className="flex gap-4">
                                <div className="flex flex-col items-center gap-2">
                                    <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center font-bold flex-shrink-0 mt-1">
                                        {idx + 1}
                                    </div>
                                    <GripVertical className="w-5 h-5 text-gray-300 cursor-grab opacity-50" />
                                </div>
                                <div className="flex-1">
                                    <textarea
                                        value={step}
                                        onChange={(e) => updateStep(idx, e.target.value)}
                                        rows={2}
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 resize-none"
                                        placeholder={`Step ${idx + 1} description...`}
                                    />
                                </div>
                                <button
                                    type="button"
                                    onClick={() => removeStep(idx)}
                                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors h-fit mt-1 disabled:opacity-50"
                                    disabled={steps.length === 1}
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                        ))}
                    </div>
                    
                    <button
                        type="button"
                        onClick={addStep}
                        className="mt-4 flex items-center gap-2 text-amber-600 hover:text-amber-700 font-medium px-4 py-2 hover:bg-amber-50 rounded-lg transition-colors"
                    >
                        <Plus className="w-4 h-4" /> Add Step
                    </button>
                </div>

                {/* Media & Tags Section */}
                <div className="bg-white rounded-3xl p-8 shadow-sm border border-amber-900/10">
                    <h2 className="text-xl font-semibold text-gray-900 mb-6">Details & Photos</h2>
                    
                    <div className="space-y-8">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Photos</label>
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
                                <label className="block text-sm font-medium text-gray-700 mb-2">From Family Member</label>
                                <select
                                    value={selectedFamilyMember}
                                    onChange={(e) => setSelectedFamilyMember(e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                                >
                                    <option value="">-- Select Family Member (Optional) --</option>
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
                        {loading ? <Loader className="w-5 h-5 animate-spin mr-2" /> : <Book className="w-5 h-5 mr-2" />}
                        Save Recipe
                    </button>
                </div>
            </form>
        </div>
    );
}
