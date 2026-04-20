import React, { Suspense, lazy } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import PrivateRoute from "./routes/PrivateRoute";

// Pages
const Home = lazy(() => import("./pages/Home"));
const Contact = lazy(() => import("./pages/Contact"));
const Connexion = lazy(() => import("./pages/Connexion"));
const Formations = lazy(() => import("./pages/Formations"));
const FormationDetail = lazy(() => import("./pages/FormationDetail"));
const EspaceParticipant = lazy(() => import("./pages/EspaceParticipant"));
const AjouterFormation = lazy(() => import("./pages/AjouterFormation"));
const AjouterActualite = lazy(() => import("./pages/AjouterActualite"));
const AproposDeCertus = lazy(() => import("./pages/AproposDeCertus"));
const Actualite = lazy(() => import("./pages/Actualite"));
const Inscription = lazy(() => import("./pages/Inscription"));
const ModifierFormation = lazy(() => import("./pages/ModifierFormation"));
const Paiement = lazy(() => import("./pages/Paiement"));
const TableauDeBordAdmin = lazy(() => import("./pages/TableauDeBordAdmin"));
const AdminUsers = lazy(() => import("./pages/AdminUsers"));

export default function App() {
  return (
    <BrowserRouter>

      {/* ✅ Navbar toujours visible */}
      <Navbar />

      <Suspense fallback={<div className="text-center py-10">Chargement...</div>}>

        <Routes>

          {/* 🌍 PUBLIC */}
          <Route path="/" element={<Home />} />
          <Route path="/connexion" element={<Connexion />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/a-propos" element={<AproposDeCertus />} />
          <Route path="/actualite" element={<Actualite />} />
          <Route path="/inscription" element={<Inscription />} />
          <Route path="/paiement" element={<Paiement />} />

          {/* 📚 FORMATIONS */}
          <Route path="/formations" element={<Formations />} />
          <Route path="/formations/:id" element={<FormationDetail />} />

          {/* 👤 USER */}
          <Route
            path="/espace-participant"
            element={
              <PrivateRoute>
                <EspaceParticipant />
              </PrivateRoute>
            }
          />

          {/* 🧑‍💼 ADMIN */}
          <Route
            path="/admin"
            element={
              <PrivateRoute adminOnly>
                <TableauDeBordAdmin />
              </PrivateRoute>
            }
          />

          {/* 👥 USERS */}
          <Route
            path="/admin/users"
            element={
              <PrivateRoute adminOnly>
                <AdminUsers />
              </PrivateRoute>
            }
          />

          {/* ➕ FORMATIONS ADMIN */}
          <Route
            path="/ajouter-formation"
            element={
              <PrivateRoute adminOnly>
                <AjouterFormation />
              </PrivateRoute>
            }
          />

          <Route
            path="/modifier-formation/:id"
            element={
              <PrivateRoute adminOnly>
                <ModifierFormation />
              </PrivateRoute>
            }
          />

          {/* 📰 ACTUALITES ADMIN */}
          <Route
            path="/ajouter-actualite"
            element={
              <PrivateRoute adminOnly>
                <AjouterActualite />
              </PrivateRoute>
            }
          />

          {/* 🔁 FALLBACK */}
          <Route path="*" element={<Home />} />

        </Routes>

      </Suspense>

    </BrowserRouter>
  );
}