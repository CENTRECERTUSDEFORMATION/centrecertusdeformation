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

  // 🔥 IMPORTANT: ne bloque pas tout le site
  if (loading) {
    return (
      <header className="h-16 bg-white shadow flex items-center justify-center">
        Chargement...
      </header>
    );
  }

  const showUserSpace = user && isApproved && !isAdmin;
  const showAdmin = user && isAdmin && isApproved;

  const NavLinks = () => (
    <>
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
          <Link onClick={toggleMenu} className="text-green-600" to="/admin">
            Dashboard
          </Link>

          <Link onClick={toggleMenu} className="text-green-600" to="/admin/users">
            Utilisateurs
          </Link>

          <Link onClick={toggleMenu} className="text-green-600" to="/ajouter-formation">
            + Formation
          </Link>

          <Link onClick={toggleMenu} className="text-green-600" to="/ajouter-actualite">
            + Actualité
          </Link>
        </>
      )}

      {/* AUTH */}
      {!user ? (
        <Link onClick={toggleMenu} className="text-blue-600" to="/connexion">
          Connexion
        </Link>
      ) : (
        <button onClick={handleLogout} className="text-red-500">
          Déconnexion
        </button>
      )}
    </>
  );

  return (
    <header className="bg-white shadow-md fixed top-0 left-0 w-full z-50">
      <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">

        {/* LOGO */}
        <div className="flex items-center gap-3">
          <img src={logo} className="h-10" />
          <div className="hidden sm:block">
            <h1 className="text-blue-800 font-bold">
              CENTRE CERTUS DE FORMATION
            </h1>
          </div>
        </div>

        {/* MOBILE */}
        <button onClick={toggleMenu} className="md:hidden">
          {menuOpen ? <X /> : <Menu />}
        </button>

        {/* DESKTOP */}
        <nav className="hidden md:flex gap-6 text-gray-700">
          <NavLinks />
        </nav>
      </div>

      {/* MOBILE MENU */}
      {menuOpen && (
        <div className="md:hidden bg-white border-t p-4 flex flex-col gap-4">
          <NavLinks />
        </div>
      )}
    </header>
  );
}