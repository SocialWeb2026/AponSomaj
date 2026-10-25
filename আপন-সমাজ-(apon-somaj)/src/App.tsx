import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { SidebarLeft } from './components/SidebarLeft';
import { SidebarRight } from './components/SidebarRight';
import { Feed } from './components/Feed';
import { LocationHub } from './components/LocationHub';
import { GroupsView } from './components/GroupsView';
import { PagesView } from './components/PagesView';
import { JobsView } from './components/JobsView';
import { MatrimonyView } from './components/MatrimonyView';
import { MarketplaceView } from './components/MarketplaceView';
import { FriendsView } from './components/FriendsView';
import { ChatMessenger } from './components/ChatMessenger';
import { UserProfileView } from './components/UserProfileView';
import { AdminDashboard } from './components/AdminDashboard';
import { SettingsView } from './components/SettingsView';
import { SavedPostsView } from './components/SavedPostsView';
import { ReelsVideoView } from './components/ReelsVideoView';
import { LabourMarketplace } from './components/LabourMarketplace';
import { CreatePostModal } from './components/CreatePostModal';
import { AuthModal } from './components/AuthModal';
import { ReportModal } from './components/ReportModal';
import { MobileBottomNav } from './components/MobileBottomNav';
import {
  MapPin,
  X,
  Layers,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  ShoppingBag,
  CreditCard,
  HeartPulse
} from 'lucide-react';

const EcosystemModal: React.FC = () => {
  const { ecosystemModalOpen, setEcosystemModalOpen, setActiveView } = useApp();
  if (!ecosystemModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
      <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-700 text-white font-black text-lg shadow-sm">
              আ
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-base">আপন ইকোসিস্টেম (Apon Ecosystem)</h3>
              <p className="text-xs text-emerald-700 font-semibold">বাংলাদেশের মানুষের সমন্বিত ডিজিটাল প্ল্যাটফর্ম</p>
            </div>
          </div>
          <button
            onClick={() => setEcosystemModalOpen(false)}
            className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <p className="text-xs text-slate-600 leading-relaxed">
          &apos;আপন সমাজ&apos; এর সাথে যুক্ত অন্যান্য প্ল্যাটফর্মসমূহ। এখানে কোনো বিশৃঙ্খলা বা বাধ্যতামূলক বাণিজ্যিকীকরণ নেই; প্রতিটি প্ল্যাটফর্ম তাদের নিজস্ব বিশেষায়িত সেবায় নিবেদিত।
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          <div className="rounded-2xl border-2 border-emerald-500/40 bg-emerald-50/50 p-4 relative">
            <span className="absolute top-3 right-3 rounded-full bg-emerald-700 px-2 py-0.5 text-[9px] font-bold text-white">
              বর্তমান অ্যাপ
            </span>
            <div className="flex items-center gap-2 text-emerald-900 font-bold text-sm">
              <span className="text-lg">🌿</span>
              <span>আপন সমাজ (Apon Somaj)</span>
            </div>
            <p className="text-[11px] text-slate-600 mt-1">
              সামাজিক যোগাযোগ, স্থানীয় কমিউনিটি, চাকরি, ম্যাট্রিমনি ও লোকাল হাব।
            </p>
          </div>

          <div
            onClick={() => {
              setEcosystemModalOpen(false);
              setActiveView('marketplace');
            }}
            className="rounded-2xl border border-slate-200 bg-white p-4 hover:border-emerald-400 hover:shadow-md cursor-pointer transition-all"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
                <ShoppingBag className="h-4 w-4 text-emerald-600" />
                <span>আপন বাজার (Apon Bazar)</span>
              </div>
              <ExternalLink className="h-3.5 w-3.5 text-slate-400" />
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              বাংলাদেশের সেরা ই-কমার্স পণ্য, পাইকারি ও রিটেল কেনাকাটা।
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4 hover:border-emerald-400 transition-all">
            <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
              <CreditCard className="h-4 w-4 text-teal-600" />
              <span>আপন পে (Apon Pay)</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              ডিজিটাল পেমেন্ট, কিউআর কোড ও সহজ নিরাপদ লেনদেন (আসছে শীঘ্রই)।
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4 hover:border-emerald-400 transition-all">
            <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
              <HeartPulse className="h-4 w-4 text-rose-600" />
              <span>আপন সেবা (Apon Seba)</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              স্থানীয় জরুরি রক্তদান নেটওয়ার্ক, ডাক্তার ও অ্যাম্বুলেন্স সেবা।
            </p>
          </div>
        </div>

        <div className="border-t border-slate-100 pt-3 flex justify-end">
          <button
            onClick={() => setEcosystemModalOpen(false)}
            className="rounded-xl bg-slate-100 px-5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-200"
          >
            বন্ধ করুন
          </button>
        </div>
      </div>
    </div>
  );
};

