import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { profileService } from '../api/profileService';
import { familyService } from '../api/familyService';
import { storyService } from '../api/storyService';
import {
    User, Camera, Users, BookOpen, ChevronRight, CheckCircle2, SkipForward, ArrowRight, Loader2, Sparkles, Plus, Image as ImageIcon
} from 'lucide-react';

export default function Onboarding() {
    const { currentUser } = useAuth();
    const navigate = useNavigate();
    const toast = useToast();
    
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    
    // Step 1: Profile
    const [bio, setBio] = useState('');
    const [profilePhoto, setProfilePhoto] = useState(null);
    const [profilePreview, setProfilePreview] = useState(null);
    const fileInputRef = useRef(null);

    // Step 2: Family Member
    const [memberName, setMemberName] = useState('');
    const [relationship, setRelationship] = useState('');

    // Step 3: First Story
    const [storyTitle, setStoryTitle] = useState('');
    const [storyDate, setStoryDate] = useState('');
    const [storyDesc, setStoryDesc] = useState('');
    const [storyPhoto, setStoryPhoto] = useState(null);
    const [storyPreview, setStoryPreview] = useState(null);
    const storyFileRef = useRef(null);

    const handleProfilePhotoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setProfilePhoto(file);
            setProfilePreview(URL.createObjectURL(file));
        }
    };

    const handleStoryPhotoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setStoryPhoto(file);
            setStoryPreview(URL.createObjectURL(file));
        }
    };

    const handleSkip = () => {
        if (step < 3) {
            setStep(step + 1);
        } else {
            completeOnboarding();
        }
    };

    const completeOnboarding = () => {
        navigate('/dashboard');
        toast.success("Welcome to your family chronicle!");
    };

    const submitStep1 = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (bio) {
                await profileService.updateProfile({ bio });
            }
            if (profilePhoto) {
                await profileService.uploadPhoto(profilePhoto);
            }
            setStep(2);
        } catch (err) {
            console.error(err);
            toast.error("Failed to save profile. You can do it later.");
            setStep(2); // continue anyway
        } finally {
            setLoading(false);
        }
    };

    const submitStep2 = async (e) => {
        e.preventDefault();
        if (!memberName) {
            setStep(3);
            return;
        }
        setLoading(true);
        try {
            await familyService.addMember('paternal', {
                name: memberName,
                relationship: relationship || null,
                parentMemberId: null
            });
            setStep(3);
        } catch (err) {
            console.error(err);
            toast.error("Failed to add family member. Try again later.");
            setStep(3);
        } finally {
            setLoading(false);
        }
    };

    const submitStep3 = async (e) => {
        e.preventDefault();
        if (!storyTitle) {
            completeOnboarding();
            return;
        }
        setLoading(true);
        try {
            const req = {
                title: storyTitle,
                description: storyDesc,
                storyDate: storyDate || null,
                isPublic: false
            };
            const files = storyPhoto ? [storyPhoto] : [];
            await storyService.createStory(req, files);
            completeOnboarding();
        } catch (err) {
            console.error(err);
            toast.error("Failed to save story. You can add it from your dashboard.");
            completeOnboarding();
        } finally {
            setLoading(false);
        }
    };

    const renderStepIndicators = () => (
        <div className="flex justify-center items-center space-x-4 mb-8">
            {[1, 2, 3].map((num) => (
                <div key={num} className="flex items-center">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-500
                        ${step === num ? 'bg-amber-600 text-white shadow-lg scale-110' : 
                          step > num ? 'bg-amber-200 text-amber-800' : 'bg-gray-100 text-gray-400'}`}>
                        {step > num ? <CheckCircle2 className="w-5 h-5" /> : num}
                    </div>
                    {num < 3 && (
                        <div className={`w-12 h-1 ml-4 rounded-full transition-colors duration-500
                            ${step > num ? 'bg-amber-400' : 'bg-gray-100'}`} />
                    )}
                </div>
            ))}
        </div>
    );

    return (
        <div className="min-h-screen bg-amber-50 flex items-center justify-center p-4 relative overflow-hidden">
            {/* Background Decorations */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute -top-24 -left-24 w-96 h-96 bg-amber-200/40 rounded-full blur-3xl"></div>
                <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-orange-200/30 rounded-full blur-3xl"></div>
            </div>

            <div className="bg-white/90 backdrop-blur-xl shadow-2xl rounded-3xl p-8 md:p-12 max-w-2xl w-full relative z-10 border border-white">
                <div className="text-center mb-10">
                    <h1 className="text-4xl font-bold text-gray-900 font-serif mb-3">
                        {step === 1 && "Welcome to Yaado Ka Baksa"}
                        {step === 2 && "Plant Your Family Tree"}
                        {step === 3 && "Your First Chapter"}
                    </h1>
                    <p className="text-gray-500 text-lg">
                        {step === 1 && "Let's set up your profile to get started."}
                        {step === 2 && "Every legacy begins with a single seed."}
                        {step === 3 && "What's a cherished memory you'd like to preserve?"}
                    </p>
                </div>

                {renderStepIndicators()}

                <div className="min-h-[350px]">
                    {/* STEP 1: Profile */}
                    {step === 1 && (
                        <form onSubmit={submitStep1} className="animate-in fade-in slide-in-from-right-8 duration-500">
                            <div className="flex flex-col items-center mb-8">
                                <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                                    <div className="w-32 h-32 rounded-full border-4 border-amber-100 bg-amber-50 flex items-center justify-center overflow-hidden shadow-inner transition-transform group-hover:scale-105">
                                        {profilePreview ? (
                                            <img src={profilePreview} alt="Profile" className="w-full h-full object-cover" />
                                        ) : (
                                            <Camera className="w-12 h-12 text-amber-300" />
                                        )}
                                    </div>
                                    <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                        <span className="text-white text-sm font-medium">Upload Photo</span>
                                    </div>
                                    <input type="file" ref={fileInputRef} onChange={handleProfilePhotoChange} accept="image/*" className="hidden" />
                                </div>
                                <h3 className="mt-4 text-xl font-semibold text-gray-800">{currentUser?.displayName || 'Explorer'}</h3>
                            </div>

                            <div className="mb-8">
                                <label className="block text-sm font-medium text-gray-700 mb-2">A short bio about yourself (optional)</label>
                                <textarea
                                    value={bio}
                                    onChange={(e) => setBio(e.target.value)}
                                    rows="3"
                                    placeholder="I love preserving family recipes and old photos..."
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all resize-none bg-gray-50/50"
                                ></textarea>
                            </div>

                            <div className="flex items-center justify-between mt-10">
                                <button type="button" onClick={handleSkip} className="text-gray-500 hover:text-gray-700 font-medium px-4 py-2 transition-colors">
                                    Skip for now
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="bg-amber-600 hover:bg-amber-700 text-white px-8 py-3 rounded-full font-medium transition-all shadow-md hover:shadow-lg flex items-center disabled:opacity-70"
                                >
                                    {loading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : "Continue"}
                                    {!loading && <ArrowRight className="w-5 h-5 ml-2" />}
                                </button>
                            </div>
                        </form>
                    )}

                    {/* STEP 2: Family Member */}
                    {step === 2 && (
                        <form onSubmit={submitStep2} className="animate-in fade-in slide-in-from-right-8 duration-500">
                            <div className="bg-orange-50/50 rounded-2xl p-6 mb-8 border border-orange-100">
                                <div className="flex items-start mb-6">
                                    <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm mr-4 flex-shrink-0">
                                        <Users className="w-6 h-6 text-amber-600" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-gray-800 text-lg">Add a relative</h3>
                                        <p className="text-gray-600 text-sm mt-1">Start your family tree by adding a parent, grandparent, or child.</p>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                                        <input
                                            type="text"
                                            value={memberName}
                                            onChange={(e) => setMemberName(e.target.value)}
                                            placeholder="e.g. Ramesh Kumar"
                                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all bg-white"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Relationship to you</label>
                                        <select
                                            value={relationship}
                                            onChange={(e) => setRelationship(e.target.value)}
                                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all bg-white"
                                        >
                                            <option value="">Select relationship...</option>
                                            {['Father', 'Mother', 'Grandfather', 'Grandmother', 'Son', 'Daughter', 'Brother', 'Sister', 'Spouse', 'Other'].map(r => (
                                                <option key={r} value={r}>{r}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center justify-between mt-10">
                                <button type="button" onClick={handleSkip} className="text-gray-500 hover:text-gray-700 font-medium px-4 py-2 transition-colors">
                                    I'll do this later
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading || !memberName}
                                    className="bg-amber-600 hover:bg-amber-700 text-white px-8 py-3 rounded-full font-medium transition-all shadow-md hover:shadow-lg flex items-center disabled:opacity-70 disabled:cursor-not-allowed"
                                >
                                    {loading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : "Save & Continue"}
                                    {!loading && <ArrowRight className="w-5 h-5 ml-2" />}
                                </button>
                            </div>
                        </form>
                    )}

                    {/* STEP 3: First Story */}
                    {step === 3 && (
                        <form onSubmit={submitStep3} className="animate-in fade-in slide-in-from-right-8 duration-500">
                             <div className="space-y-5">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Memory Title</label>
                                    <input
                                        type="text"
                                        value={storyTitle}
                                        onChange={(e) => setStoryTitle(e.target.value)}
                                        placeholder="e.g. Summer at Grandma's House"
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                                        required
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Date of Memory</label>
                                        <input
                                            type="date"
                                            value={storyDate}
                                            onChange={(e) => setStoryDate(e.target.value)}
                                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all text-gray-600"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Add a Photo (Optional)</label>
                                        <div 
                                            className="w-full h-[50px] border border-dashed border-gray-300 rounded-xl flex items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors relative overflow-hidden"
                                            onClick={() => storyFileRef.current?.click()}
                                        >
                                            {storyPreview ? (
                                                <div className="absolute inset-0 flex items-center justify-between px-4 bg-amber-50">
                                                    <span className="text-sm font-medium text-amber-700 truncate mr-2">Photo selected</span>
                                                    <CheckCircle2 className="w-5 h-5 text-amber-600 flex-shrink-0" />
                                                </div>
                                            ) : (
                                                <div className="flex items-center text-gray-500 text-sm">
                                                    <ImageIcon className="w-4 h-4 mr-2" /> Upload Image
                                                </div>
                                            )}
                                        </div>
                                        <input type="file" ref={storyFileRef} onChange={handleStoryPhotoChange} accept="image/*" className="hidden" />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">The Story</label>
                                    <textarea
                                        value={storyDesc}
                                        onChange={(e) => setStoryDesc(e.target.value)}
                                        rows="4"
                                        placeholder="I remember the smell of fresh cookies..."
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all resize-none"
                                        required
                                    ></textarea>
                                </div>
                            </div>

                            <div className="flex items-center justify-between mt-10">
                                <button type="button" onClick={handleSkip} className="text-gray-500 hover:text-gray-700 font-medium px-4 py-2 transition-colors">
                                    Skip this step
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading || !storyTitle || !storyDesc}
                                    className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white px-8 py-3 rounded-full font-medium transition-all shadow-md hover:shadow-lg flex items-center disabled:opacity-70 disabled:cursor-not-allowed"
                                >
                                    {loading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <Sparkles className="w-5 h-5 mr-2" />}
                                    Finish & Go to Dashboard
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}
