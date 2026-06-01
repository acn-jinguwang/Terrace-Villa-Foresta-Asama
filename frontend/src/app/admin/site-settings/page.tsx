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

export default function SiteSettingsPage() {
  const router = useRouter();
  const [data, setData] = useState<any>({ reservation_url:'', default_theme:'onyx', brand_name_zh:'', brand_name_ja:'', brand_name_en:'', brand_tagline_zh:'', brand_tagline_ja:'', brand_tagline_en:'' });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');
  const [lang, setLang] = useState<'zh'|'ja'|'en'>('ja');

  useEffect(() => {
    fetch(`${BASE}/api/admin/site-settings`).then(r => {
      if (r.status === 401) { router.push(`${BASE}/admin/login`); return null; }
      return r.json();
    }).then(d => { if (d) setData(d); }).catch(console.error);
  }, []);

  async function save() {
    setSaving(true); setErr(''); setMsg('');
    try {
      const res = await fetch(`${BASE}/api/admin/site-settings`, { method:'PUT', headers:{'Content-Type':'application/json'}, body:JSON.stringify(data) });
      if (res.ok) { setMsg('保存しました'); setTimeout(() => setMsg(''), 3000); }
      else setErr('保存に失敗しました');
    } finally { setSaving(false); }
  }

  return (
    <div style={S.wrap}>
      <a href={`${BASE}/admin`} style={S.backLink}>← 管理画面トップ</a>
      <div style={S.header}>
        <h1 style={S.title}>サイト設定</h1>
        <button onClick={save} disabled={saving} style={S.saveBtn}>{saving ? '保存中...' : '保存'}</button>
      </div>
      {msg && <div style={S.msg}>{msg}</div>}
      {err && <div style={S.errMsg}>{err}</div>}

      <div style={S.section}>
        <label style={S.lbl}>予約サイトURL</label>
        <input style={S.inp} value={data.reservation_url||''} onChange={e => setData({...data, reservation_url:e.target.value})} placeholder="https://..." />
        <p style={S.hint}>ご予約ボタンの遷移先（外部URL、新タブで開きます）</p>
      </div>

      <div style={S.section}>
        <label style={S.lbl}>デフォルトテーマ</label>
        {[['onyx','Onyx（黒×ゴールド）'],['forest','Forest（ベージュ×森緑）'],['mist','Mist（青墨×金茶）']].map(([val, lbl]) => (
          <label key={val} style={{ display:'flex', gap:10, alignItems:'center', marginBottom:10, color:'#ccc', cursor:'pointer', fontSize:14 }}>
            <input type="radio" name="theme" value={val} checked={data.default_theme===val} onChange={() => setData({...data, default_theme:val})} style={{ accentColor:'#c9a96e' }} />
            {lbl}
          </label>
        ))}
      </div>

      <div style={S.section}>
        <label style={S.lbl}>ブランド名</label>
        <div style={{ display:'flex', gap:0, marginBottom:8 }}>
          {(['zh','ja','en'] as const).map(l => <button key={l} onClick={() => setLang(l)} style={S.tabBtn(lang===l)}>{l==='zh'?'CN':l==='ja'?'JA':'EN'}</button>)}
        </div>
        <input style={S.inp} value={data[`brand_name_${lang}`]||''} onChange={e => setData({...data, [`brand_name_${lang}`]:e.target.value})} />
      </div>

      <div style={S.section}>
        <label style={S.lbl}>タグライン</label>
        <div style={{ display:'flex', gap:0, marginBottom:8 }}>
          {(['zh','ja','en'] as const).map(l => <button key={l} onClick={() => setLang(l)} style={S.tabBtn(lang===l)}>{l==='zh'?'CN':l==='ja'?'JA':'EN'}</button>)}
        </div>
        <input style={S.inp} value={data[`brand_tagline_${lang}`]||''} onChange={e => setData({...data, [`brand_tagline_${lang}`]:e.target.value})} />
      </div>
    </div>
  );
}
