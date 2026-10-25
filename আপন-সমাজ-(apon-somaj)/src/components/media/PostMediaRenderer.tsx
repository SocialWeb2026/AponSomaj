import React, { useState, useRef, useEffect } from 'react';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize2,
  Minimize2,
  Download,
  ChevronLeft,
  ChevronRight,
  X,
  Music,
  Film,
  Sparkles,
  Lock,
  VideoOff,
  CloudOff,
  AlertCircle,
  Clock,
} from 'lucide-react';
import { Post } from '../../types';
import {
  downloadMediaFile,
  isLikelyVideoUrl,
  getVideoMimeType,
  resolvePlayableMediaUrl
} from '../../services/mediaStorageService';

interface PostMediaRendererProps {
  post: Post;
  onOpenReelView?: (postId: string) => void;
}

export const PostMediaRenderer: React.FC<PostMediaRendererProps> = ({ post, onOpenReelView }) => {
  // 1. Inspect all fields from post_media, posts, storage_path, and metadata
  const postMediaItems = Array.isArray((post as any).post_media) ? (post as any).post_media : [];
  const postMediaStoragePaths = postMediaItems.map((m: any) => m.storage_path || m.storagePath).filter(Boolean);
  const postMediaUrls = postMediaItems.map((m: any) => m.media_url || m.mediaUrl).filter(Boolean);

  const storagePathCandidate: string | undefined =
    (post as any).storage_path ||
    (post as any).storagePath ||
    (post.editingMetadata as any)?.storagePath ||
    (post.editingMetadata as any)?.storage_path ||
    postMediaStoragePaths[0];

  const bucketCandidate: 'post-videos' | 'reels' =
    (post as any).bucket ||
    postMediaItems[0]?.bucket ||
    (post.postType === 'reel' ? 'reels' : 'post-videos');

  // Candidate URLs in priority order:
  // 1. Permanent Storage paths
  // 2. Permanent non-blob URLs
  // 3. Current-session blob URLs
  const candidateUrls = [
    storagePathCandidate,
    ...postMediaUrls,
    ...(post.mediaUrls || []),
    post.linkUrl,
    (post as any).media_url,
    ...((post as any).media_urls || [])
  ].filter(Boolean) as string[];

  // Prioritize permanent (non-blob) video URLs first
  const nonBlobCandidates = candidateUrls.filter(u => typeof u === 'string' && !u.startsWith('blob:'));
  const detectedVideoUrl =
    nonBlobCandidates.find(isLikelyVideoUrl) ||
    candidateUrls.find(isLikelyVideoUrl);

  const isVideo =
    post.mediaType === 'video' ||
    post.postType === 'reel' ||
    Boolean(detectedVideoUrl) ||
    Boolean(post.duration) ||
    Boolean(post.reelDuration);

  const rawVideoUrl =
    detectedVideoUrl ||
    (post.mediaType === 'video' || post.postType === 'reel' ? (nonBlobCandidates[0] || candidateUrls[0]) : undefined) ||
    '';

  const isReel = post.postType === 'reel';
  const resolvedVideo = resolvePlayableMediaUrl(rawVideoUrl, bucketCandidate);
  const videoUrl = resolvedVideo.url;

  // Video player state
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const userInteractedRef = useRef(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(post.duration || 0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [downloading, setDownloading] = useState(false);
  const [hasError, setHasError] = useState(false);

  // Lightbox modal state for photos
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  const mediaUrls = post.mediaUrls || (post.linkUrl ? [post.linkUrl] : []);

  // Synchronize DOM muted state with isMuted state
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = isMuted;
    }
  }, [isMuted]);

  // Synchronize playback state using native HTMLMediaElement events
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const onPlay = () => {
      setIsPlaying(true);
      setHasError(false);
    };
    const onPause = () => setIsPlaying(false);
    const onEnded = () => setIsPlaying(false);
    const onError = () => {
      const v = videoRef.current;
      const mediaErr = v?.error;
      console.warn(`[Apon Somaj Video] Playback error encountered for post ${post.id}:`, {
        fullPost: post,
        url: videoUrl,
        rawVideoUrl,
        errorCode: mediaErr?.code,
        errorMessage: mediaErr?.message,
        networkState: v?.networkState,
        readyState: v?.readyState,
        isExpiredBlob: resolvedVideo.isExpiredBlob,
        isUnavailable: resolvedVideo.isUnavailable,
        reason: resolvedVideo.reason,
      });
      setHasError(true);
      setIsPlaying(false);
    };
    const onLoadedMetadata = () => {
      if (video.duration && !isNaN(video.duration)) {
        setDuration(video.duration);
      }
    };

    video.addEventListener('play', onPlay);
    video.addEventListener('pause', onPause);
    video.addEventListener('ended', onEnded);
    video.addEventListener('error', onError);
    video.addEventListener('loadedmetadata', onLoadedMetadata);

    return () => {
      video.removeEventListener('play', onPlay);
      video.removeEventListener('pause', onPause);
      video.removeEventListener('ended', onEnded);
      video.removeEventListener('error', onError);
      video.removeEventListener('loadedmetadata', onLoadedMetadata);
    };
  }, [videoUrl]);

  // Viewport intersection observer (respects user interactions)
  useEffect(() => {
    if (!isVideo || !videoRef.current) return;
    const video = videoRef.current;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.intersectionRatio >= 0.5) {
            // Autoplay only if user hasn't explicitly stopped it
            if (!userInteractedRef.current && video.paused) {
              video.muted = true;
              setIsMuted(true);
              video.play().catch(() => {});
            }
          } else if (!entry.isIntersecting) {
            // Scrolled out of view: pause to conserve memory & bandwidth
            if (!video.paused) {
              video.pause();
            }
          }
        });
      },
      { threshold: [0, 0.5] }
    );

    observer.observe(video);
    return () => observer.disconnect();
  }, [isVideo, videoUrl]);

  // Sync video time
  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
      if (!duration && videoRef.current.duration) {
        setDuration(videoRef.current.duration);
      }
    }
  };

  const togglePlay = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!videoRef.current) return;

    if (videoRef.current.paused) {
      userInteractedRef.current = true;
      videoRef.current
        .play()
        .then(() => {
          setIsPlaying(true);
          setHasError(false);
        })
        .catch((err) => {
          console.warn('Playback error, retrying muted:', err);
          if (videoRef.current) {
            videoRef.current.muted = true;
            setIsMuted(true);
            videoRef.current
              .play()
              .then(() => {
                setIsPlaying(true);
                setHasError(false);
              })
              .catch(() => {
                setHasError(true);
                setIsPlaying(false);
              });
          }
        });
    } else {
      userInteractedRef.current = false;
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  const toggleMute = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!videoRef.current) return;
    const nextMuted = !isMuted;
    videoRef.current.muted = nextMuted;
    setIsMuted(nextMuted);
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    setCurrentTime(val);
    if (videoRef.current) {
      videoRef.current.currentTime = val;
    }
  };

  const handleDownload = async (urlToDownload: string, filename: string) => {
    if (post.downloadEnabled === false) return;
    setDownloading(true);
    try {
      await downloadMediaFile(urlToDownload, filename, true);
    } finally {
      setDownloading(false);
    }
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  if (mediaUrls.length === 0 && !videoUrl && !isVideo) return null;

  // =========================================================================
  // 1. VIDEO OR REEL RENDERING
  // =========================================================================
  if (isVideo) {
    const isReel = post.postType === 'reel';

    if (!videoUrl || resolvedVideo.isUnavailable) {
      console.warn(`[Apon Somaj Video] Post ${post.id} video is missing or unavailable:`, resolvedVideo.reason || 'Missing media URL');
      const poster = post.thumbnailUrl || post.coverUrl;
      const formattedDuration = (post.reelDuration || post.duration)
        ? `${post.reelDuration || post.duration}s`
        : null;

      return (
        <div className="relative mt-3 overflow-hidden rounded-2xl border border-slate-700/60 bg-slate-900 text-white shadow-md">
          {/* Subtle blurred poster backdrop if thumbnail exists */}
          {poster ? (
            <div className="absolute inset-0 z-0 overflow-hidden">
              <img
                src={poster}
                alt=""
                className="h-full w-full object-cover opacity-25 blur-xs scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/80 to-slate-950/90" />
            </div>
          ) : (
            <div className="absolute inset-0 z-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-800/40 via-slate-900/90 to-slate-950" />
          )}

          {/* Top Status Bar with subtle offline indicator */}
          <div className="relative z-10 flex items-center justify-between px-3.5 py-2.5 border-b border-white/5 bg-slate-950/40 backdrop-blur-xs">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-slate-800/90 px-2.5 py-0.5 text-[11px] font-medium text-slate-300 border border-slate-700/60 shadow-2xs">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400/30 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-400"></span>
              </span>
              <span>মিডিয়া অফলাইন</span>
            </div>

            <div className="flex items-center gap-2 text-[11px] text-slate-400">
              {isReel && (
                <span className="rounded-md bg-white/10 px-2 py-0.5 text-slate-300 font-medium">
                  রিল
                </span>
              )}
              {formattedDuration && (
                <span className="inline-flex items-center gap-1 text-slate-400">
                  <Clock className="h-3 w-3 text-slate-500" />
                  {formattedDuration}
                </span>
              )}
            </div>
          </div>

          {/* Center Card Content */}
          <div className="relative z-10 flex flex-col items-center justify-center py-7 px-4 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-800/80 text-amber-300/90 border border-slate-700/60 mb-3 shadow-inner">
              <VideoOff className="h-6 w-6 text-amber-400/80" />
            </div>
            <p className="text-sm font-semibold text-slate-100 tracking-tight">
              ভিডিও ফাইলটি বর্তমানে অনুপলব্ধ
            </p>
            <p className="text-xs text-slate-400 mt-1 max-w-sm leading-relaxed">
              এই পোস্টের মূল ভিডিও ফাইলটি ক্লাউড স্টোরেজে পাওয়া যাচ্ছে না অথবা পূর্ববর্তী সেশনের ছিল। তবে পোস্টের বিবরণ ও মন্তব্য অক্ষত রয়েছে।
            </p>
          </div>
        </div>
      );
    }

    return (
      <div className="mt-3 overflow-hidden rounded-2xl border border-slate-200/90 bg-black text-white shadow-md">
        <div
          ref={containerRef}
          onMouseEnter={() => setShowControls(true)}
          onMouseLeave={() => setShowControls(isPlaying ? false : true)}
          className={`relative flex items-center justify-center overflow-hidden bg-black ${
            isReel ? 'aspect-[9/16] max-h-[560px] mx-auto w-auto' : 'aspect-video w-full'
          }`}
        >
          <video
            ref={videoRef}
            src={videoUrl}
            poster={post.thumbnailUrl || post.coverUrl}
            playsInline
            preload="metadata"
            muted={isMuted}
            loop={isReel}
            onClick={togglePlay}
            onTimeUpdate={handleTimeUpdate}
            className="h-full w-full object-contain cursor-pointer"
          >
            <source src={videoUrl} type={getVideoMimeType(videoUrl)} />
            আপনার ব্রাউজার এই ভিডিওটি সমর্থন করে না।
          </video>

          {/* Playback Error Overlay with subtle indicator */}
          {hasError && (
            <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-black/85 p-4 text-center backdrop-blur-xs">
              <div className="rounded-2xl bg-rose-500/20 p-3 text-rose-400 mb-2 border border-rose-500/30">
                <AlertCircle className="h-6 w-6" />
              </div>
              <div className="inline-flex items-center gap-1.5 rounded-full bg-rose-950/80 px-2.5 py-0.5 text-[10px] font-medium text-rose-300 border border-rose-800/50 mb-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-rose-400"></span>
                প্লেব্যাক সংযোগ বিচ্ছিন্ন
              </div>
              <p className="text-xs text-slate-200 font-medium mb-1">ভিডিও চালানো সম্ভব হয়নি</p>
              <p className="text-[11px] text-slate-400 mb-3 max-w-xs leading-relaxed">
                ভিডিও ফাইলটি সার্ভার থেকে প্লে করা যায়নি। ইন্টারনেট সংযোগ ও ফরম্যাট পরীক্ষা করুন।
              </p>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setHasError(false);
                  if (videoRef.current) {
                    videoRef.current.load();
                    videoRef.current.play().catch(() => {});
                  }
                }}
                className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 px-3.5 py-1.5 text-xs font-semibold text-white transition-colors shadow-sm"
              >
                <Play className="h-3.5 w-3.5 fill-white" />
                আবার চেষ্টা করুন
              </button>
            </div>
          )}

          {/* Reel Badge */}
          {isReel && (
            <div className="absolute top-3 left-3 flex items-center gap-1.5 rounded-full bg-black/60 px-3 py-1 text-xs font-bold text-emerald-400 backdrop-blur-md border border-white/10 z-20">
              <Film className="h-3.5 w-3.5 text-emerald-400" />
              <span>রিল (Reel)</span>
              {post.reelDuration && <span className="text-white/80">• {post.reelDuration}s</span>}
            </div>
          )}

          {/* Attached Music Badge */}
          {post.musicTitle && (
            <div className="absolute top-3 right-3 flex items-center gap-1.5 rounded-full bg-black/60 px-3 py-1 text-xs text-white backdrop-blur-md border border-white/10 z-20 max-w-[200px] truncate">
              <Music className="h-3.5 w-3.5 text-emerald-400 shrink-0 animate-pulse" />
              <span className="truncate">{post.musicTitle}</span>
            </div>
          )}

          {/* Big Center Play/Pause Button */}
          {!isPlaying && (
            <button
              onClick={togglePlay}
              className="absolute inset-0 m-auto flex h-14 w-14 items-center justify-center rounded-full bg-black/60 text-white shadow-xl hover:scale-110 transition-transform z-10 backdrop-blur-xs"
            >
              <Play className="h-7 w-7 fill-white ml-1" />
            </button>
          )}

          {/* Bottom Custom Controls Bar */}
          <div
            className={`absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-3 transition-opacity duration-300 z-20 ${
              showControls || !isPlaying ? 'opacity-100' : 'opacity-0 pointer-events-none'
            }`}
          >
            {/* Scrubber timeline */}
            <div className="relative flex items-center mb-2">
              <input
                type="range"
                min="0"
                max={duration || 100}
                step="0.1"
                value={currentTime}
                onChange={handleSeek}
                className="w-full h-1.5 bg-white/30 rounded-lg appearance-none cursor-pointer accent-emerald-500"
              />
            </div>

            {/* Control buttons */}
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-3">
                <button onClick={togglePlay} className="hover:text-emerald-400 transition-colors">
                  {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4 fill-white" />}
                </button>

                <button onClick={toggleMute} className="hover:text-emerald-400 transition-colors">
                  {isMuted ? <VolumeX className="h-4 w-4 text-rose-400" /> : <Volume2 className="h-4 w-4" />}
                </button>

                <div className="font-mono text-[11px] text-white/80">
                  <span>{formatTime(currentTime)}</span>
                  <span> / </span>
                  <span>{formatTime(duration)}</span>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                {/* Playback speed toggle */}
                <button
                  onClick={() => {
                    const next = playbackSpeed === 1 ? 1.5 : playbackSpeed === 1.5 ? 2 : 1;
                    setPlaybackSpeed(next);
                    if (videoRef.current) videoRef.current.playbackRate = next;
                  }}
                  className="rounded px-1.5 py-0.5 bg-white/10 hover:bg-white/20 text-[10px] font-bold font-mono"
                >
                  {playbackSpeed}x
                </button>

                {/* Download media button if enabled */}
                {post.downloadEnabled !== false ? (
                  <button
                    onClick={() => handleDownload(videoUrl, `apon_somaj_video_${post.id}.mp4`)}
                    disabled={downloading}
                    className="hover:text-emerald-400 transition-colors"
                    title="ভিডিও ডাউনলোড করুন"
                  >
                    <Download className="h-4 w-4" />
                  </button>
                ) : (
                  <span title="স্রষ্টা ডাউনলোড বন্ধ রেখেছেন" className="text-white/40 cursor-not-allowed">
                    <Lock className="h-3.5 w-3.5" />
                  </span>
                )}

                {/* Fullscreen */}
                <button onClick={toggleFullscreen} className="hover:text-emerald-400 transition-colors">
                  {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // 2. NORMAL PHOTOS / PHOTO CAROUSEL RENDERING
  // =========================================================================
  const openLightbox = (idx: number) => {
    setLightboxIndex(idx);
    setLightboxOpen(true);
  };

  const count = mediaUrls.length;

  return (
    <>
      <div className="mt-3 overflow-hidden rounded-2xl border border-slate-200/80 bg-slate-50">
        {/* Single Photo */}
        {count === 1 && (
          <div
            onClick={() => openLightbox(0)}
            className="group relative max-h-[520px] w-full overflow-hidden bg-slate-950 cursor-pointer flex items-center justify-center"
          >
            <img
              src={mediaUrls[0]}
              alt=""
              className="max-h-[520px] w-full object-contain transition-transform duration-300 group-hover:scale-101"
            />
            {post.downloadEnabled !== false && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDownload(mediaUrls[0], `photo_${post.id}.jpg`);
                }}
                className="absolute bottom-3 right-3 rounded-full bg-black/60 p-2 text-white opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-xs hover:bg-black/80"
                title="ডাউনলোড করুন"
              >
                <Download className="h-4 w-4" />
              </button>
            )}
          </div>
        )}

        {/* 2 Photos: Side-by-side */}
        {count === 2 && (
          <div className="grid grid-cols-2 gap-1.5">
            {mediaUrls.map((url, i) => (
              <div
                key={i}
                onClick={() => openLightbox(i)}
                className="relative aspect-square max-h-80 overflow-hidden cursor-pointer group bg-slate-900"
              >
                <img
                  src={url}
                  alt=""
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-103"
                />
              </div>
            ))}
          </div>
        )}

        {/* 3 Photos: 1 Big left, 2 stacked right */}
        {count === 3 && (
          <div className="grid grid-cols-3 gap-1.5 h-80">
            <div
              onClick={() => openLightbox(0)}
              className="col-span-2 h-full overflow-hidden cursor-pointer group bg-slate-900"
            >
              <img
                src={mediaUrls[0]}
                alt=""
                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-103"
              />
            </div>
            <div className="col-span-1 flex flex-col gap-1.5 h-full">
              {mediaUrls.slice(1).map((url, i) => (
                <div
                  key={i}
                  onClick={() => openLightbox(i + 1)}
                  className="relative flex-1 overflow-hidden cursor-pointer group bg-slate-900"
                >
                  <img
                    src={url}
                    alt=""
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-103"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 4 Photos: 2x2 symmetrical grid */}
        {count === 4 && (
          <div className="grid grid-cols-2 gap-1.5">
            {mediaUrls.map((url, i) => (
              <div
                key={i}
                onClick={() => openLightbox(i)}
                className="relative aspect-square max-h-56 overflow-hidden cursor-pointer group bg-slate-900"
              >
                <img
                  src={url}
                  alt=""
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-103"
                />
              </div>
            ))}
          </div>
        )}

        {/* 5+ Photos: 2x2 grid with +N badge on 4th item */}
        {count >= 5 && (
          <div className="grid grid-cols-2 gap-1.5">
            {mediaUrls.slice(0, 3).map((url, i) => (
              <div
                key={i}
                onClick={() => openLightbox(i)}
                className="relative aspect-square max-h-56 overflow-hidden cursor-pointer group bg-slate-900"
              >
                <img
                  src={url}
                  alt=""
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-103"
                />
              </div>
            ))}

            {/* 4th item with overlay */}
            <div
              onClick={() => openLightbox(3)}
              className="relative aspect-square max-h-56 overflow-hidden cursor-pointer group bg-slate-900"
            >
              <img
                src={mediaUrls[3]}
                alt=""
                className="h-full w-full object-cover filter brightness-50 transition-transform duration-300 group-hover:scale-103"
              />
              <div className="absolute inset-0 flex items-center justify-center text-2xl font-bold text-white">
                +{count - 3}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Lightbox / Fullscreen Carousel Modal */}
      {lightboxOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 p-2 sm:p-4 backdrop-blur-md animate-in fade-in">
          {/* Header controls */}
          <div className="absolute top-4 inset-x-4 flex items-center justify-between text-white z-20">
            <div className="rounded-full bg-black/60 px-3 py-1 text-xs font-mono backdrop-blur-md">
              {lightboxIndex + 1} / {mediaUrls.length}
            </div>

            <div className="flex items-center gap-2">
              {post.downloadEnabled !== false && (
                <button
                  onClick={() =>
                    handleDownload(mediaUrls[lightboxIndex], `photo_${post.id}_${lightboxIndex + 1}.jpg`)
                  }
                  className="rounded-full bg-black/60 p-2 hover:bg-black/80 transition-colors"
                  title="ডাউনলোড করুন"
                >
                  <Download className="h-5 w-5" />
                </button>
              )}
              <button
                onClick={() => setLightboxOpen(false)}
                className="rounded-full bg-black/60 p-2 hover:bg-black/80 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Main preview image */}
          <div className="relative flex max-h-full max-w-full items-center justify-center">
            <img
              src={mediaUrls[lightboxIndex]}
              alt=""
              className="max-h-[82vh] max-w-[90vw] object-contain select-none"
            />

            {/* Navigation buttons */}
            {mediaUrls.length > 1 && (
              <>
                <button
                  onClick={() =>
                    setLightboxIndex((prev) => (prev > 0 ? prev - 1 : mediaUrls.length - 1))
                  }
                  className="absolute -left-3 sm:-left-6 top-1/2 -translate-y-1/2 rounded-full bg-black/60 p-3 text-white hover:bg-black/80 backdrop-blur-xs transition-transform hover:scale-110"
                >
                  <ChevronLeft className="h-6 w-6" />
                </button>
                <button
                  onClick={() =>
                    setLightboxIndex((prev) => (prev < mediaUrls.length - 1 ? prev + 1 : 0))
                  }
                  className="absolute -right-3 sm:-right-6 top-1/2 -translate-y-1/2 rounded-full bg-black/60 p-3 text-white hover:bg-black/80 backdrop-blur-xs transition-transform hover:scale-110"
                >
                  <ChevronRight className="h-6 w-6" />
                </button>
              </>
            )}
          </div>

          {/* Bottom Thumbnails Strip */}
          {mediaUrls.length > 1 && (
            <div className="absolute bottom-4 inset-x-0 flex items-center justify-center gap-2 overflow-x-auto px-4 z-20">
              {mediaUrls.map((url, i) => (
                <button
                  key={i}
                  onClick={() => setLightboxIndex(i)}
                  className={`h-12 w-12 shrink-0 overflow-hidden rounded-lg border-2 transition-all ${
                    lightboxIndex === i
                      ? 'border-emerald-500 ring-2 ring-emerald-500/50'
                      : 'border-transparent opacity-60 hover:opacity-100'
                  }`}
                >
                  <img src={url} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </>
  );
};
