import React, { useState, useEffect } from 'react';
import { Play, Eye, Plus, Film, Smartphone, ChevronLeft, ChevronRight, Volume2, Globe, Sparkles } from 'lucide-react';
import { PortfolioItem } from '../types';
import { MobilePhoneFrame } from './MobilePhoneFrame';
import { ImageCarousel } from './ImageCarousel';
import { BrowserFrame } from './BrowserFrame';
import { WebsiteModal } from './WebsiteModal';
import { resolveLiveVideoUrl, isTeeProItem } from '../utils/storage';

interface PortfolioSectionProps {
  items: PortfolioItem[];
  onSelectVideo: (item: PortfolioItem) => void;
  onOpenCMS: () => void;
}

interface LightboxState {
  images: string[];
  currentIndex: number;
  title: string;
  category: string;
  client: string;
  description: string;
  metrics: string;
}

const fallbackGraphicSlides = [
  '/src/assets/images/showcase_branding_identity_1790504096628.jpg',
  '/src/assets/images/hero_sapotlokal_agency_1790504057787.jpg',
  '/src/assets/images/showcase_video_production_1790504071320.jpg',
  '/src/assets/images/showcase_ugc_creator_1790504084326.jpg',
];

const DEFAULT_LANDSCAPE_FALLBACK = '/videos/commercial_4k_reel_16_9.mp4';

const PortfolioVideoThumbnail: React.FC<{
  videoUrl?: string;
  posterUrl?: string;
  title: string;
  itemId?: string;
}> = ({ videoUrl, posterUrl, title, itemId }) => {
  const [imageFailed, setImageFailed] = useState(false);
  const [liveUrl, setLiveUrl] = useState<string>(() => {
    if (videoUrl && !videoUrl.startsWith('indexeddb:')) {
      return videoUrl;
    }
    return DEFAULT_LANDSCAPE_FALLBACK;
  });

  useEffect(() => {
    if (videoUrl?.startsWith('indexeddb:') || (itemId && !videoUrl)) {
      resolveLiveVideoUrl(itemId, videoUrl).then((url) => {
        if (url) {
          setLiveUrl(url);
        }
      });
    } else if (videoUrl) {
      setLiveUrl(videoUrl);
    } else {
      setLiveUrl(DEFAULT_LANDSCAPE_FALLBACK);
    }
  }, [videoUrl, itemId]);

  const cleanPoster = posterUrl?.trim();
  const showCustomPoster = Boolean(cleanPoster && !imageFailed);

  if (showCustomPoster && cleanPoster) {
    return (
      <img
        src={cleanPoster}
        alt={title}
        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        referrerPolicy="no-referrer"
        onError={() => setImageFailed(true)}
      />
    );
  }

  return (
    <video
      src={liveUrl || DEFAULT_LANDSCAPE_FALLBACK}
      poster={cleanPoster || undefined}
      preload="metadata"
      muted
      playsInline
      crossOrigin="anonymous"
      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 pointer-events-none"
    />
  );
};

