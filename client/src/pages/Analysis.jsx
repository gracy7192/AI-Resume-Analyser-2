import { useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { io } from 'socket.io-client';
import { FiUploadCloud, FiFile, FiArrowLeft, FiSearch, FiTarget, FiActivity } from 'react-icons/fi';
import { uploadResume, runAnalysis } from '../services/analysisService';
import LoadingOverlay from '../components/LoadingOverlay';

const Analysis = () => {
  const [step, setStep] = useState(1);
  const [file, setFile] = useState(null);
  const [resumeId, setResumeId] = useState(null);
  const [jobTitle, setJobTitle] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [progressMsg, setProgressMsg] = useState('');
  const [progressPercent, setProgressPercent] = useState(0);

  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  // Handle file selection
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      if (selectedFile.type === 'application/pdf' || selectedFile.name.endsWith('.docx')) {
        setFile(selectedFile);
      } else {
        toast.error('Only PDF and DOCX files are supported');
      }
    }
  };

  // Upload Resume
  const handleUpload = async () => {
    if (!file) return;
    setIsUploading(true);
    try {
      const res = await uploadResume(file);
      setResumeId(res.data.id);
      toast.success('Resume parsed successfully');
      setStep(2);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to upload resume');
    } finally {
      setIsUploading(false);
    }
  };

  // Run Analysis
  const handleAnalyze = async () => {
    if (!resumeId || !jobDescription) {
      toast.error('Please complete all fields');
      return;
    }

    setIsAnalyzing(true);
    setProgressMsg('Initializing secure connection...');
    setProgressPercent(5);

    const token = localStorage.getItem('token');
    const socketUrl = import.meta.env.VITE_API_URL
  ? import.meta.env.VITE_API_URL.replace('/api', '')
  : 'http://localhost:5000';

const socket = io(socketUrl, { auth: { token } });

    socket.on('analysis:started', (data) => {
      setProgressMsg(data.message);
      setProgressPercent(20);
    });

    socket.on('analysis:progress', (data) => {
      setProgressMsg(data.step);
      setProgressPercent(data.progress);
    });

    socket.on('analysis:completed', (data) => {
      setProgressMsg('Analysis complete! Finalizing report...');
      setProgressPercent(100);
      toast.success(`Analysis complete! Score: ${data.atsScore}`);
      setTimeout(() => {
        socket.disconnect();
        navigate(`/analysis/${data.analysisId}`);
      }, 1500);
    });

    socket.on('analysis:error', (data) => {
      toast.error(data.message);
      setIsAnalyzing(false);
      socket.disconnect();
    });

    try {
      await runAnalysis({ resumeId, jobTitle, jobDescription });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Analysis request failed');
      setIsAnalyzing(false);
      socket.disconnect();
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <LoadingOverlay isVisible={isAnalyzing} message={progressMsg} progress={progressPercent} />

      <Link to="/dashboard" className="inline-flex items-center text-slate-500 hover:text-white mb-8 transition-colors group">
        <FiArrowLeft className="mr-2 transform group-hover:-translate-x-1 transition-transform" /> Back to Dashboard
      </Link>

      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4 tracking-tight">
          New <span className="text-gradient">ATS Analysis</span>
        </h1>
        <p className="text-slate-400 text-lg max-w-2xl mx-auto">
          Compare your resume against any job description to discover how to beat the automated filters.
        </p>
      </div>

      {/* Modern Stepper */}
      <div className="flex justify-center items-center mb-16 relative max-w-md mx-auto">
        <div className="absolute top-1/2 left-0 w-full h-0.5 bg-white/5 -translate-y-1/2 z-0"></div>
        <div className={`absolute top-1/2 left-0 h-0.5 bg-gradient-to-r from-primary-500 to-secondary-500 -translate-y-1/2 z-0 transition-all duration-500 ${step === 1 ? 'w-0' : 'w-full'}`}></div>
        
        <div className="relative z-10 flex justify-between w-full">
          <div className="flex flex-col items-center">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-lg transition-all duration-300 shadow-xl ${step >= 1 ? 'bg-primary-600 text-white shadow-primary-500/20' : 'bg-dark-card text-slate-500 border border-white/5'}`}>
              <FiFile />
            </div>
            <span className={`mt-3 text-xs font-bold uppercase tracking-widest ${step >= 1 ? 'text-primary-400' : 'text-slate-500'}`}>Resume</span>
          </div>
          
          <div className="flex flex-col items-center">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-lg transition-all duration-300 shadow-xl ${step >= 2 ? 'bg-secondary-600 text-white shadow-secondary-500/20' : 'bg-dark-card text-slate-500 border border-white/5'}`}>
              <FiSearch />
            </div>
            <span className={`mt-3 text-xs font-bold uppercase tracking-widest ${step >= 2 ? 'text-secondary-400' : 'text-slate-500'}`}>Analysis</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8">
        <AnimatePresence mode="wait">
          {step === 1 ? (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="glass-card p-8 md:p-12"
            >
              <div className="flex items-center mb-8">
                <div className="w-10 h-10 rounded-full bg-primary-500/10 flex items-center justify-center mr-4">
                  <FiUploadCloud className="text-primary-400 text-xl" />
                </div>
                <h2 className="text-2xl font-bold text-white">Upload your resume</h2>
              </div>

              <div
                onClick={() => !file && fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-3xl p-12 text-center transition-all duration-300 group cursor-pointer ${file
                  ? 'border-primary-500/50 bg-primary-500/5'
                  : 'border-white/10 hover:border-primary-500/30 hover:bg-white/[0.02]'
                  }`}
              >
                <input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".pdf,.docx" className="hidden" />

                {!file ? (
                  <div className="flex flex-col items-center">
                    <div className="w-20 h-20 bg-white/5 rounded-3xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                      <FiUploadCloud className="text-4xl text-slate-400 group-hover:text-primary-400 transition-colors" />
                    </div>
                    <p className="text-white text-xl font-bold mb-2">Select your resume file</p>
                    <p className="text-slate-500">Supports PDF and DOCX formats (Max 5MB)</p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center">
                    <div className="w-20 h-20 bg-primary-500/20 rounded-3xl flex items-center justify-center mb-6">
                      <FiFile className="text-4xl text-primary-400" />
                    </div>
                    <p className="text-white text-xl font-bold mb-1">{file.name}</p>
                    <p className="text-slate-400 mb-8">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                    
                    <div className="flex flex-col sm:flex-row gap-4 w-full max-w-sm">
                      <button onClick={(e) => { e.stopPropagation(); setFile(null); }} className="btn-secondary flex-1 py-3">Change File</button>
                      <button onClick={(e) => { e.stopPropagation(); handleUpload(); }} disabled={isUploading} className="btn-primary flex-1 py-3 shadow-lg shadow-primary-500/20">
                        {isUploading ? 'Processing...' : 'Next Step'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="glass-card p-8 md:p-12"
            >
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-full bg-secondary-500/10 flex items-center justify-center mr-4">
                    <FiTarget className="text-secondary-400 text-xl" />
                  </div>
                  <h2 className="text-2xl font-bold text-white">Target Job Details</h2>
                </div>
                <button onClick={() => setStep(1)} className="text-slate-500 hover:text-white transition-colors text-sm font-medium">
                  ← Back to Upload
                </button>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-slate-400 uppercase tracking-widest mb-3 ml-1">Job Title / Role</label>
                  <input
                    type="text"
                    value={jobTitle}
                    onChange={(e) => setJobTitle(e.target.value)}
                    placeholder="e.g. Senior Frontend Engineer"
                    className="input-field bg-white/5 border-white/10 focus:border-secondary-500/50 py-4"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-400 uppercase tracking-widest mb-3 ml-1">Job Description</label>
                  <textarea
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                    placeholder="Paste the full job description here to extract keywords and requirements..."
                    className="input-field bg-white/5 border-white/10 focus:border-secondary-500/50 min-h-[300px] py-4 resize-none"
                  ></textarea>
                  <div className="flex justify-between mt-2 px-1">
                    <span className={`text-xs ${jobDescription.length < 50 ? 'text-red-400' : 'text-slate-500'}`}>
                      {jobDescription.length < 50 ? `Minimum 50 characters required (${jobDescription.length}/50)` : `${jobDescription.length} characters`}
                    </span>
                    <span className="text-xs text-slate-500 italic">Pro tip: Include the 'About Us' and 'Requirements' sections.</span>
                  </div>
                </div>

                <button
                  onClick={handleAnalyze}
                  disabled={jobDescription.length < 50 || !jobTitle}
                  className="w-full py-5 bg-gradient-to-r from-primary-600 to-secondary-600 rounded-2xl text-white font-black text-xl shadow-2xl shadow-primary-500/10 hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-50 disabled:hover:scale-100 flex items-center justify-center"
                >
                  <FiActivity className="mr-3" /> Run AI Analysis
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Analysis;