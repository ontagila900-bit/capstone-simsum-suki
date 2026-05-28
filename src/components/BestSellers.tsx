/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { Star, MessageCircle, Plus, Minus, Check } from 'lucide-react';
import { motion } from 'motion/react';
import { MenuItem } from '../types';
import { MENU_ITEMS } from '../data/menu';

interface BestSellersProps {
  onAddToCart: (item: MenuItem, qty: number) => void;
}

export default function BestSellers({ onAddToCart }: BestSellersProps) {
  const bestSellers = MENU_ITEMS.filter((item) => item.isBestSeller);
  
  // Local quantity state for each items
  const [quantities, setQuantities] = useState<Record<string, number>>({
    'b-mentai': 1,
    'b-carbonara': 1,
    'b-tartar': 1,
    'b-mix-goreng': 1,
  });

  const [addedItem, setAddedItem] = useState<Record<string, boolean>>({});

  const handleQtyChange = (id: string, delta: number) => {
    setQuantities((prev) => {
      const current = prev[id] || 1;
      const next = Math.max(1, current + delta);
      return { ...prev, [id]: next };
    });
  };

  const triggerAddToCart = (item: MenuItem) => {
    const qty = quantities[item.id] || 1;
    onAddToCart(item, qty);
    
    // Visual check feedback
    setAddedItem((prev) => ({ ...prev, [item.id]: true }));
    setTimeout(() => {
      setAddedItem((prev) => ({ ...prev, [item.id]: false }));
    }, 2000);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  return (
    <section id="best-seller" className="py-20 bg-brand-cream-light relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="inline-flex items-center gap-1.5 bg-primary-orange/10 px-3 py-1 rounded-full text-xs font-bold text-primary-orange uppercase tracking-widest mb-3 font-mono">
            <Star className="w-4.5 h-4.5 fill-current" />
            <span>Paling Laris di Yusuki</span>
          </div>
          <h2 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-brand-charcoal mb-4">
            Menu Best Seller Kami
          </h2>
          <p className="font-sans text-base text-brand-charcoal/70 leading-relaxed font-medium">
            Empat mahakarya kuliner dimsum buatan rumah terlaris yang paling banyak dicari dan dinikmati ratusan pelanggan setia sejak pertama kali kompor menyala.
          </p>
        </div>

        {/* Product Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {bestSellers.map((item) => {
            const qty = quantities[item.id] || 1;
            const isAdded = addedItem[item.id] || false;

            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ duration: 0.5 }}
                className="bg-white rounded-3xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 border border-brand-cream border-b-4 hover:border-b-primary-orange flex flex-col group h-full relative"
                id={`best-seller-card-${item.id}`}
              >
                {/* Badge Best Seller */}
                <span className="absolute top-4 left-4 z-10 bg-primary-orange text-white text-[11px] font-bold px-3 py-1 rounded-full shadow-md flex items-center gap-1 uppercase tracking-wider font-mono">
                  <Star className="w-3.5 h-3.5 fill-current text-amber-200" />
                  <span>Best Seller</span>
                </span>

                {/* Large Product Photo */}
                <div className="relative aspect-4/3 w-full bg-brand-cream-dark overflow-hidden">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
                  
                  {/* Total pieces badge */}
                  {item.pieces && (
                    <span className="absolute bottom-3 right-3 bg-brand-charcoal/90 text-white font-semibold text-xs py-1 px-2 rounded-lg font-mono">
                      {item.pieces} Pcs
                    </span>
                  )}
                </div>

                {/* Card Content & Details */}
                <div className="p-6 flex flex-col flex-grow">
                  {/* Tags */}
                  <div className="flex flex-wrap gap-1.5 mb-2.5">
                    {item.tags?.map((tag) => (
                      <span
                        key={tag}
                        className="bg-brand-cream-dark/45 border border-brand-cream-dark text-brand-charcoal/70 text-[10px] font-bold px-2 py-0.5 rounded-md"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  {/* Title */}
                  <h3 className="font-display text-lg font-bold text-brand-charcoal mb-2 group-hover:text-primary-orange transition-colors">
                    {item.name}
                  </h3>

                  {/* Description */}
                  <p className="font-sans text-xs text-brand-charcoal/60 leading-relaxed flex-grow font-medium mb-4">
                    {item.description}
                  </p>

                  <div className="border-t border-brand-cream-dark/50 pt-4 mt-auto">
                    {/* Price and Quantity Modifier row */}
                    <div className="flex items-center justify-between gap-4 mb-4">
                      <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-gray-400 capitalize tracking-wider font-mono">Harga Porsi</span>
                        <span className="font-display text-lg font-bold text-primary-orange-dark">
                          {formatPrice(item.price)}
                        </span>
                      </div>

                      {/* Micro quantity picker counter */}
                      <div className="flex items-center bg-brand-cream/80 border border-brand-cream-dark/65 rounded-xl p-1 shadow-inner">
                        <button
                          onClick={() => handleQtyChange(item.id, -1)}
                          className="w-7 h-7 bg-white hover:bg-brand-cream-dark/20 text-brand-charcoal font-bold rounded-lg flex items-center justify-center transition-colors cursor-pointer"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="w-7 text-center text-xs font-bold text-brand-charcoal font-mono">
                          {qty}
                        </span>
                        <button
                          onClick={() => handleQtyChange(item.id, 1)}
                          className="w-7 h-7 bg-white hover:bg-brand-cream-dark/20 text-brand-charcoal font-bold rounded-lg flex items-center justify-center transition-colors cursor-pointer"
                          aria-label="Increase quantity"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Interactive conversion CTAs */}
                    <div className="flex flex-col gap-2">
                      {/* Add to batching shopping list cart */}
                      <button
                        onClick={() => triggerAddToCart(item)}
                        className={`w-full text-xs font-bold py-3.5 px-4 rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm ${
                          isAdded
                            ? 'bg-emerald-600 hover:bg-emerald-700 text-white border border-emerald-600'
                            : 'bg-primary-orange hover:bg-primary-orange-dark text-white border border-primary-orange shadow-orange-500/10'
                        }`}
                      >
                        {isAdded ? (
                          <>
                            <Check className="w-4 h-4" />
                            <span>Berhasil Dimasukkan!</span>
                          </>
                        ) : (
                          <>
                            <span>+ Tambah ke Keranjang</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Small discount trust alert */}
        <div className="mt-12 text-center">
          <p className="text-xs text-brand-charcoal/50 font-bold bg-brand-cream font-mono py-2.5 px-4 rounded-full inline-block border border-brand-cream-dark/40">
            💡 INFO UTAMA: Pemesanan via WhatsApp dilayani khusus untuk Take Away (Ambil Sendiri di Toko) dengan harga murni tanpa markup. Layanan Delivery/Antar hanya dilayani eksklusif melalui ShopeeFood dan GoFood.
          </p>
        </div>

      </div>
    </section>
  );
}
