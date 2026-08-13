// Signal Noir design reminder: preferences are part of the broadcast console—visible, persistent, and respectful of user control.
import { createContext, useContext, useEffect, useMemo, useState } from "react";

export type Language = "en" | "ru";
type Preferences = { language: Language; largeText: boolean; highContrast: boolean; reducedMotion: boolean; focusMode: boolean; setLanguage: (language: Language) => void; toggle: (key: "largeText" | "highContrast" | "reducedMotion" | "focusMode") => void; };
const PreferencesContext = createContext<Preferences | null>(null);

export function PreferencesProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => (localStorage.getItem("foxy-language") as Language) || "en");
  const [largeText, setLargeText] = useState(() => localStorage.getItem("foxy-large-text") === "true");
  const [highContrast, setHighContrast] = useState(() => localStorage.getItem("foxy-high-contrast") === "true");
  const [reducedMotion, setReducedMotion] = useState(() => localStorage.getItem("foxy-reduced-motion") === "true");
  const [focusMode, setFocusMode] = useState(() => localStorage.getItem("foxy-focus-mode") === "true");
  const setLanguage = (next: Language) => { setLanguageState(next); localStorage.setItem("foxy-language", next); };
  const toggle = (key: "largeText" | "highContrast" | "reducedMotion" | "focusMode") => { const setters = { largeText: setLargeText, highContrast: setHighContrast, reducedMotion: setReducedMotion, focusMode: setFocusMode }; const values = { largeText, highContrast, reducedMotion, focusMode }; const next = !values[key]; setters[key](next); localStorage.setItem(`foxy-${key.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`)}`, String(next)); };
  useEffect(() => { document.documentElement.lang = language; document.documentElement.classList.toggle("large-text", largeText); document.documentElement.classList.toggle("high-contrast", highContrast); document.documentElement.classList.toggle("focus-mode", focusMode); document.documentElement.classList.toggle("reduced-motion", reducedMotion); }, [language, largeText, highContrast, focusMode, reducedMotion]);
  const value = useMemo(() => ({ language, largeText, highContrast, reducedMotion, focusMode, setLanguage, toggle }), [language, largeText, highContrast, reducedMotion, focusMode]);
  return <PreferencesContext.Provider value={value}>{children}</PreferencesContext.Provider>;
}
export function usePreferences() { const context = useContext(PreferencesContext); if (!context) throw new Error("usePreferences must be used inside PreferencesProvider"); return context; }
