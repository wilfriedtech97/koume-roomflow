import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Shield, Users, DoorOpen, Building2, TrendingUp, UserPlus, Loader2 } from 'lucide-react';
import PageHeader from '../components/ui-custom/PageHeader';
import StatCard3D from '../components/dashboard/StatCard3D';
import GlassInput from '../components/ui-custom/GlassInput';
import GlassSelect from '../components/ui-custom/GlassSelect';
import GlassButton from '../components/ui-custom/GlassButton';
import LoadingSpinner from '../components/ui-custom/LoadingSpinner';
import DatabaseManager from '../components/admin/DatabaseManager';

export default function Admin() {
  const [user, setUser] = useState(null);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('user');
  const [inviting, setInviting] = useState(false);
  const [inviteMsg, setInviteMsg] = useState('');

  useEffect(() => { base44.auth.me().then(setUser).catch(() => {}); }, []);

  const { data: rooms = [], isLoading: rl } = useQuery({ queryKey: ['rooms'], queryFn: () => base44.entities.Room.list() });
  const { data: occupants = [] } = useQuery({ queryKey: ['occupants'], queryFn: () => base44.entities.Occupant.list() });
  const { data: buildings = [] } = useQuery({ queryKey: ['buildings'], queryFn: () => base44.entities.Building.list() });
  const { data: sites = [] } = useQuery({ queryKey: ['sites'], queryFn: () => base44.entities.Site.list() });

  if (rl) return <LoadingSpinner />;

  const activeOccupants = occupants.filter(o => o.status === 'active').length;
  const totalBeds = rooms.reduce((s, r) => s + (r.bed_count || 0), 0);
  const occupancyRate = totalBeds > 0 ? Math.round((activeOccupants / totalBeds) * 100) : 0;

  const handleInvite = async () => {
    if (!inviteEmail) return;
    setInviting(true);
    setInviteMsg('');
    try {
      await base44.users.inviteUser(inviteEmail, inviteRole);
      setInviteMsg(`Invitation sent to ${inviteEmail} as ${inviteRole}.`);
      setInviteEmail('');
    } catch (e) {
      setInviteMsg(`Error: ${e.message || 'Failed to invite.'}`);
    }
    setInviting(false);
  };

  return (
    <div>
      <PageHeader title="Admin" subtitle="System overview and management" />

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard3D title="Active Occupants" value={activeOccupants} icon={Users} gradient="from-cyan-500 to-blue-600" />
        <StatCard3D title="Total Rooms" value={rooms.length} icon={DoorOpen} gradient="from-emerald-500 to-green-600" delay={0.05} />
        <StatCard3D title="Buildings" value={buildings.length} icon={Building2} gradient="from-amber-500 to-orange-600" delay={0.1} />
        <StatCard3D title="Occupancy Rate" value={`${occupancyRate}%`} icon={TrendingUp} gradient="from-rose-500 to-pink-600" delay={0.15} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Profile */}
        <div className="entity-card p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2"><Shield className="w-5 h-5 text-cyan-400" /> My Profile</h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between py-2 border-b border-slate-800/50">
              <span className="text-slate-400">Name</span>
              <span className="text-white">{user?.full_name || '—'}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-800/50">
              <span className="text-slate-400">Email</span>
              <span className="text-white">{user?.email || '—'}</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-slate-400">Role</span>
              <span className="text-cyan-400 capitalize">{user?.role || '—'}</span>
            </div>
          </div>
        </div>

        {/* Invite User */}
        <div className="entity-card p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2"><UserPlus className="w-5 h-5 text-cyan-400" /> Invite User</h3>
          <div className="space-y-4">
            <GlassInput label="Email Address" type="email" value={inviteEmail} onChange={e => setInviteEmail(e.target.value)} placeholder="user@example.com" />
            <GlassSelect label="Role" value={inviteRole} onChange={e => setInviteRole(e.target.value)} options={[
              { value: 'user', label: 'User (Full access)' },
              { value: 'visitor', label: 'Visitor (Limited access)' },
              { value: 'admin', label: 'Admin (Full + management)' },
            ]} />
            <GlassButton onClick={handleInvite} disabled={inviting || !inviteEmail}>
              {inviting ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />} Send Invitation
            </GlassButton>
            {inviteMsg && <p className="text-sm text-cyan-400">{inviteMsg}</p>}
          </div>
        </div>
      </div>

      {/* Database Manager */}
      <DatabaseManager />
    </div>
  );
}