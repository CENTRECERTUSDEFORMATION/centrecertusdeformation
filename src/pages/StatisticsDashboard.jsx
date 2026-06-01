// frontend/src/pages/StatisticsDashboard.jsx
import React, { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { motion } from "framer-motion";

export default function StatisticsDashboard() {
  const { isAdmin, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  
  const [stats, setStats] = useState({
    totalVisits: 0,
    todayVisits: 0,
    topPages: [],
    topCountries: [],
    topDevices: [],
    topBrowsers: [],
    recentVisits: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !isAdmin) {
      toast.error("Accès refusé");
      navigate("/");
    }
  }, [isAdmin, authLoading, navigate]);

  useEffect(() => {
    if (isAdmin) {
      fetchStatistics();
    }
  }, [isAdmin]);

  const fetchStatistics = async () => {
    setLoading(true);
    
    try {
      const { data: pageViews, error } = await supabase
        .from("tracking_page_views")
        .select("*")
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      
      const today = new Date().toISOString().split('T')[0];
      const todayVisits = pageViews?.filter(pv => pv.created_at?.split('T')[0] === today).length || 0;
      
      // Top pages
      const pageCount = {};
      pageViews?.forEach(pv => {
        pageCount[pv.page_url] = (pageCount[pv.page_url] || 0) + 1;
      });
      const topPages = Object.entries(pageCount).sort((a, b) => b[1] - a[1]).slice(0, 10);
      
      // Top pays
      const countryCount = {};
      pageViews?.forEach(pv => {
        if (pv.country && pv.country !== 'Inconnu') {
          countryCount[pv.country] = (countryCount[pv.country] || 0) + 1;
        }
      });
      const topCountries = Object.entries(countryCount).sort((a, b) => b[1] - a[1]).slice(0, 5);
      
      // Top appareils
      const deviceCount = {};
      pageViews?.forEach(pv => {
        if (pv.device_type) {
          deviceCount[pv.device_type] = (deviceCount[pv.device_type] || 0) + 1;
        }
      });
      const topDevices = Object.entries(deviceCount);
      
      // Top navigateurs
      const browserCount = {};
      pageViews?.forEach(pv => {
        if (pv.browser) {
          browserCount[pv.browser] = (browserCount[pv.browser] || 0) + 1;
        }
      });
      const topBrowsers = Object.entries(browserCount).sort((a, b) => b[1] - a[1]).slice(0, 5);
      
      setStats({
        totalVisits: pageViews?.length || 0,
        todayVisits: todayVisits,
        topPages: topPages,
        topCountries: topCountries,
        topDevices: topDevices,
        topBrowsers: topBrowsers,
        recentVisits: pageViews?.slice(0, 20) || []
      });
      
    } catch (error) {
      console.error("Erreur:", error);
      toast.error("Erreur chargement statistiques");
    } finally {
      setLoading(false);
    }
  };

  if (!isAdmin) return null;

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96 mt-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1a56db]"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 mt-20">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-[#1a56db]">📊 Statistiques</h1>
          <p className="text-gray-500 mt-1">Analyse des visites et comportements</p>
        </div>
        <button
          onClick={fetchStatistics}
          className="bg-[#1a56db] text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
        >
          🔄 Rafraîchir
        </button>
      </div>

      {/* Cartes KPI */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <motion.div whileHover={{ scale: 1.02 }} className="bg-white rounded-xl shadow-md p-6">
          <div className="text-4xl mb-2">👁️</div>
          <div className="text-2xl font-bold text-[#1a56db]">{stats.totalVisits}</div>
          <div className="text-gray-500 text-sm">Visites totales</div>
        </motion.div>
        
        <motion.div whileHover={{ scale: 1.02 }} className="bg-white rounded-xl shadow-md p-6">
          <div className="text-4xl mb-2">📅</div>
          <div className="text-2xl font-bold text-[#1a56db]">{stats.todayVisits}</div>
          <div className="text-gray-500 text-sm">Visites aujourd'hui</div>
        </motion.div>
        
        <motion.div whileHover={{ scale: 1.02 }} className="bg-white rounded-xl shadow-md p-6">
          <div className="text-4xl mb-2">🌍</div>
          <div className="text-2xl font-bold text-[#1a56db]">{stats.topCountries.length}</div>
          <div className="text-gray-500 text-sm">Pays différents</div>
        </motion.div>
        
        <motion.div whileHover={{ scale: 1.02 }} className="bg-white rounded-xl shadow-md p-6">
          <div className="text-4xl mb-2">📱</div>
          <div className="text-2xl font-bold text-[#1a56db]">{stats.topDevices.length}</div>
          <div className="text-gray-500 text-sm">Types d'appareils</div>
        </motion.div>
      </div>

      {/* Grille des statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Top pays */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="font-semibold text-lg mb-4">🌍 Visiteurs par pays</h3>
          {stats.topCountries.length === 0 ? (
            <p className="text-gray-500 text-center py-4">Aucune donnée</p>
          ) : (
            stats.topCountries.map(([country, count], idx) => (
              <div key={idx} className="flex justify-between items-center py-2 border-b">
                <span className="text-sm text-gray-600">{country}</span>
                <span className="text-sm font-semibold text-[#1a56db]">{count} visites</span>
              </div>
            ))
          )}
        </div>

        {/* Top appareils */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="font-semibold text-lg mb-4">📱 Appareils utilisés</h3>
          {stats.topDevices.length === 0 ? (
            <p className="text-gray-500 text-center py-4">Aucune donnée</p>
          ) : (
            stats.topDevices.map(([device, count], idx) => (
              <div key={idx} className="flex justify-between items-center py-2 border-b">
                <span className="text-sm text-gray-600">
                  {device === 'desktop' ? '💻 Ordinateur' : device === 'mobile' ? '📱 Mobile' : '📟 Tablette'}
                </span>
                <span className="text-sm font-semibold text-[#1a56db]">{count} visites</span>
              </div>
            ))
          )}
        </div>

        {/* Top navigateurs */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="font-semibold text-lg mb-4">🌐 Navigateurs</h3>
          {stats.topBrowsers.length === 0 ? (
            <p className="text-gray-500 text-center py-4">Aucune donnée</p>
          ) : (
            stats.topBrowsers.map(([browser, count], idx) => (
              <div key={idx} className="flex justify-between items-center py-2 border-b">
                <span className="text-sm text-gray-600">{browser}</span>
                <span className="text-sm font-semibold text-[#1a56db]">{count} visites</span>
              </div>
            ))
          )}
        </div>

        {/* Top pages */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="font-semibold text-lg mb-4">📄 Pages les plus visitées</h3>
          {stats.topPages.length === 0 ? (
            <p className="text-gray-500 text-center py-4">Aucune donnée</p>
          ) : (
            stats.topPages.map(([page, count], idx) => (
              <div key={idx} className="flex justify-between items-center py-2 border-b">
                <span className="text-sm text-gray-600">{page || 'Accueil'}</span>
                <span className="text-sm font-semibold text-[#1a56db]">{count} visites</span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Dernières visites */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h3 className="font-semibold text-lg mb-4">🕐 Dernières visites</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="p-3 text-left">Date</th>
                <th className="p-3 text-left">Page</th>
                <th className="p-3 text-left">Pays</th>
                <th className="p-3 text-left">Appareil</th>
                <th className="p-3 text-left">Navigateur</th>
              </tr>
            </thead>
            <tbody>
              {stats.recentVisits.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center py-8 text-gray-500">
                    Aucune visite enregistrée
                  </td>
                </tr>
              ) : (
                stats.recentVisits.map((visit, idx) => (
                  <tr key={idx} className="border-t">
                    <td className="p-3">{new Date(visit.created_at).toLocaleString()}</td>
                    <td className="p-3">{visit.page_title || visit.page_url}</td>
                    <td className="p-3">{visit.country || 'Inconnu'}</td>
                    <td className="p-3">
                      {visit.device_type === 'desktop' ? '💻' : visit.device_type === 'mobile' ? '📱' : '📟'}
                      {' '}{visit.device_type || 'Inconnu'}
                    </td>
                    <td className="p-3">{visit.browser || 'Inconnu'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}