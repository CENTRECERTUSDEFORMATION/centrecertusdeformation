// frontend/src/components/Navbar.jsx
import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import logo from "../assets/logo-certus.png";
import { motion, AnimatePresence } from "framer-motion";
import { FaFacebook, FaInstagram, FaTiktok } from "react-icons/fa";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAdmin, userType, isApproved, loading, logout } = useAuth();

  const socialLinks = [
    { name: "Facebook", url: "https://www.facebook.com/Centre.Certus.de.Formation/", icon: FaFacebook, color: "#1877f2", hoverColor: "#145dbf" },
    { name: "Instagram", url: "https://www.instagram.com/centre.certus.de.formation/", icon: FaInstagram, color: "#e4405f", hoverColor: "#c13584" },
    { name: "TikTok", url: "https://www.tiktok.com/@certus_formation?lang=fr", icon: FaTiktok, color: "#000000", hoverColor: "#25f4ee" },
  ];

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
  }, [location]);

  const toggleMenu = () => setMenuOpen((prev) => !prev);

  const handleLogout = async () => {
    await logout();
    navigate("/");
    setMenuOpen(false);
  };

  const isActive = (path) => location.pathname === path || location.pathname.startsWith(path);

  const navbarClass = `fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
    scrolled ? "bg-white/95 backdrop-blur-md shadow-lg" : "bg-white shadow-md"
  }`;

  if (loading) {
    return (
      <header className={navbarClass}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <img src={logo} alt="Certus" className="h-14 w-auto" />
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className={navbarClass}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* LOGO */}
          <Link to="/" className="flex items-center gap-4 group">
            <img src={logo} alt="Certus" className="h-14 w-auto transition-transform group-hover:scale-105" />
            <div className="hidden sm:block">
              <div className="certus-brand">
                <span className="centre">CENTRE</span>{' '}
                <span className="certus">CERTUS</span>{' '}
                <span className="de">DE</span>{' '}
                <span className="formation">FORMATION</span>
              </div>
              <p className="text-xs text-gray-500">Structure privée de formation professionnelle</p>
              <p className="text-[10px] text-gray-400">N° d'enregistrement: 52-193-17</p>
            </div>
          </Link>

          {/* BOUTON MOBILE */}
          <button onClick={toggleMenu} className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition">
            {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>

          {/* MENU DESKTOP */}
          <nav className="hidden md:flex items-center gap-1">
            
            {/* MENU POUR TOUS (pages publiques) */}
            <Link to="/" className={`px-3 py-2 rounded-lg font-medium ${isActive("/") ? "text-[#1a56db]" : "text-gray-600 hover:text-[#1a56db]"}`}>Accueil</Link>
            <Link to="/a-propos" className={`px-3 py-2 rounded-lg font-medium ${isActive("/a-propos") ? "text-[#1a56db]" : "text-gray-600 hover:text-[#1a56db]"}`}>À propos</Link>
            <Link to="/formations" className={`px-3 py-2 rounded-lg font-medium ${isActive("/formations") || location.pathname.startsWith("/formations/") ? "text-[#1a56db]" : "text-gray-600 hover:text-[#1a56db]"}`}>Formations</Link>
            <Link to="/actualite" className={`px-3 py-2 rounded-lg font-medium ${isActive("/actualite") ? "text-[#1a56db]" : "text-gray-600 hover:text-[#1a56db]"}`}>Actualité</Link>
            <Link to="/contact" className={`px-3 py-2 rounded-lg font-medium ${isActive("/contact") ? "text-[#1a56db]" : "text-gray-600 hover:text-[#1a56db]"}`}>Contact</Link>

            {/* MENU ADMIN (gestion) - UNIQUEMENT SI ADMIN CONNECTÉ */}
            {user && isAdmin && (
              <>
                <div className="w-px h-6 bg-gray-300 mx-2"></div>
                <Link to="/admin" className={`px-3 py-2 rounded-lg font-medium ${isActive("/admin") ? "text-[#76c21f]" : "text-gray-600 hover:text-[#76c21f]"}`}>📚 Formations</Link>
                <Link to="/admin/users" className={`px-3 py-2 rounded-lg font-medium ${isActive("/admin/users") ? "text-[#76c21f]" : "text-gray-600 hover:text-[#76c21f]"}`}>👥 Utilisateurs</Link>
                <Link to="/admin/statistics" className={`px-3 py-2 rounded-lg font-medium ${isActive("/admin/statistics") ? "text-[#76c21f]" : "text-gray-600 hover:text-[#76c21f]"}`}>📊 Statistiques</Link>
              </>
            )}

            {/* MENU FORMATEUR - UNIQUEMENT SI FORMATEUR CONNECTÉ */}
            {user && !isAdmin && userType === "formateur" && isApproved && (
              <Link to="/espace-formateur" className={`px-3 py-2 rounded-lg font-medium ${isActive("/espace-formateur") ? "text-[#1a56db]" : "text-gray-600 hover:text-[#1a56db]"}`}>👨‍🏫 Espace Formateur</Link>
            )}

            {/* MENU PARTICIPANT - UNIQUEMENT SI PARTICIPANT CONNECTÉ */}
            {user && !isAdmin && userType === "participant" && isApproved && (
              <Link to="/espace-participant" className={`px-3 py-2 rounded-lg font-medium ${isActive("/espace-participant") ? "text-[#1a56db]" : "text-gray-600 hover:text-[#1a56db]"}`}>👨‍🎓 Espace Participant</Link>
            )}

            {/* CONNEXION / DÉCONNEXION + RÉSEAUX */}
            <div className="flex items-center gap-2 ml-3">
              <div className="flex items-center gap-1 mr-2">
                {socialLinks.map((social, index) => (
                  <a key={index} href={social.url} target="_blank" rel="noopener noreferrer" className="transition hover:scale-110" style={{ color: social.color }} title={social.name}>
                    <social.icon className="w-5 h-5" />
                  </a>
                ))}
              </div>
              <div className="w-px h-5 bg-gray-300"></div>
              {!user ? (
                <Link to="/connexion" className="px-5 py-2 rounded-full font-medium text-white" style={{ background: "linear-gradient(135deg, #1a56db 0%, #1a56db 50%, #76c21f 100%)" }}>Connexion</Link>
              ) : (
                <div className="flex items-center gap-2">
                  <div className="text-right hidden lg:block">
                    <p className="text-xs text-gray-500">Connecté en tant que</p>
                    <p className="text-sm font-medium text-gray-700">{user?.email}</p>
                  </div>
                  <button onClick={handleLogout} className="px-4 py-2 text-red-500 hover:bg-red-50 rounded-full">Déconnexion</button>
                </div>
              )}
            </div>
          </nav>
        </div>
      </div>

      {/* MENU MOBILE */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="md:hidden border-t bg-white shadow-lg">
            <div className="px-4 py-4 flex flex-col gap-2">
              <Link onClick={toggleMenu} to="/" className="px-3 py-2 rounded-lg hover:bg-gray-50">🏠 Accueil</Link>
              <Link onClick={toggleMenu} to="/a-propos" className="px-3 py-2 rounded-lg hover:bg-gray-50">ℹ️ À propos</Link>
              <Link onClick={toggleMenu} to="/formations" className="px-3 py-2 rounded-lg hover:bg-gray-50">📚 Formations</Link>
              <Link onClick={toggleMenu} to="/actualite" className="px-3 py-2 rounded-lg hover:bg-gray-50">📰 Actualité</Link>
              <Link onClick={toggleMenu} to="/contact" className="px-3 py-2 rounded-lg hover:bg-gray-50">📧 Contact</Link>

              {user && isAdmin && (
                <>
                  <div className="h-px bg-gray-100 my-1"></div>
                  <Link onClick={toggleMenu} to="/admin" className="px-3 py-2 text-[#76c21f] font-medium">📚 Formations</Link>
                  <Link onClick={toggleMenu} to="/admin/users" className="px-3 py-2 text-[#76c21f]">👥 Utilisateurs</Link>
                  <Link onClick={toggleMenu} to="/admin/statistics" className="px-3 py-2 text-[#76c21f]">📊 Statistiques</Link>
                </>
              )}

              {user && !isAdmin && userType === "formateur" && isApproved && (
                <Link onClick={toggleMenu} to="/espace-formateur" className="px-3 py-2 rounded-lg hover:bg-gray-50">👨‍🏫 Espace Formateur</Link>
              )}

              {user && !isAdmin && userType === "participant" && isApproved && (
                <Link onClick={toggleMenu} to="/espace-participant" className="px-3 py-2 rounded-lg hover:bg-gray-50">👨‍🎓 Espace Participant</Link>
              )}

              <div className="flex gap-6 justify-center py-3">
                {socialLinks.map((social, index) => (
                  <a key={index} href={social.url} target="_blank" rel="noopener noreferrer" style={{ color: social.color }}>
                    <social.icon className="w-6 h-6" />
                  </a>
                ))}
              </div>

              {!user ? (
                <Link onClick={toggleMenu} to="/connexion" className="px-3 py-2 text-white rounded-full text-center" style={{ background: "linear-gradient(135deg, #1a56db 0%, #1a56db 50%, #76c21f 100%)" }}>Connexion</Link>
              ) : (
                <>
                  <div className="px-3 py-2">
                    <p className="text-xs text-gray-500">Connecté en tant que</p>
                    <p className="text-sm font-medium">{user?.email}</p>
                  </div>
                  <button onClick={handleLogout} className="px-3 py-2 text-red-500 text-center">Déconnexion</button>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}