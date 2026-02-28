import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Search, Users, DoorOpen, Building2, CalendarCheck, ChevronDown, ChevronUp, MapPin } from 'lucide-react';
import PageHeader from '../components/ui-custom/PageHeader';
import GlassSelect from '../components/ui-custom/GlassSelect';
import StatusBadge from '../components/ui-custom/StatusBadge';
import EmptyState from '../components/ui-custom/EmptyState';
import LoadingSpinner from '../components/ui-custom/LoadingSpinner';
import moment from 'moment';

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('all');
  const [expandedId, setExpandedId] = useState(null);

  const { data: occupants = [] } = useQuery({ queryKey: ['occupants'], queryFn: () => base44.entities.Occupant.list() });
  const { data: rooms = [] } = useQuery({ queryKey: ['rooms'], queryFn: () => base44.entities.Room.list() });
  const { data: buildings = [] } = useQuery({ queryKey: ['buildings'], queryFn: () => base44.entities.Building.list() });
  const { data: reservations = [] } = useQuery({ queryKey: ['reservations'], queryFn: () => base44.entities.Reservation.list() });
  const { data: sites = [] } = useQuery({ queryKey: ['sites'], queryFn: () => base44.entities.Site.list() });

  const q = query.toLowerCase().trim();

  const results = [];

  if (q && (category === 'all' || category === 'occupants')) {
    occupants.filter(o =>
      o.full_name?.toLowerCase().includes(q) || o.phone?.toLowerCase().includes(q) || o.email?.toLowerCase().includes(q) || o.id_number?.toLowerCase().includes(q) || o.room_number?.toLowerCase().includes(q)
    ).forEach(o => results.push({ type: 'occupant', id: `occ-${o.id}`, data: o }));
  }

  if (q && (category === 'all' || category === 'rooms')) {
    rooms.filter(r =>
      r.number?.toLowerCase().includes(q) || r.building_name?.toLowerCase().includes(q) || r.site_name?.toLowerCase().includes(q) || r.genre?.toLowerCase().includes(q)
    ).forEach(r => results.push({ type: 'room', id: `room-${r.id}`, data: r }));
  }

  if (q && (category === 'all' || category === 'buildings')) {
    buildings.filter(b =>
      b.name?.toLowerCase().includes(q) || b.site_name?.toLowerCase().includes(q) || b.description?.toLowerCase().includes(q)
    ).forEach(b => results.push({ type: 'building', id: `bld-${b.id}`, data: b }));
  }

  if (q && (category === 'all' || category === 'reservations')) {
    reservations.filter(r =>
      r.occupant_name?.toLowerCase().includes(q) || r.room_number?.toLowerCase().includes(q) || r.building_name?.toLowerCase().includes(q) || r.occupant_type?.toLowerCase().includes(q)
    ).forEach(r => results.push({ type: 'reservation', id: `res-${r.id}`, data: r }));
  }

  if (q && (category === 'all' || category === 'sites')) {
    sites.filter(s =>
      s.name?.toLowerCase().includes(q) || s.city?.toLowerCase().includes(q) || s.address?.toLowerCase().includes(q)
    ).forEach(s => results.push({ type: 'site', id: `site-${s.id}`, data: s }));
  }

  const typeIcons = { occupant: Users, room: DoorOpen, building: Building2, reservation: CalendarCheck, site: MapPin };
  const typeColors = { occupant: 'text-cyan-400', room: 'text-emerald-400', building: 'text-amber-400', reservation: 'text-violet-400', site: 'text-rose-400' };

  return (
    <div>
      <PageHeader title="Search" subtitle="Search across all data" />

      <div className="space-y-1 mb-6">
        <label className="text-xs font-semibold text-slate-300 uppercase tracking-wide">Recherche</label>
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              className="w-full pl-10 pr-4 py-2.5 rounded-md bg-black border border-slate-600 text-white text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/60 transition-colors"
              placeholder="Nom, numéro, mot-clé..."
              value={query}
              onChange={e => setQuery(e.target.value)}
              autoFocus
            />
          </div>
          <div className="w-44">
            <GlassSelect value={category} onChange={e => setCategory(e.target.value)} options={[
            { value: 'all', label: 'All Categories' },
            { value: 'occupants', label: 'Occupants' },
            { value: 'rooms', label: 'Rooms' },
            { value: 'buildings', label: 'Buildings' },
            { value: 'reservations', label: 'Reservations' },
            { value: 'sites', label: 'Sites' },
          ]} />
          </div>
        </div>
        <p className="text-xs text-slate-500">Tapez un nom, un numéro ou un mot-clé pour trouver des résultats</p>
      </div>

      {!q ? (
        <EmptyState icon={Search} title="Start searching" message="Type a name, number, or keyword to find results across all categories." />
      ) : results.length === 0 ? (
        <EmptyState icon={Search} title="No results" message={`No results found for "${query}"`} />
      ) : (
        <div className="space-y-2">
          <p className="text-xs text-slate-500 mb-4">{results.length} result{results.length !== 1 ? 's' : ''} found</p>
          {results.map(item => {
            const Icon = typeIcons[item.type];
            const expanded = expandedId === item.id;
            return (
              <div key={item.id} className="entity-card p-4 cursor-pointer" onClick={() => setExpandedId(expanded ? null : item.id)}>
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-lg bg-slate-800/60 flex items-center justify-center ${typeColors[item.type]}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-slate-400 capitalize">{item.type}</span>
                      {item.data.status && <StatusBadge status={item.data.status} />}
                    </div>
                    <p className="text-sm font-medium text-white truncate">
                      {item.type === 'occupant' && item.data.full_name}
                      {item.type === 'room' && `Room ${item.data.number}`}
                      {item.type === 'building' && item.data.name}
                      {item.type === 'reservation' && item.data.occupant_name}
                      {item.type === 'site' && item.data.name}
                    </p>
                  </div>
                  {expanded ? <ChevronUp className="w-4 h-4 text-slate-500" /> : <ChevronDown className="w-4 h-4 text-slate-500" />}
                </div>
                {expanded && (
                  <div className="mt-3 pt-3 border-t border-slate-800/50 grid grid-cols-2 gap-2 text-xs">
                    {item.type === 'occupant' && <>
                      <Detail label="Gender" value={item.data.gender} />
                      <Detail label="Phone" value={item.data.phone} />
                      <Detail label="Email" value={item.data.email} />
                      <Detail label="ID" value={item.data.id_number} />
                      <Detail label="Room" value={item.data.room_number} />
                      <Detail label="Building" value={item.data.building_name} />
                      <Detail label="Site" value={item.data.site_name} />
                      <Detail label="Check-in" value={item.data.check_in_date ? moment(item.data.check_in_date).format('MMM D, YYYY') : '—'} />
                      <Detail label="Check-out" value={item.data.check_out_date ? moment(item.data.check_out_date).format('MMM D, YYYY') : 'Ongoing'} />
                    </>}
                    {item.type === 'room' && <>
                      <Detail label="Building" value={item.data.building_name} />
                      <Detail label="Site" value={item.data.site_name} />
                      <Detail label="Genre" value={item.data.genre} />
                      <Detail label="Beds" value={item.data.bed_count} />
                      <Detail label="Occupants" value={`${item.data.current_occupants || 0}/${item.data.bed_count || 1}`} />
                      <Detail label="Facilities" value={['hot_water', 'internal_shower', 'bathroom', 'fan', 'lighting', 'internet'].filter(f => item.data[f]).join(', ') || 'None'} />
                    </>}
                    {item.type === 'building' && <>
                      <Detail label="Site" value={item.data.site_name} />
                      <Detail label="Floors" value={item.data.floors} />
                      <Detail label="Description" value={item.data.description} />
                    </>}
                    {item.type === 'reservation' && <>
                      <Detail label="Type" value={item.data.occupant_type} />
                      <Detail label="Room" value={item.data.room_number} />
                      <Detail label="Building" value={item.data.building_name} />
                      <Detail label="Check-in" value={item.data.check_in_date ? moment(item.data.check_in_date).format('MMM D, YYYY') : '—'} />
                      <Detail label="Check-out" value={item.data.check_out_date ? moment(item.data.check_out_date).format('MMM D, YYYY') : '—'} />
                      <Detail label="Married" value={item.data.is_married_couple ? 'Yes' : 'No'} />
                    </>}
                    {item.type === 'site' && <>
                      <Detail label="City" value={item.data.city} />
                      <Detail label="Address" value={item.data.address} />
                      <Detail label="Capacity" value={item.data.capacity} />
                      <Detail label="Description" value={item.data.description} />
                    </>}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function Detail({ label, value }) {
  return (
    <div>
      <span className="text-slate-500">{label}: </span>
      <span className="text-slate-300 capitalize">{value || '—'}</span>
    </div>
  );
}