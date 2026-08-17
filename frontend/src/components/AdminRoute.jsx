import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function AdminRoute({ children }) {
    const { currentUser, userRole } = useAuth();

    if (!currentUser) {
        return <Navigate to="/login" replace />;
    }

    if (userRole !== 'ADMIN') {
        return <Navigate to="/dashboard" replace />;
    }

    return children;
}
