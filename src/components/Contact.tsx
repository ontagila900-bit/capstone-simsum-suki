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
  tiktokHandle: '@owner.yusuki',
  shopeefoodUrl: 'https://shopee.co.id/m/shopeefood',
  gofoodUrl: 'https://gofood.co.id'
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

const ShopeeFoodIcon = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
    <line x1="3" y1="6" x2="21" y2="6" />
    <path d="M16 10a4 4 0 0 1-8 0" />
  </svg>
);

const GoFoodIcon = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2" />
    <path d="M7 2v20" />
    <path d="M21 15V2v0a5 5 0 0 0-5 5v3c0 1.1.9 2 2 2h3" />
    <path d="M21 15v7" />
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
    <section id="kontak" className="py-12 bg-brand-cream/15 border-t border-brand-cream-dark/30 relative scroll-mt-10 overflow-hidden">
      
      {/* Soft minimal ambient glow */}
      <div className="absolute top-[30%] left-[20%] w-[180px] h-[180px] bg-primary-orange/5 rounded-full blur-[60px]" />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-center">
          
          {/* Streamlined Minimalist Container */}
          <div className="w-full max-w-2xl bg-brand-charcoal text-white rounded-2xl p-5 sm:p-8 border border-brand-charcoal-light flex flex-col justify-center items-center relative overflow-hidden shadow">
            
            {/* Subtle overlay decor */}
            <div className="absolute inset-0 bg-[radial-gradient(#2d2a27_1px,transparent_1px)] [background-size:20px_20px] opacity-20" />
            
            <div className="relative text-center max-w-md flex flex-col items-center">
              <div className="bg-primary-orange p-2.5 rounded-xl w-fit shadow-md mb-4 text-white">
                <MessageCircle className="w-6 h-6 text-white fill-white" />
              </div>

              <h3 className="font-display text-lg sm:text-xl font-bold tracking-tight text-white mb-1.5">
                Siap Ambil Pesanan Suki/Dimsum?
              </h3>
              
              <p className="font-sans text-[11px] sm:text-xs text-brand-cream/70 leading-normal font-normal mb-5">
                Hubungi WhatsApp kami untuk pesan Take Away agar disiapkan hangat-hangat pas Anda datang!
              </p>

              {/* Conversion CTA button */}
              <button
                onClick={onPesanSekarangClick}
                className="w-full bg-primary-orange hover:bg-primary-orange-dark text-white font-extrabold text-sm py-3 px-6 rounded-xl shadow-lg transition-all transform hover:-translate-y-0.5 cursor-pointer flex items-center justify-center gap-2 select-none mb-5"
              >
                <span>Pesan Take Away via WA</span>
                <span>&rarr;</span>
              </button>

              {/* Real Connection Row */}
              <div className="w-full border-t border-zinc-800/80 pt-4">
                <p className="text-[10px] font-bold tracking-wider uppercase text-zinc-400 font-mono mb-2.5">
                  Hubungi, Ikuti Kami, atau Pesan Online Delivery:
                </p>

                <div className="grid grid-cols-3 gap-2.5 w-full mb-4">
                  {/* WhatsApp */}
                  <a
                    href={`https://wa.me/${settings.whatsappNumber}?text=Halo%20kak%20Suki%20Yusuki,%20saya%20mau%20order%20suki/dimsum...`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-1.5 bg-emerald-500/10 border border-emerald-500/20 hover:bg-emerald-500/20 py-1.5 rounded-lg transition-all group cursor-pointer"
                  >
                    <MessageCircle className="w-3.5 h-3.5 text-emerald-400 fill-emerald-400/10" />
                    <span className="text-[10px] font-bold text-emerald-300">
                      WhatsApp
                    </span>
                  </a>

                  {/* Instagram */}
                  <a
                    href={settings.instagramUrl || 'https://www.instagram.com/sukiyusuki?igsh=azNxcTNndnRmbG16'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-1.5 bg-pink-500/10 border border-pink-500/20 hover:bg-pink-500/20 py-1.5 rounded-lg transition-all group cursor-pointer"
                  >
                    <Instagram className="w-3.5 h-3.5 text-pink-400" />
                    <span className="text-[10px] font-bold text-pink-300">
                      Instagram
                    </span>
                  </a>

                  {/* TikTok */}
                  <a
                    href={settings.tiktokUrl || 'https://www.tiktok.com/@sukiyusuki'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-1.5 bg-zinc-500/10 border border-zinc-500/20 hover:bg-zinc-500/20 py-1.5 rounded-lg transition-all group cursor-pointer"
                  >
                    <TikTokIcon className="w-3.5 h-3.5 text-zinc-300" />
                    <span className="text-[10px] font-bold text-zinc-300">
                      TikTok
                    </span>
                  </a>
                </div>

                {/* Delivery Platforms Integration */}
                <div className="mt-3 pt-3 border-t border-zinc-800/40">
                  <p className="text-[9px] font-semibold text-zinc-400 mb-2 font-sans">
                    Kami juga tersedia di platform pencarian & pemesanan makanan online resmi favorit Anda:
                  </p>
                  
                  <div className="flex items-center justify-center gap-3">
                    {/* ShopeeFood link/button */}
                    <a
                      href={settings.shopeefoodUrl || 'https://shopee.co.id/m/shopeefood'}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 bg-orange-500/10 border border-orange-500/20 hover:bg-orange-500/20 px-2.5 py-1.5 rounded-lg transition-all cursor-pointer"
                    >
                      <ShopeeFoodIcon className="w-4 h-4 text-orange-500" />
                      <span className="text-[10px] font-bold text-orange-500">ShopeeFood</span>
                      <span className="text-[9px] font-extrabold font-mono text-amber-500 border-l border-zinc-800/60 pl-1.5 ml-0.5">★ 4.9</span>
                    </a>

                    {/* GoFood link/button */}
                    <a
                      href={settings.gofoodUrl || 'https://gofood.co.id'}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/20 hover:bg-emerald-500/20 px-2.5 py-1.5 rounded-lg transition-all cursor-pointer"
                    >
                      <GoFoodIcon className="w-4 h-4 text-emerald-500" />
                      <span className="text-[10px] font-bold text-emerald-550">GoFood</span>
                      <span className="text-[9px] font-extrabold font-mono text-emerald-500 border-l border-zinc-800/60 pl-1.5 ml-0.5">★ 4.8</span>
                    </a>
                  </div>
                </div>
              </div>

              <p className="text-[10px] text-gray-500 font-mono font-medium mt-4">
                🔒 Tanpa komisi platform &bull; Dukung Usaha Lokal Indonesia
              </p>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
}
