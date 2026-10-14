import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import {
  LayoutDashboard, MapPin, Building2, DoorOpen, Users, CalendarCheck,
  Clock, Shield, Menu, ChevronRight, LogOut
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import SyncStatus from '@/components/ui-custom/SyncStatus';
import ThemeToggle from '@/components/ui-custom/ThemeToggle';

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

      { name: 'Admin', icon: Shield, page: 'Admin' },
    ],
  },
];

const visitorPages = ['Dashboard', 'Reservations', 'History', 'SearchPage'];

export default function Layout({ children, currentPageName }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState(null);

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
      <div className="min-h-screen flex items-center justify-center p-4 bg-app">
        <div className="glass-card p-8 text-center max-w-md">
          <Shield className="w-12 h-12 text-cyan-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">Access Restricted</h2>
          <p className="text-slate-400 mb-6">You don't have permission to access this page.</p>
          <Link to={createPageUrl('Dashboard')} className="text-gold hover:text-gold font-medium">
            Go to Dashboard →
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-app">
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
      <aside className={`fixed lg:sticky top-0 left-0 h-screen w-64 bg-surface/95 border-rborder-hair backdrop-blur-xl z-50 flex flex-col transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="p-5 border-b border-hair">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-navy to-gold flex items-center justify-center">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-white text-sm">Koume RoomFlow</h1>
              <p className="text-[10px] text-inkmuted">Management System</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto p-3 space-y-6">
          {navSections.map(section => (
            <div key={section.title}>
              <p className="text-[10px] font-semibold text-inkmuted uppercase tracking-widest px-3 mb-2">
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
                          ? 'bg-gold/10 text-gold border border-gold/25'
                          : 'text-ink hover:bg-surface2 hover:text-gold'
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

        <div className="p-4 border-t border-hair">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-navy to-gold flex items-center justify-center text-xs font-bold text-white">
              {(user?.full_name || 'U')[0].toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-ink truncate">{user?.full_name || 'User'}</p>
              <p className="text-[10px] text-inkmuted capitalize">{role}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => base44.auth.logout()}
              className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-xs text-inksoft hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" /> Sign Out
            </button>
            <ThemeToggle />
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 min-h-screen">
        <div className="lg:hidden sticky top-0 z-30 bg-surface/90 backdrop-blur-lg border-b border-hair px-4 py-3 flex items-center gap-3">
          <button onClick={() => setSidebarOpen(true)} className="p-1.5 hover:bg-slate-800/50 rounded-lg">
            <Menu className="w-5 h-5 text-ink" />
          </button>
          <span className="text-sm font-semibold text-ink">Koume RoomFlow</span>
          <div className="ml-auto"><ThemeToggle /></div>
        </div>
        <div className="p-4 md:p-6 lg:p-8">
          {children}
          <SyncStatus />
        </div>
      </main>
    </div>
  );
}