import React, { useState } from 'react';
import GlassInput from '../ui-custom/GlassInput';
import GlassTextarea from '../ui-custom/GlassTextarea';
import GlassSelect from '../ui-custom/GlassSelect';
import GlassButton from '../ui-custom/GlassButton';

export default function OccupantForm({ occupant, rooms = [], buildings = [], sites = [], onSubmit, onCancel }) {
  // Initialize form state from existing occupant (edit) or empty values (create)
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

  // Handle form submission: validate room availability, then call onSubmit with enriched data
  const handleSubmit = (e) => {
    e.preventDefault();
    const room = rooms.find(r => r.id === form.room_id);

    // Prevent adding to a room that is not available (only on creation, not editing)
    if (room && room.status !== 'available' && !occupant) {
      alert('This room is not available.');
      return;
    }

    // Prevent adding to a room that is at full capacity (only on creation)
    if (room && room.current_occupants >= (room.capacity || room.bed_count || 1) && !occupant) {
      alert('This room is at full capacity.');
      return;
    }

    // Submit with enriched room info for denormalization
    onSubmit({
      ...form,
      room_number: room?.number || '',
      building_name: room?.building_name || '',
      site_name: room?.site_name || '',
      status: 'active',
    });
  };

  // Only show available rooms, or the occupant's current room when editing
  const availableRooms = rooms.filter(r =>
    r.status === 'available' || (occupant && r.id === occupant.room_id)
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Full name — required */}
      <GlassInput
        label="Full Name *"
        hint="First and last name of the occupant"
        value={form.full_name}
        onChange={e => setForm({ ...form, full_name: e.target.value })}
        required
        placeholder="e.g. Jean Dupont"
      />

      {/* Gender and phone */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <GlassSelect
          label="Gender *"
          hint="Biological gender"
          value={form.gender}
          onChange={e => setForm({ ...form, gender: e.target.value })}
          options={[{ value: 'male', label: 'Male' }, { value: 'female', label: 'Female' }]}
        />
        <GlassInput
          label="Phone"
          hint="Mobile or landline number"
          value={form.phone}
          onChange={e => setForm({ ...form, phone: e.target.value })}
          placeholder="+225 07 00 00 00"
        />
      </div>

      {/* Email and ID number */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <GlassInput
          label="Email"
          hint="Contact email address"
          value={form.email}
          onChange={e => setForm({ ...form, email: e.target.value })}
          placeholder="example@email.com"
          type="email"
        />
        <GlassInput
          label="ID / Passport"
          hint="National ID or passport number"
          value={form.id_number}
          onChange={e => setForm({ ...form, id_number: e.target.value })}
          placeholder="e.g. CI12345678"
        />
      </div>

      {/* Room assignment — only available rooms shown */}
      <GlassSelect
        label="Room"
        hint="Only available rooms are shown"
        value={form.room_id}
        onChange={e => setForm({ ...form, room_id: e.target.value })}
        options={[
          { value: '', label: 'Select a room' },
          ...availableRooms.map(r => ({
            value: r.id,
            label: `Room ${r.number} — ${r.building_name || '—'} (${(r.capacity || 1) - (r.current_occupants || 0)} places libres)`,
          })),
        ]}
      />

      {/* Check-in and check-out dates */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <GlassInput
          label="Check-in Date"
          hint="Date of arrival"
          type="date"
          value={form.check_in_date}
          onChange={e => setForm({ ...form, check_in_date: e.target.value })}
        />
        <GlassInput
          label="Check-out Date"
          hint="Leave blank if unknown"
          type="date"
          value={form.check_out_date}
          onChange={e => setForm({ ...form, check_out_date: e.target.value })}
        />
      </div>

      {/* Optional notes */}
      <GlassTextarea
        label="Notes"
        hint="Any additional information about the occupant"
        value={form.notes}
        onChange={e => setForm({ ...form, notes: e.target.value })}
        placeholder="Additional notes..."
      />

      {/* Form action buttons */}
      <div className="flex justify-end gap-3 pt-2">
        <GlassButton variant="secondary" type="button" onClick={onCancel}>Cancel</GlassButton>
        <GlassButton type="submit">{occupant ? 'Update' : 'Add Occupant'}</GlassButton>
      </div>
    </form>
  );
}