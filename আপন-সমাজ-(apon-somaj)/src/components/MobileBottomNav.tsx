import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Home,
  Users,
  Plus,
  Bell,
  Menu,
  X,
  User,
  MessageSquare,
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

export const MobileBottomNav: React.FC = () => {
  const {
    activeView,
    setActiveView,
    currentUser,
    openUserProfile,
    setCreatePostModalOpen,
    unreadNotificationCount,
    setEcosystemModalOpen,
    messages
  } = useApp();

  const [menuOpen, setMenuOpen] = useState(false);

  const unreadMessagesCount = messages.filter(
    m => !m.read && currentUser && m.receiverId === currentUser.id
  ).length;

  const mobileNavCategories = [
    {
      id: 'feed',
      label: 'Home',
      bnLabel: 'হোম ফিড',
      icon: Home,
      action: () => {
        setActiveView('feed');
        setMenuOpen(false);
      }
    },
    {
      id: 'profile',
      label: 'আমার প্রোফাইল',
      bnLabel: 'Profile',
      icon: User,
      action: () => {
        if (currentUser) openUserProfile(currentUser.id);
        setMenuOpen(false);
      }
    },
    {
      id: 'friends',
      label: 'Friends',
      bnLabel: 'বন্ধু ও নেটওয়ার্ক',
      icon: Users,
      action: () => {
        setActiveView('friends');
        setMenuOpen(false);
      }
    },
    {
      id: 'chat',
      label: 'Messages',
      bnLabel: 'মেসেঞ্জার ও চ্যাট',
      icon: MessageSquare,
      badge: unreadMessagesCount > 0 ? unreadMessagesCount : null,
      action: () => {
        setActiveView('chat');
        setMenuOpen(false);
      }
    },
    {
      id: 'reels',
      label: 'Reels / Shorts',
      bnLabel: 'রিলস ও শর্টস',
      icon: Film,
      badge: 'নতুন',
      action: () => {
        setActiveView('reels');
        setMenuOpen(false);
      }
    },
    {
      id: 'videos',
      label: 'Videos',
      bnLabel: 'ভিডিও',
      icon: Video,
      action: () => {
        setActiveView('videos');
        setMenuOpen(false);
      }
    },
    {
      id: 'marketplace',
      label: 'Marketplace',
      bnLabel: 'আপন মার্কেটপ্লেস',
      icon: ShoppingBag,
      action: () => {
        setActiveView('marketplace');
        setMenuOpen(false);
      }
    },
    {
      id: 'labour',
      label: 'কাজ চাই / শ্রমিক চাই',
      bnLabel: 'কাজ চাই / শ্রমিক চাই',
      icon: Wrench,
      badge: 'শ্রম বাজার',
      action: () => {
        setActiveView('labour');
        setMenuOpen(false);
      }
    },
    {
      id: 'jobs',
      label: 'কাজ ও সেবা',
      bnLabel: 'Jobs & Services',
      icon: Briefcase,
      badge: 'হট',
      action: () => {
        setActiveView('jobs');
        setMenuOpen(false);
      }
    },
    {
      id: 'education',
      label: 'শিক্ষা',
      bnLabel: 'Education & Learning',
      icon: GraduationCap,
      action: () => {
        setActiveView('groups');
        setMenuOpen(false);
      }
    },
    {
      id: 'rent',
      label: 'বাড়ি ভাড়া',
      bnLabel: 'House & Room Rent',
      icon: Building2,
      action: () => {
        setActiveView('marketplace');
        setMenuOpen(false);
      }
    },
    {
      id: 'property',
      label: 'Property',
      bnLabel: 'জমি ও সম্পত্তি',
      icon: LandPlot,
      action: () => {
        setActiveView('marketplace');
        setMenuOpen(false);
      }
    },
    {
      id: 'agriculture',
      label: 'কৃষি',
      bnLabel: 'Agriculture & Crops',
      icon: Sprout,
      action: () => {
        setActiveView('location_hub');
        setMenuOpen(false);
      }
    },
    {
      id: 'animals',
      label: 'পশু-পাখি',
      bnLabel: 'Livestock & Pets',
      icon: PawPrint,
      action: () => {
        setActiveView('marketplace');
        setMenuOpen(false);
      }
    },
    {
      id: 'help',
      label: 'সহায়তা',
      bnLabel: 'Help & Blood Relief',
      icon: HeartHandshake,
      badge: 'জরুরি',
      action: () => {
        setActiveView('location_hub');
        setMenuOpen(false);
      }
    },
    {
      id: 'medical',
      label: 'চিকিৎসা',
      bnLabel: 'Health & Medical',
      icon: HeartPulse,
      action: () => {
        setActiveView('location_hub');
        setMenuOpen(false);
      }
    },
    {
      id: 'saved',
      label: 'Saved',
      bnLabel: 'সংরক্ষিত পোস্ট',
      icon: Bookmark,
      action: () => {
        setActiveView('saved');
        setMenuOpen(false);
      }
    },
    {
      id: 'settings',
      label: 'Settings',
      bnLabel: 'প্রাইভেসি সেটিংস',
      icon: Settings,
      action: () => {
        setActiveView('settings');
        setMenuOpen(false);
      }
    },
  ];

  const handleNotificationsClick = () => {
    const notifBtn = document.getElementById('nav-notifications-btn');
    if (notifBtn) {
      notifBtn.click();
    } else {
      setActiveView('feed');
    }
  };

  return (
    <>
      {/* FIXED BOTTOM NAVIGATION BAR */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-slate-200 bg-white/95 backdrop-blur-md lg:hidden">
        <div className="flex h-16 items-center justify-around px-2 relative">
          {/* 1. Home */}
          <button
            id="mobile-bottom-home"
            onClick={() => setActiveView('feed')}
            className={`flex flex-col items-center gap-1 p-1 transition-colors ${
              activeView === 'feed' ? 'text-[#0F2942] font-bold' : 'text-slate-500'
            }`}
          >
            <Home className={`h-5 w-5 ${activeView === 'feed' ? 'text-emerald-600' : ''}`} />
            <span className="text-[10px]">Home</span>
          </button>

          {/* 2. Friends */}
          <button
            id="mobile-bottom-friends"
            onClick={() => setActiveView('friends')}
            className={`flex flex-col items-center gap-1 p-1 transition-colors ${
              activeView === 'friends' ? 'text-[#0F2942] font-bold' : 'text-slate-500'
            }`}
          >
            <Users className={`h-5 w-5 ${activeView === 'friends' ? 'text-emerald-600' : ''}`} />
            <span className="text-[10px]">Friends</span>
          </button>

          {/* 3. Create (PROMINENT CENTER BUTTON) */}
          <div className="relative -mt-6">
            <button
              id="mobile-bottom-create"
              onClick={() => setCreatePostModalOpen(true)}
              className="flex h-13 w-13 items-center justify-center rounded-full bg-[#0F2942] text-white shadow-lg shadow-slate-900/20 ring-4 ring-white active:scale-95 hover:bg-emerald-700 transition-all"
              title="নতুন পোস্ট তৈরি করুন"
            >
              <Plus className="h-6 w-6 stroke-[2.5]" />
            </button>
            <span className="block text-center text-[9px] font-bold text-slate-700 mt-1">
              Create
            </span>
          </div>

          {/* 4. Notifications */}
          <button
            id="mobile-bottom-notifications"
            onClick={handleNotificationsClick}
            className="relative flex flex-col items-center gap-1 p-1 transition-colors text-slate-500 hover:text-slate-900"
          >
            <Bell className="h-5 w-5" />
            {unreadNotificationCount > 0 && (
              <span className="absolute top-0 right-2 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[9px] font-bold text-white ring-1 ring-white">
                {unreadNotificationCount}
              </span>
            )}
            <span className="text-[10px]">বিজ্ঞপ্তি</span>
          </button>

          {/* 5. Menu */}
          <button
            id="mobile-bottom-menu"
            onClick={() => setMenuOpen(true)}
            className={`flex flex-col items-center gap-1 p-1 transition-colors ${
              menuOpen ? 'text-[#0F2942] font-bold' : 'text-slate-500'
            }`}
          >
            <Menu className="h-5 w-5" />
            <span className="text-[10px]">Menu</span>
          </button>
        </div>
      </nav>

      {/* MOBILE SLIDE-OVER MENU DRAWER */}
      {menuOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          {/* Backdrop overlay */}
          <div
            onClick={() => setMenuOpen(false)}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
          />

          {/* Drawer content */}
          <div className="relative ml-auto flex h-full w-full max-w-xs flex-col bg-white shadow-2xl z-10 overflow-y-auto pb-20">
            {/* Drawer Header */}
            <div className="flex items-center justify-between border-b border-slate-100 p-4 sticky top-0 bg-white z-20">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#0F2942] text-white font-bold text-base shadow-xs">
                  আ
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900 leading-tight">আপন সমাজ</h3>
                  <p className="text-[10px] text-emerald-700 font-semibold">&quot;মানুষের জন্য মানুষ&quot;</p>
                </div>
              </div>
              <button
                onClick={() => setMenuOpen(false)}
                className="rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Profile quick block */}
            {currentUser && (
              <div
                onClick={() => {
                  openUserProfile(currentUser.id);
                  setMenuOpen(false);
                }}
                className="m-3 flex cursor-pointer items-center gap-3 rounded-2xl border border-emerald-100 bg-emerald-50/50 p-3 shadow-2xs"
              >
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  className="h-10 w-10 rounded-full object-cover ring-2 ring-emerald-500/20"
                />
                <div className="overflow-hidden min-w-0">
                  <h4 className="text-xs font-bold text-slate-900 truncate">{currentUser.name}</h4>
                  <p className="text-[11px] text-emerald-700 font-medium truncate">{currentUser.hometown}</p>
                </div>
              </div>
            )}

            {/* Navigation links */}
            <div className="px-3 py-2 space-y-0.5">
              {mobileNavCategories.map(item => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={item.action}
                    className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-left transition-colors hover:bg-slate-50 active:bg-emerald-50"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <Icon className="h-4.5 w-4.5 text-slate-500 shrink-0" />
                      <div className="truncate">
                        <span className="block text-xs font-bold text-slate-800 leading-tight truncate">
                          {item.label}
                        </span>
                        <span className="block text-[10px] text-slate-400 leading-tight truncate">
                          {item.bnLabel}
                        </span>
                      </div>
                    </div>

                    {item.badge && (
                      <span
                        className={`rounded-full px-2 py-0.2 text-[9px] font-bold ${
                          item.badge === 'জরুরি'
                            ? 'bg-rose-100 text-rose-700'
                            : typeof item.badge === 'number'
                            ? 'bg-emerald-600 text-white'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}

              {/* Admin Panel button if role is admin */}
              {currentUser?.role === 'admin' && (
                <button
                  onClick={() => {
                    setActiveView('admin');
                    setMenuOpen(false);
                  }}
                  className="mt-2 flex w-full items-center justify-between rounded-xl bg-[#0F2942] px-3 py-2.5 text-white"
                >
                  <div className="flex items-center gap-3">
                    <Shield className="h-4.5 w-4.5 text-emerald-400" />
                    <div>
                      <span className="block text-xs font-bold leading-tight">অ্যাডমিন প্যানেল</span>
                      <span className="block text-[10px] text-emerald-300">Admin Control</span>
                    </div>
                  </div>
                </button>
              )}
            </div>

            {/* Ecosystem link */}
            <div className="m-3 mt-auto rounded-2xl border border-emerald-200 bg-gradient-to-br from-[#0F2942] to-emerald-800 p-3.5 text-white shadow-xs">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-amber-300" />
                <h5 className="text-xs font-bold">আপন ইকোসিস্টেম</h5>
              </div>
              <p className="mt-1 text-[10px] text-slate-200 leading-snug">
                আপন বাজার ও ডিজিটাল প্ল্যাটফর্ম
              </p>
              <button
                onClick={() => {
                  setEcosystemModalOpen(true);
                  setMenuOpen(false);
                }}
                className="mt-2.5 flex w-full items-center justify-center gap-1.5 rounded-lg bg-white py-1.5 text-xs font-bold text-emerald-800 shadow-xs active:scale-95"
              >
                <Layers className="h-3.5 w-3.5" />
                <span>সার্ভিস দেখুন</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
