'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import gsap from 'gsap';
import { useLanguage } from '@/contexts/LanguageContext';
import { Language } from '@/i18n/translations';
import ContactModal from '@/components/ContactModal';

const baseNavItems = [
  { key: 'home',         href: '/',             labelZh: 'Home',        labelJa: 'Home',  labelEn: 'Home' },
  { key: 'library',      href: '/library',       labelZh: 'Gallery',     labelJa: 'Gallery', labelEn: 'Gallery' },
  { key: 'plans',        href: '/plans',         labelZh: 'Plans',       labelJa: 'Plans', labelEn: 'Plans' },
  { key: 'surroundings', href: '/surroundings',  labelZh: 'Surroundings', labelJa: 'Surroundings', labelEn: 'Surroundings' },
  { key: 'seasons',      href: '/seasons',       labelZh: 'Seasons',      labelJa: 'Seasons', labelEn: 'Seasons' },
];

const languages: { code: Language; label: string }[] = [
  { code: 'zh', label: '中文' },
  { code: 'ja', label: '日本語' },
  { code: 'en', label: 'EN' },
];

export default function Header() {
  const { language, setLanguage } = useLanguage();
  const pathname = usePathname();
  const navItems = baseNavItems.map((item) => ({
    ...item,
    label: language === 'zh' ? item.labelZh : language === 'ja' ? item.labelJa : item.labelEn,
  }));
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [contactOpen, setContactOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 100);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleMenu = () => {
    const next = !menuOpen;
    setMenuOpen(next);
    document.body.style.overflow = next ? 'hidden' : '';

    if (next) {
      gsap.fromTo('.mobile-menu a, .mobile-menu button',
        { opacity: 0, y: 24 },
        { opacity: 1, y: 0, duration: 0.5, stagger: 0.06, ease: 'power2.out', delay: 0.15 }
      );
    }
  };

  const closeMenu = () => {
    setMenuOpen(false);
    document.body.style.overflow = '';
  };

  return (
    <>
      <header
        style={{ top: 'var(--banner-h, 0px)' }}
        className={`fixed left-0 right-0 z-50 transition-all duration-500 ${
          scrolled
            ? 'nav-scrolled border-b border-white/5'
            : 'bg-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex flex-col nav-logo">
            <span className="font-display text-gold text-xs tracking-[0.5em] uppercase">
              Terrace Villa
            </span>
            <span className="font-display text-white font-bold text-lg tracking-widest uppercase leading-tight">
              Foresta Asama
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8 nav-links">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.key}
                  href={item.href}
                  className={`font-display text-xs tracking-[0.3em] uppercase transition-colors duration-300 nav-link ${
                    isActive
                      ? 'text-gold border-b border-gold pb-0.5'
                      : 'text-white/60 hover:text-gold'
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Language Switcher + Buttons */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1 border border-white/10 rounded-sm overflow-hidden">
              {languages.map((lang, idx) => (
                <button
                  key={lang.code}
                  onClick={() => setLanguage(lang.code)}
                  className={`px-2.5 py-1 text-[10px] font-display uppercase tracking-widest transition-all duration-200 ${
                    language === lang.code
                      ? 'bg-gold text-black font-bold'
                      : 'text-white/40 hover:text-white/80'
                  } ${idx > 0 ? 'border-l border-white/10' : ''}`}
                >
                  {lang.label}
                </button>
              ))}
            </div>

            <button
              onClick={() => setContactOpen(true)}
              className="hidden md:block font-display text-xs tracking-[0.3em] uppercase text-white/60 hover:text-gold transition-colors duration-300"
            >
              Contact
            </button>

            <Link href="/admin/login"
              className="hidden md:block font-display text-[9px] tracking-[0.3em] uppercase text-white/15 hover:text-white/40 transition-colors duration-300">
              Admin
            </Link>

            {/* Hamburger button */}
            <button
              className={`hamburger md:hidden ${menuOpen ? 'active' : ''}`}
              onClick={toggleMenu}
              aria-label="メニュー"
            >
              <span /><span /><span />
            </button>
          </div>
        </div>
      </header>

      {/* Full-screen mobile menu overlay */}
      <div className={`mobile-menu ${menuOpen ? 'open' : ''}`}>
        <Link href="/"            className="nav-link" onClick={closeMenu}>Home</Link>
        <Link href="/library"     className="nav-link" onClick={closeMenu}>Gallery</Link>
        <Link href="/plans"       className="nav-link" onClick={closeMenu}>Plans</Link>
        <Link href="/surroundings" className="nav-link" onClick={closeMenu}>Surroundings</Link>
        <Link href="/seasons"     className="nav-link" onClick={closeMenu}>Seasons</Link>
        <button
          onClick={() => { closeMenu(); setContactOpen(true); }}
          style={{ color: 'var(--gold, #c9a96e)' }}
          className="nav-link"
        >
          Contact
        </button>
      </div>

      {contactOpen && <ContactModal onClose={() => setContactOpen(false)} />}
    </>
  );
}
