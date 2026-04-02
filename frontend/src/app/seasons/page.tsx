'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useLanguage } from '@/contexts/LanguageContext';

type Lang = 'zh' | 'ja' | 'en';
type Season = 'spring' | 'summer' | 'autumn' | 'winter';

interface SeasonImage {
  id: number;
  imageUrl: string;
  altZh: string; altJa: string; altEn: string;
  isMain: boolean;
  displayOrder: number;
}

interface SeasonSpot {
  id: number;
  season: Season;
  nameZh: string; nameJa: string; nameEn: string;
  descZh: string; descJa: string; descEn: string;
  accessZh: string; accessJa: string; accessEn: string;
  distanceMin: number;
  isFeatured: boolean;
  displayOrder: number;
  isActive: boolean;
  images: SeasonImage[];
}

const SEASONS: { key: Season; labelZh: string; labelJa: string; labelEn: string; icon: string }[] = [
  { key: 'spring', labelZh: '春', labelJa: '春', labelEn: 'Spring', icon: '🌸' },
  { key: 'summer', labelZh: '夏', labelJa: '夏', labelEn: 'Summer', icon: '🌿' },
  { key: 'autumn', labelZh: '秋', labelJa: '秋', labelEn: 'Autumn', icon: '🍁' },
  { key: 'winter', labelZh: '冬', labelJa: '冬', labelEn: 'Winter', icon: '❄️' },
];

const PAGE_TEXT = {
  zh: {
    tag: '轻井泽 · 四季',
    title: '四季皆精彩',
    subtitle: 'Foresta Asama 是您探索轻井泽四季之美的最佳出发点',
    access: '距别墅',
    min: '分钟',
    featured: '精选景点',
    noSpots: '暂无景点信息',
  },
  ja: {
    tag: '軽井沢 · 四季',
    title: '四季を楽しむ',
    subtitle: 'Foresta Asamaは、四季折々の軽井沢を旅する最高の拠点です',
    access: '別荘から',
    min: '分',
    featured: 'フィーチャースポット',
    noSpots: 'スポット情報はまだありません',
  },
  en: {
    tag: 'Karuizawa · Seasons',
    title: 'Beautiful in Every Season',
    subtitle: 'Foresta Asama is your perfect base for exploring the seasonal beauty of Karuizawa',
    access: 'From villa',
    min: 'min',
    featured: 'Featured',
    noSpots: 'No spots available yet',
  },
};

