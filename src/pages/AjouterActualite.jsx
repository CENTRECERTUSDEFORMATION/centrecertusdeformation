// frontend/src/pages/AjouterActualite.jsx
import React, { useState, useRef, useEffect } from "react";
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

  // Appliquer la couleur (rouge)
  const applyColor = () => wrapText('<span style="color: red;">', '</span>');

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
        const newText = `${beforeText}\n<ul>\n${listItems}\n</ul>\n${afterText}`;
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
        const newText = `${beforeText}\n<ol>\n${listItems}\n</ol>\n${afterText}`;
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

  // Ajouter un titre (h2)
  const applyTitle = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = contenu.substring(start, end);
    
    if (selectedText) {
      wrapText('<h2>', '</h2>');
    } else {
      // Insérer un titre vide
      const beforeText = contenu.substring(0, start);
      const afterText = contenu.substring(start);
      const newText = `${beforeText}<h2>Mon titre</h2>${afterText}`;
      setContenu(newText);
      
      setTimeout(() => {
        textarea.focus();
        const newStart = start + 4;
        const newEnd = newStart + 9;
        textarea.setSelectionRange(newStart, newEnd);
      }, 10);
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
      const beforeText = contenu.substring(0, start);
      const afterText = contenu.substring(end);
      const newText = `${beforeText}<a href="https://" target="_blank" rel="noopener noreferrer">${selectedText}</a>${afterText}`;
      setContenu(newText);
      
      setTimeout(() => {
        textarea.focus();
        const hrefStart = start + 9;
        const hrefEnd = hrefStart + 8;
        textarea.setSelectionRange(hrefStart, hrefEnd);
      }, 10);
    } else {
      toast.info("Sélectionnez d'abord le texte à transformer en lien");
    }
  };

  // Ajouter une image dans le contenu (HTML)
  const applyImage = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const beforeText = contenu.substring(0, start);
    const afterText = contenu.substring(start);
    const newText = `${beforeText}<img src="url-de-l-image" alt="Description" style="max-width: 100%;" />${afterText}`;
    setContenu(newText);
    
    setTimeout(() => {
      textarea.focus();
      const newStart = start + 10;
      const newEnd = newStart + 14;
      textarea.setSelectionRange(newStart, newEnd);
    }, 10);
  };

  // Ajouter un bloc de citation
  const applyQuote = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = contenu.substring(start, end);
    
    if (selectedText) {
      wrapText('<blockquote>', '</blockquote>');
    } else {
      const beforeText = contenu.substring(0, start);
      const afterText = contenu.substring(start);
      const newText = `${beforeText}<blockquote>Votre citation ici</blockquote>${afterText}`;
      setContenu(newText);
      
      setTimeout(() => {
        textarea.focus();
        const newStart = start + 12;
        const newEnd = newStart + 18;
        textarea.setSelectionRange(newStart, newEnd);
      }, 10);
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

      // Formater le contenu avec des paragraphes si nécessaire
      let formattedContenu = contenu || null;
      if (formattedContenu) {
        // Si le contenu n'a pas de balises HTML de paragraphe, ajouter des <p>
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
        created_at: new Date().toISOString(),
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
    <div className="p-6 mt-20 max-w-5xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">Ajouter une actualité</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Titre */}
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

        {/* Contenu avec barre d'outils complète */}
        <div>
          <label className="block text-sm font-medium mb-2">Contenu</label>
          
          {/* Barre d'outils */}
          <div className="flex flex-wrap gap-1 mb-2 p-2 bg-gray-100 rounded-t-lg border border-gray-300">
            <button
              type="button"
              onClick={applyBold}
              className="px-3 py-1 bg-white rounded hover:bg-gray-200 font-bold text-sm border border-gray-300"
              title="Gras (Ctrl+B)"
            >
              <span className="font-bold">B</span>
            </button>
            <button
              type="button"
              onClick={applyItalic}
              className="px-3 py-1 bg-white rounded hover:bg-gray-200 italic text-sm border border-gray-300"
              title="Italique (Ctrl+I)"
            >
              <span className="italic">I</span>
            </button>
            <button
              type="button"
              onClick={applyUnderline}
              className="px-3 py-1 bg-white rounded hover:bg-gray-200 underline text-sm border border-gray-300"
              title="Souligné (Ctrl+U)"
            >
              <span className="underline">U</span>
            </button>
            
            <div className="w-px h-6 bg-gray-300 mx-1"></div>
            
            <button
              type="button"
              onClick={applyTitle}
              className="px-3 py-1 bg-white rounded hover:bg-gray-200 text-sm border border-gray-300 font-semibold"
              title="Titre H2"
            >
              H2
            </button>
            <button
              type="button"
              onClick={applyList}
              className="px-3 py-1 bg-white rounded hover:bg-gray-200 text-sm border border-gray-300"
              title="Liste à puces"
            >
              • Liste
            </button>
            <button
              type="button"
              onClick={applyNumberedList}
              className="px-3 py-1 bg-white rounded hover:bg-gray-200 text-sm border border-gray-300"
              title="Liste numérotée"
            >
              1. Liste
            </button>
            
            <div className="w-px h-6 bg-gray-300 mx-1"></div>
            
            <button
              type="button"
              onClick={applyLink}
              className="px-3 py-1 bg-white rounded hover:bg-gray-200 text-sm border border-gray-300 text-blue-600"
              title="Lien hypertexte"
            >
              🔗 Lien
            </button>
            <button
              type="button"
              onClick={applyImage}
              className="px-3 py-1 bg-white rounded hover:bg-gray-200 text-sm border border-gray-300 text-green-600"
              title="Image dans le contenu"
            >
              🖼️ Image
            </button>
            <button
              type="button"
              onClick={applyQuote}
              className="px-3 py-1 bg-white rounded hover:bg-gray-200 text-sm border border-gray-300 text-gray-600"
              title="Citation"
            >
              “ Citation
            </button>
            <button
              type="button"
              onClick={applyColor}
              className="px-3 py-1 bg-white rounded hover:bg-gray-200 text-sm border border-gray-300 text-red-600"
              title="Texte en rouge"
            >
              🔴 Rouge
            </button>
          </div>
          
          <textarea
            ref={textareaRef}
            id="contenu-textarea"
            placeholder="Description de l'actualité (HTML supporté)

Astuces :
- Sélectionnez du texte puis cliquez sur un bouton pour le mettre en forme
- Appuyez sur Entrée pour créer un nouveau paragraphe
- Appuyez sur Shift+Entrée pour un simple retour à la ligne (<br>)"
            className="w-full border border-gray-300 p-4 rounded-b-lg font-mono text-sm min-h-[300px] focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            rows="12"
            value={contenu}
            onChange={(e) => setContenu(e.target.value)}
            onKeyDown={handleKeyDown}
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
              {showPreview ? "Masquer l'aperçu" : "Aperçu du contenu"}
            </button>
          </div>
          
          {/* Aperçu en direct */}
          {showPreview && (
            <div className="mt-3 p-4 border border-gray-300 rounded-lg bg-gray-50">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Aperçu :</h3>
              <div 
                className="prose prose-sm max-w-none"
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