import React, { useState } from 'react';
import { Download, FileText, Table } from 'lucide-react';
import GlassButton from './GlassButton';

export default function ExportButton({ data, filename = 'export', columns }) {
  const [open, setOpen] = useState(false);

  const exportCSV = () => {
    if (!data?.length) return;
    const headers = columns || Object.keys(data[0]);
    const csv = [
      headers.join(','),
      ...data.map(row => headers.map(h => {
        const val = row[h] ?? '';
        return typeof val === 'string' && val.includes(',') ? `"${val}"` : val;
      }).join(','))
    ].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    setOpen(false);
  };

  const exportJSON = () => {
    if (!data?.length) return;
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setOpen(false);
  };

  return (
    <div className="relative">
      <GlassButton variant="secondary" onClick={() => setOpen(!open)}>
        <Download className="w-4 h-4" /> Export
      </GlassButton>
      {open && (
        <div className="absolute right-0 top-full mt-2 glass-card p-2 min-w-[160px] z-30">
          <button onClick={exportCSV} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-300 hover:bg-slate-800/60 rounded-lg transition-colors">
            <Table className="w-4 h-4" /> CSV / Excel
          </button>
          <button onClick={exportJSON} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-300 hover:bg-slate-800/60 rounded-lg transition-colors">
            <FileText className="w-4 h-4" /> JSON
          </button>
        </div>
      )}
    </div>
  );
}