// frontend/src/pages/tests/TestExcelAvance.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../supabaseClient';
import { excelAvanceQuestions } from '../../data/tests/excelAvanceQuestions';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import confetti from 'canvas-confetti';

// ============================================
// CONFIGURATION
// ============================================
const EXCEL_VERSIONS = {
  '2016': 'Excel 2016',
  '2019': 'Excel 2019',
  '2021': 'Excel 2021',
  '365': 'Microsoft 365'
};

// ============================================
// IDS DES FORMATIONS EXCEL (depuis Supabase)
// ============================================
const EXCEL_FORMATION_IDS = {
  debutant: '564f0e11-9b16-4af8-9b6d-135aab08312c', // Excel Débutant - Les Fondamentaux
  avance: 'b5f25db3-7414-4ac9-ba15-e7c912e399cc',   // Excel Avancé - Formation Perfectionnement et Automatisation
  bureautique: '9ff10837-675b-43c0-a6a8-7297af778750' // Informatique Bureautique
};

// ============================================
// PROGRAMMES DE FORMATION
// ============================================
const FORMATION_PROGRAMMES = {
  debutant: {
    titre: "Excel Débutant - Les Fondamentaux",
    duree: "24 heures",
    niveau: "Débutant",
    icon: "📖",
    couleur: "#10b981",
    formateur: "Houssem Mansour - Microsoft Office Specialist (ID 994221039)",
    version: "Office 2010 – 2019",
    description: "Formation idéale pour débuter et devenir autonome au quotidien.",
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
    icon: "📚",
    couleur: "#3b82f6",
    formateur: "Houssem Mansour - Microsoft Office Specialist (ID 994221039)",
    version: "Office 2010 – 2019",
    description: "Formation complète pour maîtriser les fonctions avancées et préparer la certification MOS Excel 2019.",
    axes: [
      {
        titre: "Axe 1 – Les fonctions et formules avancées",
        points: [
          "Fonctions statistiques",
          "Fonctions logiques",
          "Fonctions de recherche et de matrice",
          "Fonctions mathématiques",
          "Fonctions de date et d'heure",
          "Fonctions texte",
          "Fonctions de sous-totaux et consolidation"
        ]
      },
      {
        titre: "Axe 2 – L'affichage, la gestion et l'analyse des données",
        points: [
          "Filtres avancés et critères multiples",
          "Tri personnalisé et tri sur plusieurs colonnes",
          "Formatage conditionnel avancé (formules, barres, icônes)",
          "Contrôle et validation des données",
          "Liaisons entre feuilles et consolidation de données",
          "Création et actualisation des tableaux croisés dynamiques",
          "Graphiques croisés dynamiques"
        ]
      },
      {
        titre: "Axe 3 – Modèles et automatisation",
        points: [
          "Création de modèles réutilisables : modèle de suivi de caisse, gestion de stock, diagramme de Gantt",
          "Introduction aux macros et à l'automatisation : comprendre le principe d'une macro, enregistrement et exécution, affecter une macro à un bouton ou une forme"
        ]
      }
    ]
  },
  avance: {
    titre: "Excel Avancé - Maîtrise et Automatisation",
    duree: "30 heures",
    niveau: "Avancé",
    icon: "🎓",
    couleur: "#8b5cf6",
    formateur: "Houssem Mansour - Microsoft Office Specialist (ID 994221039)",
    version: "Office 2010 – 2019",
    description: "Formation approfondie pour maîtriser VBA, Power Query et automatiser les tâches complexes.",
    axes: [
      {
        titre: "Axe 1 – Les fonctions et formules avancées",
        points: [
          "Fonctions statistiques",
          "Fonctions logiques",
          "Fonctions de recherche et de matrice",
          "Fonctions mathématiques",
          "Fonctions de date et d'heure",
          "Fonctions texte",
          "Fonctions de sous-totaux et consolidation"
        ]
      },
      {
        titre: "Axe 2 – L'affichage, la gestion et l'analyse des données",
        points: [
          "Filtres avancés et critères multiples",
          "Tri personnalisé et tri sur plusieurs colonnes",
          "Formatage conditionnel avancé (formules, barres, icônes)",
          "Contrôle et validation des données",
          "Liaisons entre feuilles et consolidation de données",
          "Création et actualisation des tableaux croisés dynamiques",
          "Graphiques croisés dynamiques"
        ]
      },
      {
        titre: "Axe 3 – Modèles et automatisation",
        points: [
          "Création de modèles réutilisables : modèle de suivi de caisse, gestion de stock, diagramme de Gantt",
          "Introduction aux macros et à l'automatisation : comprendre le principe d'une macro, enregistrement et exécution, affecter une macro à un bouton ou une forme"
        ]
      }
    ]
  },
  expert: {
    titre: "Certification Expert Excel - Data Analyst",
    duree: "60 heures",
    niveau: "Expert",
    icon: "🏆",
    couleur: "#eab308",
    formateur: "Houssem Mansour - Microsoft Office Specialist (ID 994221039)",
    version: "Office 2010 – 2019",
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
// NIVEAUX
// ============================================
const EXCEL_LEVELS = {
  debutant: {
    label: 'Débutant',
    emoji: '📖',
    color: '#6b7280',
    gradient: 'linear-gradient(135deg, #6b7280 0%, #9ca3af 100%)',
    bgColor: 'bg-gray-50',
    borderColor: 'border-gray-300',
    description: "Vous maîtrisez les bases d'Excel : création de tableaux, formules simples, mise en forme.",
    messageEncouragement: "C'est un excellent point de départ ! Vous allez adorer la formation Excel Débutant qui vous rendra autonome en quelques heures.",
    recommendation: 'Pour progresser rapidement, nous vous recommandons la formation "Excel Débutant - Les Fondamentaux" pour consolider les bases.',
    formationKey: 'debutant',
    skills: {
      "Bases d'Excel": 70,
      "Formules": 50,
      "Mise en forme": 60,
      "Recherche": 30,
      "Automatisation": 20
    }
  },
  intermediaire: {
    label: 'Intermédiaire',
    emoji: '📚',
    color: '#3b82f6',
    gradient: 'linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%)',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-300',
    description: 'Vous connaissez les fonctions avancées : RECHERCHEV, SI, tableaux croisés dynamiques.',
    messageEncouragement: "Bravo ! Vous avez déjà de bonnes bases. Il ne vous manque que quelques automatismes pour devenir vraiment efficace.",
    recommendation: 'Vous êtes prêt pour la formation "Rappel Excel Intermédiaire (préparation MOS Excel 2019)".',
    formationKey: 'intermediaire',
    skills: {
      "Bases d'Excel": 85,
      "Formules": 75,
      "Mise en forme": 80,
      "Recherche": 70,
      "Automatisation": 40
    }
  },
  avance: {
    label: 'Avancé',
    emoji: '🎓',
    color: '#8b5cf6',
    gradient: 'linear-gradient(135deg, #8b5cf6 0%, #a78bfa 100%)',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-300',
    description: 'Vous maîtrisez les fonctionnalités avancées : VBA, Power Query, INDEX/EQUIV, macros.',
    messageEncouragement: "Excellent niveau ! Vous êtes prêt à passer à la vitesse supérieure avec l'automatisation.",
    recommendation: 'Approfondissez vos compétences avec la formation "Excel Avancé - Maîtrise et Automatisation".',
    formationKey: 'avance',
    skills: {
      "Bases d'Excel": 95,
      "Formules": 90,
      "Mise en forme": 90,
      "Recherche": 85,
      "Automatisation": 70
    }
  },
  expert: {
    label: 'Expert',
    emoji: '🏆',
    color: '#eab308',
    gradient: 'linear-gradient(135deg, #eab308 0%, #facc15 100%)',
    bgColor: 'bg-yellow-50',
    borderColor: 'border-yellow-300',
    description: 'Vous êtes un expert Excel ! Maîtrise complète de VBA, Power Query, Power Pivot.',
    messageEncouragement: "Félicitations ! Vous faites partie des experts. Il est temps de décrocher une certification reconnue.",
    recommendation: 'Félicitations ! Vous pouvez envisager la certification "Expert Excel - Data Analyst".',
    formationKey: 'expert',
    skills: {
      "Bases d'Excel": 100,
      "Formules": 100,
      "Mise en forme": 100,
      "Recherche": 95,
      "Automatisation": 90
    }
  }
};

// ============================================
// 🎵 SON DE SUCCÈS
// ============================================
const playSuccessSound = (level = 'avance') => {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;

    const ctx = new AudioContext();
    const notes = level === 'expert'
      ? [523.25, 659.25, 783.99, 1046.50]
      : level === 'avance'
      ? [523.25, 659.25, 783.99]
      : [523.25, 659.25];

    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.15);
      gain.gain.setValueAtTime(0, ctx.currentTime + i * 0.15);
      gain.gain.linearRampToValueAtTime(0.2, ctx.currentTime + i * 0.15 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.15 + 0.4);
      osc.start(ctx.currentTime + i * 0.15);
      osc.stop(ctx.currentTime + i * 0.15 + 0.5);
    });

    setTimeout(() => ctx.close(), 3000);
  } catch (err) {
    console.warn('Audio non supporté:', err);
  }
};

