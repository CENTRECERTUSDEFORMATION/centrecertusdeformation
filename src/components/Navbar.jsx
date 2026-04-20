import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import logo from "../assets/logo-certus.png";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  const { user, isAdmin, isApproved, logout, loading } = useAuth();

  const toggleMenu = () => setMenuOpen(!menuOpen);

  const handleLogout = async () => {
    await logout();
    setMenuOpen(false);
  };

  // ⚠️ IMPORTANT : ne pas bloquer le menu
  // même si loading = true

  const showUserSpace = user && isApproved && !isAdmin;
  const showAdmin = user && isAdmin && isApproved;

  return (
    <header className="bg-white shadow-md fixed top-0 left-0 w-full z-50">

      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">

        {/* 🔵 LOGO */}
        <div className="flex items-center gap-3">
          <img
            src={logo}
            alt="Certus"
            className="h-10 w-auto object-contain"
          />

          <div className="hidden sm:block">
            <h1 className="text-lg font-bold text-blue-800">
              CENTRE CERTUS DE FORMATION
            </h1>
            <p className="text-xs text-gray-500">
              Structure privée - N° 52-193-17
            </p>
          </div>
        </div>

        {/* ☰ MOBILE BUTTON */}
        <button
          onClick={toggleMenu}
          className="md:hidden text-blue-700"
        >
          {menuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        {/* 🖥️ DESKTOP MENU */}
        <nav className="hidden md:flex gap-6 text-gray-700 items-center">

          <Link to="/">Accueil</Link>
          <Link to="/a-propos">À propos</Link>
          <Link to="/formations">Formations</Link>
          <Link to="/contact">Contact</Link>
          <Link to="/actualite">Actualité</Link>

          {/* 👤 USER */}
          {showUserSpace && (
            <Link to="/espace-participant">
              Espace
            </Link>
          )}

          {/* 👨‍💼 ADMIN */}
          {showAdmin && (
            <>
              <Link className="text-green-600" to="/admin">
                Dashboard
              </Link>

              <Link className="text-green-600" to="/admin/users">
                Utilisateurs
              </Link>

              <Link className="text-green-600" to="/ajouter-formation">
                + Formation
              </Link>

              <Link className="text-green-600" to="/ajouter-actualite">
                + Actualité
              </Link>
            </>
          )}

          {/* 🔐 AUTH */}
          {!user ? (
            <Link className="text-blue-600 font-semibold" to="/connexion">
              Connexion
            </Link>
          ) : (
            <button
              onClick={handleLogout}
              className="text-red-500"
            >
              Déconnexion
            </button>
          )}
        </nav>

      </div>

      {/* 📱 MOBILE MENU */}
      {menuOpen && (
        <div className="md:hidden border-t bg-white px-4 py-4 flex flex-col gap-4 text-gray-700">

          <Link onClick={toggleMenu} to="/">Accueil</Link>
          <Link onClick={toggleMenu} to="/a-propos">À propos</Link>
          <Link onClick={toggleMenu} to="/formations">Formations</Link>
          <Link onClick={toggleMenu} to="/contact">Contact</Link>
          <Link onClick={toggleMenu} to="/actualite">Actualité</Link>

          {/* USER */}
          {showUserSpace && (
            <Link onClick={toggleMenu} to="/espace-participant">
              Espace
            </Link>
          )}

          {/* ADMIN */}
          {showAdmin && (
            <>
              <hr />

              <Link onClick={toggleMenu} to="/admin">
                Dashboard
              </Link>

              <Link onClick={toggleMenu} to="/admin/users">
                Utilisateurs
              </Link>

              <Link onClick={toggleMenu} to="/ajouter-formation">
                + Formation
              </Link>

              <Link onClick={toggleMenu} to="/ajouter-actualite">
                + Actualité
              </Link>
            </>
          )}

          <hr />

          {!user ? (
            <Link onClick={toggleMenu} to="/connexion">
              Connexion
            </Link>
          ) : (
            <button
              onClick={handleLogout}
              className="text-red-500 text-left"
            >
              Déconnexion
            </button>
          )}

        </div>
      )}

    </header>
  );
}