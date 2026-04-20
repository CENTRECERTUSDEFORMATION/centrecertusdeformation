import React, { Suspense, lazy } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import PrivateRoute from "./routes/PrivateRoute";

const Home = lazy(() => import("./pages/Home"));
const Connexion = lazy(() => import("./pages/Connexion"));
const Formations = lazy(() => import("./pages/Formations"));
const FormationDetail = lazy(() => import("./pages/FormationDetail"));
const EspaceParticipant = lazy(() => import("./pages/EspaceParticipant"));
const TableauDeBordAdmin = lazy(() => import("./pages/TableauDeBordAdmin"));
const AdminUsers = lazy(() => import("./pages/AdminUsers"));

export default function App() {
  return (
    <BrowserRouter>

      <Navbar />

      <Suspense fallback={<div>Chargement...</div>}>

        <Routes>

          <Route path="/" element={<Home />} />
          <Route path="/connexion" element={<Connexion />} />

          <Route path="/formations" element={<Formations />} />
          <Route path="/formations/:id" element={<FormationDetail />} />

          <Route
            path="/espace-participant"
            element={
              <PrivateRoute>
                <EspaceParticipant />
              </PrivateRoute>
            }
          />

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

        </Routes>

      </Suspense>

    </BrowserRouter>
  );
}