// ============================================
// 🎉 CONFETTIS
// ============================================
const fireConfetti = (level = 'avance') => {
  const colors = level === 'expert'
    ? ['#eab308', '#facc15', '#fbbf24', '#f59e0b']
    : level === 'avance'
    ? ['#8b5cf6', '#a78bfa', '#c4b5fd', '#ddd6fe']
    : ['#3b82f6', '#60a5fa', '#93c5fd', '#bfdbfe'];

  confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 }, colors });
  setTimeout(() => confetti({ particleCount: 50, angle: 60, spread: 55, origin: { x: 0 }, colors }), 200);
  setTimeout(() => confetti({ particleCount: 50, angle: 120, spread: 55, origin: { x: 1 }, colors }), 400);
};

// ============================================
// ✅ ILLUSTRATION - TABLEAU EXCEL
// ============================================
function IllustrationTableauExcel({ 
  donnees, titre, surligneColonne, surligneLigne, 
  formule, resultat, total, conditionAffichee, triAffiche, 
  graphiqueType, raccourciAffiche, segments, hideResult 
}) {
  if (!donnees || !donnees.colonnes || !donnees.lignes) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="my-5 rounded-xl overflow-hidden border-2 border-gray-300 shadow-lg bg-white"
    >
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
                    surligneColonne === i ? 'bg-[#217346] text-white' : 'bg-gray-100 text-gray-700'
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
                      surligneColonne === j ? 'bg-green-50 font-semibold' : 'bg-white text-gray-700'
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
      {total && !hideResult && (
        <div className="bg-green-100 border-t border-green-200 px-4 py-2 text-sm font-bold text-green-800">
          {total}
        </div>
      )}
      {formule && (
        <div className="bg-gray-50 border-t border-gray-200 px-4 py-2 text-xs font-mono text-gray-700 flex items-center gap-2">
          <span className="font-bold text-[#217346]">ƒx</span>
          <span>{formule}</span>
          {!hideResult && resultat && (
            <span className="ml-auto font-bold text-[#217346]">{resultat}</span>
          )}
        </div>
      )}
      {formule && hideResult && resultat && (
        <div className="bg-blue-50 border-t border-blue-200 px-4 py-2 text-xs text-blue-600 font-medium italic">
          🎯 À vous de calculer le résultat...
        </div>
      )}
      {conditionAffichee && (
        <div className="bg-yellow-50 border-t border-yellow-200 px-4 py-2 text-xs font-medium text-yellow-800">
          ⚙️ {conditionAffichee}
        </div>
      )}
      {triAffiche && (
        <div className="bg-blue-50 border-t border-blue-200 px-4 py-2 text-xs font-medium text-blue-800">
          🔄 {triAffiche}
        </div>
      )}
      {raccourciAffiche && (
        <div className="bg-purple-50 border-t border-purple-200 px-4 py-2 text-xs font-medium text-purple-800">
          ⌨️ {raccourciAffiche}
        </div>
      )}
      {segments && (
        <div className="bg-orange-50 border-t border-orange-200 px-4 py-2 text-xs font-medium text-orange-800 flex flex-wrap gap-2">
          {segments.map((s, i) => (
            <span key={i} className="bg-orange-200 px-2 py-0.5 rounded">{s}</span>
          ))}
        </div>
      )}
    </motion.div>
  );
}

