// frontend/src/App.jsx
import React, { Suspense, lazy, useEffect } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Helmet, HelmetProvider } from 'react-helmet-async';
import Navbar from "./components/Navbar";
import PrivateRoute from "./routes/PrivateRoute";
import { AuthProvider, useAuth } from "./context/AuthContext";
// TrackingService désactivé
// import { trackingService } from "./services/TrackingService";

const PageLoader = () => (
  <div className="flex justify-center items-center h-64">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1a56db]"></div>
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

  // Tracking désactivé
  // useEffect(() => {
  //   trackingService.trackPageView(location.pathname, user?.email);
  // }, [location, user]);

  return (
    <>
      <Helmet>
        <link rel="canonical" href={`https://centrecertusdeformation.tn${location.pathname}`} />
      </Helmet>
      <Navbar />
      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* Pages publiques */}
          <Route path="/" element={<Home />} />
          <Route path="/a-propos" element={<AproposDeCertus />} />
          <Route path="/formations" element={<Formations />} />
          <Route path="/formations/:id" element={<FormationDetail />} />
          <Route path="/actualite" element={<Actualite />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/connexion" element={<Connexion />} />
          <Route path="/inscription" element={<Inscription />} />
          <Route path="/confirm-inscription" element={<ConfirmInscription />} />
          
          {/* Espaces utilisateurs */}
          <Route path="/espace-participant" element={<PrivateRoute><EspaceParticipant /></PrivateRoute>} />
          <Route path="/espace-formateur" element={<PrivateRoute><EspaceFormateur /></PrivateRoute>} />
          
          {/* Administration */}
          <Route path="/admin" element={<PrivateRoute adminOnly><TableauDeBordAdmin /></PrivateRoute>} />
          <Route path="/admin/users" element={<PrivateRoute adminOnly><AdminUsers /></PrivateRoute>} />
          <Route path="/admin/statistics" element={<PrivateRoute adminOnly><StatisticsDashboard /></PrivateRoute>} />
          
          {/* CRUD Formations */}
          <Route path="/ajouter-formation" element={<PrivateRoute adminOnly><AjouterFormation /></PrivateRoute>} />
          <Route path="/modifier-formation/:id" element={<PrivateRoute adminOnly><ModifierFormation /></PrivateRoute>} />
          
          {/* CRUD Actualités */}
          <Route path="/ajouter-actualite" element={<PrivateRoute adminOnly><AjouterActualite /></PrivateRoute>} />
          <Route path="/modifier-actualite/:id" element={<PrivateRoute adminOnly><ModifierActualite /></PrivateRoute>} />
          
          {/* 404 */}
          <Route path="*" element={<div className="text-center py-10">Page non trouvée</div>} />
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