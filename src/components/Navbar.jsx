import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  const { user, isAdmin, isApproved, logout, loading } = useAuth();

  const toggleMenu = () => setMenuOpen(!menuOpen);

  const handleLogout = async () => {
    await logout();
    setMenuOpen(false);
  };

  // ⚠️ NE PAS BLOQUER LE NAVBAR
  // On affiche même si loading
  // (sinon écran vide comme ton bug)

  return (
    <header style={{
      background: "#fff",
      borderBottom: "1px solid #ddd",
      padding: "10px 20px"
    }}>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>

        {/* LOGO / TITLE */}
        <Link to="/" style={{ fontWeight: "bold" }}>
          CERTUS
        </Link>

        {/* MENU BUTTON MOBILE */}
        <button onClick={toggleMenu}>
          {menuOpen ? "X" : "☰"}
        </button>

      </div>

      {/* MENU */}
      <div style={{
        display: menuOpen ? "block" : "none",
        marginTop: 10
      }}>

        <Link onClick={toggleMenu} to="/">Accueil</Link><br />
        <Link onClick={toggleMenu} to="/formations">Formations</Link><br />
        <Link onClick={toggleMenu} to="/actualite">Actualités</Link><br />
        <Link onClick={toggleMenu} to="/contact">Contact</Link><br />

        {/* USER */}
        {user && isApproved && !isAdmin && (
          <>
            <Link onClick={toggleMenu} to="/espace-participant">
              Espace participant
            </Link><br />
          </>
        )}

        {/* ADMIN */}
        {user && isAdmin && (
          <>
            <hr />
            <strong>ADMIN</strong><br />

            <Link onClick={toggleMenu} to="/admin">
              Dashboard
            </Link><br />

            <Link onClick={toggleMenu} to="/admin/users">
              Utilisateurs
            </Link><br />

            <Link onClick={toggleMenu} to="/ajouter-formation">
              + Formation
            </Link><br />

            <Link onClick={toggleMenu} to="/ajouter-actualite">
              + Actualité
            </Link><br />
          </>
        )}

        {/* AUTH */}
        <hr />

        {!user ? (
          <Link onClick={toggleMenu} to="/connexion">
            Connexion
          </Link>
        ) : (
          <button onClick={handleLogout}>
            Déconnexion ({user.email})
          </button>
        )}

      </div>

      {/* DEBUG VISUEL (IMPORTANT POUR TEST) */}
      <div style={{ marginTop: 10, fontSize: 12, color: "#666" }}>
        loading: {loading ? "true" : "false"} | user: {user ? "YES" : "NO"} | admin: {isAdmin ? "YES" : "NO"}
      </div>

    </header>
  );
}