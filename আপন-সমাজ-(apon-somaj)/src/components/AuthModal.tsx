import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { BangladeshLocationPicker, LocationValue } from './BangladeshLocationPicker';
import {
  X,
  Lock,
  Phone,
  User,
  MapPin,
  Check,
  ShieldCheck,
  Sparkles
} from 'lucide-react';

export const AuthModal: React.FC = () => {
  const {
    authModalOpen,
    setAuthModalOpen,
    login,
    register,
    users,
    switchUser,
    lastAuthError,
  } = useApp();

  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  // Register Form State
  const [name, setName] = useState('');
  const [bnName, setBnName] = useState('');
  const [username, setUsername] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [locValue, setLocValue] = useState<LocationValue>({});

  const [submitting, setSubmitting] = useState(false);

  if (!authModalOpen) return null;

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const success = await login(identifier.trim(), password);
      if (!success) {
        if (lastAuthError?.includes('Email not confirmed') || lastAuthError?.includes('email_not_confirmed')) {
          setError('আপনার ইমেইল কনফার্ম করা হয়নি (Email not confirmed)। অনুগ্রহ করে ইনবক্স চেক করে ইমেইল কনফার্ম করুন অথবা Supabase ড্যাশবোর্ড থেকে Confirm Email নিষ্ক্রিয় করুন।');
        } else if (lastAuthError?.includes('Invalid login credentials')) {
          setError('ইমেইল বা পাসওয়ার্ড সঠিক নয় (Invalid login credentials)। Supabase-এ নিবন্ধিত সঠিক তথ্য প্রদান করুন।');
        } else {
          setError(lastAuthError ? `লগইন ব্যর্থ: ${lastAuthError}` : 'ফোন নম্বর, ইমেইল বা পাসওয়ার্ড সঠিক নয়। Supabase-এ নিবন্ধিত সঠিক তথ্য প্রদান করুন।');
        }
      } else {
        setAuthModalOpen(false);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!name.trim() || !regPhone.trim() || !username.trim()) {
      setError('দয়া করে সকল প্রয়োজনীয় তথ্য পূরণ করুন।');
      return;
    }

    setSubmitting(true);
    try {
      const success = await register({
        name: name.trim(),
        bnName: bnName.trim() || undefined,
        username: username.trim().toLowerCase().replace(/\s+/g, '_'),
        phone: regPhone.trim(),
        password: regPassword || '123456',
        divisionId: locValue.divisionId,
        districtId: locValue.districtId,
        upazilaId: locValue.upazilaId,
        unionId: locValue.unionId,
        wardId: locValue.wardId,
        hometown: [locValue.wardName, locValue.unionName, locValue.upazilaName, locValue.districtName].filter(Boolean).join(', ') || 'বাংলাদেশ',
        currentDistrict: locValue.districtName || 'ঢাকা'
      });

      if (!success) {
        setError('এই ফোন নম্বর বা ইউজারনেম ইতিমধ্যে নিবন্ধিত রয়েছে।');
      } else {
        setAuthModalOpen(false);
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
      <div className="relative max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl bg-white p-5 shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-600 text-white font-bold">
              আ
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">
                {mode === 'login' ? 'আপন সমাজে প্রবেশ করুন' : 'নতুন অ্যাকাউন্ট তৈরি করুন'}
              </h3>
              <p className="text-[10px] text-emerald-700 font-semibold">আপন মানুষের আপন সমাজ</p>
            </div>
          </div>
          <button
            onClick={() => setAuthModalOpen(false)}
            className="rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {error && (
          <div className="mt-3 rounded-lg bg-rose-50 p-2.5 text-xs font-semibold text-rose-700 border border-rose-200">
            {error}
          </div>
        )}

        {mode === 'login' ? (
          <form onSubmit={handleLoginSubmit} className="mt-4 space-y-3 text-xs">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">
                মোবাইল নম্বর বা ইউজারনেম
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
                <input
                  type="text"
                  required
                  placeholder="01712345678 বা kawser"
                  value={identifier}
                  onChange={e => setIdentifier(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-3 py-2 text-slate-800 focus:border-emerald-500 focus:bg-white focus:outline-hidden"
                />
              </div>
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">পাসওয়ার্ড</label>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-3 py-2 text-slate-800 focus:border-emerald-500 focus:bg-white focus:outline-hidden"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-xl bg-emerald-600 py-2.5 text-xs font-bold text-white hover:bg-emerald-700 shadow-xs active:scale-98 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {submitting ? 'যাচাই করা হচ্ছে...' : 'লগইন করুন'}
            </button>

            <div className="text-center pt-1">
              <span className="text-slate-500 text-xs">অ্যাকাউন্ট নেই? </span>
              <button
                type="button"
                onClick={() => setMode('register')}
                className="font-bold text-emerald-700 hover:underline"
              >
                এখানে রেজিস্টার করুন
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleRegisterSubmit} className="mt-4 space-y-3 text-xs">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">আপনার নাম (English) *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Shakil Ahmed"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 p-2 text-slate-800"
                />
              </div>
              <div>
                <label className="font-semibold text-slate-700 block mb-1">নাম (বাংলায়)</label>
                <input
                  type="text"
                  placeholder="যেমন: শাকিল আহমেদ"
                  value={bnName}
                  onChange={e => setBnName(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 p-2 text-slate-800"
                />
              </div>
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">ইউজারনেম (Username) *</label>
              <input
                type="text"
                required
                placeholder="shakil_bd"
                value={username}
                onChange={e => setUsername(e.target.value)}
                className="w-full rounded-lg border border-slate-200 p-2 text-slate-800"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">মোবাইল নম্বর *</label>
              <input
                type="tel"
                required
                placeholder="017xxxxxxxx"
                value={regPhone}
                onChange={e => setRegPhone(e.target.value)}
                className="w-full rounded-lg border border-slate-200 p-2 text-slate-800"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">পাসওয়ার্ড *</label>
              <input
                type="password"
                required
                placeholder="পাসওয়ার্ড লিখুন..."
                value={regPassword}
                onChange={e => setRegPassword(e.target.value)}
                className="w-full rounded-lg border border-slate-200 p-2 text-slate-800"
              />
            </div>

            {/* Hierarchical Location picker */}
            <div>
              <label className="font-semibold text-slate-700 block mb-1">নিজ এলাকা (বিভাগ → জেলা → উপজেলা → ইউনিয়ন → ওয়ার্ড) *</label>
              <BangladeshLocationPicker
                value={locValue}
                onChange={setLocValue}
                includeUnions={true}
                includeWards={true}
                labels={false}
                compact={true}
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-xl bg-emerald-600 py-2.5 text-xs font-bold text-white hover:bg-emerald-700 shadow-xs active:scale-98 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {submitting ? 'অ্যাকাউন্ট তৈরি হচ্ছে...' : 'অ্যাকাউন্ট তৈরি সম্পন্ন করুন'}
            </button>

            <div className="text-center pt-1">
              <span className="text-slate-500 text-xs">ইতিমধ্যে অ্যাকাউন্ট আছে? </span>
              <button
                type="button"
                onClick={() => setMode('login')}
                className="font-bold text-emerald-700 hover:underline"
              >
                লগইন করুন
              </button>
            </div>
          </form>
        )}

        {/* Demo Quick Logins */}
        <div className="mt-5 border-t border-slate-100 pt-4">
          <div className="flex items-center gap-1.5 text-slate-400 text-[11px] font-semibold mb-2">
            <Sparkles className="h-3.5 w-3.5 text-amber-500" />
            <span>অথবা এক ক্লিকে ডেমো অ্যাকাউন্টে প্রবেশ করুন:</span>
          </div>
          <div className="space-y-1.5">
            {users.slice(0, 3).map(u => (
              <button
                key={u.id}
                type="button"
                disabled={submitting}
                onClick={async () => {
                  setError('');
                  setSubmitting(true);
                  try {
                    const success = await switchUser(u.id);
                    if (!success) {
                      setError(`'${u.name}' অ্যাকাউন্টে সুপাবেজ সেশন পাওয়া যায়নি। অনুগ্রহ করে আপনার আসল ইমেইল ও পাসওয়ার্ড দিয়ে লগইন বা রেজিস্টার করুন।`);
                    } else {
                      setAuthModalOpen(false);
                    }
                  } finally {
                    setSubmitting(false);
                  }
                }}
                className="flex w-full items-center justify-between rounded-xl border border-slate-200 bg-slate-50/70 p-2 hover:bg-emerald-50 hover:border-emerald-300 text-left transition-all disabled:opacity-50"
              >
                <div className="flex items-center gap-2">
                  <img src={u.avatar} alt="" className="h-7 w-7 rounded-full object-cover" />
                  <div>
                    <span className="text-xs font-bold text-slate-900 block">{u.name}</span>
                    <span className="text-[10px] text-slate-500">{u.hometown} • {u.role === 'admin' ? 'Super Admin' : 'User'}</span>
                  </div>
                </div>
                <span className="text-[11px] font-bold text-emerald-700">লগইন →</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
