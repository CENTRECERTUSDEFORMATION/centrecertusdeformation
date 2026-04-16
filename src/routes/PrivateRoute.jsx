import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function PrivateRoute({ children, adminOnly = false }) {
  const { user, isAdmin, isApproved, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex justify-center items-center h-40">
        Chargement...
      </div>
    );
  }

  // ❌ pas connecté
  if (!user) {
    return <Navigate to="/connexion" replace state={{ from: location }} />;
  }

  // ❌ compte non approuvé
  if (!isApproved) {
    return (
      <div className="flex flex-col items-center justify-center h-40 text-center">
        <h2 className="text-xl font-bold text-red-600">
          Compte non approuvé
        </h2>
        <p>Votre compte est en attente de validation par l'administrateur.</p>
      </div>
    );
  }

  // ❌ accès admin only
  if (adminOnly && !isAdmin) {
    return <Navigate to="/espace-participant" replace />;
  }

  return children;
}