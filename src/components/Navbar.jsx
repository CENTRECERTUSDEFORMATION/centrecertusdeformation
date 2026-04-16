import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { user, role, logout } = useAuth();

  return (
    <div className="flex gap-4 p-4 bg-white shadow">
      <Link to="/">Accueil</Link>
      <Link to="/a-propos">À propos</Link>
      <Link to="/formations">Formations</Link>
      <Link to="/contact">Contact</Link>
      <Link to="/actualite">Actualité</Link>

      {!user && <Link to="/connexion">Connexion</Link>}

      {user && role === "user" && (
        <Link to="/espace-participant">Espace</Link>
      )}

      {role === "admin" && (
        <>
          <Link to="/admin">Admin</Link>
          <Link to="/ajouter-formation">+ Formation</Link>
          <Link to="/ajouter-actualite">+ Actualité</Link>
        </>
      )}

      {user && (
        <button onClick={logout}>Déconnexion</button>
      )}
    </div>
  );
}