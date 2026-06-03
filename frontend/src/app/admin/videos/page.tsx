'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

const BASE = process.env.NEXT_PUBLIC_BASE_PATH || '';

const S = {
  wrap: { background: '#0a0a0a', minHeight: '100vh', padding: '40px', color: '#fff', fontFamily: 'Inter,sans-serif' } as React.CSSProperties,
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32, borderBottom: '1px solid #333', paddingBottom: 24 } as React.CSSProperties,
  title: { fontSize: 24, fontWeight: 600, color: '#fff', margin: 0 } as React.CSSProperties,
  saveBtn: { background: '#c9a96e', color: '#000', border: 'none', padding: '10px 24px', borderRadius: 4, fontWeight: 600, cursor: 'pointer', fontSize: 14 } as React.CSSProperties,
  section: { marginBottom: 24, padding: 24, background: '#111', borderRadius: 8, border: '1px solid #222' } as React.CSSProperties,
  lbl: { display: 'block', fontSize: 12, color: '#888', marginBottom: 6, letterSpacing: '.05em', textTransform: 'uppercase' as const },
  inp: { width: '100%', background: '#1a1a1a', border: '1px solid #333', borderRadius: 4, padding: '10px 14px', color: '#fff', fontSize: 14, outline: 'none', boxSizing: 'border-box' as const },
  msg: { background: '#1a3a1a', border: '1px solid #2d6a2d', color: '#6dbb6d', padding: '12px 16px', borderRadius: 4, marginBottom: 24, fontSize: 13 } as React.CSSProperties,
  backLink: { color: '#888', textDecoration: 'none', fontSize: 13, marginBottom: 24, display: 'inline-block' } as React.CSSProperties,
  delBtn: { background: 'transparent', border: '1px solid #555', color: '#f44', padding: '6px 14px', borderRadius: 4, cursor: 'pointer', fontSize: 12 } as React.CSSProperties,
};
const tabBtn = (active: boolean): React.CSSProperties => ({ border: 'none', padding: '6px 14px', fontSize: 11, cursor: 'pointer', fontWeight: 600, background: active ? '#c9a96e' : '#333', color: active ? '#000' : '#999' });

interface VideoItem { id?: number; title_zh: string; title_ja: string; title_en: string; video_url: string; thumbnail_url: string; description_zh: string; description_ja: string; description_en: string; display_order: number }

