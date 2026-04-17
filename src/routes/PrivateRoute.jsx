import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function PrivateRoute({ children, adminOnly = false }) {
  const { user, isAdmin, isApproved, loading } = useAuth();
  const location = useLocation();

  // ⏳ loading state
  if (loading) {
    return (
      <div className="flex justify-center items-center h-40">
        Chargement...
      </div>
    );
  }

  // ❌ not logged in
  if (!user) {
    return <Navigate to="/connexion" replace state={{ from: location }} />;
  }

  // 👮 ADMIN ROUTE PROTECTION
  if (adminOnly) {
    if (!isAdmin) {
      return <Navigate to="/espace-participant" replace />;
    }
    return children;
  }

  // 👤 USER ROUTE PROTECTION
  if (!isApproved && !isAdmin) {
    return <Navigate to="/" replace />;
  }

  return children;
}