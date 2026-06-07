/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useMemo } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import BestSellers from './components/BestSellers';
import FullMenu from './components/FullMenu';
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
import { collection, doc, onSnapshot, addDoc } from 'firebase/firestore';
import { MenuItem, CartItem, AppSettings, Testimonial, FaqItem, InfoTambahanItem } from './types';
import { MENU_ITEMS, FAQS, DEFAULT_INFO_TAMBAHAN } from './data/menu';

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
  const [dbFaqs, setDbFaqs] = useState<FaqItem[]>([]);
  const [dbInfoTambahan, setDbInfoTambahan] = useState<InfoTambahanItem[]>([]);

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

  // Synchronize FAQs from Firestore
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'faqs'), (snapshot) => {
      const items: FaqItem[] = [];
      snapshot.forEach((docSnap) => {
        items.push({
          ...docSnap.data(),
          id: docSnap.id,
        } as FaqItem);
      });
      setDbFaqs(items);
    }, (error) => {
      console.error("Firestore FAQs error: ", error);
    });
    return () => unsubscribe();
  }, []);

  // Synchronize Info Tambahan from Firestore
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'info_tambahan'), (snapshot) => {
      const items: InfoTambahanItem[] = [];
      snapshot.forEach((docSnap) => {
        items.push({
          ...docSnap.data(),
          id: docSnap.id,
        } as InfoTambahanItem);
      });
      setDbInfoTambahan(items);
    }, (error) => {
      console.error("Firestore Info Tambahan error: ", error);
    });
    return () => unsubscribe();
  }, []);

  // Compute merged lists where database states override/add onto local defaults
  const mergedFaqs = useMemo(() => {
    const merged = [...dbFaqs];
    FAQS.forEach((defFaq) => {
      const match = dbFaqs.find((dbFaq) => dbFaq.id === defFaq.id);
      if (!match) {
        merged.push(defFaq);
      }
    });
    return merged.filter((faq) => !faq.isDeleted);
  }, [dbFaqs]);

  const mergedInfoTambahan = useMemo(() => {
    const merged = [...dbInfoTambahan];
    DEFAULT_INFO_TAMBAHAN.forEach((defInfo) => {
      const match = dbInfoTambahan.find((dbInfo) => dbInfo.id === defInfo.id);
      if (!match) {
        merged.push(defInfo);
      }
    });
    return merged.filter((item) => !item.isDeleted);
  }, [dbInfoTambahan]);

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

  // Real-time analytics traffic tracking
  useEffect(() => {
    const logWebVisit = async () => {
      try {
        const hasVisited = sessionStorage.getItem('suki_yusuki_active_session_visited');
        if (!hasVisited) {
          sessionStorage.setItem('suki_yusuki_active_session_visited', 'true');
          await addDoc(collection(db, 'analytics_events'), {
            type: 'web_visit',
            timestamp: Date.now()
          });
        }
      } catch (e) {
        console.error('Error logging web visit:', e);
      }
    };
    logWebVisit();
  }, []);

  const handleProductClick = async (product: MenuItem | null) => {
    setSelectedProduct(product);
    if (product) {
      try {
        await addDoc(collection(db, 'analytics_events'), {
          type: 'product_click',
          itemId: product.id,
          itemName: product.name,
          timestamp: Date.now()
        });
      } catch (e) {
        console.error('Error logging product click:', e);
      }
    }
  };

  // Cart Management Operations
  const handleAddToCart = async (item: MenuItem, qty: number) => {
    setCart((prevCart) => {
      const existing = prevCart.find((ci) => ci.menuItem.id === item.id);
      if (existing) {
        return prevCart.map((ci) =>
          ci.menuItem.id === item.id ? { ...ci, quantity: ci.quantity + qty } : ci
        );
      }
      return [...prevCart, { menuItem: item, quantity: qty }];
    });

    try {
      await addDoc(collection(db, 'analytics_events'), {
        type: 'add_to_cart',
        itemId: item.id,
        itemName: item.name,
        quantity: qty,
        timestamp: Date.now()
      });
    } catch (e) {
      console.error('Error logging add to cart event:', e);
    }
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
          appSettings={appSettings}
        />

        {/* 3. Best Seller Highlight cards section */}
        <BestSellers
          cart={cart}
          onAddToCart={handleAddToCart}
          onUpdateQty={handleUpdateQty}
          onRemoveItem={handleRemoveItem}
          onItemClick={handleProductClick}
          menuItems={unifiedMenuItems}
        />

        {/* 5. Complete interactive Food catalog */}
        <FullMenu
          cart={cart}
          onAddToCart={handleAddToCart}
          onUpdateQty={handleUpdateQty}
          onRemoveItem={handleRemoveItem}
          onItemClick={handleProductClick}
          menuItems={unifiedMenuItems}
        />

        {/* 4. Quality & WhatsApp direct order values highlights section */}
        <WhyChooseUs dbInfoTambahan={mergedInfoTambahan} />

        {/* 10. Warm Story telling corporate employee narrative */}
        <AboutUs appSettings={appSettings} />

        {/* 11. Customer feedback rating testinonials slider */}
        <Testimonials appSettings={appSettings} />

        {/* 12. Accordion FAQ container */}
        <div id="faq-section">
          <Faq dbFaqs={mergedFaqs} />
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
      <Footer logoUrl={logoUrl} onOpenAdmin={() => setIsAdminOpen(true)} />

      {/* 15. Shared Checkout Cart panel and dynamic floating CTA buttons */}
      <FloatingCartAndWA
        cartItems={cart}
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        onUpdateQty={handleUpdateQty}
        onRemoveItem={handleRemoveItem}
        onClearCart={handleClearCart}
        onOpenCart={() => setIsCartOpen(true)}
        appSettings={appSettings}
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
        dbFaqs={mergedFaqs}
        dbInfoTambahan={mergedInfoTambahan}
      />
    </div>
  );
}
