// frontend/src/context/AuthContext.jsx
import React, { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../supabaseClient";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Liste des administrateurs (à maintenir manuellement)
  const ADMIN_EMAILS = ["admin@certus.tn", "rim@certus.tn"];

  useEffect(() => {
    let isMounted = true;

    const initAuth = async () => {
      try {
        setLoading(true);
        
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user && isMounted) {
          // Version simple et fiable - pas d'appel base
          setUser({
            id: session.user.id,
            email: session.user.email,
            isAdmin: ADMIN_EMAILS.includes(session.user.email),
            isApproved: true,
            full_name: session.user.user_metadata?.full_name || session.user.email?.split("@")[0],
          });
        }
      } catch (err) {
        console.error("Erreur:", err);
        setUser(null);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === "SIGNED_IN" && session?.user && isMounted) {
          setUser({
            id: session.user.id,
            email: session.user.email,
            isAdmin: ADMIN_EMAILS.includes(session.user.email),
            isApproved: true,
            full_name: session.user.user_metadata?.full_name || session.user.email?.split("@")[0],
          });
        } else if (event === "SIGNED_OUT" && isMounted) {
          setUser(null);
        }
      }
    );

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  const value = {
    user,
    isAdmin: user?.isAdmin === true,
    isApproved: user?.isApproved === true,
    login,
    logout,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};