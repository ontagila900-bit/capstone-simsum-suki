/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useState } from 'react';
import { X, Star, ShoppingBag, Plus, Minus, ShieldCheck, Heart, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { MenuItem, CartItem } from '../types';

interface ProductDetailModalProps {
  item: MenuItem | null;
  onClose: () => void;
  cart: CartItem[];
  onAddToCart: (item: MenuItem, qty: number) => void;
  onUpdateQty: (id: string, delta: number) => void;
  onRemoveItem: (id: string) => void;
}

export default function ProductDetailModal({
  item,
  onClose,
  cart,
  onAddToCart,
  onUpdateQty,
  onRemoveItem,
}: ProductDetailModalProps) {
  // Local quantity helper to adjust before batch-adding, initialized with existing qty or 1
  const cartItem = item ? cart.find((ci) => ci.menuItem.id === item.id) : null;
  const initialQty = cartItem ? cartItem.quantity : 1;
  const [localQty, setLocalQty] = useState(initialQty);

  // Sync state if item changes or cart updates
  useEffect(() => {
    if (cartItem) {
      setLocalQty(cartItem.quantity);
    } else {
      setLocalQty(1);
    }
  }, [item, cartItem]);

  // Escape key to dismiss modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    if (item) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden'; // prevent double scrollbars
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [item, onClose]);

  if (!item) return null;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const handleDecrease = () => {
    if (localQty > 1) {
      const nextQty = localQty - 1;
      setLocalQty(nextQty);
      if (cartItem) {
        onUpdateQty(item.id, -1);
      }
    } else if (localQty === 1 && cartItem) {
      onRemoveItem(item.id);
      setLocalQty(1);
    }
  };

  const handleIncrease = () => {
    const nextQty = localQty + 1;
    setLocalQty(nextQty);
    if (cartItem) {
      onUpdateQty(item.id, 1);
    }
  };

  const handleActionClick = () => {
    if (!cartItem) {
      onAddToCart(item, localQty);
    } else {
      // Already in cart; we close or display a brief visual success
      onClose();
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 select-none">
        
        {/* Backdrop overlay blur */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/60 backdrop-blur-md cursor-pointer"
          id="product-modal-backdrop"
        />

        {/* Modal content viewport */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ type: 'spring', damping: 25, stiffness: 350 }}
          className="relative bg-white w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl border border-brand-cream-dark/40 flex flex-col md:flex-row max-h-[90vh] md:max-h-[80vh] z-10"
          id={`product-detail-modal-${item.id}`}
        >
          
          {/* Close corner icon button */}
          <button
            onClick={onClose}
            className="absolute top-3 right-3 sm:top-5 sm:right-5 z-20 bg-white/90 hover:bg-white text-brand-charcoal hover:scale-105 active:scale-95 duration-200 p-2 rounded-full shadow-lg border border-brand-cream-dark/50 cursor-pointer"
            aria-label="Tutup Detail"
          >
            <X className="w-5 h-5 stroke-[2.5px]" />
          </button>

          {/* Left Panel: Food Spotlight Illustration / Photo */}
          <div className="relative w-full md:w-1/2 aspect-video md:aspect-auto md:h-full bg-brand-cream-dark overflow-hidden flex-shrink-0">
            <img
              src={item.image}
              alt={item.name}
              className={`w-full h-full object-cover ${item.isAvailable === false ? 'grayscale contrast-75' : ''}`}
              referrerPolicy="no-referrer"
            />
            {/* Top features badge overlay */}
            <div className="absolute top-3 left-3 flex flex-col gap-1.5 items-start">
              {item.isBestSeller && (
                <span className="bg-primary-orange text-white text-[9px] sm:text-[10px] font-black px-2.5 py-1 rounded-full shadow-md flex items-center gap-1 uppercase tracking-wider font-mono">
                  <Star className="w-3 h-3 fill-current text-amber-200" />
                  <span>BEST SELLER</span>
                </span>
              )}
              {item.pieces && (
                <span className="bg-brand-charcoal/90 text-white font-mono font-bold text-[9px] sm:text-[10px] px-2 py-0.5 rounded-full shadow-md">
                  {item.pieces} PORSI PCS
                </span>
              )}
            </div>

            {item.isAvailable === false && (
              <div className="absolute inset-0 bg-black/45 backdrop-blur-[1px] flex items-center justify-center">
                <span className="bg-red-650 text-white text-[10px] sm:text-xs font-black tracking-widest px-4 py-2 rounded-full shadow-lg border border-red-500/50 uppercase font-mono animate-pulse">
                  Stok Habis
                </span>
              </div>
            )}

            <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-black/50 md:from-black/10 via-transparent to-transparent pointer-events-none" />
          </div>

          {/* Right Panel: Delicious Text layout descriptor & Actions */}
          <div className="w-full md:w-1/2 p-5 sm:p-7 flex flex-col h-full overflow-y-auto">
            
            {/* Category Breadcrumb */}
            <span className="text-[9px] font-black text-primary-orange uppercase tracking-widest font-mono mb-1">
              {item.category}
            </span>

            {/* Food Title */}
            <h2 className="font-display text-lg sm:text-2xl font-black text-brand-charcoal leading-tight mb-2.5">
              {item.name}
            </h2>

            {/* Inherent tags & certifications */}
            <div className="flex flex-wrap gap-1.5 mb-4">
              <span className="bg-emerald-50 border border-emerald-200 text-emerald-700 text-[9px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>100% Halal</span>
              </span>
              <span className="bg-brand-cream-dark/50 border border-brand-cream-dark text-brand-charcoal/70 text-[9px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1">
                <Heart className="w-3 h-3 fill-amber-500 text-amber-500" />
                <span>Handcrafted Fresh</span>
              </span>
              {item.tags?.map((tag, idx) => (
                <span
                  key={`${tag}-${idx}`}
                  className="bg-zinc-100 border border-zinc-200 text-zinc-600 text-[9px] font-bold px-2 py-0.5 rounded-md"
                >
                  {tag}
                </span>
              ))}
            </div>

            {/* Divider line */}
            <div className="border-t border-brand-cream-dark/50 my-1" />

            {/* Scrollable description block */}
            <div className="my-3 flex-grow">
              <p className="text-xs font-bold text-gray-400 capitalize tracking-wider font-mono mb-1 text-[9px] sm:text-[10px]">
                Deskripsi Produk
              </p>
              <p className="font-sans text-xs sm:text-[13px] text-brand-charcoal/75 leading-relaxed font-semibold">
                {item.description}
              </p>
              <p className="text-[10px] text-brand-charcoal/45 mt-3 font-semibold flex items-start gap-1 leading-snug">
                <AlertCircle className="w-3.5 h-3.5 text-amber-600 flex-shrink-0 mt-0.5" />
                <span>Disiapkan hangat & fresh saat Anda datang mengambil (Take Away) ke outlet kami.</span>
              </p>
            </div>

            {/* Interactive Actions footer docked inside card */}
            <div className="border-t border-brand-cream-dark/60 pt-4 mt-auto">
              
              {/* Price descriptor */}
              <div className="flex items-center justify-between gap-4 mb-4">
                <div className="flex flex-col">
                  <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest font-mono">
                    Harga Porsi
                  </span>
                  <span className={`font-display text-lg sm:text-xl font-extrabold ${
                    item.isAvailable === false ? 'text-zinc-400 line-through' : 'text-primary-orange-dark'
                  }`}>
                    {item.isAvailable === false ? 'Habis' : formatPrice(item.price)}
                  </span>
                </div>

                {/* Micro Quantity Counter Controller */}
                <div className="flex flex-col items-end">
                  <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest font-mono mb-1">
                    Atur Jumlah
                  </span>
                  <div className={`flex items-center rounded-xl p-0.5 shadow-xs ${
                    item.isAvailable === false ? 'bg-zinc-100 border border-zinc-200' : 'bg-brand-cream border border-brand-cream-dark/70'
                  }`}>
                    <button
                      onClick={() => {
                        if (item.isAvailable !== false) handleDecrease();
                      }}
                      disabled={item.isAvailable === false}
                      className={`w-7 h-7 bg-white font-black rounded-lg flex items-center justify-center transition-colors ${
                        item.isAvailable === false ? 'opacity-40 cursor-not-allowed text-zinc-450' : 'hover:bg-brand-cream-dark/20 text-brand-charcoal cursor-pointer'
                      }`}
                      aria-label="Kurangi"
                    >
                      <Minus className="w-3 h-3 stroke-[3px]" />
                    </button>
                    <span className={`w-8 text-center text-xs sm:text-sm font-black font-mono select-none ${
                      item.isAvailable === false ? 'text-zinc-450' : 'text-brand-charcoal'
                    }`}>
                      {item.isAvailable === false ? 0 : localQty}
                    </span>
                    <button
                      onClick={() => {
                        if (item.isAvailable !== false) handleIncrease();
                      }}
                      disabled={item.isAvailable === false}
                      className={`w-7 h-7 bg-white font-black rounded-lg flex items-center justify-center transition-colors ${
                        item.isAvailable === false ? 'opacity-40 cursor-not-allowed text-zinc-450' : 'hover:bg-brand-cream-dark/20 text-brand-charcoal cursor-pointer'
                      }`}
                      aria-label="Tambah"
                    >
                      <Plus className="w-3 h-3 stroke-[3px]" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Instant Conversion button */}
              {item.isAvailable === false ? (
                <button
                  disabled
                  className="w-full py-3.5 px-6 rounded-xl text-center font-black text-xs sm:text-sm bg-zinc-100 text-zinc-400 border border-zinc-200 cursor-not-allowed select-none flex items-center justify-center gap-2"
                >
                  <X className="w-4 h-4 text-zinc-400" />
                  <span>Stok Sedang Kosong (Kembali Besok)</span>
                </button>
              ) : (
                <button
                  onClick={handleActionClick}
                  className={`w-full py-3.5 px-6 rounded-xl text-center font-black text-xs sm:text-sm shadow-md transition-all duration-200 active:scale-98 cursor-pointer flex items-center justify-center gap-2 ${
                    cartItem
                      ? 'bg-brand-charcoal hover:bg-zinc-800 text-white border border-brand-charcoal'
                      : 'bg-primary-orange hover:bg-primary-orange-dark text-white border border-primary-orange shadow-orange-500/10 shadow-md'
                  }`}
                >
                  {cartItem ? (
                    <>
                      <X className="w-4 h-4 text-amber-200" />
                      <span>Tutup Detail (Sudah di Keranjang)</span>
                    </>
                  ) : (
                    <>
                      <ShoppingBag className="w-4 h-4 text-amber-100" />
                      <span>Masukkan ke Keranjang ({localQty} Porsi)</span>
                    </>
                  )}
                </button>
              )}
            </div>

          </div>

        </motion.div>
      </div>
    </AnimatePresence>
  );
}
