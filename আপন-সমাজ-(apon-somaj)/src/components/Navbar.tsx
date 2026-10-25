import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { BangladeshLocationPicker } from './BangladeshLocationPicker';
import {
  Search,
  MapPin,
  Bell,
  MessageSquare,
  Shield,
  Layers,
  ChevronDown,
  User as UserIcon,
  Settings,
  LogOut,
  UserCheck,
  Check,
  X,
  Bookmark,
  Briefcase,
  ShoppingBag,
  HeartHandshake,
  Users,
  Building,
  SlidersHorizontal,
  FileText
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const {
    currentUser,
    users,
    switchUser,
    logout,
    activeView,
    setActiveView,
    openUserProfile,
    setAuthModalOpen,
    setEcosystemModalOpen,
    divisions,
    districts,
    upazilas,
    unions,
    wards,
    locationFilter,
    setLocationFilter,
    resetLocationFilter,
    notifications,
    markNotificationRead,
    markAllNotificationsRead,
    unreadNotificationCount,
    messages,
    setActiveChatUserId,
    posts,
    groups,
    pages,
    jobs,
    marketplaceListings,
    matrimonyProfiles
  } = useApp();

  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchCategory, setSearchCategory] = useState<'all' | 'users' | 'posts' | 'groups' | 'pages' | 'jobs' | 'marketplace'>('all');
  const [searchLocFilter, setSearchLocFilter] = useState<{
    divisionId?: string;
    districtId?: string;
    upazilaId?: string;
    unionId?: string;
    wardId?: string;
  }>({});
  const [showSearchLocPicker, setShowSearchLocPicker] = useState(false);
  const [locationDropdownOpen, setLocationDropdownOpen] = useState(false);
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [switchUserModalOpen, setSwitchUserModalOpen] = useState(false);

  const searchRef = useRef<HTMLDivElement>(null);
  const locationRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const userRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) setSearchOpen(false);
      if (locationRef.current && !locationRef.current.contains(e.target as Node)) setLocationDropdownOpen(false);
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setNotifDropdownOpen(false);
      if (userRef.current && !userRef.current.contains(e.target as Node)) setUserDropdownOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filtered dropdown lists for location selection
  const selectedDivision = divisions.find(d => d.id === locationFilter.divisionId);
  const selectedDistrict = districts.find(d => d.id === locationFilter.districtId);
  const selectedUpazila = upazilas.find(u => u.id === locationFilter.upazilaId);
  const selectedUnion = unions.find(un => un.id === locationFilter.unionId);
  const selectedWard = wards.find(w => w.id === locationFilter.wardId);

  const hasSearchLocFilter = Boolean(
    searchLocFilter.divisionId ||
    searchLocFilter.districtId ||
    searchLocFilter.upazilaId ||
    searchLocFilter.unionId ||
    searchLocFilter.wardId
  );

  const isLocMatch = (loc?: {
    divisionId?: string;
    districtId?: string;
    upazilaId?: string;
    unionId?: string;
    wardId?: string;
  }) => {
    if (!hasSearchLocFilter) return true;
    if (!loc) return false;
    if (searchLocFilter.wardId && loc.wardId !== searchLocFilter.wardId) return false;
    if (searchLocFilter.unionId && loc.unionId !== searchLocFilter.unionId) return false;
    if (searchLocFilter.upazilaId && loc.upazilaId !== searchLocFilter.upazilaId) return false;
    if (searchLocFilter.districtId && loc.districtId !== searchLocFilter.districtId) return false;
    if (searchLocFilter.divisionId && loc.divisionId !== searchLocFilter.divisionId) return false;
    return true;
  };

  const q = searchQuery.toLowerCase().trim();

  // Search Results
  const matchingUsers = q
    ? users.filter(u => {
        const textMatch =
          u.name.toLowerCase().includes(q) ||
          u.username.toLowerCase().includes(q) ||
          (u.bnName && u.bnName.includes(searchQuery)) ||
          u.hometown.toLowerCase().includes(q) ||
          Boolean(u.currentDistrict && u.currentDistrict.toLowerCase().includes(q));
        if (!textMatch) return false;
        return isLocMatch({
          divisionId: u.divisionId,
          districtId: u.districtId,
          upazilaId: u.upazilaId,
          unionId: u.unionId,
          wardId: u.wardId,
        });
      })
    : [];

  const matchingPosts = q
    ? posts.filter(p => {
        const textMatch =
          p.content.toLowerCase().includes(q) ||
          Boolean(p.location?.divisionName?.toLowerCase().includes(q)) ||
          Boolean(p.location?.districtName?.toLowerCase().includes(q)) ||
          Boolean(p.location?.upazilaName?.toLowerCase().includes(q)) ||
          Boolean(p.location?.unionName?.toLowerCase().includes(q)) ||
          Boolean(p.location?.wardName?.toLowerCase().includes(q));
        if (!textMatch) return false;
        return isLocMatch(p.location);
      })
    : [];

  const formatLocationTag = (loc?: any): string => {
    if (!loc) return '';
    if (typeof loc === 'string') return loc;
    return (
      [loc.wardName, loc.unionName, loc.upazilaName, loc.districtName, loc.divisionName].filter(Boolean).join(', ') ||
      loc.customText ||
      ''
    );
  };

  const matchingGroups = q
    ? groups.filter(g => {
        const textMatch =
          g.name.toLowerCase().includes(q) ||
          Boolean(g.bnName && g.bnName.includes(searchQuery)) ||
          g.description.toLowerCase().includes(q) ||
          g.category.toLowerCase().includes(q) ||
          formatLocationTag(g.location).toLowerCase().includes(q);
        if (!textMatch) return false;
        return isLocMatch(g.location);
      })
    : [];

  const matchingPages = q
    ? pages.filter(p => {
        const textMatch =
          p.name.toLowerCase().includes(q) ||
          Boolean(p.bnName && p.bnName.includes(searchQuery)) ||
          p.description.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          formatLocationTag(p.location).toLowerCase().includes(q);
        if (!textMatch) return false;
        return isLocMatch(p.location);
      })
    : [];

  const matchingJobs = q
    ? jobs.filter(j => {
        const textMatch =
          j.title.toLowerCase().includes(q) ||
          j.companyName.toLowerCase().includes(q) ||
          formatLocationTag(j.location).toLowerCase().includes(q) ||
          j.description.toLowerCase().includes(q);
        if (!textMatch) return false;
        return isLocMatch(j.location);
      })
    : [];

  const matchingMarketplace = q
    ? marketplaceListings.filter(m => {
        const textMatch =
          m.title.toLowerCase().includes(q) ||
          m.description.toLowerCase().includes(q) ||
          m.category.toLowerCase().includes(q) ||
          formatLocationTag(m.location).toLowerCase().includes(q);
        if (!textMatch) return false;
        return isLocMatch(m.location);
      })
    : [];

  const hasAnyFilter = Boolean(
    locationFilter.divisionId ||
    locationFilter.districtId ||
    locationFilter.upazilaId ||
    locationFilter.unionId ||
    locationFilter.wardId
  );

  // Unread messages count
  const unreadMessagesCount = messages.filter(
    m => !m.read && currentUser && m.receiverId === currentUser.id
  ).length;

  return (
    <header className="sticky top-0 z-40 border-b border-emerald-100/80 bg-white/95 backdrop-blur-md shadow-xs">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-3 sm:px-6">
        {/* Left: Brand Identity */}
        <div className="flex items-center gap-2 sm:gap-4">
          <div
            onClick={() => {
              setActiveView('feed');
              resetLocationFilter();
            }}
            className="group flex cursor-pointer items-center gap-2.5 select-none"
            id="apon-somaj-logo"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#0F2942] to-emerald-700 text-white font-bold shadow-md shadow-slate-900/10 group-hover:scale-105 transition-transform">
              <span className="text-xl leading-none">আ</span>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-lg font-black tracking-tight text-[#0F2942] sm:text-xl">
                  আপন সমাজ
                </span>
                <span className="hidden text-xs font-bold text-emerald-800 sm:inline-block rounded-md bg-emerald-50 px-1.5 py-0.5 border border-emerald-200/50">
                  APON SOMAJ
                </span>
              </div>
              <p className="hidden text-[10px] font-semibold text-emerald-700 sm:block">
                &quot;মানুষের জন্য মানুষ&quot;
              </p>
            </div>
          </div>

          {/* Apon Ecosystem launcher button */}
          <button
            id="open-ecosystem-menu-btn"
            onClick={() => setEcosystemModalOpen(true)}
            className="hidden lg:flex items-center gap-1.5 rounded-lg border border-emerald-200/80 bg-emerald-50/70 px-2.5 py-1.5 text-xs font-semibold text-emerald-800 transition-colors hover:bg-emerald-100/80 active:scale-95"
            title="Apon Ecosystem Applications"
          >
            <Layers className="h-3.5 w-3.5 text-emerald-600" />
            <span>ইকোসিস্টেম</span>
          </button>
        </div>

        {/* Center: Search & Location Filter */}
        <div className="flex flex-1 items-center justify-center max-w-xl px-2">
          {/* Global Search Bar */}
          <div ref={searchRef} className="relative w-full max-w-sm sm:max-w-md">
            <div className="relative flex items-center">
              <Search className="absolute left-3 h-4 w-4 text-slate-400" />
              <input
                id="global-search-input"
                type="text"
                placeholder="খুঁজুন (মানুষ, এলাকা, পোস্ট, গ্রুপ, কাজ)..."
                value={searchQuery}
                onChange={e => {
                  setSearchQuery(e.target.value);
                  setSearchOpen(true);
                }}
                onFocus={() => setSearchOpen(true)}
                className="w-full rounded-full border border-slate-200 bg-slate-50/80 py-2 pl-9 pr-8 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:border-emerald-500 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 text-slate-400 hover:text-slate-600"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            {/* Live Search Popup */}
            {searchOpen && searchQuery.trim().length > 0 && (
              <div className="absolute top-12 left-0 right-0 sm:-left-12 sm:-right-12 max-h-[500px] overflow-y-auto rounded-2xl border border-slate-200 bg-white p-3 shadow-2xl z-50">
                {/* Search Header & Location Filter Toggle */}
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
                  <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    অনুসন্ধান ফলাফল ({matchingUsers.length + matchingPosts.length + matchingGroups.length + matchingPages.length + matchingJobs.length + matchingMarketplace.length})
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setShowSearchLocPicker(!showSearchLocPicker)}
                      className={`flex items-center gap-1 rounded-lg px-2 py-1 text-[10px] font-bold transition-all ${
                        hasSearchLocFilter || showSearchLocPicker
                          ? 'bg-emerald-600 text-white'
                          : 'border border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <MapPin className="h-3 w-3" />
                      <span>{hasSearchLocFilter ? 'লোকেশন ফিল্টার সক্রিয়' : 'এলাকা ফিল্টার'}</span>
                    </button>
                    {hasSearchLocFilter && (
                      <button
                        type="button"
                        onClick={() => setSearchLocFilter({})}
                        className="rounded-lg border border-rose-200 bg-rose-50 px-1.5 py-0.5 text-[10px] font-bold text-rose-700 hover:bg-rose-100"
                        title="ফিল্টার ক্লিয়ার করুন"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Search Location Filter Drawer */}
                {showSearchLocPicker && (
                  <div className="my-2 rounded-xl border border-emerald-200 bg-emerald-50/50 p-2.5 text-xs">
                    <div className="mb-1.5 flex items-center justify-between text-[11px] font-bold text-emerald-900">
                      <span>নির্দিষ্ট প্রশাসনিক এলাকার ফলাফল ফিল্টার:</span>
                      {hasSearchLocFilter && (
                        <button
                          onClick={() => setSearchLocFilter({})}
                          className="text-rose-600 hover:underline text-[10px]"
                        >
                          সব বাংলাদেশ
                        </button>
                      )}
                    </div>
                    <BangladeshLocationPicker
                      value={searchLocFilter}
                      onChange={setSearchLocFilter}
                      showAllOption={true}
                      theme="light"
                      labels={true}
                      includeUnions={true}
                      includeWards={true}
                    />
                  </div>
                )}

                {/* Category Filter Pills */}
                <div className="my-2 flex items-center gap-1 overflow-x-auto pb-1 text-[11px] no-scrollbar">
                  {[
                    { id: 'all', label: 'সবগুলো' },
                    { id: 'users', label: `মানুষ (${matchingUsers.length})` },
                    { id: 'posts', label: `পোস্ট (${matchingPosts.length})` },
                    { id: 'groups', label: `গ্রুপ (${matchingGroups.length})` },
                    { id: 'pages', label: `পেজ (${matchingPages.length})` },
                    { id: 'jobs', label: `চাকরি (${matchingJobs.length})` },
                    { id: 'marketplace', label: `মার্কেট (${matchingMarketplace.length})` },
                  ].map(tab => (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setSearchCategory(tab.id as any)}
                      className={`shrink-0 rounded-full px-2.5 py-0.5 font-semibold transition-colors ${
                        searchCategory === tab.id
                          ? 'bg-emerald-600 text-white'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                {/* Empty Results */}
                {matchingUsers.length === 0 &&
                  matchingPosts.length === 0 &&
                  matchingGroups.length === 0 &&
                  matchingPages.length === 0 &&
                  matchingJobs.length === 0 &&
                  matchingMarketplace.length === 0 && (
                    <div className="p-6 text-center text-xs text-slate-500">
                      &quot;{searchQuery}&quot; দিয়ে{hasSearchLocFilter ? ' এই নির্দিষ্ট এলাকায়' : ''} কোনো ফলাফল পাওয়া যায়নি।
                    </div>
                  )}

                {/* People (Users) */}
                {(searchCategory === 'all' || searchCategory === 'users') && matchingUsers.length > 0 && (
                  <div className="mb-2">
                    <div className="px-2 py-1 text-[11px] font-bold text-emerald-800">মানুষ (People)</div>
                    {matchingUsers.slice(0, 4).map(u => (
                      <div
                        key={u.id}
                        onClick={() => {
                          openUserProfile(u.id);
                          setSearchOpen(false);
                        }}
                        className="flex cursor-pointer items-center justify-between rounded-xl p-2 hover:bg-emerald-50/70 transition-colors"
                      >
                        <div className="flex items-center gap-2.5">
                          <img src={u.avatar} alt={u.name} className="h-8 w-8 rounded-full object-cover ring-1 ring-emerald-500/20" />
                          <div>
                            <div className="text-xs font-bold text-slate-800">{u.name}</div>
                            <div className="text-[10px] text-slate-500">@{u.username}</div>
                          </div>
                        </div>
                        {u.hometown && (
                          <span className="flex items-center gap-1 rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-600">
                            <MapPin className="h-2.5 w-2.5 text-emerald-600" />
                            {u.hometown}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Posts */}
                {(searchCategory === 'all' || searchCategory === 'posts') && matchingPosts.length > 0 && (
                  <div className="mb-2 border-t border-slate-100 pt-2">
                    <div className="px-2 py-1 text-[11px] font-bold text-emerald-800">পোস্ট সমূহ (Posts)</div>
                    {matchingPosts.slice(0, 4).map(p => (
                      <div
                        key={p.id}
                        onClick={() => {
                          setActiveView('feed');
                          setSearchOpen(false);
                        }}
                        className="cursor-pointer rounded-xl p-2 hover:bg-emerald-50/70 transition-colors space-y-1"
                      >
                        <p className="text-xs text-slate-700 line-clamp-2">{p.content}</p>
                        {p.location && (
                          <div className="flex items-center gap-1 text-[10px] text-emerald-700 font-medium">
                            <MapPin className="h-2.5 w-2.5" />
                            <span>
                              {[p.location.divisionName, p.location.districtName, p.location.upazilaName].filter(Boolean).join(' • ')}
                            </span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Groups */}
                {(searchCategory === 'all' || searchCategory === 'groups') && matchingGroups.length > 0 && (
                  <div className="mb-2 border-t border-slate-100 pt-2">
                    <div className="px-2 py-1 text-[11px] font-bold text-emerald-800">কমিউনিটি ও গ্রুপ (Groups)</div>
                    {matchingGroups.slice(0, 3).map(g => (
                      <div
                        key={g.id}
                        onClick={() => {
                          setActiveView('groups');
                          setSearchOpen(false);
                        }}
                        className="flex cursor-pointer items-center justify-between rounded-xl p-2 hover:bg-emerald-50/70 transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
                            <Users className="h-4 w-4" />
                          </div>
                          <div>
                            <div className="text-xs font-bold text-slate-800">{g.name}</div>
                            <div className="text-[10px] text-slate-500">{g.category}</div>
                          </div>
                        </div>
                        {g.location && (
                          <span className="text-[10px] text-emerald-700 font-medium">{formatLocationTag(g.location)}</span>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Pages */}
                {(searchCategory === 'all' || searchCategory === 'pages') && matchingPages.length > 0 && (
                  <div className="mb-2 border-t border-slate-100 pt-2">
                    <div className="px-2 py-1 text-[11px] font-bold text-emerald-800">পাবলিক পেজ (Pages)</div>
                    {matchingPages.slice(0, 3).map(pg => (
                      <div
                        key={pg.id}
                        onClick={() => {
                          setActiveView('pages');
                          setSearchOpen(false);
                        }}
                        className="flex cursor-pointer items-center justify-between rounded-xl p-2 hover:bg-emerald-50/70 transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-100 text-teal-700">
                            <Building className="h-4 w-4" />
                          </div>
                          <div>
                            <div className="text-xs font-bold text-slate-800">{pg.name}</div>
                            <div className="text-[10px] text-slate-500">{pg.category}</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Jobs */}
                {(searchCategory === 'all' || searchCategory === 'jobs') && matchingJobs.length > 0 && (
                  <div className="mb-2 border-t border-slate-100 pt-2">
                    <div className="px-2 py-1 text-[11px] font-bold text-emerald-800">চাকরি ও নিয়োগ (Jobs)</div>
                    {matchingJobs.slice(0, 3).map(j => (
                      <div
                        key={j.id}
                        onClick={() => {
                          setActiveView('jobs');
                          setSearchOpen(false);
                        }}
                        className="flex cursor-pointer items-center justify-between rounded-xl p-2 hover:bg-emerald-50/70 transition-colors"
                      >
                        <div>
                          <div className="text-xs font-bold text-slate-800">{j.title}</div>
                          <div className="text-[10px] text-slate-500">{j.companyName} • {j.salaryRange}</div>
                        </div>
                        {j.location && (
                          <span className="flex items-center gap-1 text-[10px] text-emerald-700 font-medium">
                            <MapPin className="h-2.5 w-2.5" />
                            {formatLocationTag(j.location)}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Marketplace */}
                {(searchCategory === 'all' || searchCategory === 'marketplace') && matchingMarketplace.length > 0 && (
                  <div className="border-t border-slate-100 pt-2">
                    <div className="px-2 py-1 text-[11px] font-bold text-emerald-800">মার্কেটপ্লেস পণ্য (Marketplace)</div>
                    {matchingMarketplace.slice(0, 3).map(m => (
                      <div
                        key={m.id}
                        onClick={() => {
                          setActiveView('marketplace');
                          setSearchOpen(false);
                        }}
                        className="flex cursor-pointer items-center justify-between rounded-xl p-2 hover:bg-emerald-50/70 transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-100 text-amber-700">
                            <ShoppingBag className="h-4 w-4" />
                          </div>
                          <div>
                            <div className="text-xs font-bold text-slate-800">{m.title}</div>
                            <div className="text-[10px] text-emerald-700 font-bold">৳{m.price.toLocaleString()}</div>
                          </div>
                        </div>
                        {m.location && (
                          <span className="text-[10px] text-slate-500">{formatLocationTag(m.location)}</span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right: Actions, Location Selector & User Menu */}
        <div className="flex items-center gap-1.5 sm:gap-3">
          {/* Bangladesh Location Filter Pill */}
          <div ref={locationRef} className="relative">
            <button
              id="location-filter-dropdown-btn"
              onClick={() => setLocationDropdownOpen(!locationDropdownOpen)}
              className={`flex items-center gap-1 sm:gap-1.5 rounded-full px-2.5 py-1.5 text-xs font-medium transition-all ${
                hasAnyFilter
                  ? 'border border-emerald-500 bg-emerald-600 text-white shadow-xs'
                  : 'border border-slate-200 bg-slate-50 text-slate-700 hover:border-emerald-300 hover:bg-emerald-50/50'
              }`}
              title="Filter by Bangladesh Location"
            >
              <MapPin className={`h-3.5 w-3.5 ${hasAnyFilter ? 'text-white' : 'text-emerald-600'}`} />
              <span className="max-w-[80px] sm:max-w-[130px] truncate">
                {selectedWard?.bnName ||
                  selectedUnion?.bnName ||
                  selectedUpazila?.bnName ||
                  selectedDistrict?.bnName ||
                  selectedDivision?.bnName ||
                  'সমগ্র বাংলাদেশ'}
              </span>
              <ChevronDown className="h-3 w-3 opacity-80" />
            </button>

            {/* Hierarchical Location Dropdown */}
            {locationDropdownOpen && (
              <div className="absolute right-0 top-11 w-80 sm:w-96 rounded-2xl border border-slate-200 bg-white p-4 shadow-2xl z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
                      <MapPin className="h-4 w-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">স্থান ভিত্তিক কন্টেন্ট নির্বাচন</h4>
                      <p className="text-[10px] text-slate-500">Division → District → Upazila → Union → Ward</p>
                    </div>
                  </div>
                  {hasAnyFilter && (
                    <button
                      id="reset-location-filter-btn"
                      onClick={() => {
                        resetLocationFilter();
                        setLocationDropdownOpen(false);
                      }}
                      className="text-[11px] font-semibold text-rose-600 hover:underline"
                    >
                      রিসেট
                    </button>
                  )}
                </div>

                {/* All Bangladesh Quick Button */}
                <button
                  id="select-all-bangladesh-btn"
                  onClick={() => {
                    resetLocationFilter();
                    setLocationDropdownOpen(false);
                  }}
                  className={`mt-3 flex w-full items-center justify-between rounded-xl px-3 py-2 text-xs font-medium transition-colors ${
                    !hasAnyFilter
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-emerald-400"></span>
                    সমগ্র বাংলাদেশ (All Bangladesh)
                  </span>
                  {!hasAnyFilter && <Check className="h-4 w-4" />}
                </button>

                <div className="mt-3">
                  <BangladeshLocationPicker
                    value={locationFilter}
                    onChange={setLocationFilter}
                    showAllOption={true}
                    labels={true}
                    includeUnions={true}
                    includeWards={true}
                    theme="light"
                  />
                </div>

                <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
                  <button
                    onClick={() => {
                      setActiveView('location_hub');
                      setLocationDropdownOpen(false);
                    }}
                    className="text-xs font-semibold text-emerald-700 hover:underline"
                  >
                    লোকাল হাব পেজ দেখুন →
                  </button>
                  <button
                    onClick={() => setLocationDropdownOpen(false)}
                    className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700"
                  >
                    ফিল্টার প্রয়োগ করুন
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Messenger Chat Icon */}
          <button
            id="nav-chat-btn"
            onClick={() => setActiveView('chat')}
            className={`relative rounded-full p-2 text-slate-600 transition-colors hover:bg-emerald-50 hover:text-emerald-700 ${
              activeView === 'chat' ? 'bg-emerald-100 text-emerald-800' : ''
            }`}
            title="Messages"
          >
            <MessageSquare className="h-5 w-5" />
            {unreadMessagesCount > 0 && (
              <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-600 text-[10px] font-bold text-white">
                {unreadMessagesCount}
              </span>
            )}
          </button>

          {/* Notifications Bell */}
          <div ref={notifRef} className="relative">
            <button
              id="nav-notifications-btn"
              onClick={() => setNotifDropdownOpen(!notifDropdownOpen)}
              className="relative rounded-full p-2 text-slate-600 transition-colors hover:bg-emerald-50 hover:text-emerald-700"
              title="Notifications"
            >
              <Bell className="h-5 w-5" />
              {unreadNotificationCount > 0 && (
                <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white ring-2 ring-white">
                  {unreadNotificationCount}
                </span>
              )}
            </button>

            {/* Notifications Dropdown */}
            {notifDropdownOpen && (
              <div className="absolute right-0 top-11 w-80 sm:w-96 rounded-2xl border border-slate-200 bg-white p-3 shadow-2xl z-50">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                  <div className="flex items-center gap-1.5">
                    <h4 className="text-sm font-bold text-slate-900">বিজ্ঞপ্তি (Notifications)</h4>
                    {unreadNotificationCount > 0 && (
                      <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                        {unreadNotificationCount} নতুন
                      </span>
                    )}
                  </div>
                  <button
                    id="mark-all-read-btn"
                    onClick={markAllNotificationsRead}
                    className="text-xs font-semibold text-emerald-700 hover:underline"
                  >
                    সব পঠিত করুন
                  </button>
                </div>

                <div className="mt-2 max-h-80 overflow-y-auto divide-y divide-slate-100">
                  {notifications.length === 0 ? (
                    <div className="py-8 text-center text-xs text-slate-400">কোনো বিজ্ঞপ্তি নেই</div>
                  ) : (
                    notifications.map(n => {
                      const actor = users.find(u => u.id === n.actorId);
                      return (
                        <div
                          key={n.id}
                          onClick={() => {
                            markNotificationRead(n.id);
                            if (n.type === 'message') setActiveView('chat');
                            if (n.type === 'friend_request') setActiveView('friends');
                            if (n.type === 'marketplace') setActiveView('marketplace');
                            setNotifDropdownOpen(false);
                          }}
                          className={`flex cursor-pointer items-start gap-3 p-2.5 transition-colors hover:bg-slate-50 rounded-xl ${
                            !n.read ? 'bg-emerald-50/60' : ''
                          }`}
                        >
                          <img
                            src={actor?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100'}
                            alt=""
                            className="h-9 w-9 rounded-full object-cover shrink-0"
                          />
                          <div className="flex-1">
                            <p className="text-xs font-semibold text-slate-900">{n.title}</p>
                            <p className="text-[11px] text-slate-600 line-clamp-1 mt-0.5">{n.content}</p>
                            <span className="text-[10px] text-slate-400 mt-1 block">{n.createdAt}</span>
                          </div>
                          {!n.read && (
                            <span className="h-2 w-2 rounded-full bg-emerald-600 shrink-0 mt-1.5"></span>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User Profile Avatar / Dropdown */}
          <div ref={userRef} className="relative">
            {currentUser ? (
              <button
                id="nav-user-menu-btn"
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center gap-2 rounded-full border border-slate-200 p-0.5 transition-all hover:border-emerald-400 focus:outline-hidden"
              >
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  className="h-8 w-8 rounded-full object-cover"
                />
                <span className="hidden md:inline-block max-w-[100px] truncate text-xs font-semibold text-slate-800 pr-1.5">
                  {currentUser.name}
                </span>
                <ChevronDown className="hidden md:inline-block h-3 w-3 text-slate-400 pr-1" />
              </button>
            ) : (
              <button
                onClick={() => setAuthModalOpen(true)}
                className="rounded-full bg-emerald-600 px-4 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-emerald-700"
              >
                লগইন / রেজিস্টার
              </button>
            )}

            {/* User Dropdown Menu */}
            {userDropdownOpen && currentUser && (
              <div className="absolute right-0 top-11 w-64 rounded-2xl border border-slate-200 bg-white p-2 shadow-2xl z-50">
                <div
                  onClick={() => {
                    openUserProfile(currentUser.id);
                    setUserDropdownOpen(false);
                  }}
                  className="flex cursor-pointer items-center gap-3 rounded-xl p-2.5 transition-colors hover:bg-emerald-50/60"
                >
                  <img src={currentUser.avatar} alt="" className="h-11 w-11 rounded-full object-cover" />
                  <div className="overflow-hidden">
                    <p className="text-sm font-bold text-slate-900 truncate">{currentUser.name}</p>
                    <p className="text-xs text-slate-500 truncate">@{currentUser.username}</p>
                    <span className="inline-block mt-0.5 rounded-md bg-emerald-100 px-1.5 py-0.2 text-[10px] font-semibold text-emerald-800">
                      {currentUser.currentDistrict || 'বাংলাদেশ'}
                    </span>
                  </div>
                </div>

                <div className="my-1.5 border-t border-slate-100"></div>

                <div className="space-y-0.5 text-xs">
                  <button
                    onClick={() => {
                      openUserProfile(currentUser.id);
                      setUserDropdownOpen(false);
                    }}
                    className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-slate-700 hover:bg-slate-100"
                  >
                    <UserIcon className="h-4 w-4 text-emerald-600" />
                    <span>আমার প্রোফাইল (Profile)</span>
                  </button>

                  <button
                    onClick={() => {
                      setSwitchUserModalOpen(true);
                      setUserDropdownOpen(false);
                    }}
                    className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-slate-700 hover:bg-slate-100"
                  >
                    <UserCheck className="h-4 w-4 text-teal-600" />
                    <span>আইডি পরিবর্তন করুন (Switch Demo User)</span>
                  </button>

                  {/* Super Admin Dashboard Link */}
                  {currentUser.role === 'admin' && (
                    <button
                      id="admin-dashboard-btn"
                      onClick={() => {
                        setActiveView('admin');
                        setUserDropdownOpen(false);
                      }}
                      className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-emerald-900 bg-emerald-50 font-semibold hover:bg-emerald-100"
                    >
                      <Shield className="h-4 w-4 text-emerald-700" />
                      <span>সুপার অ্যাডমিন প্যানেল (Admin Panel)</span>
                    </button>
                  )}

                  <button
                    onClick={() => {
                      setActiveView('saved');
                      setUserDropdownOpen(false);
                    }}
                    className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-slate-700 hover:bg-slate-100"
                  >
                    <Bookmark className="h-4 w-4 text-slate-500" />
                    <span>সংরক্ষিত পোস্ট (Saved)</span>
                  </button>

                  <button
                    onClick={() => {
                      setActiveView('settings');
                      setUserDropdownOpen(false);
                    }}
                    className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-slate-700 hover:bg-slate-100"
                  >
                    <Settings className="h-4 w-4 text-slate-500" />
                    <span>প্রাইভেসি ও সেটিংস (Privacy & Settings)</span>
                  </button>

                  <div className="my-1 border-t border-slate-100"></div>

                  <button
                    onClick={() => {
                      logout();
                      setUserDropdownOpen(false);
                      setAuthModalOpen(true);
                    }}
                    className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-rose-600 hover:bg-rose-50"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>লগআউট (Logout)</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Switch Demo User Modal */}
      {switchUserModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900">ব্যবহারকারী পরিবর্তন করুন (Demo Account Switcher)</h3>
              <button
                onClick={() => setSwitchUserModalOpen(false)}
                className="rounded-full p-1 text-slate-400 hover:bg-slate-100"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <p className="text-xs text-slate-500 my-3">
              বিভিন্ন জেলা ও রোল (Super Admin, User, Moderator) থেকে আপন সমাজের অভিজ্ঞতা পরীক্ষা করতে নিচের যে কোনো আইডিতে ক্লিক করুন:
            </p>
            <div className="space-y-2">
              {users.map(u => (
                <div
                  key={u.id}
                  onClick={async () => {
                    const ok = await switchUser(u.id);
                    setSwitchUserModalOpen(false);
                    if (!ok) {
                      console.warn(`[Demo Switcher] Could not authenticate ${u.name} in Supabase Auth.`);
                    }
                  }}
                  className={`flex cursor-pointer items-center justify-between rounded-xl border p-2.5 transition-all ${
                    currentUser?.id === u.id
                      ? 'border-emerald-500 bg-emerald-50/60 shadow-xs'
                      : 'border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <img src={u.avatar} alt={u.name} className="h-10 w-10 rounded-full object-cover" />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-900">{u.name}</span>
                        {u.role === 'admin' && (
                          <span className="rounded-md bg-amber-100 px-1.5 py-0.2 text-[10px] font-bold text-amber-800">
                            Super Admin
                          </span>
                        )}
                        {u.role === 'moderator' && (
                          <span className="rounded-md bg-blue-100 px-1.5 py-0.2 text-[10px] font-bold text-blue-800">
                            Moderator
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-slate-500">
                        {u.hometown} • {u.currentDistrict}
                      </span>
                    </div>
                  </div>
                  {currentUser?.id === u.id && <Check className="h-4 w-4 text-emerald-600" />}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
