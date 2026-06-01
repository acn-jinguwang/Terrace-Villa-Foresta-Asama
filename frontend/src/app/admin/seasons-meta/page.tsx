'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

const BASE = process.env.NEXT_PUBLIC_BASE_PATH || '';

const S = {
  wrap: { background:'#0a0a0a', minHeight:'100vh', padding:'40px', color:'#fff', fontFamily:'Inter,sans-serif' } as React.CSSProperties,
  header: { display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:32, borderBottom:'1px solid #333', paddingBottom:24 } as React.CSSProperties,
  title: { fontSize:24, fontWeight:600, color:'#fff', margin:0 } as React.CSSProperties,
  saveBtn: { background:'#c9a96e', color:'#000', border:'none', padding:'10px 24px', borderRadius:4, fontWeight:600, cursor:'pointer', fontSize:14 } as React.CSSProperties,
  section: { marginBottom:24, padding:24, background:'#111', borderRadius:8, border:'1px solid #222' } as React.CSSProperties,
  lbl: { display:'block', fontSize:12, color:'#888', marginBottom:6, letterSpacing:'.05em', textTransform:'uppercase' as const },
  inp: { width:'100%', background:'#1a1a1a', border:'1px solid #333', borderRadius:4, padding:'10px 14px', color:'#fff', fontSize:14, outline:'none', boxSizing:'border-box' as const },
  textarea: { width:'100%', background:'#1a1a1a', border:'1px solid #333', borderRadius:4, padding:'10px 14px', color:'#fff', fontSize:14, outline:'none', boxSizing:'border-box' as const, minHeight:80, resize:'vertical' as const },
  hint: { fontSize:11, color:'#555', marginTop:4 },
  msg: { background:'#1a3a1a', border:'1px solid #2d6a2d', color:'#6dbb6d', padding:'12px 16px', borderRadius:4, marginBottom:24, fontSize:13 } as React.CSSProperties,
  errMsg: { background:'#3a1a1a', border:'1px solid #6a2d2d', color:'#bb6d6d', padding:'12px 16px', borderRadius:4, marginBottom:24, fontSize:13 } as React.CSSProperties,
  tabBtn: (active: boolean) => ({ border:'none', padding:'6px 14px', fontSize:11, letterSpacing:'.1em', cursor:'pointer', fontWeight:600, background: active?'#c9a96e':'#333', color: active?'#000':'#999' } as React.CSSProperties),
  backLink: { color:'#888', textDecoration:'none', fontSize:13, marginBottom:24, display:'inline-block' } as React.CSSProperties,
};

interface LangObj { zh: string; ja: string; en: string }
const emptyL = (): LangObj => ({ zh:'', ja:'', en:'' });

interface SeasonMeta {
  season: string; jp_label: string; en_label: string;
  sub: LangObj; caption: LangObj; main_image_url: string; is_enabled: boolean;
}

const SEASONS = [
  { key:'spring', jp:'春', en:'Spring' },
  { key:'summer', jp:'夏', en:'Summer' },
  { key:'autumn', jp:'秋', en:'Autumn' },
  { key:'winter', jp:'冬', en:'Winter' },
];

