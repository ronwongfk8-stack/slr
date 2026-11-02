import React, { useEffect, useRef, useState } from 'react';
import { ArrowRight, Check, ChevronDown, ExternalLink, MessageCircle } from 'lucide-react';
import { ServiceCategory, SiteConfig } from '../types';

/**
 * "Practical data for Malaysian SMEs": the sustainability & cost reporting service page.
 * Rebuilt from screenshots of the earlier service page, with the same sections and wording, plus:
 * a sticky page menu, a starter checklist that writes a WhatsApp message, a WhatsApp link on every
 * price, and a short FAQ. All wording that is not from the original page is general and makes no
 * promises about regulation, certification or savings.
 *
 * Edit the text, prices and links in the constants below.
 */
const GREEN = '#2f7d3a';

const DISCLAIMER =
  'Our service supports data organisation and management decisions. It is not regulatory assurance, certification or a guarantee of verified sustainability figures or cost savings.';

/** Facts from public sources, checked October 2026. Re-check before changing or relying on them. */
const WHY = [
  {
    title: 'You can be asked even if you are not required.',
    body: 'SMEs do not have to submit sustainability reports to regulators. But SMEs in a supply chain may be asked for ESG data by customers and suppliers, especially listed companies.',
    source: 'The Edge Malaysia',
    url: 'https://theedgemalaysia.com/node/755286',
  },
  {
    title: 'The usual data requests are practical.',
    body: 'Expect questions on electricity and fuel use, payroll and labour information, supplier data and product traceability, according to MBSB (September 2026).',
    source: 'Business Today, MBSB',
    url: 'https://www.businesstoday.com.my/2026/09/02/malaysian-smes-still-face-esg-pressure-despite-eu-reporting-change-mbsb-says/',
  },
  {
    title: 'There is a free national starting point.',
    body: "Capital Markets Malaysia's Simplified ESG Disclosure Guide for SMEs sets out 35 priority disclosures at Basic, Intermediate and Advanced levels, so one set of data can answer many requests.",
    source: 'Capital Markets Malaysia',
    url: 'https://sedg.capitalmarketsmalaysia.com/',
  },
  {
    title: 'Manufacturers: the national roadmap is set.',
    body: "MITI's i-ESG framework runs in two phases: Phase 1.0 (2024–2026) with the i-ESGReady readiness assessment and the i-ESGStart guide, then Phase 2.0 (2027–2030) with more rigorous expectations.",
    source: 'MITI i-ESG framework',
    url: 'https://www.miti.gov.my/miti/resources/IESG/Booklet_Framework_FA.pdf',
  },
];

const PROMISES = ['Agree the scope first', 'Work with existing tools', 'Make data gaps visible'];

const STEPS = [
  {
    n: '01',
    title: 'Find your starting point',
    body: 'A business and sustainability readiness assessment reviews your utility bills, operating records and customer data requests. Leave with a clear list of gaps and priorities.',
  },
  {
    n: '02',
    title: 'Make the numbers useful',
    body: 'Bring energy, water, waste and operating costs into a dashboard using tools such as Excel or Power BI. Track patterns and identify areas worth investigating.',
  },
  {
    n: '03',
    title: 'Keep improvement moving',
    body: 'Monthly management reports turn the latest records into practical recommendations. Get support organising evidence for customer questionnaires and relevant reporting needs.',
  },
];

const RECORDS = [
  { id: 'electricity', label: 'Electricity bills (last 12 months)' },
  { id: 'water', label: 'Water bills' },
  { id: 'waste', label: 'Waste or disposal records' },
  { id: 'fuel', label: 'Fuel and transport records' },
  { id: 'payroll', label: 'Payroll and headcount records' },
  { id: 'suppliers', label: 'A list of your main suppliers and materials' },
  { id: 'ops', label: 'Production or operating records' },
  { id: 'costs', label: 'A spreadsheet that tracks your costs' },
];

/**
 * Founding-client offer: the first few SME clients get a discount in return for an honest testimonial.
 * Set open to false to hide it once the places are taken. Keep the numbers true: change them here
 * whenever they change, and never show a places-left counter you cannot back up.
 */
const FOUNDING = { open: true, places: 5, discount: 20 };

