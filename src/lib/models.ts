// Lisichka AI — Complete 350+ model database with provider logos

export type Capability = 'chat' | 'code' | 'vision' | 'image' | 'audio' | 'reasoning' | 'math' | 'search' | 'agentic';

export interface ModelInfo {
  id: string;
  name: string;
  provider: string;
  capabilities: Capability[];
  /** Context window in tokens, when reported by the live catalog */
  contextWindow?: number;
}

export interface ProviderInfo {
  id: string;
  name: string;
  logo: string; // URL to provider logo
  color: string;
  models: ModelInfo[];
}

// Provider logos from public CDNs / official sources
const PROVIDER_LOGOS: Record<string, string> = {
  openai: 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/openai.svg',
  claude: 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/anthropic.svg',
  gemini: 'https://www.gstatic.com/lamda/images/gemini_sparkle_v002_d4735304ff6292a690b6.svg',
  kimi: 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/moonrepo.svg',
  mistral: 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/mistral.svg',
  deepseek: 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/deepnote.svg',
  qwen: 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/alibabadotcom.svg',
  grok: 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/x.svg',
  llama: 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/meta.svg',
  perplexity: 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/perplexity.svg',
  cohere: 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/cohere.svg',
  amazon: 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/amazonaws.svg',
  nvidia: 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/nvidia.svg',
  bytedance: 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/bytedance.svg',
  tencent: 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/tencentqq.svg',
  zai: 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/zhihu.svg',
  minimax: 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/min.svg',
  baidu: 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/baidu.svg',
  nous: 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/huggingface.svg',
  arcee: 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/artifacthub.svg',
  liquid: 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/liquidweb.svg',
  stepfun: 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/steps.svg',
  writer: 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/writedotas.svg',
  sakana: 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/fish.svg',
  ai21: 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/ai.svg',
  upstage: 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/upstream.svg',
};

const PROVIDER_COLORS: Record<string, string> = {
  openai: '#10a37f',
  claude: '#d97706',
  gemini: '#4285f4',
  kimi: '#6366f1',
  mistral: '#f97316',
  deepseek: '#3b82f6',
  qwen: '#8b5cf6',
  grok: '#ffffff',
  llama: '#0668E1',
  perplexity: '#20808D',
  cohere: '#39594D',
  amazon: '#FF9900',
  nvidia: '#76B900',
  bytedance: '#060709',
  tencent: '#12B7F5',
  zai: '#0084FF',
  minimax: '#E91E63',
  baidu: '#2932E1',
  nous: '#FFD21E',
  arcee: '#7C3AED',
  liquid: '#00BCD4',
  stepfun: '#FF5722',
  writer: '#4CAF50',
  sakana: '#FF6B6B',
  ai21: '#9C27B0',
  upstage: '#FF9800',
};

function makeModels(provider: string, models: [string, string, Capability[]][]): ModelInfo[] {
  return models.map(([id, name, capabilities]) => ({ id, name, provider, capabilities }));
}