// ============================================
// ✅ ILLUSTRATION - BARRE DE FORMULE
// ============================================
function IllustrationBarreFormule({ cellule, formule, resultat, hideResult }) {
  if (!cellule || !formule) return null;
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="my-5 rounded-xl overflow-hidden border-2 border-gray-300 shadow-lg bg-white"
    >
      <div className="bg-gradient-to-r from-[#217346] to-[#1e6b3f] text-white px-4 py-2 text-sm font-semibold flex items-center gap-2">
        <span className="text-lg">ƒx</span>
        Barre de formule
      </div>
      <div className="flex items-center gap-2 px-3 py-3 bg-white border-b border-gray-200">
        <span className="text-xs font-mono bg-gray-100 px-2 py-1 rounded border border-gray-300 min-w-[60px] text-center">
          {cellule}
        </span>
        <span className="text-gray-400 text-lg">|</span>
        <span className="text-sm font-mono text-[#217346] font-bold bg-gray-50 px-3 py-1 rounded flex-1">
          {formule}
        </span>
      </div>
      {hideResult || !resultat ? (
        <div className="bg-blue-50 px-4 py-2 text-xs text-blue-600 font-medium italic">
          🎯 À vous de calculer le résultat...
        </div>
      ) : (
        <div className="bg-green-50 px-4 py-2 text-sm">
          Résultat : <span className="font-bold text-[#217346]">{resultat}</span>
        </div>
      )}
    </motion.div>
  );
}

