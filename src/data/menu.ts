/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { MenuItem, MenuCategory, InstagramPost, Testimonial, FaqItem, InfoTambahanItem, AboutSlideItem } from '../types';
import dimsumMentaiImg from '../assets/images/dimsum_mentai_1780424325675.png';
import dimsumCarbonaraImg from '../assets/images/dimsum_carbonara_1780425409580.png';
import dimsumTartarImg from '../assets/images/dimsum_tartar_1780425894325.png';
import dimsumMixGorengImg from '../assets/images/dimsum_mix_goreng_1780426187016.png';
import dimsumOriImg from '../assets/images/dimsum_ori_1780426987103_1780447303727.png';
import dimsumKulitTahuImg from '../assets/images/dimsum_kulit_tahu_1780447516920.png';
import dimsumTahuGorengImg from '../assets/images/dimsum_tahu_goreng_1780447781123.png';
import dimsumEkadoImg from '../assets/images/dimsum_ekado_1780448031869.png';
import dimsumLumpiaUdangTahuImg from '../assets/images/dimsum_lumpia_udang_tahu_1780448992865.png';
import dimsumPangsitUdangImg from '../assets/images/dimsum_pangsit_udang_1780449823502.png';
import dimsumDumplingUdangImg from '../assets/images/dimsum_dumpling_udang_1780450105177.png';
import dimsumDuriLandakImg from '../assets/images/dimsum_duri_landak_1780450307268.png';
import dimsumHotSpicyImg from '../assets/images/dimsum_hot_spicy_1780450506311.png';
import dimsumOriGorengImg from '../assets/images/dimsum_ori_goreng_1780450855445.png';
import dimsumKombiOriMentaiImg from '../assets/images/dimsum_kombi_ori_mentai_1780451286313.png';
import dimsumKombiOriTartarImg from '../assets/images/dimsum_kombi_ori_tartar_1780451728756.png';
import dimsumKombiOriCarboImg from '../assets/images/dimsum_kombi_ori_carbo_1780451744987.png';
import dimsumKombiMentaiCarboImg from '../assets/images/dimsum_kombi_mentai_carbo_1780451761924.png';
import dimsumKombiMentaiTartarImg from '../assets/images/dimsum_kombi_mentai_tartar_1780451781923.png';
import dimsumKombiTartarCarboImg from '../assets/images/dimsum_kombi_tartar_carbo_1780451800389.png';
import dimsumKombiTripleImg from '../assets/images/dimsum_kombi_triple_1780451821566.png';
import dimsumJumboOriImg from '../assets/images/dimsum_jumbo_ori_1780452124925.png';
import dimsumJumboGorImg from '../assets/images/dimsum_jumbo_gor_1780452139334.png';
import dimsumJumboMentaiImg from '../assets/images/dimsum_jumbo_mentai_1780452153707.png';
import dimsumJumboTartarImg from '../assets/images/dimsum_jumbo_tartar_1780452168191.png';
import dimsumJumboCarboImg from '../assets/images/dimsum_jumbo_carbo_1780452181678.png';
import sukiSmallImg from '../assets/images/suki_small_1780452485384.png';
import sukiMediumImg from '../assets/images/suki_medium_1780452500574.png';
import angsioCekerAyamImg from '../assets/images/angsio_ceker_ayam_1780452515313.png';

export const CATEGORIES: MenuCategory[] = [
  'DIMSUM ORIGINAL',
  'DIMSUM GORENG',
  'DIMSUM MENTAI',
  'DIMSUM TAR-TAR',
  'DIMSUM CARBONARA',
  'DIMSUM HOT SPICY',
  'DIMSUM KOMBINASI',
  'DIMSUM JUMBO',
  'SUKI',
  'LAINNYA',
];

