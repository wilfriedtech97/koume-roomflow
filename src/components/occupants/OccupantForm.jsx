import React, { useState } from 'react';
import GlassInput from '../ui-custom/GlassInput';
import GlassTextarea from '../ui-custom/GlassTextarea';
import GlassSelect from '../ui-custom/GlassSelect';
import GlassButton from '../ui-custom/GlassButton';

export default function OccupantForm({ occupant, rooms = [], buildings = [], sites = [], onSubmit, onCancel }) {
  const [form, setForm] = useState({
    full_name: occupant?.full_name || '',
    gender: occupant?.gender || 'male',
    phone: occupant?.phone || '',
    email: occupant?.email || '',
    id_number: occupant?.id_number || '',
    room_id: occupant?.room_id || '',
    check_in_date: occupant?.check_in_date || new Date().toISOString().split('T')[0],
    check_out_date: occupant?.check_out_date || '',
    notes: occupant?.notes || '',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const room = rooms.find(r => r.id === form.room_id);
    if (room && room.status !== 'available' && !occupant) {
      alert('This room is not available.');
      return;
    }
    if (room && room.current_occupants >= room.bed_count && !occupant) {
      alert('This room is at full capacity.');
      return;
    }
    onSubmit({
      ...form,
      room_number: room?.number || '',
      building_name: room?.building_name || '',
      site_name: room?.site_name || '',
      status: 'active',
    });
  };

  const availableRooms = rooms.filter(r => r.status === 'available' || (occupant && r.id === occupant.room_id));

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <GlassInput label="Full Name *" value={form.full_name} onChange={e => setForm({ ...form, full_name: e.target.value })} required placeholder="Full name" />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <GlassSelect label="Gender *" value={form.gender} onChange={e => setForm({ ...form, gender: e.target.value })} options={[
          { value: 'male', label: 'Male' },
          { value: 'female', label: 'Female' },
        ]} />
        <GlassInput label="Phone" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="Phone number" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <GlassInput label="Email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="Email" type="email" />
        <GlassInput label="ID/Passport" value={form.id_number} onChange={e => setForm({ ...form, id_number: e.target.value })} placeholder="ID number" />
      </div>
      <GlassSelect label="Room" value={form.room_id} onChange={e => setForm({ ...form, room_id: e.target.value })} options={[
        { value: '', label: 'Select room' },
        ...availableRooms.map(r => ({ value: r.id, label: `Room ${r.number} - ${r.building_name || '—'} (${r.bed_count - (r.current_occupants || 0)} beds free)` })),
      ]} />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <GlassInput label="Check-in Date" type="date" value={form.check_in_date} onChange={e => setForm({ ...form, check_in_date: e.target.value })} />
        <GlassInput label="Check-out Date" type="date" value={form.check_out_date} onChange={e => setForm({ ...form, check_out_date: e.target.value })} />
      </div>
      <GlassTextarea label="Notes" value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} placeholder="Additional notes..." />
      <div className="flex justify-end gap-3 pt-2">
        <GlassButton variant="secondary" type="button" onClick={onCancel}>Cancel</GlassButton>
        <GlassButton type="submit">{occupant ? 'Update' : 'Add Occupant'}</GlassButton>
      </div>
    </form>
  );
}