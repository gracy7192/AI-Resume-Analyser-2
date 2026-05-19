import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiCheckCircle, FiUploadCloud, FiCpu, FiBarChart2 } from 'react-icons/fi';

const Home = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 100 } }
  };

  return (
    <div className="relative">
      {/* Background blobs */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-primary-600/20 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob"></div>
      <div className="absolute top-40 right-10 w-72 h-72 bg-secondary-600/20 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000"></div>
      <div className="absolute -bottom-8 left-40 w-72 h-72 bg-purple-600/20 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-4000"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-32 relative z-10">
        <motion.div 
          className="text-center max-w-4xl mx-auto"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8">
            Beat the <span className="text-gradient">ATS algorithms</span><br/>
            and land your dream job
          </h1>
          <p className="text-xl text-slate-300 mb-12 max-w-2xl mx-auto leading-relaxed">
            Our AI-powered platform analyzes your resume against job descriptions using advanced TF-IDF semantic matching to uncover hidden skill gaps.
          </p>
          <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-6">
            <Link to="/register" className="btn-primary text-lg px-8 py-4 w-full sm:w-auto">
              Start Free Analysis
            </Link>
            <Link to="/login" className="btn-secondary text-lg px-8 py-4 w-full sm:w-auto">
              Sign In
            </Link>
          </div>
        </motion.div>

        {/* Features Section */}
        <motion.div 
          className="mt-32 grid md:grid-cols-3 gap-8"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          <motion.div variants={itemVariants} className="glass-card p-8">
            <div className="w-14 h-14 rounded-2xl bg-primary-500/10 flex items-center justify-center mb-6 border border-primary-500/20">
              <FiUploadCloud className="text-3xl text-primary-400" />
            </div>
            <h3 className="text-2xl font-bold mb-4 text-white">1. Upload Resume</h3>
            <p className="text-slate-400 leading-relaxed">
              Upload your PDF or Word document. Our secure parser extracts text while maintaining your privacy.
            </p>
          </motion.div>

          <motion.div variants={itemVariants} className="glass-card p-8">
            <div className="w-14 h-14 rounded-2xl bg-secondary-500/10 flex items-center justify-center mb-6 border border-secondary-500/20">
              <FiCpu className="text-3xl text-secondary-400" />
            </div>
            <h3 className="text-2xl font-bold mb-4 text-white">2. Paste Job Description</h3>
            <p className="text-slate-400 leading-relaxed">
              Paste the target job description. The AI engines use NLP to extract required skills and context.
            </p>
          </motion.div>

          <motion.div variants={itemVariants} className="glass-card p-8">
            <div className="w-14 h-14 rounded-2xl bg-purple-500/10 flex items-center justify-center mb-6 border border-purple-500/20">
              <FiBarChart2 className="text-3xl text-purple-400" />
            </div>
            <h3 className="text-2xl font-bold mb-4 text-white">3. Get Actionable Insights</h3>
            <p className="text-slate-400 leading-relaxed">
              Receive an overall match score, discover missing keywords, and get tailored improvement suggestions.
            </p>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default Home;
