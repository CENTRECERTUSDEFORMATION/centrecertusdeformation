import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function PrivateRoute({ children, adminOnly = false }) {
  const { user, isAdmin, isApproved, loading } = useAuth();
  const location = useLocation();

  if (loading) return <div>Chargement...</div>;

  if (!user)
    return <Navigate to="/connexion" replace state={{ from: location }} />;

  if (!isApproved)
    return <Navigate to="/" replace />;

  if (adminOnly && !isAdmin)
    return <Navigate to="/espace-participant" replace />;

  return children;
}