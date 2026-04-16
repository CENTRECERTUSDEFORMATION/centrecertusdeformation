import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-toastify";

const TableauDeBordAdmin = () => {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate("/connexion");
      return;
    }

    if (!isAdmin) {
      toast.error("Accès refusé");
      navigate("/espace-participant");
    }
  }, [user, isAdmin]);

  if (!user || !isAdmin) return null;

  return (
    <div>
      <h1>Admin Dashboard</h1>
    </div>
  );
};

export default TableauDeBordAdmin;