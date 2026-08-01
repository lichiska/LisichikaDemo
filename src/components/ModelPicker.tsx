import { useState, useMemo } from 'react';
import { Search, X, Check } from 'lucide-react';
import { PROVIDERS, CAPABILITY_LABELS, type ModelInfo, type Capability } from '@/lib/models';
import { useModel } from '@/contexts/ModelContext';

interface ModelPickerProps {
  open: boolean;
  onClose: () => void;
}

export function ModelPicker({ open, onClose }: ModelPickerProps) {
  const { selectedModel, setSelectedModel } = useModel();
  const [search, setSearch] = useState('');
  const [activeProvider, setActiveProvider] = useState<string>('openai');

  const filteredModels = useMemo<ModelInfo[]>(() => {
    const q = search.toLowerCase().trim();
    if (!q) return PROVIDERS.find((p) => p.id === activeProvider)?.models ?? [];
    return PROVIDERS.flatMap((p) => p.models).filter(
      (m) => m.id.toLowerCase().includes(q) || m.name.toLowerCase().includes(q) || m.provider.toLowerCase().includes(q)
    );
  }, [search, activeProvider]);

  const handleSelect = (modelId: string) => {
    setSelectedModel(modelId);
    onClose();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      <div
        className="relative z-10 w-full max-w-2xl rounded-2xl shadow-2xl flex flex-col overflow-hidden bg-slate-900 border border-slate-700"
        style={{ maxHeight: '85vh' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-700">
          <h2 className="text-lg font-semibold text-slate-100">Choose a model</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search */}
        <div className="px-4 py-3 border-b border-slate-700">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              autoFocus
              type="text"
              placeholder={`Search ${PROVIDERS.reduce((s, p) => s + p.models.length, 0)}+ models…`}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-lg text-sm outline-none bg-slate-800 text-slate-200 border border-slate-600 placeholder:text-slate-500 focus:border-amber-500/50"
            />
          </div>
        </div>

        {/* Provider tabs */}
        {!search && (
          <div className="flex gap-1 px-4 py-2 overflow-x-auto border-b border-slate-700 shrink-0">
            {PROVIDERS.map((p) => (
              <button
                key={p.id}
                onClick={() => setActiveProvider(p.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors shrink-0 ${
                  activeProvider === p.id
                    ? 'bg-amber-500 text-slate-950'
                    : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <img
                  src={p.logo}
                  alt=""
                  className="w-3.5 h-3.5"
                  style={{ filter: activeProvider === p.id ? 'none' : 'brightness(0) invert(0.7)' }}
                  onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                />
                {p.name}
                <span className="opacity-50">({p.models.length})</span>
              </button>
            ))}
          </div>
        )}

        {/* Model list */}
        <div className="overflow-y-auto flex-1 p-3">
          {filteredModels.length === 0 ? (
            <div className="text-center py-12 text-sm text-slate-500">
              No models match "{search}"
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-1">
              {filteredModels.map((m) => {
                const isSelected = m.id === selectedModel;
                return (
                  <button
                    key={m.id}
                    onClick={() => handleSelect(m.id)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all ${
                      isSelected ? 'bg-amber-500/20 border border-amber-500/40' : 'hover:bg-slate-800 border border-transparent'
                    }`}
                  >
                    <span className={`flex-1 text-sm font-medium ${isSelected ? 'text-amber-300' : 'text-slate-200'}`}>
                      {m.name}
                    </span>
                    <div className="flex gap-1">
                      {m.capabilities.slice(0, 4).map((cap) => (
                        <span
                          key={cap}
                          className="text-[10px] px-1.5 py-0.5 rounded bg-slate-700/50 text-slate-400"
                          title={CAPABILITY_LABELS[cap]?.description}
                        >
                          {CAPABILITY_LABELS[cap]?.icon}
                        </span>
                      ))}
                    </div>
                    {isSelected && <Check className="w-4 h-4 text-amber-400 shrink-0" />}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-700 text-xs text-slate-500">
          {PROVIDERS.reduce((s, p) => s + p.models.length, 0)} models across {PROVIDERS.length} providers · powered by puter.js
        </div>
      </div>
    </div>
  );
}