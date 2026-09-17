// frontend/src/pages/FormationDetail.jsx
import React, { useEffect, useState, useCallback, useMemo, useRef } from "react";
import { useParams, useNavigate, useLocation, Link } from "react-router-dom";
import { supabase } from "../supabaseClient";
import { supabaseSelect, supabaseInsert } from "../supabaseFetch";
import { motion } from "framer-motion";
import { Helmet } from "react-helmet-async";
import { toast } from "react-toastify";
import emailjs from "@emailjs/browser";
import ModalInscriptionDemande from "../components/ModalInscriptionDemande";

// ============================================
// CONFIGURATION
// ============================================
const EMAILJS_CONFIG = {
  PUBLIC_KEY: "LNbKohuUxse3qtZjG",
  SERVICE_ID: "service_ixutrbl",
  TEMPLATE_ID: "template_5iq0uco"
};

const THEME_CONFIG = {
  digital: { name: "Digital & Web", icon: "💻", color: "bg-blue-100 text-blue-700" },
  data: { name: "Data & IA", icon: "📊", color: "bg-purple-100 text-purple-700" },
  design: { name: "Design & Créativité", icon: "🎨", color: "bg-pink-100 text-pink-700" },
  management: { name: "Management & Leadership", icon: "📈", color: "bg-green-100 text-green-700" },
  finance: { name: "Finance & Comptabilité", icon: "💰", color: "bg-yellow-100 text-yellow-700" },
  energie: { name: "Énergies renouvelables", icon: "🌱", color: "bg-teal-100 text-teal-700" },
  langues: { name: "Langues & Communication", icon: "🗣️", color: "bg-indigo-100 text-indigo-700" }
};

const LANGUE_CONFIG = {
  fr: { name: "Français", flag: "🇫🇷", direction: "ltr" },
  en: { name: "English", flag: "🇬🇧", direction: "ltr" },
  ar: { name: "العربية", flag: "🇹🇳", direction: "rtl" }
};

// ============================================
// HELPERS
// ============================================
const isUUID = (str) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);

