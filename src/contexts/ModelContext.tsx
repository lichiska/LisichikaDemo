import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import {
  DEFAULT_MODEL,
  IMAGE_MODEL_OPTIONS,
  PROVIDERS as BUILTIN_PROVIDERS,
  buildProvidersFromRaw,
  mergeImageModelOptions,
  type MediaModelOption,
  type ModelInfo,
  type ProviderInfo,
} from '@/lib/models';
import { fetchPuterModels, loadPuter } from '@/lib/puter-ai';

const SYSTEM_PROMPT_DEFAULT =
  'You are Lisichka — a wise and whimsical fox spirit AI companion. You are intelligent, concise, and carry the warmth and mystique of a kitsune. Reply thoughtfully. When writing code use proper markdown code fences with the language name.';

export type PuterStatus = 'loading' | 'ready' | 'error';

export interface ModelSettings {
  /* Selection + generation parameters */
  selectedModel: string;
  setSelectedModel: (id: string) => void;
  temperature: number;
  setTemperature: (v: number) => void;
  maxTokens: number;
  setMaxTokens: (v: number) => void;
  systemPrompt: string;
  setSystemPrompt: (v: string) => void;
  showReasoning: boolean;
  setShowReasoning: (v: boolean) => void;
  darkMode: boolean;
  setDarkMode: (v: boolean) => void;

  /* Live puter.js catalog */
  providers: ProviderInfo[];
  allModels: ModelInfo[];
  totalModels: number;
  imageModelOptions: MediaModelOption[];
  catalogSource: 'live' | 'builtin';
  catalogLoading: boolean;
  findModel: (id: string) => ModelInfo | undefined;
  findProvider: (id: string) => ProviderInfo | undefined;

  /* SDK status */
  puterStatus: PuterStatus;
  puterError: string | null;
  setPuterError: (message: string | null) => void;
  retryPuter: () => void;
}

const ModelContext = createContext<ModelSettings | null>(null);

function ls(key: string, fallback: string): string {
  try {
    return localStorage.getItem(key) ?? fallback;
  } catch {
    return fallback;
  }
}

/** Last path segment of a model id, used to match built-in ids against live ones. */
function modelTail(id: string): string {
  return (id.includes('/') ? id.slice(id.lastIndexOf('/') + 1) : id).toLowerCase();
}