// ============================================
// ILLUSTRATION - CODE
// ============================================
function IllustrationCode({ titre, code, resultat }) {
  if (!code) return null;
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="my-5 rounded-xl overflow-hidden border-2 border-gray-700 shadow-lg bg-gray-900"
    >
      <div className="bg-gray-800 text-gray-200 px-4 py-2 text-sm font-semibold flex items-center gap-2">
        <span className="text-lg">💻</span>
        {titre || 'Code VBA'}
      </div>
      <pre className="text-green-400 text-xs p-4 overflow-x-auto font-mono">
        <code>{code}</code>
      </pre>
      {resultat && (
        <div className="bg-gray-800 border-t border-gray-700 px-4 py-2 text-xs text-gray-300">
          → {resultat}
        </div>
      )}
    </motion.div>
  );
}

// ============================================
// ✅ QUESTION ILLUSTRATION (avec détection hideResult)
// ============================================
function QuestionIllustration({ question }) {
  if (!question || !question.illustration) return null;
  const { illustration } = question;

  const questionLower = question.question?.toLowerCase() || '';
  const hideResult =
    questionLower.includes('quel est le résultat') ||
    questionLower.includes('quel est le resultat') ||
    questionLower.includes('combien') ||
    questionLower.includes('quelle valeur') ||
    questionLower.includes('quelle est la valeur') ||
    questionLower.includes('calculez') ||
    questionLower.includes('trouver le résultat') ||
    questionLower.includes('trouver la valeur');

  switch (illustration.type) {
    case 'tableau':
      return (
        <IllustrationTableauExcel
          {...illustration}
          hideResult={hideResult}
        />
      );
    case 'formule':
      return (
        <IllustrationBarreFormule
          cellule={illustration.cellule}
          formule={illustration.formule}
          resultat={illustration.resultat}
          hideResult={hideResult}
        />
      );
    case 'code':
      return <IllustrationCode {...illustration} />;
    default:
      return null;
  }
}

// ============================================
// MÉLANGER
// ============================================
function shuffleQuestionOptions(question) {
  const optionsWithIndex = question.options.map((option, index) => ({
    texte: option,
    originalIndex: index
  }));
  const shuffled = [...optionsWithIndex].sort(() => Math.random() - 0.5);
  const newCorrectIndex = shuffled.findIndex((opt) => opt.originalIndex === question.correct);
  return {
    ...question,
    options: shuffled.map((opt) => opt.texte),
    correct: newCorrectIndex
  };
}

