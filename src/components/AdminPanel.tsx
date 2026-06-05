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
  Share2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { MenuItem, MenuCategory, AppSettings, Testimonial, InstagramPost, TikTokVideoSim } from '../types';
import { MENU_ITEMS, CATEGORIES } from '../data/menu';
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
  tiktokPosts = []
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
  const [activeTab, setActiveTab] = useState<'menu' | 'settings'>('menu');
  const [authError, setAuthError] = useState<string | null>(null);

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
  const [formOutletAddress, setFormOutletAddress] = useState('');
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

  // Testimonials/Reviews Form State
  const [selectedTestimonial, setSelectedTestimonial] = useState<Testimonial | null>(null);
  const [testimonyName, setTestimonyName] = useState('');
  const [testimonyRole, setTestimonyRole] = useState('');
  const [testimonyText, setTestimonyText] = useState('');
  const [testimonyRating, setTestimonyRating] = useState(5);
  const [testimonyAvatar, setTestimonyAvatar] = useState('');
  const [testimonyDate, setTestimonyDate] = useState('');
  const [isTestimonyFormOpen, setIsTestimonyFormOpen] = useState(false);

  // Load static settings defaults if not present
  useEffect(() => {
    if (appSettings) {
      setFormOutletAddress(appSettings.outletAddress || 'Kuliner Malam, Jl. Ps. Pon Utara Jl. Jend. Sudirman, Bantarsoka, Kec. Purwokerto Bar., Kabupaten Banyumas, Jawa Tengah 53133');
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
    }
  }, [appSettings]);

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
        outletAddress: formOutletAddress,
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
              <div className="w-full md:w-56 bg-zinc-900 md:h-full p-4.5 flex flex-row md:flex-col gap-2 border-b md:border-b-0 md:border-r border-zinc-800 justify-between md:justify-start">
                <div className="flex flex-row md:flex-col gap-1.5 w-full">
                  <div className="hidden md:block px-3 py-1.5 mb-2 font-mono text-[10px] text-zinc-500 font-extrabold uppercase tracking-widest">
                    Pilih Menu Kontrol
                  </div>

                  <button
                    onClick={() => setActiveTab('menu')}
                    className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer w-full ${
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
                    className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer w-full ${
                      activeTab === 'settings'
                        ? 'bg-rose-600 text-white shadow-md shadow-rose-900/30'
                        : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
                    }`}
                  >
                    <SettingsIcon className="w-4 h-4" />
                    Edit Logo & Brand
                  </button>
                </div>

                <div className="md:mt-auto flex items-center md:flex-col gap-3 w-full border-t border-zinc-800 pt-4.5">
                  <div className="hidden md:flex flex-col items-start w-full px-3 mb-1">
                    <span className="text-xs text-rose-500 font-extrabold font-display max-w-[140px] truncate uppercase tracking-wider block">
                      @{user.username}
                    </span>
                    <span className="text-[9px] text-[#10b981] font-mono font-extrabold uppercase">
                      Admin Online
                    </span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="flex items-center justify-center gap-2 py-2 px-3.5 text-xs font-bold text-red-400 hover:text-red-300 bg-red-950/20 hover:bg-red-950/50 rounded-xl cursor-pointer w-full border border-red-900/20"
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

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-zinc-200/60 pt-4">
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
