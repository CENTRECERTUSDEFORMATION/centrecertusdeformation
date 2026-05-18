import React, { useState } from "react";
import { supabase } from "../supabaseClient";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useAuth } from "../context/AuthContext";

export default function AjouterFormation() {
  const navigate = useNavigate();
  const { user } = useAuth();

  if (!user?.isAdmin) {
    return <p className="text-center mt-10">Accès refusé</p>;
  }

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [fullDescription, setFullDescription] = useState("");
  const [preinscriptionLink, setPreinscriptionLink] = useState("");
  const [testLink, setTestLink] = useState(""); // NOUVEAU
  const [theme, setTheme] = useState("digital");
  const [langue, setLangue] = useState("fr"); // NOUVEAU
  const [duration, setDuration] = useState("");
  const [price, setPrice] = useState("");
  const [isOnline, setIsOnline] = useState(false);
  const [images, setImages] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [onDemand, setOnDemand] = useState(false);

  const cleanFileName = (filename) => {
    return filename
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/\s+/g, '-')
      .replace(/[^a-zA-Z0-9.-]/g, '');
  };

  // 7 thèmes disponibles
  const themes = [
    { id: "digital", name: "💻 Digital & Web" },
    { id: "data", name: "📊 Data & IA" },
    { id: "design", name: "🎨 Design & Créativité" },
    { id: "management", name: "📈 Management & Leadership" },
    { id: "finance", name: "💰 Finance & Comptabilité" },
    { id: "energie", name: "🌱 Énergies renouvelables" },
    { id: "langues", name: "🗣️ Langues & Communication" }
  ];

  // Langues disponibles pour génération auto SEO
  const langues = [
    { code: "fr", name: "Français" },
    { code: "en", name: "English" },
    { code: "ar", name: "العربية" }
  ];

  // Génération automatique de contenu SEO basé sur la langue
  const generateSEOContent = (lang) => {
    const titreBase = title;
    const themeName = themes.find(t => t.id === theme)?.name || "formation";
    
    const content = {
      fr: {
        description: `Formation professionnelle ${titreBase} à Monastir, Tunisie. Programme certifiant de qualité avec formateurs experts. Inscription ouverte.`,
        fullDesc: `${titreBase} est une formation complète proposée par le Centre Certus à Monastir. Cette formation en ${themeName} vous permettra d'acquérir toutes les compétences nécessaires pour exceller dans votre domaine. Nos formateurs sont des professionnels en activité qui partagent leur expertise terrain. À l'issue de cette formation, vous recevrez une certification reconnue.`
      },
      en: {
        description: `Professional training ${titreBase} in Monastir, Tunisia. Quality certified program with expert trainers. Open registration.`,
        fullDesc: `${titreBase} is a comprehensive training program offered by Centre Certus in Monastir. This ${themeName} training will allow you to acquire all the necessary skills to excel in your field. Our trainers are active professionals who share their field expertise. Upon completion, you will receive a recognized certification.`
      },
      ar: {
        description: `تكوين مهني ${titreBase} في المنستير، تونس. برنامج معتمد بجودة عالية مع خبراء في التدريب. التسجيل مفتوح.`,
        fullDesc: `${titreBase} هو برنامج تكويني شامل يقدمه مركز سيرتوس في المنستير. سيمكنك هذا التكوين في ${themeName} من اكتساب جميع المهارات اللازمة للتفوق في مجالك. مدربونا هم محترفون نشطون يشاركون خبراتهم الميدانية. عند الانتهاء، ستحصل على شهادة معترف بها.`
      }
    };
    
    return content[lang] || content.fr;
  };

  // Mise à jour auto du contenu SEO quand la langue change
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

      const { error: insertError } = await supabase.from("formations").insert([
        {
          title: title,
          description,
          fullDescription,
          preinscriptionLink,
          test_link: testLink || null, // NOUVEAU
          theme: theme,
          langue: langue, // NOUVEAU
          duration: duration || null,
          price: price || null,
          is_online: isOnline,
          images: uploadedPaths,
          onDemand,
          created_at: new Date().toISOString(),
        },
      ]);

      if (insertError) throw insertError;

      toast.success(`Formation ajoutée avec ${uploadedPaths.length} image(s) !`);
      navigate("/formations");

    } catch (err) {
      console.error(err);
      toast.error("Erreur lors de l'ajout de la formation");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6 mt-20">
      <h2 className="text-2xl font-bold mb-6">Ajouter une formation</h2>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Titre */}
        <div>
          <label className="block text-sm font-medium mb-1">Titre *</label>
          <input 
            placeholder="Titre de la formation" 
            className="w-full border p-2 rounded" 
            value={title} 
            onChange={(e) => setTitle(e.target.value)} 
            required 
          />
        </div>

        {/* Langue (NOUVEAU) */}
        <div>
          <label className="block text-sm font-medium mb-1">🌐 Langue de la formation *</label>
          <select 
            className="w-full border p-2 rounded" 
            value={langue} 
            onChange={(e) => handleLangueChange(e.target.value)} 
            required
          >
            {langues.map((l) => (
              <option key={l.code} value={l.code}>{l.name}</option>
            ))}
          </select>
          <p className="text-xs text-gray-500 mt-1">La description sera générée automatiquement dans cette langue</p>
        </div>

        {/* Thème */}
        <div>
          <label className="block text-sm font-medium mb-1">Thème *</label>
          <select className="w-full border p-2 rounded" value={theme} onChange={(e) => setTheme(e.target.value)} required>
            {themes.map((t) => (<option key={t.id} value={t.id}>{t.name}</option>))}
          </select>
        </div>

        {/* Description courte */}
        <div>
          <label className="block text-sm font-medium mb-1">Description courte *</label>
          <textarea 
            placeholder="Brève description (apparaît dans la liste)" 
            className="w-full border p-2 rounded" 
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
            className="w-full border p-2 rounded" 
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
            <input type="text" placeholder="ex: 40h / 3 mois" className="w-full border p-2 rounded" value={duration} onChange={(e) => setDuration(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Prix</label>
            <input type="text" placeholder="ex: 1200 DT / Sur devis" className="w-full border p-2 rounded" value={price} onChange={(e) => setPrice(e.target.value)} />
          </div>
        </div>

        {/* Lien de préinscription */}
        <div>
          <label className="block text-sm font-medium mb-1">Lien de préinscription</label>
          <input placeholder="https://..." className="w-full border p-2 rounded" value={preinscriptionLink} onChange={(e) => setPreinscriptionLink(e.target.value)} />
        </div>

        {/* Lien de test (NOUVEAU) */}
        <div>
          <label className="block text-sm font-medium mb-1">🔗 Lien de test / démo</label>
          <input 
            placeholder="https://test-formation.com" 
            className="w-full border p-2 rounded" 
            value={testLink} 
            onChange={(e) => setTestLink(e.target.value)} 
          />
          <p className="text-xs text-gray-500 mt-1">Lien vers un test de niveau, une démo ou un support pédagogique</p>
        </div>

        {/* Images */}
        <div>
          <label className="block text-sm font-medium mb-1">Images (plusieurs possibles)</label>
          <input type="file" accept="image/*" multiple onChange={handleImages} className="w-full" />
          <p className="text-xs text-gray-500 mt-1">Maintenez Ctrl (ou Cmd) pour sélectionner plusieurs images</p>
        </div>

        {previews.length > 0 && (
          <div>
            <p className="text-sm text-gray-600 mb-2">Aperçus :</p>
            <div className="flex flex-wrap gap-2">
              {previews.map((preview, index) => (
                <div key={index} className="relative">
                  <img src={preview} alt={`Aperçu ${index + 1}`} className="w-20 h-20 object-cover rounded border" />
                  <button type="button" onClick={() => removeImage(index)} className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full w-5 h-5 text-xs">×</button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Options */}
        <div className="flex flex-wrap gap-4">
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={isOnline} onChange={(e) => setIsOnline(e.target.checked)} /> 
            🌍 Formation à distance (international)
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={onDemand} onChange={(e) => setOnDemand(e.target.checked)} /> 
            🎯 Formation à la demande
          </label>
        </div>

        <button 
          type="submit" 
          disabled={loading} 
          className="bg-blue-800 text-white px-4 py-2 w-full rounded hover:bg-blue-900 transition disabled:opacity-50"
        >
          {loading ? "Ajout en cours..." : "➕ Ajouter la formation"}
        </button>
      </form>
    </div>
  );
}