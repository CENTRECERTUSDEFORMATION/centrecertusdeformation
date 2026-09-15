// frontend/src/pages/tests/TestExcelAvance.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../supabaseClient';
import { excelAvanceQuestions } from '../../data/tests/excelAvanceQuestions';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';
import { Helmet } from 'react-helmet-async';

// ============================================
// CONFIGURATION EXCEL
// ============================================
const EXCEL_VERSIONS = {
  '2016': 'Excel 2016',
  '2019': 'Excel 2019',
  '2021': 'Excel 2021',
  '365': 'Microsoft 365'
};

// ============================================
// PROGRAMMES DE FORMATION
// ============================================
const FORMATION_PROGRAMMES = {
  debutant: {
    titre: "Excel Débutant - Les Fondamentaux",
    duree: "20 heures",
    niveau: "Débutant",
    description: "Formation pour maîtriser les bases d'Excel et créer des tableaux professionnels.",
    axes: [
      {
        titre: "Axe 1 - Découverte d'Excel",
        points: [
          "Interface et navigation",
          "Saisie et mise en forme des données",
          "Création de tableaux simples",
          "Formules de base (SOMME, MOYENNE, MIN, MAX)"
        ]
      },
      {
        titre: "Axe 2 - Manipulation des données",
        points: [
          "Tri et filtres",
          "Mise en forme conditionnelle simple",
          "Graphiques de base",
          "Impression et mise en page"
        ]
      },
      {
        titre: "Axe 3 - Bonnes pratiques",
        points: [
          "Organisation des feuilles",
          "Références relatives et absolues",
          "Protection des données",
          "Raccourcis clavier essentiels"
        ]
      }
    ]
  },
  intermediaire: {
    titre: "Rappel Excel Intermédiaire (préparation MOS Excel 2019)",
    duree: "30 heures",
    niveau: "Intermédiaire",
    description: "Formation complète pour maîtriser les fonctions avancées et préparer la certification MOS Excel 2019.",
    axes: [
      {
        titre: "Axe 1 – Les fonctions et formules avancées",
        points: [
          "Fonctions logiques (SI, SI.CONDITIONS, ET, OU)",
          "Fonctions de recherche (RECHERCHEV, RECHERCHEX, INDEX/EQUIV)",
          "Fonctions texte (GAUCHE, DROITE, STXT, CONCATENER)",
          "Fonctions date et heure",
          "Fonctions statistiques avancées (NB.SI, SOMME.SI, MOYENNE.SI)"
        ]
      },
      {
        titre: "Axe 2 – L'affichage, la gestion et l'analyse des données",
        points: [
          "Tableaux croisés dynamiques",
          "Graphiques croisés dynamiques",
          "Segments et chronologies",
          "Mise en forme conditionnelle avancée",
          "Validation des données",
          "Consolidation de données"
        ]
      },
      {
        titre: "Axe 3 – Modèles et automatisation",
        points: [
          "Création de modèles réutilisables",
          "Introduction aux macros et à l'automatisation",
          "Enregistrement et exécution de macros",
          "Initiation à l'éditeur VBA",
          "Gestion des classeurs partagés"
        ]
      }
    ]
  },
  avance: {
    titre: "Excel Avancé - Maîtrise et Automatisation",
    duree: "40 heures",
    niveau: "Avancé",
    description: "Formation approfondie pour maîtriser VBA, Power Query et automatiser les tâches complexes.",
    axes: [
      {
        titre: "Axe 1 - Programmation VBA",
        points: [
          "Maîtrise de l'éditeur VBA",
          "Variables, conditions et boucles",
          "Création de formulaires utilisateur",
          "Gestion des erreurs",
          "Interaction avec d'autres applications Office"
        ]
      },
      {
        titre: "Axe 2 - Power Query et Power Pivot",
        points: [
          "Importation et transformation de données",
          "Nettoyage et fusion de données",
          "Modélisation de données",
          "Création de mesures DAX",
          "Tableaux de bord interactifs"
        ]
      },
      {
        titre: "Axe 3 - Automatisation avancée",
        points: [
          "Automatisation des tâches répétitives",
          "Création de fonctions personnalisées",
          "Optimisation des performances",
          "Intégration avec Power BI",
          "Déploiement de solutions Excel"
        ]
      }
    ]
  },
  expert: {
    titre: "Certification Expert Excel - Data Analyst",
    duree: "60 heures",
    niveau: "Expert",
    description: "Formation d'expertise pour devenir Data Analyst et maîtriser l'écosystème Microsoft complet.",
    axes: [
      {
        titre: "Axe 1 - Data Analyse avancée",
        points: [
          "Modélisation de données complexes",
          "DAX avancé",
          "Optimisation des performances",
          "Analyse prédictive",
          "Statistiques avancées"
        ]
      },
      {
        titre: "Axe 2 - Business Intelligence",
        points: [
          "Power BI Desktop",
          "Création de tableaux de bord",
          "Publication et partage",
          "Actualisation automatique des données",
          "Sécurité et gouvernance"
        ]
      },
      {
        titre: "Axe 3 - Data Engineering",
        points: [
          "Python pour Excel",
          "Automatisation avec Power Automate",
          "Connexion à des bases de données",
          "ETL avec Power Query",
          "Intégration cloud"
        ]
      }
    ]
  }
};

