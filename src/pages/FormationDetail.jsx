import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "./supabaseClient";
import { motion } from "framer-motion";
import { Helmet } from "react-helmet-async";
import { toast } from "react-toastify";
import emailjs from "@emailjs/browser";
import ModalInscriptionDemande from "../components/ModalInscriptionDemande";

// Configuration EmailJS
const EMAILJS_CONFIG = {
  PUBLIC_KEY: "LNbKohuUxse3qtZjG",
  SERVICE_ID: "service_ixutrbl",
  TEMPLATE_ID: "template_5iq0uco"
};

// Configuration des 7 thèmes avec couleurs
const THEME_CONFIG = {
  digital: { name: "Digital & Web", icon: "💻", color: "bg-blue-100 text-blue-700" },
  data: { name: "Data & IA", icon: "📊", color: "bg-purple-100 text-purple-700" },
  design: { name: "Design & Créativité", icon: "🎨", color: "bg-pink-100 text-pink-700" },
  management: { name: "Management & Leadership", icon: "📈", color: "bg-green-100 text-green-700" },
  finance: { name: "Finance & Comptabilité", icon: "💰", color: "bg-yellow-100 text-yellow-700" },
  energie: { name: "Énergies renouvelables", icon: "🌱", color: "bg-teal-100 text-teal-700" },
  langues: { name: "Langues & Communication", icon: "🗣️", color: "bg-indigo-100 text-indigo-700" }
};

// Configuration des langues
const LANGUE_CONFIG = {
  fr: { name: "Français", flag: "🇫🇷", direction: "ltr" },
  en: { name: "English", flag: "🇬🇧", direction: "ltr" },
  ar: { name: "العربية", flag: "🇹🇳", direction: "rtl" }
};

