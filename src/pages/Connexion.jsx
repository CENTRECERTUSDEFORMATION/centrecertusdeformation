import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-toastify";
import { Helmet } from "react-helmet-async";

export default function Connexion() {
  const { login, user, isAdmin, isApproved, loading } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState({
    show: false,
    message: "",
    type: "" // "loading", "success", "error"
  });

  // Nettoyer le message après un délai
  const clearStatusMessage = () => {
    setTimeout(() => {
      setConnectionStatus({ show: false, message: "", type: "" });
    }, 3000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Empêcher les doubles soumissions
    if (submitting) return;
    
    setSubmitting(true);
    
    // Afficher la bannière de chargement
    setConnectionStatus({
      show: true,
      message: "🔐 Connexion en cours, veuillez patienter...",
      type: "loading"
    });

    try {
      // Tentative de connexion
      await login(email, password);

      // Attendre que le contexte soit mis à jour
      setTimeout(() => {
        // Vérifier l'état après connexion
        if (!user) {
          // Échec silencieux - PAS de toast.error ici
          setConnectionStatus({
            show: true,
            message: "❌ Connexion échouée. Email ou mot de passe incorrect.",
            type: "error"
          });
          setSubmitting(false);
          clearStatusMessage();
          return;
        }

        // Succès selon le rôle
        if (isAdmin) {
          setConnectionStatus({
            show: true,
            message: "✅ Connexion établie en tant qu'Administrateur ! Redirection...",
            type: "success"
          });
          // PAS de toast ici non plus, juste la bannière
          
          setTimeout(() => {
            navigate("/admin");
          }, 1000);
          
        } else if (isApproved) {
          setConnectionStatus({
            show: true,
            message: "✅ Connexion établie en tant que Participant ! Redirection...",
            type: "success"
          });
          // PAS de toast
          
          setTimeout(() => {
            navigate("/espace-participant");
          }, 1000);
          
        } else {
          setConnectionStatus({
            show: true,
            message: "❌ Compte non approuvé. Veuillez contacter l'administrateur.",
            type: "error"
          });
          setSubmitting(false);
          clearStatusMessage();
        }
      }, 500);

    } catch (err) {
      console.error("Erreur connexion:", err);
      
      // Message d'erreur clair - PAS de toast.error
      let errorMessage = "❌ Connexion échouée. Email ou mot de passe incorrect.";
      if (err.message?.includes("Invalid login credentials")) {
        errorMessage = "❌ Email ou mot de passe incorrect. Veuillez réessayer.";
      } else if (err.message?.includes("Email not confirmed")) {
        errorMessage = "❌ Email non confirmé. Vérifiez votre boîte de réception.";
      }
      
      setConnectionStatus({
        show: true,
        message: errorMessage,
        type: "error"
      });
      setSubmitting(false);
      clearStatusMessage();
    }
  };

  return (
    <>
      <Helmet>
        <title>Connexion | Centre Certus de Formation</title>
        <meta name="description" content="Connectez-vous à votre espace personnel Centre Certus." />
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 pt-20 flex items-center justify-center">
        <div className="max-w-md w-full mx-4">
          
          {/* Bannière de statut animée - UNIQUEMENT cette notification */}
          <AnimatePresence>
            {connectionStatus.show && (
              <motion.div
                initial={{ opacity: 0, y: -50 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -50 }}
                className={`mb-6 rounded-xl p-4 shadow-lg ${
                  connectionStatus.type === "loading"
                    ? "bg-blue-50 border border-blue-200"
                    : connectionStatus.type === "success"
                    ? "bg-green-50 border border-green-200"
                    : "bg-red-50 border border-red-200"
                }`}
              >
                <div className="flex items-center gap-3">
                  {connectionStatus.type === "loading" && (
                    <svg className="animate-spin h-5 w-5 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  )}
                  {connectionStatus.type === "success" && (
                    <svg className="h-5 w-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  )}
                  {connectionStatus.type === "error" && (
                    <svg className="h-5 w-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  )}
                  <p className={`text-sm font-medium ${
                    connectionStatus.type === "loading"
                      ? "text-blue-700"
                      : connectionStatus.type === "success"
                      ? "text-green-700"
                      : "text-red-700"
                  }`}>
                    {connectionStatus.message}
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Logo et titre */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <div className="w-20 h-20 bg-gradient-to-r from-[#1a56db] to-[#76c21f] rounded-2xl flex items-center justify-center mx-auto shadow-lg mb-4">
              <span className="text-3xl text-white">🔐</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-800">Connexion</h1>
            <p className="text-gray-500 text-sm mt-1">
              Accédez à votre espace personnel
            </p>
          </motion.div>

          {/* Carte de connexion */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-2xl shadow-xl p-8"
          >
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Champ Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <input
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1a56db] focus:border-transparent transition"
                    placeholder="votre@email.com"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={submitting}
                  />
                </div>
              </div>

              {/* Champ Mot de passe */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mot de passe
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <input
                    className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1a56db] focus:border-transparent transition"
                    placeholder="Votre mot de passe"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={submitting}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showPassword ? (
                      <svg className="h-5 w-5 text-gray-400 hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    ) : (
                      <svg className="h-5 w-5 text-gray-400 hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {/* Lien mot de passe oublié */}
              <div className="text-right">
                <Link
                  to="/mot-de-passe-oublie"
                  className="text-sm text-[#1a56db] hover:text-[#76c21f] transition"
                >
                  Mot de passe oublié ?
                </Link>
              </div>

              {/* Bouton de connexion */}
              <button
                type="submit"
                disabled={submitting || loading}
                className="w-full bg-gradient-to-r from-[#1a56db] to-[#76c21f] text-white py-3 rounded-xl font-semibold hover:shadow-lg transition-all hover:scale-[1.02] disabled:opacity-50 disabled:hover:scale-100"
              >
                {submitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Connexion...
                  </span>
                ) : (
                  "Se connecter"
                )}
              </button>
            </form>

            {/* Séparateur */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-3 bg-white text-gray-400">ou</span>
              </div>
            </div>

            {/* Lien vers inscription */}
            <div className="text-center">
              <p className="text-sm text-gray-600">
                Pas encore de compte ?
                <Link
                  to="/inscription"
                  className="ml-1 text-[#1a56db] font-semibold hover:text-[#76c21f] transition"
                >
                  Créer un compte
                </Link>
              </p>
            </div>
          </motion.div>

          {/* Informations supplémentaires */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-6 text-center"
          >
            <p className="text-xs text-gray-400">
              Accès sécurisé 🔒
            </p>
          </motion.div>
        </div>
      </div>
    </>
  );
}