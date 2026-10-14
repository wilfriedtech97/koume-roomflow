import React, { useState } from 'react';
import GlassButton from '../ui-custom/GlassButton';
import { useT } from '@/lib/i18n';

const facilities = [
  { key: 'hot_water', label: 'Hot water' },
  { key: 'internal_shower', label: 'Internal shower' },
  { key: 'bathroom', label: 'Bathroom' },
  { key: 'fan', label: 'Fan' },
  { key: 'lighting', label: 'Lighting' },
  { key: 'internet', label: 'Internet' },
];

const inputClass = "w-full px-3 py-2.5 rounded-md bg-black border border-slate-600 text-white text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/60 transition-colors";
const labelClass = "text-xs font-semibold text-slate-300 uppercase tracking-wide mb-0.5 block";

export default function RoomForm({ room, sites = [], buildings = [], onSubmit, onCancel }) {
  const t = useT();
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
        <label className={labelClass}>{t('Room Number *')}</label>
        <input className={inputClass} value={form.number} onChange={e => setForm({ ...form, number: e.target.value })} required placeholder={t('ex: 101')} />
        <p className="text-xs text-slate-500 mt-0.5">{t('Unique room identifier')}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>{t('Site *')}</label>
          <select className={inputClass} value={form.site_id} onChange={e => setForm({ ...form, site_id: e.target.value, building_id: '' })}>
            <option value="">{t('Select a site')}</option>
            {sites.map(s => <option key={s.id} value={s.id} className="bg-black text-white">{s.name}</option>)}
          </select>
          <p className="text-xs text-slate-500 mt-0.5">{t('Site where the room is located')}</p>
        </div>
        <div>
          <label className={labelClass}>{t('Building *')}</label>
          <select className={inputClass} value={form.building_id} onChange={e => setForm({ ...form, building_id: e.target.value })}>
            <option value="">{t('Select a building')}</option>
            {filteredBuildings.map(b => <option key={b.id} value={b.id} className="bg-black text-white">{b.name}</option>)}
          </select>
          <p className="text-xs text-slate-500 mt-0.5">{t('Building of the selected site')}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className={labelClass}>{t('Room Type')}</label>
          <select className={inputClass} value={form.genre} onChange={e => setForm({ ...form, genre: e.target.value })}>
            <option value="standard" className="bg-black text-white">{t('Classic')}</option>
            <option value="vip" className="bg-black text-white">{t('VIP')}</option>
            <option value="couple" className="bg-black text-white">{t('Couple')}</option>
            <option value="prayer" className="bg-black text-white">{t('Prayer')}</option>
            <option value="family" className="bg-black text-white">{t('Family')}</option>
          </select>
          <p className="text-xs text-slate-500 mt-0.5">{t('Room category')}</p>
        </div>
        <div>
          <label className={labelClass}>{t('Status')}</label>
          <select className={inputClass} value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
            <option value="available" className="bg-black text-white">{t('Available')}</option>
            <option value="occupied" className="bg-black text-white">{t('Occupied')}</option>
            <option value="unavailable" className="bg-black text-white">{t('Unavailable')}</option>
            <option value="construction" className="bg-black text-white">{t('🏗️ Construction')}</option>
          </select>
          <p className="text-xs text-slate-500 mt-0.5">{t('Current availability')}</p>
        </div>
        <div>
          <label className={labelClass}>{t('Number of people')}</label>
          <input className={inputClass} type="number" min="1" value={form.capacity} onChange={e => setForm({ ...form, capacity: e.target.value })} placeholder={t('ex: 2')} />
          <p className="text-xs text-slate-500 mt-0.5">{t('Maximum guest capacity')}</p>
        </div>
      </div>

      <div>
        <label className={labelClass}>{t('Facilities')}</label>
        <p className="text-xs text-slate-500 mb-2">{t('Check the facilities available in this room')}</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {facilities.map(f => (
            <label key={f.key} className="flex items-center gap-2 text-sm font-medium text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={form[f.key]}
                onChange={e => setForm({ ...form, [f.key]: e.target.checked })}
                className="w-4 h-4 rounded border-slate-400 text-cyan-500 focus:ring-cyan-500/30"
              />
              {t(f.label)}
            </label>
          ))}
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <GlassButton variant="secondary" type="button" onClick={onCancel}>{t('Cancel')}</GlassButton>
        <GlassButton type="submit">{room ? t('Update') : t('Create Room')}</GlassButton>
      </div>
    </form>
  );
}