import { useState } from 'react';
import type { Palette, PaletteKey } from '../../types/content';
import { PALETTES } from '../../styles/palettes';

interface Props {
  P: Palette;
  current: PaletteKey;
  onChange: (k: PaletteKey) => void;
}

function ThemePickerInner({ P, current, onChange }: Props) {
  const [open, setOpen] = useState(false);
  const entries = Object.entries(PALETTES) as [PaletteKey, Palette][];

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 24,
        left: 24,
        zIndex: 9999,
        fontFamily: "'Inter', sans-serif",
      }}
    >
      {/* Toggle button */}
      <button
        onClick={() => setOpen(!open)}
        title="Theme Picker (dev only)"
        style={{
          width: 44,
          height: 44,
          borderRadius: '50%',
          border: `1px solid ${P.line}`,
          background: P.paper,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 2px 12px rgba(0,0,0,0.12)',
        }}
        aria-label="Toggle theme picker"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <circle cx="8" cy="8" r="6" stroke={P.inkMute} strokeWidth="1.2" />
          <path
            d="M8 2 C5.2 2 3 4.2 3 8 C3 11.8 5.2 14 8 14 L8 2Z"
            fill={P.accent}
            opacity="0.7"
          />
        </svg>
      </button>

      {/* Panel */}
      {open && (
        <div
          style={{
            position: 'absolute',
            bottom: 52,
            left: 0,
            background: P.paper,
            border: `1px solid ${P.line}`,
            padding: 20,
            minWidth: 200,
            boxShadow: '0 4px 24px rgba(0,0,0,0.12)',
          }}
        >
          <p
            style={{
              fontSize: 9,
              letterSpacing: '0.3em',
              textTransform: 'uppercase',
              color: P.inkMute,
              marginBottom: 14,
            }}
          >
            Theme · Dev Only
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {entries.map(([key, palette]) => (
              <button
                key={key}
                onClick={() => onChange(key)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  background: current === key ? P.bg2 : 'transparent',
                  border: `1px solid ${current === key ? P.accent : P.line}`,
                  padding: '8px 12px',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all .2s',
                }}
              >
                {/* Swatches */}
                <div style={{ display: 'flex', gap: 3 }}>
                  {palette.swatch.map((color) => (
                    <div
                      key={color}
                      style={{
                        width: 12,
                        height: 12,
                        borderRadius: '50%',
                        background: color,
                        border: `1px solid ${P.line}`,
                      }}
                    />
                  ))}
                </div>

                {/* Name */}
                <span
                  style={{
                    fontSize: 11,
                    letterSpacing: '0.1em',
                    color: current === key ? P.accent : P.inkSoft,
                    fontWeight: current === key ? 600 : 400,
                  }}
                >
                  {palette.name}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export function ThemePicker(props: Props) {
  if (!import.meta.env.DEV) return null;
  return <ThemePickerInner {...props} />;
}
