import React from 'react';
import { Users, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import StatusBadge from '../ui-custom/StatusBadge';
import moment from 'moment';

export default function RecentOccupants({ occupants = [] }) {
  const recent = occupants.slice(0, 6);

  return (
    <div className="entity-card p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-white flex items-center gap-2">
          <Users className="w-4 h-4 text-cyan-400" /> Recent Occupants
        </h3>
        <Link to={createPageUrl('Occupants')} className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1">
          View all <ArrowRight className="w-3 h-3" />
        </Link>
      </div>
      {recent.length > 0 ? (
        <div className="space-y-3">
          {recent.map(occ => (
            <div key={occ.id} className="flex items-center justify-between py-2 border-b border-slate-800/50 last:border-0">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500/20 to-blue-500/20 flex items-center justify-center text-xs font-bold text-cyan-400">
                  {(occ.full_name || 'O')[0].toUpperCase()}
                </div>
                <div>
                  <p className="text-sm font-medium text-white">{occ.full_name}</p>
                  <p className="text-[11px] text-slate-500">Room {occ.room_number || '—'} • {occ.building_name || '—'}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-[10px] text-slate-500">{occ.check_in_date ? moment(occ.check_in_date).fromNow() : ''}</span>
                <StatusBadge status={occ.status} />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-slate-500 text-sm text-center py-6">No occupants yet</p>
      )}
    </div>
  );
}