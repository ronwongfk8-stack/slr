import { SiteConfig, PortfolioItem, Lead, ClientReport } from '../types';
import { initialSiteConfig, initialPortfolioItems, initialLeads, initialClientReports } from '../data/initialData';
import { 
  saveMediaBlob, 
  getMediaBlob, 
  getMediaBlobMeta,
  deleteMediaBlob, 
  saveConfigToDB, 
  getConfigFromDB,
  findAnyUploadedVideoBlob
} from './mediaDB';

const CONFIG_KEY = 'sapotlokal_site_config';
const PORTFOLIO_KEY = 'sapotlokal_portfolio_items';
const LEADS_KEY = 'sapotlokal_crm_leads';
const REPORTS_KEY = 'sapotlokal_client_reports';
const DATA_VERSION_KEY = 'sapotlokal_data_version';
const CURRENT_DATA_VERSION = 'v13_teepro_showcase_and_larger_ugc';

// Old placeholder sample videos that earlier versions saved into the browser.
// If a returning visitor still has one saved, swap it for the real default video.
const isOldSampleVideoUrl = (url?: string): boolean =>
  !!url && (
    url.includes('bower-media-samples') ||
    url.includes('themarcosdev') ||
    url.includes('mediaelement-files') ||
    url.includes('commondatastorage.googleapis.com')
  );

// In-memory cache of live blob URLs for fast, synchronous rendering during user sessions
const activeVideoBlobUrls = new Map<string, string>();

/**
 * Resolves a reliable, playable video URL for any video element (hero, services, portfolio).
 * If the item has a video stored in IndexedDB, returns an active live ObjectURL.
 */
