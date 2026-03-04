import React from 'react';

export default function GlassInput({ label, hint, className = '', ...props }) {
  return (
    <div className="space-y-1">
      {label && (
        <label className="text-xs font-semibold text-slate-300 uppercase tracking-wide">
          {label}
        </label>
      )}
      <input
        className={`w-full px-3 py-2.5 rounded-md bg-black border border-slate-600 text-white text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/60 transition-colors ${className}`}
        {...props}
      />
      {hint && <p className="text-xs text-slate-500 mt-0.5">{hint}</p>}
    </div>
  );
}