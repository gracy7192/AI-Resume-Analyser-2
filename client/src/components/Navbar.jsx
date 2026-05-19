import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FiMenu, FiX, FiLogOut, FiUser, FiActivity, FiHome } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsOpen(false);
  };

  const closeMenu = () => setIsOpen(false);

  // Active link styling
  const getLinkClass = (path) => {
    return `flex items-center space-x-2 transition-colors duration-200 ${
      location.pathname === path 
        ? 'text-primary-400 font-medium' 
        : 'text-slate-300 hover:text-white'
    }`;
  };

  return (
    <nav className="fixed top-0 left-0 w-full z-50 bg-dark-bg/80 backdrop-blur-md border-b border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 flex-shrink-0" onClick={closeMenu}>
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center">
              <FiActivity className="text-white text-xl" />
            </div>
            <span className="font-bold text-xl tracking-tight text-white">
              AI ATS <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-secondary-400">Scorer</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex md:items-center md:space-x-8">
            <Link to="/" className={getLinkClass('/')}>
              <span>Home</span>
            </Link>
            
            {isAuthenticated ? (
              <>
                <Link to="/dashboard" className={getLinkClass('/dashboard')}>
                  <span>Dashboard</span>
                </Link>
                <Link to="/analyze" className={getLinkClass('/analyze')}>
                  <span>New Analysis</span>
                </Link>
                <Link to="/history" className={getLinkClass('/history')}>
                  <span>History</span>
                </Link>
                
                {/* User Dropdown / Profile area */}
                <div className="flex items-center pl-6 border-l border-white/10 space-x-4">
                  <div className="flex items-center space-x-2 text-sm text-slate-300 bg-white/5 px-3 py-1.5 rounded-full border border-white/10">
                    <FiUser className="text-primary-400" />
                    <span>{user?.name.split(' ')[0]}</span>
                  </div>
                  <button 
                    onClick={handleLogout}
                    className="text-slate-400 hover:text-red-400 transition-colors"
                    title="Logout"
                  >
                    <FiLogOut size={20} />
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-4 pl-6 border-l border-white/10">
                <Link to="/login" className="text-slate-300 hover:text-white transition-colors">
                  Login
                </Link>
                <Link to="/register" className="btn-primary py-1.5 px-4 text-sm">
                  Get Started
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-slate-300 hover:text-white p-2"
            >
              {isOpen ? <FiX size={24} /> : <FiMenu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isOpen && (
        <div className="md:hidden bg-dark-card border-b border-white/10">
          <div className="px-4 pt-2 pb-6 space-y-1">
            <Link to="/" className="block px-3 py-2 rounded-md text-base font-medium text-slate-300 hover:text-white hover:bg-white/5" onClick={closeMenu}>
              Home
            </Link>
            
            {isAuthenticated ? (
              <>
                <Link to="/dashboard" className="block px-3 py-2 rounded-md text-base font-medium text-slate-300 hover:text-white hover:bg-white/5" onClick={closeMenu}>
                  Dashboard
                </Link>
                <Link to="/analyze" className="block px-3 py-2 rounded-md text-base font-medium text-slate-300 hover:text-white hover:bg-white/5" onClick={closeMenu}>
                  New Analysis
                </Link>
                <Link to="/history" className="block px-3 py-2 rounded-md text-base font-medium text-slate-300 hover:text-white hover:bg-white/5" onClick={closeMenu}>
                  History
                </Link>
                <button 
                  onClick={handleLogout}
                  className="w-full text-left mt-4 block px-3 py-2 rounded-md text-base font-medium text-red-400 hover:text-red-300 hover:bg-red-500/10"
                >
                  Logout
                </button>
              </>
            ) : (
              <div className="mt-4 pt-4 border-t border-white/10 space-y-2">
                <Link to="/login" className="block px-3 py-2 rounded-md text-base font-medium text-slate-300 hover:text-white hover:bg-white/5" onClick={closeMenu}>
                  Login
                </Link>
                <Link to="/register" className="block px-3 py-2 rounded-md text-base font-medium bg-primary-600 text-white hover:bg-primary-500 text-center" onClick={closeMenu}>
                  Get Started
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
