import React, { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../supabaseClient";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // -------------------------
  // RESET USER
  // -------------------------
  const resetUser = () => {
    setUser(null);
  };

  // -------------------------
  // LOAD USER DB (SAFE + STABLE)
  // -------------------------
  const loadUser = async (authUser) => {
    try {
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("id", authUser.id) // ✅ IMPORTANT FIX (stable key)
        .maybeSingle();

      if (error) {
        console.error("DB ERROR:", error);
      }

      if (!data) {
        setUser({
          id: authUser.id,
          email: authUser.email,
          isAdmin: false,
          isApproved: false,
        });
        return;
      }

      // ⛔ BLOCK USER
      if (data.is_blocked) {
        await supabase.auth.signOut();
        resetUser();
        return;
      }

      // ✅ NORMAL USER
      setUser({
        id: authUser.id,
        email: data.email || authUser.email,
        isAdmin: data.is_admin === true,
        isApproved: data.is_approved === true,
      });

    } catch (err) {
      console.error("AUTH LOAD ERROR:", err);

      setUser({
        id: authUser.id,
        email: authUser.email,
        isAdmin: false,
        isApproved: false,
      });
    }
  };

  // -------------------------
  // INIT AUTH
  // -------------------------
  useEffect(() => {
    let active = true;

    const init = async () => {
      const { data } = await supabase.auth.getSession();
      const session = data?.session;

      if (!active) return;

      if (session?.user) {
        await loadUser(session.user);
      } else {
        resetUser();
      }

      setLoading(false); // ✅ AFTER everything
    };

    init();

    const { data: listener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!active) return;

        if (session?.user) {
          await loadUser(session.user);
        } else {
          resetUser();
        }

        setLoading(false);
      }
    );

    return () => {
      active = false;
      listener?.subscription?.unsubscribe();
    };
  }, []);

  // -------------------------
  // LOGIN
  // -------------------------
  const login = async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
  };

  // -------------------------
  // LOGOUT
  // -------------------------
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