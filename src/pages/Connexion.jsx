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
      await login(email, password);

      toast.success("Connexion réussie !");

      // ⛔ ATTENTION: petit délai pour laisser AuthContext charger user
      setTimeout(() => {
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
      }, 300);

    } catch (err) {
      toast.error(err.message || "Erreur connexion");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <form onSubmit={handleSubmit} className="p-6 bg-white shadow rounded">
        <input
          type="email"
          placeholder="Email"
          onChange={(e) => setEmail(e.target.value)}
          className="border p-2 w-full mb-2"
        />

        <input
          type="password"
          placeholder="Mot de passe"
          onChange={(e) => setPassword(e.target.value)}
          className="border p-2 w-full mb-2"
        />

        <button className="bg-blue-700 text-white px-4 py-2 w-full">
          Connexion
        </button>
      </form>
    </div>
  );
}