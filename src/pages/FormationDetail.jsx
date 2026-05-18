import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import { motion } from "framer-motion";
import { Helmet } from "react-helmet-async";
import { toast } from "react-toastify";
import emailjs from "@emailjs/browser";

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
  fr: { name: "Français", flag: "🇫🇷", direction: "ltr", label: "Langue de la formation" },
  en: { name: "English", flag: "🇬🇧", direction: "ltr", label: "Training language" },
  ar: { name: "العربية", flag: "🇹🇳", direction: "rtl", label: "لغة التكوين" }
};

export default function FormationDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formation, setFormation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [showDevisModal, setShowDevisModal] = useState(false);
  const [sendingDevis, setSendingDevis] = useState(false);
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
        date: new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
      };
      
      const response = await emailjs.send(
        EMAILJS_CONFIG.SERVICE_ID,
        EMAILJS_CONFIG.TEMPLATE_ID,
        templateParams
      );
      
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

  // Génération des balises SEO dynamiques
  const getPageTitle = () => {
    if (!formation) return "Formation | Centre Certus";
    const theme = getThemeConfig(formation.theme);
    return `${formation.title} | Formation ${theme.name} | Centre Certus Monastir`;
  };

  const getPageDescription = () => {
    if (!formation) return "Formation professionnelle certifiante à Monastir";
    const theme = getThemeConfig(formation.theme);
    const duration = formation.duration ? ` sur ${formation.duration}` : "";
    const online = formation.is_online ? " - Disponible à distance" : "";
    return `${formation.description?.substring(0, 160)}. Formation ${theme.name}${duration} au Centre Certus à Monastir${online}. Certification reconnue.`;
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
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center mt-20">
        <p className="text-red-600">Formation introuvable</p>
        <button onClick={() => navigate("/formations")} className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Retour aux formations</button>
      </motion.div>
    );
  }

  return (
    <>
      <Helmet>
        <html lang={formation.langue || "fr"} dir={langueConfig.direction} />
        <title>{getPageTitle()}</title>
        <meta name="description" content={getPageDescription()} />
        <meta name="keywords" content={`${formation.title}, formation ${themeConfig.name}, centre de formation Monastir, formation certifiante, ${formation.langue === 'en' ? 'training Tunisia' : 'formation Tunisie'}`} />
        <link rel="canonical" href={`https://centrecertusdeformation.tn/formations/${id}`} />
        
        {/* Open Graph */}
        <meta property="og:title" content={getPageTitle()} />
        <meta property="og:description" content={getPageDescription()} />
        <meta property="og:type" content="article" />
        <meta property="og:url" content={`https://centrecertusdeformation.tn/formations/${id}`} />
        {formation.images && formation.images[0] && (
          <meta property="og:image" content={getImageUrl(formation.images[0])} />
        )}
        
        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={getPageTitle()} />
        <meta name="twitter:description" content={getPageDescription()} />
        
        {/* JSON-LD Schema.org pour la formation */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Course",
            "name": formation.title,
            "description": formation.description,
            "provider": {
              "@type": "Organization",
              "name": "Centre Certus de Formation",
              "address": {
                "@type": "PostalAddress",
                "addressLocality": "Monastir",
                "addressCountry": "TN"
              }
            },
            "hasCourseInstance": {
              "@type": "CourseInstance",
              "courseMode": formation.is_online ? "online" : "offline",
              "location": {
                "@type": "Place",
                "address": {
                  "@type": "PostalAddress",
                  "addressLocality": "Monastir",
                  "addressCountry": "TN"
                }
              }
            },
            "inLanguage": formation.langue || "fr",
            "educationalCredentialAwarded": "Certificat de formation professionnelle"
          })}
        </script>
      </Helmet>

      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ duration: 0.5 }} 
        className="max-w-6xl mx-auto px-4 py-8 mt-20"
        dir={langueConfig.direction}
      >
        <motion.button 
          whileHover={{ x: -5 }} 
          onClick={() => navigate("/formations")} 
          className="mb-6 flex items-center gap-2 text-gray-600 hover:text-blue-600 transition"
        >
          ← Retour à la liste des formations
        </motion.button>

        {/* Badges */}
        <div className="flex flex-wrap gap-3 mb-6 justify-center">
          <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold ${themeConfig.color}`}>
            <span>{themeConfig.icon}</span> {themeConfig.name}
          </span>
          
          {/* NOUVEAU : Badge Langue */}
          <span className="inline-flex items-center gap-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-full text-sm font-semibold">
            <span>{langueConfig.flag}</span> {langueConfig.name}
          </span>
          
          {formation.is_online && (
            <span className="inline-flex items-center gap-2 bg-green-100 text-green-700 px-4 py-2 rounded-full text-sm font-semibold">
              🌍 Formation à distance
            </span>
          )}
          {formation.onDemand && (
            <span className="inline-flex items-center gap-2 bg-orange-100 text-orange-700 px-4 py-2 rounded-full text-sm font-semibold">
              🎯 À la demande
            </span>
          )}
          <span className="inline-flex items-center gap-2 bg-purple-100 text-purple-700 px-4 py-2 rounded-full text-sm font-semibold">
            🎓 Certifiante
          </span>
        </div>

        <h1 className="text-4xl font-bold mb-6 text-gray-800 text-center">{formation.title}</h1>

        {/* Durée et Prix */}
        {(formation.duration || formation.price) && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto mb-8">
            {formation.duration && (
              <div className="bg-gray-50 p-4 rounded-xl text-center border border-gray-200">
                <p className="text-xs text-gray-500 uppercase tracking-wide">Durée</p>
                <p className="text-xl font-semibold text-gray-800">{formation.duration}</p>
              </div>
            )}
            {formation.price && (
              <div className="bg-gray-50 p-4 rounded-xl text-center border border-gray-200">
                <p className="text-xs text-gray-500 uppercase tracking-wide">Tarif</p>
                <p className="text-xl font-semibold text-gray-800">{formation.price}</p>
              </div>
            )}
          </div>
        )}

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
                  <motion.img 
                    key={idx} 
                    whileHover={{ scale: 1.05 }} 
                    src={getImageUrl(img)} 
                    alt={`Miniature ${idx + 1}`} 
                    className={`w-20 h-20 object-cover rounded-lg cursor-pointer transition-all ${selectedImage === idx ? "ring-2 ring-blue-500 shadow-lg" : "opacity-70 hover:opacity-100"}`} 
                    onClick={() => setSelectedImage(idx)} 
                    onError={(e) => e.target.style.display = "none"} 
                  />
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="mb-8 bg-gray-100 rounded-xl h-64 flex items-center justify-center">
            <div className="text-center">
              <div className="text-6xl mb-2">📚</div>
              <p className="text-gray-500">Aucune image disponible</p>
            </div>
          </div>
        )}

        {/* Description courte */}
        {formation.description && (
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-700 mb-2">Description</h2>
            <p className="text-gray-600 leading-relaxed">{formation.description}</p>
          </div>
        )}

        {/* Description complète */}
        {formation.fullDescription && (
          <div className="mb-8 bg-gray-50 p-6 rounded-xl">
            <h2 className="text-xl font-semibold text-gray-700 mb-3">Description détaillée</h2>
            <div className="text-gray-600 leading-relaxed whitespace-pre-line">{formation.fullDescription}</div>
          </div>
        )}

        {/* NOUVEAU : Lien de test / démo */}
        {formation.test_link && (
          <div className="mb-8 bg-blue-50 p-6 rounded-xl border border-blue-200">
            <h2 className="text-xl font-semibold text-blue-800 mb-3 flex items-center gap-2">
              <span>🔗</span> Test de niveau / Démo
            </h2>
            <p className="text-gray-600 mb-4">
              Évaluez votre niveau ou découvrez un aperçu de la formation :
            </p>
            <motion.a 
              whileHover={{ scale: 1.02 }} 
              href={formation.test_link} 
              target="_blank" 
              rel="noreferrer noopener" 
              className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg font-medium shadow-md hover:bg-blue-700 transition"
            >
              <span>🚀</span> Accéder au test / démo
              <span>→</span>
            </motion.a>
          </div>
        )}

        {/* Boutons d'action */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
          {formation.preinscriptionLink && (
            <motion.a 
              whileHover={{ scale: 1.05 }} 
              whileTap={{ scale: 0.95 }} 
              href={formation.preinscriptionLink} 
              target="_blank" 
              rel="noreferrer" 
              className="inline-block bg-gradient-to-r from-green-500 to-green-700 hover:from-green-600 hover:to-green-800 text-white px-8 py-3 rounded-lg font-medium shadow-lg text-center"
            >
              📝 S'inscrire à cette formation
            </motion.a>
          )}
          
          <motion.button 
            whileHover={{ scale: 1.05 }} 
            whileTap={{ scale: 0.95 }} 
            onClick={() => setShowDevisModal(true)} 
            className="inline-block bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 text-white px-8 py-3 rounded-lg font-medium shadow-lg"
          >
            📩 Demander un devis personnalisé
          </motion.button>
        </div>

        {/* Partager sur les réseaux sociaux */}
        <div className="text-center mt-8 pt-6 border-t border-gray-200">
          <p className="text-sm text-gray-500 mb-3">Partager cette formation :</p>
          <div className="flex gap-3 justify-center">
            <a 
              href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(`https://centrecertusdeformation.tn/formations/${id}`)}`} 
              target="_blank" 
              rel="noreferrer" 
              className="bg-blue-600 text-white p-2 rounded-full w-10 h-10 flex items-center justify-center hover:bg-blue-700 transition"
            >
              f
            </a>
            <a 
              href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(formation.title)}&url=${encodeURIComponent(`https://centrecertusdeformation.tn/formations/${id}`)}`} 
              target="_blank" 
              rel="noreferrer" 
              className="bg-black text-white p-2 rounded-full w-10 h-10 flex items-center justify-center hover:bg-gray-800 transition"
            >
              𝕏
            </a>
            <a 
              href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(`https://centrecertusdeformation.tn/formations/${id}`)}`} 
              target="_blank" 
              rel="noreferrer" 
              className="bg-blue-800 text-white p-2 rounded-full w-10 h-10 flex items-center justify-center hover:bg-blue-900 transition"
            >
              in
            </a>
            <a 
              href={`https://wa.me/?text=${encodeURIComponent(`${formation.title} - https://centrecertusdeformation.tn/formations/${id}`)}`} 
              target="_blank" 
              rel="noreferrer" 
              className="bg-green-600 text-white p-2 rounded-full w-10 h-10 flex items-center justify-center hover:bg-green-700 transition"
            >
              💬
            </a>
          </div>
        </div>
      </motion.div>

      {/* Modal Devis */}
      {showDevisModal && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 overflow-y-auto" onClick={() => setShowDevisModal(false)}>
          <div className="relative max-w-2xl w-full bg-white rounded-2xl shadow-2xl overflow-hidden my-8" onClick={(e) => e.stopPropagation()}>
            <div className="bg-gradient-to-r from-[#1a56db] to-[#76c21f] text-white px-6 py-4">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-bold">Demande de devis</h2>
                  <p className="text-blue-100 text-sm">Pour : {formation.title}</p>
                </div>
                <button onClick={() => setShowDevisModal(false)} className="text-white/80 hover:text-white transition text-2xl">✕</button>
              </div>
            </div>
            <form onSubmit={sendDevis} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nom complet *</label>
                  <input type="text" name="name" required value={devisData.name} onChange={handleDevisChange} className="w-full border border-gray-300 rounded-lg px-4 py-2" placeholder="Jean Dupont" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                  <input type="email" name="email" required value={devisData.email} onChange={handleDevisChange} className="w-full border border-gray-300 rounded-lg px-4 py-2" placeholder="jean.dupont@email.com" />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone *</label>
                  <input type="tel" name="telephone" required value={devisData.telephone} onChange={handleDevisChange} className="w-full border border-gray-300 rounded-lg px-4 py-2" placeholder="06 12 34 56 78" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ville</label>
                  <input type="text" name="city" value={devisData.city} onChange={handleDevisChange} className="w-full border border-gray-300 rounded-lg px-4 py-2" placeholder="Monastir / Tunis / ..." />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Pays d'origine *</label>
                  <select name="country" required value={devisData.country} onChange={handleDevisChange} className="w-full border border-gray-300 rounded-lg px-4 py-2">
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">Formation</label>
                  <input type="text" value={formation.title} disabled className="w-full border border-gray-300 rounded-lg px-4 py-2 bg-gray-50" />
                </div>
              </div>
              <div className="border-t border-gray-200 pt-4">
                <h3 className="font-semibold text-gray-800 mb-3">🏠 Hébergement</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Hébergement nécessaire ?</label>
                    <select name="hebergement" value={devisData.hebergement} onChange={handleDevisChange} className="w-full border border-gray-300 rounded-lg px-4 py-2">
                      <option value="non">Non</option>
                      <option value="oui">Oui, besoin d'un logement</option>
                      <option value="international">Oui (package international)</option>
                    </select>
                  </div>
                  {devisData.hebergement !== "non" && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Type d'hébergement</label>
                      <select name="hebergementType" value={devisData.hebergementType} onChange={handleDevisChange} className="w-full border border-gray-300 rounded-lg px-4 py-2">
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Comment avez-vous connu CERTUS ?</label>
                <select name="source" value={devisData.source} onChange={handleDevisChange} className="w-full border border-gray-300 rounded-lg px-4 py-2">
                  <option value="">Sélectionnez</option>
                  <option value="google">Google</option>
                  <option value="facebook">Facebook / Instagram</option>
                  <option value="linkedin">LinkedIn</option>
                  <option value="bouche">Bouche à oreille</option>
                  <option value="autre">Autre</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Message / Projet</label>
                <textarea name="message" rows="4" value={devisData.message} onChange={handleDevisChange} className="w-full border border-gray-300 rounded-lg px-4 py-2 resize-none" placeholder="Décrivez votre projet..." />
              </div>
              <button type="submit" disabled={sendingDevis} className="w-full bg-gradient-to-r from-[#1a56db] to-[#76c21f] text-white py-3 rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50">
                {sendingDevis ? "Envoi en cours..." : "📩 Envoyer la demande"}
              </button>
              <p className="text-xs text-gray-400 text-center">En envoyant ce formulaire, vous acceptez d'être contacté par notre équipe.</p>
            </form>
          </div>
        </div>
      )}
    </>
  );
}