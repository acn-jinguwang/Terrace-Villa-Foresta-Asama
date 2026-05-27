import { AsamaSilhouette } from '../motifs/AsamaSilhouette';
import type { Palette, Translation } from '../../types/content';

interface HeroProps {
  P: Palette;
  T: Translation;
  showAsama?: boolean;
}

export function Hero({ P, T, showAsama = true }: HeroProps) {
  return (
    <section
      style={{
        position: 'relative',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-end',
        overflow: 'hidden',
        background: P.bg2,
      }}
    >
      {/* Background placeholder */}
      <div
        className="ph dark"
        data-label="Hero · Forest Photography"
        style={{
          position: 'absolute',
          inset: 0,
          background: `linear-gradient(180deg, ${P.bg2} 0%, ${P.paper} 100%)`,
        }}
      />

      {/* Drift animation overlay */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: `radial-gradient(ellipse at 60% 40%, rgba(47,74,53,0.08) 0%, transparent 70%)`,
          animation: 'drift 18s ease-in-out infinite alternate',
        }}
      />

      {/* Mist layer */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: `linear-gradient(90deg, transparent, rgba(247,243,232,0.12), transparent)`,
          animation: 'mist 12s ease-in-out infinite',
          pointerEvents: 'none',
        }}
      />

      {/* Asama silhouette */}
      {showAsama && (
        <div className="asama">
          <AsamaSilhouette color={P.ink} opacity={0.07} height={260} />
        </div>
      )}

      {/* Content */}
      <div
        className="wrap"
        style={{
          position: 'relative',
          zIndex: 2,
          paddingBottom: 80,
          paddingTop: 140,
        }}
      >
        {/* Eyebrow */}
        <p
          className="mono-label rise d1"
          style={{ color: P.inkMute, marginBottom: 20 }}
        >
          {T.eyebrow}
        </p>

        {/* Title */}
        <h1
          className="jpserif rise d2"
          style={{
            fontSize: 'clamp(44px, 6.5vw, 92px)',
            lineHeight: 1.18,
            color: P.ink,
            marginBottom: 8,
          }}
        >
          {T.heroTitleA}
        </h1>
        <h1
          className="jpserif rise d3"
          style={{
            fontSize: 'clamp(44px, 6.5vw, 92px)',
            lineHeight: 1.18,
            color: P.ink,
            marginBottom: 28,
          }}
        >
          {T.heroTitleB}
        </h1>

        {/* Sub */}
        <p
          className="rise d4"
          style={{
            fontFamily: "'Shippori Mincho', serif",
            fontSize: 'clamp(14px, 1.6vw, 18px)',
            color: P.inkSoft,
            lineHeight: 1.85,
            maxWidth: 480,
            marginBottom: 40,
          }}
        >
          {T.heroSub}
        </p>

        {/* CTA row */}
        <div
          className="rise d5"
          style={{ display: 'flex', alignItems: 'center', gap: 28, flexWrap: 'wrap' }}
        >
          <a
            href="#booking"
            className="btn accent"
            style={{ cursor: 'pointer' }}
          >
            {T.reserve} <span className="arr">→</span>
          </a>
          <a href="#villas" className="lnk" style={{ cursor: 'pointer' }}>
            {T.villasEyebrow}
          </a>
        </div>
      </div>

      {/* Bottom gradient fade */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: 200,
          background: `linear-gradient(to bottom, transparent, ${P.bg})`,
          pointerEvents: 'none',
          zIndex: 1,
        }}
      />
    </section>
  );
}
