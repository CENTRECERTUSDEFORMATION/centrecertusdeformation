// frontend/src/components/Navbar.jsx
import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu, X, ChevronDown } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import logo from "../assets/logo-certus.webp";
import { motion, AnimatePresence } from "framer-motion";
import { FaFacebook, FaInstagram, FaTiktok } from "react-icons/fa";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [adminDropdownOpen, setAdminDropdownOpen] = useState(false);
  const [formationsDropdownOpen, setFormationsDropdownOpen] = useState(false);
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
    setAdminDropdownOpen(false);
    setFormationsDropdownOpen(false);
  }, [location]);

  const toggleMenu = () => setMenuOpen((prev) => !prev);
  const toggleAdminDropdown = () => setAdminDropdownOpen((prev) => !prev);
  const toggleFormationsDropdown = () => setFormationsDropdownOpen((prev) => !prev);

  const handleLogout = async () => {
    await logout();
    navigate("/");
    setMenuOpen(false);
    setAdminDropdownOpen(false);
    setFormationsDropdownOpen(false);
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
            
            {/* Pages publiques */}
            <Link to="/" className={`px-3 py-2 rounded-lg text-sm font-medium transition ${isActive("/") ? "text-[#1a56db]" : "text-gray-600 hover:text-[#1a56db]"}`}>Accueil</Link>
            <Link to="/a-propos" className={`px-3 py-2 rounded-lg text-sm font-medium transition ${isActive("/a-propos") ? "text-[#1a56db]" : "text-gray-600 hover:text-[#1a56db]"}`}>À propos</Link>

            {/* ============ DROPDOWN FORMATIONS (SEO) ============ */}
            <div 
              className="relative"
              onMouseEnter={() => setFormationsDropdownOpen(true)}
              onMouseLeave={() => setFormationsDropdownOpen(false)}
            >
              <button
                className={`flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium transition ${
                  isActive("/formations") || location.pathname.startsWith("/formations/") || location.pathname.startsWith("/formation-")
                    ? "text-[#1a56db]"
                    : "text-gray-600 hover:text-[#1a56db]"
                }`}
                onClick={toggleFormationsDropdown}
              >
                Formations
                <ChevronDown className={`w-4 h-4 transition-transform ${formationsDropdownOpen ? "rotate-180" : ""}`} />
              </button>

              <AnimatePresence>
                {formationsDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute left-0 mt-1 w-56 bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden z-50"
                  >
                    {/* Toutes les formations */}
                    <Link
                      to="/formations"
                      onClick={() => setFormationsDropdownOpen(false)}
                      className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
                    >
                      📚 Toutes les formations
                    </Link>
                    
                    <div className="border-t border-gray-100 my-1"></div>
                    
                    {/* 🌍 Formations en Langues */}
                    <Link
                      to="/formations/langues"
                      onClick={() => setFormationsDropdownOpen(false)}
                      className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-[#1a56db] hover:bg-blue-50 transition"
                    >
                      🌍 Formations en Langues
                    </Link>
                    
                    {/* ✅ Sous-menu langues - URLs SEO mises à jour */}
                    <div className="border-t border-gray-100 my-1"></div>
                    <Link
                      to="/formation-allemand-monastir"
                      onClick={() => setFormationsDropdownOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 pl-8 text-sm text-gray-600 hover:bg-blue-50 hover:text-[#1a56db] transition"
                    >
                      🇩🇪 Allemand
                    </Link>
                    <Link
                      to="/formation-anglais-monastir"
                      onClick={() => setFormationsDropdownOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 pl-8 text-sm text-gray-600 hover:bg-blue-50 hover:text-[#1a56db] transition"
                    >
                      🇬🇧 Anglais
                    </Link>
                    <Link
                      to="/formation-espagnol-monastir"
                      onClick={() => setFormationsDropdownOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 pl-8 text-sm text-gray-600 hover:bg-blue-50 hover:text-[#1a56db] transition"
                    >
                      🇪🇸 Espagnol
                    </Link>
                    <Link
                      to="/formation-francais-monastir"
                      onClick={() => setFormationsDropdownOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 pl-8 text-sm text-gray-600 hover:bg-blue-50 hover:text-[#1a56db] transition"
                    >
                      🇫🇷 Français
                    </Link>
                    <Link
                      to="/formation-italien-monastir"
                      onClick={() => setFormationsDropdownOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 pl-8 text-sm text-gray-600 hover:bg-blue-50 hover:text-[#1a56db] transition"
                    >
                      🇮🇹 Italien
                    </Link>
                    
                    <div className="border-t border-gray-100 my-1"></div>
                    
                    {/* Autres thèmes */}
                    <Link
                      to="/formations?theme=digital"
                      onClick={() => setFormationsDropdownOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 pl-8 text-sm text-gray-500 hover:bg-gray-50 transition"
                    >
                      💻 Digital & Web
                    </Link>
                    <Link
                      to="/formations?theme=data"
                      onClick={() => setFormationsDropdownOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 pl-8 text-sm text-gray-500 hover:bg-gray-50 transition"
                    >
                      📊 Data & IA
                    </Link>
                    <Link
                      to="/formations?theme=design"
                      onClick={() => setFormationsDropdownOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 pl-8 text-sm text-gray-500 hover:bg-gray-50 transition"
                    >
                      🎨 Design & Créativité
                    </Link>
                    <Link
                      to="/formations?theme=management"
                      onClick={() => setFormationsDropdownOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 pl-8 text-sm text-gray-500 hover:bg-gray-50 transition"
                    >
                      📈 Management
                    </Link>
                    <Link
                      to="/formations?theme=finance"
                      onClick={() => setFormationsDropdownOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 pl-8 text-sm text-gray-500 hover:bg-gray-50 transition"
                    >
                      💰 Finance
                    </Link>
                    <Link
                      to="/formations?theme=energie"
                      onClick={() => setFormationsDropdownOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 pl-8 text-sm text-gray-500 hover:bg-gray-50 transition"
                    >
                      🌱 Énergies renouvelables
                    </Link>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <Link to="/actualite" className={`px-3 py-2 rounded-lg text-sm font-medium transition ${isActive("/actualite") ? "text-[#1a56db]" : "text-gray-600 hover:text-[#1a56db]"}`}>Actualité</Link>
            <Link to="/contact" className={`px-3 py-2 rounded-lg text-sm font-medium transition ${isActive("/contact") ? "text-[#1a56db]" : "text-gray-600 hover:text-[#1a56db]"}`}>Contact</Link>

            {/* MENU ADMIN - DROPDOWN MODERNE */}
            {user && isAdmin && (
              <div className="relative ml-2">
                <button
                  onClick={toggleAdminDropdown}
                  className={`flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium transition ${
                    adminDropdownOpen ? "bg-gray-100 text-[#76c21f]" : "text-gray-600 hover:text-[#76c21f]"
                  }`}
                >
                  <span>⚙️</span>
                  <span>Admin</span>
                  <ChevronDown className={`w-4 h-4 transition-transform ${adminDropdownOpen ? "rotate-180" : ""}`} />
                </button>
                
                <AnimatePresence>
                  {adminDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute right-0 mt-2 w-44 bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden z-50"
                    >
                      <Link
                        to="/admin"
                        onClick={() => setAdminDropdownOpen(false)}
                        className={`flex items-center gap-2 px-4 py-2.5 text-sm transition ${isActive("/admin") ? "bg-green-50 text-[#76c21f]" : "text-gray-700 hover:bg-gray-50"}`}
                      >
                        <span>📚</span> Formations
                      </Link>
                      <Link
                        to="/admin/users"
                        onClick={() => setAdminDropdownOpen(false)}
                        className={`flex items-center gap-2 px-4 py-2.5 text-sm transition ${isActive("/admin/users") ? "bg-green-50 text-[#76c21f]" : "text-gray-700 hover:bg-gray-50"}`}
                      >
                        <span>👥</span> Utilisateurs
                      </Link>
                      <Link
                        to="/admin/statistics"
                        onClick={() => setAdminDropdownOpen(false)}
                        className={`flex items-center gap-2 px-4 py-2.5 text-sm transition ${isActive("/admin/statistics") ? "bg-green-50 text-[#76c21f]" : "text-gray-700 hover:bg-gray-50"}`}
                      >
                        <span>📊</span> Statistiques
                      </Link>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            {/* ESPACE FORMATEUR */}
            {user && !isAdmin && userType === "formateur" && isApproved && (
              <Link to="/espace-formateur" className={`px-3 py-2 rounded-lg text-sm font-medium transition ${isActive("/espace-formateur") ? "text-[#1a56db]" : "text-gray-600 hover:text-[#1a56db]"}`}>
                👨‍🏫 Formateur
              </Link>
            )}

            {/* ESPACE PARTICIPANT */}
            {user && !isAdmin && userType === "participant" && isApproved && (
              <Link to="/espace-participant" className={`px-3 py-2 rounded-lg text-sm font-medium transition ${isActive("/espace-participant") ? "text-[#1a56db]" : "text-gray-600 hover:text-[#1a56db]"}`}>
                👨‍🎓 Mon espace
              </Link>
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
                <Link to="/connexion" className="px-5 py-2 rounded-full text-sm font-medium text-white" style={{ background: "linear-gradient(135deg, #1a56db 0%, #1a56db 50%, #76c21f 100%)" }}>
                  Connexion
                </Link>
              ) : (
                <div className="flex items-center gap-2">
                  <div className="text-right hidden lg:block">
                    <p className="text-xs text-gray-500">Connecté</p>
                    <p className="text-sm font-medium text-gray-700">{user?.email?.split("@")[0]}</p>
                  </div>
                  <button onClick={handleLogout} className="px-4 py-2 text-sm text-red-500 hover:bg-red-50 rounded-full transition">
                    Déconnexion
                  </button>
                </div>
              )}
            </div>
          </nav>
        </div>
      </div>

      {/* MENU MOBILE - MODERNE */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t bg-white shadow-lg"
          >
            <div className="px-4 py-4 flex flex-col gap-1">
              <Link onClick={toggleMenu} to="/" className="px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-50">🏠 Accueil</Link>
              <Link onClick={toggleMenu} to="/a-propos" className="px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-50">ℹ️ À propos</Link>
              
              {/* Lien Formations Mobile */}
              <Link onClick={toggleMenu} to="/formations" className="px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-50">📚 Toutes les formations</Link>
              
              {/* ✅ Langues - Mobile avec URLs SEO */}
              <div className="pl-6 border-l-2 border-blue-200 ml-3">
                <Link onClick={toggleMenu} to="/formations/langues" className="block px-3 py-1.5 rounded-lg text-sm font-medium text-[#1a56db] hover:bg-blue-50">
                  🌍 Formations en Langues
                </Link>
                <Link onClick={toggleMenu} to="/formation-allemand-monastir" className="block px-3 py-1.5 rounded-lg text-sm text-gray-600 hover:bg-blue-50">
                  🇩🇪 Allemand
                </Link>
                <Link onClick={toggleMenu} to="/formation-anglais-monastir" className="block px-3 py-1.5 rounded-lg text-sm text-gray-600 hover:bg-blue-50">
                  🇬🇧 Anglais
                </Link>
                <Link onClick={toggleMenu} to="/formation-espagnol-monastir" className="block px-3 py-1.5 rounded-lg text-sm text-gray-600 hover:bg-blue-50">
                  🇪🇸 Espagnol
                </Link>
                <Link onClick={toggleMenu} to="/formation-francais-monastir" className="block px-3 py-1.5 rounded-lg text-sm text-gray-600 hover:bg-blue-50">
                  🇫🇷 Français
                </Link>
                <Link onClick={toggleMenu} to="/formation-italien-monastir" className="block px-3 py-1.5 rounded-lg text-sm text-gray-600 hover:bg-blue-50">
                  🇮🇹 Italien
                </Link>
              </div>
              
              <Link onClick={toggleMenu} to="/actualite" className="px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-50">📰 Actualité</Link>
              <Link onClick={toggleMenu} to="/contact" className="px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-50">📧 Contact</Link>

              {/* Admin - mobile */}
              {user && isAdmin && (
                <>
                  <div className="h-px bg-gray-100 my-2"></div>
                  <div className="text-[#76c21f] font-medium px-3 py-1 text-sm">⚙️ Administration</div>
                  <Link onClick={toggleMenu} to="/admin" className="px-6 py-2 rounded-lg text-gray-700 hover:bg-gray-50 text-sm">📚 Formations</Link>
                  <Link onClick={toggleMenu} to="/admin/users" className="px-6 py-2 rounded-lg text-gray-700 hover:bg-gray-50 text-sm">👥 Utilisateurs</Link>
                  <Link onClick={toggleMenu} to="/admin/statistics" className="px-6 py-2 rounded-lg text-gray-700 hover:bg-gray-50 text-sm">📊 Statistiques</Link>
                </>
              )}

              {/* Formateur - mobile */}
              {user && !isAdmin && userType === "formateur" && isApproved && (
                <Link onClick={toggleMenu} to="/espace-formateur" className="px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-50">👨‍🏫 Espace Formateur</Link>
              )}

              {/* Participant - mobile */}
              {user && !isAdmin && userType === "participant" && isApproved && (
                <Link onClick={toggleMenu} to="/espace-participant" className="px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-50">👨‍🎓 Mon espace</Link>
              )}

              <div className="flex gap-6 justify-center py-3 mt-2">
                {socialLinks.map((social, index) => (
                  <a key={index} href={social.url} target="_blank" rel="noopener noreferrer" style={{ color: social.color }}>
                    <social.icon className="w-6 h-6" />
                  </a>
                ))}
              </div>

              {!user ? (
                <Link onClick={toggleMenu} to="/connexion" className="mt-2 px-3 py-2 text-white rounded-full text-center text-sm font-medium" style={{ background: "linear-gradient(135deg, #1a56db 0%, #1a56db 50%, #76c21f 100%)" }}>
                  Connexion
                </Link>
              ) : (
                <>
                  <div className="px-3 py-2 mt-2">
                    <p className="text-xs text-gray-500">Connecté en tant que</p>
                    <p className="text-sm font-medium text-gray-700">{user?.email}</p>
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