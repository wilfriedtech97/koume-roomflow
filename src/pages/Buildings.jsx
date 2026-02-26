import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Building2, Plus, Pencil, Trash2, DoorOpen, Layers } from 'lucide-react';
import PageHeader from '../components/ui-custom/PageHeader';
import GlassButton from '../components/ui-custom/GlassButton';
import GlassModal from '../components/ui-custom/GlassModal';
import GlassSelect from '../components/ui-custom/GlassSelect';
import StatusBadge from '../components/ui-custom/StatusBadge';
import EmptyState from '../components/ui-custom/EmptyState';
import LoadingSpinner from '../components/ui-custom/LoadingSpinner';
import ExportButton from '../components/ui-custom/ExportButton';
import BuildingForm from '../components/buildings/BuildingForm';

export default function Buildings() {
  const [modal, setModal] = useState({ open: false, building: null });
  const [siteFilter, setSiteFilter] = useState('');
  const qc = useQueryClient();

  const { data: buildings = [], isLoading } = useQuery({ queryKey: ['buildings'], queryFn: () => base44.entities.Building.list() });
  const { data: sites = [] } = useQuery({ queryKey: ['sites'], queryFn: () => base44.entities.Site.list() });
  const { data: rooms = [] } = useQuery({ queryKey: ['rooms'], queryFn: () => base44.entities.Room.list() });

  const saveMut = useMutation({
    mutationFn: (data) => modal.building
      ? base44.entities.Building.update(modal.building.id, data)
      : base44.entities.Building.create(data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['buildings'] }); setModal({ open: false, building: null }); },
  });

  const deleteMut = useMutation({
    mutationFn: (id) => base44.entities.Building.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['buildings'] }),
  });

  if (isLoading) return <LoadingSpinner />;

  const filtered = siteFilter ? buildings.filter(b => b.site_id === siteFilter) : buildings;

  return (
    <div>
      <PageHeader
        title="Buildings"
        subtitle={`${buildings.length} buildings`}
        action={
          <div className="flex gap-3">
            <ExportButton data={buildings} filename="buildings" />
            <GlassButton onClick={() => setModal({ open: true, building: null })}><Plus className="w-4 h-4" /> Add Building</GlassButton>
          </div>
        }
      />

      <div className="mb-6 max-w-xs">
        <GlassSelect
          value={siteFilter}
          onChange={e => setSiteFilter(e.target.value)}
          options={[{ value: '', label: 'All Sites' }, ...sites.map(s => ({ value: s.id, label: s.name }))]}
        />
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={Building2} title="No buildings" message="Add a building to get started." />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(b => {
            const rCount = rooms.filter(r => r.building_id === b.id).length;
            return (
              <div key={b.id} className="entity-card p-5 group">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 flex items-center justify-center">
                      <Building2 className="w-5 h-5 text-amber-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white">{b.name}</h3>
                      <p className="text-xs text-slate-500">{b.site_name || 'No site'}</p>
                    </div>
                  </div>
                  <StatusBadge status={b.status} />
                </div>
                <div className="flex gap-4 mb-4">
                  <div className="flex items-center gap-1.5 text-xs text-slate-400">
                    <Layers className="w-3.5 h-3.5" /> {b.floors || 0} floors
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-slate-400">
                    <DoorOpen className="w-3.5 h-3.5" /> {rCount} rooms
                  </div>
                </div>
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <GlassButton variant="ghost" className="text-xs" onClick={() => setModal({ open: true, building: b })}><Pencil className="w-3 h-3" /> Edit</GlassButton>
                  <GlassButton variant="ghost" className="text-xs text-rose-400" onClick={() => { if (confirm('Delete this building?')) deleteMut.mutate(b.id); }}><Trash2 className="w-3 h-3" /> Delete</GlassButton>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <GlassModal open={modal.open} onClose={() => setModal({ open: false, building: null })} title={modal.building ? 'Edit Building' : 'New Building'}>
        <BuildingForm building={modal.building} sites={sites} onSubmit={(d) => saveMut.mutate(d)} onCancel={() => setModal({ open: false, building: null })} />
      </GlassModal>
    </div>
  );
}