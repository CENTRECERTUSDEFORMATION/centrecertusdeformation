import React, { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../supabaseClient";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isApproved, setIsApproved] = useState(false);
  const [loading, setLoading] = useState(true);

  // 🔐 charger session
  useEffect(() => {
    const init = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();

        if (session?.user) {
          await loadUser(session.user);
        } else {
          setUser(null);
          setIsAdmin(false);
          setIsApproved(false);
        }
      } catch (err) {
        console.error("Erreur session:", err);
      } finally {
        setLoading(false); // 🔥 IMPORTANT → évite blocage
      }
    };

    init();

    // 🔁 écoute changements auth
    const { data: listener } = supabase.auth.onAuthStateChange(
      async (_, session) => {
        if (session?.user) {
          await loadUser(session.user);
        } else {
          setUser(null);
          setIsAdmin(false);
          setIsApproved(false);
        }
      }
    );

    return () => listener.subscription.unsubscribe();
  }, []);

  // 🔥 charger profil user
  const loadUser = async (authUser) => {
    try {
      setUser(authUser);

      const { data, error } = await supabase
        .from("users")
        .select("is_admin, is_approved")
        .eq("id", authUser.id)
        .single();

      if (error) {
        console.error(error);
        setIsAdmin(false);
        setIsApproved(false);
        return;
      }

      setIsAdmin(Boolean(data?.is_admin));
      setIsApproved(Boolean(data?.is_approved));

    } catch (err) {
      console.error("Erreur loadUser:", err);
    }
  };

  // 🔑 LOGIN
  const login = async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
  };

  // 🚪 LOGOUT
  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setIsAdmin(false);
    setIsApproved(false);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAdmin,
        isApproved,
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