export const MENU_ITEMS: MenuItem[] = [
  // BEST SELLERS (These are featured directly in the Best Sellers Section and are part of their respective categories)
  {
    id: 'b-mentai',
    name: 'Dimsum Mentai (Best Seller)',
    price: 16000,
    category: 'DIMSUM MENTAI',
    description: 'Dimsum lembut kukus berbalut saus mentai creamy khas Jepang yang ditorch hingga smoky aromatik, bertabur nori melimpah.',
    pieces: 4,
    image: dimsumMentaiImg,
    isBestSeller: true,
    tags: ['Favorit', 'Smoky', 'Creamy'],
  },
  {
    id: 'b-carbonara',
    name: 'Dimsum Carbonara (Best Seller)',
    price: 17000,
    category: 'DIMSUM CARBONARA',
    description: 'Sensasi fusion unik dimsum empuk disiram saus carbonara ala Italia yang gurih super keju, bertaburkan smoked beef bits.',
    pieces: 4,
    image: dimsumCarbonaraImg,
    isBestSeller: true,
    tags: ['Unik', 'Super Cheesy', 'Anak Muda'],
  },
  {
    id: 'b-tartar',
    name: 'Dimsum Tar-Tar (Best Seller)',
    price: 17000,
    category: 'DIMSUM TAR-TAR',
    description: 'Kombinasi dimsum hangat premium bersanding dengan lumuran saus tar-tar segar, asam gurih, dan daun kucai segar.',
    pieces: 4,
    image: dimsumTartarImg,
    isBestSeller: true,
    tags: ['Fresh', 'Saus Tar-tar', 'Gurih Nagih'],
  },
  {
    id: 'b-mix-goreng',
    name: 'Mix Goreng (Best Seller)',
    price: 18000,
    category: 'DIMSUM GORENG',
    description: 'Paket kombinasi aneka gorengan autentik: lumpia udang, pangsit, duri landak, dan ekado super renyah di luar, juicy di dalam.',
    pieces: 4,
    image: dimsumMixGorengImg,
    isBestSeller: true,
    tags: ['Crispy Jumbo', 'Komplit', 'Camilan'],
  },

  // 1. DIMSUM ORIGINAL
  {
    id: 'ori-3',
    name: 'Dimsum Ori 3pcs',
    price: 11000,
    category: 'DIMSUM ORIGINAL',
    description: 'Dimsum kukus homemade klasik dengan adonan ayam segar melimpah and kulit lembut berkualitas.',
    pieces: 3,
    image: dimsumOriImg,
  },
  {
    id: 'ori-4',
    name: 'Dimsum Ori 4pcs',
    price: 14000,
    category: 'DIMSUM ORIGINAL',
    description: 'Dimsum kukus premium rasa ayam murni. Pas untuk sekadar camilan sore hangat yang mengenyangkan.',
    pieces: 4,
    image: dimsumOriImg,
  },
  {
    id: 'ori-5',
    name: 'Dimsum Ori 5pcs',
    price: 16000,
    category: 'DIMSUM ORIGINAL',
    description: 'Porsi puas dimsum original kukus lengkap dengan saus sambal racikan spesial Yusuki.',
    pieces: 5,
    image: dimsumOriImg,
  },
  {
    id: 'ori-tahu-3',
    name: 'Kulit Tahu 3pcs',
    price: 13000,
    category: 'DIMSUM ORIGINAL',
    description: 'Adonan ayam gurih dibalut kulit kembang tahu sutra yang lembut lalu dikukus hingga meresap.',
    pieces: 3,
    image: dimsumKulitTahuImg,
  },

  // 2. DIMSUM GORENG
  {
    id: 'gor-3',
    name: 'Dimsum Ori Goreng 3pcs',
    price: 12000,
    category: 'DIMSUM GORENG',
    description: 'Sensasi garing renyah di luar tapi tetap basah juicy di dalam. Digoreng fresh dadakan.',
    pieces: 3,
    image: dimsumOriGorengImg,
  },
  {
    id: 'gor-4',
    name: 'Dimsum Ori Goreng 4pcs',
    price: 15000,
    category: 'DIMSUM GORENG',
    description: 'Dimsum goreng krispi renyah, nikmat dicocol dengan chili-oil homemade spesial kami.',
    pieces: 4,
    image: dimsumOriGorengImg,
  },
  {
    id: 'gor-5',
    name: 'Dimsum Ori Goreng 5pcs',
    price: 17000,
    category: 'DIMSUM GORENG',
    description: 'Porsi sharing dimsum goreng hangat super krispi dengan cocolan saus pedas manis mantap.',
    pieces: 5,
    image: dimsumOriGorengImg,
  },
  {
    id: 'gor-tahu-3',
    name: 'Kulit Tahu Goreng 3pcs',
    price: 14000,
    category: 'DIMSUM GORENG',
    description: 'Kembang tahu sutra isi ayam giling, digoreng garing hingga teksturnya mekar bersarang.',
    pieces: 3,
    image: dimsumTahuGorengImg,
  },
  {
    id: 'gor-ekado',
    name: 'Ekado',
    price: 14000,
    category: 'DIMSUM GORENG',
    description: 'Kantong krispi isi adonan telur puyuh utuh di dalam, diikat rapi dan digoreng garing keemasan.',
    image: dimsumEkadoImg,
  },
  {
    id: 'gor-lumpia-udang',
    name: 'Lumpia Udang',
    price: 14000,
    category: 'DIMSUM GORENG',
    description: 'Cincangan udang segar berbalut kulit lumpia tipis yang digoreng garing renyah maksimal.',
    image: dimsumLumpiaUdangTahuImg,
  },
  {
    id: 'gor-pangsit-udang',
    name: 'Pangsit Udang',
    price: 14000,
    category: 'DIMSUM GORENG',
    description: 'Pangsit renyah bersayap lebar berisi daging udang juicy yang gurih harum minyak wijen.',
    image: dimsumPangsitUdangImg,
  },
  {
    id: 'gor-duri-landak',
    name: 'Duri Landak',
    price: 14000,
    category: 'DIMSUM GORENG',
    description: 'Camilan unik berbentuk bola-bola berbalut rumbai garing renyah seperti duri landak, manis gurih.',
    image: dimsumDuriLandakImg,
  },
  {
    id: 'gor-dumpling',
    name: 'Dumplings',
    price: 14000,
    category: 'DIMSUM GORENG',
    description: 'Daging ayam cincang bumbu oriental tebal dibalut adonan dumpling berbentu saku, digoreng krispi.',
    image: dimsumDumplingUdangImg,
  },
  {
    id: 'gor-mix-3',
    name: 'Mix Goreng 3pcs',
    price: 14000,
    category: 'DIMSUM GORENG',
    description: 'Kombinasi hemat 3 buah dimsum goreng random (Ekado/Pangsit/Udang/Lumpia) pas dicoba.',
    pieces: 3,
    image: dimsumMixGorengImg,
  },
  {
    id: 'gor-mix-4',
    name: 'Mix Goreng 4pcs',
    price: 18000,
    category: 'DIMSUM GORENG',
    description: '4 gorengan campur khas yusuki. Hangat, renyah, ramah di kantong.',
    pieces: 4,
    image: dimsumMixGorengImg,
  },
  {
    id: 'gor-mix-5',
    name: 'Mix Goreng 5pcs',
    price: 21000,
    category: 'DIMSUM GORENG',
    description: 'Pesta krispi 5 macam gorengan premium laku keras ditiup hangat berselimut kelezatan.',
    pieces: 5,
    image: dimsumMixGorengImg,
  },

  // 3. DIMSUM MENTAI
  {
    id: 'mentai-3',
    name: 'Dimsum Mentai 3pcs',
    price: 13000,
    category: 'DIMSUM MENTAI',
    description: 'Tiga butir dimsum hangat dengan lumuran mentai sauce khas jepang racikan rahasia, ditorch wangi.',
    pieces: 3,
    image: dimsumMentaiImg,
  },
  {
    id: 'mentai-4',
    name: 'Dimsum Mentai 4pcs',
    price: 16000,
    category: 'DIMSUM MENTAI',
    description: 'Sajian ikonik Dimsum Suki Yusuki. Saus mentai yang gurih-pedas-creamy berbaur juicy ayam.',
    pieces: 4,
    image: dimsumMentaiImg,
  },
  {
    id: 'mentai-5',
    name: 'Dimsum Mentai 5pcs',
    price: 20000,
    category: 'DIMSUM MENTAI',
    description: 'Super puas 5 pcs dimsum mentai bakar asap wangi berlimpah keju & serpihan seaweed nori gurih.',
    pieces: 5,
    image: dimsumMentaiImg,
  },

  // 4. DIMSUM TAR-TAR
  {
    id: 'tartar-3',
    name: 'Dimsum Tar-Tar 3pcs',
    price: 14000,
    category: 'DIMSUM TAR-TAR',
    description: 'Saus krim tartar yang asam segar berminyak zaitun ringan dipadu kelezatan dimsum segar.',
    pieces: 3,
    image: dimsumTartarImg,
  },
  {
    id: 'tartar-4',
    name: 'Dimsum Tar-Tar 4pcs',
    price: 17000,
    category: 'DIMSUM TAR-TAR',
    description: 'Sensasi rasa tartar yang creamy dingin segar di atas dimsum kental hangat yang gurih mantap.',
    pieces: 4,
    image: dimsumTartarImg,
  },
  {
    id: 'tartar-5',
    name: 'Dimsum Tar-Tar 5pcs',
    price: 20000,
    category: 'DIMSUM TAR-TAR',
    description: 'Camilan kekinian dengan limpahan saus asam-manis tar-tar creamy bertabur bumbu daun herba.',
    pieces: 5,
    image: dimsumTartarImg,
  },

  // 5. DIMSUM CARBONARA
  {
    id: 'carbo-3',
    name: 'Dimsum Carbonara 3pcs',
    price: 14000,
    category: 'DIMSUM CARBONARA',
    description: 'Dibalut keju krim susu eropa kental wangi lada hitam, melumuri tiap gigitan dimsum empuk.',
    pieces: 3,
    image: dimsumCarbonaraImg,
  },
  {
    id: 'carbo-4',
    name: 'Dimsum Carbonara 4pcs',
    price: 17000,
    category: 'DIMSUM CARBONARA',
    description: 'Favorit anak muda! Rasa keju kental gurih berlebih khas carbonara dipanggang dengan smoked beef.',
    pieces: 4,
    image: dimsumCarbonaraImg,
  },
  {
    id: 'carbo-5',
    name: 'Dimsum Carbonara 5pcs',
    price: 20000,
    category: 'DIMSUM CARBONARA',
    description: 'Kombinasi termewah saus pasta carbonara gurih creamy asin di atas 5 dimsum premium terlaris.',
    pieces: 5,
    image: dimsumCarbonaraImg,
  },

  // 6. DIMSUM HOT SPICY
  {
    id: 'spicy-3',
    name: 'Dimsum Hot Spicy 3pcs',
    price: 13000,
    category: 'DIMSUM HOT SPICY',
    description: 'Diguyur chili oil premium rahasia Yusuki yang pedas nendang, berempah kuat harum bawang putih.',
    pieces: 3,
    image: dimsumHotSpicyImg,
  },
  {
    id: 'spicy-4',
    name: 'Dimsum Hot Spicy 4pcs',
    price: 16000,
    category: 'DIMSUM HOT SPICY',
    description: 'Rasa pedas membakar dengan sentuhan manis-gurih khas szechuan. Sangat nagih pecinta pedas.',
    pieces: 4,
    image: dimsumHotSpicyImg,
  },
  {
    id: 'spicy-5',
    name: 'Dimsum Hot Spicy 5pcs',
    price: 20000,
    category: 'DIMSUM HOT SPICY',
    description: 'Paling viral! Limpahan cabai kering sangrai gurih berminyak wijen mengguyur 5 butir dimsum.',
    pieces: 5,
    image: dimsumHotSpicyImg,
  },

  // 7. DIMSUM KOMBINASI
  {
    id: 'kombi-ori-mentai-3',
    name: 'Kombi Ori-Mentai 3pcs',
    price: 12000,
    category: 'DIMSUM KOMBINASI',
    description: 'Nikmati perpaduan rasa original kukus mulus dan sensasi saus bakar mentai legendaris.',
    pieces: 3,
    image: dimsumKombiOriMentaiImg,
  },
  {
    id: 'kombi-ori-mentai-4',
    name: 'Kombi Ori-Mentai 4pcs',
    price: 15000,
    category: 'DIMSUM KOMBINASI',
    description: 'Kombinasi pas isi 2 original dan 2 saus mentai bakar. Nikmat ganda lebih terjangkau.',
    pieces: 4,
    image: dimsumKombiOriMentaiImg,
  },
  {
    id: 'kombi-ori-mentai-5',
    name: 'Kombi Ori-Mentai 5pcs',
    price: 19000,
    category: 'DIMSUM KOMBINASI',
    description: 'Kombinasi 3 dimsum original dan 2 dimsum saus mentai bakar, porsi kenyang nikmat murni.',
    pieces: 5,
    image: dimsumKombiOriMentaiImg,
  },
  {
    id: 'kombi-ori-tartar-3',
    name: 'Kombi Ori-Tartar 3pcs',
    price: 13000,
    category: 'DIMSUM KOMBINASI',
    description: 'Paduan rasa original gurih natural dipadankan saus tar-tar asam segar seimbang.',
    pieces: 3,
    image: dimsumKombiOriTartarImg,
  },
  {
    id: 'kombi-ori-tartar-4',
    name: 'Kombi Ori-Tartar 4pcs',
    price: 16000,
    category: 'DIMSUM KOMBINASI',
    description: 'Bagi dua sensasi hangat klasik original dan cocolan dingin menyegarkan khas saus tartar.',
    pieces: 4,
    image: dimsumKombiOriTartarImg,
  },
  {
    id: 'kombi-ori-tartar-5',
    name: 'Kombi Ori-Tartar 5pcs',
    price: 19000,
    category: 'DIMSUM KOMBINASI',
    description: 'Bebas bosan dengan perpaduan 3 original murni pas bersalin 2 lumuran tar-tar herbal dingin.',
    pieces: 5,
    image: dimsumKombiOriTartarImg,
  },
  {
    id: 'kombi-ori-carbo-3',
    name: 'Kombi Ori-Carbonara 3pcs',
    price: 13000,
    category: 'DIMSUM KOMBINASI',
    description: 'Rasakan perpaduan dimsum kukus original berpadu dimsum keju kental italia carbonara.',
    pieces: 3,
    image: dimsumKombiOriCarboImg,
  },
  {
    id: 'kombi-ori-carbo-4',
    name: 'Kombi Ori-Carbonara 4pcs',
    price: 16000,
    category: 'DIMSUM KOMBINASI',
    description: 'Variasi idola berkumpul: 2 original kukus mulia diapit 2 saus krim keju beef yang kaya.',
    pieces: 4,
    image: dimsumKombiOriCarboImg,
  },
  {
    id: 'kombi-ori-carbo-5',
    name: 'Kombi Ori-Carbonara 5pcs',
    price: 19000,
    category: 'DIMSUM KOMBINASI',
    description: 'Tiga dimsum rasa original bersatu padu dengan dua dimsum tebal mandi saus carbonara wangi.',
    pieces: 5,
    image: dimsumKombiOriCarboImg,
  },
  {
    id: 'kombi-mentai-carbo-3',
    name: 'Kombi Mentai-Carbonara 3pcs',
    price: 14000,
    category: 'DIMSUM KOMBINASI',
    description: 'Temu rasa dua saus paling hits: mentai torched jepang bertemu carbonara keju klasik eropa.',
    pieces: 3,
    image: dimsumKombiMentaiCarboImg,
  },
  {
    id: 'kombi-mentai-carbo-4',
    name: 'Kombi Mentai-Carbonara 4pcs',
    price: 17000,
    category: 'DIMSUM KOMBINASI',
    description: 'Gaya duel asyik bagi penyuka krim gurih berat. Dua mentai bakar berasap dan dua keju carbonara.',
    pieces: 4,
    image: dimsumKombiMentaiCarboImg,
  },
  {
    id: 'kombi-mentai-carbo-5',
    name: 'Kombi Mentai-Carbonara 5pcs',
    price: 21000,
    category: 'DIMSUM KOMBINASI',
    description: 'Paling brutal gurihnya! Paduan tiga dimsum berselimut mentai pedas dan dua disiram krim keju.',
    pieces: 5,
    image: dimsumKombiMentaiCarboImg,
  },
  {
    id: 'kombi-mentai-tartar-3',
    name: 'Kombi Mentai-Tartar 3pcs',
    price: 14000,
    category: 'DIMSUM KOMBINASI',
    description: 'Sensasi gurih asap khas torching saus mentai bersatu dengan rasa bumbu tartar asam herba.',
    pieces: 3,
    image: dimsumKombiMentaiTartarImg,
  },
  {
    id: 'kombi-mentai-tartar-4',
    name: 'Kombi Mentai-Tartar 4pcs',
    price: 17000,
    category: 'DIMSUM KOMBINASI',
    description: 'Keseimbangan rasa: 2 mentai pedas kaya rempah bertemu 2 tartar asam gurih membilas dahaga.',
    pieces: 4,
    image: dimsumKombiMentaiTartarImg,
  },
  {
    id: 'kombi-mentai-tartar-5',
    name: 'Kombi Mentai-Tartar 5pcs',
    price: 21000,
    category: 'DIMSUM KOMBINASI',
    description: 'Sangat diminati pencari petualangan rasa: perpaduan takaran mentai bakar gurih dan asiditas tartar.',
    pieces: 5,
    image: dimsumKombiMentaiTartarImg,
  },
  {
    id: 'kombi-tartar-carbo-3',
    name: 'Kombi Tartar-Carbonara 3pcs',
    price: 14000,
    category: 'DIMSUM KOMBINASI',
    description: 'Campuran rasa saus segar dingin ala tartar disandingkan lumuran hangat carbonara gurih berat.',
    pieces: 3,
    image: dimsumKombiTartarCarboImg,
  },
  {
    id: 'kombi-tartar-carbo-4',
    name: 'Kombi Tartar-Carbonara 4pcs',
    price: 17000,
    category: 'DIMSUM KOMBINASI',
    description: 'Dua sensasi saus impor barat: tartar yang asam segar bawang kucai, carbonara yang keju susu padat.',
    pieces: 4,
    image: dimsumKombiTartarCarboImg,
  },
  {
    id: 'kombi-tartar-carbo-5',
    name: 'Kombi Tartar-Carbonara 5pcs',
    price: 21000,
    category: 'DIMSUM KOMBINASI',
    description: 'Kombinasi paling premium bagi penggemar hidangan berkuah saus tebal gaya barat.',
    pieces: 5,
    image: dimsumKombiTartarCarboImg,
  },
  {
    id: 'kombi-triple-3',
    name: 'Kombi Mentai-Tartar-Carbonara 3pcs',
    price: 14000,
    category: 'DIMSUM KOMBINASI',
    description: 'Triple combo spektakuler! Cobain berturut-turut sensasi Mentai, Tartar, dan Carbonara dalam siji porsi.',
    pieces: 3,
    image: dimsumKombiTripleImg,
  },
  {
    id: 'kombi-triple-4',
    name: 'Kombi Mentai-Tartar-Carbonara 4pcs',
    price: 17000,
    category: 'DIMSUM KOMBINASI',
    description: 'Set empat biji kombinasi acak saus premium. Pilihan pas buat yang mau mengeksplorasi cita rasa.',
    pieces: 4,
    image: dimsumKombiTripleImg,
  },
  {
    id: 'kombi-triple-5',
    name: 'Kombi Mentai-Tartar-Carbonara 5pcs',
    price: 21000,
    category: 'DIMSUM KOMBINASI',
    description: 'Pesta saas terlengkap! Kombinasi mematikan Mentai, Tartar, dan Carbonara bersama dimsum tebal juicy.',
    pieces: 5,
    image: dimsumKombiTripleImg,
  },

  // 8. DIMSUM JUMBO
  {
    id: 'jumbo-ori',
    name: 'Jumbo Ori',
    price: 14000,
    category: 'DIMSUM JUMBO',
    description: 'Satu butir dimsum raksasa kukus dengan diameter dua kali lipat, penuh padat daging ayam giling juicy.',
    image: dimsumJumboOriImg,
  },
  {
    id: 'jumbo-gor',
    name: 'Jumbo Goreng',
    price: 15000,
    category: 'DIMSUM JUMBO',
    description: 'Dimsum super jumbo digoreng garing renyah kulit luar, memberikan kepuasan mengunyah berlimpah.',
    image: dimsumJumboGorImg,
  },
  {
    id: 'jumbo-mentai',
    name: 'Jumbo Mentai',
    price: 16000,
    category: 'DIMSUM JUMBO',
    description: 'Satu butir dimsum raksasa yang dilumuri saus mentai bersemayam nori melimpah, dibakar beraroma panggangan.',
    image: dimsumJumboMentaiImg,
  },
  {
    id: 'jumbo-tartar',
    name: 'Jumbo Tar-Tar',
    price: 17000,
    category: 'DIMSUM JUMBO',
    description: 'Dimsum jumbo istimewa dengan siraman segar gurih dingin dari saus tartar spesial yang melimpah ruah.',
    image: dimsumJumboTartarImg,
  },
  {
    id: 'jumbo-carbonara',
    name: 'Jumbo Carbonara',
    price: 17000,
    category: 'DIMSUM JUMBO',
    description: 'Dimsum jumbo raksasa ayam siram saus keju susu kental khas carbonara dengan topping smoked beef panggang.',
    image: dimsumJumboCarboImg,
  },

  // 9. SUKI
  {
    id: 'suki-small',
    name: 'Suki Small',
    price: 15000,
    category: 'SUKI',
    description: 'Paket suki personal terdiri dari mie, sayuran segar, aneka bakso seafood olahan terbaik, lengkap kuah kaldu/tomyum sedap.',
    image: sukiSmallImg,
    tags: ['Segar', 'Hangat', 'Kuah Tomyum'],
  },
  {
    id: 'suki-medium',
    name: 'Suki Medium',
    price: 27000,
    category: 'SUKI',
    description: 'Porsi sharing berdua berisi aneka chikuwa, crabstick, dumpling keju, bakso ikan, sayuran hijau melimpah, dan kuah tomyum kental.',
    image: sukiMediumImg,
    tags: ['Porsi Berdua', 'Favorit Keluarga'],
  },

  // 10. LAINNYA
  {
    id: 'ceker-angsio',
    name: 'Angsio Ceker Ayam',
    price: 13000,
    category: 'LAINNYA',
    description: 'Ceker ayam gemuk yang dimasak lambat dengan bumbu angsio merah manis gurih meresap sampai ke tulang.',
    image: angsioCekerAyamImg,
    tags: ['Sensasional', 'Gaya Hong Kong', 'Empuk'],
  },
];

