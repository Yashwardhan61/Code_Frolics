import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { recipeService } from '../api/recipeService';
import { Clock, Users, ArrowLeft, Trash2, Book, CheckCircle2, ChevronRight } from 'lucide-react';
import { useToast } from '../contexts/ToastContext';

export default function RecipeView() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { currentUser, userRole } = useAuth();
    const toast = useToast();
    
    const [recipe, setRecipe] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeImage, setActiveImage] = useState(0);

    useEffect(() => {
        const fetchRecipe = async () => {
            try {
                const data = await recipeService.getRecipeById(id);
                setRecipe(data);
            } catch (error) {
                console.error("Failed to fetch recipe:", error);
                toast.error("Recipe not found or you don't have access.");
                navigate('/heritage');
            } finally {
                setLoading(false);
            }
        };
        fetchRecipe();
    }, [id, navigate]);

    const handleDelete = async () => {
        if (window.confirm("Are you sure you want to delete this recipe? This cannot be undone.")) {
            try {
                await recipeService.deleteRecipe(id);
                toast.success("Recipe deleted successfully");
                navigate('/heritage');
            } catch (error) {
                console.error("Failed to delete recipe", error);
                toast.error("Failed to delete recipe");
            }
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[50vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600"></div>
            </div>
        );
    }

    if (!recipe) return null;

    const isOwner = recipe.userId === currentUser?.id;
    const canDelete = (isOwner || userRole === 'ADMIN') && userRole !== 'VIEWER';

    return (
        <div className="max-w-5xl mx-auto pb-24">
            {/* Header Actions */}
            <div className="flex justify-between items-center mb-8">
                <button 
                    onClick={() => navigate('/heritage')}
                    className="flex items-center text-amber-900 hover:text-amber-700 transition-colors group bg-white/50 px-4 py-2 rounded-xl backdrop-blur-sm border border-amber-900/10"
                >
                    <ArrowLeft className="w-5 h-5 mr-2 transform group-hover:-translate-x-1 transition-transform" />
                    Back to Heritage
                </button>

                {canDelete && (
                    <button
                        onClick={handleDelete}
                        className="flex items-center px-4 py-2 text-red-600 hover:text-white hover:bg-red-600 rounded-xl transition-colors border border-red-200"
                    >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                    </button>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Left Column: Media & Meta */}
                <div className="lg:col-span-5 space-y-6">
                    {/* Media Gallery */}
                    <div className="bg-white rounded-3xl p-3 shadow-sm border border-amber-900/10">
                        {recipe.mediaFiles && recipe.mediaFiles.length > 0 ? (
                            <div className="space-y-3">
                                <div className="aspect-[4/5] rounded-2xl overflow-hidden bg-gray-100">
                                    <img 
                                        src={recipe.mediaFiles[activeImage].mediaUrl} 
                                        alt="Recipe media" 
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                {recipe.mediaFiles.length > 1 && (
                                    <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar">
                                        {recipe.mediaFiles.map((media, idx) => (
                                            <button
                                                key={idx}
                                                onClick={() => setActiveImage(idx)}
                                                className={`relative w-20 h-20 flex-shrink-0 rounded-xl overflow-hidden transition-all ${
                                                    activeImage === idx 
                                                    ? 'ring-2 ring-amber-500 ring-offset-2' 
                                                    : 'opacity-60 hover:opacity-100'
                                                }`}
                                            >
                                                <img src={media.mediaUrl} alt="" className="w-full h-full object-cover" />
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="aspect-[4/5] rounded-2xl bg-amber-50 flex items-center justify-center border-2 border-dashed border-amber-200">
                                <div className="text-center text-amber-600/50">
                                    <Book className="w-16 h-16 mx-auto mb-2" />
                                    <p>No photos</p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Metadata Card */}
                    <div className="bg-white rounded-3xl p-6 shadow-sm border border-amber-900/10">
                        <div className="grid grid-cols-2 gap-4">
                            {recipe.cookingTime && (
                                <div className="flex items-center gap-3 p-4 bg-amber-50 rounded-2xl">
                                    <div className="p-2 bg-amber-100 rounded-xl text-amber-700">
                                        <Clock className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-amber-800/60 font-medium uppercase tracking-wider">Time</p>
                                        <p className="font-semibold text-amber-900">{recipe.cookingTime}</p>
                                    </div>
                                </div>
                            )}
                            {recipe.servings && (
                                <div className="flex items-center gap-3 p-4 bg-amber-50 rounded-2xl">
                                    <div className="p-2 bg-amber-100 rounded-xl text-amber-700">
                                        <Users className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-amber-800/60 font-medium uppercase tracking-wider">Serves</p>
                                        <p className="font-semibold text-amber-900">{recipe.servings}</p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {recipe.tags && recipe.tags.length > 0 && (
                            <div className="mt-6 flex flex-wrap gap-2">
                                {recipe.tags.map((tag, idx) => (
                                    <span key={idx} className="px-3 py-1 bg-gray-100 text-gray-600 text-sm font-medium rounded-full">
                                        #{tag}
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Column: Title, Ingredients, Steps */}
                <div className="lg:col-span-7 space-y-8">
                    {/* Header */}
                    <div className="bg-white rounded-3xl p-8 md:p-10 shadow-sm border border-amber-900/10">
                        {recipe.familyMemberName && (
                            <span className="inline-block px-4 py-1.5 bg-amber-100 text-amber-800 text-sm font-medium rounded-full mb-4">
                                From the kitchen of {recipe.familyMemberName}
                            </span>
                        )}
                        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 brand-title tracking-tight leading-tight">
                            {recipe.title}
                        </h1>
                        {recipe.description && (
                            <p className="text-lg text-gray-600 leading-relaxed font-light">
                                {recipe.description}
                            </p>
                        )}
                    </div>

                    {/* Ingredients */}
                    <div className="bg-white rounded-3xl p-8 md:p-10 shadow-sm border border-amber-900/10">
                        <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                            <span className="w-8 h-8 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center text-sm">
                                <Book className="w-4 h-4" />
                            </span>
                            Ingredients
                        </h2>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                            {recipe.ingredients.map((ing, idx) => (
                                <div key={idx} className="flex items-start gap-3 py-2 border-b border-gray-100 last:border-0 group cursor-default">
                                    <CheckCircle2 className="w-5 h-5 text-gray-300 group-hover:text-amber-500 transition-colors mt-0.5 flex-shrink-0" />
                                    <div>
                                        <span className="font-semibold text-gray-900">{ing.quantity} {ing.unit}</span>
                                        <span className="text-gray-600 ml-2">{ing.name}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Instructions */}
                    <div className="bg-white rounded-3xl p-8 md:p-10 shadow-sm border border-amber-900/10">
                        <h2 className="text-2xl font-bold text-gray-900 mb-8 flex items-center gap-3">
                            <span className="w-8 h-8 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center text-sm">
                                <Book className="w-4 h-4" />
                            </span>
                            Instructions
                        </h2>
                        
                        <div className="space-y-8">
                            {recipe.steps.map((step, idx) => (
                                <div key={idx} className="flex gap-6 group">
                                    <div className="flex flex-col items-center">
                                        <div className="w-10 h-10 rounded-full bg-amber-50 text-amber-700 flex items-center justify-center font-bold text-lg border-2 border-amber-200 group-hover:bg-amber-500 group-hover:text-white group-hover:border-amber-500 transition-all">
                                            {step.stepNumber}
                                        </div>
                                        {idx !== recipe.steps.length - 1 && (
                                            <div className="w-0.5 h-full bg-amber-100 mt-2"></div>
                                        )}
                                    </div>
                                    <div className="flex-1 pb-4">
                                        <p className="text-gray-700 leading-relaxed text-lg pt-1">
                                            {step.instruction}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
