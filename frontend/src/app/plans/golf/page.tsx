'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useLanguage } from '@/contexts/LanguageContext';

interface MediaItem {
  id: string;
  url: string;
  name: string;
  category: string;
}

const GOLF_COURSES = [
  {
    num: '01',
    name: { zh: '轻井泽高尔夫俱乐部', en: 'Karuizawa Golf Club' },
    desc: { zh: '日本最古老且最具排他性的私人高尔夫俱乐部之一。', en: 'One of Japan\'s oldest and most exclusive private golf clubs.' },
    bullets: {
      zh: ['极为严格的准入制度与私密环境', '跨越百年的经典球道设计', '感受纯正的贵族高尔夫礼仪'],
      en: ['Extremely strict admission policy', 'Century-old classic course design', 'Experience authentic aristocratic golf etiquette'],
    },
  },
  {
    num: '02',
    name: { zh: '轻井泽72高尔夫北场', en: 'Karuizawa 72 Golf North Course' },
    desc: { zh: '每年举办NEC轻井泽72女子高尔夫锦标赛的职业场地。', en: 'Professional venue hosting the annual NEC Karuizawa 72 Ladies Golf Tournament.' },
    bullets: {
      zh: ['职业锦标赛专用顶级草坪', '极具战略性的水障碍布局', '开阔的视野与心理博弈'],
      en: ['Championship-grade turf', 'Strategic water hazard layout', 'Expansive views and psychological challenge'],
    },
  },
  {
    num: '03',
    name: { zh: '太平洋俱乐部轻井泽球场', en: 'Taiheiyo Club Karuizawa Course' },
    desc: { zh: '坐落于浅间山脚下，被白桦林和落叶松包围的避暑球场。', en: 'A highland retreat course nestled at the foot of Mt. Asama, surrounded by birch and larch forests.' },
    bullets: {
      zh: ['平均海拔1300米的清爽体验', '壮丽的浅间山全景背景', '兼具竞技性与度假休闲感'],
      en: ['Average elevation of 1,300m', 'Panoramic views of Mt. Asama', 'Combines competitive play with resort relaxation'],
    },
  },
  {
    num: '04',
    name: { zh: '轻井泽浅间高尔夫球场', en: 'Karuizawa Asama Golf Course' },
    desc: { zh: '以自然美学著称的度假型高端球场。', en: 'A premium resort course celebrated for its natural aesthetic beauty.' },
    bullets: {
      zh: ['近距离观赏活火山浅间山', '优雅舒缓的球道设计', '管家级会所贴心服务'],
      en: ['Up-close views of active volcano Mt. Asama', 'Gracefully flowing fairway design', 'Butler-level clubhouse service'],
    },
  },
  {
    num: '05',
    name: { zh: '轻井泽72高尔夫东场', en: 'Karuizawa 72 Golf East Course' },
    desc: { zh: '集结了"入山"与"押立"两套世界级球道的综合体。', en: 'A composite venue combining the world-class "Irisawa" and "Oshidate" courses.' },
    bullets: {
      zh: ['入山与押立双重风格体验', '茂密森林环绕的氧吧挥杆', '高难度的果岭线位设计'],
      en: ['Dual-style experience: Irisawa & Oshidate', 'Oxygen-rich swings in dense forest', 'Challenging green position design'],
    },
  },
];

