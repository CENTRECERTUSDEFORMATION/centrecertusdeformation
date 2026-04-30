// frontend/src/components/Navbar.jsx
import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import logo from "../assets/logo-certus.png";
import { motion, AnimatePresence } from "framer-motion";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const { user, isAdmin, isApproved, loading, logout } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
  }, [location]);

  const toggleMenu = () => setMenuOpen((prev) => !prev);

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/");
      setMenuOpen(false);
    } catch (error) {
      console.error("Erreur lors de la déconnexion:", error);
    }
  };

  const isActive = (path) => location.pathname === path;

  const navbarClass = `fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
    scrolled 
      ? "bg-white/95 backdrop-blur-md shadow-lg" 
      : "bg-white shadow-md"
  }`;

  if (loading) {
    return (
      <header className={navbarClass}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center gap-4">
              <img src={logo} alt="Certus" className="h-14 w-auto" />
              <div className="hidden sm:block">
                <div className="certus-brand">
                  <span className="centre">CENTRE</span>{' '}
                  <span className="certus">CERTUS</span>{' '}
                  <span className="de">DE</span>{' '}
                  <span className="formation">FORMATION</span>
                </div>
              </div>
            </div>
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
            <div className="relative">
              <img src={logo} alt="Certus" className="h-14 w-auto transition-transform group-hover:scale-105" />
            </div>
            <div className="hidden sm:block">
              <div className="certus-brand">
                <span className="centre">CENTRE</span>{' '}
                <span className="certus">CERTUS</span>{' '}
                <span className="de">DE</span>{' '}
                <span className="formation">FORMATION</span>
              </div>
              <p className="text-xs text-gray-500 mt-0.5">
                Structure privée de formation professionnelle
              </p>
              <p className="text-[10px] text-gray-400">
                N° d'enregistrement: 52-193-17
              </p>
            </div>
          </Link>

          {/* MOBILE BTN */}
          <button 
            onClick={toggleMenu} 
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition"
          >
            {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>

          {/* DESKTOP MENU */}
          <nav className="hidden md:flex items-center gap-1">
            
            {/* MENU POUR NON ADMIN (utilisateurs normaux) */}
            {!isAdmin && (
              <>
                <Link 
                  to="/" 
                  className={`px-3 py-2 rounded-lg transition-all duration-200 font-medium ${
                    isActive("/") 
                      ? "text-[#1a56db]" 
                      : "text-gray-600 hover:text-[#1a56db]"
                  }`}
                >
                  Accueil
                </Link>
                
                <Link 
                  to="/a-propos" 
                  className={`px-3 py-2 rounded-lg transition-all duration-200 font-medium ${
                    isActive("/a-propos") 
                      ? "text-[#1a56db]" 
                      : "text-gray-600 hover:text-[#1a56db]"
                  }`}
                >
                  À propos
                </Link>

                <Link 
                  to="/formations" 
                  className={`px-3 py-2 rounded-lg transition-all duration-200 font-medium ${
                    isActive("/formations") || location.pathname.startsWith("/formations/")
                      ? "text-[#1a56db]"
                      : "text-gray-600 hover:text-[#1a56db]"
                  }`}
                >
                  Formations
                </Link>

                <Link 
                  to="/actualite" 
                  className={`px-3 py-2 rounded-lg transition-all duration-200 font-medium ${
                    isActive("/actualite")
                      ? "text-[#1a56db]"
                      : "text-gray-600 hover:text-[#1a56db]"
                  }`}
                >
                  Actualité
                </Link>

                <Link 
                  to="/contact" 
                  className={`px-3 py-2 rounded-lg transition-all duration-200 font-medium ${
                    isActive("/contact") 
                      ? "text-[#1a56db]" 
                      : "text-gray-600 hover:text-[#1a56db]"
                  }`}
                >
                  Contact
                </Link>
              </>
            )}

            {/* MENU POUR ADMIN (seulement gestion) */}
            {isAdmin && (
              <>
                <Link 
                  to="/formations" 
                  className={`px-3 py-2 rounded-lg transition-all duration-200 font-medium ${
                    isActive("/formations") || location.pathname.startsWith("/formations/")
                      ? "text-[#1a56db]"
                      : "text-gray-600 hover:text-[#1a56db]"
                  }`}
                >
                  Formations
                </Link>

                <Link 
                  to="/actualite" 
                  className={`px-3 py-2 rounded-lg transition-all duration-200 font-medium ${
                    isActive("/actualite")
                      ? "text-[#1a56db]"
                      : "text-gray-600 hover:text-[#1a56db]"
                  }`}
                >
                  Actualité
                </Link>

                <div className="w-px h-6 bg-gray-300 mx-2"></div>

                <Link 
                  to="/admin" 
                  className={`px-3 py-2 rounded-lg transition-all duration-200 font-medium ${
                    isActive("/admin") 
                      ? "text-[#76c21f]" 
                      : "text-gray-600 hover:text-[#76c21f]"
                  }`}
                >
                  ⚙️ Admin
                </Link>

                <Link 
                  to="/admin/users" 
                  className={`px-3 py-2 rounded-lg transition-all duration-200 font-medium ${
                    isActive("/admin/users") 
                      ? "text-[#76c21f]" 
                      : "text-gray-600 hover:text-[#76c21f]"
                  }`}
                >
                  👥 Utilisateurs
                </Link>

                <Link 
                  to="/admin/statistics" 
                  className={`px-3 py-2 rounded-lg transition-all duration-200 font-medium ${
                    isActive("/admin/statistics") 
                      ? "text-[#76c21f]" 
                      : "text-gray-600 hover:text-[#76c21f]"
                  }`}
                >
                  📊 Statistiques
                </Link>
              </>
            )}

            {/* Espace participant - UNIQUEMENT pour utilisateurs normaux approuvés */}
            {user && isApproved && !isAdmin && (
              <Link 
                to="/espace-participant" 
                className={`px-3 py-2 rounded-lg transition-all duration-200 font-medium ${
                  isActive("/espace-participant") 
                    ? "text-[#1a56db]" 
                    : "text-gray-600 hover:text-[#1a56db]"
                }`}
              >
                👤 Mon espace
              </Link>
            )}

            {/* Connexion / Déconnexion */}
            {!user ? (
              <Link 
                to="/connexion" 
                className="ml-3 px-5 py-2 rounded-full font-medium transition-all hover:scale-105"
                style={{ 
                  background: "linear-gradient(135deg, #1a56db 0%, #1a56db 50%, #76c21f 100%)",
                  color: "white",
                  boxShadow: "0 4px 12px rgba(26, 86, 219, 0.3)"
                }}
              >
                Connexion
              </Link>
            ) : (
              <div className="flex items-center gap-3 ml-3">
                <div className="text-right">
                  <p className="text-xs text-gray-500">Connecté en tant que</p>
                  <p className="text-sm font-medium text-gray-700 truncate max-w-[180px]">
                    {user?.email || "Utilisateur"}
                  </p>
                </div>
                <button 
                  onClick={handleLogout} 
                  className="px-4 py-2 text-red-500 hover:text-red-600 hover:bg-red-50 rounded-full font-medium transition"
                >
                  Déconnexion
                </button>
              </div>
            )}
          </nav>
        </div>
      </div>

      {/* MOBILE MENU */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t bg-white shadow-lg"
          >
            <div className="px-4 py-4 flex flex-col gap-2">
              <div className="flex items-center gap-3 pb-3 border-b border-gray-100 mb-2">
                <img src={logo} alt="Certus" className="h-10 w-auto" />
                <div>
                  <div className="certus-brand text-sm">
                    <span className="centre">CENTRE</span>{' '}
                    <span className="certus">CERTUS</span>{' '}
                    <span className="de">DE</span>{' '}
                    <span className="formation">FORMATION</span>
                  </div>
                  <p className="text-[10px] text-gray-400">N° 52-193-17</p>
                </div>
              </div>
              
              {/* MENU MOBILE NON ADMIN */}
              {!isAdmin && (
                <>
                  <Link onClick={toggleMenu} to="/" className="px-3 py-2 rounded-lg hover:bg-gray-50 transition text-gray-700">
                    🏠 Accueil
                  </Link>
                  <Link onClick={toggleMenu} to="/a-propos" className="px-3 py-2 rounded-lg hover:bg-gray-50 transition text-gray-700">
                    ℹ️ À propos
                  </Link>
                  <Link onClick={toggleMenu} to="/formations" className="px-3 py-2 rounded-lg hover:bg-gray-50 transition text-gray-700">
                    📚 Formations
                  </Link>
                  <Link onClick={toggleMenu} to="/actualite" className="px-3 py-2 rounded-lg hover:bg-gray-50 transition text-gray-700">
                    📰 Actualité
                  </Link>
                  <Link onClick={toggleMenu} to="/contact" className="px-3 py-2 rounded-lg hover:bg-gray-50 transition text-gray-700">
                    📧 Contact
                  </Link>
                </>
              )}

              {/* MENU MOBILE ADMIN */}
              {isAdmin && (
                <>
                  <Link onClick={toggleMenu} to="/formations" className="px-3 py-2 rounded-lg hover:bg-gray-50 transition text-gray-700">
                    📚 Formations
                  </Link>
                  <Link onClick={toggleMenu} to="/actualite" className="px-3 py-2 rounded-lg hover:bg-gray-50 transition text-gray-700">
                    📰 Actualité
                  </Link>
                  <div className="h-px bg-gray-100 my-1"></div>
                  <Link onClick={toggleMenu} to="/admin" className="px-3 py-2 text-[#76c21f] font-medium rounded-lg hover:bg-green-50 transition">
                    ⚙️ Admin
                  </Link>
                  <Link onClick={toggleMenu} to="/admin/users" className="px-3 py-2 text-[#76c21f] rounded-lg hover:bg-green-50 transition">
                    👥 Utilisateurs
                  </Link>
                  <Link onClick={toggleMenu} to="/admin/statistics" className="px-3 py-2 text-[#76c21f] rounded-lg hover:bg-green-50 transition">
                    📊 Statistiques
                  </Link>
                </>
              )}

              {/* Espace participant mobile */}
              {user && isApproved && !isAdmin && (
                <Link onClick={toggleMenu} to="/espace-participant" className="px-3 py-2 rounded-lg hover:bg-gray-50 transition text-gray-700">
                  👤 Mon espace
                </Link>
              )}

              <div className="h-px bg-gray-100 my-1"></div>

              {/* Auth mobile */}
              {!user ? (
                <Link 
                  onClick={toggleMenu} 
                  to="/connexion" 
                  className="px-3 py-2 text-white rounded-full text-center font-medium"
                  style={{ background: "linear-gradient(135deg, #1a56db 0%, #1a56db 50%, #76c21f 100%)" }}
                >
                  Connexion
                </Link>
              ) : (
                <>
                  <div className="px-3 py-2">
                    <p className="text-xs text-gray-500">Connecté en tant que</p>
                    <p className="text-sm font-medium text-gray-700 truncate">
                      {user?.email || "Utilisateur"}
                    </p>
                  </div>
                  <button onClick={handleLogout} className="px-3 py-2 text-red-500 text-center font-medium rounded-lg hover:bg-red-50">
                    Déconnexion
                  </button>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}