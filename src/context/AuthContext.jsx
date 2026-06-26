// frontend/src/context/AuthContext.jsx
import React, { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../supabaseClient";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userType, setUserType] = useState("participant");
  const [isAdmin, setIsAdmin] = useState(false);
  const [isApproved, setIsApproved] = useState(true);
  const [loading, setLoading] = useState(true);

  // Mettre à jour l'utilisateur
  const updateUser = async (session) => {
    console.log("🔄 updateUser appelé");
    
    if (!session?.user) {
      console.log("❌ Pas de session");
      setUser(null);
      setUserType("participant");
      setIsAdmin(false);
      setIsApproved(true);
      setLoading(false);
      return;
    }

    const email = session.user.email;
    console.log("👤 Utilisateur:", email);
    
    // Mettre à jour l'utilisateur
    setUser(session.user);

    // ADMIN DÉTECTÉ PAR EMAIL
    if (email === "admin@certus.tn") {
      console.log("👑 ADMIN détecté !");
      setUserType("admin");
      setIsAdmin(true);
      setIsApproved(true);
      setLoading(false);
      return;
    }

    // Pour les autres, essayer la table
    try {
      const { data, error } = await supabase
        .from("users")
        .select("user_type, is_admin, is_approved")
        .eq("email", email);

      console.log("📊 Résultat requête:", data);

      if (data && data.length > 0) {
        const profile = data[0];
        setUserType(profile.user_type || "participant");
        setIsAdmin(profile.is_admin || false);
        setIsApproved(profile.is_approved !== false);
        console.log("✅ Profil chargé");
      } else {
        setUserType("participant");
        setIsAdmin(false);
        setIsApproved(true);
        console.log("⚠️ Profil non trouvé, fallback participant");
      }
    } catch (err) {
      console.error("❌ Erreur:", err);
      setUserType("participant");
      setIsAdmin(false);
      setIsApproved(true);
    }
    
    setLoading(false);
  };

  // Initialisation
  useEffect(() => {
    let mounted = true;

    const init = async () => {
      try {
        console.log("🚀 Init Auth...");
        const { data: { session } } = await supabase.auth.getSession();
        console.log("📦 Session:", session?.user?.email || "Aucune");
        
        if (mounted) {
          await updateUser(session);
        }
      } catch (err) {
        console.error("❌ Erreur init:", err);
        if (mounted) {
          setLoading(false);
        }
      }
    };

    init();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("🔄 Auth event:", event);
      if (!mounted) return;

      if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
        if (session?.user) {
          await updateUser(session);
        }
      } else if (event === "SIGNED_OUT") {
        setUser(null);
        setUserType("participant");
        setIsAdmin(false);
        setIsApproved(true);
        setLoading(false);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  // Login
  const login = async (email, password) => {
    console.log("🔐 Connexion:", email);
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password
      });
      if (error) throw error;
      console.log("✅ Connecté");
      return data;
    } catch (err) {
      console.error("❌ Erreur:", err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Logout
  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setUserType("participant");
    setIsAdmin(false);
    setIsApproved(true);
    setLoading(false);
  };

  const value = {
    user,
    userType,
    isAdmin,
    isApproved,
    loading,
    login,
    logout
  };

  console.log("📊 État Auth FINAL:", { 
    user: user?.email || "aucun", 
    userType, 
    isAdmin, 
    loading 
  });

  return React.createElement(AuthContext.Provider, { value }, children);
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};