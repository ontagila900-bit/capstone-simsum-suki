/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useMemo } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import BestSellers from './components/BestSellers';
import FullMenu from './components/FullMenu';
import WhyWhatsApp from './components/WhyWhatsApp';
import Platforms from './components/Platforms';
import InstagramFeed from './components/InstagramFeed';
import WhyChooseUs from './components/WhyChooseUs';
import Testimonials from './components/Testimonials';
import AboutUs from './components/AboutUs';
import Faq from './components/Faq';
import Contact from './components/Contact';
import Footer from './components/Footer';
import FloatingCartAndWA from './components/FloatingCartAndWA';
import ProductDetailModal from './components/ProductDetailModal';
import AdminPanel from './components/AdminPanel';
import { db } from './firebase';
import { collection, doc, onSnapshot } from 'firebase/firestore';
import { MenuItem, CartItem, AppSettings, Testimonial, InstagramPost, TikTokVideoSim } from './types';
import { MENU_ITEMS } from './data/menu';

export default function App() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('home');
  const [selectedProduct, setSelectedProduct] = useState<MenuItem | null>(null);

  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [logoUrl, setLogoUrl] = useState<string>('');
  const [isAdminOpen, setIsAdminOpen] = useState(false);

  const [appSettings, setAppSettings] = useState<AppSettings>({});
  const [dbTestimonials, setDbTestimonials] = useState<Testimonial[]>([]);
  const [dbInstagramPosts, setDbInstagramPosts] = useState<InstagramPost[]>([]);
  const [dbTikTokPosts, setDbTikTokPosts] = useState<TikTokVideoSim[]>([]);

  // Synchronize dynamic brand logo settings and products from Firestore in real-time
  const unifiedMenuItems = useMemo(() => {
    const dbMap = new Map<string, MenuItem>();
    menuItems.forEach((item) => {
      dbMap.set(item.id, item);
    });

    const mergedList: MenuItem[] = [];
    const processedIds = new Set<string>();

    MENU_ITEMS.forEach((staticItem) => {
      processedIds.add(staticItem.id);
      if (dbMap.has(staticItem.id)) {
        const dbItem = dbMap.get(staticItem.id)!;
        if (!dbItem.isDeleted) {
          mergedList.push(dbItem);
        }
      } else {
        mergedList.push(staticItem);
      }
    });

    dbMap.forEach((dbItem) => {
      if (!processedIds.has(dbItem.id)) {
        if (!dbItem.isDeleted) {
          mergedList.push(dbItem);
        }
      }
    });

    return mergedList;
  }, [menuItems]);

  // Synchronize menuItems from Firestore in real-time
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'menu_items'), (snapshot) => {
      const items: MenuItem[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        if (data) {
          items.push({
            ...data,
            id: docSnap.id, // Overwrite or populate id using docSnap.id to prevent undefined/duplicate keys
          } as MenuItem);
        }
      });
      setMenuItems(items);
    }, (error) => {
      console.error("Firestore Listen error: ", error);
    });
    return () => unsubscribe();
  }, []);

  // Synchronize dynamic brand settings and other parameters
  useEffect(() => {
    const unsubscribe = onSnapshot(doc(db, 'settings', 'app'), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data() as AppSettings;
        setAppSettings(data);
        if (data.logoUrl) {
          setLogoUrl(data.logoUrl);
        }
      }
    }, (error) => {
      console.error("Firestore settings load error: ", error);
    });
    return () => unsubscribe();
  }, []);

  // Synchronize testimonials from Firestore
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'testimonials'), (snapshot) => {
      const items: Testimonial[] = [];
      snapshot.forEach((docSnap) => {
        items.push({
          ...docSnap.data(),
          id: docSnap.id,
        } as Testimonial);
      });
      setDbTestimonials(items);
    }, (error) => {
      console.error("Firestore testimonials error: ", error);
    });
    return () => unsubscribe();
  }, []);

  // Synchronize instagram posts from Firestore
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'instagram_posts'), (snapshot) => {
      const items: InstagramPost[] = [];
      snapshot.forEach((docSnap) => {
        items.push({
          ...docSnap.data(),
          id: docSnap.id,
        } as InstagramPost);
      });
      setDbInstagramPosts(items);
    }, (error) => {
      console.error("Firestore instagram posts error: ", error);
    });
    return () => unsubscribe();
  }, []);

  // Synchronize tiktok posts from Firestore
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'tiktok_posts'), (snapshot) => {
      const items: TikTokVideoSim[] = [];
      snapshot.forEach((docSnap) => {
        items.push({
          ...docSnap.data(),
          id: docSnap.id,
        } as TikTokVideoSim);
      });
      setDbTikTokPosts(items);
    }, (error) => {
      console.error("Firestore tiktok posts error: ", error);
    });
    return () => unsubscribe();
  }, []);

  // Monitor screen positions using IntersectionObserver to update active navigation tabs
  useEffect(() => {
    const handleScrollFallback = () => {
      if (window.scrollY < 80) {
        setActiveSection('home');
      }
    };
    window.addEventListener('scroll', handleScrollFallback, { passive: true });

    const sections = ['home', 'menu', 'promo', 'tentang', 'kontak'];
    const observers = sections.map((id) => {
      const element = document.getElementById(id);
      if (!element) return null;

      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            if (id === 'home' || window.scrollY >= 80) {
              setActiveSection(id);
            }
          }
        },
        { threshold: 0.25, rootMargin: '-80px 0px -40% 0px' }
      );

      observer.observe(element);
      return { observer, element };
    });

    return () => {
      window.removeEventListener('scroll', handleScrollFallback);
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
        logoUrl={logoUrl}
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
          onItemClick={setSelectedProduct}
          menuItems={unifiedMenuItems}
        />

        {/* 4. Quality values highlights section */}
        <WhyChooseUs />

        {/* 5. Complete interactive Food catalog */}
        <FullMenu
          cart={cart}
          onAddToCart={handleAddToCart}
          onUpdateQty={handleUpdateQty}
          onRemoveItem={handleRemoveItem}
          onItemClick={setSelectedProduct}
          menuItems={unifiedMenuItems}
        />

        {/* 6. Why WhatsApp explanatory section (Anti markup application) */}
        <WhyWhatsApp />

        {/* 7. Platform availability indicators (Social proof tags) */}
        <Platforms />

        {/* 9. Live mockup Instagram content and Organic processes */}
        <InstagramFeed
          appSettings={appSettings}
          instagramPosts={dbInstagramPosts}
          tiktokPosts={dbTikTokPosts}
        />

        {/* 10. Warm Story telling corporate employee narrative */}
        <AboutUs />

        {/* 11. Customer feedback rating testinonials slider */}
        <Testimonials appSettings={appSettings} />

        {/* 12. Accordion FAQ container */}
        <div id="faq-section">
          <Faq />
        </div>

        {/* 13. Direct Outlets coordinates, operating hours, and large order panel */}
        <Contact
          appSettings={appSettings}
          onPesanSekarangClick={() => {
            const generalText = 'Halo kak, saya mau pesan Take Away di Suki Yusuki hari ini!';
            const waNum = appSettings.whatsappNumber || '6281818758265';
            window.open(`https://wa.me/${waNum}?text=${encodeURIComponent(generalText)}`, '_blank');
          }}
        />
      </main>

      {/* 14. Responsive minimal footer component */}
      <Footer logoUrl={logoUrl} />

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

      {/* 16. Dynamic Food Detail Popover Modal Overlay */}
      <ProductDetailModal
        item={selectedProduct}
        onClose={() => setSelectedProduct(null)}
        cart={cart}
        onAddToCart={handleAddToCart}
        onUpdateQty={handleUpdateQty}
        onRemoveItem={handleRemoveItem}
      />

      {/* 17. Tiny persistent Administrative Dashboard Launcher key */}
      <div className="fixed bottom-6 left-6 z-40 select-none">
        <button
          onClick={() => setIsAdminOpen(true)}
          className="w-11 h-11 rounded-full bg-brand-charcoal hover:bg-rose-600 text-white flex items-center justify-center shadow-lg transition-all active:scale-95 duration-300 border border-zinc-800 cursor-pointer group"
          title="Buka Konsol Admin"
        >
          {/* We inline a simple Lock SVG icon to avoid importing Lucide Lock */}
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="group-hover:scale-110 transition-transform"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
          <span className="absolute left-13 bg-brand-charcoal text-white text-[10px] uppercase font-bold py-1.5 px-3 rounded-lg shadow-md border border-zinc-805 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none font-mono">
            Dashboard Admin
          </span>
        </button>
      </div>

      {/* 18. Dynamic Database Management Console */}
      <AdminPanel
        isOpen={isAdminOpen}
        onClose={() => setIsAdminOpen(false)}
        menuItems={unifiedMenuItems}
        dbMenuItems={menuItems}
        logoUrl={logoUrl}
        onLogoChange={setLogoUrl}
        appSettings={appSettings}
        testimonials={dbTestimonials}
        instagramPosts={dbInstagramPosts}
        tiktokPosts={dbTikTokPosts}
      />
    </div>
  );
}
