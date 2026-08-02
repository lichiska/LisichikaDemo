import { useMemo, useState } from 'react';
import { Search, X, Check, Loader2, Radio, Sparkles } from 'lucide-react';
import { CAPABILITY_LABELS, type Capability, type ModelInfo } from '@/lib/models';
import { useModel } from '@/contexts/ModelContext';

interface ModelPickerProps {
  open: boolean;
  onClose: () => void;
}

const FILTERS: { id: 'all' | Capability; label: string; emoji: string }[] = [
  { id: 'all', label: 'All', emoji: '✨' },
  { id: 'chat', label: 'Chat', emoji: CAPABILITY_LABELS.chat.icon },
  { id: 'code', label: 'Code', emoji: CAPABILITY_LABELS.code.icon },
  { id: 'vision', label: 'Vision', emoji: CAPABILITY_LABELS.vision.icon },
  { id: 'image', label: 'Image', emoji: CAPABILITY_LABELS.image.icon },
  { id: 'reasoning', label: 'Reasoning', emoji: CAPABILITY_LABELS.reasoning.icon },
  { id: 'search', label: 'Search', emoji: CAPABILITY_LABELS.search.icon },
];

function formatContext(tokens?: number): string | null {
  if (!tokens || tokens <= 0) return null;
  if (tokens >= 1000) return `${Math.round(tokens / 1000)}K ctx`;
  return `${tokens} ctx`;
}

