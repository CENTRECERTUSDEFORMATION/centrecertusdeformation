// frontend/src/pages/Formations.jsx
import React, { useEffect, useState, useCallback } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../supabaseClient";
import { supabaseSelect, supabaseInsert } from "../supabaseFetch";
import { toast } from "react-toastify";
import { motion, AnimatePresence } from "framer-motion";
import emailjs from "@emailjs/browser";
import { Helmet } from "react-helmet-async";
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination, Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';
import Footer from "../components/Footer";
import ModalInscriptionDemande from "../components/ModalInscriptionDemande";
import { normalizeString } from "../utils/stringUtils";

// Configuration EmailJS
const EMAILJS_CONFIG = {
  PUBLIC_KEY: "LNbKohuUxse3qtZjG",
  SERVICE_ID: "service_ixutrbl",
  TEMPLATE_ID: "template_5iq0uco"
};

// Configuration Supabase directe
const SUPABASE_URL = 'https://rdttnpdjeuteeuwvggai.supabase.co';
const SUPABASE_KEY = 'sb_publishable__KLqCBiq6w5S-4jhoR2bYQ_HB8IVPpT';

// Définition des 7 thèmes
const THEMES = [
  { id: "digital", name: "Digital & Web", icon: "💻", description: "Développement web, marketing digital, e-commerce" },
  { id: "data", name: "Data & IA", icon: "📊", description: "Science des données, intelligence artificielle, Python" },
  { id: "design", name: "Design & Créativité", icon: "🎨", description: "UI/UX design, graphisme, motion design" },
  { id: "management", name: "Management & Leadership", icon: "📈", description: "Gestion d'équipe, project management, soft skills" },
  { id: "finance", name: "Finance & Comptabilité", icon: "💰", description: "Gestion financière, comptabilité, audit" },
  { id: "energie", name: "Énergies renouvelables", icon: "🌱", description: "Développement durable, green tech, photovoltaïque" },
  { id: "langues", name: "Langues & Communication", icon: "🗣️", description: "Anglais, Allemand, Français des affaires, TOEIC/IELTS" }
];

// ============ FORMATIONS STATIQUES (Langues) - Version corrigée ============
const STATIC_FORMATIONS = [
  {
    id: "allemand-static",
    staticId: "allemand",
    title: "Allemand - Certifications Goethe & ÖSD",
    fullTitle: "Formation Allemand - Certifications Goethe & ÖSD",
    description: "Cours d'allemand A1 à B1. Préparez les examens Goethe et ÖSD. Présentiel ou à distance.",
    theme: "langues",
    duration: "60h (A1) / 100h (B1)",
    is_online: true,
    onDemand: true,
    images: [],
    staticPath: "/formation-allemand-monastir",
    isStatic: true,
    staticIcon: "🇩🇪",
    searchTitle: "Allemand",
    shortDescription: "Apprenez l'allemand avec des formateurs natifs. Certifications Goethe et ÖSD reconnues internationalement."
  },
  {
    id: "anglais-static",
    staticId: "anglais",
    title: "Anglais - TOEIC & IELTS",
    fullTitle: "Formation Anglais - TOEIC & IELTS",
    description: "Cours d'anglais A1 à C1. Préparez le TOEIC et l'IELTS. Présentiel ou à distance.",
    theme: "langues",
    duration: "60h à 120h",
    is_online: true,
    onDemand: true,
    images: [],
    staticPath: "/formation-anglais-monastir",
    isStatic: true,
    staticIcon: "🇬🇧",
    searchTitle: "Anglais",
    shortDescription: "Maîtrisez l'anglais pour booster votre carrière. Cours A1 à C1, préparation TOEIC/IELTS."
  },
  {
    id: "espagnol-static",
    staticId: "espagnol",
    title: "Espagnol - DELE",
    fullTitle: "Formation Espagnol - DELE",
    description: "Cours d'espagnol A1 à B1. Préparez les examens DELE. Présentiel ou à distance.",
    theme: "langues",
    duration: "60h à 100h",
    is_online: true,
    onDemand: true,
    images: [],
    staticPath: "/formation-espagnol-monastir",
    isStatic: true,
    staticIcon: "🇪🇸",
    searchTitle: "Espagnol",
    shortDescription: "Apprenez l'espagnol et ouvrez-vous au monde hispanophone. Cours A1 à B1, préparation DELE."
  },
  {
    id: "francais-static",
    staticId: "francais",
    title: "Français - DELF & DALF",
    fullTitle: "Formation Français - DELF & DALF",
    description: "Cours de français A1 à B2. Préparez le DELF et le DALF. Présentiel ou à distance.",
    theme: "langues",
    duration: "60h à 100h",
    is_online: false,
    onDemand: true,
    images: [],
    staticPath: "/formation-francais-monastir",
    isStatic: true,
    staticIcon: "🇫🇷",
    searchTitle: "Francais",
    shortDescription: "Envisagez de gagner en confiance en français ? Notre session Français B1 pour adultes démarre bientôt."
  },
  {
    id: "italien-static",
    staticId: "italien",
    title: "Italien - CELI & PLIDA",
    fullTitle: "Formation Italien - CELI & PLIDA",
    description: "Cours d'italien A1 à B2. Préparez les examens CELI et PLIDA. Présentiel ou à distance.",
    theme: "langues",
    duration: "60h à 120h",
    is_online: true,
    onDemand: true,
    images: [],
    staticPath: "/formation-italien-monastir",
    isStatic: true,
    staticIcon: "🇮🇹",
    searchTitle: "Italien",
    shortDescription: "Apprenez l'italien avec des formateurs natifs. Certifications CELI et PLIDA reconnues."
  }
];

// ✅ IDs des formations dynamiques à exclure (langues)
const EXCLUDED_LANGUE_IDS = [
  'f1111111-1111-1111-1111-111111111111',
  'f2222222-2222-2222-2222-222222222222',
  'f3333333-3333-3333-3333-333333333333',
  'f4444444-4444-4444-4444-444444444444',
  'f5555555-5555-5555-5555-555555555555'
];

