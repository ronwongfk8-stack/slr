import React from 'react';
import { Check, Sparkles, Zap, Shield, ArrowRight, MessageSquare } from 'lucide-react';

interface PricingSectionProps {
  whatsappNumber?: string;
  onSelectPlan?: (planName: string) => void;
}

export const PricingSection: React.FC<PricingSectionProps> = ({ 
  whatsappNumber = '601116668789',
  onSelectPlan 
}) => {
  const handleSelect = (planTitle: string) => {
    if (onSelectPlan) {
      onSelectPlan(planTitle);
    }
    const contactElem = document.getElementById('contact');
    if (contactElem) {
      contactElem.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const plans = [
    {
      id: 'sprint',
      title: 'Creative Sprint',
      subtitle: 'One-Off Production & Asset Overhaul',
      badge: 'Agile Sprint Scope',
      badgeColor: 'bg-slate-800 text-slate-300 border-slate-700',
      description:
        'Ideal for rapid campaign launches, single-channel content surges, or corporate product unveilings requiring elite post-production.',
      features: [
        'Cinematic 4K Cutdowns & Short-Form Reels',
        'DaVinci Resolve color grading & spatial sound design',
        'High-conversion hooks, titles & caption typography',
        'Multi-platform exports (9:16 Vertical & 16:9 Widescreen)',
        '2 full rounds of rapid revisions included',
        'Fast 3 to 5 business day delivery turnaround',
      ],
      highlighted: false,
      ctaText: 'Get Custom Quote',
      ctaStyle:
        'bg-slate-900 hover:bg-slate-800 text-slate-100 border border-slate-700 hover:border-amber-400/50 shadow-md',
      whatsappMessage:
        'Hi Sapotlokal Resources, I am looking for a custom quote for the Creative Sprint package.',
    },
    {
      id: 'retainer',
      title: 'Growth Retainer',
      subtitle: 'Dedicated Monthly Creative Media Partner',
      badge: '⭐ MOST POPULAR FOR SCALING BRANDS',
      badgeColor: 'bg-cyan-500/20 text-cyan-300 border-cyan-400/40',
      description:
        'Our flagship engagement. Continuous high-conversion UGC creation, commercial video post-production, web assets, and brand management.',
      features: [
        '16x Monthly UGC & Vertical Video Reels (TikTok / IG / Shorts)',
        '1x Cinematic 4K Master Brand Commercial or Web Platform Sprint',
        'Full Graphic Design Suite (Social Carousels, Pitch Decks, Banners)',
        'Automated CRM Lead Tracker & WhatsApp Pipeline Integration',
        '48-Hour sprint turnaround on standard video edits',
        'Dedicated Creative Director & private communication channel',
        '30-Day rollover on any unused deliverable allocations',
      ],
      highlighted: true,
      ctaText: 'Get Custom Quote',
      ctaStyle:
        'bg-gradient-to-r from-cyan-400 via-amber-300 to-amber-400 hover:from-cyan-300 hover:to-amber-300 text-slate-950 font-bold shadow-lg shadow-cyan-500/20',
      whatsappMessage:
        'Hi Sapotlokal Resources, I would like to request a custom quote and proposal for the Growth Retainer.',
    },
    {
      id: 'enterprise',
      title: 'Enterprise Transformation',
      subtitle: 'Corporate Advisory & Omni-Channel Media',
      badge: 'Full Architecture',
      badgeColor: 'bg-amber-400/20 text-amber-300 border-amber-400/40',
      description:
        'Comprehensive business solutions: strategic management consulting, on-site multi-cam film crews, web architecture, and acquisition engines.',
      features: [
        'Unlimited Scaled UGC & Multi-Cam Studio Video Productions',
        'End-to-End Corporate Restructuring & Brand Identity Systems',
        'Full-Stack Custom Web Platform Development (teepro.com caliber)',
        'Bespoke CRM Automation, WhatsApp Routing & Custom Attribution',
        'On-site video production team & executive director deployment',
        'Executive Advisory reviews with Sapotlokal Strategy Unit',
        'Priority 24/7 SLA & contract-guaranteed delivery timelines',
      ],
      highlighted: false,
      ctaText: 'Request Custom Proposal',
      ctaStyle:
        'bg-slate-900 hover:bg-slate-800 text-slate-100 border border-slate-700 hover:border-amber-400/50 shadow-md',
      whatsappMessage:
        'Hi Sapotlokal Resources, I would like to schedule an executive consultation for Custom Enterprise Transformation.',
    },
  ];

  return (
    <section id="pricing" className="py-24 bg-slate-950 border-t border-slate-900 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/10 border border-amber-400/20 text-amber-400 text-xs font-semibold uppercase tracking-wider mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Tailored Proposals & Transparent Scope</span>
          </div>
          <h2
            className="text-3xl sm:text-5xl font-extrabold font-display tracking-tight text-white mb-4"
            style={{ textWrap: 'balance' }}
          >
            Predictable Investment. Measurable ROI.
          </h2>
          <p className="text-base text-slate-300 leading-relaxed">
            Every business has unique requirements. Review our baseline deliverable structures below and request a customized quote suited to your exact goals.
          </p>
        </div>

        {/* 3-Column Responsive Pricing Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`relative flex flex-col justify-between rounded-3xl p-7 sm:p-8 transition-all duration-300 h-full ${
                plan.highlighted
                  ? 'bg-slate-900/90 border-2 border-cyan-400 shadow-2xl shadow-cyan-500/15 scale-100 lg:-translate-y-2'
                  : 'bg-slate-950/90 border border-slate-800 hover:border-slate-700'
              }`}
            >
              {/* Clean & Minimal Card Header */}
              <div>
                <div className="flex items-center justify-between gap-2 mb-4">
                  <span
                    className={`inline-block text-[11px] font-mono font-bold uppercase tracking-wider px-3 py-1 rounded-full border ${plan.badgeColor}`}
                  >
                    {plan.badge}
                  </span>
                  {plan.highlighted && (
                    <span className="flex items-center gap-1 text-[11px] font-mono text-cyan-400 font-semibold">
                      <Zap className="w-3.5 h-3.5 fill-cyan-400" />
                      <span>Best Value</span>
                    </span>
                  )}
                </div>

                <h3 className="text-2xl font-bold font-display text-white mb-1">
                  {plan.title}
                </h3>
                <p className="text-xs text-amber-400 font-medium mb-4">
                  {plan.subtitle}
                </p>

                <p className="text-xs text-slate-300 leading-relaxed mb-6">
                  {plan.description}
                </p>

                {/* Price Area: Only "💬 Custom Quote" & "💬 WhatsApp for Quote" Badges */}
                <div className="py-3.5 px-4 rounded-2xl bg-slate-950/80 border border-slate-800/80 mb-6 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm">💬</span>
                    <span className="text-xs sm:text-sm font-bold font-mono text-amber-300 tracking-wide">
                      Custom Quote
                    </span>
                  </div>
                  <span className="text-[10px] sm:text-[11px] font-mono font-medium text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20 whitespace-nowrap flex items-center gap-1">
                    <span>💬 WhatsApp for Quote</span>
                  </span>
                </div>

                {/* Feature List (Deliverable Bullet Points) */}
                <div className="space-y-3 mb-8">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block">
                    Deliverables & Scope:
                  </span>
                  <ul className="space-y-2.5">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2.5 text-xs text-slate-300 leading-relaxed">
                        <Check
                          className={`w-4 h-4 shrink-0 mt-0.5 ${
                            plan.highlighted ? 'text-cyan-400' : 'text-amber-400'
                          }`}
                        />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Action Buttons: Retain Primary Custom Quote CTA & WhatsApp for Pricing */}
              <div className="pt-4 border-t border-slate-800/80 space-y-3">
                <button
                  type="button"
                  onClick={() => handleSelect(plan.title)}
                  className={`w-full py-3.5 px-4 rounded-xl text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${plan.ctaStyle}`}
                >
                  <span>{plan.ctaText}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <a
                  href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(plan.whatsappMessage)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2.5 px-3 rounded-xl text-xs font-medium flex items-center justify-center gap-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 transition-all"
                  title="WhatsApp for direct pricing discussion"
                >
                  <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
                  <span>WhatsApp for Pricing</span>
                </a>

                <div className="text-center pt-1">
                  <span className="text-[10px] text-slate-500">
                    Auto-populates project brief below · Fast response SLA
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Scope Flexibility & Consultation Disclaimer Subtext Banner */}
        <div className="mt-8 p-4 sm:p-5 rounded-2xl bg-amber-400/5 border border-amber-400/20 text-center max-w-4xl mx-auto">
          <p className="text-xs sm:text-sm text-amber-200/90 leading-relaxed font-medium">
            Every business has unique deliverables and timelines. Select a tier above to request a tailored proposal or custom scope suited to your budget.
          </p>
        </div>

        {/* Retainer Assurance Callout */}
        <div className="mt-8 p-6 rounded-2xl bg-slate-900/40 border border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 text-xs text-slate-300">
            <Shield className="w-5 h-5 text-amber-400 shrink-0" />
            <span>
              All corporate engagements include flexible milestone agreements with zero hidden fees and a transparent 30-day notice policy.
            </span>
          </div>
          <a
            href="mailto:sapotlokal.co@gmail.com"
            className="text-xs text-amber-400 hover:text-amber-300 font-semibold underline underline-offset-4 whitespace-nowrap"
          >
            Need a bespoke custom scope? Inquire via email →
          </a>
        </div>
      </div>
    </section>
  );
};
