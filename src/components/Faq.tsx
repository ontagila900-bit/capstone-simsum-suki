/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { HelpCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { FAQS } from '../data/menu';

export default function Faq() {
  const [openId, setOpenId] = useState<string | null>('faq-1');

  const toggleFaq = (id: string) => {
    setOpenId((prev) => (prev === id ? null : id));
  };

  return (
    <section className="py-20 bg-white relative">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="inline-flex items-center gap-1 bg-[#f97316]/10 px-3.5 py-1 rounded-full text-xs font-bold text-primary-orange uppercase tracking-wider mb-3">
            <HelpCircle className="w-4 h-4" />
            <span>Pusat Jawaban Customer</span>
          </div>
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-brand-charcoal mb-4">
            Pertanyaan Sering Diajukan
          </h2>
          <p className="font-sans text-base text-brand-charcoal/70 leading-relaxed font-medium">
            Masih ragu atau punya pertanyaan lain? Temukan jawabannya di bawah ini demi mempermudah kelancaran jajan Anda!
          </p>
        </div>

        {/* Accordions List */}
        <div className="space-y-4">
          {FAQS.map((faq, idx) => {
            const isOpen = openId === faq.id;
            return (
              <motion.div
                key={faq.id}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.05, duration: 0.35 }}
                className={`border rounded-2xl overflow-hidden transition-all duration-300 ${
                  isOpen
                    ? 'border-brand-cream-dark bg-brand-cream/15 shadow-sm'
                    : 'border-brand-cream hover:border-brand-cream-dark bg-white'
                }`}
              >
                
                {/* Accordion Trigger Header Bar */}
                <button
                  onClick={() => toggleFaq(faq.id)}
                  className="w-full flex items-center justify-between gap-4 p-5 sm:p-6 text-left focus:outline-none transition-colors cursor-pointer select-none"
                  aria-expanded={isOpen}
                >
                  <span className="font-display font-extrabold text-sm sm:text-base text-brand-charcoal leading-snug">
                    {faq.question}
                  </span>
                  
                  {/* Indicator Arrow icon */}
                  <span className={`p-1.5 rounded-lg transition-transform duration-300 flex-shrink-0 ${
                    isOpen ? 'bg-primary-orange text-white rotate-180' : 'bg-brand-cream text-brand-charcoal'
                  }`}>
                    <ChevronDown className="w-4 h-4" />
                  </span>
                </button>

                {/* Smooth Expandable Content slide */}
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25, ease: 'easeInOut' }}
                    >
                      <div className="px-5 sm:px-6 pb-6 pt-1 text-xs sm:text-sm font-medium leading-relaxed text-brand-charcoal/70 font-sans border-t border-dashed border-brand-cream-dark/50">
                        {faq.answer}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

              </motion.div>
            );
          })}
        </div>

        {/* Small prompt callback card */}
        <div className="mt-12 text-center p-6 bg-brand-cream/40 rounded-3xl border border-brand-cream-dark/50 max-w-lg mx-auto">
          <p className="font-sans text-xs sm:text-sm font-bold text-brand-charcoal mb-2">
            Belum menemukan jawaban yang dicari?
          </p>
          <p className="text-xs text-brand-charcoal/60 leading-relaxed font-medium mb-4">
            Silakan langsung hubungi admin WhatsApp kami. Kami bersedia membantu mengarahkan pesanan Anda secara detail!
          </p>
          <a
            href="https://wa.me/6282123456789?text=Halo%2520Yusuki%2520saya%2520mau%2520bertanya..."
            target="_blank"
            rel="noopener noreferrer"
            className="bg-brand-charcoal text-white hover:bg-[#ea580c] font-bold text-xs py-2.5 px-5 rounded-xl inline-flex items-center gap-2 transition-all cursor-pointer shadow-sm shadow-black/10"
          >
            <span>Tanya Admin Sekarang</span>
            <span>&rarr;</span>
          </a>
        </div>

      </div>
    </section>
  );
}