export function ModelPicker({ open, onClose }: ModelPickerProps) {
  const {
    selectedModel,
    setSelectedModel,
    providers,
    totalModels,
    catalogSource,
    catalogLoading,
  } = useModel();

  const [search, setSearch] = useState('');
  const [capability, setCapability] = useState<'all' | Capability>('all');
  const [activeProvider, setActiveProvider] = useState<string>(providers[0]?.id ?? 'openai');

  const currentProvider = providers.find((p) => p.id === activeProvider) ?? providers[0];

  const results = useMemo<ModelInfo[]>(() => {
    const query = search.toLowerCase().trim();
    const pool = query ? providers.flatMap((p) => p.models) : (currentProvider?.models ?? []);

    return pool.filter((model) => {
      if (capability !== 'all' && !model.capabilities.includes(capability)) return false;
      if (!query) return true;
      return (
        model.id.toLowerCase().includes(query) ||
        model.name.toLowerCase().includes(query) ||
        model.provider.toLowerCase().includes(query)
      );
    });
  }, [search, capability, providers, currentProvider]);

  const handleSelect = (modelId: string) => {
    setSelectedModel(modelId);
    onClose();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-[#060411]/85 backdrop-blur-md" />

      <div
        className="relative z-10 w-full sm:max-w-3xl flex flex-col overflow-hidden rounded-t-3xl sm:rounded-3xl border border-white/[0.08] bg-[#0b0718]/95 shadow-[0_30px_120px_-20px_rgba(168,85,247,0.45)]"
        style={{ maxHeight: '88vh' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Ambient glow */}
        <div className="pointer-events-none absolute -top-32 -right-24 h-72 w-72 rounded-full bg-purple-600/25 blur-[120px]" />
        <div className="pointer-events-none absolute -bottom-32 -left-24 h-72 w-72 rounded-full bg-fuchsia-600/20 blur-[120px]" />

        {/* Header */}
        <div className="relative flex items-start justify-between gap-4 px-6 pt-6 pb-5 border-b border-white/[0.06]">
          <div>
            <h2 className="text-2xl font-black leading-tight" style={{ fontFamily: 'Fredoka' }}>
              <span className="text-white">Choose your </span>
              <span className="bg-gradient-to-r from-purple-400 via-fuchsia-400 to-orange-400 bg-clip-text text-transparent">
                model.
              </span>
            </h2>
            <div className="mt-2 flex items-center gap-2 text-xs">
              {catalogLoading ? (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-white/[0.04] border border-white/[0.08] px-2.5 py-1 text-white/50">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  Loading catalog…
                </span>
              ) : (
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 font-semibold ${
                    catalogSource === 'live'
                      ? 'bg-emerald-500/15 border border-emerald-400/25 text-emerald-300'
                      : 'bg-purple-500/15 border border-purple-400/25 text-purple-300'
                  }`}
                >
                  <Radio className="h-3 w-3" />
                  {catalogSource === 'live' ? 'Live from puter.js' : 'Built-in catalog'}
                </span>
              )}
              <span className="text-white/35">
                {totalModels} models · {providers.length} providers
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="shrink-0 rounded-xl border border-white/[0.08] bg-white/[0.03] p-2 text-white/50 transition-colors hover:border-purple-400/30 hover:text-white"
            aria-label="Close model picker"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Search + capability filters */}
        <div className="relative px-6 py-4 space-y-3 border-b border-white/[0.06]">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-purple-300/50" />
            <input
              autoFocus
              type="text"
              placeholder={`Search ${totalModels} models…`}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-2xl border border-white/[0.08] bg-white/[0.03] py-2.5 pl-10 pr-3 text-sm text-white outline-none transition-colors placeholder:text-white/25 focus:border-purple-400/40 focus:bg-white/[0.05]"
            />
          </div>

          <div className="flex flex-wrap gap-1.5">
            {FILTERS.map((filter) => (
              <button
                key={filter.id}
                onClick={() => setCapability(filter.id)}
                className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-all ${
                  capability === filter.id
                    ? 'bg-gradient-to-r from-purple-500 to-fuchsia-500 text-white shadow-lg shadow-purple-500/25'
                    : 'border border-white/[0.08] bg-white/[0.02] text-white/45 hover:border-purple-400/25 hover:text-white/80'
                }`}
              >
                <span className="mr-1">{filter.emoji}</span>
                {filter.label}
              </button>
            ))}
          </div>
        </div>

        <div className="relative flex min-h-0 flex-1 flex-col sm:flex-row">
          {/* Provider rail */}
          {!search && (
            <div className="shrink-0 overflow-x-auto sm:overflow-y-auto border-b sm:border-b-0 sm:border-r border-white/[0.06] sm:w-56">
              <div className="flex gap-1.5 p-3 sm:flex-col">
                {providers.map((provider) => {
                  const isActive = provider.id === activeProvider;
                  return (
                    <button
                      key={provider.id}
                      onClick={() => setActiveProvider(provider.id)}
                      className={`flex shrink-0 items-center gap-2 rounded-xl px-3 py-2 text-left text-xs font-semibold whitespace-nowrap transition-all sm:w-full ${
                        isActive
                          ? 'bg-purple-500/15 text-white ring-1 ring-purple-400/30'
                          : 'text-white/45 hover:bg-white/[0.03] hover:text-white/80'
                      }`}
                    >
                      {provider.logo ? (
                        <img
                          src={provider.logo}
                          alt=""
                          className="h-4 w-4 shrink-0"
                          style={{ filter: 'brightness(0) invert(1)', opacity: isActive ? 1 : 0.55 }}
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.visibility = 'hidden';
                          }}
                        />
                      ) : (
                        <span
                          className="h-2.5 w-2.5 shrink-0 rounded-full"
                          style={{ backgroundColor: provider.color }}
                        />
                      )}
                      <span className="flex-1 truncate">{provider.name}</span>
                      <span className="text-[10px] font-normal text-white/25">{provider.models.length}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Model list */}
          <div className="min-h-0 flex-1 overflow-y-auto p-3">
            {results.length === 0 ? (
              <div className="flex h-full min-h-[180px] flex-col items-center justify-center gap-2 text-center">
                <Sparkles className="h-6 w-6 text-purple-400/50" />
                <p className="text-sm text-white/40">
                  {search ? `No models match “${search}”` : 'No models for this filter'}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-1.5">
                {results.map((model) => {
                  const isSelected = model.id === selectedModel;
                  const provider = providers.find((p) => p.id === model.provider);
                  const context = formatContext(model.contextWindow);

                  return (
                    <button
                      key={model.id}
                      onClick={() => handleSelect(model.id)}
                      className={`group flex items-center gap-3 rounded-2xl px-3.5 py-3 text-left transition-all ${
                        isSelected
                          ? 'bg-gradient-to-r from-purple-500/20 to-fuchsia-500/10 ring-1 ring-purple-400/40'
                          : 'border border-transparent hover:bg-white/[0.03] hover:ring-1 hover:ring-white/[0.08]'
                      }`}
                    >
                      <span
                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl"
                        style={{ backgroundColor: `${provider?.color ?? '#a78bfa'}22` }}
                      >
                        {provider?.logo ? (
                          <img
                            src={provider.logo}
                            alt=""
                            className="h-4 w-4"
                            style={{ filter: 'brightness(0) invert(1)' }}
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.visibility = 'hidden';
                            }}
                          />
                        ) : (
                          <span className="text-[11px] font-bold text-white/70">
                            {(provider?.name ?? model.provider).slice(0, 2).toUpperCase()}
                          </span>
                        )}
                      </span>

                      <span className="min-w-0 flex-1">
                        <span
                          className={`block truncate text-sm font-semibold ${
                            isSelected ? 'text-purple-200' : 'text-white/85'
                          }`}
                        >
                          {model.name}
                        </span>
                        <span className="mt-0.5 flex items-center gap-1.5 text-[11px] text-white/30">
                          <span className="truncate font-mono">{model.id}</span>
                          {context && <span className="shrink-0 text-purple-300/50">· {context}</span>}
                        </span>
                      </span>

                      <span className="hidden shrink-0 gap-1 sm:flex">
                        {model.capabilities.slice(0, 4).map((cap) => (
                          <span
                            key={cap}
                            className="rounded-md bg-white/[0.05] px-1.5 py-0.5 text-[10px]"
                            title={CAPABILITY_LABELS[cap]?.description}
                          >
                            {CAPABILITY_LABELS[cap]?.icon}
                          </span>
                        ))}
                      </span>

                      {isSelected && <Check className="h-4 w-4 shrink-0 text-purple-300" />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="relative border-t border-white/[0.06] px-6 py-3 text-[11px] text-white/25">
          {results.length} shown · powered by puter.js · free, no API key
        </div>
      </div>
    </div>
  );
}