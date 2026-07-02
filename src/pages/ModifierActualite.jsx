// frontend/src/pages/ModifierActualite.jsx
import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-toastify";
import { motion } from "framer-motion";

// Couleurs pour l'éditeur
const TEXT_COLORS = [
  { name: "Bleu", hex: "#1a56db", class: "text-blue-600" },
  { name: "Vert", hex: "#76c21f", class: "text-green-600" },
  { name: "Orange", hex: "#f59e0b", class: "text-orange-500" },
  { name: "Rouge", hex: "#dc2626", class: "text-red-600" },
  { name: "Noir", hex: "#374151", class: "text-gray-800" },
  { name: "Violet", hex: "#7c3aed", class: "text-purple-600" },
  { name: "Rose", hex: "#ec4899", class: "text-pink-500" }
];

const BACKGROUND_COLORS = [
  { name: "Blanc", hex: "#ffffff", class: "bg-white" },
  { name: "Bleu clair", hex: "#dbeafe", class: "bg-blue-50" },
  { name: "Vert clair", hex: "#d1fae5", class: "bg-green-50" },
  { name: "Orange clair", hex: "#fef3c7", class: "bg-orange-50" },
  { name: "Rouge clair (Alerte)", hex: "#fee2e2", class: "bg-red-50" },
  { name: "Gris clair", hex: "#f3f4f6", class: "bg-gray-50" },
  { name: "Jaune clair", hex: "#fef9c3", class: "bg-yellow-50" }
];

