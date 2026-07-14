// frontend/src/App.jsx
import React, { Suspense, lazy, useEffect } from "react";
import { Routes, Route, useLocation, Link, Navigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Helmet, HelmetProvider } from 'react-helmet-async';
import Navbar from "./components/Navbar";
import PrivateRoute from "./routes/PrivateRoute";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { supabase } from "./supabaseClient";

const PageLoader = () => (
  <div className="flex justify-center items-center h-64">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1a56db]"></div>
  </div>
);

// Fallback simple en cas d'erreur
const ErrorFallback = ({ error, resetError }) => (
  <div className="min-h-screen pt-20 flex items-center justify-center bg-gray-50">
    <div className="bg-white p-8 rounded-xl shadow-lg max-w-md text-center">
      <div className="text-red-500 text-5xl mb-4">⚠️</div>
      <h2 className="text-xl font-bold text-gray-800 mb-2">Une erreur est survenue</h2>
      <p className="text-gray-600 mb-4">{error?.message || "Erreur inconnue"}</p>
      <button 
        onClick={resetError}
        className="bg-[#1a56db] text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
      >
        Recharger la page
      </button>
    </div>
  </div>
);

// ============ PAGES EXISTANTES ============
const Home = lazy(() => import("./pages/Home"));
const Contact = lazy(() => import("./pages/Contact"));
const Connexion = lazy(() => import("./pages/Connexion"));
const Formations = lazy(() => import("./pages/Formations"));
const FormationDetail = lazy(() => import("./pages/FormationDetail"));
const Actualite = lazy(() => import("./pages/Actualite"));
const Inscription = lazy(() => import("./pages/Inscription"));
const AproposDeCertus = lazy(() => import("./pages/AproposDeCertus"));
const EspaceParticipant = lazy(() => import("./pages/EspaceParticipant"));
const EspaceFormateur = lazy(() => import("./pages/EspaceFormateur"));
const TableauDeBordAdmin = lazy(() => import("./pages/TableauDeBordAdmin"));
const AdminUsers = lazy(() => import("./pages/AdminUsers"));
const AjouterFormation = lazy(() => import("./pages/AjouterFormation"));
const AjouterActualite = lazy(() => import("./pages/AjouterActualite"));
const ModifierFormation = lazy(() => import("./pages/ModifierFormation"));
const ModifierActualite = lazy(() => import("./pages/ModifierActualite"));
const StatisticsDashboard = lazy(() => import("./pages/StatisticsDashboard"));
const ConfirmInscription = lazy(() => import("./pages/ConfirmInscription"));

// ============ PAGES STATIQUES - FORMATIONS EN LANGUES ============
const FormationsLangues = lazy(() => import("./pages/formations/langues/FormationsLangues"));
const FormationAllemandMonastir = lazy(() => import("./pages/formations/langues/FormationAllemandMonastir"));
const FormationAnglaisMonastir = lazy(() => import("./pages/formations/langues/FormationAnglaisMonastir"));
const FormationEspagnolMonastir = lazy(() => import("./pages/formations/langues/FormationEspagnolMonastir"));
const FormationFrancaisMonastir = lazy(() => import("./pages/formations/langues/FormationFrancaisMonastir"));
const FormationItalienMonastir = lazy(() => import("./pages/formations/langues/FormationItalienMonastir"));

