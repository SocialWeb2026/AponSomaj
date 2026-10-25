import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  HeartHandshake,
  Plus,
  MapPin,
  GraduationCap,
  Briefcase,
  Calendar,
  Phone,
  Search,
  Filter,
  Check,
  ShieldCheck,
  X,
  Send
} from 'lucide-react';
import { MatrimonyProfile } from '../types';

export const MatrimonyView: React.FC = () => {
  const {
    currentUser,
    matrimonyProfiles,
    createMatrimonyProfile,
    expressMatrimonyInterest,
    connectedMatrimonyIds,
    divisions,
    districts,
    upazilas
  } = useApp();

  const [genderFilter, setGenderFilter] = useState<'all' | 'male' | 'female'>('all');
  const [religionFilter, setReligionFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [interestSentId, setInterestSentId] = useState<string | null>(null);

  // Form state for creating a matrimony profile
  const [fullName, setFullName] = useState('');
  const [gender, setGender] = useState<'male' | 'female'>('male');
  const [age, setAge] = useState<number>(26);
  const [height, setHeight] = useState('৫ ফুট ৮ ইঞ্চি');
  const [religion, setReligion] = useState('ইসলাম');
  const [profession, setProfession] = useState('সফটওয়্যার ইঞ্জিনিয়ার');
  const [education, setEducation] = useState('বিএসসি ইন সিএসই, বুয়েট');
  const [familyDetails, setFamilyDetails] = useState('পিতা সরকারি কর্মকর্তা, মাতা গৃহিণী। পরিবারে ৩ ভাই-বোন।');
  const [guardianContact, setGuardianContact] = useState('017xxxxxxxx (পিতা)');
  const [aboutMe, setAboutMe] = useState('');
  const [divId, setDivId] = useState('');
  const [distId, setDistId] = useState('');
  const [upId, setUpId] = useState('');

  const filteredProfiles = matrimonyProfiles.filter(p => {
    const matchesGender = genderFilter === 'all' || p.gender === genderFilter;
    const matchesReligion = religionFilter === 'all' || p.religion === religionFilter;
    const matchesSearch =
      p.fullName.toLowerCase().includes(search.toLowerCase()) ||
      p.profession.toLowerCase().includes(search.toLowerCase()) ||
      p.education.toLowerCase().includes(search.toLowerCase());
    return matchesGender && matchesReligion && matchesSearch;
  });

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) return;

    const div = divisions.find(d => d.id === divId);
    const dist = districts.find(d => d.id === distId);
    const up = upazilas.find(u => u.id === upId);

    createMatrimonyProfile({
      fullName: fullName.trim(),
      gender,
      age: Number(age) || 25,
      height: height || "5' 5\"",
      religion,
      religiousPractice: religion === 'হিন্দু' ? 'নিয়মিত পূজা পালন' : 'নিয়মিত ৫ ওয়াক্ত নামাজী',
      maritalStatus: 'never_married',
      profession,
      education,
      hometown: dist?.bnName || 'বাংলাদেশ',
      familyDetails: familyDetails || 'পারিবারিক পরিবেশ শালীন ও মার্জিত।',
      guardianContact: guardianContact || 'অভিভাবকের যোগাযোগ সুরক্ষিত',
      partnerPreferences: aboutMe || 'পরহেজগার, মার্জিত ও দায়িত্বশীল জীবনসঙ্গী প্রত্যাশিত।',
      aboutMe,
      photoUrl: gender === 'female'
        ? 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400'
        : 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
      privacyLevel: 'public',
      isVerified: false,
      location: {
        divisionId: div?.id || 'div-7',
        divisionName: div?.bnName || 'রংপুর',
        districtId: dist?.id || 'dis-47',
        districtName: dist?.bnName || 'ঠাকুরগাঁও',
        upazilaId: up?.id,
        upazilaName: up?.bnName
      }
    });

    setFullName('');
    setCreateModalOpen(false);
  };

  const handleInterest = (profileId: string) => {
    expressMatrimonyInterest(profileId);
    setInterestSentId(profileId);
    setTimeout(() => setInterestSentId(null), 2500);
  };

  return (
    <div className="flex-1 max-w-5xl mx-auto space-y-5 pb-16">
      {/* Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-rose-200 bg-gradient-to-r from-rose-700 via-pink-700 to-rose-800 p-5 text-white shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <HeartHandshake className="h-6 w-6 text-rose-200" />
            <h2 className="text-xl font-bold">আপন ম্যাট্রিমনি ও পাত্র-পাত্রী সন্ধান</h2>
          </div>
          <p className="text-xs text-rose-100 mt-1">
            পারিবারিক সম্মান ও বিশ্বস্ততার সাথে বাংলাদেশের সকল এলাকার পাত্র-পাত্রীর পূর্ণাঙ্গ বায়োডাটা।
          </p>
        </div>
        <button
          id="create-matrimony-profile-btn"
          onClick={() => setCreateModalOpen(true)}
          className="flex items-center justify-center gap-2 rounded-xl bg-white px-4 py-2.5 text-xs font-bold text-rose-900 shadow-xs hover:bg-rose-50 active:scale-95 transition-all"
        >
          <Plus className="h-4 w-4" />
          <span>বায়োডাটা তৈরি করুন</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="পেশা, শিক্ষা বা জেলা দিয়ে খুঁজুন..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-3 py-1.5 text-xs text-slate-800 focus:border-rose-400 focus:outline-hidden"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto text-xs pb-1 sm:pb-0">
          <select
            value={genderFilter}
            onChange={e => setGenderFilter(e.target.value as any)}
            className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 font-semibold text-slate-700 focus:border-rose-400"
          >
            <option value="all">পাত্র ও পাত্রী (উভয়)</option>
            <option value="male">পাত্রের বায়োডাটা (Groom)</option>
            <option value="female">পাত্রীর বায়োডাটা (Bride)</option>
          </select>

          <select
            value={religionFilter}
            onChange={e => setReligionFilter(e.target.value)}
            className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 font-semibold text-slate-700 focus:border-rose-400"
          >
            <option value="all">সকল ধর্ম</option>
            <option value="ইসলাম">ইসলাম</option>
            <option value="হিন্দু">হিন্দু</option>
            <option value="বৌদ্ধ">বৌদ্ধ</option>
            <option value="খ্রিস্টান">খ্রিস্টান</option>
          </select>
        </div>
      </div>

      {/* Profiles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredProfiles.map(profile => {
          const hasExpressedInterest = Boolean(
            (currentUser && profile.interestedUserIds?.includes(currentUser.id)) ||
            connectedMatrimonyIds.includes(profile.id)
          );

          return (
            <div
              key={profile.id}
              className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-xs hover:border-rose-300 hover:shadow-md transition-all"
            >
              <div className="flex p-4 gap-4">
                <div className="relative shrink-0">
                  <img
                    src={profile.avatar || profile.photoUrl}
                    alt=""
                    className="h-24 w-24 rounded-2xl object-cover ring-2 ring-rose-100"
                  />
                  <span className="absolute bottom-1 right-1 rounded-md bg-white/90 backdrop-blur-xs px-1.5 py-0.5 text-[9px] font-bold text-rose-800 shadow-xs">
                    {profile.gender === 'male' ? 'পাত্র' : 'পাত্রী'}
                  </span>
                </div>

                <div className="flex-1 overflow-hidden space-y-1">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-slate-900 text-sm">{profile.fullName}</h3>
                    <span className="text-xs font-extrabold text-rose-700">{profile.age} বছর</span>
                  </div>

                  <p className="text-xs font-semibold text-slate-700 flex items-center gap-1">
                    <Briefcase className="h-3.5 w-3.5 text-rose-600 shrink-0" />
                    <span className="truncate">{profile.profession}</span>
                  </p>

                  <p className="text-xs text-slate-600 flex items-center gap-1">
                    <GraduationCap className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{profile.education}</span>
                  </p>

                  <p className="text-xs text-slate-500 flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5 text-rose-600 shrink-0" />
                    <span className="truncate">
                      {[profile.location?.upazilaName, profile.location?.districtName, profile.hometown]
                        .filter(Boolean)
                        .slice(0, 2)
                        .join(', ')}
                    </span>
                  </p>
                </div>
              </div>

              {/* Bio & Family */}
              <div className="bg-rose-50/40 p-3.5 border-t border-rose-100/60 text-xs space-y-2">
                <div>
                  <span className="font-bold text-slate-700">পারিবারিক বিবরণ: </span>
                  <span className="text-slate-600">{profile.familyDetails}</span>
                </div>
                {profile.guardianContact && (
                  <div className="flex items-center gap-1.5 text-rose-900 font-semibold bg-white p-2 rounded-xl border border-rose-200/80">
                    <Phone className="h-3.5 w-3.5 text-rose-600 shrink-0" />
                    <span>অভিভাবকের যোগাযোগ: {profile.guardianContact}</span>
                  </div>
                )}
              </div>

              {/* Action */}
              <div className="p-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] text-slate-400 flex items-center gap-1">
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                  ভেরিফাইড বায়োডাটা
                </span>

                <button
                  id={`matrimony-interest-btn-${profile.id}`}
                  onClick={() => handleInterest(profile.id)}
                  disabled={hasExpressedInterest}
                  className={`flex items-center gap-1 rounded-xl px-4 py-1.5 text-xs font-bold transition-all ${
                    hasExpressedInterest || interestSentId === profile.id
                      ? 'bg-rose-100 text-rose-800'
                      : 'bg-rose-600 text-white hover:bg-rose-700 shadow-xs'
                  }`}
                >
                  <Send className="h-3 w-3" />
                  <span>
                    {hasExpressedInterest || interestSentId === profile.id
                      ? 'আগ্রহ প্রকাশ করা হয়েছে'
                      : 'আগ্রহ প্রকাশ করুন'}
                  </span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Create Matrimony Profile Modal */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-2xl bg-white p-5 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-slate-900 text-sm">নতুন পাত্র/পাত্রীর বায়োডাটা তৈরি করুন</h3>
              <button onClick={() => setCreateModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="mt-4 space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">পাত্র/পাত্রীর নাম *</label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={e => setFullName(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 p-2 text-slate-800"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">বায়োডাটার ধরন</label>
                  <select
                    value={gender}
                    onChange={e => setGender(e.target.value as any)}
                    className="w-full rounded-lg border border-slate-200 p-2 text-slate-800"
                  >
                    <option value="male">পাত্রের বায়োডাটা (Male)</option>
                    <option value="female">পাত্রীর বায়োডাটা (Female)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">বয়স</label>
                  <input
                    type="number"
                    value={age}
                    onChange={e => setAge(Number(e.target.value))}
                    className="w-full rounded-lg border border-slate-200 p-2 text-slate-800"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">উচ্চতা</label>
                  <input
                    type="text"
                    value={height}
                    onChange={e => setHeight(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 p-2 text-slate-800"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">ধর্ম</label>
                  <select
                    value={religion}
                    onChange={e => setReligion(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 p-2 text-slate-800"
                  >
                    <option value="ইসলাম">ইসলাম</option>
                    <option value="হিন্দু">হিন্দু</option>
                    <option value="বৌদ্ধ">বৌদ্ধ</option>
                    <option value="খ্রিস্টান">খ্রিস্টান</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">পেশা ও কর্মক্ষেত্র</label>
                <input
                  type="text"
                  value={profession}
                  onChange={e => setProfession(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 p-2 text-slate-800"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">শিক্ষাগত যোগ্যতা</label>
                <input
                  type="text"
                  value={education}
                  onChange={e => setEducation(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 p-2 text-slate-800"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">পারিবারিক পরিচিতি</label>
                <textarea
                  rows={2}
                  value={familyDetails}
                  onChange={e => setFamilyDetails(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 p-2 text-slate-800"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">অভিভাবকের মোবাইল নম্বর *</label>
                <input
                  type="text"
                  required
                  placeholder="017xxxxxxxx (পিতা/মাতা/ভাই)"
                  value={guardianContact}
                  onChange={e => setGuardianContact(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 p-2 text-slate-800"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">নিজ এলাকা (Hierarchy)</label>
                <div className="grid grid-cols-3 gap-2">
                  <select
                    value={divId}
                    onChange={e => setDivId(e.target.value)}
                    className="rounded-lg border border-slate-200 p-1.5 text-slate-800"
                  >
                    <option value="">বিভাগ</option>
                    {divisions.map(d => (
                      <option key={d.id} value={d.id}>{d.bnName}</option>
                    ))}
                  </select>
                  <select
                    value={distId}
                    onChange={e => setDistId(e.target.value)}
                    className="rounded-lg border border-slate-200 p-1.5 text-slate-800"
                  >
                    <option value="">জেলা</option>
                    {districts.filter(d => !divId || d.divisionId === divId).map(d => (
                      <option key={d.id} value={d.id}>{d.bnName}</option>
                    ))}
                  </select>
                  <select
                    value={upId}
                    onChange={e => setUpId(e.target.value)}
                    className="rounded-lg border border-slate-200 p-1.5 text-slate-800"
                  >
                    <option value="">উপজেলা</option>
                    {upazilas.filter(u => !distId || u.districtId === distId).map(u => (
                      <option key={u.id} value={u.id}>{u.bnName}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="mt-4 flex justify-end gap-2 pt-2 border-t">
                <button
                  type="button"
                  onClick={() => setCreateModalOpen(false)}
                  className="rounded-xl px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-rose-600 px-5 py-2 text-xs font-bold text-white hover:bg-rose-700"
                >
                  বায়োডাটা প্রকাশ করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