// ============================================
// NIVEAUX EXCEL
// ============================================
const EXCEL_LEVELS = {
  debutant: {
    label: 'Débutant',
    emoji: '📖',
    color: 'text-gray-600',
    bgColor: 'bg-gray-100',
    borderColor: 'border-gray-300',
    description: "Vous maîtrisez les bases d'Excel : création de tableaux, formules simples, mise en forme.",
    recommendation: 'Pour progresser rapidement, nous vous recommandons la formation "Excel Débutant" pour consolider les bases, puis "Excel Intermédiaire" pour préparer la certification MOS Excel 2019.',
    formationKey: 'debutant'
  },
  intermediaire: {
    label: 'Intermédiaire',
    emoji: '📚',
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
    borderColor: 'border-blue-300',
    description: 'Vous connaissez les fonctions avancées : RECHERCHEV, SI, tableaux croisés dynamiques, mise en forme conditionnelle.',
    recommendation: 'Vous êtes prêt pour la formation "Rappel Excel Intermédiaire (préparation MOS Excel 2019)" qui vous permettra de maîtriser les fonctions avancées et d\'obtenir une certification reconnue.',
    formationKey: 'intermediaire'
  },
  avance: {
    label: 'Avancé',
    emoji: '🎓',
    color: 'text-purple-600',
    bgColor: 'bg-purple-100',
    borderColor: 'border-purple-300',
    description: 'Vous maîtrisez les fonctionnalités avancées : VBA, Power Query, INDEX/EQUIV, macros, automatisation.',
    recommendation: 'Excellent niveau ! Approfondissez vos compétences avec la formation "Excel Avancé - Maîtrise et Automatisation" pour maîtriser VBA, Power Query et l\'automatisation complète.',
    formationKey: 'avance'
  },
  expert: {
    label: 'Expert',
    emoji: '🏆',
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-100',
    borderColor: 'border-yellow-300',
    description: 'Vous êtes un expert Excel ! Maîtrise complète de VBA, Power Query, Power Pivot, automatisation avancée.',
    recommendation: 'Félicitations ! Vous pouvez envisager la certification "Expert Excel - Data Analyst" pour maîtriser Power BI, DAX et devenir un expert reconnu.',
    formationKey: 'expert'
  }
};

