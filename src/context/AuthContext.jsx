// frontend/src/context/AuthContext.jsx
import React, { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../supabaseClient";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    let timeoutId;

    const initAuth = async () => {
      try {
        timeoutId = setTimeout(() => {
          if (isMounted && loading) {
            console.log("⚠️ Timeout: forcing loading=false");
            setLoading(false);
          }
        }, 2000);

        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user && isMounted) {
          setUser({
            id: session.user.id,
            email: session.user.email,
            full_name: session.user.user_metadata?.full_name || session.user.email?.split("@")[0],
          });
        } else {
          setUser(null);
        }
      } catch (err) {
        console.error("Erreur initAuth:", err);
        setUser(null);
      } finally {
        if (isMounted) {
          setLoading(false);
          if (timeoutId) clearTimeout(timeoutId);
        }
      }
    };

    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!isMounted) return;
      if (event === "SIGNED_IN" && session?.user) {
        setUser({
          id: session.user.id,
          email: session.user.email,
          full_name: session.user.user_metadata?.full_name || session.user.email?.split("@")[0],
        });
      } else if (event === "SIGNED_OUT") {
        setUser(null);
      }
      setLoading(false);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [loading]);

  const login = async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  const isAdmin = user?.email === "admin@certus.tn";
  const userType = isAdmin ? null : (user ? "participant" : null);
  const isApproved = true;

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