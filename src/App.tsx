import React, { useState, useEffect } from 'react';
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
import { SiteConfig, PortfolioItem, Lead, ClientReport } from './types';

import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { ServicesSection } from './components/ServicesSection';
import { PortfolioSection } from './components/PortfolioSection';
import { PricingSection } from './components/PricingSection';
import { FAQSection } from './components/FAQSection';
import { CRMSection } from './components/CRMSection';
import { AboutSection } from './components/AboutSection';
import { ContactSection } from './components/ContactSection';
import { Footer } from './components/Footer';

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

  const handleExplorePortfolio = () => {
    const el = document.getElementById('portfolio');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleOpenHeroVideo = () => {
    const heroPoster = siteConfig.heroVideoPoster?.trim() || undefined;
    const heroVideoUrl = siteConfig.heroVideoUrl && !siteConfig.heroVideoUrl.includes('commondatastorage')
      ? siteConfig.heroVideoUrl
      : '/videos/hero_overview.mp4';
    const heroItem: PortfolioItem = {
      id: 'hero-overview-video',
      title: siteConfig.heroVideoTitle || 'Sapotlokal Overview & Strategic Advisory Showreel',
      client: 'Sapotlokal Resources',
      category: 'Video Editing',
      description: siteConfig.heroSubheadline || 'Corporate consultancy & media production explanatory overview.',
      mediaType: 'video',
      videoUrl: heroVideoUrl,
      imageUrl: heroPoster,
      mediaUrl: heroVideoUrl,
      posterUrl: heroPoster,
      metrics: siteConfig.heroVideoBadge || 'Agency Introductory Overview (1:30)',
      tags: ['Agency Overview', 'Corporate Production', 'Consultancy'],
      aspectRatio: '16:9',
    };
    setActiveVideoItem(heroItem);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-amber-400 selection:text-slate-950">
      {/* Top Navigation */}
      <Navbar
        siteConfig={siteConfig}
        onOpenQR={() => setIsQRModalOpen(true)}
      />

      {/* Main Content Sections */}
      <main className="flex-1">
        <HeroSection
          siteConfig={siteConfig}
          onOpenQR={() => setIsQRModalOpen(true)}
          onExplorePortfolio={handleExplorePortfolio}
          onOpenHeroVideoModal={handleOpenHeroVideo}
          onSaveSiteConfig={handleSaveConfig}
        />

        <ServicesSection
          siteConfig={siteConfig}
          onSaveSiteConfig={handleSaveConfig}
        />

        <PortfolioSection
          items={portfolioItems}
          onSelectVideo={(item) => setActiveVideoItem(item)}
          onOpenCMS={handleOpenCMS}
        />

        <PricingSection
          whatsappNumber={siteConfig.whatsappNumber}
          onSelectPlan={(plan) => {
            setSelectedPlanForBrief(plan);
            showToast(`Custom quote requested for ${plan}. Review pre-filled brief below!`);
          }}
        />

        <FAQSection />

        <CRMSection
          leads={leads}
          onUpdateLeads={handleUpdateLeads}
          onAddLead={handleAddLead}
        />

        <AboutSection siteConfig={siteConfig} />

        <ContactSection
          siteConfig={siteConfig}
          onOpenQR={() => setIsQRModalOpen(true)}
          onLeadCaptured={handleAddLead}
          selectedPlan={selectedPlanForBrief}
        />
      </main>

      {/* Footer */}
      <Footer
        siteConfig={siteConfig}
        onOpenQR={() => setIsQRModalOpen(true)}
        onOpenCMS={handleOpenCMS}
        isFounderAuthenticated={isFounderAuthenticated}
        onFounderLogout={handleFounderLogout}
      />

      {/* Persistent Floating Utility Hub */}
      <div className="fixed bottom-5 right-5 z-40 flex flex-col items-end gap-2.5">
        {/* Toast popup */}
        {toastMessage && (
          <div className="bg-slate-900 border border-amber-400/50 text-amber-300 text-xs px-4 py-2.5 rounded-xl shadow-2xl animate-fade-in flex items-center gap-2 backdrop-blur-md">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>{toastMessage}</span>
          </div>
        )}

        <div className="flex items-center gap-2 bg-slate-950/90 border border-slate-800 backdrop-blur-md p-1.5 rounded-2xl shadow-2xl">
          {/* Quick QR code button */}
          <button
            onClick={() => setIsQRModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-200 hover:text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-all cursor-pointer"
            title="Open QR Code Generator"
          >
            <QrCode className="w-4 h-4 text-amber-400" />
            <span className="hidden sm:inline">QR Contact</span>
          </button>

          {/* Subtle concealed settings/gear icon trigger for CMS */}
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
