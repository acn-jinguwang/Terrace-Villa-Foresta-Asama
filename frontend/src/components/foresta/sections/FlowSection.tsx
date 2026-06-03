'use client';
import { useLanguage } from '@/contexts/LanguageContext';

interface L { zh: string; ja: string; en: string }
interface FlowStep {
  id: number; step_number: number;
  step_label: L; title: L; description: L; cta_label: L;
  cta_url: string; is_external: boolean;
}
interface FlowData { eyebrow: L; title: L; subtitle: L; steps: FlowStep[] }

export default function FlowSection({ data, reservationUrl }: { data: FlowData; reservationUrl?: string }) {
  const { language } = useLanguage();
  const t = (o: L) => o[language as keyof L] ?? o.ja ?? '';

  return (
    <section className="f-section-xl" style={{ padding: '160px 0 120px' }}>
      <div className="f-wrap">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.4fr', gap: 80, marginBottom: 80 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 26 }}>
              <span style={{ width: 36, height: 1, background: 'var(--accent)', display: 'block' }} />
              <span className="f-display" style={{ fontSize: 10, color: 'var(--accent)', letterSpacing: '.32em' }}>{t(data.eyebrow)}</span>
            </div>
            <h2 className="f-jp" style={{ fontSize: 'clamp(32px,4vw,52px)', lineHeight: 1.15, color: 'var(--ink)', fontWeight: 500 }}>{t(data.title)}</h2>
          </div>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <p style={{ fontSize: 15, lineHeight: 1.95, color: 'var(--ink-soft)', maxWidth: 480, fontWeight: 300 }}>{t(data.subtitle)}</p>
          </div>
        </div>

        <div className="f-flow-grid" style={{ display: 'grid', gridTemplateColumns: `repeat(${Math.min(data.steps.length, 3)}, 1fr)`, borderTop: '1px solid var(--line)', borderBottom: '1px solid var(--line)' }}>
          {data.steps.map((step, i) => {
            const url = step.is_external ? (step.cta_url || reservationUrl || '#') : (step.cta_url || '#');
            return (
              <a
                key={step.id}
                href={url}
                target={step.is_external ? '_blank' : undefined}
                rel={step.is_external ? 'noopener noreferrer' : undefined}
                className="f-flow-cell"
                style={{
                  padding: '40px 40px 36px',
                  borderLeft: i > 0 ? '1px solid var(--line)' : 'none',
                  minHeight: 280, display: 'flex', flexDirection: 'column',
                  textDecoration: 'none', transition: 'background .3s',
                }}
                onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-2)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
              >
                <div className="f-serif" style={{ fontSize: 64, color: 'var(--accent)', lineHeight: 1, fontStyle: 'italic', marginBottom: 30 }}>
                  {String(step.step_number).padStart(2, '0')}
                </div>
                <h3 className="f-jp" style={{ fontSize: 28, color: 'var(--ink)', fontWeight: 500, marginBottom: 14 }}>{t(step.title)}</h3>
                <p className="f-jp" style={{ fontSize: 14, color: 'var(--ink-soft)', lineHeight: 1.9, marginBottom: 'auto' }}>{t(step.description)}</p>
                <div style={{ marginTop: 32, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span className="mono-label" style={{ color: 'var(--ink)' }}>{t(step.cta_label)}</span>
                  <span className="f-serif" style={{ color: 'var(--accent)', fontSize: 20, transition: 'transform .35s ease' }}>
                    {step.is_external ? '↗' : '→'}
                  </span>
                </div>
              </a>
            );
          })}
        </div>
      </div>
    </section>
  );
}
