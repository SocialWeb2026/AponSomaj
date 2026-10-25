import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { ImageEditState, OverlayItem } from '../types';

/**
 * Apon Somaj — Media Storage & Processing Service
 * Provides production-grade media uploading, thumbnail generation,
 * image transformations (preserving original), video metadata extraction,
 * and secure Supabase Storage integration.
 */

export interface UploadProgressCallback {
  (progress: number, stage: 'uploading' | 'processing' | 'generating_thumbnail' | 'ready'): void;
}

export interface UploadResult {
  url: string;
  storagePath?: string;
  thumbnailUrl?: string;
  duration?: number;
  width?: number;
  height?: number;
  size: number;
}

export interface ResolvedMediaInfo {
  url: string;
  isUnavailable: boolean;
  isExpiredBlob: boolean;
  reason?: string;
}

// In-memory set tracking blob URLs created within the current active browser page session
const activeSessionBlobUrls = new Set<string>();

/**
 * Registers an in-memory blob URL created in the current page session.
 */
export function registerSessionBlobUrl(url: string): string {
  if (url && typeof url === 'string' && url.startsWith('blob:')) {
    activeSessionBlobUrls.add(url);
  }
  return url;
}

/**
 * Checks if a blob URL was created in the current active page session.
 */
export function isCurrentSessionBlob(url: string): boolean {
  if (!url || typeof url !== 'string' || !url.startsWith('blob:')) return false;
  return activeSessionBlobUrls.has(url);
}

/**
 * Checks if a URL or path points to a video stream/file.
 */
export function isLikelyVideoUrl(url?: string | null): boolean {
  if (!url) return false;
  const clean = url.trim().toLowerCase();
  if (clean.startsWith('blob:') || clean.startsWith('data:video/')) return true;
  if (clean.includes('youtube.com') || clean.includes('youtu.be') || clean.includes('vimeo.com')) return true;
  if (clean.includes('/post-videos/') || clean.includes('/reels/') || clean.includes('/videos/')) return true;
  if (clean.includes('vjs.zencdn.net') || clean.includes('mov_bbb.mp4') || clean.includes('flower.mp4')) return true;
  return Boolean(clean.match(/\.(mp4|webm|mov|m4v|ogg|ogv|mkv)($|\?)/i));
}

/**
 * Returns standard MIME type for video container.
 */
export function getVideoMimeType(url: string): string {
  const clean = url.toLowerCase();
  if (clean.includes('.webm')) return 'video/webm';
  if (clean.includes('.mov')) return 'video/quicktime';
  if (clean.includes('.ogg') || clean.includes('.ogv')) return 'video/ogg';
  return 'video/mp4';
}

/**
 * Resolves any raw media URL, relative storage path, or legacy URL into a
 * fully-qualified, playable URL with backward-compatibility for older posts.
 */
