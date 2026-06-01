'use client';
import { useLanguage } from '@/contexts/LanguageContext';

interface L { zh: string; ja: string; en: string }
interface Plan {
  id: number; plan_key: string; tag: L; step_number_text: string;
  title: L; description: L; price_text: string;
  main_image_url: string; cta_url: string; is_external: boolean;
}

export default function PlansSection({ data, reservationUrl }: { data: Plan[]; reservationUrl?: string }) {
  const { language } = useLanguage();
  const t = (o: L) => o[language as keyof L] ?? o.ja ?? '';
  if (!data.length) return null;

  return (
    <section style={{ padding: '140px 0', background: 'var(--bg)', transition: 'background .6s ease' }}>
      <div className="f-wrap">
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 26 }}>
          <span style={{ width: 36, height: 1, background: 'var(--accent)', display: 'block' }} />
          <span className="f-display" style={{ fontSize: 10, color: 'var(--accent)', letterSpacing: '.32em' }}>Plans</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: `repeat(${Math.min(data.length, 3)}, 1fr)`, gap: 32, marginTop: 60 }}>
          {data.map(p => {
            const url = p.is_external ? (p.cta_url || reservationUrl || '#') : (p.cta_url || '#');
            return (
              <div
                key={p.id}
                style={{ border: '1px solid var(--line)', background: 'var(--paper)', transition: 'border-color .3s, background .6s ease' }}
                onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--line-strong)')}
                onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--line)')}
              >
                {p.main_image_url ? (
                  <img src={p.main_image_url} alt={t(p.title)} style={{ width: '100%', aspectRatio: '16/9', objectFit: 'cover' }} />
                ) : (
                  <div className="f-ph" style={{ aspectRatio: '16/9' }} />
                )}
                <div style={{ padding: 32 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 16 }}>
                    <span className="f-display" style={{ fontSize: 9, color: 'var(--accent)', letterSpacing: '.3em' }}>{t(p.tag)}</span>
                    <span className="f-serif" style={{ fontSize: 28, color: 'var(--line-strong)', lineHeight: 1 }}>{p.step_number_text}</span>
                  </div>
                  <h3 className="f-jp" style={{ fontSize: 22, color: 'var(--ink)', fontWeight: 500, marginBottom: 12 }}>{t(p.title)}</h3>
                  <p style={{ fontSize: 14, color: 'var(--ink-soft)', lineHeight: 1.85, marginBottom: 20 }}>{t(p.description)}</p>
                  {p.price_text && (
                    <div className="f-serif" style={{ fontSize: 20, color: 'var(--accent)', marginBottom: 24 }}>{p.price_text}</div>
                  )}
                  <a
                    href={url}
                    target={p.is_external ? '_blank' : undefined}
                    rel={p.is_external ? 'noopener noreferrer' : undefined}
                    className="f-btn" style={{ fontSize: 10 }}
                  >
                    詳しく見る <span>→</span>
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