const ITINERARY = [
  {
    day: '01',
    title: { zh: '抵达轻井泽：初遇浅间之美', en: 'Arrival in Karuizawa: First Encounter with Mt. Asama' },
    activities: {
      zh: ['抵达轻井泽车站', '私人专车接送至别墅办理入住', '轻井泽浅间高尔夫球场午后开球'],
      en: ['Arrive at Karuizawa Station', 'Private car transfer to villa check-in', 'Afternoon tee-off at Karuizawa Asama Golf Course'],
    },
    meals: { morning: { zh: '不含', en: 'Not included' }, lunch: { zh: '球场精致轻食', en: 'Course fine dining' }, dinner: { zh: '别墅内私人主厨和牛晚宴', en: 'Private chef wagyu dinner at villa' } },
  },
  {
    day: '02',
    title: { zh: '挑战职业之巅：北场风云', en: 'Challenging the Professional Standard: North Course' },
    activities: {
      zh: ['轻井泽72高尔夫北场全天击球', '体验女子美巡赛级别的场地品质'],
      en: ['Full day at Karuizawa 72 Golf North Course', 'Experience LPGA Tour-grade course quality'],
    },
    meals: { morning: { zh: '别墅欧式早餐', en: 'European breakfast at villa' }, lunch: { zh: '北场会所特色定食', en: 'North Course clubhouse set menu' }, dinner: { zh: '轻井泽高端法式餐厅', en: 'High-end French restaurant in Karuizawa' } },
  },
  {
    day: '03',
    title: { zh: '高原呼吸：太平洋俱乐部的壮阔', en: 'Highland Air: The Grandeur of Taiheiyo Club' },
    activities: {
      zh: ['太平洋俱乐部轻井泽球场挥杆', '在海拔1300米处感受清爽挥杆'],
      en: ['Play at Taiheiyo Club Karuizawa Course', 'Experience refreshing golf at 1,300m elevation'],
    },
    meals: { morning: { zh: '别墅和式早餐', en: 'Japanese breakfast at villa' }, lunch: { zh: '球场景观餐厅午餐', en: 'Scenic course restaurant lunch' }, dinner: { zh: '当地特色怀石料理', en: 'Local kaiseki cuisine' } },
  },
  {
    day: '04',
    title: { zh: '漫步云端：轻井泽人文漫游', en: 'Walking among Clouds: Cultural Stroll in Karuizawa' },
    activities: {
      zh: ['轻井泽旧银座商店街', '白丝瀑布自然巡游', '石之教堂与高原教会建筑之美'],
      en: ['Old Karuizawa Ginza shopping street', 'Shiraito Falls nature tour', 'Stone Church and highland church architecture'],
    },
    meals: { morning: { zh: '别墅精致早餐', en: 'Fine breakfast at villa' }, lunch: { zh: '旧银座百年餐馆', en: 'Century-old restaurant on Old Ginza' }, dinner: { zh: '高奢铁板烧料理', en: 'Premium teppanyaki dining' } },
  },
  {
    day: '05',
    title: { zh: '皇家传奇：私人俱乐部的荣耀', en: 'Royal Legend: The Prestige of a Private Club' },
    activities: {
      zh: ['轻井泽高尔夫俱乐部（尊享挥杆体验）', '深入感受日本最顶级私人球场的底蕴'],
      en: ['Karuizawa Golf Club (exclusive experience)', 'Immerse in Japan\'s most prestigious private course heritage'],
    },
    meals: { morning: { zh: '别墅特制早餐', en: 'Special villa breakfast' }, lunch: { zh: '球场会所高级午餐', en: 'Premium clubhouse lunch' }, dinner: { zh: '森林意式精品餐厅', en: 'Forest Italian fine dining' } },
  },
  {
    day: '06',
    title: { zh: '静谧森林：星野地区的慢生活', en: 'Silent Forest: Slow Living in Hoshino Area' },
    activities: {
      zh: ['榆树街小镇闲逛', '星野温泉蜻蜓之汤洗涤疲劳', '别墅露台私人下午茶'],
      en: ['Stroll Harunire Terrace', 'Relax at Hoshino Tombo-no-yu hot spring', 'Private afternoon tea on villa terrace'],
    },
    meals: { morning: { zh: '别墅慢享早餐', en: 'Leisurely villa breakfast' }, lunch: { zh: '村民食堂季节料理', en: 'Seasonal cuisine at village restaurant' }, dinner: { zh: '顶级河豚或蟹料理专门店', en: 'Premier fugu or crab specialty restaurant' } },
  },
  {
    day: '07',
    title: { zh: '完美收官：东场的终极考验', en: 'Grand Finale: The Ultimate Challenge of East Course' },
    activities: {
      zh: ['轻井泽72高尔夫东场挥杆', '购买轻井泽特色伴手礼', '专车送往车站返程'],
      en: ['Play at Karuizawa 72 Golf East Course', 'Purchase Karuizawa specialty souvenirs', 'Private car transfer to station for departure'],
    },
    meals: { morning: { zh: '别墅告别早餐', en: 'Farewell villa breakfast' }, lunch: { zh: '会所告别午宴', en: 'Farewell lunch at clubhouse' }, dinner: { zh: '不含', en: 'Not included' } },
  },
];

