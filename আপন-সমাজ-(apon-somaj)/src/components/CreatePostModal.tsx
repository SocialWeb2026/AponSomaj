import React, { useState, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { BangladeshLocationPicker } from './BangladeshLocationPicker';
import {
  X,
  Image as ImageIcon,
  Video,
  Film,
  Camera,
  Laptop,
  MapPin,
  Smile,
  BarChart2,
  Globe2,
  Users,
  Lock,
  Plus,
  Trash2,
  Sparkles,
  Sliders,
  Music,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Download,
  MessageSquare,
} from 'lucide-react';
import { LocationTag, MusicTrack, VideoEditState, ImageEditState } from '../types';
import { ImageEditorModal } from './media/ImageEditorModal';
import { VideoReelEditorModal } from './media/VideoReelEditorModal';
import { CameraRecordModal } from './media/CameraRecordModal';
import { ImageToReelModal } from './media/ImageToReelModal';
import { uploadMediaToStorage, generateVideoThumbnail, registerSessionBlobUrl } from '../services/mediaStorageService';

interface SelectedMediaItem {
  id: string;
  type: 'image' | 'video';
  file?: File;
  originalUrl: string;
  editedUrl?: string;
  thumbnailUrl?: string;
  duration?: number;
}

const CreatePostModalDialog: React.FC = () => {
  const {
    currentUser,
    setCreatePostModalOpen,
    setAuthModalOpen,
    createPost,
    divisions,
    districts,
    upazilas,
    unions,
    wards,
  } = useApp();

  // Core post form state
  const [content, setContent] = useState('');
  const [postType, setPostType] = useState<'standard' | 'reel'>('standard');
  const [selectedMedia, setSelectedMedia] = useState<SelectedMediaItem[]>([]);
  const [reelDurationLimit, setReelDurationLimit] = useState<15 | 30 | 60 | 90 | 180>(30);

  // Music metadata for Reel/Video
  const [selectedMusic, setSelectedMusic] = useState<MusicTrack | undefined>(undefined);
  const [musicVolume, setMusicVolume] = useState(0.8);
  const [originalAudioVolume, setOriginalAudioVolume] = useState(1.0);
  const [originalAudio, setOriginalAudio] = useState(true);

  // Settings
  const [visibility, setVisibility] = useState<'public' | 'friends' | 'only_me'>('public');
  const [commentsEnabled, setCommentsEnabled] = useState(true);
  const [downloadEnabled, setDownloadEnabled] = useState(true);
  const [feeling, setFeeling] = useState('');
  const [showFeelings, setShowFeelings] = useState(false);

  // Upload progress and processing state
  const [isPublishing, setIsPublishing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [processingStage, setProcessingStage] = useState<
    'idle' | 'uploading' | 'processing' | 'generating_thumbnail' | 'ready' | 'failed'
  >('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Editor modals state
  const [imageEditorOpen, setImageEditorOpen] = useState(false);
  const [videoEditorOpen, setVideoEditorOpen] = useState(false);
  const [cameraModalOpen, setCameraModalOpen] = useState(false);
  const [cameraMode, setCameraMode] = useState<'photo' | 'video' | 'reel'>('photo');
  const [photoToReelOpen, setPhotoToReelOpen] = useState(false);

  // Hidden file inputs
  const photoInputRef = useRef<HTMLInputElement | null>(null);
  const videoInputRef = useRef<HTMLInputElement | null>(null);
  const reelInputRef = useRef<HTMLInputElement | null>(null);
  const computerInputRef = useRef<HTMLInputElement | null>(null);

  // Bangladesh location
  const [showLocationPicker, setShowLocationPicker] = useState(false);
  const [postLocation, setPostLocation] = useState<{
    divisionId?: string;
    districtId?: string;
    upazilaId?: string;
    unionId?: string;
    wardId?: string;
  }>({
    divisionId: currentUser?.divisionId,
    districtId: currentUser?.districtId,
    upazilaId: currentUser?.upazilaId,
    unionId: currentUser?.unionId,
    wardId: currentUser?.wardId,
  });

  // Poll state
  const [showPoll, setShowPoll] = useState(false);
  const [pollQuestion, setPollQuestion] = useState('');
  const [pollOptions, setPollOptions] = useState<string[]>(['', '']);

  // Drag & drop state
  const [isDragging, setIsDragging] = useState(false);

  const postLocationLabel = [
    wards.find((w) => w.id === postLocation.wardId)?.bnName,
    unions.find((u) => u.id === postLocation.unionId)?.bnName,
    upazilas.find((u) => u.id === postLocation.upazilaId)?.bnName,
    districts.find((d) => d.id === postLocation.districtId)?.bnName,
    divisions.find((d) => d.id === postLocation.divisionId)?.bnName,
  ]
    .filter(Boolean)
    .join(', ');

  // File Handlers & Validation
  const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
  const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/quicktime', 'video/webm'];
  const MAX_IMAGE_SIZE = 20 * 1024 * 1024; // 20MB
  const MAX_VIDEO_SIZE = 100 * 1024 * 1024; // 100MB

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    processSelectedPhotos(Array.from(files));
    e.target.value = '';
  };

  const processSelectedPhotos = (files: File[]) => {
    setErrorMessage(null);
    const validItems: SelectedMediaItem[] = [];

    for (const file of files) {
      const ext = file.name.split('.').pop()?.toLowerCase();
      const isValidMime = ALLOWED_IMAGE_TYPES.includes(file.type);
      const isValidExt = ext && ['jpg', 'jpeg', 'png', 'webp'].includes(ext);

      if (!isValidMime && !isValidExt) {
        setErrorMessage('শুধুমাত্র JPG, JPEG, PNG অথবা WEBP ফরম্যাটের ছবি আপলোড করা যাবে (সর্বোচ্চ ২০ মেগাবাইট)।');
        return;
      }

      if (file.size > MAX_IMAGE_SIZE) {
        setErrorMessage(`ছবির সাইজ (${(file.size / (1024 * 1024)).toFixed(1)}MB) সর্বোচ্চ ২০ মেগাবাইট সীমার বেশি।`);
        return;
      }

      validItems.push({
        id: `media-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        type: 'image',
        file,
        originalUrl: registerSessionBlobUrl(URL.createObjectURL(file)),
      });
    }

    setSelectedMedia((prev) => [...prev, ...validItems]);
  };

  const handleVideoSelect = (e: React.ChangeEvent<HTMLInputElement>, isReel: boolean = false) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    processSelectedVideo(files[0], isReel);
    e.target.value = '';
  };

  const processSelectedVideo = (file: File, isReel: boolean = false) => {
    setErrorMessage(null);
    const ext = file.name.split('.').pop()?.toLowerCase();
    const isValidMime = ALLOWED_VIDEO_TYPES.includes(file.type);
    const isValidExt = ext && ['mp4', 'mov', 'webm'].includes(ext);

    if (!isValidMime && !isValidExt) {
      setErrorMessage('শুধুমাত্র MP4, MOV অথবা WEBM ফরম্যাটের ভিডিও আপলোড করা যাবে (সর্বোচ্চ ১০০ মেগাবাইট)।');
      return;
    }

    if (file.size > MAX_VIDEO_SIZE) {
      setErrorMessage(`ভিডিও ফাইলের সাইজ (${(file.size / (1024 * 1024)).toFixed(1)}MB) সর্বোচ্চ ১০০ মেগাবাইট সীমার বেশি।`);
      return;
    }

    const url = registerSessionBlobUrl(URL.createObjectURL(file));

    // Initial thumbnail extraction
    generateVideoThumbnail(file, 0.5)
      .then((res) => {
        const enforcedDuration = isReel
          ? Math.min(res.duration, reelDurationLimit)
          : res.duration;

        const item: SelectedMediaItem = {
          id: `video-${Date.now()}`,
          type: 'video',
          file,
          originalUrl: url,
          thumbnailUrl: res.thumbnailUrl,
          duration: enforcedDuration,
        };

        if (isReel) {
          setPostType('reel');
        }
        setSelectedMedia([item]);
      })
      .catch(() => {
        const item: SelectedMediaItem = {
          id: `video-${Date.now()}`,
          type: 'video',
          file,
          originalUrl: url,
        };
        if (isReel) setPostType('reel');
        setSelectedMedia([item]);
      });
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const droppedFiles = e.dataTransfer.files;
    if (!droppedFiles || droppedFiles.length === 0) return;

    const filesArray = Array.from(droppedFiles);
    const videoFile = filesArray.find((f) => f.type.startsWith('video/'));

    if (videoFile) {
      processSelectedVideo(videoFile, postType === 'reel');
    } else {
      const imageFiles = filesArray.filter((f) => f.type.startsWith('image/'));
      if (imageFiles.length > 0) {
        processSelectedPhotos(imageFiles);
      } else {
        setErrorMessage('অনুপযুক্ত ফাইল ফরম্যাট। শুধুমাত্র ছবি (JPG, PNG, WEBP) অথবা ভিডিও (MP4, MOV, WEBM) নির্বাচন করুন।');
      }
    }
  };

  const handleRemoveMedia = (id: string) => {
    setSelectedMedia((prev) => prev.filter((m) => m.id !== id));
  };

  // Video Editor Save
  const handleVideoEditorSave = (editedState: VideoEditState, coverUrl: string, duration: number) => {
    if (selectedMedia.length > 0) {
      setSelectedMedia((prev) => [
        {
          ...prev[0],
          editedUrl: prev[0].originalUrl,
          thumbnailUrl: coverUrl,
          duration,
        },
      ]);
    }

    if (editedState.musicTrack) {
      setSelectedMusic(editedState.musicTrack);
      setMusicVolume(editedState.musicVolume);
    }
    setOriginalAudio(!editedState.isMuted);
    setOriginalAudioVolume(editedState.volume);
    setReelDurationLimit(editedState.selectedDurationLimit);
  };

  // Publish / Submit Post
  const handlePublish = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() && selectedMedia.length === 0 && !pollQuestion.trim()) return;

    setIsPublishing(true);
    setErrorMessage(null);
    setUploadProgress(10);
    setProcessingStage('uploading');

    try {
      const uploadedMediaUrls: string[] = [];
      let finalThumbnailUrl: string | undefined = undefined;
      let finalDuration: number | undefined = undefined;
      let finalStoragePath: string | undefined = undefined;
      let finalBucket: string | undefined = undefined;

      const userId = currentUser?.id || 'anon_user';

      // Upload all selected media with progress steps
      for (let i = 0; i < selectedMedia.length; i++) {
        const item = selectedMedia[i];
        const bucket = postType === 'reel' ? 'reels' : item.type === 'video' ? 'post-videos' : 'post-images';
        finalBucket = bucket;

        let targetBlobOrFile: File | Blob | null = item.file || null;
        if (item.editedUrl && item.editedUrl.startsWith('data:')) {
          // Convert edited dataUrl to Blob for upload
          const res = await fetch(item.editedUrl);
          targetBlobOrFile = await res.blob();
        }

        if (!targetBlobOrFile) {
          throw new Error(`[Storage Upload Error] (${bucket}): মিডিয়া ফাইল পাওয়া যায়নি। অনুগ্রহ করে ফাইলটি পুনরায় নির্বাচন করুন।`);
        }

        const uploadRes = await uploadMediaToStorage(
          targetBlobOrFile,
          bucket,
          userId,
          (pct, stage) => {
            const basePct = Math.round((i / selectedMedia.length) * 100);
            const chunkPct = Math.round(pct / selectedMedia.length);
            setUploadProgress(Math.min(95, basePct + chunkPct));
            setProcessingStage(stage);
          }
        );

        if (!uploadRes.url || uploadRes.url.startsWith('blob:') || uploadRes.url.startsWith('data:')) {
          throw new Error(`[Storage Upload Error] (${bucket}): ক্লাউড স্টোরেজ আপলোড ব্যর্থ হয়েছে। স্থায়ী ক্লাউড লিঙ্ক পাওয়া যায়নি।`);
        }

        uploadedMediaUrls.push(uploadRes.url);
        finalStoragePath = uploadRes.storagePath;
        if (uploadRes.thumbnailUrl) finalThumbnailUrl = uploadRes.thumbnailUrl;
        if (uploadRes.duration) finalDuration = uploadRes.duration;
      }

      setUploadProgress(95);
      setProcessingStage('processing');

      // Location tag
      const div = divisions.find((d) => d.id === postLocation.divisionId);
      const dist = districts.find((d) => d.id === postLocation.districtId);
      const up = upazilas.find((u) => u.id === postLocation.upazilaId);
      const un = unions.find((u) => u.id === postLocation.unionId);
      const w = wards.find((w) => w.id === postLocation.wardId);

      let locationTag: LocationTag | undefined = undefined;
      if (div || dist || up || un || w) {
        locationTag = {
          divisionId: div?.id,
          divisionName: div?.bnName || div?.name,
          districtId: dist?.id,
          districtName: dist?.bnName || dist?.name,
          upazilaId: up?.id,
          upazilaName: up?.bnName || up?.name,
          unionId: un?.id,
          unionName: un?.bnName || un?.name,
          wardId: w?.id,
          wardName: w?.bnName || w?.name,
        };
      }

      // Poll
      let pollData = undefined;
      if (showPoll && pollQuestion.trim() && pollOptions.filter((o) => o.trim()).length >= 2) {
        pollData = {
          question: pollQuestion.trim(),
          options: pollOptions
            .filter((o) => o.trim())
            .map((text, idx) => ({
              id: `opt-${Date.now()}-${idx}`,
              text: text.trim(),
              votes: [],
            })),
          totalVotes: 0,
        };
      }

      // 4. Create posts & post_media records and update feed
      await createPost({
        content: content.trim(),
        mediaUrls: uploadedMediaUrls,
        storagePath: finalStoragePath,
        bucket: finalBucket,
        mediaType:
          selectedMedia.length > 0
            ? selectedMedia[0].type
            : undefined,
        postType: postType,
        thumbnailUrl: finalThumbnailUrl,
        coverUrl: finalThumbnailUrl,
        duration:
          postType === 'reel'
            ? Math.min(finalDuration || reelDurationLimit, reelDurationLimit)
            : finalDuration,
        reelDuration: postType === 'reel' ? reelDurationLimit : undefined,
        musicId: selectedMusic?.id,
        musicTitle: selectedMusic?.title,
        musicArtist: selectedMusic?.artist,
        musicUrl: selectedMusic?.audioUrl,
        originalAudio,
        originalAudioVolume,
        musicVolume,
        downloadEnabled,
        commentsEnabled,
        processingStatus: 'ready',
        location: locationTag,
        feeling: feeling || undefined,
        poll: pollData,
        visibility,
      });

      // 8. Close and reset modal only after complete database save succeeds
      setContent('');
      setSelectedMedia([]);
      setSelectedMusic(undefined);
      setFeeling('');
      setShowPoll(false);
      setIsPublishing(false);
      setProcessingStage('idle');
      setCreatePostModalOpen(false);
    } catch (err: unknown) {
      console.warn('[CreatePostModal Save Info]:', err instanceof Error ? err.message : err);
      setProcessingStage('failed');
      const msg = err instanceof Error ? err.message : 'পোস্ট প্রকাশ করতে সমস্যা হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।';
      setErrorMessage(msg);
      setIsPublishing(false);
      // Keep user-entered caption, location, category, and selectedMedia
    }
  };

  const feelingsList = [
    'আনন্দিত ও গর্বিত 🌟',
    'কৃতজ্ঞ 🙏',
    'উৎফুল্ল ও সতেজ 🌿',
    'অনুপ্রাণিত 💡',
    'ভ্রমণরত 🚗',
    'উৎসবমুখর 🎉',
    'চিন্তাশীল ☕',
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 p-2 sm:p-4 backdrop-blur-xs animate-in fade-in">
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`relative max-h-[92vh] w-full max-w-xl overflow-y-auto rounded-3xl bg-white p-5 shadow-2xl border transition-all ${
          isDragging
            ? 'border-emerald-500 ring-4 ring-emerald-200/60 bg-emerald-50/30'
            : 'border-slate-100'
        }`}
      >
        {isDragging && (
          <div className="absolute inset-0 z-40 flex flex-col items-center justify-center rounded-3xl bg-emerald-500/90 text-white backdrop-blur-xs p-6 text-center animate-in fade-in">
            <Sparkles className="h-10 w-10 mb-2 animate-bounce" />
            <span className="text-base font-bold">ছবি বা ভিডিও এখানে ড্রপ করুন</span>
            <span className="text-xs text-emerald-100 mt-1">JPG, PNG, WEBP অথবা MP4, MOV, WEBM ফাইল সমর্থিত</span>
          </div>
        )}
        {/* Hidden Input Elements for Media Capture and Files */}
        <input
          ref={photoInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/jpg"
          multiple
          className="hidden"
          onChange={handlePhotoSelect}
        />
        <input
          ref={videoInputRef}
          type="file"
          accept="video/mp4,video/quicktime,video/webm"
          className="hidden"
          onChange={(e) => handleVideoSelect(e, false)}
        />
        <input
          ref={reelInputRef}
          type="file"
          accept="video/mp4,video/quicktime,video/webm"
          className="hidden"
          onChange={(e) => handleVideoSelect(e, true)}
        />
        <input
          ref={computerInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/jpg,video/mp4,video/quicktime,video/webm"
          multiple
          className="hidden"
          onChange={(e) => {
            const files = e.target.files;
            if (!files || files.length === 0) return;
            const isVid = files[0].type.startsWith('video');
            if (isVid) handleVideoSelect(e, false);
            else handlePhotoSelect(e);
          }}
        />

        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-emerald-600" />
            <h3 className="text-base font-bold text-slate-900">
              {postType === 'reel' ? 'রিল তৈরি ও প্রকাশ করুন (Create Reel)' : 'পোস্ট তৈরি করুন (Create Post)'}
            </h3>
          </div>
          <button
            id="close-create-post-modal"
            onClick={() => setCreatePostModalOpen(false)}
            className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* User preview & Privacy / Mode bar */}
        <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-3">
            <img src={currentUser?.avatar} alt="" className="h-10 w-10 rounded-full object-cover shadow-xs" />
            <div>
              <div className="text-xs font-bold text-slate-900">{currentUser?.name}</div>
              <div className="flex items-center gap-1.5 mt-0.5">
                <select
                  value={visibility}
                  onChange={(e) => setVisibility(e.target.value as any)}
                  className="rounded-md border border-slate-200 bg-slate-50 px-2 py-0.5 text-[11px] font-medium text-slate-700 focus:outline-hidden"
                >
                  <option value="public">🌐 পাবলিক (Public)</option>
                  <option value="friends">👥 শুধুমাত্র বন্ধুরা (Friends)</option>
                  <option value="only_me">🔒 শুধুমাত্র আমি (Only Me)</option>
                </select>

                <button
                  type="button"
                  onClick={() => setPostType(postType === 'reel' ? 'standard' : 'reel')}
                  className={`rounded-md px-2 py-0.5 text-[11px] font-bold border transition-colors ${
                    postType === 'reel'
                      ? 'bg-rose-50 border-rose-300 text-rose-700'
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {postType === 'reel' ? '🎬 রিল পোস্ট মোড' : '📝 সাধারণ পোস্ট'}
                </button>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-1.5 justify-end">
            {postLocationLabel && (
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-medium text-emerald-800 border border-emerald-200/60">
                <MapPin className="h-3 w-3 text-emerald-600 shrink-0" />
                <span className="max-w-[130px] truncate">{postLocationLabel}</span>
                <button
                  type="button"
                  onClick={() => setPostLocation({})}
                  className="text-slate-400 hover:text-rose-600 ml-0.5"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}
            {feeling && (
              <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-medium text-emerald-800 border border-emerald-200/60">
                {feeling}
              </span>
            )}
          </div>
        </div>

        {/* Post Text Area */}
        <textarea
          id="post-content-textarea"
          rows={3}
          placeholder={
            postType === 'reel'
              ? 'আপনার রিল সম্পর্কে কিছু লিখুন... #আপনসমাজ #reels'
              : 'আপনার মনে কী আছে? আপনার এলাকার মানুষকে জানান...'
          }
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="mt-3 w-full resize-none rounded-xl border border-slate-200 bg-slate-50/60 p-3 text-sm text-slate-900 placeholder-slate-400 focus:border-emerald-500 focus:bg-white focus:outline-hidden"
        />

        {/* Selected Media Previews & Edit Buttons */}
        {selectedMedia.length > 0 && (
          <div className="mt-3 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700">
                সংযুক্ত মিডিয়া ({selectedMedia.length}টি ফাইল)
              </span>
              <div className="flex items-center gap-1.5">
                {selectedMedia[0]?.type === 'image' && (
                  <>
                    <button
                      type="button"
                      onClick={() => setImageEditorOpen(true)}
                      className="flex items-center gap-1 rounded-lg bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700 hover:bg-emerald-100 border border-emerald-200"
                    >
                      <Sliders className="h-3.5 w-3.5" />
                      <span>ছবি এডিট করুন (Edit Photo)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setPhotoToReelOpen(true)}
                      className="flex items-center gap-1 rounded-lg bg-rose-50 px-2.5 py-1 text-xs font-bold text-rose-700 hover:bg-rose-100 border border-rose-200"
                    >
                      <Film className="h-3.5 w-3.5" />
                      <span>রিল তৈরি করুন</span>
                    </button>
                  </>
                )}

                {selectedMedia[0]?.type === 'video' && (
                  <button
                    type="button"
                    onClick={() => setVideoEditorOpen(true)}
                    className="flex items-center gap-1 rounded-lg bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700 hover:bg-emerald-100 border border-emerald-200"
                  >
                    <Sliders className="h-3.5 w-3.5" />
                    <span>{postType === 'reel' ? 'রিল এডিট করুন' : 'ভিডিও এডিট করুন'}</span>
                  </button>
                )}
              </div>
            </div>

            {/* Media Items Grid */}
            <div className={`grid gap-2 ${selectedMedia.length === 1 ? 'grid-cols-1' : 'grid-cols-2 sm:grid-cols-3'}`}>
              {selectedMedia.map((m) => (
                <div
                  key={m.id}
                  className="relative group rounded-xl overflow-hidden border border-slate-200 bg-black aspect-video max-h-48 flex items-center justify-center"
                >
                  {m.type === 'image' ? (
                    <img src={m.editedUrl || m.originalUrl} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <div className="relative h-full w-full">
                      <img
                        src={
                          m.thumbnailUrl ||
                          'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=400&auto=format&fit=crop&q=80'
                        }
                        alt="video thumbnail"
                        className="h-full w-full object-cover opacity-80"
                      />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Video className="h-8 w-8 text-white drop-shadow-lg" />
                      </div>
                    </div>
                  )}

                  {/* Top Action Badge */}
                  <div className="absolute top-1.5 left-1.5 rounded-md bg-black/60 px-1.5 py-0.5 text-[10px] font-bold text-white uppercase backdrop-blur-xs">
                    {m.type === 'video' ? (postType === 'reel' ? '🎬 Reel' : '🎥 Video') : '📷 Photo'}
                  </div>

                  <button
                    type="button"
                    onClick={() => handleRemoveMedia(m.id)}
                    className="absolute top-1.5 right-1.5 rounded-full bg-slate-900/80 p-1 text-white hover:bg-rose-600 transition-colors shadow-md"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>

            {/* Attached Music Pill */}
            {selectedMusic && (
              <div className="flex items-center justify-between rounded-xl bg-emerald-50 px-3 py-1.5 border border-emerald-200 text-xs">
                <div className="flex items-center gap-2">
                  <Music className="h-3.5 w-3.5 text-emerald-600" />
                  <span className="font-bold text-emerald-900">{selectedMusic.title}</span>
                  <span className="text-emerald-700 text-[11px]">— {selectedMusic.artist}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedMusic(undefined)}
                  className="text-slate-400 hover:text-rose-600"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            )}
          </div>
        )}

        {/* PRIMARY MEDIA OPTIONS BUTTONS (Requested: 📷 ছবি, 🎥 ভিডিও, 🎬 Reel, 📱 Camera, 💻 Computer থেকে Upload) */}
        <div className="mt-3.5 rounded-2xl border border-slate-200 bg-slate-50/80 p-3">
          <div className="text-xs font-bold text-slate-700 mb-2">মিডিয়া অপশন নির্বাচন করুন (Media Options):</div>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            {/* 1. Photo */}
            <button
              id="media-opt-photo"
              type="button"
              onClick={() => photoInputRef.current?.click()}
              className="flex flex-col items-center justify-center gap-1 rounded-xl bg-white p-2.5 text-slate-700 shadow-2xs border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/50 hover:text-emerald-700 transition-all text-xs font-bold"
            >
              <div className="rounded-full bg-emerald-100 p-2 text-emerald-600">
                <ImageIcon className="h-4 w-4" />
              </div>
              <span>📷 ছবি</span>
            </button>

            {/* 2. Video */}
            <button
              id="media-opt-video"
              type="button"
              onClick={() => videoInputRef.current?.click()}
              className="flex flex-col items-center justify-center gap-1 rounded-xl bg-white p-2.5 text-slate-700 shadow-2xs border border-slate-200 hover:border-blue-500 hover:bg-blue-50/50 hover:text-blue-700 transition-all text-xs font-bold"
            >
              <div className="rounded-full bg-blue-100 p-2 text-blue-600">
                <Video className="h-4 w-4" />
              </div>
              <span>🎥 ভিডিও</span>
            </button>

            {/* 3. Reel */}
            <button
              id="media-opt-reel"
              type="button"
              onClick={() => reelInputRef.current?.click()}
              className="flex flex-col items-center justify-center gap-1 rounded-xl bg-white p-2.5 text-slate-700 shadow-2xs border border-slate-200 hover:border-rose-500 hover:bg-rose-50/50 hover:text-rose-700 transition-all text-xs font-bold"
            >
              <div className="rounded-full bg-rose-100 p-2 text-rose-600">
                <Film className="h-4 w-4" />
              </div>
              <span>🎬 Reel</span>
            </button>

            {/* 4. Live Camera */}
            <button
              id="media-opt-camera"
              type="button"
              onClick={() => {
                setCameraMode(postType === 'reel' ? 'reel' : 'photo');
                setCameraModalOpen(true);
              }}
              className="flex flex-col items-center justify-center gap-1 rounded-xl bg-white p-2.5 text-slate-700 shadow-2xs border border-slate-200 hover:border-purple-500 hover:bg-purple-50/50 hover:text-purple-700 transition-all text-xs font-bold"
            >
              <div className="rounded-full bg-purple-100 p-2 text-purple-600">
                <Camera className="h-4 w-4" />
              </div>
              <span>📱 Camera</span>
            </button>

            {/* 5. Computer Upload */}
            <button
              id="media-opt-computer"
              type="button"
              onClick={() => computerInputRef.current?.click()}
              className="col-span-2 sm:col-span-1 flex flex-col items-center justify-center gap-1 rounded-xl bg-white p-2.5 text-slate-700 shadow-2xs border border-slate-200 hover:border-amber-500 hover:bg-amber-50/50 hover:text-amber-700 transition-all text-xs font-bold"
            >
              <div className="rounded-full bg-amber-100 p-2 text-amber-600">
                <Laptop className="h-4 w-4" />
              </div>
              <span className="text-center">💻 আপলোড</span>
            </button>
          </div>
        </div>

        {/* Location Picker Section */}
        {showLocationPicker && (
          <div className="mt-3 rounded-2xl border border-emerald-200 bg-emerald-50/60 p-3.5 text-xs space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-emerald-950 flex items-center gap-1.5 text-xs">
                <MapPin className="h-4 w-4 text-emerald-600" />
                পোস্টে প্রশাসনিক এলাকা ট্যাগ করুন (Bangladesh Location)
              </span>
              <button
                type="button"
                onClick={() => setShowLocationPicker(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <BangladeshLocationPicker
              value={postLocation}
              onChange={setPostLocation}
              showAllOption={true}
              labels={true}
              includeUnions={true}
              includeWards={true}
              theme="light"
            />
          </div>
        )}

        {/* Feeling picker */}
        {showFeelings && (
          <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50 p-2.5">
            <span className="text-xs font-bold text-slate-700 block mb-1.5">অনুভূতি বা কার্যকলাপ:</span>
            <div className="flex flex-wrap gap-1.5">
              {feelingsList.map((f, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => {
                    setFeeling(f);
                    setShowFeelings(false);
                  }}
                  className="rounded-lg bg-white px-2.5 py-1 text-xs text-slate-700 border border-slate-200 hover:border-emerald-400 hover:bg-emerald-50"
                >
                  {f}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Poll creator */}
        {showPoll && (
          <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50 p-3 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700">ভোট / পোল তৈরি করুন</span>
              <button onClick={() => setShowPoll(false)} className="text-slate-400 hover:text-slate-600">
                <X className="h-4 w-4" />
              </button>
            </div>
            <input
              type="text"
              placeholder="আপনার প্রশ্ন লিখুন..."
              value={pollQuestion}
              onChange={(e) => setPollQuestion(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-800"
            />
            <div className="space-y-1.5">
              {pollOptions.map((opt, idx) => (
                <div key={idx} className="flex items-center gap-1.5">
                  <input
                    type="text"
                    placeholder={`অপশন ${idx + 1}`}
                    value={opt}
                    onChange={(e) => {
                      const updated = [...pollOptions];
                      updated[idx] = e.target.value;
                      setPollOptions(updated);
                    }}
                    className="flex-1 rounded-lg border border-slate-200 bg-white px-3 py-1 text-xs text-slate-800"
                  />
                  {pollOptions.length > 2 && (
                    <button
                      type="button"
                      onClick={() => setPollOptions(pollOptions.filter((_, i) => i !== idx))}
                      className="text-slate-400 hover:text-rose-600"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
            {pollOptions.length < 5 && (
              <button
                type="button"
                onClick={() => setPollOptions([...pollOptions, ''])}
                className="flex items-center gap-1 text-xs font-semibold text-emerald-700 hover:underline"
              >
                <Plus className="h-3.5 w-3.5" /> অপশন যোগ করুন
              </button>
            )}
          </div>
        )}

        {/* Post Settings Row (Comments toggle, Download toggle, Location, Feeling, Poll) */}
        <div className="mt-3 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-3 text-xs">
          <div className="flex items-center gap-4 text-slate-700">
            {/* Comments Toggle */}
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="checkbox"
                checked={commentsEnabled}
                onChange={(e) => setCommentsEnabled(e.target.checked)}
                className="h-3.5 w-3.5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
              />
              <span className="flex items-center gap-1 text-[11px] font-medium">
                <MessageSquare className="h-3 w-3 text-slate-500" /> মন্তব্য চালু
              </span>
            </label>

            {/* Download Toggle */}
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="checkbox"
                checked={downloadEnabled}
                onChange={(e) => setDownloadEnabled(e.target.checked)}
                className="h-3.5 w-3.5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
              />
              <span className="flex items-center gap-1 text-[11px] font-medium">
                <Download className="h-3 w-3 text-slate-500" /> ডাউনলোড অনুমতি
              </span>
            </label>
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setShowLocationPicker(!showLocationPicker)}
              className="rounded-lg p-1.5 text-rose-600 hover:bg-rose-50"
              title="লোকেশন ট্যাগ করুন"
            >
              <MapPin className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => setShowFeelings(!showFeelings)}
              className="rounded-lg p-1.5 text-amber-500 hover:bg-amber-50"
              title="অনুভূতি"
            >
              <Smile className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => setShowPoll(!showPoll)}
              className="rounded-lg p-1.5 text-purple-600 hover:bg-purple-50"
              title="পোল ভোট"
            >
              <BarChart2 className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Upload Progress & Stage Indicator (0% → 25% → 50% → 75% → 100%) */}
        {isPublishing && (
          <div className="mt-3 rounded-2xl bg-emerald-50/80 p-3 border border-emerald-200">
            <div className="flex items-center justify-between text-xs font-bold text-emerald-950 mb-1.5">
              <span className="flex items-center gap-1.5">
                <RefreshCw className="h-3.5 w-3.5 animate-spin text-emerald-600" />
                {processingStage === 'uploading'
                  ? 'মিডিয়া আপলোড হচ্ছে (Uploading)...'
                  : processingStage === 'processing'
                  ? 'প্রক্রিয়াকরণ ও অপটিমাইজ হচ্ছে (Processing)...'
                  : processingStage === 'generating_thumbnail'
                  ? 'থাম্বনেইল ফ্রেম তৈরি হচ্ছে (Generating thumbnail)...'
                  : 'পোস্ট প্রস্তুত হচ্ছে (Ready to publish)...'}
              </span>
              <span className="font-mono text-emerald-700">{uploadProgress}%</span>
            </div>
            <div className="h-2 w-full rounded-full bg-emerald-200/60 overflow-hidden">
              <div
                className="h-full bg-emerald-600 transition-all duration-300 rounded-full"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>
        )}

        {/* Error message with retry */}
        {errorMessage && (
          <div className="mt-3 flex flex-col gap-2 rounded-xl bg-rose-50 p-3 text-xs text-rose-800 border border-rose-200">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-rose-600 shrink-0" />
                <span className="font-semibold">{errorMessage}</span>
              </div>
              <button
                type="button"
                onClick={handlePublish}
                className="rounded-lg bg-rose-600 px-3 py-1 font-bold text-white hover:bg-rose-700 text-xs shrink-0"
              >
                আবার চেষ্টা করুন
              </button>
            </div>
            {errorMessage.includes('Bucket not found') && (
              <p className="text-[11px] text-rose-700 bg-rose-100/60 p-2 rounded-lg border border-rose-200">
                💡 <strong>করণীয়:</strong> সুপাবেজ ক্লাউড স্টোরেজে বাকেটটি এখনো তৈরি করা হয়নি। দয়া করে Supabase Dashboard-এর Storage সেকশনে গিয়ে বাকেটটি Public হিসেবে তৈরি করুন।
              </p>
            )}
            {errorMessage.includes('Supabase login session পাওয়া যায়নি') && (
              <div className="flex items-center justify-between text-[11px] text-rose-700 bg-rose-100/60 p-2 rounded-lg border border-rose-200">
                <span>পোস্ট প্রকাশ ও মিডিয়া আপলোড করতে আপনার অ্যাকাউন্ট লগইন থাকা আবশ্যক।</span>
                <button
                  type="button"
                  onClick={() => setAuthModalOpen(true)}
                  className="font-bold underline text-emerald-700 hover:text-emerald-800 ml-2 shrink-0 cursor-pointer"
                >
                  লগইন করুন →
                </button>
              </div>
            )}
          </div>
        )}

        {/* Submit Button */}
        <button
          id="submit-create-post-btn"
          onClick={handlePublish}
          disabled={isPublishing || (!content.trim() && selectedMedia.length === 0 && !pollQuestion.trim())}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 py-3 text-sm font-bold text-white shadow-md hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed active:scale-98 transition-all"
        >
          {isPublishing ? (
            <>
              <RefreshCw className="h-4 w-4 animate-spin" />
              <span>আপলোড ও প্রকাশ হচ্ছে...</span>
            </>
          ) : (
            <span>পোস্ট প্রকাশ করুন (Publish Post)</span>
          )}
        </button>

        {/* Photo Editor Modal */}
        <ImageEditorModal
          isOpen={imageEditorOpen}
          images={selectedMedia
            .filter((m) => m.type === 'image')
            .map((m) => ({ id: m.id, originalUrl: m.originalUrl, editedUrl: m.editedUrl, file: m.file }))}
          currentIndex={0}
          onClose={() => setImageEditorOpen(false)}
          onSave={(updatedList) => {
            setSelectedMedia((prev) =>
              prev.map((item) => {
                const match = updatedList.find((u) => u.id === item.id);
                return match ? { ...item, editedUrl: match.editedUrl } : item;
              })
            );
          }}
        />

        {/* Video / Reel Editor Modal */}
        {selectedMedia.length > 0 && selectedMedia[0].type === 'video' && (
          <VideoReelEditorModal
            isOpen={videoEditorOpen}
            videoSource={{
              url: selectedMedia[0].editedUrl || selectedMedia[0].originalUrl,
              file: selectedMedia[0].file,
              name: selectedMedia[0].file?.name,
            }}
            isReelMode={postType === 'reel'}
            initialDurationLimit={reelDurationLimit}
            onClose={() => setVideoEditorOpen(false)}
            onSave={handleVideoEditorSave}
          />
        )}

        {/* Live Camera Record Modal */}
        <CameraRecordModal
          isOpen={cameraModalOpen}
          mode={cameraMode}
          durationLimit={reelDurationLimit}
          onClose={() => setCameraModalOpen(false)}
          onCapturePhoto={(file, dataUrl) => {
            const newItem: SelectedMediaItem = {
              id: `camera-photo-${Date.now()}`,
              type: 'image',
              file,
              originalUrl: dataUrl,
            };
            setSelectedMedia((prev) => [...prev, newItem]);
          }}
          onRecordVideo={(file, url, dur) => {
            const newItem: SelectedMediaItem = {
              id: `camera-video-${Date.now()}`,
              type: 'video',
              file,
              originalUrl: url,
              duration: dur,
            };
            if (cameraMode === 'reel') setPostType('reel');
            setSelectedMedia([newItem]);
          }}
        />

        {/* Photo-to-Reel Maker Modal */}
        <ImageToReelModal
          isOpen={photoToReelOpen}
          initialImages={selectedMedia
            .filter((m) => m.type === 'image')
            .map((m) => m.editedUrl || m.originalUrl)}
          onClose={() => setPhotoToReelOpen(false)}
          onComplete={(reelData) => {
            setPostType('reel');
            if (reelData.musicTrack) setSelectedMusic(reelData.musicTrack);
          }}
        />
      </div>
    </div>
  );
};

export const CreatePostModal: React.FC = () => {
  const { createPostModalOpen } = useApp();
  if (!createPostModalOpen) return null;
  return <CreatePostModalDialog />;
};
