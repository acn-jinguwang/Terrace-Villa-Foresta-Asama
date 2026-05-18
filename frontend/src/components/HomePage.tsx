'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useLanguage } from '@/contexts/LanguageContext';
import { translations } from '@/i18n/translations';
import { useHeroEntrance } from '@/hooks/useHeroEntrance';
import { useImageReveal } from '@/hooks/useImageReveal';
import { useStaggerImageReveal } from '@/hooks/useStaggerImageReveal';
import { useCountUp } from '@/hooks/useCountUp';

gsap.registerPlugin(ScrollTrigger);

interface MediaItem {
  id: string;
  url: string;
  name: string;
  type: 'image' | 'video';
  category: string;
}

interface PlanEntry {
  id: string;
  titleZh: string; titleJa: string; titleEn: string;
  duration: number;
  price: string;
  tagZh: string; tagJa: string; tagEn: string;
  coverImage: string;
  visible: boolean;
  budgetTotalZh: string | null;
  budgetTotalJa: string | null;
  budgetTotalEn: string | null;
}

interface SeasonCard {
  key: 'spring' | 'summer' | 'autumn' | 'winter';
  icon: string;
  labelZh: string; labelJa: string; labelEn: string;
  periodZh: string; periodJa: string; periodEn: string;
  catchZh: string; catchJa: string; catchEn: string;
  mainImage: string | null;
}

const heroGradients = [
  'from-[#0a0a0a] via-[#1a1208] to-[#0a0a0a]',
  'from-[#050505] via-[#0d1a0d] to-[#050505]',
  'from-[#0a0a0a] via-[#1a1010] to-[#0a0a0a]',
];

const featureItems = [
  {
    key: 'private',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1}
          d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
      </svg>
    ),
  },
  {
    key: 'nature',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1}
          d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
      </svg>
    ),
  },
  {
    key: 'asama',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1}
          d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
      </svg>
    ),
  },
  {
    key: 'service',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1}
          d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
      </svg>
    ),
  },
];

function PlaceholderSlide({ gradientClass }: { gradientClass: string }) {
  return (
    <div className={`w-full h-full bg-gradient-to-br ${gradientClass} flex items-center justify-center`}>
      <div className="text-center">
        <div className="w-16 h-16 border border-gold/10 rounded-full flex items-center justify-center mx-auto mb-3">
          <svg className="w-7 h-7 text-gold/20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={0.8}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
        <p className="font-display text-white/10 text-[10px] tracking-[0.6em] uppercase">
          Upload hero images via Admin
        </p>
      </div>
    </div>
  );
}

function PlaceholderCell({ label }: { label: string }) {
  return (
    <div className="w-full h-full bg-gradient-to-br from-white/5 to-white/2 flex items-center justify-center">
      <span className="font-display text-gold/20 text-xs uppercase tracking-widest">{label}</span>
    </div>
  );
}

