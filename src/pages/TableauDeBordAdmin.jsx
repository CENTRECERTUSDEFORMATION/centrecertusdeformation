import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../supabaseClient";
import { toast } from "react-toastify";

const TableauDeBordAdmin = () => {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();

  const [formations, setFormations] = useState([]);
  const [actualites, setActualites] = useState([]);
  const [accessCodes, setAccessCodes] = useState({});
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState("formations");

  const fetchData = async () => {
    setLoading(true);
    try {
      // Formations
      const { data: formationsData } = await supabase
        .from("formations")
        .select("*")
        .order("created_at", { ascending: false });
      setFormations(formationsData || []);
      console.log("Formations chargées:", formationsData?.length);

      // Codes
      if (formationsData?.length > 0) {
        const { data: codesData } = await supabase
          .from("formation_access_codes")
          .select("*")
          .in("formation_id", formationsData.map(f => f.id));
        
        if (codesData) {
          const codesMap = {};
          codesData.forEach(code => {
            codesMap[code.formation_id] = code;
          });
          setAccessCodes(codesMap);
        }
      }

      // Actualités
      const { data: actualitesData } = await supabase
        .from("actualites")
        .select("*")
        .order("created_at", { ascending: false });
      setActualites(actualitesData || []);
      console.log("Actualités chargées:", actualitesData?.length);

    } catch (error) {
      console.error(error);
      toast.error("Erreur chargement");
    } finally {
      setLoading(false);
    }
  };

  const generateCode = async (formationId) => {
    setGenerating(true);
    const newCode = Math.random().toString(36).substring(2, 10).toUpperCase();
    
    try {
      const { data: existing } = await supabase
        .from("formation_access_codes")
        .select("*")
        .eq("formation_id", formationId)
        .maybeSingle();
      
      if (existing) {
        await supabase
          .from("formation_access_codes")
          .update({ teacher_code: newCode, participant_code: newCode, access_code: newCode })
          .eq("formation_id", formationId);
      } else {
        await supabase
          .from("formation_access_codes")
          .insert({ formation_id: formationId, teacher_code: newCode, participant_code: newCode, access_code: newCode });
      }
      
      setAccessCodes(prev => ({ ...prev, [formationId]: { access_code: newCode } }));
      toast.success(`✅ Code: ${newCode}`);
      navigator.clipboard.writeText(newCode);
      
    } catch (error) {
      toast.error("Erreur");
    } finally {
      setGenerating(false);
    }
  };

  const deleteFormation = async (id) => {
    if (!confirm("Supprimer cette formation ?")) return;
    await supabase.from("formations").delete().eq("id", id);
    setFormations(prev => prev.filter(f => f.id !== id));
    toast.success("Formation supprimée");
  };

  const deleteActualite = async (id) => {
    if (!confirm("Supprimer cette actualité ?")) return;
    await supabase.from("actualites").delete().eq("id", id);
    setActualites(prev => prev.filter(a => a.id !== id));
    toast.success("Actualité supprimée");
  };

  useEffect(() => {
    if (!user) navigate("/connexion");
    else if (!isAdmin) navigate("/");
    else fetchData();
  }, [user, isAdmin]);

  if (loading) return <div className="flex justify-center items-center h-96 mt-20"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1a56db]"></div></div>;

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="max-w-6xl mx-auto p-6">
        
        <h1 className="text-2xl font-bold text-blue-800 mb-2">⚙️ Administration</h1>
        <p className="text-gray-500 mb-6">Gérez les formations, actualités et codes</p>

        {/* Onglets */}
        <div className="flex gap-4 mb-6 border-b">
          <button onClick={() => setActiveTab("formations")} className={`pb-2 px-2 ${activeTab === "formations" ? "border-b-2 border-blue-600 text-blue-600" : "text-gray-500"}`}>📚 Formations ({formations.length})</button>
          <button onClick={() => setActiveTab("actualites")} className={`pb-2 px-2 ${activeTab === "actualites" ? "border-b-2 border-blue-600 text-blue-600" : "text-gray-500"}`}>📰 Actualités ({actualites.length})</button>
        </div>

        {/* FORMATIONS */}
        {activeTab === "formations" && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Liste des formations</h2>
              <button onClick={() => navigate("/ajouter-formation")} className="bg-blue-600 text-white px-4 py-2 rounded-lg">➕ Ajouter</button>
            </div>
            {formations.length === 0 ? (
              <p className="text-gray-500">Aucune formation</p>
            ) : (
              <div className="space-y-3">
                {formations.map(f => (
                  <div key={f.id} className="bg-white rounded-lg shadow p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-bold text-lg">{f.title}</h3>
                        <p className="text-gray-500 text-sm">{f.description?.substring(0, 100)}</p>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => navigate(`/modifier-formation/${f.id}`)} className="text-blue-600">✏️</button>
                        <button onClick={() => deleteFormation(f.id)} className="text-red-600">🗑️</button>
                      </div>
                    </div>
                    <div className="mt-3 pt-3 border-t flex justify-between items-center">
                      <span className="text-sm text-gray-600">🔑 Code d'accès</span>
                      {accessCodes[f.id]?.access_code ? (
                        <div className="flex items-center gap-2">
                          <code className="bg-gray-100 px-2 py-1 rounded text-sm">{accessCodes[f.id].access_code}</code>
                          <button onClick={() => navigator.clipboard.writeText(accessCodes[f.id].access_code)} className="text-gray-500">📋</button>
                          <button onClick={() => generateCode(f.id)} disabled={generating} className="text-blue-500 text-sm">🔄</button>
                        </div>
                      ) : (
                        <button onClick={() => generateCode(f.id)} disabled={generating} className="bg-blue-500 text-white px-3 py-1 rounded text-sm">🎲 Générer</button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ACTUALITÉS */}
        {activeTab === "actualites" && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Liste des actualités</h2>
              <button onClick={() => navigate("/ajouter-actualite")} className="bg-blue-600 text-white px-4 py-2 rounded-lg">➕ Ajouter</button>
            </div>
            {actualites.length === 0 ? (
              <p className="text-gray-500">Aucune actualité</p>
            ) : (
              <div className="space-y-3">
                {actualites.map(a => (
                  <div key={a.id} className="bg-white rounded-lg shadow p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-bold text-lg">{a.titre}</h3>
                        <p className="text-gray-500 text-sm">{a.contenu?.substring(0, 100)}</p>
                        <p className="text-xs text-gray-400 mt-1">{new Date(a.created_at).toLocaleDateString()}</p>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => navigate(`/modifier-actualite/${a.id}`)} className="text-blue-600">✏️</button>
                        <button onClick={() => deleteActualite(a.id)} className="text-red-600">🗑️</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default TableauDeBordAdmin;