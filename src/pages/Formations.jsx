import React, { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-toastify";
import { motion, AnimatePresence } from "framer-motion";
import emailjs from "@emailjs/browser";

// Configuration EmailJS - IDENTIFIANTS CERTUS
const EMAILJS_CONFIG = {
  PUBLIC_KEY: "LNbKohuUxse3qtZjG",
  SERVICE_ID: "service_ixutrbl",
  TEMPLATE_ID: "template_5iq0uco"
};

export default function Formations() {
  const navigate = useNavigate();
  const { isAdmin } = useAuth();

  const [formations, setFormations] = useState([]);
  const [filteredFormations, setFilteredFormations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [hoveredCard, setHoveredCard] = useState(null);
  const [showDevisModal, setShowDevisModal] = useState(false);
  const [devisData, setDevisData] = useState({
    name: "",
    email: "",
    telephone: "",
    formation: "",
    message: ""
  });
  const [sendingDevis, setSendingDevis] = useState(false);

  useEffect(() => {
    emailjs.init(EMAILJS_CONFIG.PUBLIC_KEY);
  }, []);

  useEffect(() => {
    const fetchFormations = async () => {
      setLoading(true);

      const { data, error } = await supabase
        .from("formations")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error(error);
        toast.error("Erreur chargement formations");
      } else {
        setFormations(data || []);
        setFilteredFormations(data || []);
      }

      setLoading(false);
    };

    fetchFormations();
  }, []);

  useEffect(() => {
    if (searchTerm === "") {
      setFilteredFormations(formations);
    } else {
      const filtered = formations.filter((f) =>
        f.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        f.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredFormations(filtered);
    }
  }, [searchTerm, formations]);

  const getImageUrl = (path) => {
    if (!path) return null;
    const { data } = supabase.storage.from("uploads").getPublicUrl(path);
    return data.publicUrl;
  };

  const handleDelete = async (id, imagesPaths) => {
    if (!isAdmin) return;
    if (!window.confirm("Supprimer cette formation ?")) return;

    if (imagesPaths && imagesPaths.length > 0) {
      await supabase.storage.from("uploads").remove(imagesPaths);
    }

    const { error } = await supabase
      .from("formations")
      .delete()
      .eq("id", id);

    if (!error) {
      setFormations((prev) => prev.filter((f) => f.id !== id));
      toast.success("Formation supprimée");
    } else {
      toast.error("Erreur lors de la suppression");
    }
  };

  const handleDevisChange = (e) => {
    setDevisData({
      ...devisData,
      [e.target.name]: e.target.value
    });
  };

  const sendDevis = async (e) => {
    e.preventDefault();
    setSendingDevis(true);

    try {
      const templateParams = {
        to_email: "contact.certus@gmail.com",
        name: devisData.name,
        email: devisData.email,
        telephone: devisData.telephone || "Non renseigné",
        formation: devisData.formation || "Non spécifiée",
        message: devisData.message,
        title: devisData.formation || "Devis personnalisé",
        date: new Date().toLocaleDateString('fr-FR', {
          day: 'numeric',
          month: 'long',
          year: 'numeric'
        })
      };

      const response = await emailjs.send(
        EMAILJS_CONFIG.SERVICE_ID,
        EMAILJS_CONFIG.TEMPLATE_ID,
        templateParams
      );

      if (response.status === 200) {
        toast.success("✅ Demande de devis envoyée avec succès !");
        setShowDevisModal(false);
        setDevisData({ name: "", email: "", telephone: "", formation: "", message: "" });
      } else {
        throw new Error("Erreur d'envoi");
      }
    } catch (error) {
      console.error("Erreur envoi:", error);
      toast.error("❌ Erreur lors de l'envoi. Veuillez réessayer.");
    } finally {
      setSendingDevis(false);
    }
  };

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
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-[#76c21f]/20 rounded-full blur-3xl"></div>
        
        <div className="relative max-w-7xl mx-auto px-6 py-16 lg:py-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-1.5 text-sm mb-6"
          >
            <span className="text-yellow-300">🏆</span>
            <span>Certification reconnue</span>
          </motion.div>
          
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 leading-tight"
          >
            Investissez dans votre<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-yellow-100">
              avenir professionnel
            </span>
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xl md:text-2xl text-blue-100 mb-8 max-w-2xl"
          >
            🚀 Des formations certifiantes pour booster votre carrière
          </motion.p>
          
          {/* Statistiques */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="flex flex-wrap gap-6 mb-8"
          >
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2">
              <span className="text-2xl">📚</span>
              <div>
                <div className="font-bold">{formations.length}+</div>
                <div className="text-xs text-blue-200">Formations</div>
              </div>
            </div>
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2">
              <span className="text-2xl">👨‍🎓</span>
              <div>
                <div className="font-bold">500+</div>
                <div className="text-xs text-blue-200">Apprenants</div>
              </div>
            </div>
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2">
              <span className="text-2xl">⭐</span>
              <div>
                <div className="font-bold">4.9/5</div>
                <div className="text-xs text-blue-200">Satisfaction</div>
              </div>
            </div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-wrap gap-4"
          >
            <a 
              href="#formations" 
              className="bg-white text-[#1a56db] px-8 py-3 rounded-xl font-semibold hover:shadow-lg transition-all hover:scale-105 flex items-center gap-2"
            >
              Découvrir nos formations
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </a>
            <button
              onClick={() => setShowDevisModal(true)}
              className="border-2 border-white text-white px-8 py-3 rounded-xl font-semibold hover:bg-white/10 transition-all hover:scale-105"
            >
              Obtenir un devis
            </button>
          </motion.div>
        </div>
        
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" className="w-full h-auto" fill="currentColor" style={{ color: '#f8fafc' }}>
            <path d="M0,64L80,58.7C160,53,320,43,480,48C640,53,800,75,960,80C1120,85,1280,75,1360,69.3L1440,64L1440,120L1360,120C1280,120,1120,120,960,120C800,120,640,120,480,120C320,120,160,120,80,120L0,120Z"></path>
          </svg>
        </div>
      </div>

      {/* ========== SECTION RECHERCHE ========== */}
      <div className="sticky top-16 z-10 bg-white/95 backdrop-blur-sm shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
            <div className="relative w-full md:w-96">
              <input
                type="text"
                placeholder="🔍 Rechercher une formation..."
                className="w-full border border-gray-300 rounded-xl px-4 py-2.5 pl-10 focus:outline-none focus:ring-2 focus:ring-[#1a56db] focus:border-transparent"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <svg className="absolute left-3 top-3 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            
            <div className="text-sm text-gray-500">
              {filteredFormations.length} formation(s) trouvée(s)
            </div>
            
            {isAdmin && (
              <button
                onClick={() => navigate("/ajouter-formation")}
                className="bg-[#76c21f] text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-[#5fa018] transition flex items-center gap-1"
              >
                <span className="text-lg">+</span> Ajouter une formation
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ========== LISTE COMPLÈTE DES FORMATIONS ========== */}
      <div id="formations" className="max-w-7xl mx-auto px-6 py-12">
        {filteredFormations.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl shadow-sm">
            <div className="text-6xl mb-4">📚</div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">Aucune formation trouvée</h3>
            <p className="text-gray-500">Essayez de modifier votre recherche</p>
          </div>
        ) : (
          <>
            {/* Indicateur du nombre total */}
            <div className="mb-6 flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-700">
                Toutes nos formations ({filteredFormations.length})
              </h2>
              <div className="text-sm text-gray-400">
                {formations.length} formation(s) au total
              </div>
            </div>
            
            {/* Grille complète */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <AnimatePresence>
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
                    className="group bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 cursor-pointer"
                    onClick={() => navigate(`/formations/${formation.id}`)}
                  >
                    <div className="relative h-52 overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200">
                      {formation.images && formation.images.length > 0 ? (
                        <motion.img
                          animate={{ scale: hoveredCard === formation.id ? 1.1 : 1 }}
                          transition={{ duration: 0.3 }}
                          src={getImageUrl(formation.images[0])}
                          alt={formation.title}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.src = "https://placehold.co/400x300?text=📚+Formation";
                          }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-5xl">
                          📚
                        </div>
                      )}
                      
                      {formation.onDemand && (
                        <div className="absolute top-3 right-3">
                          <span className="bg-gradient-to-r from-orange-500 to-orange-600 text-white text-xs px-3 py-1 rounded-full shadow-md">
                            🎯 À la demande
                          </span>
                        </div>
                      )}
                      
                      {/* Compteur d'images */}
                      {formation.images && formation.images.length > 1 && (
                        <div className="absolute bottom-3 right-3 bg-black/50 text-white text-xs px-2 py-1 rounded-full">
                          📷 {formation.images.length} photos
                        </div>
                      )}
                      
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-4">
                        <span className="text-white text-sm font-medium bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full">
                          Voir les détails →
                        </span>
                      </div>
                    </div>
                    
                    <div className="p-5">
                      <h3 className="font-bold text-xl mb-2 line-clamp-2 text-gray-800 group-hover:text-[#1a56db] transition">
                        {formation.title}
                      </h3>
                      
                      <p className="text-gray-500 text-sm line-clamp-2 mb-3">
                        {formation.description || "Description à venir"}
                      </p>
                      
                      <div className="flex flex-wrap gap-2 mb-3">
                        <span className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded-full">
                          📖 Formation
                        </span>
                        <span className="text-xs bg-green-50 text-green-600 px-2 py-1 rounded-full">
                          🎓 Certifiante
                        </span>
                        {formation.onDemand && (
                          <span className="text-xs bg-orange-50 text-orange-600 px-2 py-1 rounded-full">
                            ⏱️ Flexible
                          </span>
                        )}
                      </div>
                      
                      {isAdmin && (
                        <div className="flex gap-2 mt-3 pt-3 border-t border-gray-100" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => navigate(`/modifier-formation/${formation.id}`)}
                            className="flex-1 text-sm bg-yellow-500 text-white px-3 py-1.5 rounded-lg hover:bg-yellow-600 transition"
                          >
                            ✏️ Modifier
                          </button>
                          <button
                            onClick={() => handleDelete(formation.id, formation.images)}
                            className="flex-1 text-sm bg-red-500 text-white px-3 py-1.5 rounded-lg hover:bg-red-600 transition"
                          >
                            🗑️ Supprimer
                          </button>
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
            
            {/* Message de fin */}
            <div className="mt-12 text-center">
              <p className="text-gray-400 text-sm">
                {filteredFormations.length} formation(s) disponible(s) • 
                Dernière mise à jour : {new Date().toLocaleDateString('fr-FR')}
              </p>
            </div>
          </>
        )}
      </div>

      {/* ========== MODAL DEVIS ========== */}
      <AnimatePresence>
        {showDevisModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
            onClick={() => setShowDevisModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative max-w-lg w-full bg-white rounded-2xl shadow-2xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="bg-gradient-to-r from-[#1a56db] to-[#76c21f] text-white px-6 py-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-xl font-bold">Demande de devis</h2>
                    <p className="text-blue-100 text-sm">Nous vous répondrons sous 24h</p>
                  </div>
                  <button
                    onClick={() => setShowDevisModal(false)}
                    className="text-white/80 hover:text-white transition text-2xl"
                  >
                    ✕
                  </button>
                </div>
              </div>
              
              <form onSubmit={sendDevis} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nom complet *</label>
                  <input
                    type="text"
                    name="name"
                    required
                    value={devisData.name}
                    onChange={handleDevisChange}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#1a56db]"
                    placeholder="Jean Dupont"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                  <input
                    type="email"
                    name="email"
                    required
                    value={devisData.email}
                    onChange={handleDevisChange}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#1a56db]"
                    placeholder="jean.dupont@email.com"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
                  <input
                    type="tel"
                    name="telephone"
                    value={devisData.telephone}
                    onChange={handleDevisChange}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#1a56db]"
                    placeholder="06 12 34 56 78"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Formation souhaitée</label>
                  <select
                    name="formation"
                    value={devisData.formation}
                    onChange={handleDevisChange}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#1a56db]"
                  >
                    <option value="">Sélectionnez une formation</option>
                    {formations.map((f) => (
                      <option key={f.id} value={f.title}>{f.title}</option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-400 mt-1">
                    {formations.length} formation(s) disponible(s)
                  </p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Message *</label>
                  <textarea
                    name="message"
                    required
                    rows="4"
                    value={devisData.message}
                    onChange={handleDevisChange}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#1a56db] resize-none"
                    placeholder="Décrivez votre projet de formation..."
                  />
                </div>
                
                <button
                  type="submit"
                  disabled={sendingDevis}
                  className="w-full bg-gradient-to-r from-[#1a56db] to-[#76c21f] text-white py-3 rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50"
                >
                  {sendingDevis ? "Envoi en cours..." : "📩 Envoyer la demande"}
                </button>
                
                <p className="text-xs text-gray-400 text-center">
                  En envoyant ce formulaire, vous acceptez d'être contacté par notre équipe.
                </p>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}