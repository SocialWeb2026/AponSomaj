import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { X, Image, Sparkles, MapPin, Globe, Users, Loader2 } from 'lucide-react';

interface CreateStoryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const BG_GRADIENTS = [
  { id: 'emerald', label: 'সবুজ', class: 'from-emerald-600 to-teal-800' },
  { id: 'blue', label: 'নীল', class: 'from-[#0F2942] to-blue-900' },
  { id: 'sunset', label: 'সানসেট', class: 'from-amber-600 to-rose-700' },
  { id: 'purple', label: 'বেগুনি', class: 'from-purple-700 to-indigo-900' },
  { id: 'dark', label: 'কালো', class: 'from-slate-800 to-slate-950' },
];

export const CreateStoryModal: React.FC<CreateStoryModalProps> = ({ isOpen, onClose }) => {
  const { currentUser, addStory } = useApp();

  const [mode, setMode] = useState<'text' | 'media'>('text');
  const [content, setContent] = useState('');
  const [mediaUrl, setMediaUrl] = useState('');
  const [backgroundStyle, setBackgroundStyle] = useState('from-emerald-600 to-teal-800');
  const [privacy, setPrivacy] = useState<'public' | 'friends'>('public');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() && !mediaUrl.trim()) {
      setErrorMsg('দয়া করে স্টোরির কিছু লেখা অথবা ছবির লিঙ্ক দিন');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');

    try {
      await addStory({
        mediaUrl: mediaUrl.trim() || undefined,
        mediaType: mode === 'media' && mediaUrl ? 'image' : 'text',
        content: content.trim() || undefined,
        backgroundStyle,
        privacy,
        locationName: currentUser?.currentDistrict || currentUser?.hometown || 'বাংলাদেশ',
        divisionId: currentUser?.divisionId,
        districtId: currentUser?.districtId,
        upazilaId: currentUser?.upazilaId,
      });

      setContent('');
      setMediaUrl('');
      onClose();
    } catch (err: any) {
      setErrorMsg(err?.message || 'স্টোরি সংরক্ষণ করা যায়নি। আবার চেষ্টা করুন।');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="relative w-full max-w-md rounded-2xl bg-white shadow-2xl overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-3.5 bg-slate-50/70">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
              <Sparkles className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-800">স্টোরি তৈরি করুন</h3>
              <p className="text-[11px] text-slate-500">২৪ ঘণ্টার জন্য কমিউনিটিতে শেয়ার হবে</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-1.5 text-slate-400 hover:bg-slate-200/60 hover:text-slate-700 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {errorMsg && (
            <div className="rounded-xl bg-rose-50 border border-rose-200 p-3 text-xs text-rose-700">
              {errorMsg}
            </div>
          )}

          {/* Mode Switcher */}
          <div className="grid grid-cols-2 gap-2 rounded-xl bg-slate-100 p-1">
            <button
              type="button"
              onClick={() => setMode('text')}
              className={`flex items-center justify-center gap-1.5 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                mode === 'text' ? 'bg-white text-emerald-800 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>টেক্সট স্টোরি</span>
            </button>
            <button
              type="button"
              onClick={() => setMode('media')}
              className={`flex items-center justify-center gap-1.5 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                mode === 'media' ? 'bg-white text-emerald-800 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Image className="h-3.5 w-3.5" />
              <span>ছবি / মিডিয়া</span>
            </button>
          </div>

          {/* Preview Canvas */}
          <div
            className={`relative flex h-48 w-full flex-col justify-between rounded-xl p-4 text-white shadow-inner overflow-hidden transition-all bg-gradient-to-br ${
              mode === 'text' ? backgroundStyle : 'from-slate-800 to-slate-950'
            }`}
          >
            {mode === 'media' && mediaUrl && (
              <img
                src={mediaUrl}
                alt="Preview"
                className="absolute inset-0 h-full w-full object-cover"
                onError={() => setErrorMsg('মিডিয়া লোড করা সম্ভব হয়নি। সঠিক URL দিন।')}
              />
            )}
            <div className="relative z-10 flex items-center gap-2">
              <img
                src={currentUser?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100'}
                alt=""
                className="h-8 w-8 rounded-full border border-white object-cover"
              />
              <div>
                <span className="block text-xs font-bold text-white drop-shadow-xs">
                  {currentUser?.name || 'আপনার নাম'}
                </span>
                <span className="block text-[10px] text-white/80 drop-shadow-xs">
                  {currentUser?.currentDistrict || 'বাংলাদেশ'} • ২৪ ঘণ্টা
                </span>
              </div>
            </div>

            <div className="relative z-10 my-auto text-center px-3">
              <p className="text-sm font-semibold leading-snug drop-shadow-md line-clamp-3">
                {content || (mode === 'text' ? 'আপনার ভাবনা বা মুহূর্ত লিখুন...' : 'ছবির ক্যাপশন...')}
              </p>
            </div>

            <div className="relative z-10 flex justify-end">
              <span className="rounded-full bg-black/40 px-2 py-0.5 text-[10px] backdrop-blur-xs text-white/90">
                {privacy === 'public' ? 'সর্বজনীন' : 'শুধু বন্ধুরা'}
              </span>
            </div>
          </div>

          {/* Input: Text */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              {mode === 'text' ? 'স্টোরির বক্তব্য' : 'ক্যাপশন (ঐচ্ছিক)'}
            </label>
            <textarea
              rows={mode === 'text' ? 3 : 2}
              value={content}
              onChange={e => setContent(e.target.value)}
              placeholder="আজকের দিনটি কেমন কাটছে? বা বিশেষ কোনো আপডেট..."
              className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-800 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              maxLength={280}
            />
            <div className="text-right text-[10px] text-slate-400">
              {content.length}/280 অক্ষর
            </div>
          </div>

          {/* Media URL (when in media mode) */}
          {mode === 'media' && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                ছবির লিঙ্ক (Image URL)
              </label>
              <input
                type="url"
                value={mediaUrl}
                onChange={e => setMediaUrl(e.target.value)}
                placeholder="https://example.com/image.jpg"
                className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-800 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
              <p className="mt-1 text-[10px] text-slate-400">
                সরাসরি ইমেজ বা ফটো লিঙ্ক প্রবেশ করান
              </p>
            </div>
          )}

          {/* Background Gradient Selector (when in text mode) */}
          {mode === 'text' && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                ব্যাকগ্রাউন্ড থিম
              </label>
              <div className="flex items-center gap-2">
                {BG_GRADIENTS.map(bg => (
                  <button
                    key={bg.id}
                    type="button"
                    onClick={() => setBackgroundStyle(bg.class)}
                    className={`h-7 w-7 rounded-full bg-gradient-to-br ${bg.class} transition-transform ${
                      backgroundStyle === bg.class ? 'ring-2 ring-emerald-600 scale-110 shadow-xs' : 'opacity-80 hover:opacity-100'
                    }`}
                    title={bg.label}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Privacy & Location Controls */}
          <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-3">
            <div className="flex items-center gap-1.5 text-xs text-slate-600">
              <MapPin className="h-3.5 w-3.5 text-emerald-600" />
              <span>{currentUser?.currentDistrict || 'বাংলাদেশ'}</span>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setPrivacy('public')}
                className={`flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-medium border ${
                  privacy === 'public'
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-700 font-semibold'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Globe className="h-3 w-3" />
                <span>সর্বজনীন</span>
              </button>
              <button
                type="button"
                onClick={() => setPrivacy('friends')}
                className={`flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-medium border ${
                  privacy === 'friends'
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-700 font-semibold'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Users className="h-3 w-3" />
                <span>বন্ধুরা</span>
              </button>
            </div>
          </div>

          {/* Submit */}
          <div className="pt-1 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
            >
              বাতিল
            </button>
            <button
              type="submit"
              disabled={isSubmitting || (!content.trim() && !mediaUrl.trim())}
              className="flex items-center gap-1.5 rounded-xl bg-[#0F2942] px-5 py-2 text-xs font-bold text-white shadow-xs hover:bg-emerald-700 transition-colors disabled:opacity-50"
            >
              {isSubmitting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              <span>স্টোরি পোস্ট করুন</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
