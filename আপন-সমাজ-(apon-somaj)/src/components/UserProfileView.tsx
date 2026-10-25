import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { PostCard } from './PostCard';
import { BangladeshLocationPicker } from './BangladeshLocationPicker';
import {
  MapPin,
  Briefcase,
  GraduationCap,
  Heart,
  Droplet,
  Calendar,
  Globe,
  UserPlus,
  UserCheck,
  MessageSquare,
  Share2,
  CheckCircle2,
  Edit3,
  Users,
  Camera,
  X
} from 'lucide-react';

interface UserProfileViewProps {
  userId: string;
}

export const UserProfileView: React.FC<UserProfileViewProps> = ({ userId }) => {
  const {
    currentUser,
    users,
    posts,
    friendships,
    sendFriendRequest,
    acceptFriendRequest,
    removeFriend,
    toggleFollowUser,
    setActiveChatUserId,
    setActiveView,
    updateUserProfile,
    divisions,
    districts,
    upazilas,
    unions,
    wards
  } = useApp();

  const [activeTab, setActiveTab] = useState<'posts' | 'about' | 'friends' | 'photos'>('posts');
  const [editModalOpen, setEditModalOpen] = useState(false);

  const profileUser = users.find(u => u.id === userId) || currentUser;
  if (!profileUser) return null;

  const isOwnProfile = currentUser?.id === profileUser.id;

  // Friendship status
  const friendship = friendships.find(
    f =>
      (f.requesterId === currentUser?.id && f.receiverId === profileUser.id) ||
      (f.requesterId === profileUser.id && f.receiverId === currentUser?.id)
  );

  const isFriend = friendship?.status === 'accepted';
  const isPendingSent = friendship?.status === 'pending' && friendship.requesterId === currentUser?.id;
  const isPendingReceived = friendship?.status === 'pending' && friendship.receiverId === currentUser?.id;
  const isFollowing = currentUser?.following?.includes(profileUser.id);

  // User's posts
  const userPosts = posts.filter(p => p.authorId === profileUser.id);

  // Geographic names for profileUser
  const userDiv = divisions.find(d => d.id === profileUser.divisionId);
  const userDist = districts.find(d => d.id === profileUser.districtId);
  const userUp = upazilas.find(u => u.id === profileUser.upazilaId);
  const userUn = unions.find(u => u.id === profileUser.unionId);
  const userWard = wards.find(w => w.id === profileUser.wardId);

  const fullLocationString = [
    userWard?.bnName,
    userUn?.bnName,
    userUp?.bnName,
    userDist?.bnName,
    userDiv?.bnName,
  ]
    .filter(Boolean)
    .join(', ') || profileUser.hometown || profileUser.currentDistrict || 'বাংলাদেশ';

  // Edit profile form state
  const [bio, setBio] = useState(profileUser.bio || '');
  const [work, setWork] = useState(profileUser.work || '');
  const [education, setEducation] = useState(profileUser.education || '');
  const [bloodGroup, setBloodGroup] = useState(profileUser.bloodGroup || '');
  const [hometown, setHometown] = useState(profileUser.hometown || '');
  const [website, setWebsite] = useState(profileUser.website || '');
  const [profileLocation, setProfileLocation] = useState<{
    divisionId?: string;
    districtId?: string;
    upazilaId?: string;
    unionId?: string;
    wardId?: string;
  }>({
    divisionId: profileUser.divisionId,
    districtId: profileUser.districtId,
    upazilaId: profileUser.upazilaId,
    unionId: profileUser.unionId,
    wardId: profileUser.wardId,
  });

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();

    const chosenDiv = divisions.find(d => d.id === profileLocation.divisionId);
    const chosenDist = districts.find(d => d.id === profileLocation.districtId);
    const chosenUp = upazilas.find(u => u.id === profileLocation.upazilaId);
    const chosenUn = unions.find(u => u.id === profileLocation.unionId);
    const chosenWard = wards.find(w => w.id === profileLocation.wardId);

    const fullHometown = [
      chosenWard?.bnName,
      chosenUn?.bnName,
      chosenUp?.bnName,
      chosenDist?.bnName,
      chosenDiv?.bnName,
    ]
      .filter(Boolean)
      .join(', ') || hometown;

    updateUserProfile({
      bio,
      work,
      education,
      bloodGroup,
      hometown: fullHometown,
      website,
      divisionId: profileLocation.divisionId,
      districtId: profileLocation.districtId,
      upazilaId: profileLocation.upazilaId,
      unionId: profileLocation.unionId,
      wardId: profileLocation.wardId,
      currentDistrict: chosenDist?.name || profileUser.currentDistrict,
    });
    setEditModalOpen(false);
  };

  // Find user's friends
  const userFriendIds = friendships
    .filter(
      f =>
        f.status === 'accepted' &&
        (f.requesterId === profileUser.id || f.receiverId === profileUser.id)
    )
    .map(f => (f.requesterId === profileUser.id ? f.receiverId : f.requesterId));

  const userFriends = users.filter(u => userFriendIds.includes(u.id));

  return (
    <div className="flex-1 max-w-4xl mx-auto space-y-4 pb-16">
      {/* Cover and Header Banner */}
      <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-xs">
        <div className="relative h-48 sm:h-64 w-full bg-slate-200">
          <img
            src={profileUser.coverPhoto || 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=1200'}
            alt=""
            className="h-full w-full object-cover"
          />
        </div>

        {/* Profile Info Header Bar */}
        <div className="px-4 sm:px-6 pb-5 pt-0">
          <div className="relative flex flex-col sm:flex-row items-center sm:items-end justify-between gap-4 -mt-16 sm:-mt-20">
            <div className="flex flex-col sm:flex-row items-center sm:items-end gap-4 text-center sm:text-left">
              <div className="relative">
                <img
                  src={profileUser.avatar}
                  alt={profileUser.name}
                  className="h-28 w-28 sm:h-32 sm:w-32 rounded-full border-4 border-white object-cover shadow-lg"
                />
                {profileUser.isVerified && (
                  <CheckCircle2 className="absolute bottom-1 right-1 h-7 w-7 text-emerald-600 fill-white" />
                )}
              </div>
              <div className="mb-2">
                <div className="flex items-center justify-center sm:justify-start gap-2">
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900">{profileUser.name}</h2>
                  {profileUser.role === 'admin' && (
                    <span className="rounded-md bg-emerald-100 px-2 py-0.5 text-[11px] font-bold text-emerald-800">
                      Super Admin
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500 font-medium">@{profileUser.username}</p>
                <div className="mt-1 flex items-center justify-center sm:justify-start gap-3 text-xs text-slate-600">
                  <span className="font-bold text-slate-900">{userFriends.length}</span>
                  <span className="text-slate-500">বন্ধু</span>
                  <span>•</span>
                  <span className="font-bold text-slate-900">{profileUser.followersCount}</span>
                  <span className="text-slate-500">অনুসারী</span>
                </div>
              </div>
            </div>

            {/* Profile Action Buttons */}
            <div className="flex items-center gap-2 mb-2">
              {isOwnProfile ? (
                <button
                  id="edit-profile-btn"
                  onClick={() => setEditModalOpen(true)}
                  className="flex items-center gap-1.5 rounded-xl bg-slate-100 px-4 py-2 text-xs font-bold text-slate-800 hover:bg-slate-200 transition-colors"
                >
                  <Edit3 className="h-4 w-4" />
                  <span>প্রোফাইল সম্পাদনা করুন</span>
                </button>
              ) : (
                <>
                  {/* Friend Request Button */}
                  {isFriend ? (
                    <button
                      onClick={() => removeFriend(profileUser.id)}
                      className="flex items-center gap-1.5 rounded-xl bg-slate-100 px-3 py-2 text-xs font-bold text-slate-700 hover:bg-rose-50 hover:text-rose-600 transition-colors"
                    >
                      <UserCheck className="h-4 w-4 text-emerald-600" />
                      <span>বন্ধু আছেন (Unfriend)</span>
                    </button>
                  ) : isPendingSent ? (
                    <button
                      disabled
                      className="rounded-xl bg-slate-100 px-3 py-2 text-xs font-bold text-slate-500"
                    >
                      রিকোয়েস্ট পাঠানো হয়েছে
                    </button>
                  ) : isPendingReceived ? (
                    <button
                      onClick={() => acceptFriendRequest(friendship.id)}
                      className="rounded-xl bg-emerald-600 px-3 py-2 text-xs font-bold text-white hover:bg-emerald-700"
                    >
                      রিকোয়েস্ট গ্রহণ করুন
                    </button>
                  ) : (
                    <button
                      onClick={() => sendFriendRequest(profileUser.id)}
                      className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-700 shadow-xs"
                    >
                      <UserPlus className="h-4 w-4" />
                      <span>বন্ধু যুক্ত করুন</span>
                    </button>
                  )}

                  {/* Follow Button */}
                  <button
                    onClick={() => toggleFollowUser(profileUser.id)}
                    className={`rounded-xl px-3 py-2 text-xs font-bold transition-colors ${
                      isFollowing
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {isFollowing ? 'অনুসরণ করছেন' : 'ফলো করুন'}
                  </button>

                  {/* Direct Chat Button */}
                  <button
                    onClick={() => {
                      setActiveChatUserId(profileUser.id);
                      setActiveView('chat');
                    }}
                    className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3.5 py-2 text-xs font-bold text-white hover:bg-emerald-700 shadow-xs"
                  >
                    <MessageSquare className="h-4 w-4" />
                    <span>মেসেজ</span>
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Bio text */}
          {profileUser.bio && (
            <p className="mt-3 text-xs sm:text-sm text-slate-700 leading-relaxed max-w-2xl">
              {profileUser.bio}
            </p>
          )}

          {/* Quick info badges */}
          <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-slate-600">
            {fullLocationString && (
              <div className="flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5 text-emerald-600" />
                <span>নিজ এলাকা: <strong>{fullLocationString}</strong></span>
              </div>
            )}
            {profileUser.work && (
              <div className="flex items-center gap-1">
                <Briefcase className="h-3.5 w-3.5 text-emerald-600" />
                <span>{profileUser.work}</span>
              </div>
            )}
            {profileUser.bloodGroup && (
              <div className="flex items-center gap-1 text-rose-700 font-bold bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200">
                <Droplet className="h-3.5 w-3.5" />
                <span>রক্তের গ্রুপ: {profileUser.bloodGroup}</span>
              </div>
            )}
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-t border-slate-100 px-4 sm:px-6 text-xs font-bold">
          {[
            { id: 'posts', label: `পোস্টসমূহ (${userPosts.length})` },
            { id: 'about', label: 'পরিচিতি ও বিবরণ (About)' },
            { id: 'friends', label: `বন্ধুরা (${userFriends.length})` },
            { id: 'photos', label: 'ছবি ও মিডিয়া' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`border-b-2 py-3 px-4 transition-colors ${
                activeTab === tab.id
                  ? 'border-emerald-600 text-emerald-700 font-extrabold'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Contents */}
      {activeTab === 'posts' && (
        <div className="space-y-4">
          {userPosts.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-xs text-slate-500">
              কোনো পোস্ট পাওয়া যায়নি
            </div>
          ) : (
            userPosts.map(p => <PostCard key={p.id} post={p} />)
          )}
        </div>
      )}

      {activeTab === 'about' && (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-4 text-xs">
          <h3 className="font-bold text-slate-900 text-sm border-b pb-2">পূর্ণাঙ্গ পরিচিতি (About Details)</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div>
                <span className="text-slate-400 font-medium">পূর্ণ নাম:</span>
                <p className="font-bold text-slate-800">{profileUser.name} ({profileUser.bnName || profileUser.name})</p>
              </div>
              <div>
                <span className="text-slate-400 font-medium">ইউজারনেম:</span>
                <p className="font-bold text-slate-800">@{profileUser.username}</p>
              </div>
              <div>
                <span className="text-slate-400 font-medium">নিজ এলাকা (Administrative Hierarchy):</span>
                <p className="font-bold text-slate-800">{fullLocationString}</p>
                <div className="mt-1.5 flex flex-wrap gap-1">
                  {userDiv && <span className="rounded-md bg-emerald-50 px-2 py-0.5 text-[10px] text-emerald-800 border border-emerald-200 font-medium">{userDiv.bnName} বিভাগ</span>}
                  {userDist && <span className="rounded-md bg-emerald-50 px-2 py-0.5 text-[10px] text-emerald-800 border border-emerald-200 font-medium">{userDist.bnName} জেলা</span>}
                  {userUp && <span className="rounded-md bg-emerald-50 px-2 py-0.5 text-[10px] text-emerald-800 border border-emerald-200 font-medium">{userUp.bnName} উপজেলা/থানা</span>}
                  {userUn && <span className="rounded-md bg-emerald-50 px-2 py-0.5 text-[10px] text-emerald-800 border border-emerald-200 font-medium">{userUn.bnName} ইউনিয়ন/পৌরসভা</span>}
                  {userWard && <span className="rounded-md bg-emerald-50 px-2 py-0.5 text-[10px] text-emerald-800 border border-emerald-200 font-medium">{userWard.bnName} ওয়ার্ড</span>}
                </div>
              </div>
              <div>
                <span className="text-slate-400 font-medium">বর্তমান জেলা:</span>
                <p className="font-bold text-slate-800">{userDist?.bnName || profileUser.currentDistrict || 'বাংলাদেশ'}</p>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <span className="text-slate-400 font-medium">পেশা ও কর্মক্ষেত্র:</span>
                <p className="font-bold text-slate-800">{profileUser.work || 'তথ্য নেই'}</p>
              </div>
              <div>
                <span className="text-slate-400 font-medium">শিক্ষা প্রতিষ্ঠান:</span>
                <p className="font-bold text-slate-800">{profileUser.education || 'তথ্য নেই'}</p>
              </div>
              <div>
                <span className="text-slate-400 font-medium">রক্তের গ্রুপ:</span>
                <p className="font-bold text-rose-600">{profileUser.bloodGroup || 'তথ্য নেই'}</p>
              </div>
              <div>
                <span className="text-slate-400 font-medium">যোগদানের সময়:</span>
                <p className="font-bold text-slate-800">{profileUser.createdAt}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'friends' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {userFriends.length === 0 ? (
            <div className="col-span-2 rounded-2xl border border-slate-200 bg-white p-8 text-center text-xs text-slate-500">
              কোনো বন্ধু সংযুক্ত নেই
            </div>
          ) : (
            userFriends.map(friend => (
              <div
                key={friend.id}
                className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-3 shadow-xs"
              >
                <div className="flex items-center gap-2.5">
                  <img src={friend.avatar} alt="" className="h-10 w-10 rounded-full object-cover" />
                  <div>
                    <h5 className="font-bold text-slate-900 text-xs">{friend.name}</h5>
                    <p className="text-[11px] text-slate-400">{friend.hometown}</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setActiveChatUserId(friend.id);
                    setActiveView('chat');
                  }}
                  className="rounded-lg bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700 hover:bg-emerald-600 hover:text-white"
                >
                  মেসেজ
                </button>
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === 'photos' && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {userPosts
            .flatMap(p => p.mediaUrls || [])
            .map((url, i) => (
              <div key={i} className="aspect-square rounded-xl overflow-hidden bg-slate-100">
                <img src={url} alt="" className="h-full w-full object-cover hover:scale-105 transition-transform" />
              </div>
            ))}
        </div>
      )}

      {/* Edit Profile Modal */}
      {editModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-2xl bg-white p-5 shadow-2xl">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-slate-900 text-sm">প্রোফাইল আপডেট করুন</h3>
              <button onClick={() => setEditModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="mt-4 space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">বায়ো (Bio)</label>
                <textarea
                  rows={2}
                  value={bio}
                  onChange={e => setBio(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 p-2 text-slate-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">কর্মক্ষেত্র (Work)</label>
                  <input
                    type="text"
                    value={work}
                    onChange={e => setWork(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 p-2 text-slate-800"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">শিক্ষা প্রতিষ্ঠান</label>
                  <input
                    type="text"
                    value={education}
                    onChange={e => setEducation(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 p-2 text-slate-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">রক্তের গ্রুপ</label>
                  <select
                    value={bloodGroup}
                    onChange={e => setBloodGroup(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 p-2 text-slate-800"
                  >
                    <option value="">নির্বাচন করুন</option>
                    {['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'].map(bg => (
                      <option key={bg} value={bg}>{bg}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">কাস্টম ঠিকানা বা বিবরণ</label>
                  <input
                    type="text"
                    placeholder="রোড, পাড়া বা গ্রাম..."
                    value={hometown}
                    onChange={e => setHometown(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 p-2 text-slate-800"
                  />
                </div>
              </div>

              {/* Bangladesh Administrative Location Picker */}
              <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-3">
                <label className="font-bold text-emerald-950 block mb-2 flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5 text-emerald-600" />
                  প্রশাসনিক এলাকা নির্বাচন (বিভাগ ➔ জেলা ➔ উপজেলা ➔ ইউনিয়ন ➔ ওয়ার্ড)
                </label>
                <BangladeshLocationPicker
                  value={profileLocation}
                  onChange={setProfileLocation}
                  showAllOption={true}
                  labels={true}
                  includeUnions={true}
                  includeWards={true}
                  theme="light"
                />
              </div>

              <div className="mt-4 flex justify-end gap-2 pt-2 border-t">
                <button
                  type="button"
                  onClick={() => setEditModalOpen(false)}
                  className="rounded-xl px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-emerald-600 px-5 py-2 text-xs font-bold text-white hover:bg-emerald-700"
                >
                  সংরক্ষণ করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
