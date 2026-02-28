import React from 'react';
import { DoorOpen, Users, Droplets, ShowerHead, Bath, Wind, Lightbulb, Wifi, Pencil, Trash2, MapPin, Building2 } from 'lucide-react';
import StatusBadge from '../ui-custom/StatusBadge';
import GlassButton from '../ui-custom/GlassButton';

const facilityIcons = [
  { key: 'hot_water', icon: Droplets, label: 'Eau chaude' },
  { key: 'internal_shower', icon: ShowerHead, label: 'Douche' },
  { key: 'bathroom', icon: Bath, label: 'Salle de bain' },
  { key: 'fan', icon: Wind, label: 'Ventilateur' },
  { key: 'lighting', icon: Lightbulb, label: 'Éclairage' },
  { key: 'internet', icon: Wifi, label: 'Internet' },
];

const genreColors = {
  standard: { bg: 'from-slate-500/20 to-slate-600/20', badge: 'bg-slate-700/60 text-slate-300' },
  vip:      { bg: 'from-amber-500/20 to-yellow-500/20', badge: 'bg-amber-900/40 text-amber-300' },
  couple:   { bg: 'from-rose-500/20 to-pink-500/20', badge: 'bg-rose-900/40 text-rose-300' },
  prayer:   { bg: 'from-emerald-500/20 to-green-500/20', badge: 'bg-emerald-900/40 text-emerald-300' },
  family:   { bg: 'from-blue-500/20 to-indigo-500/20', badge: 'bg-blue-900/40 text-blue-300' },
};

const GENRE_LABELS = {
  standard: 'Classique', vip: 'VIP', couple: 'Couple', prayer: 'Prière', family: 'Family',
};

export default function RoomCard({ room, onEdit, onDelete }) {
  const gc = genreColors[room.genre] || genreColors.standard;
  const statusBorderColor = room.status === 'available' ? 'border-emerald-500/40' : room.status === 'occupied' ? 'border-rose-500/40' : 'border-slate-500/30';
  const capacity = room.capacity || room.bed_count || 1;
  const occupied = room.current_occupants || 0;
  const free = Math.max(0, capacity - occupied);
  const activeFacilities = facilityIcons.filter(f => room[f.key]);

  return (
    <div className={`entity-card p-4 border-l-2 ${statusBorderColor} flex flex-col gap-3`}>
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2.5">
          <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${gc.bg} flex items-center justify-center shrink-0`}>
            <DoorOpen className="w-5 h-5 text-cyan-400" />
          </div>
          <div>
            <h4 className="font-bold text-white text-base leading-tight">Chambre {room.number}</h4>
            <span className={`inline-block mt-0.5 text-[10px] font-medium px-2 py-0.5 rounded-full ${gc.badge}`}>
              {GENRE_LABELS[room.genre] || room.genre}
            </span>
          </div>
        </div>
        <StatusBadge status={room.status} />
      </div>

      {/* Location */}
      <div className="space-y-1">
        {room.building_name && (
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Building2 className="w-3.5 h-3.5 text-slate-500 shrink-0" />
            <span>{room.building_name}</span>
          </div>
        )}
        {room.site_name && (
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
            <span>{room.site_name}</span>
          </div>
        )}
      </div>

      {/* Capacity bar */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <Users className="w-3.5 h-3.5" />
            <span>Capacité : <span className="text-white font-semibold">{capacity}</span> pers.</span>
          </div>
          <span className={`text-xs font-medium ${free > 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
            {free} libre{free !== 1 ? 's' : ''}
          </span>
        </div>
        <div className="w-full h-1.5 rounded-full bg-slate-700/60 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${occupied >= capacity ? 'bg-rose-500' : occupied > 0 ? 'bg-amber-500' : 'bg-emerald-500'}`}
            style={{ width: capacity > 0 ? `${(occupied / capacity) * 100}%` : '0%' }}
          />
        </div>
      </div>

      {/* Facilities */}
      {activeFacilities.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {activeFacilities.map(f => (
            <span key={f.key} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-800/70 text-[10px] text-cyan-400/80 border border-slate-700/40">
              <f.icon className="w-3 h-3" /> {f.label}
            </span>
          ))}
        </div>
      )}

      {/* Actions — always visible */}
      <div className="flex gap-2 pt-1 border-t border-slate-700/40">
        <GlassButton variant="ghost" className="text-xs flex-1 justify-center" onClick={onEdit}>
          <Pencil className="w-3 h-3" /> Modifier
        </GlassButton>
        <GlassButton variant="ghost" className="text-xs flex-1 justify-center text-rose-400 hover:bg-rose-500/10" onClick={onDelete}>
          <Trash2 className="w-3 h-3" /> Supprimer
        </GlassButton>
      </div>
    </div>
  );
}