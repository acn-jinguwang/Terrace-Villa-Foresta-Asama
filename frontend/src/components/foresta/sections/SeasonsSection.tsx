'use client';
import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';

interface L { zh: string; ja: string; en: string }
interface SeasonMeta { season: string; jp_label: string; en_label: string; sub: L; caption: L; main_image_url: string }

export default function SeasonsSection({ data }: { data: SeasonMeta[] }) {
  const { language } = useLanguage();
  const t = (o: L) => o[language as keyof L] ?? o.ja ?? '';
  const [active, setActive] = useState(0);
  const current = data[active] ?? data[0];
  if (!current || !data.length) return null;

  return (
    <section className="f-section-lg" style={{ padding: '140px 0', background: 'var(--bg-2)', position: 'relative', overflow: 'hidden', transition: 'background .6s ease' }}>
      <div className="f-wrap">
        <div className="f-seasons-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 80, alignItems: 'center' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 26 }}>
              <span style={{ width: 36, height: 1, background: 'var(--accent)', display: 'block' }} />
              <span className="f-display" style={{ fontSize: 10, color: 'var(--accent)', letterSpacing: '.32em' }}>四季の体験</span>
            </div>
            <h2 className="f-jp" style={{ fontSize: 'clamp(32px,4vw,52px)', lineHeight: 1.15, color: 'var(--ink)', fontWeight: 500, marginBottom: 52 }}>
              軽井沢、四季を楽しむ。
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {data.map((s, i) => (
                <button
                  key={s.season}
                  onClick={() => setActive(i)}
                  style={{
                    textAlign: 'left', border: 0, background: 'transparent', cursor: 'pointer',
                    padding: '18px 0', borderBottom: '1px solid var(--line)',
                    display: 'grid', gridTemplateColumns: '56px 1fr auto', alignItems: 'baseline', gap: 18,
                    transition: 'all .3s',
                  }}
                >
                  <span className="f-jp" style={{ fontSize: active === i ? 44 : 28, color: active === i ? 'var(--accent)' : 'var(--ink-mute)', fontWeight: 300, lineHeight: 1, transition: 'all .3s' }}>{s.jp_label}</span>
                  <div>
                    <div className="f-serif" style={{ fontSize: active === i ? 22 : 18, color: active === i ? 'var(--ink)' : 'var(--ink-soft)', fontStyle: 'italic', transition: 'all .3s' }}>{s.en_label}</div>
                    <div className="mono-label" style={{ marginTop: 4, color: active === i ? 'var(--ink-soft)' : 'var(--ink-mute)', transition: 'all .3s' }}>{t(s.sub)}</div>
                  </div>
                  <span style={{ fontSize: 14, color: active === i ? 'var(--accent)' : 'transparent', transition: 'all .3s' }}>●</span>
                </button>
              ))}
            </div>
          </div>
          <div className="f-seasons-visual" style={{ position: 'relative' }}>
            {current.main_image_url ? (
              <img src={current.main_image_url} alt={current.en_label} style={{ width: '100%', aspectRatio: '4/5', objectFit: 'cover' }} />
            ) : (
              <div className="f-ph" style={{ aspectRatio: '4/5' }} />
            )}
            <div style={{
              position: 'absolute', left: -32, bottom: -24,
              background: 'var(--paper)', padding: '28px 32px',
              maxWidth: 380, border: '1px solid var(--line-strong)',
              boxShadow: '0 20px 60px -20px rgba(0,0,0,0.5)', transition: 'background .6s ease',
            }}>
              <div className="f-serif" style={{ fontSize: 14, fontStyle: 'italic', color: 'var(--accent)', marginBottom: 10, letterSpacing: '.04em' }}>— {current.en_label}</div>
              <p className="f-jp" style={{ fontSize: 15, lineHeight: 1.95, color: 'var(--ink)', fontWeight: 400 }}>{t(current.caption)}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
