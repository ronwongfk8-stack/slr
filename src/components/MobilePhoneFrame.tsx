import React, { useRef, useState, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX } from 'lucide-react';
import { PortfolioItem } from '../types';
import { resolveLiveVideoUrl } from '../utils/storage';

export const FALLBACK_VERTICAL_MP4 = '/videos/ugc_growth_9x16.mp4';
export const FALLBACK_UGC_POSTER = '/src/assets/images/showcase_ugc_creator_1790504084326.jpg';

interface MobilePhoneFrameProps {
  item: PortfolioItem;
  className?: string;
}

export const MobilePhoneFrame: React.FC<MobilePhoneFrameProps> = ({
  item,
  className = '',
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true); // Default muted for browser autoplay compliance

  const getValidVerticalVideo = (raw?: string) => {
    if (raw && !raw.startsWith('indexeddb:') && !raw.includes('commondatastorage.googleapis.com')) {
      return raw;
    }
    return FALLBACK_VERTICAL_MP4;
  };

  const [liveVideoSrc, setLiveVideoSrc] = useState<string>(() => {
    return getValidVerticalVideo(item.videoUrl || item.mediaUrl);
  });

  useEffect(() => {
    resolveLiveVideoUrl(item.id, item.videoUrl || item.mediaUrl).then((url) => {
      if (url && !url.startsWith('indexeddb:')) {
        setLiveVideoSrc(url);
      } else {
        setLiveVideoSrc(FALLBACK_VERTICAL_MP4);
      }
    });
  }, [item.id, item.videoUrl, item.mediaUrl]);

  const videoSource = liveVideoSrc || FALLBACK_VERTICAL_MP4;
  const thumbnailPoster = item.imageUrl?.trim() || item.posterUrl?.trim() || FALLBACK_UGC_POSTER;

  // Cross-browser autoplay policy handler with try-catch
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Browser policy enforces muted autoplay on initial load
    video.muted = true;
    setIsMuted(true);

    try {
      const playPromise = video.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            setIsPlaying(true);
          })
          .catch((err) => {
            console.log('Autoplay deferred until user interaction:', err);
            setIsPlaying(false);
          });
      }
    } catch (err) {
      console.warn('Playback policy error handled safely:', err);
      setIsPlaying(false);
    }
  }, [videoSource]);

  const handleTogglePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.muted = false;
      videoRef.current.volume = 1;
      setIsMuted(false);
      videoRef.current
        .play()
        .then(() => setIsPlaying(true))
        .catch((err) => {
          console.warn('Unmuted playback policy fallback:', err);
          if (videoRef.current) {
            videoRef.current.muted = true;
            setIsMuted(true);
            videoRef.current.play().then(() => setIsPlaying(true)).catch(console.warn);
          }
        });
    }
  };

  const handleToggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!videoRef.current) return;
    const nextMuted = !isMuted;
    videoRef.current.muted = nextMuted;
    setIsMuted(nextMuted);
  };

  return (
    <div className={`relative flex flex-col items-center select-none w-full ${className}`}>
      {/* Smartphone Chassis Exterior - 30% Enlarged Prominent Proportions */}
      <div className="relative w-full max-w-[232px] sm:max-w-[252px] aspect-[9/17] rounded-[32px] sm:rounded-[36px] p-2.5 sm:p-3 bg-gradient-to-b from-slate-800 via-slate-900 to-slate-950 border border-slate-700/80 shadow-[0_24px_50px_-8px_rgba(0,0,0,0.95),0_0_24px_rgba(245,158,11,0.12)] ring-1 ring-slate-800">
        
        {/* Antenna band accents */}
        <div className="absolute -left-[1.5px] top-14 w-[2px] h-5 bg-slate-600 rounded-l" />
        <div className="absolute -left-[1.5px] top-24 w-[2px] h-6 bg-slate-600 rounded-l" />
        <div className="absolute -right-[1.5px] top-18 w-[2px] h-7 bg-slate-600 rounded-r" />

        {/* Screen Bezel & Container - Clean Full-Frame Video Canvas */}
        <div 
          className="relative w-full h-full rounded-[24px] sm:rounded-[28px] overflow-hidden bg-black group shadow-inner cursor-pointer"
          onClick={handleTogglePlay}
          title={isPlaying ? "Click to pause" : "Click to play with audio"}
        >
          {/* Top Speaker Notch / Dynamic Island */}
          <div className="absolute top-2 left-1/2 -translate-x-1/2 z-30 flex items-center justify-center pointer-events-none">
            <div className="w-16 h-3.5 bg-black rounded-full border border-slate-800 flex items-center justify-between px-2.5 shadow-sm">
              <div className="w-1.5 h-1.5 rounded-full bg-slate-950 ring-1 ring-slate-800/60" />
              <div className="w-1.5 h-1.5 rounded-full bg-amber-400/80 animate-pulse" />
            </div>
          </div>

          {/* Discreet Audio Control Toggle (Top-Right) */}
          <div className="absolute top-2.5 right-2.5 z-30">
            <button
              type="button"
              onClick={handleToggleMute}
              aria-label={isMuted ? "Unmute Sound" : "Mute Sound"}
              className={`w-7 h-7 rounded-full backdrop-blur-md border flex items-center justify-center transition-all cursor-pointer shadow-lg ${
                !isMuted && isPlaying
                  ? 'bg-amber-400 text-slate-950 border-amber-300 shadow-amber-400/20'
                  : 'bg-black/70 border-white/15 text-slate-200 hover:text-white hover:bg-black/90'
              }`}
              title={isMuted ? "Unmute audio" : "Mute audio"}
            >
              {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
            </button>
          </div>

          {/* Core Video Element - Direct CORS HTTPS stream, clean full-frame */}
          <video
            ref={videoRef}
            src={videoSource}
            poster={thumbnailPoster}
            preload="metadata"
            playsInline
            muted={isMuted}
            autoPlay
            loop
            crossOrigin="anonymous"
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            onError={() => {
              if (videoSource !== FALLBACK_VERTICAL_MP4) {
                setLiveVideoSrc(FALLBACK_VERTICAL_MP4);
              }
            }}
            className="w-full h-full object-cover"
          />

          {/* Centered Play Button Affordance when Paused */}
          {!isPlaying && (
            <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none bg-black/25">
              <div className="w-12 h-12 rounded-full bg-amber-400/95 hover:bg-amber-400 text-slate-950 flex items-center justify-center shadow-2xl backdrop-blur-sm transform transition-transform group-hover:scale-110">
                <Play className="w-6 h-6 ml-0.5 fill-current" />
              </div>
            </div>
          )}

          {/* Subtle Home Indicator Bar */}
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 z-20 pointer-events-none">
            <div className="w-16 h-1 bg-white/35 rounded-full" />
          </div>
        </div>
      </div>

      {/* Frame Caption */}
      <span className="mt-2 text-[10px] font-mono text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
        <span>9:16 Vertical UGC</span>
        {isPlaying && !isMuted && <span className="text-emerald-400 font-bold">· Audio On</span>}
      </span>
    </div>
  );
};
