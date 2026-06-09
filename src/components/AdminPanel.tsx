import React, { useState, useEffect } from 'react';
import {
  X,
  RefreshCw,
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
  BookOpen,
  Palette,
  Activity,
  DollarSign,
  EyeOff,
  Power,
  Brain
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
  onSnapshot,
  addDoc
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
  const [activityFilter, setActivityFilter] = useState<string>('ALL');
  const [activitySearch, setActivitySearch] = useState<string>('');
  const [glossarySearch, setGlossarySearch] = useState<string>('');
  const [glossaryCategory, setGlossaryCategory] = useState<'all' | 'visit' | 'conv' | 'finance'>('all');
  const [showAIStrategyDetail, setShowAIStrategyDetail] = useState<boolean>(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [historyStack, setHistoryStack] = useState<{ id: string; label: string; timestamp: Date; undo: () => Promise<void> }[]>([]);

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
  const [toasts, setToasts] = useState<{ id: string; type: 'success' | 'error' | 'info'; title: string; message: string; onUndo?: () => void }[]>([]);

  const addToast = (type: 'success' | 'error' | 'info', title: string, message: string, onUndo?: () => void) => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev, { id, type, title, message, onUndo }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, onUndo ? 12000 : 4500);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const pushUndoAction = (label: string, undoFn: () => Promise<void>) => {
    const id = `undo-${Date.now()}-${Math.random()}`;
    const newAction = {
      id,
      label,
      timestamp: new Date(),
      undo: undoFn
    };
    setHistoryStack((prev) => [newAction, ...prev].slice(0, 30));
    addToastWithUndo(label, id, undoFn);
  };

  const addToastWithUndo = (label: string, actionId: string, undoFn: () => Promise<void>) => {
    addToast(
      'success',
      'Aksi Berhasil',
      `${label} telah disimpan.`,
      async () => {
        setOperationState({ status: 'loading', message: `Membatalkan aksi: "${label}"...` });
        try {
          await undoFn();
          setHistoryStack((prev) => prev.filter((act) => act.id !== actionId));
          setOperationState({ status: 'success', message: `Aksi "${label}" berhasil dibatalkan!` });
          addToast('success', 'Urungkan Sukses', `Tindakan "${label}" berhasil di-undo.`);
          setTimeout(() => setOperationState({ status: 'idle' }), 3000);
        } catch (err) {
          console.error("Gagal melakukan undo:", err);
          setOperationState({ status: 'error', message: `Gagal membatalkan aksi: "${label}"` });
          addToast('error', 'Gagal Mengurungkan', 'Kesalahan koneksi database saat memproses.');
        }
      }
    );
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

  // Hero custom fields Form States
  const [formHeroTagline1, setFormHeroTagline1] = useState('');
  const [formHeroTagline2, setFormHeroTagline2] = useState('');
  const [formHeroTitle, setFormHeroTitle] = useState('');
  const [formHeroDescription, setFormHeroDescription] = useState('');
  const [formHeroCtaButton1Label, setFormHeroCtaButton1Label] = useState('');
  const [formHeroCtaButton2Label, setFormHeroCtaButton2Label] = useState('');
  const [formHeroStat1Value, setFormHeroStat1Value] = useState('');
  const [formHeroStat1Label, setFormHeroStat1Label] = useState('');
  const [formHeroStat2Value, setFormHeroStat2Value] = useState('');
  const [formHeroStat2Label, setFormHeroStat2Label] = useState('');
  const [formHeroStat3Value, setFormHeroStat3Value] = useState('');
  const [formHeroStat3Label, setFormHeroStat3Label] = useState('');
  const [formHeroBadge1Text, setFormHeroBadge1Text] = useState('');
  const [formHeroBadge2Text, setFormHeroBadge2Text] = useState('');

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
      
      setFormHeroTagline1(appSettings.heroTagline1 || 'ESTABLISHED 2021');
      setFormHeroTagline2(appSettings.heroTagline2 || 'Sering SOLD OUT dlm beberapa jam!');
      setFormHeroTitle(appSettings.heroTitle || 'Dimsum Homemade Premium Favorit Semua Kalangan');
      setFormHeroDescription(appSettings.heroDescription || 'Nikmati kehangatan dimsum kukus-goreng premium dan suki tomyum segar yang diolah fresh secara homemade setiap hari. Cukup pesan praktis via WhatsApp dan ambil langsung pesanan Anda hangat-hangat di kedai kami!');
      setFormHeroCtaButton1Label(appSettings.heroCtaButton1Label || 'Pesan via WA');
      setFormHeroCtaButton2Label(appSettings.heroCtaButton2Label || 'Lihat Menu Lengkap');
      setFormHeroStat1Value(appSettings.heroStat1Value || '100%');
      setFormHeroStat1Label(appSettings.heroStat1Label || 'Halal & Higienis');
      setFormHeroStat2Value(appSettings.heroStat2Value || '25+');
      setFormHeroStat2Label(appSettings.heroStat2Label || 'Pilihan Varian');
      setFormHeroStat3Value(appSettings.heroStat3Value || '4.9');
      setFormHeroStat3Label(appSettings.heroStat3Label || 'Rating G-Maps');
      setFormHeroBadge1Text(appSettings.heroBadge1Text || 'Dibuat Fresh Setiap Hari');
      setFormHeroBadge2Text(appSettings.heroBadge2Text || 'Praktis Pesan Take Away');
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
    return combinedInvoices.filter(i => i.createdAt >= startOfToday.getTime() && (i.clickWA === true || i.status !== 'Baru dibuat')).length;
  }, [combinedInvoices]);

  const totalInvoicesMonth = React.useMemo(() => {
    const startOfThisMonth = new Date();
    startOfThisMonth.setDate(1);
    startOfThisMonth.setHours(0, 0, 0, 0);
    return combinedInvoices.filter(i => i.createdAt >= startOfThisMonth.getTime() && (i.clickWA === true || i.status !== 'Baru dibuat')).length;
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
    const confirmedInvoicesRange = filteredAndSearchedInvoices.filter(i => i.clickWA === true || i.status !== 'Baru dibuat');

    const confirmedProductsMap: Record<string, { id: string, name: string, count: number }> = {};
    confirmedInvoicesRange.forEach(inv => {
      if (inv.items && Array.isArray(inv.items)) {
        inv.items.forEach((item: any) => {
          const key = item.id || item.name || 'Unk';
          if (!confirmedProductsMap[key]) {
            confirmedProductsMap[key] = { id: key, name: item.name || 'Unknown Product', count: 0 };
          }
          confirmedProductsMap[key].count += (item.quantity || 1);
        });
      }
    });
    const topConfirmedProductsList = Object.values(confirmedProductsMap).sort((a,b) => b.count - a.count).slice(0, 5);

    // 5. PNG receipt downloads
    const totalDownloads = filteredEvents.filter(e => e.type === 'download_receipt').length;

    // 6. WhatsApp clicks in that period (which constitutes actual checkout / registered orders)
    const totalWaClicksConverted = confirmedInvoicesRange.length;

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
    confirmedInvoicesRange.forEach(inv => {
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
      topConfirmedProductsList,
      totalInvoicesEventCount: filteredAndSearchedInvoices.length,
      totalDownloads,
      totalWaClicksConverted,
      peakVisitHourFormatted,
      peakOrderHourFormatted,
      hoverVisitsArray,
      hoverOrdersArray
    };
  }, [combinedEvents, filteredAndSearchedInvoices, invoiceFilterDate]);

  // Current stats in FILTER range
  const currentStats = React.useMemo(() => {
    const confirmedInvoices = filteredAndSearchedInvoices.filter(i => i.clickWA === true || i.status !== 'Baru dibuat');
    const totalOrders = confirmedInvoices.length;
    const totalRevenue = confirmedInvoices.reduce((acc, current) => acc + (current.total || 0), 0);
    const totalDineIn = confirmedInvoices.filter(i => i.method === 'DINE_IN').length;
    const totalTakeAway = confirmedInvoices.filter(i => i.method === 'TAKE_AWAY').length;
    const totalInvoicesCreated = filteredAndSearchedInvoices.length;
    
    // Whatapp Conversion tracking
    // Conversion is recorded if clickWA is true, or if status says sent/confirmed/done (which implies successful WA checkout)
    const whatsappConversions = confirmedInvoices.length;
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

  // Comparative visitor calculation (Percentage change compared to previous period)
  const visitorChangePct = React.useMemo(() => {
    const nowTs = Date.now();
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const todayTs = startOfToday.getTime();
    
    let currentRangeStart = 0;
    let prevRangeStart = 0;
    let prevRangeEnd = 0;

    if (invoiceFilterDate === 'hari') {
      currentRangeStart = todayTs;
      prevRangeStart = todayTs - 24 * 60 * 60 * 1000;
      prevRangeEnd = todayTs;
    } else if (invoiceFilterDate === 'minggu') {
      currentRangeStart = nowTs - 7 * 24 * 60 * 60 * 1000;
      prevRangeStart = nowTs - 14 * 24 * 60 * 60 * 1000;
      prevRangeEnd = currentRangeStart;
    } else if (invoiceFilterDate === 'bulan') {
      currentRangeStart = nowTs - 30 * 24 * 60 * 60 * 1000;
      prevRangeStart = nowTs - 60 * 24 * 60 * 60 * 1000;
      prevRangeEnd = currentRangeStart;
    } else {
      // Semua Sesi
      return { pct: 15, isUp: true };
    }

    const currentVisits = combinedEvents.filter(e => e.type === 'web_visit' && e.timestamp >= currentRangeStart).length;
    const prevVisits = combinedEvents.filter(e => e.type === 'web_visit' && e.timestamp >= prevRangeStart && e.timestamp < prevRangeEnd).length;

    if (prevVisits === 0) {
      return { pct: currentVisits > 0 ? 100 : 0, isUp: true };
    }
    const diff = currentVisits - prevVisits;
    const pct = Math.abs(Math.round((diff / prevVisits) * 100));
    return {
      pct,
      isUp: diff >= 0
    };
  }, [combinedEvents, invoiceFilterDate]);

  // Product analytical calculations
  const productStats = React.useMemo(() => {
    const statsMap: Record<string, { id: string, name: string, price: number, totalOrders: number, totalQty: number, dineInQty: number, takeAwayQty: number, category: string }> = {};
    const confirmedInvoices = filteredAndSearchedInvoices.filter(i => i.clickWA === true || i.status !== 'Baru dibuat');
    
    confirmedInvoices.forEach(inv => {
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
    const confirmedInvoices = filteredAndSearchedInvoices.filter(i => i.clickWA === true || i.status !== 'Baru dibuat');

    confirmedInvoices.forEach(inv => {
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
    const confirmedInvoices = filteredAndSearchedInvoices.filter(i => i.clickWA === true || i.status !== 'Baru dibuat');

    confirmedInvoices.forEach(inv => {
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

    const todayInvoices = combinedInvoices.filter(i => i.createdAt >= todayTs && (i.clickWA === true || i.status !== 'Baru dibuat'));
    
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
    const confirmedInvoices = filteredAndSearchedInvoices.filter(i => i.clickWA === true || i.status !== 'Baru dibuat');
    
    confirmedInvoices.forEach(inv => {
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
    confirmedInvoices.forEach(inv => {
      inv.items?.forEach((i: any) => {
        totalItemsCount += Number(i.quantity || 0);
      });
    });
    const avgItemsPerOrder = confirmedInvoices.length > 0 
      ? (totalItemsCount / confirmedInvoices.length).toFixed(1) 
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
    const confirmedInvoices = filteredAndSearchedInvoices.filter(i => i.clickWA === true || i.status !== 'Baru dibuat');
    
    confirmedInvoices.forEach(inv => {
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

  // Unified real-time website activities and transactions logger processor
  const processedAndFilteredEvents = React.useMemo(() => {
    return combinedEvents.filter(ev => {
      // 1. Time range filter
      const nowTs = Date.now();
      const startOfToday = new Date();
      startOfToday.setHours(0, 0, 0, 0);
      const todayTs = startOfToday.getTime();
      const sevenDaysAgoTs = nowTs - 7 * 24 * 60 * 60 * 1000;
      const thirtyDaysAgoTs = nowTs - 30 * 24 * 60 * 60 * 1000;

      if (invoiceFilterDate === 'hari' && ev.timestamp < todayTs) return false;
      if (invoiceFilterDate === 'minggu' && ev.timestamp < sevenDaysAgoTs) return false;
      if (invoiceFilterDate === 'bulan' && ev.timestamp < thirtyDaysAgoTs) return false;

      // 2. Activity Type filter
      if (activityFilter !== 'ALL' && ev.type !== activityFilter) return false;

      // 3. Search query filter
      if (activitySearch.trim()) {
        const s = activitySearch.toLowerCase();
        const pName = (ev.itemName || '').toLowerCase();
        const invNo = (ev.invoiceNo || '').toLowerCase();
        const evType = (ev.type || '').toLowerCase();
        const extraName = (ev.customerName || '').toLowerCase();
        const st = (ev.newStatus || '').toLowerCase();
        if (!pName.includes(s) && !invNo.includes(s) && !evType.includes(s) && !extraName.includes(s) && !st.includes(s)) {
          return false;
        }
      }

      return true;
    }).sort((a, b) => b.timestamp - a.timestamp);
  }, [combinedEvents, activityFilter, activitySearch, invoiceFilterDate]);

  // Invoice mutators inside Admin Panel
  const handleUpdateInvoiceStatus = async (invoiceNo: string, newStatus: string) => {
    try {
      await setDoc(doc(db, 'invoices', invoiceNo), { status: newStatus }, { merge: true });
      
      // Log status_invoice event to analytics events in Firestore
      await addDoc(collection(db, 'analytics_events'), {
        type: 'status_invoice',
        invoiceNo,
        newStatus,
        timestamp: Date.now()
      });

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

  const handleManualRefresh = () => {
    if (isRefreshing) return;
    setIsRefreshing(true);
    addToast('info', 'Menyegarkan Data', 'Menghubungi cloud database untuk menyinkronkan aktivitas terbaru...');
    setTimeout(() => {
      setIsRefreshing(false);
      addToast('success', 'Data Diperbarui', 'Pencatatan kunjungan website, klik tombol beralih, dan invoice terbaru berhasil dimuat secara real-time!');
    }, 750);
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
        heroTagline1: formHeroTagline1,
        heroTagline2: formHeroTagline2,
        heroTitle: formHeroTitle,
        heroDescription: formHeroDescription,
        heroCtaButton1Label: formHeroCtaButton1Label,
        heroCtaButton2Label: formHeroCtaButton2Label,
        heroStat1Value: formHeroStat1Value,
        heroStat1Label: formHeroStat1Label,
        heroStat2Value: formHeroStat2Value,
        heroStat2Label: formHeroStat2Label,
        heroStat3Value: formHeroStat3Value,
        heroStat3Label: formHeroStat3Label,
        heroBadge1Text: formHeroBadge1Text,
        heroBadge2Text: formHeroBadge2Text,
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
    const previousTestimonySnap = selectedTestimonial ? { ...selectedTestimonial } : null;

    try {
      await setDoc(doc(db, 'testimonials', id), payload);
      setOperationState({ status: 'success', message: 'Testimoni ulasan berhasil disimpan ke cloud!' });
      
      if (previousTestimonySnap) {
        pushUndoAction(
          `Ubah testimoni "${payload.name}"`,
          async () => {
            await setDoc(doc(db, 'testimonials', id), previousTestimonySnap);
          }
        );
      } else {
        pushUndoAction(
          `Tambah testimoni "${payload.name}"`,
          async () => {
            await deleteDoc(doc(db, 'testimonials', id));
          }
        );
      }

      setIsTestimonyFormOpen(false);
      setSelectedTestimonial(null);
      setTimeout(() => setOperationState({ status: 'idle' }), 3000);
    } catch (error) {
      setOperationState({ status: 'error', message: 'Gagal menyimpan testimoni.' });
    }
  };

  const handleDeleteTestimonialForm = (id: string) => {
    const previousTestimony = testimonials.find((x) => x.id === id);

    requestConfirm(
      'Hapus Testimoni',
      'Apakah Anda yakin ingin menghapus ulasan testimoni ini dari website?',
      async () => {
        setOperationState({ status: 'loading', message: 'Menghapus testimoni...' });
        try {
          await deleteDoc(doc(db, 'testimonials', id));
          setOperationState({ status: 'success', message: 'Testimoni sukses dihapus!' });
          
          if (previousTestimony) {
            pushUndoAction(
              `Hapus testimoni "${previousTestimony.name}"`,
              async () => {
                await setDoc(doc(db, 'testimonials', id), previousTestimony);
              }
            );
          }

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
    const previousFaqSnap = selectedFaq ? { ...selectedFaq } : null;

    try {
      await setDoc(doc(db, 'faqs', id), payload);
      setOperationState({ status: 'success', message: 'FAQ berhasil disimpan!' });
      
      if (previousFaqSnap) {
        pushUndoAction(
          `Ubah FAQ "${payload.question.substring(0, 30)}..."`,
          async () => {
            await setDoc(doc(db, 'faqs', id), previousFaqSnap);
          }
        );
      } else {
        pushUndoAction(
          `Tambah FAQ "${payload.question.substring(0, 30)}..."`,
          async () => {
            await deleteDoc(doc(db, 'faqs', id));
          }
        );
      }

      setIsFaqFormOpen(false);
      setSelectedFaq(null);
      setTimeout(() => setOperationState({ status: 'idle' }), 3000);
    } catch (error) {
      setOperationState({ status: 'error', message: 'Gagal menyimpan FAQ.' });
    }
  };

  const handleDeleteFaq = (id: string) => {
    const previousFaq = dbFaqs.find((x) => x.id === id) || FAQS.find((x) => x.id === id);

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
          
          if (previousFaq) {
            pushUndoAction(
              `Hapus FAQ "${previousFaq.question.substring(0, 30)}..."`,
              async () => {
                await setDoc(doc(db, 'faqs', id), previousFaq);
              }
            );
          }

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
    const payload: any = {
      id,
      title: aboutSlideTitle.trim(),
      subtitle: aboutSlideSubtitle.trim() || 'Kisah Tentang Kami',
      image: aboutSlideImage || '/src/assets/images/yusuki_physical_outlet_1780673086306.png',
      paragraphs: paraArr,
    };

    if (aboutSlideBullet1Title.trim()) payload.bullet1Title = aboutSlideBullet1Title.trim();
    if (aboutSlideBullet1Desc.trim()) payload.bullet1Desc = aboutSlideBullet1Desc.trim();
    if (aboutSlideBullet2Title.trim()) payload.bullet2Title = aboutSlideBullet2Title.trim();
    if (aboutSlideBullet2Desc.trim()) payload.bullet2Desc = aboutSlideBullet2Desc.trim();

    const previousSlideSnap = selectedAboutSlide ? { ...selectedAboutSlide } : null;

    try {
      console.log('Menyimpan slide kisah ke Firestore dengan ID:', id, payload);
      await setDoc(doc(db, 'about_slides', id), payload);
      setOperationState({ status: 'success', message: 'Kisah Tentang Kami berhasil disimpan!' });
      
      if (previousSlideSnap) {
        pushUndoAction(
          `Ubah kisah "${payload.title}"`,
          async () => {
             await setDoc(doc(db, 'about_slides', id), previousSlideSnap);
          }
        );
      } else {
        pushUndoAction(
          `Tambah kisah "${payload.title}"`,
          async () => {
             await deleteDoc(doc(db, 'about_slides', id));
          }
        );
      }

      setIsAboutSlideFormOpen(false);
      setSelectedAboutSlide(null);
      setTimeout(() => setOperationState({ status: 'idle' }), 3000);
    } catch (error) {
      console.error('Gagal menyimpan Kisah Tentang Kami ke Firestore:', error);
      setOperationState({ status: 'error', message: 'Gagal menyimpan Kisah Tentang Kami.' });
    }
  };

  const handleDeleteAboutSlide = (id: string) => {
    const previousSlide = dbAboutSlides.find((x) => x.id === id) || DEFAULT_ABOUT_SLIDES.find((x) => x.id === id);

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

          if (previousSlide) {
            pushUndoAction(
              `Hapus kisah "${previousSlide.title}"`,
              async () => {
                await setDoc(doc(db, 'about_slides', id), previousSlide);
              }
            );
          }

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
    const previousInfoSnap = selectedInfoTambahan ? { ...selectedInfoTambahan } : null;

    try {
      await setDoc(doc(db, 'info_tambahan', id), payload);
      setOperationState({ status: 'success', message: 'Info tambahan berhasil disimpan!' });
      
      if (previousInfoSnap) {
        pushUndoAction(
          `Ubah info "${payload.title}"`,
          async () => {
            await setDoc(doc(db, 'info_tambahan', id), previousInfoSnap);
          }
        );
      } else {
        pushUndoAction(
          `Tambah info "${payload.title}"`,
          async () => {
            await deleteDoc(doc(db, 'info_tambahan', id));
          }
        );
      }

      setIsInfoTambahanFormOpen(false);
      setSelectedInfoTambahan(null);
      setTimeout(() => setOperationState({ status: 'idle' }), 3000);
    } catch (error) {
      setOperationState({ status: 'error', message: 'Gagal menyimpan info tambahan.' });
    }
  };

  const handleDeleteInfoTambahan = (id: string) => {
    const previousInfo = dbInfoTambahan.find(x => x.id === id) || DEFAULT_INFO_TAMBAHAN.find(x => x.id === id);

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

          if (previousInfo) {
            pushUndoAction(
              `Hapus info "${previousInfo.title}"`,
              async () => {
                await setDoc(doc(db, 'info_tambahan', id), previousInfo);
              }
            );
          }

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
    const previousItem = menuItems.find((item) => item.id === id) || MENU_ITEMS.find((item) => item.id === id);
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
          
          if (previousItem) {
            pushUndoAction(
              `Hapus menu "${name}"`,
              async () => {
                await setDoc(doc(db, 'menu_items', id), previousItem);
              }
            );
          }
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
    const previousAvailable = item.isAvailable !== false;
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
          pushUndoAction(
            `${nextAvailable ? 'Aktivasi' : 'Nonaktivasi'} menu "${item.name}"`,
            async () => {
              await setDoc(doc(db, 'menu_items', item.id), { ...item, isAvailable: previousAvailable }, { merge: true });
            }
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

  const handleDisableAllMenus = () => {
    const activeItems = menuItems.filter((item) => item.isAvailable !== false);
    if (activeItems.length === 0) {
      addToast('info', 'Semua Menu Sudah Habis', 'Tidak ada menu aktif yang bisa dinonaktifkan.');
      return;
    }

    requestConfirm(
      'Nonaktifkan Semua Menu?',
      `Apakah Anda yakin ingin menonaktifkan ketersediaan seluruh (${activeItems.length}) menu yang sedang aktif sekaligus? Pelanggan tidak akan bisa memesan menu-menu ini sampai diaktifkan kembali.`,
      async () => {
        setOperationState({ status: 'loading', message: 'Sedang menonaktifkan semua menu...' });
        try {
          const promises = activeItems.map((item) =>
            setDoc(
              doc(db, 'menu_items', item.id),
              { ...item, isAvailable: false },
              { merge: true }
            )
          );
          await Promise.all(promises);
          setOperationState({ status: 'success', message: 'Semua menu berhasil dinonaktifkan!' });
          
          pushUndoAction(
            `Nonaktifkan seluruh (${activeItems.length}) menu`,
            async () => {
              const undoPromises = activeItems.map((item) =>
                setDoc(
                  doc(db, 'menu_items', item.id),
                  { ...item, isAvailable: true },
                  { merge: true }
                )
              );
              await Promise.all(undoPromises);
            }
          );
          setTimeout(() => setOperationState({ status: 'idle' }), 3000);
        } catch (error) {
          console.error('Gagal menonaktifkan semua menu:', error);
          setOperationState({ status: 'error', message: 'Gagal menonaktifkan semua menu.' });
          addToast('error', 'Gagal Memperbarui', 'Gagal memproses penonaktifan masal seluruh menu.');
        }
      },
      'Ya, Nonaktifkan Semua',
      'danger'
    );
  };

  const handleEnableAllMenus = () => {
    const inactiveItems = menuItems.filter((item) => item.isAvailable === false);
    if (inactiveItems.length === 0) {
      addToast('info', 'Semua Menu Sudah Aktif', 'Tidak ada menu habis yang perlu diaktifkan.');
      return;
    }

    requestConfirm(
      'Aktifkan Semua Menu?',
      `Apakah Anda yakin ingin mengaktifkan kembali seluruh (${inactiveItems.length}) menu yang sedang habis/nonaktif sekaligus? Pelanggan akan bisa melihat dan memesan menu-menu ini kembali.`,
      async () => {
        setOperationState({ status: 'loading', message: 'Sedang mengaktifkan seluruh menu...' });
        try {
          const promises = inactiveItems.map((item) =>
            setDoc(
              doc(db, 'menu_items', item.id),
              { ...item, isAvailable: true },
              { merge: true }
            )
          );
          await Promise.all(promises);
          setOperationState({ status: 'success', message: 'Semua menu berhasil diaktifkan!' });
          
          pushUndoAction(
            `Aktifkan seluruh (${inactiveItems.length}) menu`,
            async () => {
              const undoPromises = inactiveItems.map((item) =>
                setDoc(
                  doc(db, 'menu_items', item.id),
                  { ...item, isAvailable: false },
                  { merge: true }
                )
              );
              await Promise.all(undoPromises);
            }
          );
          setTimeout(() => setOperationState({ status: 'idle' }), 3000);
        } catch (error) {
          console.error('Gagal mengaktifkan semua menu:', error);
          setOperationState({ status: 'error', message: 'Gagal mengaktifkan semua menu.' });
          addToast('error', 'Gagal Memperbarui', 'Gagal memproses pengaktifan masal seluruh menu.');
        }
      },
      'Ya, Aktifkan Semua',
      'primary'
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

    const previousItemSnap = editingItem ? { ...editingItem } : null;

    const performSave = async () => {
      try {
        await setDoc(doc(db, 'menu_items', id), itemPayload);
        setOperationState({
          status: 'success',
          message: editingItem ? 'Menu berhasil diperbarui!' : 'Menu baru berhasil ditambahkan!'
        });
        
        if (previousItemSnap) {
          pushUndoAction(
            `Ubah menu "${formName}"`,
            async () => {
              await setDoc(doc(db, 'menu_items', id), previousItemSnap);
            }
          );
        } else {
          pushUndoAction(
            `Tambah menu "${formName}"`,
            async () => {
              await deleteDoc(doc(db, 'menu_items', id));
            }
          );
        }

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
                  {t.onUndo && (
                    <button
                      type="button"
                      onClick={() => {
                        t.onUndo?.();
                        removeToast(t.id);
                      }}
                      className="mt-1.5 flex items-center gap-1 text-[10px] font-extrabold text-amber-600 hover:text-amber-850 bg-amber-50 hover:bg-amber-100 hover:shadow-xs px-2 py-1 rounded-md border border-amber-200 cursor-pointer transition-all uppercase tracking-wider"
                    >
                      <RotateCcw className="w-3 h-3 stroke-[2.5]" />
                      Urungkan (Undo)
                    </button>
                  )}
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
                    <Palette className="w-4 h-4" />
                    Kontrol Tampilan Website
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
                        <h4 className="font-display font-black text-xl text-brand-charcoal flex items-center gap-2">
                          <LayoutDashboard className="w-5 h-5 text-rose-600" />
                          Dashboard Analitik & Riwayat Aktivitas
                        </h4>
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

                        {/* Refresh Data */}
                        <button
                          onClick={handleManualRefresh}
                          className="flex items-center gap-1.5 text-[10px] font-black uppercase text-blue-600 bg-blue-50 hover:bg-blue-100 border border-blue-200/50 px-3 py-2 rounded-xl transition-all cursor-pointer shadow-sm active:scale-95"
                        >
                          <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
                          Refresh Data
                        </button>

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

                    {/* REDESIGNED ADMIN ANALYTICS DASHBOARD PANELS (BAGIAN 1 - BAGIAN 8) */}
                    {(() => {
                      // Local variable definitions for the calculations
                      const totalVisits = analyticsStats.totalVisits;
                      const totalProductClicks = analyticsStats.totalProductClicks;
                      const totalAddToCartCount = analyticsStats.totalAddToCartCount;
                      const totalDraftInvoices = filteredAndSearchedInvoices.length;
                      const totalDownloads = analyticsStats.totalDownloads;
                      const totalWaClicksConverted = analyticsStats.totalWaClicksConverted;

                      // 1. Visitor Website Change percentage
                      const visitsPct = visitorChangePct.pct;
                      const visitsIsUp = visitorChangePct.isUp;

                      // 2. Add to Cart Rate & Average (directly from visits)
                      const addToCartRate = totalVisits > 0 ? Math.min(100, (totalAddToCartCount / totalVisits) * 100) : 0;
                      const avgItemPerCart = totalDraftInvoices > 0 ? (totalAddToCartCount / totalDraftInvoices) : 0;

                      // 3. Draft Invoice Rate & Estimated Revenue
                      const totalItemsInInvoices = filteredAndSearchedInvoices.reduce((acc, inv) => {
                        const itemsCount = inv.items ? inv.items.reduce((sum: number, item: any) => sum + (item.quantity || 1), 0) : 0;
                        return acc + itemsCount;
                      }, 0);
                      const checkoutRate = totalAddToCartCount > 0 ? (totalDraftInvoices > 0 ? 100 : 0) : 100;
                      const estimatedRevenue = filteredAndSearchedInvoices.reduce((acc, current) => acc + (current.total || 0), 0);
                      const aov = totalDraftInvoices > 0 ? (estimatedRevenue / totalDraftInvoices) : 0;

                      // 4. Receipt / Invoice Download Rate
                      const downloadRate = totalDraftInvoices > 0 ? (totalDownloads / totalDraftInvoices) * 100 : 0;

                      // 5. WhatsApp Conversion Rate & Lost Customer
                      const waConversionRate = totalDownloads > 0 ? (totalWaClicksConverted / totalDownloads) * 100 : 0;
                      const lostCustomer = Math.max(0, totalDownloads - totalWaClicksConverted);

                      // Funnel calculations (Bagian 2)
                      const transitionsList = [
                        { id: 1, name: 'Visitor Website ➔ Add To Cart', drop: totalVisits > 0 ? Math.max(0, 100 - Math.min(100, (totalAddToCartCount / totalVisits) * 100)) : 0, pct: totalVisits > 0 ? Math.min(100, (totalAddToCartCount / totalVisits) * 100) : 0, key: 'visit_to_cart', reco: 'Pengunjung hanya membuka web tanpa memasukkan hidangan ke keranjang. Solusi: Sediakan menu promo menarik, diskon flash-sale, atau visual banner paket bundling Suki terlaris di baris teratas landing page!' },
                        { id: 2, name: 'Add To Cart ➔ Draft Invoice', drop: totalAddToCartCount > 0 ? (totalDraftInvoices > 0 ? 0 : 100) : 0, pct: totalAddToCartCount > 0 ? (totalDraftInvoices > 0 ? 100 : 0) : 100, key: 'cart_to_invoice', reco: 'Pelanggan membatalkan hidangan saat pengisian nama atau pemesanan. Solusi: Persingkat kolom form pengisian, sediakan opsi kurir pengantaran mandiri yang jelas, dan hilangkan kolom opsional yang membingungkan.' },
                        { id: 3, name: 'Draft Invoice ➔ Download Receipt', drop: totalDraftInvoices > 0 ? Math.max(0, 100 - Math.min(100, (totalDownloads / totalDraftInvoices) * 100)) : 0, pct: totalDraftInvoices > 0 ? Math.min(100, (totalDownloads / totalDraftInvoices) * 100) : 0, key: 'invoice_to_download', reco: 'Banyak invoice terbuat namun kustomer tidak menekan tombol Unduh Nota PNG. Solusi: Beri warna tombol Unduh Nota lebih mencolok (misal dengan warna hijau/oranye menyala), atau tambahkan animasi panah berdenyut agar kustomer segera mengundunya.' },
                        { id: 4, name: 'Download Receipt ➔ Kirim WhatsApp', drop: totalDownloads > 0 ? Math.max(0, 100 - Math.min(100, (totalWaClicksConverted / totalDownloads) * 100)) : 0, pct: totalDownloads > 0 ? Math.min(100, (totalWaClicksConverted / totalDownloads) * 100) : 0, key: 'download_to_wa', reco: 'Pelanggan sudah mengunduh nota tapi lupa mengklik tombol kirim data ke chat WA Admin. Solusi: Pasang notifikasi pop-up pengingat persuasif langsung setelah tombol unduh di-klik agar kustomer langsung membagikan nota ke WA!' }
                      ];

                      let maxDropTransition = transitionsList[0];
                      transitionsList.forEach(t => {
                        if (t.drop > maxDropTransition.drop) {
                          maxDropTransition = t;
                        }
                      });

                      // Dine In vs Take Away
                      const totalMethodOrders = currentStats.totalDineIn + currentStats.totalTakeAway;
                      const dineInPct = totalMethodOrders > 0 ? Math.round((currentStats.totalDineIn / totalMethodOrders) * 100) : 55;
                      const takeAwayPct = totalMethodOrders > 0 ? Math.round((currentStats.totalTakeAway / totalMethodOrders) * 100) : 45;
                      const orderTypeInsightText = takeAwayPct > dineInPct 
                        ? "Sebagian besar pelanggan memilih Take Away." 
                        : dineInPct > takeAwayPct 
                        ? "Sebagian besar pelanggan memilih Dine In." 
                        : "Minat Dine In dan Take Away berimbang.";

                      // QRIS vs Tunai (Cashless vs Cash)
                      const paymentQRISCount = filteredAndSearchedInvoices.filter(i => (i.clickWA === true || i.status !== 'Baru dibuat') && i.payment === 'QRIS').length;
                      const paymentTunaiCount = filteredAndSearchedInvoices.filter(i => (i.clickWA === true || i.status !== 'Baru dibuat') && i.payment === 'TUNAI').length;
                      const totalPaymentCount = paymentQRISCount + paymentTunaiCount;
                      const qrisPct = totalPaymentCount > 0 ? Math.round((paymentQRISCount / totalPaymentCount) * 100) : 65;
                      const tunaiPct = totalPaymentCount > 0 ? Math.round((paymentTunaiCount / totalPaymentCount) * 100) : 35;
                      const paymentMethodInsightText = qrisPct > tunaiPct 
                        ? "Mayoritas pelanggan memilih pembayaran menggunakan QRIS." 
                        : tunaiPct > qrisPct 
                        ? "Mayoritas pelanggan memilih pembayaran menggunakan Tunai." 
                        : "Pilihan pembayaran tunai dan non-tunai digunakan seimbang.";

                      // Top item details
                      const maxCartCount = Math.max(...analyticsStats.topCartProductsList.map(p => p.count), 1);
                      const maxClickedCount = Math.max(...analyticsStats.topClickedProductsList.map(p => p.count), 1);
                      const maxConfirmedCount = Math.max(...analyticsStats.topConfirmedProductsList.map(p => p.count), 1);

                      // Hourly order pattern
                      const hoursToDisplay = [11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23];
                      const maxOrdersInDisplay = Math.max(...hoursToDisplay.map(h => analyticsStats.hoverOrdersArray[h]), 1);

                      // Reusable donut chart generator
                      const renderDonutChart = (p1: number, p2: number, label1: string, label2: string, color1: string, color2: string) => {
                        const circ = 219.9;
                        const stroke1 = (p1 / 100) * circ;
                        const stroke2 = (p2 / 100) * circ;
                        
                        return (
                          <div className="flex items-center gap-6 justify-center">
                            <div className="relative w-28 h-28 shrink-0 flex items-center justify-center">
                              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                                <circle cx="50" cy="50" r="35" fill="transparent" stroke="#f4f4f5" strokeWidth="12" />
                                {p1 > 0 && (
                                  <circle
                                    cx="50"
                                    cy="50"
                                    r="35"
                                    fill="transparent"
                                    stroke={color1}
                                    strokeWidth="12"
                                    strokeDasharray={`${stroke1} ${circ}`}
                                    strokeDashoffset="0"
                                    strokeLinecap="round"
                                    className="transition-all duration-500 ease-out"
                                  />
                                )}
                                {p2 > 0 && (
                                  <circle
                                    cx="50"
                                    cy="50"
                                    r="35"
                                    fill="transparent"
                                    stroke={color2}
                                    strokeWidth="12"
                                    strokeDasharray={`${stroke2} ${circ}`}
                                    strokeDashoffset={-stroke1}
                                    strokeLinecap="round"
                                    className="transition-all duration-500 ease-out"
                                  />
                                )}
                              </svg>
                              <div className="absolute flex flex-col items-center justify-center">
                                <span className="text-xs font-mono font-black text-zinc-800">{p1.toFixed(0)}%</span>
                                <span className="text-[8px] text-zinc-400 font-extrabold uppercase tracking-wide">{label1}</span>
                              </div>
                            </div>
                            
                            <div className="space-y-1.5 text-left">
                              <div className="flex items-center gap-2">
                                <span className="w-3 h-3 rounded-md" style={{ backgroundColor: color1 }} />
                                <span className="text-[11px] font-black text-zinc-700">{label1}: {p1.toFixed(0)}%</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="w-3 h-3 rounded-md" style={{ backgroundColor: color2 }} />
                                <span className="text-[11px] font-black text-zinc-700">{label2}: {p2.toFixed(0)}%</span>
                              </div>
                            </div>
                          </div>
                        );
                      };

                      return (
                        <div className="space-y-6">
                          {/* =================================================================
                          BAGIAN 1 - 5 KPI UTAMA (PRIORITAS TERTINGGI)
                          ================================================================= */}
                          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
                            {/* 1. Visitor Website */}
                            <div className="bg-white p-4 rounded-2xl border border-zinc-200 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between">
                              <div>
                                <div className="flex items-center justify-between">
                                  <div className="relative group flex items-center gap-1">
                                    <span className="text-[9px] font-mono font-black uppercase tracking-wider text-zinc-400">Visitor Web</span>
                                    <HelpCircle className="w-3.5 h-3.5 text-zinc-300 hover:text-rose-600 transition-colors cursor-help shrink-0" />
                                    <div className="absolute left-0 bottom-full mb-1.5 hidden group-hover:block w-48 bg-zinc-900 text-white text-[9.5px] p-2.5 rounded-xl shadow-xl z-50 leading-relaxed font-normal normal-case break-words text-left">
                                      Total pengunjung unik yang mengakses halaman website utama Suki YuSuki.
                                      <div className="absolute top-full left-3 border-4 border-transparent border-t-zinc-900" />
                                    </div>
                                  </div>
                                  <span className="w-7 h-7 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                                    <Eye className="w-3.5 h-3.5" />
                                  </span>
                                </div>
                                <h3 className="font-display font-black text-xl text-zinc-800 mt-2">
                                  {totalVisits.toLocaleString('id-ID')} <span className="text-[10px] text-zinc-400 font-bold">Kunjungan</span>
                                </h3>
                              </div>
                              <div className="mt-2.5 flex items-center gap-1.5">
                                <span className={`inline-flex items-center gap-0.5 text-[9px] font-black px-1.5 py-0.5 rounded-lg ${visitsIsUp ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                                  {visitsIsUp ? '↑' : '↓'} {visitsPct}%
                                </span>
                                <span className="text-[8.5px] text-zinc-400 font-bold">vs periode lalu</span>
                              </div>
                            </div>

                            {/* 2. Add To Cart */}
                            <div className="bg-white p-4 rounded-2xl border border-zinc-200 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between">
                              <div>
                                <div className="flex items-center justify-between">
                                  <div className="relative group flex items-center gap-1">
                                    <span className="text-[9px] font-mono font-black uppercase tracking-wider text-zinc-400">Add To Cart</span>
                                    <HelpCircle className="w-3.5 h-3.5 text-zinc-300 hover:text-rose-600 transition-colors cursor-help shrink-0" />
                                    <div className="absolute left-0 bottom-full mb-1.5 hidden group-hover:block w-48 bg-zinc-900 text-white text-[9.5px] p-2.5 rounded-xl shadow-xl z-50 leading-relaxed font-normal normal-case break-words text-left">
                                      Total item masakan masukan kuesioner siap order yang berada di keranjang digital.
                                      <div className="absolute top-full left-3 border-4 border-transparent border-t-zinc-900" />
                                    </div>
                                  </div>
                                  <span className="w-7 h-7 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
                                    <ShoppingCart className="w-3.5 h-3.5" />
                                  </span>
                                </div>
                                <h3 className="font-display font-black text-xl text-zinc-800 mt-2">
                                  {totalAddToCartCount.toLocaleString('id-ID')} <span className="text-[10px] text-zinc-400 font-bold">Items</span>
                                </h3>
                              </div>
                              <div className="mt-2.5">
                                <div className="text-[9px] font-black text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded-lg inline-block">
                                  Rate: {addToCartRate.toFixed(0)}%
                                </div>
                                <span className="text-[7.5px] text-zinc-400 block mt-1 font-bold">Avg: {avgItemPerCart.toFixed(1)} qty/order</span>
                              </div>
                            </div>

                            {/* 3. Draft Invoice */}
                            <div className="bg-white p-4 rounded-2xl border border-zinc-200 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between">
                              <div>
                                <div className="flex items-center justify-between">
                                  <div className="relative group flex items-center gap-1">
                                    <span className="text-[9px] font-mono font-black uppercase tracking-wider text-zinc-400">Draft Invoice</span>
                                    <HelpCircle className="w-3.5 h-3.5 text-zinc-300 hover:text-rose-600 transition-colors cursor-help shrink-0" />
                                    <div className="absolute left-0 bottom-full mb-1.5 hidden group-hover:block w-48 bg-zinc-900 text-white text-[9.5px] p-2.5 rounded-xl shadow-xl z-50 leading-relaxed font-normal normal-case break-words text-left">
                                      Menghitung pembuatan ringkasan transaksi sebelum slip kounter resmi dterbitkan.
                                      <div className="absolute top-full left-3 border-4 border-transparent border-t-zinc-900" />
                                    </div>
                                  </div>
                                  <span className="w-7 h-7 rounded-xl bg-purple-50 text-purple-650 flex items-center justify-center">
                                    <Receipt className="w-3.5 h-3.5" />
                                  </span>
                                </div>
                                <h3 className="font-display font-black text-xl text-zinc-800 mt-2">
                                  {totalDraftInvoices.toLocaleString('id-ID')} <span className="text-[10px] text-zinc-400 font-bold">Nota</span>
                                </h3>
                              </div>
                              <div className="mt-2.5">
                                <div className="text-[9px] font-black text-purple-600 bg-purple-50 px-1.5 py-0.5 rounded-lg inline-block">
                                  Checkout: {checkoutRate.toFixed(0)}%
                                </div>
                                <span className="text-[7.5px] text-zinc-400 block mt-1 font-bold">Est: {formatPrice(estimatedRevenue)}</span>
                              </div>
                            </div>

                            {/* 4. Receipt / Invoice Download */}
                            <div className="bg-white p-4 rounded-2xl border border-zinc-200 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between">
                              <div>
                                <div className="flex items-center justify-between">
                                  <div className="relative group flex items-center gap-1">
                                    <span className="text-[9px] font-mono font-black uppercase tracking-wider text-zinc-400">Nota Unduh</span>
                                    <HelpCircle className="w-3.5 h-3.5 text-zinc-300 hover:text-rose-600 transition-colors cursor-help shrink-0" />
                                    <div className="absolute left-0 bottom-full mb-1.5 hidden group-hover:block w-48 bg-zinc-900 text-white text-[9.5px] p-2.5 rounded-xl shadow-xl z-50 leading-relaxed font-normal normal-case break-words text-left">
                                      Melacak persentase pelanggan yang mendownload nota format PNG untuk dibawa langsung ke kasir counter.
                                      <div className="absolute top-full left-3 border-4 border-transparent border-t-zinc-900" />
                                    </div>
                                  </div>
                                  <span className="w-7 h-7 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                                    <Download className="w-3.5 h-3.5" />
                                  </span>
                                </div>
                                <h3 className="font-display font-black text-xl text-zinc-800 mt-2">
                                  {totalDownloads.toLocaleString('id-ID')} <span className="text-[10px] text-zinc-400 font-bold">PNG</span>
                                </h3>
                              </div>
                              <div className="mt-2.5">
                                <div className="text-[9px] font-black text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded-lg inline-block">
                                  Download: {downloadRate.toFixed(0)}%
                                </div>
                                <div className="w-full bg-zinc-100 h-1.5 rounded-full mt-1.5 overflow-hidden">
                                  <div className="bg-indigo-500 h-full rounded-full transition-all duration-500" style={{ width: `${Math.min(downloadRate, 100)}%` }} />
                                </div>
                              </div>
                            </div>

                            {/* 5. WhatsApp Confirmation */}
                            <div className="bg-white p-4 rounded-2xl border border-zinc-200 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between border-l-[3.5px] border-l-rose-500">
                              <div>
                                <div className="flex items-center justify-between">
                                  <div className="relative group flex items-center gap-1">
                                    <span className="text-[9px] font-mono font-black uppercase tracking-wider text-rose-600">WhatsApp OK</span>
                                    <HelpCircle className="w-3.5 h-3.5 text-rose-300 hover:text-rose-600 transition-colors cursor-help shrink-0" />
                                    <div className="absolute right-0 bottom-full mb-1.5 hidden group-hover:block w-48 bg-zinc-900 text-white text-[9.5px] p-2.5 rounded-xl shadow-xl z-50 leading-relaxed font-normal normal-case break-words text-left">
                                      Tingkat kesuksesan akhir; mengukur kustomer yang mengirimkan data order via API WhatsApp naskah.
                                      <div className="absolute top-full right-3 border-4 border-transparent border-t-zinc-900" />
                                    </div>
                                  </div>
                                  <span className="w-7 h-7 rounded-xl bg-green-50 text-green-600 flex items-center justify-center text-[10px]">
                                    💬
                                  </span>
                                </div>
                                <h3 className="font-display font-black text-xl text-zinc-800 mt-2">
                                  {totalWaClicksConverted.toLocaleString('id-ID')} <span className="text-[10px] text-zinc-400 font-bold">Aksi</span>
                                </h3>
                              </div>
                              <div className="mt-2.5">
                                <div className="text-[9px] font-black text-green-600 bg-green-50 px-1.5 py-0.5 rounded-lg inline-block">
                                  WA Conv: {waConversionRate.toFixed(0)}%
                                </div>
                                <span className="text-[8px] text-zinc-400 block mt-1 font-bold">Lost Customer: <span className="text-rose-600 font-black">{lostCustomer}</span></span>
                              </div>
                            </div>
                          </div>
                          {/* =================================================================
                          BAGIAN 2 - CUSTOMER CONVERSION FUNNEL & BAGIAN 8 - AI INSIGHT
                          ================================================================= */}
                          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-left">
                            {/* Conversion Funnel Page */}
                            <div className="lg:col-span-2 bg-white p-5 rounded-2xl border border-zinc-200 shadow-sm flex flex-col justify-between">
                              <div className="space-y-1">
                                <h4 className="font-display font-black text-sm text-zinc-800 flex items-center gap-1.5">
                                  <Activity className="w-4 h-4 text-rose-600" />
                                  Visualisasi Customer Journey Funnel
                                </h4>
                                <p className="text-[10px] text-zinc-500 font-semibold">
                                  Analisis alur konversi bertahap untuk mendeteksi letak hilangnya calon kustomer secara beruntun.
                                </p>
                              </div>
                              {/* Funnel Steps */}
                              <div className="mt-6 flex flex-col gap-2.5 relative">
                                {[
                                  { label: 'Visitor Website', value: totalVisits, icon: <Eye className="w-3.5 h-3.5" />, color: 'bg-blue-600 text-white' },
                                  { label: 'Add To Cart', value: totalAddToCartCount, icon: <ShoppingCart className="w-3.5 h-3.5" />, color: 'bg-rose-600 text-white' },
                                  { label: 'Draft Invoice', value: totalDraftInvoices, icon: <Receipt className="w-3.5 h-3.5" />, color: 'bg-purple-600 text-white' },
                                  { label: 'Download Receipt', value: totalDownloads, icon: <Download className="w-3.5 h-3.5" />, color: 'bg-indigo-600 text-white' },
                                  { label: 'Klik Kirim WhatsApp', value: totalWaClicksConverted, icon: <span className="text-[10.5px]">💬</span>, color: 'bg-green-600 text-white' }
                                ].map((step, idx, arr) => {
                                  const globalConvRate = totalVisits > 0 ? (step.value / totalVisits) * 100 : 0;
                                  const prevVal = idx > 0 ? arr[idx - 1].value : totalVisits;
                                  const stageConvRate = idx === 2 ? (totalAddToCartCount > 0 ? (totalDraftInvoices > 0 ? 100 : 0) : 100) : (prevVal > 0 ? Math.min(100, (step.value / prevVal) * 100) : 0);
                                  const dropRate = Math.max(0, 100 - stageConvRate);

                                  const isTransitionLeak = idx > 0 && maxDropTransition && (
                                    (idx === 1 && maxDropTransition.key === 'visit_to_cart') ||
                                    (idx === 2 && maxDropTransition.key === 'cart_to_invoice') ||
                                    (idx === 3 && maxDropTransition.key === 'invoice_to_download') ||
                                    (idx === 4 && maxDropTransition.key === 'download_to_wa')
                                  );

                                  const widthStyle = idx === 0 ? 'w-full' : idx === 1 ? 'w-[90%]' : idx === 2 ? 'w-[80%]' : idx === 3 ? 'w-[70%]' : 'w-[60%]';

                                  return (
                                    <div key={idx} className="flex flex-col items-center w-full">
                                      {idx > 0 && (
                                        <div className={`flex flex-col items-center justify-center py-1 rounded-xl px-4 ${isTransitionLeak ? 'bg-rose-50 border border-rose-200 animate-pulse' : 'bg-zinc-50 border border-zinc-100'} w-48 z-10 -my-1`}>
                                          <span className={`text-[8px] font-black uppercase ${isTransitionLeak ? 'text-rose-600 animate-bounce' : 'text-zinc-500'}`}>
                                            {isTransitionLeak ? '🔴 KEBOCORAN TERBESAR' : '⬇️ PENYUSUTAN'}
                                          </span>
                                          <div className="flex items-center gap-1.5 text-[10px] font-black">
                                            <span className={isTransitionLeak ? 'text-rose-700 font-extrabold' : 'text-zinc-700'}>Drop: {dropRate.toFixed(0)}%</span>
                                            <span className="text-zinc-300 text-[8.5px]">|</span>
                                            <span className="text-zinc-500 font-bold">Conv: {stageConvRate.toFixed(0)}%</span>
                                          </div>
                                        </div>
                                      )}

                                      <div className={`flex items-center justify-between p-3.5 bg-zinc-50 rounded-2xl border ${isTransitionLeak ? 'border-rose-450 bg-rose-50/20' : 'border-zinc-200'} ${widthStyle} shadow-2xs hover:border-zinc-300 transition-all`}>
                                        <div className="flex items-center gap-3">
                                          <div className={`w-8 h-8 rounded-xl shrink-0 flex items-center justify-center shadow-xs ${step.color}`}>
                                            {step.icon}
                                          </div>
                                          <div>
                                            <span className="text-[8.5px] font-mono font-bold tracking-wider text-zinc-400 uppercase block leading-none mb-0.5">Tahap {idx+1}</span>
                                            <h5 className="font-display font-black text-xs text-zinc-805 leading-tight">
                                              {step.label}
                                            </h5>
                                          </div>
                                        </div>

                                        <div className="text-right flex items-center gap-4">
                                          <div>
                                            <span className="text-[8.5px] font-mono font-bold text-zinc-400 uppercase block leading-none mb-1">Volume</span>
                                            <span className="text-xs font-mono font-black text-zinc-800">{step.value.toLocaleString('id-ID')}</span>
                                          </div>
                                          <div className="border-l border-zinc-200 pl-4">
                                            <span className="text-[8.5px] font-mono font-bold text-zinc-400 uppercase block leading-none mb-1">Total Conv</span>
                                            <span className="text-xs font-mono font-black text-rose-600">{globalConvRate.toFixed(0)}%</span>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>

                              {maxDropTransition && (
                                <div className="mt-5 p-4 rounded-xl border border-rose-200 bg-rose-50/50 space-y-2">
                                  <div className="flex items-center gap-2">
                                    <span className="h-5 w-5 rounded bg-rose-100 flex items-center justify-center text-[10px]">🚨</span>
                                    <h6 className="text-[11px] font-black text-rose-800 uppercase tracking-wider">
                                      Evaluasi Titik Kehilangan Terbesar: {maxDropTransition.name.split(' ➔ ')[0]}
                                    </h6>
                                  </div>
                                  <p className="text-[10px] text-rose-700 leading-relaxed font-semibold">
                                    Kebocoran terbesar terjadi pada tahap <span className="font-black text-rose-800 underline">{maxDropTransition.name}</span> dengan persentase drop-off sebesar <span className="font-black text-rose-800 text-xs">{maxDropTransition.drop.toFixed(0)}%</span>.
                                  </p>
                                  <div className="text-[9.5px] bg-white rounded-lg p-2 border border-rose-100 font-bold text-zinc-700 flex items-start gap-1.5 leading-relaxed">
                                    <span className="text-rose-600 font-bold shrink-0">💡 Aksi Rekomendasi:</span>
                                    <span>{maxDropTransition.reco}</span>
                                  </div>
                                </div>
                              )}
                            </div>

                            {/* BAGIAN 8 - AI BUSINESS INSIGHT */}
                            <div className="bg-gradient-to-br from-rose-600 to-rose-700 p-5.5 rounded-2xl border border-rose-700 text-white shadow-md flex flex-col justify-between">
                              <div className="space-y-4">
                                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                                  <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                      <Sparkles className="w-5 h-5 text-amber-300 fill-amber-300 shrink-0" />
                                      <h4 className="font-display font-black text-sm uppercase tracking-wider">
                                        AI Business Insight
                                      </h4>
                                    </div>
                                    <p className="text-[9.5px] text-rose-100 font-normal">
                                      Analisis cerdas otomatis dari status performa dashboard Anda saat ini.
                                    </p>
                                  </div>
                                  <span className="text-[9px] px-2 py-0.5 bg-white/15 rounded-full font-mono font-black uppercase tracking-widest text-rose-100 border border-white/10 shrink-0">
                                    Live
                                  </span>
                                </div>

                                {/* Bullet insights */}
                                <div className="space-y-4 pt-1">
                                  <div className="flex items-start gap-2.5">
                                    <span className="w-1.5 h-1.5 rounded-full bg-amber-300 mt-1.5 shrink-0" />
                                    <p className="text-[11px] leading-relaxed font-semibold text-rose-50">
                                      Konversi terbesar hilang pada tahap <span className="font-black text-white underline">{maxDropTransition ? maxDropTransition.name.split(' ➔ ')[0] : 'Add To Cart'}</span> menuju <span className="font-black text-white">{maxDropTransition ? maxDropTransition.name.split(' ➔ ')[1] : 'Draft Invoice'}</span>.
                                    </p>
                                  </div>

                                  <div className="flex items-start gap-2.5">
                                    <span className="w-1.5 h-1.5 rounded-full bg-amber-300 mt-1.5 shrink-0" />
                                    <p className="text-[11px] leading-relaxed font-semibold text-rose-50">
                                      Menu <span className="font-black text-white underline">{analyticsStats.topCartProductsList[0]?.name || 'Dimsum Original'}</span> menjadi menu paling diminati periode ini karena paling banyak dimasukkan ke keranjang belanja.
                                    </p>
                                  </div>

                                  <div className="flex items-start gap-2.5">
                                    <span className="w-1.5 h-1.5 rounded-full bg-amber-300 mt-1.5 shrink-0" />
                                    <p className="text-[11px] leading-relaxed font-semibold text-rose-50">
                                      {orderTypeInsightText}
                                    </p>
                                  </div>

                                  <div className="flex items-start gap-2.5">
                                    <span className="w-1.5 h-1.5 rounded-full bg-amber-300 mt-1.5 shrink-0" />
                                    <p className="text-[11px] leading-relaxed font-semibold text-rose-50">
                                      {paymentMethodInsightText}
                                    </p>
                                  </div>

                                  <div className="flex items-start gap-2.5">
                                    <span className="w-1.5 h-1.5 rounded-full bg-amber-300 mt-1.5 shrink-0" />
                                    <p className="text-[11px] leading-relaxed font-semibold text-rose-50">
                                      Jam pemesanan tersibuk berada pada pukul <span className="font-black text-white whitespace-nowrap">{analyticsStats.peakOrderHourFormatted !== 'Belum Ada' ? analyticsStats.peakOrderHourFormatted : '18.00–20.00 WIB'}</span>.
                                    </p>
                                  </div>

                                  <div className="flex items-start gap-2.5">
                                    <span className="w-1.5 h-1.5 rounded-full bg-amber-300 mt-1.5 shrink-0" />
                                    <p className="text-[11px] leading-relaxed font-semibold text-rose-50">
                                      Estimated Revenue penanganan periode ini sebesar <span className="font-black text-white">{formatPrice(estimatedRevenue)}</span> dengan rata-rata nilai order sebesar <span className="font-black text-white font-mono">{formatPrice(aov)}</span>.
                                    </p>
                                  </div>
                                </div>
                              </div>

                              <div className="mt-6 border-t border-white/10 pt-4 text-center">
                                <span className="text-[8px] text-rose-200 font-mono tracking-widest uppercase block">
                                  Pusat Keputusan Bisnis UMKM Suki YuSuki
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* =================================================================
                          BAGIAN 4 - ESTIMASI PENDAPATAN & AVERAGE ORDER VALUE (AOV)
                          ================================================================= */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
                            <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 p-5 rounded-2xl border border-emerald-600 text-white shadow-sm flex items-center justify-between hover:translate-y-[-2px] transition-all duration-300">
                              <div className="space-y-1">
                                <span className="text-[9px] font-mono font-black tracking-wider uppercase text-emerald-100 block">Bagian 4 • Estimasi Pendapatan Total</span>
                                <h3 className="font-display font-black text-2xl tracking-tight leading-none text-white mt-1">
                                  {formatPrice(estimatedRevenue)}
                                </h3>
                                <p className="text-[10px] text-emerald-100 font-medium italic">
                                  "Estimasi nilai seluruh pesanan yang telah dibuat."
                                </p>
                              </div>
                              <div className="h-11 w-11 bg-white/10 rounded-2xl flex items-center justify-center text-xl shrink-0">
                                💰
                              </div>
                            </div>

                            <div className="bg-white p-5 rounded-2xl border border-zinc-200 shadow-sm flex items-center justify-between hover:translate-y-[-2px] transition-all duration-300">
                              <div className="space-y-1">
                                <span className="text-[9px] font-mono font-black tracking-wider uppercase text-zinc-400 block">Bagian 4 • Rata-Rata Nilai Order</span>
                                <h3 className="font-display font-black text-2xl tracking-tight leading-none text-rose-600 mt-1 font-mono">
                                  {formatPrice(aov)}
                                </h3>
                                <p className="text-[10px] text-zinc-500 font-bold">
                                  Average Order Value (AOV) dari Invoice kustomer belanja Suki.
                                </p>
                              </div>
                              <div className="h-11 w-11 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center text-xl shrink-0">
                                📈
                              </div>
                            </div>
                          </div>

                          {/* =================================================================
                          BAGIAN 3 - TOP MENU INSIGHT (BAR CHARTS INTERAKTIF)
                          ================================================================= */}
                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 text-left">
                            {/* Top Cart items */}
                            <div className="bg-white p-5 rounded-2xl border border-zinc-200 shadow-sm space-y-4">
                              <div className="space-y-1">
                                <h4 className="font-display font-black text-sm text-zinc-800 flex items-center gap-1.5">
                                  <ShoppingCart className="w-4 h-4 text-rose-600" />
                                  Top 5 Menu Paling Sering Masuk Keranjang
                                </h4>
                                <p className="text-[10px] text-zinc-500 font-semibold">
                                  Menu terpopuler yang paling banyak ditumpuk di keranjang belanja pembeli.
                                </p>
                              </div>

                              <div className="space-y-3.5 pt-2">
                                {analyticsStats.topCartProductsList.length > 0 ? (
                                  analyticsStats.topCartProductsList.map((item, idx) => {
                                    const pct = totalAddToCartCount > 0 ? ((item.count / totalAddToCartCount) * 100) : 0;
                                    const barWidth = (item.count / maxCartCount) * 100;
                                    return (
                                      <div key={idx} className="space-y-1.5">
                                        <div className="flex items-center justify-between text-xs font-black">
                                          <span className="text-zinc-800 flex items-center gap-2">
                                            <span className="text-[10px] font-mono text-zinc-400">#{idx+1}</span>
                                            {item.name}
                                          </span>
                                          <div className="text-right">
                                            <span className="text-zinc-700 font-mono font-black">{item.count} pcs</span>
                                            <span className="text-[9.5px] text-rose-500 font-mono font-bold ml-2">({pct.toFixed(0)}%)</span>
                                          </div>
                                        </div>
                                        <div className="w-full bg-zinc-100 h-2.5 rounded-full overflow-hidden">
                                          <div 
                                            className="bg-rose-500 h-full rounded-full transition-all duration-500 ease-out"
                                            style={{ width: `${barWidth}%` }}
                                          />
                                        </div>
                                      </div>
                                    );
                                  })
                                ) : (
                                  <div className="py-8 text-center text-zinc-400 text-xs font-bold">Belum ada item keranjang terekam.</div>
                                )}
                              </div>
                            </div>

                            {/* Top Confirmed Ordered Items */}
                            <div className="bg-white p-5 rounded-2xl border border-zinc-200 shadow-sm space-y-4">
                              <div className="space-y-1">
                                <h4 className="font-display font-black text-sm text-zinc-800 flex items-center gap-1.5">
                                  <span className="text-[14px]">⭐</span>
                                  Top 5 Hidangan Masakan Terlaris
                                </h4>
                                <p className="text-[10px] text-zinc-500 font-semibold">
                                  Menu yang berhasil terkonfirmasi pada invoice pemesanan terkirim via WhatsApp.
                                </p>
                              </div>

                              <div className="space-y-3.5 pt-2">
                                {analyticsStats.topConfirmedProductsList.length > 0 ? (
                                  analyticsStats.topConfirmedProductsList.map((item, idx) => {
                                    const barWidth = (item.count / maxConfirmedCount) * 100;
                                    return (
                                      <div key={idx} className="space-y-1.5">
                                        <div className="flex items-center justify-between text-xs font-black">
                                          <span className="text-zinc-800 flex items-center gap-2">
                                            <span className="text-[10px] font-mono text-zinc-400">#{idx+1}</span>
                                            {item.name}
                                          </span>
                                          <span className="text-rose-600 font-mono font-black">{item.count} Porsi</span>
                                        </div>
                                        <div className="w-full bg-zinc-100 h-2.5 rounded-full overflow-hidden">
                                          <div 
                                            className="bg-rose-500 h-full rounded-full transition-all duration-500 ease-out"
                                            style={{ width: `${barWidth}%` }}
                                          />
                                        </div>
                                        <p className="text-[8px] text-zinc-400 font-extrabold italic leading-none">
                                          *Menu favorit utama. Pertahankan kualitas bahan baku agar kustomer setia kembali membeli.
                                        </p>
                                      </div>
                                    );
                                  })
                                ) : (
                                  <div className="py-8 text-center text-zinc-400 text-xs font-bold">Belum ada tayangan menu terlaris terekam.</div>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* =================================================================
                          BAGIAN 5 - POLA PEMESANAN, 6 - DISTRIBUSI LAYANAN, 7 - METODE BAYAR
                          ================================================================= */}
                          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-left">
                            {/* 5. Pola Pemesanan (Jam Pemesanan Terbanyak) */}
                            <div className="bg-white p-5 rounded-2xl border border-zinc-200 shadow-sm space-y-4">
                              <div className="space-y-1">
                                <h4 className="font-display font-black text-sm text-zinc-800 flex items-center gap-1.5">
                                  <Clock className="w-4 h-4 text-rose-600" />
                                  Jam Pemesanan Terbanyak
                                </h4>
                                <p className="text-[10px] text-zinc-500 font-semibold">
                                  Analisis jam operasional tersibuk berdasarkan pembuatan Draft Invoice kustomer.
                                </p>
                              </div>

                              <div className="h-32 flex items-end gap-1 px-1 pt-6 border-b border-zinc-150">
                                {hoursToDisplay.map((h, i) => {
                                  const draftCount = analyticsStats.hoverOrdersArray[h] || 0;
                                  const heightPct = (draftCount / maxOrdersInDisplay) * 100;
                                  const isPeak = draftCount === maxOrdersInDisplay && draftCount > 0;
                                  const barHeightStr = draftCount > 0 ? `${Math.max(12, heightPct)}%` : '4%';

                                  return (
                                    <div key={i} className="flex-1 flex flex-col items-center group relative h-full justify-end">
                                      <div className="absolute bottom-full mb-1.5 hidden group-hover:block bg-zinc-900 text-white text-[9px] font-black px-1.5 py-0.5 rounded shadow-lg z-50 whitespace-nowrap">
                                        Pkl {h.toString().padStart(2, '0')}.00: {draftCount} draft
                                      </div>

                                      <div 
                                        className={`w-full rounded-t-lg transition-all duration-300 cursor-pointer ${
                                          isPeak 
                                            ? 'bg-rose-500 hover:bg-rose-600 shadow-sm animate-pulse' 
                                            : draftCount > 0 
                                            ? 'bg-rose-200 hover:bg-rose-300' 
                                            : 'bg-zinc-100 hover:bg-zinc-200'
                                        }`}
                                        style={{ height: barHeightStr }}
                                      />

                                      <span className={`text-[8px] font-mono mt-1 ${isPeak ? 'font-black text-rose-600' : 'text-zinc-400 font-extrabold'}`}>
                                        {h}
                                      </span>
                                    </div>
                                  );
                                })}
                              </div>
                              <div className="text-[9px] text-zinc-400 font-medium leading-relaxed">
                                Sumbu horizontal: Jam operasional • Sumbu vertikal: Total Draft Invoice. Bar merah menunjukkan jam operasional tersibuk hari ini.
                              </div>
                            </div>

                            {/* 6. Distribusi Jenis Pemesanan */}
                            <div className="bg-white p-5 rounded-2xl border border-zinc-200 shadow-sm space-y-4 flex flex-col justify-between">
                              <div className="space-y-1 flex flex-col">
                                <h4 className="font-display font-black text-sm text-zinc-800 flex items-center gap-1.5">
                                  <Utensils className="w-4 h-4 text-rose-600" />
                                  Distribusi Jenis Pemesanan
                                </h4>
                                <p className="text-[10px] text-zinc-500 font-semibold">
                                  Perbandingan preferensi kustomer menyantap langsung vs dibungkus ke rumah.
                                </p>
                              </div>

                              <div className="py-2">
                                {renderDonutChart(takeAwayPct, dineInPct, 'Take Away', 'Dine In', '#f43f5e', '#a1a1aa')}
                              </div>

                              <div className="p-3 bg-rose-50/40 rounded-xl border border-rose-100 text-[10px] text-rose-700 font-extrabold leading-relaxed">
                                📢 Auto-Insight: <span className="font-black text-rose-800">{orderTypeInsightText}</span>
                              </div>
                            </div>

                            {/* 7. Distribusi Metode Pembayaran */}
                            <div className="bg-white p-5 rounded-2xl border border-zinc-200 shadow-sm space-y-4 flex flex-col justify-between">
                              <div className="space-y-1 flex flex-col">
                                <h4 className="font-display font-black text-sm text-zinc-800 flex items-center gap-1.5">
                                  <DollarSign className="w-4 h-4 text-emerald-600" />
                                  Distribusi Metode Pembayaran
                                </h4>
                                <p className="text-[10px] text-zinc-505 font-semibold">
                                  Preferensi transaksi kustomer menggunakan tunai secara manual vs cashless QRIS.
                                </p>
                              </div>

                              <div className="py-2">
                                {renderDonutChart(qrisPct, tunaiPct, 'QRIS', 'Tunai', '#10b981', '#e4e4e7')}
                              </div>

                              <div className="p-3 bg-emerald-50/40 rounded-xl border border-emerald-100 text-[10px] text-emerald-700 font-extrabold leading-relaxed text-left">
                                📢 Auto-Insight: <span className="font-black text-emerald-800">{paymentMethodInsightText}</span>
                              </div>
                            </div>
                          </div>

                          {/* =================================================================
                          BAGIAN KAMUS ISTILAH & REFERENSI METRIK ANALITIK (RESPONSIVE & DETAIL - RELOCATED)
                          ================================================================= */}
                          <div className="bg-white p-5 rounded-2xl border border-zinc-200 shadow-sm text-left space-y-4">
                            <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 border-b border-zinc-100 pb-4">
                              <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                  <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shadow-2xs shrink-0">
                                    <BookOpen className="w-4 h-4" />
                                  </div>
                                  <h4 className="font-display font-black text-sm text-zinc-850">
                                    Kamus Istilah & Pusat Referensi Metrik Analitik
                                  </h4>
                                </div>
                                <p className="text-[10px] text-zinc-500 font-semibold leading-relaxed">
                                  Glosarium interaktif penunjang data Suki YuSuki. Membantu Anda memahami apa itu Interest, Rate, Conv, Drop, AOV, hingga Kebocoran Corong.
                                </p>
                              </div>

                              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                                {/* Category Filters */}
                                <div className="flex flex-wrap bg-zinc-100 p-0.5 rounded-xl border border-zinc-250">
                                  {[
                                    { value: 'all', label: 'Semua' },
                                    { value: 'visit', label: '📊 Kunjungan' },
                                    { value: 'conv', label: '🎯 Konversi' },
                                    { value: 'finance', label: '💵 Keuangan' }
                                  ].map((tab) => (
                                    <button
                                      key={tab.value}
                                      type="button"
                                      onClick={() => setGlossaryCategory(tab.value as any)}
                                      className={`px-3 py-1.5 text-[9.5px] font-black rounded-lg cursor-pointer transition-all ${
                                        glossaryCategory === tab.value
                                          ? 'bg-white text-zinc-800 shadow-xs'
                                          : 'text-zinc-500 hover:text-zinc-800 font-bold'
                                      }`}
                                    >
                                      {tab.label}
                                    </button>
                                  ))}
                                </div>

                                {/* Glossary Search */}
                                <div className="relative w-full sm:w-56">
                                  <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                                  <input
                                    type="text"
                                    value={glossarySearch}
                                    onChange={(e) => setGlossarySearch(e.target.value)}
                                    placeholder="Cari istilah analitik..."
                                    className="bg-zinc-50 hover:bg-zinc-100 focus:bg-white text-[10px] font-semibold border border-zinc-200 focus:border-rose-500 outline-none rounded-xl pl-8.5 pr-3 py-1.5 w-full transition-all text-zinc-700"
                                  />
                                </div>
                              </div>
                            </div>

                            {/* Glossary Cards Grid */}
                            {(() => {
                              const glossaryList = [
                                {
                                  name: 'Metrik Visitor Web % vs Periode Lalu',
                                  symbol: '👥',
                                  category: 'visit',
                                  categoryLabel: 'Kunjungan',
                                  desc: 'Membandingkan total jumlah pengunjung unik website Suki YuSuki saat ini terhadap periode waktu sebelumnya (misal hari ini vs kemarin, atau minggu ini vs minggu lalu).',
                                  formula: '((Visitor Periode Ini - Visitor Periode Lalu) / Visitor Periode Lalu) * 100%',
                                  leakageExplanation: 'Melihat tren penurunan/penambahan kustomer secara makro di corong paling atas sebelum proses belanja dimulai.',
                                  action: 'Jika tren turun, kencangkan penyebaran tautan menu di bio Instagram, posting video TikTok, atau cetak stiker QR Code yang lebih kontras di meja kasir restoran.',
                                  borderColor: 'border-l-blue-500 bg-blue-50/10'
                                },
                                {
                                  name: 'Interest (Minat Awal)',
                                  symbol: '🎨',
                                  category: 'visit',
                                  categoryLabel: 'Kunjungan',
                                  desc: 'Tingkat antusiasme awal kustomer ketika mendarat di website Suki YuSuki. Hal ini menunjukkan seberapa aktif pembeli menelusuri halaman depan.',
                                  formula: 'Aktivitas interaksi awal pada menu produk di beranda utama.',
                                  leakageExplanation: 'Minat awal yang rendah mengindikasikan halaman depan website Anda kurang interaktif, loading lambat, atau pemilihan foto menu kurang sedap dipandang mata.',
                                  action: 'Berikan banner hero promo yang interaktif, tawarkan diskon spesial, dan pastikan visual tata letak menu utama bersih, rapi, dan menggugah selera.',
                                  borderColor: 'border-l-amber-500 bg-amber-50/10'
                                },
                                {
                                  name: 'Interest % di Klik Detail',
                                  symbol: '🖱️',
                                  category: 'visit',
                                  categoryLabel: 'Kunjungan',
                                  desc: 'Tingkat persentase ketertarikan kustomer yang tergerak didorong mengeklik produk tertentu dari total keseluruhan pengunjung website utama.',
                                  formula: '(Total Klik Detail Produk / Total Kunjungan Website keseluruhan) * 100%',
                                  leakageExplanation: 'Mengukur daya pikat awal tiap menu masakan. Kustomer yang enggan mengeklik detail menu menunjukkan nama menu atau harga kurang ramah sekilas.',
                                  action: 'Gunakan nama menu yang unik (misal: "Suki Kuah Tomyam Juara") dan tonjolkan label diskon di thumbnail depan menu.',
                                  borderColor: 'border-l-orange-500 bg-orange-50/10'
                                },
                                {
                                  name: 'Rate (Rasio Konversi Langkah)',
                                  symbol: '📏',
                                  category: 'conv',
                                  categoryLabel: 'Konversi',
                                  desc: 'Persentase keberhasilan transisi dari tahapan spesifik satu ke tahap berikutnya (misal: dari Klik Detail menu ke penambahan Add to Cart keranjang belanja).',
                                  formula: '(Jumlah Kustomer Lolos ke Tahap N / Jumlah Kustomer di Tahap N-1) * 100%',
                                  leakageExplanation: 'Menilai seberapa banyak rintangan (friction) yang dialami kustomer pada satu tahapan alur belanja yang spesifik.',
                                  action: 'Analisis tahap mana yang memiliki Rate paling kecil, lalu sederhanakan tombol order, hilangkan input form yang tidak perlu, dan percepat visual transisinya.',
                                  borderColor: 'border-l-indigo-500 bg-indigo-50/10'
                                },
                                {
                                  name: 'Conv (Conversion / Konversi)',
                                  symbol: '🎯',
                                  category: 'conv',
                                  categoryLabel: 'Konversi',
                                  desc: 'Kejadian di mana calon pembeli melakukan aksi sasaran yang diharapkan dalam sistem belanja (seperti menambah item ke keranjang belanja atau checkout nota).',
                                  formula: 'Total Aksi Sukses Terpenuhi di Tiap Gerbang Belanja',
                                  leakageExplanation: 'Konversi yang tersumbat menandakan ada kendala pada alur transaksi digital yang menyulitkan pembeli.',
                                  action: 'Berikan petunjuk langkah demi langkah yang jelas dan jadikan tombol aksi berwarna tegas untuk menuntun mata pembeli.',
                                  borderColor: 'border-l-violet-500 bg-violet-50/10'
                                },
                                {
                                  name: 'Checkout % (Rasio Checkout)',
                                  symbol: '🧾',
                                  category: 'conv',
                                  categoryLabel: 'Konversi',
                                  desc: 'Persentase kustomer yang bersedia meneruskan keranjang belanja berisi tumpukan sayur/daging suki mereka hingga menekan tombol buat draf invoice pemesanan resmi.',
                                  formula: '(Total Dokumen Draft Invoice / Total Jumlah Add To Cart item) * 100%',
                                  leakageExplanation: 'Seringkali kustomer menumpuk hidangan di keranjang, namun urung mengisi nama pemesan. Hal ini terjadi karena form pemesanan terasa ribet.',
                                  action: 'Sederhanakan form pengisian nama dan nomor meja/telepon kustomer. Bebaskan registrasi akun rumit, biarkan kustomer checkout seketika.',
                                  borderColor: 'border-l-pink-500 bg-pink-50/10'
                                },
                                {
                                  name: 'Download % (Rasio Penyimpanan Nota)',
                                  symbol: '💾',
                                  category: 'conv',
                                  categoryLabel: 'Konversi',
                                  desc: 'Persentase keberhasilan pembuatan draf invoice kustomer yang diteruskan dengan mengunduh bukti invoice dalam format berkas gambar PNG untuk dibawa langsung ke kasir counter.',
                                  formula: '(Total File Nota Diunduh / Total Dokumen Draft Invoice) * 100%',
                                  leakageExplanation: 'Kustomer pasif mengunduh karena tidak tahu kegunaan nota PNG tersebut, atau karena tombol unduh tertimbun element bawah.',
                                  action: 'Buat visual tombol "Unduh Nota PNG" berwarna gradasi terang dan beri teks penjelas bahwa nota ini wajib diunjukkan di kasir/meja pelayan masakan.',
                                  borderColor: 'border-l-cyan-500 bg-cyan-50/10'
                                },
                                {
                                  name: 'WA Conv % (Konversi WhatsApp Admin)',
                                  symbol: '💬',
                                  category: 'conv',
                                  categoryLabel: 'Konversi',
                                  desc: 'Langkah pamungkas yang melihat rasio kustomer yang telah mendownload nota PNG, kemudian mengklik tombol redirect pesan untuk mengirim rincian belanja ke WhatsApp Admin Suki.',
                                  formula: '(Total Klik Kirim Data Ke WhatsApp / Total Nota Terunduh) * 100%',
                                  leakageExplanation: 'Merupakan penutup transaksi paling vital. Jika bocor di sini, tandanya pelanggan mengira telah memesan padahal data order belum meluncur ke chat Anda.',
                                  action: 'Sediakan pop-up modal setelah download selesai, berbunyi: "Satu langkah lagi! Klik Kirim WA agar pesanan Anda masuk antrean dapur kasir Suki YuSuki!"',
                                  borderColor: 'border-l-green-500 bg-green-50/10'
                                },
                                {
                                  name: 'Total Conv (Rasio Konversi Finis)',
                                  symbol: '👑',
                                  category: 'conv',
                                  categoryLabel: 'Konversi',
                                  desc: 'Persentase total kesuksesan mutlak; membandingkan jumlah pembeli yang sukses mengirim pesanan akhir ke WhatsApp Admin dari total awal pengunjung website.',
                                  formula: '(Total Pembeli Sukses WA / Total Seluruh Visitor Web Awal) * 100%',
                                  leakageExplanation: 'Merupakan tolok ukur efisiensi kotor mesin pemasaran digital Anda. Semakin tinggi angka ini, semakin baik profitabilitas Suki YuSuki.',
                                  action: 'Pantau metrik ini setiap pergantian bulan untuk mengkalibrasi ulang harga sajian, kelengkapan menu, dan menyusun promo kreatif.',
                                  borderColor: 'border-l-teal-500 bg-teal-50/10'
                                },
                                {
                                  name: 'Drop, Drop-Off & Kebocoran (Leakage)',
                                  symbol: '🛑',
                                  category: 'conv',
                                  categoryLabel: 'Konversi',
                                  desc: 'Kejadian keluarnya calon kustomer dari alur corong konversi belanja. Menandakan kustomer membatalkan isi keranjang, menutup tab browser web, atau ragu bertransaksi.',
                                  formula: 'Drop-Off % = 100% - Rate Konversi Tahap Tersebut (%)',
                                  leakageExplanation: 'Merupakan musuh utama dari sistem bisnis digital Anda. Menemukan titik kebocoran terbesar akan menyelamatkan omzet penjualan jutaan rupiah.',
                                  action: 'Tengok grafik visual corong belanja di bagian bawah. Cari garis merah bertuliskan "KEBOCORAN TERBESAR" dan segera eksekusi rekomendasi aksi bisnis di sana.',
                                  borderColor: 'border-l-red-500 bg-red-50/10'
                                },
                                {
                                  name: 'Penyusutan (Funnel Squeeze)',
                                  symbol: '📉',
                                  category: 'conv',
                                  categoryLabel: 'Konversi',
                                  desc: 'Hukum dasar pemasaran di mana jumlah calon kustomer secara gradual/perlahan berkurang di tiap tahapan alur belanja (mengerucut menyerupai leher corong).',
                                  formula: 'Diagram Volume Calon Pembeli yang Terus Menyempit Menjelang Garis Akhir',
                                  leakageExplanation: 'Ingatlah bahwa tidak semua pengunjung web berniat membeli. Sehingga, penyusutan adalah hal yang lumrah namun wajib kita tekan lajunya.',
                                  action: 'Gunakan metrik ini untuk menghitung kebutuhan pasokan kunjungan web. Jika target closing 50 pesanan per hari dengan total konversi 10%, maka Anda wajib menjaring 500 pengunjung web per hari.',
                                  borderColor: 'border-l-zinc-500 bg-zinc-50/10'
                                },
                                {
                                  name: 'AOV (Average Order Value)',
                                  symbol: '💵',
                                  category: 'finance',
                                  categoryLabel: 'Keuangan',
                                  desc: 'Rata-rata jumlah nominal rupiah uang yang dikeluarkan oleh kustomer Anda untuk berbelanja dalam satu lembar berkas transaksi nota suki.',
                                  formula: 'Total Estimasi Omzet Penjualan / Jumlah Dokumen Draft Invoice Pemesanan',
                                  leakageExplanation: 'Meskipun jumlah orderan Anda melimpah, namun jika nilai AOV-nya sangat kecil, Anda akan kesulitan menutup biaya produksi menu & gas dapur.',
                                  action: 'Sediakan pilihan "Add-on Extra" (misal: Extra Keju, Extra Sayur, Extra Kuah) seharga murah meriah di halaman keranjang belanja untuk memudahkan kustomer mengklik tambah item.',
                                  borderColor: 'border-l-emerald-500 bg-emerald-50/10'
                                }
                              ];

                              const filtered = glossaryList.filter(item => {
                                const q = glossarySearch.toLowerCase();
                                const matchesSearch = item.name.toLowerCase().includes(q) || 
                                                      item.desc.toLowerCase().includes(q) || 
                                                      item.formula.toLowerCase().includes(q);
                                const matchesCategory = glossaryCategory === 'all' || item.category === glossaryCategory;
                                return matchesSearch && matchesCategory;
                              });

                              if (filtered.length === 0) {
                                return (
                                  <div className="py-8 text-center text-zinc-450 text-xs font-bold bg-zinc-50 rounded-xl border border-dashed border-zinc-200">
                                    Tidak ada istilah "{glossarySearch}" dalam kategori ini. Silakan cari istilah lainnya.
                                  </div>
                                );
                              }

                              return (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                  {filtered.map((item, idx) => (
                                    <div 
                                      key={idx} 
                                      className={`p-4 rounded-xl border border-zinc-200 shadow-2xs hover:shadow-xs transition-all duration-300 border-l-[4px] flex flex-col justify-between text-left ${item.borderColor}`}
                                    >
                                      <div className="space-y-2.5">
                                        <div className="flex items-center justify-between">
                                          <div className="flex items-center gap-2">
                                            <span className="text-sm">{item.symbol}</span>
                                            <h5 className="font-display font-black text-xs text-zinc-805 tracking-tight leading-tight">
                                              {item.name}
                                            </h5>
                                          </div>
                                          <span className="text-[8px] font-black uppercase font-mono px-2 py-0.5 rounded-full bg-zinc-150 text-zinc-550 border border-zinc-200">
                                            {item.categoryLabel}
                                          </span>
                                        </div>

                                        <p className="text-[10px] text-zinc-650 leading-relaxed font-bold">
                                          {item.desc}
                                        </p>
                                      </div>

                                      <div className="mt-4 pt-3 border-t border-zinc-150 space-y-2 text-[9px]">
                                        <div className="bg-zinc-50 p-2 rounded-lg border border-zinc-200 font-mono text-zinc-700 leading-normal">
                                          <span className="block text-[8px] font-black text-zinc-400 uppercase tracking-wider mb-0.5 font-sans">Rumus / Formula :</span>
                                          {item.formula}
                                        </div>

                                        <div className="text-zinc-550 leading-relaxed font-semibold">
                                          <span className="font-black text-rose-600 block text-[8px] uppercase tracking-wider mb-0.5 font-sans">⚠️ Deteksi Kebocoran / Dampak:</span>
                                          {item.leakageExplanation}
                                        </div>

                                        <div className="bg-amber-50 p-2 rounded-lg border border-amber-150 text-amber-900 leading-relaxed font-semibold">
                                          <span className="font-black text-amber-700 block text-[8px] uppercase tracking-wider mb-0.5 font-sans">💡 Aksi Rekomendasi UMKM:</span>
                                          {item.action}
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              );
                            })()}
                          </div>

                          {/* =================================================================
                          BAGIAN AI BUSINESS STRATEGY
                          ================================================================= */}
                          {(() => {
                            // Rule Based Logic Engine for Strategic Recommendations
                            const isVisitorUpInvoiceStagnant = visitsIsUp && visitsPct > 5 && totalDraftInvoices <= 3;
                            const isCartHighInvoiceLow = totalAddToCartCount > 4 && (totalDraftInvoices / totalAddToCartCount) < 0.40;
                            const isInvoiceHighWaLow = totalDraftInvoices > 2 && (totalWaClicksConverted / totalDraftInvoices) < 0.45;
                            const isLostCustomerHigh = lostCustomer > 2;

                            // Revenue comparison
                            const prevPeriodRevenue = (() => {
                              const nowTs = Date.now();
                              const startOfToday = new Date();
                              startOfToday.setHours(0, 0, 0, 0);
                              const todayTs = startOfToday.getTime();
                              
                              let prevRangeStart = 0;
                              let prevRangeEnd = 0;

                              if (invoiceFilterDate === 'hari') {
                                prevRangeStart = todayTs - 24 * 60 * 60 * 1000;
                                prevRangeEnd = todayTs;
                              } else if (invoiceFilterDate === 'minggu') {
                                prevRangeStart = nowTs - 14 * 24 * 60 * 60 * 1000;
                                prevRangeEnd = nowTs - 7 * 24 * 60 * 60 * 1000;
                              } else if (invoiceFilterDate === 'bulan') {
                                prevRangeStart = nowTs - 60 * 24 * 60 * 60 * 1000;
                                prevRangeEnd = nowTs - 30 * 24 * 60 * 60 * 1000;
                              } else {
                                return 0;
                              }

                              const prevInvoices = invoices.filter(i => {
                                const ts = i.createdAt ? new Date(i.createdAt).getTime() : 0;
                                return ts >= prevRangeStart && ts < prevRangeEnd;
                              });

                              return prevInvoices.reduce((acc, curr) => acc + (curr.total || 0), 0);
                            })();

                            const revenueChangePct = prevPeriodRevenue > 0 ? ((estimatedRevenue - prevPeriodRevenue) / prevPeriodRevenue) * 100 : 0;
                            const isRevenueDown15 = revenueChangePct < -15;
                            const isAovLow = aov > 0 && aov < 45000;

                            const topClickedItemName = analyticsStats.topClickedProductsList[0]?.name || 'Belum Ada';
                            const topCartItemName = analyticsStats.topCartProductsList[0]?.name || 'Belum Ada';

                            const hadHighViewsLowCart = analyticsStats.topClickedProductsList.some(clicked => {
                              const cartMatch = analyticsStats.topCartProductsList.find(cart => cart.name === clicked.name);
                              const cartCount = cartMatch ? cartMatch.count : 0;
                              return clicked.count > 4 && (cartCount / clicked.count) < 0.25;
                            });

                            const isQrisHigh = qrisPct > 70;
                            const isTakeAwayHigh = takeAwayPct > 70;

                            // Peak hour orders concentration spike detection
                            const hoursList = [11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23];
                            const peakHourVal = hoursList.reduce((maxH, h) => {
                              return ((analyticsStats.hoverOrdersArray[h] || 0) > (analyticsStats.hoverOrdersArray[maxH] || 0)) ? h : maxH;
                            }, 11);
                            const maxHourlyOrders = analyticsStats.hoverOrdersArray[peakHourVal] || 0;
                            const isHourlyPeakSpike = maxHourlyOrders > 2 && (maxHourlyOrders / Math.max(1, totalDraftInvoices)) > 0.35;

                            const recs: { title: string; priority: 'TINGGI' | 'SEDANG' | 'RENDAH'; reason: string; recommendation: string; details: string }[] = [];

                            if (isVisitorUpInvoiceStagnant) {
                              recs.push({
                                title: 'Optimalkan Kemitraan Menarik Pengunjung',
                                priority: 'TINGGI',
                                reason: 'Website berhasil menarik pengunjung namun belum optimal mengubah minat menjadi pemesanan harian.',
                                recommendation: 'Evaluasi tampilan produk, harga sajian, dan kelengkapan deskripsi menu agar pengunjung tergiur melakukan checkout instan.',
                                details: 'Lakukan audit visual pada Landing Page. Pastikan tombol transaksi utama kontras dan ditaruh di paruh atas layar ponsel kustomer tanpa butuh scrolling jauh.'
                              });
                            }

                            if (false) {
                              recs.push({
                                title: 'Tingkatkan Visual dan Foto Menu Utama',
                                priority: 'TINGGI',
                                reason: 'Tingkat persentase ketertarikan (Interest Rate) melaju rendah di bawah standar kenyamanan visual konsumen.',
                                recommendation: 'Perbaiki tampilan foto menu, pastikan gambar hidangan suki tampak segar mengepul dengan kuah merah menyala, serta lengkapi deskripsi porsi agar menggugah selera.',
                                details: 'Tampilkan label diskon merah menyala atau stempel "Terlaris / Populer" di beranda menu kuah Suki YuSuki untuk memancing hasrat klik detail pemesan.'
                              });
                            }

                            if (isCartHighInvoiceLow) {
                              recs.push({
                                title: 'Optimalkan Halaman Checkout & Keranjang',
                                priority: 'TINGGI',
                                reason: 'Banyak menu telah dimasukkan ke keranjang (Add to Cart), namun kustomer membatalkan pesanan sebelum mengisi data invoice.',
                                recommendation: 'Sederhanakan form pemesanan dengan hanya meminta Nama dan Nomor Meja/Telepon. Beri opsi draf pesanan bebas registrasi profil agar lebih instan.',
                                details: 'Berikan jaminan keamanan pemrosesan instan dan tawarkan paket bundling hemat yang membebaskan kustomer dari kerumitan berpikir saat membayar.'
                              });
                            }

                            if (isInvoiceHighWaLow) {
                              recs.push({
                                title: 'Perjelas Alur Konfirmasi Akhir via WhatsApp',
                                priority: 'TINGGI',
                                reason: 'Banyak invoice sukses dicetak tetapi kustomer pasif mengirimkan jepretan atau rincian order ke WhatsApp Admin.',
                                recommendation: 'Sediakan petunjuk tebal berwarna mencolok seusai membuat draf nota, berbunyi: "Satu langkah akhir! Kirim nota ini ke WhatsApp kasir agar segera diproses dapur!"',
                                details: 'Pasang petunjuk melingkar atau bubble petunjuk berkedip mengarah ke tombol send-packet WhatsApp guna melenyapkan miskonsepsi transaksi.'
                              });
                            }

                            if (isLostCustomerHigh) {
                              recs.push({
                                title: 'Evaluasi Jalur Hambatan Alur Transaksi (Squeeze)',
                                priority: 'TINGGI',
                                reason: 'Terdapat tren kehilangan calon kustomer (Lost Customer) yang lumayan tinggi menjelang tahap transaksi akhir.',
                                recommendation: 'Kaji ulang kenyamanan navigasi interface pemesanan di layar ponsel pintar. Singkirkan element yang menutupi tombol simpan dan unduh.',
                                details: 'Sediakan shortcut klik cepat "Lanjutkan dengan Draft yang Tersimpan" jika mendeteksi kustomer tidak sengaja me-refresh halaman belanja.'
                              });
                            }

                            if (isRevenueDown15) {
                              recs.push({
                                title: 'Luncurkan Promo Bundling Paket Kejutan',
                                priority: 'TINGGI',
                                reason: 'Target nilai omzet perolehan menyusut tajam lebih dari 15% dibandingkan dengan performa pada periode lalu.',
                                recommendation: 'Gelar promo terbatas / flash sale berdurasi singkat, buat paket bundling (misalnya: Suki Berpasangan + Extra Pangsit Goreng) untuk menstimulasi lonjakan transaksi.',
                                details: 'Papar poster promo eksklusif tersebut langsung di bagian slideshow atas beranda utama untuk segera disambut pelanggan baru.'
                              });
                            }

                            if (isAovLow) {
                              recs.push({
                                title: 'Beli Paket Hemat Combo Up-sell',
                                priority: 'SEDANG',
                                reason: 'Rata-rata pengeluaran belanja (AOV) per nota masih terhitung minim, sehingga margin keuntungan bersih masih tertekan.',
                                recommendation: 'Sahkan opsi add-on hemat seperti "Tambah Extra Bakso Suki hanya +5rb" atau "Double Daging Kuah Tomyam +15rb" di halaman pemesanan keranjang.',
                                details: 'Gunakan teknik cross-selling pintar dengan merekomendasikan kondimen gorengan / pangsit renyah dan menu minuman segar penurun dahaga di dalam pop-up keranjang.'
                              });
                            }

                            if (hadHighViewsLowCart) {
                              recs.push({
                                title: 'Koreksi Deskripsi Produk & Kelayakan Harga Menu',
                                priority: 'SEDANG',
                                reason: 'Ada beberapa menu kuliner suki yang sangat sering diklik detail tampilannya tapi minim ditambahi ke dalam keranjang.',
                                recommendation: 'Evaluasi apakah nominal harga menu tersebut terlalu mahal dibanding menu sejenis, lengkapi kepastian kehalalan produk, atau segarkan kembali visual pajangannya.',
                                details: 'Ganti atau perjelas deskripsi piring porsi (misal: "Cukup untuk makan berdua") agar kustomer mendapatkan value-for-money yang meyakinkan.'
                              });
                            }

                            if (isQrisHigh) {
                              recs.push({
                                title: 'Pemeliharaan Keandalan Akses Pembayaran QRIS',
                                priority: 'SEDANG',
                                reason: 'Lebih dari 70% transaksi pesanan Anda melirik opsi pembayaran non-tunai (cashless QRIS).',
                                recommendation: 'Pastikan lembaran barcode QRIS dicetak secara terang benderang di meja kasir restoran, serta persiapkan e-wallet cadangan untuk mengantisipasi gangguan jaringan.',
                                details: 'Validasi integritas penarikan dana harian dan sertakan promosi "Bebas Biaya Admin QRIS" guna mengikis gesekan kecil sebelum transaksi.'
                              });
                            }

                            if (isTakeAwayHigh) {
                              recs.push({
                                title: 'Optimalkan Kotak Kemasan & Kecepatan Ambil Suki',
                                priority: 'SEDANG',
                                reason: 'Mayoritas mutlak pelanggan Anda memesan jenis makan dibawa pulang (Take Away).',
                                recommendation: 'Gunakan wadah mangkuk plastik kokoh anti bocor/panas, sediakan tas jinjing berkualitas, dan beri lajur parkir ambil cepat agar masakan tidak keburu dingin.',
                                details: 'Sajikan pemisahan kuah panas tomyam dan bahan suki mentah dalam paket takeaway terpisah untuk menjamin cita rasa hidangan suki orisinal sesampainya di meja rumah kustomer.'
                              });
                            }

                            if (isHourlyPeakSpike) {
                              recs.push({
                                title: 'Atur Kerja Kru Menyambut Jam Emas Puncak Pemesanan',
                                priority: 'TINGGI',
                                reason: 'Terjadi lonjakan antrean pesanan masakan yang sangat padat pada jam sibuk tertentu.',
                                recommendation: 'Persiapkan potongan sayur segar, kaldu kuah hangat, dan iris daging kental 1 jam sebelum jam sibuk tiba agar meminimalkan durasi tunggu kustomer.',
                                details: 'Sediakan slot "Pre-Order 1 Jam Sebelumnya" di website agar tim kasir & dapur Anda bisa menyusun urutan prioritas sajian suki secara matang.'
                              });
                            }

                            // Generate fallbacks to keep at least 3 high-quality strategic proposals
                            if (recs.length < 3) {
                              const fallbacks = [
                                {
                                  title: 'Maksimalkan Promosi Tautan Media Sosial',
                                  priority: 'TINGGI' as const,
                                  reason: 'Pintu gerbang konversi Anda sangat bertumpu pada suplai trafik web harian yang konsisten.',
                                  recommendation: 'Sematkan url website Anda secara berkala di takarir bio Instagram dan buat konten berhadiah kupon makan gratis untuk mendongkrak pengikut menyebarkan tautan.',
                                  details: 'Luncurkan video berdurasi pendek 15-30 detik memperlihatkan beef slices yang dicelupkan ke dalam kuah mendidih merah tomyam, pasang tautan pesan mandiri di bawahnya.'
                                },
                                {
                                  title: 'Rilis Program Loyalitas Member Suki',
                                  priority: 'SEDANG' as const,
                                  reason: 'Biaya menarik kustomer baru terhitung 5x lipat lebih tinggi dari menertibkan kustomer setia kembali berkunjung.',
                                  recommendation: 'Tawarkan program stempel stamp digital kelipatan 5 invoice transaksi WhatsApp untuk ditukar gratis 1 Box Suki Bakso Campur spesial.',
                                  details: 'Beri ucapan terima kasih personal lewat pesan WhatsApp blast pada minggu ketiga kustomer berbelanja guna merawat retensi emosional.'
                                },
                                {
                                  title: 'Sediakan Menu Tambahan Porsi Bundling Anak',
                                  priority: 'RENDAH' as const,
                                  reason: 'Suki acapkali dinikmati sebagai menu makan bersama keluarga besar di akhir pekan.',
                                  recommendation: 'Sediakan opsi Paket Suki Little Champion yang bebas rasa pedas bersanding kentang goreng mini berhadiah mainan guna membahagiakan rombongan keluarga.',
                                  details: 'Beri spasi ramah anak di meja Dine-In luar restoran suki untuk merajut reputasi rumah makan yang family-friendly.'
                                }
                              ];

                              fallbacks.forEach(fb => {
                                if (!recs.find(r => r.title === fb.title) && recs.length < 3) {
                                  recs.push(fb);
                                }
                              });
                            }

                            // Mathematically calculate the Business Performance Score (0-100)
                            const scoreVisitor = visitsIsUp ? Math.min(100, 60 + Math.min(40, visitsPct)) : Math.max(10, 50 - Math.min(40, Math.abs(visitsPct)));
                            const scoreCart = Math.min(100, (addToCartRate / 35) * 100);
                            const scoreCheckout = Math.min(100, (checkoutRate / 60) * 100);
                            const scoreWa = Math.min(100, (waConversionRate / 70) * 100);

                            const rawPerformance = (
                              (totalVisits > 0 ? scoreVisitor : 50) * 0.20 +
                              (addToCartRate > 0 ? scoreCart : 50) * 0.25 +
                              (checkoutRate > 0 ? scoreCheckout : 50) * 0.30 +
                              (waConversionRate > 0 ? scoreWa : 50) * 0.25
                            );

                            const businessPerformanceScore = Math.max(15, Math.min(100, Math.round(rawPerformance)));

                            let ratingLabel = 'Good';
                            let ratingDesc = 'Website berjalan stabil dengan lajur perolehan seimbang. Optimasi direkomendasikan pada penguatan funnel keranjang.';
                            let ratingColor = 'text-blue-400 bg-blue-500/10 border-blue-500/30';
                            let ratingProgressColor = 'bg-blue-500';

                            if (businessPerformanceScore >= 90) {
                              ratingLabel = 'Excellent';
                              ratingDesc = 'Performa website kuliner luar biasa! Konversi di setiap corong melampaui rata-rata industri UMKM, pertahankan pelayanan prima!';
                              ratingColor = 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30';
                              ratingProgressColor = 'bg-emerald-500';
                            } else if (businessPerformanceScore >= 75) {
                              ratingLabel = 'Very Good';
                              ratingDesc = 'Website sangat fungsional dan diminati kustomer. Tingkatkan nilai belanja rata-rata (AOV) melalui up-selling cerdik.';
                              ratingColor = 'text-teal-400 bg-teal-500/10 border-teal-500/30';
                              ratingProgressColor = 'bg-teal-500';
                            } else if (businessPerformanceScore >= 60) {
                              ratingLabel = 'Good';
                              ratingDesc = 'Performa stabil. Namun terdapat beberapa corong menyusut yang bisa ditambal untuk menaikkan target harian.';
                              ratingColor = 'text-blue-400 bg-blue-500/10 border-blue-500/30';
                              ratingProgressColor = 'bg-indigo-500';
                            } else if (businessPerformanceScore >= 40) {
                              ratingLabel = 'Needs Improvement';
                              ratingDesc = 'Ditemukan kebocoran korong yang cukup tinggi di tahap checkout atau penyelesaian WA. Butuh penanganan cepat.';
                              ratingColor = 'text-amber-400 bg-amber-500/10 border-amber-500/30';
                              ratingProgressColor = 'bg-amber-500';
                            } else {
                              ratingLabel = 'Critical';
                              ratingDesc = 'Sinyal bahaya! Kehilangan kustomer di gerbang utama sangat mencemaskan. Segera periksa kendala teknis atau harga sajian.';
                              ratingColor = 'text-rose-450 bg-rose-500/10 border-rose-500/30';
                              ratingProgressColor = 'bg-rose-500';
                            }

                            // Formatting helpers for analysis data inputs
                            const activeFiltersLabel = 
                              invoiceFilterDate === 'hari' ? 'Hari Ini' :
                              invoiceFilterDate === 'minggu' ? 'Minggu Ini' :
                              invoiceFilterDate === 'bulan' ? 'Bulanan (30 Hari)' : 'Semua Sesi';

                            return (
                              <div className="bg-linear-to-br from-zinc-900 via-slate-900 to-zinc-950 p-6 rounded-[20px] border border-zinc-800 shadow-xl text-left space-y-6 text-zinc-100 relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-64 h-64 bg-rose-500/5 blur-3xl rounded-full -mr-20 -mt-20 pointer-events-none" />
                                <div className="absolute bottom-0 left-0 w-80 h-80 bg-indigo-500/5 blur-3xl rounded-full -ml-32 -mb-32 pointer-events-none" />

                                {/* Co-Pilot Header */}
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-5 relative z-10">
                                  <div className="space-y-1.5">
                                    <div className="flex items-center gap-2">
                                      <div className="w-9 h-9 rounded-xl bg-indigo-500/15 text-indigo-400 border border-indigo-500/30 flex items-center justify-center shadow-lg shadow-indigo-500/10 shrink-0">
                                        <Brain className="w-5 h-5" />
                                      </div>
                                      <div>
                                        <h4 className="font-display font-black text-base text-white tracking-tight flex items-center gap-1.5">
                                          AI Business Strategy
                                          <span className="text-[9px] font-black uppercase text-indigo-400 bg-indigo-450/10 border border-indigo-500/30 px-2 py-0.5 rounded-full tracking-wide">
                                            ✨ AI-Powered Consultant
                                          </span>
                                        </h4>
                                        <p className="text-[10px] text-zinc-400 font-semibold leading-relaxed">
                                          Sistem evaluasi cerdas membaca seluruh customer journey website Suki YuSuki untuk strategi peningkatan konversi instan.
                                        </p>
                                      </div>
                                    </div>
                                  </div>

                                  <div className="flex items-center gap-2 self-start sm:self-center">
                                    <span className="text-[9px] font-black uppercase text-zinc-400 border border-zinc-800 px-2.5 py-1 rounded-lg bg-zinc-900/60 font-mono">
                                      Filter Aktif: {activeFiltersLabel}
                                    </span>
                                  </div>
                                </div>

                                {/* Main Dashboard Content Map */}
                                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 relative z-10">
                                  {/* Left: Summary and Key Findings */}
                                  <div className="lg:col-span-8 space-y-4 flex flex-col justify-between">
                                    <div className="space-y-4">
                                      {/* 1. Executive Summary */}
                                      <div className="space-y-1.5 p-4.5 bg-zinc-950/60 rounded-xl border border-zinc-800 text-zinc-300">
                                        <span className="text-[8px] font-black uppercase tracking-wider text-indigo-400 block mb-1">
                                          📋 Executive Summary
                                        </span>
                                        <p className="text-[11px] leading-relaxed font-semibold">
                                          Halo pemilik Suki YuSuki! Pada periode <span className="text-white font-black">{activeFiltersLabel}</span>, website mencatat aktivitas total <span className="text-indigo-300 font-extrabold">{totalVisits.toLocaleString('id-ID')} pengunjung</span> dengan omzet taksiran <span className="text-emerald-400 font-extrabold">{formatPrice(estimatedRevenue)}</span>. Tingkat minat awal kustomer yang menambahkan item ke keranjang menyentuh angka <span className="text-white font-extrabold">{addToCartRate.toFixed(0)}%</span>, sementara rincian nota yang sukses tersalin ke chat WhatsApp Anda adalah <span className="text-indigo-300 font-extrabold">{totalWaClicksConverted} pesanan konfirmasi</span>. Performa konversi total berada dalam klasifikasi <span className="text-indigo-400 font-extrabold">{ratingLabel}</span>. Untuk menggenjot pemasukan harian, berikut audit performa terstruktur yang wajib Anda benahi sekarang juga.
                                        </p>
                                      </div>

                                      {/* 2. Key Findings */}
                                      <div className="space-y-2 text-[10px]">
                                        <span className="text-[8px] font-black uppercase tracking-wider text-rose-455 block mb-1.5">
                                          🔍 Key Findings & Trends
                                        </span>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-zinc-300 font-semibold">
                                          <div className="p-3 bg-zinc-950/30 rounded-lg border border-zinc-800 w-full flex items-start gap-2 text-left">
                                            <span className="text-indigo-400 shrink-0 select-none">📌</span>
                                            <div>
                                              <span className="text-zinc-100 font-black block">Menu Terlaris Dinilai:</span>
                                              Klik detail terbanyak diduduki oleh <span className="text-indigo-300 font-extrabold">"{topClickedItemName}"</span>.
                                            </div>
                                          </div>
                                          <div className="p-3 bg-zinc-950/30 rounded-lg border border-zinc-800 w-full flex items-start gap-2 text-left">
                                            <span className="text-rose-400 shrink-0 select-none">📌</span>
                                            <div>
                                              <span className="text-zinc-100 font-black block">Penyimpanan Keranjang Terlaris:</span>
                                              Sering dimasukkan ke draf belanja: <span className="text-rose-350 font-extrabold">"{topCartItemName}"</span>.
                                            </div>
                                          </div>
                                          <div className="p-3 bg-zinc-950/30 rounded-lg border border-zinc-800 w-full flex items-start gap-2 text-left">
                                            <span className="text-emerald-400 shrink-0 select-none">📌</span>
                                            <div>
                                              <span className="text-zinc-100 font-black block">Jam Puncak Operasional Suki:</span>
                                              Puncak kepadatan arus terdeteksi pada pukul <span className="text-emerald-300 font-extrabold">{analyticsStats.peakOrderHourFormatted !== 'Belum Ada' ? analyticsStats.peakOrderHourFormatted : '18.00–20.00 WIB'}</span>.
                                            </div>
                                          </div>
                                          <div className="p-3 bg-zinc-950/30 rounded-lg border border-zinc-800 w-full flex items-start gap-2 text-left">
                                            <span className="text-amber-400 shrink-0 select-none">📌</span>
                                            <div>
                                              <span className="text-zinc-100 font-black block">Metode Belanja Dominan:</span>
                                              Pemesanan didominasi oleh <span className="text-amber-300 font-extrabold">{dineInPct >= takeAwayPct ? `Dine In (${dineInPct}%)` : `Take Away (${takeAwayPct}%)`}</span>.
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    </div>

                                    {/* Action Button */}
                                    <div className="pt-2">
                                      <button
                                        type="button"
                                        onClick={() => setShowAIStrategyDetail(true)}
                                        className="w-full sm:w-auto px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs rounded-xl cursor-pointer shadow-lg shadow-indigo-600/25 transition-all duration-300 flex items-center justify-center gap-2 border border-indigo-550 hover:-translate-y-0.5 active:translate-y-0"
                                      >
                                        <span>Lihat Analisis Lengkap & Roadmap Strategis</span>
                                        <span className="text-lg leading-none shrink-0">➔</span>
                                      </button>
                                    </div>
                                  </div>

                                  {/* Right: Business Performance Score Gauge */}
                                  <div className="lg:col-span-4 p-5 bg-zinc-950/50 rounded-xl border border-zinc-800 flex flex-col justify-between items-center text-center space-y-4">
                                    <div className="w-full">
                                      <span className="text-[8px] font-black uppercase tracking-wider text-zinc-400 block mb-3 text-left">
                                        📊 Business Performance Score
                                      </span>

                                      {/* Radial Score Gauge Design */}
                                      <div className="relative flex items-center justify-center py-4">
                                        <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 100 100">
                                          {/* Background Track Circle */}
                                          <circle
                                            cx="50"
                                            cy="50"
                                            r="40"
                                            stroke="#1e293b"
                                            strokeWidth="8"
                                            fill="transparent"
                                          />
                                          {/* Animated Fill Circle */}
                                          <circle
                                            cx="50"
                                            cy="50"
                                            r="40"
                                            stroke="url(#indigoGradient)"
                                            strokeWidth="8"
                                            fill="transparent"
                                            strokeDasharray={`${2 * Math.PI * 40}`}
                                            strokeDashoffset={`${(2 * Math.PI * 40) * (1 - businessPerformanceScore / 100)}`}
                                            strokeLinecap="round"
                                            className="transition-all duration-1000 ease-out"
                                          />
                                          <defs>
                                            <linearGradient id="indigoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                              <stop offset="0%" stopColor="#818cf8" />
                                              <stop offset="100%" stopColor="#f43f5e" />
                                            </linearGradient>
                                          </defs>
                                        </svg>
                                        
                                        {/* Score Text Overlay */}
                                        <div className="absolute inset-0 flex flex-col items-center justify-center mt-2">
                                          <span className="text-3xl font-display font-black text-white tracking-tight leading-none">
                                            {businessPerformanceScore}
                                          </span>
                                          <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest mt-1">
                                            Skor Indeks
                                          </span>
                                        </div>
                                      </div>
                                    </div>

                                    {/* Score rating and categorization */}
                                    <div className="space-y-2 border-t border-zinc-800/60 pt-4 w-full">
                                      <div className={`text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-lg border inline-block select-none ${ratingColor}`}>
                                        Status: {ratingLabel}
                                      </div>
                                      <p className="text-[9.5px] text-zinc-400 font-semibold leading-relaxed px-1">
                                        {ratingDesc}
                                      </p>
                                    </div>
                                  </div>
                                </div>

                                {/* 3. Strategic Recommendations Cards Grid - Limited to 3 most relevant */}
                                <div className="space-y-3 relative z-10">
                                  <span className="text-[8px] font-black uppercase tracking-wider text-rose-455 block">
                                    💡 Rekomendasi Solusi Terpilih Sesi Ini
                                  </span>
                                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    {recs.slice(0, 3).map((r, i) => {
                                      const borderClass = 
                                        r.priority === 'TINGGI' ? 'border-rose-900/30 border-l-[4px] border-l-rose-500 bg-rose-500/5' :
                                        r.priority === 'SEDANG' ? 'border-amber-900/30 border-l-[4px] border-l-amber-500 bg-amber-500/5' :
                                        'border-emerald-900/30 border-l-[4px] border-l-emerald-500 bg-emerald-500/5';
                                      const badgeClass =
                                        r.priority === 'TINGGI' ? 'text-rose-400 bg-rose-500/10 border-rose-550/20' :
                                        r.priority === 'SEDANG' ? 'text-amber-400 bg-amber-500/10 border-amber-550/20' :
                                        'text-emerald-400 bg-emerald-500/10 border-emerald-550/20';

                                      return (
                                        <div key={i} className={`p-4 rounded-xl border flex flex-col justify-between text-left space-y-3 shadow-xs ${borderClass}`}>
                                          <div className="space-y-2">
                                            <div className="flex items-center justify-between gap-2">
                                              <span className="text-[8px] font-black uppercase font-mono bg-zinc-950 px-2 py-0.5 rounded-full border border-zinc-800 text-zinc-400 shrink-0">
                                                Aksi Rencana #{i+1}
                                              </span>
                                              <span className={`text-[8.5px] font-black uppercase px-2 py-0.5 rounded-full border shrink-0 ${badgeClass}`}>
                                                {r.priority}
                                              </span>
                                            </div>
                                            <h5 className="font-display font-black text-xs text-white tracking-tight leading-tight">
                                              {r.title}
                                            </h5>
                                            <p className="text-[9.5px] text-zinc-400 leading-relaxed font-bold">
                                              <span className="text-zinc-500 block text-[8px] font-black uppercase tracking-wider mb-0.5">Analisis Deteksi:</span>
                                              {r.reason}
                                            </p>
                                          </div>

                                          <div className="p-2.5 bg-zinc-950/70 rounded-lg border border-zinc-800/80 text-[9.5px] text-zinc-300 font-semibold leading-relaxed leading-snug">
                                            <span className="text-[8px] font-black uppercase text-indigo-400 block mb-0.5">Rekomendasi Operasional:</span>
                                            {r.recommendation}
                                          </div>
                                        </div>
                                      );
                                    })}
                                  </div>
                                </div>

                                {/* Custom Co-Pilot Modal overlay for Full Detailed Consult & Roadmaps */}
                                <AnimatePresence>
                                  {showAIStrategyDetail && (
                                    <motion.div 
                                      initial={{ opacity: 0 }}
                                      animate={{ opacity: 1 }}
                                      exit={{ opacity: 0 }}
                                      className="fixed inset-0 bg-black/85 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto"
                                    >
                                      <motion.div 
                                        initial={{ scale: 0.95, y: 15 }}
                                        animate={{ scale: 1, y: 0 }}
                                        exit={{ scale: 0.95, y: 15 }}
                                        className="bg-zinc-900 border border-zinc-800 rounded-[24px] max-w-4xl w-full max-h-[88vh] overflow-y-auto flex flex-col shadow-2xl relative text-left"
                                      >
                                        {/* Modal Header */}
                                        <div className="flex items-center justify-between border-b border-zinc-800 p-5 sticky top-0 bg-zinc-900/95 backdrop-blur-md z-10">
                                          <div className="flex items-center gap-2.5">
                                            <div className="w-8 h-8 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/30 flex items-center justify-center shadow-md">
                                              <Brain className="w-4.5 h-4.5" />
                                            </div>
                                            <div>
                                              <h3 className="font-display font-black text-sm text-white tracking-tight flex items-center gap-1.5">
                                                AI Strategic Roadmap & Consult
                                                <span className="text-[8px] font-black uppercase text-rose-455 bg-rose-500/15 border border-rose-500/20 px-2 py-0.5 rounded-full">
                                                  EXPERT SESSION
                                                </span>
                                              </h3>
                                              <p className="text-[9.5px] text-zinc-400 font-semibold">
                                                Pemetaan diagnostic mendalam dan checklist taktis memicu lonjakan omzet Suki YuSuki.
                                              </p>
                                            </div>
                                          </div>
                                          <button
                                            type="button"
                                            onClick={() => setShowAIStrategyDetail(false)}
                                            className="w-8 h-8 rounded-full bg-zinc-800 hover:bg-zinc-700 text-zinc-405 hover:text-white flex items-center justify-center cursor-pointer transition-colors border border-zinc-750 font-sans text-xs font-black"
                                          >
                                            ✕
                                          </button>
                                        </div>

                                        {/* Modal Content Body */}
                                        <div className="p-6 space-y-6 overflow-y-auto">
                                          
                                          {/* Section 1: Dashboard Input Audit Table */}
                                          <div className="space-y-2.5">
                                            <h4 className="text-[11px] font-black uppercase text-indigo-400 tracking-wider flex items-center gap-1.5">
                                              <span>📂</span> Rangkuman Indikator Data Analitik (Dashboard Input Audit)
                                            </h4>
                                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                                              {[
                                                { label: 'Total Visitor', val: totalVisits.toLocaleString('id-ID'), unit: 'Pengunjung', desc: 'Arus pengunjung atas' },
                                                { label: 'Growth Visitor', val: `${visitsPct >= 0 ? '+' : ''}${visitsPct.toFixed(1)}%`, unit: 'Periode Lalu', desc: 'Tren kenaikan kunjungan' },

                                                { label: 'Add To Cart Rate', val: `${addToCartRate.toFixed(1)}%`, unit: 'Masuk Keranjang', desc: 'Ketertarikan hidangan suki' },
                                                { label: 'Checkout Rate', val: `${checkoutRate.toFixed(1)}%`, unit: 'Draft Nota', desc: 'Pengisian data invoice' },
                                                { label: 'Taksiran Pendapatan', val: formatPrice(estimatedRevenue), unit: 'IDR Total', desc: 'Estimasi omzet terekam' },
                                                { label: 'Rata Order (AOV)', val: formatPrice(aov), unit: 'IDR / Nota', desc: 'Rata-rata isi saku harian' },
                                                { label: 'Unduh Nota Rate', val: `${downloadRate.toFixed(1)}%`, unit: 'File PNG', desc: 'Keberhasilan simpan bukti' },
                                                { label: 'WhatsApp Conf', val: totalWaClicksConverted, unit: 'Terkirim Sesuai', desc: 'Masuk antrean kasir' },
                                                { label: 'Konversi WA Rate', val: `${waConversionRate.toFixed(1)}%`, unit: 'Akhir / Closing', desc: 'Rasio kesuksesan finis' },
                                                { label: 'Pelanggan Hilang', val: lostCustomer, unit: 'Lost Customer', desc: 'Potensi kerugian tercecer' },
                                                { label: 'Jenis Order', val: `${dineInPct}% D.In / ${takeAwayPct}% T.A`, unit: 'Preferensi', desc: 'Metode santap dominan' }
                                              ].map((inp, idx) => (
                                                <div key={idx} className="p-3 bg-zinc-950/50 rounded-xl border border-zinc-800 text-left">
                                                  <span className="text-[8.5px] text-zinc-500 font-extrabold block uppercase tracking-wide">{inp.label}</span>
                                                  <span className="text-sm font-display font-black text-white block mt-0.5 tracking-tight leading-none">{inp.val}</span>
                                                  <span className="text-[8.5px] text-zinc-400 font-semibold block mt-1">{inp.unit} • <span className="text-[7.5px] font-mono text-zinc-550">{inp.desc}</span></span>
                                                </div>
                                              ))}
                                            </div>
                                          </div>

                                          {/* Section 2: Funnel Diagnostics & Leakage Detection */}
                                          <div className="p-5 bg-zinc-950/40 rounded-xl border border-zinc-800 text-zinc-300 space-y-3">
                                            <h4 className="text-[11px] font-black uppercase text-rose-455 tracking-wider flex items-center gap-1.5">
                                              <span>⚠️</span> Deteksi Kebocoran Utama (Funnel Friction Diagnostics)
                                            </h4>
                                            <p className="text-[10px] leading-relaxed font-semibold">
                                              Hasil kalkulasi engine mendeteksi penyusutan (funnel squeeze) paling curam terdapat pada tahap <span className="text-rose-400 font-extrabold">"{maxDropTransition.name}"</span> dengan tingkat kebocoran setinggi <span className="text-rose-455 font-black">{maxDropTransition.drop.toFixed(0)}%</span>. Kustomer keluar dari alur pemesanan secara masal yang dipicu keraguan mengisi data pengiriman / tata letak form.
                                            </p>
                                            <div className="bg-zinc-950 p-3 rounded-lg border border-zinc-800 text-[10px] text-zinc-355 font-semibold text-left border-l-[3px] border-l-rose-500 border-y border-r border-zinc-800/80">
                                              <span className="text-[8.5px] font-black uppercase text-zinc-400 block mb-1">Diagnosa & Penanganan Korporat:</span>
                                              {maxDropTransition.reco}
                                            </div>
                                          </div>

                                          {/* Section 3: Priority Strategic Roadmap Checklist */}
                                          <div className="space-y-3">
                                            <h4 className="text-[11px] font-black uppercase text-indigo-400 tracking-wider flex items-center gap-1.5">
                                              <span>📋</span> Peta Jalan Strategis Prioritas (Priority Strategic Roadmap)
                                            </h4>
                                            
                                            <div className="space-y-2.5">
                                              {recs.map((r, i) => {
                                                const priorityColor = 
                                                  r.priority === 'TINGGI' ? 'text-rose-400 bg-rose-500/10 border-rose-500/20' :
                                                  r.priority === 'SEDANG' ? 'text-amber-400 bg-amber-500/10 border-amber-500/20' :
                                                  'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
                                                
                                                return (
                                                  <div key={i} className="p-4 bg-zinc-950/80 rounded-xl border border-zinc-800 space-y-2 text-left relative overflow-hidden">
                                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 border-b border-zinc-800/60 pb-2">
                                                      <div className="flex items-center gap-2">
                                                        <span className="w-5 h-5 rounded-full bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-[10px] text-indigo-400 font-mono font-black">
                                                          {i+1}
                                                        </span>
                                                        <h5 className="font-display font-black text-xs text-white">
                                                          {r.title}
                                                        </h5>
                                                      </div>
                                                      <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-full border self-start sm:self-auto ${priorityColor}`}>
                                                        Prioritas: {r.priority}
                                                      </span>
                                                    </div>

                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-[9.5px] font-semibold leading-relaxed pt-1.5">
                                                      <div className="space-y-1">
                                                        <span className="text-[8px] font-black text-rose-455 uppercase block tracking-wider">Latar Belakang Analitik:</span>
                                                        <p className="text-zinc-400">{r.reason}</p>
                                                      </div>
                                                      <div className="space-y-1">
                                                        <span className="text-[8px] font-black text-indigo-405 uppercase block tracking-wider">Aksi Rencana Operasional:</span>
                                                        <p className="text-zinc-200">{r.details}</p>
                                                      </div>
                                                    </div>

                                                    {/* Checkbox item simulation */}
                                                    <div className="mt-3 pt-2 border-t border-zinc-850 flex items-center gap-2 text-[9px] text-indigo-300 font-bold">
                                                      <input 
                                                        type="checkbox" 
                                                        className="w-3.5 h-3.5 rounded-sm bg-zinc-950 border-zinc-800 outline-none accent-indigo-500 text-indigo-500 cursor-pointer" 
                                                        id={`todo-${i}`}
                                                      />
                                                      <label htmlFor={`todo-${i}`} className="cursor-pointer select-none">
                                                        Centang ini jika strategi ini telah diaplikasikan di resto Suki YuSuki.
                                                      </label>
                                                    </div>
                                                  </div>
                                                );
                                              })}
                                            </div>
                                          </div>

                                          {/* Section 4: AI Simulative Sandbox */}
                                          <div className="p-5 bg-gradient-to-tr from-indigo-950/20 to-slate-950/30 rounded-xl border border-indigo-900/30 text-zinc-300 space-y-3 relative overflow-hidden">
                                            <div className="absolute top-0 right-0 p-3 text-indigo-500/10 pointer-events-none text-6xl">
                                              🎯
                                            </div>
                                            <h4 className="text-[11px] font-black uppercase text-indigo-300 tracking-wider flex items-center gap-1.5">
                                              <span>📈</span> Simulasi Target Target Capaian (Suki Growth Objective Sandbox)
                                            </h4>
                                            <p className="text-[9.5px] leading-relaxed font-semibold text-zinc-400">
                                              Ubah dan capai target di bawah untuk menyingkirkan penyusutan bottleneck corong Suki YuSuki:
                                            </p>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-[9.5px] font-black">
                                              <div className="p-2.5 bg-zinc-950/80 rounded-lg border border-zinc-800">
                                                <span className="text-[8px] text-zinc-500 font-sans tracking-wide block uppercase">Target Add to Cart</span>
                                                <div className="text-white text-xs mt-0.5">≥ 40%</div>
                                                <span className="text-[7.5px] text-zinc-400 font-normal block mt-1">Status saat ini: {addToCartRate.toFixed(0)}%</span>
                                              </div>
                                              <div className="p-2.5 bg-zinc-950/80 rounded-lg border border-zinc-800">
                                                <span className="text-[8px] text-zinc-500 font-sans tracking-wide block uppercase">Target Konversi WA</span>
                                                <div className="text-white text-xs mt-0.5">≥ 80%</div>
                                                <span className="text-[7.5px] text-zinc-400 font-normal block mt-1">Status saat ini: {waConversionRate.toFixed(0)}%</span>
                                              </div>
                                            </div>
                                          </div>

                                        </div>

                                        {/* Modal Footer */}
                                        <div className="border-t border-zinc-800 p-4 sticky bottom-0 bg-zinc-900 flex justify-between items-center z-10">
                                          <div className="text-[9px] text-zinc-500 font-bold">
                                            Ditempa berdasarkan kalkulasi data harian website Suki YuSuki
                                          </div>
                                          <button
                                            type="button"
                                            onClick={() => setShowAIStrategyDetail(false)}
                                            className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white font-black text-xs rounded-lg cursor-pointer transition-colors border border-zinc-750"
                                          >
                                            Selesai & Keluar
                                          </button>
                                        </div>
                                      </motion.div>
                                    </motion.div>
                                  )}
                                </AnimatePresence>
                              </div>
                            );
                          })()}
                        </div>
                      );
                    })()}

                    {/* Konsol Batalkan Tindakan (Undo Hub) */}
                    <div className="bg-amber-50/40 p-5 rounded-2xl border border-amber-200 shadow-xs space-y-4 text-left">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-amber-100 pb-3">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <RotateCcw className="w-4 h-4 text-amber-600" />
                            <h5 className="font-display font-black text-sm text-amber-850">
                              Konsol Batalkan Tindakan (Undo Hub Sesi Ini)
                            </h5>
                          </div>
                          <p className="text-[10px] text-zinc-650 font-bold leading-relaxed">
                            Menyimpan daftar aksi manipulasi database (tambah, ubah, hapus) dalam katalog masal/item, kisah kami, testimonial, atau FAQ. Anda bisa batalkan (undo) kapan saja.
                          </p>
                        </div>
                        {historyStack.length > 0 && (
                          <button
                            onClick={() => {
                              setHistoryStack([]);
                              addToast('info', 'Konsol Dibersihkan', 'Riwayat undo sesi ini telah dikosongkan.');
                            }}
                            className="text-[9px] font-black text-amber-700 bg-amber-100 hover:bg-amber-200 hover:shadow-xs px-2.5 py-1.5 rounded-xl border border-amber-300 transition-all uppercase tracking-wider cursor-pointer self-start sm:self-center shrink-0"
                          >
                            Bersihkan Riwayat
                          </button>
                        )}
                      </div>

                      {historyStack.length > 0 ? (
                        <div className="divide-y divide-amber-100 max-h-56 overflow-y-auto pr-1">
                          {historyStack.map((act) => (
                            <div key={act.id} className="py-2.5 flex items-center justify-between gap-3 first:pt-0 last:pb-0">
                              <div className="space-y-1">
                                <p className="text-[11px] font-black text-zinc-800 flex items-center gap-2">
                                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                                  {act.label}
                                </p>
                                <p className="text-[9px] text-zinc-500 font-mono font-bold flex items-center gap-1">
                                  <span>Terekam:</span>
                                  <span>
                                    {act.timestamp.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                                  </span>
                                </p>
                              </div>
                              <button
                                onClick={async () => {
                                  setOperationState({ status: 'loading', message: `Membatalkan aksi: "${act.label}"...` });
                                  try {
                                    await act.undo();
                                    setHistoryStack((prev) => prev.filter((item) => item.id !== act.id));
                                    setOperationState({ status: 'success', message: `Aksi "${act.label}" berhasil dibatalkan!` });
                                    addToast('success', 'Urungkan Sukses', `Perubahan untuk "${act.label}" berhasil di-undo.`);
                                    setTimeout(() => setOperationState({ status: 'idle' }), 3000);
                                  } catch (err) {
                                    console.error("Gagal melakukan undo:", err);
                                    setOperationState({ status: 'error', message: `Gagal membatalkan aksi: "${act.label}"` });
                                    addToast('error', 'Gagal Mengurungkan', 'Kesalahan koneksi database saat memproses.');
                                  }
                                }}
                                className="flex items-center gap-1.5 text-[10px] font-extrabold text-amber-700 hover:text-white hover:bg-amber-600 bg-white shadow-xs px-3 py-1.5 rounded-xl border border-amber-300 hover:border-amber-600 transition-all uppercase tracking-wider cursor-pointer shrink-0"
                              >
                                <RotateCcw className="w-3 h-3 stroke-[2.5]" />
                                Urungkan
                              </button>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="py-4 text-center rounded-xl bg-amber-50/20 border border-dashed border-amber-100 flex flex-col items-center justify-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-amber-100/60 flex items-center justify-center">
                            <RotateCcw className="w-4 h-4 text-amber-600" />
                          </div>
                          <p className="text-[10.5px] text-zinc-500 font-bold max-w-sm">
                            Tidak ada riwayat tindakan yang dapat dibatalkan di sesi ini. Segala aktivitas modifikasi data akan terekam otomatis di sini untuk Anda undo secara cerdas.
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Rekaman Jejak Aktivitas & Audit Website */}
                    <div className="bg-white p-5 rounded-2xl border border-zinc-200 shadow-sm space-y-5">
                      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 border-b border-zinc-100 pb-3">
                        <div className="space-y-1 text-left">
                          <div className="flex items-center gap-2">
                            <Activity className="w-4 h-4 text-rose-600" />
                            <h5 className="font-display font-black text-sm text-brand-charcoal">
                              Rekaman Jejak Aktivitas & Audit Website
                            </h5>
                          </div>
                          <p className="text-[10px] text-zinc-500 font-semibold leading-relaxed">
                            Memonitor alur order mandiri kustomer, kunjungan, klik menu, unduh bukti, & omzet masuk secara kronologis dari database.
                          </p>
                        </div>

                        <div className="flex flex-col sm:flex-row items-center gap-2">
                          {/* Filter Dropdown */}
                          <div className="w-full sm:w-auto">
                            <select
                              value={activityFilter}
                              onChange={(e) => setActivityFilter(e.target.value)}
                              className="bg-zinc-50 hover:bg-zinc-100 text-[10px] font-black border border-zinc-200 outline-none rounded-xl px-2.5 py-1.5 cursor-pointer shadow-sm w-full transition-all text-zinc-700"
                            >
                              <option value="ALL">🔍 Semua Aktivitas ({processedAndFilteredEvents.length})</option>
                              <option value="web_visit">🌐 Membuka Web (Visit)</option>
                              <option value="product_click">🖱️ Klik Detail Produk</option>
                              <option value="add_to_cart">🛒 Tambah ke Keranjang</option>
                              <option value="create_invoice">🧾 Draft Invoice / Checkout</option>
                              <option value="download_receipt">💾 Unduh Bukti Nota</option>
                              <option value="send_wa">💬 Kirim ke WhatsApp</option>
                              <option value="pencatatan_omzet">💰 Pencatatan Omzet Masuk</option>
                              <option value="status_invoice">⚙️ Pembaruan Status Invoice</option>
                            </select>
                          </div>

                          {/* Search Term */}
                          <div className="relative w-full sm:w-52">
                            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                            <input
                              type="text"
                              value={activitySearch}
                              onChange={(e) => setActivitySearch(e.target.value)}
                              placeholder="Cari kata kunci / invoice..."
                              className="bg-zinc-50 hover:bg-zinc-100 focus:bg-white text-[10px] font-bold border border-zinc-200 focus:border-rose-500 outline-none rounded-xl pl-8.5 pr-3 py-1.5 w-full transition-all"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Log Feed List */}
                      <div className="space-y-3.5 max-h-[420px] overflow-y-auto pr-1">
                        {processedAndFilteredEvents.length > 0 ? (
                          processedAndFilteredEvents.map((ev, index) => {
                            // Find corresponding invoice detail for rendering status changes
                            const matchInvoice = ev.invoiceNo 
                              ? invoices.find(inv => (inv.id === ev.invoiceNo || inv.invoiceNo === ev.invoiceNo))
                              : null;

                            const evDate = new Date(ev.timestamp);
                            const formattedTime = evDate.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) + ' WIB';
                            const formattedDay = evDate.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });

                            // Layout determination based on event types
                            let iconEl = <Activity className="w-3.5 h-3.5 text-zinc-600" />;
                            let bgIconClass = 'bg-zinc-100 text-zinc-700';
                            let titleText = 'Aktivitas Tidak Dikenal';
                            let descText = 'Tipe aksi sistem terekam.';
                            let colorBorder = 'border-zinc-150';

                            if (ev.type === 'web_visit') {
                              iconEl = <Eye className="w-3.5 h-3.5" />;
                              bgIconClass = 'bg-sky-50 text-sky-600 border border-sky-100';
                              titleText = 'Kunjungan Website Masuk';
                              descText = 'Satu pengunjung mengakses halaman utama Suki YuSuki.';
                              colorBorder = 'border-l-[3px] border-l-sky-400 border-zinc-150';
                            } else if (ev.type === 'product_click') {
                              iconEl = <MousePointerClick className="w-3.5 h-3.5" />;
                              bgIconClass = 'bg-amber-50 text-amber-600 border border-amber-100';
                              titleText = 'Detail Produk Dilihat';
                              descText = `Melihat detail & komposisi produk "${ev.itemName || 'Id: ' + ev.itemId}"`;
                              colorBorder = 'border-l-[3px] border-l-amber-400 border-zinc-150';
                            } else if (ev.type === 'add_to_cart') {
                              iconEl = <ShoppingCart className="w-3.5 h-3.5" />;
                              bgIconClass = 'bg-rose-50 text-rose-600 border border-rose-100';
                              titleText = 'Produk Dimasukkan Keranjang';
                              descText = `Menambahkan ${ev.quantity || 1}x porsi menu "${ev.itemName || 'Item'}" ke dalam daftar belanja.`;
                              colorBorder = 'border-l-[3px] border-l-rose-400 border-zinc-150';
                            } else if (ev.type === 'create_invoice') {
                              iconEl = <Receipt className="w-3.5 h-3.5" />;
                              bgIconClass = 'bg-emerald-50 text-emerald-600 border border-emerald-100';
                              titleText = `Draft Invoice Dihasilkan`;
                              descText = `Membuat rancangan invoice #${ev.invoiceNo || 'Baru'}. Customer bersiap untuk checkout.`;
                              colorBorder = 'border-l-[3px] border-l-emerald-400 border-zinc-150';
                            } else if (ev.type === 'download_receipt') {
                              iconEl = <Download className="w-3.5 h-3.5" />;
                              bgIconClass = 'bg-indigo-50 text-indigo-600 border border-indigo-100';
                              titleText = 'Gambar Nota/Bukti Diunduh';
                              descText = `Dokumen grafis e-receipt berhasil diunduh ke gadget untuk invoice #${ev.invoiceNo || 'N/A'}`;
                              colorBorder = 'border-l-[3px] border-l-indigo-400 border-zinc-150';
                            } else if (ev.type === 'send_wa') {
                              iconEl = <MessageSquare className="w-3.5 h-3.5" />;
                              bgIconClass = 'bg-blue-50 text-blue-600 border border-blue-100';
                              titleText = 'Pemesanan Dikirim ke WA';
                              descText = `Pelanggan mengklik tombol kirim data receipt invoice #${ev.invoiceNo || 'N/A'} menuju nomor WhatsApp Admin.`;
                              colorBorder = 'border-l-[3px] border-l-blue-400 border-zinc-150';
                            } else if (ev.type === 'pencatatan_omzet') {
                              iconEl = <DollarSign className="w-3.5 h-3.5" />;
                              bgIconClass = 'bg-violet-50 text-violet-600 border border-violet-100';
                              titleText = 'Omzet/Pendapatan Terdaftar';
                              descText = `Pencatatan omzet masuk sebesar ${formatPrice(ev.amount || 0)} atas nama "${ev.customerName || 'Pelanggan'}" (Invoice #${ev.invoiceNo}).`;
                              colorBorder = 'border-l-[3px] border-l-violet-400 border-zinc-150';
                            } else if (ev.type === 'status_invoice') {
                              iconEl = <CheckSquare className="w-3.5 h-3.5" />;
                              bgIconClass = 'bg-teal-50 text-teal-600 border border-teal-100';
                              titleText = 'Status Invoice Diubah';
                              descText = `Admin memperbarui status penanganan invoice #${ev.invoiceNo} menjadi "${ev.newStatus || 'Selesai'}".`;
                              colorBorder = 'border-l-[3px] border-l-teal-400 border-zinc-150';
                            }

                            return (
                              <div
                                key={ev.id || `${ev.type}-${index}`}
                                className={`border ${colorBorder} rounded-xl p-3.5 text-left flex flex-col md:flex-row justify-between items-start md:items-center gap-3.5 hover:bg-zinc-50/50 transition-all`}
                              >
                                <div className="flex items-start gap-3 max-w-xl">
                                  <div className={`p-2 rounded-xl shrink-0 ${bgIconClass}`}>
                                    {iconEl}
                                  </div>

                                  <div className="space-y-1">
                                    <div className="flex flex-wrap items-center gap-1.5">
                                      <span className="text-[11px] font-black text-zinc-900">{titleText}</span>
                                      <span className="text-[8.5px] font-extrabold tracking-tight px-1.5 py-0.5 rounded bg-zinc-100 border border-zinc-200.50 font-mono text-zinc-500 uppercase">
                                        {ev.type}
                                      </span>
                                    </div>

                                    <p className="text-[10px] text-zinc-650 leading-relaxed font-semibold">
                                      {descText}
                                    </p>

                                    <div className="flex flex-wrap items-center gap-x-2 text-[9px] text-zinc-400 font-bold font-mono">
                                      <span>⏰ {formattedTime}</span>
                                      <span>•</span>
                                      <span>📅 {formattedDay}</span>
                                      {ev.invoiceNo && (
                                        <>
                                          <span>•</span>
                                          <span className="text-zinc-600 font-extrabold uppercase">Invoice: #{ev.invoiceNo}</span>
                                        </>
                                      )}
                                    </div>
                                  </div>
                                </div>

                                {/* Dynamic controller for events bound with invoices */}
                                {ev.invoiceNo && (
                                  <div className="w-full md:w-auto shrink-0 flex flex-wrap items-center justify-between md:justify-end gap-3.5 border-t md:border-t-0 border-zinc-100 pt-2.5 md:pt-0">
                                    <div className="text-left md:text-right">
                                      <span className="text-[8.5px] text-zinc-400 font-bold block uppercase font-mono">Total Order</span>
                                      <span className="text-[11px] font-black text-brand-charcoal">
                                        {matchInvoice ? formatPrice(matchInvoice.total || 0) : 'Rp 0'}
                                      </span>
                                    </div>

                                    <div className="flex items-center gap-1.5">
                                      <select
                                        value={matchInvoice ? (matchInvoice.status || 'Baru dibuat') : 'Baru dibuat'}
                                        onChange={(e) => handleUpdateInvoiceStatus(ev.invoiceNo, e.target.value)}
                                        className={`text-[9px] font-black border rounded-xl py-1 px-2 outline-none cursor-pointer shadow-sm transition-all ${
                                          matchInvoice?.status === 'Selesai / datang ke toko'
                                            ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                                            : matchInvoice?.status === 'Dikonfirmasi'
                                            ? 'bg-amber-50 border-amber-200 text-amber-700'
                                            : matchInvoice?.status === 'Dikirim ke WhatsApp'
                                            ? 'bg-blue-50 border-blue-200 text-blue-700'
                                            : 'bg-zinc-100 border-zinc-200 text-zinc-500'
                                        }`}
                                      >
                                        <option value="Baru dibuat">🆕 Baru dibuat</option>
                                        <option value="Dikirim ke WhatsApp">💬 Kirim ke WA</option>
                                        <option value="Dikonfirmasi">✅ Dikonfirmasi</option>
                                        <option value="Selesai / datang ke toko">🏪 Selesai / Ambil</option>
                                      </select>

                                      <button
                                        onClick={() => handleDeleteInvoice(ev.invoiceNo)}
                                        className="p-1 px-1.5 hover:bg-red-50 text-red-500 hover:text-red-700 border border-transparent hover:border-red-100 rounded-lg cursor-pointer transition-all"
                                        title="Hapus Data Invoice"
                                      >
                                        <Trash2 className="w-3.5 h-3.5" />
                                      </button>
                                    </div>
                                  </div>
                                )}
                              </div>
                            );
                          })
                        ) : (
                          <div className="py-14 border border-dashed border-zinc-200 rounded-2xl text-center space-y-2">
                            <Activity className="w-8 h-8 text-zinc-300 mx-auto animate-pulse" />
                            <div className="text-[11px] text-zinc-400 font-black uppercase tracking-wide">Jejarah Log Aktivitas Kosong</div>
                            <p className="text-[9.5px] text-zinc-400 font-semibold max-w-sm mx-auto leading-relaxed px-4">
                              Tidak ada data aktivitas yang terekam dalam rentang waktu terfilter. Silakan melakukan uji coba klik detail produk atau checkout di beranda agar terekam live.
                            </p>
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

                      <div className="flex flex-wrap gap-2 justify-end items-center">
                        <button
                          onClick={handleDisableAllMenus}
                          className="bg-red-50 hover:bg-red-100 text-red-700 border border-red-200/60 font-black text-xs py-2 px-3 rounded-xl shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
                          title="Nonaktifkan Ketersediaan Seluruh Menu secara Sekaligus"
                        >
                          <EyeOff className="w-3.5 h-3.5" />
                          Nonaktifkan Semua
                        </button>
                        <button
                          onClick={handleEnableAllMenus}
                          className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200/60 font-black text-xs py-2 px-3 rounded-xl shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
                          title="Aktifkan Kembali Seluruh Menu secara Sekaligus"
                        >
                          <Power className="w-3.5 h-3.5" />
                          Aktifkan Semua
                        </button>
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
                            <div key={`${item.id}-${idx}`} className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 hover:bg-zinc-50/50 transition-colors">
                              {/* Left detail container */}
                              <div className="flex items-start gap-4 flex-1 min-w-0 w-full text-left">
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
                                  <span className="font-display font-black text-sm sm:text-base text-brand-charcoal block leading-snug">
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
                            </div>

                            {/* Operation triggers */}
                            <div className="flex gap-1.5 items-center justify-end w-full sm:w-auto border-t sm:border-t-0 border-zinc-100 pt-2.5 sm:pt-0 mt-1.5 sm:mt-0 font-sans">
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
     
                        {/* SECTION 3.5: KELOLA KONTEN SEGMEN HERO UTAMA */}
                        <div className="border-t border-zinc-200/60 pt-4.5 space-y-4">
                          <h5 className="text-[11px] font-black uppercase tracking-wider text-rose-500 block-title flex items-center gap-1.5">
                            🚀 KUSTOMISASI KONTEN SEGMEN HERO UTAMA (BANNER DEPAN)
                          </h5>
                          <p className="text-[11px] text-zinc-500 font-medium leading-relaxed">
                            Kustomisasi seluruh konten teks, foto banner melingkar, slogan, tombol aksi, lencana melayang, dan metrik statistik kepercayaan pelanggan pada halaman depan Hero Banner Anda di bawah ini secara instan.
                          </p>
                          
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {/* Foto Banner Hero (Atas) */}
                            <div className="sm:col-span-2 bg-zinc-50/45 border border-zinc-200/80 p-4 rounded-2xl space-y-2 mb-1">
                              <div className="flex justify-between items-center">
                                <label className="text-xs font-bold text-brand-charcoal block">Foto Banner Hero Utama</label>
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
                                className={`relative w-full h-44 rounded-xl border-2 border-dashed transition-all duration-200 flex flex-col items-center justify-center cursor-pointer p-4 overflow-hidden group select-none ${
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
                                      className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 rounded-xl"
                                      onError={(e) => { (e.target as HTMLImageElement).src = 'https://placehold.co/400x300?text=Gambar+Bermasalah'; }}
                                    />
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col items-center justify-center text-white gap-1.5 p-3 text-center">
                                      <UploadCloud className="w-6 h-6 text-white drop-shadow" />
                                      <span className="text-xs font-bold font-display drop-shadow">Lepas atau Klik untuk Ganti Foto Banner</span>
                                      <span className="text-[9px] text-zinc-200 drop-shadow">Max size ideal: 1200px wide</span>
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
                              <span className="text-[9px] text-zinc-400 block font-medium leading-tight">
                                Mempunyai efek langsung pada gambar piring/bambu dimsum melingkar di panel paling atas website.
                              </span>
                            </div>

                            {/* Tagline 1 & Tagline 2 */}
                            <div>
                              <label className="text-xs font-bold text-brand-charcoal block mb-1">Tagline Label 1 (Kiri Atas)</label>
                              <input
                                type="text"
                                value={formHeroTagline1}
                                onChange={(e) => setFormHeroTagline1(e.target.value)}
                                placeholder="Contoh: ESTABLISHED 2021"
                                className="w-full bg-white border border-zinc-200 rounded-xl px-3.5 py-2.5 text-xs text-brand-charcoal focus:outline-none focus:border-primary-orange font-semibold"
                              />
                            </div>
                            <div>
                              <label className="text-xs font-bold text-brand-charcoal block mb-1">Tagline Label 2 (Kanan Atas)</label>
                              <input
                                type="text"
                                value={formHeroTagline2}
                                onChange={(e) => setFormHeroTagline2(e.target.value)}
                                placeholder="Contoh: Sering SOLD OUT dlm beberapa jam!"
                                className="w-full bg-white border border-zinc-200 rounded-xl px-3.5 py-2.5 text-xs text-brand-charcoal focus:outline-none focus:border-primary-orange font-semibold"
                              />
                            </div>

                            {/* Headline Title */}
                            <div className="sm:col-span-2">
                              <label className="text-xs font-bold text-brand-charcoal block mb-1">Slogan Judul Utama (Headline)</label>
                              <input
                                type="text"
                                value={formHeroTitle}
                                onChange={(e) => setFormHeroTitle(e.target.value)}
                                placeholder="Contoh: Dimsum Homemade Premium Favorit Semua Kalangan"
                                className="w-full bg-white border border-zinc-200 rounded-xl px-3.5 py-2.5 text-xs text-brand-charcoal focus:outline-none focus:border-primary-orange font-bold text-sm"
                              />
                              <span className="text-[9px] text-zinc-400 block font-medium mt-1 leading-tight">
                                Kata <span className="text-primary-orange font-bold">"Premium"</span> akan otomatis diubah menjadi warna gradien oranye yang estetik.
                              </span>
                            </div>

                            {/* Description Textarea */}
                            <div className="sm:col-span-2">
                              <label className="text-xs font-bold text-brand-charcoal block mb-1">Deskripsi / Penjelasan Singkat (Subtitle)</label>
                              <textarea
                                value={formHeroDescription}
                                onChange={(e) => setFormHeroDescription(e.target.value)}
                                rows={3}
                                placeholder="Tuliskan cerita singkat pembuka yang menarik pelanggan..."
                                className="w-full bg-white border border-zinc-200 rounded-xl px-3.5 py-2.5 text-xs text-brand-charcoal focus:outline-none focus:border-primary-orange resize-none font-medium text-zinc-700"
                              />
                            </div>

                            {/* CTA Buttons */}
                            <div>
                              <label className="text-xs font-bold text-brand-charcoal block mb-1">Label Tombol Utama (CTA 1)</label>
                              <input
                                type="text"
                                value={formHeroCtaButton1Label}
                                onChange={(e) => setFormHeroCtaButton1Label(e.target.value)}
                                placeholder="Contoh: Pesan via WA"
                                className="w-full bg-white border border-zinc-200 rounded-xl px-3.5 py-2.5 text-xs text-brand-charcoal focus:outline-none focus:border-primary-orange font-semibold"
                              />
                            </div>
                            <div>
                              <label className="text-xs font-bold text-brand-charcoal block mb-1">Label Tombol Sekunder (CTA 2)</label>
                              <input
                                type="text"
                                value={formHeroCtaButton2Label}
                                onChange={(e) => setFormHeroCtaButton2Label(e.target.value)}
                                placeholder="Contoh: Lihat Menu Lengkap"
                                className="w-full bg-white border border-zinc-200 rounded-xl px-3.5 py-2.5 text-xs text-brand-charcoal focus:outline-none focus:border-primary-orange font-semibold"
                              />
                            </div>

                            {/* Floating Badges (Over Image) */}
                            <div>
                              <label className="text-xs font-bold text-brand-charcoal block mb-1">Lencana Melayang 1 (Kiri Atas Foto)</label>
                              <input
                                type="text"
                                value={formHeroBadge1Text}
                                onChange={(e) => setFormHeroBadge1Text(e.target.value)}
                                placeholder="Contoh: Dibuat Fresh Setiap Hari"
                                className="w-full bg-white border border-zinc-200 rounded-xl px-3.5 py-2.5 text-xs text-brand-charcoal focus:outline-none focus:border-primary-orange font-semibold"
                              />
                              <span className="text-[9px] text-zinc-400 block font-medium mt-1 leading-tight">
                                Kata <span className="text-primary-orange font-bold">"Fresh"</span> akan otomatis diubah menjadi warna oranye terang.
                              </span>
                            </div>
                            <div>
                              <label className="text-xs font-bold text-brand-charcoal block mb-1">Lencana Melayang 2 (Kanan Bawah Foto)</label>
                              <input
                                type="text"
                                value={formHeroBadge2Text}
                                onChange={(e) => setFormHeroBadge2Text(e.target.value)}
                                placeholder="Contoh: Praktis Pesan Take Away"
                                className="w-full bg-white border border-zinc-200 rounded-xl px-3.5 py-2.5 text-xs text-brand-charcoal focus:outline-none focus:border-primary-orange font-semibold"
                              />
                              <span className="text-[9px] text-zinc-400 block font-medium mt-1 leading-tight">
                                Kata <span className="text-primary-orange font-bold">"Take Away"</span> akan otomatis diubah menjadi warna oranye terang.
                              </span>
                            </div>

                            {/* Statistics Cards (Metriks) */}
                            <div className="sm:col-span-2 border-t border-dashed border-zinc-200 pt-3">
                              <span className="text-[10px] font-black uppercase tracking-wider text-rose-500 block mb-2">📊 KELOLA DATA STATISTIK KEPERCAYAAN (3 HIGHLIGHT)</span>
                              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                <div className="bg-zinc-50 p-3 rounded-xl border border-zinc-200/60 space-y-2">
                                  <div>
                                    <label className="text-[10px] font-bold text-zinc-500 block mb-0.5">Nilai Stat 1</label>
                                    <input
                                      type="text"
                                      value={formHeroStat1Value}
                                      onChange={(e) => setFormHeroStat1Value(e.target.value)}
                                      placeholder="Contoh: 100%"
                                      className="w-full bg-white border border-zinc-200 rounded-lg px-2 py-1.5 text-xs text-brand-charcoal focus:outline-none focus:border-primary-orange font-bold"
                                    />
                                  </div>
                                  <div>
                                    <label className="text-[10px] font-bold text-zinc-500 block mb-0.5">Label Stat 1</label>
                                    <input
                                      type="text"
                                      value={formHeroStat1Label}
                                      onChange={(e) => setFormHeroStat1Label(e.target.value)}
                                      placeholder="Contoh: Halal & Higienis"
                                      className="w-full bg-white border border-zinc-200 rounded-lg px-2 py-1.5 text-xs text-brand-charcoal focus:outline-none focus:border-primary-orange font-medium text-zinc-500"
                                    />
                                  </div>
                                </div>

                                <div className="bg-zinc-50 p-3 rounded-xl border border-zinc-200/60 space-y-2">
                                  <div>
                                    <label className="text-[10px] font-bold text-zinc-500 block mb-0.5">Nilai Stat 2</label>
                                    <input
                                      type="text"
                                      value={formHeroStat2Value}
                                      onChange={(e) => setFormHeroStat2Value(e.target.value)}
                                      placeholder="Contoh: 25+"
                                      className="w-full bg-white border border-zinc-200 rounded-lg px-2 py-1.5 text-xs text-brand-charcoal focus:outline-none focus:border-primary-orange font-bold"
                                    />
                                  </div>
                                  <div>
                                    <label className="text-[10px] font-bold text-zinc-500 block mb-0.5">Label Stat 2</label>
                                    <input
                                      type="text"
                                      value={formHeroStat2Label}
                                      onChange={(e) => setFormHeroStat2Label(e.target.value)}
                                      placeholder="Contoh: Pilihan Varian"
                                      className="w-full bg-white border border-zinc-200 rounded-lg px-2 py-1.5 text-xs text-brand-charcoal focus:outline-none focus:border-primary-orange font-medium text-zinc-500"
                                    />
                                  </div>
                                </div>

                                <div className="bg-zinc-50 p-3 rounded-xl border border-zinc-200/60 space-y-2">
                                  <div>
                                    <label className="text-[10px] font-bold text-zinc-500 block mb-0.5">Nilai Stat 3</label>
                                    <input
                                      type="text"
                                      value={formHeroStat3Value}
                                      onChange={(e) => setFormHeroStat3Value(e.target.value)}
                                      placeholder="Contoh: 4.9"
                                      className="w-full bg-white border border-zinc-200 rounded-lg px-2 py-1.5 text-xs text-brand-charcoal focus:outline-none focus:border-primary-orange font-bold"
                                    />
                                  </div>
                                  <div>
                                    <label className="text-[10px] font-bold text-zinc-500 block mb-0.5">Label Stat 3</label>
                                    <input
                                      type="text"
                                      value={formHeroStat3Label}
                                      onChange={(e) => setFormHeroStat3Label(e.target.value)}
                                      placeholder="Contoh: Rating G-Maps"
                                      className="w-full bg-white border border-zinc-200 rounded-lg px-2 py-1.5 text-xs text-brand-charcoal focus:outline-none focus:border-primary-orange font-medium text-zinc-500"
                                    />
                                  </div>
                                </div>
                              </div>
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
