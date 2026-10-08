import React, { useState } from 'react';
import { HelpCircle, ChevronDown, MessageCircle, Clock, Video, Database, RefreshCw, CheckCircle2 } from 'lucide-react';

interface FAQItem {
  id: string;
  icon: React.ComponentType<{ className?: string }>;
  question: string;
  answer: string;
  category: string;
}

export const FAQSection: React.FC = () => {
  const [openIds, setOpenIds] = useState<string[]>(['faq-1', 'faq-2']);

  const toggleFAQ = (id: string) => {
    setOpenIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const faqs: FAQItem[] = [
    {
      id: 'faq-1',
      icon: Clock,
      category: 'Delivery SLA',
      question: 'What is your standard turnaround time for video editing and UGC sprints?',
      answer:
        'Short-form vertical reels (TikTok, Instagram Reels, and UGC creator clips) are delivered within 48 to 72 hours of receiving raw footage or approved scripts. Full 4K commercial films, multi-camera post-productions, and complex brand animations typically require 5 to 7 business days, including DaVinci Resolve color grading and custom sound design. Urgent 24-hour turnaround sprints are also available for retainer partners upon request.',
    },
    {
      id: 'faq-2',
      icon: Video,
      category: 'Production Workflow',
      question: 'How does the video footage intake and asset sharing process work?',
      answer:
        'Upon kickoff, we provision a dedicated high-speed cloud drive (Google Drive / Frame.io workspace) mapped specifically to your brand. Your team or creator partners can drop in raw camera footage, iPhone recordings, or product B-roll. Our post-production team tags, catalogs, and logs footage before initiating edits. All review cuts are delivered with interactive timestamp commenting so you can request adjustments with pinpoint precision.',
    },
    {
      id: 'faq-3',
      icon: Database,
      category: 'CRM Integration',
      question: 'How does the custom CRM lead tracking pipeline work with creative campaigns?',
      answer:
        'We bridge the gap between creative media and real revenue. When we deploy paid ads, UGC campaigns, or website landing pages, we configure automated webhooks directly into our unified CRM lead pipeline and WhatsApp notification system. Incoming inquiries from TikTok Instant Forms, Meta Lead Gen, or website forms trigger instant alerts with zero lead leakage, enabling your sales team to engage high-intent prospects within minutes.',
    },
    {
      id: 'faq-4',
      icon: RefreshCw,
      category: 'Retainer Flexibility',
      question: 'How are monthly retainers structured and can unused deliverables rollover?',
      answer:
        'Our retainers are built around monthly asset allocations tailored to your marketing volume (e.g., 16 vertical reels + 1 master film + social carousels). You get a dedicated Creative Lead and guaranteed turnaround SLAs. If your schedule slows down or product launches shift, up to 30 days of unused deliverable allocations automatically roll over to the subsequent billing cycle, ensuring zero wasted budget.',
    },
    {
      id: 'faq-5',
      icon: CheckCircle2,
      category: 'Quality Assurance',
      question: 'What revisions and quality assurance processes are included with each deliverable?',
      answer:
        'Every deliverable includes two full rounds of collaborative revisions during the 7-day review window. Before any asset is exported, it undergoes our internal 4-point QA check: hook retention audit, audio balance and loudness normalization (-14 LUFS), typography & caption accuracy, and multi-device aspect ratio framing. Final masters are delivered in pristine uncompressed 4K and native social formats.',
    },
  ];

  return (
    <section id="faq" className="py-24 bg-slate-900/30 border-t border-slate-900 relative">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/10 border border-amber-400/20 text-amber-400 text-xs font-semibold uppercase tracking-wider mb-3">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Frequently Asked Questions</span>
          </div>
          <h2
            className="text-3xl sm:text-5xl font-extrabold font-display tracking-tight text-white mb-4"
            style={{ textWrap: 'balance' }}
          >
            Clear Answers. Zero Guesswork.
          </h2>
          <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-2xl mx-auto">
            Everything you need to know about our corporate consultancy sprints, video post-production turnaround, and integrated CRM pipelines.
          </p>
        </div>

        {/* Accordions List */}
        <div className="space-y-4">
          {faqs.map((faq) => {
            const isOpen = openIds.includes(faq.id);
            const Icon = faq.icon;

            return (
              <div
                key={faq.id}
                className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
                  isOpen
                    ? 'bg-slate-950 border-amber-400/40 shadow-lg shadow-amber-400/5'
                    : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                }`}
              >
                <button
                  type="button"
                  onClick={() => toggleFAQ(faq.id)}
                  aria-expanded={isOpen}
                  className="w-full p-6 text-left flex items-start justify-between gap-4 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
                >
                  <div className="flex items-start gap-3.5">
                    <span
                      className={`p-2 rounded-xl mt-0.5 shrink-0 transition-colors ${
                        isOpen
                          ? 'bg-amber-400 text-slate-950 font-bold'
                          : 'bg-slate-900 text-slate-400 border border-slate-800'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </span>

                    <div>
                      <span className="text-[10px] font-mono uppercase text-amber-400 font-semibold tracking-wider block mb-1">
                        {faq.category}
                      </span>
                      <h3 className="text-base sm:text-lg font-bold font-display text-white leading-snug">
                        {faq.question}
                      </h3>
                    </div>
                  </div>

                  <span
                    className={`p-1.5 rounded-lg border shrink-0 transition-transform duration-200 ${
                      isOpen
                        ? 'rotate-180 bg-amber-400/10 border-amber-400/30 text-amber-400'
                        : 'bg-slate-900 border-slate-800 text-slate-400'
                    }`}
                  >
                    <ChevronDown className="w-4 h-4" />
                  </span>
                </button>

                {isOpen && (
                  <div className="px-6 pb-6 pt-1 text-slate-300 text-xs sm:text-sm leading-relaxed border-t border-slate-900">
                    <p className="pl-11">{faq.answer}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Have More Questions Callout */}
        <div className="mt-12 text-center p-6 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 text-left">
            <span className="p-2.5 rounded-xl bg-amber-400/10 text-amber-400 border border-amber-400/20 shrink-0">
              <MessageCircle className="w-5 h-5" />
            </span>
            <div>
              <h4 className="text-sm font-bold text-white">Have a specific corporate inquiry?</h4>
              <p className="text-xs text-slate-400">Our senior team is available for direct consultation on WhatsApp or email.</p>
            </div>
          </div>
          <a
            href="https://wa.me/60122118111"
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2.5 rounded-xl text-xs font-semibold bg-amber-400 hover:bg-amber-300 text-slate-950 transition-colors shrink-0 shadow-md shadow-amber-400/10"
          >
            Chat with Sapotlokal Team →
          </a>
        </div>
      </div>
    </section>
  );
};
