import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Shield,
  MapPin,
  Users,
  FileText,
  AlertTriangle,
  Plus,
  Trash2,
  CheckCircle,
  XCircle,
  BarChart3,
  Search,
  Check,
  X,
  Wrench
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const {
    currentUser,
    users,
    posts,
    reports,
    deletePost,
    dismissReport,
    toggleUserBan,
    toggleUserVerify,
    changeUserRole,
    divisions,
    districts,
    upazilas,
    unions,
    wards,
    addLocationNode,
    labourProfiles,
    labourJobPosts,
    upsertLabourProfile,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'overview' | 'locations' | 'users' | 'reports' | 'analytics' | 'labour'>('overview');

  // Location node adding state
  const [newLocType, setNewLocType] = useState<'division' | 'district' | 'upazila' | 'union' | 'ward'>('district');
  const [newLocName, setNewLocName] = useState('');
  const [newLocBnName, setNewLocBnName] = useState('');
  const [selectedDivParent, setSelectedDivParent] = useState(divisions[0]?.id || 'div-1');
  const [selectedDistParent, setSelectedDistParent] = useState(districts[0]?.id || 'dist-1');
  const [selectedUpParent, setSelectedUpParent] = useState(upazilas[0]?.id || 'up-1');
  const [selectedUnParent, setSelectedUnParent] = useState(unions[0]?.id || '');

  // Hierarchy filter and search state
  const [hierarchyFilterDiv, setHierarchyFilterDiv] = useState<string>('all');
  const [hierarchySearch, setHierarchySearch] = useState<string>('');

  const handleAddLocation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLocName.trim() || !newLocBnName.trim()) return;

    let parentData = {};
    if (newLocType === 'district') {
      parentData = { divisionId: selectedDivParent };
    } else if (newLocType === 'upazila') {
      parentData = { districtId: selectedDistParent };
    } else if (newLocType === 'union') {
      parentData = { upazilaId: selectedUpParent };
    } else if (newLocType === 'ward') {
      parentData = { unionId: selectedUnParent };
    }

    addLocationNode(newLocType, {
      name: newLocName.trim(),
      bnName: newLocBnName.trim(),
      ...parentData,
    });

    setNewLocName('');
    setNewLocBnName('');
  };

  const pendingReports = reports.filter(r => r.status === 'pending');

  return (
    <div className="flex-1 max-w-6xl mx-auto space-y-5 pb-16">
      {/* Header Banner */}
      <div className="rounded-2xl border border-emerald-300 bg-gradient-to-r from-emerald-950 via-slate-900 to-emerald-900 p-5 text-white shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <Shield className="h-7 w-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-black tracking-tight">আপন সমাজ সুপার অ্যাডমিন ড্যাশবোর্ড</h2>
                <span className="rounded-md bg-emerald-500/30 px-2 py-0.5 text-[10px] font-bold text-emerald-300 uppercase">
                  Super Admin
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                বাংলাদেশ ভৌগোলিক হায়ারার্কি ব্যবস্থাপনা, ব্যবহারকারী নিয়ন্ত্রণ, কন্টেন্ট মডারেশন ও সেফটি।
              </p>
            </div>
          </div>

          <div className="text-right text-xs text-slate-300">
            <span className="text-emerald-400 font-bold">{currentUser?.name}</span> (অ্যাডমিনিস্ট্রেটর)
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 bg-white rounded-xl p-1 shadow-xs overflow-x-auto text-xs font-bold">
        {[
          { id: 'overview', label: 'ওভারভিউ', icon: BarChart3 },
          { id: 'locations', label: `ভৌগোলিক হায়ারার্কি (${divisions.length} বিভাগ, ${districts.length} জেলা)`, icon: MapPin },
          { id: 'users', label: `ইউজার ও রোলস (${users.length})`, icon: Users },
          { id: 'reports', label: `মডারেশন ও রিপোর্ট (${pendingReports.length})`, icon: AlertTriangle, badge: pendingReports.length },
          { id: 'labour', label: `শ্রম বাজার (${labourProfiles.length} প্রোফাইল)`, icon: Wrench, badge: labourProfiles.length },
          { id: 'analytics', label: 'জেলা ভিত্তিক অ্যানালিটিক্স', icon: BarChart3 },
        ].map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 rounded-lg px-4 py-2.5 transition-all ${
                activeTab === tab.id
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Icon className="h-4 w-4" />
              <span>{tab.label}</span>
              {tab.badge && tab.badge > 0 && (
                <span className="rounded-full bg-rose-500 px-1.5 py-0.2 text-[10px] text-white">
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Tab 1: Overview */}
      {activeTab === 'overview' && (
        <div className="space-y-5">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
              <span className="text-xs font-semibold text-slate-500">মোট রেজিস্টার্ড ইউজার</span>
              <div className="text-2xl font-black text-slate-900 mt-1">{users.length}</div>
              <span className="text-[11px] text-emerald-600 font-bold mt-1 block">সকল ৮ বিভাগে সক্রিয়</span>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
              <span className="text-xs font-semibold text-slate-500">মোট প্রকাশিত পোস্ট</span>
              <div className="text-2xl font-black text-slate-900 mt-1">{posts.length}</div>
              <span className="text-[11px] text-emerald-600 font-bold mt-1 block">এলাকা ভিত্তিক ট্যাগযুক্ত</span>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
              <span className="text-xs font-semibold text-slate-500">উপজেলা ও থানা ডেটাবেস</span>
              <div className="text-2xl font-black text-slate-900 mt-1">{upazilas.length}</div>
              <span className="text-[11px] text-emerald-600 font-bold mt-1 block">ডায়নামিক রিলেশনাল</span>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
              <span className="text-xs font-semibold text-slate-500">রিভিউ পেন্ডিং রিপোর্ট</span>
              <div className="text-2xl font-black text-rose-600 mt-1">{pendingReports.length}</div>
              <span className="text-[11px] text-slate-500 mt-1 block">তাত্ক্ষণিক পর্যালোচনা প্রয়োজন</span>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
            <h3 className="font-bold text-slate-900 text-sm mb-3">সাম্প্রতিক সিস্টেম ইভেন্ট ও স্বাস্থ্য</h3>
            <div className="space-y-2 text-xs text-slate-600">
              <div className="flex items-center gap-2 p-2 rounded-lg bg-slate-50">
                <CheckCircle className="h-4 w-4 text-emerald-600" />
                <span>বাংলাদেশ লোকেশন রিলেশনাল ডেটাবেজ সক্রিয় ও সিনক্রোনাইজড রয়েছে।</span>
              </div>
              <div className="flex items-center gap-2 p-2 rounded-lg bg-slate-50">
                <CheckCircle className="h-4 w-4 text-emerald-600" />
                <span>লোকাল কমিউনিটি হাব ও ফিড ফিল্টারিং নির্বিঘ্নে কার্যকর।</span>
              </div>
              <div className="flex items-center gap-2 p-2 rounded-lg bg-slate-50">
                <CheckCircle className="h-4 w-4 text-emerald-600" />
                <span>আপন ইকোসিস্টেম মডিউল (মার্কেটপ্লেস ও এক্সটার্নাল লিঙ্কস) সক্রিয় রয়েছে।</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Location Hierarchy Management */}
      {activeTab === 'locations' && (
        <div className="space-y-5">
          {/* Bangladesh Location Statistics Overview */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            <div className="rounded-xl border border-emerald-200 bg-white p-3 shadow-xs">
              <span className="text-[11px] font-semibold text-slate-500">বিভাগ (Divisions)</span>
              <div className="text-xl font-black text-emerald-700 mt-1">{divisions.length}</div>
              <span className="text-[10px] text-slate-400">সমগ্র বাংলাদেশ</span>
            </div>
            <div className="rounded-xl border border-emerald-200 bg-white p-3 shadow-xs">
              <span className="text-[11px] font-semibold text-slate-500">জেলা (Districts)</span>
              <div className="text-xl font-black text-emerald-700 mt-1">{districts.length}</div>
              <span className="text-[10px] text-slate-400">৬৪ টি জেলা সম্পন্ন</span>
            </div>
            <div className="rounded-xl border border-emerald-200 bg-white p-3 shadow-xs">
              <span className="text-[11px] font-semibold text-slate-500">উপজেলা/থানা</span>
              <div className="text-xl font-black text-emerald-700 mt-1">{upazilas.length}</div>
              <span className="text-[10px] text-slate-400">প্রশাসনিক থানা</span>
            </div>
            <div className="rounded-xl border border-emerald-200 bg-white p-3 shadow-xs">
              <span className="text-[11px] font-semibold text-slate-500">ইউনিয়ন/পৌরসভা</span>
              <div className="text-xl font-black text-emerald-700 mt-1">{unions.length}</div>
              <span className="text-[10px] text-slate-400">লোকাল পরিষদ</span>
            </div>
            <div className="rounded-xl border border-emerald-200 bg-white p-3 shadow-xs col-span-2 sm:col-span-1">
              <span className="text-[11px] font-semibold text-slate-500">ওয়ার্ড (Wards)</span>
              <div className="text-xl font-black text-emerald-700 mt-1">{wards.length}</div>
              <span className="text-[10px] text-slate-400">তৃণমূল পর্যায়</span>
            </div>
          </div>

          {/* Add Location Form */}
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-5 shadow-xs">
            <h3 className="text-sm font-bold text-emerald-950 mb-3 flex items-center gap-2">
              <Plus className="h-4 w-4 text-emerald-700" />
              <span>নতুন প্রশাসনিক স্তর যুক্ত করুন (Add Location Hierarchy Node)</span>
            </h3>

            <form onSubmit={handleAddLocation} className="space-y-3 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">স্তরের ধরন (Hierarchy Level)</label>
                  <select
                    value={newLocType}
                    onChange={e => {
                      const type = e.target.value as any;
                      setNewLocType(type);
                    }}
                    className="w-full rounded-lg border border-slate-200 bg-white p-2 text-slate-800"
                  >
                    <option value="district">জেলা (District)</option>
                    <option value="upazila">উপজেলা / থানা (Upazila)</option>
                    <option value="union">ইউনিয়ন / পৌরসভা (Union)</option>
                    <option value="ward">ওয়ার্ড (Ward)</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">ইংরেজি নাম (English Name)</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Pirganj"
                    value={newLocName}
                    onChange={e => setNewLocName(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 bg-white p-2 text-slate-800"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">বাংলা নাম (Bangla Name)</label>
                  <input
                    type="text"
                    required
                    placeholder="যেমন: পীরগঞ্জ"
                    value={newLocBnName}
                    onChange={e => setNewLocBnName(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 bg-white p-2 text-slate-800"
                  />
                </div>
              </div>

              {/* Cascading Parent Selection */}
              <div className="rounded-xl border border-slate-200 bg-white p-3 space-y-2">
                <span className="font-bold text-slate-800 block text-xs">অভিভাবক স্তর নির্বাচন (Parent Node):</span>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                  <div>
                    <label className="text-[10px] text-slate-500 font-semibold">১. বিভাগ (Division)</label>
                    <select
                      value={selectedDivParent}
                      onChange={e => {
                        const divId = e.target.value;
                        setSelectedDivParent(divId);
                        const firstDist = districts.find(d => d.divisionId === divId);
                        if (firstDist) {
                          setSelectedDistParent(firstDist.id);
                          const firstUp = upazilas.find(u => u.districtId === firstDist.id);
                          if (firstUp) {
                            setSelectedUpParent(firstUp.id);
                            const firstUn = unions.find(un => un.upazilaId === firstUp.id);
                            setSelectedUnParent(firstUn?.id || '');
                          }
                        }
                      }}
                      className="w-full rounded-lg border border-slate-200 bg-slate-50 p-1.5 text-xs text-slate-800"
                    >
                      {divisions.map(d => (
                        <option key={d.id} value={d.id}>{d.bnName} ({d.name})</option>
                      ))}
                    </select>
                  </div>

                  {(newLocType === 'upazila' || newLocType === 'union' || newLocType === 'ward') && (
                    <div>
                      <label className="text-[10px] text-slate-500 font-semibold">২. জেলা (District)</label>
                      <select
                        value={selectedDistParent}
                        onChange={e => {
                          const distId = e.target.value;
                          setSelectedDistParent(distId);
                          const firstUp = upazilas.find(u => u.districtId === distId);
                          if (firstUp) {
                            setSelectedUpParent(firstUp.id);
                            const firstUn = unions.find(un => un.upazilaId === firstUp.id);
                            setSelectedUnParent(firstUn?.id || '');
                          }
                        }}
                        className="w-full rounded-lg border border-slate-200 bg-slate-50 p-1.5 text-xs text-slate-800"
                      >
                        {districts
                          .filter(d => d.divisionId === selectedDivParent)
                          .map(d => (
                            <option key={d.id} value={d.id}>{d.bnName} ({d.name})</option>
                          ))}
                      </select>
                    </div>
                  )}

                  {(newLocType === 'union' || newLocType === 'ward') && (
                    <div>
                      <label className="text-[10px] text-slate-500 font-semibold">৩. উপজেলা/থানা (Upazila)</label>
                      <select
                        value={selectedUpParent}
                        onChange={e => {
                          const upId = e.target.value;
                          setSelectedUpParent(upId);
                          const firstUn = unions.find(un => un.upazilaId === upId);
                          setSelectedUnParent(firstUn?.id || '');
                        }}
                        className="w-full rounded-lg border border-slate-200 bg-slate-50 p-1.5 text-xs text-slate-800"
                      >
                        {upazilas
                          .filter(u => u.districtId === selectedDistParent)
                          .map(u => (
                            <option key={u.id} value={u.id}>{u.bnName} ({u.name})</option>
                          ))}
                      </select>
                    </div>
                  )}

                  {newLocType === 'ward' && (
                    <div>
                      <label className="text-[10px] text-slate-500 font-semibold">৪. ইউনিয়ন/পৌরসভা (Union)</label>
                      <select
                        value={selectedUnParent}
                        onChange={e => setSelectedUnParent(e.target.value)}
                        className="w-full rounded-lg border border-slate-200 bg-slate-50 p-1.5 text-xs text-slate-800"
                      >
                        {unions
                          .filter(un => un.upazilaId === selectedUpParent)
                          .map(un => (
                            <option key={un.id} value={un.id}>{un.bnName} ({un.name})</option>
                          ))}
                      </select>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  className="rounded-xl bg-emerald-600 px-5 py-2 text-xs font-bold text-white hover:bg-emerald-700 shadow-xs"
                >
                  ডাটাবেজে যুক্ত করুন
                </button>
              </div>
            </form>
          </div>

          {/* Current Hierarchy View & Explorer */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-3">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">সমগ্র বাংলাদেশ প্রশাসনিক হায়ারার্কি এক্সপ্লোরার</h3>
                <p className="text-xs text-slate-400">সকল বিভাগ, জেলা ও সংশ্লিষ্ট উপজেলা/থানা সমূহ</p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <div className="relative">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="জেলা বা উপজেলা খুঁজুন..."
                    value={hierarchySearch}
                    onChange={e => setHierarchySearch(e.target.value)}
                    className="w-44 rounded-lg border border-slate-200 pl-8 pr-3 py-1.5 text-xs text-slate-800 placeholder-slate-400"
                  />
                </div>

                <select
                  value={hierarchyFilterDiv}
                  onChange={e => setHierarchyFilterDiv(e.target.value)}
                  className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs font-semibold text-slate-700"
                >
                  <option value="all">সকল বিভাগ ({divisions.length})</option>
                  {divisions.map(d => (
                    <option key={d.id} value={d.id}>{d.bnName} বিভাগ</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-4 text-xs">
              {divisions
                .filter(div => hierarchyFilterDiv === 'all' || div.id === hierarchyFilterDiv)
                .map(div => {
                  const divDistricts = districts.filter(d => {
                    if (d.divisionId !== div.id) return false;
                    if (!hierarchySearch.trim()) return true;
                    const searchLower = hierarchySearch.toLowerCase();
                    const matchDist = d.bnName.toLowerCase().includes(searchLower) || d.name.toLowerCase().includes(searchLower);
                    const matchUp = upazilas.some(u => u.districtId === d.id && (u.bnName.toLowerCase().includes(searchLower) || u.name.toLowerCase().includes(searchLower)));
                    return matchDist || matchUp;
                  });

                  if (hierarchySearch.trim() && divDistricts.length === 0) return null;

                  return (
                    <div key={div.id} className="border border-slate-200 rounded-xl p-3.5 bg-slate-50/50">
                      <div className="flex items-center justify-between font-bold text-emerald-950 text-sm">
                        <span className="flex items-center gap-1.5">
                          <MapPin className="h-4 w-4 text-emerald-600" />
                          {div.bnName} বিভাগ ({div.name} Division)
                        </span>
                        <span className="text-xs text-slate-500 font-normal">{divDistricts.length} টি জেলা</span>
                      </div>

                      <div className="mt-2.5 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                        {divDistricts.map(dis => {
                          const disUpazilas = upazilas.filter(u => u.districtId === dis.id);
                          return (
                            <div key={dis.id} className="bg-white border border-slate-200/80 rounded-xl p-2.5 text-xs shadow-2xs">
                              <div className="flex items-center justify-between border-b border-slate-100 pb-1 mb-1.5">
                                <span className="font-bold text-slate-900">{dis.bnName} ({dis.name})</span>
                                <span className="text-[10px] text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded font-semibold">
                                  {disUpazilas.length} উপজেলা
                                </span>
                              </div>
                              <div className="flex flex-wrap gap-1">
                                {disUpazilas.map(up => (
                                  <span key={up.id} className="rounded bg-slate-50 px-1.5 py-0.5 text-[10px] text-slate-700 border border-slate-200/60">
                                    {up.bnName}
                                  </span>
                                ))}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: User Management & Roles */}
      {activeTab === 'users' && (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <h3 className="font-bold text-slate-900 text-sm mb-3">ইউজার রোল ও অ্যাকাউন্ট নিয়ন্ত্রণ</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b bg-slate-50 text-slate-500 font-semibold">
                  <th className="p-3">ব্যবহারকারী</th>
                  <th className="p-3">এলাকা</th>
                  <th className="p-3">বর্তমান রোল</th>
                  <th className="p-3">স্ট্যাটাস</th>
                  <th className="p-3 text-right">পদক্ষেপ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map(u => (
                  <tr key={u.id} className="hover:bg-slate-50/50">
                    <td className="p-3 flex items-center gap-2.5">
                      <img src={u.avatar} alt="" className="h-9 w-9 rounded-full object-cover" />
                      <div>
                        <div className="font-bold text-slate-900 flex items-center gap-1">
                          {u.name}
                          {u.isVerified && <CheckCircle className="h-3.5 w-3.5 text-emerald-600 fill-emerald-100" />}
                        </div>
                        <div className="text-[11px] text-slate-400">@{u.username} • {u.phone}</div>
                      </div>
                    </td>

                    <td className="p-3 text-slate-600">
                      {(() => {
                        const uDiv = divisions.find(d => d.id === u.divisionId);
                        const uDist = districts.find(d => d.id === u.districtId);
                        const uUp = upazilas.find(u2 => u2.id === u.upazilaId);
                        const uUn = unions.find(un => un.id === u.unionId);
                        const uWard = wards.find(w => w.id === u.wardId);
                        const formatted = [
                          uWard?.bnName,
                          uUn?.bnName,
                          uUp?.bnName,
                          uDist?.bnName,
                          uDiv?.bnName
                        ].filter(Boolean).join(', ') || u.hometown || 'বাংলাদেশ';

                        return (
                          <div>
                            <span className="font-semibold text-slate-800 text-xs block">{formatted}</span>
                            {uDist && (
                              <span className="text-[10px] text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200/50 inline-block mt-0.5">
                                {uDist.bnName} জেলা
                              </span>
                            )}
                          </div>
                        );
                      })()}
                    </td>

                    <td className="p-3">
                      <select
                        value={u.role}
                        onChange={e => changeUserRole(u.id, e.target.value as any)}
                        className="rounded-md border border-slate-200 bg-white p-1 text-xs font-semibold"
                      >
                        <option value="user">User</option>
                        <option value="moderator">Moderator</option>
                        <option value="admin">Super Admin</option>
                      </select>
                    </td>

                    <td className="p-3">
                      {u.isBanned ? (
                        <span className="rounded-md bg-rose-100 px-2 py-0.5 text-[10px] font-bold text-rose-800">
                          Banned
                        </span>
                      ) : (
                        <span className="rounded-md bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                          Active
                        </span>
                      )}
                    </td>

                    <td className="p-3 text-right space-x-2">
                      <button
                        onClick={() => toggleUserVerify(u.id)}
                        className="rounded-lg bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-700 hover:bg-slate-200"
                      >
                        {u.isVerified ? 'ভেরিফিকেশন সরান' : 'ব্লু টিক দিন'}
                      </button>

                      <button
                        onClick={() => toggleUserBan(u.id)}
                        className={`rounded-lg px-2.5 py-1 text-[11px] font-bold ${
                          u.isBanned
                            ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                            : 'bg-rose-50 text-rose-700 hover:bg-rose-600 hover:text-white'
                        }`}
                      >
                        {u.isBanned ? 'আনব্যান করুন' : 'ব্যান করুন'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 4: Content Moderation & Reports */}
      {activeTab === 'reports' && (
        <div className="space-y-4">
          {reports.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-xs text-slate-500">
              কোনো রিপোর্ট জমা নেই
            </div>
          ) : (
            reports.map(rep => {
              const post = posts.find(p => p.id === rep.targetId);
              return (
                <div
                  key={rep.id}
                  className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="rounded-md bg-rose-100 px-2 py-0.5 font-bold text-rose-800">
                        {rep.reason}
                      </span>
                      <span className="text-slate-400">স্ট্যাটাস: {rep.status}</span>
                      <span className="text-slate-400">• {rep.createdAt}</span>
                    </div>

                    {post && (
                      <div className="mt-2 p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-slate-800 line-clamp-2">
                        &quot;{post.content}&quot;
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {post && (
                      <button
                        onClick={() => deletePost(post.id)}
                        className="rounded-xl bg-rose-600 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-rose-700"
                      >
                        পোস্ট মুছে ফেলুন
                      </button>
                    )}
                    <button
                      onClick={() => dismissReport(rep.id)}
                      className="rounded-xl bg-slate-100 px-3.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-200"
                    >
                      রিপোর্ট খারিজ করুন
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Tab: Labour Marketplace Moderation */}
      {activeTab === 'labour' && (
        <div className="space-y-4">
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50/60 p-4 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-emerald-950">শ্রম বাজার ("কাজ চাই / শ্রমিক চাই") নিয়ন্ত্রণ ও যাচাইকরণ</h3>
              <p className="text-xs text-emerald-700">শ্রমিকদের তথ্য ও মোবাইল নম্বর সুরক্ষা নিশ্চিত করতে অ্যাডমিন মডারেশন প্যানেল</p>
            </div>
            <div className="flex gap-2 text-xs font-bold">
              <span className="bg-white px-3 py-1.5 rounded-xl border border-emerald-200 text-emerald-800">
                মোট প্রোফাইল: {labourProfiles.length}
              </span>
              <span className="bg-white px-3 py-1.5 rounded-xl border border-blue-200 text-blue-800">
                মোট কাজের চাহিদা: {labourJobPosts.length}
              </span>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-xs">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-800">নিবন্ধিত শ্রমিক তালিকা ও ভেরিফিকেশন স্ট্যাটাস</h4>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-slate-100 bg-slate-50 font-bold text-slate-600">
                  <tr>
                    <th className="p-3">শ্রমিকের নাম</th>
                    <th className="p-3">মোবাইল নম্বর</th>
                    <th className="p-3">দক্ষতা ও অভিজ্ঞতা</th>
                    <th className="p-3">দৈনিক মজুরি</th>
                    <th className="p-3">স্ট্যাটাস</th>
                    <th className="p-3 text-right">মডারেশন অ্যাকশন</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {labourProfiles.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50/80">
                      <td className="p-3">
                        <div className="flex items-center gap-2.5">
                          <img
                            src={p.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100'}
                            alt=""
                            className="h-8 w-8 rounded-full object-cover border border-slate-200"
                          />
                          <div>
                            <span className="font-bold text-slate-900 block">{p.fullName}</span>
                            <span className="text-[10px] text-slate-400">ID: {p.id}</span>
                          </div>
                        </div>
                      </td>
                      <td className="p-3">
                        <span className="font-mono text-slate-800">{p.phone}</span>
                        {p.isPhoneVerified && (
                          <span className="ml-1 text-[10px] text-emerald-600 font-bold bg-emerald-50 px-1 py-0.5 rounded">
                            OTP Verified
                          </span>
                        )}
                      </td>
                      <td className="p-3">
                        <span className="font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md inline-block">
                          {p.specificSkill}
                        </span>
                        <span className="text-slate-500 block text-[10px] mt-0.5">
                          {p.experienceLevel} ({p.experienceYears} বছর)
                        </span>
                      </td>
                      <td className="p-3 font-bold text-slate-800">
                        ৳{p.expectedDailyWage}
                      </td>
                      <td className="p-3">
                        {p.isVerified ? (
                          <span className="rounded-md bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                            যাচাইকৃত (Verified)
                          </span>
                        ) : (
                          <span className="rounded-md bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-800">
                            সাধারণ (Unverified)
                          </span>
                        )}
                      </td>
                      <td className="p-3 text-right">
                        <button
                          onClick={() => {
                            upsertLabourProfile({
                              fullName: p.fullName,
                              phone: p.phone,
                              isVerified: !p.isVerified,
                            });
                          }}
                          className={`rounded-lg px-2.5 py-1 text-[11px] font-semibold transition ${
                            p.isVerified
                              ? 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                              : 'bg-emerald-600 text-white hover:bg-emerald-700'
                          }`}
                        >
                          {p.isVerified ? 'ভেরিফিকেশন প্রত্যাহার' : 'ভেরিফাইড ব্যাজ প্রদান'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 5: Analytics */}
      {activeTab === 'analytics' && (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-4 text-xs">
          <h3 className="font-bold text-slate-900 text-sm">জেলা ভিত্তিক সক্রিয় ব্যবহারকারী বিতরণ</h3>
          <div className="space-y-3">
            {[
              { district: 'ঠাকুরগাঁও (Thakurgaon)', count: 4, pct: 60 },
              { district: 'ঢাকা (Dhaka)', count: 2, pct: 30 },
              { district: 'রংপুর (Rangpur)', count: 1, pct: 15 },
              { district: 'চট্টগ্রাম (Chattogram)', count: 1, pct: 15 },
            ].map((item, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex justify-between font-semibold">
                  <span>{item.district}</span>
                  <span>{item.count} ব্যবহারকারী ({item.pct}%)</span>
                </div>
                <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                  <div className="h-full bg-emerald-600 rounded-full" style={{ width: `${item.pct}%` }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
