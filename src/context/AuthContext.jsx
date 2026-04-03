// frontend/src/context/AuthContext.jsx
import React, { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import bcrypt from "bcryptjs";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Vérifie la session Supabase au démarrage
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (session?.user) setUser(session.user);
      setLoading(false);
    };
    checkSession();
  }, []);

  // Connexion
  const login = async (email, password) => {
    setLoading(true);

    // Récupérer l'utilisateur depuis Supabase
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("email", email)
      .single();

    setLoading(false);

    if (error || !data) throw new Error("Utilisateur non trouvé");

    // Comparer le mot de passe avec le hash stocké
    const valid = bcrypt.compareSync(password, data.password);
    if (!valid) throw new Error("Mot de passe incorrect");

    setUser(data); // définir l'utilisateur connecté
    return data;
  };

  // Déconnexion
  const logout = async () => {
    // Si tu veux, tu peux appeler supabase.auth.signOut() ici,
    // mais comme on gère directement depuis la table users, ce n’est pas obligatoire.
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);