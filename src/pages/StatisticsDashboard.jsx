// frontend/src/pages/StatisticsDashboard.jsx
import React, { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
  Chart as ChartJS,
  ArcElement,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  PointElement,
  LineElement,
  Filler  // ← IMPORTANT : Ajouter Filler
} from 'chart.js';
import { Pie, Bar, Line, Doughnut } from 'react-chartjs-2';
import { motion } from "framer-motion";

// Enregistrer tous les composants nécessaires
ChartJS.register(
  ArcElement,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  PointElement,
  LineElement,
  Filler  // ← IMPORTANT : Enregistrer Filler
);

export default function StatisticsDashboard() {
  const { isAdmin, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  
  const [stats, setStats] = useState({
    pageViews: [],
    clicks: [],
    uniqueVisitors: 0,
    topPages: [],
    topCountries: [],
    devices: [],
    browsers: [],
    hourlyActivity: [],
    dailyActivity: []
  });
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState("7d");

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
  }, [isAdmin, dateRange]);

  const fetchStatistics = async () => {
    setLoading(true);
    
    try {
      const startDate = new Date();
      if (dateRange === "7d") startDate.setDate(startDate.getDate() - 7);
      else if (dateRange === "30d") startDate.setDate(startDate.getDate() - 30);
      else if (dateRange === "90d") startDate.setDate(startDate.getDate() - 90);
      
      const { data: pageViews } = await supabase
        .from("tracking_page_views")
        .select("*")
        .gte("created_at", startDate.toISOString())
        .order("created_at", { ascending: false });
      
      const { data: clicks } = await supabase
        .from("tracking_clicks")
        .select("*")
        .gte("created_at", startDate.toISOString());
      
      const uniqueSessions = [...new Set(pageViews?.map(pv => pv.session_id) || [])];
      
      const pageCount = {};
      pageViews?.forEach(pv => {
        pageCount[pv.page_url] = (pageCount[pv.page_url] || 0) + 1;
      });
      const topPages = Object.entries(pageCount)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10);
      
      const countryCount = {};
      pageViews?.forEach(pv => {
        if (pv.country) countryCount[pv.country] = (countryCount[pv.country] || 0) + 1;
      });
      const topCountries = Object.entries(countryCount).sort((a, b) => b[1] - a[1]);
      
      const deviceCount = {};
      pageViews?.forEach(pv => {
        deviceCount[pv.device_type] = (deviceCount[pv.device_type] || 0) + 1;
      });
      
      const browserCount = {};
      pageViews?.forEach(pv => {
        if (pv.browser) browserCount[pv.browser] = (browserCount[pv.browser] || 0) + 1;
      });
      
      const hourlyData = Array(24).fill(0);
      pageViews?.forEach(pv => {
        const hour = new Date(pv.created_at).getHours();
        hourlyData[hour]++;
      });
      
      const dailyData = {};
      pageViews?.forEach(pv => {
        const date = new Date(pv.created_at).toLocaleDateString();
        dailyData[date] = (dailyData[date] || 0) + 1;
      });
      const dailyActivity = Object.entries(dailyData).slice(-14);
      
      setStats({
        pageViews: pageViews || [],
        clicks: clicks || [],
        uniqueVisitors: uniqueSessions.length,
        topPages,
        topCountries,
        devices: Object.entries(deviceCount),
        browsers: Object.entries(browserCount),
        hourlyActivity: hourlyData,
        dailyActivity: dailyActivity
      });
      
    } catch (error) {
      console.error("Erreur chargement stats:", error);
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

  const deviceChartData = {
    labels: stats.devices.map(d => d[0] === 'desktop' ? '💻 Ordinateur' : d[0] === 'mobile' ? '📱 Mobile' : '📟 Tablette'),
    datasets: [{
      data: stats.devices.map(d => d[1]),
      backgroundColor: ['#3b82f6', '#10b981', '#f59e0b'],
    }]
  };

  const browserChartData = {
    labels: stats.browsers.slice(0, 5).map(b => b[0]),
    datasets: [{
      label: 'Utilisateurs',
      data: stats.browsers.slice(0, 5).map(b => b[1]),
      backgroundColor: '#3b82f6',
    }]
  };

  const hourlyChartData = {
    labels: Array.from({ length: 24 }, (_, i) => `${i}h`),
    datasets: [{
      label: 'Visites',
      data: stats.hourlyActivity,
      borderColor: '#3b82f6',
      backgroundColor: 'rgba(59, 130, 246, 0.1)',
      fill: true,
      tension: 0.4,
    }]
  };

  const dailyChartData = {
    labels: stats.dailyActivity.map(d => d[0]),
    datasets: [{
      label: 'Visites par jour',
      data: stats.dailyActivity.map(d => d[1]),
      borderColor: '#10b981',
      backgroundColor: 'rgba(16, 185, 129, 0.1)',
      fill: true,
      tension: 0.4,
    }]
  };

  const countryChartData = {
    labels: stats.topCountries.slice(0, 8).map(c => c[0]),
    datasets: [{
      data: stats.topCountries.slice(0, 8).map(c => c[1]),
      backgroundColor: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'],
    }]
  };

  return (
    <div className="max-w-7xl mx-auto p-6 mt-20">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-[#1a56db]">📊 Statistiques avancées</h1>
          <p className="text-gray-500 mt-1">Analyse des visites et comportements utilisateurs</p>
        </div>
        
        <select
          value={dateRange}
          onChange={(e) => setDateRange(e.target.value)}
          className="border rounded-lg px-4 py-2 bg-white"
        >
          <option value="7d">7 derniers jours</option>
          <option value="30d">30 derniers jours</option>
          <option value="90d">90 derniers jours</option>
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <motion.div whileHover={{ scale: 1.02 }} className="bg-white rounded-xl shadow-md p-6">
          <div className="text-4xl mb-2">👁️</div>
          <div className="text-2xl font-bold text-[#1a56db]">{stats.pageViews.length}</div>
          <div className="text-gray-500 text-sm">Pages vues</div>
        </motion.div>
        
        <motion.div whileHover={{ scale: 1.02 }} className="bg-white rounded-xl shadow-md p-6">
          <div className="text-4xl mb-2">🖱️</div>
          <div className="text-2xl font-bold text-[#1a56db]">{stats.clicks.length}</div>
          <div className="text-gray-500 text-sm">Clics totaux</div>
        </motion.div>
        
        <motion.div whileHover={{ scale: 1.02 }} className="bg-white rounded-xl shadow-md p-6">
          <div className="text-4xl mb-2">👥</div>
          <div className="text-2xl font-bold text-[#1a56db]">{stats.uniqueVisitors}</div>
          <div className="text-gray-500 text-sm">Visiteurs uniques</div>
        </motion.div>
        
        <motion.div whileHover={{ scale: 1.02 }} className="bg-white rounded-xl shadow-md p-6">
          <div className="text-4xl mb-2">📈</div>
          <div className="text-2xl font-bold text-[#1a56db]">
            {stats.pageViews.length > 0 ? ((stats.clicks.length / stats.pageViews.length) * 100).toFixed(1) : 0}%
          </div>
          <div className="text-gray-500 text-sm">Taux de clics</div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="font-semibold text-lg mb-4">Activité par heure</h3>
          <Line data={hourlyChartData} options={{ responsive: true, maintainAspectRatio: true }} />
        </div>
        
        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="font-semibold text-lg mb-4">Évolution quotidienne</h3>
          <Line data={dailyChartData} options={{ responsive: true, maintainAspectRatio: true }} />
        </div>
        
        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="font-semibold text-lg mb-4">🌍 Visiteurs par pays</h3>
          <div className="h-64">
            <Pie data={countryChartData} options={{ responsive: true, maintainAspectRatio: false }} />
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="font-semibold text-lg mb-4">📱 Appareils utilisés</h3>
          <div className="h-64">
            <Doughnut data={deviceChartData} options={{ responsive: true, maintainAspectRatio: false }} />
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="font-semibold text-lg mb-4">🌐 Navigateurs</h3>
          <Bar data={browserChartData} options={{ responsive: true, maintainAspectRatio: true }} />
        </div>
        
        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="font-semibold text-lg mb-4">📄 Pages les plus visitées</h3>
          <div className="space-y-2">
            {stats.topPages.map(([page, count], idx) => (
              <div key={idx} className="flex justify-between items-center">
                <span className="text-sm text-gray-600 truncate">{page || 'Accueil'}</span>
                <span className="text-sm font-semibold text-[#1a56db]">{count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

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
                <th className="p-3 text-left">Durée</th>
              </tr>
            </thead>
            <tbody>
              {stats.pageViews.slice(0, 20).map((view, idx) => (
                <tr key={idx} className="border-t">
                  <td className="p-3">{new Date(view.created_at).toLocaleString()}</td>
                  <td className="p-3">{view.page_title || view.page_url}</td>
                  <td className="p-3">{view.country}</td>
                  <td className="p-3">{view.device_type}</td>
                  <td className="p-3">{view.browser}</td>
                  <td className="p-3">{view.visit_duration}s</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}