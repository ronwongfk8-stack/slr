import React from 'react';
import { LayoutGrid, MessageCircle } from 'lucide-react';

interface StageHeaderProps {
  /** the menu button appears once the talking-head video has finished or been stopped */
  menuUnlocked: boolean;
  onHome: () => void;
  onOpenMenu: () => void;
  onContact: () => void;
}

export const StageHeader: React.FC<StageHeaderProps> = ({ menuUnlocked, onHome, onOpenMenu, onContact }) => (
  <header className="sticky top-0 z-40 border-b border-white/5 bg-slate-950/75 backdrop-blur-md">
    <div className="mx-auto flex h-14 w-full max-w-7xl items-center justify-between px-4 sm:h-16 sm:px-6 lg:px-8">
      <button
        type="button"
        onClick={onHome}
        className="font-display text-base font-extrabold tracking-tight text-white transition hover:text-amber-300 sm:text-xl"
        aria-label="Sapotlokal Resources home"
      >
        Sapotlokal <span className="text-amber-400">Resources</span>
      </button>

      <div className="flex items-center gap-2">
        {menuUnlocked && (
          <button
            type="button"
            onClick={onOpenMenu}
            className="sp-anim flex items-center gap-1.5 rounded-full border border-amber-400/50 bg-amber-400/10 px-3.5 py-2 text-xs font-bold text-amber-300 transition hover:bg-amber-400 hover:text-slate-950 sm:text-sm"
            style={{ animation: 'sp-pop 500ms ease both' }}
          >
            <LayoutGrid className="h-4 w-4" />
            Menu
          </button>
        )}
        <button
          type="button"
          onClick={onContact}
          className="flex items-center gap-1.5 rounded-full bg-emerald-500 px-3.5 py-2 text-xs font-bold text-white shadow-lg shadow-emerald-500/25 transition hover:bg-emerald-400 sm:text-sm"
        >
          <MessageCircle className="h-4 w-4" />
          Contact
        </button>
      </div>
    </div>
  </header>
);
