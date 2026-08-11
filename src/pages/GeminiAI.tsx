import { useState, useRef, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Send, Loader2, Paperclip, X, ChevronDown, Menu, Settings, Globe } from 'lucide-react';
import { toast } from 'sonner';
import { loadPuter } from '@/lib/puter-ai';
import type { PuterAI } from '@/lib/puter-ai';

// ─── Language Support ───────────────────────────────────────────────────────
type Lang = 'en' | 'ru';

const i18n: Record<Lang, Record<string, string>> = {
  en: {
    title: 'Gemini',
    newChat: 'New chat',
    searchChats: 'Search in chats',
    images: 'Images',
    videos: 'Videos',
    library: 'Library',
    notebooks: 'Notebooks',
    newNotebook: 'New notebook',
    greeting: 'Hello',
    subtitle: 'How can I help you today?',
    placeholder: 'Ask Gemini',
    modelSelector: 'Gemini Flash',
    settings: 'Settings',
    language: 'Language',
    attachFile: 'Attach file',
    copy: 'Copy',
    delete: 'Delete',
    clearChat: 'Clear chat',
    thinking: 'Thinking...',
    errorLoad: 'Failed to load AI. Please refresh the page.',
    errorGenerate: 'Failed to generate response. Please try again.',
    fastest: 'Fastest responses',
    balanced: 'Balanced assistant',
    advanced: 'Advanced math & coding',
    deepThinking: 'Deep Thinking',
    complexProblems: 'Solve complex problems',
    close: 'Close',
    russian: 'Russian',
    english: 'English',
  },
  ru: {
    title: 'Gemini',
    newChat: 'Новый чат',
    searchChats: 'Поиск в чатах',
    images: 'Изображения',
    videos: 'Видео',
    library: 'Библиотека',
    notebooks: 'Блокноты',
    newNotebook: 'Новый блокнот',
    greeting: 'Привет',
    subtitle: 'Чем могу помочь сегодня?',
    placeholder: 'Спросите Gemini',
    modelSelector: 'Gemini Flash',
    settings: 'Настройки',
    language: 'Язык',
    attachFile: 'Прикрепить файл',
    copy: 'Копировать',
    delete: 'Удалить',
    clearChat: 'Очистить чат',
    thinking: 'Думаю...',
    errorLoad: 'Не удалось загрузить ИИ. Обновите страницу.',
    errorGenerate: 'Не удалось сгенерировать ответ. Попробуйте снова.',
    fastest: 'Самые быстрые ответы',
    balanced: 'Сбалансированный помощник',
    advanced: 'Продвинутая математика и код',
    deepThinking: 'Глубокое мышление',
    complexProblems: 'Решение сложных задач',
    close: 'Закрыть',
    russian: 'Русский',
    english: 'Английский',
  },
};

// ─── Models ─────────────────────────────────────────────────────────────────
interface ModelOption {
  id: string;
  name: string;
  descKey: string;
  badge?: string;
}

const MODELS: ModelOption[] = [
  { id: 'google/gemini-2.5-flash-preview-05-20', name: '2.5 Flash', descKey: 'fastest', badge: 'New' },
  { id: 'google/gemini-2.0-flash', name: '2.0 Flash', descKey: 'balanced' },
  { id: 'google/gemini-1.5-pro', name: '1.5 Pro', descKey: 'advanced' },
];

// ─── Types ──────────────────────────────────────────────────────────────────
interface Message {
  role: 'user' | 'assistant';
  content: string;
  files?: { name: string; type: string; preview?: string }[];
  timestamp: number;
}

interface UploadedFile {
  file: File;
  type: 'image' | 'video' | 'document';
  preview?: string;
}

// ─── Gemini Sparkle Icon ────────────────────────────────────────────────────
const GeminiSparkle = ({ className = 'w-8 h-8' }: { className?: string }) => (
  <svg viewBox="0 0 28 28" fill="none" className={className}>
    <path
      d="M14 0C14 7.732 7.732 14 0 14c7.732 0 14 6.268 14 14 0-7.732 6.268-14 14-14-7.732 0-14-6.268-14-14z"
      fill="url(#gemini-gradient)"
    />
    <defs>
      <linearGradient id="gemini-gradient" x1="0" y1="0" x2="28" y2="28" gradientUnits="userSpaceOnUse">
        <stop stopColor="#4285F4" />
        <stop offset="0.25" stopColor="#9B72CB" />
        <stop offset="0.5" stopColor="#D96570" />
        <stop offset="0.75" stopColor="#D96570" />
        <stop offset="1" stopColor="#FFC857" />
      </linearGradient>
    </defs>
  </svg>
);