const BUDGET = [
  { item: { zh: '奢华下榻', en: 'Luxury Accommodation' }, amount: '¥25,000', note: { zh: 'Terrace Villa Foresta Asama 6晚独立别墅住宿（双人分享），含私人管家服务。', en: '6 nights at Terrace Villa Foresta Asama independent villa (twin share), including private butler service.' } },
  { item: { zh: '顶级果岭费', en: 'Premium Green Fees' }, amount: '¥15,000', note: { zh: '包含5场顶级球场的果岭费、球车费及部分高端私人球场的特别预约费用。', en: 'Includes green fees, cart fees for 5 top courses, plus special reservation fees for exclusive private courses.' } },
  { item: { zh: '饕餮餐饮', en: 'Fine Dining' }, amount: '¥12,000', note: { zh: '每日别墅内高端早餐、球场精致午餐、以及包含米其林/怀石料理在内的尊享晚宴。', en: 'Daily high-end villa breakfast, course fine lunch, and premium dinners including Michelin/kaiseki cuisine.' } },
  { item: { zh: '专车与服务', en: 'Private Transfer & Services' }, amount: '¥8,000', note: { zh: '全行程私人Alphard商务车接送、专业高尔夫领队服务及所有景点门票、温泉费用。', en: 'Full-trip private Alphard transfers, professional golf guide service, all attraction tickets and onsen fees.' } },
];

