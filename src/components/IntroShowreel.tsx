import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Volume2, VolumeX, ArrowRight } from 'lucide-react';

/**
 * Cinematic full-screen intro showreel.
 * Plays once per visit (per browser tab session) and covers 100% of the screen
 * (video is cropped to fill). The visitor can skip or switch sound on at any time.
 *
 * To replace the video: overwrite /public/videos/website_intro.mp4
 * (16:9 works best; on tall phone screens it is cropped to fill the screen).
 * To turn the intro off completely: set INTRO_ENABLED to false.
 * To preview it again: open the site with ?intro at the end of the address,
 * or ?nointro to skip it.
 */
export const INTRO_ENABLED = true;

const SESSION_KEY = 'sapotlokal_intro_seen';
const INTRO_SRC = '/videos/website_intro.mp4';
const FADE_OUT_MS = 800;
const LOAD_TIMEOUT_MS = 9000;

export function shouldShowIntro(): boolean {
  if (!INTRO_ENABLED) return false;
  try {
    const params = new URLSearchParams(window.location.search);
    if (params.has('nointro')) return false;
    if (params.has('intro')) return true;
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return false;
    return sessionStorage.getItem(SESSION_KEY) !== '1';
  } catch {
    return true;
  }
}

interface IntroShowreelProps {
  /** called as soon as the intro starts fading out (the site behind it can start its own show) */
  onEnding?: () => void;
  /** called once the intro has fully faded out and is removed */
  onFinish: () => void;
}

export const IntroShowreel: React.FC<IntroShowreelProps> = ({ onEnding, onFinish }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const finishedRef = useRef(false);

  const [ready, setReady] = useState(false);
  const [muted, setMuted] = useState(true); // set properly once playback starts (sound is tried first)
  const [progress, setProgress] = useState(0);
  const [leaving, setLeaving] = useState(false);

  const finish = useCallback(() => {
    if (finishedRef.current) return;
    finishedRef.current = true;
    try {
      sessionStorage.setItem(SESSION_KEY, '1');
    } catch {
      /* ignore */
    }
    setLeaving(true);
    onEnding?.();
    window.setTimeout(onFinish, FADE_OUT_MS);
  }, [onFinish, onEnding]);

  // Lock page scrolling while the intro is on screen
  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previous;
    };
  }, []);

  // Esc key skips
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') finish();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [finish]);

  // Never trap a visitor: if the video has not started in time, go straight to the site
  useEffect(() => {
    const t = window.setTimeout(() => {
      if (!ready) finish();
    }, LOAD_TIMEOUT_MS);
    return () => window.clearTimeout(t);
  }, [ready, finish]);

  // Start playback: try WITH sound first (some browsers allow it), otherwise fall back to muted
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = false;
    setMuted(false);
    v.play().catch(() => {
      v.muted = true;
      setMuted(true);
      v.play().catch(() => {
        /* if even muted play fails, the load timeout above lets the visitor in */
      });
    });
  }, []);

  const toggleSound = () => {
    const v = videoRef.current;
    if (!v) return;
    const next = !muted;
    v.muted = next;
    setMuted(next);
    if (!next) v.volume = 1;
    v.play().catch(() => undefined);
  };

  return (
    <div
      role="dialog"
      aria-label="Sapotlokal intro showreel"
      className="fixed inset-0 z-[9999] overflow-hidden bg-black text-white"
      style={{
        opacity: leaving ? 0 : 1,
        transform: leaving ? 'scale(1.03)' : 'scale(1)',
        transition: `opacity ${FADE_OUT_MS}ms ease, transform ${FADE_OUT_MS}ms ease`,
        pointerEvents: leaving ? 'none' : 'auto',
      }}
    >
      {/* Full-screen video: fills 100% width and height, cropped to fit */}
      <video
        ref={videoRef}
        src={INTRO_SRC}
        playsInline
        preload="auto"
        onCanPlay={() => setReady(true)}
        onPlaying={() => setReady(true)}
        onTimeUpdate={(e) => {
          const v = e.currentTarget;
          if (v.duration) setProgress(v.currentTime / v.duration);
        }}
        onEnded={finish}
        onError={finish}
        className="absolute inset-0 h-full w-full object-cover"
        style={{ opacity: ready ? 1 : 0, transition: 'opacity 600ms ease' }}
      />

      {/* Soft vignette so the buttons stay readable on any footage */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-black/60 to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-black/60 to-transparent" />

      {/* Loading state */}
      {!ready && (
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="animate-pulse text-xs font-semibold uppercase tracking-[0.4em] text-white/70">
            Sapotlokal
          </span>
        </div>
      )}

      {/* Top bar */}
      <div
        className="absolute inset-x-0 top-0 flex items-center justify-between px-5 sm:px-10"
        style={{ paddingTop: 'max(1.25rem, env(safe-area-inset-top))' }}
      >
        <span className="whitespace-nowrap text-[11px] font-semibold uppercase tracking-[0.3em] text-white/85 sm:text-xs sm:tracking-[0.35em]">
          Sapotlokal<span className="hidden sm:inline"> · Showreel</span>
        </span>
        <button
          type="button"
          onClick={finish}
          autoFocus
          className="group flex items-center gap-2 whitespace-nowrap rounded-full border border-white/30 bg-black/40 px-4 py-2 text-xs font-semibold uppercase tracking-widest text-white backdrop-blur transition hover:bg-white hover:text-black"
        >
          Skip intro
          <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
        </button>
      </div>

      {/* Sound button */}
      <div
        className="absolute bottom-0 left-0 px-5 sm:px-10"
        style={{ paddingBottom: 'max(1.75rem, calc(env(safe-area-inset-bottom) + 1rem))' }}
      >
        <button
          type="button"
          onClick={toggleSound}
          aria-pressed={!muted}
          className="flex items-center gap-2 whitespace-nowrap rounded-full border border-white/30 bg-black/40 px-4 py-2 text-xs font-semibold uppercase tracking-widest text-white backdrop-blur transition hover:bg-white hover:text-black"
        >
          {muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
          {muted ? 'Sound on' : 'Sound off'}
        </button>
      </div>

      {/* Progress line */}
      <div className="absolute inset-x-0 bottom-0 h-[3px] bg-white/15">
        <div
          className="h-full bg-amber-400"
          style={{ width: `${Math.min(100, progress * 100)}%`, transition: 'width 200ms linear' }}
        />
      </div>
    </div>
  );
};
