// frontend/src/App.jsx
import React, { Suspense, lazy } from "react";
import { Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Navbar from "./components/Navbar";
import PrivateRoute from "./routes/PrivateRoute";
import { AuthProvider } from "./context/AuthContext";

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
const StatisticsDashboard = lazy(() => import("./pages/StatisticsDashboard"));

export default function App() {
  return (
    <AuthProvider>
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
          <Route path="/espace-participant" element={
            <PrivateRoute>
              <EspaceParticipant />
            </PrivateRoute>
          } />
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
          <Route path="/ajouter-actualite" element={
            <PrivateRoute adminOnly>
              <AjouterActualite />
            </PrivateRoute>
          } />
          <Route path="/modifier-formation/:id" element={
            <PrivateRoute adminOnly>
              <ModifierFormation />
            </PrivateRoute>
          } />
          <Route path="*" element={<div className="text-center py-10">Page non trouvée</div>} />
        </Routes>
      </Suspense>
      <ToastContainer position="bottom-right" />
    </AuthProvider>
  );
}