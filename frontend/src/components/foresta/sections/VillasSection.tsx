'use client';
import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';

interface L { zh: string; ja: string; en: string }
interface Villa { id: number; villa_key: string; name: L; spec: L; tag: L; description: L; main_image_url: string }

export default function VillasSection({ data }: { data: Villa[] }) {
  const { language } = useLanguage();
  const t = (o: L) => o[language as keyof L] ?? o.ja ?? '';
  const [active, setActive] = useState(0);
  const villa = data[active];
  if (!villa || !data.length) return null;

  return (
    <section className="f-section-lg" style={{ padding: '140px 0', background: 'var(--bg-2)', transition: 'background .6s ease' }}>
      <div className="f-wrap">
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 26 }}>
          <span style={{ width: 36, height: 1, background: 'var(--accent)', display: 'block' }} />
          <span className="f-display" style={{ fontSize: 10, color: 'var(--accent)', letterSpacing: '.32em' }}>Villas</span>
        </div>
        <div className="f-villas-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1.6fr', gap: 80, alignItems: 'start' }}>
          <div>
            <h2 className="f-jp" style={{ fontSize: 'clamp(28px,3.5vw,48px)', lineHeight: 1.2, color: 'var(--ink)', fontWeight: 500, marginBottom: 40 }}>
              四棟のヴィラ。
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {data.map((v, i) => (
                <button
                  key={v.id}
                  onClick={() => setActive(i)}
                  style={{
                    textAlign: 'left', border: 0, background: 'transparent', cursor: 'pointer',
                    padding: '16px 0', borderBottom: '1px solid var(--line)',
                    display: 'grid', gridTemplateColumns: '1fr auto', alignItems: 'center', gap: 18,
                    transition: 'all .3s',
                  }}
                >
                  <div>
                    <div className="f-jp" style={{ fontSize: active === i ? 36 : 24, color: active === i ? 'var(--accent)' : 'var(--ink-mute)', transition: 'all .3s', fontWeight: 300, lineHeight: 1 }}>{t(v.name)}</div>
                    {active === i && <div className="mono-label" style={{ marginTop: 4, color: 'var(--ink-soft)' }}>{t(v.spec)}</div>}
                  </div>
                  <span style={{ fontSize: 14, color: active === i ? 'var(--accent)' : 'transparent', transition: 'all .3s' }}>●</span>
                </button>
              ))}
            </div>
          </div>
          <div style={{ position: 'relative' }}>
            {villa.main_image_url ? (
              <img src={villa.main_image_url} alt={t(villa.name)} style={{ width: '100%', aspectRatio: '4/5', objectFit: 'cover' }} />
            ) : (
              <div className="f-ph" style={{ aspectRatio: '4/5' }} />
            )}
            <div className="f-villa-detail" style={{
              position: 'absolute', left: -32, bottom: -24,
              background: 'var(--paper)', padding: '28px 32px',
              maxWidth: 360, border: '1px solid var(--line-strong)',
              boxShadow: '0 20px 60px -20px rgba(0,0,0,0.4)', transition: 'background .6s ease',
            }}>
              {t(villa.tag) && (
                <div className="f-display" style={{ fontSize: 9, color: 'var(--accent)', letterSpacing: '.4em', marginBottom: 8 }}>{t(villa.tag)}</div>
              )}
              <p className="f-jp" style={{ fontSize: 15, lineHeight: 1.9, color: 'var(--ink)', fontWeight: 400 }}>{t(villa.description)}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
