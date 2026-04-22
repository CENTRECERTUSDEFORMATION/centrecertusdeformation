import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import logo from "../assets/logo-certus.png";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  // ✅ PROTECTION MAX (évite menu vide + crash)
  const auth = useAuth();

  const user = auth?.user ?? null;
  const isAdmin = auth?.isAdmin ?? false;
  const isApproved = auth?.isApproved ?? false;
  const logout = auth?.logout ?? (() => {});

  const toggleMenu = () => setMenuOpen((prev) => !prev);

  const handleLogout = async () => {
    await logout();
    setMenuOpen(false);
  };

  return (
    <header className="bg-white shadow-md fixed top-0 left-0 w-full z-50">

      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">

        {/* LOGO */}
        <div className="flex items-center gap-3">
          <img src={logo} alt="Certus" className="h-10 w-auto" />
          <div className="hidden sm:block">
            <h1 className="text-lg font-bold text-blue-800">
              CENTRE CERTUS DE FORMATION
            </h1>
            <p className="text-xs text-gray-500">
              Structure privée
            </p>
          </div>
        </div>

        {/* MOBILE BTN */}
        <button onClick={toggleMenu} className="md:hidden">
          {menuOpen ? <X /> : <Menu />}
        </button>

        {/* DESKTOP MENU */}
        <nav className="hidden md:flex gap-6 items-center text-gray-700">

          <Link to="/">Accueil</Link>
          <Link to="/a-propos">À propos</Link>
          <Link to="/formations">Formations</Link>
          <Link to="/actualite">Actualité</Link>
          <Link to="/contact">Contact</Link>

          {/* USER */}
          {user && isApproved && !isAdmin && (
            <Link className="text-blue-700 font-medium" to="/espace-participant">
              Espace
            </Link>
          )}

          {/* ADMIN */}
          {user && isAdmin && (
            <>
              <Link className="text-green-600 font-semibold" to="/admin">
                Admin
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

          {/* AUTH */}
          {!user ? (
            <Link className="text-blue-600 font-semibold" to="/connexion">
              Connexion
            </Link>
          ) : (
            <button onClick={handleLogout} className="text-red-500">
              Déconnexion
            </button>
          )}
        </nav>
      </div>

      {/* MOBILE MENU */}
      {menuOpen && (
        <div className="md:hidden border-t bg-white px-4 py-4 flex flex-col gap-4">

          <Link onClick={toggleMenu} to="/">Accueil</Link>
          <Link onClick={toggleMenu} to="/a-propos">À propos</Link>
          <Link onClick={toggleMenu} to="/formations">Formations</Link>
          <Link onClick={toggleMenu} to="/actualite">Actualité</Link>
          <Link onClick={toggleMenu} to="/contact">Contact</Link>

          {user && isApproved && !isAdmin && (
            <Link onClick={toggleMenu} to="/espace-participant">
              Espace participant
            </Link>
          )}

          {user && isAdmin && (
            <>
              <hr />
              <Link onClick={toggleMenu} to="/admin">Admin</Link>
              <Link onClick={toggleMenu} to="/admin/users">Utilisateurs</Link>
              <Link onClick={toggleMenu} to="/ajouter-formation">+ Formation</Link>
              <Link onClick={toggleMenu} to="/ajouter-actualite">+ Actualité</Link>
            </>
          )}

          <hr />

          {!user ? (
            <Link onClick={toggleMenu} to="/connexion">
              Connexion
            </Link>
          ) : (
            <button onClick={handleLogout} className="text-red-500">
              Déconnexion
            </button>
          )}

        </div>
      )}

    </header>
  );
}