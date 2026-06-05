/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Phone, Instagram, Flame, MapPin, Clock, MessageCircle, ExternalLink, Calendar } from 'lucide-react';
import { motion } from 'motion/react';
import { AppSettings } from '../types';

interface ContactProps {
  onPesanSekarangClick: () => void;
  appSettings?: AppSettings;
}

export const defaultSettings: AppSettings = {
  logoUrl: '',
  outletAddress: 'Kuliner Malam, Jl. Ps. Pon Utara Jl. Jend. Sudirman, Bantarsoka, Kec. Purwokerto Bar., Kabupaten Banyumas, Jawa Tengah 53133',
  outletGmaps: 'https://maps.app.goo.gl/FtGnmFTyo2AB8X8AA',
  operatingHours: '16.30 WIB - Selesai',
  operatingHoursSub: '(Biasa sold out jam 21.00!)',
  operatingDays: 'Buka Setiap Hari',
  operatingDaysSub: '(Senin s/d Minggu)',
  whatsappNumber: '6281818758265',
  whatsappName: 'Suki Yusuki Admin',
  whatsappHandle: '0818-1875-8265 (Suki Yusuki Admin)',
  instagramUrl: 'https://www.instagram.com/sukiyusuki?igsh=azNxcTNndnRmbG16',
  instagramHandle: '@sukiyusuki',
  tiktokUrl: 'https://www.tiktok.com/@sukiyusuki',
  tiktokHandle: '@owner.yusuki'
};

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

export default function Contact({ onPesanSekarangClick, appSettings }: ContactProps) {
  const settings = { ...defaultSettings, ...appSettings };

  const socialLinks = [
    {
      id: 's-wa',
      name: 'WhatsApp Business',
      handle: settings.whatsappHandle || '0818-1875-8265',
      href: `https://wa.me/${settings.whatsappNumber}?text=Halo%20kak%20Suki%20Yusuki,%20saya%20mau%20order%20suki/dimsum...`,
      icon: Phone,
      color: 'bg-emerald-500 text-white',
    },
    {
      id: 's-ig',
      name: 'Instagram Official',
      handle: settings.instagramHandle || '@sukiyusuki',
      href: settings.instagramUrl || 'https://www.instagram.com/sukiyusuki?igsh=azNxcTNndnRmbG16',
      icon: Instagram,
      color: 'bg-gradient-to-tr from-purple-600 via-pink-500 to-amber-500 text-white',
    },
  ];

  return (
    <section id="kontak" className="py-20 bg-brand-cream/35 border-t border-brand-cream-dark/50 relative scroll-mt-10 overflow-hidden">
      
      {/* Backlighting Blur glow */}
      <div className="absolute top-[20%] left-[-10%] w-[350px] h-[350px] bg-primary-orange/5 rounded-full blur-[80px]" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="flex justify-center">
          
          {/* Quick Conversion order Form / Box list (Right Pane) */}
          <div className="w-full max-w-4xl bg-brand-charcoal text-white rounded-3xl p-6 sm:p-10 border border-brand-charcoal-light flex flex-col justify-center items-center relative overflow-hidden shadow-md">
            {/* Grid background decor */}
            <div className="absolute inset-0 bg-[radial-gradient(#2d2a27_1px,transparent_1px)] [background-size:20px_20px] opacity-35" />
            
            {/* Large Glowing orange orb */}
            <div className="absolute bottom-[-20%] right-[-10%] w-[250px] h-[250px] bg-primary-orange/20 rounded-full blur-[70px]" />

            <div className="relative text-center max-w-md flex flex-col items-center">
              <div className="bg-primary-orange p-3.5 rounded-2xl w-fit shadow-lg mb-6">
                <MessageCircle className="w-8 h-8 text-white fill-white" />
              </div>

              <h3 className="font-display text-2xl sm:text-3xl font-extrabold tracking-tight text-white mb-3">
                Siap Meluncur Ambil Pesanan?
              </h3>
              
              <p className="font-sans text-xs sm:text-sm text-brand-cream/70 leading-relaxed font-normal mb-8">
                Yuk gabung dengan ribuan pelanggan penikmat dimsum suki premium kami. Pesan sekarang melalui WhatsApp untuk disiapkan hangat-hangat, lalu tinggal Anda ambil langsung di outlet fisik kami!
              </p>

              {/* Conversion Big CTA button */}
              <button
                onClick={onPesanSekarangClick}
                className="w-full bg-primary-orange hover:bg-primary-orange-dark text-white font-extrabold text-base py-4 px-8 rounded-2xl shadow-xl hover:shadow-orange-500/10 transition-all duration-300 transform hover:-translate-y-0.5 cursor-pointer flex items-center justify-center gap-3 select-none mb-6"
              >
                <span>Pesan Take Away Lewat WA</span>
                <span>&rarr;</span>
              </button>

              {/* Real Connection Row */}
              <div className="w-full border-t border-zinc-800/85 pt-6 mt-2">
                <h4 className="text-[11px] font-bold tracking-wider uppercase text-zinc-400 font-mono mb-4 text-center">
                  Hubungi & Ikuti Kami di Media Sosial:
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full">
                  {/* WhatsApp */}
                  <a
                    href={`https://wa.me/${settings.whatsappNumber}?text=Halo%20kak%20Suki%20Yusuki,%20saya%20mau%20order%20suki/dimsum...`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 bg-emerald-500/10 border border-emerald-500/20 hover:bg-emerald-500/20 px-3 py-2.5 rounded-2xl transition-all group cursor-pointer"
                  >
                    <MessageCircle className="w-4 h-4 text-emerald-400 fill-emerald-400/20" />
                    <span className="text-xs font-bold text-emerald-300 group-hover:text-emerald-200">
                      WhatsApp
                    </span>
                  </a>

                  {/* Instagram */}
                  <a
                    href={settings.instagramUrl || 'https://www.instagram.com/sukiyusuki?igsh=azNxcTNndnRmbG16'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 bg-pink-500/10 border border-pink-500/20 hover:bg-pink-500/20 px-3 py-2.5 rounded-2xl transition-all group cursor-pointer"
                  >
                    <Instagram className="w-4 h-4 text-pink-400" />
                    <span className="text-xs font-bold text-pink-300 group-hover:text-pink-200">
                      Instagram
                    </span>
                  </a>

                  {/* TikTok */}
                  <a
                    href={settings.tiktokUrl || 'https://www.tiktok.com/@sukiyusuki'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 bg-zinc-500/10 border border-zinc-500/20 hover:bg-zinc-500/20 px-3 py-2.5 rounded-2xl transition-all group cursor-pointer"
                  >
                    <TikTokIcon className="w-4 h-4 text-zinc-300" />
                    <span className="text-xs font-bold text-zinc-300 group-hover:text-zinc-200">
                      TikTok
                    </span>
                  </a>
                </div>
              </div>

              <p className="text-[10px] text-gray-500 font-mono font-medium mt-6">
                🔒 Tanpa komisi platform &bull; Dukung Usaha Lokal Indonesia
              </p>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
}
