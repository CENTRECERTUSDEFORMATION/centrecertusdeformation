// frontend/src/pages/ModifierFormation.jsx
import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-toastify";
import { motion } from "framer-motion";

// ============================================
// DONNÉES STATIQUES
// ============================================
const THEMES = [
  { id: "digital", name: "💻 Digital & Web" },
  { id: "data", name: "📊 Data & IA" },
  { id: "design", name: "🎨 Design & Créativité" },
  { id: "management", name: "📈 Management & Leadership" },
  { id: "finance", name: "💰 Finance & Comptabilité" },
  { id: "energie", name: "🌱 Énergies renouvelables" },
  { id: "langues", name: "🗣️ Langues & Communication" }
];

const LANGUES = [
  { code: "fr", name: "Français" },
  { code: "en", name: "English" },
  { code: "ar", name: "العربية" }
];

const TEST_TYPES = [
  { id: "excel", name: "📊 Excel" },
  { id: "python", name: "🐍 Python" },
  { id: "ia", name: "🤖 Intelligence Artificielle" },
  { id: "langues", name: "🗣️ Langues" },
  { id: "default", name: "📝 Générique" }
];

// ============================================
// HELPERS
// ============================================
const cleanFileName = (filename) => {
  return filename
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, '-')
    .replace(/[^a-zA-Z0-9.-]/g, '');
};

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

