// frontend/src/data/tests/excelAvanceQuestions.js

export const excelAvanceQuestions = [
  // ============================================
  // NIVEAU DÉBUTANT - 35 questions avec illustrations
  // ============================================
  {
    id: 1,
    question: "Quelle cellule est sélectionnée dans ce tableau ?",
    options: ["A1", "B2", "C3", "D4"],
    correct: 0,
    difficulty: "débutant",
    category: "Interface",
    level: "Débutant",
    illustration: {
      type: "tableau",
      titre: "Cellule active",
      donnees: {
        colonnes: ["A", "B", "C", "D"],
        lignes: [
          ["A1", "B1", "C1", "D1"],
          ["A2", "B2", "C2", "D2"],
          ["A3", "B3", "C3", "D3"],
          ["A4", "B4", "C4", "D4"]
        ]
      },
      surligneColonne: 0,
      surligneLigne: 0
    }
  },
  {
    id: 2,
    question: "Que fait la formule affichée dans cette barre de formule ?",
    options: ["Additionne A1 à A5", "Multiplie A1 à A5", "Compte A1 à A5", "Moyenne de A1 à A5"],
    correct: 0,
    difficulty: "débutant",
    category: "Formules de base",
    level: "Débutant",
    illustration: {
      type: "tableau",
      titre: "Barre de formule",
      donnees: {
        colonnes: ["A"],
        lignes: [["10"], ["20"], ["30"], ["40"], ["50"]]
      },
      surligneColonne: 0,
      formule: "=SOMME(A1:A5)"
    }
  },
  {
    id: 3,
    question: "Que fait cette formule ?",
    options: ["Calcule la moyenne", "Calcule la somme", "Trouve le max", "Trouve le min"],
    correct: 0,
    difficulty: "débutant",
    category: "Formules de base",
    level: "Débutant",
    illustration: {
      type: "tableau",
      titre: "Barre de formule",
      donnees: {
        colonnes: ["B"],
        lignes: [["20"], ["30"], ["40"], ["30"], ["30"]]
      },
      surligneColonne: 0,
      formule: "=MOYENNE(B1:B5)"
    }
  },
  {
    id: 4,
    question: "Quel est le résultat de cette formule ?",
    options: ["8", "6", "9", "4"],
    correct: 0,
    difficulty: "débutant",
    category: "Formules de base",
    level: "Débutant",
    illustration: {
      type: "tableau",
      titre: "Trouver la valeur maximale",
      donnees: {
        colonnes: ["A", "B"],
        lignes: [
          ["Valeur 1", "5"],
          ["Valeur 2", "8"],
          ["Valeur 3", "3"],
          ["Valeur 4", "6"]
        ]
      },
      surligneColonne: 1,
      formule: "=MAX(B1:B4)"
    }
  },
  {
    id: 5,
    question: "Que fait ce raccourci sur la cellule sélectionnée ?",
    options: ["Met en gras", "Met en italique", "Souligne", "Barre"],
    correct: 0,
    difficulty: "débutant",
    category: "Raccourcis",
    level: "Débutant",
    illustration: {
      type: "tableau",
      titre: "Mise en forme",
      donnees: {
        colonnes: ["A", "B"],
        lignes: [["Nom", "Prix"], ["Pomme", "2"], ["Banane", "3"]]
      },
      surligneColonne: 0,
      surligneLigne: 1,
      raccourciAffiche: "Ctrl + B"
    }
  },
  {
    id: 6,
    question: "Que fait ce tableau croisé ?",
    options: ["Additionne les ventes par mois", "Compte les clients", "Calcule la moyenne", "Trie les données"],
    correct: 0,
    difficulty: "débutant",
    category: "Tableaux",
    level: "Débutant",
    illustration: {
      type: "tableau",
      titre: "Tableau de ventes",
      donnees: {
        colonnes: ["Mois", "Ventes"],
        lignes: [
          ["Janvier", "1000"],
          ["Février", "1500"],
          ["Mars", "1200"],
          ["Avril", "1800"]
        ]
      }
    }
  },
  {
    id: 7,
    question: "Que fait cette formule =NBVAL(A1:A5) ?",
    options: ["Compte les cellules non vides", "Compte les nombres", "Additionne", "Calcule la moyenne"],
    correct: 0,
    difficulty: "débutant",
    category: "Fonctions statistiques",
    level: "Débutant",
    illustration: {
      type: "tableau",
      titre: "Barre de formule",
      donnees: {
        colonnes: ["A"],
        lignes: [["10"], ["20"], ["30"], ["40"], ["50"]]
      },
      surligneColonne: 0,
      formule: "=NBVAL(A1:A5)"
    }
  },
  {
    id: 8,
    question: "Que fait cette formule =SOMME.SI(...) ?",
    options: ["Additionne selon un critère", "Additionne tout", "Compte", "Moyenne"],
    correct: 0,
    difficulty: "débutant",
    category: "Fonctions conditionnelles",
    level: "Débutant",
    illustration: {
      type: "tableau",
      titre: "SOMME.SI avec critère",
      donnees: {
        colonnes: ["Produit", "Prix"],
        lignes: [
          ["Pomme", "10"],
          ["Banane", "20"],
          ["Pomme", "15"],
          ["Pomme", "25"],
          ["Orange", "30"]
        ]
      },
      surligneColonne: 0,
      formule: "=SOMME.SI(A1:A5;\"Pomme\";B1:B5)"
    }
  },
  {
    id: 9,
    question: "Quel graphique représente le mieux l'évolution mensuelle ?",
    options: ["Graphique en courbes", "Graphique en secteurs", "Graphique en barres", "Graphique radar"],
    correct: 0,
    difficulty: "débutant",
    category: "Graphiques",
    level: "Débutant",
    illustration: {
      type: "tableau",
      titre: "Évolution des ventes",
      donnees: {
        colonnes: ["Mois", "Ventes"],
        lignes: [
          ["Janvier", "1000"],
          ["Février", "1200"],
          ["Mars", "1500"],
          ["Avril", "1800"]
        ]
      },
      graphiqueType: "courbes"
    }
  },
  {
    id: 10,
    question: "Que fait ce tri personnalisé ?",
    options: ["Trie de A à Z", "Trie du plus grand au plus petit", "Trie par couleur", "Trie par date"],
    correct: 0,
    difficulty: "débutant",
    category: "Tri",
    level: "Débutant",
    illustration: {
      type: "tableau",
      titre: "Tri croissant",
      donnees: {
        colonnes: ["Nom", "Note"],
        lignes: [
          ["Alice", "15"],
          ["Bob", "12"],
          ["Charlie", "18"],
          ["David", "14"]
        ]
      },
      triAffiche: "A → Z"
    }
  },
  {
    id: 11,
    question: "Que fait cette mise en forme conditionnelle ?",
    options: ["Colore les valeurs supérieures à 1000", "Colore les valeurs inférieures", "Colore tout", "Colore rien"],
    correct: 0,
    difficulty: "débutant",
    category: "Mise en forme",
    level: "Débutant",
    illustration: {
      type: "tableau",
      titre: "Mise en forme conditionnelle",
      donnees: {
        colonnes: ["Ventes"],
        lignes: [["500"], ["1200"], ["800"], ["1500"]]
      },
      surligneColonne: 0,
      surligneLigne: 1,
      conditionAffichee: "Si > 1000 → Vert"
    }
  },
  {
    id: 12,
    question: "Que fait cette formule d'addition ?",
    options: ["Additionne les nombres", "Concatène", "Compare", "Multiplie"],
    correct: 0,
    difficulty: "débutant",
    category: "Formules de base",
    level: "Débutant",
    illustration: {
      type: "tableau",
      titre: "Formule d'addition",
      donnees: { colonnes: ["A", "B"], lignes: [["10", "20"]] },
      formule: "=A1+B1"
    }
  },
  {
    id: 13,
    question: "Que fait cette formule de soustraction ?",
    options: ["Soustraction", "Addition", "Multiplication", "Division"],
    correct: 0,
    difficulty: "débutant",
    category: "Formules de base",
    level: "Débutant",
    illustration: {
      type: "tableau",
      titre: "Formule de soustraction",
      donnees: { colonnes: ["A", "B"], lignes: [["30", "20"]] },
      formule: "=A1-B1"
    }
  },
  {
    id: 14,
    question: "Quel est le résultat de cette formule =SOMME(A1:A3)*2 ?",
    options: ["30", "15", "20", "45"],
    correct: 0,
    difficulty: "débutant",
    category: "Formules de base",
    level: "Débutant",
    illustration: {
      type: "tableau",
      titre: "Calcul avec SOMME",
      donnees: { colonnes: ["A"], lignes: [["5"], ["5"], ["5"]] },
      surligneColonne: 0,
      formule: "=SOMME(A1:A3)*2"
    }
  },
  {
    id: 15,
    question: "Que fait cette formule =AUJOURDHUI() ?",
    options: ["Affiche la date du jour", "Affiche l'heure", "Affiche le mois", "Affiche l'année"],
    correct: 0,
    difficulty: "débutant",
    category: "Fonctions date",
    level: "Débutant",
    illustration: { type: "formule", cellule: "A1", formule: "=AUJOURDHUI()" }
  },
  {
    id: 16,
    question: "Que fait cette formule =MAINTENANT() ?",
    options: ["Affiche la date et l'heure", "Affiche la date", "Affiche l'heure", "Affiche le jour"],
    correct: 0,
    difficulty: "débutant",
    category: "Fonctions date",
    level: "Débutant",
    illustration: { type: "formule", cellule: "A1", formule: "=MAINTENANT()" }
  },
  {
    id: 17,
    question: "Quel est le résultat de cette formule =ARRONDI(3,7;0) ?",
    options: ["4", "3", "3,5", "4,5"],
    correct: 0,
    difficulty: "débutant",
    category: "Fonctions mathématiques",
    level: "Débutant",
    illustration: { type: "formule", cellule: "A1", formule: "=ARRONDI(3,7;0)" }
  },
  {
    id: 18,
    question: "Que fait cette formule =GAUCHE(\"Excel\";3) ?",
    options: ["Extrait les 3 premiers caractères", "Extrait les 3 derniers caractères", "Compte les caractères", "Remplace le texte"],
    correct: 0,
    difficulty: "débutant",
    category: "Fonctions texte",
    level: "Débutant",
    illustration: { type: "formule", cellule: "A1", formule: "=GAUCHE(\"Excel\";3)" }
  },
  {
    id: 19,
    question: "Que fait cette formule =DROITE(\"Excel\";3) ?",
    options: ["Extrait les 3 derniers caractères", "Extrait les 3 premiers caractères", "Compte les caractères", "Remplace le texte"],
    correct: 0,
    difficulty: "débutant",
    category: "Fonctions texte",
    level: "Débutant",
    illustration: { type: "formule", cellule: "A1", formule: "=DROITE(\"Excel\";3)" }
  },
  {
    id: 20,
    question: "Quel est le résultat de cette formule =NBCAR(\"Excel\") ?",
    options: ["5", "4", "6", "Erreur"],
    correct: 0,
    difficulty: "débutant",
    category: "Fonctions texte",
    level: "Débutant",
    illustration: { type: "formule", cellule: "A1", formule: "=NBCAR(\"Excel\")" }
  },
  {
    id: 21,
    question: "Que fait cette formule =CONCATENER(A1;B1) ?",
    options: ["Fusionne le contenu de A1 et B1", "Sépare A1 et B1", "Compte les caractères", "Compare A1 et B1"],
    correct: 0,
    difficulty: "débutant",
    category: "Fonctions texte",
    level: "Débutant",
    illustration: {
      type: "tableau",
      titre: "CONCATENER",
      donnees: { colonnes: ["A", "B"], lignes: [["Bonjour", "Monde"]] },
      formule: "=CONCATENER(A1;B1)"
    }
  },
  {
    id: 22,
    question: "Quel est le résultat de cette formule =MAX(A1:A4) ?",
    options: ["50", "30", "20", "40"],
    correct: 0,
    difficulty: "débutant",
    category: "Fonctions statistiques",
    level: "Débutant",
    illustration: {
      type: "tableau",
      titre: "Trouver la valeur maximale",
      donnees: { colonnes: ["A"], lignes: [["10"], ["50"], ["30"], ["20"]] },
      surligneColonne: 0,
      formule: "=MAX(A1:A4)"
    }
  },
  {
    id: 23,
    question: "Quel est le résultat de cette formule =MIN(A1:A4) ?",
    options: ["10", "20", "30", "40"],
    correct: 0,
    difficulty: "débutant",
    category: "Fonctions statistiques",
    level: "Débutant",
    illustration: {
      type: "tableau",
      titre: "Trouver la valeur minimale",
      donnees: { colonnes: ["A"], lignes: [["40"], ["30"], ["20"], ["10"]] },
      surligneColonne: 0,
      formule: "=MIN(A1:A4)"
    }
  },
  {
    id: 24,
    question: "Que fait cette formule =NB.SI(A1:A5;\">100\") ?",
    options: ["Compte les valeurs > 100", "Additionne > 100", "Moyenne > 100", "Max > 100"],
    correct: 0,
    difficulty: "débutant",
    category: "Fonctions conditionnelles",
    level: "Débutant",
    illustration: {
      type: "tableau",
      titre: "NB.SI avec condition",
      donnees: { colonnes: ["A"], lignes: [["50"], ["150"], ["200"], ["80"], ["120"]] },
      surligneColonne: 0,
      formule: "=NB.SI(A1:A5;\">100\")"
    }
  },
  {
    id: 25,
    question: "Que fait cette formule =MOYENNE.SI(A1:A5;\"Oui\";B1:B5) ?",
    options: ["Moyenne selon critère", "Moyenne de tout", "Compte", "Additionne"],
    correct: 0,
    difficulty: "débutant",
    category: "Fonctions conditionnelles",
    level: "Débutant",
    illustration: {
      type: "tableau",
      titre: "MOYENNE.SI avec critère",
      donnees: {
        colonnes: ["Réponse", "Score"],
        lignes: [["Oui", "80"], ["Non", "50"], ["Oui", "90"], ["Oui", "70"], ["Non", "60"]]
      },
      surligneColonne: 0,
      formule: "=MOYENNE.SI(A1:A5;\"Oui\";B1:B5)"
    }
  },
  {
    id: 26,
    question: "Quel est le résultat de cette formule =5^2 ?",
    options: ["25", "10", "7", "52"],
    correct: 0,
    difficulty: "débutant",
    category: "Fonctions mathématiques",
    level: "Débutant",
    illustration: { type: "formule", cellule: "A1", formule: "=5^2" }
  },
  {
    id: 27,
    question: "Quel est le résultat de cette formule =RACINE(16) ?",
    options: ["4", "8", "2", "256"],
    correct: 0,
    difficulty: "débutant",
    category: "Fonctions mathématiques",
    level: "Débutant",
    illustration: { type: "formule", cellule: "A1", formule: "=RACINE(16)" }
  },
  {
    id: 28,
    question: "Quel est le résultat de cette formule =ABS(-10) ?",
    options: ["10", "-10", "0", "100"],
    correct: 0,
    difficulty: "débutant",
    category: "Fonctions mathématiques",
    level: "Débutant",
    illustration: { type: "formule", cellule: "A1", formule: "=ABS(-10)" }
  },
  {
    id: 29,
    question: "Quel est le résultat de cette formule =ENT(3,9) ?",
    options: ["3", "4", "3,5", "0"],
    correct: 0,
    difficulty: "débutant",
    category: "Fonctions mathématiques",
    level: "Débutant",
    illustration: { type: "formule", cellule: "A1", formule: "=ENT(3,9)" }
  },
  {
    id: 30,
    question: "Que fait cette formule =SI(A1>10;\"Oui\";\"Non\") ?",
    options: ["Test logique", "Addition", "Moyenne", "Compte"],
    correct: 0,
    difficulty: "débutant",
    category: "Fonctions logiques",
    level: "Débutant",
    illustration: {
      type: "tableau",
      titre: "Fonction SI",
      donnees: { colonnes: ["A"], lignes: [["15"]] },
      formule: "=SI(A1>10;\"Oui\";\"Non\")"
    }
  },
  {
    id: 31,
    question: "Que fait cette formule =ET(A1>0;B1>0) ?",
    options: ["Test logique ET", "Test OU", "Addition", "Moyenne"],
    correct: 0,
    difficulty: "débutant",
    category: "Fonctions logiques",
    level: "Débutant",
    illustration: {
      type: "tableau",
      titre: "Fonction ET",
      donnees: { colonnes: ["A", "B"], lignes: [["5", "10"]] },
      formule: "=ET(A1>0;B1>0)"
    }
  },
  {
    id: 32,
    question: "Que fait cette formule =OU(A1>0;B1>0) ?",
    options: ["Test logique OU", "Test ET", "Addition", "Moyenne"],
    correct: 0,
    difficulty: "débutant",
    category: "Fonctions logiques",
    level: "Débutant",
    illustration: {
      type: "tableau",
      titre: "Fonction OU",
      donnees: { colonnes: ["A", "B"], lignes: [["5", "10"]] },
      formule: "=OU(A1>0;B1>0)"
    }
  },
  {
    id: 33,
    question: "Quel est le résultat de cette formule =SIERREUR(1/0;\"Erreur\") ?",
    options: ["Erreur", "0", "1", "#DIV/0!"],
    correct: 0,
    difficulty: "débutant",
    category: "Fonctions logiques",
    level: "Débutant",
    illustration: { type: "formule", cellule: "A1", formule: "=SIERREUR(1/0;\"Erreur\")" }
  },
  {
    id: 34,
    question: "Que fait cette formule =NOMPROPRE(\"excel\") ?",
    options: ["Met la première lettre en majuscule → Excel", "Met tout en minuscules → excel", "Met tout en majuscules → EXCEL", "Inverse la casse → eXcEl"],
    correct: 0,
    difficulty: "débutant",
    category: "Fonctions texte",
    level: "Débutant",
    illustration: { type: "formule", cellule: "A1", formule: "=NOMPROPRE(\"excel\")" }
  },
  {
    id: 35,
    question: "Quel est le résultat de cette formule =SUPPRESPACE(\"  Excel  \") ?",
    options: [
      "Excel",
      "␣␣Excel␣␣",
      "Excel␣␣",
      "␣␣Excel"
    ],
    correct: 0,
    difficulty: "débutant",
    category: "Fonctions texte",
    level: "Débutant",
    illustration: { type: "formule", cellule: "A1", formule: "=SUPPRESPACE(\"  Excel  \")" }
  },

  // ============================================
  // NIVEAU INTERMÉDIAIRE - 30 questions avec illustrations
  // ============================================
  {
    id: 36,
    question: "Que fait cette fonction RECHERCHEV ?",
    options: ["Recherche verticale", "Recherche horizontale", "Additionne", "Compte"],
    correct: 0,
    difficulty: "intermédiaire",
    category: "Fonctions de recherche",
    level: "Intermédiaire",
    illustration: {
      type: "tableau",
      titre: "RECHERCHEV : Trouver le prix d'un produit",
      donnees: {
        colonnes: ["Produit", "Prix"],
        lignes: [["Pomme", "2"], ["Banane", "3"], ["Orange", "4"]]
      },
      surligneColonne: 0,
      surligneLigne: 1,
      formule: "=RECHERCHEV(\"Banane\";A1:B3;2;FAUX)"
    }
  },
  {
    id: 37,
    question: "Que fait cette fonction RECHERCHEH ?",
    options: ["Recherche horizontale", "Recherche verticale", "Additionne", "Compte"],
    correct: 0,
    difficulty: "intermédiaire",
    category: "Fonctions de recherche",
    level: "Intermédiaire",
    illustration: {
      type: "tableau",
      titre: "RECHERCHEH : Trouver le prix par mois",
      donnees: {
        colonnes: ["Produit", "Janvier", "Février", "Mars"],
        lignes: [["Pomme", "2", "3", "4"], ["Banane", "3", "4", "5"]]
      },
      surligneColonne: 1,
      surligneLigne: 0,
      formule: "=RECHERCHEH(\"Janvier\";A1:D2;2;FAUX)"
    }
  },
  {
    id: 38,
    question: "Que fait cette fonction INDEX ?",
    options: ["Retourne valeur à position", "Recherche", "Additionne", "Compte"],
    correct: 0,
    difficulty: "intermédiaire",
    category: "Fonctions de recherche",
    level: "Intermédiaire",
    illustration: {
      type: "tableau",
      titre: "INDEX : Retourner la 2ème valeur",
      donnees: { colonnes: ["A"], lignes: [["10"], ["20"], ["30"], ["40"]] },
      surligneColonne: 0,
      surligneLigne: 1,
      formule: "=INDEX(A1:A4;2)"
    }
  },
  {
    id: 39,
    question: "Que fait cette fonction EQUIV ?",
    options: ["Position d'une valeur", "Recherche", "Additionne", "Compte"],
    correct: 0,
    difficulty: "intermédiaire",
    category: "Fonctions de recherche",
    level: "Intermédiaire",
    illustration: {
      type: "tableau",
      titre: "EQUIV : Position de la valeur",
      donnees: { colonnes: ["A"], lignes: [["10"], ["20"], ["30"], ["40"]] },
      surligneColonne: 0,
      surligneLigne: 2,
      formule: "=EQUIV(30;A1:A4;0)"
    }
  },
  {
    id: 40,
    question: "Que fait cette combinaison INDEX + EQUIV ?",
    options: ["Recherche flexible", "Recherche simple", "Additionne", "Compte"],
    correct: 0,
    difficulty: "intermédiaire",
    category: "Fonctions de recherche",
    level: "Intermédiaire",
    illustration: {
      type: "tableau",
      titre: "INDEX + EQUIV : Recherche flexible",
      donnees: {
        colonnes: ["Produit", "Prix"],
        lignes: [["Pomme", "2"], ["Banane", "3"], ["Orange", "4"]]
      },
      surligneColonne: 0,
      formule: "=INDEX(B1:B3;EQUIV(\"Banane\";A1:A3;0))"
    }
  },
  {
    id: 41,
    question: "Que fait cette fonction RECHERCHEX ?",
    options: ["Recherche moderne", "Ancienne recherche", "Additionne", "Compte"],
    correct: 0,
    difficulty: "intermédiaire",
    category: "Fonctions de recherche",
    level: "Intermédiaire",
    illustration: {
      type: "tableau",
      titre: "RECHERCHEX",
      donnees: {
        colonnes: ["Produit", "Prix"],
        lignes: [["Pomme", "2"], ["Banane", "3"], ["Orange", "4"]]
      },
      surligneColonne: 0,
      formule: "=RECHERCHEX(\"Banane\";A1:A3;B1:B3)"
    }
  },
  {
    id: 42,
    question: "Que fait cette fonction SI.CONDITIONS ?",
    options: ["Test multiple", "Test simple", "Additionne", "Compte"],
    correct: 0,
    difficulty: "intermédiaire",
    category: "Fonctions logiques",
    level: "Intermédiaire",
    illustration: {
      type: "tableau",
      titre: "SI.CONDITIONS : Test multiple",
      donnees: { colonnes: ["A"], lignes: [["95"]] },
      formule: "=SI.CONDITIONS(A1>90;\"A\";A1>80;\"B\";A1>70;\"C\";VRAI;\"D\")"
    }
  },
  {
    id: 43,
    question: "Que fait cette fonction SOMME.SI.ENS ?",
    options: ["Somme multi-critères", "Somme simple", "Compte", "Moyenne"],
    correct: 0,
    difficulty: "intermédiaire",
    category: "Fonctions conditionnelles",
    level: "Intermédiaire",
    illustration: {
      type: "tableau",
      titre: "SOMME.SI.ENS : Somme multi-critères",
      donnees: {
        colonnes: ["Produit", "Région", "Ventes"],
        lignes: [
          ["Pomme", "Nord", "100"],
          ["Pomme", "Sud", "200"],
          ["Banane", "Nord", "150"],
          ["Pomme", "Nord", "300"]
        ]
      },
      surligneColonne: 2,
      formule: "=SOMME.SI.ENS(C1:C4;A1:A4;\"Pomme\";B1:B4;\"Nord\")"
    }
  },
  {
    id: 44,
    question: "Que fait cette fonction NB.SI.ENS ?",
    options: ["Compte multi-critères", "Compte simple", "Somme", "Moyenne"],
    correct: 0,
    difficulty: "intermédiaire",
    category: "Fonctions conditionnelles",
    level: "Intermédiaire",
    illustration: {
      type: "tableau",
      titre: "NB.SI.ENS : Compte multi-critères",
      donnees: {
        colonnes: ["Produit", "Région"],
        lignes: [["Pomme", "Nord"], ["Pomme", "Sud"], ["Banane", "Nord"], ["Pomme", "Nord"]]
      },
      surligneColonne: 0,
      formule: "=NB.SI.ENS(A1:A4;\"Pomme\";B1:B4;\"Nord\")"
    }
  },
  {
    id: 45,
    question: "Que fait cette fonction SOMMEPROD ?",
    options: ["Somme des produits", "Somme simple", "Produit", "Moyenne pondérée"],
    correct: 0,
    difficulty: "intermédiaire",
    category: "Fonctions avancées",
    level: "Intermédiaire",
    illustration: {
      type: "tableau",
      titre: "SOMMEPROD : Somme des produits",
      donnees: {
        colonnes: ["Quantité", "Prix"],
        lignes: [["10", "5"], ["20", "3"], ["5", "10"]]
      },
      surligneColonne: 0,
      formule: "=SOMMEPROD(A1:A3;B1:B3)"
    }
  },
  {
    id: 46,
    question: "Que fait cette fonction TABLEAU CROISÉ DYNAMIQUE ?",
    options: ["Analyse dynamique", "Simple somme", "Compte", "Moyenne"],
    correct: 0,
    difficulty: "intermédiaire",
    category: "Tableaux croisés",
    level: "Intermédiaire",
    illustration: {
      type: "tableau",
      titre: "TCD : Somme des ventes par région",
      donnees: {
        colonnes: ["Région", "Total Ventes"],
        lignes: [["Nord", "5000"], ["Sud", "3000"], ["Est", "2000"]]
      }
    }
  },
  {
    id: 47,
    question: "Que fait cette mise en forme conditionnelle ?",
    options: ["Colorer les cellules", "Trier", "Filtrer", "Compter"],
    correct: 0,
    difficulty: "intermédiaire",
    category: "Mise en forme",
    level: "Intermédiaire",
    illustration: {
      type: "tableau",
      titre: "Barres de données",
      donnees: {
        colonnes: ["Valeur", "Barre"],
        lignes: [["100", "██████████"], ["50", "█████"], ["25", "██"]]
      },
      surligneColonne: 1
    }
  },
  {
    id: 48,
    question: "Que fait cette fonction VALIDATION DES DONNÉES ?",
    options: ["Limiter les saisies", "Vérifier", "Trier", "Filtrer"],
    correct: 0,
    difficulty: "intermédiaire",
    category: "Validation",
    level: "Intermédiaire",
    illustration: {
      type: "tableau",
      titre: "Liste déroulante",
      donnees: { colonnes: ["Choix"], lignes: [["Pomme"], ["Banane"], ["Orange"]] },
      surligneColonne: 0,
      conditionAffichee: "Seules ces 3 valeurs sont autorisées"
    }
  },
  {
    id: 49,
    question: "Que fait cette fonction de filtre avancé ?",
    options: ["Filtrer selon plusieurs critères", "Trier", "Compter", "Additionner"],
    correct: 0,
    difficulty: "intermédiaire",
    category: "Filtres",
    level: "Intermédiaire",
    illustration: {
      type: "tableau",
      titre: "Filtre avancé",
      donnees: {
        colonnes: ["Produit", "Région", "Ventes"],
        lignes: [["Pomme", "Nord", "100"], ["Banane", "Sud", "200"], ["Pomme", "Sud", "150"]]
      },
      surligneColonne: 1,
      conditionAffichee: "Nord OU Sud"
    }
  },
  {
    id: 50,
    question: "Que fait cette liaison entre feuilles ?",
    options: ["Référence à une autre feuille", "Copie", "Suppression", "Calcul"],
    correct: 0,
    difficulty: "intermédiaire",
    category: "Liaisons",
    level: "Intermédiaire",
    illustration: { type: "formule", cellule: "Feuil2!A1", formule: "=Feuil1!A1" }
  },
  {
    id: 51,
    question: "Que fait cette fonction de sous-total ?",
    options: ["Total partiel", "Total général", "Moyenne", "Compte"],
    correct: 0,
    difficulty: "intermédiaire",
    category: "Sous-totaux",
    level: "Intermédiaire",
    illustration: {
      type: "tableau",
      titre: "Sous-totaux",
      donnees: {
        colonnes: ["Produit", "Ventes"],
        lignes: [["Pomme", "100"], ["Banane", "150"], ["Sous-total", "250"]]
      }
    }
  },
  {
    id: 52,
    question: "Que fait cette fonction CONSOLIDATION ?",
    options: ["Combiner plusieurs feuilles", "Trier", "Filtrer", "Compter"],
    correct: 0,
    difficulty: "intermédiaire",
    category: "Consolidation",
    level: "Intermédiaire",
    illustration: {
      type: "tableau",
      titre: "Consolidation de 3 feuilles",
      donnees: {
        colonnes: ["Feuille", "Total"],
        lignes: [["Janvier", "1000"], ["Février", "1500"], ["Mars", "2000"], ["Consolidé", "4500"]]
      }
    }
  },
  {
    id: 53,
    question: "Que fait cette fonction GRAPHIQUE CROISÉ DYNAMIQUE ?",
    options: ["Graphique dynamique", "Graphique simple", "Tableau", "Formule"],
    correct: 0,
    difficulty: "intermédiaire",
    category: "Graphiques",
    level: "Intermédiaire",
    illustration: {
      type: "tableau",
      titre: "Graphique croisé dynamique",
      donnees: {
        colonnes: ["Région", "Ventes"],
        lignes: [["Nord", "5000"], ["Sud", "3000"], ["Est", "2000"]]
      },
      graphiqueType: "barres"
    }
  },
  {
    id: 54,
    question: "Que fait cette fonction DECALER ?",
    options: ["Décale une plage", "Trie", "Filtre", "Compte"],
    correct: 0,
    difficulty: "intermédiaire",
    category: "Fonctions de référence",
    level: "Intermédiaire",
    illustration: {
      type: "tableau",
      titre: "DECALER",
      donnees: { colonnes: ["A"], lignes: [["10"], ["20"], ["30"]] },
      formule: "=DECALER(A1;1;0)"
    }
  },
  {
    id: 55,
    question: "Que fait cette fonction CHOISIR ?",
    options: ["Retourne une valeur", "Trie", "Filtre", "Compte"],
    correct: 0,
    difficulty: "intermédiaire",
    category: "Fonctions de référence",
    level: "Intermédiaire",
    illustration: { type: "formule", cellule: "A1", formule: "=CHOISIR(2;\"Pomme\";\"Banane\";\"Orange\")" }
  },
  {
    id: 56,
    question: "Que fait cette fonction TRANSPOSE ?",
    options: ["Transpose une plage", "Trie", "Filtre", "Compte"],
    correct: 0,
    difficulty: "intermédiaire",
    category: "Fonctions de manipulation",
    level: "Intermédiaire",
    illustration: {
      type: "tableau",
      titre: "TRANSPOSE",
      donnees: { colonnes: ["A", "B"], lignes: [["1", "2"], ["3", "4"]] },
      formule: "=TRANSPOSE(A1:B2)"
    }
  },
  {
    id: 57,
    question: "Que fait cette fonction FILTRE ?",
    options: ["Filtre dynamiquement", "Trie", "Compte", "Additionne"],
    correct: 0,
    difficulty: "intermédiaire",
    category: "Fonctions dynamiques",
    level: "Intermédiaire",
    illustration: {
      type: "tableau",
      titre: "FILTRE dynamique",
      donnees: {
        colonnes: ["Produit", "Ventes"],
        lignes: [["Pomme", "150"], ["Banane", "80"], ["Orange", "200"]]
      },
      formule: "=FILTRE(A1:B5;B1:B5>100)"
    }
  },
  {
    id: 58,
    question: "Que fait cette fonction UNIQUE ?",
    options: ["Valeurs uniques", "Trie", "Filtre", "Compte"],
    correct: 0,
    difficulty: "intermédiaire",
    category: "Fonctions dynamiques",
    level: "Intermédiaire",
    illustration: {
      type: "tableau",
      titre: "UNIQUE",
      donnees: {
        colonnes: ["A"],
        lignes: [["Pomme"], ["Banane"], ["Pomme"], ["Orange"], ["Banane"]]
      },
      formule: "=UNIQUE(A1:A5)"
    }
  },
  {
    id: 59,
    question: "Que fait cette fonction TRIER ?",
    options: ["Trie dynamiquement", "Filtre", "Compte", "Additionne"],
    correct: 0,
    difficulty: "intermédiaire",
    category: "Fonctions dynamiques",
    level: "Intermédiaire",
    illustration: {
      type: "tableau",
      titre: "TRIER",
      donnees: { colonnes: ["A"], lignes: [["30"], ["10"], ["50"], ["20"]] },
      formule: "=TRIER(A1:A4)"
    }
  },
  {
    id: 60,
    question: "Que fait cette fonction LET ?",
    options: ["Déclare des variables", "Boucle", "Condition", "Additionne"],
    correct: 0,
    difficulty: "intermédiaire",
    category: "Fonctions avancées",
    level: "Intermédiaire",
    illustration: { type: "formule", cellule: "A1", formule: "=LET(x;5;y;10;x+y)" }
  },
  {
    id: 61,
    question: "Que fait cette fonction SIERREUR ?",
    options: ["Gère les erreurs", "Test logique", "Additionne", "Compte"],
    correct: 0,
    difficulty: "intermédiaire",
    category: "Fonctions logiques",
    level: "Intermédiaire",
    illustration: { type: "formule", cellule: "A1", formule: "=SIERREUR(1/0;\"Erreur\")" }
  },
  {
    id: 62,
    question: "Que fait cette fonction DATEDIF ?",
    options: ["Différence entre dates", "Additionne", "Formate", "Compte"],
    correct: 0,
    difficulty: "intermédiaire",
    category: "Fonctions date",
    level: "Intermédiaire",
    illustration: {
      type: "tableau",
      titre: "DATEDIF",
      donnees: { colonnes: ["Début", "Fin"], lignes: [["01/01/2024", "31/01/2024"]] },
      formule: "=DATEDIF(A1;B1;\"d\")"
    }
  },
  {
    id: 63,
    question: "Que fait cette fonction JOURSEM ?",
    options: ["Jour de la semaine", "Compte les jours", "Additionne", "Formate"],
    correct: 0,
    difficulty: "intermédiaire",
    category: "Fonctions date",
    level: "Intermédiaire",
    illustration: {
      type: "tableau",
      titre: "JOURSEM",
      donnees: { colonnes: ["Date"], lignes: [["17/09/2026"]] },
      formule: "=JOURSEM(A1)"
    }
  },
  {
    id: 64,
    question: "Que fait cette fonction de plage nommée ?",
    options: ["Nommer une plage", "Trier", "Filtrer", "Compter"],
    correct: 0,
    difficulty: "intermédiaire",
    category: "Plages nommées",
    level: "Intermédiaire",
    illustration: {
      type: "tableau",
      titre: "Plage nommée Ventes",
      donnees: { colonnes: ["Ventes"], lignes: [["1000"], ["2000"], ["3000"], ["4000"]] },
      formule: "=SOMME(Ventes)"
    }
  },
  {
    id: 65,
    question: "Que fait cette fonction INDIRECT ?",
    options: ["Référence via texte", "Additionne", "Compte", "Recherche"],
    correct: 0,
    difficulty: "intermédiaire",
    category: "Fonctions de référence",
    level: "Intermédiaire",
    illustration: { type: "formule", cellule: "A1", formule: "=INDIRECT(\"B\"&1)" }
  },

  // ============================================
  // NIVEAU AVANCÉ - 30 questions avec illustrations
  // ============================================
  {
    id: 66,
    question: "Que fait cette macro VBA ?",
    options: ["Affiche un message", "Additionne", "Compte", "Trie"],
    correct: 0,
    difficulty: "avancé",
    category: "Macros VBA",
    level: "Avancé",
    illustration: {
      type: "code",
      titre: "Macro VBA",
      code: "Sub MaMacro()\n  MsgBox \"Bonjour !\"\nEnd Sub",
      resultat: "Affiche une boîte de dialogue"
    }
  },
  {
    id: 67,
    question: "Que fait cette fonction SOMMEPROD avancée ?",
    options: ["Somme des produits", "Somme simple", "Produit", "Moyenne"],
    correct: 0,
    difficulty: "avancé",
    category: "Fonctions avancées",
    level: "Avancé",
    illustration: {
      type: "tableau",
      titre: "SOMMEPROD conditionnel",
      donnees: {
        colonnes: ["Produit", "Ventes"],
        lignes: [["Pomme", "100"], ["Banane", "200"], ["Pomme", "150"], ["Pomme", "250"]]
      },
      formule: "=SOMMEPROD((A1:A10=\"Pomme\")*(B1:B10))"
    }
  },
  {
    id: 68,
    question: "Que fait cette fonction LAMBDA ?",
    options: ["Fonction personnalisée", "Boucle", "Condition", "Additionne"],
    correct: 0,
    difficulty: "avancé",
    category: "Fonctions avancées",
    level: "Avancé",
    illustration: { type: "formule", cellule: "A1", formule: "=LAMBDA(x;y;x+y)(5;10)" }
  },
  {
    id: 69,
    question: "Que fait cette fonction MAP ?",
    options: ["Applique fonction à chaque élément", "Trie", "Filtre", "Additionne"],
    correct: 0,
    difficulty: "avancé",
    category: "Fonctions de tableau",
    level: "Avancé",
    illustration: {
      type: "tableau",
      titre: "MAP : appliquer x*2",
      donnees: { colonnes: ["A"], lignes: [["5"], ["10"], ["15"], ["20"], ["25"]] },
      formule: "=MAP(A1:A5;LAMBDA(x;x*2))"
    }
  },
  {
    id: 70,
    question: "Que fait cette fonction REDUCE ?",
    options: ["Réduit un tableau", "Trie", "Filtre", "Additionne"],
    correct: 0,
    difficulty: "avancé",
    category: "Fonctions de tableau",
    level: "Avancé",
    illustration: {
      type: "tableau",
      titre: "REDUCE : accumulation",
      donnees: { colonnes: ["A"], lignes: [["10"], ["20"], ["30"], ["40"], ["50"]] },
      formule: "=REDUCE(0;A1:A5;LAMBDA(a;b;a+b))"
    }
  },
  {
    id: 71,
    question: "Que fait cette fonction SEQ ?",
    options: ["Génère séquence", "Trie", "Filtre", "Additionne"],
    correct: 0,
    difficulty: "avancé",
    category: "Fonctions de tableau",
    level: "Avancé",
    illustration: { type: "formule", cellule: "A1", formule: "=SEQ(5)" }
  },
  {
    id: 72,
    question: "Que fait cette fonction de tableau dynamique ?",
    options: ["S'étend automatiquement", "Reste fixe", "Trie", "Filtre"],
    correct: 0,
    difficulty: "avancé",
    category: "Tableaux dynamiques",
    level: "Avancé",
    illustration: {
      type: "tableau",
      titre: "UNIQUE : valeurs distinctes",
      donnees: {
        colonnes: ["A"],
        lignes: [["Pomme"], ["Banane"], ["Pomme"], ["Orange"], ["Banane"]]
      },
      formule: "=UNIQUE(A1:A100)"
    }
  },
  {
    id: 73,
    question: "Que fait cette fonction Power Query ?",
    options: ["Transforme des données", "Graphique", "Tableau", "Formule"],
    correct: 0,
    difficulty: "avancé",
    category: "Power Query",
    level: "Avancé",
    illustration: {
      type: "tableau",
      titre: "Power Query : Transformation",
      donnees: {
        colonnes: ["Source", "Transformé"],
        lignes: [["Date (texte)", "Date (date)"], ["Prix (texte)", "Prix (nombre)"]]
      }
    }
  },
  {
    id: 74,
    question: "Que fait cette fonction Power Pivot ?",
    options: ["Modélisation", "Graphique", "Tableau", "Formule"],
    correct: 0,
    difficulty: "avancé",
    category: "Power Pivot",
    level: "Avancé",
    illustration: {
      type: "tableau",
      titre: "Power Pivot : Mesure DAX",
      donnees: {
        colonnes: ["Année", "Ventes"],
        lignes: [["2024", "10000"], ["2025", "15000"], ["Total", "25000"]]
      }
    }
  },
  {
    id: 75,
    question: "Que fait cette fonction d'optimisation ?",
    options: ["Utiliser formules efficaces", "Formules lentes", "Formules complexes", "Formules simples"],
    correct: 0,
    difficulty: "avancé",
    category: "Performance",
    level: "Avancé",
    illustration: {
      type: "tableau",
      titre: "Optimisation",
      donnees: {
        colonnes: ["Type", "Performance"],
        lignes: [["INDEX/EQUIV", "★★★★★"], ["RECHERCHEV", "★★★"], ["DECALER", "★★"]]
      }
    }
  },
  {
    id: 76,
    question: "Que fait cette fonction DATEDIF avancée ?",
    options: ["Différence entre dates", "Additionne", "Formate", "Compte"],
    correct: 0,
    difficulty: "avancé",
    category: "Fonctions date",
    level: "Avancé",
    illustration: {
      type: "tableau",
      titre: "DATEDIF : années et mois",
      donnees: { colonnes: ["Début", "Fin"], lignes: [["01/01/2024", "01/07/2026"]] },
      formule: "=DATEDIF(A1;B1;\"y\")&\"/\"&DATEDIF(A1;B1;\"ym\")"
    }
  },
  {
    id: 77,
    question: "Que fait cette fonction ESTERREUR ?",
    options: ["Vérifie erreur", "Vérifie vide", "Vérifie nombre", "Vérifie texte"],
    correct: 0,
    difficulty: "avancé",
    category: "Fonctions d'information",
    level: "Avancé",
    illustration: { type: "formule", cellule: "A1", formule: "=ESTERREUR(1/0)" }
  },
  {
    id: 78,
    question: "Que fait cette fonction de graphique VBA ?",
    options: ["Graphique dynamique", "Graphique fixe", "Tableau", "Formule"],
    correct: 0,
    difficulty: "avancé",
    category: "VBA Graphiques",
    level: "Avancé",
    illustration: {
      type: "code",
      titre: "VBA : Créer un graphique",
      code: "Sub CreerGraphique()\n  Charts.Add\n  ActiveChart.ChartType = xlColumnClustered\nEnd Sub",
      resultat: "Crée un graphique en colonnes"
    }
  },
  {
    id: 79,
    question: "Que fait cette fonction d'import JSON ?",
    options: ["Importe JSON", "Importe CSV", "Importe XML", "Importe TXT"],
    correct: 0,
    difficulty: "avancé",
    category: "Import",
    level: "Avancé",
    illustration: {
      type: "code",
      titre: "Import JSON",
      code: "{\n  \"produits\": [\n    {\"nom\": \"Pomme\", \"prix\": 2}\n  ]\n}",
      resultat: "Structure de données JSON"
    }
  },
  {
    id: 80,
    question: "Que fait cette fonction de requête web ?",
    options: ["Importe données web", "Trie", "Filtre", "Compter"],
    correct: 0,
    difficulty: "avancé",
    category: "Web",
    level: "Avancé",
    illustration: { type: "formule", cellule: "A1", formule: "Données > À partir du web" }
  },
  {
    id: 81,
    question: "Que fait cette fonction de classeur partagé ?",
    options: ["Accessible par plusieurs", "Accessible par un", "Lecture seule", "Protégé"],
    correct: 0,
    difficulty: "avancé",
    category: "Collaboration",
    level: "Avancé",
    illustration: {
      type: "tableau",
      titre: "Classeur partagé",
      donnees: {
        colonnes: ["Utilisateur", "Action"],
        lignes: [["Alice", "Édition"], ["Bob", "Lecture"], ["Charlie", "Édition"]]
      }
    }
  },
  {
    id: 82,
    question: "Que fait cette fonction DECALER avancée ?",
    options: ["Décale plage", "Trie", "Filtre", "Compte"],
    correct: 0,
    difficulty: "avancé",
    category: "Fonctions de référence",
    level: "Avancé",
    illustration: {
      type: "tableau",
      titre: "DECALER : plage dynamique",
      donnees: { colonnes: ["A"], lignes: [["10"], ["20"], ["30"], ["40"], ["50"]] },
      formule: "=SOMME(DECALER(A1;0;0;5;1))"
    }
  },
  {
    id: 83,
    question: "Que fait cette fonction d'API Excel ?",
    options: ["Utilise Office.js", "Utilise Python", "Utilise VBA", "Utilise C++"],
    correct: 0,
    difficulty: "avancé",
    category: "API",
    level: "Avancé",
    illustration: {
      type: "code",
      titre: "Office.js",
      code: "Excel.run(function(context) {\n  const sheet = context.workbook.worksheets.getActiveWorksheet();\n  sheet.getRange(\"A1\").values = [[\"Hello\"]];\n  return context.sync();\n});",
      resultat: "Écrit \"Hello\" dans A1"
    }
  },
  {
    id: 84,
    question: "Que fait cette fonction de classeur VBA ?",
    options: ["Gère classeur", "Gère feuille", "Gère cellule", "Gère plage"],
    correct: 0,
    difficulty: "avancé",
    category: "VBA",
    level: "Avancé",
    illustration: {
      type: "code",
      titre: "VBA : Ouvrir un classeur",
      code: "Sub OuvrirClasseur()\n  Workbooks.Open \"C:\\fichier.xlsx\"\nEnd Sub",
      resultat: "Ouvre le classeur spécifié"
    }
  },
  {
    id: 85,
    question: "Que fait cette fonction de tableau croisé avancé ?",
    options: ["Segments", "Filtres simples", "Tri", "Compter"],
    correct: 0,
    difficulty: "avancé",
    category: "Tableaux croisés",
    level: "Avancé",
    illustration: {
      type: "tableau",
      titre: "TCD avec segments",
      donnees: {
        colonnes: ["Région", "Ventes"],
        lignes: [["Nord", "5000"], ["Sud", "3000"], ["Est", "2000"]]
      },
      segments: ["Année: 2024", "Région: Nord"]
    }
  },
  {
    id: 86,
    question: "Que fait cette fonction de chronologie ?",
    options: ["Filtre par date", "Filtre par texte", "Filtre par nombre", "Filtre par couleur"],
    correct: 0,
    difficulty: "avancé",
    category: "Tableaux croisés",
    level: "Avancé",
    illustration: {
      type: "tableau",
      titre: "Chronologie TCD",
      donnees: {
        colonnes: ["Date", "Ventes"],
        lignes: [["Jan 2024", "1000"], ["Fév 2024", "1200"], ["Mar 2024", "1500"]]
      }
    }
  },
  {
    id: 87,
    question: "Que fait cette fonction de corrélation ?",
    options: ["Calcule corrélation", "Additionne", "Compte", "Trie"],
    correct: 0,
    difficulty: "avancé",
    category: "Statistiques",
    level: "Avancé",
    illustration: {
      type: "tableau",
      titre: "COEFFICIENT.CORRELATION",
      donnees: {
        colonnes: ["X", "Y"],
        lignes: [["10", "20"], ["20", "40"], ["30", "60"]]
      },
      formule: "=COEFFICIENT.CORRELATION(A1:A10;B1:B10)"
    }
  },
  {
    id: 88,
    question: "Que fait cette fonction de prévision ?",
    options: ["Prévision linéaire", "Additionne", "Compte", "Trie"],
    correct: 0,
    difficulty: "avancé",
    category: "Statistiques",
    level: "Avancé",
    illustration: {
      type: "tableau",
      titre: "PREVISION.LINEAIRE",
      donnees: {
        colonnes: ["X", "Y"],
        lignes: [["1", "100"], ["2", "200"], ["3", "300"]]
      },
      formule: "=PREVISION.LINEAIRE(11;A1:A10;B1:B10)"
    }
  },
  {
    id: 89,
    question: "Que fait cette fonction de tableau de bord ?",
    options: ["Crée un dashboard", "Additionne", "Compte", "Trie"],
    correct: 0,
    difficulty: "avancé",
    category: "Business Intelligence",
    level: "Avancé",
    illustration: {
      type: "tableau",
      titre: "Tableau de bord",
      donnees: {
        colonnes: ["KPI", "Valeur"],
        lignes: [["Ventes", "10000"], ["Objectif", "12000"], ["Réalisation", "83%"]]
      }
    }
  },
  {
    id: 90,
    question: "Que fait cette fonction de mise en forme avancée ?",
    options: ["Barres de données", "Tri", "Filtre", "Compte"],
    correct: 0,
    difficulty: "avancé",
    category: "Mise en forme",
    level: "Avancé",
    illustration: {
      type: "tableau",
      titre: "Barres de données avancées",
      donnees: {
        colonnes: ["Valeur", "Barre"],
        lignes: [["100", "██████████"], ["75", "███████"], ["50", "█████"]]
      }
    }
  },
  {
    id: 91,
    question: "Que fait cette fonction de validation avancée ?",
    options: ["Liste déroulante dynamique", "Liste statique", "Tri", "Filtre"],
    correct: 0,
    difficulty: "avancé",
    category: "Validation",
    level: "Avancé",
    illustration: { type: "formule", cellule: "A1", formule: "=INDIRECT(\"Liste\"&B1)" }
  },
  {
    id: 92,
    question: "Que fait cette fonction de tri personnalisé ?",
    options: ["Tri personnalisé", "Tri simple", "Filtre", "Compte"],
    correct: 0,
    difficulty: "avancé",
    category: "Tri",
    level: "Avancé",
    illustration: {
      type: "tableau",
      titre: "Tri personnalisé",
      donnees: {
        colonnes: ["Priorité", "Tâche"],
        lignes: [["Haute", "Tâche A"], ["Moyenne", "Tâche B"], ["Basse", "Tâche C"]]
      },
      triAffiche: "Haute > Moyenne > Basse"
    }
  },
  {
    id: 93,
    question: "Que fait cette fonction de filtre multicritère ?",
    options: ["Filtre multi-critères", "Filtre simple", "Tri", "Compte"],
    correct: 0,
    difficulty: "avancé",
    category: "Filtres",
    level: "Avancé",
    illustration: {
      type: "tableau",
      titre: "Filtre multicritère",
      donnees: {
        colonnes: ["Produit", "Région", "Ventes"],
        lignes: [["Pomme", "Nord", "100"], ["Banane", "Sud", "200"], ["Pomme", "Sud", "150"]]
      },
      conditionAffichee: "Pomme ET Nord"
    }
  },
  {
    id: 94,
    question: "Que fait cette fonction de graphique combiné ?",
    options: ["Combine 2 types", "1 type", "Tableau", "Formule"],
    correct: 0,
    difficulty: "avancé",
    category: "Graphiques",
    level: "Avancé",
    illustration: {
      type: "tableau",
      titre: "Graphique combiné",
      donnees: {
        colonnes: ["Mois", "Ventes", "Objectif"],
        lignes: [["Jan", "1000", "1200"], ["Fév", "1500", "1200"], ["Mar", "1800", "1200"]]
      },
      graphiqueType: "combine"
    }
  },
  {
    id: 95,
    question: "Quelle est la meilleure façon d'apprendre VBA ?",
    options: ["Formation structurée", "Vidéos YouTube", "Documentation", "Copier macros"],
    correct: 0,
    difficulty: "avancé",
    category: "Conseil",
    level: "Avancé",
    illustration: {
      type: "tableau",
      titre: "Comparatif",
      donnees: {
        colonnes: ["Méthode", "Efficacité"],
        lignes: [["Formation", "★★★★★"], ["YouTube", "★★★"], ["Doc", "★★"]]
      }
    }
  }
];

// ============================================
// CONFIGURATION
// ============================================
export const excelAvanceConfig = {
  testName: "Excel Avancé",
  testIcon: "📊",
  testDescription: "Test de niveau Excel - Adapté à votre formation",
  totalQuestions: 95,
  defaultQuestionsCount: 15,
  defaultDuration: 12,
  passingScore: 60
};

export default excelAvanceQuestions;