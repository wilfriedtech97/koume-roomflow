import React, { useState, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { Download, Upload, RotateCcw, Loader2 } from 'lucide-react';
import GlassButton from '../ui-custom/GlassButton';

// All entity types managed by the database backup/restore tool
const ENTITIES = ['Site', 'Building', 'Room', 'Occupant', 'Reservation', 'HistoryEvent'];

export default function DatabaseManager() {
  // Loading state: tracks which operation is in progress ('export', 'import', 'restore')
  const [loading, setLoading] = useState('');

  // Status message shown after an operation completes
  const [status, setStatus] = useState('');

  // Ref to the hidden file input used for selecting backup files
  const fileRef = useRef(null);

  // Export all entity data as a JSON backup file and trigger browser download
  const exportDB = async () => {
    setLoading('export');
    setStatus('');

    const data = {};
    // Collect all records for each entity type
    for (const name of ENTITIES) {
      data[name] = await base44.entities[name].list();
    }

    // Create and trigger download of the JSON file
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

  // Handle both import (merge) and restore (replace all) operations from an uploaded JSON file
  const handleFile = async (mode) => {
    const file = fileRef.current?.files?.[0];
    if (!file) { setStatus('Please select a backup file.'); return; }

    setLoading(mode);
    setStatus('');

    const text = await file.text();
    const data = JSON.parse(text);

    // RESTORE mode: delete all existing records before importing
    if (mode === 'restore') {
      if (!confirm('RESTORE will DELETE all current data and replace it with the backup. Continue?')) {
        setLoading('');
        return;
      }
      for (const name of ENTITIES) {
        const existing = await base44.entities[name].list();
        for (const item of existing) {
          await base44.entities[name].delete(item.id);
        }
      }
    }

    // Insert records from the backup file, stripping system-generated fields
    for (const name of ENTITIES) {
      const records = data[name] || [];
      for (const record of records) {
        const { id, created_date, updated_date, created_by, ...clean } = record;

        // IMPORT mode: skip records that already exist (by ID match)
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
        {/* Export current database to a JSON file */}
        <GlassButton variant="secondary" onClick={exportDB} disabled={!!loading}>
          {loading === 'export' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
          Export Database
        </GlassButton>

        {/* File selector and import/restore actions */}
        <div className="space-y-3">
          <label className="text-sm text-slate-400">Select backup file (.json)</label>
          <input
            ref={fileRef}
            type="file"
            accept=".json"
            className="block w-full text-sm text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:bg-slate-800 file:text-slate-300 hover:file:bg-slate-700"
          />
          <div className="flex gap-3">
            {/* Import: merge backup into existing data, skipping duplicates */}
            <GlassButton variant="secondary" onClick={() => handleFile('import')} disabled={!!loading}>
              {loading === 'import' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
              Import (Merge)
            </GlassButton>
            {/* Restore: delete all current data and replace with backup */}
            <GlassButton variant="danger" onClick={() => handleFile('restore')} disabled={!!loading}>
              {loading === 'restore' ? <Loader2 className="w-4 h-4 animate-spin" /> : <RotateCcw className="w-4 h-4" />}
              Restore (Replace All)
            </GlassButton>
          </div>
        </div>

        {/* Operation feedback message */}
        {status && <p className="text-sm text-cyan-400 mt-2">{status}</p>}
      </div>
    </div>
  );
}