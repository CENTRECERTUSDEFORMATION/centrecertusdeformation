import React, { Suspense, lazy } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import PrivateRoute from "./routes/PrivateRoute";

// 📦 Pages (lazy)
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
const TableauDeBordAdmin = lazy(() => import("./pages/TableauDeBordAdmin"));
const AdminUsers = lazy(() => import("./pages/AdminUsers"));

export default function App() {
  return (
    <BrowserRouter>

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

          <Route
            path="/admin/users"
            element={
              <PrivateRoute adminOnly>
                <AdminUsers />
              </PrivateRoute>
            }
          />

          {/* ➕ ADMIN */}
          <Route
            path="/ajouter-formation"
            element={
              <PrivateRoute adminOnly>
                <AjouterFormation />
              </PrivateRoute>
            }
          />

          <Route
            path="/ajouter-actualite"
            element={
              <PrivateRoute adminOnly>
                <AjouterActualite />
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

          {/* ❌ 404 */}
          <Route path="*" element={<div className="text-center py-10">Page non trouvée</div>} />

        </Routes>
      </Suspense>

    </BrowserRouter>
  );
}