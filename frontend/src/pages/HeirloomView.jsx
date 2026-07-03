import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { heirloomService } from '../api/heirloomService';
import { Gem, ArrowLeft, Trash2, Clock, MapPin, ArrowRight } from 'lucide-react';
import { useToast } from '../contexts/ToastContext';

export default function HeirloomView() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { currentUser, userRole } = useAuth();
    const toast = useToast();
    
    const [heirloom, setHeirloom] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeImage, setActiveImage] = useState(0);

    useEffect(() => {
        const fetchHeirloom = async () => {
            try {
                const data = await heirloomService.getHeirloomById(id);
                setHeirloom(data);
            } catch (error) {
                console.error("Failed to fetch heirloom:", error);
                toast.error("Heirloom not found or you don't have access.");
                navigate('/heritage');
            } finally {
                setLoading(false);
            }
        };
        fetchHeirloom();
    }, [id, navigate]);

    const handleDelete = async () => {
        if (window.confirm("Are you sure you want to delete this heirloom? This cannot be undone.")) {
            try {
                await heirloomService.deleteHeirloom(id);
                toast.success("Heirloom deleted successfully");
                navigate('/heritage');
            } catch (error) {
                console.error("Failed to delete heirloom", error);
                toast.error("Failed to delete heirloom");
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

    if (!heirloom) return null;

    const isOwner = heirloom.userId === currentUser?.id;
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
                        {heirloom.mediaFiles && heirloom.mediaFiles.length > 0 ? (
                            <div className="space-y-3">
                                <div className="aspect-[4/5] rounded-2xl overflow-hidden bg-gray-100">
                                    <img 
                                        src={heirloom.mediaFiles[activeImage].mediaUrl} 
                                        alt="Heirloom media" 
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                {heirloom.mediaFiles.length > 1 && (
                                    <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar">
                                        {heirloom.mediaFiles.map((media, idx) => (
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
                                    <Gem className="w-16 h-16 mx-auto mb-2" />
                                    <p>No photos</p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Meta Card (Era & Tags) */}
                    <div className="bg-white rounded-3xl p-6 shadow-sm border border-amber-900/10">
                        {heirloom.estimatedYear && (
                            <div className="flex items-center gap-3 p-4 bg-amber-50 rounded-2xl mb-6">
                                <div className="p-2 bg-amber-100 rounded-xl text-amber-700">
                                    <Clock className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-xs text-amber-800/60 font-medium uppercase tracking-wider">Era / Year</p>
                                    <p className="font-semibold text-amber-900">c. {heirloom.estimatedYear}</p>
                                </div>
                            </div>
                        )}

                        {heirloom.tags && heirloom.tags.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                                {heirloom.tags.map((tag, idx) => (
                                    <span key={idx} className="px-3 py-1 bg-gray-100 text-gray-600 text-sm font-medium rounded-full">
                                        #{tag}
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Column: Content */}
                <div className="lg:col-span-7 space-y-8">
                    {/* Main Header */}
                    <div className="bg-white rounded-3xl p-8 md:p-10 shadow-sm border border-amber-900/10 relative overflow-hidden">
                        {/* Decorative background element */}
                        <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none">
                            <Gem className="w-64 h-64 transform rotate-12 translate-x-1/4 -translate-y-1/4" />
                        </div>
                        
                        <div className="relative z-10">
                            {heirloom.familyMemberName && (
                                <span className="inline-block px-4 py-1.5 bg-amber-100 text-amber-800 text-sm font-medium rounded-full mb-4">
                                    Originally belonged to {heirloom.familyMemberName}
                                </span>
                            )}
                            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 brand-title tracking-tight leading-tight">
                                {heirloom.name}
                            </h1>
                            
                            {/* Provenance Banner */}
                            {(heirloom.currentOwner || heirloom.nextOwner) && (
                                <div className="mt-8 p-6 bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl border border-amber-100/50">
                                    <h3 className="text-sm font-bold text-amber-800 uppercase tracking-widest mb-4">Provenance</h3>
                                    <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                                        {heirloom.currentOwner && (
                                            <div className="flex-1 bg-white/60 p-4 rounded-xl">
                                                <p className="text-xs text-amber-600 font-medium mb-1">Current Custodian</p>
                                                <p className="text-gray-900 font-semibold">{heirloom.currentOwner}</p>
                                            </div>
                                        )}
                                        
                                        {heirloom.currentOwner && heirloom.nextOwner && (
                                            <div className="hidden sm:flex justify-center text-amber-300">
                                                <ArrowRight className="w-6 h-6" />
                                            </div>
                                        )}
                                        
                                        {heirloom.nextOwner && (
                                            <div className="flex-1 bg-white p-4 rounded-xl shadow-sm border border-amber-100">
                                                <p className="text-xs text-amber-600 font-medium mb-1">Intended Heir</p>
                                                <p className="text-gray-900 font-semibold">{heirloom.nextOwner}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* History & Story */}
                    {heirloom.description && (
                        <div className="bg-white rounded-3xl p-8 md:p-10 shadow-sm border border-amber-900/10">
                            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                                <span className="w-8 h-8 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center text-sm">
                                    <MapPin className="w-4 h-4" />
                                </span>
                                History & Significance
                            </h2>
                            <p className="text-gray-700 leading-relaxed text-lg whitespace-pre-wrap">
                                {heirloom.description}
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
