// frontend/src/components/Navbar.jsx
import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import logo from "../assets/logo-certus.webp";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [adminDropdownOpen, setAdminDropdownOpen] = useState(false);
  const [formationsDropdownOpen, setFormationsDropdownOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAdmin, userType, isApproved, loading, logout } = useAuth();

  // ✅ Refs pour les timeouts
  const formationsTimeoutRef = useRef(null);
  const adminTimeoutRef = useRef(null);

  // Icônes sociales - SVG avec couleurs
  const socialLinks = [
    { 
      name: "Facebook", 
      url: "https://www.facebook.com/Centre.Certus.de.Formation/",
      icon: (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="#1877f2">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
        </svg>
      )
    },
    { 
      name: "Instagram", 
      url: "https://www.instagram.com/centre.certus.de.formation/",
      icon: (
        <svg className="w-5 h-5" viewBox="0 0 24 24">
          <defs>
            <linearGradient id="instaGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#f09433"/>
              <stop offset="25%" stopColor="#e6683c"/>
              <stop offset="50%" stopColor="#dc2743"/>
              <stop offset="75%" stopColor="#cc2366"/>
              <stop offset="100%" stopColor="#bc1888"/>
            </linearGradient>
          </defs>
          <rect x="2" y="2" width="20" height="20" rx="5" fill="url(#instaGradient)"/>
          <circle cx="12" cy="12" r="4.5" fill="none" stroke="white" strokeWidth="1.8"/>
          <circle cx="17.5" cy="6.5" r="1.2" fill="white"/>
          <path d="M7 2h10a5 5 0 015 5v10a5 5 0 01-5 5H7a5 5 0 01-5-5V7a5 5 0 015-5z" fill="none" stroke="url(#instaGradient)" strokeWidth="2"/>
        </svg>
      )
    },
    { 
      name: "TikTok", 
      url: "https://www.tiktok.com/@certus_formation?lang=fr",
      icon: (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="#000000">
          <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.76-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.3-.7.32-1.08.07-2.37.01-4.74.01-7.12.17-.01.33-.02.5-.02z"/>
        </svg>
      )
    },
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

  // ✅ Nettoyer les timeouts au démontage
  useEffect(() => {
    return () => {
      if (formationsTimeoutRef.current) {
        clearTimeout(formationsTimeoutRef.current);
      }
      if (adminTimeoutRef.current) {
        clearTimeout(adminTimeoutRef.current);
      }
    };
  }, []);

  // ✅ Gestion du hover pour le dropdown Formations
  const handleFormationsMouseEnter = () => {
    if (formationsTimeoutRef.current) {
      clearTimeout(formationsTimeoutRef.current);
      formationsTimeoutRef.current = null;
    }
    setFormationsDropdownOpen(true);
  };

  const handleFormationsMouseLeave = () => {
    formationsTimeoutRef.current = setTimeout(() => {
      setFormationsDropdownOpen(false);
    }, 200);
  };

  // ✅ Gestion du hover pour le dropdown Admin
  const handleAdminMouseEnter = () => {
    if (adminTimeoutRef.current) {
      clearTimeout(adminTimeoutRef.current);
      adminTimeoutRef.current = null;
    }
    setAdminDropdownOpen(true);
  };

  const handleAdminMouseLeave = () => {
    adminTimeoutRef.current = setTimeout(() => {
      setAdminDropdownOpen(false);
    }, 200);
  };

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
          <div className="flex items-center justify-between h-16">
            <img src={logo} alt="Certus" className="h-12 w-auto" />
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className={navbarClass}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* LOGO */}
          <Link to="/" className="flex items-center gap-3 group">
            <img src={logo} alt="Certus" className="h-12 w-auto transition-transform group-hover:scale-105" />
            <div className="hidden sm:block">
              <div className="font-bold text-lg leading-tight">
                <span className="text-[#1a56db]">CENTRE</span>{' '}
                <span className="text-[#76c21f]">CERTUS</span>{' '}
                <span className="text-[#f59e0b]">DE</span>{' '}
                <span className="text-[#1a56db]">FORMATION</span>
              </div>
              <p className="text-xs text-gray-500">Structure privée de formation professionnelle</p>
              <p className="text-[10px] text-gray-400">N° d'enregistrement: 52-193-17</p>
            </div>
          </Link>

          {/* BOUTON MOBILE */}
          <button onClick={toggleMenu} className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition">
            {menuOpen ? (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>

          {/* MENU DESKTOP */}
          <nav className="hidden md:flex items-center gap-1">
            
            {/* Pages publiques */}
            <Link to="/" className={`px-3 py-2 rounded-lg text-sm font-medium transition ${isActive("/") ? "text-[#1a56db]" : "text-gray-600 hover:text-[#1a56db]"}`}>
              Accueil
            </Link>
            <Link to="/a-propos" className={`px-3 py-2 rounded-lg text-sm font-medium transition ${isActive("/a-propos") ? "text-[#1a56db]" : "text-gray-600 hover:text-[#1a56db]"}`}>
              À propos
            </Link>

            {/* ✅ DROPDOWN FORMATIONS - CORRIGÉ */}
            <div 
              className="relative"
              onMouseEnter={handleFormationsMouseEnter}
              onMouseLeave={handleFormationsMouseLeave}
            >
              <button
                className={`flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium transition ${
                  isActive("/formations") || location.pathname.startsWith("/formations/") || location.pathname.startsWith("/formation-")
                    ? "text-[#1a56db]"
                    : "text-gray-600 hover:text-[#1a56db]"
                }`}
                onClick={toggleFormationsDropdown}
                aria-expanded={formationsDropdownOpen}
                aria-haspopup="true"
              >
                Formations
                <svg className={`w-4 h-4 transition-transform ${formationsDropdownOpen ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {formationsDropdownOpen && (
                <div 
                  className="absolute left-0 mt-1 w-56 bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden z-50"
                  onMouseEnter={() => {
                    if (formationsTimeoutRef.current) {
                      clearTimeout(formationsTimeoutRef.current);
                      formationsTimeoutRef.current = null;
                    }
                  }}
                  onMouseLeave={handleFormationsMouseLeave}
                >
                  <Link
                    to="/formations"
                    onClick={() => setFormationsDropdownOpen(false)}
                    className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
                  >
                    📚 Toutes les formations
                  </Link>
                  
                  <div className="border-t border-gray-100 my-1"></div>
                  
                  <Link
                    to="/formations/langues"
                    onClick={() => setFormationsDropdownOpen(false)}
                    className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-[#1a56db] hover:bg-blue-50 transition"
                  >
                    🌍 Formations en Langues
                  </Link>
                  
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
                </div>
              )}
            </div>

            <Link to="/actualite" className={`px-3 py-2 rounded-lg text-sm font-medium transition ${isActive("/actualite") ? "text-[#1a56db]" : "text-gray-600 hover:text-[#1a56db]"}`}>
              Actualité
            </Link>
            <Link to="/contact" className={`px-3 py-2 rounded-lg text-sm font-medium transition ${isActive("/contact") ? "text-[#1a56db]" : "text-gray-600 hover:text-[#1a56db]"}`}>
              Contact
            </Link>

            {/* ✅ MENU ADMIN - CORRIGÉ */}
            {user && isAdmin && (
              <div 
                className="relative ml-2"
                onMouseEnter={handleAdminMouseEnter}
                onMouseLeave={handleAdminMouseLeave}
              >
                <button
                  onClick={toggleAdminDropdown}
                  className={`flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium transition ${
                    adminDropdownOpen ? "bg-gray-100 text-[#76c21f]" : "text-gray-600 hover:text-[#76c21f]"
                  }`}
                  aria-expanded={adminDropdownOpen}
                  aria-haspopup="true"
                >
                  <span>⚙️</span>
                  <span>Admin</span>
                  <svg className={`w-4 h-4 transition-transform ${adminDropdownOpen ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                {adminDropdownOpen && (
                  <div 
                    className="absolute right-0 mt-2 w-44 bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden z-50"
                    onMouseEnter={() => {
                      if (adminTimeoutRef.current) {
                        clearTimeout(adminTimeoutRef.current);
                        adminTimeoutRef.current = null;
                      }
                    }}
                    onMouseLeave={handleAdminMouseLeave}
                  >
                    <Link
                      to="/admin"
                      onClick={() => setAdminDropdownOpen(false)}
                      className="flex items-center gap-2 px-4 py-2.5 text-sm transition hover:bg-gray-50"
                    >
                      <span>📚</span> Formations
                    </Link>
                    <Link
                      to="/admin/users"
                      onClick={() => setAdminDropdownOpen(false)}
                      className="flex items-center gap-2 px-4 py-2.5 text-sm transition hover:bg-gray-50"
                    >
                      <span>👥</span> Utilisateurs
                    </Link>
                    <Link
                      to="/admin/statistics"
                      onClick={() => setAdminDropdownOpen(false)}
                      className="flex items-center gap-2 px-4 py-2.5 text-sm transition hover:bg-gray-50"
                    >
                      <span>📊</span> Statistiques
                    </Link>
                  </div>
                )}
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
                  <a 
                    key={index} 
                    href={social.url} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="transition hover:scale-110" 
                    title={social.name}
                  >
                    {social.icon}
                  </a>
                ))}
              </div>
              <div className="w-px h-5 bg-gray-300"></div>
              {!user ? (
                <Link to="/connexion" className="px-5 py-2 rounded-full text-sm font-medium text-white bg-gradient-to-r from-[#1a56db] via-[#1a56db] to-[#76c21f]">
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

      {/* MENU MOBILE */}
      {menuOpen && (
        <div className="md:hidden border-t bg-white shadow-lg">
          <div className="px-4 py-4 flex flex-col gap-1">
            <Link onClick={toggleMenu} to="/" className="px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-50">🏠 Accueil</Link>
            <Link onClick={toggleMenu} to="/a-propos" className="px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-50">ℹ️ À propos</Link>
            
            <Link onClick={toggleMenu} to="/formations" className="px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-50">📚 Toutes les formations</Link>
            
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

            {user && isAdmin && (
              <>
                <div className="h-px bg-gray-100 my-2"></div>
                <div className="text-[#76c21f] font-medium px-3 py-1 text-sm">⚙️ Administration</div>
                <Link onClick={toggleMenu} to="/admin" className="px-6 py-2 rounded-lg text-gray-700 hover:bg-gray-50 text-sm">📚 Formations</Link>
                <Link onClick={toggleMenu} to="/admin/users" className="px-6 py-2 rounded-lg text-gray-700 hover:bg-gray-50 text-sm">👥 Utilisateurs</Link>
                <Link onClick={toggleMenu} to="/admin/statistics" className="px-6 py-2 rounded-lg text-gray-700 hover:bg-gray-50 text-sm">📊 Statistiques</Link>
              </>
            )}

            {user && !isAdmin && userType === "formateur" && isApproved && (
              <Link onClick={toggleMenu} to="/espace-formateur" className="px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-50">👨‍🏫 Espace Formateur</Link>
            )}

            {user && !isAdmin && userType === "participant" && isApproved && (
              <Link onClick={toggleMenu} to="/espace-participant" className="px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-50">👨‍🎓 Mon espace</Link>
            )}

            <div className="flex gap-4 justify-center py-3 mt-2">
              {socialLinks.map((social, index) => (
                <a key={index} href={social.url} target="_blank" rel="noopener noreferrer" className="transition hover:scale-110">
                  {social.icon}
                </a>
              ))}
            </div>

            {!user ? (
              <Link onClick={toggleMenu} to="/connexion" className="mt-2 px-3 py-2 text-white rounded-full text-center text-sm font-medium bg-gradient-to-r from-[#1a56db] via-[#1a56db] to-[#76c21f]">
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
        </div>
      )}
    </header>
  );
}