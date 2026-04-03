import React, { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "./AuthContext";
import axios from "axios";

export const FormationsContext = createContext();

export const FormationsProvider = ({ children }) => {
  const auth = useAuth(); // 🔹 sécurité
  const user = auth?.user;
  const token = auth?.token;

  const [formations, setFormations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFormations = async () => {
      if (!token) return; // pas encore connecté

      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/formations`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setFormations(res.data);
      } catch (err) {
        console.error("Erreur fetchFormations :", err);
      } finally {
        setLoading(false);
      }
    };

    fetchFormations();
  }, [token]);

  const addFormation = async (formationData) => {
    if (!user || !user.isAdmin) throw new Error("Accès refusé");

    const formData = new FormData();
    Object.entries(formationData).forEach(([key, value]) => {
      formData.append(key, value);
    });

    const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/formations`, formData, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "multipart/form-data",
      },
    });

    setFormations((prev) => [...prev, res.data]);
    return res.data;
  };

  const updateFormation = async (id, formationData) => {
    if (!user || !user.isAdmin) throw new Error("Accès refusé");

    const formData = new FormData();
    Object.entries(formationData).forEach(([key, value]) => formData.append(key, value));

    const res = await axios.put(`${import.meta.env.VITE_API_URL}/api/formations/${id}`, formData, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "multipart/form-data",
      },
    });

    setFormations((prev) => prev.map(f => f._id === id ? res.data : f));
    return res.data;
  };

  const deleteFormation = async (id) => {
    if (!user || !user.isAdmin) throw new Error("Accès refusé");

    await axios.delete(`${import.meta.env.VITE_API_URL}/api/formations/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    setFormations((prev) => prev.filter(f => f._id !== id));
  };

  return (
    <FormationsContext.Provider value={{ formations, loading, addFormation, updateFormation, deleteFormation }}>
      {children}
    </FormationsContext.Provider>
  );
};

export const useFormations = () => useContext(FormationsContext);
