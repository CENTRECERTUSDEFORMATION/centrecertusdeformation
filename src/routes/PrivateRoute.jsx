import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function PrivateRoute({ children, adminOnly = false }) {
  const { user, loading } = useAuth();

  if (loading) return <div>Chargement...</div>;

  if (!user) return <Navigate to="/connexion" />;

  const isAdmin = user?.is_admin;

  if (adminOnly && !isAdmin) {
    return <Navigate to="/espace-participant" />;
  }

  return children;
}