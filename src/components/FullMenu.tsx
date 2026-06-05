/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useMemo } from 'react';
import { Search, ChevronRight, MessageCircle, ShoppingBag, Plus, Minus, Check, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { MenuItem, MenuCategory, CartItem } from '../types';
import { MENU_ITEMS, CATEGORIES } from '../data/menu';

interface FullMenuProps {
  cart: CartItem[];
  onAddToCart: (item: MenuItem, qty: number) => void;
  onUpdateQty: (id: string, delta: number) => void;
  onRemoveItem: (id: string) => void;
  onItemClick: (item: MenuItem) => void;
  menuItems?: MenuItem[];
}

export default function FullMenu({
  cart,
  onAddToCart,
  onUpdateQty,
  onRemoveItem,
  onItemClick,
  menuItems,
}: FullMenuProps) {
  const [selectedCategory, setSelectedCategory] = useState<MenuCategory | 'ALL'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const itemsSource = menuItems && menuItems.length > 0 ? menuItems : MENU_ITEMS;

  // Filter and search menus list
  const filteredItems = useMemo(() => {
    return itemsSource.filter((item) => {
      const matchesCategory = selectedCategory === 'ALL' || item.category === selectedCategory;
      const matchesSearch =
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [itemsSource, selectedCategory, searchQuery]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  return (
    <section id="menu" className="py-20 bg-brand-cream/45 relative scroll-mt-10 overflow-hidden">
      {/* Decorative backdrop details */}
      <div className="absolute top-[40%] left-[-10%] w-[300px] h-[300px] bg-primary-orange/5 rounded-full blur-[70px] -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Title details */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center gap-1 bg-primary-orange/10 px-3.5 py-1 rounded-full text-xs font-bold text-primary-orange uppercase tracking-wider mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Catalog Autentik</span>
          </div>
          <h2 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-brand-charcoal mb-4">
            Menu Lengkap Yusuki
          </h2>
          <p className="font-sans text-base text-brand-charcoal/70 leading-relaxed font-medium">
            Pilih aneka cita rasa kegemaran Anda. Cukup tambahkan menu favorit ke keranjang, kumpulkan pesanan Anda, dan klik pesan saat Anda siap melakukan konfirmasi penyiapan Take Away via WhatsApp!
          </p>
        </div>

        {/* Real-time search in food startup layout */}
        <div className="max-w-md mx-auto mb-10 relative">
          <div className="relative">
            <input
              type="text"
              placeholder="Cari dimsum mentai, suki tomyum, dll..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-white border border-brand-cream-dark border-b-2 focus:border-b-primary-orange rounded-2xl text-sm text-brand-charcoal focus:outline-none shadow-sm transition-all text-ellipsis"
            />
            <Search className="absolute left-4 top-3.5 w-4.5 h-4.5 text-gray-400" />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-4 top-3 text-[10px] bg-brand-cream border border-brand-cream-dark px-1.5 py-1 rounded-lg text-brand-charcoal/75"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Horizontal Scroll Categories selector (Extremely Mobile Friendly!) */}
        <div className="mb-10 overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-brand-cream-dark scrollbar-track-transparent">
          <div className="flex md:flex-wrap items-center gap-2.5 min-w-max md:min-w-0 md:justify-center px-2">
            
            {/* "Semua" button option */}
            <button
              onClick={() => setSelectedCategory('ALL')}
              className={`px-4.5 py-2 rounded-xl text-xs font-bold transition-all duration-300 cursor-pointer ${
                selectedCategory === 'ALL'
                  ? 'bg-brand-charcoal text-white shadow-md'
                  : 'bg-white hover:bg-brand-cream-dark/30 border border-brand-cream-dark/65 text-brand-charcoal'
              }`}
            >
              Semua Menu ({itemsSource.length})
            </button>

            {CATEGORIES.map((cat) => {
              const count = itemsSource.filter((item) => item.category === cat).length;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4.5 py-2 rounded-xl text-xs font-bold transition-all duration-300 cursor-pointer capitalize ${
                    selectedCategory === cat
                      ? 'bg-primary-orange text-white shadow-md shadow-orange-500/10'
                      : 'bg-white hover:bg-brand-cream-dark/30 border border-brand-cream-dark/65 text-brand-charcoal'
                  }`}
                >
                  {cat.toLowerCase().replace('dimsum ', '')} ({count})
                </button>
              );
            })}
          </div>
        </div>

        {/* Products Grid list with smooth transitions */}
        <motion.div
          layout
          className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6 lg:gap-8"
        >
          <AnimatePresence mode="popLayout">
            {filteredItems.map((item, idx) => {
              const cartItem = cart.find((ci) => ci.menuItem.id === item.id);
              const cartQty = cartItem ? cartItem.quantity : 0;

              return (
                <motion.div
                  layout
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.35 }}
                  key={`${item.id || idx}-${idx}`}
                  className="bg-white rounded-2xl sm:rounded-3xl overflow-hidden shadow-sm hover:shadow-md border border-brand-cream transition-all flex flex-col h-full group"
                >
                  
                  {/* Banner / product photography placeholder */}
                  <div
                    onClick={() => onItemClick(item)}
                    className="relative aspect-4/3 sm:aspect-16/10 bg-brand-cream overflow-hidden cursor-pointer"
                  >
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                      referrerPolicy="no-referrer"
                    />
                    
                    {/* Dark gradient shadow overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent pointer-events-none" />

                    {/* Hover micro detail instruction */}
                    <div className="absolute inset-0 bg-black/15 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <span className="bg-white/95 backdrop-blur-xs text-brand-charcoal text-[9px] sm:text-xs font-black px-3 py-1.5 rounded-full shadow-lg border border-brand-cream-dark/50 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                        Lihat Detail
                      </span>
                    </div>

                    {/* Pieces indicator */}
                    {item.pieces && (
                      <span className="absolute bottom-1.5 right-1.5 sm:bottom-2.5 sm:right-2.5 bg-brand-charcoal/90 text-[8px] sm:text-[10px] font-bold text-white px-1.5 py-0.5 rounded-md font-mono">
                        {item.pieces} Pcs
                      </span>
                    )}

                    {/* Category simple text layout */}
                    <span className="absolute top-1.5 left-1.5 sm:top-2.5 sm:left-2.5 bg-white/90 backdrop-blur-xs text-brand-charcoal text-[8px] sm:text-[9px] font-bold px-1.5 py-0.5 rounded-md uppercase tracking-wider font-mono">
                      {item.category.replace('DIMSUM ', '')}
                    </span>
                  </div>

                  {/* Body texts of menu item */}
                  <div
                    onClick={() => onItemClick(item)}
                    className="p-3 sm:p-5 flex flex-col flex-grow cursor-pointer hover:bg-neutral-50/20 duration-200"
                  >
                    
                    {/* Header line name and tags */}
                    <div className="flex items-start justify-between gap-1 sm:gap-2.5 mb-1 sm:mb-1.5 text-ellipsis overflow-hidden">
                      <h3 className="font-display font-bold text-xs sm:text-base text-brand-charcoal group-hover:text-primary-orange transition-colors line-clamp-1">
                        {item.name}
                      </h3>
                    </div>

                    {/* Description detail */}
                    <p className="font-sans text-[10px] sm:text-xs text-brand-charcoal/60 leading-tight sm:leading-relaxed font-medium mb-3 sm:mb-4 flex-grow line-clamp-2">
                      {item.description}
                    </p>
                  </div>

                  {/* Price & Selection Section */}
                  <div className="px-3 pb-3 sm:px-5 sm:pb-5 mt-auto">
                    <div className="border-t border-brand-cream-dark/45 pt-2.5 sm:pt-4">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
                        <span className="font-display font-extrabold text-[13px] sm:text-base text-primary-orange whitespace-nowrap">
                          {formatPrice(item.price)}
                        </span>

                        {/* ShopeeFood / GoFood Action button */}
                        <div className="w-full sm:w-auto min-w-[90px] sm:min-w-[110px] h-9 flex items-center justify-center">
                          {cartQty === 0 ? (
                            <button
                              onClick={() => onAddToCart(item, 1)}
                              className="w-full h-full bg-white hover:bg-neutral-50 text-primary-orange border border-primary-orange hover:border-primary-orange-dark font-extrabold text-[11px] sm:text-[13px] py-1.5 px-3 rounded-lg sm:rounded-xl shadow-xs duration-200 flex items-center justify-center gap-1 active:scale-95 transition-all text-center cursor-pointer"
                            >
                              <Plus className="w-3.5 h-3.5 stroke-[3px]" />
                              <span>TAMBAH</span>
                            </button>
                          ) : (
                            <div className="flex items-center justify-between w-full h-full bg-primary-orange text-white rounded-lg sm:rounded-xl shadow-sm border border-primary-orange">
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
          </AnimatePresence>
        </motion.div>

        {/* Empty Search Fallback */}
        {filteredItems.length === 0 && (
          <div className="text-center py-16 bg-white border border-dashed border-brand-cream-dark rounded-3xl max-w-md mx-auto">
            <p className="font-sans font-bold text-brand-charcoal/60 mb-2">
              Yah, menu "{searchQuery}" tidak ditemukan
            </p>
            <p className="text-xs text-brand-charcoal/50 font-medium">
              Silakan coba kata kunci lain atau pilih tab kategori di atas.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('ALL');
              }}
              className="mt-4 bg-brand-cream hover:bg-brand-cream-dark border border-brand-cream-dark px-4 py-2 rounded-xl text-xs font-bold text-brand-charcoal transition-colors cursor-pointer"
            >
              Reset Pencarian
            </button>
          </div>
        )}

      </div>
    </section>
  );
}
