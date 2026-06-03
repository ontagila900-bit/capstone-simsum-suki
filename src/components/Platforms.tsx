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
            <div className="flex items-center gap-2.5 bg-white px-4 py-2.5 rounded-2xl border border-zinc-100 shadow-sm hover:shadow-md transition-shadow duration-200">
              {/* Premium ShopeeFood SVG Logo */}
              <svg viewBox="0 0 100 100" className="w-7 h-7 flex-shrink-0" xmlns="http://www.w3.org/2000/svg">
                <rect width="100" height="100" rx="26" fill="#EE4D2D" />
                {/* Shopping Bag handle */}
                <path d="M35,38 C35,23 65,23 65,38" stroke="white" strokeWidth="6" strokeLinecap="round" fill="none" />
                {/* Shopping Bag body */}
                <path d="M26,38 L74,38 C76,38 77,39.5 76.5,41.5 L69.5,78 C68.8,81 66,83 63,83 L37,83 C34,83 31.2,81 30.5,78 L23.5,41.5 C23,39.5 24,38 26,38 Z" fill="white" />
                {/* Stylized 'S' in orange inside the bag */}
                <path d="M54,49 C50,49 48,51 48,53.5 C48,57.5 56.5,56.5 56.5,60.5 C56.5,63 54,65 51,65 C48,65 46,63 45.2,60.5" stroke="#EE4D2D" strokeWidth="5.5" strokeLinecap="round" fill="none" />
              </svg>
              <div className="flex flex-col">
                <span className="text-xs font-black text-brand-charcoal leading-none">ShopeeFood</span>
                <span className="text-[9px] font-semibold text-amber-500 font-mono">Yusuki Official ★4.9</span>
              </div>
            </div>

            {/* GoFood Label */}
            <div className="flex items-center gap-2.5 bg-white px-4 py-2.5 rounded-2xl border border-zinc-100 shadow-sm hover:shadow-md transition-shadow duration-200">
              {/* Premium GoFood SVG Logo */}
              <svg viewBox="0 0 100 100" className="w-7 h-7 flex-shrink-0" xmlns="http://www.w3.org/2000/svg">
                <rect width="100" height="100" rx="26" fill="#EE2737" />
                {/* Solv ring styled like Gojek/GoFood logo */}
                <circle cx="50" cy="50" r="26" stroke="white" strokeWidth="12" strokeLinecap="round" strokeDasharray="123 40" fill="none" transform="rotate(-125 50 50)" />
                <circle cx="50" cy="50" r="10" fill="white" />
              </svg>
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
