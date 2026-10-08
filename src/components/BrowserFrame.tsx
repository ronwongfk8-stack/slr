import React, { useState } from 'react';
import { Lock, Globe, Layers, Activity, Sparkles, CheckCircle2, Monitor, Cpu, ShieldCheck } from 'lucide-react';
import { PortfolioItem } from '../types';

interface BrowserFrameProps {
  item: PortfolioItem;
  className?: string;
  onOpenDetails?: () => void;
}

export const BrowserFrame: React.FC<BrowserFrameProps> = ({
  item,
  className = '',
  onOpenDetails,
}) => {
  const displayUrl = item.websiteUrl || (item.mediaUrl?.startsWith('http') ? item.mediaUrl : 'https://example.com');
  const cleanDomain = displayUrl.replace(/^https?:\/\//i, '').replace(/\/$/, '');

  const [activeTab, setActiveTab] = useState<'preview' | 'features' | 'metrics'>('preview');

  const previewImage = item.imageUrl || item.posterUrl || (item.images && item.images.length > 0 ? item.images[0] : '/src/assets/images/showcase_branding_identity_1790504096628.jpg');

  return (
    <div
      onClick={onOpenDetails}
      className={`group relative flex flex-col bg-slate-950 border border-slate-800 rounded-xl overflow-hidden shadow-2xl transition-all hover:border-emerald-500/60 cursor-pointer ${className}`}
    >
      {/* Browser Chrome Header Bar */}
      <div className="flex items-center justify-between px-3.5 py-2.5 bg-slate-900 border-b border-slate-800 select-none">
        {/* Left: Window traffic lights */}
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <div className="w-2.5 h-2.5 rounded-full bg-rose-500/80 group-hover:bg-rose-500 transition-colors" />
          <div className="w-2.5 h-2.5 rounded-full bg-amber-500/80 group-hover:bg-amber-500 transition-colors" />
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/80 group-hover:bg-emerald-500 transition-colors" />
        </div>

        {/* Center: Search & URL Bar */}
        <div className="flex-1 max-w-[320px] sm:max-w-[420px] mx-2">
          <div className="flex items-center justify-between px-2.5 py-1 rounded-md bg-slate-950/90 border border-slate-800 text-[11px] font-mono text-slate-300">
            <div className="flex items-center gap-1.5 truncate">
              <Lock className="w-3 h-3 text-emerald-400 flex-shrink-0" />
              <span className="text-slate-500">https://</span>
              <span className="text-emerald-400 font-semibold truncate">{cleanDomain}</span>
            </div>
            <span className="inline-flex items-center gap-1 text-[9px] text-emerald-300 font-sans font-semibold bg-emerald-500/15 px-1.5 py-0.5 rounded border border-emerald-500/30">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Embedded Web App
            </span>
          </div>
        </div>

        {/* Right: Embedded System Status */}
        <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-mono flex-shrink-0">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          <span className="hidden sm:inline">Online</span>
        </div>
      </div>

      {/* Embedded Application Thumbnail Body */}
      <div 
        className="relative min-h-[290px] sm:min-h-[310px] bg-slate-950 text-slate-100 overflow-hidden flex flex-col font-sans select-none"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Navigation & Tab Bar */}
        <div className="px-3 py-2 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between gap-2 flex-shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-emerald-600 flex items-center justify-center text-white font-bold text-xs shadow-sm">
              <Globe className="w-3.5 h-3.5" />
            </div>
            <div className="truncate max-w-[150px] sm:max-w-[200px]">
              <span className="text-xs font-bold text-white tracking-tight truncate block">
                {item.client || 'Web Platform'}
              </span>
            </div>
          </div>

          {/* Module Selector Tabs */}
          <div className="flex items-center gap-1 bg-slate-950 p-0.5 rounded-lg border border-slate-800">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setActiveTab('preview');
              }}
              className={`px-2 py-1 text-[10px] font-semibold rounded-md transition-all cursor-pointer ${
                activeTab === 'preview'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              UI Preview
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setActiveTab('features');
              }}
              className={`px-2 py-1 text-[10px] font-semibold rounded-md transition-all cursor-pointer ${
                activeTab === 'features'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Architecture
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setActiveTab('metrics');
              }}
              className={`px-2 py-1 text-[10px] font-semibold rounded-md transition-all cursor-pointer ${
                activeTab === 'metrics'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Impact
            </button>
          </div>
        </div>

        {/* Dynamic Views */}
        <div className="flex-1 overflow-hidden relative flex flex-col">
          {activeTab === 'preview' && (
            <div className="relative w-full h-full min-h-[220px] bg-slate-950 flex items-center justify-center overflow-hidden">
              <img
                src={previewImage}
                alt={item.title}
                className="w-full h-full object-cover object-top hover:scale-[1.02] transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-60" />
              <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between text-[10px] text-slate-300 bg-slate-950/80 backdrop-blur-md px-2.5 py-1 rounded-md border border-slate-800">
                <span className="font-mono text-emerald-400 font-semibold truncate">
                  {cleanDomain}
                </span>
                <span className="text-slate-400">Live Production UI</span>
              </div>
            </div>
          )}

          {activeTab === 'features' && (
            <div className="p-3 space-y-2 overflow-y-auto flex-1 bg-slate-900/40">
              <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                <div className="flex items-center gap-1.5 text-[11px] font-bold text-white mb-1">
                  <Cpu className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Next.js App Router & Server Components</span>
                </div>
                <p className="text-[10px] text-slate-400 leading-normal">
                  High-performance SSR, edge caching, and automated SEO schema optimization.
                </p>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                <div className="flex items-center gap-1.5 text-[11px] font-bold text-white mb-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Interactive Client & Lead Portal</span>
                </div>
                <p className="text-[10px] text-slate-400 leading-normal">
                  Automated customer onboarding, real-time analytics, and secure payment workflows.
                </p>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                <div className="flex items-center gap-1.5 text-[11px] font-bold text-white mb-1">
                  <Layers className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Modern Tailwind Design System</span>
                </div>
                <p className="text-[10px] text-slate-400 leading-normal">
                  Fully responsive viewport architecture across desktop, tablet, and mobile devices.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'metrics' && (
            <div className="p-3 space-y-2 overflow-y-auto flex-1 bg-slate-900/40 flex flex-col justify-center">
              <div className="p-3 rounded-lg bg-slate-900 border border-emerald-500/30">
                <div className="text-[10px] uppercase font-bold text-emerald-400 font-mono mb-1">
                  Key Production Benchmark
                </div>
                <div className="text-sm font-bold text-white font-mono">
                  {item.metrics || '+350% Online Conversion Growth'}
                </div>
                <p className="text-[10px] text-slate-400 mt-1">
                  Verified metrics recorded post-launch across digital marketing and client channels.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2 bg-slate-900 rounded-lg border border-slate-800 text-center">
                  <span className="text-[10px] text-slate-400 block">Performance</span>
                  <span className="font-mono text-emerald-400 font-bold">99+ Mobile</span>
                </div>
                <div className="p-2 bg-slate-900 rounded-lg border border-slate-800 text-center">
                  <span className="text-[10px] text-slate-400 block">SLA Uptime</span>
                  <span className="font-mono text-amber-300 font-bold">99.98%</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Bottom Embedded Architecture Ribbon */}
        <div className="px-3 py-1.5 bg-slate-900/90 border-t border-slate-800 flex items-center justify-between text-[9px] font-mono text-slate-400 flex-shrink-0">
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span className="text-emerald-300 font-semibold">Web Platform Engine</span>
          </div>
          <span className="text-slate-400">Next.js · Responsive UI</span>
        </div>
      </div>
    </div>
  );
};
