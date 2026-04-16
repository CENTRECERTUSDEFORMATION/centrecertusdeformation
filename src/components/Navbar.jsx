import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();

  const isAdmin = user?.is_admin;
  const isApproved = user?.is_approved;

  return (
    <div className="flex gap-4 p-4 bg-white shadow">
      <Link to="/">Accueil</Link>
      <Link to="/a-propos">À propos</Link>
      <Link to="/formations">Formations</Link>
      <Link to="/contact">Contact</Link>
      <Link to="/actualite">Actualité</Link>

      {!user && <Link to="/connexion">Connexion</Link>}

      {user && isApproved && !isAdmin && (
        <Link to="/espace-participant">Espace</Link>
      )}

      {user && isApproved && isAdmin && (
        <>
          <Link to="/admin">Admin</Link>
          <Link to="/ajouter-formation">+ Formation</Link>
          <Link to="/ajouter-actualite">+ Actualité</Link>
        </>
      )}

      {user && (
        <button onClick={logout} className="text-red-600">
          Déconnexion
        </button>
      )}
    </div>
  );
}