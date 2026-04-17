import React, { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../supabaseClient";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const resetUser = () => {
    setUser(null);
  };

  const loadUser = async (authUser) => {
    console.log("🟣 LOAD USER DB...");

    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("email", authUser.email)
      .maybeSingle();

    if (error) console.error(error);

    if (!data) {
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

    if (data.is_blocked) {
      await supabase.auth.signOut();
      resetUser();
      return;
    }

    setUser({
      id: authUser.id,
      email: data.email,
      fullName: data.full_name,
      isAdmin: !!data.is_admin,
      isApproved: !!data.is_approved,
      isBlocked: !!data.is_blocked,
    });

    console.log("✅ USER LOADED");
  };

  useEffect(() => {
    let ignore = false;

    const init = async () => {
      console.log("🔵 INIT AUTH...");

      const { data } = await supabase.auth.getSession();
      const session = data?.session;

      if (!ignore) {
        if (session?.user) {
          await loadUser(session.user);
        } else {
          resetUser();
        }

        console.log("🟢 AUTH READY");
        setLoading(false);
      }
    };

    init();

    const { data: listener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log("🔄 AUTH CHANGE:", event);

        if (ignore) return;

        if (session?.user) {
          await loadUser(session.user);
        } else {
          resetUser();
        }

        setLoading(false);
      }
    );

    return () => {
      ignore = true;
      listener?.subscription?.unsubscribe();
    };
  }, []);

  const login = async (email, password) => {
    return supabase.auth.signInWithPassword({ email, password });
  };

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