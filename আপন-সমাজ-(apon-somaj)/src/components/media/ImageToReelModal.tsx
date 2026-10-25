import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  Play,
  Pause,
  Music,
  Sparkles,
  Clock,
  ChevronLeft,
  ChevronRight,
  Plus,
  Trash2,
  Check,
  Film,
} from 'lucide-react';
import { MusicTrack } from '../../types';
import { APPROVED_MUSIC_TRACKS } from '../../data/musicLibrary';

interface ImageToReelModalProps {
  isOpen: boolean;
  initialImages: string[];
  onClose: () => void;
  onComplete: (reelData: {
    coverUrl: string;
    mediaUrls: string[];
    musicTrack?: MusicTrack;
    duration: number;
    transition: string;
  }) => void;
}

export const ImageToReelModal: React.FC<ImageToReelModalProps> = ({
  isOpen,
  initialImages,
  onClose,
  onComplete,
}) => {
  const [images, setImages] = useState<string[]>(initialImages);
  const [photoDuration, setPhotoDuration] = useState<number>(3); // 2s, 3s, 4s, 5s
  const [transition, setTransition] = useState<'fade' | 'slide' | 'zoom'>('fade');
  const [selectedMusic, setSelectedMusic] = useState<MusicTrack | undefined>(APPROVED_MUSIC_TRACKS[0]);
  const [musicVolume, setMusicVolume] = useState<number>(0.8);
  const [activePhotoIdx, setActivePhotoIdx] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [progress, setProgress] = useState<number>(0);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (initialImages && initialImages.length > 0) {
      setImages(initialImages);
    }
  }, [initialImages]);

  // Slideshow timer
  useEffect(() => {
    if (!isOpen || !isPlaying || images.length === 0) return;

    const intervalTime = photoDuration * 1000;
    const stepTime = 50;
    let elapsed = 0;

    const interval = setInterval(() => {
      elapsed += stepTime;
      setProgress((elapsed / intervalTime) * 100);

      if (elapsed >= intervalTime) {
        elapsed = 0;
        setActivePhotoIdx((prev) => (prev + 1) % images.length);
        setProgress(0);
      }
    }, stepTime);

    return () => clearInterval(interval);
  }, [isOpen, isPlaying, photoDuration, images.length]);

  const totalDuration = images.length * photoDuration;

  const handleFinish = () => {
    onComplete({
      coverUrl: images[0] || '',
      mediaUrls: images,
      musicTrack: selectedMusic,
      duration: totalDuration,
      transition,
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-2 sm:p-4 backdrop-blur-md animate-in fade-in">
      <div className="relative flex h-full max-h-[92vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl bg-slate-900 text-white shadow-2xl border border-slate-800">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 px-4 py-3 bg-slate-950/80">
          <div className="flex items-center gap-2">
            <Film className="h-5 w-5 text-emerald-400" />
            <h2 className="text-base font-bold">ছবি দিয়ে রিল তৈরি করুন (Photo to Reel)</h2>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleFinish}
              className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-1.5 text-xs font-bold text-white shadow-md hover:bg-emerald-500 transition-colors"
            >
              <Check className="h-4 w-4" />
              <span>রিল রূপান্তর সম্পন্ন</span>
            </button>
            <button onClick={onClose} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white">
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Viewport Preview */}
        <div className="relative flex flex-1 items-center justify-center overflow-hidden bg-black p-4">
          <div className="relative aspect-[9/16] h-full max-h-[50vh] overflow-hidden rounded-2xl shadow-2xl border border-white/10 bg-slate-950">
            {images.map((img, idx) => (
              <img
                key={idx}
                src={img}
                alt=""
                className={`absolute inset-0 h-full w-full object-cover transition-all duration-700 ${
                  activePhotoIdx === idx
                    ? 'opacity-100 scale-100'
                    : transition === 'zoom'
                    ? 'opacity-0 scale-110'
                    : 'opacity-0 scale-95'
                }`}
              />
            ))}

            {/* Story style segment progress bars */}
            <div className="absolute top-2.5 inset-x-2.5 flex items-center gap-1 z-20">
              {images.map((_, i) => (
                <div key={i} className="h-1 flex-1 rounded-full bg-white/30 overflow-hidden">
                  <div
                    className="h-full bg-white transition-all"
                    style={{
                      width:
                        i < activePhotoIdx
                          ? '100%'
                          : i === activePhotoIdx
                          ? `${progress}%`
                          : '0%',
                    }}
                  />
                </div>
              ))}
            </div>

            {/* Music pill badge */}
            {selectedMusic && (
              <div className="absolute bottom-3 left-3 right-3 flex items-center gap-2 rounded-full bg-black/60 px-3 py-1 text-xs text-white backdrop-blur-md border border-white/10">
                <Music className="h-3.5 w-3.5 text-emerald-400 animate-spin" />
                <span className="truncate">{selectedMusic.title}</span>
              </div>
            )}
          </div>

          {selectedMusic && (
            <audio ref={audioRef} src={selectedMusic.audioUrl} autoPlay loop />
          )}
        </div>

        {/* Settings and controls */}
        <div className="border-t border-slate-800 bg-slate-950 px-4 py-3 text-xs space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-slate-400">প্রতি ছবির সময়কাল:</span>
              {[2, 3, 4, 5].map((s) => (
                <button
                  key={s}
                  onClick={() => setPhotoDuration(s)}
                  className={`rounded-lg px-2.5 py-1 font-bold ${
                    photoDuration === s
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  {s}s
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <span className="text-slate-400">ট্রানজিশন:</span>
              {[
                { id: 'fade', name: 'ফেড' },
                { id: 'zoom', name: 'জুম' },
              ].map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTransition(t.id as any)}
                  className={`rounded-lg px-2.5 py-1 font-bold ${
                    transition === t.id
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  {t.name}
                </button>
              ))}
            </div>

            <div className="text-emerald-400 font-mono font-bold">
              সর্বমোট রিল সময়: {totalDuration}s
            </div>
          </div>

          {/* Music Selection Row */}
          <div className="flex items-center gap-2 overflow-x-auto py-1">
            <span className="text-slate-400 shrink-0">🎵 ব্যাকগ্রাউন্ড মিউজিক:</span>
            {APPROVED_MUSIC_TRACKS.slice(0, 4).map((track) => (
              <button
                key={track.id}
                onClick={() => setSelectedMusic(track)}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1 font-semibold shrink-0 ${
                  selectedMusic?.id === track.id
                    ? 'bg-emerald-600 text-white ring-2 ring-emerald-400/30'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                <Music className="h-3 w-3" />
                <span>{track.title.split(' ')[0]}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
