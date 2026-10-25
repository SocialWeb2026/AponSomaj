import React, { useState, useMemo } from 'react';
import {
  Briefcase,
  Users,
  Search,
  MapPin,
  Star,
  ShieldCheck,
  PhoneCall,
  Clock,
  Filter,
  PlusCircle,
  Calendar,
  AlertCircle,
  Eye,
  CheckCircle2,
  Wrench,
  ChevronRight,
  TrendingUp,
  MapPinOff,
  UserCheck,
  Building2,
  Flag,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { LabourProfile, LabourJobPost, LabourUserType } from '../types';
import { BangladeshLocationPicker } from './BangladeshLocationPicker';
import { LabourOtpModal } from './LabourOtpModal';
import { LabourContactModal } from './LabourContactModal';
import { LabourReportModal } from './LabourReportModal';

export const LabourMarketplace: React.FC = () => {
  const {
    currentUser,
    setAuthModalOpen,
    labourCategories,
    labourSkills,
    labourProfiles,
    labourJobPosts,
    labourActiveTab,
    setLabourActiveTab,
    currentUserLabourProfile,
    upsertLabourProfile,
    createLabourJobPost,
    divisions,
    districts,
    upazilas,
    unions,
    wards,
  } = useApp();

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedSkill, setSelectedSkill] = useState<string>('all');
  const [selectedAvailability, setSelectedAvailability] = useState<string>('all');
  const [selectedExperience, setSelectedExperience] = useState<string>('all');

  // Location filter state
  const [filterDivisionId, setFilterDivisionId] = useState<string | undefined>(undefined);
  const [filterDistrictId, setFilterDistrictId] = useState<string | undefined>(undefined);
  const [filterUpazilaId, setFilterUpazilaId] = useState<string | undefined>(undefined);
  const [filterUnionId, setFilterUnionId] = useState<string | undefined>(undefined);
  const [filterWardId, setFilterWardId] = useState<string | undefined>(undefined);
  const [showLocationFilter, setShowLocationFilter] = useState(false);

  // Modals
  const [contactModalData, setContactModalData] = useState<{
    isOpen: boolean;
    targetType: 'worker' | 'job';
    worker?: LabourProfile;
    job?: LabourJobPost;
  }>({ isOpen: false, targetType: 'worker' });

  const [reportModalData, setReportModalData] = useState<{
    isOpen: boolean;
    targetType: 'worker_profile' | 'job_post' | 'contact_request';
    targetId: string;
    targetTitle?: string;
  }>({ isOpen: false, targetType: 'worker_profile', targetId: '' });

  const [selectedWorkerDetail, setSelectedWorkerDetail] = useState<LabourProfile | null>(null);
  const [otpModalOpen, setOtpModalOpen] = useState(false);

  // Worker Registration / Edit Profile Form State
  const [workerFullName, setWorkerFullName] = useState(
    currentUserLabourProfile?.fullName || currentUser?.bnName || currentUser?.name || ''
  );
  const [workerPhone, setWorkerPhone] = useState(
    currentUserLabourProfile?.phone || currentUser?.phone || ''
  );
  const [workerIsPhoneVerified, setWorkerIsPhoneVerified] = useState(
    currentUserLabourProfile?.isPhoneVerified ?? true
  );
  const [workerUserType, setWorkerUserType] = useState<LabourUserType>(
    currentUserLabourProfile?.userType || 'looking_for_work'
  );
  const [workerCategory, setWorkerCategory] = useState(
    currentUserLabourProfile?.categoryId || 'construction'
  );
  const [workerSkill, setWorkerSkill] = useState(
    currentUserLabourProfile?.skillId || 'mason'
  );
  const [workerSpecificSkill, setWorkerSpecificSkill] = useState(
    currentUserLabourProfile?.specificSkill || 'রাজমিস্ত্রি'
  );
  const [workerExpYears, setWorkerExpYears] = useState<number>(
    currentUserLabourProfile?.experienceYears ?? 4
  );
  const [workerExpLevel, setWorkerExpLevel] = useState(
    currentUserLabourProfile?.experienceLevel || 'দক্ষ কারিগর'
  );
  const [workerDailyWage, setWorkerDailyWage] = useState<number>(
    currentUserLabourProfile?.expectedDailyWage ?? 800
  );
  const [workerMonthlyWage, setWorkerMonthlyWage] = useState<number>(
    currentUserLabourProfile?.expectedMonthlyWage ?? 20000
  );
  const [workerAvailability, setWorkerAvailability] = useState(
    currentUserLabourProfile?.availability || 'available_today'
  );
  const [workerTravelDistance, setWorkerTravelDistance] = useState(
    currentUserLabourProfile?.maxTravelDistance || 'same_upazila'
  );
  const [workerBio, setWorkerBio] = useState(currentUserLabourProfile?.bio || '');
  const [workerHistory, setWorkerHistory] = useState(
    currentUserLabourProfile?.workHistory || ''
  );

  // Worker Location Form State
  const [regDivisionId, setRegDivisionId] = useState<string | undefined>(
    currentUserLabourProfile?.location?.divisionId || currentUser?.divisionId
  );
  const [regDistrictId, setRegDistrictId] = useState<string | undefined>(
    currentUserLabourProfile?.location?.districtId || currentUser?.districtId
  );
  const [regUpazilaId, setRegUpazilaId] = useState<string | undefined>(
    currentUserLabourProfile?.location?.upazilaId || currentUser?.upazilaId
  );
  const [regUnionId, setRegUnionId] = useState<string | undefined>(
    currentUserLabourProfile?.location?.unionId || currentUser?.unionId
  );
  const [regWardId, setRegWardId] = useState<string | undefined>(
    currentUserLabourProfile?.location?.wardId || currentUser?.wardId
  );
  const [regCustomLoc, setRegCustomLoc] = useState(
    currentUserLabourProfile?.locationCustom || ''
  );

  const [workerSaveSuccess, setWorkerSaveSuccess] = useState(false);

  // Job Post Form State
  const [jobTitle, setJobTitle] = useState('');
  const [jobCategory, setJobCategory] = useState('construction');
  const [jobSkill, setJobSkill] = useState('mason');
  const [jobSpecificSkill, setJobSpecificSkill] = useState('রাজমিস্ত্রি');
  const [jobWorkersNeeded, setJobWorkersNeeded] = useState(1);
  const [jobWageAmount, setJobWageAmount] = useState(800);
  const [jobWageType, setJobWageType] = useState<'daily' | 'contract' | 'monthly'>('daily');
  const [jobDuration, setJobDuration] = useState('১ দিন');
  const [jobWorkDate, setJobWorkDate] = useState('আগামীকাল সকাল ৮টা');
  const [jobDescription, setJobDescription] = useState('');
  const [jobAddressDetails, setJobAddressDetails] = useState('');
  const [jobPostSuccess, setJobPostSuccess] = useState(false);

  // Job Location State
  const [jobDivisionId, setJobDivisionId] = useState<string | undefined>(currentUser?.divisionId);
  const [jobDistrictId, setJobDistrictId] = useState<string | undefined>(currentUser?.districtId);
  const [jobUpazilaId, setJobUpazilaId] = useState<string | undefined>(currentUser?.upazilaId);
  const [jobUnionId, setJobUnionId] = useState<string | undefined>(currentUser?.unionId);
  const [jobWardId, setJobWardId] = useState<string | undefined>(currentUser?.wardId);

  // Helper location resolver
  const getLocationName = (loc?: {
    divisionId?: string;
    districtId?: string;
    upazilaId?: string;
    unionId?: string;
    wardId?: string;
  }) => {
    if (!loc) return 'বাংলাদেশ';
    const parts: string[] = [];
    if (loc.wardId) {
      const w = wards.find((i) => i.id === loc.wardId);
      if (w) parts.push(w.bnName || w.name);
    }
    if (loc.unionId) {
      const u = unions.find((i) => i.id === loc.unionId);
      if (u) parts.push(u.bnName || u.name);
    }
    if (loc.upazilaId) {
      const up = upazilas.find((i) => i.id === loc.upazilaId);
      if (up) parts.push(up.bnName || up.name);
    }
    if (loc.districtId) {
      const d = districts.find((i) => i.id === loc.districtId);
      if (d) parts.push(d.bnName || d.name);
    }
    return parts.length > 0 ? parts.join(', ') : 'বাংলাদেশ';
  };

  // Filtered Workers
  const filteredWorkers = useMemo(() => {
    return labourProfiles.filter((worker) => {
      // User type filter: only workers or both
      if (worker.userType === 'hiring_workers') return false;

      // Category filter
      if (selectedCategory !== 'all' && worker.categoryId !== selectedCategory) return false;

      // Skill filter
      if (selectedSkill !== 'all' && worker.skillId !== selectedSkill) return false;

      // Availability filter
      if (selectedAvailability !== 'all' && worker.availability !== selectedAvailability)
        return false;

      // Experience level filter
      if (selectedExperience !== 'all' && worker.experienceLevel !== selectedExperience)
        return false;

      // Location Hierarchical matching
      if (filterDivisionId && worker.location.divisionId !== filterDivisionId) return false;
      if (filterDistrictId && worker.location.districtId !== filterDistrictId) return false;
      if (filterUpazilaId && worker.location.upazilaId !== filterUpazilaId) return false;
      if (filterUnionId && worker.location.unionId !== filterUnionId) return false;
      if (filterWardId && worker.location.wardId !== filterWardId) return false;

      // Search query (worker name, specific skill, bio)
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = worker.fullName.toLowerCase().includes(q);
        const matchesSkill = worker.specificSkill?.toLowerCase().includes(q);
        const matchesBio = worker.bio?.toLowerCase().includes(q);
        if (!matchesName && !matchesSkill && !matchesBio) return false;
      }

      return true;
    });
  }, [
    labourProfiles,
    selectedCategory,
    selectedSkill,
    selectedAvailability,
    selectedExperience,
    filterDivisionId,
    filterDistrictId,
    filterUpazilaId,
    filterUnionId,
    filterWardId,
    searchQuery,
  ]);

  // Filtered Jobs
  const filteredJobs = useMemo(() => {
    return labourJobPosts.filter((job) => {
      if (selectedCategory !== 'all' && job.categoryId !== selectedCategory) return false;
      if (selectedSkill !== 'all' && job.skillId !== selectedSkill) return false;

      if (filterDivisionId && job.location.divisionId !== filterDivisionId) return false;
      if (filterDistrictId && job.location.districtId !== filterDistrictId) return false;
      if (filterUpazilaId && job.location.upazilaId !== filterUpazilaId) return false;
      if (filterUnionId && job.location.unionId !== filterUnionId) return false;
      if (filterWardId && job.location.wardId !== filterWardId) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = job.title.toLowerCase().includes(q);
        const matchesDesc = job.description.toLowerCase().includes(q);
        const matchesSkill = job.specificSkill?.toLowerCase().includes(q);
        if (!matchesTitle && !matchesDesc && !matchesSkill) return false;
      }

      return true;
    });
  }, [
    labourJobPosts,
    selectedCategory,
    selectedSkill,
    filterDivisionId,
    filterDistrictId,
    filterUpazilaId,
    filterUnionId,
    filterWardId,
    searchQuery,
  ]);

  // Availability label helper
  const getAvailabilityBadge = (avail: string) => {
    switch (avail) {
      case 'available_today':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-800">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-600 animate-pulse" />
            আজই পাওয়া যাবে
          </span>
        );
      case 'available_this_week':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-semibold text-blue-800">
            এই সপ্তাহে
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-600">
            বর্তমানে ব্যস্ত
          </span>
        );
    }
  };

  const handleSaveWorkerProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      setAuthModalOpen(true);
      return;
    }

    await upsertLabourProfile({
      fullName: workerFullName,
      phone: workerPhone,
      isPhoneVerified: workerIsPhoneVerified,
      userType: workerUserType,
      categoryId: workerCategory,
      skillId: workerSkill,
      specificSkill: workerSpecificSkill,
      experienceYears: Number(workerExpYears),
      experienceLevel: workerExpLevel,
      expectedDailyWage: Number(workerDailyWage),
      expectedMonthlyWage: Number(workerMonthlyWage),
      availability: workerAvailability,
      maxTravelDistance: workerTravelDistance,
      bio: workerBio,
      workHistory: workerHistory,
      location: {
        divisionId: regDivisionId,
        districtId: regDistrictId,
        upazilaId: regUpazilaId,
        unionId: regUnionId,
        wardId: regWardId,
      },
      locationCustom: regCustomLoc,
    });

    setWorkerSaveSuccess(true);
    setTimeout(() => setWorkerSaveSuccess(false), 3000);
  };

  const handleCreateJob = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      setAuthModalOpen(true);
      return;
    }

    await createLabourJobPost({
      title: jobTitle,
      categoryId: jobCategory,
      skillId: jobSkill,
      specificSkill: jobSpecificSkill,
      workersNeeded: Number(jobWorkersNeeded),
      wageAmount: Number(jobWageAmount),
      wageType: jobWageType,
      duration: jobDuration,
      workDate: jobWorkDate,
      description: jobDescription,
      addressDetails: jobAddressDetails,
      location: {
        divisionId: jobDivisionId,
        districtId: jobDistrictId,
        upazilaId: jobUpazilaId,
        unionId: jobUnionId,
        wardId: jobWardId,
      },
    });

    setJobPostSuccess(true);
    setJobTitle('');
    setJobDescription('');
    setJobAddressDetails('');
    setTimeout(() => {
      setJobPostSuccess(false);
      setLabourActiveTab('jobs');
    }, 1500);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-16">
      {/* 1. HERO BANNER & STATS */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-700 via-emerald-800 to-teal-900 p-6 sm:p-8 text-white shadow-xl">
        <div className="relative z-10 space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold backdrop-blur-md border border-white/20">
            <Wrench className="h-3.5 w-3.5 text-emerald-300" />
            <span>আপন সমাজ — স্থানীয় শ্রম বাজার ও কর্মসংস্থান</span>
          </div>

          <div className="max-w-2xl">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-white leading-tight">
              কাজ চাই / শ্রমিক চাই
            </h1>
            <p className="mt-2 text-sm sm:text-base text-emerald-100 font-normal leading-relaxed">
              আপনার নিজ গ্রাম, ওয়ার্ড ও উপজেলার দক্ষ কারিগর, মিস্ত্রি, দিনমজুর ও শ্রমিকদের সরাসরি খুঁজুন
              বা কাজের প্রয়োজন পোস্ট করুন। কোনো মধ্যস্বত্বভোগী নেই, নিরাপদ সরাসরি সংযোগ।
            </p>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
            <div className="rounded-2xl bg-white/10 p-3 backdrop-blur-sm border border-white/10">
              <span className="text-xs text-emerald-200 block">নিবন্ধিত শ্রমিক</span>
              <span className="text-xl sm:text-2xl font-black text-white">{labourProfiles.length}+</span>
            </div>
            <div className="rounded-2xl bg-white/10 p-3 backdrop-blur-sm border border-white/10">
              <span className="text-xs text-emerald-200 block">চলতি কাজের চাহিদা</span>
              <span className="text-xl sm:text-2xl font-black text-white">{labourJobPosts.length} টি</span>
            </div>
            <div className="rounded-2xl bg-white/10 p-3 backdrop-blur-sm border border-white/10">
              <span className="text-xs text-emerald-200 block">কাজের ক্যাটাগরি</span>
              <span className="text-xl sm:text-2xl font-black text-white">{labourCategories.length} টি</span>
            </div>
            <div className="rounded-2xl bg-white/10 p-3 backdrop-blur-sm border border-white/10">
              <span className="text-xs text-emerald-200 block">এলাকা কভারেজ</span>
              <span className="text-xl sm:text-2xl font-black text-white">ওয়ার্ড ভিত্তিক</span>
            </div>
          </div>
        </div>

        {/* Decorative Background Circles */}
        <div className="absolute -top-12 -right-12 h-64 w-64 rounded-full bg-emerald-500/20 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-12 -left-12 h-64 w-64 rounded-full bg-teal-500/20 blur-3xl pointer-events-none" />
      </div>

      {/* 2. FOUR MAIN ACTION TABS */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-4">
        <button
          onClick={() => setLabourActiveTab('workers')}
          className={`flex flex-col items-center justify-center p-4 rounded-2xl border transition-all duration-200 text-center ${
            labourActiveTab === 'workers'
              ? 'border-emerald-600 bg-emerald-50 text-emerald-900 shadow-md ring-2 ring-emerald-500/30 font-bold scale-[1.02]'
              : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50 hover:border-gray-300 font-medium'
          }`}
        >
          <Search className="h-6 w-6 mb-2 text-emerald-600" />
          <span className="text-sm sm:text-base">🔍 শ্রমিক খুঁজুন</span>
          <span className="text-xs text-gray-500 mt-0.5">লোকেশন ভিত্তিক ডিরেক্টরি</span>
        </button>

        <button
          onClick={() => setLabourActiveTab('jobs')}
          className={`flex flex-col items-center justify-center p-4 rounded-2xl border transition-all duration-200 text-center ${
            labourActiveTab === 'jobs'
              ? 'border-emerald-600 bg-emerald-50 text-emerald-900 shadow-md ring-2 ring-emerald-500/30 font-bold scale-[1.02]'
              : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50 hover:border-gray-300 font-medium'
          }`}
        >
          <Briefcase className="h-6 w-6 mb-2 text-blue-600" />
          <span className="text-sm sm:text-base">📋 কাজ খুঁজুন</span>
          <span className="text-xs text-gray-500 mt-0.5">খোলা কাজের চাহিদা</span>
        </button>

        <button
          onClick={() => {
            if (!currentUser) setAuthModalOpen(true);
            else setLabourActiveTab('register_worker');
          }}
          className={`flex flex-col items-center justify-center p-4 rounded-2xl border transition-all duration-200 text-center ${
            labourActiveTab === 'register_worker'
              ? 'border-emerald-600 bg-emerald-50 text-emerald-900 shadow-md ring-2 ring-emerald-500/30 font-bold scale-[1.02]'
              : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50 hover:border-gray-300 font-medium'
          }`}
        >
          <UserCheck className="h-6 w-6 mb-2 text-amber-600" />
          <span className="text-sm sm:text-base">🧑‍🔧 কাজ চাই</span>
          <span className="text-xs text-gray-500 mt-0.5">আমার শ্রমিক প্রোফাইল</span>
        </button>

        <button
          onClick={() => {
            if (!currentUser) setAuthModalOpen(true);
            else setLabourActiveTab('post_job');
          }}
          className={`flex flex-col items-center justify-center p-4 rounded-2xl border transition-all duration-200 text-center ${
            labourActiveTab === 'post_job'
              ? 'border-emerald-600 bg-emerald-50 text-emerald-900 shadow-md ring-2 ring-emerald-500/30 font-bold scale-[1.02]'
              : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50 hover:border-gray-300 font-medium'
          }`}
        >
          <Building2 className="h-6 w-6 mb-2 text-purple-600" />
          <span className="text-sm sm:text-base">👷 শ্রমিক চাই</span>
          <span className="text-xs text-gray-500 mt-0.5">কাজের চাহিদা পোস্ট করুন</span>
        </button>
      </div>

      {/* 3. SEARCH & FILTERS (Active on Workers & Jobs directory views) */}
      {(labourActiveTab === 'workers' || labourActiveTab === 'jobs') && (
        <div className="rounded-2xl border border-gray-200 bg-white p-4 sm:p-5 shadow-xs space-y-4">
          {/* Top Search Input & Location Filter Button */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={
                  labourActiveTab === 'workers'
                    ? 'শ্রমিকের নাম বা দক্ষতা লিখুন (যেমন: রাজমিস্ত্রি, ইলেকট্রিশিয়ান, ড্রাইভার)...'
                    : 'কাজের বিবরণ বা শিরোনাম লিখুন...'
                }
                className="w-full rounded-xl border border-gray-300 pl-10 pr-4 py-2.5 text-sm focus:border-emerald-500 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>

            <button
              onClick={() => setShowLocationFilter(!showLocationFilter)}
              className={`flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold border transition ${
                showLocationFilter || filterDivisionId
                  ? 'border-emerald-600 bg-emerald-50 text-emerald-800'
                  : 'border-gray-300 bg-gray-50 text-gray-700 hover:bg-gray-100'
              }`}
            >
              <MapPin className="h-4 w-4 text-emerald-600" />
              <span>
                {filterWardId || filterUnionId || filterUpazilaId || filterDistrictId
                  ? 'লোকেশন ফিল্টার সক্রিয়'
                  : 'লোকেশন নির্বাচন (ওয়ার্ড/উপজেলা)'}
              </span>
            </button>
          </div>

          {/* Expandable Bangladesh Location Filter */}
          {showLocationFilter && (
            <div className="rounded-xl border border-emerald-200/80 bg-emerald-50/50 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-900 flex items-center gap-1.5">
                  <MapPin className="h-4 w-4 text-emerald-700" />
                  নির্দিষ্ট এলাকা অনুসারে খুঁজুন (বিভাগ → জেলা → উপজেলা → ইউনিয়ন → ওয়ার্ড):
                </span>
                {(filterDivisionId || filterDistrictId || filterUpazilaId) && (
                  <button
                    onClick={() => {
                      setFilterDivisionId(undefined);
                      setFilterDistrictId(undefined);
                      setFilterUpazilaId(undefined);
                      setFilterUnionId(undefined);
                      setFilterWardId(undefined);
                    }}
                    className="text-xs font-semibold text-rose-600 hover:underline"
                  >
                    রিসেট করুন
                  </button>
                )}
              </div>

              <BangladeshLocationPicker
                value={{
                  divisionId: filterDivisionId,
                  districtId: filterDistrictId,
                  upazilaId: filterUpazilaId,
                  unionId: filterUnionId,
                  wardId: filterWardId,
                }}
                onChange={(loc) => {
                  setFilterDivisionId(loc.divisionId);
                  setFilterDistrictId(loc.districtId);
                  setFilterUpazilaId(loc.upazilaId);
                  setFilterUnionId(loc.unionId);
                  setFilterWardId(loc.wardId);
                }}
                showAllOption={true}
              />
            </div>
          )}

          {/* Horizontal Category Chips */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
            <span className="text-gray-500 font-semibold shrink-0">ক্যাটাগরি:</span>
            <button
              onClick={() => {
                setSelectedCategory('all');
                setSelectedSkill('all');
              }}
              className={`rounded-full px-3 py-1.5 font-medium shrink-0 transition ${
                selectedCategory === 'all'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              সকল কাজ ({labourProfiles.length})
            </button>
            {labourCategories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => {
                  setSelectedCategory(cat.id);
                  setSelectedSkill('all');
                }}
                className={`rounded-full px-3 py-1.5 font-medium shrink-0 flex items-center gap-1.5 transition ${
                  selectedCategory === cat.id
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <span>{cat.icon}</span>
                <span>{cat.bnName}</span>
              </button>
            ))}
          </div>

          {/* Secondary Filters for Availability & Experience */}
          {labourActiveTab === 'workers' && (
            <div className="flex flex-wrap items-center gap-3 pt-1 text-xs border-t border-gray-100">
              <div className="flex items-center gap-1.5">
                <span className="text-gray-500 font-medium">উপলব্ধতা:</span>
                <select
                  value={selectedAvailability}
                  onChange={(e) => setSelectedAvailability(e.target.value)}
                  className="rounded-lg border border-gray-300 bg-white py-1 px-2.5 text-xs focus:border-emerald-500 focus:outline-hidden"
                >
                  <option value="all">সব সময়</option>
                  <option value="available_today">আজই পাওয়া যাবে</option>
                  <option value="available_this_week">এই সপ্তাহে পাওয়া যাবে</option>
                </select>
              </div>

              <div className="flex items-center gap-1.5">
                <span className="text-gray-500 font-medium">অভিজ্ঞতা:</span>
                <select
                  value={selectedExperience}
                  onChange={(e) => setSelectedExperience(e.target.value)}
                  className="rounded-lg border border-gray-300 bg-white py-1 px-2.5 text-xs focus:border-emerald-500 focus:outline-hidden"
                >
                  <option value="all">সব অভিজ্ঞতা স্তর</option>
                  <option value="ওস্তাদ / ফোরম্যান">ওস্তাদ / ফোরম্যান</option>
                  <option value="দক্ষ কারিগর">দক্ষ কারিগর</option>
                  <option value="শিক্ষানবিস / সহকারী">শিক্ষানবিস / সহকারী</option>
                </select>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 4. TAB CONTENT: 🔍 WORKER DIRECTORY */}
      {labourActiveTab === 'workers' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <Users className="h-5 w-5 text-emerald-600" />
              <span>উপলব্ধ দক্ষ শ্রমিক তালিকা ({filteredWorkers.length})</span>
            </h2>
            <span className="text-xs text-gray-500">
              ওয়ার্ড ও এলাকাভিত্তিক ফলাফল
            </span>
          </div>

          {filteredWorkers.length === 0 ? (
            <div className="rounded-2xl border border-gray-200 bg-white p-12 text-center space-y-3">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-gray-100 text-gray-400">
                <MapPinOff className="h-7 w-7" />
              </div>
              <h3 className="text-base font-bold text-gray-900">কোনো শ্রমিক পাওয়া যায়নি</h3>
              <p className="text-xs text-gray-500 max-w-md mx-auto">
                আপনার নির্বাচিত এলাকা বা ক্যাটাগরিতে এখনও কোনো শ্রমিক নিবন্ধিত নেই। ফিল্টার শিথিল করুন অথবা প্রথম শ্রমিক হিসেবে নিজের প্রোফাইল যোগ করুন!
              </p>
              <button
                onClick={() => {
                  setSelectedCategory('all');
                  setFilterDivisionId(undefined);
                  setFilterDistrictId(undefined);
                  setFilterUpazilaId(undefined);
                  setFilterUnionId(undefined);
                  setFilterWardId(undefined);
                  setSearchQuery('');
                }}
                className="mt-2 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-700"
              >
                সব ফিল্টার মুছুন
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredWorkers.map((worker) => (
                <div
                  key={worker.id}
                  className="rounded-2xl border border-gray-200/90 bg-white p-4 shadow-xs hover:shadow-md hover:border-emerald-300 transition-all flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    {/* Header with Avatar, Name, Verification, Rating */}
                    <div className="flex items-start gap-3">
                      <img
                        src={worker.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'}
                        alt={worker.fullName}
                        className="h-13 w-13 rounded-2xl object-cover border border-emerald-200 shrink-0"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <h3 className="text-sm font-bold text-gray-900 truncate">
                            {worker.fullName}
                          </h3>
                          {worker.isVerified && (
                            <span title="যাচাইকৃত শ্রমিক">
                              <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0" />
                            </span>
                          )}
                        </div>

                        {/* Skill Badge */}
                        <div className="mt-1 flex items-center gap-1.5 flex-wrap">
                          <span className="rounded-md bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-800 border border-emerald-200/60">
                            {worker.specificSkill || 'কারিগর'}
                          </span>
                          <span className="rounded-md bg-amber-50 px-2 py-0.5 text-[11px] font-medium text-amber-800 border border-amber-200/60">
                            {worker.experienceLevel}
                          </span>
                        </div>

                        {/* Rating & Jobs count */}
                        <div className="mt-1 flex items-center gap-2 text-xs text-gray-500">
                          <span className="flex items-center gap-0.5 text-amber-600 font-bold">
                            <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                            {worker.rating?.toFixed(1) || '5.0'}
                          </span>
                          <span>•</span>
                          <span>{worker.completedJobsCount} টি কাজ সম্পন্ন</span>
                        </div>
                      </div>
                    </div>

                    {/* Location Badge with Ward / Union */}
                    <div className="flex items-start gap-1.5 text-xs text-gray-600 bg-gray-50 rounded-xl p-2.5 border border-gray-100">
                      <MapPin className="h-3.5 w-3.5 text-rose-500 shrink-0 mt-0.5" />
                      <div className="leading-snug">
                        <span className="font-semibold text-gray-800">
                          {getLocationName(worker.location)}
                        </span>
                        {worker.locationCustom && (
                          <span className="text-gray-500 block text-[11px]">
                            ({worker.locationCustom})
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Wage & Availability */}
                    <div className="flex items-center justify-between pt-1 text-xs">
                      <div>
                        <span className="text-gray-400 block text-[11px]">দৈনিক মজুরি</span>
                        <span className="text-sm font-extrabold text-emerald-700">
                          ৳{worker.expectedDailyWage || 600}
                        </span>
                      </div>

                      <div className="text-right">
                        <span className="text-gray-400 block text-[11px] mb-0.5">বর্তমান অবস্থা</span>
                        {getAvailabilityBadge(worker.availability)}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="mt-4 pt-3 border-t border-gray-100 flex gap-2">
                    <button
                      onClick={() => setSelectedWorkerDetail(worker)}
                      className="w-1/2 flex items-center justify-center gap-1 rounded-xl border border-gray-300 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition"
                    >
                      <Eye className="h-3.5 w-3.5" />
                      প্রোফাইল
                    </button>
                    <button
                      onClick={() => {
                        setContactModalData({
                          isOpen: true,
                          targetType: 'worker',
                          worker,
                        });
                      }}
                      className="w-1/2 flex items-center justify-center gap-1 rounded-xl bg-emerald-600 py-2 text-xs font-bold text-white shadow-xs hover:bg-emerald-700 transition"
                    >
                      <PhoneCall className="h-3.5 w-3.5" />
                      যোগাযোগ
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 5. TAB CONTENT: 📋 JOB DIRECTORY */}
      {labourActiveTab === 'jobs' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <Briefcase className="h-5 w-5 text-blue-600" />
              <span>চলতি কাজের চাহিদা ও নিয়োগ বিজ্ঞপ্তি ({filteredJobs.length})</span>
            </h2>
            <button
              onClick={() => {
                if (!currentUser) setAuthModalOpen(true);
                else setLabourActiveTab('post_job');
              }}
              className="flex items-center gap-1 text-xs font-bold text-emerald-700 hover:text-emerald-800"
            >
              <PlusCircle className="h-4 w-4" />
              নতুন চাহিদা দিন
            </button>
          </div>

          {filteredJobs.length === 0 ? (
            <div className="rounded-2xl border border-gray-200 bg-white p-12 text-center space-y-3">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-gray-100 text-gray-400">
                <Briefcase className="h-7 w-7" />
              </div>
              <h3 className="text-base font-bold text-gray-900">কোনো কাজের চাহিদা পাওয়া যায়নি</h3>
              <p className="text-xs text-gray-500 max-w-md mx-auto">
                এই মুহূর্তে আপনার ফিল্টার অনুসারে কোনো কাজের পোস্ট নেই। আপনি নিজেই একটি কাজের চাহিদা পোস্ট করতে পারেন।
              </p>
              <button
                onClick={() => setLabourActiveTab('post_job')}
                className="mt-2 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-700"
              >
                কাজের চাহিদা পোস্ট করুন
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredJobs.map((job) => (
                <div
                  key={job.id}
                  className="rounded-2xl border border-gray-200/90 bg-white p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-3"
                >
                  <div className="space-y-2.5">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="text-base font-bold text-gray-900 leading-snug">
                          {job.title}
                        </h3>
                        <div className="mt-1 flex items-center gap-2 flex-wrap text-xs">
                          <span className="rounded-md bg-blue-50 px-2 py-0.5 font-semibold text-blue-800 border border-blue-200/60">
                            {job.specificSkill || 'কারিগর প্রয়োজন'}
                          </span>
                          <span className="rounded-md bg-purple-50 px-2 py-0.5 font-semibold text-purple-800 border border-purple-200/60">
                            {job.workersNeeded} জন শ্রমিক প্রয়োজন
                          </span>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="text-xs text-gray-400 block">মজুরি</span>
                        <span className="text-base font-black text-emerald-700">
                          ৳{job.wageAmount}
                        </span>
                        <span className="text-[10px] text-gray-500 block">
                          /{job.wageType === 'daily' ? 'দিন' : job.wageType === 'monthly' ? 'মাস' : 'চুক্তি'}
                        </span>
                      </div>
                    </div>

                    <p className="text-xs text-gray-600 leading-relaxed line-clamp-3">
                      {job.description}
                    </p>

                    <div className="flex items-center gap-4 text-xs text-gray-500 pt-1">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5 text-gray-400" />
                        {job.workDate || 'জরুরি'}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5 text-gray-400" />
                        {job.duration || '১ দিন'}
                      </span>
                    </div>

                    <div className="flex items-start gap-1.5 text-xs text-gray-700 bg-gray-50 rounded-xl p-2.5 border border-gray-100">
                      <MapPin className="h-3.5 w-3.5 text-rose-500 shrink-0 mt-0.5" />
                      <span>{getLocationName(job.location)}</span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-gray-100 flex gap-2">
                    <button
                      onClick={() => {
                        setContactModalData({
                          isOpen: true,
                          targetType: 'job',
                          job,
                        });
                      }}
                      className="w-full flex items-center justify-center gap-2 rounded-xl bg-emerald-600 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-emerald-700 transition"
                    >
                      <CheckCircle2 className="h-4 w-4" />
                      আবেদন বা যোগাযোগ করুন
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 6. TAB CONTENT: 🧑‍🔧 "কাজ চাই" (WORKER REGISTRATION & PROFILE FORM) */}
      {labourActiveTab === 'register_worker' && (
        <div className="rounded-3xl border border-gray-200 bg-white p-6 sm:p-8 shadow-sm space-y-6">
          <div className="border-b border-gray-100 pb-4">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
                <UserCheck className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  শ্রম বাজার প্রোফাইল নিবন্ধন / হালনাগাদ
                </h2>
                <p className="text-xs text-gray-500">
                  আপনার এলাকার নিয়োগকর্তাদের নিকট সহজে পৌঁছাতে সঠিক তথ্য ও দক্ষতা পূরণ করুন
                </p>
              </div>
            </div>
          </div>

          {workerSaveSuccess && (
            <div className="rounded-2xl bg-emerald-50 border border-emerald-200 p-4 text-emerald-800 text-sm flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
              <span>আপনার শ্রম বাজার প্রোফাইল সফলভাবে সংরক্ষিত ও প্রকাশিত হয়েছে!</span>
            </div>
          )}

          <form onSubmit={handleSaveWorkerProfile} className="space-y-5">
            {/* User Type */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-800">অংশগ্রহণের ধরন *</label>
              <div className="grid grid-cols-3 gap-2.5">
                <button
                  type="button"
                  onClick={() => setWorkerUserType('looking_for_work')}
                  className={`py-3 px-2 rounded-xl border text-xs font-bold transition text-center ${
                    workerUserType === 'looking_for_work'
                      ? 'border-emerald-600 bg-emerald-50 text-emerald-900 ring-2 ring-emerald-500/20'
                      : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  কাজ চাই (শ্রমিক)
                </button>
                <button
                  type="button"
                  onClick={() => setWorkerUserType('hiring_workers')}
                  className={`py-3 px-2 rounded-xl border text-xs font-bold transition text-center ${
                    workerUserType === 'hiring_workers'
                      ? 'border-emerald-600 bg-emerald-50 text-emerald-900 ring-2 ring-emerald-500/20'
                      : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  শ্রমিক চাই (নিয়োগকর্তা)
                </button>
                <button
                  type="button"
                  onClick={() => setWorkerUserType('both')}
                  className={`py-3 px-2 rounded-xl border text-xs font-bold transition text-center ${
                    workerUserType === 'both'
                      ? 'border-emerald-600 bg-emerald-50 text-emerald-900 ring-2 ring-emerald-500/20'
                      : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  উভয়ই (শ্রমিক ও নিয়োগকর্তা)
                </button>
              </div>
            </div>

            {/* Basic Info: Full Name & Phone with OTP */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-800">পূর্ণ নাম *</label>
                <input
                  type="text"
                  required
                  value={workerFullName}
                  onChange={(e) => setWorkerFullName(e.target.value)}
                  placeholder="যেমন: মোঃ রফিকুল ইসলাম"
                  className="w-full rounded-xl border border-gray-300 p-3 text-sm focus:border-emerald-500 focus:outline-hidden"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-800 flex items-center justify-between">
                  <span>মোবাইল নম্বর *</span>
                  {workerIsPhoneVerified ? (
                    <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1">
                      <ShieldCheck className="h-3.5 w-3.5" />
                      ওটিপি যাচাইকৃত
                    </span>
                  ) : (
                    <span className="text-xs text-amber-600 font-medium">যাচাই বাকি</span>
                  )}
                </label>
                <div className="flex gap-2">
                  <input
                    type="tel"
                    required
                    value={workerPhone}
                    onChange={(e) => setWorkerPhone(e.target.value)}
                    placeholder="01XXXXXXXXX"
                    className="flex-1 rounded-xl border border-gray-300 p-3 text-sm focus:border-emerald-500 focus:outline-hidden"
                  />
                  <button
                    type="button"
                    onClick={() => setOtpModalOpen(true)}
                    className="shrink-0 rounded-xl bg-emerald-100 px-3.5 py-3 text-xs font-bold text-emerald-800 hover:bg-emerald-200 transition"
                  >
                    {workerIsPhoneVerified ? 'পুনরায় যাচাই' : 'OTP যাচাই'}
                  </button>
                </div>
              </div>
            </div>

            {/* Category & Specific Skill */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-800">কাজের প্রধান ক্ষেত্র *</label>
                <select
                  value={workerCategory}
                  onChange={(e) => setWorkerCategory(e.target.value)}
                  className="w-full rounded-xl border border-gray-300 p-3 text-sm bg-white focus:border-emerald-500 focus:outline-hidden"
                >
                  {labourCategories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.bnName}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-800">নির্দিষ্ট দক্ষতা *</label>
                <input
                  type="text"
                  required
                  value={workerSpecificSkill}
                  onChange={(e) => setWorkerSpecificSkill(e.target.value)}
                  placeholder="যেমন: রাজমিস্ত্রি, পাইপ ফিটিংস, টাইলস মিস্ত্রি"
                  className="w-full rounded-xl border border-gray-300 p-3 text-sm focus:border-emerald-500 focus:outline-hidden"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-800">দক্ষতার স্তর *</label>
                <select
                  value={workerExpLevel}
                  onChange={(e) => setWorkerExpLevel(e.target.value)}
                  className="w-full rounded-xl border border-gray-300 p-3 text-sm bg-white focus:border-emerald-500 focus:outline-hidden"
                >
                  <option value="ওস্তাদ / ফোরম্যান">ওস্তাদ / ফোরম্যান (হেড মিস্ত্রি)</option>
                  <option value="দক্ষ কারিগর">দক্ষ কারিগর (পূর্ণ দক্ষ)</option>
                  <option value="শিক্ষানবিস / সহকারী">শিক্ষানবিস / সহকারী (হেলপার)</option>
                </select>
              </div>
            </div>

            {/* Wages & Experience Years */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-800">অভিজ্ঞতার সময় (বছর) *</label>
                <input
                  type="number"
                  min={0}
                  max={50}
                  value={workerExpYears}
                  onChange={(e) => setWorkerExpYears(Number(e.target.value))}
                  className="w-full rounded-xl border border-gray-300 p-3 text-sm focus:border-emerald-500 focus:outline-hidden"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-800">প্রত্যাশিত দৈনিক মজুরি (৳) *</label>
                <input
                  type="number"
                  min={100}
                  step={50}
                  value={workerDailyWage}
                  onChange={(e) => setWorkerDailyWage(Number(e.target.value))}
                  className="w-full rounded-xl border border-gray-300 p-3 text-sm focus:border-emerald-500 focus:outline-hidden"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-800">প্রত্যাশিত মাসিক মজুরি (৳)</label>
                <input
                  type="number"
                  min={1000}
                  step={500}
                  value={workerMonthlyWage}
                  onChange={(e) => setWorkerMonthlyWage(Number(e.target.value))}
                  className="w-full rounded-xl border border-gray-300 p-3 text-sm focus:border-emerald-500 focus:outline-hidden"
                />
              </div>
            </div>

            {/* Availability & Travel Distance */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-800">কাজের প্রাপ্যতা / Availability *</label>
                <select
                  value={workerAvailability}
                  onChange={(e) => setWorkerAvailability(e.target.value as any)}
                  className="w-full rounded-xl border border-gray-300 p-3 text-sm bg-white focus:border-emerald-500 focus:outline-hidden"
                >
                  <option value="available_today">আজই পাওয়া যাবে (সক্রিয়)</option>
                  <option value="available_this_week">এই সপ্তাহে পাওয়া যাবে</option>
                  <option value="not_available">বর্তমানে কাজে ব্যস্ত</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-800">কাজে যাতায়াতের সর্বোচ্চ দূরত্ব *</label>
                <select
                  value={workerTravelDistance}
                  onChange={(e) => setWorkerTravelDistance(e.target.value)}
                  className="w-full rounded-xl border border-gray-300 p-3 text-sm bg-white focus:border-emerald-500 focus:outline-hidden"
                >
                  <option value="same_ward">নিজ ওয়ার্ডের ভেতরে</option>
                  <option value="same_union">নিজ ইউনিয়ন / পৌরসভার ভেতরে</option>
                  <option value="same_upazila">নিজ উপজেলা / থানার যেকোনো জায়গায়</option>
                  <option value="same_district">নিজ জেলার যেকোনো জায়গায়</option>
                  <option value="anywhere">বাংলাদেশের যেকোনো জায়গায়</option>
                </select>
              </div>
            </div>

            {/* Bangladesh Location Selector (Division -> Ward) */}
            <div className="rounded-2xl border border-gray-200 bg-gray-50/70 p-4 space-y-3">
              <label className="text-xs font-bold text-gray-900 block">
                আপনার স্থায়ী / কাজের অবস্থান নির্বাচন করুন (বিভাগ → জেলা → উপজেলা → ইউনিয়ন → ওয়ার্ড):
              </label>
              <BangladeshLocationPicker
                value={{
                  divisionId: regDivisionId,
                  districtId: regDistrictId,
                  upazilaId: regUpazilaId,
                  unionId: regUnionId,
                  wardId: regWardId,
                }}
                onChange={(loc) => {
                  setRegDivisionId(loc.divisionId);
                  setRegDistrictId(loc.districtId);
                  setRegUpazilaId(loc.upazilaId);
                  setRegUnionId(loc.unionId);
                  setRegWardId(loc.wardId);
                }}
              />
              <input
                type="text"
                value={regCustomLoc}
                onChange={(e) => setRegCustomLoc(e.target.value)}
                placeholder="মহল্লা / গ্রাম / পাড়া (যেমন: দক্ষিণ কলেজ পাড়া)"
                className="w-full rounded-xl border border-gray-300 p-2.5 text-xs sm:text-sm bg-white focus:border-emerald-500 focus:outline-hidden"
              />
            </div>

            {/* Short Bio & Past Work */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-800">সংক্ষিপ্ত পরিচিতি ও দক্ষতা বিবরণ</label>
              <textarea
                value={workerBio}
                onChange={(e) => setWorkerBio(e.target.value)}
                rows={3}
                placeholder="আপনার কাজের অভিজ্ঞতা ও বৈশিষ্ট্য সম্পর্কে লিখুন..."
                className="w-full rounded-xl border border-gray-300 p-3 text-sm focus:border-emerald-500 focus:outline-hidden"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-800">বিগত কাজের বিবরণ ও রেফারেন্স (ঐচ্ছিক)</label>
              <textarea
                value={workerHistory}
                onChange={(e) => setWorkerHistory(e.target.value)}
                rows={2}
                placeholder="যেমন: ৩ তলা ভবনের ছাদ ঢালাই, সরকারি প্রজেক্টের কাজ, ইত্যাদি..."
                className="w-full rounded-xl border border-gray-300 p-3 text-sm focus:border-emerald-500 focus:outline-hidden"
              />
            </div>

            <div className="pt-3">
              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 py-3.5 text-sm sm:text-base font-bold text-white shadow-md hover:bg-emerald-700 transition active:scale-[0.99]"
              >
                <CheckCircle2 className="h-5 w-5" />
                শ্রম বাজার প্রোফাইল সংরক্ষণ ও প্রকাশ করুন
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 7. TAB CONTENT: 👷 "শ্রমিক চাই" (CREATE JOB POST FORM) */}
      {labourActiveTab === 'post_job' && (
        <div className="rounded-3xl border border-gray-200 bg-white p-6 sm:p-8 shadow-sm space-y-6">
          <div className="border-b border-gray-100 pb-4">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-100 text-blue-700">
                <Building2 className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  নতুন কাজের চাহিদা পোস্ট করুন
                </h2>
                <p className="text-xs text-gray-500">
                  আপনার এলাকার উপযুক্ত শ্রমিক ও মিস্ত্রিদের নিকট কাজের চাহিদা তাৎক্ষণিক পৌঁছে দিন
                </p>
              </div>
            </div>
          </div>

          {jobPostSuccess && (
            <div className="rounded-2xl bg-emerald-50 border border-emerald-200 p-4 text-emerald-800 text-sm flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
              <span>কাজের চাহিদা সফলভাবে পোস্ট হয়েছে! এটি এখন কাজ খুঁজুন তালিকায় উন্মুক্ত।</span>
            </div>
          )}

          <form onSubmit={handleCreateJob} className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-800">কাজের শিরোনাম *</label>
              <input
                type="text"
                required
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                placeholder="যেমন: ২ জন অভিজ্ঞ রাজমিস্ত্রি ও ১ জন হেলপার প্রয়োজন"
                className="w-full rounded-xl border border-gray-300 p-3 text-sm focus:border-blue-500 focus:outline-hidden"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-800">ক্যাটাগরি *</label>
                <select
                  value={jobCategory}
                  onChange={(e) => setJobCategory(e.target.value)}
                  className="w-full rounded-xl border border-gray-300 p-3 text-sm bg-white focus:border-blue-500 focus:outline-hidden"
                >
                  {labourCategories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.bnName}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-800">নির্দিষ্ট দক্ষতা *</label>
                <input
                  type="text"
                  required
                  value={jobSpecificSkill}
                  onChange={(e) => setJobSpecificSkill(e.target.value)}
                  placeholder="যেমন: রাজমিস্ত্রি, কাঠমিস্ত্রি"
                  className="w-full rounded-xl border border-gray-300 p-3 text-sm focus:border-blue-500 focus:outline-hidden"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-800">কতজন শ্রমিক প্রয়োজন *</label>
                <input
                  type="number"
                  min={1}
                  max={100}
                  value={jobWorkersNeeded}
                  onChange={(e) => setJobWorkersNeeded(Number(e.target.value))}
                  className="w-full rounded-xl border border-gray-300 p-3 text-sm focus:border-blue-500 focus:outline-hidden"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-800">মজুরি পরিমাণ (৳) *</label>
                <input
                  type="number"
                  min={100}
                  step={50}
                  required
                  value={jobWageAmount}
                  onChange={(e) => setJobWageAmount(Number(e.target.value))}
                  className="w-full rounded-xl border border-gray-300 p-3 text-sm focus:border-blue-500 focus:outline-hidden"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-800">মজুরির ধরন *</label>
                <select
                  value={jobWageType}
                  onChange={(e) => setJobWageType(e.target.value as any)}
                  className="w-full rounded-xl border border-gray-300 p-3 text-sm bg-white focus:border-blue-500 focus:outline-hidden"
                >
                  <option value="daily">দৈনিক মজুরি</option>
                  <option value="contract">চুক্তিভিত্তিক / এককালীন</option>
                  <option value="monthly">মাসিক বেতন</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-800">কাজের সময়কাল *</label>
                <input
                  type="text"
                  required
                  value={jobDuration}
                  onChange={(e) => setJobDuration(e.target.value)}
                  placeholder="যেমন: ৩ দিন, ১ সপ্তাহ"
                  className="w-full rounded-xl border border-gray-300 p-3 text-sm focus:border-blue-500 focus:outline-hidden"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-800">কাজের তারিখ ও শুরুর সময় *</label>
              <input
                type="text"
                required
                value={jobWorkDate}
                onChange={(e) => setJobWorkDate(e.target.value)}
                placeholder="যেমন: আগামীকাল সকাল ৮টা থেকে"
                className="w-full rounded-xl border border-gray-300 p-3 text-sm focus:border-blue-500 focus:outline-hidden"
              />
            </div>

            {/* Job Location Picker */}
            <div className="rounded-2xl border border-gray-200 bg-gray-50/70 p-4 space-y-3">
              <label className="text-xs font-bold text-gray-900 block">
                কাজের স্থান / লোকেশন নির্বাচন করুন (ওয়ার্ড পর্যন্ত):
              </label>
              <BangladeshLocationPicker
                value={{
                  divisionId: jobDivisionId,
                  districtId: jobDistrictId,
                  upazilaId: jobUpazilaId,
                  unionId: jobUnionId,
                  wardId: jobWardId,
                }}
                onChange={(loc) => {
                  setJobDivisionId(loc.divisionId);
                  setJobDistrictId(loc.districtId);
                  setJobUpazilaId(loc.upazilaId);
                  setJobUnionId(loc.unionId);
                  setJobWardId(loc.wardId);
                }}
              />
              <input
                type="text"
                value={jobAddressDetails}
                onChange={(e) => setJobAddressDetails(e.target.value)}
                placeholder="বিস্তারিত ঠিকানা / ল্যান্ডমার্ক (যেমন: পুরাতন বাসস্ট্যান্ড সংলগ্ন)"
                className="w-full rounded-xl border border-gray-300 p-2.5 text-xs sm:text-sm bg-white focus:border-blue-500 focus:outline-hidden"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-800">কাজের বিস্তারিত বিবরণ *</label>
              <textarea
                required
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                rows={3}
                placeholder="যেমন: সীমানা প্রাচীর নির্মাণের জন্য অভিজ্ঞ মিস্ত্রি প্রয়োজন। থাকা-খাওয়ার ব্যবস্থা আছে..."
                className="w-full rounded-xl border border-gray-300 p-3 text-sm focus:border-blue-500 focus:outline-hidden"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 rounded-2xl bg-blue-600 py-3.5 text-sm sm:text-base font-bold text-white shadow-md hover:bg-blue-700 transition active:scale-[0.99]"
              >
                <Building2 className="h-5 w-5" />
                কাজের চাহিদা প্রকাশ করুন
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 8. WORKER PROFILE DETAIL MODAL */}
      {selectedWorkerDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-xl rounded-3xl bg-white p-6 shadow-2xl border border-gray-100 max-h-[90vh] overflow-y-auto space-y-4">
            <div className="flex items-start justify-between border-b border-gray-100 pb-4">
              <div className="flex items-center gap-3">
                <img
                  src={selectedWorkerDetail.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'}
                  alt={selectedWorkerDetail.fullName}
                  className="h-16 w-16 rounded-2xl object-cover border border-emerald-200 shrink-0"
                />
                <div>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <h3 className="text-lg font-bold text-gray-900">
                      {selectedWorkerDetail.fullName}
                    </h3>
                    {selectedWorkerDetail.isVerified && (
                      <span title="যাচাইকৃত শ্রমিক">
                        <ShieldCheck className="h-5 w-5 text-emerald-600" />
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-md">
                      {selectedWorkerDetail.specificSkill}
                    </span>
                    <span className="text-xs text-gray-500">
                      {selectedWorkerDetail.experienceLevel}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setReportModalData({
                      isOpen: true,
                      targetType: 'worker_profile',
                      targetId: selectedWorkerDetail.id,
                      targetTitle: selectedWorkerDetail.fullName,
                    });
                  }}
                  className="rounded-full p-2 text-gray-400 hover:text-rose-600 hover:bg-rose-50 transition"
                  title="রিপোর্ট করুন"
                >
                  <Flag className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setSelectedWorkerDetail(null)}
                  className="rounded-full p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Location & Wage Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div className="rounded-2xl bg-gray-50 p-3 border border-gray-100">
                <span className="text-xs text-gray-400 block">দৈনিক মজুরি</span>
                <span className="text-base font-extrabold text-emerald-700">
                  ৳{selectedWorkerDetail.expectedDailyWage || 600}
                </span>
              </div>
              <div className="rounded-2xl bg-gray-50 p-3 border border-gray-100">
                <span className="text-xs text-gray-400 block">কাজের অভিজ্ঞতা</span>
                <span className="text-base font-bold text-gray-800">
                  {selectedWorkerDetail.experienceYears} বছর
                </span>
              </div>
              <div className="rounded-2xl bg-gray-50 p-3 border border-gray-100">
                <span className="text-xs text-gray-400 block">সম্পন্ন কাজ</span>
                <span className="text-base font-bold text-blue-700">
                  {selectedWorkerDetail.completedJobsCount} টি
                </span>
              </div>
            </div>

            {/* Location details */}
            <div className="rounded-2xl bg-emerald-50/70 p-3.5 border border-emerald-100 text-xs space-y-1">
              <span className="font-bold text-emerald-950 flex items-center gap-1.5">
                <MapPin className="h-4 w-4 text-emerald-700" />
                কাজের এলাকা:
              </span>
              <p className="text-emerald-900 font-medium">
                {getLocationName(selectedWorkerDetail.location)}
                {selectedWorkerDetail.locationCustom && ` (${selectedWorkerDetail.locationCustom})`}
              </p>
            </div>

            {/* Bio & Work History */}
            {selectedWorkerDetail.bio && (
              <div className="space-y-1">
                <h4 className="text-xs font-bold text-gray-700">পরিচিতি ও কাজের দক্ষতা:</h4>
                <p className="text-xs sm:text-sm text-gray-600 bg-gray-50 p-3 rounded-2xl leading-relaxed">
                  {selectedWorkerDetail.bio}
                </p>
              </div>
            )}

            {selectedWorkerDetail.workHistory && (
              <div className="space-y-1">
                <h4 className="text-xs font-bold text-gray-700">বিগত কাজের রেকর্ড:</h4>
                <p className="text-xs sm:text-sm text-gray-600 bg-gray-50 p-3 rounded-2xl leading-relaxed">
                  {selectedWorkerDetail.workHistory}
                </p>
              </div>
            )}

            <div className="pt-3 flex gap-2">
              <button
                onClick={() => setSelectedWorkerDetail(null)}
                className="w-1/3 rounded-xl border border-gray-300 py-3 text-xs font-semibold text-gray-700 hover:bg-gray-50"
              >
                বন্ধ করুন
              </button>
              <button
                onClick={() => {
                  const w = selectedWorkerDetail;
                  setSelectedWorkerDetail(null);
                  setContactModalData({
                    isOpen: true,
                    targetType: 'worker',
                    worker: w,
                  });
                }}
                className="w-2/3 flex items-center justify-center gap-2 rounded-xl bg-emerald-600 py-3 text-xs font-bold text-white shadow-md hover:bg-emerald-700 transition"
              >
                <PhoneCall className="h-4 w-4" />
                কাজের জন্য যোগাযোগ করুন
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 9. OTP MODAL */}
      <LabourOtpModal
        isOpen={otpModalOpen}
        onClose={() => setOtpModalOpen(false)}
        phone={workerPhone}
        onVerified={() => {
          setWorkerIsPhoneVerified(true);
        }}
      />

      {/* 10. CONTACT REQUEST MODAL */}
      <LabourContactModal
        isOpen={contactModalData.isOpen}
        onClose={() => setContactModalData({ ...contactModalData, isOpen: false })}
        targetType={contactModalData.targetType}
        worker={contactModalData.worker}
        job={contactModalData.job}
      />

      {/* 11. REPORT MODAL */}
      <LabourReportModal
        isOpen={reportModalData.isOpen}
        onClose={() => setReportModalData({ ...reportModalData, isOpen: false })}
        targetType={reportModalData.targetType}
        targetId={reportModalData.targetId}
        targetTitle={reportModalData.targetTitle}
      />
    </div>
  );
};