export async function resolveLiveVideoUrl(itemId?: string, currentUrl?: string): Promise<string> {
  // 1. Check in-memory cache
  if (itemId && activeVideoBlobUrls.has(itemId)) {
    const cached = activeVideoBlobUrls.get(itemId);
    if (cached) return cached;
  }
  if (currentUrl && activeVideoBlobUrls.has(currentUrl)) {
    const cached = activeVideoBlobUrls.get(currentUrl);
    if (cached) return cached;
  }

  // 2. Local public videos (always valid, pristine and fastest)
  if (currentUrl && (currentUrl.startsWith('/videos/') || currentUrl.startsWith('./videos/'))) {
    return currentUrl;
  }

  // 3. Hero Video resolution
  if (itemId === 'hero_video' || currentUrl === 'indexeddb:hero_video_blob' || currentUrl?.includes('hero_video')) {
    try {
      const blob = await getMediaBlob('hero_video_blob') || await findAnyUploadedVideoBlob('hero');
      if (blob && blob.size > 0) {
        const liveUrl = URL.createObjectURL(blob);
        activeVideoBlobUrls.set('hero_video', liveUrl);
        return liveUrl;
      }
    } catch {}
    return '/videos/hero_overview.mp4';
  }

  // 4. Intro 9:16 Video resolution
  if (itemId === 'intro_916_video' || currentUrl === 'indexeddb:intro_916_video_blob' || currentUrl?.includes('intro_916')) {
    try {
      const blob = await getMediaBlob('intro_916_video_blob') || await findAnyUploadedVideoBlob('intro_916');
      if (blob && blob.size > 0) {
        const liveUrl = URL.createObjectURL(blob);
        activeVideoBlobUrls.set('intro_916_video', liveUrl);
        return liveUrl;
      }
    } catch {}
    return '/videos/ugc_creator_reel_9_16.mp4';
  }

  // 5. Services Video resolution
  if (itemId === 'services_video' || currentUrl === 'indexeddb:services_video_blob' || currentUrl?.includes('services_video')) {
    try {
      const blob = await getMediaBlob('services_video_blob') || await findAnyUploadedVideoBlob('services');
      if (blob && blob.size > 0) {
        const liveUrl = URL.createObjectURL(blob);
        activeVideoBlobUrls.set('services_video', liveUrl);
        return liveUrl;
      }
    } catch {}
    return '/videos/corporate_consultancy_16_9.mp4';
  }

  // 6. Query IndexedDB for custom uploaded video by itemId
  if (itemId) {
    try {
      const blob = await getMediaBlob(`portfolio_video_${itemId}`) || await getMediaBlob(itemId);
      if (blob && blob.size > 0) {
        const liveUrl = URL.createObjectURL(blob);
        activeVideoBlobUrls.set(itemId, liveUrl);
        return liveUrl;
      }
    } catch (err) {
      console.warn('[Storage] Failed resolving live video from IndexedDB for', itemId, err);
    }
  }

  // 7. Check if currentUrl is indexeddb:key
  if (currentUrl && currentUrl.startsWith('indexeddb:')) {
    const rawKey = currentUrl.replace('indexeddb:', '').trim();
    try {
      const blob = await getMediaBlob(rawKey);
      if (blob && blob.size > 0) {
        const liveUrl = URL.createObjectURL(blob);
        if (itemId) activeVideoBlobUrls.set(itemId, liveUrl);
        return liveUrl;
      }
    } catch (err) {
      console.warn('[Storage] Failed resolving custom key from IndexedDB:', rawKey, err);
    }
  }

  // 8. If currentUrl is a working http(s) link (not the blocked commondatastorage bucket!)
  if (currentUrl && !currentUrl.startsWith('indexeddb:') && !currentUrl.includes('commondatastorage.googleapis.com')) {
    if (currentUrl.startsWith('blob:')) {
      if (itemId) activeVideoBlobUrls.set(itemId, currentUrl);
      return currentUrl;
    } else if (currentUrl.startsWith('http://') || currentUrl.startsWith('https://')) {
      return currentUrl;
    }
  }

  // 9. Check if ANY custom uploaded video blob exists in the database!
  try {
    const anyBlob = await findAnyUploadedVideoBlob(itemId);
    if (anyBlob && anyBlob.size > 0) {
      const liveUrl = URL.createObjectURL(anyBlob);
      if (itemId) activeVideoBlobUrls.set(itemId, liveUrl);
      return liveUrl;
    }
  } catch {}

  // 10. Guaranteed reliable direct CORS-enabled HTTPS fallback stream
  return itemId === 'proj-4' || currentUrl?.includes('916') || currentUrl?.includes('ugc')
    ? '/videos/ugc_growth_9x16.mp4'
    : itemId === 'proj-6'
      ? '/videos/brand_strategy.mp4'
      : '/videos/commercial_4k_reel_16_9.mp4';
}

