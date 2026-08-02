import { X, SlidersHorizontal } from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { useModel } from '@/contexts/ModelContext';

interface ModelSettingsPanelProps {
  open: boolean;
  onClose: () => void;
}

export function ModelSettingsPanel({ open, onClose }: ModelSettingsPanelProps) {
  const {
    temperature,
    setTemperature,
    maxTokens,
    setMaxTokens,
    systemPrompt,
    setSystemPrompt,
    showReasoning,
    setShowReasoning,
  } = useModel();

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-[#060411]/85 backdrop-blur-md" />

      <div
        className="relative z-10 w-full overflow-hidden rounded-t-3xl border border-white/[0.08] bg-[#0b0718]/95 shadow-[0_30px_120px_-20px_rgba(139,92,246,0.4)] sm:max-w-md sm:rounded-3xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="pointer-events-none absolute -top-24 -right-16 h-56 w-56 rounded-full bg-violet-600/25 blur-[110px]" />

        {/* Header */}
        <div className="relative flex items-center justify-between border-b border-white/[0.06] px-6 py-5">
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-500/15">
              <SlidersHorizontal className="h-4 w-4 text-violet-300" />
            </span>
            <h2 className="text-lg font-black text-white" style={{ fontFamily: 'Fredoka' }}>
              Model settings
            </h2>
          </div>
          <button
            onClick={onClose}
            className="rounded-xl border border-white/[0.08] bg-white/[0.03] p-2 text-white/50 transition-colors hover:border-violet-400/30 hover:text-white"
            aria-label="Close settings"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="relative space-y-6 px-6 py-6">
          {/* Temperature */}
          <div>
            <div className="mb-2 flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wide text-white/50">Temperature</label>
              <span className="rounded-md bg-violet-500/15 px-2 py-0.5 font-mono text-xs text-violet-200">
                {temperature.toFixed(2)}
              </span>
            </div>
            <Slider
              value={[temperature]}
              onValueChange={([v]) => setTemperature(v)}
              min={0}
              max={2}
              step={0.05}
              className="w-full"
            />
            <p className="mt-1.5 text-[11px] text-white/30">Lower = focused · Higher = creative</p>
          </div>

          {/* Max tokens */}
          <div>
            <div className="mb-2 flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wide text-white/50">Max tokens</label>
              <span className="rounded-md bg-violet-500/15 px-2 py-0.5 font-mono text-xs text-violet-200">
                {maxTokens}
              </span>
            </div>
            <Slider
              value={[maxTokens]}
              onValueChange={([v]) => setMaxTokens(v)}
              min={256}
              max={16000}
              step={256}
              className="w-full"
            />
          </div>

          {/* Show reasoning */}
          <div className="flex items-center justify-between rounded-2xl border border-white/[0.06] bg-white/[0.02] px-4 py-3">
            <div>
              <label className="text-sm font-bold text-white/85">Show reasoning</label>
              <p className="text-[11px] text-white/30">Display the model's thinking process</p>
            </div>
            <Switch checked={showReasoning} onCheckedChange={setShowReasoning} />
          </div>

          {/* System prompt */}
          <div>
            <label className="mb-2 block text-xs font-bold uppercase tracking-wide text-white/50">System prompt</label>
            <textarea
              value={systemPrompt}
              onChange={(e) => setSystemPrompt(e.target.value)}
              rows={4}
              className="w-full resize-none rounded-2xl border border-white/[0.08] bg-white/[0.03] px-4 py-3 text-sm text-white outline-none transition-colors placeholder:text-white/25 focus:border-violet-400/40 focus:bg-white/[0.05]"
              placeholder="Customize the AI's personality…"
            />
          </div>

          <button
            onClick={onClose}
            className="w-full rounded-2xl bg-gradient-to-r from-violet-500 to-fuchsia-500 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-violet-500/25 transition-all hover:brightness-110"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}