// frontend/src/context/AuthContext.jsx
import React, { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../supabaseClient";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userType, setUserType] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isApproved, setIsApproved] = useState(true);
  const [loading, setLoading] = useState(true);

  // Fonction pour récupérer les données utilisateur depuis la base
  const fetchUserData = async (userId, email) => {
    console.log("🔍 fetchUserData - userId:", userId, "email:", email);
    
    // Admin principal (pas besoin de base de données)
    if (email === "admin@certus.tn") {
      console.log("🔍 Admin principal détecté");
      return { userType: null, isAdmin: true, isApproved: true, fullName: "Administrateur" };
    }
    
    // Formateur par email connu (fallback)
    if (email === "houssem@certus.tn") {
      console.log("🔍 Formateur fixe détecté");
      return { userType: "formateur", isAdmin: false, isApproved: true, fullName: "Houssem" };
    }
    
    try {
      // Récupérer depuis la base de données avec maybeSingle() (pas d'erreur 406)
      const { data, error } = await supabase
        .from("users")
        .select("user_type, is_approved, full_name")
        .eq("id", userId)
        .maybeSingle();
      
      if (error) throw error;
      
      if (data) {
        console.log("🔍 Données utilisateur trouvées:", data);
        return {
          userType: data.user_type || "participant",
          isAdmin: false,
          isApproved: data.is_approved === true,
          fullName: data.full_name || email.split("@")[0]
        };
      }
      
      console.log("🔍 Utilisateur non trouvé, création en cours...");
      // L'utilisateur n'existe pas dans la table, le créer avec is_approved = false
      const { error: insertError } = await supabase
        .from("users")
        .insert({
          id: userId,
          email: email,
          full_name: email.split("@")[0],
          user_type: "participant",
          is_approved: false,
          created_at: new Date().toISOString()
        });
      
      if (insertError) {
        console.warn("⚠️ Erreur création utilisateur:", insertError);
        return { userType: "participant", isAdmin: false, isApproved: false, fullName: email.split("@")[0] };
      }
      
      console.log("🔍 Utilisateur créé avec succès");
      return { userType: "participant", isAdmin: false, isApproved: false, fullName: email.split("@")[0] };
    } catch (err) {
      console.warn("⚠️ Erreur fetchUserData:", err);
      return { userType: "participant", isAdmin: false, isApproved: false, fullName: email.split("@")[0] };
    }
  };

  useEffect(() => {
    let isMounted = true;

    const initAuth = async () => {
      try {
        setLoading(true);
        console.log("🔍 initAuth - Début");
        
        const { data: { session } } = await supabase.auth.getSession();
        console.log("🔍 Session reçue:", session?.user?.email || "Aucune session");
        
        if (session?.user && isMounted) {
          const email = session.user.email;
          const userData = await fetchUserData(session.user.id, email);
          console.log("🔍 userData reçues:", userData);
          
          setUser({
            id: session.user.id,
            email: email,
            full_name: userData.fullName,
          });
          setUserType(userData.userType);
          setIsAdmin(userData.isAdmin);
          setIsApproved(userData.isApproved);
          console.log("🔍 Utilisateur connecté:", email, "type:", userData.userType);
        } else {
          console.log("🔍 Aucune session active");
          setUser(null);
          setUserType(null);
          setIsAdmin(false);
          setIsApproved(true);
        }
      } catch (err) {
        console.error("❌ Erreur initAuth:", err);
        setUser(null);
      } finally {
        if (isMounted) {
          console.log("🔍 setLoading(false)");
          setLoading(false);
        }
      }
    };

    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("🔍 onAuthStateChange - event:", event, "user:", session?.user?.email);
      if (!isMounted) return;
      
      if (event === "SIGNED_IN" && session?.user) {
        const email = session.user.email;
        const userData = await fetchUserData(session.user.id, email);
        
        setUser({
          id: session.user.id,
          email: email,
          full_name: userData.fullName,
        });
        setUserType(userData.userType);
        setIsAdmin(userData.isAdmin);
        setIsApproved(userData.isApproved);
      } else if (event === "SIGNED_OUT") {
        setUser(null);
        setUserType(null);
        setIsAdmin(false);
        setIsApproved(true);
      }
      setLoading(false);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email, password) => {
    console.log("🔍 Tentative de connexion:", email);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    console.log("🔍 Connexion réussie:", email);
  };

  const logout = async () => {
    console.log("🔍 Déconnexion");
    await supabase.auth.signOut();
    setUser(null);
    setUserType(null);
    setIsAdmin(false);
    setIsApproved(true);
  };

  const value = {
    user,
    isAdmin,
    userType,
    isApproved,
    login,
    logout,
    loading,
  };

  return React.createElement(AuthContext.Provider, { value }, children);
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};