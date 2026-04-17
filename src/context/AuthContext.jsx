import React, { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../supabaseClient";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isApproved, setIsApproved] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      try {
        const sessionData = await supabase.auth.getSession();

        const session = sessionData?.data?.session;

        if (session?.user) {
          await loadUser(session.user);
        } else {
          resetUser();
        }

      } catch (err) {
        console.error("Erreur Auth:", err);
        resetUser();
      } finally {
        setLoading(false); // 🔥 IMPORTANT
      }
    };

    init();

    const { data: listener } = supabase.auth.onAuthStateChange(
      async (_, session) => {
        if (session?.user) {
          await loadUser(session.user);
        } else {
          resetUser();
        }
      }
    );

    return () => listener?.subscription?.unsubscribe();
  }, []);

  const resetUser = () => {
    setUser(null);
    setIsAdmin(false);
    setIsApproved(false);
  };

  const loadUser = async (authUser) => {
    try {
      setUser(authUser);

      const { data, error } = await supabase
        .from("users")
        .select("is_admin, is_approved")
        .eq("id", authUser.id)
        .single();

      if (error || !data) {
        console.error("Erreur user:", error);
        setIsAdmin(false);
        setIsApproved(false);
        return;
      }

      setIsAdmin(data.is_admin === true);
      setIsApproved(data.is_approved === true);

    } catch (err) {
      console.error("Erreur loadUser:", err);
      setIsAdmin(false);
      setIsApproved(false);
    }
  };

  const login = async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
  };

  const logout = async () => {
    await supabase.auth.signOut();
    resetUser();
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