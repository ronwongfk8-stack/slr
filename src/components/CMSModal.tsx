import React, { useState, useEffect, useRef } from 'react';
import { X, Upload, Plus, Trash2, Edit3, Save, RefreshCw, Film, Image as ImageIcon, CheckCircle, Database, Layers, Smartphone, Sparkles, Camera, Video, Play, Maximize2, AlertCircle, Globe, ExternalLink, Lock } from 'lucide-react';
import { SiteConfig, PortfolioItem, ServiceCategory } from '../types';
import { generateVideoThumbnail, generateDefaultVideoPoster } from '../utils/videoThumbnail';
import { optimizeImageFile } from '../utils/imageOptimizer';
import { 
  saveUploadedHeroVideo, 
  clearUploadedHeroVideo, 
  saveUploadedHeroPoster, 
  clearUploadedHeroPoster, 
  saveUploadedPortfolioVideo,
  getHeroVideoMetadata,
  saveUploadedServicesVideo,
  clearUploadedServicesVideo,
  getServicesVideoMetadata,
  resolveLiveVideoUrl,
  isTeeProItem,
  saveUploadedIntro916Video
} from '../utils/storage';

interface CMSModalProps {
  isOpen: boolean;
  onClose: () => void;
  siteConfig: SiteConfig;
  onSaveSiteConfig: (config: SiteConfig) => void;
  portfolioItems: PortfolioItem[];
  onSavePortfolio: (items: PortfolioItem[]) => void;
  onResetAll: () => void;
  onLogout?: () => void;
}

