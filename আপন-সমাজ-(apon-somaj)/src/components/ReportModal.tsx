import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Flag, X, CheckCircle, AlertTriangle } from 'lucide-react';

export const ReportModal: React.FC = () => {
  const { reportModalData, setReportModalData, submitReport } = useApp();
  const [reason, setReason] = useState('স্প্যাম বা অনাকাঙ্ক্ষিত কন্টেন্ট');
  const [details, setDetails] = useState('');
  const [submitted, setSubmitted] = useState(false);

  if (!reportModalData) return null;

  const reasons = [
    'স্প্যাম বা অনাকাঙ্ক্ষিত কন্টেন্ট (Spam)',
    'অপপ্রচার বা গুজব (Misinformation)',
    'ব্যক্তিগত আক্রমণ বা সাইবার বুলিং (Harassment)',
    'ভুয়া বা প্রতারণামূলক অ্যাকাউন্ট (Fake Account)',
    'সহিংসতা বা উস্কানিমূলক বার্তা (Violence)',
    'অন্যান্য আপত্তিকর বিষয় (Other)'
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitReport(reportModalData.targetType, reportModalData.targetId, reason, details);
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setReportModalData(null);
      setDetails('');
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
      <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-2xl">
        <div className="flex items-center justify-between border-b pb-3">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-rose-100 text-rose-600 flex items-center justify-center">
              <Flag className="h-4 w-4" />
            </div>
            <h3 className="font-bold text-slate-900 text-sm">রিপোর্ট করুন (Safety & Moderation)</h3>
          </div>
          <button
            onClick={() => setReportModalData(null)}
            className="rounded-full p-1 text-slate-400 hover:bg-slate-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {submitted ? (
          <div className="py-8 text-center space-y-2">
            <CheckCircle className="h-10 w-10 text-emerald-600 mx-auto" />
            <h4 className="font-bold text-slate-900 text-sm">রিপোর্টটি সফলভাবে জমা হয়েছে</h4>
            <p className="text-xs text-slate-500">আমাদের মডারেশন টিম এটি খতিয়ে দেখে ব্যবস্থা নেবে।</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-4 space-y-3 text-xs">
            <p className="text-slate-600">
              আপন সমাজ একটি নিরাপদ ও সম্মানজনক প্ল্যাটফর্ম। সমস্যাটি চিহ্নিত করুন:
            </p>

            <div className="space-y-1.5">
              {reasons.map(r => (
                <label
                  key={r}
                  className={`flex items-center gap-2.5 p-2 rounded-xl border cursor-pointer transition-colors ${
                    reason === r ? 'border-rose-400 bg-rose-50/50 font-semibold' : 'border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <input
                    type="radio"
                    name="reportReason"
                    checked={reason === r}
                    onChange={() => setReason(r)}
                    className="text-rose-600 focus:ring-rose-500"
                  />
                  <span className="text-slate-800">{r}</span>
                </label>
              ))}
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">অতিরিক্ত বিবরণ (ঐচ্ছিক)</label>
              <textarea
                rows={2}
                placeholder="প্রয়োজনীয় তথ্য দিন..."
                value={details}
                onChange={e => setDetails(e.target.value)}
                className="w-full rounded-lg border border-slate-200 p-2 text-slate-800"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t">
              <button
                type="button"
                onClick={() => setReportModalData(null)}
                className="rounded-xl px-4 py-2 font-semibold text-slate-600 hover:bg-slate-100"
              >
                বাতিল
              </button>
              <button
                type="submit"
                className="rounded-xl bg-rose-600 px-5 py-2 font-bold text-white hover:bg-rose-700"
              >
                রিপোর্ট জমা দিন
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
