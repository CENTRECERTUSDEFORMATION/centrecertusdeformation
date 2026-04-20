import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function PrivateRoute({ children, adminOnly = false }) {
  const { user, isAdmin, isApproved, loading } = useAuth();
  const location = useLocation();

  // ⏳ Chargement
  if (loading) {
    return (
      <div className="flex justify-center items-center h-40">
        Chargement...
      </div>
    );
  }

  // ❌ Non connecté
  if (!user) {
    return <Navigate to="/connexion" replace state={{ from: location }} />;
  }

  // 👮 Accès ADMIN uniquement
  if (adminOnly && !isAdmin) {
    return <Navigate to="/espace-participant" replace />;
  }

  // 👤 Utilisateur non approuvé (hors admin)
  if (!adminOnly && !isAdmin && !isApproved) {
    return <Navigate to="/espace-participant" replace />;
  }

  // ✅ Accès autorisé
  return children;
}