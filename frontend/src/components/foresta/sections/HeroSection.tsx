'use client';
import { useLanguage } from '@/contexts/LanguageContext';

interface L { zh: string; ja: string; en: string }
interface HeroStat { id: number; value_text: string; label: L; display_order: number }
interface HeroData {
  background_image_url?: string;
  eyebrow: L; title_line1: L; title_line2: L; subtitle: L;
  stats: HeroStat[];
}

export default function HeroSection({ data, reservationUrl }: { data: HeroData; reservationUrl?: string }) {
  const { language } = useLanguage();
  const t = (o: L) => o[language as keyof L] ?? o.ja ?? '';

  return (
    <section id="top" style={{ position: 'relative', minHeight: '100vh', overflow: 'hidden', paddingTop: 90 }}>
      {/* Background */}
      <div style={{ position: 'absolute', inset: 0, background: 'var(--bg-2)' }}>
        {data.background_image_url ? (
          <img
            src={data.background_image_url} alt=""
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', animation: 'f-drift 22s ease-in-out infinite alternate' }}
          />
        ) : (
          <div className="f-ph" style={{ position: 'absolute', inset: 0, animation: 'f-drift 22s ease-in-out infinite alternate' }} />
        )}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(180deg, var(--hero-grad-1) 0%, var(--hero-grad-2) 35%, var(--hero-grad-3) 78%, var(--bg) 100%)',
          transition: 'background .6s ease',
        }} />
      </div>

      {/* Mountain SVG */}
      <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: 320, pointerEvents: 'none' }}>
        <svg viewBox="0 0 1600 280" preserveAspectRatio="none" style={{ height: 320, opacity: .15, width: '100%' }} aria-hidden="true">
          <path fill="var(--accent)" d="M0,280 L0,210 C 120,200 220,190 320,170 C 420,148 500,118 560,98 L 640,52 L 720,12 L 800,0 L 880,18 L 960,62 L 1040,108 C 1110,138 1200,162 1300,182 C 1400,200 1500,212 1600,218 L 1600,280 Z" />
          <path fill="var(--accent)" opacity="0.5" d="M0,280 L0,240 C 200,232 380,224 540,212 C 700,200 820,182 920,162 L 980,140 L 1040,150 L 1120,180 C 1240,210 1400,230 1600,244 L 1600,280 Z" />
        </svg>
      </div>

      {/* Content */}
      <div className="f-wrap" style={{ position: 'relative', zIndex: 2, paddingTop: '8vh', paddingBottom: 120 }}>
        <div className="f-rise" style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 48 }}>
          <span style={{ width: 36, height: 1, background: 'var(--accent)', display: 'block' }} />
          <span className="f-display" style={{ fontSize: 10, color: 'var(--accent)', letterSpacing: '.5em' }}>{t(data.eyebrow)}</span>
        </div>
        <h1 className="f-jp f-rise" style={{ fontSize: 'clamp(48px,7.5vw,110px)', lineHeight: .96, fontWeight: 500, color: 'var(--ink)', marginBottom: 8, animationDelay: '.1s' }}>
          {t(data.title_line1)}
          <span style={{ color: 'var(--accent)', display: 'block', marginTop: 8 }}>{t(data.title_line2)}</span>
        </h1>
        <p className="f-rise" style={{ maxWidth: 520, fontSize: 16, lineHeight: 1.85, color: 'var(--ink-soft)', marginTop: 36, fontWeight: 300, animationDelay: '.2s' }}>
          {t(data.subtitle)}
        </p>

        {/* Stats strip */}
        {data.stats.length > 0 && (
          <div className="f-rise" style={{ marginTop: 80, display: 'grid', gridTemplateColumns: `repeat(${data.stats.length}, auto)`, gap: '0 56px', alignItems: 'end', animationDelay: '.3s' }}>
            {data.stats.map(s => (
              <div key={s.id} style={{ borderTop: '1px solid var(--line)', paddingTop: 14, minWidth: 90 }}>
                <div className="f-serif" style={{ fontSize: 30, color: 'var(--ink)', letterSpacing: '.02em' }}>{s.value_text}</div>
                <div className="f-display" style={{ marginTop: 6, color: 'var(--ink-mute)', fontSize: 9.5 }}>{t(s.label)}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Scroll hint */}
      <div style={{ position: 'absolute', right: 48, bottom: 32, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, zIndex: 3 }}>
        <span className="f-display" style={{ writingMode: 'vertical-rl', letterSpacing: '.5em', color: 'var(--ink-mute)', fontSize: 9.5 }}>Scroll · 巡る</span>
        <span style={{ width: 1, height: 48, background: 'linear-gradient(var(--ink-soft), transparent)' }} />
      </div>
    </section>
  );
}
