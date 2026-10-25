import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  Camera,
  Video,
  RotateCw,
  Mic,
  MicOff,
  Circle,
  Square,
  Sparkles,
  Clock,
  Check,
} from 'lucide-react';

interface CameraRecordModalProps {
  isOpen: boolean;
  mode: 'photo' | 'video' | 'reel';
  durationLimit?: 15 | 30 | 60 | 90 | 180;
  onClose: () => void;
  onCapturePhoto: (file: File, dataUrl: string) => void;
  onRecordVideo: (file: File, url: string, duration: number) => void;
}

export const CameraRecordModal: React.FC<CameraRecordModalProps> = ({
  isOpen,
  mode,
  durationLimit = 30,
  onClose,
  onCapturePhoto,
  onRecordVideo,
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const [cameraFacing, setCameraFacing] = useState<'user' | 'environment'>('user');
  const [micEnabled, setMicEnabled] = useState(true);
  const [isRecording, setIsRecording] = useState(false);
  const [recordedSeconds, setRecordedSeconds] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize Camera Stream
  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;
    setErrorMessage(null);

    async function startCamera() {
      try {
        if (streamRef.current) {
          streamRef.current.getTracks().forEach((t) => t.stop());
        }

        const constraints: MediaStreamConstraints = {
          video: {
            facingMode: cameraFacing,
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
          audio: micEnabled,
        };

        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        if (!isMounted) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }

        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err: unknown) {
        console.warn('Camera access error:', err);
        if (isMounted) {
          setErrorMessage(
            'ক্যামেরা চালু করা সম্ভব হয়নি। অনুগ্রহ করে ডিভাইসে ক্যামেরা এবং মাইক্রোফোনের অনুমতি প্রদান করুন।'
          );
        }
      }
    }

    startCamera();

    return () => {
      isMounted = false;
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      }
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isOpen, cameraFacing, micEnabled]);

  // Handle Photo Capture
  const handleSnapPhoto = () => {
    const video = videoRef.current;
    if (!video) return;

    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (cameraFacing === 'user') {
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
    }
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob((blob) => {
      if (!blob) return;
      const file = new File([blob], `camera_photo_${Date.now()}.jpg`, { type: 'image/jpeg' });
      const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
      onCapturePhoto(file, dataUrl);
      onClose();
    }, 'image/jpeg', 0.9);
  };

  // Start Video Recording
  const handleStartRecording = () => {
    if (!streamRef.current) return;
    chunksRef.current = [];
    setRecordedSeconds(0);

    try {
      const mimeType = MediaRecorder.isTypeSupported('video/webm;codecs=vp9')
        ? 'video/webm;codecs=vp9'
        : MediaRecorder.isTypeSupported('video/mp4')
        ? 'video/mp4'
        : 'video/webm';

      const recorder = new MediaRecorder(streamRef.current, { mimeType });
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: recorder.mimeType || 'video/webm' });
        const file = new File([blob], `camera_recording_${Date.now()}.webm`, {
          type: blob.type,
        });
        const url = URL.createObjectURL(blob);
        onRecordVideo(file, url, recordedSeconds);
        onClose();
      };

      recorder.start(250);
      setIsRecording(true);

      timerRef.current = setInterval(() => {
        setRecordedSeconds((prev) => {
          const next = prev + 1;
          if (next >= durationLimit) {
            handleStopRecording();
          }
          return next;
        });
      }, 1000);
    } catch (err) {
      console.error('Recording initialization error:', err);
      setErrorMessage('ভিডিও রেকর্ড শুরু করতে সমস্যা হয়েছে।');
    }
  };

  // Stop Video Recording
  const handleStopRecording = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
  };

  if (!isOpen) return null;

  const formatSeconds = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-2 sm:p-4 backdrop-blur-md animate-in fade-in">
      <div className="relative flex h-full max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-3xl bg-slate-900 text-white shadow-2xl border border-slate-800">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800/80 px-4 py-3 bg-slate-950/70">
          <div className="flex items-center gap-2">
            <Camera className="h-5 w-5 text-emerald-400" />
            <h2 className="text-sm font-bold">
              {mode === 'photo' ? 'ক্যামেরা ছবি তুলুন' : mode === 'reel' ? 'রিল রেকর্ড করুন (Reel Camera)' : 'ভিডিও রেকর্ড করুন'}
            </h2>
          </div>

          <button
            onClick={onClose}
            className="rounded-full bg-white/10 p-1.5 text-slate-300 hover:bg-white/20 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Viewfinder Viewport */}
        <div className="relative flex flex-1 items-center justify-center overflow-hidden bg-black">
          {errorMessage ? (
            <div className="p-6 text-center text-rose-400 text-sm max-w-md">
              <p>{errorMessage}</p>
              <button
                onClick={onClose}
                className="mt-4 rounded-xl bg-slate-800 px-4 py-2 text-white hover:bg-slate-700 text-xs font-bold"
              >
                ফিরে যান
              </button>
            </div>
          ) : (
            <>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className={`h-full w-full object-cover ${cameraFacing === 'user' ? 'scale-x-[-1]' : ''}`}
              />

              {/* Recording indicator and countdown */}
              {isRecording && (
                <div className="absolute top-4 left-1/2 -translate-x-1/2 flex items-center gap-2 rounded-full bg-rose-600/90 px-3.5 py-1 text-xs font-mono font-bold shadow-lg backdrop-blur-md animate-pulse">
                  <div className="h-2.5 w-2.5 rounded-full bg-white animate-ping" />
                  <span>{formatSeconds(recordedSeconds)}</span>
                  <span>/</span>
                  <span>{formatSeconds(durationLimit)}</span>
                </div>
              )}

              {/* Top Controls Overlay */}
              <div className="absolute top-4 right-4 flex flex-col gap-2.5">
                <button
                  onClick={() => setCameraFacing((p) => (p === 'user' ? 'environment' : 'user'))}
                  disabled={isRecording}
                  className="rounded-full bg-black/50 p-2.5 text-white backdrop-blur-md hover:bg-black/70 disabled:opacity-40"
                  title="ক্যামেরা পরিবর্তন (Front/Back)"
                >
                  <RotateCw className="h-5 w-5" />
                </button>

                <button
                  onClick={() => setMicEnabled((p) => !p)}
                  disabled={isRecording}
                  className="rounded-full bg-black/50 p-2.5 text-white backdrop-blur-md hover:bg-black/70 disabled:opacity-40"
                  title={micEnabled ? 'মাইক্রোফোন চালু' : 'মাইক্রোফোন বন্ধ'}
                >
                  {micEnabled ? <Mic className="h-5 w-5 text-emerald-400" /> : <MicOff className="h-5 w-5 text-rose-400" />}
                </button>
              </div>
            </>
          )}
        </div>

        {/* Bottom Shutter & Controls */}
        <div className="border-t border-slate-800/80 bg-slate-950 px-4 py-5 flex items-center justify-center gap-6">
          {mode === 'photo' ? (
            <button
              onClick={handleSnapPhoto}
              className="flex h-18 w-18 items-center justify-center rounded-full border-4 border-white bg-emerald-600 shadow-xl hover:scale-105 active:scale-95 transition-transform"
              title="ছবি তুলুন"
            >
              <div className="h-12 w-12 rounded-full bg-white" />
            </button>
          ) : (
            <div className="flex items-center gap-4">
              {isRecording ? (
                <button
                  onClick={handleStopRecording}
                  className="flex h-18 w-18 items-center justify-center rounded-full border-4 border-rose-500 bg-rose-600 shadow-xl hover:scale-105 active:scale-95 transition-transform"
                  title="রেকর্ডিং শেষ করুন"
                >
                  <Square className="h-7 w-7 fill-white text-white" />
                </button>
              ) : (
                <button
                  onClick={handleStartRecording}
                  className="flex h-18 w-18 items-center justify-center rounded-full border-4 border-white bg-rose-600 shadow-xl hover:scale-105 active:scale-95 transition-transform"
                  title="রেকর্ড শুরু করুন"
                >
                  <Circle className="h-10 w-10 fill-white text-white" />
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
