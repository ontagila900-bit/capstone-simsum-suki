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
    <section className="py-12 bg-white relative">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-xl mx-auto mb-8">
          <span className="text-[10px] font-bold text-primary-orange uppercase tracking-widest font-mono mb-1 block">FAQ</span>
          <h2 className="font-display text-xl sm:text-2xl font-bold text-brand-charcoal mb-2">
            Pertanyaan Sering Diajukan
          </h2>
          <p className="font-sans text-xs text-brand-charcoal/70 leading-relaxed font-normal">
            Jawaban singkat seputar pemesanan, rasa, dan jaminan kebersihan Suki Yusuki.
          </p>
        </div>

        {/* Accordions List */}
        <div className="space-y-3">
          {FAQS.map((faq, idx) => {
            const isOpen = openId === faq.id;
            return (
              <motion.div
                key={faq.id}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.03, duration: 0.3 }}
                className={`border rounded-xl overflow-hidden transition-all duration-300 ${
                  isOpen
                    ? 'border-brand-cream-dark bg-brand-cream/10 shadow-sm'
                    : 'border-brand-cream/70 hover:border-brand-cream-dark bg-white'
                }`}
              >
                
                {/* Accordion Trigger Header Bar */}
                <button
                  onClick={() => toggleFaq(faq.id)}
                  className="w-full flex items-center justify-between gap-4 p-4 text-left focus:outline-none transition-colors cursor-pointer select-none"
                  aria-expanded={isOpen}
                >
                  <span className="font-sans font-bold text-xs sm:text-sm text-brand-charcoal leading-snug">
                    {faq.question}
                  </span>
                  
                  {/* Indicator Arrow icon */}
                  <span className={`p-1 rounded-md transition-transform duration-300 flex-shrink-0 ${
                    isOpen ? 'bg-primary-orange text-white rotate-180' : 'bg-brand-cream text-brand-charcoal'
                  }`}>
                    <ChevronDown className="w-3.5 h-3.5" />
                  </span>
                </button>

                {/* Smooth Expandable Content slide */}
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2, ease: 'easeInOut' }}
                    >
                      <div className="px-4 pb-4 pt-1.5 text-[11px] sm:text-xs font-normal leading-relaxed text-brand-charcoal/75 font-sans border-t border-dashed border-brand-cream-dark/30">
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
        <div className="mt-8 text-center p-4 bg-brand-cream/20 rounded-2xl border border-brand-cream-dark/30 max-w-md mx-auto">
          <p className="font-sans text-xs font-bold text-brand-charcoal mb-1">
            Belum menemukan jawaban?
          </p>
          <p className="text-[10.5px] text-zinc-500 leading-relaxed font-normal mb-3">
            Silakan chat langsung dengan admin WhatsApp kami ramah dan sigap membantu bertanya apapun!
          </p>
          <a
            href="https://wa.me/6281818758265?text=Halo%2520Yusuki%2520saya%2520mau%2520bertanya..."
            target="_blank"
            rel="noopener noreferrer"
            className="bg-brand-charcoal text-white hover:bg-primary-orange-dark font-bold text-[11px] py-2 px-4 rounded-xl inline-flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
          >
            <span>Tanya Admin</span>
            <span>&rarr;</span>
          </a>
        </div>

      </div>
    </section>
  );
}