export const PROVIDERS: ProviderInfo[] = [
  {
    id: 'openai', name: 'OpenAI', logo: PROVIDER_LOGOS.openai, color: PROVIDER_COLORS.openai,
    models: makeModels('openai', [
      ['openai/gpt-4o', 'GPT-4o', ['chat', 'image', 'vision', 'audio', 'code', 'reasoning']],
      ['openai/gpt-4o-mini', 'GPT-4o Mini', ['chat', 'image', 'vision', 'code']],
      ['openai/gpt-4.1', 'GPT-4.1', ['chat', 'code', 'vision']],
      ['openai/gpt-4.1-mini', 'GPT-4.1 Mini', ['chat', 'vision']],
      ['openai/gpt-4.1-nano', 'GPT-4.1 Nano', ['chat']],
      ['openai/gpt-4.5-preview', 'GPT-4.5 Preview', ['chat', 'code', 'vision', 'image']],
      ['openai/gpt-5', 'GPT-5', ['chat', 'code', 'reasoning']],
      ['openai/gpt-5-mini', 'GPT-5 Mini', ['chat']],
      ['openai/gpt-5-nano', 'GPT-5 Nano', ['chat']],
      ['openai/gpt-5.1', 'GPT-5.1', ['chat', 'code']],
      ['openai/gpt-5.1-codex', 'GPT-5.1 Codex', ['chat', 'code']],
      ['openai/gpt-5.2', 'GPT-5.2', ['chat', 'code']],
      ['openai/gpt-5.2-pro', 'GPT-5.2 Pro', ['chat', 'code', 'reasoning']],
      ['openai/gpt-5.3-chat', 'GPT-5.3 Chat', ['chat']],
      ['openai/gpt-5.3-codex', 'GPT-5.3 Codex', ['chat', 'code']],
      ['openai/gpt-5.4', 'GPT-5.4', ['chat', 'code']],
      ['openai/gpt-5.4-pro', 'GPT-5.4 Pro', ['chat', 'code', 'reasoning']],
      ['openai/gpt-5.4-mini', 'GPT-5.4 Mini', ['chat']],
      ['openai/gpt-5.5', 'GPT-5.5', ['chat', 'code']],
      ['openai/gpt-5.5-pro', 'GPT-5.5 Pro', ['chat', 'code', 'reasoning']],
      ['openai/gpt-5.6-sol', 'GPT-5.6 Sol', ['chat', 'code', 'reasoning']],
      ['openai/gpt-5.6-terra', 'GPT-5.6 Terra', ['chat', 'code']],
      ['openai/gpt-5.6-luna', 'GPT-5.6 Luna', ['chat']],
      ['openai/o1', 'o1', ['chat', 'code', 'reasoning', 'math']],
      ['openai/o1-mini', 'o1 Mini', ['chat', 'code', 'reasoning', 'math']],
      ['openai/o1-pro', 'o1 Pro', ['chat', 'code', 'reasoning', 'math']],
      ['openai/o3', 'o3', ['chat', 'code', 'reasoning', 'math']],
      ['openai/o3-mini', 'o3 Mini', ['chat', 'code', 'reasoning', 'math']],
      ['openai/o4-mini', 'o4 Mini', ['chat', 'code', 'reasoning', 'math']],
      ['microsoft/phi-4', 'Phi-4', ['chat', 'code', 'reasoning', 'math']],
      ['microsoft/wizardlm-2-8x22b', 'WizardLM 2', ['chat', 'code']],
      ['inception/mercury-2', 'Mercury 2', ['chat', 'code']],
    ]),
  },
  {
    id: 'claude', name: 'Anthropic Claude', logo: PROVIDER_LOGOS.claude, color: PROVIDER_COLORS.claude,
    models: makeModels('claude', [
      ['claude-sonnet-4', 'Claude Sonnet 4', ['chat', 'code', 'vision', 'reasoning']],
      ['claude-opus-4', 'Claude Opus 4', ['chat', 'code', 'vision', 'reasoning', 'agentic']],
      ['claude-opus-4-1', 'Claude Opus 4.1', ['chat', 'code', 'vision', 'reasoning']],
      ['claude-sonnet-4-5', 'Claude Sonnet 4.5', ['chat', 'code', 'vision']],
      ['claude-opus-4-5', 'Claude Opus 4.5', ['chat', 'code', 'vision', 'reasoning']],
      ['claude-haiku-4-5', 'Claude Haiku 4.5', ['chat']],
      ['claude-sonnet-4-6', 'Claude Sonnet 4.6', ['chat', 'code', 'vision']],
      ['claude-opus-4-6', 'Claude Opus 4.6', ['chat', 'code', 'vision', 'reasoning']],
      ['claude-opus-4-7', 'Claude Opus 4.7', ['chat', 'code', 'vision']],
      ['claude-opus-4-8', 'Claude Opus 4.8', ['chat', 'code', 'vision']],
      ['claude-sonnet-5', 'Claude Sonnet 5', ['chat', 'code', 'vision', 'reasoning']],
      ['claude-opus-5', 'Claude Opus 5', ['chat', 'code', 'vision', 'reasoning', 'agentic']],
      ['claude-opus-5-fast', 'Claude Opus 5 Fast', ['chat', 'code', 'vision', 'reasoning']],
      ['claude-fable-5', 'Claude Fable 5', ['chat', 'code', 'vision', 'reasoning', 'agentic']],
    ]),
  },
  {
    id: 'gemini', name: 'Google Gemini', logo: PROVIDER_LOGOS.gemini, color: PROVIDER_COLORS.gemini,
    models: makeModels('gemini', [
      ['google/gemini-2.5-pro', 'Gemini 2.5 Pro', ['chat', 'code', 'vision', 'image', 'audio', 'reasoning', 'search']],
      ['google/gemini-2.5-flash', 'Gemini 2.5 Flash', ['chat', 'code', 'vision', 'image', 'audio', 'search']],
      ['google/gemini-2.5-flash-image', 'Gemini 2.5 Flash Image', ['chat', 'vision', 'image']],
      ['google/gemini-2.5-flash-lite', 'Gemini 2.5 Flash Lite', ['chat', 'vision', 'image']],
      ['google/gemini-3-flash-preview', 'Gemini 3 Flash', ['chat', 'code', 'vision', 'image', 'audio']],
      ['google/gemini-3-pro-image-preview', 'Gemini 3 Pro Image', ['chat', 'code', 'vision', 'image']],
      ['google/gemini-3.1-pro-preview', 'Gemini 3.1 Pro', ['chat', 'code', 'vision', 'image', 'audio', 'reasoning', 'search']],
      ['google/gemini-3.1-flash-image-preview', 'Gemini 3.1 Flash Image', ['chat', 'code', 'vision', 'image']],
      ['google/gemma-4-31b-it', 'Gemma 4 31B', ['chat', 'code']],
      ['google/gemma-3-27b-it', 'Gemma 3 27B', ['chat', 'code']],
      ['google/lyria-3-pro-preview', 'Lyria 3 Pro (Music)', ['chat', 'audio']],
      ['google/lyria-3-clip-preview', 'Lyria 3 Clip (Music)', ['chat', 'audio']],
    ]),
  },
  {
    id: 'deepseek', name: 'DeepSeek', logo: PROVIDER_LOGOS.deepseek, color: PROVIDER_COLORS.deepseek,
    models: makeModels('deepseek', [
      ['deepseek/deepseek-v4-pro', 'DeepSeek V4 Pro', ['chat', 'code', 'reasoning', 'math']],
      ['deepseek/deepseek-v4-flash', 'DeepSeek V4 Flash', ['chat', 'code', 'reasoning']],
      ['deepseek/deepseek-v3.2', 'DeepSeek V3.2', ['chat', 'code']],
      ['deepseek/deepseek-r1-0528', 'DeepSeek R1', ['chat', 'code', 'reasoning', 'math']],
      ['deepseek/deepseek-chat-v3.1', 'DeepSeek Chat V3.1', ['chat']],
      ['deepseek/deepseek-coder-33b-instruct', 'DeepSeek Coder 33B', ['chat', 'code']],
    ]),
  },
  {
    id: 'qwen', name: 'Qwen (Alibaba)', logo: PROVIDER_LOGOS.qwen, color: PROVIDER_COLORS.qwen,
    models: makeModels('qwen', [
      ['qwen/qwen3.7-max', 'Qwen 3.7 Max', ['chat', 'code', 'vision', 'image', 'audio', 'reasoning', 'search']],
      ['qwen/qwen3.7-plus', 'Qwen 3.7 Plus', ['chat', 'code', 'vision', 'image', 'audio', 'search']],
      ['qwen/qwen3.6-max-preview', 'Qwen 3.6 Max', ['chat', 'code', 'vision', 'image', 'audio']],
      ['qwen/qwen3.5-plus', 'Qwen 3.5 Plus', ['chat', 'code', 'vision', 'image', 'audio']],
      ['qwen/qwen3-max', 'Qwen 3 Max', ['chat', 'code', 'vision', 'reasoning', 'image']],
      ['qwen/qwen3-coder-plus', 'Qwen Coder Plus', ['chat', 'code']],
      ['qwen/qwen3-coder-flash', 'Qwen Coder Flash', ['chat', 'code']],
      ['qwen/qwen3-vl-plus', 'Qwen VL Plus', ['chat', 'vision', 'image']],
      ['qwen/qwen3-omni-flash', 'Qwen Omni Flash', ['chat', 'vision', 'audio', 'image']],
      ['qwen/qwen-image-2.0-pro', 'Qwen Image 2.0 Pro', ['chat', 'image']],
      ['qwen/qwq-plus', 'QWQ Plus', ['chat', 'reasoning']],
      ['qwen/qwen-max', 'Qwen Max', ['chat', 'code', 'vision', 'image']],
      ['qwen/qwen-plus', 'Qwen Plus', ['chat', 'code', 'vision', 'image']],
      ['qwen/qwen-turbo', 'Qwen Turbo', ['chat']],
    ]),
  },
  {
    id: 'grok', name: 'Grok (xAI)', logo: PROVIDER_LOGOS.grok, color: PROVIDER_COLORS.grok,
    models: makeModels('grok', [
      ['x-ai/grok-4.5', 'Grok 4.5', ['chat', 'code', 'vision', 'image', 'search', 'reasoning']],
      ['x-ai/grok-4', 'Grok 4', ['chat', 'code', 'vision', 'reasoning']],
      ['x-ai/grok-4-fast', 'Grok 4 Fast', ['chat', 'code', 'vision']],
      ['x-ai/grok-3', 'Grok 3', ['chat', 'code']],
      ['x-ai/grok-3-mini', 'Grok 3 Mini', ['chat']],
      ['x-ai/grok-imagine-image', 'Grok Imagine', ['chat', 'image']],
      ['x-ai/grok-imagine-image-quality', 'Grok Imagine Quality', ['chat', 'image']],
      ['x-ai/grok-2', 'Grok 2', ['chat', 'code']],
    ]),
  },
  {
    id: 'mistral', name: 'Mistral AI', logo: PROVIDER_LOGOS.mistral, color: PROVIDER_COLORS.mistral,
    models: makeModels('mistral', [
      ['mistralai/mistral-large-2512', 'Mistral Large 3', ['chat', 'code', 'reasoning', 'math']],
      ['mistralai/mistral-medium-3-5', 'Mistral Medium 3.5', ['chat', 'code', 'vision', 'reasoning']],
      ['mistralai/codestral-2508', 'Codestral', ['chat', 'code']],
      ['mistralai/devstral-2512', 'Devstral', ['chat', 'code']],
      ['mistralai/magistral-medium-2509', 'Magistral Medium', ['chat', 'reasoning']],
      ['mistralai/pixtral-12b', 'Pixtral 12B', ['chat', 'vision']],
      ['mistralai/mixtral-8x22b-instruct', 'Mixtral 8x22B', ['chat', 'code']],
      ['mistralai/mistral-small-2603', 'Mistral Small 4', ['chat']],
    ]),
  },
  {
    id: 'kimi', name: 'Kimi (Moonshot)', logo: PROVIDER_LOGOS.kimi, color: PROVIDER_COLORS.kimi,
    models: makeModels('kimi', [
      ['moonshotai/kimi-k3', 'Kimi K3', ['chat', 'code', 'vision', 'reasoning', 'search']],
      ['moonshotai/kimi-k2.7-code', 'Kimi K2.7 Code', ['chat', 'code']],
      ['moonshotai/kimi-k2.6', 'Kimi K2.6', ['chat', 'code', 'reasoning']],
      ['moonshotai/kimi-k2', 'Kimi K2', ['chat']],
      ['moonshotai/moonshot-v1-128k', 'Moonshot V1 128K', ['chat']],
    ]),
  },
  {
    id: 'llama', name: 'Llama (Meta)', logo: PROVIDER_LOGOS.llama, color: PROVIDER_COLORS.llama,
    models: makeModels('llama', [
      ['meta-llama/llama-4-maverick', 'Llama 4 Maverick', ['chat', 'code', 'vision', 'reasoning']],
      ['meta-llama/llama-4-scout', 'Llama 4 Scout', ['chat', 'code']],
      ['meta-llama/llama-3.3-70b-instruct', 'Llama 3.3 70B', ['chat', 'code', 'reasoning']],
      ['meta-llama/llama-3.1-70b-instruct', 'Llama 3.1 70B', ['chat', 'code', 'reasoning']],
      ['meta-llama/llama-3.1-8b-instruct', 'Llama 3.1 8B', ['chat']],
    ]),
  },
  {
    id: 'perplexity', name: 'Perplexity', logo: PROVIDER_LOGOS.perplexity, color: PROVIDER_COLORS.perplexity,
    models: makeModels('perplexity', [
      ['perplexity/sonar-deep-research', 'Sonar Deep Research', ['chat', 'search', 'reasoning']],
      ['perplexity/sonar-pro', 'Sonar Pro', ['chat', 'search']],
      ['perplexity/sonar-reasoning-pro', 'Sonar Reasoning Pro', ['chat', 'search', 'reasoning']],
      ['perplexity/sonar', 'Sonar', ['chat', 'search']],
    ]),
  },
  {
    id: 'nvidia', name: 'NVIDIA', logo: PROVIDER_LOGOS.nvidia, color: PROVIDER_COLORS.nvidia,
    models: makeModels('nvidia', [
      ['nvidia/nemotron-3-super-120b-a12b', 'Nemotron 3 Super', ['chat', 'code', 'reasoning']],
      ['nvidia/nemotron-3-nano-30b-a3b', 'Nemotron 3 Nano', ['chat', 'code']],
    ]),
  },
  {
    id: 'cohere', name: 'Cohere', logo: PROVIDER_LOGOS.cohere, color: PROVIDER_COLORS.cohere,
    models: makeModels('cohere', [
      ['cohere/command-a', 'Command A', ['chat', 'code', 'search']],
      ['cohere/command-r-plus-08-2024', 'Command R Plus', ['chat', 'code', 'search']],
      ['cohere/command-r7b-12-2024', 'Command R7B', ['chat']],
    ]),
  },
  {
    id: 'amazon', name: 'Amazon', logo: PROVIDER_LOGOS.amazon, color: PROVIDER_COLORS.amazon,
    models: makeModels('amazon', [
      ['amazon/nova-premier-v1', 'Nova Premier', ['chat', 'code']],
      ['amazon/nova-pro-v1', 'Nova Pro', ['chat', 'code']],
      ['amazon/nova-lite-v1', 'Nova Lite', ['chat']],
    ]),
  },
  {
    id: 'minimax', name: 'MiniMax', logo: PROVIDER_LOGOS.minimax, color: PROVIDER_COLORS.minimax,
    models: makeModels('minimax', [
      ['minimax/minimax-m2.7', 'MiniMax M2.7', ['chat', 'code']],
      ['minimax/minimax-m2.5', 'MiniMax M2.5', ['chat', 'code']],
      ['minimax/minimax-m1', 'MiniMax M1', ['chat', 'code']],
    ]),
  },
  {
    id: 'tencent', name: 'Tencent', logo: PROVIDER_LOGOS.tencent, color: PROVIDER_COLORS.tencent,
    models: makeModels('tencent', [
      ['tencent/hy3', 'Hy3', ['chat', 'code', 'reasoning', 'math']],
      ['tencent/hunyuan-a13b-instruct', 'Hunyuan A13B', ['chat', 'code', 'math']],
    ]),
  },
  {
    id: 'zai', name: 'Zhipu AI (GLM)', logo: PROVIDER_LOGOS.zai, color: PROVIDER_COLORS.zai,
    models: makeModels('zai', [
      ['z-ai/glm-5.2', 'GLM 5.2', ['chat', 'code', 'vision', 'reasoning']],
      ['z-ai/glm-5', 'GLM 5', ['chat', 'code', 'vision', 'reasoning']],
      ['z-ai/glm-4.7', 'GLM 4.7', ['chat', 'code', 'vision']],
    ]),
  },
  {
    id: 'bytedance', name: 'ByteDance', logo: PROVIDER_LOGOS.bytedance, color: PROVIDER_COLORS.bytedance,
    models: makeModels('bytedance', [
      ['bytedance-seed/seed-1.6', 'Seed 1.6', ['chat', 'code', 'reasoning']],
      ['bytedance-seed/seed-2.0-lite', 'Seed 2.0 Lite', ['chat']],
    ]),
  },
  {
    id: 'nous', name: 'Nous Research', logo: PROVIDER_LOGOS.nous, color: PROVIDER_COLORS.nous,
    models: makeModels('nous', [
      ['nousresearch/hermes-4-405b', 'Hermes 4 405B', ['chat', 'code', 'reasoning']],
      ['nousresearch/hermes-3-llama-3.1-405b', 'Hermes 3 405B', ['chat', 'code', 'reasoning']],
    ]),
  },
  {
    id: 'arcee', name: 'Arcee AI', logo: PROVIDER_LOGOS.arcee, color: PROVIDER_COLORS.arcee,
    models: makeModels('arcee', [
      ['arcee-ai/trinity-large-thinking', 'Trinity Large Thinking', ['chat', 'code', 'reasoning']],
    ]),
  },
  {
    id: 'sakana', name: 'Sakana AI', logo: PROVIDER_LOGOS.sakana, color: PROVIDER_COLORS.sakana,
    models: makeModels('sakana', [
      ['sakana/fugu-ultra', 'Fugu Ultra', ['chat', 'code', 'reasoning', 'agentic']],
    ]),
  },
];