export function getSavedSiteConfig(): SiteConfig {
  try {
    const raw = localStorage.getItem(CONFIG_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      // If heroVideoUrl is an internal marker or expired blob URL, use default during synchronous initial render
      let validHeroVideoUrl = parsed.heroVideoUrl;
      if (!validHeroVideoUrl || validHeroVideoUrl.startsWith('indexeddb:') || validHeroVideoUrl.startsWith('blob:') || isOldSampleVideoUrl(validHeroVideoUrl)) {
        validHeroVideoUrl = initialSiteConfig.heroVideoUrl;
      }

      let validServicesVideoUrl = parsed.servicesVideoUrl;
      if (!validServicesVideoUrl || validServicesVideoUrl.startsWith('indexeddb:') || validServicesVideoUrl.startsWith('blob:') || isOldSampleVideoUrl(validServicesVideoUrl)) {
        validServicesVideoUrl = initialSiteConfig.servicesVideoUrl;
      }

      let validIntro916VideoUrl = parsed.intro916VideoUrl;
      if (!validIntro916VideoUrl || validIntro916VideoUrl.startsWith('indexeddb:') || validIntro916VideoUrl.startsWith('blob:') || isOldSampleVideoUrl(validIntro916VideoUrl)) {
        validIntro916VideoUrl = initialSiteConfig.intro916VideoUrl;
      }

      return {
        ...initialSiteConfig,
        ...parsed,
        email: parsed.email || 'sapotlokal.co@gmail.com',
        heroVideoUrl: validHeroVideoUrl,
        heroVideoPoster: parsed.heroVideoPoster !== undefined ? parsed.heroVideoPoster : initialSiteConfig.heroVideoPoster,
        heroVideoTitle: parsed.heroVideoTitle !== undefined ? parsed.heroVideoTitle : initialSiteConfig.heroVideoTitle,
        heroVideoDuration: parsed.heroVideoDuration !== undefined ? parsed.heroVideoDuration : initialSiteConfig.heroVideoDuration,
        heroVideoBadge: parsed.heroVideoBadge !== undefined ? parsed.heroVideoBadge : initialSiteConfig.heroVideoBadge,
        intro916VideoUrl: validIntro916VideoUrl,
        intro916VideoPoster: parsed.intro916VideoPoster !== undefined ? parsed.intro916VideoPoster : initialSiteConfig.intro916VideoPoster,
        intro916VideoTitle: parsed.intro916VideoTitle !== undefined ? parsed.intro916VideoTitle : initialSiteConfig.intro916VideoTitle,
        intro916VideoBadge: parsed.intro916VideoBadge !== undefined ? parsed.intro916VideoBadge : initialSiteConfig.intro916VideoBadge,
        servicesVideoUrl: validServicesVideoUrl,
        servicesVideoPoster: parsed.servicesVideoPoster !== undefined ? parsed.servicesVideoPoster : initialSiteConfig.servicesVideoPoster,
        servicesVideoTitle: parsed.servicesVideoTitle !== undefined ? parsed.servicesVideoTitle : initialSiteConfig.servicesVideoTitle,
        servicesVideoDuration: parsed.servicesVideoDuration !== undefined ? parsed.servicesVideoDuration : initialSiteConfig.servicesVideoDuration,
        servicesVideoBadge: parsed.servicesVideoBadge !== undefined ? parsed.servicesVideoBadge : initialSiteConfig.servicesVideoBadge,
      };
    }
  } catch (err) {
    console.error('Failed reading site config:', err);
  }
  return initialSiteConfig;
}

export function saveSiteConfig(config: SiteConfig): void {
  const sanitizedConfig = { ...config };
  if (sanitizedConfig.heroVideoUrl && (sanitizedConfig.heroVideoUrl.startsWith('data:') || sanitizedConfig.heroVideoUrl.startsWith('blob:'))) {
    sanitizedConfig.heroVideoUrl = 'indexeddb:hero_video_blob';
  }
  if (sanitizedConfig.heroVideoPoster && (sanitizedConfig.heroVideoPoster.startsWith('data:') || sanitizedConfig.heroVideoPoster.startsWith('blob:'))) {
    sanitizedConfig.heroVideoPoster = 'indexeddb:hero_poster_blob';
  }
  if (sanitizedConfig.intro916VideoUrl && (sanitizedConfig.intro916VideoUrl.startsWith('data:') || sanitizedConfig.intro916VideoUrl.startsWith('blob:'))) {
    sanitizedConfig.intro916VideoUrl = 'indexeddb:intro_916_video_blob';
  }
  if (sanitizedConfig.servicesVideoUrl && (sanitizedConfig.servicesVideoUrl.startsWith('data:') || sanitizedConfig.servicesVideoUrl.startsWith('blob:'))) {
    sanitizedConfig.servicesVideoUrl = 'indexeddb:services_video_blob';
  }
  if (sanitizedConfig.servicesVideoPoster && (sanitizedConfig.servicesVideoPoster.startsWith('data:') || sanitizedConfig.servicesVideoPoster.startsWith('blob:'))) {
    sanitizedConfig.servicesVideoPoster = 'indexeddb:services_poster_blob';
  }

  try {
    localStorage.setItem(CONFIG_KEY, JSON.stringify(sanitizedConfig));
  } catch (err) {
    console.warn('[Storage] localStorage quota reached; relying on IndexedDB for full config:', err);
  }

  // Persist sanitized config to IndexedDB without saving expired blob URLs
  saveConfigToDB(CONFIG_KEY, sanitizedConfig).catch((err) => {
    console.error('[Storage] Error persisting config to IndexedDB:', err);
  });
}

