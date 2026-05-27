import { AsamaSilhouette } from '../motifs/AsamaSilhouette';
import type { Palette, Translation } from '../../types/content';

interface LocationSectionProps {
  P: Palette;
  T: Translation;
}

export function LocationSection({ P, T }: LocationSectionProps) {
  return (
    <section
      id="location"
      style={{
        background: P.bg,
        padding: '100px 0 0',
        borderTop: `1px solid ${P.line}`,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div className="wrap" style={{ position: 'relative', zIndex: 1 }}>
        {/* Header */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 64,
            alignItems: 'start',
            paddingBottom: 80,
          }}
        >
          {/* Left */}
          <div>
            <p className="mono-label" style={{ color: P.inkMute, marginBottom: 14 }}>
              {T.locEyebrow}
            </p>
            <h2
              className="jpserif"
              style={{
                fontSize: 'clamp(26px, 3.5vw, 48px)',
                color: P.ink,
                marginBottom: 20,
              }}
            >
              {T.locTitle}
            </h2>
            <p
              style={{
                fontFamily: "'Shippori Mincho', serif",
                fontSize: 15,
                color: P.inkSoft,
                lineHeight: 1.9,
                marginBottom: 36,
              }}
            >
              {T.locDesc}
            </p>
            <p
              className="mono-label"
              style={{ color: P.inkMute, marginBottom: 8 }}
            >
              {T.addr}
            </p>
          </div>

          {/* Right: Access table */}
          <div>
            <p
              className="mono-label"
              style={{ color: P.inkMute, marginBottom: 20 }}
            >
              Access
            </p>
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 1,
                background: P.line,
              }}
            >
              {T.access.map(([from, time]) => (
                <div
                  key={from}
                  style={{
                    background: P.bg,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '18px 24px',
                    gap: 16,
                  }}
                >
                  <span
                    className="jpserif"
                    style={{ fontSize: 15, color: P.inkSoft }}
                  >
                    {from}
                  </span>
                  <span
                    className="mono-label"
                    style={{ color: P.accent, whiteSpace: 'nowrap' }}
                  >
                    {time}
                  </span>
                </div>
              ))}
            </div>

            {/* Map placeholder */}
            <div
              className="ph"
              data-label="Map · Karuizawa"
              style={{ height: 200, marginTop: 2 }}
            />
          </div>
        </div>
      </div>

      {/* Asama at bottom */}
      <div style={{ position: 'relative', height: 180, marginTop: 0 }}>
        <AsamaSilhouette color={P.ink} opacity={0.06} height={180} />
      </div>
    </section>
  );
}
