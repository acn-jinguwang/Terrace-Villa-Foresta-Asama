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

interface HomeSection {
  section_key: string; display_order: number; is_enabled: boolean;
}

const SECTION_LABELS: Record<string, string> = {
  hero: 'Hero（トップビジュアル）',
  flow: 'Flow（ご滞在の流れ）',
  villas: 'Villas（ヴィラ一覧）',
  seasons: '四季（四季の体験）',
  plans: 'Plans（宿泊プラン）',
  location: 'Location（アクセス）',
  cta: 'CTA（ご予約へ）',
};

const EDIT_LINKS: Record<string, string> = {
  hero: '/admin/hero',
  flow: '/admin/flow',
  villas: '/admin/villas',
  seasons: '/admin/seasons-meta',
  plans: '/admin/stay-plans',
  location: '/admin/location',
  cta: '/admin/cta',
};

export default function HomeSectionsAdminPage() {
  const router = useRouter();
  const [sections, setSections] = useState<HomeSection[]>([]);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');

  useEffect(() => {
    fetch(`${BASE}/api/admin/home-sections`).then(r => {
      if (r.status === 401) { router.push(`${BASE}/admin/login`); return null; }
      return r.json();
    }).then(d => {
      if (!d) return;
      const arr = Array.isArray(d) ? d : d.sections || [];
      setSections(arr.sort((a: HomeSection, b: HomeSection) => a.display_order - b.display_order));
    }).catch(console.error);
  }, []);

  async function save() {
    setSaving(true); setErr(''); setMsg('');
    try {
      const res = await fetch(`${BASE}/api/admin/home-sections`, { method:'PUT', headers:{'Content-Type':'application/json'}, body:JSON.stringify(sections) });
      if (res.ok) { setMsg('保存しました'); setTimeout(() => setMsg(''), 3000); }
      else setErr('保存に失敗しました');
    } finally { setSaving(false); }
  }

  function toggle(key: string) {
    setSections(prev => prev.map(s => s.section_key === key ? { ...s, is_enabled: !s.is_enabled } : s));
  }

  function setOrder(key: string, order: number) {
    setSections(prev => prev.map(s => s.section_key === key ? { ...s, display_order: order } : s));
  }

  function moveUp(idx: number) {
    if (idx === 0) return;
    setSections(prev => {
      const next = [...prev];
      const tmp = next[idx - 1].display_order;
      next[idx - 1] = { ...next[idx - 1], display_order: next[idx].display_order };
      next[idx] = { ...next[idx], display_order: tmp };
      return next.sort((a, b) => a.display_order - b.display_order);
    });
  }

  function moveDown(idx: number) {
    setSections(prev => {
      if (idx >= prev.length - 1) return prev;
      const next = [...prev];
      const tmp = next[idx + 1].display_order;
      next[idx + 1] = { ...next[idx + 1], display_order: next[idx].display_order };
      next[idx] = { ...next[idx], display_order: tmp };
      return next.sort((a, b) => a.display_order - b.display_order);
    });
  }

  return (
    <div style={S.wrap}>
      <a href={`${BASE}/admin`} style={S.backLink}>← 管理画面トップ</a>
      <div style={S.header}>
        <h1 style={S.title}>セクション制御</h1>
        <button onClick={save} disabled={saving} style={S.saveBtn}>{saving ? '保存中...' : '保存'}</button>
      </div>
      {msg && <div style={S.msg}>{msg}</div>}
      {err && <div style={S.errMsg}>{err}</div>}

      <p style={{ color:'#888', fontSize:13, marginBottom:24, lineHeight:1.6 }}>
        各セクションの表示・非表示と順番を管理します。保存後にトップページへ反映されます。
      </p>

      <div style={S.section}>
        <label style={{ ...S.lbl, marginBottom:16 }}>セクション一覧</label>
        {sections.length === 0 ? (
          <p style={{ color:'#555', fontSize:13 }}>セクションなし</p>
        ) : (
          <div style={{ display:'grid', gap:8 }}>
            {sections.map((s, idx) => (
              <div key={s.section_key} style={{
                display:'flex', alignItems:'center', gap:12, padding:'14px 16px',
                background:'#1a1a1a', borderRadius:4,
                border: `1px solid ${s.is_enabled ? '#2a3a2a' : '#2a2a2a'}`,
                opacity: s.is_enabled ? 1 : 0.6,
              }}>
                {/* Up/down buttons */}
                <div style={{ display:'flex', flexDirection:'column', gap:2 }}>
                  <button onClick={() => moveUp(idx)} disabled={idx === 0} style={{ background:'none', border:'none', color: idx === 0 ? '#333' : '#888', cursor: idx === 0 ? 'default' : 'pointer', fontSize:10, padding:'2px 4px' }}>▲</button>
                  <button onClick={() => moveDown(idx)} disabled={idx === sections.length - 1} style={{ background:'none', border:'none', color: idx === sections.length - 1 ? '#333' : '#888', cursor: idx === sections.length - 1 ? 'default' : 'pointer', fontSize:10, padding:'2px 4px' }}>▼</button>
                </div>

                {/* Order number */}
                <span style={{ color:'#555', fontSize:13, minWidth:20, textAlign:'center' }}>{idx + 1}</span>

                {/* Toggle */}
                <button
                  onClick={() => toggle(s.section_key)}
                  style={{
                    width:40, height:22, borderRadius:11, border:'none', cursor:'pointer', position:'relative', flexShrink:0,
                    background: s.is_enabled ? '#c9a96e' : '#333', transition:'background .2s',
                  }}
                >
                  <span style={{
                    position:'absolute', top:3, width:16, height:16, borderRadius:'50%', background:'#000',
                    left: s.is_enabled ? 21 : 3, transition:'left .2s',
                  }} />
                </button>

                {/* Label */}
                <div style={{ flex:1 }}>
                  <span style={{ color: s.is_enabled ? '#fff' : '#555', fontSize:14 }}>
                    {SECTION_LABELS[s.section_key] || s.section_key}
                  </span>
                  <span style={{ color:'#444', fontSize:11, marginLeft:10 }}>{s.section_key}</span>
                </div>

                {/* Display order input */}
                <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                  <label style={{ color:'#555', fontSize:11, letterSpacing:'.05em' }}>ORDER</label>
                  <input
                    type="number"
                    value={s.display_order}
                    onChange={e => setOrder(s.section_key, Number(e.target.value))}
                    style={{ width:56, background:'#111', border:'1px solid #333', borderRadius:4, padding:'4px 8px', color:'#fff', fontSize:12, outline:'none' }}
                  />
                </div>

                {/* Edit link */}
                {EDIT_LINKS[s.section_key] && (
                  <a
                    href={`${BASE}${EDIT_LINKS[s.section_key]}`}
                    style={{ color:'#c9a96e', textDecoration:'none', fontSize:12, border:'1px solid #c9a96e', padding:'4px 10px', borderRadius:4, flexShrink:0 }}
                  >
                    編集
                  </a>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