// Liste complète des gouvernorats de Tunisie (24)
const TUNISIAN_GOVERNORATES = [
  "Tunis", "Ariana", "Ben Arous", "Manouba", "Nabeul", "Zaghouan", "Bizerte", "Béja",
  "Jendouba", "Le Kef", "Siliana", "Sousse", "Monastir", "Mahdia", "Sfax", "Kairouan",
  "Kasserine", "Sidi Bouzid", "Gabès", "Médenine", "Tataouine", "Gafsa", "Tozeur", "Kébili"
];

// Témoignages
const testimonials = [
  { name: "Sahar Fredj", role: "Stagiaire", text: "Je suis venue de Monastir pour suivre la formation Pack Assistante de direction, qui comprend la comptabilité sur Sage. Une excellente expérience !", rating: 5, date: "2026-05-11" },
  { name: "Ines Fahem", role: "Stagiaire", text: "J'ai fait la formation Assistante de direction au centre certus à Monastir. Comptabilité sur SAGE, très professionnel !", rating: 5, date: "2026-05-11" },
  { name: "Rihem Mezrigui", role: "Stagiaire", text: "Je suis venue de Jendouba pour suivre la formation Allemand au Centre Certus à Monastir. Formation de qualité, je recommande !", rating: 5, date: "2026-05-11" },
  { name: "Najla Chtioui", role: "Stagiaire", text: "Un grand merci au Centre Certus de Formation ! Des professionnels à l'écoute et des formations de qualité.", rating: 5, date: "2025-12-01" },
  { name: "Sana Mansour Ezzine", role: "Stagiaire", text: "Des formations très adaptées à mes besoins surtout dans les spécificités soft Skills, photographie, les langues.", rating: 5, date: "2023-10-09" },
  { name: "Houda Mansour Chtioui", role: "Stagiaire", text: "J'ai suivi la formation en photographie dans le centre Certus. Le formateur était très pro, malgré la difficulté de la matière.", rating: 5, date: "2023-10-02" },
  { name: "Nawres Mansour", role: "Stagiaire", text: "Les formations sont très professionnelles et de qualité. L'administration est à l'écoute et super gentille. Je recommande vivement 👍", rating: 5, date: "2023-10-02" },
  { name: "Chtioui Malek", role: "Stagiaire", text: "Excellent centre de formation, je recommande vivement !", rating: 5, date: "2023-10-02" },
  { name: "Hatem Ben Amor", role: "Stagiaire", text: "Centre Certus bon accueil, top organisation, personnels pro et aidants. Diplôme certifié et reconnu.", rating: 5, date: "2023-10-02" },
  { name: "Belsem Mansour", role: "Stagiaire", text: "Excellent centre de formation, ils sont très professionnels. J'ai suivi des cours d'anglais, les propriétaires sont très à l'écoute.", rating: 5, date: "2023-10-02" },
  { name: "Ilyes Elwaer", role: "Stagiaire", text: "Très bonne expérience, formation de qualité !", rating: 5, date: "2019-07-02" },
  { name: "Haithem Khadraoui", role: "Stagiaire", text: "Centre sérieux et professionnel, je recommande.", rating: 5, date: "2018-03-30" },
  { name: "Moez Chargui", role: "Stagiaire", text: "Formation de qualité avec des formateurs compétents.", rating: 5, date: "2018-02-22" },
  { name: "Mariem Aouissaoui", role: "Stagiaire", text: "Formation au top ! J'ai beaucoup appris merci. Votre accompagnement et votre bienveillance m'ont beaucoup aidée.", rating: 5, date: "2026-04-29" },
  { name: "Latifa Touzi", role: "Designer", text: "I learned graphic design and photography in this center and I really recommend it ❤️❤️", rating: 5, date: "2026-04-28" },
  { name: "Sabrine Chalbi", role: "Designer Graphique", text: "Un grand merci au centre certus pour sa belle expérience. J'étudie 2 pack de design graphique et assistant manager.", rating: 5, date: "2026-04-27" },
  { name: "Marwa Bacha", role: "Stagiaire", text: "Votre accompagnement et votre bienveillance m'ont beaucoup aidée. Merci de tout cœur.", rating: 5, date: "2026-04-26" },
  { name: "Ahmed Ben Slimane", role: "Développeur Web", text: "Excellente formation ! Les formateurs sont très compétents.", rating: 5, date: "2026-04-25" },
  { name: "Nour Chaker", role: "Chef de projet", text: "Une expérience enrichissante avec des professionnels passionnés.", rating: 5, date: "2026-04-24" },
  { name: "Kamel Jlassi", role: "Manager", text: "Formation très professionnelle, je recommande vivement Certus.", rating: 5, date: "2026-04-20" },
  { name: "Olfa Ben Ahmed", role: "Consultante", text: "Une équipe à l'écoute et des formations de qualité. Merci Certus !", rating: 5, date: "2026-04-15" },
  { name: "Mohamed Ali Hammami", role: "Ingénieur", text: "Formation en Data IA très complète. Je recommande !", rating: 5, date: "2026-04-10" },
];

// Partenaires
const partners = [
  { name: "GRAVIC Tunitec", logo: "/logo_references/gravictunitec_logo.jpg" },
  { name: "Thyna Petroleum Services", logo: "/logo_references/tps.jpg" },
  { name: "BETI Moknine", logo: "/logo_references/beti-moknine.png" },
  { name: "Mauritania Airlines", logo: "/logo_references/mauritainia-airlines.png" },
  { name: "POLYCLINIQUE OKBA", logo: "/logo_references/polyclinique-okba.jpg" },
  { name: "DRÄXLMAIER Tunisie", logo: "/logo_references/draexelmaier.png" },
  { name: "Agil", logo: "/logo_references/Agil_Logo.gif" },
  { name: "SARTEX Monastir", logo: "/logo_references/sartex.png" },
  { name: "ALSICO Tunisia", logo: "/logo_references/alsico.jpg" },
  { name: "Smiths Interconnect", logo: "/logo_references/smith.jpg" },
  { name: "ENIM", logo: "/logo_references/enim.jpg" },
  { name: "ENET'Com Sfax", logo: "/logo_references/enetcom.jpg" },
  { name: "ENIS Sfax", logo: "/logo_references/enis-logo.jpg" },
  { name: "FDSPS Sousse", logo: "/logo_references/fdsps.jpg" },
  { name: "STE CONNECT", logo: "/logo_references/Ste-Connect-Sound-Light-Vision.jpg" },
  { name: "Modern Metal", logo: "/logo_references/modern-metal.jpg" },
];