export default function FormationDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formation, setFormation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [showDevisModal, setShowDevisModal] = useState(false);
  const [showInscriptionDemandeModal, setShowInscriptionDemandeModal] = useState(false);
  const [sendingDevis, setSendingDevis] = useState(false);
  const [inscriptionLoading, setInscriptionLoading] = useState(false);
  const [devisData, setDevisData] = useState({
    name: "", email: "", telephone: "", city: "", country: "", formation: "",
    hebergement: "non", hebergementType: "", visaAssistance: "non", source: "", message: ""
  });

  useEffect(() => {
    emailjs.init(EMAILJS_CONFIG.PUBLIC_KEY);
  }, []);

  useEffect(() => {
    const fetchFormation = async () => {
      try {
        const { data, error } = await supabase
          .from("formations")
          .select("*")
          .eq("id", id)
          .single();

        if (error) throw error;
        setFormation(data || null);
      } catch (err) {
        console.error("Erreur fetch:", err);
        setFormation(null);
      } finally {
        setLoading(false);
      }
    };
    fetchFormation();
  }, [id]);

  const getImageUrl = (path) => {
    if (!path) return null;
    try {
      const { data } = supabase.storage.from("uploads").getPublicUrl(path);
      return data.publicUrl;
    } catch (error) {
      return null;
    }
  };

  const getThemeConfig = (themeId) => {
    return THEME_CONFIG[themeId] || THEME_CONFIG.digital;
  };

  const getLangueConfig = (langueCode) => {
    return LANGUE_CONFIG[langueCode] || LANGUE_CONFIG.fr;
  };

  const handleDevisChange = (e) => {
    setDevisData({ ...devisData, [e.target.name]: e.target.value });
  };

  const sendDevis = async (e) => {
    e.preventDefault();
    setSendingDevis(true);
    try {
      const templateParams = {
        name: devisData.name,
        email: devisData.email,
        telephone: devisData.telephone,
        city: devisData.city || "Non renseignée",
        country: devisData.country,
        formation: formation?.title || devisData.formation,
        hebergement: devisData.hebergement,
        hebergementType: devisData.hebergementType || "Non renseigné",
        visaAssistance: devisData.visaAssistance || "Non",
        source: devisData.source || "Non renseignée",
        message: devisData.message,
        date: new Date().toLocaleDateString('fr-FR')
      };
      
      await emailjs.send(
        EMAILJS_CONFIG.SERVICE_ID,
        EMAILJS_CONFIG.TEMPLATE_ID,
        templateParams
      );
      
      toast.success("✅ Demande de devis envoyée avec succès !");
      setShowDevisModal(false);
      setDevisData({
        name: "", email: "", telephone: "", city: "", country: "", formation: "",
        hebergement: "non", hebergementType: "", visaAssistance: "non", source: "", message: ""
      });
    } catch (error) {
      console.error(error);
      toast.error("❌ Erreur lors de l'envoi");
    } finally {
      setSendingDevis(false);
    }
  };

  // Fonction pour l'inscription en ligne
  const handleInscriptionEnLigne = async () => {
    setInscriptionLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        // Rediriger vers l'inscription avec redirect
        const redirectUrl = `/confirm-inscription?formation=${formation.id}`;
        navigate(`/inscription?redirect=${encodeURIComponent(redirectUrl)}`);
        return;
      }

      // Vérifier si déjà inscrit
      const { data: existing } = await supabase
        .from("inscriptions")
        .select("id, statut")
        .eq("user_id", user.id)
        .eq("formation_id", formation.id)
        .maybeSingle();

      if (existing) {
        if (existing.statut === "en_attente") {
          toast.info("⏳ Votre inscription est déjà en attente de validation");
        } else if (existing.statut === "confirme") {
          toast.success("✅ Vous êtes déjà inscrit à cette formation");
        }
        return;
      }

      // Créer l'inscription
      await supabase.from("inscriptions").insert({
        user_id: user.id,
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
  };

  const themeConfig = formation ? getThemeConfig(formation.theme) : THEME_CONFIG.digital;
  const langueConfig = formation ? getLangueConfig(formation.langue) : LANGUE_CONFIG.fr;

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64 mt-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!formation) {
    return (
      <div className="text-center mt-20">
        <p className="text-red-600">Formation introuvable</p>
        <button onClick={() => navigate("/formations")} className="mt-4 bg-blue-600 text-white px-4 py-2 rounded">Retour aux formations</button>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <html lang={formation.langue || "fr"} dir={langueConfig.direction} />
        <title>{formation.title} | Centre Certus Monastir</title>
        <meta name="description" content={formation.description} />
      </Helmet>

      <div className="max-w-6xl mx-auto px-4 py-8 mt-20" dir={langueConfig.direction}>
        <button onClick={() => navigate("/formations")} className="mb-6 text-gray-600 hover:text-blue-600 transition">
          ← Retour aux formations
        </button>

        {/* Badges */}
        <div className="flex flex-wrap gap-3 mb-6 justify-center">
          <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold ${themeConfig.color}`}>
            {themeConfig.icon} {themeConfig.name}
          </span>
          <span className="inline-flex items-center gap-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-full text-sm font-semibold">
            {langueConfig.flag} {langueConfig.name}
          </span>
          {formation.is_online && (
            <span className="bg-green-100 text-green-700 px-4 py-2 rounded-full text-sm font-semibold">🌍 Formation en ligne</span>
          )}
          {formation.onDemand && (
            <span className="bg-orange-100 text-orange-700 px-4 py-2 rounded-full text-sm font-semibold">🏢 À la demande (Présentiel)</span>
          )}
          <span className="bg-purple-100 text-purple-700 px-4 py-2 rounded-full text-sm font-semibold">🎓 Certifiante</span>
        </div>

        <h1 className="text-4xl font-bold mb-6 text-gray-800 text-center">{formation.title}</h1>

        {/* Images */}
        {formation.images && formation.images.length > 0 ? (
          <div className="mb-8">
            <div className="relative h-96 rounded-xl overflow-hidden shadow-xl mb-4 bg-gray-100">
              <img 
                src={getImageUrl(formation.images[selectedImage])} 
                alt={formation.title} 
                className="w-full h-full object-contain"
                onError={(e) => e.target.src = "https://placehold.co/800x400?text=Image+non+disponible"} 
              />
            </div>
            {formation.images.length > 1 && (
              <div className="flex gap-2 justify-center flex-wrap">
                {formation.images.map((img, idx) => (
                  <img 
                    key={idx} 
                    src={getImageUrl(img)} 
                    alt={`Miniature ${idx + 1}`} 
                    className={`w-20 h-20 object-cover rounded-lg cursor-pointer transition-all ${selectedImage === idx ? "ring-2 ring-blue-500 shadow-lg" : "opacity-70"}`} 
                    onClick={() => setSelectedImage(idx)} 
                    onError={(e) => e.target.style.display = "none"} 
                  />
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="mb-8 bg-gray-100 rounded-xl h-64 flex items-center justify-center">
            <div className="text-center text-6xl">📚</div>
          </div>
        )}

        {/* Description */}
        {formation.description && (
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-700 mb-2">Description</h2>
            <p className="text-gray-600 leading-relaxed">{formation.description}</p>
          </div>
        )}

        {/* Boutons d'inscription */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
          {formation.is_online && (
            <button 
              onClick={handleInscriptionEnLigne}
              disabled={inscriptionLoading}
              className="bg-gradient-to-r from-blue-500 to-blue-700 text-white px-8 py-3 rounded-lg font-medium shadow-lg disabled:opacity-50"
            >
              {inscriptionLoading ? "Chargement..." : "🌍 S'inscrire en ligne"}
            </button>
          )}

          {formation.onDemand && (
            <button 
              onClick={() => setShowInscriptionDemandeModal(true)}
              className="bg-gradient-to-r from-orange-500 to-orange-700 text-white px-8 py-3 rounded-lg font-medium shadow-lg"
            >
              🏢 S'inscrire à la demande (Présentiel)
            </button>
          )}
          
          <button 
            onClick={() => setShowDevisModal(true)} 
            className="bg-gradient-to-r from-green-500 to-green-700 text-white px-8 py-3 rounded-lg font-medium shadow-lg"
          >
            📩 Demander un devis
          </button>
        </div>

        {/* Modal Devis */}
        {showDevisModal && (
          <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4" onClick={() => setShowDevisModal(false)}>
            <div className="relative max-w-2xl w-full bg-white rounded-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
              <div className="bg-gradient-to-r from-[#1a56db] to-[#76c21f] text-white px-6 py-4 sticky top-0">
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-xl font-bold">Demande de devis</h2>
                    <p className="text-blue-100 text-sm">Pour : {formation.title}</p>
                  </div>
                  <button onClick={() => setShowDevisModal(false)} className="text-white text-2xl">✕</button>
                </div>
              </div>
              <form onSubmit={sendDevis} className="p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input type="text" name="name" placeholder="Nom complet *" required value={devisData.name} onChange={handleDevisChange} className="border rounded-lg px-4 py-2" />
                  <input type="email" name="email" placeholder="Email *" required value={devisData.email} onChange={handleDevisChange} className="border rounded-lg px-4 py-2" />
                  <input type="tel" name="telephone" placeholder="Téléphone *" required value={devisData.telephone} onChange={handleDevisChange} className="border rounded-lg px-4 py-2" />
                  <input type="text" name="city" placeholder="Ville" value={devisData.city} onChange={handleDevisChange} className="border rounded-lg px-4 py-2" />
                  <select name="country" required value={devisData.country} onChange={handleDevisChange} className="border rounded-lg px-4 py-2">
                    <option value="">Pays d'origine *</option>
                    <option value="Tunisie">🇹🇳 Tunisie</option>
                    <option value="France">🇫🇷 France</option>
                    <option value="Autre">🌍 Autre pays</option>
                  </select>
                </div>
                <textarea name="message" rows="3" placeholder="Message / Projet" value={devisData.message} onChange={handleDevisChange} className="border rounded-lg px-4 py-2 w-full" />
                <button type="submit" disabled={sendingDevis} className="w-full bg-gradient-to-r from-[#1a56db] to-[#76c21f] text-white py-3 rounded-lg font-semibold">
                  {sendingDevis ? "Envoi..." : "📩 Envoyer"}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Modal Inscription présentiel */}
        <ModalInscriptionDemande
          isOpen={showInscriptionDemandeModal}
          onClose={() => setShowInscriptionDemandeModal(false)}
          formation={formation}
          onSuccess={() => {
            setShowInscriptionDemandeModal(false);
            toast.success("✅ Demande envoyée ! L'équipe Certus vous contactera.");
          }}
        />
      </div>
    </>
  );
}