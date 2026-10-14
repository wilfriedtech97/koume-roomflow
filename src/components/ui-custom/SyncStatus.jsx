import React, { useEffect, useState } from 'react';
import { CloudOff, RefreshCw, Cloud } from 'lucide-react';
import { onSyncStatus } from '@/lib/offlineSync';

export default function SyncStatus() {
  const [status, setStatus] = useState(null);
  useEffect(() => onSyncStatus(setStatus), []);
  if (!status) return null;
  const { online, pending, syncing } = status;
  if (online && pending === 0 && !syncing) return null;

  let icon = Cloud;
  let text = `${pending} change${pending === 1 ? '' : 's'} waiting to sync`;
  let cls = 'border-cyan-500/30 text-cyan-300';
  if (!online) {
    icon = CloudOff;
    text = pending > 0
      ? `Offline · ${pending} change${pending === 1 ? '' : 's'} saved locally`
      : 'Offline · showing saved data';
    cls = 'border-amber-500/30 text-amber-300';
  } else if (syncing) {
    icon = RefreshCw;
    text = `Syncing ${pending} change${pending === 1 ? '' : 's'}…`;
    cls = 'border-cyan-500/40 text-cyan-300';
  }
  const Icon = icon;
  return (
    <div className={`fixed bottom-4 right-4 z-50 flex items-center gap-2 px-3.5 py-2 rounded-full glass-card border text-xs font-medium ${cls}`}>
      <Icon className={`w-3.5 h-3.5 ${syncing ? 'animate-spin' : ''}`} />
      {text}
    </div>
  );
}