export default function HomePage() {
  const { t, language } = useLanguage();
  const lang = language as 'zh' | 'ja' | 'en';
  const base    = process.env.NEXT_PUBLIC_BASE_PATH || '';
  const apiBase = base + '/api';
  const [currentSlide, setCurrentSlide] = useState(0);
  const [heroImages, setHeroImages]     = useState<MediaItem[]>([]);
  const [hotelImages, setHotelImages]   = useState<MediaItem[]>([]);
  const [surroundingsImages, setSurroundingsImages] = useState<MediaItem[]>([]);
  const [videoSrc, setVideoSrc] = useState<string | null>(null);
  const [plans, setPlans]       = useState<PlanEntry[]>([]);
  const [seasonCards, setSeasonCards] = useState<SeasonCard[]>([
    { key: 'spring', icon: '🌸', labelZh: '春', labelJa: '春', labelEn: 'Spring',
      periodZh: '3月〜5月', periodJa: '3月〜5月', periodEn: 'Mar – May',
      catchZh: '樱花与购物', catchJa: '桜と買い物', catchEn: 'Cherry Blossoms & Shopping',
      mainImage: null },
    { key: 'summer', icon: '🌿', labelZh: '夏', labelJa: '夏', labelEn: 'Summer',
      periodZh: '6月〜8月', periodJa: '6月〜8月', periodEn: 'Jun – Aug',
      catchZh: '高原避暑胜地', catchJa: '高原の避暑地', catchEn: 'Highland Retreat',
      mainImage: null },
    { key: 'autumn', icon: '🍁', labelZh: '秋', labelJa: '秋', labelEn: 'Autumn',
      periodZh: '9月〜11月', periodJa: '9月〜11月', periodEn: 'Sep – Nov',
      catchZh: '红叶与美食', catchJa: '紅葉とグルメ', catchEn: 'Foliage & Gastronomy',
      mainImage: null },
    { key: 'winter', icon: '❄️', labelZh: '冬', labelJa: '冬', labelEn: 'Winter',
      periodZh: '12月〜2月', periodJa: '12月〜2月', periodEn: 'Dec – Feb',
      catchZh: '滑雪与温泉', catchJa: 'スキーと温泉', catchEn: 'Skiing & Onsen',
      mainImage: null },
  ]);
  const videoRef = useRef<HTMLVideoElement>(null);

  // ─── Hero animations ────────────────────────────────────────────────────────
  const entrance = useHeroEntrance();
  const heroContainerRef = useRef<HTMLDivElement>(null);

  // Hero parallax applied to all slide images
  useEffect(() => {
    const container = heroContainerRef.current;
    if (!container) return;

    const isMobile = typeof window !== 'undefined' && window.innerWidth <= 768;
    const scaleFrom = isMobile ? 1.04 : 1.08;
    const yPercentFrom = isMobile ? 3 : 6;
    const yPercentTo = isMobile ? -3 : -6;

    const images = container.querySelectorAll('.hero-slide-img');
    gsap.set(images, { scale: scaleFrom, yPercent: yPercentFrom });

    const trigger = ScrollTrigger.create({
      trigger: container,
      start: 'top top',
      end: 'bottom top',
      scrub: true,
      onUpdate: (self) => {
        const p = self.progress;
        gsap.set(images, {
          scale: scaleFrom - p * (scaleFrom - 1),
          yPercent: yPercentFrom - p * (yPercentFrom - yPercentTo),
        });
      },
    });

    return () => trigger.kill();
  }, []);

  // ─── Feature cards stagger reveal ──────────────────────────────────────────
  const featuresRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = featuresRef.current;
    if (!el) return;
    const cards = el.querySelectorAll('.feature-card');
    gsap.set(cards, { opacity: 0, y: 40 });
    const trigger = ScrollTrigger.create({
      trigger: el,
      start: 'top 80%',
      once: true,
      onEnter: () => {
        gsap.to(cards, { opacity: 1, y: 0, duration: 0.6, stagger: 0.08, ease: 'power2.out' });
      },
    });
    return () => trigger.kill();
  }, []);

  // ─── Season cards stagger reveal ───────────────────────────────────────────
  const seasonsGridRef = useStaggerImageReveal<HTMLDivElement>({
    selector: '.season-card-img',
    scaleFrom: 0.94,
    stagger: 0.12,
  });

  // ─── Plans cards stagger reveal ────────────────────────────────────────────
  const plansGridRef = useStaggerImageReveal<HTMLDivElement>({
    selector: '.plan-card-img',
    scaleFrom: 0.94,
    stagger: 0.1,
  });

  // ─── About images reveal ───────────────────────────────────────────────────
  const hotelImg0Ref = useImageReveal<HTMLDivElement>({ scaleFrom: 0.94 });
  const hotelImg1Ref = useImageReveal<HTMLDivElement>({ scaleFrom: 0.94 });
  const hotelImg2Ref = useImageReveal<HTMLDivElement>({ scaleFrom: 0.94 });

  // ─── CountUp for stats ─────────────────────────────────────────────────────
  const stat0Ref = useCountUp(4, 1.8);
  const stat1Ref = useCountUp(1000, 1.8, 'm');
  const stat2Ref = useCountUp(24, 1.8, 'h');

  // ─── Fetch layout, media and plans on mount ─────────────────────────────────
  useEffect(() => {
    const load = async () => {
      try {
        const [layoutRes, allImgRes, videoRes, plansRes] = await Promise.all([
          fetch(apiBase + '/layouts'),
          fetch(apiBase + '/media/images'),
          fetch(apiBase + '/media/videos'),
          fetch(apiBase + '/plans?public=1'),
        ]);
        const layout: Record<string, string[]> = layoutRes.ok ? await layoutRes.json() : {};
        const allImgs: MediaItem[]  = allImgRes.ok ? await allImgRes.json() : [];
        const videos: MediaItem[]   = videoRes.ok  ? await videoRes.json()  : [];
        const plansData: PlanEntry[] = plansRes.ok ? await plansRes.json()  : [];

        const urlToItem = (url: string) => allImgs.find((img) => img.url === url) ?? { id: url, url, name: '', type: 'image' as const, category: '' };
        setHeroImages((layout['home.hero'] ?? []).map(urlToItem));
        setHotelImages((layout['home.hotel'] ?? []).map(urlToItem));
        setSurroundingsImages((layout['home.surroundings'] ?? []).map(urlToItem));
        if (videos.length > 0) setVideoSrc(videos[0].url);
        setPlans(plansData);

        const coversRes: Record<string, string | null> = await fetch(`${apiBase}/seasons/covers`).then((r) => r.ok ? r.json() : {}).catch(() => ({}));
        const seasonKeys = ['spring', 'summer', 'autumn', 'winter'] as const;
        const seasonResults = await Promise.all(
          seasonKeys.map((s) =>
            fetch(`${apiBase}/seasons?season=${s}&public=1`)
              .then((r) => r.ok ? r.json() : { spots: [] })
              .catch(() => ({ spots: [] })),
          ),
        );
        setSeasonCards((prev) => prev.map((card, i) => {
          const coverUrl = coversRes[card.key] ?? null;
          if (coverUrl) return { ...card, mainImage: coverUrl };
          const spots = seasonResults[i]?.spots ?? [];
          const firstWithImg = spots.find((s: any) => s.images?.length > 0);
          const mainImg = firstWithImg
            ? (firstWithImg.images.find((img: any) => img.isMain) ?? firstWithImg.images[0])?.imageUrl ?? null
            : null;
          return { ...card, mainImage: mainImg };
        }));
      } catch {
        // Use placeholders when API is not available
      }
    };
    load();
  }, []);

  // ─── Auto-advance slideshow ─────────────────────────────────────────────────
  const slideCount = heroImages.length || heroGradients.length;
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slideCount);
    }, 5000);
    return () => clearInterval(timer);
  }, [slideCount]);

  const getHotelImage = (idx: number) =>
    hotelImages.length > idx ? hotelImages[idx] : null;

  const getPlanTitle = (p: PlanEntry) =>
    lang === 'zh' ? p.titleZh : lang === 'ja' ? p.titleJa : p.titleEn;

  const getPlanTag = (p: PlanEntry) =>
    lang === 'zh' ? p.tagZh : lang === 'ja' ? p.tagJa : p.tagEn;

  const getPlanTotal = (p: PlanEntry) =>
    (lang === 'zh' ? p.budgetTotalZh : lang === 'ja' ? p.budgetTotalJa : p.budgetTotalEn) ?? p.price;

  const slides = heroImages.length > 0 ? heroImages : heroGradients.map((g, i) => ({ id: `p${i}`, gradient: g }));

  return (
    <div className="min-h-screen bg-dark">
      {/* ===== HERO SECTION ===== */}
      <section ref={heroContainerRef} className="relative h-screen w-full overflow-hidden">
        {/* Slideshow */}
        {slides.map((slide, idx) => (
          <div
            key={idx}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              idx === currentSlide ? 'opacity-100' : 'opacity-0'
            }`}
          >
            {'url' in slide ? (
              <div className="relative w-full h-full">
                <Image
                  src={(slide as MediaItem).url}
                  alt={`Terrace Villa Foresta Asama ${idx + 1}`}
                  fill
                  unoptimized
                  className="object-cover brightness-50 hero-slide-img"
                  style={{ willChange: 'transform' }}
                  priority={idx === 0}
                />
              </div>
            ) : (
              <PlaceholderSlide gradientClass={(slide as { gradient: string }).gradient} />
            )}
          </div>
        ))}

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-dark/90" />

        {/* Hero Content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4 sm:px-6 pt-20">
          <p ref={entrance.eyebrowRef} className="flex items-center gap-4 mb-6" style={{ opacity: 0 }}>
            <span className="gold-line" />
            <span className="text-gold text-xs tracking-[0.6em] font-display uppercase">
              Karuizawa · Japan
            </span>
            <span className="gold-line" />
          </p>

          <h1 ref={entrance.titleRef} className="font-display text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-bold text-white tracking-tight mb-4 uppercase">
            Terrace Villa
          </h1>
          <h2 ref={entrance.subtitleRef} className="font-display text-2xl sm:text-3xl md:text-5xl lg:text-6xl font-bold text-gold tracking-widest mb-8 uppercase">
            Foresta Asama
          </h2>

          <div className="gold-divider w-64 mb-8" />

          <p ref={entrance.descRef} className="font-kaiti italic text-gold-light text-lg md:text-xl leading-relaxed max-w-2xl mb-4" style={{ opacity: 0 }}>
            {t(translations.top.tagline)}
          </p>
          <p ref={entrance.desc2Ref} className="font-kaiti italic text-white/50 text-base leading-relaxed max-w-xl mb-10" style={{ opacity: 0 }}>
            {t(translations.top.subtitle)}
          </p>

          <div ref={entrance.ctaRef} className="flex flex-col sm:flex-row gap-4 hero-cta" style={{ opacity: 0 }}>
            <Link href="/library" className="luxury-btn">
              Explore the Villa
            </Link>
            <Link href="/plans" className="luxury-btn-outline">
              Travel Plans
            </Link>
          </div>
        </div>

        {/* Slide Indicators */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2">
          {slides.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentSlide(idx)}
              className={`transition-all duration-300 ${
                idx === currentSlide ? 'w-8 h-1 bg-gold' : 'w-2 h-1 bg-white/30'
              }`}
            />
          ))}
        </div>

        {/* Scroll Indicator */}
        <div ref={entrance.scrollRef} className="scroll-indicator" style={{ opacity: 0 }}>
          <span className="scroll-text">Scroll</span>
          <div className="scroll-line" />
        </div>
      </section>

      {/* ===== HOTEL INTRO SECTION ===== */}
      <section className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Text Content */}
            <div>
              <div className="flex items-center gap-4 mb-8">
                <div className="gold-line" />
                <span className="text-gold text-[10px] tracking-[0.5em] font-display uppercase">
                  The Villa
                </span>
              </div>
              <h2 className="section-title mb-6">{t(translations.top.intro_title)}</h2>
              <div className="gold-divider mb-8" />
              <p className="font-kaiti italic text-white/70 text-lg leading-relaxed mb-8">
                {t(translations.top.intro_text)}
              </p>

              <div className="grid grid-cols-3 gap-6 mb-10">
                {[
                  { num: 4,    suffix: '',  label: { zh: '独立别墅', ja: '独立ヴィラ',  en: 'Private Villas' }, ref: stat0Ref },
                  { num: 1000, suffix: 'm', label: { zh: '海拔高度', ja: '標高',        en: 'Elevation' },      ref: stat1Ref },
                  { num: 24,   suffix: 'h', label: { zh: '管家服务', ja: 'バトラー',     en: 'Butler Service' }, ref: stat2Ref },
                ].map((stat, idx) => (
                  <div key={idx} className="text-center border border-white/5 p-4">
                    <div ref={stat.ref as React.RefObject<HTMLDivElement>} className="font-display text-2xl font-bold text-gold mb-1">0</div>
                    <div className="font-kaiti italic text-white/40 text-xs leading-relaxed">
                      {t(stat.label)}
                    </div>
                  </div>
                ))}
              </div>

              <Link href="/library" className="luxury-btn-outline">
                {t(translations.common.view_all)}
              </Link>
            </div>

            {/* Image Grid — scroll reveal */}
            <div className="grid grid-cols-2 gap-4">
              <div ref={hotelImg0Ref} className="relative aspect-[3/4] overflow-hidden border border-white/10 about-img-area">
                {getHotelImage(0) ? (
                  <Image
                    src={getHotelImage(0)!.url}
                    alt={getHotelImage(0)!.name}
                    fill unoptimized
                    className="object-cover about-img active"
                  />
                ) : (
                  <PlaceholderCell label="Interior" />
                )}
              </div>

              <div className="grid grid-rows-2 gap-4">
                <div ref={hotelImg1Ref} className="relative aspect-square overflow-hidden border border-white/10 about-img-area">
                  {getHotelImage(1) ? (
                    <Image
                      src={getHotelImage(1)!.url}
                      alt={getHotelImage(1)!.name}
                      fill unoptimized
                      className="object-cover about-img active"
                    />
                  ) : (
                    <PlaceholderCell label="Terrace" />
                  )}
                </div>
                <div ref={hotelImg2Ref} className="relative aspect-square overflow-hidden border border-white/10 about-img-area">
                  {getHotelImage(2) ? (
                    <Image
                      src={getHotelImage(2)!.url}
                      alt={getHotelImage(2)!.name}
                      fill unoptimized
                      className="object-cover about-img active"
                    />
                  ) : (
                    <PlaceholderCell label="Asama" />
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== FEATURES SECTION ===== */}
      <section className="py-16 px-6 bg-white/2 border-y border-white/5">
        <div className="max-w-7xl mx-auto">
          <div ref={featuresRef} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {featureItems.map((item) => {
              const featureData = translations.top.features[item.key as keyof typeof translations.top.features];
              return (
                <div
                  key={item.key}
                  className="feature-card flex flex-col items-center text-center p-8 border border-white/5 hover:border-gold/20 transition-all duration-500 group"
                >
                  <div className="text-gold/60 group-hover:text-gold mb-4 transition-colors duration-300">
                    {item.icon}
                  </div>
                  <div className="w-8 h-[1px] bg-gold/20 group-hover:bg-gold/40 transition-colors duration-300 mb-4" />
                  <h3 className="font-display text-sm font-bold text-white tracking-widest uppercase mb-2">
                    {t(featureData.title)}
                  </h3>
                  <p className="font-kaiti italic text-white/40 text-sm leading-relaxed">
                    {t(featureData.desc)}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ===== VIDEO SECTION ===== */}
      <section className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-4 mb-6">
              <div className="gold-line" />
              <span className="text-gold text-[10px] tracking-[0.5em] font-display uppercase">Experience</span>
              <div className="gold-line" />
            </div>
            <h2 className="section-title mb-4">{t(translations.top.video_title)}</h2>
            <div className="gold-divider w-48 mx-auto" />
          </div>

          <div className="relative aspect-video w-full max-w-5xl mx-auto overflow-hidden border border-white/10">
            {videoSrc ? (
              <video
                ref={videoRef}
                key={videoSrc}
                className="w-full h-full object-cover"
                autoPlay
                muted
                loop
                playsInline
                controls
                preload="auto"
              >
                <source src={videoSrc} type="video/mp4" />
                <source src={videoSrc} type="video/webm" />
              </video>
            ) : (
              <div className="absolute inset-0 bg-gradient-to-br from-dark to-dark-secondary flex items-center justify-center">
                <div className="text-center">
                  <div className="w-20 h-20 border border-gold/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-gold/30" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </div>
                  <p className="font-display text-white/20 text-xs tracking-widest uppercase">
                    Upload a video via Admin
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ===== 四季 SEASONS SECTION ===== */}
      <section className="py-24 px-6 bg-white/2 border-t border-white/5">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="flex items-center justify-center gap-4 mb-6">
              <div className="gold-line" />
              <span className="text-gold text-[10px] tracking-[0.5em] font-display uppercase">Seasons</span>
              <div className="gold-line" />
            </div>
            <h2 className="section-title mb-4">
              {lang === 'ja' ? '軽井沢、四季を楽しむ' : 'Karuizawa, Beautiful in Every Season'}
            </h2>
            <div className="gold-divider w-48 mx-auto mb-6" />
            <p className="section-subtitle max-w-2xl mx-auto">
              {lang === 'zh'
                ? 'Foresta Asama 是您探索轻井泽四季之美的最佳出发点'
                : lang === 'ja'
                ? 'Foresta Asamaは、四季折々の軽井沢を旅する最高の拠点です'
                : 'Foresta Asama is your perfect base for exploring the seasonal beauty of Karuizawa'}
            </p>
          </div>

          {/* 4 Season cards */}
          <div ref={seasonsGridRef} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {seasonCards.map((card) => {
              const label  = lang === 'zh' ? card.labelZh  : lang === 'ja' ? card.labelJa  : card.labelEn;
              const period = lang === 'zh' ? card.periodZh : lang === 'ja' ? card.periodJa : card.periodEn;
              const catchCopy = lang === 'zh' ? card.catchZh : lang === 'ja' ? card.catchJa : card.catchEn;
              return (
                <Link
                  key={card.key}
                  href="/seasons"
                  className="luxury-card season-card overflow-hidden group block"
                >
                  <div className="relative aspect-[3/4] overflow-hidden bg-white/5">
                    {card.mainImage ? (
                      <Image
                        src={card.mainImage}
                        alt={label}
                        fill unoptimized
                        className="object-cover season-card-img brightness-50"
                        style={{ transition: 'transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)' }}
                      />
                    ) : (
                      <div className="absolute inset-0 bg-gradient-to-b from-gold/5 to-dark" />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-dark/90 via-dark/30 to-transparent" />
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4">
                      <span className="text-4xl mb-3">{card.icon}</span>
                      <span className="font-display text-gold text-2xl font-bold tracking-widest uppercase">
                        {label}
                      </span>
                      <span className="font-display text-white/40 text-[10px] tracking-widest mt-1">
                        {period}
                      </span>
                    </div>
                  </div>
                  <div className="p-4 text-center">
                    <p className="font-kaiti italic text-white/50 text-sm leading-relaxed">
                      {catchCopy}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>

          <div className="text-center">
            <Link href="/seasons" className="luxury-btn">
              {lang === 'zh' ? '探索四季 →' : lang === 'ja' ? '四季を探る →' : 'Explore the Seasons →'}
            </Link>
          </div>
        </div>
      </section>

      {/* ===== PLANS PREVIEW SECTION ===== */}
      <section className="py-24 px-6 bg-white/2 border-t border-white/5">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="flex items-center justify-center gap-4 mb-6">
              <div className="gold-line" />
              <span className="text-gold text-[10px] tracking-[0.5em] font-display uppercase">
                Curated Experiences
              </span>
              <div className="gold-line" />
            </div>
            <h2 className="section-title mb-4">{t(translations.plans.title)}</h2>
            <div className="gold-divider w-48 mx-auto mb-6" />
            <p className="section-subtitle max-w-xl mx-auto">{t(translations.plans.subtitle)}</p>
          </div>

          <div ref={plansGridRef} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {plans.slice(0, 3).map((plan) => {
              const tag = getPlanTag(plan);
              const coverSrc = plan.coverImage || `/images/plans/${plan.id}.jpg`;
              return (
                <Link href={`/plans/${plan.id}`} key={plan.id} className="luxury-card plan-card group block overflow-hidden">
                  <div className="relative aspect-[4/3] overflow-hidden bg-white/5">
                    <Image
                      src={coverSrc}
                      alt={getPlanTitle(plan)}
                      fill unoptimized
                      className="object-cover plan-card-img"
                      style={{ transition: 'transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)' }}
                      onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-dark/80 to-transparent" />
                    {tag && (
                      <div className="absolute top-4 left-4 bg-gold text-black text-[10px] font-display font-bold uppercase tracking-widest px-3 py-1">
                        {tag}
                      </div>
                    )}
                    <div className="absolute bottom-4 left-4">
                      <span className="font-display text-gold text-xs tracking-[0.4em] uppercase">
                        {plan.duration} {t(translations.plans.days)}
                      </span>
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="font-serif text-white text-xl font-bold mb-2 group-hover:text-gold transition-colors duration-300">
                      {getPlanTitle(plan)}
                    </h3>
                    <div className="flex items-center justify-between mt-4">
                      <span className="text-gold font-display text-sm font-bold">
                        {getPlanTotal(plan)}{' '}
                        <span className="text-white/40 text-[10px]">{t(translations.plans.per_person)}</span>
                      </span>
                      <span className="text-white/40 text-xs font-display uppercase tracking-widest group-hover:text-gold transition-colors duration-300">
                        View Details →
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>

          <div className="text-center">
            <Link href="/plans" className="luxury-btn-outline">
              {t(translations.common.view_all)}
            </Link>
          </div>
        </div>
      </section>

      {/* ===== SURROUNDINGS PREVIEW ===== */}
      <section className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="flex items-center gap-4 mb-8">
                <div className="gold-line" />
                <span className="text-gold text-[10px] tracking-[0.5em] font-display uppercase">Karuizawa</span>
              </div>
              <h2 className="section-title mb-6">{t(translations.surroundings.title)}</h2>
              <div className="gold-divider mb-8" />
              <p className="font-kaiti italic text-white/60 text-lg leading-relaxed mb-8">
                {t(translations.surroundings.karuizawa_intro)}
              </p>
              <Link href="/surroundings" className="luxury-btn-outline">
                {t(translations.common.view_all)}
              </Link>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {(['nature', 'culture', 'gourmet', 'shopping'] as const).map((cat, idx) => {
                const img = surroundingsImages[idx] ?? surroundingsImages[0] ?? null;
                return (
                  <div
                    key={cat}
                    className="relative aspect-square overflow-hidden bg-white/5 border border-white/5 hover:border-gold/20 transition-all duration-500 flex items-center justify-center group cursor-pointer spot-card"
                  >
                    {img ? (
                      <Image src={img.url} alt={cat} fill unoptimized className="object-cover opacity-40 group-hover:opacity-60 spot-card-img transition-opacity duration-300" style={{ transition: 'transform 0.6s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.3s' }} />
                    ) : null}
                    <div className="relative text-center p-4">
                      <div className="text-white/40 group-hover:text-gold/60 font-display text-xs uppercase tracking-widest transition-colors duration-300">
                        {t(translations.surroundings.categories[cat])}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
