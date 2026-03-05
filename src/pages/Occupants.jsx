import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Users, Plus, Pencil, LogOut, Search } from 'lucide-react';
import PageHeader from '../components/ui-custom/PageHeader';
import GlassButton from '../components/ui-custom/GlassButton';
import GlassModal from '../components/ui-custom/GlassModal';
import StatusBadge from '../components/ui-custom/StatusBadge';
import EmptyState from '../components/ui-custom/EmptyState';
import LoadingSpinner from '../components/ui-custom/LoadingSpinner';
import ExportButton from '../components/ui-custom/ExportButton';
import OccupantForm from '../components/occupants/OccupantForm';
import moment from 'moment';

export default function Occupants() {
  // Modal state for create/edit occupant dialog
  const [modal, setModal] = useState({ open: false, occupant: null });

  // Search query to filter occupants by name
  const [search, setSearch] = useState('');

  const qc = useQueryClient();

  // Fetch occupants, rooms, buildings, and sites from the database
  const { data: occupants = [], isLoading } = useQuery({
    queryKey: ['occupants'],
    queryFn: () => base44.entities.Occupant.list('-created_date'),
  });
  const { data: rooms = [] } = useQuery({ queryKey: ['rooms'], queryFn: () => base44.entities.Room.list() });
  const { data: buildings = [] } = useQuery({ queryKey: ['buildings'], queryFn: () => base44.entities.Building.list() });
  const { data: sites = [] } = useQuery({ queryKey: ['sites'], queryFn: () => base44.entities.Site.list() });

  // Mutation: create a new occupant or update an existing one
  // On creation, also updates the room's occupant count and status, and logs a check-in event
  const saveMut = useMutation({
    mutationFn: async (data) => {
      if (modal.occupant) {
        // Edit mode: update existing occupant record
        return base44.entities.Occupant.update(modal.occupant.id, data);
      }

      // Create mode: persist new occupant
      const occ = await base44.entities.Occupant.create(data);

      // Update the room's current occupant count and status
      if (data.room_id) {
        const room = rooms.find(r => r.id === data.room_id);
        if (room) {
          const newCount = (room.current_occupants || 0) + 1;
          await base44.entities.Room.update(room.id, {
            current_occupants: newCount,
            // Mark as occupied when count reaches bed capacity
            status: newCount >= (room.capacity || room.bed_count || 1) ? 'occupied' : 'available',
          });
        }
      }

      // Log check-in event in history for audit trail
      await base44.entities.HistoryEvent.create({
        event_type: 'check_in',
        entity_type: 'occupant',
        entity_name: data.full_name,
        description: `${data.full_name} checked into Room ${data.room_number || '—'}`,
        timestamp: new Date().toISOString(),
      });

      return occ;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['occupants'] });
      qc.invalidateQueries({ queryKey: ['rooms'] });
      setModal({ open: false, occupant: null });
    },
  });

  // Mutation: check out an occupant — marks them as checked_out, decrements room count, logs event
  const checkoutMut = useMutation({
    mutationFn: async (occ) => {
      // Mark occupant as checked out with today's date
      await base44.entities.Occupant.update(occ.id, {
        status: 'checked_out',
        check_out_date: new Date().toISOString().split('T')[0],
      });

      // Decrement the room's occupant count and update status
      if (occ.room_id) {
        const room = rooms.find(r => r.id === occ.room_id);
        if (room) {
          const newCount = Math.max(0, (room.current_occupants || 0) - 1);
          await base44.entities.Room.update(room.id, {
            current_occupants: newCount,
            status: newCount === 0 ? 'available' : 'occupied',
          });
        }
      }

      // Log check-out event in history
      await base44.entities.HistoryEvent.create({
        event_type: 'check_out',
        entity_type: 'occupant',
        entity_name: occ.full_name,
        description: `${occ.full_name} checked out from Room ${occ.room_number || '—'}`,
        timestamp: new Date().toISOString(),
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['occupants'] });
      qc.invalidateQueries({ queryKey: ['rooms'] });
    },
  });

  if (isLoading) return <LoadingSpinner />;

  // Filter occupants by name search query
  const filtered = occupants.filter(o =>
    !search || o.full_name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      {/* Page header with active count subtitle and export/add actions */}
      <PageHeader
        title="Occupants"
        subtitle={`${occupants.filter(o => o.status === 'active').length} active occupants`}
        action={
          <div className="flex gap-3">
            <ExportButton data={occupants} filename="occupants" />
            <GlassButton onClick={() => setModal({ open: true, occupant: null })}>
              <Plus className="w-4 h-4" /> Add Occupant
            </GlassButton>
          </div>
        }
      />

      {/* Search bar for filtering by name */}
      <div className="mb-6 max-w-sm">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            className="w-full pl-10 pr-4 py-2.5 glass-input text-sm"
            placeholder="Search occupants..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Occupant cards grid or empty state */}
      {filtered.length === 0 ? (
        <EmptyState icon={Users} title="No occupants" message="Add an occupant or adjust your search." />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(occ => (
            <div key={occ.id} className="entity-card p-5 group">
              {/* Card header: avatar initial, name, room info, status badge */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  {/* Gender-colored avatar with first letter of name */}
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold ${occ.gender === 'female' ? 'bg-rose-500/20 text-rose-400' : 'bg-cyan-500/20 text-cyan-400'}`}>
                    {(occ.full_name || 'O')[0].toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-semibold text-white text-sm">{occ.full_name}</h3>
                    <p className="text-[11px] text-slate-500">Room {occ.room_number || '—'} • {occ.building_name || '—'}</p>
                  </div>
                </div>
                <StatusBadge status={occ.status} />
              </div>

              {/* Occupant details: phone and stay dates */}
              <div className="text-xs text-slate-400 space-y-1 mb-3">
                {occ.phone && <p>📞 {occ.phone}</p>}
                <p>📅 {occ.check_in_date ? moment(occ.check_in_date).format('MMM D, YYYY') : '—'} → {occ.check_out_date ? moment(occ.check_out_date).format('MMM D, YYYY') : 'Ongoing'}</p>
              </div>

              {/* Action buttons: Edit and Check Out (only for active occupants) — visible on hover */}
              <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <GlassButton variant="ghost" className="text-xs" onClick={() => setModal({ open: true, occupant: occ })}>
                  <Pencil className="w-3 h-3" /> Edit
                </GlassButton>
                {occ.status === 'active' && (
                  <GlassButton
                    variant="ghost"
                    className="text-xs text-amber-400"
                    onClick={() => { if (confirm('Check out this occupant?')) checkoutMut.mutate(occ); }}
                  >
                    <LogOut className="w-3 h-3" /> Check Out
                  </GlassButton>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create / Edit occupant modal */}
      <GlassModal
        open={modal.open}
        onClose={() => setModal({ open: false, occupant: null })}
        title={modal.occupant ? 'Edit Occupant' : 'New Occupant'}
        maxWidth="max-w-xl"
      >
        <OccupantForm
          occupant={modal.occupant}
          rooms={rooms}
          buildings={buildings}
          sites={sites}
          onSubmit={d => saveMut.mutate(d)}
          onCancel={() => setModal({ open: false, occupant: null })}
        />
      </GlassModal>
    </div>
  );
}