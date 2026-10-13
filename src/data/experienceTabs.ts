import { ServiceCategory } from '../types';

/**
 * The seven selectable options shown in the pop-up menu.
 * To change a button's wording or its video, edit it here (video files live in /public/videos/).
 */
export type TabId = 'ugc' | 'graphic' | 'presenter' | 'editing' | 'pointaken' | 'powerpoint' | 'crm' | 'contact';
export type TabKind = 'video' | 'crm' | 'contact';

export interface ExperienceTab {
  id: TabId;
  letter: string;
  /** short label on the button */
  label: string;
  /** descriptive headline on the button and above the content */
  title: string;
  /** one short line of support text on the button */
  blurb: string;
  kind: TabKind;
  /** video file for video tabs */
  videoSrc?: string;
  /** width / height of the video, so the player is the right shape before it loads */
  ratio?: number;
  /** pre-selects this service in the WhatsApp form when the visitor taps Contact after the video */
  service?: ServiceCategory;
  /** accent colour of the button (inspired by the infographic petals) */
  color: string;
  /** label on the small action chip on the button */
  action: string;
}

export const EXPERIENCE_TABS: ExperienceTab[] = [
  {
    id: 'ugc',
    letter: 'A',
    label: 'UGC',
    title: 'AI Creator UGC Reel — Multi-Persona Product Storytelling',
    blurb: 'Scroll-stopping creator-style videos for TikTok & Reels.',
    kind: 'video',
    videoSrc: '/videos/tab_ugc.mp4',
    ratio: 9 / 16,
    service: 'UGC',
    color: '#D1432B',
    action: 'Watch reel',
  },
  {
    id: 'graphic',
    letter: 'B',
    label: 'Graphic Design',
    title: 'Poster & Editorial Design — Bold Typography That Stops the Scroll',
    blurb: 'Posters, covers and brand visuals with real impact.',
    kind: 'video',
    videoSrc: '/videos/tab_graphic_design.mp4',
    ratio: 9 / 16,
    service: 'Graphic Design',
    color: '#E8801F',
    action: 'Watch designs',
  },
  {
    id: 'presenter',
    letter: 'C',
    label: 'Model Presenter',
    title: 'AI Model Presenters — On-Camera Spokespeople for Your Brand',
    blurb: 'A friendly face that presents your product on camera.',
    kind: 'video',
    videoSrc: '/videos/tab_model_presenter.mp4',
    ratio: 9 / 16,
    service: 'Social Content',
    color: '#8E9A1E',
    action: 'Meet presenters',
  },
  {
    id: 'editing',
    letter: 'D',
    label: 'Video Editing',
    title: 'Cinematic Video Editing — From Raw Footage to Polished Story',
    blurb: 'Pacing, colour and sound that keep viewers watching.',
    kind: 'video',
    videoSrc: '/videos/tab_video_editing.mp4',
    ratio: 9 / 16,
    service: 'Video Editing',
    color: '#2F7A93',
    action: 'Watch edit',
  },
  {
    id: 'pointaken',
    letter: 'E',
    label: 'Pointaken Presentation',
    title: 'Pointaken Presentation Studio — Markdown Decks for Modern Creators',
    blurb: 'Write your thoughts, get a gorgeous deck instantly.',
    kind: 'video',
    videoSrc: '/videos/tab_pointaken_presentation.mp4',
    ratio: 16 / 9,
    service: 'Graphic Design',
    color: '#7B4FA6',
    action: 'Watch demo',
  },
  {
    id: 'powerpoint',
    letter: 'F',
    label: 'PowerPoint',
    title: 'PowerPoint Presentation Design — Pitch Decks, Templates & Animated Slides',
    blurb: 'Professional decks that look polished and tell your story.',
    kind: 'video',
    videoSrc: '/videos/tab_powerpoint.mp4',
    ratio: 1,
    service: 'Graphic Design',
    color: '#C2377A',
    action: 'Watch demo',
  },
  {
    id: 'crm',
    letter: 'G',
    label: 'CRM',
    title: 'Custom CRM Dashboard — Capture, Track & Close Your Leads',
    blurb: 'Try a working demo of a CRM built for your business.',
    kind: 'crm',
    service: 'Website Building',
    color: '#4B5FD0',
    action: 'Open demo',
  },
  {
    id: 'contact',
    letter: 'H',
    label: 'Contact',
    title: 'Tell Us About Your Project — Reply Comes Straight to WhatsApp',
    blurb: 'Fill in a short form and send it to us on WhatsApp.',
    kind: 'contact',
    color: '#1FA855',
    action: 'Open form',
  },
];

export const getTab = (id: TabId): ExperienceTab => EXPERIENCE_TABS.find((t) => t.id === id) as ExperienceTab;
