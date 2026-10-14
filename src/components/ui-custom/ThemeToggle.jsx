import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { getTheme, toggleTheme, onThemeChange } from '@/lib/theme';

export default function ThemeToggle({ className = '' }) {
  const [theme, setThemeState] = React.useState(getTheme());
  React.useEffect(() => onThemeChange(setThemeState), []);
  const dark = theme === 'dark';
  return (
    <button
      type="button"
      onClick={toggleTheme}
      title={dark ? 'Switch to day mode' : 'Switch to night mode'}
      className={`flex items-center justify-center w-9 h-9 rounded-lg border border-hair bg-surface2 text-gold hover:bg-gold/10 transition-colors shrink-0 ${className}`}
    >
      {dark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
    </button>
  );
}