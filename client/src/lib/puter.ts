export type PuterChatResponse = {
  message?: { content?: string };
  text?: string;
  content?: string;
  choices?: Array<{ message?: { content?: string }; text?: string }>;
};

export type PuterAI = {
  chat: (promptOrMessages: unknown, options?: Record<string, unknown>) => Promise<PuterChatResponse | string | AsyncIterable<unknown>>;
  listModels?: (provider?: string | null) => Promise<Array<Record<string, unknown>>>;
  listModelProviders?: () => Promise<Array<Record<string, unknown>> | string[]>;
  txt2img: (promptOrOptions: unknown, testModeOrOptions?: boolean | Record<string, unknown>) => Promise<HTMLImageElement>;
  img2txt: (image: string | File) => Promise<unknown>;
  txt2speech: (text: string, options?: Record<string, unknown>) => Promise<HTMLAudioElement>;
  txt2vid: (prompt: string, testMode?: boolean, options?: Record<string, unknown>) => Promise<HTMLVideoElement>;
  speech2txt: (audio: string | File, options?: Record<string, unknown>) => Promise<{ text?: string } | string>;
  speech2speech?: (audio: string | File, options?: Record<string, unknown>) => Promise<HTMLAudioElement>;
};

type PuterWindow = Window & { puter?: { ai?: PuterAI } };

export function getPuterAI() {
  return (window as PuterWindow).puter?.ai;
}

export function isPuterReady() {
  return Boolean(getPuterAI());
}

export function extractChatText(value: unknown) {
  if (typeof value === "string") return value;
  const response = value as PuterChatResponse;
  return response?.message?.content || response?.content || response?.text || response?.choices?.[0]?.message?.content || response?.choices?.[0]?.text || JSON.stringify(value, null, 2);
}

export async function runPuter(kind: string, input: string, options: Record<string, unknown> = {}) {
  const ai = getPuterAI();
  if (!ai) throw new Error("Puter.js has not finished loading. Reload the studio or check the network connection.");
  if (kind === "chat") return ai.chat(input, options);
  if (kind === "image") return ai.txt2img(input, options);
  if (kind === "vision") return ai.img2txt(input);
  if (kind === "speech") return ai.txt2speech(input, options);
  if (kind === "video") return ai.txt2vid(input, false, options);
  if (kind === "transcribe") return ai.speech2txt(input, options);
  throw new Error(`Unsupported Puter capability: ${kind}`);
}
