// frontend/src/pages/AjouterActualite.jsx
import React, { useState, useRef } from "react";
import { supabase } from "../supabaseClient";
import { supabaseInsert } from "../supabaseFetch";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

export default function AjouterActualite() {
  const navigate = useNavigate();
  const textareaRef = useRef(null);

  const [titre, setTitre] = useState("");
  const [contenu, setContenu] = useState("");
  const [images, setImages] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [direction, setDirection] = useState("ltr");
  const [activeTab, setActiveTab] = useState("accueil");

  const cleanFileName = (filename) => {
    return filename
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/\s+/g, '-')
      .replace(/[^a-zA-Z0-9.-]/g, '');
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

  // ============ SOUMISSION ============

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!titre) {
      toast.error("Le titre est obligatoire");
      return;
    }

    setLoading(true);

    try {
      const uploadedPaths = [];

      for (const image of images) {
        const cleanName = cleanFileName(image.name);
        const fileName = `actualites/${Date.now()}-${cleanName}`;
        
        const { error: uploadError } = await supabase.storage
          .from("uploads")
          .upload(fileName, image);

        if (uploadError) throw uploadError;
        uploadedPaths.push(fileName);
      }

      let formattedContenu = contenu || null;
      if (formattedContenu) {
        if (!formattedContenu.includes('<p>') && !formattedContenu.includes('<br>')) {
          formattedContenu = formattedContenu
            .split('\n')
            .filter(line => line.trim() !== '')
            .map(line => `<p>${line}</p>`)
            .join('');
        }
      }

      await supabaseInsert("actualites", {
        titre,
        contenu: formattedContenu,
        images: uploadedPaths,
        text_color: "#374151",
        background_color: "#ffffff",
        is_alert: false,
        created_at: new Date().toISOString()
      });

      toast.success(`Actualité ajoutée avec ${uploadedPaths.length} image(s) !`);
      navigate("/actualite");

    } catch (err) {
      console.error(err);
      toast.error("Erreur lors de l'ajout de l'actualité");
    } finally {
      setLoading(false);
    }
  };

  // ============ RENDU ============

  return (
    <div className="p-6 mt-20 max-w-6xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">Ajouter une actualité</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Titre *</label>
          <input
            type="text"
            placeholder="Titre de l'actualité"
            className="w-full border p-3 rounded text-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={titre}
            onChange={(e) => setTitre(e.target.value)}
            required
          />
        </div>

        {/* Barre d'outils avec onglets */}
        <div>
          <label className="block text-sm font-medium mb-2">Contenu</label>
          
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
            placeholder="Saisissez le contenu de votre actualité ici... Utilisez les onglets ci-dessus pour formater le texte."
            className="w-full border border-gray-300 p-4 rounded-b-lg font-mono text-sm min-h-[300px] focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            rows="12"
            value={contenu}
            onChange={(e) => setContenu(e.target.value)}
            onKeyDown={handleKeyDown}
            dir={direction}
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
              {showPreview ? "Masquer l'aperçu" : "Aperçu du contenu"}
            </button>
          </div>
          
          {showPreview && (
            <div className="mt-3 p-4 border border-gray-300 rounded-lg bg-gray-50">
              <h3 className="text-sm font-medium text-gray-700 mb-2">📄 Aperçu :</h3>
              <div 
                className="prose prose-sm max-w-none"
                dir={direction}
                dangerouslySetInnerHTML={{ 
                  __html: contenu || "<span class='text-gray-400 italic'>Le contenu s'affichera ici...</span>" 
                }} 
              />
            </div>
          )}
        </div>

        {/* Images */}
        <div>
          <label className="block text-sm font-medium mb-1">
            Images (plusieurs possibles)
          </label>
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleImages}
            className="w-full"
          />
          <p className="text-xs text-gray-500 mt-1">
            Maintenez Ctrl (ou Cmd) pour sélectionner plusieurs images
          </p>
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
                    className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full w-5 h-5 text-xs hover:bg-red-700"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="bg-blue-800 text-white px-4 py-3 w-full rounded hover:bg-blue-900 transition disabled:opacity-50 font-medium"
        >
          {loading ? "Ajout en cours..." : "➕ Ajouter l'actualité"}
        </button>
      </form>
    </div>
  );
}