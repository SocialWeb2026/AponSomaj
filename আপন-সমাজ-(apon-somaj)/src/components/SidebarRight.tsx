import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Search,
  MapPin,
  UserPlus,
  Briefcase,
  ShoppingBag,
  HeartHandshake,
  Users2,
  Bell,
  MessageCircle,
  ExternalLink,
  LifeBuoy,
  Megaphone,
  CheckCircle2
} from 'lucide-react';

export const SidebarRight: React.FC = () => {
  const {
    currentUser,
    users,
    friendships,
    sendFriendRequest,
    setActiveChatUserId,
    setActiveView,
    openUserProfile,
    jobs,
    marketplaceListings,
    posts,
    groups,
    locationFilter,
    setLocationFilter
  } = useApp();

  const [localSearch, setLocalSearch] = useState('');

  // 1. Suggested People (not current user and not friends already)
  const pendingOrFriends = friendships
    .filter(f => currentUser && (f.requesterId === currentUser.id || f.receiverId === currentUser.id))
    .map(f => (f.requesterId === currentUser?.id ? f.receiverId : f.requesterId));

  const suggestedPeople = users.filter(
    u => currentUser && u.id !== currentUser.id && !pendingOrFriends.includes(u.id)
  );

  // 2. Nearby Services (Jobs & Marketplace in same district if available)
  const nearbyJobs = jobs.filter(j => {
    if (!currentUser?.districtId) return true;
    return j.location?.districtId === currentUser.districtId;
  }).slice(0, 2);

  const nearbyItems = marketplaceListings.filter(m => {
    if (!currentUser?.districtId) return true;
    return m.location?.districtId === currentUser.districtId;
  }).slice(0, 2);

  // 3. Help Requests (Blood / Relief / Urgent Community assistance from posts or tags)
  const helpPosts = posts.filter(p => {
    const text = (p.content || '').toLowerCase();
    return (
      text.includes('জরুরি') ||
      text.includes('সহায়তা') ||
      text.includes('রক্ত') ||
      text.includes('সাহায্য') ||
      text.includes('অক্সিজেন')
    );
  }).slice(0, 2);

  // 4. Volunteer Opportunities (from groups or community activity)
  const volunteerGroups = groups.filter(g => {
    const desc = (g.description || '').toLowerCase() + (g.name || '').toLowerCase();
    return desc.includes('স্বেচ্ছাসেবী') || desc.includes('উন্নয়ন') || desc.includes('সেবা') || desc.includes('যুব');
  }).slice(0, 2);

  // 5. Community Notice (announcements from active groups or districts)
  const activeNotices = groups
    .filter(g => g.announcement)
    .map(g => ({ groupName: g.name, notice: g.announcement! }))
    .slice(0, 2);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const globalInput = document.getElementById('global-search-input') as HTMLInputElement | null;
    if (globalInput) {
      globalInput.value = localSearch;
      globalInput.focus();
      // Dispatch input event
      globalInput.dispatchEvent(new Event('input', { bubbles: true }));
    }
  };

  return (
    <aside className="sticky top-20 h-[calc(100vh-5.5rem)] w-76 shrink-0 overflow-y-auto pb-12 pl-1 hidden xl:block space-y-4 no-scrollbar">
      {/* 1. GLOBAL SEARCH ENTRY POINT */}
      <div className="rounded-2xl border border-slate-200/90 bg-white p-3 shadow-xs">
        <form onSubmit={handleSearchSubmit} className="relative flex items-center">
          <Search className="absolute left-3 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="খুঁজুন (মানুষ, সেবা, কাজ)..."
            value={localSearch}
            onChange={e => setLocalSearch(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-slate-50/80 py-2 pl-9 pr-3 text-xs text-slate-800 placeholder-slate-400 focus:border-emerald-500 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20"
          />
        </form>
      </div>

      {/* 2. PEOPLE YOU MAY KNOW */}
      <div className="rounded-2xl border border-slate-200/90 bg-white p-3.5 shadow-xs">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
          <h4 className="text-xs font-bold text-slate-900">People you may know</h4>
          <button
            onClick={() => setActiveView('friends')}
            className="text-[11px] font-semibold text-emerald-700 hover:underline"
          >
            সব দেখুন
          </button>
        </div>

        <div className="mt-3 space-y-2.5">
          {suggestedPeople.length === 0 ? (
            <p className="text-center text-xs text-slate-400 py-3">বর্তমানে কোনো নতুন সুপারিশ নেই</p>
          ) : (
            suggestedPeople.slice(0, 3).map(person => (
              <div key={person.id} className="flex items-center justify-between gap-2">
                <div
                  onClick={() => openUserProfile(person.id)}
                  className="flex cursor-pointer items-center gap-2.5 min-w-0"
                >
                  <img
                    src={person.avatar}
                    alt={person.name}
                    className="h-8.5 w-8.5 rounded-full object-cover shrink-0 ring-1 ring-emerald-500/20"
                  />
                  <div className="overflow-hidden min-w-0">
                    <span className="block text-xs font-bold text-slate-800 hover:underline truncate">
                      {person.name}
                    </span>
                    <span className="block text-[10px] text-slate-400 truncate">
                      {person.hometown || person.currentDistrict}
                    </span>
                  </div>
                </div>

                <button
                  id={`add-friend-btn-${person.id}`}
                  onClick={() => sendFriendRequest(person.id)}
                  className="flex shrink-0 items-center gap-1 rounded-lg bg-emerald-50 px-2 py-1 text-[11px] font-bold text-emerald-700 hover:bg-emerald-600 hover:text-white transition-colors"
                >
                  <UserPlus className="h-3 w-3" />
                  <span>যুক্ত হন</span>
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* 3. NEARBY SERVICES */}
      <div className="rounded-2xl border border-slate-200/90 bg-white p-3.5 shadow-xs">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
          <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
            <Briefcase className="h-3.5 w-3.5 text-emerald-600" />
            <span>Nearby Services & Jobs</span>
          </h4>
          <button
            onClick={() => setActiveView('jobs')}
            className="text-[11px] font-semibold text-emerald-700 hover:underline"
          >
            সার্ভিস পোর্টাল
          </button>
        </div>

        <div className="mt-3 space-y-2.5">
          {nearbyJobs.length === 0 && nearbyItems.length === 0 ? (
            <p className="text-center text-xs text-slate-400 py-2">
              আপনার এলাকায় কোনো সাম্প্রতিক সার্ভিস নেই
            </p>
          ) : (
            <>
              {nearbyJobs.map(job => (
                <div
                  key={job.id}
                  onClick={() => setActiveView('jobs')}
                  className="group cursor-pointer rounded-xl p-2 transition-colors hover:bg-emerald-50/60 border border-slate-100"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800 group-hover:text-emerald-800 truncate max-w-[170px]">
                      {job.title}
                    </span>
                    <span className="rounded-sm bg-emerald-100 px-1 py-0.2 text-[9px] font-bold text-emerald-800">
                      নিয়োগ
                    </span>
                  </div>
                  <div className="mt-0.5 flex items-center justify-between text-[10px] text-slate-500">
                    <span className="truncate max-w-[140px]">{job.companyName}</span>
                    <span className="font-semibold text-emerald-700">{job.salaryRange}</span>
                  </div>
                </div>
              ))}

              {nearbyItems.map(item => (
                <div
                  key={item.id}
                  onClick={() => setActiveView('marketplace')}
                  className="group cursor-pointer rounded-xl p-2 transition-colors hover:bg-emerald-50/60 border border-slate-100"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800 group-hover:text-emerald-800 truncate max-w-[170px]">
                      {item.title}
                    </span>
                    <span className="font-bold text-emerald-700 text-[11px]">
                      ৳{item.price.toLocaleString()}
                    </span>
                  </div>
                  <div className="mt-0.5 text-[10px] text-slate-500 truncate">
                    ক্যাটাগরি: {item.category}
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
      </div>

      {/* 4. HELP REQUESTS */}
      <div className="rounded-2xl border border-rose-100 bg-rose-50/30 p-3.5 shadow-xs">
        <div className="flex items-center justify-between border-b border-rose-100 pb-2">
          <h4 className="text-xs font-bold text-rose-900 flex items-center gap-1.5">
            <HeartHandshake className="h-3.5 w-3.5 text-rose-600" />
            <span>Help Requests (সহায়তা অনুরোধ)</span>
          </h4>
          <span className="rounded-full bg-rose-100 px-1.5 py-0.2 text-[9px] font-bold text-rose-800">
            জরুরি
          </span>
        </div>

        <div className="mt-2.5 space-y-2">
          {helpPosts.length === 0 ? (
            <p className="text-center text-[11px] text-slate-500 py-2">
              বর্তমানে কোনো জরুরি সহায়তা অনুরোধ নেই।
            </p>
          ) : (
            helpPosts.map(hp => (
              <div
                key={hp.id}
                className="rounded-xl border border-rose-200/70 bg-white p-2.5 text-xs shadow-2xs"
              >
                <div className="font-semibold text-slate-800 line-clamp-2 leading-relaxed text-[11px]">
                  {hp.content}
                </div>
                <div className="mt-1.5 flex items-center justify-between text-[10px] text-slate-400 border-t border-slate-50 pt-1">
                  <span>{users.find(u => u.id === hp.authorId)?.name || 'কমিউনিটি সদস্য'}</span>
                  <button
                    onClick={() => setActiveView('feed')}
                    className="font-bold text-rose-700 hover:underline"
                  >
                    বিবরণ →
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* 5. VOLUNTEER OPPORTUNITIES */}
      <div className="rounded-2xl border border-slate-200/90 bg-white p-3.5 shadow-xs">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
            <LifeBuoy className="h-3.5 w-3.5 text-teal-600" />
            <span>Volunteer Opportunities</span>
          </h4>
          <span className="text-[10px] text-teal-700 font-semibold">স্বেচ্ছাসেবী</span>
        </div>

        <div className="mt-2.5 space-y-2">
          {volunteerGroups.length === 0 ? (
            <div className="text-center py-2 text-[11px] text-slate-400">
              এলাকাভিত্তিক যুব ও উন্নয়ন কর্মকাণ্ডে অংশ নিতে কমিউনিটি গ্রুপে যুক্ত থাকুন।
            </div>
          ) : (
            volunteerGroups.map(vg => (
              <div
                key={vg.id}
                onClick={() => setActiveView('groups')}
                className="group cursor-pointer rounded-xl border border-slate-100 p-2 hover:bg-teal-50/50 transition-colors"
              >
                <div className="text-xs font-bold text-slate-800 group-hover:text-teal-800 truncate">
                  {vg.name}
                </div>
                <div className="text-[10px] text-slate-500 line-clamp-1 mt-0.5">
                  {vg.description}
                </div>
                <div className="mt-1 text-[9px] font-bold text-teal-700">
                  {vg.memberIds.length} জন সদস্য যুক্ত আছেন
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* 6. COMMUNITY NOTICE */}
      <div className="rounded-2xl border border-amber-200/80 bg-amber-50/40 p-3.5 shadow-xs">
        <div className="flex items-center justify-between border-b border-amber-200/60 pb-2">
          <h4 className="text-xs font-bold text-amber-950 flex items-center gap-1.5">
            <Megaphone className="h-3.5 w-3.5 text-amber-700" />
            <span>Community Notice (নোটিশ বোর্ড)</span>
          </h4>
          <span className="rounded-full bg-amber-200/80 px-1.5 py-0.2 text-[9px] font-bold text-amber-900">
            অফিশিয়াল
          </span>
        </div>

        <div className="mt-2.5 space-y-2">
          {activeNotices.length === 0 ? (
            <div className="text-center py-2 text-[11px] text-slate-500">
              কমিউনিটি সতর্কতা বা বিজ্ঞপ্তি প্রকাশ করা হলে এখানে দেখা যাবে।
            </div>
          ) : (
            activeNotices.map((n, i) => (
              <div key={i} className="rounded-xl border border-amber-200/60 bg-white p-2.5 shadow-2xs">
                <div className="text-[10px] font-bold text-amber-900 truncate">
                  {n.groupName}
                </div>
                <p className="mt-1 text-[11px] text-slate-700 leading-relaxed">
                  {n.notice}
                </p>
              </div>
            ))
          )}
        </div>
      </div>
    </aside>
  );
};
