import React, { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-toastify";
import { motion, AnimatePresence } from "framer-motion";
import emailjs from "@emailjs/browser";

// Configuration EmailJS
const EMAILJS_CONFIG = {
  PUBLIC_KEY: "LNbKohuUxse3qtZjG",
  SERVICE_ID: "service_ixutrbl",
  TEMPLATE_ID: "template_5iq0uco"
};

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

// Liste complète des gouvernorats de Tunisie (24)
const TUNISIAN_GOVERNORATES = [
  "Tunis", "Ariana", "Ben Arous", "Manouba", "Nabeul", "Zaghouan", "Bizerte", "Béja",
  "Jendouba", "Le Kef", "Siliana", "Sousse", "Monastir", "Mahdia", "Sfax", "Kairouan",
  "Kasserine", "Sidi Bouzid", "Gabès", "Médenine", "Tataouine", "Gafsa", "Tozeur", "Kébili"
];

// Clients prestigieux
const clients = [
  { name: "Thyna Petroleum Services", logo: "/logo_references/tps.jpg" },
  { name: "GRAVIC Tunitec", logo: "/logo_references/gravictunitec_logo.jpg" },
  { name: "ENIS Sfax", logo: "/logo_references/enis-logo.jpg" },
  { name: "ENET'Com Sfax", logo: "/logo_references/enetcom.jpg" },
  { name: "Modern Metal", logo: "/logo_references/modern-metal.jpg" },
  { name: "STE CONNECT", logo: "/logo_references/Ste-Connect-Sound-Light-Vision.jpg" }
];

export default function Formations() {
  const navigate = useNavigate();
  const { isAdmin } = useAuth();

  const [formations, setFormations] = useState([]);
  const [filteredFormations, setFilteredFormations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTheme, setSelectedTheme] = useState("all");
  const [hoveredCard, setHoveredCard] = useState(null);
  const [showDevisModal, setShowDevisModal] = useState(false);
  const [devisData, setDevisData] = useState({
    name: "", email: "", telephone: "", city: "", country: "", formation: "",
    hebergement: "non", hebergementType: "", visaAssistance: "non", source: "", message: ""
  });
  const [sendingDevis, setSendingDevis] = useState(false);

  useEffect(() => {
    emailjs.init(EMAILJS_CONFIG.PUBLIC_KEY);
  }, []);

  // Charger toutes les formations
  useEffect(() => {
    const fetchFormations = async () => {
      setLoading(true);
      const { data, error } = await supabase.from("formations").select("*").order("created_at", { ascending: false });
      if (error) {
        console.error(error);
        toast.error("Erreur chargement formations");
        setFormations([]);
        setFilteredFormations([]);
      } else {
        console.log("Formations chargées:", data?.length);
        setFormations(data || []);
        setFilteredFormations(data || []);
      }
      setLoading(false);
    };
    fetchFormations();
  }, []);

  // Filtrer par recherche et thème
  useEffect(() => {
    let filtered = [...formations];
    if (searchTerm !== "") {
      filtered = filtered.filter((f) =>
        f.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        f.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    if (selectedTheme !== "all") {
      filtered = filtered.filter((f) => f.theme === selectedTheme);
    }
    setFilteredFormations(filtered);
  }, [searchTerm, selectedTheme, formations]);

  // Mettre à jour le thème d'une formation
  const updateFormationTheme = async (formationId, newTheme) => {
    try {
      const { error } = await supabase
        .from("formations")
        .update({ theme: newTheme })
        .eq("id", formationId);

      if (error) throw error;

      setFormations(prev => prev.map(f => 
        f.id === formationId ? { ...f, theme: newTheme } : f
      ));
      toast.success(`Thème mis à jour : ${THEMES.find(t => t.id === newTheme)?.name}`);
    } catch (error) {
      console.error(error);
      toast.error("Erreur lors de la mise à jour");
    }
  };

  const getImageUrl = (path) => {
    if (!path) return null;
    const { data } = supabase.storage.from("uploads").getPublicUrl(path);
    return data.publicUrl;
  };

  const handleDelete = async (id, imagesPaths) => {
    if (!isAdmin) return;
    if (!window.confirm("Supprimer définitivement cette formation ?")) return;
    
    if (imagesPaths && imagesPaths.length > 0) {
      await supabase.storage.from("uploads").remove(imagesPaths);
    }
    const { error } = await supabase.from("formations").delete().eq("id", id);
    if (!error) {
      setFormations((prev) => prev.filter((f) => f.id !== id));
      toast.success("Formation supprimée");
    } else {
      toast.error("Erreur lors de la suppression");
    }
  };

  const handleDevisChange = (e) => {
    setDevisData({ ...devisData, [e.target.name]: e.target.value });
  };

  const sendDevis = async (e) => {
    e.preventDefault();
    setSendingDevis(true);
    try {
      const templateParams = {
        name: devisData.name, email: devisData.email, telephone: devisData.telephone, city: devisData.city || "Non renseignée",
        country: devisData.country, formation: devisData.formation,
        hebergement: devisData.hebergement, hebergementType: devisData.hebergementType || "Non renseigné",
        visaAssistance: devisData.visaAssistance || "Non", source: devisData.source || "Non renseignée", message: devisData.message,
        date: new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
      };
      const response = await emailjs.send(EMAILJS_CONFIG.SERVICE_ID, EMAILJS_CONFIG.TEMPLATE_ID, templateParams);
      if (response.status === 200) {
        toast.success("✅ Demande de devis envoyée avec succès !");
        setShowDevisModal(false);
        setDevisData({
          name: "", email: "", telephone: "", city: "", country: "", formation: "",
          hebergement: "non", hebergementType: "", visaAssistance: "non", source: "", message: ""
        });
      }
    } catch (error) {
      console.error(error);
      toast.error("❌ Erreur lors de l'envoi");
    } finally {
      setSendingDevis(false);
    }
  };

  const activeFormationsCount = formations.filter(f => f.onDemand !== true).length;
  const satisfactionRate = "4.9";

  if (loading) return (
    <div className="flex justify-center items-center h-96 pt-20">
      <div className="w-12 h-12 border-3 border-[#76c21f] border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 pt-20">
      
      {/* ========== SECTION HERO ========== */}
      <div className="relative bg-gradient-to-r from-[#1a56db] via-[#1a56db] to-[#76c21f] text-white overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="max-w-7xl mx-auto px-6 py-16 lg:py-20">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-1.5 text-sm mb-6">
            <span className="text-yellow-300">🏆</span>
            <span>Certification reconnue</span>
          </motion.div>
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 leading-tight">
            Investissez dans votre<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-yellow-100">avenir professionnel</span>
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="text-xl md:text-2xl text-blue-100 mb-8 max-w-2xl">
            🚀 Des formations certifiantes pour booster votre carrière
          </motion.p>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="flex flex-wrap gap-6 mb-8">
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2">
              <span className="text-2xl">📚</span>
              <div><div className="font-bold">{activeFormationsCount}+</div><div className="text-xs text-blue-200">Formations</div></div>
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
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="flex flex-wrap gap-4">
            <a href="#formations" className="bg-white text-[#1a56db] px-8 py-3 rounded-xl font-semibold hover:shadow-lg transition-all hover:scale-105 flex items-center gap-2">Découvrir nos formations ↙</a>
            <button onClick={() => setShowDevisModal(true)} className="border-2 border-white text-white px-8 py-3 rounded-xl font-semibold hover:bg-white/10 transition-all hover:scale-105">Obtenir un devis</button>
          </motion.div>
        </div>
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" className="w-full h-auto" fill="currentColor" style={{ color: '#f8fafc' }}>
            <path d="M0,64L80,58.7C160,53,320,43,480,48C640,53,800,75,960,80C1120,85,1280,75,1360,69.3L1440,64L1440,120L1360,120C1280,120,1120,120,960,120C800,120,640,120,480,120C320,120,160,120,80,120L0,120Z"></path>
          </svg>
        </div>
      </div>

      {/* ========== SECTION GÉOGRAPHIQUE ========== */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex flex-col md:flex-row gap-6 items-start">
            <div className="flex-1">
              <h2 className="text-xl font-bold text-gray-800 mb-2">📍 Accessible depuis toute la Tunisie</h2>
              <div className="flex flex-wrap gap-2 mt-3">
                {TUNISIAN_GOVERNORATES.map((city, i) => (<span key={i} className="bg-gray-100 px-3 py-1 rounded-full text-xs shadow-sm">{city}</span>))}
              </div>
              <p className="text-gray-500 text-xs mt-2">🌍 Formation à distance possible pour les apprenants internationaux</p>
            </div>
            <div className="bg-blue-50 p-4 rounded-xl">
              <h3 className="font-bold text-blue-800 text-sm">🏠 Hébergement possible</h3>
              <p className="text-xs text-gray-600 mt-1">Pour les apprenants venant de loin, nous proposons des solutions d'hébergement à Monastir.</p>
            </div>
          </div>
        </div>
      </div>

      {/* ========== 7 BOUTONS PAR THÈME ========== */}
      <div className="bg-white border-b border-gray-200 sticky top-16 z-10">
        <div className="max-w-7xl mx-auto px-6 py-3">
          <div className="flex flex-wrap gap-2 justify-center">
            <button onClick={() => setSelectedTheme("all")} className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${selectedTheme === "all" ? "bg-[#1a56db] text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>Toutes ({formations.length})</button>
            {THEMES.map((theme) => {
              const count = formations.filter(f => f.theme === theme.id).length;
              return (
                <button key={theme.id} onClick={() => setSelectedTheme(theme.id)} className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${selectedTheme === theme.id ? "bg-[#1a56db] text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
                  {theme.icon} {theme.name} ({count})
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ========== BARRE DE RECHERCHE ========== */}
      <div className="sticky top-24 z-10 bg-white/95 backdrop-blur-sm shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-3">
          <div className="relative max-w-md mx-auto">
            <input type="text" placeholder="🔍 Rechercher une formation..." className="w-full border border-gray-300 rounded-xl px-4 py-2 pl-10 focus:outline-none focus:ring-2 focus:ring-[#1a56db]" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
            <svg className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          </div>
          <p className="text-center text-sm text-gray-500 mt-2">{filteredFormations.length} formation(s) trouvée(s)</p>
        </div>
      </div>

      {/* ========== LISTE DES FORMATIONS ========== */}
      <div id="formations" className="max-w-7xl mx-auto px-6 py-12">
        {filteredFormations.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl shadow-sm">
            <div className="text-6xl mb-4">📚</div>
            <h3 className="text-xl font-semibold text-gray-700">Aucune formation trouvée</h3>
            <p className="text-gray-500">Essayez de modifier votre recherche</p>
            {isAdmin && (
              <button onClick={() => navigate("/ajouter-formation")} className="mt-4 bg-green-600 text-white px-4 py-2 rounded-lg">+ Ajouter une formation</button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredFormations.map((formation, index) => (
              <motion.div
                key={formation.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
                whileHover={{ y: -8 }}
                onHoverStart={() => setHoveredCard(formation.id)}
                onHoverEnd={() => setHoveredCard(null)}
                className="group bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300"
              >
                <div className="relative h-48 overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 cursor-pointer" onClick={() => navigate(`/formations/${formation.id}`)}>
                  {formation.images && formation.images.length > 0 ? (
                    <motion.img animate={{ scale: hoveredCard === formation.id ? 1.1 : 1 }} transition={{ duration: 0.3 }} src={getImageUrl(formation.images[0])} alt={formation.title} className="w-full h-full object-cover" onError={(e) => e.target.src = "https://placehold.co/400x300?text=📚+Formation"} />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-5xl">📚</div>
                  )}
                  {formation.onDemand && <div className="absolute top-3 right-3"><span className="bg-gradient-to-r from-orange-500 to-orange-600 text-white text-xs px-3 py-1 rounded-full shadow-md">🎯 À la demande</span></div>}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-4">
                    <span className="text-white text-sm font-medium bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full">Voir les détails →</span>
                  </div>
                </div>
                <div className="p-5">
                  {/* Badge thème */}
                  <div className="mb-2">
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                      {THEMES.find(t => t.id === formation.theme)?.icon} {THEMES.find(t => t.id === formation.theme)?.name || "Non classé"}
                    </span>
                  </div>
                  <h3 className="font-bold text-xl mb-2 line-clamp-2 text-gray-800 cursor-pointer" onClick={() => navigate(`/formations/${formation.id}`)}>
                    {formation.title}
                  </h3>
                  <p className="text-gray-500 text-sm line-clamp-2 mb-3">{formation.description || "Description à venir"}</p>
                  
                  {/* ADMIN : Boutons Modifier / Supprimer / Reclasser */}
                  {isAdmin && (
                    <div className="space-y-2 mt-3 pt-3 border-t border-gray-100">
                      <div className="flex gap-2">
                        <button onClick={() => navigate(`/modifier-formation/${formation.id}`)} className="flex-1 text-sm bg-yellow-500 text-white px-2 py-1 rounded-lg hover:bg-yellow-600 transition">✏️ Modifier</button>
                        <button onClick={() => handleDelete(formation.id, formation.images)} className="flex-1 text-sm bg-red-500 text-white px-2 py-1 rounded-lg hover:bg-red-600 transition">🗑️ Supprimer</button>
                      </div>
                      {/* 7 boutons de reclassement */}
                      <div className="flex flex-wrap gap-1">
                        <span className="text-xs text-gray-500 mr-1">Classer :</span>
                        {THEMES.map((theme) => (
                          <button
                            key={theme.id}
                            onClick={() => updateFormationTheme(formation.id, theme.id)}
                            className={`text-xs px-2 py-0.5 rounded-full transition ${formation.theme === theme.id ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
                            title={`Déplacer vers ${theme.name}`}
                          >
                            {theme.icon}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
        
        {/* FORMATIONS RÉALISÉES */}
        <div className="mt-16 pt-8 border-t border-gray-200">
          <h2 className="text-2xl font-bold text-center text-gray-800 mb-8">🏢 Ils nous ont fait confiance</h2>
          <div className="flex flex-wrap justify-center gap-8">
            {clients.map((client, i) => (
              <div key={i} className="flex flex-col items-center">
                <div className="w-20 h-20 bg-white rounded-full shadow-md flex items-center justify-center p-2">
                  <img src={client.logo} alt={client.name} className="max-w-full max-h-full object-contain" onError={(e) => e.target.style.display = 'none'} />
                </div>
                <p className="text-xs text-gray-500 mt-2 text-center max-w-[100px]">{client.name}</p>
              </div>
            ))}
          </div>
        </div>

        {/* AVIS CLIENTS */}
        <div className="mt-16 pt-8 border-t border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-5 rounded-xl shadow-sm border-l-4 border-blue-500"><p className="text-sm italic text-gray-600">"Formation de qualité à Monastir, je viens de Tunis. Je recommande !"</p><p className="text-xs font-bold mt-3">— Karim, Tunis</p></div>
            <div className="bg-white p-5 rounded-xl shadow-sm border-l-4 border-green-500"><p className="text-sm italic text-gray-600">"Je me suis déplacé de Sousse, ça en valait la peine."</p><p className="text-xs font-bold mt-3">— Amira, Sousse</p></div>
            <div className="bg-white p-5 rounded-xl shadow-sm border-l-4 border-orange-500"><p className="text-sm italic text-gray-600">"Formation très professionnelle, je recommande vivement."</p><p className="text-xs font-bold mt-3">— Mohamed, Sfax</p></div>
          </div>
        </div>
      </div>

      {/* ========== MODAL DEVIS ========== */}
      <AnimatePresence>
        {showDevisModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 overflow-y-auto" onClick={() => setShowDevisModal(false)}>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="relative max-w-2xl w-full bg-white rounded-2xl shadow-2xl overflow-hidden my-8" onClick={(e) => e.stopPropagation()}>
              <div className="bg-gradient-to-r from-[#1a56db] to-[#76c21f] text-white px-6 py-4"><div className="flex justify-between items-center"><div><h2 className="text-xl font-bold">Demande de devis</h2><p className="text-blue-100 text-sm">Nous vous répondrons sous 24h</p></div><button onClick={() => setShowDevisModal(false)} className="text-white/80 hover:text-white transition text-2xl">✕</button></div></div>
              <form onSubmit={sendDevis} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div><label className="block text-sm font-medium text-gray-700 mb-1">Nom complet *</label><input type="text" name="name" required value={devisData.name} onChange={handleDevisChange} className="w-full border border-gray-300 rounded-lg px-4 py-2" placeholder="Jean Dupont" /></div>
                  <div><label className="block text-sm font-medium text-gray-700 mb-1">Email *</label><input type="email" name="email" required value={devisData.email} onChange={handleDevisChange} className="w-full border border-gray-300 rounded-lg px-4 py-2" placeholder="jean.dupont@email.com" /></div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div><label className="block text-sm font-medium text-gray-700 mb-1">Téléphone *</label><input type="tel" name="telephone" required value={devisData.telephone} onChange={handleDevisChange} className="w-full border border-gray-300 rounded-lg px-4 py-2" placeholder="06 12 34 56 78" /></div>
                  <div><label className="block text-sm font-medium text-gray-700 mb-1">Ville</label><input type="text" name="city" value={devisData.city} onChange={handleDevisChange} className="w-full border border-gray-300 rounded-lg px-4 py-2" placeholder="Monastir / Tunis / ..." /></div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div><label className="block text-sm font-medium text-gray-700 mb-1">Pays d'origine *</label><select name="country" required value={devisData.country} onChange={handleDevisChange} className="w-full border border-gray-300 rounded-lg px-4 py-2"><option value="">Sélectionnez</option><option value="Tunisie">🇹🇳 Tunisie</option><option value="France">🇫🇷 France</option><option value="Belgique">🇧🇪 Belgique</option><option value="Suisse">🇨🇭 Suisse</option><option value="Canada">🇨🇦 Canada</option><option value="Autre">🌍 Autre pays</option></select></div>
                  <div><label className="block text-sm font-medium text-gray-700 mb-1">Formation souhaitée *</label><select name="formation" required value={devisData.formation} onChange={handleDevisChange} className="w-full border border-gray-300 rounded-lg px-4 py-2"><option value="">Sélectionnez</option>{formations.map((f) => (<option key={f.id} value={f.title}>{f.title}</option>))}<option value="Autre">Autre formation</option></select></div>
                </div>
                <div className="border-t border-gray-200 pt-4"><h3 className="font-semibold text-gray-800 mb-3">🏠 Hébergement</h3><div className="grid grid-cols-1 md:grid-cols-2 gap-4"><div><label className="block text-sm font-medium text-gray-700 mb-1">Hébergement nécessaire ?</label><select name="hebergement" value={devisData.hebergement} onChange={handleDevisChange} className="w-full border border-gray-300 rounded-lg px-4 py-2"><option value="non">Non</option><option value="oui">Oui, besoin d'un logement</option><option value="international">Oui (package international)</option></select></div>{devisData.hebergement !== "non" && <div><label className="block text-sm font-medium text-gray-700 mb-1">Type d'hébergement</label><select name="hebergementType" value={devisData.hebergementType} onChange={handleDevisChange} className="w-full border border-gray-300 rounded-lg px-4 py-2"><option value="">Sélectionnez</option><option value="residence">Résidence étudiante</option><option value="hotel">Hôtel partenaire</option><option value="appartement">Appartement meublé</option></select></div>}</div></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Comment avez-vous connu CERTUS ?</label><select name="source" value={devisData.source} onChange={handleDevisChange} className="w-full border border-gray-300 rounded-lg px-4 py-2"><option value="">Sélectionnez</option><option value="google">Google</option><option value="facebook">Facebook / Instagram</option><option value="linkedin">LinkedIn</option><option value="bouche">Bouche à oreille</option><option value="autre">Autre</option></select></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Message / Projet</label><textarea name="message" rows="4" value={devisData.message} onChange={handleDevisChange} className="w-full border border-gray-300 rounded-lg px-4 py-2 resize-none" placeholder="Décrivez votre projet..." /></div>
                <button type="submit" disabled={sendingDevis} className="w-full bg-gradient-to-r from-[#1a56db] to-[#76c21f] text-white py-3 rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50">{sendingDevis ? "Envoi en cours..." : "📩 Envoyer la demande"}</button>
                <p className="text-xs text-gray-400 text-center">En envoyant ce formulaire, vous acceptez d'être contacté par notre équipe.</p>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}