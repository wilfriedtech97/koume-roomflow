import React from 'react';

export default function GlassSelect({ label, hint, options = [], className, value, onChange, disabled }) {
  return (
    <div className="space-y-1">
      {label && (
        <label className="text-xs font-semibold text-slate-300 uppercase tracking-wide">
          {label}
        </label>
      )}
      <select
        value={value}
        onChange={onChange}
        disabled={disabled}
        className={`w-full px-3 py-2.5 rounded-md bg-black border border-slate-600 text-white text-sm appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/60 transition-colors ${className || ''}`}
      >
        {(options || []).map(opt => (
          <option key={opt.value} value={opt.value} className="bg-black text-white">
            {opt.label}
          </option>
        ))}
      </select>
      {hint && <p className="text-xs text-slate-500 mt-0.5">{hint}</p>}
    </div>
  );
}