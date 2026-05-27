import type { Palette, Translation } from '../../types/content';

interface PlansSectionProps {
  P: Palette;
  T: Translation;
}

export function PlansSection({ P, T }: PlansSectionProps) {
  return (
    <section
      id="plans"
      style={{
        background: P.bg2,
        padding: '100px 0',
        borderTop: `1px solid ${P.line}`,
      }}
    >
      <div className="wrap">
        {/* Header */}
        <div style={{ marginBottom: 56 }}>
          <p className="mono-label" style={{ color: P.inkMute, marginBottom: 14 }}>
            {T.plansEyebrow}
          </p>
          <h2
            className="jpserif"
            style={{
              fontSize: 'clamp(26px, 3.5vw, 44px)',
              color: P.ink,
              marginBottom: 12,
            }}
          >
            {T.plansTitle}
          </h2>
          <p
            style={{
              fontFamily: "'Shippori Mincho', serif",
              fontSize: 15,
              color: P.inkSoft,
            }}
          >
            {T.plansSub}
          </p>
        </div>

        {/* Plans list */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 1, background: P.line }}>
          {T.plans.map((plan) => (
            <div
              key={plan.n}
              style={{
                background: P.bg2,
                display: 'grid',
                gridTemplateColumns: '80px 280px 1fr auto auto',
                gap: 24,
                alignItems: 'center',
                padding: '32px 36px',
                transition: 'background .3s',
                cursor: 'pointer',
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLDivElement).style.background = P.paper;
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLDivElement).style.background = P.bg2;
              }}
            >
              {/* Number */}
              <span
                className="display"
                style={{
                  fontSize: 28,
                  color: P.accent,
                  letterSpacing: '0.04em',
                }}
              >
                {plan.n}
              </span>

              {/* Plan image placeholder */}
              <div
                className="ph"
                data-label={plan.label}
                style={{ height: 90 }}
              />

              {/* Info */}
              <div>
                {/* Tag */}
                <span
                  className="mono-label"
                  style={{
                    display: 'inline-block',
                    background: P.accent2,
                    color: '#fff',
                    padding: '2px 7px',
                    marginBottom: 10,
                    fontSize: 9,
                  }}
                >
                  {plan.tag}
                </span>
                <h3
                  className="jpserif"
                  style={{ fontSize: 20, color: P.ink, marginBottom: 6 }}
                >
                  {plan.t}
                </h3>
                <p
                  style={{
                    fontFamily: "'Inter', sans-serif",
                    fontSize: 12,
                    color: P.inkMute,
                    letterSpacing: '0.06em',
                  }}
                >
                  {plan.d}
                </p>
              </div>

              {/* Price */}
              <div style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                <p
                  className="mono-label"
                  style={{ color: P.inkMute, marginBottom: 4 }}
                >
                  FROM
                </p>
                <p
                  style={{
                    fontFamily: "'Cinzel', serif",
                    fontSize: 16,
                    color: P.gold,
                    letterSpacing: '0.06em',
                  }}
                >
                  {plan.p}
                </p>
              </div>

              {/* Arrow */}
              <span
                style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: 18,
                  color: P.accent,
                  transition: 'transform .3s',
                }}
              >
                →
              </span>
            </div>
          ))}
        </div>

        {/* Footer CTA */}
        <div style={{ marginTop: 48, textAlign: 'center' }}>
          <a href="#booking" className="btn ghost" style={{ cursor: 'pointer' }}>
            すべてのプランを見る <span className="arr">→</span>
          </a>
        </div>
      </div>
    </section>
  );
}
