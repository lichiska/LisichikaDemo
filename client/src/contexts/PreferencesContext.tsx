import { createContext, useContext, useEffect, useMemo, useState } from "react";

export type Language = "en" | "ru";
export type Theme = "noir" | "paper" | "ember";
export type AiProvider = "puter";
export type ExportFormat = "json" | "markdown" | "srt";
type ToggleKey = "largeText" | "highContrast" | "reducedMotion" | "focusMode";
type Preferences = {
  language: Language;
  theme: Theme;
  provider: AiProvider;
  model: string;
  privacyMode: boolean;
  persistToCloud: boolean;
  exportFormat: ExportFormat;
  largeText: boolean;
  highContrast: boolean;
  reducedMotion: boolean;
  focusMode: boolean;
  setLanguage: (language: Language) => void;
  setTheme: (theme: Theme) => void;
  setProvider: (provider: AiProvider) => void;
  setModel: (model: string) => void;
  setPrivacyMode: (value: boolean) => void;
  setPersistToCloud: (value: boolean) => void;
  setExportFormat: (format: ExportFormat) => void;
  toggle: (key: ToggleKey) => void;
};
const PreferencesContext = createContext<Preferences | null>(null);
const storedBoolean = (key: string, fallback: boolean) => localStorage.getItem(key) === null ? fallback : localStorage.getItem(key) === "true";

export function PreferencesProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => (localStorage.getItem("foxy-language") as Language) || "en");
  const [theme, setThemeState] = useState<Theme>(() => (localStorage.getItem("foxy-theme") as Theme) || "noir");
  const [provider, setProviderState] = useState<AiProvider>(() => (localStorage.getItem("foxy-ai-provider") as AiProvider) || "puter");
  const [model, setModelState] = useState(() => localStorage.getItem("foxy-ai-model") || "gpt-5.4-nano");
  const [privacyMode, setPrivacyModeState] = useState(() => storedBoolean("foxy-privacy-mode", true));
  const [persistToCloud, setPersistToCloudState] = useState(() => storedBoolean("foxy-persist-cloud", true));
  const [exportFormat, setExportFormatState] = useState<ExportFormat>(() => (localStorage.getItem("foxy-export-format") as ExportFormat) || "json");
  const [largeText, setLargeText] = useState(() => storedBoolean("foxy-large-text", false));
  const [highContrast, setHighContrast] = useState(() => storedBoolean("foxy-high-contrast", false));
  const [reducedMotion, setReducedMotion] = useState(() => storedBoolean("foxy-reduced-motion", false));
  const [focusMode, setFocusMode] = useState(() => storedBoolean("foxy-focus-mode", false));
  const setLanguage = (next: Language) => { setLanguageState(next); localStorage.setItem("foxy-language", next); };
  const setTheme = (next: Theme) => { setThemeState(next); localStorage.setItem("foxy-theme", next); };
  const setProvider = (next: AiProvider) => { setProviderState(next); localStorage.setItem("foxy-ai-provider", next); };
  const setModel = (next: string) => { setModelState(next); localStorage.setItem("foxy-ai-model", next); };
  const setPrivacyMode = (next: boolean) => { setPrivacyModeState(next); localStorage.setItem("foxy-privacy-mode", String(next)); };
  const setPersistToCloud = (next: boolean) => { setPersistToCloudState(next); localStorage.setItem("foxy-persist-cloud", String(next)); };
  const setExportFormat = (next: ExportFormat) => { setExportFormatState(next); localStorage.setItem("foxy-export-format", next); };
  const toggle = (key: ToggleKey) => { const setters = { largeText: setLargeText, highContrast: setHighContrast, reducedMotion: setReducedMotion, focusMode: setFocusMode }; const values = { largeText, highContrast, reducedMotion, focusMode }; const next = !values[key]; setters[key](next); localStorage.setItem(`foxy-${key.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`)}`, String(next)); };
  useEffect(() => { document.documentElement.lang = language; document.documentElement.dataset.theme = theme; document.documentElement.dataset.aiProvider = provider; document.documentElement.dataset.aiModel = model; document.documentElement.classList.toggle("large-text", largeText); document.documentElement.classList.toggle("high-contrast", highContrast); document.documentElement.classList.toggle("focus-mode", focusMode); document.documentElement.classList.toggle("reduced-motion", reducedMotion); }, [language, theme, provider, model, largeText, highContrast, focusMode, reducedMotion]);
  const value = useMemo(() => ({ language, theme, provider, model, privacyMode, persistToCloud, exportFormat, largeText, highContrast, reducedMotion, focusMode, setLanguage, setTheme, setProvider, setModel, setPrivacyMode, setPersistToCloud, setExportFormat, toggle }), [language, theme, provider, model, privacyMode, persistToCloud, exportFormat, largeText, highContrast, reducedMotion, focusMode]);
  return <PreferencesContext.Provider value={value}>{children}</PreferencesContext.Provider>;
}
export function usePreferences() { const context = useContext(PreferencesContext); if (!context) throw new Error("usePreferences must be used inside PreferencesProvider"); return context; }
