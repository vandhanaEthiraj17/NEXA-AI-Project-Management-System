import React from 'react';
import { motion } from 'framer-motion';

const GlassCard = ({ children, className = '', hoverGlow = false, glowColor = 'cyan', onClick, ...props }) => {
  const glowClass = hoverGlow 
    ? (glowColor === 'cyan' 
        ? 'hover:shadow-[0_0_20px_rgba(6,182,212,0.2)] hover:border-neon-cyan/40' 
        : glowColor === 'purple' 
          ? 'hover:shadow-[0_0_20px_rgba(168,85,247,0.2)] hover:border-neon-purple/40' 
          : 'hover:shadow-[0_0_20px_rgba(236,72,153,0.2)] hover:border-neon-magenta/40')
    : '';

  return (
    <motion.div
      onClick={onClick}
      className={`glass-panel rounded-xl p-5 border border-white/5 transition-all duration-300 ${glowClass} ${onClick ? 'cursor-pointer' : ''} ${className}`}
      {...props}
    >
      {children}
    </motion.div>
  );
};

export default GlassCard;
