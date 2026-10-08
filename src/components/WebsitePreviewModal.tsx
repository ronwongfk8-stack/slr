import React, { useState, useEffect } from 'react';
import { X, ExternalLink, Globe, Lock, RefreshCw, Monitor, Tablet, Smartphone, CheckCircle, ShieldCheck, Sparkles } from 'lucide-react';
import { PortfolioItem } from '../types';

interface WebsitePreviewModalProps {
  item: PortfolioItem | null;
  onClose: () => void;
}

export const WebsitePreviewModal: React.FC<WebsitePreviewModalProps> = ({ item, onClose }) => {
  const [viewport, setViewport] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [iframeKey, setIframeKey] = useState<number>(1);
  const [iframeLoading, setIframeLoading] = useState<boolean>(true);
  const [iframeBlocked, setIframeBlocked] = useState<boolean>(false);

  const websiteUrl = item?.websiteUrl || (item?.mediaUrl?.startsWith('http') ? item.mediaUrl : 'https://example.com');
  const cleanDomain = websiteUrl.replace(/^https?:\/\//i, '').replace(/\/$/, '');
  const snapshotImage = item?.imageUrl || item?.posterUrl || '/src/assets/images/showcase_branding_identity_1790504096628.jpg';

  useEffect(() => {
    setIframeLoading(true);
    setIframeBlocked(false);
    setIframeKey((prev) => prev + 1);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [item, onClose]);

  if (!item) return null;

  const handleRefresh = () => {
    setIframeLoading(true);
    setIframeBlocked(false);
    setIframeKey((k) => k + 1);
  };

  const getViewportWidthClass = () => {
    switch (viewport) {
      case 'mobile':
        return 'w-[375px] max-w-full';
      case 'tablet':
        return 'w-[768px] max-w-full';
      case 'desktop':
      default:
        return 'w-full';
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/90 backdrop-blur-md animate-fade-in"
      onClick={onClose}
    >
      {/* Floating close button */}
      <button
        type="button"
        onClick={onClose}
        aria-label="Close Website Preview"
        className="fixed top-4 right-4 z-50 p-2.5 rounded-full bg-slate-900/90 hover:bg-amber-400 text-slate-200 hover:text-slate-950 border border-slate-700 hover:border-amber-400 shadow-2xl transition-all cursor-pointer"
        title="Close Preview (Esc)"
      >
        <X className="w-5 h-5 stroke-[2.5]" />
      </button>

      <div
        className="relative w-full max-w-6xl h-[92vh] max-h-[92vh] bg-slate-950 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden text-slate-100 flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 sm:px-5 sm:py-3 bg-slate-900/95 border-b border-slate-800 flex-shrink-0">
          <div>
            <div className="flex items-center gap-2 text-xs text-emerald-400 font-mono">
              <span className="font-semibold flex items-center gap-1">
                <Globe className="w-3.5 h-3.5" />
                <span>{item.category}</span>
              </span>
              <span>·</span>
              <span className="text-slate-400">{item.client}</span>
              <span>·</span>
              <span className="text-amber-400 font-bold">Interactive Platform</span>
            </div>
            <h3 className="text-sm sm:text-base font-bold font-display text-white mt-0.5 truncate max-w-lg">
              {item.title}
            </h3>
          </div>

          {/* Viewport switchers & Actions */}
          <div className="flex items-center gap-2">
            {/* Viewport Switcher */}
            <div className="hidden sm:flex items-center bg-slate-950 border border-slate-800 rounded-lg p-0.5">
              <button
                type="button"
                onClick={() => setViewport('desktop')}
                title="Desktop View (100%)"
                className={`p-1.5 rounded-md text-xs transition-colors cursor-pointer ${
                  viewport === 'desktop'
                    ? 'bg-amber-400 text-slate-950 font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Monitor className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setViewport('tablet')}
                title="Tablet View (768px)"
                className={`p-1.5 rounded-md text-xs transition-colors cursor-pointer ${
                  viewport === 'tablet'
                    ? 'bg-amber-400 text-slate-950 font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Tablet className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setViewport('mobile')}
                title="Mobile View (375px)"
                className={`p-1.5 rounded-md text-xs transition-colors cursor-pointer ${
                  viewport === 'mobile'
                    ? 'bg-amber-400 text-slate-950 font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Smartphone className="w-4 h-4" />
              </button>
            </div>

            <button
              type="button"
              onClick={handleRefresh}
              title="Refresh Embedded View"
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 border border-slate-800 transition-colors cursor-pointer"
            >
              <RefreshCw className={`w-4 h-4 ${iframeLoading ? 'animate-spin' : ''}`} />
            </button>

            <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>Embedded App</span>
            </span>

            <button
              type="button"
              onClick={onClose}
              aria-label="Close Preview"
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Browser Chrome Header (Traffic lights + URL Bar) */}
        <div className="flex items-center justify-between px-4 py-2 bg-slate-950 border-b border-slate-800/80 select-none flex-shrink-0">
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
            <div className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
          </div>

          <div className="flex-1 max-w-md mx-4">
            <div className="flex items-center justify-between px-3 py-1 bg-slate-900 border border-slate-800 rounded-md text-xs font-mono">
              <div className="flex items-center gap-1.5 truncate">
                <Lock className="w-3 h-3 text-emerald-400 flex-shrink-0" />
                <span className="text-slate-400">https://</span>
                <span className="text-amber-300 font-semibold truncate">{cleanDomain}</span>
              </div>
              <span className="flex items-center gap-1 text-[10px] text-emerald-400 font-sans font-semibold bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Production Live
              </span>
            </div>
          </div>

          <div className="text-[11px] font-mono text-slate-400 hidden sm:block">
            {viewport.toUpperCase()}
          </div>
        </div>

        {/* Main Viewport Content */}
        <div className="relative flex-1 bg-slate-950 overflow-hidden flex items-center justify-center p-2 sm:p-4">
          <div className={`relative h-full flex flex-col bg-slate-900 rounded-xl overflow-hidden border border-slate-800 shadow-2xl transition-all duration-300 ${getViewportWidthClass()}`}>
            
            {/* Live iframe embedding */}
            <iframe
              key={iframeKey}
              src={websiteUrl}
              title={item.title}
              className="w-full h-full border-0 bg-white"
              sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
              onLoad={() => setIframeLoading(false)}
              onError={() => {
                setIframeLoading(false);
                setIframeBlocked(true);
              }}
            />

            {/* Loading state indicator */}
            {iframeLoading && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/80 backdrop-blur-sm z-10">
                <div className="w-10 h-10 border-2 border-amber-400 border-t-transparent rounded-full animate-spin mb-3" />
                <p className="text-xs font-semibold text-white">Connecting to {cleanDomain}...</p>
                <p className="text-[11px] text-slate-400 mt-1">Loading live interactive web application</p>
              </div>
            )}

            {/* Fallback if external domain headers disallow iframe embedding */}
            {iframeBlocked && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950 p-6 text-center z-20">
                <img
                  src={snapshotImage}
                  alt={item.title}
                  className="w-full max-w-lg aspect-video object-cover rounded-xl border border-slate-800 shadow-2xl mb-4"
                />
                <h4 className="text-base font-bold text-white mb-1">
                  Explore {item.title}
                </h4>
                <p className="text-xs text-slate-400 max-w-md mb-2">
                  Engineered and deployed as a high-performance web platform and digital customer portal.
                </p>
                <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-lg border border-emerald-500/20">
                  <span>● Active Operating System</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Bottom Platform Architecture & Deliverables Bar */}
        <div className="p-3.5 sm:px-5 sm:py-3 bg-slate-900/90 border-t border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs flex-shrink-0">
          <div className="max-w-xl">
            <p className="text-slate-300 leading-relaxed text-xs">{item.description}</p>
            <div className="flex flex-wrap gap-1.5 mt-2">
              {item.tags.map((tag, idx) => (
                <span
                  key={idx}
                  className="px-2 py-0.5 bg-slate-800 border border-slate-700/60 text-slate-300 rounded text-[10px] font-mono"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          <div className="flex-shrink-0 bg-slate-950/80 border border-slate-800 px-3.5 py-2 rounded-xl text-right">
            <span className="text-[10px] uppercase tracking-wider text-slate-400 block font-semibold">
              Live Platform Impact
            </span>
            <span className="text-xs font-bold text-emerald-400 font-mono">
              {item.metrics}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
