import React, { useState } from 'react';
import { 
  Users, 
  Search, 
  Plus, 
  Download, 
  MessageSquare, 
  Phone, 
  Building, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  TrendingUp,
  LayoutGrid,
  List,
  ChevronDown
} from 'lucide-react';
import { Lead, LeadStage, ServiceCategory } from '../types';

interface CRMSectionProps {
  leads: Lead[];
  onUpdateLeads: (leads: Lead[]) => void;
  onAddLead: (lead: Omit<Lead, 'id' | 'createdAt'>) => void;
}

const STAGES: LeadStage[] = [
  'New Inquiry',
  'Discovery',
  'Proposal',
  'Negotiation',
  'Won / Active',
  'Completed',
];

export const CRMSection: React.FC<CRMSectionProps> = ({
  leads,
  onUpdateLeads,
  onAddLead,
}) => {
  const [viewMode, setViewMode] = useState<'kanban' | 'table'>('kanban');
  const [searchQuery, setSearchQuery] = useState('');
  const [stageFilter, setStageFilter] = useState<string>('All');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // New lead form state
  const [newLeadName, setNewLeadName] = useState('');
  const [newLeadCompany, setNewLeadCompany] = useState('');
  const [newLeadPhone, setNewLeadPhone] = useState('');
  const [newLeadEmail, setNewLeadEmail] = useState('');
  const [newLeadService, setNewLeadService] = useState<ServiceCategory>('Video Editing');
  const [newLeadBudget, setNewLeadBudget] = useState('RM 5,000 - RM 10,000');
  const [newLeadNotes, setNewLeadNotes] = useState('');
  const [newLeadScore, setNewLeadScore] = useState<'High Intent' | 'Warm' | 'Standard'>('High Intent');

  // Filter leads
  const filteredLeads = leads.filter((l) => {
    const matchesSearch =
      l.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.service.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.phone.includes(searchQuery);

    const matchesStage = stageFilter === 'All' || l.stage === stageFilter;
    return matchesSearch && matchesStage;
  });

  // Change stage for a lead
  const handleStageChange = (leadId: string, newStage: LeadStage) => {
    const updated = leads.map((l) => (l.id === leadId ? { ...l, stage: newStage } : l));
    onUpdateLeads(updated);
  };

  // Quick WhatsApp Follow-up link
  const openWhatsAppFollowUp = (lead: Lead) => {
    // Sanitize phone number (Malaysia default: prepend 60 if starts with 0)
    let cleanPhone = lead.phone.replace(/[^0-9]/g, '');
    if (cleanPhone.startsWith('0')) {
      cleanPhone = '6' + cleanPhone;
    }
    const message = encodeURIComponent(
      `Hello ${lead.name}! This is Sapotlokal Resources reaching out regarding your business growth & ${lead.service} inquiry for ${lead.company}. When is a good time for a quick 10-minute discovery call?`
    );
    window.open(`https://wa.me/${cleanPhone}?text=${message}`, '_blank');
  };

  // Export CSV file
  const handleExportCSV = () => {
    const headers = ['ID', 'Name', 'Company', 'Phone', 'Email', 'Service', 'Budget', 'Stage', 'Score', 'Source', 'Date', 'Notes'];
    const rows = leads.map((l) => [
      l.id,
      `"${l.name}"`,
      `"${l.company}"`,
      `"${l.phone}"`,
      `"${l.email}"`,
      `"${l.service}"`,
      `"${l.budget}"`,
      `"${l.stage}"`,
      `"${l.score}"`,
      `"${l.source}"`,
      `"${l.createdAt}"`,
      `"${(l.notes || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `sapotlokal-leads-${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Add lead submit
  const handleCreateLead = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLeadName || !newLeadPhone) return;

    onAddLead({
      name: newLeadName,
      company: newLeadCompany || 'Individual Enterprise',
      phone: newLeadPhone,
      email: newLeadEmail || 'lead@client.my',
      service: newLeadService,
      budget: newLeadBudget,
      stage: 'New Inquiry',
      score: newLeadScore,
      notes: newLeadNotes,
      source: 'Website Form',
    });

    // Reset
    setNewLeadName('');
    setNewLeadCompany('');
    setNewLeadPhone('');
    setNewLeadEmail('');
    setNewLeadNotes('');
    setIsAddModalOpen(false);
  };

  return (
    <section id="crm" className="py-24 bg-slate-950 border-t border-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-12 gap-6">
          <div className="max-w-3xl">
            <div className="flex items-center gap-2 text-xs font-semibold tracking-wider uppercase text-amber-400 mb-2">
              <TrendingUp className="w-4 h-4" />
              <span>Sapotlokal Integrated CRM Engine</span>
            </div>
            <h2
              className="text-3xl sm:text-5xl font-extrabold font-display tracking-tight text-white"
              style={{ textWrap: 'balance' }}
            >
              Client Lead Tracking & Pipeline Management
            </h2>
            <p className="text-sm text-slate-300 mt-3 leading-relaxed">
              Every prospective inquiry captured from website forms, WhatsApp links, and QR scans feeds directly into this live CRM. Track conversion velocity, lead intent scores, and 1-click WhatsApp follow-ups.
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold bg-amber-400 hover:bg-amber-300 text-slate-950 rounded-xl transition-colors shadow-lg shadow-amber-500/10"
            >
              <Plus className="w-4 h-4" />
              <span>Add Lead</span>
            </button>

            <button
              onClick={handleExportCSV}
              className="flex items-center gap-1.5 px-3.5 py-2.5 text-xs font-semibold bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 rounded-xl transition-colors"
              title="Export all leads as CSV spreadsheet"
            >
              <Download className="w-4 h-4" />
              <span>Export CSV</span>
            </button>

            {/* View switcher */}
            <div className="flex items-center bg-slate-900 border border-slate-800 rounded-xl p-1">
              <button
                onClick={() => setViewMode('kanban')}
                className={`p-1.5 rounded-lg transition-colors ${
                  viewMode === 'kanban' ? 'bg-amber-400 text-slate-950' : 'text-slate-400 hover:text-white'
                }`}
                title="Kanban Pipeline Board"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded-lg transition-colors ${
                  viewMode === 'table' ? 'bg-amber-400 text-slate-950' : 'text-slate-400 hover:text-white'
                }`}
                title="Spreadsheet Table View"
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Filter & Metric Bar */}
        <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-2xl mb-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            {/* Search Input */}
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search leads, company, phone..."
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-950 border border-slate-700/80 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
              />
            </div>

            {/* Stage Filter */}
            <div className="flex items-center gap-1.5 text-xs">
              <span className="text-slate-400">Stage:</span>
              <select
                value={stageFilter}
                onChange={(e) => setStageFilter(e.target.value)}
                className="bg-slate-950 border border-slate-700 text-white rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:border-amber-400"
              >
                <option value="All">All Stages ({leads.length})</option>
                {STAGES.map((st) => (
                  <option key={st} value={st}>
                    {st} ({leads.filter((l) => l.stage === st).length})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="flex items-center gap-6 text-xs text-slate-400 w-full md:w-auto justify-end border-t md:border-t-0 pt-3 md:pt-0 border-slate-800">
            <div>
              <span className="text-slate-500 block text-[10px]">TOTAL LEADS</span>
              <span className="text-white font-bold font-mono tabular-nums text-sm">
                {leads.length} Active
              </span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px]">HIGH INTENT</span>
              <span className="text-amber-400 font-bold font-mono tabular-nums text-sm">
                {leads.filter((l) => l.score === 'High Intent').length} Hot
              </span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px]">WON CONTRACTS</span>
              <span className="text-emerald-400 font-bold font-mono tabular-nums text-sm">
                {leads.filter((l) => l.stage === 'Won / Active').length} Retainers
              </span>
            </div>
          </div>
        </div>

        {/* KANBAN VIEW */}
        {viewMode === 'kanban' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 overflow-x-auto pb-4">
            {STAGES.map((stage) => {
              const stageLeads = filteredLeads.filter((l) => l.stage === stage);

              return (
                <div
                  key={stage}
                  className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-3 flex flex-col min-w-[220px]"
                >
                  {/* Column Header */}
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800/80 mb-3">
                    <span className="text-xs font-bold text-slate-200 font-display">
                      {stage}
                    </span>
                    <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-400">
                      {stageLeads.length}
                    </span>
                  </div>

                  {/* Cards in column */}
                  <div className="space-y-3 flex-1">
                    {stageLeads.map((lead) => (
                      <div
                        key={lead.id}
                        className="bg-slate-900/90 border border-slate-800 hover:border-slate-700 p-3.5 rounded-xl shadow-sm space-y-2.5 transition-colors group"
                      >
                        {/* Top row */}
                        <div className="flex items-start justify-between gap-1">
                          <span className="text-xs font-bold text-white group-hover:text-amber-300 transition-colors">
                            {lead.name}
                          </span>
                          <span
                            className={`text-[9px] font-semibold px-1.5 py-0.5 rounded font-mono ${
                              lead.score === 'High Intent'
                                ? 'bg-amber-400/20 text-amber-300 border border-amber-400/30'
                                : 'bg-slate-800 text-slate-400'
                            }`}
                          >
                            {lead.score}
                          </span>
                        </div>

                        {/* Company & service */}
                        <div className="text-[11px] text-slate-300 flex items-center gap-1.5">
                          <Building className="w-3 h-3 text-slate-500 flex-shrink-0" />
                          <span className="truncate">{lead.company}</span>
                        </div>

                        <div className="text-[10px] text-amber-400/90 font-medium bg-slate-950/60 px-2 py-1 rounded border border-slate-800">
                          {lead.service}
                        </div>

                        <div className="text-[10px] text-slate-400 font-mono">
                          Est: {lead.budget}
                        </div>

                        {lead.notes && (
                          <p className="text-[11px] text-slate-400 italic line-clamp-2 pt-1 border-t border-slate-800/60">
                            "{lead.notes}"
                          </p>
                        )}

                        {/* Bottom Actions */}
                        <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between gap-2">
                          <button
                            onClick={() => openWhatsAppFollowUp(lead)}
                            className="flex items-center gap-1 text-[10px] font-semibold text-emerald-400 hover:text-emerald-300 py-1 px-2 rounded bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 transition-colors"
                            title="Open WhatsApp chat with prefilled message"
                          >
                            <MessageSquare className="w-3 h-3" />
                            <span>WhatsApp</span>
                          </button>

                          {/* Stage shift dropdown */}
                          <div className="relative">
                            <select
                              value={lead.stage}
                              onChange={(e) => handleStageChange(lead.id, e.target.value as LeadStage)}
                              className="text-[10px] bg-slate-950 text-slate-300 border border-slate-700 rounded px-1.5 py-1 focus:outline-none focus:border-amber-400 cursor-pointer"
                            >
                              {STAGES.map((s) => (
                                <option key={s} value={s}>
                                  Move: {s}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>
                      </div>
                    ))}

                    {stageLeads.length === 0 && (
                      <div className="p-4 text-center border border-dashed border-slate-800/60 rounded-lg text-[11px] text-slate-600">
                        Empty stage
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* TABLE VIEW */}
        {viewMode === 'table' && (
          <div className="overflow-x-auto bg-slate-950 border border-slate-800 rounded-2xl">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900/80 text-slate-400 border-b border-slate-800 text-[11px] uppercase tracking-wider">
                <tr>
                  <th className="p-3.5 pl-5">Lead / Contact</th>
                  <th className="p-3.5">Company</th>
                  <th className="p-3.5">Service Requested</th>
                  <th className="p-3.5">Budget</th>
                  <th className="p-3.5">Stage</th>
                  <th className="p-3.5">Score</th>
                  <th className="p-3.5">Date</th>
                  <th className="p-3.5 pr-5 text-right">Quick Follow-up</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {filteredLeads.map((lead) => (
                  <tr key={lead.id} className="hover:bg-slate-900/40 transition-colors">
                    <td className="p-3.5 pl-5">
                      <div className="font-semibold text-white">{lead.name}</div>
                      <div className="text-[11px] text-slate-500 font-mono">{lead.phone}</div>
                    </td>
                    <td className="p-3.5 text-slate-300">{lead.company}</td>
                    <td className="p-3.5 font-medium text-amber-300">{lead.service}</td>
                    <td className="p-3.5 font-mono text-slate-400">{lead.budget}</td>
                    <td className="p-3.5">
                      <select
                        value={lead.stage}
                        onChange={(e) => handleStageChange(lead.id, e.target.value as LeadStage)}
                        className="bg-slate-900 border border-slate-700 text-xs text-white rounded px-2 py-1"
                      >
                        {STAGES.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="p-3.5">
                      <span
                        className={`text-[10px] font-mono px-2 py-0.5 rounded ${
                          lead.score === 'High Intent'
                            ? 'bg-amber-400/20 text-amber-300'
                            : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {lead.score}
                      </span>
                    </td>
                    <td className="p-3.5 font-mono text-[11px] text-slate-500">
                      {lead.createdAt}
                    </td>
                    <td className="p-3.5 pr-5 text-right">
                      <button
                        onClick={() => openWhatsAppFollowUp(lead)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 transition-colors"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>WhatsApp Chat</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Add Lead Modal */}
        {isAddModalOpen && (
          <div
            role="dialog"
            aria-modal="true"
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
            onClick={() => setIsAddModalOpen(false)}
          >
            <div
              className="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-lg shadow-2xl text-slate-100"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg font-bold font-display text-white mb-4">
                Record New Business Lead
              </h3>
              <form onSubmit={handleCreateLead} className="space-y-3.5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Lead Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={newLeadName}
                      onChange={(e) => setNewLeadName(e.target.value)}
                      placeholder="e.g. Rachel Tan"
                      className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-700 rounded-lg text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Company
                    </label>
                    <input
                      type="text"
                      value={newLeadCompany}
                      onChange={(e) => setNewLeadCompany(e.target.value)}
                      placeholder="e.g. Cheras Wellness Center"
                      className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-700 rounded-lg text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      required
                      value={newLeadPhone}
                      onChange={(e) => setNewLeadPhone(e.target.value)}
                      placeholder="012-XXXXXXX"
                      className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-700 rounded-lg text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={newLeadEmail}
                      onChange={(e) => setNewLeadEmail(e.target.value)}
                      placeholder="client@domain.my"
                      className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-700 rounded-lg text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Service Category
                    </label>
                    <select
                      value={newLeadService}
                      onChange={(e) => setNewLeadService(e.target.value as ServiceCategory)}
                      className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-700 rounded-lg text-white"
                    >
                      <option value="Video Editing">Video Editing</option>
                      <option value="Social Content">Social Content</option>
                      <option value="Graphic Design">Graphic Design</option>
                      <option value="UGC">UGC (User Generated Content)</option>
                      <option value="Branding Strategy">Branding Strategy</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Intent Score
                    </label>
                    <select
                      value={newLeadScore}
                      onChange={(e) => setNewLeadScore(e.target.value as any)}
                      className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-700 rounded-lg text-white"
                    >
                      <option value="High Intent">High Intent (Hot)</option>
                      <option value="Warm">Warm Prospect</option>
                      <option value="Standard">Standard Nurture</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Estimated Budget
                  </label>
                  <input
                    type="text"
                    value={newLeadBudget}
                    onChange={(e) => setNewLeadBudget(e.target.value)}
                    placeholder="e.g. RM 5,000 / month"
                    className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-700 rounded-lg text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Discovery Notes
                  </label>
                  <textarea
                    rows={3}
                    value={newLeadNotes}
                    onChange={(e) => setNewLeadNotes(e.target.value)}
                    placeholder="Specific requirements, timeline, current bottlenecks..."
                    className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-700 rounded-lg text-white"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-3">
                  <button
                    type="button"
                    onClick={() => setIsAddModalOpen(false)}
                    className="px-4 py-2 text-xs text-slate-400 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 text-xs font-semibold bg-amber-400 text-slate-950 rounded-lg hover:bg-amber-300"
                  >
                    Save to CRM Pipeline
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
