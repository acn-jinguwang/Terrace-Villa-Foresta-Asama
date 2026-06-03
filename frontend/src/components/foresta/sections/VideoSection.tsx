'use client';
import { useState, useRef } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';

interface L { zh: string; ja: string; en: string }
interface FeaturedVideo { id: number; title: L; video_url: string; thumbnail_url: string; description: L }
interface VideoData { eyebrow: L; title: L; subtitle: L; videos: FeaturedVideo[] }

export default function VideoSection({ data }: { data: VideoData }) {
  const { language } = useLanguage();
  const t = (o: L) => o[language as keyof L] ?? o.ja ?? '';
  const [activeIdx, setActiveIdx] = useState(0);
  const [playing, setPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  if (!data.videos.length) return null;
  const active = data.videos[activeIdx];

  function handlePlay() {
    setPlaying(true);
    videoRef.current?.play();
  }

  function switchVideo(idx: number) {
    setActiveIdx(idx);
    setPlaying(false);
    if (videoRef.current) { videoRef.current.pause(); videoRef.current.currentTime = 0; }
  }

  return (
    <section className="f-section-lg" style={{ padding: '120px 0', background: 'var(--bg-2)', transition: 'background .6s ease' }}>
      <div className="f-wrap">
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 26 }}>
          <span style={{ width: 36, height: 1, background: 'var(--accent)', display: 'block' }} />
          <span className="f-display" style={{ fontSize: 10, color: 'var(--accent)', letterSpacing: '.32em' }}>{t(data.eyebrow)}</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.4fr', gap: 80, marginBottom: 48 }}>
          <h2 className="f-jp" style={{ fontSize: 'clamp(28px,4vw,52px)', lineHeight: 1.15, color: 'var(--ink)', fontWeight: 500 }}>{t(data.title)}</h2>
          <p style={{ fontSize: 15, lineHeight: 1.95, color: 'var(--ink-soft)', fontWeight: 300, alignSelf: 'center' }}>{t(data.subtitle)}</p>
        </div>

        {/* Main player */}
        <div style={{ position: 'relative', background: '#000', aspectRatio: '16/9', overflow: 'hidden', marginBottom: 24 }}>
          <video
            ref={videoRef}
            key={active.video_url}
            src={active.video_url}
            poster={active.thumbnail_url || undefined}
            controls={playing}
            playsInline
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
            onEnded={() => setPlaying(false)}
          />
          {!playing && (
            <div onClick={handlePlay} style={{ position: 'absolute', inset: 0, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {active.thumbnail_url && (
                <img src={active.thumbnail_url} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
              )}
              <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.25)' }} />
              <div style={{ position: 'relative', width: 72, height: 72, borderRadius: '50%', background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'transform .2s' }}
                onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.1)')}
                onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="var(--bg)" style={{ marginLeft: 4 }}><path d="M8 5v14l11-7z" /></svg>
              </div>
              <div style={{ position: 'absolute', bottom: 24, left: 24 }}>
                <p className="f-jp" style={{ color: '#fff', fontSize: 16, fontWeight: 500, textShadow: '0 1px 4px rgba(0,0,0,0.8)' }}>{t(active.title)}</p>
                {t(active.description) && <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13, marginTop: 4, textShadow: '0 1px 3px rgba(0,0,0,0.8)' }}>{t(active.description)}</p>}
              </div>
            </div>
          )}
        </div>

        {/* Thumbnail list — only if multiple videos */}
        {data.videos.length > 1 && (
          <div className="f-videos-grid" style={{ display: 'grid', gridTemplateColumns: `repeat(${Math.min(data.videos.length, 4)}, 1fr)`, gap: 12 }}>
            {data.videos.map((v, i) => (
              <button key={v.id} onClick={() => switchVideo(i)} style={{ border: `1px solid ${i === activeIdx ? 'var(--accent)' : 'var(--line)'}`, background: 'transparent', cursor: 'pointer', textAlign: 'left', padding: 0, transition: 'border-color .2s' }}>
                <div style={{ aspectRatio: '16/9', background: 'var(--bg)', position: 'relative', overflow: 'hidden' }}>
                  {v.thumbnail_url && <img src={v.thumbnail_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                  <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.3)' }}>
                    <div style={{ width: 36, height: 36, borderRadius: '50%', background: i === activeIdx ? 'var(--accent)' : 'rgba(255,255,255,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill={i === activeIdx ? 'var(--bg)' : '#000'} style={{ marginLeft: 2 }}><path d="M8 5v14l11-7z" /></svg>
                    </div>
                  </div>
                </div>
                <div style={{ padding: '8px 12px' }}>
                  <p className="f-jp" style={{ fontSize: 13, color: i === activeIdx ? 'var(--accent)' : 'var(--ink)', fontWeight: 500, lineHeight: 1.4 }}>{t(v.title)}</p>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
