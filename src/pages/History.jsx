import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Clock, ChevronDown, ChevronUp, Filter } from 'lucide-react';
import PageHeader from '../components/ui-custom/PageHeader';
import GlassSelect from '../components/ui-custom/GlassSelect';
import StatusBadge from '../components/ui-custom/StatusBadge';
import EmptyState from '../components/ui-custom/EmptyState';
import LoadingSpinner from '../components/ui-custom/LoadingSpinner';
import ExportButton from '../components/ui-custom/ExportButton';
import moment from 'moment';

const eventColors = {
  check_in: 'from-emerald-500 to-green-500',
  check_out: 'from-amber-500 to-orange-500',
  reservation: 'from-cyan-500 to-blue-500',
  room_update: 'from-violet-500 to-purple-500',
  site_update: 'from-rose-500 to-pink-500',
  building_update: 'from-sky-500 to-indigo-500',
  cancellation: 'from-red-500 to-rose-600',
};

export default function History() {
  const [typeFilter, setTypeFilter] = useState('');
  const [expandedId, setExpandedId] = useState(null);

  const { data: events = [], isLoading } = useQuery({
    queryKey: ['history'],
    queryFn: () => base44.entities.HistoryEvent.list('-created_date', 200),
  });

  if (isLoading) return <LoadingSpinner />;

  const filtered = typeFilter ? events.filter(e => e.event_type === typeFilter) : events;

  return (
    <div>
      <PageHeader
        title="History"
        subtitle={`${events.length} events recorded`}
        action={<ExportButton data={events} filename="history" />}
      />

      <div className="mb-6 max-w-xs">
        <GlassSelect
          value={typeFilter}
          onChange={e => setTypeFilter(e.target.value)}
          options={[
            { value: '', label: 'All Events' },
            { value: 'check_in', label: 'Check In' },
            { value: 'check_out', label: 'Check Out' },
            { value: 'reservation', label: 'Reservation' },
            { value: 'room_update', label: 'Room Update' },
            { value: 'site_update', label: 'Site Update' },
            { value: 'building_update', label: 'Building Update' },
            { value: 'cancellation', label: 'Cancellation' },
          ]}
        />
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={Clock} title="No events" message="Events will appear as actions are performed." />
      ) : (
        <div className="space-y-3">
          {filtered.map(ev => (
            <div key={ev.id} className="entity-card p-4">
              <div className="flex items-center gap-4 cursor-pointer" onClick={() => setExpandedId(expandedId === ev.id ? null : ev.id)}>
                <div className={`w-2 h-10 rounded-full bg-gradient-to-b ${eventColors[ev.event_type] || 'from-slate-500 to-slate-600'}`} />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-xs font-medium text-slate-400 capitalize">{(ev.event_type || '').replace(/_/g, ' ')}</span>
                    <span className="text-[10px] text-slate-600">•</span>
                    <span className="text-[10px] text-slate-500">{ev.entity_type}</span>
                  </div>
                  <p className="text-sm text-white">{ev.description}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[11px] text-slate-500">{ev.timestamp ? moment(ev.timestamp).fromNow() : moment(ev.created_date).fromNow()}</span>
                  {ev.details ? (
                    expandedId === ev.id ? <ChevronUp className="w-4 h-4 text-slate-500" /> : <ChevronDown className="w-4 h-4 text-slate-500" />
                  ) : null}
                </div>
              </div>
              {expandedId === ev.id && ev.details && (
                <div className="mt-3 ml-6 pl-4 border-l border-slate-700/50 text-xs text-slate-400">
                  <pre className="whitespace-pre-wrap">{ev.details}</pre>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}