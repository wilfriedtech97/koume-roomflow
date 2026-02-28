import React, { useState } from 'react';
import GlassInput from '../ui-custom/GlassInput';
import GlassTextarea from '../ui-custom/GlassTextarea';
import GlassSelect from '../ui-custom/GlassSelect';
import GlassButton from '../ui-custom/GlassButton';

export default function BuildingForm({ building, sites = [], onSubmit, onCancel }) {
  const [form, setForm] = useState({
    name: building?.name || '',
    site_id: building?.site_id || '',
    floors: building?.floors || '',
    description: building?.description || '',
    status: building?.status || 'active',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const site = sites.find(s => s.id === form.site_id);
    onSubmit({
      ...form,
      site_name: site?.name || '',
      floors: Number(form.floors) || 0,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <GlassInput label="Building Name *" hint="Unique name to identify this building" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required placeholder="e.g. Block A" />
      <GlassSelect label="Site *" hint="Select the site this building belongs to" value={form.site_id} onChange={e => setForm({ ...form, site_id: e.target.value })} options={[
        { value: '', label: 'Select a site' },
        ...sites.map(s => ({ value: s.id, label: s.name })),
      ]} />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <GlassInput label="Floors" hint="Total number of floors" type="number" value={form.floors} onChange={e => setForm({ ...form, floors: e.target.value })} placeholder="e.g. 3" />
        <GlassSelect label="Status" hint="Current operational status" value={form.status} onChange={e => setForm({ ...form, status: e.target.value })} options={[
          { value: 'active', label: 'Active' },
          { value: 'inactive', label: 'Inactive' },
          { value: 'maintenance', label: 'Maintenance' },
        ]} />
      </div>
      <GlassTextarea label="Description" hint="Optional details about this building" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Brief description..." />
      <div className="flex justify-end gap-3 pt-2">
        <GlassButton variant="secondary" type="button" onClick={onCancel}>Cancel</GlassButton>
        <GlassButton type="submit">{building ? 'Update Building' : 'Create Building'}</GlassButton>
      </div>
    </form>
  );
}