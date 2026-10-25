import React, { useState } from 'react';
import { X, PhoneCall, MessageSquare, Briefcase, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { LabourProfile, LabourJobPost } from '../types';
import { useApp } from '../context/AppContext';

interface LabourContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetType: 'worker' | 'job';
  worker?: LabourProfile;
  job?: LabourJobPost;
}

export const LabourContactModal: React.FC<LabourContactModalProps> = ({
  isOpen,
  onClose,
  targetType,
  worker,
  job,
}) => {
  const { sendLabourContactRequest, currentUser, setAuthModalOpen } = useApp();
  const [requestType, setRequestType] = useState<'call_request' | 'contact_request' | 'hire_request'>('call_request');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const targetName = targetType === 'worker' ? worker?.fullName : job?.title;
  const receiverId = targetType === 'worker' ? (worker?.userId || '') : (job?.employerId || '');
  const targetId = targetType === 'worker' ? (worker?.id || '') : (job?.id || '');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      setAuthModalOpen(true);
      return;
    }

    setIsSubmitting(true);
    try {
      await sendLabourContactRequest(targetType, targetId, receiverId, requestType, message);
      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
        setMessage('');
        onClose();
      }, 1600);
    } catch (err) {
      console.warn('Contact request error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in">
      <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl border border-emerald-100">
        <div className="flex items-center justify-between pb-3 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
              <PhoneCall className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900">
                {targetType === 'worker' ? 'শ্রমিকের সাথে যোগাযোগের অনুরোধ' : 'কাজে আবেদনের অনুরোধ'}
              </h3>
              <p className="text-xs text-gray-500">নিরাপদ ইন-অ্যাপ অনুরোধ মাধ্যম</p>
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
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 animate-bounce">
              <CheckCircle2 className="h-10 w-10" />
            </div>
            <h4 className="text-lg font-bold text-gray-900">অনুরোধ সফলভাবে পাঠানো হয়েছে!</h4>
            <p className="text-xs text-gray-600 max-w-sm mx-auto">
              অপর পক্ষ আপনার অনুরোধ গ্রহণ করলে সরাসরি কথা বলা বা ফোনে যোগাযোগ সম্ভব হবে। আপনি নোটিফিকেশনে আপডেট পাবেন।
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-4 space-y-4">
            {/* Target Info summary */}
            <div className="rounded-xl bg-gray-50 p-3 border border-gray-200/80 flex items-center justify-between">
              <div>
                <span className="text-xs text-gray-500 block">
                  {targetType === 'worker' ? 'শ্রমিকের নাম ও দক্ষতা:' : 'কাজের শিরোনাম:'}
                </span>
                <strong className="text-sm font-semibold text-gray-900">{targetName}</strong>
                {targetType === 'worker' && worker?.specificSkill && (
                  <span className="ml-2 inline-block text-xs font-medium text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                    {worker.specificSkill}
                  </span>
                )}
              </div>
              {targetType === 'worker' && worker?.expectedDailyWage ? (
                <div className="text-right">
                  <span className="text-xs text-gray-500 block">দৈনিক মজুরি</span>
                  <span className="text-sm font-bold text-emerald-700">৳{worker.expectedDailyWage}</span>
                </div>
              ) : null}
            </div>

            {/* Request Type Selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-700">যোগাযোগের ধরন নির্বাচন করুন:</label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setRequestType('call_request')}
                  className={`flex flex-col items-center justify-center p-3 rounded-xl border text-xs font-medium transition ${
                    requestType === 'call_request'
                      ? 'border-emerald-600 bg-emerald-50 text-emerald-800 ring-2 ring-emerald-500/20'
                      : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <PhoneCall className="h-4 w-4 mb-1 text-emerald-600" />
                  কলের অনুরোধ
                </button>
                <button
                  type="button"
                  onClick={() => setRequestType('contact_request')}
                  className={`flex flex-col items-center justify-center p-3 rounded-xl border text-xs font-medium transition ${
                    requestType === 'contact_request'
                      ? 'border-emerald-600 bg-emerald-50 text-emerald-800 ring-2 ring-emerald-500/20'
                      : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <MessageSquare className="h-4 w-4 mb-1 text-blue-600" />
                  বার্তা প্রেরণ
                </button>
                <button
                  type="button"
                  onClick={() => setRequestType('hire_request')}
                  className={`flex flex-col items-center justify-center p-3 rounded-xl border text-xs font-medium transition ${
                    requestType === 'hire_request'
                      ? 'border-emerald-600 bg-emerald-50 text-emerald-800 ring-2 ring-emerald-500/20'
                      : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <Briefcase className="h-4 w-4 mb-1 text-purple-600" />
                  কাজের প্রস্তাব
                </button>
              </div>
            </div>

            {/* Message Box */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-700">সংক্ষিপ্ত বার্তা বা কাজের বিবরণ:</label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={3}
                placeholder="যেমন: আসসালামু আলাইকুম, আগামীকাল সকাল থেকে ২ দিনের রাজমিস্ত্রির কাজের জন্য আপনাকে প্রয়োজন..."
                className="w-full rounded-xl border border-gray-300 p-3 text-sm focus:border-emerald-500 focus:outline-hidden focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            {/* Privacy Protection Banner */}
            <div className="rounded-xl bg-amber-50 p-3 border border-amber-200/80 text-xs text-amber-900 flex items-start gap-2">
              <ShieldAlert className="h-4 w-4 shrink-0 text-amber-600 mt-0.5" />
              <p>
                <strong className="font-semibold">সুরক্ষা নীতিমালা:</strong> শ্রমিক ও নিয়োগকর্তার গোপনীয়তা বজায় রাখতে সরাসরি পাবলিক নম্বরের বদলে ইন-অ্যাপ অনুরোধ পাঠানো হয়। অপরপক্ষ সম্মতি জানালে ফোন নম্বর প্রকাশ পাবে।
              </p>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="w-1/3 rounded-xl border border-gray-300 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
              >
                বাতিল
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-2/3 flex items-center justify-center gap-2 rounded-xl bg-emerald-600 py-2.5 text-sm font-semibold text-white shadow-md hover:bg-emerald-700 transition disabled:opacity-50"
              >
                {isSubmitting ? 'পাঠানো হচ্ছে...' : 'অনুরোধ নিশ্চিত করুন'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
