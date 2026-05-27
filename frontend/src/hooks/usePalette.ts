import { useEffect, useState } from 'react';
import { PALETTES } from '../styles/palettes';
import type { PaletteKey, Palette } from '../types/content';

const STORAGE_KEY = 'foresta-palette';

export function usePalette(): [Palette, PaletteKey, (k: PaletteKey) => void] {
  const [key, setKey] = useState<PaletteKey>(() => {
    if (typeof window === 'undefined') return 'forest';
    const stored = localStorage.getItem(STORAGE_KEY);
    return (stored as PaletteKey) || 'forest';
  });
  const P = PALETTES[key];

  useEffect(() => {
    const r = document.documentElement.style;
    r.setProperty('--bg', P.bg);
    r.setProperty('--bg-2', P.bg2);
    r.setProperty('--paper', P.paper);
    r.setProperty('--ink', P.ink);
    r.setProperty('--ink-soft', P.inkSoft);
    r.setProperty('--ink-mute', P.inkMute);
    r.setProperty('--line', P.line);
    r.setProperty('--accent', P.accent);
    r.setProperty('--accent-2', P.accent2);
    r.setProperty('--gold', P.gold);
    document.body.style.background = P.bg;
    document.body.style.color = P.ink;
    localStorage.setItem(STORAGE_KEY, key);
  }, [P, key]);

  return [P, key, setKey];
}
