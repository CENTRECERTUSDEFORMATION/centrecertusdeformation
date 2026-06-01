// frontend/src/components/InscriptionForm.jsx
import React, { useState } from "react";
import { supabase } from "./supabaseClient";
import { toast } from "react-toastify";
import { motion } from "framer-motion";

const InscriptionForm = ({ formation, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    nom: "",
    email: "",
    telephone: "",
    message: ""
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.nom || !formData.email || !formData.telephone) {
      toast.error("Veuillez remplir tous les champs obligatoires");
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from("demandes_presentiel")
        .insert({
          formation_id: formation.id,
          nom: formData.nom,
          email: formData.email,
          telephone: formData.telephone,
          message: formData.message || null,
          statut: "nouvelle"
        });

      if (error) throw error;

      toast.success("✅ Votre demande a été envoyée ! L'équipe Certus vous contactera dans les plus brefs délais.");
      if (onSuccess) onSuccess();
      if (onClose) onClose();
      
      // Réinitialiser le formulaire
      setFormData({ nom: "", email: "", telephone: "", message: "" });
    } catch (err) {
      console.error(err);
      toast.error("Erreur lors de l'envoi de la demande");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="bg-white rounded-2xl shadow-xl max-w-md w-full overflow-hidden"
    >
      {/* En-tête */}
      <div className="bg-gradient-to-r from-[#1a56db] to-[#76c21f] text-white p-5">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-xl font-bold">📝 Inscription à la demande</h3>
            <p className="text-blue-100 text-sm mt-1">{formation.title}</p>
          </div>
          <button onClick={onClose} className="text-white/80 hover:text-white text-2xl">&times;</button>
        </div>
        <p className="text-blue-100 text-xs mt-2">
          Formation en présentiel à Monastir - Groupe de 6 à 10 participants
        </p>
      </div>

      {/* Formulaire */}
      <form onSubmit={handleSubmit} className="p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nom complet <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="nom"
            required
            value={formData.nom}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-[#1a56db] focus:border-transparent"
            placeholder="Jean Dupont"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            name="email"
            required
            value={formData.email}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-[#1a56db] focus:border-transparent"
            placeholder="jean.dupont@email.com"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Téléphone <span className="text-red-500">*</span>
          </label>
          <input
            type="tel"
            name="telephone"
            required
            value={formData.telephone}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-[#1a56db] focus:border-transparent"
            placeholder="06 12 34 56 78"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Message (optionnel)
          </label>
          <textarea
            name="message"
            rows="3"
            value={formData.message}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-[#1a56db] focus:border-transparent resize-none"
            placeholder="Vos questions ou remarques..."
          />
        </div>

        <div className="bg-blue-50 rounded-lg p-3 text-xs text-gray-600">
          <p className="font-semibold mb-1">📌 À savoir :</p>
          <ul className="list-disc list-inside space-y-1">
            <li>Formation en présentiel dans nos locaux à Monastir</li>
            <li>Groupe de 6 à 10 participants</li>
            <li>Notre équipe vous contactera pour confirmer les dates</li>
          </ul>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-gradient-to-r from-[#1a56db] to-[#76c21f] text-white py-3 rounded-lg font-semibold hover:opacity-90 transition disabled:opacity-50"
        >
          {loading ? "Envoi en cours..." : "📩 Envoyer ma demande"}
        </button>
      </form>
    </motion.div>
  );
};

export default InscriptionForm;