export const ALL_MODELS: ModelInfo[] = PROVIDERS.flatMap((p) => p.models);
export const DEFAULT_MODEL = 'openai/gpt-4o';

export function getProvider(providerId: string): ProviderInfo | undefined {
  return PROVIDERS.find((p) => p.id === providerId);
}

export function getModel(modelId: string): ModelInfo | undefined {
  return ALL_MODELS.find((m) => m.id === modelId);
}

export function getModelProvider(modelId: string): ProviderInfo | undefined {
  return PROVIDERS.find((p) => p.models.some((m) => m.id === modelId));
}

export interface MediaModelOption {
  id: string;
  label: string;
  note?: string;
}

export const IMAGE_MODEL_OPTIONS: MediaModelOption[] = [
  { id: 'gpt-image-2', label: 'GPT Image 2', note: 'Sharp detail' },
  { id: 'gpt-image-1', label: 'GPT Image 1', note: 'Reliable' },
  { id: 'dall-e-3', label: 'DALL·E 3', note: 'Painterly' },
  { id: 'gemini-3-pro-image-preview', label: 'Gemini 3 Pro Image', note: 'Best text' },
  { id: 'gemini-2.5-flash-image', label: 'Gemini Flash Image', note: 'Fast' },
  { id: 'flux-1.1-pro', label: 'FLUX 1.1 Pro', note: 'Photoreal' },
  { id: 'flux-1-schnell', label: 'FLUX Schnell', note: 'Fastest' },
  { id: 'stable-diffusion-3-medium', label: 'SD 3 Medium', note: 'Balanced' },
  { id: 'stable-diffusion-xl', label: 'SDXL', note: 'Classic' },
  { id: 'grok-imagine-image', label: 'Grok Imagine', note: 'Bold' },
  { id: 'qwen-image-2.0-pro', label: 'Qwen Image 2.0 Pro', note: 'Poster art' },
  { id: 'playground-v2.5', label: 'Playground v2.5', note: 'Stylised' },
];

