import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Building2, MapPin, DoorOpen, Users, CalendarCheck, Clock,
  ArrowRight, ShieldCheck, Wifi, Sparkles
} from 'lucide-react';
import LanguageToggle from '@/components/ui-custom/LanguageToggle';
import ThemeToggle from '@/components/ui-custom/ThemeToggle';
import { useT } from '@/lib/i18n';
import { useAuth } from '@/lib/AuthContext';

// Number of automatic entries into the app before the landing page is shown again
const AUTO_LOGIN_LIMIT = 4;

const features = [
  { icon: MapPin, title: 'Sites Management', desc: 'Manage multiple dormitory sites, each with its own buildings, rooms and teams, from a single console.' },
  { icon: Building2, title: 'Buildings & Floors', desc: 'Organize every site into buildings and floors with clear structure and operational status tracking.' },
  { icon: DoorOpen, title: 'Smart Rooms', desc: 'Track capacity, room types, facilities and live availability — including rooms under construction.' },
  { icon: Users, title: 'Occupants', desc: 'Full occupant records with gender, contact details, ID documents and personalized stay dates.' },
  { icon: CalendarCheck, title: 'Reservations', desc: 'A guided three-step reservation wizard with capacity checks and staggered arrival dates.' },
  { icon: Clock, title: 'History & Audit', desc: 'Every check-in, check-out and change is logged, giving you a complete audit trail.' },
];

const highlights = ['Institutional design', 'Day & night modes', 'French & English', 'Works offline'];

export default function Landing() {
  const t = useT();
  const navigate = useNavigate();
  const { isAuthenticated, isLoadingAuth, navigateToLogin } = useAuth();

  // Auto-login counter: for the first 4 visits the user goes straight into
  // the app; afterwards the landing page is shown and the counter resets.
  useEffect(() => {
    if (isLoadingAuth || !isAuthenticated) return;
    let count = 0;
    try { count = parseInt(localStorage.getItem('rf_auto_logins') || '0', 10); } catch (e) { /* ignore */ }
    if (count < AUTO_LOGIN_LIMIT) {
      try { localStorage.setItem('rf_auto_logins', String(count + 1)); } catch (e) { /* ignore */ }
      navigate('/Dashboard', { replace: true });
    } else {
      try { localStorage.setItem('rf_auto_logins', '0'); } catch (e) { /* ignore */ }
    }
  }, [isLoadingAuth, isAuthenticated, navigate]);

  return (
    <div className="min-h-screen bg-app text-ink overflow-x-hidden">
      {/* ── Top bar ─────────────────────────────────────────── */}
      <header className="max-w-6xl mx-auto px-6 py-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-navy to-gold flex items-center justify-center shadow-lg">
            <Building2 className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-heading font-bold text-lg leading-none">Koume RoomFlow</h1>
            <p className="text-[11px] text-inkmuted mt-0.5">{t('Management System')}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <LanguageToggle />
          <ThemeToggle />
        </div>
      </header>

      {/* ── Hero ────────────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-6 pt-14 pb-16 text-center relative">
        <div className="absolute inset-0 pointer-events-none opacity-40"
          style={{ background: 'radial-gradient(600px 300px at 50% 0%, rgb(var(--c-gold) / 0.12), transparent)' }} />
        <div className="relative">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-gold/30 bg-gold/10 text-gold text-xs font-semibold tracking-wide mb-6">
            <Sparkles className="w-3.5 h-3.5" />
            {t('Complete dormitory management platform')}
          </span>
          <h2 className="font-heading text-4xl md:text-6xl font-bold leading-tight mb-5">
            <span className="gradient-text">{t('Welcome to Koume RoomFlow')}</span>
          </h2>
          <p className="max-w-2xl mx-auto text-lg text-inksoft leading-relaxed mb-9">
            {t('Manage your sites, buildings, rooms, occupants and reservations with precision — a single, formal and reliable system designed for administrators who expect institutional-grade control.')}
          </p>

          {isAuthenticated ? (
            <button
              onClick={() => navigate('/Dashboard')}
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-primary text-primary-foreground font-semibold shadow-lg hover:opacity-90 transition-opacity"
            >
              {t('Go to Dashboard')} <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={navigateToLogin}
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-primary text-primary-foreground font-semibold shadow-lg hover:opacity-90 transition-opacity"
            >
              {t('Sign in to get started')} <ArrowRight className="w-4 h-4" />
            </button>
          )}

          {/* Highlights strip */}
          <div className="mt-12 flex flex-wrap justify-center gap-3">
            {highlights.map(h => (
              <span key={h} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg glass-card text-sm text-inksoft">
                <ShieldCheck className="w-4 h-4 text-gold" /> {t(h)}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ────────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-6 pb-16">
        <h3 className="font-heading text-2xl md:text-3xl font-bold text-center mb-3">{t('Everything you need, in one system')}</h3>
        <p className="text-center text-inkmuted mb-10 max-w-xl mx-auto">{t('Six integrated modules that cover the full lifecycle of your dormitories.')}</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map(f => (
            <div key={f.title} className="entity-card p-6">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-navy to-gold/60 flex items-center justify-center mb-4">
                <f.icon className="w-5 h-5 text-white" />
              </div>
              <h4 className="font-heading font-bold text-lg mb-2">{t(f.title)}</h4>
              <p className="text-sm text-inksoft leading-relaxed">{t(f.desc)}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Offline banner ──────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-6 pb-20">
        <div className="glass-card p-8 md:p-10 flex flex-col md:flex-row items-center gap-6">
          <div className="w-14 h-14 rounded-2xl bg-gold/15 border border-gold/30 flex items-center justify-center shrink-0">
            <Wifi className="w-7 h-7 text-gold" />
          </div>
          <div className="flex-1 text-center md:text-left">
            <h4 className="font-heading font-bold text-xl mb-1">{t('Built to keep working, even offline')}</h4>
            <p className="text-inksoft text-sm leading-relaxed">
              {t('Koume RoomFlow stores your data locally and syncs automatically when the connection returns — perfect for dormitories with unreliable internet.')}
            </p>
          </div>
        </div>
      </section>

      {/* ── Footer ──────────────────────────────────────────── */}
      <footer className="border-t border-hair">
        <div className="max-w-6xl mx-auto px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-inkmuted">
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4" />
            <span>Koume RoomFlow — {t('Management System')}</span>
          </div>
          <span>© {new Date().getFullYear()} Koume RoomFlow</span>
        </div>
      </footer>
    </div>
  );
}