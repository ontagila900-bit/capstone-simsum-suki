/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useMemo } from 'react';
import { Search, ChevronRight, MessageCircle, ShoppingBag, Plus, Minus, Check, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { MenuItem, MenuCategory } from '../types';
import { MENU_ITEMS, CATEGORIES } from '../data/menu';

interface FullMenuProps {
  onAddToCart: (item: MenuItem, qty: number) => void;
}

export default function FullMenu({ onAddToCart }: FullMenuProps) {
  const [selectedCategory, setSelectedCategory] = useState<MenuCategory | 'ALL'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [addedItem, setAddedItem] = useState<Record<string, boolean>>({});

  // Reset standard quantity is 1
  const getItemQty = (id: string) => quantities[id] || 1;

  const handleQtyChange = (id: string, delta: number) => {
    setQuantities((prev) => {
      const current = prev[id] || 1;
      const next = Math.max(1, current + delta);
      return { ...prev, [id]: next };
    });
  };

  const triggerAddToCart = (item: MenuItem) => {
    const qty = getItemQty(item.id);
    onAddToCart(item, qty);
    setAddedItem((prev) => ({ ...prev, [item.id]: true }));
    setTimeout(() => {
      setAddedItem((prev) => ({ ...prev, [item.id]: false }));
    }, 1800);
  };

  // Filter and search menus list
  const filteredItems = useMemo(() => {
    return MENU_ITEMS.filter((item) => {
      const matchesCategory = selectedCategory === 'ALL' || item.category === selectedCategory;
      const matchesSearch =
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, searchQuery]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  return (
    <section id="menu" className="py-20 bg-brand-cream/45 relative scroll-mt-10">
      {/* Decorative backdrop details */}
      <div className="absolute top-[40%] left-[-10%] w-[300px] h-[300px] bg-primary-orange/5 rounded-full blur-[70px] -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Title details */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center gap-1 bg-[#f97316]/10 px-3.5 py-1 rounded-full text-xs font-bold text-primary-orange uppercase tracking-wider mb-3">
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
              Semua Menu ({MENU_ITEMS.length})
            </button>

            {CATEGORIES.map((cat) => {
              const count = MENU_ITEMS.filter((item) => item.category === cat).length;
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
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8"
        >
          <AnimatePresence mode="popLayout">
            {filteredItems.map((item) => {
              const qty = getItemQty(item.id);
              const isAdded = addedItem[item.id] || false;

              return (
                <motion.div
                  layout
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.35 }}
                  key={item.id}
                  className="bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-md border border-brand-cream transition-all flex flex-col h-full group"
                >
                  
                  {/* Banner / product photography placeholder */}
                  <div className="relative aspect-16/10 bg-brand-cream overflow-hidden">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                      referrerPolicy="no-referrer"
                    />
                    
                    {/* Dark gradient shadow overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent pointer-events-none" />

                    {/* Pieces indicator */}
                    {item.pieces && (
                      <span className="absolute bottom-2.5 right-2.5 bg-brand-charcoal/90 text-[10px] font-bold text-white px-2 py-0.5 rounded-md font-mono">
                        {item.pieces} Pcs
                      </span>
                    )}

                    {/* Category simple text layout */}
                    <span className="absolute top-2.5 left-2.5 bg-white/90 backdrop-blur-xs text-brand-charcoal text-[9px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider font-mono">
                      {item.category.replace('DIMSUM ', '')}
                    </span>
                  </div>

                  {/* Body texts of menu item */}
                  <div className="p-5 flex flex-col flex-grow">
                    
                    {/* Header line name and tags */}
                    <div className="flex items-start justify-between gap-2.5 mb-1.5">
                      <h3 className="font-display font-bold text-sm sm:text-base text-brand-charcoal group-hover:text-primary-orange transition-colors">
                        {item.name}
                      </h3>
                    </div>

                    {/* Description detail */}
                    <p className="font-sans text-xs text-brand-charcoal/60 leading-relaxed font-medium mb-4 flex-grow">
                      {item.description}
                    </p>

                    {/* Price & selection counters */}
                    <div className="border-t border-brand-cream-dark/45 pt-4 mt-auto">
                      <div className="flex items-center justify-between gap-2 mb-3.5">
                        <span className="font-display font-extrabold text-sm sm:text-base text-primary-orange">
                          {formatPrice(item.price)}
                        </span>

                        {/* Interactive mini quantity selector */}
                        <div className="flex items-center bg-brand-cream border border-brand-cream-dark/60 rounded-lg p-0.5 shadow-sm">
                          <button
                            onClick={() => handleQtyChange(item.id, -1)}
                            className="w-6 h-6 bg-white hover:bg-brand-cream-dark/20 text-brand-charcoal font-bold rounded flex items-center justify-center cursor-pointer"
                            aria-label="Decrease quantity"
                          >
                            <Minus className="w-3" />
                          </button>
                          <span className="w-6 text-center text-xs font-bold text-brand-charcoal font-mono">
                            {qty}
                          </span>
                          <button
                            onClick={() => handleQtyChange(item.id, 1)}
                            className="w-6 h-6 bg-white hover:bg-brand-cream-dark/20 text-brand-charcoal font-bold rounded flex items-center justify-center cursor-pointer"
                            aria-label="Increase quantity"
                          >
                            <Plus className="w-3" />
                          </button>
                        </div>
                      </div>

                      {/* Conversion CTAs */}
                      <div className="flex flex-col gap-2">
                        {/* Multi-add collection button */}
                        <button
                          onClick={() => triggerAddToCart(item)}
                          className={`w-full text-xs font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs ${
                            isAdded
                              ? 'bg-emerald-600 hover:bg-emerald-700 text-white border border-emerald-600 font-bold'
                              : 'bg-primary-orange hover:bg-primary-orange-dark text-white border border-primary-orange shadow-orange-500/10'
                          }`}
                        >
                          {isAdded ? (
                            <>
                              <Check className="w-3.5 h-3.5" />
                              <span>Berhasil Dimasukkan!</span>
                            </>
                          ) : (
                            <>
                              <ShoppingBag className="w-3.5 h-3.5" />
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