export default function ModifierActualite() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAdmin, loading: authLoading } = useAuth();
  const textareaRef = useRef(null);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  
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

  // ============ FONCTIONS DE MISE EN FORME ============

  // Insérer une balise autour du texte sélectionné
  const wrapText = (openTag, closeTag) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = contenu.substring(start, end);
    
    if (selectedText) {
      const beforeText = contenu.substring(0, start);
      const afterText = contenu.substring(end);
      const newText = `${beforeText}${openTag}${selectedText}${closeTag}${afterText}`;
      setContenu(newText);
      
      // Restaurer la sélection après la mise à jour
      setTimeout(() => {
        textarea.focus();
        const newStart = start + openTag.length;
        const newEnd = end + openTag.length;
        textarea.setSelectionRange(newStart, newEnd);
      }, 10);
    } else {
      toast.info("Sélectionnez d'abord le texte à mettre en forme");
    }
  };

  // Appliquer le gras
  const applyBold = () => wrapText('<strong>', '</strong>');

  // Appliquer l'italique
  const applyItalic = () => wrapText('<em>', '</em>');

  // Appliquer le souligné
  const applyUnderline = () => wrapText('<u>', '</u>');

  // Appliquer le barré
  const applyStrike = () => wrapText('<del>', '</del>');

  // Appliquer un titre
  const applyTitle = () => wrapText('<h2 class="text-2xl font-bold mt-4 mb-2">', '</h2>');

  // Appliquer un sous-titre
  const applySubtitle = () => wrapText('<h3 class="text-xl font-semibold mt-3 mb-1">', '</h3>');

  // Créer une liste à puces
  const applyList = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = contenu.substring(start, end);
    
    if (selectedText) {
      const lines = selectedText.split('\n').filter(line => line.trim() !== '');
      const beforeText = contenu.substring(0, start);
      const afterText = contenu.substring(end);
      
      if (lines.length > 0) {
        const listItems = lines.map(line => `  <li>${line.trim()}</li>`).join('\n');
        const newText = `${beforeText}\n<ul class="list-disc pl-6 my-2">\n${listItems}\n</ul>\n${afterText}`;
        setContenu(newText);
        
        setTimeout(() => {
          textarea.focus();
          const newPos = start + 38 + (listItems.length > 0 ? listItems.length : 0);
          textarea.setSelectionRange(newPos, newPos);
        }, 10);
      }
    } else {
      toast.info("Sélectionnez d'abord le texte à mettre en liste");
    }
  };

  // Créer une liste numérotée
  const applyNumberedList = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = contenu.substring(start, end);
    
    if (selectedText) {
      const lines = selectedText.split('\n').filter(line => line.trim() !== '');
      const beforeText = contenu.substring(0, start);
      const afterText = contenu.substring(end);
      
      if (lines.length > 0) {
        const listItems = lines.map((line, i) => `  <li>${line.trim()}</li>`).join('\n');
        const newText = `${beforeText}\n<ol class="list-decimal pl-6 my-2">\n${listItems}\n</ol>\n${afterText}`;
        setContenu(newText);
        
        setTimeout(() => {
          textarea.focus();
          const newPos = start + 39 + (listItems.length > 0 ? listItems.length : 0);
          textarea.setSelectionRange(newPos, newPos);
        }, 10);
      }
    } else {
      toast.info("Sélectionnez d'abord le texte à mettre en liste");
    }
  };

  // Ajouter un lien
  const applyLink = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = contenu.substring(start, end);
    
    if (selectedText) {
      const url = prompt("Entrez l'URL du lien:", "https://");
      if (url) {
        wrapText(`<a href="${url}" target="_blank" rel="noopener noreferrer" class="text-blue-600 underline hover:text-blue-800">`, '</a>');
      }
    } else {
      toast.info("Sélectionnez d'abord le texte à transformer en lien");
    }
  };

  // Ajouter un bouton
  const applyButton = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = contenu.substring(start, end);
    const textToUse = selectedText || "Cliquez ici";
    
    const url = prompt("Entrez l'URL du bouton:", "https://");
    if (url !== null) {
      const btnHtml = `<a href="${url}" target="_blank" rel="noopener noreferrer" class="inline-block bg-gradient-to-r from-[#1a56db] to-[#76c21f] text-white px-6 py-2 rounded-lg font-semibold hover:shadow-lg transition my-2">${textToUse}</a>`;
      
      const beforeText = contenu.substring(0, start);
      const afterText = contenu.substring(end);
      setContenu(`${beforeText}${btnHtml}${afterText}`);
      
      setTimeout(() => {
        textarea.focus();
        const newPos = start + btnHtml.length;
        textarea.setSelectionRange(newPos, newPos);
      }, 10);
    }
  };

  // Ajouter une image dans le contenu
  const applyImage = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const beforeText = contenu.substring(0, start);
    const afterText = contenu.substring(start);
    const imgHtml = `<img src="url-de-l-image" alt="Description" class="max-w-full h-auto rounded-lg my-2" />`;
    setContenu(`${beforeText}${imgHtml}${afterText}`);
    
    setTimeout(() => {
      textarea.focus();
      const newStart = start + 10;
      const newEnd = newStart + 14;
      textarea.setSelectionRange(newStart, newEnd);
    }, 10);
  };

  // Ajouter une citation
  const applyQuote = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = contenu.substring(start, end);
    
    if (selectedText) {
      wrapText('<blockquote class="border-l-4 border-blue-500 pl-4 my-2 italic text-gray-700">', '</blockquote>');
    } else {
      const beforeText = contenu.substring(0, start);
      const afterText = contenu.substring(start);
      const newText = `${beforeText}<blockquote class="border-l-4 border-blue-500 pl-4 my-2 italic text-gray-700">Votre citation ici</blockquote>${afterText}`;
      setContenu(newText);
      
      setTimeout(() => {
        textarea.focus();
        const newStart = start + 72;
        const newEnd = newStart + 18;
        textarea.setSelectionRange(newStart, newEnd);
      }, 10);
    }
  };

  // Ajouter un emoji (sélecteur simple)
  const insertEmoji = (emoji) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const beforeText = contenu.substring(0, start);
    const afterText = contenu.substring(start);
    setContenu(`${beforeText}${emoji}${afterText}`);
    
    setTimeout(() => {
      textarea.focus();
      textarea.selectionStart = start + emoji.length;
      textarea.selectionEnd = start + emoji.length;
    }, 10);
  };

  // Colorer le texte sélectionné
  const applyColorToSelection = (colorHex) => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = contenu.substring(start, end);
    
    if (selectedText) {
      const beforeText = contenu.substring(0, start);
      const afterText = contenu.substring(end);
      const newText = `${beforeText}<span style="color: ${colorHex}; font-weight: 500;">${selectedText}</span>${afterText}`;
      setContenu(newText);
      
      setTimeout(() => {
        textarea.focus();
        const newStart = start + 46;
        const newEnd = end + 46;
        textarea.setSelectionRange(newStart, newEnd);
      }, 10);
    } else {
      toast.info("Sélectionnez d'abord le texte à colorer");
    }
  };

  // ============ GESTION DU RETOUR À LA LIGNE ============

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      // Si Shift+Enter, insérer un <br> pour un retour à la ligne simple
      if (e.shiftKey) {
        e.preventDefault();
        const textarea = e.target;
        const start = textarea.selectionStart;
        const beforeText = contenu.substring(0, start);
        const afterText = contenu.substring(start);
        setContenu(`${beforeText}<br>${afterText}`);
        
        setTimeout(() => {
          textarea.selectionStart = start + 4;
          textarea.selectionEnd = start + 4;
        }, 10);
      } else {
        // Enter simple : insérer un nouveau paragraphe
        e.preventDefault();
        const textarea = e.target;
        const start = textarea.selectionStart;
        const beforeText = contenu.substring(0, start);
        const afterText = contenu.substring(start);
        setContenu(`${beforeText}</p><p>${afterText}`);
        
        setTimeout(() => {
          textarea.selectionStart = start + 7;
          textarea.selectionEnd = start + 7;
        }, 10);
      }
    }
  };

  // ============ CHARGEMENT DE L'ACTUALITÉ ============

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

  // ============ GESTION DES IMAGES ============

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

  // ============ SOUMISSION ============

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

  // ============ RENDU ============

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
          
          {/* Barre d'outils - Ligne 1 */}
          <div className="flex flex-wrap gap-1 mb-1 p-2 bg-gray-100 rounded-t-lg border border-gray-300">
            <button
              type="button"
              onClick={applyBold}
              className="px-3 py-1.5 bg-white rounded hover:bg-gray-200 font-bold text-sm border border-gray-300"
              title="Gras (Ctrl+B)"
            >
              <span className="font-bold">B</span>
            </button>
            <button
              type="button"
              onClick={applyItalic}
              className="px-3 py-1.5 bg-white rounded hover:bg-gray-200 italic text-sm border border-gray-300"
              title="Italique (Ctrl+I)"
            >
              <span className="italic">I</span>
            </button>
            <button
              type="button"
              onClick={applyUnderline}
              className="px-3 py-1.5 bg-white rounded hover:bg-gray-200 underline text-sm border border-gray-300"
              title="Souligné (Ctrl+U)"
            >
              <span className="underline">U</span>
            </button>
            <button
              type="button"
              onClick={applyStrike}
              className="px-3 py-1.5 bg-white rounded hover:bg-gray-200 text-sm border border-gray-300 line-through"
              title="Barré"
            >
              <span className="line-through">S</span>
            </button>
            
            <div className="w-px h-6 bg-gray-300 mx-1"></div>
            
            <button
              type="button"
              onClick={applyTitle}
              className="px-3 py-1.5 bg-white rounded hover:bg-gray-200 text-sm border border-gray-300 font-semibold"
              title="Titre H2"
            >
              H2
            </button>
            <button
              type="button"
              onClick={applySubtitle}
              className="px-3 py-1.5 bg-white rounded hover:bg-gray-200 text-sm border border-gray-300 font-medium"
              title="Sous-titre H3"
            >
              H3
            </button>
            
            <div className="w-px h-6 bg-gray-300 mx-1"></div>
            
            <button
              type="button"
              onClick={applyList}
              className="px-3 py-1.5 bg-white rounded hover:bg-gray-200 text-sm border border-gray-300"
              title="Liste à puces"
            >
              • Liste
            </button>
            <button
              type="button"
              onClick={applyNumberedList}
              className="px-3 py-1.5 bg-white rounded hover:bg-gray-200 text-sm border border-gray-300"
              title="Liste numérotée"
            >
              1. Liste
            </button>
            
            <div className="w-px h-6 bg-gray-300 mx-1"></div>
            
            <button
              type="button"
              onClick={applyLink}
              className="px-3 py-1.5 bg-white rounded hover:bg-gray-200 text-sm border border-gray-300 text-blue-600"
              title="Lien hypertexte"
            >
              🔗 Lien
            </button>
            <button
              type="button"
              onClick={applyButton}
              className="px-3 py-1.5 bg-white rounded hover:bg-gray-200 text-sm border border-gray-300 text-green-600"
              title="Bouton"
            >
              ⬛ Bouton
            </button>
            <button
              type="button"
              onClick={applyImage}
              className="px-3 py-1.5 bg-white rounded hover:bg-gray-200 text-sm border border-gray-300"
              title="Image dans le contenu"
            >
              🖼️ Image
            </button>
            <button
              type="button"
              onClick={applyQuote}
              className="px-3 py-1.5 bg-white rounded hover:bg-gray-200 text-sm border border-gray-300"
              title="Citation"
            >
              “ Citation
            </button>
          </div>
          
          {/* Barre de couleurs */}
          <div className="flex flex-wrap gap-1 mb-2 p-1.5 bg-gray-50 rounded-b-lg border border-gray-300 border-t-0">
            <span className="text-xs font-medium text-gray-600 self-center mr-1">🎨 Colorer:</span>
            {TEXT_COLORS.map((color) => (
              <button
                key={color.hex}
                type="button"
                onClick={() => applyColorToSelection(color.hex)}
                className="w-6 h-6 rounded-full transition-transform hover:scale-110 shadow-sm border border-gray-300"
                style={{ backgroundColor: color.hex }}
                title={`Colorer en ${color.name}`}
              />
            ))}
            
            <div className="w-px h-6 bg-gray-300 mx-1"></div>
            
            <span className="text-xs font-medium text-gray-600 self-center mr-1">😊 Emojis:</span>
            <button type="button" onClick={() => insertEmoji('✅')} className="text-lg hover:scale-110 transition">✅</button>
            <button type="button" onClick={() => insertEmoji('⚠️')} className="text-lg hover:scale-110 transition">⚠️</button>
            <button type="button" onClick={() => insertEmoji('📌')} className="text-lg hover:scale-110 transition">📌</button>
            <button type="button" onClick={() => insertEmoji('🎯')} className="text-lg hover:scale-110 transition">🎯</button>
            <button type="button" onClick={() => insertEmoji('🔥')} className="text-lg hover:scale-110 transition">🔥</button>
            <button type="button" onClick={() => insertEmoji('💡')} className="text-lg hover:scale-110 transition">💡</button>
            <button type="button" onClick={() => insertEmoji('📢')} className="text-lg hover:scale-110 transition">📢</button>
          </div>
          
          <textarea
            ref={textareaRef}
            id="contenu-textarea"
            className="w-full border border-gray-300 p-4 rounded-b-lg font-mono text-sm min-h-[300px] focus:ring-2 focus:ring-[#1a56db] focus:border-transparent"
            rows="14"
            value={contenu}
            onChange={(e) => setContenu(e.target.value)}
            onKeyDown={handleKeyDown}
            style={{ color: textColor, backgroundColor: backgroundColor }}
            placeholder="Saisissez le contenu de votre actualité ici... Utilisez les boutons ci-dessus pour formater le texte."
          />
          
          <div className="flex justify-between items-center mt-1">
            <p className="text-xs text-gray-500">
              💡 Astuces : 
              <span className="ml-2">• Sélectionnez du texte et cliquez sur un bouton</span>
              <span className="ml-2">• <kbd className="px-1 bg-gray-200 rounded">Entrée</kbd> = nouveau paragraphe</span>
              <span className="ml-2">• <kbd className="px-1 bg-gray-200 rounded">Shift</kbd> + <kbd className="px-1 bg-gray-200 rounded">Entrée</kbd> = retour à la ligne</span>
            </p>
            <button
              type="button"
              onClick={() => setShowPreview(!showPreview)}
              className="text-sm text-blue-600 hover:underline"
            >
              {showPreview ? "Masquer l'aperçu" : "👁️ Aperçu du contenu"}
            </button>
          </div>
          
          {/* Aperçu en direct */}
          {showPreview && (
            <div className="mt-3 p-4 border border-gray-300 rounded-lg bg-gray-50">
              <h3 className="text-sm font-medium text-gray-700 mb-2">📄 Aperçu :</h3>
              <div 
                className="prose prose-sm max-w-none"
                style={{ color: textColor }}
                dangerouslySetInnerHTML={{ 
                  __html: contenu || "<span class='text-gray-400 italic'>Le contenu s'affichera ici...</span>" 
                }} 
              />
            </div>
          )}
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
                    className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full w-6 h-6 text-sm opacity-0 group-hover:opacity-100 transition hover:bg-red-700"
                    title="Supprimer cette image"
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
                    className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full w-6 h-6 text-sm opacity-0 group-hover:opacity-100 transition hover:bg-red-700"
                    title="Supprimer cette image"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Boutons */}
        <div className="flex flex-wrap gap-3 pt-4 border-t border-gray-200">
          <button
            type="submit"
            disabled={submitting}
            className="bg-gradient-to-r from-[#1a56db] to-[#76c21f] text-white px-6 py-2.5 rounded-xl font-semibold hover:shadow-lg transition disabled:opacity-50"
          >
            {submitting ? "⏳ Enregistrement..." : "💾 Enregistrer les modifications"}
          </button>
          <button
            type="button"
            onClick={() => navigate("/actualite")}
            className="bg-gray-200 text-gray-700 px-6 py-2.5 rounded-xl font-semibold hover:bg-gray-300 transition"
          >
            Annuler
          </button>
        </div>
      </form>
    </motion.div>
  );
}