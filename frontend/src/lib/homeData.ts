import { getDb, ensureV3Tables } from '@/lib/db';

export async function fetchHomeData(isTest = false) {
  await ensureV3Tables(isTest);
  const db = getDb(isTest);

  const [
    [settingsRows],
    [heroRows],
    [statsRows],
    [heroSlidesRows],
    [flowRows],
    [flowStepsRows],
    [villasRows],
    [seasonsMetaRows],
    [stayPlansRows],
    [locationRows],
    [accessRows],
    [ctaRows],
    [settingsForCta],
    [sectionsRows],
    [videoSectionRows],
    [featuredVideosRows],
  ] = await Promise.all([
    db.query('SELECT * FROM site_settings') as Promise<any[][]>,
    db.query('SELECT * FROM hero_section WHERE id = 1') as Promise<any[][]>,
    db.query('SELECT * FROM hero_stats WHERE is_enabled = 1 ORDER BY display_order ASC') as Promise<any[][]>,
    db.query('SELECT * FROM hero_slides WHERE is_enabled = 1 ORDER BY display_order ASC') as Promise<any[][]>,
    db.query('SELECT * FROM flow_section WHERE id = 1') as Promise<any[][]>,
    db.query('SELECT * FROM flow_steps WHERE is_enabled = 1 ORDER BY display_order ASC') as Promise<any[][]>,
    db.query('SELECT * FROM villas WHERE is_enabled = 1 ORDER BY display_order ASC') as Promise<any[][]>,
    db.query('SELECT * FROM seasons_meta WHERE is_enabled = 1 ORDER BY display_order ASC') as Promise<any[][]>,
    db.query('SELECT * FROM stay_plans WHERE is_enabled = 1 ORDER BY display_order ASC') as Promise<any[][]>,
    db.query('SELECT * FROM location_section WHERE id = 1') as Promise<any[][]>,
    db.query('SELECT * FROM location_access WHERE is_enabled = 1 ORDER BY display_order ASC') as Promise<any[][]>,
    db.query('SELECT * FROM cta_section WHERE id = 1') as Promise<any[][]>,
    db.query("SELECT value_raw FROM site_settings WHERE setting_key = 'reservation_url'") as Promise<any[][]>,
    db.query('SELECT * FROM home_sections ORDER BY display_order ASC') as Promise<any[][]>,
    db.query('SELECT * FROM video_section WHERE id = 1') as Promise<any[][]>,
    db.query('SELECT * FROM featured_videos WHERE is_enabled = 1 ORDER BY display_order ASC') as Promise<any[][]>,
  ]);

  // Settings
  const settings: Record<string, any> = {};
  for (const row of settingsRows as any[]) {
    settings[row.setting_key] = row.value_raw !== null && row.value_raw !== undefined
      ? row.value_raw
      : { zh: row.value_zh ?? '', ja: row.value_ja ?? '', en: row.value_en ?? '' };
  }

  // Hero
  const h = (heroRows as any[])[0] ?? {};
  const hero = {
    background_image_url: h.background_image_url ?? '',
    eyebrow:     { zh: h.eyebrow_zh ?? '',     ja: h.eyebrow_ja ?? '',     en: h.eyebrow_en ?? '' },
    title_line1: { zh: h.title_line1_zh ?? '',  ja: h.title_line1_ja ?? '',  en: h.title_line1_en ?? '' },
    title_line2: { zh: h.title_line2_zh ?? '',  ja: h.title_line2_ja ?? '',  en: h.title_line2_en ?? '' },
    subtitle:    { zh: h.subtitle_zh ?? '',     ja: h.subtitle_ja ?? '',     en: h.subtitle_en ?? '' },
    stats: (statsRows as any[]).map(s => ({
      id: s.id,
      value_text: s.value_text ?? '',
      label: { zh: s.label_zh ?? '', ja: s.label_ja ?? '', en: s.label_en ?? '' },
      display_order: s.display_order ?? 0,
    })),
    slides: (heroSlidesRows as any[]).map(s => ({
      id: s.id, image_url: s.image_url ?? '',
      alt_zh: s.alt_zh ?? '', alt_ja: s.alt_ja ?? '', alt_en: s.alt_en ?? '',
    })),
  };

  // Flow
  const f = (flowRows as any[])[0] ?? {};
  const flow = {
    eyebrow:  { zh: f.eyebrow_zh ?? '',  ja: f.eyebrow_ja ?? '',  en: f.eyebrow_en ?? '' },
    title:    { zh: f.title_zh ?? '',    ja: f.title_ja ?? '',    en: f.title_en ?? '' },
    subtitle: { zh: f.subtitle_zh ?? '', ja: f.subtitle_ja ?? '', en: f.subtitle_en ?? '' },
    steps: (flowStepsRows as any[]).map(step => ({
      id: step.id,
      step_number: step.step_number ?? 0,
      step_label:  { zh: step.step_label_zh ?? '', ja: step.step_label_ja ?? '', en: step.step_label_en ?? '' },
      title:       { zh: step.title_zh ?? '',      ja: step.title_ja ?? '',      en: step.title_en ?? '' },
      description: { zh: step.description_zh ?? '', ja: step.description_ja ?? '', en: step.description_en ?? '' },
      cta_label:   { zh: step.cta_label_zh ?? '',  ja: step.cta_label_ja ?? '',  en: step.cta_label_en ?? '' },
      cta_url: step.cta_url ?? '',
      is_external: step.is_external === 1,
    })),
  };

  // Villas
  const villas = (villasRows as any[]).map(v => ({
    id: v.id, villa_key: v.villa_key ?? '',
    name:        { zh: v.name_zh ?? '',        ja: v.name_ja ?? '',        en: v.name_en ?? '' },
    spec:        { zh: v.spec_zh ?? '',        ja: v.spec_ja ?? '',        en: v.spec_en ?? '' },
    tag:         { zh: v.tag_zh ?? '',         ja: v.tag_ja ?? '',         en: v.tag_en ?? '' },
    description: { zh: v.description_zh ?? '', ja: v.description_ja ?? '', en: v.description_en ?? '' },
    main_image_url: v.main_image_url ?? '',
  }));

  // Seasons meta
  const seasonsMeta = (seasonsMetaRows as any[]).map(r => ({
    season: r.season,
    jp_label: r.jp_label ?? '',
    en_label: r.en_label ?? '',
    sub:     { zh: r.sub_zh ?? '',     ja: r.sub_ja ?? '',     en: r.sub_en ?? '' },
    caption: { zh: r.caption_zh ?? '', ja: r.caption_ja ?? '', en: r.caption_en ?? '' },
    main_image_url: r.main_image_url ?? '',
  }));

  // Plans
  const plans = (stayPlansRows as any[]).map(p => ({
    id: p.id, plan_key: p.plan_key ?? '',
    tag:             { zh: p.tag_zh ?? '',         ja: p.tag_ja ?? '',         en: p.tag_en ?? '' },
    step_number_text: p.step_number_text ?? '',
    title:           { zh: p.title_zh ?? '',       ja: p.title_ja ?? '',       en: p.title_en ?? '' },
    description:     { zh: p.description_zh ?? '', ja: p.description_ja ?? '', en: p.description_en ?? '' },
    price_text: p.price_text ?? '',
    main_image_url: p.main_image_url ?? '',
    cta_url: p.cta_url ?? '',
    is_external: p.is_external === 1,
  }));

  // Location
  const l = (locationRows as any[])[0] ?? {};
  const location = {
    eyebrow:     { zh: l.eyebrow_zh ?? '',     ja: l.eyebrow_ja ?? '',     en: l.eyebrow_en ?? '' },
    title:       { zh: l.title_zh ?? '',       ja: l.title_ja ?? '',       en: l.title_en ?? '' },
    description: { zh: l.description_zh ?? '', ja: l.description_ja ?? '', en: l.description_en ?? '' },
    address:     { zh: l.address_zh ?? '',     ja: l.address_ja ?? '',     en: l.address_en ?? '' },
    map_image_url: l.map_image_url ?? '',
    access: (accessRows as any[]).map(a => ({
      id: a.id,
      origin:   { zh: a.origin_zh ?? '',   ja: a.origin_ja ?? '',   en: a.origin_en ?? '' },
      duration: { zh: a.duration_zh ?? '', ja: a.duration_ja ?? '', en: a.duration_en ?? '' },
    })),
  };

  // CTA
  const c = (ctaRows as any[])[0] ?? {};
  const reservationUrl = (settingsForCta as any[])[0]?.value_raw ?? '';
  const cta = {
    eyebrow:         { zh: c.eyebrow_zh ?? '',         ja: c.eyebrow_ja ?? '',         en: c.eyebrow_en ?? '' },
    title_line1:     { zh: c.title_line1_zh ?? '',     ja: c.title_line1_ja ?? '',     en: c.title_line1_en ?? '' },
    title_line2:     { zh: c.title_line2_zh ?? '',     ja: c.title_line2_ja ?? '',     en: c.title_line2_en ?? '' },
    subtitle:        { zh: c.subtitle_zh ?? '',        ja: c.subtitle_ja ?? '',        en: c.subtitle_en ?? '' },
    primary_label:   { zh: c.primary_label_zh ?? '',   ja: c.primary_label_ja ?? '',   en: c.primary_label_en ?? '' },
    primary_url:     c.primary_url || reservationUrl,
    secondary_label: { zh: c.secondary_label_zh ?? '', ja: c.secondary_label_ja ?? '', en: c.secondary_label_en ?? '' },
    secondary_url:   c.secondary_url ?? '',
  };

  // Sections
  const sections = (sectionsRows as any[]).map(r => ({
    section_key:   r.section_key,
    display_order: r.display_order ?? 0,
    is_enabled:    r.is_enabled === 1,
  }));

  const vs = (videoSectionRows as any[])[0] ?? {};
  const videos = {
    eyebrow:  { zh: vs.eyebrow_zh ?? '',  ja: vs.eyebrow_ja ?? '',  en: vs.eyebrow_en ?? '' },
    title:    { zh: vs.title_zh ?? '',    ja: vs.title_ja ?? '',    en: vs.title_en ?? '' },
    subtitle: { zh: vs.subtitle_zh ?? '', ja: vs.subtitle_ja ?? '', en: vs.subtitle_en ?? '' },
    videos: (featuredVideosRows as any[]).map(r => ({
      id: r.id,
      title:         { zh: r.title_zh ?? '',       ja: r.title_ja ?? '',       en: r.title_en ?? '' },
      video_url:     r.video_url ?? '',
      thumbnail_url: r.thumbnail_url ?? '',
      description:   { zh: r.description_zh ?? '', ja: r.description_ja ?? '', en: r.description_en ?? '' },
    })),
  };

  return { settings, hero, flow, villas, seasonsMeta, plans, videos, location, cta, sections };
}
