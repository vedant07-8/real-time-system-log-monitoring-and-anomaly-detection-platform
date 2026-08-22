import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const ProtectedRoute = ({ children, roles }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div className="flex items-center justify-center h-screen text-slate-400">Loading authentication...</div>;
  }

  if (!user) {
    // Redirect to login but save the attempted location
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (roles && !roles.includes(user.role)) {
    // User doesn't have required role
    return (
      <div className="flex flex-col items-center justify-center h-screen text-slate-300">
        <h2 className="text-2xl font-bold text-red-500 mb-2">Access Denied</h2>
        <p>You do not have permission to view this page.</p>
        <button 
          onClick={() => window.history.back()}
          className="mt-4 px-4 py-2 bg-slate-800 rounded hover:bg-slate-700"
        >
          Go Back
        </button>
      </div>
    );
  }

  return children;
};

export default ProtectedRoute;
