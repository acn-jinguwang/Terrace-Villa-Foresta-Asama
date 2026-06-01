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

interface Villa {
  id?: number; villa_key: string; name: LangObj; spec: LangObj;
  tag: LangObj; description: LangObj; main_image_url: string; display_order: number;
}
const emptyVilla = (): Villa => ({ villa_key:'', name:emptyL(), spec:emptyL(), tag:emptyL(), description:emptyL(), main_image_url:'', display_order:0 });

export default function VillasAdminPage() {
  const router = useRouter();
  const [villas, setVillas] = useState<Villa[]>([]);
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');
  const [lang, setLang] = useState<'zh'|'ja'|'en'>('ja');
  const [editing, setEditing] = useState<Villa | null>(null);
  const [editingIsNew, setEditingIsNew] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch(`${BASE}/api/admin/villas`).then(r => {
      if (r.status === 401) { router.push(`${BASE}/admin/login`); return null; }
      return r.json();
    }).then(d => { if (d) setVillas(Array.isArray(d) ? d : d.villas || []); }).catch(console.error);
  }, []);

  async function save() {
    if (!editing) return;
    setSaving(true);
    try {
      const isNew = editingIsNew;
      const url = isNew ? `${BASE}/api/admin/villas` : `${BASE}/api/admin/villas/${editing.id}`;
      const method = isNew ? 'POST' : 'PUT';
      const res = await fetch(url, { method, headers:{'Content-Type':'application/json'}, body:JSON.stringify(editing) });
      if (res.ok) {
        const saved = await res.json();
        if (isNew) setVillas(prev => [...prev, saved]);
        else setVillas(prev => prev.map(v => v.id === saved.id ? saved : v));
        setEditing(null);
        setMsg('保存しました'); setTimeout(() => setMsg(''), 3000);
      } else setErr('保存に失敗しました');
    } finally { setSaving(false); }
  }

  async function deleteVilla(id: number) {
    if (!confirm('削除しますか？')) return;
    try {
      const res = await fetch(`${BASE}/api/admin/villas/${id}`, { method:'DELETE' });
      if (res.ok) { setVillas(prev => prev.filter(v => v.id !== id)); setMsg('削除しました'); setTimeout(() => setMsg(''), 3000); }
      else setErr('削除に失敗しました');
    } catch { setErr('削除に失敗しました'); }
  }

  const setEL = (field: keyof Villa, l: 'zh'|'ja'|'en', val: string) => {
    setEditing(prev => prev ? { ...prev, [field]: { ...(prev[field] as LangObj), [l]: val } } : prev);
  };

  return (
    <div style={S.wrap}>
      <a href={`${BASE}/admin`} style={S.backLink}>← 管理画面トップ</a>
      <div style={S.header}>
        <h1 style={S.title}>Villas セクション</h1>
        <button onClick={() => { setEditing(emptyVilla()); setEditingIsNew(true); }} style={S.saveBtn}>+ 新規追加</button>
      </div>
      {msg && <div style={S.msg}>{msg}</div>}
      {err && <div style={S.errMsg}>{err}</div>}

      <div style={{ display:'flex', gap:0, marginBottom:16 }}>
        {(['zh','ja','en'] as const).map(l => <button key={l} onClick={() => setLang(l)} style={S.tabBtn(lang===l)}>{l==='zh'?'CN':l==='ja'?'JA':'EN'}</button>)}
      </div>

      {editing && (
        <div style={S.section}>
          <h3 style={{ color:'#c9a96e', margin:'0 0 20px', fontSize:16 }}>{editingIsNew ? '新規ヴィラ' : 'ヴィラ編集'}</h3>
          <div style={{ marginBottom:12 }}>
            <label style={S.lbl}>Villa Key (英数字・ハイフン)</label>
            <input style={S.inp} value={editing.villa_key} onChange={e => setEditing({...editing, villa_key:e.target.value})} placeholder="e.g. villa-a" />
          </div>
          {(['name','spec','tag'] as (keyof Villa)[]).map(field => (
            <div key={String(field)} style={{ marginBottom:12 }}>
              <label style={S.lbl}>{String(field)} ({lang})</label>
              <input style={S.inp} value={(editing[field] as LangObj)[lang]||''} onChange={e => setEL(field, lang, e.target.value)} />
            </div>
          ))}
          <div style={{ marginBottom:12 }}>
            <label style={S.lbl}>説明 ({lang})</label>
            <textarea style={S.textarea} value={(editing.description as LangObj)[lang]||''} onChange={e => setEL('description', lang, e.target.value)} />
          </div>
          <div style={{ marginBottom:12 }}>
            <label style={S.lbl}>メイン画像 URL</label>
            <input style={S.inp} value={editing.main_image_url} onChange={e => setEditing({...editing, main_image_url:e.target.value})} placeholder="https://..." />
          </div>
          <div style={{ marginBottom:16 }}>
            <label style={S.lbl}>表示順</label>
            <input type="number" style={S.inp} value={editing.display_order} onChange={e => setEditing({...editing, display_order:Number(e.target.value)})} />
          </div>
          <div style={{ display:'flex', gap:8 }}>
            <button onClick={save} disabled={saving} style={S.saveBtn}>{saving ? '保存中...' : '保存'}</button>
            <button onClick={() => setEditing(null)} style={{ background:'#333', color:'#fff', border:'none', padding:'10px 20px', borderRadius:4, cursor:'pointer', fontSize:13 }}>キャンセル</button>
          </div>
        </div>
      )}

      <div style={S.section}>
        <label style={{ ...S.lbl, marginBottom:16 }}>ヴィラ一覧</label>
        {villas.length === 0 ? (
          <p style={{ color:'#555', fontSize:13 }}>ヴィラなし</p>
        ) : (
          <div style={{ display:'grid', gap:8 }}>
            {villas.sort((a,b) => a.display_order - b.display_order).map(v => (
              <div key={v.id} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'14px 16px', background:'#1a1a1a', borderRadius:4, border:'1px solid #2a2a2a' }}>
                <div>
                  <span style={{ color:'#c9a96e', fontWeight:600, marginRight:12 }}>{v.villa_key}</span>
                  <span style={{ color:'#fff', marginRight:8 }}>{v.name[lang] || v.name.ja}</span>
                  <span style={{ color:'#555', fontSize:12 }}>{v.spec[lang] || v.spec.ja}</span>
                </div>
                <div style={{ display:'flex', gap:8 }}>
                  <button onClick={() => { setEditing({...v}); setEditingIsNew(false); }} style={{ background:'#222', color:'#c9a96e', border:'1px solid #c9a96e', padding:'4px 10px', borderRadius:4, cursor:'pointer', fontSize:12 }}>編集</button>
                  <button onClick={() => v.id && deleteVilla(v.id)} style={{ background:'#3a1a1a', color:'#bb6d6d', border:'1px solid #6a2d2d', padding:'4px 10px', borderRadius:4, cursor:'pointer', fontSize:12 }}>削除</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
