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

interface LocationData {
  eyebrow: LangObj; title: LangObj; description: LangObj; address: LangObj; map_image_url: string;
}
interface AccessItem { id?: number; origin: LangObj; duration: LangObj; display_order: number }
const emptyAccess = (): AccessItem => ({ origin:emptyL(), duration:emptyL(), display_order:0 });

export default function LocationAdminPage() {
  const router = useRouter();
  const [location, setLocation] = useState<LocationData>({ eyebrow:emptyL(), title:emptyL(), description:emptyL(), address:emptyL(), map_image_url:'' });
  const [access, setAccess] = useState<AccessItem[]>([]);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');
  const [lang, setLang] = useState<'zh'|'ja'|'en'>('ja');
  const [editingAccess, setEditingAccess] = useState<AccessItem | null>(null);
  const [editingAccessIsNew, setEditingAccessIsNew] = useState(false);
  const [accessSaving, setAccessSaving] = useState(false);

  useEffect(() => {
    fetch(`${BASE}/api/admin/location`).then(r => {
      if (r.status === 401) { router.push(`${BASE}/admin/login`); return null; }
      return r.json();
    }).then(d => {
      if (!d) return;
      setLocation({
        eyebrow: d.eyebrow||emptyL(), title: d.title||emptyL(),
        description: d.description||emptyL(), address: d.address||emptyL(),
        map_image_url: d.map_image_url||'',
      });
      setAccess(d.access || []);
    }).catch(console.error);
  }, []);

  async function saveLocation() {
    setSaving(true); setErr(''); setMsg('');
    try {
      const res = await fetch(`${BASE}/api/admin/location`, { method:'PUT', headers:{'Content-Type':'application/json'}, body:JSON.stringify(location) });
      if (res.ok) { setMsg('保存しました'); setTimeout(() => setMsg(''), 3000); }
      else setErr('保存に失敗しました');
    } finally { setSaving(false); }
  }

  async function saveAccess() {
    if (!editingAccess) return;
    setAccessSaving(true);
    try {
      const isNew = editingAccessIsNew;
      const url = isNew ? `${BASE}/api/admin/location/access` : `${BASE}/api/admin/location/access/${editingAccess.id}`;
      const method = isNew ? 'POST' : 'PUT';
      const res = await fetch(url, { method, headers:{'Content-Type':'application/json'}, body:JSON.stringify(editingAccess) });
      if (res.ok) {
        const saved = await res.json();
        if (isNew) setAccess(prev => [...prev, saved]);
        else setAccess(prev => prev.map(a => a.id === saved.id ? saved : a));
        setEditingAccess(null);
        setMsg('保存しました'); setTimeout(() => setMsg(''), 3000);
      } else setErr('保存に失敗しました');
    } finally { setAccessSaving(false); }
  }

  async function deleteAccess(id: number) {
    if (!confirm('削除しますか？')) return;
    try {
      const res = await fetch(`${BASE}/api/admin/location/access/${id}`, { method:'DELETE' });
      if (res.ok) { setAccess(prev => prev.filter(a => a.id !== id)); setMsg('削除しました'); setTimeout(() => setMsg(''), 3000); }
      else setErr('削除に失敗しました');
    } catch { setErr('削除に失敗しました'); }
  }

  const setLL = (field: keyof LocationData, l: 'zh'|'ja'|'en', val: string) => {
    setLocation(prev => ({ ...prev, [field]: { ...(prev[field] as LangObj), [l]: val } }));
  };
  const setAL = (field: 'origin'|'duration', l: 'zh'|'ja'|'en', val: string) => {
    setEditingAccess(prev => prev ? { ...prev, [field]: { ...prev[field], [l]: val } } : prev);
  };

  return (
    <div style={S.wrap}>
      <a href={`${BASE}/admin`} style={S.backLink}>← 管理画面トップ</a>
      <div style={S.header}>
        <h1 style={S.title}>Location セクション</h1>
        <button onClick={saveLocation} disabled={saving} style={S.saveBtn}>{saving ? '保存中...' : '保存'}</button>
      </div>
      {msg && <div style={S.msg}>{msg}</div>}
      {err && <div style={S.errMsg}>{err}</div>}

      <div style={{ display:'flex', gap:0, marginBottom:16 }}>
        {(['zh','ja','en'] as const).map(l => <button key={l} onClick={() => setLang(l)} style={S.tabBtn(lang===l)}>{l==='zh'?'CN':l==='ja'?'JA':'EN'}</button>)}
      </div>

      {(['eyebrow','title','description','address'] as (keyof LocationData)[]).map(field => (
        <div key={String(field)} style={S.section}>
          <label style={S.lbl}>{String(field)} ({lang})</label>
          {(field === 'description' || field === 'address') ? (
            <textarea style={S.textarea} value={(location[field] as LangObj)[lang]||''} onChange={e => setLL(field, lang, e.target.value)} />
          ) : (
            <input style={S.inp} value={(location[field] as LangObj)[lang]||''} onChange={e => setLL(field, lang, e.target.value)} />
          )}
        </div>
      ))}

      <div style={S.section}>
        <label style={S.lbl}>地図画像 URL</label>
        <input style={S.inp} value={location.map_image_url} onChange={e => setLocation({...location, map_image_url:e.target.value})} placeholder="https://..." />
      </div>

      <div style={S.section}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
          <label style={{ ...S.lbl, margin:0 }}>アクセス情報</label>
          <button onClick={() => { setEditingAccess(emptyAccess()); setEditingAccessIsNew(true); }} style={{ background:'#222', color:'#c9a96e', border:'1px solid #c9a96e', padding:'6px 14px', borderRadius:4, cursor:'pointer', fontSize:12 }}>+ 追加</button>
        </div>

        {editingAccess && (
          <div style={{ background:'#1a1a1a', border:'1px solid #333', borderRadius:6, padding:20, marginBottom:16 }}>
            <div style={{ marginBottom:12 }}>
              <label style={S.lbl}>出発地 ({lang})</label>
              <input style={S.inp} value={editingAccess.origin[lang]||''} onChange={e => setAL('origin', lang, e.target.value)} placeholder="例: 東京駅から" />
            </div>
            <div style={{ marginBottom:12 }}>
              <label style={S.lbl}>所要時間 ({lang})</label>
              <input style={S.inp} value={editingAccess.duration[lang]||''} onChange={e => setAL('duration', lang, e.target.value)} placeholder="例: 約80分" />
            </div>
            <div style={{ marginBottom:16 }}>
              <label style={S.lbl}>表示順</label>
              <input type="number" style={S.inp} value={editingAccess.display_order} onChange={e => setEditingAccess({...editingAccess, display_order:Number(e.target.value)})} />
            </div>
            <div style={{ display:'flex', gap:8 }}>
              <button onClick={saveAccess} disabled={accessSaving} style={S.saveBtn}>{accessSaving ? '保存中...' : '保存'}</button>
              <button onClick={() => setEditingAccess(null)} style={{ background:'#333', color:'#fff', border:'none', padding:'10px 20px', borderRadius:4, cursor:'pointer', fontSize:13 }}>キャンセル</button>
            </div>
          </div>
        )}

        {access.length === 0 ? (
          <p style={{ color:'#555', fontSize:13 }}>アクセス情報なし</p>
        ) : (
          <div style={{ display:'grid', gap:8 }}>
            {access.sort((a,b) => a.display_order - b.display_order).map(a => (
              <div key={a.id} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'10px 14px', background:'#1a1a1a', borderRadius:4, border:'1px solid #2a2a2a' }}>
                <div>
                  <span style={{ color:'#fff', marginRight:12 }}>{a.origin[lang] || a.origin.ja}</span>
                  <span style={{ color:'#c9a96e', fontSize:13 }}>{a.duration[lang] || a.duration.ja}</span>
                </div>
                <div style={{ display:'flex', gap:8 }}>
                  <button onClick={() => { setEditingAccess({...a}); setEditingAccessIsNew(false); }} style={{ background:'#222', color:'#c9a96e', border:'1px solid #c9a96e', padding:'4px 10px', borderRadius:4, cursor:'pointer', fontSize:12 }}>編集</button>
                  <button onClick={() => a.id && deleteAccess(a.id)} style={{ background:'#3a1a1a', color:'#bb6d6d', border:'1px solid #6a2d2d', padding:'4px 10px', borderRadius:4, cursor:'pointer', fontSize:12 }}>削除</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
