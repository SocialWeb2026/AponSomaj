import React, { useState, useEffect } from 'react';
import { X, ShieldCheck, CheckCircle2, RefreshCw, Smartphone } from 'lucide-react';

interface LabourOtpModalProps {
  isOpen: boolean;
  onClose: () => void;
  phone: string;
  onVerified: () => void;
}

export const LabourOtpModal: React.FC<LabourOtpModalProps> = ({
  isOpen,
  onClose,
  phone,
  onVerified,
}) => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [timer, setTimer] = useState(60);
  const [error, setError] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [demoCode] = useState('123456');

  useEffect(() => {
    if (!isOpen) {
      setOtp(['', '', '', '', '', '']);
      setError('');
      setIsSuccess(false);
      return;
    }
    setTimer(60);
    const interval = setInterval(() => {
      setTimer((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [isOpen]);

  if (!isOpen) return null;

  const handleOtpChange = (index: number, val: string) => {
    if (val.length > 1) val = val[val.length - 1];
    const newOtp = [...otp];
    newOtp[index] = val;
    setOtp(newOtp);
    setError('');

    // Focus next input
    if (val && index < 5) {
      const nextInput = document.getElementById(`otp-input-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-input-${index - 1}`);
      prevInput?.focus();
    }
  };

  const handleVerify = () => {
    const code = otp.join('');
    if (code.length < 6) {
      setError('অনুগ্রহ করে ৬ সংখ্যার সম্পূর্ণ ওটিপি কোডটি লিখুন');
      return;
    }

    setIsVerifying(true);
    setTimeout(() => {
      setIsVerifying(false);
      // Accept demo code or any 6-digit number in testing
      setIsSuccess(true);
      setTimeout(() => {
        onVerified();
        onClose();
      }, 1200);
    }, 800);
  };

  const handleResend = () => {
    setTimer(60);
    setError('');
    setOtp(['', '', '', '', '', '']);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-emerald-100">
        <div className="flex items-center justify-between pb-3 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900">মোবাইল নম্বর যাচাই (OTP)</h3>
              <p className="text-xs text-gray-500">শ্রমিক সুরক্ষায় নম্বর যাচাই বাধ্যতামূলক</p>
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
            <h4 className="text-lg font-bold text-gray-900">মোবাইল নম্বর সফলভাবে যাচাই হয়েছে!</h4>
            <p className="text-xs text-gray-500">আপনার শ্রম বাজার প্রোফাইল এখন বিশ্বস্ত ও সক্রিয়।</p>
          </div>
        ) : (
          <div className="mt-4 space-y-4">
            <div className="rounded-xl bg-emerald-50/70 p-3 text-xs text-emerald-800 flex items-start gap-2 border border-emerald-200/60">
              <Smartphone className="h-4 w-4 shrink-0 text-emerald-600 mt-0.5" />
              <div>
                <span>আপনার মোবাইল নম্বর </span>
                <strong className="font-semibold text-emerald-950">{phone || '01XXXXXXXXX'}</strong>
                <span> -এ ৬ সংখ্যার যাচাইকরণ কোড পাঠানো হয়েছে। (পরীক্ষামূলক ওটিপি: </span>
                <span className="font-mono font-bold bg-white px-1.5 py-0.5 rounded border border-emerald-300 text-emerald-700">{demoCode}</span>
                <span>)</span>
              </div>
            </div>

            {/* 6-box input */}
            <div className="flex justify-center gap-2 sm:gap-3 py-2">
              {otp.map((digit, idx) => (
                <input
                  key={idx}
                  id={`otp-input-${idx}`}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(idx, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(idx, e)}
                  className="h-12 w-11 sm:h-13 sm:w-12 text-center text-xl font-bold rounded-xl border border-gray-300 bg-gray-50 focus:border-emerald-600 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500/30 transition shadow-xs"
                />
              ))}
            </div>

            {error && (
              <p className="text-center text-xs text-rose-600 font-medium">{error}</p>
            )}

            <div className="flex items-center justify-between text-xs text-gray-500 pt-1">
              <span>কোড পাননি?</span>
              {timer > 0 ? (
                <span className="text-gray-400">পুনরায় পাঠান ({timer}s)</span>
              ) : (
                <button
                  type="button"
                  onClick={handleResend}
                  className="flex items-center gap-1 font-semibold text-emerald-700 hover:text-emerald-800"
                >
                  <RefreshCw className="h-3 w-3" />
                  নতুন কোড পাঠান
                </button>
              )}
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={handleVerify}
                disabled={isVerifying}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-emerald-600 py-3 text-sm font-semibold text-white shadow-md hover:bg-emerald-700 transition active:scale-[0.99] disabled:opacity-50"
              >
                {isVerifying ? 'যাচাই করা হচ্ছে...' : 'ওটিপি যাচাই সম্পন্ন করুন'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
