import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function PrivateRoute({ children, adminOnly = false }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <div className="flex justify-center items-center h-40">Chargement...</div>;

  if (!user) return <Navigate to="/connexion" replace state={{ from: location }} />;

  if (!user.isApproved) return <Navigate to="/" replace />;

  if (adminOnly && !user.isAdmin) return <Navigate to="/espace-participant" replace />;

  return children;
}
