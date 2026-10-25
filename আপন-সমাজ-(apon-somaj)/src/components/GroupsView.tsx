import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Users2,
  Plus,
  MapPin,
  Lock,
  Globe2,
  Check,
  Search,
  X
} from 'lucide-react';

export const GroupsView: React.FC = () => {
  const {
    currentUser,
    groups,
    toggleJoinGroup,
    createGroup,
    divisions,
    districts,
    upazilas,
    unions,
    wards
  } = useApp();

  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [createModalOpen, setCreateModalOpen] = useState(false);

  // Create group form state
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('কৃষি ও গ্রামীণ উন্নয়ন');
  const [privacy, setPrivacy] = useState<'public' | 'private'>('public');
  const [divId, setDivId] = useState('');
  const [distId, setDistId] = useState('');
  const [upId, setUpId] = useState('');

  const categories = [
    'all',
    'কৃষি ও গ্রামীণ উন্নয়ন',
    'শিক্ষার্থী ও বিশ্ববিদ্যালয়',
    'যুব কল্যাণ ও সমাজসেবা',
    'স্বাস্থ্য ও রক্তদান',
    'ফ্রিল্যান্সিং ও আইটি'
  ];

  const filteredGroups = groups.filter(g => {
    const matchesSearch =
      g.name.toLowerCase().includes(search.toLowerCase()) ||
      g.description.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || g.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const div = divisions.find(d => d.id === divId);
    const dist = districts.find(d => d.id === distId);
    const up = upazilas.find(u => u.id === upId);

    createGroup({
      name: name.trim(),
      description: description.trim(),
      category,
      privacy,
      coverPhoto: 'https://images.unsplash.com/photo-1579208575657-c595a05383b7?w=1000',
      avatar: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=200',
      rules: ['পারস্পরিক সম্মান বজায় রাখুন', 'বিভ্রান্তিকর তথ্য বা স্প্যাম পোস্ট নিষিদ্ধ'],
      location: (div || dist || up) ? {
        divisionId: div?.id,
        divisionName: div?.bnName,
        districtId: dist?.id,
        districtName: dist?.bnName,
        upazilaId: up?.id,
        upazilaName: up?.bnName,
      } : undefined
    });

    setName('');
    setDescription('');
    setCreateModalOpen(false);
  };

  return (
    <div className="flex-1 max-w-5xl mx-auto space-y-5 pb-16">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-emerald-200 bg-gradient-to-r from-emerald-700 to-teal-800 p-5 text-white shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <Users2 className="h-6 w-6 text-emerald-300" />
            <h2 className="text-xl font-bold">কমিউনিটি ও গ্রুপ (Communities & Groups)</h2>
          </div>
          <p className="text-xs text-emerald-100 mt-1">
            আপনার এলাকা, পেশা, শিক্ষা ও আগ্রহের ভিত্তিতে গঠিত বাংলাদেশের বিশ্বস্ত কমিউনিটিতে যুক্ত হোন।
          </p>
        </div>
        <button
          id="create-group-btn"
          onClick={() => setCreateModalOpen(true)}
          className="flex items-center justify-center gap-2 rounded-xl bg-white px-4 py-2.5 text-xs font-bold text-emerald-800 shadow-xs hover:bg-emerald-50 active:scale-95 transition-all"
        >
          <Plus className="h-4 w-4" />
          <span>নতুন গ্রুপ তৈরি করুন</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-3 shadow-xs">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="গ্রুপ অনুসন্ধান করুন..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-3 py-1.5 text-xs text-slate-800 focus:border-emerald-500 focus:outline-hidden"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto text-xs pb-1 sm:pb-0">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`shrink-0 rounded-lg px-3 py-1.5 font-medium transition-colors ${
                selectedCategory === cat
                  ? 'bg-emerald-600 text-white font-bold'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {cat === 'all' ? 'সকল ক্যাটাগরি' : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Groups Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredGroups.map(group => {
          const isMember = currentUser && group.memberIds.includes(currentUser.id);
          return (
            <div
              key={group.id}
              className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-xs hover:shadow-md transition-shadow"
            >
              <div className="relative h-32 w-full bg-slate-200">
                <img src={group.coverPhoto} alt="" className="h-full w-full object-cover" />
                <span className="absolute top-2.5 right-2.5 rounded-full bg-slate-900/70 backdrop-blur-xs px-2.5 py-0.5 text-[10px] font-semibold text-white flex items-center gap-1">
                  {group.privacy === 'public' ? <Globe2 className="h-3 w-3" /> : <Lock className="h-3 w-3" />}
                  <span>{group.privacy === 'public' ? 'পাবলিক' : 'প্রাইভেট'}</span>
                </span>
              </div>

              <div className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-base font-bold text-slate-900">{group.name}</h3>
                    <span className="text-[11px] font-semibold text-emerald-700">{group.category}</span>
                  </div>
                  <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-bold text-emerald-800">
                    {group.memberIds.length} সদস্য
                  </span>
                </div>

                <p className="mt-2 text-xs text-slate-600 line-clamp-2 leading-relaxed">
                  {group.description}
                </p>

                {group.location && (
                  <div className="mt-2 flex items-center gap-1 text-[11px] text-slate-500 font-medium">
                    <MapPin className="h-3.5 w-3.5 text-emerald-600" />
                    <span>
                      {[group.location.upazilaName, group.location.districtName, group.location.divisionName]
                        .filter(Boolean)
                        .join(', ')}
                    </span>
                  </div>
                )}

                <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
                  <span className="text-[11px] text-slate-400">তৈরি হয়েছে: {group.createdAt}</span>
                  <button
                    id={`join-group-btn-${group.id}`}
                    onClick={() => toggleJoinGroup(group.id)}
                    className={`flex items-center gap-1 rounded-xl px-4 py-1.5 text-xs font-bold transition-all ${
                      isMember
                        ? 'bg-slate-100 text-slate-700 hover:bg-rose-50 hover:text-rose-600'
                        : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-xs'
                    }`}
                  >
                    {isMember ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Plus className="h-3.5 w-3.5" />}
                    <span>{isMember ? 'যুক্ত আছেন (Leave)' : 'যুক্ত হন (Join)'}</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Create Group Modal */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-2xl bg-white p-5 shadow-2xl">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-slate-900 text-sm">নতুন গ্রুপ গঠন করুন</h3>
              <button onClick={() => setCreateModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="mt-4 space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">গ্রুপের নাম *</label>
                <input
                  type="text"
                  required
                  placeholder="যেমন: ঠাকুরগাঁও কৃষি উন্নয়ন সংঘ"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 p-2 text-slate-800"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">বিবরণ (Description)</label>
                <textarea
                  rows={2}
                  placeholder="গ্রুপের লক্ষ্য ও উদ্দেশ্য..."
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 p-2 text-slate-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">ক্যাটাগরি</label>
                  <select
                    value={category}
                    onChange={e => setCategory(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 p-2 text-slate-800"
                  >
                    {categories.filter(c => c !== 'all').map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">প্রাইভেসি</label>
                  <select
                    value={privacy}
                    onChange={e => setPrivacy(e.target.value as any)}
                    className="w-full rounded-lg border border-slate-200 p-2 text-slate-800"
                  >
                    <option value="public">🌐 পাবলিক (সবার জন্য উন্মুক্ত)</option>
                    <option value="private">🔒 প্রাইভেট (অনুমোদন সাপেক্ষে)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">এলাকা ট্যাগ (Hierarchy)</label>
                <div className="grid grid-cols-3 gap-2">
                  <select
                    value={divId}
                    onChange={e => setDivId(e.target.value)}
                    className="rounded-lg border border-slate-200 p-1.5 text-xs text-slate-800"
                  >
                    <option value="">বিভাগ নির্বাচন</option>
                    {divisions.map(d => (
                      <option key={d.id} value={d.id}>{d.bnName}</option>
                    ))}
                  </select>

                  <select
                    value={distId}
                    onChange={e => setDistId(e.target.value)}
                    className="rounded-lg border border-slate-200 p-1.5 text-xs text-slate-800"
                  >
                    <option value="">জেলা নির্বাচন</option>
                    {districts.filter(d => !divId || d.divisionId === divId).map(d => (
                      <option key={d.id} value={d.id}>{d.bnName}</option>
                    ))}
                  </select>

                  <select
                    value={upId}
                    onChange={e => setUpId(e.target.value)}
                    className="rounded-lg border border-slate-200 p-1.5 text-xs text-slate-800"
                  >
                    <option value="">উপজেলা নির্বাচন</option>
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
                  গ্রুপ তৈরি করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
