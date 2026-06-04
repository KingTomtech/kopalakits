import { useEffect, useState, useCallback } from 'react';
import { DARK_MODE_KEY } from '../constants.js';

/**
 * Dark mode hook. The .dark class is applied to <html> so it cascades
 * through the CSS custom-property definitions in :root.
 */
export function useTheme() {
  const [darkMode, setDarkMode] = useState(() => {
    try {
      const saved = localStorage.getItem(DARK_MODE_KEY);
      if (saved !== null) return JSON.parse(saved);
      return window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false;
    } catch (e) { void e; return false; }
  });

  useEffect(() => {
    try { localStorage.setItem(DARK_MODE_KEY, JSON.stringify(darkMode)); } catch (e) { void e;}
    document.documentElement.classList.toggle('dark', darkMode);
  }, [darkMode]);

  const toggleDarkMode = useCallback(() => setDarkMode((d) => !d), []);

  return { darkMode, toggleDarkMode };
}