export default function Formations() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { isAdmin, user } = useAuth();

  const [dbFormations, setDbFormations] = useState([]);
  const [allFormations, setAllFormations] = useState([]);
  const [filteredFormations, setFilteredFormations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTheme, setSelectedTheme] = useState("all");
  const [hoveredCard, setHoveredCard] = useState(null);
  const [showDevisModal, setShowDevisModal] = useState(false);
  const [randomTestimonials, setRandomTestimonials] = useState([]);
  const [showInscriptionDemandeModal, setShowInscriptionDemandeModal] = useState(false);
  const [selectedFormation, setSelectedFormation] = useState(null);
  const [inscriptionLoading, setInscriptionLoading] = useState(false);
  const [devisData, setDevisData] = useState({
    name: "", email: "", telephone: "", city: "", country: "", formation: "",
    hebergement: "non", hebergementType: "", visaAssistance: "non", source: "", message: ""
  });
  const [sendingDevis, setSendingDevis] = useState(false);

  const handleNavigateToAdd = useCallback(() => {
    navigate("/ajouter-formation");
  }, [navigate]);

  const handleNavigateToEdit = useCallback((id) => {
    navigate(`/modifier-formation/${id}`);
  }, [navigate]);

  const handleNavigateToDetail = useCallback((id) => {
    const staticFormation = STATIC_FORMATIONS.find(f => f.id === id);
    if (staticFormation) {
      navigate(staticFormation.staticPath);
    } else {
      navigate(`/formations/${id}`);
    }
  }, [navigate]);

  useEffect(() => {
    emailjs.init(EMAILJS_CONFIG.PUBLIC_KEY);
    const shuffled = [...testimonials].sort(() => 0.5 - Math.random());
    setRandomTestimonials(shuffled);
  }, []);

  // Charger toutes les formations avec fetch direct
  useEffect(() => {
    const fetchFormations = async () => {
      setLoading(true);
      try {
        const response = await fetch(
          `${SUPABASE_URL}/rest/v1/formations?select=*&order=created_at.desc`,
          {
            headers: {
              'apikey': SUPABASE_KEY,
              'Authorization': `Bearer ${SUPABASE_KEY}`
            }
          }
        );
        
        if (!response.ok) {
          throw new Error(`Erreur HTTP: ${response.status}`);
        }
        
        const data = await response.json();
        setDbFormations(data || []);
        
        // ✅ Filtrer les doublons et les formations mal rendues
        const filteredData = data.filter(f => {
          // Ignorer les formations "échecs" ou placeholders
          if (f.title && (f.title.includes("échecs") || f.title.includes("echecs") || f.title.includes("Certus De Formation"))) {
            return false;
          }
          
          if (f.theme !== 'langues') return true;
          if (EXCLUDED_LANGUE_IDS.includes(f.id)) return false;
          
          const staticIds = new Set(STATIC_FORMATIONS.map(s => s.staticId.toLowerCase()));
          const normalizedTitle = normalizeString(f.title || '');
          for (const staticId of staticIds) {
            if (normalizedTitle.includes(staticId.toLowerCase())) {
              return false;
            }
          }
          return true;
        });
        
        const combined = [...filteredData, ...STATIC_FORMATIONS];
        setAllFormations(combined);
        setFilteredFormations(combined);
        
        const themeParam = searchParams.get('theme');
        if (themeParam) {
          setSelectedTheme(themeParam);
        }
      } catch (error) {
        console.error("Erreur chargement formations:", error);
        toast.error("Erreur chargement formations");
        setDbFormations([]);
        setAllFormations(STATIC_FORMATIONS);
        setFilteredFormations(STATIC_FORMATIONS);
      } finally {
        setLoading(false);
      }
    };
    fetchFormations();
  }, [searchParams]);

  const searchInFormation = (formation, searchLower) => {
    if (!searchLower) return true;
    
    const searchableFields = [
      formation.title,
      formation.fullTitle,
      formation.shortDescription,
      formation.description,
      formation.theme ? THEMES.find(t => t.id === formation.theme)?.name : null,
      formation.duration,
      formation.price,
      formation.langue
    ];
    
    const themeInfo = THEMES.find(t => t.id === formation.theme);
    if (themeInfo) {
      searchableFields.push(themeInfo.name);
      searchableFields.push(themeInfo.description);
    }
    
    return searchableFields.some(field => 
      field && String(field).toLowerCase().includes(searchLower)
    );
  };

  useEffect(() => {
    let filtered = [...allFormations];
    
    if (searchTerm !== "") {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(formation => searchInFormation(formation, searchLower));
    }
    
    if (selectedTheme !== "all") {
      filtered = filtered.filter((f) => f.theme === selectedTheme);
    }
    
    setFilteredFormations(filtered);
  }, [searchTerm, selectedTheme, allFormations]);

  const updateFormationTheme = useCallback(async (formationId, newTheme) => {
    if (!isAdmin) return;
    
    const staticFormation = STATIC_FORMATIONS.find(f => f.id === formationId);
    if (staticFormation) {
      toast.info("Cette formation est statique, son thème ne peut pas être modifié.");
      return;
    }
    
    try {
      const response = await fetch(
        `${SUPABASE_URL}/rest/v1/formations?formation_id=eq.${formationId}`,
        {
          method: 'PATCH',
          headers: {
            'apikey': SUPABASE_KEY,
            'Authorization': `Bearer ${SUPABASE_KEY}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ theme: newTheme })
        }
      );

      if (!response.ok) throw new Error("Erreur mise à jour");

      setDbFormations(prev => prev.map(f => 
        f.id === formationId ? { ...f, theme: newTheme } : f
      ));
      
      setAllFormations(prev => prev.map(f => 
        f.id === formationId ? { ...f, theme: newTheme } : f
      ));
      
      toast.success(`Thème mis à jour : ${THEMES.find(t => t.id === newTheme)?.name}`);
    } catch (error) {
      console.error(error);
      toast.error("Erreur lors de la mise à jour");
    }
  }, [isAdmin]);

  const getImageUrl = (path) => {
    if (!path) return null;
    return `${SUPABASE_URL}/storage/v1/object/public/uploads/${path}`;
  };

  const handleDelete = useCallback(async (id, imagesPaths) => {
    if (!isAdmin) return;
    
    const staticFormation = STATIC_FORMATIONS.find(f => f.id === id);
    if (staticFormation) {
      toast.info("Cette formation est statique et ne peut pas être supprimée.");
      return;
    }
    
    if (!window.confirm("Supprimer définitivement cette formation ?")) return;
    
    try {
      const response = await fetch(
        `${SUPABASE_URL}/rest/v1/formations?id=eq.${id}`,
        {
          method: 'DELETE',
          headers: {
            'apikey': SUPABASE_KEY,
            'Authorization': `Bearer ${SUPABASE_KEY}`
          }
        }
      );

      if (!response.ok) throw new Error("Erreur suppression");
      
      setDbFormations((prev) => prev.filter((f) => f.id !== id));
      setAllFormations((prev) => prev.filter((f) => f.id !== id));
      toast.success("Formation supprimée");
    } catch (error) {
      console.error(error);
      toast.error("Erreur lors de la suppression");
    }
  }, [isAdmin]);

  const handleDevisChange = useCallback((e) => {
    setDevisData({ ...devisData, [e.target.name]: e.target.value });
  }, [devisData]);

  const sendDevis = useCallback(async (e) => {
    e.preventDefault();
    setSendingDevis(true);
    try {
      const templateParams = {
        name: devisData.name,
        email: devisData.email,
        telephone: devisData.telephone,
        city: devisData.city || "Non renseignée",
        country: devisData.country,
        formation: devisData.formation,
        hebergement: devisData.hebergement,
        hebergementType: devisData.hebergementType || "Non renseigné",
        visaAssistance: devisData.visaAssistance || "Non",
        source: devisData.source || "Non renseignée",
        message: devisData.message,
        date: new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
      };
      const response = await emailjs.send(EMAILJS_CONFIG.SERVICE_ID, EMAILJS_CONFIG.TEMPLATE_ID, templateParams);
      if (response.status === 200) {
        toast.success("Demande de devis envoyée avec succès !");
        setShowDevisModal(false);
        setDevisData({
          name: "", email: "", telephone: "", city: "", country: "", formation: "",
          hebergement: "non", hebergementType: "", visaAssistance: "non", source: "", message: ""
        });
      }
    } catch (error) {
      console.error(error);
      toast.error("Erreur lors de l'envoi");
    } finally {
      setSendingDevis(false);
    }
  }, [devisData]);

  const handleInscriptionEnLigne = useCallback(async (formation) => {
    if (formation.isStatic) {
      navigate("/inscription");
      return;
    }
    
    setInscriptionLoading(true);
    try {
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      
      if (!currentUser) {
        const redirectUrl = `/confirm-inscription?formation=${formation.id}`;
        navigate(`/inscription?redirect=${encodeURIComponent(redirectUrl)}`);
        return;
      }

      const existing = await supabaseSelect("inscriptions", `user_id=eq.${currentUser.id}&formation_id=eq.${formation.id}`);

      if (existing && existing.length > 0) {
        const statut = existing[0].statut;
        if (statut === "en_attente") {
          toast.info("⏳ Votre inscription est déjà en attente de validation");
        } else if (statut === "confirme") {
          toast.success("✅ Vous êtes déjà inscrit à cette formation");
        }
        return;
      }

      await supabaseInsert("inscriptions", {
        user_id: currentUser.id,
        formation_id: formation.id,
        statut: "en_attente",
        created_at: new Date().toISOString()
      });

      toast.success("✅ Inscription enregistrée ! En attente de validation.");
      navigate("/espace-participant");
    } catch (err) {
      console.error(err);
      toast.error("❌ Erreur lors de l'inscription");
    } finally {
      setInscriptionLoading(false);
    }
  }, [navigate]);

  const handleInscriptionDemande = useCallback((formation) => {
    setSelectedFormation(formation);
    setShowInscriptionDemandeModal(true);
  }, []);

  const scrollToFormations = useCallback(() => {
    const element = document.getElementById('formations-list');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  }, []);

  const activeFormationsCount = allFormations.length;
  const satisfactionRate = "4.9";
  const totalTestimonials = testimonials.length;
  const positiveTestimonials = testimonials.filter(t => t.rating >= 4).length;
  const recommendationRate = Math.round((positiveTestimonials / totalTestimonials) * 100);

  const getOGImage = () => {
    if (allFormations.length > 0 && allFormations[0]?.images?.[0]) {
      return getImageUrl(allFormations[0].images[0]);
    }
    return "https://centrecertusdeformation.tn/logo-certus.webp";
  };

  const getPageTitle = () => {
    if (selectedTheme !== "all") {
      const theme = THEMES.find(t => t.id === selectedTheme);
      return `Formation ${theme?.name} à Monastir | Centre Certus de Formation`;
    }
    return "Toutes nos formations certifiantes à Monastir | Centre Certus";
  };

  const getPageDescription = () => {
    if (selectedTheme !== "all") {
      const theme = THEMES.find(t => t.id === selectedTheme);
      return `Découvrez nos formations en ${theme?.name} à Monastir. Programmes certifiants, formateurs experts. Cours en présentiel ou à distance. Inscription ouverte.`;
    }
    return "Centre Certus de Formation à Monastir : formations certifiantes en Digital, Data, Design, Management, Finance, Énergies renouvelables et Langues. +5000 apprenants formés.";
  };

  if (loading) return (
    <div className="flex justify-center items-center h-96 pt-20">
      <div className="w-12 h-12 border-3 border-[#76c21f] border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const getThemeCount = (themeId) => {
    return allFormations.filter(f => f.theme === themeId).length;
  };

  // Fonction pour obtenir l'icône de formation
  const getFormationIcon = (formation) => {
    if (formation.staticIcon) return formation.staticIcon;
    if (formation.theme === 'langues') return '🗣️';
    if (formation.theme === 'digital') return '💻';
    if (formation.theme === 'data') return '📊';
    if (formation.theme === 'design') return '🎨';
    if (formation.theme === 'management') return '📈';
    if (formation.theme === 'finance') return '💰';
    if (formation.theme === 'energie') return '🌱';
    return '📚';
  };

  return (
    <>
      <Helmet>
        <html lang="fr" />
        <title>{getPageTitle()}</title>
        <meta name="description" content={getPageDescription()} />
        <meta name="keywords" content="formation Monastir, centre de formation, formation professionnelle, Certus, formation digitale, formation data, formation langues" />
        <link rel="canonical" href={`https://centrecertusdeformation.tn/formations${selectedTheme !== "all" ? `?theme=${selectedTheme}` : ""}`} />
        <meta property="og:title" content={getPageTitle()} />
        <meta property="og:description" content={getPageDescription()} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={`https://centrecertusdeformation.tn/formations`} />
        <meta property="og:image" content={getOGImage()} />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={getPageTitle()} />
        <meta name="twitter:description" content={getPageDescription()} />
        <meta name="twitter:image" content={getOGImage()} />
      </Helmet>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 pt-20">
        
        {/* SECTION HERO */}
        <div className="relative bg-gradient-to-r from-[#1a56db] via-[#1a56db] to-[#76c21f] text-white overflow-hidden">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="relative z-20 max-w-7xl mx-auto px-6 py-16 lg:py-20">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-1.5 text-sm mb-6">
              <span>🏆</span>
              <span>Certification reconnue</span>
            </motion.div>
            <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 leading-tight">
              Investissez dans votre<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-yellow-100">avenir professionnel</span>
            </motion.h1>
            <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="text-xl md:text-2xl text-blue-100 mb-8 max-w-2xl">
              Des formations certifiantes pour booster votre carrière
            </motion.p>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="flex flex-wrap gap-6 mb-8">
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2">
                <span className="text-2xl">📚</span>
                <div><div className="font-bold">{activeFormationsCount}</div><div className="text-xs text-blue-200">Formations</div></div>
              </div>
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2">
                <span className="text-2xl">👨‍🎓</span>
                <div><div className="font-bold">5000+</div><div className="text-xs text-blue-200">Apprenants</div></div>
              </div>
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2">
                <span className="text-2xl">⭐</span>
                <div><div className="font-bold">{satisfactionRate}/5</div><div className="text-xs text-blue-200">Satisfaction</div></div>
              </div>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="flex flex-wrap gap-4 relative z-30">
              <button onClick={scrollToFormations} className="bg-white text-[#1a56db] px-8 py-3 rounded-xl font-semibold hover:shadow-lg transition-all hover:scale-105 flex items-center gap-2 cursor-pointer pointer-events-auto" type="button">
                Découvrir nos formations
              </button>
              <button onClick={() => setShowDevisModal(true)} className="border-2 border-white text-white px-8 py-3 rounded-xl font-semibold hover:bg-white/10 transition-all hover:scale-105 cursor-pointer pointer-events-auto" type="button">
                Obtenir un devis
              </button>
            </motion.div>
          </div>
          <div className="absolute bottom-0 left-0 right-0 z-10 pointer-events-none">
            <svg viewBox="0 0 1440 120" className="w-full h-auto" fill="currentColor" style={{ color: '#f8fafc' }}>
              <path d="M0,64L80,58.7C160,53,320,43,480,48C640,53,800,75,960,80C1120,85,1280,75,1360,69.3L1440,64L1440,120L1360,120C1280,120,1120,120,960,120C800,120,640,120,480,120C320,120,160,120,80,120L0,120Z"></path>
            </svg>
          </div>
        </div>

        {/* SECTION GÉOGRAPHIQUE */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-6 py-6">
            <div className="flex flex-col md:flex-row gap-6 items-start">
              <div className="flex-1">
                <h2 className="text-xl font-bold text-gray-800 mb-2">Accessible depuis toute la Tunisie</h2>
                <div className="flex flex-wrap gap-2 mt-3">
                  {TUNISIAN_GOVERNORATES.map((city, i) => (<span key={i} className="bg-gray-100 px-3 py-1 rounded-full text-xs shadow-sm">{city}</span>))}
                </div>
                <p className="text-gray-500 text-xs mt-2">Formation à distance possible pour les apprenants internationaux</p>
              </div>
              <div className="bg-blue-50 p-4 rounded-xl">
                <h3 className="font-bold text-blue-800 text-sm">Hébergement possible</h3>
                <p className="text-xs text-gray-600 mt-1">Pour les apprenants venant de loin, nous proposons des solutions d'hébergement à Monastir.</p>
              </div>
            </div>
          </div>
        </div>

        {/* 7 BOUTONS PAR THÈME */}
        <div className="bg-white border-b border-gray-200 sticky top-16 z-10">
          <div className="max-w-7xl mx-auto px-6 py-3">
            <div className="flex flex-wrap gap-2 justify-center">
              <button onClick={() => setSelectedTheme("all")} className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${selectedTheme === "all" ? "bg-[#1a56db] text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>Toutes ({allFormations.length})</button>
              {THEMES.map((theme) => {
                const count = getThemeCount(theme.id);
                return (
                  <button key={theme.id} onClick={() => setSelectedTheme(theme.id)} className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${selectedTheme === theme.id ? "bg-[#1a56db] text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
                    {theme.icon} {theme.name} ({count})
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* BARRE DE RECHERCHE */}
        <div className="sticky top-24 z-10 bg-white/95 backdrop-blur-sm shadow-sm border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-6 py-3">
            <div className="relative max-w-md mx-auto">
              <input 
                type="text" 
                placeholder="Rechercher par titre, description, thème, durée, prix, langue..." 
                className="w-full border border-gray-300 rounded-xl px-4 py-2 pl-10 focus:outline-none focus:ring-2 focus:ring-[#1a56db]" 
                value={searchTerm} 
                onChange={(e) => setSearchTerm(e.target.value)} 
                aria-label="Rechercher une formation"
              />
              <svg className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            </div>
            <p className="text-center text-sm text-gray-500 mt-2">{filteredFormations.length} formation(s) trouvée(s)</p>
            
            {isAdmin && (
              <div className="text-center mt-3">
                <button onClick={handleNavigateToAdd} className="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-lg text-sm font-semibold transition-all shadow-md hover:shadow-lg inline-flex items-center gap-2">
                  <span>➕</span> Ajouter une formation
                </button>
              </div>
            )}
          </div>
        </div>

        {/* LISTE DES FORMATIONS - Version optimisée */}
        <div id="formations-list" className="max-w-7xl mx-auto px-6 py-12">
          {filteredFormations.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-2xl shadow-sm">
              <div className="text-6xl mb-4">📚</div>
              <h3 className="text-xl font-semibold text-gray-700">Aucune formation trouvée</h3>
              <p className="text-gray-500">Essayez de modifier votre recherche</p>
              {isAdmin && (
                <button onClick={handleNavigateToAdd} className="mt-4 bg-green-600 text-white px-4 py-2 rounded-lg">+ Ajouter une formation</button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredFormations.map((formation, index) => {
                const isStatic = formation.isStatic || false;
                const themeInfo = THEMES.find(t => t.id === formation.theme);
                
                // Obtenir l'icône de formation
                const formationIcon = getFormationIcon(formation);
                
                // Titre affiché (court pour les cartes)
                const displayTitle = formation.fullTitle || formation.title || "Formation";
                
                // Description courte
                const displayDescription = formation.shortDescription || formation.description || "Formation certifiante proposée par le Centre Certus";
                
                const getDirectStaticImage = () => {
                  if (!isStatic) return null;
                  const found = dbFormations.find(f => {
                    const normalizedTitle = normalizeString(f.title || '');
                    const normalizedSearch = normalizeString(formation.searchTitle || '');
                    return normalizedTitle.includes(normalizedSearch);
                  });
                  if (found?.images?.length > 0) {
                    return getImageUrl(found.images[0]);
                  }
                  return null;
                };
                
                const staticImage = getDirectStaticImage();
                
                return (
                  <motion.div
                    key={formation.id}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.4, delay: index * 0.05 }}
                    whileHover={{ y: -8 }}
                    onHoverStart={() => setHoveredCard(formation.id)}
                    onHoverEnd={() => setHoveredCard(null)}
                    className="group bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 flex flex-col"
                  >
                    {/* Image */}
                    <div 
                      className="relative h-40 overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 cursor-pointer" 
                      onClick={() => handleNavigateToDetail(formation.id)}
                    >
                      {isStatic ? (
                        staticImage ? (
                          <img 
                            src={staticImage} 
                            alt={displayTitle}
                            className="w-full h-full object-contain hover:scale-105 transition duration-300"
                            loading="lazy"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50">
                            <span className="text-5xl">{formationIcon}</span>
                          </div>
                        )
                      ) : formation.images && formation.images.length > 0 ? (
                        <motion.img 
                          animate={{ scale: hoveredCard === formation.id ? 1.05 : 1 }} 
                          transition={{ duration: 0.3 }} 
                          src={getImageUrl(formation.images[0])} 
                          alt={displayTitle} 
                          width="400" 
                          height="300" 
                          loading="lazy" 
                          className="w-full h-full object-cover" 
                          onError={(e) => e.target.src = "https://placehold.co/400x300?text=" + encodeURIComponent(formationIcon)} 
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-5xl bg-gradient-to-br from-blue-50 to-indigo-50">
                          {formationIcon}
                        </div>
                      )}
                      
                      {/* Badges en haut */}
                      <div className="absolute top-3 right-3 flex flex-col gap-1 items-end">
                        {formation.is_online === true && (
                          <span className="bg-gradient-to-r from-blue-500 to-blue-600 text-white text-xs px-3 py-1 rounded-full shadow-md">
                            En ligne
                          </span>
                        )}
                        {formation.onDemand === true && (
                          <span className="bg-gradient-to-r from-orange-500 to-orange-600 text-white text-xs px-3 py-1 rounded-full shadow-md">
                            Présentiel
                          </span>
                        )}
                      </div>
                      
                      {/* Thème en bas de l'image */}
                      <div className="absolute bottom-3 left-3">
                        <span className="text-xs bg-black/60 text-white px-2 py-0.5 rounded-full backdrop-blur-sm">
                          {themeInfo?.icon || '📚'} {themeInfo?.name || "Formation"}
                        </span>
                      </div>
                      
                      {/* Overlay au survol */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-4">
                        <span className="text-white text-sm font-medium bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">
                          Voir les détails →
                        </span>
                      </div>
                    </div>
                    
                    {/* Contenu */}
                    <div className="p-4 flex-1 flex flex-col">
                      {/* Titre */}
                      <h3 
                        className="font-bold text-base mb-1 line-clamp-2 text-gray-800 cursor-pointer hover:text-[#1a56db] transition" 
                        onClick={() => handleNavigateToDetail(formation.id)}
                      >
                        {displayTitle}
                      </h3>
                      
                      {/* Description courte */}
                      <p className="text-gray-500 text-xs line-clamp-2 mb-3 flex-1">
                        {displayDescription}
                      </p>
                      
                      {/* Durée et prix */}
                      <div className="flex justify-between items-center text-xs text-gray-500 mt-auto pt-2 border-t border-gray-100">
                        {formation.duration && (
                          <span className="flex items-center gap-1">
                            <span>⏱️</span> {formation.duration}
                          </span>
                        )}
                        {formation.price && (
                          <span className="flex items-center gap-1">
                            <span>💰</span> {formation.price}
                          </span>
                        )}
                      </div>

                      {isAdmin && !isStatic && (
                        <div className="space-y-2 mt-3 pt-3 border-t border-gray-100">
                          <div className="flex gap-2">
                            <button onClick={() => handleNavigateToEdit(formation.id)} className="flex-1 text-sm bg-yellow-500 text-white px-2 py-1 rounded-lg hover:bg-yellow-600 transition" aria-label={`Modifier ${displayTitle}`}>
                              Modifier
                            </button>
                            <button onClick={() => handleDelete(formation.id, formation.images)} className="flex-1 text-sm bg-red-500 text-white px-2 py-1 rounded-lg hover:bg-red-600 transition" aria-label={`Supprimer ${displayTitle}`}>
                              Supprimer
                            </button>
                          </div>
                          <div className="flex flex-wrap gap-1">
                            <span className="text-xs text-gray-500 mr-1">Classer :</span>
                            {THEMES.map((theme) => (
                              <button
                                key={theme.id}
                                onClick={() => updateFormationTheme(formation.id, theme.id)}
                                className={`text-xs px-2 py-0.5 rounded-full transition ${formation.theme === theme.id ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
                                title={`Déplacer vers ${theme.name}`}
                                aria-label={`Déplacer vers ${theme.name}`}
                              >
                                {theme.icon}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {isStatic && isAdmin && (
                        <div className="mt-3 pt-3 border-t border-gray-100">
                          <p className="text-xs text-gray-400 text-center">📖 Page dédiée - Contenu statique</p>
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
          
          {/* TEMOIGNAGES */}
          <div className="mt-20 py-12 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl">
            <div className="max-w-6xl mx-auto px-4">
              <div className="text-center mb-10">
                <span className="text-blue-600 font-semibold text-sm uppercase">Avis</span>
                <h2 className="text-3xl md:text-4xl font-bold mt-2 mb-4">Ce que disent nos stagiaires</h2>
                <div className="w-20 h-1 bg-blue-500 mx-auto rounded-full" />
                <div className="inline-flex items-center gap-2 bg-white rounded-full px-6 py-3 mt-6 shadow-md">
                  <span className="text-yellow-400 text-xl">★</span>
                  <span className="font-bold text-gray-800">Recommandé par {recommendationRate}%</span>
                  <span className="text-gray-500">({totalTestimonials} avis)</span>
                </div>
              </div>
              <Swiper 
                spaceBetween={30} 
                slidesPerView={1} 
                breakpoints={{ 768: { slidesPerView: 2 }, 1024: { slidesPerView: 3 } }} 
                autoplay={{ delay: 4000, disableOnInteraction: false }} 
                pagination={{ clickable: true }} 
                navigation={true} 
                modules={[Autoplay, Pagination, Navigation]} 
                className="pb-12"
              >
                {randomTestimonials.map((t, i) => (
                  <SwiperSlide key={i}>
                    <div className="bg-white rounded-2xl shadow-lg p-6 h-full flex flex-col">
                      <div className="flex gap-1 mb-4">{[...Array(t.rating)].map((_, j) => <span key={j} className="text-yellow-400 text-lg">★</span>)}</div>
                      <p className="text-gray-600 text-sm italic mb-4 flex-grow">“{t.text}”</p>
                      <div className="border-t border-gray-100 pt-4 mt-2">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <span className="text-lg font-semibold text-blue-600">{t.name.charAt(0)}</span>
                          </div>
                          <div>
                            <p className="font-bold text-gray-800">{t.name}</p>
                            <p className="text-xs text-gray-500">{t.role}</p>
                          </div>
                        </div>
                        <p className="text-xs text-gray-400 mt-2">{new Date(t.date).toLocaleDateString('fr-FR')}</p>
                      </div>
                    </div>
                  </SwiperSlide>
                ))}
              </Swiper>
            </div>
          </div>

          {/* PARTENAIRES */}
          <div className="mt-16 py-12 overflow-hidden bg-gray-50 rounded-2xl">
            <div className="max-w-7xl mx-auto px-4">
              <div className="text-center mb-10">
                <span className="text-blue-600 font-semibold text-sm uppercase tracking-wider">Partenaires</span>
                <h2 className="text-3xl md:text-4xl font-bold mt-2 mb-4">Ils nous font confiance</h2>
                <div className="w-20 h-1 bg-blue-500 mx-auto rounded-full" />
              </div>
              <Swiper
                modules={[Navigation, Autoplay]}
                spaceBetween={20}
                slidesPerView={2}
                navigation={true}
                autoplay={{ delay: 3000, disableOnInteraction: false }}
                loop={true}
                breakpoints={{
                  480: { slidesPerView: 3 },
                  768: { slidesPerView: 4 },
                  1024: { slidesPerView: 5 },
                  1280: { slidesPerView: 6 }
                }}
                className="partners-swiper"
              >
                {partners.map((partner, i) => (
                  <SwiperSlide key={i}>
                    <div className="flex flex-col items-center justify-center p-4">
                      <div className="h-24 w-24 flex items-center justify-center bg-white rounded-xl shadow-md p-3 hover:shadow-lg transition-shadow duration-300">
                        <img
                          src={partner.logo}
                          alt={`Logo ${partner.name} - Partenaire Certus`}
                          className="max-w-full max-h-full object-contain"
                          loading="lazy"
                          width="80"
                          height="80"
                          onError={(e) => {
                            e.target.style.display = 'none';
                            const parent = e.target.parentElement;
                            if (parent) {
                              parent.innerHTML = '<div class="text-3xl">🏢</div>';
                            }
                          }}
                        />
                      </div>
                      <p className="text-xs text-gray-600 mt-3 text-center font-medium line-clamp-2 max-w-[100px]">
                        {partner.name}
                      </p>
                    </div>
                  </SwiperSlide>
                ))}
              </Swiper>
            </div>
          </div>

          {/* CTA FINAL */}
          <div className="mt-16 py-16 bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl">
            <div className="max-w-4xl mx-auto px-4 text-center">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                Prêt à booster votre carrière ?
              </h2>
              <p className="text-blue-100 mb-8">
                Rejoignez CERTUS dès aujourd'hui et transformez votre avenir professionnel
              </p>
              <div className="flex flex-wrap gap-4 justify-center">
                <button onClick={() => setShowDevisModal(true)} className="px-8 py-3 bg-white text-blue-600 rounded-full font-semibold hover:bg-gray-100 transition-all duration-300 shadow-lg">
                  Demander un devis
                </button>
                <button onClick={scrollToFormations} className="px-8 py-3 border-2 border-white text-white rounded-full font-semibold hover:bg-white/10 transition-all duration-300">
                  Voir les formations
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* MODAL DEVIS */}
        <AnimatePresence>
          {showDevisModal && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 overflow-y-auto" onClick={() => setShowDevisModal(false)}>
              <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="relative max-w-2xl w-full bg-white rounded-2xl shadow-2xl overflow-hidden my-8" onClick={(e) => e.stopPropagation()}>
                <div className="bg-gradient-to-r from-[#1a56db] to-[#76c21f] text-white px-6 py-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <h2 className="text-xl font-bold">Demande de devis</h2>
                      <p className="text-blue-100 text-sm">Nous vous répondrons sous 24h</p>
                    </div>
                    <button onClick={() => setShowDevisModal(false)} className="text-white/80 hover:text-white transition text-2xl" aria-label="Fermer la modal de devis">
                      ✕
                    </button>
                  </div>
                </div>
                <form onSubmit={sendDevis} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="devis-name">Nom complet *</label>
                      <input id="devis-name" type="text" name="name" required value={devisData.name} onChange={handleDevisChange} className="w-full border border-gray-300 rounded-lg px-4 py-2" placeholder="Jean Dupont" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="devis-email">Email *</label>
                      <input id="devis-email" type="email" name="email" required value={devisData.email} onChange={handleDevisChange} className="w-full border border-gray-300 rounded-lg px-4 py-2" placeholder="jean.dupont@email.com" />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="devis-telephone">Téléphone *</label>
                      <input id="devis-telephone" type="tel" name="telephone" required value={devisData.telephone} onChange={handleDevisChange} className="w-full border border-gray-300 rounded-lg px-4 py-2" placeholder="06 12 34 56 78" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="devis-city">Ville</label>
                      <input id="devis-city" type="text" name="city" value={devisData.city} onChange={handleDevisChange} className="w-full border border-gray-300 rounded-lg px-4 py-2" placeholder="Monastir / Tunis / ..." />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="devis-country">Pays d'origine *</label>
                      <select id="devis-country" name="country" required value={devisData.country} onChange={handleDevisChange} className="w-full border border-gray-300 rounded-lg px-4 py-2">
                        <option value="">Sélectionnez</option>
                        <option value="Tunisie">🇹🇳 Tunisie</option>
                        <option value="France">🇫🇷 France</option>
                        <option value="Belgique">🇧🇪 Belgique</option>
                        <option value="Suisse">🇨🇭 Suisse</option>
                        <option value="Canada">🇨🇦 Canada</option>
                        <option value="Autre">🌍 Autre pays</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="devis-formation">Formation souhaitée *</label>
                      <select id="devis-formation" name="formation" required value={devisData.formation} onChange={handleDevisChange} className="w-full border border-gray-300 rounded-lg px-4 py-2">
                        <option value="">Sélectionnez</option>
                        {allFormations.map((f) => (<option key={f.id} value={f.title}>{getFormationIcon(f)} {f.fullTitle || f.title}</option>))}
                        <option value="Autre">Autre formation</option>
                      </select>
                    </div>
                  </div>
                  <div className="border-t border-gray-200 pt-4">
                    <h3 className="font-semibold text-gray-800 mb-3">Hébergement</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="devis-hebergement">Hébergement nécessaire ?</label>
                        <select id="devis-hebergement" name="hebergement" value={devisData.hebergement} onChange={handleDevisChange} className="w-full border border-gray-300 rounded-lg px-4 py-2">
                          <option value="non">Non</option>
                          <option value="oui">Oui, besoin d'un logement</option>
                          <option value="international">Oui (package international)</option>
                        </select>
                      </div>
                      {devisData.hebergement !== "non" && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="devis-hebergement-type">Type d'hébergement</label>
                          <select id="devis-hebergement-type" name="hebergementType" value={devisData.hebergementType} onChange={handleDevisChange} className="w-full border border-gray-300 rounded-lg px-4 py-2">
                            <option value="">Sélectionnez</option>
                            <option value="residence">Résidence étudiante</option>
                            <option value="hotel">Hôtel partenaire</option>
                            <option value="appartement">Appartement meublé</option>
                          </select>
                        </div>
                      )}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="devis-source">Comment avez-vous connu CERTUS ?</label>
                    <select id="devis-source" name="source" value={devisData.source} onChange={handleDevisChange} className="w-full border border-gray-300 rounded-lg px-4 py-2">
                      <option value="">Sélectionnez</option>
                      <option value="google">Google</option>
                      <option value="facebook">Facebook / Instagram</option>
                      <option value="linkedin">LinkedIn</option>
                      <option value="bouche">Bouche à oreille</option>
                      <option value="autre">Autre</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="devis-message">Message / Projet</label>
                    <textarea id="devis-message" name="message" rows="4" value={devisData.message} onChange={handleDevisChange} className="w-full border border-gray-300 rounded-lg px-4 py-2 resize-none" placeholder="Décrivez votre projet..." />
                  </div>
                  <button type="submit" disabled={sendingDevis} className="w-full bg-gradient-to-r from-[#1a56db] to-[#76c21f] text-white py-3 rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50">
                    {sendingDevis ? "Envoi en cours..." : "Envoyer la demande"}
                  </button>
                  <p className="text-xs text-gray-400 text-center">En envoyant ce formulaire, vous acceptez d'être contacté par notre équipe.</p>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* MODAL INSCRIPTION À LA DEMANDE */}
        <ModalInscriptionDemande
          isOpen={showInscriptionDemandeModal}
          onClose={() => setShowInscriptionDemandeModal(false)}
          formation={selectedFormation}
          onSuccess={() => {
            setShowInscriptionDemandeModal(false);
            toast.success("Votre demande a été envoyée ! L'équipe Certus vous contactera.");
          }}
        />

        <Footer />
      </motion.div>
    </>
  );
}