export const PortfolioSection: React.FC<PortfolioSectionProps> = ({
  items,
  onSelectVideo,
  onOpenCMS,
}) => {
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [lightboxData, setLightboxData] = useState<LightboxState | null>(null);
  const [activeWebsiteItem, setActiveWebsiteItem] = useState<PortfolioItem | null>(null);

  useEffect(() => {
    if (!lightboxData) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setLightboxData(null);
      } else if (e.key === 'ArrowLeft') {
        setLightboxData((prev) => {
          if (!prev || prev.images.length <= 1) return prev;
          const nextIdx = (prev.currentIndex - 1 + prev.images.length) % prev.images.length;
          return { ...prev, currentIndex: nextIdx };
        });
      } else if (e.key === 'ArrowRight') {
        setLightboxData((prev) => {
          if (!prev || prev.images.length <= 1) return prev;
          const nextIdx = (prev.currentIndex + 1) % prev.images.length;
          return { ...prev, currentIndex: nextIdx };
        });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxData]);

  const handleOpenVideo = async (videoItem: PortfolioItem) => {
    const liveUrl = await resolveLiveVideoUrl(videoItem.id, videoItem.videoUrl || videoItem.mediaUrl);
    onSelectVideo({
      ...videoItem,
      videoUrl: liveUrl,
      mediaUrl: liveUrl,
    });
  };

  const categories = [
    'All',
    'Video Editing',
    'UGC',
    'Graphic Design',
    'Branding Strategy',
    'Website Building',
    'Social Content',
  ];

  const cleanItems = items.filter((item) => !isTeeProItem(item));

  const filteredItems =
    activeCategory === 'All'
      ? cleanItems
      : cleanItems.filter((item) => item.category === activeCategory);

  // Separate items into Dedicated Aspect Ratio groups
  const verticalItems = filteredItems.filter(
    (item) => item.aspectRatio === '9:16' || item.category === 'UGC'
  );
  const widescreenItems = filteredItems.filter(
    (item) => item.aspectRatio !== '9:16' && item.category !== 'UGC'
  );

  // Common card renderer
  const renderCard = (item: PortfolioItem, isVerticalLayout: boolean) => {
    const isVerticalPhone = item.aspectRatio === '9:16' || item.category === 'UGC';
    const isWebsiteShowcase = item.mediaType === 'website' || item.category === 'Website Building';
    const isImageShowcase = !isWebsiteShowcase && item.mediaType === 'image';
    const carouselImages =
      item.images && item.images.length > 1
        ? item.images
        : item.imageUrl
        ? [item.imageUrl, ...fallbackGraphicSlides.filter((s) => s !== item.imageUrl)]
        : fallbackGraphicSlides;

    return (
      <div
        key={item.id}
        className="group relative flex flex-col justify-between bg-slate-950 border border-slate-800/90 rounded-2xl overflow-hidden hover:border-slate-700 transition-all duration-300 hover:shadow-2xl hover:shadow-amber-500/5 h-full w-full"
      >
        {/* Media Preview Area */}
        {isVerticalPhone ? (
          /* 1. 9:16 UGC Item -> Render Compact Mobile Phone Frame Component */
          <div className="p-3 pb-2 flex flex-col items-center justify-center bg-gradient-to-b from-slate-900/60 to-slate-950 border-b border-slate-900">
            <div className="w-full flex items-center justify-between mb-1.5 text-xs px-1">
              <span className="text-[10px] font-semibold text-slate-200 bg-slate-900/90 px-2 py-0.5 rounded border border-slate-800 flex items-center gap-1">
                <Smartphone className="w-3 h-3 text-amber-400" />
                <span>{item.category}</span>
              </span>
              <span className="text-[10px] font-mono text-emerald-400 font-semibold">
                9:16 Vertical
              </span>
            </div>

            <MobilePhoneFrame item={item} className="my-1" />
          </div>
        ) : isWebsiteShowcase ? (
          /* 2. Website Building Item -> Render Embedded BrowserFrame */
          <div className="p-2 sm:p-2.5 pb-1 flex flex-col bg-slate-950 border-b border-slate-900">
            <BrowserFrame
              item={item}
              onOpenDetails={() => setActiveWebsiteItem(item)}
            />
          </div>
        ) : isImageShowcase ? (
          /* 3. Image Showcase -> Render Interactive Multi-Slide Image Carousel */
          <div className="relative border-b border-slate-900">
            <ImageCarousel
              images={carouselImages}
              title={item.title}
              onOpenLightbox={(_img, index) => {
                setLightboxData({
                  images: carouselImages,
                  currentIndex: index ?? 0,
                  title: item.title,
                  category: item.category,
                  client: item.client,
                  description: item.description,
                  metrics: item.metrics,
                });
              }}
            />

            {/* Category Tag Overlay */}
            <div className="absolute top-3 left-3 z-10 pointer-events-none">
              <span className="text-[11px] font-semibold text-slate-200 bg-slate-950/85 backdrop-blur-md px-2.5 py-1 rounded-md border border-slate-800 shadow-sm">
                {item.category}
              </span>
            </div>
          </div>
        ) : (
          /* 4. Standard 16:9 Widescreen Video Card */
          <div
            className="relative aspect-video sm:aspect-[16/10] bg-slate-950 overflow-hidden cursor-pointer border-b border-slate-900"
            onClick={() => handleOpenVideo(item)}
          >
            <PortfolioVideoThumbnail
              videoUrl={item.videoUrl || item.mediaUrl}
              posterUrl={item.imageUrl || item.posterUrl}
              title={item.title}
              itemId={item.id}
            />

            {/* Dark gradient & play affordance */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />

            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-13 h-13 rounded-full bg-amber-400/90 group-hover:bg-amber-400 text-slate-950 flex items-center justify-center shadow-lg transition-transform group-hover:scale-110">
                <Play className="w-6 h-6 ml-0.5 fill-slate-950" />
              </div>
            </div>

            {/* Category pill */}
            <div className="absolute top-3 left-3 z-10">
              <span className="text-[11px] font-semibold text-slate-200 bg-slate-950/85 backdrop-blur-md px-2.5 py-1 rounded-md border border-slate-800 shadow-sm">
                {item.category}
              </span>
            </div>

            {/* Bottom-right interactive Watch Reel pill */}
            <div className="absolute bottom-3 right-3 z-10">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleOpenVideo(item);
                }}
                className="flex items-center gap-1.5 text-[11px] font-semibold text-amber-300 hover:text-white bg-slate-950/90 hover:bg-amber-500/90 px-2.5 py-1 rounded-md border border-slate-800 hover:border-amber-400/50 shadow-md transition-all cursor-pointer"
              >
                <Film className="w-3.5 h-3.5" />
                <span>Watch Reel</span>
              </button>
            </div>
          </div>
        )}

        {/* Card Meta Content */}
        <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between">
          <div>
            <div className="text-xs text-slate-400 font-medium mb-1">
              Client: <span className="text-amber-400/90 font-semibold">{item.client}</span>
            </div>

            <h3
              className="text-base sm:text-lg font-bold font-display text-white mb-2 group-hover:text-amber-300 transition-colors cursor-pointer"
              onClick={() => {
                if (isWebsiteShowcase) {
                  setActiveWebsiteItem(item);
                } else if (item.mediaType === 'video' || isVerticalPhone) {
                  handleOpenVideo(item);
                } else {
                  setLightboxData({
                    images: carouselImages,
                    currentIndex: 0,
                    title: item.title,
                    category: item.category,
                    client: item.client,
                    description: item.description,
                    metrics: item.metrics,
                  });
                }
              }}
            >
              {item.title}
            </h3>

            <p className="text-xs text-slate-300 leading-relaxed line-clamp-2 mb-4">
              {item.description}
            </p>
          </div>

          <div>
            {/* Performance Proof Indicator */}
            <div className="pt-3 border-t border-slate-800/80 mb-3 flex items-center justify-between text-xs">
              <span className="text-[11px] text-slate-500">Measurable Result</span>
              <span className="font-mono text-amber-400 font-semibold text-[11px]">
                {item.metrics}
              </span>
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-1.5 mb-4">
              {item.tags.map((tag, idx) => (
                <span
                  key={idx}
                  className="text-[10px] font-medium text-slate-400 bg-slate-900 border border-slate-800 px-2 py-0.5 rounded"
                >
                  {tag}
                </span>
              ))}
            </div>

            {/* Primary Action Button */}
            <div className="pt-3 border-t border-slate-800/60">
              {isVerticalPhone ? (
                <div className="flex flex-col gap-2">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpenVideo(item);
                    }}
                    className="w-full flex items-center justify-center gap-2 py-2 px-3 text-xs font-bold rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 transition-all shadow-md shadow-amber-400/10 cursor-pointer"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Watch UGC Fullscreen Reel</span>
                  </button>
                  <div className="flex items-center justify-between py-1 px-2.5 rounded-lg bg-slate-900/90 border border-slate-800 text-[10px]">
                    <span className="flex items-center gap-1.5 text-slate-400 font-medium">
                      <Volume2 className="w-3 h-3 text-amber-400 shrink-0" />
                      <span>Click phone screen for inline play</span>
                    </span>
                    <span className="font-mono text-[9px] text-emerald-400 font-bold bg-emerald-950/60 border border-emerald-500/30 px-1.5 py-0.5 rounded-full shrink-0">
                      AUDIO ON
                    </span>
                  </div>
                </div>
              ) : isWebsiteShowcase ? (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveWebsiteItem(item);
                  }}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-3 text-xs font-bold rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition-all shadow-md shadow-emerald-500/10 cursor-pointer"
                >
                  <Globe className="w-3.5 h-3.5" />
                  <span>Inspect Embedded Platform</span>
                </button>
              ) : item.mediaType === 'video' ? (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleOpenVideo(item);
                  }}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-3 text-xs font-bold rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 transition-all shadow-md shadow-amber-400/10 cursor-pointer"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Watch Commercial (.mp4)</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setLightboxData({
                      images: carouselImages,
                      currentIndex: 0,
                      title: item.title,
                      category: item.category,
                      client: item.client,
                      description: item.description,
                      metrics: item.metrics,
                    });
                  }}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-3 text-xs font-medium rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 transition-colors cursor-pointer"
                >
                  <Eye className="w-3.5 h-3.5 text-amber-400" />
                  <span>
                    {carouselImages.length > 1
                      ? `Browse Carousel (${carouselImages.length} Slides)`
                      : 'View Showcase Image'}
                  </span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <section id="portfolio" className="py-24 bg-slate-900/30 border-t border-slate-900 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-6">
          <div className="max-w-2xl">
            <div className="text-xs font-semibold tracking-wider uppercase text-amber-400 mb-2 flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Featured Client Work & Case Studies</span>
            </div>
            <h2
              className="text-3xl sm:text-5xl font-extrabold font-display tracking-tight text-white"
              style={{ textWrap: 'balance' }}
            >
              Creative Media & Strategic Campaigns
            </h2>
            <p className="text-sm text-slate-300 mt-3 leading-relaxed">
              Explore our structured short-form mobile reels, cinematic commercial edits, and multi-slide corporate brand identities.
            </p>
          </div>
        </div>

        {/* Interactive Segmented Filter Controls */}
        <div className="flex flex-wrap items-center gap-2 mb-12 p-1.5 bg-slate-950/80 border border-slate-800/80 rounded-xl w-fit">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3.5 py-1.5 text-xs font-medium rounded-lg transition-all whitespace-nowrap cursor-pointer ${
                activeCategory === cat
                  ? 'bg-amber-400 text-slate-950 font-bold shadow-md shadow-amber-400/10'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* --- DEDICATED LAYOUT STRUCTURE --- */}

        {/* Case 1: When "All" is active, display clear Section A (Vertical Reels) & Section B (Widescreen) */}
        {activeCategory === 'All' && (
          <div className="space-y-16">
            {/* Section A: Vertical Short-Form & UGC Reels (Uniform 9:16 subgrid) */}
            {verticalItems.length > 0 && (
              <div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 mb-6 border-b border-slate-800/80 gap-2">
                  <div className="flex items-center gap-2.5">
                    <span className="p-1.5 rounded-lg bg-amber-400/10 border border-amber-400/20 text-amber-400">
                      <Smartphone className="w-4 h-4" />
                    </span>
                    <div>
                      <span className="text-[10px] font-mono uppercase text-amber-400 font-semibold tracking-wider block">
                        Section A · Mobile-First Media
                      </span>
                      <h3 className="text-xl font-bold font-display tracking-tight text-white">
                        Vertical Short-Form & UGC Performance Reels
                      </h3>
                    </div>
                  </div>
                  <span className="text-xs font-mono text-slate-400 bg-slate-950 px-2.5 py-1 rounded-md border border-slate-800 w-fit">
                    9:16 Uniform Mobile Frames
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6 sm:gap-8 items-stretch">
                  {verticalItems.map((item) => renderCard(item, true))}
                </div>
              </div>
            )}

            {/* Section B: Widescreen Commercial & Corporate Media (Balanced 2-column desktop grid) */}
            {widescreenItems.length > 0 && (
              <div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 mb-6 border-b border-slate-800/80 gap-2">
                  <div className="flex items-center gap-2.5">
                    <span className="p-1.5 rounded-lg bg-amber-400/10 border border-amber-400/20 text-amber-400">
                      <Film className="w-4 h-4" />
                    </span>
                    <div>
                      <span className="text-[10px] font-mono uppercase text-amber-400 font-semibold tracking-wider block">
                        Section B · Commercial & Corporate Media
                      </span>
                      <h3 className="text-xl font-bold font-display tracking-tight text-white">
                        Widescreen 4K Commercials & Multi-Slide Brand Systems
                      </h3>
                    </div>
                  </div>
                  <span className="text-xs font-mono text-slate-400 bg-slate-950 px-2.5 py-1 rounded-md border border-slate-800 w-fit">
                    16:9 & 4:3 Balanced 2-Column Grid
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 items-stretch">
                  {widescreenItems.map((item) => renderCard(item, false))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Case 2: When a specific category tab is active, pack visible cards with strict gapless layout */}
        {activeCategory !== 'All' && (
          <div>
            {filteredItems.length > 0 ? (
              verticalItems.length > 0 && widescreenItems.length === 0 ? (
                /* Purely vertical category like UGC -> uniform vertical subgrid */
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6 sm:gap-8 items-stretch">
                  {filteredItems.map((item) => renderCard(item, true))}
                </div>
              ) : widescreenItems.length > 0 && verticalItems.length === 0 ? (
                /* Purely horizontal category -> balanced 2-column grid */
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 items-stretch">
                  {filteredItems.map((item) => renderCard(item, false))}
                </div>
              ) : (
                /* Mixed category items */
                <div className="space-y-12">
                  {verticalItems.length > 0 && (
                    <div>
                      <div className="text-xs font-mono uppercase text-amber-400 mb-4 pb-2 border-b border-slate-800">
                        Vertical Short-Form (9:16)
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 items-stretch">
                        {verticalItems.map((item) => renderCard(item, true))}
                      </div>
                    </div>
                  )}
                  {widescreenItems.length > 0 && (
                    <div>
                      <div className="text-xs font-mono uppercase text-amber-400 mb-4 pb-2 border-b border-slate-800">
                        Widescreen & Multi-Slide Showcases
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 items-stretch">
                        {widescreenItems.map((item) => renderCard(item, false))}
                      </div>
                    </div>
                  )}
                </div>
              )
            ) : (
              <div className="p-12 text-center bg-slate-950 rounded-2xl border border-slate-800">
                <p className="text-sm text-slate-400 mb-3">
                  No projects found in this category yet.
                </p>
                <button
                  onClick={() => setActiveCategory('All')}
                  className="px-4 py-2 text-xs font-semibold bg-amber-400 text-slate-950 rounded-lg cursor-pointer"
                >
                  View All Projects
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Lightbox Modal with Backward / Forward Image Navigation */}
      {lightboxData && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-fade-in"
          onClick={() => setLightboxData(null)}
        >
          <div
            className="relative max-w-4xl w-full bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 bg-slate-900 border-b border-slate-800">
              <div>
                <span className="text-xs text-amber-400 font-semibold font-mono">
                  {lightboxData.category} · {lightboxData.client}
                </span>
                <h3 className="text-base font-bold text-white font-display">
                  {lightboxData.title}
                </h3>
              </div>
              <div className="flex items-center gap-3">
                {lightboxData.images.length > 1 && (
                  <span className="text-xs font-mono font-medium text-amber-300 bg-slate-950 px-2.5 py-1 rounded-md border border-slate-800">
                    Slide {lightboxData.currentIndex + 1} of {lightboxData.images.length}
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => setLightboxData(null)}
                  className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
                  title="Close (Esc)"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Image Canvas with Left & Right Arrows */}
            <div className="relative p-4 flex items-center justify-center bg-black min-h-[320px] max-h-[75vh] overflow-hidden select-none">
              <img
                src={lightboxData.images[lightboxData.currentIndex] || lightboxData.images[0]}
                alt={`${lightboxData.title} - Slide ${lightboxData.currentIndex + 1}`}
                className="max-h-[68vh] w-auto max-w-full object-contain rounded transition-all duration-300"
              />

              {/* Backward / Forward Navigation Arrows */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setLightboxData((prev) => {
                    if (!prev) return null;
                    const imgs =
                      prev.images && prev.images.length > 1 ? prev.images : fallbackGraphicSlides;
                    const nextIdx = (prev.currentIndex - 1 + imgs.length) % imgs.length;
                    return { ...prev, images: imgs, currentIndex: nextIdx };
                  });
                }}
                className="absolute left-3 sm:left-5 top-1/2 -translate-y-1/2 z-30 w-12 h-12 rounded-full bg-slate-950/90 hover:bg-amber-400 text-white hover:text-slate-950 border border-slate-700/80 hover:border-amber-400 flex items-center justify-center transition-all shadow-2xl cursor-pointer hover:scale-110 active:scale-95 ring-1 ring-white/10"
                title="Previous Image (Left Arrow Key)"
                aria-label="Previous Slide"
              >
                <ChevronLeft className="w-6 h-6 stroke-[2.5]" />
              </button>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setLightboxData((prev) => {
                    if (!prev) return null;
                    const imgs =
                      prev.images && prev.images.length > 1 ? prev.images : fallbackGraphicSlides;
                    const nextIdx = (prev.currentIndex + 1) % imgs.length;
                    return { ...prev, images: imgs, currentIndex: nextIdx };
                  });
                }}
                className="absolute right-3 sm:right-5 top-1/2 -translate-y-1/2 z-30 w-12 h-12 rounded-full bg-slate-950/90 hover:bg-amber-400 text-white hover:text-slate-950 border border-slate-700/80 hover:border-amber-400 flex items-center justify-center transition-all shadow-2xl cursor-pointer hover:scale-110 active:scale-95 ring-1 ring-white/10"
                title="Next Image (Right Arrow Key)"
                aria-label="Next Slide"
              >
                <ChevronRight className="w-6 h-6 stroke-[2.5]" />
              </button>

              {/* Dot Navigation */}
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2 p-1.5 rounded-full bg-slate-950/90 backdrop-blur-md border border-slate-800 shadow-xl">
                {lightboxData.images.map((_, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setLightboxData((prev) => (prev ? { ...prev, currentIndex: idx } : null));
                    }}
                    className={`transition-all rounded-full cursor-pointer ${
                      lightboxData.currentIndex === idx
                        ? 'w-6 h-2 bg-amber-400'
                        : 'w-2 h-2 bg-slate-600 hover:bg-slate-400'
                    }`}
                    title={`Go to slide ${idx + 1}`}
                  />
                ))}
              </div>
            </div>

            <div className="p-4 bg-slate-900/90 border-t border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs">
              <span className="text-slate-300 max-w-xl">{lightboxData.description}</span>
              <span className="font-mono text-amber-400 font-semibold bg-slate-950 px-2.5 py-1 rounded border border-slate-800">
                {lightboxData.metrics}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Website Building & Web Platform Modal */}
      {activeWebsiteItem && (
        <WebsiteModal
          item={activeWebsiteItem}
          onClose={() => setActiveWebsiteItem(null)}
        />
      )}
    </section>
  );
};
