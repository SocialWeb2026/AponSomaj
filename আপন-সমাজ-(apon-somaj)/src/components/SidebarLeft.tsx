import React from 'react';
import { useApp } from '../context/AppContext';
import {
  Home,
  User,
  Users,
  MessageSquare,
  Bell,
  Film,
  Video,
  ShoppingBag,
  Briefcase,
  Wrench,
  GraduationCap,
  Building2,
  LandPlot,
  Sprout,
  PawPrint,
  HeartHandshake,
  HeartPulse,
  Bookmark,
  Settings,
  Shield,
  MapPin,
  Sparkles,
  Layers
} from 'lucide-react';

export const SidebarLeft: React.FC = () => {
  const {
    currentUser,
    activeView,
    setActiveView,
    openUserProfile,
    setEcosystemModalOpen,
    unreadNotificationCount,
    messages
  } = useApp();

  const unreadMessagesCount = messages.filter(
    m => !m.read && currentUser && m.receiverId === currentUser.id
  ).length;

  const mainNavItems = [
    {
      id: 'feed',
      label: 'Home',
      bnLabel: 'হোম ফিড',
      icon: Home,
      badge: null,
      onClick: () => setActiveView('feed'),
      isActive: activeView === 'feed'
    },
    {
      id: 'profile',
      label: 'আমার প্রোফাইল',
      bnLabel: 'Profile',
      icon: User,
      badge: null,
      onClick: () => currentUser && openUserProfile(currentUser.id),
      isActive: activeView === 'profile'
    },
    {
      id: 'friends',
      label: 'Friends',
      bnLabel: 'বন্ধু ও নেটওয়ার্ক',
      icon: Users,
      badge: null,
      onClick: () => setActiveView('friends'),
      isActive: activeView === 'friends'
    },
    {
      id: 'messages',
      label: 'Messages',
      bnLabel: 'মেসেঞ্জার ও চ্যাট',
      icon: MessageSquare,
      badge: unreadMessagesCount > 0 ? unreadMessagesCount : null,
      onClick: () => setActiveView('chat'),
      isActive: activeView === 'chat'
    },
    {
      id: 'notifications',
      label: 'Notifications',
      bnLabel: 'বিজ্ঞপ্তি',
      icon: Bell,
      badge: unreadNotificationCount > 0 ? unreadNotificationCount : null,
      onClick: () => {
        // Can open friends or location hub where notifications reside
        const notifBtn = document.getElementById('nav-notifications-btn');
        if (notifBtn) notifBtn.click();
      },
      isActive: false
    },
    {
      id: 'reels',
      label: 'Reels / Shorts',
      bnLabel: 'রিলস ও শর্টস',
      icon: Film,
      badge: 'নতুন',
      onClick: () => setActiveView('reels'),
      isActive: activeView === 'reels'
    },
    {
      id: 'videos',
      label: 'Videos',
      bnLabel: 'কমিউনিটি ভিডিও',
      icon: Video,
      badge: null,
      onClick: () => setActiveView('videos'),
      isActive: activeView === 'videos'
    },
    {
      id: 'marketplace',
      label: 'Marketplace',
      bnLabel: 'আপন মার্কেটপ্লেস',
      icon: ShoppingBag,
      badge: null,
      onClick: () => setActiveView('marketplace'),
      isActive: activeView === 'marketplace'
    },
    {
      id: 'labour',
      label: 'কাজ চাই / শ্রমিক চাই',
      bnLabel: 'কাজ চাই / শ্রমিক চাই',
      icon: Wrench,
      badge: 'শ্রম বাজার',
      onClick: () => setActiveView('labour'),
      isActive: activeView === 'labour'
    },
    {
      id: 'jobs',
      label: 'কাজ ও সেবা',
      bnLabel: 'Jobs & Services',
      icon: Briefcase,
      badge: 'হট',
      onClick: () => setActiveView('jobs'),
      isActive: activeView === 'jobs'
    },
    {
      id: 'education',
      label: 'শিক্ষা',
      bnLabel: 'Education & Study',
      icon: GraduationCap,
      badge: null,
      onClick: () => setActiveView('groups'),
      isActive: false
    },
    {
      id: 'rent',
      label: 'বাড়ি ভাড়া',
      bnLabel: 'House & Room Rent',
      icon: Building2,
      badge: null,
      onClick: () => setActiveView('marketplace'),
      isActive: false
    },
    {
      id: 'property',
      label: 'Property',
      bnLabel: 'জমি ও সম্পত্তি',
      icon: LandPlot,
      badge: null,
      onClick: () => setActiveView('marketplace'),
      isActive: false
    },
    {
      id: 'agriculture',
      label: 'কৃষি',
      bnLabel: 'Agriculture & Crops',
      icon: Sprout,
      badge: null,
      onClick: () => setActiveView('location_hub'),
      isActive: false
    },
    {
      id: 'animals',
      label: 'পশু-পাখি',
      bnLabel: 'Livestock & Pets',
      icon: PawPrint,
      badge: null,
      onClick: () => setActiveView('marketplace'),
      isActive: false
    },
    {
      id: 'help',
      label: 'সহায়তা',
      bnLabel: 'Help & Blood Relief',
      icon: HeartHandshake,
      badge: 'জরুরি',
      onClick: () => setActiveView('location_hub'),
      isActive: false
    },
    {
      id: 'medical',
      label: 'চিকিৎসা',
      bnLabel: 'Health & Medical',
      icon: HeartPulse,
      badge: null,
      onClick: () => setActiveView('location_hub'),
      isActive: false
    },
    {
      id: 'saved',
      label: 'Saved',
      bnLabel: 'সংরক্ষিত পোস্ট',
      icon: Bookmark,
      badge: null,
      onClick: () => setActiveView('saved'),
      isActive: activeView === 'saved'
    },
    {
      id: 'settings',
      label: 'Settings',
      bnLabel: 'প্রাইভেসি সেটিংস',
      icon: Settings,
      badge: null,
      onClick: () => setActiveView('settings'),
      isActive: activeView === 'settings'
    },
  ];

  return (
    <aside className="sticky top-20 h-[calc(100vh-5.5rem)] w-68 shrink-0 overflow-y-auto pb-10 pr-2 hidden lg:block no-scrollbar">
      {/* Brand Identity Header in Sidebar */}
      <div className="mb-4 rounded-2xl border border-emerald-100/90 bg-gradient-to-br from-[#0F2942] to-[#1E3A5F] p-4 text-white shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-white font-black text-xl shadow-md">
            আ
          </div>
          <div className="min-w-0">
            <h2 className="text-base font-black tracking-tight leading-tight">আপন সমাজ</h2>
            <div className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-300">
              <span>APON SOMAJ</span>
              <span>•</span>
              <span className="text-[10px] text-emerald-200/90">কমিউনিটি</span>
            </div>
            <p className="text-[10px] text-slate-300 font-medium italic mt-0.5">
              &quot;মানুষের জন্য মানুষ&quot;
            </p>
          </div>
        </div>
      </div>

      {/* Profile quick widget */}
      {currentUser && (
        <div
          onClick={() => openUserProfile(currentUser.id)}
          className="mb-4 flex cursor-pointer items-center gap-3 rounded-2xl border border-slate-200/80 bg-white p-3 shadow-2xs transition-all hover:border-emerald-300 hover:shadow-xs"
        >
          <img
            src={currentUser.avatar}
            alt={currentUser.name}
            className="h-10 w-10 rounded-full object-cover ring-2 ring-emerald-500/20"
          />
          <div className="overflow-hidden min-w-0">
            <h4 className="text-xs font-bold text-slate-900 truncate">{currentUser.name}</h4>
            <div className="flex items-center gap-1 text-[11px] text-emerald-700 font-medium">
              <MapPin className="h-3 w-3 shrink-0 text-emerald-600" />
              <span className="truncate">{currentUser.hometown}</span>
            </div>
            <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-0.5">
              <span>{currentUser.friendsCount} বন্ধু</span>
              <span>•</span>
              <span>{currentUser.followersCount} অনুসারী</span>
            </div>
          </div>
        </div>
      )}

      {/* Main Navigation Links */}
      <nav className="space-y-0.5">
        {mainNavItems.map(item => {
          const Icon = item.icon;
          const isActive = item.isActive;
          return (
            <button
              key={item.id}
              id={`sidebar-item-${item.id}`}
              onClick={item.onClick}
              className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-left transition-all ${
                isActive
                  ? 'bg-[#0F2942] text-white font-bold shadow-xs shadow-slate-900/10'
                  : 'text-slate-700 hover:bg-emerald-50/60 hover:text-emerald-950 font-medium'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <Icon
                  className={`h-4.5 w-4.5 shrink-0 ${
                    isActive ? 'text-emerald-400' : 'text-slate-500'
                  }`}
                />
                <div className="min-w-0 truncate">
                  <span className="block text-xs sm:text-[13px] font-bold leading-tight truncate">
                    {item.label}
                  </span>
                  <span
                    className={`block text-[10px] leading-tight truncate ${
                      isActive ? 'text-slate-300' : 'text-slate-400'
                    }`}
                  >
                    {item.bnLabel}
                  </span>
                </div>
              </div>

              {item.badge && (
                <span
                  className={`shrink-0 rounded-full px-2 py-0.5 text-[9px] font-bold ${
                    isActive
                      ? 'bg-emerald-500 text-white'
                      : typeof item.badge === 'number'
                      ? 'bg-emerald-600 text-white'
                      : item.badge === 'জরুরি'
                      ? 'bg-rose-100 text-rose-700'
                      : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}

        {/* Super Admin Panel link if role is admin */}
        {currentUser?.role === 'admin' && (
          <button
            id="sidebar-admin-link"
            onClick={() => setActiveView('admin')}
            className={`mt-2 flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left transition-all ${
              activeView === 'admin'
                ? 'bg-emerald-800 text-white font-semibold'
                : 'bg-[#0B1D30] text-white hover:bg-slate-900 shadow-xs'
            }`}
          >
            <div className="flex items-center gap-3">
              <Shield className="h-4.5 w-4.5 text-emerald-400" />
              <div>
                <span className="block text-xs font-bold leading-tight">অ্যাডমিন প্যানেল</span>
                <span className="block text-[10px] text-emerald-300">Admin Control</span>
              </div>
            </div>
            <span className="rounded-md bg-emerald-700 px-1.5 py-0.5 text-[9px] font-bold text-white uppercase">
              Admin
            </span>
          </button>
        )}
      </nav>

      {/* Apon Ecosystem Promo Card */}
      <div className="mt-5 rounded-2xl border border-emerald-200/80 bg-gradient-to-br from-emerald-600 to-teal-800 p-3.5 text-white shadow-xs">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-amber-300" />
          <h5 className="text-xs font-bold">আপন ইকোসিস্টেম</h5>
        </div>
        <p className="mt-1 text-[11px] text-emerald-100 leading-snug">
          আপন বাজার, আপন ওয়ালেট ও সমন্বিত ডিজিটাল কমিউনিটি।
        </p>
        <button
          id="sidebar-open-ecosystem"
          onClick={() => setEcosystemModalOpen(true)}
          className="mt-2.5 flex w-full items-center justify-center gap-1.5 rounded-xl bg-white py-1.5 text-xs font-bold text-emerald-800 shadow-xs hover:bg-emerald-50 active:scale-95 transition-all"
        >
          <Layers className="h-3.5 w-3.5" />
          <span>সার্ভিসসমূহ দেখুন</span>
        </button>
      </div>

      <div className="mt-4 px-2 text-[10px] text-slate-400 space-y-1">
        <div>আপন সমাজ © ২০২৬ • &quot;মানুষের জন্য মানুষ&quot;</div>
        <div className="flex gap-2 text-slate-500">
          <a href="#" className="hover:underline">শর্তাবলী</a>
          <span>•</span>
          <a href="#" className="hover:underline">গোপনীয়তা</a>
          <span>•</span>
          <a href="#" className="hover:underline">সহায়তা</a>
        </div>
      </div>
    </aside>
  );
};
