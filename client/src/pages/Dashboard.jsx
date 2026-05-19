import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiFileText, FiActivity, FiClock, FiPlusCircle, FiBarChart2, FiArrowRight } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { getUserAnalyses } from '../services/analysisService';

const Dashboard = () => {
  const { user } = useAuth();
  const [analyses, setAnalyses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalyses = async () => {
      try {
        const response = await getUserAnalyses();
        setAnalyses(response.data.analyses || []);
      } catch (error) {
        console.error('Failed to fetch analyses', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalyses();
  }, []);

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-400 bg-green-400/10 border-green-400/20';
    if (score >= 60) return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20';
    return 'text-red-400 bg-red-400/10 border-red-400/20';
  };

  const recentAnalyses = analyses.slice(0, 5);
  const avgScore = analyses.length 
    ? Math.round(analyses.reduce((acc, curr) => acc + curr.ats_score, 0) / analyses.length) 
    : 0;

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-80px)] flex items-center justify-center">
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 border-4 border-primary-500/20 rounded-full"></div>
          <div className="absolute inset-0 border-4 border-t-primary-500 rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header section with profile overview */}
      <div className="relative mb-12 overflow-hidden rounded-3xl bg-gradient-to-r from-primary-600/20 to-secondary-600/20 border border-white/5 p-8 md:p-10">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-primary-500/10 rounded-full blur-3xl"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <motion.h1 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-3xl md:text-4xl font-bold text-white mb-3"
            >
              Welcome back, <span className="text-gradient">{user?.name.split(' ')[0]}</span>! 👋
            </motion.h1>
            <p className="text-slate-400 text-lg">
              You've analyzed <span className="text-white font-semibold">{analyses.length}</span> resumes so far. 
              Keep optimizing!
            </p>
          </div>
          <Link to="/analyze" className="btn-primary flex items-center shadow-lg shadow-primary-500/25 px-8 py-4">
            <FiPlusCircle className="mr-2 text-xl" /> New Analysis
          </Link>
        </div>
      </div>

      {/* Stats Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <motion.div 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="glass-card p-6 flex items-center group hover:border-primary-500/30 transition-all duration-300"
        >
          <div className="w-14 h-14 rounded-2xl bg-primary-500/10 flex items-center justify-center mr-5 border border-primary-500/20 group-hover:bg-primary-500/20 transition-colors">
            <FiActivity className="text-primary-400 text-2xl" />
          </div>
          <div>
            <p className="text-slate-400 text-sm font-medium mb-1">Total Analyses</p>
            <h3 className="text-3xl font-bold text-white tracking-tight">{analyses.length}</h3>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="glass-card p-6 flex items-center group hover:border-secondary-500/30 transition-all duration-300"
        >
          <div className="w-14 h-14 rounded-2xl bg-secondary-500/10 flex items-center justify-center mr-5 border border-secondary-500/20 group-hover:bg-secondary-500/20 transition-colors">
            <FiBarChart2 className="text-secondary-400 text-2xl" />
          </div>
          <div>
            <p className="text-slate-400 text-sm font-medium mb-1">Average Score</p>
            <div className="flex items-end">
              <h3 className="text-3xl font-bold text-white tracking-tight">{avgScore}</h3>
              <span className="text-slate-500 ml-1.5 mb-1.5 text-sm">/ 100</span>
            </div>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="glass-card p-6 flex items-center group hover:border-purple-500/30 transition-all duration-300"
        >
          <div className="w-14 h-14 rounded-2xl bg-purple-500/10 flex items-center justify-center mr-5 border border-purple-500/20 group-hover:bg-purple-500/20 transition-colors">
            <FiFileText className="text-purple-400 text-2xl" />
          </div>
          <div>
            <p className="text-slate-400 text-sm font-medium mb-1">Unique Resumes</p>
            <h3 className="text-3xl font-bold text-white tracking-tight">
              {new Set(analyses.map(a => a.resume_id)).size}
            </h3>
          </div>
        </motion.div>
      </div>

      {/* Recent Activity List */}
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-bold text-white">Recent Activity</h2>
        <Link to="/history" className="text-sm font-medium text-primary-400 hover:text-primary-300 transition-colors">
          View All History
        </Link>
      </div>
      
      {analyses.length === 0 ? (
        <motion.div 
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="glass-card p-16 text-center border-dashed border-white/10"
        >
          <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
            <FiClock className="text-4xl text-slate-500" />
          </div>
          <h3 className="text-2xl font-bold text-white mb-3">No analyses yet</h3>
          <p className="text-slate-400 mb-8 max-w-md mx-auto text-lg">
            Upload your first resume and compare it against a job description to see your ATS compatibility score.
          </p>
          <Link to="/analyze" className="btn-primary inline-flex items-center px-10">
            <FiPlusCircle className="mr-2" /> Start First Analysis
          </Link>
        </motion.div>
      ) : (
        <div className="space-y-4">
          {recentAnalyses.map((analysis, idx) => (
            <motion.div 
              key={analysis.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="glass-card p-5 md:p-6 hover:bg-white/[0.04] transition-all duration-300 group"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center flex-shrink-0 group-hover:bg-primary-500/10 transition-colors">
                    <FiFileText className="text-xl text-slate-400 group-hover:text-primary-400" />
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-white mb-1 group-hover:text-primary-300 transition-colors">
                      {analysis.jobDescription?.title || 'Untitled Position'}
                    </h4>
                    <div className="flex flex-wrap items-center text-sm text-slate-400 gap-y-1">
                      <span className="truncate max-w-[180px] text-slate-300 font-medium">{analysis.resume?.filename}</span>
                      <span className="mx-2 opacity-30">•</span>
                      <FiClock className="mr-1.5 opacity-60" />
                      <span>{new Date(analysis.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between md:justify-end gap-8 border-t md:border-t-0 border-white/5 pt-4 md:pt-0">
                  <div className="text-left md:text-right">
                    <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-1.5">ATS Score</p>
                    <div className={`inline-flex items-center justify-center px-4 py-1.5 rounded-full border text-lg font-black ${getScoreColor(analysis.ats_score)}`}>
                      {Math.round(analysis.ats_score)}<span className="text-[10px] opacity-60 ml-1">/ 100</span>
                    </div>
                  </div>
                  <Link 
                    to={`/analysis/${analysis.id}`} 
                    className="flex items-center text-white hover:text-primary-400 font-bold transition-colors group/link"
                  >
                    Details <FiArrowRight className="ml-2 transform group-hover/link:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Dashboard;

