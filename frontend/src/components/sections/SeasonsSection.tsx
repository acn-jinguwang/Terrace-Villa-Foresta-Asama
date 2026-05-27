import { useState } from 'react';
import type { Palette, Translation } from '../../types/content';

interface SeasonsSectionProps {
  P: Palette;
  T: Translation;
}

export function SeasonsSection({ P, T }: SeasonsSectionProps) {
  const [activeSeason, setActiveSeason] = useState(0);
  const season = T.seasons[activeSeason];

  const seasonColors: Record<string, string> = {
    spring: '#a78a4e',
    summer: '#2f4a35',
    autumn: '#b3593b',
    winter: '#4a5d68',
  };

  return (
    <section
      style={{
        background: P.bg,
        padding: '100px 0',
        borderTop: `1px solid ${P.line}`,
      }}
    >
      <div className="wrap">
        {/* Header */}
        <div style={{ marginBottom: 56 }}>
          <p className="mono-label" style={{ color: P.inkMute, marginBottom: 14 }}>
            {T.seasonEyebrow}
          </p>
          <h2
            className="jpserif"
            style={{ fontSize: 'clamp(26px, 3.5vw, 44px)', color: P.ink }}
          >
            {T.seasonTitle}
          </h2>
        </div>

        {/* Season tabs */}
        <div
          style={{
            display: 'flex',
            gap: 0,
            borderBottom: `1px solid ${P.line}`,
            marginBottom: 48,
          }}
        >
          {T.seasons.map((s, i) => (
            <button
              key={s.key}
              onClick={() => setActiveSeason(i)}
              style={{
                flex: 1,
                background: 'transparent',
                border: 'none',
                borderBottom:
                  activeSeason === i
                    ? `2px solid ${seasonColors[s.key] || P.accent}`
                    : '2px solid transparent',
                padding: '16px 8px',
                cursor: 'pointer',
                transition: 'all .3s',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 4,
              }}
            >
              <span
                className="jpserif"
                style={{
                  fontSize: 24,
                  color: activeSeason === i ? seasonColors[s.key] || P.accent : P.inkMute,
                  transition: 'color .3s',
                }}
              >
                {s.jp}
              </span>
              <span
                className="mono-label"
                style={{
                  color: activeSeason === i ? P.ink : P.inkMute,
                  transition: 'color .3s',
                }}
              >
                {s.en}
              </span>
            </button>
          ))}
        </div>

        {/* Active season content */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 48,
            alignItems: 'center',
          }}
        >
          {/* Left: Photo placeholder */}
          <div
            className="ph"
            data-label={`${season.jp} · ${season.sub}`}
            style={{ height: 400 }}
          />

          {/* Right: Text */}
          <div>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 12,
                marginBottom: 24,
              }}
            >
              <span
                className="jpserif"
                style={{
                  fontSize: 56,
                  color: seasonColors[season.key] || P.accent,
                  lineHeight: 1,
                }}
              >
                {season.jp}
              </span>
              <div>
                <div
                  className="display"
                  style={{ fontSize: 10, color: P.inkMute, marginBottom: 4 }}
                >
                  {season.en}
                </div>
                <div
                  className="jpserif"
                  style={{ fontSize: 15, color: P.inkSoft }}
                >
                  {season.sub}
                </div>
              </div>
            </div>

            <div className="hairline" style={{ marginBottom: 28, width: 48 }} />

            <p
              style={{
                fontFamily: "'Shippori Mincho', serif",
                fontSize: 16,
                color: P.inkSoft,
                lineHeight: 2,
              }}
            >
              {season.desc}
            </p>

            <a
              href="#"
              className="lnk"
              style={{ display: 'inline-block', marginTop: 32, cursor: 'pointer' }}
            >
              {season.jp}の体験を見る
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
