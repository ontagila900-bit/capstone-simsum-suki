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
