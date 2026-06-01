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

interface StayPlan {
  id?: number; plan_key: string; tag: LangObj; step_number_text: string;
  title: LangObj; description: LangObj; price_text: string;
  main_image_url: string; cta_url: string; is_external: boolean; display_order: number;
}
const emptyPlan = (): StayPlan => ({ plan_key:'', tag:emptyL(), step_number_text:'', title:emptyL(), description:emptyL(), price_text:'', main_image_url:'', cta_url:'', is_external:false, display_order:0 });

export default function StayPlansAdminPage() {
  const router = useRouter();
  const [plans, setPlans] = useState<StayPlan[]>([]);
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');
  const [lang, setLang] = useState<'zh'|'ja'|'en'>('ja');
  const [editing, setEditing] = useState<StayPlan | null>(null);
  const [editingIsNew, setEditingIsNew] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch(`${BASE}/api/admin/stay-plans`).then(r => {
      if (r.status === 401) { router.push(`${BASE}/admin/login`); return null; }
      return r.json();
    }).then(d => { if (d) setPlans(Array.isArray(d) ? d : d.plans || []); }).catch(console.error);
  }, []);

  async function save() {
    if (!editing) return;
    setSaving(true);
    try {
      const isNew = editingIsNew;
      const url = isNew ? `${BASE}/api/admin/stay-plans` : `${BASE}/api/admin/stay-plans/${editing.id}`;
      const method = isNew ? 'POST' : 'PUT';
      const res = await fetch(url, { method, headers:{'Content-Type':'application/json'}, body:JSON.stringify(editing) });
      if (res.ok) {
        const saved = await res.json();
        if (isNew) setPlans(prev => [...prev, saved]);
        else setPlans(prev => prev.map(p => p.id === saved.id ? saved : p));
        setEditing(null);
        setMsg('保存しました'); setTimeout(() => setMsg(''), 3000);
      } else setErr('保存に失敗しました');
    } finally { setSaving(false); }
  }

  async function deletePlan(id: number) {
    if (!confirm('削除しますか？')) return;
    try {
      const res = await fetch(`${BASE}/api/admin/stay-plans/${id}`, { method:'DELETE' });
      if (res.ok) { setPlans(prev => prev.filter(p => p.id !== id)); setMsg('削除しました'); setTimeout(() => setMsg(''), 3000); }
      else setErr('削除に失敗しました');
    } catch { setErr('削除に失敗しました'); }
  }

  const setEL = (field: keyof StayPlan, l: 'zh'|'ja'|'en', val: string) => {
    setEditing(prev => prev ? { ...prev, [field]: { ...(prev[field] as LangObj), [l]: val } } : prev);
  };

  return (
    <div style={S.wrap}>
      <a href={`${BASE}/admin`} style={S.backLink}>← 管理画面トップ</a>
      <div style={S.header}>
        <h1 style={S.title}>Stay Plans セクション</h1>
        <button onClick={() => { setEditing(emptyPlan()); setEditingIsNew(true); }} style={S.saveBtn}>+ 新規追加</button>
      </div>
      {msg && <div style={S.msg}>{msg}</div>}
      {err && <div style={S.errMsg}>{err}</div>}

      <div style={{ display:'flex', gap:0, marginBottom:16 }}>
        {(['zh','ja','en'] as const).map(l => <button key={l} onClick={() => setLang(l)} style={S.tabBtn(lang===l)}>{l==='zh'?'CN':l==='ja'?'JA':'EN'}</button>)}
      </div>

      {editing && (
        <div style={S.section}>
          <h3 style={{ color:'#c9a96e', margin:'0 0 20px', fontSize:16 }}>{editingIsNew ? '新規プラン' : 'プラン編集'}</h3>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginBottom:12 }}>
            <div>
              <label style={S.lbl}>Plan Key</label>
              <input style={S.inp} value={editing.plan_key} onChange={e => setEditing({...editing, plan_key:e.target.value})} placeholder="e.g. standard" />
            </div>
            <div>
              <label style={S.lbl}>ステップ番号テキスト</label>
              <input style={S.inp} value={editing.step_number_text} onChange={e => setEditing({...editing, step_number_text:e.target.value})} placeholder="01" />
            </div>
          </div>
          <div style={{ marginBottom:12 }}>
            <label style={S.lbl}>タグ ({lang})</label>
            <input style={S.inp} value={(editing.tag as LangObj)[lang]||''} onChange={e => setEL('tag', lang, e.target.value)} />
          </div>
          <div style={{ marginBottom:12 }}>
            <label style={S.lbl}>タイトル ({lang})</label>
            <input style={S.inp} value={(editing.title as LangObj)[lang]||''} onChange={e => setEL('title', lang, e.target.value)} />
          </div>
          <div style={{ marginBottom:12 }}>
            <label style={S.lbl}>説明 ({lang})</label>
            <textarea style={S.textarea} value={(editing.description as LangObj)[lang]||''} onChange={e => setEL('description', lang, e.target.value)} />
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginBottom:12 }}>
            <div>
              <label style={S.lbl}>価格テキスト</label>
              <input style={S.inp} value={editing.price_text} onChange={e => setEditing({...editing, price_text:e.target.value})} placeholder="¥50,000〜" />
            </div>
            <div>
              <label style={S.lbl}>表示順</label>
              <input type="number" style={S.inp} value={editing.display_order} onChange={e => setEditing({...editing, display_order:Number(e.target.value)})} />
            </div>
          </div>
          <div style={{ marginBottom:12 }}>
            <label style={S.lbl}>メイン画像 URL</label>
            <input style={S.inp} value={editing.main_image_url} onChange={e => setEditing({...editing, main_image_url:e.target.value})} placeholder="https://..." />
          </div>
          <div style={{ marginBottom:12 }}>
            <label style={S.lbl}>CTA URL</label>
            <input style={S.inp} value={editing.cta_url} onChange={e => setEditing({...editing, cta_url:e.target.value})} placeholder="https://... または /path" />
          </div>
          <label style={{ display:'flex', gap:8, alignItems:'center', color:'#ccc', fontSize:13, marginBottom:16, cursor:'pointer' }}>
            <input type="checkbox" checked={editing.is_external} onChange={e => setEditing({...editing, is_external:e.target.checked})} style={{ accentColor:'#c9a96e' }} />
            外部リンク（新タブで開く）
          </label>
          <div style={{ display:'flex', gap:8 }}>
            <button onClick={save} disabled={saving} style={S.saveBtn}>{saving ? '保存中...' : '保存'}</button>
            <button onClick={() => setEditing(null)} style={{ background:'#333', color:'#fff', border:'none', padding:'10px 20px', borderRadius:4, cursor:'pointer', fontSize:13 }}>キャンセル</button>
          </div>
        </div>
      )}

      <div style={S.section}>
        <label style={{ ...S.lbl, marginBottom:16 }}>プラン一覧</label>
        {plans.length === 0 ? (
          <p style={{ color:'#555', fontSize:13 }}>プランなし</p>
        ) : (
          <div style={{ display:'grid', gap:8 }}>
            {plans.sort((a,b) => a.display_order - b.display_order).map(p => (
              <div key={p.id} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'14px 16px', background:'#1a1a1a', borderRadius:4, border:'1px solid #2a2a2a' }}>
                <div>
                  <span style={{ color:'#c9a96e', fontWeight:600, marginRight:12 }}>{p.step_number_text}</span>
                  <span style={{ color:'#fff', marginRight:8 }}>{p.title[lang] || p.title.ja}</span>
                  <span style={{ color:'#888', fontSize:13, marginRight:8 }}>{p.price_text}</span>
                  <span style={{ color:'#555', fontSize:12 }}>{p.plan_key}</span>
                </div>
                <div style={{ display:'flex', gap:8 }}>
                  <button onClick={() => { setEditing({...p}); setEditingIsNew(false); }} style={{ background:'#222', color:'#c9a96e', border:'1px solid #c9a96e', padding:'4px 10px', borderRadius:4, cursor:'pointer', fontSize:12 }}>編集</button>
                  <button onClick={() => p.id && deletePlan(p.id)} style={{ background:'#3a1a1a', color:'#bb6d6d', border:'1px solid #6a2d2d', padding:'4px 10px', borderRadius:4, cursor:'pointer', fontSize:12 }}>削除</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