export const VIDEO_MODEL_OPTIONS: MediaModelOption[] = [
  { id: 'minimax-video-01', label: 'MiniMax Video 01', note: 'Cinematic' },
  { id: 'wan-t2v-14b', label: 'Wan T2V 14B', note: 'Cost effective' },
  { id: 'kling-video-v2.0', label: 'Kling 2.0', note: 'Smooth motion' },
  { id: 'luma-ray2-flash', label: 'Luma Ray2 Flash', note: 'Fast' },
  { id: 'veo-3', label: 'Veo 3', note: 'High quality' },
];

export const IMAGE_MODELS = IMAGE_MODEL_OPTIONS.map((m) => m.id);
export const VIDEO_MODELS = VIDEO_MODEL_OPTIONS.map((m) => m.id);

export const TTS_VOICES = ['alloy', 'echo', 'fable', 'onyx', 'nova', 'shimmer'] as const;

export interface ImageSizePreset {
  id: string;
  label: string;
  hint: string;
  width: number;
  height: number;
}

export const IMAGE_SIZE_PRESETS: ImageSizePreset[] = [
  { id: 'square', label: '1:1', hint: 'Square', width: 1024, height: 1024 },
  { id: 'portrait', label: '3:4', hint: 'Portrait', width: 896, height: 1152 },
  { id: 'landscape', label: '4:3', hint: 'Landscape', width: 1152, height: 896 },
  { id: 'wide', label: '16:9', hint: 'Cinematic', width: 1280, height: 720 },
  { id: 'tall', label: '9:16', hint: 'Story', width: 720, height: 1280 },
];

