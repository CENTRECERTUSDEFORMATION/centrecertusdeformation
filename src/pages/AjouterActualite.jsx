import React, { useState } from "react";
import { supabase } from "./supabaseClient";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

export default function AjouterActualite() {
  const navigate = useNavigate();

  const [titre, setTitre] = useState("");
  const [contenu, setContenu] = useState("");
  const [images, setImages] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [loading, setLoading] = useState(false);

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

  // Fonction pour appliquer le gras
  const applyBold = () => {
    const textarea = document.getElementById('contenu-textarea');
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = contenu.substring(start, end);
    
    if (selectedText) {
      const beforeText = contenu.substring(0, start);
      const afterText = contenu.substring(end);
      const newText = `${beforeText}<strong>${selectedText}</strong>${afterText}`;
      setContenu(newText);
      
      // Replacer le curseur après le texte sélectionné
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start + 17, end + 17);
      }, 10);
    } else {
      toast.info("Sélectionnez d'abord le texte à mettre en gras");
    }
  };

  // Fonction pour appliquer l'italique
  const applyItalic = () => {
    const textarea = document.getElementById('contenu-textarea');
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = contenu.substring(start, end);
    
    if (selectedText) {
      const beforeText = contenu.substring(0, start);
      const afterText = contenu.substring(end);
      const newText = `${beforeText}<em>${selectedText}</em>${afterText}`;
      setContenu(newText);
      
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start + 15, end + 15);
      }, 10);
    } else {
      toast.info("Sélectionnez d'abord le texte à mettre en italique");
    }
  };

  // Fonction pour ajouter une liste
  const applyList = () => {
    const textarea = document.getElementById('contenu-textarea');
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = contenu.substring(start, end);
    
    if (selectedText) {
      const lines = selectedText.split('\n');
      const listItems = lines.map(line => `• ${line}`).join('\n');
      const beforeText = contenu.substring(0, start);
      const afterText = contenu.substring(end);
      const newText = `${beforeText}\n<ul>\n${lines.map(line => `  <li>${line}</li>`).join('\n')}\n</ul>\n${afterText}`;
      setContenu(newText);
    } else {
      toast.info("Sélectionnez d'abord le texte à mettre en liste");
    }
  };

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

      const { error: insertError } = await supabase.from("actualites").insert([
        {
          titre,
          contenu: contenu || null,
          images: uploadedPaths,
          created_at: new Date().toISOString(),
        },
      ]);

      if (insertError) throw insertError;

      toast.success(`Actualité ajoutée avec ${uploadedPaths.length} image(s) !`);
      navigate("/actualite");

    } catch (err) {
      console.error(err);
      toast.error("Erreur lors de l'ajout de l'actualité");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 mt-20 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">Ajouter une actualité</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Titre *</label>
          <input
            type="text"
            placeholder="Titre de l'actualité"
            className="w-full border p-3 rounded text-lg"
            value={titre}
            onChange={(e) => setTitre(e.target.value)}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Contenu</label>
          
          {/* Barre d'outils */}
          <div className="flex gap-2 mb-2 p-2 bg-gray-100 rounded-t-lg border border-gray-300">
            <button
              type="button"
              onClick={applyBold}
              className="px-3 py-1 bg-white rounded hover:bg-gray-200 font-bold"
              title="Gras (Ctrl+B)"
            >
              <span className="font-bold">B</span>
            </button>
            <button
              type="button"
              onClick={applyItalic}
              className="px-3 py-1 bg-white rounded hover:bg-gray-200 italic"
              title="Italique (Ctrl+I)"
            >
              <span className="italic">I</span>
            </button>
            <button
              type="button"
              onClick={applyList}
              className="px-3 py-1 bg-white rounded hover:bg-gray-200"
              title="Liste à puces"
            >
              • Liste
            </button>
            <div className="w-px h-6 bg-gray-300 mx-1"></div>
            <span className="text-xs text-gray-500 self-center">
              Sélectionnez le texte puis cliquez sur un bouton
            </span>
          </div>
          
          <textarea
            id="contenu-textarea"
            placeholder="Description de l'actualité (HTML supporté)"
            className="w-full border border-gray-300 p-4 rounded-b-lg font-mono text-sm"
            rows="12"
            value={contenu}
            onChange={(e) => setContenu(e.target.value)}
          />
          <p className="text-xs text-gray-500 mt-1">
            💡 Astuce : Vous pouvez utiliser les balises HTML comme &lt;strong&gt;texte&lt;/strong&gt; pour du texte en gras
          </p>
        </div>

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
                    className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full w-5 h-5 text-xs"
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
          className="bg-blue-800 text-white px-4 py-2 w-full rounded hover:bg-blue-900 transition disabled:opacity-50"
        >
          {loading ? "Ajout en cours..." : "➕ Ajouter l'actualité"}
        </button>
      </form>
    </div>
  );
}