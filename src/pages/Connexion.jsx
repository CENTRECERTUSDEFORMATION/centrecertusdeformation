import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-toastify";

export default function Connexion() {
  const { login, user, isAdmin, isApproved, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [loginRequested, setLoginRequested] = useState(false);

  useEffect(() => {
    if (!loginRequested || authLoading) return;

    if (!user) {
      setLoginRequested(false);
      setSubmitting(false);
      return;
    }

    if (!isApproved && !isAdmin) {
      toast.error("Votre compte n'est pas encore approuve");
      navigate("/");
      setLoginRequested(false);
      setSubmitting(false);
      return;
    }

    if (isAdmin) {
      toast.success("Bienvenue Admin");
      navigate("/admin");
    } else {
      toast.success("Connexion reussie");
      navigate("/espace-participant");
    }

    setLoginRequested(false);
    setSubmitting(false);
  }, [loginRequested, authLoading, user, isAdmin, isApproved, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      await login(email, password);
      setLoginRequested(true);
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Erreur de connexion");
      setSubmitting(false);
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
            disabled={submitting || authLoading}
            className="w-full bg-blue-800 text-white py-2 rounded-md hover:bg-blue-600 disabled:opacity-60"
          >
            {submitting ? "Connexion..." : "Se connecter"}
          </button>
        </form>
      </div>
    </div>
  );
}
