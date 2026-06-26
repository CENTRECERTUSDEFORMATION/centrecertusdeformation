// frontend/src/pages/Inscription.jsx
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
  const [userType, setUserType] = useState('participant');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [selectedFormation, setSelectedFormation] = useState(null);
  const [formationLoading, setFormationLoading] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [nameError, setNameError] = useState('');

  const navigate = useNavigate();
  const location = useLocation();

  const queryParams = new URLSearchParams(location.search);
  const redirectUrl = queryParams.get('redirect');
  const formationId = queryParams.get('formation');

  // Charger la formation si formationId est présent
  useEffect(() => {
    if (formationId) {
      const fetchFormation = async () => {
        setFormationLoading(true);
        try {
          const { data, error } = await supabase
            .from('formations')
            .select('id, title, is_online, on_demand')
            .eq('id', formationId)
            .single();

          if (error) throw error;
          setSelectedFormation(data);
        } catch (err) {
          console.error('Erreur chargement formation:', err);
          toast.error('Impossible de charger les informations de la formation');
        } finally {
          setFormationLoading(false);
        }
      };
      fetchFormation();
    }
  }, [formationId]);

  // Validation en temps réel
  const validateName = (value) => {
    if (!value.trim()) {
      setNameError('Le nom complet est requis');
      return false;
    }
    if (value.trim().length < 2) {
      setNameError('Le nom doit contenir au moins 2 caractères');
      return false;
    }
    setNameError('');
    return true;
  };

  const validateEmail = (value) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!value.trim()) {
      setEmailError('L\'email est requis');
      return false;
    }
    if (!emailRegex.test(value)) {
      setEmailError('Veuillez entrer un email valide');
      return false;
    }
    setEmailError('');
    return true;
  };

  const validatePassword = (value) => {
    if (value.length > 0 && value.length < 6) {
      setPasswordError('Le mot de passe doit contenir au moins 6 caractères');
      return false;
    }
    setPasswordError('');
    return true;
  };

  const handleNameChange = (e) => {
    const value = e.target.value;
    setFullName(value);
    validateName(value);
  };

  const handleEmailChange = (e) => {
    const value = e.target.value;
    setEmail(value);
    validateEmail(value);
  };

  const handlePasswordChange = (e) => {
    const value = e.target.value;
    setPassword(value);
    validatePassword(value);
    if (confirmPassword && value !== confirmPassword) {
      setPasswordError('Les mots de passe ne correspondent pas');
    } else if (value.length >= 6) {
      setPasswordError('');
    }
  };

  const handleConfirmPasswordChange = (e) => {
    const value = e.target.value;
    setConfirmPassword(value);
    if (password !== value) {
      setPasswordError('Les mots de passe ne correspondent pas');
    } else if (password.length >= 6) {
      setPasswordError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation complète
    const isNameValid = validateName(fullName);
    const isEmailValid = validateEmail(email);
    const isPasswordValid = validatePassword(password);

    if (!isNameValid || !isEmailValid || !isPasswordValid) {
      toast.error('Veuillez corriger les erreurs du formulaire');
      return;
    }

    if (password !== confirmPassword) {
      toast.error('Les mots de passe ne correspondent pas');
      return;
    }

    setLoading(true);

    try {
      // 1. Vérifier si l'email existe déjà
      const { data: existingUser } = await supabase
        .from('users')
        .select('email')
        .eq('email', email)
        .maybeSingle();

      if (existingUser) {
        toast.error('📧 Un compte existe déjà avec cet email. Veuillez vous connecter.');
        setLoading(false);
        return;
      }

      // 2. Inscription avec Supabase Auth
      const { data, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName.trim(),
            user_type: userType
          }
        }
      });

      if (authError) {
        console.error('Auth Error:', authError);

        if (authError.message?.includes('rate limit') || authError.status === 429) {
          toast.error('⏳ Trop de tentatives. Veuillez patienter 10 minutes.');
        } else if (authError.message?.includes('already registered')) {
          toast.error('📧 Cet email est déjà enregistré. Veuillez vous connecter.');
        } else if (authError.message?.includes('password')) {
          toast.error('🔑 Le mot de passe doit contenir au moins 6 caractères.');
        } else {
          toast.error(`❌ ${authError.message || "Erreur lors de l'inscription"}`);
        }
        setLoading(false);
        return;
      }

      if (!data?.user?.id) {
        toast.error('Erreur lors de la création du compte. Veuillez réessayer.');
        setLoading(false);
        return;
      }

      // 3. Si une formation est sélectionnée, créer automatiquement l'inscription
      if (selectedFormation && (selectedFormation.is_online || selectedFormation.on_demand)) {
        const tableName = selectedFormation.is_online ? 'inscriptions' : 'demandes_presentiel';
        const insertData = selectedFormation.is_online ? {
          user_id: data.user.id,
          formation_id: selectedFormation.id,
          statut: 'en_attente',
          created_at: new Date().toISOString()
        } : {
          formation_id: selectedFormation.id,
          nom: fullName.trim(),
          email: email,
          telephone: '',
          statut: 'nouvelle',
          created_at: new Date().toISOString()
        };

        const { error: inscriptionError } = await supabase
          .from(tableName)
          .insert(insertData);

        if (inscriptionError) {
          console.error("Erreur inscription auto:", inscriptionError);
          toast.warning('⚠️ Compte créé, mais l\'inscription à la formation a échoué. Contactez le support.');
        } else {
          toast.success(`✅ Inscription à "${selectedFormation.title}" enregistrée !`);
        }
      }

      const typeLabel = userType === 'formateur' ? 'formateur' : 'participant';
      toast.success(`✅ Inscription réussie ! Votre compte ${typeLabel} est en attente d'approbation.`);

      setTimeout(() => {
        if (redirectUrl) {
          navigate(redirectUrl);
        } else {
          navigate('/connexion');
        }
      }, 2500);

    } catch (err) {
      console.error("Erreur générale:", err);
      toast.error('Une erreur inattendue est survenue. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Inscription | Centre Certus de Formation</title>
        <meta name="description" content="Créez votre compte Centre Certus et accédez à nos formations." />
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
            <p className="text-gray-500 text-sm mt-1">Créez votre compte</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-2xl shadow-xl p-8"
          >
            {formationLoading ? (
              <div className="mb-4 p-3 bg-blue-50 rounded-lg flex items-center justify-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                <span className="text-sm text-blue-600">Chargement...</span>
              </div>
            ) : selectedFormation && (
              <div className="mb-5 p-3 bg-green-50 rounded-lg border border-green-200">
                <div className="flex items-center gap-2">
                  <span className="text-lg">🎓</span>
                  <div>
                    <p className="text-xs text-green-600 font-semibold">Inscription à la formation</p>
                    <p className="text-sm font-medium text-green-800">{selectedFormation.title}</p>
                    <p className="text-xs text-green-600 mt-0.5">
                      {selectedFormation.is_online ? '🌍 En ligne' : '🏢 Présentiel'}
                    </p>
                  </div>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Nom complet */}
              <div>
                <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">
                  Nom complet *
                </label>
                <input
                  id="fullName"
                  type="text"
                  placeholder="Jean Dupont"
                  value={fullName}
                  onChange={handleNameChange}
                  className={`w-full p-3 border ${nameError ? 'border-red-500' : 'border-gray-300'} rounded-xl focus:ring-2 focus:ring-[#1a56db] focus:border-transparent transition`}
                  required
                  disabled={loading}
                  autoComplete="name"
                  aria-label="Nom complet"
                  aria-invalid={!!nameError}
                  aria-describedby={nameError ? "name-error" : undefined}
                />
                {nameError && (
                  <p id="name-error" className="text-xs text-red-500 mt-1">{nameError}</p>
                )}
              </div>

              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email *
                </label>
                <input
                  id="email"
                  type="email"
                  placeholder="votre@email.com"
                  value={email}
                  onChange={handleEmailChange}
                  className={`w-full p-3 border ${emailError ? 'border-red-500' : 'border-gray-300'} rounded-xl focus:ring-2 focus:ring-[#1a56db] focus:border-transparent transition`}
                  required
                  disabled={loading}
                  autoComplete="email"
                  aria-label="Adresse email"
                  aria-invalid={!!emailError}
                  aria-describedby={emailError ? "email-error" : undefined}
                />
                {emailError && (
                  <p id="email-error" className="text-xs text-red-500 mt-1">{emailError}</p>
                )}
              </div>

              {/* Type de compte */}
              <div>
                <label htmlFor="userType" className="block text-sm font-medium text-gray-700 mb-1">
                  👤 Type de compte *
                </label>
                <select
                  id="userType"
                  value={userType}
                  onChange={(e) => setUserType(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#1a56db] focus:border-transparent transition"
                  required
                  disabled={loading}
                  aria-label="Type de compte"
                >
                  <option value="participant">👨‍🎓 Participant (stagiaire)</option>
                  <option value="formateur">👨‍🏫 Formateur</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  Les comptes formateurs doivent être approuvés par l'administrateur
                </p>
              </div>

              {/* Mot de passe */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  Mot de passe *
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••"
                    value={password}
                    onChange={handlePasswordChange}
                    className={`w-full p-3 border ${passwordError ? 'border-red-500' : 'border-gray-300'} rounded-xl pr-10 focus:ring-2 focus:ring-[#1a56db] focus:border-transparent transition`}
                    required
                    disabled={loading}
                    minLength={6}
                    autoComplete="new-password"
                    aria-label="Mot de passe"
                    aria-invalid={!!passwordError}
                    aria-describedby={passwordError ? "password-error" : undefined}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-3 flex items-center text-gray-500 hover:text-gray-700 transition"
                    aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                  >
                    {showPassword ? '🙈' : '👁️'}
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1">Minimum 6 caractères</p>
                {passwordError && (
                  <p id="password-error" className="text-xs text-red-500 mt-1">{passwordError}</p>
                )}
              </div>

              {/* Confirmer mot de passe */}
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                  Confirmer le mot de passe *
                </label>
                <input
                  id="confirmPassword"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••"
                  value={confirmPassword}
                  onChange={handleConfirmPasswordChange}
                  className={`w-full p-3 border ${passwordError ? 'border-red-500' : 'border-gray-300'} rounded-xl focus:ring-2 focus:ring-[#1a56db] focus:border-transparent transition`}
                  required
                  disabled={loading}
                  autoComplete="new-password"
                  aria-label="Confirmation du mot de passe"
                />
              </div>

              {/* Bouton d'inscription */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-[#1a56db] to-[#76c21f] text-white py-3 rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:hover:scale-100 hover:scale-[1.02]"
                aria-label={loading ? "Inscription en cours..." : selectedFormation ? "S'inscrire et rejoindre la formation" : "S'inscrire"}
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Inscription en cours...
                  </span>
                ) : (
                  selectedFormation ? "S'inscrire et rejoindre la formation" : "S'inscrire"
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

            {/* Lien connexion */}
            <div className="text-center">
              <p className="text-sm text-gray-600">
                Déjà un compte ?
                <Link
                  to={`/connexion${redirectUrl ? `?redirect=${encodeURIComponent(redirectUrl)}` : ''}`}
                  className="ml-1 text-[#1a56db] font-semibold hover:text-[#76c21f] transition"
                >
                  Se connecter
                </Link>
              </p>
            </div>

            {/* Information */}
            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <p className="text-xs text-blue-600 text-center">
                📌 L'inscription est gratuite. Votre compte sera activé par l'administrateur dans les plus brefs délais.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </>
  );
}