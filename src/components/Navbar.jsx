import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import logo from "../assets/logo-certus.png";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { user, logout, loading } = useAuth();
  const toggleMenu = () => setMenuOpen(!menuOpen);
  const handleLogout = () => { logout(); setMenuOpen(false); };
  if (loading) return null;

  const NavLinks = () => (
    <>
      <Link to="/" onClick={toggleMenu} className="hover:text-blue-600">Accueil</Link>
      <Link to="/a-propos" onClick={toggleMenu} className="hover:text-blue-600">À propos</Link>
      <Link to="/formations" onClick={toggleMenu} className="hover:text-blue-600">Formations</Link>
      <Link to="/contact" onClick={toggleMenu} className="hover:text-blue-600">Contact</Link>
      <Link to="/actualite" onClick={toggleMenu} className="hover:text-blue-600">Actualité</Link>

      {user && !user.isAdmin && user.isApproved && (
        <Link to="/espace-participant" onClick={toggleMenu} className="hover:text-blue-600">Espace Participant</Link>
      )}

      {user?.isAdmin && user.isApproved && (
        <>
          <Link to="/ajouter-actualite" onClick={toggleMenu} className="text-green-600 hover:text-green-800">+ Actualité</Link>
          <Link to="/ajouter-formation" onClick={toggleMenu} className="text-green-600 hover:text-green-800">+ Formation</Link>
          <Link to="/admin" onClick={toggleMenu} className="text-green-600 hover:text-green-800">Admin</Link>
        </>
      )}

      {!user ? (
        <Link to="/connexion" onClick={toggleMenu} className="text-blue-600 font-semibold hover:underline">Connexion</Link>
      ) : (
        <button onClick={handleLogout} className="text-red-500 hover:underline">Déconnexion</button>
      )}
    </>
  );

  return (
    <header className="bg-white shadow-md z-50 fixed w-full top-0 left-0">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img src={logo} alt="Logo Certus" className="h-10 w-auto object-contain" />
          <div className="hidden sm:block">
            <h1 className="text-xl sm:text-2xl font-bold text-blue-800">CENTRE CERTUS DE FORMATION</h1>
            <p className="text-xs sm:text-sm text-gray-500">Structure privée - N° 52-193-17</p>
          </div>
        </div>

        <button onClick={toggleMenu} className="md:hidden text-blue-700 focus:outline-none" aria-label="Menu" aria-expanded={menuOpen}>
          {menuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        <nav className="hidden md:flex gap-8 text-gray-700 text-base">
          <NavLinks />
        </nav>
      </div>

      {menuOpen && (
        <div className="md:hidden bg-white border-t border-gray-200 px-4 py-4">
          <nav className="flex flex-col gap-4 text-gray-700">
            <NavLinks />
          </nav>
        </div>
      )}
    </header>
  );
}
