'use client';
import { useTheme } from '@/hooks/useTheme';

type ThemeKey = 'onyx' | 'forest' | 'mist';

export default function ThemeSwitcher() {
  const { theme, changeTheme } = useTheme();

  const swatchBg: Record<ThemeKey, string> = {
    onyx: 'linear-gradient(135deg,#0d0d0b 50%,#c9a96e 50%)',
    forest: 'linear-gradient(135deg,#f1ede2 50%,#2f4a35 50%)',
    mist: 'linear-gradient(135deg,#1a2028 50%,#9a7a55 50%)',
  };

  return (
    <div style={{
      position: 'fixed', right: 24, bottom: 24, zIndex: 100,
      background: 'color-mix(in srgb, var(--paper) 95%, transparent)',
      backdropFilter: 'blur(12px)',
      border: '1px solid var(--line-strong)',
      padding: '8px 10px',
      display: 'flex', gap: 4, alignItems: 'center',
      boxShadow: '0 12px 40px -10px rgba(0,0,0,0.4)',
      transition: 'background .6s ease, border-color .6s ease',
    }}>
      <span className="mono-label" style={{ padding: '0 8px 0 4px' }}>Theme</span>
      {(['onyx','forest','mist'] as ThemeKey[]).map(t => (
        <button
          key={t}
          onClick={() => changeTheme(t)}
          aria-pressed={theme === t}
          style={{
            border: `1px solid ${theme === t ? 'var(--accent)' : 'var(--line)'}`,
            background: theme === t ? 'var(--accent)' : 'var(--bg-2)',
            color: theme === t ? 'var(--bg)' : 'var(--ink-soft)',
            fontFamily: "'Cinzel', sans-serif",
            fontSize: '9.5px', letterSpacing: '.2em',
            padding: '7px 10px', textTransform: 'uppercase',
            fontWeight: theme === t ? 600 : 500,
            display: 'flex', alignItems: 'center', gap: 5,
            cursor: 'pointer', transition: 'all .25s',
          }}
        >
          <span style={{
            width: 8, height: 8, borderRadius: '50%',
            display: 'inline-block', background: swatchBg[t],
          }} />
          {t.charAt(0).toUpperCase() + t.slice(1)}
        </button>
      ))}
    </div>
  );
}
