// frontend/src/context/AuthContext.jsx
import React, { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../supabaseClient";

const AuthContext = createContext();

// ✅ Liste des administrateurs
const ADMIN_EMAILS = ["admin@certus.tn"];

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isApproved, setIsApproved] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const getUser = async () => {
      setLoading(true);
      
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user && isMounted) {
        const email = session.user.email;
        const isUserAdmin = ADMIN_EMAILS.includes(email);
        
        setUser({
          id: session.user.id,
          email: email,
          full_name: session.user.user_metadata?.full_name || email?.split("@")[0],
        });
        setIsAdmin(isUserAdmin);
        setIsApproved(true);
      }
      
      if (isMounted) setLoading(false);
    };

    getUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === "SIGNED_IN" && session?.user && isMounted) {
          const email = session.user.email;
          const isUserAdmin = ADMIN_EMAILS.includes(email);
          
          setUser({
            id: session.user.id,
            email: email,
            full_name: session.user.user_metadata?.full_name || email?.split("@")[0],
          });
          setIsAdmin(isUserAdmin);
          setIsApproved(true);
        } else if (event === "SIGNED_OUT" && isMounted) {
          setUser(null);
          setIsAdmin(false);
        }
        setLoading(false);
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
    setIsAdmin(false);
  };

  return (
    <AuthContext.Provider value={{ user, isAdmin, isApproved, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};