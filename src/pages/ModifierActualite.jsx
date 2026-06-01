import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "./supabaseClient";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-toastify";
import { motion } from "framer-motion";

// Couleurs pour l'éditeur
const TEXT_COLORS = [
  { name: "Bleu", hex: "#1a56db", class: "text-blue-600" },
  { name: "Vert", hex: "#76c21f", class: "text-green-600" },
  { name: "Orange", hex: "#f59e0b", class: "text-orange-500" },
  { name: "Rouge", hex: "#dc2626", class: "text-red-600" },
  { name: "Noir", hex: "#374151", class: "text-gray-800" }
];

const BACKGROUND_COLORS = [
  { name: "Blanc", hex: "#ffffff", class: "bg-white" },
  { name: "Bleu clair", hex: "#dbeafe", class: "bg-blue-50" },
  { name: "Vert clair", hex: "#d1fae5", class: "bg-green-50" },
  { name: "Orange clair", hex: "#fef3c7", class: "bg-orange-50" },
  { name: "Rouge clair (Alerte)", hex: "#fee2e2", class: "bg-red-50" }
];

export default function ModifierActualite() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAdmin, loading: authLoading } = useAuth();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  const [titre, setTitre] = useState("");
  const [contenu, setContenu] = useState("");
  const [textColor, setTextColor] = useState("#374151");
  const [backgroundColor, setBackgroundColor] = useState("#ffffff");
  const [isAlert, setIsAlert] = useState(false);
  const [existingImages, setExistingImages] = useState([]);
  const [newImages, setNewImages] = useState([]);
  const [newPreviews, setNewPreviews] = useState([]);
  const [imagesToDelete, setImagesToDelete] = useState([]);

  // Vérification admin après chargement de l'auth
  useEffect(() => {
    if (!authLoading && !isAdmin) {
      toast.error("Accès refusé. Vous devez être administrateur.");
      navigate("/");
    }
  }, [authLoading, isAdmin, navigate]);

  const cleanFileName = (filename) => {
    return filename
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/\s+/g, '-')
      .replace(/[^a-zA-Z0-9.-]/g, '');
  };

  const getImageUrl = (path) => {
    if (!path) return null;
    try {
      const { data } = supabase.storage.from("uploads").getPublicUrl(path);
      return data.publicUrl;
    } catch (error) {
      return null;
    }
  };

  // Fonctions d'édition de texte enrichi
  const insertHTML = (beforeTag, afterTag) => {
    const textarea = document.getElementById('contenu-textarea');
    if (!textarea) return;
    
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = contenu.substring(start, end);
    
    if (selectedText) {
      const beforeText = contenu.substring(0, start);
      const afterText = contenu.substring(end);
      const newText = `${beforeText}${beforeTag}${selectedText}${afterTag}${afterText}`;
      setContenu(newText);
      
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start + beforeTag.length, end + beforeTag.length);
      }, 10);
    } else {
      toast.info("Sélectionnez d'abord le texte à formater");
    }
  };

  const applyBold = () => insertHTML('<strong>', '</strong>');
  const applyItalic = () => insertHTML('<em>', '</em>');
  const applyUnderline = () => insertHTML('<u>', '</u>');
  const applyList = () => insertHTML('\n• ', '');
  const applyNumberedList = () => insertHTML('\n1. ', '');
  const applyTitle = () => insertHTML('<h3 class="text-lg font-bold mt-2">', '</h3>');
  const applySubtitle = () => insertHTML('<h4 class="text-md font-semibold mt-1">', '</h4>');
  const applyLink = () => {
    const url = prompt("Entrez l'URL du lien:", "https://");
    if (url) {
      insertHTML(`<a href="${url}" target="_blank" rel="noopener noreferrer" class="text-blue-600 underline">`, '</a>');
    }
  };
  
  const applyColorToSelection = (colorHex) => {
    const textarea = document.getElementById('contenu-textarea');
    if (!textarea) return;
    
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = contenu.substring(start, end);
    
    if (selectedText) {
      const beforeText = contenu.substring(0, start);
      const afterText = contenu.substring(end);
      const newText = `${beforeText}<span style="color: ${colorHex}; font-weight: bold;">${selectedText}</span>${afterText}`;
      setContenu(newText);
      
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start + 40, end + 40);
      }, 10);
    } else {
      toast.info("Sélectionnez d'abord le texte à colorer");
    }
  };

  // Charger l'actualité existante
  useEffect(() => {
    const fetchActualite = async () => {
      if (!id) return;
      
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("actualites")
          .select("*")
          .eq("id", id)
          .single();

        if (error) throw error;

        setTitre(data.titre || "");
        setContenu(data.contenu || "");
        setTextColor(data.text_color || "#374151");
        setBackgroundColor(data.background_color || "#ffffff");
        setIsAlert(data.is_alert || false);
        setExistingImages(data.images || []);
      } catch (error) {
        console.error("Erreur chargement:", error);
        toast.error("Erreur lors du chargement de l'actualité");
        navigate("/actualite");
      } finally {
        setLoading(false);
      }
    };

    fetchActualite();
  }, [id, navigate]);

  const handleNewImages = (e) => {
    const files = Array.from(e.target.files);
    setNewImages(files);
    const previews = files.map(file => URL.createObjectURL(file));
    setNewPreviews(previews);
  };

  const removeExistingImage = (index) => {
    const imageToDelete = existingImages[index];
    setImagesToDelete([...imagesToDelete, imageToDelete]);
    setExistingImages(existingImages.filter((_, i) => i !== index));
  };

  const removeNewImage = (index) => {
    setNewImages(newImages.filter((_, i) => i !== index));
    setNewPreviews(newPreviews.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!titre.trim()) {
      toast.error("Le titre est obligatoire");
      return;
    }

    setSubmitting(true);

    try {
      // 1. Supprimer les images retirées du storage
      for (const imagePath of imagesToDelete) {
        await supabase.storage.from("uploads").remove([imagePath]);
      }

      // 2. Uploader les nouvelles images
      const uploadedPaths = [...existingImages];
      for (const image of newImages) {
        const cleanName = cleanFileName(image.name);
        const fileName = `actualites/${Date.now()}-${cleanName}`;
        const { error: uploadError } = await supabase.storage
          .from("uploads")
          .upload(fileName, image);
        
        if (uploadError) {
          console.error("Upload error:", uploadError);
          toast.error(`Erreur upload: ${uploadError.message}`);
          continue;
        }
        uploadedPaths.push(fileName);
      }

      // 3. Mettre à jour l'actualité
      const { error: updateError } = await supabase
        .from("actualites")
        .update({
          titre: titre.trim(),
          contenu: contenu,
          text_color: textColor,
          background_color: backgroundColor,
          is_alert: isAlert,
          images: uploadedPaths,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id);

      if (updateError) throw updateError;

      toast.success("✅ Actualité modifiée avec succès !");
      navigate("/actualite");

    } catch (error) {
      console.error("Erreur submission:", error);
      toast.error("❌ Erreur lors de la modification");
    } finally {
      setSubmitting(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="flex justify-center items-center h-64 mt-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1a56db]"></div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="text-center mt-20">
        <p className="text-red-600">Accès refusé. Vous devez être administrateur.</p>
        <button onClick={() => navigate("/")} className="mt-4 bg-[#1a56db] text-white px-4 py-2 rounded-lg">
          Retour à l'accueil
        </button>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-5xl mx-auto p-6 mt-20"
    >
      <div className="bg-gradient-to-r from-[#1a56db] to-[#76c21f] text-white rounded-2xl p-6 mb-8">
        <h1 className="text-2xl font-bold">✏️ Modifier l'actualité</h1>
        <p className="text-blue-100 mt-1">Modifiez le contenu de votre actualité</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5 bg-white rounded-xl shadow-md p-6">
        {/* Titre */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Titre <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            className="w-full border border-gray-300 rounded-xl p-3 text-lg focus:ring-2 focus:ring-[#1a56db] focus:border-transparent"
            value={titre}
            onChange={(e) => setTitre(e.target.value)}
            placeholder="Titre de l'actualité"
            required
          />
        </div>

        {/* Options de mise en forme */}
        <div className="bg-gray-50 rounded-xl p-4 space-y-4">
          <div className="flex flex-wrap gap-4 items-center">
            {/* Couleur du texte global */}
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Couleur texte:</span>
              {TEXT_COLORS.map((color) => (
                <button
                  key={color.hex}
                  type="button"
                  onClick={() => setTextColor(color.hex)}
                  className={`w-8 h-8 rounded-full transition-transform hover:scale-110 shadow-sm ${color.class}`}
                  style={{ backgroundColor: color.hex }}
                  title={color.name}
                />
              ))}
            </div>
            
            {/* Couleur de fond */}
            <div className="flex items-center gap-2 border-l border-gray-300 pl-4">
              <span className="text-sm font-medium">Fond:</span>
              {BACKGROUND_COLORS.map((color) => (
                <button
                  key={color.hex}
                  type="button"
                  onClick={() => setBackgroundColor(color.hex)}
                  className={`w-8 h-8 rounded-full transition-transform hover:scale-110 shadow-sm ${color.class}`}
                  style={{ backgroundColor: color.hex }}
                  title={color.name}
                />
              ))}
            </div>
            
            {/* Alerte */}
            <label className="flex items-center gap-2 border-l border-gray-300 pl-4 cursor-pointer">
              <input
                type="checkbox"
                checked={isAlert}
                onChange={(e) => setIsAlert(e.target.checked)}
                className="w-4 h-4"
              />
              <span className="text-sm font-medium">⚠️ Alerte importante</span>
            </label>
          </div>
        </div>

        {/* Contenu avec barre d'outils complète */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Contenu</label>
          
          {/* Barre d'outils */}
          <div className="flex flex-wrap gap-1 mb-2 p-2 bg-gray-100 rounded-t-lg border border-gray-300">
            <button
              type="button"
              onClick={applyBold}
              className="px-3 py-1.5 bg-white rounded hover:bg-gray-200 font-bold"
              title="Gras"
            >
              <span className="font-bold">Gras</span>
            </button>
            <button
              type="button"
              onClick={applyItalic}
              className="px-3 py-1.5 bg-white rounded hover:bg-gray-200 italic"
              title="Italique"
            >
              <span className="italic">Italique</span>
            </button>
            <button
              type="button"
              onClick={applyUnderline}
              className="px-3 py-1.5 bg-white rounded hover:bg-gray-200 underline"
              title="Souligné"
            >
              <span className="underline">Souligné</span>
            </button>
            <div className="w-px h-6 bg-gray-400 mx-1"></div>
            <button
              type="button"
              onClick={applyTitle}
              className="px-3 py-1.5 bg-white rounded hover:bg-gray-200 text-sm"
              title="Titre"
            >
              Titre
            </button>
            <button
              type="button"
              onClick={applySubtitle}
              className="px-3 py-1.5 bg-white rounded hover:bg-gray-200 text-sm"
              title="Sous-titre"
            >
              Sous-titre
            </button>
            <div className="w-px h-6 bg-gray-400 mx-1"></div>
            <button
              type="button"
              onClick={applyList}
              className="px-3 py-1.5 bg-white rounded hover:bg-gray-200 text-sm"
              title="Liste à puces"
            >
              • Puces
            </button>
            <button
              type="button"
              onClick={applyNumberedList}
              className="px-3 py-1.5 bg-white rounded hover:bg-gray-200 text-sm"
              title="Liste numérotée"
            >
              1. Numéros
            </button>
            <div className="w-px h-6 bg-gray-400 mx-1"></div>
            <button
              type="button"
              onClick={applyLink}
              className="px-3 py-1.5 bg-white rounded hover:bg-gray-200 text-sm"
              title="Insérer un lien"
            >
              🔗 Lien
            </button>
          </div>
          
          {/* Barre de couleurs */}
          <div className="flex flex-wrap gap-2 mb-2 p-2 bg-gray-50 rounded-lg border border-gray-200">
            <span className="text-xs font-medium text-gray-600 self-center">Colorer le texte sélectionné:</span>
            {TEXT_COLORS.map((color) => (
              <button
                key={color.hex}
                type="button"
                onClick={() => applyColorToSelection(color.hex)}
                className="w-6 h-6 rounded-full transition-transform hover:scale-110 shadow-sm"
                style={{ backgroundColor: color.hex }}
                title={`Colorer en ${color.name}`}
              />
            ))}
          </div>
          
          <textarea
            id="contenu-textarea"
            className="w-full border border-gray-300 p-4 rounded-b-lg font-mono text-sm"
            rows="14"
            value={contenu}
            onChange={(e) => setContenu(e.target.value)}
            style={{ color: textColor }}
            placeholder="Saisissez le contenu de votre actualité ici... Utilisez les boutons ci-dessus pour formater le texte."
          />
          <p className="text-xs text-gray-500 mt-2">
            💡 Astuces: Sélectionnez du texte puis utilisez les boutons (Gras, Italique, Couleur...)
          </p>
        </div>

        {/* Images existantes */}
        {existingImages.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Images actuelles</label>
            <div className="flex flex-wrap gap-3">
              {existingImages.map((img, idx) => (
                <div key={idx} className="relative group">
                  <img
                    src={getImageUrl(img)}
                    alt={`Image ${idx + 1}`}
                    className="w-24 h-24 object-cover rounded-lg border shadow-sm"
                    onError={(e) => e.target.src = "https://placehold.co/100x100?text=Image"}
                  />
                  <button
                    type="button"
                    onClick={() => removeExistingImage(idx)}
                    className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full w-6 h-6 text-sm opacity-0 group-hover:opacity-100 transition"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Ajouter nouvelles images */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Ajouter des images</label>
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleNewImages}
            className="w-full"
          />
          <p className="text-xs text-gray-500 mt-1">
            Maintenez Ctrl (ou Cmd) pour sélectionner plusieurs images
          </p>
        </div>

        {/* Aperçu nouvelles images */}
        {newPreviews.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Nouvelles images</label>
            <div className="flex flex-wrap gap-3">
              {newPreviews.map((preview, idx) => (
                <div key={idx} className="relative group">
                  <img
                    src={preview}
                    alt={`Nouvelle ${idx + 1}`}
                    className="w-24 h-24 object-cover rounded-lg border shadow-sm"
                  />
                  <button
                    type="button"
                    onClick={() => removeNewImage(idx)}
                    className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full w-6 h-6 text-sm opacity-0 group-hover:opacity-100 transition"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Boutons */}
        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            disabled={submitting}
            className="bg-gradient-to-r from-[#1a56db] to-[#76c21f] text-white px-6 py-2 rounded-xl font-semibold hover:shadow-lg transition disabled:opacity-50"
          >
            {submitting ? "Enregistrement..." : "💾 Enregistrer les modifications"}
          </button>
          <button
            type="button"
            onClick={() => navigate("/actualite")}
            className="bg-gray-200 text-gray-700 px-6 py-2 rounded-xl font-semibold hover:bg-gray-300 transition"
          >
            Annuler
          </button>
        </div>
      </form>
    </motion.div>
  );
}