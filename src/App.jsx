import React, { Suspense, lazy } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import { AuthProvider } from "./context/AuthContext";
import { FormationsProvider } from "./context/FormationsContext";
import { ActualitesProvider } from "./context/ActualitesContext";
import PrivateRoute from "./routes/PrivateRoute";

// Lazy loading des pages
const Home = lazy(() => import("./pages/Home"));
const Contact = lazy(() => import("./pages/Contact"));
const Connexion = lazy(() => import("./pages/Connexion"));
const Formations = lazy(() => import("./pages/Formations"));
const FormationDetail = lazy(() => import("./pages/FormationDetail"));
const EspaceParticipant = lazy(() => import("./pages/EspaceParticipant"));
const AjouterFormation = lazy(() => import("./pages/AjouterFormation"));
const AjouterActualite = lazy(() => import("./pages/AjouterActualite")); // ✅ corrigé
const AproposDeCertus = lazy(() => import("./pages/AproposDeCertus"));
const Actualite = lazy(() => import("./pages/Actualite")); // ✅ nom sans s
const Inscription = lazy(() => import("./pages/Inscription"));
const ModifierFormation = lazy(() => import("./pages/ModifierFormation"));
const Paiement = lazy(() => import("./pages/Paiement"));
const TableauDeBordAdmin = lazy(() => import("./pages/TableauDeBordAdmin"));

function App() {
  return (
    <AuthProvider>
      <FormationsProvider>
        <ActualitesProvider>
          <BrowserRouter>
            <Navbar />
            <Suspense fallback={<div className="text-center py-10">Chargement...</div>}>
              <Routes>
                {/* Routes publiques */}
                <Route path="/" element={<Home />} />
                <Route path="/connexion" element={<Connexion />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/a-propos" element={<AproposDeCertus />} />
                <Route path="/actualite" element={<Actualite />} /> {/* ✅ corrigé */}
                <Route path="/inscription" element={<Inscription />} />
                <Route path="/paiement" element={<Paiement />} />

                {/* Routes formations */}
                <Route path="/formations" element={<Formations />} />
                <Route path="/formations/:id" element={<FormationDetail />} />

                {/* Routes privées utilisateur */}
                <Route
                  path="/espace-participant"
                  element={
                    <PrivateRoute>
                      <EspaceParticipant />
                    </PrivateRoute>
                  }
                />

                {/* Routes privées admin */}
                <Route
                  path="/admin"
                  element={
                    <PrivateRoute adminOnly>
                      <TableauDeBordAdmin />
                    </PrivateRoute>
                  }
                />
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
                <Route
                  path="/ajouter-actualite"
                  element={
                    <PrivateRoute adminOnly>
                      <AjouterActualite />
                    </PrivateRoute>
                  }
                />
              </Routes>
            </Suspense>
          </BrowserRouter>
        </ActualitesProvider>
      </FormationsProvider>
    </AuthProvider>
  );
}

export default App;
