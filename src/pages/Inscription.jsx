// frontend/src/pages/Inscription.jsx
import React, { useState, useEffect, useCallback, useRef } from 'react';
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
  const [touched, setTouched] = useState({});
  const [isFormValid, setIsFormValid] = useState(false);
  const [phone, setPhone] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const formRef = useRef(null);

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
            .select('id, title, is_online, on_demand, description, duration, price, images')
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
  const validateName = useCallback((value) => {
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
  }, []);

  const validateEmail = useCallback((value) => {
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
  }, []);

  const validatePassword = useCallback((value) => {
    if (value.length > 0 && value.length < 6) {
      setPasswordError('Le mot de passe doit contenir au moins 6 caractères');
      return false;
    }
    if (value.length > 0 && !/(?=.*[A-Z])(?=.*[a-z])/.test(value)) {
      setPasswordError('Le mot de passe doit contenir une majuscule et une minuscule');
      return false;
    }
    setPasswordError('');
    return true;
  }, []);

  // Vérification de la validité du formulaire
  useEffect(() => {
    const isNameValid = fullName.trim().length >= 2;
    const isEmailValid = validateEmail(email);
    const isPasswordValid = password.length >= 6 && confirmPassword === password && password.length > 0;
    const isPhoneValid = !phone || phone.length >= 8;
    
    setIsFormValid(isNameValid && isEmailValid && isPasswordValid && isPhoneValid && termsAccepted);
  }, [fullName, email, password, confirmPassword, phone, termsAccepted, validateEmail]);

  const handleNameChange = (e) => {
    const value = e.target.value;
    setFullName(value);
    if (touched.name) validateName(value);
  };

  const handleEmailChange = (e) => {
    const value = e.target.value;
    setEmail(value);
    if (touched.email) validateEmail(value);
  };

  const handlePasswordChange = (e) => {
    const value = e.target.value;
    setPassword(value);
    if (touched.password) {
      validatePassword(value);
      if (confirmPassword && value !== confirmPassword) {
        setPasswordError('Les mots de passe ne correspondent pas');
      }
    }
  };

  const handleConfirmPasswordChange = (e) => {
    const value = e.target.value;
    setConfirmPassword(value);
    if (touched.password) {
      if (password !== value) {
        setPasswordError('Les mots de passe ne correspondent pas');
      } else if (password.length >= 6) {
        setPasswordError('');
      }
    }
  };

  const handleBlur = (field) => {
    setTouched({ ...touched, [field]: true });
    if (field === 'name') validateName(fullName);
    if (field === 'email') validateEmail(email);
    if (field === 'password') validatePassword(password);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation complète
    const isNameValid = validateName(fullName);
    const isEmailValid = validateEmail(email);
    const isPasswordValid = validatePassword(password);

    if (!isNameValid || !isEmailValid || !isPasswordValid) {
      setTouched({ name: true, email: true, password: true });
      toast.error('Veuillez corriger les erreurs du formulaire');
      return;
    }

    if (password !== confirmPassword) {
      toast.error('Les mots de passe ne correspondent pas');
      return;
    }

    if (!termsAccepted) {
      toast.error('Veuillez accepter les conditions d\'utilisation');
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
        toast.info('📧 Un compte existe déjà avec cet email. Veuillez vous connecter.', {
          onClick: () => navigate(`/connexion${redirectUrl ? `?redirect=${encodeURIComponent(redirectUrl)}` : ''}`)
        });
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
            user_type: userType,
            phone: phone || null,
            formation_id: selectedFormation?.id || null, // ✅ Stocker la formation dans les métadonnées
            formation_title: selectedFormation?.title || null
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

      // 3. Insérer l'utilisateur dans la table users
      const { error: insertError } = await supabase
        .from('users')
        .upsert({
          id: data.user.id,
          email: email,
          full_name: fullName.trim(),
          user_type: userType,
          is_admin: false,
          is_approved: false, // En attente d'approbation
          phone: phone || null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }, { onConflict: 'id' });

      if (insertError) {
        console.error("Erreur insertion user:", insertError);
        toast.warning('⚠️ Compte créé mais erreur lors de l\'enregistrement des données.');
      }

      // 4. Si une formation est sélectionnée, créer automatiquement l'inscription
      if (selectedFormation) {
        try {
          // ✅ Insérer l'inscription dans la table inscriptions avec statut "en_attente"
          const { error: inscriptionError } = await supabase
            .from('inscriptions')
            .insert({
              user_id: data.user.id,
              formation_id: selectedFormation.id,
              statut: 'en_attente',
              created_at: new Date().toISOString(),
              source: 'inscription_auto' // Pour tracer l'origine
            });

          if (inscriptionError) {
            console.error("Erreur inscription auto:", inscriptionError);
            toast.warning('⚠️ Compte créé, mais l\'inscription à la formation a échoué. Contactez le support.');
          } else {
            toast.success(`✅ Inscription à "${selectedFormation.title}" enregistrée ! En attente de validation.`);
          }
        } catch (inscriptionErr) {
          console.error("Erreur lors de l'inscription à la formation:", inscriptionErr);
          toast.warning('⚠️ Compte créé, mais l\'inscription à la formation a échoué. Contactez le support.');
        }
      }

      const typeLabel = userType === 'formateur' ? 'formateur' : 'participant';
      toast.success(`✅ Inscription réussie ! Votre compte ${typeLabel} est en attente d'approbation.`);

      // 5. Redirection avec un délai
      setTimeout(() => {
        if (redirectUrl) {
          navigate(redirectUrl);
        } else if (selectedFormation) {
          navigate(`/formations/${selectedFormation.id}`);
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
            className="bg-white rounded-2xl shadow-xl p-6"
          >
            {/* ✅ Bannière de la formation sélectionnée */}
            {formationLoading ? (
              <div className="mb-4 p-3 bg-blue-50 rounded-lg flex items-center justify-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                <span className="text-sm text-blue-600">Chargement...</span>
              </div>
            ) : selectedFormation && (
              <div className="mb-5 p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-xl border border-green-200">
                <div className="flex items-start gap-3">
                  <span className="text-2xl">🎓</span>
                  <div className="flex-1">
                    <p className="text-xs text-green-600 font-semibold">Inscription à la formation</p>
                    <p className="text-sm font-medium text-green-800">{selectedFormation.title}</p>
                    <div className="flex flex-wrap gap-2 mt-1">
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                        {selectedFormation.is_online ? '🌍 En ligne' : selectedFormation.on_demand ? '🏢 Présentiel' : '📚 Formation'}
                      </span>
                      {selectedFormation.duration && (
                        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                          ⏱️ {selectedFormation.duration}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4" ref={formRef} noValidate>
              {/* Nom complet */}
              <div>
                <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">
                  Nom complet <span className="text-red-500">*</span>
                </label>
                <input
                  id="fullName"
                  type="text"
                  placeholder="Jean Dupont"
                  value={fullName}
                  onChange={handleNameChange}
                  onBlur={() => handleBlur('name')}
                  className={`w-full p-3 border ${nameError && touched.name ? 'border-red-500' : 'border-gray-300'} rounded-xl focus:ring-2 focus:ring-[#1a56db] focus:border-transparent transition text-base`}
                  required
                  disabled={loading}
                  autoComplete="name"
                  aria-label="Nom complet"
                  aria-invalid={!!nameError && touched.name}
                  aria-describedby={nameError && touched.name ? "name-error" : undefined}
                />
                {nameError && touched.name && (
                  <p id="name-error" className="text-xs text-red-500 mt-1 flex items-center gap-1">
                    <span>⚠️</span> {nameError}
                  </p>
                )}
              </div>

              {/* Téléphone (optionnel) */}
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                  Téléphone <span className="text-gray-400">(optionnel)</span>
                </label>
                <input
                  id="phone"
                  type="tel"
                  placeholder="06 12 34 56 78"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#1a56db] focus:border-transparent transition text-base"
                  disabled={loading}
                  autoComplete="tel"
                  aria-label="Numéro de téléphone"
                />
              </div>

              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  id="email"
                  type="email"
                  placeholder="votre@email.com"
                  value={email}
                  onChange={handleEmailChange}
                  onBlur={() => handleBlur('email')}
                  className={`w-full p-3 border ${emailError && touched.email ? 'border-red-500' : 'border-gray-300'} rounded-xl focus:ring-2 focus:ring-[#1a56db] focus:border-transparent transition text-base`}
                  required
                  disabled={loading}
                  autoComplete="email"
                  aria-label="Adresse email"
                  aria-invalid={!!emailError && touched.email}
                  aria-describedby={emailError && touched.email ? "email-error" : undefined}
                />
                {emailError && touched.email && (
                  <p id="email-error" className="text-xs text-red-500 mt-1 flex items-center gap-1">
                    <span>⚠️</span> {emailError}
                  </p>
                )}
              </div>

              {/* Type de compte */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  👤 Type de compte <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setUserType('participant')}
                    className={`p-3 rounded-xl border-2 transition-all ${
                      userType === 'participant'
                        ? 'border-[#1a56db] bg-blue-50 text-[#1a56db]'
                        : 'border-gray-200 text-gray-600 hover:border-gray-300'
                    }`}
                  >
                    <div className="text-2xl">👨‍🎓</div>
                    <div className="text-sm font-medium">Participant</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setUserType('formateur')}
                    className={`p-3 rounded-xl border-2 transition-all ${
                      userType === 'formateur'
                        ? 'border-[#76c21f] bg-green-50 text-[#76c21f]'
                        : 'border-gray-200 text-gray-600 hover:border-gray-300'
                    }`}
                  >
                    <div className="text-2xl">👨‍🏫</div>
                    <div className="text-sm font-medium">Formateur</div>
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  {userType === 'formateur' 
                    ? 'Les comptes formateurs doivent être approuvés par l\'administrateur'
                    : 'Accédez à vos formations et suivez votre progression'}
                </p>
              </div>

              {/* Mot de passe */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  Mot de passe <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••"
                    value={password}
                    onChange={handlePasswordChange}
                    onBlur={() => handleBlur('password')}
                    className={`w-full p-3 border ${passwordError && touched.password ? 'border-red-500' : 'border-gray-300'} rounded-xl pr-12 focus:ring-2 focus:ring-[#1a56db] focus:border-transparent transition text-base`}
                    required
                    disabled={loading}
                    minLength={6}
                    autoComplete="new-password"
                    aria-label="Mot de passe"
                    aria-invalid={!!passwordError && touched.password}
                    aria-describedby={passwordError && touched.password ? "password-error" : undefined}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-3 flex items-center text-gray-500 hover:text-gray-700 transition"
                    aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                  >
                    {showPassword ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    )}
                  </button>
                </div>
                <div className="flex flex-wrap gap-3 mt-1">
                  <span className={`text-xs ${password.length === 0 ? 'text-gray-400' : password.length >= 6 ? 'text-green-600' : 'text-red-500'}`}>
                    {password.length === 0 ? '🔒 6 caractères minimum' : password.length >= 6 ? '✅ 6 caractères' : '❌ 6 caractères minimum'}
                  </span>
                  <span className={`text-xs ${password.length === 0 ? 'text-gray-400' : /[A-Z]/.test(password) && /[a-z]/.test(password) ? 'text-green-600' : 'text-red-500'}`}>
                    {password.length === 0 ? '🔤 Majuscule + minuscule' : /[A-Z]/.test(password) && /[a-z]/.test(password) ? '✅ Maj + Min' : '❌ Maj + Min'}
                  </span>
                </div>
                {passwordError && touched.password && (
                  <p id="password-error" className="text-xs text-red-500 mt-1 flex items-center gap-1">
                    <span>⚠️</span> {passwordError}
                  </p>
                )}
              </div>

              {/* Confirmer mot de passe */}
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                  Confirmer le mot de passe <span className="text-red-500">*</span>
                </label>
                <input
                  id="confirmPassword"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••"
                  value={confirmPassword}
                  onChange={handleConfirmPasswordChange}
                  onBlur={() => handleBlur('password')}
                  className={`w-full p-3 border ${passwordError && touched.password ? 'border-red-500' : 'border-gray-300'} rounded-xl focus:ring-2 focus:ring-[#1a56db] focus:border-transparent transition text-base`}
                  required
                  disabled={loading}
                  autoComplete="new-password"
                  aria-label="Confirmation du mot de passe"
                />
                {confirmPassword && password && confirmPassword === password && password.length >= 6 && (
                  <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                    <span>✅</span> Les mots de passe correspondent
                  </p>
                )}
              </div>

              {/* Conditions d'utilisation */}
              <div className="flex items-start gap-2">
                <input
                  id="terms"
                  type="checkbox"
                  checked={termsAccepted}
                  onChange={(e) => setTermsAccepted(e.target.checked)}
                  className="mt-1 w-4 h-4 text-[#1a56db] border-gray-300 rounded focus:ring-[#1a56db]"
                  disabled={loading}
                  aria-label="Accepter les conditions d'utilisation"
                />
                <label htmlFor="terms" className="text-sm text-gray-600">
                  J'accepte les{' '}
                  <Link to="/conditions" className="text-[#1a56db] hover:text-[#76c21f] transition">
                    conditions d'utilisation
                  </Link>
                  {' '}et la{' '}
                  <Link to="/confidentialite" className="text-[#1a56db] hover:text-[#76c21f] transition">
                    politique de confidentialité
                  </Link>
                </label>
              </div>

              {/* Bouton d'inscription */}
              <button
                type="submit"
                disabled={loading || !isFormValid}
                className="w-full bg-gradient-to-r from-[#1a56db] to-[#76c21f] text-white py-3 rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:hover:scale-100 hover:scale-[1.02] text-base"
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
                  selectedFormation ? "🎓 S'inscrire et rejoindre la formation" : "📝 S'inscrire"
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