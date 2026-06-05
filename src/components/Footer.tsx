/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Flame, Instagram, Phone, Globe, MessageCircle } from 'lucide-react';
import yusukiLogo from '../assets/images/yusuki_logo_1780421141524.png';

interface FooterProps {
  logoUrl?: string;
  onOpenAdmin?: () => void;
}

const TikTokIcon = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
    aria-hidden="true"
  >
    <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.02 1.56 4.15.94 1.15 2.35 1.85 3.79 1.9v3.82c-1.48-.11-2.92-.72-3.93-1.75-.43-.44-.81-.95-1.12-1.49-.02 2.8-.01 5.6-.02 8.41-.09 2.25-.86 4.54-2.45 6.13-1.85 1.86-4.66 2.5-7.14 1.7-2.67-.84-4.82-3.23-5.06-6.02-.32-3.14 1.59-6.32 4.67-7.22.84-.25 1.74-.32 2.61-.25V11.2c-1.07-.15-2.23.09-3.04.83a3.84 3.84 0 0 0-1.16 3.74c.3 1.74 1.81 3.19 3.57 3.2 1.63.14 3.23-.97 3.65-2.54.19-.68.21-1.39.2-2.1V.02z" />
  </svg>
);

export default function Footer({ logoUrl, onOpenAdmin }: FooterProps) {
  const handleScrollTo = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    if (href === '#home') {
      window.scrollTo({
        top: 0,
        behavior: 'smooth',
      });
      return;
    }
    const target = document.querySelector(href);
    if (target) {
      const offset = 80;
      const targetPosition = target.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({
        top: targetPosition,
        behavior: 'smooth',
      });
    }
  };

  return (
    <footer className="bg-brand-charcoal text-white border-t border-brand-charcoal-light py-12 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        
        {/* Top details layout */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 pb-10 border-b border-zinc-800">
          
          {/* Brand Info */}
          <div className="md:col-span-5 flex flex-col items-center md:items-start text-center md:text-left">
            <div className="flex items-center gap-2.5 group mb-4">
              <div className="w-9 h-9 rounded-full overflow-hidden shadow-sm bg-white border border-zinc-800 flex items-center justify-center">
                <img
                  src={logoUrl || yusukiLogo}
                  alt="Yusuki Logo"
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
              <span className="font-display font-extrabold text-xl text-white tracking-tight">
                Suki Yusuki
              </span>
            </div>
            <p className="font-sans text-xs sm:text-sm text-brand-cream/60 leading-relaxed font-normal max-w-sm">
              Suki Yusuki menyajikan aneka dimsum goreng-kukus homemade premium dengan saus unik buatan sendiri serta kuah Suki Tomyum segar sejak 2021.
            </p>
          </div>

          {/* Quick Navigation Links */}
          <div className="md:col-span-4 flex flex-col items-center md:items-start">
            <h4 className="font-display font-bold text-xs uppercase text-slate-300 tracking-widest font-mono mb-4">
              Peta Situs
            </h4>
            <div className="grid grid-cols-2 gap-x-8 gap-y-2.5 text-center md:text-left text-xs text-brand-cream/70 font-semibold font-sans">
              <a href="#home" onClick={(e) => handleScrollTo(e, '#home')} className="hover:text-primary-orange transition-colors">Home</a>
              <a href="#menu" onClick={(e) => handleScrollTo(e, '#menu')} className="hover:text-primary-orange transition-colors">Daftar Menu</a>
              <a href="#tentang" onClick={(e) => handleScrollTo(e, '#tentang')} className="hover:text-primary-orange transition-colors">Tentang Kami</a>
              <a href="#kontak" onClick={(e) => handleScrollTo(e, '#kontak')} className="hover:text-primary-orange transition-colors">Hubungi Kami</a>
              <a href="#faq-section" className="hover:text-primary-orange transition-colors">Tanya Jawab</a>
            </div>
          </div>

          {/* Social media connections */}
          <div className="md:col-span-3 flex flex-col items-center md:items-start text-center md:text-left">
            <h4 className="font-display font-bold text-xs uppercase text-slate-300 tracking-widest font-mono mb-4 font-black">
              Ekosistem Sosial
            </h4>
            <p className="text-[11px] text-zinc-500 font-medium mb-3.5 leading-relaxed font-sans">
              Ikuti keseruan, promo kejutan instan mingguan, dan resep harian dari kami!
            </p>
            <div className="flex items-center gap-3">
              <a
                href="https://www.instagram.com/sukiyusuki?igsh=azNxcTNndnRmbG16"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-brand-charcoal-light border border-zinc-800 hover:border-zinc-500 p-2.5 rounded-xl text-brand-cream hover:text-primary-orange transition-colors"
                aria-label="Instagram Profile"
              >
                <Instagram className="w-4 h-4" />
              </a>

              <a
                href="https://wa.me/6281818758265"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-brand-charcoal-light border border-zinc-800 hover:border-zinc-500 p-2.5 rounded-xl text-brand-cream hover:text-[#22c55e] transition-colors"
                aria-label="WhatsApp Admin Chat"
              >
                <MessageCircle className="w-4 h-4" />
              </a>

              <a
                href="https://www.tiktok.com/@sukiyusuki"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-brand-charcoal-light border border-zinc-800 hover:border-zinc-500 p-2.5 rounded-xl text-brand-cream hover:text-[#00f2fe] transition-colors"
                aria-label="TikTok Profile"
              >
                <TikTokIcon className="w-4 h-4" />
              </a>
            </div>
          </div>

        </div>

        {/* Bottom copyright details bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4">
            <p className="text-[10px] sm:text-xs text-zinc-500 font-mono font-medium text-center sm:text-left">
              &copy; {new Date().getFullYear()} Suki Yusuki. Hak cipta dilindungi undang-undang.
            </p>
            {onOpenAdmin && (
              <button
                onClick={onOpenAdmin}
                className="text-[10px] sm:text-xs text-zinc-600 hover:text-primary-orange font-mono font-medium cursor-pointer flex items-center gap-1 hover:underline transition-colors pt-1 sm:pt-0"
                title="Akses Dashboard Admin"
              >
                <span className="text-zinc-700">&bull;</span>
                <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="opacity-70"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                <span>Kelola</span>
              </button>
            )}
          </div>
          <div className="flex items-center gap-1.5 text-[10px] text-zinc-500 font-semibold font-mono">
            <span>Dibuat dengan rasa cinta di Indonesia</span>
            <span className="text-rose-600 animate-pulse">&hearts;</span>
          </div>
        </div>

      </div>
    </footer>
  );
}
