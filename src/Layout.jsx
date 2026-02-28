import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { useTheme } from './components/ui-custom/useTheme';
import {
  LayoutDashboard, MapPin, Building2, DoorOpen, Users, CalendarCheck,
  Clock, Search, Shield, Menu, X, ChevronRight, LogOut, Sun, Moon
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const navSections = [
  {
    title: 'Navigation',
    items: [
      { name: 'Dashboard', icon: LayoutDashboard, page: 'Dashboard' },
      { name: 'Sites', icon: MapPin, page: 'Sites' },
      { name: 'Buildings', icon: Building2, page: 'Buildings' },
      { name: 'Rooms', icon: DoorOpen, page: 'Rooms' },
      { name: 'Occupants', icon: Users, page: 'Occupants' },
    ],
  },
  {
    title: 'Tools',
    items: [
      { name: 'Reservations', icon: CalendarCheck, page: 'Reservations' },
      { name: 'History', icon: Clock, page: 'History' },
      { name: 'Search', icon: Search, page: 'SearchPage' },
      { name: 'Admin', icon: Shield, page: 'Admin' },
    ],
  },
];

const visitorPages = ['Dashboard', 'Reservations', 'History', 'SearchPage'];

export default function Layout({ children, currentPageName }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState(null);
  const { theme, toggle, isDark } = useTheme();

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const role = user?.role || 'user';
  const isRestricted = role === 'visitor';

  const canAccess = (page) => {
    if (!isRestricted) return true;
    return visitorPages.includes(page);
  };

  if (isRestricted && !canAccess(currentPageName)) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{background:'var(--bg-primary)'}}>
        <div className="glass-card p-8 text-center max-w-md">
          <Shield className="w-12 h-12 text-cyan-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">Access Restricted</h2>
          <p className="text-slate-400 mb-6">You don't have permission to access this page.</p>
          <Link to={createPageUrl('Dashboard')} className="text-cyan-400 hover:text-cyan-300 font-medium">
            Go to Dashboard →
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex" style={{background:'var(--bg-primary)'}}>
      {/* Mobile overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside className={`fixed lg:sticky top-0 left-0 h-screen w-64 backdrop-blur-xl z-50 flex flex-col transition-transform duration-300 border-r ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`} style={{background:'var(--sidebar-bg)', borderColor:'var(--sidebar-border)'}}>
        <div className="p-5 border-b" style={{borderColor:'var(--sidebar-border)'}}>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-white text-sm">Koume RoomFlow</h1>
              <p className="text-[10px] text-slate-500">Management System</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto p-3 space-y-6">
          {navSections.map(section => (
            <div key={section.title}>
              <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest px-3 mb-2">
                {section.title}
              </p>
              <div className="space-y-0.5">
                {section.items.filter(item => canAccess(item.page)).map(item => {
                  const isActive = currentPageName === item.page;
                  return (
                    <Link
                      key={item.page}
                      to={createPageUrl(item.page)}
                      onClick={() => setSidebarOpen(false)}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                        isActive
                          ? 'bg-gradient-to-r from-cyan-500/15 to-blue-500/10 text-cyan-400 border border-cyan-500/20'
                          : 'text-white hover:bg-slate-800/50 hover:text-cyan-300'
                      }`}
                    >
                      <item.icon className="w-4.5 h-4.5" />
                      {item.name}
                      {isActive && <ChevronRight className="w-3.5 h-3.5 ml-auto opacity-60" />}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-800/50">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-xs font-bold text-white">
              {(user?.full_name || 'U')[0].toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{user?.full_name || 'User'}</p>
              <p className="text-[10px] text-slate-500 capitalize">{role}</p>
            </div>
          </div>
          <button
            onClick={() => base44.auth.logout()}
            className="w-full flex items-center gap-2 px-3 py-2 text-xs text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 min-h-screen">
        <div className="lg:hidden sticky top-0 z-30 bg-[#050810]/90 backdrop-blur-lg border-b border-slate-800/50 px-4 py-3 flex items-center gap-3">
          <button onClick={() => setSidebarOpen(true)} className="p-1.5 hover:bg-slate-800/50 rounded-lg">
            <Menu className="w-5 h-5 text-slate-300" />
          </button>
          <span className="text-sm font-semibold text-white">Koume RoomFlow</span>
        </div>
        <div className="p-4 md:p-6 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}