/**
 * Saves uploaded video file directly into IndexedDB, returning a live ObjectURL.
 */
export async function saveUploadedHeroVideo(fileOrBlob: File | Blob): Promise<string> {
  await saveMediaBlob('hero_video_blob', fileOrBlob);
  const liveUrl = URL.createObjectURL(fileOrBlob);
  return liveUrl;
}

/**
 * Retrieves metadata about the saved custom hero video.
 */
export async function getHeroVideoMetadata(): Promise<{ name?: string; size?: number; updatedAt?: number } | null> {
  return getMediaBlobMeta('hero_video_blob');
}

/**
 * Clears custom uploaded hero video from IndexedDB (e.g. when using preset or URL).
 */
export async function clearUploadedHeroVideo(): Promise<void> {
  await deleteMediaBlob('hero_video_blob');
}

/**
 * Saves uploaded services video file directly into IndexedDB, returning a live ObjectURL.
 */
export async function saveUploadedServicesVideo(fileOrBlob: File | Blob): Promise<string> {
  await saveMediaBlob('services_video_blob', fileOrBlob);
  const liveUrl = URL.createObjectURL(fileOrBlob);
  return liveUrl;
}

/**
 * Retrieves metadata about the saved custom services video.
 */
export async function getServicesVideoMetadata(): Promise<{ name?: string; size?: number; updatedAt?: number } | null> {
  return getMediaBlobMeta('services_video_blob');
}

/**
 * Clears custom uploaded services video from IndexedDB.
 */
export async function clearUploadedServicesVideo(): Promise<void> {
  await deleteMediaBlob('services_video_blob');
}

/**
 * Saves uploaded hero poster image into IndexedDB.
 */
export async function saveUploadedHeroPoster(fileOrBlob: File | Blob): Promise<string> {
  await saveMediaBlob('hero_poster_blob', fileOrBlob);
  const liveUrl = URL.createObjectURL(fileOrBlob);
  return liveUrl;
}

/**
 * Clears custom uploaded hero poster from IndexedDB.
 */
export async function clearUploadedHeroPoster(): Promise<void> {
  await deleteMediaBlob('hero_poster_blob');
}

/**
 * Saves uploaded 9:16 intro video file directly into IndexedDB, returning a live ObjectURL.
 */
export async function saveUploadedIntro916Video(fileOrBlob: File | Blob): Promise<string> {
  await saveMediaBlob('intro_916_video_blob', fileOrBlob);
  const liveUrl = URL.createObjectURL(fileOrBlob);
  activeVideoBlobUrls.set('intro_916_video', liveUrl);
  return liveUrl;
}

/**
 * Hydrates site configuration with persistent media Blobs from IndexedDB.
 * Restores custom uploaded videos across page reloads.
 */
