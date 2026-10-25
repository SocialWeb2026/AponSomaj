import React from 'react';
import { useApp } from '../context/AppContext';
import { X, ExternalLink, Globe, ShoppingBag, Wallet, Video, Sparkles, CheckCircle2 } from 'lucide-react';

export const EcosystemModal: React.FC = () => {
  const { ecosystemModalOpen, setEcosystemModalOpen } = useApp();

  if (!ecosystemModalOpen) return null;

  const ecosystemApps = [
    {
      id: 'somaj',
      name: 'আপন সমাজ (Apon Somaj)',
      english: 'Apon Somaj',
      tagline: 'আপন মানুষের আপন সমাজ',
      category: 'সামাজিক ও লোকাল কমিউনিটি প্ল্যাটফর্ম',
      icon: Globe,
      active: true,
      color: 'bg-emerald-600 text-white',
      badge: 'বর্তমান প্ল্যাটফর্ম (Active)',
      description: 'বাংলাদেশের বিভাগ, জেলা, উপজেলা, ইউনিয়ন ও ওয়ার্ড ভিত্তিক লোকাল সামাজিক নেটওয়ার্ক।'
    },
    {
      id: 'bazar',
      name: 'আপন বাজার (Apon Bazar)',
      english: 'Apon Bazar',
      tagline: 'বাংলার বিশ্বস্ত ই-কমার্স প্ল্যাটফর্ম',
      category: 'সম্পূর্ণ ই-কমার্স ও শপিং মার্কেটপ্লেস',
      icon: ShoppingBag,
      active: false,
      color: 'bg-amber-600 text-white',
      badge: 'Apon Ecosystem Service',
      description: 'দেশব্যাপী বিশ্বস্ত অনলাইন শপিং, পাইকারি কেনাবেচা, ফাস্ট ডেলিভারি ও সেলার হাব।'
    },
    {
      id: 'wallet',
      name: 'আপন ওয়ালেট (Apon Wallet)',
      english: 'Apon Wallet',
      tagline: 'সহজ ও নিরাপদ ডিজিটাল লেনদেন',
      category: 'ডিজিটাল ওয়ালেট ও ফিনটেক',
      icon: Wallet,
      active: false,
      color: 'bg-blue-600 text-white',
      badge: 'Fintech Service',
      description: 'কিউআর কোড পেমেন্ট, মার্চেন্ট ক্যাশ-ইন, ইউটিলিটি বিল এবং ক্যাশলেস কেনাকাটার সমাধান।'
    },
    {
      id: 'telelook',
      name: 'টেলিলুক (TeleLook)',
      english: 'TeleLook',
      tagline: 'ভিডিও ও লাইভ স্ট্রিমিং দুনিয়া',
      category: 'ভিডিও কেন্দ্রিক সোশ্যাল মিডিয়া',
      icon: Video,
      active: false,
      color: 'bg-rose-600 text-white',
      badge: 'Video & Reels Platform',
      description: 'স্বতন্ত্র ভিডিও ভিত্তিক প্ল্যাটফর্ম, লাইভ ব্রডকাস্ট, শর্ট ভিডিও এবং দেশি ক্রিয়েটর নেটওয়ার্ক।'
    },
    {
      id: 'studio',
      name: 'আপন ভিডিও স্টুডিও (Apon Video Studio)',
      english: 'Apon Video Studio',
      tagline: 'স্মার্ট এআই ভিডিও ক্রিয়েশন',
      category: 'এআই ভিডিও ক্রিয়েশন টুল',
      icon: Sparkles,
      active: false,
      color: 'bg-purple-600 text-white',
      badge: 'AI Creator Studio',
      description: 'অটোমেটেড ভিডিও জেনারেশন, ভয়েস-ওভার ও সামাজিক প্রচারণার জন্য কৃত্রিম বুদ্ধিমত্তা চালিত স্টুডিও।'
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
      <div className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 font-bold">
              আ
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">আপন ইকোসিস্টেম (Apon Ecosystem)</h2>
              <p className="text-xs text-slate-500">ডিজিটাল বাংলাদেশের নিজস্ব প্ল্যাটফর্ম পরিবার</p>
            </div>
          </div>
          <button
            id="close-ecosystem-modal"
            onClick={() => setEcosystemModalOpen(false)}
            className="rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-4 grid gap-3">
          {ecosystemApps.map(app => {
            const Icon = app.icon;
            return (
              <div
                key={app.id}
                className={`relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-xl border p-4 transition-all ${
                  app.active
                    ? 'border-emerald-300 bg-emerald-50/50 shadow-xs ring-1 ring-emerald-500/20'
                    : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/60'
                }`}
              >
                <div className="flex items-start gap-3.5">
                  <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl shadow-xs ${app.color}`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-bold text-slate-900">{app.name}</h3>
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
                          app.active
                            ? 'bg-emerald-600 text-white'
                            : 'bg-slate-100 text-slate-600 border border-slate-200'
                        }`}
                      >
                        {app.badge}
                      </span>
                    </div>
                    <p className="text-xs font-medium text-emerald-800 mt-0.5">{app.tagline}</p>
                    <p className="text-xs text-slate-600 mt-1 max-w-md">{app.description}</p>
                  </div>
                </div>

                <div className="w-full sm:w-auto shrink-0 flex items-center justify-end">
                  {app.active ? (
                    <span className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-100 px-3 py-1.5 text-xs font-semibold text-emerald-800">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600" /> বর্তমান সাইট
                    </span>
                  ) : (
                    <button
                      onClick={() => alert(`শীঘ্রই চালু হচ্ছে: ${app.english}! আপন সমাজ ব্যবহার করার জন্য ধন্যবাদ।`)}
                      className="inline-flex w-full sm:w-auto items-center justify-center gap-1 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-xs hover:bg-slate-50 active:scale-95"
                    >
                      <span>পরিদর্শন করুন</span>
                      <ExternalLink className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-6 rounded-xl bg-slate-50 p-4 text-xs text-slate-600 border border-slate-200 flex items-center justify-between">
          <span>* আপন ইকোসিস্টেমের সকল সেবা আলাদা ও সুনির্দিষ্ট কাজের জন্য নকশা করা।</span>
          <button
            onClick={() => setEcosystemModalOpen(false)}
            className="rounded-lg bg-emerald-600 px-4 py-1.5 text-xs font-medium text-white hover:bg-emerald-700"
          >
            বন্ধ করুন
          </button>
        </div>
      </div>
    </div>
  );
};
