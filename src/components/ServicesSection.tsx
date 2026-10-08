import React, { useState, useRef, useEffect } from 'react';
import { Play, X } from 'lucide-react';
import { SiteConfig } from '../types';
import { resolveLiveVideoUrl } from '../utils/storage';

export const FALLBACK_SERVICES_VIDEO = '/videos/services_overview.mp4';

interface ServicesSectionProps {
  siteConfig: SiteConfig;
  onSaveSiteConfig?: (updatedConfig: SiteConfig) => void;
}

export const ServicesSection: React.FC<ServicesSectionProps> = ({
  siteConfig,
}) => {
  const [isPlayingInline, setIsPlayingInline] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const card3DRef = useRef<HTMLDivElement>(null);

  // 3D Perspective & Tilt Physics State for floating play button
  const [tilt, setTilt] = useState({
    rotateX: 6,
    rotateY: -10,
    glareX: 50,
    glareY: 50,
    isHovered: false,
  });

  const [liveServicesVideoSrc, setLiveServicesVideoSrc] = useState<string>(() => {
    if (siteConfig.servicesVideoUrl && !siteConfig.servicesVideoUrl.startsWith('indexeddb:') && !siteConfig.servicesVideoUrl.includes('commondatastorage')) {
      return siteConfig.servicesVideoUrl;
    }
    return FALLBACK_SERVICES_VIDEO;
  });

  useEffect(() => {
    resolveLiveVideoUrl('services_video', siteConfig.servicesVideoUrl).then((url) => {
      if (url && !url.startsWith('indexeddb:')) {
        setLiveServicesVideoSrc(url);
      } else {
        setLiveServicesVideoSrc(FALLBACK_SERVICES_VIDEO);
      }
    });
  }, [siteConfig.servicesVideoUrl]);

  const servicesVideoSrc = liveServicesVideoSrc || FALLBACK_SERVICES_VIDEO;

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = card3DRef.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = Math.max(-16, Math.min(16, ((centerY - y) / centerY) * 16));
    const rotateY = Math.max(-20, Math.min(20, ((x - centerX) / centerX) * 18 - 4));

    const glareX = Math.round((x / rect.width) * 100);
    const glareY = Math.round((y / rect.height) * 100);

    setTilt({
      rotateX,
      rotateY,
      glareX,
      glareY,
      isHovered: true,
    });
  };

  const handleMouseLeave = () => {
    setTilt({
      rotateX: 6,
      rotateY: -10,
      glareX: 50,
      glareY: 50,
      isHovered: false,
    });
  };

  const handleStartPlay = () => {
    setIsPlayingInline(true);
    setTimeout(() => {
      if (videoRef.current) {
        videoRef.current.play().catch(console.warn);
      }
    }, 50);
  };

  return (
    <section id="solutions" className="py-24 bg-slate-950 border-t border-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header with Video Showcase */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center mb-16">
          {/* Left Column: Heading, Subtitle & Action Triggers */}
          <div className="lg:col-span-7 flex flex-col justify-center">
            <div className="text-xs font-semibold tracking-wider uppercase text-amber-400 mb-2 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              <span>Integrated Business Solutions & Creative Services</span>
            </div>
            <h2
              className="text-2xl sm:text-4xl lg:text-5xl font-extrabold font-display tracking-tight text-white mb-4 leading-tight sm:leading-[1.15]"
              style={{ textWrap: 'balance' }}
            >
              Specialized Corporate Consultancy & Media Production
            </h2>
            <p className="text-base text-slate-300 leading-relaxed mb-6">
              From streamlined business restructuring to viral video reels and automated CRM pipelines, our cross-functional team delivers end-to-end execution that eliminates growth bottlenecks.
            </p>

            {/* Quick action buttons: Watch Showreel */}
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={handleStartPlay}
                className="flex items-center gap-2 px-5 py-3 text-xs sm:text-sm font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-xl transition-all shadow-lg shadow-amber-400/20 cursor-pointer active:scale-95"
              >
                <Play className="w-4 h-4 fill-slate-950 text-slate-950" />
                <span>Watch Showreel Video</span>
              </button>
            </div>
          </div>

          {/* Right Column: Video Showcase Stage */}
          <div className="lg:col-span-5 w-full flex flex-col items-center lg:items-end justify-center">
            <div className="w-full max-w-lg lg:max-w-none">
              {!isPlayingInline ? (
                /* 3D Perspective Floating Play Button Stage */
                <div
                  className="relative w-full aspect-video sm:h-72 lg:h-80 flex items-center justify-center select-none py-4 bg-transparent"
                  style={{ perspective: '1200px' }}
                >
                  {/* Dynamic 3D Interactive Floating Stage */}
                  <div
                    ref={card3DRef}
                    onMouseMove={handleMouseMove}
                    onMouseLeave={handleMouseLeave}
                    onClick={handleStartPlay}
                    className="relative flex flex-col items-center justify-center cursor-pointer group py-8 px-10 transition-transform duration-200 ease-out"
                    style={{
                      transform: `rotateX(${tilt.rotateX}deg) rotateY(${tilt.rotateY}deg)`,
                      transformStyle: 'preserve-3d',
                    }}
                    title="Click to play corporate showreel"
                  >
                    {/* Radial Ambient Backlight in 3D Space */}
                    <div
                      className="absolute inset-0 rounded-full pointer-events-none transition-opacity duration-500"
                      style={{
                        transform: 'translateZ(-15px)',
                        opacity: tilt.isHovered ? 0.9 : 0.45,
                        background:
                          'radial-gradient(circle, rgba(251, 191, 36, 0.22) 0%, rgba(251, 191, 36, 0.08) 45%, transparent 70%)',
                        filter: 'blur(20px)',
                      }}
                    />

                    {/* Specular Glare Reflection on 3D Space */}
                    <div
                      className="absolute w-44 h-44 rounded-full pointer-events-none transition-opacity duration-300"
                      style={{
                        transform: 'translateZ(25px)',
                        opacity: tilt.isHovered ? 0.6 : 0.2,
                        background: `radial-gradient(circle at ${tilt.glareX}% ${tilt.glareY}%, rgba(255, 255, 255, 0.2), transparent 60%)`,
                      }}
                    />

                    {/* 3D Floating Play Button Disc */}
                    <div
                      className="relative flex items-center justify-center pointer-events-none"
                      style={{ transform: 'translateZ(55px)' }}
                    >
                      {/* Ambient Halo Pulse */}
                      <div className="absolute w-28 h-28 sm:w-32 sm:h-32 rounded-full bg-amber-400/25 blur-xl group-hover:bg-amber-400/50 group-hover:scale-125 transition-all duration-500 ease-out animate-pulse" />

                      {/* Outer Frosted Glass Ring with Specular Edge */}
                      <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-full p-[3px] bg-gradient-to-b from-white/80 via-amber-400/50 to-amber-950/40 shadow-[0_20px_45px_rgba(0,0,0,0.7),0_0_35px_rgba(251,191,36,0.45)] backdrop-blur-md group-hover:scale-110 group-hover:shadow-[0_25px_55px_rgba(0,0,0,0.85),0_0_50px_rgba(251,191,36,0.75)] transition-all duration-300 ease-out">
                        {/* 3D Beveled Metallic Amber Core Disc */}
                        <div className="w-full h-full rounded-full bg-gradient-to-br from-amber-300 via-amber-400 to-amber-500 flex items-center justify-center shadow-[inset_0_2px_4px_rgba(255,255,255,0.7),inset_0_-4px_8px_rgba(0,0,0,0.35)] pl-1 transition-transform duration-300">
                          <Play className="w-8 h-8 sm:w-10 sm:h-10 fill-slate-950 text-slate-950 drop-shadow-[0_2px_4px_rgba(0,0,0,0.4)]" />
                        </div>
                      </div>
                    </div>

                    {/* Floating 3D Badge & Action Cue */}
                    <div
                      className="mt-5 flex flex-col items-center gap-1.5 pointer-events-none"
                      style={{ transform: 'translateZ(35px)' }}
                    >
                      <div className="px-3 py-1 rounded-full bg-slate-950/60 border border-amber-400/40 backdrop-blur-md text-amber-300 text-xs font-semibold shadow-lg group-hover:border-amber-400 group-hover:text-amber-200 transition-colors flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                        <span>{siteConfig.servicesVideoBadge || 'Consultancy & Production Reel (1:45)'}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                /* Active In-Page Video Player */
                <div className="w-full flex flex-col gap-2.5 animate-fade-in">
                  {/* Top Control Bar cleanly positioned ABOVE the video frame */}
                  <div className="flex items-center justify-between px-3 py-2 bg-slate-900/90 rounded-xl shadow-xl backdrop-blur-md">
                    <div className="flex items-center gap-2 text-xs font-semibold text-white">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      <span className="truncate max-w-[180px] sm:max-w-xs">
                        {siteConfig.servicesVideoTitle || 'Specialized Corporate Consultancy & Media Production'}
                      </span>
                    </div>
                    <button
                      onClick={() => setIsPlayingInline(false)}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-100 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-600 hover:border-amber-400 rounded-lg transition-all cursor-pointer shadow-md active:scale-95"
                      title="Close video and return to 3D view"
                    >
                      <X className="w-3.5 h-3.5 text-amber-400" />
                      <span>Close Video</span>
                    </button>
                  </div>

                  {/* HTML5 Native Video Player */}
                  <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-black shadow-[0_25px_60px_-15px_rgba(0,0,0,0.95)] border-0 border-none outline-none ring-0 ring-offset-0 focus:outline-none focus:ring-0">
                    <video
                      ref={videoRef}
                      key={`services-inline-${servicesVideoSrc}`}
                      src={servicesVideoSrc}
                      poster={siteConfig.servicesVideoPoster || undefined}
                      crossOrigin="anonymous"
                      controls
                      autoPlay
                      playsInline
                      onEnded={() => setIsPlayingInline(false)}
                      className="w-full h-full object-cover bg-black border-0 border-none outline-none ring-0 ring-offset-0 focus:outline-none focus-visible:outline-none focus:ring-0"
                      style={{ outline: 'none', border: 'none' }}
                    >
                      Your browser does not support HTML5 video.
                    </video>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
