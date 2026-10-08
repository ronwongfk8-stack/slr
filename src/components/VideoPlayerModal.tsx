import React, { useRef, useState, useEffect } from 'react';
import { X, Play, Pause, ExternalLink, AlertCircle, RefreshCw, Film } from 'lucide-react';
import { PortfolioItem } from '../types';
import { resolveLiveVideoUrl } from '../utils/storage';

interface VideoPlayerModalProps {
  item: PortfolioItem | null;
  onClose: () => void;
}

function getEmbedUrl(url: string): string | null {
  if (!url) return null;
  const ytMatch = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i);
  if (ytMatch && ytMatch[1]) {
    return `https://www.youtube-nocookie.com/embed/${ytMatch[1]}?autoplay=1&rel=0`;
  }
  const vimeoMatch = url.match(/(?:vimeo\.com\/(?:video\/)?)([0-9]+)/i);
  if (vimeoMatch && vimeoMatch[1]) {
    return `https://player.vimeo.com/video/${vimeoMatch[1]}?autoplay=1`;
  }
  return null;
}

export const VideoPlayerModal: React.FC<VideoPlayerModalProps> = ({ item, onClose }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const getInitialVideoUrl = () => {
    const raw = item?.videoUrl || item?.mediaUrl;
    if (raw && !raw.startsWith('indexeddb:') && !raw.includes('commondatastorage.googleapis.com')) {
      return raw;
    }
    return item?.category === 'UGC' || item?.aspectRatio === '9:16'
      ? '/videos/ugc_growth_9x16.mp4'
      : '/videos/commercial_4k_reel_16_9.mp4';
  };

  const [resolvedSource, setResolvedSource] = useState<string>(getInitialVideoUrl);

  const videoSource = resolvedSource || getInitialVideoUrl();
  const thumbnailPoster = item?.imageUrl?.trim() || item?.posterUrl?.trim() || '';
  const isVertical = item?.aspectRatio === '9:16' || item?.category === 'UGC';
  const embedUrl = getEmbedUrl(videoSource);

  useEffect(() => {
    setHasError(false);
    setIsLoading(true);
    setIsPlaying(false);

    if (item) {
      // First set synchronous fallback or known URL
      const initial = getInitialVideoUrl();
      setResolvedSource(initial);

      // Then asynchronously resolve live blob URL from IndexedDB if needed
      resolveLiveVideoUrl(item.id, item.videoUrl || item.mediaUrl).then((url) => {
        if (url && !url.startsWith('indexeddb:')) {
          setResolvedSource(url);
          if (videoRef.current && videoRef.current.src !== url) {
            videoRef.current.src = url;
            videoRef.current.load();
          }
        }
      });
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [item?.id, item?.videoUrl, item?.mediaUrl, onClose]);

  if (!item) return null;

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      setIsLoading(true);
      videoRef.current
        .play()
        .then(() => {
          setIsPlaying(true);
          setIsLoading(false);
        })
        .catch((err) => {
          console.warn('Playback resume issue:', err);
          setIsLoading(false);
        });
    }
  };

  const handleRetry = () => {
    setHasError(false);
    setIsLoading(true);
    if (item) {
      resolveLiveVideoUrl(item.id, item.videoUrl || item.mediaUrl).then((url) => {
        setResolvedSource(url);
        if (videoRef.current) {
          videoRef.current.src = url;
          videoRef.current.load();
          videoRef.current
            .play()
            .then(() => {
              setIsPlaying(true);
              setIsLoading(false);
            })
            .catch(() => setIsLoading(false));
        }
      });
    }
  };

  const handlePlaySampleVideo = () => {
    const fallback = item.category === 'UGC' || item.aspectRatio === '9:16'
      ? '/videos/ugc_growth_9x16.mp4'
      : '/videos/commercial_4k_reel_16_9.mp4';
    setResolvedSource(fallback);
    setHasError(false);
    setIsLoading(true);
    setTimeout(() => {
      if (videoRef.current) {
        videoRef.current.src = fallback;
        videoRef.current.load();
        videoRef.current.play().then(() => {
          setIsPlaying(true);
          setIsLoading(false);
        }).catch(() => setIsLoading(false));
      }
    }, 100);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/90 backdrop-blur-md animate-fade-in"
      onClick={onClose}
    >
      {/* Fixed prominent close button in top right of viewport */}
      <button
        type="button"
        onClick={onClose}
        aria-label="Close Video Player"
        className="fixed top-4 right-4 z-50 p-2.5 rounded-full bg-slate-900/90 hover:bg-amber-400 text-slate-200 hover:text-slate-950 border border-slate-700 hover:border-amber-400 shadow-2xl transition-all cursor-pointer"
        title="Close Video (Esc)"
      >
        <X className="w-5 h-5 stroke-[2.5]" />
      </button>

      <div
        className={`relative w-full ${isVertical ? 'max-w-md' : 'max-w-4xl'} bg-slate-950 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden text-slate-100 flex flex-col`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top bar */}
        <div className="flex items-center justify-between p-4 bg-slate-900/90 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2 text-xs text-amber-400 font-mono">
              <span className="font-semibold">{item.category}</span>
              <span>·</span>
              <span className="text-slate-400">{item.client}</span>
              <span>·</span>
              <span className="text-emerald-400 font-bold">
                {isVertical ? '9:16 Vertical Reel' : '4K Reel MP4'}
              </span>
            </div>
            <h3 className="text-base sm:text-lg font-bold font-display text-white mt-0.5">
              {item.title}
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePlaySampleVideo}
              className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700 hover:border-amber-400/50 cursor-pointer transition-all"
              title="Play Guaranteed 4K Commercial Reel"
            >
              <Film className="w-3.5 h-3.5" />
              <span>4K Stream</span>
            </button>
            {videoSource.startsWith('http') && (
              <a
                href={videoSource}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
                title="Open raw MP4 stream in new tab"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            )}
            <button
              onClick={onClose}
              aria-label="Close Video Player"
              className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Video Canvas Container */}
        <div 
          className={`relative bg-black ${isVertical ? 'aspect-[9/16] max-h-[72vh]' : 'aspect-video'} flex items-center justify-center group overflow-hidden`}
        >
          {hasError ? (
            <div className="flex flex-col items-center justify-center p-6 text-center max-w-md">
              <AlertCircle className="w-10 h-10 text-amber-400 mb-2" />
              <p className="text-sm font-semibold text-white mb-1">
                Unable to Stream Video Direct
              </p>
              <p className="text-xs text-slate-400 mb-4">
                The video URL could not be played. You can retry streaming or play the high-definition sample reel.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={handleRetry}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Retry Stream</span>
                </button>
                <button
                  type="button"
                  onClick={handlePlaySampleVideo}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold rounded-lg bg-amber-400 text-slate-950 hover:bg-amber-300 cursor-pointer"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Play 4K Sample Stream</span>
                </button>
              </div>
            </div>
          ) : embedUrl ? (
            <iframe
              src={embedUrl}
              title={item.title}
              className="w-full h-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : (
            <>
              <video
                key={videoSource}
                ref={videoRef}
                src={videoSource}
                poster={isPlaying ? undefined : (thumbnailPoster || undefined)}
                playsInline
                crossOrigin="anonymous"
                controls
                preload="auto"
                onLoadedMetadata={() => setIsLoading(false)}
                onLoadedData={() => setIsLoading(false)}
                onCanPlay={() => setIsLoading(false)}
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
                onError={() => {
                  console.warn('Video playback encountered an issue:', videoSource);
                  const fallback = item.category === 'UGC' || item.aspectRatio === '9:16'
                    ? '/videos/ugc_growth_9x16.mp4'
                    : '/videos/commercial_4k_reel_16_9.mp4';
                  if (videoSource !== fallback) {
                    setResolvedSource(fallback);
                    setHasError(false);
                  } else {
                    setHasError(true);
                  }
                  setIsLoading(false);
                }}
                className="w-full h-full object-contain"
              >
                Your browser does not support HTML5 video streaming.
              </video>

              {/* Big Centered Play Button when paused */}
              {!isPlaying && !hasError && (
                <div 
                  className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[1px] cursor-pointer z-10 transition-opacity"
                  onClick={togglePlay}
                  role="button"
                  aria-label="Play Video"
                >
                  <div className="w-16 h-16 rounded-full bg-amber-400 hover:bg-amber-300 text-slate-950 flex items-center justify-center shadow-2xl transform transition-transform hover:scale-110">
                    <Play className="w-7 h-7 ml-1 fill-current" />
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Info & Metrics Bar */}
        <div className="p-4 sm:p-5 bg-slate-900/60 border-t border-slate-800/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
          <div className="max-w-xl">
            <p className="text-slate-300 leading-relaxed">{item.description}</p>
            <div className="flex flex-wrap gap-2 mt-2">
              {item.tags.map((tag, idx) => (
                <span
                  key={idx}
                  className="px-2 py-0.5 bg-slate-800 border border-slate-700/60 text-slate-400 rounded text-[11px]"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          <div className="flex-shrink-0 bg-slate-950/80 border border-slate-800 px-3.5 py-2 rounded-xl text-right">
            <span className="text-[10px] uppercase tracking-wider text-slate-400 block font-semibold">
              Deliverable Impact
            </span>
            <span className="text-xs font-bold text-amber-300 font-mono">
              {item.metrics}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
