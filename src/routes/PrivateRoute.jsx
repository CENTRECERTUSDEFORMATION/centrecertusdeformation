import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function PrivateRoute({ children, adminOnly = false }) {
  const { user, isAdmin, isApproved, loading } = useAuth();
  const location = useLocation();

  if (loading) return <p className="text-center mt-10">Chargement...</p>;

  if (!user) {
    return <Navigate to="/connexion" replace state={{ from: location }} />;
  }

  if (adminOnly && !isAdmin) {
    return <Navigate to="/espace-participant" replace />;
  }

  if (!adminOnly && !isAdmin && !isApproved) {
    return <Navigate to="/espace-participant" replace />;
  }

  return children;
}