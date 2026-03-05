import React from 'react';
import { motion } from 'framer-motion';

// Visual style variants for the button
const variants = {
  primary: 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white shadow-lg shadow-cyan-500/20',
  secondary: 'bg-slate-800/80 border border-slate-600/50 hover:bg-slate-700/80 text-slate-200',
  danger: 'bg-gradient-to-r from-rose-500 to-red-600 hover:from-rose-400 hover:to-red-500 text-white shadow-lg shadow-rose-500/20',
  success: 'bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 text-white shadow-lg shadow-emerald-500/20',
  ghost: 'hover:bg-slate-800/50 text-slate-300',
};

// Reusable animated button with Framer Motion hover/tap effects
// Supports multiple visual variants and forwards all native button props
export default function GlassButton({ children, variant = 'primary', className = '', disabled, onClick, type }) {
  return (
    <motion.button
      whileHover={disabled ? {} : { scale: 1.02 }}
      whileTap={disabled ? {} : { scale: 0.98 }}
      type={type || 'button'}
      disabled={disabled}
      onClick={onClick}
      className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed ${variants[variant] || variants.primary} ${className}`}
    >
      {children}
    </motion.button>
  );
}