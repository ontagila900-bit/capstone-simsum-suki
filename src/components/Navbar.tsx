/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Menu, X, ShoppingBag, Phone, Flame } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import yusukiLogo from '../assets/images/yusuki_logo_1780421141524.png';

interface NavbarProps {
  cartCount: number;
  onOpenCart: () => void;
  activeSection: string;
  logoUrl?: string;
}

export default function Navbar({ cartCount, onOpenCart, activeSection, logoUrl }: NavbarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Home', href: '#home' },
    { name: 'Menu', href: '#menu' },
    { name: 'Promo', href: '#promo' },
    { name: 'Tentang Kami', href: '#tentang' },
    { name: 'Kontak', href: '#kontak' },
  ];

  const handleScrollTo = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    setIsOpen(false);
    if (href === '#home') {
      window.scrollTo({
        top: 0,
        behavior: 'smooth',
      });
      return;
    }
    const target = document.querySelector(href);
    if (target) {
      const offset = 80; // height of sticking header
      const targetPosition = target.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({
        top: targetPosition,
        behavior: 'smooth',
      });
    }
  };

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
          scrolled
            ? 'bg-brand-cream-light/95 backdrop-blur-md shadow-md border-b border-brand-cream/60 py-3'
            : 'bg-transparent py-5'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <a href="#home" className="flex items-center gap-2.5 group">
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full overflow-hidden shadow-md group-hover:scale-105 transition-transform duration-300 flex items-center justify-center bg-white border border-brand-cream-dark/30">
                <img
                  src={logoUrl || yusukiLogo}
                  alt="Yusuki Logo"
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="flex flex-col">
                <span className="font-display text-xl sm:text-2xl font-bold tracking-tight text-brand-charcoal group-hover:text-primary-orange transition-colors">
                  Suki Yusuki
                </span>
                <span className="text-[10px] uppercase font-bold tracking-widest text-primary-orange-dark -mt-1.5 font-mono">
                  Suki dan Dimsum
                </span>
              </div>
            </a>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-8">
              {navLinks.map((link) => {
                const isActive = activeSection === link.href.slice(1);
                return (
                  <a
                    key={link.name}
                    href={link.href}
                    onClick={(e) => handleScrollTo(e, link.href)}
                    className={`font-sans text-sm font-semibold tracking-wide transition-colors duration-300 relative py-1 ${
                      isActive
                        ? 'text-primary-orange'
                        : 'text-brand-charcoal hover:text-primary-orange'
                    }`}
                  >
                    {link.name}
                    {isActive && (
                      <motion.div
                        layoutId="activeIndicator"
                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-orange rounded-full"
                        transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                      />
                    )}
                  </a>
                );
              })}
            </nav>

            {/* Action Buttons */}
            <div className="hidden md:flex items-center gap-4">
              {/* Shopping Cart button with interactive count badge */}
              <button
                onClick={onOpenCart}
                id="cart-desktop"
                className="relative p-2 text-brand-charcoal hover:text-primary-orange hover:bg-brand-orange-50 bg-brand-cream-dark/30 rounded-xl transition-all duration-300 cursor-pointer flex items-center justify-center border border-brand-cream-dark/40"
                aria-label="Open Shopping Cart"
              >
                <ShoppingBag className="w-5 h-5" />
                <AnimatePresence>
                  {cartCount > 0 && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                      className="absolute -top-1.5 -right-1.5 bg-primary-orange text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center animate-bounce shadow-md"
                    >
                      {cartCount}
                    </motion.span>
                  )}
                </AnimatePresence>
              </button>

              <a
                href="#menu"
                onClick={(e) => handleScrollTo(e, '#menu')}
                className="bg-brand-charcoal text-white hover:bg-primary-orange font-semibold text-sm px-5 py-2.5 rounded-xl flex items-center gap-2 shadow-md transition-all duration-300 group hover:-translate-y-0.5 cursor-pointer"
              >
                <Phone className="w-4 h-4 text-brand-cream group-hover:rotate-12 transition-transform" />
                <span>Pesan Sekarang</span>
              </a>
            </div>

            {/* Mobile Actions Container */}
            <div className="flex md:hidden items-center gap-3">
              {/* Shopping Bag Button for Mobile (Easy conversion reach) */}
              <button
                onClick={onOpenCart}
                id="cart-mobile"
                className="relative p-2.5 text-brand-charcoal bg-brand-cream/80 border border-brand-cream-dark/60 rounded-xl shadow-sm transition-all"
                aria-label="Open Shopping Cart"
              >
                <ShoppingBag className="w-5 h-5" />
                <AnimatePresence>
                  {cartCount > 0 && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                      className="absolute -top-1 -right-1 bg-primary-orange text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center font-mono"
                    >
                      {cartCount}
                    </motion.span>
                  )}
                </AnimatePresence>
              </button>

              {/* Hamburger Button */}
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="p-2 text-brand-charcoal hover:text-primary-orange transition-colors duration-200"
                aria-label="Toggle Menu"
              >
                {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Drawer (Smooth slide animation) */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-45 md:hidden"
            />

            {/* Content Drawer */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 h-full w-4/5 max-w-xs bg-brand-cream-light border-l border-brand-cream shadow-2xl z-50 md:hidden flex flex-col p-6 overflow-y-auto"
            >
              {/* Drawer Header */}
              <div className="flex items-center justify-between border-b border-brand-cream-dark/45 pb-4 mb-6">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full overflow-hidden shadow-sm bg-white border border-brand-cream-dark/20 flex items-center justify-center">
                    <img
                      src={logoUrl || yusukiLogo}
                      alt="Yusuki Logo"
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <span className="font-display font-bold text-lg text-brand-charcoal">Suki Yusuki</span>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 rounded-lg bg-brand-cream hover:bg-brand-cream-dark/50"
                >
                  <X className="w-5 h-5 text-brand-charcoal" />
                </button>
              </div>

              {/* Navigation list */}
              <div className="flex flex-col gap-4">
                {navLinks.map((link) => {
                  const isActive = activeSection === link.href.slice(1);
                  return (
                    <a
                      key={link.name}
                      href={link.href}
                      onClick={(e) => handleScrollTo(e, link.href)}
                      className={`font-sans font-semibold py-2.5 px-4 rounded-xl transition-all duration-200 flex items-center justify-between ${
                        isActive
                          ? 'bg-primary-orange/10 text-primary-orange font-bold'
                          : 'text-brand-charcoal hover:bg-brand-cream'
                      }`}
                    >
                      <span>{link.name}</span>
                      <span className="text-xs font-mono text-brand-cream-dark opacity-0 group-hover:opacity-100">&rarr;</span>
                    </a>
                  );
                })}
              </div>

              {/* Bottom Actions inside drawer */}
              <div className="mt-auto border-t border-brand-cream-dark/45 pt-6 flex flex-col gap-3">
                <button
                  onClick={() => {
                    setIsOpen(false);
                    onOpenCart();
                  }}
                  className="w-full bg-brand-cream border border-brand-cream-dark hover:bg-brand-cream-dark/20 text-brand-charcoal font-semibold py-3 px-4 rounded-xl flex items-center justify-center gap-2 shadow-sm transition-all text-sm cursor-pointer"
                >
                  <ShoppingBag className="w-4 h-4 text-primary-orange" />
                  <span>Keranjang Belanja ({cartCount})</span>
                </button>

                <a
                  href="#menu"
                  onClick={(e) => handleScrollTo(e, '#menu')}
                  className="w-full bg-primary-orange text-white hover:bg-primary-orange-dark font-semibold py-3 px-4 rounded-xl flex items-center justify-center gap-2 shadow-md transition-all text-sm cursor-pointer"
                >
                  <Phone className="w-4 h-4 text-brand-cream" />
                  <span>Pesan via WhatsApp</span>
                </a>

                <div className="text-center text-[10px] text-gray-400 mt-2 font-medium">
                  Suki Yusuki &bull; Berdiri Sejak 2021
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
