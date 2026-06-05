/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ArrowRight, Star, Clock, Heart, Award, Utensils } from 'lucide-react';
import { motion } from 'motion/react';

interface HeroProps {
  onLihatMenuClick: () => void;
  onPesanWhatsAppClick: () => void;
}

export default function Hero({ onLihatMenuClick, onPesanWhatsAppClick }: HeroProps) {
  return (
    <section
      id="home"
      className="relative min-h-[92vh] flex items-center justify-center pt-24 pb-16 overflow-hidden bg-gradient-to-b from-brand-cream to-brand-cream-light"
    >
      {/* Decorative Warm Backlighting Spheres (Aesthetic & App-specific) */}
      <div className="absolute top-[10%] right-[-10%] w-[350px] sm:w-[500px] h-[350px] sm:h-[500px] bg-gradient-to-tr from-primary-orange/20 to-amber-200/20 rounded-full blur-[80px] -z-10" />
      <div className="absolute bottom-[-10%] left-[-15%] w-[300px] sm:w-[450px] h-[300px] sm:h-[450px] bg-gradient-to-br from-amber-200/15 to-primary-orange/15 rounded-full blur-[60px] -z-10" />

      {/* Grid Pattern Accents */}
      <div className="absolute inset-0 bg-[radial-gradient(#ecc6c1_1px,transparent_1px)] [background-size:16px_16px] opacity-25 -z-20" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Text Content (Left pane) */}
          <div className="lg:col-span-7 flex flex-col justify-center text-center lg:text-left">
            
            {/* Meta Tags / Badges */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 mb-6">
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="bg-primary-orange/10 border border-primary-orange/20 px-3.5 py-1.5 rounded-full text-xs font-bold text-primary-orange tracking-wide uppercase inline-flex items-center gap-1.5"
              >
                <Award className="w-4 h-4 text-primary-orange-dark" />
                <span>ESTABLISHED 2021</span>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="bg-brand-charcoal/5 border border-brand-charcoal/10 px-3.5 py-1.5 rounded-full text-xs font-bold text-brand-charcoal tracking-wide flex items-center gap-1.5"
              >
                <Clock className="w-4 h-4 text-amber-600" />
                <span>Sering SOLD OUT dlm beberapa jam!</span>
              </motion.div>
            </div>

            {/* Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.15 }}
              className="font-display text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-brand-charcoal leading-[1.05] mb-5"
            >
              Dimsum Homemade <br className="hidden sm:inline" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-orange to-red-500 relative">
                Premium
              </span>{' '}
              Favorit Semua Kalangan
            </motion.h1>

            {/* Subheadline description */}
            <motion.p
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.25 }}
              className="font-sans text-base sm:text-lg text-brand-charcoal/75 font-medium leading-relaxed max-w-xl mx-auto lg:mx-0 mb-8"
            >
              Nikmati kehangatan dimsum kukus-goreng premium dan suki tomyum segar yang diolah fresh secara homemade setiap hari. Cukup pesan praktis via WhatsApp dan ambil langsung pesanan Anda hangat-hangat di kedai kami!
            </motion.p>

            {/* CTA Buttons with high conversion layout */}
            <motion.div
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.35 }}
              className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 mb-10"
            >
              <button
                onClick={onPesanWhatsAppClick}
                className="w-full sm:w-auto bg-primary-orange hover:bg-primary-orange-dark text-white font-bold px-8 py-4 rounded-2xl flex items-center justify-center gap-3 shadow-lg hover:shadow-orange-500/20 transition-all duration-300 transform hover:-translate-y-0.5 cursor-pointer text-base"
              >
                <span>Pesan via WA</span>
                <ArrowRight className="w-5 h-5" />
              </button>

              <button
                onClick={onLihatMenuClick}
                className="w-full sm:w-auto bg-white border border-brand-cream-dark/80 hover:bg-brand-cream-dark/20 text-brand-charcoal font-bold px-8 py-4 rounded-2xl flex items-center justify-center gap-2 shadow-sm transition-all duration-300 transform hover:-translate-y-0.5 cursor-pointer text-base"
              >
                <Utensils className="w-5 h-5 text-gray-500" />
                <span>Lihat Menu Lengkap</span>
              </button>
            </motion.div>

            {/* Trust Info Stats */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.45 }}
              className="grid grid-cols-3 divide-x divide-brand-cream-dark/70 border-t border-brand-cream-dark/60 pt-6 max-w-sm sm:max-w-md mx-auto lg:mx-0"
            >
              <div className="pr-4 text-center lg:text-left">
                <div className="font-display text-2xl sm:text-3xl font-bold text-brand-charcoal text-transparent bg-clip-text bg-gradient-to-r from-brand-charcoal to-brand-charcoal-light">
                  100%
                </div>
                <div className="text-[10px] sm:text-xs font-semibold text-brand-charcoal/60 tracking-wider uppercase mt-1">
                  Halal & Higienis
                </div>
              </div>
              <div className="px-4 text-center">
                <div className="font-display text-2xl sm:text-3xl font-bold text-brand-charcoal text-transparent bg-clip-text bg-gradient-to-r from-brand-charcoal to-brand-charcoal-light">
                  25+
                </div>
                <div className="text-[10px] sm:text-xs font-semibold text-brand-charcoal/60 tracking-wider uppercase mt-1">
                  Pilihan Varian
                </div>
              </div>
              <div className="pl-4 text-center lg:text-right">
                <div className="flex items-center justify-center lg:justify-end gap-1 font-display text-2xl sm:text-3xl font-bold text-brand-charcoal text-transparent bg-clip-text bg-gradient-to-r from-brand-charcoal to-brand-charcoal-light">
                  4.9 <Star className="w-5 h-5 text-amber-500 fill-amber-500 inline -mt-1" />
                </div>
                <div className="text-[10px] sm:text-xs font-semibold text-brand-charcoal/60 tracking-wider uppercase mt-1">
                  Rating G-Maps
                </div>
              </div>
            </motion.div>

          </div>

          {/* Visual Showcase (Right pane with stunning dimsum image) */}
          <div className="lg:col-span-5 relative flex justify-center items-center w-full max-w-[440px] aspect-square mx-auto px-4">
            
            {/* Interactive floating badges inside visual showcase */}
            <motion.div
              initial={{ scale: 0, rotate: -20 }}
              animate={{ scale: 1, rotate: -6 }}
              transition={{ type: 'spring', delay: 0.6, duration: 0.6 }}
              className="absolute top-2 left-2 bg-white p-3.5 sm:p-4 rounded-2xl shadow-xl z-20 flex items-center gap-2.5 border border-brand-cream-dark/30 select-none max-w-[140px] sm:max-w-[180px]"
            >
              <div className="bg-amber-100 p-1.5 rounded-xl text-amber-600 flex-shrink-0">
                <Heart className="w-4 h-4 sm:w-5 sm:h-5 fill-amber-500 text-amber-500" />
              </div>
              <p className="text-[10px] sm:text-xs font-bold leading-tight text-brand-charcoal">
                Dibuat <span className="text-primary-orange-dark">Fresh</span> Setiap Hari
              </p>
            </motion.div>

            <motion.div
              initial={{ scale: 0, rotate: 20 }}
              animate={{ scale: 1, rotate: 8 }}
              transition={{ type: 'spring', delay: 0.7, duration: 0.6 }}
              className="absolute bottom-2 right-2 bg-brand-charcoal text-white p-3.5 sm:p-4 rounded-2xl shadow-xl z-20 flex items-center gap-2.5 border border-brand-charcoal-light select-none max-w-[140px] sm:max-w-[180px]"
            >
              <div className="bg-primary-orange p-1.5 rounded-xl text-white flex-shrink-0">
                <Star className="w-4 h-4 sm:w-5 sm:h-5 fill-white text-white" />
              </div>
              <p className="text-[10px] sm:text-xs font-bold leading-tight text-brand-cream">
                Praktis Pesan <span className="text-primary-orange-dark">Take Away</span>
              </p>
            </motion.div>

            {/* Main Picture Frame */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.75, delay: 0.3 }}
              className="w-full h-full rounded-full border-4 border-white shadow-2xl overflow-hidden bg-brand-cream-dark aspect-square"
            >
              {/* Premium Dimsum Photography under warm lighting */}
              <img
                src="/src/assets/images/premium_dimsum_showcase_1780647201076.png"
                alt="Premium Dimsum Bamboo Steamer Yusuki"
                className="w-full h-full object-cover select-none scale-105 hover:scale-110 transition-transform duration-700 ease-out"
                referrerPolicy="no-referrer"
              />

              {/* Dim Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent pointer-events-none" />
            </motion.div>

            {/* Glowing Accent Ring wrapper */}
            <div className="absolute inset-0 rounded-full border border-dashed border-primary-orange/45 scale-105 animate-[spin_52s_linear_infinite] -z-10" />
            <div className="absolute inset-2 rounded-full border border-solid border-amber-200/50 scale-105 -z-10" />
          </div>

        </div>
      </div>
    </section>
  );
}
