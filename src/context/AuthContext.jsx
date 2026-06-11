// frontend/src/context/AuthContext.jsx
import React, { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../supabaseClient";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userType, setUserType] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isApproved, setIsApproved] = useState(true);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const updateUser = (session) => {
      if (!session?.user) {
        setUser(null);
        setUserType(null);
        setIsAdmin(false);
        return;
      }
      
      const email = session.user.email;
      const metadata = session.user.user_metadata || {};
      
      setUser(session.user);
      setIsAdmin(email === "admin@certus.tn");
      // Lire user_type depuis les métadonnées
      setUserType(metadata.user_type === "formateur" ? "formateur" : "participant");
      setIsApproved(true);
      
      console.log("✅ Utilisateur mis à jour:", { 
        email, 
        isAdmin: email === "admin@certus.tn",
        userType: metadata.user_type || "participant"
      });
    };

    const initAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        updateUser(session);
      } catch (err) {
        console.error("Auth error:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    
    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("🔄 Auth event:", event);
      if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
        updateUser(session);
      } else if (event === "SIGNED_OUT") {
        setUser(null);
        setUserType(null);
        setIsAdmin(false);
      }
      setLoading(false);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email, password) => {
    console.log("🔐 Tentative connexion:", email);
    const { data, error } = await supabase.auth.signInWithPassword({ 
      email: email.trim(), 
      password 
    });
    if (error) {
      console.error("❌ Erreur:", error.message);
      throw error;
    }
    console.log("✅ Connexion réussie:", data.user?.email);
    return data;
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setUserType(null);
    setIsAdmin(false);
  };

  const value = { user, isAdmin, userType, isApproved, login, logout, loading };

  return React.createElement(AuthContext.Provider, { value }, children);
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};