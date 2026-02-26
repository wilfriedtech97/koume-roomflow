import React, { useState, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { Download, Upload, RotateCcw, Loader2 } from 'lucide-react';
import GlassButton from '../ui-custom/GlassButton';

const ENTITIES = ['Site', 'Building', 'Room', 'Occupant', 'Reservation', 'HistoryEvent'];

export default function DatabaseManager() {
  const [loading, setLoading] = useState('');
  const [status, setStatus] = useState('');
  const fileRef = useRef(null);

  const exportDB = async () => {
    setLoading('export');
    setStatus('');
    const data = {};
    for (const name of ENTITIES) {
      data[name] = await base44.entities[name].list();
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `koume-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setLoading('');
    setStatus('Database exported successfully.');
  };

  const handleFile = async (mode) => {
    const file = fileRef.current?.files?.[0];
    if (!file) { setStatus('Please select a backup file.'); return; }
    setLoading(mode);
    setStatus('');
    const text = await file.text();
    const data = JSON.parse(text);

    if (mode === 'restore') {
      if (!confirm('RESTORE will DELETE all current data and replace it with the backup. Continue?')) {
        setLoading(''); return;
      }
      for (const name of ENTITIES) {
        const existing = await base44.entities[name].list();
        for (const item of existing) {
          await base44.entities[name].delete(item.id);
        }
      }
    }

    for (const name of ENTITIES) {
      const records = data[name] || [];
      for (const record of records) {
        const { id, created_date, updated_date, created_by, ...clean } = record;
        if (mode === 'import') {
          const existing = await base44.entities[name].list();
          const dup = existing.find(e => e.id === id);
          if (dup) continue;
        }
        await base44.entities[name].create(clean);
      }
    }

    setLoading('');
    setStatus(mode === 'import' ? 'Data imported (duplicates skipped).' : 'Database restored from backup.');
  };

  return (
    <div className="entity-card p-6">
      <h3 className="text-lg font-semibold text-white mb-4">Database Manager</h3>
      <div className="space-y-4">
        <GlassButton variant="secondary" onClick={exportDB} disabled={!!loading}>
          {loading === 'export' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />} Export Database
        </GlassButton>

        <div className="space-y-3">
          <label className="text-sm text-slate-400">Select backup file (.json)</label>
          <input ref={fileRef} type="file" accept=".json" className="block w-full text-sm text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:bg-slate-800 file:text-slate-300 hover:file:bg-slate-700" />
          <div className="flex gap-3">
            <GlassButton variant="secondary" onClick={() => handleFile('import')} disabled={!!loading}>
              {loading === 'import' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />} Import (Merge)
            </GlassButton>
            <GlassButton variant="danger" onClick={() => handleFile('restore')} disabled={!!loading}>
              {loading === 'restore' ? <Loader2 className="w-4 h-4 animate-spin" /> : <RotateCcw className="w-4 h-4" />} Restore (Replace All)
            </GlassButton>
          </div>
        </div>

        {status && <p className="text-sm text-cyan-400 mt-2">{status}</p>}
      </div>
    </div>
  );
}