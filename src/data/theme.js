import { useEffect, useState } from 'react';

// Dark / light theme. Dark is the default.
// The choice is saved in this browser, so it stays after refresh and after logging out.
const KEY = 'ai-studio-theme';

export function getSavedTheme() {
  try {
    return localStorage.getItem(KEY) === 'light' ? 'light' : 'dark';
  } catch {
    return 'dark';
  }
}

// Puts data-theme="dark" or "light" on <html>; styles.css does the rest
export function applyTheme(theme) {
  document.documentElement.dataset.theme = theme;
}

export function useTheme() {
  const [theme, setTheme] = useState(getSavedTheme);

  useEffect(() => {
    applyTheme(theme);
    try { localStorage.setItem(KEY, theme); } catch { /* storage blocked */ }
  }, [theme]);

  const toggleTheme = () => setTheme((t) => (t === 'dark' ? 'light' : 'dark'));
  return [theme, toggleTheme];
}