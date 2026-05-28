/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Flame, Instagram, Phone, Globe, MessageCircle } from 'lucide-react';

export default function Footer() {
  const handleScrollTo = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
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
            <div className="flex items-center gap-2 group mb-4">
              <div className="bg-primary-orange text-white p-2 rounded-xl">
                <Flame className="w-5 h-5 text-amber-100" />
              </div>
              <span className="font-display font-extrabold text-xl text-white tracking-tight">
                Yusuki
              </span>
            </div>
            <p className="font-sans text-xs sm:text-sm text-brand-cream/60 leading-relaxed font-normal max-w-sm">
              Dimsum Suki Yusuki menyajikan aneka dimsum goreng-kukus homemade premium dengan saus unik buatan sendiri serta kuah Suki Tomyum segar sejak 2021.
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
              <a href="#promo" onClick={(e) => handleScrollTo(e, '#promo')} className="hover:text-primary-orange transition-colors">Paket Promo</a>
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
                href="https://instagram.com/dimsumsuki.yusuki"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-brand-charcoal-light border border-zinc-800 hover:border-zinc-500 p-2.5 rounded-xl text-brand-cream hover:text-primary-orange transition-colors"
                aria-label="Instagram Profile"
              >
                <Instagram className="w-4 h-4" />
              </a>

              <a
                href="https://wa.me/6282123456789"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-brand-charcoal-light border border-zinc-800 hover:border-zinc-500 p-2.5 rounded-xl text-brand-cream hover:text-[#22c55e] transition-colors"
                aria-label="WhatsApp Admin Chat"
              >
                <MessageCircle className="w-4 h-4" />
              </a>
            </div>
          </div>

        </div>

        {/* Bottom copyright details bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-[10px] sm:text-xs text-zinc-500 font-mono font-medium text-center sm:text-left">
            &copy; {new Date().getFullYear()} Dimsum Suki Yusuki. Hak cipta dilindungi undang-undang.
          </p>
          <div className="flex items-center gap-1.5 text-[10px] text-zinc-500 font-semibold font-mono">
            <span>Dibuat dengan rasa cinta di Indonesia</span>
            <span className="text-rose-600 animate-pulse">&hearts;</span>
          </div>
        </div>

      </div>
    </footer>
  );
}
