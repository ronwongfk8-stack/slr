import React, { useState, useRef, useEffect } from 'react';
import { ArrowRight, LayoutGrid } from 'lucide-react';
import { SiteConfig } from '../types';
import { resolveLiveVideoUrl } from '../utils/storage';
import { StagePlayer } from './StagePlayer';

interface HeroSectionProps {
  siteConfig: SiteConfig;
  /** false while the full-screen intro is playing, so the talking head waits for its turn */
  startPlayback?: boolean;
  /** false while the menu or another page is on top: the video pauses */
  active?: boolean;
  /** true once the menu has been unlocked (talking head finished or stopped) */
  menuUnlocked: boolean;
  /** called when the talking head reaches its end */
  onEnded: () => void;
  /** called when the visitor pauses the talking head */
  onUserPause: () => void;
  /** open the pop-up menu (also used by the "Skip" link) */
  onOpenMenu: () => void;
  onSaveSiteConfig?: (updatedConfig: SiteConfig) => void;
}

/* ------------------------------------------------------------------ */
/*  The headline is typed while the talking-head video plays, driven   */
/*  by the video's own clock, so text and video always stay in sync    */
/*  (pause the video = typing pauses).                                 */
/* ------------------------------------------------------------------ */
const TYPE_START = 0.4; // seconds of video when typing starts
const TYPE_END = 6.4; // seconds of video when the headline is complete
const NO_VIDEO_GRACE = 2.5; // if the video cannot start, type on a clock after this many seconds

/**
 * Blinking cursor. It is positioned absolutely against the letter next to it, so it never adds a
 * line-break opportunity (an in-flow cursor would make the text wrap differently while typing).
 */
const CursorBar: React.FC<{ side: 'left' | 'right' }> = ({ side }) => (
  <span
    aria-hidden="true"
    className="absolute bottom-[0.02em] block h-[0.95em] w-[0.07em] rounded-sm bg-amber-400"
    style={{
      ...(side === 'right' ? { left: 'calc(100% + 0.04em)' } : { left: '-0.05em' }),
      animation: 'sp-blink 1s steps(1) infinite',
    }}
  />
);

/**
 * Renders the headline with the first `n` characters visible. The remaining characters stay in the
 * layout (invisible) so lines never re-wrap while typing. Everything from the first "&" is amber.
 */
const renderHeadline = (full: string, n: number, showCursor: boolean) => {
  const k = full.indexOf('&');
  const segs =
    k > 0
      ? [
          { s: 0, e: k, cls: 'text-white' },
          { s: k, e: full.length, cls: 'text-amber-300' },
        ]
      : [{ s: 0, e: full.length, cls: 'text-white' }];

  return segs.map((seg, i) => {
    const typedEnd = Math.max(seg.s, Math.min(seg.e, n));
    const typed = full.slice(seg.s, typedEnd);
    const rest = full.slice(typedEnd, seg.e);
    const cursorHere = showCursor && n >= seg.s && (n < seg.e || i === segs.length - 1);

    let body: React.ReactNode;
    if (!cursorHere) {
      body = (
        <>
          {typed}
          <span className="opacity-0">{rest}</span>
        </>
      );
    } else if (typed.length > 0) {
      // cursor sits on the right edge of the last typed letter
      body = (
        <>
          {typed.slice(0, -1)}
          <span className="relative">
            {typed.slice(-1)}
            <CursorBar side="right" />
          </span>
          <span className="opacity-0">{rest}</span>
        </>
      );
    } else if (rest.length > 0) {
      // nothing typed yet: cursor sits on the left edge of the first (invisible) letter
      body = (
        <>
          <span className="relative">
            <span className="opacity-0">{rest.slice(0, 1)}</span>
            <CursorBar side="left" />
          </span>
          <span className="opacity-0">{rest.slice(1)}</span>
        </>
      );
    } else {
      body = typed;
    }

    return (
      <span key={i} className={seg.cls}>
        {body}
      </span>
    );
  });
};

