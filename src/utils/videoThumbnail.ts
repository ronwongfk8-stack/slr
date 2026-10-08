/**
 * Utility to automatically capture a video thumbnail/poster frame
 * from a video File or URL.
 */
export async function generateVideoThumbnail(source: File | Blob | string, seekTime = 0.5): Promise<string> {
  return new Promise((resolve) => {
    let url: string;
    let isRevokeNeeded = false;

    if (source instanceof Blob) {
      url = URL.createObjectURL(source);
      isRevokeNeeded = true;
    } else {
      url = source;
    }

    const video = document.createElement('video');
    video.crossOrigin = 'anonymous';
    video.src = url;
    video.muted = true;
    video.playsInline = true;
    video.preload = 'metadata';

    const cleanup = () => {
      if (isRevokeNeeded) {
        URL.revokeObjectURL(url);
      }
      video.remove();
    };

    const timeoutId = setTimeout(() => {
      cleanup();
      // If thumbnail capture times out (e.g. cross-origin blocking), resolve with empty string so fallback is used
      resolve('');
    }, 4500);

    video.onloadedmetadata = () => {
      const dur = Number.isFinite(video.duration) && video.duration > 0 ? video.duration : 2;
      video.currentTime = Math.min(seekTime, dur > 1 ? 0.5 : 0.1);
    };

    video.onseeked = () => {
      try {
        clearTimeout(timeoutId);
        const canvas = document.createElement('canvas');
        const width = 720;
        const vW = video.videoWidth || 1280;
        const vH = video.videoHeight || 720;
        const height = Math.round((vH / vW) * width) || 405;
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(video, 0, 0, width, height);
          const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
          cleanup();
          resolve(dataUrl);
          return;
        }
      } catch (err) {
        console.warn('Canvas export failed (likely CORS on remote URL):', err);
      }
      cleanup();
      resolve('');
    };

    video.onerror = () => {
      clearTimeout(timeoutId);
      cleanup();
      resolve('');
    };
  });
}

/**
 * Generates an SVG poster card data URL if video thumbnail capture
 * cannot be exported (e.g. cross-origin video stream).
 */
export function generateDefaultVideoPoster(
  title: string,
  category = 'Video Production',
  client = 'Sapotlokal Resources',
  isVertical = false
): string {
  const width = isVertical ? 540 : 960;
  const height = isVertical ? 960 : 540;

  const cleanTitle = (title || 'Commercial Reel')
    .replace(/[<>&'"]/g, '')
    .slice(0, 48);
  const cleanCategory = (category || 'Video Editing').replace(/[<>&'"]/g, '');
  const cleanClient = (client || 'Sapotlokal').replace(/[<>&'"]/g, '');

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
    <defs>
      <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#0f172a" />
        <stop offset="50%" stop-color="#020617" />
        <stop offset="100%" stop-color="#1e293b" />
      </linearGradient>
      <linearGradient id="glow" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#f59e0b" stop-opacity="0.35" />
        <stop offset="100%" stop-color="#d97706" stop-opacity="0.05" />
      </linearGradient>
    </defs>
    <rect width="${width}" height="${height}" fill="url(#bg)" />
    <circle cx="${width / 2}" cy="${height / 2}" r="${width * 0.35}" fill="url(#glow)" />
    
    <!-- Top badge -->
    <rect x="${width / 2 - 110}" y="48" width="220" height="32" rx="16" fill="#000000" fill-opacity="0.6" stroke="#f59e0b" stroke-opacity="0.4" />
    <text x="${width / 2}" y="69" text-anchor="middle" fill="#fcd34d" font-family="system-ui, sans-serif" font-size="13" font-weight="bold" letter-spacing="1">
      ${cleanCategory.toUpperCase()}
    </text>

    <!-- Play Icon Center -->
    <circle cx="${width / 2}" cy="${height / 2}" r="44" fill="#f59e0b" fill-opacity="0.9" />
    <polygon points="${width / 2 - 10},${height / 2 - 18} ${width / 2 + 18},${height / 2} ${width / 2 - 10},${height / 2 + 18}" fill="#020617" />

    <!-- Bottom Text -->
    <text x="${width / 2}" y="${height - 90}" text-anchor="middle" fill="#ffffff" font-family="system-ui, sans-serif" font-size="${isVertical ? 22 : 24}" font-weight="bold">
      ${cleanTitle}
    </text>
    <text x="${width / 2}" y="${height - 60}" text-anchor="middle" fill="#94a3b8" font-family="system-ui, sans-serif" font-size="14">
      Client: ${cleanClient} · Watch Reel (.mp4)
    </text>
  </svg>`;

  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}
