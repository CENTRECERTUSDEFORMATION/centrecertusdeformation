import React, { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../supabaseClient";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const resetUser = () => setUser(null);

  const loadUser = async (authUser) => {
    try {
      const { data } = await supabase
        .from("users")
        .select("*")
        .eq("email", authUser.email)
        .maybeSingle();

      if (!data) {
        setUser({
          id: authUser.id,
          email: authUser.email,
          isAdmin: false,
          isApproved: false,
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
        isAdmin: !!data.is_admin,
        isApproved: !!data.is_approved,
      });

    } catch (err) {
      console.error(err);
      setUser(null);
    }
  };

  useEffect(() => {
    const init = async () => {
      const { data } = await supabase.auth.getSession();

      // 🔥 IMPORTANT → débloque UI direct
      setLoading(false);

      if (data?.session?.user) {
        loadUser(data.session.user);
      }
    };

    init();

    const { data: listener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setLoading(false);

        if (session?.user) {
          loadUser(session.user);
        } else {
          resetUser();
        }
      }
    );

    return () => listener?.subscription?.unsubscribe();
  }, []);

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