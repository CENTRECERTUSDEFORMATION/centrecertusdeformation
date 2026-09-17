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

// ============ PAGES DE TEST EXCEL (dédiées) ============
const TestExcelAvance = lazy(() => import("./pages/tests/TestExcelAvance"));

// ============ PAGE DE TEST GÉNÉRIQUE ============
const TestFormation = lazy(() => import("./pages/TestFormation"));

function AppContent() {
  const location = useLocation();
  const { user } = useAuth();

  useEffect(() => {
    const handleVisibilityChange = async () => {
      if (document.visibilityState === 'visible') {
        const token = localStorage.getItem('supabase-auth-token');
        if (token && !user) {
          try {
            const { data, error } = await supabase.auth.refreshSession();
            if (error) {
              localStorage.removeItem('supabase-auth-token');
            } else if (data.session) {
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
          <Route path="/formations/:slug" element={<FormationDetail />} />
          <Route path="/formations/:id" element={<FormationDetail />} />
          
          {/* ============ FORMATIONS EN LANGUES ============ */}
          <Route path="/formations/langues" element={<FormationsLangues />} />
          <Route path="/formation-allemand-monastir" element={<FormationAllemandMonastir />} />
          <Route path="/formation-anglais-monastir" element={<FormationAnglaisMonastir />} />
          <Route path="/formation-espagnol-monastir" element={<FormationEspagnolMonastir />} />
          <Route path="/formation-francais-monastir" element={<FormationFrancaisMonastir />} />
          <Route path="/formation-italien-monastir" element={<FormationItalienMonastir />} />
          
          {/* ============ TESTS EXCEL ============ */}
          {/* ⚠️ IMPORTANT : ces routes doivent être AVANT /test/:slug */}
          {/* Test Excel Débutant */}
          <Route path="/test/excel-debutant" element={<TestExcelAvance />} />
          
          {/* Test Excel Avancé */}
          <Route path="/test/excel-avance" element={<TestExcelAvance />} />
          
          {/* ============ TEST GÉNÉRIQUE (autres formations) ============ */}
          {/* ⚠️ Cette route doit être EN DERNIER pour ne pas capturer /test/excel-* */}
          <Route path="/test/:slug" element={<TestFormation />} />
          
          {/* ============ ACTUALITÉ ============ */}
          <Route path="/actualite" element={<Actualite />} />
          
          {/* ============ ESPACES UTILISATEURS ============ */}
          <Route path="/espace-participant" element={<PrivateRoute><EspaceParticipant /></PrivateRoute>} />
          <Route path="/espace-formateur" element={<PrivateRoute><EspaceFormateur /></PrivateRoute>} />
          
          {/* ============ ADMINISTRATION ============ */}
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