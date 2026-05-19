import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiCpu, FiSearch, FiCheckCircle } from 'react-icons/fi';

const LoadingOverlay = ({ isVisible, message, progress }) => {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-dark-bg/90 backdrop-blur-lg px-4"
        >
          <div className="max-w-md w-full text-center">
            {/* Pulsing Icon */}
            <div className="relative w-24 h-24 mx-auto mb-8">
              <motion.div
                animate={{ 
                  scale: [1, 1.2, 1],
                  rotate: [0, 90, 180, 270, 360]
                }}
                transition={{ 
                  duration: 4, 
                  repeat: Infinity, 
                  ease: "linear" 
                }}
                className="absolute inset-0 rounded-3xl bg-gradient-to-tr from-primary-500 to-secondary-500 opacity-20 blur-xl"
              />
              <div className="relative flex items-center justify-center w-full h-full bg-dark-card border border-white/10 rounded-3xl shadow-2xl">
                <FiCpu className="text-4xl text-primary-400" />
              </div>
            </div>

            <h2 className="text-3xl font-bold text-white mb-3">AI Engine Processing</h2>
            <p className="text-slate-400 mb-10 h-6">{message}</p>

            {/* Progress Bar */}
            <div className="relative w-full h-2 bg-white/5 rounded-full overflow-hidden mb-4">
              <motion.div
                className="absolute top-0 left-0 h-full bg-gradient-to-r from-primary-500 to-secondary-500"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
            <div className="flex justify-between text-xs font-mono text-slate-500">
              <span>INITIALIZING</span>
              <span className="text-primary-400">{progress}%</span>
              <span>FINALIZING</span>
            </div>

            {/* Micro-steps */}
            <div className="mt-12 grid grid-cols-3 gap-4">
              {[
                { icon: FiSearch, label: "Parsing", active: progress >= 25 },
                { icon: FiCpu, label: "Matching", active: progress >= 50 },
                { icon: FiCheckCircle, label: "Scoring", active: progress >= 75 },
              ].map((step, idx) => (
                <div key={idx} className={`flex flex-col items-center space-y-2 ${step.active ? "opacity-100" : "opacity-20"}`}>
                  <step.icon className={`text-xl ${step.active ? "text-primary-400" : "text-slate-400"}`} />
                  <span className="text-[10px] uppercase tracking-widest text-slate-400">{step.label}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default LoadingOverlay;