// ─── Main Component ─────────────────────────────────────────────────────────
export default function GeminiAI() {
  const [lang, setLang] = useState<Lang>('en');
  const t = i18n[lang];

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedModel, setSelectedModel] = useState(MODELS[0].id);
  const [showModelPicker, setShowModelPicker] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [puterAI, setPuterAI] = useState<PuterAI | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Load puter.js
  useEffect(() => {
    loadPuter()
      .then(ai => setPuterAI(ai))
      .catch(() => toast.error(t.errorLoad));
  }, [t.errorLoad]);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 120) + 'px';
    }
  }, [input]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const newFiles: UploadedFile[] = [];

    for (const file of files) {
      const type = file.type.startsWith('image/') ? 'image' : file.type.startsWith('video/') ? 'video' : 'document';
      const uploaded: UploadedFile = { file, type };

      if (type === 'image') {
        const reader = new FileReader();
        reader.onload = (ev) => {
          uploaded.preview = ev.target?.result as string;
          setUploadedFiles(prev => [...prev]);
        };
        reader.readAsDataURL(file);
      }
      newFiles.push(uploaded);
    }

    if (newFiles.length > 0) setUploadedFiles(prev => [...prev, ...newFiles]);
    e.target.value = '';
  };

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const fileToBase64 = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve((reader.result as string).split(',')[1]);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

  const generateResponse = useCallback(async () => {
    if (!input.trim() && uploadedFiles.length === 0) return;
    if (!puterAI) { toast.error(t.errorLoad); return; }

    setIsGenerating(true);

    const userMessage: Message = {
      role: 'user',
      content: input,
      files: uploadedFiles.map(f => ({ name: f.file.name, type: f.file.type, preview: f.type === 'image' ? f.preview : undefined })),
      timestamp: Date.now(),
    };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    const filesToSend = [...uploadedFiles];
    setUploadedFiles([]);

    try {
      // Build message for puter.js
      let prompt = '';
      if (lang === 'ru') {
        prompt += 'Please respond in Russian.\n\n';
      }

      // Add conversation history
      for (const msg of messages) {
        prompt += `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}\n`;
      }
      if (input.trim()) prompt += `User: ${input}\n`;

      // Handle file attachments via puter.js
      if (filesToSend.length > 0) {
        for (const uploaded of filesToSend) {
          if (uploaded.type === 'image' && uploaded.preview) {
            // Use img2txt for image understanding, then add to context
            try {
              const imageDesc = await puterAI.img2txt(uploaded.preview, { model: selectedModel });
              prompt += `\n[Image: ${uploaded.file.name}] Description: ${imageDesc}\n`;
            } catch {
              prompt += `\n[Image: ${uploaded.file.name}] (attached)\n`;
            }
          } else if (uploaded.type === 'document') {
            try {
              const text = await uploaded.file.text();
              prompt += `\n[File: ${uploaded.file.name}]\n${text}\n`;
            } catch {
              prompt += `\n[File: ${uploaded.file.name}] (binary file)\n`;
            }
          } else if (uploaded.type === 'video') {
            const base64 = await fileToBase64(uploaded.file);
            prompt += `\n[Video: ${uploaded.file.name}] (${(uploaded.file.size / 1024 / 1024).toFixed(1)}MB, base64 length: ${base64.length})\n`;
          }
        }
      }

      const response = await puterAI.chat(prompt, { model: selectedModel });
      const responseText = typeof response === 'string' ? response : response?.message?.content || response?.text || JSON.stringify(response);

      const assistantMessage: Message = {
        role: 'assistant',
        content: responseText,
        timestamp: Date.now(),
      };
      setMessages(prev => [...prev, assistantMessage]);
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : t.errorGenerate;
      toast.error(errorMsg);
      setMessages(prev => [...prev, { role: 'assistant', content: `Error: ${errorMsg}`, timestamp: Date.now() }]);
    } finally {
      setIsGenerating(false);
    }
  }, [input, uploadedFiles, puterAI, messages, selectedModel, lang, t.errorLoad, t.errorGenerate]);

  const clearChat = () => {
    setMessages([]);
    setUploadedFiles([]);
  };

  const currentModelName = MODELS.find(m => m.id === selectedModel)?.name || 'Flash';

  return (
    <div className="h-screen w-full flex overflow-hidden" style={{ background: 'linear-gradient(180deg, #0d1117 0%, #0a1628 50%, #111827 100%)' }}>
      {/* Sidebar */}
      <div
        className={`fixed inset-0 z-50 transition-transform duration-300 ${showSidebar ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div className="absolute inset-0 bg-black/60" onClick={() => setShowSidebar(false)} />
        <div className="relative w-80 h-full bg-[#0d1117] border-r border-white/10 flex flex-col p-4 overflow-y-auto">
          {/* Sidebar Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-white text-xl font-semibold">{t.title}</h2>
            <button onClick={() => setShowSidebar(false)} className="text-white/60 hover:text-white p-1">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* New Chat Button */}
          <button
            onClick={() => { clearChat(); setShowSidebar(false); }}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-full bg-white/10 hover:bg-white/15 text-white mb-4 transition-colors"
          >
            <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" stroke="currentColor" strokeWidth="2">
              <path d="M12 5v14M5 12h14" strokeLinecap="round" />
            </svg>
            <span>{t.newChat}</span>
          </button>

          {/* Menu Items */}
          <div className="space-y-1">
            <SidebarItem icon={<SearchIcon />} label={t.searchChats} />
            <SidebarItem icon={<ImageIcon />} label={t.images} />
            <SidebarItem icon={<VideoIcon />} label={t.videos} />
            <SidebarItem icon={<LibraryIcon />} label={t.library} />
          </div>

          {/* Notebooks Section */}
          <div className="mt-8">
            <p className="text-white/50 text-sm mb-2">{t.notebooks}</p>
            <button className="flex items-center gap-3 px-4 py-2 text-white/70 hover:text-white transition-colors">
              <span className="text-lg">+</span>
              <span>{t.newNotebook}</span>
            </button>
          </div>

          {/* Language Toggle */}
          <div className="mt-auto pt-6 border-t border-white/10">
            <div className="flex items-center gap-3 px-4 py-3">
              <Globe className="w-5 h-5 text-white/60" />
              <span className="text-white/70 text-sm">{t.language}</span>
              <div className="ml-auto flex gap-1">
                <button
                  onClick={() => setLang('en')}
                  className={`px-2 py-1 rounded text-xs font-medium transition-colors ${lang === 'en' ? 'bg-blue-500 text-white' : 'bg-white/10 text-white/60 hover:text-white'}`}
                >
                  EN
                </button>
                <button
                  onClick={() => setLang('ru')}
                  className={`px-2 py-1 rounded text-xs font-medium transition-colors ${lang === 'ru' ? 'bg-blue-500 text-white' : 'bg-white/10 text-white/60 hover:text-white'}`}
                >
                  RU
                </button>
              </div>
            </div>

            {/* Settings */}
            <button className="flex items-center gap-3 px-4 py-3 text-white/60 hover:text-white transition-colors w-full">
              <Settings className="w-5 h-5" />
              <span>{t.settings}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-full">
        {/* Top Bar */}
        <div className="flex items-center justify-between px-4 py-3">
          <Link to="/ai" className="text-white/60 hover:text-white p-2 rounded-full hover:bg-white/10 transition-colors">
            <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>

          {/* Model Selector */}
          <button
            onClick={() => setShowModelPicker(!showModelPicker)}
            className="flex items-center gap-1 text-white/90 hover:text-white transition-colors"
          >
            <ChevronDown className="w-4 h-4" />
            <span className="text-sm font-medium">{t.modelSelector} {currentModelName}</span>
          </button>

          {/* Hamburger Menu */}
          <button onClick={() => setShowSidebar(true)} className="text-white/60 hover:text-white p-2 rounded-full hover:bg-white/10 transition-colors">
            <Menu className="w-5 h-5" />
          </button>
        </div>

        {/* Model Picker Dropdown */}
        {showModelPicker && (
          <div className="absolute top-14 left-1/2 -translate-x-1/2 z-40 bg-[#1a2332] border border-white/10 rounded-2xl p-3 shadow-2xl min-w-[260px]">
            {MODELS.map(model => (
              <button
                key={model.id}
                onClick={() => { setSelectedModel(model.id); setShowModelPicker(false); }}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-colors ${selectedModel === model.id ? 'bg-white/10' : 'hover:bg-white/5'}`}
              >
                <div className="text-left">
                  <div className="flex items-center gap-2">
                    {model.badge && (
                      <span className="px-2 py-0.5 bg-blue-500/20 text-blue-400 text-[10px] font-bold rounded-full">{model.badge}</span>
                    )}
                    <span className="text-white font-medium text-sm">{model.name}</span>
                  </div>
                  <p className="text-white/50 text-xs mt-0.5">{t[model.descKey as keyof typeof t]}</p>
                </div>
                {selectedModel === model.id && (
                  <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5 text-white" stroke="currentColor" strokeWidth="2">
                    <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </button>
            ))}

            {/* Deep Thinking option */}
            <div className="border-t border-white/10 mt-2 pt-2">
              <div className="px-4 py-3">
                <p className="text-white font-medium text-sm">{t.deepThinking}</p>
                <p className="text-white/50 text-xs">{t.complexProblems}</p>
              </div>
            </div>
          </div>
        )}

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto px-4 pb-4">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full">
              <GeminiSparkle className="w-12 h-12 mb-6" />
              <h1 className="text-white text-2xl font-light mb-1">{t.greeting}</h1>
              <p className="text-white/50 text-base">{t.subtitle}</p>
            </div>
          ) : (
            <div className="max-w-3xl mx-auto pt-4 space-y-6">
              {messages.map((msg, idx) => (
                <div key={idx} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  {msg.role === 'assistant' && (
                    <div className="flex-shrink-0 mt-1">
                      <GeminiSparkle className="w-6 h-6" />
                    </div>
                  )}
                  <div className={`max-w-[80%] ${msg.role === 'user' ? 'bg-white/10 rounded-2xl rounded-tr-sm px-4 py-3' : ''}`}>
                    {/* Show attached files */}
                    {msg.files && msg.files.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-2">
                        {msg.files.map((f, fi) => (
                          <div key={fi} className="flex items-center gap-1 bg-white/5 rounded-lg px-2 py-1">
                            {f.preview ? (
                              <img src={f.preview} alt={f.name} className="w-8 h-8 rounded object-cover" />
                            ) : (
                              <span className="text-white/50 text-xs">📎</span>
                            )}
                            <span className="text-white/60 text-xs truncate max-w-[100px]">{f.name}</span>
                          </div>
                        ))}
                      </div>
                    )}
                    <p className="text-white/90 text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                  </div>
                </div>
              ))}
              {isGenerating && (
                <div className="flex gap-3">
                  <div className="flex-shrink-0 mt-1">
                    <GeminiSparkle className="w-6 h-6 animate-pulse" />
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <div className="w-2 h-2 bg-pink-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                    <span className="text-white/40 text-sm">{t.thinking}</span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* File Previews */}
        {uploadedFiles.length > 0 && (
          <div className="px-4 pb-2">
            <div className="max-w-3xl mx-auto flex flex-wrap gap-2">
              {uploadedFiles.map((f, idx) => (
                <div key={idx} className="relative group bg-white/5 border border-white/10 rounded-xl p-2 flex items-center gap-2">
                  {f.type === 'image' && f.preview ? (
                    <img src={f.preview} alt={f.file.name} className="w-10 h-10 rounded-lg object-cover" />
                  ) : (
                    <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center">
                      <span className="text-white/50 text-xs">{f.type === 'video' ? '🎬' : '📄'}</span>
                    </div>
                  )}
                  <span className="text-white/70 text-xs truncate max-w-[80px]">{f.file.name}</span>
                  <button
                    onClick={() => removeFile(idx)}
                    className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-3 h-3 text-white" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Input Bar */}
        <div className="px-4 pb-6 pt-2">
          <div className="max-w-3xl mx-auto">
            <div className="flex items-end gap-2 bg-[#1a2332] border border-white/10 rounded-full px-4 py-2">
              {/* Attachment Button */}
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex-shrink-0 p-2 text-white/50 hover:text-white transition-colors"
                title={t.attachFile}
              >
                <Paperclip className="w-5 h-5" />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*,video/*,.pdf,.txt,.md,.json,.csv,.doc,.docx"
                onChange={handleFileUpload}
                className="hidden"
              />

              {/* Text Input */}
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    generateResponse();
                  }
                }}
                placeholder={t.placeholder}
                rows={1}
                className="flex-1 bg-transparent text-white placeholder-white/40 text-sm resize-none outline-none py-2 max-h-[120px]"
              />

              {/* Send Button */}
              <button
                onClick={generateResponse}
                disabled={isGenerating || (!input.trim() && uploadedFiles.length === 0)}
                className="flex-shrink-0 p-2 rounded-full bg-blue-500 hover:bg-blue-400 disabled:bg-white/10 disabled:text-white/30 text-white transition-colors"
              >
                {isGenerating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Sidebar Icons ──────────────────────────────────────────────────────────
function SidebarItem({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-white/70 hover:text-white hover:bg-white/5 transition-colors">
      {icon}
      <span className="text-sm">{label}</span>
    </button>
  );
}

const SearchIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" stroke="currentColor" strokeWidth="1.5">
    <circle cx="11" cy="11" r="8" />
    <path d="M21 21l-4.35-4.35" strokeLinecap="round" />
  </svg>
);

const ImageIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" stroke="currentColor" strokeWidth="1.5">
    <rect x="3" y="3" width="18" height="18" rx="2" />
    <circle cx="8.5" cy="8.5" r="1.5" />
    <path d="M21 15l-5-5L5 21" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const VideoIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" stroke="currentColor" strokeWidth="1.5">
    <rect x="2" y="4" width="20" height="16" rx="2" />
    <path d="M10 9l5 3-5 3V9z" fill="currentColor" />
  </svg>
);

const LibraryIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" stroke="currentColor" strokeWidth="1.5">
    <circle cx="8" cy="8" r="2" />
    <circle cx="16" cy="8" r="2" />
    <circle cx="8" cy="16" r="2" />
    <circle cx="16" cy="16" r="2" />
  </svg>
);