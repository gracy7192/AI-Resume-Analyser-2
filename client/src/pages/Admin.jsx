import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiUsers, FiFileText, FiActivity, FiAward } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { getAdminStats } from '../services/analysisService';

const Admin = () => {
  const { user, isAdmin, loading: authLoading } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      if (!isAdmin) return;
      try {
        const response = await getAdminStats();
        setStats(response.data);
      } catch (error) {
        console.error('Failed to fetch admin stats', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [isAdmin]);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  // Redirect if not admin
  if (!isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-white mb-2">Admin Dashboard</h1>
        <p className="text-slate-400">Platform-wide analytics and statistics.</p>
      </div>

      {/* Top Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6 flex items-center">
          <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center mr-4">
            <FiUsers className="text-blue-400 text-xl" />
          </div>
          <div>
            <p className="text-slate-400 text-sm font-medium mb-1">Total Users</p>
            <h3 className="text-3xl font-bold text-white">{stats?.totalUsers || 0}</h3>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card p-6 flex items-center">
          <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center mr-4">
            <FiFileText className="text-purple-400 text-xl" />
          </div>
          <div>
            <p className="text-slate-400 text-sm font-medium mb-1">Total Resumes</p>
            <h3 className="text-3xl font-bold text-white">{stats?.totalResumes || 0}</h3>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-card p-6 flex items-center">
          <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center mr-4">
            <FiActivity className="text-green-400 text-xl" />
          </div>
          <div>
            <p className="text-slate-400 text-sm font-medium mb-1">Total Analyses</p>
            <h3 className="text-3xl font-bold text-white">{stats?.totalAnalyses || 0}</h3>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="glass-card p-6 flex items-center">
          <div className="w-12 h-12 rounded-full bg-yellow-500/20 flex items-center justify-center mr-4">
            <FiAward className="text-yellow-400 text-xl" />
          </div>
          <div>
            <p className="text-slate-400 text-sm font-medium mb-1">Average Score</p>
            <h3 className="text-3xl font-bold text-white">{stats?.averageScore || 0}</h3>
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Most Common Skills */}
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }} className="glass-card p-6">
          <h3 className="text-xl font-bold text-white mb-6">Most Common Skills Across Platform</h3>
          <div className="space-y-4">
            {stats?.topSkills?.map((item, idx) => (
              <div key={idx} className="flex items-center">
                <span className="w-6 text-slate-500 font-mono">{idx + 1}.</span>
                <span className="flex-grow text-white">{item.skill}</span>
                <span className="text-primary-400 font-medium">{item.count} hits</span>
                
                {/* Visual bar */}
                <div className="w-1/3 ml-4 h-2 bg-dark-bg rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-primary-500 rounded-full" 
                    style={{ width: `${(item.count / (stats.topSkills[0]?.count || 1)) * 100}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Score Distribution */}
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 }} className="glass-card p-6">
          <h3 className="text-xl font-bold text-white mb-6">Score Distribution</h3>
          
          <div className="space-y-6">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-green-400 font-medium">Excellent (75-100)</span>
                <span className="text-slate-400">{stats?.scoreDistribution?.excellent || 0} analyses</span>
              </div>
              <div className="w-full h-3 bg-dark-bg rounded-full overflow-hidden">
                <div className="h-full bg-green-500 rounded-full" style={{ width: `${((stats?.scoreDistribution?.excellent || 0) / (stats?.totalAnalyses || 1)) * 100}%` }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-yellow-400 font-medium">Good (50-74)</span>
                <span className="text-slate-400">{stats?.scoreDistribution?.good || 0} analyses</span>
              </div>
              <div className="w-full h-3 bg-dark-bg rounded-full overflow-hidden">
                <div className="h-full bg-yellow-500 rounded-full" style={{ width: `${((stats?.scoreDistribution?.good || 0) / (stats?.totalAnalyses || 1)) * 100}%` }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-orange-400 font-medium">Moderate (25-49)</span>
                <span className="text-slate-400">{stats?.scoreDistribution?.moderate || 0} analyses</span>
              </div>
              <div className="w-full h-3 bg-dark-bg rounded-full overflow-hidden">
                <div className="h-full bg-orange-500 rounded-full" style={{ width: `${((stats?.scoreDistribution?.moderate || 0) / (stats?.totalAnalyses || 1)) * 100}%` }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-red-400 font-medium">Low (0-24)</span>
                <span className="text-slate-400">{stats?.scoreDistribution?.low || 0} analyses</span>
              </div>
              <div className="w-full h-3 bg-dark-bg rounded-full overflow-hidden">
                <div className="h-full bg-red-500 rounded-full" style={{ width: `${((stats?.scoreDistribution?.low || 0) / (stats?.totalAnalyses || 1)) * 100}%` }}></div>
              </div>
            </div>
          </div>
        </motion.div>

      </div>
    </div>
  );
};

export default Admin;
