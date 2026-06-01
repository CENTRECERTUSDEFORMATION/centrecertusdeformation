import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { toast } from 'react-toastify';

export default function Inscription() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Récupérer l'URL de redirection depuis les paramètres
  const [redirectUrl, setRedirectUrl] = useState(null);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const redirect = params.get('redirect');
    if (redirect) {
      setRedirectUrl(decodeURIComponent(redirect));
    }
  }, [location]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Validation des champs
    if (!fullName.trim()) {
      toast.error("Veuillez entrer votre nom complet");
      setLoading(false);
      return;
    }

    if (!email.trim()) {
      toast.error("Veuillez entrer votre email");
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Les mots de passe ne correspondent pas");
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      toast.error("Le mot de passe doit contenir au moins 6 caractères");
      setLoading(false);
      return;
    }

    try {
      // 1. Vérifier si l'email existe déjà dans la table users
      const { data: existingUser } = await supabase
        .from('users')
        .select('email')
        .eq('email', email)
        .maybeSingle();

      if (existingUser) {
        toast.error("📧 Un compte existe déjà avec cet email. Veuillez vous connecter.");
        setLoading(false);
        return;
      }

      // 2. Inscription avec Supabase Auth
      const { data, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName
          }
        }
      });

      if (authError) {
        console.error("Auth Error:", authError);
        
        if (authError.message?.includes("rate limit") || authError.status === 429) {
          toast.error("⏳ Trop de tentatives. Veuillez patienter 10 minutes.");
        } else if (authError.message?.includes("already registered")) {
          toast.error("📧 Cet email est déjà enregistré. Veuillez vous connecter.");
        } else if (authError.message?.includes("password")) {
          toast.error("🔑 Le mot de passe doit contenir au moins 6 caractères.");
        } else {
          toast.error(`❌ ${authError.message || "Erreur lors de l'inscription"}`);
        }
        setLoading(false);
        return;
      }

      if (!data?.user?.id) {
        toast.error("Erreur lors de la création du compte. Veuillez réessayer.");
        setLoading(false);
        return;
      }

      // 3. Ajouter dans la table users
      const { error: dbError } = await supabase
        .from('users')
        .insert({
          id: data.user.id,
          full_name: fullName,
          email: email,
          is_admin: false,
          is_approved: false,
          user_type: "participant",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

      if (dbError) {
        console.error("DB Error:", dbError);
        // Nettoyer l'utilisateur Auth en cas d'erreur DB
        try {
          await supabase.auth.admin.deleteUser(data.user.id);
        } catch (e) {
          console.error("Erreur nettoyage:", e);
        }
        toast.error("Erreur lors de l'enregistrement. Veuillez réessayer.");
        setLoading(false);
        return;
      }

      toast.success("✅ Inscription réussie ! Votre compte est en attente d'approbation.");
      
      // Redirection vers l'URL de redirection ou vers la connexion
      setTimeout(() => {
        if (redirectUrl) {
          navigate(redirectUrl);
        } else {
          navigate('/connexion');
        }
      }, 2000);

    } catch (err) {
      console.error("Erreur générale:", err);
      toast.error("Une erreur est survenue. Veuillez réessayer.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Inscription | Centre Certus de Formation</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 pt-20 flex items-center justify-center">
        <div className="max-w-md w-full mx-4">
          
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <div className="w-20 h-20 bg-gradient-to-r from-[#1a56db] to-[#76c21f] rounded-2xl flex items-center justify-center mx-auto shadow-lg mb-4">
              <span className="text-3xl text-white">📝</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-800">Inscription</h1>
            <p className="text-gray-500 text-sm mt-1">
              Créez votre compte participant
            </p>
            {redirectUrl && (
              <p className="text-xs text-blue-600 mt-2">
                🔄 Vous serez redirigé après inscription
              </p>
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-2xl shadow-xl p-8"
          >
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nom complet *
                </label>
                <input
                  type="text"
                  placeholder="Jean Dupont"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#1a56db] focus:border-transparent transition"
                  required
                  disabled={loading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email *
                </label>
                <input
                  type="email"
                  placeholder="votre@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#1a56db] focus:border-transparent transition"
                  required
                  disabled={loading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mot de passe *
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#1a56db] focus:border-transparent transition pr-10"
                    required
                    disabled={loading}
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-3 flex items-center text-gray-500"
                  >
                    {showPassword ? "🙈" : "👁️"}
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1">Minimum 6 caractères</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Confirmer le mot de passe *
                </label>
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#1a56db] focus:border-transparent transition"
                  required
                  disabled={loading}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-[#1a56db] to-[#76c21f] text-white py-3 rounded-xl font-semibold hover:shadow-lg transition-all hover:scale-[1.02] disabled:opacity-50 disabled:hover:scale-100"
              >
                {loading ? "Inscription en cours..." : "S'inscrire"}
              </button>
            </form>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-3 bg-white text-gray-400">ou</span>
              </div>
            </div>

            <div className="text-center">
              <p className="text-sm text-gray-600">
                Déjà un compte ?
                <Link to="/connexion" className="ml-1 text-[#1a56db] font-semibold hover:text-[#76c21f] transition">
                  Se connecter
                </Link>
              </p>
            </div>

            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <p className="text-xs text-blue-600 text-center">
                📌 L'inscription est gratuite. Votre compte sera activé par l'administrateur.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </>
  );
}