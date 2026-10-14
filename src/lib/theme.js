const KEY = 'koume-theme';
let current = 'light';
const listeners = new Set();

function apply() {
  const el = document.documentElement;
  el.classList.toggle('dark', current === 'dark');
  el.classList.toggle('light', current === 'light');
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute('content', current === 'dark' ? '#0a1120' : '#f4f5f7');
}

export function initTheme() {
  let stored = null;
  try { stored = localStorage.getItem(KEY); } catch (e) { /* noop */ }
  current = stored === 'dark' ? 'dark' : 'light';
  apply();
  listeners.forEach((fn) => fn(current));
}

export function getTheme() {
  return current;
}

export function setTheme(theme) {
  current = theme === 'dark' ? 'dark' : 'light';
  try { localStorage.setItem(KEY, current); } catch (e) { /* noop */ }
  apply();
  listeners.forEach((fn) => fn(current));
}

export function toggleTheme() {
  setTheme(current === 'dark' ? 'light' : 'dark');
}

export function onThemeChange(fn) {
  listeners.add(fn);
  fn(current);
  return () => listeners.delete(fn);
}