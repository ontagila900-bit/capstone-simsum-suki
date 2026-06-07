/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface MenuItem {
  id: string;
  name: string;
  price: number; // in thousand IDR (e.g., 14 for 14K) or absolute number (e.g., 14000)
  category: MenuCategory;
  description: string;
  pieces?: number; // e.g., 3, 4, 5 if specified
  image: string;
  isBestSeller?: boolean;
  tags?: string[];
  isDeleted?: boolean;
  isAvailable?: boolean;
}

export type MenuCategory =
  | 'DIMSUM ORIGINAL'
  | 'DIMSUM GORENG'
  | 'DIMSUM MENTAI'
  | 'DIMSUM TAR-TAR'
  | 'DIMSUM CARBONARA'
  | 'DIMSUM HOT SPICY'
  | 'DIMSUM KOMBINASI'
  | 'DIMSUM JUMBO'
  | 'SUKI'
  | 'LAINNYA';

export interface CartItem {
  menuItem: MenuItem;
  quantity: number;
}

export interface Testimonial {
  id: string;
  name: string;
  role: string;
  text: string;
  rating: number;
  avatar: string;
  date: string;
}

export interface FaqItem {
  id: string;
  question: string;
  answer: string;
  isDeleted?: boolean;
}

export interface InstagramPost {
  id: string;
  type: 'image' | 'video';
  thumbnail: string;
  likes: string;
  comments: string;
  caption: string;
  tags: string[];
}

export interface AppSettings {
  logoUrl?: string;
  heroImageUrl?: string;
  heroTagline1?: string; // e.g., "ESTABLISHED 2021"
  heroTagline2?: string; // e.g., "Sering SOLD OUT dlm beberapa jam!"
  heroTitle?: string; // e.g., "Dimsum Homemade Premium Favorit Semua Kalangan"
  heroDescription?: string; // e.g., "Nikmati kehangatan dimsum... "
  heroCtaButton1Label?: string; // e.g., "Pesan via WA"
  heroCtaButton2Label?: string; // e.g., "Lihat Menu Lengkap"
  heroStat1Value?: string; // e.g., "100%"
  heroStat1Label?: string; // e.g., "Halal & Higienis"
  heroStat2Value?: string; // e.g., "25+"
  heroStat2Label?: string; // e.g., "Pilihan Varian"
  heroStat3Value?: string; // e.g., "4.9"
  heroStat3Label?: string; // e.g., "Rating G-Maps"
  heroBadge1Text?: string; // e.g., "Dibuat Fresh Setiap Hari"
  heroBadge2Text?: string; // e.g., "Praktis Pesan Take Away"
  aboutUsImageUrl?: string;
  outletName?: string;
  outletAddress?: string;
  outletGmaps?: string;
  operatingHours?: string;
  operatingHoursSub?: string;
  operatingDays?: string;
  operatingDaysSub?: string;
  whatsappNumber?: string;
  whatsappName?: string;
  whatsappHandle?: string;
  instagramUrl?: string;
  instagramHandle?: string;
  tiktokUrl?: string;
  tiktokHandle?: string;
  shopeefoodUrl?: string;
  gofoodUrl?: string;
  outletDescription?: string;
}

export interface TikTokVideoSim {
  id: string;
  videoTitle: string;
  thumbnail: string;
  views: string;
  likes: string;
  commentsCount: string;
  shares: string;
  caption: string;
  tags: string[];
  sound: string;
  commentsList: { username: string; text: string; time: string }[];
}

export interface InfoTambahanItem {
  id: string;
  type: 'quality' | 'benefit';
  title: string;
  desc: string;
  icon: string;
  isDeleted?: boolean;
}

export interface AboutSlideItem {
  id: string;
  title: string;
  subtitle?: string;
  image: string;
  paragraphs: string[];
  bullet1Title?: string;
  bullet1Desc?: string;
  bullet2Title?: string;
  bullet2Desc?: string;
  isDeleted?: boolean;
}
