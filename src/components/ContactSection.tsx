import React, { useState, useEffect } from 'react';
import { 
  Phone, 
  MapPin, 
  Mail, 
  MessageSquare, 
  QrCode, 
  Send, 
  CheckCircle, 
  ExternalLink,
  Clock,
  Compass,
  Sparkles
} from 'lucide-react';
import { SiteConfig, Lead, ServiceCategory } from '../types';

interface ContactSectionProps {
  siteConfig: SiteConfig;
  onOpenQR: () => void;
  onLeadCaptured: (lead: Omit<Lead, 'id' | 'createdAt'>) => void;
  selectedPlan?: string | null;
}

export const ContactSection: React.FC<ContactSectionProps> = ({
  siteConfig,
  onOpenQR,
  onLeadCaptured,
  selectedPlan,
}) => {
  // Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [company, setCompany] = useState('');
  const [service, setService] = useState<ServiceCategory>('Video Editing');
  const [budget, setBudget] = useState('RM 5,000 - RM 10,000 / mo');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [waMessage, setWaMessage] = useState('');
  const [highlightService, setHighlightService] = useState(false);

  // Automatically pre-fill and highlight "Primary Service Needed" when a plan is selected from Pricing
  useEffect(() => {
    if (!selectedPlan) return;

    if (selectedPlan.includes('Creative Sprint')) {
      setService('Video Editing');
      setBudget('Creative Sprint Package (Custom Scope)');
      setMessage((prev) =>
        prev.includes('Creative Sprint')
          ? prev
          : `[Tier Inquiry: Creative Sprint] Requesting custom quote for agile video & asset overhaul.`
      );
    } else if (selectedPlan.includes('Growth Retainer')) {
      setService('UGC');
      setBudget('Growth Retainer (Custom Scope)');
      setMessage((prev) =>
        prev.includes('Growth Retainer')
          ? prev
          : `[Tier Inquiry: Growth Retainer] Requesting custom quote for monthly creative media partner & UGC.`
      );
    } else if (selectedPlan.includes('Enterprise')) {
      setService('Branding Strategy');
      setBudget('Enterprise Transformation Scope');
      setMessage((prev) =>
        prev.includes('Enterprise Transformation')
          ? prev
          : `[Tier Inquiry: Enterprise Transformation] Requesting bespoke consultation & corporate media architecture.`
      );
    }

    setHighlightService(true);
    const timer = setTimeout(() => setHighlightService(false), 4000);
    return () => clearTimeout(timer);
  }, [selectedPlan]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone) return;

    // Send to CRM pipeline
    onLeadCaptured({
      name,
      email,
      phone,
      company: company || 'Enterprise Client',
      service,
      budget,
      stage: 'New Inquiry',
      score: 'High Intent',
      notes: message || 'Inquiry submitted via official website lead capture form.',
      source: 'Website Form',
    });

    // Send the enquiry to WhatsApp: open a chat with the details already written out.
    // (No server needed - the visitor just presses Send in WhatsApp.)
    const lines = [
      'Hi Sapotlokal Resources, I would like to make an enquiry.',
      '',
      `Name: ${name}`,
      company ? `Company: ${company}` : '',
      `Phone: ${phone}`,
      email ? `Email: ${email}` : '',
      `Service: ${service}`,
      budget ? `Budget: ${budget}` : '',
      message ? `Message: ${message}` : '',
    ].filter((line, i) => i < 2 || line !== '');
    const text = lines.join('\n');
    setWaMessage(text);
    const waNumber = String(siteConfig.whatsappNumber || '').replace(/\D/g, '');
    window.open(`https://wa.me/${waNumber}?text=${encodeURIComponent(text)}`, '_blank', 'noopener,noreferrer');

    setSubmitted(true);
  };

  const resetForm = () => {
    setName('');
    setEmail('');
    setPhone('');
    setCompany('');
    setMessage('');
    setSubmitted(false);
  };

  return (
    <section id="contact" className="py-24 bg-slate-900/50 border-t border-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="max-w-3xl mb-16">
          <div className="text-xs font-semibold tracking-wider uppercase text-amber-400 mb-2">
            Initiate Corporate Engagement
          </div>
          <h2
            className="text-3xl sm:text-5xl font-extrabold font-display tracking-tight text-white mb-4"
            style={{ textWrap: 'balance' }}
          >
            Connect With Sapotlokal Resources
          </h2>
          <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
            Schedule a growth diagnostic, request video production rates, or visit our studio in Balakong, Cheras. Fill in the form and your enquiry opens in WhatsApp so we can reply to you directly.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          {/* Left Column: Contact Cards & Office Details */}
          <div className="lg:col-span-5 space-y-6">
            {/* Primary Details Card */}
            <div className="p-6 sm:p-7 bg-slate-950 border border-slate-800 rounded-2xl space-y-6">
              <h3 className="text-lg font-bold font-display text-white">
                Official Business Address
              </h3>

              <div className="space-y-4 text-xs">
                {/* Address */}
                <div className="flex items-start gap-3">
                  <div className="p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-amber-400 flex-shrink-0 mt-0.5">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-semibold">
                      Office & Studio Location
                    </span>
                    <p className="text-white text-xs sm:text-sm font-medium leading-relaxed mt-0.5">
                      {siteConfig.address}
                    </p>
                    <a
                      href="https://maps.google.com/?q=50,+Jln+Budiman+3/2+Taman+Putra+Budiman,+Balakong,+43200+Cheras,+Selangor"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-amber-400 hover:text-amber-300 font-semibold mt-2 text-xs"
                    >
                      <span>Open in Google Maps</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>

                {/* Official Corporate Email */}
                <div className="flex items-start gap-3 pt-3 border-t border-slate-900">
                  <div className="p-2.5 bg-amber-400/10 border border-amber-400/30 rounded-xl text-amber-400 flex-shrink-0 mt-0.5">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-semibold">
                      Official Inquiries Email
                    </span>
                    <a
                      href="mailto:sapotlokal.co@gmail.com"
                      className="text-white text-base font-bold font-mono hover:text-amber-400 transition-colors block mt-0.5"
                    >
                      sapotlokal.co@gmail.com
                    </a>
                    <span className="text-slate-400 text-[11px]">
                      Direct corporate, video production & strategic advisory inquiries
                    </span>
                  </div>
                </div>

                {/* WhatsApp */}
                <div className="flex items-start gap-3 pt-3 border-t border-slate-900">
                  <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400 flex-shrink-0 mt-0.5">
                    <MessageSquare className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-semibold">
                      Instant WhatsApp Chat
                    </span>
                    <a
                      href={`https://wa.me/${siteConfig.whatsappNumber}?text=${encodeURIComponent(
                        'Hi Sapotlokal Resources, I am reaching out to discuss consultancy and creative media services.'
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 mt-1.5 text-xs font-semibold bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-lg transition-colors"
                    >
                      <span>Connect on WhatsApp</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick QR Generator Card */}
            <div className="p-6 bg-gradient-to-br from-amber-500/10 via-slate-950 to-slate-950 border border-amber-500/30 rounded-2xl flex items-center justify-between gap-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 block mb-1">
                  Instant Access Tool
                </span>
                <h4 className="text-sm font-bold text-white">
                  Generate Portfolio & vCard QR Code
                </h4>
                <p className="text-xs text-slate-300 mt-1">
                  Share our Cheras location and contact directly to your phone.
                </p>
              </div>

              <button
                onClick={onOpenQR}
                className="flex-shrink-0 flex items-center gap-2 px-3.5 py-2.5 text-xs font-bold bg-amber-400 hover:bg-amber-300 text-slate-950 rounded-xl transition-all shadow-md shadow-amber-400/20"
              >
                <QrCode className="w-4 h-4" />
                <span>Open QR</span>
              </button>
            </div>
          </div>

          {/* Right Column: Lead Capture Form */}
          <div className="lg:col-span-7">
            <div className="p-6 sm:p-8 bg-slate-950 border border-slate-800 rounded-2xl relative overflow-hidden">
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-800/80">
                <div>
                  <h3 className="text-lg sm:text-xl font-bold font-display text-white">
                    Submit Strategic Brief
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Fill in your details and send them to us on WhatsApp for a fast reply.
                  </p>
                </div>
                <div className="text-[11px] font-mono text-amber-400 bg-amber-400/10 px-2 py-1 rounded border border-amber-400/20">
                  WhatsApp
                </div>
              </div>

              {submitted ? (
                <div className="py-12 px-4 text-center space-y-4">
                  <div className="w-14 h-14 bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle className="w-8 h-8" />
                  </div>
                  <h4 className="text-xl font-bold text-white font-display">
                    Your Enquiry Is Ready on WhatsApp!
                  </h4>
                  <p className="text-xs sm:text-sm text-slate-300 max-w-md mx-auto leading-relaxed">
                    Thank you, <strong className="text-white">{name}</strong>. WhatsApp should have opened with your details filled in. Please press <strong className="text-white">Send</strong> in WhatsApp so our team receives your enquiry. If it did not open, tap the green button below.
                  </p>
                  <div className="pt-4 flex flex-wrap items-center justify-center gap-3">
                    <a
                      href={`https://wa.me/${String(siteConfig.whatsappNumber || '').replace(/\D/g, '')}?text=${encodeURIComponent(
                        waMessage || `Hi Sapotlokal Resources, I would like to make an enquiry. My name is ${name}.`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2.5 text-xs font-semibold bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-xl transition-colors"
                    >
                      Open WhatsApp to Send
                    </a>
                    <button
                      onClick={resetForm}
                      className="px-4 py-2.5 text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-xl transition-colors"
                    >
                      Submit Another Inquiry
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-medium text-slate-300 mb-1.5">
                        Your Full Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. Adam Bin Aris"
                        className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                      />
                    </div>

                    <div>
                      <label className="block font-medium text-slate-300 mb-1.5">
                        Company / Brand Name
                      </label>
                      <input
                        type="text"
                        value={company}
                        onChange={(e) => setCompany(e.target.value)}
                        placeholder="e.g. Cheras Prime Logistics"
                        className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-medium text-slate-300 mb-1.5">
                        Phone / WhatsApp *
                      </label>
                      <input
                        type="tel"
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="012-XXXXXXX"
                        className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                      />
                    </div>

                    <div>
                      <label className="block font-medium text-slate-300 mb-1.5">
                        Email Address
                      </label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="corporate@domain.my"
                        className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label htmlFor="service-needed" className="block font-medium text-slate-300">
                          Primary Service Needed *
                        </label>
                        {selectedPlan && (
                          <span className="text-[10px] font-mono font-semibold text-amber-300 bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/30 flex items-center gap-1">
                            <Sparkles className="w-2.5 h-2.5 text-amber-400" />
                            <span>{selectedPlan}</span>
                          </span>
                        )}
                      </div>
                      <select
                        id="service-needed"
                        value={service}
                        onChange={(e) => setService(e.target.value as ServiceCategory)}
                        className={`w-full px-3.5 py-2.5 bg-slate-900 border rounded-xl text-white focus:outline-none transition-all ${
                          highlightService
                            ? 'border-amber-400 ring-2 ring-amber-400/40 bg-slate-800'
                            : 'border-slate-700 focus:border-amber-400'
                        }`}
                      >
                        <option value="Video Editing">Commercial Video Editing</option>
                        <option value="UGC">UGC Creator Campaigns</option>
                        <option value="Website Building">Website Building & Web Platforms</option>
                        <option value="Social Content">Social Content Strategy</option>
                        <option value="Graphic Design">Graphic Design & Visual Brand</option>
                        <option value="Branding Strategy">Corporate Consultancy & Branding</option>
                      </select>
                    </div>

                    <div>
                      <label className="block font-medium text-slate-300 mb-1.5">
                        Anticipated Monthly / Sprint Budget
                      </label>
                      <select
                        value={budget}
                        onChange={(e) => setBudget(e.target.value)}
                        className={`w-full px-3.5 py-2.5 bg-slate-900 border rounded-xl text-white focus:outline-none transition-all ${
                          highlightService
                            ? 'border-cyan-400 ring-2 ring-cyan-400/30 bg-slate-800'
                            : 'border-slate-700 focus:border-amber-400'
                        }`}
                      >
                        <option value="Creative Sprint Package (Custom Scope)">Creative Sprint Package (Custom Scope)</option>
                        <option value="Growth Retainer (Custom Scope)">Growth Retainer (Custom Scope)</option>
                        <option value="Enterprise Transformation Scope">Enterprise Transformation Scope</option>
                        <option value="Custom Project Scope">Custom Project Scope</option>
                        <option value="Flexible / To Be Discussed">Flexible / To Be Discussed</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block font-medium text-slate-300 mb-1.5">
                      Brief Description of Current Challenges & Goals
                    </label>
                    <textarea
                      rows={4}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Tell us about your brand, what videos or designs you need, and timeline..."
                      className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                    />
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      className="w-full flex items-center justify-center gap-2 py-3.5 text-xs sm:text-sm font-bold bg-amber-400 hover:bg-amber-300 text-slate-950 rounded-xl transition-all shadow-lg shadow-amber-400/20"
                    >
                      <Send className="w-4 h-4" />
                      <span>Send Inquiry via WhatsApp</span>
                    </button>
                    <span className="text-[11px] text-slate-500 block text-center mt-2">
                      Your details open in WhatsApp - press Send there to deliver your enquiry. No spam.
                    </span>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
