import React, { useState } from 'react';
import GlassButton from '../ui-custom/GlassButton';

const facilities = [
  { key: 'hot_water', label: 'Eau Chaude' },
  { key: 'internal_shower', label: 'Douche Interne' },
  { key: 'bathroom', label: 'Salle de Bain' },
  { key: 'fan', label: 'Ventilateur' },
  { key: 'lighting', label: 'Éclairage' },
  { key: 'internet', label: 'Internet' },
];

const inputClass = "w-full px-4 py-2.5 rounded-xl bg-white border border-slate-300 text-black text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400/50";
const labelClass = "text-sm font-semibold text-black mb-1.5 block";

export default function RoomForm({ room, sites = [], buildings = [], onSubmit, onCancel }) {
  const [form, setForm] = useState({
    number: room?.number || '',
    site_id: room?.site_id || '',
    building_id: room?.building_id || '',
    genre: room?.genre || 'standard',
    status: room?.status || 'available',
    capacity: room?.capacity || room?.bed_count || 1,
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
      capacity: Number(form.capacity) || 1,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className={labelClass}>Numéro de Chambre *</label>
        <input className={inputClass} value={form.number} onChange={e => setForm({ ...form, number: e.target.value })} required placeholder="ex: 101" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Site *</label>
          <select className={inputClass} value={form.site_id} onChange={e => setForm({ ...form, site_id: e.target.value, building_id: '' })}>
            <option value="">Sélectionner un site</option>
            {sites.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>
        <div>
          <label className={labelClass}>Bâtiment *</label>
          <select className={inputClass} value={form.building_id} onChange={e => setForm({ ...form, building_id: e.target.value })}>
            <option value="">Sélectionner un bâtiment</option>
            {filteredBuildings.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className={labelClass}>Type de Chambre</label>
          <select className={inputClass} value={form.genre} onChange={e => setForm({ ...form, genre: e.target.value })}>
            <option value="standard">CLASSIQUE</option>
            <option value="vip">VIP</option>
            <option value="couple">COUPLE</option>
            <option value="prayer">PRIÈRE</option>
            <option value="family">FAMILLE</option>
          </select>
        </div>
        <div>
          <label className={labelClass}>Statut</label>
          <select className={inputClass} value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
            <option value="available">Disponible</option>
            <option value="occupied">Occupée</option>
            <option value="unavailable">Indisponible</option>
          </select>
        </div>
        <div>
          <label className={labelClass}>Nombre de personnes</label>
          <input className={inputClass} type="number" min="1" value={form.capacity} onChange={e => setForm({ ...form, capacity: e.target.value })} />
        </div>
      </div>

      <div>
        <label className={labelClass}>Équipements</label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {facilities.map(f => (
            <label key={f.key} className="flex items-center gap-2 text-sm font-medium text-black cursor-pointer">
              <input
                type="checkbox"
                checked={form[f.key]}
                onChange={e => setForm({ ...form, [f.key]: e.target.checked })}
                className="w-4 h-4 rounded border-slate-400 text-cyan-500 focus:ring-cyan-500/30"
              />
              {f.label}
            </label>
          ))}
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <GlassButton variant="secondary" type="button" onClick={onCancel}>Annuler</GlassButton>
        <GlassButton type="submit">{room ? 'Mettre à jour' : 'Créer la Chambre'}</GlassButton>
      </div>
    </form>
  );
}