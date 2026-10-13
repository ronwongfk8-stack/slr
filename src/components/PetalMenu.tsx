import React, { useEffect, useRef } from 'react';
import {
  X,
  Play,
  Smartphone,
  Palette,
  UserRound,
  Clapperboard,
  Presentation,
  MonitorPlay,
  LayoutDashboard,
  MessageCircle,
  ArrowRight,
} from 'lucide-react';
import { EXPERIENCE_TABS, ExperienceTab, TabId } from '../data/experienceTabs';

export const TAB_ICONS: Record<TabId, React.ComponentType<{ className?: string }>> = {
  ugc: Smartphone,
  graphic: Palette,
  presenter: UserRound,
  editing: Clapperboard,
  pointaken: Presentation,
  powerpoint: MonitorPlay,
  crm: LayoutDashboard,
  contact: MessageCircle,
};

interface PetalMenuProps {
  open: boolean;
  activeId: TabId | null;
  onSelect: (id: TabId) => void;
  onClose: () => void;
}

/**
 * One "petal" button, inspired by the four-leaf infographic:
 * a light card with one big rounded corner, a coloured side band with an icon, a large letter,
 * a short label and a descriptive title. Even/odd cards mirror each other like a pinwheel.
 */
const Petal: React.FC<{
  tab: ExperienceTab;
  index: number;
  active: boolean;
  onSelect: (id: TabId) => void;
}> = ({ tab, index, active, onSelect }) => {
  const Icon = TAB_ICONS[tab.id];
  const mirrored = index % 2 === 1;
  const isContact = tab.id === 'contact';

  const radius = mirrored
    ? 'rounded-tl-xl rounded-tr-[2.75rem] rounded-br-xl rounded-bl-[2.75rem]'
    : 'rounded-tl-[2.75rem] rounded-tr-xl rounded-br-[2.75rem] rounded-bl-xl';

  return (
    <button
      type="button"
      onClick={() => onSelect(tab.id)}
      aria-label={`${tab.label}: ${tab.title}`}
      className={`sp-anim group relative flex min-h-[8.5rem] w-full overflow-hidden text-left shadow-xl shadow-black/40 transition duration-300 hover:-translate-y-1.5 hover:shadow-2xl focus:outline-none focus-visible:ring-4 focus-visible:ring-amber-400 sm:min-h-[12rem] ${radius} ${
        isContact ? 'text-white' : 'bg-gradient-to-br from-white to-slate-200 text-slate-800'
      } ${active ? 'ring-4 ring-amber-400' : ''} ${isContact ? 'lg:col-span-2 xl:col-span-1' : ''}`}
      style={{
        animation: `sp-pop 560ms cubic-bezier(.2,.9,.3,1.1) both`,
        animationDelay: `${120 + index * 90}ms`,
        ...(isContact ? { background: `linear-gradient(135deg, ${tab.color}, #0f6b36)` } : {}),
      }}
    >
      {/* coloured side band with icon */}
      <span
        className={`relative flex w-16 flex-shrink-0 flex-col items-center justify-start pt-5 sm:w-[4.5rem] ${mirrored ? 'order-last' : ''}`}
        style={{
          background: isContact
            ? 'rgba(0,0,0,0.22)'
            : `linear-gradient(180deg, ${tab.color}, ${tab.color}cc)`,
        }}
      >
        <Icon className="h-7 w-7 text-white transition-transform duration-300 group-hover:scale-125 group-hover:-rotate-6 sm:h-8 sm:w-8" />
        <span
          aria-hidden="true"
          className="mt-auto mb-3 h-8 w-1.5 rounded-full bg-white/40"
        />
      </span>

      {/* text */}
      <span className="flex min-w-0 flex-1 flex-col justify-between gap-2 p-4 sm:p-5">
        <span>
          <span
            className="block text-[11px] font-extrabold uppercase tracking-[0.2em] sm:text-xs"
            style={{ color: isContact ? 'rgba(255,255,255,0.85)' : tab.color }}
          >
            {tab.label}
          </span>
          <span
            className={`mt-1 block text-[15px] font-bold leading-snug sm:text-base ${isContact ? 'text-white' : 'text-slate-800'}`}
          >
            {tab.title}
          </span>
          {isContact && (
            <span className="mt-1.5 hidden text-xs leading-snug text-white/80 sm:block">{tab.blurb}</span>
          )}
        </span>

        <span className="flex items-center justify-between">
          <span
            className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-white transition-all group-hover:gap-2.5"
            style={{ background: isContact ? 'rgba(0,0,0,0.3)' : tab.color }}
          >
            {tab.kind === 'video' ? <Play className="h-3 w-3 fill-white" /> : <ArrowRight className="h-3 w-3" />}
            {tab.action}
          </span>
        </span>
      </span>

      {/* big letter, like A / B / C / D in the infographic */}
      <span
        aria-hidden="true"
        className={`pointer-events-none absolute -bottom-3 select-none text-[5.5rem] font-black leading-none sm:text-[6.5rem] ${mirrored ? 'left-[4.75rem] sm:left-[5.25rem]' : 'right-3'}`}
        style={{ color: isContact ? 'rgba(255,255,255,0.18)' : `${tab.color}26` }}
      >
        {tab.letter}
      </span>
    </button>
  );
};

export const PetalMenu: React.FC<PetalMenuProps> = ({ open, activeId, onSelect, onClose }) => {
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    closeRef.current?.focus();
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Choose what you would like to see"
      className="sp-anim fixed inset-0 z-[80] overflow-y-auto bg-slate-950/85 backdrop-blur-md"
      style={{ animation: 'sp-fade 350ms ease both' }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="mx-auto flex min-h-full w-full max-w-6xl flex-col justify-center px-4 py-8 sm:px-8 sm:py-12">
        <div className="mb-6 flex items-start justify-between gap-4 sm:mb-9">
          <div>
            <div className="mb-2 text-[11px] font-bold uppercase tracking-[0.3em] text-amber-400">Explore</div>
            <h2
              className="font-display text-3xl font-extrabold leading-tight tracking-tight text-white sm:text-5xl"
              style={{ textWrap: 'balance' }}
            >
              What would you like to see?
            </h2>
          </div>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            aria-label="Close menu"
            className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full border border-white/20 bg-white/5 text-white transition hover:bg-white hover:text-black"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3 xl:grid-cols-4">
          {EXPERIENCE_TABS.map((tab, i) => (
            <Petal key={tab.id} tab={tab} index={i} active={activeId === tab.id} onSelect={onSelect} />
          ))}
        </div>
      </div>
    </div>
  );
};
