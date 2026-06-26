import React, { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import { supabaseSelect, supabaseInsert } from "../supabaseFetch";
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
        const data = await supabaseSelect("formations", { id: id });
        setFormation(data?.[0] || null);
      } catch (err) {
        console.error("Erreur fetch:", err);
        setFormation(null);
      } finally {
        setLoading(false);
      }
    };
    fetchFormation();
  }, [id]);

  // Fonctions mémorisées
  const handleNavigateBack = useCallback(() => {
    navigate("/formations");
  }, [navigate]);

  const handleDevisChange = useCallback((e) => {
    setDevisData({ ...devisData, [e.target.name]: e.target.value });
  }, [devisData]);

  const handleCloseDevisModal = useCallback(() => {
    setShowDevisModal(false);
  }, []);

  const handleCloseInscriptionModal = useCallback(() => {
    setShowInscriptionDemandeModal(false);
  }, []);

  const handleInscriptionDemande = useCallback(() => {
    setShowInscriptionDemandeModal(true);
  }, []);

  const handleImageSelect = useCallback((idx) => {
    setSelectedImage(idx);
  }, []);

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
  }, [devisData, formation]);

  const handleInscriptionEnLigne = useCallback(async () => {
    setInscriptionLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        const redirectUrl = `/confirm-inscription?formation=${formation.id}`;
        navigate(`/inscription?redirect=${encodeURIComponent(redirectUrl)}`);
        return;
      }

      const existing = await supabaseSelect("inscriptions", { 
        filter: `user_id=eq.${user.id}&formation_id=eq.${formation.id}`
      });

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
  }, [formation, navigate]);

  const themeConfig = formation ? getThemeConfig(formation.theme) : THEME_CONFIG.digital;
  const langueConfig = formation ? getLangueConfig(formation.langue) : LANGUE_CONFIG.fr;

  if (loading) {
    return (
      <main role="main" className="flex justify-center items-center h-64 mt-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" aria-label="Chargement de la formation"></div>
      </main>
    );
  }

  if (!formation) {
    return (
      <main role="main" className="text-center mt-20">
        <p className="text-red-600">Formation introuvable</p>
        <button onClick={handleNavigateBack} className="mt-4 bg-blue-600 text-white px-4 py-2 rounded" aria-label="Retour à la liste des formations">
          Retour aux formations
        </button>
      </main>
    );
  }

  return (
    <>
      <Helmet>
        <html lang={formation.langue || "fr"} dir={langueConfig.direction} />
        <title>{formation.title} | Centre Certus Monastir</title>
        <meta name="description" content={formation.description} />
        <meta name="keywords" content={`${formation.title}, formation ${formation.theme}, Certus Monastir, centre formation Tunisie`} />
        <link rel="canonical" href={`https://centrecertusdeformation.tn/formations/${formation.id}`} />
        
        {/* JSON-LD pour SEO */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Course",
            "name": formation.title,
            "description": formation.description || formation.fullDescription,
            "provider": {
              "@type": "EducationalOrganization",
              "name": "Centre Certus de Formation",
              "url": "https://centrecertusdeformation.tn",
              "address": {
                "@type": "PostalAddress",
                "addressLocality": "Monastir",
                "addressCountry": "TN"
              }
            },
            "duration": formation.duration,
            "offers": {
              "@type": "Offer",
              "price": formation.price || "Sur devis",
              "priceCurrency": "TND",
              "availability": "https://schema.org/InStock"
            },
            "hasCourseInstance": {
              "@type": "CourseInstance",
              "courseMode": formation.is_online ? "online" : "onsite",
              "location": {
                "@type": "Place",
                "address": {
                  "@type": "PostalAddress",
                  "addressLocality": "Monastir",
                  "addressCountry": "TN"
                }
              }
            }
          })}
        </script>
      </Helmet>

      <main role="main" id="main-content">
        <div className="max-w-6xl mx-auto px-4 py-8 mt-20" dir={langueConfig.direction}>
          <button 
            onClick={handleNavigateBack} 
            className="mb-6 text-gray-600 hover:text-blue-600 transition"
            aria-label="Retour à la liste des formations"
          >
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

          {/* Durée et Prix */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto mb-8">
            <div className="bg-gray-50 p-4 rounded-xl text-center border border-gray-200">
              <p className="text-xs text-gray-600 uppercase tracking-wide">Durée</p>
              <p className="text-xl font-semibold text-gray-800">{formation.duration || "Non spécifiée"}</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-xl text-center border border-gray-200">
              <p className="text-xs text-gray-600 uppercase tracking-wide">Tarif</p>
              <p className="text-xl font-semibold text-gray-800">{formation.price || "Sur devis"}</p>
            </div>
          </div>

          {/* Images */}
          {formation.images && formation.images.length > 0 ? (
            <div className="mb-8">
              <div className="relative h-96 rounded-xl overflow-hidden shadow-xl mb-4 bg-gray-100">
                <img 
                  src={getImageUrl(formation.images[selectedImage])} 
                  alt={`${formation.title} - Image principale de la formation`}
                  width="800"
                  height="400"
                  loading="lazy"
                  className="w-full h-full object-contain"
                  onError={(e) => { e.target.onerror = null; e.target.src = "https://placehold.co/800x400?text=Image+non+disponible"; }}
                />
              </div>
              {formation.images.length > 1 && (
                <div className="flex gap-2 justify-center flex-wrap" role="list" aria-label="Miniatures des images de la formation">
                  {formation.images.map((img, idx) => (
                    <img 
                      key={idx} 
                      src={getImageUrl(img)} 
                      alt={`Aperçu ${idx + 1} de la formation ${formation.title}`}
                      width="80"
                      height="80"
                      loading="lazy"
                      className={`w-20 h-20 object-cover rounded-lg cursor-pointer transition-all ${selectedImage === idx ? "ring-2 ring-blue-500 shadow-lg" : "opacity-70 hover:opacity-100"}`} 
                      onClick={() => handleImageSelect(idx)}
                      onError={(e) => { e.target.onerror = null; e.target.style.display = "none"; }}
                      role="button"
                      tabIndex="0"
                      aria-label={`Afficher l'image ${idx + 1} de ${formation.title}`}
                    />
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="mb-8 bg-gray-100 rounded-xl h-64 flex items-center justify-center" role="img" aria-label="Image non disponible">
              <div className="text-center text-6xl">📚</div>
            </div>
          )}

          {/* Description courte */}
          {formation.description && (
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-700 mb-2">Description</h2>
              <p className="text-gray-700 leading-relaxed">{formation.description}</p>
            </div>
          )}

          {/* Description complète */}
          {formation.fullDescription && (
            <div className="mb-8 bg-gray-50 p-6 rounded-xl border border-gray-200">
              <h2 className="text-xl font-semibold text-gray-700 mb-3">Description détaillée</h2>
              <div className="text-gray-700 leading-relaxed whitespace-pre-line">{formation.fullDescription}</div>
            </div>
          )}

          {/* Lien de test / démo */}
          {formation.test_link && (
            <div className="mb-8 bg-blue-50 p-6 rounded-xl border border-blue-200">
              <h2 className="text-xl font-semibold text-blue-800 mb-3 flex items-center gap-2">
                <span aria-hidden="true">🔗</span> Test de niveau / Démo
              </h2>
              <p className="text-gray-700 mb-4">
                Évaluez votre niveau ou découvrez un aperçu de la formation :
              </p>
              <motion.a 
                whileHover={{ scale: 1.02 }} 
                href={formation.test_link} 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg font-medium shadow-md hover:bg-blue-700 transition"
                aria-label="Accéder au test de niveau ou à la démo de la formation"
              >
                <span aria-hidden="true">🚀</span> Accéder au test / démo
                <span aria-hidden="true">→</span>
              </motion.a>
            </div>
          )}

          {/* Lien de préinscription */}
          {formation.preinscriptionLink && (
            <div className="mb-8 bg-green-50 p-6 rounded-xl border border-green-200">
              <h2 className="text-xl font-semibold text-green-800 mb-3 flex items-center gap-2">
                <span aria-hidden="true">📝</span> Préinscription
              </h2>
              <p className="text-gray-700 mb-4">
                Vous pouvez vous préinscrire directement via le lien ci-dessous :
              </p>
              <motion.a 
                whileHover={{ scale: 1.02 }} 
                href={formation.preinscriptionLink} 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-green-600 text-white px-6 py-3 rounded-lg font-medium shadow-md hover:bg-green-700 transition"
                aria-label="Préinscription à la formation"
              >
                <span aria-hidden="true">📝</span> Préinscription
                <span aria-hidden="true">→</span>
              </motion.a>
            </div>
          )}

          {/* Informations complémentaires */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            {(formation.capacite_min || formation.capacite_max) && (
              <div className="bg-gray-50 rounded-xl p-4 text-center">
                <h3 className="font-semibold text-gray-700">👥 Effectif</h3>
                <p className="text-gray-700">Groupe de {formation.capacite_min || 6} à {formation.capacite_max || 10} participants</p>
              </div>
            )}
            <div className="bg-gray-50 rounded-xl p-4 text-center">
              <h3 className="font-semibold text-gray-700">🎓 Certification</h3>
              <p className="text-gray-700">Certificat reconnu à la fin de la formation</p>
            </div>
          </div>

          {/* Boutons d'inscription */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
            {formation.is_online && (
              <button 
                onClick={handleInscriptionEnLigne}
                disabled={inscriptionLoading}
                className="bg-gradient-to-r from-blue-500 to-blue-700 text-white px-8 py-3 rounded-lg font-medium shadow-lg disabled:opacity-50 hover:shadow-xl transition-all"
                aria-label={`S'inscrire en ligne à la formation ${formation.title}`}
              >
                {inscriptionLoading ? "Chargement..." : "🌍 S'inscrire en ligne"}
              </button>
            )}

            {formation.onDemand && (
              <button 
                onClick={handleInscriptionDemande}
                className="bg-gradient-to-r from-orange-500 to-orange-700 text-white px-8 py-3 rounded-lg font-medium shadow-lg hover:shadow-xl transition-all"
                aria-label={`S'inscrire en présentiel à la formation ${formation.title}`}
              >
                🏢 S'inscrire à la demande (Présentiel)
              </button>
            )}
            
            <button 
              onClick={() => setShowDevisModal(true)} 
              className="bg-gradient-to-r from-green-500 to-green-700 text-white px-8 py-3 rounded-lg font-medium shadow-lg hover:shadow-xl transition-all"
              aria-label="Demander un devis pour cette formation"
            >
              📩 Demander un devis
            </button>
          </div>

          {/* Modal Devis */}
          {showDevisModal && (
            <div 
              className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4" 
              onClick={handleCloseDevisModal}
              role="dialog"
              aria-modal="true"
              aria-labelledby="devis-modal-title"
            >
              <div className="relative max-w-2xl w-full bg-white rounded-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                <div className="bg-gradient-to-r from-[#1a56db] to-[#76c21f] text-white px-6 py-4 sticky top-0">
                  <div className="flex justify-between items-center">
                    <div>
                      <h2 id="devis-modal-title" className="text-xl font-bold">Demande de devis</h2>
                      <p className="text-blue-100 text-sm">Pour : {formation.title}</p>
                    </div>
                    <button 
                      onClick={handleCloseDevisModal} 
                      className="text-white text-2xl hover:text-gray-200"
                      aria-label="Fermer la modal de devis"
                    >
                      ✕
                    </button>
                  </div>
                </div>
                <form onSubmit={sendDevis} className="p-6 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="devis-name" className="sr-only">Nom complet</label>
                      <input 
                        id="devis-name"
                        type="text" 
                        name="name" 
                        placeholder="Nom complet *" 
                        required 
                        value={devisData.name} 
                        onChange={handleDevisChange} 
                        className="border border-gray-300 rounded-lg px-4 py-2 w-full focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                        autoComplete="name"
                      />
                    </div>
                    <div>
                      <label htmlFor="devis-email" className="sr-only">Email</label>
                      <input 
                        id="devis-email"
                        type="email" 
                        name="email" 
                        placeholder="Email *" 
                        required 
                        value={devisData.email} 
                        onChange={handleDevisChange} 
                        className="border border-gray-300 rounded-lg px-4 py-2 w-full focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                        autoComplete="email"
                      />
                    </div>
                    <div>
                      <label htmlFor="devis-telephone" className="sr-only">Téléphone</label>
                      <input 
                        id="devis-telephone"
                        type="tel" 
                        name="telephone" 
                        placeholder="Téléphone *" 
                        required 
                        value={devisData.telephone} 
                        onChange={handleDevisChange} 
                        className="border border-gray-300 rounded-lg px-4 py-2 w-full focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                        autoComplete="tel"
                      />
                    </div>
                    <div>
                      <label htmlFor="devis-city" className="sr-only">Ville</label>
                      <input 
                        id="devis-city"
                        type="text" 
                        name="city" 
                        placeholder="Ville" 
                        value={devisData.city} 
                        onChange={handleDevisChange} 
                        className="border border-gray-300 rounded-lg px-4 py-2 w-full focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                        autoComplete="address-level2"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label htmlFor="devis-country" className="sr-only">Pays d'origine</label>
                      <select 
                        id="devis-country"
                        name="country" 
                        required 
                        value={devisData.country} 
                        onChange={handleDevisChange} 
                        className="border border-gray-300 rounded-lg px-4 py-2 w-full focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">Pays d'origine *</option>
                        <option value="Tunisie">🇹🇳 Tunisie</option>
                        <option value="France">🇫🇷 France</option>
                        <option value="Belgique">🇧🇪 Belgique</option>
                        <option value="Suisse">🇨🇭 Suisse</option>
                        <option value="Canada">🇨🇦 Canada</option>
                        <option value="Autre">🌍 Autre pays</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label htmlFor="devis-message" className="sr-only">Message</label>
                    <textarea 
                      id="devis-message"
                      name="message" 
                      rows="3" 
                      placeholder="Message / Projet" 
                      value={devisData.message} 
                      onChange={handleDevisChange} 
                      className="border border-gray-300 rounded-lg px-4 py-2 w-full focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                    />
                  </div>
                  <button 
                    type="submit" 
                    disabled={sendingDevis} 
                    className="w-full bg-gradient-to-r from-[#1a56db] to-[#76c21f] text-white py-3 rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50"
                  >
                    {sendingDevis ? "Envoi en cours..." : "📩 Envoyer la demande"}
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* Modal Inscription présentiel */}
          <ModalInscriptionDemande
            isOpen={showInscriptionDemandeModal}
            onClose={handleCloseInscriptionModal}
            formation={formation}
            onSuccess={() => {
              setShowInscriptionDemandeModal(false);
              toast.success("✅ Demande envoyée ! L'équipe Certus vous contactera.");
            }}
          />
        </div>
      </main>
    </>
  );
}