export const INSTAGRAM_POSTS: InstagramPost[] = [
  {
    id: 'ig-1',
    type: 'video',
    thumbnail: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=400&q=80',
    likes: '1,245',
    comments: '42',
    caption: 'Proses melimpahnya saus Mentai torching! 🔥 Masih anget, meleleh di mulut! Yuk merapat ke outlet sebelum kehabisan jam 7 malam ya bestie!',
    tags: ['#DimsumYusuki', '#DimsumMentai', '#KulinerViral'],
  },
  {
    id: 'ig-2',
    type: 'image',
    thumbnail: 'https://images.unsplash.com/photo-1615870216519-2f9fa575fa5c?auto=format&fit=crop&w=400&q=80',
    likes: '842',
    comments: '18',
    caption: 'Kuah Tomyum Suki Yusuki yang asem pedes seger bener-bener jadi penawar dinginnya malam! 🍜 Bakso seafoodnya premium melimpah!',
    tags: ['#SukiYusuki', '#TomyumHangat', '#SukiViral'],
  },
  {
    id: 'ig-3',
    type: 'video',
    thumbnail: dimsumMixGorengImg,
    likes: '2,110',
    comments: '88',
    caption: 'Behind the scene dapur Yusuki: kami bikin semuanya HOMEMADE setiap hari! Adonan ayam segar tanpa pengawet atau pewarna buatan.',
    tags: ['#BikinSendiri', '#HomemadeQuality', '#Dapuryusuki'],
  },
  {
    id: 'ig-4',
    type: 'image',
    thumbnail: dimsumCarbonaraImg,
    likes: '931',
    comments: '29',
    caption: 'Siapa yang gak ngiler liat Dimsum Carbonara dengan saus creamy khas Italia ditaburi daging asap gurih ini? 🤤 Hanya ada di Yusuki!',
    tags: ['#SausCarbonara', '#DimsumKeju', '#JajananKuliner'],
  },
];

