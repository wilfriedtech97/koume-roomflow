import React, { useState } from 'react';
import GlassInput from '../ui-custom/GlassInput';
import GlassTextarea from '../ui-custom/GlassTextarea';
import GlassSelect from '../ui-custom/GlassSelect';
import GlassButton from '../ui-custom/GlassButton';

export default function SiteForm({ site, onSubmit, onCancel }) {
  const [form, setForm] = useState({
    name: site?.name || '',
    address: site?.address || '',
    city: site?.city || '',
    description: site?.description || '',
    status: site?.status || 'active',
    capacity: site?.capacity || '',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ ...form, capacity: Number(form.capacity) || 0 });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <GlassInput label="Site Name *" hint="Unique name to identify this site" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required placeholder="e.g. Main Campus" />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <GlassInput label="Address" hint="Full street address" value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} placeholder="123 Main Street" />
        <GlassInput label="City" hint="City where the site is located" value={form.city} onChange={e => setForm({ ...form, city: e.target.value })} placeholder="e.g. Abidjan" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <GlassSelect label="Status" hint="Current operational status" value={form.status} onChange={e => setForm({ ...form, status: e.target.value })} options={[
          { value: 'active', label: 'Active' },
          { value: 'inactive', label: 'Inactive' },
          { value: 'maintenance', label: 'Maintenance' },
        ]} />
        <GlassInput label="Capacity" hint="Maximum number of occupants" type="number" value={form.capacity} onChange={e => setForm({ ...form, capacity: e.target.value })} placeholder="e.g. 100" />
      </div>
      <GlassTextarea label="Description" hint="Optional details about this site" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Brief description..." />
      <div className="flex justify-end gap-3 pt-2">
        <GlassButton variant="secondary" type="button" onClick={onCancel}>Cancel</GlassButton>
        <GlassButton type="submit">{site ? 'Update Site' : 'Create Site'}</GlassButton>
      </div>
    </form>
  );
}