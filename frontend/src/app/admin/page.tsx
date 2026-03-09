'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/contexts/LanguageContext';
import { translations } from '@/i18n/translations';

// ─── Types ────────────────────────────────────────────────────────────────────

type Tab = 'images' | 'videos' | 'plans' | 'layout';

type Category =
  | 'uncategorized'
  | 'hero'
  | 'hotel'
  | 'surroundings'
  | 'videos'
  | 'plan-golf'
  | 'plan-nature'
  | 'plan-luxury'
  | 'plan-culture'
  | 'plan-gourmet'
  | 'plan-seasonal';

interface MediaFile {
  id: string;
  name: string;
  category: Category;
  size: string;
  uploadDate: string;
  url: string;
  type: 'image' | 'video';
  isHero?: boolean;
}

interface PlanEntry {
  id: string;
  titleZh: string; titleJa: string; titleEn: string;
  descZh: string;  descJa: string;  descEn: string;
  duration: number;
  price: string;
  tagZh: string; tagJa: string; tagEn: string;
  highlightsZh: string[]; highlightsJa: string[]; highlightsEn: string[];
  coverImage: string;
  visible: boolean;
  createdAt: string;
}

const BLANK_PLAN: Omit<PlanEntry, 'createdAt'> = {
  id: '', titleZh: '', titleJa: '', titleEn: '',
  descZh: '', descJa: '', descEn: '',
  duration: 3, price: '¥30,000',
  tagZh: '', tagJa: '', tagEn: '',
  highlightsZh: ['', '', ''], highlightsJa: ['', '', ''], highlightsEn: ['', '', ''],
  coverImage: '', visible: true,
};

// ─── Section label map ────────────────────────────────────────────────────────

