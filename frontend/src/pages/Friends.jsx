import React, { useState, useEffect } from 'react';
import { friendService } from '../api/friendService';
import { useToast } from '../contexts/ToastContext';
import { Users, UserPlus, Check, X, User } from 'lucide-react';

export default function Friends() {
    const [friends, setFriends] = useState([]);
    const [invitations, setInvitations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [email, setEmail] = useState('');
    const toast = useToast();

    const fetchData = async () => {
        try {
            const [friendsData, invitationsData] = await Promise.all([
                friendService.getFriends(),
                friendService.getPendingInvitations()
            ]);
            setFriends(friendsData);
            setInvitations(invitationsData);
        } catch (error) {
            console.error('Failed to fetch friends data', error);
            toast.error('Could not load friends. Please refresh.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleInvite = async (e) => {
        e.preventDefault();
        try {
            await friendService.sendInvitation(email);
            toast.success('Invitation sent successfully!');
            setEmail('');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to send invitation');
        }
    };

    const handleAccept = async (id) => {
        try {
            await friendService.acceptInvitation(id);
            toast.success('Friend request accepted!');
            fetchData();
        } catch (error) {
            console.error('Failed to accept', error);
            toast.error('Failed to accept invitation. Please try again.');
        }
    };

    const handleDecline = async (id) => {
        try {
            await friendService.declineInvitation(id);
            toast.info('Invitation declined.');
            fetchData();
        } catch (error) {
            console.error('Failed to decline', error);
            toast.error('Failed to decline invitation. Please try again.');
        }
    };

    const handleRemove = async (id) => {
        if (!window.confirm('Are you sure you want to remove this friend?')) return;
        try {
            await friendService.removeFriend(id);
            toast.success('Friend removed.');
            fetchData();
        } catch (error) {
            console.error('Failed to remove', error);
            toast.error('Failed to remove friend. Please try again.');
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-700"></div>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto py-8">
            <h1 className="text-3xl font-bold mb-8" style={{ color: 'var(--brand-brown-800)' }}>Friends &amp; Connections</h1>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Friends List */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                            <h2 className="text-xl font-bold text-gray-900 flex items-center">
                                <Users className="w-5 h-5 mr-2 text-amber-600" />
                                My Friends ({friends.length})
                            </h2>
                        </div>

                        <div className="p-6">
                            {friends.length === 0 ? (
                                <div className="text-center py-8 text-gray-500">
                                    <p>You haven't added any friends yet.</p>
                                    <p className="text-sm mt-1">Invite family members to start sharing stories!</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {friends.map(friend => (
                                        <div key={friend.id} className="flex items-center justify-between p-4 border border-gray-100 rounded-xl hover:shadow-sm transition-shadow bg-gray-50">
                                            <div className="flex items-center space-x-3">
                                                <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center overflow-hidden flex-shrink-0">
                                                    {friend.photoUrl ? (
                                                        <img src={friend.photoUrl} alt={friend.displayName} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <User className="w-5 h-5 text-amber-700" />
                                                    )}
                                                </div>
                                                <div>
                                                    <h3 className="font-semibold text-gray-900">{friend.displayName || 'No Name'}</h3>
                                                    <p className="text-xs text-gray-500">{friend.email}</p>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => handleRemove(friend.userId)}
                                                className="text-gray-400 hover:text-red-500 p-2 transition-colors"
                                                title="Remove friend"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Column: Invites & Requests */}
                <div className="space-y-6">
                    {/* Add Friend Form */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                        <h2 className="text-lg font-bold text-gray-900 flex items-center mb-4">
                            <UserPlus className="w-5 h-5 mr-2 text-amber-600" />
                            Invite Friend
                        </h2>

                        <form onSubmit={handleInvite} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="friend@example.com"
                                    className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-amber-500 focus:border-amber-500"
                                />
                            </div>
                            <button
                                type="submit"
                                className="w-full bg-amber-600 text-white font-medium py-2.5 rounded-lg hover:bg-amber-700 transition-colors shadow-sm"
                            >
                                Send Invitation
                            </button>
                        </form>
                    </div>

                    {/* Pending Invitations */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                        <h2 className="text-lg font-bold text-gray-900 mb-4">
                            Pending Requests ({invitations.length})
                        </h2>

                        {invitations.length === 0 ? (
                            <p className="text-gray-500 text-sm text-center py-4">No pending invitations.</p>
                        ) : (
                            <div className="space-y-4">
                                {invitations.map(inv => (
                                    <div key={inv.id} className="p-4 border border-amber-100 bg-amber-50/50 rounded-xl">
                                        <div className="flex items-center space-x-3 mb-3">
                                            <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center overflow-hidden border border-amber-100">
                                                {inv.photoUrl ? (
                                                    <img src={inv.photoUrl} alt={inv.displayName} className="w-full h-full object-cover" />
                                                ) : (
                                                    <User className="w-5 h-5 text-amber-500" />
                                                )}
                                            </div>
                                            <div>
                                                <h3 className="font-semibold text-gray-900 text-sm">{inv.displayName || 'User'}</h3>
                                                <p className="text-xs text-gray-500">{inv.email}</p>
                                            </div>
                                        </div>
                                        <div className="flex space-x-2">
                                            <button
                                                onClick={() => handleAccept(inv.id)}
                                                className="flex-1 bg-amber-600 text-white text-xs font-medium py-1.5 rounded-md hover:bg-amber-700 transition-colors flex justify-center items-center"
                                            >
                                                <Check className="w-3 h-3 mr-1" /> Accept
                                            </button>
                                            <button
                                                onClick={() => handleDecline(inv.id)}
                                                className="flex-1 bg-gray-200 text-gray-700 text-xs font-medium py-1.5 rounded-md hover:bg-gray-300 transition-colors flex justify-center items-center"
                                            >
                                                <X className="w-3 h-3 mr-1" /> Decline
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