export default function GolfPlanPage() {
  const { language } = useLanguage();
  const lang = language as 'zh' | 'en' | 'ja';
  const l = lang === 'ja' ? 'zh' : lang; // fallback ja → zh for content

  const [courseImages, setCourseImages] = useState<MediaItem[]>([]);

  useEffect(() => {
    fetch('/api/media/images?category=plan-golf')
      .then((r) => r.ok ? r.json() : [])
      .then((data: MediaItem[]) => setCourseImages(data))
      .catch(() => {});
  }, []);

  // Map course images by index (up to 5)
  const getCourseImage = (idx: number) => courseImages[idx]?.url ?? null;

  return (
    <div className="min-h-screen bg-dark pt-20">

      {/* ── Section 1: Hero ── */}
      <section className="relative h-[60vh] min-h-[480px] overflow-hidden">
        {courseImages[0] ? (
          <Image
            src={courseImages[0].url}
            alt="golf hero"
            fill
            unoptimized
            className="object-cover brightness-[0.6] animate-kenburns"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-[#0a0a0a] to-[#1a1510]" />
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-dark" />
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6">
          <div className="flex items-center justify-center gap-4 mb-5">
            <div className="w-12 h-px bg-gold/40" />
            <span className="text-gold text-[10px] tracking-[0.5em] font-display uppercase">
              避暑胜地の皇家挥杆，森林深处の隐逸奢享
            </span>
            <div className="w-12 h-px bg-gold/40" />
          </div>
          <h1 className="font-display font-bold text-gold text-4xl md:text-5xl tracking-tight mb-3 uppercase px-4">
            Eternal Greens
          </h1>
          <p className="font-display text-white/60 text-sm uppercase tracking-[0.4em] mb-4">
            The Karuizawa Royal Golf Retreat
          </p>
          <div className="h-px w-64 bg-gradient-to-r from-transparent via-gold/60 to-transparent mb-6" />
          <p className="font-kaiti italic text-[#f9e498] text-lg tracking-[0.2em] leading-relaxed">
            在日本最具代表性的度假胜地轻井泽，开启极致奢华的假日时光。
          </p>
        </div>
      </section>

      {/* ── The Prestige + Villa intro ── */}
      <section className="bg-white/5 border-y border-white/5">
        <div className="max-w-5xl mx-auto px-8 py-10 flex flex-col md:flex-row gap-8 items-center">
          <div className="md:w-1/3">
            <h3 className="text-gold text-xl font-display font-bold mb-3 tracking-widest uppercase">The Prestige</h3>
            <div className="w-12 h-1 bg-gold mb-3" />
            <p className="text-[10px] text-white/40 uppercase tracking-widest leading-loose">
              Celebrity Villa Area<br />Exclusive Resort<br />Elite Sanctuary
            </p>
          </div>
          <div className="md:flex-1">
            <p className="font-kaiti italic text-white/80 text-sm leading-relaxed">
              轻井泽作为日本最负盛名的名流别墅区，自明治时代起便是皇室与政商名流的夏季避暑胜地。这里不仅拥有得天独厚的清凉气候，更是身份与品位的象征。在这里挥杆，不仅仅是一场运动，更是一种跨越百年的贵族社交传统的延续，被公认为全日本顶级社会精英的私人后花园。
            </p>
          </div>
        </div>
      </section>

      {/* Villa section */}
      <section className="max-w-5xl mx-auto px-8 py-12">
        <div className="relative overflow-hidden mb-8">
          {courseImages[1] ? (
            <div className="relative w-full aspect-[21/9] overflow-hidden">
              <Image src={courseImages[1].url} alt="villa" fill unoptimized className="object-cover brightness-90 animate-kenburns" />
            </div>
          ) : (
            <div className="w-full aspect-[21/9] bg-white/5 flex items-center justify-center border border-white/5">
              <span className="font-display text-white/10 text-xs uppercase tracking-widest">Villa Image</span>
            </div>
          )}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <div className="text-gold text-[10px] font-bold uppercase tracking-[0.4em] mb-4">Accommodation</div>
            <h3 className="text-3xl font-display font-bold text-white mb-4">Terrace Villa<br />Foresta Asama</h3>
          </div>
          <p className="font-kaiti italic text-white/60 text-sm leading-relaxed self-center">
            下榻于此，您将体验到绝佳的私密性与尊贵感。这些独立别墅不仅提供了极致宽敞的居住空间，更配备了俯瞰浅间山的私人景观露台。这并非仅仅是一家酒店，更是一处深植于自然中的"归家之所"。您可以在森林的环抱中享受完全不被打扰的宁静，在开放式的客厅中感受自然光的流淌，真正实现奢华与荒野的完美融合。
          </p>
        </div>
      </section>

      {/* ── Section 2: Golf Courses ── */}
      <section className="bg-white/3 border-y border-white/5 py-16 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center gap-8 mb-10">
            <h2 className="font-display font-bold text-gold text-3xl tracking-widest uppercase whitespace-nowrap">The Golf Experience</h2>
            <div className="h-px flex-1 bg-gold/20" />
          </div>
          <div className="space-y-6">
            {GOLF_COURSES.map((course, idx) => {
              const imgUrl = getCourseImage(idx + 2); // skip first 2 (hero + villa)
              return (
                <div key={course.num} className="flex gap-6 items-start border-b border-white/5 pb-6 last:border-0">
                  {/* Image */}
                  <div className="w-[28%] flex-shrink-0 relative overflow-hidden">
                    {imgUrl ? (
                      <div className="relative w-full aspect-[4/3] overflow-hidden">
                        <Image src={imgUrl} alt={course.name.en} fill unoptimized className="object-cover brightness-90 animate-kenburns" />
                        <div className="absolute bottom-2 left-2 font-display font-bold text-white text-xs tracking-widest">{course.num}</div>
                      </div>
                    ) : (
                      <div className="w-full aspect-[4/3] bg-white/5 border border-white/5 flex items-center justify-center relative">
                        <span className="font-display text-gold/20 text-2xl font-bold">{course.num}</span>
                      </div>
                    )}
                  </div>
                  {/* Content */}
                  <div className="flex-1">
                    <h3 className="font-serif font-bold text-gold text-lg mb-1">
                      {course.name.zh} <span className="text-white/30 text-sm">({course.name.en})</span>
                    </h3>
                    <p className="font-kaiti italic text-white/70 text-xs leading-relaxed mb-2">{course.desc[l]}</p>
                    <div className="space-y-1">
                      {course.bullets[l].map((b, i) => (
                        <div key={i} className="flex items-center gap-2 text-[10px] text-gold/80 font-bold uppercase tracking-widest">
                          <span className="w-1 h-1 bg-gold rounded-full flex-shrink-0" />
                          {b}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Section 3: Itinerary ── */}
      <section className="py-16 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center gap-8 mb-10">
            <h2 className="font-display font-bold text-gold text-3xl tracking-widest uppercase whitespace-nowrap">Journey Details</h2>
            <div className="h-px flex-1 bg-gold/20" />
          </div>
          <div className="space-y-4">
            {ITINERARY.map((day) => (
              <div key={day.day} className="flex gap-6 border-b border-white/5 pb-4 last:border-0">
                <div className="w-10 flex-shrink-0 text-2xl font-display font-bold text-gold/30">{day.day}</div>
                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-serif font-bold text-white text-base mb-2">{day.title[l]}</h3>
                    <div className="bg-white/5 p-3">
                      <ul className="space-y-1">
                        {day.activities[l].map((act, i) => (
                          <li key={i} className="font-kaiti text-white/70 text-xs flex items-start gap-2">
                            <span className="text-gold">✦</span>{act}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  <div className="bg-gold/5 p-3 flex flex-col justify-center space-y-2 text-xs font-kaiti">
                    {[
                      { label: lang === 'en' ? 'Morning' : '早', val: day.meals.morning[l] },
                      { label: lang === 'en' ? 'Lunch' : '午',   val: day.meals.lunch[l] },
                      { label: lang === 'en' ? 'Dinner' : '晚',  val: day.meals.dinner[l] },
                    ].map(({ label, val }, i, arr) => (
                      <div key={label} className={`flex justify-between ${i < arr.length - 1 ? 'border-b border-white/5 pb-2' : ''}`}>
                        <span className="text-white/40 uppercase tracking-widest">{label}</span>
                        <span className="text-white/80">{val}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Section 4: Summary + Budget ── */}
      <section className="bg-white/3 border-t border-white/5 py-16 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <div className="text-gold text-sm tracking-[0.8em] uppercase mb-4">Conclusion</div>
          <h2 className="font-display font-bold text-white text-4xl tracking-widest uppercase mb-10">EXCELLENCE DEFINED</h2>

          <h3 className="font-display font-bold text-gold text-lg tracking-widest uppercase mb-4">
            尊享总结 / Plan Summary
          </h3>
          <p className="font-kaiti italic font-bold text-[#f9e498] text-xl leading-relaxed mb-12 drop-shadow-[0_2px_8px_rgba(212,175,55,0.4)]">
            此行不仅是一场对顶级绿茵的征服，更是一次深入日本皇室避暑地核心的灵魂洗礼。我们严格筛选了轻井泽最具代表性的五大球场，涵盖了职业赛事地与极秘私享地，确保每一场挥杆都具有非凡意义。搭配极致私密的Terrace Villa Foresta Asama别墅生活，这套行程为追求生活品质的社会精英量身打造，在轻井泽的松林与流云间，重塑奢华高尔夫旅行的新标杆。
          </p>

          {/* Budget table */}
          <div className="text-left">
            <div className="text-gold text-[10px] font-bold uppercase tracking-[0.4em] mb-3">
              预算概览 / Budget Overview
            </div>
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-white/5 text-gold uppercase tracking-widest">
                  <th className="p-3 border border-white/10">
                    {lang === 'en' ? 'Item' : '项目'}
                  </th>
                  <th className="p-3 border border-white/10">
                    {lang === 'en' ? 'Amount (per person)' : '金额 (每人)'}
                  </th>
                  <th className="p-3 border border-white/10 hidden md:table-cell">
                    {lang === 'en' ? 'Notes' : '说明'}
                  </th>
                </tr>
              </thead>
              <tbody className="font-kaiti text-white/70">
                {BUDGET.map((row) => (
                  <tr key={row.item.en}>
                    <td className="p-3 border border-white/10 font-bold text-white">{row.item[l]}</td>
                    <td className="p-3 border border-white/10 text-gold">{row.amount}</td>
                    <td className="p-3 border border-white/10 italic hidden md:table-cell">{row.note[l]}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-gold/10 text-gold font-bold">
                  <td className="p-3 border border-white/10">
                    {lang === 'en' ? 'Total' : '合计 / Total'}
                  </td>
                  <td className="p-3 border border-white/10">¥60,000</td>
                  <td className="p-3 border border-white/10 text-[10px] hidden md:table-cell">
                    {lang === 'en' ? 'Estimated Total (Per Person)' : '预估总额 (每人)'}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </section>

      {/* Back to plans */}
      <section className="py-12 px-6 text-center">
        <Link
          href="/plans"
          className="inline-block border border-white/10 text-white/40 hover:border-gold/40 hover:text-gold font-display text-xs uppercase tracking-[0.4em] px-8 py-3 transition-all duration-300"
        >
          ← Back to Plans
        </Link>
      </section>
    </div>
  );
}