export const TESTIMONIALS: Testimonial[] = [
  {
    id: 't-1',
    name: 'Andika Wijaya',
    role: 'Mahasiswa & Pecinta Dimsum',
    text: 'Beneran gak bohong, Dimsum Mentai-nya juaranya! Sausnya melimpah banget, ditorch sampe wangi smoky. Harganya murah banget dibanding yang lain tapi rasanya bintang lima. Sering kehabisan kalo dateng jam 8 malem!',
    rating: 5,
    avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=120&q=80',
    date: 'Kemarin',
  },
  {
    id: 't-2',
    name: 'Siti Rahmawati',
    role: 'Ibu Rumah Tangga',
    text: 'Anak-anak suka sekali sama Suki Medium kuah kaldu dan Mix Goreng-nya yang garing renyah. Higienis karena homemade asli, dan porsi sharingnya bikin hemat dompet keluarga. Admin WA-nya juga fast response ramah sekali.',
    rating: 5,
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&q=80',
    date: '3 hari yang lalu',
  },
  {
    id: 't-3',
    name: 'Kevin Jonathan',
    role: 'Food Blogger Lokal',
    text: 'Inovasi rasanya jempolan banget! Carbonara & Tar-tar di atas dimsum tegap padat teryata nge-blend sempurna. Gak heran sering sold out hanya dalam 2-3 jam setelah buka. Sangat rekomen order langsung lewat WA biar harga hemat!',
    rating: 5,
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80',
    date: 'Seminggu yang lalu',
  },
];

