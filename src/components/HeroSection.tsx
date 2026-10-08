import React, { useState, useRef, useEffect } from 'react';
import { ArrowRight, Play, MapPin, QrCode, Mail, Sparkles } from 'lucide-react';
import { SiteConfig } from '../types';
import { resolveLiveVideoUrl } from '../utils/storage';

interface HeroSectionProps {
  siteConfig: SiteConfig;
  onOpenQR: () => void;
  onExplorePortfolio: () => void;
  onOpenHeroVideoModal?: () => void;
  onSaveSiteConfig?: (updatedConfig: SiteConfig) => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  siteConfig,
  onOpenQR,
  onExplorePortfolio,
  onOpenHeroVideoModal,
  onSaveSiteConfig,
}) => {
  const [liveHeroVideoSrc, setLiveHeroVideoSrc] = useState<string>(() => {
    if (siteConfig.heroVideoUrl && !siteConfig.heroVideoUrl.startsWith('indexeddb:') && !siteConfig.heroVideoUrl.includes('commondatastorage')) {
      return siteConfig.heroVideoUrl;
    }
    return '/videos/hero_talking_head.mp4';
  });

  const [live916VideoSrc, setLive916VideoSrc] = useState<string>(() => {
    if (siteConfig.intro916VideoUrl && !siteConfig.intro916VideoUrl.startsWith('indexeddb:') && !siteConfig.intro916VideoUrl.includes('commondatastorage')) {
      return siteConfig.intro916VideoUrl;
    }
    return '/videos/ugc_creator_reel_9_16.mp4';
  });

  // State to track playback sequence
  const [isPlaying916, setIsPlaying916] = useState(true);
  const [has916Finished, setHas916Finished] = useState(false);
  const [isPlayingEnterprise, setIsPlayingEnterprise] = useState(false);

  // Audio controls: audio on automatically by default
  const [isMuted916, setIsMuted916] = useState(false);

  const video916Ref = useRef<HTMLVideoElement>(null);
  const enterpriseVideoRef = useRef<HTMLVideoElement>(null);

  // Resolve live videos from storage/IndexedDB
  useEffect(() => {
    resolveLiveVideoUrl('hero_video', siteConfig.heroVideoUrl).then((url) => {
      if (url && !url.startsWith('indexeddb:')) {
        setLiveHeroVideoSrc(url);
      }
    });
  }, [siteConfig.heroVideoUrl]);

  useEffect(() => {
    resolveLiveVideoUrl('intro_916_video', siteConfig.intro916VideoUrl).then((url) => {
      if (url && !url.startsWith('indexeddb:')) {
        setLive916VideoSrc(url);
        // Persist video configuration permanently
        if (onSaveSiteConfig && siteConfig.intro916VideoUrl !== url) {
          onSaveSiteConfig({
            ...siteConfig,
            intro916VideoUrl: url,
          });
        }
      }
    });
  }, [siteConfig.intro916VideoUrl]);

  // Once open this app it will auto play the 9:16 video with audio on automatically
  useEffect(() => {
    const video = video916Ref.current;
    if (!video) return;

    video.muted = false;
    setIsMuted916(false);

    const playPromise = video.play();
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          setIsPlaying916(true);
        })
        .catch((err) => {
          console.warn('Autoplay unmuted fallback:', err);
          // If browser policy blocks unmuted autoplay before gesture, start muted then unmute on first gesture
          video.muted = true;
          setIsMuted916(true);
          video
            .play()
            .then(() => setIsPlaying916(true))
            .catch(console.warn);

          const autoUnmuteOnGesture = () => {
            if (video916Ref.current) {
              video916Ref.current.muted = false;
              setIsMuted916(false);
            }
            window.removeEventListener('click', autoUnmuteOnGesture);
            window.removeEventListener('touchstart', autoUnmuteOnGesture);
            window.removeEventListener('keydown', autoUnmuteOnGesture);
          };
          window.addEventListener('click', autoUnmuteOnGesture, { once: true });
          window.addEventListener('touchstart', autoUnmuteOnGesture, { once: true });
          window.addEventListener('keydown', autoUnmuteOnGesture, { once: true });
        });
    }
  }, [live916VideoSrc]);

  // When 9:16 video finishes, auto-play the Enterprise Growth Advisory video!
  const handle916Ended = () => {
    setHas916Finished(true);
    setIsPlaying916(false);
    setIsPlayingEnterprise(true);
    if (enterpriseVideoRef.current) {
      enterpriseVideoRef.current.currentTime = 0;
      enterpriseVideoRef.current
        .play()
        .catch((err) => {
          console.warn('Enterprise video autoplay fallback:', err);
          if (enterpriseVideoRef.current) {
            enterpriseVideoRef.current.muted = true;
            enterpriseVideoRef.current.play().catch(console.warn);
          }
        });
    }
  };

  return (
    <section id="home" className="relative min-h-[85vh] flex items-center pt-12 pb-20 overflow-hidden">
      {/* Background Media with Architectural Scrim */}
      <div className="absolute inset-0 z-0">
        <img
          src="/src/assets/images/hero_sapotlokal_agency_1790504057787.jpg"
          alt="Sapotlokal Resources Studio"
          className="w-full h-full object-cover object-center opacity-30 scale-105"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/80 to-slate-950/40" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-amber-500/10 via-transparent to-transparent" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        {/* 2-Column Responsive Layout on Desktop */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center mb-12">
          {/* Left Column: Heading, Subtext, Call-to-action buttons & Core Focus */}
          <div className="lg:col-span-7 flex flex-col justify-center">
            {/* Editorial Sub-marker & Location */}
            <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs text-slate-400 mb-5">
              <div className="flex items-center gap-1.5 text-amber-400 font-semibold tracking-wide">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                <span>Corporate Growth Consultancy & Media Production</span>
              </div>
              <span aria-hidden="true" className="text-slate-600">·</span>
              <div className="flex items-center gap-1 text-slate-300">
                <MapPin className="w-3.5 h-3.5 text-amber-400/80" />
                <span>Balakong, Cheras, Selangor</span>
              </div>
              <span aria-hidden="true" className="text-slate-600">·</span>
              <a
                href="mailto:sapotlokal.co@gmail.com"
                className="flex items-center gap-1 text-slate-300 hover:text-amber-400 transition-colors font-mono"
                title="Official Corporate Email"
              >
                <Mail className="w-3.5 h-3.5 text-amber-400/80" />
                <span>sapotlokal.co@gmail.com</span>
              </a>
            </div>

            {/* Main Headline */}
            <h1
              className="text-3xl sm:text-5xl lg:text-6xl font-extrabold font-display tracking-tight text-white leading-[1.15] sm:leading-[1.12] mb-5"
              style={{ textWrap: 'balance' }}
            >
              {siteConfig.heroHeadline}
            </h1>

            {/* Subtitle Value Proposition */}
            <p className="text-sm sm:text-base lg:text-lg text-slate-300 leading-relaxed mb-6 max-w-2xl">
              {siteConfig.heroSubheadline}
            </p>

            {/* Core Focus Tags Line */}
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs sm:text-sm text-slate-300 mb-8 border-l-2 border-amber-400 pl-4 py-1">
              <span className="font-semibold text-white">Core Focus:</span>
              <span>Video Editing</span>
              <span aria-hidden="true" className="text-slate-600">·</span>
              <span>Social Content</span>
              <span aria-hidden="true" className="text-slate-600">·</span>
              <span>Graphic Design</span>
              <span aria-hidden="true" className="text-slate-600">·</span>
              <span>UGC Campaigns</span>
              <span aria-hidden="true" className="text-slate-600">·</span>
              <span>Branding Strategies</span>
            </div>

            {/* Primary Action Buttons */}
            <div className="flex flex-wrap items-center gap-3 sm:gap-4">
              <a
                href="#contact"
                className="flex items-center gap-2 px-5 py-3 text-sm font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-xl transition-all shadow-lg shadow-amber-400/20 whitespace-nowrap"
              >
                <span>Request Strategic Proposal</span>
                <ArrowRight className="w-4 h-4" />
              </a>

              <button
                onClick={onExplorePortfolio}
                className="flex items-center gap-2 px-4 py-3 text-sm font-semibold text-white bg-slate-900/90 hover:bg-slate-800 border border-slate-700/80 rounded-xl transition-all whitespace-nowrap"
              >
                <Play className="w-4 h-4 text-amber-400 fill-amber-400" />
                <span>Watch Creative Showreel</span>
              </button>

              <button
                onClick={onOpenQR}
                className="flex items-center gap-2 px-3.5 py-3 text-sm font-medium text-slate-300 hover:text-white bg-slate-950/60 hover:bg-slate-900 border border-slate-800 rounded-xl transition-all whitespace-nowrap"
              >
                <QrCode className="w-4 h-4 text-amber-400" />
                <span>Generate Quick QR</span>
              </button>
            </div>
          </div>

          {/* Right Column: Intro Video ABOVE Enterprise Growth Advisory Video */}
          <div className="lg:col-span-5 w-full flex flex-col items-center justify-center gap-4">
            <div className="w-full max-w-lg flex flex-col items-center gap-3">
              {/* 1. Intro 9:16 Video (Borderless clean frame, auto-plays on open with zero play buttons) */}
              <div className="relative w-[180px] sm:w-[200px] aspect-[9/16] rounded-2xl overflow-hidden bg-black shadow-2xl transition-all">
                <video
                  ref={video916Ref}
                  src={live916VideoSrc}
                  poster={siteConfig.intro916VideoPoster || '/src/assets/images/showcase_ugc_creator_1790504084326.jpg'}
                  autoPlay
                  playsInline
                  crossOrigin="anonymous"
                  muted={isMuted916}
                  onEnded={handle916Ended}
                  onPlay={() => setIsPlaying916(true)}
                  onPause={() => setIsPlaying916(false)}
                  className="w-full h-full object-cover cursor-pointer"
                  onClick={() => {
                    if (video916Ref.current) {
                      if (video916Ref.current.paused) {
                        video916Ref.current.play().catch(console.warn);
                      } else {
                        video916Ref.current.pause();
                      }
                    }
                  }}
                />
              </div>

              {/* 2. Enterprise Growth Advisory Video (16:9 player placed directly below intro video) */}
              <div
                className="relative w-full aspect-video rounded-2xl overflow-hidden bg-black shadow-2xl border border-slate-800 transition-all duration-300"
              >
                <video
                  ref={enterpriseVideoRef}
                  key={`enterprise-${liveHeroVideoSrc}`}
                  src={liveHeroVideoSrc}
                  poster={siteConfig.heroVideoPoster || '/src/assets/images/hero_sapotlokal_agency_1790504057787.jpg'}
                  controls
                  playsInline
                  crossOrigin="anonymous"
                  onPlay={() => {
                    setIsPlayingEnterprise(true);
                    if (video916Ref.current && isPlaying916) {
                      video916Ref.current.pause();
                      setIsPlaying916(false);
                    }
                  }}
                  onPause={() => setIsPlayingEnterprise(false)}
                  className="w-full h-full object-cover bg-black"
                >
                  Your browser does not support HTML5 video.
                </video>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
