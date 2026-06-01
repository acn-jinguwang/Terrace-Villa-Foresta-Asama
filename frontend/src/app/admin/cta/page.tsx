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

interface CTAData {
  eyebrow: LangObj; title_line1: LangObj; title_line2: LangObj; subtitle: LangObj;
  primary_label: LangObj; primary_url: string;
  secondary_label: LangObj; secondary_url: string;
}

export default function CTAAdminPage() {
  const router = useRouter();
  const [data, setData] = useState<CTAData>({
    eyebrow:emptyL(), title_line1:emptyL(), title_line2:emptyL(), subtitle:emptyL(),
    primary_label:emptyL(), primary_url:'',
    secondary_label:emptyL(), secondary_url:'',
  });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');
  const [lang, setLang] = useState<'zh'|'ja'|'en'>('ja');

  useEffect(() => {
    fetch(`${BASE}/api/admin/cta`).then(r => {
      if (r.status === 401) { router.push(`${BASE}/admin/login`); return null; }
      return r.json();
    }).then(d => {
      if (!d) return;
      setData({
        eyebrow: d.eyebrow||emptyL(),
        title_line1: d.title_line1||emptyL(),
        title_line2: d.title_line2||emptyL(),
        subtitle: d.subtitle||emptyL(),
        primary_label: d.primary_label||emptyL(),
        primary_url: d.primary_url||'',
        secondary_label: d.secondary_label||emptyL(),
        secondary_url: d.secondary_url||'',
      });
    }).catch(console.error);
  }, []);

  async function save() {
    setSaving(true); setErr(''); setMsg('');
    try {
      const res = await fetch(`${BASE}/api/admin/cta`, { method:'PUT', headers:{'Content-Type':'application/json'}, body:JSON.stringify(data) });
      if (res.ok) { setMsg('保存しました'); setTimeout(() => setMsg(''), 3000); }
      else setErr('保存に失敗しました');
    } finally { setSaving(false); }
  }

  const setL = (field: keyof CTAData, l: 'zh'|'ja'|'en', val: string) => {
    setData(prev => ({ ...prev, [field]: { ...(prev[field] as LangObj), [l]: val } }));
  };

  const LANG_FIELDS: (keyof CTAData)[] = ['eyebrow','title_line1','title_line2','subtitle','primary_label','secondary_label'];
  const URL_FIELDS: (keyof CTAData)[] = ['primary_url','secondary_url'];

  return (
    <div style={S.wrap}>
      <a href={`${BASE}/admin`} style={S.backLink}>← 管理画面トップ</a>
      <div style={S.header}>
        <h1 style={S.title}>CTA セクション</h1>
        <button onClick={save} disabled={saving} style={S.saveBtn}>{saving ? '保存中...' : '保存'}</button>
      </div>
      {msg && <div style={S.msg}>{msg}</div>}
      {err && <div style={S.errMsg}>{err}</div>}

      <div style={{ display:'flex', gap:0, marginBottom:16 }}>
        {(['zh','ja','en'] as const).map(l => <button key={l} onClick={() => setLang(l)} style={S.tabBtn(lang===l)}>{l==='zh'?'CN':l==='ja'?'JA':'EN'}</button>)}
      </div>

      {LANG_FIELDS.map(field => (
        <div key={String(field)} style={S.section}>
          <label style={S.lbl}>{String(field).replace(/_/g,' ')} ({lang})</label>
          {field === 'subtitle' ? (
            <textarea style={S.textarea} value={(data[field] as LangObj)[lang]||''} onChange={e => setL(field, lang, e.target.value)} />
          ) : (
            <input style={S.inp} value={(data[field] as LangObj)[lang]||''} onChange={e => setL(field, lang, e.target.value)} />
          )}
        </div>
      ))}

      {URL_FIELDS.map(field => (
        <div key={String(field)} style={S.section}>
          <label style={S.lbl}>{String(field).replace(/_/g,' ')}</label>
          <input style={S.inp} value={data[field] as string||''} onChange={e => setData({...data, [field]:e.target.value})} placeholder="https://..." />
          <p style={S.hint}>{field === 'primary_url' ? 'プライマリCTAボタンのリンク先（外部URL）' : 'セカンダリリンクのリンク先'}</p>
        </div>
      ))}
    </div>
  );
}