export function ModelProvider({ children }: { children: ReactNode }) {
  const [selectedModel, _setModel] = useState(() => ls('lisichka_model', DEFAULT_MODEL));
  const [temperature, _setTemp] = useState(() => parseFloat(ls('lisichka_temp', '0.7')));
  const [maxTokens, _setMax] = useState(() => parseInt(ls('lisichka_maxtokens', '4000'), 10));
  const [systemPrompt, _setSys] = useState(() => ls('lisichka_systemprompt', SYSTEM_PROMPT_DEFAULT));
  const [showReasoning, _setReas] = useState(() => ls('lisichka_reasoning', 'false') === 'true');
  const [darkMode, _setDark] = useState(() => ls('lisichka_darkmode', 'true') === 'true');

  const [liveProviders, setLiveProviders] = useState<ProviderInfo[] | null>(null);
  const [catalogLoading, setCatalogLoading] = useState(true);
  const [puterStatus, setPuterStatus] = useState<PuterStatus>('loading');
  const [puterError, setPuterError] = useState<string | null>(null);
  const [reloadToken, setReloadToken] = useState(0);

  const persist = (key: string, v: string) => {
    try {
      localStorage.setItem(key, v);
    } catch {
      /* noop */
    }
  };

  const setSelectedModel = useCallback((id: string) => {
    _setModel(id);
    persist('lisichka_model', id);
  }, []);
  const setTemperature = (v: number) => {
    _setTemp(v);
    persist('lisichka_temp', String(v));
  };
  const setMaxTokens = (v: number) => {
    _setMax(v);
    persist('lisichka_maxtokens', String(v));
  };
  const setSystemPrompt = (v: string) => {
    _setSys(v);
    persist('lisichka_systemprompt', v);
  };
  const setShowReasoning = (v: boolean) => {
    _setReas(v);
    persist('lisichka_reasoning', String(v));
  };
  const setDarkMode = (v: boolean) => {
    _setDark(v);
    persist('lisichka_darkmode', String(v));
    document.documentElement.classList.toggle('dark', v);
  };

  const retryPuter = useCallback(() => {
    setPuterError(null);
    setPuterStatus('loading');
    setCatalogLoading(true);
    setReloadToken((t) => t + 1);
  }, []);

  // Load the SDK, then pull the full live model catalog.
  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const ai = await loadPuter();
        if (cancelled) return;
        setPuterStatus('ready');
        setPuterError(null);

        try {
          const raw = await fetchPuterModels(ai);
          if (cancelled) return;
          const built = buildProvidersFromRaw(raw);
          const count = built.reduce((sum, p) => sum + p.models.length, 0);
          setLiveProviders(count > 0 ? built : null);
        } catch (catalogError) {
          // The chat still works — we just fall back to the bundled catalog.
          console.warn('Could not load the live puter.js model list:', catalogError);
          if (!cancelled) setLiveProviders(null);
        }
      } catch (error) {
        if (cancelled) return;
        setPuterStatus('error');
        setPuterError(error instanceof Error ? error.message : 'puter.js failed to load.');
      } finally {
        if (!cancelled) setCatalogLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [reloadToken]);

  const providers = liveProviders ?? BUILTIN_PROVIDERS;
  const catalogSource: 'live' | 'builtin' = liveProviders ? 'live' : 'builtin';

  const allModels = useMemo(() => providers.flatMap((p) => p.models), [providers]);
  const totalModels = allModels.length;

  const modelIndex = useMemo(() => {
    const byId = new Map<string, ModelInfo>();
    const byTail = new Map<string, ModelInfo>();
    for (const model of allModels) {
      byId.set(model.id, model);
      const tail = modelTail(model.id);
      if (!byTail.has(tail)) byTail.set(tail, model);
    }
    return { byId, byTail };
  }, [allModels]);

  const findModel = useCallback(
    (id: string) => modelIndex.byId.get(id) ?? modelIndex.byTail.get(modelTail(id)),
    [modelIndex]
  );

  const findProvider = useCallback(
    (id: string) => {
      const model = findModel(id);
      if (!model) return undefined;
      return providers.find((p) => p.id === model.provider);
    },
    [findModel, providers]
  );

  // When the live catalog uses different ids, migrate the stored selection.
  useEffect(() => {
    if (!liveProviders || modelIndex.byId.has(selectedModel)) return;
    const matched = modelIndex.byTail.get(modelTail(selectedModel));
    if (matched) setSelectedModel(matched.id);
  }, [liveProviders, modelIndex, selectedModel, setSelectedModel]);

  const imageModelOptions = useMemo(
    () => (liveProviders ? mergeImageModelOptions(liveProviders) : IMAGE_MODEL_OPTIONS),
    [liveProviders]
  );

  return (
    <ModelContext.Provider
      value={{
        selectedModel,
        setSelectedModel,
        temperature,
        setTemperature,
        maxTokens,
        setMaxTokens,
        systemPrompt,
        setSystemPrompt,
        showReasoning,
        setShowReasoning,
        darkMode,
        setDarkMode,
        providers,
        allModels,
        totalModels,
        imageModelOptions,
        catalogSource,
        catalogLoading,
        findModel,
        findProvider,
        puterStatus,
        puterError,
        setPuterError,
        retryPuter,
      }}
    >
      {children}
    </ModelContext.Provider>
  );
}

export function useModel(): ModelSettings {
  const ctx = useContext(ModelContext);
  if (!ctx) throw new Error('useModel must be inside ModelProvider');
  return ctx;
}