import { FiGithub, FiTwitter, FiLinkedin } from 'react-icons/fi';

const Footer = () => {
  return (
    <footer className="bg-dark-bg border-t border-white/5 pt-12 pb-8 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center">
          
          <div className="mb-6 md:mb-0">
            <div className="flex items-center space-x-2">
              <span className="font-bold text-xl text-white tracking-tight">
                AI ATS <span className="text-primary-400">Scorer</span>
              </span>
            </div>
            <p className="text-slate-400 text-sm mt-2 max-w-sm text-center md:text-left">
              Optimize your resume for applicant tracking systems using advanced AI analysis and TF-IDF semantic matching.
            </p>
          </div>

          <div className="flex space-x-6">
            <a href="#" className="text-slate-400 hover:text-primary-400 transition-colors">
              <span className="sr-only">Twitter</span>
              <FiTwitter size={20} />
            </a>
            <a href="#" className="text-slate-400 hover:text-primary-400 transition-colors">
              <span className="sr-only">GitHub</span>
              <FiGithub size={20} />
            </a>
            <a href="#" className="text-slate-400 hover:text-primary-400 transition-colors">
              <span className="sr-only">LinkedIn</span>
              <FiLinkedin size={20} />
            </a>
          </div>
        </div>
        
        <div className="border-t border-white/10 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-slate-500 text-sm text-center md:text-left">
            &copy; {new Date().getFullYear()} AI ATS Scorer. All rights reserved.
          </p>
          <div className="flex space-x-4 mt-4 md:mt-0 text-sm text-slate-500">
            <a href="#" className="hover:text-slate-300 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-slate-300 transition-colors">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
