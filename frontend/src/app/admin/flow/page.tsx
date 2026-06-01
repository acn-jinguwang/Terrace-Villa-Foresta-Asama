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

interface FlowHeader { eyebrow: LangObj; title: LangObj; subtitle: LangObj }
interface FlowStep {
  id?: number; step_number: number;
  step_label: LangObj; title: LangObj; description: LangObj; cta_label: LangObj;
  cta_url: string; is_external: boolean;
}
const emptyStep = (): FlowStep => ({ step_number:1, step_label:emptyL(), title:emptyL(), description:emptyL(), cta_label:emptyL(), cta_url:'', is_external:false });

export default function FlowAdminPage() {
  const router = useRouter();
  const [header, setHeader] = useState<FlowHeader>({ eyebrow:emptyL(), title:emptyL(), subtitle:emptyL() });
  const [steps, setSteps] = useState<FlowStep[]>([]);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');
  const [lang, setLang] = useState<'zh'|'ja'|'en'>('ja');
  const [editingStep, setEditingStep] = useState<FlowStep | null>(null);
  const [editingStepIsNew, setEditingStepIsNew] = useState(false);
  const [stepSaving, setStepSaving] = useState(false);

  useEffect(() => {
    fetch(`${BASE}/api/admin/flow`).then(r => {
      if (r.status === 401) { router.push(`${BASE}/admin/login`); return null; }
      return r.json();
    }).then(d => {
      if (!d) return;
      setHeader({ eyebrow:d.eyebrow||emptyL(), title:d.title||emptyL(), subtitle:d.subtitle||emptyL() });
      setSteps(d.steps || []);
    }).catch(console.error);
  }, []);

  async function saveHeader() {
    setSaving(true); setErr(''); setMsg('');
    try {
      const res = await fetch(`${BASE}/api/admin/flow`, { method:'PUT', headers:{'Content-Type':'application/json'}, body:JSON.stringify(header) });
      if (res.ok) { setMsg('保存しました'); setTimeout(() => setMsg(''), 3000); }
      else setErr('保存に失敗しました');
    } finally { setSaving(false); }
  }

  async function saveStep() {
    if (!editingStep) return;
    setStepSaving(true);
    try {
      const isNew = editingStepIsNew;
      const url = isNew ? `${BASE}/api/admin/flow/steps` : `${BASE}/api/admin/flow/steps/${editingStep.id}`;
      const method = isNew ? 'POST' : 'PUT';
      const res = await fetch(url, { method, headers:{'Content-Type':'application/json'}, body:JSON.stringify(editingStep) });
      if (res.ok) {
        const saved = await res.json();
        if (isNew) setSteps(prev => [...prev, saved]);
        else setSteps(prev => prev.map(s => s.id === saved.id ? saved : s));
        setEditingStep(null);
        setMsg('保存しました'); setTimeout(() => setMsg(''), 3000);
      } else setErr('保存に失敗しました');
    } finally { setStepSaving(false); }
  }

  async function deleteStep(id: number) {
    if (!confirm('削除しますか？')) return;
    try {
      const res = await fetch(`${BASE}/api/admin/flow/steps/${id}`, { method:'DELETE' });
      if (res.ok) { setSteps(prev => prev.filter(s => s.id !== id)); setMsg('削除しました'); setTimeout(() => setMsg(''), 3000); }
      else setErr('削除に失敗しました');
    } catch { setErr('削除に失敗しました'); }
  }

  const setHL = (field: keyof FlowHeader, l: 'zh'|'ja'|'en', val: string) => {
    setHeader(prev => ({ ...prev, [field]: { ...prev[field], [l]: val } }));
  };

  const setEL = (field: keyof FlowStep, l: 'zh'|'ja'|'en', val: string) => {
    setEditingStep(prev => prev ? { ...prev, [field]: { ...(prev[field] as LangObj), [l]: val } } : prev);
  };

  return (
    <div style={S.wrap}>
      <a href={`${BASE}/admin`} style={S.backLink}>← 管理画面トップ</a>
      <div style={S.header}>
        <h1 style={S.title}>Flow セクション</h1>
        <button onClick={saveHeader} disabled={saving} style={S.saveBtn}>{saving ? '保存中...' : 'ヘッダー保存'}</button>
      </div>
      {msg && <div style={S.msg}>{msg}</div>}
      {err && <div style={S.errMsg}>{err}</div>}

      <div style={{ display:'flex', gap:0, marginBottom:16 }}>
        {(['zh','ja','en'] as const).map(l => <button key={l} onClick={() => setLang(l)} style={S.tabBtn(lang===l)}>{l==='zh'?'CN':l==='ja'?'JA':'EN'}</button>)}
      </div>

      {(['eyebrow','title','subtitle'] as (keyof FlowHeader)[]).map(field => (
        <div key={String(field)} style={S.section}>
          <label style={S.lbl}>{String(field)}</label>
          {field === 'subtitle' ? (
            <textarea style={S.textarea} value={header[field][lang]||''} onChange={e => setHL(field, lang, e.target.value)} />
          ) : (
            <input style={S.inp} value={header[field][lang]||''} onChange={e => setHL(field, lang, e.target.value)} />
          )}
        </div>
      ))}

      <div style={S.section}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
          <label style={{ ...S.lbl, margin:0 }}>ステップ</label>
          <button onClick={() => { setEditingStep(emptyStep()); setEditingStepIsNew(true); }} style={{ background:'#222', color:'#c9a96e', border:'1px solid #c9a96e', padding:'6px 14px', borderRadius:4, cursor:'pointer', fontSize:12 }}>+ 追加</button>
        </div>

        {editingStep && (
          <div style={{ background:'#1a1a1a', border:'1px solid #333', borderRadius:6, padding:20, marginBottom:16 }}>
            <h4 style={{ color:'#c9a96e', margin:'0 0 16px', fontSize:14 }}>{editingStepIsNew ? '新規ステップ' : 'ステップ編集'}</h4>
            <div style={{ marginBottom:10 }}>
              <label style={S.lbl}>ステップ番号</label>
              <input type="number" style={S.inp} value={editingStep.step_number} onChange={e => setEditingStep({...editingStep, step_number:Number(e.target.value)})} />
            </div>
            {(['step_label','title','description','cta_label'] as (keyof FlowStep)[]).map(field => (
              <div key={String(field)} style={{ marginBottom:10 }}>
                <label style={S.lbl}>{String(field).replace(/_/g,' ')} ({lang})</label>
                {field === 'description' ? (
                  <textarea style={S.textarea} value={(editingStep[field] as LangObj)[lang]||''} onChange={e => setEL(field, lang, e.target.value)} />
                ) : (
                  <input style={S.inp} value={(editingStep[field] as LangObj)[lang]||''} onChange={e => setEL(field, lang, e.target.value)} />
                )}
              </div>
            ))}
            <div style={{ marginBottom:10 }}>
              <label style={S.lbl}>CTA URL</label>
              <input style={S.inp} value={editingStep.cta_url} onChange={e => setEditingStep({...editingStep, cta_url:e.target.value})} placeholder="https://... または /path" />
            </div>
            <label style={{ display:'flex', gap:8, alignItems:'center', color:'#ccc', fontSize:13, marginBottom:16, cursor:'pointer' }}>
              <input type="checkbox" checked={editingStep.is_external} onChange={e => setEditingStep({...editingStep, is_external:e.target.checked})} style={{ accentColor:'#c9a96e' }} />
              外部リンク（新タブで開く）
            </label>
            <div style={{ display:'flex', gap:8 }}>
              <button onClick={saveStep} disabled={stepSaving} style={S.saveBtn}>{stepSaving ? '保存中...' : '保存'}</button>
              <button onClick={() => setEditingStep(null)} style={{ background:'#333', color:'#fff', border:'none', padding:'10px 20px', borderRadius:4, cursor:'pointer', fontSize:13 }}>キャンセル</button>
            </div>
          </div>
        )}

        {steps.length === 0 ? (
          <p style={{ color:'#555', fontSize:13 }}>ステップなし</p>
        ) : (
          <div style={{ display:'grid', gap:8 }}>
            {steps.sort((a,b) => a.step_number - b.step_number).map(s => (
              <div key={s.id} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'12px 16px', background:'#1a1a1a', borderRadius:4, border:'1px solid #2a2a2a' }}>
                <div>
                  <span style={{ color:'#c9a96e', fontWeight:600, marginRight:12 }}>Step {s.step_number}</span>
                  <span style={{ color:'#fff', marginRight:8 }}>{s.title[lang] || s.title.ja}</span>
                  <span style={{ color:'#555', fontSize:12 }}>{s.cta_url}</span>
                </div>
                <div style={{ display:'flex', gap:8 }}>
                  <button onClick={() => { setEditingStep({...s}); setEditingStepIsNew(false); }} style={{ background:'#222', color:'#c9a96e', border:'1px solid #c9a96e', padding:'4px 10px', borderRadius:4, cursor:'pointer', fontSize:12 }}>編集</button>
                  <button onClick={() => s.id && deleteStep(s.id)} style={{ background:'#3a1a1a', color:'#bb6d6d', border:'1px solid #6a2d2d', padding:'4px 10px', borderRadius:4, cursor:'pointer', fontSize:12 }}>削除</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
