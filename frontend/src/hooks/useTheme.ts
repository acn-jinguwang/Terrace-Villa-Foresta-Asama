'use client';
import { useState, useEffect } from 'react';

type ThemeKey = 'onyx' | 'forest' | 'mist';
const STORAGE_KEY = 'foresta-theme';
const BASE = process.env.NEXT_PUBLIC_BASE_PATH || '';

export function useTheme() {
  const [theme, setThemeState] = useState<ThemeKey>('onyx');

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY) as ThemeKey | null;
    if (saved && ['onyx','forest','mist'].includes(saved)) {
      applyTheme(saved); setThemeState(saved); return;
    }
    fetch(`${BASE}/api/site-settings`)
      .then(r => r.json())
      .then(s => {
        const t = (s.default_theme || 'onyx') as ThemeKey;
        applyTheme(t); setThemeState(t);
      })
      .catch(() => applyTheme('onyx'));
  }, []);

  function applyTheme(t: ThemeKey) {
    document.documentElement.setAttribute('data-theme', t);
  }

  function changeTheme(next: ThemeKey) {
    applyTheme(next); setThemeState(next);
    localStorage.setItem(STORAGE_KEY, next);
  }

  return { theme, changeTheme };
}
