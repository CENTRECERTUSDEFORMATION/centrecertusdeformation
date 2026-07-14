// frontend/src/pages/ModifierActualite.jsx
import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-toastify";
import { motion } from "framer-motion";

const TEXT_COLORS = [
  { name: "Bleu", hex: "#1a56db", class: "text-blue-600" },
  { name: "Vert", hex: "#76c21f", class: "text-green-600" },
  { name: "Orange", hex: "#f59e0b", class: "text-orange-500" },
  { name: "Rouge", hex: "#dc2626", class: "text-red-600" },
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
  const { isAdmin, loading: authLoading } = useAuth();
  const textareaRef = useRef(null);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [direction, setDirection] = useState("ltr");
  const [activeTab, setActiveTab] = useState("accueil");
  
  const [titre, setTitre] = useState("");
  const [contenu, setContenu] = useState("");
  const [textColor, setTextColor] = useState("#374151");
  const [backgroundColor, setBackgroundColor] = useState("#ffffff");
  const [isAlert, setIsAlert] = useState(false);
  const [existingImages, setExistingImages] = useState([]);
  const [newImages, setNewImages] = useState([]);
  const [newPreviews, setNewPreviews] = useState([]);
  const [imagesToDelete, setImagesToDelete] = useState([]);

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

  // ============ ONGLET ACCUEIL - STYLE DE TEXTE ============

  const applyBold = () => wrapText('<strong>', '</strong>');
  const applyItalic = () => wrapText('<em>', '</em>');
  const applyUnderline = () => wrapText('<u>', '</u>');
  const applyStrike = () => wrapText('<del>', '</del>');
  const applySubscript = () => wrapText('<sub>', '</sub>');
  const applySuperscript = () => wrapText('<sup>', '</sup>');

  // ============ ONGLET STRUCTURE - TITRES ET LISTES ============

  const applyTitle = (level) => {
    const tags = {
      1: ['<h1>', '</h1>'],
      2: ['<h2>', '</h2>'],
      3: ['<h3>', '</h3>'],
      4: ['<h4>', '</h4>']
    };
    const [open, close] = tags[level] || tags[2];
    wrapText(open, close);
  };

  const applyList = (type) => {
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
        const tag = type === 'ul' ? 'ul' : 'ol';
        const listItems = lines.map(line => `  <li>${line.trim()}</li>`).join('\n');
        const newText = `${beforeText}\n<${tag}>\n${listItems}\n</${tag}>\n${afterText}`;
        setContenu(newText);
        
        setTimeout(() => {
          textarea.focus();
          const newPos = start + 7 + (listItems.length > 0 ? listItems.length : 0);
          textarea.setSelectionRange(newPos, newPos);
        }, 10);
      }
    } else {
      toast.info("Sélectionnez d'abord le texte à mettre en liste");
    }
  };

  // ============ ONGLET INSERTION - LIENS ET MÉDIAS ============

  const applyLink = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = contenu.substring(start, end);
    
    if (selectedText) {
      const url = prompt("Entrez l'URL du lien:", "https://");
      if (url) {
        const beforeText = contenu.substring(0, start);
        const afterText = contenu.substring(end);
        const newText = `${beforeText}<a href="${url}" target="_blank" rel="noopener noreferrer">${selectedText}</a>${afterText}`;
        setContenu(newText);
        
        setTimeout(() => {
          textarea.focus();
          const newStart = start + 9 + url.length;
          const newEnd = end + 9 + url.length;
          textarea.setSelectionRange(newStart, newEnd);
        }, 10);
      }
    } else {
      toast.info("Sélectionnez d'abord le texte à transformer en lien");
    }
  };

  const applyImage = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const url = prompt("Entrez l'URL de l'image:", "https://");
    if (url) {
      const beforeText = contenu.substring(0, start);
      const afterText = contenu.substring(start);
      const newText = `${beforeText}<img src="${url}" alt="Image" style="max-width: 100%; border-radius: 8px;" />${afterText}`;
      setContenu(newText);
      
      setTimeout(() => {
        textarea.focus();
        const newStart = start + 10 + url.length;
        textarea.setSelectionRange(newStart, newStart);
      }, 10);
    }
  };

  const applyTable = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const beforeText = contenu.substring(0, start);
    const afterText = contenu.substring(start);
    const tableHtml = `
<table style="width: 100%; border-collapse: collapse; margin: 10px 0;">
  <tr>
    <th style="border: 1px solid #ddd; padding: 8px; background: #f2f2f2;">Colonne 1</th>
    <th style="border: 1px solid #ddd; padding: 8px; background: #f2f2f2;">Colonne 2</th>
  </tr>
  <tr>
    <td style="border: 1px solid #ddd; padding: 8px;">Donnée 1</td>
    <td style="border: 1px solid #ddd; padding: 8px;">Donnée 2</td>
  </tr>
</table>`;
    setContenu(`${beforeText}${tableHtml}${afterText}`);
    
    setTimeout(() => {
      textarea.focus();
      textarea.selectionStart = start + tableHtml.length;
      textarea.selectionEnd = start + tableHtml.length;
    }, 10);
  };

  const applyHorizontalRule = () => {
    wrapText('\n<hr style="border: 1px solid #ddd; margin: 20px 0;" />\n', '');
  };

  // ============ ONGLET FORMAT - CITATIONS ET STYLES ============

  const applyQuote = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = contenu.substring(start, end);
    
    if (selectedText) {
      wrapText('<blockquote style="border-left: 4px solid #1a56db; padding-left: 16px; margin: 16px 0; color: #4b5563;">', '</blockquote>');
    } else {
      const beforeText = contenu.substring(0, start);
      const afterText = contenu.substring(start);
      const newText = `${beforeText}<blockquote style="border-left: 4px solid #1a56db; padding-left: 16px; margin: 16px 0; color: #4b5563;">Votre citation ici</blockquote>${afterText}`;
      setContenu(newText);
      
      setTimeout(() => {
        textarea.focus();
        const newStart = start + 106;
        const newEnd = newStart + 18;
        textarea.setSelectionRange(newStart, newEnd);
      }, 10);
    }
  };

  const applyCode = () => wrapText('<code style="background: #f3f4f6; padding: 2px 6px; border-radius: 4px; font-family: monospace;">', '</code>');
  const applyPreformatted = () => wrapText('<pre style="background: #1f2937; color: #f3f4f6; padding: 16px; border-radius: 8px; overflow-x: auto;">', '</pre>');

  // ============ ONGLET COULEUR ============

  const applyTextColor = (colorHex) => {
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

  const applyHighlight = (colorHex) => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = contenu.substring(start, end);
    
    if (selectedText) {
      const beforeText = contenu.substring(0, start);
      const afterText = contenu.substring(end);
      const newText = `${beforeText}<span style="background-color: ${colorHex}; padding: 0 4px; border-radius: 3px;">${selectedText}</span>${afterText}`;
      setContenu(newText);
      
      setTimeout(() => {
        textarea.focus();
        const newStart = start + 60;
        const newEnd = end + 60;
        textarea.setSelectionRange(newStart, newEnd);
      }, 10);
    } else {
      toast.info("Sélectionnez d'abord le texte à surligner");
    }
  };

  // ============ ALIGNEMENT ============

  const applyAlignment = (align) => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = contenu.substring(start, end);
    
    if (selectedText) {
      wrapText(`<div style="text-align: ${align};">`, '</div>');
    } else {
      toast.info("Sélectionnez d'abord le texte à aligner");
    }
  };

  // ============ GESTION DU RETOUR À LA LIGNE ============

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
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

  const toggleDirection = () => {
    setDirection(prev => prev === "ltr" ? "rtl" : "ltr");
    if (textareaRef.current) {
      textareaRef.current.style.direction = direction === "ltr" ? "rtl" : "ltr";
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

        if (error) {
          console.error("Erreur chargement:", error);
          toast.error("Erreur lors du chargement de l'actualité");
          navigate("/actualite");
          return;
        }

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
      for (const imagePath of imagesToDelete) {
        try {
          await supabase.storage.from("uploads").remove([imagePath]);
        } catch (err) {
          console.error("Erreur suppression image:", err);
        }
      }

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

      const updateData = {
        titre: titre.trim(),
        contenu: contenu,
        text_color: textColor,
        background_color: backgroundColor,
        is_alert: isAlert,
        images: uploadedPaths,
        updated_at: new Date().toISOString()
      };

      const { error: updateError } = await supabase
        .from("actualites")
        .update(updateData)
        .eq("id", id);

      if (updateError) {
        console.error("❌ Erreur update:", updateError);
        toast.error(`Erreur de mise à jour: ${updateError.message}`);
        throw updateError;
      }

      toast.success("✅ Actualité modifiée avec succès !");
      navigate("/actualite");

    } catch (error) {
      console.error("❌ Erreur submission:", error);
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
      className="max-w-6xl mx-auto p-6 mt-20"
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

        {/* Contenu avec onglets */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Contenu</label>
          
          {/* Onglets */}
          <div className="flex flex-wrap border-b border-gray-300 bg-gray-50 rounded-t-lg">
            <button
              type="button"
              onClick={() => setActiveTab("accueil")}
              className={`px-4 py-2 text-sm font-medium transition ${activeTab === "accueil" ? "bg-white border-b-2 border-blue-600 text-blue-600" : "text-gray-600 hover:text-blue-600"}`}
            >
              🏠 Accueil
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("structure")}
              className={`px-4 py-2 text-sm font-medium transition ${activeTab === "structure" ? "bg-white border-b-2 border-blue-600 text-blue-600" : "text-gray-600 hover:text-blue-600"}`}
            >
              📐 Structure
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("insertion")}
              className={`px-4 py-2 text-sm font-medium transition ${activeTab === "insertion" ? "bg-white border-b-2 border-blue-600 text-blue-600" : "text-gray-600 hover:text-blue-600"}`}
            >
              📎 Insertion
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("format")}
              className={`px-4 py-2 text-sm font-medium transition ${activeTab === "format" ? "bg-white border-b-2 border-blue-600 text-blue-600" : "text-gray-600 hover:text-blue-600"}`}
            >
              🎨 Format
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("couleur")}
              className={`px-4 py-2 text-sm font-medium transition ${activeTab === "couleur" ? "bg-white border-b-2 border-blue-600 text-blue-600" : "text-gray-600 hover:text-blue-600"}`}
            >
              🌈 Couleur
            </button>
          </div>

          {/* Contenu des onglets */}
          <div className="border-x border-gray-300 p-2 bg-gray-50">

            {/* Onglet Accueil - Style de texte */}
            {activeTab === "accueil" && (
              <div className="flex flex-wrap items-center gap-1">
                <span className="text-xs text-gray-500 mr-1 font-medium">Style:</span>
                <button type="button" onClick={applyBold} className="px-3 py-1.5 bg-white rounded hover:bg-gray-200 font-bold text-sm border border-gray-300" title="Gras">B</button>
                <button type="button" onClick={applyItalic} className="px-3 py-1.5 bg-white rounded hover:bg-gray-200 italic text-sm border border-gray-300" title="Italique">I</button>
                <button type="button" onClick={applyUnderline} className="px-3 py-1.5 bg-white rounded hover:bg-gray-200 underline text-sm border border-gray-300" title="Souligné">U</button>
                <button type="button" onClick={applyStrike} className="px-3 py-1.5 bg-white rounded hover:bg-gray-200 line-through text-sm border border-gray-300" title="Barré">S</button>
                <button type="button" onClick={applySubscript} className="px-3 py-1.5 bg-white rounded hover:bg-gray-200 text-sm border border-gray-300" title="Indice">X₂</button>
                <button type="button" onClick={applySuperscript} className="px-3 py-1.5 bg-white rounded hover:bg-gray-200 text-sm border border-gray-300" title="Exposant">X²</button>
              </div>
            )}

            {/* Onglet Structure - Titres et listes */}
            {activeTab === "structure" && (
              <div className="flex flex-wrap items-center gap-1">
                <span className="text-xs text-gray-500 mr-1 font-medium">Titres:</span>
                <button type="button" onClick={() => applyTitle(1)} className="px-3 py-1.5 bg-white rounded hover:bg-gray-200 text-sm border border-gray-300 font-bold">H1</button>
                <button type="button" onClick={() => applyTitle(2)} className="px-3 py-1.5 bg-white rounded hover:bg-gray-200 text-sm border border-gray-300 font-bold">H2</button>
                <button type="button" onClick={() => applyTitle(3)} className="px-3 py-1.5 bg-white rounded hover:bg-gray-200 text-sm border border-gray-300 font-semibold">H3</button>
                <button type="button" onClick={() => applyTitle(4)} className="px-3 py-1.5 bg-white rounded hover:bg-gray-200 text-sm border border-gray-300 font-medium">H4</button>
                <span className="text-xs text-gray-500 mx-1">|</span>
                <button type="button" onClick={() => applyList('ul')} className="px-3 py-1.5 bg-white rounded hover:bg-gray-200 text-sm border border-gray-300">• Liste</button>
                <button type="button" onClick={() => applyList('ol')} className="px-3 py-1.5 bg-white rounded hover:bg-gray-200 text-sm border border-gray-300">1. Liste</button>
              </div>
            )}

            {/* Onglet Insertion - Liens et médias */}
            {activeTab === "insertion" && (
              <div className="flex flex-wrap items-center gap-1">
                <span className="text-xs text-gray-500 mr-1 font-medium">Médias:</span>
                <button type="button" onClick={applyLink} className="px-3 py-1.5 bg-white rounded hover:bg-gray-200 text-sm border border-gray-300 text-blue-600">🔗 Lien</button>
                <button type="button" onClick={applyImage} className="px-3 py-1.5 bg-white rounded hover:bg-gray-200 text-sm border border-gray-300 text-green-600">🖼️ Image</button>
                <button type="button" onClick={applyTable} className="px-3 py-1.5 bg-white rounded hover:bg-gray-200 text-sm border border-gray-300">📊 Tableau</button>
                <button type="button" onClick={applyHorizontalRule} className="px-3 py-1.5 bg-white rounded hover:bg-gray-200 text-sm border border-gray-300">➖ Ligne</button>
              </div>
            )}

            {/* Onglet Format - Citations et styles */}
            {activeTab === "format" && (
              <div className="flex flex-wrap items-center gap-1">
                <span className="text-xs text-gray-500 mr-1 font-medium">Format:</span>
                <button type="button" onClick={applyQuote} className="px-3 py-1.5 bg-white rounded hover:bg-gray-200 text-sm border border-gray-300">“ Citation</button>
                <button type="button" onClick={applyCode} className="px-3 py-1.5 bg-white rounded hover:bg-gray-200 text-sm border border-gray-300">{`<> Code`}</button>
                <button type="button" onClick={applyPreformatted} className="px-3 py-1.5 bg-white rounded hover:bg-gray-200 text-sm border border-gray-300">📄 Préformaté</button>
                <span className="text-xs text-gray-500 mx-1">|</span>
                <span className="text-xs text-gray-500 mr-1">Alignement:</span>
                <button type="button" onClick={() => applyAlignment('left')} className="px-2 py-1 bg-white rounded hover:bg-gray-200 text-sm border border-gray-300" title="Gauche">⬅️</button>
                <button type="button" onClick={() => applyAlignment('center')} className="px-2 py-1 bg-white rounded hover:bg-gray-200 text-sm border border-gray-300" title="Centrer">⬛</button>
                <button type="button" onClick={() => applyAlignment('right')} className="px-2 py-1 bg-white rounded hover:bg-gray-200 text-sm border border-gray-300" title="Droite">➡️</button>
                <button type="button" onClick={() => applyAlignment('justify')} className="px-2 py-1 bg-white rounded hover:bg-gray-200 text-sm border border-gray-300" title="Justifier">↔️</button>
              </div>
            )}

            {/* Onglet Couleur */}
            {activeTab === "couleur" && (
              <div className="flex flex-wrap items-center gap-1">
                <span className="text-xs text-gray-500 mr-1 font-medium">🎨 Texte:</span>
                <button type="button" onClick={() => applyTextColor('#1a56db')} className="w-8 h-8 rounded-full border border-gray-300 hover:scale-110 transition" style={{ backgroundColor: '#1a56db' }} title="Bleu"></button>
                <button type="button" onClick={() => applyTextColor('#76c21f')} className="w-8 h-8 rounded-full border border-gray-300 hover:scale-110 transition" style={{ backgroundColor: '#76c21f' }} title="Vert"></button>
                <button type="button" onClick={() => applyTextColor('#f59e0b')} className="w-8 h-8 rounded-full border border-gray-300 hover:scale-110 transition" style={{ backgroundColor: '#f59e0b' }} title="Orange"></button>
                <button type="button" onClick={() => applyTextColor('#dc2626')} className="w-8 h-8 rounded-full border border-gray-300 hover:scale-110 transition" style={{ backgroundColor: '#dc2626' }} title="Rouge"></button>
                <button type="button" onClick={() => applyTextColor('#7c3aed')} className="w-8 h-8 rounded-full border border-gray-300 hover:scale-110 transition" style={{ backgroundColor: '#7c3aed' }} title="Violet"></button>
                <button type="button" onClick={() => applyTextColor('#ec4899')} className="w-8 h-8 rounded-full border border-gray-300 hover:scale-110 transition" style={{ backgroundColor: '#ec4899' }} title="Rose"></button>
                <span className="text-xs text-gray-500 mx-1">|</span>
                <span className="text-xs text-gray-500 mr-1">🟡 Surligner:</span>
                <button type="button" onClick={() => applyHighlight('#fef08a')} className="w-8 h-8 rounded-full border border-gray-300 hover:scale-110 transition" style={{ backgroundColor: '#fef08a' }} title="Jaune"></button>
                <button type="button" onClick={() => applyHighlight('#fca5a5')} className="w-8 h-8 rounded-full border border-gray-300 hover:scale-110 transition" style={{ backgroundColor: '#fca5a5' }} title="Rouge"></button>
                <button type="button" onClick={() => applyHighlight('#93c5fd')} className="w-8 h-8 rounded-full border border-gray-300 hover:scale-110 transition" style={{ backgroundColor: '#93c5fd' }} title="Bleu"></button>
              </div>
            )}

          </div>

          {/* Barre d'outils - Direction et info */}
          <div className="flex flex-wrap items-center gap-2 p-2 bg-gray-100 rounded-b-lg border border-gray-300 border-t-0">
            <button
              type="button"
              onClick={toggleDirection}
              className="px-3 py-1 bg-white rounded hover:bg-gray-200 text-sm border border-gray-300"
              title="Changer la direction du texte"
            >
              {direction === "ltr" ? "🌐 Arabe (RTL)" : "🌐 Français (LTR)"}
            </button>
            <span className="text-xs text-gray-400">|</span>
            <span className="text-xs text-gray-500">
              <kbd className="px-1 bg-gray-200 rounded">Entrée</kbd> = paragraphe | 
              <kbd className="px-1 bg-gray-200 rounded ml-1">Shift</kbd> + <kbd className="px-1 bg-gray-200 rounded">Entrée</kbd> = retour à la ligne
            </span>
            <span className="text-xs text-gray-400 ml-auto">
              {contenu.length} caractères
            </span>
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
            dir={direction}
            placeholder="Saisissez le contenu de votre actualité ici... Utilisez les onglets ci-dessus pour formater le texte."
          />
          
          <div className="flex justify-between items-center mt-1">
            <p className="text-xs text-gray-500">
              💡 Astuces : Sélectionnez du texte puis utilisez les onglets pour le mettre en forme
            </p>
            <button
              type="button"
              onClick={() => setShowPreview(!showPreview)}
              className="text-sm text-blue-600 hover:underline"
            >
              {showPreview ? "Masquer l'aperçu" : "👁️ Aperçu du contenu"}
            </button>
          </div>
          
          {showPreview && (
            <div className="mt-3 p-4 border border-gray-300 rounded-lg bg-gray-50">
              <h3 className="text-sm font-medium text-gray-700 mb-2">📄 Aperçu :</h3>
              <div 
                className="prose prose-sm max-w-none"
                style={{ color: textColor }}
                dir={direction}
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