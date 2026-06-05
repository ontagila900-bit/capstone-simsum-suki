/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { MapPin, Clock, Calendar, Globe, Share2, Flame } from 'lucide-react';
import { AppSettings } from '../types';

interface TestimonialsProps {
  appSettings?: AppSettings;
}

const DEFAULT_SETTINGS: AppSettings = {
  outletAddress: 'Kuliner Malam, Jl. Ps. Pon Utara Jl. Jend. Sudirman, Bantarsoka, Kec. Purwokerto Bar., Kabupaten Banyumas, Jawa Tengah 53133',
  outletGmaps: 'https://maps.app.goo.gl/FtGnmFTyo2AB8X8AA',
  operatingHours: '16.30 WIB - Selesai',
  operatingHoursSub: '(Biasa sold out jam 21.00!)',
  operatingDays: 'Buka Setiap Hari',
  operatingDaysSub: '(Senin s/d Minggu)',
  whatsappNumber: '6281818758265',
};

export default function Testimonials({ appSettings }: TestimonialsProps) {
  const settings = { ...DEFAULT_SETTINGS, ...appSettings };
  const GOOGLE_MAPS_LINK = settings.outletGmaps || 'https://maps.app.goo.gl/FtGnmFTyo2AB8X8AA';

  return (
    <section className="py-20 bg-white relative overflow-hidden" id="testimonials-section">
      {/* Background Decorative Blur Orbs */}
      <div className="absolute top-[20%] left-[-15%] w-[450px] h-[450px] bg-primary-orange/5 rounded-full blur-[90px] pointer-events-none" />
      <div className="absolute bottom-[10%] right-[-10%] w-[400px] h-[400px] bg-amber-500/5 rounded-full blur-[80px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="inline-flex items-center gap-1.5 bg-amber-50 text-amber-800 px-3.5 py-1 rounded-full text-xs font-black tracking-wider border border-amber-200/80 uppercase mb-3">
            <MapPin className="w-3.5 h-3.5 text-primary-orange animate-pulse" /> Informasi Outlet Kami
          </span>
          <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-brand-charcoal mb-4 tracking-tight">
            Lokasi Gerai & Jam Operasional
          </h2>
          <p className="font-sans text-base text-brand-charcoal/70 leading-relaxed font-semibold">
            Silakan merapat langsung ke gerai fisik kami untuk menikmati dimsum kental berkuah dan suki tomyam segar yang disajikan hangat.
          </p>
        </div>

        {/* Big Grid Panel Integration */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          
          {/* LEFT: Complete Info Card (Address, Hours, Operating Days) */}
          <div className="lg:col-span-6 flex flex-col justify-between bg-zinc-50 border border-zinc-200/80 rounded-3xl p-6 sm:p-8 shadow-xs">
            
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1 bg-rose-50 text-rose-700 px-3 py-1 rounded-full text-[10px] font-black tracking-wider border border-rose-100 uppercase">
                  <Flame className="w-3.5 h-3.5 animate-pulse" /> Outlet Utama
                </span>
                
                <a 
                  href={GOOGLE_MAPS_LINK}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs font-bold text-blue-600 hover:text-blue-700 hover:underline flex items-center gap-1"
                >
                  Buka di Google Maps &rarr;
                </a>
              </div>

              <div className="space-y-1">
                <h3 className="font-display text-xl sm:text-2xl font-black text-brand-charcoal">
                  SukiYuSuki Bantarsoka
                </h3>
                <p className="text-xs sm:text-sm text-brand-charcoal/75 leading-relaxed font-semibold">
                  Sore hari laper ingin makan seblak suki tomyum hangat yang pedas seger atau dimsum lumer premium? Yuk mampir langsung ke gerai kami di daerah Bantarsoka, Purwokerto Barat.
                </p>
              </div>

              {/* Informational Blocks */}
              <div className="space-y-4 pt-2">
                
                {/* Address block */}
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-orange-100 text-primary-orange rounded-xl shrink-0 mt-0.5">
                    <MapPin className="w-4 h-4 text-primary-orange-dark" />
                  </div>
                  <div>
                    <h4 className="text-[10px] font-bold tracking-wider font-mono text-gray-400 uppercase">Alamat Lengkap</h4>
                    <p className="text-xs sm:text-sm font-bold text-brand-charcoal leading-relaxed mt-0.5">
                      {settings.outletAddress}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Hours Block */}
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-amber-100 text-amber-600 rounded-xl shrink-0 mt-0.5">
                      <Clock className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-[10px] font-bold tracking-wider font-mono text-gray-400 uppercase">Jam Pelayanan</h4>
                      <p className="text-xs sm:text-sm font-bold text-brand-charcoal leading-tight mt-0.5">
                        {settings.operatingHours}
                      </p>
                      <p className="text-[10px] font-semibold text-primary-orange font-mono mt-0.5">
                        {settings.operatingHoursSub}
                      </p>
                    </div>
                  </div>

                  {/* Days Block */}
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-emerald-100 text-emerald-600 rounded-xl shrink-0 mt-0.5">
                      <Calendar className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-[10px] font-bold tracking-wider font-mono text-gray-400 uppercase">Hari Buka</h4>
                      <p className="text-xs sm:text-sm font-bold text-brand-charcoal leading-tight mt-0.5">
                        {settings.operatingDays}
                      </p>
                      <p className="text-[10px] font-semibold text-gray-450 font-mono mt-0.5">
                        {settings.operatingDaysSub}
                      </p>
                    </div>
                  </div>
                </div>

              </div>
            </div>

            {/* Quick action triggers */}
            <div className="flex flex-wrap gap-2 pt-6 border-t border-zinc-200/60 mt-6">
              <a
                href={GOOGLE_MAPS_LINK}
                target="_blank"
                rel="noreferrer"
                className="flex-1 min-w-[140px] inline-flex items-center justify-center gap-1.5 bg-zinc-900 hover:bg-zinc-800 text-white rounded-2xl px-4 py-3.5 text-xs font-bold transition-all hover:scale-102 cursor-pointer shadow-3xs"
              >
                <Globe className="w-4 h-4" />
                Rute Navigasi G-Maps
              </a>

              <a
                href={`https://wa.me/${settings.whatsappNumber}?text=Halo%2520kak%2520Suki%2520Yusuki%252C%2520saya%2520ingin%2520pesan%2520di%2520outlet`}
                target="_blank"
                rel="noreferrer"
                className="flex-grow inline-flex items-center justify-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl px-4 py-3.5 text-xs font-bold transition-all hover:scale-102 cursor-pointer shadow-3xs"
              >
                <Share2 className="w-4 h-4" />
                Pesan Cepat via WhatsApp
              </a>
            </div>

          </div>

          {/* RIGHT: Embedded Live Map */}
          <div className="lg:col-span-6 bg-zinc-100 rounded-3xl border border-zinc-200 overflow-hidden relative min-h-[350px] shadow-sm flex flex-col">
            <iframe 
              src="https://maps.google.com/maps?q=SukiYuSuki%20Bantarsoka%20Purwokerto&t=&z=16&ie=UTF8&iwloc=&output=embed" 
              className="absolute inset-0 w-full h-full border-0"
              allowFullScreen={true}
              loading="lazy" 
              referrerPolicy="no-referrer"
              title="Peta Lokasi SukiYuSuki"
            />
          </div>

        </div>

      </div>
    </section>
  );
}
