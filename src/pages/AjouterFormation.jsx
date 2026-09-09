// frontend/src/pages/AjouterFormation.jsx
import React, { useState } from "react";
import { supabase } from "../supabaseClient";
import { supabaseInsert } from "../supabaseFetch";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useAuth } from "../context/AuthContext";

export default function AjouterFormation() {
  const navigate = useNavigate();
  const { isAdmin } = useAuth();

  // Vérification admin
  if (!isAdmin) {
    return <p className="text-center mt-20">Accès refusé</p>;
  }

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [fullDescription, setFullDescription] = useState("");
  const [preinscriptionLink, setPreinscriptionLink] = useState("");
  const [testLink, setTestLink] = useState("");
  const [theme, setTheme] = useState("digital");
  const [langue, setLangue] = useState("fr");
  const [duration, setDuration] = useState("");
  const [price, setPrice] = useState("");
  const [isOnline, setIsOnline] = useState(false);
  const [images, setImages] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [onDemand, setOnDemand] = useState(false);

  // ============ ÉTATS POUR LES TESTS ============
  const [hasTest, setHasTest] = useState(false);
  const [testType, setTestType] = useState("excel");
  const [testFree, setTestFree] = useState(false);
  const [testQuestionsCount, setTestQuestionsCount] = useState(10);
  const [testDuration, setTestDuration] = useState(5);

  const cleanFileName = (filename) => {
    return filename
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/\s+/g, '-')
      .replace(/[^a-zA-Z0-9.-]/g, '');
  };

  const themes = [
    { id: "digital", name: "💻 Digital & Web" },
    { id: "data", name: "📊 Data & IA" },
    { id: "design", name: "🎨 Design & Créativité" },
    { id: "management", name: "📈 Management & Leadership" },
    { id: "finance", name: "💰 Finance & Comptabilité" },
    { id: "energie", name: "🌱 Énergies renouvelables" },
    { id: "langues", name: "🗣️ Langues & Communication" }
  ];

  const langues = [
    { code: "fr", name: "Français" },
    { code: "en", name: "English" },
    { code: "ar", name: "العربية" }
  ];

  // ============ TYPES DE TEST ============
  const testTypes = [
    { id: "excel", name: "📊 Excel", description: "Test de niveau Excel" },
    { id: "python", name: "🐍 Python", description: "Test de niveau Python" },
    { id: "ia", name: "🤖 Intelligence Artificielle", description: "Test de niveau IA" },
    { id: "langues", name: "🗣️ Langues", description: "Test de niveau Langues" },
    { id: "default", name: "📝 Générique", description: "Test générique" }
  ];

  const generateSEOContent = (lang) => {
    const titreBase = title;
    const themeName = themes.find(t => t.id === theme)?.name || "formation";
    
    const content = {
      fr: {
        description: `Formation professionnelle ${titreBase} à Monastir, Tunisie. Programme certifiant de qualité avec formateurs experts. Inscription ouverte.`,
        fullDesc: `${titreBase} est une formation complète proposée par le Centre Certus à Monastir. Cette formation en ${themeName} vous permettra d'acquérir toutes les compétences nécessaires pour exceller dans votre domaine.`
      },
      en: {
        description: `Professional training ${titreBase} in Monastir, Tunisia. Quality certified program with expert trainers. Open registration.`,
        fullDesc: `${titreBase} is a comprehensive training program offered by Centre Certus in Monastir. This ${themeName} training will allow you to acquire all the necessary skills to excel in your field.`
      },
      ar: {
        description: `تكوين مهني ${titreBase} في المنستير، تونس. برنامج معتمد بجودة عالية مع خبراء في التدريب. التسجيل مفتوح.`,
        fullDesc: `${titreBase} هو برنامج تكويني شامل يقدمه مركز سيرتوس في المنستير. سيمكنك هذا التكوين في ${themeName} من اكتساب جميع المهارات اللازمة للتفوق في مجالك.`
      }
    };
    return content[lang] || content.fr;
  };

  const handleLangueChange = (lang) => {
    setLangue(lang);
    if (!description && title) {
      const seo = generateSEOContent(lang);
      setDescription(seo.description);
    }
    if (!fullDescription && title) {
      const seo = generateSEOContent(lang);
      setFullDescription(seo.fullDesc);
    }
  };

  const handleImages = (e) => {
    const files = Array.from(e.target.files);
    setImages(files);
    const newPreviews = files.map(file => URL.createObjectURL(file));
    setPreviews(newPreviews);
  };

  const removeImage = (index) => {
    setImages(images.filter((_, i) => i !== index));
    setPreviews(previews.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title || !description || !fullDescription) {
      toast.error("Titre, description courte et description complète sont obligatoires");
      return;
    }

    setLoading(true);

    try {
      const uploadedPaths = [];

      for (const image of images) {
        const cleanName = cleanFileName(image.name);
        const fileName = `formations/${Date.now()}-${cleanName}`;
        
        const { error: uploadError } = await supabase.storage
          .from("uploads")
          .upload(fileName, image);

        if (uploadError) throw uploadError;
        uploadedPaths.push(fileName);
      }

      // ============ GÉNÉRATION DU SLUG ============
      const generateSlug = (title) => {
        if (!title) return '';
        return title
          .toLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-+|-+$/g, '')
          .substring(0, 60);
      };

      const slug = generateSlug(title);

      // ============ CRÉATION DE LA FORMATION ============
      await supabaseInsert("formations", {
        title: title,
        description,
        fullDescription,
        preinscriptionLink: preinscriptionLink || null,
        test_link: testLink || null,
        theme: theme,
        langue: langue,
        duration: duration || null,
        price: price || null,
        is_online: isOnline,
        images: uploadedPaths,
        onDemand,
        slug: slug,
        // ============ CHAMPS TESTS ============
        has_test: hasTest,
        test_type: hasTest ? testType : null,
        test_free: hasTest ? testFree : false,
        test_questions_count: hasTest ? testQuestionsCount : 0,
        test_duration: hasTest ? testDuration : 0,
        created_at: new Date().toISOString(),
      });

      const testMessage = hasTest ? ` avec test ${testFree ? 'gratuit' : ''} activé` : '';
      toast.success(`✅ Formation ajoutée avec ${uploadedPaths.length} image(s)${testMessage} !`);
      navigate("/formations");

    } catch (err) {
      console.error(err);
      toast.error("❌ Erreur lors de l'ajout de la formation");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6 mt-20">
      <h2 className="text-2xl font-bold mb-6">➕ Ajouter une formation</h2>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Titre */}
        <div>
          <label className="block text-sm font-medium mb-1">Titre *</label>
          <input 
            placeholder="Titre de la formation" 
            className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
            value={title} 
            onChange={(e) => setTitle(e.target.value)} 
            required 
          />
          <p className="text-xs text-gray-500 mt-1">Le slug (URL) sera généré automatiquement à partir du titre</p>
        </div>

        {/* Langue */}
        <div>
          <label className="block text-sm font-medium mb-1">🌐 Langue de la formation *</label>
          <select className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent" value={langue} onChange={(e) => handleLangueChange(e.target.value)} required>
            {langues.map((l) => (<option key={l.code} value={l.code}>{l.name}</option>))}
          </select>
          <p className="text-xs text-gray-500 mt-1">La description sera générée automatiquement dans cette langue</p>
        </div>

        {/* Thème */}
        <div>
          <label className="block text-sm font-medium mb-1">Thème *</label>
          <select className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent" value={theme} onChange={(e) => setTheme(e.target.value)} required>
            {themes.map((t) => (<option key={t.id} value={t.id}>{t.name}</option>))}
          </select>
        </div>

        {/* Description courte */}
        <div>
          <label className="block text-sm font-medium mb-1">Description courte *</label>
          <textarea 
            placeholder="Brève description (apparaît dans la liste)" 
            className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
            rows="3" 
            value={description} 
            onChange={(e) => setDescription(e.target.value)} 
            required 
          />
        </div>

        {/* Description complète */}
        <div>
          <label className="block text-sm font-medium mb-1">Description complète *</label>
          <textarea 
            placeholder="Description détaillée de la formation" 
            className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
            rows="6" 
            value={fullDescription} 
            onChange={(e) => setFullDescription(e.target.value)} 
            required 
          />
        </div>

        {/* Durée et Prix */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Durée</label>
            <input 
              type="text" 
              placeholder="ex: 40h / 3 mois" 
              className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
              value={duration} 
              onChange={(e) => setDuration(e.target.value)} 
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Prix</label>
            <input 
              type="text" 
              placeholder="ex: 1200 DT / Sur devis" 
              className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
              value={price} 
              onChange={(e) => setPrice(e.target.value)} 
            />
          </div>
        </div>

        {/* Liens */}
        <div>
          <label className="block text-sm font-medium mb-1">Lien de préinscription</label>
          <input 
            placeholder="https://forms.gle/..." 
            className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
            value={preinscriptionLink} 
            onChange={(e) => setPreinscriptionLink(e.target.value)} 
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">🔗 Lien de test / démo</label>
          <input 
            placeholder="https://test-formation.com" 
            className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
            value={testLink} 
            onChange={(e) => setTestLink(e.target.value)} 
          />
          <p className="text-xs text-gray-500 mt-1">Lien vers un test de niveau, une démo ou un support pédagogique</p>
        </div>

        {/* ============ SECTION CONFIGURATION DU TEST ============ */}
        <div className="border-t border-gray-200 pt-4 mt-4">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">🧪 Configuration du Test</h3>
          
          <div className="flex items-center gap-3 mb-4">
            <input
              type="checkbox"
              id="hasTest"
              checked={hasTest}
              onChange={(e) => setHasTest(e.target.checked)}
              className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
            />
            <label htmlFor="hasTest" className="text-sm font-medium text-gray-700">
              Activer le test pour cette formation
            </label>
            <span className="text-xs text-gray-400">(Recommandé pour l'engagement utilisateur)</span>
          </div>

          {hasTest && (
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 space-y-4">
              {/* Type de test */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Type de test *
                </label>
                <select 
                  className="w-full border p-2 rounded bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                  value={testType} 
                  onChange={(e) => setTestType(e.target.value)}
                >
                  {testTypes.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name} - {t.description}
                    </option>
                  ))}
                </select>
              </div>

              {/* Nombre de questions et Durée */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nombre de questions
                  </label>
                  <input 
                    type="number" 
                    min="5" 
                    max="30" 
                    className="w-full border p-2 rounded bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                    value={testQuestionsCount} 
                    onChange={(e) => setTestQuestionsCount(parseInt(e.target.value) || 10)}
                  />
                  <p className="text-xs text-gray-400 mt-1">Entre 5 et 30 questions</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Durée estimée (minutes)
                  </label>
                  <input 
                    type="number" 
                    min="3" 
                    max="30" 
                    className="w-full border p-2 rounded bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                    value={testDuration} 
                    onChange={(e) => setTestDuration(parseInt(e.target.value) || 5)}
                  />
                  <p className="text-xs text-gray-400 mt-1">Entre 3 et 30 minutes</p>
                </div>
              </div>

              {/* Test gratuit */}
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="testFree"
                  checked={testFree}
                  onChange={(e) => setTestFree(e.target.checked)}
                  className="w-5 h-5 text-green-600 rounded focus:ring-green-500"
                />
                <label htmlFor="testFree" className="text-sm font-medium text-green-700">
                  ✅ Accès gratuit (sans inscription)
                </label>
                <span className="text-xs text-gray-500 ml-2">
                  (Recommandé pour le SEO)
                </span>
              </div>

              {/* Astuce SEO */}
              <div className="bg-yellow-50 p-3 rounded border border-yellow-200 text-xs text-yellow-800">
                💡 <strong>Astuce SEO :</strong> Activer le test gratuit augmente le temps passé sur la page, réduit le taux de rebond et améliore votre référencement naturel.
              </div>
            </div>
          )}
        </div>

        {/* Images */}
        <div>
          <label className="block text-sm font-medium mb-1">Images (plusieurs possibles)</label>
          <input 
            type="file" 
            accept="image/*" 
            multiple 
            onChange={handleImages} 
            className="w-full" 
          />
          <p className="text-xs text-gray-500 mt-1">Maintenez Ctrl (ou Cmd) pour sélectionner plusieurs images</p>
        </div>

        {previews.length > 0 && (
          <div>
            <p className="text-sm text-gray-600 mb-2">Aperçus :</p>
            <div className="flex flex-wrap gap-2">
              {previews.map((preview, index) => (
                <div key={index} className="relative">
                  <img 
                    src={preview} 
                    alt={`Aperçu ${index + 1}`} 
                    className="w-20 h-20 object-cover rounded border" 
                  />
                  <button 
                    type="button" 
                    onClick={() => removeImage(index)} 
                    className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full w-5 h-5 text-xs hover:bg-red-700 transition"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Options */}
        <div className="flex flex-wrap gap-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input 
              type="checkbox" 
              checked={isOnline} 
              onChange={(e) => setIsOnline(e.target.checked)} 
              className="w-4 h-4 text-blue-600 rounded"
            /> 
            🌍 Formation à distance (international)
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input 
              type="checkbox" 
              checked={onDemand} 
              onChange={(e) => setOnDemand(e.target.checked)} 
              className="w-4 h-4 text-orange-600 rounded"
            /> 
            🎯 Formation à la demande
          </label>
        </div>

        {/* Bouton submit */}
        <button 
          type="submit" 
          disabled={loading} 
          className="w-full bg-gradient-to-r from-[#1a56db] to-[#76c21f] text-white py-3 rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:hover:scale-100 hover:scale-[1.02]"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Ajout en cours...
            </span>
          ) : (
            "➕ Ajouter la formation"
          )}
        </button>
      </form>
    </div>
  );
}