const MainContent: React.FC = () => {
  const { activeView, locationFilter, setLocationFilter, currentUser, selectedEntityId } = useApp();

  const isWideLayout =
    activeView === 'chat' ||
    activeView === 'admin' ||
    activeView === 'jobs' ||
    activeView === 'matrimony' ||
    activeView === 'marketplace' ||
    activeView === 'labour' ||
    activeView === 'pages' ||
    activeView === 'groups' ||
    activeView === 'friends' ||
    activeView === 'reels' ||
    activeView === 'videos';

  return (
    <div className="min-h-screen bg-[#F8FAF9] text-slate-900 flex flex-col antialiased">
      {/* Top Navbar */}
      <Navbar />

      {/* Active Location Filter Banner (if filtered by division/district/upazila) */}
      {(locationFilter.divisionName || locationFilter.districtName || locationFilter.upazilaName) && (
        <div className="sticky top-15 z-20 border-b border-emerald-200 bg-emerald-50/95 backdrop-blur-xs px-4 py-2 text-xs">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-2 text-emerald-900 font-medium">
              <MapPin className="h-4 w-4 text-emerald-700 shrink-0" />
              <span>
                বর্তমানে প্রদর্শিত এলাকা:{' '}
                <strong className="font-bold text-emerald-800">
                  {[locationFilter.upazilaName, locationFilter.districtName, locationFilter.divisionName]
                    .filter(Boolean)
                    .join(' › ')}
                </strong>
              </span>
            </div>
            <button
              onClick={() => setLocationFilter({})}
              className="flex items-center gap-1 rounded-lg bg-emerald-200/70 hover:bg-emerald-300 px-2 py-0.5 text-[11px] font-bold text-emerald-900 transition-colors"
            >
              <X className="h-3 w-3" />
              <span>ফিল্টার সরান (সকল বাংলাদেশ)</span>
            </button>
          </div>
        </div>
      )}

      {/* Main Content Layout */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-2 sm:px-4 py-4 pb-20 lg:pb-8 flex gap-5">
        {/* Left Sidebar (Navigation & Shortcuts) */}
        <SidebarLeft />

        {/* Dynamic Center View */}
        <div className="flex-1 min-w-0">
          {activeView === 'feed' && <Feed />}
          {(activeView === 'reels' || activeView === 'videos') && <ReelsVideoView />}
          {activeView === 'location_hub' && <LocationHub />}
          {activeView === 'groups' && <GroupsView />}
          {activeView === 'pages' && <PagesView />}
          {activeView === 'jobs' && <JobsView />}
          {activeView === 'matrimony' && <MatrimonyView />}
          {activeView === 'marketplace' && <MarketplaceView />}
          {activeView === 'labour' && <LabourMarketplace />}
          {activeView === 'friends' && <FriendsView />}
          {activeView === 'chat' && <ChatMessenger />}
          {activeView === 'profile' && (
            <UserProfileView userId={selectedEntityId || currentUser?.id || 'user-1'} />
          )}
          {activeView === 'admin' && <AdminDashboard />}
          {activeView === 'settings' && <SettingsView />}
          {activeView === 'saved' && <SavedPostsView />}
        </div>

        {/* Right Sidebar (Only on Feed & Location Hub) */}
        {!isWideLayout && <SidebarRight />}
      </main>

      {/* Modals */}
      <CreatePostModal />
      <AuthModal />
      <ReportModal />
      <EcosystemModal />

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainContent />
    </AppProvider>
  );
}