export async function hydrateSiteConfigWithMedia(currentConfig: SiteConfig): Promise<SiteConfig> {
  let updatedConfig = { ...currentConfig };

  // 1. Check if full config was saved in IndexedDB
  try {
    const dbConfig = await getConfigFromDB<SiteConfig>(CONFIG_KEY);
    if (dbConfig) {
      updatedConfig = {
        ...updatedConfig,
        ...dbConfig,
      };
    }
  } catch (err) {
    console.warn('[Storage] Could not load config from IndexedDB:', err);
  }

  // 2. Check if a custom hero video Blob is stored in IndexedDB
  try {
    const heroVideoBlob = (await getMediaBlob('hero_video_blob')) || (await findAnyUploadedVideoBlob('hero'));
    if (heroVideoBlob && heroVideoBlob.size > 0) {
      const blobUrl = URL.createObjectURL(heroVideoBlob);
      updatedConfig.heroVideoUrl = blobUrl;
      activeVideoBlobUrls.set('hero_video', blobUrl);
    } else if (updatedConfig.heroVideoUrl?.startsWith('indexeddb:')) {
      const liveUrl = await resolveLiveVideoUrl('hero_video', updatedConfig.heroVideoUrl);
      updatedConfig.heroVideoUrl = liveUrl;
    }
  } catch (err) {
    console.warn('[Storage] Could not load hero video blob from IndexedDB:', err);
  }

  // 3. Check if a custom 9:16 Intro Video Blob is stored in IndexedDB
  try {
    const intro916Blob = (await getMediaBlob('intro_916_video_blob')) || (await findAnyUploadedVideoBlob('intro_916'));
    if (intro916Blob && intro916Blob.size > 0) {
      const blobUrl = URL.createObjectURL(intro916Blob);
      updatedConfig.intro916VideoUrl = blobUrl;
      activeVideoBlobUrls.set('intro_916_video', blobUrl);
    } else if (updatedConfig.intro916VideoUrl?.startsWith('indexeddb:')) {
      const liveUrl = await resolveLiveVideoUrl('intro_916_video', updatedConfig.intro916VideoUrl);
      updatedConfig.intro916VideoUrl = liveUrl;
    }
  } catch (err) {
    console.warn('[Storage] Could not load intro 9:16 video blob from IndexedDB:', err);
  }

  // 4. Check if a custom hero poster Blob is stored in IndexedDB
  try {
    const heroPosterBlob = await getMediaBlob('hero_poster_blob');
    if (heroPosterBlob && heroPosterBlob.size > 0) {
      const posterUrl = URL.createObjectURL(heroPosterBlob);
      updatedConfig.heroVideoPoster = posterUrl;
    } else if (updatedConfig.heroVideoPoster?.startsWith('indexeddb:')) {
      updatedConfig.heroVideoPoster = '';
    }
  } catch (err) {
    console.warn('[Storage] Could not load hero poster blob from IndexedDB:', err);
  }

  // 5. Check if a custom services video Blob is stored in IndexedDB
  try {
    const servicesVideoBlob = (await getMediaBlob('services_video_blob')) || (await findAnyUploadedVideoBlob('services'));
    if (servicesVideoBlob && servicesVideoBlob.size > 0) {
      const blobUrl = URL.createObjectURL(servicesVideoBlob);
      updatedConfig.servicesVideoUrl = blobUrl;
      activeVideoBlobUrls.set('services_video', blobUrl);
    } else if (updatedConfig.servicesVideoUrl?.startsWith('indexeddb:')) {
      const liveUrl = await resolveLiveVideoUrl('services_video', updatedConfig.servicesVideoUrl);
      updatedConfig.servicesVideoUrl = liveUrl;
    }
  } catch (err) {
    console.warn('[Storage] Could not load services video blob from IndexedDB:', err);
  }

  return updatedConfig;
}

export function isTeeProItem(_item: any): boolean {
  return false;
}

export function isElevateGrowthItem(item: any): boolean {
  if (!item) return false;
  return item.id === 'proj-2';
}

export function isFilteredOutItem(item: any): boolean {
  return isTeeProItem(item) || isElevateGrowthItem(item);
}

