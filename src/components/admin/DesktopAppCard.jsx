import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { MonitorDown, CheckCircle2, Circle, Monitor, Apple, Globe, Info } from 'lucide-react';
import GlassButton from '../ui-custom/GlassButton';
import { useT } from '@/lib/i18n';

// Capture the native install prompt as early as possible, even if it
// fires before this card is mounted.
let deferredPrompt = null;
const earlyListeners = new Set();
if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    earlyListeners.forEach((fn) => fn(e));
  });
}

const isStandalone = () =>
  typeof window !== 'undefined' &&
  (window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true);

export default function DesktopAppCard() {
  const t = useT();
  const location = useLocation();
  const elRef = React.useRef(null);
  const [highlighted, setHighlighted] = useState(false);
  const [installed, setInstalled] = useState(isStandalone());
  const [canPrompt, setCanPrompt] = useState(!!deferredPrompt);
  const [swReady, setSwReady] = useState(false);
  const [installing, setInstalling] = useState(false);
  const [promptError, setPromptError] = useState('');

  useEffect(() => {
    const onEarly = () => setCanPrompt(true);
    earlyListeners.add(onEarly);
    const onInstalled = () => { setInstalled(true); setCanPrompt(false); deferredPrompt = null; };
    window.addEventListener('appinstalled', onInstalled);

    // Highlight and scroll to the card when opened from the menu entry
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('section') === 'desktop-app') {
      setTimeout(() => {
        elRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        setHighlighted(true);
        setTimeout(() => setHighlighted(false), 3000);
      }, 300);
    }

    // Confirm the offline service worker is active (app opens without internet).
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistration().then((reg) => {
        if (reg && (reg.active || reg.installing || reg.waiting)) setSwReady(true);
      }).catch(() => {});
    }
    return () => { earlyListeners.delete(onEarly); window.removeEventListener('appinstalled', onInstalled); };
  }, [location.search]);

  // Trigger the browser's native "Install app" dialog.
  const handleInstall = async () => {
    setPromptError('');
    const promptEvent = deferredPrompt;
    if (!promptEvent) { setPromptError(t('Use your browser menu to install the app (see steps below).')); return; }
    setInstalling(true);
    try {
      promptEvent.prompt();
      const { outcome } = await promptEvent.userChoice;
      if (outcome === 'accepted') setInstalled(true);
      deferredPrompt = null;
      setCanPrompt(false);
    } catch (e) {
      setPromptError(t('Use your browser menu to install the app (see steps below).'));
    }
    setInstalling(false);
  };

  const browser = (() => {
    if (typeof navigator === 'undefined') return 'chrome';
    const ua = navigator.userAgent;
    if (/Edg\//.test(ua)) return 'edge';
    if (/Chrome\//.test(ua) && !/Edg\//.test(ua)) return 'chrome';
    if (/Firefox\//.test(ua)) return 'firefox';
    if (/Safari\//.test(ua) && !/Chrome\//.test(ua)) return 'safari';
    return 'chrome';
  })();

  return (
    <div ref={elRef} className={`entity-card p-6 mb-8 transition-shadow duration-500 ${highlighted ? 'ring-2 ring-cyan-400/60' : ''}`}>
      <h3 className="text-lg font-semibold text-white mb-1 flex items-center gap-2">
        <MonitorDown className="w-5 h-5 text-cyan-400" /> {t('Desktop App')}
      </h3>
      <p className="text-sm text-slate-400 mb-5">
        {t('Install Koume RoomFlow as a local desktop application. It opens in its own window, works offline, and syncs when you are back online.')}
      </p>

      {/* Status row */}
      <div className="flex flex-wrap items-center gap-4 mb-5 text-sm">
        <span className="flex items-center gap-2">
          {installed ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <Circle className="w-4 h-4 text-slate-500" />}
          {installed ? t('App installed') : t('Not installed')}
        </span>
        <span className="flex items-center gap-2">
          {swReady ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <Circle className="w-4 h-4 text-slate-500" />}
          {swReady ? t('Offline mode ready') : t('Offline mode pending (reconnect once to activate)')}
        </span>
      </div>

      {/* Primary install action */}
      {!installed && (
        <div className="mb-5">
          <GlassButton onClick={handleInstall} disabled={installing}>
            <MonitorDown className="w-4 h-4" /> {t('Install Desktop App')}
          </GlassButton>
          {promptError && <p className="text-sm text-rose-400 mt-3">{promptError}</p>}
        </div>
      )}

      {installed && (
        <div className="flex items-center gap-2 text-sm text-emerald-400 mb-2">
          <CheckCircle2 className="w-4 h-4" /> {t('Koume RoomFlow is installed on this device.')}
        </div>
      )}

      {/* Manual install steps per browser */}
      {!installed && (
        <div className="mt-2 border-t border-slate-800/50 pt-4">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
            <Info className="w-3.5 h-3.5" /> {t('Manual installation steps')}
          </p>
          <ul className="space-y-3 text-sm text-slate-300">
            <li className="flex items-start gap-3">
              <Globe className="w-4 h-4 text-cyan-400 mt-0.5 shrink-0" />
              <span>{t('Chrome or Edge: open the published app URL, then click the install icon in the address bar — or the browser menu, then "Install Koume RoomFlow".')}</span>
            </li>
            <li className="flex items-start gap-3">
              <Monitor className="w-4 h-4 text-cyan-400 mt-0.5 shrink-0" />
              <span>{t('Edge: browser menu, then "Apps", then "Install this site as an app".')}</span>
            </li>
            <li className="flex items-start gap-3">
              <Apple className="w-4 h-4 text-cyan-400 mt-0.5 shrink-0" />
              <span>{t('Safari on Mac: open the app, then the Share menu, then "Add to Dock".')}</span>
            </li>
          </ul>
          {browser === 'firefox' && (
            <p className="text-sm text-slate-400 mt-3">
              {t('Tip: Firefox does not support desktop installation — use Chrome, Edge or Safari.')}
            </p>
          )}
        </div>
      )}
    </div>
  );
}