// ============================================
// COMPOSANT PRINCIPAL
// ============================================
export default function ModifierFormation() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAdmin } = useAuth();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  // États du formulaire
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    fullDescription: "",
    preinscriptionLink: "",
    testLink: "",
    theme: "digital",
    langue: "fr",
    duration: "",
    price: "",
    isOnline: false,
    onDemand: false,
    hasTest: false,
    testType: "excel",
    testFree: false,
    testQuestionsCount: 10,
    testDuration: 5
  });

  const [existingImages, setExistingImages] = useState([]);
  const [newImages, setNewImages] = useState([]);
  const [newPreviews, setNewPreviews] = useState([]);
  const [imagesToDelete, setImagesToDelete] = useState([]);

  // Ref pour éviter les appels multiples
  const fetchInProgress = useRef(false);

  // Vérification admin
  if (!isAdmin) {
    return <p className="text-center mt-20">Accès refusé</p>;
  }

  // ============================================
  // GET IMAGE URL
  // ============================================
  const getImageUrl = useCallback((path) => {
    if (!path) return null;
    try {
      const { data } = supabase.storage.from("uploads").getPublicUrl(path);
      return data.publicUrl;
    } catch (error) {
      return null;
    }
  }, []);

  // ============================================
  // CHARGEMENT DE LA FORMATION
  // ============================================
  useEffect(() => {
    if (!id || fetchInProgress.current) return;
    
    const fetchFormation = async () => {
      fetchInProgress.current = true;
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("formations")
          .select("*")
          .eq("id", id)
          .single();

        if (error) throw error;
        
        setFormData({
          title: data.title || "",
          description: data.description || "",
          fullDescription: data.fullDescription || "",
          preinscriptionLink: data.preinscriptionLink || "",
          testLink: data.test_link || "",
          theme: data.theme || "digital",
          langue: data.langue || "fr",
          duration: data.duration || "",
          price: data.price || "",
          isOnline: data.is_online || false,
          onDemand: data.onDemand || false,
          hasTest: data.has_test || false,
          testType: data.test_type || "excel",
          testFree: data.test_free || false,
          testQuestionsCount: data.test_questions_count || 10,
          testDuration: data.test_duration || 5
        });
        setExistingImages(data.images || []);
        
      } catch (error) {
        console.error("Erreur fetch:", error);
        toast.error("Erreur chargement formation");
        navigate("/formations");
      } finally {
        setLoading(false);
        fetchInProgress.current = false;
      }
    };

    fetchFormation();
  }, [id, navigate]);

  // ============================================
  // HANDLERS
  // ============================================
  const handleChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  }, []);

  const handleNumberChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: parseInt(value) || 0
    }));
  }, []);

  const handleNewImages = useCallback((e) => {
    const files = Array.from(e.target.files);
    setNewImages(files);
    setNewPreviews(files.map(file => URL.createObjectURL(file)));
  }, []);

  const removeExistingImage = useCallback((index) => {
    setImagesToDelete(prev => [...prev, existingImages[index]]);
    setExistingImages(prev => prev.filter((_, i) => i !== index));
  }, [existingImages]);

  const removeNewImage = useCallback((index) => {
    URL.revokeObjectURL(newPreviews[index]);
    setNewImages(prev => prev.filter((_, i) => i !== index));
    setNewPreviews(prev => prev.filter((_, i) => i !== index));
  }, [newPreviews]);

  // ============================================
  // SUBMIT
  // ============================================
  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      toast.error("Le titre est obligatoire");
      return;
    }

    setSubmitting(true);

    try {
      // Supprimer les images retirées
      for (const imagePath of imagesToDelete) {
        await supabase.storage.from("uploads").remove([imagePath]);
      }

      // Upload des nouvelles images
      const uploadedPaths = [...existingImages];
      for (const image of newImages) {
        const cleanName = cleanFileName(image.name);
        const fileName = `formations/${Date.now()}-${cleanName}`;
        const { error: uploadError } = await supabase.storage
          .from("uploads")
          .upload(fileName, image);
        
        if (uploadError) {
          console.error("Upload error:", uploadError);
          toast.error(`Erreur upload: ${image.name}`);
          continue;
        }
        uploadedPaths.push(fileName);
      }

      // Générer le slug si le titre a changé
      const slug = generateSlug(formData.title);

      // Mise à jour
      const updateData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        fullDescription: formData.fullDescription.trim(),
        preinscriptionLink: formData.preinscriptionLink || null,
        test_link: formData.testLink || null,
        theme: formData.theme,
        langue: formData.langue,
        duration: formData.duration || null,
        price: formData.price || null,
        is_online: formData.isOnline,
        onDemand: formData.onDemand,
        has_test: formData.hasTest,
        test_type: formData.hasTest ? formData.testType : null,
        test_free: formData.hasTest ? formData.testFree : false,
        test_questions_count: formData.hasTest ? formData.testQuestionsCount : 0,
        test_duration: formData.hasTest ? formData.testDuration : 0,
        slug: slug,
        images: uploadedPaths,
        updated_at: new Date().toISOString(),
      };

      const { error: updateError } = await supabase
        .from("formations")
        .update(updateData)
        .eq("id", id);

      if (updateError) throw updateError;

      toast.success("✅ Formation modifiée avec succès !");
      navigate("/formations");

    } catch (error) {
      console.error("Erreur update:", error);
      toast.error("❌ Erreur lors de la modification: " + (error.message || "Erreur inconnue"));
    } finally {
      setSubmitting(false);
    }
  }, [formData, existingImages, newImages, imagesToDelete, id, navigate]);

  // ============================================
  // LOADING
  // ============================================
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64 mt-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    );
  }

  // ============================================
  // RENDER
  // ============================================
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }} 
      animate={{ opacity: 1, y: 0 }} 
      className="max-w-3xl mx-auto p-6 mt-20"
    >
      <h2 className="text-2xl font-bold mb-6">✏️ Modifier la formation</h2>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Titre */}
        <div>
          <label className="block text-sm font-medium mb-1" htmlFor="title">Titre *</label>
          <input 
            id="title"
            type="text" 
            name="title"
            className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
            value={formData.title} 
            onChange={handleChange} 
            required 
          />
          <p className="text-xs text-gray-400 mt-1">Le slug (URL) sera généré automatiquement</p>
        </div>

        {/* Langue */}
        <div>
          <label className="block text-sm font-medium mb-1" htmlFor="langue">🌐 Langue</label>
          <select 
            id="langue"
            name="langue"
            className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
            value={formData.langue} 
            onChange={handleChange}
          >
            {LANGUES.map((l) => (
              <option key={l.code} value={l.code}>{l.name}</option>
            ))}
          </select>
        </div>

        {/* Thème */}
        <div>
          <label className="block text-sm font-medium mb-1" htmlFor="theme">Thème *</label>
          <select 
            id="theme"
            name="theme"
            className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
            value={formData.theme} 
            onChange={handleChange} 
            required
          >
            {THEMES.map((t) => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </select>
        </div>

        {/* Description courte */}
        <div>
          <label className="block text-sm font-medium mb-1" htmlFor="description">Description courte *</label>
          <textarea 
            id="description"
            name="description"
            className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
            rows="3" 
            value={formData.description} 
            onChange={handleChange} 
            required 
          />
        </div>

        {/* Description complète */}
        <div>
          <label className="block text-sm font-medium mb-1" htmlFor="fullDescription">Description complète</label>
          <textarea 
            id="fullDescription"
            name="fullDescription"
            className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
            rows="8" 
            value={formData.fullDescription} 
            onChange={handleChange} 
            placeholder="Description détaillée..." 
          />
        </div>

        {/* Durée et Prix */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1" htmlFor="duration">Durée</label>
            <input 
              id="duration"
              type="text" 
              name="duration"
              placeholder="ex: 40h" 
              className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
              value={formData.duration} 
              onChange={handleChange} 
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1" htmlFor="price">Prix</label>
            <input 
              id="price"
              type="text" 
              name="price"
              placeholder="ex: 1200 DT" 
              className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
              value={formData.price} 
              onChange={handleChange} 
            />
          </div>
        </div>

        {/* Lien préinscription */}
        <div>
          <label className="block text-sm font-medium mb-1" htmlFor="preinscriptionLink">Lien préinscription</label>
          <input 
            id="preinscriptionLink"
            type="url" 
            name="preinscriptionLink"
            className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
            value={formData.preinscriptionLink} 
            onChange={handleChange} 
            placeholder="https://..." 
          />
        </div>

        {/* Lien test / démo */}
        <div>
          <label className="block text-sm font-medium mb-1" htmlFor="testLink">🔗 Lien test / démo</label>
          <input 
            id="testLink"
            type="url" 
            name="testLink"
            className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
            value={formData.testLink} 
            onChange={handleChange} 
            placeholder="https://..." 
          />
        </div>

        {/* SECTION TEST */}
        <div className="border-t border-gray-200 pt-4 mt-4">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">🧪 Configuration du Test</h3>
          
          <div className="flex items-center gap-3 mb-4">
            <input
              type="checkbox"
              id="hasTest"
              name="hasTest"
              checked={formData.hasTest}
              onChange={handleChange}
              className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
            />
            <label htmlFor="hasTest" className="text-sm font-medium text-gray-700">
              Activer le test pour cette formation
            </label>
            <span className="text-xs text-gray-400">(Recommandé pour l'engagement)</span>
          </div>

          {formData.hasTest && (
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 space-y-4">
              {/* Type de test */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="testType">
                  Type de test *
                </label>
                <select 
                  id="testType"
                  name="testType"
                  className="w-full border p-2 rounded bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                  value={formData.testType} 
                  onChange={handleChange}
                >
                  {TEST_TYPES.map((t) => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Nombre de questions */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="testQuestionsCount">
                    Nombre de questions
                  </label>
                  <input 
                    id="testQuestionsCount"
                    type="number" 
                    name="testQuestionsCount"
                    min="5" 
                    max="30" 
                    className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                    value={formData.testQuestionsCount} 
                    onChange={handleNumberChange}
                  />
                  <p className="text-xs text-gray-400 mt-1">Entre 5 et 30 questions</p>
                </div>

                {/* Durée estimée */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="testDuration">
                    Durée estimée (minutes)
                  </label>
                  <input 
                    id="testDuration"
                    type="number" 
                    name="testDuration"
                    min="3" 
                    max="30" 
                    className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                    value={formData.testDuration} 
                    onChange={handleNumberChange}
                  />
                  <p className="text-xs text-gray-400 mt-1">Entre 3 et 30 minutes</p>
                </div>
              </div>

              {/* Test gratuit */}
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="testFree"
                  name="testFree"
                  checked={formData.testFree}
                  onChange={handleChange}
                  className="w-5 h-5 text-green-600 rounded focus:ring-green-500"
                />
                <label htmlFor="testFree" className="text-sm font-medium text-green-700">
                  ✅ Accès gratuit (sans inscription)
                </label>
                <span className="text-xs text-gray-500 ml-2">(Recommandé pour le SEO)</span>
              </div>

              {/* Astuce SEO */}
              <div className="bg-yellow-50 p-3 rounded border border-yellow-200 text-xs text-yellow-800">
                💡 <strong>Astuce SEO :</strong> Activer le test gratuit augmente le temps passé sur la page, réduit le taux de rebond et améliore votre référencement naturel.
              </div>
            </div>
          )}
        </div>

        {/* Images */}
        {existingImages.length > 0 && (
          <div>
            <label className="block text-sm font-medium mb-2">Images actuelles</label>
            <div className="flex flex-wrap gap-3">
              {existingImages.map((img, idx) => (
                <div key={idx} className="relative group">
                  <img 
                    src={getImageUrl(img)} 
                    alt={`Image ${idx + 1}`} 
                    className="w-24 h-24 object-cover rounded border" 
                  />
                  <button 
                    type="button" 
                    onClick={() => removeExistingImage(idx)} 
                    className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full w-6 h-6 text-sm opacity-0 group-hover:opacity-100 transition hover:bg-red-700"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium mb-1" htmlFor="images">Ajouter des images</label>
          <input 
            id="images"
            type="file" 
            accept="image/*" 
            multiple 
            onChange={handleNewImages} 
            className="w-full" 
          />
          <p className="text-xs text-gray-400 mt-1">Maintenez Ctrl (ou Cmd) pour sélectionner plusieurs images</p>
        </div>

        {newPreviews.length > 0 && (
          <div>
            <label className="block text-sm font-medium mb-2">Nouvelles images</label>
            <div className="flex flex-wrap gap-3">
              {newPreviews.map((preview, idx) => (
                <div key={idx} className="relative group">
                  <img 
                    src={preview} 
                    alt={`Nouvelle ${idx + 1}`} 
                    className="w-24 h-24 object-cover rounded border" 
                  />
                  <button 
                    type="button" 
                    onClick={() => removeNewImage(idx)} 
                    className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full w-6 h-6 text-sm opacity-0 group-hover:opacity-100 transition hover:bg-red-700"
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
              name="isOnline"
              checked={formData.isOnline} 
              onChange={handleChange} 
              className="w-4 h-4 text-blue-600 rounded"
            /> 
            🌍 Formation à distance
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input 
              type="checkbox" 
              name="onDemand"
              checked={formData.onDemand} 
              onChange={handleChange} 
              className="w-4 h-4 text-orange-600 rounded"
            /> 
            🎯 Formation à la demande
          </label>
        </div>

        {/* Boutons */}
        <div className="flex gap-3 pt-4">
          <button 
            type="submit" 
            disabled={submitting} 
            className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-8 py-3 rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50 hover:scale-[1.02]"
          >
            {submitting ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Enregistrement...
              </span>
            ) : (
              "💾 Enregistrer"
            )}
          </button>
          <button 
            type="button" 
            onClick={() => navigate("/formations")} 
            className="bg-gray-200 text-gray-700 px-8 py-3 rounded-lg font-semibold hover:bg-gray-300 transition"
          >
            Annuler
          </button>
        </div>
      </form>
    </motion.div>
  );
}