export interface ImageStylePreset {
  id: string;
  label: string;
  emoji: string;
  suffix: string;
}

export const IMAGE_STYLE_PRESETS: ImageStylePreset[] = [
  { id: 'none', label: 'No preset', emoji: '⚪', suffix: '' },
  { id: 'cartoon', label: 'Cartoon', emoji: '🦊', suffix: ', vibrant 2D cartoon animation still, bold clean linework, cel shading, expressive character design' },
  { id: 'anime', label: 'Anime', emoji: '🌸', suffix: ', modern anime key visual, crisp lineart, soft gradient lighting, detailed background' },
  { id: 'concept', label: 'Concept art', emoji: '🎨', suffix: ', cinematic concept art, dramatic rim lighting, painterly detail, epic composition' },
  { id: 'photoreal', label: 'Photoreal', emoji: '📷', suffix: ', photorealistic, 50mm lens, natural light, shallow depth of field, ultra detailed' },
  { id: 'watercolor', label: 'Watercolor', emoji: '💧', suffix: ', soft watercolor illustration, textured paper, gentle washes, hand painted feel' },
  { id: 'render3d', label: '3D render', emoji: '🧊', suffix: ', stylised 3D render, subsurface scattering, studio lighting, high fidelity materials' },
  { id: 'pixel', label: 'Pixel art', emoji: '🕹️', suffix: ', detailed pixel art, limited palette, crisp pixels, retro game sprite style' },
];