export const FAQS: FaqItem[] = [
  {
    id: 'faq-1',
    question: 'Apakah produk Dimsum Suki Yusuki 100% Halal?',
    answer: 'Ya, semua produk kami dijamin 100% menggunakan bahan-bahan yang halal dan diproses dengan standar kebersihan tinggi secara homemade setiap hari.',
  },
  {
    id: 'faq-3',
    question: 'Bagaimana cara melakukan pemesanan via WhatsApp?',
    answer: 'Sangat mudah! Anda tinggal menekan tombol pesan atau ikon keranjang belanja di katalog menu kami. Sistem akan otomatis merangkum pesanan Anda dalam bentuk teks chat WA, lalu tekan kirim. Admin kami akan langsung mengonfirmasi pesanan Anda beserta estimasi waktu penyiapannya untuk Anda ambil mandiri di outlet kami.',
  },
  {
    id: 'faq-4',
    question: 'Bagaimana prosedur pengambilan pesanan Take Away?',
    answer: 'Setelah melakukan konfirmasi pesanan via WhatsApp, silakan datang langsung ke lokasi outlet fisik kami sesuai dengan estimasi waktu siap yang diinformasikan oleh admin kami. Anda bisa mengambil langsung tanpa perlu mengantre lama.',
  },
  {
    id: 'faq-6',
    question: 'Jam berapa jam operasional outlet fisik Yusuki aktif?',
    answer: 'Kami buka setiap hari mulai pukul 17.00 WIB (Jam 5 sore) hingga semua stok ludes terjual (biasanya sekitar jam 21.00 atau 22.00 malam). Untuk menghindari kehabisan, kami sangat menyarankan Anda melakukan pemesanan sejak sore via WhatsApp.',
  },
  {
    id: 'faq-7',
    question: 'Apakah Dimsum Suki Yusuki tersedia di ShopeeFood & GoFood?',
    answer: 'Betul, kami terdaftar resmi di ShopeeFood dan GoFood sebagai merchant partner. Opsi pengiriman / delivery murni dilayani secara eksklusif lewat platform GoFood dan ShopeeFood tersebut. Sedangkan pemesanan langsung via WhatsApp diperuntukkan khusus untuk layanan Ambil Mandiri / Take Away langsung di outlet fisik kami.',
  },
];

