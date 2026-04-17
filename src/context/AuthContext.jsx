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
      console.log("🔵 INIT AUTH...");

      try {
        const sessionData = await supabase.auth.getSession();
        console.log("🟡 SESSION DATA:", sessionData);

        const session = sessionData?.data?.session;

        if (session?.user) {
          console.log("🟢 USER FOUND:", session.user);
          await loadUser(session.user);
        } else {
          console.log("🔴 NO SESSION USER");
          resetUser();
        }

      } catch (err) {
        console.error("❌ ERREUR AUTH:", err);
        resetUser();
      } finally {
        console.log("✅ SET LOADING FALSE");
        setLoading(false);
      }
    };

    init();

    const { data: listener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log("🔄 AUTH CHANGE:", event);

        if (session?.user) {
          console.log("🟢 USER CHANGE:", session.user);
          await loadUser(session.user);
        } else {
          console.log("🔴 USER LOGOUT");
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
    console.log("🟣 LOAD USER DB...");

    try {
      setUser(authUser);

      const { data, error } = await supabase
        .from("users")
        .select("is_admin, is_approved")
        .eq("email", authUser.email) // 🔥 IMPORTANT (pas id)
        .single();

      console.log("📦 USER DB RESULT:", data);

      if (error || !data) {
        console.error("❌ USER DB ERROR:", error);
        setIsAdmin(false);
        setIsApproved(false);
        return;
      }

      setIsAdmin(data.is_admin === true);
      setIsApproved(data.is_approved === true);

      console.log("✅ ADMIN:", data.is_admin, "APPROVED:", data.is_approved);

    } catch (err) {
      console.error("❌ LOAD USER ERROR:", err);
      setIsAdmin(false);
      setIsApproved(false);
    }
  };

  const login = async (email, password) => {
    console.log("🔐 LOGIN...");

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error("❌ LOGIN ERROR:", error);
      throw error;
    }
  };

  const logout = async () => {
    console.log("🚪 LOGOUT");
    await supabase.auth.signOut();
    resetUser();
  };

  console.log("🧠 STATE:", { user, isAdmin, isApproved, loading });

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