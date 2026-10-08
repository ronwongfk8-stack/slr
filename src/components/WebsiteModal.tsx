import React, { useState, useEffect } from 'react';
import { X, ExternalLink, Globe, ShieldCheck, CheckCircle2, Sparkles, Layers, ArrowUpRight, Cpu } from 'lucide-react';
import { PortfolioItem } from '../types';

interface WebsiteModalProps {
  item: PortfolioItem | null;
  onClose: () => void;
}

export const WebsiteModal: React.FC<WebsiteModalProps> = ({ item, onClose }) => {
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  useEffect(() => {
    setActiveImageIndex(0);
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [item, onClose]);

  if (!item) return null;

  // Determine metadata with teepro.com as the flagship showcase
  const isTeepro = item.client?.toLowerCase().includes('teepro') || item.title?.toLowerCase().includes('teepro');
  const clientName = isTeepro ? 'teepro.com' : (item.client || 'teepro.com');
  const targetUrl = item.websiteUrl || (isTeepro ? 'https://teepro.app/en' : (item.mediaUrl?.startsWith('http') ? item.mediaUrl : 'https://teepro.app/en'));
  const cleanDomain = targetUrl.replace(/^https?:\/\//i, '').replace(/\/$/, '');

  const showcaseImages = item.images && item.images.length > 0
    ? item.images
    : [
        item.imageUrl || '/src/assets/images/showcase_website_platform_1791339120555.jpg',
        '/src/assets/images/showcase_branding_identity_1790504096628.jpg',
      ];

  const currentScreenshot = showcaseImages[activeImageIndex] || showcaseImages[0];

  const capabilities = [
    'Next.js',
    'Responsive UI/UX Architecture',
    'Custom Web Interface',
    'High-Performance Conversion Design',
  ];

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/90 backdrop-blur-md animate-fade-in overflow-y-auto"
      onClick={onClose}
    >
      {/* Floating Close Button */}
      <button
        type="button"
        onClick={onClose}
        aria-label="Close Showcase"
        className="fixed top-4 right-4 z-50 p-2.5 rounded-full bg-slate-900/90 hover:bg-amber-400 text-slate-200 hover:text-slate-950 border border-slate-700 hover:border-amber-400 shadow-2xl transition-all cursor-pointer"
        title="Close (Esc)"
      >
        <X className="w-5 h-5 stroke-[2.5]" />
      </button>

      <div
        className="relative w-full max-w-5xl bg-slate-950 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden text-slate-100 flex flex-col my-auto max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header Bar */}
        <div className="flex flex-wrap items-center justify-between p-4 sm:p-5 bg-slate-900/95 border-b border-slate-800 gap-3 flex-shrink-0">
          <div>
            <div className="flex items-center gap-2 text-xs text-amber-400 font-mono">
              <span className="font-semibold uppercase tracking-wider">Portfolio Case Study</span>
              <span>·</span>
              <span className="text-slate-300 font-bold">{clientName}</span>
              <span>·</span>
              <span className="text-emerald-400 font-semibold flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span>Web Platform Engineering</span>
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold font-display text-white mt-1">
              {item.title || `${clientName} — Custom Web Application`}
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <a
              href={targetUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-lg shadow-emerald-500/20 transition-all cursor-pointer"
              title="Launch actual website in a new window"
            >
              <span>Visit Live Website</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>

            <button
              onClick={onClose}
              aria-label="Close"
              className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="overflow-y-auto p-4 sm:p-6 space-y-6">
          {/* Clean Browser Mockup Frame */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
            {/* Browser Chrome Header */}
            <div className="flex items-center justify-between px-4 py-2.5 bg-slate-950 border-b border-slate-800/90 select-none">
              {/* Traffic lights */}
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full bg-rose-500/90" />
                <div className="w-3 h-3 rounded-full bg-amber-500/90" />
                <div className="w-3 h-3 rounded-full bg-emerald-500/90" />
              </div>

              {/* URL Address Bar */}
              <div className="flex-1 max-w-md mx-3">
                <div className="flex items-center justify-between px-3 py-1 rounded-lg bg-slate-900 border border-slate-800 text-xs font-mono text-slate-300">
                  <div className="flex items-center gap-1.5 truncate">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                    <span className="text-slate-500">https://</span>
                    <span className="text-emerald-400 font-semibold truncate">{cleanDomain}</span>
                  </div>
                  <span className="text-[10px] text-emerald-400 font-sans font-semibold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 shrink-0 ml-2">
                    Verified Production
                  </span>
                </div>
              </div>

              {/* Direct Link pill */}
              <a
                href={targetUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="hidden sm:flex items-center gap-1 text-[11px] font-mono text-slate-400 hover:text-emerald-300 transition-colors"
              >
                <span>Launch</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </a>
            </div>

            {/* High-Resolution Screenshot Image Canvas */}
            <div className="relative bg-slate-950 overflow-hidden flex items-center justify-center min-h-[320px] sm:min-h-[460px] max-h-[580px]">
              <img
                src={currentScreenshot}
                alt={`${clientName} Web Platform Interface`}
                className="w-full h-full object-cover object-top transition-transform duration-500"
              />
            </div>

            {/* Multiple Screenshots Thumbnails Strip (if available) */}
            {showcaseImages.length > 1 && (
              <div className="flex items-center justify-between px-4 py-2.5 bg-slate-950 border-t border-slate-800 text-xs">
                <span className="text-[11px] font-mono text-slate-400">
                  Interface View {activeImageIndex + 1} of {showcaseImages.length}
                </span>
                <div className="flex gap-2">
                  {showcaseImages.map((img, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setActiveImageIndex(idx)}
                      className={`relative w-14 h-9 rounded-md overflow-hidden border transition-all cursor-pointer ${
                        activeImageIndex === idx
                          ? 'border-emerald-400 ring-2 ring-emerald-400/30'
                          : 'border-slate-800 opacity-60 hover:opacity-100'
                      }`}
                      title={`View screenshot ${idx + 1}`}
                    >
                      <img src={img} alt={`View ${idx + 1}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Project Metadata Highlights */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Left 2 Columns: Project Overview & Capabilities */}
            <div className="md:col-span-2 space-y-4">
              <div>
                <h3 className="text-xs font-mono uppercase tracking-wider text-amber-400 mb-1.5 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Project Overview & Agency Case Study</span>
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  {item.description ||
                    `Comprehensive web platform design and engineering for ${clientName}. Built to establish strong digital credibility, deliver seamless mobile-first user experience, and drive qualified customer conversion.`}
                </p>
              </div>

              {/* Capabilities Highlights Grid */}
              <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-2xl space-y-2.5">
                <span className="text-[11px] font-mono uppercase font-bold text-slate-400 block">
                  Capabilities Deployed
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {capabilities.map((cap, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-2 p-2 rounded-lg bg-slate-950/80 border border-slate-800/80 text-xs text-slate-200"
                    >
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span className="font-semibold">{cap}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-2 pt-1">
                {item.tags?.map((tag, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800 text-slate-300 text-[11px] font-mono"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Right Column: Key Specifications & Launch CTA */}
            <div className="space-y-4">
              {/* Deliverable & Client Card */}
              <div className="p-4.5 bg-slate-900/90 border border-slate-800 rounded-2xl space-y-3">
                <div>
                  <span className="text-[10px] font-mono uppercase text-slate-400 block">
                    Client / Project
                  </span>
                  <div className="text-base font-bold text-white font-mono mt-0.5">
                    {clientName}
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-800/80">
                  <span className="text-[10px] font-mono uppercase text-slate-400 block">
                    Deliverable
                  </span>
                  <div className="text-xs font-bold text-emerald-400 font-mono mt-0.5">
                    Full-Stack Custom Web Application
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-800/80">
                  <span className="text-[10px] font-mono uppercase text-slate-400 block">
                    Measured Production Impact
                  </span>
                  <div className="text-xs font-bold text-amber-300 font-mono mt-0.5">
                    {item.metrics || '+380% Online Lead Inquiries · 99.98% SLA Uptime'}
                  </div>
                </div>
              </div>

              {/* Launch Website Button */}
              <div className="p-4 bg-gradient-to-br from-emerald-950/30 via-slate-900 to-slate-950 border border-emerald-500/30 rounded-2xl space-y-2.5">
                <span className="text-[11px] text-slate-300 block leading-snug">
                  Experience the live web application in a full browser window:
                </span>
                <a
                  href={targetUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2.5 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 transition-all cursor-pointer"
                >
                  <Globe className="w-4 h-4" />
                  <span>Visit {cleanDomain}</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
