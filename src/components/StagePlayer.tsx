import React, { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { Play, Pause, Volume2, VolumeX, Maximize, RotateCcw } from 'lucide-react';

export interface StagePlayerProps {
  src: string;
  poster?: string;
  /** when true the video starts (with sound if the browser allows it, otherwise muted + "Tap for sound") */
  autoPlay?: boolean;
  /** set to false to pause the video from outside (e.g. while a menu is open) */
  active?: boolean;
  /** small label in the top-left corner */
  badge?: string;
  /** width / height of the video (defaults to 16:9). Updated automatically from the file. */
  ratio?: number;
  /** tall videos are limited to this share of the screen height */
  maxHeightVh?: number;
  /** called when the video reaches its end */
  onEnded?: () => void;
  /** called when the VISITOR pauses the video (not when the code pauses it) */
  onUserPause?: () => void;
  /** shown over the video once it has ended. `replay` restarts the video. */
  endOverlay?: (api: { replay: () => void }) => React.ReactNode;
}

const formatTime = (s: number) => {
  if (!isFinite(s) || s < 0) s = 0;
  return `${Math.floor(s / 60)}:${Math.floor(s % 60).toString().padStart(2, '0')}`;
};

export const StagePlayer = forwardRef<HTMLVideoElement, StagePlayerProps>(function StagePlayer(
  { src, poster, autoPlay = false, active = true, badge, ratio = 16 / 9, maxHeightVh = 64, onEnded, onUserPause, endOverlay },
  forwardedRef
) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const boxRef = useRef<HTMLDivElement>(null);
  const fillRef = useRef<HTMLDivElement>(null);
  const timeRef = useRef<HTMLSpanElement>(null);
  const programmaticPauseRef = useRef(false);
  const autoMutedRef = useRef(false);
  const autoStartedForRef = useRef<string | null>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [hasEnded, setHasEnded] = useState(false);
  const [boxRatio, setBoxRatio] = useState(ratio);

  useImperativeHandle(forwardedRef, () => videoRef.current as HTMLVideoElement);

  // Start playback: try WITH sound first, otherwise muted + the first click/tap/key turns sound on
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !autoPlay || !active) return;
    // start each video file only once (closing a menu must not restart a video the visitor stopped)
    if (autoStartedForRef.current === src) return;
    autoStartedForRef.current = src;

    video.muted = false;
    setIsMuted(false);
    autoMutedRef.current = false;

    const unmuteOnGesture = () => {
      if (autoMutedRef.current && videoRef.current) {
        videoRef.current.muted = false;
        autoMutedRef.current = false;
      }
      window.removeEventListener('click', unmuteOnGesture);
      window.removeEventListener('touchstart', unmuteOnGesture);
      window.removeEventListener('keydown', unmuteOnGesture);
    };

    video
      .play()
      .catch(() => {
        video.muted = true;
        setIsMuted(true);
        autoMutedRef.current = true;
        window.addEventListener('click', unmuteOnGesture, { once: true });
        window.addEventListener('touchstart', unmuteOnGesture, { once: true });
        window.addEventListener('keydown', unmuteOnGesture, { once: true });
        return video.play();
      })
      .catch(() => undefined);

    return () => {
      window.removeEventListener('click', unmuteOnGesture);
      window.removeEventListener('touchstart', unmuteOnGesture);
      window.removeEventListener('keydown', unmuteOnGesture);
    };
  }, [autoPlay, active, src]);

  // Pause from outside
  useEffect(() => {
    const video = videoRef.current;
    if (video && !active && !video.paused) {
      programmaticPauseRef.current = true;
      video.pause();
    }
  }, [active]);

  // Progress bar + time text (written straight to the DOM, no re-rendering)
  useEffect(() => {
    let raf = 0;
    const tick = () => {
      const v = videoRef.current;
      if (v) {
        const d = v.duration || 0;
        if (fillRef.current) fillRef.current.style.width = d ? `${Math.min(100, (v.currentTime / d) * 100)}%` : '0%';
        if (timeRef.current) timeRef.current.textContent = `${formatTime(v.currentTime)} / ${formatTime(d)}`;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  // New video file: reset
  useEffect(() => {
    setHasEnded(false);
    setBoxRatio(ratio);
  }, [src, ratio]);

  const togglePlay = useCallback(() => {
    const v = videoRef.current;
    if (!v) return;
    if (v.ended) v.currentTime = 0;
    if (v.paused) v.play().catch(() => undefined);
    else v.pause();
  }, []);

  const toggleMute = useCallback(() => {
    const v = videoRef.current;
    if (!v) return;
    autoMutedRef.current = false;
    v.muted = !v.muted;
  }, []);

  const replay = useCallback(() => {
    const v = videoRef.current;
    if (!v) return;
    v.currentTime = 0;
    setHasEnded(false);
    v.muted = false;
    v.play().catch(() => {
      v.muted = true;
      v.play().catch(() => undefined);
    });
  }, []);

  const seekFromPointer = (e: React.PointerEvent<HTMLDivElement>) => {
    const v = videoRef.current;
    if (!v || !v.duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const r = Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width));
    v.currentTime = r * v.duration;
    if (hasEnded && r < 0.99) setHasEnded(false);
  };

  const goFullscreen = () => {
    const v = videoRef.current as (HTMLVideoElement & { webkitEnterFullscreen?: () => void }) | null;
    const box = boxRef.current;
    if (box && box.requestFullscreen) box.requestFullscreen().catch(() => undefined);
    else if (v && v.webkitEnterFullscreen) v.webkitEnterFullscreen();
  };

  return (
    <div
      ref={boxRef}
      className="group relative mx-auto overflow-hidden rounded-2xl bg-black shadow-2xl shadow-black/60 ring-1 ring-white/15"
      style={{
        aspectRatio: String(boxRatio),
        width: `min(100%, ${(maxHeightVh * boxRatio).toFixed(2)}vh)`,
      }}
    >
      <video
        ref={videoRef}
        key={src}
        src={src.includes('#') || src.startsWith('blob:') ? src : `${src}#t=0.1`}
        poster={poster}
        preload="auto"
        playsInline
        onLoadedMetadata={(e) => {
          const v = e.currentTarget;
          if (v.videoWidth && v.videoHeight) {
            const r = v.videoWidth / v.videoHeight;
            if (Math.abs(r - boxRatio) / boxRatio > 0.02) setBoxRatio(r);
          }
        }}
        onPlay={() => {
          setIsPlaying(true);
          setHasEnded(false);
        }}
        onPause={(e) => {
          setIsPlaying(false);
          const v = e.currentTarget;
          if (v.ended) return;
          if (programmaticPauseRef.current) {
            programmaticPauseRef.current = false;
            return;
          }
          onUserPause?.();
        }}
        onEnded={() => {
          setHasEnded(true);
          onEnded?.();
        }}
        onVolumeChange={(e) => setIsMuted(e.currentTarget.muted)}
        onClick={togglePlay}
        className="h-full w-full cursor-pointer bg-black object-cover"
      >
        Your browser does not support HTML5 video.
      </video>

      {badge && (
        <div className="pointer-events-none absolute left-3 top-3 flex items-center gap-2 rounded-full border border-white/15 bg-black/55 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/90 backdrop-blur">
          <span className={`h-1.5 w-1.5 rounded-full bg-amber-400 ${isPlaying ? 'animate-pulse' : ''}`} />
          {badge}
        </div>
      )}

      {isMuted && isPlaying && (
        <button
          type="button"
          onClick={toggleMute}
          className="absolute right-3 top-3 flex items-center gap-1.5 rounded-full border border-white/25 bg-black/70 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur transition hover:bg-black/90"
        >
          <Volume2 className="h-3.5 w-3.5" /> Tap for sound
        </button>
      )}

      {!isPlaying && !hasEnded && (
        <button
          type="button"
          onClick={togglePlay}
          aria-label="Play video"
          className="absolute inset-0 m-auto flex h-16 w-16 items-center justify-center rounded-full bg-amber-400 text-slate-950 shadow-xl shadow-amber-400/30 transition hover:scale-105 hover:bg-amber-300"
        >
          <Play className="ml-0.5 h-7 w-7 fill-slate-950" />
        </button>
      )}

      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent px-3 pb-2.5 pt-8">
        <div
          role="slider"
          aria-label="Video progress"
          className="group/bar mb-2 h-3 w-full cursor-pointer touch-none py-1"
          onPointerDown={(e) => {
            e.currentTarget.setPointerCapture(e.pointerId);
            seekFromPointer(e);
          }}
          onPointerMove={(e) => {
            if (e.buttons === 1) seekFromPointer(e);
          }}
        >
          <div className="h-1 w-full overflow-hidden rounded-full bg-white/25 transition-all group-hover/bar:h-1.5">
            <div ref={fillRef} className="h-full w-0 rounded-full bg-amber-400" />
          </div>
        </div>
        <div className="flex items-center gap-3 text-white">
          <button
            type="button"
            onClick={togglePlay}
            aria-label={isPlaying ? 'Pause' : 'Play'}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 transition hover:bg-white/25"
          >
            {isPlaying ? <Pause className="h-4 w-4 fill-white" /> : <Play className="ml-0.5 h-4 w-4 fill-white" />}
          </button>
          <span ref={timeRef} className="font-mono text-[11px] tabular-nums text-white/80">
            0:00 / 0:00
          </span>
          <div className="ml-auto flex items-center gap-1.5">
            <button
              type="button"
              onClick={toggleMute}
              aria-label={isMuted ? 'Turn sound on' : 'Turn sound off'}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 transition hover:bg-white/25"
            >
              {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
            </button>
            <button
              type="button"
              onClick={goFullscreen}
              aria-label="Full screen"
              className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 transition hover:bg-white/25"
            >
              <Maximize className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* End-of-video overlay (e.g. the Contact button) */}
      {hasEnded && endOverlay && (
        <div
          className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/70 p-4 backdrop-blur-md"
          style={{ animation: 'sp-fade 400ms ease both' }}
        >
          {endOverlay({ replay })}
          <button
            type="button"
            onClick={replay}
            className="mt-1 flex items-center gap-1.5 text-xs font-semibold text-white/70 transition hover:text-white"
          >
            <RotateCcw className="h-3.5 w-3.5" /> Watch again
          </button>
        </div>
      )}
    </div>
  );
});
