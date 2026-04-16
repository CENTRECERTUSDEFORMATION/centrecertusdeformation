import React, { Suspense, lazy } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import { AuthProvider } from "./context/AuthContext";
import { FormationsProvider } from "./context/FormationsContext";
import { ActualitesProvider } from "./context/ActualitesContext";
import PrivateRoute from "./routes/PrivateRoute";

// pages
const Home = lazy(() => import("./pages/Home"));
const Contact = lazy(() => import("./pages/Contact"));
const Connexion = lazy(() => import("./pages/Connexion"));
const Formations = lazy(() => import("./pages/Formations"));
const FormationDetail = lazy(() => import("./pages/FormationDetail"));
const EspaceParticipant = lazy(() => import("./pages/EspaceParticipant"));
const AproposDeCertus = lazy(() => import("./pages/AproposDeCertus"));
const Actualite = lazy(() => import("./pages/Actualite"));
const Inscription = lazy(() => import("./pages/Inscription"));
const Paiement = lazy(() => import("./pages/Paiement"));

// admin pages
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

                {/* 🌍 PUBLIC */}
                <Route path="/" element={<Home />} />
                <Route path="/connexion" element={<Connexion />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/a-propos" element={<AproposDeCertus />} />
                <Route path="/actualite" element={<Actualite />} />
                <Route path="/inscription" element={<Inscription />} />
                <Route path="/paiement" element={<Paiement />} />

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

                {/* 👨‍💼 ADMIN DASHBOARD CENTRAL */}
                <Route
                  path="/admin"
                  element={
                    <PrivateRoute adminOnly>
                      <TableauDeBordAdmin />
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