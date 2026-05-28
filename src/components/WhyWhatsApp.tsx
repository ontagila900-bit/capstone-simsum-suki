/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { PiggyBank, Receipt, Settings2, ShieldCheck, Heart, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';

export default function WhyWhatsApp() {
  const points = [
    {
      id: 'p-1',
      icon: PiggyBank,
      title: 'Harga Lebih Hemat',
      desc: 'Dapatkan harga asli murni produk langsung dari dapur kami tanpa markup/kenaikan tersembunyi.',
      color: 'bg-emerald-100 text-emerald-500',
    },
    {
      id: 'p-2',
      icon: Receipt,
      title: 'Tanpa Biaya Aplikasi',
      desc: 'Bebas dari potongan komisi platform online delivery (ojol) yang berkisar 20% - 25% + admin fee.',
      color: 'bg-primary-orange/10 text-primary-orange',
    },
    {
      id: 'p-3',
      icon: Settings2,
      title: 'Bisa Custom Order',
      desc: 'Bisa bebas custom porsi (misal, campur rasa isi 4, minta chili-oil ekstra, atau pesan frozen).',
      color: 'bg-amber-100 text-amber-600',
    },
    {
      id: 'p-4',
      icon: Heart,
      title: 'Fast Response Admin',
      desc: 'Dikelola oleh tim admin kami sendiri yang ramah, komunikatif, dan siap memproses instan.',
      color: 'bg-rose-100 text-rose-500',
    },
    {
      id: 'p-5',
      icon: Sparkles,
      title: 'Fleksibilitas Tinggi',
      desc: 'Atur waktu pengambilan pesanan Take Away agar disiapkan hangat-hangat tepat saat Anda tiba di toko.',
      color: 'bg-violet-100 text-violet-500',
    },
  ];

  return (
    <section id="why-whatsapp" className="py-20 bg-white relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Layout Split */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Informative description paragraph with modern design styling */}
          <div className="lg:col-span-5 flex flex-col justify-center text-center lg:text-left">
            <span className="text-xs font-bold text-primary-orange uppercase tracking-widest font-mono mb-2">Bebas Pajak Aplikasi</span>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-brand-charcoal mb-4">
              Pesan Lebih Bersahabat via WhatsApp
            </h2>
            <p className="font-sans text-base text-brand-charcoal/70 leading-relaxed font-medium mb-6">
              Melalui WhatsApp, Anda memesan langsung dengan harga menu asli dapur kami untuk diambil sendiri di toko (Take Away). Bebas tambahan markup platform online.
            </p>
            <p className="font-sans text-xs text-primary-orange font-bold bg-brand-cream border border-brand-cream-dark/65 py-3 px-5 rounded-2xl">
              🎯 Dengan bertransaksi langsung via WhatsApp, Anda turut mendukung kelangsungan UMKM Kuliner lokal Indonesia agar dapat menyajikan kualitas bahan makanan terbaik tanpa kompromi!
            </p>
          </div>

          {/* Points list item layout (Bento card lists style) */}
          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-5">
            {points.map((pt, idx) => {
              const Icon = pt.icon;
              return (
                <motion.div
                  key={pt.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.08, duration: 0.4 }}
                  className="bg-brand-cream/30 p-6 rounded-2xl border border-brand-cream hover:border-brand-cream-dark transition-all duration-200"
                >
                  <div className={`p-2.5 rounded-xl w-fit ${pt.color} mb-4 shadow-sm`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="font-display font-bold text-sm sm:text-base text-brand-charcoal mb-2">
                    {pt.title}
                  </h3>
                  <p className="font-sans text-xs sm:text-sm text-brand-charcoal/65 leading-relaxed font-normal">
                    {pt.desc}
                  </p>
                </motion.div>
              );
            })}
          </div>

        </div>

      </div>
    </section>
  );
}
