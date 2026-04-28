import React, { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../supabaseClient";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const ADMINS = ["admin@certus.tn", "rim@certus.tn"];

  const loadUser = async (sessionUser) => {
    if (!sessionUser?.id) return null;

    const fallbackUser = {
      id: sessionUser.id,
      email: sessionUser.email,
      isAdmin: ADMINS.includes(sessionUser.email),
      isApproved: true,
      full_name: sessionUser.user_metadata?.full_name || sessionUser.email?.split("@")[0],
    };

    try {
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error("Timeout")), 3000)
      );

      const queryPromise = supabase
        .from("users")
        .select("is_admin, is_approved, full_name")
        .eq("id", sessionUser.id)
        .maybeSingle();

      const result = await Promise.race([queryPromise, timeoutPromise]);
      const { data: userData, error } = result;

      if (!error && userData) {
        return {
          id: sessionUser.id,
          email: sessionUser.email,
          isAdmin: userData.is_admin === true,
          isApproved: userData.is_approved === true,
          full_name: userData.full_name,
        };
      }
    } catch (err) {
      console.log("⚠️ Timeout, fallback utilisé");
    }

    return fallbackUser;
  };

  useEffect(() => {
    let isMounted = true;

    const initAuth = async () => {
      try {
        setLoading(true);
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user && isMounted) {
          const userData = await loadUser(session.user);
          if (isMounted) setUser(userData);
        }
      } catch (err) {
        console.error(err);
        setUser(null);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === "SIGNED_IN" && session?.user && isMounted) {
          setLoading(true);
          const userData = await loadUser(session.user);
          if (isMounted) setUser(userData);
          setLoading(false);
        } else if (event === "SIGNED_OUT" && isMounted) {
          setUser(null);
          setLoading(false);
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