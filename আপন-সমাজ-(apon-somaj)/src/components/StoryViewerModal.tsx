import React, { useEffect, useState } from 'react';
import { Story, User } from '../types';
import { useApp } from '../context/AppContext';
import { X, Trash2, Clock, MapPin, ChevronLeft, ChevronRight, Eye } from 'lucide-react';

interface StoryViewerModalProps {
  story: Story | null;
  stories: Story[];
  onClose: () => void;
  onSelectStory: (story: Story) => void;
}

export const StoryViewerModal: React.FC<StoryViewerModalProps> = ({
  story,
  stories,
  onClose,
  onSelectStory,
}) => {
  const { currentUser, users, deleteStory } = useApp();
  const [progress, setProgress] = useState(0);

  const storyId = story?.id;
  const currentIndex = story ? stories.findIndex(s => s.id === story.id) : -1;

  const handlePrev = () => {
    if (currentIndex > 0) {
      onSelectStory(stories[currentIndex - 1]);
    }
  };

  const handleNext = () => {
    if (currentIndex >= 0 && currentIndex < stories.length - 1) {
      onSelectStory(stories[currentIndex + 1]);
    } else {
      onClose();
    }
  };

  // Auto advance timer
  useEffect(() => {
    if (!storyId) return;
    setProgress(0);
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          handleNext();
          return 0;
        }
        return prev + 2;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [storyId]);

  if (!story) return null;

  const author = users.find(u => u.id === story.userId) || (currentUser?.id === story.userId ? currentUser : null);
  const isOwner = currentUser?.id === story.userId;

  const handleDelete = async () => {
    if (confirm('আপনি কি এই স্টোরি মুছে ফেলতে চান?')) {
      await deleteStory(story.id);
      onClose();
    }
  };

  // Time left calculation
  const expiresAtMs = new Date(story.expiresAt).getTime();
  const nowMs = Date.now();
  const diffHours = Math.max(0, Math.round((expiresAtMs - nowMs) / (1000 * 60 * 60)));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-2 sm:p-4">
      {/* Navigation Buttons for desktop */}
      {currentIndex > 0 && (
        <button
          onClick={handlePrev}
          className="hidden sm:flex absolute left-4 z-20 h-10 w-10 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-md hover:bg-white/30 transition-colors"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>
      )}

      {currentIndex < stories.length - 1 && (
        <button
          onClick={handleNext}
          className="hidden sm:flex absolute right-4 z-20 h-10 w-10 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-md hover:bg-white/30 transition-colors"
        >
          <ChevronRight className="h-6 w-6" />
        </button>
      )}

      {/* Main Story Container */}
      <div className="relative flex h-[85vh] max-h-[700px] w-full max-w-sm flex-col justify-between overflow-hidden rounded-3xl bg-slate-950 shadow-2xl border border-white/10">
        {/* Progress Bar */}
        <div className="absolute top-0 left-0 right-0 z-30 flex gap-1 p-3">
          {stories.map((s, idx) => (
            <div key={s.id} className="h-1 flex-1 overflow-hidden rounded-full bg-white/30">
              <div
                className="h-full bg-white transition-all duration-100 ease-linear"
                style={{
                  width:
                    idx < currentIndex ? '100%' : idx === currentIndex ? `${progress}%` : '0%',
                }}
              />
            </div>
          ))}
        </div>

        {/* Story Header */}
        <div className="relative z-30 flex items-center justify-between p-4 pt-6 bg-gradient-to-b from-black/70 to-transparent">
          <div className="flex items-center gap-2.5">
            <img
              src={author?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100'}
              alt=""
              className="h-9 w-9 rounded-full border border-white object-cover shadow-sm"
            />
            <div>
              <span className="block text-xs font-bold text-white drop-shadow-sm">
                {author?.name || 'ব্যবহারকারী'}
              </span>
              <div className="flex items-center gap-1.5 text-[10px] text-white/80">
                <Clock className="h-3 w-3" />
                <span>বাকি {diffHours} ঘণ্টা</span>
                {story.locationName && (
                  <>
                    <span>•</span>
                    <span className="flex items-center gap-0.5">
                      <MapPin className="h-2.5 w-2.5" />
                      {story.locationName}
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1">
            {isOwner && (
              <button
                onClick={handleDelete}
                title="স্টোরি ডিলিট করুন"
                className="rounded-full p-2 text-rose-300 hover:bg-rose-500/20 hover:text-rose-100 transition-colors"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            )}
            <button
              onClick={onClose}
              className="rounded-full p-2 text-white/80 hover:bg-white/20 hover:text-white transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Story Canvas / Body */}
        <div
          className={`relative flex flex-1 flex-col items-center justify-center p-6 text-center text-white ${
            story.mediaType === 'image' && story.mediaUrl
              ? 'bg-slate-950'
              : `bg-gradient-to-br ${story.backgroundStyle || 'from-emerald-700 to-teal-900'}`
          }`}
        >
          {story.mediaType === 'image' && story.mediaUrl ? (
            <>
              <img
                src={story.mediaUrl}
                alt="Story Media"
                className="absolute inset-0 h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30" />
              {story.content && (
                <div className="relative z-10 mt-auto w-full rounded-2xl bg-black/50 p-3.5 backdrop-blur-xs text-xs text-white leading-relaxed">
                  {story.content}
                </div>
              )}
            </>
          ) : (
            <div className="max-w-xs space-y-3">
              <p className="text-lg font-bold leading-relaxed text-white drop-shadow-md">
                {story.content}
              </p>
            </div>
          )}
        </div>

        {/* Footer / Privacy Info */}
        <div className="relative z-30 flex items-center justify-between p-3.5 bg-gradient-to-t from-black/80 to-transparent text-[11px] text-white/80">
          <div className="flex items-center gap-1">
            <Eye className="h-3.5 w-3.5" />
            <span>{story.privacy === 'public' ? 'সর্বজনীন স্টোরি' : 'শুধু বন্ধুদের জন্য'}</span>
          </div>

          <div className="flex sm:hidden items-center gap-2">
            {currentIndex > 0 && (
              <button
                onClick={handlePrev}
                className="rounded-full bg-white/20 px-2 py-1 text-[10px] text-white"
              >
                আগেরটি
              </button>
            )}
            {currentIndex < stories.length - 1 && (
              <button
                onClick={handleNext}
                className="rounded-full bg-emerald-600 px-2.5 py-1 text-[10px] font-bold text-white"
              >
                পরেরটি
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
