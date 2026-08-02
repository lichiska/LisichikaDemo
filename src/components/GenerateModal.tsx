import { useMemo, useState } from 'react';
import { X, Image as ImageIcon, Volume2, Video, Loader2, Wand2, Shuffle, Check } from 'lucide-react';
import {
  IMAGE_PROMPT_IDEAS,
  IMAGE_SIZE_PRESETS,
  IMAGE_STYLE_PRESETS,
  TTS_VOICES,
  VIDEO_MODEL_OPTIONS,
} from '@/lib/models';
import { useModel } from '@/contexts/ModelContext';

type Tab = 'image' | 'audio' | 'video';

interface GenerateModalProps {
  open: boolean;
  onClose: () => void;
  onGenerate: (type: Tab, prompt: string, options: Record<string, unknown>) => Promise<void>;
  isGenerating: boolean;
}

const TABS: { id: Tab; label: string; icon: typeof ImageIcon; accent: string }[] = [
  { id: 'image', label: 'Image', icon: ImageIcon, accent: 'from-orange-500 to-amber-500' },
  { id: 'audio', label: 'Audio', icon: Volume2, accent: 'from-violet-500 to-purple-500' },
  { id: 'video', label: 'Video', icon: Video, accent: 'from-pink-500 to-rose-500' },
];

