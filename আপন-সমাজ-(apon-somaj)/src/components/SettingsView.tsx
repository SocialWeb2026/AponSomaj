import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Shield,
  Lock,
  Eye,
  Bell,
  Check,
  Smartphone,
  Globe
} from 'lucide-react';

export const SettingsView: React.FC = () => {
  const { currentUser } = useApp();
  const [postPrivacy, setPostPrivacy] = useState('public');
  const [profileVisibility, setProfileVisibility] = useState('everyone');
  const [phoneVisibility, setPhoneVisibility] = useState('friends_only');
  const [notifLikes, setNotifLikes] = useState(true);
  const [notifComments, setNotifComments] = useState(true);
  const [notifJobs, setNotifJobs] = useState(true);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  return (
    <div className="flex-1 max-w-3xl mx-auto space-y-5 pb-16">
      <div className="rounded-2xl border border-emerald-200 bg-white p-5 shadow-xs">
        <div className="flex items-center gap-2 border-b pb-3">
          <Shield className="h-5 w-5 text-emerald-600" />
          <h2 className="text-base font-bold text-slate-900">প্রাইভেসি ও অ্যাকাউন্ট নিয়ন্ত্রণ (Privacy & Safety)</h2>
        </div>

        <form onSubmit={handleSave} className="mt-4 space-y-5 text-xs">
          {/* Post Privacy */}
          <div className="space-y-2">
            <h4 className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
              <Eye className="h-4 w-4 text-emerald-600" />
              কন্টেন্ট ও পোস্ট প্রাইভেসি
            </h4>
            <div>
              <label className="text-slate-600 font-semibold block mb-1">ডিফল্ট পোস্ট দেখার অনুমতি:</label>
              <select
                value={postPrivacy}
                onChange={e => setPostPrivacy(e.target.value)}
                className="w-full rounded-lg border border-slate-200 p-2 text-slate-800"
              >
                <option value="public">🌐 পাবলিক (বাংলাদেশের যে কেউ দেখতে পারবে)</option>
                <option value="friends">👥 শুধুমাত্র বন্ধুরা (Friends Only)</option>
                <option value="only_me">🔒 শুধুমাত্র আমি (Only Me)</option>
              </select>
            </div>
          </div>

          {/* Profile and Contact Security */}
          <div className="space-y-2 border-t pt-4">
            <h4 className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
              <Lock className="h-4 w-4 text-emerald-600" />
              প্রোফাইল ও যোগাযোগ নিরাপত্তা
            </h4>
            <div>
              <label className="text-slate-600 font-semibold block mb-1">মোবাইল নম্বর দৃশ্যমানতা:</label>
              <select
                value={phoneVisibility}
                onChange={e => setPhoneVisibility(e.target.value)}
                className="w-full rounded-lg border border-slate-200 p-2 text-slate-800"
              >
                <option value="friends_only">শুধুমাত্র বন্ধুদের কাছে দৃশ্যমান</option>
                <option value="public">সবার জন্য উন্মুক্ত</option>
                <option value="hidden">সম্পূর্ণ গোপন রাখুন</option>
              </select>
            </div>
          </div>

          {/* Notifications preferences */}
          <div className="space-y-3 border-t pt-4">
            <h4 className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
              <Bell className="h-4 w-4 text-emerald-600" />
              বিজ্ঞপ্তি সেটিংস (Notifications)
            </h4>
            <div className="space-y-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={notifLikes}
                  onChange={e => setNotifLikes(e.target.checked)}
                  className="rounded text-emerald-600 focus:ring-emerald-500"
                />
                <span>পোস্টে লাইক বা প্রতিক্রিয়া পেলে বিজ্ঞপ্তি পাঠান</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={notifComments}
                  onChange={e => setNotifComments(e.target.checked)}
                  className="rounded text-emerald-600 focus:ring-emerald-500"
                />
                <span>মন্তব্য বা রিপ্লাই এর নোটিফিকেশন</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={notifJobs}
                  onChange={e => setNotifJobs(e.target.checked)}
                  className="rounded text-emerald-600 focus:ring-emerald-500"
                />
                <span>আমার এলাকার নতুন চাকরি ও মার্কেটপ্লেস পোস্টের নোটিফিকেশন</span>
              </label>
            </div>
          </div>

          <div className="flex items-center justify-between border-t pt-4">
            {savedSuccess ? (
              <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                <Check className="h-4 w-4" />
                সেটিংস সফলভাবে সংরক্ষিত হয়েছে!
              </span>
            ) : <span></span>}

            <button
              type="submit"
              className="rounded-xl bg-emerald-600 px-6 py-2.5 text-xs font-bold text-white hover:bg-emerald-700 shadow-xs active:scale-95 transition-all"
            >
              পরিবর্তন সংরক্ষণ করুন
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
