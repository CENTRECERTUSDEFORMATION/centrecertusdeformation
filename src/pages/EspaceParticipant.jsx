import React, { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import { useAuth } from "../context/AuthContext";
import { Helmet } from "react-helmet-async";

export default function EspaceParticipant() {
  const { user } = useAuth();
  const [formations, setFormations] = useState([]);

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase.from("formations").select("*");
      setFormations(data || []);
    };
    fetch();
  }, []);

  return (
    <>
      <Helmet>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
      <div className="p-6 mt-20">
        <h2>Bienvenue {user?.email}</h2>

        <h3>Formations disponibles :</h3>

        {formations.map((f) => (
          <p key={f.id}>{f.title}</p>
        ))}
      </div>
    </>
  );
}