export function getSavedPortfolio(): PortfolioItem[] {
  try {
    const raw = localStorage.getItem(PORTFOLIO_KEY);
    if (raw) {
      const parsed: PortfolioItem[] = JSON.parse(raw);
      const cleanedParsed = parsed.filter((p) => !isFilteredOutItem(p));
      if (cleanedParsed.length !== parsed.length) {
        localStorage.setItem(PORTFOLIO_KEY, JSON.stringify(cleanedParsed));
        saveConfigToDB(PORTFOLIO_KEY, cleanedParsed).catch(() => {});
      }

      const parsedIds = new Set(cleanedParsed.map((p) => p.id));
      const missingInitial = initialPortfolioItems.filter((p) => !parsedIds.has(p.id) && !isFilteredOutItem(p));
      const mergedList = [...cleanedParsed, ...missingInitial].filter((p) => !isFilteredOutItem(p));

      return mergedList.map((item) => {
        const initialMatch = initialPortfolioItems.find((p) => p.id === item.id);
        const resolvedImages = (item.images && Array.isArray(item.images) && item.images.length > 0)
          ? item.images
          : (item.imageUrl ? [item.imageUrl] : (initialMatch?.images || []));

        let currentVideo: string | undefined = item.videoUrl || item.mediaUrl;
        if (isOldSampleVideoUrl(currentVideo) && initialMatch?.videoUrl) {
          currentVideo = initialMatch.videoUrl;
        }
        if (currentVideo?.startsWith('indexeddb:')) {
          if (activeVideoBlobUrls.has(item.id)) {
            currentVideo = activeVideoBlobUrls.get(item.id);
          }
        }

        const resolvedMediaType = item.mediaType ?? initialMatch?.mediaType ?? (item.category === 'Website Building' ? 'website' : 'video');

        return {
          ...(initialMatch || {}),
          ...item,
          title: item.title ?? initialMatch?.title ?? 'Project Showcase',
          client: item.client ?? initialMatch?.client ?? 'Client Brand',
          category: item.category ?? initialMatch?.category ?? 'Video Editing',
          mediaType: resolvedMediaType,
          websiteUrl: item.websiteUrl || initialMatch?.websiteUrl || (item.category === 'Website Building' ? item.mediaUrl : undefined),
          videoUrl: resolvedMediaType === 'video'
            ? (currentVideo || initialMatch?.videoUrl || (item.category === 'UGC' || item.aspectRatio === '9:16'
                ? '/videos/ugc_growth_9x16.mp4'
                : '/videos/commercial_4k_reel_16_9.mp4'))
            : undefined,
          imageUrl: item.imageUrl || item.posterUrl || (resolvedMediaType === 'image' ? item.mediaUrl : initialMatch?.imageUrl),
          images: resolvedImages,
          aspectRatio: item.aspectRatio || initialMatch?.aspectRatio || (item.category === 'UGC' ? '9:16' : '16:9'),
        };
      });
    }
  } catch (err) {
    console.error('Failed reading portfolio:', err);
  }
  return initialPortfolioItems.filter((p) => !isFilteredOutItem(p));
}

export function savePortfolio(items: PortfolioItem[]): void {
  const cleanItems = items.filter((p) => !isFilteredOutItem(p));
  try {
    const sanitized = cleanItems.map((item) => {
      const copy = { ...item };
      const rawUrl = copy.videoUrl || copy.mediaUrl;
      if (rawUrl && (rawUrl.startsWith('data:') || rawUrl.startsWith('blob:'))) {
        activeVideoBlobUrls.set(copy.id, rawUrl);
        copy.videoUrl = `indexeddb:portfolio_video_${copy.id}`;
        if (copy.mediaType === 'video') {
          copy.mediaUrl = `indexeddb:portfolio_video_${copy.id}`;
        }
      }
      return copy;
    });

    try {
      localStorage.setItem(PORTFOLIO_KEY, JSON.stringify(sanitized));
    } catch (quotaErr) {
      console.warn('[Storage] localStorage quota reached; compressing images for storage:', quotaErr);
      const safeForLocalStorage = sanitized.map((item) => ({
        ...item,
        imageUrl: (item.imageUrl && item.imageUrl.length > 90000)
          ? '/src/assets/images/showcase_website_platform_1791339120555.jpg'
          : item.imageUrl,
        posterUrl: (item.posterUrl && item.posterUrl.length > 90000)
          ? '/src/assets/images/showcase_website_platform_1791339120555.jpg'
          : item.posterUrl,
        images: (item.images || []).map((img) =>
          img.length > 90000 ? '/src/assets/images/showcase_website_platform_1791339120555.jpg' : img
        ),
      }));
      try {
        localStorage.setItem(PORTFOLIO_KEY, JSON.stringify(safeForLocalStorage));
      } catch {}
    }

    saveConfigToDB(PORTFOLIO_KEY, sanitized).catch(console.error);
  } catch (err) {
    console.error('[Storage] Error saving portfolio:', err);
  }
}

