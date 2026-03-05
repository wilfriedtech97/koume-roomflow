import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { MapPin, Plus, Pencil, Trash2, Building2, DoorOpen } from 'lucide-react';
import PageHeader from '../components/ui-custom/PageHeader';
import GlassButton from '../components/ui-custom/GlassButton';
import GlassModal from '../components/ui-custom/GlassModal';
import StatusBadge from '../components/ui-custom/StatusBadge';
import EmptyState from '../components/ui-custom/EmptyState';
import LoadingSpinner from '../components/ui-custom/LoadingSpinner';
import ExportButton from '../components/ui-custom/ExportButton';
import SiteForm from '../components/sites/SiteForm';

export default function Sites() {
  // Modal state for create/edit site dialog
  const [modal, setModal] = useState({ open: false, site: null });

  const qc = useQueryClient();

  // Fetch sites, buildings, and rooms from the database
  const { data: sites = [], isLoading } = useQuery({ queryKey: ['sites'], queryFn: () => base44.entities.Site.list() });
  const { data: buildings = [] } = useQuery({ queryKey: ['buildings'], queryFn: () => base44.entities.Building.list() });
  const { data: rooms = [] } = useQuery({ queryKey: ['rooms'], queryFn: () => base44.entities.Room.list() });

  // Mutation: create or update a site record
  const saveMut = useMutation({
    mutationFn: (data) => modal.site
      ? base44.entities.Site.update(modal.site.id, data)
      : base44.entities.Site.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['sites'] });
      setModal({ open: false, site: null });
    },
  });

  // Mutation: delete a site by ID
  const deleteMut = useMutation({
    mutationFn: (id) => base44.entities.Site.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['sites'] }),
  });

  if (isLoading) return <LoadingSpinner />;

  return (
    <div>
      {/* Page title and export/add actions */}
      <PageHeader
        title="Sites"
        subtitle={`${sites.length} sites registered`}
        action={
          <div className="flex gap-3">
            <ExportButton data={sites} filename="sites" />
            <GlassButton onClick={() => setModal({ open: true, site: null })}>
              <Plus className="w-4 h-4" /> Add Site
            </GlassButton>
          </div>
        }
      />

      {/* Sites grid or empty state */}
      {sites.length === 0 ? (
        <EmptyState icon={MapPin} title="No sites" message="Create your first site to get started." />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sites.map(site => {
            // Count buildings and rooms associated with this site
            const bCount = buildings.filter(b => b.site_id === site.id).length;
            const rCount = rooms.filter(r => r.site_id === site.id).length;
            return (
              <div key={site.id} className="entity-card p-5 group">
                {/* Card header: icon, name, city, and status badge */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500/20 to-purple-500/20 flex items-center justify-center">
                      <MapPin className="w-5 h-5 text-violet-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white">{site.name}</h3>
                      <p className="text-xs text-slate-500">{site.city || 'No city'}</p>
                    </div>
                  </div>
                  <StatusBadge status={site.status} />
                </div>

                {/* Optional site address */}
                {site.address && <p className="text-xs text-slate-400 mb-3">{site.address}</p>}

                {/* Building and room counts */}
                <div className="flex gap-4 mb-4">
                  <div className="flex items-center gap-1.5 text-xs text-slate-400">
                    <Building2 className="w-3.5 h-3.5" /> {bCount} buildings
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-slate-400">
                    <DoorOpen className="w-3.5 h-3.5" /> {rCount} rooms
                  </div>
                </div>

                {/* Edit and delete actions — visible on hover */}
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <GlassButton variant="ghost" className="text-xs" onClick={() => setModal({ open: true, site })}>
                    <Pencil className="w-3 h-3" /> Edit
                  </GlassButton>
                  <GlassButton
                    variant="ghost"
                    className="text-xs text-rose-400"
                    onClick={() => { if (confirm('Delete this site?')) deleteMut.mutate(site.id); }}
                  >
                    <Trash2 className="w-3 h-3" /> Delete
                  </GlassButton>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create / Edit site modal */}
      <GlassModal
        open={modal.open}
        onClose={() => setModal({ open: false, site: null })}
        title={modal.site ? 'Edit Site' : 'New Site'}
      >
        <SiteForm
          site={modal.site}
          onSubmit={d => saveMut.mutate(d)}
          onCancel={() => setModal({ open: false, site: null })}
        />
      </GlassModal>
    </div>
  );
}