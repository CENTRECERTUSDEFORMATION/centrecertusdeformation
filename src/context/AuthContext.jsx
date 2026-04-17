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
  // LOAD USER FROM DB
  // -------------------------
  const loadUser = async (authUser) => {
    try {
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("id", authUser.id)
        .single();

      if (error || !data) {
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

      // ❌ blocked user
      if (data.is_blocked) {
        await supabase.auth.signOut();
        resetUser();
        return;
      }

      setUser({
        id: authUser.id,
        email: data.email,
        fullName: data.full_name,
        isAdmin: Boolean(data.is_admin),
        isApproved: Boolean(data.is_approved),
        isBlocked: Boolean(data.is_blocked),
      });

    } catch (err) {
      console.error("LOAD USER ERROR:", err);

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
      const { data } = await supabase.auth.getSession();
      const session = data?.session;

      if (!mounted) return;

      if (session?.user) {
        await loadUser(session.user);
      } else {
        resetUser();
      }

      setLoading(false);
    };

    init();

    // LISTENER
    const { data: listener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
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