const PRICING = [
  {
    name: 'Readiness assessment',
    body: 'Review your records, data gaps and immediate priorities.',
    detail: 'From RM800 for 3 months of records at one site. RM1,500 for 12 months of records plus one customer questionnaire reviewed.',
    price: 'RM800–1,500',
    unit: 'One-off',
  },
  {
    name: 'Dashboard setup',
    body: 'Organise your baseline and build a practical reporting view.',
    detail: 'An Excel dashboard for one site from RM2,500. Power BI with several data sources up to RM5,000.',
    price: 'RM2,500–5,000',
    unit: 'One-off',
  },
  {
    name: 'Ongoing reporting',
    body: 'A monthly management report with practical recommendations.',
    detail: 'The price depends on the number of sites and data sources.',
    price: 'RM500–1,200',
    unit: 'Monthly · 6-month minimum',
  },
];

const FAQ = [
  {
    q: 'Does my SME have to publish a sustainability report?',
    a: 'Most SMEs are not required to submit sustainability reports to regulators. Malaysia\'s national framework (NSRF) is aimed at listed companies and large non-listed companies. But customers, banks and larger buyers may still ask for your data. This is general information, not legal advice, so check the current rules for your situation.',
  },
  {
    q: 'Do I need an in-house analyst or new software?',
    a: 'No. You do not need an in-house analyst to get started. We work with tools you may already use, such as Excel or Power BI, and organise your existing records into one practical view, without building a complex new system.',
  },
  {
    q: 'What should I bring to the first step?',
    a: 'Your recent utility bills and any customer reporting requests, for example a sustainability questionnaire from a customer or bank. We will help identify a practical starting point.',
  },
  {
    q: 'Is this regulatory assurance or certification?',
    a: DISCLAIMER,
  },
  {
    q: 'Are the prices fixed?',
    a: 'The ranges shown are proposed pilot ranges, not confirmed quotes. Each package states how many sites and months of records it covers, and the final scope and price depend on your data and reporting needs. We agree the scope with you first.',
  },
  {
    q: 'Is there a free official guide I can read?',
    a: 'Yes. Capital Markets Malaysia publishes the Simplified ESG Disclosure Guide for SMEs (SEDG) for free. We can help you organise your records so they are easier to use with it, or with a customer\'s own questionnaire.',
  },
  {
    q: 'What does the monthly report give me?',
    a: 'Monthly management reports turn the latest records into practical recommendations, with support organising evidence for customer questionnaires and relevant reporting needs.',
  },
];

/** Fades a block in the first time it scrolls into view (skipped for visitors who prefer less motion). */
const Reveal: React.FC<{ children: React.ReactNode; delay?: number; className?: string }> = ({
  children,
  delay = 0,
  className = '',
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce || typeof IntersectionObserver === 'undefined') {
      setShown(true);
      return;
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShown(true);
          io.disconnect();
        }
      },
      { threshold: 0.12 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: shown ? 1 : 0,
        transform: shown ? 'none' : 'translateY(18px)',
        transition: `opacity 700ms ease ${delay}ms, transform 700ms ease ${delay}ms`,
      }}
    >
      {children}
    </div>
  );
};

const Eyebrow: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.25em] sm:text-xs" style={{ color: GREEN }}>
    {children}
  </p>
);

interface SmeReportingPageProps {
  siteConfig: SiteConfig;
  /** open the full WhatsApp enquiry form */
  onContact: (service?: ServiceCategory) => void;
}

