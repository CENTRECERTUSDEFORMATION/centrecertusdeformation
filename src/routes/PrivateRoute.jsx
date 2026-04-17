import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function PrivateRoute({ children, adminOnly = false }) {
  const { user, isAdmin, isApproved, loading } = useAuth();
  const location = useLocation();

  // ⏳ loading
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

  // 👮 ADMIN ROUTE PROTECTION (PRIORITY)
  if (adminOnly) {
    if (!isAdmin) {
      return <Navigate to="/espace-participant" replace />;
    }
    return children;
  }

  // 👤 USER APPROVAL CHECK (ONLY FOR NON ADMIN ROUTES)
  if (!isAdmin && !isApproved) {
    return <Navigate to="/espace-participant" replace />;
  }

  return children;
}