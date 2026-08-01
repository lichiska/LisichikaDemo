/* eslint-disable @typescript-eslint/no-explicit-any */
// puter.js type declarations for AI functionality

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
  img2txt: (
    image: string | File,
    options?: { model?: string }
  ) => Promise<string>;
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
 * puter.js from the CDN auto-initializes on load, so we just check window.puter.ai.
 */
export function getPuterAI(): PuterAI | null {
  if (typeof window !== 'undefined' && window.puter?.ai) {
    return window.puter.ai;
  }
  return null;
}

/**
 * Wait for puter.js to be ready (polls until window.puter.ai is available).
 * Times out after 10 seconds.
 */
export function waitForPuter(): Promise<PuterAI> {
  return new Promise((resolve, reject) => {
    // Already available
    if (window.puter?.ai) {
      resolve(window.puter.ai);
      return;
    }

    let elapsed = 0;
    const interval = setInterval(() => {
      elapsed += 100;
      if (window.puter?.ai) {
        clearInterval(interval);
        resolve(window.puter.ai);
      } else if (elapsed >= 10000) {
        clearInterval(interval);
        reject(new Error('puter.js failed to load. Please refresh the page.'));
      }
    }, 100);
  });
}