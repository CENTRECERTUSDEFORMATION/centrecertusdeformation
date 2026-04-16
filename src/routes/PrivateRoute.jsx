import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function PrivateRoute({ children, adminOnly = false }) {
  const { user, role, loading } = useAuth();

  if (loading) return <div>Chargement...</div>;

  if (!user) return <Navigate to="/connexion" />;

  if (adminOnly && role !== "admin") {
    return <Navigate to="/espace-participant" />;
  }

  return children;
}