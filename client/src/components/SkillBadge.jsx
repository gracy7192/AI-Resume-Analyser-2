import React from 'react';
import { motion } from 'framer-motion';
import { FiCheck, FiX } from 'react-icons/fi';

const SkillBadge = ({ skill, type = "matched", delay = 0 }) => {
  const isMatched = type === "matched";
  
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay }}
      className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium border ${
        isMatched 
          ? "bg-green-500/10 border-green-500/20 text-green-400" 
          : "bg-red-500/10 border-red-500/20 text-red-400"
      }`}
    >
      {isMatched ? (
        <FiCheck className="mr-1.5 flex-shrink-0" />
      ) : (
        <FiX className="mr-1.5 flex-shrink-0" />
      )}
      {skill}
    </motion.div>
  );
};

export default SkillBadge;
