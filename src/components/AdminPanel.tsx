import React, { useState, useEffect } from 'react';
import {
  X,
  Lock,
  LogOut,
  Plus,
  Edit2,
  Trash2,
  Image as ImageIcon,
  Save,
  RotateCcw,
  Sparkles,
  Search,
  Check,
  AlertTriangle,
  UploadCloud,
  Layers,
  Settings as SettingsIcon,
  ShoppingBag,
  ExternalLink,
  MapPin,
  Clock,
  Phone,
  Star,
  MessageSquare,
  Sparkle,
  Tv,
  Calendar,
  Share2,
  LayoutDashboard,
  BarChart3,
  TrendingUp,
  Download,
  CheckSquare,
  MousePointerClick,
  Eye,
  ShoppingCart,
  Receipt,
  Utensils,
  Heart,
  HelpCircle,
  BookOpen
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { MenuItem, MenuCategory, AppSettings, Testimonial, InstagramPost, TikTokVideoSim, FaqItem, InfoTambahanItem, AboutSlideItem } from '../types';
import { MENU_ITEMS, CATEGORIES, FAQS, DEFAULT_INFO_TAMBAHAN, DEFAULT_ABOUT_SLIDES } from '../data/menu';
import {
  auth,
  db,
  googleProvider,
  signInWithPopup,
  signOut,
  OperationType,
  handleFirestoreError
} from '../firebase';
import {
  onAuthStateChanged,
  User
} from 'firebase/auth';
import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  onSnapshot
} from 'firebase/firestore';

interface AdminPanelProps {
  isOpen: boolean;
  onClose: () => void;
  menuItems: MenuItem[];
  dbMenuItems?: MenuItem[];
  logoUrl?: string;
  onLogoChange?: (url: string) => void;
  appSettings?: AppSettings;
  testimonials?: Testimonial[];
  instagramPosts?: InstagramPost[];
  tiktokPosts?: TikTokVideoSim[];
  dbFaqs?: FaqItem[];
  dbInfoTambahan?: InfoTambahanItem[];
  dbAboutSlides?: AboutSlideItem[];
}

