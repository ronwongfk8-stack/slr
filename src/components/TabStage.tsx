import React from 'react';
import { LayoutGrid, MessageCircle, ArrowRight } from 'lucide-react';
import { StagePlayer } from './StagePlayer';
import { CRMSection } from './CRMSection';
import { ContactSection } from './ContactSection';
import { TAB_ICONS } from './PetalMenu';
import { EXPERIENCE_TABS, ExperienceTab, TabId } from '../data/experienceTabs';
import { Lead, ServiceCategory, SiteConfig } from '../types';

interface TabStageProps {
  tab: ExperienceTab;
  siteConfig: SiteConfig;
  leads: Lead[];
  onUpdateLeads: (leads: Lead[]) => void;
  onAddLead: (lead: Omit<Lead, 'id' | 'createdAt'>) => void;
  contactService?: ServiceCategory;
  onSelectTab: (id: TabId) => void;
  onOpenMenu: () => void;
  /** go to the WhatsApp form, pre-selecting a service */
  onContact: (service?: ServiceCategory) => void;
  onOpenQR: () => void;
}

/** Button that jumps to the WhatsApp form */
const ContactButton: React.FC<{ onClick: () => void; large?: boolean }> = ({ onClick, large }) => (
  <button
    type="button"
    onClick={onClick}
    className={`flex items-center justify-center gap-2 rounded-xl bg-emerald-500 font-bold text-white shadow-lg shadow-emerald-500/30 transition hover:scale-[1.02] hover:bg-emerald-400 ${
      large ? 'w-full px-5 py-3.5 text-sm sm:text-base' : 'px-4 py-2.5 text-sm'
    }`}
  >
    <MessageCircle className="h-5 w-5" />
    Contact us on WhatsApp
  </button>
);

export const TabStage: React.FC<TabStageProps> = ({
  tab,
  siteConfig,
  leads,
  onUpdateLeads,
  onAddLead,
  contactService,
  onSelectTab,
  onOpenMenu,
  onContact,
  onOpenQR,
}) => {
  const index = EXPERIENCE_TABS.findIndex((t) => t.id === tab.id);
  const nextVideoTab = EXPERIENCE_TABS.slice(index + 1).find((t) => t.kind === 'video');
  const Icon = TAB_ICONS[tab.id];

  return (
    <div className="mx-auto w-full max-w-6xl px-4 pb-16 pt-5 sm:px-6 lg:px-8">
      {/* quick switch bar */}
      <nav aria-label="Sections" className="mb-6 flex items-center gap-2 overflow-x-auto pb-2 [scrollbar-width:none] sm:flex-wrap sm:overflow-visible">
        <button
          type="button"
          onClick={onOpenMenu}
          className="flex flex-shrink-0 items-center gap-1.5 rounded-full border border-amber-400/50 bg-amber-400/10 px-3.5 py-2 text-xs font-bold text-amber-300 transition hover:bg-amber-400 hover:text-slate-950"
        >
          <LayoutGrid className="h-4 w-4" />
          Menu
        </button>
        {EXPERIENCE_TABS.map((t) => {
          const TIcon = TAB_ICONS[t.id];
          const active = t.id === tab.id;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => onSelectTab(t.id)}
              aria-current={active ? 'page' : undefined}
              className={`flex flex-shrink-0 items-center gap-1.5 rounded-full border px-3.5 py-2 text-xs font-semibold transition ${
                active
                  ? 'border-transparent text-white shadow-lg'
                  : 'border-slate-700 bg-slate-900 text-slate-300 hover:border-slate-500 hover:text-white'
              }`}
              style={active ? { background: t.color } : undefined}
            >
              <TIcon className="h-4 w-4" />
              {t.label}
            </button>
          );
        })}
      </nav>

      {/* title */}
      <div key={tab.id} className="sp-anim mb-6 flex items-start gap-4" style={{ animation: 'sp-rise 500ms ease both' }}>
        <span
          className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-tl-2xl rounded-br-2xl rounded-bl-md rounded-tr-md text-white shadow-lg"
          style={{ background: tab.color }}
        >
          <Icon className="h-6 w-6" />
        </span>
        <div className="min-w-0">
          <div className="text-[11px] font-extrabold uppercase tracking-[0.25em]" style={{ color: tab.color }}>
            {tab.letter} · {tab.label}
          </div>
          <h2
            className="font-display text-xl font-extrabold leading-snug text-white sm:text-3xl"
            style={{ textWrap: 'balance' }}
          >
            {tab.title}
          </h2>
        </div>
      </div>

      {/* body */}
      <div className="sp-anim" key={`body-${tab.id}`} style={{ animation: 'sp-rise 600ms ease 100ms both' }}>
        {tab.kind === 'video' && tab.videoSrc && (
          <StagePlayer
            src={tab.videoSrc}
            ratio={tab.ratio}
            autoPlay
            badge={tab.label}
            endOverlay={() => (
              <div className="w-full max-w-sm text-center">
                <p className="font-display text-xl font-extrabold text-white sm:text-2xl">Like what you see?</p>
                <p className="mb-4 mt-1 text-xs text-white/70 sm:text-sm">Tell us about your project. It only takes a minute.</p>
                <ContactButton large onClick={() => onContact(tab.service)} />
                <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
                  {nextVideoTab && (
                    <button
                      type="button"
                      onClick={() => onSelectTab(nextVideoTab.id)}
                      className="flex items-center gap-1.5 rounded-lg border border-white/25 bg-white/10 px-3 py-2 text-xs font-semibold text-white transition hover:bg-white hover:text-black"
                    >
                      Next: {nextVideoTab.label}
                      <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={onOpenMenu}
                    className="flex items-center gap-1.5 rounded-lg border border-white/25 bg-white/10 px-3 py-2 text-xs font-semibold text-white transition hover:bg-white hover:text-black"
                  >
                    <LayoutGrid className="h-3.5 w-3.5" />
                    Menu
                  </button>
                </div>
              </div>
            )}
          />
        )}

        {tab.kind === 'crm' && (
          <div className="space-y-6">
            <CRMSection leads={leads} onUpdateLeads={onUpdateLeads} onAddLead={onAddLead} embedded />
            <div className="flex flex-col items-center justify-between gap-4 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-5 sm:flex-row">
              <div>
                <p className="font-display text-lg font-extrabold text-white">Want a CRM like this for your business?</p>
                <p className="text-xs text-slate-300">We can build it around the way you work.</p>
              </div>
              <ContactButton onClick={() => onContact(tab.service)} />
            </div>
          </div>
        )}

        {tab.kind === 'contact' && (
          <ContactSection
            siteConfig={siteConfig}
            onOpenQR={onOpenQR}
            onLeadCaptured={onAddLead}
            compact
            prefillService={contactService}
          />
        )}
      </div>
    </div>
  );
};
