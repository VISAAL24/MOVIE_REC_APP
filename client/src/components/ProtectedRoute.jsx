import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="loading-spinner-container"><div className="loading-spinner"></div></div>;
  }

  return user ? (children || <Outlet />) : <Navigate to="/login" replace />;
};

export const AdminRoute = ({ children }) => {
    const { user, isAdmin, loading } = useAuth();

    if (loading) {
        return <div className="loading-spinner-container"><div className="loading-spinner"></div></div>;
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    return isAdmin() ? (children || <Outlet />) : <Navigate to="/unauthorized" replace />;
};


export default ProtectedRoute;
