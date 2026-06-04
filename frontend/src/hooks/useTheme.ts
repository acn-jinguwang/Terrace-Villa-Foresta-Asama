'use client';
import { useEffect, useState } from 'react';

type ThemeKey = 'onyx' | 'forest' | 'mist';
const VALID: ThemeKey[] = ['onyx', 'forest', 'mist'];
const STORAGE_KEY = 'foresta-theme';
const BASE = process.env.NEXT_PUBLIC_BASE_PATH || '';

export function useTheme() {
  const [theme, setThemeState] = useState<ThemeKey>('onyx');
  const [ready, setReady] = useState(false);

  const apply = (next: ThemeKey) => {
    setThemeState(next);
    document.documentElement.setAttribute('data-theme', next);
  };

  useEffect(() => {
    (async () => {
      try {
        const saved = localStorage.getItem(STORAGE_KEY) as ThemeKey | null;
        if (saved && VALID.includes(saved)) {
          apply(saved);
          setReady(true);
          return;
        }
      } catch {}
      try {
        const res = await fetch(`${BASE}/api/site-settings`);
        const data = await res.json();
        const def = (data.default_theme || 'onyx') as ThemeKey;
        apply(VALID.includes(def) ? def : 'onyx');
      } catch {
        apply('onyx');
      }
      setReady(true);
    })();
  }, []);

  const changeTheme = (next: ThemeKey) => {
    apply(next);
    try { localStorage.setItem(STORAGE_KEY, next); } catch {}
  };

  return { theme, changeTheme, ready };
}
