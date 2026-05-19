import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiClock, FiSearch, FiFileText } from 'react-icons/fi';
import { getUserAnalyses } from '../services/analysisService';

const History = () => {
  const [analyses, setAnalyses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchAnalyses = async () => {
      try {
        const response = await getUserAnalyses();
        setAnalyses(response.data.analyses);
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

  const filteredAnalyses = analyses.filter(a => 
    a.jobDescription?.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.resume?.filename.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-80px)] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Analysis History</h1>
          <p className="text-slate-400">Review all your past resume analyses.</p>
        </div>
        
        <div className="relative w-full md:w-72">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FiSearch className="text-slate-500" />
          </div>
          <input
            type="text"
            className="input-field pl-10"
            placeholder="Search by job title or file..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {analyses.length === 0 ? (
        <div className="glass-card p-16 text-center border-dashed border-white/20 mt-10">
          <FiClock className="mx-auto text-5xl text-slate-500 mb-4" />
          <h3 className="text-2xl font-medium text-white mb-3">No history found</h3>
          <p className="text-slate-400 mb-8 max-w-md mx-auto">
            You haven't run any resume analyses yet. Run your first analysis to start tracking your ATS scores!
          </p>
          <Link to="/analyze" className="btn-primary text-lg px-8 py-3">
            Start Analysis
          </Link>
        </div>
      ) : (
        <div className="glass-card overflow-hidden">
          {filteredAnalyses.length === 0 ? (
            <div className="p-8 text-center text-slate-400">
              No results found for "{searchTerm}"
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-dark-bg/50 text-slate-300 border-b border-white/10 uppercase text-xs tracking-wider">
                  <tr>
                    <th className="px-6 py-4 font-medium">Job Title</th>
                    <th className="px-6 py-4 font-medium">Resume File</th>
                    <th className="px-6 py-4 font-medium">Date</th>
                    <th className="px-6 py-4 font-medium text-center">Score</th>
                    <th className="px-6 py-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredAnalyses.map((analysis) => (
                    <tr key={analysis.id} className="hover:bg-white/5 transition-colors">
                      <td className="px-6 py-4 font-medium text-white">
                        {analysis.jobDescription?.title || 'Untitled Position'}
                      </td>
                      <td className="px-6 py-4 text-slate-400 flex items-center max-w-[250px]">
                        <FiFileText className="mr-2 flex-shrink-0" />
                        <span className="truncate">{analysis.resume?.filename}</span>
                      </td>
                      <td className="px-6 py-4 text-slate-400 whitespace-nowrap">
                        {new Date(analysis.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className={`inline-flex items-center justify-center px-3 py-1 rounded-full border font-bold text-xs ${getScoreColor(analysis.ats_score)}`}>
                          {analysis.ats_score}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right whitespace-nowrap">
                        <Link to={`/analysis/${analysis.id}`} className="text-primary-400 hover:text-primary-300 font-medium hover:underline underline-offset-4 transition-all">
                          View Report →
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default History;
