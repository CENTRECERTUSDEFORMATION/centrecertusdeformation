import React, { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../supabaseClient";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadUser = async (authUser) => {
    setUser(authUser);

    const { data } = await supabase
      .from("users")
      .select("role")
      .eq("id", authUser.id)
      .maybeSingle();

    setRole(data?.role || "user");
  };

  useEffect(() => {
    const init = async () => {
      setLoading(true);

      const { data: { session } } = await supabase.auth.getSession();

      if (session?.user) {
        await loadUser(session.user);
      } else {
        setUser(null);
        setRole(null);
      }

      setLoading(false);
    };

    init();

    const { data: listener } = supabase.auth.onAuthStateChange(
      async (_, session) => {
        if (session?.user) {
          await loadUser(session.user);
        } else {
          setUser(null);
          setRole(null);
        }
        setLoading(false);
      }
    );

    return () => listener.subscription.unsubscribe();
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
    setUser(null);
    setRole(null);
  };

  return (
    <AuthContext.Provider value={{ user, role, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);