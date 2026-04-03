import React, { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";

const ActualitesContext = createContext();

export const useActualites = () => useContext(ActualitesContext);

export const ActualitesProvider = ({ children }) => {
  const [actualites, setActualites] = useState([]);
  const [loading, setLoading] = useState(true);

  // GET
  const fetchActualites = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/actualites");
      setActualites(res.data);
    } catch (err) {
      console.error("Erreur fetchActualites :", err);
    } finally {
      setLoading(false);
    }
  };

  // ➕ AJOUT LOCAL après POST
  const ajouterActualite = (actualite) => {
    setActualites((prev) => [actualite, ...prev]);
  };

  // ❌ DELETE
  const deleteActualite = async (id) => {
    const token = localStorage.getItem("token");

    await axios.delete(
      `http://localhost:5000/api/actualites/${id}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    setActualites((prev) => prev.filter((a) => a._id !== id));
  };

  useEffect(() => {
    fetchActualites();
  }, []);

  return (
    <ActualitesContext.Provider
      value={{
        actualites,
        loading,
        ajouterActualite,
        deleteActualite,
      }}
    >
      {children}
    </ActualitesContext.Provider>
  );
};
