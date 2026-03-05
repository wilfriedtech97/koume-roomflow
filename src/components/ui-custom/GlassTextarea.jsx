import React from 'react';

// Reusable styled textarea with optional label and hint text
export default function GlassTextarea({ label, hint, className, value, onChange, placeholder, rows, disabled }) {
  return (
    <div className="space-y-1">
      {/* Optional label displayed above the textarea */}
      {label && (
        <label className="text-xs font-semibold text-slate-300 uppercase tracking-wide">
          {label}
        </label>
      )}
      <textarea
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        rows={rows}
        disabled={disabled}
        className={`w-full px-3 py-2.5 rounded-md bg-black border border-slate-600 text-white text-sm placeholder-slate-500 min-h-[80px] resize-none focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/60 transition-colors ${className || ''}`}
      />
      {/* Optional hint text shown below the textarea */}
      {hint && <p className="text-xs text-slate-500 mt-0.5">{hint}</p>}
    </div>
  );
}