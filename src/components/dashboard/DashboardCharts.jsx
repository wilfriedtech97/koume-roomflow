import React from 'react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const COLORS = ['#10b981', '#f43f5e', '#64748b'];

export default function DashboardCharts({ rooms = [], sites = [] }) {
  const statusData = [
    { name: 'Available', value: rooms.filter(r => r.status === 'available').length },
    { name: 'Occupied', value: rooms.filter(r => r.status === 'occupied').length },
    { name: 'Unavailable', value: rooms.filter(r => r.status === 'unavailable').length },
  ].filter(d => d.value > 0);

  const siteData = sites.map(s => ({
    name: s.name?.substring(0, 12) || 'Unknown',
    rooms: rooms.filter(r => r.site_id === s.id).length,
  }));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      <div className="entity-card p-6">
        <h3 className="text-sm font-semibold text-white mb-4">Room Status</h3>
        {statusData.length > 0 ? (
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={statusData} cx="50%" cy="50%" outerRadius={80} innerRadius={45} dataKey="value" paddingAngle={4} strokeWidth={0}>
                {statusData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid rgba(56,189,248,0.2)', borderRadius: 12, color: '#f1f5f9' }} />
              <Legend wrapperStyle={{ color: '#94a3b8', fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-slate-500 text-sm text-center py-8">No rooms yet</p>
        )}
      </div>
      <div className="entity-card p-6">
        <h3 className="text-sm font-semibold text-white mb-4">Rooms by Site</h3>
        {siteData.length > 0 ? (
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={siteData}>
              <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid rgba(56,189,248,0.2)', borderRadius: 12, color: '#f1f5f9' }} />
              <Bar dataKey="rooms" fill="#06b6d4" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-slate-500 text-sm text-center py-8">No sites yet</p>
        )}
      </div>
    </div>
  );
}