/**
 * Hydrates portfolio items with media Blobs from IndexedDB.
 */
export async function hydratePortfolioWithMedia(items: PortfolioItem[]): Promise<PortfolioItem[]> {
  try {
    const dbItems = await getConfigFromDB<PortfolioItem[]>(PORTFOLIO_KEY);
    let sourceItems = (dbItems && dbItems.length > 0 ? dbItems : items).filter((p) => !isTeeProItem(p));

    // If IndexedDB contained any TeePro item, overwrite with clean list
    if (dbItems && dbItems.some(isTeeProItem)) {
      saveConfigToDB(PORTFOLIO_KEY, sourceItems).catch(() => {});
    }

    const hydrated = await Promise.all(
      sourceItems.map(async (item) => {
        if (item.mediaType === 'video') {
          const liveUrl = await resolveLiveVideoUrl(item.id, item.videoUrl || item.mediaUrl);
          return {
            ...item,
            videoUrl: liveUrl,
            mediaUrl: liveUrl,
          };
        }
        return item;
      })
    );
    return hydrated.filter((p) => !isTeeProItem(p));
  } catch (err) {
    console.warn('[Storage] Could not hydrate portfolio media:', err);
    return items.filter((p) => !isTeeProItem(p));
  }
}

export async function saveUploadedPortfolioVideo(itemId: string, fileOrBlob: File | Blob): Promise<string> {
  await saveMediaBlob(`portfolio_video_${itemId}`, fileOrBlob);
  const blobUrl = URL.createObjectURL(fileOrBlob);
  activeVideoBlobUrls.set(itemId, blobUrl);
  return blobUrl;
}

export function getSavedLeads(): Lead[] {
  try {
    const raw = localStorage.getItem(LEADS_KEY);
    if (raw) return JSON.parse(raw);
  } catch (err) {
    console.error('Failed reading leads:', err);
  }
  return initialLeads;
}

export function saveLeads(leads: Lead[]): void {
  try {
    localStorage.setItem(LEADS_KEY, JSON.stringify(leads));
  } catch (err) {
    console.error('Failed saving leads:', err);
  }
}

export function getSavedReports(): ClientReport[] {
  try {
    const raw = localStorage.getItem(REPORTS_KEY);
    if (raw) return JSON.parse(raw);
  } catch (err) {
    console.error('Failed reading reports:', err);
  }
  return initialClientReports;
}

export function saveReports(reports: ClientReport[]): void {
  try {
    localStorage.setItem(REPORTS_KEY, JSON.stringify(reports));
  } catch (err) {
    console.error('Failed saving reports:', err);
  }
}

export function resetAllToDefault(): {
  config: SiteConfig;
  portfolio: PortfolioItem[];
  leads: Lead[];
  reports: ClientReport[];
} {
  localStorage.removeItem(CONFIG_KEY);
  localStorage.removeItem(PORTFOLIO_KEY);
  localStorage.removeItem(LEADS_KEY);
  localStorage.removeItem(REPORTS_KEY);
  clearUploadedHeroVideo().catch(console.error);
  clearUploadedHeroPoster().catch(console.error);
  return {
    config: initialSiteConfig,
    portfolio: initialPortfolioItems,
    leads: initialLeads,
    reports: initialClientReports,
  };
}