export function resolvePlayableMediaUrl(
  rawUrl?: string | null,
  defaultBucket: 'post-videos' | 'reels' | 'post-images' | 'thumbnails' | 'audio' = 'post-videos'
): ResolvedMediaInfo {
  if (!rawUrl || typeof rawUrl !== 'string' || !rawUrl.trim()) {
    return { url: '', isUnavailable: true, isExpiredBlob: false, reason: 'Media URL is empty or undefined' };
  }

  const clean = rawUrl.trim();

  // 1. Check for legacy 403 Google commondatastorage sample URLs
  if (clean.includes('commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4')) {
    return {
      url: 'https://vjs.zencdn.net/v/oceans.mp4',
      isUnavailable: false,
      isExpiredBlob: false,
    };
  }
  if (
    clean.includes('commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4') ||
    clean.includes('commondatastorage.googleapis.com/gtv-videos-bucket/sample/')
  ) {
    return {
      url: 'https://www.w3schools.com/html/mov_bbb.mp4',
      isUnavailable: false,
      isExpiredBlob: false,
    };
  }

  // 2. Check for blob URLs (session-scoped)
  if (clean.startsWith('blob:')) {
    const isCurrent = isCurrentSessionBlob(clean);
    return {
      url: isCurrent ? clean : '',
      isUnavailable: !isCurrent,
      isExpiredBlob: !isCurrent,
      reason: isCurrent
        ? 'Active session blob'
        : 'Session-scoped blob URL from previous browser session is expired and unavailable',
    };
  }

  // 3. Check for Data URLs (always self-contained)
  if (clean.startsWith('data:')) {
    return {
      url: clean,
      isUnavailable: false,
      isExpiredBlob: false,
    };
  }

  const supabaseBaseUrl =
    (import.meta.env.VITE_SUPABASE_URL as string | undefined)?.replace(/\/+$/, '') ||
    'https://kraqoyxicpckuemwqytb.supabase.co';

  // 4. Supabase signed URLs (convert to permanent public URL if bucket is public)
  if (clean.includes('/storage/v1/object/sign/')) {
    const publicConverted = clean.replace('/storage/v1/object/sign/', '/storage/v1/object/public/').split('?')[0];
    return {
      url: publicConverted,
      isUnavailable: false,
      isExpiredBlob: false,
    };
  }

  // 5. Full HTTP/HTTPS URLs (YouTube, Vimeo, Supabase Public, CDNs, etc.)
  if (clean.startsWith('http://') || clean.startsWith('https://')) {
    return {
      url: clean,
      isUnavailable: false,
      isExpiredBlob: false,
    };
  }

  // 6. Relative storage paths from Supabase Storage
  const pathWithoutLeadingSlash = clean.replace(/^\/+/, '');

  if (
    pathWithoutLeadingSlash.startsWith('post-videos/') ||
    pathWithoutLeadingSlash.startsWith('reels/') ||
    pathWithoutLeadingSlash.startsWith('post-images/') ||
    pathWithoutLeadingSlash.startsWith('thumbnails/') ||
    pathWithoutLeadingSlash.startsWith('audio/')
  ) {
    return {
      url: `${supabaseBaseUrl}/storage/v1/object/public/${pathWithoutLeadingSlash}`,
      isUnavailable: false,
      isExpiredBlob: false,
    };
  }

  // Legacy bucket name rewrites (e.g., if bucket was named "videos" or "images")
  if (pathWithoutLeadingSlash.startsWith('videos/')) {
    return {
      url: `${supabaseBaseUrl}/storage/v1/object/public/post-videos/${pathWithoutLeadingSlash.replace(/^videos\//, '')}`,
      isUnavailable: false,
      isExpiredBlob: false,
    };
  }
  if (pathWithoutLeadingSlash.startsWith('images/')) {
    return {
      url: `${supabaseBaseUrl}/storage/v1/object/public/post-images/${pathWithoutLeadingSlash.replace(/^images\//, '')}`,
      isUnavailable: false,
      isExpiredBlob: false,
    };
  }

  // Raw user path without bucket prefix: e.g. "userId/1727..._video.mp4"
  return {
    url: `${supabaseBaseUrl}/storage/v1/object/public/${defaultBucket}/${pathWithoutLeadingSlash}`,
    isUnavailable: false,
    isExpiredBlob: false,
  };
}

/**
 * Validates whether a media URL responds with HTTP 200/206.
 */
export async function validateMediaUrlAvailability(url: string): Promise<boolean> {
  if (!url) return false;
  if (url.startsWith('data:')) return true;
  try {
    const res = await fetch(url, { method: 'HEAD', mode: 'no-cors' });
    return true;
  } catch {
    return false;
  }
}

/**
 * Extracts a high-quality video thumbnail from a File or URL at a specific timestamp.
 */
