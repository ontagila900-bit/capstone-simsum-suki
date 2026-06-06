/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Star, MessageCircle, Plus, Minus, Check } from 'lucide-react';
import { motion } from 'motion/react';
import { MenuItem, CartItem } from '../types';
import { MENU_ITEMS } from '../data/menu';

interface BestSellersProps {
  cart: CartItem[];
  onAddToCart: (item: MenuItem, qty: number) => void;
  onUpdateQty: (id: string, delta: number) => void;
  onRemoveItem: (id: string) => void;
  onItemClick: (item: MenuItem) => void;
  menuItems?: MenuItem[];
}

export default function BestSellers({
  cart,
  onAddToCart,
  onUpdateQty,
  onRemoveItem,
  onItemClick,
  menuItems,
}: BestSellersProps) {
  const itemsSource = menuItems && menuItems.length > 0 ? menuItems : MENU_ITEMS;
  const bestSellers = itemsSource.filter((item) => item.isBestSeller);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  return (
    <section id="best-seller" className="py-20 bg-brand-cream-light relative overflow-hidden">
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
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 lg:gap-8">
          {bestSellers.map((item, idx) => {
            const cartItem = cart.find((ci) => ci.menuItem.id === item.id);
            const cartQty = cartItem ? cartItem.quantity : 0;

            return (
              <motion.div
                key={`${item.id}-${idx}`}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ duration: 0.5 }}
                className={`bg-white rounded-2xl sm:rounded-3xl overflow-hidden shadow-md transition-all duration-300 border flex flex-col group h-full relative ${
                  item.isAvailable === false
                    ? 'border-neutral-200 border-b-4 grayscale contrast-[0.82] opacity-80 select-none'
                    : 'hover:shadow-xl border-brand-cream border-b-4 hover:border-b-primary-orange'
                }`}
                id={`best-seller-card-${item.id}`}
              >
                {/* Badge Best Seller */}
                <span className="absolute top-2 left-2 sm:top-4 sm:left-4 z-10 bg-primary-orange text-white text-[8px] sm:text-[11px] font-bold px-1.5 py-0.5 sm:px-3 sm:py-1 rounded-full shadow-md flex items-center gap-1 uppercase tracking-wider font-mono">
                  <Star className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 fill-current text-amber-200" />
                  <span>Best Seller</span>
                </span>

                {/* Large Product Photo */}
                <div
                  onClick={() => {
                    if (item.isAvailable !== false) onItemClick(item);
                  }}
                  className={`relative aspect-4/3 w-full bg-brand-cream-dark overflow-hidden ${
                    item.isAvailable !== false ? 'cursor-pointer' : 'cursor-default'
                  }`}
                >
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
                  
                  {/* Habis/Out of stock badge indicator overlay */}
                  {item.isAvailable === false ? (
                    <div className="absolute inset-0 bg-black/45 backdrop-blur-[1px] flex items-center justify-center z-1">
                      <span className="bg-red-650 text-white text-[9px] sm:text-[11px] font-black tracking-widest px-3 sm:px-4 py-1 sm:py-1.5 rounded-full shadow-lg border border-red-500/50 uppercase font-mono animate-pulse">
                        Stok Habis
                      </span>
                    </div>
                  ) : (
                    /* Hover scan micro overlay */
                    <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <span className="bg-white/95 backdrop-blur-xs text-brand-charcoal text-[9px] sm:text-xs font-black px-3 py-1.5 rounded-full shadow-lg border border-brand-cream-dark/50 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                        Lihat Detail
                      </span>
                    </div>
                  )}

                  {/* Total pieces badge */}
                  {item.pieces && (
                    <span className="absolute bottom-2 right-2 sm:bottom-3 sm:right-3 bg-brand-charcoal/90 text-white font-semibold text-[9px] sm:text-xs py-0.5 sm:py-1 px-1.5 sm:px-2 rounded-lg font-mono">
                      {item.pieces} Pcs
                    </span>
                  )}
                </div>

                {/* Card Content & Details */}
                <div
                  onClick={() => {
                    if (item.isAvailable !== false) onItemClick(item);
                  }}
                  className={`p-3 sm:p-6 flex flex-col flex-grow ${
                    item.isAvailable !== false ? 'cursor-pointer hover:bg-neutral-50/20' : 'cursor-default'
                  } duration-200`}
                >
                  {/* Tags */}
                  <div className="flex flex-wrap gap-1 sm:gap-1.5 mb-1.5 sm:mb-2.5">
                    {item.tags?.map((tag, idx) => (
                      <span
                        key={`${tag}-${idx}`}
                        className="bg-brand-cream-dark/45 border border-brand-cream-dark text-brand-charcoal/70 text-[8px] sm:text-[10px] font-bold px-1 py-0.5 sm:px-2 rounded-md"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  {/* Title */}
                  <h3 className={`font-display text-xs sm:text-lg font-bold mb-1 sm:mb-2 transition-colors line-clamp-1 ${
                    item.isAvailable === false ? 'text-zinc-500 line-through' : 'text-brand-charcoal group-hover:text-primary-orange'
                  }`}>
                    {item.name}
                  </h3>

                  {/* Description */}
                  <p className="font-sans text-[10px] sm:text-xs text-brand-charcoal/60 leading-tight sm:leading-relaxed flex-grow font-medium mb-3 sm:mb-4 line-clamp-2 sm:line-clamp-none">
                    {item.description}
                  </p>
                </div>

                <div className="px-3 pb-3 sm:px-6 sm:pb-6 mt-auto">
                  <div className="border-t border-brand-cream-dark/50 pt-2.5 sm:pt-4">
                    {/* Price and Quantity Action Row */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
                      <div className="flex flex-col">
                        <span className="text-[8px] sm:text-[10px] font-bold text-gray-400 capitalize tracking-wider font-mono">Harga</span>
                        <span className={`font-display text-[13px] sm:text-lg font-extrabold whitespace-nowrap ${
                          item.isAvailable === false ? 'text-zinc-400' : 'text-primary-orange-dark'
                        }`}>
                          {item.isAvailable === false ? 'Habis' : formatPrice(item.price)}
                        </span>
                      </div>

                      {/* GoFood / ShopeeFood style Action Controller */}
                      <div className="w-full sm:w-auto min-w-[90px] sm:min-w-[110px] h-9 flex items-center justify-center">
                        {item.isAvailable === false ? (
                          <button
                            disabled
                            className="w-full h-full bg-zinc-100 text-zinc-400 border border-zinc-200 font-extrabold text-[10.5px] sm:text-xs py-1.5 px-3 rounded-lg sm:rounded-xl cursor-not-allowed select-none text-center"
                          >
                            HABIS
                          </button>
                        ) : cartQty === 0 ? (
                          <button
                            onClick={() => onAddToCart(item, 1)}
                            className="w-full h-full bg-white hover:bg-neutral-50 text-primary-orange border border-primary-orange hover:border-primary-orange-dark font-extrabold text-[11px] sm:text-[13px] py-1.5 px-3 rounded-lg sm:rounded-xl shadow-xs duration-200 flex items-center justify-center gap-1 active:scale-95 transition-all text-center cursor-pointer"
                          >
                            <Plus className="w-3.5 h-3.5 stroke-[3px]" />
                            <span>TAMBAH</span>
                          </button>
                        ) : (
                          <div className="flex items-center justify-between w-full h-full bg-primary-orange text-white rounded-lg sm:rounded-xl shadow-sm border border-primary-orange font-sans">
                            <button
                              onClick={() => {
                                if (cartQty === 1) {
                                  onRemoveItem(item.id);
                                } else {
                                  onUpdateQty(item.id, -1);
                                }
                              }}
                              className="w-8 h-full hover:bg-primary-orange-dark text-white font-extrabold rounded-l-lg sm:rounded-l-xl flex items-center justify-center cursor-pointer transition-colors"
                              aria-label="Kurangi porsi"
                            >
                              <Minus className="w-3 sm:w-3.5 h-3 sm:h-3.5 stroke-[3px]" />
                            </button>
                            <span className="text-xs sm:text-sm font-black font-mono select-none px-1 text-center">
                              {cartQty}
                            </span>
                            <button
                              onClick={() => onUpdateQty(item.id, 1)}
                              className="w-8 h-full hover:bg-primary-orange-dark text-white font-extrabold rounded-r-lg sm:rounded-r-xl flex items-center justify-center cursor-pointer transition-colors"
                              aria-label="Tambah porsi"
                            >
                              <Plus className="w-3 sm:w-3.5 h-3 sm:h-3.5 stroke-[3px]" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                </div>
              </motion.div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
