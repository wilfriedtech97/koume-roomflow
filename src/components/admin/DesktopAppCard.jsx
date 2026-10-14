import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { MonitorDown, CheckCircle2, Circle, Globe, Info } from 'lucide-react';
import GlassButton from '../ui-custom/GlassButton';
import { useT } from '@/lib/i18n';
import { detectPlatform, buildInstaller } from '@/lib/installerFiles';

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
  const [swReady, setSwReady] = useState(false);
  const [installing, setInstalling] = useState(false);
  const [downloaded, setDownloaded] = useState(false);
  const [promptError, setPromptError] = useState('');
  const platform = React.useMemo(() => detectPlatform(), []);

  useEffect(() => {
    const onInstalled = () => { setInstalled(true); deferredPrompt = null; };
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
    return () => window.removeEventListener('appinstalled', onInstalled);
  }, [location.search]);

  // One click: native install dialog when the browser offers it,
  // otherwise instantly download a launcher file that opens the app
  // in its own window and creates a desktop icon.
  const handleInstall = async () => {
    setPromptError('');
    setDownloaded(false);
    const promptEvent = deferredPrompt;
    if (!promptEvent) { startDownload(); return; }
    setInstalling(true);
    try {
      promptEvent.prompt();
      const { outcome } = await promptEvent.userChoice;
      if (outcome === 'accepted') setInstalled(true);
      deferredPrompt = null;
    } catch (e) {
      startDownload();
    }
    setInstalling(false);
  };

  const startDownload = () => {
    try {
      const installer = buildInstaller(platform);
      if (!installer) {
        setPromptError(t('On mobile, use your browser menu and choose "Add to Home Screen".'));
        return;
      }
      const blob = new Blob([installer.content], { type: installer.mime });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = installer.filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 5000);
      setDownloaded(true);
    } catch (e) {
      setPromptError(t('Download failed. Use your browser menu to install the app.'));
    }
  };

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

      {/* Primary install action: one click */}
      {!installed && (
        <div className="mb-4">
          <GlassButton onClick={handleInstall} disabled={installing}>
            <MonitorDown className="w-4 h-4" /> {t('Download & Install')}
          </GlassButton>
          {downloaded && (
            <p className="text-sm text-emerald-400 mt-3 flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" />
              {platform === 'mac'
                ? t('Installer downloaded. Open it to launch the app in its own window (if your Mac blocks it, right-click the file and choose Open).')
                : t('Installer downloaded. Open it to launch the app in its own window and create a desktop icon.')}
            </p>
          )}
          {promptError && <p className="text-sm text-rose-400 mt-3">{promptError}</p>}
        </div>
      )}

      {installed && (
        <div className="flex items-center gap-2 text-sm text-emerald-400 mb-2">
          <CheckCircle2 className="w-4 h-4" /> {t('Koume RoomFlow is installed on this device.')}
        </div>
      )}

      {/* Single Safari note (only remaining browser without a launcher file) */}
      {platform === 'mac' && !installed && (
        <p className="text-xs text-slate-400 mt-3 flex items-center gap-2">
          <Globe className="w-3.5 h-3.5" />
          {t('Safari on Mac: open the app, then the Share menu, then "Add to Dock".')}
        </p>
      )}
    </div>
  );
}