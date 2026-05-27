import { useState } from 'react';
import type { Palette, Translation } from '../../types/content';

interface VillasSectionProps {
  P: Palette;
  T: Translation;
}

export function VillasSection({ P, T }: VillasSectionProps) {
  const [activeIdx, setActiveIdx] = useState(0);

  return (
    <section
      id="villas"
      style={{
        background: P.bg2,
        padding: '100px 0',
      }}
    >
      <div className="wrap">
        {/* Header */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
            marginBottom: 56,
            flexWrap: 'wrap',
            gap: 20,
          }}
        >
          <div>
            <p className="mono-label" style={{ color: P.inkMute, marginBottom: 14 }}>
              {T.villasEyebrow}
            </p>
            <h2
              className="jpserif"
              style={{ fontSize: 'clamp(26px, 3.5vw, 44px)', color: P.ink }}
            >
              {T.villasTitle}
            </h2>
          </div>
          <a href="#" className="lnk" style={{ cursor: 'pointer' }}>
            すべてのヴィラ
          </a>
        </div>

        {/* Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: 2,
          }}
        >
          {T.villas.map((villa, i) => (
            <div
              key={villa.name}
              onClick={() => setActiveIdx(i)}
              style={{
                cursor: 'pointer',
                background: activeIdx === i ? P.paper : P.bg,
                border: `1px solid ${activeIdx === i ? P.accent : P.line}`,
                transition: 'all .3s ease',
                overflow: 'hidden',
              }}
              onMouseEnter={(e) => {
                if (activeIdx !== i) {
                  (e.currentTarget as HTMLDivElement).style.background = P.paper;
                }
              }}
              onMouseLeave={(e) => {
                if (activeIdx !== i) {
                  (e.currentTarget as HTMLDivElement).style.background = P.bg;
                }
              }}
            >
              {/* Photo placeholder */}
              <div
                className="ph"
                data-label={villa.label}
                style={{ height: 220 }}
              />

              {/* Content */}
              <div style={{ padding: '28px 28px 32px' }}>
                {/* Tag */}
                <span
                  className="mono-label"
                  style={{
                    display: 'inline-block',
                    background: P.accent,
                    color: P.paper,
                    padding: '3px 8px',
                    marginBottom: 14,
                    fontSize: 9,
                  }}
                >
                  {villa.tag}
                </span>

                <h3
                  className="jpserif"
                  style={{ fontSize: 20, color: P.ink, marginBottom: 8 }}
                >
                  {villa.name}
                </h3>
                <p
                  style={{
                    fontFamily: "'Inter', sans-serif",
                    fontSize: 12,
                    color: P.inkMute,
                    letterSpacing: '0.06em',
                    marginBottom: 20,
                  }}
                >
                  {villa.spec}
                </p>

                <a
                  href="#"
                  className="lnk"
                  onClick={(e) => e.stopPropagation()}
                  style={{ cursor: 'pointer' }}
                >
                  詳細を見る
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
