import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Radar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
} from 'chart.js';
import { FiArrowLeft, FiInfo, FiFileText, FiTarget, FiZap, FiDownload } from 'react-icons/fi';
import { getAnalysis } from '../services/analysisService';
import ScoreCard from '../components/ScoreCard';
import SkillBadge from '../components/SkillBadge';

// Register ChartJS components
ChartJS.register(
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
);

const AnalysisDetail = () => {
  const { id } = useParams();
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalysisDetail = async () => {
      try {
        const response = await getAnalysis(id);
        setAnalysis(response.data.analysis);
      } catch (error) {
        console.error('Failed to fetch analysis details', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalysisDetail();
  }, [id]);

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

  if (!analysis) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <FiInfo className="text-4xl text-red-400" />
        </div>
        <h2 className="text-3xl font-bold text-white mb-4">Analysis Not Found</h2>
        <p className="text-slate-400 mb-8">The requested analysis report could not be retrieved.</p>
        <Link to="/dashboard" className="btn-primary px-8">Return to Dashboard</Link>
      </div>
    );
  }

  // Radar Chart Data (Score Breakdown)
  const radarData = {
    labels: ['Keywords', 'Semantic', 'Experience', 'Education'],
    datasets: [
      {
        label: 'Score',
        data: [
          analysis.keyword_score,
          analysis.semantic_score,
          analysis.experience_score,
          analysis.education_score
        ],
        backgroundColor: 'rgba(124, 58, 237, 0.2)',
        borderColor: 'rgba(124, 58, 237, 1)',
        borderWidth: 2,
        pointBackgroundColor: 'rgba(124, 58, 237, 1)',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: 'rgba(124, 58, 237, 1)'
      }
    ]
  };

  const radarOptions = {
    scales: {
      r: {
        angleLines: { color: 'rgba(255, 255, 255, 0.1)' },
        grid: { color: 'rgba(255, 255, 255, 0.1)' },
        pointLabels: { 
          color: 'rgba(255, 255, 255, 0.5)', 
          font: { size: 10, weight: 'bold' } 
        },
        ticks: { display: false, min: 0, max: 100, stepSize: 20 }
      }
    },
    plugins: {
      legend: { display: false }
    }
  };

  const getAtsScoreColor = (score) => {
    if (score >= 80) return "green";
    if (score >= 60) return "yellow";
    return "red";
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Breadcrumbs / Back Link */}
      <Link to="/dashboard" className="inline-flex items-center text-slate-400 hover:text-white mb-8 transition-colors group">
        <FiArrowLeft className="mr-2 transform group-hover:-translate-x-1 transition-transform" /> Back to Dashboard
      </Link>

      {/* Header Area */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end mb-12 gap-8">
        <div className="max-w-3xl">
          <div className="flex items-center gap-3 mb-4">
            <span className="px-3 py-1 bg-primary-500/10 text-primary-400 text-xs font-bold uppercase tracking-widest rounded-full border border-primary-500/20">
              Analysis Report
            </span>
            <span className="text-slate-500 text-sm">
              ID: #{analysis.id.toString().padStart(6, '0')}
            </span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white mb-4 tracking-tight leading-tight">
            {analysis.jobDescription?.title || 'Untitled Position'}
          </h1>
          <div className="flex flex-wrap items-center gap-6 text-slate-400">
            <div className="flex items-center">
              <FiFileText className="mr-2 text-primary-400" />
              <span className="text-slate-300 font-medium">{analysis.resume?.filename}</span>
            </div>
            <div className="flex items-center">
              <FiTarget className="mr-2 text-secondary-400" />
              <span>{new Date(analysis.created_at).toLocaleDateString(undefined, { dateStyle: 'long' })}</span>
            </div>
          </div>
        </div>
        
        <div className="flex gap-4 w-full lg:w-auto">
          <button className="btn-secondary flex-1 lg:flex-none flex items-center justify-center">
            <FiDownload className="mr-2" /> Export PDF
          </button>
          <Link to="/analyze" className="btn-primary flex-1 lg:flex-none flex items-center justify-center">
             Re-analyze
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Sidebar: Score Summary */}
        <div className="lg:col-span-4 space-y-8">
          
          {/* Main Score Card */}
          <div className="glass-card p-1 relative overflow-hidden">
            <div className={`absolute top-0 left-0 w-full h-1.5 bg-${getAtsScoreColor(analysis.ats_score)}-500`}></div>
            <div className="p-8 text-center">
              <h3 className="text-xl font-bold text-white mb-8">Overall Match</h3>
              <div className="relative inline-block">
                <ScoreCard 
                  title="" 
                  score={analysis.ats_score} 
                  color={getAtsScoreColor(analysis.ats_score)}
                />
              </div>
              <p className="mt-8 text-lg font-medium text-slate-200">
                {analysis.ats_score >= 80 ? '🎯 Perfect candidate match!' : 
                 analysis.ats_score >= 60 ? '✨ Strong match - focus on missing skills' : 
                 '⚠️ Significant gaps detected'}
              </p>
              <p className="mt-2 text-slate-500 text-sm px-4">
                This score reflects keywords, semantic context, experience length, and educational background.
              </p>
            </div>
          </div>

          {/* Breakdown Radar */}
          <div className="glass-card p-6">
            <h3 className="text-lg font-bold text-white mb-6 flex items-center">
              <FiZap className="mr-2 text-primary-400" /> Logic Breakdown
            </h3>
            <div className="w-full aspect-square">
              <Radar data={radarData} options={radarOptions} />
            </div>
            <div className="grid grid-cols-2 gap-4 mt-8">
              <div className="text-center p-3 bg-white/5 rounded-2xl border border-white/5">
                <p className="text-[10px] text-slate-500 uppercase font-bold mb-1">Keywords</p>
                <p className="text-lg font-black text-white">{analysis.keyword_score}%</p>
              </div>
              <div className="text-center p-3 bg-white/5 rounded-2xl border border-white/5">
                <p className="text-[10px] text-slate-500 uppercase font-bold mb-1">Semantic</p>
                <p className="text-lg font-black text-white">{analysis.semantic_score}%</p>
              </div>
            </div>
          </div>

        </div>

        {/* Main Content Area */}
        <div className="lg:col-span-8 space-y-8">
          
          {/* AI Suggestions */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card p-8 md:p-10 border-l-4 border-l-primary-500"
          >
            <h3 className="text-2xl font-bold text-white mb-8 flex items-center">
              <FiInfo className="mr-3 text-primary-400" /> Strategic Recommendations
            </h3>
            <div className="space-y-6">
              {analysis.suggestions.split('\n\n').map((paragraph, idx) => (
                <div key={idx} className="relative pl-6 before:absolute before:left-0 before:top-2 before:w-1.5 before:h-1.5 before:bg-primary-500 before:rounded-full">
                  <p className="text-slate-300 leading-relaxed text-lg whitespace-pre-wrap">
                    {paragraph.replace(/^[•\-\*]\s*/, '')}
                  </p>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Skills Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* Matched Skills */}
            <div className="glass-card p-8">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-xl font-bold text-green-400 flex items-center">
                  Matched Skills
                </h3>
                <span className="bg-green-500/20 text-green-400 text-xs font-bold px-3 py-1 rounded-lg border border-green-500/20">
                  {analysis.matched_skills.length}
                </span>
              </div>
              <div className="flex flex-wrap gap-3">
                {analysis.matched_skills.length > 0 ? (
                  analysis.matched_skills.map((skill, idx) => (
                    <SkillBadge key={idx} skill={skill} type="matched" delay={idx * 0.05} />
                  ))
                ) : (
                  <p className="text-slate-500 italic text-sm py-4">No direct skills matched.</p>
                )}
              </div>
            </div>

            {/* Missing Skills */}
            <div className="glass-card p-8">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-xl font-bold text-red-400 flex items-center">
                  Missing Skills
                </h3>
                <span className="bg-red-500/20 text-red-400 text-xs font-bold px-3 py-1 rounded-lg border border-red-500/20">
                  {analysis.missing_skills.length}
                </span>
              </div>
              <div className="flex flex-wrap gap-3">
                {analysis.missing_skills.length > 0 ? (
                  analysis.missing_skills.map((skill, idx) => (
                    <SkillBadge key={idx} skill={skill} type="missing" delay={idx * 0.05} />
                  ))
                ) : (
                  <p className="text-slate-500 italic text-sm py-4">Congratulations! No missing skills detected.</p>
                )}
              </div>
            </div>

          </div>

          {/* Detailed Content View (Optional) */}
          <div className="glass-card p-8 opacity-60 hover:opacity-100 transition-opacity">
            <h3 className="text-lg font-bold text-white mb-4">Job Description Context</h3>
            <div className="max-h-40 overflow-y-auto text-slate-400 text-sm leading-relaxed scrollbar-thin scrollbar-thumb-white/10">
              {analysis.jobDescription?.text}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default AnalysisDetail;