export const IMAGE_PROMPT_IDEAS = [
  'A mystical fox spirit floating above cherry blossom trees at dusk',
  'Cozy animation studio at night, warm lamps, storyboards on the wall',
  'Character turnaround sheet of a cheerful orange fox animator',
  'Neon-lit city skyline reflected in rain puddles, cinematic wide shot',
];

export const CAPABILITY_LABELS: Record<Capability, { label: string; icon: string; description: string }> = {
  chat: { label: 'Chat', icon: '💬', description: 'Text conversation' },
  code: { label: 'Code', icon: '💻', description: 'Code generation & analysis' },
  vision: { label: 'Vision', icon: '👁️', description: 'Image understanding' },
  image: { label: 'Image', icon: '🎨', description: 'Image generation' },
  audio: { label: 'Audio', icon: '🔊', description: 'Audio/speech generation' },
  reasoning: { label: 'Reasoning', icon: '🧠', description: 'Deep reasoning & analysis' },
  math: { label: 'Math', icon: '🔢', description: 'Mathematical problem solving' },
  search: { label: 'Search', icon: '🔍', description: 'Web search integration' },
  agentic: { label: 'Agentic', icon: '🤖', description: 'Autonomous task execution' },
};

/* ------------------------------------------------------------------ */
/*  Live catalog: build providers from `puter.ai.listModels()` output  */
/* ------------------------------------------------------------------ */

import type { PuterRawModel } from './puter-ai';