// ============================================
// PROGRAMME FORMATION
// ============================================
function FormationProgramme({ programme }) {
  if (!programme) return null;
  return (
    <div className="bg-white rounded-xl border-2 border-gray-200 overflow-hidden shadow-md">
      <div
        className="text-white px-6 py-4"
        style={{ background: `linear-gradient(135deg, ${programme.couleur} 0%, ${programme.couleur}dd 100%)` }}
      >
        <h4 className="text-lg font-bold flex items-center gap-2">
          <span>{programme.icon}</span>
          {programme.titre}
        </h4>
        <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-white/90">
          <span>⏱️ {programme.duree}</span>
          <span>📊 Niveau {programme.niveau}</span>
        </div>
        {programme.formateur && (
          <div className="mt-3 pt-3 border-t border-white/20 text-xs text-white/90">
            <p>👨‍🏫 <strong>Formateur :</strong> {programme.formateur}</p>
            {programme.version && <p>📦 <strong>Version :</strong> {programme.version}</p>}
          </div>
        )}
      </div>
      <div className="p-6">
        <p className="text-gray-700 mb-6 italic">{programme.description}</p>
        <div className="space-y-5">
          {programme.axes.map((axe, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.15 }}
              className="border-l-4 pl-4"
              style={{ borderColor: programme.couleur }}
            >
              <h5 className="font-bold mb-3 text-gray-800">{axe.titre}</h5>
              <ul className="space-y-1.5">
                {axe.points.map((point, i) => (
                  <li key={i} className="text-sm text-gray-600 flex items-start gap-2">
                    <span className="text-[#76c21f] mt-0.5">✓</span>
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
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
  const location = useLocation();
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
  const [selectedExcelVersion, setSelectedExcelVersion] = useState('2019');
  const [answeredPulse, setAnsweredPulse] = useState(null);

  const timerRef = useRef(null);
  const hasFiredConfetti = useRef(false);

  const isDebutantTest = location.pathname.includes('debutant');
  const totalQuestions = isDebutantTest ? 10 : 15;
  const testDuration = isDebutantTest ? 8 : 12;

  // ============================================
  // INITIALISATION
  // ============================================
  useEffect(() => {
    try {
      if (!excelAvanceQuestions || excelAvanceQuestions.length === 0) {
        throw new Error('Aucune question disponible');
      }

      let availableQuestions;
      if (isDebutantTest) {
        availableQuestions = excelAvanceQuestions.filter(q => q.difficulty === 'débutant');
      } else {
        availableQuestions = [...excelAvanceQuestions];
      }

      while (availableQuestions.length < 30) {
        availableQuestions = availableQuestions.concat([...availableQuestions]);
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
  }, [isDebutantTest, totalQuestions, testDuration]);

  // ============================================
  // TIMER
  // ============================================
  useEffect(() => {
    if (testStarted && timeLeft > 0 && !testCompleted) {
      timerRef.current = setTimeout(() => setTimeLeft(prev => prev - 1), 1000);
      return () => {
        if (timerRef.current) clearTimeout(timerRef.current);
      };
    } else if (timeLeft === 0 && testStarted && !testCompleted) {
      handleSubmitTest('timeout');
    }
  }, [timeLeft, testStarted, testCompleted]);

  // ============================================
  // CONFETTIS + SON
  // ============================================
  useEffect(() => {
    if (testCompleted && results && !hasFiredConfetti.current) {
      hasFiredConfetti.current = true;
      setTimeout(() => {
        fireConfetti(results.levelKey);
        playSuccessSound(results.levelKey);
      }, 500);
    }
  }, [testCompleted, results]);

  // ============================================
  // FONCTIONS
  // ============================================
  const handleStartTest = () => {
    setTestStarted(true);
    toast.info(`⏱️ Le test Excel ${isDebutantTest ? 'Débutant' : 'Avancé'} commence !`);
  };

  const handleSelectAnswer = (questionId, optionIndex) => {
    setAnswers({ ...answers, [questionId]: optionIndex });
    setAnsweredPulse(questionId);
    setTimeout(() => setAnsweredPulse(null), 400);
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

  // ============================================
  // ✅ RÉCUPÉRER L'ID DE LA FORMATION EXCEL
  // ============================================
  const getExcelFormationId = (levelKey) => {
    if (isDebutantTest) {
      return EXCEL_FORMATION_IDS.debutant;
    }
    // Pour le test avancé, on lie à la formation Excel Avancé
    return EXCEL_FORMATION_IDS.avance;
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
      return { ...q, userAnswer: answers[q.id], isCorrect };
    });

    const percentage = Math.round((correct / questions.length) * 100);

    let levelKey = 'debutant';
    if (isDebutantTest) {
      if (percentage >= 90) levelKey = 'avance';
      else if (percentage >= 70) levelKey = 'intermediaire';
      else levelKey = 'debutant';
    } else {
      if (percentage >= 90) levelKey = 'expert';
      else if (percentage >= 75) levelKey = 'avance';
      else if (percentage >= 50) levelKey = 'intermediaire';
    }

    const level = EXCEL_LEVELS[levelKey];
    const programme = FORMATION_PROGRAMMES[level.formationKey];
    const timeSpent = Math.round(((testDuration * 60) - timeLeft) / 60);

    // ✅ RÉCUPÉRER L'ID DE LA FORMATION EXCEL
    const excelFormationId = getExcelFormationId(levelKey);

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
      testName: `Excel ${isDebutantTest ? 'Débutant' : 'Avancé'}`,
      testIcon: '📊',
      excelVersion: EXCEL_VERSIONS[selectedExcelVersion] || 'Excel 2019',
      formationId: excelFormationId
    };

    setResults(resultData);
    setTestCompleted(true);
    if (timerRef.current) clearTimeout(timerRef.current);

    // ✅ SAUVEGARDE AVEC formation_id
    if (user) {
      try {
        const testType = isDebutantTest ? 'excelDebutant' : 'excelAvance';
        
        const insertPayload = {
          user_id: user.id,
          formation_id: excelFormationId, // ✅ LIER À LA FORMATION
          test_type: testType,
          score: correct,
          total_questions: questions.length,
          percentage,
          level: level.label,
          answers,
          time_spent: timeSpent * 60,
          created_at: new Date().toISOString()
        };

        console.log('📤 Insertion test_results:', insertPayload);

        const { data: insertedData, error: insertError } = await supabase
          .from('test_results')
          .insert(insertPayload)
          .select()
          .single();

        if (insertError) {
          console.error('❌ Erreur insertion test_results:', insertError);
          toast.error(`Erreur sauvegarde : ${insertError.message}`);
        } else {
          console.log('✅ Résultat sauvegardé:', insertedData);
          toast.success('✅ Résultat sauvegardé dans votre espace !');
        }
      } catch (error) {
        console.error('❌ Exception sauvegarde:', error);
        toast.error('Erreur lors de la sauvegarde du résultat');
      }
    } else {
      toast.warning('💡 Connectez-vous pour sauvegarder vos résultats');
    }
    setSubmitting(false);
  };

  const handleRetry = () => {
    hasFiredConfetti.current = false;
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
  // ✅ NAVIGATION VERS LA FORMATION RECOMMANDÉE
  // ============================================
  const handleGoToFormation = () => {
    const formationId = results?.formationId;
    
    if (formationId === EXCEL_FORMATION_IDS.debutant) {
      navigate('/formations/excel-debutant-les-fondamentaux');
    } else if (formationId === EXCEL_FORMATION_IDS.avance) {
      navigate('/formations/excel-avance-formation-perfectionnement-et-automatisation-ce');
    } else {
      // Fallback : rechercher excel
      navigate('/formations?search=excel');
    }
  };

  // ============================================
  // CHARGEMENT
  // ============================================
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            className="w-20 h-20 border-4 border-[#1a56db] border-t-transparent rounded-full mx-auto"
          />
          <p className="mt-6 text-gray-600 font-medium">Préparation de votre test...</p>
        </div>
      </div>
    );
  }

  // ============================================
  // RÉSULTATS
  // ============================================
  if (testCompleted && results) {
    return (
      <>
        <Helmet>
          <title>Résultat Test Excel | Centre Certus</title>
        </Helmet>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 py-8 px-4">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="bg-white rounded-3xl shadow-2xl overflow-hidden"
            >
              <div
                className="text-white px-8 py-8 relative overflow-hidden"
                style={{ background: results.level.gradient }}
              >
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ duration: 0.8, type: 'spring' }}
                  className="text-7xl mb-2"
                >
                  {results.level.emoji}
                </motion.div>
                <motion.h2
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-3xl font-bold"
                >
                  {results.level.label} !
                </motion.h2>
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="text-white/90 mt-2 max-w-lg"
                >
                  {results.level.messageEncouragement}
                </motion.p>
              </div>

              <div className="p-8">
                <div className="flex justify-center mb-8">
                  <div className="relative w-40 h-40">
                    <svg className="w-full h-full transform -rotate-90">
                      <circle cx="80" cy="80" r="70" stroke="#e5e7eb" strokeWidth="12" fill="none" />
                      <motion.circle
                        cx="80" cy="80" r="70"
                        stroke={results.level.color} strokeWidth="12" fill="none"
                        strokeLinecap="round"
                        strokeDasharray={`${2 * Math.PI * 70}`}
                        initial={{ strokeDashoffset: 2 * Math.PI * 70 }}
                        animate={{ strokeDashoffset: 2 * Math.PI * 70 * (1 - results.percentage / 100) }}
                        transition={{ duration: 1.5, ease: 'easeOut' }}
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <motion.span
                        className="text-4xl font-bold text-gray-800"
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.6, delay: 0.5 }}
                      >
                        {results.percentage}%
                      </motion.span>
                      <span className="text-xs text-gray-500">Score</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                  <div className="bg-gray-50 rounded-xl p-4 text-center">
                    <div className="text-2xl font-bold" style={{ color: results.level.color }}>
                      {results.correct}/{results.total}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Bonnes réponses</p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4 text-center">
                    <div className="text-2xl font-bold text-orange-500">{results.timeSpent} min</div>
                    <p className="text-xs text-gray-500 mt-1">Temps passé</p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4 text-center">
                    <div className="text-2xl font-bold text-gray-600">
                      {results.unanswered === 0 ? '✅' : results.unanswered}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Non répondues</p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4 text-center">
                    <div className="text-2xl font-bold text-sky-500">
                      {results.excelVersion.replace('Excel ', '')}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Version</p>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-2xl p-6 mb-8">
                  <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <span>🎯</span> Vos compétences en détail
                  </h3>
                  <div className="space-y-4">
                    {Object.entries(results.level.skills).map(([skill, value], index) => (
                      <div key={skill}>
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-sm font-medium text-gray-700">{skill}</span>
                          <span className="text-sm font-bold" style={{ color: results.level.color }}>{value}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                          <motion.div
                            className="h-3 rounded-full"
                            style={{ background: `linear-gradient(90deg, ${results.level.color} 0%, ${results.level.color}dd 100%)` }}
                            initial={{ width: 0 }}
                            animate={{ width: `${value}%` }}
                            transition={{ duration: 1, delay: index * 0.15, ease: 'easeOut' }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div
                  className="rounded-2xl p-6 mb-6 border-2"
                  style={{ background: `${results.level.color}10`, borderColor: `${results.level.color}40` }}
                >
                  <h4 className="font-bold mb-2 flex items-center gap-2 text-lg" style={{ color: results.level.color }}>
                    <span>💡</span> Notre recommandation
                  </h4>
                  <p className="text-gray-700">{results.level.recommendation}</p>
                </div>

                <div className="mb-6">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setShowProgramme(!showProgramme)}
                    className="w-full text-white px-6 py-4 rounded-xl font-semibold shadow-lg transition flex items-center justify-between"
                    style={{ background: results.level.gradient }}
                  >
                    <span className="flex items-center gap-2">
                      <span>📚</span>
                      {showProgramme ? 'Masquer le programme' : 'Voir le programme détaillé'}
                    </span>
                    <motion.span animate={{ rotate: showProgramme ? 180 : 0 }}>▼</motion.span>
                  </motion.button>
                </div>

                <AnimatePresence>
                  {showProgramme && results.programme && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mb-6"
                    >
                      <FormationProgramme programme={results.programme} />
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="flex flex-wrap gap-3 mt-6">
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={handleRetry}
                    className="bg-gray-200 text-gray-700 px-6 py-3 rounded-xl hover:bg-gray-300 transition flex items-center gap-2 font-medium"
                  >
                    🔄 Refaire le test
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => setShowReview(!showReview)}
                    className="bg-blue-100 text-blue-700 px-6 py-3 rounded-xl hover:bg-blue-200 transition flex items-center gap-2 font-medium"
                  >
                    📝 {showReview ? 'Masquer' : 'Voir'} le détail
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={handleGoToFormation}
                    className="text-white px-6 py-3 rounded-xl shadow-lg transition flex items-center gap-2 font-semibold"
                    style={{ background: results.level.gradient }}
                  >
                    🎓 Voir la formation recommandée
                  </motion.button>
                </div>

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
                            <div className="flex justify-between items-start mb-3">
                              <p className="font-medium text-gray-800 flex-1">
                                {index + 1}. {q.question}
                              </p>
                              <div className="ml-4 text-2xl">{q.isCorrect ? '✅' : '❌'}</div>
                            </div>

                            <QuestionIllustration question={q} />

                            <div className="mt-3 space-y-1 text-sm">
                              <p className="text-gray-600">
                                <strong>Votre réponse :</strong> {q.userAnswer !== undefined ? q.options[q.userAnswer] : 'Non répondue'}
                              </p>
                              {!q.isCorrect && (
                                <p className="text-green-600">
                                  <strong>✅ Bonne réponse :</strong> {q.options[q.correct]}
                                </p>
                              )}
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
  // DÉMARRAGE
  // ============================================
  if (!testStarted) {
    return (
      <>
        <Helmet>
          <title>{`Test Excel ${isDebutantTest ? 'Débutant' : 'Avancé'} | Centre Certus`}</title>
        </Helmet>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-2xl w-full bg-white rounded-3xl shadow-2xl p-8"
          >
            <div className="text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', delay: 0.2 }}
                className="text-7xl mb-4"
              >
                {isDebutantTest ? '📊' : '🎓'}
              </motion.div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">
                Test de niveau - Excel {isDebutantTest ? 'Débutant' : 'Avancé'}
              </h1>
              <p className="text-gray-500 mb-6">
                Découvrez votre niveau en {totalQuestions} questions et recevez un <strong>plan de progression personnalisé</strong>.
              </p>

              <div className="mb-6 bg-gradient-to-br from-blue-50 to-green-50 rounded-2xl p-6 border border-blue-100">
                <div className="grid grid-cols-2 gap-4 text-left">
                  <div className="flex items-start gap-2">
                    <span className="text-2xl">✨</span>
                    <div>
                      <p className="font-semibold text-gray-800 text-sm">Résultat immédiat</p>
                      <p className="text-xs text-gray-500">À la fin du test</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-2xl">🎯</span>
                    <div>
                      <p className="font-semibold text-gray-800 text-sm">Niveau personnalisé</p>
                      <p className="text-xs text-gray-500">Débutant à Expert</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-2xl">📚</span>
                    <div>
                      <p className="font-semibold text-gray-800 text-sm">Formation recommandée</p>
                      <p className="text-xs text-gray-500">Avec programme détaillé</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-2xl">💾</span>
                    <div>
                      <p className="font-semibold text-gray-800 text-sm">Sauvegarde auto</p>
                      <p className="text-xs text-gray-500">Dans votre espace</p>
                    </div>
                  </div>
                </div>
              </div>

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

              <div className="grid grid-cols-3 gap-3 mb-6">
                <div className="bg-blue-50 rounded-xl p-3 text-center">
                  <div className="text-2xl font-bold text-blue-600">{totalQuestions}</div>
                  <div className="text-xs text-gray-500">Questions</div>
                </div>
                <div className="bg-green-50 rounded-xl p-3 text-center">
                  <div className="text-2xl font-bold text-green-600">{testDuration} min</div>
                  <div className="text-xs text-gray-500">Durée</div>
                </div>
                <div className="bg-yellow-50 rounded-xl p-3 text-center">
                  <div className="text-2xl font-bold text-yellow-600">4</div>
                  <div className="text-xs text-gray-500">Niveaux</div>
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleStartTest}
                className="w-full bg-gradient-to-r from-[#1a56db] to-[#76c21f] text-white py-4 rounded-xl font-semibold text-lg shadow-lg hover:shadow-2xl transition-all"
              >
                🚀 Commencer le test
              </motion.button>

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
  // QUESTIONS
  // ============================================
  const currentQuestion = questions[currentQuestionIndex];
  if (!currentQuestion) return null;

  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const answeredCount = Object.keys(answers).length;

  return (
    <>
      <Helmet>
        <title>{`Question ${currentQuestionIndex + 1}/${questions.length} | Test Excel`}</title>
      </Helmet>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 py-4 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white rounded-2xl shadow-lg p-4 mb-4">
            <div className="flex justify-between items-center mb-2">
              <div>
                <span className="text-sm font-medium text-gray-600">
                  Question {currentQuestionIndex + 1}/{questions.length}
                </span>
                <span className="ml-4 text-sm text-gray-500">
                  {answeredCount}/{questions.length} répondues
                </span>
              </div>
              <motion.span
                animate={timeLeft < 60 ? { scale: [1, 1.1, 1] } : {}}
                transition={{ duration: 1, repeat: timeLeft < 60 ? Infinity : 0 }}
                className={`text-sm font-bold ${timeLeft < 60 ? 'text-red-600' : 'text-gray-600'}`}
              >
                ⏱️ {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
              </motion.span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
              <motion.div
                className="bg-gradient-to-r from-[#1a56db] to-[#76c21f] h-2.5 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </div>

          <motion.div
            key={currentQuestionIndex}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-white rounded-2xl shadow-lg p-6 mb-4"
          >
            <div className="flex items-center gap-2 mb-4 flex-wrap">
              <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-medium">
                {currentQuestion.category || 'Général'}
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
              {currentQuestion.options.map((option, index) => {
                const isSelected = answers[currentQuestion.id] === index;
                const isPulsing = answeredPulse === currentQuestion.id && isSelected;
                return (
                  <motion.button
                    key={index}
                    onClick={() => handleSelectAnswer(currentQuestion.id, index)}
                    animate={isPulsing ? { scale: [1, 1.02, 1] } : {}}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                      isSelected
                        ? 'border-[#1a56db] bg-blue-50 shadow-md'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <span className="font-medium text-gray-700 flex items-center justify-between">
                      <span className="flex items-center">
                        <span
                          className={`inline-block w-6 h-6 rounded text-center text-xs leading-6 mr-2 font-bold ${
                            isSelected ? 'bg-[#1a56db] text-white' : 'bg-gray-100'
                          }`}
                        >
                          {String.fromCharCode(65 + index)}
                        </span>
                        {option}
                      </span>
                      {isSelected && (
                        <motion.span
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="text-[#1a56db] text-lg"
                        >
                          ✓
                        </motion.span>
                      )}
                    </span>
                  </motion.button>
                );
              })}
            </div>
          </motion.div>

          <div className="flex justify-between items-center bg-white rounded-2xl shadow-lg p-4">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={handlePrevious}
              disabled={currentQuestionIndex === 0}
              className={`px-6 py-2 rounded-lg font-medium transition ${
                currentQuestionIndex === 0
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              ← Précédent
            </motion.button>

            {currentQuestionIndex < questions.length - 1 ? (
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={handleNext}
                className="px-6 py-2 bg-[#1a56db] text-white rounded-lg font-medium hover:bg-[#1a56db]/90 transition"
              >
                Suivant →
              </motion.button>
            ) : (
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => handleSubmitTest('manual')}
                disabled={submitting}
                className="px-6 py-2 bg-gradient-to-r from-[#1a56db] to-[#76c21f] text-white rounded-lg font-medium shadow-lg transition disabled:opacity-50"
              >
                {submitting ? 'Soumission...' : '📊 Voir mes résultats'}
              </motion.button>
            )}
          </div>

          <div className="mt-4 flex flex-wrap gap-1.5 justify-center">
            {questions.map((q, index) => (
              <motion.button
                key={index}
                whileHover={{ scale: 1.15 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => handleGoToQuestion(index)}
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium transition ${
                  index === currentQuestionIndex
                    ? 'bg-[#1a56db] text-white scale-110 shadow-md'
                    : answers[q.id] !== undefined
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-200 text-gray-500 hover:bg-gray-300'
                }`}
              >
                {index + 1}
              </motion.button>
            ))}
          </div>

          {timeLeft < 60 && (
            <motion.div
              animate={{ scale: [1, 1.02, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
              className="mt-4 bg-red-50 border border-red-200 rounded-xl p-3 text-center"
            >
              <p className="text-red-600 font-medium">
                ⚠️ Temps presque écoulé ! {minutes}m{seconds}s restantes
              </p>
            </motion.div>
          )}
        </div>
      </div>
    </>
  );
}