import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { recipeService } from '../api/recipeService';
import { heirloomService } from '../api/heirloomService';
import { Book, Gem, Plus, Clock, Users, ArrowRight } from 'lucide-react';

export default function Heritage() {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('recipes'); // 'recipes' or 'heirlooms'
    const [recipes, setRecipes] = useState([]);
    const [heirlooms, setHeirlooms] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [recipesData, heirloomsData] = await Promise.all([
                recipeService.getAllRecipes(),
                heirloomService.getAllHeirlooms()
            ]);
            setRecipes(recipesData);
            setHeirlooms(heirloomsData);
        } catch (error) {
            console.error("Error fetching heritage items:", error);
        } finally {
            setLoading(false);
        }
    };

    const EmptyState = ({ type }) => (
        <div className="flex flex-col items-center justify-center p-12 text-center bg-white/50 backdrop-blur-sm rounded-3xl border border-amber-900/10">
            {type === 'recipes' ? (
                <Book className="w-16 h-16 text-amber-300 mb-4" />
            ) : (
                <Gem className="w-16 h-16 text-amber-300 mb-4" />
            )}
            <h3 className="text-xl font-medium text-amber-900 mb-2">
                No {type} yet
            </h3>
            <p className="text-amber-700/70 mb-6 max-w-md">
                {type === 'recipes' 
                    ? "Preserve the flavors of your family history. Add that special recipe before it's forgotten."
                    : "Document the physical artifacts of your family's journey. Add heirlooms and their stories."}
            </p>
            <button
                onClick={() => navigate(`/${type === 'recipes' ? 'recipe' : 'heirloom'}/create`)}
                className="flex items-center gap-2 px-6 py-3 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-medium transition-all"
            >
                <Plus className="w-5 h-5" />
                Add {type === 'recipes' ? 'Recipe' : 'Heirloom'}
            </button>
        </div>
    );

    const RecipeCard = ({ recipe }) => (
        <div 
            onClick={() => navigate(`/recipe/${recipe.id}`)}
            className="group cursor-pointer bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-amber-900/5 hover:-translate-y-1"
        >
            <div className="aspect-[4/3] relative overflow-hidden bg-amber-50">
                {recipe.mediaFiles && recipe.mediaFiles.length > 0 ? (
                    <img 
                        src={recipe.mediaFiles[0].mediaUrl} 
                        alt={recipe.title} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center bg-amber-100/50">
                        <Book className="w-12 h-12 text-amber-300" />
                    </div>
                )}
                {recipe.familyMemberName && (
                    <div className="absolute top-4 left-4">
                        <span className="px-3 py-1 bg-white/90 backdrop-blur-md text-amber-900 text-xs font-medium rounded-full shadow-sm">
                            From {recipe.familyMemberName}
                        </span>
                    </div>
                )}
            </div>
            
            <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-2 line-clamp-1">{recipe.title}</h3>
                <p className="text-gray-500 text-sm mb-4 line-clamp-2 min-h-[40px]">
                    {recipe.description || 'No description provided.'}
                </p>
                
                <div className="flex items-center gap-4 text-sm text-gray-500 pt-4 border-t border-gray-100">
                    {recipe.cookingTime && (
                        <div className="flex items-center gap-1.5">
                            <Clock className="w-4 h-4 text-amber-600" />
                            <span>{recipe.cookingTime}</span>
                        </div>
                    )}
                    {recipe.servings && (
                        <div className="flex items-center gap-1.5">
                            <Users className="w-4 h-4 text-amber-600" />
                            <span>{recipe.servings} serves</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );

    const HeirloomCard = ({ heirloom }) => (
        <div 
            onClick={() => navigate(`/heirloom/${heirloom.id}`)}
            className="group cursor-pointer bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-amber-900/5 hover:-translate-y-1"
        >
            <div className="aspect-[4/3] relative overflow-hidden bg-amber-50">
                {heirloom.mediaFiles && heirloom.mediaFiles.length > 0 ? (
                    <img 
                        src={heirloom.mediaFiles[0].mediaUrl} 
                        alt={heirloom.name} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center bg-amber-100/50">
                        <Gem className="w-12 h-12 text-amber-300" />
                    </div>
                )}
                {heirloom.estimatedYear && (
                    <div className="absolute top-4 left-4">
                        <span className="px-3 py-1 bg-white/90 backdrop-blur-md text-amber-900 text-xs font-medium rounded-full shadow-sm">
                            c. {heirloom.estimatedYear}
                        </span>
                    </div>
                )}
            </div>
            
            <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-2 line-clamp-1">{heirloom.name}</h3>
                
                <div className="flex items-center gap-2 mb-4 text-sm">
                    <div className="flex items-center gap-1.5 px-2.5 py-1 bg-gray-50 rounded-lg text-gray-600">
                        <span className="text-xs text-gray-400">Current:</span>
                        <span className="font-medium truncate max-w-[100px]">{heirloom.currentOwner || 'Unknown'}</span>
                    </div>
                    {heirloom.nextOwner && (
                        <>
                            <ArrowRight className="w-3 h-3 text-gray-400 flex-shrink-0" />
                            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 rounded-lg text-amber-700">
                                <span className="text-xs text-amber-600/70">Next:</span>
                                <span className="font-medium truncate max-w-[100px]">{heirloom.nextOwner}</span>
                            </div>
                        </>
                    )}
                </div>

                <p className="text-gray-500 text-sm line-clamp-2">
                    {heirloom.description || 'No description provided.'}
                </p>
            </div>
        </div>
    );

    return (
        <div className="max-w-7xl mx-auto pb-24">
            {/* Header */}
            <div className="mb-8 md:mb-12">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div>
                        <h1 className="text-3xl md:text-5xl font-bold text-gray-900 tracking-tight mb-4 brand-title">
                            Heritage Vault
                        </h1>
                        <p className="text-lg text-gray-600 max-w-2xl font-light">
                            Preserve the tastes, traditions, and physical artifacts that make your family unique.
                        </p>
                    </div>
                    <button
                        onClick={() => navigate(`/${activeTab === 'recipes' ? 'recipe' : 'heirloom'}/create`)}
                        className="flex items-center gap-2 px-6 py-3 bg-amber-600 hover:bg-amber-700 text-white rounded-2xl font-medium transition-all shadow-md shadow-amber-600/20"
                    >
                        <Plus className="w-5 h-5" />
                        Add {activeTab === 'recipes' ? 'Recipe' : 'Heirloom'}
                    </button>
                </div>
            </div>

            {/* Custom Tabs */}
            <div className="flex p-1.5 mb-8 bg-amber-900/5 rounded-2xl w-full md:w-fit backdrop-blur-sm">
                <button
                    onClick={() => setActiveTab('recipes')}
                    className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-8 py-3 rounded-xl text-sm font-medium transition-all duration-300 ${
                        activeTab === 'recipes'
                            ? 'bg-white text-amber-900 shadow-sm'
                            : 'text-amber-900/60 hover:text-amber-900 hover:bg-white/50'
                    }`}
                >
                    <Book className="w-4 h-4" />
                    Family Recipes
                </button>
                <button
                    onClick={() => setActiveTab('heirlooms')}
                    className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-8 py-3 rounded-xl text-sm font-medium transition-all duration-300 ${
                        activeTab === 'heirlooms'
                            ? 'bg-white text-amber-900 shadow-sm'
                            : 'text-amber-900/60 hover:text-amber-900 hover:bg-white/50'
                    }`}
                >
                    <Gem className="w-4 h-4" />
                    Heirlooms
                </button>
            </div>

            {/* Content Area */}
            {loading ? (
                <div className="flex justify-center items-center py-24">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600"></div>
                </div>
            ) : (
                <div>
                    {activeTab === 'recipes' && (
                        recipes.length === 0 ? <EmptyState type="recipes" /> : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {recipes.map(recipe => <RecipeCard key={recipe.id} recipe={recipe} />)}
                            </div>
                        )
                    )}
                    
                    {activeTab === 'heirlooms' && (
                        heirlooms.length === 0 ? <EmptyState type="heirlooms" /> : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {heirlooms.map(heirloom => <HeirloomCard key={heirloom.id} heirloom={heirloom} />)}
                            </div>
                        )
                    )}
                </div>
            )}
        </div>
    );
}
