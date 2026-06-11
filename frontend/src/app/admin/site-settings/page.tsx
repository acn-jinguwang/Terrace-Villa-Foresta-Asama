'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { COOKIE_NAME } from '@/lib/auth';

const BASE = process.env.NEXT_PUBLIC_BASE_PATH || '';

const THEMES = [
  { key: 'onyx',   label: 'Onyx',   desc: '黒×ゴールド（現在のデザイン）', swatch: 'linear-gradient(135deg, #0d0d0b 50%, #c9a96e 50%)' },
  { key: 'forest', label: 'Forest', desc: 'ベージュ×森緑', swatch: 'linear-gradient(135deg, #f1ede2 50%, #2f4a35 50%)' },
  { key: 'mist',   label: 'Mist',   desc: '青墨×金茶', swatch: 'linear-gradient(135deg, #1a2028 50%, #9a7a55 50%)' },
] as const;

export default function SiteSettingsPage() {
  const router = useRouter();
  const [theme, setTheme] = useState<'onyx' | 'forest' | 'mist'>('onyx');
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');

  useEffect(() => {
    fetch(`${BASE}/api/admin/site-settings`).then(r => {
      if (r.status === 401) { router.push(`${BASE}/admin/login`); return null; }
      return r.json();
    }).then(d => {
      if (d?.default_theme) setTheme(d.default_theme);
    }).catch(console.error);
  }, []);

  async function save() {
    setSaving(true); setMsg(''); setErr('');
    try {
      const res = await fetch(`${BASE}/api/admin/site-settings`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ default_theme: theme }),
      });
      if (res.ok) {
        setMsg('保存しました');
        setTimeout(() => setMsg(''), 3000);
      } else {
        setErr('保存に失敗しました');
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="min-h-screen bg-dark pt-20">
      {/* Header */}
      <section className="relative py-12 px-6 border-b border-white/5">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center gap-4 mb-4">
            <div className="gold-line" />
            <span className="text-gold text-[10px] tracking-[0.5em] font-display uppercase">Administration</span>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-display text-2xl font-bold text-white tracking-widest uppercase">サイト設定</h1>
              <p className="font-kaiti italic text-white/40 text-sm mt-1">サイト全体の設定を管理します</p>
            </div>
            <a
              href={`${BASE}/admin`}
              className="px-4 py-2 border border-white/10 text-white/40 hover:border-gold/40 hover:text-gold font-display text-[10px] uppercase tracking-[0.3em] transition-all duration-300"
            >
              ← 管理画面
            </a>
          </div>
        </div>
      </section>

      <div className="max-w-2xl mx-auto px-6 py-12">
        {/* Toast */}
        {msg && (
          <div className="mb-6 px-6 py-3 border bg-green-900/80 border-green-500/30 text-green-300 text-sm font-display tracking-widest uppercase">
            {msg}
          </div>
        )}
        {err && (
          <div className="mb-6 px-6 py-3 border bg-red-900/80 border-red-500/30 text-red-300 text-sm font-display tracking-widest uppercase">
            {err}
          </div>
        )}

        {/* Theme selection */}
        <div className="border border-white/10 p-8 mb-8">
          <h2 className="font-display text-sm font-bold text-white tracking-widest uppercase mb-2">
            デフォルトテーマ
          </h2>
          <p className="font-kaiti italic text-white/40 text-sm mb-8">
            初回訪問者（テーマ未設定）に適用されるテーマ。訪問者は右下のスイッチで個別に変更できます。
          </p>

          <div className="space-y-4">
            {THEMES.map(t => (
              <label
                key={t.key}
                className={`flex items-center gap-6 p-5 border cursor-pointer transition-all duration-300 ${
                  theme === t.key
                    ? 'border-gold/60 bg-gold/5'
                    : 'border-white/10 hover:border-white/20'
                }`}
              >
                <input
                  type="radio"
                  name="theme"
                  value={t.key}
                  checked={theme === t.key}
                  onChange={() => setTheme(t.key)}
                  className="sr-only"
                />
                <div className="flex-shrink-0 flex items-center gap-3">
                  <div
                    className="w-8 h-8 rounded-sm border border-white/20 flex-shrink-0"
                    style={{ background: t.swatch }}
                  />
                  <div>
                    <div className={`font-display text-sm tracking-widest uppercase font-bold ${theme === t.key ? 'text-gold' : 'text-white/70'}`}>
                      {t.label}
                    </div>
                    <div className="font-kaiti italic text-white/30 text-xs mt-0.5">{t.desc}</div>
                  </div>
                </div>
                {theme === t.key && (
                  <div className="ml-auto">
                    <div className="w-5 h-5 border-2 border-gold rounded-full flex items-center justify-center">
                      <div className="w-2.5 h-2.5 bg-gold rounded-full" />
                    </div>
                  </div>
                )}
              </label>
            ))}
          </div>
        </div>

        {/* Save button */}
        <button
          onClick={save}
          disabled={saving}
          className="w-full py-4 bg-gold text-black font-display font-bold uppercase tracking-widest text-sm hover:bg-gold-light transition-colors duration-300 disabled:opacity-50"
        >
          {saving ? '保存中...' : '保存'}
        </button>
      </div>
    </div>
  );
}
