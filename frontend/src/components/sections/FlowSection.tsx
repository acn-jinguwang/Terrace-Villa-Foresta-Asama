import type { Palette, Translation } from '../../types/content';

interface FlowSectionProps {
  P: Palette;
  T: Translation;
}

export function FlowSection({ P, T }: FlowSectionProps) {
  return (
    <section
      style={{
        background: P.bg,
        padding: '100px 0',
        borderBottom: `1px solid ${P.line}`,
      }}
    >
      <div className="wrap">
        {/* Header */}
        <div style={{ marginBottom: 64 }}>
          <p className="mono-label" style={{ color: P.inkMute, marginBottom: 14 }}>
            {T.flowEyebrow}
          </p>
          <h2
            className="jpserif"
            style={{
              fontSize: 'clamp(26px, 3.5vw, 44px)',
              color: P.ink,
              marginBottom: 16,
            }}
          >
            {T.flowTitle}
          </h2>
          <p
            style={{
              fontFamily: "'Shippori Mincho', serif",
              fontSize: 15,
              color: P.inkSoft,
              lineHeight: 1.9,
              maxWidth: 480,
            }}
          >
            {T.flowSub}
          </p>
        </div>

        {/* Steps */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: 1,
            background: P.line,
          }}
        >
          {T.flow.map((step) => (
            <div
              key={step.n}
              style={{
                background: P.bg,
                padding: '48px 40px',
                display: 'flex',
                flexDirection: 'column',
                gap: 16,
              }}
            >
              {/* Number */}
              <span
                className="display"
                style={{
                  fontSize: 32,
                  color: P.accent,
                  letterSpacing: '0.06em',
                  lineHeight: 1,
                }}
              >
                {step.n}
              </span>

              {/* Hairline */}
              <div className="hairline" style={{ width: 32 }} />

              {/* Title */}
              <h3
                className="jpserif"
                style={{
                  fontSize: 22,
                  color: P.ink,
                }}
              >
                {step.t}
              </h3>

              {/* Description */}
              <p
                style={{
                  fontFamily: "'Shippori Mincho', serif",
                  fontSize: 14,
                  color: P.inkSoft,
                  lineHeight: 1.85,
                  flex: 1,
                }}
              >
                {step.d}
              </p>

              {/* CTA */}
              <a
                href="#"
                className="lnk"
                style={{ alignSelf: 'flex-start', cursor: 'pointer' }}
              >
                {step.cta}
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
