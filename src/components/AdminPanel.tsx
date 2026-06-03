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
  Instagram,
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
  const [formTags, setFormTags] = useState('');
  const [logoInput, setLogoInput] = useState(logoUrl || '');

  // Sub tab for settings area
  const [settingsSubTab, setSettingsSubTab] = useState<'profile' | 'outlet' | 'reviews' | 'feed'>('profile');

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

  // Testimonials/Reviews Form State
  const [selectedTestimonial, setSelectedTestimonial] = useState<Testimonial | null>(null);
  const [testimonyName, setTestimonyName] = useState('');
  const [testimonyRole, setTestimonyRole] = useState('');
  const [testimonyText, setTestimonyText] = useState('');
  const [testimonyRating, setTestimonyRating] = useState(5);
  const [testimonyAvatar, setTestimonyAvatar] = useState('');
  const [testimonyDate, setTestimonyDate] = useState('');
  const [isTestimonyFormOpen, setIsTestimonyFormOpen] = useState(false);

  // Instagram Post Form State
  const [selectedIgPost, setSelectedIgPost] = useState<InstagramPost | null>(null);
  const [igType, setIgType] = useState<'image' | 'video'>('image');
  const [igThumbnail, setIgThumbnail] = useState('');
  const [igLikes, setIgLikes] = useState('1.2K');
  const [igComments, setIgComments] = useState('12');
  const [igCaption, setIgCaption] = useState('');
  const [igTags, setIgTags] = useState('');
  const [isIgFormOpen, setIsIgFormOpen] = useState(false);

  // TikTok Video Form State
  const [selectedTiktokPost, setSelectedTiktokPost] = useState<TikTokVideoSim | null>(null);
  const [tkTitle, setTkTitle] = useState('');
  const [tkThumbnail, setTkThumbnail] = useState('');
  const [tkViews, setTkViews] = useState('120K');
  const [tkLikes, setTkLikes] = useState('10K');
  const [tkCommentsCount, setTkCommentsCount] = useState('42');
  const [tkShares, setTkShares] = useState('15');
  const [tkCaption, setTkCaption] = useState('');
  const [tkTags, setTkTags] = useState('');
  const [tkSound, setTkSound] = useState('');
  const [isTkFormOpen, setIsTkFormOpen] = useState(false);

  // Load static settings defaults if not present
  useEffect(() => {
    if (appSettings) {
      setFormOutletAddress(appSettings.outletAddress || 'Kuliner Malam, Jl. Ps. Pon Utara Jl. Jend. Sudirman, Bantarsoka, Kec. Purwokerto Bar., Kabupaten Banyumas, Jawa Tengah 53133');
      setFormOutletGmaps(appSettings.outletGmaps || 'https://maps.app.goo.gl/FtGnmFTyo2AB8X8AA');
      setFormOperatingHours(appSettings.operatingHours || '17.00 WIB - Selesai');
      setFormOperatingHoursSub(appSettings.operatingHoursSub || '(Biasa sold out jam 21.00!)');
      setFormOperatingDays(appSettings.operatingDays || 'Buka Setiap Hari');
      setFormOperatingDaysSub(appSettings.operatingDaysSub || '(Senin s/d Minggu)');
      setFormWhatsappNumber(appSettings.whatsappNumber || '6281818758265');
      setFormWhatsappName(appSettings.whatsappName || 'Suki Yusuki Admin');
      setFormWhatsappHandle(appSettings.whatsappHandle || '0818-1875-8265 (Suki Yusuki Admin)');
      setFormInstagramUrl(appSettings.instagramUrl || 'https://www.instagram.com/sukiyusuki?igsh=azNxcTNndnRmbG16');
      setFormInstagramHandle(appSettings.instagramHandle || '@sukiyusuki');
      setFormTiktokUrl(appSettings.tiktokUrl || 'https://tiktok.com/@sukiyusuki');
      setFormTiktokHandle(appSettings.tiktokHandle || '@owner.yusuki');
    }
  }, [appSettings]);

  // Operation status feedbacks
  const [operationState, setOperationState] = useState<{ status: 'idle' | 'loading' | 'success' | 'error'; message?: string }>({ status: 'idle' });

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
      return;
    }

    const ACCOUNTS = [
      { username: 'vocm', password: '123123' },
      { username: 'sukiyusuki123', password: 'dimsumsukipwt123' }
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
    } else {
      setAuthError('Username atau password salah.');
    }
  };

  const handleLogout = async () => {
    try {
      localStorage.removeItem('suki_yusuki_admin');
      setUser(null);
    } catch (err) {
      console.error(err);
    }
  };

  const handleInitializeDb = async () => {
    if (!window.confirm('Apakah Anda yakin ingin mengimpor semua 34 menu bawaan Suki Yusuki ke database cloud Firestore? Ini akan menimpa data menu yang memiliki ID sama.')) {
      return;
    }

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
  };

  const isFromDb = (id: string) => {
    return dbMenuItems.some((dItem) => dItem.id === id && !dItem.isDeleted);
  };

  const handleRestoreDefaults = async () => {
    if (!window.confirm('Apakah Anda yakin ingin memulihkan semua menu default bawaan yang sebelumnya disembunyikan/dihapus?')) {
      return;
    }
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

  const handleDeleteTestimonialForm = async (id: string) => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus ulasan ini?')) return;
    setOperationState({ status: 'loading', message: 'Menghapus testimoni...' });
    try {
      await deleteDoc(doc(db, 'testimonials', id));
      setOperationState({ status: 'success', message: 'Testimoni sukses dihapus!' });
      setTimeout(() => setOperationState({ status: 'idle' }), 3000);
    } catch (error) {
      setOperationState({ status: 'error', message: 'Gagal menghapus testimoni.' });
    }
  };

  // Instagram Post Modals triggers
  const handleOpenIgForm = (post?: InstagramPost) => {
    if (post) {
      setSelectedIgPost(post);
      setIgType(post.type || 'image');
      setIgThumbnail(post.thumbnail);
      setIgLikes(post.likes);
      setIgComments(post.comments);
      setIgCaption(post.caption);
      setIgTags(post.tags ? post.tags.join(', ') : '');
    } else {
      setSelectedIgPost(null);
      setIgType('image');
      setIgThumbnail('https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&q=80&w=600');
      setIgLikes('1.2K');
      setIgComments('15');
      setIgCaption('');
      setIgTags('SukiYusuki, KulinerPurwokerto, DimsumLover');
    }
    setIsIgFormOpen(true);
  };

  const handleSaveIgForm = async (e: React.FormEvent) => {
    e.preventDefault();
    setOperationState({ status: 'loading', message: 'Menyimpan postingan Instagram...' });
    const id = selectedIgPost ? selectedIgPost.id : `ig-${Date.now()}`;
    const parsedTags = igTags ? igTags.split(',').map(t => t.trim()).filter(t => t.length > 0) : [];
    const payload = {
      id,
      type: igType,
      thumbnail: igThumbnail,
      likes: igLikes,
      comments: igComments,
      caption: igCaption,
      tags: parsedTags
    };
    try {
      await setDoc(doc(db, 'instagram_posts', id), payload);
      setOperationState({ status: 'success', message: 'Postingan Instagram berhasil disimpan ke cloud!' });
      setIsIgFormOpen(false);
      setSelectedIgPost(null);
      setTimeout(() => setOperationState({ status: 'idle' }), 3000);
    } catch (error) {
      setOperationState({ status: 'error', message: 'Gagal menyimpan postingan Instagram.' });
    }
  };

  const handleDeleteIgForm = async (id: string) => {
    if (!window.confirm('Hapus konten Instagram feed ini dari website?')) return;
    setOperationState({ status: 'loading', message: 'Menghapus postingan...' });
    try {
      await deleteDoc(doc(db, 'instagram_posts', id));
      setOperationState({ status: 'success', message: 'Postingan Instagram sukses dihapus!' });
      setTimeout(() => setOperationState({ status: 'idle' }), 3000);
    } catch (error) {
      setOperationState({ status: 'error', message: 'Gagal menghapus postingan.' });
    }
  };

  // TikTok Video Modals triggers
  const handleOpenTkForm = (post?: TikTokVideoSim) => {
    if (post) {
      setSelectedTiktokPost(post);
      setTkTitle(post.videoTitle);
      setTkThumbnail(post.thumbnail);
      setTkViews(post.views);
      setTkLikes(post.likes);
      setTkCommentsCount(post.commentsCount);
      setTkShares(post.shares || '15');
      setTkCaption(post.caption);
      setTkTags(post.tags ? post.tags.join(', ') : '');
      setTkSound(post.sound || 'Suki Yusuki Original Sound');
    } else {
      setSelectedTiktokPost(null);
      setTkTitle('Resep Dimsum Rahasia');
      setTkThumbnail('https://images.unsplash.com/photo-1496116211227-15af28a2a8d5?auto=format&fit=crop&w=600&q=80');
      setTkViews('140K');
      setTkLikes('12K');
      setTkCommentsCount('85');
      setTkShares('24');
      setTkCaption('');
      setTkTags('SukiYusuki, DimsumPurwokerto, Mukbang');
      setTkSound('Suki Yusuki Original Sound');
    }
    setIsTkFormOpen(true);
  };

  const handleSaveTkForm = async (e: React.FormEvent) => {
    e.preventDefault();
    setOperationState({ status: 'loading', message: 'Menyimpan video TikTok...' });
    const id = selectedTiktokPost ? selectedTiktokPost.id : `tk-${Date.now()}`;
    const parsedTags = tkTags ? tkTags.split(',').map(t => t.trim()).filter(t => t.length > 0) : [];
    const payload = {
      id,
      videoTitle: tkTitle,
      thumbnail: tkThumbnail,
      views: tkViews,
      likes: tkLikes,
      commentsCount: tkCommentsCount,
      shares: tkShares,
      caption: tkCaption,
      tags: parsedTags,
      sound: tkSound
    };
    try {
      await setDoc(doc(db, 'tiktok_posts', id), payload);
      setOperationState({ status: 'success', message: 'Video TikTok berhasil disimpan ke cloud!' });
      setIsTkFormOpen(false);
      setSelectedTiktokPost(null);
      setTimeout(() => setOperationState({ status: 'idle' }), 3000);
    } catch (error) {
      setOperationState({ status: 'error', message: 'Gagal menyimpan TikTok video.' });
    }
  };

  const handleDeleteTkForm = async (id: string) => {
    if (!window.confirm('Hapus video TikTok ini dari website?')) return;
    setOperationState({ status: 'loading', message: 'Menghapus video...' });
    try {
      await deleteDoc(doc(db, 'tiktok_posts', id));
      setOperationState({ status: 'success', message: 'Video TikTok sukses dihapus!' });
      setTimeout(() => setOperationState({ status: 'idle' }), 3000);
    } catch (error) {
      setOperationState({ status: 'error', message: 'Gagal menghapus video.' });
    }
  };

  const handleOpenForm = (item?: MenuItem) => {
    if (item) {
      setEditingItem(item);
      setFormName(item.name);
      setFormPrice(item.price);
      setFormCategory(item.category);
      setFormDescription(item.description);
      setFormPieces(item.pieces || '');
      setFormImage(item.image);
      setFormIsBestSeller(!!item.isBestSeller);
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
      setFormTags('');
    }
    setIsFormOpen(true);
    setOperationState({ status: 'idle' });
  };

  const handleDeleteItem = async (id: string, name: string) => {
    if (!window.confirm(`Apakah Anda yakin ingin menghapus menu "${name}"?`)) {
      return;
    }

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
      tags: parsedTags,
    };

    if (formPieces !== '') {
      itemPayload.pieces = Number(formPieces);
    }

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
                          filteredItems.map((item) => (
                            <div key={item.id} className="p-3.5 flex items-center gap-4.5 hover:bg-zinc-50/50 transition-colors">
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

                    {/* Sub tabs list navigation */}
                    <div className="flex bg-zinc-100 p-1 rounded-xl gap-1 border border-zinc-200 overflow-x-auto">
                      <button
                        type="button"
                        onClick={() => setSettingsSubTab('profile')}
                        className={`flex-1 py-2 px-3 text-xs font-bold rounded-lg transition-all whitespace-nowrap flex items-center justify-center gap-1.5 cursor-pointer ${
                          settingsSubTab === 'profile' ? 'bg-white shadow-xs text-brand-charcoal border border-zinc-200/50' : 'text-zinc-500 hover:text-brand-charcoal'
                        }`}
                      >
                        <SettingsIcon className="w-3.5 h-3.5" />
                        Logo & Profil Media
                      </button>
                      <button
                        type="button"
                        onClick={() => setSettingsSubTab('outlet')}
                        className={`flex-1 py-2 px-3 text-xs font-bold rounded-lg transition-all whitespace-nowrap flex items-center justify-center gap-1.5 cursor-pointer ${
                          settingsSubTab === 'outlet' ? 'bg-white shadow-xs text-brand-charcoal border border-zinc-200/50' : 'text-zinc-500 hover:text-brand-charcoal'
                        }`}
                      >
                        <MapPin className="w-3.5 h-3.5" />
                        Alamat & Jam Operasional
                      </button>
                      <button
                        type="button"
                        onClick={() => setSettingsSubTab('reviews')}
                        className={`flex-1 py-2 px-3 text-xs font-bold rounded-lg transition-all whitespace-nowrap flex items-center justify-center gap-1.5 cursor-pointer ${
                          settingsSubTab === 'reviews' ? 'bg-white shadow-xs text-brand-charcoal border border-zinc-200/50' : 'text-zinc-500 hover:text-brand-charcoal'
                        }`}
                      >
                        <Star className="w-3.5 h-3.5" />
                        Testimoni (Reviews)
                      </button>
                      <button
                        type="button"
                        onClick={() => setSettingsSubTab('feed')}
                        className={`flex-1 py-2 px-3 text-xs font-bold rounded-lg transition-all whitespace-nowrap flex items-center justify-center gap-1.5 cursor-pointer ${
                          settingsSubTab === 'feed' ? 'bg-white shadow-xs text-brand-charcoal border border-zinc-200/50' : 'text-zinc-500 hover:text-brand-charcoal'
                        }`}
                      >
                        <Instagram className="w-3.5 h-3.5" />
                        Instagram & TikTok Feed
                      </button>
                    </div>

                    {/* RENDER ACTIVE SUBTAB CONTENT */}
                    {settingsSubTab === 'profile' && (
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
                              <label className="text-xs font-bold text-brand-charcoal block mb-1">Tautan URL Logo Brand</label>
                              <input
                                type="url"
                                value={logoInput}
                                onChange={(e) => setLogoInput(e.target.value)}
                                placeholder="E.g., https://link-ke-foto.img/logo.png"
                                className="w-full bg-white border border-zinc-200 rounded-xl px-3.5 py-2.5 text-xs text-brand-charcoal focus:outline-none focus:border-primary-orange"
                              />
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
                    )}

                    {settingsSubTab === 'outlet' && (
                      <form onSubmit={handleSaveSettings} className="space-y-4 bg-zinc-50/50 p-4.5 rounded-3xl border border-zinc-150">
                        <div className="space-y-3">
                          <div>
                            <label className="text-xs font-bold text-brand-charcoal block mb-1">Alamat Outlet Fisik</label>
                            <textarea
                              rows={3}
                              value={formOutletAddress}
                              onChange={(e) => setFormOutletAddress(e.target.value)}
                              placeholder="Ketik alamat lengkap koordinat lokasi outlet..."
                              className="w-full bg-white border border-zinc-200 rounded-xl px-3.5 py-2.5 text-xs text-brand-charcoal focus:outline-none focus:border-primary-orange resize-none"
                            />
                          </div>
                          <div>
                            <label className="text-xs font-bold text-brand-charcoal block mb-1">Tautan Navigasi Google Maps (Link Share Gmaps)</label>
                            <input
                              type="url"
                              value={formOutletGmaps}
                              onChange={(e) => setFormOutletGmaps(e.target.value)}
                              placeholder="Format: https://maps.app.goo.gl/..."
                              className="w-full bg-white border border-zinc-200 rounded-xl px-3.5 py-2.5 text-xs text-brand-charcoal focus:outline-none focus:border-primary-orange font-mono text-[11px]"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-zinc-200/60 pt-4">
                          <div>
                            <label className="text-xs font-bold text-brand-charcoal block mb-1">Jam Operasional (Utama)</label>
                            <input
                              type="text"
                              value={formOperatingHours}
                              onChange={(e) => setFormOperatingHours(e.target.value)}
                              placeholder="Contoh: 17.00 WIB - Selesai"
                              className="w-full bg-white border border-zinc-200 rounded-xl px-3.5 py-2.5 text-xs text-brand-charcoal focus:outline-none focus:border-primary-orange"
                            />
                          </div>
                          <div>
                            <label className="text-xs font-bold text-brand-charcoal block mb-1">Keterangan Jam (Sub)</label>
                            <input
                              type="text"
                              value={formOperatingHoursSub}
                              onChange={(e) => setFormOperatingHoursSub(e.target.value)}
                              placeholder="Contoh: (Biasa sold out jam 21.00!)"
                              className="w-full bg-white border border-zinc-200 rounded-xl px-3.5 py-2.5 text-xs text-brand-charcoal focus:outline-none focus:border-primary-orange"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="text-xs font-bold text-brand-charcoal block mb-1">Hari Buka (Utama)</label>
                            <input
                              type="text"
                              value={formOperatingDays}
                              onChange={(e) => setFormOperatingDays(e.target.value)}
                              placeholder="Contoh: Buka Setiap Hari"
                              className="w-full bg-white border border-zinc-200 rounded-xl px-3.5 py-2.5 text-xs text-brand-charcoal focus:outline-none focus:border-primary-orange"
                            />
                          </div>
                          <div>
                            <label className="text-xs font-bold text-brand-charcoal block mb-1">Keterangan Hari (Sub)</label>
                            <input
                              type="text"
                              value={formOperatingDaysSub}
                              onChange={(e) => setFormOperatingDaysSub(e.target.value)}
                              placeholder="Contoh: (Senin s/d Minggu)"
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
                            Simpan Lokasi & Jam Buka
                          </button>
                        </div>
                      </form>
                    )}

                    {settingsSubTab === 'reviews' && (
                      <div className="space-y-4">
                        <div className="flex justify-between items-center bg-zinc-50 p-3 rounded-2xl border border-zinc-150">
                          <div>
                            <h5 className="text-xs font-black text-brand-charcoal font-display">Tinjau & Manipulasi Ulasan (Testimoni)</h5>
                            <p className="text-[10px] text-zinc-400">Total terdaftar: {testimonials.length} ulasan cloud kustom.</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleOpenTestimonyForm()}
                            className="bg-rose-600 hover:bg-rose-700 text-white font-bold text-[10px] py-1.5 px-3 rounded-lg flex items-center gap-1 cursor-pointer transition-colors"
                          >
                            <Plus className="w-3 h-3" />
                            Tambah Ulasan Kustom
                          </button>
                        </div>

                        {/* Testimony form sub block inside page */}
                        {isTestimonyFormOpen && (
                          <form onSubmit={handleSaveTestimonialForm} className="bg-rose-50/50 border border-rose-200/50 p-4 rounded-2xl space-y-3">
                            <div className="flex items-center justify-between border-b border-rose-200/50 pb-2 mb-1">
                              <span className="text-xs font-black text-rose-700 font-display">
                                {selectedTestimonial ? 'Update Ulasan / Testimoni' : 'Buat Ulasan / Testimoni Baru'}
                              </span>
                              <button type="button" onClick={() => setIsTestimonyFormOpen(false)} className="text-zinc-400 hover:text-zinc-650 text-xs font-bold">Tutup X</button>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              <div>
                                <label className="text-[10px] font-bold text-brand-charcoal block mb-0.5">Nama Pengulas</label>
                                <input
                                  type="text"
                                  required
                                  value={testimonyName}
                                  onChange={(e) => setTestimonyName(e.target.value)}
                                  placeholder="Contoh: Valentino Arya"
                                  className="w-full bg-white border border-zinc-200 rounded-lg px-2.5 py-1.5 text-xs text-brand-charcoal"
                                />
                              </div>
                              <div>
                                <label className="text-[10px] font-bold text-brand-charcoal block mb-0.5">Role / Keterangan</label>
                                <input
                                  type="text"
                                  required
                                  value={testimonyRole}
                                  onChange={(e) => setTestimonyRole(e.target.value)}
                                  placeholder="Contoh: Local Guide Purwokerto"
                                  className="w-full bg-white border border-zinc-200 rounded-lg px-2.5 py-1.5 text-xs text-brand-charcoal"
                                />
                              </div>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                              <div className="sm:col-span-2">
                                <label className="text-[10px] font-bold text-brand-charcoal block mb-0.5">Avatar / Foto URL</label>
                                <input
                                  type="url"
                                  value={testimonyAvatar}
                                  onChange={(e) => setTestimonyAvatar(e.target.value)}
                                  placeholder="Contoh: https://link-ke-foto.img..."
                                  className="w-full bg-white border border-zinc-200 rounded-lg px-2.5 py-1.5 text-xs text-brand-charcoal font-mono"
                                />
                              </div>
                              <div>
                                <label className="text-[10px] font-bold text-brand-charcoal block mb-0.5">Bintang Rating (1-5)</label>
                                <select
                                  value={testimonyRating}
                                  onChange={(e) => setTestimonyRating(Number(e.target.value))}
                                  className="w-full bg-white border border-zinc-200 rounded-lg px-2 py-1.5 text-xs text-brand-charcoal font-bold"
                                >
                                  <option value={5}>⭐⭐⭐⭐⭐ (5 Bintang)</option>
                                  <option value={4}>⭐⭐⭐⭐ (4 Bintang)</option>
                                  <option value={3}>⭐⭐⭐ (3 Bintang)</option>
                                  <option value={2}>⭐⭐ (2 Bintang)</option>
                                  <option value={1}>⭐ (1 Bintang)</option>
                                </select>
                              </div>
                            </div>
                            <div>
                              <label className="text-[10px] font-bold text-brand-charcoal block mb-0.5">Isi Ulasan Testimoni</label>
                              <textarea
                                required
                                rows={2.5}
                                value={testimonyText}
                                onChange={(e) => setTestimonyText(e.target.value)}
                                placeholder="Tulis komentar pelanggan di sini..."
                                className="w-full bg-white border border-zinc-200 rounded-lg px-2.5 py-1.5 text-xs text-brand-charcoal"
                              />
                            </div>
                            <div className="flex gap-2 justify-end">
                              <button
                                type="button"
                                onClick={() => setIsTestimonyFormOpen(false)}
                                className="bg-zinc-100 hover:bg-zinc-200 text-zinc-700 text-[10px] px-3.5 py-2 rounded-lg font-bold"
                              >
                                Batal
                              </button>
                              <button
                                type="submit"
                                className="bg-rose-605 hover:bg-rose-700 text-white text-[10px] px-4 py-2 rounded-lg font-extrabold shadow-sm cursor-pointer"
                              >
                                {selectedTestimonial ? 'Update Ulasan' : 'Simpan Ulasan cloud'}
                              </button>
                            </div>
                          </form>
                        )}

                        {/* Testimonials list block */}
                        <div className="divide-y divide-zinc-150 border border-zinc-150 rounded-2xl overflow-hidden bg-white max-h-[40vh] overflow-y-auto">
                          {testimonials.length === 0 ? (
                            <div className="py-8 text-center text-xs text-zinc-400 font-bold">
                              Belum ada ulasan kustom di cloud. Web akan otomatis jatuh kembali ke testimoni bawaan statis.
                            </div>
                          ) : (
                            testimonials.map((t) => (
                              <div key={t.id} className="p-3 flex items-center gap-3 hover:bg-zinc-50">
                                <img src={t.avatar} alt="User Avatar" className="w-9 h-9 rounded-full object-cover border" />
                                <div className="flex-grow min-w-0">
                                  <div className="flex items-center gap-1.5">
                                    <span className="text-xs font-black text-brand-charcoal truncate block font-display">{t.name}</span>
                                    <span className="text-[9px] text-zinc-400 bg-zinc-50 px-1 rounded truncate font-bold">{t.role}</span>
                                  </div>
                                  <p className="text-[10px] text-brand-charcoal/70 line-clamp-1 italic mt-0.5">"{t.text}"</p>
                                </div>
                                <div className="flex gap-1">
                                  <button
                                    onClick={() => handleOpenTestimonyForm(t)}
                                    className="p-1 text-zinc-500 hover:text-rose-600 border border-zinc-150 rounded hover:bg-zinc-50"
                                  >
                                    <Edit2 className="w-3 h-3" />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteTestimonialForm(t.id)}
                                    className="p-1 text-red-500 hover:text-red-750 border border-red-100 rounded bg-red-50"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </button>
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    )}

                    {settingsSubTab === 'feed' && (
                      <div className="space-y-6">
                        {/* INSTAGRAM SETTINGS UNIT */}
                        <div className="space-y-3.5 border border-zinc-200 p-4 rounded-3xl bg-white shadow-xs">
                          <div className="flex justify-between items-center border-b border-zinc-100 pb-2">
                            <div>
                              <h5 className="text-xs font-black text-brand-charcoal font-display uppercase tracking-wide text-rose-600">Postingan Instagram Cloud</h5>
                              <p className="text-[10px] text-zinc-400 font-bold">Terunggah di cloud: {instagramPosts.length} konten kustom.</p>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleOpenIgForm()}
                              className="bg-zinc-900 hover:bg-zinc-850 text-white font-bold text-[10px] py-1.5 px-3 rounded-lg flex items-center gap-1 cursor-pointer"
                            >
                              <Plus className="w-3 h-3" />
                              Tambah Post Instagram
                            </button>
                          </div>

                          {isIgFormOpen && (
                            <form onSubmit={handleSaveIgForm} className="bg-zinc-50 border border-zinc-205/60 p-4 rounded-2xl space-y-3">
                              <div className="flex items-center justify-between border-b border-zinc-150 pb-2 font-display text-xs font-black">
                                <span className="text-zinc-700">Submisi Post Instagram</span>
                                <button type="button" onClick={() => setIsIgFormOpen(false)} className="text-zinc-400">Tutup x</button>
                              </div>
                              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                                <div className="sm:col-span-8">
                                  <label className="text-[10px] font-bold text-brand-charcoal block mb-0.5">Tautan URL Gambar / Foto Instagram (Tampilan Konten)</label>
                                  <input
                                    type="url"
                                    required
                                    value={igThumbnail}
                                    onChange={(e) => setIgThumbnail(e.target.value)}
                                    placeholder="Tempelkan link file foto/thumbnail di sini..."
                                    className="w-full bg-white border border-zinc-200 rounded-lg px-2.5 py-1.5 text-xs text-brand-charcoal font-mono"
                                  />
                                </div>
                                <div className="sm:col-span-4">
                                  <label className="text-[10px] font-bold text-brand-charcoal block mb-0.5">Jenis Konten</label>
                                  <select
                                    value={igType}
                                    onChange={(e) => setIgType(e.target.value as 'image' | 'video')}
                                    className="w-full bg-white border border-zinc-200 rounded-lg px-2 py-1.5 text-xs text-brand-charcoal font-bold"
                                  >
                                    <option value="image">Gambar Statis (Image)</option>
                                    <option value="video">Simulasi Video Reels</option>
                                  </select>
                                </div>
                              </div>
                              <div className="grid grid-cols-2 gap-3">
                                <div>
                                  <label className="text-[10px] font-bold text-brand-charcoal block mb-0.5">Jumlah Sukaan (Likes View)</label>
                                  <input
                                    type="text"
                                    value={igLikes}
                                    onChange={(e) => setIgLikes(e.target.value)}
                                    placeholder="Contoh: 1.5K"
                                    className="w-full bg-white border border-zinc-200 rounded-lg px-2.5 py-1.5 text-xs text-brand-charcoal"
                                  />
                                </div>
                                <div>
                                  <label className="text-[10px] font-bold text-brand-charcoal block mb-0.5">Komentar count</label>
                                  <input
                                    type="text"
                                    value={igComments}
                                    onChange={(e) => setIgComments(e.target.value)}
                                    placeholder="Contoh: 104"
                                    className="w-full bg-white border border-zinc-200 rounded-lg px-2.5 py-1.5 text-xs text-brand-charcoal"
                                  />
                                </div>
                              </div>
                              <div>
                                <label className="text-[10px] font-bold text-brand-charcoal block mb-0.5">Caption Instagram</label>
                                <textarea
                                  required
                                  rows={2}
                                  value={igCaption}
                                  onChange={(e) => setIgCaption(e.target.value)}
                                  placeholder="Tulis caption postingan yang memikat pembeli..."
                                  className="w-full bg-white border border-zinc-300 rounded-lg px-2.5 py-1.5 text-xs text-brand-charcoal focus:outline-none focus:border-rose-505"
                                />
                              </div>
                              <div>
                                <label className="text-[10px] font-bold text-brand-charcoal block mb-0.5">Hashtags (Pisahkan dengan koma)</label>
                                <input
                                  type="text"
                                  value={igTags}
                                  onChange={(e) => setIgTags(e.target.value)}
                                  placeholder="Contoh: SukiYusuki, KulinerBanyumas"
                                  className="w-full bg-white border border-zinc-200 rounded-lg px-2.5 py-1.5 text-xs text-brand-charcoal"
                                />
                              </div>
                              <div className="flex justify-end gap-2 text-[10px] font-bold">
                                <button type="button" onClick={() => setIsIgFormOpen(false)} className="bg-zinc-200 px-3.5 py-1.5 rounded-lg font-bold">Batal</button>
                                <button type="submit" className="bg-zinc-900 text-white px-4 py-1.5 rounded-lg font-black shadow-xs cursor-pointer">Simpan Post</button>
                              </div>
                            </form>
                          )}

                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-zinc-50 p-3 rounded-2xl border border-zinc-150 max-h-[30vh] overflow-y-auto">
                            {instagramPosts.length === 0 ? (
                              <div className="col-span-4 text-center py-6 text-xs text-zinc-400 font-bold">
                                Belum ada post IG cloud. Web otomatis merender koleksi post bawaaan.
                              </div>
                            ) : (
                              instagramPosts.map((ig) => (
                                <div key={ig.id} className="relative group rounded-xl overflow-hidden aspect-square border border-zinc-200 shadow-2xs">
                                  <img src={ig.thumbnail} alt="Ig" className="w-full h-full object-cover" />
                                  <div className="absolute inset-x-0 bottom-0 bg-black/60 p-1.5 flex justify-between items-center text-white">
                                    <span className="text-[8px] font-black font-mono truncate max-w-[50px]">L: {ig.likes}</span>
                                    <div className="flex gap-1 z-10">
                                      <button onClick={() => handleOpenIgForm(ig)} className="p-0.5 bg-zinc-900 hover:bg-rose-600 rounded">
                                        <Edit2 className="w-2.5 h-2.5 text-white" />
                                      </button>
                                      <button onClick={() => handleDeleteIgForm(ig.id)} className="p-0.5 bg-red-950 hover:bg-red-800 rounded">
                                        <Trash2 className="w-2.5 h-2.5 text-red-400" />
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              ))
                            )}
                          </div>
                        </div>

                        {/* TIKTOK SETTINGS UNIT */}
                        <div className="space-y-3.5 border border-zinc-200 p-4 rounded-3xl bg-white shadow-xs">
                          <div className="flex justify-between items-center border-b border-zinc-100 pb-2">
                            <div>
                              <h5 className="text-xs font-black text-brand-charcoal font-display uppercase tracking-wide text-cyan-600">Video TikTok Player Cloud</h5>
                              <p className="text-[10px] text-zinc-400 font-bold">Terunggah di cloud: {tiktokPosts.length} video kustom.</p>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleOpenTkForm()}
                              className="bg-black hover:bg-zinc-900 text-[#00f2fe] hover:scale-105 active:scale-95 transition-all font-bold text-[10px] py-1.5 px-3 rounded-lg flex items-center gap-1 cursor-pointer"
                            >
                              <Plus className="w-3 h-3" />
                              Tambah Video TikTok
                            </button>
                          </div>

                          {isTkFormOpen && (
                            <form onSubmit={handleSaveTkForm} className="bg-zinc-50 border border-zinc-200/60 p-4 rounded-2xl space-y-3">
                              <div className="flex items-center justify-between border-b border-zinc-150 pb-2 font-display text-xs font-black text-zinc-800">
                                <span>Submisi Simulasi Video TikTok</span>
                                <button type="button" onClick={() => setIsTkFormOpen(false)} className="text-zinc-400">Tutup x</button>
                              </div>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                  <label className="text-[10px] font-bold text-brand-charcoal block mb-0.5">Judul Video Singkat (Judul Sidebar)</label>
                                  <input
                                    type="text"
                                    required
                                    value={tkTitle}
                                    onChange={(e) => setTkTitle(e.target.value)}
                                    placeholder="Contoh: Menu Lumer Keju Mozzarella"
                                    className="w-full bg-white border border-zinc-200 rounded-lg px-2.5 py-1.5 text-xs text-brand-charcoal"
                                  />
                                </div>
                                <div>
                                  <label className="text-[10px] font-bold text-brand-charcoal block mb-0.5">Tautan URL Cover / Video (Tampilan Konten)</label>
                                  <input
                                    type="url"
                                    required
                                    value={tkThumbnail}
                                    onChange={(e) => setTkThumbnail(e.target.value)}
                                    placeholder="Tautan URL gambar cover visual video..."
                                    className="w-full bg-white border border-zinc-200 rounded-lg px-2.5 py-1.5 text-xs text-brand-charcoal font-mono"
                                  />
                                </div>
                              </div>
                              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                                <div>
                                  <label className="text-[9px] font-bold text-brand-charcoal block mb-0.5">Penonton (Views)</label>
                                  <input
                                    type="text"
                                    value={tkViews}
                                    onChange={(e) => setTkViews(e.target.value)}
                                    placeholder="E.g., 250K"
                                    className="w-full bg-white border border-zinc-200 rounded-lg px-2.5 py-1 text-xs"
                                  />
                                </div>
                                <div>
                                  <label className="text-[9px] font-bold text-brand-charcoal block mb-0.5">Suka (Likes)</label>
                                  <input
                                    type="text"
                                    value={tkLikes}
                                    onChange={(e) => setTkLikes(e.target.value)}
                                    placeholder="E.g., 12.5K"
                                    className="w-full bg-white border border-zinc-200 rounded-lg px-2.5 py-1 text-xs"
                                  />
                                </div>
                                <div>
                                  <label className="text-[9px] font-bold text-brand-charcoal block mb-0.5">Komenter Count</label>
                                  <input
                                    type="text"
                                    value={tkCommentsCount}
                                    onChange={(e) => setTkCommentsCount(e.target.value)}
                                    placeholder="E.g., 85"
                                    className="w-full bg-white border border-zinc-200 rounded-lg px-2.5 py-1 text-xs"
                                  />
                                </div>
                                <div>
                                  <label className="text-[9px] font-bold text-brand-charcoal block mb-0.5">Bagikan (Shares)</label>
                                  <input
                                    type="text"
                                    value={tkShares}
                                    onChange={(e) => setTkShares(e.target.value)}
                                    placeholder="E.g., 40"
                                    className="w-full bg-white border border-zinc-200 rounded-lg px-2.5 py-1 text-xs"
                                  />
                                </div>
                              </div>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                  <label className="text-[10px] font-bold text-brand-charcoal block mb-0.5">Suara Pengiring (Audio Sound Label)</label>
                                  <input
                                    type="text"
                                    value={tkSound}
                                    onChange={(e) => setTkSound(e.target.value)}
                                    placeholder="E.g., Suki Yusuki Original Sound"
                                    className="w-full bg-white border border-zinc-205 rounded-lg px-2.5 py-1.5 text-xs"
                                  />
                                </div>
                                <div>
                                  <label className="text-[10px] font-bold text-brand-charcoal block mb-0.5">Tags Video (Pisahkan koma)</label>
                                  <input
                                    type="text"
                                    value={tkTags}
                                    onChange={(e) => setTkTags(e.target.value)}
                                    placeholder="E.g., SukiYusuki, KulinerPurwokerto"
                                    className="w-full bg-white border border-zinc-205 rounded-lg px-2.5 py-1.5 text-xs"
                                  />
                                </div>
                              </div>
                              <div>
                                <label className="text-[10px] font-bold text-brand-charcoal block mb-0.5">Deskripsi / Keterangan Caption Video</label>
                                <textarea
                                  required
                                  rows={1.5}
                                  value={tkCaption}
                                  onChange={(e) => setTkCaption(e.target.value)}
                                  placeholder="Tulis ringkasan keterangan TikTok..."
                                  className="w-full bg-white border border-zinc-200 rounded-lg px-2.5 py-1 text-xs"
                                />
                              </div>
                              <div className="flex justify-end gap-2 text-[10px] font-bold pt-1">
                                <button type="button" onClick={() => setIsTkFormOpen(false)} className="bg-zinc-200 px-3.5 py-1.5 rounded-lg font-bold">Batal</button>
                                <button type="submit" className="bg-black text-white hover:text-[#00f2fe] px-4 py-1.5 rounded-lg font-black shadow-xs cursor-pointer">Simpan TikTok Video</button>
                              </div>
                            </form>
                          )}

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-zinc-50 p-3 rounded-2xl border border-zinc-150 max-h-[30vh] overflow-y-auto">
                            {tiktokPosts.length === 0 ? (
                              <div className="col-span-2 text-center py-6 text-xs text-zinc-400 font-bold">
                                Belum ada video TikTok cloud. Video default bawaan statis akan dirujuk otomatis.
                              </div>
                            ) : (
                              tiktokPosts.map((tk) => (
                                <div key={tk.id} className="p-2 bg-white rounded-xl border border-zinc-200 flex items-center justify-between shadow-3xs gap-3">
                                  <div className="flex items-center gap-3 min-w-0">
                                    <div className="w-13 h-13 rounded-lg overflow-hidden border flex-shrink-0 bg-zinc-100">
                                      <img src={tk.thumbnail} alt="Visual cover" className="w-full h-full object-cover" />
                                    </div>
                                    <div className="min-w-0">
                                      <span className="text-xs font-black font-display truncate block text-brand-charcoal">{tk.videoTitle}</span>
                                      <span className="text-[10px] font-mono text-zinc-400 font-bold">Mata: {tk.views} | Suka: {tk.likes}</span>
                                    </div>
                                  </div>
                                  <div className="flex gap-1.5">
                                    <button onClick={() => handleOpenTkForm(tk)} className="p-1 border border-zinc-150 rounded hover:bg-zinc-100 text-zinc-500">
                                      <Edit2 className="w-3 h-3" />
                                    </button>
                                    <button onClick={() => handleDeleteTkForm(tk.id)} className="p-1 border border-red-100 rounded bg-red-50 text-red-500 hover:bg-red-100">
                                      <Trash2 className="w-3 h-3" />
                                    </button>
                                  </div>
                                </div>
                              ))
                            )}
                          </div>
                        </div>
                      </div>
                    )}
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
                <div className="space-y-2 border-t border-zinc-100 pt-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-brand-charcoal block">
                      Tautan Foto Menu / Kustom URL <span className="text-red-500">*</span>
                    </label>
                    <span className="text-[10px] text-primary-orange-dark font-extrabold uppercase font-mono">Pilih preset di bawah</span>
                  </div>
                  <input
                    type="url"
                    required
                    value={formImage}
                    onChange={(e) => setFormImage(e.target.value)}
                    placeholder="Masukkan URL foto atau klik preset koleksi di bawah"
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3.5 py-2.5 text-xs text-brand-charcoal focus:outline-none focus:border-primary-orange transition-colors font-mono text-[10px]"
                  />

                  {/* Preset selections for fast click assignments */}
                  <div className="space-y-1 bg-zinc-50 rounded-2xl border border-zinc-200/50 p-2.5">
                    <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-wide block mb-1"> Preset Foto Bawaan Yusuki </span>
                    <div className="flex gap-2 overflow-x-auto pb-1.5 scrollbar-thin">
                      {uniquePresets.map((pr, idx) => {
                        const isSelected = formImage === pr.image;
                        return (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => setFormImage(pr.image)}
                            className={`relative w-12 h-12 rounded-xl overflow-hidden border flex-shrink-0 bg-white shadow-xs focus:outline-none cursor-pointer transition-all ${
                              isSelected
                                ? 'border-primary-orange ring-2 ring-primary-orange/50 scale-95'
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
                                <Check className="w-4 h-4 text-white" />
                              </div>
                            )}
                          </button>
                        );
                      })}
                    </div>
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
      </AnimatePresence>
    </AnimatePresence>
  );
}
