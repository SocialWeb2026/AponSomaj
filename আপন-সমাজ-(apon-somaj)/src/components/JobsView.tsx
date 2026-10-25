import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Briefcase,
  Plus,
  MapPin,
  Clock,
  DollarSign,
  Building,
  Bookmark,
  CheckCircle,
  Search,
  Filter,
  X,
  Send
} from 'lucide-react';
import { Job } from '../types';

export const JobsView: React.FC = () => {
  const {
    currentUser,
    jobs,
    createJob,
    applyJob,
    appliedJobIds,
    divisions,
    districts,
    upazilas
  } = useApp();

  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [applyingJob, setApplyingJob] = useState<Job | null>(null);

  // Application form state
  const [applicantName, setApplicantName] = useState(currentUser?.name || '');
  const [applicantPhone, setApplicantPhone] = useState('');
  const [applicantNote, setApplicantNote] = useState('');
  const [applySuccess, setApplySuccess] = useState(false);

  // Create Job state
  const [title, setTitle] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [category, setCategory] = useState('তথ্য প্রযুক্তি ও ফ্রিল্যান্সিং');
  const [employmentType, setEmploymentType] = useState<'Full-time' | 'Part-time' | 'Contract' | 'Remote'>('Full-time');
  const [salaryRange, setSalaryRange] = useState('৳ ২৫,০০০ - ৳ ৩৫,০০০ / মাস');
  const [description, setDescription] = useState('');
  const [deadline, setDeadline] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [divId, setDivId] = useState('');
  const [distId, setDistId] = useState('');
  const [upId, setUpId] = useState('');

  const categories = [
    'all',
    'তথ্য প্রযুক্তি ও ফ্রিল্যান্সিং',
    'কৃষি ও খাদ্য প্রক্রিয়াকরণ',
    'শিক্ষা ও প্রশিক্ষণ',
    'স্বাস্থ্য ও নার্সিং',
    'বিক্রয় ও বিপণন'
  ];

  const filteredJobs = jobs.filter(j => {
    const matchesSearch =
      j.title.toLowerCase().includes(search.toLowerCase()) ||
      j.companyName.toLowerCase().includes(search.toLowerCase()) ||
      j.description.toLowerCase().includes(search.toLowerCase());
    const matchesCat = selectedCategory === 'all' || j.category === selectedCategory;
    const matchesType = selectedType === 'all' || j.employmentType === selectedType;
    return matchesSearch && matchesCat && matchesType;
  });

  const handleApplySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!applyingJob) return;

    applyJob(applyingJob.id);
    setApplySuccess(true);
    setTimeout(() => {
      setApplySuccess(false);
      setApplyingJob(null);
      setApplicantPhone('');
      setApplicantNote('');
    }, 1800);
  };

  const handleCreateJob = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !companyName.trim()) return;

    const div = divisions.find(d => d.id === divId);
    const dist = districts.find(d => d.id === distId);
    const up = upazilas.find(u => u.id === upId);

    createJob({
      title: title.trim(),
      companyName: companyName.trim(),
      companyLogo: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=200',
      category,
      employmentType,
      salaryRange,
      description: description.trim(),
      requirements: ['ন্যূনতম এইচএসসি/স্নাতক পাস বা সংশ্লিষ্ট কাজের অভিজ্ঞতা', 'কাজে নিষ্ঠাবান ও উদ্যমী'],
      contactEmail: contactEmail.trim() || 'career@aponsomaj.com',
      deadline: deadline || '১৫ দিন বাকি',
      location: {
        divisionId: div?.id || 'div-7',
        divisionName: div?.bnName || 'রংপুর',
        districtId: dist?.id || 'dis-47',
        districtName: dist?.bnName || 'ঠাকুরগাঁও',
        upazilaId: up?.id,
        upazilaName: up?.bnName
      }
    });

    setTitle('');
    setCompanyName('');
    setDescription('');
    setCreateModalOpen(false);
  };

  return (
    <div className="flex-1 max-w-5xl mx-auto space-y-5 pb-16">
      {/* Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-emerald-200 bg-gradient-to-r from-emerald-800 via-teal-800 to-emerald-900 p-5 text-white shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <Briefcase className="h-6 w-6 text-emerald-300" />
            <h2 className="text-xl font-bold">চাকরি ও ক্যারিয়ার পোর্টাল (Local Jobs)</h2>
          </div>
          <p className="text-xs text-emerald-100 mt-1">
            বাংলাদেশের জেলা ও উপজেলাভিত্তিক নির্ভরযোগ্য চাকরির নিয়োগ বিজ্ঞপ্তি খুঁজুন ও আবেদন করুন।
          </p>
        </div>
        <button
          id="post-job-btn"
          onClick={() => setCreateModalOpen(true)}
          className="flex items-center justify-center gap-2 rounded-xl bg-white px-4 py-2.5 text-xs font-bold text-emerald-800 shadow-xs hover:bg-emerald-50 active:scale-95 transition-all"
        >
          <Plus className="h-4 w-4" />
          <span>নতুন নিয়োগ বিজ্ঞপ্তি দিন</span>
        </button>
      </div>

      {/* Filter and Search */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="পদের নাম, প্রতিষ্ঠান বা দক্ষতা দিয়ে খুঁজুন..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-3 py-2 text-xs text-slate-800 focus:border-emerald-500 focus:outline-hidden"
            />
          </div>

          <div className="flex gap-2">
            <select
              value={selectedType}
              onChange={e => setSelectedType(e.target.value)}
              className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-700 focus:border-emerald-500"
            >
              <option value="all">সকল ধরন (All Types)</option>
              <option value="Full-time">Full-time (পূর্ণকালীন)</option>
              <option value="Part-time">Part-time (খন্ডকালীন)</option>
              <option value="Remote">Remote (রিমোট / বাসা থেকে)</option>
              <option value="Contract">Contract (চুক্তিভিত্তিক)</option>
            </select>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`shrink-0 rounded-lg px-3 py-1 font-medium transition-colors ${
                selectedCategory === cat
                  ? 'bg-emerald-600 text-white font-bold'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {cat === 'all' ? 'সকল ক্যাটাগরি' : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Jobs List */}
      <div className="space-y-3">
        {filteredJobs.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-slate-500 text-xs">
            কোনো চাকরির বিজ্ঞপ্তি পাওয়া যায়নি
          </div>
        ) : (
          filteredJobs.map(job => {
            const applicantList = job.applicantIds || [];
            const hasApplied = Boolean(
              (currentUser && applicantList.includes(currentUser.id)) ||
              appliedJobIds.includes(job.id)
            );
            return (
              <div
                key={job.id}
                className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 shadow-xs hover:border-emerald-300 hover:shadow-md transition-all"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700 font-black text-xl shrink-0">
                      {job.companyName.charAt(0)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-slate-900 text-sm sm:text-base">{job.title}</h3>
                        <span className="rounded-md bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                          {job.employmentType}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-xs font-semibold text-emerald-800 mt-0.5">
                        <Building className="h-3.5 w-3.5 text-emerald-600" />
                        <span>{job.companyName}</span>
                      </div>

                      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mt-2">
                        <span className="flex items-center gap-1 font-semibold text-slate-800">
                          <DollarSign className="h-3.5 w-3.5 text-emerald-600" />
                          {job.salaryRange}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3.5 w-3.5 text-rose-500" />
                          {[job.location?.upazilaName, job.location?.districtName, job.location?.divisionName]
                            .filter(Boolean)
                            .join(', ') || 'বাংলাদেশ'}
                        </span>
                        <span className="flex items-center gap-1 text-[11px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md">
                          <Clock className="h-3 w-3" />
                          মেয়াদ: {job.deadline}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex sm:flex-col items-center sm:items-end justify-between gap-2">
                    <span className="text-[11px] text-slate-400">
                      {applicantList.length || job.applicantsCount || 0} জন আবেদন করেছেন
                    </span>

                    {hasApplied ? (
                      <span className="flex items-center gap-1 rounded-xl bg-emerald-50 px-4 py-2 text-xs font-bold text-emerald-800 border border-emerald-200">
                        <CheckCircle className="h-4 w-4 text-emerald-600" />
                        <span>আবেদন সম্পন্ন</span>
                      </span>
                    ) : (
                      <button
                        id={`apply-job-btn-${job.id}`}
                        onClick={() => setApplyingJob(job)}
                        className="rounded-xl bg-emerald-600 px-5 py-2 text-xs font-bold text-white hover:bg-emerald-700 shadow-xs active:scale-95 transition-all"
                      >
                        আবেদন করুন (Apply)
                      </button>
                    )}
                  </div>
                </div>

                <p className="mt-3 text-xs text-slate-600 leading-relaxed border-t border-slate-100 pt-3">
                  {job.description}
                </p>
              </div>
            );
          })
        )}
      </div>

      {/* Apply to Job Modal */}
      {applyingJob && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-2xl">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">চাকরিতে আবেদন করুন</h3>
                <p className="text-xs text-emerald-700 font-semibold">{applyingJob.title} • {applyingJob.companyName}</p>
              </div>
              <button onClick={() => setApplyingJob(null)} className="text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            {applySuccess ? (
              <div className="py-8 text-center space-y-2">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                  <CheckCircle className="h-7 w-7" />
                </div>
                <h4 className="font-bold text-slate-900 text-sm">আপনার আবেদন সফলভাবে জমা হয়েছে!</h4>
                <p className="text-xs text-slate-500">প্রতিষ্ঠান আপনার সাথে শীঘ্রই যোগাযোগ করবে।</p>
              </div>
            ) : (
              <form onSubmit={handleApplySubmit} className="mt-4 space-y-3 text-xs">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">আপনার নাম</label>
                  <input
                    type="text"
                    required
                    value={applicantName}
                    onChange={e => setApplicantName(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 p-2 text-slate-800"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">মোবাইল নম্বর *</label>
                  <input
                    type="tel"
                    required
                    placeholder="017xxxxxxxx"
                    value={applicantPhone}
                    onChange={e => setApplicantPhone(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 p-2 text-slate-800"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">সংক্ষিপ্ত পরিচিতি ও অভিজ্ঞতা (Cover Note)</label>
                  <textarea
                    rows={3}
                    placeholder="আপনার কাজের অভিজ্ঞতা ও এই পদে কেন আপনি উপযুক্ত..."
                    value={applicantNote}
                    onChange={e => setApplicantNote(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 p-2 text-slate-800"
                  />
                </div>

                <div className="mt-4 flex justify-end gap-2 pt-2 border-t">
                  <button
                    type="button"
                    onClick={() => setApplyingJob(null)}
                    className="rounded-xl px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100"
                  >
                    বাতিল
                  </button>
                  <button
                    type="submit"
                    className="flex items-center gap-1 rounded-xl bg-emerald-600 px-5 py-2 text-xs font-bold text-white hover:bg-emerald-700"
                  >
                    <Send className="h-3.5 w-3.5" />
                    <span>জমা দিন</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Create Job Modal */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-2xl bg-white p-5 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-slate-900 text-sm">নতুন চাকরির বিজ্ঞপ্তি প্রকাশ করুন</h3>
              <button onClick={() => setCreateModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateJob} className="mt-4 space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">পদের নাম (Job Title) *</label>
                <input
                  type="text"
                  required
                  placeholder="যেমন: হিসাবরক্ষক / ফিল্ড অফিসার"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 p-2 text-slate-800"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">প্রতিষ্ঠান বা কোম্পানির নাম *</label>
                <input
                  type="text"
                  required
                  placeholder="যেমন: ঠাকুরগাঁও অ্যাগ্রো লিমিটেড"
                  value={companyName}
                  onChange={e => setCompanyName(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 p-2 text-slate-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">চাকরির ধরন</label>
                  <select
                    value={employmentType}
                    onChange={e => setEmploymentType(e.target.value as any)}
                    className="w-full rounded-lg border border-slate-200 p-2 text-slate-800"
                  >
                    <option value="Full-time">Full-time (পূর্ণকালীন)</option>
                    <option value="Part-time">Part-time (খন্ডকালীন)</option>
                    <option value="Remote">Remote (বাসা থেকে)</option>
                    <option value="Contract">Contract (চুক্তিভিত্তিক)</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">বেতন সীমা</label>
                  <input
                    type="text"
                    placeholder="৳ ২০,০০০ - ৳ ৩০,০০০"
                    value={salaryRange}
                    onChange={e => setSalaryRange(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 p-2 text-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">ক্যাটাগরি</label>
                <select
                  value={category}
                  onChange={e => setCategory(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 p-2 text-slate-800"
                >
                  {categories.filter(c => c !== 'all').map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">চাকরির দায়িত্ব ও যোগ্যতা *</label>
                <textarea
                  rows={3}
                  required
                  placeholder="প্রয়োজনীয় শিক্ষাগত যোগ্যতা, কাজের অভিজ্ঞতা..."
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 p-2 text-slate-800"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">কাজের এলাকা (Location)</label>
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
                  className="rounded-xl bg-emerald-600 px-5 py-2 text-xs font-bold text-white hover:bg-emerald-700"
                >
                  বিজ্ঞপ্তি প্রকাশ করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
