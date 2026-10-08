import React from 'react';
import { QrCode, ArrowUp, MapPin, Mail, MessageSquare, Settings } from 'lucide-react';
import { SiteConfig } from '../types';

interface FooterProps {
  siteConfig: SiteConfig;
  onOpenQR: () => void;
  onOpenCMS: () => void;
  isFounderAuthenticated?: boolean;
  onFounderLogout?: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  siteConfig,
  onOpenQR,
  onOpenCMS,
  isFounderAuthenticated = false,
  onFounderLogout,
}) => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-slate-950 border-t border-slate-900 pt-16 pb-12 text-slate-400 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-slate-900">
          {/* Brand & Address Column */}
          <div className="md:col-span-2 space-y-4">
            <a
              href="#home"
              className="text-xl font-extrabold font-display text-white tracking-tight hover:text-amber-400 transition-colors inline-block"
            >
              {siteConfig.companyName}
            </a>
            <p className="text-slate-400 text-xs max-w-sm leading-relaxed">
              Specialist corporate consultancy & creative media production in Balakong, Cheras. Empowering businesses through streamlined management, viral video editing, UGC campaigns, and data-driven branding.
            </p>

            <div className="space-y-1.5 pt-2 text-slate-300">
              <div className="flex items-start gap-2">
                <MapPin className="w-3.5 h-3.5 text-amber-400 flex-shrink-0 mt-0.5" />
                <span>{siteConfig.address}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                <a
                  href="mailto:sapotlokal.co@gmail.com"
                  className="font-mono text-slate-300 hover:text-amber-400 transition-colors"
                >
                  sapotlokal.co@gmail.com
                </a>
              </div>
            </div>
          </div>

          {/* Core Services Links */}
          <div className="space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-white block">
              Core Capabilities
            </span>
            <ul className="space-y-2">
              <li>
                <a href="#solutions" className="hover:text-amber-400 transition-colors">
                  Video Editing & Post
                </a>
              </li>
              <li>
                <a href="#solutions" className="hover:text-amber-400 transition-colors">
                  Social Content Systems
                </a>
              </li>
              <li>
                <a href="#solutions" className="hover:text-amber-400 transition-colors">
                  Graphic Design & Identity
                </a>
              </li>
              <li>
                <a href="#solutions" className="hover:text-amber-400 transition-colors">
                  UGC Creator Campaigns
                </a>
              </li>
              <li>
                <a href="#solutions" className="hover:text-amber-400 transition-colors">
                  Corporate Consultancy
                </a>
              </li>
            </ul>
          </div>

          {/* Quick Access & Tools */}
          <div className="space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-white block">
              Internal Tools & Actions
            </span>
            <ul className="space-y-2">
              <li>
                <button
                  onClick={onOpenQR}
                  className="flex items-center gap-1.5 text-slate-300 hover:text-amber-400 transition-colors"
                >
                  <QrCode className="w-3.5 h-3.5 text-amber-400" />
                  <span>Interactive QR Generator</span>
                </button>
              </li>
              <li>
                <a
                  href="#contact"
                  className="hover:text-amber-400 transition-colors"
                >
                  Direct Inquiry & Project Brief
                </a>
              </li>
              <li>
                <a
                  href="#crm"
                  className="hover:text-amber-400 transition-colors"
                >
                  CRM Leads Pipeline
                </a>
              </li>
              <li>
                <a
                  href="mailto:sapotlokal.co@gmail.com"
                  className="inline-flex items-center gap-1.5 text-amber-400 hover:text-amber-300 transition-colors font-medium"
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span>sapotlokal.co@gmail.com</span>
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar with discrete low-profile CMS access */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-slate-500">
          <div className="flex items-center gap-2">
            <span>© {new Date().getFullYear()} {siteConfig.companyName}. All rights reserved.</span>
            {/* Discrete low-profile settings link */}
            <button
              onClick={onOpenCMS}
              className="text-slate-600 hover:text-slate-400 transition-colors p-1 rounded hover:bg-slate-900 cursor-pointer"
              title="System Configuration"
              aria-label="System Settings"
            >
              <Settings className={`w-3 h-3 ${isFounderAuthenticated ? 'text-emerald-500' : 'text-slate-600'}`} />
            </button>
            {isFounderAuthenticated && onFounderLogout && (
              <button
                onClick={onFounderLogout}
                className="text-[10px] text-slate-500 hover:text-rose-400 transition-colors ml-1 cursor-pointer"
                title="Lock CMS session"
              >
                (Lock Session)
              </button>
            )}
          </div>

          <button
            onClick={scrollToTop}
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <span>Back to top</span>
            <ArrowUp className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </footer>
  );
};
