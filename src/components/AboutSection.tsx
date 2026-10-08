import React from 'react';
import { Target, Award, Shield, Zap, MapPin, Mail, ArrowUpRight } from 'lucide-react';
import { SiteConfig } from '../types';

interface AboutSectionProps {
  siteConfig: SiteConfig;
}

export const AboutSection: React.FC<AboutSectionProps> = ({ siteConfig }) => {
  return (
    <section id="about" className="py-24 bg-slate-950 border-t border-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left Column: Visual & Heritage */}
          <div className="relative">
            <div className="relative rounded-2xl overflow-hidden border border-slate-800 shadow-2xl">
              <img
                src="/src/assets/images/hero_sapotlokal_agency_1790504057787.jpg"
                alt="Sapotlokal Resources headquarters in Balakong Cheras"
                className="w-full aspect-[4/3] object-cover"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />

              {/* Pinned Studio Badge */}
              <div className="absolute bottom-4 left-4 right-4 p-4 bg-slate-950/90 backdrop-blur-md rounded-xl border border-slate-800 flex items-center justify-between text-xs">
                <div>
                  <div className="text-[10px] text-amber-400 uppercase font-semibold">
                    Headquarters & Production Suites
                  </div>
                  <div className="text-white font-medium mt-0.5">
                    Taman Putra Budiman, Balakong, Cheras
                  </div>
                </div>
                <div className="text-right font-mono text-slate-400">
                  Selangor · Malaysia
                </div>
              </div>
            </div>

            {/* Subtle decorative grid backing */}
            <div className="absolute -bottom-6 -right-6 w-48 h-48 bg-amber-500/5 rounded-full blur-3xl -z-10" />
          </div>

          {/* Right Column: Corporate Philosophy & Positioning */}
          <div className="space-y-6">
            <div className="text-xs font-semibold tracking-wider uppercase text-amber-400">
              About Sapotlokal Resources
            </div>

            <h2
              className="text-3xl sm:text-4xl lg:text-5xl font-extrabold font-display tracking-tight text-white leading-tight"
              style={{ textWrap: 'balance' }}
            >
              Streamlining Corporate Growth Through Creative Mastery
            </h2>

            <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
              {siteConfig.shortBio}
            </p>

            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              Traditional consultancies provide advice without creative firepower. Typical media agencies edit videos without understanding balance sheets, customer acquisition economics, or CRM lead tracking. Sapotlokal Resources bridges this gap: uniting corporate governance with high-tempo digital execution.
            </p>

            {/* 3 Core Operating Tenets */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-900">
              <div className="p-3.5 bg-slate-900/50 border border-slate-800/80 rounded-xl">
                <Target className="w-5 h-5 text-amber-400 mb-2" />
                <h4 className="text-xs font-bold text-white mb-1">Streamlined Focus</h4>
                <p className="text-[11px] text-slate-400 leading-normal">
                  No bloated retainers. We identify and resolve direct operational bottlenecks.
                </p>
              </div>

              <div className="p-3.5 bg-slate-900/50 border border-slate-800/80 rounded-xl">
                <Zap className="w-5 h-5 text-amber-400 mb-2" />
                <h4 className="text-xs font-bold text-white mb-1">Creative Velocity</h4>
                <p className="text-[11px] text-slate-400 leading-normal">
                  Rapid UGC sprint turnarounds, high-retention video cuts & agile asset deployment.
                </p>
              </div>

              <div className="p-3.5 bg-slate-900/50 border border-slate-800/80 rounded-xl">
                <Shield className="w-5 h-5 text-amber-400 mb-2" />
                <h4 className="text-xs font-bold text-white mb-1">CRM Accountability</h4>
                <p className="text-[11px] text-slate-400 leading-normal">
                  Every dollar spent is mapped directly to tracked inbound leads and client dashboards.
                </p>
              </div>
            </div>

            {/* Contact quick strip */}
            <div className="pt-2 flex flex-wrap items-center gap-4 text-xs text-slate-400">
              <div className="flex items-center gap-1.5 text-slate-300">
                <MapPin className="w-4 h-4 text-amber-400" />
                <span>50, Jln Budiman 3/2 Taman Putra Budiman , Balakong</span>
              </div>
              <div className="flex items-center gap-1.5 text-slate-300">
                <Mail className="w-4 h-4 text-amber-400" />
                <a
                  href="mailto:sapotlokal.co@gmail.com"
                  className="font-mono hover:text-amber-400 transition-colors"
                >
                  sapotlokal.co@gmail.com
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
