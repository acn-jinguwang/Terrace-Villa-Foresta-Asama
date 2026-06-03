'use client';
import { useLanguage } from '@/contexts/LanguageContext';

interface L { zh: string; ja: string; en: string }
interface AccessItem { id: number; origin: L; duration: L }
interface LocationData {
  eyebrow: L; title: L; description: L; address: L;
  map_image_url: string;
  access: AccessItem[];
}

export default function LocationSection({ data }: { data: LocationData }) {
  const { language } = useLanguage();
  const t = (o: L) => o[language as keyof L] ?? o.ja ?? '';

  return (
    <section className="f-section-lg" style={{ padding: '140px 0', background: 'var(--bg)' }}>
      <div className="f-wrap">
        <div className="f-location-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 80, alignItems: 'start' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 26 }}>
              <span style={{ width: 36, height: 1, background: 'var(--accent)', display: 'block' }} />
              <span className="f-display" style={{ fontSize: 10, color: 'var(--accent)', letterSpacing: '.32em' }}>{t(data.eyebrow)}</span>
            </div>
            <h2 className="f-jp" style={{ fontSize: 'clamp(32px,4vw,52px)', lineHeight: 1.15, color: 'var(--ink)', fontWeight: 500, marginBottom: 32 }}>{t(data.title)}</h2>
            <p style={{ fontSize: 15, lineHeight: 1.95, color: 'var(--ink-soft)', marginBottom: 40 }}>{t(data.description)}</p>
            <div style={{ marginBottom: 32 }}>
              {data.access.map(a => (
                <div key={a.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '16px 0', borderBottom: '1px solid var(--line)' }}>
                  <span className="f-jp" style={{ fontSize: 15, color: 'var(--ink)' }}>{t(a.origin)}</span>
                  <span className="f-display" style={{ fontSize: 11, color: 'var(--accent)', letterSpacing: '.1em' }}>{t(a.duration)}</span>
                </div>
              ))}
            </div>
            <p style={{ fontSize: 13, color: 'var(--ink-mute)', lineHeight: 1.8 }}>{t(data.address)}</p>
          </div>
          <div className="f-location-map">
            {data.map_image_url ? (
              <img src={data.map_image_url} alt="Map" style={{ width: '100%', aspectRatio: '1', objectFit: 'cover', border: '1px solid var(--line)' }} />
            ) : (
              <div className="f-ph" style={{ aspectRatio: '1', border: '1px solid var(--line)' }} />
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
