import React, { useState } from 'react';
import GlassInput from '../ui-custom/GlassInput';
import GlassSelect from '../ui-custom/GlassSelect';
import GlassTextarea from '../ui-custom/GlassTextarea';
import GlassButton from '../ui-custom/GlassButton';

export default function ReservationForm({ reservation, rooms = [], allReservations = [], onSubmit, onCancel }) {
  const [form, setForm] = useState({
    occupant_name: reservation?.occupant_name || '',
    occupant_type: reservation?.occupant_type || 'man',
    room_id: reservation?.room_id || '',
    check_in_date: reservation?.check_in_date || '',
    check_out_date: reservation?.check_out_date || '',
    status: reservation?.status || 'pending',
    is_married_couple: reservation?.is_married_couple || false,
    notes: reservation?.notes || '',
  });
  const [error, setError] = useState('');

  const validate = () => {
    // Check same room conflict (overlapping dates)
    const overlapping = allReservations.filter(r => {
      if (reservation && r.id === reservation.id) return false;
      if (r.room_id !== form.room_id || r.status === 'canceled') return false;
      return form.check_in_date < r.check_out_date && form.check_out_date > r.check_in_date;
    });
    if (overlapping.length > 0) {
      return 'This room already has an overlapping reservation for these dates.';
    }
    // Max 2 reservations per name
    const sameNameCount = allReservations.filter(r => {
      if (reservation && r.id === reservation.id) return false;
      return r.occupant_name?.toLowerCase() === form.occupant_name?.toLowerCase() && r.status !== 'canceled';
    }).length;
    if (sameNameCount >= 2) {
      return 'This person already has 2 active reservations. Maximum is 2.';
    }
    // Gender mixing rule
    if ((form.occupant_type === 'man' || form.occupant_type === 'woman') && !form.is_married_couple) {
      const roomReservations = allReservations.filter(r => {
        if (reservation && r.id === reservation.id) return false;
        return r.room_id === form.room_id && r.status !== 'canceled' && form.check_in_date < r.check_out_date && form.check_out_date > r.check_in_date;
      });
      const hasOpposite = roomReservations.some(r => {
        if (form.occupant_type === 'man' && r.occupant_type === 'woman') return true;
        if (form.occupant_type === 'woman' && r.occupant_type === 'man') return true;
        return false;
      });
      if (hasOpposite) {
        return 'Mixed gender in the same room is only allowed for married couples.';
      }
    }
    return '';
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const err = validate();
    if (err) { setError(err); return; }
    setError('');
    const room = rooms.find(r => r.id === form.room_id);
    onSubmit({
      ...form,
      room_number: room?.number || '',
      building_name: room?.building_name || '',
      site_name: room?.site_name || '',
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400 text-sm">{error}</div>}
      <GlassInput label="Occupant Name *" value={form.occupant_name} onChange={e => setForm({ ...form, occupant_name: e.target.value })} required placeholder="Full name" />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <GlassSelect label="Type *" value={form.occupant_type} onChange={e => setForm({ ...form, occupant_type: e.target.value })} options={[
          { value: 'man', label: 'Man' }, { value: 'woman', label: 'Woman' }, { value: 'couple', label: 'Couple' }, { value: 'family', label: 'Family' },
        ]} />
        <GlassSelect label="Room *" value={form.room_id} onChange={e => setForm({ ...form, room_id: e.target.value })} options={[
          { value: '', label: 'Select room' },
          ...rooms.map(r => ({ value: r.id, label: `Room ${r.number} - ${r.building_name || '—'}` })),
        ]} />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <GlassInput label="Check-in Date *" type="date" value={form.check_in_date} onChange={e => setForm({ ...form, check_in_date: e.target.value })} required />
        <GlassInput label="Check-out Date *" type="date" value={form.check_out_date} onChange={e => setForm({ ...form, check_out_date: e.target.value })} required />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <GlassSelect label="Status" value={form.status} onChange={e => setForm({ ...form, status: e.target.value })} options={[
          { value: 'pending', label: 'Pending' }, { value: 'confirmed', label: 'Confirmed' }, { value: 'canceled', label: 'Canceled' },
        ]} />
        <label className="flex items-center gap-2 text-sm text-slate-300 pt-7 cursor-pointer">
          <input type="checkbox" checked={form.is_married_couple} onChange={e => setForm({ ...form, is_married_couple: e.target.checked })} className="w-4 h-4 rounded bg-slate-800 border-slate-600 text-cyan-500" />
          Married Couple
        </label>
      </div>
      <GlassTextarea label="Notes" value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} placeholder="Notes..." />
      <div className="flex justify-end gap-3 pt-2">
        <GlassButton variant="secondary" type="button" onClick={onCancel}>Cancel</GlassButton>
        <GlassButton type="submit">{reservation ? 'Update' : 'Create Reservation'}</GlassButton>
      </div>
    </form>
  );
}