export const SmeReportingPage: React.FC<SmeReportingPageProps> = ({ siteConfig, onContact }) => {
  const [have, setHave] = useState<Record<string, boolean>>({});
  const [questionnaire, setQuestionnaire] = useState<boolean | null>(null);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const waDigits = String(siteConfig.whatsappNumber || '').replace(/\D/g, '');
  const wa = (text: string) => `https://wa.me/${waDigits}?text=${encodeURIComponent(text)}`;
  const go = (id: string) =>
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });

  const haveList = RECORDS.filter((r) => have[r.id]).map((r) => r.label);
  const missingList = RECORDS.filter((r) => !have[r.id]).map((r) => r.label);

  const checklistMessage = [
    'Hi Sapotlokal Resources, I would like to explore the SME sustainability and cost reporting pilot.',
    '',
    `Records I already have (${haveList.length} of ${RECORDS.length}): ${haveList.join(', ') || 'none yet'}`,
    `Still to find: ${missingList.join(', ') || 'nothing'}`,
    questionnaire === true ? 'I need to answer a customer or bank sustainability questionnaire.' : '',
    questionnaire === false ? 'I have no customer or bank questionnaire at the moment.' : '',
  ]
    .filter((line, i) => line !== '' || i === 1)
    .join('\n');

  const linkBtn =
    'inline-flex items-center justify-center gap-2 rounded-full px-6 py-3.5 text-sm font-semibold transition';

  return (
    <div className="overflow-clip rounded-3xl bg-[#f7faf7] text-[#1b221c] shadow-2xl ring-1 ring-white/10">
      {/* page menu */}
      <div className="sticky top-14 z-30 border-b border-[#e1e7e1] bg-[#f7faf7]/92 backdrop-blur sm:top-16">
        <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-1 px-5 py-3 sm:px-10">
          <span className="text-base font-semibold tracking-tight sm:text-lg">sapotlokal resources</span>
          <nav className="flex w-full items-center justify-between gap-1 text-[13px] sm:w-auto sm:justify-start sm:text-sm" aria-label="This page">
            {[
              ['Our approach', 'sme-approach'],
              ['Pricing guide', 'sme-pricing'],
              ['Book a service', 'sme-book'],
            ].map(([label, id]) => (
              <button
                key={id}
                type="button"
                onClick={() => go(id)}
                className="whitespace-nowrap rounded-full px-2.5 py-1.5 text-[#2c352d] transition hover:bg-[#e6efe6] hover:text-[#1b221c] sm:px-3"
              >
                {label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* hero */}
      <section className="px-5 py-12 sm:px-10 sm:py-16 lg:py-20">
        <div className="grid items-center gap-12 lg:grid-cols-12 lg:gap-10">
          <Reveal className="lg:col-span-6">
            <Eyebrow>Practical services · Malaysian SMEs</Eyebrow>
            <h2 className="text-[2.6rem] font-semibold leading-[1.05] tracking-tight sm:text-6xl">
              Clearer data.
              <br />
              Smarter costs.
              <br />
              <span style={{ color: GREEN }}>A more resilient business.</span>
            </h2>
            <p className="mt-6 max-w-xl text-base leading-relaxed text-[#2c352d] sm:text-lg">
              Turn utility bills and scattered spreadsheets into useful sustainability and cost reports. Practical
              support for Malaysian SMEs, without building a complex new system.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => go('sme-book')}
                className={`${linkBtn} text-white shadow-lg shadow-green-900/20 hover:brightness-110`}
                style={{ background: GREEN }}
              >
                Explore a paid pilot
                <ArrowRight className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => go('sme-approach')}
                className={`${linkBtn} border border-[#cfd8cf] bg-white text-[#1b221c] hover:bg-[#eef3ee]`}
              >
                How we help
              </button>
            </div>
            <p className="mt-6 text-xs text-[#3b463c] sm:text-sm">
              Built for manufacturers, suppliers and everyday SME operations.
            </p>
          </Reveal>

          <Reveal className="lg:col-span-6" delay={150}>
            <div className="relative mx-auto max-w-xl">
              <div className="overflow-hidden rounded-b-[2rem] rounded-t-[6rem] shadow-xl shadow-green-900/10">
                <img
                  src="/images/sme_hero.jpg"
                  alt="A business owner reviewing her energy, water and cost reports on a laptop"
                  className="aspect-[4/3.3] w-full object-cover"
                  loading="lazy"
                />
              </div>
              <div className="relative z-10 mx-4 -mt-14 rounded-2xl border border-[#e1e7e1] bg-white p-5 shadow-lg sm:mx-8">
                <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.22em]" style={{ color: GREEN }}>
                  From records to decisions
                </p>
                <p className="text-xl font-medium sm:text-2xl">Energy. Water. Waste. Costs.</p>
                <p className="mt-1 text-sm text-[#3b463c]">One practical view of what matters to your business.</p>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* promises */}
      <section className="border-y border-[#e1e7e1] bg-[#eff1ee] px-5 py-7 sm:px-10">
        <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-center">
          <p className="text-lg leading-snug sm:text-xl">
            Small-business needs.
            <br />
            Straightforward promises.
          </p>
          <ul className="flex flex-wrap gap-x-8 gap-y-2 text-sm text-[#2c352d]">
            {PROMISES.map((p) => (
              <li key={p} className="flex items-center gap-2">
                <Check className="h-4 w-4" style={{ color: GREEN }} />
                {p}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* approach */}
      <section id="sme-approach" className="scroll-mt-32 px-5 py-14 sm:px-10 sm:py-20">
        <div className="grid gap-12 lg:grid-cols-12">
          <Reveal className="lg:col-span-5">
            <Eyebrow>A practical path forward</Eyebrow>
            <h3 className="text-4xl font-semibold leading-[1.08] tracking-tight sm:text-5xl">
              Start with what
              <br />
              you already have.
            </h3>
            <p className="mt-6 max-w-md text-base leading-relaxed text-[#2c352d]">
              You do not need an in-house analyst to get started. We help organise your records, understand your
              baseline and decide what deserves attention next.
            </p>
            <blockquote className="mt-8 max-w-md border-l-2 pl-5 text-[15px] leading-relaxed text-[#2c352d]" style={{ borderColor: GREEN }}>
              Receiving a sustainability questionnaire from a customer or bank? Start by identifying the evidence you
              have—and the information still missing.
            </blockquote>
          </Reveal>

          <div className="lg:col-span-7">
            {STEPS.map((s, i) => (
              <Reveal key={s.n} delay={i * 90}>
                <div className={`flex gap-5 py-7 sm:gap-8 ${i > 0 ? 'border-t border-[#dfe5df]' : ''}`}>
                  <span className="pt-1 text-2xl font-light tabular-nums" style={{ color: GREEN }}>
                    {s.n}
                  </span>
                  <div>
                    <h4 className="text-xl font-semibold sm:text-2xl">{s.title}</h4>
                    <p className="mt-3 text-[15px] leading-relaxed text-[#2c352d] sm:text-base">{s.body}</p>
                  </div>
                </div>
              </Reveal>
            ))}
            <p className="mt-4 border-t border-[#dfe5df] pt-5 text-xs leading-relaxed text-[#3b463c] sm:text-[13px]">
              {DISCLAIMER}
            </p>
          </div>
        </div>
      </section>

      {/* why now (new, from public sources) */}
      <section id="sme-why" className="scroll-mt-32 bg-[#eff1ee] px-5 py-14 sm:px-10 sm:py-20">
        <Reveal>
          <Eyebrow>Why start now</Eyebrow>
          <h3 className="max-w-2xl text-3xl font-semibold leading-tight tracking-tight sm:text-5xl">
            Larger customers are already asking.
          </h3>
          <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-[#2c352d] sm:text-base">
            The records behind these requests are what we help you organise.
          </p>
        </Reveal>
        <div className="mt-9 grid gap-5 md:grid-cols-2">
          {WHY.map((w, i) => (
            <Reveal key={w.title} delay={i * 80}>
              <div className="flex h-full flex-col rounded-3xl border border-[#dfe5df] bg-white p-6 sm:p-7">
                <h4 className="text-lg font-semibold leading-snug sm:text-xl">{w.title}</h4>
                <p className="mt-3 flex-1 text-[15px] leading-relaxed text-[#2c352d]">{w.body}</p>
                <a
                  href={w.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold hover:underline"
                  style={{ color: GREEN }}
                >
                  Source: {w.source}
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              </div>
            </Reveal>
          ))}
        </div>
        <p className="mt-6 max-w-3xl text-xs leading-relaxed text-[#3b463c]">
          Sources checked October 2026. Programmes and rules change, so confirm the current position before relying on
          any of this. This is general information, not legal advice.
        </p>
      </section>

      {/* starter checklist (new) */}
      <section id="sme-check" className="scroll-mt-32 bg-white px-5 py-14 sm:px-10 sm:py-20">
        <Reveal>
          <Eyebrow>Try it · Starter check</Eyebrow>
          <h3 className="max-w-2xl text-3xl font-semibold leading-tight tracking-tight sm:text-5xl">
            What do you already have?
          </h3>
          <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-[#2c352d] sm:text-base">
            Tick the records you can find today. These are the kinds of records customers commonly ask about. We turn your answers into a message you can send us. This is a quick
            self-check, not an assessment or an audit.
          </p>
        </Reveal>

        <div className="mt-9 grid gap-6 lg:grid-cols-12">
          <div className="space-y-3 lg:col-span-7">
            {RECORDS.map((r) => {
              const on = !!have[r.id];
              return (
                <button
                  key={r.id}
                  type="button"
                  role="checkbox"
                  aria-checked={on}
                  onClick={() => setHave((h) => ({ ...h, [r.id]: !h[r.id] }))}
                  className={`flex w-full items-center gap-4 rounded-2xl border px-4 py-3.5 text-left text-[15px] transition sm:text-base ${
                    on ? 'border-[#2f7d3a] bg-[#eef6ee]' : 'border-[#dfe5df] bg-[#fafcfa] hover:border-[#b9c8b9]'
                  }`}
                >
                  <span
                    className={`flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-md border transition ${
                      on ? 'border-[#2f7d3a] bg-[#2f7d3a] text-white' : 'border-[#b9c8b9] bg-white text-transparent'
                    }`}
                  >
                    <Check className="h-4 w-4" />
                  </span>
                  {r.label}
                </button>
              );
            })}

            <div className="rounded-2xl border border-[#dfe5df] bg-[#fafcfa] px-4 py-4">
              <p className="mb-3 text-[15px] sm:text-base">Do you need to answer a customer or bank sustainability questionnaire?</p>
              <div className="flex gap-2">
                {[
                  ['Yes', true],
                  ['Not right now', false],
                ].map(([label, val]) => {
                  const active = questionnaire === val;
                  return (
                    <button
                      key={String(label)}
                      type="button"
                      aria-pressed={active}
                      onClick={() => setQuestionnaire(active ? null : (val as boolean))}
                      className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
                        active ? 'border-[#2f7d3a] bg-[#2f7d3a] text-white' : 'border-[#cfd8cf] bg-white hover:bg-[#eef3ee]'
                      }`}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <aside className="lg:col-span-5">
            <div className="rounded-3xl border border-[#dfe5df] bg-[#f3f7f3] p-6 sm:p-7 lg:sticky lg:top-40">
              <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.22em]" style={{ color: GREEN }}>
                Your starting picture
              </p>
              <p className="text-3xl font-semibold tabular-nums">
                {haveList.length} <span className="text-lg font-normal text-[#3b463c]">of {RECORDS.length} records</span>
              </p>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-[#dfe8df]">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${(haveList.length / RECORDS.length) * 100}%`, background: GREEN }}
                />
              </div>
              <p className="mt-5 text-sm font-semibold">Still to find</p>
              <p className="mt-1 text-sm leading-relaxed text-[#2c352d]">
                {missingList.length ? missingList.join(' · ') : `Nothing: you have all ${RECORDS.length} starting records.`}
              </p>
              {questionnaire === true && (
                <p className="mt-4 rounded-xl bg-white px-3 py-2.5 text-sm text-[#2c352d]">
                  We can help you organise the evidence you have for your questionnaire and show what is still missing.
                </p>
              )}
              <a
                href={wa(checklistMessage)}
                target="_blank"
                rel="noopener noreferrer"
                className={`${linkBtn} mt-6 w-full bg-[#1fa855] text-white shadow-lg shadow-green-900/20 hover:bg-[#1a9549]`}
              >
                <MessageCircle className="h-5 w-5" />
                Send this on WhatsApp
              </a>
              <p className="mt-3 text-center text-[11px] text-[#3b463c]">Opens WhatsApp with your answers already written.</p>
            </div>
          </aside>
        </div>
      </section>

      {/* pricing */}
      <section id="sme-pricing" className="scroll-mt-32 bg-[#eff1ee] px-5 pb-8 pt-14 sm:px-10 sm:pb-10 sm:pt-20">
        <Reveal className="mb-10 flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
          <div>
            <Eyebrow>Pilot pricing guide</Eyebrow>
            <h3 className="text-3xl font-semibold tracking-tight sm:text-5xl lg:whitespace-nowrap lg:text-[2.7rem]">Start small. Build as needed.</h3>
          </div>
          <p className="max-w-md text-sm leading-relaxed text-[#2c352d] sm:text-[15px] lg:max-w-sm">
            These are proposed pilot ranges, not confirmed quotes. Final scope and pricing depend on your data and
            reporting needs.
          </p>
        </Reveal>

        <div className="overflow-hidden rounded-3xl border border-[#dfe5df] bg-[#f6f8f6]">
          {PRICING.map((p, i) => (
            <Reveal key={p.name} delay={i * 80}>
              <div
                className={`flex flex-col gap-4 px-6 py-7 sm:flex-row sm:items-center sm:justify-between sm:px-10 ${
                  i > 0 ? 'border-t border-[#dfe5df]' : ''
                }`}
              >
                <div className="max-w-lg">
                  <h4 className="text-xl font-medium sm:text-2xl">{p.name}</h4>
                  <p className="mt-1.5 text-[15px] text-[#2c352d]">{p.body}</p>
                  <p className="mt-1 text-[13px] leading-relaxed text-[#3b463c]">{p.detail}</p>
                  <a
                    href={wa(`Hi Sapotlokal Resources, I would like to ask about: ${p.name} (${p.price}, ${p.unit.toLowerCase()}).`)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold hover:underline"
                    style={{ color: GREEN }}
                  >
                    <MessageCircle className="h-4 w-4" />
                    Ask about this
                  </a>
                </div>
                <div className="sm:text-right">
                  <p className="text-2xl font-semibold tabular-nums sm:text-3xl">{p.price}</p>
                  <p className="text-sm text-[#3b463c]">{p.unit}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>

        {FOUNDING.open && (
          <Reveal className="mt-6">
            <div className="flex flex-col gap-5 rounded-3xl border border-[#b9d4bb] bg-[#e8f3e9] p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
              <div className="max-w-xl">
                <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.22em]" style={{ color: GREEN }}>
                  Founding client offer
                </p>
                <p className="text-xl font-semibold sm:text-2xl">
                  Our first {FOUNDING.places} SME clients get {FOUNDING.discount}% off any package.
                </p>
                <p className="mt-2 text-[14px] leading-relaxed text-[#2c352d]">
                  In return, we ask for a short, honest testimonial and, only with your approval, permission to show an
                  anonymised sample report. One package per client. We agree the scope first.
                </p>
              </div>
              <a
                href={wa(`Hi Sapotlokal Resources, I would like to ask about the founding client offer (${FOUNDING.discount}% off).`)}
                target="_blank"
                rel="noopener noreferrer"
                className={`${linkBtn} flex-shrink-0 text-white hover:brightness-110`}
                style={{ background: GREEN }}
              >
                <MessageCircle className="h-5 w-5" />
                Ask about this offer
              </a>
            </div>
          </Reveal>
        )}
      </section>

      {/* pricing context */}
      <div className="bg-[#eff1ee] px-5 pb-14 sm:px-10 sm:pb-20">
        <p className="max-w-3xl text-[13px] leading-relaxed text-[#3b463c] sm:text-sm">
          For comparison, a news report puts a professional carbon audit or ISO certification for an ordinary SME at
          RM20,000–50,000.{' '}
          <a
            href="https://www.thevibes.com/articles/business/116606/smes-hampered-under-mounting-esg-demands"
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold hover:underline"
            style={{ color: GREEN }}
          >
            Source: The Vibes
          </a>
          . Those are a different, larger step. This pilot helps you organise your records first and does not replace an
          audit or a certification.
        </p>
      </div>

      {/* book */}
      <section id="sme-book" className="scroll-mt-32 px-5 py-14 sm:px-10 sm:py-20">
        <Reveal>
          <div className="grid gap-8 lg:grid-cols-12 lg:items-end">
            <div className="lg:col-span-6">
              <Eyebrow>Your next step</Eyebrow>
              <h3 className="text-4xl font-semibold leading-[1.08] tracking-tight sm:text-5xl">
                Make your next report
                <br />a useful one.
              </h3>
            </div>
            <p className="text-[15px] leading-relaxed text-[#2c352d] sm:text-base lg:col-span-6 lg:col-start-7">
              Start with a fixed-scope assessment. Bring your recent utility bills and any customer reporting requests;
              we will help identify a practical starting point. Select an available service below to begin.
            </p>
          </div>

          <div className="mt-9 max-w-xl rounded-3xl border border-[#dfe5df] bg-white p-6 shadow-sm sm:p-8">
            <h4 className="text-xl font-medium sm:text-2xl">SME Sustainability Reporting Starter</h4>
            <p className="mt-2 text-[15px] leading-relaxed text-[#2c352d]">
              AI-assisted sustainability report drafting for Malaysian SMEs, grounded in your own data.
            </p>
            <p className="mt-5 text-3xl font-bold">RM600</p>
            <p className="text-xs text-[#3b463c]">One-off. We agree the scope with you first.</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <a
                href={wa('Hi Sapotlokal Resources, I would like to ask about the SME Sustainability Reporting Starter (RM600).')}
                target="_blank"
                rel="noopener noreferrer"
                className={`${linkBtn} text-white hover:brightness-110`}
                style={{ background: GREEN }}
              >
                <MessageCircle className="h-4 w-4" />
                Ask on WhatsApp
              </a>
            </div>
            <button
              type="button"
              onClick={() => onContact('Branding Strategy')}
              className="mt-5 text-sm font-semibold hover:underline"
              style={{ color: GREEN }}
            >
              Prefer to fill in the full enquiry form?
            </button>
          </div>
        </Reveal>
      </section>

      {/* FAQ (new) */}
      <section id="sme-faq" className="scroll-mt-32 bg-white px-5 py-14 sm:px-10 sm:py-20">
        <Reveal>
          <Eyebrow>Straight answers</Eyebrow>
          <h3 className="mb-8 text-3xl font-semibold tracking-tight sm:text-5xl">Questions we hear first</h3>
        </Reveal>
        <div className="max-w-3xl divide-y divide-[#e1e7e1] border-y border-[#e1e7e1]">
          {FAQ.map((item, i) => {
            const open = openFaq === i;
            return (
              <div key={item.q}>
                <button
                  type="button"
                  aria-expanded={open}
                  onClick={() => setOpenFaq(open ? null : i)}
                  className="flex w-full items-center justify-between gap-4 py-5 text-left text-base font-medium sm:text-lg"
                >
                  {item.q}
                  <ChevronDown className={`h-5 w-5 flex-shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} style={{ color: GREEN }} />
                </button>
                {open && <p className="pb-5 pr-8 text-[15px] leading-relaxed text-[#2c352d]">{item.a}</p>}
              </div>
            );
          })}
        </div>
      </section>

      {/* closing call to action + footer */}
      <section className="px-5 py-12 sm:px-10">
        <div className="flex flex-col items-start justify-between gap-5 rounded-3xl p-7 text-white sm:flex-row sm:items-center sm:p-9" style={{ background: GREEN }}>
          <div>
            <p className="text-2xl font-semibold sm:text-3xl">Ready to find your starting point?</p>
            <p className="mt-1 text-sm text-white/85">Tell us what you have today. We will suggest a practical first step.</p>
          </div>
          <a
            href={wa('Hi Sapotlokal Resources, I would like to explore the SME sustainability and cost reporting pilot.')}
            target="_blank"
            rel="noopener noreferrer"
            className={`${linkBtn} bg-white text-[#1b221c] hover:bg-[#eef6ee]`}
          >
            <MessageCircle className="h-5 w-5" style={{ color: '#1fa855' }} />
            Chat on WhatsApp
          </a>
        </div>
      </section>

      <footer className="border-t border-[#e1e7e1] bg-[#eff1ee] px-5 py-9 sm:px-10">
        <div className="flex flex-col justify-between gap-6 sm:flex-row">
          <div>
            <p className="text-lg font-semibold tracking-tight">sapotlokal resources</p>
            <p className="mt-1 text-sm text-[#2c352d]">Practical data. Better decisions. Built for Malaysian SMEs.</p>
          </div>
          <nav className="flex flex-wrap items-start gap-x-6 gap-y-2 text-sm" aria-label="Footer">
            {[
              ['Our approach', 'sme-approach'],
              ['Pricing guide', 'sme-pricing'],
              ['Book a service', 'sme-book'],
            ].map(([label, id]) => (
              <button key={id} type="button" onClick={() => go(id)} className="hover:underline">
                {label}
              </button>
            ))}
          </nav>
        </div>
      </footer>
    </div>
  );
};
