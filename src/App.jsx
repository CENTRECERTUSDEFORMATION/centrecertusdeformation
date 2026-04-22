import React from "react";
import { Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Navbar from "./components/Navbar";
import PrivateRoute from "./routes/PrivateRoute";
import { AuthProvider } from "./context/AuthContext";

// Imports normaux (sans lazy)
import Home from "./pages/Home";
import Contact from "./pages/Contact";
import Connexion from "./pages/Connexion";
import Formations from "./pages/Formations";
import FormationDetail from "./pages/FormationDetail";
import Actualite from "./pages/Actualite";
import Inscription from "./pages/Inscription";
import AproposDeCertus from "./pages/AproposDeCertus";
import EspaceParticipant from "./pages/EspaceParticipant";
import TableauDeBordAdmin from "./pages/TableauDeBordAdmin";
import AdminUsers from "./pages/AdminUsers";
import AjouterFormation from "./pages/AjouterFormation";
import AjouterActualite from "./pages/AjouterActualite";
import ModifierFormation from "./pages/ModifierFormation";

export default function App() {
  return (
    <AuthProvider>
      <Navbar />
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
      <ToastContainer position="bottom-right" />
    </AuthProvider>
  );
}