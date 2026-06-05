/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { 
  ShieldCheck, 
  Sparkles, 
  Award, 
  HeartHandshake, 
  PackageOpen, 
  Clock, 
  PiggyBank, 
  Receipt, 
  Settings2, 
  Heart,
  MessageCircle
} from 'lucide-react';
import { motion } from 'motion/react';

export default function WhyChooseUs() {
  const qualityList = [
    {
      icon: Clock,
      title: 'Fresh Setiap Hari',
      desc: 'Dimsum dikukus hangat seketika saat order tiba demi menjaga rasa manis daging ayam alami.',
    },
    {
      icon: HeartHandshake,
      title: 'Homemade Quality',
      desc: 'Adonan digiling manual dan diracik terjamin higienis murni di dapur lokal keluarga kami.',
    },
    {
      icon: Award,
      title: 'Bahan Premium',
      desc: 'Hanya menggunakan fillet dada paha segar pilihan tanpa bahan pengawet.',
    },
    {
      icon: ShieldCheck,
      title: 'Halal Terjamin',
      desc: 'Seluruh bahan baku yang kami pilih bersih dan 100% halal untuk dikonsumsi keluarga.',
    },
    {
      icon: Sparkles,
      title: 'Topping Melimpah',
      desc: 'Taburan nori krispi, smoked beef gurih, dan saus melimpah di setiap butirnya.',
    },
    {
      icon: PackageOpen,
      title: 'Packaging Aman',
      desc: 'Food-grade box berkualitas tinggi tahan panas guna menjaga cita rasa tetap hangat.',
    },
  ];

  const orderBenefits = [
    {
      icon: PiggyBank,
      title: 'Harga Lebih Hemat',
      desc: 'Nikmati harga menu asli dari dapur kami langsung tanpa ada penggelembungan biaya.',
    },
    {
      icon: Receipt,
      title: 'Tanpa Biaya Aplikasi',
      desc: 'Bebas potongan komisi platform online (ojol) 20%-25% dan biaya administrasi tambahan.',
    },
    {
      icon: Settings2,
      title: 'Bisa Custom Order',
      desc: 'Tinggal chat via tombol WhatsApp di pojok kanan jika ingin request piring hantaran, porsi, atau level pedas.',
    },
    {
      icon: Heart,
      title: 'Respon Admin Cepat',
      desc: 'Diproses langsung secara kekeluargaan oleh admin kami yang ramah dan sigap.',
    },
    {
      icon: Clock,
      title: 'Fleksibilitas Ambil (Take Away)',
      desc: 'Tentukan jam pengambilan kesukaan Anda agar dimsum siap hangat tepat waktu pas Anda datang.',
    },
  ];

  return (
    <section id="why-whatsapp" className="py-12 bg-white relative border-y border-zinc-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Unified Minimal Header */}
        <div className="text-center max-w-xl mx-auto mb-10">
          <span className="text-[10px] font-bold text-primary-orange uppercase tracking-widest font-mono mb-1 block">Info Tambahan</span>
          <h2 className="font-display text-xl sm:text-2xl font-bold text-brand-charcoal mb-2">
            Kualitas & Cara Pemesanan Terbaik
          </h2>
          <p className="font-sans text-xs text-brand-charcoal/70 leading-relaxed font-normal">
            Kami mendedikasikan bahan terbaik untuk Anda dengan kepraktisan WhatsApp order tanpa potongan komisi aplikasi.
          </p>
        </div>

        {/* 2-Column Consolidated Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          
          {/* COLUMN 1: KEUNGGULAN PRODUK */}
          <div className="bg-brand-cream/15 p-5 sm:p-6 rounded-2xl border border-brand-cream/50">
            <div className="flex items-center gap-2 mb-5 pb-3 border-b border-brand-cream/35">
              <span className="bg-rose-100 text-rose-600 p-1.5 rounded-lg text-xs leading-none">✨</span>
              <h3 className="font-display font-bold text-sm sm:text-base text-brand-charcoal">
                Kenapa Suki Yusuki Begitu Lezat?
              </h3>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {qualityList.map((item, idx) => {
                const Icon = item.icon;
                return (
                  <div key={`quality-${idx}`} className="flex gap-2.5 items-start">
                    <div className="bg-white p-1.5 rounded-lg border border-brand-cream/60 flex-shrink-0 text-primary-orange">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-sans font-bold text-xs text-brand-charcoal mb-0.5">
                        {item.title}
                      </h4>
                      <p className="font-sans text-[10.5px] text-brand-charcoal/70 leading-relaxed font-normal">
                        {item.desc}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* COLUMN 2: CARA ORDER INSTAN WA */}
          <div className="bg-emerald-50/20 p-5 sm:p-6 rounded-2xl border border-emerald-100/50">
            <div className="flex items-center gap-2 mb-5 pb-3 border-b border-emerald-100/35">
              <span className="bg-emerald-100 text-emerald-600 p-1.5 rounded-lg text-xs leading-none">🎯</span>
              <h3 className="font-display font-bold text-sm sm:text-base text-brand-charcoal">
                Keuntungan Pesan Langsung via WhatsApp
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              {orderBenefits.map((item, idx) => {
                const Icon = item.icon;
                return (
                  <div key={`benefit-${idx}`} className="flex gap-2.5 items-start">
                    <div className="bg-white p-1.5 rounded-lg border border-emerald-100/50 flex-shrink-0 text-emerald-600">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-sans font-bold text-xs text-brand-charcoal mb-0.5">
                        {item.title}
                      </h4>
                      <p className="font-sans text-[10.5px] text-brand-charcoal/70 leading-relaxed font-normal">
                        {item.desc}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="bg-white p-2.5 rounded-xl border border-emerald-100 flex items-center gap-2.5 mt-2 shadow-sm">
              <div className="p-1 px-2 rounded bg-emerald-100 text-emerald-700 font-mono text-[9px] font-bold">INFO</div>
              <p className="font-sans text-[10px] text-zinc-600 leading-normal font-medium">
                Suka request custom porsi / rasa? Silakan chat langsung dengan klik widget WhatsApp di kanan bawah screen!
              </p>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}

