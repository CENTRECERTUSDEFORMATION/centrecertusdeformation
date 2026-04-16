import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import logo from "../assets/logo-certus.png";

const Connexion = () => {
  const { login, user, role, loading: authLoading } = useAuth();
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
    } catch (err) {
      toast.error("Email ou mot de passe incorrect");
    } finally {
      setLoading(false);
    }
  };

  // 🔥 REDIRECTION PROPRE (IMPORTANT)
  useEffect(() => {
    if (!user) return;

    if (role === "admin") {
      navigate("/admin");
    } else {
      navigate("/espace-participant");
    }
  }, [user, role, navigate]);

  return (
    <>
      <header className="flex items-center gap-4 p-6 border-b max-w-md mx-auto mt-10">
        <img src={logo} alt="Logo Certus" className="h-12 w-auto" />
        <div>
          <h1 className="text-2xl font-bold text-blue-800">
            CENTRE CERTUS DE FORMATION
          </h1>
          <p className="text-sm text-gray-600">
            Structure privée - N° 52-193-17
          </p>
        </div>
      </header>

      <main className="max-w-sm mx-auto p-6">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="Email"
            className="w-full p-2 border rounded"
          />

          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="Mot de passe"
            className="w-full p-2 border rounded"
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
          >
            {loading ? "Connexion..." : "Se connecter"}
          </button>
        </form>
      </main>
    </>
  );
};

export default Connexion;