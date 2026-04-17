import React, { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../supabaseClient";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      console.log("🔵 INIT AUTH...");

      try {
        const { data } = await supabase.auth.getSession();
        const session = data?.session;

        if (session?.user) {
          await loadUser(session.user);
        } else {
          resetUser();
        }
      } catch (err) {
        console.error("❌ AUTH ERROR:", err);
        resetUser();
      } finally {
        setLoading(false);
      }
    };

    init();

    const { data: listener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log("🔄 AUTH CHANGE:", event);

        if (session?.user) {
          await loadUser(session.user);
        } else {
          resetUser();
        }
      }
    );

    return () => listener?.subscription?.unsubscribe();
  }, []);

  // 🔥 RESET USER
  const resetUser = () => {
    setUser(null);
  };

  // 🔥 LOAD USER FROM SUPABASE DB
  const loadUser = async (authUser) => {
    console.log("🟣 LOAD USER DB...");

    try {
      const { data, error } = await supabase
        .from("users")
        .select("id, full_name, email, is_admin, is_approved, is_blocked, login_count, last_login")
        .eq("id", authUser.id)   // ✅ FIX IMPORTANT (PLUS EMAIL)
        .maybeSingle();

      if (error || !data) {
        console.warn("⚠️ USER NOT FOUND IN DB");

        setUser({
          id: authUser.id,
          email: authUser.email,
          fullName: authUser.email,
          isAdmin: false,
          isApproved: false,
          isBlocked: false,
        });

        return;
      }

      // 🚨 BLOCKED USER CHECK
      if (data.is_blocked) {
        console.warn("⛔ USER BLOCKED");

        await supabase.auth.signOut();
        resetUser();
        return;
      }

      // 🔥 UPDATE LOGIN STATS (OPTIONNEL MAIS PRO)
      await supabase
        .from("users")
        .update({
          login_count: (data.login_count || 0) + 1,
          last_login: new Date().toISOString(),
        })
        .eq("id", authUser.id);

      setUser({
        id: authUser.id,
        email: data.email,
        fullName: data.full_name,
        isAdmin: Boolean(data.is_admin),
        isApproved: Boolean(data.is_approved),
        isBlocked: Boolean(data.is_blocked),
      });

      console.log("✅ USER LOADED:", data);

    } catch (err) {
      console.error("❌ LOAD USER ERROR:", err);

      setUser({
        id: authUser.id,
        email: authUser.email,
        fullName: authUser.email,
        isAdmin: false,
        isApproved: false,
        isBlocked: false,
      });
    }
  };

  // 🔐 LOGIN
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
    resetUser();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAdmin: user?.isAdmin || false,
        isApproved: user?.isApproved || false,
        isBlocked: user?.isBlocked || false,
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