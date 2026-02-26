import React, { useState } from 'react';
import GlassInput from '../ui-custom/GlassInput';
import GlassSelect from '../ui-custom/GlassSelect';
import GlassButton from '../ui-custom/GlassButton';

const facilities = [
  { key: 'hot_water', label: 'Hot Water' },
  { key: 'internal_shower', label: 'Internal Shower' },
  { key: 'bathroom', label: 'Bathroom' },
  { key: 'fan', label: 'Fan' },
  { key: 'lighting', label: 'Lighting' },
  { key: 'internet', label: 'Internet' },
];

export default function RoomForm({ room, sites = [], buildings = [], onSubmit, onCancel }) {
  const [form, setForm] = useState({
    number: room?.number || '',
    site_id: room?.site_id || '',
    building_id: room?.building_id || '',
    genre: room?.genre || 'standard',
    status: room?.status || 'available',
    bed_count: room?.bed_count || 1,
    hot_water: room?.hot_water || false,
    internal_shower: room?.internal_shower || false,
    bathroom: room?.bathroom || false,
    fan: room?.fan || false,
    lighting: room?.lighting || false,
    internet: room?.internet || false,
  });

  const filteredBuildings = form.site_id ? buildings.filter(b => b.site_id === form.site_id) : buildings;

  const handleSubmit = (e) => {
    e.preventDefault();
    const site = sites.find(s => s.id === form.site_id);
    const building = buildings.find(b => b.id === form.building_id);
    onSubmit({
      ...form,
      site_name: site?.name || '',
      building_name: building?.name || '',
      bed_count: Number(form.bed_count) || 1,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <GlassInput label="Room Number *" value={form.number} onChange={e => setForm({ ...form, number: e.target.value })} required placeholder="e.g. 101" />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <GlassSelect label="Site *" value={form.site_id} onChange={e => setForm({ ...form, site_id: e.target.value, building_id: '' })} options={[
          { value: '', label: 'Select site' },
          ...sites.map(s => ({ value: s.id, label: s.name })),
        ]} />
        <GlassSelect label="Building *" value={form.building_id} onChange={e => setForm({ ...form, building_id: e.target.value })} options={[
          { value: '', label: 'Select building' },
          ...filteredBuildings.map(b => ({ value: b.id, label: b.name })),
        ]} />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <GlassSelect label="Genre" value={form.genre} onChange={e => setForm({ ...form, genre: e.target.value })} options={[
          { value: 'standard', label: 'Standard' },
          { value: 'vip', label: 'VIP' },
          { value: 'couple', label: 'Couple' },
          { value: 'prayer', label: 'Prayer' },
          { value: 'family', label: 'Family' },
        ]} />
        <GlassSelect label="Status" value={form.status} onChange={e => setForm({ ...form, status: e.target.value })} options={[
          { value: 'available', label: 'Available' },
          { value: 'occupied', label: 'Occupied' },
          { value: 'unavailable', label: 'Unavailable' },
        ]} />
        <GlassInput label="Bed Count" type="number" min="1" value={form.bed_count} onChange={e => setForm({ ...form, bed_count: e.target.value })} />
      </div>
      <div>
        <label className="text-sm font-medium text-slate-300 mb-2 block">Facilities</label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {facilities.map(f => (
            <label key={f.key} className="flex items-center gap-2 text-sm text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={form[f.key]}
                onChange={e => setForm({ ...form, [f.key]: e.target.checked })}
                className="w-4 h-4 rounded bg-slate-800 border-slate-600 text-cyan-500 focus:ring-cyan-500/30"
              />
              {f.label}
            </label>
          ))}
        </div>
      </div>
      <div className="flex justify-end gap-3 pt-2">
        <GlassButton variant="secondary" type="button" onClick={onCancel}>Cancel</GlassButton>
        <GlassButton type="submit">{room ? 'Update Room' : 'Create Room'}</GlassButton>
      </div>
    </form>
  );
}