export function GenerateModal({ open, onClose, onGenerate, isGenerating }: GenerateModalProps) {
  const { imageModelOptions } = useModel();

  const [tab, setTab] = useState<Tab>('image');
  const [prompt, setPrompt] = useState('');
  const [voice, setVoice] = useState<string>('nova');
  const [imgModel, setImgModel] = useState(imageModelOptions[0]?.id ?? 'gpt-image-2');
  const [styleId, setStyleId] = useState('cartoon');
  const [sizeId, setSizeId] = useState('square');
  const [videoModel, setVideoModel] = useState(VIDEO_MODEL_OPTIONS[0].id);

  const style = IMAGE_STYLE_PRESETS.find((s) => s.id === styleId) ?? IMAGE_STYLE_PRESETS[0];
  const size = IMAGE_SIZE_PRESETS.find((s) => s.id === sizeId) ?? IMAGE_SIZE_PRESETS[0];

  const finalPrompt = useMemo(() => {
    const base = prompt.trim();
    if (!base) return '';
    return tab === 'image' ? `${base}${style.suffix}` : base;
  }, [prompt, style.suffix, tab]);

  const activeTab = TABS.find((t) => t.id === tab) ?? TABS[0];

  const handleGenerate = async () => {
    if (!finalPrompt || isGenerating) return;

    const opts: Record<string, unknown> =
      tab === 'image'
        ? { model: imgModel, width: size.width, height: size.height }
        : tab === 'audio'
          ? { voice }
          : { model: videoModel };

    await onGenerate(tab, finalPrompt, opts);
    setPrompt('');
  };

  const shufflePrompt = () => {
    const pool = IMAGE_PROMPT_IDEAS.filter((idea) => idea !== prompt);
    setPrompt(pool[Math.floor(Math.random() * pool.length)] ?? IMAGE_PROMPT_IDEAS[0]);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-[#060411]/85 backdrop-blur-md" />

      <div
        className="relative z-10 flex w-full flex-col overflow-hidden rounded-t-3xl border border-white/[0.08] bg-[#0b0718]/95 shadow-[0_30px_120px_-20px_rgba(236,72,153,0.4)] sm:max-w-2xl sm:rounded-3xl"
        style={{ maxHeight: '92vh' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="pointer-events-none absolute -top-28 -left-20 h-64 w-64 rounded-full bg-orange-500/20 blur-[120px]" />
        <div className="pointer-events-none absolute -bottom-28 -right-20 h-64 w-64 rounded-full bg-fuchsia-600/20 blur-[120px]" />

        {/* Header */}
        <div className="relative flex items-start justify-between gap-4 border-b border-white/[0.06] px-6 pt-6 pb-5">
          <div>
            <h2 className="text-2xl font-black leading-tight" style={{ fontFamily: 'Fredoka' }}>
              <span className="text-white">Create with </span>
              <span className="bg-gradient-to-r from-orange-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">
                AI.
              </span>
            </h2>
            <p className="mt-1.5 text-xs text-white/35">
              Images, voice-over and video — all free, straight into your chat.
            </p>
          </div>
          <button
            onClick={onClose}
            className="shrink-0 rounded-xl border border-white/[0.08] bg-white/[0.03] p-2 text-white/50 transition-colors hover:border-pink-400/30 hover:text-white"
            aria-label="Close generator"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Tabs */}
        <div className="relative flex gap-2 px-6 pt-5">
          {TABS.map((t) => {
            const isActive = t.id === tab;
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`flex flex-1 items-center justify-center gap-2 rounded-2xl px-4 py-2.5 text-sm font-bold transition-all ${
                  isActive
                    ? `bg-gradient-to-r ${t.accent} text-white shadow-lg shadow-black/30`
                    : 'border border-white/[0.08] bg-white/[0.02] text-white/45 hover:border-white/20 hover:text-white/80'
                }`}
              >
                <t.icon className="h-4 w-4" />
                {t.label}
              </button>
            );
          })}
        </div>

        {/* Body */}
        <div className="relative min-h-0 flex-1 space-y-5 overflow-y-auto px-6 py-5">
          {/* Prompt */}
          <div>
            <div className="mb-2 flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wide text-white/50">
                {tab === 'image' ? 'Describe the image' : tab === 'audio' ? 'Text to speak' : 'Describe the video'}
              </label>
              {tab === 'image' && (
                <button
                  onClick={shufflePrompt}
                  className="inline-flex items-center gap-1.5 rounded-full border border-white/[0.08] bg-white/[0.03] px-2.5 py-1 text-[11px] font-semibold text-white/50 transition-colors hover:border-orange-400/30 hover:text-orange-300"
                >
                  <Shuffle className="h-3 w-3" />
                  Inspire me
                </button>
              )}
            </div>

            <textarea
              autoFocus
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleGenerate();
              }}
              placeholder={
                tab === 'image'
                  ? 'A mystical fox spirit floating above cherry blossom trees at dusk…'
                  : tab === 'audio'
                    ? 'Welcome, traveller. The ancient fox spirit greets you…'
                    : 'A kitsune dancing through autumn leaves in a moonlit forest…'
              }
              rows={3}
              className="w-full resize-none rounded-2xl border border-white/[0.08] bg-white/[0.03] px-4 py-3 text-sm text-white outline-none transition-colors placeholder:text-white/25 focus:border-orange-400/40 focus:bg-white/[0.05]"
            />
          </div>

          {/* Image controls */}
          {tab === 'image' && (
            <>
              <div>
                <label className="mb-2 block text-xs font-bold uppercase tracking-wide text-white/50">Style</label>
                <div className="flex flex-wrap gap-1.5">
                  {IMAGE_STYLE_PRESETS.map((preset) => (
                    <button
                      key={preset.id}
                      onClick={() => setStyleId(preset.id)}
                      className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-all ${
                        styleId === preset.id
                          ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-lg shadow-orange-500/25'
                          : 'border border-white/[0.08] bg-white/[0.02] text-white/45 hover:border-orange-400/25 hover:text-white/80'
                      }`}
                    >
                      <span className="mr-1">{preset.emoji}</span>
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="mb-2 block text-xs font-bold uppercase tracking-wide text-white/50">
                  Aspect ratio
                </label>
                <div className="grid grid-cols-5 gap-1.5">
                  {IMAGE_SIZE_PRESETS.map((preset) => (
                    <button
                      key={preset.id}
                      onClick={() => setSizeId(preset.id)}
                      className={`rounded-xl px-2 py-2 text-center transition-all ${
                        sizeId === preset.id
                          ? 'bg-orange-500/20 ring-1 ring-orange-400/40'
                          : 'border border-white/[0.08] bg-white/[0.02] hover:border-white/20'
                      }`}
                    >
                      <span
                        className={`block text-xs font-bold ${
                          sizeId === preset.id ? 'text-orange-200' : 'text-white/70'
                        }`}
                      >
                        {preset.label}
                      </span>
                      <span className="mt-0.5 block text-[10px] text-white/30">{preset.hint}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="mb-2 block text-xs font-bold uppercase tracking-wide text-white/50">
                  Model <span className="font-normal normal-case text-white/25">({imageModelOptions.length} available)</span>
                </label>
                <div className="grid max-h-52 grid-cols-1 gap-1.5 overflow-y-auto pr-1 sm:grid-cols-2">
                  {imageModelOptions.map((option) => {
                    const isActive = imgModel === option.id;
                    return (
                      <button
                        key={option.id}
                        onClick={() => setImgModel(option.id)}
                        className={`flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-left transition-all ${
                          isActive
                            ? 'bg-gradient-to-r from-orange-500/20 to-amber-500/10 ring-1 ring-orange-400/40'
                            : 'border border-white/[0.08] bg-white/[0.02] hover:border-white/20'
                        }`}
                      >
                        <span className="min-w-0 flex-1">
                          <span
                            className={`block truncate text-xs font-bold ${
                              isActive ? 'text-orange-200' : 'text-white/80'
                            }`}
                          >
                            {option.label}
                          </span>
                          {option.note && (
                            <span className="mt-0.5 block truncate text-[10px] text-white/30">{option.note}</span>
                          )}
                        </span>
                        {isActive && <Check className="h-3.5 w-3.5 shrink-0 text-orange-300" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {finalPrompt && styleId !== 'none' && (
                <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] px-4 py-3">
                  <p className="mb-1 text-[10px] font-bold uppercase tracking-wide text-white/35">Final prompt</p>
                  <p className="text-[11px] leading-relaxed text-white/50">{finalPrompt}</p>
                </div>
              )}
            </>
          )}

          {/* Audio controls */}
          {tab === 'audio' && (
            <div>
              <label className="mb-2 block text-xs font-bold uppercase tracking-wide text-white/50">Voice</label>
              <div className="flex flex-wrap gap-1.5">
                {TTS_VOICES.map((v) => (
                  <button
                    key={v}
                    onClick={() => setVoice(v)}
                    className={`rounded-full px-3.5 py-1.5 text-xs font-semibold capitalize transition-all ${
                      voice === v
                        ? 'bg-gradient-to-r from-violet-500 to-purple-500 text-white shadow-lg shadow-violet-500/25'
                        : 'border border-white/[0.08] bg-white/[0.02] text-white/45 hover:border-violet-400/25 hover:text-white/80'
                    }`}
                  >
                    {v}
                  </button>
                ))}
              </div>
              <p className="mt-2 text-[11px] text-white/30">
                High-quality speech synthesis via puter.js — no API key needed.
              </p>
            </div>
          )}

          {/* Video controls */}
          {tab === 'video' && (
            <div>
              <label className="mb-2 block text-xs font-bold uppercase tracking-wide text-white/50">Video model</label>
              <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
                {VIDEO_MODEL_OPTIONS.map((option) => {
                  const isActive = videoModel === option.id;
                  return (
                    <button
                      key={option.id}
                      onClick={() => setVideoModel(option.id)}
                      className={`flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-left transition-all ${
                        isActive
                          ? 'bg-gradient-to-r from-pink-500/20 to-rose-500/10 ring-1 ring-pink-400/40'
                          : 'border border-white/[0.08] bg-white/[0.02] hover:border-white/20'
                      }`}
                    >
                      <span className="min-w-0 flex-1">
                        <span
                          className={`block truncate text-xs font-bold ${isActive ? 'text-pink-200' : 'text-white/80'}`}
                        >
                          {option.label}
                        </span>
                        {option.note && (
                          <span className="mt-0.5 block truncate text-[10px] text-white/30">{option.note}</span>
                        )}
                      </span>
                      {isActive && <Check className="h-3.5 w-3.5 shrink-0 text-pink-300" />}
                    </button>
                  );
                })}
              </div>
              <p className="mt-2 text-[11px] text-white/30">Video generation may take up to 60 seconds.</p>
            </div>
          )}
        </div>

        {/* Footer action */}
        <div className="relative border-t border-white/[0.06] px-6 py-4">
          <button
            onClick={handleGenerate}
            disabled={!finalPrompt || isGenerating}
            className={`flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r ${activeTab.accent} px-4 py-3 text-sm font-bold text-white shadow-lg shadow-black/30 transition-all hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40`}
          >
            {isGenerating ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Generating {tab}…
              </>
            ) : (
              <>
                <Wand2 className="h-4 w-4" />
                Generate {tab}
              </>
            )}
          </button>
          <p className="mt-2 text-center text-[10px] text-white/25">⌘ / Ctrl + Enter to generate</p>
        </div>
      </div>
    </div>
  );
}