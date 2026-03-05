import React from 'react';

// Standard page header with a title, optional subtitle, and optional action slot (e.g. buttons)
export default function PageHeader({ title, subtitle, action }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
      {/* Left: page title and subtitle */}
      <div>
        <h1 className="text-2xl font-bold text-white">{title}</h1>
        {subtitle && <p className="text-slate-400 mt-1 text-sm">{subtitle}</p>}
      </div>
      {/* Right: optional action area (buttons, dropdowns, etc.) */}
      {action && <div>{action}</div>}
    </div>
  );
}