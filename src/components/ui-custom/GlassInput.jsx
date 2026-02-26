import React from 'react';

export default function GlassInput({ label, className = '', ...props }) {
  return (
    <div className="space-y-1.5">
      {label && <label className="text-sm font-medium text-slate-300">{label}</label>}
      <input
        className={`w-full px-4 py-2.5 glass-input text-sm ${className}`}
        {...props}
      />
    </div>
  );
}