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

interface HeroData {
  background_image_url: string;
  eyebrow: LangObj; title_line1: LangObj; title_line2: LangObj; subtitle: LangObj;
}
interface HeroStat { id?: number; value_text: string; label: LangObj; display_order: number }

export default function HeroAdminPage() {
  const router = useRouter();
  const [hero, setHero] = useState<HeroData>({ background_image_url:'', eyebrow:emptyL(), title_line1:emptyL(), title_line2:emptyL(), subtitle:emptyL() });
  const [stats, setStats] = useState<HeroStat[]>([]);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');
  const [lang, setLang] = useState<'zh'|'ja'|'en'>('ja');
  const [newStat, setNewStat] = useState<HeroStat>({ value_text:'', label:emptyL(), display_order:0 });
  const [addingNewStat, setAddingNewStat] = useState(false);

  useEffect(() => {
    fetch(`${BASE}/api/admin/hero`).then(r => {
      if (r.status === 401) { router.push(`${BASE}/admin/login`); return null; }
      return r.json();
    }).then(d => {
      if (!d) return;
      setHero({ background_image_url: d.background_image_url||'', eyebrow: d.eyebrow||emptyL(), title_line1: d.title_line1||emptyL(), title_line2: d.title_line2||emptyL(), subtitle: d.subtitle||emptyL() });
      setStats(d.stats || []);
    }).catch(console.error);
  }, []);

  async function saveHero() {
    setSaving(true); setErr(''); setMsg('');
    try {
      const res = await fetch(`${BASE}/api/admin/hero`, { method:'PUT', headers:{'Content-Type':'application/json'}, body:JSON.stringify(hero) });
      if (res.ok) { setMsg('保存しました'); setTimeout(() => setMsg(''), 3000); }
      else setErr('保存に失敗しました');
    } finally { setSaving(false); }
  }

  async function addStat() {
    try {
      const res = await fetch(`${BASE}/api/admin/hero/stats`, { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(newStat) });
      if (res.ok) {
        const created = await res.json();
        setStats(prev => [...prev, created]);
        setNewStat({ value_text:'', label:emptyL(), display_order:0 });
        setAddingNewStat(false);
        setMsg('統計を追加しました'); setTimeout(() => setMsg(''), 3000);
      } else setErr('追加に失敗しました');
    } catch { setErr('追加に失敗しました'); }
  }

  async function deleteStat(id: number) {
    if (!confirm('削除しますか？')) return;
    try {
      const res = await fetch(`${BASE}/api/admin/hero/stats/${id}`, { method:'DELETE' });
      if (res.ok) { setStats(prev => prev.filter(s => s.id !== id)); setMsg('削除しました'); setTimeout(() => setMsg(''), 3000); }
      else setErr('削除に失敗しました');
    } catch { setErr('削除に失敗しました'); }
  }

  const setL = (field: keyof HeroData, l: 'zh'|'ja'|'en', val: string) => {
    setHero(prev => ({ ...prev, [field]: { ...(prev[field] as LangObj), [l]: val } }));
  };

  return (
    <div style={S.wrap}>
      <a href={`${BASE}/admin`} style={S.backLink}>← 管理画面トップ</a>
      <div style={S.header}>
        <h1 style={S.title}>Hero セクション</h1>
        <button onClick={saveHero} disabled={saving} style={S.saveBtn}>{saving ? '保存中...' : '保存'}</button>
      </div>
      {msg && <div style={S.msg}>{msg}</div>}
      {err && <div style={S.errMsg}>{err}</div>}

      <div style={S.section}>
        <label style={S.lbl}>背景画像 URL</label>
        <input style={S.inp} value={hero.background_image_url} onChange={e => setHero({...hero, background_image_url:e.target.value})} placeholder="https://..." />
        <p style={S.hint}>空白の場合はプレースホルダー表示</p>
      </div>

      <div style={{ display:'flex', gap:0, marginBottom:8 }}>
        {(['zh','ja','en'] as const).map(l => <button key={l} onClick={() => setLang(l)} style={S.tabBtn(lang===l)}>{l==='zh'?'CN':l==='ja'?'JA':'EN'}</button>)}
      </div>

      {(['eyebrow','title_line1','title_line2','subtitle'] as (keyof HeroData)[]).map(field => (
        <div key={String(field)} style={S.section}>
          <label style={S.lbl}>{String(field).replace(/_/g,' ')}</label>
          {field === 'subtitle' ? (
            <textarea style={S.textarea} value={(hero[field] as LangObj)[lang]||''} onChange={e => setL(field, lang, e.target.value)} />
          ) : (
            <input style={S.inp} value={(hero[field] as LangObj)[lang]||''} onChange={e => setL(field, lang, e.target.value)} />
          )}
        </div>
      ))}

      <div style={S.section}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
          <label style={{ ...S.lbl, margin:0 }}>統計データ</label>
          <button onClick={() => setAddingNewStat(true)} style={{ background:'#222', color:'#c9a96e', border:'1px solid #c9a96e', padding:'6px 14px', borderRadius:4, cursor:'pointer', fontSize:12 }}>+ 追加</button>
        </div>

        {addingNewStat && (
          <div style={{ background:'#1a1a1a', border:'1px solid #333', borderRadius:6, padding:16, marginBottom:16 }}>
            <div style={{ marginBottom:10 }}>
              <label style={S.lbl}>表示値（例: 4,000坪）</label>
              <input style={S.inp} value={newStat.value_text} onChange={e => setNewStat({...newStat, value_text:e.target.value})} />
            </div>
            <div style={{ marginBottom:10 }}>
              <label style={S.lbl}>ラベル ({lang})</label>
              <input style={S.inp} value={newStat.label[lang]} onChange={e => setNewStat({...newStat, label:{...newStat.label, [lang]:e.target.value}})} />
            </div>
            <div style={{ marginBottom:10 }}>
              <label style={S.lbl}>表示順</label>
              <input type="number" style={S.inp} value={newStat.display_order} onChange={e => setNewStat({...newStat, display_order:Number(e.target.value)})} />
            </div>
            <div style={{ display:'flex', gap:8 }}>
              <button onClick={addStat} style={S.saveBtn}>追加</button>
              <button onClick={() => setAddingNewStat(false)} style={{ background:'#333', color:'#fff', border:'none', padding:'10px 20px', borderRadius:4, cursor:'pointer', fontSize:13 }}>キャンセル</button>
            </div>
          </div>
        )}

        {stats.length === 0 ? (
          <p style={{ color:'#555', fontSize:13 }}>統計データなし</p>
        ) : (
          <div style={{ display:'grid', gap:8 }}>
            {stats.map(s => (
              <div key={s.id} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'10px 14px', background:'#1a1a1a', borderRadius:4, border:'1px solid #2a2a2a' }}>
                <div>
                  <span style={{ color:'#c9a96e', fontWeight:600, marginRight:12 }}>{s.value_text}</span>
                  <span style={{ color:'#aaa', fontSize:13 }}>{s.label[lang] || s.label.ja}</span>
                </div>
                <button onClick={() => s.id && deleteStat(s.id)} style={{ background:'#3a1a1a', color:'#bb6d6d', border:'1px solid #6a2d2d', padding:'4px 10px', borderRadius:4, cursor:'pointer', fontSize:12 }}>削除</button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
