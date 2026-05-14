// frontend/src/App.jsx
import React, { Suspense, lazy, useEffect } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Navbar from "./components/Navbar";
import PrivateRoute from "./routes/PrivateRoute";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { trackingService } from "./services/TrackingService";

// Loader component
const PageLoader = () => (
  <div className="flex justify-center items-center h-64">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1a56db]"></div>
  </div>
);

// Lazy loading des pages
const Home = lazy(() => import("./pages/Home"));
const Contact = lazy(() => import("./pages/Contact"));
const Connexion = lazy(() => import("./pages/Connexion"));
const Formations = lazy(() => import("./pages/Formations"));
const FormationDetail = lazy(() => import("./pages/FormationDetail"));
const Actualite = lazy(() => import("./pages/Actualite"));
const Inscription = lazy(() => import("./pages/Inscription"));
const AproposDeCertus = lazy(() => import("./pages/AproposDeCertus"));
const EspaceParticipant = lazy(() => import("./pages/EspaceParticipant"));
const TableauDeBordAdmin = lazy(() => import("./pages/TableauDeBordAdmin"));
const AdminUsers = lazy(() => import("./pages/AdminUsers"));
const AjouterFormation = lazy(() => import("./pages/AjouterFormation"));
const AjouterActualite = lazy(() => import("./pages/AjouterActualite"));
const ModifierFormation = lazy(() => import("./pages/ModifierFormation"));
const ModifierActualite = lazy(() => import("./pages/ModifierActualite"));
const StatisticsDashboard = lazy(() => import("./pages/StatisticsDashboard"));

// Composant interne pour le tracking
function AppContent() {
  const location = useLocation();
  const { user } = useAuth();

  // REDIRECTION : .vercel.app → .tn (pour éviter le contenu dupliqué)
  useEffect(() => {
    const hostname = window.location.hostname;
    if (hostname === "centrecertusdeformation.vercel.app") {
      const newUrl = `https://centrecertusdeformation.tn${location.pathname}${location.search}`;
      window.location.replace(newUrl);
    }
  }, [location]);

  useEffect(() => {
    // Tracker chaque changement de page
    trackingService.trackPageView(location.pathname, user?.email);
  }, [location, user]);

  return (
    <>
      <Navbar />
      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* Routes publiques */}
          <Route path="/" element={<Home />} />
          <Route path="/a-propos" element={<AproposDeCertus />} />
          <Route path="/formations" element={<Formations />} />
          <Route path="/formations/:id" element={<FormationDetail />} />
          <Route path="/actualite" element={<Actualite />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/connexion" element={<Connexion />} />
          <Route path="/inscription" element={<Inscription />} />

          {/* Routes protégées (utilisateur connecté) */}
          <Route path="/espace-participant" element={
            <PrivateRoute>
              <EspaceParticipant />
            </PrivateRoute>
          } />

          {/* Routes admin (admin uniquement) */}
          <Route path="/admin" element={
            <PrivateRoute adminOnly>
              <TableauDeBordAdmin />
            </PrivateRoute>
          } />
          <Route path="/admin/users" element={
            <PrivateRoute adminOnly>
              <AdminUsers />
            </PrivateRoute>
          } />
          <Route path="/admin/statistics" element={
            <PrivateRoute adminOnly>
              <StatisticsDashboard />
            </PrivateRoute>
          } />
          <Route path="/ajouter-formation" element={
            <PrivateRoute adminOnly>
              <AjouterFormation />
            </PrivateRoute>
          } />
          <Route path="/modifier-formation/:id" element={
            <PrivateRoute adminOnly>
              <ModifierFormation />
            </PrivateRoute>
          } />
          <Route path="/ajouter-actualite" element={
            <PrivateRoute adminOnly>
              <AjouterActualite />
            </PrivateRoute>
          } />
          <Route path="/modifier-actualite/:id" element={
            <PrivateRoute adminOnly>
              <ModifierActualite />
            </PrivateRoute>
          } />

          {/* Route 404 */}
          <Route path="*" element={<div className="text-center py-10">Page non trouvée</div>} />
        </Routes>
      </Suspense>
      <ToastContainer position="bottom-right" />
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}