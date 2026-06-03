'use client';
import { useLanguage } from '@/contexts/LanguageContext';

interface L { zh: string; ja: string; en: string }
interface CTAData {
  eyebrow: L; title_line1: L; title_line2: L; subtitle: L;
  primary_label: L; primary_url: string;
  secondary_label: L; secondary_url: string;
}

export default function ClosingCTA({ data }: { data: CTAData }) {
  const { language } = useLanguage();
  const t = (o: L) => o[language as keyof L] ?? o.ja ?? '';

  return (
    <section className="f-section-lg" style={{ padding: '140px 0', background: 'var(--bg)', position: 'relative', overflow: 'hidden', borderTop: '1px solid var(--line)' }}>
      <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: 300, pointerEvents: 'none' }}>
        <svg viewBox="0 0 1600 280" preserveAspectRatio="none" style={{ height: 300, opacity: .08, width: '100%' }} aria-hidden="true">
          <path fill="var(--accent)" d="M0,280 L0,210 C 120,200 220,190 320,170 C 420,148 500,118 560,98 L 640,52 L 720,12 L 800,0 L 880,18 L 960,62 L 1040,108 C 1110,138 1200,162 1300,182 C 1400,200 1500,212 1600,218 L 1600,280 Z" />
        </svg>
      </div>
      <div className="f-wrap" style={{ textAlign: 'center', position: 'relative' }}>
        <span className="f-display" style={{ color: 'var(--gold)', letterSpacing: '.5em', fontSize: 10.5 }}>{t(data.eyebrow)}</span>
        <h2 className="f-jp" style={{ marginTop: 30, fontSize: 'clamp(40px,5.5vw,78px)', fontWeight: 500, lineHeight: 1.08, color: 'var(--ink)' }}>
          {t(data.title_line1)}<br />
          <span style={{ color: 'var(--gold)' }}>{t(data.title_line2)}</span>
        </h2>
        <p className="f-jp" style={{ margin: '32px auto 0', fontSize: 15, color: 'var(--ink-soft)', lineHeight: 1.9, maxWidth: 520 }}>{t(data.subtitle)}</p>
        <div className="f-cta-row" style={{ marginTop: 56, display: 'flex', gap: 18, justifyContent: 'center', alignItems: 'center', flexWrap: 'wrap' }}>
          {data.primary_url && (
            <a href={data.primary_url} target="_blank" rel="noopener noreferrer" className="f-btn">
              {t(data.primary_label)} <span>↗</span>
            </a>
          )}
          {data.secondary_url && (
            <a
              href={data.secondary_url}
              style={{ color: 'var(--ink)', fontFamily: "'Cinzel',sans-serif", fontSize: 11, letterSpacing: '.3em', textTransform: 'uppercase', borderBottom: '1px solid var(--line-strong)', padding: '14px 0', textDecoration: 'none', transition: 'color .3s, border-color .3s' }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = 'var(--accent)'; (e.currentTarget as HTMLElement).style.borderColor = 'var(--accent)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'var(--ink)'; (e.currentTarget as HTMLElement).style.borderColor = 'var(--line-strong)'; }}
            >
              {t(data.secondary_label)}
            </a>
          )}
        </div>
      </div>
    </section>
  );
}
