import type { Palette, Translation } from '../../types/content';

interface FooterProps {
  P: Palette;
  T: Translation;
}

export function Footer({ P, T }: FooterProps) {
  const year = new Date().getFullYear();

  return (
    <footer
      style={{
        background: P.paper,
        borderTop: `1px solid ${P.line}`,
        padding: '56px 0 36px',
      }}
    >
      <div className="wrap">
        {/* Top row */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'auto 1fr auto',
            gap: 48,
            alignItems: 'start',
            marginBottom: 48,
          }}
        >
          {/* Logo */}
          <div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                marginBottom: 12,
              }}
            >
              <svg width="24" height="24" viewBox="0 0 40 40" aria-hidden="true">
                <path
                  d="M2 34 L20 8 L38 34 Z"
                  fill="none"
                  stroke={P.accent}
                  strokeWidth="1.4"
                />
                <path
                  d="M10 34 L20 20 L30 34"
                  fill="none"
                  stroke={P.accent2}
                  strokeWidth="1.2"
                />
                <line x1="2" y1="36" x2="38" y2="36" stroke={P.ink} strokeWidth=".6" />
              </svg>
              <span
                className="display"
                style={{ fontSize: 11, letterSpacing: '0.16em', color: P.ink }}
              >
                Foresta Asama
              </span>
            </div>
            <p
              className="mono-label"
              style={{ color: P.inkMute, lineHeight: 1.6 }}
            >
              {T.footerTag}
            </p>
          </div>

          {/* Nav links */}
          <nav
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '12px 32px',
              paddingTop: 4,
            }}
          >
            {Object.values(T.nav).map((label) => (
              <a
                key={label}
                href="#"
                style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: 10,
                  letterSpacing: '0.26em',
                  textTransform: 'uppercase',
                  color: P.inkSoft,
                  textDecoration: 'none',
                  transition: 'color .3s',
                  cursor: 'pointer',
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLAnchorElement).style.color = P.accent;
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLAnchorElement).style.color = P.inkSoft;
                }}
              >
                {label}
              </a>
            ))}
          </nav>

          {/* Address */}
          <div style={{ textAlign: 'right' }}>
            <p
              className="mono-label"
              style={{ color: P.inkMute, lineHeight: 1.7, whiteSpace: 'nowrap' }}
            >
              {T.addr}
            </p>
          </div>
        </div>

        {/* Hairline */}
        <div className="hairline" style={{ marginBottom: 24 }} />

        {/* Bottom row */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 12,
          }}
        >
          <p
            className="mono-label"
            style={{ color: P.inkMute }}
          >
            © {year} Terrace Villa Foresta Asama. {T.rights}
          </p>
          <div style={{ display: 'flex', gap: 20 }}>
            {['プライバシーポリシー', '特定商取引法', 'Cookie'].map((item) => (
              <a
                key={item}
                href="#"
                style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: 9,
                  letterSpacing: '0.2em',
                  textTransform: 'uppercase',
                  color: P.inkMute,
                  textDecoration: 'none',
                  transition: 'color .3s',
                  cursor: 'pointer',
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLAnchorElement).style.color = P.ink;
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLAnchorElement).style.color = P.inkMute;
                }}
              >
                {item}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
