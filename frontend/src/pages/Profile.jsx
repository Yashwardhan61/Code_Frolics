import React, { useState, useEffect } from 'react';
import { profileService } from '../api/profileService';
import { useToast } from '../contexts/ToastContext';
import { User, Image as ImageIcon, CheckCircle, Edit2, Save, X } from 'lucide-react';

export default function Profile() {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(false);
    const [formData, setFormData] = useState({ displayName: '', username: '', description: '' });
    const [saving, setSaving] = useState(false);
    const [photoFile, setPhotoFile] = useState(null);
    const toast = useToast();

    const fetchProfile = async () => {
        try {
            setLoading(true);
            const data = await profileService.getProfile();
            setProfile(data);
            setFormData({
                displayName: data.displayName || '',
                username: data.username || '',
                description: data.description || ''
            });
        } catch (err) {
            console.error('Failed to fetch profile', err);
            toast.error('Failed to load profile. Please refresh.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProfile();
    }, []);

    const handleSave = async () => {
        try {
            setSaving(true);
            await profileService.updateProfile(formData);

            if (photoFile) {
                await profileService.uploadPhoto(photoFile);
            }

            await fetchProfile();
            setEditing(false);
            setPhotoFile(null);
            toast.success('Profile updated successfully.');
        } catch (err) {
            console.error('Failed to update profile', err);
            toast.error('Failed to update profile: ' + (err.response?.data?.message || err.message));
        } finally {
            setSaving(false);
        }
    };

    const handlePhotoChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setPhotoFile(e.target.files[0]);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-700"></div>
            </div>
        );
    }

    if (!profile) return (
        <div className="max-w-4xl mx-auto py-8 text-center">
            <p className="text-gray-500">Failed to load profile.</p>
        </div>
    );

    const previewUrl = photoFile ? URL.createObjectURL(photoFile) : profile.photoUrl;

    return (
        <div className="max-w-4xl mx-auto py-8">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="h-32 bg-gradient-to-r from-amber-600 to-amber-800"></div>

                <div className="px-8 pb-8">
                    <div className="relative flex justify-between items-end -mt-16 mb-6">
                        <div className="relative">
                            <div className="w-32 h-32 rounded-full border-4 border-white bg-gray-100 overflow-hidden flex items-center justify-center">
                                {previewUrl ? (
                                    <img src={previewUrl} alt={profile.displayName} className="w-full h-full object-cover" />
                                ) : (
                                    <User className="w-16 h-16 text-gray-400" />
                                )}
                            </div>

                            {editing && (
                                <label className="absolute bottom-0 right-0 bg-amber-600 text-white p-2 rounded-full cursor-pointer hover:bg-amber-700 shadow-md">
                                    <ImageIcon className="w-4 h-4" />
                                    <input type="file" className="hidden" accept="image/*" onChange={handlePhotoChange} />
                                </label>
                            )}
                        </div>

                        <div>
                            {!editing ? (
                                <button onClick={() => setEditing(true)} className="flex items-center text-gray-600 bg-gray-100 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors font-medium">
                                    <Edit2 className="w-4 h-4 mr-2" />
                                    Edit Profile
                                </button>
                            ) : (
                                <div className="flex space-x-2">
                                    <button onClick={() => { setEditing(false); setPhotoFile(null); }} className="flex items-center text-gray-600 bg-gray-100 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors font-medium">
                                        <X className="w-4 h-4 mr-2" />
                                        Cancel
                                    </button>
                                    <button onClick={handleSave} disabled={saving} className="flex items-center text-white bg-amber-600 px-4 py-2 rounded-lg hover:bg-amber-700 transition-colors font-medium disabled:opacity-50">
                                        <Save className="w-4 h-4 mr-2" />
                                        {saving ? 'Saving...' : 'Save'}
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="md:col-span-2 space-y-6">
                            <div>
                                {editing ? (
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Display Name</label>
                                            <input
                                                type="text"
                                                value={formData.displayName}
                                                onChange={e => setFormData({ ...formData, displayName: e.target.value })}
                                                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-amber-500 focus:border-amber-500"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Username {!profile.hasChangedUsername && <span className="text-xs text-amber-600">(Can be changed)</span>}
                                            </label>
                                            <input
                                                type="text"
                                                value={formData.username}
                                                onChange={e => setFormData({ ...formData, username: e.target.value })}
                                                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-amber-500 focus:border-amber-500"
                                                disabled={profile.hasChangedUsername && profile.username}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">About Me</label>
                                            <textarea
                                                value={formData.description}
                                                onChange={e => setFormData({ ...formData, description: e.target.value })}
                                                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-amber-500 focus:border-amber-500 min-h-[100px]"
                                            />
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        <h1 className="text-2xl font-bold text-gray-900">{profile.displayName || 'No Name'}</h1>
                                        <p className="text-gray-500 text-sm mb-4">@{profile.username || 'username'}</p>
                                        <div className="prose text-gray-700 max-w-none">
                                            <p>{profile.description || 'No description provided.'}</p>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>

                        <div className="bg-gray-50 p-6 rounded-xl border border-gray-100 h-fit">
                            <h3 className="font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">Account Status</h3>

                            <div className="space-y-3 text-sm">
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-500">Email</span>
                                    <span className="font-medium text-gray-900 truncate max-w-[150px]" title={profile.email}>{profile.email}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-500">Joined</span>
                                    <span className="font-medium text-gray-900">{new Date(profile.createdAt).toLocaleDateString()}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-500">Profile Setup</span>
                                    {profile.profileSetupComplete ? (
                                        <span className="flex items-center text-green-600 font-medium"><CheckCircle className="w-4 h-4 mr-1" /> Complete</span>
                                    ) : (
                                        <span className="text-amber-600 font-medium">Pending</span>
                                    )}
                                </div>
                            </div>

                            <h3 className="font-semibold text-gray-900 mt-6 mb-4 pb-2 border-b border-gray-200">Stats</h3>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-white p-3 rounded-lg border border-gray-200 text-center">
                                    <div className="text-2xl font-bold text-amber-700">{profile.storyCount}</div>
                                    <div className="text-xs text-gray-500 uppercase font-semibold">Stories</div>
                                </div>
                                <div className="bg-white p-3 rounded-lg border border-gray-200 text-center">
                                    <div className="text-2xl font-bold text-amber-700">{profile.friendCount}</div>
                                    <div className="text-xs text-gray-500 uppercase font-semibold">Friends</div>
                                </div>
                                <div className="bg-white p-3 rounded-lg border border-gray-200 text-center col-span-2">
                                    <div className="text-2xl font-bold text-amber-700">{profile.familyMemberCount}</div>
                                    <div className="text-xs text-gray-500 uppercase font-semibold">Family Members</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
