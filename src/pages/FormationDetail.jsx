import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
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

  // Fonction pour l'inscription en ligne
  const handleInscriptionEnLigne = async () => {
    setInscriptionLoading(true);
    try {
      // Vérifier si l'utilisateur est connecté
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        // Rediriger vers la page de connexion avec redirect
        navigate(`/connexion?redirect=/confirm-inscription?formation=${formation.id}`);
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
      const { error } = await supabase
        .from("inscriptions")
        .insert({
          user_id: user.id,
          formation_id: formation.id,
          statut: "en_attente",
          created_at: new Date().toISOString()
        });

      if (error) throw error;

      toast.success("✅ Inscription enregistrée ! En attente de validation par l'administrateur.");
      navigate("/espace-participant");
    } catch (err) {
      console.error(err);
      toast.error("❌ Erreur lors de l'inscription");
    } finally {
      setInscriptionLoading(false);
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

  // URL complète pour le partage
  const shareUrl = `https://centrecertusdeformation.tn/formations/${id}`;
  
  // Message de partage
  const shareMessage = `🎓 ${formation?.title || 'Formation'} - Centre Certus Monastir\n📅 ${formation?.duration || 'Durée flexible'}\n💰 ${formation?.price || 'Sur devis'}\n✅ Certificat reconnu\n\n🔗 ${shareUrl}\n\n#Certus #Formation #Monastir`;

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
        <link rel="canonical" href={shareUrl} />
        
        {/* Open Graph */}
        <meta property="og:title" content={getPageTitle()} />
        <meta property="og:description" content={getPageDescription()} />
        <meta property="og:type" content="article" />
        <meta property="og:url" content={shareUrl} />
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
          
          <span className="inline-flex items-center gap-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-full text-sm font-semibold">
            <span>{langueConfig.flag}</span> {langueConfig.name}
          </span>
          
          {formation.is_online && (
            <span className="inline-flex items-center gap-2 bg-green-100 text-green-700 px-4 py-2 rounded-full text-sm font-semibold">
              🌍 Formation en ligne
            </span>
          )}
          {formation.onDemand && (
            <span className="inline-flex items-center gap-2 bg-orange-100 text-orange-700 px-4 py-2 rounded-full text-sm font-semibold">
              🎯 À la demande (Présentiel)
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

        {/* Lien de test / démo */}
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

        {/* Boutons d'action - Version avec deux boutons d'inscription */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
          {/* Bouton S'inscrire en ligne (uniquement si formation en ligne) */}
          {formation.is_online && (
            <motion.button 
              whileHover={{ scale: 1.05 }} 
              whileTap={{ scale: 0.95 }} 
              onClick={handleInscriptionEnLigne}
              disabled={inscriptionLoading}
              className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 text-white px-8 py-3 rounded-lg font-medium shadow-lg disabled:opacity-50"
            >
              {inscriptionLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Chargement...
                </>
              ) : (
                <>
                  🌍 S'inscrire en ligne
                </>
              )}
            </motion.button>
          )}

          {/* Bouton S'inscrire à la demande (uniquement si formation présentiel/à la demande) */}
          {formation.onDemand && (
            <motion.button 
              whileHover={{ scale: 1.05 }} 
              whileTap={{ scale: 0.95 }} 
              onClick={() => setShowInscriptionDemandeModal(true)}
              className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-orange-500 to-orange-700 hover:from-orange-600 hover:to-orange-800 text-white px-8 py-3 rounded-lg font-medium shadow-lg"
            >
              🏢 S'inscrire à la demande (Présentiel)
            </motion.button>
          )}
          
          {/* Bouton Devis */}
          <motion.button 
            whileHover={{ scale: 1.05 }} 
            whileTap={{ scale: 0.95 }} 
            onClick={() => setShowDevisModal(true)} 
            className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-green-500 to-green-700 hover:from-green-600 hover:to-green-800 text-white px-8 py-3 rounded-lg font-medium shadow-lg"
          >
            📩 Demander un devis
          </motion.button>
        </div>

        {/* Informations complémentaires selon le type de formation */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
          {formation.is_online && (
            <div className="bg-blue-50 rounded-xl p-4 text-center">
              <div className="text-2xl mb-2">🌍</div>
              <h3 className="font-semibold text-blue-800">Formation en ligne</h3>
              <p className="text-sm text-blue-600 mt-1">
                Sessions en direct avec formateur<br />
                Accès aux ressources en ligne<br />
                Certificat à la fin de la formation
              </p>
            </div>
          )}
          
          {formation.onDemand && (
            <div className="bg-orange-50 rounded-xl p-4 text-center">
              <div className="text-2xl mb-2">🏢</div>
              <h3 className="font-semibold text-orange-800">Formation en présentiel</h3>
              <p className="text-sm text-orange-600 mt-1">
                Dans nos locaux à Monastir<br />
                Groupe de 6 à 10 participants<br />
                Programme personnalisé selon vos besoins
              </p>
            </div>
          )}
        </div>

        {/* Partager sur les réseaux sociaux */}
        <div className="text-center mt-8 pt-6 border-t border-gray-200">
          <p className="text-sm text-gray-500 mb-3">Partager cette formation :</p>
          <div className="flex gap-3 justify-center flex-wrap">
            {/* Facebook */}
            <a 
              href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`} 
              target="_blank" 
              rel="noreferrer" 
              className="bg-[#1877f2] text-white p-3 rounded-full w-11 h-11 flex items-center justify-center hover:bg-[#1664d9] transition shadow-md"
              title="Partager sur Facebook"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18.77 7.46H14.5v-1.9c0-.9.6-1.1 1-1.1h3V.5h-4.33C10.24.5 9.5 3.44 9.5 5.32v2.15h-3v4h3v12h5v-12h3.85l.42-4z"/>
              </svg>
            </a>
            
            {/* Instagram */}
            <button
              onClick={() => {
                const imageUrl = formation.images && formation.images[0] ? getImageUrl(formation.images[0]) : null;
                navigator.clipboard.writeText(shareMessage);
                if (imageUrl) {
                  const link = document.createElement('a');
                  link.download = `certus-${formation.title.slice(0, 30)}.jpg`;
                  link.href = imageUrl;
                  link.click();
                  toast.success("✅ Image téléchargée et message copié ! Postez sur Instagram");
                } else {
                  toast.success("✅ Message copié ! Ajoutez une image manuellement sur Instagram");
                }
              }}
              className="bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 text-white p-3 rounded-full w-11 h-11 flex items-center justify-center hover:shadow-lg transition shadow-md"
              title="Partager sur Instagram"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
              </svg>
            </button>
            
            {/* TikTok */}
            <button
              onClick={() => {
                navigator.clipboard.writeText(shareMessage);
                toast.success("✅ Message copié ! Créez une vidéo TikTok avec ce message");
              }}
              className="bg-black text-white p-3 rounded-full w-11 h-11 flex items-center justify-center hover:bg-gray-800 transition shadow-md"
              title="Partager sur TikTok"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 01-.01-2.93 2.82 2.82 0 012.52-1.59 2.83 2.83 0 01.82.12v-3.5a6.31 6.31 0 00-1.83-.26 6.21 6.21 0 00-5.54 3.27 6.23 6.23 0 00.46 6.61 6.21 6.21 0 005.17 2.61c.13 0 .26 0 .39-.01 2.48-.1 4.7-1.53 5.69-3.68a6.18 6.18 0 00.51-2.55V7.46a7.79 7.79 0 004.54 1.5v-3.4a4.78 4.78 0 01-1.63-.87z"/>
              </svg>
            </button>
            
            {/* LinkedIn */}
            <a 
              href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`} 
              target="_blank" 
              rel="noreferrer" 
              className="bg-[#0a66c2] text-white p-3 rounded-full w-11 h-11 flex items-center justify-center hover:bg-[#094d9e] transition shadow-md"
              title="Partager sur LinkedIn"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452z"/>
              </svg>
            </a>

            {/* WhatsApp */}
            <a 
              href={`https://wa.me/?text=${encodeURIComponent(shareMessage)}`} 
              target="_blank" 
              rel="noreferrer" 
              className="bg-[#25D366] text-white p-3 rounded-full w-11 h-11 flex items-center justify-center hover:bg-[#20bd59] transition shadow-md"
              title="Partager sur WhatsApp"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.149-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.01-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.095 3.2 5.076 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
              </svg>
            </a>
          </div>
          
          <p className="text-xs text-gray-400 mt-3">
            💡 Pour Instagram : l'image est téléchargée automatiquement
          </p>
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

      {/* Modal Inscription à la demande (Présentiel) */}
      <ModalInscriptionDemande
        isOpen={showInscriptionDemandeModal}
        onClose={() => setShowInscriptionDemandeModal(false)}
        formation={formation}
        onSuccess={() => {
          setShowInscriptionDemandeModal(false);
          toast.success("✅ Votre demande a été envoyée ! L'équipe Certus vous contactera.");
        }}
      />
    </>
  );
}