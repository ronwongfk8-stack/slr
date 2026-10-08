import React, { useState } from 'react';
import { QrCode, Menu, X, Mail, ArrowUpRight } from 'lucide-react';
import { SiteConfig } from '../types';

interface NavbarProps {
  siteConfig: SiteConfig;
  onOpenQR: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  siteConfig,
  onOpenQR,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-slate-950/85 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Zone 1: Single element brand wordmark */}
        <a
          href="#home"
          className="text-lg sm:text-xl font-extrabold tracking-tight font-display text-white hover:text-amber-400 transition-colors whitespace-nowrap"
        >
          {siteConfig.companyName}
        </a>

        {/* Zone 2: Clean public navigation links */}
        <nav className="hidden lg:flex items-center gap-6 xl:gap-7 text-sm font-medium text-slate-300">
          <a
            href="#solutions"
            className="hover:text-amber-400 transition-colors py-1"
          >
            Solutions
          </a>
          <a
            href="#portfolio"
            className="hover:text-amber-400 transition-colors py-1"
          >
            Portfolio
          </a>
          <a
            href="#pricing"
            className="hover:text-amber-400 transition-colors py-1"
          >
            Pricing
          </a>
          <a
            href="#faq"
            className="hover:text-amber-400 transition-colors py-1"
          >
            FAQ
          </a>
          <a
            href="#crm"
            className="hover:text-amber-400 transition-colors py-1"
          >
            CRM Leads
          </a>
          <a
            href="#about"
            className="hover:text-amber-400 transition-colors py-1"
          >
            About
          </a>
          <a
            href="#contact"
            className="hover:text-amber-400 transition-colors py-1"
          >
            Contact
          </a>
        </nav>

        {/* Zone 3: Clean public action buttons */}
        <div className="hidden sm:flex items-center gap-3">
          <button
            onClick={onOpenQR}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-200 bg-slate-900 hover:bg-slate-800 border border-slate-700/80 rounded-lg transition-colors whitespace-nowrap cursor-pointer"
            title="Scan Contact QR Code & vCard"
          >
            <QrCode className="w-3.5 h-3.5 text-amber-400" />
            <span>Quick QR</span>
          </button>

          <a
            href="#contact"
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-lg transition-colors whitespace-nowrap shadow-sm shadow-amber-400/20"
          >
            <span>Book Consultation</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </a>
        </div>

        {/* Mobile menu trigger */}
        <div className="flex sm:hidden items-center gap-2">
          <button
            onClick={onOpenQR}
            className="p-1.5 text-amber-400 bg-slate-900 border border-slate-800 rounded-lg"
            title="QR Code"
          >
            <QrCode className="w-4 h-4" />
          </button>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-slate-300 hover:text-white rounded-lg hover:bg-slate-900"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="sm:hidden border-b border-slate-800 bg-slate-950 px-4 pt-2 pb-6 space-y-3">
          <nav className="flex flex-col space-y-2 text-sm text-slate-300">
            <a
              href="#solutions"
              onClick={() => setMobileMenuOpen(false)}
              className="py-1.5 hover:text-amber-400"
            >
              Solutions & Services
            </a>
            <a
              href="#portfolio"
              onClick={() => setMobileMenuOpen(false)}
              className="py-1.5 hover:text-amber-400"
            >
              Portfolio & Media
            </a>
            <a
              href="#pricing"
              onClick={() => setMobileMenuOpen(false)}
              className="py-1.5 hover:text-amber-400"
            >
              Pricing & Retainers
            </a>
            <a
              href="#faq"
              onClick={() => setMobileMenuOpen(false)}
              className="py-1.5 hover:text-amber-400"
            >
              FAQ
            </a>
            <a
              href="#crm"
              onClick={() => setMobileMenuOpen(false)}
              className="py-1.5 hover:text-amber-400"
            >
              CRM Lead Tracker
            </a>
            <a
              href="#about"
              onClick={() => setMobileMenuOpen(false)}
              className="py-1.5 hover:text-amber-400"
            >
              About Sapotlokal
            </a>
            <a
              href="#contact"
              onClick={() => setMobileMenuOpen(false)}
              className="py-1.5 hover:text-amber-400"
            >
              Contact & Location
            </a>
          </nav>

          <div className="pt-3 border-t border-slate-800 flex flex-col gap-2">
            <a
              href="#contact"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full flex items-center justify-center gap-2 py-2.5 text-xs font-semibold text-slate-950 bg-amber-400 rounded-lg"
            >
              <span>Book Consultation</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </a>

            <a
              href="mailto:sapotlokal.co@gmail.com"
              className="w-full flex items-center justify-center gap-2 py-2 text-xs font-medium text-slate-300 hover:text-white bg-slate-900 border border-slate-800 rounded-lg"
            >
              <Mail className="w-3.5 h-3.5 text-amber-400" />
              <span>sapotlokal.co@gmail.com</span>
            </a>
          </div>
        </div>
      )}
    </header>
  );
};
