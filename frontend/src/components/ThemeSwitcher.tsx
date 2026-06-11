'use client';
import { useTheme } from '@/hooks/useTheme';
import { usePathname } from 'next/navigation';

const OPTIONS = [
  { key: 'onyx',   label: 'Onyx',   sw: 'linear-gradient(135deg, #0d0d0b 50%, #c9a96e 50%)' },
  { key: 'forest', label: 'Forest', sw: 'linear-gradient(135deg, #f1ede2 50%, #2f4a35 50%)' },
  { key: 'mist',   label: 'Mist',   sw: 'linear-gradient(135deg, #1a2028 50%, #9a7a55 50%)' },
] as const;

export function ThemeSwitcher() {
  const { theme, changeTheme } = useTheme();
  const pathname = usePathname() ?? '';

  // Admin ページでは非表示
  if (pathname.includes('/admin')) return null;

  return (
    <div
      className="theme-switcher"
      role="region"
      aria-label="テーマ選択"
      style={{ zIndex: 9999 }}
    >
      <span className="ts-label">Theme</span>
      {OPTIONS.map(o => (
        <button
          key={o.key}
          onClick={() => changeTheme(o.key)}
          className={theme === o.key ? 'active' : ''}
          aria-pressed={theme === o.key}
          style={{ minWidth: 52 }}
        >
          <span className="swatch" style={{ background: o.sw }} />
          {o.label}
        </button>
      ))}
    </div>
  );
}
