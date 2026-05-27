import { useState, useEffect } from 'react';
import type { Palette, Translation } from '../../types/content';

interface HeaderProps {
  P: Palette;
  T: Translation;
  lang: string;
  setLang: (l: string) => void;
}

export function Header({ P, T }: HeaderProps) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const bookingUrl = import.meta.env.VITE_BOOKING_URL || 'https://book.foresta-asama.example.com/';

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const navItems = [
    { label: T.nav.stay, href: '#villas' },
    { label: T.nav.plans, href: '#plans' },
    { label: T.nav.around, href: '#location' },
    { label: T.nav.about, href: '#about' },
    { label: T.nav.contact, href: '#contact' },
  ];

  return (
    <header
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        background: scrolled ? P.bg : 'transparent',
        borderBottom: scrolled ? `1px solid ${P.line}` : '1px solid transparent',
        transition: 'background .4s ease, border-color .4s ease',
      }}
    >
      <div
        className="wrap"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: 64,
        }}
      >
        {/* Logo */}
        <a
          href="/"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            textDecoration: 'none',
            color: P.ink,
            cursor: 'pointer',
          }}
        >
          {/* Mountain mark */}
          <svg width="28" height="28" viewBox="0 0 40 40" aria-hidden="true">
            <path d="M2 34 L20 8 L38 34 Z" fill="none" stroke={P.accent} strokeWidth="1.4" />
            <path d="M10 34 L20 20 L30 34" fill="none" stroke={P.accent2} strokeWidth="1.2" />
            <line x1="2" y1="36" x2="38" y2="36" stroke={P.ink} strokeWidth=".6" />
          </svg>
          <span
            className="display"
            style={{ fontSize: 11, letterSpacing: '0.18em', color: P.ink }}
          >
            Foresta Asama
          </span>
        </a>

        {/* Desktop nav */}
        <nav
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 32,
          }}
          aria-label="Main navigation"
        >
          {navItems.map((item) => (
            <a
              key={item.label}
              href={item.href}
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: 10,
                letterSpacing: '0.28em',
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
              {item.label}
            </a>
          ))}

          {/* Language switcher — only ja shown */}
          <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
            {(['ja'] as const).map((l) => (
              <button
                key={l}
                style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: 9,
                  letterSpacing: '0.24em',
                  textTransform: 'uppercase',
                  color: P.ink,
                  background: 'transparent',
                  border: 'none',
                  padding: '2px 6px',
                  cursor: 'pointer',
                  opacity: 1,
                  fontWeight: 600,
                }}
              >
                {l}
              </button>
            ))}
            {/* en and zh commented out */}
            {/* <button>en</button> */}
            {/* <button>zh</button> */}
          </div>

          {/* Reserve button */}
          <a
            href={bookingUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn"
            style={{ padding: '10px 18px', fontSize: 10, cursor: 'pointer' }}
          >
            {T.reserve}
          </a>
        </nav>

        {/* Mobile hamburger */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          style={{
            display: 'none',
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            padding: 8,
            color: P.ink,
          }}
          aria-label="Toggle menu"
          aria-expanded={menuOpen}
        >
          <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
            {menuOpen ? (
              <>
                <line x1="4" y1="4" x2="18" y2="18" stroke={P.ink} strokeWidth="1.5" />
                <line x1="18" y1="4" x2="4" y2="18" stroke={P.ink} strokeWidth="1.5" />
              </>
            ) : (
              <>
                <line x1="3" y1="7" x2="19" y2="7" stroke={P.ink} strokeWidth="1.5" />
                <line x1="3" y1="12" x2="19" y2="12" stroke={P.ink} strokeWidth="1.5" />
                <line x1="3" y1="17" x2="19" y2="17" stroke={P.ink} strokeWidth="1.5" />
              </>
            )}
          </svg>
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div
          style={{
            background: P.bg,
            borderTop: `1px solid ${P.line}`,
            padding: '24px 24px 32px',
          }}
        >
          {navItems.map((item) => (
            <a
              key={item.label}
              href={item.href}
              onClick={() => setMenuOpen(false)}
              style={{
                display: 'block',
                fontFamily: "'Inter', sans-serif",
                fontSize: 11,
                letterSpacing: '0.28em',
                textTransform: 'uppercase',
                color: P.inkSoft,
                textDecoration: 'none',
                padding: '14px 0',
                borderBottom: `1px solid ${P.line}`,
                cursor: 'pointer',
              }}
            >
              {item.label}
            </a>
          ))}
          <a
            href={bookingUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn"
            style={{ marginTop: 24, cursor: 'pointer' }}
          >
            {T.reserve}
          </a>
        </div>
      )}
    </header>
  );
}
