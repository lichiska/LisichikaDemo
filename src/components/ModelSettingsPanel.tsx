import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { useModel } from '@/contexts/ModelContext';

interface ModelSettingsPanelProps {
  open: boolean;
  onClose: () => void;
}

export function ModelSettingsPanel({ open, onClose }: ModelSettingsPanelProps) {
  const { temperature, setTemperature, maxTokens, setMaxTokens, systemPrompt, setSystemPrompt, showReasoning, setShowReasoning } = useModel();

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      <div
        className="relative z-10 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden bg-slate-900 border border-slate-700"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-700">
          <h2 className="font-semibold text-slate-100">Model Settings</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-200">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-6">
          {/* Temperature */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-slate-200">Temperature</label>
              <span className="text-xs text-amber-400 font-mono">{temperature.toFixed(2)}</span>
            </div>
            <Slider
              value={[temperature]}
              onValueChange={([v]) => setTemperature(v)}
              min={0}
              max={2}
              step={0.05}
              className="w-full"
            />
            <p className="text-xs text-slate-500 mt-1">Lower = more focused, Higher = more creative</p>
          </div>

          {/* Max tokens */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-slate-200">Max Tokens</label>
              <span className="text-xs text-amber-400 font-mono">{maxTokens}</span>
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
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-slate-200">Show Reasoning</label>
              <p className="text-xs text-slate-500">Display model's thinking process</p>
            </div>
            <Switch checked={showReasoning} onCheckedChange={setShowReasoning} />
          </div>

          {/* System prompt */}
          <div>
            <label className="text-sm font-medium text-slate-200 mb-2 block">System Prompt</label>
            <textarea
              value={systemPrompt}
              onChange={(e) => setSystemPrompt(e.target.value)}
              rows={4}
              className="w-full px-3 py-2.5 rounded-xl text-sm resize-none outline-none bg-slate-800 text-slate-200 border border-slate-600 placeholder:text-slate-500 focus:border-amber-500/50"
              placeholder="Customize the AI's personality..."
            />
          </div>

          <Button
            onClick={onClose}
            className="w-full bg-amber-500 hover:bg-amber-600 text-slate-950 font-medium"
          >
            Done
          </Button>
        </div>
      </div>
    </div>
  );
}