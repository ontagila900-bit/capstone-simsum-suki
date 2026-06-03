/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { Star, MessageCircle, Quote, ArrowLeft, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { TESTIMONIALS } from '../data/menu';

export default function Testimonials() {
  const [activeIndex, setActiveIndex] = useState(0);

  const prevTestimonial = () => {
    setActiveIndex((prev) => (prev === 0 ? TESTIMONIALS.length - 1 : prev - 1));
  };

  const nextTestimonial = () => {
    setActiveIndex((prev) => (prev === TESTIMONIALS.length - 1 ? 0 : prev + 1));
  };

  const current = TESTIMONIALS[activeIndex];

  return (
    <section className="py-20 bg-white relative overflow-hidden">
      {/* Decorative Blur Spheres */}
      <div className="absolute top-[30%] left-[-15%] w-[400px] h-[400px] bg-primary-orange/5 rounded-full blur-[80px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[350px] h-[350px] bg-amber-500/5 rounded-full blur-[70px]" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs font-bold text-primary-orange uppercase tracking-widest font-mono mb-2 block">Ulasan Jujur</span>
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-brand-charcoal mb-4">
            Apa Kata Penikmat Yusuki?
          </h2>
          <p className="font-sans text-base text-brand-charcoal/70 leading-relaxed font-medium">
            Lebih dari sekadar omset jualan, testimoni positif asli dari mulut ke mulut pelanggan setia adalah bara api penyemangat dapur kami setiap harinya.
          </p>
        </div>

        {/* Carousel / Slider Wrapper style with high contrast card and soft shadow */}
        <div className="relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={current.id}
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              transition={{ duration: 0.4 }}
              className="bg-brand-cream/30 border border-brand-cream-dark/60 rounded-3xl p-8 sm:p-12 shadow-md relative"
            >
              {/* Quote big accent icon */}
              <Quote className="absolute top-6 right-8 w-16 h-16 text-primary-orange/15 select-none" />

              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 sm:gap-8">
                
                {/* User avatar with modern frame */}
                <div className="relative flex-shrink-0">
                  <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden border-4 border-white shadow-md">
                    <img
                      src={current.avatar}
                      alt={current.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  {/* Small double quote decor */}
                  <span className="absolute -bottom-2 -right-2 bg-primary-orange text-white text-[10px] p-1.5 rounded-full shadow-sm font-mono font-bold leading-none">
                     9.8
                  </span>
                </div>

                {/* Testimonial body text */}
                <div className="flex-grow text-center sm:text-left">
                  {/* Rating Stars */}
                  <div className="flex justify-center sm:justify-start items-center gap-1 mb-4">
                    {Array.from({ length: current.rating }).map((_, i) => (
                      <Star key={i} className="w-5 h-5 fill-amber-500 text-amber-500" />
                    ))}
                  </div>

                  <blockquote className="font-sans text-sm sm:text-base md:text-lg text-brand-charcoal/80 leading-relaxed italic font-medium mb-6">
                    “{current.text}”
                  </blockquote>

                  {/* Customer credentials and date */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-brand-cream-dark/50 pt-4">
                    <div>
                      <h4 className="font-display font-extrabold text-sm sm:text-base text-brand-charcoal">
                        {current.name}
                      </h4>
                      <p className="text-xs font-bold text-primary-orange-dark font-sans">
                        {current.role}
                      </p>
                    </div>
                    <span className="text-[10px] sm:text-xs font-bold text-gray-400 font-mono">
                      Diterbitkan &bull; {current.date}
                    </span>
                  </div>

                </div>

              </div>

            </motion.div>
          </AnimatePresence>

          {/* Nav arrows overlay */}
          <div className="flex items-center justify-center gap-4 mt-8">
            <button
              onClick={prevTestimonial}
              className="bg-white hover:bg-brand-orange-50 border border-brand-cream-dark p-3 rounded-full text-brand-charcoal shadow-sm transition-all hover:scale-105 active:scale-95 cursor-pointer"
              aria-label="Previous review"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            
            {/* Dot bullets tracker */}
            <div className="flex items-center gap-2">
              {TESTIMONIALS.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActiveIndex(i)}
                  className={`h-2.5 rounded-full transition-all cursor-pointer ${
                    activeIndex === i ? 'w-6 bg-primary-orange' : 'w-2.5 bg-black/10 hover:bg-black/25'
                  }`}
                  aria-label={`Go to slide ${i + 1}`}
                />
              ))}
            </div>

            <button
              onClick={nextTestimonial}
              className="bg-white hover:bg-brand-orange-50 border border-brand-cream-dark p-3 rounded-full text-brand-charcoal shadow-sm transition-all hover:scale-105 active:scale-95 cursor-pointer"
              aria-label="Next review"
            >
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

        </div>

      </div>
    </section>
  );
}
