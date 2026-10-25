import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { PostCard } from './PostCard';
import { BangladeshLocationPicker } from './BangladeshLocationPicker';
import {
  MapPin,
  Users,
  FileText,
  Briefcase,
  ShoppingBag,
  Users2,
  ChevronRight,
  Sparkles,
  ArrowLeft,
  Building,
  Home,
  CheckCircle2,
  RotateCcw,
  Compass,
  Filter
} from 'lucide-react';

export const LocationHub: React.FC = () => {
  const {
    divisions,
    districts,
    upazilas,
    unions,
    wards,
    users,
    posts,
    groups,
    pages,
    jobs,
    marketplaceListings,
    openUserProfile,
    setActiveView,
    setLocationFilter
  } = useApp();

  // Active navigation level inside the Location Hub
  const [selectedDivId, setSelectedDivId] = useState<string>('div-7'); // Default Rangpur Division
  const [selectedDistId, setSelectedDistId] = useState<string>('dis-thakurgaon'); // Default Thakurgaon
  const [selectedUpId, setSelectedUpId] = useState<string>('up-thakurgaon-sadar'); // Default Thakurgaon Sadar
  const [selectedUnId, setSelectedUnId] = useState<string>('');
  const [selectedWardId, setSelectedWardId] = useState<string>('');

  const [activeTab, setActiveTab] = useState<'posts' | 'people' | 'groups' | 'pages' | 'jobs' | 'market'>('posts');

  const activeDiv = divisions.find(d => d.id === selectedDivId);
  const activeDist = districts.find(d => d.id === selectedDistId);
  const activeUp = upazilas.find(u => u.id === selectedUpId);
  const activeUn = unions.find(u => u.id === selectedUnId);
  const activeWard = wards.find(w => w.id === selectedWardId);

  // Available children at the current level
  const currentDistricts = districts.filter(d => d.divisionId === selectedDivId && d.active);
  const currentUpazilas = upazilas.filter(u => u.districtId === selectedDistId && u.active);
  const currentUnions = unions.filter(u => u.upazilaId === selectedUpId && u.active);
  const currentWards = wards.filter(w => w.unionId === selectedUnId && w.active);

  // Filter content by current location hub selection
  const isMatchLocation = (loc?: {
    divisionId?: string;
    districtId?: string;
    upazilaId?: string;
    unionId?: string;
    wardId?: string;
  }) => {
    // If at Bangladesh level (nothing selected), match everything
    if (!selectedDivId && !selectedDistId && !selectedUpId && !selectedUnId && !selectedWardId) {
      return true;
    }
    if (!loc) return false;
    if (selectedWardId) return loc.wardId === selectedWardId;
    if (selectedUnId) return loc.unionId === selectedUnId;
    if (selectedUpId) return loc.upazilaId === selectedUpId;
    if (selectedDistId) return loc.districtId === selectedDistId;
    if (selectedDivId) return loc.divisionId === selectedDivId;
    return false;
  };

  const hubPosts = posts.filter(p => isMatchLocation(p.location));
  const hubUsers = users.filter(u =>
    isMatchLocation({
      divisionId: u.divisionId,
      districtId: u.districtId,
      upazilaId: u.upazilaId,
      unionId: u.unionId,
      wardId: u.wardId,
    }) || (activeDist && u.currentDistrict?.toLowerCase().includes(activeDist.name.toLowerCase()))
  );
  const hubGroups = groups.filter(g => isMatchLocation(g.location));
  const hubPages = pages.filter(p => isMatchLocation(p.location));
  const hubJobs = jobs.filter(j => isMatchLocation(j.location));
  const hubMarket = marketplaceListings.filter(m => isMatchLocation(m.location));

  // Determine hierarchical title & English subtitle
  let currentTitleBn = 'সমগ্র বাংলাদেশ সোশ্যাল কমিউনিটি হাব';
  let currentTitleEn = 'All Bangladesh Community Hub';

  if (activeWard) {
    currentTitleBn = `${activeWard.bnName}, ${activeUn?.bnName || ''}`;
    currentTitleEn = `${activeWard.name}, ${activeUn?.name || ''}`;
  } else if (activeUn) {
    currentTitleBn = `${activeUn.bnName}, ${activeUp?.bnName || ''}`;
    currentTitleEn = `${activeUn.name}, ${activeUp?.name || ''}`;
  } else if (activeUp) {
    currentTitleBn = `${activeUp.bnName}, ${activeDist?.bnName || ''}`;
    currentTitleEn = `${activeUp.name}, ${activeDist?.name || ''}`;
  } else if (activeDist) {
    currentTitleBn = `${activeDist.bnName} জেলা`;
    currentTitleEn = `${activeDist.name} District`;
  } else if (activeDiv) {
    currentTitleBn = `${activeDiv.bnName} বিভাগ`;
    currentTitleEn = `${activeDiv.name} Division`;
  }

  // Back button handler to step up one level in the hierarchy
  const handleGoBackLevel = () => {
    if (selectedWardId) {
      setSelectedWardId('');
    } else if (selectedUnId) {
      setSelectedUnId('');
    } else if (selectedUpId) {
      setSelectedUpId('');
    } else if (selectedDistId) {
      setSelectedDistId('');
    } else if (selectedDivId) {
      setSelectedDivId('');
    }
  };

  const handleResetToBangladesh = () => {
    setSelectedDivId('');
    setSelectedDistId('');
    setSelectedUpId('');
    setSelectedUnId('');
    setSelectedWardId('');
  };

  return (
    <div className="flex-1 max-w-4xl mx-auto space-y-5 pb-16">
      {/* Location Breadcrumb & Interactive Hierarchy Selector Banner */}
      <div className="rounded-2xl border border-emerald-200 bg-gradient-to-br from-emerald-800 via-emerald-700 to-teal-800 p-5 text-white shadow-lg">
        {/* Breadcrumb Navigation Trail */}
        <nav aria-label="Location Breadcrumb" className="flex flex-wrap items-center gap-1.5 text-xs text-emerald-200 mb-3 font-medium">
          <button
            onClick={handleResetToBangladesh}
            className={`flex items-center gap-1 rounded-md px-1.5 py-0.5 transition-colors ${
              !selectedDivId ? 'bg-white/20 text-white font-bold' : 'hover:bg-white/10 hover:text-white'
            }`}
          >
            <Home className="h-3.5 w-3.5" />
            <span>বাংলাদেশ</span>
          </button>

          {activeDiv && (
            <>
              <ChevronRight className="h-3 w-3 text-emerald-300" />
              <button
                onClick={() => {
                  setSelectedDistId('');
                  setSelectedUpId('');
                  setSelectedUnId('');
                  setSelectedWardId('');
                }}
                className={`rounded-md px-1.5 py-0.5 transition-colors ${
                  selectedDivId && !selectedDistId ? 'bg-white/20 text-white font-bold' : 'hover:bg-white/10 hover:text-white'
                }`}
              >
                {activeDiv.bnName}
              </button>
            </>
          )}

          {activeDist && (
            <>
              <ChevronRight className="h-3 w-3 text-emerald-300" />
              <button
                onClick={() => {
                  setSelectedUpId('');
                  setSelectedUnId('');
                  setSelectedWardId('');
                }}
                className={`rounded-md px-1.5 py-0.5 transition-colors ${
                  selectedDistId && !selectedUpId ? 'bg-white/20 text-white font-bold' : 'hover:bg-white/10 hover:text-white'
                }`}
              >
                {activeDist.bnName}
              </button>
            </>
          )}

          {activeUp && (
            <>
              <ChevronRight className="h-3 w-3 text-emerald-300" />
              <button
                onClick={() => {
                  setSelectedUnId('');
                  setSelectedWardId('');
                }}
                className={`rounded-md px-1.5 py-0.5 transition-colors ${
                  selectedUpId && !selectedUnId ? 'bg-white/20 text-white font-bold' : 'hover:bg-white/10 hover:text-white'
                }`}
              >
                {activeUp.bnName}
              </button>
            </>
          )}

          {activeUn && (
            <>
              <ChevronRight className="h-3 w-3 text-emerald-300" />
              <button
                onClick={() => setSelectedWardId('')}
                className={`rounded-md px-1.5 py-0.5 transition-colors ${
                  selectedUnId && !selectedWardId ? 'bg-white/20 text-white font-bold' : 'hover:bg-white/10 hover:text-white'
                }`}
              >
                {activeUn.bnName}
              </button>
            </>
          )}

          {activeWard && (
            <>
              <ChevronRight className="h-3 w-3 text-emerald-300" />
              <span className="rounded-md bg-white/25 px-1.5 py-0.5 text-white font-bold">
                {activeWard.bnName}
              </span>
            </>
          )}
        </nav>

        {/* Title and Action Controls */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-1 border-t border-white/15">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-md">
              <MapPin className="h-6 w-6 text-emerald-200" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-emerald-200">আপন সমাজ লোকাল হাব</span>
                <span className="rounded-full bg-emerald-500/30 px-2 py-0.5 text-[10px] font-bold text-emerald-100">
                  {selectedWardId ? 'ওয়ার্ড স্তর' : selectedUnId ? 'ইউনিয়ন স্তর' : selectedUpId ? 'উপজেলা স্তর' : selectedDistId ? 'জেলা স্তর' : selectedDivId ? 'বিভাগ স্তর' : 'জাতীয় স্তর'}
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black">{currentTitleBn}</h2>
              <p className="text-xs text-emerald-100 font-medium">{currentTitleEn}</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {selectedDivId && (
              <button
                id="location-hub-back-btn"
                onClick={handleGoBackLevel}
                className="flex items-center gap-1 rounded-xl bg-white/15 px-3 py-2 text-xs font-bold text-white hover:bg-white/25 transition-all"
                title="পূর্ববর্তী স্তরে যান"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                <span>পূর্ববর্তী স্তর</span>
              </button>
            )}

            {selectedDivId && (
              <button
                id="location-hub-reset-btn"
                onClick={handleResetToBangladesh}
                className="flex items-center gap-1 rounded-xl bg-white/15 px-3 py-2 text-xs font-bold text-white hover:bg-white/25 transition-all"
                title="সমগ্র বাংলাদেশে রিসেট করুন"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span>রিসেট</span>
              </button>
            )}

            <button
              onClick={() => {
                setLocationFilter({
                  divisionId: selectedDivId || undefined,
                  districtId: selectedDistId || undefined,
                  upazilaId: selectedUpId || undefined,
                  unionId: selectedUnId || undefined,
                  wardId: selectedWardId || undefined,
                });
                setActiveView('feed');
              }}
              className="flex items-center gap-1.5 rounded-xl bg-white px-3.5 py-2 text-xs font-bold text-emerald-900 shadow-md hover:bg-emerald-50 active:scale-95 transition-all"
            >
              <span>ফিডে এই ফিল্টার সেট করুন</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* Dynamic Cascading Selector Dropdowns */}
        <div className="mt-4 rounded-xl bg-black/25 p-3 backdrop-blur-md">
          <div className="text-[11px] font-bold text-emerald-200 mb-2 flex items-center gap-1.5">
            <Filter className="h-3.5 w-3.5" />
            <span>সরাসরি যেকোনো স্তরে লাফ দিন (Dependent Selector):</span>
          </div>
          <BangladeshLocationPicker
            value={{
              divisionId: selectedDivId,
              districtId: selectedDistId,
              upazilaId: selectedUpId,
              unionId: selectedUnId,
              wardId: selectedWardId,
            }}
            onChange={val => {
              setSelectedDivId(val.divisionId || '');
              setSelectedDistId(val.districtId || '');
              setSelectedUpId(val.upazilaId || '');
              setSelectedUnId(val.unionId || '');
              setSelectedWardId(val.wardId || '');
            }}
            showAllOption={true}
            theme="emerald"
            labels={true}
            includeUnions={true}
            includeWards={true}
          />
        </div>
      </div>

      {/* Interactive Sub-level Browser (Drilldown Cards) */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Compass className="h-4 w-4 text-emerald-600" />
            <h3 className="text-xs font-bold text-slate-800">
              {!selectedDivId
                ? 'বাংলাদেশের ৮টি বিভাগ ব্রাউজ করুন (ক্লিক করে প্রবেশ করুন):'
                : !selectedDistId
                ? `${activeDiv?.bnName} বিভাগের জেলাসমূহ:`
                : !selectedUpId
                ? `${activeDist?.bnName} জেলার উপজেলা ও থানাসমূহ:`
                : !selectedUnId
                ? `${activeUp?.bnName} উপজেলার ইউনিয়ন ও পৌরসভাসমূহ:`
                : `${activeUn?.bnName} এর ওয়ার্ডসমূহ:`}
            </h3>
          </div>
          <span className="text-[11px] text-slate-400 font-medium">ক্লিক করে নির্দিষ্ট এলাকায় প্রবেশ করুন</span>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
          {/* 1. All Divisions */}
          {!selectedDivId &&
            divisions.map(div => {
              const divDistCount = districts.filter(d => d.divisionId === div.id).length;
              return (
                <button
                  key={div.id}
                  onClick={() => setSelectedDivId(div.id)}
                  className="rounded-xl border border-slate-200 bg-slate-50/70 p-2.5 text-left hover:border-emerald-500 hover:bg-emerald-50/50 transition-all group"
                >
                  <div className="text-xs font-bold text-slate-800 group-hover:text-emerald-700">{div.bnName}</div>
                  <div className="text-[11px] text-slate-500">{div.name} Division</div>
                  <div className="mt-1 text-[10px] text-emerald-600 font-semibold">{divDistCount}টি জেলা</div>
                </button>
              );
            })}

          {/* 2. Districts in selected Division */}
          {selectedDivId && !selectedDistId &&
            currentDistricts.map(dis => {
              const disUpCount = upazilas.filter(u => u.districtId === dis.id).length;
              return (
                <button
                  key={dis.id}
                  onClick={() => setSelectedDistId(dis.id)}
                  className="rounded-xl border border-slate-200 bg-slate-50/70 p-2.5 text-left hover:border-emerald-500 hover:bg-emerald-50/50 transition-all group"
                >
                  <div className="text-xs font-bold text-slate-800 group-hover:text-emerald-700">{dis.bnName}</div>
                  <div className="text-[11px] text-slate-500">{dis.name} District</div>
                  <div className="mt-1 text-[10px] text-emerald-600 font-semibold">{disUpCount}টি উপজেলা/থানা</div>
                </button>
              );
            })}

          {/* 3. Upazilas in selected District */}
          {selectedDistId && !selectedUpId &&
            currentUpazilas.map(up => (
              <button
                key={up.id}
                onClick={() => setSelectedUpId(up.id)}
                className="rounded-xl border border-slate-200 bg-slate-50/70 p-2.5 text-left hover:border-emerald-500 hover:bg-emerald-50/50 transition-all group"
              >
                <div className="text-xs font-bold text-slate-800 group-hover:text-emerald-700">{up.bnName}</div>
                <div className="text-[11px] text-slate-500">{up.name} Upazila</div>
                <div className="mt-1 text-[10px] text-emerald-600 font-semibold">ইউনিয়নসমূহ দেখুন →</div>
              </button>
            ))}

          {/* 4. Unions in selected Upazila */}
          {selectedUpId && !selectedUnId &&
            (currentUnions.length > 0 ? (
              currentUnions.map(un => (
                <button
                  key={un.id}
                  onClick={() => setSelectedUnId(un.id)}
                  className="rounded-xl border border-slate-200 bg-slate-50/70 p-2.5 text-left hover:border-emerald-500 hover:bg-emerald-50/50 transition-all group"
                >
                  <div className="text-xs font-bold text-slate-800 group-hover:text-emerald-700">{un.bnName}</div>
                  <div className="text-[11px] text-slate-500">{un.name}</div>
                  <div className="mt-1 text-[10px] text-emerald-600 font-semibold">ওয়ার্ডসমূহ দেখুন →</div>
                </button>
              ))
            ) : (
              <div className="col-span-full text-xs text-slate-500 py-3 text-center">
                এই উপজেলার সকল ইউনিয়ন ও পৌরসভা সরাসরি সিলেক্টরে নির্বাচনযোগ্য।
              </div>
            ))}

          {/* 5. Wards in selected Union */}
          {selectedUnId &&
            (currentWards.length > 0 ? (
              currentWards.map(w => {
                const isSelected = selectedWardId === w.id;
                return (
                  <button
                    key={w.id}
                    onClick={() => setSelectedWardId(isSelected ? '' : w.id)}
                    className={`rounded-xl border p-2.5 text-left transition-all ${
                      isSelected
                        ? 'border-emerald-600 bg-emerald-600 text-white shadow-xs'
                        : 'border-slate-200 bg-slate-50/70 hover:border-emerald-500 text-slate-800'
                    }`}
                  >
                    <div className="text-xs font-bold">{w.bnName}</div>
                    <div className={`text-[11px] ${isSelected ? 'text-emerald-100' : 'text-slate-500'}`}>{w.name}</div>
                  </button>
                );
              })
            ) : (
              [1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
                <button
                  key={num}
                  onClick={() => setSelectedWardId(`w-${selectedUnId}-${num}`)}
                  className="rounded-xl border border-slate-200 bg-slate-50/70 p-2.5 text-left hover:border-emerald-500 text-slate-800 transition-all"
                >
                  <div className="text-xs font-bold">{num} নং ওয়ার্ড</div>
                  <div className="text-[11px] text-slate-500">Ward {num}</div>
                </button>
              ))
            ))}
        </div>
      </div>

      {/* Tabs Menu */}
      <div className="flex border-b border-slate-200 bg-white rounded-xl p-1 shadow-xs overflow-x-auto text-xs font-bold">
        {[
          { id: 'posts', label: `পোস্টসমূহ (${hubPosts.length})`, icon: FileText },
          { id: 'people', label: `মানুষ ও বাসিন্দা (${hubUsers.length})`, icon: Users },
          { id: 'groups', label: `কমিউনিটি ও গ্রুপ (${hubGroups.length})`, icon: Users2 },
          { id: 'pages', label: `পাবলিক পেজ (${hubPages.length})`, icon: Building },
          { id: 'jobs', label: `লোকাল চাকরি (${hubJobs.length})`, icon: Briefcase },
          { id: 'market', label: `মার্কেটপ্লেস পণ্য (${hubMarket.length})`, icon: ShoppingBag },
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex shrink-0 items-center gap-2 rounded-lg px-3.5 py-2 transition-all ${
                isActive
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Icon className="h-4 w-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Content Display */}
      {activeTab === 'posts' && (
        <div className="space-y-4">
          {hubPosts.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 mb-3">
                <FileText className="h-6 w-6" />
              </div>
              <h4 className="text-sm font-bold text-slate-800">এই এলাকায় এখনও কোনো পোস্ট করা হয়নি</h4>
              <p className="mt-1 text-xs text-slate-500 max-w-sm mx-auto">
                আপনার এলাকার প্রথম খবর বা চিন্তাধারা আপনিই শেয়ার করুন!
              </p>
              <button
                onClick={() => setActiveView('feed')}
                className="mt-4 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-700 shadow-xs"
              >
                পোস্ট করুন
              </button>
            </div>
          ) : (
            hubPosts.map(p => <PostCard key={p.id} post={p} />)
          )}
        </div>
      )}

      {activeTab === 'people' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {hubUsers.length === 0 ? (
            <div className="col-span-2 rounded-2xl border border-slate-200 bg-white p-8 text-center text-slate-500">
              এই এলাকায় কোনো সক্রিয় ব্যবহারকারী পাওয়া যায়নি।
            </div>
          ) : (
            hubUsers.map(user => (
              <div
                key={user.id}
                onClick={() => openUserProfile(user.id)}
                className="flex cursor-pointer items-center justify-between rounded-2xl border border-slate-200 bg-white p-3.5 shadow-xs hover:border-emerald-400 hover:shadow-sm transition-all"
              >
                <div className="flex items-center gap-3">
                  <img src={user.avatar} alt="" className="h-12 w-12 rounded-full object-cover ring-2 ring-emerald-500/20" />
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">{user.name}</h4>
                    <p className="text-xs text-slate-500">@{user.username}</p>
                    <p className="text-[11px] text-emerald-700 font-medium mt-0.5">{user.hometown || user.currentDistrict}</p>
                  </div>
                </div>
                <span className="text-xs font-bold text-emerald-700 hover:underline">
                  প্রোফাইল →
                </span>
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === 'groups' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {hubGroups.length === 0 ? (
            <div className="col-span-2 rounded-2xl border border-slate-200 bg-white p-8 text-center text-slate-500">
              এই এলাকার জন্য কোনো কমিউনিটি গ্রুপ গঠিত হয়নি।
            </div>
          ) : (
            hubGroups.map(g => (
              <div key={g.id} className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-xs">
                <img src={g.coverPhoto} alt="" className="h-28 w-full object-cover" />
                <div className="p-4">
                  <h4 className="font-bold text-slate-900">{g.name}</h4>
                  <p className="text-xs text-slate-500 line-clamp-2 mt-1">{g.description}</p>
                  <div className="mt-3 flex items-center justify-between text-xs">
                    <span className="text-emerald-700 font-semibold">{g.memberIds.length} সদস্য</span>
                    <button
                      onClick={() => setActiveView('groups')}
                      className="rounded-lg bg-emerald-50 px-3 py-1 text-emerald-800 font-bold hover:bg-emerald-100"
                    >
                      গ্রুপে যান
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === 'pages' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {hubPages.length === 0 ? (
            <div className="col-span-2 rounded-2xl border border-slate-200 bg-white p-8 text-center text-slate-500">
              এই এলাকায় কোনো রেজিস্টার্ড পেজ নেই।
            </div>
          ) : (
            hubPages.map(p => (
              <div key={p.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
                <div className="flex items-start gap-3">
                  <img src={p.avatar} alt="" className="h-12 w-12 rounded-xl object-cover" />
                  <div>
                    <h4 className="font-bold text-slate-900">{p.name}</h4>
                    <span className="text-[11px] text-emerald-700 font-medium">{p.category}</span>
                    <p className="text-xs text-slate-500 line-clamp-2 mt-1">{p.description}</p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === 'jobs' && (
        <div className="space-y-3">
          {hubJobs.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-slate-500">
              এই এলাকায় বর্তমানে কোনো শূন্য পদের নিয়োগ নেই।
            </div>
          ) : (
            hubJobs.map(j => (
              <div key={j.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs flex justify-between items-center">
                <div>
                  <h4 className="font-bold text-slate-900">{j.title}</h4>
                  <p className="text-xs text-emerald-800 font-semibold">{j.companyName}</p>
                  <p className="text-xs text-slate-500 mt-1">{j.salaryRange} • {j.employmentType}</p>
                </div>
                <button
                  onClick={() => setActiveView('jobs')}
                  className="rounded-xl bg-emerald-600 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-emerald-700"
                >
                  আবেদন করুন
                </button>
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === 'market' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {hubMarket.length === 0 ? (
            <div className="col-span-2 rounded-2xl border border-slate-200 bg-white p-8 text-center text-slate-500">
              এই এলাকার কোনো পণ্য বিক্রির জন্য লিস্টিং নেই।
            </div>
          ) : (
            hubMarket.map(item => (
              <div key={item.id} className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-xs">
                <img src={item.images[0]} alt="" className="h-40 w-full object-cover" />
                <div className="p-3.5">
                  <div className="flex items-center justify-between">
                    <span className="text-base font-black text-emerald-700">৳ {item.price.toLocaleString()}</span>
                    <span className="rounded-md bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                      {item.condition}
                    </span>
                  </div>
                  <h4 className="font-bold text-slate-900 text-sm mt-1">{item.title}</h4>
                  <p className="text-xs text-slate-500 mt-1">{item.category}</p>
                  <button
                    onClick={() => setActiveView('marketplace')}
                    className="mt-3 w-full rounded-lg bg-slate-100 py-1.5 text-xs font-bold text-slate-800 hover:bg-emerald-600 hover:text-white transition-colors"
                  >
                    মার্কেটপ্লেসে দেখুন
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};
