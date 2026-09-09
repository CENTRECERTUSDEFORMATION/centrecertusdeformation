// src/data/tests/excelAvanceQuestions.js

export const excelAvanceQuestions = [
  // ============================================
  // NIVEAU DÉBUTANT - 30 questions
  // ============================================
  {
    id: 1,
    question: "Quelle est la fonction pour additionner une plage de cellules ?",
    options: ["=ADDITION", "=SOMME", "=TOTAL", "=PLUS"],
    correct: 1,
    difficulty: "débutant",
    category: "Fonctions de base",
    level: "Débutant"
  },
  {
    id: 2,
    question: "Comment créer un graphique dans Excel ?",
    options: [
      "Insertion > Graphique",
      "Données > Graphique",
      "Formules > Graphique",
      "Affichage > Graphique"
    ],
    correct: 0,
    difficulty: "débutant",
    category: "Graphiques",
    level: "Débutant"
  },
  {
    id: 3,
    question: "Quelle est la référence absolue d'une cellule ?",
    options: ["A1", "$A$1", "A$1", "$A1"],
    correct: 1,
    difficulty: "débutant",
    category: "Références",
    level: "Débutant"
  },
  {
    id: 4,
    question: "La fonction RECHERCHEV permet de :",
    options: [
      "Rechercher verticalement une valeur",
      "Rechercher horizontalement une valeur",
      "Additionner des valeurs",
      "Moyenne des valeurs"
    ],
    correct: 0,
    difficulty: "débutant",
    category: "Fonctions de recherche",
    level: "Débutant"
  },
  {
    id: 5,
    question: "Quel symbole permet de créer une référence absolue ?",
    options: ["#", "$", "&", "@"],
    correct: 1,
    difficulty: "débutant",
    category: "Références",
    level: "Débutant"
  },
  {
    id: 6,
    question: "Comment sélectionner une colonne entière ?",
    options: [
      "Cliquer sur la lettre de la colonne",
      "Ctrl + A",
      "Shift + Espace",
      "Ctrl + Espace"
    ],
    correct: 0,
    difficulty: "débutant",
    category: "Sélection",
    level: "Débutant"
  },
  {
    id: 7,
    question: "Que signifie le format 'Général' dans Excel ?",
    options: [
      "Affiche les nombres sans format spécifique",
      "Affiche les dates",
      "Affiche les pourcentages",
      "Affiche la monnaie"
    ],
    correct: 0,
    difficulty: "débutant",
    category: "Formatage",
    level: "Débutant"
  },
  {
    id: 8,
    question: "Comment copier une formule vers le bas ?",
    options: [
      "Double-cliquer sur la poignée de recopie",
      "Ctrl + C / Ctrl + V",
      "Drag and drop",
      "Menu Édition > Copier"
    ],
    correct: 0,
    difficulty: "débutant",
    category: "Formules",
    level: "Débutant"
  },
  {
    id: 9,
    question: "Quelle est la fonction pour calculer la moyenne d'une plage ?",
    options: ["=MOYENNE", "=AVERAGE", "=MOY", "=MEDIA"],
    correct: 0,
    difficulty: "débutant",
    category: "Fonctions statistiques",
    level: "Débutant"
  },
  {
    id: 10,
    question: "Comment insérer une nouvelle ligne dans Excel ?",
    options: [
      "Clic droit > Insérer > Ligne de la feuille",
      "Insertion > Ligne",
      "Ctrl + +",
      "Toutes ces réponses"
    ],
    correct: 3,
    difficulty: "débutant",
    category: "Manipulation",
    level: "Débutant"
  },
  {
    id: 11,
    question: "Que permet la fonction NB ?",
    options: [
      "Compter les cellules non vides",
      "Compter les nombres",
      "Compter les cellules vides",
      "Compter toutes les cellules"
    ],
    correct: 1,
    difficulty: "débutant",
    category: "Fonctions statistiques",
    level: "Débutant"
  },
  {
    id: 12,
    question: "Comment changer la largeur d'une colonne ?",
    options: [
      "Double-cliquer sur le séparateur de colonne",
      "Format > Largeur de colonne",
      "Glisser le séparateur",
      "Toutes ces réponses"
    ],
    correct: 3,
    difficulty: "débutant",
    category: "Formatage",
    level: "Débutant"
  },
  {
    id: 13,
    question: "Que signifie l'erreur #DIV/0! ?",
    options: [
      "Division par zéro",
      "Valeur non trouvée",
      "Référence circulaire",
      "Format incorrect"
    ],
    correct: 0,
    difficulty: "débutant",
    category: "Erreurs",
    level: "Débutant"
  },
  {
    id: 14,
    question: "Comment figer une ligne dans Excel ?",
    options: [
      "Affichage > Figer les volets",
      "Insertion > Figer",
      "Format > Figer",
      "Données > Figer"
    ],
    correct: 0,
    difficulty: "débutant",
    category: "Affichage",
    level: "Débutant"
  },
  {
    id: 15,
    question: "Quelle est la fonction pour trouver une valeur maximale ?",
    options: ["=MAX", "=MIN", "=GRAND", "=PLUS"],
    correct: 0,
    difficulty: "débutant",
    category: "Fonctions statistiques",
    level: "Débutant"
  },
  {
    id: 16,
    question: "Comment trier des données par ordre croissant ?",
    options: [
      "Données > Trier > Croissant",
      "Accueil > Trier",
      "Insertion > Trier",
      "Affichage > Trier"
    ],
    correct: 0,
    difficulty: "débutant",
    category: "Tri",
    level: "Débutant"
  },
  {
    id: 17,
    question: "Que signifie l'erreur #N/A ?",
    options: [
      "Valeur non disponible",
      "Nom incorrect",
      "Division par zéro",
      "Référence invalide"
    ],
    correct: 0,
    difficulty: "débutant",
    category: "Erreurs",
    level: "Débutant"
  },
  {
    id: 18,
    question: "Comment fusionner des cellules ?",
    options: [
      "Accueil > Fusionner et centrer",
      "Insertion > Fusionner",
      "Données > Fusionner",
      "Format > Fusionner"
    ],
    correct: 0,
    difficulty: "débutant",
    category: "Formatage",
    level: "Débutant"
  },
  {
    id: 19,
    question: "Quelle est la fonction pour trouver une valeur minimale ?",
    options: ["=MIN", "=MAX", "=PETIT", "=MOINS"],
    correct: 0,
    difficulty: "débutant",
    category: "Fonctions statistiques",
    level: "Débutant"
  },
  {
    id: 20,
    question: "Comment masquer une colonne ?",
    options: [
      "Clic droit > Masquer",
      "Affichage > Masquer",
      "Format > Masquer",
      "Données > Masquer"
    ],
    correct: 0,
    difficulty: "débutant",
    category: "Affichage",
    level: "Débutant"
  },
  {
    id: 21,
    question: "Que permet la fonction NBVAL ?",
    options: [
      "Compter les cellules non vides",
      "Compter les nombres",
      "Compter les cellules vides",
      "Compter toutes les cellules"
    ],
    correct: 0,
    difficulty: "débutant",
    category: "Fonctions statistiques",
    level: "Débutant"
  },
  {
    id: 22,
    question: "Comment imprimer une feuille Excel ?",
    options: [
      "Fichier > Imprimer",
      "Accueil > Imprimer",
      "Insertion > Imprimer",
      "Affichage > Imprimer"
    ],
    correct: 0,
    difficulty: "débutant",
    category: "Impression",
    level: "Débutant"
  },
  {
    id: 23,
    question: "Que signifie l'erreur #VALEUR! ?",
    options: [
      "Type de valeur incorrect",
      "Valeur non trouvée",
      "Division par zéro",
      "Référence invalide"
    ],
    correct: 0,
    difficulty: "débutant",
    category: "Erreurs",
    level: "Débutant"
  },
  {
    id: 24,
    question: "Comment ajouter un filtre à une colonne ?",
    options: [
      "Données > Filtre",
      "Accueil > Filtre",
      "Insertion > Filtre",
      "Affichage > Filtre"
    ],
    correct: 0,
    difficulty: "débutant",
    category: "Filtres",
    level: "Débutant"
  },
  {
    id: 25,
    question: "Quelle est la fonction pour arrondir à l'entier supérieur ?",
    options: ["=ARRONDI.SUP", "=ARRONDI.INF", "=ARRONDI", "=ENTIER.SUP"],
    correct: 0,
    difficulty: "débutant",
    category: "Fonctions mathématiques",
    level: "Débutant"
  },
  {
    id: 26,
    question: "Comment renommer une feuille ?",
    options: [
      "Double-cliquer sur l'onglet",
      "Clic droit > Renommer",
      "Format > Renommer",
      "Les deux premières réponses"
    ],
    correct: 3,
    difficulty: "débutant",
    category: "Feuilles",
    level: "Débutant"
  },
  {
    id: 27,
    question: "Que permet la fonction AUJOURDHUI() ?",
    options: [
      "Afficher la date du jour",
      "Afficher l'heure",
      "Afficher le jour de la semaine",
      "Afficher le mois"
    ],
    correct: 0,
    difficulty: "débutant",
    category: "Fonctions date",
    level: "Débutant"
  },
  {
    id: 28,
    question: "Comment copier une mise en forme ?",
    options: [
      "Accueil > Reproduire la mise en forme",
      "Format > Copier",
      "Clic droit > Copier",
      "Ctrl + C"
    ],
    correct: 0,
    difficulty: "débutant",
    category: "Mise en forme",
    level: "Débutant"
  },
  {
    id: 29,
    question: "Que signifie l'erreur #NOM? ?",
    options: [
      "Nom de fonction incorrect",
      "Valeur non trouvée",
      "Division par zéro",
      "Référence invalide"
    ],
    correct: 0,
    difficulty: "débutant",
    category: "Erreurs",
    level: "Débutant"
  },
  {
    id: 30,
    question: "Comment protéger une cellule ?",
    options: [
      "Format > Protéger la cellule",
      "Révision > Protéger la feuille",
      "Données > Protéger",
      "Insertion > Protéger"
    ],
    correct: 1,
    difficulty: "débutant",
    category: "Sécurité",
    level: "Débutant"
  },

  // ============================================
  // NIVEAU INTERMÉDIAIRE - 30 questions
  // ============================================
  {
    id: 31,
    question: "La fonction SI permet de :",
    options: [
      "Faire une addition conditionnelle",
      "Faire un test logique",
      "Faire une multiplication",
      "Faire une division"
    ],
    correct: 1,
    difficulty: "intermédiaire",
    category: "Fonctions logiques",
    level: "Intermédiaire"
  },
  {
    id: 32,
    question: "Quelle fonction permet de compter le nombre de cellules non vides ?",
    options: ["NB", "NBVAL", "NB.VIDE", "COMPTER"],
    correct: 1,
    difficulty: "intermédiaire",
    category: "Fonctions statistiques",
    level: "Intermédiaire"
  },
  {
    id: 33,
    question: "Comment créer un tableau croisé dynamique ?",
    options: [
      "Insertion > Tableau croisé dynamique",
      "Données > Tableau croisé dynamique",
      "Formules > Tableau croisé dynamique",
      "Affichage > Tableau croisé dynamique"
    ],
    correct: 0,
    difficulty: "intermédiaire",
    category: "Tableaux croisés",
    level: "Intermédiaire"
  },
  {
    id: 34,
    question: "La fonction SOMME.SI permet de :",
    options: [
      "Additionner selon un critère",
      "Additionner toutes les cellules",
      "Moyenne selon un critère",
      "Compter selon un critère"
    ],
    correct: 0,
    difficulty: "intermédiaire",
    category: "Fonctions conditionnelles",
    level: "Intermédiaire"
  },
  {
    id: 35,
    question: "Quelle est la fonction pour arrondir un nombre ?",
    options: ["ARRONDI", "ROUND", "ARRONDIR", "Toutes ces réponses"],
    correct: 3,
    difficulty: "intermédiaire",
    category: "Fonctions mathématiques",
    level: "Intermédiaire"
  },
  {
    id: 36,
    question: "Que permet la mise en forme conditionnelle ?",
    options: [
      "Colorer les cellules selon des conditions",
      "Modifier la police des cellules",
      "Protéger les cellules",
      "Verrouiller les cellules"
    ],
    correct: 0,
    difficulty: "intermédiaire",
    category: "Mise en forme",
    level: "Intermédiaire"
  },
  {
    id: 37,
    question: "La fonction RECHERCHEX (XLOOKUP) permet de :",
    options: [
      "Rechercher une valeur dans une plage",
      "Faire une recherche verticale",
      "Faire une recherche horizontale",
      "Faire une addition"
    ],
    correct: 0,
    difficulty: "intermédiaire",
    category: "Fonctions de recherche",
    level: "Intermédiaire"
  },
  {
    id: 38,
    question: "Comment utiliser la fonction MOYENNE.SI ?",
    options: [
      "Moyenne selon un critère",
      "Moyenne de toutes les cellules",
      "Moyenne des nombres positifs",
      "Moyenne des nombres négatifs"
    ],
    correct: 0,
    difficulty: "intermédiaire",
    category: "Fonctions conditionnelles",
    level: "Intermédiaire"
  },
  {
    id: 39,
    question: "Que permet la validation des données ?",
    options: [
      "Limiter les saisies possibles",
      "Vérifier les formules",
      "Trier les données",
      "Filtrer les données"
    ],
    correct: 0,
    difficulty: "intermédiaire",
    category: "Validation",
    level: "Intermédiaire"
  },
  {
    id: 40,
    question: "Comment créer un graphique croisé dynamique ?",
    options: [
      "Insertion > Graphique croisé dynamique",
      "Données > Graphique croisé",
      "Formules > Graphique croisé",
      "Affichage > Graphique croisé"
    ],
    correct: 0,
    difficulty: "intermédiaire",
    category: "Graphiques",
    level: "Intermédiaire"
  },
  {
    id: 41,
    question: "La fonction SI.ERREUR permet de :",
    options: [
      "Gérer les erreurs dans une formule",
      "Faire un test logique",
      "Additionner des valeurs",
      "Compter des valeurs"
    ],
    correct: 0,
    difficulty: "intermédiaire",
    category: "Fonctions logiques",
    level: "Intermédiaire"
  },
  {
    id: 42,
    question: "Qu'est-ce qu'une plage nommée ?",
    options: [
      "Un nom donné à une plage de cellules",
      "Un nom de feuille",
      "Un nom de colonne",
      "Un nom de ligne"
    ],
    correct: 0,
    difficulty: "intermédiaire",
    category: "Plages nommées",
    level: "Intermédiaire"
  },
  {
    id: 43,
    question: "Comment utiliser la fonction RECHERCHEH ?",
    options: [
      "Recherche horizontale",
      "Recherche verticale",
      "Recherche dans une plage",
      "Recherche dans un tableau"
    ],
    correct: 0,
    difficulty: "intermédiaire",
    category: "Fonctions de recherche",
    level: "Intermédiaire"
  },
  {
    id: 44,
    question: "Que permet la consolidation de données ?",
    options: [
      "Combiner des données de plusieurs feuilles",
      "Trier des données",
      "Filtrer des données",
      "Graphiquer des données"
    ],
    correct: 0,
    difficulty: "intermédiaire",
    category: "Consolidation",
    level: "Intermédiaire"
  },
  {
    id: 45,
    question: "Comment utiliser la fonction SOMME.SI.ENS ?",
    options: [
      "Additionner selon plusieurs critères",
      "Additionner selon un critère",
      "Moyenne selon plusieurs critères",
      "Compter selon plusieurs critères"
    ],
    correct: 0,
    difficulty: "intermédiaire",
    category: "Fonctions conditionnelles",
    level: "Intermédiaire"
  },
  {
    id: 46,
    question: "Qu'est-ce que le Power Query ?",
    options: [
      "Un outil de transformation de données",
      "Un outil de création de graphiques",
      "Un outil de calcul financier",
      "Un outil de création de macros"
    ],
    correct: 0,
    difficulty: "intermédiaire",
    category: "Power Query",
    level: "Intermédiaire"
  },
  {
    id: 47,
    question: "Comment créer un tableau structuré ?",
    options: [
      "Insertion > Tableau",
      "Données > Tableau",
      "Formules > Tableau",
      "Affichage > Tableau"
    ],
    correct: 0,
    difficulty: "intermédiaire",
    category: "Tableaux",
    level: "Intermédiaire"
  },
  {
    id: 48,
    question: "La fonction SOMMEPROD permet de :",
    options: [
      "Faire la somme des produits",
      "Faire une somme conditionnelle",
      "Faire un produit",
      "Faire une moyenne pondérée"
    ],
    correct: 0,
    difficulty: "intermédiaire",
    category: "Fonctions avancées",
    level: "Intermédiaire"
  },
  {
    id: 49,
    question: "Comment utiliser la fonction INDIRECT ?",
    options: [
      "Faire référence à une cellule via du texte",
      "Faire référence à une plage",
      "Faire référence à une feuille",
      "Faire référence à un fichier"
    ],
    correct: 0,
    difficulty: "intermédiaire",
    category: "Fonctions de référence",
    level: "Intermédiaire"
  },
  {
    id: 50,
    question: "Que permet la fonction CELLULE ?",
    options: [
      "Obtenir des informations sur une cellule",
      "Modifier une cellule",
      "Supprimer une cellule",
      "Copier une cellule"
    ],
    correct: 0,
    difficulty: "intermédiaire",
    category: "Fonctions d'information",
    level: "Intermédiaire"
  },
  {
    id: 51,
    question: "Comment utiliser la fonction SI.CONDITIONS ?",
    options: [
      "Faire un test logique avec plusieurs conditions",
      "Faire une addition conditionnelle",
      "Faire une moyenne conditionnelle",
      "Faire un comptage conditionnel"
    ],
    correct: 0,
    difficulty: "intermédiaire",
    category: "Fonctions logiques",
    level: "Intermédiaire"
  },
  {
    id: 52,
    question: "Qu'est-ce qu'un segment dans un tableau croisé ?",
    options: [
      "Un filtre visuel",
      "Une colonne",
      "Une ligne",
      "Une valeur"
    ],
    correct: 0,
    difficulty: "intermédiaire",
    category: "Tableaux croisés",
    level: "Intermédiaire"
  },
  {
    id: 53,
    question: "Comment utiliser la fonction FILTRE ?",
    options: [
      "Filtrer des données dynamiquement",
      "Trier des données",
      "Copier des données",
      "Supprimer des données"
    ],
    correct: 0,
    difficulty: "intermédiaire",
    category: "Fonctions de filtrage",
    level: "Intermédiaire"
  },
  {
    id: 54,
    question: "Que permet la fonction COMPTE.SI.ENS ?",
    options: [
      "Compter selon plusieurs critères",
      "Compter selon un critère",
      "Additionner selon plusieurs critères",
      "Moyenne selon plusieurs critères"
    ],
    correct: 0,
    difficulty: "intermédiaire",
    category: "Fonctions statistiques",
    level: "Intermédiaire"
  },
  {
    id: 55,
    question: "Comment utiliser la fonction UNIQUE ?",
    options: [
      "Extraire des valeurs uniques",
      "Trier des données",
      "Filtrer des données",
      "Additionner des données"
    ],
    correct: 0,
    difficulty: "intermédiaire",
    category: "Fonctions de traitement",
    level: "Intermédiaire"
  },
  {
    id: 56,
    question: "Que permet la fonction TRIER ?",
    options: [
      "Trier dynamiquement des données",
      "Filtrer des données",
      "Copier des données",
      "Supprimer des données"
    ],
    correct: 0,
    difficulty: "intermédiaire",
    category: "Fonctions de tri",
    level: "Intermédiaire"
  },
  {
    id: 57,
    question: "Comment utiliser la fonction LET ?",
    options: [
      "Déclarer des variables dans une formule",
      "Faire une boucle",
      "Créer une condition",
      "Faire une addition"
    ],
    correct: 0,
    difficulty: "intermédiaire",
    category: "Fonctions avancées",
    level: "Intermédiaire"
  },
  {
    id: 58,
    question: "Que permet la fonction TRANSPOSE ?",
    options: [
      "Transposer une plage",
      "Trier des données",
      "Filtrer des données",
      "Copier des données"
    ],
    correct: 0,
    difficulty: "intermédiaire",
    category: "Fonctions de manipulation",
    level: "Intermédiaire"
  },
  {
    id: 59,
    question: "Comment utiliser la fonction RECHERCHE ?",
    options: [
      "Rechercher une valeur dans une plage",
      "Faire une addition",
      "Faire une moyenne",
      "Faire un comptage"
    ],
    correct: 0,
    difficulty: "intermédiaire",
    category: "Fonctions de recherche",
    level: "Intermédiaire"
  },
  {
    id: 60,
    question: "Que permet la fonction SI.MULTIPLE ?",
    options: [
      "Faire un test logique avec plusieurs conditions",
      "Faire une addition conditionnelle",
      "Faire une moyenne conditionnelle",
      "Faire un comptage conditionnel"
    ],
    correct: 0,
    difficulty: "intermédiaire",
    category: "Fonctions logiques",
    level: "Intermédiaire"
  },

  // ============================================
  // NIVEAU AVANCÉ - 30 questions
  // ============================================
  {
    id: 61,
    question: "La fonction INDEX + EQUIV permet de :",
    options: [
      "Faire une recherche à 2 dimensions",
      "Faire une recherche simple",
      "Additionner des valeurs",
      "Compter des valeurs"
    ],
    correct: 0,
    difficulty: "avancé",
    category: "Fonctions de recherche avancées",
    level: "Avancé"
  },
  {
    id: 62,
    question: "Comment créer une macro dans Excel ?",
    options: [
      "Développeur > Enregistrer une macro",
      "Formules > Macro",
      "Données > Macro",
      "Insertion > Macro"
    ],
    correct: 0,
    difficulty: "avancé",
    category: "Macros VBA",
    level: "Avancé"
  },
  {
    id: 63,
    question: "La fonction SOMMEPROD permet de :",
    options: [
      "Faire la somme des produits",
      "Faire une somme conditionnelle",
      "Faire un produit",
      "Faire une moyenne pondérée"
    ],
    correct: 0,
    difficulty: "avancé",
    category: "Fonctions avancées",
    level: "Avancé"
  },
  {
    id: 64,
    question: "Quel langage est utilisé pour les macros Excel ?",
    options: ["Python", "VBA", "JavaScript", "C++"],
    correct: 1,
    difficulty: "avancé",
    category: "Macros VBA",
    level: "Avancé"
  },
  {
    id: 65,
    question: "La validation des données permet de :",
    options: [
      "Limiter les saisies possibles",
      "Vérifier les formules",
      "Trier les données",
      "Filtrer les données"
    ],
    correct: 0,
    difficulty: "avancé",
    category: "Validation des données",
    level: "Avancé"
  },
  {
    id: 66,
    question: "Que signifie VBA ?",
    options: [
      "Visual Basic for Applications",
      "Visual Basic Advanced",
      "Virtual Basic Array",
      "Variable Basic Application"
    ],
    correct: 0,
    difficulty: "avancé",
    category: "Macros VBA",
    level: "Avancé"
  },
  {
    id: 67,
    question: "Comment protéger une feuille Excel ?",
    options: [
      "Révision > Protéger la feuille",
      "Données > Protéger",
      "Fichier > Protéger",
      "Affichage > Protéger"
    ],
    correct: 0,
    difficulty: "avancé",
    category: "Sécurité",
    level: "Avancé"
  },
  {
    id: 68,
    question: "Qu'est-ce que le Power Pivot ?",
    options: [
      "Un outil de modélisation de données",
      "Un outil de création de graphiques",
      "Un outil de calcul financier",
      "Un outil de création de macros"
    ],
    correct: 0,
    difficulty: "avancé",
    category: "Power Pivot",
    level: "Avancé"
  },
  {
    id: 69,
    question: "Comment créer un formulaire dans Excel ?",
    options: [
      "Développeur > Insérer > Formulaire",
      "Insertion > Formulaire",
      "Données > Formulaire",
      "Affichage > Formulaire"
    ],
    correct: 0,
    difficulty: "avancé",
    category: "Formulaires",
    level: "Avancé"
  },
  {
    id: 70,
    question: "Que permet la fonction LAMBDA ?",
    options: [
      "Créer des fonctions personnalisées",
      "Faire une boucle",
      "Créer une condition",
      "Faire une addition"
    ],
    correct: 0,
    difficulty: "avancé",
    category: "Fonctions avancées",
    level: "Avancé"
  },
  {
    id: 71,
    question: "Comment utiliser le débogueur VBA ?",
    options: [
      "F8 pour exécuter pas à pas",
      "F5 pour exécuter",
      "F9 pour un point d'arrêt",
      "Toutes ces réponses"
    ],
    correct: 3,
    difficulty: "avancé",
    category: "VBA",
    level: "Avancé"
  },
  {
    id: 72,
    question: "Que sont les tableaux dynamiques ?",
    options: [
      "Des formules qui s'étendent automatiquement",
      "Des tableaux fixes",
      "Des tableaux croisés",
      "Des tableaux de données"
    ],
    correct: 0,
    difficulty: "avancé",
    category: "Tableaux dynamiques",
    level: "Avancé"
  },
  {
    id: 73,
    question: "Comment utiliser la fonction LET avec variables ?",
    options: [
      "LET(nom, valeur, calcul)",
      "LET(valeur, nom, calcul)",
      "LET(calcul, nom, valeur)",
      "LET(nom, calcul, valeur)"
    ],
    correct: 0,
    difficulty: "avancé",
    category: "Fonctions avancées",
    level: "Avancé"
  },
  {
    id: 74,
    question: "Que permet la fonction MAP ?",
    options: [
      "Appliquer une fonction à chaque élément",
      "Trier des données",
      "Filtrer des données",
      "Additionner des données"
    ],
    correct: 0,
    difficulty: "avancé",
    category: "Fonctions de tableau",
    level: "Avancé"
  },
  {
    id: 75,
    question: "Comment créer une procédure VBA ?",
    options: [
      "Sub NomProcédure() ... End Sub",
      "Function NomProcédure() ... End Function",
      "Sub NomProcédure ... End Sub",
      "Function NomProcédure ... End Function"
    ],
    correct: 0,
    difficulty: "avancé",
    category: "VBA",
    level: "Avancé"
  },
  {
    id: 76,
    question: "Que sont les add-ins Excel ?",
    options: [
      "Des extensions pour Excel",
      "Des fichiers de données",
      "Des macros",
      "Des graphiques"
    ],
    correct: 0,
    difficulty: "avancé",
    category: "Add-ins",
    level: "Avancé"
  },
  {
    id: 77,
    question: "Comment utiliser Power Query avec des fichiers externes ?",
    options: [
      "Données > Obtenir des données > À partir d'un fichier",
      "Insertion > Obtenir des données",
      "Formules > Obtenir des données",
      "Affichage > Obtenir des données"
    ],
    correct: 0,
    difficulty: "avancé",
    category: "Power Query",
    level: "Avancé"
  },
  {
    id: 78,
    question: "Que permet la fonction SEQ ?",
    options: [
      "Générer une séquence de nombres",
      "Trier des données",
      "Filtrer des données",
      "Additionner des données"
    ],
    correct: 0,
    difficulty: "avancé",
    category: "Fonctions de tableau",
    level: "Avancé"
  },
  {
    id: 79,
    question: "Comment optimiser les performances d'Excel ?",
    options: [
      "Utiliser des formules efficaces, éviter les volatiles",
      "Utiliser des macros",
      "Utiliser des graphiques",
      "Utiliser des formats complexes"
    ],
    correct: 0,
    difficulty: "avancé",
    category: "Performance",
    level: "Avancé"
  },
  {
    id: 80,
    question: "Que permet la fonction REDUCE ?",
    options: [
      "Réduire un tableau à une seule valeur",
      "Trier des données",
      "Filtrer des données",
      "Additionner des données"
    ],
    correct: 0,
    difficulty: "avancé",
    category: "Fonctions de tableau",
    level: "Avancé"
  },
  {
    id: 81,
    question: "Comment utiliser l'API Excel ?",
    options: [
      "Via JavaScript avec Office.js",
      "Via Python",
      "Via VBA uniquement",
      "Via C++"
    ],
    correct: 0,
    difficulty: "avancé",
    category: "API",
    level: "Avancé"
  },
  {
    id: 82,
    question: "Que sont les classeurs partagés ?",
    options: [
      "Des classeurs accessibles par plusieurs utilisateurs",
      "Des classeurs protégés",
      "Des classeurs en lecture seule",
      "Des classeurs avec macros"
    ],
    correct: 0,
    difficulty: "avancé",
    category: "Collaboration",
    level: "Avancé"
  },
  {
    id: 83,
    question: "Comment utiliser les requêtes web dans Excel ?",
    options: [
      "Données > À partir du web",
      "Insertion > Web",
      "Formules > Web",
      "Affichage > Web"
    ],
    correct: 0,
    difficulty: "avancé",
    category: "Web",
    level: "Avancé"
  },
  {
    id: 84,
    question: "Que permet la fonction ESTERREUR ?",
    options: [
      "Vérifier si une cellule contient une erreur",
      "Vérifier si une cellule est vide",
      "Vérifier si une cellule est un nombre",
      "Vérifier si une cellule est du texte"
    ],
    correct: 0,
    difficulty: "avancé",
    category: "Fonctions d'information",
    level: "Avancé"
  },
  {
    id: 85,
    question: "Comment créer des graphiques complexes avec VBA ?",
    options: [
      "Utiliser l'objet Chart et ses méthodes",
      "Utiliser des formules",
      "Utiliser des fonctions",
      "Utiliser des macros enregistrées"
    ],
    correct: 0,
    difficulty: "avancé",
    category: "VBA Graphiques",
    level: "Avancé"
  },
  {
    id: 86,
    question: "Que sont les fichiers CSV ?",
    options: [
      "Des fichiers texte avec valeurs séparées par des virgules",
      "Des fichiers Excel",
      "Des fichiers PDF",
      "Des fichiers Word"
    ],
    correct: 0,
    difficulty: "avancé",
    category: "Fichiers",
    level: "Avancé"
  },
  {
    id: 87,
    question: "Comment importer des données JSON dans Excel ?",
    options: [
      "Données > À partir de JSON",
      "Insertion > JSON",
      "Formules > JSON",
      "Affichage > JSON"
    ],
    correct: 0,
    difficulty: "avancé",
    category: "Import",
    level: "Avancé"
  },
  {
    id: 88,
    question: "Que permet la fonction ENV.SI ?",
    options: [
      "Faire une somme conditionnelle",
      "Faire une moyenne conditionnelle",
      "Faire un comptage conditionnel",
      "Faire un test logique"
    ],
    correct: 0,
    difficulty: "avancé",
    category: "Fonctions conditionnelles",
    level: "Avancé"
  },
  {
    id: 89,
    question: "Comment utiliser les variables dans VBA ?",
    options: [
      "Dim nomVariable As Type",
      "Set nomVariable = Valeur",
      "Let nomVariable = Valeur",
      "All ces réponses"
    ],
    correct: 3,
    difficulty: "avancé",
    category: "VBA",
    level: "Avancé"
  },
  {
    id: 90,
    question: "Que permet la fonction COLLECTER ?",
    options: [
      "Récupérer toutes les valeurs d'une plage",
      "Trier des données",
      "Filtrer des données",
      "Additionner des données"
    ],
    correct: 0,
    difficulty: "avancé",
    category: "Fonctions de tableau",
    level: "Avancé"
  }
];

// Configuration du test Excel Avancé
export const excelAvanceConfig = {
  testName: "Excel Avancé",
  testIcon: "📊",
  testDescription: "Test de niveau pour la formation Excel Avancé",
  totalQuestions: 90,
  defaultQuestionsCount: 15,
  defaultDuration: 12, // minutes
  passingScore: 60,
  levels: {
    expert: { min: 90, label: "Expert", emoji: "🏆", color: "text-yellow-600" },
    avancé: { min: 75, label: "Avancé", emoji: "🎓", color: "text-purple-600" },
    intermédiaire: { min: 50, label: "Intermédiaire", emoji: "📚", color: "text-blue-600" },
    débutant: { min: 0, label: "Débutant", emoji: "📖", color: "text-gray-600" }
  }
};

export default excelAvanceQuestions;