export interface Palette {
  name: string;
  bg: string; bg2: string; paper: string;
  ink: string; inkSoft: string; inkMute: string;
  line: string; accent: string; accent2: string; gold: string;
  swatch: [string, string, string];
}
export type PaletteKey = 'forest' | 'mist' | 'ink';
export interface FlowItem { n: string; t: string; d: string; cta: string; }
export interface Villa { name: string; spec: string; tag: string; label: string; }
export interface Season { key: string; jp: string; en: string; sub: string; desc: string; }
export interface Plan { tag: string; n: string; t: string; d: string; p: string; label: string; }
export interface Translation {
  eyebrow: string;
  heroTitleA: string; heroTitleB: string; heroSub: string;
  reserve: string;
  bookCheckIn: string; bookCheckOut: string; bookGuests: string; bookVilla: string; bookCheck: string;
  flowEyebrow: string; flowTitle: string; flowSub: string;
  flow: FlowItem[];
  villasEyebrow: string; villasTitle: string;
  villas: Villa[];
  seasonEyebrow: string; seasonTitle: string;
  seasons: Season[];
  plansEyebrow: string; plansTitle: string; plansSub: string;
  plans: Plan[];
  locEyebrow: string; locTitle: string; locDesc: string;
  addr: string;
  access: [string, string][];
  ctaTitle: string; ctaTitle2: string; ctaSub: string;
  footerTag: string; rights: string;
  nav: { stay: string; plans: string; around: string; about: string; contact: string; };
}
