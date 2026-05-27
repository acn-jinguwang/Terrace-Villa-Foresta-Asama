import { AsamaSilhouette } from '../motifs/AsamaSilhouette';
import type { Palette, Translation } from '../../types/content';

interface ClosingCTAProps {
  P: Palette;
  T: Translation;
}

export function ClosingCTA({ P, T }: ClosingCTAProps) {
  const bookingUrl = import.meta.env.VITE_BOOKING_URL || 'https://book.foresta-asama.example.com/';

  return (
    <section
      style={{
        background: P.accent,
        padding: '100px 0 0',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Subtle texture overlay */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'repeating-linear-gradient(45deg, rgba(255,255,255,0.02) 0 12px, transparent 12px 24px)',
          pointerEvents: 'none',
        }}
      />

      <div className="wrap" style={{ position: 'relative', zIndex: 1, paddingBottom: 80 }}>
        {/* Content */}
        <div style={{ maxWidth: 640 }}>
          <p
            className="mono-label"
            style={{ color: 'rgba(247,243,232,0.6)', marginBottom: 20 }}
          >
            Reserve
          </p>
          <h2
            className="jpserif"
            style={{
              fontSize: 'clamp(36px, 5vw, 72px)',
              color: '#f7f3e8',
              lineHeight: 1.2,
              marginBottom: 4,
            }}
          >
            {T.ctaTitle}
          </h2>
          <h2
            className="jpserif"
            style={{
              fontSize: 'clamp(36px, 5vw, 72px)',
              color: '#f7f3e8',
              lineHeight: 1.2,
              marginBottom: 28,
            }}
          >
            {T.ctaTitle2}
          </h2>
          <p
            style={{
              fontFamily: "'Shippori Mincho', serif",
              fontSize: 15,
              color: 'rgba(247,243,232,0.75)',
              lineHeight: 1.9,
              marginBottom: 44,
            }}
          >
            {T.ctaSub}
          </p>

          <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', alignItems: 'center' }}>
            <a
              href={bookingUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 10,
                padding: '16px 28px',
                fontFamily: "'Inter', sans-serif",
                fontSize: 11,
                letterSpacing: '0.28em',
                textTransform: 'uppercase',
                background: '#f7f3e8',
                color: P.accent,
                border: '1px solid #f7f3e8',
                textDecoration: 'none',
                fontWeight: 500,
                transition: 'all .35s ease',
                cursor: 'pointer',
              }}
            >
              {T.reserve} <span>→</span>
            </a>
            <a
              href="#"
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: 11,
                letterSpacing: '0.3em',
                textTransform: 'uppercase',
                color: 'rgba(247,243,232,0.7)',
                textDecoration: 'none',
                borderBottom: '1px solid rgba(247,243,232,0.3)',
                paddingBottom: 4,
                transition: 'color .3s, border-color .3s',
                cursor: 'pointer',
              }}
            >
              お問合せ
            </a>
          </div>
        </div>
      </div>

      {/* Asama silhouette at bottom */}
      <div style={{ position: 'relative' }}>
        <AsamaSilhouette color="#f7f3e8" opacity={0.12} height={200} />
      </div>
    </section>
  );
}