export default function AdminPanel({
  isOpen,
  onClose,
  menuItems,
  dbMenuItems = [],
  logoUrl,
  onLogoChange,
  appSettings = {},
  testimonials = [],
  instagramPosts = [],
  tiktokPosts = [],
  dbFaqs = [],
  dbInfoTambahan = [],
  dbAboutSlides = []
}: AdminPanelProps) {
  const [user, setUser] = useState<{ username: string; email: string } | null>(() => {
    const saved = localStorage.getItem('suki_yusuki_admin');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return null;
      }
    }
    return null;
  });
  const [loading, setLoading] = useState(false);
  const [typedUsername, setTypedUsername] = useState('');
  const [typedPassword, setTypedPassword] = useState('');
  const [activeTab, setActiveTab] = useState<'dashboard' | 'menu' | 'settings'>('dashboard');
  const [authError, setAuthError] = useState<string | null>(null);

  // Analytics Dashboard states
  const [invoices, setInvoices] = useState<any[]>([]);
  const [waClicks, setWaClicks] = useState<any[]>([]);
  const [analyticsEvents, setAnalyticsEvents] = useState<any[]>([]);
  const [invoiceFilterDate, setInvoiceFilterDate] = useState<'hari' | 'minggu' | 'bulan' | 'semua'>('bulan');
  const [invoiceFilterMethod, setInvoiceFilterMethod] = useState<'ALL' | 'DINE_IN' | 'TAKE_AWAY'>('ALL');
  const [invoiceFilterPayment, setInvoiceFilterPayment] = useState<'ALL' | 'TUNAI' | 'QRIS' | 'BAYAR_DI_TEMPAT'>('ALL');
  const [invoiceSearch, setInvoiceSearch] = useState('');

  // Generates 30-day high-fidelity simulated historical records to display charts immediately
  const [mockInvoicesData, setMockInvoicesData] = useState<any[]>(() => {
    const isCleaned = localStorage.getItem('suki_yusuki_analytics_cleaned') === 'true';
    if (isCleaned) return [];
    const result = [];
    const names = [
      'Budi Santoso', 'Siti Rahma', 'Andi Wijaya', 'Dewi Lestari', 'Ahmad Fauzi', 
      'Rini Amalia', 'Fajar Pratama', 'Sari Kartika', 'Hendra Kusuma', 'Eka Putri',
      'Rian Hidayat', 'Mega Utami', 'Adit Nugroho', 'Lia Rahayu', 'Gita Permata',
      'Dedy Setiawan', 'Novi Safitri', 'Rudi Hermawan', 'Yanti Sulistyo', 'Ferry Irawan',
      'Yusuf Purwoko', 'Aulia Fitriani', 'Doni Setiawan', 'Siti Aminah', 'Bima Sakti', 
      'Tina Astuti', 'Zaki Mubarak', 'Putri Handayani', 'Kevin Sanjaya', 'Santi Lestari'
    ];
    
    const menuMockItems = [
      { id: 'b-mentai', name: 'Dimsum Mentai', price: 16000, category: 'DIMSUM MENTAI' },
      { id: 'b-carbonara', name: 'Dimsum Carbonara', price: 16000, category: 'DIMSUM CARBONARA' },
      { id: 'b-suki-small', name: 'Suki Small Set', price: 15000, category: 'SUKI' },
      { id: 'dimsum-ori', name: 'Dimsum Original', price: 12500, category: 'DIMSUM ORIGINAL' },
      { id: 'dimsum-kulit-tahu', name: 'Dimsum Kulit Tahu', price: 13000, category: 'DIMSUM GORENG' },
      { id: 'dimsum-ekado', name: 'Dimsum Ekado', price: 13000, category: 'DIMSUM GORENG' },
      { id: 'suki-medium', name: 'Suki Medium Shabu', price: 25000, category: 'SUKI' },
      { id: 'angsio', name: 'Angsio Ceker Ayam', price: 14000, category: 'LAINNYA' }
    ];

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    for (let i = 29; i >= 0; i--) {
      const d = new Date(todayStart.getTime() - i * 24 * 60 * 60 * 1000);
      const isWeekend = d.getDay() === 0 || d.getDay() === 5 || d.getDay() === 6;
      const numOrders = isWeekend ? Math.floor(4 + Math.random() * 5) : Math.floor(1 + Math.random() * 4);

      for (let o = 0; o < numOrders; o++) {
        const name = names[Math.floor(Math.random() * names.length)];
        const method = Math.random() > 0.4 ? 'DINE_IN' : 'TAKE_AWAY';
        const payment = method === 'TAKE_AWAY' ? 'BAYAR_DI_TEMPAT' : (Math.random() > 0.4 ? 'QRIS' : 'TUNAI');
        
        // Random hour representation: 16:30 to 22:30 (peak operational hours)
        const hr = 16 + Math.floor(Math.random() * 7);
        const min = Math.floor(Math.random() * 60);
        const arrivalText = `${hr.toString().padStart(2, '0')}.${min.toString().padStart(2, '0')}`;

        const numItems = Math.floor(1 + Math.random() * 3);
        const orderItems = [];
        let total = 0;

        const usedIdx = new Set();
        while (usedIdx.size < numItems) {
          usedIdx.add(Math.floor(Math.random() * menuMockItems.length));
        }

        usedIdx.forEach((idx: any) => {
          const item = menuMockItems[idx];
          const qty = Math.floor(1 + Math.random() * 3);
          orderItems.push({
            menuItem: item,
            quantity: qty
          });
          total += item.price * qty;
        });

        const timeStr = d.toLocaleDateString('id-ID', {
          weekday: 'long', 
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        }) + `  ${hr.toString().padStart(2, '0')}:${min.toString().padStart(2, '0')} WIB`;

        const invoiceNo = `YSK-${d.getFullYear()}${(d.getMonth() + 1).toString().padStart(2, '0')}${d.getDate().toString().padStart(2, '0')}-${1000 + Math.floor(Math.random() * 9000)}`;
        const clickWA = Math.random() < 0.85;

        let status = 'Selesai / datang ke toko';
        if (i === 0) {
          status = clickWA ? 'Dikirim ke WhatsApp' : 'Baru dibuat';
        } else if (i === 1) {
          status = Math.random() > 0.3 ? 'Selesai / datang ke toko' : 'Dikonfirmasi';
        }

        result.push({
          id: invoiceNo,
          invoiceNo,
          orderDate: timeStr,
          name,
          phone: '081' + Math.floor(100000000 + Math.random() * 900000000),
          method,
          payment,
          total,
          items: orderItems,
          pickupTime: method === 'TAKE_AWAY' ? arrivalText : undefined,
          arrivalTime: method === 'DINE_IN' ? arrivalText : undefined,
          status,
          clickWA,
          createdAt: d.getTime() + (hr * 60 * 60 * 1000) + (min * 60 * 1000)
        });
      }
    }
    return result;
  });

  // Generates high-fidelity simulated customer session event records that align with simulated invoices
  const [mockAnalyticsEventsData, setMockAnalyticsEventsData] = useState<any[]>(() => {
    const isCleaned = localStorage.getItem('suki_yusuki_analytics_cleaned') === 'true';
    if (isCleaned) return [];
    
    const events: any[] = [];
    
    // For each simulated invoice in mockInvoicesData, generate a realistic flow of events (web_visit -> product clicks -> cart -> invoice -> download_receipt)
    mockInvoicesData.forEach(inv => {
      const invTime = inv.createdAt;
      
      // 1. Web visit before ordering (usually 10-25 minutes before)
      const visitTime = invTime - Math.floor(10 * 60 * 1000 + Math.random() * 15 * 60 * 1000);
      events.push({
        id: `m-visit-${inv.invoiceNo}`,
        type: 'web_visit',
        timestamp: visitTime
      });

      // 2. Product clicks: click on items in the invoice + some other items
      inv.items?.forEach((item: any) => {
        const itemInfo = item.menuItem;
        if (!itemInfo) return;
        
        // Product view click
        events.push({
          id: `m-pclk-${inv.invoiceNo}-${itemInfo.id}`,
          type: 'product_click',
          itemId: itemInfo.id,
          itemName: itemInfo.name,
          timestamp: visitTime + Math.floor(1 * 60 * 1000 + Math.random() * 3 * 60 * 1000)
        });

        // Add to cart
        events.push({
          id: `m-cart-${inv.invoiceNo}-${itemInfo.id}`,
          type: 'add_to_cart',
          itemId: itemInfo.id,
          itemName: itemInfo.name,
          quantity: item.quantity || 1,
          timestamp: visitTime + Math.floor(4 * 60 * 1000 + Math.random() * 2 * 60 * 1000)
        });
      });

      // Also let's generate some filler clicks on other random items to look completely organic!
      const randomFillerItems = [
        { id: 'b-mentai', name: 'Dimsum Mentai' },
        { id: 'dimsum-ori', name: 'Dimsum Original' },
        { id: 'suki-medium', name: 'Suki Medium Shabu' }
      ];
      randomFillerItems.forEach((f, idx) => {
        if (!inv.items?.some((it: any) => (it.menuItem?.id || '') === f.id)) {
          if (Math.random() > 0.5) {
            events.push({
              id: `m-fill-${inv.invoiceNo}-${idx}`,
              type: 'product_click',
              itemId: f.id,
              itemName: f.name,
              timestamp: visitTime + Math.floor(2 * 60 * 1000 + Math.random() * 4 * 60 * 1000)
            });
          }
        }
      });

      // 3. Create receipt/invoice event
      events.push({
        id: `m-invoice-${inv.invoiceNo}`,
        type: 'create_invoice',
        invoiceNo: inv.invoiceNo,
        timestamp: invTime
      });

      // 4. Download receipt event (~85% download rate)
      if (Math.random() < 0.85) {
        events.push({
          id: `m-dl-${inv.invoiceNo}`,
          type: 'download_receipt',
          invoiceNo: inv.invoiceNo,
          timestamp: invTime + Math.floor(15 * 1000 + Math.random() * 45 * 1000)
        });
      }
    });

    // Add extra purely casual browse traffic (window shoppers returning no checkout)
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    for (let i = 29; i >= 0; i--) {
      const d = new Date(todayStart.getTime() - i * 24 * 60 * 60 * 1000);
      const pureVisitors = 5;
      for (let v = 0; v < pureVisitors; v++) {
        const visitTime = d.getTime() + Math.floor(10 * 60 * 60 * 1000 + Math.random() * 12 * 60 * 60 * 1000);
        events.push({
          id: `m-pure-visit-${i}-${v}`,
          type: 'web_visit',
          timestamp: visitTime
        });

        const clickCount = Math.floor(1 + Math.random() * 3);
        const candidates = [
          { id: 'b-mentai', name: 'Dimsum Mentai' },
          { id: 'b-carbonara', name: 'Dimsum Carbonara' },
          { id: 'b-suki-small', name: 'Suki Small Set' },
          { id: 'dimsum-ori', name: 'Dimsum Original' },
          { id: 'dimsum-kulit-tahu', name: 'Dimsum Kulit Tahu' }
        ];
        
        for (let c = 0; c < clickCount; c++) {
          const item = candidates[Math.floor(Math.random() * candidates.length)];
          events.push({
            id: `m-pure-clk-${i}-${v}-${c}`,
            type: 'product_click',
            itemId: item.id,
            itemName: item.name,
            timestamp: visitTime + Math.floor(1 * 60 * 1000 + Math.random() * 5 * 60 * 1000)
          });
          
          if (Math.random() < 0.35) {
            events.push({
              id: `m-pure-cart-${i}-${v}-${c}`,
              type: 'add_to_cart',
              itemId: item.id,
              itemName: item.name,
              quantity: Math.floor(1 + Math.random() * 2),
              timestamp: visitTime + Math.floor(2 * 60 * 1000 + Math.random() * 6 * 60 * 1000)
            });
          }
        }
      }
    }

    return events.sort((a,b) => b.timestamp - a.timestamp);
  });

  const combinedEvents = React.useMemo(() => {
    return [
      ...analyticsEvents,
      ...mockAnalyticsEventsData.filter(mock => !analyticsEvents.some(f => f.id === mock.id))
    ];
  }, [analyticsEvents, mockAnalyticsEventsData]);

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<MenuCategory | 'ALL'>('ALL');

  // Form states
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formName, setFormName] = useState('');
  const [formPrice, setFormPrice] = useState(0);
  const [formCategory, setFormCategory] = useState<MenuCategory>('DIMSUM ORIGINAL');
  const [formDescription, setFormDescription] = useState('');
  const [formPieces, setFormPieces] = useState<number | ''>('');
  const [formImage, setFormImage] = useState('');
  const [formIsBestSeller, setFormIsBestSeller] = useState(false);
  const [formIsAvailable, setFormIsAvailable] = useState(true);
  const [formTags, setFormTags] = useState('');
  
  // Custom Confirmation Modal state
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    confirmText?: string;
    confirmStyle?: 'danger' | 'primary';
    onConfirm: () => void | Promise<void>;
  }>({
    isOpen: false,
    title: '',
    message: '',
    confirmText: 'Ya, Konfirmasi',
    confirmStyle: 'primary',
    onConfirm: () => {},
  });

  const requestConfirm = (
    title: string,
    message: string,
    onConfirm: () => void | Promise<void>,
    confirmText: string = 'Ya, Konfirmasi',
    confirmStyle: 'danger' | 'primary' = 'primary'
  ) => {
    setConfirmModal({
      isOpen: true,
      title,
      message,
      confirmText,
      confirmStyle,
      onConfirm: async () => {
        setConfirmModal((prev) => ({ ...prev, isOpen: false }));
        try {
          await onConfirm();
        } catch (err) {
          console.error("Confirmation execution failed:", err);
        }
      },
    });
  };
  
  // File Upload states and compression utility
  const [isDragging, setIsDragging] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // Notification Toasts state
  const [toasts, setToasts] = useState<{ id: string; type: 'success' | 'error' | 'info'; title: string; message: string }[]>([]);

  const addToast = (type: 'success' | 'error' | 'info', title: string, message: string) => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev, { id, type, title, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const compressAndSetImage = (file: File) => {
    if (!file.type.startsWith('image/')) {
      const errMsg = 'Tipe file tidak valid. Harap unggah file gambar (PNG, JPG, JPEG, WEBP dll).';
      setUploadError(errMsg);
      addToast('error', 'Format File Salah', errMsg);
      return;
    }
    
    if (file.size > 10 * 1024 * 1024) {
      const errMsg = 'Ukuran file terlalu besar (maksimal 10MB).';
      setUploadError(errMsg);
      addToast('error', 'Ukuran Terlalu Besar', errMsg);
      return;
    }

    setIsUploading(true);
    setUploadError(null);

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          
          const MAX_SIZE = 800;
          if (width > height) {
            if (width > MAX_SIZE) {
              height = Math.round((height * MAX_SIZE) / width);
              width = MAX_SIZE;
            }
          } else {
            if (height > MAX_SIZE) {
              width = Math.round((width * MAX_SIZE) / height);
              height = MAX_SIZE;
            }
          }
          
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            const base64 = canvas.toDataURL('image/jpeg', 0.75);
            setFormImage(base64);
            addToast('success', 'Gambar Terunggah', 'Gambar menu berhasil diunggah dari galeri!');
          } else {
            setFormImage(e.target?.result as string);
            addToast('success', 'Gambar Terunggah', 'Gambar menu berhasil diunggah!');
          }
        } catch (err) {
          console.error(err);
          setUploadError('Gagal memproses gambar. Silakan coba file lain.');
          addToast('error', 'Proses Gagal', 'Gagal memproses gambar tersebut.');
        } finally {
          setIsUploading(false);
        }
      };
      
      img.onerror = () => {
        setUploadError('Gagal memuat gambar.');
        addToast('error', 'Gagal Memuat', 'Gagal memuat visual gambar.');
        setIsUploading(false);
      };
      
      img.src = e.target?.result as string;
    };
    
    reader.onerror = () => {
      setUploadError('Gagal membaca file gambar.');
      addToast('error', 'Gagal Membaca', 'Sistem gagal membaca format biner file.');
      setIsUploading(false);
    };
    
    reader.readAsDataURL(file);
  };

  // Logo brand upload states
  const [isDraggingLogo, setIsDraggingLogo] = useState(false);
  const [logoUploadError, setLogoUploadError] = useState<string | null>(null);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);

  const compressAndSetLogo = (file: File) => {
    if (!file.type.startsWith('image/')) {
      const errMsg = 'Tipe file tidak valid. Harap unggah file gambar (PNG, JPG, JPEG, WEBP dll).';
      setLogoUploadError(errMsg);
      addToast('error', 'Format File Salah', errMsg);
      return;
    }
    
    if (file.size > 10 * 1024 * 1024) {
      const errMsg = 'Ukuran file terlalu besar (maksimal 10MB).';
      setLogoUploadError(errMsg);
      addToast('error', 'Ukuran Terlalu Besar', errMsg);
      return;
    }

    setIsUploadingLogo(true);
    setLogoUploadError(null);

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          
          const MAX_SIZE = 500;
          if (width > height) {
            if (width > MAX_SIZE) {
              height = Math.round((height * MAX_SIZE) / width);
              width = MAX_SIZE;
            }
          } else {
            if (height > MAX_SIZE) {
              width = Math.round((width * MAX_SIZE) / height);
              height = MAX_SIZE;
            }
          }
          
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            const base64 = canvas.toDataURL('image/png', 0.85);
            setLogoInput(base64);
            addToast('success', 'Logo Terunggah', 'Logo brand berhasil diperbarui dari galeri!');
          } else {
            setLogoInput(e.target?.result as string);
            addToast('success', 'Logo Terunggah', 'Logo brand berhasil diperbarui!');
          }
        } catch (err) {
          console.error(err);
          setLogoUploadError('Gagal memproses logo. Silakan coba file lain.');
          addToast('error', 'Proses Gagal', 'Gagal memproses gambar logo.');
        } finally {
          setIsUploadingLogo(false);
        }
      };
      
      img.onerror = () => {
        setLogoUploadError('Gagal memuat gambar.');
        addToast('error', 'Gagal Memuat', 'Gagal memuat visual logo.');
        setIsUploadingLogo(false);
      };
      
      img.src = e.target?.result as string;
    };
    
    reader.onerror = () => {
      setLogoUploadError('Gagal membaca file gambar.');
      addToast('error', 'Gagal Membaca', 'Sistem gagal membaca format biner file.');
      setIsUploadingLogo(false);
    };
    
    reader.readAsDataURL(file);
  };

  const [logoInput, setLogoInput] = useState(logoUrl || '');

  // App Settings Form States
  const [formOutletName, setFormOutletName] = useState('');
  const [formOutletAddress, setFormOutletAddress] = useState('');
  const [formOutletDescription, setFormOutletDescription] = useState('');
  const [formHeroImageUrl, setFormHeroImageUrl] = useState('');
  const [formAboutUsImageUrl, setFormAboutUsImageUrl] = useState('');
  const [formOutletGmaps, setFormOutletGmaps] = useState('');
  const [formOperatingHours, setFormOperatingHours] = useState('');
  const [formOperatingHoursSub, setFormOperatingHoursSub] = useState('');
  const [formOperatingDays, setFormOperatingDays] = useState('');
  const [formOperatingDaysSub, setFormOperatingDaysSub] = useState('');
  const [formWhatsappNumber, setFormWhatsappNumber] = useState('');
  const [formWhatsappName, setFormWhatsappName] = useState('');
  const [formWhatsappHandle, setFormWhatsappHandle] = useState('');
  const [formInstagramUrl, setFormInstagramUrl] = useState('');
  const [formInstagramHandle, setFormInstagramHandle] = useState('');
  const [formTiktokUrl, setFormTiktokUrl] = useState('');
  const [formTiktokHandle, setFormTiktokHandle] = useState('');
  const [formShopeefoodUrl, setFormShopeefoodUrl] = useState('');
  const [formGofoodUrl, setFormGofoodUrl] = useState('');

  // Drag and Drop States for Visual Media
  const [isDraggingHero, setIsDraggingHero] = useState(false);
  const [isDraggingAbout, setIsDraggingAbout] = useState(false);
  const [isProcessingHero, setIsProcessingHero] = useState(false);
  const [isProcessingAbout, setIsProcessingAbout] = useState(false);

  // Compress & convert file to data URL / Base64
  const resizeAndProcessImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 1000;
          const MAX_HEIGHT = 1000;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }

          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext('2d');
          if (!ctx) {
            resolve(event.target?.result as string);
            return;
          }

          ctx.drawImage(img, 0, 0, width, height);
          const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
          resolve(dataUrl);
        };
        img.onerror = (err) => reject(err);
        img.src = event.target?.result as string;
      };
      reader.onerror = (err) => reject(err);
      reader.readAsDataURL(file);
    });
  };

  const handleHeroDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDraggingHero(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setIsProcessingHero(true);
      try {
        const base64 = await resizeAndProcessImage(file);
        setFormHeroImageUrl(base64);
        addToast('success', 'Berhasil Memuat Foto', 'Foto Banner Hero berhasil dimuat dan dikompresi!');
      } catch (err) {
        addToast('error', 'Gagal Memuat Foto', 'Kesalahan membaca file foto.');
      } finally {
        setIsProcessingHero(false);
      }
    } else {
      addToast('error', 'Format Tidak Sesuai', 'Silakan masukkan file gambar.');
    }
  };

  const handleHeroFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsProcessingHero(true);
      try {
        const base64 = await resizeAndProcessImage(file);
        setFormHeroImageUrl(base64);
        addToast('success', 'Berhasil Memuat', 'Foto Banner Hero berhasil dimuat!');
      } catch (err) {
        addToast('error', 'Gagal Memuat', 'Kesalahan membaca file foto.');
      } finally {
        setIsProcessingHero(false);
      }
    }
  };

  const handleAboutDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDraggingAbout(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setIsProcessingAbout(true);
      try {
        const base64 = await resizeAndProcessImage(file);
        setFormAboutUsImageUrl(base64);
        addToast('success', 'Berhasil Memuat Foto', 'Foto Tentang Kami berhasil dimuat!')
      } catch (err) {
        addToast('error', 'Gagal Memuat', 'Kesalahan membaca file foto.');
      } finally {
        setIsProcessingAbout(false);
      }
    } else {
      addToast('error', 'Format Tidak Sesuai', 'Silakan masukkan file gambar.');
    }
  };

  const handleAboutFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsProcessingAbout(true);
      try {
        const base64 = await resizeAndProcessImage(file);
        setFormAboutUsImageUrl(base64);
        addToast('success', 'Berhasil Memuat', 'Foto Tentang Kami berhasil dimuat!');
      } catch (err) {
        addToast('error', 'Gagal Memuat', 'Kesalahan membaca file foto.');
      } finally {
        setIsProcessingAbout(false);
      }
    }
  };

  // Testimonials/Reviews Form State
  const [selectedTestimonial, setSelectedTestimonial] = useState<Testimonial | null>(null);
  const [testimonyName, setTestimonyName] = useState('');
  const [testimonyRole, setTestimonyRole] = useState('');
  const [testimonyText, setTestimonyText] = useState('');
  const [testimonyRating, setTestimonyRating] = useState(5);
  const [testimonyAvatar, setTestimonyAvatar] = useState('');
  const [testimonyDate, setTestimonyDate] = useState('');
  const [isTestimonyFormOpen, setIsTestimonyFormOpen] = useState(false);

  // FAQs Form States
  const [selectedFaq, setSelectedFaq] = useState<FaqItem | null>(null);
  const [faqQuestion, setFaqQuestion] = useState('');
  const [faqAnswer, setFaqAnswer] = useState('');
  const [isFaqFormOpen, setIsFaqFormOpen] = useState(false);

  // About Slides Form States
  const [selectedAboutSlide, setSelectedAboutSlide] = useState<AboutSlideItem | null>(null);
  const [aboutSlideTitle, setAboutSlideTitle] = useState('');
  const [aboutSlideSubtitle, setAboutSlideSubtitle] = useState('');
  const [aboutSlideImage, setAboutSlideImage] = useState('');
  const [aboutSlideParagraphs, setAboutSlideParagraphs] = useState('');
  const [aboutSlideBullet1Title, setAboutSlideBullet1Title] = useState('');
  const [aboutSlideBullet1Desc, setAboutSlideBullet1Desc] = useState('');
  const [aboutSlideBullet2Title, setAboutSlideBullet2Title] = useState('');
  const [aboutSlideBullet2Desc, setAboutSlideBullet2Desc] = useState('');
  const [isAboutSlideFormOpen, setIsAboutSlideFormOpen] = useState(false);
  const [isProcessingAboutSlideImage, setIsProcessingAboutSlideImage] = useState(false);
  const [isDraggingAboutSlideImage, setIsDraggingAboutSlideImage] = useState(false);

  // Info Tambahan Form States
  const [selectedInfoTambahan, setSelectedInfoTambahan] = useState<InfoTambahanItem | null>(null);
  const [infoTambahanTitle, setInfoTambahanTitle] = useState('');
  const [infoTambahanDesc, setInfoTambahanDesc] = useState('');
  const [infoTambahanType, setInfoTambahanType] = useState<'quality' | 'benefit'>('quality');
  const [infoTambahanIcon, setInfoTambahanIcon] = useState('Sparkles');
  const [isInfoTambahanFormOpen, setIsInfoTambahanFormOpen] = useState(false);

  // Load static settings defaults if not present
  useEffect(() => {
    if (appSettings) {
      setFormOutletName(appSettings.outletName || 'SukiYuSuki Bantarsoka');
      setFormOutletAddress(appSettings.outletAddress || 'Kuliner Malam, Jl. Ps. Pon Utara Jl. Jend. Sudirman, Bantarsoka, Kec. Purwokerto Bar., Kabupaten Banyumas, Jawa Tengah 53133');
      setFormOutletDescription(appSettings.outletDescription || 'Sore hari laper ingin makan suki tomyam hangat yang pedas seger, dimsum lumer premium, atau aneka dumpling gurih? Yuk mampir langsung ke gerai kami di daerah Bantarsoka, Purwokerto Barat.');
      setFormOutletGmaps(appSettings.outletGmaps || 'https://maps.app.goo.gl/FtGnmFTyo2AB8X8AA');
      setFormOperatingHours(appSettings.operatingHours || '16.30 WIB - Selesai');
      setFormOperatingHoursSub(appSettings.operatingHoursSub || '(Biasa sold out jam 21.00!)');
      setFormOperatingDays(appSettings.operatingDays || 'Buka Setiap Hari');
      setFormOperatingDaysSub(appSettings.operatingDaysSub || '(Senin s/d Minggu)');
      setFormWhatsappNumber(appSettings.whatsappNumber || '6281818758265');
      setFormWhatsappName(appSettings.whatsappName || 'Suki Yusuki Admin');
      setFormWhatsappHandle(appSettings.whatsappHandle || '0818-1875-8265 (Suki Yusuki Admin)');
      setFormInstagramUrl(appSettings.instagramUrl || 'https://www.instagram.com/sukiyusuki?igsh=azNxcTNndnRmbG16');
      setFormInstagramHandle(appSettings.instagramHandle || '@sukiyusuki');
      setFormTiktokUrl(appSettings.tiktokUrl || 'https://www.tiktok.com/@sukiyusuki');
      setFormTiktokHandle(appSettings.tiktokHandle || '@owner.yusuki');
      setFormShopeefoodUrl(appSettings.shopeefoodUrl || 'https://shopee.co.id/m/shopeefood');
      setFormGofoodUrl(appSettings.gofoodUrl || 'https://gofood.co.id');
      setFormHeroImageUrl(appSettings.heroImageUrl || '/src/assets/images/dimsum_cart_hero_1780660457427.png');
      setFormAboutUsImageUrl(appSettings.aboutUsImageUrl || '/src/assets/images/yusuki_physical_outlet_1780673086306.png');
    }
  }, [appSettings]);

  // Realtime subscription to Firebase 'invoices', 'wa_clicks', and 'analytics_events' for direct organic tracking
  useEffect(() => {
    if (!user) return;
    try {
      const unsubInvoices = onSnapshot(collection(db, 'invoices'), (snapshot) => {
        const items = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
        setInvoices(items);
      }, (error) => {
        console.error("Firestore onSnapshot 'invoices' error:", error);
      });
      
      const unsubClicks = onSnapshot(collection(db, 'wa_clicks'), (snapshot) => {
        const items = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
        setWaClicks(items);
      }, (error) => {
        console.error("Firestore onSnapshot 'wa_clicks' error:", error);
      });

      const unsubEvents = onSnapshot(collection(db, 'analytics_events'), (snapshot) => {
        const items = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
        setAnalyticsEvents(items);
      }, (error) => {
        console.error("Firestore onSnapshot 'analytics_events' error:", error);
      });

      return () => {
        unsubInvoices();
        unsubClicks();
        unsubEvents();
      };
    } catch (e) {
      console.error("Failed to connect realtime listeners:", e);
    }
  }, [user]);

  // Operation status feedbacks
  const [operationState, setOperationState] = useState<{ status: 'idle' | 'loading' | 'success' | 'error'; message?: string }>({ status: 'idle' });

  // Map operationState to gorgeous toasts automatically
  useEffect(() => {
    if (operationState.status === 'success' && operationState.message) {
      addToast('success', 'Aksi Berhasil', operationState.message);
    } else if (operationState.status === 'error' && operationState.message) {
      addToast('error', 'Gagal', operationState.message);
    }
  }, [operationState]);

  // Preset default images extracted from static menu for quick click assignment
  const uniquePresets = React.useMemo(() => {
    const seen = new Set<string>();
    const list: { name: string; image: string }[] = [];
    MENU_ITEMS.forEach((item) => {
      if (!seen.has(item.image)) {
        seen.add(item.image);
        list.push({ name: item.name, image: item.image });
      }
    });
    return list;
  }, []);

  // Merge Firestore invoices with mock data
  const combinedInvoices = React.useMemo(() => {
    // Merge actual invoices with stable mock base. Prioritize firestore documents.
    const merged = [
      ...invoices,
      ...mockInvoicesData.filter(mock => !invoices.some(f => f.invoiceNo === mock.invoiceNo))
    ];
    return merged.sort((a, b) => b.createdAt - a.createdAt);
  }, [invoices, mockInvoicesData]);

  // Apply search query and filters
  const filteredAndSearchedInvoices = React.useMemo(() => {
    const nowTs = Date.now();
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const todayTs = startOfToday.getTime();
    
    // For weekly/monthly ranges, calculate exact relative timestamps
    const sevenDaysAgoTs = nowTs - 7 * 24 * 60 * 60 * 1000;
    const thirtyDaysAgoTs = nowTs - 30 * 24 * 60 * 60 * 1000;

    return combinedInvoices.filter(inv => {
      // Date filter
      if (invoiceFilterDate === 'hari' && inv.createdAt < todayTs) return false;
      if (invoiceFilterDate === 'minggu' && inv.createdAt < sevenDaysAgoTs) return false;
      if (invoiceFilterDate === 'bulan' && inv.createdAt < thirtyDaysAgoTs) return false;

      // Method filter
      if (invoiceFilterMethod !== 'ALL' && inv.method !== invoiceFilterMethod) return false;

      // Payment filter
      if (invoiceFilterPayment !== 'ALL' && inv.payment !== invoiceFilterPayment) return false;

      // Search query (invoiceNo, customer name, phone number)
      if (invoiceSearch.trim()) {
        const query = invoiceSearch.toLowerCase();
        const noVal = (inv.invoiceNo || inv.id || '').toLowerCase();
        const nameVal = (inv.name || '').toLowerCase();
        const phoneVal = (inv.phone || '').toLowerCase();
        if (!noVal.includes(query) && !nameVal.includes(query) && !phoneVal.includes(query)) {
          return false;
        }
      }

      return true;
    });
  }, [combinedInvoices, invoiceFilterDate, invoiceFilterMethod, invoiceFilterPayment, invoiceSearch]);

  // Total invoice & total conversion variables for general stats
  const totalInvoicesToday = React.useMemo(() => {
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    return combinedInvoices.filter(i => i.createdAt >= startOfToday.getTime()).length;
  }, [combinedInvoices]);

  const totalInvoicesMonth = React.useMemo(() => {
    const startOfThisMonth = new Date();
    startOfThisMonth.setDate(1);
    startOfThisMonth.setHours(0, 0, 0, 0);
    return combinedInvoices.filter(i => i.createdAt >= startOfThisMonth.getTime()).length;
  }, [combinedInvoices]);

  // Real-time consolidated analytics tracking calculator (Always-on traffic & conversions)
  const analyticsStats = React.useMemo(() => {
    const nowTs = Date.now();
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const todayTs = startOfToday.getTime();
    const sevenDaysAgoTs = nowTs - 7 * 24 * 60 * 60 * 1000;
    const thirtyDaysAgoTs = nowTs - 30 * 24 * 60 * 60 * 1000;

    // Filter events by selected date range
    const filteredEvents = combinedEvents.filter(ev => {
      if (invoiceFilterDate === 'hari' && ev.timestamp < todayTs) return false;
      if (invoiceFilterDate === 'minggu' && ev.timestamp < sevenDaysAgoTs) return false;
      if (invoiceFilterDate === 'bulan' && ev.timestamp < thirtyDaysAgoTs) return false;
      return true;
    });

    // 1. Web Visits
    const totalVisits = filteredEvents.filter(e => e.type === 'web_visit').length;

    // 2. Menu clicks / individual product detail views
    const productClickEvents = filteredEvents.filter(e => e.type === 'product_click');
    const totalProductClicks = productClickEvents.length;

    const productClicksMap: Record<string, { id: string, name: string, count: number }> = {};
    productClickEvents.forEach(e => {
      const key = e.itemId || e.itemName || 'Unk';
      if (!productClicksMap[key]) {
        productClicksMap[key] = { id: key, name: e.itemName || 'Unknown Product', count: 0 };
      }
      productClicksMap[key].count += 1;
    });
    const topClickedProductsList = Object.values(productClicksMap).sort((a,b) => b.count - a.count).slice(0, 5);

    // 3. Add to cart events
    const addToCartEvents = filteredEvents.filter(e => e.type === 'add_to_cart');
    const totalAddToCartCount = addToCartEvents.reduce((acc, current) => acc + (current.quantity || 1), 0);

    const cartAdditionsMap: Record<string, { id: string, name: string, count: number }> = {};
    addToCartEvents.forEach(e => {
      const key = e.itemId || e.itemName || 'Unk';
      if (!cartAdditionsMap[key]) {
        cartAdditionsMap[key] = { id: key, name: e.itemName || 'Unknown Product', count: 0 };
      }
      cartAdditionsMap[key].count += (e.quantity || 1);
    });
    const topCartProductsList = Object.values(cartAdditionsMap).sort((a,b) => b.count - a.count).slice(0, 5);

    // 4. Invoices created (Event-based & document-based consistency)
    const totalInvoicesEventCount = filteredInvoices => filteredAndSearchedInvoices.length; // Use documents directly for robust count

    // 5. PNG receipt downloads
    const totalDownloads = filteredEvents.filter(e => e.type === 'download_receipt').length;

    // 6. WhatsApp clicks in that period
    const filteredClicks = waClicks.filter(c => {
      const t = c.timestamp || c.createdAt || nowTs;
      if (invoiceFilterDate === 'hari' && t < todayTs) return false;
      if (invoiceFilterDate === 'minggu' && t < sevenDaysAgoTs) return false;
      if (invoiceFilterDate === 'bulan' && t < thirtyDaysAgoTs) return false;
      return true;
    });
    const totalWaClicksConverted = filteredClicks.length;

    // 7. Hourly visitor peak index (24 hours array for web_visit)
    const hoverVisitsArray = Array(24).fill(0);
    combinedEvents.filter(e => e.type === 'web_visit').forEach(e => {
      const date = new Date(e.timestamp);
      hoverVisitsArray[date.getHours()] += 1;
    });
    let peakVisitHourMax = -1;
    let peakVisitHourVal = -1;
    for (let h = 0; h < 24; h++) {
      if (hoverVisitsArray[h] > peakVisitHourMax) {
        peakVisitHourMax = hoverVisitsArray[h];
        peakVisitHourVal = h;
      }
    }
    const peakVisitHourFormatted = peakVisitHourVal !== -1 ? `${peakVisitHourVal.toString().padStart(2, '0')}.00 WIB` : 'Belum Ada';

    // 8. Hourly billing/booking peak index (24 hours array for invoices created)
    const hoverOrdersArray = Array(24).fill(0);
    filteredAndSearchedInvoices.forEach(inv => {
      const date = new Date(inv.createdAt);
      hoverOrdersArray[date.getHours()] += 1;
    });
    let peakOrderHourMax = -1;
    let peakOrderHourVal = -1;
    for (let h = 0; h < 24; h++) {
      if (hoverOrdersArray[h] > peakOrderHourMax) {
        peakOrderHourMax = hoverOrdersArray[h];
        peakOrderHourVal = h;
      }
    }
    const peakOrderHourFormatted = peakOrderHourVal !== -1 ? `${peakOrderHourVal.toString().padStart(2, '0')}.00 WIB` : 'Belum Ada';

    return {
      totalVisits,
      totalProductClicks,
      topClickedProductsList,
      totalAddToCartCount,
      topCartProductsList,
      totalInvoicesEventCount: filteredAndSearchedInvoices.length,
      totalDownloads,
      totalWaClicksConverted,
      peakVisitHourFormatted,
      peakOrderHourFormatted,
      hoverVisitsArray,
      hoverOrdersArray
    };
  }, [combinedEvents, filteredAndSearchedInvoices, waClicks, invoiceFilterDate]);

  // Current stats in FILTER range
  const currentStats = React.useMemo(() => {
    const totalOrders = filteredAndSearchedInvoices.length;
    const totalRevenue = filteredAndSearchedInvoices.reduce((acc, current) => acc + (current.total || 0), 0);
    const totalDineIn = filteredAndSearchedInvoices.filter(i => i.method === 'DINE_IN').length;
    const totalTakeAway = filteredAndSearchedInvoices.filter(i => i.method === 'TAKE_AWAY').length;
    const totalInvoicesCreated = filteredAndSearchedInvoices.length;
    
    // Whatapp Conversion tracking
    // Conversion is recorded if clickWA is true, or if status says sent/confirmed/done (which implies successful WA checkout)
    const whatsappConversions = filteredAndSearchedInvoices.filter(i => i.clickWA === true || i.status !== 'Baru dibuat').length;
    const conversionRate = totalInvoicesCreated > 0 ? (whatsappConversions / totalInvoicesCreated) * 100 : 0;

    return {
      totalOrders,
      totalRevenue,
      totalDineIn,
      totalTakeAway,
      totalInvoicesCreated,
      whatsappConversions,
      conversionRate
    };
  }, [filteredAndSearchedInvoices]);

  // Product analytical calculations
  const productStats = React.useMemo(() => {
    const statsMap: Record<string, { id: string, name: string, price: number, totalOrders: number, totalQty: number, dineInQty: number, takeAwayQty: number, category: string }> = {};
    
    filteredAndSearchedInvoices.forEach(inv => {
      inv.items?.forEach((item: any) => {
        const itemInfo = item.menuItem;
        if (!itemInfo) return;
        const itemId = itemInfo.id || itemInfo.name;
        const qty = Number(item.quantity || 0);

        if (!statsMap[itemId]) {
          statsMap[itemId] = {
            id: itemId,
            name: itemInfo.name,
            price: itemInfo.price || 0,
            totalOrders: 0,
            totalQty: 0,
            dineInQty: 0,
            takeAwayQty: 0,
            category: itemInfo.category || 'LAINNYA'
          };
        }
        
        statsMap[itemId].totalOrders += 1;
        statsMap[itemId].totalQty += qty;
        if (inv.method === 'DINE_IN') {
          statsMap[itemId].dineInQty += qty;
        } else {
          statsMap[itemId].takeAwayQty += qty;
        }
      });
    });

    const statsArray = Object.values(statsMap).sort((a, b) => b.totalQty - a.totalQty);
    
    // Find absolute top products
    const bestProduct = statsArray[0] || null;
    const bestDineInProduct = [...statsArray].sort((a, b) => b.dineInQty - a.dineInQty)[0] || null;
    const bestTakeAwayProduct = [...statsArray].sort((a, b) => b.takeAwayQty - a.takeAwayQty)[0] || null;

    return {
      tableData: statsArray,
      bestProduct,
      bestDineInProduct,
      bestTakeAwayProduct
    };
  }, [filteredAndSearchedInvoices]);

  // Schedule operational peak analytics
  const hourlyStats = React.useMemo(() => {
    const dineInHours = Array(24).fill(0);
    const takeAwayHours = Array(24).fill(0);
    const totalHours = Array(24).fill(0);

    filteredAndSearchedInvoices.forEach(inv => {
      const date = new Date(inv.createdAt);
      const hour = date.getHours();
      if (hour >= 0 && hour < 24) {
        totalHours[hour] += 1;
        if (inv.method === 'DINE_IN') {
          dineInHours[hour] += 1;
        } else {
          takeAwayHours[hour] += 1;
        }
      }
    });

    // Peak hours
    let peakDineInHour = -1;
    let peakDineInCount = -1;
    let peakTakeAwayHour = -1;
    let peakTakeAwayCount = -1;
    let peakOverallHour = -1;
    let peakOverallCount = -1;

    for (let h = 0; h < 24; h++) {
      if (dineInHours[h] > peakDineInCount) {
        peakDineInCount = dineInHours[h];
        peakDineInHour = h;
      }
      if (takeAwayHours[h] > peakTakeAwayCount) {
        peakTakeAwayCount = takeAwayHours[h];
        peakTakeAwayHour = h;
      }
      if (totalHours[h] > peakOverallCount) {
        peakOverallCount = totalHours[h];
        peakOverallHour = h;
      }
    }

    // Operating hours are mostly 16:00 - 23:00. Let's slice the charts to show hours 16 to 23 (8 hours) for high density!
    const activeHours = [16, 17, 18, 19, 20, 21, 22, 23];

    return {
      dineInHours,
      takeAwayHours,
      totalHours,
      peakDineInHour: peakDineInHour === -1 ? 'Belum Ada' : `${peakDineInHour.toString().padStart(2, '0')}.00 WIB`,
      peakTakeAwayHour: peakTakeAwayHour === -1 ? 'Belum Ada' : `${peakTakeAwayHour.toString().padStart(2, '0')}.00 WIB`,
      peakOverallHour: peakOverallHour === -1 ? 'Belum Ada' : `${peakOverallHour.toString().padStart(2, '0')}.00 WIB`,
      activeHours
    };
  }, [filteredAndSearchedInvoices]);

  const dailyBusyStats = React.useMemo(() => {
    const dayCounts = Array(7).fill(0);
    const dayNames = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

    filteredAndSearchedInvoices.forEach(inv => {
      const d = new Date(inv.createdAt);
      dayCounts[d.getDay()] += 1;
    });

    let peakDayIdx = -1;
    let peakDayCount = -1;
    for (let d = 0; d < 7; d++) {
      if (dayCounts[d] > peakDayCount) {
        peakDayCount = dayCounts[d];
        peakDayIdx = d;
      }
    }

    return {
      dayCounts,
      dayNames,
      peakDayName: peakDayIdx === -1 ? 'Belum Ada' : dayNames[peakDayIdx]
    };
  }, [filteredAndSearchedInvoices]);

  // Operational smart insights from today's active flow
  const operationalInsight = React.useMemo(() => {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayTs = todayStart.getTime();

    const todayInvoices = combinedInvoices.filter(i => i.createdAt >= todayTs);
    
    const todayProductQuantities: Record<string, { name: string, qty: number }> = {};
    todayInvoices.forEach(inv => {
      inv.items?.forEach((item: any) => {
        const itemInfo = item.menuItem;
        if (!itemInfo) return;
        if (!todayProductQuantities[itemInfo.id || itemInfo.name]) {
          todayProductQuantities[itemInfo.id || itemInfo.name] = { name: itemInfo.name, qty: 0 };
        }
        todayProductQuantities[itemInfo.id || itemInfo.name].qty += Number(item.quantity || 0);
      });
    });
    const sortedTodayProducts = Object.values(todayProductQuantities).sort((a,b) => b.qty - a.qty);
    const topProductToday = sortedTodayProducts[0]?.name || 'Belum Ada Order';

    const hourCountsToday = Array(24).fill(0);
    todayInvoices.forEach(inv => {
      const d = new Date(inv.createdAt);
      hourCountsToday[d.getHours()] += 1;
    });
    let peakHourToday = -1;
    let peakHourTodayCount = 0;
    for (let h = 0; h < 24; h++) {
      if (hourCountsToday[h] > peakHourTodayCount) {
        peakHourTodayCount = hourCountsToday[h];
        peakHourToday = h;
      }
    }
    const busyHourToday = peakHourToday !== -1 ? `${peakHourToday.toString().padStart(2, '0')}.00 WIB` : 'Belum Ada Order';

    let dineInCount = 0;
    let takeAwayCount = 0;
    filteredAndSearchedInvoices.forEach(inv => {
      if (inv.method === 'DINE_IN') dineInCount++;
      else takeAwayCount++;
    });
    
    let dominantOrder = 'Sama Rata';
    if (dineInCount > takeAwayCount) {
      dominantOrder = 'Dine In (Makan di Sini)';
    } else if (takeAwayCount > dineInCount) {
      dominantOrder = 'Take Away';
    }

    let totalItemsCount = 0;
    filteredAndSearchedInvoices.forEach(inv => {
      inv.items?.forEach((i: any) => {
        totalItemsCount += Number(i.quantity || 0);
      });
    });
    const avgItemsPerOrder = filteredAndSearchedInvoices.length > 0 
      ? (totalItemsCount / filteredAndSearchedInvoices.length).toFixed(1) 
      : '0.0';

    return {
      topProductToday,
      busyHourToday,
      dominantOrder,
      avgItemsPerOrder
    };
  }, [combinedInvoices, filteredAndSearchedInvoices]);

  // Line chart trends representation
  const trendChartData = React.useMemo(() => {
    const datesMap: Record<string, { label: string, totalOrders: number, totalRevenue: number }> = {};
    const daysToShow = invoiceFilterDate === 'hari' ? 1 : invoiceFilterDate === 'minggu' ? 7 : 30;

    const nowTs = Date.now();
    for (let i = daysToShow - 1; i >= 0; i--) {
      const d = new Date(nowTs - i * 24 * 60 * 60 * 1000);
      const label = d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short' });
      const key = `${d.getFullYear()}-${(d.getMonth()+1).toString().padStart(2, '0')}-${d.getDate().toString().padStart(2, '0')}`;
      datesMap[key] = { label, totalOrders: 0, totalRevenue: 0 };
    }

    combinedInvoices.forEach(inv => {
      const d = new Date(inv.createdAt);
      const key = `${d.getFullYear()}-${(d.getMonth()+1).toString().padStart(2, '0')}-${d.getDate().toString().padStart(2, '0')}`;
      if (datesMap[key]) {
        datesMap[key].totalOrders += 1;
        datesMap[key].totalRevenue += (inv.total || 0);
      }
    });

    const list = Object.values(datesMap);
    const maxVal = Math.max(...list.map(o => o.totalOrders), 1);
    
    return {
      list,
      maxVal
    };
  }, [combinedInvoices, invoiceFilterDate]);

  // Bar chart category representation
  const categoryChartData = React.useMemo(() => {
    const categoriesMap: Record<string, number> = {};
    
    filteredAndSearchedInvoices.forEach(inv => {
      inv.items?.forEach((item: any) => {
        const cat = item.menuItem?.category || 'LAINNYA';
        const qty = Number(item.quantity || 0);
        categoriesMap[cat] = (categoriesMap[cat] || 0) + qty;
      });
    });

    const list = Object.entries(categoriesMap).map(([name, qty]) => ({ name, qty })).sort((a,b) => b.qty - a.qty);
    const maxVal = Math.max(...list.map(c => c.qty), 1);

    return {
      list,
      maxVal
    };
  }, [filteredAndSearchedInvoices]);

  // Invoice mutators inside Admin Panel
  const handleUpdateInvoiceStatus = async (invoiceNo: string, newStatus: string) => {
    try {
      await setDoc(doc(db, 'invoices', invoiceNo), { status: newStatus }, { merge: true });
      addToast('success', 'Status Berhasil Diperbarui', `Status invoice ${invoiceNo} diganti ke "${newStatus}".`);
    } catch (err) {
      console.error(err);
      addToast('error', 'Gagal Memperbarui Status', 'Kesalahan koneksi database.');
    }
  };

  const handleDeleteInvoice = async (invoiceNo: string) => {
    requestConfirm(
      'Hapus Data Invoice',
      `Apakah Anda yakin ingin menghapus data invoice ${invoiceNo}? Tindakan ini akan menghapusnya secara permanen dari Cloud database.`,
      async () => {
        try {
          await deleteDoc(doc(db, 'invoices', invoiceNo));
          addToast('success', 'Invoice Dihapus', `Data invoice ${invoiceNo} berhasil dihapus.`);
        } catch (err) {
          console.error(err);
          addToast('error', 'Gagal Menghapus', 'Gagal menghapus dari database.');
        }
      },
      'Ya, Hapus',
      'danger'
    );
  };

  const handleExportCSV = () => {
    try {
      let csvContent = 'data:text/csv;charset=utf-8,';
      csvContent += 'ID Invoice,Tanggal,Nama Pelanggan,No Telepon,Metode,Metode Pembayaran,Total,Status,Konversi WA\n';

      filteredAndSearchedInvoices.forEach(inv => {
        const cleanName = (inv.name || '').replace(/,/g, ' ');
        const cleanDate = (inv.orderDate || '').replace(/,/g, ' ');
        const row = [
          inv.invoiceNo || inv.id,
          cleanDate,
          cleanName,
          inv.phone || '',
          inv.method === 'DINE_IN' ? 'Dine In' : 'Take Away',
          inv.payment || '',
          inv.total || 0,
          inv.status || 'Baru dibuat',
          inv.clickWA ? 'YA' : 'TIDAK'
        ].join(',');
        csvContent += row + '\n';
      });

      const encodedUri = encodeURI(csvContent);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', `SukiYuSuki_Invoices_Export_${invoiceFilterDate}_${invoiceFilterMethod}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      addToast('success', 'Ekspor Berhasil', 'Data invoice berhasil diekspor ke file CSV.');
    } catch (e) {
      console.error(e);
      addToast('error', 'Ekspor Gagal', 'Sistem gagal menyelesaikan ekspor data.');
    }
  };

  const handleResetAnalytics = () => {
    requestConfirm(
      'Bersihkan Data Analitik?',
      'Apakah Anda yakin ingin menghapus semua data transaksi invoice dan data klik WhatsApp di database? Tindakan ini akan menghapus semua riwayat analitik secara permanen dan mereset simulasi data masa lalu agar mulai bersih dari hari ini.',
      async () => {
        setOperationState({ status: 'loading', message: 'Sedang membersihkan data analitik...' });
        try {
          // Delete actual invoices in Firestore
          for (const inv of invoices) {
            await deleteDoc(doc(db, 'invoices', inv.id || inv.invoiceNo));
          }
           // Delete actual clicks in Firestore
          for (const clk of waClicks) {
            await deleteDoc(doc(db, 'wa_clicks', clk.id));
          }
          // Delete actual analytics events in Firestore
          for (const ev of analyticsEvents) {
            try {
              await deleteDoc(doc(db, 'analytics_events', ev.id));
            } catch (err) {
              console.error('Error clearing event:', ev.id, err);
            }
          }
          
          // Force mock invoices to be empty and store the choice in localStorage to prevent regeneration
          localStorage.setItem('suki_yusuki_analytics_cleaned', 'true');
          setMockInvoicesData([]);
          setMockAnalyticsEventsData([]);
          
          setOperationState({
            status: 'success',
            message: 'Semua data analitik berhasil dibersihkan! Mulai lembar baru hari ini.'
          });
        } catch (error) {
          setOperationState({ status: 'error', message: 'Ada masalah saat membersihkan data.' });
          console.error(error);
        }
      },
      'Ya, Bersihkan',
      'danger'
    );
  };

  // Update logo input if logoUrl prop loads
  useEffect(() => {
    if (logoUrl) {
      setLogoInput(logoUrl);
    }
  }, [logoUrl]);

  const handleDirectLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);

    const u = typedUsername.trim();
    const p = typedPassword;

    if (!u || !p) {
      setAuthError('Silakan isi username dan password.');
      addToast('error', 'Masuk Gagal', 'Username dan password wajib diisi.');
      return;
    }

    const ACCOUNTS = [
      { username: 'bisdigc6', password: 'capstone123' },
      { username: 'officialsuki123', password: 'yusuki123' }
    ];

    const matched = ACCOUNTS.find(
      (acc) => acc.username.toLowerCase() === u.toLowerCase() && acc.password === p
    );

    if (matched) {
      const loggedUser = { username: matched.username, email: `${matched.username}@sukiyusuki.admin` };
      localStorage.setItem('suki_yusuki_admin', JSON.stringify(loggedUser));
      setUser(loggedUser);
      setTypedUsername('');
      setTypedPassword('');
      addToast('success', 'Akses Diberikan', `Selamat datang kembali, ${matched.username}!`);
    } else {
      setAuthError('Username atau password salah.');
      addToast('error', 'Autentikasi Gagal', 'Username atau password yang Anda masukkan tidak terdaftar.');
    }
  };

  const handleLogout = async () => {
    try {
      localStorage.removeItem('suki_yusuki_admin');
      setUser(null);
      addToast('info', 'Sesi Berakhir', 'Anda telah keluar dari halaman panel admin.');
    } catch (err) {
      console.error(err);
      addToast('error', 'Gagal Keluar', 'Gagal mengeluarkan sesi admin saat ini.');
    }
  };

  const handleInitializeDb = () => {
    requestConfirm(
      'Impor Menu Bawaan',
      'Apakah Anda yakin ingin mengimpor semua 34 menu bawaan Suki Yusuki ke database cloud Firestore? Ini akan menimpa data menu yang memiliki ID sama.',
      async () => {
        setOperationState({ status: 'loading', message: 'Sedang mengimpor menu bawaan...' });
        try {
          let importedCount = 0;
          for (const item of MENU_ITEMS) {
            const itemRef = doc(db, 'menu_items', item.id);
            const savedItem = {
              id: item.id,
              name: item.name,
              price: Number(item.price),
              category: item.category,
              description: item.description,
              image: item.image,
              isBestSeller: !!item.isBestSeller,
              tags: item.tags || [],
            };
            await setDoc(itemRef, savedItem);
            importedCount++;
          }
          setOperationState({
            status: 'success',
            message: `Berhasil mengimpor ${importedCount} menu bawaan ke Firestore!`
          });
        } catch (error) {
          setOperationState({ status: 'error', message: 'Gagal mengimpor menu. Silakan periksa koneksi.' });
          handleFirestoreError(error, OperationType.WRITE, 'menu_items');
        }
      },
      'Ya, Impor Semua',
      'primary'
    );
  };

  const isFromDb = (id: string) => {
    return dbMenuItems.some((dItem) => dItem.id === id && !dItem.isDeleted);
  };

  const handleRestoreDefaults = () => {
    requestConfirm(
      'Pulihkan Menu Default',
      'Apakah Anda yakin ingin memulihkan semua menu default bawaan yang sebelumnya disembunyikan/dihapus?',
      async () => {
        setOperationState({ status: 'loading', message: 'Sedang memulihkan menu default...' });
        try {
          let restoredCount = 0;
          for (const dItem of dbMenuItems) {
            if (dItem.isDeleted) {
              await deleteDoc(doc(db, 'menu_items', dItem.id));
              restoredCount++;
            }
          }
          setOperationState({ status: 'success', message: `Berhasil memulihkan ${restoredCount} menu bawaan!` });
        } catch (error) {
          setOperationState({ status: 'error', message: 'Gagal memulihkan menu.' });
          handleFirestoreError(error, OperationType.DELETE, 'menu_items');
        }
      },
      'Ya, Pulihkan',
      'primary'
    );
  };

  const handleSaveLogo = async () => {
    setOperationState({ status: 'loading', message: 'Menyimpan logo baru...' });
    try {
      const settingsRef = doc(db, 'settings', 'app');
      await setDoc(settingsRef, { logoUrl: logoInput }, { merge: true });
      if (onLogoChange) {
        onLogoChange(logoInput);
      }
      setOperationState({ status: 'success', message: 'Logo berhasil disimpan dan diperbarui!' });
    } catch (error) {
      setOperationState({ status: 'error', message: 'Gagal menyimpan logo.' });
      handleFirestoreError(error, OperationType.WRITE, 'settings/app');
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setOperationState({ status: 'loading', message: 'Menyimpan pengaturan...' });
    try {
      const settingsRef = doc(db, 'settings', 'app');
      await setDoc(settingsRef, {
        logoUrl: logoInput,
        outletName: formOutletName,
        outletAddress: formOutletAddress,
        outletDescription: formOutletDescription,
        outletGmaps: formOutletGmaps,
        operatingHours: formOperatingHours,
        operatingHoursSub: formOperatingHoursSub,
        operatingDays: formOperatingDays,
        operatingDaysSub: formOperatingDaysSub,
        whatsappNumber: formWhatsappNumber,
        whatsappName: formWhatsappName,
        whatsappHandle: formWhatsappHandle,
        instagramUrl: formInstagramUrl,
        instagramHandle: formInstagramHandle,
        tiktokUrl: formTiktokUrl,
        tiktokHandle: formTiktokHandle,
        shopeefoodUrl: formShopeefoodUrl,
        gofoodUrl: formGofoodUrl,
        heroImageUrl: formHeroImageUrl,
        aboutUsImageUrl: formAboutUsImageUrl,
      }, { merge: true });

      if (onLogoChange) {
        onLogoChange(logoInput);
      }
      setOperationState({ status: 'success', message: 'Semua pengaturan umum berhasil diperbarui di database!' });
      setTimeout(() => setOperationState({ status: 'idle' }), 3000);
    } catch (error) {
      setOperationState({ status: 'error', message: 'Gagal menyimpan pengaturan.' });
      handleFirestoreError(error, OperationType.WRITE, 'settings/app');
    }
  };

  // Testimony Modals triggers
  const handleOpenTestimonyForm = (testimony?: Testimonial) => {
    if (testimony) {
      setSelectedTestimonial(testimony);
      setTestimonyName(testimony.name);
      setTestimonyRole(testimony.role);
      setTestimonyText(testimony.text);
      setTestimonyRating(testimony.rating);
      setTestimonyAvatar(testimony.avatar);
      setTestimonyDate(testimony.date || '');
    } else {
      setSelectedTestimonial(null);
      setTestimonyName('');
      setTestimonyRole('Pelanggan Setia');
      setTestimonyText('');
      setTestimonyRating(5);
      setTestimonyAvatar('https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80');
      setTestimonyDate(new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }));
    }
    setIsTestimonyFormOpen(true);
  };

  const handleSaveTestimonialForm = async (e: React.FormEvent) => {
    e.preventDefault();
    setOperationState({ status: 'loading', message: 'Menyimpan testimoni...' });
    const id = selectedTestimonial ? selectedTestimonial.id : `testimony-${Date.now()}`;
    const payload = {
      id,
      name: testimonyName,
      role: testimonyRole,
      text: testimonyText,
      rating: Number(testimonyRating),
      avatar: testimonyAvatar,
      date: testimonyDate,
    };
    try {
      await setDoc(doc(db, 'testimonials', id), payload);
      setOperationState({ status: 'success', message: 'Testimoni ulasan berhasil disimpan ke cloud!' });
      setIsTestimonyFormOpen(false);
      setSelectedTestimonial(null);
      setTimeout(() => setOperationState({ status: 'idle' }), 3000);
    } catch (error) {
      setOperationState({ status: 'error', message: 'Gagal menyimpan testimoni.' });
    }
  };

  const handleDeleteTestimonialForm = (id: string) => {
    requestConfirm(
      'Hapus Testimoni',
      'Apakah Anda yakin ingin menghapus ulasan testimoni ini dari website?',
      async () => {
        setOperationState({ status: 'loading', message: 'Menghapus testimoni...' });
        try {
          await deleteDoc(doc(db, 'testimonials', id));
          setOperationState({ status: 'success', message: 'Testimoni sukses dihapus!' });
          setTimeout(() => setOperationState({ status: 'idle' }), 3000);
        } catch (error) {
          setOperationState({ status: 'error', message: 'Gagal menghapus testimoni.' });
        }
      },
      'Ya, Hapus',
      'danger'
    );
  };

  // FAQ CRUD handlers
  const handleOpenFaqForm = (faq?: FaqItem) => {
    if (faq) {
      setSelectedFaq(faq);
      setFaqQuestion(faq.question);
      setFaqAnswer(faq.answer);
    } else {
      setSelectedFaq(null);
      setFaqQuestion('');
      setFaqAnswer('');
    }
    setIsFaqFormOpen(true);
  };

  const handleSaveFaqForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!faqQuestion.trim() || !faqAnswer.trim()) {
      addToast('error', 'Gagal', 'Pertanyaan dan jawaban wajib diisi!');
      return;
    }
    setOperationState({ status: 'loading', message: 'Menyimpan FAQ...' });
    const id = selectedFaq ? selectedFaq.id : `faq-${Date.now()}`;
    const payload = {
      id,
      question: faqQuestion.trim(),
      answer: faqAnswer.trim(),
    };
    try {
      await setDoc(doc(db, 'faqs', id), payload);
      setOperationState({ status: 'success', message: 'FAQ berhasil disimpan!' });
      setIsFaqFormOpen(false);
      setSelectedFaq(null);
      setTimeout(() => setOperationState({ status: 'idle' }), 3000);
    } catch (error) {
      setOperationState({ status: 'error', message: 'Gagal menyimpan FAQ.' });
    }
  };

  const handleDeleteFaq = (id: string) => {
    requestConfirm(
      'Hapus FAQ',
      'Apakah Anda yakin ingin menghapus FAQ ini?',
      async () => {
        setOperationState({ status: 'loading', message: 'Menghapus FAQ...' });
        try {
          const isDefault = FAQS.some(x => x.id === id);
          if (isDefault) {
            await setDoc(doc(db, 'faqs', id), {
              id,
              isDeleted: true,
              question: '',
              answer: ''
            });
          } else {
            await deleteDoc(doc(db, 'faqs', id));
          }
          setOperationState({ status: 'success', message: 'FAQ sukses dihapus!' });
          setTimeout(() => setOperationState({ status: 'idle' }), 3000);
        } catch (error) {
          setOperationState({ status: 'error', message: 'Gagal menghapus FAQ.' });
        }
      },
      'Ya, Hapus',
      'danger'
    );
  };

  // About Slides CRUD handlers
  const handleOpenAboutSlideForm = (slide?: AboutSlideItem) => {
    if (slide) {
      setSelectedAboutSlide(slide);
      setAboutSlideTitle(slide.title);
      setAboutSlideSubtitle(slide.subtitle || '');
      setAboutSlideImage(slide.image);
      setAboutSlideParagraphs(slide.paragraphs ? slide.paragraphs.join('\n\n') : '');
      setAboutSlideBullet1Title(slide.bullet1Title || '');
      setAboutSlideBullet1Desc(slide.bullet1Desc || '');
      setAboutSlideBullet2Title(slide.bullet2Title || '');
      setAboutSlideBullet2Desc(slide.bullet2Desc || '');
    } else {
      setSelectedAboutSlide(null);
      setAboutSlideTitle('');
      setAboutSlideSubtitle('');
      setAboutSlideImage('');
      setAboutSlideParagraphs('');
      setAboutSlideBullet1Title('');
      setAboutSlideBullet1Desc('');
      setAboutSlideBullet2Title('');
      setAboutSlideBullet2Desc('');
    }
    setIsAboutSlideFormOpen(true);
  };

  const handleSaveAboutSlideForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aboutSlideTitle.trim()) {
      addToast('error', 'Gagal', 'Judul Kisah wajib diisi!');
      return;
    }
    const paraArr = aboutSlideParagraphs
      .split('\n')
      .map((p) => p.trim())
      .filter((p) => p.length > 0);

    if (paraArr.length === 0) {
      addToast('error', 'Gagal', 'Narasi cerita minimal harus memiliki 1 paragraf!');
      return;
    }

    setOperationState({ status: 'loading', message: 'Menyimpan Kisah Tentang Kami...' });
    const id = selectedAboutSlide ? selectedAboutSlide.id : `about-${Date.now()}`;
    const payload = {
      id,
      title: aboutSlideTitle.trim(),
      subtitle: aboutSlideSubtitle.trim() || 'Kisah Tentang Kami',
      image: aboutSlideImage || '/src/assets/images/yusuki_physical_outlet_1780673086306.png',
      paragraphs: paraArr,
      bullet1Title: aboutSlideBullet1Title.trim() || null,
      bullet1Desc: aboutSlideBullet1Desc.trim() || null,
      bullet2Title: aboutSlideBullet2Title.trim() || null,
      bullet2Desc: aboutSlideBullet2Desc.trim() || null
    };

    try {
      await setDoc(doc(db, 'about_slides', id), payload);
      setOperationState({ status: 'success', message: 'Kisah Tentang Kami berhasil disimpan!' });
      setIsAboutSlideFormOpen(false);
      setSelectedAboutSlide(null);
      setTimeout(() => setOperationState({ status: 'idle' }), 3000);
    } catch (error) {
      setOperationState({ status: 'error', message: 'Gagal menyimpan Kisah Tentang Kami.' });
    }
  };

  const handleDeleteAboutSlide = (id: string) => {
    requestConfirm(
      'Hapus Kisah Tentang Kami',
      'Apakah Anda yakin ingin menghapus slide kisah ini?',
      async () => {
        setOperationState({ status: 'loading', message: 'Menghapus slide kisah...' });
        try {
          const isDefault = DEFAULT_ABOUT_SLIDES.some((x) => x.id === id);
          if (isDefault) {
            await setDoc(doc(db, 'about_slides', id), {
              id,
              isDeleted: true,
              title: '',
              paragraphs: []
            });
          } else {
            await deleteDoc(doc(db, 'about_slides', id));
          }
          setOperationState({ status: 'success', message: 'Slide kisah sukses dihapus!' });
          setTimeout(() => setOperationState({ status: 'idle' }), 3000);
        } catch (error) {
          setOperationState({ status: 'error', message: 'Gagal menghapus slide kisah.' });
        }
      },
      'Ya, Hapus',
      'danger'
    );
  };

  const handleAboutSlideDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingAboutSlideImage(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setIsProcessingAboutSlideImage(true);
      try {
        const compressedBase64 = await resizeAndProcessImage(file);
        setAboutSlideImage(compressedBase64);
        addToast('success', 'Unggah Sukses', 'Foto berhasil dikompresi untuk slide.');
      } catch (err) {
        addToast('error', 'Unggah Gagal', 'Kesalahan pemrosesan berkas foto.');
      } finally {
        setIsProcessingAboutSlideImage(false);
      }
    }
  };

  const handleAboutSlideFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setIsProcessingAboutSlideImage(true);
      try {
        const compressedBase64 = await resizeAndProcessImage(file);
        setAboutSlideImage(compressedBase64);
        addToast('success', 'Unggah Sukses', 'Foto berhasil dikompresi untuk slide.');
      } catch (err) {
        addToast('error', 'Unggah Gagal', 'Kesalahan pemrosesan berkas foto.');
      } finally {
        setIsProcessingAboutSlideImage(false);
      }
    }
  };

  // Info Tambahan CRUD handlers
  const handleOpenInfoTambahanForm = (item?: InfoTambahanItem) => {
    if (item) {
      setSelectedInfoTambahan(item);
      setInfoTambahanTitle(item.title);
      setInfoTambahanDesc(item.desc);
      setInfoTambahanType(item.type);
      setInfoTambahanIcon(item.icon);
    } else {
      setSelectedInfoTambahan(null);
      setInfoTambahanTitle('');
      setInfoTambahanDesc('');
      setInfoTambahanType('quality');
      setInfoTambahanIcon('Sparkles');
    }
    setIsInfoTambahanFormOpen(true);
  };

  const handleSaveInfoTambahanForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!infoTambahanTitle.trim() || !infoTambahanDesc.trim()) {
      addToast('error', 'Gagal', 'Judul dan Deskripsi wajib diisi!');
      return;
    }
    setOperationState({ status: 'loading', message: 'Menyimpan Info Tambahan...' });
    const id = selectedInfoTambahan ? selectedInfoTambahan.id : `info-${Date.now()}`;
    const payload = {
      id,
      title: infoTambahanTitle.trim(),
      desc: infoTambahanDesc.trim(),
      type: infoTambahanType,
      icon: infoTambahanIcon,
    };
    try {
      await setDoc(doc(db, 'info_tambahan', id), payload);
      setOperationState({ status: 'success', message: 'Info tambahan berhasil disimpan!' });
      setIsInfoTambahanFormOpen(false);
      setSelectedInfoTambahan(null);
      setTimeout(() => setOperationState({ status: 'idle' }), 3000);
    } catch (error) {
      setOperationState({ status: 'error', message: 'Gagal menyimpan info tambahan.' });
    }
  };

  const handleDeleteInfoTambahan = (id: string) => {
    requestConfirm(
      'Hapus Info Tambahan',
      'Apakah Anda yakin ingin menghapus info tambahan keunggulan/keuntungan ini?',
      async () => {
        setOperationState({ status: 'loading', message: 'Menghapus data...' });
        try {
          const isDefault = DEFAULT_INFO_TAMBAHAN.some(x => x.id === id);
          if (isDefault) {
            await setDoc(doc(db, 'info_tambahan', id), {
              id,
              isDeleted: true,
              title: '',
              desc: '',
              type: 'quality',
              icon: ''
            });
          } else {
            await deleteDoc(doc(db, 'info_tambahan', id));
          }
          setOperationState({ status: 'success', message: 'Data sukses dihapus!' });
          setTimeout(() => setOperationState({ status: 'idle' }), 3000);
        } catch (error) {
          setOperationState({ status: 'error', message: 'Gagal menghapus data.' });
        }
      },
      'Ya, Hapus',
      'danger'
    );
  };

  // --- PRODUCT MANAGEMENT ACTIONS ---
  const handleOpenForm = (item?: MenuItem) => {
    setUploadError(null);
    setIsUploading(false);
    setIsDragging(false);
    if (item) {
      setEditingItem(item);
      setFormName(item.name);
      setFormPrice(item.price);
      setFormCategory(item.category);
      setFormDescription(item.description);
      setFormPieces(item.pieces || '');
      setFormImage(item.image);
      setFormIsBestSeller(!!item.isBestSeller);
      setFormIsAvailable(item.isAvailable !== false);
      setFormTags(item.tags ? item.tags.join(', ') : '');
    } else {
      setEditingItem(null);
      setFormName('');
      setFormPrice(15000);
      setFormCategory('DIMSUM ORIGINAL');
      setFormDescription('');
      setFormPieces('');
      setFormImage(uniquePresets[0]?.image || '');
      setFormIsBestSeller(false);
      setFormIsAvailable(true);
      setFormTags('');
    }
    setIsFormOpen(true);
    setOperationState({ status: 'idle' });
  };

  const handleDeleteItem = (id: string, name: string) => {
    requestConfirm(
      'Hapus Menu Makanan',
      `Apakah Anda yakin ingin menghapus menu "${name}"?`,
      async () => {
        setOperationState({ status: 'loading', message: 'Menghapus menu item...' });
        try {
          const isStaticItem = MENU_ITEMS.some((item) => item.id === id);
          if (isStaticItem) {
            // Soft delete pre-packaged static default item by marking as isDeleted: true
            await setDoc(doc(db, 'menu_items', id), { id, isDeleted: true }, { merge: true });
          } else {
            // Hard delete completely new cloud-only custom food item
            await deleteDoc(doc(db, 'menu_items', id));
          }
          setOperationState({ status: 'success', message: `Menu "${name}" berhasil dihapus!` });
        } catch (error) {
          setOperationState({ status: 'error', message: 'Gagal menghapus menu item.' });
          handleFirestoreError(error, OperationType.DELETE, `menu_items/${id}`);
        }
      },
      'Ya, Hapus',
      'danger'
    );
  };

  const handleToggleAvailability = (item: MenuItem) => {
    const nextAvailable = item.isAvailable === false;
    const actionTitle = nextAvailable ? 'Aktifkan Menu Kembali?' : 'Nonaktifkan Menu?';
    const actionMessage = nextAvailable
      ? `Apakah Anda yakin ingin mengaktifkan kembali menu "${item.name}"? Pelanggan akan bisa melihat dan memesan menu ini kembali.`
      : `Apakah Anda yakin ingin menonaktifkan menu "${item.name}"? Menu ini akan ditandai sebagai habis/kosong (abu-abu) di katalog dan tidak bisa dipesan pelanggan.`;
    const confirmStyle = nextAvailable ? 'primary' : 'danger';
    const confirmLabel = nextAvailable ? 'Ya, Aktifkan' : 'Ya, Nonaktifkan';

    requestConfirm(
      actionTitle,
      actionMessage,
      async () => {
        try {
          await setDoc(doc(db, 'menu_items', item.id), { ...item, isAvailable: nextAvailable }, { merge: true });
          addToast(
            'success',
            nextAvailable ? 'Menu Tersedia' : 'Menu Habis',
            `Menu "${item.name}" sekarang ditandai sebagai ${nextAvailable ? 'Tersedia' : 'Habis'}.`
          );
        } catch (error) {
          addToast('error', 'Gagal Memperbarui', 'Gagal memperbarui ketersediaan menu.');
          console.error(error);
        }
      },
      confirmLabel,
      confirmStyle
    );
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName || formPrice <= 0 || !formImage) {
      alert('Mohon lengkapi semua field wajib (Nama, Harga, dan Foto).');
      return;
    }

    setOperationState({ status: 'loading', message: 'Menyimpan data menu...' });
    const id = editingItem ? editingItem.id : `menu-${Date.now()}`;
    const parsedTags = formTags
      ? formTags.split(',').map((t) => t.trim()).filter((t) => t.length > 0)
      : [];

    const itemPayload: any = {
      id,
      name: formName,
      price: Number(formPrice),
      category: formCategory,
      description: formDescription,
      image: formImage,
      isBestSeller: formIsBestSeller,
      isAvailable: formIsAvailable,
      tags: parsedTags,
    };

    if (formPieces !== '') {
      itemPayload.pieces = Number(formPieces);
    }

    const isAvailabilityChanged = editingItem && (editingItem.isAvailable !== false) !== formIsAvailable;

    const performSave = async () => {
      try {
        await setDoc(doc(db, 'menu_items', id), itemPayload);
        setOperationState({
          status: 'success',
          message: editingItem ? 'Menu berhasil diperbarui!' : 'Menu baru berhasil ditambahkan!'
        });
        setTimeout(() => {
          setIsFormOpen(false);
          setEditingItem(null);
        }, 1000);
      } catch (error) {
        setOperationState({ status: 'error', message: 'Gagal menyimpan menu item.' });
        handleFirestoreError(
          error,
          editingItem ? OperationType.UPDATE : OperationType.CREATE,
          `menu_items/${id}`
        );
      }
    };

    if (isAvailabilityChanged) {
      const actionTitle = formIsAvailable ? 'Aktifkan Menu Kembali?' : 'Nonaktifkan Menu?';
      const actionMessage = formIsAvailable
        ? `Apakah Anda yakin ingin mengaktifkan kembali menu "${formName}"? Pelanggan akan bisa melihat dan memesan menu ini kembali.`
        : `Apakah Anda yakin ingin menonaktifkan menu "${formName}"? Menu ini akan ditandai sebagai habis (abu-abu) di katalog dan tidak bisa dipesan pelanggan.`;
      const confirmLabel = formIsAvailable ? 'Ya, Aktifkan' : 'Ya, Nonaktifkan';
      const confirmStyle = formIsAvailable ? 'primary' : 'danger';

      requestConfirm(actionTitle, actionMessage, performSave, confirmLabel, confirmStyle);
    } else {
      await performSave();
    }
  };

  // Helper formatting currency
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  // Filter menu items for local search
  const filteredItems = menuItems.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            item.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'ALL' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 overflow-hidden">
        {/* Backdrop overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-brand-charcoal/80 backdrop-blur-xs"
        />

        {/* Global Floating Toast Notifications */}
        <div className="absolute top-4 right-4 z-[9999] pointer-events-none flex flex-col gap-2 max-w-[325px] w-full px-4 sm:px-0">
          <AnimatePresence>
            {toasts.map((t) => (
              <motion.div
                key={t.id}
                initial={{ opacity: 0, y: -20, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.85, transition: { duration: 0.15 } }}
                className={`pointer-events-auto rounded-xl p-3 shadow-lg border flex items-start gap-2.5 bg-white text-brand-charcoal ${
                  t.type === 'success'
                    ? 'border-emerald-250 shadow-emerald-100/30'
                    : t.type === 'error'
                    ? 'border-red-250 shadow-red-100/30'
                    : 'border-zinc-250 shadow-zinc-100/30'
                }`}
              >
                <div className={`mt-0.5 w-5 h-5 rounded-full flex items-center justify-center text-white shrink-0 ${
                  t.type === 'success'
                    ? 'bg-emerald-500 shadow-xs'
                    : t.type === 'error'
                    ? 'bg-red-500 shadow-xs'
                    : 'bg-zinc-500 shadow-xs'
                }`}>
                  {t.type === 'success' ? (
                    <Check className="w-3.5 h-3.5 stroke-[3.5px]" />
                  ) : t.type === 'error' ? (
                    <AlertTriangle className="w-3.5 h-3.5 stroke-[2.5px]" />
                  ) : (
                    <span className="text-[10px] font-black font-sans">i</span>
                  )}
                </div>
                <div className="flex-grow space-y-0.5">
                  <h5 className="text-[10.5px] font-extrabold uppercase tracking-wider text-brand-charcoal leading-none">
                    {t.title}
                  </h5>
                  <p className="text-[10px] text-zinc-500 font-bold leading-normal">
                    {t.message}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => removeToast(t.id)}
                  className="text-zinc-400 hover:text-zinc-600 cursor-pointer p-0.5 shrink-0 transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Dashboard Box container */}
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 50, scale: 0.95 }}
          className="relative bg-white w-full h-full sm:max-w-4xl sm:h-[85vh] sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-zinc-100"
        >
          {/* Header area */}
          <div className="bg-brand-charcoal px-6 py-4.5 text-white flex items-center justify-between border-b border-zinc-800">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-primary-orange flex items-center justify-center text-white scale-95 shadow-inner">
                <Lock className="w-4 h-4" />
              </div>
              <div className="flex flex-col">
                <h3 className="font-display font-black text-base sm:text-lg leading-tight uppercase tracking-wider text-rose-500">
                  Konsol Administrator
                </h3>
                <span className="text-[10px] text-zinc-400 font-mono">Suki Yusuki Database Manager</span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1 px-3.5 bg-zinc-800/40 hover:bg-zinc-800 text-zinc-300 hover:text-white rounded-xl transition-all cursor-pointer font-bold text-xs"
            >
              Tutup [Esc]
            </button>
          </div>

          {/* Conditional rendering based on Authentication check */}
          {loading ? (
            <div className="flex-grow flex flex-col items-center justify-center text-brand-charcoal py-20">
              <div className="relative w-12 h-12 border-4 border-rose-150 border-t-rose-500 rounded-full animate-spin mb-4" />
              <p className="font-mono text-xs font-bold uppercase tracking-widest text-zinc-500">Memeriksa Enkripsi...</p>
            </div>
          ) : !user ? (
            /* Sign in form layout */
            <div className="flex-grow flex flex-col items-center justify-center bg-zinc-50 p-6 select-none">
              <div className="bg-white border border-zinc-150 p-8 rounded-3xl w-full max-w-sm shadow-xl border-b-4 border-b-primary-orange">
                <div className="w-16 h-16 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center mx-auto mb-5 text-primary-orange">
                  <Lock className="w-8 h-8 animate-pulse" />
                </div>
                <h4 className="font-display font-black text-xl text-brand-charcoal text-center mb-1">Akses Admin</h4>
                <p className="text-xs text-zinc-400 leading-relaxed text-center mb-6 font-medium">
                  Suki Yusuki Database Manager. Masukkan kredensial administrator terdaftar.
                </p>

                {authError && (
                  <div className="bg-red-50 border border-red-200/50 p-3 rounded-2xl mb-5 flex items-start gap-2.5 text-left text-red-650">
                    <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <span className="text-[11px] font-bold font-mono leading-normal">{authError}</span>
                  </div>
                )}

                <form onSubmit={handleDirectLogin} className="space-y-4 text-left">
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-wider text-zinc-400 block mb-1">Username</label>
                    <input
                      type="text"
                      value={typedUsername}
                      onChange={(e) => setTypedUsername(e.target.value)}
                      placeholder="E.g., vocm"
                      required
                      className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3.5 py-2.5 text-xs text-brand-charcoal focus:outline-none focus:border-primary-orange focus:bg-white transition-all font-bold"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-black uppercase tracking-wider text-zinc-400 block mb-1">Password</label>
                    <input
                      type="password"
                      value={typedPassword}
                      onChange={(e) => setTypedPassword(e.target.value)}
                      placeholder="••••••"
                      required
                      className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3.5 py-2.5 text-xs text-brand-charcoal focus:outline-none focus:border-primary-orange focus:bg-white transition-all font-bold"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full mt-2 bg-brand-charcoal text-white hover:bg-zinc-900 border border-zinc-850 shadow-md font-bold text-xs py-3 px-5 rounded-2xl cursor-pointer transition-all flex items-center justify-center gap-2 active:scale-95 duration-200 hover:shadow-lg"
                  >
                    Masuk Ke Dashboard
                  </button>
                </form>
              </div>
            </div>
          ) : (
            /* Dashboard Console Workspace */
            <div className="flex-grow flex flex-col md:flex-row overflow-hidden bg-zinc-50">
              {/* Left sidebar nav panel */}
              <div className="w-full md:w-56 bg-zinc-900 md:h-full p-4 flex flex-col md:flex-col gap-3.5 border-b md:border-b-0 md:border-r border-zinc-805 shrink-0">
                <div className="flex flex-row md:flex-col gap-1.5 w-full overflow-x-auto md:overflow-visible pb-1.5 md:pb-0 scrollbar-none">
                  <div className="hidden md:block px-3 py-1.5 mb-2 font-mono text-[10px] text-zinc-500 font-extrabold uppercase tracking-widest">
                    Pilih Menu Kontrol
                  </div>

                  <button
                    onClick={() => setActiveTab('dashboard')}
                    className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer w-auto md:w-full shrink-0 ${
                      activeTab === 'dashboard'
                        ? 'bg-rose-600 text-white shadow-md shadow-rose-900/30'
                        : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
                    }`}
                  >
                    <LayoutDashboard className="w-4 h-4" />
                    Dashboard Analitik
                  </button>

                  <button
                    onClick={() => setActiveTab('menu')}
                    className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer w-auto md:w-full shrink-0 ${
                      activeTab === 'menu'
                        ? 'bg-rose-600 text-white shadow-md shadow-rose-900/30'
                        : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
                    }`}
                  >
                    <Layers className="w-4 h-4" />
                    Manajemen Katalog
                  </button>

                  <button
                    onClick={() => setActiveTab('settings')}
                    className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer w-auto md:w-full shrink-0 ${
                      activeTab === 'settings'
                        ? 'bg-rose-600 text-white shadow-md shadow-rose-900/30'
                        : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
                    }`}
                  >
                    <SettingsIcon className="w-4 h-4" />
                    Edit Logo & Brand
                  </button>
                </div>

                <div className="mt-1 md:mt-auto flex items-center justify-between md:flex-col gap-3 w-full border-t border-zinc-800 pt-3 md:pt-4.5 shrink-0">
                  <div className="flex flex-row md:flex-col items-center md:items-start gap-2 md:gap-0 px-2 sm:px-3">
                    <span className="text-xs sm:text-sm text-rose-500 font-extrabold font-display truncate uppercase tracking-wider block">
                      @{user.username}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#10b981] animate-ping" />
                      <span className="text-[9px] text-[#10b981] font-mono font-extrabold uppercase tracking-widest">
                        Admin Online
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="flex items-center justify-center gap-2 py-2 px-3 sm:px-3.5 text-xs font-bold text-red-400 hover:text-red-300 bg-red-950/20 hover:bg-red-950/50 rounded-xl cursor-pointer w-auto md:w-full border border-red-900/20 shrink-0 whitespace-nowrap active:scale-95 transition-all outline-none"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    Keluar Admin
                  </button>
                </div>
              </div>

              {/* Central Main Content area */}
              <div className="flex-grow flex flex-col overflow-y-auto p-4 sm:p-6">
                {/* Temporary feedback banner */}
                <AnimatePresence>
                  {operationState.status !== 'idle' && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className={`p-3.5 rounded-2xl mb-4 text-xs font-bold flex items-center justify-between shadow-sm border ${
                        operationState.status === 'loading'
                          ? 'bg-blue-50 border-blue-200 text-blue-700 animate-pulse'
                          : operationState.status === 'success'
                          ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                          : 'bg-red-50 border-red-200 text-red-800'
                      }`}
                    >
                      <span>{operationState.message}</span>
                      {operationState.status !== 'loading' && (
                        <button
                          onClick={() => setOperationState({ status: 'idle' })}
                          className="text-[9px] uppercase px-2 py-1 bg-white/50 hover:bg-white rounded-lg border border-black/10"
                        >
                          Mengerti
                        </button>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* --- TAB 0: ANALYTICS DASHBOARD OVERVIEW --- */}
                {activeTab === 'dashboard' && (
                  <div className="space-y-6">
                    {/* Header Panel */}
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      <div>
                        <h4 className="font-display font-black text-xl text-brand-charcoal flex items-center gap-2 font-black">
                          <LayoutDashboard className="w-5 h-5 text-rose-600 animate-pulse" />
                          Dashboard Analitik Interaktif <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[9px] font-bold animate-bounce font-mono">LIVE ON</span>
                        </h4>
                        <p className="text-xs text-zinc-500 mt-1">
                          Pantau data kunjungan real-time, statistik aksi keranjang, rasio unduh receipt, metrik checkout WhatsApp, serta perbandingan detail layanan.
                        </p>
                      </div>

                      {/* Global Dashboard Filters */}
                      <div className="flex flex-wrap items-center gap-2.5">
                        {/* Date Filter Buttons */}
                        <div className="flex bg-zinc-200/80 p-0.5 rounded-xl border border-zinc-300 shadow-sm">
                          <button
                            onClick={() => setInvoiceFilterDate('hari')}
                            className={`px-3 py-1.5 text-[10px] font-bold rounded-lg cursor-pointer transition-all ${
                              invoiceFilterDate === 'hari'
                                ? 'bg-white text-zinc-900 shadow-sm font-black'
                                : 'text-zinc-500 hover:text-zinc-900'
                            }`}
                          >
                            Hari Ini
                          </button>
                          <button
                            onClick={() => setInvoiceFilterDate('minggu')}
                            className={`px-3 py-1.5 text-[10px] font-bold rounded-lg cursor-pointer transition-all ${
                              invoiceFilterDate === 'minggu'
                                ? 'bg-white text-zinc-900 shadow-sm font-black'
                                : 'text-zinc-500 hover:text-zinc-900'
                            }`}
                          >
                            Minggu
                          </button>
                          <button
                            onClick={() => setInvoiceFilterDate('bulan')}
                            className={`px-3 py-1.5 text-[10px] font-bold rounded-lg cursor-pointer transition-all ${
                              invoiceFilterDate === 'bulan'
                                ? 'bg-white text-zinc-900 shadow-sm font-black'
                                : 'text-zinc-500 hover:text-zinc-900'
                            }`}
                          >
                            Bulanan (30H)
                          </button>
                          <button
                            onClick={() => setInvoiceFilterDate('semua')}
                            className={`px-3 py-1.5 text-[10px] font-bold rounded-lg cursor-pointer transition-all ${
                              invoiceFilterDate === 'semua'
                                ? 'bg-white text-zinc-900 shadow-sm font-black'
                                : 'text-zinc-500 hover:text-zinc-900'
                            }`}
                          >
                            Semua Sesi
                          </button>
                        </div>

                        {/* Order Type Filter Selector */}
                        <select
                          value={invoiceFilterMethod}
                          onChange={(e) => setInvoiceFilterMethod(e.target.value as any)}
                          className="bg-white border border-zinc-200 text-zinc-800 text-[10px] font-bold rounded-xl px-2.5 py-2 cursor-pointer focus:outline-none focus:border-rose-500 shadow-sm hover:border-zinc-300 font-extrabold"
                        >
                          <option value="ALL">Semua Tipe Pesanan</option>
                          <option value="DINE_IN">Makan di Sini (Dine In)</option>
                          <option value="TAKE_AWAY">Bawa Pulang (Take Away)</option>
                        </select>

                        {/* Payment Type Filter Selector */}
                        <select
                          value={invoiceFilterPayment}
                          onChange={(e) => setInvoiceFilterPayment(e.target.value as any)}
                          className="bg-white border border-zinc-200 text-zinc-800 text-[10px] font-bold rounded-xl px-2.5 py-2 cursor-pointer focus:outline-none focus:border-rose-500 shadow-sm hover:border-zinc-300 font-extrabold"
                        >
                          <option value="ALL">Semua Metode Pembayaran</option>
                          <option value="TUNAI">Metode Tunai / Cash</option>
                          <option value="QRIS">Metode QRIS / Cashless</option>
                          <option value="BAYAR_DI_TEMPAT">Tipe Bayar Di Tempat (COD)</option>
                        </select>

                        {/* CSV Export */}
                        <button
                          onClick={handleExportCSV}
                          className="flex items-center gap-1.5 text-[10px] font-black uppercase text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200/50 px-3 py-2 rounded-xl transition-all cursor-pointer shadow-sm active:scale-95"
                        >
                          <Download className="w-3.5 h-3.5" />
                          CSV
                        </button>

                        {/* Reset Data */}
                        <button
                          onClick={handleResetAnalytics}
                          className="flex items-center gap-1.5 text-[10px] font-black uppercase text-red-650 bg-red-50 hover:bg-red-100 border border-red-200/50 px-3 py-2 rounded-xl transition-all cursor-pointer shadow-sm active:scale-95"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          Reset Data
                        </button>
                      </div>
                    </div>

                    {/* ALWAYS-ON INTERACTIONS BENCHMARKS (GRID KPI) */}
                    <div className="grid grid-cols-2 lg:grid-cols-7 gap-3.5">
                      {/* 1. Website Visits */}
                      <div className="bg-white p-3.5 rounded-2xl border border-zinc-200 shadow-sm hover:translate-y-[-2px] transition-all duration-300">
                        <div className="flex items-center justify-between">
                          <span className="text-[9px] font-mono font-black uppercase tracking-wider text-zinc-400">Visitor Web</span>
                          <span className="w-7 h-7 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center text-xs">
                            <Eye className="w-3.5 h-3.5" />
                          </span>
                        </div>
                        <h5 className="font-display font-black text-xl text-blue-700 mt-2 font-black">
                          {analyticsStats.totalVisits} <span className="text-[10px] text-zinc-400 font-bold">Kunjungan</span>
                        </h5>
                        <span className="text-[8px] text-zinc-400 font-bold block mt-1">
                          Aktivitas akses halaman
                        </span>
                      </div>

                      {/* 2. Menu Click Traffic */}
                      <div className="bg-white p-3.5 rounded-2xl border border-zinc-200 shadow-sm hover:translate-y-[-2px] transition-all duration-300">
                        <div className="flex items-center justify-between">
                          <span className="text-[9px] font-mono font-black uppercase tracking-wider text-zinc-400">Klik Detail</span>
                          <span className="w-7 h-7 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center text-xs">
                            <MousePointerClick className="w-3.5 h-3.5" />
                          </span>
                        </div>
                        <h5 className="font-display font-black text-xl text-amber-700 mt-2 font-black">
                          {analyticsStats.totalProductClicks} <span className="text-[10px] text-zinc-400 font-bold">Kali</span>
                        </h5>
                        <span className="text-[8px] text-zinc-400 font-bold block mt-1">
                          {analyticsStats.totalVisits > 0 ? ((analyticsStats.totalProductClicks / analyticsStats.totalVisits) * 100).toFixed(0) : 0}% Rasio Keinginan
                        </span>
                      </div>

                      {/* 3. Add to Cart Actions */}
                      <div className="bg-white p-3.5 rounded-2xl border border-zinc-200 shadow-sm hover:translate-y-[-2px] transition-all duration-300">
                        <div className="flex items-center justify-between">
                          <span className="text-[9px] font-mono font-black uppercase tracking-wider text-zinc-400">Masuk Keranjang</span>
                          <span className="w-7 h-7 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center text-xs">
                            <ShoppingCart className="w-3.5 h-3.5" />
                          </span>
                        </div>
                        <h5 className="font-display font-black text-xl text-rose-700 mt-2 font-black">
                          {analyticsStats.totalAddToCartCount} <span className="text-[10px] text-zinc-400 font-bold">Pcs</span>
                        </h5>
                        <span className="text-[8px] text-zinc-400 font-bold block mt-1">
                          Total item siap checkout
                        </span>
                      </div>

                      {/* 4. Invoices / Receipts Created */}
                      <div className="bg-white p-3.5 rounded-2xl border border-zinc-200 shadow-sm hover:translate-y-[-2px] transition-all duration-300">
                        <div className="flex items-center justify-between">
                          <span className="text-[9px] font-mono font-black uppercase tracking-wider text-zinc-400">Draft Invoice</span>
                          <span className="w-7 h-7 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-xs">
                            <Receipt className="w-3.5 h-3.5" />
                          </span>
                        </div>
                        <h5 className="font-display font-black text-xl text-emerald-700 mt-2 font-black">
                          {analyticsStats.totalInvoicesEventCount} <span className="text-[10px] text-zinc-400 font-bold">Nota</span>
                        </h5>
                        <span className="text-[8px] text-zinc-400 font-bold block mt-1">
                          Tagihan berhasil dikompilasi
                        </span>
                      </div>

                      {/* 5. Downloads Rate */}
                      <div className="bg-white p-3.5 rounded-2xl border border-zinc-200 shadow-sm hover:translate-y-[-2px] transition-all duration-300">
                        <div className="flex items-center justify-between">
                          <span className="text-[9px] font-mono font-black uppercase tracking-wider text-zinc-400">Unduh Bukti</span>
                          <span className="w-7 h-7 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center text-xs">
                            <Download className="w-3.5 h-3.5" />
                          </span>
                        </div>
                        <h5 className="font-display font-black text-xl text-indigo-700 mt-2 font-black">
                          {analyticsStats.totalDownloads} <span className="text-[10px] text-zinc-400 font-bold">PNG</span>
                        </h5>
                        <span className="text-[8px] text-zinc-400 font-bold block mt-1">
                          Unduh nota untuk klaim legal
                        </span>
                      </div>

                      {/* 6. WA Conversions (WhatsApp Click Rate) */}
                      <div className="bg-white p-3.5 rounded-2xl border border-zinc-200 shadow-sm hover:translate-y-[-2px] transition-all duration-300">
                        <div className="flex items-center justify-between">
                          <span className="text-[9px] font-mono font-black uppercase tracking-wider text-zinc-400">Kirim Ke WA</span>
                          <span className="w-7 h-7 rounded-xl bg-green-50 text-green-600 flex items-center justify-center text-xs">
                            💬
                          </span>
                        </div>
                        <h5 className="font-display font-black text-xl text-green-700 mt-2 font-black">
                          {analyticsStats.totalWaClicksConverted} <span className="text-[10px] text-zinc-400 font-bold">Klik</span>
                        </h5>
                        <span className="text-[8px] text-zinc-400 font-bold block mt-1">
                          Rasio: {analyticsStats.totalInvoicesEventCount > 0 ? ((analyticsStats.totalWaClicksConverted / analyticsStats.totalInvoicesEventCount) * 100).toFixed(0) : 0}% dari Invoice
                        </span>
                      </div>

                      {/* 7. Estimated Sales */}
                      <div className="bg-white p-3.5 rounded-2xl border border-zinc-200 shadow-sm hover:translate-y-[-2px] transition-all duration-300 col-span-2 lg:col-span-1">
                        <div className="flex items-center justify-between">
                          <span className="text-[9px] font-mono font-black uppercase tracking-wider text-zinc-400 font-extrabold truncate max-w-[85px]">Omset Baru</span>
                          <span className="w-7 h-7 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center text-xs font-bold leading-none animate-pulse">Rp</span>
                        </div>
                        <h5 className="font-display font-black text-xs text-violet-700 mt-2 truncate font-black">
                          {formatPrice(currentStats.totalRevenue)}
                        </h5>
                        <span className="text-[8px] text-zinc-400 font-bold block mt-1">
                          {currentStats.totalOrders} order sukses
                        </span>
                      </div>
                    </div>

                    {/* LIVE VISITS CONVERSION FUNNEL BAR */}
                    <div className="bg-gradient-to-r from-zinc-900 to-zinc-950 p-5 rounded-2xl border border-zinc-800 shadow-md">
                      <div className="flex items-center justify-between border-b border-zinc-800 pb-3 mb-4">
                        <div className="flex items-center gap-1.5">
                          <Sparkles className="w-4 h-4 text-amber-400" />
                          <span className="text-xs text-white font-bold tracking-wide uppercase font-mono">Live Corong Konversi Pelanggan (Funnel)</span>
                        </div>
                        <span className="text-[9px] text-zinc-400 font-mono">Menggambarkan titik drop-off konsumen</span>
                      </div>

                      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
                        {/* 1. Kunjungan */}
                        <div className="bg-zinc-800/40 p-3 rounded-xl border border-zinc-800">
                          <div className="text-zinc-500 text-[9px] font-mono font-extrabold uppercase tracking-widest">LANGKAH 1</div>
                          <div className="text-zinc-200 text-xs font-bold mt-1">Kunjungan Web</div>
                          <div className="text-lg font-black text-white mt-1 font-black">{analyticsStats.totalVisits} <span className="text-[9px] text-zinc-400 font-mono font-bold">Sesi</span></div>
                          <div className="w-full bg-zinc-700 h-1.5 rounded-full mt-2 overflow-hidden">
                            <div className="bg-blue-500 h-full w-full" />
                          </div>
                          <div className="text-[8px] text-zinc-400 mt-1">100% Traffic Base</div>
                        </div>

                        {/* 2. Klik Menu */}
                        <div className="bg-zinc-800/40 p-3 rounded-xl border border-zinc-800">
                          <div className="text-zinc-500 text-[9px] font-mono font-extrabold uppercase tracking-widest">LANGKAH 2</div>
                          <div className="text-zinc-200 text-xs font-bold mt-1">Klik Detail Menu</div>
                          <div className="text-lg font-black text-white mt-1 font-black">{analyticsStats.totalProductClicks} <span className="text-[9px] text-zinc-400 font-mono font-bold">Klik</span></div>
                          <div className="w-full bg-zinc-700 h-1.5 rounded-full mt-2 overflow-hidden">
                            <div 
                              className="bg-amber-500 h-full" 
                              style={{ width: `${analyticsStats.totalVisits > 0 ? Math.min((analyticsStats.totalProductClicks / analyticsStats.totalVisits) * 100, 100) : 0}%` }}
                            />
                          </div>
                          <div className="text-[8px] text-zinc-400 mt-1">
                            {analyticsStats.totalVisits > 0 ? ((analyticsStats.totalProductClicks / analyticsStats.totalVisits) * 100).toFixed(0) : 0}% Rasio Klik Halaman
                          </div>
                        </div>

                        {/* 3. Tambah Ke Keranjang */}
                        <div className="bg-zinc-800/40 p-3 rounded-xl border border-zinc-800">
                          <div className="text-zinc-500 text-[9px] font-mono font-extrabold uppercase tracking-widest">LANGKAH 3</div>
                          <div className="text-zinc-200 text-xs font-bold mt-1">Tambah Keranjang</div>
                          <div className="text-lg font-black text-white mt-1 font-black">{analyticsStats.totalAddToCartCount} <span className="text-[9px] text-zinc-400 font-mono font-bold">Item</span></div>
                          <div className="w-full bg-zinc-700 h-1.5 rounded-full mt-2 overflow-hidden">
                            <div 
                              className="bg-rose-500 h-full" 
                              style={{ width: `${analyticsStats.totalProductClicks > 0 ? Math.min((analyticsStats.totalAddToCartCount / Math.max(analyticsStats.totalProductClicks, 1)) * 100, 100) : 0}%` }}
                            />
                          </div>
                          <div className="text-[8px] text-zinc-400 mt-1">
                            {analyticsStats.totalProductClicks > 0 ? ((analyticsStats.totalAddToCartCount / analyticsStats.totalProductClicks) * 100).toFixed(0) : 0}% Rasio Masukan
                          </div>
                        </div>

                        {/* 4. Invoice Dibuat */}
                        <div className="bg-zinc-800/40 p-3 rounded-xl border border-zinc-800">
                          <div className="text-zinc-500 text-[9px] font-mono font-extrabold uppercase tracking-widest">LANGKAH 4</div>
                          <div className="text-zinc-200 text-xs font-bold mt-1">Buat Nota Invoice</div>
                          <div className="text-lg font-black text-white mt-1 font-black">{analyticsStats.totalInvoicesEventCount} <span className="text-[9px] text-zinc-400 font-mono font-bold">Pesanan</span></div>
                          <div className="w-full bg-zinc-700 h-1.5 rounded-full mt-2 overflow-hidden">
                            <div 
                              className="bg-emerald-500 h-full" 
                              style={{ width: `${analyticsStats.totalVisits > 0 ? Math.min((analyticsStats.totalInvoicesEventCount / analyticsStats.totalVisits) * 100, 100) : 0}%` }}
                            />
                          </div>
                          <div className="text-[8px] text-zinc-400 mt-1">
                            {analyticsStats.totalVisits > 0 ? ((analyticsStats.totalInvoicesEventCount / analyticsStats.totalVisits) * 100).toFixed(1) : 0}% Tingkat Checkout
                          </div>
                        </div>

                        {/* 5. Konversi WhatsApp */}
                        <div className="bg-zinc-800/40 p-3 rounded-xl border border-zinc-800">
                          <div className="text-zinc-500 text-[9px] font-mono font-extrabold uppercase tracking-widest">LANGKAH 5</div>
                          <div className="text-zinc-200 text-xs font-bold mt-1">WA Konfirmasi</div>
                          <div className="text-lg font-black text-white mt-1 font-black">{analyticsStats.totalWaClicksConverted} <span className="text-[9px] text-zinc-400 font-mono font-bold">Chat</span></div>
                          <div className="w-full bg-zinc-700 h-1.5 rounded-full mt-2 overflow-hidden">
                            <div 
                              className="bg-green-500 h-full" 
                              style={{ width: `${analyticsStats.totalInvoicesEventCount > 0 ? Math.min((analyticsStats.totalWaClicksConverted / analyticsStats.totalInvoicesEventCount) * 100, 100) : 0}%` }}
                            />
                          </div>
                          <div className="text-[8px] text-zinc-400 mt-1">
                            {analyticsStats.totalInvoicesEventCount > 0 ? ((analyticsStats.totalWaClicksConverted / analyticsStats.totalInvoicesEventCount) * 100).toFixed(0) : 0}% Rasio Final Closing
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* TWO COLS: DETAILED PRODUCT ACTIVITY BREAKDOWNS */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                      {/* Left Block: Menu clicks frequency */}
                      <div className="bg-white p-4 rounded-2xl border border-zinc-200 shadow-sm flex flex-col justify-between">
                        <div>
                          <div className="flex justify-between items-center border-b border-zinc-100 pb-2.5 mb-3">
                            <span className="text-xs text-zinc-800 font-black flex items-center gap-1.5 uppercase tracking-wide">
                              <MousePointerClick className="w-4 h-4 text-blue-500 animate-pulse" />
                              Produk Paling Sering Di-klik / Dilihat
                            </span>
                            <span className="text-[9px] font-bold text-blue-500 bg-blue-50 px-2 py-0.5 rounded-lg font-mono">Eksplorasi</span>
                          </div>

                          <div className="space-y-3.5 mt-2">
                            {analyticsStats.topClickedProductsList.length > 0 ? (
                              analyticsStats.topClickedProductsList.map((prod, index) => {
                                const maxVal = analyticsStats.topClickedProductsList[0]?.count || 1;
                                const percentage = (prod.count / maxVal) * 100;
                                return (
                                  <div key={prod.id} className="space-y-1">
                                    <div className="flex items-center justify-between text-xs font-bold text-zinc-600">
                                      <span className="truncate max-w-[200px] text-zinc-800 text-[10px] tracking-wide flex items-center gap-1.5">
                                        <span className="w-4 h-4 text-[9px] font-black rounded-full bg-zinc-100 text-zinc-700 flex items-center justify-center font-bold">{index + 1}</span>
                                        {prod.name}
                                      </span>
                                      <span className="font-mono text-blue-600 font-bold">{prod.count} <span className="text-[9px] text-zinc-400 font-normal">Klik</span></span>
                                    </div>
                                    <div className="w-full bg-zinc-100 h-2.5 rounded-full overflow-hidden flex">
                                      <div
                                        className="bg-blue-500 h-full rounded-full transition-all duration-500"
                                        style={{ width: `${percentage}%` }}
                                      />
                                    </div>
                                  </div>
                                );
                              })
                            ) : (
                              <div className="text-zinc-400 text-[11px] py-10 text-center font-bold">Belum ada statistik klik terekam hari ini</div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Right Block: Menu cart additions frequency */}
                      <div className="bg-white p-4 rounded-2xl border border-zinc-200 shadow-sm flex flex-col justify-between">
                        <div>
                          <div className="flex justify-between items-center border-b border-zinc-100 pb-2.5 mb-3">
                            <span className="text-xs text-zinc-800 font-black flex items-center gap-1.5 uppercase tracking-wide">
                              <ShoppingCart className="w-4 h-4 text-rose-500 animate-pulse" />
                              Produk Paling Sering Ditambah ke Keranjang
                            </span>
                            <span className="text-[9px] font-bold text-rose-500 bg-rose-50 px-2 py-0.5 rounded-lg font-mono">Minat Beli</span>
                          </div>

                          <div className="space-y-3.5 mt-2">
                            {analyticsStats.topCartProductsList.length > 0 ? (
                              analyticsStats.topCartProductsList.map((prod, index) => {
                                const maxVal = analyticsStats.topCartProductsList[0]?.count || 1;
                                const percentage = (prod.count / maxVal) * 100;
                                return (
                                  <div key={prod.id} className="space-y-1">
                                    <div className="flex items-center justify-between text-xs font-bold text-zinc-600">
                                      <span className="truncate max-w-[200px] text-zinc-800 text-[10px] tracking-wide flex items-center gap-1.5">
                                        <span className="w-4 h-4 text-[9px] font-black rounded-full bg-zinc-100 text-zinc-700 flex items-center justify-center font-bold">{index + 1}</span>
                                        {prod.name}
                                      </span>
                                      <span className="font-mono text-rose-600 font-bold">{prod.count} <span className="text-[9px] text-zinc-400 font-normal">Pcs</span></span>
                                    </div>
                                    <div className="w-full bg-zinc-100 h-2.5 rounded-full overflow-hidden flex">
                                      <div
                                        className="bg-rose-500 h-full rounded-full transition-all duration-500"
                                        style={{ width: `${percentage}%` }}
                                      />
                                    </div>
                                  </div>
                                );
                              })
                            ) : (
                              <div className="text-zinc-400 text-[11px] py-10 text-center font-bold">Belum ada statistik keranjang terekam hari ini</div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Operational Insights Summary Dashboard */}
                    <div className="bg-gradient-to-r from-zinc-900 to-zinc-950 p-4 rounded-2xl border border-zinc-800 shadow-md">
                      <div className="flex items-center gap-1.5 border-b border-zinc-800 pb-2.5">
                        <Sparkles className="w-4 h-4 text-rose-500" />
                        <span className="text-xs text-rose-400 font-bold tracking-wide uppercase font-mono">Insight Operasional UMKM</span>
                      </div>
                      
                      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 pt-3 text-left">
                        <div>
                          <span className="text-[9px] text-zinc-400 font-bold font-mono uppercase tracking-widest block">Terlaris Hari Ini</span>
                          <span className="text-xs font-black text-white block mt-1 truncate">{operationalInsight.topProductToday}</span>
                        </div>

                        <div>
                          <span className="text-[9px] text-zinc-400 font-bold font-mono uppercase tracking-widest block">Jam Tersibuk Hari Ini</span>
                          <span className="text-xs font-black text-white block mt-1 truncate">{operationalInsight.busyHourToday}</span>
                        </div>

                        <div>
                          <span className="text-[9px] text-zinc-400 font-bold font-mono uppercase tracking-widest block">Metode Dominan</span>
                          <span className="text-xs font-black text-white block mt-1 truncate">{operationalInsight.dominantOrder}</span>
                        </div>

                        <div>
                          <span className="text-[9px] text-zinc-400 font-bold font-mono uppercase tracking-widest block">Kepadatan Item</span>
                          <span className="text-xs font-black text-white block mt-1 truncate">{operationalInsight.avgItemsPerOrder} pcs <span className="text-[10px] text-zinc-400 font-bold">/ order</span></span>
                        </div>
                      </div>
                    </div>

                    {/* Visual Charts section */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                      {/* Trend Order Line Chart (SVG rendered) */}
                      <div className="bg-white p-4 rounded-2xl border border-zinc-200 shadow-sm flex flex-col">
                        <div className="flex justify-between items-center border-b border-zinc-100 pb-2 mb-3">
                          <span className="text-xs text-zinc-800 font-black flex items-center gap-1.5 uppercase tracking-wide">
                            <TrendingUp className="w-4 h-4 text-emerald-500" />
                            Tren Kuantitas Order
                          </span>
                          <span className="text-[10px] font-bold text-zinc-400 font-mono">Grafik Harian</span>
                        </div>
                        
                        <div className="relative h-48 w-full flex items-center justify-center text-center mt-2.5">
                          {trendChartData.list.length > 0 ? (
                            <svg viewBox="0 0 540 200" className="w-full h-full text-zinc-400">
                              <defs>
                                <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="0%" stopColor="#ef4444" stopOpacity="0.25" />
                                  <stop offset="100%" stopColor="#ef4444" stopOpacity="0.0" />
                                </linearGradient>
                              </defs>
                              
                              {/* Horizontal Grid lines */}
                              <line x1="40" y1="20" x2="520" y2="20" stroke="#f1f5f9" strokeWidth="1" strokeDasharray="4 4" />
                              <line x1="40" y1="65" x2="520" y2="65" stroke="#f1f5f9" strokeWidth="1" strokeDasharray="4 4" />
                              <line x1="40" y1="110" x2="520" y2="110" stroke="#f1f5f9" strokeWidth="1" strokeDasharray="4 4" />
                              <line x1="40" y1="155" x2="520" y2="155" stroke="#e2e8f0" strokeWidth="1" />

                              {/* Path Area under Line */}
                              {(() => {
                                const pts = trendChartData.list;
                                const maxVal = trendChartData.maxVal;
                                const length = pts.length;
                                const mapped = pts.map((p, i) => ({
                                  x: 40 + (i / Math.max(length - 1, 1)) * 480,
                                  y: 155 - (p.totalOrders / maxVal) * 125
                                }));
                                
                                const linePath = mapped.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
                                const areaPath = mapped.length > 0 ? `${linePath} L ${mapped[mapped.length - 1].x} 155 L ${mapped[0].x} 155 Z` : '';
                                
                                return (
                                  <>
                                    {areaPath && <path d={areaPath} fill="url(#chartGradient)" />}
                                    {linePath && <path d={linePath} fill="none" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />}
                                    
                                    {/* Points and labels */}
                                    {mapped.map((p, i) => {
                                      // Only show circle dot and numbers selectively on dense charts to avoid crowding
                                      const showDot = length <= 10 || i % Math.ceil(length / 7) === 0 || i === length - 1;
                                      if (!showDot) return null;
                                      return (
                                        <g key={i}>
                                          <circle cx={p.x} cy={p.y} r="4" fill="#ffffff" stroke="#ef4444" strokeWidth="2" className="cursor-pointer" />
                                          <text x={p.x} y={p.y - 8} textAnchor="middle" className="text-[9px] font-black fill-zinc-700 font-mono">
                                            {pts[i].totalOrders}
                                          </text>
                                        </g>
                                      );
                                    })}
                                    
                                    {/* Axis Labels */}
                                    {mapped.map((p, i) => {
                                      const showLabel = length <= 8 || i % Math.ceil(length / 5) === 0 || i === length - 1;
                                      if (!showLabel) return null;
                                      return (
                                        <text key={`lbl-${i}`} x={p.x} y="172" textAnchor="middle" className="text-[9px] font-bold fill-zinc-400">
                                          {pts[i].label}
                                        </text>
                                      );
                                    })}
                                  </>
                                );
                              })()}
                            </svg>
                          ) : (
                            <div className="text-zinc-400 text-xs font-bold py-12">Belum ada data tersedia</div>
                          )}
                        </div>
                      </div>

                      {/* Category performance Bar Chart (Horizontal layout) */}
                      <div className="bg-white p-4 rounded-2xl border border-zinc-200 shadow-sm flex flex-col justify-between">
                        <div>
                          <div className="flex justify-between items-center border-b border-zinc-100 pb-2 mb-3">
                            <span className="text-xs text-zinc-800 font-black flex items-center gap-1.5 uppercase tracking-wide">
                              <BarChart3 className="w-4 h-4 text-rose-500" />
                              Porsi Penjualan per Kategori
                            </span>
                            <span className="text-[10px] font-bold text-zinc-400 font-mono">Porsi Kuantitas</span>
                          </div>

                          <div className="space-y-3.5 mt-2 overflow-y-auto max-h-[145px] pr-1">
                            {categoryChartData.list.length > 0 ? (
                              categoryChartData.list.map((cat) => {
                                const percentage = (cat.qty / categoryChartData.maxVal) * 100;
                                return (
                                  <div key={cat.name} className="space-y-1">
                                    <div className="flex items-center justify-between text-xs font-bold text-zinc-600">
                                      <span className="truncate max-w-[170px] uppercase font-bold text-zinc-800 text-[10px] tracking-wide">{cat.name}</span>
                                      <span className="font-mono text-zinc-500">{cat.qty} <span className="text-[9px] text-zinc-400">Pcs</span></span>
                                    </div>
                                    <div className="w-full bg-zinc-100 h-2.5 rounded-full overflow-hidden flex">
                                      <div
                                        className="bg-rose-500 h-full rounded-full transition-all duration-500"
                                        style={{ width: `${percentage}%` }}
                                      />
                                    </div>
                                  </div>
                                );
                              })
                            ) : (
                              <div className="text-zinc-400 text-xs py-8 text-center font-bold">Belum ada pesanan terdaftar</div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Operational Schedule Analysis Grid (Req 5 & Heatmap) */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                      {/* Active peak hours chart split between Take Away / Dine In */}
                      <div className="bg-white p-4 rounded-2xl border border-zinc-200 shadow-sm flex flex-col justify-between">
                        <div>
                          <div className="flex justify-between items-center border-b border-zinc-100 pb-2 mb-3">
                            <span className="text-xs text-zinc-800 font-black flex items-center gap-1.5 uppercase tracking-wide">
                              <Clock className="w-4 h-4 text-amber-500" />
                              Jam Kedatangan Terpopuler
                            </span>
                            <div className="flex items-center gap-2 text-[9px] text-zinc-400 font-bold">
                              <span className="flex items-center gap-0.5"><span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>Dine In</span>
                              <span className="flex items-center gap-0.5"><span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>Take Away</span>
                            </div>
                          </div>
                          
                          <div className="flex justify-between items-end gap-1 mt-4 px-1.5">
                            {hourlyStats.activeHours.map((hr) => {
                              const dineInCount = hourlyStats.dineInHours[hr] || 0;
                              const takeAwayCount = hourlyStats.takeAwayHours[hr] || 0;
                              const totalCount = dineInCount + takeAwayCount;
                              const maxVal = Math.max(...hourlyStats.totalHours, 1);
                              
                              const dineInHeight = (dineInCount / maxVal) * 85; 
                              const takeAwayHeight = (takeAwayCount / maxVal) * 85;

                              return (
                                <div key={hr} className="flex-1 flex flex-col items-center">
                                  {/* Multi bar Stacked Layout */}
                                  <div className="h-28 w-full flex flex-col justify-end items-center gap-1">
                                    <div className="w-2.5 sm:w-4 flex flex-col gap-0.5 justify-end h-full">
                                      {dineInCount > 0 && (
                                        <div 
                                          className="bg-rose-500 rounded-t-sm w-full shadow-sm hover:scale-105 transition-all text-center" 
                                          style={{ height: `${Math.max(dineInHeight, 4)}px` }}
                                          title={`Dine In: ${dineInCount} pesanan`}
                                        />
                                      )}
                                      {takeAwayCount > 0 && (
                                        <div 
                                          className="bg-amber-500 rounded-b-sm w-full shadow-sm hover:scale-105 transition-all" 
                                          style={{ height: `${Math.max(takeAwayHeight, 4)}px` }}
                                          title={`Take Away: ${takeAwayCount} pesanan`}
                                        />
                                      )}
                                    </div>
                                  </div>
                                  <span className="text-[9px] font-extrabold text-zinc-400 mt-2 font-mono">{hr}.00</span>
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        <div className="border-t border-zinc-100 pt-3 mt-3 flex items-center justify-between text-[10px] text-zinc-500 font-bold">
                          <span>Jam Sibuk Dine In: <b className="text-rose-600">{hourlyStats.peakDineInHour}</b></span>
                          <span>Jam Sibuk Take Away: <b className="text-amber-500">{hourlyStats.peakTakeAwayHour}</b></span>
                        </div>
                      </div>

                      {/* Daily schedule busy index */}
                      <div className="bg-white p-4 rounded-2xl border border-zinc-200 shadow-sm flex flex-col justify-between">
                        <div>
                          <div className="flex justify-between items-center border-b border-zinc-100 pb-2 mb-3">
                            <span className="text-xs text-zinc-800 font-black flex items-center gap-1.5 uppercase tracking-wide">
                              <Calendar className="w-4 h-4 text-indigo-500" />
                              Hari Sibuk Mingguan
                            </span>
                            <span className="text-[10px] font-bold text-zinc-400 font-mono">Volume per Hari</span>
                          </div>

                          <div className="flex justify-between items-end gap-1 mt-4 px-1">
                            {dailyBusyStats.dayNames.map((dayName, idx) => {
                              const count = dailyBusyStats.dayCounts[idx] || 0;
                              const maxVal = Math.max(...dailyBusyStats.dayCounts, 1);
                              const heightPct = (count / maxVal) * 100;

                              return (
                                <div key={dayName} className="flex-1 flex flex-col items-center">
                                  <div className="h-28 w-full flex flex-col justify-end items-center">
                                    <div 
                                      className="bg-indigo-500 hover:bg-zinc-800 w-3.5 sm:w-5.5 rounded-t-md cursor-pointer transition-all relative group"
                                      style={{ height: `${Math.max(heightPct, 4)}%` }}
                                    >
                                      {/* Tooltip detail block */}
                                      <div className="hidden group-hover:block absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 bg-zinc-950 text-white text-[9px] font-black py-1 px-2 rounded-lg shadow-xl z-20 whitespace-nowrap">
                                        {count} Pesanan
                                      </div>
                                    </div>
                                  </div>
                                  <span className="text-[9px] font-black text-zinc-400 mt-2">{dayName}</span>
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        <div className="border-t border-zinc-100 pt-3 mt-3 flex items-center gap-1 text-[10px] text-zinc-500 font-bold">
                          <span>Hari Termacet Operasional: <b className="text-indigo-600">{dailyBusyStats.peakDayName}</b> (Volume tertinggi pelanggan)</span>
                        </div>
                      </div>
                    </div>

                    {/* Product Performance Analytics (Req 4) */}
                    <div className="bg-white p-4 rounded-2xl border border-zinc-200 shadow-sm space-y-4">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-100 pb-2.5">
                        <div className="flex items-center gap-2">
                          <CheckSquare className="w-4 h-4 text-rose-500" />
                          <h5 className="font-display font-black text-sm text-brand-charcoal">
                            Kinerja Penjualan Produk
                          </h5>
                        </div>
                        <div className="flex flex-wrap items-center gap-2.5 text-[9px] text-zinc-500 font-bold">
                          <span className="bg-emerald-50 text-emerald-600 border border-emerald-100 px-2 py-0.5 rounded-full">
                            Terlaris Umum: {productStats.bestProduct?.name || 'Belum Ada'}
                          </span>
                          <span className="bg-rose-50 text-rose-600 border border-rose-100 px-2 py-0.5 rounded-full">
                            Fav Dine In: {productStats.bestDineInProduct?.name || 'Belum Ada'}
                          </span>
                          <span className="bg-amber-50 text-amber-600 border border-amber-100 px-2 py-0.5 rounded-full">
                            Fav Take Away: {productStats.bestTakeAwayProduct?.name || 'Belum Ada'}
                          </span>
                        </div>
                      </div>

                      <div className="overflow-x-auto min-w-full">
                        <table className="min-w-full divide-y divide-zinc-100">
                          <thead>
                            <tr className="bg-zinc-50">
                              <th scope="col" className="px-3.5 py-2 text-left text-[9px] font-black uppercase text-zinc-500">Katalog Produk</th>
                              <th scope="col" className="px-3.5 py-2 text-center text-[9px] font-black uppercase text-zinc-500">Harga Satuan</th>
                              <th scope="col" className="px-3.5 py-2 text-center text-[9px] font-black uppercase text-zinc-500">Total Transaksi</th>
                              <th scope="col" className="px-3.5 py-2 text-center text-[9px] font-black uppercase text-zinc-500">Kuantitas Terjual</th>
                              <th scope="col" className="px-3.5 py-2 text-center text-[9px] font-black uppercase text-zinc-500">Rasio Dine / Take</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-zinc-100 text-[11px] font-medium text-zinc-700">
                            {productStats.tableData.length > 0 ? (
                              productStats.tableData.slice(0, 10).map((prod) => (
                                <tr key={prod.id} className="hover:bg-zinc-50/50">
                                  <td className="px-3.5 py-2 font-bold text-zinc-800">{prod.name}</td>
                                  <td className="px-3.5 py-2 text-center font-mono text-zinc-500">{formatPrice(prod.price)}</td>
                                  <td className="px-3.5 py-2 text-center font-bold text-zinc-600">{prod.totalOrders}x order</td>
                                  <td className="px-3.5 py-2 text-center font-black font-mono text-rose-600 bg-rose-50/20">{prod.totalQty} pcs</td>
                                  <td className="px-3.5 py-2 text-center">
                                    <div className="flex items-center justify-center gap-1.5 font-bold">
                                      <span className="text-rose-500">{prod.dineInQty} DI</span>
                                      <span className="text-zinc-300">/</span>
                                      <span className="text-amber-500">{prod.takeAwayQty} TA</span>
                                    </div>
                                  </td>
                                </tr>
                              ))
                            ) : (
                              <tr>
                                <td colSpan={5} className="px-3.5 py-6 text-center text-zinc-400 font-semibold">Tabel data performa kosong. Silakan buat pesanan terlebih dahulu.</td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Invoice Tracking & Management Panel (Req 6 & Real-time controller) */}
                    <div className="bg-white p-4 rounded-2xl border border-zinc-200 shadow-sm space-y-4">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-100 pb-2.5">
                        <div className="flex items-center gap-2">
                          <Check className="w-4 h-4 text-rose-600" />
                          <h5 className="font-display font-black text-sm text-brand-charcoal">
                            Status Invoice & Log Pemesanan Pelanggan
                          </h5>
                        </div>
                        
                        {/* Search in invoices */}
                        <div className="relative">
                          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                          <input
                            type="text"
                            value={invoiceSearch}
                            onChange={(e) => setInvoiceSearch(e.target.value)}
                            placeholder="Cari Invoice / Nama / No Telp"
                            className="bg-zinc-50 hover:bg-zinc-100 focus:bg-white text-[10px] font-bold border border-zinc-200 focus:border-rose-500 outline-none rounded-xl pl-8.5 pr-3 py-1.5 w-full sm:w-52 transition-all"
                          />
                        </div>
                      </div>

                      {/* Invoice List */}
                      <div className="space-y-3 max-h-[360px] overflow-y-auto pr-1">
                        {filteredAndSearchedInvoices.length > 0 ? (
                          filteredAndSearchedInvoices.slice(0, 20).map((inv) => (
                            <div key={inv.id || inv.invoiceNo} className="border border-zinc-150 rounded-xl p-3 text-left hover:border-zinc-300 transition-all flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
                              <div className="space-y-1 sm:max-w-md">
                                <div className="flex flex-wrap items-center gap-2">
                                  <span className="font-mono font-black text-[10px] text-zinc-800 tracking-wide bg-zinc-100 border border-zinc-200.50 px-2 py-0.5 rounded-md">{inv.invoiceNo || inv.id}</span>
                                  <span className="text-[10px] text-zinc-400 font-bold font-mono">{inv.orderDate || 'Kapan saja'}</span>
                                  <span className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                                    inv.method === 'DINE_IN' 
                                      ? 'bg-rose-50 text-rose-600 border border-rose-200/40' 
                                      : 'bg-amber-50 text-amber-600 border border-amber-200/50'
                                  }`}>
                                    {inv.method === 'DINE_IN' ? 'Dine In' : 'Take Away'}
                                  </span>
                                </div>

                                <div className="text-[11px] text-zinc-700 font-bold">
                                  Nama: <span className="text-zinc-900 font-extrabold">{inv.name}</span> • Telp: <span className="font-mono text-zinc-650">{inv.phone}</span>
                                </div>
                                
                                <div className="text-[10px] text-zinc-500 leading-relaxed font-medium">
                                  Menu: <span className="font-bold text-zinc-650">{inv.items?.map((it: any) => `${it.quantity}x ${it.menuItem?.name || ''}`).join(', ')}</span>
                                </div>
                              </div>

                              <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end border-t md:border-t-0 border-zinc-100 pt-2 md:pt-0">
                                <div className="text-right">
                                  <span className="text-[9px] text-zinc-400 font-bold block uppercase font-mono">Total Bayar</span>
                                  <span className="text-xs font-black text-brand-charcoal font-semibold">{formatPrice(inv.total || 0)}</span>
                                </div>

                                <div className="flex items-center gap-2">
                                  {/* Status editor select */}
                                  <select
                                    value={inv.status || 'Baru dibuat'}
                                    onChange={(e) => handleUpdateInvoiceStatus(inv.invoiceNo || inv.id, e.target.value)}
                                    className={`text-[10px] font-black border rounded-xl py-1 px-2.5 outline-none cursor-pointer shadow-sm transition-all ${
                                      inv.status === 'Selesai / datang ke toko'
                                        ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                                        : inv.status === 'Dikonfirmasi'
                                        ? 'bg-amber-50 border-amber-200 text-amber-700'
                                        : inv.status === 'Dikirim ke WhatsApp'
                                        ? 'bg-blue-50 border-blue-200 text-blue-700'
                                        : 'bg-zinc-100 border-zinc-200 text-zinc-500'
                                    }`}
                                  >
                                    <option value="Baru dibuat">Baru dibuat</option>
                                    <option value="Dikirim ke WhatsApp">Dikirim ke WhatsApp</option>
                                    <option value="Dikonfirmasi">Dikonfirmasi</option>
                                    <option value="Selesai / datang ke toko">Selesai / datang ke toko</option>
                                  </select>

                                  {/* Delete action */}
                                  <button
                                    onClick={() => handleDeleteInvoice(inv.invoiceNo || inv.id)}
                                    className="p-1 px-1.5 hover:bg-red-50 text-red-500 hover:text-red-700 border border-transparent hover:border-red-200 rounded-lg cursor-pointer transition-all"
                                    title="Hapus Invoice"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="py-12 border border-dashed border-zinc-200 text-zinc-400 rounded-xl font-bold text-xs text-center uppercase tracking-wide">
                            Kami tidak menemukan invoice yang cocok dengan kriteria pencarian / filter Anda.
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* --- TAB 1: MENU CATALOG MANAGEMENT --- */}
                {activeTab === 'menu' && (
                  <div className="space-y-4">
                    {/* Catalog Controls */}
                    <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
                      <div className="flex items-center gap-2">
                        <h4 className="font-display font-black text-lg text-brand-charcoal">
                          Katalog Menu Cloud
                        </h4>
                        <span className="bg-rose-50 text-rose-600 text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border border-rose-200/50">
                          {menuItems.length} Produk
                        </span>
                      </div>

                      <div className="flex gap-2">
                        {dbMenuItems.some((item) => item.isDeleted) && (
                          <button
                            onClick={handleRestoreDefaults}
                            className="bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 font-bold text-xs py-2 px-3.5 rounded-xl shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
                            title="Pulihkan Semua Menu Bawaan yang Terhapus/Disembunyikan"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                            Pulihkan Terhapus
                          </button>
                        )}
                        {menuItems.length === 0 && (
                          <button
                            onClick={handleInitializeDb}
                            className="bg-amber-500 hover:bg-amber-600 text-zinc-950 font-bold text-xs py-2 px-3.5 rounded-xl shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                            Impor Bawaan
                          </button>
                        )}
                        <button
                          onClick={() => handleOpenForm()}
                          className="bg-primary-orange hover:bg-primary-orange-dark text-white font-extrabold text-xs py-2 px-4 rounded-xl shadow-md transition-colors cursor-pointer flex items-center gap-1.5"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          Tambah Menu Baru
                        </button>
                      </div>
                    </div>

                    {/* Filters & Search */}
                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 bg-white p-3.5 rounded-2xl border border-zinc-150 shadow-xs">
                      {/* Search box input */}
                      <div className="sm:col-span-7 relative">
                        <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-3" />
                        <input
                          type="text"
                          placeholder="Cari menu..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="w-full bg-zinc-50 border border-zinc-200 rounded-xl pl-9.5 pr-4 py-2.5 text-xs text-brand-charcoal focus:outline-none focus:border-primary-orange transition-colors"
                        />
                      </div>
                      {/* Categories dropdown filtering */}
                      <div className="sm:col-span-5">
                        <select
                          value={selectedCategory}
                          onChange={(e) => setSelectedCategory(e.target.value as MenuCategory | 'ALL')}
                          className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2.5 text-xs text-brand-charcoal focus:outline-none focus:border-primary-orange transition-colors cursor-pointer font-bold"
                        >
                          <option value="ALL">Semua Kategori</option>
                          {CATEGORIES.map((cat) => (
                            <option key={cat} value={cat}>
                              {cat}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Catalog list grid view */}
                    <div className="bg-white rounded-3xl border border-zinc-150 shadow-xs overflow-hidden">
                      <div className="max-h-[50vh] overflow-y-auto divide-y divide-zinc-100">
                        {filteredItems.length === 0 ? (
                          <div className="text-center py-20 px-4">
                            <Layers className="w-10 h-10 text-zinc-300 mx-auto mb-3" />
                            <p className="text-xs text-zinc-500 font-bold mb-1">Katalog Kosong / Tidak Ditemukan</p>
                            <p className="text-[10px] text-zinc-400 max-w-xs mx-auto">
                              Cobalah bersihkan kata kunci pencarian Anda, pilih kategori lain, atau impor menu default bawaan.
                            </p>
                          </div>
                        ) : (
                          filteredItems.map((item, idx) => (
                            <div key={`${item.id}-${idx}`} className="p-3.5 flex items-center gap-4.5 hover:bg-zinc-50/50 transition-colors">
                              {/* Thumbnail preview */}
                              <div className="w-12 h-12 rounded-xl overflow-hidden border border-zinc-100 flex-shrink-0 bg-zinc-50">
                                <img
                                  src={item.image}
                                  alt={item.name}
                                  className="w-full h-full object-cover"
                                  referrerPolicy="no-referrer"
                                  onError={(e) => {
                                    // Fallback avatar icon
                                    (e.target as any).src = 'https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&q=80&w=200';
                                  }}
                                />
                              </div>

                              <div className="flex-grow flex flex-col min-w-0">
                                <div className="flex items-center gap-2 flex-wrap mb-0.5">
                                  <span className="font-display font-black text-xs sm:text-sm text-brand-charcoal truncate max-w-[200px] sm:max-w-xs">
                                    {item.name}
                                  </span>
                                  {isFromDb(item.id) ? (
                                    <span className="bg-emerald-50 text-emerald-700 text-[8px] font-extrabold px-1.5 py-0.5 rounded-md border border-emerald-200/40 uppercase tracking-widest font-mono">
                                      Cloud
                                    </span>
                                  ) : (
                                    <span className="bg-zinc-100 text-zinc-500 text-[8px] font-extrabold px-1.5 py-0.5 rounded-md border border-zinc-200 uppercase tracking-widest font-mono">
                                      Bawaan
                                    </span>
                                  )}
                                  {item.isBestSeller && (
                                    <span className="bg-amber-100 text-amber-800 text-[8px] font-extrabold px-1.5 py-0.5 rounded-md border border-amber-200/40 uppercase tracking-widest font-mono">
                                      Best Seller
                                    </span>
                                  )}
                                  {item.isAvailable === false && (
                                    <span className="bg-red-150 text-red-800 text-[8px] font-extrabold px-1.5 py-0.5 rounded-md border border-red-200/45 uppercase tracking-widest font-mono animate-pulse">
                                      Habis / Nonaktif
                                    </span>
                                  )}
                                  {item.pieces && (
                                    <span className="bg-zinc-100 text-zinc-600 text-[8px] font-mono font-bold px-1 py-0.5 rounded-sm">
                                      {item.pieces} Pcs
                                    </span>
                                  )}
                                </div>
                                <div className="flex items-center gap-2 text-[10px] text-zinc-400 font-mono font-bold">
                                  <span className="text-rose-600 uppercase tracking-wide">
                                    {item.category.replace('DIMSUM ', '')}
                                  </span>
                                  <span>•</span>
                                  <span className="text-brand-charcoal font-bold bg-zinc-50 border border-zinc-100 px-1 py-0.2 rounded">
                                    {formatPrice(item.price)}
                                  </span>
                                </div>
                              </div>

                              {/* Operation triggers */}
                              <div className="flex gap-1.5 items-center">
                                <button
                                  onClick={() => handleToggleAvailability(item)}
                                  title={item.isAvailable !== false ? "Tandai sebagai Habis" : "Tandai sebagai Tersedia"}
                                  className={`p-1 px-2.5 rounded-lg transition-all border cursor-pointer flex items-center gap-1 text-[10px] font-bold ${
                                    item.isAvailable !== false
                                      ? 'bg-emerald-55 border-emerald-200 text-emerald-800 hover:bg-emerald-100/75'
                                      : 'bg-zinc-100 border-zinc-200 text-zinc-500 hover:bg-zinc-200'
                                  }`}
                                >
                                  {item.isAvailable !== false ? (
                                    <>
                                      <Check className="w-3 h-3 text-emerald-600 stroke-[3px]" />
                                      Tersedia
                                    </>
                                  ) : (
                                    <>
                                      <X className="w-3 h-3 text-zinc-500 stroke-[3px]" />
                                      Habis
                                    </>
                                  )}
                                </button>
                                <button
                                  onClick={() => handleOpenForm(item)}
                                  title="Edit Item"
                                  className="p-1 px-3 bg-zinc-50 hover:bg-zinc-100 text-zinc-700 hover:text-rose-600 rounded-lg transition-all border border-zinc-200 cursor-pointer flex items-center gap-1 text-[10px] font-bold"
                                >
                                  <Edit2 className="w-3 h-3" />
                                  Edit
                                </button>
                                <button
                                  onClick={() => handleDeleteItem(item.id, item.name)}
                                  title="Hapus Item"
                                  className="p-1 px-2.5 bg-red-50 hover:bg-red-100 text-red-650 rounded-lg transition-all border border-red-100 cursor-pointer flex items-center gap-1 text-[10px] font-bold"
                                >
                                  <Trash2 className="w-3 h-3" />
                                  Hapus
                                </button>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* --- TAB 2: GLOBAL LOGO & APP BRAND SETTINGS --- */}
                {activeTab === 'settings' && (
                  <div className="bg-white p-6 rounded-3xl border border-zinc-150 shadow-xs space-y-6">
                    {/* Header */}
                    <div className="border-b border-zinc-150 pb-3 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                      <div>
                        <h4 className="font-display font-black text-lg text-brand-charcoal">
                          Pengaturan Umum & Manajemen Konten Website
                        </h4>
                        <p className="text-xs text-zinc-500 font-medium">
                          Ubah alamat, link Google Maps, jam buka, ulasan testimoni, media sosial & visual website.
                        </p>
                      </div>
                    </div>

                    <form onSubmit={handleSaveSettings} className="space-y-4 bg-zinc-50/50 p-4.5 rounded-3xl border border-zinc-150">
                        <div className="grid grid-cols-1 md:grid-cols-12 gap-5.5">
                          <div className="md:col-span-4 flex flex-col items-center justify-center text-center p-3 bg-white border border-zinc-150 rounded-2xl">
                            <label className="text-[10px] font-black uppercase tracking-wider text-zinc-400 mb-2">Pratinjau Logo Aktif</label>
                            <div className="w-24 h-24 rounded-full border-2 border-dashed border-zinc-300 bg-zinc-100 flex items-center justify-center overflow-hidden shadow-xs">
                              {logoInput ? (
                                <img src={logoInput} alt="Logo Brand" className="w-full h-full object-cover" />
                              ) : (
                                <ImageIcon className="w-8 h-8 text-zinc-400" />
                              )}
                            </div>
                          </div>
                          <div className="md:col-span-8 space-y-3">
                            <div>
                              <div className="flex justify-between items-center mb-1">
                                <label className="text-xs font-bold text-brand-charcoal block">Logo Brand (Unggah Foto)</label>
                                <span className="text-[9px] text-zinc-400 font-semibold uppercase">Seret / Pilih File</span>
                              </div>
                              
                              <div
                                onDragOver={(e) => {
                                  e.preventDefault();
                                  setIsDraggingLogo(true);
                                }}
                                onDragLeave={() => setIsDraggingLogo(false)}
                                onDrop={(e) => {
                                  e.preventDefault();
                                  setIsDraggingLogo(false);
                                  const file = e.dataTransfer.files?.[0];
                                  if (file) compressAndSetLogo(file);
                                }}
                                className={`relative border-2 border-dashed rounded-xl p-4.5 text-center transition-all flex flex-col items-center justify-center gap-2 cursor-pointer ${
                                  isDraggingLogo
                                    ? 'border-primary-orange bg-primary-orange/5'
                                    : 'border-zinc-200 hover:border-primary-orange/50 bg-white'
                                }`}
                                onClick={() => document.getElementById('logo-upload-input')?.click()}
                              >
                                <input
                                  id="logo-upload-input"
                                  type="file"
                                  accept="image/*"
                                  className="hidden"
                                  onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) compressAndSetLogo(file);
                                  }}
                                />

                                {isUploadingLogo ? (
                                  <div className="flex flex-col items-center gap-1.5 py-2">
                                    <div className="w-5 h-5 border-2 border-primary-orange border-t-transparent rounded-full animate-spin" />
                                    <span className="text-[10px] font-bold text-zinc-500">Memproses & mengkompresi logo...</span>
                                  </div>
                                ) : (
                                  <div className="flex flex-col items-center gap-1.5 py-1">
                                    <div className="w-8 h-8 rounded-full bg-primary-orange/10 flex items-center justify-center text-primary-orange">
                                      <UploadCloud className="w-4 h-4" />
                                    </div>
                                    <div className="space-y-0.5">
                                      <p className="text-[10px] font-bold text-brand-charcoal">
                                        Seret & Lepas foto logo di sini, atau <span className="text-primary-orange underline">Pilih dari Galeri</span>
                                      </p>
                                      <p className="text-[8.5px] text-zinc-400">Dimensi kotak/lingkaran disarankan (PNG, JPG, WEBP)</p>
                                    </div>
                                  </div>
                                )}

                                {logoUploadError && (
                                  <div className="text-[9px] font-bold text-red-500 bg-red-50/50 px-2.5 py-1 rounded-lg mt-1 w-full text-center">
                                    ⚠️ {logoUploadError}
                                  </div>
                                )}
                              </div>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              <div>
                                <label className="text-xs font-bold text-brand-charcoal block mb-1">Nomor WhatsApp Wa.me</label>
                                <input
                                  type="text"
                                  value={formWhatsappNumber}
                                  onChange={(e) => setFormWhatsappNumber(e.target.value)}
                                  placeholder="Contoh: 6281818758265 (Tanpa '+')"
                                  className="w-full bg-white border border-zinc-200 rounded-xl px-3.5 py-2.5 text-xs text-brand-charcoal focus:outline-none focus:border-primary-orange"
                                />
                              </div>
                              <div>
                                <label className="text-xs font-bold text-brand-charcoal block mb-1">Nama Tampilan Kontak</label>
                                <input
                                  type="text"
                                  value={formWhatsappName}
                                  onChange={(e) => setFormWhatsappName(e.target.value)}
                                  placeholder="Contoh: Suki Yusuki Admin"
                                  className="w-full bg-white border border-zinc-200 rounded-xl px-3.5 py-2.5 text-xs text-brand-charcoal focus:outline-none focus:border-primary-orange"
                                />
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* SECTION 2: LOKASI GERAI & OPERASIONAL */}
                        <div className="border-t border-zinc-200/60 pt-4.5 space-y-4">
                          <h5 className="text-[11px] font-black uppercase tracking-wider text-primary-orange block-title">
                            📍 PROFIL & LOKASI FISIK GERAI
                          </h5>
                          
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                              <label className="text-xs font-bold text-brand-charcoal block mb-1">Nama Gerai / Lokasi Utama</label>
                              <input
                                type="text"
                                value={formOutletName}
                                onChange={(e) => setFormOutletName(e.target.value)}
                                placeholder="Contoh: SukiYuSuki Bantarsoka"
                                className="w-full bg-white border border-zinc-200 rounded-xl px-3.5 py-2.5 text-xs text-brand-charcoal focus:outline-none focus:border-primary-orange"
                              />
                            </div>
                            <div>
                              <label className="text-xs font-bold text-brand-charcoal block mb-1">Link URL Google Maps (Pin)</label>
                              <input
                                type="url"
                                value={formOutletGmaps}
                                onChange={(e) => setFormOutletGmaps(e.target.value)}
                                placeholder="Contoh: https://maps.app.goo.gl/..."
                                className="w-full bg-white border border-zinc-200 rounded-xl px-3.5 py-2.5 text-xs text-brand-charcoal focus:outline-none focus:border-primary-orange"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="text-xs font-bold text-brand-charcoal block mb-1">Alamat Lengkap Gerai</label>
                            <textarea
                              value={formOutletAddress}
                              onChange={(e) => setFormOutletAddress(e.target.value)}
                              rows={2}
                              placeholder="Masukkan detail jalan, RT/RW, kecamatan, kabupaten, kode pos..."
                              className="w-full bg-white border border-zinc-200 rounded-xl px-3.5 py-2.5 text-xs text-brand-charcoal focus:outline-none focus:border-primary-orange resize-none"
                            />
                          </div>

                          <div>
                            <label className="text-xs font-bold text-brand-charcoal block mb-1">Deskripsi / Caption Gerai</label>
                            <textarea
                              value={formOutletDescription}
                              onChange={(e) => setFormOutletDescription(e.target.value)}
                              rows={2}
                              placeholder="Keterangan / caption gerai yang menarik (dimsum, suki, dumpling dll)..."
                              className="w-full bg-white border border-zinc-200 rounded-xl px-3.5 py-2.5 text-xs text-brand-charcoal focus:outline-none focus:border-primary-orange resize-none"
                            />
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-zinc-150/55 pt-3.5">
                            <div>
                              <label className="text-xs font-bold text-brand-charcoal block mb-1">Hari Pelayanan (Judul Utama)</label>
                              <input
                                type="text"
                                value={formOperatingDays}
                                onChange={(e) => setFormOperatingDays(e.target.value)}
                                placeholder="Contoh: Buka Setiap Hari"
                                className="w-full bg-white border border-zinc-200 rounded-xl px-3.5 py-2.5 text-xs text-brand-charcoal focus:outline-none focus:border-primary-orange"
                              />
                            </div>
                            <div>
                              <label className="text-xs font-bold text-brand-charcoal block mb-1">Hari Pelayanan (Detail/Sub-teks)</label>
                              <input
                                type="text"
                                value={formOperatingDaysSub}
                                onChange={(e) => setFormOperatingDaysSub(e.target.value)}
                                placeholder="Contoh: (Senin s/d Minggu)"
                                className="w-full bg-white border border-zinc-200 rounded-xl px-3.5 py-2.5 text-xs text-brand-charcoal focus:outline-none focus:border-primary-orange"
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                              <label className="text-xs font-bold text-brand-charcoal block mb-1">Jam Pelayanan (Judul Utama)</label>
                              <input
                                type="text"
                                value={formOperatingHours}
                                onChange={(e) => setFormOperatingHours(e.target.value)}
                                placeholder="Contoh: 16.30 WIB - Selesai"
                                className="w-full bg-white border border-zinc-200 rounded-xl px-3.5 py-2.5 text-xs text-brand-charcoal focus:outline-none focus:border-primary-orange"
                              />
                            </div>
                            <div>
                              <label className="text-xs font-bold text-brand-charcoal block mb-1">Jam Pelayanan (Detail/Sub-teks)</label>
                              <input
                                type="text"
                                value={formOperatingHoursSub}
                                onChange={(e) => setFormOperatingHoursSub(e.target.value)}
                                placeholder="Contoh: (Biasa sold out jam 21.00!)"
                                className="w-full bg-white border border-zinc-200 rounded-xl px-3.5 py-2.5 text-xs text-brand-charcoal focus:outline-none focus:border-primary-orange"
                              />
                            </div>
                          </div>
                        </div>

                        {/* SECTION 3: KONTROL MEDIA VISUAL (HERO & ABOUT US IMAGES) */}
                        <div className="border-t border-zinc-200/60 pt-4.5 space-y-4">
                          <h5 className="text-[11px] font-black uppercase tracking-wider text-rose-500 block-title">
                            🖼️ KELOLA MEDIA VISUAL WEBSITE (FOTO)
                          </h5>
                          
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                            {/* HERO BANNER UPLOADER */}
                            <div className="space-y-2">
                              <div className="flex justify-between items-center">
                                <label className="text-xs font-bold text-brand-charcoal block">Foto Banner Hero (Atas)</label>
                                {formHeroImageUrl && formHeroImageUrl !== "/src/assets/images/dimsum_cart_hero_1780660457427.png" && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setFormHeroImageUrl("/src/assets/images/dimsum_cart_hero_1780660457427.png");
                                      addToast('success', 'Reset Berhasil', 'Foto Banner Hero dikembalikan ke default.');
                                    }}
                                    className="text-[10px] font-bold text-red-500 hover:text-red-700 flex items-center gap-1 transition-colors"
                                  >
                                    <RotateCcw className="w-3 h-3" /> Reset ke Default
                                  </button>
                                )}
                              </div>
                              
                              <div
                                onDragOver={(e) => { e.preventDefault(); setIsDraggingHero(true); }}
                                onDragLeave={() => setIsDraggingHero(false)}
                                onDrop={handleHeroDrop}
                                onClick={() => document.getElementById('hero-file-input')?.click()}
                                className={`relative w-full h-44 rounded-2xl border-2 border-dashed transition-all duration-200 flex flex-col items-center justify-center cursor-pointer p-4 overflow-hidden group select-none ${
                                  isDraggingHero
                                    ? 'border-emerald-500 bg-emerald-50/40'
                                    : 'border-zinc-300 hover:border-primary-orange hover:bg-zinc-50/50 bg-white/20'
                                }`}
                              >
                                <input
                                  id="hero-file-input"
                                  type="file"
                                  accept="image/*"
                                  onChange={handleHeroFileChange}
                                  className="hidden"
                                />

                                {isProcessingHero ? (
                                  <div className="flex flex-col items-center gap-2 text-center text-zinc-500 animate-pulse">
                                    <RotateCcw className="w-8 h-8 animate-spin text-primary-orange" />
                                    <span className="text-xs font-semibold">Memproses & mengkompresi gambar...</span>
                                  </div>
                                ) : formHeroImageUrl ? (
                                  <>
                                    <img
                                      src={formHeroImageUrl}
                                      alt="Pratinjau Hero"
                                      className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 rounded-2xl"
                                      onError={(e) => { (e.target as HTMLImageElement).src = 'https://placehold.co/400x300?text=Gambar+Bermasalah'; }}
                                    />
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col items-center justify-center text-white gap-1.5 p-3 text-center">
                                      <UploadCloud className="w-6 h-6 text-white drop-shadow" />
                                      <span className="text-xs font-bold font-display drop-shadow">Lepas atau Klik untuk Ganti Foto</span>
                                      <span className="text-[9px] text-zinc-200 drop-shadow">Max size ideal: 1000px wide</span>
                                    </div>
                                  </>
                                ) : (
                                  <div className="text-center space-y-2">
                                    <div className="mx-auto w-10 h-10 rounded-full bg-zinc-100 flex items-center justify-center">
                                      <UploadCloud className="w-5 h-5 text-zinc-400 group-hover:text-primary-orange transition-colors" />
                                    </div>
                                    <div>
                                      <span className="text-xs font-bold text-zinc-600 block">Tarik & lepas foto banner ke sini</span>
                                      <span className="text-[10px] text-zinc-400 block font-medium">atau klik untuk menelusuri galeri</span>
                                    </div>
                                  </div>
                                )}
                              </div>
                              <span className="text-[9px] text-zinc-400 block font-medium leading-tight">Mempunyai efek langsung pada gambar piring/bambu dimsum melingkar di panel paling atas website.</span>
                            </div>

                            {/* ABOUT US UPLOADER */}
                            <div className="space-y-2">
                              <div className="flex justify-between items-center">
                                <label className="text-xs font-bold text-brand-charcoal block">Foto Tentang Kami (Dapur Fisik)</label>
                                {formAboutUsImageUrl && formAboutUsImageUrl !== "/src/assets/images/yusuki_physical_outlet_1780673086306.png" && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setFormAboutUsImageUrl("/src/assets/images/yusuki_physical_outlet_1780673086306.png");
                                      addToast('success', 'Reset Berhasil', 'Foto Dapur Fisik dikembalikan ke default.');
                                    }}
                                    className="text-[10px] font-bold text-red-500 hover:text-red-700 flex items-center gap-1 transition-colors"
                                  >
                                    <RotateCcw className="w-3 h-3" /> Reset ke Default
                                  </button>
                                )}
                              </div>

                              <div
                                onDragOver={(e) => { e.preventDefault(); setIsDraggingAbout(true); }}
                                onDragLeave={() => setIsDraggingAbout(false)}
                                onDrop={handleAboutDrop}
                                onClick={() => document.getElementById('about-file-input')?.click()}
                                className={`relative w-full h-44 rounded-2xl border-2 border-dashed transition-all duration-200 flex flex-col items-center justify-center cursor-pointer p-4 overflow-hidden group select-none ${
                                  isDraggingAbout
                                    ? 'border-emerald-500 bg-emerald-50/40'
                                    : 'border-zinc-300 hover:border-primary-orange hover:bg-zinc-50/50 bg-white/20'
                                }`}
                              >
                                <input
                                  id="about-file-input"
                                  type="file"
                                  accept="image/*"
                                  onChange={handleAboutFileChange}
                                  className="hidden"
                                />

                                {isProcessingAbout ? (
                                  <div className="flex flex-col items-center gap-2 text-center text-zinc-500 animate-pulse">
                                    <RotateCcw className="w-8 h-8 animate-spin text-primary-orange" />
                                    <span className="text-xs font-semibold">Memproses & mengkompresi gambar...</span>
                                  </div>
                                ) : formAboutUsImageUrl ? (
                                  <>
                                    <img
                                      src={formAboutUsImageUrl}
                                      alt="Pratinjau Tentang"
                                      className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 rounded-2xl"
                                      onError={(e) => { (e.target as HTMLImageElement).src = 'https://placehold.co/400x300?text=Gambar+Bermasalah'; }}
                                    />
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col items-center justify-center text-white gap-1.5 p-3 text-center">
                                      <UploadCloud className="w-6 h-6 text-white drop-shadow" />
                                      <span className="text-xs font-bold font-display drop-shadow">Lepas atau Klik untuk Ganti Foto</span>
                                      <span className="text-[9px] text-zinc-200 drop-shadow">Max size ideal: 1000px wide</span>
                                    </div>
                                  </>
                                ) : (
                                  <div className="text-center space-y-2">
                                    <div className="mx-auto w-10 h-10 rounded-full bg-zinc-100 flex items-center justify-center">
                                      <UploadCloud className="w-5 h-5 text-zinc-400 group-hover:text-primary-orange transition-colors" />
                                    </div>
                                    <div>
                                      <span className="text-xs font-bold text-zinc-600 block">Tarik & lepas foto gerai ke sini</span>
                                      <span className="text-[10px] text-zinc-400 block font-medium">atau klik untuk menelusuri galeri</span>
                                    </div>
                                  </div>
                                )}
                              </div>
                              <span className="text-[9px] text-zinc-400 block font-medium leading-tight">Mempunyai efek langsung pada gambar gerobak/outlet suki & dimsum di bagian "Tentang Kami".</span>
                            </div>
                          </div>
                        </div>

                        {/* SECTION 4: SOCIAL MEDIA & CHANNELS */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-zinc-200/60 pt-4.5">
                          <div className="sm:col-span-2">
                            <h5 className="text-[11px] font-black uppercase tracking-wider text-zinc-400">
                              🔗 MEDIA SOSIAL & LAYANAN ONLINE
                            </h5>
                          </div>
                          <div>
                            <label className="text-xs font-bold text-brand-charcoal block mb-1">User Handles Instagram</label>
                            <input
                              type="text"
                              value={formInstagramHandle}
                              onChange={(e) => setFormInstagramHandle(e.target.value)}
                              placeholder="Contoh: @sukiyusuki"
                              className="w-full bg-white border border-zinc-200 rounded-xl px-3.5 py-2.5 text-xs text-brand-charcoal focus:outline-none focus:border-primary-orange"
                            />
                          </div>
                          <div>
                            <label className="text-xs font-bold text-brand-charcoal block mb-1">Link URL Instagram Profil</label>
                            <input
                              type="url"
                              value={formInstagramUrl}
                              onChange={(e) => setFormInstagramUrl(e.target.value)}
                              placeholder="Contoh: https://instagram.com/filename"
                              className="w-full bg-white border border-zinc-200 rounded-xl px-3.5 py-2.5 text-xs text-brand-charcoal focus:outline-none focus:border-primary-orange"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="text-xs font-bold text-brand-charcoal block mb-1">User Handles TikTok</label>
                            <input
                              type="text"
                              value={formTiktokHandle}
                              onChange={(e) => setFormTiktokHandle(e.target.value)}
                              placeholder="Contoh: @sukiyusuki"
                              className="w-full bg-white border border-zinc-100 rounded-xl px-3.5 py-2.5 text-xs text-brand-charcoal focus:outline-none focus:border-primary-orange"
                            />
                          </div>
                          <div>
                            <label className="text-xs font-bold text-brand-charcoal block mb-1">Link URL TikTok Profil</label>
                            <input
                              type="url"
                              value={formTiktokUrl}
                              onChange={(e) => setFormTiktokUrl(e.target.value)}
                              placeholder="Contoh: https://tiktok.com/@id"
                              className="w-full bg-white border border-zinc-100 rounded-xl px-3.5 py-2.5 text-xs text-brand-charcoal focus:outline-none focus:border-primary-orange"
                            />
                          </div>
                        </div>

                        {/* ShopeeFood & GoFood Ordering Links */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-zinc-200/60 pt-4">
                          <div>
                            <label className="text-xs font-bold text-brand-charcoal block mb-1">Link URL ShopeeFood</label>
                            <input
                              type="url"
                              value={formShopeefoodUrl}
                              onChange={(e) => setFormShopeefoodUrl(e.target.value)}
                              placeholder="Contoh: https://shopee.co.id/m/shopeefood"
                              className="w-full bg-white border border-zinc-200 rounded-xl px-3.5 py-2.5 text-xs text-brand-charcoal focus:outline-none focus:border-primary-orange"
                            />
                          </div>
                          <div>
                            <label className="text-xs font-bold text-brand-charcoal block mb-1">Link URL GoFood</label>
                            <input
                              type="url"
                              value={formGofoodUrl}
                              onChange={(e) => setFormGofoodUrl(e.target.value)}
                              placeholder="Contoh: https://gofood.co.id"
                              className="w-full bg-white border border-zinc-200 rounded-xl px-3.5 py-2.5 text-xs text-brand-charcoal focus:outline-none focus:border-primary-orange"
                            />
                          </div>
                        </div>

                        <div className="flex justify-end pt-3">
                          <button
                            type="submit"
                            className="bg-primary-orange hover:bg-primary-orange-dark text-white font-extrabold text-xs py-2.5 px-5 rounded-xl shadow-md transition-colors flex items-center gap-1.5 cursor-pointer"
                          >
                            <Save className="w-3.5 h-3.5" />
                            Simpan Profil & Sosial
                          </button>
                        </div>
                      </form>

                      {/* --- TENTANG KAMI SLIDESHOW / COMPANY PROFILE MANAGER SECTION --- */}
                      <div className="bg-zinc-50 border border-zinc-150 p-5 rounded-3xl space-y-4">
                        <div className="flex justify-between items-center pb-2 border-b border-zinc-250">
                          <div>
                            <h4 className="font-display font-black text-sm text-brand-charcoal flex items-center gap-1.5">
                              <BookOpen className="w-4 h-4 text-primary-orange animate-pulse" />
                              Kelola Slide Company Profile / Tentang Kami
                            </h4>
                            <p className="text-[10px] text-zinc-500 font-medium">
                              Kustomisasi isi slide karosel cerita website (Slide Perjalanan Bisnis, Owner, atau Karyawan).
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleOpenAboutSlideForm()}
                            className="bg-primary-orange text-white hover:bg-primary-orange-dark font-extrabold text-[10px] py-1.5 px-3 rounded-lg shadow-xs transition-colors flex items-center gap-1 cursor-pointer"
                          >
                            + Tambah Slide Baru
                          </button>
                        </div>

                        {dbAboutSlides.length === 0 ? (
                          <div className="text-center py-6 bg-white border border-zinc-150 rounded-2xl">
                            <p className="text-xs text-zinc-500 font-semibold mb-1">Daftar Slide Tentang Kami Kosong</p>
                            <p className="text-[10px] text-zinc-400 font-normal">Belum ada slide terdaftar. Klik "+ Tambah Slide Baru" untuk membuat.</p>
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 gap-3.5">
                            {dbAboutSlides.map((slide, sIdx) => (
                              <div key={slide.id} className="bg-white border border-zinc-150 p-4 rounded-2xl md:flex items-center justify-between gap-5 shadow-xs">
                                <div className="flex items-center gap-3.5 overflow-hidden">
                                  {/* Slide thumbnail picture */}
                                  <div className="w-14 h-14 rounded-xl border border-zinc-200 overflow-hidden shrink-0 bg-brand-cream-dark/20">
                                    <img src={slide.image || '/src/assets/images/yusuki_physical_outlet_1780673086306.png'} alt={slide.title} className="w-full h-full object-cover" />
                                  </div>
                                  <div className="min-w-0 pr-2">
                                    <span className="text-[9px] uppercase tracking-wider text-rose-500 font-black font-mono">
                                      Slide {sIdx + 1}: {slide.subtitle || 'Kisah Kami'}
                                    </span>
                                    <h5 className="font-sans font-black text-xs text-brand-charcoal truncate mt-0.5">{slide.title}</h5>
                                    <p className="text-[10px] text-zinc-400 truncate max-w-lg mt-0.5 font-medium leading-tight">
                                      {slide.paragraphs ? slide.paragraphs.join(' ') : ''}
                                    </p>
                                  </div>
                                </div>
                                
                                <div className="flex items-center gap-2 shrink-0 border-t md:border-t-0 border-dashed border-zinc-100 pt-3.5 md:pt-0 mt-3 md:mt-0 justify-end">
                                  <button
                                    type="button"
                                    onClick={() => handleOpenAboutSlideForm(slide)}
                                    className="bg-zinc-105 border border-zinc-200 hover:bg-zinc-200 hover:border-zinc-300 text-brand-charcoal text-[10px] font-black px-3.5 py-1.5 rounded-lg transition-all cursor-pointer"
                                  >
                                    Edit Slide
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteAboutSlide(slide.id)}
                                    className="bg-rose-50 border border-rose-100 text-rose-700 hover:bg-rose-100 hover:border-rose-200 text-[10px] font-black px-3.5 py-1.5 rounded-lg transition-all cursor-pointer"
                                  >
                                    Hapus Slide
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* --- FAQ MANAGER SECTION --- */}
                      <div className="bg-zinc-50 border border-zinc-150 p-5 rounded-3xl space-y-4">
                        <div className="flex justify-between items-center pb-2 border-b border-zinc-250">
                          <div>
                            <h4 className="font-display font-black text-sm text-brand-charcoal flex items-center gap-1.5">
                              <HelpCircle className="w-4 h-4 text-primary-orange" />
                              Kelola Pertanyaan Sering Diajukan (FAQ)
                            </h4>
                            <p className="text-[10px] text-zinc-500 font-medium">
                              Tambah, kustom atau edit daftar tanya-jawab penjelas yang tampil di halaman depan.
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleOpenFaqForm()}
                            className="bg-primary-orange text-white hover:bg-primary-orange-dark font-extrabold text-[10px] py-1.5 px-3 rounded-lg shadow-xs transition-colors flex items-center gap-1 cursor-pointer"
                          >
                            + Tambah FAQ Baru
                          </button>
                        </div>

                        {dbFaqs.length === 0 ? (
                          <div className="text-center py-6 bg-white border border-zinc-150 rounded-2xl">
                            <p className="text-xs text-zinc-500 font-semibold mb-1">Daftar FAQ Kosong</p>
                            <p className="text-[10px] text-zinc-400 font-normal">Tidak ada pertanyaan terdaftar. Klik "+ Tambah FAQ Baru" untuk mulai membuat.</p>
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                            {dbFaqs.map((faq) => (
                              <div key={faq.id} className="bg-white border border-zinc-150 p-3.5 rounded-2xl flex flex-col justify-between gap-3 shadow-xs">
                                <div className="space-y-1">
                                  <h5 className="font-sans font-bold text-xs text-brand-charcoal leading-snug">Q: {faq.question}</h5>
                                  <p className="text-[10px] text-zinc-600 font-normal leading-relaxed">A: {faq.answer}</p>
                                </div>
                                <div className="flex justify-end gap-1.5 pt-1.5 border-t border-dashed border-zinc-100">
                                  <button
                                    type="button"
                                    onClick={() => handleOpenFaqForm(faq)}
                                    className="text-zinc-600 hover:text-primary-orange text-[10px] font-bold px-2 py-1 rounded hover:bg-zinc-50 transition-all cursor-pointer"
                                  >
                                    Edit Q&A
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteFaq(faq.id)}
                                    className="text-rose-600 hover:text-rose-800 text-[10px] font-bold px-2 py-1 rounded hover:bg-rose-50 transition-all cursor-pointer"
                                  >
                                    Hapus Q&A
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* --- INFO TAMBAHAN MANAGER SECTION --- */}
                      <div className="bg-zinc-50 border border-zinc-150 p-5 rounded-3xl space-y-4">
                        <div className="flex justify-between items-center pb-2 border-b border-zinc-250">
                          <div>
                            <h4 className="font-display font-black text-sm text-brand-charcoal flex items-center gap-1.5">
                              <Sparkles className="w-4 h-4 text-emerald-600" />
                              Kelola Info Tambahan (Keunggulan & Benefit)
                            </h4>
                            <p className="text-[10px] text-zinc-500 font-medium">
                              Kustomisasi isi 2 kolom "Kenapa Gerai Suki Begitu Lezat" (Quality) dan "Keuntungan Pesan WA" (Benefits).
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleOpenInfoTambahanForm()}
                            className="bg-emerald-600 text-white hover:bg-emerald-700 font-extrabold text-[10px] py-1.5 px-3 rounded-lg shadow-xs transition-colors flex items-center gap-1 cursor-pointer"
                          >
                            + Tambah Info Baru
                          </button>
                        </div>

                        {dbInfoTambahan.length === 0 ? (
                          <div className="text-center py-6 bg-white border border-zinc-150 rounded-2xl">
                            <p className="text-xs text-zinc-500 font-semibold mb-1 font-sans">Daftar Keunggulan/Keuntungan Kosong</p>
                            <p className="text-[10px] text-zinc-400 font-normal">Belum ada data keunggulan atau keuntungan terdaftar. Klik "+ Tambah Info Baru" untuk mulai membuat.</p>
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            {/* Quality list column */}
                            <div className="space-y-2.5">
                              <h5 className="text-[10px] font-black uppercase tracking-wider text-rose-500 flex items-center gap-1">
                                <span>✨</span> Kenapa Suka Yusuki Lezat (Quality)
                              </h5>
                              {dbInfoTambahan.filter(x => x.type === 'quality').length === 0 ? (
                                <p className="text-[10px] text-zinc-400 italic">Belum ada isian kustom kualitas.</p>
                              ) : (
                                dbInfoTambahan.filter(x => x.type === 'quality').map((item) => (
                                  <div key={item.id} className="bg-white border border-zinc-150 p-3 rounded-xl flex items-start justify-between gap-2.5 shadow-xs">
                                    <div className="space-y-0.5">
                                      <h6 className="font-sans font-bold text-xs text-brand-charcoal">{item.title} <span className="text-[9px] text-zinc-400 font-mono">({item.icon})</span></h6>
                                      <p className="text-[10px] text-zinc-500 font-normal leading-relaxed">{item.desc}</p>
                                    </div>
                                    <div className="flex flex-col gap-1 items-end flex-shrink-0">
                                      <button
                                        type="button"
                                        onClick={() => handleOpenInfoTambahanForm(item)}
                                        className="text-zinc-650 hover:text-primary-orange text-[9px] font-bold cursor-pointer"
                                      >
                                        Edit
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => handleDeleteInfoTambahan(item.id)}
                                        className="text-rose-650 hover:text-rose-800 text-[9px] font-bold cursor-pointer"
                                      >
                                        Hapus
                                      </button>
                                    </div>
                                  </div>
                                ))
                              )}
                            </div>

                            {/* Benefit list column */}
                            <div className="space-y-2.5">
                              <h5 className="text-[10px] font-black uppercase tracking-wider text-emerald-650 flex items-center gap-1">
                                <span>🎯</span> Keuntungan Pesan via WA (Benefits)
                              </h5>
                              {dbInfoTambahan.filter(x => x.type === 'benefit').length === 0 ? (
                                <p className="text-[10px] text-zinc-400 italic">Belum ada isian kustom benefit.</p>
                              ) : (
                                dbInfoTambahan.filter(x => x.type === 'benefit').map((item) => (
                                  <div key={item.id} className="bg-white border border-zinc-150 p-3 rounded-xl flex items-start justify-between gap-2.5 shadow-xs">
                                    <div className="space-y-0.5">
                                      <h6 className="font-sans font-bold text-xs text-brand-charcoal">{item.title} <span className="text-[9px] text-zinc-400 font-mono">({item.icon})</span></h6>
                                      <p className="text-[10px] text-zinc-500 font-normal leading-relaxed">{item.desc}</p>
                                    </div>
                                    <div className="flex flex-col gap-1 items-end flex-shrink-0">
                                      <button
                                        type="button"
                                        onClick={() => handleOpenInfoTambahanForm(item)}
                                        className="text-zinc-650 hover:text-primary-orange text-[9px] font-bold cursor-pointer"
                                      >
                                        Edit
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => handleDeleteInfoTambahan(item.id)}
                                        className="text-rose-650 hover:text-rose-800 text-[9px] font-bold cursor-pointer"
                                      >
                                        Hapus
                                      </button>
                                    </div>
                                  </div>
                                ))
                              )}
                            </div>
                          </div>
                        )}
                      </div>

                    {/* Settings subtabs content removed */}
                  </div>
                )}
              </div>
            </div>
          )}
        </motion.div>
      </div>

      {/* --- POPUP DIALOG FORM SUB-MODAL FOR CREATE / EDIT ITEM --- */}
      <AnimatePresence>
        {isFormOpen && (
          <div className="fixed inset-0 z-55 flex items-center justify-center p-3 overflow-y-auto">
            {/* Dark glass backdrop modal */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-brand-charcoal/85 backdrop-blur-xs"
              onClick={() => setIsFormOpen(false)}
            />

            {/* Form box content wrapper */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 30 }}
              className="relative bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-zinc-100 overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="bg-brand-charcoal px-5.5 py-4 text-white flex items-center justify-between border-b border-zinc-800">
                <h4 className="font-display font-black text-sm uppercase tracking-wider text-rose-500">
                  {editingItem ? 'Edit Dimsum Item' : 'Tambah Menu Baru'}
                </h4>
                <button
                  onClick={() => setIsFormOpen(false)}
                  className="p-1 text-zinc-400 hover:text-white transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Form document body */}
              <form onSubmit={handleFormSubmit} className="flex-grow overflow-y-auto p-5.5 space-y-4">
                {/* Product Name */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-brand-charcoal block">
                    Nama Menu / Rasa Dimsum <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={80}
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="Contoh: Dimsum Mentai Special Cheese"
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3.5 py-2.5 text-xs text-brand-charcoal focus:outline-none focus:border-primary-orange transition-colors"
                  />
                </div>

                {/* Price & Category Grid */}
                <div className="grid grid-cols-2 gap-3.5">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-brand-charcoal block">
                      Harga Satuan (Rp) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      required
                      min={100}
                      value={formPrice}
                      onChange={(e) => setFormPrice(Number(e.target.value))}
                      placeholder="Contoh: 15000"
                      className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3.5 py-2.5 text-xs text-brand-charcoal focus:outline-none focus:border-primary-orange transition-colors"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-brand-charcoal block">
                      Jumlah Isi / Pieces (Optional)
                    </label>
                    <input
                      type="number"
                      min={1}
                      value={formPieces}
                      onChange={(e) => setFormPieces(e.target.value === '' ? '' : Number(e.target.value))}
                      placeholder="Contoh: 4"
                      className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3.5 py-2.5 text-xs text-brand-charcoal focus:outline-none focus:border-primary-orange transition-colors"
                    />
                  </div>
                </div>

                {/* Category dropdown */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-brand-charcoal block">
                    Kategori Menu <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value as MenuCategory)}
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2.5 text-xs text-brand-charcoal focus:outline-none focus:border-primary-orange transition-colors cursor-pointer font-bold"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Description */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-brand-charcoal block">
                    Deskripsi / Keterangan Citarasa
                  </label>
                  <textarea
                    rows={2.5}
                    maxLength={800}
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                    placeholder="Sajikan rincian citarasa, topping lumer, taburan, dll..."
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3.5 py-2.5 text-xs text-brand-charcoal focus:outline-none focus:border-primary-orange transition-colors resize-none mb-0.5"
                  />
                </div>

                {/* Tags */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-brand-charcoal block">
                    Tags (Pisahkan dengan koma)
                  </label>
                  <input
                    type="text"
                    value={formTags}
                    onChange={(e) => setFormTags(e.target.value)}
                    placeholder="Contoh: Terlaris, Pedas, Juicy"
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3.5 py-2.5 text-xs text-brand-charcoal focus:outline-none focus:border-primary-orange transition-colors"
                  />
                </div>

                {/* Image Selection Block */}
                <div className="space-y-3 border-t border-zinc-100 pt-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-brand-charcoal block">
                      Foto Menu <span className="text-red-500">*</span>
                    </label>
                    <span className="text-[10px] text-zinc-400 font-semibold uppercase font-sans">Pilih Metode</span>
                  </div>

                  {/* Drag and Drop Zone / Select from Gallery */}
                  <div
                    onDragOver={(e) => {
                      e.preventDefault();
                      setIsDragging(true);
                    }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={(e) => {
                      e.preventDefault();
                      setIsDragging(false);
                      const file = e.dataTransfer.files?.[0];
                      if (file) compressAndSetImage(file);
                    }}
                    className={`relative border-2 border-dashed rounded-xl p-4 text-center transition-all flex flex-col items-center justify-center gap-2 cursor-pointer ${
                      isDragging
                        ? 'border-primary-orange bg-primary-orange/5'
                        : formImage && formImage.startsWith('data:image/')
                        ? 'border-emerald-500 bg-emerald-50/20'
                        : 'border-zinc-200 hover:border-primary-orange/50 bg-zinc-50/50'
                    }`}
                    onClick={() => document.getElementById('file-upload-input')?.click()}
                  >
                    <input
                      id="file-upload-input"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) compressAndSetImage(file);
                      }}
                    />

                    {isUploading ? (
                      <div className="flex flex-col items-center gap-1.5 py-2">
                        <div className="w-5 h-5 border-2 border-primary-orange border-t-transparent rounded-full animate-spin" />
                        <span className="text-[10px] font-bold text-zinc-500">Memproses & mengkompresi gambar...</span>
                      </div>
                    ) : formImage && formImage.startsWith('data:image/') ? (
                      <div className="flex flex-col items-center gap-1.5 w-full">
                        <div className="w-14 h-14 rounded-lg overflow-hidden border border-emerald-200 shadow-3xs relative bg-white">
                          <img src={formImage} className="w-full h-full object-cover" alt="Unggahan Kustom" />
                        </div>
                        <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-1">
                          ✓ Foto Berhasil Diunggah dari Galeri
                        </span>
                        <span className="text-[8.5px] text-zinc-400">Klik / Seret file lain untuk mengganti</span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-1.5 py-1">
                        <div className="w-9 h-9 rounded-full bg-primary-orange/10 flex items-center justify-center text-primary-orange">
                          <UploadCloud className="w-4.5 h-4.5 animate-pulse" />
                        </div>
                        <div className="space-y-0.5">
                          <p className="text-[11px] font-bold text-brand-charcoal">
                            Seret & Lepas foto di sini, atau <span className="text-primary-orange underline">Pilih dari Galeri</span>
                          </p>
                          <p className="text-[9px] text-zinc-400">Dimsum, Ramen, Sushi dll (PNG, JPG, WEBP)</p>
                        </div>
                      </div>
                    )}

                    {uploadError && (
                      <div className="text-[9px] font-bold text-red-500 bg-red-55 px-2.5 py-1 rounded-lg mt-1 w-full text-center">
                        ⚠️ {uploadError}
                      </div>
                    )}
                  </div>

                  {/* Presets Alternative */}
                  <div className="space-y-2 bg-zinc-50 rounded-xl border border-zinc-200/50 p-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[9.5px] font-extrabold text-brand-charcoal uppercase tracking-wider">
                        Atau Gunakan Preset Foto
                      </span>
                      {formImage && !formImage.startsWith('data:image/') && (
                        <span className="text-[8.5px] text-primary-orange font-extrabold flex items-center gap-0.5">
                          ● Preset Aktif
                        </span>
                      )}
                    </div>

                    <div className="space-y-1">
                      <span className="text-[8.5px] font-bold text-zinc-400 uppercase tracking-wide block">Preset Foto Khas Yusuki</span>
                      <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
                        {uniquePresets.map((pr, idx) => {
                          const isSelected = formImage === pr.image;
                          return (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => {
                                setFormImage(pr.image);
                                setUploadError(null);
                              }}
                              className={`relative w-10 h-10 rounded-lg overflow-hidden border flex-shrink-0 bg-white shadow-3xs focus:outline-none cursor-pointer transition-all ${
                                isSelected
                                  ? 'border-primary-orange ring-1.5 ring-primary-orange/50 scale-95'
                                  : 'border-zinc-200 hover:border-zinc-300'
                              }`}
                            >
                              <img
                                src={pr.image}
                                alt={pr.name}
                                className="w-full h-full object-cover"
                                referrerPolicy="no-referrer"
                              />
                              {isSelected && (
                                <div className="absolute inset-0 bg-primary-orange/20 flex items-center justify-center">
                                  <Check className="w-3.5 h-3.5 text-white stroke-[3px]" />
                                </div>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Product Availability Toggle Checkbox */}
                <div className="flex items-start gap-3 py-2.5 px-3 bg-zinc-50 border border-zinc-200/50 rounded-xl">
                  <input
                    type="checkbox"
                    id="isavailable"
                    checked={formIsAvailable}
                    onChange={(e) => setFormIsAvailable(e.target.checked)}
                    className="w-4.5 h-4.5 text-emerald-500 border-zinc-300 rounded focus:ring-emerald-500/50 mt-0.5 cursor-pointer accent-emerald-600"
                  />
                  <div className="flex flex-col space-y-0.5">
                    <label htmlFor="isavailable" className="text-xs font-bold text-brand-charcoal cursor-pointer select-none flex items-center gap-1.5 flex-wrap">
                      <span>Menu Tersedia (Ready Stock)</span>
                      {formIsAvailable ? (
                        <span className="bg-emerald-100 text-emerald-800 text-[8px] px-1.5 py-0.2 rounded font-mono font-bold uppercase tracking-wider">Tersedia</span>
                      ) : (
                        <span className="bg-red-100 text-red-805 text-[8px] px-1.5 py-0.2 rounded font-mono font-bold uppercase tracking-wider">Habis / Kosong</span>
                      )}
                    </label>
                    <span className="text-[9.5px] text-zinc-400 font-medium leading-normal">
                      Jika dinonaktifkan, menu akan otomatis berwarna abu-abu (grayscale/habis) di katalog dan tidak dapat dimasukkan ke keranjang belanja pelanggan.
                    </span>
                  </div>
                </div>

                {/* Best Seller Checkbox toggling */}
                <div className="flex items-center gap-2.5 py-1">
                  <input
                    type="checkbox"
                    id="isbest"
                    checked={formIsBestSeller}
                    onChange={(e) => setFormIsBestSeller(e.target.checked)}
                    className="w-4.5 h-4.5 text-primary-orange border-zinc-300 rounded focus:ring-primary-orange/50 cursor-pointer"
                  />
                  <label htmlFor="isbest" className="text-xs font-bold text-brand-charcoal cursor-pointer select-none">
                    Tampilkan di Highlight "Best Seller" di Halaman Depan
                  </label>
                </div>

                {/* Footer Controls within Form Modal */}
                <div className="border-t border-zinc-150 pt-4 flex gap-2">
                  <button
                    type="button"
                    onClick={() => setIsFormOpen(false)}
                    className="flex-grow bg-zinc-50 hover:bg-zinc-100 border border-zinc-200 text-zinc-700 font-bold text-xs py-3 rounded-xl cursor-pointer transition-colors"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="flex-grow bg-primary-orange hover:bg-primary-orange-dark text-white font-extrabold text-xs py-3 rounded-xl shadow-md cursor-pointer transition-colors flex items-center justify-center gap-1.5"
                  >
                    <Save className="w-4 h-4" />
                    Simpan Menu
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}

        {/* --- POPUP DIALOG FORM SUB-MODAL FOR CREATE / EDIT FAQ --- */}
        {isFaqFormOpen && (
          <div className="fixed inset-0 z-55 flex items-center justify-center p-3 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-brand-charcoal/85 backdrop-blur-xs"
              onClick={() => setIsFaqFormOpen(false)}
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 30 }}
              className="relative bg-white w-full max-w-md rounded-3xl shadow-2xl border border-zinc-100 overflow-hidden flex flex-col max-h-[90vh] z-10"
            >
              <div className="bg-brand-charcoal px-5.5 py-4 text-white flex items-center justify-between border-b border-zinc-800">
                <h4 className="font-display font-black text-sm uppercase tracking-wider text-primary-orange">
                  {selectedFaq ? 'Edit Pertanyaan FAQ' : 'Tambah FAQ Baru'}
                </h4>
                <button
                  type="button"
                  onClick={() => setIsFaqFormOpen(false)}
                  className="p-1 text-zinc-400 hover:text-white transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSaveFaqForm} className="flex-grow flex flex-col overflow-hidden">
                <div className="p-5.5 space-y-4 overflow-y-auto max-h-[60vh]">
                  <div>
                    <label className="text-xs font-bold text-brand-charcoal block mb-1">Pertanyaan (Question)</label>
                    <input
                      type="text"
                      className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3.5 py-2.5 text-xs text-brand-charcoal focus:outline-none focus:ring-1 focus:ring-primary-orange focus:border-primary-orange font-semibold"
                      placeholder="Contoh: Apakah bisa kirim ke luar kota?"
                      value={faqQuestion}
                      onChange={(e) => setFaqQuestion(e.target.value)}
                      required
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-brand-charcoal block mb-1">Jawaban (Answer)</label>
                    <textarea
                      rows={4}
                      className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3.5 py-2.5 text-xs text-brand-charcoal focus:outline-none focus:ring-1 focus:ring-primary-orange focus:border-primary-orange font-normal"
                      placeholder="Contoh: Bisa kak, kami melayani kiriman frozen pack..."
                      value={faqAnswer}
                      onChange={(e) => setFaqAnswer(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="p-4 bg-zinc-50 border-t border-zinc-150 flex gap-3">
                  <button
                    type="button"
                    onClick={() => setIsFaqFormOpen(false)}
                    className="flex-1 border border-zinc-250 hover:bg-zinc-100 text-brand-charcoal font-bold text-xs py-3 rounded-xl cursor-pointer transition-colors"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="flex-grow bg-primary-orange hover:bg-primary-orange-dark text-white font-extrabold text-xs py-3 rounded-xl shadow-md cursor-pointer transition-colors flex items-center justify-center gap-1.5"
                  >
                    <Save className="w-4 h-4" />
                    Simpan FAQ
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}

        {/* --- POPUP DIALOG FORM SUB-MODAL FOR CREATE / EDIT ABOUT SLIDES --- */}
        {isAboutSlideFormOpen && (
          <div className="fixed inset-0 z-55 flex items-center justify-center p-3 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-brand-charcoal/85 backdrop-blur-xs"
              onClick={() => setIsAboutSlideFormOpen(false)}
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 30 }}
              className="relative bg-white w-full max-w-xl rounded-3xl shadow-2xl border border-zinc-100 overflow-hidden flex flex-col max-h-[90vh] z-10"
            >
              <div className="bg-brand-charcoal px-5.5 py-4 text-white flex items-center justify-between border-b border-zinc-800">
                <h4 className="font-display font-black text-sm uppercase tracking-wider text-primary-orange flex items-center gap-2">
                  <BookOpen className="w-4 h-4" />
                  {selectedAboutSlide ? 'Edit Slide Tentang Kami' : 'Tambah Slide Baru'}
                </h4>
                <button
                  type="button"
                  onClick={() => setIsAboutSlideFormOpen(false)}
                  className="p-1 text-zinc-400 hover:text-white transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSaveAboutSlideForm} className="flex-grow flex flex-col overflow-hidden">
                <div className="p-5.5 space-y-4 overflow-y-auto max-h-[60vh] scrollbar-thin">
                  
                  {/* Row 1: Subtitle & Title */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold text-brand-charcoal block mb-1">Subtitle / Label Kategori</label>
                      <input
                        type="text"
                        className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3.5 py-2.5 text-xs text-brand-charcoal focus:outline-none focus:ring-1 focus:ring-primary-orange focus:border-primary-orange font-semibold"
                        placeholder="Contoh: Kisah Perjalanan / Profil Owner"
                        value={aboutSlideSubtitle}
                        onChange={(e) => setAboutSlideSubtitle(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-brand-charcoal block mb-1">Judul Utama Slide</label>
                      <input
                        type="text"
                        required
                        className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3.5 py-2.5 text-xs text-brand-charcoal focus:outline-none focus:ring-1 focus:ring-primary-orange focus:border-primary-orange font-semibold"
                        placeholder="Contoh: Perjalanan Suki Yusuki"
                        value={aboutSlideTitle}
                        onChange={(e) => setAboutSlideTitle(e.target.value)}
                      />
                    </div>
                  </div>

                  {/* Row 2: Paragraphs Textarea */}
                  <div>
                    <label className="text-xs font-bold text-brand-charcoal block mb-1">Narasi Cerita (Paragraf)</label>
                    <textarea
                      required
                      rows={5}
                      className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3.5 py-2.5 text-xs text-brand-charcoal focus:outline-none focus:ring-1 focus:ring-primary-orange focus:border-primary-orange font-medium"
                      placeholder="Tuliskan isi cerita di sini. Tekan Enter dua kali (baris kosong) untuk membuat paragraf baru agar tampil rapi."
                      value={aboutSlideParagraphs}
                      onChange={(e) => setAboutSlideParagraphs(e.target.value)}
                    />
                  </div>

                  {/* Row 3: Image Drag and Drop */}
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="text-xs font-bold text-brand-charcoal block">Foto Slide</label>
                      {aboutSlideImage && (
                        <button
                          type="button"
                          onClick={() => setAboutSlideImage('')}
                          className="text-[10px] text-red-500 hover:text-red-700 font-bold"
                        >
                          Hapus Foto
                        </button>
                      )}
                    </div>

                    <div
                      onDragOver={(e) => { e.preventDefault(); setIsDraggingAboutSlideImage(true); }}
                      onDragLeave={() => setIsDraggingAboutSlideImage(false)}
                      onDrop={handleAboutSlideDrop}
                      onClick={() => document.getElementById('slide-image-file-input')?.click()}
                      className={`relative w-full h-36 rounded-2xl border-2 border-dashed transition-all duration-200 flex flex-col items-center justify-center cursor-pointer p-4 overflow-hidden group select-none ${
                        isDraggingAboutSlideImage
                          ? 'border-primary-orange bg-orange-50/40'
                          : 'border-zinc-300 hover:border-primary-orange hover:bg-zinc-50'
                      }`}
                    >
                      <input
                        id="slide-image-file-input"
                        type="file"
                        accept="image/*"
                        onChange={handleAboutSlideFileChange}
                        className="hidden"
                      />

                      {isProcessingAboutSlideImage ? (
                        <div className="flex flex-col items-center gap-2 text-center text-zinc-500 animate-pulse">
                          <RotateCcw className="w-8 h-8 animate-spin text-primary-orange" />
                          <span className="text-xs font-semibold">Mengkompresi gambar...</span>
                        </div>
                      ) : aboutSlideImage ? (
                        <>
                          <img
                            src={aboutSlideImage}
                            alt="Pratinjau Slide"
                            className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 rounded-2xl"
                            onError={(e) => { (e.target as HTMLImageElement).src = 'https://placehold.co/400x300?text=Error'; }}
                          />
                          <div className="absolute inset-0 bg-black/45 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col items-center justify-center text-white gap-1 p-2 text-center">
                            <UploadCloud className="w-5 h-5 text-white" />
                            <span className="text-[11px] font-bold">Seret atau Klik untuk Ganti Foto</span>
                          </div>
                        </>
                      ) : (
                        <div className="text-center text-zinc-400 p-2 pointer-events-none">
                          <UploadCloud className="w-8 h-8 mx-auto text-zinc-350 mb-1" />
                          <span className="text-xs font-bold text-zinc-600 block">Tarik & lepas foto slide ke sini</span>
                          <span className="text-[10px] text-zinc-400 block font-medium">atau klik untuk menelusuri galeri</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Bullet points (Optional) */}
                  <div className="border-t border-zinc-100 pt-3">
                    <span className="text-[10px] font-black uppercase tracking-wider text-rose-500 block mb-2">🎁 POIN KEUNGGUNALAN TAMBAHAN (OPSIONAL)</span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Bullet 1 */}
                      <div className="space-y-2 bg-zinc-50 p-3 rounded-xl border border-zinc-200/60">
                        <div>
                          <label className="text-[10px] font-bold text-zinc-500 block mb-0.5">Judul Poin 1</label>
                          <input
                            type="text"
                            className="w-full bg-white border border-zinc-200 rounded-lg px-2 py-1.5 text-xs text-brand-charcoal focus:outline-none focus:ring-1 focus:ring-primary-orange focus:border-primary-orange"
                            placeholder="Contoh: Sejak 2020"
                            value={aboutSlideBullet1Title}
                            onChange={(e) => setAboutSlideBullet1Title(e.target.value)}
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-zinc-500 block mb-0.5">Penjelasan Poin 1</label>
                          <input
                            type="text"
                            className="w-full bg-white border border-zinc-200 rounded-lg px-2 py-1.5 text-xs text-brand-charcoal focus:outline-none focus:ring-1 focus:ring-primary-orange focus:border-primary-orange"
                            placeholder="Contoh: Mulai berkembang pesat"
                            value={aboutSlideBullet1Desc}
                            onChange={(e) => setAboutSlideBullet1Desc(e.target.value)}
                          />
                        </div>
                      </div>

                      {/* Bullet 2 */}
                      <div className="space-y-2 bg-zinc-50 p-3 rounded-xl border border-zinc-200/60">
                        <div>
                          <label className="text-[10px] font-bold text-zinc-500 block mb-0.5">Judul Poin 2</label>
                          <input
                            type="text"
                            className="w-full bg-white border border-zinc-200 rounded-lg px-2 py-1.5 text-xs text-brand-charcoal focus:outline-none focus:ring-1 focus:ring-primary-orange focus:border-primary-orange"
                            placeholder="Contoh: 10,000+ Pelanggan"
                            value={aboutSlideBullet2Title}
                            onChange={(e) => setAboutSlideBullet2Title(e.target.value)}
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-zinc-500 block mb-0.5">Penjelasan Poin 2</label>
                          <input
                            type="text"
                            className="w-full bg-white border border-zinc-200 rounded-lg px-2 py-1.5 text-xs text-brand-charcoal focus:outline-none focus:ring-1 focus:ring-primary-orange focus:border-primary-orange"
                            placeholder="Contoh: Menikmati kelezatan dimsum mentai"
                            value={aboutSlideBullet2Desc}
                            onChange={(e) => setAboutSlideBullet2Desc(e.target.value)}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                </div>

                <div className="p-4 bg-zinc-50 border-t border-zinc-150 flex gap-3">
                  <button
                    type="button"
                    onClick={() => setIsAboutSlideFormOpen(false)}
                    className="flex-1 border border-zinc-250 hover:bg-zinc-100 text-brand-charcoal font-bold text-xs py-3 rounded-xl cursor-pointer transition-colors"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="flex-grow bg-primary-orange hover:bg-primary-orange-dark text-white font-extrabold text-xs py-3 rounded-xl shadow-md cursor-pointer transition-colors flex items-center justify-center gap-1.5"
                  >
                    <Save className="w-4 h-4" />
                    Simpan Slide Cerita
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}

        {/* --- POPUP DIALOG FORM SUB-MODAL FOR CREATE / EDIT INFO TAMBAHAN --- */}
        {isInfoTambahanFormOpen && (
          <div className="fixed inset-0 z-55 flex items-center justify-center p-3 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-brand-charcoal/85 backdrop-blur-xs"
              onClick={() => setIsInfoTambahanFormOpen(false)}
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 30 }}
              className="relative bg-white w-full max-w-md rounded-3xl shadow-2xl border border-zinc-100 overflow-hidden flex flex-col max-h-[90vh] z-10"
            >
              <div className="bg-brand-charcoal px-5.5 py-4 text-white flex items-center justify-between border-b border-zinc-800">
                <h4 className="font-display font-black text-sm uppercase tracking-wider text-emerald-400">
                  {selectedInfoTambahan ? 'Edit Info Tambahan' : 'Tambah Info Tambahan'}
                </h4>
                <button
                  type="button"
                  onClick={() => setIsInfoTambahanFormOpen(false)}
                  className="p-1 text-zinc-400 hover:text-white transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSaveInfoTambahanForm} className="flex-grow flex flex-col overflow-hidden">
                <div className="p-5.5 space-y-4 overflow-y-auto max-h-[60vh]">
                  <div>
                    <label className="text-xs font-bold text-brand-charcoal block mb-1">Tipe Informasi</label>
                    <select
                      className="w-full bg-zinc-50 border border-zinc-250 rounded-xl px-3.5 py-2.5 text-xs text-brand-charcoal focus:outline-none focus:ring-1 focus:ring-primary-orange focus:border-primary-orange font-semibold cursor-pointer"
                      value={infoTambahanType}
                      onChange={(e) => setInfoTambahanType(e.target.value as 'quality' | 'benefit')}
                    >
                      <option value="quality">✨ Kenapa Suka Yusuki Lezat (Quality)</option>
                      <option value="benefit">🎯 Keuntungan Pesan via WA (Benefits)</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-brand-charcoal block mb-1">Judul / Title</label>
                    <input
                      type="text"
                      className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3.5 py-2.5 text-xs text-brand-charcoal focus:outline-none focus:ring-1 focus:ring-primary-orange focus:border-primary-orange font-semibold"
                      placeholder="Contoh: Fresh Setiap Hari"
                      value={infoTambahanTitle}
                      onChange={(e) => setInfoTambahanTitle(e.target.value)}
                      required
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-brand-charcoal block mb-1 font-sans">Ikon / Icon Ilustrasi</label>
                    <select
                      className="w-full bg-zinc-50 border border-zinc-250 rounded-xl px-3.5 py-2.5 text-xs text-brand-charcoal focus:outline-none focus:ring-1 focus:ring-primary-orange focus:border-primary-orange font-semibold cursor-pointer"
                      value={infoTambahanIcon}
                      onChange={(e) => setInfoTambahanIcon(e.target.value)}
                    >
                      <option value="Sparkles">Sparkles (Kilauan)</option>
                      <option value="Clock">Clock (Waktu / Jam / Fresh)</option>
                      <option value="HeartHandshake">HeartHandshake (Homemade / Mitra)</option>
                      <option value="Award">Award (Penghargaan / Premium)</option>
                      <option value="ShieldCheck">ShieldCheck (Halal / Aman)</option>
                      <option value="PackageOpen">PackageOpen (Kemasan / Unboxing)</option>
                      <option value="PiggyBank">PiggyBank (Harga Hemat/Murah)</option>
                      <option value="Receipt">Receipt (Tanpa Potongan Aplikasi)</option>
                      <option value="Settings2">Settings2 (Bisa Custom / Fleksibel)</option>
                      <option value="Heart">Heart (Suka / Cinta)</option>
                      <option value="MessageCircle">MessageCircle (Chat / WhatsApp)</option>
                      <option value="HelpCircle">HelpCircle (Tanya Jawab)</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-brand-charcoal block mb-1">Deskripsi / Detail Keterangan</label>
                    <textarea
                      rows={3}
                      className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3.5 py-2.5 text-xs text-brand-charcoal focus:outline-none focus:ring-1 focus:ring-primary-orange focus:border-primary-orange font-normal"
                      placeholder="Contoh: Dimsum dikukus hangat seketika saat order tiba demi kesegaran."
                      value={infoTambahanDesc}
                      onChange={(e) => setInfoTambahanDesc(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="p-4 bg-zinc-50 border-t border-zinc-150 flex gap-3">
                  <button
                    type="button"
                    onClick={() => setIsInfoTambahanFormOpen(false)}
                    className="flex-1 border border-zinc-250 hover:bg-zinc-100 text-brand-charcoal font-bold text-xs py-3 rounded-xl cursor-pointer transition-colors"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="flex-grow bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs py-3 rounded-xl shadow-md cursor-pointer transition-colors flex items-center justify-center gap-1.5"
                  >
                    <Save className="w-4 h-4" />
                    Simpan Info
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}

        {/* Custom Confirmation Dialog */}
        <AnimatePresence>
          {confirmModal.isOpen && (
            <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setConfirmModal((prev) => ({ ...prev, isOpen: false }))}
                className="absolute inset-0 bg-brand-charcoal/70 backdrop-blur-xs"
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="relative bg-white w-full max-w-sm rounded-2xl shadow-xl overflow-hidden border border-zinc-150 p-5 space-y-4 z-10"
              >
                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 rounded-full border flex items-center justify-center shrink-0 ${
                    confirmModal.confirmStyle === 'danger'
                      ? 'bg-red-50 border-red-100 text-red-650'
                      : 'bg-primary-orange/10 border-primary-orange/20 text-primary-orange'
                  }`}>
                    <AlertTriangle className="w-5 h-5" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-display font-black text-xs uppercase tracking-wider text-brand-charcoal">
                      {confirmModal.title}
                    </h4>
                    <p className="text-[10.5px] text-zinc-500 font-bold leading-normal">
                      {confirmModal.message}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2 justify-end text-[10px] font-bold">
                  <button
                    type="button"
                    onClick={() => setConfirmModal((prev) => ({ ...prev, isOpen: false }))}
                    className="px-4 py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-650 rounded-lg cursor-pointer transition-colors"
                  >
                    Batal
                  </button>
                  <button
                    type="button"
                    onClick={confirmModal.onConfirm}
                    className={`px-4 py-2 text-white rounded-lg cursor-pointer shadow-xs transition-colors font-black uppercase tracking-wider ${
                      confirmModal.confirmStyle === 'danger'
                        ? 'bg-red-600 hover:bg-red-700'
                        : 'bg-primary-orange hover:bg-primary-orange-dark'
                    }`}
                  >
                    {confirmModal.confirmText}
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </AnimatePresence>
    </AnimatePresence>
  );
}