/** Providers that only appear in the live catalog. */
const EXTRA_PROVIDER_META: Record<string, { name: string; logo: string; color: string }> = {
  microsoft: { name: 'Microsoft', logo: 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/microsoft.svg', color: '#5E9CFF' },
  openrouter: { name: 'OpenRouter', logo: '', color: '#8B8DF6' },
  groq: { name: 'Groq', logo: '', color: '#F55036' },
  together: { name: 'Together AI', logo: '', color: '#3B82F6' },
  blackforest: { name: 'Black Forest Labs', logo: '', color: '#22D3EE' },
  stability: { name: 'Stability AI', logo: '', color: '#A855F7' },
  ideogram: { name: 'Ideogram', logo: '', color: '#F472B6' },
  elevenlabs: { name: 'ElevenLabs', logo: '', color: '#E879F9' },
  baidu: { name: 'Baidu', logo: PROVIDER_LOGOS.baidu, color: PROVIDER_COLORS.baidu },
  liquid: { name: 'Liquid AI', logo: PROVIDER_LOGOS.liquid, color: PROVIDER_COLORS.liquid },
  stepfun: { name: 'StepFun', logo: PROVIDER_LOGOS.stepfun, color: PROVIDER_COLORS.stepfun },
  writer: { name: 'Writer', logo: PROVIDER_LOGOS.writer, color: PROVIDER_COLORS.writer },
  ai21: { name: 'AI21 Labs', logo: PROVIDER_LOGOS.ai21, color: PROVIDER_COLORS.ai21 },
  upstage: { name: 'Upstage', logo: PROVIDER_LOGOS.upstage, color: PROVIDER_COLORS.upstage },
  other: { name: 'More providers', logo: '', color: '#A78BFA' },
};

/** Ordered matchers — first hit wins, so keep specific patterns on top. */
const PROVIDER_MATCHERS: [string, RegExp][] = [
  ['microsoft', /(microsoft|phi-\d|wizardlm)/i],
  ['claude', /(claude|anthropic)/i],
  ['gemini', /(gemini|google|gemma|imagen|lyria|veo|palm)/i],
  ['grok', /(grok|x-ai|xai)/i],
  ['mistral', /(mistral|codestral|devstral|pixtral|magistral|mixtral)/i],
  ['deepseek', /deepseek/i],
  ['qwen', /(qwen|qwq|alibaba|tongyi)/i],
  ['kimi', /(kimi|moonshot)/i],
  ['llama', /(llama|meta-)/i],
  ['perplexity', /(perplexity|sonar)/i],
  ['cohere', /(cohere|command-)/i],
  ['amazon', /(amazon|nova-|bedrock|titan)/i],
  ['nvidia', /(nvidia|nemotron)/i],
  ['bytedance', /(bytedance|seedance|seedream|seed-\d)/i],
  ['tencent', /(tencent|hunyuan)/i],
  ['zai', /(z-ai|zhipu|glm)/i],
  ['minimax', /minimax/i],
  ['baidu', /(baidu|ernie)/i],
  ['nous', /(nousresearch|hermes)/i],
  ['arcee', /(arcee|trinity)/i],
  ['liquid', /(liquid|lfm)/i],
  ['stepfun', /(stepfun|step-\d)/i],
  ['writer', /(writer|palmyra)/i],
  ['sakana', /(sakana|fugu)/i],
  ['ai21', /(ai21|jamba)/i],
  ['upstage', /(upstage|solar-)/i],
  ['blackforest', /(black-?forest|flux)/i],
  ['stability', /(stability|stable-?diffusion|sdxl|sd3)/i],
  ['ideogram', /ideogram/i],
  ['elevenlabs', /(elevenlabs|eleven_)/i],
  ['openai', /(openai|gpt|dall-?e|whisper|sora|o1|o3|o4|codex)/i],
  ['groq', /groq/i],
  ['together', /together/i],
  ['openrouter', /openrouter/i],
];

const CAPABILITY_MATCHERS: [Capability, RegExp][] = [
  ['image', /(image|img|dall-?e|flux|imagen|stable-?diffusion|sdxl|sd3|playground|ideogram|recraft|seedream|imagine|photon|banana)/i],
  ['audio', /(tts|speech|audio|voice|lyria|music|whisper|scribe|eleven)/i],
  ['code', /(code|coder|codex|devstral|codestral|starcoder)/i],
  ['vision', /(vision|-vl|omni|multimodal|4o|gemini|claude|pixtral|llava|internvl)/i],
  ['reasoning', /(^|[/\-_])(o1|o3|o4|r1|reason|think|magistral|qwq|opus|pro)/i],
  ['math', /(math|o1|o3|r1|qwq)/i],
  ['search', /(sonar|perplexity|search|online)/i],
  ['agentic', /(agent|opus|fugu|glm-5)/i],
];

function providerMeta(providerId: string): { name: string; logo: string; color: string } {
  const known = PROVIDERS.find((p) => p.id === providerId);
  if (known) return { name: known.name, logo: known.logo, color: known.color };
  return EXTRA_PROVIDER_META[providerId] ?? EXTRA_PROVIDER_META.other;
}

function resolveProviderId(modelId: string, rawProvider: string): string {
  const haystack = `${modelId} ${rawProvider}`;
  for (const [providerId, pattern] of PROVIDER_MATCHERS) {
    if (pattern.test(haystack)) return providerId;
  }
  return 'other';
}

export function inferCapabilities(modelId: string, modelName = '', raw?: PuterRawModel): Capability[] {
  const haystack = `${modelId} ${modelName}`;
  const caps = new Set<Capability>(['chat']);

  for (const [capability, pattern] of CAPABILITY_MATCHERS) {
    if (pattern.test(haystack)) caps.add(capability);
  }

  if (raw) {
    const modalities = raw.input_modalities ?? raw.modalities;
    if (Array.isArray(modalities)) {
      const flat = modalities.map((m) => String(m).toLowerCase());
      if (flat.includes('image')) caps.add('vision');
      if (flat.includes('audio')) caps.add('audio');
    }
    if (raw.vision === true) caps.add('vision');
    if (raw.reasoning === true) caps.add('reasoning');
  }

  return Array.from(caps);
}

function prettifyModelId(modelId: string): string {
  const tail = modelId.includes('/') ? modelId.slice(modelId.lastIndexOf('/') + 1) : modelId;
  const upper = new Set(['gpt', 'glm', 'vl', 'tts', 'sd', 'xl', 'ai', 'hd', 'o1', 'o3', 'o4', 'r1', 'qwq', 'llm']);
  return tail
    .split(/[-_.]/)
    .filter(Boolean)
    .map((word) => {
      if (upper.has(word.toLowerCase())) return word.toUpperCase();
      if (/^\d/.test(word)) return word;
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(' ');
}

/**
 * Group the live puter.js model list into displayable providers.
 * Falls back to an empty array when nothing usable was returned.
 */
export function buildProvidersFromRaw(raw: PuterRawModel[]): ProviderInfo[] {
  const grouped = new Map<string, Map<string, ModelInfo>>();

  for (const entry of raw) {
    const id = String(entry?.id ?? '').trim();
    if (!id) continue;

    const providerId = resolveProviderId(id, typeof entry.provider === 'string' ? entry.provider : '');
    const name = typeof entry.name === 'string' && entry.name.trim() ? entry.name.trim() : prettifyModelId(id);

    if (!grouped.has(providerId)) grouped.set(providerId, new Map());
    const bucket = grouped.get(providerId)!;
    if (bucket.has(id)) continue;

    bucket.set(id, {
      id,
      name,
      provider: providerId,
      capabilities: inferCapabilities(id, name, entry),
      contextWindow: typeof entry.context === 'number' ? entry.context : undefined,
    });
  }

  const preferredOrder = [...PROVIDERS.map((p) => p.id), ...Object.keys(EXTRA_PROVIDER_META)];
  const rank = (providerId: string) => {
    if (providerId === 'other') return Number.MAX_SAFE_INTEGER;
    const index = preferredOrder.indexOf(providerId);
    return index === -1 ? preferredOrder.length : index;
  };

  return Array.from(grouped.keys())
    .sort((a, b) => rank(a) - rank(b) || a.localeCompare(b))
    .map((providerId) => {
      const meta = providerMeta(providerId);
      const models = Array.from(grouped.get(providerId)!.values()).sort((a, b) => a.name.localeCompare(b.name));
      return { id: providerId, name: meta.name, logo: meta.logo, color: meta.color, models };
    });
}

/** Image models discovered in the live catalog, merged with the curated list. */
export function mergeImageModelOptions(providers: ProviderInfo[]): MediaModelOption[] {
  const seen = new Set(IMAGE_MODEL_OPTIONS.map((o) => o.id));
  const extra: MediaModelOption[] = [];

  for (const provider of providers) {
    for (const model of provider.models) {
      if (!model.capabilities.includes('image')) continue;
      if (!/(image|img|dall-?e|flux|imagen|stable-?diffusion|sdxl|sd3|playground|ideogram|recraft|seedream|imagine|banana)/i.test(model.id)) continue;
      if (seen.has(model.id)) continue;
      seen.add(model.id);
      extra.push({ id: model.id, label: model.name, note: provider.name });
    }
  }

  return [...IMAGE_MODEL_OPTIONS, ...extra.slice(0, 24)];
}