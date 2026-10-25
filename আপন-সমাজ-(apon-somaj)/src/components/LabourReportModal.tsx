import React, { useState } from 'react';
import { X, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { useApp } from '../context/AppContext';

interface LabourReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetType: 'worker_profile' | 'job_post' | 'contact_request';
  targetId: string;
  targetTitle?: string;
}

export const LabourReportModal: React.FC<LabourReportModalProps> = ({
  isOpen,
  onClose,
  targetType,
  targetId,
  targetTitle,
}) => {
  const { reportLabourItem, currentUser, setAuthModalOpen } = useApp();
  const [reason, setReason] = useState('ভুয়া প্রোফাইল বা তথ্য');
  const [details, setDetails] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const reasons = [
    'ভুয়া প্রোফাইল বা তথ্য',
    'ভুল মোবাইল নম্বর বা যোগাযোগে বিঘ্ন',
    'অনৈতিক বা আপত্তিকর আচরণ',
    'মজুরি প্রতারণা বা চুক্তি লঙ্ঘন',
    'স্প্যাম বা অযৌক্তিক পোস্ট',
    'অন্যান্য কারণ',
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      setAuthModalOpen(true);
      return;
    }

    setIsSubmitting(true);
    try {
      await reportLabourItem(targetType, targetId, reason, details);
      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
        setDetails('');
        onClose();
      }, 1500);
    } catch (err) {
      console.warn('Report error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-rose-100">
        <div className="flex items-center justify-between pb-3 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-100 text-rose-600">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900">অভিযোগ বা রিপোর্ট দাখিল</h3>
              <p className="text-xs text-gray-500">শ্রম বাজারের নিরাপত্তা ও সততা বজায় রাখুন</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {isSuccess ? (
          <div className="py-8 text-center space-y-3">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
              <CheckCircle2 className="h-8 w-8" />
            </div>
            <h4 className="text-base font-bold text-gray-900">রিপোর্ট সফলভাবে জমা হয়েছে</h4>
            <p className="text-xs text-gray-500">আপন সমাজ মডারেশন দল এটি দ্রুত যাচাই করবে। ধন্যবাদ!</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-4 space-y-4">
            {targetTitle && (
              <div className="rounded-lg bg-gray-50 p-2.5 text-xs text-gray-700 border border-gray-200">
                <span className="font-semibold text-gray-500 block">বিষয়:</span>
                <span className="font-medium text-gray-900">{targetTitle}</span>
              </div>
            )}

            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-700">অভিযোগের কারণ:</label>
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full rounded-xl border border-gray-300 p-2.5 text-xs sm:text-sm bg-white focus:border-rose-500 focus:outline-hidden"
              >
                {reasons.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-700">বিস্তারিত বিবরণ (ঐচ্ছিক):</label>
              <textarea
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                rows={3}
                placeholder="ঘটনা বা প্রমাণের সংক্ষিপ্ত বিবরণ লিখুন..."
                className="w-full rounded-xl border border-gray-300 p-2.5 text-xs sm:text-sm focus:border-rose-500 focus:outline-hidden"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="w-1/3 rounded-xl border border-gray-300 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50"
              >
                বাতিল
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-2/3 rounded-xl bg-rose-600 py-2 text-xs font-semibold text-white hover:bg-rose-700 transition disabled:opacity-50"
              >
                {isSubmitting ? 'জমা হচ্ছে...' : 'রিপোর্ট জমা দিন'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
