import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-toastify";

export default function Connexion() {
  const { login, isAdmin, isApproved } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 🔐 login via Supabase
      await login(email, password);

      // ⚠️ attendre chargement du contexte
      setTimeout(() => {
        if (!isApproved) {
          toast.error("Votre compte n'est pas encore approuvé");
          navigate("/");
          return;
        }

        if (isAdmin) {
          toast.success("Bienvenue Admin 👨‍💼");
          navigate("/admin");
        } else {
          toast.success("Connexion réussie 👤");
          navigate("/espace-participant");
        }
      }, 300);

    } catch (err) {
      console.error(err);
      toast.error(err.message || "Erreur de connexion");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-lg">
        <h1 className="text-2xl font-bold mb-6 text-center">Connexion</h1>

        <form onSubmit={handleSubmit} className="space-y-5">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border px-3 py-2 rounded-md"
            required
          />

          <input
            type="password"
            placeholder="Mot de passe"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border px-3 py-2 rounded-md"
            required
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-800 text-white py-2 rounded-md hover:bg-blue-600"
          >
            {loading ? "Connexion..." : "Se connecter"}
          </button>
        </form>
      </div>
    </div>
  );
}