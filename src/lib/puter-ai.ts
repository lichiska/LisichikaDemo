/* eslint-disable @typescript-eslint/no-explicit-any */
// puter.js loader + type declarations for AI functionality.
//
// The SDK is loaded from the CDN in index.html. This module additionally
// self-heals: if the tag is missing (or was blocked on first paint) it injects
// the script itself, then polls until `window.puter.ai` is available.

export const PUTER_SCRIPT_URL = 'https://js.puter.com/v2/';

/** Raw model entry as returned by `puter.ai.listModels()` */
export interface PuterRawModel {
  id: string;
  provider?: string;
  name?: string;
  aliases?: string[];
  context?: number;
  max_tokens?: number;
  cost?: { currency?: string; tokens?: number; input?: number; output?: number };
  [key: string]: unknown;
}

export interface PuterAI {
  chat: (
    messages: any,
    options?: {
      model?: string;
      stream?: boolean;
      temperature?: number;
      max_tokens?: number;
      tools?: any[];
    }
  ) => Promise<any>;
  txt2img: (
    prompt: string,
    options?: {
      model?: string;
      width?: number;
      height?: number;
    }
  ) => Promise<HTMLImageElement>;
  txt2speech: (
    text: string,
    options?: {
      model?: string;
      voice?: string;
    }
  ) => Promise<Blob>;
  img2txt: (image: string | File, options?: { model?: string }) => Promise<string>;
  txt2vid?: (options: Record<string, unknown>) => Promise<unknown>;
  listModels?: (provider?: string) => Promise<unknown>;
  listModelProviders?: () => Promise<unknown>;
}

export interface Puter {
  ai: PuterAI;
  print: (...args: any[]) => void;
}

declare global {
  interface Window {
    puter: Puter;
  }
}

/**
 * Get the puter.ai object. Returns null if puter.js hasn't loaded yet.
 */
export function getPuterAI(): PuterAI | null {
  if (typeof window !== 'undefined' && window.puter?.ai) {
    return window.puter.ai;
  }
  return null;
}

let scriptFailed = false;
let pendingLoad: Promise<PuterAI> | null = null;

/** Inject the SDK script if no tag is present in the document. */
function ensureScript(): void {
  if (typeof document === 'undefined') return;

  const existing =
    document.querySelector<HTMLScriptElement>('script[data-puter-sdk]') ??
    document.querySelector<HTMLScriptElement>('script[src*="js.puter.com"]');

  if (existing) {
    existing.addEventListener('error', () => {
      scriptFailed = true;
    });
    return;
  }

  const script = document.createElement('script');
  script.src = PUTER_SCRIPT_URL;
  script.async = true;
  script.dataset.puterSdk = 'true';
  script.addEventListener('error', () => {
    scriptFailed = true;
  });
  document.head.appendChild(script);
}

/**
 * Load (or await) the puter.js SDK and resolve with the `ai` namespace.
 * Retries the script injection when a previous attempt failed.
 */
export function loadPuter(timeoutMs = 25000): Promise<PuterAI> {
  if (typeof window === 'undefined') {
    return Promise.reject(new Error('puter.js is only available in the browser.'));
  }
  if (window.puter?.ai) return Promise.resolve(window.puter.ai);
  if (pendingLoad) return pendingLoad;

  scriptFailed = false;

  pendingLoad = new Promise<PuterAI>((resolve, reject) => {
    ensureScript();

    const startedAt = Date.now();
    const timer = window.setInterval(() => {
      if (window.puter?.ai) {
        window.clearInterval(timer);
        resolve(window.puter.ai);
        return;
      }
      const timedOut = Date.now() - startedAt > timeoutMs;
      if (scriptFailed || timedOut) {
        window.clearInterval(timer);
        pendingLoad = null;
        reject(
          new Error(
            scriptFailed
              ? 'Could not load puter.js — the request to js.puter.com was blocked. Disable ad/script blockers for this site and retry.'
              : 'puter.js took too long to load. Check your connection, then retry.'
          )
        );
      }
    }, 120);
  });

  return pendingLoad;
}

/** Backwards-compatible alias used across the app. */
export const waitForPuter = loadPuter;

/** Normalize the many shapes `listModels()` can return into a flat list. */
function normalizeModelList(input: unknown, inheritedProvider?: string): PuterRawModel[] {
  if (!input) return [];

  if (Array.isArray(input)) {
    const out: PuterRawModel[] = [];
    for (const item of input) {
      if (typeof item === 'string' && item.trim()) {
        out.push({ id: item.trim(), provider: inheritedProvider });
      } else if (item && typeof item === 'object') {
        const obj = item as Record<string, unknown>;
        const id = typeof obj.id === 'string' ? obj.id : typeof obj.model === 'string' ? obj.model : '';
        if (!id.trim()) continue;
        out.push({
          ...(obj as PuterRawModel),
          id: id.trim(),
          provider: typeof obj.provider === 'string' ? obj.provider : inheritedProvider,
        });
      }
    }
    return out;
  }

  if (typeof input === 'object') {
    const obj = input as Record<string, unknown>;
    if (Array.isArray(obj.models)) return normalizeModelList(obj.models, inheritedProvider);
    if (Array.isArray(obj.result)) return normalizeModelList(obj.result, inheritedProvider);
    if (Array.isArray(obj.data)) return normalizeModelList(obj.data, inheritedProvider);

    const out: PuterRawModel[] = [];
    for (const [key, value] of Object.entries(obj)) {
      if (Array.isArray(value)) out.push(...normalizeModelList(value, key));
    }
    return out;
  }

  return [];
}

/** Fetch the complete live model catalog exposed by puter.js. */
export async function fetchPuterModels(ai: PuterAI): Promise<PuterRawModel[]> {
  if (typeof ai.listModels !== 'function') return [];
  const response = await ai.listModels();
  const models = normalizeModelList(response);

  // De-duplicate by id, keeping the richest entry.
  const byId = new Map<string, PuterRawModel>();
  for (const model of models) {
    const previous = byId.get(model.id);
    if (!previous || Object.keys(model).length > Object.keys(previous).length) {
      byId.set(model.id, model);
    }
  }
  return Array.from(byId.values());
}