export const DEFAULT_INFO_TAMBAHAN: InfoTambahanItem[] = [
  {
    id: 'quality-1',
    type: 'quality',
    title: 'Fresh Setiap Hari',
    desc: 'Dimsum dikukus hangat seketika saat order tiba demi menjaga rasa manis daging ayam alami.',
    icon: 'Clock'
  },
  {
    id: 'quality-2',
    type: 'quality',
    title: 'Homemade Quality',
    desc: 'Adonan digiling manual dan diracik terjamin higienis murni di dapur lokal keluarga kami.',
    icon: 'HeartHandshake'
  },
  {
    id: 'quality-3',
    type: 'quality',
    title: 'Bahan Premium',
    desc: 'Hanya menggunakan fillet dada paha segar pilihan tanpa bahan pengawet.',
    icon: 'Award'
  },
  {
    id: 'quality-4',
    type: 'quality',
    title: 'Halal Terjamin',
    desc: 'Seluruh bahan baku yang kami pilih bersih dan 100% halal untuk dikonsumsi keluarga.',
    icon: 'ShieldCheck'
  },
  {
    id: 'quality-5',
    type: 'quality',
    title: 'Topping Melimpah',
    desc: 'Taburan nori krispi, smoked beef gurih, dan saus melimpah di setiap butirnya.',
    icon: 'Sparkles'
  },
  {
    id: 'quality-6',
    type: 'quality',
    title: 'Packaging Aman',
    desc: 'Food-grade box berkualitas tinggi tahan panas guna menjaga cita rasa tetap hangat.',
    icon: 'PackageOpen'
  },
  {
    id: 'benefit-1',
    type: 'benefit',
    title: 'Harga Lebih Hemat',
    desc: 'Nikmati harga menu asli dari dapur kami langsung tanpa ada penggelembungan biaya.',
    icon: 'PiggyBank'
  },
  {
    id: 'benefit-2',
    type: 'benefit',
    title: 'Tanpa Biaya Aplikasi',
    desc: 'Bebas potongan komisi platform online (ojol) 20%-25% dan biaya administrasi tambahan.',
    icon: 'Receipt'
  },
  {
    id: 'benefit-3',
    type: 'benefit',
    title: 'Bisa Custom Order',
    desc: 'Tinggal chat via tombol WhatsApp di pojok kanan jika ingin request piring hantaran, porsi, atau level pedas.',
    icon: 'Settings2'
  },
  {
    id: 'benefit-4',
    type: 'benefit',
    title: 'Respon Admin Cepat',
    desc: 'Diproses langsung secara kekeluargaan oleh admin kami yang ramah dan sigap.',
    icon: 'Heart'
  },
  {
    id: 'benefit-5',
    type: 'benefit',
    title: 'Fleksibilitas Ambil (Take Away)',
    desc: 'Tentukan jam pengambilan kesukaan Anda agar dimsum siap hangat tepat waktu pas Anda datang.',
    icon: 'Clock'
  }
];

