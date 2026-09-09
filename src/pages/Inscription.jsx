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
  const [selectedFormationId, setSelectedFormationId] = useState('');
  const [formationsList, setFormationsList] = useState([]);
  const [formationsLoading, setFormationsLoading] = useState(false);
  const [formationLoading, setFormationLoading] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [nameError, setNameError] = useState('');
  const [touched, setTouched] = useState({});
  const [isFormValid, setIsFormValid] = useState(false);
  const [phone, setPhone] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [searchFormationTerm, setSearchFormationTerm] = useState('');

  const navigate = useNavigate();
  const location = useLocation();
  const formRef = useRef(null);

  const queryParams = new URLSearchParams(location.search);
  const redirectUrl = queryParams.get('redirect');
  const formationId = queryParams.get('formation');
  const testCompleted = queryParams.get('test') === 'completed';

  // Charger la liste des formations
  useEffect(() => {
    const fetchFormations = async () => {
      setFormationsLoading(true);
      try {
        const { data, error } = await supabase
          .from('formations')
          .select('id, title, is_online, on_demand, duration, description, price')
          .order('title', { ascending: true });

        if (error) throw error;
        setFormationsList(data || []);
      } catch (err) {
        console.error('Erreur chargement formations:', err);
        toast.error('Impossible de charger la liste des formations');
      } finally {
        setFormationsLoading(false);
      }
    };
    fetchFormations();
  }, []);

  // Récupérer le résultat du test depuis sessionStorage
  useEffect(() => {
    if (testCompleted) {
      const savedResult = sessionStorage.getItem('test_result');
      if (savedResult) {
        try {
          const result = JSON.parse(savedResult);
          setTestResult(result);
        } catch (e) {
          console.error('Erreur parsing test result:', e);
        }
      }
    }
  }, [testCompleted]);

  // Charger la formation si formationId est présent dans l'URL
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
          setSelectedFormationId(data.id);
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

  // Gestion du changement de formation dans le select
  const handleFormationChange = (e) => {
    const id = e.target.value;
    setSelectedFormationId(id);
    if (id) {
      const formation = formationsList.find(f => f.id === id);
      setSelectedFormation(formation);
    } else {
      setSelectedFormation(null);
    }
  };

  // Validation du numéro de téléphone
  const validatePhone = useCallback((value) => {
    if (!value.trim()) {
      setPhoneError('Le numéro de téléphone est requis');
      return false;
    }
    if (value.trim().length < 8) {
      setPhoneError('Le numéro de téléphone doit contenir au moins 8 chiffres');
      return false;
    }
    const phoneRegex = /^[\+\d\s\-\(\)]{8,}$/;
    if (!phoneRegex.test(value.trim())) {
      setPhoneError('Format de téléphone invalide');
      return false;
    }
    setPhoneError('');
    return true;
  }, []);

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
    const isPhoneValid = phone.trim().length >= 8 && validatePhone(phone);
    
    setIsFormValid(isNameValid && isEmailValid && isPasswordValid && isPhoneValid && termsAccepted);
  }, [fullName, email, password, confirmPassword, phone, termsAccepted, validateEmail, validatePhone]);

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

  const handlePhoneChange = (e) => {
    const value = e.target.value;
    setPhone(value);
    if (touched.phone) validatePhone(value);
  };

  const handleBlur = (field) => {
    setTouched({ ...touched, [field]: true });
    if (field === 'name') validateName(fullName);
    if (field === 'email') validateEmail(email);
    if (field === 'password') validatePassword(password);
    if (field === 'phone') validatePhone(phone);
  };

  // Vérifier si un utilisateur existe déjà avec ce téléphone
  const checkPhoneExists = async (phoneNumber) => {
    if (!phoneNumber) return false;
    try {
      const { data, error } = await supabase
        .from('users')
        .select('phone')
        .eq('phone', phoneNumber)
        .maybeSingle();
      
      if (error) throw error;
      return !!data;
    } catch (err) {
      console.error('Erreur vérification téléphone:', err);
      return false;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation complète
    const isNameValid = validateName(fullName);
    const isEmailValid = validateEmail(email);
    const isPasswordValid = validatePassword(password);
    const isPhoneValid = validatePhone(phone);

    if (!isNameValid || !isEmailValid || !isPasswordValid || !isPhoneValid) {
      setTouched({ name: true, email: true, password: true, phone: true });
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

      // 2. Vérifier si le téléphone existe déjà
      const phoneExists = await checkPhoneExists(phone);
      if (phoneExists) {
        toast.error('📱 Ce numéro de téléphone est déjà utilisé par un autre compte');
        setLoading(false);
        return;
      }

      // 3. Inscription avec Supabase Auth
      const { data, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName.trim(),
            user_type: userType,
            phone: phone || null,
            formation_id: selectedFormation?.id || null,
            formation_title: selectedFormation?.title || null,
            formation_chosen: selectedFormation ? {
              id: selectedFormation.id,
              title: selectedFormation.title
            } : null,
            test_completed: testCompleted || false,
            test_result: testResult || null
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

      // 4. Insérer l'utilisateur dans la table users
      const { error: insertError } = await supabase
        .from('users')
        .upsert({
          id: data.user.id,
          email: email,
          full_name: fullName.trim(),
          user_type: userType,
          is_admin: false,
          is_approved: false,
          phone: phone || null,
          chosen_formation_id: selectedFormation?.id || null,
          chosen_formation_title: selectedFormation?.title || null,
          formation_chosen: selectedFormation ? {
            id: selectedFormation.id,
            title: selectedFormation.title
          } : null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }, { onConflict: 'id' });

      if (insertError) {
        console.error("Erreur insertion user:", insertError);
        toast.warning('⚠️ Compte créé mais erreur lors de l\'enregistrement des données.');
      }

      // 5. Sauvegarder le résultat du test si présent
      if (testResult && testCompleted) {
        try {
          const { error: testError } = await supabase
            .from('test_results')
            .insert({
              user_id: data.user.id,
              formation_id: testResult.formationId || formationId,
              test_type: testResult.test_type || 'default',
              score: testResult.correct || 0,
              total_questions: testResult.total || 0,
              percentage: testResult.percentage || 0,
              level: testResult.level || 'Débutant',
              answers: testResult.answers || {},
              time_spent: testResult.timeSpent || 0,
              created_at: new Date().toISOString()
            });

          if (testError) {
            console.error("Erreur sauvegarde test result:", testError);
            toast.warning('⚠️ Compte créé, mais le résultat du test n\'a pas été sauvegardé.');
          } else {
            toast.success('🧪 Votre résultat de test a été sauvegardé !');
            sessionStorage.removeItem('test_result');
          }
        } catch (testErr) {
          console.error("Erreur lors de la sauvegarde du test:", testErr);
        }
      }

      // ✅ 6. Si une formation est sélectionnée, créer automatiquement l'inscription
      // ✅ CORRIGÉ : Ne pas afficher d'erreur si l'inscription existe déjà ou est en attente
      if (selectedFormation) {
        try {
          // Vérifier si une inscription existe déjà
          const { data: existingInscription, error: checkError } = await supabase
            .from('inscriptions')
            .select('id, statut')
            .eq('user_id', data.user.id)
            .eq('formation_id', selectedFormation.id)
            .maybeSingle();

          if (checkError) {
            console.error("Erreur vérification inscription existante:", checkError);
          }

          if (existingInscription) {
            // ✅ L'inscription existe déjà - ne pas afficher d'erreur
            if (existingInscription.statut === 'en_attente') {
              toast.info(`📝 Vous êtes déjà inscrit à "${selectedFormation.title}" (en attente de validation)`);
            } else if (existingInscription.statut === 'confirme') {
              toast.success(`✅ Vous êtes déjà inscrit à "${selectedFormation.title}"`);
            } else {
              // Si l'inscription est annulée ou rejetée, on la réactive
              const { error: updateError } = await supabase
                .from('inscriptions')
                .update({
                  statut: 'en_attente',
                  updated_at: new Date().toISOString()
                })
                .eq('id', existingInscription.id);

              if (updateError) {
                console.error("Erreur réactivation inscription:", updateError);
                // ✅ Ne pas afficher d'erreur bloquante
                toast.warning('⚠️ L\'inscription à la formation sera traitée manuellement.');
              } else {
                toast.success(`✅ Inscription à "${selectedFormation.title}" réactivée ! En attente de validation.`);
              }
            }
          } else {
            // ✅ Créer une nouvelle inscription
            const { error: inscriptionError } = await supabase
              .from('inscriptions')
              .insert({
                user_id: data.user.id,
                formation_id: selectedFormation.id,
                statut: 'en_attente',
                created_at: new Date().toISOString(),
                source: testCompleted ? 'inscription_apres_test' : 'inscription_auto'
              });

            if (inscriptionError) {
              console.error("Erreur inscription auto:", inscriptionError);
              // ✅ Ne pas afficher d'erreur bloquante - l'admin pourra créer l'inscription manuellement
              toast.warning('⚠️ L\'inscription à la formation sera traitée manuellement par l\'administrateur.');
            } else {
              toast.success(`✅ Inscription à "${selectedFormation.title}" enregistrée ! En attente de validation.`);
            }
          }
        } catch (inscriptionErr) {
          console.error("Erreur lors de l'inscription à la formation:", inscriptionErr);
          // ✅ Ne pas afficher d'erreur bloquante
          toast.warning('⚠️ L\'inscription à la formation sera traitée manuellement par l\'administrateur.');
        }
      }

      const typeLabel = userType === 'formateur' ? 'formateur' : 'participant';
      toast.success(`✅ Inscription réussie ! Votre compte ${typeLabel} est en attente d'approbation.`);

      // 7. Redirection avec un délai
      setTimeout(() => {
        if (testCompleted || testResult) {
          navigate('/espace-participant');
        } else if (redirectUrl) {
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

  // Filtrer les formations selon la recherche
  const filteredFormations = formationsList.filter(f =>
    f.title?.toLowerCase().includes(searchFormationTerm.toLowerCase())
  );

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
            <p className="text-gray-500 text-sm mt-1">
              {testCompleted ? 'Créez votre compte pour voir vos résultats' : 'Créez votre compte'}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-2xl shadow-xl p-6"
          >
            {/* Bannière du test complété */}
            {testCompleted && testResult && (
              <div className="mb-4 p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-xl border border-green-200">
                <div className="flex items-start gap-3">
                  <span className="text-2xl">🧪</span>
                  <div className="flex-1">
                    <p className="text-xs text-green-600 font-semibold">Test complété !</p>
                    <p className="text-sm font-medium text-green-800">
                      Résultat : {testResult.correct}/{testResult.total} ({testResult.percentage}%)
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Niveau : {testResult.level || 'Débutant'} • {testResult.test_type || 'Générique'}
                    </p>
                    <p className="text-xs text-blue-600 mt-2">
                      🔒 Créez votre compte pour sauvegarder vos résultats
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Bannière de la formation sélectionnée via URL */}
            {formationLoading ? (
              <div className="mb-4 p-3 bg-blue-50 rounded-lg flex items-center justify-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                <span className="text-sm text-blue-600">Chargement...</span>
              </div>
            ) : selectedFormation && formationId && (
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

              {/* Téléphone - Requis */}
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                  Téléphone <span className="text-red-500">*</span>
                </label>
                <input
                  id="phone"
                  type="tel"
                  placeholder="+33 6 12 34 56 78"
                  value={phone}
                  onChange={handlePhoneChange}
                  onBlur={() => handleBlur('phone')}
                  className={`w-full p-3 border ${phoneError && touched.phone ? 'border-red-500' : 'border-gray-300'} rounded-xl focus:ring-2 focus:ring-[#1a56db] focus:border-transparent transition text-base`}
                  required
                  disabled={loading}
                  autoComplete="tel"
                  aria-label="Numéro de téléphone"
                  aria-invalid={!!phoneError && touched.phone}
                  aria-describedby={phoneError && touched.phone ? "phone-error" : undefined}
                />
                {phoneError && touched.phone && (
                  <p id="phone-error" className="text-xs text-red-500 mt-1 flex items-center gap-1">
                    <span>⚠️</span> {phoneError}
                  </p>
                )}
                <p className="text-xs text-gray-400 mt-1">
                  Exemple: +33 6 12 34 56 78 ou 0612345678
                </p>
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

              {/* Sélection de la formation */}
              <div>
                <label htmlFor="formation" className="block text-sm font-medium text-gray-700 mb-1">
                  🎓 Formation souhaitée <span className="text-gray-400">(optionnel)</span>
                </label>
                {formationsLoading ? (
                  <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-xl">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#1a56db]"></div>
                    <span className="text-sm text-gray-500">Chargement des formations...</span>
                  </div>
                ) : (
                  <>
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="🔍 Rechercher une formation..."
                        value={searchFormationTerm}
                        onChange={(e) => setSearchFormationTerm(e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#1a56db] focus:border-transparent transition text-base mb-2"
                        disabled={loading || formationsList.length === 0}
                      />
                    </div>
                    
                    <select
                      id="formation"
                      value={selectedFormationId}
                      onChange={handleFormationChange}
                      className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#1a56db] focus:border-transparent transition text-base appearance-none bg-white"
                      disabled={loading || formationsList.length === 0}
                    >
                      <option value="">-- Aucune formation --</option>
                      {filteredFormations.map((f) => (
                        <option key={f.id} value={f.id}>
                          {f.title} {f.is_online ? '🌍' : f.on_demand ? '🏢' : ''} 
                          {f.price ? ` - ${f.price}€` : ''}
                        </option>
                      ))}
                    </select>
                    
                    {searchFormationTerm && (
                      <p className="text-xs text-gray-400 mt-1">
                        {filteredFormations.length} formation(s) trouvée(s)
                      </p>
                    )}
                    
                    {selectedFormation && selectedFormation.description && (
                      <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                        📖 {selectedFormation.description.substring(0, 150)}
                        {selectedFormation.description.length > 150 && '...'}
                      </p>
                    )}
                    
                    {formationsList.length === 0 && !formationsLoading && (
                      <p className="text-xs text-amber-600 mt-1">
                        ⚠️ Aucune formation disponible actuellement. Vous pourrez vous inscrire plus tard.
                      </p>
                    )}
                  </>
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
                aria-label={loading ? "Inscription en cours..." : selectedFormation ? "S'inscrire à la formation" : "S'inscrire"}
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
                  testCompleted ? "🧪 Créer mon compte et voir mes résultats" : 
                  selectedFormation ? "🎓 S'inscrire à la formation" : "📝 S'inscrire"
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
                {testCompleted 
                  ? '📌 Créez votre compte pour sauvegarder vos résultats et accéder à toutes nos formations.'
                  : '📌 L\'inscription est gratuite. Votre compte sera activé par l\'administrateur dans les plus brefs délais.'
                }
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </>
  );
}