export default function SeasonsPage() {
  const { language } = useLanguage();
  const lang = language as Lang;
  const base    = process.env.NEXT_PUBLIC_BASE_PATH || '';
  const apiBase = base + '/api';

  const [activeSeason, setActiveSeason] = useState<Season>('spring');
  const [spots, setSpots]               = useState<SeasonSpot[]>([]);
  const [loading, setLoading]           = useState(true);
  const [imgErrors, setImgErrors]       = useState<Record<number, boolean>>({});

  const t = PAGE_TEXT[lang];

  useEffect(() => {
    setLoading(true);
    fetch(`${apiBase}/seasons?season=${activeSeason}&public=1`)
      .then((r) => r.ok ? r.json() : { spots: [] })
      .then((d) => setSpots(d.spots ?? []))
      .catch(() => setSpots([]))
      .finally(() => setLoading(false));
  }, [activeSeason, apiBase]);

  const getName   = (s: SeasonSpot) => s[`name${lang.charAt(0).toUpperCase() + lang.slice(1)}` as 'nameZh' | 'nameJa' | 'nameEn'];
  const getDesc   = (s: SeasonSpot) => s[`desc${lang.charAt(0).toUpperCase() + lang.slice(1)}` as 'descZh' | 'descJa' | 'descEn'];
  const getAccess = (s: SeasonSpot) => s[`access${lang.charAt(0).toUpperCase() + lang.slice(1)}` as 'accessZh' | 'accessJa' | 'accessEn'];

  const mainImage = (s: SeasonSpot) =>
    s.images.find((i) => i.isMain) ?? s.images[0] ?? null;

  const activeSeasonInfo = SEASONS.find((s) => s.key === activeSeason)!;
  const seasonLabel = lang === 'zh' ? activeSeasonInfo.labelZh
    : lang === 'ja' ? activeSeasonInfo.labelJa : activeSeasonInfo.labelEn;

  const featured = spots.filter((s) => s.isFeatured);
  const regular  = spots.filter((s) => !s.isFeatured);

  return (
    <div className="min-h-screen bg-dark pt-20">
      {/* ── Page Header ── */}
      <section className="py-20 px-6 text-center border-b border-white/5">
        <div className="flex items-center justify-center gap-4 mb-6">
          <div className="gold-line" />
          <span className="text-gold text-[10px] tracking-[0.5em] font-display uppercase">{t.tag}</span>
          <div className="gold-line" />
        </div>
        <h1 className="section-title mb-4">{t.title}</h1>
        <div className="gold-divider w-48 mx-auto mb-6" />
        <p className="font-kaiti italic text-white/50 text-lg max-w-2xl mx-auto">{t.subtitle}</p>
      </section>

      {/* ── Season Tabs ── */}
      <section className="sticky top-16 z-30 bg-dark/95 backdrop-blur-md border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex">
            {SEASONS.map((s) => {
              const label = lang === 'zh' ? s.labelZh : lang === 'ja' ? s.labelJa : s.labelEn;
              const isActive = activeSeason === s.key;
              return (
                <button
                  key={s.key}
                  onClick={() => setActiveSeason(s.key)}
                  className={`flex-1 py-5 font-display text-sm uppercase tracking-widest transition-all duration-300 border-b-2 ${
                    isActive
                      ? 'text-gold border-gold'
                      : 'text-white/30 border-transparent hover:text-white/60 hover:border-white/10'
                  }`}
                >
                  <span className="mr-2">{s.icon}</span>
                  {label}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Spots ── */}
      <section className="py-16 px-6">
        <div className="max-w-7xl mx-auto">
          {loading ? (
            <div className="flex justify-center py-24">
              <div className="w-8 h-8 border border-gold/30 border-t-gold/80 rounded-full animate-spin" />
            </div>
          ) : spots.length === 0 ? (
            <p className="text-center text-white/20 font-display text-xs uppercase tracking-widest py-24">
              {t.noSpots}
            </p>
          ) : (
            <div className="space-y-16">
              {/* Featured spots — large 2-col cards */}
              {featured.length > 0 && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {featured.map((spot) => {
                    const img = mainImage(spot);
                    const hasError = imgErrors[spot.id];
                    return (
                      <div key={spot.id} className="luxury-card overflow-hidden group">
                        {/* Large image */}
                        <div className="relative aspect-[16/9] overflow-hidden bg-white/5">
                          {img && !hasError ? (
                            <Image
                              src={img.imageUrl}
                              alt={lang === 'zh' ? img.altZh : lang === 'ja' ? img.altJa : img.altEn}
                              fill unoptimized
                              className="object-cover transition-transform duration-700 group-hover:scale-105"
                              onError={() => setImgErrors((p) => ({ ...p, [spot.id]: true }))}
                            />
                          ) : (
                            <div className="absolute inset-0 bg-gradient-to-br from-gold/10 to-dark" />
                          )}
                          <div className="absolute inset-0 bg-gradient-to-t from-dark/80 to-transparent" />
                          <div className="absolute top-4 left-4 bg-gold text-black text-[10px] font-display font-bold uppercase tracking-widest px-3 py-1">
                            {t.featured}
                          </div>
                          <div className="absolute bottom-4 right-4 bg-dark/70 backdrop-blur-sm px-3 py-1.5 border border-white/10">
                            <span className="font-display text-gold text-xs tracking-widest">
                              {t.access} {spot.distanceMin}{t.min}
                            </span>
                          </div>
                        </div>
                        {/* Text */}
                        <div className="p-6">
                          <h3 className="font-serif text-white text-2xl font-bold mb-3 group-hover:text-gold transition-colors duration-300">
                            {getName(spot)}
                          </h3>
                          <div className="gold-divider w-12 mb-4" />
                          <p className="font-kaiti italic text-white/60 leading-relaxed line-clamp-3">
                            {getDesc(spot)}
                          </p>
                          {getAccess(spot) && (
                            <p className="mt-4 text-white/30 text-xs font-display uppercase tracking-widest">
                              {getAccess(spot)}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Regular spots — 3-col grid */}
              {regular.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {regular.map((spot) => {
                    const img = mainImage(spot);
                    const hasError = imgErrors[spot.id];
                    return (
                      <div key={spot.id} className="luxury-card overflow-hidden group">
                        {/* Thumbnail */}
                        <div className="relative aspect-[4/3] overflow-hidden bg-white/5">
                          {img && !hasError ? (
                            <Image
                              src={img.imageUrl}
                              alt={lang === 'zh' ? img.altZh : lang === 'ja' ? img.altJa : img.altEn}
                              fill unoptimized
                              className="object-cover transition-transform duration-700 group-hover:scale-105"
                              onError={() => setImgErrors((p) => ({ ...p, [spot.id]: true }))}
                            />
                          ) : (
                            <div className="absolute inset-0 bg-gradient-to-br from-gold/10 to-dark" />
                          )}
                          <div className="absolute inset-0 bg-gradient-to-t from-dark/60 to-transparent" />
                          <div className="absolute bottom-3 right-3 text-xs font-display text-gold/70 tracking-widest">
                            {spot.distanceMin}{t.min}
                          </div>
                        </div>
                        {/* Text */}
                        <div className="p-5">
                          <h3 className="font-serif text-white text-lg font-bold mb-2 group-hover:text-gold transition-colors duration-300">
                            {getName(spot)}
                          </h3>
                          <p className="font-kaiti italic text-white/50 text-sm leading-relaxed line-clamp-3">
                            {getDesc(spot)}
                          </p>
                          {getAccess(spot) && (
                            <p className="mt-3 text-white/25 text-[10px] font-display uppercase tracking-widest">
                              {getAccess(spot)}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* ── Back to top CTA ── */}
      <section className="py-16 px-6 border-t border-white/5 text-center">
        <Link href={base || '/'} className="luxury-btn-outline">
          {lang === 'zh' ? '返回首页' : lang === 'ja' ? 'トップへ戻る' : 'Back to Top'}
        </Link>
      </section>
    </div>
  );
}