const SECTION_LABEL: Record<string, string> = {
  hero:         'Home › Hero Slideshow',
  hotel:        'Home › Hotel Intro / Gallery',
  surroundings: 'Home › Surroundings / Surroundings page',
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function AdminPage() {
  const { t } = useLanguage();
  const router = useRouter();

  // ── Media state ──
  const [activeTab, setActiveTab]       = useState<Tab>('images');
  const [files, setFiles]               = useState<MediaFile[]>([]);
  const [mediaLoading, setMediaLoading] = useState(true);
  const [isDragging, setIsDragging]     = useState(false);
  const [uploading, setUploading]       = useState(false);
  const [imageErrors, setImageErrors]   = useState<Record<string, boolean>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── Plans state ──
  const [plans, setPlans]                 = useState<PlanEntry[]>([]);
  const [plansLoading, setPlansLoading]   = useState(true);
  const [showPlanForm, setShowPlanForm]   = useState(false);
  const [editingPlan, setEditingPlan]     = useState<PlanEntry | null>(null);
  const [planForm, setPlanForm]           = useState<Omit<PlanEntry, 'createdAt'>>(BLANK_PLAN);
  const [planSaving, setPlanSaving]       = useState(false);

  // ── Layout drag state ──
  const [draggedFile, setDraggedFile]   = useState<MediaFile | null>(null);
  const [dropTarget, setDropTarget]     = useState<string | null>(null);
  const [layoutPage, setLayoutPage]     = useState<string>('home');

  // ── Draft / preview state ──
  const [draftFiles, setDraftFiles]             = useState<MediaFile[] | null>(null);
  const [draftPlans, setDraftPlans]             = useState<PlanEntry[] | null>(null);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [isPublishing, setIsPublishing]         = useState(false);

  // ── Toast ──
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // ── Computed ──
  const layoutFiles = draftFiles ?? files;
  const layoutPlans = draftPlans ?? plans;
  const hasLayoutChanges = draftFiles !== null || draftPlans !== null;

  const changeCount = (() => {
    let n = 0;
    draftFiles?.forEach((df) => {
      const orig = files.find((f) => f.id === df.id);
      if (orig && (df.category !== orig.category || !!df.isHero !== !!orig.isHero)) n++;
    });
    draftPlans?.forEach((dp) => {
      if (plans.find((p) => p.id === dp.id)?.coverImage !== dp.coverImage) n++;
    });
    return n;
  })();

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3500);
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/admin/login');
  };

  // ─── Load data on mount ───────────────────────────────────────────────────

  useEffect(() => {
    (async () => {
      try {
        const [imgRes, vidRes] = await Promise.all([fetch('/api/media/images'), fetch('/api/media/videos')]);
        const imgs: MediaFile[] = imgRes.ok ? await imgRes.json() : [];
        const vids: MediaFile[] = vidRes.ok ? await vidRes.json() : [];
        setFiles([...imgs, ...vids]);
      } catch { setFiles([]); }
      finally { setMediaLoading(false); }
    })();
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/plans');
        setPlans(res.ok ? await res.json() : []);
      } catch { setPlans([]); }
      finally { setPlansLoading(false); }
    })();
  }, []);

  // ─── Upload ──────────────────────────────────────────────────────────────

  const handleUpload = useCallback(async (filesToUpload: File[]) => {
    if (!filesToUpload.length) return;
    setUploading(true);
    try {
      const formData = new FormData();
      filesToUpload.forEach((f) => formData.append('files', f));
      formData.append('category', activeTab === 'videos' ? 'videos' : 'uncategorized');
      const res = await fetch('/api/media/upload', { method: 'POST', body: formData });
      if (res.ok) {
        const newEntries: MediaFile[] = await res.json();
        setFiles((prev) => [...newEntries, ...prev]);
        showMessage('success', t(translations.admin.upload_success));
      } else {
        const err = await res.json().catch(() => ({}));
        showMessage('error', (err as { error?: string }).error ?? t(translations.common.error));
      }
    } catch { showMessage('error', t(translations.common.error)); }
    finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }, [activeTab, t]);

  const handleDragOver  = useCallback((e: React.DragEvent) => { e.preventDefault(); setIsDragging(true); }, []);
  const handleDragLeave = useCallback(() => setIsDragging(false), []);
  const handleDrop      = useCallback(async (e: React.DragEvent) => {
    e.preventDefault(); setIsDragging(false);
    await handleUpload(Array.from(e.dataTransfer.files));
  }, [handleUpload]);
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    await handleUpload(Array.from(e.target.files ?? []));
  };

  // ─── Image usage check ────────────────────────────────────────────────────

  const getImageUsage = useCallback((file: MediaFile): string | null => {
    if (file.category === 'uncategorized' || file.category === 'videos') return null;
    if (file.category in SECTION_LABEL) return SECTION_LABEL[file.category];
    if (file.category.startsWith('plan-')) {
      const planId = file.category.replace('plan-', '');
      const plan = plans.find((p) => p.id === planId);
      return `Plan "${plan?.titleEn ?? planId}" › Photo Gallery`;
    }
    const planWithCover = plans.find((p) => p.coverImage === file.url);
    if (planWithCover) return `Plan "${planWithCover.titleEn}" › Cover Image`;
    return null;
  }, [plans]);

  // ─── Delete media ────────────────────────────────────────────────────────

  const handleDelete = async (id: string) => {
    const file = files.find((f) => f.id === id);
    if (!file) return;
    const usage = getImageUsage(file);
    if (usage) {
      showMessage('error', `削除不可 — 使用中: ${usage}`);
      return;
    }
    if (!window.confirm('Are you sure you want to delete this file?')) return;
    try {
      const res = await fetch(`/api/media/${id}`, { method: 'DELETE' });
      if (res.ok) setFiles((prev) => prev.filter((f) => f.id !== id));
      else showMessage('error', t(translations.common.error));
    } catch { showMessage('error', t(translations.common.error)); }
  };

  // ─── Plans CRUD ──────────────────────────────────────────────────────────

  const openAddPlan  = () => { setEditingPlan(null); setPlanForm(BLANK_PLAN); setShowPlanForm(true); };
  const openEditPlan = (plan: PlanEntry) => {
    setEditingPlan(plan);
    const { createdAt: _, ...rest } = plan; void _;
    setPlanForm(rest);
    setShowPlanForm(true);
  };

  const handleToggleVisible = async (plan: PlanEntry) => {
    try {
      const res = await fetch(`/api/plans/${plan.id}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ visible: !plan.visible }),
      });
      if (res.ok) {
        const updated: PlanEntry = await res.json();
        setPlans((prev) => prev.map((p) => p.id === updated.id ? updated : p));
      }
    } catch { showMessage('error', t(translations.common.error)); }
  };

  const handleDeletePlan = async (id: string) => {
    if (!window.confirm('Delete this plan? This cannot be undone.')) return;
    try {
      const res = await fetch(`/api/plans/${id}`, { method: 'DELETE' });
      if (res.ok) setPlans((prev) => prev.filter((p) => p.id !== id));
      else showMessage('error', t(translations.common.error));
    } catch { showMessage('error', t(translations.common.error)); }
  };

  const handleMovePlan = async (index: number, direction: -1 | 1) => {
    const newPlans = [...plans];
    const target = index + direction;
    if (target < 0 || target >= newPlans.length) return;
    [newPlans[index], newPlans[target]] = [newPlans[target], newPlans[index]];
    setPlans(newPlans);
    try {
      await fetch('/api/plans', {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ order: newPlans.map((p) => p.id) }),
      });
    } catch { showMessage('error', t(translations.common.error)); }
  };

  const handleSavePlan = async () => {
    if (!planForm.id.trim() || !planForm.titleZh.trim()) {
      showMessage('error', 'Plan ID and Chinese title are required.');
      return;
    }
    setPlanSaving(true);
    try {
      const isNew = !editingPlan;
      const res = await fetch(
        isNew ? '/api/plans' : `/api/plans/${editingPlan!.id}`,
        { method: isNew ? 'POST' : 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(planForm) }
      );
      if (res.ok) {
        const saved: PlanEntry = await res.json();
        setPlans((prev) => isNew ? [...prev, saved] : prev.map((p) => p.id === saved.id ? saved : p));
        setShowPlanForm(false);
        showMessage('success', isNew ? 'Plan created.' : 'Plan updated.');
      } else {
        const err = await res.json().catch(() => ({}));
        showMessage('error', (err as { error?: string }).error ?? t(translations.common.error));
      }
    } catch { showMessage('error', t(translations.common.error)); }
    finally { setPlanSaving(false); }
  };

  // ─── Draft layout operations ──────────────────────────────────────────────

  /** Change which section/category an image belongs to */
  const draftAssignCategory = useCallback((fileId: string, newCategory: string) => {
    setDraftFiles((prev) => {
      const source = prev ?? files;
      return source.map((f) => f.id === fileId ? { ...f, category: newCategory as Category } : f);
    });
  }, [files]);

  /** Set a hero image as the initial display (★) */
  const draftSetHero = useCallback((fileId: string) => {
    setDraftFiles((prev) => {
      const source = prev ?? files;
      return source.map((f) =>
        f.category === 'hero' ? { ...f, isHero: f.id === fileId } : f
      );
    });
  }, [files]);

  /** Assign cover image to a plan */
  const draftAssignCover = useCallback((planId: string, imageUrl: string) => {
    setDraftPlans((prev) => {
      const source = prev ?? plans;
      return source.map((p) => p.id === planId ? { ...p, coverImage: imageUrl } : p);
    });
  }, [plans]);

  const handleDiscardDraft = () => { setDraftFiles(null); setDraftPlans(null); };

  /** Publish all draft changes to the server */
  const handlePublish = async () => {
    setIsPublishing(true);
    try {
      if (draftFiles) {
        const changed = draftFiles.filter((df) => {
          const orig = files.find((f) => f.id === df.id);
          return orig && (df.category !== orig.category || !!df.isHero !== !!orig.isHero);
        });
        const results = await Promise.all(changed.map((df) =>
          fetch(`/api/media/${df.id}`, {
            method: 'PUT', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ category: df.category, isHero: !!df.isHero }),
          })
        ));
        const failed = results.filter((r) => !r.ok).length;
        if (failed > 0) throw new Error(`${failed} 件の更新に失敗しました`);
        setFiles(draftFiles);
        setDraftFiles(null);
      }
      if (draftPlans) {
        const changed = draftPlans.filter((dp) => plans.find((p) => p.id === dp.id)?.coverImage !== dp.coverImage);
        const results = await Promise.all(changed.map((dp) =>
          fetch(`/api/plans/${dp.id}`, {
            method: 'PUT', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ coverImage: dp.coverImage }),
          })
        ));
        const failed = results.filter((r) => !r.ok).length;
        if (failed > 0) throw new Error(`${failed} 件のプラン更新に失敗しました`);
        setPlans(draftPlans);
        setDraftPlans(null);
      }
      setShowPreviewModal(false);
      showMessage('success', '変更を本番に反映しました');
    } catch (err) {
      showMessage('error', String(err));
    }
    finally { setIsPublishing(false); }
  };

  // ─── Layout drop handlers ─────────────────────────────────────────────────

  const handleLayoutSectionDrop = useCallback((e: React.DragEvent, targetCategory: string) => {
    e.preventDefault();
    const file = draggedFile;
    setDraggedFile(null);
    setDropTarget(null);
    if (!file) return;
    if (targetCategory === 'library') {
      draftAssignCategory(file.id, 'uncategorized');
    } else if (file.category !== targetCategory) {
      draftAssignCategory(file.id, targetCategory);
    }
  }, [draggedFile, draftAssignCategory]);

  const handlePlanCoverDrop = useCallback((e: React.DragEvent, planId: string) => {
    e.preventDefault();
    const file = draggedFile;
    setDraggedFile(null);
    setDropTarget(null);
    if (!file) return;
    draftAssignCover(planId, file.url);
  }, [draggedFile, draftAssignCover]);

  // ─── Derived ─────────────────────────────────────────────────────────────

  const imageFiles = files.filter((f) => f.type === 'image');
  const videoFiles = files.filter((f) => f.type === 'video');
  const displayedFiles = activeTab === 'images' ? imageFiles : videoFiles;

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-dark pt-20">
      {/* Page header */}
      <section className="relative py-12 px-6 border-b border-white/5">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-4 mb-4">
            <div className="gold-line" />
            <span className="text-gold text-[10px] tracking-[0.5em] font-display uppercase">Administration</span>
          </div>
          <div className="flex items-start justify-between">
            <div>
              <h1 className="section-title">{t(translations.admin.title)}</h1>
              <p className="section-subtitle mt-2">{t(translations.admin.subtitle)}</p>
            </div>
            <button onClick={handleLogout}
              className="mt-1 px-5 py-2 border border-white/10 text-white/40 hover:border-red-500/40 hover:text-red-400 font-display text-[10px] uppercase tracking-[0.3em] transition-all duration-300">
              Sign Out
            </button>
          </div>
        </div>
      </section>

      {/* Toast */}
      {message && (
        <div className={`fixed top-24 right-6 z-50 px-6 py-3 border text-sm font-display tracking-widest uppercase ${
          message.type === 'success' ? 'bg-green-900/80 border-green-500/30 text-green-300' : 'bg-red-900/80 border-red-500/30 text-red-300'
        }`}>
          {message.text}
        </div>
      )}

      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* ── Tabs ── */}
        <div className="flex border-b border-white/10 mb-8">
          {(['images', 'videos', 'plans', 'layout'] as Tab[]).map((tab) => (
            <button key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-3 font-display text-sm uppercase tracking-widest transition-all duration-300 relative ${
                activeTab === tab ? 'text-gold border-b-2 border-gold' : 'text-white/30 hover:text-white/60'
              }`}>
              {tab === 'images' ? 'Images' : tab === 'videos' ? 'Videos' : tab === 'plans' ? 'Plans' : 'Layout'}
              {tab === 'layout' && hasLayoutChanges && (
                <span className="ml-2 bg-gold text-black text-[8px] font-display px-1.5 py-0.5 rounded-sm">{changeCount}</span>
              )}
            </button>
          ))}
        </div>

        {/* ══════════════════ IMAGES / VIDEOS TAB ══════════════════ */}
        {(activeTab === 'images' || activeTab === 'videos') && (
          <div>
            <div className="luxury-card p-6 mb-6">
              <h3 className="font-display text-gold text-xs uppercase tracking-widest mb-4">
                {activeTab === 'images' ? 'Upload Images' : 'Upload Video'}
              </h3>
              {activeTab === 'images' && (
                <p className="text-white/25 text-[10px] font-display uppercase tracking-widest mb-4">
                  アップロード後、Layout タブで各ページへ配置してください
                </p>
              )}
              <div className={`border-2 border-dashed p-8 text-center cursor-pointer transition-all duration-300 ${
                isDragging ? 'border-gold bg-gold/5' : 'border-white/10 hover:border-gold/30'
              }`}
                onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}>
                <input ref={fileInputRef} type="file" multiple
                  accept={activeTab === 'images' ? 'image/*' : 'video/*'}
                  className="hidden" onChange={handleFileSelect} />
                {uploading ? (
                  <div className="text-gold text-xs font-display uppercase tracking-widest animate-pulse">Uploading...</div>
                ) : (
                  <>
                    <div className="text-gold/40 mb-3">
                      <svg className="w-10 h-10 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1}
                          d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                    </div>
                    <p className="text-white/40 text-xs font-kaiti italic">Drag files here or click to upload</p>
                  </>
                )}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-6">
              {[
                { label: 'Total',  value: displayedFiles.length },
                { label: '配置済み', value: displayedFiles.filter((f) => getImageUsage(f) !== null).length },
                { label: '未配置',  value: displayedFiles.filter((f) => getImageUsage(f) === null && f.category !== 'videos').length },
              ].map((stat, idx) => (
                <div key={idx} className="border border-white/5 p-4 text-center">
                  <div className="font-display text-2xl font-bold text-gold mb-1">{stat.value}</div>
                  <div className="text-white/30 text-[10px] uppercase tracking-widest font-display">{stat.label}</div>
                </div>
              ))}
            </div>

            <div className="luxury-card overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left p-4 text-gold text-[10px] font-display uppercase tracking-widest">Preview</th>
                    <th className="text-left p-4 text-gold text-[10px] font-display uppercase tracking-widest">File Name</th>
                    <th className="text-left p-4 text-gold text-[10px] font-display uppercase tracking-widest hidden md:table-cell">配置状況</th>
                    <th className="text-left p-4 text-gold text-[10px] font-display uppercase tracking-widest hidden lg:table-cell">Size</th>
                    <th className="text-left p-4 text-gold text-[10px] font-display uppercase tracking-widest hidden lg:table-cell">Date</th>
                    <th className="text-right p-4 text-gold text-[10px] font-display uppercase tracking-widest">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {mediaLoading ? (
                    <tr><td colSpan={6} className="p-12 text-center text-gold/40 font-display text-xs uppercase tracking-widest animate-pulse">Loading...</td></tr>
                  ) : displayedFiles.length === 0 ? (
                    <tr><td colSpan={6} className="p-12 text-center text-white/20 font-kaiti italic">No files yet. Please upload.</td></tr>
                  ) : displayedFiles.map((file) => {
                    const usage = getImageUsage(file);
                    const isUsed = !!usage;
                    return (
                      <tr key={file.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                        <td className="p-4">
                          <div className="relative w-12 h-12 overflow-hidden bg-white/5 border border-white/10">
                            {file.type === 'image' && !imageErrors[file.id] ? (
                              <Image src={file.url} alt={file.name} fill unoptimized className="object-cover"
                                onError={() => setImageErrors((prev) => ({ ...prev, [file.id]: true }))} />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                {file.type === 'video'
                                  ? <svg className="w-5 h-5 text-gold/40" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                                  : <svg className="w-5 h-5 text-white/20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                }
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="p-4 text-white/80 text-sm max-w-[180px] truncate">{file.name}</td>
                        <td className="p-4 hidden md:table-cell">
                          {isUsed
                            ? <span className="border border-gold/30 text-gold/70 px-2 py-0.5 text-[9px] font-display uppercase tracking-widest">{usage}</span>
                            : <span className="border border-white/10 text-white/25 px-2 py-0.5 text-[9px] font-display uppercase tracking-widest">未配置</span>
                          }
                        </td>
                        <td className="p-4 text-white/30 hidden lg:table-cell">{file.size}</td>
                        <td className="p-4 text-white/30 hidden lg:table-cell">{file.uploadDate}</td>
                        <td className="p-4">
                          {isUsed
                            ? <span title={`使用中のため削除不可: ${usage}`}
                                className="block text-right text-[10px] font-display uppercase tracking-widest px-2 py-1 border border-white/5 text-white/15 cursor-not-allowed">
                                Delete
                              </span>
                            : <button onClick={() => handleDelete(file.id)}
                                className="block ml-auto text-[10px] font-display uppercase tracking-widest px-2 py-1 border border-red-500/20 text-red-400/60 hover:border-red-400/40 hover:text-red-400 transition-all">
                                Delete
                              </button>
                          }
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ══════════════════ PLANS TAB ══════════════════ */}
        {activeTab === 'plans' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <div className="text-white/40 font-display text-xs uppercase tracking-widest">
                {plans.filter((p) => p.visible).length} visible · {plans.length} total
              </div>
              <button onClick={openAddPlan}
                className="bg-gold text-black font-display text-xs uppercase tracking-[0.3em] px-6 py-2.5 hover:bg-gold/80 transition-colors">
                + Add Plan
              </button>
            </div>
            <div className="luxury-card overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left p-4 text-gold text-[10px] font-display uppercase tracking-widest w-16">Order</th>
                    <th className="text-left p-4 text-gold text-[10px] font-display uppercase tracking-widest">Title</th>
                    <th className="text-left p-4 text-gold text-[10px] font-display uppercase tracking-widest hidden md:table-cell">Duration</th>
                    <th className="text-left p-4 text-gold text-[10px] font-display uppercase tracking-widest hidden md:table-cell">Price</th>
                    <th className="text-center p-4 text-gold text-[10px] font-display uppercase tracking-widest">Visible</th>
                    <th className="text-right p-4 text-gold text-[10px] font-display uppercase tracking-widest">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {plansLoading ? (
                    <tr><td colSpan={6} className="p-12 text-center text-gold/40 font-display text-xs uppercase tracking-widest animate-pulse">Loading...</td></tr>
                  ) : plans.length === 0 ? (
                    <tr><td colSpan={6} className="p-12 text-center text-white/20 font-kaiti italic">No plans yet.</td></tr>
                  ) : plans.map((plan, idx) => (
                    <tr key={plan.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                      <td className="p-4">
                        <div className="flex flex-col gap-0.5">
                          <button onClick={() => handleMovePlan(idx, -1)} disabled={idx === 0}
                            className="w-6 h-5 flex items-center justify-center text-white/30 hover:text-gold disabled:opacity-20 disabled:cursor-not-allowed transition-colors text-xs">▲</button>
                          <button onClick={() => handleMovePlan(idx, 1)} disabled={idx === plans.length - 1}
                            className="w-6 h-5 flex items-center justify-center text-white/30 hover:text-gold disabled:opacity-20 disabled:cursor-not-allowed transition-colors text-xs">▼</button>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="font-serif text-white font-bold">{plan.titleZh}</div>
                        <div className="text-white/30 text-[10px] font-display uppercase tracking-widest mt-0.5">{plan.titleEn}</div>
                      </td>
                      <td className="p-4 text-white/50 hidden md:table-cell">{plan.duration} days</td>
                      <td className="p-4 text-gold font-display font-bold hidden md:table-cell">{plan.price}</td>
                      <td className="p-4 text-center">
                        <button onClick={() => handleToggleVisible(plan)}
                          className={`w-10 h-5 rounded-full transition-all duration-300 relative ${plan.visible ? 'bg-gold' : 'bg-white/10'}`}>
                          <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-black transition-all duration-300 ${plan.visible ? 'left-5' : 'left-0.5'}`} />
                        </button>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center justify-end gap-2">
                          <button onClick={() => openEditPlan(plan)}
                            className="text-[10px] font-display uppercase tracking-widest px-2 py-1 border border-white/10 text-white/40 hover:border-gold/40 hover:text-gold transition-all">Edit</button>
                          <button onClick={() => handleDeletePlan(plan.id)}
                            className="text-[10px] font-display uppercase tracking-widest px-2 py-1 border border-red-500/20 text-red-400/60 hover:border-red-400/40 hover:text-red-400 transition-all">Delete</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Plan Form Modal */}
            {showPlanForm && (
              <div className="fixed inset-0 bg-black/80 z-[200] flex items-start justify-center overflow-y-auto py-12 px-4">
                <div className="w-full max-w-2xl bg-[#0a0a0a] border border-white/10 p-8">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="font-display text-gold text-sm uppercase tracking-widest">{editingPlan ? 'Edit Plan' : 'New Plan'}</h2>
                    <button onClick={() => setShowPlanForm(false)} className="text-white/40 hover:text-white text-2xl leading-none">×</button>
                  </div>
                  <div className="space-y-5 text-sm">
                    {!editingPlan && (
                      <div>
                        <label className="block text-white/40 text-[10px] uppercase tracking-widest font-display mb-1">Plan ID <span className="text-red-400">*</span></label>
                        <input value={planForm.id}
                          onChange={(e) => setPlanForm((f) => ({ ...f, id: e.target.value.toLowerCase().replace(/\s+/g, '-') }))}
                          placeholder="e.g. winter-ski"
                          className="w-full bg-white/5 border border-white/10 text-white px-3 py-2 focus:border-gold/50 focus:outline-none" />
                        <p className="text-white/20 text-[10px] mt-1">Lowercase, hyphens only. Used in URL: /plans/[id]</p>
                      </div>
                    )}
                    <div className="grid grid-cols-1 gap-3">
                      <label className="text-white/40 text-[10px] uppercase tracking-widest font-display">Title <span className="text-red-400">*</span></label>
                      {(['zh', 'ja', 'en'] as const).map((l) => (
                        <div key={l} className="flex gap-2 items-center">
                          <span className="text-white/20 text-[10px] font-display uppercase w-6">{l}</span>
                          <input value={planForm[`title${l.charAt(0).toUpperCase() + l.slice(1)}` as 'titleZh']}
                            onChange={(e) => setPlanForm((f) => ({ ...f, [`title${l.charAt(0).toUpperCase() + l.slice(1)}`]: e.target.value }))}
                            className="flex-1 bg-white/5 border border-white/10 text-white px-3 py-1.5 focus:border-gold/50 focus:outline-none" />
                        </div>
                      ))}
                    </div>
                    <div className="grid grid-cols-1 gap-3">
                      <label className="text-white/40 text-[10px] uppercase tracking-widest font-display">Description</label>
                      {(['zh', 'ja', 'en'] as const).map((l) => (
                        <div key={l} className="flex gap-2 items-start">
                          <span className="text-white/20 text-[10px] font-display uppercase w-6 mt-2">{l}</span>
                          <textarea value={planForm[`desc${l.charAt(0).toUpperCase() + l.slice(1)}` as 'descZh']}
                            onChange={(e) => setPlanForm((f) => ({ ...f, [`desc${l.charAt(0).toUpperCase() + l.slice(1)}`]: e.target.value }))}
                            rows={2} className="flex-1 bg-white/5 border border-white/10 text-white px-3 py-1.5 focus:border-gold/50 focus:outline-none resize-none" />
                        </div>
                      ))}
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-white/40 text-[10px] uppercase tracking-widest font-display mb-1">Duration (days)</label>
                        <input type="number" min={1} value={planForm.duration}
                          onChange={(e) => setPlanForm((f) => ({ ...f, duration: Number(e.target.value) }))}
                          className="w-full bg-white/5 border border-white/10 text-white px-3 py-2 focus:border-gold/50 focus:outline-none" />
                      </div>
                      <div>
                        <label className="block text-white/40 text-[10px] uppercase tracking-widest font-display mb-1">Price</label>
                        <input value={planForm.price}
                          onChange={(e) => setPlanForm((f) => ({ ...f, price: e.target.value }))}
                          placeholder="¥30,000"
                          className="w-full bg-white/5 border border-white/10 text-white px-3 py-2 focus:border-gold/50 focus:outline-none" />
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <div className="col-span-3"><label className="text-white/40 text-[10px] uppercase tracking-widest font-display">Badge / Tag (optional)</label></div>
                      {(['Zh', 'Ja', 'En'] as const).map((l) => (
                        <div key={l}>
                          <span className="text-white/20 text-[10px] font-display block mb-1">{l}</span>
                          <input value={planForm[`tag${l}` as 'tagZh']}
                            onChange={(e) => setPlanForm((f) => ({ ...f, [`tag${l}`]: e.target.value }))}
                            className="w-full bg-white/5 border border-white/10 text-white px-2 py-1.5 text-xs focus:border-gold/50 focus:outline-none" />
                        </div>
                      ))}
                    </div>
                    <div>
                      <label className="block text-white/40 text-[10px] uppercase tracking-widest font-display mb-2">Highlights (3 bullet points)</label>
                      {[0, 1, 2].map((i) => (
                        <div key={i} className="grid grid-cols-3 gap-2 mb-2">
                          {(['Zh', 'Ja', 'En'] as const).map((l) => (
                            <div key={l} className="flex gap-1 items-center">
                              <span className="text-white/20 text-[10px] font-display w-4">{l}</span>
                              <input value={planForm[`highlights${l}` as 'highlightsZh'][i] ?? ''}
                                onChange={(e) => {
                                  const key = `highlights${l}` as 'highlightsZh';
                                  const arr = [...planForm[key]]; arr[i] = e.target.value;
                                  setPlanForm((f) => ({ ...f, [key]: arr }));
                                }}
                                className="flex-1 bg-white/5 border border-white/10 text-white px-2 py-1 text-xs focus:border-gold/50 focus:outline-none" />
                            </div>
                          ))}
                        </div>
                      ))}
                    </div>
                    <div className="flex items-center gap-3">
                      <label className="text-white/40 text-[10px] uppercase tracking-widest font-display">Visible on website</label>
                      <button onClick={() => setPlanForm((f) => ({ ...f, visible: !f.visible }))}
                        className={`w-10 h-5 rounded-full transition-all relative ${planForm.visible ? 'bg-gold' : 'bg-white/10'}`}>
                        <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-black transition-all ${planForm.visible ? 'left-5' : 'left-0.5'}`} />
                      </button>
                    </div>
                  </div>
                  <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-white/10">
                    <button onClick={() => setShowPlanForm(false)}
                      className="px-6 py-2 border border-white/10 text-white/40 hover:text-white font-display text-xs uppercase tracking-widest transition-all">Cancel</button>
                    <button onClick={handleSavePlan} disabled={planSaving}
                      className="px-8 py-2 bg-gold text-black font-display text-xs uppercase tracking-widest hover:bg-gold/80 transition-colors disabled:opacity-50">
                      {planSaving ? 'Saving...' : editingPlan ? 'Save Changes' : 'Create Plan'}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ══════════════════ LAYOUT TAB ══════════════════ */}
        {activeTab === 'layout' && (() => {
          const imgFiles  = layoutFiles.filter((f) => f.type === 'image');
          const heroFiles = imgFiles.filter((f) => f.category === 'hero');
          const hotelFiles = imgFiles.filter((f) => f.category === 'hotel');

          const pageOptions: { id: string; label: string; url: string }[] = [
            { id: 'home',         label: 'Home',         url: '/' },
            { id: 'plans-list',   label: 'Plans',        url: '/plans' },
            { id: 'gallery',      label: 'Gallery',      url: '/library' },
            { id: 'surroundings', label: 'Surroundings', url: '/surroundings' },
            ...layoutPlans.map((p) => ({ id: `plan-${p.id}`, label: p.titleEn || p.id, url: `/plans/${p.id}` })),
          ];

          // ── Inline render helpers (called as functions, NOT as React components,
          //    to avoid remounting on every dragover re-render) ──────────────────

          const renderSectionImg = (f: MediaFile, showHeroStar = false) => (
            <div key={f.id}
              draggable
              onDragStart={(e) => { e.stopPropagation(); setDraggedFile(f); }}
              onDragEnd={() => { setDraggedFile(null); setDropTarget(null); }}
              className={`relative overflow-hidden border aspect-video cursor-grab active:cursor-grabbing group transition-all ${
                draggedFile?.id === f.id ? 'border-gold opacity-40 scale-95' : 'border-white/10 hover:border-gold/50'
              }`}
              title={f.name}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={f.url} alt={f.name} className="w-full h-full object-cover pointer-events-none" />
              {/* hover overlay */}
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity pointer-events-none">
                <span className="text-white/60 text-[8px] font-display uppercase tracking-widest">drag to move / remove</span>
              </div>
              {/* Hero initial display star */}
              {showHeroStar && (
                <button
                  onClick={(e) => { e.stopPropagation(); draftSetHero(f.id); }}
                  className={`absolute top-1 left-1 w-6 h-6 flex items-center justify-center rounded transition-all ${
                    f.isHero ? 'bg-gold text-black' : 'bg-black/60 text-white/40 hover:text-gold hover:bg-black/80'
                  }`}
                  title={f.isHero ? '初期表示 (設定済み)' : '初期表示に設定'}
                >
                  ★
                </button>
              )}
            </div>
          );

          const renderPlanCover = (plan: PlanEntry) => {
            const key = `plan-cover-${plan.id}`;
            const isOver = dropTarget === key;
            return (
              <div key={plan.id}
                onDragOver={(e) => { e.preventDefault(); setDropTarget(key); }}
                onDragLeave={() => setDropTarget(null)}
                onDrop={(e) => handlePlanCoverDrop(e, plan.id)}
                className={`border-2 border-dashed rounded overflow-hidden transition-all duration-200 relative ${
                  isOver ? 'border-gold bg-gold/10' : 'border-white/10 hover:border-white/20'
                }`}
              >
                <div className="relative aspect-[4/3] bg-white/5">
                  {plan.coverImage
                    // eslint-disable-next-line @next/next/no-img-element
                    ? <img src={plan.coverImage} alt="" className="absolute inset-0 w-full h-full object-cover opacity-70" />
                    : null}
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 p-2">
                    <span className="text-[9px] font-display uppercase tracking-widest text-white/50 mb-1">
                      {isOver ? '▼ Drop' : plan.coverImage ? 'Cover' : 'Drop cover image'}
                    </span>
                    <span className="text-[10px] font-serif text-white/80 text-center leading-tight">{plan.titleEn}</span>
                    {!plan.visible && <span className="text-[8px] font-display text-white/30 uppercase mt-1">hidden</span>}
                  </div>
                  {plan.coverImage && (
                    <button
                      onClick={(e) => { e.stopPropagation(); draftAssignCover(plan.id, ''); }}
                      className="absolute top-1 right-1 w-5 h-5 bg-black/70 border border-white/20 text-white/60 hover:text-red-400 hover:border-red-400/40 rounded-sm text-[10px] leading-none flex items-center justify-center transition-all"
                      title="カバー画像を削除">×</button>
                  )}
                </div>
              </div>
            );
          };

          const renderCatGrid = (cat: string, label: string, cols = 4) => {
            const catFiles = imgFiles.filter((f) => f.category === cat);
            const dzKey = `${cat}-drop`;
            const isOver = dropTarget === dzKey;
            return (
              <div className="luxury-card p-5">
                <h4 className="font-display text-white/60 text-[10px] uppercase tracking-widest mb-3">{label}</h4>
                <div
                  onDragOver={(e) => { e.preventDefault(); setDropTarget(dzKey); }}
                  onDragLeave={() => setDropTarget(null)}
                  onDrop={(e) => handleLayoutSectionDrop(e, cat)}
                  className={`p-3 border-2 border-dashed rounded transition-all duration-200 ${isOver ? 'border-gold bg-gold/5' : 'border-white/10'}`}
                  style={{ display: 'grid', gridTemplateColumns: `repeat(${cols}, minmax(0,1fr))`, gap: '0.5rem' }}
                >
                  {catFiles.map((f) => renderSectionImg(f))}
                  <div className={`aspect-video border-2 border-dashed rounded flex items-center justify-center ${isOver ? 'border-gold bg-gold/10' : 'border-white/10'}`}>
                    <span className="text-[9px] font-display text-white/20 uppercase tracking-widest">
                      {isOver ? '▼ Drop' : catFiles.length === 0 ? 'Drop here' : '+ Add'}
                    </span>
                  </div>
                </div>
              </div>
            );
          };

          const renderPageSections = () => {
            if (layoutPage.startsWith('plan-')) {
              const planId = layoutPage.replace('plan-', '');
              const plan = layoutPlans.find((p) => p.id === planId);
              if (!plan) return <div className="text-white/20 text-sm font-kaiti italic text-center py-12">Plan not found.</div>;
              return (
                <div className="space-y-4">
                  <div className="luxury-card p-5">
                    <h4 className="font-display text-white/60 text-[10px] uppercase tracking-widest mb-3">① Cover Image (top of plan page)</h4>
                    <div className="max-w-xs">{renderPlanCover(plan)}</div>
                  </div>
                  {renderCatGrid(`plan-${planId}`, '② Plan Photo Gallery', 4)}
                </div>
              );
            }
            switch (layoutPage) {
              case 'home': return (
                <div className="space-y-4">
                  {/* Hero Slideshow */}
                  <div className="luxury-card p-5">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-display text-white/60 text-[10px] uppercase tracking-widest">① Hero Slideshow</h4>
                      {heroFiles.length > 0 && !heroFiles.some((f) => f.isHero) && (
                        <span className="text-[8px] font-display text-amber-400/60 uppercase tracking-widest">★ 初期表示を選択してください</span>
                      )}
                    </div>
                    <div
                      onDragOver={(e) => { e.preventDefault(); setDropTarget('hero-drop'); }}
                      onDragLeave={() => setDropTarget(null)}
                      onDrop={(e) => handleLayoutSectionDrop(e, 'hero')}
                      className={`p-3 border-2 border-dashed rounded transition-all ${dropTarget === 'hero-drop' ? 'border-gold bg-gold/5' : 'border-white/10'}`}
                      style={{ display: 'grid', gridTemplateColumns: `repeat(${Math.max(heroFiles.length + 1, 4)}, minmax(0,1fr))`, gap: '0.5rem' }}
                    >
                      {heroFiles.map((f) => renderSectionImg(f, true))}
                      <div className={`aspect-video border-2 border-dashed rounded flex items-center justify-center ${dropTarget === 'hero-drop' ? 'border-gold bg-gold/10' : 'border-white/10'}`}>
                        <span className="text-[9px] font-display text-white/20 uppercase tracking-widest">{dropTarget === 'hero-drop' ? '▼ Drop' : '+ Drop'}</span>
                      </div>
                    </div>
                    {heroFiles.length > 0 && (
                      <p className="text-white/20 text-[8px] font-display uppercase tracking-widest mt-2">★ ボタンで初期表示 (最初に見せる) 画像を設定</p>
                    )}
                  </div>
                  {/* Hotel intro */}
                  <div className="luxury-card p-5">
                    <h4 className="font-display text-white/60 text-[10px] uppercase tracking-widest mb-3">② Hotel Introduction (first 3 shown on Home)</h4>
                    <div className="grid grid-cols-3 gap-3">
                      {[0, 1, 2].map((i) => {
                        const k = `hotel-slot-${i}`; const over = dropTarget === k;
                        return (
                          <div key={i}
                            onDragOver={(e) => { e.preventDefault(); setDropTarget(k); }}
                            onDragLeave={() => setDropTarget(null)}
                            onDrop={(e) => handleLayoutSectionDrop(e, 'hotel')}
                            className={`relative border-2 border-dashed rounded overflow-hidden transition-all ${over ? 'border-gold bg-gold/10' : 'border-white/10'}`}
                          >
                            <div className="aspect-[4/3] bg-white/5">
                              {hotelFiles[i] ? renderSectionImg(hotelFiles[i]) : null}
                            </div>
                            {!hotelFiles[i] && (
                              <div className="absolute inset-0 flex items-center justify-center">
                                <span className="text-[9px] font-display text-white/40 bg-black/50 px-2 py-0.5">
                                  {over ? '▼ Drop' : `Empty ${i + 1}`}
                                </span>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  {/* Plans preview */}
                  <div className="luxury-card p-5">
                    <h4 className="font-display text-white/60 text-[10px] uppercase tracking-widest mb-3">③ Plans Preview (first 3 visible)</h4>
                    {layoutPlans.filter((p) => p.visible).length === 0
                      ? <div className="text-white/20 text-xs font-kaiti italic text-center py-6">No visible plans</div>
                      : <div className="grid grid-cols-3 gap-3">{layoutPlans.filter((p) => p.visible).slice(0, 3).map((p) => renderPlanCover(p))}</div>
                    }
                  </div>
                  {renderCatGrid('surroundings', '④ Surroundings Preview (4 tiles)', 4)}
                </div>
              );
              case 'plans-list': return (
                <div className="luxury-card p-5">
                  <h4 className="font-display text-white/60 text-[10px] uppercase tracking-widest mb-3">Plan card cover images (all plans)</h4>
                  {layoutPlans.length === 0
                    ? <div className="text-white/20 text-xs font-kaiti italic text-center py-6">No plans</div>
                    : <div className="grid grid-cols-2 md:grid-cols-3 gap-3">{layoutPlans.map((p) => renderPlanCover(p))}</div>
                  }
                </div>
              );
              case 'gallery': return (
                <div className="space-y-4">
                  {renderCatGrid('hotel',        '① Hotel Introduction photos', 4)}
                  {renderCatGrid('surroundings', '② Surroundings photos',        4)}
                </div>
              );
              case 'surroundings': return renderCatGrid('surroundings', 'Surroundings page images', 4);
              default: return null;
            }
          };

          const isLibraryOver = dropTarget === 'library-drop';

          return (
            <div>
              {/* Draft bar */}
              {hasLayoutChanges && (
                <div className="flex items-center justify-between bg-gold/5 border border-gold/20 px-5 py-3 mb-6">
                  <span className="font-display text-gold text-[10px] uppercase tracking-widest">{changeCount} 件の変更 — 未反映</span>
                  <div className="flex items-center gap-3">
                    <button onClick={handleDiscardDraft}
                      className="px-4 py-1.5 border border-white/10 text-white/40 hover:text-red-400 hover:border-red-500/30 font-display text-[9px] uppercase tracking-widest transition-all">
                      破棄
                    </button>
                    <button onClick={() => setShowPreviewModal(true)}
                      className="px-4 py-1.5 border border-white/30 text-white/70 hover:border-white hover:text-white font-display text-[9px] uppercase tracking-widest transition-all">
                      プレビュー
                    </button>
                    <button onClick={handlePublish} disabled={isPublishing}
                      className="px-5 py-1.5 bg-gold text-black font-display text-[9px] uppercase tracking-widest hover:bg-gold/80 transition-colors disabled:opacity-50">
                      {isPublishing ? '反映中...' : '反映する'}
                    </button>
                  </div>
                </div>
              )}

              <div className="flex gap-6">
                {/* Left: page selector + media library */}
                <div className="w-56 flex-shrink-0 space-y-4">
                  <div className="luxury-card p-4">
                    <h3 className="font-display text-gold text-[10px] uppercase tracking-widest mb-3">Select Page</h3>
                    <div className="space-y-0.5">
                      {pageOptions.map((pg) => (
                        <button key={pg.id}
                          onClick={() => { setLayoutPage(pg.id); setDropTarget(null); }}
                          className={`w-full text-left px-3 py-2 transition-all duration-200 flex items-center justify-between group ${
                            layoutPage === pg.id
                              ? 'bg-gold/10 border-l-2 border-gold text-gold'
                              : 'text-white/40 hover:text-white/70 border-l-2 border-transparent'
                          } ${pg.id.startsWith('plan-') ? 'pl-5' : ''}`}
                        >
                          <span className="font-display text-[10px] uppercase tracking-widest truncate">{pg.label}</span>
                          <span className="text-[8px] text-white/20 font-display ml-1 flex-shrink-0 group-hover:text-white/40">{pg.url}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Media Library — drop here to remove from section */}
                  <div
                    onDragOver={(e) => { e.preventDefault(); setDropTarget('library-drop'); }}
                    onDragLeave={() => setDropTarget(null)}
                    onDrop={(e) => handleLayoutSectionDrop(e, 'library')}
                    className={`luxury-card p-4 sticky top-24 transition-all duration-200 ${isLibraryOver ? 'ring-2 ring-gold/50' : ''}`}
                  >
                    <h3 className="font-display text-gold text-[10px] uppercase tracking-widest mb-1">Media Library</h3>
                    <p className="text-white/20 text-[8px] font-display uppercase tracking-widest mb-3">
                      {isLibraryOver ? '↓ ここにドロップで配置解除' : 'Drag → section / ここに戻すで解除'}
                    </p>
                    <div className="grid grid-cols-3 gap-1.5 max-h-[55vh] overflow-y-auto pr-0.5">
                      {imgFiles.length === 0
                        ? <div className="col-span-3 text-white/20 text-xs font-kaiti italic text-center py-6">No images</div>
                        : imgFiles.map((f) => {
                          const isUnplaced = f.category === 'uncategorized';
                          return (
                            <div key={f.id}
                              draggable
                              onDragStart={() => setDraggedFile(f)}
                              onDragEnd={() => { setDraggedFile(null); setDropTarget(null); }}
                              className={`relative aspect-square overflow-hidden border cursor-grab active:cursor-grabbing transition-all ${
                                draggedFile?.id === f.id ? 'border-gold opacity-50 scale-95'
                                : isUnplaced ? 'border-white/15 hover:border-gold/50'
                                : 'border-gold/25 hover:border-gold/60'
                              }`}
                              title={`${f.name}\n[${isUnplaced ? '未配置' : f.category}]`}
                            >
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img src={f.url} alt={f.name} className="w-full h-full object-cover pointer-events-none" />
                              <div className="absolute bottom-0 left-0 right-0 bg-black/80 px-1 py-0.5">
                                <span className={`text-[6px] font-display uppercase tracking-widest truncate block ${isUnplaced ? 'text-white/30' : 'text-gold/60'}`}>
                                  {isUnplaced ? '未配置' : f.category.replace('plan-', '§')}
                                </span>
                              </div>
                              {f.isHero && <div className="absolute top-1 right-1 w-4 h-4 bg-gold flex items-center justify-center text-black text-[8px]">★</div>}
                            </div>
                          );
                        })
                      }
                    </div>
                  </div>
                </div>

                {/* Right: page sections */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-5">
                    <div className="gold-line" />
                    <span className="text-gold text-[10px] font-display uppercase tracking-[0.5em]">
                      {pageOptions.find((p) => p.id === layoutPage)?.label ?? layoutPage}
                    </span>
                    <span className="text-white/20 text-[9px] font-display">
                      {pageOptions.find((p) => p.id === layoutPage)?.url}
                    </span>
                    <div className="gold-line flex-1" />
                  </div>
                  {!hasLayoutChanges && (
                    <p className="text-white/20 text-[9px] font-display uppercase tracking-widest mb-4">
                      Library から画像をドロップして配置 / セクション内画像はドラッグで移動・削除
                    </p>
                  )}
                  {renderPageSections()}
                </div>
              </div>
            </div>
          );
        })()}
      </div>

      {/* ══════════════════ PREVIEW MODAL ══════════════════ */}
      {showPreviewModal && (() => {
        const pImgs = layoutFiles.filter((f) => f.type === 'image');
        const heroImgs = pImgs.filter((f) => f.category === 'hero');
        const hotelImgs = pImgs.filter((f) => f.category === 'hotel');
        const srndImgs  = pImgs.filter((f) => f.category === 'surroundings');
        const initialHero = heroImgs.find((f) => f.isHero) ?? heroImgs[0];

        const pageLabelMap: Record<string, string> = {
          home: 'Home', 'plans-list': 'Plans', gallery: 'Gallery', surroundings: 'Surroundings',
          ...layoutPlans.reduce((acc, p) => ({ ...acc, [`plan-${p.id}`]: p.titleEn || p.id }), {} as Record<string, string>),
        };

        const ImgBox = ({ url, aspect = 'aspect-video', className = '' }: { url: string; aspect?: string; className?: string }) =>
          url
            ? <div className={`relative overflow-hidden ${aspect} ${className}`}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={url} alt="" className="w-full h-full object-cover" />
              </div>
            : <div className={`bg-white/5 border border-dashed border-white/10 flex items-center justify-center ${aspect} ${className}`}>
                <span className="text-white/20 text-[8px] font-display uppercase">No image</span>
              </div>;

        const renderPreview = () => {
          /* ── HOME ── */
          if (layoutPage === 'home') return (
            <div className="space-y-0 bg-[#0a0806] rounded overflow-hidden">
              {/* Hero */}
              <div className="relative">
                <ImgBox url={initialHero?.url ?? ''} aspect="aspect-[16/7]" className="w-full" />
                <div className="absolute inset-0 bg-gradient-to-b from-black/20 to-black/60 flex flex-col items-center justify-end pb-8">
                  <div className="text-center">
                    <div className="text-[8px] font-display text-gold/80 uppercase tracking-[0.4em] mb-1">Terrace Villa Foresta Asama</div>
                    <div className="text-white/90 font-serif text-lg leading-tight mb-4">至高の自然体験</div>
                    <div className="flex gap-1 justify-center">
                      {heroImgs.slice(0, 5).map((f, i) => (
                        <div key={f.id} className={`w-1 h-1 rounded-full ${f.isHero || (i === 0 && !heroImgs.some(h => h.isHero)) ? 'bg-gold' : 'bg-white/30'}`} />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              {/* Hotel intro */}
              <div className="bg-[#0d0b09] px-6 py-5">
                <div className="text-[7px] font-display text-gold/60 uppercase tracking-[0.4em] mb-1">Hotel Introduction</div>
                <div className="grid grid-cols-3 gap-2 mt-3">
                  {hotelImgs.slice(0, 3).map((f) => (
                    <ImgBox key={f.id} url={f.url} aspect="aspect-[4/3]" />
                  ))}
                  {Array.from({ length: Math.max(0, 3 - hotelImgs.length) }).map((_, i) => (
                    <ImgBox key={`empty-${i}`} url="" aspect="aspect-[4/3]" />
                  ))}
                </div>
              </div>
              {/* Plans */}
              <div className="bg-[#0a0806] px-6 py-5">
                <div className="text-[7px] font-display text-gold/60 uppercase tracking-[0.4em] mb-3">Travel Plans</div>
                <div className="grid grid-cols-3 gap-2">
                  {layoutPlans.filter((p) => p.visible).slice(0, 3).map((p) => (
                    <div key={p.id} className="bg-white/5 overflow-hidden rounded-sm">
                      <ImgBox url={p.coverImage} aspect="aspect-[4/3]" />
                      <div className="p-2">
                        <div className="text-white/70 text-[8px] font-display uppercase tracking-widest truncate">{p.titleEn || p.id}</div>
                        <div className="text-gold/60 text-[8px] font-display">{p.price}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              {/* Surroundings */}
              <div className="bg-[#0d0b09] px-6 py-5">
                <div className="text-[7px] font-display text-gold/60 uppercase tracking-[0.4em] mb-3">Surroundings</div>
                <div className="grid grid-cols-4 gap-1.5">
                  {srndImgs.slice(0, 4).map((f) => (
                    <ImgBox key={f.id} url={f.url} aspect="aspect-[4/3]" />
                  ))}
                  {Array.from({ length: Math.max(0, 4 - srndImgs.length) }).map((_, i) => (
                    <ImgBox key={`empty-${i}`} url="" aspect="aspect-[4/3]" />
                  ))}
                </div>
              </div>
            </div>
          );

          /* ── PLANS LIST ── */
          if (layoutPage === 'plans-list') return (
            <div className="bg-[#0a0806] rounded overflow-hidden p-4">
              <div className="text-[7px] font-display text-gold/60 uppercase tracking-[0.4em] mb-3">Travel Plans</div>
              <div className="grid grid-cols-3 gap-2">
                {layoutPlans.map((p) => (
                  <div key={p.id} className={`bg-white/5 overflow-hidden rounded-sm ${!p.visible ? 'opacity-40' : ''}`}>
                    <ImgBox url={p.coverImage} aspect="aspect-[4/3]" />
                    <div className="p-2">
                      <div className="text-white/70 text-[8px] font-display uppercase tracking-widest truncate">{p.titleEn || p.id}</div>
                      <div className="text-gold/60 text-[8px] font-display">{p.price}</div>
                      {!p.visible && <div className="text-white/25 text-[7px] font-display uppercase">hidden</div>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );

          /* ── GALLERY ── */
          if (layoutPage === 'gallery') return (
            <div className="bg-[#0a0806] rounded overflow-hidden p-4 space-y-4">
              <div>
                <div className="text-[7px] font-display text-gold/60 uppercase tracking-[0.4em] mb-2">Hotel Photos</div>
                <div className="grid grid-cols-4 gap-1.5">
                  {hotelImgs.map((f) => <ImgBox key={f.id} url={f.url} aspect="aspect-[4/3]" />)}
                  {hotelImgs.length === 0 && <ImgBox url="" aspect="aspect-[4/3]" className="col-span-4" />}
                </div>
              </div>
              <div>
                <div className="text-[7px] font-display text-gold/60 uppercase tracking-[0.4em] mb-2">Surroundings</div>
                <div className="grid grid-cols-4 gap-1.5">
                  {srndImgs.map((f) => <ImgBox key={f.id} url={f.url} aspect="aspect-[4/3]" />)}
                  {srndImgs.length === 0 && <ImgBox url="" aspect="aspect-[4/3]" className="col-span-4" />}
                </div>
              </div>
            </div>
          );

          /* ── SURROUNDINGS ── */
          if (layoutPage === 'surroundings') return (
            <div className="bg-[#0a0806] rounded overflow-hidden p-4">
              <div className="text-[7px] font-display text-gold/60 uppercase tracking-[0.4em] mb-2">Surroundings</div>
              <div className="grid grid-cols-4 gap-1.5">
                {srndImgs.map((f) => <ImgBox key={f.id} url={f.url} aspect="aspect-[4/3]" />)}
                {srndImgs.length === 0 && <ImgBox url="" aspect="aspect-[4/3]" className="col-span-4" />}
              </div>
            </div>
          );

          /* ── PLAN DETAIL ── */
          if (layoutPage.startsWith('plan-')) {
            const planId = layoutPage.replace('plan-', '');
            const plan = layoutPlans.find((p) => p.id === planId);
            if (!plan) return <div className="text-white/20 text-sm font-kaiti italic text-center py-8">Plan not found.</div>;
            const galleryImgs = pImgs.filter((f) => f.category === `plan-${planId}`);
            return (
              <div className="bg-[#0a0806] rounded overflow-hidden">
                <ImgBox url={plan.coverImage} aspect="aspect-[16/7]" className="w-full" />
                <div className="p-4">
                  <div className="text-[7px] font-display text-gold/60 uppercase tracking-[0.4em] mb-1">{plan.tagEn || 'Plan'}</div>
                  <div className="text-white/80 font-serif text-sm mb-3">{plan.titleEn || plan.id}</div>
                  <div className="text-gold/70 text-[8px] font-display mb-4">{plan.price} · {plan.duration} days</div>
                  {galleryImgs.length > 0 && (
                    <div>
                      <div className="text-[7px] font-display text-gold/60 uppercase tracking-[0.4em] mb-2">Photo Gallery</div>
                      <div className="grid grid-cols-4 gap-1.5">
                        {galleryImgs.slice(0, 8).map((f) => <ImgBox key={f.id} url={f.url} aspect="aspect-[4/3]" />)}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          }

          return null;
        };

        return (
          <div className="fixed inset-0 bg-black/90 z-[300] flex items-start justify-center overflow-y-auto py-8 px-4">
            <div className="w-full max-w-2xl bg-[#0a0a0a] border border-white/10">
              <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
                <div>
                  <h2 className="font-display text-gold text-sm uppercase tracking-widest">Preview</h2>
                  <p className="text-white/30 text-[9px] font-display uppercase tracking-widest mt-0.5">
                    {pageLabelMap[layoutPage] ?? layoutPage} — {changeCount} 件の変更（未反映）
                  </p>
                </div>
                <button onClick={() => setShowPreviewModal(false)} className="text-white/40 hover:text-white text-2xl leading-none">×</button>
              </div>
              <div className="p-4">{renderPreview()}</div>
              <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-white/10">
                <button onClick={() => { handleDiscardDraft(); setShowPreviewModal(false); }}
                  className="px-5 py-2 border border-white/10 text-white/40 hover:text-red-400 hover:border-red-500/30 font-display text-xs uppercase tracking-widest transition-all">
                  破棄
                </button>
                <button onClick={() => setShowPreviewModal(false)}
                  className="px-5 py-2 border border-white/20 text-white/60 hover:text-white font-display text-xs uppercase tracking-widest transition-all">
                  編集に戻る
                </button>
                <button onClick={handlePublish} disabled={isPublishing}
                  className="px-8 py-2 bg-gold text-black font-display text-xs uppercase tracking-widest hover:bg-gold/80 transition-colors disabled:opacity-50">
                  {isPublishing ? '反映中...' : '反映する'}
                </button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
