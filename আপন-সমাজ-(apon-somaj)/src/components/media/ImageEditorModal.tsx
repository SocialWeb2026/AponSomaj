import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  RotateCw,
  Crop,
  Sliders,
  Sparkles,
  Type,
  Smile,
  PenTool,
  Check,
  RotateCcw,
  Maximize2,
  ChevronLeft,
  ChevronRight,
  Palette,
  Trash2,
} from 'lucide-react';
import { ImageEditState, OverlayItem, DrawingPath } from '../../types';
import { processEditedImage } from '../../services/mediaStorageService';

interface ImageEditorModalProps {
  isOpen: boolean;
  images: Array<{ id: string; originalUrl: string; editedUrl?: string; file?: File }>;
  currentIndex: number;
  onClose: () => void;
  onSave: (updatedImages: Array<{ id: string; originalUrl: string; editedUrl?: string; file?: File }>) => void;
}

const DEFAULT_EDIT_STATE: ImageEditState = {
  brightness: 0,
  contrast: 0,
  saturation: 0,
  blur: 0,
  filter: 'none',
  rotation: 0,
  flipH: false,
  flipV: false,
  cropAspect: 'free',
  overlays: [],
  drawings: [],
};

const STICKERS = ['❤️', '🔥', '🇧🇩', '✨', '🎉', '🌸', '🤝', '⚡', '💯', '🌟', '👏', '😍'];

