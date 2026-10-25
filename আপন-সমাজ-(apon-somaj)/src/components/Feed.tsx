import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Story } from '../types';
import { PostCard } from './PostCard';
import { BangladeshLocationPicker } from './BangladeshLocationPicker';
import { CreateStoryModal } from './CreateStoryModal';
import { StoryViewerModal } from './StoryViewerModal';
import {
  Image,
  Video,
  Film,
  FolderPlus,
  MapPin,
  Smile,
  HandHeart,
  SlidersHorizontal,
  ChevronDown,
  X,
  Plus,
  RefreshCw,
  Compass,
  Clock,
  Flame,
  Globe2,
  Building,
  Navigation,
  Wrench,
  Search,
  Briefcase,
  UserCheck,
  Building2,
  ChevronRight,
} from 'lucide-react';

export const Feed: React.FC = () => {
  const {
    currentUser,
    users,
    posts,
    setCreatePostModalOpen,
    divisions,
    districts,
    upazilas,
    unions,
    wards,
    locationFilter,
    setLocationFilter,
    resetLocationFilter,
    setActiveView,
    stories,
    createStoryModalOpen,
    setCreateStoryModalOpen,
    openLabourMarketplace,
  } = useApp();

  const [selectedStory, setSelectedStory] = useState<Story | null>(null);

  // Active unexpired stories
  const nowMs = Date.now();
  const activeStories = stories.filter(s => new Date(s.expiresAt).getTime() > nowMs);

  const [activeFilterTab, setActiveFilterTab] = useState<
    'all' | 'nearby' | 'district' | 'upazila' | 'bangladesh' | 'latest' | 'popular'
  >('all');

  const [sortBy, setSortBy] = useState<'latest' | 'popular'>('latest');
  const [showDetailedFilter, setShowDetailedFilter] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Handle feed filter changes
  const handleFilterTabClick = (tab: typeof activeFilterTab) => {
    setActiveFilterTab(tab);
    if (tab === 'all' || tab === 'bangladesh') {
      resetLocationFilter();
      setSortBy('latest');
    } else if (tab === 'latest') {
      setSortBy('latest');
    } else if (tab === 'popular') {
      setSortBy('popular');
    } else if (tab === 'district') {
      if (currentUser?.districtId) {
        setLocationFilter({
          divisionId: currentUser.divisionId,
          districtId: currentUser.districtId,
        });
      } else {
        setShowDetailedFilter(true);
      }
    } else if (tab === 'upazila') {
      if (currentUser?.upazilaId) {
        setLocationFilter({
          divisionId: currentUser.divisionId,
          districtId: currentUser.districtId,
          upazilaId: currentUser.upazilaId,
        });
      } else {
        setShowDetailedFilter(true);
      }
    } else if (tab === 'nearby') {
      if (currentUser?.districtId) {
        setLocationFilter({
          divisionId: currentUser.divisionId,
          districtId: currentUser.districtId,
        });
      } else {
        setShowDetailedFilter(true);
      }
    }
  };

  // Filter posts based on active location hierarchy
  const filteredPosts = posts.filter(post => {
    if (
      !locationFilter.divisionId &&
      !locationFilter.districtId &&
      !locationFilter.upazilaId &&
      !locationFilter.unionId &&
      !locationFilter.wardId
    ) {
      return true; // Show all Bangladesh
    }
    if (locationFilter.wardId && post.location?.wardId !== locationFilter.wardId) {
      return false;
    }
    if (locationFilter.unionId && post.location?.unionId !== locationFilter.unionId) {
      return false;
    }
    if (locationFilter.upazilaId && post.location?.upazilaId !== locationFilter.upazilaId) {
      return false;
    }
    if (locationFilter.districtId && post.location?.districtId !== locationFilter.districtId) {
      return false;
    }
    if (locationFilter.divisionId && post.location?.divisionId !== locationFilter.divisionId) {
      return false;
    }
    return true;
  });

  const sortedPosts = [...filteredPosts].sort((a, b) => {
    if (sortBy === 'popular') {
      const aReactions = Object.values(a.reactions).reduce((sum, ids) => sum + ids.length, 0);
      const bReactions = Object.values(b.reactions).reduce((sum, ids) => sum + ids.length, 0);
      return bReactions + b.commentCount - (aReactions + a.commentCount);
    }
    return 0; // default order is latest
  });

  const selectedDivision = divisions.find(d => d.id === locationFilter.divisionId);
  const selectedDistrict = districts.find(d => d.id === locationFilter.districtId);
  const selectedUpazila = upazilas.find(u => u.id === locationFilter.upazilaId);
  const selectedUnion = unions.find(un => un.id === locationFilter.unionId);
  const selectedWard = wards.find(w => w.id === locationFilter.wardId);

  const hasLocationFilter = Boolean(
    locationFilter.divisionId ||
    locationFilter.districtId ||
    locationFilter.upazilaId ||
    locationFilter.unionId ||
    locationFilter.wardId
  );

  const handleRefresh = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
    }, 600);
  };

  return (
    <div className="flex-1 max-w-2xl mx-auto space-y-4 pb-16">
      {/* 1. STORY SECTION */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-3 sm:p-4 shadow-xs">
        <div className="flex items-center justify-between mb-3 px-1">
          <h3 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
            <Film className="h-4 w-4 text-emerald-600" />
            <span>কমিউনিটি স্টোরি ও মোমেন্টস</span>
          </h3>
          <span className="text-[11px] text-slate-400 font-medium">২৪ ঘণ্টার আপডেট</span>
        </div>

        <div className="flex items-stretch gap-2.5 overflow-x-auto pb-1 no-scrollbar">
          {/* Add Story Card */}
          <div
            onClick={() => setCreateStoryModalOpen(true)}
            className="group relative flex h-36 w-24 sm:h-40 sm:w-28 shrink-0 cursor-pointer flex-col justify-between overflow-hidden rounded-2xl border border-dashed border-emerald-300 bg-gradient-to-b from-emerald-50/70 to-white p-2.5 text-center transition-all hover:border-emerald-500 hover:shadow-xs"
          >
            <div className="relative mx-auto mt-2">
              <img
                src={currentUser?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100'}
                alt=""
                className="h-11 w-11 rounded-full object-cover ring-2 ring-emerald-500"
              />
              <div className="absolute -bottom-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-600 text-white shadow-xs group-hover:scale-110 transition-transform">
                <Plus className="h-3.5 w-3.5" />
              </div>
            </div>
            <div>
              <span className="block text-[11px] font-bold text-slate-800 leading-tight">
                স্টোরি যোগ করুন
              </span>
              <span className="text-[9px] text-emerald-700 font-medium">আপনার মুহূর্ত</span>
            </div>
          </div>

          {/* Active Stories List */}
          {activeStories.map(story => {
            const author = users.find(u => u.id === story.userId) || (currentUser?.id === story.userId ? currentUser : null);
            return (
              <div
                key={story.id}
                onClick={() => setSelectedStory(story)}
                className="group relative flex h-36 w-24 sm:h-40 sm:w-28 shrink-0 cursor-pointer flex-col justify-between overflow-hidden rounded-2xl border border-slate-200 p-2.5 text-center shadow-xs transition-all hover:scale-[1.02] hover:shadow-md"
              >
                {/* Background / Media preview */}
                {story.mediaType === 'image' && story.mediaUrl ? (
                  <img
                    src={story.mediaUrl}
                    alt="Story"
                    className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                ) : (
                  <div
                    className={`absolute inset-0 bg-gradient-to-br ${
                      story.backgroundStyle || 'from-emerald-600 to-teal-800'
                    }`}
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                {/* Author Avatar with Ring */}
                <div className="relative z-10 mx-auto mt-1">
                  <img
                    src={
                      author?.avatar ||
                      'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100'
                    }
                    alt=""
                    className="h-9 w-9 rounded-full object-cover ring-2 ring-emerald-400 border border-white"
                  />
                </div>

                {/* Snippet / Name */}
                <div className="relative z-10 text-white">
                  {story.content && (
                    <p className="line-clamp-2 text-[10px] font-medium leading-tight text-white/90 drop-shadow-sm mb-1">
                      {story.content}
                    </p>
                  )}
                  <span className="block text-[11px] font-bold text-white drop-shadow-sm truncate">
                    {author?.name || 'ব্যবহারকারী'}
                  </span>
                  <span className="text-[9px] text-emerald-300 font-medium">২৪ ঘণ্টা</span>
                </div>
              </div>
            );
          })}

          {/* Clean Ready State if no stories exist */}
          {activeStories.length === 0 && (
            <div className="flex-1 min-w-[200px] flex items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 p-4 text-center">
              <div className="space-y-1">
                <p className="text-xs font-semibold text-slate-700">
                  বর্তমানে কোনো অ্যাক্টিভ স্টোরি নেই
                </p>
                <p className="text-[11px] text-slate-400 max-w-xs mx-auto">
                  ছবি বা বিশেষ আপডেট ২৪ ঘণ্টার জন্য কমিউনিটিতে শেয়ার করতে স্টোরি যোগ করুন।
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* LABOUR MARKETPLACE (কাজ চাই / শ্রমিক চাই) 4 PROMINENT BUTTONS */}
      <div className="rounded-2xl sm:rounded-3xl border border-emerald-200/90 bg-gradient-to-br from-emerald-50/90 via-teal-50/50 to-emerald-50/80 p-3.5 sm:p-4 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-xs">
              <Wrench className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-xs sm:text-sm font-bold text-emerald-950 flex items-center gap-1.5">
                <span>কাজ চাই / শ্রমিক চাই</span>
                <span className="rounded-full bg-emerald-200/70 text-emerald-800 px-2 py-0.5 text-[10px] font-semibold">
                  স্থানীয় শ্রম বাজার
                </span>
              </h3>
              <p className="text-[11px] text-emerald-700 hidden sm:block">
                আপনার গ্রাম, ওয়ার্ড ও উপজেলার দক্ষ কারিগর ও কাজের সরাসরি সংযোগ
              </p>
            </div>
          </div>

          <button
            onClick={() => openLabourMarketplace('workers')}
            className="flex items-center gap-1 text-xs font-bold text-emerald-800 hover:text-emerald-950 transition"
          >
            <span>সম্পূর্ণ বাজার</span>
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* 4 Large Prominent Buttons requested by user: [কাজ চাই], [শ্রমিক চাই], [শ্রমিক খুঁজুন], [কাজ খুঁজুন] */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-2.5">
          <button
            onClick={() => openLabourMarketplace('register_worker')}
            className="flex flex-col items-center justify-center p-2.5 sm:p-3 rounded-xl sm:rounded-2xl border border-amber-200 bg-white hover:bg-amber-50/80 hover:border-amber-400 text-amber-900 shadow-xs hover:shadow-md transition group"
          >
            <div className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-xl bg-amber-100 text-amber-700 group-hover:scale-110 transition-transform mb-1.5">
              <UserCheck className="h-5 w-5" />
            </div>
            <span className="text-xs sm:text-sm font-bold">🧑‍🔧 কাজ চাই</span>
            <span className="text-[10px] text-amber-700/80 font-medium mt-0.5">শ্রমিক প্রোফাইল</span>
          </button>

          <button
            onClick={() => openLabourMarketplace('post_job')}
            className="flex flex-col items-center justify-center p-2.5 sm:p-3 rounded-xl sm:rounded-2xl border border-purple-200 bg-white hover:bg-purple-50/80 hover:border-purple-400 text-purple-900 shadow-xs hover:shadow-md transition group"
          >
            <div className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-xl bg-purple-100 text-purple-700 group-hover:scale-110 transition-transform mb-1.5">
              <Building2 className="h-5 w-5" />
            </div>
            <span className="text-xs sm:text-sm font-bold">👷 শ্রমিক চাই</span>
            <span className="text-[10px] text-purple-700/80 font-medium mt-0.5">চাহিদা পোস্ট করুন</span>
          </button>

          <button
            onClick={() => openLabourMarketplace('workers')}
            className="flex flex-col items-center justify-center p-2.5 sm:p-3 rounded-xl sm:rounded-2xl border border-emerald-200 bg-white hover:bg-emerald-50/80 hover:border-emerald-400 text-emerald-900 shadow-xs hover:shadow-md transition group"
          >
            <div className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 group-hover:scale-110 transition-transform mb-1.5">
              <Search className="h-5 w-5" />
            </div>
            <span className="text-xs sm:text-sm font-bold">🔍 শ্রমিক খুঁজুন</span>
            <span className="text-[10px] text-emerald-700/80 font-medium mt-0.5">লোকাল ডিরেক্টরি</span>
          </button>

          <button
            onClick={() => openLabourMarketplace('jobs')}
            className="flex flex-col items-center justify-center p-2.5 sm:p-3 rounded-xl sm:rounded-2xl border border-blue-200 bg-white hover:bg-blue-50/80 hover:border-blue-400 text-blue-900 shadow-xs hover:shadow-md transition group"
          >
            <div className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-xl bg-blue-100 text-blue-700 group-hover:scale-110 transition-transform mb-1.5">
              <Briefcase className="h-5 w-5" />
            </div>
            <span className="text-xs sm:text-sm font-bold">📋 কাজ খুঁজুন</span>
            <span className="text-[10px] text-blue-700/80 font-medium mt-0.5">খোলা কাজের সুযোগ</span>
          </button>
        </div>
      </div>

      {/* 2. CREATE POST CARD */}
      <div className="rounded-2xl border border-slate-200/90 bg-white p-3.5 sm:p-4 shadow-xs">
        <div className="flex items-center gap-3">
          <img
            src={currentUser?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100'}
            alt=""
            className="h-10 w-10 shrink-0 rounded-full object-cover ring-2 ring-emerald-500/20"
          />
          <button
            id="trigger-create-post-btn"
            onClick={() => setCreatePostModalOpen(true)}
            className="flex-1 rounded-full border border-slate-200 bg-slate-50/90 px-4 py-2.5 text-left text-xs sm:text-sm text-slate-500 hover:border-emerald-300 hover:bg-white hover:text-slate-700 transition-colors"
          >
            {currentUser?.name ? `${currentUser.name}, আপনার মনে কী আছে?` : 'আপনার মনে কী আছে?'}
          </button>
        </div>

        {/* Action Entry Points */}
        <div className="mt-3 grid grid-cols-3 sm:grid-cols-7 gap-1 border-t border-slate-100 pt-3 text-[11px] font-semibold">
          <button
            onClick={() => setCreatePostModalOpen(true)}
            className="flex items-center justify-center gap-1.5 rounded-lg py-1.5 px-1 text-emerald-700 hover:bg-emerald-50 transition-colors"
            title="ছবি যোগ করুন"
          >
            <Image className="h-4 w-4 text-emerald-600 shrink-0" />
            <span className="truncate">Photo</span>
          </button>

          <button
            onClick={() => setCreatePostModalOpen(true)}
            className="flex items-center justify-center gap-1.5 rounded-lg py-1.5 px-1 text-blue-700 hover:bg-blue-50 transition-colors"
            title="ভিডিও শেয়ার করুন"
          >
            <Video className="h-4 w-4 text-blue-600 shrink-0" />
            <span className="truncate">Video</span>
          </button>

          <button
            onClick={() => setCreatePostModalOpen(true)}
            className="flex items-center justify-center gap-1.5 rounded-lg py-1.5 px-1 text-purple-700 hover:bg-purple-50 transition-colors"
            title="রিলস বা শর্ট ক্লিপ"
          >
            <Film className="h-4 w-4 text-purple-600 shrink-0" />
            <span className="truncate">Reels</span>
          </button>

          <button
            onClick={() => setCreatePostModalOpen(true)}
            className="flex items-center justify-center gap-1.5 rounded-lg py-1.5 px-1 text-amber-700 hover:bg-amber-50 transition-colors"
            title="ফটো অ্যালবাম"
          >
            <FolderPlus className="h-4 w-4 text-amber-600 shrink-0" />
            <span className="truncate">Album</span>
          </button>

          <button
            onClick={() => setCreatePostModalOpen(true)}
            className="flex items-center justify-center gap-1.5 rounded-lg py-1.5 px-1 text-rose-700 hover:bg-rose-50 transition-colors"
            title="লোকেশন ট্যাগ"
          >
            <MapPin className="h-4 w-4 text-rose-600 shrink-0" />
            <span className="truncate">Location</span>
          </button>

          <button
            onClick={() => setCreatePostModalOpen(true)}
            className="flex items-center justify-center gap-1.5 rounded-lg py-1.5 px-1 text-amber-600 hover:bg-amber-50 transition-colors"
            title="অনুভূতি ও কাজ"
          >
            <Smile className="h-4 w-4 text-amber-500 shrink-0" />
            <span className="truncate">Feeling</span>
          </button>

          <button
            onClick={() => setCreatePostModalOpen(true)}
            className="flex items-center justify-center gap-1.5 rounded-lg py-1.5 px-1 text-teal-700 hover:bg-teal-50 transition-colors"
            title="সেবা বা সহায়তা অনুরোধ"
          >
            <HandHeart className="h-4 w-4 text-teal-600 shrink-0" />
            <span className="truncate">Service</span>
          </button>
        </div>
      </div>

      {/* 3. FEED FILTER BAR */}
      <div className="rounded-2xl border border-emerald-200/80 bg-white p-3 sm:p-3.5 shadow-xs space-y-2.5">
        {/* Top bar with Active Location & Detailed Selector Toggle */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 min-w-0">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
              <MapPin className="h-3.5 w-3.5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-slate-900 truncate">
                  {hasLocationFilter ? 'ফিল্টারকৃত এলাকা' : 'সোশ্যাল ফিড (সকল এলাকা)'}
                </span>
                <span className="rounded-full bg-emerald-100 px-2 py-0.2 text-[10px] font-bold text-emerald-800 shrink-0">
                  {filteredPosts.length} পোস্ট
                </span>
              </div>
              <p className="text-[10px] text-slate-500 truncate">
                {hasLocationFilter
                  ? [selectedDivision?.bnName, selectedDistrict?.bnName, selectedUpazila?.bnName, selectedUnion?.bnName, selectedWard?.bnName]
                      .filter(Boolean)
                      .join(' › ')
                  : 'বাংলাদেশজুড়ে সকল জেলা ও উপজেলার পোস্ট'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={handleRefresh}
              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
              title="রিফ্রেশ করুন"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin text-emerald-600' : ''}`} />
            </button>

            <button
              id="feed-toggle-detailed-filter"
              onClick={() => setShowDetailedFilter(!showDetailedFilter)}
              className={`flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-semibold transition-colors ${
                showDetailedFilter
                  ? 'bg-[#0F2942] text-white'
                  : 'border border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              <SlidersHorizontal className="h-3 w-3" />
              <span className="hidden sm:inline">{showDetailedFilter ? 'ফিল্টার বন্ধ' : 'লোকেশন নির্বাচন'}</span>
              <ChevronDown className={`h-3 w-3 transition-transform ${showDetailedFilter ? 'rotate-180' : ''}`} />
            </button>

            {hasLocationFilter && (
              <button
                id="feed-clear-location-filter"
                onClick={resetLocationFilter}
                className="flex items-center gap-1 rounded-lg border border-rose-200 bg-rose-50 px-2 py-1 text-[11px] font-bold text-rose-700 hover:bg-rose-100 transition-colors"
                title="ফিল্টার মুছে ফেলুন"
              >
                <X className="h-3 w-3" />
                <span>রিসেট</span>
              </button>
            )}
          </div>
        </div>

        {/* Detailed Administrative Dropdowns Drawer */}
        {showDetailedFilter && (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50/40 p-3">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-[11px] font-bold text-emerald-900">
                প্রশাসনিক স্তর অনুযায়ী নির্বাচন (বিভাগ › জেলা › উপজেলা › ইউনিয়ন › ওয়ার্ড):
              </span>
              <button
                onClick={resetLocationFilter}
                className="text-[10px] font-bold text-emerald-700 hover:underline"
              >
                সব বাংলাদেশ দেখুন
              </button>
            </div>
            <BangladeshLocationPicker
              value={{
                divisionId: locationFilter.divisionId,
                districtId: locationFilter.districtId,
                upazilaId: locationFilter.upazilaId,
                unionId: locationFilter.unionId,
                wardId: locationFilter.wardId,
              }}
              onChange={val => {
                setLocationFilter({
                  divisionId: val.divisionId,
                  districtId: val.districtId,
                  upazilaId: val.upazilaId,
                  unionId: val.unionId,
                  wardId: val.wardId,
                });
              }}
              showAllOption={true}
              theme="light"
              labels={true}
              includeUnions={true}
              includeWards={true}
            />
          </div>
        )}

        {/* Required Primary Filter Pills:
            সব | কাছাকাছি | আমার জেলা | আমার উপজেলা | বাংলাদেশ | সর্বশেষ | জনপ্রিয় */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs no-scrollbar">
          {[
            { id: 'all', label: 'সব', icon: Globe2 },
            { id: 'nearby', label: 'কাছাকাছি', icon: Navigation },
            { id: 'district', label: 'আমার জেলা', icon: Building },
            { id: 'upazila', label: 'আমার উপজেলা', icon: MapPin },
            { id: 'bangladesh', label: 'বাংলাদেশ', icon: Compass },
            { id: 'latest', label: 'সর্বশেষ', icon: Clock },
            { id: 'popular', label: 'জনপ্রিয়', icon: Flame },
          ].map(tab => {
            const Icon = tab.icon;
            const isTabActive = activeFilterTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => handleFilterTabClick(tab.id as any)}
                className={`flex shrink-0 items-center gap-1 rounded-full px-3 py-1 font-semibold transition-all ${
                  isTabActive
                    ? 'bg-[#0F2942] text-white shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-emerald-50 hover:text-emerald-900'
                }`}
              >
                <Icon className={`h-3 w-3 ${isTabActive ? 'text-emerald-400' : 'text-slate-500'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. POSTS FEED CONTAINER */}
      <div className="space-y-4">
        {/* Loading Skeleton */}
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2].map(n => (
              <div key={n} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs animate-pulse space-y-3">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-slate-200"></div>
                  <div className="space-y-1.5 flex-1">
                    <div className="h-3.5 w-32 rounded-sm bg-slate-200"></div>
                    <div className="h-2.5 w-20 rounded-sm bg-slate-100"></div>
                  </div>
                </div>
                <div className="h-4 w-full rounded-sm bg-slate-100"></div>
                <div className="h-4 w-3/4 rounded-sm bg-slate-100"></div>
                <div className="h-40 rounded-xl bg-slate-200"></div>
              </div>
            ))}
          </div>
        ) : sortedPosts.length === 0 ? (
          /* Empty State */
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center shadow-xs">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
              <MapPin className="h-6 w-6" />
            </div>
            <h3 className="mt-3 text-sm font-bold text-slate-800">
              এখনো কোনো পোস্ট নেই।
            </h3>
            <p className="mt-1 text-xs text-slate-500 max-w-sm mx-auto">
              আপনার এলাকার সামাজিক খবর, অভিজ্ঞতা বা মতামত শেয়ার করে কমিউনিটিতে যুক্ত হোন।
            </p>
            <div className="mt-4 flex justify-center gap-2">
              <button
                onClick={() => setCreatePostModalOpen(true)}
                className="rounded-xl bg-[#0F2942] px-4 py-2 text-xs font-bold text-white hover:bg-slate-800 shadow-xs"
              >
                পোস্ট তৈরি করুন
              </button>
              <button
                onClick={resetLocationFilter}
                className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                সমগ্র বাংলাদেশ দেখুন
              </button>
            </div>
          </div>
        ) : (
          sortedPosts.map(post => <PostCard key={post.id} post={post} />)
        )}
      </div>

      {/* Story Modals */}
      <CreateStoryModal
        isOpen={createStoryModalOpen}
        onClose={() => setCreateStoryModalOpen(false)}
      />

      <StoryViewerModal
        story={selectedStory}
        stories={activeStories}
        onClose={() => setSelectedStory(null)}
        onSelectStory={setSelectedStory}
      />
    </div>
  );
};
