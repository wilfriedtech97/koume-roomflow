import React from 'react';

const statusStyles = {
  active: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  inactive: 'bg-slate-500/15 text-slate-400 border-slate-500/30',
  maintenance: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
  available: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  occupied: 'bg-rose-500/15 text-rose-400 border-rose-500/30',
  unavailable: 'bg-slate-500/15 text-slate-400 border-slate-500/30',
  pending: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
  confirmed: 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30',
  canceled: 'bg-rose-500/15 text-rose-400 border-rose-500/30',
  checked_out: 'bg-slate-500/15 text-slate-400 border-slate-500/30',
};

export default function StatusBadge({ status }) {
  const style = statusStyles[status] || statusStyles.inactive;
  return (
    <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium border ${style}`}>
      {(status || '').replace(/_/g, ' ')}
    </span>
  );
}