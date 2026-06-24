// frontend/src/context/AuthContext.jsx
import React, { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../supabaseClient";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userType, setUserType] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isApproved, setIsApproved] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchUserProfile = async (userId) => {
    try {
      const { data, error } = await supabase
        .from("users")
        .select("user_type, is_admin, is_approved")
        .eq("id", userId)
        .single();

      if (error) {
        console.error("❌ Erreur fetch profile:", error);
        return null;
      }
      return data;
    } catch (err) {
      console.error("❌ Erreur:", err);
      return null;
    }
  };

  const updateUser = async (session) => {
    if (!session?.user) {
      setUser(null);
      setUserType(null);
      setIsAdmin(false);
      setIsApproved(false);
      return;
    }

    const email = session.user.email;
    setUser(session.user);

    // Récupérer le profil depuis la table users
    const profile = await fetchUserProfile(session.user.id);

    if (profile) {
      setUserType(profile.user_type || "participant");
      setIsAdmin(profile.is_admin || false);
      setIsApproved(profile.is_approved !== false);
      
      console.log("✅ Utilisateur mis à jour:", {
        email,
        userType: profile.user_type || "participant",
        isAdmin: profile.is_admin || false,
        isApproved: profile.is_approved !== false
      });
    } else {
      // Fallback : utiliser l'email pour admin
      const isAdminEmail = email === "admin@certus.tn";
      setIsAdmin(isAdminEmail);
      setUserType(isAdminEmail ? "admin" : "participant");
      setIsApproved(true);
      
      console.log("✅ Utilisateur mis à jour (fallback):", {
        email,
        isAdmin: isAdminEmail,
        userType: isAdminEmail ? "admin" : "participant"
      });
    }
  };

  useEffect(() => {
    let isMounted = true;

    const initAuth = async () => {
      setLoading(true);
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (isMounted) {
          await updateUser(session);
        }
      } catch (err) {
        console.error("❌ Auth error:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("🔄 Auth event:", event);
      if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
        await updateUser(session);
      } else if (event === "SIGNED_OUT") {
        setUser(null);
        setUserType(null);
        setIsAdmin(false);
        setIsApproved(false);
      }
      if (isMounted) setLoading(false);
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
    setIsApproved(false);
  };

  const value = {
    user,
    isAdmin,
    userType,
    isApproved,
    login,
    logout,
    loading
  };

  return React.createElement(AuthContext.Provider, { value }, children);
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};