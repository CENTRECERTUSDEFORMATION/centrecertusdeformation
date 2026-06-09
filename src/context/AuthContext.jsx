// frontend/src/context/AuthContext.jsx
import React, { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../supabaseClient";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userType, setUserType] = useState("participant");
  const [isAdmin, setIsAdmin] = useState(false);
  const [isApproved, setIsApproved] = useState(true);
  const [loading, setLoading] = useState(false);

  // Récupérer les données depuis la table auth_users
  const getUserFromTable = async (email) => {
    try {
      const { data, error } = await supabase
        .from("auth_users")
        .select("user_type, is_admin, is_approved, display_name")
        .eq("email", email)
        .maybeSingle();

      if (error || !data) {
        return null;
      }
      return data;
    } catch (err) {
      console.error("Erreur getUserFromTable:", err);
      return null;
    }
  };

  useEffect(() => {
    const checkUser = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          const email = session.user.email;
          
          // Récupérer les données depuis auth_users
          const userData = await getUserFromTable(email);
          
          setUser({
            id: session.user.id,
            email: email,
            full_name: userData?.display_name || session.user.user_metadata?.full_name || email.split("@")[0],
          });
          setIsAdmin(userData?.is_admin || email === "admin@certus.tn");
          setUserType(userData?.user_type || session.user.user_metadata?.user_type || "participant");
          setIsApproved(userData?.is_approved !== false);
          
          console.log("✅ AuthContext chargé:", { 
            email, 
            userType: userData?.user_type,
            isAdmin: userData?.is_admin || email === "admin@certus.tn"
          });
        }
      } catch (err) {
        console.error("Auth error:", err);
      } finally {
        setLoading(false);
      }
    };
    
    checkUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_IN" && session?.user) {
        const email = session.user.email;
        const userData = await getUserFromTable(email);
        
        setUser({
          id: session.user.id,
          email: email,
          full_name: userData?.display_name || session.user.user_metadata?.full_name || email.split("@")[0],
        });
        setIsAdmin(userData?.is_admin || email === "admin@certus.tn");
        setUserType(userData?.user_type || session.user.user_metadata?.user_type || "participant");
        setIsApproved(userData?.is_approved !== false);
      } else if (event === "SIGNED_OUT") {
        setUser(null);
        setUserType("participant");
        setIsAdmin(false);
        setIsApproved(true);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setUserType("participant");
    setIsAdmin(false);
    setIsApproved(true);
  };

  const value = { user, isAdmin, userType, isApproved, login, logout, loading };

  return React.createElement(AuthContext.Provider, { value }, children);
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};