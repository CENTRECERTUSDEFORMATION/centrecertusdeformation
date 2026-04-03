// frontend/src/context/FormationsContext.jsx
import React, { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "./AuthContext";
import { supabase } from "../supabaseClient";

export const FormationsContext = createContext();

export const FormationsProvider = ({ children }) => {
  const auth = useAuth(); // 🔹 récupération sécurisée
  const user = auth?.user;

  const [formations, setFormations] = useState([]);
  const [loading, setLoading] = useState(true);

  // 🔹 Récupérer toutes les formations
  const fetchFormations = async () => {
    try {
      setLoading(true);

      const { data, error } = await supabase
        .from("formations")
        .select("*")
        .order("id", { ascending: false });

      if (error) throw error;

      setFormations(data || []);
    } catch (error) {
      console.error("Erreur fetchFormations :", error.message);
      setFormations([]);
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Vérification admin
  const checkAdmin = () => {
    if (!user) throw new Error("Utilisateur non connecté");
    if (!user.is_admin) throw new Error("Accès refusé");
  };

  // 🔹 Ajouter une formation
  const addFormation = async (formationData) => {
    try {
      checkAdmin();

      const { data, error } = await supabase
        .from("formations")
        .insert([formationData])
        .select()
        .single();

      if (error) throw error;

      setFormations((prev) => [data, ...prev]);
      return data;
    } catch (error) {
      console.error("Erreur addFormation :", error.message);
      throw error;
    }
  };

  // 🔹 Mettre à jour formation
  const updateFormation = async (id, formationData) => {
    try {
      checkAdmin();

      const { data, error } = await supabase
        .from("formations")
        .update(formationData)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;

      setFormations((prev) =>
        prev.map((f) => (f.id === id ? data : f))
      );

      return data;
    } catch (error) {
      console.error("Erreur updateFormation :", error.message);
      throw error;
    }
  };

  // 🔹 Supprimer formation
  const deleteFormation = async (id) => {
    try {
      checkAdmin();

      const { error } = await supabase
        .from("formations")
        .delete()
        .eq("id", id);

      if (error) throw error;

      setFormations((prev) => prev.filter((f) => f.id !== id));
    } catch (error) {
      console.error("Erreur deleteFormation :", error.message);
      throw error;
    }
  };

  // 🔹 Charger seulement quand Auth est prêt
  useEffect(() => {
    if (auth !== undefined) {
      fetchFormations();
    }
  }, [auth]);

  return (
    <FormationsContext.Provider
      value={{
        formations,
        loading,
        fetchFormations,
        addFormation,
        updateFormation,
        deleteFormation,
      }}
    >
      {children}
    </FormationsContext.Provider>
  );
};

export const useFormations = () => {
  const context = useContext(FormationsContext);
  if (!context) {
    throw new Error("useFormations doit être utilisé dans FormationsProvider");
  }
  return context;
};