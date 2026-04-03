// frontend/src/context/FormationsContext.jsx
import React, { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "./AuthContext";
import { supabase } from "../supabaseClient";

export const FormationsContext = createContext();

export const FormationsProvider = ({ children }) => {
  const { user } = useAuth(); // 🔹 utilisateur connecté
  const [formations, setFormations] = useState([]);
  const [loading, setLoading] = useState(true);

  // 🔹 Récupérer toutes les formations
  const fetchFormations = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("formations")
      .select("*")
      .order("id", { ascending: false });

    if (error) {
      console.error("Erreur fetchFormations :", error);
      setFormations([]);
    } else {
      setFormations(data);
    }
    setLoading(false);
  };

  // 🔹 Ajouter une formation
  const addFormation = async (formationData) => {
    if (!user?.is_admin) throw new Error("Accès refusé");

    const { data, error } = await supabase
      .from("formations")
      .insert([formationData])
      .select()
      .single();

    if (error) {
      console.error("Erreur addFormation :", error);
      throw error;
    }

    setFormations((prev) => [data, ...prev]);
    return data;
  };

  // 🔹 Mettre à jour formation
  const updateFormation = async (id, formationData) => {
    if (!user?.is_admin) throw new Error("Accès refusé");

    const { data, error } = await supabase
      .from("formations")
      .update(formationData)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Erreur updateFormation :", error);
      throw error;
    }

    setFormations((prev) => prev.map(f => f.id === id ? data : f));
    return data;
  };

  // 🔹 Supprimer formation
  const deleteFormation = async (id) => {
    if (!user?.is_admin) throw new Error("Accès refusé");

    const { error } = await supabase
      .from("formations")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Erreur deleteFormation :", error);
      throw error;
    }

    setFormations((prev) => prev.filter(f => f.id !== id));
  };

  useEffect(() => {
    fetchFormations();
  }, []);

  return (
    <FormationsContext.Provider value={{ formations, loading, fetchFormations, addFormation, updateFormation, deleteFormation }}>
      {children}
    </FormationsContext.Provider>
  );
};

export const useFormations = () => useContext(FormationsContext);