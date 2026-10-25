import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  Play,
  Pause,
  Scissors,
  Volume2,
  VolumeX,
  Music,
  Sparkles,
  Type,
  Smile,
  Check,
  RotateCcw,
  Clock,
  Gauge,
  Sliders,
  Image as ImageIcon,
  ChevronRight,
  Upload,
} from 'lucide-react';
import { MusicTrack, VideoEditState, OverlayItem } from '../../types';
import { APPROVED_MUSIC_TRACKS } from '../../data/musicLibrary';
import { generateVideoThumbnail } from '../../services/mediaStorageService';

interface VideoReelEditorModalProps {
  isOpen: boolean;
  videoSource: { url: string; file?: File; name?: string };
  isReelMode?: boolean;
  initialDurationLimit?: 15 | 30 | 60 | 90 | 180;
  onClose: () => void;
  onSave: (editedState: VideoEditState, coverUrl: string, finalDuration: number) => void;
}

const DURATION_LIMITS: Array<15 | 30 | 60 | 90 | 180> = [15, 30, 60, 90, 180];
const STICKERS = ['🔥', '❤️', '🇧🇩', '✨', '🎉', '🌟', '👏', '⚡', '💯', '😂'];

export const VideoReelEditorModal: React.FC<VideoReelEditorModalProps> = ({
  isOpen,
  videoSource,
  isReelMode = false,
  initialDurationLimit = 30,
  onClose,
  onSave,
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [videoDuration, setVideoDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);

  // Editor states
  const [durationLimit, setDurationLimit] = useState<15 | 30 | 60 | 90 | 180>(initialDurationLimit);
  const [trimStart, setTrimStart] = useState(0);
  const [trimEnd, setTrimEnd] = useState(30);

  const [speed, setSpeed] = useState(1);
  const [originalVolume, setOriginalVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);

  // Music state
  const [selectedMusic, setSelectedMusic] = useState<MusicTrack | undefined>(undefined);
  const [musicVolume, setMusicVolume] = useState(0.8);
  const [musicStart, setMusicStart] = useState(0);
  const [showMusicPicker, setShowMusicPicker] = useState(false);
  const [musicSearchQuery, setMusicSearchQuery] = useState('');

  // Visual adjustments
  const [filter, setFilter] = useState<'none' | 'monochrome' | 'warm' | 'vintage' | 'sepia' | 'vivid' | 'cool'>('none');
  const [brightness, setBrightness] = useState(0);
  const [contrast, setContrast] = useState(0);

  // Overlays
  const [overlays, setOverlays] = useState<OverlayItem[]>([]);
  const [textInput, setTextInput] = useState('');
  const [textColor, setTextColor] = useState('#ffffff');

  // Cover thumbnail
  const [coverTime, setCoverTime] = useState(0.5);
  const [coverPreviewUrl, setCoverPreviewUrl] = useState<string | null>(null);

  // Active toolbar tab
  const [activeTab, setActiveTab] = useState<'trim' | 'audio' | 'speed' | 'filters' | 'text' | 'cover'>('trim');
  const [isProcessing, setIsProcessing] = useState(false);

  // Setup video metadata and initialize trim
  const handleLoadedMetadata = () => {
    if (!videoRef.current) return;
    const dur = videoRef.current.duration || 0;
    setVideoDuration(dur);

    const maxAllowed = isReelMode ? Math.min(dur, durationLimit) : dur;
    setTrimStart(0);
    setTrimEnd(maxAllowed);

    // Generate initial cover thumbnail
    generateVideoThumbnail(videoSource.file || videoSource.url, 0.5)
      .then((res) => setCoverPreviewUrl(res.thumbnailUrl))
      .catch(() => {});
  };

  // Enforce selected Reel duration limit
  useEffect(() => {
    if (isReelMode && videoDuration > 0) {
      const allowed = Math.min(videoDuration, durationLimit);
      if (trimEnd - trimStart > allowed || trimEnd > allowed) {
        setTrimStart(0);
        setTrimEnd(allowed);
      }
    }
  }, [durationLimit, isReelMode, videoDuration]);

  // Sync playback loop within trim boundaries
  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    const cur = videoRef.current.currentTime;
    setCurrentTime(cur);

    if (cur >= trimEnd) {
      videoRef.current.currentTime = trimStart;
      if (audioRef.current) {
        audioRef.current.currentTime = musicStart;
      }
    }
  };

  const togglePlayPause = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      if (audioRef.current) audioRef.current.pause();
      setIsPlaying(false);
    } else {
      if (videoRef.current.currentTime < trimStart || videoRef.current.currentTime >= trimEnd) {
        videoRef.current.currentTime = trimStart;
      }
      videoRef.current.playbackRate = speed;
      videoRef.current.play();
      if (audioRef.current) {
        audioRef.current.currentTime = musicStart;
        audioRef.current.play();
      }
      setIsPlaying(true);
    }
  };

  // Capture current frame as cover thumbnail
  const handleCaptureCover = async () => {
    const time = videoRef.current?.currentTime || coverTime;
    setCoverTime(time);
    try {
      const res = await generateVideoThumbnail(videoSource.file || videoSource.url, time);
      setCoverPreviewUrl(res.thumbnailUrl);
    } catch (e) {
      console.error('Thumbnail capture error:', e);
    }
  };

  const formatSeconds = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const effectiveDuration = Math.max(0.1, (trimEnd - trimStart) / speed);

  const handleSave = async () => {
    setIsProcessing(true);
    try {
      // Ensure cover thumbnail is ready
      let finalCover = coverPreviewUrl;
      if (!finalCover) {
        const thumb = await generateVideoThumbnail(videoSource.file || videoSource.url, coverTime);
        finalCover = thumb.thumbnailUrl;
      }

      const editedState: VideoEditState = {
        clips: [
          {
            id: `clip-${Date.now()}`,
            file: videoSource.file,
            url: videoSource.url,
            name: videoSource.name || 'video.mp4',
            size: videoSource.file?.size || 0,
            duration: videoDuration,
            trimStart,
            trimEnd,
            speed,
            volume: isMuted ? 0 : originalVolume,
            isMuted,
          },
        ],
        selectedDurationLimit: durationLimit,
        trimStart,
        trimEnd,
        speed,
        volume: isMuted ? 0 : originalVolume,
        isMuted,
        musicTrack: selectedMusic,
        musicVolume,
        musicStart,
        filter,
        brightness,
        contrast,
        coverTime,
        coverDataUrl: finalCover || undefined,
        overlays,
      };

      onSave(editedState, finalCover || '', effectiveDuration);
      onClose();
    } catch (err) {
      console.error('Failed to save edited video:', err);
      alert('ভিডিও প্রসেস করতে সমস্যা হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।');
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-2 sm:p-4 backdrop-blur-md animate-in fade-in">
      <div className="relative flex h-full max-h-[94vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl bg-slate-900 text-white shadow-2xl border border-slate-800">
        {/* Top Header */}
        <div className="flex items-center justify-between border-b border-slate-800 px-4 py-3 bg-slate-900/90">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-emerald-400" />
            <h2 className="text-base font-bold">
              {isReelMode ? 'রিল এডিটর (Reel Studio)' : 'ভিডিও এডিটর (Video Editor)'}
            </h2>
            <div className="flex items-center gap-1 rounded-full bg-slate-800 px-2.5 py-0.5 text-xs font-mono text-emerald-400 border border-emerald-500/30">
              <Clock className="h-3 w-3" />
              <span>{formatSeconds(currentTime - trimStart > 0 ? currentTime - trimStart : 0)}</span>
              <span>/</span>
              <span>{formatSeconds(effectiveDuration)}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleSave}
              disabled={isProcessing}
              className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-1.5 text-xs font-bold text-white shadow-md hover:bg-emerald-500 disabled:opacity-50 transition-colors"
            >
              <Check className="h-4 w-4" />
              <span>{isProcessing ? 'প্রসেসিং...' : 'সম্পন্ন করুন'}</span>
            </button>
            <button onClick={onClose} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white">
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Video Canvas / Player Area */}
        <div className="relative flex flex-1 items-center justify-center overflow-hidden bg-black p-2 sm:p-4">
          <div className="relative max-h-full max-w-full overflow-hidden rounded-xl shadow-2xl">
            <video
              ref={videoRef}
              src={videoSource.url}
              onLoadedMetadata={handleLoadedMetadata}
              onTimeUpdate={handleTimeUpdate}
              playsInline
              onClick={togglePlayPause}
              className="max-h-[50vh] max-w-full object-contain cursor-pointer"
              style={{
                filter: `brightness(${100 + brightness}%) contrast(${100 + contrast}%) ${
                  filter === 'monochrome'
                    ? 'grayscale(100%)'
                    : filter === 'sepia'
                    ? 'sepia(80%)'
                    : filter === 'warm'
                    ? 'sepia(30%) saturate(140%)'
                    : filter === 'vintage'
                    ? 'sepia(45%) contrast(120%)'
                    : filter === 'vivid'
                    ? 'saturate(180%)'
                    : filter === 'cool'
                    ? 'hue-rotate(180deg)'
                    : ''
                }`,
              }}
            />

            {/* Overlays on video */}
            {overlays.map((item) => (
              <div
                key={item.id}
                className="absolute transform -translate-x-1/2 -translate-y-1/2 select-none group cursor-pointer"
                style={{
                  left: `${item.x}%`,
                  top: `${item.y}%`,
                  color: item.color || '#ffffff',
                }}
              >
                {item.type === 'text' ? (
                  <span
                    className="font-bold drop-shadow-md px-2 py-0.5 rounded bg-black/40 backdrop-blur-xs"
                    style={{ fontSize: `${item.fontSize || 24}px` }}
                  >
                    {item.content}
                  </span>
                ) : (
                  <span style={{ fontSize: `${item.fontSize || 36}px` }}>{item.content}</span>
                )}
                <button
                  onClick={() => setOverlays((prev) => prev.filter((o) => o.id !== item.id))}
                  className="hidden group-hover:inline-flex ml-1 rounded-full bg-rose-600 p-0.5 text-white"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}

            {/* Play/Pause Overlay button */}
            {!isPlaying && (
              <button
                onClick={togglePlayPause}
                className="absolute inset-0 m-auto flex h-14 w-14 items-center justify-center rounded-full bg-black/60 text-white shadow-xl hover:scale-110 transition-transform"
              >
                <Play className="h-7 w-7 fill-white ml-1" />
              </button>
            )}

            {/* Reel Duration Badge */}
            {isReelMode && (
              <div className="absolute top-3 left-3 rounded-full bg-black/70 px-2.5 py-1 text-[11px] font-bold text-emerald-400 backdrop-blur-md border border-emerald-500/30">
                🎬 রিল লিমিট: {durationLimit} সেকেন্ড
              </div>
            )}
          </div>

          {/* Background Audio element for music preview */}
          {selectedMusic && (
            <audio
              ref={audioRef}
              src={selectedMusic.audioUrl}
              loop
              onPlay={() => {
                if (audioRef.current) audioRef.current.volume = musicVolume;
              }}
            />
          )}
        </div>

        {/* Timeline & Scrubber Bar */}
        <div className="border-t border-slate-800 bg-slate-950/80 px-4 py-2.5">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5">
            <div className="flex items-center gap-1.5 font-mono">
              <span className="text-emerald-400 font-bold">{formatSeconds(currentTime)}</span>
              <span>/</span>
              <span>{formatSeconds(videoDuration)}</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={togglePlayPause}
                className="flex items-center gap-1 rounded bg-slate-800 px-2 py-0.5 text-slate-200 hover:bg-slate-700"
              >
                {isPlaying ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
                <span>{isPlaying ? 'পজ' : 'প্লে'}</span>
              </button>
            </div>
          </div>

          {/* Dual range or trim slider */}
          <div className="relative h-7 w-full rounded-md bg-slate-800/80 p-1 flex items-center">
            {/* Trim range indicator */}
            <div
              className="absolute top-0 bottom-0 bg-emerald-600/30 border-x-2 border-emerald-500 rounded"
              style={{
                left: `${(trimStart / (videoDuration || 1)) * 100}%`,
                width: `${((trimEnd - trimStart) / (videoDuration || 1)) * 100}%`,
              }}
            />
            {/* Playhead indicator */}
            <div
              className="absolute top-0 bottom-0 w-0.5 bg-white shadow-md z-10"
              style={{
                left: `${(currentTime / (videoDuration || 1)) * 100}%`,
              }}
            />
            <input
              type="range"
              min="0"
              max={videoDuration || 30}
              step="0.1"
              value={currentTime}
              onChange={(e) => {
                const val = Number(e.target.value);
                if (videoRef.current) {
                  videoRef.current.currentTime = val;
                }
                setCurrentTime(val);
              }}
              className="absolute inset-0 w-full opacity-0 cursor-pointer z-20"
            />
          </div>
        </div>

        {/* Toolbar Tabs & Controls */}
        <div className="border-t border-slate-800 bg-slate-900/95 px-4 py-3">
          {/* Main Tab Switcher */}
          <div className="flex items-center justify-center gap-2 border-b border-slate-800/80 pb-3 text-xs overflow-x-auto">
            <button
              onClick={() => setActiveTab('trim')}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 font-medium shrink-0 transition-colors ${
                activeTab === 'trim' ? 'bg-emerald-600 text-white' : 'text-slate-300 hover:bg-slate-800'
              }`}
            >
              <Scissors className="h-4 w-4" />
              <span>ট্রিম ও সময়কাল</span>
            </button>
            <button
              onClick={() => setActiveTab('audio')}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 font-medium shrink-0 transition-colors ${
                activeTab === 'audio' ? 'bg-emerald-600 text-white' : 'text-slate-300 hover:bg-slate-800'
              }`}
            >
              <Music className="h-4 w-4" />
              <span>অডিও ও মিউজিক</span>
            </button>
            <button
              onClick={() => setActiveTab('speed')}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 font-medium shrink-0 transition-colors ${
                activeTab === 'speed' ? 'bg-emerald-600 text-white' : 'text-slate-300 hover:bg-slate-800'
              }`}
            >
              <Gauge className="h-4 w-4" />
              <span>গতি (Speed)</span>
            </button>
            <button
              onClick={() => setActiveTab('filters')}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 font-medium shrink-0 transition-colors ${
                activeTab === 'filters' ? 'bg-emerald-600 text-white' : 'text-slate-300 hover:bg-slate-800'
              }`}
            >
              <Sparkles className="h-4 w-4" />
              <span>ফিল্টার</span>
            </button>
            <button
              onClick={() => setActiveTab('text')}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 font-medium shrink-0 transition-colors ${
                activeTab === 'text' ? 'bg-emerald-600 text-white' : 'text-slate-300 hover:bg-slate-800'
              }`}
            >
              <Type className="h-4 w-4" />
              <span>টেক্সট ও স্টিকার</span>
            </button>
            <button
              onClick={() => setActiveTab('cover')}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 font-medium shrink-0 transition-colors ${
                activeTab === 'cover' ? 'bg-emerald-600 text-white' : 'text-slate-300 hover:bg-slate-800'
              }`}
            >
              <ImageIcon className="h-4 w-4" />
              <span>কভার থাম্বনেইল</span>
            </button>
          </div>

          {/* Sub-Panel per tab */}
          <div className="pt-3 min-h-[90px] flex items-center justify-center">
            {activeTab === 'trim' && (
              <div className="flex flex-col gap-3 w-full text-xs">
                {isReelMode && (
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <span className="text-slate-300 font-semibold">রিল নির্ধারিত সময়সীমা (Enforced Duration):</span>
                    <div className="flex items-center gap-1.5">
                      {DURATION_LIMITS.map((limit) => (
                        <button
                          key={limit}
                          onClick={() => setDurationLimit(limit)}
                          className={`rounded-lg px-2.5 py-1 font-bold ${
                            durationLimit === limit
                              ? 'bg-emerald-600 text-white shadow-xs'
                              : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                          }`}
                        >
                          {limit === 180 ? '3 মিনিট' : `${limit}s`}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="flex justify-between text-slate-400 mb-1">
                      <span>শুরুর সময় (Start Time):</span>
                      <span className="font-mono text-emerald-400">{formatSeconds(trimStart)}</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max={Math.max(0, trimEnd - 1)}
                      step="0.5"
                      value={trimStart}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        setTrimStart(val);
                        if (videoRef.current) videoRef.current.currentTime = val;
                      }}
                      className="w-full accent-emerald-500"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-slate-400 mb-1">
                      <span>শেষ সময় (End Time):</span>
                      <span className="font-mono text-emerald-400">{formatSeconds(trimEnd)}</span>
                    </div>
                    <input
                      type="range"
                      min={trimStart + 1}
                      max={
                        isReelMode
                          ? Math.min(videoDuration, trimStart + durationLimit)
                          : videoDuration || 30
                      }
                      step="0.5"
                      value={trimEnd}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        setTrimEnd(val);
                        if (videoRef.current) videoRef.current.currentTime = val;
                      }}
                      className="w-full accent-emerald-500"
                    />
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'audio' && (
              <div className="flex flex-col gap-3 w-full text-xs">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-2">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setShowMusicPicker(true)}
                      className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 font-bold text-white hover:bg-emerald-500"
                    >
                      <Music className="h-3.5 w-3.5" />
                      <span>{selectedMusic ? 'মিউজিক পরিবর্তন করুন' : '🎵 মিউজিক যোগ করুন'}</span>
                    </button>
                    {selectedMusic && (
                      <div className="flex items-center gap-2 rounded-lg bg-slate-800 px-2.5 py-1 text-slate-200">
                        <span className="font-semibold text-emerald-400">{selectedMusic.title}</span>
                        <button
                          onClick={() => setSelectedMusic(undefined)}
                          className="text-slate-400 hover:text-rose-400"
                          title="মিউজিক বাতিল করুন"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Original Video Audio */}
                  <div>
                    <div className="flex justify-between text-slate-400 mb-1">
                      <span>মূল ভিডিওর সাউন্ড (Original Audio):</span>
                      <span>{isMuted ? 'মিউট' : `${Math.round(originalVolume * 100)}%`}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          const newMute = !isMuted;
                          setIsMuted(newMute);
                          if (videoRef.current) videoRef.current.muted = newMute;
                        }}
                        className={`rounded-lg p-1.5 ${
                          isMuted ? 'bg-rose-900/60 text-rose-300' : 'bg-slate-800 text-slate-300'
                        }`}
                      >
                        {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                      </button>
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.05"
                        disabled={isMuted}
                        value={originalVolume}
                        onChange={(e) => {
                          const val = Number(e.target.value);
                          setOriginalVolume(val);
                          if (videoRef.current) videoRef.current.volume = val;
                        }}
                        className="w-full accent-emerald-500"
                      />
                    </div>
                  </div>

                  {/* Added Background Music */}
                  <div>
                    <div className="flex justify-between text-slate-400 mb-1">
                      <span>যুক্ত করা মিউজিকের ভলিউম (Music):</span>
                      <span>{selectedMusic ? `${Math.round(musicVolume * 100)}%` : 'নেই'}</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.05"
                      disabled={!selectedMusic}
                      value={musicVolume}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        setMusicVolume(val);
                        if (audioRef.current) audioRef.current.volume = val;
                      }}
                      className="w-full accent-emerald-500"
                    />
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'speed' && (
              <div className="flex items-center justify-center gap-2 text-xs">
                <span className="text-slate-400 mr-2">প্লেব্যাক স্পিড:</span>
                {[0.5, 0.75, 1, 1.25, 1.5, 2].map((s) => (
                  <button
                    key={s}
                    onClick={() => {
                      setSpeed(s);
                      if (videoRef.current) videoRef.current.playbackRate = s;
                    }}
                    className={`rounded-lg px-3 py-1.5 font-bold transition-all ${
                      speed === s
                        ? 'bg-emerald-600 text-white ring-2 ring-emerald-400/40'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    {s}x
                  </button>
                ))}
              </div>
            )}

            {activeTab === 'filters' && (
              <div className="flex flex-col gap-3 w-full text-xs">
                <div className="flex items-center gap-2 overflow-x-auto py-1">
                  {[
                    { id: 'none', name: 'স্বাভাবিক' },
                    { id: 'warm', name: 'উষ্ণ' },
                    { id: 'vintage', name: 'ভিন্টেজ' },
                    { id: 'monochrome', name: 'সাদাকালো' },
                    { id: 'vivid', name: 'উজ্জ্বল' },
                    { id: 'cool', name: 'শান্ত' },
                    { id: 'sepia', name: 'সেপিয়া' },
                  ].map((f) => (
                    <button
                      key={f.id}
                      onClick={() => setFilter(f.id as any)}
                      className={`rounded-xl px-3 py-2 font-semibold shrink-0 transition-all ${
                        filter === f.id
                          ? 'bg-emerald-600 text-white ring-2 ring-emerald-400/40'
                          : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                      }`}
                    >
                      {f.name}
                    </button>
                  ))}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="flex justify-between text-slate-400 mb-1">
                      <span>উজ্জ্বলতা (Brightness)</span>
                      <span>{brightness}</span>
                    </div>
                    <input
                      type="range"
                      min="-50"
                      max="50"
                      value={brightness}
                      onChange={(e) => setBrightness(Number(e.target.value))}
                      className="w-full accent-emerald-500"
                    />
                  </div>
                  <div>
                    <div className="flex justify-between text-slate-400 mb-1">
                      <span>কনট্রাস্ট (Contrast)</span>
                      <span>{contrast}</span>
                    </div>
                    <input
                      type="range"
                      min="-50"
                      max="50"
                      value={contrast}
                      onChange={(e) => setContrast(Number(e.target.value))}
                      className="w-full accent-emerald-500"
                    />
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'text' && (
              <div className="flex flex-col gap-3 w-full text-xs">
                <div className="flex items-center gap-2 max-w-md mx-auto w-full">
                  <input
                    type="text"
                    placeholder="ভিডিওতে টেক্সট যোগ করুন..."
                    value={textInput}
                    onChange={(e) => setTextInput(e.target.value)}
                    className="flex-1 rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-white placeholder-slate-400 focus:border-emerald-500 focus:outline-hidden"
                  />
                  <input
                    type="color"
                    value={textColor}
                    onChange={(e) => setTextColor(e.target.value)}
                    className="h-8 w-8 cursor-pointer rounded-lg border-0 bg-transparent p-0"
                  />
                  <button
                    onClick={() => {
                      if (!textInput.trim()) return;
                      setOverlays((prev) => [
                        ...prev,
                        {
                          id: `text-${Date.now()}`,
                          type: 'text',
                          content: textInput.trim(),
                          x: 50,
                          y: 50,
                          scale: 1,
                          color: textColor,
                          fontSize: 28,
                        },
                      ]);
                      setTextInput('');
                    }}
                    className="rounded-lg bg-emerald-600 px-3 py-2 font-bold text-white hover:bg-emerald-500"
                  >
                    যোগ করুন
                  </button>
                </div>

                <div className="flex items-center justify-center gap-2 overflow-x-auto">
                  {STICKERS.map((stk) => (
                    <button
                      key={stk}
                      onClick={() =>
                        setOverlays((prev) => [
                          ...prev,
                          {
                            id: `stk-${Date.now()}`,
                            type: 'emoji',
                            content: stk,
                            x: 50,
                            y: 50,
                            scale: 1.5,
                            fontSize: 38,
                          },
                        ])
                      }
                      className="h-9 w-9 rounded-lg bg-slate-800 text-lg hover:scale-125 transition-transform"
                    >
                      {stk}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'cover' && (
              <div className="flex items-center justify-between gap-4 w-full text-xs">
                <div className="flex items-center gap-3">
                  {coverPreviewUrl && (
                    <img
                      src={coverPreviewUrl}
                      alt="Cover"
                      className="h-14 w-14 rounded-lg object-cover border border-emerald-500 shadow-md"
                    />
                  )}
                  <div>
                    <div className="font-bold text-slate-200">কভার থাম্বনেইল ফ্রেম</div>
                    <div className="text-slate-400 text-[11px]">
                      ভিডিও স্ক্রাব করে নিখুঁত ফ্রেম নির্বাচন করুন
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleCaptureCover}
                  className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3.5 py-2 font-bold text-white hover:bg-emerald-500"
                >
                  <ImageIcon className="h-4 w-4" />
                  <span>বর্তমান ফ্রেম ক্যাপচার করুন</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Music Picker Modal Drawer */}
        {showMusicPicker && (
          <div className="absolute inset-0 z-50 flex flex-col bg-slate-900 p-4 text-white animate-in slide-in-from-bottom-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Music className="h-5 w-5 text-emerald-400" />
                <h3 className="font-bold">অনুমোদিত মিউজিক লাইব্রেরি (Royalty-Free Audio)</h3>
              </div>
              <button
                onClick={() => setShowMusicPicker(false)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="py-2.5">
              <input
                type="text"
                placeholder="বাংলা লোকগীতি, একুয়েস্টিক, দোতারা, বাঁশির সুর খুঁজুন..."
                value={musicSearchQuery}
                onChange={(e) => setMusicSearchQuery(e.target.value)}
                className="w-full rounded-xl border border-slate-700 bg-slate-800 px-3.5 py-2 text-xs text-white placeholder-slate-400 focus:border-emerald-500 focus:outline-hidden"
              />
            </div>

            {/* Music Tracks List */}
            <div className="flex-1 overflow-y-auto space-y-2 py-2">
              {APPROVED_MUSIC_TRACKS.filter(
                (t) =>
                  !musicSearchQuery ||
                  t.title.toLowerCase().includes(musicSearchQuery.toLowerCase()) ||
                  t.artist.toLowerCase().includes(musicSearchQuery.toLowerCase())
              ).map((track) => (
                <div
                  key={track.id}
                  className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-800/60 p-3 hover:bg-slate-800 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={track.coverUrl}
                      alt=""
                      className="h-11 w-11 rounded-lg object-cover"
                    />
                    <div>
                      <div className="font-bold text-sm text-slate-100">{track.title}</div>
                      <div className="text-xs text-slate-400">{track.artist}</div>
                      <div className="text-[10px] text-emerald-400 font-medium">{track.licenseType}</div>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setSelectedMusic(track);
                      setShowMusicPicker(false);
                    }}
                    className="rounded-lg bg-emerald-600 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-emerald-500"
                  >
                    ব্যবহার করুন
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
