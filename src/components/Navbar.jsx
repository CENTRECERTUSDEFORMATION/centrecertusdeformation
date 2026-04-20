import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { user, isAdmin, isApproved, logout, loading } = useAuth();

  return (
    <div style={{ padding: 15, background: "#eee" }}>

      <Link to="/">Accueil</Link> |{" "}
      <Link to="/formations">Formations</Link> |{" "}
      <Link to="/actualite">Actualités</Link>

      {/* USER */}
      {user && isApproved && !isAdmin && (
        <>
          {" | "}
          <Link to="/espace-participant">Espace</Link>
        </>
      )}

      {/* ADMIN */}
      {user && isAdmin && (
        <>
          {" | "}
          <Link to="/admin">Admin</Link>
          {" | "}
          <Link to="/admin/users">Users</Link>
        </>
      )}

      {/* AUTH */}
      {" | "}
      {!user ? (
        <Link to="/connexion">Connexion</Link>
      ) : (
        <button onClick={logout}>Logout</button>
      )}

      {/* DEBUG */}
      <div style={{ fontSize: 12 }}>
        loading: {loading ? "true" : "false"} | user: {user ? "YES" : "NO"} | admin: {isAdmin ? "YES" : "NO"}
      </div>

    </div>
  );
}