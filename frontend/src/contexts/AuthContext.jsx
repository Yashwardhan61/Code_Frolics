import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth } from '../config/firebase';
import { onAuthStateChanged, signOut as firebaseSignOut } from 'firebase/auth';
import { profileService } from '../api/profileService';

const AuthContext = createContext();

export function useAuth() {
    return useContext(AuthContext);
}

export function AuthProvider({ children }) {
    const [currentUser, setCurrentUser] = useState(null);
    const [userRole, setUserRole] = useState(() => localStorage.getItem('legacy_trunk_user_role') || 'MEMBER');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            setCurrentUser(user);
            setLoading(false);

            if (user) {
                try {
                    const profile = await profileService.getProfile();
                    if (profile?.role) {
                        setUserRole(profile.role);
                        localStorage.setItem('legacy_trunk_user_role', profile.role);
                    }
                } catch (err) {
                    console.error("Failed to fetch user profile for role", err);
                }
            } else {
                setUserRole('MEMBER');
                localStorage.removeItem('legacy_trunk_user_role');
            }
        });

        return unsubscribe;
    }, []);

    const logout = () => {
        return firebaseSignOut(auth);
    };

    const value = {
        currentUser,
        userRole,
        logout
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
}
