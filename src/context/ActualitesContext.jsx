// frontend/src/context/ActualitesContext.jsx
import React, { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../supabaseClient";

const ActualitesContext = createContext();

export const useActualites = () => useContext(ActualitesContext);

export const ActualitesProvider = ({ children }) => {
  const [actualites, setActualites] = useState([]);
  const [loading, setLoading] = useState(true);

  // 🔹 Récupérer toutes les actualités
  const fetchActualites = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("actualites")
      .select("*")
      .order("id", { ascending: false });

    if (error) {
      console.error("Erreur fetchActualites :", error);
      setActualites([]);
    } else {
      setActualites(data);
    }
    setLoading(false);
  };

  // 🔹 Ajouter une actualité
  const ajouterActualite = async (actualiteData) => {
    const { data, error } = await supabase
      .from("actualites")
      .insert([actualiteData])
      .select()
      .single();

    if (error) {
      console.error("Erreur ajouterActualite :", error);
      throw error;
    }

    setActualites((prev) => [data, ...prev]);
    return data;
  };

  // 🔹 Supprimer actualité
  const deleteActualite = async (id) => {
    const { error } = await supabase
      .from("actualites")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Erreur deleteActualite :", error);
      throw error;
    }

    setActualites((prev) => prev.filter(a => a.id !== id));
  };

  useEffect(() => {
    fetchActualites();
  }, []);

  return (
    <ActualitesContext.Provider value={{ actualites, loading, fetchActualites, ajouterActualite, deleteActualite }}>
      {children}
    </ActualitesContext.Provider>
  );
};