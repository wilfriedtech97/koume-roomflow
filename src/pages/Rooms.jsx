import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { DoorOpen, Plus } from 'lucide-react';
import PageHeader from '../components/ui-custom/PageHeader';
import GlassButton from '../components/ui-custom/GlassButton';
import GlassModal from '../components/ui-custom/GlassModal';
import GlassSelect from '../components/ui-custom/GlassSelect';
import EmptyState from '../components/ui-custom/EmptyState';
import LoadingSpinner from '../components/ui-custom/LoadingSpinner';
import ExportButton from '../components/ui-custom/ExportButton';
import RoomForm from '../components/rooms/RoomForm';
import RoomCard from '../components/rooms/RoomCard';

export default function Rooms() {
  // Modal state: controls create/edit room modal visibility and which room is being edited
  const [modal, setModal] = useState({ open: false, room: null });

  // Filter state for site, building, status, and room genre
  const [filters, setFilters] = useState({ site: '', building: '', status: '', genre: '' });

  const qc = useQueryClient();

  // Fetch rooms, sites, and buildings from the database
  const { data: rooms = [], isLoading } = useQuery({ queryKey: ['rooms'], queryFn: () => base44.entities.Room.list() });
  const { data: sites = [] } = useQuery({ queryKey: ['sites'], queryFn: () => base44.entities.Site.list() });
  const { data: buildings = [] } = useQuery({ queryKey: ['buildings'], queryFn: () => base44.entities.Building.list() });

  // Mutation: create or update a room record
  const saveMut = useMutation({
    mutationFn: (data) => modal.room
      ? base44.entities.Room.update(modal.room.id, data)
      : base44.entities.Room.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['rooms'] });
      setModal({ open: false, room: null });
    },
  });

  // Mutation: delete a room by ID
  const deleteMut = useMutation({
    mutationFn: (id) => base44.entities.Room.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['rooms'] }),
  });

  if (isLoading) return <LoadingSpinner />;

  // Apply site, building, status, and genre filters to the room list
  const filteredRooms = rooms.filter(r => {
    if (filters.site && r.site_id !== filters.site) return false;
    if (filters.building && r.building_id !== filters.building) return false;
    if (filters.status && r.status !== filters.status) return false;
    if (filters.genre && r.genre !== filters.genre) return false;
    return true;
  });

  // When a site filter is active, only show buildings belonging to that site
  const filteredBuildings = filters.site
    ? buildings.filter(b => b.site_id === filters.site)
    : buildings;

  return (
    <div>
      {/* Page title and export/add action buttons */}
      <PageHeader
        title="Rooms"
        subtitle={`${rooms.length} rooms total`}
        action={
          <div className="flex gap-3">
            <ExportButton data={rooms} filename="rooms" />
            <GlassButton onClick={() => setModal({ open: true, room: null })}>
              <Plus className="w-4 h-4" /> Add Room
            </GlassButton>
          </div>
        }
      />

      {/* Filter dropdowns: site, building, status, genre */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {/* Resetting building filter when site changes */}
        <GlassSelect
          value={filters.site}
          onChange={e => setFilters({ ...filters, site: e.target.value, building: '' })}
          options={[{ value: '', label: 'All Sites' }, ...sites.map(s => ({ value: s.id, label: s.name }))]}
        />
        <GlassSelect
          value={filters.building}
          onChange={e => setFilters({ ...filters, building: e.target.value })}
          options={[{ value: '', label: 'All Buildings' }, ...filteredBuildings.map(b => ({ value: b.id, label: b.name }))]}
        />
        <GlassSelect
          value={filters.status}
          onChange={e => setFilters({ ...filters, status: e.target.value })}
          options={[
            { value: '', label: 'All Status' },
            { value: 'available', label: 'Available' },
            { value: 'occupied', label: 'Occupied' },
            { value: 'unavailable', label: 'Unavailable' },
          ]}
        />
        <GlassSelect
          value={filters.genre}
          onChange={e => setFilters({ ...filters, genre: e.target.value })}
          options={[
            { value: '', label: 'All Genres' },
            { value: 'standard', label: 'Standard' },
            { value: 'vip', label: 'VIP' },
            { value: 'couple', label: 'Couple' },
            { value: 'prayer', label: 'Prayer' },
            { value: 'family', label: 'Family' },
          ]}
        />
      </div>

      {/* Rooms grid or empty state */}
      {filteredRooms.length === 0 ? (
        <EmptyState icon={DoorOpen} title="No rooms" message="Create rooms or adjust your filters." />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredRooms.map(room => (
            <RoomCard
              key={room.id}
              room={room}
              onEdit={() => setModal({ open: true, room })}
              onDelete={() => { if (confirm('Delete this room?')) deleteMut.mutate(room.id); }}
            />
          ))}
        </div>
      )}

      {/* Create / Edit room modal */}
      <GlassModal
        open={modal.open}
        onClose={() => setModal({ open: false, room: null })}
        title={modal.room ? 'Edit Room' : 'New Room'}
        maxWidth="max-w-xl"
      >
        <RoomForm
          room={modal.room}
          sites={sites}
          buildings={buildings}
          onSubmit={d => saveMut.mutate(d)}
          onCancel={() => setModal({ open: false, room: null })}
        />
      </GlassModal>
    </div>
  );
}