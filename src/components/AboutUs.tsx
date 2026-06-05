/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BookOpen, Award, Sparkles, CheckCircle2 } from 'lucide-react';
import { motion } from 'motion/react';

export default function AboutUs() {
  return (
    <section id="tentang" className="py-20 bg-brand-cream/35 relative overflow-hidden scroll-mt-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          
          {/* Story Visual Frame (Left pane with aesthetic vintage look) */}
          <div className="lg:col-span-5 relative w-full max-w-[360px] aspect-square mx-auto flex items-center justify-center">
            
            {/* Background solid decoration card */}
            <div className="absolute top-2 left-2 w-[92%] h-[92%] bg-primary-orange rounded-3xl -z-10 shadow-lg" />

            {/* Main Picture */}
            <div className="absolute bottom-2 right-2 w-[92%] h-[92%] rounded-3xl overflow-hidden shadow-2xl border-4 border-white bg-brand-cream-dark">
              <img
                src="https://images.unsplash.com/photo-1496116211227-167cca77dedf?auto=format&fit=crop&w=600&q=80"
                alt="Proses Pembuatan Dimsum Yusuki Sejak 2021"
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-500 ease-out"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent pointer-events-none" />
              
              {/* Badge Overlay */}
              <div className="absolute bottom-3 left-3 right-3 bg-white/95 backdrop-blur-xs rounded-xl p-2.5 shadow-xl">
                <p className="text-[9px] font-bold text-primary-orange uppercase tracking-widest font-mono">
                  Dapur Fisik Yusuki
                </p>
                <p className="text-[11px] font-bold text-brand-charcoal leading-tight mt-0.5">
                  Berawal dari Pre-Order teras rumahan.
                </p>
              </div>
            </div>

            {/* Micro details ring */}
            <div className="absolute inset-3 border-2 border-white/20 rounded-full scale-110 pointer-events-none" />
          </div>

          {/* Story Text Frame (Right pane with warm narrative) */}
          <div className="lg:col-span-7 flex flex-col justify-center text-center lg:text-left">
            
            <div className="inline-flex items-center gap-1.5 bg-primary-orange/10 px-3.5 py-1 rounded-full text-xs font-bold text-primary-orange uppercase tracking-wider mb-4 w-fit mx-auto lg:mx-0">
              <BookOpen className="w-4 h-4" />
              <span>Kisah Inspirasi Bisnis</span>
            </div>

            <h2 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-brand-charcoal mb-6">
              Perjalanan Suki Yusuki
            </h2>

            <div className="space-y-4 font-sans text-sm sm:text-base text-brand-charcoal/75 leading-relaxed font-medium">
              <p>
                Perjalanan kami dimulai penuh kesederhanaan pada awal tahun <strong className="text-brand-charcoal">2021</strong>. Terinspirasi dari bahasa Jepang <strong className="text-primary-orange">"Suki"</strong> yang memiliki arti ganda: singkatan dari seruan hangat <em className="not-italic font-bold">"Yuk Suki"</em> dan kata <em className="not-italic font-bold">"Suka"</em>, kami berharap siapapun yang mencicipi kreasi kami akan langsung jatuh cinta pada gigitan pertama.
              </p>
              <p>
                Usaha ini diawali oleh dorongan kuat setelah Owner memutuskan untuk <strong className="text-brand-charcoal-light">resign dari hiruk-pikuk pekerjaan kantoran</strong>. Dengan modal kemauan keras serta kecintaan mendalam pada jajanan dimsum yang hangat dan lembut, owner mulai menjual porsi terbatas murni dengan sistem <strong className="text-brand-charcoal">pre-order dari dapur rumah</strong> setiap Sabtu dan Minggu saja.
              </p>
              <p>
                Berkat dukungan dan viralnya cita rasa kami dari mulut ke mulut pelanggan terdekat, antrean pesanan pre-order kian membludak. Hal ini meyakinkan kami untuk bertransformasi mendatangkan <strong className="text-primary-orange">outlet fisik permanen milik kami sendiri</strong> dengan dibantu oleh tim kecil yang solid.
              </p>
            </div>

            {/* List Achievements bullet points */}
            <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-brand-cream-dark/50 pt-6">
              <div className="flex items-start gap-2.5 text-left">
                <CheckCircle2 className="w-5 h-5 text-primary-orange flex-shrink-0 mt-0.5" />
                <p className="text-xs sm:text-sm font-semibold text-brand-charcoal/80">
                  <strong className="block text-brand-charcoal">100% Homemade Recipe</strong>
                  Diracik mulus dari bumbu dan bahan ayam segar buatan sendiri.
                </p>
              </div>

              <div className="flex items-start gap-2.5 text-left">
                <CheckCircle2 className="w-5 h-5 text-primary-orange flex-shrink-0 mt-0.5" />
                <p className="text-xs sm:text-sm font-semibold text-brand-charcoal/80">
                  <strong className="block text-brand-charcoal">Dukung Ekonomi Menengah</strong>
                  Melibatkan pemuda, UMKM, dan ekosistem lokal berkembang bersama.
                </p>
              </div>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
}