export const ImageEditorModal: React.FC<ImageEditorModalProps> = ({
  isOpen,
  images,
  currentIndex: initialIndex,
  onClose,
  onSave,
}) => {
  const [activeIdx, setActiveIdx] = useState(initialIndex);
  const [editStates, setEditStates] = useState<Record<number, ImageEditState>>({});
  const [activeTab, setActiveTab] = useState<'adjust' | 'filters' | 'crop' | 'text' | 'stickers' | 'draw'>('adjust');
  const [isProcessing, setIsProcessing] = useState(false);

  // Drawing state
  const [isDrawing, setIsDrawing] = useState(false);
  const [penColor, setPenColor] = useState('#10b981');
  const [penWidth, setPenWidth] = useState(4);
  const currentPathRef = useRef<DrawingPath | null>(null);

  // Text overlay input
  const [newTextInput, setNewTextInput] = useState('');
  const [textColor, setTextColor] = useState('#ffffff');

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    setActiveIdx(initialIndex);
  }, [initialIndex]);

  if (!isOpen || images.length === 0) return null;

  const currentItem = images[activeIdx] || images[0];
  const currentState: ImageEditState = editStates[activeIdx] || { ...DEFAULT_EDIT_STATE };

  const updateCurrentState = (updater: (prev: ImageEditState) => ImageEditState) => {
    setEditStates((prev) => ({
      ...prev,
      [activeIdx]: updater(prev[activeIdx] || { ...DEFAULT_EDIT_STATE }),
    }));
  };

  const handleReset = () => {
    setEditStates((prev) => ({
      ...prev,
      [activeIdx]: { ...DEFAULT_EDIT_STATE },
    }));
  };

  // Drawing handlers
  const handleCanvasMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (activeTab !== 'draw') return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    setIsDrawing(true);
    currentPathRef.current = {
      id: `draw-${Date.now()}`,
      color: penColor,
      strokeWidth: penWidth,
      points: [{ x, y }],
    };
  };

  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || activeTab !== 'draw' || !currentPathRef.current) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    currentPathRef.current.points.push({ x, y });

    // Force re-render drawings
    updateCurrentState((prev) => {
      const existing = prev.drawings.filter((d) => d.id !== currentPathRef.current?.id);
      return {
        ...prev,
        drawings: [...existing, { ...currentPathRef.current! }],
      };
    });
  };

  const handleCanvasMouseUp = () => {
    setIsDrawing(false);
    currentPathRef.current = null;
  };

  // Text overlay
  const handleAddText = () => {
    if (!newTextInput.trim()) return;
    const item: OverlayItem = {
      id: `text-${Date.now()}`,
      type: 'text',
      content: newTextInput.trim(),
      x: 50,
      y: 50,
      scale: 1,
      color: textColor,
      fontSize: 28,
    };
    updateCurrentState((prev) => ({
      ...prev,
      overlays: [...prev.overlays, item],
    }));
    setNewTextInput('');
  };

  // Sticker
  const handleAddSticker = (emoji: string) => {
    const item: OverlayItem = {
      id: `sticker-${Date.now()}`,
      type: 'emoji',
      content: emoji,
      x: 50,
      y: 50,
      scale: 1.5,
      fontSize: 40,
    };
    updateCurrentState((prev) => ({
      ...prev,
      overlays: [...prev.overlays, item],
    }));
  };

  const handleRemoveOverlay = (id: string) => {
    updateCurrentState((prev) => ({
      ...prev,
      overlays: prev.overlays.filter((o) => o.id !== id),
    }));
  };

  // Save changes
  const handleApplyAll = async () => {
    setIsProcessing(true);
    try {
      const updated = await Promise.all(
        images.map(async (img, idx) => {
          const state = editStates[idx];
          if (!state) return img;

          // Apply client-side canvas transformations
          const result = await processEditedImage(img.originalUrl, state);
          return {
            ...img,
            editedUrl: result.dataUrl,
          };
        })
      );

      onSave(updated);
      onClose();
    } catch (err) {
      console.error('Failed to process edited images:', err);
      alert('ছবি সম্পাদনা প্রক্রিয়াকরণে সমস্যা হয়েছে, অনুগ্রহ করে আবার চেষ্টা করুন।');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-2 sm:p-4 backdrop-blur-md animate-in fade-in">
      <div className="relative flex h-full max-h-[92vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl bg-slate-900 text-white shadow-2xl border border-slate-800">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 px-4 py-3 bg-slate-900/90">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-emerald-400" />
            <h2 className="text-base font-bold">ছবি সম্পাদনা (Photo Editor)</h2>
            <span className="ml-2 rounded-full bg-slate-800 px-2.5 py-0.5 text-xs text-slate-400">
              {activeIdx + 1} / {images.length}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleReset}
              className="flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-300 hover:bg-slate-800 transition-colors"
              title="রিসেট করুন"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>রিসেট</span>
            </button>
            <button
              onClick={handleApplyAll}
              disabled={isProcessing}
              className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-1.5 text-xs font-bold text-white shadow-md hover:bg-emerald-500 disabled:opacity-50 transition-colors"
            >
              <Check className="h-4 w-4" />
              <span>{isProcessing ? 'সংরক্ষণ হচ্ছে...' : 'সম্পন্ন করুন'}</span>
            </button>
            <button
              onClick={onClose}
              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Multi-Image Switcher Tabs */}
        {images.length > 1 && (
          <div className="flex items-center gap-2 border-b border-slate-800 bg-slate-950/60 px-4 py-2 overflow-x-auto">
            {images.map((img, idx) => (
              <button
                key={img.id}
                onClick={() => setActiveIdx(idx)}
                className={`relative h-12 w-12 shrink-0 overflow-hidden rounded-lg border-2 transition-all ${
                  activeIdx === idx
                    ? 'border-emerald-500 ring-2 ring-emerald-500/40'
                    : 'border-transparent opacity-60 hover:opacity-100'
                }`}
              >
                <img
                  src={img.editedUrl || img.originalUrl}
                  alt=""
                  className="h-full w-full object-cover"
                />
              </button>
            ))}
          </div>
        )}

        {/* Main Canvas / Image Area */}
        <div className="relative flex flex-1 items-center justify-center overflow-hidden bg-black/60 p-4">
          <div
            className="relative max-h-full max-w-full overflow-hidden rounded-lg shadow-2xl transition-transform"
            style={{
              transform: `rotate(${currentState.rotation}deg) scale(${currentState.flipH ? -1 : 1}, ${
                currentState.flipV ? -1 : 1
              })`,
            }}
          >
            <img
              src={currentItem.editedUrl || currentItem.originalUrl}
              alt=""
              className="max-h-[52vh] max-w-full object-contain pointer-events-none"
              style={{
                filter: `brightness(${100 + currentState.brightness}%) contrast(${
                  100 + currentState.contrast
                }%) saturate(${100 + currentState.saturation}%) blur(${currentState.blur}px) ${
                  currentState.filter === 'monochrome'
                    ? 'grayscale(100%)'
                    : currentState.filter === 'sepia'
                    ? 'sepia(85%)'
                    : currentState.filter === 'warm'
                    ? 'sepia(30%) saturate(140%)'
                    : currentState.filter === 'vintage'
                    ? 'sepia(50%) contrast(120%)'
                    : currentState.filter === 'vivid'
                    ? 'saturate(170%)'
                    : currentState.filter === 'cool'
                    ? 'hue-rotate(180deg)'
                    : currentState.filter === 'dramatic'
                    ? 'contrast(140%) saturate(120%)'
                    : ''
                }`,
              }}
            />

            {/* Canvas overlay for drawing and pointer events */}
            <canvas
              ref={canvasRef}
              onMouseDown={handleCanvasMouseDown}
              onMouseMove={handleCanvasMouseMove}
              onMouseUp={handleCanvasMouseUp}
              className={`absolute inset-0 h-full w-full ${
                activeTab === 'draw' ? 'cursor-crosshair' : 'pointer-events-none'
              }`}
            />

            {/* Render interactive overlays */}
            {currentState.overlays.map((item) => (
              <div
                key={item.id}
                className="absolute transform -translate-x-1/2 -translate-y-1/2 select-none group cursor-pointer"
                style={{
                  left: `${item.x}%`,
                  top: `${item.y}%`,
                  color: item.color || '#ffffff',
                }}
              >
                {item.type === 'text' ? (
                  <span
                    className="font-bold drop-shadow-md px-2 py-0.5 rounded bg-black/30 backdrop-blur-xs"
                    style={{ fontSize: `${item.fontSize || 24}px` }}
                  >
                    {item.content}
                  </span>
                ) : (
                  <span style={{ fontSize: `${item.fontSize || 36}px` }}>{item.content}</span>
                )}
                <button
                  onClick={() => handleRemoveOverlay(item.id)}
                  className="hidden group-hover:inline-flex ml-1 rounded-full bg-rose-600 p-0.5 text-white"
                  title="মুছুন"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>

          {/* Navigation Arrows for Multiple Images */}
          {images.length > 1 && (
            <>
              <button
                onClick={() => setActiveIdx((prev) => (prev > 0 ? prev - 1 : images.length - 1))}
                className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-black/60 p-2 text-white hover:bg-black/80"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                onClick={() => setActiveIdx((prev) => (prev < images.length - 1 ? prev + 1 : 0))}
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-black/60 p-2 text-white hover:bg-black/80"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </>
          )}
        </div>

        {/* Bottom Toolbar Tabs */}
        <div className="border-t border-slate-800 bg-slate-900/95 px-4 py-3">
          {/* Tool selectors */}
          <div className="flex items-center justify-center gap-2 border-b border-slate-800/80 pb-3 text-xs">
            <button
              onClick={() => setActiveTab('adjust')}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 font-medium transition-colors ${
                activeTab === 'adjust' ? 'bg-emerald-600 text-white' : 'text-slate-300 hover:bg-slate-800'
              }`}
            >
              <Sliders className="h-4 w-4" />
              <span>এডজাস্টমেন্ট</span>
            </button>
            <button
              onClick={() => setActiveTab('filters')}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 font-medium transition-colors ${
                activeTab === 'filters' ? 'bg-emerald-600 text-white' : 'text-slate-300 hover:bg-slate-800'
              }`}
            >
              <Sparkles className="h-4 w-4" />
              <span>ফিল্টার</span>
            </button>
            <button
              onClick={() => setActiveTab('crop')}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 font-medium transition-colors ${
                activeTab === 'crop' ? 'bg-emerald-600 text-white' : 'text-slate-300 hover:bg-slate-800'
              }`}
            >
              <Crop className="h-4 w-4" />
              <span>ক্রপ ও রোটেট</span>
            </button>
            <button
              onClick={() => setActiveTab('text')}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 font-medium transition-colors ${
                activeTab === 'text' ? 'bg-emerald-600 text-white' : 'text-slate-300 hover:bg-slate-800'
              }`}
            >
              <Type className="h-4 w-4" />
              <span>টেক্সট</span>
            </button>
            <button
              onClick={() => setActiveTab('stickers')}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 font-medium transition-colors ${
                activeTab === 'stickers' ? 'bg-emerald-600 text-white' : 'text-slate-300 hover:bg-slate-800'
              }`}
            >
              <Smile className="h-4 w-4" />
              <span>স্টিকার</span>
            </button>
            <button
              onClick={() => setActiveTab('draw')}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 font-medium transition-colors ${
                activeTab === 'draw' ? 'bg-emerald-600 text-white' : 'text-slate-300 hover:bg-slate-800'
              }`}
            >
              <PenTool className="h-4 w-4" />
              <span>ড্রইং</span>
            </button>
          </div>

          {/* Active Tool Sub-Panel */}
          <div className="pt-3 min-h-[95px] flex items-center justify-center">
            {activeTab === 'adjust' && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 w-full text-xs">
                <div>
                  <div className="flex justify-between text-slate-400 mb-1">
                    <span>উজ্জ্বলতা (Brightness)</span>
                    <span>{currentState.brightness}</span>
                  </div>
                  <input
                    type="range"
                    min="-100"
                    max="100"
                    value={currentState.brightness}
                    onChange={(e) =>
                      updateCurrentState((p) => ({ ...p, brightness: Number(e.target.value) }))
                    }
                    className="w-full accent-emerald-500"
                  />
                </div>
                <div>
                  <div className="flex justify-between text-slate-400 mb-1">
                    <span>কনট্রাস্ট (Contrast)</span>
                    <span>{currentState.contrast}</span>
                  </div>
                  <input
                    type="range"
                    min="-100"
                    max="100"
                    value={currentState.contrast}
                    onChange={(e) =>
                      updateCurrentState((p) => ({ ...p, contrast: Number(e.target.value) }))
                    }
                    className="w-full accent-emerald-500"
                  />
                </div>
                <div>
                  <div className="flex justify-between text-slate-400 mb-1">
                    <span>স্যাচুরেশন (Saturation)</span>
                    <span>{currentState.saturation}</span>
                  </div>
                  <input
                    type="range"
                    min="-100"
                    max="100"
                    value={currentState.saturation}
                    onChange={(e) =>
                      updateCurrentState((p) => ({ ...p, saturation: Number(e.target.value) }))
                    }
                    className="w-full accent-emerald-500"
                  />
                </div>
                <div>
                  <div className="flex justify-between text-slate-400 mb-1">
                    <span>ব্লার (Blur)</span>
                    <span>{currentState.blur}px</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="15"
                    value={currentState.blur}
                    onChange={(e) =>
                      updateCurrentState((p) => ({ ...p, blur: Number(e.target.value) }))
                    }
                    className="w-full accent-emerald-500"
                  />
                </div>
              </div>
            )}

            {activeTab === 'filters' && (
              <div className="flex items-center gap-3 overflow-x-auto py-1">
                {[
                  { id: 'none', name: 'স্বাভাবিক' },
                  { id: 'warm', name: 'উষ্ণ' },
                  { id: 'vintage', name: 'ভিন্টেজ' },
                  { id: 'monochrome', name: 'সাদাকালো' },
                  { id: 'vivid', name: 'উজ্জ্বল' },
                  { id: 'cool', name: 'শান্ত' },
                  { id: 'dramatic', name: 'নাট্যময়' },
                  { id: 'sepia', name: 'সেপিয়া' },
                ].map((f) => (
                  <button
                    key={f.id}
                    onClick={() =>
                      updateCurrentState((p) => ({ ...p, filter: f.id as ImageEditState['filter'] }))
                    }
                    className={`rounded-xl px-3 py-2 text-xs font-semibold shrink-0 transition-all ${
                      currentState.filter === f.id
                        ? 'bg-emerald-600 text-white ring-2 ring-emerald-400/40'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    {f.name}
                  </button>
                ))}
              </div>
            )}

            {activeTab === 'crop' && (
              <div className="flex flex-wrap items-center justify-center gap-4 text-xs">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() =>
                      updateCurrentState((p) => ({
                        ...p,
                        rotation: (p.rotation + 90) % 360,
                      }))
                    }
                    className="flex items-center gap-1.5 rounded-lg bg-slate-800 px-3 py-2 text-slate-200 hover:bg-slate-700"
                  >
                    <RotateCw className="h-4 w-4" />
                    <span>৯০° ঘোরান</span>
                  </button>
                  <button
                    onClick={() =>
                      updateCurrentState((p) => ({
                        ...p,
                        flipH: !p.flipH,
                      }))
                    }
                    className="rounded-lg bg-slate-800 px-3 py-2 text-slate-200 hover:bg-slate-700"
                  >
                    হরিজন্টাল ফ্লিপ
                  </button>
                </div>

                <div className="h-6 w-px bg-slate-800" />

                <div className="flex items-center gap-2">
                  <span className="text-slate-400">অনুপাত:</span>
                  {(['free', '1:1', '4:5', '16:9', '9:16'] as const).map((aspect) => (
                    <button
                      key={aspect}
                      onClick={() => updateCurrentState((p) => ({ ...p, cropAspect: aspect }))}
                      className={`rounded-lg px-2.5 py-1.5 text-xs font-medium ${
                        currentState.cropAspect === aspect
                          ? 'bg-emerald-600 text-white'
                          : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                      }`}
                    >
                      {aspect === 'free'
                        ? 'ফ্রি'
                        : aspect === '1:1'
                        ? '1:1 (বর্গ)'
                        : aspect === '4:5'
                        ? '4:5'
                        : aspect === '16:9'
                        ? '16:9'
                        : '9:16 (রিল)'}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'text' && (
              <div className="flex items-center gap-2 max-w-md w-full">
                <input
                  type="text"
                  placeholder="ছবিতে লেখা যোগ করুন..."
                  value={newTextInput}
                  onChange={(e) => setNewTextInput(e.target.value)}
                  className="flex-1 rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-xs text-white placeholder-slate-400 focus:border-emerald-500 focus:outline-hidden"
                />
                <input
                  type="color"
                  value={textColor}
                  onChange={(e) => setTextColor(e.target.value)}
                  className="h-8 w-8 cursor-pointer rounded-lg border-0 bg-transparent p-0"
                  title="লেখার রঙ নির্বাচন করুন"
                />
                <button
                  onClick={handleAddText}
                  className="rounded-lg bg-emerald-600 px-3.5 py-2 text-xs font-bold text-white hover:bg-emerald-500"
                >
                  যোগ করুন
                </button>
              </div>
            )}

            {activeTab === 'stickers' && (
              <div className="flex items-center gap-2 overflow-x-auto py-1">
                {STICKERS.map((stk) => (
                  <button
                    key={stk}
                    onClick={() => handleAddSticker(stk)}
                    className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-800 text-xl hover:scale-125 transition-transform"
                  >
                    {stk}
                  </button>
                ))}
              </div>
            )}

            {activeTab === 'draw' && (
              <div className="flex items-center gap-4 text-xs">
                <div className="flex items-center gap-2">
                  <span className="text-slate-400">রঙ:</span>
                  <input
                    type="color"
                    value={penColor}
                    onChange={(e) => setPenColor(e.target.value)}
                    className="h-8 w-8 cursor-pointer rounded-lg border-0 bg-transparent p-0"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-slate-400">সাইজ:</span>
                  <input
                    type="range"
                    min="2"
                    max="20"
                    value={penWidth}
                    onChange={(e) => setPenWidth(Number(e.target.value))}
                    className="w-24 accent-emerald-500"
                  />
                </div>
                <button
                  onClick={() => updateCurrentState((p) => ({ ...p, drawings: [] }))}
                  className="flex items-center gap-1 rounded-lg bg-rose-900/60 px-2.5 py-1.5 text-rose-300 hover:bg-rose-900"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  <span>মুছে ফেলুন</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
