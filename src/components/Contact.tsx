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
  operatingHours: '17.00 WIB - Selesai',
  operatingHoursSub: '(Biasa sold out jam 21.00!)',
  operatingDays: 'Buka Setiap Hari',
  operatingDaysSub: '(Senin s/d Minggu)',
  whatsappNumber: '6281818758265',
  whatsappName: 'Suki Yusuki Admin',
  whatsappHandle: '0818-1875-8265 (Suki Yusuki Admin)',
  instagramUrl: 'https://www.instagram.com/sukiyusuki?igsh=azNxcTNndnRmbG16',
  instagramHandle: '@sukiyusuki',
  tiktokUrl: 'https://tiktok.com/@sukiyusuki',
  tiktokHandle: '@owner.yusuki'
};

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
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-stretch">
          
          {/* Outlets detail card and hours (Left Pane) */}
          <div className="lg:col-span-6 flex flex-col justify-between bg-white rounded-3xl p-5 sm:p-8 border border-brand-cream shadow-md">
            
            <div>
              <div className="inline-flex items-center gap-1.5 bg-primary-orange-dark/10 px-3 py-1 rounded-full text-[10px] font-bold text-primary-orange-dark uppercase tracking-wider mb-4 font-mono">
                <Flame className="w-4 h-4" />
                <span>Outlet Utama Kami</span>
              </div>

              <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-brand-charcoal mb-4">
                Kunjungi Outlet Fisik Yusuki
              </h2>
              <p className="font-sans text-xs sm:text-sm text-brand-charcoal/65 leading-relaxed font-semibold mb-6">
                Ingin bersantap hangat langsung di tempat? Silakan merapat langsung ke lokasi outlet fisik kami untuk menikmati dimsum kental berkuah dan suki berlimpah saus.
              </p>

              {/* Contact Details List */}
              <div className="space-y-5">
                {/* Location */}
                <div className="flex items-start gap-3 sm:gap-4">
                  <div className="p-2.5 rounded-xl bg-orange-100 text-primary-orange flex-shrink-0">
                    <MapPin className="w-5 h-5 text-primary-orange-dark" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold font-display uppercase tracking-wider text-gray-400 font-mono">Lokasi Outlet</h4>
                    <a
                      href={settings.outletGmaps}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group/map text-xs sm:text-sm font-bold text-brand-charcoal hover:text-primary-orange leading-relaxed mt-0.5 flex flex-col gap-1 transition-colors"
                    >
                      <span>
                        {settings.outletAddress}
                      </span>
                      <span className="text-[10px] text-primary-orange font-mono flex items-center gap-1 font-extrabold group-hover/map:underline decoration-solid">
                        Buka di Google Maps <ExternalLink className="w-3 h-3" />
                      </span>
                    </a>
                  </div>
                </div>

                {/* Opening Hours & Days Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  <div className="flex items-start gap-3 sm:gap-4">
                    <div className="p-2.5 rounded-xl bg-amber-100 text-[#ea580c] flex-shrink-0">
                      <Clock className="w-5 h-5 text-amber-600" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold font-display uppercase tracking-wider text-gray-400 font-mono">Jam Operasional</h4>
                      <p className="text-xs sm:text-sm font-bold text-brand-charcoal leading-tight mt-0.5">
                        {settings.operatingHours} <br />
                        <span className="text-[10px] font-mono text-primary-orange font-semibold">{settings.operatingHoursSub}</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 sm:gap-4">
                    <div className="p-2.5 rounded-xl bg-emerald-100 text-emerald-600 flex-shrink-0">
                      <Calendar className="w-5 h-5 animate-pulse" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold font-display uppercase tracking-wider text-gray-400 font-mono">Hari Buka</h4>
                      <p className="text-xs sm:text-sm font-bold text-brand-charcoal leading-tight mt-0.5">
                        {settings.operatingDays} <br />
                        <span className="text-[10px] font-mono text-gray-400 font-semibold">{settings.operatingDaysSub}</span>
                      </p>
                    </div>
                  </div>
                </div>

              </div>
            </div>

            {/* Social Connection buttons footer */}
            <div className="border-t border-brand-cream-dark/50 pt-5 mt-6 sm:mt-8 flex flex-col gap-3">
              <h4 className="text-[11px] font-bold tracking-wider uppercase text-gray-400 font-mono">
                Hubungi Kami di Media Sosial:
              </h4>

              <div className="flex flex-col sm:flex-row gap-3">
                {socialLinks.map((item) => {
                  const Icon = item.icon;
                  return (
                    <a
                      key={item.id}
                      href={item.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 bg-brand-cream/40 border border-brand-cream-dark hover:bg-brand-cream-dark/20 p-3 sm:p-3.5 rounded-xl flex items-center justify-between gap-2.5 transition-colors cursor-pointer group"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className={`p-1.5 rounded-lg flex-shrink-0 ${item.color}`}>
                          <Icon className="w-4.5 h-4.5" />
                        </span>
                        <div className="text-left font-sans min-w-0">
                          <p className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-gray-400 font-mono leading-none truncate">
                            {item.name}
                          </p>
                          <p className="text-xs font-bold text-brand-charcoal group-hover:text-primary-orange mt-0.5 break-all">
                            {item.handle}
                          </p>
                        </div>
                      </div>
                      <ExternalLink className="w-3.5 h-3.5 text-gray-450 opacity-0 sm:group-hover:opacity-100 sm:block hidden transition-opacity flex-shrink-0" />
                    </a>
                  );
                })}
              </div>
            </div>

          </div>

          {/* Quick Conversion order Form / Box list (Right Pane) */}
          <div className="lg:col-span-6 bg-brand-charcoal text-white rounded-3xl p-6 sm:p-10 border border-brand-charcoal-light flex flex-col justify-center items-center relative overflow-hidden">
            {/* Grid background decor */}
            <div className="absolute inset-0 bg-[radial-gradient(#2d2a27_1px,transparent_1px)] [background-size:20px_20px] opacity-35" />
            
            {/* Large Glowing orange orb */}
            <div className="absolute bottom-[-20%] right-[-10%] w-[250px] h-[250px] bg-primary-orange/20 rounded-full blur-[70px]" />

            <div className="relative text-center max-w-sm flex flex-col items-center">
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
                className="w-full bg-primary-orange hover:bg-primary-orange-dark text-white font-extrabold text-base py-4 px-8 rounded-2xl shadow-xl hover:shadow-orange-500/10 transition-all duration-300 transform hover:-translate-y-0.5 cursor-pointer flex items-center justify-center gap-3 select-none"
              >
                <span>Pesan Take Away Lewat WA</span>
                <span>&rarr;</span>
              </button>

              <p className="text-[10px] text-gray-400 font-mono font-medium mt-4">
                🔒 Tanpa komisi platform &bull; Dukung Usaha Lokal Indonesia
              </p>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
}