export const DEFAULT_ABOUT_SLIDES: AboutSlideItem[] = [
  {
    id: 'about-origin',
    title: 'Awal Mula Membangun Yusuki',
    subtitle: 'Latar Belakang & Alasan',
    image: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=600&q=80',
    paragraphs: [
      'Kisah Dimsum Suki Yusuki berawal dari titik balik kehidupan Om Tegar yang memutuskan resign dari pekerjaan kantorannya. Terbiasa dengan stabilitas, beliau dihadapkan pada masa menganggur, yang kemudian diubahnya menjadi dorongan kuat untuk bangkit mandiri dan membuka lembaran baru.',
      'Berangkat dari ketertarikan mendalam akan kekuatan kuliner rakyat, usaha ini mulai dirintis secara online dari rumah koki keluarga kami pada tahun 2021. Di awal berdirinya, kami mengandalkan modal keyakinan dan sistem Pre-Order (PO) sederhana setiap akhir pekan (Sabtu & Minggu).',
      'Kami menyajikan olahan murni siap santap buatan tangan tanpa keriuhan pabrikan. Di luar prediksi awal, respons pelanggan sangat membludak tinggi demi membeli kelembutan cita rasa kreasi kami, meyakinkan kami untuk membulatkan tekad mendirikan kedai fisik harian yang melayani dinamisnya pelanggan offline & online.'
    ],
    bullet1Title: 'Resign Menuju Kemandirian',
    bullet1Desc: 'Mengubah tantangan pasca-kerja menjadi motor penggerak usaha kuliner mandiri.',
    bullet2Title: 'Pondasi Pre-Order Akhir Pekan',
    bullet2Desc: 'Mengawali jualan akhir pekan dari dapur rumah sendiri hingga kini berdiri kedai fisik.'
  },
  {
    id: 'about-1',
    title: 'Perjalanan Suki Yusuki',
    subtitle: 'Kisah Inspirasi Bisnis',
    image: '/src/assets/images/yusuki_physical_outlet_1780673086306.png',
    paragraphs: [
      'Perjalanan kami dimulai penuh kesederhanaan pada awal tahun 2021. Terinspirasi dari bahasa Jepang "Suki" yang memiliki arti ganda: singkatan dari seruan hangat "Yuk Suki" dan kata "Suka", kami berharap siapapun yang mencicipi kreasi kami akan langsung jatuh cinta pada gigitan pertama.',
      'Usaha ini diawali oleh dorongan kuat setelah Owner memutuskan untuk resign dari hiruk-pikuk pekerjaan kantoran. Dengan modal kemauan keras serta kecintaan mendalam pada jajanan dimsum yang hangat dan lembut, owner mulai menjual porsi terbatas murni dengan sistem pre-order dari dapur rumah setiap Sabtu dan Minggu saja.',
      'Berkat dukungan dan viralnya cita rasa kami dari mulut ke mulut pelanggan terdekat, antrean pesanan pre-order kian membludak. Hal ini meyakinkan kami untuk bertransformasi mendatangkan outlet fisik permanen milik kami sendiri dengan dibantu oleh tim kecil yang solid.'
    ],
    bullet1Title: '100% Homemade Recipe',
    bullet1Desc: 'Diracik mulus dari bumbu dan bahan ayam segar buatan sendiri.',
    bullet2Title: 'Dukung Ekonomi Menengah',
    bullet2Desc: 'Melibatkan pemuda, UMKM, dan ekosistem lokal berkembang bersama.'
  },
  {
    id: 'about-2',
    title: 'Ketulusan di Balik Suki Yusuki',
    subtitle: 'Profil Owner Suami Istri',
    image: 'https://images.unsplash.com/photo-1581579438747-1dc8d1e0ca96?auto=format&fit=crop&w=600&q=80',
    paragraphs: [
      'Di balik hangatnya kuah Suki Tomyam segar dan kelembutan Dimsum kami, ada dedikasi sepasang suami istri yang mendedikasikan seluruh waktunya untuk meracik resep terbaik.',
      'Sinergi cinta dan kerja keras melahirkan standar kualitas rasa yang konsisten. Sang suami mengawasi pemilihan bahan premium dan teknik pengukusan presisi, sementara sang istri mengelola pengembangan kreasi saus lumer penuh cita rasa legendaris.',
      'Kami percaya bahwa kuliner lezat yang dibuat dengan ketulusan hati keluarga akan menghadirkan energi positif dan kebahagiaan sejati bagi setiap penikmatnya.'
    ],
    bullet1Title: 'Saling Melengkapi',
    bullet1Desc: 'Mengkombinasikan keahlian manajemen operasional dan kreasi cita rasa otentik.',
    bullet2Title: 'Quality Control Owner',
    bullet2Desc: 'Setiap adonan langsung diuji kelayakan rasa oleh Owner sebelum disajikan.'
  },
  {
    id: 'about-3',
    title: 'Energi Positif 3 Karyawan Suki Yusuki',
    subtitle: 'Tim Solid & Ramah',
    image: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=600&q=80',
    paragraphs: [
      'Operasional harian Suki Yusuki tidak lepas dari kelincahan, ketelitian, dan senyuman ramah dari tiga karyawan hebat kami yang selalu sigap menyapa pelanggan setiap hari.',
      'Dengan penuh disiplin tinggi, tim dapur mempersiapkan kukusan tepat waktu serta menjaga kebersihan optimal area kerja demi menyajikan makanan higienis terbaik.',
      'Kerjasama yang harmonis bak keluarga membuat suasana kerja di gerai Suki Yusuki Bantarsoka selalu ceria, memberikan pelayanan super cepat, ramah, dan memuaskan hati pelanggan.'
    ],
    bullet1Title: 'Pelayanan Sangat Ramah',
    bullet1Desc: 'Siap menyuguhkan senyum tulus dan menyajikan dimsum hangat penuh keramahan.',
    bullet2Title: 'Higienitas Super Ketat',
    bullet2Desc: 'Menjaga kebersihan dapur, peralatan makan, dan kesegaran sayuran pendukung.'
  }
];