// ============================================
// COMPOSANT PRINCIPAL
// ============================================
export default function FormationDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [formation, setFormation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null); // ✅ AJOUT : état d'erreur
  const [selectedImage, setSelectedImage] = useState(0);
  const [showDevisModal, setShowDevisModal] = useState(false);
  const [showInscriptionDemandeModal, setShowInscriptionDemandeModal] = useState(false);
  const [sendingDevis, setSendingDevis] = useState(false);
  const [inscriptionLoading, setInscriptionLoading] = useState(false);
  const [devisData, setDevisData] = useState({
    name: "", email: "", telephone: "", city: "", country: "", formation: "",
    hebergement: "non", hebergementType: "", visaAssistance: "non", source: "", message: ""
  });

  const shareInProgress = useRef(false);

  // ============================================
  // getImageUrl
  // ============================================
  const getImageUrl = useCallback((path) => {
    if (!path) return null;
    try {
      const { data } = supabase.storage.from("uploads").getPublicUrl(path);
      return data.publicUrl;
    } catch (error) {
      console.error("Erreur chargement image:", error);
      return null;
    }
  }, []);

  // ============================================
  // MEMOIZED VALUES
  // ============================================
  const themeConfig = useMemo(() => 
    THEME_CONFIG[formation?.theme] || THEME_CONFIG.digital,
    [formation?.theme]
  );

  const langueConfig = useMemo(() => 
    LANGUE_CONFIG[formation?.langue] || LANGUE_CONFIG.fr,
    [formation?.langue]
  );

  const formationImage = useMemo(() => 
    formation?.images?.[0] ? getImageUrl(formation.images[0]) : null,
    [formation?.images, getImageUrl]
  );

  const canonicalUrl = useMemo(() => 
    formation?.slug 
      ? `https://centrecertusdeformation.tn/formations/${formation.slug}`
      : `https://centrecertusdeformation.tn/formations/${formation?.id}`,
    [formation?.slug, formation?.id]
  );

  // ============================================
  // INIT EMAILJS
  // ============================================
  useEffect(() => {
    emailjs.init(EMAILJS_CONFIG.PUBLIC_KEY);
  }, []);

  // ============================================
  // ✅ CHARGEMENT DE LA FORMATION (AMÉLIORÉ)
  // ============================================
  useEffect(() => {
    let isMounted = true;

    const fetchFormation = async () => {
      if (!slug) {
        setError("Slug manquant dans l'URL");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        console.log('🔍 Chargement formation avec slug:', slug);

        let query = supabase.from('formations').select('*');
        
        if (isUUID(slug)) {
          query = query.eq('id', slug);
        } else {
          query = query.eq('slug', slug);
        }
        
        const { data, error: fetchError } = await query.maybeSingle();
        
        if (!isMounted) return;

        if (fetchError) {
          console.error('❌ Erreur Supabase:', fetchError);
          setError(`Erreur de chargement : ${fetchError.message}`);
          setLoading(false);
          return;
        }

        if (!data) {
          console.warn('⚠️ Formation non trouvée pour slug:', slug);
          setError(`Aucune formation trouvée avec le slug "${slug}"`);
          setLoading(false);
          return;
        }

        console.log('✅ Formation chargée:', data.title);
        setFormation(data);
        setError(null);
      } catch (err) {
        console.error("❌ Exception fetchFormation:", err);
        if (isMounted) {
          setError(`Erreur inattendue : ${err.message}`);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    
    fetchFormation();

    return () => {
      isMounted = false;
    };
  }, [slug]);

  // ============================================
  // NAVIGATION
  // ============================================
  const handleNavigateBack = useCallback(() => navigate("/formations"), [navigate]);

  // ============================================
  // ✅ TEST - Navigation directe (plus de nouvelle fenêtre)
  // ============================================
  const handleOpenTest = useCallback(() => {
    if (!formation) return;
    
    // Détection du type de test
    const formationSlug = (formation.slug || '').toLowerCase();
    const formationTitle = (formation.title || '').toLowerCase();

    let testUrl = `/test/${formation.slug || formation.id}`;

    // Test Excel Débutant
    if (
      formationSlug.includes('excel-debutant') ||
      (formationTitle.includes('excel') && formationTitle.includes('débutant'))
    ) {
      testUrl = '/test/excel-debutant';
    }
    // Test Excel Avancé
    else if (
      formationSlug.includes('excel-avance') ||
      (formationTitle.includes('excel') && formationTitle.includes('avancé'))
    ) {
      testUrl = '/test/excel-avance';
    }

    navigate(testUrl);
  }, [formation, navigate]);

  // ============================================
  // DEVIS
  // ============================================
  const handleDevisChange = useCallback((e) => {
    setDevisData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  }, []);

  const sendDevis = useCallback(async (e) => {
    e.preventDefault();
    setSendingDevis(true);
    try {
      const templateParams = {
        ...devisData,
        formation: formation?.title || devisData.formation,
        city: devisData.city || "Non renseignée",
        hebergementType: devisData.hebergementType || "Non renseigné",
        source: devisData.source || "Non renseignée",
        date: new Date().toLocaleDateString('fr-FR')
      };
      
      await emailjs.send(EMAILJS_CONFIG.SERVICE_ID, EMAILJS_CONFIG.TEMPLATE_ID, templateParams);
      
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

  // ============================================
  // INSCRIPTION
  // ============================================
  const handleInscriptionEnLigne = useCallback(async () => {
    if (!formation) return;
    
    setInscriptionLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        navigate(`/inscription?redirect=/confirm-inscription?formation=${formation.id}`);
        return;
      }

      const existing = await supabaseSelect("inscriptions", { 
        filter: `user_id=eq.${user.id}&formation_id=eq.${formation.id}`
      });

      if (existing?.length > 0) {
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

  // ============================================
  // PARTAGE
  // ============================================
  const share = useCallback(async (platform) => {
    if (!formation || shareInProgress.current) return;
    shareInProgress.current = true;

    try {
      const url = window.location.href;
      const title = `${formation?.title} | Centre Certus`;
      const text = `Découvrez la formation "${formation?.title}" au Centre Certus de Monastir`;

      if (platform === 'native' && navigator.share) {
        await navigator.share({ title, text, url });
        toast.success("✅ Partagé avec succès !");
      } else if (platform === 'facebook') {
        const fbUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&display=popup&hashtag=#CertusFormation`;
        window.open(fbUrl, 'facebook-share', 'width=600,height=500,scrollbars=yes,resizable=yes');
        toast.success("📘 Fenêtre de partage ouverte !");
      } else if (platform === 'email') {
        window.location.href = `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(text + '\n\n' + url)}`;
      } else if (platform === 'copy') {
        await navigator.clipboard.writeText(`${text}\n${url}`);
        toast.success("📋 Lien copié !");
      }
    } catch (error) {
      if (error.name !== 'AbortError') {
        console.error("❌ Erreur partage:", error);
        toast.error("❌ Erreur lors du partage");
      }
    } finally {
      setTimeout(() => { shareInProgress.current = false; }, 1500);
    }
  }, [formation]);

  // ============================================
  // ✅ LOADING
  // ============================================
  if (loading) {
    return (
      <main className="flex justify-center items-center min-h-screen mt-20">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto" />
          <p className="mt-4 text-gray-500 text-sm">Chargement de la formation...</p>
        </div>
      </main>
    );
  }

  // ============================================
  // ✅ ERREUR (au lieu de rediriger vers /404)
  // ============================================
  if (error || !formation) {
    return (
      <>
        <Helmet>
          <title>Formation introuvable | Centre Certus</title>
        </Helmet>
        <main className="max-w-2xl mx-auto px-4 py-20 mt-20 text-center">
          <div className="text-7xl mb-6">📚</div>
          <h1 className="text-3xl font-bold text-gray-800 mb-4">
            Formation introuvable
          </h1>
          <p className="text-gray-600 mb-8">
            {error || `Aucune formation ne correspond à "${slug}"`}
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <button 
              onClick={handleNavigateBack} 
              className="bg-blue-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-blue-700 transition shadow-lg"
            >
              ← Retour aux formations
            </button>
            <Link
              to="/formations?search=excel"
              className="bg-gray-200 text-gray-700 px-6 py-3 rounded-xl font-medium hover:bg-gray-300 transition"
            >
              🔍 Rechercher une formation
            </Link>
          </div>

          {/* Debug info en développement */}
          {import.meta.env.DEV && (
            <div className="mt-8 p-4 bg-gray-100 rounded-lg text-left text-xs font-mono">
              <p><strong>Slug demandé :</strong> {slug}</p>
              <p><strong>Est UUID :</strong> {isUUID(slug || '') ? 'Oui' : 'Non'}</p>
              <p><strong>Erreur :</strong> {error || 'Aucune'}</p>
            </div>
          )}
        </main>
      </>
    );
  }

  // ============================================
  // RENDER
  // ============================================
  return (
    <>
      <Helmet>
        <html lang={formation.langue || "fr"} dir={langueConfig.direction} />
        <title>{formation.title} | Centre Certus Monastir</title>
        <meta name="description" content={formation.description || formation.fullDescription?.substring(0, 160)} />
        <meta name="keywords" content={`${formation.title}, formation ${formation.theme}, Certus Monastir, centre formation Tunisie`} />
        <link rel="canonical" href={canonicalUrl} />
        
        <meta property="og:type" content="website" />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:title" content={`${formation.title} | Centre Certus Monastir`} />
        <meta property="og:description" content={formation.description || `Formation ${formation.title} au Centre Certus de Monastir.`} />
        <meta property="og:site_name" content="Centre Certus de Formation" />
        {formationImage ? (
          <>
            <meta property="og:image" content={formationImage} />
            <meta property="og:image:secure_url" content={formationImage} />
            <meta property="og:image:width" content="1200" />
            <meta property="og:image:height" content="630" />
          </>
        ) : (
          <meta property="og:image" content="https://centrecertusdeformation.tn/logo-certus.webp" />
        )}
        
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={`${formation.title} | Centre Certus`} />
        <meta name="twitter:description" content={formation.description || `Formation ${formation.title} au Centre Certus de Monastir`} />
        {formationImage ? (
          <meta name="twitter:image" content={formationImage} />
        ) : (
          <meta name="twitter:image" content="https://centrecertusdeformation.tn/logo-certus.webp" />
        )}
        
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
              "address": { "@type": "PostalAddress", "addressLocality": "Monastir", "addressCountry": "TN" }
            },
            "duration": formation.duration,
            "offers": {
              "@type": "Offer",
              "price": formation.price || "Sur devis",
              "priceCurrency": "TND",
              "availability": "https://schema.org/InStock"
            }
          })}
        </script>
      </Helmet>

      <main className="max-w-6xl mx-auto px-4 py-8 mt-20" dir={langueConfig.direction}>
        <button onClick={handleNavigateBack} className="mb-6 text-gray-600 hover:text-blue-600 transition">
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
            <span className="bg-green-100 text-green-700 px-4 py-2 rounded-full text-sm font-semibold">🌍 En ligne</span>
          )}
          {formation.onDemand && (
            <span className="bg-orange-100 text-orange-700 px-4 py-2 rounded-full text-sm font-semibold">🏢 Présentiel</span>
          )}
          {formation.has_test && formation.test_free && (
            <span className="bg-green-100 text-green-700 px-4 py-2 rounded-full text-sm font-semibold animate-pulse">
              🧪 Test gratuit
            </span>
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
        {formation.images?.length > 0 ? (
          <div className="mb-8">
            <div className="relative h-96 rounded-xl overflow-hidden shadow-xl mb-4 bg-gray-100">
              <img 
                src={getImageUrl(formation.images[selectedImage])} 
                alt={`${formation.title}`}
                width="800" height="400"
                loading="lazy"
                className="w-full h-full object-contain"
                onError={(e) => { e.target.src = "https://placehold.co/800x400?text=Image+non+disponible"; }}
              />
            </div>
            {formation.images.length > 1 && (
              <div className="flex gap-2 justify-center flex-wrap">
                {formation.images.map((img, idx) => (
                  <img 
                    key={idx} 
                    src={getImageUrl(img)} 
                    alt={`Aperçu ${idx + 1}`}
                    width="80" height="80"
                    loading="lazy"
                    className={`w-20 h-20 object-cover rounded-lg cursor-pointer transition-all ${selectedImage === idx ? "ring-2 ring-blue-500 shadow-lg" : "opacity-70 hover:opacity-100"}`} 
                    onClick={() => setSelectedImage(idx)}
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

        {/* Lien test / démo */}
        {formation.test_link && (
          <div className="mb-8 bg-blue-50 p-6 rounded-xl border border-blue-200">
            <h2 className="text-xl font-semibold text-blue-800 mb-3 flex items-center gap-2">🔗 Test de niveau / Démo</h2>
            <p className="text-gray-700 mb-4">Évaluez votre niveau ou découvrez un aperçu de la formation :</p>
            <motion.a 
              whileHover={{ scale: 1.02 }} 
              href={formation.test_link} 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg font-medium shadow-md hover:bg-blue-700 transition"
            >
              🚀 Accéder au test / démo →
            </motion.a>
          </div>
        )}

        {/* Préinscription */}
        {formation.preinscriptionLink && (
          <div className="mb-8 bg-green-50 p-6 rounded-xl border border-green-200">
            <h2 className="text-xl font-semibold text-green-800 mb-3 flex items-center gap-2">📝 Préinscription</h2>
            <p className="text-gray-700 mb-4">Vous pouvez vous préinscrire directement via le lien ci-dessous :</p>
            <motion.a 
              whileHover={{ scale: 1.02 }} 
              href={formation.preinscriptionLink} 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-green-600 text-white px-6 py-3 rounded-lg font-medium shadow-md hover:bg-green-700 transition"
            >
              📝 Préinscription →
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

        {/* ============================================
            ✅ BOUTONS D'ACTION
            ============================================ */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
          {/* ✅ Bouton Test */}
          {formation.has_test === true && (
            <button 
              onClick={handleOpenTest}
              className="bg-gradient-to-r from-purple-500 to-purple-700 text-white px-8 py-3 rounded-lg font-medium shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
              aria-label={`Faire le test pour ${formation.title}`}
            >
              <span>🧪</span> Faire le test gratuit
            </button>
          )}

          {formation.is_online && (
            <button 
              onClick={handleInscriptionEnLigne}
              disabled={inscriptionLoading}
              className="bg-gradient-to-r from-blue-500 to-blue-700 text-white px-8 py-3 rounded-lg font-medium shadow-lg disabled:opacity-50 hover:shadow-xl transition-all"
            >
              {inscriptionLoading ? "Chargement..." : "🌍 S'inscrire en ligne"}
            </button>
          )}

          {formation.onDemand && (
            <button 
              onClick={() => setShowInscriptionDemandeModal(true)}
              className="bg-gradient-to-r from-orange-500 to-orange-700 text-white px-8 py-3 rounded-lg font-medium shadow-lg hover:shadow-xl transition-all"
            >
              🏢 S'inscrire à la demande (Présentiel)
            </button>
          )}
          
          <button 
            onClick={() => setShowDevisModal(true)} 
            className="bg-gradient-to-r from-green-500 to-green-700 text-white px-8 py-3 rounded-lg font-medium shadow-lg hover:shadow-xl transition-all"
          >
            📩 Demander un devis
          </button>
        </div>

        {/* BOUTONS DE PARTAGE */}
        <div className="mb-8 mt-8">
          <div className="flex flex-wrap items-center justify-center gap-3">
            <span className="text-sm font-medium text-gray-600 mr-2">📤 Partager :</span>
            
            {navigator.share && (
              <button onClick={() => share('native')} className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white px-5 py-2.5 rounded-lg text-sm font-medium transition shadow-md hover:shadow-lg">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92 1.61 0 2.92-1.31 2.92-2.92s-1.31-2.92-2.92-2.92z"/>
                </svg>
                Partager
              </button>
            )}
            
            <button onClick={() => share('facebook')} className="flex items-center gap-2 bg-[#1877f2] hover:bg-[#0d65d9] text-white px-5 py-2.5 rounded-lg text-sm font-medium transition shadow-md hover:shadow-lg">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
              Facebook
            </button>

            <button onClick={() => share('email')} className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition shadow-md hover:shadow-lg">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
              </svg>
              Email
            </button>

            <button onClick={() => share('copy')} className="flex items-center gap-2 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition shadow-md hover:shadow-lg">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"/>
              </svg>
              Copier
            </button>
          </div>
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
                  <button onClick={() => setShowDevisModal(false)} className="text-white text-2xl hover:text-gray-200">✕</button>
                </div>
              </div>
              <form onSubmit={sendDevis} className="p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input type="text" name="name" placeholder="Nom complet *" required value={devisData.name} onChange={handleDevisChange} className="border border-gray-300 rounded-lg px-4 py-2 w-full focus:ring-2 focus:ring-blue-500" />
                  <input type="email" name="email" placeholder="Email *" required value={devisData.email} onChange={handleDevisChange} className="border border-gray-300 rounded-lg px-4 py-2 w-full focus:ring-2 focus:ring-blue-500" />
                  <input type="tel" name="telephone" placeholder="Téléphone *" required value={devisData.telephone} onChange={handleDevisChange} className="border border-gray-300 rounded-lg px-4 py-2 w-full focus:ring-2 focus:ring-blue-500" />
                  <input type="text" name="city" placeholder="Ville" value={devisData.city} onChange={handleDevisChange} className="border border-gray-300 rounded-lg px-4 py-2 w-full focus:ring-2 focus:ring-blue-500" />
                  <div className="md:col-span-2">
                    <select name="country" required value={devisData.country} onChange={handleDevisChange} className="border border-gray-300 rounded-lg px-4 py-2 w-full focus:ring-2 focus:ring-blue-500">
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
                <textarea name="message" rows="3" placeholder="Message / Projet" value={devisData.message} onChange={handleDevisChange} className="border border-gray-300 rounded-lg px-4 py-2 w-full focus:ring-2 focus:ring-blue-500" />
                <button type="submit" disabled={sendingDevis} className="w-full bg-gradient-to-r from-[#1a56db] to-[#76c21f] text-white py-3 rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50">
                  {sendingDevis ? "Envoi en cours..." : "📩 Envoyer la demande"}
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
      </main>
    </>
  );
}