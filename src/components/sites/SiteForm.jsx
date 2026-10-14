import React, { useState } from 'react';
import GlassInput from '../ui-custom/GlassInput';
import GlassTextarea from '../ui-custom/GlassTextarea';
import GlassSelect from '../ui-custom/GlassSelect';
import GlassButton from '../ui-custom/GlassButton';
import { useT } from '@/lib/i18n';

export default function SiteForm({ site, onSubmit, onCancel }) {
  const t = useT();
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
      <GlassInput label={t('Site Name *')} hint={t('Unique name to identify this site')} value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required placeholder={t('e.g. Main Campus')} />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <GlassInput label={t('Address')} hint={t('Full street address')} value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} placeholder={t('123 Main Street')} />
        <GlassInput label={t('City')} hint={t('City where the site is located')} value={form.city} onChange={e => setForm({ ...form, city: e.target.value })} placeholder={t('e.g. Abidjan')} />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <GlassSelect label={t('Status')} hint={t('Current operational status')} value={form.status} onChange={e => setForm({ ...form, status: e.target.value })} options={[
          { value: 'active', label: t('Active') },
          { value: 'inactive', label: t('Inactive') },
          { value: 'maintenance', label: t('Maintenance') },
        ]} />
        <GlassInput label={t('Capacity')} hint={t('Maximum number of occupants')} type="number" value={form.capacity} onChange={e => setForm({ ...form, capacity: e.target.value })} placeholder={t('e.g. 100')} />
      </div>
      <GlassTextarea label={t('Description')} hint={t('Optional details about this site')} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder={t('Brief description...')} />
      <div className="flex justify-end gap-3 pt-2">
        <GlassButton variant="secondary" type="button" onClick={onCancel}>{t('Cancel')}</GlassButton>
        <GlassButton type="submit">{site ? t('Update Site') : t('Create Site')}</GlassButton>
      </div>
    </form>
  );
}