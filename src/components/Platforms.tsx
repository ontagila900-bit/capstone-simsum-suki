/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ShoppingBag, ChevronRight, Check } from 'lucide-react';
import { motion } from 'motion/react';

export default function Platforms() {
  return (
    <section className="py-12 bg-zinc-50 border-y border-zinc-200/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          
          {/* Header */}
          <div className="text-center md:text-left">
            <h3 className="font-display font-medium text-xs text-slate-400 uppercase tracking-widest font-mono mb-1">Social Proof Merchant Check</h3>
            <p className="font-sans font-bold text-sm sm:text-base text-brand-charcoal">
              Tersedia juga di platform online food delivery resmi kami
            </p>
          </div>

          {/* Platforms Grid */}
          <div className="flex flex-wrap justify-center items-center gap-6 sm:gap-10">
            {/* ShopeeFood Label */}
            <div className="flex items-center gap-2 bg-white px-4 py-2.5 rounded-2xl border border-zinc-100 shadow-sm">
              {/* Custom styled Shopee indicator */}
              <div className="w-6 h-6 rounded-lg bg-[#ee4d2d] flex items-center justify-center text-white font-extrabold text-[10px] tracking-tighter">
                S
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-black text-brand-charcoal leading-none">ShopeeFood</span>
                <span className="text-[9px] font-semibold text-amber-500 font-mono">Yusuki Official ★4.9</span>
              </div>
            </div>

            {/* GoFood Label */}
            <div className="flex items-center gap-2 bg-white px-4 py-2.5 rounded-2xl border border-zinc-100 shadow-sm">
              {/* Custom GoFood styled icon logo */}
              <div className="w-6 h-6 rounded-lg bg-[#e02424] flex items-center justify-center text-white font-black text-xs">
                g
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-black text-brand-charcoal leading-none">GoFood</span>
                <span className="text-[9px] font-semibold text-[#10b981] font-mono">Super Partner ★4.8</span>
              </div>
            </div>
          </div>

          {/* Highlight Callout */}
          <div className="bg-primary-orange/5 border border-primary-orange/15 rounded-2xl px-5 py-3 text-center md:text-right max-w-sm">
            <p className="text-[11px] font-bold text-primary-orange-dark uppercase tracking-wider font-mono mb-0.5">Pilih Cara Pemesanan Anda</p>
            <p className="text-xs text-brand-charcoal/80 font-semibold leading-relaxed">
              Ambil langsung (Take Away) via WA harga asli dapur, atau pesan Delivery lewat ShopeeFood/GoFood!
            </p>
          </div>

        </div>

      </div>
    </section>
  );
}
