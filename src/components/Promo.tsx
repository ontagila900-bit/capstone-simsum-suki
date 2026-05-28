/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { Tag, Check, ShoppingBag } from 'lucide-react';
import { motion } from 'motion/react';
import { MenuItem } from '../types';

interface ComboPackage {
  id: string;
  title: string;
  badge: string;
  price: string;
  priceNum: number;
  description: string;
  image: string;
  whatsappMessage: string;
}

interface PromoSectionProps {
  onAddToCart: (item: MenuItem, qty: number) => void;
}

export default function PromoSection({ onAddToCart }: PromoSectionProps) {
  const [addedItem, setAddedItem] = useState<Record<string, boolean>>({});

  const combos: ComboPackage[] = [
    {
      id: 'pr-1',
      title: 'Paket Kombinasi Suka-Suka',
      badge: 'Bestseller Combo',
      price: 'Rp28.000',
      priceNum: 28000,
      description: 'Perpaduan Suki Small kuah Tomyum hangat segar dengan 3pcs Dimsum Original kukus lembut yang lezat dan mengenyangkan.',
      image: 'https://images.unsplash.com/photo-1615870216519-2f9fa575fa5c?auto=format&fit=crop&w=400&q=80',
      whatsappMessage: 'Halo kak, saya ingin memesan Paket Kombinasi Suka-Suka (Suki Small + Dimsum 3pcs, Rp28.000) untuk Take Away di toko.',
    },
    {
      id: 'pr-2',
      title: 'Paket Duo Saus Bakar',
      badge: 'Favorit Pelanggan',
      price: 'Rp32.000',
      priceNum: 32000,
      description: 'Sajian dua rasa terlaris: 1 porsi Dimsum Mentai Bakar (3pcs) ditambah 1 porsi Dimsum Original (3pcs) dengan paduan saus nikmat.',
      image: 'https://images.unsplash.com/photo-1617196034183-421b4917c92d?auto=format&fit=crop&w=400&q=80',
      whatsappMessage: 'Halo kak, saya ingin memesan Paket Duo Saus Bakar (Dimsum Mentai 3pcs + Dimsum Ori 3pcs, Rp32.000) untuk Take Away di toko.',
    },
    {
      id: 'pr-3',
      title: 'Porsi Topping Melimpah',
      badge: 'Spesial Topping',
      price: 'Rp16.000',
      priceNum: 16000,
      description: 'Pesan Dimsum Goreng Krispi (4pcs) spesial porsi jumbo dengan parutan keju mozarella parut gurih atau taburan abon sapi asli.',
      image: 'https://images.unsplash.com/photo-1562608284-c5347ef88ea8?auto=format&fit=crop&w=400&q=80',
      whatsappMessage: 'Halo kak, saya ingin memesan Porsi Topping Melimpah (Dimsum Goreng 4pcs + Ekstra Topping, Rp16.000) untuk Take Away di toko.',
    },
  ];

  const handleAddComboToCart = (combo: ComboPackage) => {
    const item: MenuItem = {
      id: combo.id,
      name: combo.title,
      price: combo.priceNum,
      category: 'DIMSUM KOMBINASI',
      description: combo.description,
      image: combo.image,
    };
    onAddToCart(item, 1);
    
    setAddedItem((prev) => ({ ...prev, [combo.id]: true }));
    setTimeout(() => {
      setAddedItem((prev) => ({ ...prev, [combo.id]: false }));
    }, 2000);
  };

  return (
    <section id="promo" className="py-20 bg-brand-cream-light relative scroll-mt-10">
      
      {/* Decorative Warm Light Background Blur */}
      <div className="absolute top-[10%] left-[80%] w-[300px] h-[300px] bg-amber-500/10 rounded-full blur-[80px]" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Title */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="inline-flex items-center gap-1.5 bg-[#f97316]/10 px-3 py-1 rounded-full text-xs font-bold text-primary-orange uppercase tracking-wider mb-3 font-mono">
            <Tag className="w-4 h-4" />
            <span>Paket Menu Praktis</span>
          </div>
          <h2 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-brand-charcoal mb-4">
            Menu Paket & Kombinasi Yusuki
          </h2>
          <p className="font-sans text-base text-brand-charcoal/70 leading-relaxed font-medium">
            Ingin mencicipi berbagai variasi sekaligus? Kami menyediakan pilihan bundling paket praktis terlaris untuk dimasukkan langsung ke keranjang belanja Anda.
          </p>
        </div>

        {/* Combo Packages Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {combos.map((combo, idx) => {
            const isAdded = addedItem[combo.id] || false;
            return (
              <motion.div
                key={combo.id}
                initial={{ opacity: 0, scale: 0.96 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1, duration: 0.45 }}
                className="bg-white rounded-3xl overflow-hidden border border-brand-cream shadow-md hover:shadow-xl transition-all duration-300 flex flex-col group h-full relative"
              >
                
                {/* Badge */}
                <span className="absolute top-4 left-4 z-10 bg-brand-charcoal text-brand-cream text-[10px] font-bold px-3 py-1 rounded-full shadow-md uppercase tracking-wider font-mono">
                  {combo.badge}
                </span>

                {/* Photo image with cut-out style */}
                <div className="relative aspect-16/10 w-full overflow-hidden bg-brand-cream">
                  <img
                    src={combo.image}
                    alt={combo.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent pointer-events-none" />
                </div>

                {/* Package Info */}
                <div className="p-6 flex flex-col flex-grow">
                  <h3 className="font-display text-lg font-bold text-brand-charcoal mb-3 group-hover:text-primary-orange transition-colors">
                    {combo.title}
                  </h3>
                  
                  <p className="font-sans text-xs sm:text-sm text-brand-charcoal/65 leading-relaxed font-medium mb-5 flex-grow">
                    {combo.description}
                  </p>

                  {/* Price indicators wrapper */}
                  <div className="flex items-end justify-between border-t border-brand-cream-dark/50 pt-4 mt-auto mb-4">
                    <div className="flex flex-col">
                      <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider font-mono mb-0.5">
                        Harga Paket
                      </span>
                      <span className="font-display font-extrabold text-[#ea580c] text-xl">
                        {combo.price}
                      </span>
                    </div>
                    <div className="bg-brand-cream text-[#ea580c] font-bold text-[10px] py-1 px-2.5 rounded-lg font-mono">
                      AMBIL DI OUTLET
                    </div>
                  </div>

                  {/* Add to Cart button */}
                  <button
                    onClick={() => handleAddComboToCart(combo)}
                    className={`w-full text-xs font-bold py-3.5 px-4 rounded-xl flex items-center justify-center gap-2 shadow-sm transition-all duration-300 transform hover:-translate-y-0.5 cursor-pointer ${
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
                        <ShoppingBag className="w-4 h-4 text-white" />
                        <span>+ Tambah ke Keranjang</span>
                      </>
                    )}
                  </button>

                </div>
              </motion.div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
