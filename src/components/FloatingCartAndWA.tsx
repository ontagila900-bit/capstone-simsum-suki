/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useRef, useMemo, useEffect } from 'react';
import { ShoppingBag, X, MessageSquare, Plus, Minus, Trash2, ArrowRight, Check, Send, Receipt, Camera, Download, Image } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { CartItem, AppSettings } from '../types';
import { db } from '../firebase';
import { doc, setDoc, addDoc, collection } from 'firebase/firestore';
import { toPng } from 'html-to-image';

interface FloatingCartAndWAProps {
  cartItems: CartItem[];
  isOpen: boolean;
  onClose: () => void;
  onUpdateQty: (id: string, delta: number) => void;
  onRemoveItem: (id: string) => void;
  onClearCart: () => void;
  onOpenCart: () => void;
  appSettings?: AppSettings;
}

export default function FloatingCartAndWA({
  cartItems,
  isOpen,
  onClose,
  onUpdateQty,
  onRemoveItem,
  onClearCart,
  onOpenCart,
  appSettings,
}: FloatingCartAndWAProps) {
  const [orderMethod, setOrderMethod] = useState<'TAKE_AWAY' | 'DINE_IN'>('TAKE_AWAY');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'TUNAI' | 'QRIS' | 'BAYAR_DI_TEMPAT'>('BAYAR_DI_TEMPAT');
  const [pickupTime, setPickupTime] = useState('');
  const [arrivalTime, setArrivalTime] = useState('');
  const [attemptedCheckout, setAttemptedCheckout] = useState(false);

  // Parsing shop hours dynamically to enforce min/max boundary constraints
  const shopHours = useMemo(() => {
    let openTime = '16:30';
    let closeTime = '22:00';
    let hasSetClose = false;

    const opHoursStr = appSettings?.operatingHours;
    const opHoursSubStr = appSettings?.operatingHoursSub;

    if (opHoursStr) {
      const cleanStr = opHoursStr.replace(/\./g, ':');
      const matches = cleanStr.match(/(\d{1,2}):(\d{2})/g);
      if (matches && matches.length >= 1) {
        openTime = matches[0].split(':').map(x => x.padStart(2, '0')).join(':');
        if (matches.length >= 2) {
          closeTime = matches[1].split(':').map(x => x.padStart(2, '0')).join(':');
          hasSetClose = true;
        }
      }
    }

    if (!hasSetClose && opHoursSubStr) {
      const cleanSub = opHoursSubStr.replace(/\./g, ':');
      const subMatches = cleanSub.match(/(\d{1,2}):(\d{2})/g);
      if (subMatches && subMatches.length >= 1) {
        closeTime = subMatches[0].split(':').map(x => x.padStart(2, '0')).join(':');
        hasSetClose = true;
      }
    }

    if (!hasSetClose) {
      closeTime = '23:59';
    }

    return { openTime, closeTime };
  }, [appSettings?.operatingHours, appSettings?.operatingHoursSub]);

  // Set default times matching operating openTime
  useEffect(() => {
    if (shopHours.openTime) {
      if (!pickupTime) {
        setPickupTime(shopHours.openTime);
      }
      if (!arrivalTime) {
        setArrivalTime(shopHours.openTime);
      }
    }
  }, [shopHours.openTime]);

  const activeTime = orderMethod === 'TAKE_AWAY' ? pickupTime : arrivalTime;
  const isTimeInvalid = activeTime.trim() !== '' && (activeTime < shopHours.openTime || activeTime > shopHours.closeTime);
  
  // Automatic Receipt Receipt System States
  const [showReceipt, setShowReceipt] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [receiptDownloaded, setReceiptDownloaded] = useState(false);
  const receiptRef = useRef<HTMLDivElement>(null);
  const [currentReceipt, setCurrentReceipt] = useState<{
    invoiceNo: string;
    orderDate: string;
    name: string;
    phone: string;
    method: 'TAKE_AWAY' | 'DINE_IN';
    payment: 'TUNAI' | 'QRIS' | 'BAYAR_DI_TEMPAT';
    total: number;
    items: CartItem[];
    pickupTime?: string;
    arrivalTime?: string;
  } | null>(null);

  const totalCount = cartItems.reduce((acc, current) => acc + current.quantity, 0);
  const totalPrice = cartItems.reduce((acc, current) => acc + (current.menuItem.price * current.quantity), 0);
  
  // Creates and formats the printed receipt system before opening WhatsApp
  const handleCheckoutWA = async () => {
    setAttemptedCheckout(true);
    if (!customerName.trim() || !customerPhone.trim() || customerPhone.length < 10) {
      return;
    }

    const timeValue = orderMethod === 'TAKE_AWAY' ? pickupTime : arrivalTime;
    if (!timeValue.trim() || isTimeInvalid) {
      return;
    }

    if (cartItems.length === 0) return;

    // Generate beautiful receipt parameters
    const rand = Math.floor(1000 + Math.random() * 9000);
    const now = new Date();
    const invoiceNo = `YSK-${now.getFullYear()}${(now.getMonth() + 1).toString().padStart(2, '0')}${now.getDate().toString().padStart(2, '0')}-${rand}`;
    const formattedDate = now.toLocaleDateString('id-ID', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }) + '  ' + now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB';

    const receiptObj = {
      invoiceNo,
      orderDate: formattedDate,
      name: customerName.trim(),
      phone: customerPhone.trim(),
      method: orderMethod,
      payment: orderMethod === 'TAKE_AWAY' ? 'BAYAR_DI_TEMPAT' : paymentMethod,
      total: totalPrice,
      items: cartItems.map((item) => ({
        menuItem: {
          id: item.menuItem.id,
          name: item.menuItem.name,
          category: item.menuItem.category,
          price: item.menuItem.price,
        },
        quantity: item.quantity,
      })),
      pickupTime: orderMethod === 'TAKE_AWAY' ? pickupTime : (arrivalTime || pickupTime),
      arrivalTime: orderMethod === 'DINE_IN' ? arrivalTime : (pickupTime || arrivalTime),
    };

    setCurrentReceipt(receiptObj);

    // Persist Invoice to Firestore under "invoices" collection
    try {
      await setDoc(doc(db, 'invoices', invoiceNo), {
        ...receiptObj,
        status: 'Baru dibuat',
        clickWA: false,
        createdAt: now.getTime(),
      });

      // Log invoice creation to analytics events in Firestore
      await addDoc(collection(db, 'analytics_events'), {
        type: 'create_invoice',
        invoiceNo,
        timestamp: now.getTime()
      });

      // Log revenue recording (pencatatan omzet)
      await addDoc(collection(db, 'analytics_events'), {
        type: 'pencatatan_omzet',
        invoiceNo,
        amount: totalPrice,
        customerName: customerName.trim(),
        timestamp: now.getTime()
      });
    } catch (e) {
      console.error('Error logging invoice to firestore:', e);
    }

    // Toggle overlay
    setReceiptDownloaded(false);
    setShowReceipt(true);
  };

  // Perform actual redirect to WhatsApp using current receipt details
  const handleSendWAFromReceipt = async () => {
    if (!currentReceipt || !receiptDownloaded) return;

    // Update status in Firestore and log a conversion click
    try {
      await setDoc(doc(db, 'invoices', currentReceipt.invoiceNo), {
        status: 'Dikirim ke WhatsApp',
        clickWA: true
      }, { merge: true });

      await addDoc(collection(db, 'wa_clicks'), {
        type: 'invoice',
        invoiceNo: currentReceipt.invoiceNo,
        timestamp: Date.now(),
      });

      // Log WhatsApp checkout click to analytics events in Firestore
      await addDoc(collection(db, 'analytics_events'), {
        type: 'send_wa',
        invoiceNo: currentReceipt.invoiceNo,
        timestamp: Date.now()
      });
    } catch (e) {
      console.error('Error logging WhatsApp conversion click:', e);
    }

    let orderList = 'Halo kak, saya ingin memesan di Suki Yusuki:\n\n';
    orderList += `🧾 *INVOICE:* ${currentReceipt.invoiceNo}\n`;
    orderList += `⚠️ *STATUS ORDER:* FIX ORDER (Sudah Kirim via WA, Mohon Segera Dibuat/Diproses Sekarang)\n`;
    orderList += `👤 *NAMA PEMESAN:* ${currentReceipt.name}\n`;
    orderList += `📞 *NO. TELEPON:* ${currentReceipt.phone}\n`;
    orderList += `🍽️ *METODE PESANAN:* ${currentReceipt.method === 'TAKE_AWAY' ? 'Take Away (Ambil Mandiri)' : 'Dine In (Makan di Sini)'}\n`;
    
    orderList += `🕒 *ESTIMASI JAM KEDATANGAN:* ${currentReceipt.arrivalTime || currentReceipt.pickupTime || '-'} WIB\n`;
    orderList += `🕒 *ESTIMASI JAM PENGAMBILAN:* ${currentReceipt.pickupTime || currentReceipt.arrivalTime || '-'} WIB\n`;

    let paymentLabel = 'Tunai (Cash)';
    if (currentReceipt.payment === 'BAYAR_DI_TEMPAT') {
      paymentLabel = 'Bayar di Tempat (Tunai / QRIS)';
    } else if (currentReceipt.payment === 'QRIS') {
      paymentLabel = 'QRIS (Cashless)';
    }
    orderList += `💳 *METODE PEMBAYARAN:* ${paymentLabel}\n\n`;

    orderList += `*RINCIAN MENU:*\n`;
    currentReceipt.items.forEach((item) => {
      const formattedItemPrice = new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
      }).format(item.menuItem.price * item.quantity);
      
      orderList += `- ${item.quantity}x ${item.menuItem.name} (${formattedItemPrice})\n`;
    });

    const formattedTotal = new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(currentReceipt.total);

    let suffix = '';
    if (currentReceipt.method === 'TAKE_AWAY') {
      suffix = `\n*Sistem Pembayaran:* Bayar di Tempat (Tunai / QRIS)\n\nEstimasi kedatangan kami pukul *${currentReceipt.arrivalTime || currentReceipt.pickupTime} WIB* untuk mengambil pesanan dingin/hangat pukul *${currentReceipt.pickupTime || currentReceipt.arrivalTime} WIB*. Karena invoice ini sudah kami kirim ke WA, pesanan harap langsung dibuat ya kak agar hangat pas sampai toko. Terima kasih banyak!`;
    } else {
      let paymentText = 'Tunai (Cash)';
      if (currentReceipt.payment === 'BAYAR_DI_TEMPAT') {
        paymentText = 'Bayar di Tempat (Tunai / QRIS)';
      } else if (currentReceipt.payment === 'QRIS') {
        paymentText = 'QRIS (Cashless)';
      }
      suffix = `\n*Sistem Pembayaran:* ${paymentText}\n\nEstimasi kedatangan kami pukul *${currentReceipt.arrivalTime || currentReceipt.pickupTime} WIB* dan ingin porsi pesanan disiapkan siap santap sekitar pukul *${currentReceipt.pickupTime || currentReceipt.arrivalTime} WIB*. Mohon langsung disiapkan meja dan makanannya hangat-hangat ya kak. Terima kasih banyak!`;
    }

    orderList += `\n*TOTAL TAGIHAN:* ${formattedTotal}${suffix}`;
    const encoded = encodeURIComponent(orderList);
    const waUrl = `https://wa.me/6281818758265?text=${encoded}`;
    
    // On iOS Safari, window.open inside async callback gets blocked; using window.location.href bypasses it
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    if (isIOS) {
      window.location.href = waUrl;
    } else {
      window.open(waUrl, '_blank');
    }
    
    // Clear cart, close receipt and close drawer to end order successfully
    onClearCart();
    setShowReceipt(false);
    onClose();
  };

  const handleExportReceiptPNG = async () => {
    if (!receiptRef.current) return;
    setIsExporting(true);
    try {
      // Force a slight delay to ensure UI states are perfectly flush and settled
      await new Promise((resolve) => setTimeout(resolve, 150));
      
      const dataUrl = await toPng(receiptRef.current, {
        backgroundColor: '#fafbf9', // Matches the thermal print background tone
        style: {
          transform: 'scale(1)',
          transformOrigin: 'top left',
          borderRadius: '0px', // Crisp clean straight edge on image format
        },
        pixelRatio: 2.5, // Crisp, ultra-sharp text at 2.5x density (perfect for readabilities)
      });

      const link = document.createElement('a');
      link.download = `SukiYusuki_Receipt_${currentReceipt?.invoiceNo || 'Order'}.png`;
      link.href = dataUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setReceiptDownloaded(true);
      // Log receipt download event to Firestore for real-time tracking
      try {
        await addDoc(collection(db, 'analytics_events'), {
          type: 'download_receipt',
          invoiceNo: currentReceipt?.invoiceNo || '',
          timestamp: Date.now()
        });
      } catch (e) {
        console.error('Error logging receipt download event:', e);
      }
    } catch (err) {
      console.error('Ada masalah ketika mengunduh gambar receipt:', err);
    } finally {
      setIsExporting(false);
    }
  };

  const handleQuickGeneralWA = async () => {
    // Log a general WhatsApp click
    try {
      await addDoc(collection(db, 'wa_clicks'), {
        type: 'general',
        timestamp: Date.now(),
      });
    } catch (e) {
      console.error('Error logging general WhatsApp click:', e);
    }

    const generalText = 'Halo kak, saya mau tanya-tanya menu Suki Yusuki hari ini ada yang ready apa saja ya?';
    const waUrl = `https://wa.me/6281818758265?text=${encodeURIComponent(generalText)}`;
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    if (isIOS) {
      window.location.href = waUrl;
    } else {
      window.open(waUrl, '_blank');
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  return (
    <>
      {/* Floating Buttons Control Container (Bottom-Right of page, mobile-first accessible!) */}
      <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-45 flex flex-col items-end gap-3 select-none">
        
        {/* 1. Shopping Bag Float (Appears when cart count > 0) */}
        <AnimatePresence>
          {totalCount > 0 && (
            <motion.button
              initial={{ scale: 0, y: 30 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0, y: 30 }}
              onClick={onOpenCart}
              className="bg-brand-charcoal hover:bg-zinc-800 text-white rounded-full p-3.5 sm:p-4 shadow-2xl flex items-center gap-3 border-2 border-white cursor-pointer relative"
              aria-label="Open Cart Drawer"
            >
              <div className="relative">
                <ShoppingBag className="w-5 h-5 sm:w-6 sm:h-6 text-amber-100" />
                <span className="absolute -top-3.5 -right-3.5 bg-primary-orange text-white text-[10px] font-black w-5.5 h-5.5 rounded-full flex items-center justify-center animate-bounce border-2 border-white shadow-md font-mono">
                  {totalCount}
                </span>
              </div>
              <span className="text-xs font-sans font-bold pr-1.5 hidden sm:inline">
                Lihat Keranjang ({formatPrice(totalPrice)})
              </span>
            </motion.button>
          )}
        </AnimatePresence>

        {/* 2. Floating WhatsApp Button (Standard always active, with green pulse) */}
        <motion.button
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          onClick={handleQuickGeneralWA}
          className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-full p-3.5 sm:p-4.5 shadow-2xl flex items-center justify-center border-2 border-white cursor-pointer group hover:rotate-12 transition-transform duration-300 relative"
          aria-label="Chat via WhatsApp"
        >
          {/* Pulsating Ring backdrop for viral traction */}
          <span className="absolute inset-0 rounded-full bg-emerald-500/35 scale-110 animate-ping" />
          <MessageSquare className="w-5.5 h-5.5 sm:w-6.5 sm:h-6.5 fill-white text-emerald-500 relative z-10" />
        </motion.button>

      </div>

      {/* Modern Slideout Side Drawer Panel */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Dark blur dynamic backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 pointer-events-auto"
            />

            {/* Slider Panel Box */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 27, stiffness: 220 }}
              className="fixed top-0 right-0 h-full w-full sm:w-[450px] bg-brand-cream-light text-brand-charcoal z-50 flex flex-col shadow-2xl border-l border-zinc-200"
            >
              
              {/* Drawer Header */}
              <div className="bg-white border-b border-zinc-100 p-5 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="bg-primary-orange text-white p-2 rounded-xl shadow-sm">
                    <ShoppingBag className="w-5 h-5 text-amber-100" />
                  </div>
                  <div>
                    <h3 className="font-display font-black text-base text-brand-charcoal leading-none">
                      Keranjang Suki Yusuki
                    </h3>
                    <p className="text-[10px] text-gray-400 font-bold uppercase font-mono mt-1">
                      {totalCount} Porsi Terpilih
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2.5">
                  {cartItems.length > 0 && (
                    <button
                      onClick={onClearCart}
                      className="text-[10px] bg-rose-50 hover:bg-rose-100 border border-rose-200 font-bold px-2 py-1 rounded-lg text-rose-600 transition-colors cursor-pointer"
                    >
                      Reset
                    </button>
                  )}
                  <button
                    onClick={onClose}
                    className="p-1.5 rounded-lg bg-zinc-100 hover:bg-zinc-200 cursor-pointer"
                  >
                    <X className="w-5 h-5 text-zinc-600" />
                  </button>
                </div>
              </div>

              {/* Items Container List (Scrollable) */}
              <div className="flex-grow overflow-y-auto p-5 space-y-4">
                {cartItems.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center p-6 text-center select-none">
                    <div className="w-20 h-20 bg-brand-cream rounded-full flex items-center justify-center p-3 text-zinc-300 mb-4 border border-dashed border-zinc-200">
                      <ShoppingBag className="w-10 h-10" />
                    </div>
                    <p className="font-sans font-bold text-sm text-brand-charcoal/60">
                      Keranjang Anda Masih Kosong
                    </p>
                    <p className="text-xs text-brand-charcoal/45 mt-1 max-w-xs font-medium">
                      Pilih aneka dimsum goreng, dimsum mentai, suki, atau paket kombinasi lezat kami di menu!
                    </p>
                    <button
                      onClick={onClose}
                      className="mt-5 bg-primary-orange text-white text-xs font-bold px-5 py-2.5 rounded-xl shadow-md cursor-pointer"
                    >
                      Mulai Belanja &rarr;
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="space-y-4">
                      {cartItems.map((item, idx) => (
                        <motion.div
                          layout
                          key={`${item.menuItem.id}-${idx}`}
                          className="bg-white rounded-2xl p-4 border border-zinc-100 shadow-sm flex items-center gap-4 group hover:border-brand-cream-dark transition-colors"
                        >
                          {/* Item Image */}
                          <div className="w-16 h-16 rounded-xl overflow-hidden bg-brand-cream-dark flex-shrink-0">
                            <img
                              src={item.menuItem.image}
                              alt={item.menuItem.name}
                              className="w-full h-full object-cover"
                              referrerPolicy="no-referrer"
                            />
                          </div>

                          {/* Details */}
                          <div className="flex-grow min-w-0">
                            <h4 className="text-xs sm:text-sm font-bold text-brand-charcoal truncate font-display mb-0.5">
                              {item.menuItem.name}
                            </h4>
                            <p className="text-xs font-sans text-brand-charcoal/50 leading-none mb-2 font-medium">
                              {item.menuItem.category.replace('DIMSUM ', '')}
                            </p>
                            
                            <span className="font-display font-extrabold text-[#ea580c] text-xs sm:text-sm">
                              {formatPrice(item.menuItem.price)}
                            </span>
                          </div>

                          {/* Modify Tools row (Counter modifier + trash element) */}
                          <div className="flex flex-col items-end gap-2">
                            {/* Remove item bin */}
                            <button
                              onClick={() => onRemoveItem(item.menuItem.id)}
                              className="p-1 text-zinc-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                              aria-label="Remove item"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>

                            {/* Counter */}
                            <div className="flex items-center bg-zinc-50 border border-zinc-200 rounded-lg p-0.5 shadow-sm">
                              <button
                                onClick={() => onUpdateQty(item.menuItem.id, -1)}
                                className="w-5 h-5 bg-white hover:bg-zinc-100 border border-zinc-200 text-zinc-600 rounded flex items-center justify-center cursor-pointer"
                                aria-label="Decrease quantity"
                              >
                                <Minus className="w-3" />
                              </button>
                              <span className="w-6 text-center text-xs font-bold text-zinc-700 font-mono">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() => onUpdateQty(item.menuItem.id, 1)}
                                className="w-5 h-5 bg-white hover:bg-zinc-100 border border-zinc-200 text-zinc-600 rounded flex items-center justify-center cursor-pointer"
                                aria-label="Increase quantity"
                              >
                                <Plus className="w-3" />
                              </button>
                            </div>
                          </div>

                        </motion.div>
                      ))}
                    </div>

                    {/* Customer Information Form & Choice Panel */}
                    <div className="bg-white rounded-2xl p-5 border border-zinc-200 shadow-xs space-y-4 mt-6">
                      <div className="border-b border-zinc-100 pb-3">
                        <h4 className="font-display font-bold text-sm text-brand-charcoal flex items-center gap-1.5">
                          <span>📝 Informasi Pemesanan</span>
                        </h4>
                        <p className="text-[10px] text-zinc-400 font-semibold font-sans">
                          Silakan isi data diri untuk konfirmasi & persiapan pesanan Anda
                        </p>
                      </div>

                      {/* Customer Name */}
                      <div className="space-y-1.5">
                        <label className="block text-[11px] font-bold text-zinc-600 font-sans">
                          Nama Lengkap <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={customerName}
                          onChange={(e) => setCustomerName(e.target.value)}
                          placeholder="Contoh: Budi Santoso"
                          className={`w-full bg-zinc-50 border ${
                            attemptedCheckout && !customerName.trim()
                              ? 'border-rose-500 focus:ring-1 focus:ring-rose-500 focus:border-rose-500'
                              : 'border-zinc-200 focus:ring-1 focus:ring-primary-orange focus:border-primary-orange'
                          } rounded-xl px-3.5 py-2.5 text-xs font-semibold focus:outline-none transition-all`}
                        />
                        {attemptedCheckout && !customerName.trim() && (
                          <p className="text-[10px] text-rose-500 font-bold">Nama wajib diisi!</p>
                        )}
                      </div>

                      {/* Customer Phone */}
                      <div className="space-y-1.5">
                        <label className="block text-[11px] font-bold text-zinc-600 font-sans">
                          Nomor Telepon / WhatsApp <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="tel"
                          required
                          value={customerPhone}
                          onChange={(e) => setCustomerPhone(e.target.value.replace(/\D/g, ''))}
                          placeholder="Contoh: 081234567890"
                          className={`w-full bg-zinc-50 border ${
                            attemptedCheckout && (!customerPhone.trim() || customerPhone.length < 10)
                              ? 'border-rose-500 focus:ring-1 focus:ring-rose-500 focus:border-rose-500'
                              : 'border-zinc-200 focus:ring-1 focus:ring-primary-orange focus:border-primary-orange'
                          } rounded-xl px-3.5 py-2.5 text-xs font-semibold focus:outline-none transition-all`}
                        />
                        {attemptedCheckout && !customerPhone.trim() && (
                          <p className="text-[10px] text-rose-500 font-bold">Nomor telepon wajib diisi!</p>
                        )}
                        {attemptedCheckout && customerPhone.trim() && customerPhone.length < 10 && (
                          <p className="text-[10px] text-rose-500 font-bold">Nomor telepon minimal harus 10 angka!</p>
                        )}
                      </div>

                      {/* Order Method Toggle */}
                      <div className="space-y-1.5 pt-1">
                        <span className="block text-[11px] font-bold text-zinc-600 font-sans">Pilihan Cara Makan</span>
                        <div className="grid grid-cols-2 gap-1.5 bg-zinc-100 p-1.5 rounded-xl border border-zinc-200">
                          <button
                            type="button"
                            onClick={() => {
                              setOrderMethod('TAKE_AWAY');
                              setPaymentMethod('BAYAR_DI_TEMPAT'); // Default to pay at counter / bayar di tempat for take away
                            }}
                            className={`py-2 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer text-center ${
                              orderMethod === 'TAKE_AWAY'
                                ? 'bg-brand-charcoal text-white shadow-xs'
                                : 'text-zinc-600 hover:text-brand-charcoal'
                            }`}
                          >
                            🛍️ Take Away
                          </button>
                          <button
                            type="button"
                            onClick={() => setOrderMethod('DINE_IN')}
                            className={`py-2 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer text-center ${
                              orderMethod === 'DINE_IN'
                                ? 'bg-brand-charcoal text-white shadow-xs'
                                : 'text-zinc-600 hover:text-brand-charcoal'
                            }`}
                          >
                            🍽️ Dine In (Makan di Sini)
                          </button>
                        </div>
                      </div>

                      {/* Pick-up / Arrival Time Input */}
                      <div className="space-y-1.5 pt-1 animate-fade-in">
                        <label className="block text-[11px] font-bold text-zinc-600 font-sans flex items-center gap-1">
                          <span>🕒 {orderMethod === 'TAKE_AWAY' ? 'Estimasi Jam Pengambilan' : 'Jam Kedatangan'}</span>
                          <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="time"
                          required
                          value={orderMethod === 'TAKE_AWAY' ? pickupTime : arrivalTime}
                          min={shopHours.openTime}
                          max={shopHours.closeTime}
                          onChange={(e) => {
                            if (orderMethod === 'TAKE_AWAY') {
                              setPickupTime(e.target.value);
                            } else {
                              setArrivalTime(e.target.value);
                            }
                          }}
                          className={`w-full bg-zinc-50 border ${
                            attemptedCheckout && (!(orderMethod === 'TAKE_AWAY' ? pickupTime : arrivalTime).trim() || isTimeInvalid)
                              ? 'border-rose-500 focus:ring-1 focus:ring-rose-500 focus:border-rose-500 font-bold text-rose-600'
                              : 'border-zinc-200 focus:ring-1 focus:ring-primary-orange focus:border-primary-orange'
                          } rounded-xl px-3.5 py-2.5 text-xs font-semibold focus:outline-none transition-all`}
                        />
                        
                        {/* Wording & description depending on Dine In or Take Away option */}
                        {orderMethod === 'TAKE_AWAY' ? (
                          <p className="text-[10px] text-zinc-400 font-medium leading-relaxed">
                            Estimasi jam pengambilan adalah jam dimana anda mengambil pemesanan anda. Jam operasional:{' '}
                            <span className="font-bold text-zinc-600 font-mono">{appSettings?.operatingHours || '16.30 - Selesai'}</span>
                          </p>
                        ) : (
                          <p className="text-[10px] text-zinc-400 font-medium leading-relaxed">
                            Jam kedatangan adalah jam dimana anda datang ke outlet kami dan melakukan pemesanan. Jam operasional:{' '}
                            <span className="font-bold text-zinc-600 font-mono">{appSettings?.operatingHours || '16.30 - Selesai'}</span>
                          </p>
                        )}

                        {attemptedCheckout && !(orderMethod === 'TAKE_AWAY' ? pickupTime : arrivalTime).trim() && (
                          <p className="text-[10px] text-rose-500 font-bold">
                            {orderMethod === 'TAKE_AWAY' ? 'Estimasi jam pengambilan wajib diisi!' : 'Jam kedatangan wajib diisi!'}
                          </p>
                        )}

                        {attemptedCheckout && isTimeInvalid && (
                          <p className="text-[10px] text-rose-500 font-bold">
                            Jam pelayanan harus di antara jam buka ({shopHours.openTime}) s/d tutup ({shopHours.closeTime === '23:59' ? 'Selesai' : shopHours.closeTime}).
                          </p>
                        )}
                      </div>

                      {/* Payment Method Selector */}
                      <div className="space-y-1.5 pt-1">
                        <span className="block text-[11px] font-bold text-zinc-600 font-sans font-medium">Pilihan Metode Pembayaran</span>
                        {orderMethod === 'TAKE_AWAY' ? (
                          <div className="bg-amber-50 border border-amber-200/60 rounded-xl p-3.5 space-y-2">
                            <div className="flex items-center gap-1.5">
                              <span className="bg-[#ea580c] text-white text-[9px] font-black px-1.5 py-0.5 rounded font-mono uppercase tracking-wider">
                                BAYAR DI TEMPAT
                              </span>
                              <span className="text-xs font-extrabold text-[#ea580c]">Bayar di Tempat</span>
                            </div>
                            <p className="text-[10.5px] text-zinc-500 leading-relaxed font-semibold">
                              Pesanan **Take Away** dibayar langsung di kasir outlet kami saat mengambil pesanan (bisa menggunakan **m-Banking / E-Wallet / QRIS atau Tunai**).
                            </p>
                          </div>
                        ) : (
                          <div className="grid grid-cols-2 gap-1.5 bg-zinc-100 p-1.5 rounded-xl border border-zinc-200">
                            <button
                              type="button"
                              onClick={() => setPaymentMethod('TUNAI')}
                              className={`py-2 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer text-center ${
                                paymentMethod === 'TUNAI'
                                  ? 'bg-primary-orange text-white shadow-sm'
                                  : 'text-zinc-600 hover:text-brand-charcoal'
                              }`}
                            >
                              💵 Tunai (Cash)
                            </button>
                            <button
                              type="button"
                              onClick={() => setPaymentMethod('QRIS')}
                              className={`py-2 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer text-center ${
                                paymentMethod === 'QRIS'
                                  ? 'bg-primary-orange text-white shadow-sm'
                                  : 'text-zinc-600 hover:text-brand-charcoal'
                              }`}
                            >
                              📱 QRIS (Cashless)
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Drawer Footer Checkout Card */}
              {cartItems.length > 0 && (
                <div className="bg-white border-t border-zinc-100 p-5 shadow-[0_-4px_12px_rgba(0,0,0,0.03)]">
                  
                  {/* Calculation Details lines */}
                  <div className="space-y-2 mb-4 text-xs font-semibold font-sans text-brand-charcoal/70">
                    <div className="flex items-center justify-between">
                      <span>Total Porsi</span>
                      <span className="font-mono text-brand-charcoal font-bold">{totalCount} item</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Cara Makan</span>
                      <span className={`text-[11px] font-extrabold uppercase font-mono px-2 py-0.5 rounded ${
                        orderMethod === 'TAKE_AWAY'
                          ? 'text-emerald-600 bg-emerald-50'
                          : 'text-blue-600 bg-blue-50'
                      }`}>
                        {orderMethod === 'TAKE_AWAY' ? '🛍️ Take Away' : '🍽️ Dine In'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Metode Pembayaran</span>
                      <span className="text-brand-charcoal font-sans font-bold text-[11px]">
                        {paymentMethod === 'BAYAR_DI_TEMPAT'
                          ? '🤝 Bayar di Tempat'
                          : paymentMethod === 'QRIS'
                            ? '📱 QRIS (Cashless)'
                            : '💵 Tunai (Bayar Cash)'}
                      </span>
                    </div>

                    <div className="border-t border-zinc-200/60 pt-3 flex items-center justify-between text-sm sm:text-base text-brand-charcoal font-display">
                      <span className="font-black">Total Tagihan</span>
                      <span className="font-extrabold text-primary-orange-dark">
                        {formatPrice(totalPrice)}
                      </span>
                    </div>
                  </div>

                  {/* Checkout CTA button to WA */}
                  <div className="flex flex-col gap-2">
                    <button
                      onClick={handleCheckoutWA}
                      className="w-full bg-primary-orange hover:bg-primary-orange-dark text-white font-extrabold py-3.5 px-4 rounded-xl flex items-center justify-center gap-2.5 shadow-lg active:scale-98 transition-all cursor-pointer text-sm"
                    >
                      <Receipt className="w-4 h-4 text-white" />
                      <span>Buat Invoice / Receipt Pemesanan</span>
                    </button>
                    
                    <p className="text-[10px] text-gray-400 font-mono font-medium text-center leading-relaxed">
                      💡 Setelah menekan tombol di atas, Invoice / Receipt Pemesanan Anda akan otomatis dibuat untuk mempermudah proses konfirmasi via WhatsApp.
                    </p>
                  </div>

                </div>
              )}

            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Automatic Interactive Receipt Modal */}
      <AnimatePresence>
        {showReceipt && currentReceipt && (
          <>
            {/* Backdrop layer */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/85 backdrop-blur-md z-[60] flex items-start sm:items-center justify-center p-3 sm:p-6 overflow-y-auto"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                transition={{ type: 'spring', duration: 0.5 }}
                className="bg-[#fafbf9] text-brand-charcoal w-full max-w-[480px] rounded-3xl shadow-2xl border border-zinc-200 overflow-hidden relative font-sans my-4 sm:my-8"
              >
                {/* Close Button top-right */}
                <button
                  onClick={() => setShowReceipt(false)}
                  className="absolute top-4 right-4 p-2 bg-zinc-100 hover:bg-zinc-200 rounded-full transition-colors cursor-pointer z-10"
                  aria-label="Tutup Receipt"
                >
                  <X className="w-4 h-4 text-zinc-600" />
                </button>

                {/* Thermal paper top serrated zig-zag design */}
                <div className="h-3 w-full bg-[linear-gradient(135deg,#e4e4e7,30%,transparent_30%),linear-gradient(225deg,#e4e4e7,30%,transparent_30%)] bg-[length:12px_12px] opacity-40" />

                <div className="p-3.5 sm:p-5 space-y-3.5 select-text overflow-y-auto max-h-[70vh] sm:max-h-[75vh]">
                  
                  <div ref={receiptRef} className="bg-[#fafbf9] p-2.5 rounded-2xl space-y-4 border border-zinc-150/40">
                    {/* Store Header - Compact & Clean */}
                    <div className="text-center space-y-1">
                      <div className="inline-flex items-center justify-center bg-primary-orange/10 p-1.5 rounded-full text-primary-orange mb-0.5">
                        <Receipt className="w-5 h-5" />
                      </div>
                      <h2 className="font-display font-black text-base sm:text-lg tracking-tight text-brand-charcoal">
                        SUKI YUSUKI
                      </h2>
                      <p className="text-[9px] text-zinc-500 font-bold tracking-wider font-sans uppercase">
                        Premium Homemade • Purwokerto • Telp: 0818-1875-8265
                      </p>
                    </div>

                    {/* High Contrast Compact Screenshot Proof Reminder Alert */}
                    <div className="bg-amber-500 text-black border border-zinc-950 rounded-xl p-3 flex items-start gap-2.5 shadow-sm">
                      <div className="bg-zinc-950 text-amber-500 rounded-lg p-1.5 flex-shrink-0 flex items-center justify-center shadow-inner mt-0.5 animate-pulse">
                        <Download className="w-4 h-4 stroke-[2.5px]" />
                      </div>
                      <div className="text-left space-y-1">
                        <p className="text-[10px] font-black text-zinc-950 leading-tight uppercase font-mono tracking-wide">
                          PEMBERITAHUAN LAYANAN:
                        </p>
                        <p className="text-[9.5px] font-bold text-zinc-900 leading-relaxed">
                          Silakan mengunduh / mengklik tombol unduh di bawah <b>"Konfirmasi Pesanan dan Kirim via WA"</b> untuk bukti yang sah. Tunjukkan gambar atau kirimkan gambarnya beserta pesan salinan WhatsApp pesanan otomatis. Gambar receipt/invoice ini menjadi bukti pemesanan via website.
                        </p>
                      </div>
                    </div>

                    {/* Divider line */}
                    <div className="border-t border-dashed border-zinc-300" />

                    {/* Invoice Header Details */}
                    <div className="grid grid-cols-2 gap-y-1.5 text-[10px] sm:text-[10.5px] font-sans font-semibold text-brand-charcoal/75">
                      <div>
                        <span className="text-zinc-400 block uppercase tracking-wider text-[8.5px] font-bold font-mono">Invoice No.</span>
                        <span className="font-mono text-zinc-800 font-bold">{currentReceipt.invoiceNo}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-zinc-400 block uppercase tracking-wider text-[8.5px] font-bold font-mono">Tanggal</span>
                        <span className="text-zinc-800 font-mono">{currentReceipt.orderDate}</span>
                      </div>
                      <div className="pt-0.5">
                        <span className="text-zinc-400 block uppercase tracking-wider text-[8.5px] font-bold font-mono">Nama Pemesan</span>
                        <span className="text-zinc-800 font-bold">{currentReceipt.name}</span>
                      </div>
                      <div className="text-right pt-0.5">
                        <span className="text-zinc-400 block uppercase tracking-wider text-[8.5px] font-bold font-mono">No. Telepon</span>
                        <span className="text-zinc-800 font-bold font-mono text-[9.5px]">{currentReceipt.phone}</span>
                      </div>
                      <div className="pt-0.5 col-span-2 border-t border-zinc-100 mt-1 grid grid-cols-2 gap-2 text-left">
                        <div>
                          <span className="text-zinc-400 block uppercase tracking-wider text-[8px] font-bold font-mono">
                            Jam Kedatangan
                          </span>
                          <span className="block font-mono text-[11px] font-black text-blue-600">
                            🕒 {currentReceipt.arrivalTime || currentReceipt.pickupTime} WIB
                          </span>
                        </div>
                        <div>
                          <span className="text-zinc-400 block uppercase tracking-wider text-[8px] font-bold font-mono">
                            Jam Pengambilan
                          </span>
                          <span className="block font-mono text-[11px] font-black text-emerald-600">
                            🕒 {currentReceipt.pickupTime || currentReceipt.arrivalTime} WIB
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Divider line */}
                    <div className="border-t border-dashed border-zinc-300" />

                    {/* Items Ordered Table */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-[8.5px] text-zinc-400 uppercase tracking-wider font-bold font-mono">
                        <span>Rincian Menu</span>
                        <span>Subtotal</span>
                      </div>
                      
                      <div className="space-y-2 max-h-[140px] overflow-y-auto pr-1">
                        {currentReceipt.items.map((item, idx) => (
                          <div key={`${item.menuItem.id}-${idx}`} className="flex justify-between items-start text-[11px] sm:text-xs font-semibold">
                            <div className="max-w-[70%]">
                              <span className="text-brand-charcoal font-bold">{item.menuItem.name}</span>
                              <div className="text-[9.5px] text-zinc-400 font-mono mt-0.5">
                                {item.quantity} porsi x {formatPrice(item.menuItem.price)}
                              </div>
                            </div>
                            <span className="font-mono text-brand-charcoal font-bold text-right pt-0.5 text-[10.5px] sm:text-[11.5px]">
                              {formatPrice(item.menuItem.price * item.quantity)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Divider line */}
                    <div className="border-t border-dashed border-zinc-300" />

                    {/* Subtotal and Summary */}
                    <div className="space-y-1.5 font-sans text-[10.5px] sm:text-[11px] font-semibold text-brand-charcoal/85">
                      <div className="flex items-center justify-between">
                        <span className="text-zinc-400">Total Item</span>
                        <span className="font-mono text-brand-charcoal font-bold">
                          {currentReceipt.items.reduce((sum, current) => sum + current.quantity, 0)} Porsi
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-zinc-400">Cara Makan</span>
                        <span className={`text-[10px] font-bold uppercase font-mono px-1.5 py-0.5 rounded ${
                          currentReceipt.method === 'TAKE_AWAY'
                            ? 'text-emerald-700 bg-emerald-50'
                            : 'text-blue-700 bg-blue-50'
                        }`}>
                          {currentReceipt.method === 'TAKE_AWAY' ? '🛍️ Take Away' : '🍽️ Dine In'}
                        </span>
                      </div>
                       <div className="flex items-center justify-between">
                        <span className="text-zinc-400">Waktu Layanan</span>
                        <div className="flex flex-col items-end gap-1 font-mono text-[9px] font-bold select-none text-right">
                          <span className="text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded leading-none">
                            Datang: {currentReceipt.arrivalTime || currentReceipt.pickupTime} WIB
                          </span>
                          <span className="text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded leading-none">
                            Ambil: {currentReceipt.pickupTime || currentReceipt.arrivalTime} WIB
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-zinc-400">Metode Bayar</span>
                        <span className="text-[#ea580c] bg-orange-50 px-1.5 py-0.5 rounded font-mono text-[10px] font-extrabold uppercase">
                          {currentReceipt.payment === 'BAYAR_DI_TEMPAT'
                            ? '🤝 Bayar di Tempat'
                            : currentReceipt.payment === 'QRIS'
                              ? '📱 QRIS (Cashless)'
                              : '💵 Tunai (Cash)'}
                        </span>
                      </div>

                      <div className="border-t border-double border-zinc-300 pt-2.5 flex items-center justify-between text-xs sm:text-sm text-brand-charcoal">
                        <span className="font-extrabold uppercase tracking-tight text-[10px] text-zinc-500 font-mono">Total Tagihan</span>
                        <span className="font-black text-[#ea580c] text-sm sm:text-base">
                          {formatPrice(currentReceipt.total)}
                        </span>
                      </div>
                    </div>

                    {/* Smart Barcode graphic rendering */}
                    <div className="space-y-0.5 py-0.5">
                      <div className="flex justify-center items-center h-4.5 gap-[1px] opacity-75">
                        {[1,3,1,2,3,1,2,4,1,2,1,3,2,1,3,1,2,4,1,2,1,3,1,2].map((w, i) => (
                          <div key={`barcode-line-${i}`} className="bg-zinc-800 h-full" style={{ width: `${w}px` }} />
                        ))}
                      </div>
                      <p className="text-[9px] text-zinc-400 text-center font-mono tracking-widest font-semibold font-bold">
                        {currentReceipt.invoiceNo}
                      </p>
                    </div>
                  </div>

                </div>

                {/* Confirm WhatsApp action bar bottom */}
                <div className="bg-white border-t border-zinc-100 p-6 flex flex-col gap-2.5">
                  {/* Informational banner telling the customer to download first */}
                  {!receiptDownloaded && (
                    <div className="bg-amber-50 text-amber-800 border border-amber-200/50 rounded-xl p-3 flex items-start gap-2 text-center justify-center shadow-xs animate-pulse">
                      <span className="text-xs">🔒</span>
                      <p className="text-[11px] font-bold leading-normal">
                        Silakan klik <b className="text-zinc-900 font-extrabold font-mono uppercase text-[10px]">"Unduh Gambar Receipt / Invoice ke Galeri"</b> di bawah terlebih dahulu untuk membuka tombol konfirmasi WhatsApp!
                      </p>
                    </div>
                  )}

                  <button
                    onClick={handleSendWAFromReceipt}
                    disabled={!receiptDownloaded}
                    className={`w-full font-extrabold py-3.5 px-4 rounded-xl flex items-center justify-center gap-2.5 transition-all text-sm ${
                      receiptDownloaded
                        ? 'bg-[#25D366] hover:bg-[#20ba5a] text-white shadow-lg shadow-emerald-500/10 cursor-pointer transform active:scale-98 duration-300'
                        : 'bg-zinc-100 border border-zinc-200 text-zinc-400 cursor-not-allowed'
                    }`}
                  >
                    <MessageSquare className={`w-5 h-5 fill-current ${receiptDownloaded ? 'text-white' : 'text-zinc-400'}`} />
                    <span>Konfirmasi Pesanan dan Kirim via WA</span>
                  </button>

                  <button
                    onClick={handleExportReceiptPNG}
                    disabled={isExporting}
                    className="w-full bg-zinc-900 hover:bg-black text-white font-extrabold py-3.5 px-4 rounded-xl flex items-center justify-center gap-2.5 shadow-md duration-300 transform active:scale-98 transition-all cursor-pointer text-sm disabled:opacity-50"
                  >
                    {isExporting ? (
                      <span className="animate-spin text-rose-500">⏳</span>
                    ) : (
                      <Image className="w-4 h-4 text-rose-500" />
                    )}
                    <span>{isExporting ? 'Memproses Gambar...' : 'Unduh Gambar Receipt / Invoice ke Galeri'}</span>
                  </button>

                  <button
                    onClick={() => setShowReceipt(false)}
                    className="w-full text-zinc-500 hover:text-brand-charcoal text-xs font-bold py-2 rounded-lg text-center cursor-pointer transition-colors"
                  >
                    Kembali & Edit Pesanan
                  </button>
                </div>

                {/* Thermal paper bottom serrated zig-zag design */}
                <div className="h-3 w-full bg-[linear-gradient(135deg,#e4e4e7,30%,transparent_30%),linear-gradient(225deg,#e4e4e7,30%,transparent_30%)] bg-[length:12px_12px] opacity-40 rotate-180" />

              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
