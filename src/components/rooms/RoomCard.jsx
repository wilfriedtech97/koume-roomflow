import React from 'react';
import { DoorOpen, Bed, Droplets, ShowerHead, Bath, Wind, Lightbulb, Wifi, Pencil, Trash2 } from 'lucide-react';
import StatusBadge from '../ui-custom/StatusBadge';
import GlassButton from '../ui-custom/GlassButton';

const facilityIcons = [
  { key: 'hot_water', icon: Droplets, label: 'Hot Water' },
  { key: 'internal_shower', icon: ShowerHead, label: 'Shower' },
  { key: 'bathroom', icon: Bath, label: 'Bathroom' },
  { key: 'fan', icon: Wind, label: 'Fan' },
  { key: 'lighting', icon: Lightbulb, label: 'Lighting' },
  { key: 'internet', icon: Wifi, label: 'Internet' },
];

const genreColors = {
  standard: 'from-slate-500/20 to-slate-600/20',
  vip: 'from-amber-500/20 to-yellow-500/20',
  couple: 'from-rose-500/20 to-pink-500/20',
  prayer: 'from-emerald-500/20 to-green-500/20',
  family: 'from-blue-500/20 to-indigo-500/20',
};

export default function RoomCard({ room, onEdit, onDelete }) {
  const statusColor = room.status === 'available' ? 'border-emerald-500/30' : room.status === 'occupied' ? 'border-rose-500/30' : 'border-slate-500/30';

  return (
    <div className={`entity-card p-4 group border-l-2 ${statusColor}`}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2.5">
          <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${genreColors[room.genre] || genreColors.standard} flex items-center justify-center`}>
            <DoorOpen className="w-4 h-4 text-cyan-400" />
          </div>
          <div>
            <h4 className="font-semibold text-white text-sm">Room {room.number}</h4>
            <p className="text-[11px] text-slate-500 capitalize">{room.genre} • {room.building_name || '—'}</p>
          </div>
        </div>
        <StatusBadge status={room.status} />
      </div>
      <div className="flex items-center gap-2 mb-3 text-xs text-slate-400">
        <Bed className="w-3.5 h-3.5" /> {room.bed_count || 1} beds
        <span className="text-slate-600">|</span>
        <span>{room.current_occupants || 0}/{room.bed_count || 1} occupied</span>
      </div>
      <div className="flex flex-wrap gap-1.5 mb-3">
        {facilityIcons.map(f => room[f.key] ? (
          <span key={f.key} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-800/60 text-[10px] text-slate-400 border border-slate-700/50">
            <f.icon className="w-3 h-3" /> {f.label}
          </span>
        ) : null)}
      </div>
      <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <GlassButton variant="ghost" className="text-xs" onClick={onEdit}><Pencil className="w-3 h-3" /> Edit</GlassButton>
        <GlassButton variant="ghost" className="text-xs text-rose-400" onClick={onDelete}><Trash2 className="w-3 h-3" /> Delete</GlassButton>
      </div>
    </div>
  );
}