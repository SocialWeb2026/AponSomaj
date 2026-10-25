import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Building,
  Plus,
  MapPin,
  CheckCircle2,
  Globe,
  Phone,
  Search,
  X
} from 'lucide-react';

export const PagesView: React.FC = () => {
  const {
    currentUser,
    pages,
    toggleFollowPage,
    createPage,
    divisions,
    districts,
    upazilas
  } = useApp();

  const [search, setSearch] = useState('');
  const [createModalOpen, setCreateModalOpen] = useState(false);

  // Create page form
  const [name, setName] = useState('');
  const [category, setCategory] = useState('কৃষি ও বাণিজ্য');
  const [description, setDescription] = useState('');
  const [phone, setPhone] = useState('');
  const [website, setWebsite] = useState('');
  const [divId, setDivId] = useState('');
  const [distId, setDistId] = useState('');
  const [upId, setUpId] = useState('');

  const filteredPages = pages.filter(
    p =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.category.toLowerCase().includes(search.toLowerCase()) ||
      p.description.toLowerCase().includes(search.toLowerCase())
  );

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const div = divisions.find(d => d.id === divId);
    const dist = districts.find(d => d.id === distId);
    const up = upazilas.find(u => u.id === upId);

    createPage({
      name: name.trim(),
      category,
      description: description.trim(),
      contactPhone: phone.trim() || undefined,
      phone: phone.trim() || undefined,
      coverPhoto: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=1000',
      avatar: 'https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=200',
      website: website.trim() || undefined,
      location: (div || dist || up) ? {
        divisionId: div?.id,
        divisionName: div?.bnName,
        districtId: dist?.id,
        districtName: dist?.bnName,
        upazilaId: up?.id,
        upazilaName: up?.bnName
      } : undefined
    });

    setName('');
    setDescription('');
    setPhone('');
    setWebsite('');
    setCreateModalOpen(false);
  };

  return (
    <div className="flex-1 max-w-5xl mx-auto space-y-5 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-emerald-200 bg-gradient-to-r from-emerald-800 to-teal-800 p-5 text-white shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <Building className="h-6 w-6 text-emerald-300" />
            <h2 className="text-xl font-bold">পাবলিক পেজ ও ব্যবসা (Pages & Businesses)</h2>
          </div>
          <p className="text-xs text-emerald-100 mt-1">
            বাংলাদেশের স্থানীয় উদ্যোগ, সমাজসেবা প্রতিষ্ঠান ও ব্যবসা প্রতিষ্ঠানের সাথে সরাসরি যুক্ত হোন।
          </p>
        </div>
        <button
          onClick={() => setCreateModalOpen(true)}
          className="flex items-center justify-center gap-2 rounded-xl bg-white px-4 py-2.5 text-xs font-bold text-emerald-800 shadow-xs hover:bg-emerald-50 active:scale-95 transition-all"
        >
          <Plus className="h-4 w-4" />
          <span>নতুন পেজ খুলুন</span>
        </button>
      </div>

      {/* Search */}
      <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-xs">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="পেজ বা প্রতিষ্ঠান খুঁজুন..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-3 py-1.5 text-xs text-slate-800 focus:border-emerald-500 focus:outline-hidden"
          />
        </div>
      </div>

      {/* Pages Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredPages.map(page => {
          const followersList = page.followerIds || page.followers || [];
          const isFollowing = currentUser && followersList.includes(currentUser.id);
          const isPageVerified = page.verified || page.isVerified;
          return (
            <div
              key={page.id}
              className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs hover:shadow-md transition-shadow"
            >
              <div className="flex items-start gap-3">
                <img
                  src={page.avatar}
                  alt={page.name}
                  className="h-14 w-14 rounded-2xl object-cover ring-2 ring-emerald-500/20 shrink-0"
                />
                <div className="flex-1 overflow-hidden">
                  <div className="flex items-center gap-1.5">
                    <h3 className="font-bold text-slate-900 text-sm truncate">{page.name}</h3>
                    {isPageVerified && (
                      <CheckCircle2 className="h-4 w-4 text-emerald-600 fill-emerald-50 shrink-0" />
                    )}
                  </div>
                  <span className="text-[11px] font-semibold text-emerald-700 block mt-0.5">
                    {page.category}
                  </span>
                  <div className="flex items-center gap-1 text-[11px] text-slate-500 mt-1">
                    <MapPin className="h-3 w-3 text-emerald-600 shrink-0" />
                    <span className="truncate">
                      {[page.location?.upazilaName, page.location?.districtName, page.location?.divisionName]
                        .filter(Boolean)
                        .join(', ') || 'বাংলাদেশ'}
                    </span>
                  </div>
                </div>
              </div>

              <p className="mt-3 text-xs text-slate-600 leading-relaxed line-clamp-2">
                {page.description}
              </p>

              <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
                <span className="text-xs font-semibold text-slate-500">
                  {followersList.length} অনুসারী
                </span>
                <button
                  id={`follow-page-btn-${page.id}`}
                  onClick={() => toggleFollowPage(page.id)}
                  className={`rounded-xl px-4 py-1.5 text-xs font-bold transition-all ${
                    isFollowing
                      ? 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-xs'
                  }`}
                >
                  {isFollowing ? 'অনুসরণ করছেন' : 'ফলো করুন'}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Create Page Modal */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-2xl bg-white p-5 shadow-2xl">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-slate-900 text-sm">নতুন পাবলিক পেজ খুলুন</h3>
              <button onClick={() => setCreateModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="mt-4 space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">পেজের নাম *</label>
                <input
                  type="text"
                  required
                  placeholder="যেমন: ঠাকুরগাঁও ডিজিটাল ফার্ম"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 p-2 text-slate-800"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">ক্যাটাগরি</label>
                <input
                  type="text"
                  placeholder="যেমন: কৃষি পণ্য ও সেবা / তথ্য প্রযুক্তি"
                  value={category}
                  onChange={e => setCategory(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 p-2 text-slate-800"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">বিবরণ</label>
                <textarea
                  rows={2}
                  placeholder="পেজের উদ্দেশ্য ও সেবাসমূহ..."
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 p-2 text-slate-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">ফোন নম্বর</label>
                  <input
                    type="text"
                    placeholder="017xxxxxxxx"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 p-2 text-slate-800"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">ওয়েবসাইট</label>
                  <input
                    type="text"
                    placeholder="https://..."
                    value={website}
                    onChange={e => setWebsite(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 p-2 text-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">এলাকা নির্ধারণ</label>
                <div className="grid grid-cols-3 gap-2">
                  <select
                    value={divId}
                    onChange={e => setDivId(e.target.value)}
                    className="rounded-lg border border-slate-200 p-1.5 text-slate-800"
                  >
                    <option value="">বিভাগ</option>
                    {divisions.map(d => (
                      <option key={d.id} value={d.id}>{d.bnName}</option>
                    ))}
                  </select>
                  <select
                    value={distId}
                    onChange={e => setDistId(e.target.value)}
                    className="rounded-lg border border-slate-200 p-1.5 text-slate-800"
                  >
                    <option value="">জেলা</option>
                    {districts.filter(d => !divId || d.divisionId === divId).map(d => (
                      <option key={d.id} value={d.id}>{d.bnName}</option>
                    ))}
                  </select>
                  <select
                    value={upId}
                    onChange={e => setUpId(e.target.value)}
                    className="rounded-lg border border-slate-200 p-1.5 text-slate-800"
                  >
                    <option value="">উপজেলা</option>
                    {upazilas.filter(u => !distId || u.districtId === distId).map(u => (
                      <option key={u.id} value={u.id}>{u.bnName}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="mt-4 flex justify-end gap-2 pt-2 border-t">
                <button
                  type="button"
                  onClick={() => setCreateModalOpen(false)}
                  className="rounded-xl px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-emerald-600 px-5 py-2 text-xs font-bold text-white hover:bg-emerald-700"
                >
                  পেজ তৈরি করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