// ============================================
// COMPOSANT ILLUSTRATION - TABLEAU EXCEL
// ============================================
function IllustrationTableauExcel({ donnees, titre, surligneColonne, surligneLigne }) {
  if (!donnees || !donnees.colonnes || !donnees.lignes) return null;

  return (
    <div className="my-5 rounded-xl overflow-hidden border-2 border-gray-300 shadow-lg bg-white">
      {titre && (
        <div className="bg-gradient-to-r from-[#217346] to-[#1e6b3f] text-white px-4 py-2 text-sm font-semibold flex items-center gap-2">
          <span className="text-lg">📊</span>
          {titre}
        </div>
      )}
      <div className="overflow-x-auto">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr>
              <th className="bg-gray-100 border border-gray-300 px-2 py-1 text-xs font-semibold text-gray-600 w-10"></th>
              {donnees.colonnes.map((col, i) => (
                <th
                  key={i}
                  className={`border border-gray-300 px-3 py-1 text-xs font-semibold ${
                    surligneColonne === i
                      ? 'bg-[#217346] text-white'
                      : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {donnees.lignes.map((ligne, i) => (
              <tr key={i}>
                <td
                  className={`border border-gray-300 px-2 py-1 text-xs font-semibold text-center ${
                    surligneLigne === i ? 'bg-[#217346] text-white' : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  {i + 1}
                </td>
                {ligne.map((cellule, j) => (
                  <td
                    key={j}
                    className={`border border-gray-300 px-3 py-1 text-xs ${
                      surligneColonne === j
                        ? 'bg-green-50 font-semibold'
                        : 'bg-white text-gray-700'
                    }`}
                  >
                    {cellule}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ============================================
// COMPOSANT ILLUSTRATION - BARRE DE FORMULE
// ============================================
function IllustrationBarreFormule({ cellule, formule }) {
  if (!cellule || !formule) return null;

  return (
    <div className="my-5 rounded-xl overflow-hidden border-2 border-gray-300 shadow-lg bg-white">
      <div className="bg-gradient-to-r from-[#217346] to-[#1e6b3f] text-white px-4 py-2 text-sm font-semibold flex items-center gap-2">
        <span className="text-lg">ƒx</span>
        Barre de formule
      </div>
      <div className="flex items-center gap-2 px-3 py-2 bg-white border-b border-gray-200">
        <span className="text-xs font-mono bg-gray-100 px-2 py-1 rounded border border-gray-300 min-w-[50px] text-center">
          {cellule}
        </span>
        <span className="text-gray-400 text-lg">|</span>
        <span className="text-xs font-mono text-[#217346] font-bold bg-gray-50 px-3 py-1 rounded flex-1">
          {formule}
        </span>
      </div>
      <div className="bg-gray-50 px-3 py-1 text-xs text-gray-500">
        Résultat : <span className="font-bold text-gray-800">calculé automatiquement</span>
      </div>
    </div>
  );
}

// ============================================
// COMPOSANT ILLUSTRATION - GRAPHIQUE
// ============================================
function IllustrationGraphique({ titre, donnees }) {
  if (!donnees || donnees.length === 0) return null;

  const maxValeur = Math.max(...donnees.map(d => d.valeur));

  return (
    <div className="my-5 rounded-xl overflow-hidden border-2 border-gray-300 shadow-lg bg-white">
      <div className="bg-gradient-to-r from-[#217346] to-[#1e6b3f] text-white px-4 py-2 text-sm font-semibold flex items-center gap-2">
        <span className="text-lg">📈</span>
        {titre || 'Graphique'}
      </div>
      <div className="p-6 bg-white">
        <div className="flex items-end justify-around gap-4 h-40">
          {donnees.map((d, i) => (
            <div key={i} className="flex flex-col items-center gap-2 flex-1">
              <div className="text-xs font-bold text-gray-700">{d.valeur}</div>
              <div
                className="w-full rounded-t-md transition-all duration-300 shadow-md"
                style={{
                  height: `${Math.max((d.valeur / maxValeur) * 120, 10)}px`,
                  background: 'linear-gradient(to top, #217346, #4CAF50)'
                }}
              />
              <div className="text-xs text-gray-600 text-center">{d.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ============================================
// COMPOSANT - RENDU DES ILLUSTRATIONS
// ============================================
function QuestionIllustration({ question }) {
  if (!question || !question.illustration) return null;

  const { illustration } = question;

  switch (illustration.type) {
    case 'tableau':
      return (
        <IllustrationTableauExcel
          titre={illustration.titre}
          donnees={illustration.donnees}
          surligneColonne={illustration.surligneColonne}
          surligneLigne={illustration.surligneLigne}
        />
      );
    case 'formule':
      return (
        <IllustrationBarreFormule
          cellule={illustration.cellule}
          formule={illustration.formule}
        />
      );
    case 'graphique':
      return (
        <IllustrationGraphique
          titre={illustration.titre}
          donnees={illustration.donnees}
        />
      );
    default:
      return null;
  }
}

// ============================================
// FONCTION - MÉLANGER LES OPTIONS
// ============================================
function shuffleQuestionOptions(question) {
  const optionsWithIndex = question.options.map((option, index) => ({
    texte: option,
    originalIndex: index
  }));

  const shuffled = [...optionsWithIndex].sort(() => Math.random() - 0.5);

  const newCorrectIndex = shuffled.findIndex(
    (opt) => opt.originalIndex === question.correct
  );

  return {
    ...question,
    options: shuffled.map((opt) => opt.texte),
    correct: newCorrectIndex,
    originalOptions: question.options,
    originalCorrect: question.correct
  };
}

// ============================================
// COMPOSANT - PROGRAMME DE FORMATION
// ============================================
function FormationProgramme({ programme, levelColor }) {
  if (!programme) return null;

  return (
    <div className="bg-white rounded-xl border-2 border-gray-200 overflow-hidden shadow-md">
      <div className="bg-gradient-to-r from-[#1a56db] to-[#76c21f] text-white px-6 py-4">
        <h4 className="text-lg font-bold flex items-center gap-2">
          <span>🎓</span>
          {programme.titre}
        </h4>
        <div className="flex items-center gap-4 mt-2 text-sm text-blue-100">
          <span>⏱️ {programme.duree}</span>
          <span>📊 Niveau {programme.niveau}</span>
        </div>
      </div>
      <div className="p-6">
        <p className="text-gray-700 mb-6 italic">{programme.description}</p>
        <div className="space-y-5">
          {programme.axes.map((axe, index) => (
            <div key={index} className="border-l-4 border-[#1a56db] pl-4">
              <h5 className={`font-bold mb-3 ${levelColor || 'text-[#1a56db]'}`}>
                {axe.titre}
              </h5>
              <ul className="space-y-1.5">
                {axe.points.map((point, i) => (
                  <li key={i} className="text-sm text-gray-600 flex items-start gap-2">
                    <span className="text-[#76c21f] mt-0.5">✓</span>
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ============================================
// COMPOSANT PRINCIPAL
// ============================================
export default function TestExcelAvance() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [allQuestions, setAllQuestions] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [testStarted, setTestStarted] = useState(false);
  const [testCompleted, setTestCompleted] = useState(false);
  const [results, setResults] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showReview, setShowReview] = useState(false);
  const [showProgramme, setShowProgramme] = useState(false);
  const [selectedExcelVersion, setSelectedExcelVersion] = useState('365');

  const timerRef = useRef(null);

  const totalQuestions = 15;
  const testDuration = 12;

  // ============================================
  // INITIALISATION
  // ============================================
  useEffect(() => {
    try {
      if (!excelAvanceQuestions || excelAvanceQuestions.length === 0) {
        throw new Error('Aucune question disponible');
      }

      let availableQuestions = [...excelAvanceQuestions];

      while (availableQuestions.length < 90) {
        availableQuestions = availableQuestions.concat([...excelAvanceQuestions]);
      }

      setAllQuestions(availableQuestions);

      const shuffled = [...availableQuestions]
        .sort(() => Math.random() - 0.5)
        .slice(0, totalQuestions)
        .map(shuffleQuestionOptions);

      setQuestions(shuffled);
      setTimeLeft(testDuration * 60);
      setLoading(false);
    } catch (error) {
      console.error('Erreur chargement questions:', error);
      toast.error('Erreur lors du chargement du test');
      setLoading(false);
    }
  }, []);

  // ============================================
  // GESTION DU TEMPS
  // ============================================
  useEffect(() => {
    if (testStarted && timeLeft > 0 && !testCompleted) {
      timerRef.current = setTimeout(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
      return () => {
        if (timerRef.current) clearTimeout(timerRef.current);
      };
    } else if (timeLeft === 0 && testStarted && !testCompleted) {
      handleSubmitTest('timeout');
    }
  }, [timeLeft, testStarted, testCompleted]);

  // ============================================
  // FONCTIONS DU TEST
  // ============================================
  const handleStartTest = () => {
    setTestStarted(true);
    toast.info('⏱️ Le test Excel Avancé commence maintenant !');
  };

  const handleSelectAnswer = (questionId, optionIndex) => {
    setAnswers({ ...answers, [questionId]: optionIndex });
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleGoToQuestion = (index) => {
    setCurrentQuestionIndex(index);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmitTest = async (reason = 'manual') => {
    if (submitting) return;
    setSubmitting(true);

    const unanswered = questions.filter(q => answers[q.id] === undefined);
    if (unanswered.length > 0 && reason !== 'timeout') {
      const confirmSubmit = window.confirm(
        `⚠️ Vous n'avez pas répondu à ${unanswered.length} question(s).\n\nVoulez-vous vraiment soumettre le test ?`
      );
      if (!confirmSubmit) {
        setSubmitting(false);
        return;
      }
    }

    let correct = 0;
    const detailedResults = questions.map(q => {
      const isCorrect = answers[q.id] === q.correct;
      if (isCorrect) correct++;
      return {
        ...q,
        userAnswer: answers[q.id],
        isCorrect
      };
    });

    const percentage = Math.round((correct / questions.length) * 100);

    let levelKey = 'debutant';
    if (percentage >= 90) levelKey = 'expert';
    else if (percentage >= 75) levelKey = 'avance';
    else if (percentage >= 50) levelKey = 'intermediaire';

    const level = EXCEL_LEVELS[levelKey];
    const programme = FORMATION_PROGRAMMES[level.formationKey];

    const timeSpent = Math.round(((testDuration * 60) - timeLeft) / 60);

    const resultData = {
      correct,
      total: questions.length,
      percentage,
      levelKey,
      level,
      programme,
      detailedResults,
      answers,
      timeSpent,
      unanswered: unanswered.length,
      reason,
      testName: 'Excel Avancé',
      testIcon: '📊',
      excelVersion: EXCEL_VERSIONS[selectedExcelVersion] || 'Microsoft 365'
    };

    setResults(resultData);
    setTestCompleted(true);

    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    if (user) {
      try {
        await supabase
          .from('test_results')
          .insert({
            user_id: user.id,
            formation_id: null,
            test_type: 'excelAvance',
            score: correct,
            total_questions: questions.length,
            percentage,
            level: level.label,
            answers: answers,
            time_spent: timeSpent * 60,
            created_at: new Date().toISOString()
          });
        toast.success('✅ Résultat sauvegardé !');
      } catch (error) {
        console.error('Erreur sauvegarde:', error);
        toast.warning('⚠️ Résultat non sauvegardé.');
      }
    }

    setSubmitting(false);
  };

  const handleRetry = () => {
    const shuffled = [...allQuestions]
      .sort(() => Math.random() - 0.5)
      .slice(0, totalQuestions)
      .map(shuffleQuestionOptions);

    setQuestions(shuffled);
    setAnswers({});
    setCurrentQuestionIndex(0);
    setTimeLeft(testDuration * 60);
    setTestStarted(false);
    setTestCompleted(false);
    setResults(null);
    setSubmitting(false);
    setShowReview(false);
    setShowProgramme(false);
    toast.info('🔄 Nouveau test prêt !');
  };

  // ============================================
  // RENDU - CHARGEMENT
  // ============================================
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Helmet>
          <title>Chargement du test | Centre Certus</title>
        </Helmet>
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#1a56db] mx-auto"></div>
          <p className="mt-4 text-gray-500">Chargement du test...</p>
        </div>
      </div>
    );
  }

  // ============================================
  // RENDU - RÉSULTATS
  // ============================================
  if (testCompleted && results) {
    return (
      <>
        <Helmet>
          <title>Résultat Test Excel Avancé | Centre Certus</title>
          <meta name="description" content={`Résultat du test Excel Avancé : ${results.percentage}% - Niveau ${results.level.label}`} />
        </Helmet>
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-8 px-4">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl shadow-2xl overflow-hidden"
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-[#1a56db] to-[#76c21f] text-white px-8 py-6">
                <div className="flex justify-between items-center flex-wrap gap-4">
                  <div>
                    <h2 className="text-2xl font-bold">📊 Résultat du test Excel</h2>
                    <p className="text-blue-100 text-sm mt-1">{results.excelVersion}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-3xl font-bold">{results.percentage}%</span>
                    <p className="text-blue-100 text-sm">Score global</p>
                  </div>
                </div>
              </div>

              <div className="p-8">
                {/* Graphique circulaire */}
                <div className="flex justify-center mb-8">
                  <div className="relative w-40 h-40">
                    <svg className="w-full h-full transform -rotate-90">
                      <circle
                        cx="80"
                        cy="80"
                        r="70"
                        stroke="#e5e7eb"
                        strokeWidth="12"
                        fill="none"
                      />
                      <circle
                        cx="80"
                        cy="80"
                        r="70"
                        stroke="url(#gradient)"
                        strokeWidth="12"
                        fill="none"
                        strokeLinecap="round"
                        strokeDasharray={`${2 * Math.PI * 70}`}
                        strokeDashoffset={`${2 * Math.PI * 70 * (1 - results.percentage / 100)}`}
                        className="transition-all duration-1000"
                      />
                      <defs>
                        <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                          <stop offset="0%" stopColor="#1a56db" />
                          <stop offset="100%" stopColor="#76c21f" />
                        </linearGradient>
                      </defs>
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-4xl font-bold text-gray-800">{results.percentage}%</span>
                      <span className="text-xs text-gray-500">Score</span>
                    </div>
                  </div>
                </div>

                {/* Statistiques */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                  <div className="bg-gray-50 rounded-xl p-4 text-center">
                    <div className="text-2xl font-bold text-[#1a56db]">{results.correct}/{results.total}</div>
                    <p className="text-xs text-gray-500 mt-1">Bonnes réponses</p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4 text-center">
                    <div className={`text-2xl font-bold ${results.level.color}`}>
                      {results.level.emoji} {results.level.label}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Niveau</p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4 text-center">
                    <div className="text-2xl font-bold text-orange-500">{results.timeSpent} min</div>
                    <p className="text-xs text-gray-500 mt-1">Temps passé</p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4 text-center">
                    <div className="text-2xl font-bold">
                      {results.unanswered === 0 ? '✅' : '⚠️'}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {results.unanswered === 0 ? 'Complet' : `${results.unanswered} non répondues`}
                    </p>
                  </div>
                </div>

                {/* Détail du niveau */}
                <div className={`${results.level.bgColor} border-2 ${results.level.borderColor} rounded-xl p-6 mb-6`}>
                  <div className="flex items-start gap-4">
                    <div className="text-5xl">{results.level.emoji}</div>
                    <div className="flex-1">
                      <h3 className={`text-2xl font-bold ${results.level.color}`}>
                        Niveau {results.level.label}
                      </h3>
                      <p className="text-gray-700 mt-2">{results.level.description}</p>
                    </div>
                  </div>
                </div>

                {/* Recommandation */}
                <div className="bg-blue-50 rounded-xl p-6 mb-6 border-2 border-blue-200">
                  <h4 className="font-semibold text-blue-800 mb-2 flex items-center gap-2 text-lg">
                    <span>💡</span> Recommandation personnalisée
                  </h4>
                  <p className="text-blue-700">{results.level.recommendation}</p>
                </div>

                {/* Bouton programme */}
                <div className="mb-6">
                  <button
                    onClick={() => setShowProgramme(!showProgramme)}
                    className="w-full bg-gradient-to-r from-[#1a56db] to-[#76c21f] text-white px-6 py-4 rounded-xl font-semibold hover:shadow-lg transition flex items-center justify-between"
                  >
                    <span className="flex items-center gap-2">
                      <span>📚</span>
                      {showProgramme ? 'Masquer le programme' : 'Voir le programme détaillé de la formation recommandée'}
                    </span>
                    <span className={`transition-transform ${showProgramme ? 'rotate-180' : ''}`}>
                      ▼
                    </span>
                  </button>
                </div>

                {/* Programme */}
                <AnimatePresence>
                  {showProgramme && results.programme && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mb-6"
                    >
                      <FormationProgramme
                        programme={results.programme}
                        levelColor={results.level.color}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Actions */}
                <div className="flex flex-wrap gap-3 mt-6">
                  <button
                    onClick={handleRetry}
                    className="bg-gray-200 text-gray-700 px-6 py-3 rounded-xl hover:bg-gray-300 transition flex items-center gap-2"
                  >
                    🔄 Refaire le test
                  </button>
                  <button
                    onClick={() => setShowReview(!showReview)}
                    className="bg-blue-100 text-blue-700 px-6 py-3 rounded-xl hover:bg-blue-200 transition flex items-center gap-2"
                  >
                    📝 {showReview ? 'Masquer' : 'Voir'} les détails
                  </button>
                  <button
                    onClick={() => navigate('/formations')}
                    className="bg-[#1a56db] text-white px-6 py-3 rounded-xl hover:bg-[#1a56db]/90 transition flex items-center gap-2"
                  >
                    🎓 S'inscrire à la formation
                  </button>
                  {!user && (
                    <button
                      onClick={() => navigate('/inscription?formation=excel-avance&test=completed')}
                      className="bg-[#76c21f] text-white px-6 py-3 rounded-xl hover:bg-[#76c21f]/90 transition flex items-center gap-2"
                    >
                      📝 Créer un compte
                    </button>
                  )}
                </div>

                {/* Revue des questions */}
                <AnimatePresence>
                  {showReview && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-6 border-t pt-6"
                    >
                      <h4 className="font-semibold text-gray-800 mb-4 text-lg">📋 Détail des réponses</h4>
                      <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                        {results.detailedResults.map((q, index) => (
                          <div
                            key={q.id}
                            className={`p-4 rounded-xl border-2 ${q.isCorrect ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}
                          >
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <p className="font-medium text-gray-800">
                                  {index + 1}. {q.question}
                                </p>

                                <QuestionIllustration question={q} />

                                <div className="mt-2 space-y-1 text-sm">
                                  <p className="text-gray-600">
                                    Votre réponse : <span className="font-medium">
                                      {q.userAnswer !== undefined ? q.options[q.userAnswer] : 'Non répondue'}
                                    </span>
                                  </p>
                                  {!q.isCorrect && (
                                    <p className="text-green-600">
                                      ✅ Bonne réponse : <span className="font-medium">
                                        {q.options[q.correct]}
                                      </span>
                                    </p>
                                  )}
                                </div>
                              </div>
                              <div className="ml-4">
                                {q.isCorrect ? (
                                  <span className="text-green-500 text-2xl">✅</span>
                                ) : (
                                  <span className="text-red-500 text-2xl">❌</span>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          </div>
        </div>
      </>
    );
  }

  // ============================================
  // RENDU - DÉMARRAGE
  // ============================================
  if (!testStarted) {
    return (
      <>
        <Helmet>
          <title>Test Excel Avancé | Centre Certus</title>
          <meta name="description" content="Testez gratuitement votre niveau en Excel Avancé" />
        </Helmet>
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-2xl w-full bg-white rounded-2xl shadow-2xl p-8"
          >
            <div className="text-center">
              <div className="text-6xl mb-4">📊</div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">
                Test de niveau - Excel
              </h1>
              <p className="text-gray-500 mb-6">
                Évaluez gratuitement votre niveau en Excel avec {totalQuestions} questions aléatoires
              </p>

              {/* Aperçu */}
              <div className="mb-6 bg-gradient-to-br from-gray-50 to-blue-50 rounded-xl p-4 border border-gray-200">
                <p className="text-xs text-gray-500 mb-3 text-center font-medium">
                  📸 Aperçu du type de questions
                </p>
                <div className="flex justify-center gap-3 flex-wrap">
                  <div className="bg-white rounded-lg p-2 shadow-sm border border-gray-200">
                    <span className="text-2xl">📊</span>
                    <p className="text-[10px] text-gray-500 mt-1">Tableaux Excel</p>
                  </div>
                  <div className="bg-white rounded-lg p-2 shadow-sm border border-gray-200">
                    <span className="text-2xl">ƒx</span>
                    <p className="text-[10px] text-gray-500 mt-1">Formules</p>
                  </div>
                  <div className="bg-white rounded-lg p-2 shadow-sm border border-gray-200">
                    <span className="text-2xl">📈</span>
                    <p className="text-[10px] text-gray-500 mt-1">Graphiques</p>
                  </div>
                </div>
              </div>

              {/* Version Excel */}
              <div className="bg-gray-50 rounded-xl p-4 mb-6 text-left">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Version Excel utilisée :
                </label>
                <select
                  value={selectedExcelVersion}
                  onChange={(e) => setSelectedExcelVersion(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-[#1a56db] focus:border-transparent"
                >
                  {Object.entries(EXCEL_VERSIONS).map(([key, value]) => (
                    <option key={key} value={key}>{value}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                <div className="bg-blue-50 rounded-xl p-3 text-center">
                  <div className="text-2xl font-bold text-blue-600">{totalQuestions}</div>
                  <div className="text-xs text-gray-500">Questions</div>
                </div>
                <div className="bg-green-50 rounded-xl p-3 text-center">
                  <div className="text-2xl font-bold text-green-600">{testDuration} min</div>
                  <div className="text-xs text-gray-500">Durée</div>
                </div>
                <div className="bg-purple-50 rounded-xl p-3 text-center">
                  <div className="text-2xl font-bold text-purple-600">4</div>
                  <div className="text-xs text-gray-500">Niveaux</div>
                </div>
                <div className="bg-yellow-50 rounded-xl p-3 text-center">
                  <div className="text-2xl font-bold text-yellow-600">90</div>
                  <div className="text-xs text-gray-500">Questions dispo.</div>
                </div>
              </div>

              <div className="bg-yellow-50 rounded-xl p-4 mb-6 text-left">
                <p className="text-sm text-yellow-800">
                  ℹ️ Chaque test contient <strong>{totalQuestions} questions aléatoires</strong> parmi 90 questions disponibles.
                  Les questions et les options sont mélangées à chaque tentative. Vous recevrez une <strong>recommandation de formation personnalisée</strong> à la fin du test.
                </p>
              </div>

              <button
                onClick={handleStartTest}
                className="w-full bg-gradient-to-r from-[#1a56db] to-[#76c21f] text-white py-4 rounded-xl font-semibold text-lg hover:shadow-xl transition-all hover:scale-[1.02]"
              >
                🚀 Commencer le test
              </button>

              <button
                onClick={() => navigate('/formations')}
                className="mt-3 text-gray-500 hover:text-gray-700 transition text-sm"
              >
                ← Retour aux formations
              </button>
            </div>
          </motion.div>
        </div>
      </>
    );
  }

  // ============================================
  // RENDU - QUESTIONS
  // ============================================
  const currentQuestion = questions[currentQuestionIndex];

  if (!currentQuestion) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Helmet>
          <title>Erreur de chargement | Centre Certus</title>
        </Helmet>
        <div className="text-center">
          <p className="text-gray-500">Erreur de chargement du test</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 bg-[#1a56db] text-white px-4 py-2 rounded-lg"
          >
            Recharger
          </button>
        </div>
      </div>
    );
  }

  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const answeredCount = Object.keys(answers).length;

  return (
    <>
      <Helmet>
        <title>{`Test Excel Avancé - Question ${currentQuestionIndex + 1}/${questions.length}`}</title>
        <meta name="description" content={`Question ${currentQuestionIndex + 1} du test Excel Avancé`} />
      </Helmet>
      <div className="min-h-screen bg-gray-50 py-4 px-4">
        <div className="max-w-3xl mx-auto">
          {/* Barre de progression */}
          <div className="bg-white rounded-xl shadow-lg p-4 mb-4">
            <div className="flex justify-between items-center mb-2">
              <div>
                <span className="text-sm font-medium text-gray-600">
                  Question {currentQuestionIndex + 1}/{questions.length}
                </span>
                <span className="ml-4 text-sm text-gray-500">
                  {answeredCount}/{questions.length} répondues
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className={`text-sm font-bold ${timeLeft < 60 ? 'text-red-600 animate-pulse' : 'text-gray-600'}`}>
                  ⏱️ {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
                </span>
              </div>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div
                className="bg-gradient-to-r from-[#1a56db] to-[#76c21f] h-2.5 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Question */}
          <div className="bg-white rounded-xl shadow-lg p-6 mb-4">
            <div className="flex items-center gap-2 mb-4 flex-wrap">
              <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-medium">
                {currentQuestion.category || 'Général'}
              </span>
              <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full font-medium">
                {currentQuestion.difficulty || 'Débutant'}
              </span>
              <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full font-medium">
                Niveau {currentQuestion.level || 'Débutant'}
              </span>
            </div>

            <h3 className="text-xl font-medium text-gray-800 mb-4">
              {currentQuestionIndex + 1}. {currentQuestion.question}
            </h3>

            <QuestionIllustration question={currentQuestion} />

            <div className="space-y-3 mt-4">
              {currentQuestion.options.map((option, index) => (
                <button
                  key={index}
                  onClick={() => handleSelectAnswer(currentQuestion.id, index)}
                  className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                    answers[currentQuestion.id] === index
                      ? 'border-[#1a56db] bg-blue-50 shadow-md'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <span className="font-medium text-gray-700 flex items-center justify-between">
                    <span className="flex items-center">
                      <span className="inline-block w-6 h-6 bg-gray-100 rounded text-center text-xs leading-6 mr-2 font-bold">
                        {String.fromCharCode(65 + index)}
                      </span>
                      {option}
                    </span>
                    {answers[currentQuestion.id] === index && (
                      <span className="text-[#1a56db] text-lg">✓</span>
                    )}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Navigation */}
          <div className="flex justify-between items-center bg-white rounded-xl shadow-lg p-4">
            <button
              onClick={handlePrevious}
              disabled={currentQuestionIndex === 0}
              className={`px-6 py-2 rounded-lg font-medium transition ${
                currentQuestionIndex === 0
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              ← Précédent
            </button>

            <div className="flex gap-2">
              {currentQuestionIndex < questions.length - 1 ? (
                <button
                  onClick={handleNext}
                  className="px-6 py-2 bg-[#1a56db] text-white rounded-lg font-medium hover:bg-[#1a56db]/90 transition"
                >
                  Suivant →
                </button>
              ) : (
                <button
                  onClick={() => handleSubmitTest('manual')}
                  disabled={submitting}
                  className="px-6 py-2 bg-gradient-to-r from-[#1a56db] to-[#76c21f] text-white rounded-lg font-medium hover:shadow-lg transition disabled:opacity-50"
                >
                  {submitting ? 'Soumission...' : '📊 Voir les résultats'}
                </button>
              )}
            </div>
          </div>

          {/* Indicateur */}
          <div className="mt-4 flex flex-wrap gap-1.5 justify-center">
            {questions.map((q, index) => (
              <button
                key={index}
                onClick={() => handleGoToQuestion(index)}
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium transition ${
                  index === currentQuestionIndex
                    ? 'bg-[#1a56db] text-white scale-110 shadow-md'
                    : answers[q.id] !== undefined
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-200 text-gray-500 hover:bg-gray-300'
                }`}
                title={`Question ${index + 1}`}
              >
                {index + 1}
              </button>
            ))}
          </div>

          {/* Avertissement temps */}
          {timeLeft < 60 && (
            <div className="mt-4 bg-red-50 border border-red-200 rounded-xl p-3 text-center animate-pulse">
              <p className="text-red-600 font-medium">
                ⚠️ Temps presque écoulé ! {minutes}m{seconds}s restantes
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}