export const HeroSection: React.FC<HeroSectionProps> = ({
  siteConfig,
  startPlayback = true,
  active = true,
  menuUnlocked,
  onEnded,
  onUserPause,
  onOpenMenu,
  onSaveSiteConfig,
}) => {
  const [liveHeroVideoSrc, setLiveHeroVideoSrc] = useState<string>(() => {
    if (
      siteConfig.heroVideoUrl &&
      !siteConfig.heroVideoUrl.startsWith('indexeddb:') &&
      !siteConfig.heroVideoUrl.includes('commondatastorage')
    ) {
      return siteConfig.heroVideoUrl;
    }
    return '/videos/hero_talking_head.mp4';
  });
  const [typedCount, setTypedCount] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);

  const headline = siteConfig.heroHeadline || '';
  const reduceMotion =
    typeof window !== 'undefined' &&
    !!window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Resolve the live hero video (supports videos uploaded through the CMS)
  useEffect(() => {
    resolveLiveVideoUrl('hero_video', siteConfig.heroVideoUrl).then((url) => {
      if (url && !url.startsWith('indexeddb:')) {
        setLiveHeroVideoSrc(url);
        if (onSaveSiteConfig && siteConfig.heroVideoUrl !== url) {
          onSaveSiteConfig({ ...siteConfig, heroVideoUrl: url });
        }
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [siteConfig.heroVideoUrl]);

  // Typewriter, driven by the video's own clock
  useEffect(() => {
    if (!startPlayback) return;
    const len = headline.length;

    if (reduceMotion) {
      setTypedCount(len);
      return;
    }

    const t0 = performance.now();
    let raf = 0;
    let last = -1;

    const tick = () => {
      const v = videoRef.current;
      const started = !!v && (!v.paused || v.currentTime > 0.5 || v.ended);
      let t: number;
      if (v && started) {
        t = v.currentTime;
      } else {
        const elapsed = (performance.now() - t0) / 1000;
        t = elapsed > NO_VIDEO_GRACE ? elapsed - NO_VIDEO_GRACE : 0;
      }
      const p = Math.min(1, Math.max(0, (t - TYPE_START) / (TYPE_END - TYPE_START)));
      const count = Math.round(p * len);
      if (count !== last) {
        last = count;
        setTypedCount(count);
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [startPlayback, headline, reduceMotion, liveHeroVideoSrc]);

  const typingDone = typedCount >= headline.length && headline.length > 0;
  const showCursor = startPlayback && !typingDone;

  return (
    <section id="home" className="relative flex min-h-[calc(100vh-4rem)] items-center overflow-hidden py-10 sm:py-14">
      {/* Background */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <img
          src="/src/assets/images/hero_sapotlokal_agency_1790504057787.jpg"
          alt=""
          className="h-full w-full scale-105 object-cover object-center opacity-25"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/85 to-slate-950/50" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-amber-500/10 via-transparent to-transparent" />
      </div>

      <div className="relative z-10 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-12 lg:gap-12">
          {/* Headline (typed in step with the video) */}
          <div className="lg:col-span-5">
            <div className="mb-4 flex items-center gap-2 text-xs font-semibold tracking-wide text-amber-400">
              <span className="h-2 w-2 animate-pulse rounded-full bg-amber-400" />
              Corporate Growth Consultancy & Media Production
            </div>

            <h1
              aria-label={headline}
              data-typed={typedCount}
              className="font-display text-4xl font-extrabold leading-[1.12] tracking-tight sm:text-5xl xl:text-[3.4rem]"
            >
              <span aria-hidden="true">{renderHeadline(headline, typedCount, showCursor)}</span>
            </h1>

            <div
              className="mt-6 min-h-[3rem] transition-all duration-700"
              style={{ opacity: typingDone || menuUnlocked ? 1 : 0, transform: typingDone || menuUnlocked ? 'none' : 'translateY(10px)' }}
            >
              {menuUnlocked ? (
                <button
                  type="button"
                  onClick={onOpenMenu}
                  className="inline-flex items-center gap-2 rounded-xl bg-amber-400 px-5 py-3 text-sm font-bold text-slate-950 shadow-lg shadow-amber-400/25 transition hover:scale-[1.03] hover:bg-amber-300"
                >
                  <LayoutGrid className="h-4 w-4" />
                  Explore our work
                  <ArrowRight className="h-4 w-4" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={onOpenMenu}
                  className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-400 transition hover:text-white"
                >
                  Skip to menu
                  <ArrowRight className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>

          {/* Talking head */}
          <div className="lg:col-span-7">
            <div className="relative">
              <div className="pointer-events-none absolute -inset-4 rounded-[2rem] bg-gradient-to-tr from-amber-500/25 via-transparent to-cyan-500/15 blur-2xl" />
              <StagePlayer
                ref={videoRef}
                src={liveHeroVideoSrc}
                poster={siteConfig.heroVideoPoster || undefined}
                ratio={16 / 9}
                autoPlay={startPlayback}
                active={active}
                badge="Meet Sapotlokal"
                onEnded={onEnded}
                onUserPause={onUserPause}
              />
              <p className="mt-3 text-center font-mono text-[11px] uppercase tracking-[0.22em] text-slate-500">
                Introduction · Sapotlokal Resources
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
