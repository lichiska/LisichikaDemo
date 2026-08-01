import { createContext, useContext, useState, type ReactNode } from 'react';
import { DEFAULT_MODEL } from '@/lib/models';

const SYSTEM_PROMPT_DEFAULT =
  'You are Lisichka — a wise and whimsical fox spirit AI companion. You are intelligent, concise, and carry the warmth and mystique of a kitsune. Reply thoughtfully. When writing code use proper markdown code fences with the language name.';

export interface ModelSettings {
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
}

const ModelContext = createContext<ModelSettings | null>(null);

function ls(key: string, fallback: string): string {
  try { return localStorage.getItem(key) ?? fallback; } catch { return fallback; }
}

export function ModelProvider({ children }: { children: ReactNode }) {
  const [selectedModel, _setModel] = useState(() => ls('lisichka_model', DEFAULT_MODEL));
  const [temperature, _setTemp] = useState(() => parseFloat(ls('lisichka_temp', '0.7')));
  const [maxTokens, _setMax] = useState(() => parseInt(ls('lisichka_maxtokens', '4000'), 10));
  const [systemPrompt, _setSys] = useState(() => ls('lisichka_systemprompt', SYSTEM_PROMPT_DEFAULT));
  const [showReasoning, _setReas] = useState(() => ls('lisichka_reasoning', 'false') === 'true');
  const [darkMode, _setDark] = useState(() => ls('lisichka_darkmode', 'true') === 'true');

  const persist = (key: string, v: string) => { try { localStorage.setItem(key, v); } catch { /* noop */ } };

  const setSelectedModel = (id: string) => { _setModel(id); persist('lisichka_model', id); };
  const setTemperature = (v: number) => { _setTemp(v); persist('lisichka_temp', String(v)); };
  const setMaxTokens = (v: number) => { _setMax(v); persist('lisichka_maxtokens', String(v)); };
  const setSystemPrompt = (v: string) => { _setSys(v); persist('lisichka_systemprompt', v); };
  const setShowReasoning = (v: boolean) => { _setReas(v); persist('lisichka_reasoning', String(v)); };
  const setDarkMode = (v: boolean) => {
    _setDark(v);
    persist('lisichka_darkmode', String(v));
    document.documentElement.classList.toggle('dark', v);
  };

  return (
    <ModelContext.Provider
      value={{ selectedModel, setSelectedModel, temperature, setTemperature, maxTokens, setMaxTokens, systemPrompt, setSystemPrompt, showReasoning, setShowReasoning, darkMode, setDarkMode }}
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