import { useState } from 'react';
import { X, ImageIcon, Volume2, Video, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { IMAGE_MODELS, VIDEO_MODELS, TTS_VOICES } from '@/lib/models';

type Tab = 'image' | 'audio' | 'video';

interface GenerateModalProps {
  open: boolean;
  onClose: () => void;
  onGenerate: (type: Tab, prompt: string, options: Record<string, unknown>) => Promise<void>;
  isGenerating: boolean;
}

export function GenerateModal({ open, onClose, onGenerate, isGenerating }: GenerateModalProps) {
  const [tab, setTab] = useState<Tab>('image');
  const [prompt, setPrompt] = useState('');
  const [voice, setVoice] = useState<string>('nova');
  const [imgModel, setImgModel] = useState('gpt-image-2');
  const [videoModel, setVideoModel] = useState('minimax-video-01');

  const handleGenerate = async () => {
    if (!prompt.trim() || isGenerating) return;
    const opts: Record<string, unknown> =
      tab === 'image' ? { model: imgModel } :
      tab === 'audio' ? { voice } :
      { model: videoModel };
    await onGenerate(tab, prompt.trim(), opts);
    setPrompt('');
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      <div
        className="relative z-10 w-full sm:max-w-lg rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-hidden bg-slate-900 border border-slate-700"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-700">
          <h2 className="font-semibold text-slate-100">Generate Media</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-200">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex px-4 pt-4 gap-2">
          {(['image', 'audio', 'video'] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                tab === t ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              {t === 'image' && <ImageIcon className="w-4 h-4" />}
              {t === 'audio' && <Volume2 className="w-4 h-4" />}
              {t === 'video' && <Video className="w-4 h-4" />}
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>

        <div className="p-5 space-y-4">
          {/* Prompt */}
          <div>
            <label className="text-sm font-medium text-slate-200 mb-1.5 block">
              {tab === 'image' ? 'Describe the image' : tab === 'audio' ? 'Text to speak' : 'Describe the video'}
            </label>
            <textarea
              autoFocus
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleGenerate(); }}
              placeholder={
                tab === 'image' ? 'A mystical fox spirit floating above cherry blossom trees at dusk…' :
                tab === 'audio' ? 'Welcome, traveller. The ancient fox spirit greets you…' :
                'A kitsune dancing through autumn leaves in a moonlit forest…'
              }
              rows={3}
              className="w-full px-3 py-2.5 rounded-xl text-sm resize-none outline-none bg-slate-800 text-slate-200 border border-slate-600 placeholder:text-slate-500 focus:border-amber-500/50"
            />
          </div>

          {/* Image options */}
          {tab === 'image' && (
            <div>
              <label className="text-sm font-medium text-slate-200 mb-1.5 block">
                Model <span className="opacity-50 font-normal">({IMAGE_MODELS.length} available)</span>
              </label>
              <div className="flex gap-2 flex-wrap">
                {IMAGE_MODELS.map((m) => (
                  <button
                    key={m}
                    onClick={() => setImgModel(m)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all ${
                      imgModel === m ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Audio options */}
          {tab === 'audio' && (
            <div>
              <label className="text-sm font-medium text-slate-200 mb-1.5 block">Voice</label>
              <div className="flex gap-2 flex-wrap">
                {TTS_VOICES.map((v) => (
                  <button
                    key={v}
                    onClick={() => setVoice(v)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-all ${
                      voice === v ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {v}
                  </button>
                ))}
              </div>
              <p className="text-xs text-slate-500 mt-2">Uses OpenAI TTS via puter.js — high quality speech synthesis</p>
            </div>
          )}

          {/* Video options */}
          {tab === 'video' && (
            <div>
              <label className="text-sm font-medium text-slate-200 mb-1.5 block">Video model</label>
              <div className="flex gap-2 flex-wrap">
                {VIDEO_MODELS.map((vm) => (
                  <button
                    key={vm}
                    onClick={() => setVideoModel(vm)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all ${
                      videoModel === vm ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {vm}
                  </button>
                ))}
              </div>
              <p className="text-xs text-slate-500 mt-2">Video generation may take up to 60 seconds</p>
            </div>
          )}

          {/* Generate button */}
          <Button
            onClick={handleGenerate}
            disabled={!prompt.trim() || isGenerating}
            className="w-full gap-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-medium"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Generating {tab}…
              </>
            ) : (
              <>
                {tab === 'image' && <ImageIcon className="w-4 h-4" />}
                {tab === 'audio' && <Volume2 className="w-4 h-4" />}
                {tab === 'video' && <Video className="w-4 h-4" />}
                Generate {tab}
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}