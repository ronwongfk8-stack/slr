import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Volume2, VolumeX, ArrowRight, Play } from 'lucide-react';

/**
 * Cinematic full-screen intro showreel.
 * Plays once per visit (per browser tab session) and covers 100% of the screen
 * (video is cropped to fill).
 *
 * SOUND: the intro always tries to start WITH sound automatically. Browsers (Chrome, Safari, Edge,
 * Firefox) refuse to play sound before the visitor has clicked or tapped on the page, and no website
 * can override that. So when a browser refuses, the visitor sees a clean "Enter" screen first; one
 * click on it starts the intro with sound (and the talking head after it also plays with sound).
 * When the browser allows it, there is no Enter screen and the intro simply starts with sound.
 *
 * END: when the video finishes it holds on its last frame for END_HOLD_MS so the closing text
 * ("Ideas into visual experiences / Explore my work") can be read before the intro fades out.
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
const END_HOLD_MS = 1600; // how long the last frame stays on screen after the video ends
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
  const holdTimerRef = useRef<number | undefined>(undefined);

  const [ready, setReady] = useState(false);
  const [muted, setMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [leaving, setLeaving] = useState(false);
  const [gate, setGate] = useState(false); // browser needs one click before it allows sound
  const [holding, setHolding] = useState(false); // video ended, last frame is being held

  const finish = useCallback(() => {
    if (finishedRef.current) return;
    finishedRef.current = true;
    window.clearTimeout(holdTimerRef.current);
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

  // Clear the end-of-video hold timer if the component goes away
  useEffect(() => () => window.clearTimeout(holdTimerRef.current), []);

  // Never trap a visitor on a broken connection: if the video has not started in time, go to the site.
  // (Not while the Enter screen is waiting for the visitor's click.)
  useEffect(() => {
    if (gate) return;
    const t = window.setTimeout(() => {
      if (!ready) finish();
    }, LOAD_TIMEOUT_MS);
    return () => window.clearTimeout(t);
  }, [ready, gate, finish]);

  // Start the intro WITH sound. If the browser refuses (no click yet), show the Enter screen.
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = false;
    const p = v.play();
    if (p && typeof p.catch === 'function') {
      p.catch((err: unknown) => {
        if (err && (err as { name?: string }).name === 'NotAllowedError') {
          v.pause();
          v.currentTime = 0;
          setGate(true);
        }
      });
    }
  }, []);

  // The visitor clicked the Enter screen: now sound is allowed
  const enter = () => {
    const v = videoRef.current;
    setGate(false);
    if (!v) return;
    v.currentTime = 0;
    v.muted = false;
    setMuted(false);
    v.play().catch(() => {
      // extremely rare: still refused, fall back to silent playback so the intro never gets stuck
      v.muted = true;
      setMuted(true);
      v.play().catch(() => undefined);
    });
  };

  const toggleSound = () => {
    const v = videoRef.current;
    if (!v) return;
    const next = !muted;
    v.muted = next;
    setMuted(next);
    if (!next) v.volume = 1;
    v.play().catch(() => undefined);
  };

  const handleEnded = () => {
    // hold on the last frame so the closing text can be read, then fade out
    setHolding(true);
    holdTimerRef.current = window.setTimeout(finish, END_HOLD_MS);
  };

  const chromeStyle: React.CSSProperties = {
    opacity: holding ? 0 : 1,
    transition: 'opacity 450ms ease',
    pointerEvents: holding ? 'none' : 'auto',
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
        onEnded={handleEnded}
        onError={finish}
        className="absolute inset-0 h-full w-full object-cover"
        style={{ opacity: gate ? 0.3 : ready ? 1 : 0, transition: 'opacity 600ms ease' }}
      />

      {/* Soft vignette so the buttons stay readable (hidden while the last frame is held) */}
      <div style={chromeStyle}>
        <div className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-black/60 to-transparent" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-black/60 to-transparent" />
      </div>

      {/* Loading state */}
      {!ready && !gate && (
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="animate-pulse text-xs font-semibold uppercase tracking-[0.4em] text-white/70">
            Sapotlokal
          </span>
        </div>
      )}

      {/* Enter screen: only shown when the browser blocks sound until the first click */}
      {gate && (
        <button
          type="button"
          onClick={enter}
          autoFocus
          aria-label="Enter the site (starts with sound)"
          className="sp-anim absolute inset-0 z-10 flex cursor-pointer flex-col items-center justify-center gap-7 focus:outline-none"
          style={{ animation: 'sp-fade 500ms ease both' }}
        >
          <span className="text-xs font-semibold uppercase tracking-[0.45em] text-white/80 sm:text-sm">
            Sapotlokal Resources
          </span>
          <span className="relative flex h-24 w-24 items-center justify-center sm:h-28 sm:w-28">
            <span className="absolute inset-0 animate-ping rounded-full border border-amber-400/60" />
            <span className="absolute inset-0 rounded-full border border-white/30" />
            <span className="flex h-16 w-16 items-center justify-center rounded-full bg-amber-400 text-slate-950 shadow-xl shadow-amber-400/30 sm:h-20 sm:w-20">
              <Play className="ml-1 h-7 w-7 fill-slate-950 sm:h-8 sm:w-8" />
            </span>
          </span>
          <span className="text-center">
            <span className="block text-sm font-bold uppercase tracking-[0.3em] text-white sm:text-base">Enter</span>
            <span className="mt-2 block text-[11px] uppercase tracking-[0.25em] text-white/55">Best with sound on</span>
          </span>
        </button>
      )}

      {/* Top bar */}
      <div
        className="absolute inset-x-0 top-0 z-20 flex items-center justify-between px-5 sm:px-10"
        style={{ paddingTop: 'max(1.25rem, env(safe-area-inset-top))', ...chromeStyle }}
      >
        <span className="whitespace-nowrap text-[11px] font-semibold uppercase tracking-[0.3em] text-white/85 sm:text-xs sm:tracking-[0.35em]">
          Sapotlokal<span className="hidden sm:inline"> · Showreel</span>
        </span>
        <button
          type="button"
          onClick={finish}
          className="group flex items-center gap-2 whitespace-nowrap rounded-full border border-white/30 bg-black/40 px-4 py-2 text-xs font-semibold uppercase tracking-widest text-white backdrop-blur transition hover:bg-white hover:text-black"
        >
          Skip intro
          <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
        </button>
      </div>

      {/* Small mute switch (icon only; sound is already on) */}
      {!gate && ready && (
        <div
          className="absolute bottom-0 left-0 z-20 px-5 sm:px-10"
          style={{ paddingBottom: 'max(1.75rem, calc(env(safe-area-inset-bottom) + 1rem))', ...chromeStyle }}
        >
          <button
            type="button"
            onClick={toggleSound}
            aria-pressed={!muted}
            aria-label={muted ? 'Turn sound on' : 'Turn sound off'}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-white/30 bg-black/40 text-white backdrop-blur transition hover:bg-white hover:text-black"
          >
            {muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
          </button>
        </div>
      )}

      {/* Progress line */}
      <div className="absolute inset-x-0 bottom-0 h-[3px] bg-white/15" style={chromeStyle}>
        <div
          className="h-full bg-amber-400"
          style={{ width: `${Math.min(100, progress * 100)}%`, transition: 'width 200ms linear' }}
        />
      </div>
    </div>
  );
};
