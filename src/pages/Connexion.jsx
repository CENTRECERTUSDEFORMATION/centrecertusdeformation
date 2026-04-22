import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-toastify";

export default function Connexion() {
  const { login, user, isAdmin, isApproved, loading } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      await login(email, password);

      // 🔥 petit délai pour laisser Supabase + AuthContext sync
      setTimeout(() => {
        if (!user) {
          toast.error("Connexion en cours, veuillez patienter...");
          setSubmitting(false);
          return;
        }

        if (isAdmin) {
          navigate("/admin");
        } else if (isApproved) {
          navigate("/espace-participant");
        } else {
          toast.error("Compte non approuvé");
          navigate("/");
        }

        setSubmitting(false);
      }, 600);

    } catch (err) {
      console.error(err);
      toast.error("Email ou mot de passe incorrect");
      setSubmitting(false);
    }
  };

  return (
    <div className="p-6 mt-20 max-w-md mx-auto">

      <h2 className="text-xl font-bold mb-4">Connexion</h2>

      <form onSubmit={handleSubmit} className="flex flex-col gap-3">

        <input
          className="border p-2"
          placeholder="Email"
          type="email"
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          className="border p-2"
          placeholder="Mot de passe"
          type="password"
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          disabled={submitting || loading}
          className="bg-blue-600 text-white p-2"
        >
          {submitting ? "Connexion..." : "Connexion"}
        </button>

      </form>

    </div>
  );
}