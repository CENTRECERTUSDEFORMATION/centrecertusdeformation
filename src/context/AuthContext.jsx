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
        const { data } = await supabase.auth.getSession();
        const session = data?.session;

        if (session?.user) {
          console.log("🟢 USER FOUND:", session.user);
          loadUser(session.user); // ❗ PAS de await (évite boucle)
        } else {
          console.log("🔴 NO SESSION USER");
          resetUser();
        }

      } catch (err) {
        console.error("❌ AUTH ERROR:", err);
        resetUser();
      } finally {
        console.log("✅ LOADING FALSE");
        setLoading(false);
      }
    };

    init();

    const { data: listener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log("🔄 AUTH CHANGE:", event);

        if (session?.user) {
          console.log("🟢 USER CHANGE:", session.user);
          loadUser(session.user); // ❗ PAS await
        } else {
          console.log("🔴 USER LOGOUT");
          resetUser();
        }
      }
    );

    return () => {
      listener?.subscription?.unsubscribe();
    };
  }, []);

  // 🔥 RESET USER
  const resetUser = () => {
    setUser(null);
    setIsAdmin(false);
    setIsApproved(false);
  };

  // 🔥 LOAD USER FROM DB
  const loadUser = async (authUser) => {
    console.log("🟣 LOAD USER DB...");

    setUser(authUser);

    try {
      const { data, error } = await supabase
        .from("users")
        .select("is_admin, is_approved")
        .eq("email", authUser.email)
        .maybeSingle(); // ✅ plus safe que single()

      console.log("📦 USER DB RESULT:", data);

      if (error || !data) {
        console.warn("⚠️ USER NOT FOUND IN DB");
        setIsAdmin(false);
        setIsApproved(false);
        return;
      }

      setIsAdmin(Boolean(data.is_admin));
      setIsApproved(Boolean(data.is_approved));

      console.log("✅ ADMIN:", data.is_admin, "APPROVED:", data.is_approved);

    } catch (err) {
      console.error("❌ LOAD USER ERROR:", err);
      setIsAdmin(false);
      setIsApproved(false);
    }
  };

  // 🔑 LOGIN
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

  // 🚪 LOGOUT
  const logout = async () => {
    console.log("🚪 LOGOUT...");
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