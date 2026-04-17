import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { user, isAdmin, isApproved, logout, loading } = useAuth();

  if (loading) return <div className="p-4">Chargement...</div>;

  return (
    <div className="flex gap-4 p-4 bg-white shadow">

      <Link to="/">Accueil</Link>
      <Link to="/a-propos">À propos</Link>
      <Link to="/formations">Formations</Link>
      <Link to="/contact">Contact</Link>
      <Link to="/actualite">Actualité</Link>

      {/* 🔓 NON CONNECTÉ */}
      {!user && <Link to="/connexion">Connexion</Link>}

      {/* 👤 USER */}
      {user && isApproved && !isAdmin && (
        <Link to="/espace-participant">Espace</Link>
      )}

      {/* 👨‍💼 ADMIN */}
      {user && isAdmin && isApproved && (
        <>
          <Link to="/admin">Admin</Link>
          <Link to="/ajouter-formation">+ Formation</Link>
          <Link to="/ajouter-actualite">+ Actualité</Link>
        </>
      )}

      {/* 🚪 LOGOUT */}
      {user && (
        <button onClick={logout} className="text-red-500">
          Déconnexion
        </button>
      )}
    </div>
  );
}