export default function SeasonsMetaAdminPage() {
  const router = useRouter();
  const [seasons, setSeasons] = useState<Record<string, SeasonMeta>>({});
  const [activeSeason, setActiveSeason] = useState('spring');
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');
  const [lang, setLang] = useState<'zh'|'ja'|'en'>('ja');

  useEffect(() => {
    fetch(`${BASE}/api/admin/seasons-meta`).then(r => {
      if (r.status === 401) { router.push(`${BASE}/admin/login`); return null; }
      return r.json();
    }).then(d => {
      if (!d) return;
      const map: Record<string, SeasonMeta> = {};
      const arr = Array.isArray(d) ? d : d.seasons || [];
      arr.forEach((s: SeasonMeta) => { map[s.season] = s; });
      // Fill in any missing seasons
      SEASONS.forEach(({ key, jp, en }) => {
        if (!map[key]) map[key] = { season:key, jp_label:jp, en_label:en, sub:emptyL(), caption:emptyL(), main_image_url:'', is_enabled:true };
      });
      setSeasons(map);
    }).catch(console.error);
  }, []);

  async function save() {
    const current = seasons[activeSeason];
    if (!current) return;
    setSaving(true); setErr(''); setMsg('');
    try {
      const res = await fetch(`${BASE}/api/admin/seasons-meta/${activeSeason}`, { method:'PUT', headers:{'Content-Type':'application/json'}, body:JSON.stringify(current) });
      if (res.ok) { setMsg('保存しました'); setTimeout(() => setMsg(''), 3000); }
      else setErr('保存に失敗しました');
    } finally { setSaving(false); }
  }

  const current = seasons[activeSeason];
  const setC = (field: keyof SeasonMeta, val: any) => {
    setSeasons(prev => ({ ...prev, [activeSeason]: { ...prev[activeSeason], [field]: val } }));
  };
  const setCL = (field: 'sub'|'caption', l: 'zh'|'ja'|'en', val: string) => {
    setSeasons(prev => ({ ...prev, [activeSeason]: { ...prev[activeSeason], [field]: { ...(prev[activeSeason]?.[field] || emptyL()), [l]: val } } }));
  };

  return (
    <div style={S.wrap}>
      <a href={`${BASE}/admin`} style={S.backLink}>← 管理画面トップ</a>
      <div style={S.header}>
        <h1 style={S.title}>四季 セクション</h1>
        <button onClick={save} disabled={saving} style={S.saveBtn}>{saving ? '保存中...' : '保存'}</button>
      </div>
      {msg && <div style={S.msg}>{msg}</div>}
      {err && <div style={S.errMsg}>{err}</div>}

      {/* Season tabs */}
      <div style={{ display:'flex', gap:0, marginBottom:24 }}>
        {SEASONS.map(({ key, jp, en }) => (
          <button key={key} onClick={() => setActiveSeason(key)} style={{ ...S.tabBtn(activeSeason===key), padding:'8px 20px', fontSize:13 }}>
            {jp} {en}
          </button>
        ))}
      </div>

      {current && (
        <>
          <div style={{ display:'flex', gap:0, marginBottom:16 }}>
            {(['zh','ja','en'] as const).map(l => <button key={l} onClick={() => setLang(l)} style={S.tabBtn(lang===l)}>{l==='zh'?'CN':l==='ja'?'JA':'EN'}</button>)}
          </div>

          <div style={S.section}>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, marginBottom:16 }}>
              <div>
                <label style={S.lbl}>日本語ラベル（例：春）</label>
                <input style={S.inp} value={current.jp_label} onChange={e => setC('jp_label', e.target.value)} />
              </div>
              <div>
                <label style={S.lbl}>英語ラベル（例：Spring）</label>
                <input style={S.inp} value={current.en_label} onChange={e => setC('en_label', e.target.value)} />
              </div>
            </div>
            <div style={{ marginBottom:16 }}>
              <label style={S.lbl}>サブテキスト ({lang})</label>
              <input style={S.inp} value={current.sub[lang]||''} onChange={e => setCL('sub', lang, e.target.value)} placeholder="例: 4月〜6月" />
            </div>
            <div style={{ marginBottom:16 }}>
              <label style={S.lbl}>キャプション ({lang})</label>
              <textarea style={S.textarea} value={current.caption[lang]||''} onChange={e => setCL('caption', lang, e.target.value)} />
            </div>
            <div style={{ marginBottom:16 }}>
              <label style={S.lbl}>メイン画像 URL</label>
              <input style={S.inp} value={current.main_image_url} onChange={e => setC('main_image_url', e.target.value)} placeholder="https://..." />
            </div>
            <label style={{ display:'flex', gap:8, alignItems:'center', color:'#ccc', fontSize:13, cursor:'pointer' }}>
              <input type="checkbox" checked={current.is_enabled} onChange={e => setC('is_enabled', e.target.checked)} style={{ accentColor:'#c9a96e' }} />
              有効（トップページに表示）
            </label>
          </div>
        </>
      )}
    </div>
  );
}
