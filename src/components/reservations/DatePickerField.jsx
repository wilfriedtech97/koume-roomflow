import React, { useState, useRef, useEffect } from 'react';
import { Calendar as CalendarIcon, X } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import moment from 'moment';

// Reusable date picker field with a calendar popover
export default function DatePickerField({ label, hint, value, onChange, min, placeholder = 'Sélectionner une date', clearable = true }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div className="space-y-1 relative" ref={ref}>
      {label && <label className="text-xs font-semibold text-slate-300 uppercase tracking-wide">{label}</label>}
      {hint && <p className="text-xs text-slate-500">{hint}</p>}
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center gap-2 px-3 py-2.5 rounded-md bg-black border border-slate-600 text-sm hover:border-cyan-500/60 transition-colors focus:outline-none focus:ring-2 focus:ring-cyan-500/40"
      >
        <CalendarIcon className="w-4 h-4 text-cyan-400 shrink-0" />
        <span className={`flex-1 text-left ${value ? 'text-white' : 'text-slate-500'}`}>
          {value ? moment(value).format('DD MMM YYYY') : placeholder}
        </span>
        {clearable && value && (
          <span
            role="button"
            onClick={e => { e.stopPropagation(); onChange(''); setOpen(false); }}
            className="text-slate-500 hover:text-white"
          >
            <X className="w-3.5 h-3.5" />
          </span>
        )}
      </button>
      {open && (
        <div className="absolute z-[100] top-full mt-1 bg-[#0d1b2e] border border-slate-700 rounded-xl shadow-2xl">
          <Calendar
            mode="single"
            selected={value ? new Date(value + 'T00:00:00') : undefined}
            onSelect={d => { onChange(d ? moment(d).format('YYYY-MM-DD') : ''); setOpen(false); }}
            disabled={min ? { before: new Date(min + 'T00:00:00') } : undefined}
            className="text-white"
          />
        </div>
      )}
    </div>
  );
}