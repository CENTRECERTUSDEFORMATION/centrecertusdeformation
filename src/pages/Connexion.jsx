import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-toastify";

export default function Connexion() {
  const { login, isAdmin, isApproved, user, loading } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      await login(email, password);
      toast.success("Connexion réussie !");
    } catch (err) {
      toast.error(err.message || "Erreur connexion");
    } finally {
      setSubmitting(false);
    }
  };

  // 🔥 REDIRECTION PROPRE (IMPORTANT)
  useEffect(() => {
    if (!user) return;

    if (!isApproved) {
      toast.error("Compte non approuvé");
      navigate("/");
      return;
    }

    if (isAdmin) {
      navigate("/admin");
    } else {
      navigate("/espace-participant");
    }
  }, [user, isAdmin, isApproved, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <form
        onSubmit={handleSubmit}
        className="p-6 bg-white shadow rounded w-full max-w-sm"
      >
        <input
          type="email"
          placeholder="Email"
          onChange={(e) => setEmail(e.target.value)}
          className="border p-2 w-full mb-2"
          required
        />

        <input
          type="password"
          placeholder="Mot de passe"
          onChange={(e) => setPassword(e.target.value)}
          className="border p-2 w-full mb-2"
          required
        />

        <button
          disabled={submitting}
          className="bg-blue-700 text-white px-4 py-2 w-full"
        >
          {submitting ? "Connexion..." : "Connexion"}
        </button>
      </form>
    </div>
  );
}