import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { fetchVideoPostsFromDb } from '../services/supabaseDataService';
import {
  downloadMediaFile,
  isLikelyVideoUrl,
  getVideoMimeType,
  resolvePlayableMediaUrl
} from '../services/mediaStorageService';
import { Post, ReactionType } from '../types';
import {
  ArrowLeft,
  Video,
  Heart,
  MessageCircle,
  Bookmark,
  Share2,
  Plus,
  Play,
  MapPin,
  Clock,
  Sparkles,
  Download,
  Check,
  VideoOff,
} from 'lucide-react';

function resolvePostVideoUrl(post: Post): { url: string; isUnavailable: boolean; isExpiredBlob: boolean; reason?: string } {
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

  const candidateUrls = [
    storagePathCandidate,
    ...postMediaUrls,
    ...(post.mediaUrls || []),
    post.linkUrl,
    (post as any).media_url,
    ...((post as any).media_urls || [])
  ].filter(Boolean) as string[];

  const nonBlobCandidates = candidateUrls.filter(u => typeof u === 'string' && !u.startsWith('blob:'));
  const detected =
    nonBlobCandidates.find(isLikelyVideoUrl) ||
    candidateUrls.find(isLikelyVideoUrl);
  const raw = detected || (post.mediaType === 'video' || post.postType === 'reel' ? (nonBlobCandidates[0] || candidateUrls[0]) : '');
  return resolvePlayableMediaUrl(raw, bucketCandidate);
}

