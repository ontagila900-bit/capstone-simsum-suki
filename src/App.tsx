/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import BestSellers from './components/BestSellers';
import FullMenu from './components/FullMenu';
import WhyWhatsApp from './components/WhyWhatsApp';
import Platforms from './components/Platforms';
import PromoSection from './components/Promo';
import InstagramFeed from './components/InstagramFeed';
import WhyChooseUs from './components/WhyChooseUs';
import Testimonials from './components/Testimonials';
import AboutUs from './components/AboutUs';
import Faq from './components/Faq';
import Contact from './components/Contact';
import Footer from './components/Footer';
import FloatingCartAndWA from './components/FloatingCartAndWA';
import { MenuItem, CartItem } from './types';

export default function App() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('home');

  // Monitor screen positions using IntersectionObserver to update active navigation tabs
  useEffect(() => {
    const sections = ['home', 'menu', 'promo', 'tentang', 'kontak'];
    const observers = sections.map((id) => {
      const element = document.getElementById(id);
      if (!element) return null;

      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setActiveSection(id);
          }
        },
        { threshold: 0.25, rootMargin: '-80px 0px -40% 0px' }
      );

      observer.observe(element);
      return { observer, element };
    });

    return () => {
      observers.forEach((obs) => {
        if (obs) {
          obs.observer.unobserve(obs.element);
        }
      });
    };
  }, []);

  // Cart Management Operations
  const handleAddToCart = (item: MenuItem, qty: number) => {
    setCart((prevCart) => {
      const existing = prevCart.find((ci) => ci.menuItem.id === item.id);
      if (existing) {
        return prevCart.map((ci) =>
          ci.menuItem.id === item.id ? { ...ci, quantity: ci.quantity + qty } : ci
        );
      }
      return [...prevCart, { menuItem: item, quantity: qty }];
    });
  };

  const handleUpdateQty = (itemId: string, delta: number) => {
    setCart((prevCart) => {
      return prevCart.map((ci) => {
        if (ci.menuItem.id === itemId) {
          const nextQty = Math.max(1, ci.quantity + delta);
          return { ...ci, quantity: nextQty };
        }
        return ci;
      });
    });
  };

  const handleRemoveItem = (itemId: string) => {
    setCart((prevCart) => prevCart.filter((ci) => ci.menuItem.id !== itemId));
  };

  const handleClearCart = () => {
    setCart([]);
  };

  // Dynamic Scroll actions triggered from CTA buttons
  const scrollToSection = (id: string) => {
    const target = document.getElementById(id);
    if (target) {
      const offset = 80;
      const targetPosition = target.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({
        top: targetPosition,
        behavior: 'smooth',
      });
    }
  };

  // Calculates the sum of all items inside the cart
  const totalCartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="min-h-screen flex flex-col font-sans bg-brand-cream-light text-brand-charcoal antialiased overflow-x-hidden w-full max-w-full relative">
      {/* 1. Header Navigation Bar */}
      <Navbar
        cartCount={totalCartCount}
        onOpenCart={() => setIsCartOpen(true)}
        activeSection={activeSection}
      />

      {/* 2. Hero Interactive Banner Panel */}
      <main className="flex-grow">
        <Hero
          onLihatMenuClick={() => scrollToSection('menu')}
          onPesanWhatsAppClick={() => scrollToSection('menu')}
        />

        {/* 3. Best Seller Highlight cards section */}
        <BestSellers
          cart={cart}
          onAddToCart={handleAddToCart}
          onUpdateQty={handleUpdateQty}
          onRemoveItem={handleRemoveItem}
        />

        {/* 4. Quality values highlights section */}
        <WhyChooseUs />

        {/* 5. Complete interactive Food catalog */}
        <FullMenu
          cart={cart}
          onAddToCart={handleAddToCart}
          onUpdateQty={handleUpdateQty}
          onRemoveItem={handleRemoveItem}
        />

        {/* 6. Why WhatsApp explanatory section (Anti markup application) */}
        <WhyWhatsApp />

        {/* 7. Platform availability indicators (Social proof tags) */}
        <Platforms />

        {/* 8. Specially compiled weekly promo bundles */}
        <PromoSection
          cart={cart}
          onAddToCart={handleAddToCart}
          onUpdateQty={handleUpdateQty}
          onRemoveItem={handleRemoveItem}
        />

        {/* 9. Live mockup Instagram content and Organic processes */}
        <InstagramFeed />

        {/* 10. Warm Story telling corporate employee narrative */}
        <AboutUs />

        {/* 11. Customer feedback rating testinonials slider */}
        <Testimonials />

        {/* 12. Accordion FAQ container */}
        <div id="faq-section">
          <Faq />
        </div>

        {/* 13. Direct Outlets coordinates, operating hours, and large order panel */}
        <Contact
          onPesanSekarangClick={() => {
            const generalText = 'Halo kak, saya mau pesan Take Away dimsum suki premium di Outlet Yusuki hari ini!';
            window.open(`https://wa.me/6282123456789?text=${encodeURIComponent(generalText)}`, '_blank');
          }}
        />
      </main>

      {/* 14. Responsive minimal footer component */}
      <Footer />

      {/* 15. Shared Checkout Cart panel and dynamic floating CTA buttons */}
      <FloatingCartAndWA
        cartItems={cart}
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        onUpdateQty={handleUpdateQty}
        onRemoveItem={handleRemoveItem}
        onClearCart={handleClearCart}
        onOpenCart={() => setIsCartOpen(true)}
      />
    </div>
  );
}
