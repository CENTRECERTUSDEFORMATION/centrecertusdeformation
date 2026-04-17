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
  // LOAD USER FROM SUPABASE DB
  // -------------------------
  const loadUser = async (authUser) => {
    console.log("🟣 LOAD USER DB...");

    try {
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("email", authUser.email) // ✅ FIX STABLE
        .maybeSingle();

      if (error) {
        console.error("DB ERROR:", error);
      }

      if (!data) {
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

      // 🚫 BLOCKED USER
      if (data.is_blocked) {
        console.warn("⛔ USER BLOCKED");
        await supabase.auth.signOut();
        resetUser();
        return;
      }

      // ✅ SET USER FINAL
      setUser({
        id: authUser.id,
        email: data.email,
        fullName: data.full_name || authUser.email,
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

  // -------------------------
  // INIT AUTH
  // -------------------------
  useEffect(() => {
    let mounted = true;

    const init = async () => {
      console.log("🔵 INIT AUTH...");

      const { data } = await supabase.auth.getSession();
      const session = data?.session;

      if (!mounted) return;

      if (session?.user) {
        await loadUser(session.user);
      } else {
        resetUser();
      }

      console.log("🟢 AUTH INIT DONE");
      setLoading(false);
    };

    init();

    // LISTENER AUTH STATE
    const { data: listener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log("🔄 AUTH CHANGE:", event);

        if (!mounted) return;

        if (session?.user) {
          await loadUser(session.user);
        } else {
          resetUser();
        }

        setLoading(false);
      }
    );

    return () => {
      mounted = false;
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