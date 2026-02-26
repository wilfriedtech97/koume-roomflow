import React, { useRef, useState } from 'react';
import { motion } from 'framer-motion';

export default function StatCard3D({ title, value, subtitle, icon: Icon, gradient = 'from-cyan-500 to-blue-600', delay = 0 }) {
  const cardRef = useRef(null);
  const [transform, setTransform] = useState('');

  const handleMove = (e) => {
    const rect = cardRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setTransform(`perspective(600px) rotateY(${x * 12}deg) rotateX(${-y * 12}deg)`);
  };

  const handleLeave = () => setTransform('');

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      style={{ transform: transform || undefined, transition: transform ? 'none' : 'transform 0.5s ease' }}
      className="entity-card p-5 cursor-default group"
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">{title}</p>
          <p className="text-3xl font-bold text-white mt-2 mb-1">{value}</p>
          {subtitle && <p className="text-xs text-slate-500">{subtitle}</p>}
        </div>
        <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
          {Icon && <Icon className="w-5 h-5 text-white" />}
        </div>
      </div>
      <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity shimmer pointer-events-none" />
    </motion.div>
  );
}