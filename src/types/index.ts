export type ServiceCategory =
  | 'Video Editing'
  | 'Website Building'
  | 'Social Content'
  | 'Graphic Design'
  | 'UGC'
  | 'Branding Strategy';

export interface PortfolioItem {
  id: string;
  title: string;
  client: string;
  category: ServiceCategory;
  description: string;
  mediaType: 'video' | 'image' | 'website';
  videoUrl?: string; // Valid public .mp4 video URL
  imageUrl?: string; // Thumbnail preview image
  images?: string[]; // Multiple images for interactive showcase carousel
  websiteUrl?: string; // e.g. https://yourdomain.com
  mediaUrl: string; // URL or base64 data
  posterUrl?: string;
  metrics: string; // e.g. "+380% Viral Reach · 2.4M Views"
  tags: string[];
  featured?: boolean;
  aspectRatio?: '16:9' | '9:16' | '4:3' | '1:1';
}

export type LeadStage =
  | 'New Inquiry'
  | 'Discovery'
  | 'Proposal'
  | 'Negotiation'
  | 'Won / Active'
  | 'Completed';

export interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  service: ServiceCategory | 'Full Growth Retainer' | 'Consulting Only';
  budget: string;
  stage: LeadStage;
  score: 'High Intent' | 'Warm' | 'Standard';
  notes: string;
  createdAt: string;
  source: 'Website Form' | 'QR Code' | 'WhatsApp Direct' | 'Referral';
}

export interface ClientCampaign {
  id: string;
  title: string;
  type: string;
  deliverables: string;
  impressions: string;
  engagement: string;
  leadsGenerated: number;
  status: 'Live & Scaling' | 'Optimizing' | 'Completed';
}

export interface ClientReport {
  id: string;
  clientName: string;
  brandTagline: string;
  industry: string;
  period: string;
  kpis: {
    totalImpressions: string;
    impressionsGrowth: string;
    videoViews: string;
    engagementRate: string;
    inboundLeads: number;
    roas: string;
    revenuePipeline: string;
  };
  campaigns: ClientCampaign[];
  growthHighlights: string[];
}

export interface SiteConfig {
  companyName: string;
  tagline: string;
  shortBio: string;
  address: string;
  phone: string;
  whatsappNumber: string;
  email: string;
  heroHeadline: string;
  heroSubheadline: string;
  experienceYears: number;
  completedProjects: number;
  clientSatisfaction: number;
  mediaViewsGenerated: string;
  heroVideoUrl?: string;
  heroVideoPoster?: string;
  heroVideoTitle?: string;
  heroVideoDuration?: string;
  heroVideoBadge?: string;
  servicesVideoUrl?: string;
  servicesVideoPoster?: string;
  servicesVideoTitle?: string;
  servicesVideoDuration?: string;
  servicesVideoBadge?: string;
  intro916VideoUrl?: string;
  intro916VideoPoster?: string;
  intro916VideoTitle?: string;
  intro916VideoBadge?: string;
}
