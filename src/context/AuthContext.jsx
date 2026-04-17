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

  // 🔥 RESET
  const resetUser = () => {
    setUser(null);
  };

  // 🔥 LOAD USER + ROLE
  const loadUser = async (authUser) => {
    console.log("🟣 LOAD USER DB...");

    const { data, error } = await supabase
      .from("users")
      .select("full_name, is_admin, is_approved, email")
      .eq("email", authUser.email)
      .maybeSingle();

    if (error || !data) {
      console.warn("⚠️ USER NOT FOUND IN DB");
      setUser({
        ...authUser,
        isAdmin: false,
        isApproved: false,
      });
      return;
    }

    setUser({
      ...authUser,
      fullName: data.full_name,
      email: data.email,
      isAdmin: Boolean(data.is_admin),
      isApproved: Boolean(data.is_approved),
    });

    console.log("✅ USER LOADED:", data);
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

  console.log("🧠 STATE:", { user, loading });

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