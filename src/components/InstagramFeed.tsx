/**
 * @license
 * SPDX-License-Identifier: Apache-2.5
 */

import React, { useState } from 'react';
import { Play, Pause, Heart, MessageCircle, Instagram, ExternalLink, Image, Share2, Music, Check, UserCheck, Eye, Compass, Flame } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { INSTAGRAM_POSTS } from '../data/menu';

interface TikTokVideoSim {
  id: string;
  thumbnail: string;
  views: string;
  likes: string;
  commentsCount: string;
  shares: string;
  caption: string;
  tags: string[];
  sound: string;
  videoTitle: string;
  commentsList: { username: string; text: string; time: string }[];
}

export default function InstagramFeed() {
  const [activeTab, setActiveTab] = useState<'TELEGRAM' | 'INSTAGRAM' | 'TIKTOK'>('INSTAGRAM');
  const [selectedTikTok, setSelectedTikTok] = useState<string>('tk-1');
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [showCommentsDrawer, setShowCommentsDrawer] = useState<boolean>(false);
  const [customCommentText, setCustomCommentText] = useState<string>('');
  const [hasFollowed, setHasFollowed] = useState<boolean>(false);

  const tiktokPosts: TikTokVideoSim[] = [
    {
      id: 'tk-1',
      videoTitle: 'Persiapan 10 Porsi Tomyum Suki Jumbo',
      thumbnail: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=600&q=80',
      views: '1.4M',
      likes: '124,500',
      commentsCount: '840',
      shares: '12,400',
      caption: 'Hectic Day di Dapur Utama Yusuki! 💪 Begini cara tim kami menyajikan porsi Suki Tomyum Jumbo kuah seger berlimpah topping gurih dalam 5 menit pas pembeli ngantre. Semua dikerjakan fresh & higienis!',
      tags: ['#OwnerYusuki', '#BehindTheScenes', '#SukiTomyum', '#KulinerMalang'],
      sound: '♫ suara asli - owner.yusuki (Daily Vlog)',
      commentsList: [
        { username: 'baim_kulineran', text: 'Kuah tomyumnya valid seger parah kak! Udah langganan 1 tahun', time: '1 jam lalu' },
        { username: 'amalia.putrii', text: 'Spill bumbu kaldu tomyumnya dikit dong owner, wangi bgt sumpah', time: '3 jam lalu' },
        { username: 'mahasiswa_lapar', text: 'Porsi suki jumbo bisa buat makan bertiga beneran hemat badai!', time: '12 jam lalu' },
        { username: 'diki_chandra', text: 'Abon sapi di atas dimsum krispinya nikmat ga pelit', time: '1 hari lalu' },
      ],
    },
    {
      id: 'tk-2',
      videoTitle: 'POV: Nemu Kedai Dimsum Homemade Luber Saus',
      thumbnail: 'https://images.unsplash.com/photo-1615870216519-2f9fa575fa5c?auto=format&fit=crop&w=600&q=80',
      views: '840K',
      likes: '72,100',
      commentsCount: '412',
      shares: '5,800',
      caption: 'POV: Nemu kedai dimsum ala kafe tapi harga kaki lima di belokan kampus Malang yang saus mentainya sampe luber dan lumer di mulut! 🤤 Gak pake pengawet atau pewarna buatan ya kawan-kawan.',
      tags: ['#KulinerViral', '#DimsumMentai', '#JajananMalang', '#MakanEnak'],
      sound: '♫ Vibe Cinematic - Chill Day (Remix)',
      commentsList: [
        { username: 'rizal.ramadhan', text: 'Sumpah saus mentainya paling tebel se-Kota Malang, ga nek sama sekali', time: '2 jam lalu' },
        { username: 'chika_melia', text: 'Minggu lalu take away 3 porsi abis sendiri saking enaknya 👍', time: '5 jam lalu' },
        { username: 'gregorius_adi', text: 'Buka jam berapa aja min outlet fisiknya? Takut sold out mulu', time: '1 hari lalu' },
      ],
    },
    {
      id: 'tk-3',
      videoTitle: 'Owner Talk: Kenapa Yusuki Pilih Bahan Premium?',
      thumbnail: 'https://images.unsplash.com/photo-1562608284-c5347ef88ea8?auto=format&fit=crop&w=600&q=80',
      views: '342K',
      likes: '35,600',
      commentsCount: '190',
      shares: '2,900',
      caption: 'Kenapa Yusuki gak jual dimsum seribuan? Biarpun produk rumahan, kami berkomitmen pakai daging paha ayam grade A segar tanpa campuran kulit yang melimpah tepungnya. Rasa tebal & empuk gigitannya ga bisa bohong!',
      tags: ['#KualitasPremium', '#OwnerEdukasi', '#HomemadeAyam', '#UMKMBisa'],
      sound: '♫ suara asli - Kemal | Owner Yusuki',
      commentsList: [
        { username: 'dr.setiyono', text: 'Sangat setuju! kerasa bgt pas digigit padet ayam beneran bukan tepung aci doang', time: '4 jam lalu' },
        { username: 'ibumuda_hitz', text: 'Anak-anak saya paling doyan dimsum ini karena teksturnya empuk alami', time: '8 jam lalu' },
        { username: 'kurnia_wan', text: 'Take away dibungkus microwave safe bgt rapi ga bocor', time: '2 hari lalu' },
      ],
    },
  ];

  const currentTikTok = tiktokPosts.find((p) => p.id === selectedTikTok) || tiktokPosts[0];

  const handleSocialExternal = () => {
    if (activeTab === 'INSTAGRAM') {
      window.open('https://instagram.com/dimsumsuki.yusuki', '_blank');
    } else {
      window.open('https://tiktok.com/@dimsumsuki.yusuki', '_blank'); // simulated tiktok
    }
  };

  const handleAddCommentSim = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customCommentText.trim()) return;
    
    currentTikTok.commentsList.unshift({
      username: 'kamu_penikmat_dimsum',
      text: customCommentText,
      time: 'Baru saja',
    });
    
    setCustomCommentText('');
  };

  return (
    <section id="medsos-feed" className="py-20 bg-white relative overflow-hidden scroll-mt-20">
      
      {/* Dynamic Backlight Orbs */}
      <div className="absolute top-[30%] right-[-10%] w-[350px] h-[350px] bg-pink-500/5 rounded-full blur-[90px] pointer-events-none" />
      <div className="absolute bottom-[20%] left-[-10%] w-[350px] h-[350px] bg-red-500/5 rounded-full blur-[90px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="flex flex-col lg:flex-row items-center justify-between gap-6 mb-12 text-center lg:text-left">
          <div>
            <div className="inline-flex items-center gap-1.5 bg-brand-charcoal/10 px-3.5 py-1.5 rounded-full text-[10px] font-bold text-brand-charcoal uppercase tracking-widest mb-3 font-mono">
              <Compass className="w-4 h-4 text-[#ea580c] animate-spin" />
              <span>ORGANIC SOCIAL GRID</span>
            </div>
            <h2 className="font-display text-2xl sm:text-3xl lg:text-4xl font-extrabold text-brand-charcoal tracking-tight mb-3">
              Konten Kreatif Owner & Tim Dapur
            </h2>
            <p className="font-sans text-xs sm:text-sm text-brand-charcoal/65 font-semibold leading-relaxed max-w-xl">
              Intip langsung proses masak harian, keseruan di kedai, dan vlog edukatif dari pemilik kedai Yusuki murni yang kami bagikan langsung di official media sosial kami!
            </p>
          </div>

          {/* Platforms Selector Switcher (Design centered UI) */}
          <div className="flex bg-zinc-100 p-1.5 rounded-2xl border border-zinc-200 shadow-inner">
            <button
              onClick={() => setActiveTab('INSTAGRAM')}
              className={`px-5 py-2.5 rounded-xl text-xs font-bold font-sans flex items-center gap-2 transition-all cursor-pointer ${
                activeTab === 'INSTAGRAM'
                  ? 'bg-gradient-to-tr from-[#8a3ab9] via-[#e95950] to-[#fccc63] text-white shadow-md'
                  : 'text-zinc-600 hover:text-brand-charcoal'
              }`}
            >
              <Instagram className="w-4 h-4" />
              <span>Instagram Feed</span>
            </button>
            <button
              onClick={() => {
                setActiveTab('TIKTOK');
                setIsPlaying(true);
              }}
              className={`px-5 py-2.5 rounded-xl text-xs font-bold font-sans flex items-center gap-2 transition-all cursor-pointer ${
                activeTab === 'TIKTOK'
                  ? 'bg-brand-charcoal text-[#00f2fe] shadow-md border border-zinc-700'
                  : 'text-zinc-600 hover:text-brand-charcoal'
              }`}
            >
              <span className="font-mono text-xs font-black bg-[#fe2c55] text-white px-1 rounded-sm">T</span>
              <span>TikTok Shorts</span>
            </button>
          </div>
        </div>

        {/* --- Tab 1: Instagram Grid Panel --- */}
        {activeTab === 'INSTAGRAM' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-12"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {INSTAGRAM_POSTS.map((post, idx) => (
                <div
                  key={post.id}
                  onClick={handleSocialExternal}
                  className="bg-zinc-50 rounded-3xl overflow-hidden border border-zinc-100 shadow-sm hover:shadow-xl transition-all duration-300 group cursor-pointer flex flex-col h-full relative"
                >
                  {/* Aspect Square image preview */}
                  <div className="relative aspect-square overflow-hidden bg-brand-cream-dark">
                    <img
                      src={post.thumbnail}
                      alt="Instagram thumbnail process"
                      className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                      referrerPolicy="no-referrer"
                    />
                    
                    {/* Media Type Indicator overlay */}
                    <span className="absolute top-3 right-3 bg-black/60 backdrop-blur-xs text-white p-1.5 rounded-lg flex items-center justify-center">
                      {post.type === 'video' ? (
                        <Play className="w-3.5 h-3.5 fill-current text-white" />
                      ) : (
                        <Image className="w-3.5 h-3.5 text-white" />
                      )}
                    </span>

                    {/* Social Stats Mask Hover Overlay */}
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-6 z-20">
                      <div className="flex items-center gap-1.5 text-white font-bold font-mono">
                        <Heart className="w-5 h-5 fill-rose-500 text-rose-500" />
                        <span>{post.likes}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-white font-bold font-mono">
                        <MessageCircle className="w-5 h-5 fill-current text-white" />
                        <span>{post.comments}</span>
                      </div>
                    </div>
                  </div>

                  {/* Context body info */}
                  <div className="p-4 flex flex-col flex-grow bg-white border-t border-zinc-50">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-yellow-500 to-purple-600 flex items-center justify-center text-[7px] font-black text-white">Y</div>
                      <span className="text-[10px] font-bold text-brand-charcoal">@dimsumsuki.yusuki</span>
                      <span className="w-1.5 h-1.5 rounded-full bg-[#10b981] ml-auto" />
                    </div>

                    <p className="font-sans text-[11px] sm:text-xs text-brand-charcoal/80 leading-relaxed font-normal flex-grow line-clamp-3 mb-2.5">
                      {post.caption}
                    </p>

                    <div className="flex flex-wrap gap-1">
                      {post.tags.map(t => (
                        <span key={t} className="text-[9px] font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded-md">
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-center mt-6">
              <button
                onClick={handleSocialExternal}
                className="bg-gradient-to-tr from-purple-600 via-pink-500 to-amber-500 hover:from-purple-700 text-white font-extrabold text-xs px-8 py-3.5 rounded-2xl flex items-center gap-2.5 shadow-md cursor-pointer hover:shadow-lg transition-transform"
              >
                <Instagram className="w-4 h-4 text-white" />
                <span>Lihat Cerita Harian Selengkapnya di Instagram</span>
              </button>
            </div>
          </motion.div>
        )}

        {/* --- Tab 2: TikTok Vertical Shorts Phone Mockup Player --- */}
        {activeTab === 'TIKTOK' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-stretch"
          >
            {/* List Sidebar (lg:col-span-4) - Choose video to play */}
            <div className="lg:col-span-4 order-2 lg:order-1 flex flex-col justify-start space-y-3">
              <h3 className="font-display font-bold text-xs uppercase text-zinc-400 tracking-wider font-mono mb-2">
                Daftar Video Vlog Owner
              </h3>
              
              {tiktokPosts.map((post) => (
                <button
                  key={post.id}
                  onClick={() => {
                    setSelectedTikTok(post.id);
                    setIsPlaying(true);
                    setShowCommentsDrawer(false);
                  }}
                  className={`w-full text-left p-4 rounded-2xl border transition-all duration-200 cursor-pointer flex items-center gap-4 ${
                    selectedTikTok === post.id
                      ? 'bg-brand-charcoal text-white border-brand-charcoal shadow-md'
                      : 'bg-zinc-50 hover:bg-zinc-100 border-zinc-200 text-brand-charcoal'
                  }`}
                >
                  <div className="w-12 h-16 rounded-xl overflow-hidden bg-brand-cream-dark flex-shrink-0 relative">
                    <img src={post.thumbnail} alt="vlog thumb" className="w-[100%] h-[100%] object-cover" />
                    <span className="absolute inset-0 bg-black/30 flex items-center justify-center">
                      <Play className="w-4 h-4 text-white fill-white" />
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="font-display font-semibold text-xs leading-snug line-clamp-2 mb-1">
                      {post.videoTitle}
                    </h4>
                    <div className="flex items-center gap-1.5 text-[10px] opacity-75 font-mono">
                      <Eye className="w-3 h-3 text-[#00f2fe]" />
                      <span>{post.views} ditonton</span>
                    </div>
                  </div>
                </button>
              ))}

              <a
                href="https://tiktok.com/@dimsumsuki.yusuki"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-brand-charcoal text-[#00f2fe] hover:bg-zinc-800 text-center text-xs font-bold p-4 rounded-2xl border border-zinc-700/50 flex items-center justify-center gap-2 mt-4 cursor-pointer"
              >
                <Music className="w-4 h-4 text-[#fe2c55]" />
                <span>Kunjungi TikTok Official Kami &rarr;</span>
              </a>
            </div>

            {/* Virtual Video Smartphone Screen View (lg:col-span-8) */}
            <div className="lg:col-span-8 order-1 lg:order-2 flex justify-center">
              <div className="w-full max-w-[580px] bg-brand-charcoal rounded-[40px] border-8 border-zinc-800 shadow-2xl relative overflow-hidden aspect-[9/14] flex flex-col justify-between p-4.5 text-white">
                
                {/* Backlighting glow simulation inside mobile screen */}
                <div className="absolute inset-0 bg-black/60 pointer-events-none z-10" />
                <img
                  src={currentTikTok.thumbnail}
                  alt="active video cover background"
                  className="absolute inset-0 w-full h-full object-cover blur-[0.5px] scale-102 transition-transform duration-500 brightness-75 pointer-events-none"
                />

                {/* Simulated Glass Video Playback state controller screen tap */}
                <div
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="absolute inset-0 z-15 flex items-center justify-center cursor-pointer"
                >
                  <AnimatePresence>
                    {!isPlaying && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.5 }}
                        className="p-5 rounded-full bg-black/70 backdrop-blur-md shadow-lg"
                      >
                        <Play className="w-8 h-8 text-[#00f2fe] fill-[#00f2fe]" />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Top Phone Screen details line */}
                <div className="relative z-20 flex items-center justify-between w-full p-2.5">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
                    <span className="text-[10px] font-black tracking-widest font-mono text-zinc-300 uppercase">TIKTOK LITE SIM</span>
                  </div>
                  
                  <div className="bg-black/30 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-bold font-mono text-[#00f2fe] border border-[#00f2fe]/20 flex items-center gap-1.5">
                    <Play className="w-3 h-3 fill-current animate-ping" />
                    <span>Video Sedang Diputar</span>
                  </div>
                </div>

                {/* Right Floating Actions Column (TikTok icons tray style!) */}
                <div className="absolute right-4 top-[30%] z-20 flex flex-col items-center gap-5">
                  {/* Creator Avatar with Follow simulation toggle */}
                  <div className="relative flex flex-col items-center">
                    <div className="w-12 h-12 rounded-full border-2 border-[#fe2c55] bg-brand-cream overflow-hidden shadow-md">
                      {/* Generative human face placeholder / brand logo representation */}
                      <span className="w-full h-full flex items-center justify-center bg-primary-orange text-white font-black text-sm">Y</span>
                    </div>
                    <button
                      onClick={() => setHasFollowed(!hasFollowed)}
                      className={`absolute bottom-[-6px] rounded-full p-1 border border-white text-white flex items-center justify-center scale-90 shadow-md ${
                        hasFollowed ? 'bg-[#10b981]' : 'bg-[#fe2c55] hover:bg-rose-600'
                      }`}
                      title={hasFollowed ? 'Sudah Diikuti' : 'Ikuti Akun'}
                    >
                      {hasFollowed ? <UserCheck className="w-3 h-3" /> : <span className="text-xs font-black leading-none px-0.5">+</span>}
                    </button>
                  </div>

                  {/* Likes count toggle */}
                  <div className="flex flex-col items-center text-center">
                    <button className="bg-black/40 backdrop-blur-xs p-3 rounded-full hover:scale-110 active:scale-95 transition-transform text-rose-500 cursor-pointer">
                      <Heart className="w-5.5 h-5.5 fill-rose-500" />
                    </button>
                    <span className="text-[10px] font-bold font-mono mt-1 text-white shadow-xs">{currentTikTok.likes}</span>
                  </div>

                  {/* Comments count toggle */}
                  <div className="flex flex-col items-center text-center">
                    <button
                      onClick={() => setShowCommentsDrawer(true)}
                      className="bg-black/40 backdrop-blur-xs p-3 rounded-full hover:scale-110 active:scale-95 transition-transform text-[#00f2fe] cursor-pointer"
                    >
                      <MessageCircle className="w-5.5 h-5.5 fill-current" />
                    </button>
                    <span className="text-[10px] font-bold font-mono mt-1 text-white shadow-xs">{currentTikTok.commentsCount}</span>
                  </div>

                  {/* Share code */}
                  <div className="flex flex-col items-center text-center">
                    <button className="bg-black/40 backdrop-blur-xs p-3 rounded-full hover:scale-110 transition-transform text-white cursor-pointer">
                      <Share2 className="w-5.5 h-5.5 text-zinc-300" />
                    </button>
                    <span className="text-[10px] font-bold font-mono mt-1 text-zinc-300 shadow-xs">{currentTikTok.shares}</span>
                  </div>
                </div>

                {/* Bottom Overlay caption & titles */}
                <div className="relative z-20 w-[80%] p-3.5 bg-black/40 backdrop-blur-xs rounded-2xl flex flex-col gap-1 text-left">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-black font-display text-white">@owner.yusuki</span>
                    <span className="bg-[#fe2c55] text-white font-mono text-[8px] font-bold px-1 py-0.5 rounded uppercase">Verified Owner</span>
                  </div>

                  <p className="text-[11px] leading-relaxed text-zinc-100 font-medium">
                    {currentTikTok.caption}
                  </p>

                  <div className="flex flex-wrap gap-1.5 my-1">
                    {currentTikTok.tags.map((t) => (
                      <span key={t} className="text-[9px] font-bold text-[#00f2fe]">
                        {t}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center gap-2 mt-1 py-1 border-t border-zinc-700/40 text-[10px] text-zinc-300 font-mono">
                    <Music className="w-3.5 h-3.5 text-amber-200 animate-bounce" />
                    <span className="truncate max-w-[150px]">{currentTikTok.sound}</span>
                  </div>
                </div>

                {/* Simulated Comments Drawer Pop up Panel */}
                <AnimatePresence>
                  {showCommentsDrawer && (
                    <motion.div
                      initial={{ y: '100%' }}
                      animate={{ y: 0 }}
                      exit={{ y: '100%' }}
                      className="absolute inset-x-0 bottom-0 top-[35%] bg-zinc-950/95 border-t border-zinc-800 rounded-t-3xl z-30 flex flex-col p-4 text-white"
                    >
                      <div className="flex items-center justify-between border-b border-zinc-800 pb-2.5 mb-3">
                        <span className="text-[11px] font-bold tracking-wider text-zinc-400 font-mono uppercase">Komentar Netizen ({currentTikTok.commentsList.length})</span>
                        <button
                          onClick={() => setShowCommentsDrawer(false)}
                          className="text-xs bg-zinc-800 hover:bg-zinc-700 px-2 py-1 rounded-md text-zinc-400 cursor-pointer"
                        >
                          Tutup
                        </button>
                      </div>

                      {/* Comments stream */}
                      <div className="flex-1 overflow-y-auto space-y-3 pr-1">
                        {currentTikTok.commentsList.map((c, i) => (
                          <div key={i} className="flex gap-2.5 items-start text-left text-xs">
                            <div className="w-7 h-7 rounded-full bg-zinc-800 flex items-center justify-center font-bold text-[10px] text-[#00f2fe] flex-shrink-0">
                              {c.username[0].toUpperCase()}
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="font-bold text-[11px] leading-tight text-zinc-300">@{c.username}</p>
                              <p className="text-zinc-200 mt-0.5 leading-snug">{c.text}</p>
                              <p className="text-[9px] text-zinc-500 font-mono mt-0.5">{c.time}</p>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Comment Input simulator */}
                      <form onSubmit={handleAddCommentSim} className="mt-2.5 flex gap-2 border-t border-zinc-800 pt-2.5">
                        <input
                          type="text"
                          placeholder="Tulis pendapatmu..."
                          value={customCommentText}
                          onChange={(e) => setCustomCommentText(e.target.value)}
                          className="flex-1 text-xs bg-zinc-900 border border-zinc-850 rounded-lg py-2 px-3 focus:outline-none focus:border-[#00f2fe] text-white"
                        />
                        <button
                          type="submit"
                          className="bg-brand-charcoal border border-zinc-700 hover:border-[#00f2fe] text-[#00f2fe] hover:bg-[#00f2fe]/10 text-xs font-bold px-3 py-2 rounded-lg cursor-pointer"
                        >
                          Kirim
                        </button>
                      </form>
                    </motion.div>
                  )}
                </AnimatePresence>

              </div>
            </div>

          </motion.div>
        )}

      </div>
    </section>
  );
}
