'use client';
import { useEffect, useState } from 'react';

type ThemeKey = 'onyx' | 'forest' | 'mist';
const VALID: ThemeKey[] = ['onyx', 'forest', 'mist'];
const STORAGE_KEY = 'foresta-theme';
const BASE = process.env.NEXT_PUBLIC_BASE_PATH || '';

function applyTheme(next: ThemeKey) {
  document.documentElement.setAttribute('data-theme', next);
}

export function useTheme() {
  const [theme, setThemeState] = useState<ThemeKey>('onyx');

  useEffect(() => {
    // 1. localStorage確認
    try {
      const saved = localStorage.getItem(STORAGE_KEY) as ThemeKey | null;
      if (saved && VALID.includes(saved)) {
        applyTheme(saved);
        setThemeState(saved);
        return;
      }
    } catch {}

    // 2. ADMIN設定から取得
    fetch(`${BASE}/api/site-settings`)
      .then(r => r.ok ? r.json() : { default_theme: 'onyx' })
      .then(data => {
        const def = (data.default_theme || 'onyx') as ThemeKey;
        const t = VALID.includes(def) ? def : 'onyx';
        applyTheme(t);
        setThemeState(t);
      })
      .catch(() => {
        applyTheme('onyx');
        setThemeState('onyx');
      });
  }, []);

  const changeTheme = (next: ThemeKey) => {
    applyTheme(next);
    setThemeState(next);
    try { localStorage.setItem(STORAGE_KEY, next); } catch {}
  };

  return { theme, changeTheme };
}
