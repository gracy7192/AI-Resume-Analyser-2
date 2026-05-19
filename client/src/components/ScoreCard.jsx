import React from 'react';
import { motion } from 'framer-motion';

const ScoreCard = ({ title, score, maxScore = 100, color = "primary", delay = 0 }) => {
  const percentage = (score / maxScore) * 100;
  
  const colors = {
    primary: "text-primary-400 stroke-primary-500",
    secondary: "text-secondary-400 stroke-secondary-500",
    purple: "text-purple-400 stroke-purple-500",
    green: "text-green-400 stroke-green-500",
    red: "text-red-400 stroke-red-500",
    yellow: "text-yellow-400 stroke-yellow-500"
  };

  const selectedColor = colors[color] || colors.primary;

  // SVG Circle properties
  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <motion.div 
      initial={{ opacity: 0, y: Z20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="glass-card p-6 flex flex-col items-center justify-center text-center"
    >
      <h4 className="text-slate-400 text-sm font-medium mb-4 uppercase tracking-wider">{title}</h4>
      
      <div className="relative w-24 h-24">
        {/* Background Circle */}
        <svg className="w-full h-full transform -rotate-90">
          <circle
            cx="48"
            cy="48"
            r={radius}
            fill="transparent"
            stroke="currentColor"
            strokeWidth="8"
            className="text-white/5"
          />
          {/* Progress Circle */}
          <motion.circle
            cx="48"
            cy="48"
            r={radius}
            fill="transparent"
            stroke="currentColor"
            strokeWidth="8"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1.5, ease: "easeOut", delay: delay + 0.2 }}
            className={selectedColor.split(' ')[1]}
            strokeLinecap="round"
          />
        </svg>
        
        {/* Score Text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`text-2xl font-bold ${selectedColor.split(' ')[0]}`}>{Math.round(score)}</span>
          <span className="text-[10px] text-slate-500">/{maxScore}</span>
        </div>
      </div>
    </motion.div>
  );
};

export default ScoreCard;