export const CMSModal: React.FC<CMSModalProps> = ({
  isOpen,
  onClose,
  siteConfig,
  onSaveSiteConfig,
  portfolioItems,
  onSavePortfolio,
  onResetAll,
  onLogout,
}) => {
  const [activeTab, setActiveTab] = useState<'general' | 'heroVideo' | 'portfolio' | 'backup'>('general');
  const [configForm, setConfigForm] = useState<SiteConfig>({ ...siteConfig });
  const [itemsList, setItemsList] = useState<PortfolioItem[]>(() => portfolioItems.filter((p) => !isTeeProItem(p)));

  useEffect(() => {
    if (isOpen) {
      setItemsList(portfolioItems.filter((p) => !isTeeProItem(p)));
      setConfigForm({ ...siteConfig });
    }
  }, [isOpen, portfolioItems, siteConfig]);

  // Project editor sub-state
  const [editingItem, setEditingItem] = useState<Partial<PortfolioItem> | null>(null);
  const [isEditingExisting, setIsEditingExisting] = useState<boolean>(false);
  const [previewMediaUrl, setPreviewMediaUrl] = useState<string>('');
  const [uploadStatus, setUploadStatus] = useState<string>('');
  const [slideUrlInput, setSlideUrlInput] = useState<string>('');
  const [videoUrlInput, setVideoUrlInput] = useState<string>('');
  const [formError, setFormError] = useState<string>('');
  const [recentlySavedId, setRecentlySavedId] = useState<string | null>(null);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const editSectionRef = useRef<HTMLDivElement>(null);
  const slideFileInputRef = useRef<HTMLInputElement>(null);
  const videoFileInputRef = useRef<HTMLInputElement>(null);
  const websiteScreenshotInputRef = useRef<HTMLInputElement>(null);

  // Video section sub-tab switcher
  const [videoSectionSubTab, setVideoSectionSubTab] = useState<'intro916' | 'hero' | 'services'>('intro916');

  // 9:16 Intro Video Editor State
  const [intro916VideoTestPlay, setIntro916VideoTestPlay] = useState(false);
  const [intro916VideoMeta, setIntro916VideoMeta] = useState<{ name?: string; size?: number } | null>(null);
  const intro916VideoRef = useRef<HTMLVideoElement>(null);

  // Hero Video Editor State
  const [heroVideoTestPlay, setHeroVideoTestPlay] = useState(false);
  const [heroVideoMeta, setHeroVideoMeta] = useState<{ name?: string; size?: number } | null>(null);
  const heroVideoRef = useRef<HTMLVideoElement>(null);

  // Services Video Editor State
  const [servicesVideoTestPlay, setServicesVideoTestPlay] = useState(false);
  const [servicesVideoMeta, setServicesVideoMeta] = useState<{ name?: string; size?: number } | null>(null);
  const servicesVideoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    setConfigForm({ ...siteConfig });
    setItemsList(portfolioItems.filter((p) => !isTeeProItem(p)));
    if (isOpen) {
      getHeroVideoMetadata().then(setHeroVideoMeta).catch(console.warn);
      getServicesVideoMetadata().then(setServicesVideoMeta).catch(console.warn);
    }
  }, [siteConfig, portfolioItems, isOpen]);

  if (!isOpen) return null;

  // Handle General Config Save
  const handleSaveConfig = (e?: React.FormEvent) => {
    e?.preventDefault();
    onSaveSiteConfig(configForm);
    setUploadStatus('Site configuration updated successfully!');
    setTimeout(() => setUploadStatus(''), 2500);
  };

  // Hero Overview Video Handlers with Persistent IndexedDB Storage
  const handleHeroVideoFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadStatus(`Saving "${file.name}" to browser storage database...`);

    try {
      // Persist binary ArrayBuffer into IndexedDB so it permanently survives page refresh
      const liveBlobUrl = await saveUploadedHeroVideo(file);
      const updated = {
        ...configForm,
        heroVideoUrl: liveBlobUrl,
      };
      setConfigForm(updated);
      setHeroVideoTestPlay(false);
      setHeroVideoMeta({
        name: file.name,
        size: file.size,
      });
      onSaveSiteConfig(updated);
      setUploadStatus(`Hero video "${file.name}" saved permanently! Persists across page refresh.`);
      setTimeout(() => setUploadStatus(''), 4000);
    } catch (err) {
      console.error('Error persisting hero video file:', err);
      const blobUrl = URL.createObjectURL(file);
      const fallbackConfig = {
        ...configForm,
        heroVideoUrl: blobUrl,
      };
      setConfigForm(fallbackConfig);
      onSaveSiteConfig(fallbackConfig);
      setHeroVideoTestPlay(false);
      setUploadStatus('Hero video attached in memory.');
      setTimeout(() => setUploadStatus(''), 3000);
    }
  };

  const handleHeroPosterFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 15 * 1024 * 1024) {
      alert('Image size exceeds 15MB. Please select a smaller image file.');
      return;
    }

    try {
      const livePosterUrl = await saveUploadedHeroPoster(file);
      const updated = {
        ...configForm,
        heroVideoPoster: livePosterUrl,
      };
      setConfigForm(updated);
      onSaveSiteConfig(updated);
      setUploadStatus('Hero overview poster thumbnail saved and persisted!');
      setTimeout(() => setUploadStatus(''), 2500);
    } catch (err) {
      console.error(err);
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        const fallbackConfig = {
          ...configForm,
          heroVideoPoster: result,
        };
        setConfigForm(fallbackConfig);
        onSaveSiteConfig(fallbackConfig);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSetHeroVideoPreset = async (presetType: 'sapotlokal' | 'consultancy') => {
    await clearUploadedHeroVideo();
    await clearUploadedHeroPoster();

    if (presetType === 'sapotlokal') {
      const presetConfig: SiteConfig = {
        ...configForm,
        heroVideoUrl: 'https://cdn.jsdelivr.net/gh/bower-media-samples/big-buck-bunny-480p-30s@master/video.mp4',
        heroVideoPoster: '/src/assets/images/hero_sapotlokal_agency_1790504057787.jpg',
        heroVideoTitle: 'Sapotlokal Overview & Strategic Advisory Showreel',
        heroVideoDuration: '1:30',
        heroVideoBadge: 'Watch Overview (1:30)',
      };
      setConfigForm(presetConfig);
      onSaveSiteConfig(presetConfig);
      setUploadStatus('Applied & saved Sapotlokal Agency Overview Reel preset!');
    } else {
      const presetConfig: SiteConfig = {
        ...configForm,
        heroVideoUrl: 'https://cdn.jsdelivr.net/gh/themarcosdev/tiktok-app-frontEnd-clone-simple@master/video01.mp4',
        heroVideoPoster: '/src/assets/images/showcase_ugc_creator_1790504084326.jpg',
        heroVideoTitle: 'Enterprise Growth Architecture & Corporate Advisory',
        heroVideoDuration: '1:15',
        heroVideoBadge: 'Corporate Advisory (1:15)',
      };
      setConfigForm(presetConfig);
      onSaveSiteConfig(presetConfig);
      setUploadStatus('Applied & saved Corporate Growth Advisory Reel preset!');
    }
    setHeroVideoTestPlay(false);
    setTimeout(() => setUploadStatus(''), 2500);
  };

  // Services Video Handlers with Persistent IndexedDB Storage
  const handleServicesVideoFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadStatus(`Saving "${file.name}" to browser storage database...`);

    try {
      const liveBlobUrl = await saveUploadedServicesVideo(file);
      const updated = {
        ...configForm,
        servicesVideoUrl: liveBlobUrl,
      };
      setConfigForm(updated);
      setServicesVideoTestPlay(false);
      setServicesVideoMeta({
        name: file.name,
        size: file.size,
      });
      onSaveSiteConfig(updated);
      setUploadStatus(`Services video "${file.name}" saved permanently! Persists across page refresh.`);
      setTimeout(() => setUploadStatus(''), 4000);
    } catch (err) {
      console.error('Error persisting services video file:', err);
      const blobUrl = URL.createObjectURL(file);
      const fallbackConfig = {
        ...configForm,
        servicesVideoUrl: blobUrl,
      };
      setConfigForm(fallbackConfig);
      onSaveSiteConfig(fallbackConfig);
      setServicesVideoTestPlay(false);
      setUploadStatus('Services video attached in memory.');
      setTimeout(() => setUploadStatus(''), 3000);
    }
  };

  const handleSetServicesVideoPreset = async (presetType: 'consultancy' | 'commercial') => {
    await clearUploadedServicesVideo();
    setServicesVideoMeta(null);

    if (presetType === 'consultancy') {
      const presetConfig: SiteConfig = {
        ...configForm,
        servicesVideoUrl: 'https://cdn.jsdelivr.net/gh/mediaelement/mediaelement-files@master/echo-hereweare.mp4',
        servicesVideoTitle: 'Specialized Corporate Consultancy & Media Production Overview',
        servicesVideoBadge: 'Consultancy & Production Reel (1:45)',
      };
      setConfigForm(presetConfig);
      onSaveSiteConfig(presetConfig);
      setUploadStatus('Applied & saved Specialized Corporate Consultancy showreel preset!');
    } else {
      const presetConfig: SiteConfig = {
        ...configForm,
        servicesVideoUrl: 'https://cdn.jsdelivr.net/gh/bower-media-samples/big-buck-bunny-480p-30s@master/video.mp4',
        servicesVideoTitle: 'Kinetic 4K Commercial Reel & Motion Post-Production',
        servicesVideoBadge: 'Commercial Motion (1:30)',
      };
      setConfigForm(presetConfig);
      onSaveSiteConfig(presetConfig);
      setUploadStatus('Applied & saved Kinetic Commercial Motion Reel preset!');
    }
    setServicesVideoTestPlay(false);
    setTimeout(() => setUploadStatus(''), 3000);
  };

  // 9:16 Intro Video Handlers with Persistent Storage
  const handleIntro916VideoFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadStatus(`Saving 9:16 video "${file.name}" to browser storage database...`);

    try {
      const liveBlobUrl = await saveUploadedIntro916Video(file);
      let capturedPoster = '';
      try {
        capturedPoster = await generateVideoThumbnail(file, 0.5);
      } catch (err) {
        console.warn('Poster thumbnail extraction fallback:', err);
      }

      const updated = {
        ...configForm,
        intro916VideoUrl: liveBlobUrl,
        intro916VideoPoster: capturedPoster || configForm.intro916VideoPoster,
      };
      setConfigForm(updated);
      setIntro916VideoTestPlay(false);
      setIntro916VideoMeta({ name: file.name, size: file.size });
      onSaveSiteConfig(updated);
      setUploadStatus(`✓ Uploaded 9:16 Intro Video "${file.name}" (${(file.size / (1024 * 1024)).toFixed(1)} MB)!`);
      setTimeout(() => setUploadStatus(''), 3500);
    } catch (err) {
      console.error('Error persisting 9:16 video file:', err);
      const blobUrl = URL.createObjectURL(file);
      const fallbackConfig = {
        ...configForm,
        intro916VideoUrl: blobUrl,
      };
      setConfigForm(fallbackConfig);
      onSaveSiteConfig(fallbackConfig);
      setIntro916VideoTestPlay(false);
      setUploadStatus('9:16 video attached in memory.');
      setTimeout(() => setUploadStatus(''), 3000);
    }
  };

  const handleSetIntro916VideoPreset = (presetType: 'ugc' | 'creative') => {
    setIntro916VideoMeta(null);
    const videoUrl = 'https://cdn.jsdelivr.net/gh/themarcosdev/tiktok-app-frontEnd-clone-simple@master/video01.mp4';
    const updated = {
      ...configForm,
      intro916VideoUrl: videoUrl,
      intro916VideoTitle: presetType === 'ugc' ? 'High-Impact 9:16 Intro Reel' : 'Cinematic 9:16 Vertical Story',
      intro916VideoBadge: presetType === 'ugc' ? '9:16 Mobile-First (Auto-Play)' : 'Vertical Motion (0:30)',
    };
    setConfigForm(updated);
    onSaveSiteConfig(updated);
    setUploadStatus('Applied 9:16 preset video!');
    setIntro916VideoTestPlay(false);
    setTimeout(() => setUploadStatus(''), 2500);
  };

  // Handle Image File Upload with optimization
  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadStatus(`Optimizing image "${file.name}"...`);
    try {
      const optimized = await optimizeImageFile(file, 1440, 1080, 0.82);
      setEditingItem((prev) => ({
        ...prev,
        imageUrl: optimized,
        posterUrl: optimized,
        mediaUrl: prev?.mediaType === 'image' ? optimized : (prev?.mediaUrl || optimized),
      }));
      setUploadStatus('✓ Matching thumbnail image attached & optimized!');
      setTimeout(() => setUploadStatus(''), 2500);
    } catch (err) {
      console.warn('Image optimization fallback:', err);
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        setEditingItem((prev) => ({
          ...prev,
          imageUrl: result,
          posterUrl: result,
          mediaUrl: prev?.mediaType === 'image' ? result : (prev?.mediaUrl || result),
        }));
        setUploadStatus('Matching thumbnail image uploaded!');
        setTimeout(() => setUploadStatus(''), 2500);
      };
      reader.readAsDataURL(file);
    }
    e.target.value = '';
  };

  // Handle Video File Upload (Custom thumbnail is optional)
  const handleVideoFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadStatus(`Processing video "${file.name}"...`);

    try {
      const itemId = editingItem?.id || `proj-${Date.now()}`;
      const liveBlobUrl = await saveUploadedPortfolioVideo(itemId, file);
      setPreviewMediaUrl(liveBlobUrl);

      // Auto-extract real video frame as poster!
      let capturedPoster = '';
      try {
        capturedPoster = await generateVideoThumbnail(file, 0.5);
      } catch (err) {
        console.warn('Could not extract video thumbnail:', err);
      }

      setEditingItem((prev) => ({
        ...prev,
        id: itemId,
        mediaType: 'video',
        videoUrl: liveBlobUrl,
        mediaUrl: liveBlobUrl,
        imageUrl: capturedPoster || prev?.imageUrl || '',
        posterUrl: capturedPoster || prev?.posterUrl || '',
      }));
      setVideoUrlInput(''); // Keep empty so raw file name is not mistaken for a stream URL
      setFormError('');
      setUploadStatus(`✓ Video "${file.name}" loaded & active! Frame captured as thumbnail.`);
      setTimeout(() => setUploadStatus(''), 3500);
    } catch (err) {
      console.error('Error saving portfolio video:', err);
      const tempUrl = URL.createObjectURL(file);
      setPreviewMediaUrl(tempUrl);
      let capturedPoster = '';
      try {
        capturedPoster = await generateVideoThumbnail(file, 0.5);
      } catch {}
      setEditingItem((prev) => ({
        ...prev,
        mediaType: 'video',
        videoUrl: tempUrl,
        mediaUrl: tempUrl,
        imageUrl: capturedPoster || prev?.imageUrl || '',
        posterUrl: capturedPoster || prev?.posterUrl || '',
      }));
      setVideoUrlInput('');
      setFormError('');
      setUploadStatus(`✓ Video attached: "${file.name}"`);
      setTimeout(() => setUploadStatus(''), 3000);
    }
    e.target.value = '';
  };

  // Add / Apply Video Stream URL
  const handleAddVideoUrl = (urlToSet?: string) => {
    const raw = urlToSet || videoUrlInput || editingItem?.videoUrl || '';
    const trimmed = raw.trim();
    if (!trimmed) {
      setFormError('Please enter a public MP4 or WebM video URL.');
      return;
    }

    setEditingItem((prev) => ({
      ...prev,
      mediaType: 'video',
      videoUrl: trimmed,
      mediaUrl: trimmed,
    }));
    setPreviewMediaUrl(trimmed);
    setVideoUrlInput(trimmed);
    setFormError('');
    setUploadStatus('✓ Video is active and stream is loaded! Inspect preview below.');
    setTimeout(() => setUploadStatus(''), 3000);
  };

  // Explicit Trigger to Capture or Generate Poster
  const handleGenerateAutoPoster = async () => {
    const isVertical = editingItem?.aspectRatio === '9:16' || editingItem?.category === 'UGC';
    const videoSource = editingItem?.videoUrl || editingItem?.mediaUrl || previewMediaUrl;

    setUploadStatus('Generating matching video poster...');
    let poster = '';
    if (videoSource) {
      poster = await generateVideoThumbnail(videoSource);
    }
    if (!poster) {
      poster = generateDefaultVideoPoster(
        editingItem?.title || 'Commercial Video Reel',
        editingItem?.category || 'Video Editing',
        editingItem?.client || 'Client Brand',
        isVertical
      );
    }

    setEditingItem((prev) => ({
      ...prev,
      imageUrl: poster,
      posterUrl: poster,
    }));
    setUploadStatus('Matching poster preview created!');
    setTimeout(() => setUploadStatus(''), 2500);
  };

  // Quick Preset Handlers
  const handleSelectVerticalUGCPreset = () => {
    const verticalMp4 = 'https://cdn.jsdelivr.net/gh/themarcosdev/tiktok-app-frontEnd-clone-simple@master/video01.mp4';
    const poster = '/src/assets/images/showcase_ugc_creator_1790504084326.jpg';
    setEditingItem((prev) => ({
      ...prev,
      title: prev?.title || 'Corporate UGC Performance & Conversion Campaign',
      client: prev?.client || 'Lokal Brands Network',
      category: 'UGC',
      aspectRatio: '9:16',
      mediaType: 'video',
      videoUrl: verticalMp4,
      mediaUrl: verticalMp4,
      imageUrl: poster,
      posterUrl: poster,
      metrics: '+340% Inbound Enterprise Leads · 4.2x Client Retention',
      tags: ['UGC Video', 'Corporate Consultancy', 'Growth Advisory', 'Vertical 9:16'],
    }));
    setVideoUrlInput(verticalMp4);
    setPreviewMediaUrl(verticalMp4);
    setFormError('');
    setUploadStatus('Vertical 9:16 UGC video preset selected!');
    setTimeout(() => setUploadStatus(''), 2500);
  };

  const handleSelect4KCommercialPreset = () => {
    const horizontalMp4 = 'https://cdn.jsdelivr.net/gh/bower-media-samples/big-buck-bunny-480p-30s@master/video.mp4';
    const poster = '/src/assets/images/showcase_video_production_1790504071320.jpg';
    setEditingItem((prev) => ({
      ...prev,
      title: prev?.title || 'Kinetic 4K Commercial Reel & Motion Post-Production',
      client: prev?.client || 'Apex Automotive & Detailing Group',
      category: 'Video Editing',
      aspectRatio: '16:9',
      mediaType: 'video',
      videoUrl: horizontalMp4,
      mediaUrl: horizontalMp4,
      imageUrl: poster,
      posterUrl: poster,
      metrics: '+310% Video Watch Time · 1.8M Viral Views',
      tags: ['4K Video Editing', 'Color Grading', 'Sound Design', 'Short-form Motion'],
    }));
    setVideoUrlInput(horizontalMp4);
    setPreviewMediaUrl(horizontalMp4);
    setFormError('');
    setUploadStatus('4K Commercial Reel preset selected!');
    setTimeout(() => setUploadStatus(''), 2500);
  };

  // Handle Multi-Image Upload for Carousel Showcases
  const handleMultipleImagesUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const fileList = Array.from(files);
    const readers = fileList.map((file) => {
      return new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.readAsDataURL(file);
      });
    });

    Promise.all(readers).then((newImages) => {
      setEditingItem((prev) => {
        const currentImages = prev?.images && prev.images.length > 0
          ? [...prev.images]
          : (prev?.imageUrl ? [prev.imageUrl] : []);
        const combined = [...currentImages, ...newImages];
        return {
          ...prev,
          mediaType: 'image',
          images: combined,
          imageUrl: combined[0],
          posterUrl: combined[0],
          mediaUrl: combined[0],
        };
      });
      if (newImages[0]) {
        setPreviewMediaUrl(newImages[0]);
      }
      setFormError('');
      setUploadStatus(`✓ ${newImages.length} slide image(s) added to showcase carousel!`);
      setTimeout(() => setUploadStatus(''), 3000);
    });
    e.target.value = '';
  };

  // Add Slide URL directly
  const handleAddSlideUrl = (urlToSet?: string) => {
    const raw = urlToSet || slideUrlInput;
    const trimmed = raw.trim();
    if (!trimmed) {
      setFormError('Please enter an image URL to add as a slide.');
      return;
    }

    setEditingItem((prev) => {
      const currentImages = prev?.images && prev.images.length > 0
        ? [...prev.images]
        : (prev?.imageUrl ? [prev.imageUrl] : []);
      const combined = [...currentImages, trimmed];
      return {
        ...prev,
        mediaType: 'image',
        images: combined,
        imageUrl: combined[0],
        posterUrl: combined[0],
        mediaUrl: combined[0],
      };
    });
    setPreviewMediaUrl(trimmed);
    setSlideUrlInput('');
    setFormError('');
    setUploadStatus('✓ Slide added to carousel! Total slides: ' + ((editingItem?.images?.length || 0) + 1));
    setTimeout(() => setUploadStatus(''), 3000);
  };

  const handleLoadPresetSlides = () => {
    const presetSlides = [
      '/src/assets/images/showcase_branding_identity_1790504096628.jpg',
      '/src/assets/images/hero_sapotlokal_agency_1790504057787.jpg',
      '/src/assets/images/showcase_video_production_1790504071320.jpg',
      '/src/assets/images/showcase_ugc_creator_1790504084326.jpg',
    ];
    setEditingItem((prev) => ({
      ...prev,
      mediaType: 'image',
      images: presetSlides,
      imageUrl: presetSlides[0],
      posterUrl: presetSlides[0],
      mediaUrl: presetSlides[0],
    }));
    setPreviewMediaUrl(presetSlides[0]);
    setFormError('');
    setUploadStatus('✓ Loaded 4 high-resolution showcase slides into carousel!');
    setTimeout(() => setUploadStatus(''), 3000);
  };

  const handleRemoveSlideImage = (indexToRemove: number) => {
    setEditingItem((prev) => {
      const current = prev?.images || [];
      const updated = current.filter((_, i) => i !== indexToRemove);
      const fallback = updated[0] || '';
      return {
        ...prev,
        images: updated,
        imageUrl: fallback,
        mediaUrl: fallback,
        posterUrl: fallback,
      };
    });
    setUploadStatus('Slide removed from carousel.');
    setTimeout(() => setUploadStatus(''), 2000);
  };

  // Handle Website Screenshot / Mockup Upload with high-res optimization
  const handleWebsiteScreenshotUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadStatus(`Optimizing website screenshot "${file.name}"...`);
    try {
      const optimized = await optimizeImageFile(file, 1600, 1200, 0.85);
      setEditingItem((prev) => {
        const curImages = prev?.images || [];
        return {
          ...prev,
          mediaType: 'website',
          category: prev?.category === 'Website Building' ? 'Website Building' : (prev?.category || 'Website Building'),
          imageUrl: optimized,
          posterUrl: optimized,
          images: [optimized, ...curImages.filter((img) => img !== optimized)],
          websiteUrl: prev?.websiteUrl || '',
          mediaUrl: prev?.websiteUrl || optimized,
        };
      });
      setPreviewMediaUrl(optimized);
      setUploadStatus(`✓ Website UI screenshot "${file.name}" attached & optimized!`);
      setTimeout(() => setUploadStatus(''), 3000);
    } catch (err) {
      console.warn('Screenshot optimization fallback:', err);
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        const result = uploadEvent.target?.result as string;
        setEditingItem((prev) => {
          const curImages = prev?.images || [];
          return {
            ...prev,
            mediaType: 'website',
            imageUrl: result,
            posterUrl: result,
            images: curImages.length > 0 ? [result, ...curImages.filter((img) => img !== result)] : [result],
            websiteUrl: prev?.websiteUrl || '',
            mediaUrl: prev?.websiteUrl || '',
          };
        });
        setPreviewMediaUrl(result);
        setUploadStatus(`✓ Website mockup image "${file.name}" attached successfully!`);
        setTimeout(() => setUploadStatus(''), 3000);
      };
      reader.readAsDataURL(file);
    }
    e.target.value = '';
  };

  // Load Generic Website Building Preset
  const handleSelectWebsiteBuildingPreset = () => {
    const targetId = editingItem?.id || `proj-web-${Date.now()}`;
    setEditingItem({
      id: targetId,
      title: 'Malaya Digital Enterprise — Next.js Web Platform & Client Funnel',
      client: 'Malaya Digital Enterprise',
      category: 'Website Building',
      mediaType: 'website',
      websiteUrl: 'https://malayadigital.com',
      mediaUrl: 'https://malayadigital.com',
      imageUrl: '/src/assets/images/showcase_website_platform_1791339120555.jpg',
      posterUrl: '/src/assets/images/showcase_website_platform_1791339120555.jpg',
      images: [
        '/src/assets/images/showcase_website_platform_1791339120555.jpg',
        '/src/assets/images/showcase_branding_identity_1790504096628.jpg',
      ],
      description:
        'Engineered an enterprise-grade web platform with responsive mobile-first architecture, automated client lead capture, dynamic booking funnels, and real-time CRM integration.',
      metrics: '+380% Online Inbound Leads · 99.98% SLA Uptime',
      tags: ['Website Building', 'Next.js App Router', 'Lead Funnel', 'Responsive UI'],
      aspectRatio: '16:9',
      featured: true,
    });
    setPreviewMediaUrl('/src/assets/images/showcase_website_platform_1791339120555.jpg');
    setUploadStatus('✓ Loaded Website Building showcase template!');
    setTimeout(() => setUploadStatus(''), 3000);
  };

  // Save new or updated portfolio item
  const handleSaveItem = () => {
    setFormError('');
    if (!editingItem) return;

    const trimmedTitle = (editingItem.title || '').trim();
    if (!trimmedTitle) {
      setFormError('Please enter a Project Title before saving.');
      return;
    }

    const category = (editingItem.category as ServiceCategory) || 'Video Editing';
    const defaultAspectRatio = category === 'UGC' ? '9:16' : (editingItem.aspectRatio || '16:9');
    const targetId = editingItem.id || `proj-${Date.now()}`;
    const isExisting = isEditingExisting || itemsList.some((item) => item.id === targetId);

    // Explicit format classification:
    const isWebsiteCategory = category === 'Website Building';
    const hasWebsiteExplicitUrl = Boolean(editingItem.websiteUrl?.trim());
    const isWebsiteFormat = editingItem.mediaType === 'website' || isWebsiteCategory || (hasWebsiteExplicitUrl && !editingItem.videoUrl);

    // CRITICAL: Gather video URL from all sources:
    let resolvedVideoUrl = (
      editingItem.videoUrl || 
      (editingItem.mediaType === 'video' ? editingItem.mediaUrl : '') || 
      (previewMediaUrl.startsWith('blob:') || previewMediaUrl.startsWith('/videos/') ? previewMediaUrl : '') || 
      ''
    ).trim();

    if (videoUrlInput && (videoUrlInput.startsWith('http://') || videoUrlInput.startsWith('https://') || videoUrlInput.startsWith('blob:') || videoUrlInput.startsWith('/videos/'))) {
      resolvedVideoUrl = videoUrlInput.trim();
    }

    const isImageFormat = !isWebsiteFormat && (editingItem.mediaType === 'image' || category === 'Graphic Design') && !resolvedVideoUrl;
    const isVideo = !isWebsiteFormat && !isImageFormat;
    const isWebsite = isWebsiteFormat;

    // Provide a reliable fallback video only if video format is active and no video was uploaded
    const fallbackVideo = category === 'UGC' || defaultAspectRatio === '9:16'
      ? 'https://cdn.jsdelivr.net/gh/themarcosdev/tiktok-app-frontEnd-clone-simple@master/video01.mp4'
      : (category === 'Branding Strategy'
          ? 'https://cdn.jsdelivr.net/gh/mediaelement/mediaelement-files@master/echo-hereweare.mp4'
          : 'https://cdn.jsdelivr.net/gh/bower-media-samples/big-buck-bunny-480p-30s@master/video.mp4');
      
    const computedVideoUrl = isVideo ? (resolvedVideoUrl || fallbackVideo) : undefined;
    const computedWebsiteUrl = isWebsite
      ? (editingItem.websiteUrl?.trim() || (editingItem.mediaUrl?.startsWith('http') ? editingItem.mediaUrl : 'https://malayadigital.com'))
      : undefined;
      
    // Custom poster image is optional
    let computedImageUrl = editingItem.imageUrl?.trim() || editingItem.posterUrl?.trim() || undefined;
    if (!computedImageUrl) {
      if (isVideo) {
        computedImageUrl = generateDefaultVideoPoster(
          trimmedTitle,
          category,
          editingItem.client || 'Client Brand',
          defaultAspectRatio === '9:16'
        );
      } else if (isWebsite) {
        computedImageUrl = '/src/assets/images/showcase_website_platform_1791339120555.jpg';
      } else {
        computedImageUrl = '/src/assets/images/showcase_branding_identity_1790504096628.jpg';
      }
    }

    // Multi-images for carousel or website showcase
    const computedImages = editingItem.images && editingItem.images.length > 0
      ? editingItem.images
      : (computedImageUrl ? [computedImageUrl] : undefined);

    const newItem: PortfolioItem = {
      id: targetId,
      title: trimmedTitle,
      client: (editingItem.client || 'Client Brand').trim(),
      category: category,
      description: editingItem.description || '',
      mediaType: isWebsite ? 'website' : (isVideo ? 'video' : 'image'),
      videoUrl: computedVideoUrl,
      websiteUrl: computedWebsiteUrl,
      imageUrl: computedImageUrl,
      images: computedImages,
      mediaUrl: isWebsite ? (computedWebsiteUrl || '') : (isVideo ? (computedVideoUrl || '') : (computedImageUrl || '')),
      posterUrl: computedImageUrl,
      metrics: editingItem.metrics || 'High engagement & lead conversion',
      tags: typeof editingItem.tags === 'string' 
        ? (editingItem.tags as string).split(',').map((s) => s.trim()).filter(Boolean) 
        : (editingItem.tags || ['Creative']),
      featured: editingItem.featured ?? true,
      aspectRatio: (editingItem.aspectRatio as any) || defaultAspectRatio,
    };

    let updatedList: PortfolioItem[];
    if (isExisting) {
      updatedList = itemsList.map((i) => (i.id === targetId ? newItem : i));
    } else {
      updatedList = [newItem, ...itemsList];
    }

    setItemsList(updatedList);
    onSavePortfolio(updatedList);
    setRecentlySavedId(targetId);
    setEditingItem(null);
    setIsEditingExisting(false);
    setPreviewMediaUrl('');
    setVideoUrlInput('');
    setSlideUrlInput('');
    setFormError('');
    setUploadStatus(isExisting ? `✓ Successfully updated "${newItem.title}"!` : `✓ Successfully added "${newItem.title}" to portfolio!`);
    setTimeout(() => {
      setUploadStatus('');
      setRecentlySavedId(null);
    }, 4500);
  };

  const handleDeleteItem = (id: string) => {
    const updated = itemsList.filter((item) => item.id !== id);
    setItemsList(updated);
    onSavePortfolio(updated);
    if (editingItem?.id === id) {
      setEditingItem(null);
      setIsEditingExisting(false);
      setPreviewMediaUrl('');
    }
    setItemToDelete(null);
    setUploadStatus('Project removed successfully.');
    setTimeout(() => setUploadStatus(''), 2500);
  };

  const handleStartEdit = async (item: PortfolioItem) => {
    setIsEditingExisting(true);
    setEditingItem({ ...item });
    let resolvedVideo = item.videoUrl || item.mediaUrl || '';
    if (item.mediaType === 'video' && (resolvedVideo.startsWith('indexeddb:') || !resolvedVideo)) {
      resolvedVideo = await resolveLiveVideoUrl(item.id, resolvedVideo);
    }
    const activeMedia = item.mediaType === 'video' 
      ? resolvedVideo 
      : (item.imageUrl || item.posterUrl || item.websiteUrl || item.mediaUrl || '');
    setPreviewMediaUrl(activeMedia);
    setVideoUrlInput(item.mediaType === 'video' && !resolvedVideo.startsWith('blob:') ? resolvedVideo : '');
    setFormError('');
    setUploadStatus(`Editing "${item.title}". Modify details above and click Update Project.`);
    setTimeout(() => {
      editSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 60);
  };

  // Export JSON Backup
  const handleExportBackup = () => {
    const data = {
      siteConfig,
      portfolioItems: itemsList,
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sapotlokal-cms-backup-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-4xl max-h-[90vh] bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden text-slate-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-slate-950/80">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-amber-400 text-slate-950 flex items-center justify-center font-bold">
              <Edit3 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold font-display text-white">
                Sapotlokal CMS & Visual Editor
              </h2>
              <p className="text-xs text-slate-400">
                Directly customize headlines, contact info, upload videos and images
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {onLogout && (
              <button
                onClick={() => {
                  onLogout();
                  onClose();
                }}
                className="px-3 py-1.5 text-xs font-semibold text-slate-300 hover:text-white bg-slate-900 hover:bg-red-950/40 border border-slate-700 hover:border-red-500/40 rounded-lg transition-colors cursor-pointer"
                title="Lock CMS and log out of Founder mode"
              >
                Lock CMS
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Status Toast */}
        {uploadStatus && (
          <div className="bg-emerald-500/10 border-b border-emerald-500/20 px-5 py-2 text-xs text-emerald-400 flex items-center gap-2">
            <CheckCircle className="w-4 h-4" />
            <span>{uploadStatus}</span>
          </div>
        )}

        {/* Tab Bar */}
        <div className="flex border-b border-slate-800 bg-slate-950/40 px-5 gap-3 overflow-x-auto">
          <button
            onClick={() => {
              setActiveTab('general');
              setEditingItem(null);
            }}
            className={`py-3 text-xs font-semibold border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'general'
                ? 'border-amber-400 text-amber-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Site Information & Copy
          </button>
          <button
            onClick={() => {
              setActiveTab('heroVideo');
              setEditingItem(null);
            }}
            className={`py-3 text-xs font-semibold border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'heroVideo'
                ? 'border-amber-400 text-amber-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Video className="w-3.5 h-3.5 text-amber-400" />
            <span>Showreels & Section Videos</span>
          </button>
          <button
            onClick={() => {
              setActiveTab('portfolio');
            }}
            className={`py-3 text-xs font-semibold border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'portfolio'
                ? 'border-amber-400 text-amber-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Film className="w-3.5 h-3.5" />
            <span>Portfolio & Media Upload ({itemsList.length})</span>
          </button>
          <button
            onClick={() => {
              setActiveTab('backup');
              setEditingItem(null);
            }}
            className={`py-3 text-xs font-semibold border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'backup'
                ? 'border-amber-400 text-amber-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            <span>Backup & Reset</span>
          </button>
        </div>

        {/* Tab Content Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
          {/* TAB 1: GENERAL CONFIG */}
          {activeTab === 'general' && (
            <form onSubmit={handleSaveConfig} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Company Name
                  </label>
                  <input
                    type="text"
                    value={configForm.companyName}
                    onChange={(e) => setConfigForm({ ...configForm, companyName: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-amber-400"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Corporate Tagline
                  </label>
                  <input
                    type="text"
                    value={configForm.tagline}
                    onChange={(e) => setConfigForm({ ...configForm, tagline: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-amber-400"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Hero Headline
                </label>
                <input
                  type="text"
                  value={configForm.heroHeadline}
                  onChange={(e) => setConfigForm({ ...configForm, heroHeadline: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-amber-400"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Hero Subheadline
                </label>
                <textarea
                  rows={3}
                  value={configForm.heroSubheadline}
                  onChange={(e) => setConfigForm({ ...configForm, heroSubheadline: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-amber-400"
                  required
                />
              </div>

              {/* Quick Video Settings Shortcut Banners */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-9 h-9 rounded-lg bg-amber-400/10 border border-amber-400/30 flex items-center justify-center text-amber-400 shrink-0">
                      <Video className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-white truncate">1. Hero Section Video</div>
                      <div className="text-[11px] text-slate-400 truncate">
                        {configForm.heroVideoTitle || 'Corporate Growth Advisory'}
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('heroVideo');
                      setVideoSectionSubTab('hero');
                    }}
                    className="px-2.5 py-1 text-xs font-semibold bg-amber-400 hover:bg-amber-300 text-slate-950 rounded-lg transition-colors whitespace-nowrap cursor-pointer shrink-0"
                  >
                    Configure
                  </button>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-9 h-9 rounded-lg bg-amber-400/10 border border-amber-400/30 flex items-center justify-center text-amber-400 shrink-0">
                      <Film className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-white truncate">2. Services Section Video</div>
                      <div className="text-[11px] text-slate-400 truncate">
                        {configForm.servicesVideoTitle || 'Specialized Corporate Consultancy'}
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('heroVideo');
                      setVideoSectionSubTab('services');
                    }}
                    className="px-2.5 py-1 text-xs font-semibold bg-amber-400 hover:bg-amber-300 text-slate-950 rounded-lg transition-colors whitespace-nowrap cursor-pointer shrink-0"
                  >
                    Configure
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Contact Phone (Optional)
                  </label>
                  <input
                    type="text"
                    value={configForm.phone || ''}
                    onChange={(e) => setConfigForm({ ...configForm, phone: e.target.value })}
                    placeholder="Optional phone number"
                    className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    WhatsApp Number
                  </label>
                  <input
                    type="text"
                    value={configForm.whatsappNumber || ''}
                    onChange={(e) => setConfigForm({ ...configForm, whatsappNumber: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Official Inquiries Email
                  </label>
                  <input
                    type="email"
                    value={configForm.email || 'sapotlokal.co@gmail.com'}
                    onChange={(e) => setConfigForm({ ...configForm, email: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-amber-400"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Full Corporate Address
                </label>
                <input
                  type="text"
                  value={configForm.address}
                  onChange={(e) => setConfigForm({ ...configForm, address: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-amber-400"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Company Bio & Positioning
                </label>
                <textarea
                  rows={4}
                  value={configForm.shortBio}
                  onChange={(e) => setConfigForm({ ...configForm, shortBio: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  className="flex items-center gap-2 px-5 py-2.5 text-xs font-semibold bg-amber-400 hover:bg-amber-300 text-slate-950 rounded-lg transition-colors cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>Save General Changes</span>
                </button>
              </div>
            </form>
          )}

          {/* TAB: SHOWREELS & SECTION VIDEOS (HERO & SERVICES) */}
          {activeTab === 'heroVideo' && (
            <div className="space-y-6">
              {/* Sub-tab navigation between 9:16 Intro Video, Hero Enterprise Video, and Services Video */}
              <div className="flex items-center gap-2 p-1.5 bg-slate-900 border border-slate-800 rounded-xl overflow-x-auto">
                <button
                  type="button"
                  onClick={() => setVideoSectionSubTab('intro916')}
                  className={`flex-1 py-2 px-3 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap ${
                    videoSectionSubTab === 'intro916'
                      ? 'bg-amber-400 text-slate-950 shadow-md font-bold'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <Smartphone className="w-3.5 h-3.5" />
                  <span>1. 9:16 Intro Video (Auto-Plays on Open)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setVideoSectionSubTab('hero')}
                  className={`flex-1 py-2 px-3 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap ${
                    videoSectionSubTab === 'hero'
                      ? 'bg-amber-400 text-slate-950 shadow-md font-bold'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <Video className="w-3.5 h-3.5" />
                  <span>2. Enterprise Growth Advisory (16:9)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setVideoSectionSubTab('services')}
                  className={`flex-1 py-2 px-3 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap ${
                    videoSectionSubTab === 'services'
                      ? 'bg-amber-400 text-slate-950 shadow-md font-bold'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <Film className="w-3.5 h-3.5" />
                  <span>3. Specialized Consultancy Video</span>
                </button>
              </div>

              {/* SUB-TAB: 9:16 INTRO VIDEO (Auto-plays on open above Enterprise video) */}
              {videoSectionSubTab === 'intro916' && (
                <div className="space-y-6">
                  {/* Header explanation banner */}
                  <div className="p-4 sm:p-5 bg-slate-900/90 border border-amber-500/30 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-start sm:items-center gap-3">
                      <div className="p-2.5 rounded-xl bg-amber-400/10 border border-amber-400/30 text-amber-400 shrink-0">
                        <Smartphone className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-white flex items-center gap-2">
                          <span>9:16 Intro Video Placeholder CMS</span>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 font-mono font-medium">
                            Auto-Plays First
                          </span>
                        </h3>
                        <p className="text-xs text-slate-400 mt-0.5">
                          This 9:16 vertical video placeholder sits directly above the Enterprise Growth Advisory video in the Hero section. It auto-plays as soon as visitors open the app, and when it finishes, it automatically cascades to the Enterprise video!
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleSaveConfig()}
                      className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold bg-amber-400 hover:bg-amber-300 text-slate-950 rounded-xl transition-all shadow-md shadow-amber-400/10 whitespace-nowrap self-end sm:self-auto cursor-pointer"
                    >
                      <Save className="w-3.5 h-3.5" />
                      <span>Save 9:16 Video</span>
                    </button>
                  </div>

                  {/* 1-Click Fast Presets Bar */}
                  <div className="p-3.5 bg-slate-950/70 border border-slate-800 rounded-xl flex flex-wrap items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-2 text-slate-400">
                      <Sparkles className="w-4 h-4 text-amber-400" />
                      <span className="font-semibold text-slate-300">Quick 9:16 Video Presets:</span>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleSetIntro916VideoPreset('ugc')}
                        className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 hover:border-amber-400/50 text-slate-200 text-xs font-medium transition-all cursor-pointer"
                      >
                        ⚡ High-Impact 9:16 UGC Reel
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSetIntro916VideoPreset('creative')}
                        className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 hover:border-amber-400/50 text-slate-200 text-xs font-medium transition-all cursor-pointer"
                      >
                        🎬 Cinematic 9:16 Vertical Story
                      </button>
                    </div>
                  </div>

                  {/* Grid: Inputs & Live Preview */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* Inputs Column */}
                    <div className="lg:col-span-7 space-y-4">
                      {/* Video Media Source */}
                      <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-3">
                        <label className="block text-xs font-bold text-amber-300">
                          1. Upload 9:16 Video File (.mp4, .webm, .mov)
                        </label>

                        {/* Direct File Upload */}
                        <div>
                          <label className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-amber-500/40 hover:border-amber-400 bg-amber-500/5 hover:bg-amber-500/10 rounded-xl cursor-pointer transition-colors group">
                            <Upload className="w-6 h-6 text-amber-400 group-hover:scale-110 transition-transform mb-1.5" />
                            <span className="text-xs font-semibold text-white">
                              Choose 9:16 Video File from Device
                            </span>
                            <span className="text-[10px] text-slate-400 mt-0.5">
                              Supports full 4K / HD files. Saved directly in browser database.
                            </span>
                            <input
                              type="file"
                              accept="video/mp4,video/webm,video/quicktime,video/*"
                              onChange={handleIntro916VideoFileChange}
                              className="hidden"
                            />
                          </label>

                          {intro916VideoMeta && (
                            <div className="mt-2.5 p-3 bg-emerald-950/40 border border-emerald-500/40 rounded-xl flex items-center justify-between gap-3 text-xs">
                              <div className="flex items-center gap-2 text-emerald-300">
                                <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                                <div>
                                  <div className="font-semibold text-white">Custom Uploaded 9:16 Video Active</div>
                                  <div className="text-[11px] text-emerald-400/80 font-mono">
                                    {intro916VideoMeta.name || 'custom_916.mp4'} {intro916VideoMeta.size ? `(${(intro916VideoMeta.size / (1024 * 1024)).toFixed(1)} MB)` : ''} · Saved in Browser Database
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Direct Stream URL input */}
                        <div>
                          <span className="block text-[11px] text-slate-400 mb-1">
                            Or paste public 9:16 MP4 / WebM stream URL:
                          </span>
                          <input
                            type="url"
                            value={configForm.intro916VideoUrl || ''}
                            onChange={(e) => {
                              const val = e.target.value;
                              setConfigForm({ ...configForm, intro916VideoUrl: val });
                              setIntro916VideoTestPlay(false);
                            }}
                            placeholder="https://example.com/vertical-reel.mp4"
                            className="w-full px-3 py-2 text-xs bg-slate-900 border border-slate-700 rounded-lg text-white font-mono focus:outline-none focus:border-amber-400"
                          />
                        </div>
                      </div>

                      {/* Video Poster Thumbnail (Optional) */}
                      <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-3">
                        <label className="block text-xs font-bold text-amber-300">
                          2. Video Preview Poster Thumbnail (Optional)
                        </label>
                        <input
                          type="text"
                          value={configForm.intro916VideoPoster || ''}
                          onChange={(e) => setConfigForm({ ...configForm, intro916VideoPoster: e.target.value })}
                          placeholder="/src/assets/images/... or https://..."
                          className="w-full px-3 py-2 text-xs bg-slate-900 border border-slate-700 rounded-lg text-white font-mono focus:outline-none focus:border-amber-400"
                        />
                      </div>

                      {/* Badge and Title */}
                      <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-3">
                        <label className="block text-xs font-bold text-amber-300">
                          3. Display Badge & Label
                        </label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <span className="block text-[11px] text-slate-400 mb-1">
                              Intro Video Title:
                            </span>
                            <input
                              type="text"
                              value={configForm.intro916VideoTitle || ''}
                              onChange={(e) => setConfigForm({ ...configForm, intro916VideoTitle: e.target.value })}
                              placeholder="High-Impact 9:16 Intro Reel"
                              className="w-full px-3 py-2 text-xs bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-amber-400"
                            />
                          </div>
                          <div>
                            <span className="block text-[11px] text-slate-400 mb-1">
                              Badge Pill:
                            </span>
                            <input
                              type="text"
                              value={configForm.intro916VideoBadge || ''}
                              onChange={(e) => setConfigForm({ ...configForm, intro916VideoBadge: e.target.value })}
                              placeholder="9:16 Mobile-First (Auto-Play)"
                              className="w-full px-3 py-2 text-xs bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-amber-400"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Live Preview Column */}
                    <div className="lg:col-span-5 flex flex-col items-center">
                      <div className="p-4 bg-slate-950 border border-amber-500/30 rounded-xl w-full flex flex-col items-center">
                        <div className="flex items-center justify-between w-full mb-3 text-xs">
                          <span className="font-bold text-amber-300 flex items-center gap-1.5">
                            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                            <span>Live 9:16 Preview</span>
                          </span>
                          <span className="text-[11px] text-slate-400 font-mono">9:16 Vertical Reel</span>
                        </div>

                        {/* 9:16 Preview Box */}
                        <div className="relative w-[190px] aspect-[9/16] rounded-2xl overflow-hidden border-2 border-amber-400/80 bg-black shadow-2xl group">
                          <video
                            ref={intro916VideoRef}
                            src={configForm.intro916VideoUrl || 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyBlazes.mp4'}
                            poster={configForm.intro916VideoPoster?.trim() || undefined}
                            controls
                            muted
                            playsInline
                            className="w-full h-full object-cover"
                          />
                        </div>

                        <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between w-full">
                          <span>Plays first automatically on open.</span>
                          <button
                            type="button"
                            onClick={() => handleSaveConfig()}
                            className="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs rounded-lg transition-colors cursor-pointer"
                          >
                            Save 9:16 Video
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {videoSectionSubTab === 'hero' && (
                <div className="space-y-6">
                  {/* Header explanation banner */}
                  <div className="p-4 sm:p-5 bg-slate-900/90 border border-amber-500/30 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-start sm:items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-amber-400/10 border border-amber-400/30 text-amber-400 shrink-0">
                    <Video className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <span>Hero Section Video Holder CMS</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 font-mono font-medium">
                        2-Column Layout
                      </span>
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Manage the introductory overview video explaining the website's purpose, custom video files/URLs, matching poster thumbnails, and badge labels.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleSaveConfig()}
                  className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold bg-amber-400 hover:bg-amber-300 text-slate-950 rounded-xl transition-all shadow-md shadow-amber-400/10 whitespace-nowrap self-end sm:self-auto cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Save Video Settings</span>
                </button>
              </div>

              {/* 1-Click Fast Presets Bar */}
              <div className="p-3.5 bg-slate-950/70 border border-slate-800 rounded-xl flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2 text-slate-400">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span className="font-semibold text-slate-300">Quick Video Presets:</span>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleSetHeroVideoPreset('sapotlokal')}
                    className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 hover:border-amber-400/50 text-slate-200 text-xs font-medium transition-all cursor-pointer"
                  >
                    🎬 Sapotlokal Agency Overview Reel (1:30)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSetHeroVideoPreset('consultancy')}
                    className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 hover:border-amber-400/50 text-slate-200 text-xs font-medium transition-all cursor-pointer"
                  >
                    📈 Corporate Growth Advisory Reel (1:15)
                  </button>
                </div>
              </div>

              {/* Grid: Left Column Inputs, Right Column Live Interactive Preview */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* Inputs Column */}
                <div className="lg:col-span-7 space-y-4">
                  {/* Video Media Source */}
                  <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-3">
                    <label className="block text-xs font-bold text-amber-300">
                      1. Introductory MP4 Video Stream Source
                    </label>

                    {/* Direct File Upload */}
                    <div>
                      <span className="block text-[11px] text-slate-400 mb-1.5">
                        Upload custom video file (.mp4, .webm, up to 50MB):
                      </span>
                      <label className="flex items-center justify-center gap-2 p-3 border-2 border-dashed border-slate-700 hover:border-amber-400/70 bg-slate-900/50 hover:bg-slate-900 rounded-xl cursor-pointer transition-colors group">
                        <Upload className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
                        <span className="text-xs text-slate-300 group-hover:text-white font-medium">
                          Choose Custom Video File
                        </span>
                        <input
                          type="file"
                          accept="video/mp4,video/webm,video/quicktime,video/*"
                          onChange={handleHeroVideoFileChange}
                          className="hidden"
                        />
                      </label>

                      {heroVideoMeta && (
                        <div className="mt-2.5 p-3 bg-emerald-950/40 border border-emerald-500/40 rounded-xl flex items-center justify-between gap-3 text-xs">
                          <div className="flex items-center gap-2 text-emerald-300">
                            <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                            <div>
                              <div className="font-semibold text-white">Custom Uploaded Video Active</div>
                              <div className="text-[11px] text-emerald-400/80 font-mono">
                                {heroVideoMeta.name || 'custom_video.mp4'} {heroVideoMeta.size ? `(${(heroVideoMeta.size / (1024 * 1024)).toFixed(1)} MB)` : ''} · Saved in Browser Database
                              </div>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={async () => {
                              await clearUploadedHeroVideo();
                              setHeroVideoMeta(null);
                              const updated = {
                                ...configForm,
                                heroVideoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
                              };
                              setConfigForm(updated);
                              onSaveSiteConfig(updated);
                              setUploadStatus('Reset to official agency showreel video.');
                              setTimeout(() => setUploadStatus(''), 2500);
                            }}
                            className="px-2.5 py-1 text-[11px] font-semibold text-rose-300 hover:text-white bg-rose-950/50 hover:bg-rose-900/60 border border-rose-500/30 rounded-lg transition-colors cursor-pointer"
                          >
                            ✕ Use Preset
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Direct URL input */}
                    <div>
                      <span className="block text-[11px] text-slate-400 mb-1">
                        Or provide public .mp4 stream URL:
                      </span>
                      <input
                        type="url"
                        value={configForm.heroVideoUrl || ''}
                        onChange={(e) => {
                          const val = e.target.value;
                          setConfigForm({ ...configForm, heroVideoUrl: val });
                          if (val.startsWith('http://') || val.startsWith('https://')) {
                            clearUploadedHeroVideo().catch(console.error);
                            setHeroVideoMeta(null);
                          }
                          setHeroVideoTestPlay(false);
                        }}
                        placeholder="https://example.com/agency-overview.mp4"
                        className="w-full px-3 py-2 text-xs bg-slate-900 border border-slate-700 rounded-lg text-white font-mono focus:outline-none focus:border-amber-400"
                      />
                    </div>
                  </div>

                  {/* Video Poster Thumbnail (Optional) */}
                  <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <label className="block text-xs font-bold text-amber-300">
                          2. Video Preview Poster Thumbnail (Optional)
                        </label>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          If omitted, the video's first frame is used automatically as thumbnail via preload="metadata".
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {configForm.heroVideoPoster && (
                          <button
                            type="button"
                            onClick={async () => {
                              await clearUploadedHeroPoster();
                              const updated = {
                                ...configForm,
                                heroVideoPoster: '',
                              };
                              setConfigForm(updated);
                              onSaveSiteConfig(updated);
                              setUploadStatus('Cleared custom poster! Video first frame will be used dynamically.');
                              setTimeout(() => setUploadStatus(''), 2500);
                            }}
                            className="text-[11px] text-red-400 hover:text-red-300 font-medium cursor-pointer"
                          >
                            ✕ Use Video First Frame
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => {
                            setConfigForm((prev) => ({
                              ...prev,
                              heroVideoPoster: '/src/assets/images/hero_sapotlokal_agency_1790504057787.jpg',
                            }));
                            setUploadStatus('Applied agency studio poster thumbnail preset!');
                            setTimeout(() => setUploadStatus(''), 2500);
                          }}
                          className="text-[11px] text-amber-400 hover:text-amber-300 cursor-pointer"
                        >
                          Reset Default Poster
                        </button>
                      </div>
                    </div>

                    {/* Direct Image File Upload */}
                    <div>
                      <span className="block text-[11px] text-slate-400 mb-1.5">
                        Upload custom thumbnail image (Optional):
                      </span>
                      <label className="flex items-center justify-center gap-2 p-3 border-2 border-dashed border-slate-700 hover:border-amber-400/70 bg-slate-900/50 hover:bg-slate-900 rounded-xl cursor-pointer transition-colors group">
                        <Camera className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
                        <span className="text-xs text-slate-300 group-hover:text-white font-medium">
                          Choose Thumbnail Image File (Optional)
                        </span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleHeroPosterFileChange}
                          className="hidden"
                        />
                      </label>
                    </div>

                    {/* Direct Poster URL */}
                    <div>
                      <span className="block text-[11px] text-slate-400 mb-1">
                        Or specify poster image URL (Optional - leave empty for video first frame):
                      </span>
                      <input
                        type="text"
                        value={configForm.heroVideoPoster || ''}
                        onChange={(e) => setConfigForm({ ...configForm, heroVideoPoster: e.target.value })}
                        placeholder="Leave empty to use video initial frame, or /src/assets/images/... / https://..."
                        className="w-full px-3 py-2 text-xs bg-slate-900 border border-slate-700 rounded-lg text-white font-mono focus:outline-none focus:border-amber-400"
                      />
                    </div>
                  </div>

                  {/* Title & Badge Metadata */}
                  <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-3">
                    <label className="block text-xs font-bold text-amber-300">
                      3. Display Titles & Badges
                    </label>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <span className="block text-[11px] text-slate-400 mb-1">
                          Overview Video Title:
                        </span>
                        <input
                          type="text"
                          value={configForm.heroVideoTitle || ''}
                          onChange={(e) => setConfigForm({ ...configForm, heroVideoTitle: e.target.value })}
                          placeholder="Sapotlokal Overview & Strategic Advisory Showreel"
                          className="w-full px-3 py-2 text-xs bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-amber-400"
                        />
                      </div>
                      <div>
                        <span className="block text-[11px] text-slate-400 mb-1">
                          Badge Label (Top-Left Pill):
                        </span>
                        <input
                          type="text"
                          value={configForm.heroVideoBadge || ''}
                          onChange={(e) => setConfigForm({ ...configForm, heroVideoBadge: e.target.value })}
                          placeholder="Watch Overview (1:30)"
                          className="w-full px-3 py-2 text-xs bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-amber-400"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Live Preview Column */}
                <div className="lg:col-span-5 flex flex-col">
                  <div className="p-4 bg-slate-950 border border-amber-500/30 rounded-xl flex-1 flex flex-col">
                    <div className="flex items-center justify-between mb-3 text-xs">
                      <span className="font-bold text-amber-300 flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                        <span>Live Video Holder Preview</span>
                      </span>
                      <span className="text-[11px] text-slate-400 font-mono">16:9 Player</span>
                    </div>

                    {/* Preview Box */}
                    <div className="relative aspect-video w-full rounded-xl overflow-hidden border border-slate-700/80 bg-slate-900 shadow-xl group">
                      {!heroVideoTestPlay ? (
                        <div
                          onClick={() => setHeroVideoTestPlay(true)}
                          className="relative w-full h-full cursor-pointer select-none"
                        >
                          {configForm.heroVideoPoster ? (
                            <img
                              src={configForm.heroVideoPoster}
                              alt="Hero Video Preview"
                              className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
                              referrerPolicy="no-referrer"
                            />
                          ) : (
                            <video
                              src={configForm.heroVideoUrl || 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4'}
                              preload="metadata"
                              muted
                              playsInline
                              className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300 pointer-events-none"
                            />
                          )}
                          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-slate-950/20" />
                          <div className="absolute inset-0 bg-gradient-to-r from-amber-500/10 via-transparent to-slate-950/30" />

                          {/* Badge */}
                          <div className="absolute top-2.5 left-2.5 z-10 flex items-center gap-1.5">
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-slate-950/85 border border-amber-400/50 text-amber-300">
                              <Sparkles className="w-2.5 h-2.5 text-amber-400" />
                              <span>{configForm.heroVideoBadge || 'Watch Overview (1:30)'}</span>
                            </span>
                            {!configForm.heroVideoPoster && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-mono bg-emerald-950/80 border border-emerald-500/40 text-emerald-300">
                                Dynamic First Frame
                              </span>
                            )}
                          </div>

                          {/* Play overlay */}
                          <div className="absolute inset-0 flex items-center justify-center z-10">
                            <div className="w-12 h-12 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform pl-0.5">
                              <Play className="w-5 h-5 fill-slate-950 text-slate-950" />
                            </div>
                          </div>

                          {/* Title */}
                          <div className="absolute bottom-0 inset-x-0 p-2.5 z-10 bg-gradient-to-t from-slate-950 via-slate-950/80 to-transparent text-[11px] font-semibold text-white truncate">
                            {configForm.heroVideoTitle || 'Sapotlokal Overview & Strategic Advisory Showreel'}
                          </div>
                        </div>
                      ) : (
                        <div className="relative w-full h-full bg-black">
                          <video
                            ref={heroVideoRef}
                            src={configForm.heroVideoUrl || 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4'}
                            poster={configForm.heroVideoPoster?.trim() || undefined}
                            preload="metadata"
                            controls
                            autoPlay
                            playsInline
                            className="w-full h-full object-contain"
                          />
                          <button
                            type="button"
                            onClick={() => setHeroVideoTestPlay(false)}
                            className="absolute top-2 right-2 p-1.5 bg-slate-950/90 text-slate-300 hover:text-white rounded-lg text-[10px] border border-slate-700 cursor-pointer"
                          >
                            Reset
                          </button>
                        </div>
                      )}
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
                      <span>Click preview thumbnail above to test playback.</span>
                      <button
                        type="button"
                        onClick={() => handleSaveConfig()}
                        className="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs rounded-lg transition-colors cursor-pointer"
                      >
                        Save Hero Video
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SUB-TAB: SERVICES SECTION VIDEO (Specialized Corporate Consultancy & Media Production) */}
          {videoSectionSubTab === 'services' && (
            <div className="space-y-6">
              {/* Header explanation banner */}
              <div className="p-4 sm:p-5 bg-slate-900/90 border border-amber-500/30 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-start sm:items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-amber-400/10 border border-amber-400/30 text-amber-400 shrink-0">
                    <Film className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <span>Specialized Corporate Consultancy & Media Production Video CMS</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 font-mono font-medium">
                        Invisible Placeholder
                      </span>
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Configure the video and interactive 3D play button positioned directly next to the "Specialized Corporate Consultancy & Media Production" section.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleSaveConfig()}
                  className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold bg-amber-400 hover:bg-amber-300 text-slate-950 rounded-xl transition-all shadow-md shadow-amber-400/10 whitespace-nowrap self-end sm:self-auto cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Save Services Video</span>
                </button>
              </div>

              {/* 1-Click Fast Presets Bar */}
              <div className="p-3.5 bg-slate-950/70 border border-slate-800 rounded-xl flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2 text-slate-400">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span className="font-semibold text-slate-300">Quick Showreel Presets:</span>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleSetServicesVideoPreset('consultancy')}
                    className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 hover:border-amber-400/50 text-slate-200 text-xs font-medium transition-all cursor-pointer"
                  >
                    ⚡ Corporate Consultancy Overview (1:45)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSetServicesVideoPreset('commercial')}
                    className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 hover:border-amber-400/50 text-slate-200 text-xs font-medium transition-all cursor-pointer"
                  >
                    🎬 Kinetic Commercial Reel & Motion (1:30)
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* Left Form: Video upload & details */}
                <div className="lg:col-span-7 space-y-4">
                  {/* Video File / URL Upload Box */}
                  <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="block text-xs font-bold text-amber-300">
                        1. Upload Video File (.mp4, .webm, .mov)
                      </label>
                      <span className="text-[11px] text-emerald-400 font-medium">
                        Saved in Browser Database
                      </span>
                    </div>

                    {/* File Upload Trigger */}
                    <div>
                      <label className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-amber-500/40 hover:border-amber-400 bg-amber-500/5 hover:bg-amber-500/10 rounded-xl cursor-pointer transition-colors group">
                        <Upload className="w-6 h-6 text-amber-400 group-hover:scale-110 transition-transform mb-1.5" />
                        <span className="text-xs font-semibold text-white">
                          Choose Video File from Device
                        </span>
                        <span className="text-[10px] text-slate-400 mt-0.5">
                          Supports full 4K / HD files. Automatically saved locally.
                        </span>
                        <input
                          type="file"
                          accept="video/mp4,video/webm,video/quicktime,video/*"
                          onChange={handleServicesVideoFileChange}
                          className="hidden"
                        />
                      </label>

                      {servicesVideoMeta && (
                        <div className="mt-2.5 p-3 bg-emerald-950/40 border border-emerald-500/40 rounded-xl flex items-center justify-between gap-3 text-xs">
                          <div className="flex items-center gap-2 text-emerald-300">
                            <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                            <div>
                              <div className="font-semibold text-white">Custom Uploaded Video Active</div>
                              <div className="text-[11px] text-emerald-400/80 font-mono">
                                {servicesVideoMeta.name || 'custom_video.mp4'}{' '}
                                {servicesVideoMeta.size
                                  ? `(${(servicesVideoMeta.size / (1024 * 1024)).toFixed(1)} MB)`
                                  : ''}{' '}
                                · Saved in Browser Database
                              </div>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={async () => {
                              await clearUploadedServicesVideo();
                              setServicesVideoMeta(null);
                              const updated = {
                                ...configForm,
                                servicesVideoUrl:
                                  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyBlazes.mp4',
                              };
                              setConfigForm(updated);
                              onSaveSiteConfig(updated);
                              setUploadStatus('Reset to official consultancy showreel.');
                              setTimeout(() => setUploadStatus(''), 2500);
                            }}
                            className="px-2.5 py-1 text-[11px] font-semibold text-rose-300 hover:text-white bg-rose-950/50 hover:bg-rose-900/60 border border-rose-500/30 rounded-lg transition-colors cursor-pointer"
                          >
                            ✕ Use Preset
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Direct URL input */}
                    <div>
                      <span className="block text-[11px] text-slate-400 mb-1">
                        Or provide public .mp4 stream URL:
                      </span>
                      <input
                        type="url"
                        value={configForm.servicesVideoUrl || ''}
                        onChange={(e) => {
                          const val = e.target.value;
                          setConfigForm({ ...configForm, servicesVideoUrl: val });
                          if (val.startsWith('http://') || val.startsWith('https://')) {
                            clearUploadedServicesVideo().catch(console.error);
                            setServicesVideoMeta(null);
                          }
                          setServicesVideoTestPlay(false);
                        }}
                        placeholder="https://example.com/corporate-consultancy-reel.mp4"
                        className="w-full px-3 py-2 text-xs bg-slate-900 border border-slate-700 rounded-lg text-white font-mono focus:outline-none focus:border-amber-400"
                      />
                    </div>
                  </div>

                  {/* Video Title and Badge Text Customizer */}
                  <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-3">
                    <label className="block text-xs font-bold text-amber-300">
                      2. Video Title & Badge Labels
                    </label>
                    <div>
                      <label className="block text-[11px] text-slate-400 mb-1">
                        In-Player Video Title
                      </label>
                      <input
                        type="text"
                        value={configForm.servicesVideoTitle || ''}
                        onChange={(e) =>
                          setConfigForm({ ...configForm, servicesVideoTitle: e.target.value })
                        }
                        placeholder="Specialized Corporate Consultancy & Media Production Overview"
                        className="w-full px-3 py-2 text-xs bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-amber-400"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-slate-400 mb-1">
                        Floating 3D Play Button Badge Text
                      </label>
                      <input
                        type="text"
                        value={configForm.servicesVideoBadge || ''}
                        onChange={(e) =>
                          setConfigForm({ ...configForm, servicesVideoBadge: e.target.value })
                        }
                        placeholder="Consultancy & Production Reel (1:45)"
                        className="w-full px-3 py-2 text-xs bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-amber-400"
                      />
                    </div>
                  </div>
                </div>

                {/* Right Column: Live Video Playback Test Preview */}
                <div className="lg:col-span-5 bg-slate-950 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-bold text-white flex items-center gap-1.5">
                        <Play className="w-3.5 h-3.5 text-amber-400" />
                        <span>Live Player Preview</span>
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">
                        HTML5 Video
                      </span>
                    </div>

                    {/* Video Canvas Container */}
                    <div className="relative aspect-video w-full rounded-xl overflow-hidden bg-black border border-slate-800 group flex items-center justify-center">
                      {!servicesVideoTestPlay ? (
                        <div
                          onClick={() => setServicesVideoTestPlay(true)}
                          className="w-full h-full relative cursor-pointer flex flex-col items-center justify-center bg-slate-950 text-center p-4 hover:bg-slate-900 transition-colors"
                        >
                          <video
                            src={
                              configForm.servicesVideoUrl ||
                              'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyBlazes.mp4'
                            }
                            preload="metadata"
                            muted
                            playsInline
                            className="absolute inset-0 w-full h-full object-cover opacity-60 pointer-events-none"
                          />
                          <div className="absolute inset-0 bg-slate-950/40" />

                          {/* Play Button Indicator */}
                          <div className="relative z-10 w-14 h-14 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center pl-1 shadow-lg shadow-amber-400/40 group-hover:scale-110 transition-transform">
                            <Play className="w-6 h-6 fill-slate-950" />
                          </div>

                          <div className="relative z-10 mt-3 text-xs font-semibold text-white">
                            <span>{configForm.servicesVideoBadge || 'Consultancy & Production Reel (1:45)'}</span>
                          </div>
                          <span className="relative z-10 text-[10px] text-amber-400/90 font-mono mt-0.5">
                            Click to test playback
                          </span>
                        </div>
                      ) : (
                        <div className="w-full h-full relative bg-black flex flex-col">
                          {/* Top Bar placed CLEANLY ABOVE */}
                          <div className="flex items-center justify-between px-3 py-1.5 bg-slate-900 border-b border-slate-800 text-xs">
                            <span className="text-white font-medium truncate max-w-[200px]">
                              {configForm.servicesVideoTitle ||
                                'Specialized Corporate Consultancy & Media Production Overview'}
                            </span>
                            <button
                              type="button"
                              onClick={() => setServicesVideoTestPlay(false)}
                              className="text-[11px] font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1 cursor-pointer"
                            >
                              <X className="w-3 h-3" />
                              <span>Close</span>
                            </button>
                          </div>
                          <video
                            ref={servicesVideoRef}
                            src={
                              configForm.servicesVideoUrl ||
                              'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyBlazes.mp4'
                            }
                            preload="metadata"
                            controls
                            autoPlay
                            playsInline
                            className="w-full flex-1 object-contain"
                          />
                        </div>
                      )}
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
                      <span>Click preview thumbnail above to test playback.</span>
                      <button
                        type="button"
                        onClick={() => handleSaveConfig()}
                        className="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs rounded-lg transition-colors cursor-pointer"
                      >
                        Save Services Video
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

          {/* TAB 2: PORTFOLIO & MEDIA UPLOADER */}
          {activeTab === 'portfolio' && (
            <div className="space-y-6">
              {/* If editing an item or creating a new one */}
              {editingItem ? (
                <div ref={editSectionRef} className="p-4 sm:p-5 bg-slate-950 border border-amber-500/30 rounded-xl space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-amber-300">
                      {isEditingExisting ? 'Edit Portfolio Showcase' : 'Add New Portfolio Project'}
                    </h3>
                    <button
                      onClick={() => {
                        setEditingItem(null);
                        setPreviewMediaUrl('');
                      }}
                      className="text-xs text-slate-400 hover:text-white"
                    >
                      Cancel
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1">
                        Project Title *
                      </label>
                      <input
                        type="text"
                        value={editingItem.title || ''}
                        onChange={(e) => setEditingItem({ ...editingItem, title: e.target.value })}
                        placeholder="e.g. Commercial 4K Reel & Color Grading"
                        className="w-full px-3 py-2 text-xs bg-slate-900 border border-slate-700 rounded-lg text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1">
                        Client / Brand Name
                      </label>
                      <input
                        type="text"
                        value={editingItem.client || ''}
                        onChange={(e) => setEditingItem({ ...editingItem, client: e.target.value })}
                        placeholder="e.g. Malaya Artisan Roasters"
                        className="w-full px-3 py-2 text-xs bg-slate-900 border border-slate-700 rounded-lg text-white"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1">
                        Core Service Category *
                      </label>
                      <select
                        value={editingItem.category || 'Video Editing'}
                        onChange={(e) => {
                          const newCat = e.target.value as ServiceCategory;
                          const newMediaType = newCat === 'Website Building' ? 'website' : (newCat === 'Graphic Design' ? 'image' : 'video');
                          setEditingItem({
                            ...editingItem,
                            category: newCat,
                            aspectRatio: newCat === 'UGC' ? '9:16' : (editingItem.aspectRatio || '16:9'),
                            mediaType: newMediaType,
                          });
                        }}
                        className="w-full px-3 py-2 text-xs bg-slate-900 border border-slate-700 rounded-lg text-white"
                      >
                        <option value="Website Building">Website Building</option>
                        <option value="Video Editing">Video Editing</option>
                        <option value="Social Content">Social Content</option>
                        <option value="Graphic Design">Graphic Design</option>
                        <option value="UGC">UGC (User Generated Content)</option>
                        <option value="Branding Strategy">Branding Strategy</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1">
                        Media Format
                      </label>
                      <select
                        value={editingItem.mediaType || 'video'}
                        onChange={(e) =>
                          setEditingItem({
                            ...editingItem,
                            mediaType: e.target.value as 'video' | 'image' | 'website',
                          })
                        }
                        className="w-full px-3 py-2 text-xs bg-slate-900 border border-slate-700 rounded-lg text-white"
                      >
                        <option value="video">Video Reel (MP4 / WebM / Walkthrough)</option>
                        <option value="website">Website / Web Platform (Live Embed)</option>
                        <option value="image">Multi-Slide Image Showcase</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1">
                        Display Layout & Frame
                      </label>
                      <select
                        value={editingItem.aspectRatio || (editingItem.category === 'UGC' ? '9:16' : '16:9')}
                        onChange={(e) =>
                          setEditingItem({
                            ...editingItem,
                            aspectRatio: e.target.value as any,
                          })
                        }
                        className="w-full px-3 py-2 text-xs bg-slate-900 border border-slate-700 rounded-lg text-white"
                      >
                        <option value="16:9">16:9 Widescreen Cinematic / Browser</option>
                        <option value="9:16">9:16 Vertical Mobile Phone Frame (UGC / TikTok)</option>
                        <option value="4:3">4:3 Showcase Editorial</option>
                      </select>
                    </div>
                  </div>

                  {/* Quick Preset Pickers */}
                  <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-xl flex flex-wrap items-center justify-between gap-2.5">
                    <span className="text-[11px] font-semibold text-slate-300 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                      <span>Quick Showcase Templates:</span>
                    </span>
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={handleSelectWebsiteBuildingPreset}
                        className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold bg-slate-900 hover:bg-slate-800 text-emerald-300 border border-emerald-400/30 rounded-lg transition-colors cursor-pointer"
                      >
                        <Globe className="w-3 h-3 text-emerald-400" />
                        <span>Website Building Showcase</span>
                      </button>
                      <button
                        type="button"
                        onClick={handleSelectVerticalUGCPreset}
                        className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold bg-slate-900 hover:bg-slate-800 text-amber-300 border border-amber-400/30 rounded-lg transition-colors cursor-pointer"
                      >
                        <Smartphone className="w-3 h-3 text-amber-400" />
                        <span>9:16 UGC Mobile Reel</span>
                      </button>
                      <button
                        type="button"
                        onClick={handleSelect4KCommercialPreset}
                        className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 rounded-lg transition-colors cursor-pointer"
                      >
                        <Film className="w-3 h-3 text-amber-400" />
                        <span>4K Commercial Reel</span>
                      </button>
                    </div>
                  </div>

                  {/* MEDIA FILE UPLOADERS */}
                  <div className="border border-slate-800 bg-slate-900/60 p-4 sm:p-5 rounded-xl space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-200">
                        {editingItem.mediaType === 'website' || editingItem.category === 'Website Building'
                          ? 'Website Platform & Interactive Embed'
                          : editingItem.mediaType === 'image'
                            ? 'Image Carousel Slides Uploader'
                            : 'Video Reel & Walkthrough Uploader'}
                      </span>
                      {editingItem.aspectRatio === '9:16' && (
                        <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30 flex items-center gap-1">
                          <Smartphone className="w-3 h-3" />
                          <span>9:16 Mobile Phone Frame Active</span>
                        </span>
                      )}
                    </div>

                    {editingItem.mediaType === 'website' || editingItem.category === 'Website Building' ? (
                      /* WEBSITE BUILDING MEDIA UPLOADER (Pure Web Embed) */
                      <div className="space-y-4">
                        {/* Option to attach video walkthrough */}
                        <div className="p-3 bg-amber-400/10 border border-amber-400/30 rounded-xl flex items-center justify-between">
                          <div className="text-xs text-amber-300">
                            <span className="font-bold">Have a video walkthrough or screen recording of this website?</span>
                            <span className="block text-[11px] text-slate-400">Switch to video reel mode to upload an MP4/WebM walkthrough.</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => setEditingItem({ ...editingItem, mediaType: 'video' })}
                            className="px-3 py-1.5 text-xs font-bold bg-amber-400 hover:bg-amber-300 text-slate-950 rounded-lg cursor-pointer transition-colors"
                          >
                            + Switch to Video Reel
                          </button>
                        </div>

                        <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5 font-mono">
                              <Globe className="w-4 h-4" />
                              <span>Website Platform URL (e.g. https://yourdomain.com)</span>
                            </span>
                            <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">
                              Live Interactive Embed
                            </span>
                          </div>

                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={editingItem.websiteUrl || (editingItem.mediaUrl?.startsWith('http') ? editingItem.mediaUrl : '')}
                              onChange={(e) =>
                                setEditingItem({
                                  ...editingItem,
                                  mediaType: 'website',
                                  websiteUrl: e.target.value,
                                  mediaUrl: e.target.value,
                                })
                              }
                              placeholder="https://yourdomain.com"
                              className="flex-1 px-3 py-2 text-xs bg-slate-900 border border-slate-700 rounded-lg text-white font-mono focus:outline-none focus:border-amber-400"
                            />
                          </div>
                        </div>

                        {/* Screenshot / Mockup Image File Upload */}
                        <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-3">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <div>
                              <span className="text-xs font-semibold text-slate-200 block">
                                Website UI Screenshot / Mockup Image
                              </span>
                              <span className="text-[11px] text-slate-400">
                                Upload a real web platform screenshot or enter a mockup URL
                              </span>
                            </div>

                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => websiteScreenshotInputRef.current?.click()}
                                className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 rounded-xl font-bold text-xs cursor-pointer shadow-sm transition-all"
                              >
                                <Upload className="w-4 h-4" />
                                <span>Upload Screenshot (.png, .jpg)</span>
                              </button>
                              <input
                                ref={websiteScreenshotInputRef}
                                type="file"
                                accept="image/*"
                                onChange={handleWebsiteScreenshotUpload}
                                className="hidden"
                              />
                            </div>
                          </div>

                          {/* Screenshot URL input */}
                          <div>
                            <input
                              type="text"
                              value={editingItem.imageUrl || editingItem.posterUrl || ''}
                              onChange={(e) => {
                                const val = e.target.value;
                                setEditingItem({
                                  ...editingItem,
                                  imageUrl: val,
                                  posterUrl: val,
                                });
                                setPreviewMediaUrl(val);
                              }}
                              placeholder="Screenshot image URL (https://... or uploaded image)"
                              className="w-full px-3 py-2 text-xs bg-slate-900 border border-slate-700 rounded-lg text-white font-mono placeholder-slate-500"
                            />
                          </div>

                          {/* Browser Mockup Preview */}
                          <div className="mt-3 p-3 bg-slate-900/80 rounded-xl border border-slate-800">
                            <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800 select-none">
                              <div className="flex items-center gap-1.5">
                                <div className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
                                <div className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
                                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
                              </div>
                              <div className="flex items-center gap-1 px-3 py-0.5 rounded bg-slate-950 border border-slate-800 text-[10px] font-mono text-slate-300">
                                <Lock className="w-2.5 h-2.5 text-emerald-400" />
                                <span className="text-amber-300 font-semibold">{editingItem.websiteUrl || 'https://yourdomain.com'}</span>
                              </div>
                              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                                Embedded App
                              </span>
                            </div>

                            <div className="relative aspect-video max-h-60 bg-slate-950 rounded-lg overflow-hidden border border-slate-800 flex items-center justify-center">
                              {editingItem.imageUrl || editingItem.posterUrl ? (
                                <img
                                  src={editingItem.imageUrl || editingItem.posterUrl}
                                  alt="Website Screenshot"
                                  className="w-full h-full object-cover object-top"
                                />
                              ) : (
                                <div className="text-center p-4">
                                  <Globe className="w-8 h-8 text-emerald-400 mx-auto mb-2 opacity-60" />
                                  <p className="text-xs text-slate-400">Upload a website UI screenshot or enter a mockup URL above</p>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : editingItem.mediaType === 'image' ? (
                      /* MULTI-IMAGE CAROUSEL UPLOADER */
                      <div className="space-y-4">
                        {/* File Upload Button + Preset Button */}
                        <div className="flex flex-wrap items-center justify-between gap-2.5 p-3.5 bg-slate-950 rounded-xl border border-slate-800">
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => slideFileInputRef.current?.click()}
                              className="flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-amber-300 border border-amber-400/40 hover:border-amber-400 rounded-xl font-bold text-xs cursor-pointer shadow-sm transition-all"
                            >
                              <Upload className="w-4 h-4 text-amber-400" />
                              <span>+ Upload Slide Files (.jpg, .png, .webp)</span>
                            </button>
                            <input
                              ref={slideFileInputRef}
                              type="file"
                              multiple
                              accept="image/*"
                              onChange={handleMultipleImagesUpload}
                              className="hidden"
                            />
                          </div>

                          <button
                            type="button"
                            onClick={handleLoadPresetSlides}
                            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 rounded-lg cursor-pointer transition-colors"
                          >
                            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                            <span>+ Load 4 Demo Slides</span>
                          </button>
                        </div>

                        {/* Add Image Slide via URL */}
                        <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
                          <label className="block text-[11px] font-semibold text-slate-300">
                            Or Add Slide by Image URL:
                          </label>
                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={slideUrlInput}
                              onChange={(e) => setSlideUrlInput(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  e.preventDefault();
                                  handleAddSlideUrl();
                                }
                              }}
                              placeholder="https://example.com/slide-image.jpg or /src/assets/..."
                              className="flex-1 px-3 py-2 text-xs bg-slate-900 border border-slate-700 rounded-lg text-white font-mono placeholder-slate-500 focus:outline-none focus:border-amber-400"
                            />
                            <button
                              type="button"
                              onClick={() => handleAddSlideUrl()}
                              className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold bg-amber-400 hover:bg-amber-300 text-slate-950 rounded-lg cursor-pointer shadow-sm active:scale-95 transition-all"
                            >
                              <Plus className="w-3.5 h-3.5 stroke-[3]" />
                              <span>+ Add Slide</span>
                            </button>
                          </div>
                        </div>

                        {/* List of current carousel images */}
                        {editingItem.images && editingItem.images.length > 0 ? (
                          <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 space-y-2.5">
                            <div className="flex items-center justify-between">
                              <span className="text-[11px] font-semibold text-slate-200">
                                Active Carousel Slides ({editingItem.images.length})
                              </span>
                              <span className="text-[10px] text-slate-400 font-mono">
                                Drag/reorder or click to preview
                              </span>
                            </div>
                            <div className="flex flex-wrap gap-2.5">
                              {editingItem.images.map((imgUrl, idx) => (
                                <div
                                  key={idx}
                                  onClick={() => setPreviewMediaUrl(imgUrl)}
                                  className="relative group w-24 h-20 rounded-lg overflow-hidden border border-slate-700 hover:border-amber-400 bg-slate-900 flex-shrink-0 cursor-pointer transition-all shadow-sm"
                                  title="Click to inspect this slide in preview"
                                >
                                  <img
                                    src={imgUrl}
                                    alt={`Slide ${idx + 1}`}
                                    className="w-full h-full object-cover"
                                  />
                                  <div className="absolute top-1 left-1 bg-black/80 px-1.5 py-0.5 rounded text-[9px] font-bold text-amber-300 font-mono">
                                    #{idx + 1}
                                  </div>
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleRemoveSlideImage(idx);
                                    }}
                                    className="absolute top-1 right-1 w-5 h-5 bg-red-600 hover:bg-red-500 text-white rounded-full flex items-center justify-center text-xs opacity-90 hover:opacity-100 transition-opacity cursor-pointer shadow-md"
                                    title="Remove this slide"
                                  >
                                    ✕
                                  </button>
                                  <span className="absolute bottom-0 left-0 right-0 bg-black/75 text-[9px] text-center text-slate-200 py-0.5 font-mono">
                                    Slide {idx + 1}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        ) : (
                          <div className="p-4 bg-slate-950/60 rounded-xl border border-dashed border-slate-800 text-center">
                            <p className="text-xs text-slate-400">
                              No slide images added yet. Click &quot;+ Upload Slide Files&quot; or enter an image URL above.
                            </p>
                          </div>
                        )}
                      </div>
                    ) : (
                      /* VIDEO UPLOADER WITH OPTIONAL POSTER */
                      <div className="space-y-4">
                        {/* 1. Video URL Input with dedicated [+ Add Video URL] Button */}
                        <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
                          <label className="block text-[11px] font-semibold text-slate-300">
                            1. Enter MP4 / WebM Video Stream URL:
                          </label>
                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={
                                videoUrlInput !== ''
                                  ? videoUrlInput
                                  : (editingItem.videoUrl && !editingItem.videoUrl.startsWith('blob:') && !editingItem.videoUrl.startsWith('indexeddb:'))
                                    ? editingItem.videoUrl
                                    : ''
                              }
                              onChange={(e) => {
                                const val = e.target.value;
                                setVideoUrlInput(val);
                                setEditingItem({
                                  ...editingItem,
                                  videoUrl: val,
                                  mediaUrl: val,
                                });
                                setPreviewMediaUrl(val);
                              }}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  e.preventDefault();
                                  handleAddVideoUrl();
                                }
                              }}
                              placeholder="https://commondatastorage.googleapis.com/.../ForBiggerBlazes.mp4"
                              className="flex-1 px-3 py-2 text-xs bg-slate-900 border border-slate-700 rounded-lg text-white font-mono placeholder-slate-500 focus:outline-none focus:border-amber-400"
                            />
                            <button
                              type="button"
                              onClick={() => handleAddVideoUrl()}
                              className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold bg-amber-400 hover:bg-amber-300 text-slate-950 rounded-lg cursor-pointer shadow-sm active:scale-95 transition-all whitespace-nowrap"
                            >
                              <Film className="w-3.5 h-3.5" />
                              <span>+ Add Video URL</span>
                            </button>
                          </div>

                          {/* Quick 1-Click Video Presets */}
                          <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px]">
                            <span className="text-slate-400 font-mono text-[10px]">Guaranteed 4K video streams:</span>
                            <button
                              type="button"
                              onClick={() => handleAddVideoUrl('https://cdn.jsdelivr.net/gh/bower-media-samples/big-buck-bunny-480p-30s@master/video.mp4')}
                              className="px-2 py-0.5 rounded bg-slate-900 hover:bg-slate-800 text-amber-300 border border-slate-700 hover:border-amber-400/50 cursor-pointer transition-colors text-[10px] font-semibold"
                            >
                              🎬 4K Commercial Reel
                            </button>
                            <button
                              type="button"
                              onClick={() => handleAddVideoUrl('https://cdn.jsdelivr.net/gh/themarcosdev/tiktok-app-frontEnd-clone-simple@master/video01.mp4')}
                              className="px-2 py-0.5 rounded bg-slate-900 hover:bg-slate-800 text-emerald-300 border border-slate-700 hover:border-emerald-400/50 cursor-pointer transition-colors text-[10px] font-semibold"
                            >
                              📱 9:16 Vertical UGC
                            </button>
                            <button
                              type="button"
                              onClick={() => handleAddVideoUrl('https://cdn.jsdelivr.net/gh/mediaelement/mediaelement-files@master/echo-hereweare.mp4')}
                              className="px-2 py-0.5 rounded bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 hover:border-slate-500 cursor-pointer transition-colors text-[10px] font-semibold"
                            >
                              📈 Business Showreel
                            </button>
                          </div>
                        </div>

                        {/* 2. File Upload Button Strip */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <button
                            type="button"
                            onClick={() => videoFileInputRef.current?.click()}
                            className="flex flex-col items-center justify-center p-3.5 border border-dashed border-slate-700 hover:border-amber-400/80 rounded-xl bg-slate-950/70 hover:bg-slate-900 transition-all cursor-pointer text-center group"
                          >
                            <Film className="w-5 h-5 text-amber-400 mb-1 group-hover:scale-110 transition-transform" />
                            <span className="text-xs font-bold text-slate-200 group-hover:text-amber-300">
                              + Upload Video File (.mp4, .webm)
                            </span>
                            <span className="text-[10px] text-slate-400 mt-0.5">
                              Extracts frame poster & persists in storage
                            </span>
                          </button>
                          <input
                            ref={videoFileInputRef}
                            type="file"
                            accept="video/*"
                            onChange={handleVideoFileChange}
                            className="hidden"
                          />

                          <label className="flex flex-col items-center justify-center p-3.5 border border-dashed border-slate-700 hover:border-amber-400/80 rounded-xl bg-slate-950/70 hover:bg-slate-900 transition-all cursor-pointer text-center group">
                            <ImageIcon className="w-5 h-5 text-amber-300 mb-1 group-hover:scale-110 transition-transform" />
                            <span className="text-xs font-bold text-slate-200 group-hover:text-amber-300">
                              Upload Custom Poster Image (Optional)
                            </span>
                            <span className="text-[10px] text-slate-400 mt-0.5">
                              If omitted, video first frame is used automatically
                            </span>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleImageFileChange}
                              className="hidden"
                            />
                          </label>
                        </div>

                        {/* Video Active Confirmation Banner */}
                        {(previewMediaUrl || editingItem.videoUrl) && (
                          <div className="p-3 bg-emerald-950/40 border border-emerald-500/40 rounded-xl flex items-center justify-between text-xs text-emerald-300">
                            <div className="flex items-center gap-2">
                              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                              <span className="font-bold">Video Active & Loaded:</span>
                              <span className="font-mono text-[11px] text-slate-300 truncate max-w-[240px]">
                                {editingItem.videoUrl?.startsWith('blob:')
                                  ? 'Custom Uploaded Video File (Live in Session)'
                                  : editingItem.videoUrl?.startsWith('indexeddb:')
                                    ? 'Custom Uploaded Video File (Saved in DB)'
                                    : (editingItem.videoUrl || previewMediaUrl)}
                              </span>
                            </div>
                            <span className="text-[10px] font-mono bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded border border-emerald-500/30">
                              {editingItem.aspectRatio === '9:16' ? '9:16 Vertical UGC' : '16:9 Widescreen'}
                            </span>
                          </div>
                        )}

                        {/* Capture / Auto Poster action strip */}
                        <div className="flex items-center justify-between p-2.5 bg-slate-950 rounded-xl border border-slate-800 text-xs">
                          <span className="text-slate-400 text-[11px]">
                            Optional: Auto-capture a static frame or leave empty to use video directly
                          </span>
                          <button
                            type="button"
                            onClick={handleGenerateAutoPoster}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-amber-300 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                          >
                            <Camera className="w-3.5 h-3.5 text-amber-400" />
                            <span>Capture Frame Poster</span>
                          </button>
                        </div>
                      </div>
                    )}

                    <div className="space-y-3 pt-2 border-t border-slate-800/80">
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="block text-[11px] text-slate-400 font-medium">
                            {editingItem.mediaType === 'video' ? 'Custom Video Thumbnail Image URL (Optional):' : 'Primary Image URL:'}
                          </label>
                          {editingItem.mediaType === 'video' && (editingItem.imageUrl || editingItem.posterUrl) && (
                            <button
                              type="button"
                              onClick={() => {
                                setEditingItem((prev) => ({
                                  ...prev,
                                  imageUrl: '',
                                  posterUrl: '',
                                }));
                                setUploadStatus('Cleared custom poster! Using video first frame.');
                                setTimeout(() => setUploadStatus(''), 2500);
                              }}
                              className="text-[10px] text-red-400 hover:text-red-300 font-medium cursor-pointer"
                            >
                              ✕ Clear Custom Poster (Use Video First Frame)
                            </button>
                          )}
                        </div>
                        <input
                          type="text"
                          value={editingItem.imageUrl || editingItem.posterUrl || (editingItem.mediaType === 'image' ? editingItem.mediaUrl : '') || ''}
                          onChange={(e) => {
                            const val = e.target.value;
                            setEditingItem({
                              ...editingItem,
                              imageUrl: val,
                              posterUrl: val,
                              mediaUrl: editingItem.mediaType === 'image' ? val : editingItem.mediaUrl,
                            });
                            if (editingItem.mediaType === 'image') {
                              setPreviewMediaUrl(val);
                            }
                          }}
                          placeholder={editingItem.mediaType === 'video' ? 'Leave empty to use video first frame, or enter image URL' : '/src/assets/images/...'}
                          className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-700 rounded-lg text-white font-mono"
                        />
                      </div>
                    </div>

                    {/* Dual Media Preview Box: Stream & Poster */}
                    <div className="mt-3 p-3.5 bg-slate-950 rounded-xl border border-slate-800">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block mb-2.5">
                        Live Visual Inspection
                      </span>
                      {editingItem.mediaType === 'video' ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-start">
                          {/* Left: Video stream preview */}
                          <div className="space-y-1">
                            <span className="text-[10px] font-mono text-amber-400 block">
                              1. Video Stream Player ({editingItem.aspectRatio === '9:16' ? '9:16 Vertical Mobile' : '16:9 Widescreen'}):
                            </span>
                            {(() => {
                              const rawVideo = previewMediaUrl || editingItem.videoUrl;
                              const playablePreview = (rawVideo && !rawVideo.startsWith('indexeddb:'))
                                ? rawVideo
                                : (editingItem.category === 'UGC'
                                    ? '/videos/ugc_creator_reel_9_16.mp4'
                                    : '/videos/commercial_4k_reel_16_9.mp4');

                              return editingItem.aspectRatio === '9:16' ? (
                                <div className="max-w-[255px] mx-auto aspect-[9/16] bg-black rounded-2xl border-2 border-slate-700 overflow-hidden shadow-lg flex flex-col justify-between p-1.5">
                                  <div className="w-10 h-2 bg-slate-800 rounded-full mx-auto my-0.5" />
                                  <video
                                    key={playablePreview}
                                    src={playablePreview}
                                    controls
                                    playsInline
                                    preload="metadata"
                                    className="w-full h-full object-cover rounded-xl"
                                  />
                                </div>
                              ) : (
                                <video
                                  key={playablePreview}
                                  src={playablePreview}
                                  controls
                                  playsInline
                                  preload="metadata"
                                  className="w-full aspect-video rounded-lg object-contain bg-black border border-slate-800"
                                />
                              );
                            })()}
                          </div>

                          {/* Right: Matching thumbnail poster preview */}
                          <div className="space-y-1">
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] font-mono text-emerald-400 block">
                                2. Thumbnail Preview:
                              </span>
                              {editingItem.imageUrl || editingItem.posterUrl ? (
                                <span className="text-[10px] font-mono text-amber-300">Custom Poster Image</span>
                              ) : (previewMediaUrl || editingItem.videoUrl) ? (
                                <span className="text-[10px] font-mono text-emerald-400">Dynamic Video First Frame</span>
                              ) : null}
                            </div>
                            {editingItem.imageUrl || editingItem.posterUrl ? (
                              <div className="w-full aspect-video rounded-lg overflow-hidden border border-slate-800 bg-black flex items-center justify-center">
                                <img
                                  src={editingItem.imageUrl || editingItem.posterUrl}
                                  alt="Poster thumbnail preview"
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            ) : (previewMediaUrl || editingItem.videoUrl) ? (
                              <div className="relative w-full aspect-video rounded-lg overflow-hidden border border-slate-800 bg-black flex items-center justify-center">
                                <video
                                  src={previewMediaUrl || editingItem.videoUrl}
                                  preload="metadata"
                                  muted
                                  playsInline
                                  className="w-full h-full object-contain pointer-events-none"
                                />
                                <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-slate-950/85 border border-emerald-500/40 text-[10px] text-emerald-300 font-mono">
                                  Defaulting Directly to Video Frame
                                </div>
                              </div>
                            ) : (
                              <div className="w-full aspect-video rounded-lg bg-slate-900 border border-dashed border-slate-700 flex flex-col items-center justify-center p-3 text-center">
                                <span className="text-xs text-slate-400 mb-1">No video or poster specified</span>
                                <span className="text-[10px] text-slate-500">
                                  Enter an MP4 video URL above to preview its initial frame
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <span className="text-[10px] font-mono text-amber-400 block">
                            Showcase Image Preview:
                          </span>
                          <img
                            src={previewMediaUrl || editingItem.imageUrl || editingItem.mediaUrl || '/src/assets/images/showcase_branding_identity_1790504096628.jpg'}
                            alt="Upload preview"
                            className="w-full max-h-56 rounded-lg object-cover border border-slate-800"
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Project Description
                    </label>
                    <textarea
                      rows={2}
                      value={editingItem.description || ''}
                      onChange={(e) =>
                        setEditingItem({ ...editingItem, description: e.target.value })
                      }
                      placeholder="Brief overview of the creative approach, hook, and strategic outcome."
                      className="w-full px-3 py-2 text-xs bg-slate-900 border border-slate-700 rounded-lg text-white"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1">
                        Impact Metrics
                      </label>
                      <input
                        type="text"
                        value={editingItem.metrics || ''}
                        onChange={(e) =>
                          setEditingItem({ ...editingItem, metrics: e.target.value })
                        }
                        placeholder="e.g. +310% Video Watch Time · 1.8M Viral Views"
                        className="w-full px-3 py-2 text-xs bg-slate-900 border border-slate-700 rounded-lg text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1">
                        Tags (comma-separated)
                      </label>
                      <input
                        type="text"
                        value={
                          Array.isArray(editingItem.tags)
                            ? editingItem.tags.join(', ')
                            : editingItem.tags || ''
                        }
                        onChange={(e) => setEditingItem({ ...editingItem, tags: e.target.value as any })}
                        placeholder="4K Video, Color Grading, Sound Design"
                        className="w-full px-3 py-2 text-xs bg-slate-900 border border-slate-700 rounded-lg text-white"
                      />
                    </div>
                  </div>

                  {/* Inline Validation Error Alert if any */}
                  {formError && (
                    <div className="p-3 bg-red-950/90 border border-red-500 rounded-xl flex items-center gap-2 text-xs text-red-200">
                      <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                      <span className="font-semibold">{formError}</span>
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-2">
                    <div className="text-[11px] text-slate-400 font-mono">
                      {editingItem.id ? (
                        <span>Editing project: <strong className="text-amber-400">{editingItem.title || 'Untitled'}</strong></span>
                      ) : (
                        <span className="text-emerald-400">✨ Creating New Project</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setEditingItem(null);
                          setPreviewMediaUrl('');
                          setFormError('');
                        }}
                        className="px-4 py-2 text-xs text-slate-400 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded-lg cursor-pointer transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={handleSaveItem}
                        className="flex items-center gap-2 px-5 py-2.5 text-xs font-bold bg-amber-400 hover:bg-amber-300 text-slate-950 rounded-xl shadow-lg shadow-amber-400/20 active:scale-95 transition-all cursor-pointer"
                      >
                        <Save className="w-4 h-4 stroke-[2.5]" />
                        <span>{isEditingExisting ? 'Update Project' : 'Add to Portfolio'}</span>
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-slate-200">
                    Active Portfolio Items ({itemsList.length})
                  </h3>
                  <button
                    onClick={() => {
                      setIsEditingExisting(false);
                      setEditingItem({
                        id: `proj-${Date.now()}`,
                        title: '',
                        client: '',
                        category: 'Video Editing',
                        mediaType: 'video',
                        featured: true,
                        tags: ['Creative'],
                        aspectRatio: '16:9',
                      });
                      setPreviewMediaUrl('');
                      setVideoUrlInput('');
                      setSlideUrlInput('');
                      setFormError('');
                    }}
                    className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold bg-amber-400 hover:bg-amber-300 text-slate-950 rounded-lg transition-colors cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Upload New Showcase</span>
                  </button>
                </div>
              )}

              {/* Items List */}
              <div className="space-y-3">
                {itemsList.map((item) => {
                  const isCurrentEditing = editingItem?.id === item.id;
                  const isRecentlySaved = recentlySavedId === item.id;
                  return (
                    <div
                      key={item.id}
                      className={`flex flex-col sm:flex-row items-start sm:items-center justify-between p-3.5 rounded-xl gap-3 transition-all ${
                        isRecentlySaved
                          ? 'bg-emerald-500/10 border-2 border-emerald-400 shadow-lg shadow-emerald-400/20'
                          : isCurrentEditing
                          ? 'bg-amber-500/10 border-2 border-amber-400 shadow-lg shadow-amber-400/10'
                          : 'bg-slate-950 border border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-14 h-14 rounded-lg bg-slate-900 border border-slate-800 overflow-hidden flex-shrink-0 flex items-center justify-center">
                          {item.mediaType === 'video' ? (
                            <div className="relative w-full h-full flex items-center justify-center bg-black">
                              {item.imageUrl || item.posterUrl ? (
                                <img
                                  src={item.imageUrl || item.posterUrl}
                                  alt={item.title}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <video
                                  src={item.videoUrl || item.mediaUrl}
                                  preload="metadata"
                                  muted
                                  playsInline
                                  className="w-full h-full object-cover pointer-events-none"
                                />
                              )}
                              <div className="absolute inset-0 flex items-center justify-center bg-black/30 pointer-events-none">
                                <Play className="w-4 h-4 fill-amber-400 text-amber-400" />
                              </div>
                            </div>
                          ) : (
                            <img
                              src={item.imageUrl || item.posterUrl || (item.images && item.images[0]) || '/src/assets/images/showcase_website_platform_1791339120555.jpg'}
                              alt={item.title}
                              className="w-full h-full object-cover"
                            />
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-2 text-[11px] text-slate-400">
                            <span className="font-semibold text-amber-400">{item.category}</span>
                            <span>·</span>
                            <span>{item.client}</span>
                            {isRecentlySaved && (
                              <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-400 text-slate-950 uppercase tracking-wider ml-1 animate-pulse">
                                ✓ Updated Just Now
                              </span>
                            )}
                            {isCurrentEditing && !isRecentlySaved && (
                              <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-400 text-slate-950 uppercase tracking-wider ml-1">
                                Editing Now
                              </span>
                            )}
                          </div>
                          <h4 className="text-xs sm:text-sm font-semibold text-white">
                            {item.title}
                          </h4>
                          <span className="text-[11px] text-slate-500 font-mono">
                            {item.metrics}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-end sm:self-center">
                        <button
                          type="button"
                          onClick={() => handleStartEdit(item)}
                          className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 text-xs font-semibold ${
                            isCurrentEditing
                              ? 'bg-amber-400 text-slate-950 shadow-md shadow-amber-400/20 ring-1 ring-amber-300'
                              : 'text-slate-200 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-700/80 hover:border-amber-400/60'
                          }`}
                          title="Edit Project Details"
                        >
                          <Edit3 className={`w-3.5 h-3.5 ${isCurrentEditing ? 'text-slate-950 stroke-[2.5]' : 'text-amber-400'}`} />
                          <span>{isCurrentEditing ? 'Editing' : 'Edit'}</span>
                        </button>

                        {itemToDelete === item.id ? (
                          <div className="flex items-center gap-1.5 bg-red-950/90 border border-red-500/80 p-1 rounded-lg text-xs animate-fade-in">
                            <span className="text-red-200 text-[11px] font-semibold px-1">Delete?</span>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteItem(item.id);
                              }}
                              className="px-2 py-1 bg-red-600 hover:bg-red-500 text-white rounded text-[11px] font-bold cursor-pointer transition-colors"
                            >
                              Yes
                            </button>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setItemToDelete(null);
                              }}
                              className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-[11px] cursor-pointer transition-colors"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setItemToDelete(item.id);
                            }}
                            className="px-2.5 py-1.5 text-slate-300 hover:text-red-300 bg-slate-900 hover:bg-red-950/50 border border-slate-700/80 hover:border-red-500/60 rounded-lg transition-colors cursor-pointer flex items-center gap-1 text-xs"
                            title="Delete this project from portfolio"
                          >
                            <Trash2 className="w-3.5 h-3.5 text-red-400" />
                            <span className="hidden sm:inline">Delete</span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 3: BACKUP & RESTORE */}
          {activeTab === 'backup' && (
            <div className="space-y-5">
              <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-3">
                <h3 className="text-sm font-semibold text-slate-200">
                  Export Website Data & Media Schema
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Download a complete backup of all custom text, portfolio entries, uploaded media paths, and configuration as a JSON file.
                </p>
                <button
                  onClick={handleExportBackup}
                  className="flex items-center gap-2 px-4 py-2 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors"
                >
                  <Upload className="w-4 h-4 rotate-180" />
                  <span>Download Backup JSON</span>
                </button>
              </div>

              <div className="p-4 bg-red-950/20 border border-red-900/30 rounded-xl space-y-3">
                <h3 className="text-sm font-semibold text-red-300">
                  Reset to Official Sapotlokal Default
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Clear custom edits and restore the official Sapotlokal Resources profile, default portfolio showcases, and initial CRM leads.
                </p>
                <button
                  onClick={() => {
                    if (confirm('Are you sure you want to restore defaults? All local edits will be reset.')) {
                      onResetAll();
                      onClose();
                    }
                  }}
                  className="flex items-center gap-2 px-4 py-2 text-xs font-semibold bg-red-900/60 hover:bg-red-800 text-red-200 rounded-lg transition-colors"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Reset All to Default</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