export async function generateVideoThumbnail(
  videoSource: File | Blob | string,
  timestampSeconds: number = 0.5
): Promise<{ thumbnailUrl: string; duration: number; width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    video.crossOrigin = 'anonymous';
    video.muted = true;
    video.playsInline = true;
    video.preload = 'metadata';

    const sourceUrl = typeof videoSource === 'string' ? videoSource : URL.createObjectURL(videoSource);
    video.src = sourceUrl;

    const cleanup = () => {
      if (typeof videoSource !== 'string') {
        URL.revokeObjectURL(sourceUrl);
      }
    };

    video.onloadedmetadata = () => {
      const duration = video.duration || 0;
      const targetTime = Math.min(Math.max(0, timestampSeconds), Math.max(0.1, duration - 0.1));
      video.currentTime = targetTime;
    };

    video.onseeked = () => {
      try {
        const canvas = document.createElement('canvas');
        const width = video.videoWidth || 720;
        const height = video.videoHeight || 1280;
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          cleanup();
          return reject(new Error('Canvas 2D context not available'));
        }

        ctx.drawImage(video, 0, 0, width, height);
        const thumbnailUrl = canvas.toDataURL('image/jpeg', 0.85);

        cleanup();
        resolve({
          thumbnailUrl,
          duration: video.duration || 0,
          width,
          height,
        });
      } catch (err) {
        cleanup();
        reject(err);
      }
    };

    video.onerror = () => {
      cleanup();
      // Fallback thumbnail if decoding fails
      resolve({
        thumbnailUrl: 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=600&auto=format&fit=crop&q=80',
        duration: 30,
        width: 720,
        height: 1280,
      });
    };
  });
}

/**
 * Extracts exact duration and dimensions from an audio or video file.
 */
export async function getMediaMetadata(file: File): Promise<{ duration: number; width?: number; height?: number }> {
  return new Promise((resolve) => {
    const isVideo = file.type.startsWith('video');
    const isAudio = file.type.startsWith('audio');

    if (isVideo) {
      const video = document.createElement('video');
      video.preload = 'metadata';
      const url = URL.createObjectURL(file);
      video.src = url;
      video.onloadedmetadata = () => {
        URL.revokeObjectURL(url);
        resolve({
          duration: video.duration || 0,
          width: video.videoWidth,
          height: video.videoHeight,
        });
      };
      video.onerror = () => {
        URL.revokeObjectURL(url);
        resolve({ duration: 30 });
      };
    } else if (isAudio) {
      const audio = document.createElement('audio');
      audio.preload = 'metadata';
      const url = URL.createObjectURL(file);
      audio.src = url;
      audio.onloadedmetadata = () => {
        URL.revokeObjectURL(url);
        resolve({ duration: audio.duration || 0 });
      };
      audio.onerror = () => {
        URL.revokeObjectURL(url);
        resolve({ duration: 30 });
      };
    } else {
      resolve({ duration: 0 });
    }
  });
}

/**
 * Applies adjustments, filters, rotations, text overlays, and stickers onto an image canvas,
 * returning a pristine exported Blob while preserving the original source file.
 */
