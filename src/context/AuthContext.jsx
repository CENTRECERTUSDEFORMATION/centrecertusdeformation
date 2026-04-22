import React, { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../supabaseClient";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadUser = async (authUser) => {
    console.log("loadUser called with:", authUser?.id);
    
    if (!authUser?.id) {
      setUser(null);
      return;
    }

    // Version simplifiée - pas d'appel à la base de données
    const userData = {
      id: authUser.id,
      email: authUser.email,
      isAdmin: true,   // Vous êtes admin
      isApproved: true, // Vous êtes approuvé
    };
    
    console.log("User data set:", userData);
    setUser(userData);
  };

  useEffect(() => {
    let mounted = true;

    const init = async () => {
      try {
        console.log("Auth init - starting...");
        setLoading(true);
        
        const { data } = await supabase.auth.getSession();
        const sessionUser = data?.session?.user;

        if (sessionUser) {
          await loadUser(sessionUser);
        } else {
          setUser(null);
        }
      } catch (err) {
        console.error("init auth error:", err);
        setUser(null);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    init();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        const sessionUser = session?.user;
        if (sessionUser) {
          await loadUser(sessionUser);
        } else {
          setUser(null);
        }
        setLoading(false);
      }
    );

    return () => {
      mounted = false;
      if (subscription) subscription.unsubscribe();
    };
  }, []);

  const login = async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAdmin: user?.isAdmin ?? false,
        isApproved: user?.isApproved ?? false,
        login,
        logout,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);