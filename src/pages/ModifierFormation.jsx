import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-toastify";
import { motion } from "framer-motion";

export default function ModifierFormation() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAdmin } = useAuth();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
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
  const [onDemand, setOnDemand] = useState(false);
  const [existingImages, setExistingImages] = useState([]);
  const [newImages, setNewImages] = useState([]);
  const [newPreviews, setNewPreviews] = useState([]);
  const [imagesToDelete, setImagesToDelete] = useState([]);

  // Vérification admin
  if (!isAdmin) {
    return <p className="text-center mt-20">Accès refusé</p>;
  }

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

  const cleanFileName = (filename) => {
    return filename
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/\s+/g, '-')
      .replace(/[^a-zA-Z0-9.-]/g, '');
  };

  // Charger la formation
  useEffect(() => {
    const fetchFormation = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from("formations")
          .select("*")
          .eq("id", id)
          .single();

        if (error) throw error;
        
        console.log("Formation chargée:", data);
        
        setTitle(data.title || "");
        setDescription(data.description || "");
        setFullDescription(data.fullDescription || "");
        setPreinscriptionLink(data.preinscriptionLink || "");
        setTestLink(data.test_link || "");
        setTheme(data.theme || "digital");
        setLangue(data.langue || "fr");
        setDuration(data.duration || "");
        setPrice(data.price || "");
        setIsOnline(data.is_online || false);
        setOnDemand(data.onDemand || false);
        setExistingImages(data.images || []);
        
      } catch (error) {
        console.error("Erreur fetch:", error);
        toast.error("Erreur chargement formation");
        navigate("/formations");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchFormation();
    }
  }, [id, navigate]);

  const getImageUrl = (path) => {
    if (!path) return null;
    try {
      const { data } = supabase.storage.from("uploads").getPublicUrl(path);
      return data.publicUrl;
    } catch (error) {
      return null;
    }
  };

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
    URL.revokeObjectURL(newPreviews[index]);
    setNewImages(newImages.filter((_, i) => i !== index));
    setNewPreviews(newPreviews.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title.trim()) {
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

      // Mise à jour
      const updateData = {
        title: title.trim(),
        description: description.trim(),
        fullDescription: fullDescription.trim(),
        preinscriptionLink: preinscriptionLink || null,
        test_link: testLink || null,
        theme,
        langue,
        duration: duration || null,
        price: price || null,
        is_online: isOnline,
        onDemand: onDemand,
        images: uploadedPaths,
        updated_at: new Date().toISOString(),
      };

      console.log("Envoi des données:", updateData);

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
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64 mt-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-3xl mx-auto p-6 mt-20">
      <h2 className="text-2xl font-bold mb-6">✏️ Modifier la formation</h2>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-medium mb-1">Titre *</label>
          <input 
            type="text" 
            className="w-full border p-2 rounded" 
            value={title} 
            onChange={(e) => setTitle(e.target.value)} 
            required 
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">🌐 Langue</label>
          <select className="w-full border p-2 rounded" value={langue} onChange={(e) => setLangue(e.target.value)}>
            {langues.map((l) => (<option key={l.code} value={l.code}>{l.name}</option>))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Thème *</label>
          <select className="w-full border p-2 rounded" value={theme} onChange={(e) => setTheme(e.target.value)} required>
            {themes.map((t) => (<option key={t.id} value={t.id}>{t.name}</option>))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Description courte *</label>
          <textarea className="w-full border p-2 rounded" rows="3" value={description} onChange={(e) => setDescription(e.target.value)} required />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Description complète</label>
          <textarea className="w-full border p-2 rounded" rows="8" value={fullDescription} onChange={(e) => setFullDescription(e.target.value)} placeholder="Description détaillée..." />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Durée</label>
            <input type="text" placeholder="ex: 40h" className="w-full border p-2 rounded" value={duration} onChange={(e) => setDuration(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Prix</label>
            <input type="text" placeholder="ex: 1200 DT" className="w-full border p-2 rounded" value={price} onChange={(e) => setPrice(e.target.value)} />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Lien préinscription</label>
          <input type="url" className="w-full border p-2 rounded" value={preinscriptionLink} onChange={(e) => setPreinscriptionLink(e.target.value)} placeholder="https://..." />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">🔗 Lien test / démo</label>
          <input type="url" className="w-full border p-2 rounded" value={testLink} onChange={(e) => setTestLink(e.target.value)} placeholder="https://..." />
        </div>

        {existingImages.length > 0 && (
          <div>
            <label className="block text-sm font-medium mb-2">Images actuelles</label>
            <div className="flex flex-wrap gap-3">
              {existingImages.map((img, idx) => (
                <div key={idx} className="relative group">
                  <img src={getImageUrl(img)} alt={`Image ${idx + 1}`} className="w-24 h-24 object-cover rounded border" />
                  <button type="button" onClick={() => removeExistingImage(idx)} className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full w-6 h-6 text-sm opacity-0 group-hover:opacity-100 transition">×</button>
                </div>
              ))}
            </div>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium mb-1">Ajouter des images</label>
          <input type="file" accept="image/*" multiple onChange={handleNewImages} className="w-full" />
        </div>

        {newPreviews.length > 0 && (
          <div>
            <label className="block text-sm font-medium mb-2">Nouvelles images</label>
            <div className="flex flex-wrap gap-3">
              {newPreviews.map((preview, idx) => (
                <div key={idx} className="relative group">
                  <img src={preview} alt={`Nouvelle ${idx + 1}`} className="w-24 h-24 object-cover rounded border" />
                  <button type="button" onClick={() => removeNewImage(idx)} className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full w-6 h-6 text-sm opacity-0 group-hover:opacity-100 transition">×</button>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex flex-wrap gap-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={isOnline} onChange={(e) => setIsOnline(e.target.checked)} />
            🌍 Formation à distance
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={onDemand} onChange={(e) => setOnDemand(e.target.checked)} />
            🎯 Formation à la demande
          </label>
        </div>

        <div className="flex gap-3 pt-4">
          <button type="submit" disabled={submitting} className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50">
            {submitting ? "Enregistrement..." : "💾 Enregistrer"}
          </button>
          <button type="button" onClick={() => navigate("/formations")} className="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-400 transition">
            Annuler
          </button>
        </div>
      </form>
    </motion.div>
  );
}