export default function VideosAdminPage() {
  const router = useRouter();
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [section, setSection] = useState<any>({});
  const [editing, setEditing] = useState<VideoItem | null>(null);
  const [lang, setLang] = useState<'zh' | 'ja' | 'en'>('ja');
  const [msg, setMsg] = useState('');

  useEffect(() => {
    fetch(`${BASE}/api/admin/featured-videos`).then(r => {
      if (r.status === 401) { router.push(`${BASE}/admin/login`); return null; }
      return r.json();
    }).then(d => { if (d) { setVideos(d.videos || []); setSection(d.section || {}); } }).catch(console.error);
  }, []);

  async function saveSection() {
    const res = await fetch(`${BASE}/api/admin/featured-videos`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ section }) });
    if (res.ok) { setMsg('保存しました'); setTimeout(() => setMsg(''), 3000); }
  }

  async function saveVideo() {
    if (!editing) return;
    const method = editing.id ? 'PUT' : 'POST';
    const url = editing.id ? `${BASE}/api/admin/featured-videos/${editing.id}` : `${BASE}/api/admin/featured-videos`;
    const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(editing) });
    if (res.ok) {
      const updated = await res.json();
      setVideos(prev => editing.id ? prev.map(v => v.id === editing.id ? updated : v) : [...prev, updated]);
      setEditing(null);
      setMsg('保存しました'); setTimeout(() => setMsg(''), 3000);
    }
  }

  async function deleteVideo(id: number) {
    if (!confirm('削除しますか？')) return;
    await fetch(`${BASE}/api/admin/featured-videos/${id}`, { method: 'DELETE' });
    setVideos(prev => prev.filter(v => v.id !== id));
  }

  const blank: VideoItem = { title_zh: '', title_ja: '', title_en: '', video_url: '', thumbnail_url: '', description_zh: '', description_ja: '', description_en: '', display_order: videos.length };

  return (
    <div style={S.wrap}>
      <a href={`${BASE}/admin`} style={S.backLink}>← 管理画面トップ</a>
      <div style={S.header}><h1 style={S.title}>動画管理</h1></div>
      {msg && <div style={S.msg}>{msg}</div>}

      <div style={S.section}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h3 style={{ color: '#c9a96e', fontSize: 14, margin: 0 }}>セクション見出し</h3>
          <button onClick={saveSection} style={S.saveBtn}>保存</button>
        </div>
        <div style={{ display: 'flex', gap: 0, marginBottom: 8 }}>
          {(['zh', 'ja', 'en'] as const).map(l => <button key={l} onClick={() => setLang(l)} style={tabBtn(lang === l)}>{l === 'zh' ? 'CN' : l === 'ja' ? 'JA' : 'EN'}</button>)}
        </div>
        <div style={{ display: 'grid', gap: 12 }}>
          <div><label style={S.lbl}>Eyebrow</label><input style={S.inp} value={section[`eyebrow_${lang}`] || ''} onChange={e => setSection({ ...section, [`eyebrow_${lang}`]: e.target.value })} /></div>
          <div><label style={S.lbl}>タイトル</label><input style={S.inp} value={section[`title_${lang}`] || ''} onChange={e => setSection({ ...section, [`title_${lang}`]: e.target.value })} /></div>
          <div><label style={S.lbl}>サブタイトル</label><input style={S.inp} value={section[`subtitle_${lang}`] || ''} onChange={e => setSection({ ...section, [`subtitle_${lang}`]: e.target.value })} /></div>
        </div>
      </div>

      <div style={S.section}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h3 style={{ color: '#c9a96e', fontSize: 14, margin: 0 }}>動画一覧 ({videos.length}件)</h3>
          <button onClick={() => setEditing(blank)} style={S.saveBtn}>+ 追加</button>
        </div>
        {videos.map(v => (
          <div key={v.id} style={{ padding: '12px 16px', background: '#1a1a1a', border: '1px solid #333', borderRadius: 4, marginBottom: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: 14, color: '#fff', marginBottom: 4 }}>{v.title_ja || v.title_en || '(無題)'}</div>
              <div style={{ fontSize: 11, color: '#666' }}>{v.video_url?.split('/').pop()}</div>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => setEditing(v)} style={{ ...S.saveBtn, fontSize: 12, padding: '6px 14px' }}>編集</button>
              <button onClick={() => deleteVideo(v.id!)} style={S.delBtn}>削除</button>
            </div>
          </div>
        ))}
      </div>

      {editing && (
        <div style={S.section}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3 style={{ color: '#c9a96e', fontSize: 14, margin: 0 }}>{editing.id ? '動画を編集' : '動画を追加'}</h3>
          </div>
          <div style={{ display: 'flex', gap: 0, marginBottom: 12 }}>
            {(['zh', 'ja', 'en'] as const).map(l => <button key={l} onClick={() => setLang(l)} style={tabBtn(lang === l)}>{l === 'zh' ? 'CN' : l === 'ja' ? 'JA' : 'EN'}</button>)}
          </div>
          <div style={{ display: 'grid', gap: 12 }}>
            <div><label style={S.lbl}>タイトル</label><input style={S.inp} value={(editing as any)[`title_${lang}`] || ''} onChange={e => setEditing({ ...editing, [`title_${lang}`]: e.target.value } as VideoItem)} /></div>
            <div><label style={S.lbl}>動画URL (CloudFront)</label><input style={S.inp} value={editing.video_url || ''} onChange={e => setEditing({ ...editing, video_url: e.target.value })} placeholder="https://d143jkdkye8i79.cloudfront.net/uploads/videos/..." /></div>
            <div><label style={S.lbl}>サムネイルURL</label><input style={S.inp} value={editing.thumbnail_url || ''} onChange={e => setEditing({ ...editing, thumbnail_url: e.target.value })} /></div>
            <div><label style={S.lbl}>説明</label><input style={S.inp} value={(editing as any)[`description_${lang}`] || ''} onChange={e => setEditing({ ...editing, [`description_${lang}`]: e.target.value } as VideoItem)} /></div>
            <div><label style={S.lbl}>表示順</label><input style={{ ...S.inp, width: 120 }} type="number" value={editing.display_order ?? 0} onChange={e => setEditing({ ...editing, display_order: Number(e.target.value) })} /></div>
          </div>
          <div style={{ marginTop: 16, display: 'flex', gap: 12 }}>
            <button onClick={saveVideo} style={S.saveBtn}>保存</button>
            <button onClick={() => setEditing(null)} style={{ ...S.delBtn, color: '#888', borderColor: '#444' }}>キャンセル</button>
          </div>
        </div>
      )}
    </div>
  );
}
