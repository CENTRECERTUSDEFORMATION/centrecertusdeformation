// frontend/src/context/AuthContext.jsx
import React, { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../supabaseClient";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userType, setUserType] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isApproved, setIsApproved] = useState(true);
  const [loading, setLoading] = useState(true);

  const fetchUserData = async (userId, email) => {
    if (email === "admin@certus.tn") {
      return { userType: null, isAdmin: true, isApproved: true, fullName: "Administrateur" };
    }
    
    if (email === "houssem@certus.tn") {
      return { userType: "formateur", isAdmin: false, isApproved: true, fullName: "Houssem" };
    }
    
    try {
      const { data, error } = await supabase
        .from("users")
        .select("user_type, is_approved, full_name")
        .eq("id", userId)
        .maybeSingle();
      
      if (error) throw error;
      
      if (data) {
        return {
          userType: data.user_type || "participant",
          isAdmin: false,
          isApproved: data.is_approved === true,
          fullName: data.full_name || email.split("@")[0]
        };
      }
      
      return { userType: "participant", isAdmin: false, isApproved: false, fullName: email.split("@")[0] };
    } catch (err) {
      console.warn("Erreur fetchUserData:", err);
      return { userType: "participant", isAdmin: false, isApproved: false, fullName: email.split("@")[0] };
    }
  };

  useEffect(() => {
    let isMounted = true;
    let initialized = false;

    const initAuth = async () => {
      if (initialized) return;
      
      try {
        setLoading(true);
        
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user && isMounted) {
          const email = session.user.email;
          const userData = await fetchUserData(session.user.id, email);
          
          setUser({
            id: session.user.id,
            email: email,
            full_name: userData.fullName,
          });
          setUserType(userData.userType);
          setIsAdmin(userData.isAdmin);
          setIsApproved(userData.isApproved);
        } else {
          setUser(null);
          setUserType(null);
          setIsAdmin(false);
          setIsApproved(true);
        }
        initialized = true;
      } catch (err) {
        console.error("Erreur initAuth:", err);
        setUser(null);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!isMounted) return;
      
      // Ignorer l'événement INITIAL_SESSION car on a déjà chargé la session
      if (event === "INITIAL_SESSION") return;
      
      if (event === "SIGNED_IN" && session?.user) {
        const email = session.user.email;
        const userData = await fetchUserData(session.user.id, email);
        
        setUser({
          id: session.user.id,
          email: email,
          full_name: userData.fullName,
        });
        setUserType(userData.userType);
        setIsAdmin(userData.isAdmin);
        setIsApproved(userData.isApproved);
        setLoading(false);
      } else if (event === "SIGNED_OUT") {
        setUser(null);
        setUserType(null);
        setIsAdmin(false);
        setIsApproved(true);
        setLoading(false);
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setUserType(null);
    setIsAdmin(false);
    setIsApproved(true);
  };

  const value = {
    user,
    isAdmin,
    userType,
    isApproved,
    login,
    logout,
    loading,
  };

  return React.createElement(AuthContext.Provider, { value }, children);
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};