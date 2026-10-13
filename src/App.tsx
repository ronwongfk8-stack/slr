import React, { useState, useEffect, useRef } from 'react';
import { 
  getSavedSiteConfig, 
  saveSiteConfig, 
  getSavedPortfolio, 
  savePortfolio, 
  getSavedLeads, 
  saveLeads, 
  getSavedReports, 
  resetAllToDefault,
  hydrateSiteConfigWithMedia,
  hydratePortfolioWithMedia,
  isFilteredOutItem
} from './utils/storage';
import { SiteConfig, PortfolioItem, Lead, ClientReport, ServiceCategory } from './types';

import { StageHeader } from './components/StageHeader';
import { HeroSection } from './components/HeroSection';
import { IntroShowreel, shouldShowIntro } from './components/IntroShowreel';
import { PetalMenu } from './components/PetalMenu';
import { TabStage } from './components/TabStage';
import { TabId, getTab } from './data/experienceTabs';

import { QRCodeModal } from './components/QRCodeModal';
import { VideoPlayerModal } from './components/VideoPlayerModal';
import { CMSModal } from './components/CMSModal';
import { FounderAuthModal } from './components/FounderAuthModal';

import { QrCode, Settings } from 'lucide-react';

export default function App() {
  const [siteConfig, setSiteConfig] = useState<SiteConfig>(getSavedSiteConfig());
  const [portfolioItems, setPortfolioItems] = useState<PortfolioItem[]>(() => 
    getSavedPortfolio().filter((p) => !isFilteredOutItem(p))
  );
  // Cinematic full-screen intro showreel (plays once per visit)
  const [showIntro, setShowIntro] = useState<boolean>(() => shouldShowIntro());
  const [introEnding, setIntroEnding] = useState(false);
  // Stage flow: intro -> talking head -> pop-up menu -> selected content
  const [activeTab, setActiveTab] = useState<TabId | null>(null);
  const [menuUnlocked, setMenuUnlocked] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [contactService, setContactService] = useState<ServiceCategory | undefined>(undefined);
  const autoPoppedRef = useRef(false);
  const [leads, setLeads] = useState<Lead[]>(getSavedLeads());
  const [reports, setReports] = useState<ClientReport[]>(getSavedReports());

  // Founder Auth State
  const [isFounderAuthenticated, setIsFounderAuthenticated] = useState<boolean>(() => {
    try {
      return sessionStorage.getItem('sapotlokal_founder_auth') === 'true';
    } catch {
      return false;
    }
  });
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Modals state
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);
  const [isCMSModalOpen, setIsCMSModalOpen] = useState(false);
  const [activeVideoItem, setActiveVideoItem] = useState<PortfolioItem | null>(null);

  // Toast notification
  const [toastMessage, setToastMessage] = useState<string>('');
  // Selected pricing tier for brief submission
  const [selectedPlanForBrief, setSelectedPlanForBrief] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500);
  };

  // Hydrate persistent media blobs (uploaded hero video & portfolio videos) from IndexedDB on startup
  useEffect(() => {
    hydrateSiteConfigWithMedia(siteConfig).then((hydratedConfig) => {
      setSiteConfig(hydratedConfig);
    });

    hydratePortfolioWithMedia(portfolioItems).then((hydratedItems) => {
      const cleanList = hydratedItems.filter((p) => !isFilteredOutItem(p));
      setPortfolioItems(cleanList);
    });
  }, []);

  // Protected CMS Request
  const handleOpenCMS = () => {
    if (isFounderAuthenticated) {
      setIsCMSModalOpen(true);
    } else {
      setIsAuthModalOpen(true);
    }
  };

  const handleFounderAuthenticated = () => {
    setIsFounderAuthenticated(true);
    try {
      sessionStorage.setItem('sapotlokal_founder_auth', 'true');
    } catch {}
    setIsAuthModalOpen(false);
    setIsCMSModalOpen(true);
    showToast('Founder verified. CMS Unlocked!');
  };

  const handleFounderLogout = () => {
    setIsFounderAuthenticated(false);
    try {
      sessionStorage.removeItem('sapotlokal_founder_auth');
    } catch {}
    setIsCMSModalOpen(false);
    showToast('Founder CMS session locked.');
  };

  // Handlers for CMS
  const handleSaveConfig = (newConfig: SiteConfig) => {
    setSiteConfig(newConfig);
    saveSiteConfig(newConfig);
    showToast('Website content updated successfully!');
  };

  const handleSavePortfolio = (newItems: PortfolioItem[]) => {
    setPortfolioItems(newItems);
    savePortfolio(newItems);
    showToast('Portfolio items and media updated!');
  };

  const handleUpdateLeads = (newLeads: Lead[]) => {
    setLeads(newLeads);
    saveLeads(newLeads);
  };

  const handleAddLead = (newLeadData: Omit<Lead, 'id' | 'createdAt'>) => {
    const newLead: Lead = {
      ...newLeadData,
      id: `lead-${Date.now()}`,
      createdAt: new Date().toISOString().split('T')[0],
    };
    const updated = [newLead, ...leads];
    setLeads(updated);
    saveLeads(updated);
    showToast(`New inquiry from ${newLead.name} logged into CRM!`);
  };

  const handleResetDefaults = () => {
    const defaults = resetAllToDefault();
    setSiteConfig(defaults.config);
    setPortfolioItems(defaults.portfolio);
    setLeads(defaults.leads);
    setReports(defaults.reports);
    showToast('Restored all official Sapotlokal defaults.');
  };

  const scrollTop = () => window.scrollTo({ top: 0, behavior: 'auto' });

  // Talking head finished -> pop up the menu
  const handleHeroEnded = () => {
    autoPoppedRef.current = true;
    setMenuUnlocked(true);
    setMenuOpen(true);
  };

  // Visitor stopped the talking head -> pop up the menu (the first time)
  const handleHeroUserPause = () => {
    setMenuUnlocked(true);
    if (!autoPoppedRef.current) {
      autoPoppedRef.current = true;
      setMenuOpen(true);
    }
  };

  const openMenu = () => {
    setMenuUnlocked(true);
    setMenuOpen(true);
  };

  const selectTab = (id: TabId) => {
    setMenuOpen(false);
    setContactService(undefined);
    setActiveTab(id);
    scrollTop();
  };

  const goContact = (service?: ServiceCategory) => {
    setMenuOpen(false);
    setContactService(service);
    setActiveTab('contact');
    scrollTop();
  };

  const goHome = () => {
    setMenuOpen(false);
    setActiveTab(null);
    scrollTop();
  };

  return (
    <div className="min-h-screen overflow-x-clip bg-slate-950 text-slate-100 flex flex-col selection:bg-amber-400 selection:text-slate-950">
      {/* Cinematic intro: covers the whole screen when the site first opens */}
      {showIntro && (
        <IntroShowreel onEnding={() => setIntroEnding(true)} onFinish={() => setShowIntro(false)} />
      )}

      <StageHeader
        menuUnlocked={menuUnlocked}
        onHome={goHome}
        onOpenMenu={openMenu}
        onContact={() => goContact()}
      />

      <main className="flex-1">
        {/* Talking head (stays mounted so it keeps its place when the visitor goes back) */}
        <div className={activeTab ? 'hidden' : ''}>
          <HeroSection
            siteConfig={siteConfig}
            startPlayback={!showIntro || introEnding}
            active={activeTab === null && !menuOpen}
            menuUnlocked={menuUnlocked}
            onEnded={handleHeroEnded}
            onUserPause={handleHeroUserPause}
            onOpenMenu={openMenu}
            onSaveSiteConfig={handleSaveConfig}
          />
        </div>

        {/* Selected content: video, CRM demo or WhatsApp form */}
        {activeTab && (
          <TabStage
            tab={getTab(activeTab)}
            siteConfig={siteConfig}
            leads={leads}
            onUpdateLeads={handleUpdateLeads}
            onAddLead={handleAddLead}
            contactService={contactService}
            onSelectTab={selectTab}
            onOpenMenu={openMenu}
            onContact={goContact}
            onOpenQR={() => setIsQRModalOpen(true)}
          />
        )}
      </main>

      {/* Pop-up menu of the seven options */}
      <PetalMenu open={menuOpen} activeId={activeTab} onSelect={selectTab} onClose={() => setMenuOpen(false)} />

      {/* Persistent Floating Utility Hub */}
      <div className="fixed bottom-5 right-5 z-[60] flex flex-col items-end gap-2.5">
        {toastMessage && (
          <div className="bg-slate-900 border border-amber-400/50 text-amber-300 text-xs px-4 py-2.5 rounded-xl shadow-2xl animate-fade-in flex items-center gap-2 backdrop-blur-md">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>{toastMessage}</span>
          </div>
        )}

        <div className="flex items-center gap-2 bg-slate-950/90 border border-slate-800 backdrop-blur-md p-1.5 rounded-2xl shadow-2xl">
          <button
            onClick={() => setIsQRModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-200 hover:text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-all cursor-pointer"
            title="Open QR Code Generator"
          >
            <QrCode className="w-4 h-4 text-amber-400" />
            <span className="hidden sm:inline">QR Contact</span>
          </button>

          <button
            onClick={handleOpenCMS}
            className="p-2 rounded-xl text-slate-500 hover:text-slate-300 hover:bg-slate-900 transition-colors cursor-pointer"
            aria-label="System Settings"
            title={isFounderAuthenticated ? 'System Settings (Unlocked)' : 'Settings'}
          >
            <Settings className={`w-3.5 h-3.5 ${isFounderAuthenticated ? 'text-emerald-400' : 'text-slate-500'}`} />
          </button>
        </div>
      </div>

      {/* Interactive Modals */}
      <FounderAuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onAuthenticated={handleFounderAuthenticated}
      />

      <QRCodeModal
        isOpen={isQRModalOpen}
        onClose={() => setIsQRModalOpen(false)}
        siteConfig={siteConfig}
      />

      <VideoPlayerModal
        item={activeVideoItem}
        onClose={() => setActiveVideoItem(null)}
      />

      <CMSModal
        isOpen={isCMSModalOpen}
        onClose={() => setIsCMSModalOpen(false)}
        siteConfig={siteConfig}
        onSaveSiteConfig={handleSaveConfig}
        portfolioItems={portfolioItems}
        onSavePortfolio={handleSavePortfolio}
        onResetAll={handleResetDefaults}
        onLogout={handleFounderLogout}
      />
    </div>
  );
}