function AppContent() {
  const location = useLocation();
  const { user } = useAuth();
  const [hasError, setHasError] = React.useState(false);
  const [error, setError] = React.useState(null);

  // Restauration de session au retour sur l'onglet
  useEffect(() => {
    const handleVisibilityChange = async () => {
      if (document.visibilityState === 'visible') {
        const token = localStorage.getItem('supabase-auth-token');
        if (token && !user) {
          console.log('🔄 Tentative de restauration de session...');
          try {
            const { data, error } = await supabase.auth.refreshSession();
            if (error) {
              console.log('❌ Erreur refresh:', error.message);
              localStorage.removeItem('supabase-auth-token');
            } else if (data.session) {
              console.log('✅ Session restaurée');
              window.location.reload();
            }
          } catch (err) {
            console.error('Erreur restauration:', err);
          }
        }
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [user]);

  useEffect(() => {
    const hostname = window.location.hostname;
    if (hostname === "centrecertusdeformation.vercel.app") {
      window.location.replace(`https://centrecertusdeformation.tn${location.pathname}${location.search}`);
    }
  }, [location]);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has('theme') || urlParams.has('langue')) {
      window.location.replace(window.location.pathname);
    }
  }, []);

  // Gestionnaire d'erreur global
  useEffect(() => {
    const handleError = (event) => {
      console.error('Erreur capturée:', event.error);
      setError(event.error);
      setHasError(true);
    };
    window.addEventListener('error', handleError);
    return () => window.removeEventListener('error', handleError);
  }, []);

  const resetError = () => {
    setHasError(false);
    setError(null);
    window.location.reload();
  };

  if (hasError) {
    return <ErrorFallback error={error} resetError={resetError} />;
  }

  return (
    <>
      <Helmet>
        <link rel="canonical" href={`https://centrecertusdeformation.tn${location.pathname}`} />
      </Helmet>
      <Navbar />
      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* ============ PAGES PUBLIQUES ============ */}
          <Route path="/" element={<Home />} />
          <Route path="/a-propos" element={<AproposDeCertus />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/connexion" element={<Connexion />} />
          <Route path="/inscription" element={<Inscription />} />
          <Route path="/confirm-inscription" element={<ConfirmInscription />} />
          
          {/* ============ FORMATIONS ============ */}
          <Route path="/formations" element={<Formations />} />
          
          {/* 
            ============ FORMATIONS DÉTAIL AVEC SLUG ============ 
            La route utilise :slug au lieu de :id pour supporter les URLs SEO-friendly
          */}
          <Route path="/formations/:slug" element={<FormationDetail />} />
          
          {/* ============ REDIRECTIONS : ANCIENNES URLS AVEC ID VERS LES SLUGS ============ */}
          {/* 
            Ces redirections permettent de supporter les anciennes URLs avec ID
            La page FormationDetail gère aussi la détection automatique ID vs Slug
          */}
          
          {/* REDIRECTIONS POUR LES FORMATIONS DYNAMIQUES (IDs vers slugs) */}
          <Route 
            path="/formations/5bf25db3-7414-4ac9-ba15-e7c912e399cc" 
            element={<Navigate to="/formations/excel-avance-perfectionnement-automatisation-monastir" replace />} 
          />
          <Route 
            path="/formations/54032996-60eb-45b0-9c2a-83ad93f8ae40" 
            element={<Navigate to="/formations/photographie-montage-video-monastir" replace />} 
          />
          <Route 
            path="/formations/8b71465e-deca-4a75-ae08-6c7f11772c36" 
            element={<Navigate to="/formations/python-programmation-certifiante-monastir" replace />} 
          />
          <Route 
            path="/formations/9f049cda-30e8-4219-be28-76d1ddc38469" 
            element={<Navigate to="/formations/intelligence-artificielle-pratique-monastir" replace />} 
          />
          <Route 
            path="/formations/8246d92e-df0f-4b01-973c-0badbe3b45cf" 
            element={<Navigate to="/formations/assistante-direction-informatique-bureautique-sage-monastir" replace />} 
          />
          <Route 
            path="/formations/8bb5280c-41e9-4883-9669-e455f416fcd0" 
            element={<Navigate to="/formations/gestion-ressources-humaines-monastir" replace />} 
          />
          <Route 
            path="/formations/2ad80abd-61c4-4078-8f49-65f8ef24e7c7" 
            element={<Navigate to="/formations/publicite-marketing-photoshop-illustrator-indesign-monastir" replace />} 
          />
          <Route 
            path="/formations/9ff10837-e75b-43c0-a6e8-7297a1778750" 
            element={<Navigate to="/formations/informatique-bureautique-word-excel-powerpoint-monastir" replace />} 
          />
          <Route 
            path="/formations/a1d4e82f-fd66-4e59-9266-8906a57e6478" 
            element={<Navigate to="/formations/installation-photovoltaique-reseau-monastir" replace />} 
          />
          <Route 
            path="/formations/68e222e4-9bf7-42ef-b4e3-f3a686fcd105" 
            element={<Navigate to="/formations/fibre-optique-monastir" replace />} 
          />
          <Route 
            path="/formations/83c3b1ce-c8c0-476d-a64c-fb29e810ade2" 
            element={<Navigate to="/formations/stewarding-hygiene-appliquee-monastir" replace />} 
          />
          
          {/* REDIRECTIONS POUR LES FORMATIONS LANGUES DYNAMIQUES */}
          <Route 
            path="/formations/f1111111-1111-1111-1111-111111111111" 
            element={<Navigate to="/formations/allemand-a1-a2-b1-monastir" replace />} 
          />
          <Route 
            path="/formations/f2222222-2222-2222-2222-222222222222" 
            element={<Navigate to="/formations/anglais-a1-a2-b1-b2-c1-monastir" replace />} 
          />
          <Route 
            path="/formations/f3333333-3333-3333-3333-333333333333" 
            element={<Navigate to="/formations/espagnol-a1-a2-b1-monastir" replace />} 
          />
          <Route 
            path="/formations/f4444444-4444-4444-4444-444444444444" 
            element={<Navigate to="/formations/francais-a1-a2-b1-b2-monastir" replace />} 
          />
          <Route 
            path="/formations/f5555555-5555-5555-5555-555555555555" 
            element={<Navigate to="/formations/italien-a1-a2-b1-b2-monastir" replace />} 
          />
          
          {/* ============ FORMATIONS EN LANGUES (PAGE LISTE) ============ */}
          <Route path="/formations/langues" element={<FormationsLangues />} />
          
          {/* ============ PAGES STATIQUES - FORMATIONS PAR LANGUE À MONASTIR ============ */}
          <Route path="/formation-allemand-monastir" element={<FormationAllemandMonastir />} />
          <Route path="/formation-anglais-monastir" element={<FormationAnglaisMonastir />} />
          <Route path="/formation-espagnol-monastir" element={<FormationEspagnolMonastir />} />
          <Route path="/formation-francais-monastir" element={<FormationFrancaisMonastir />} />
          <Route path="/formation-italien-monastir" element={<FormationItalienMonastir />} />
          
          {/* ============ REDIRECTIONS POUR COMPATIBILITÉ (anciennes URLs) ============ */}
          {/* Anciennes URLs des formations langues */}
          <Route path="/formations/langues/allemand" element={<Navigate to="/formation-allemand-monastir" replace />} />
          <Route path="/formations/langues/allemand_a_monastir" element={<Navigate to="/formation-allemand-monastir" replace />} />
          <Route path="/formations/langues/anglais" element={<Navigate to="/formation-anglais-monastir" replace />} />
          <Route path="/formations/langues/anglais_a_monastir" element={<Navigate to="/formation-anglais-monastir" replace />} />
          <Route path="/formations/langues/espagnol" element={<Navigate to="/formation-espagnol-monastir" replace />} />
          <Route path="/formations/langues/espagnol_a_monastir" element={<Navigate to="/formation-espagnol-monastir" replace />} />
          <Route path="/formations/langues/francais" element={<Navigate to="/formation-francais-monastir" replace />} />
          <Route path="/formations/langues/francais_a_monastir" element={<Navigate to="/formation-francais-monastir" replace />} />
          <Route path="/formations/langues/italien" element={<Navigate to="/formation-italien-monastir" replace />} />
          <Route path="/formations/langues/italien_a_monastir" element={<Navigate to="/formation-italien-monastir" replace />} />
          
          {/* Variantes de recherche (mots-clés) */}
          <Route path="/cours-allemand-monastir" element={<Navigate to="/formation-allemand-monastir" replace />} />
          <Route path="/apprendre-allemand-monastir" element={<Navigate to="/formation-allemand-monastir" replace />} />
          <Route path="/certification-allemand-monastir" element={<Navigate to="/formation-allemand-monastir" replace />} />
          <Route path="/cours-anglais-monastir" element={<Navigate to="/formation-anglais-monastir" replace />} />
          <Route path="/apprendre-anglais-monastir" element={<Navigate to="/formation-anglais-monastir" replace />} />
          <Route path="/cours-espagnol-monastir" element={<Navigate to="/formation-espagnol-monastir" replace />} />
          <Route path="/apprendre-espagnol-monastir" element={<Navigate to="/formation-espagnol-monastir" replace />} />
          <Route path="/cours-francais-monastir" element={<Navigate to="/formation-francais-monastir" replace />} />
          <Route path="/apprendre-francais-monastir" element={<Navigate to="/formation-francais-monastir" replace />} />
          <Route path="/cours-italien-monastir" element={<Navigate to="/formation-italien-monastir" replace />} />
          <Route path="/apprendre-italien-monastir" element={<Navigate to="/formation-italien-monastir" replace />} />
          
          {/* ============ ACTUALITÉS ============ */}
          <Route path="/actualite" element={<Actualite />} />
          
          {/* ============ ESPACES PRIVÉS ============ */}
          <Route path="/espace-participant" element={<PrivateRoute><EspaceParticipant /></PrivateRoute>} />
          <Route path="/espace-formateur" element={<PrivateRoute><EspaceFormateur /></PrivateRoute>} />
          
          {/* ============ ADMIN ============ */}
          <Route path="/admin" element={<PrivateRoute adminOnly><TableauDeBordAdmin /></PrivateRoute>} />
          <Route path="/admin/users" element={<PrivateRoute adminOnly><AdminUsers /></PrivateRoute>} />
          <Route path="/admin/statistics" element={<PrivateRoute adminOnly><StatisticsDashboard /></PrivateRoute>} />
          
          {/* ============ GESTION FORMATIONS ============ */}
          <Route path="/ajouter-formation" element={<PrivateRoute adminOnly><AjouterFormation /></PrivateRoute>} />
          <Route path="/modifier-formation/:id" element={<PrivateRoute adminOnly><ModifierFormation /></PrivateRoute>} />
          
          {/* ============ GESTION ACTUALITÉS ============ */}
          <Route path="/ajouter-actualite" element={<PrivateRoute adminOnly><AjouterActualite /></PrivateRoute>} />
          <Route path="/modifier-actualite/:id" element={<PrivateRoute adminOnly><ModifierActualite /></PrivateRoute>} />
          
          {/* ============ PAGE 404 ============ */}
          <Route path="*" element={
            <div className="text-center py-20 mt-20">
              <h1 className="text-4xl font-bold text-gray-800 mb-4">404</h1>
              <p className="text-gray-600 mb-4">Page non trouvée</p>
              <Link to="/" className="text-blue-600 hover:underline">
                Retour à l'accueil
              </Link>
            </div>
          } />
        </Routes>
      </Suspense>
      <ToastContainer position="bottom-right" />
    </>
  );
}

export default function App() {
  return (
    <HelmetProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </HelmetProvider>
  );
}