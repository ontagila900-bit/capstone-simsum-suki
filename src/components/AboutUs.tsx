/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { BookOpen, CheckCircle2, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { AppSettings, AboutSlideItem } from '../types';

interface AboutUsProps {
  appSettings?: AppSettings;
  aboutSlides?: AboutSlideItem[];
}

export default function AboutUs({ appSettings, aboutSlides = [] }: AboutUsProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  // If there are no slides, render nothing to avoid layout thrashing
  if (aboutSlides.length === 0) {
    return null;
  }

  const activeSlide = aboutSlides[currentIndex] || aboutSlides[0];

  const handleNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % aboutSlides.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + aboutSlides.length) % aboutSlides.length);
  };

  return (
    <section id="tentang" className="py-20 bg-brand-cream/35 relative overflow-hidden scroll-mt-10">
      {/* Decorative vector circles background */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-primary-orange/5 rounded-full blur-3xl -z-10 translate-x-1/2 -translate-y-1/2 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-brand-cream-dark/20 rounded-full blur-3xl -z-10 -translate-x-1/2 translate-y-1/2 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Slideshow main wrapper framed by active transition */}
        <div className="relative bg-white/40 border border-zinc-100 p-6 sm:p-10 lg:p-14 rounded-[2.5rem] shadow-sm backdrop-blur-md">
          
          <AnimatePresence mode="wait">
            <motion.div
              key={activeSlide.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center"
            >
              {/* Story Visual Frame (Left pane) */}
              <div className="lg:col-span-5 relative w-full max-w-[380px] aspect-square mx-auto flex items-center justify-center">
                
                {/* Background solid decoration card */}
                <div className="absolute top-2 left-2 w-[92%] h-[92%] bg-primary-orange rounded-3xl -z-10 shadow-lg" />

                {/* Main Picture */}
                <div className="absolute bottom-2 right-2 w-[92%] h-[92%] rounded-3xl overflow-hidden shadow-2xl border-4 border-white bg-brand-cream-dark">
                  <img
                    src={activeSlide.image || "/src/assets/images/yusuki_physical_outlet_1780673086306.png"}
                    alt={activeSlide.title}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-500 ease-out"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent pointer-events-none" />
                  
                  {/* Badge Overlay */}
                  <div className="absolute bottom-3 left-3 right-3 bg-white/95 backdrop-blur-xs rounded-xl p-2.5 shadow-xl">
                    <p className="text-[9px] font-black text-primary-orange uppercase tracking-widest font-mono">
                      {activeSlide.subtitle || 'Tentang Kami'}
                    </p>
                    <p className="text-[10px] font-bold text-brand-charcoal leading-tight mt-0.5">
                      Slide {currentIndex + 1} dari {aboutSlides.length}
                    </p>
                  </div>
                </div>

                {/* Micro details ring */}
                <div className="absolute inset-3 border-2 border-white/20 rounded-full scale-110 pointer-events-none" />
              </div>

              {/* Story Text Frame (Right pane with warm narrative) */}
              <div className="lg:col-span-7 flex flex-col justify-center text-center lg:text-left">
                
                <div className="inline-flex items-center gap-1.5 bg-primary-orange/10 px-3.5 py-1 rounded-full text-xs font-bold text-primary-orange uppercase tracking-wider mb-4 w-fit mx-auto lg:mx-0">
                  <BookOpen className="w-4 h-4" />
                  <span>{activeSlide.subtitle || 'Kisah Kami'}</span>
                </div>

                <h2 className="font-display text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-brand-charcoal mb-5">
                  {activeSlide.title}
                </h2>

                <div className="space-y-3.5 font-sans text-xs sm:text-sm text-zinc-600 leading-relaxed font-semibold">
                  {activeSlide.paragraphs && activeSlide.paragraphs.map((p, idx) => (
                    <p key={idx}>{p}</p>
                  ))}
                </div>

                {/* List Achievements bullet points */}
                <div className="mt-6.5 grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-brand-cream-dark/50 pt-5 text-left">
                  {activeSlide.bullet1Title && (
                    <div className="flex items-start gap-2.5">
                      <CheckCircle2 className="w-4.5 h-4.5 text-primary-orange flex-shrink-0 mt-0.5" />
                      <p className="text-[11px] sm:text-xs text-zinc-650 leading-relaxed">
                        <strong className="block text-brand-charcoal font-bold">{activeSlide.bullet1Title}</strong>
                        {activeSlide.bullet1Desc}
                      </p>
                    </div>
                  )}

                  {activeSlide.bullet2Title && (
                    <div className="flex items-start gap-2.5">
                      <CheckCircle2 className="w-4.5 h-4.5 text-primary-orange flex-shrink-0 mt-0.5" />
                      <p className="text-[11px] sm:text-xs text-zinc-650 leading-relaxed">
                        <strong className="block text-brand-charcoal font-bold">{activeSlide.bullet2Title}</strong>
                        {activeSlide.bullet2Desc}
                      </p>
                    </div>
                  )}
                </div>

              </div>
            </motion.div>
          </AnimatePresence>

          {/* Navigational controls: Slider Left & Right arrows and dot indicators */}
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-between gap-5 pt-6 border-t border-zinc-100">
            {/* Dots */}
            <div className="flex gap-2.5">
              {aboutSlides.map((slide, idx) => (
                <button
                  key={slide.id}
                  onClick={() => setCurrentIndex(idx)}
                  className={`h-2.5 rounded-full transition-all duration-300 cursor-pointer ${
                    currentIndex === idx ? 'w-8 bg-primary-orange' : 'w-2.5 bg-zinc-200 hover:bg-zinc-300'
                  }`}
                  aria-label={`Lihat Slide ${idx + 1}`}
                />
              ))}
            </div>

            {/* Navigation buttons */}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={handlePrev}
                className="w-10 h-10 bg-white border border-zinc-200 hover:bg-zinc-50 hover:border-zinc-350 text-brand-charcoal hover:text-primary-orange transition-all duration-200 rounded-full flex items-center justify-center cursor-pointer shadow-xs"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                type="button"
                onClick={handleNext}
                className="w-10 h-10 bg-primary-orange text-white hover:bg-orange-600 hover:shadow-md transition-all duration-200 rounded-full flex items-center justify-center cursor-pointer"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
