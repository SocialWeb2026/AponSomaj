import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Users,
  UserPlus,
  UserCheck,
  MessageSquare,
  Search,
  MapPin,
  Check,
  X
} from 'lucide-react';

export const FriendsView: React.FC = () => {
  const {
    currentUser,
    users,
    friendships,
    sendFriendRequest,
    acceptFriendRequest,
    rejectFriendRequest,
    removeFriend,
    toggleFollowUser,
    setActiveChatUserId,
    setActiveView,
    openUserProfile
  } = useApp();

  const [activeTab, setActiveTab] = useState<'all' | 'requests' | 'suggestions' | 'followers'>('all');
  const [search, setSearch] = useState('');

  if (!currentUser) return null;

  // Received pending requests
  const receivedRequests = friendships.filter(
    f => f.status === 'pending' && f.receiverId === currentUser.id
  );

  // Sent pending requests
  const sentRequests = friendships.filter(
    f => f.status === 'pending' && f.requesterId === currentUser.id
  );

  // Accepted friends
  const friendIds = friendships
    .filter(
      f =>
        f.status === 'accepted' &&
        (f.requesterId === currentUser.id || f.receiverId === currentUser.id)
    )
    .map(f => (f.requesterId === currentUser.id ? f.receiverId : f.requesterId));

  const allFriends = users.filter(u => friendIds.includes(u.id));

  // Suggested friends (not me, not existing friend, not pending request)
  const connectedOrPendingIds = friendships
    .filter(f => f.requesterId === currentUser.id || f.receiverId === currentUser.id)
    .map(f => (f.requesterId === currentUser.id ? f.receiverId : f.requesterId));

  const suggestions = users.filter(
    u => u.id !== currentUser.id && !connectedOrPendingIds.includes(u.id)
  );

  // Followers & Following
  const followingUsers = users.filter(u => currentUser.following?.includes(u.id));

  return (
    <div className="flex-1 max-w-5xl mx-auto space-y-5 pb-16">
      {/* Header */}
      <div className="rounded-2xl border border-emerald-200 bg-gradient-to-r from-emerald-800 to-teal-800 p-5 text-white shadow-xs">
        <div className="flex items-center gap-2">
          <Users className="h-6 w-6 text-emerald-300" />
          <h2 className="text-xl font-bold">বন্ধু ও সামাজিক নেটওয়ার্ক (Friends & Network)</h2>
        </div>
        <p className="text-xs text-emerald-100 mt-1">
          আপনার এলাকা ও দেশের মানুষদের সাথে সুসম্পর্ক গড়ে তুলুন এবং বন্ধু তালিকায় যুক্ত রাখুন।
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 bg-white rounded-xl p-1 shadow-xs overflow-x-auto text-xs font-bold">
        {[
          { id: 'all', label: `সকল বন্ধু (${allFriends.length})` },
          { id: 'requests', label: `অনুরোধ (${receivedRequests.length})`, badge: receivedRequests.length },
          { id: 'suggestions', label: `পরিচিত হতে পারেন (${suggestions.length})` },
          { id: 'followers', label: `অনুসরণ করছেন (${followingUsers.length})` },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-1.5 rounded-lg px-4 py-2.5 transition-all ${
              activeTab === tab.id
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <span>{tab.label}</span>
            {tab.badge && tab.badge > 0 && (
              <span className="rounded-full bg-rose-500 px-1.5 py-0.2 text-[10px] text-white">
                {tab.badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Tab: All Friends */}
      {activeTab === 'all' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {allFriends.length === 0 ? (
            <div className="col-span-full rounded-2xl border border-slate-200 bg-white p-8 text-center text-xs text-slate-500">
              আপনার এখনও কোনো বন্ধু যুক্ত নেই। &apos;পরিচিত হতে পারেন&apos; ট্যাব থেকে ফ্রেন্ড রিকোয়েস্ট পাঠান।
            </div>
          ) : (
            allFriends.map(friend => (
              <div
                key={friend.id}
                className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs flex flex-col justify-between"
              >
                <div
                  onClick={() => openUserProfile(friend.id)}
                  className="flex items-center gap-3 cursor-pointer"
                >
                  <img src={friend.avatar} alt="" className="h-12 w-12 rounded-full object-cover ring-2 ring-emerald-500/20" />
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm hover:underline">{friend.name}</h4>
                    <p className="text-xs text-slate-500">@{friend.username}</p>
                    <p className="text-[11px] text-emerald-700 font-medium flex items-center gap-1 mt-0.5">
                      <MapPin className="h-3 w-3" />
                      <span>{friend.hometown}</span>
                    </p>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  <button
                    onClick={() => {
                      setActiveChatUserId(friend.id);
                      setActiveView('chat');
                    }}
                    className="flex-1 flex items-center justify-center gap-1 rounded-xl bg-emerald-600 py-1.5 text-xs font-bold text-white hover:bg-emerald-700"
                  >
                    <MessageSquare className="h-3.5 w-3.5" />
                    <span>মেসেজ</span>
                  </button>
                  <button
                    onClick={() => removeFriend(friend.id)}
                    className="rounded-xl bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-rose-50 hover:text-rose-600"
                    title="Unfriend"
                  >
                    বাতিল
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Tab: Requests */}
      {activeTab === 'requests' && (
        <div className="space-y-3">
          {receivedRequests.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-xs text-slate-500">
              কোনো নতুন বন্ধুত্বের অনুরোধ নেই
            </div>
          ) : (
            receivedRequests.map(req => {
              const requester = users.find(u => u.id === req.requesterId);
              if (!requester) return null;

              return (
                <div
                  key={req.id}
                  className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div
                    onClick={() => openUserProfile(requester.id)}
                    className="flex items-center gap-3 cursor-pointer"
                  >
                    <img src={requester.avatar} alt="" className="h-12 w-12 rounded-full object-cover" />
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm hover:underline">{requester.name}</h4>
                      <p className="text-xs text-slate-500">@{requester.username} • {requester.hometown}</p>
                      <span className="text-[10px] text-slate-400 block mt-0.5">{req.createdAt}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      id={`accept-request-${req.id}`}
                      onClick={() => acceptFriendRequest(req.id)}
                      className="flex-1 sm:flex-none flex items-center justify-center gap-1 rounded-xl bg-emerald-600 px-4 py-1.5 text-xs font-bold text-white hover:bg-emerald-700 shadow-xs"
                    >
                      <Check className="h-3.5 w-3.5" />
                      <span>অনুরোধ গ্রহণ করুন</span>
                    </button>
                    <button
                      onClick={() => rejectFriendRequest(req.id)}
                      className="flex-1 sm:flex-none flex items-center justify-center gap-1 rounded-xl bg-slate-100 px-4 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-200"
                    >
                      <X className="h-3.5 w-3.5" />
                      <span>মুছে ফেলুন</span>
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Tab: Suggestions */}
      {activeTab === 'suggestions' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {suggestions.map(person => (
            <div
              key={person.id}
              className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs flex flex-col justify-between"
            >
              <div
                onClick={() => openUserProfile(person.id)}
                className="flex items-center gap-3 cursor-pointer"
              >
                <img src={person.avatar} alt="" className="h-12 w-12 rounded-full object-cover ring-2 ring-emerald-500/10" />
                <div>
                  <h4 className="font-bold text-slate-900 text-sm hover:underline">{person.name}</h4>
                  <p className="text-xs text-slate-500">{person.hometown}</p>
                </div>
              </div>

              <button
                id={`add-suggestion-btn-${person.id}`}
                onClick={() => sendFriendRequest(person.id)}
                className="mt-4 flex w-full items-center justify-center gap-1 rounded-xl bg-emerald-600 py-2 text-xs font-bold text-white hover:bg-emerald-700 shadow-xs transition-colors"
              >
                <UserPlus className="h-4 w-4" />
                <span>ফ্রেন্ড রিকোয়েস্ট পাঠান</span>
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Tab: Following */}
      {activeTab === 'followers' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {followingUsers.map(user => (
            <div
              key={user.id}
              className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs flex items-center justify-between"
            >
              <div
                onClick={() => openUserProfile(user.id)}
                className="flex items-center gap-3 cursor-pointer"
              >
                <img src={user.avatar} alt="" className="h-11 w-11 rounded-full object-cover" />
                <div>
                  <h4 className="font-bold text-slate-900 text-xs hover:underline">{user.name}</h4>
                  <p className="text-[11px] text-slate-400">{user.hometown}</p>
                </div>
              </div>
              <button
                onClick={() => toggleFollowUser(user.id)}
                className="rounded-lg bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-200"
              >
                আনফলো
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