export const ReelsVideoView: React.FC = () => {
  const {
    currentUser,
    users,
    posts,
    setActiveView,
    reactToPost,
    toggleSavePost,
    savedPostIds,
    setCreatePostModalOpen,
    selectedEntityId,
  } = useApp();

  const [videoPosts, setVideoPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [downloadingPostId, setDownloadingPostId] = useState<string | null>(null);
  const [copiedPostId, setCopiedPostId] = useState<string | null>(null);
  const [activePlayingId, setActivePlayingId] = useState<string | null>(null);
  const videoRefs = useRef<Record<string, HTMLVideoElement | null>>({});

  // Load video posts
  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);

    // 1. Filter local/context posts that are videos
    const localVideoPosts = posts.filter(
      p =>
        p.mediaType === 'video' ||
        p.postType === 'reel' ||
        Boolean(p.duration) ||
        Boolean(p.reelDuration) ||
        (p.mediaUrls && p.mediaUrls.some(isLikelyVideoUrl)) ||
        isLikelyVideoUrl(p.linkUrl)
    );

    // 2. Fetch from DB
    fetchVideoPostsFromDb()
      .then(dbVideos => {
        if (!isMounted) return;
        let combined: Post[] = [];
        if (dbVideos && dbVideos.length > 0) {
          const map = new Map<string, Post>();
          for (const v of dbVideos) map.set(v.id, v);
          for (const v of localVideoPosts) {
            if (!map.has(v.id)) map.set(v.id, v);
          }
          combined = Array.from(map.values());
        } else {
          combined = localVideoPosts;
        }

        // Deep-link: bring selected reel to top if specified
        if (selectedEntityId) {
          combined.sort((a, b) => (a.id === selectedEntityId ? -1 : b.id === selectedEntityId ? 1 : 0));
        }

        setVideoPosts(combined);
      })
      .catch(() => {
        if (isMounted) {
          const list = [...localVideoPosts];
          if (selectedEntityId) {
            list.sort((a, b) => (a.id === selectedEntityId ? -1 : b.id === selectedEntityId ? 1 : 0));
          }
          setVideoPosts(list);
        }
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [posts, selectedEntityId]);

  const getAuthor = (authorId: string) => {
    return users.find(u => u.id === authorId) || (currentUser?.id === authorId ? currentUser : null);
  };

  const isSaved = (postId: string) => savedPostIds.includes(postId);

  const getReactionCount = (post: Post) => {
    return Object.values(post.reactions || {}).reduce((acc, curr) => acc + (curr?.length || 0), 0);
  };

  const hasReacted = (post: Post) => {
    if (!currentUser) return false;
    return Object.values(post.reactions || {}).some(arr => arr?.includes(currentUser.id));
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white pb-20">
      {/* Top Header */}
      <div className="sticky top-0 z-30 flex items-center justify-between border-b border-white/10 bg-slate-900/90 px-4 py-3 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setActiveView('feed')}
            className="flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-xs font-semibold text-white hover:bg-white/20 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>হোমে ফিরুন</span>
          </button>
          <div className="flex items-center gap-2">
            <Video className="h-5 w-5 text-emerald-400" />
            <h1 className="text-sm font-bold text-white">রিলস ও কমিউনিটি ভিডিও</h1>
          </div>
        </div>

        <button
          onClick={() => setCreatePostModalOpen(true)}
          className="flex items-center gap-1.5 rounded-full bg-emerald-600 px-3.5 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-emerald-500 transition-colors"
        >
          <Plus className="h-3.5 w-3.5" />
          <span>ভিডিও আপলোড</span>
        </button>
      </div>

      {/* Content Area */}
      <div className="max-w-md mx-auto pt-4 px-2 space-y-6">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 text-center space-y-3">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />
            <p className="text-xs text-slate-400">ভিডিও লোড হচ্ছে...</p>
          </div>
        ) : videoPosts.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-slate-800/60 p-8 text-center space-y-4">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400">
              <Play className="h-7 w-7" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">বর্তমানে কোনো ভিডিও বা রিলস নেই</h3>
              <p className="mt-1 text-xs text-slate-400 max-w-xs mx-auto">
                কমিউনিটির সাথে ভিডিও বা শিক্ষণীয় মুহূর্ত শেয়ার করতে আপনার প্রথম ভিডিও পোস্ট করুন।
              </p>
            </div>
            <button
              onClick={() => setCreatePostModalOpen(true)}
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-emerald-500 transition-colors"
            >
              <Plus className="h-4 w-4" />
              <span>নতুন ভিডিও পোস্ট তৈরি করুন</span>
            </button>
          </div>
        ) : (
          videoPosts.map(post => {
            const author = getAuthor(post.authorId);
            const { url: videoUrl, isUnavailable, isExpiredBlob } = resolvePostVideoUrl(post);

            return (
              <div
                key={post.id}
                className="overflow-hidden rounded-2xl border border-white/10 bg-slate-800/80 shadow-xl"
              >
                {/* Author Info */}
                <div className="flex items-center justify-between p-3.5 border-b border-white/5 bg-slate-800">
                  <div className="flex items-center gap-2.5">
                    <img
                      src={author?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100'}
                      alt=""
                      className="h-9 w-9 rounded-full object-cover ring-1 ring-emerald-500"
                    />
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-white">{author?.name || 'ব্যবহারকারী'}</span>
                        {author?.isVerified && (
                          <span className="rounded-full bg-emerald-500/20 px-1.5 py-0.2 text-[9px] font-semibold text-emerald-400">
                            ভেরিফাইড
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-[10px] text-slate-400">
                        <span className="flex items-center gap-0.5">
                          <Clock className="h-2.5 w-2.5" />
                          {post.createdAt}
                        </span>
                        {post.location?.districtName && (
                          <span className="flex items-center gap-0.5">
                            <MapPin className="h-2.5 w-2.5" />
                            {post.location.districtName}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Video Player or Embedded link */}
                <div className="relative aspect-[9/16] max-h-[500px] w-full bg-black flex items-center justify-center overflow-hidden">
                  {/* Music badge */}
                  {post.musicTitle && (
                    <div className="absolute top-3 left-3 z-20 flex items-center gap-1.5 rounded-full bg-black/60 px-3 py-1 text-xs text-white backdrop-blur-md border border-white/10 max-w-[200px] truncate">
                      <Sparkles className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                      <span className="truncate">🎵 {post.musicTitle}</span>
                    </div>
                  )}

                  {videoUrl && !isUnavailable ? (
                    videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be') ? (
                      <iframe
                        src={videoUrl.replace('watch?v=', 'embed/')}
                        title="Video"
                        className="h-full w-full"
                        allowFullScreen
                      />
                    ) : (
                      <video
                        ref={(el) => {
                          videoRefs.current[post.id] = el;
                        }}
                        src={videoUrl}
                        controls
                        playsInline
                        preload="metadata"
                        poster={post.thumbnailUrl || post.coverUrl}
                        onError={(e) => {
                          const v = e.currentTarget;
                          console.warn(`[Apon Somaj Reels] Video playback warning for post ${post.id}:`, {
                            url: videoUrl,
                            errorCode: v?.error?.code,
                            errorMessage: v?.error?.message,
                            isExpiredBlob,
                          });
                        }}
                        onPlay={() => {
                          setActivePlayingId(post.id);
                          // Pause any other playing video
                          Object.entries(videoRefs.current).forEach(([id, el]) => {
                            if (id !== post.id && el && !el.paused) {
                              el.pause();
                            }
                          });
                        }}
                        className="h-full w-full object-contain"
                      >
                        <source src={videoUrl} type={getVideoMimeType(videoUrl)} />
                        আপনার ব্রাউজার এই ভিডিওটি চালাতে পারছে না।
                      </video>
                    )
                  ) : (
                    <div className="relative flex h-full w-full flex-col items-center justify-center p-6 text-center overflow-hidden bg-slate-950">
                      {/* Blurred poster background if available */}
                      {(post.thumbnailUrl || post.coverUrl) && (
                        <div className="absolute inset-0 z-0 overflow-hidden">
                          <img
                            src={post.thumbnailUrl || post.coverUrl}
                            alt=""
                            className="h-full w-full object-cover opacity-20 blur-xs scale-105"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/85 to-slate-950/90" />
                        </div>
                      )}

                      {/* Offline pill indicator */}
                      <div className="relative z-10 mb-3 inline-flex items-center gap-1.5 rounded-full bg-slate-800/90 px-2.5 py-0.5 text-[11px] font-medium text-slate-300 border border-slate-700/60 shadow-2xs">
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400/30 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-400"></span>
                        </span>
                        <span>রিল অফলাইন</span>
                      </div>

                      <div className="relative z-10 mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-800/80 text-amber-400/80 border border-slate-700/60 mb-2.5 shadow-inner">
                        <VideoOff className="h-6 w-6" />
                      </div>
                      <p className="relative z-10 text-xs font-semibold text-slate-200">ভিডিওটি বর্তমানে অনুপলব্ধ</p>
                      <p className="relative z-10 text-[11px] text-slate-400 mt-1 max-w-xs leading-relaxed">
                        এই রিলটির ফাইল সার্ভার বা ক্লাউড স্টোরেজে পাওয়া যায়নি।
                      </p>
                    </div>
                  )}
                </div>

                {/* Caption */}
                {post.content && (
                  <div className="p-3 text-xs text-slate-200 border-t border-white/5 leading-relaxed">
                    {post.content}
                  </div>
                )}

                {/* Action Controls */}
                <div className="flex items-center justify-between border-t border-white/10 px-4 py-2.5 bg-slate-800/90 text-xs">
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => reactToPost(post.id, 'love')}
                      className={`flex items-center gap-1.5 transition-colors ${
                        hasReacted(post) ? 'text-rose-400 font-bold' : 'text-slate-300 hover:text-white'
                      }`}
                    >
                      <Heart
                        className={`h-4 w-4 ${hasReacted(post) ? 'fill-rose-400 text-rose-400' : ''}`}
                      />
                      <span>{getReactionCount(post)}</span>
                    </button>

                    <button
                      onClick={() => setActiveView('feed')}
                      className="flex items-center gap-1.5 text-slate-300 hover:text-white transition-colors"
                    >
                      <MessageCircle className="h-4 w-4" />
                      <span>{post.commentCount || 0}</span>
                    </button>
                  </div>

                  <div className="flex items-center gap-3">
                    {post.downloadEnabled !== false && videoUrl && !videoUrl.includes('youtube') && (
                      <button
                        onClick={async () => {
                          setDownloadingPostId(post.id);
                          try {
                            await downloadMediaFile(videoUrl, `apon_reel_${post.id}.mp4`, true);
                          } finally {
                            setDownloadingPostId(null);
                          }
                        }}
                        disabled={downloadingPostId === post.id}
                        title="ভিডিও ডাউনলোড করুন"
                        className="flex items-center gap-1 text-slate-300 hover:text-white transition-colors"
                      >
                        <Download className="h-4 w-4" />
                        <span className="text-[11px]">{downloadingPostId === post.id ? 'ডাউনলোড...' : 'ডাউনলোড'}</span>
                      </button>
                    )}

                    <button
                      onClick={() => toggleSavePost(post.id)}
                      className={`flex items-center gap-1 transition-colors ${
                        isSaved(post.id) ? 'text-amber-400' : 'text-slate-300 hover:text-white'
                      }`}
                    >
                      <Bookmark className={`h-4 w-4 ${isSaved(post.id) ? 'fill-amber-400' : ''}`} />
                      <span>{isSaved(post.id) ? 'সংরক্ষিত' : 'সেভ'}</span>
                    </button>

                    <button
                      onClick={() => {
                        const shareUrl = `${window.location.origin}/reel/${post.id}`;
                        if (navigator.clipboard) {
                          navigator.clipboard.writeText(shareUrl);
                          setCopiedPostId(post.id);
                          setTimeout(() => setCopiedPostId(null), 2000);
                        } else if (navigator.share) {
                          navigator.share({ title: 'Apon Somaj Video', url: shareUrl });
                        }
                      }}
                      title="লিংক কপি করুন"
                      className="flex items-center gap-1 text-slate-300 hover:text-white transition-colors"
                    >
                      {copiedPostId === post.id ? (
                        <>
                          <Check className="h-4 w-4 text-emerald-400" />
                          <span className="text-emerald-400 text-[11px]">কপি হয়েছে</span>
                        </>
                      ) : (
                        <Share2 className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
