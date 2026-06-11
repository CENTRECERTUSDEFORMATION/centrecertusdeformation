// frontend/src/App.jsx
import React, { Suspense, lazy, useEffect } from "react";
import { Routes, Route, useLocation, Link } from "react-router-dom";
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
          <Route path="/" element={<Home />} />
          <Route path="/a-propos" element={<AproposDeCertus />} />
          <Route path="/formations" element={<Formations />} />
          <Route path="/formations/:id" element={<FormationDetail />} />
          <Route path="/actualite" element={<Actualite />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/connexion" element={<Connexion />} />
          <Route path="/inscription" element={<Inscription />} />
          <Route path="/confirm-inscription" element={<ConfirmInscription />} />
          <Route path="/espace-participant" element={<PrivateRoute><EspaceParticipant /></PrivateRoute>} />
          <Route path="/espace-formateur" element={<PrivateRoute><EspaceFormateur /></PrivateRoute>} />
          <Route path="/admin" element={<PrivateRoute adminOnly><TableauDeBordAdmin /></PrivateRoute>} />
          <Route path="/admin/users" element={<PrivateRoute adminOnly><AdminUsers /></PrivateRoute>} />
          <Route path="/admin/statistics" element={<PrivateRoute adminOnly><StatisticsDashboard /></PrivateRoute>} />
          <Route path="/ajouter-formation" element={<PrivateRoute adminOnly><AjouterFormation /></PrivateRoute>} />
          <Route path="/modifier-formation/:id" element={<PrivateRoute adminOnly><ModifierFormation /></PrivateRoute>} />
          <Route path="/ajouter-actualite" element={<PrivateRoute adminOnly><AjouterActualite /></PrivateRoute>} />
          <Route path="/modifier-actualite/:id" element={<PrivateRoute adminOnly><ModifierActualite /></PrivateRoute>} />
          <Route path="*" element={<div className="text-center py-20">Page non trouvée. <Link to="/">Retour à l'accueil</Link></div>} />
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