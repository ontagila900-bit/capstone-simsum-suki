/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ShieldCheck, Sparkles, Award, HeartHandshake, PackageOpen, Flame, ShoppingBag, Clock } from 'lucide-react';
import { motion } from 'motion/react';

export default function WhyChooseUs() {
  const highlights = [
    {
      id: 'h-1',
      icon: Clock,
      title: 'Fresh Setiap Hari',
      desc: 'Dimsum dikukus hangat seketika saat order tiba. Menjaga rasa manis daging ayam alami serta kelembutan kulit terbaik.',
    },
    {
      id: 'h-2',
      icon: HeartHandshake,
      title: 'Homemade Quality',
      desc: 'Adonan digiling manual dan diracik higienis murni di dapur lokal kami sendiri, jaminan keaslian cita rasa keluarga.',
    },
    {
      id: 'h-3',
      icon: Award,
      title: 'Premium Ingredients',
      desc: 'Hanya menggunakan fillet paha dada ayam segar berprotein tinggi bebas pengawet atau pewarna kimiawi berbahaya.',
    },
    {
      id: 'h-4',
      icon: ShieldCheck,
      title: '100% Halal Terjamin',
      desc: 'Seluruh rantai pasok bahan makanan kami bersih, tanpa produk non-halal. Aman dikonsumsi siapa saja.',
    },
    {
      id: 'h-5',
      icon: Sparkles,
      title: 'Topping Melimpah',
      desc: 'Taburan porsi nori krispi, serpihan smoked beef gurih, saus kental melimpah ruah di setiap butirnya.',
    },
    {
      id: 'h-6',
      icon: PackageOpen,
      title: 'Packaging Aman',
      desc: 'Menggunakan food-grade box berkualitas tinggi tahan panas kukus, menjaga makanan tetap aman dan kedap udara.',
    },
  ];

  return (
    <section className="py-20 bg-brand-cream/30 border-y border-brand-cream-dark/50 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs font-bold text-primary-orange uppercase tracking-widest font-mono mb-2 block">Kelebihan Kami</span>
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-brand-charcoal mb-4">
            Mengapa Memilih Kami?
          </h2>
          <p className="font-sans text-base text-brand-charcoal/70 leading-relaxed font-medium">
            Sejak tahun 2021, kami mendedikasikan waktu terbaik untuk melahirkan hidangan gurih, higienis, dan terjangkau yang dicintai para foodies tanah air.
          </p>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {highlights.map((item, idx) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, scale: 0.97 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.05, duration: 0.4 }}
                className="bg-white p-7 rounded-3xl border border-brand-cream shadow-sm hover:shadow-md hover:border-brand-cream-dark transition-all duration-300"
              >
                {/* Micro branding icon container */}
                <div className="bg-primary-orange/10 p-3 rounded-2xl w-fit text-primary-orange mb-5">
                  <Icon className="w-6 h-6 text-primary-orange" />
                </div>

                <h3 className="font-display font-bold text-base sm:text-lg text-brand-charcoal mb-3">
                  {item.title}
                </h3>
                
                <p className="font-sans text-xs sm:text-sm text-brand-charcoal/65 leading-relaxed font-normal">
                  {item.desc}
                </p>
              </motion.div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