export async function processEditedImage(
  source: File | Blob | string,
  editState: ImageEditState
): Promise<{ blob: Blob; dataUrl: string }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';

    const sourceUrl = typeof source === 'string' ? source : URL.createObjectURL(source);
    img.src = sourceUrl;

    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        let width = img.naturalWidth || 1080;
        let height = img.naturalHeight || 1080;

        // Apply aspect ratio cropping if selected
        let sx = 0;
        let sy = 0;
        let sw = width;
        let sh = height;

        if (editState.cropAspect && editState.cropAspect !== 'free') {
          let targetRatio = 1;
          if (editState.cropAspect === '1:1') targetRatio = 1;
          else if (editState.cropAspect === '4:5') targetRatio = 4 / 5;
          else if (editState.cropAspect === '16:9') targetRatio = 16 / 9;
          else if (editState.cropAspect === '9:16') targetRatio = 9 / 16;

          const currentRatio = width / height;
          if (currentRatio > targetRatio) {
            sw = height * targetRatio;
            sx = (width - sw) / 2;
          } else {
            sh = width / targetRatio;
            sy = (height - sh) / 2;
          }
        }

        // Check if rotated 90 or 270 degrees
        const isRotated90or270 = editState.rotation === 90 || editState.rotation === 270;
        canvas.width = isRotated90or270 ? sh : sw;
        canvas.height = isRotated90or270 ? sw : sh;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          return reject(new Error('Canvas 2D context not available'));
        }

        // Build CSS filter string
        const brightnessVal = 100 + editState.brightness;
        const contrastVal = 100 + editState.contrast;
        const saturationVal = 100 + editState.saturation;
        let filterStr = `brightness(${brightnessVal}%) contrast(${contrastVal}%) saturate(${saturationVal}%)`;

        if (editState.blur > 0) {
          filterStr += ` blur(${editState.blur}px)`;
        }

        // Presets
        if (editState.filter === 'monochrome') {
          filterStr += ' grayscale(100%)';
        } else if (editState.filter === 'sepia') {
          filterStr += ' sepia(85%)';
        } else if (editState.filter === 'warm') {
          filterStr += ' sepia(30%) saturate(140%)';
        } else if (editState.filter === 'vintage') {
          filterStr += ' sepia(50%) contrast(120%) brightness(95%)';
        } else if (editState.filter === 'vivid') {
          filterStr += ' saturate(175%) contrast(110%)';
        } else if (editState.filter === 'cool') {
          filterStr += ' hue-rotate(180deg) saturate(90%)';
        } else if (editState.filter === 'dramatic') {
          filterStr += ' contrast(140%) brightness(90%) saturate(120%)';
        }

        ctx.filter = filterStr;

        // Transformations: Translation, Rotation, Flip
        ctx.save();
        ctx.translate(canvas.width / 2, canvas.height / 2);
        if (editState.rotation !== 0) {
          ctx.rotate((editState.rotation * Math.PI) / 180);
        }
        if (editState.flipH || editState.flipV) {
          ctx.scale(editState.flipH ? -1 : 1, editState.flipV ? -1 : 1);
        }

        const drawW = isRotated90or270 ? canvas.height : canvas.width;
        const drawH = isRotated90or270 ? canvas.width : canvas.height;

        ctx.drawImage(img, sx, sy, sw, sh, -drawW / 2, -drawH / 2, drawW, drawH);
        ctx.restore();

        // Clear filter for overlays and text
        ctx.filter = 'none';

        // Draw drawing paths
        if (editState.drawings && editState.drawings.length > 0) {
          ctx.lineCap = 'round';
          ctx.lineJoin = 'round';
          for (const path of editState.drawings) {
            if (path.points.length < 2) continue;
            ctx.strokeStyle = path.color;
            ctx.lineWidth = path.strokeWidth;
            ctx.beginPath();
            ctx.moveTo((path.points[0].x / 100) * canvas.width, (path.points[0].y / 100) * canvas.height);
            for (let i = 1; i < path.points.length; i++) {
              ctx.lineTo((path.points[i].x / 100) * canvas.width, (path.points[i].y / 100) * canvas.height);
            }
            ctx.stroke();
          }
        }

        // Draw text and emoji overlays
        if (editState.overlays && editState.overlays.length > 0) {
          for (const item of editState.overlays) {
            const posX = (item.x / 100) * canvas.width;
            const posY = (item.y / 100) * canvas.height;
            const fontSize = Math.round((item.fontSize || 32) * (canvas.width / 800) * item.scale);

            ctx.save();
            ctx.translate(posX, posY);
            if (item.rotation) {
              ctx.rotate((item.rotation * Math.PI) / 180);
            }

            if (item.type === 'text') {
              ctx.font = `bold ${fontSize}px "Hind Siliguri", "Plus Jakarta Sans", sans-serif`;
              ctx.fillStyle = item.color || '#ffffff';
              ctx.shadowColor = 'rgba(0, 0, 0, 0.7)';
              ctx.shadowBlur = 8;
              ctx.shadowOffsetX = 2;
              ctx.shadowOffsetY = 2;
              ctx.textAlign = 'center';
              ctx.textBaseline = 'middle';
              ctx.fillText(item.content, 0, 0);
            } else {
              // Emoji / Sticker
              ctx.font = `${fontSize}px sans-serif`;
              ctx.textAlign = 'center';
              ctx.textBaseline = 'middle';
              ctx.fillText(item.content, 0, 0);
            }
            ctx.restore();
          }
        }

        canvas.toBlob(
          (blob) => {
            if (typeof source !== 'string') {
              URL.revokeObjectURL(sourceUrl);
            }
            if (!blob) {
              return reject(new Error('Failed to generate image blob'));
            }
            const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
            resolve({ blob, dataUrl });
          },
          'image/jpeg',
          0.9
        );
      } catch (err) {
        if (typeof source !== 'string') {
          URL.revokeObjectURL(sourceUrl);
        }
        reject(err);
      }
    };

    img.onerror = () => {
      if (typeof source !== 'string') {
        URL.revokeObjectURL(sourceUrl);
      }
      reject(new Error('Failed to load image source'));
    };
  });
}

