import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { MapPin, Building2, DoorOpen, Users, CalendarCheck, TrendingUp } from 'lucide-react';
import ParticleField from '../components/dashboard/ParticleField';
import HeroBanner from '../components/dashboard/HeroBanner';
import StatCard3D from '../components/dashboard/StatCard3D';
import DashboardCharts from '../components/dashboard/DashboardCharts';
import RecentOccupants from '../components/dashboard/RecentOccupants';
import LoadingSpinner from '../components/ui-custom/LoadingSpinner';
import { useT } from '@/lib/i18n';

export default function Dashboard() {
  const t = useT();
  // Fetch all primary entities needed to compute KPIs
  const { data: sites = [], isLoading: sl } = useQuery({ queryKey: ['sites'], queryFn: () => base44.entities.Site.list() });
  const { data: buildings = [], isLoading: bl } = useQuery({ queryKey: ['buildings'], queryFn: () => base44.entities.Building.list() });
  const { data: rooms = [], isLoading: rl } = useQuery({ queryKey: ['rooms'], queryFn: () => base44.entities.Room.list() });
  const { data: occupants = [], isLoading: ol } = useQuery({ queryKey: ['occupants'], queryFn: () => base44.entities.Occupant.list() });
  const { data: reservations = [] } = useQuery({ queryKey: ['reservations'], queryFn: () => base44.entities.Reservation.list() });

  // Show spinner until all critical data has loaded
  if (sl || bl || rl || ol) return <LoadingSpinner size="lg" />;

  // --- KPI Calculations ---
  const activeSites = sites.filter(s => s.status === 'active').length;
  const availableRooms = rooms.filter(r => r.status === 'available').length;
  const availableBuildings = buildings.filter(b => b.status === 'active').length;
  const activeOccupants = occupants.filter(o => o.status === 'active').length;
  const totalBeds = rooms.reduce((sum, r) => sum + (r.bed_count || 0), 0);
  const occupancyRate = totalBeds > 0 ? Math.round((activeOccupants / totalBeds) * 100) : 0;
  const pendingReservations = reservations.filter(r => r.status === 'pending').length;

  return (
    <div className="relative">
      {/* Animated particle background effect */}
      <ParticleField />

      <div className="relative z-10">
        {/* Hero banner with top-level occupancy summary */}
        <HeroBanner
          occupancyRate={occupancyRate}
          activeSites={activeSites}
          availableRooms={availableRooms}
          availableBuildings={availableBuildings}
        />

        {/* 3D KPI stat cards row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
          <StatCard3D title={t('Sites')} value={sites.length} subtitle={t('{n} active', { n: activeSites })} icon={MapPin} gradient="from-violet-500 to-purple-600" delay={0} />
          <StatCard3D title={t('Buildings')} value={buildings.length} subtitle={t('{n} active', { n: availableBuildings })} icon={Building2} gradient="from-amber-500 to-orange-600" delay={0.05} />
          <StatCard3D title={t('Rooms')} value={rooms.length} subtitle={t('{n} available', { n: availableRooms })} icon={DoorOpen} gradient="from-cyan-500 to-blue-600" delay={0.1} />
          <StatCard3D title={t('Occupants')} value={activeOccupants} subtitle={t('of {n} total', { n: occupants.length })} icon={Users} gradient="from-emerald-500 to-green-600" delay={0.15} />
          <StatCard3D title={t('Occupancy')} value={`${occupancyRate}%`} subtitle={t('{n} beds', { n: totalBeds })} icon={TrendingUp} gradient="from-rose-500 to-pink-600" delay={0.2} />
          <StatCard3D title={t('Pending')} value={pendingReservations} subtitle={t('reservations')} icon={CalendarCheck} gradient="from-sky-500 to-indigo-600" delay={0.25} />
        </div>

        {/* Room and site analytics charts */}
        <DashboardCharts rooms={rooms} sites={sites} />

        {/* Recent occupants list */}
        <RecentOccupants occupants={occupants} />
      </div>
    </div>
  );
}