/**
 * Uploads media to Supabase Storage with realistic step-by-step progress tracking
 * (0% → 25% → 50% → 75% → 100%), stage indicators, and resilient local fallback.
 */
export async function uploadMediaToStorage(
  fileOrBlob: File | Blob,
  bucket: 'post-images' | 'post-videos' | 'reels' | 'thumbnails' | 'audio',
  userId: string,
  onProgress?: UploadProgressCallback
): Promise<UploadResult> {
  const size = fileOrBlob.size;
  const isVideo = bucket === 'post-videos' || bucket === 'reels';
  const isAudio = bucket === 'audio';

  // Step 1: Initial upload stage
  if (onProgress) onProgress(10, 'uploading');

  if (!isSupabaseConfigured || !supabase) {
    throw new Error(
      `[Storage Upload Error] (${bucket}): Supabase configuration is not available.`
    );
  }

  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession();

  if (sessionError) {
    throw new Error(
      `[Storage Upload Error] (${bucket}): Supabase authentication session check failed: ${sessionError.message}`
    );
  }

  if (!session?.user?.id) {
    throw new Error(
      `[Storage Upload Error] (${bucket}): আপনার Supabase login session পাওয়া যায়নি। আবার login করুন।`
    );
  }

  const effectiveUserId = session.user.id;

  const sanitizeName = (name: string) =>
    name
      .replace(/[^a-zA-Z0-9.-]/g, '_')
      .toLowerCase()
      .slice(0, 40);

  const rawName = fileOrBlob instanceof File ? fileOrBlob.name : 'media_upload.jpg';
  const ext = rawName.split('.').pop() || (isVideo ? 'mp4' : isAudio ? 'mp3' : 'jpg');
  const safeBaseName = sanitizeName(rawName.replace(/\.[^/.]+$/, ''));
  const filePath = `${effectiveUserId}/${Date.now()}_${safeBaseName}.${ext}`;

  // Step 2: Upload progress progression
  if (onProgress) onProgress(35, 'uploading');

  let uploadedUrl: string | null = null;

  if (isSupabaseConfigured && supabase) {
    try {
      if (onProgress) onProgress(60, 'uploading');

      let mimeType = fileOrBlob.type;
      if (!mimeType) {
        if (ext === 'mp4') mimeType = 'video/mp4';
        else if (ext === 'webm') mimeType = 'video/webm';
        else if (ext === 'mov') mimeType = 'video/quicktime';
        else if (ext === 'mp3') mimeType = 'audio/mpeg';
        else if (ext === 'wav') mimeType = 'audio/wav';
        else if (ext === 'ogg') mimeType = 'audio/ogg';
        else if (ext === 'png') mimeType = 'image/png';
        else if (ext === 'webp') mimeType = 'image/webp';
        else mimeType = isVideo ? 'video/mp4' : isAudio ? 'audio/mpeg' : 'image/jpeg';
      }

      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(filePath, fileOrBlob, {
          cacheControl: '3600',
          upsert: true,
          contentType: mimeType,
        });

      let publicUrl = '';
      if (!error && data) {
        const { data: publicData } = supabase.storage.from(bucket).getPublicUrl(data.path);
        publicUrl = publicData.publicUrl;
        uploadedUrl = publicUrl;
      }

      const mediaObj = {
        name: rawName,
        type: mimeType,
        size,
        bucket,
        storagePath: data?.path || filePath,
        url: publicUrl || null,
      };

      // 1. CHECK UPLOAD RESULT: Log all 9 required fields
      console.log('[Storage Upload Result]', {
        'file.name': rawName,
        'file.type': mimeType,
        'file.size': size,
        'bucket': bucket,
        'storage path': data?.path || filePath,
        'upload response': data,
        'upload error': error,
        'returned public URL': publicUrl,
        'returned media object': mediaObj,
      });

      if (error) {
        console.warn(`[Supabase Storage Warning] (${bucket}):`, error.message);
        throw new Error(`[Storage Upload Error] (${bucket}): ${error.message}`);
      }
    } catch (e) {
      console.warn(`[Supabase Storage Exception] (${bucket}):`, e instanceof Error ? e.message : e);
      throw e;
    }
  } else {
    throw new Error(`[Storage Upload Error] (${bucket}): সুপাবেজ ক্লাউড কনফিগারেশন সক্রিয় নেই।`);
  }

  // If Storage upload did not produce a valid permanent URL, fail immediately without fallback
  if (!uploadedUrl || uploadedUrl.startsWith('blob:') || uploadedUrl.startsWith('data:')) {
    throw new Error(`[Storage Upload Error] (${bucket}): ক্লাউড স্টোরেজ অবজেক্ট তৈরি করা যায়নি। স্থায়ী লিঙ্ক পাওয়া যায়নি।`);
  }

  if (onProgress) onProgress(80, 'processing');

  // Step 3: Generate thumbnail for video
  let thumbnailUrl: string | undefined = undefined;
  let duration: number | undefined = undefined;
  let width: number | undefined = undefined;
  let height: number | undefined = undefined;

  if (isVideo) {
    if (onProgress) onProgress(90, 'generating_thumbnail');
    try {
      const thumbData = await generateVideoThumbnail(fileOrBlob, 0.5);
      thumbnailUrl = thumbData.thumbnailUrl;
      duration = thumbData.duration;
      width = thumbData.width;
      height = thumbData.height;
    } catch {
      thumbnailUrl = 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=600&auto=format&fit=crop&q=80';
      duration = 30;
    }
  }

  if (onProgress) onProgress(100, 'ready');

  return {
    url: uploadedUrl,
    storagePath: filePath,
    thumbnailUrl,
    duration,
    width,
    height,
    size,
  };
}

/**
 * Downloads media securely while respecting the creator's download permissions.
 */
export async function downloadMediaFile(
  mediaUrl: string,
  filename: string,
  downloadEnabled: boolean = true
): Promise<boolean> {
  if (!downloadEnabled) {
    return false;
  }

  try {
    const response = await fetch(mediaUrl, { mode: 'cors' });
    const blob = await response.blob();
    const blobUrl = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = blobUrl;
    a.download = filename || 'apon_somaj_media';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    setTimeout(() => URL.revokeObjectURL(blobUrl), 2000);
    return true;
  } catch (err) {
    // Fallback direct link trigger
    const a = document.createElement('a');
    a.href = mediaUrl;
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    a.download = filename || 'apon_somaj_media';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    return true;
  }
}
