import { useState, useEffect, useRef, useCallback } from 'react';
import { Send, Sparkles, Menu, Paperclip, X, Settings2, Loader2, ChevronDown, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useModel } from '@/contexts/ModelContext';
import { ModelPicker } from './ModelPicker';
import { ModelSettingsPanel } from './ModelSettingsPanel';
import { GenerateModal } from './GenerateModal';
import { MessageRenderer } from './MessageRenderer';
import { getConversation, addMessage, createConversation, listConversations, type StoredMessage } from '@/lib/storage';
import { getModel, getModelProvider, PROVIDERS } from '@/lib/models';
import { getPuterAI, waitForPuter } from '@/lib/puter-ai';

interface ChatPanelProps {
  conversationId: string | null;
  onNewConversation: (id: string) => void;
  onToggleSidebar: () => void;
}

export function ChatPanel({ conversationId, onNewConversation, onToggleSidebar }: ChatPanelProps) {
  const { selectedModel, temperature, maxTokens, systemPrompt, showReasoning } = useModel();

  const [messages, setMessages] = useState<StoredMessage[]>([]);
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingContent, setStreamingContent] = useState('');
  const [streamingReasoning, setStreamingReasoning] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [puterReady, setPuterReady] = useState(false);
  const [puterError, setPuterError] = useState<string | null>(null);

  // Image upload
  const [imageAttachment, setImageAttachment] = useState<{ dataUrl: string; mimeType: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Modals
  const [modelPickerOpen, setModelPickerOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [generateOpen, setGenerateOpen] = useState(false);

  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Wait for puter.js to be ready
  useEffect(() => {
    waitForPuter()
      .then(() => setPuterReady(true))
      .catch((err) => setPuterError(err.message));
  }, []);

  // Load messages when conversation changes
  useEffect(() => {
    if (conversationId) {
      const conv = getConversation(conversationId);
      setMessages(conv?.messages ?? []);
    } else {
      setMessages([]);
    }
  }, [conversationId]);

  // Scroll to bottom
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamingContent]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [input]);

  const ensureConversation = useCallback((): string => {
    if (conversationId) return conversationId;
    const conv = createConversation(selectedModel);
    onNewConversation(conv.id);
    return conv.id;
  }, [conversationId, selectedModel, onNewConversation]);

  const handleSend = useCallback(async () => {
    const text = input.trim();
    if (!text || isStreaming || isGenerating) return;

    const puterAI = getPuterAI();
    if (!puterAI) {
      setPuterError('puter.js is not loaded yet. Please wait a moment and try again.');
      return;
    }

    const convId = ensureConversation();
    setInput('');
    setIsStreaming(true);
    setStreamingContent('');
    setStreamingReasoning('');

    // Add user message
    const userMsg = addMessage(convId, { role: 'user', content: text, attachmentData: imageAttachment?.dataUrl ?? null });
    setMessages((prev) => [...prev, userMsg]);
    setImageAttachment(null);

    try {
      // Build message history
      const history = getConversation(convId)?.messages.slice(0, -1).map((m) => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
      })) ?? [];

      const userContent = imageAttachment?.dataUrl
        ? [
            { type: 'text', text },
            { type: 'image_url', image_url: { url: imageAttachment.dataUrl } },
          ]
        : text;

      const msgs = [
        { role: 'system' as const, content: systemPrompt },
        ...history,
        { role: 'user' as const, content: userContent },
      ];

      const response = await puterAI.chat(msgs, {
        model: selectedModel,
        stream: true,
        temperature,
        max_tokens: maxTokens,
      });

      let fullContent = '';
      let fullReasoning = '';

      // Handle streaming
      if (response && typeof response[Symbol.asyncIterator] === 'function') {
        for await (const part of response) {
          if (part?.text) {
            fullContent += part.text;
            setStreamingContent(fullContent);
          }
          if (part?.reasoning && showReasoning) {
            fullReasoning += part.reasoning;
            setStreamingReasoning(fullReasoning);
          }
        }
      } else if (typeof response === 'string') {
        fullContent = response;
        setStreamingContent(fullContent);
      } else if (response?.message?.content) {
        fullContent = response.message.content;
        setStreamingContent(fullContent);
      }

      if (fullContent.trim()) {
        const assistantMsg = addMessage(convId, { role: 'assistant', content: fullContent });
        setMessages((prev) => [...prev, assistantMsg]);
      }
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : String(error);
      const errorMsg = addMessage(convId, { role: 'assistant', content: `⚠️ Error: ${msg}` });
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsStreaming(false);
      setStreamingContent('');
      setStreamingReasoning('');
    }
  }, [input, isStreaming, isGenerating, imageAttachment, ensureConversation, selectedModel, temperature, maxTokens, systemPrompt, showReasoning]);

  const handleGenerate = useCallback(
    async (type: 'image' | 'audio' | 'video', prompt: string, opts: Record<string, unknown>) => {
      const puterAI = getPuterAI();
      if (!puterAI) {
        setPuterError('puter.js is not loaded. Please refresh.');
        return;
      }

      setIsGenerating(true);
      setGenerateOpen(false);
      const convId = ensureConversation();

      const userMsg = addMessage(convId, { role: 'user', content: `Generate ${type}: ${prompt}` });
      setMessages((prev) => [...prev, userMsg]);

      try {
        let mediaUrl = '';
        const mediaType: 'image' | 'audio' | 'video' = type;

        if (type === 'image') {
          const img = await puterAI.txt2img(prompt, opts as { model?: string });
          // img is an HTMLImageElement - get its src
          mediaUrl = img.src || '';
          if (!mediaUrl && img instanceof HTMLImageElement) {
            const canvas = document.createElement('canvas');
            canvas.width = img.naturalWidth || 1024;
            canvas.height = img.naturalHeight || 1024;
            const ctx = canvas.getContext('2d');
            if (ctx) ctx.drawImage(img, 0, 0);
            mediaUrl = canvas.toDataURL('image/png');
          }
        } else if (type === 'audio') {
          const blob = await puterAI.txt2speech(prompt, opts as { model?: string; voice?: string });
          mediaUrl = URL.createObjectURL(blob);
        } else if (type === 'video') {
          // Video generation via puter.js
          const puterAny = puterAI as unknown as { txt2vid?: (o: Record<string, unknown>) => Promise<Blob> };
          if (typeof puterAny.txt2vid !== 'function') {
            throw new Error('Video generation (txt2vid) is not yet available in puter.js. Try image or audio generation.');
          }
          const blob = await puterAny.txt2vid({ prompt, ...opts });
          mediaUrl = URL.createObjectURL(blob);
        }

        const assistantMsg = addMessage(convId, {
          role: 'assistant',
          content: `Generated ${type} for: "${prompt}"`,
          mediaType,
          mediaUrl,
        });
        setMessages((prev) => [...prev, assistantMsg]);
      } catch (error: unknown) {
        const msg = error instanceof Error ? error.message : String(error);
        const errorMsg = addMessage(convId, { role: 'assistant', content: `⚠️ ${type} generation failed: ${msg}` });
        setMessages((prev) => [...prev, errorMsg]);
      } finally {
        setIsGenerating(false);
      }
    },
    [ensureConversation]
  );

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setImageAttachment({ dataUrl: reader.result as string, mimeType: file.type });
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const model = getModel(selectedModel);
  const provider = getModelProvider(selectedModel);

  return (
    <div className="flex flex-col h-screen min-h-0">
      {/* Modals */}
      <ModelPicker open={modelPickerOpen} onClose={() => setModelPickerOpen(false)} />
      <ModelSettingsPanel open={settingsOpen} onClose={() => setSettingsOpen(false)} />
      <GenerateModal
        open={generateOpen}
        onClose={() => setGenerateOpen(false)}
        onGenerate={handleGenerate}
        isGenerating={isGenerating}
      />

      {/* Top bar */}
      <div className="shrink-0 flex items-center gap-3 px-4 py-2.5 border-b border-purple-500/20 bg-slate-950/60 backdrop-blur-xl">
        <button
          onClick={onToggleSidebar}
          className="md:hidden p-1.5 rounded-md text-purple-300 hover:text-white transition-colors"
          aria-label="Open sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Model badge */}
        <button
          onClick={() => setModelPickerOpen(true)}
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-medium transition-all hover:bg-purple-500/20 border border-purple-500/30 bg-purple-500/10"
          title="Change model"
        >
          {provider && (
            <img
              src={provider.logo}
              alt={provider.name}
              className="w-4 h-4 rounded-sm"
              style={{ filter: 'brightness(0) invert(1)' }}
              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
            />
          )}
          <span className="text-purple-200 max-w-[160px] truncate font-mono">{model?.name ?? selectedModel}</span>
          <ChevronDown className="w-3 h-3 text-purple-400" />
        </button>

        {/* Puter status indicator */}
        <div className="flex items-center gap-1.5">
          <div className={`w-2 h-2 rounded-full ${puterReady ? 'bg-emerald-400 shadow-lg shadow-emerald-400/50' : 'bg-yellow-400 animate-pulse'}`} />
          <span className="text-[10px] text-slate-400 hidden sm:inline">
            {puterReady ? 'Connected' : 'Loading...'}
          </span>
        </div>

        <div className="flex-1" />

        <button
          onClick={() => setSettingsOpen(true)}
          className="p-1.5 rounded-lg text-purple-300 hover:text-white transition-colors"
          title="Model settings"
        >
          <Settings2 className="w-4.5 h-4.5" />
        </button>
      </div>

      {/* Puter error banner */}
      {puterError && (
        <div className="shrink-0 px-4 py-2 bg-red-500/20 border-b border-red-500/30 text-red-300 text-xs flex items-center gap-2">
          <span>⚠️ {puterError}</span>
          <button onClick={() => { setPuterError(null); window.location.reload(); }} className="ml-auto text-red-200 hover:text-white underline">
            Reload
          </button>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 md:px-8 py-6 min-h-0">
        {messages.length === 0 && !streamingContent ? (
          <div className="flex items-center justify-center h-full text-center px-4">
            <div>
              <div className="relative inline-block mb-4">
                <img src="/assets/logo.png" alt="Lisichka" className="w-32 h-32 mx-auto rounded-full object-cover glow-purple" />
                <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-purple-500/20 to-fuchsia-500/20 animate-pulse-glow" />
              </div>
              <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-400 via-fuchsia-400 to-pink-400 bg-clip-text text-transparent mb-2" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                Welcome to Lisichka
              </h2>
              <p className="text-purple-200/80 mb-1">Your mystical AI companion with 350+ models</p>
              <p className="text-sm text-purple-300/50 mb-6">Send a message, generate images, audio, or video — all free</p>
              
              {/* Quick action chips */}
              <div className="flex flex-wrap justify-center gap-2 mb-6">
                <button
                  onClick={() => setInput('Tell me something interesting about space')}
                  className="px-3 py-1.5 rounded-full text-xs bg-purple-500/20 border border-purple-500/30 text-purple-300 hover:bg-purple-500/30 transition-all"
                >
                  💫 Space facts
                </button>
                <button
                  onClick={() => setInput('Write me a short poem')}
                  className="px-3 py-1.5 rounded-full text-xs bg-fuchsia-500/20 border border-fuchsia-500/30 text-fuchsia-300 hover:bg-fuchsia-500/30 transition-all"
                >
                  ✨ Write a poem
                </button>
                <button
                  onClick={() => setGenerateOpen(true)}
                  className="px-3 py-1.5 rounded-full text-xs bg-pink-500/20 border border-pink-500/30 text-pink-300 hover:bg-pink-500/30 transition-all"
                >
                  🎨 Generate media
                </button>
              </div>

              <div className="flex justify-center gap-2">
                <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
                <span className="w-2 h-2 rounded-full bg-fuchsia-400 animate-pulse" style={{ animationDelay: '0.3s' }} />
                <span className="w-2 h-2 rounded-full bg-pink-400 animate-pulse" style={{ animationDelay: '0.6s' }} />
              </div>
            </div>
          </div>
        ) : (
          <div className="max-w-3xl mx-auto space-y-6">
            {messages.map((m) => (
              <MessageRenderer
                key={m.id}
                role={m.role}
                content={m.content}
                mediaType={m.mediaType ?? null}
                mediaUrl={m.mediaUrl ?? null}
                attachmentData={m.attachmentData ?? null}
              />
            ))}

            {/* Streaming assistant bubble */}
            {isStreaming && streamingContent && (
              <MessageRenderer
                role="assistant"
                content={streamingContent}
                reasoningText={showReasoning ? streamingReasoning : undefined}
                isStreaming
              />
            )}

            {/* Generating spinner */}
            {isGenerating && (
              <div className="flex gap-3 items-center">
                <img src="/assets/logo.png" alt="Lisichka" className="w-8 h-8 rounded-full object-cover" />
                <div className="flex items-center gap-2 px-4 py-3 rounded-2xl text-sm bg-purple-500/10 border border-purple-500/20 backdrop-blur-sm">
                  <Loader2 className="w-4 h-4 animate-spin text-fuchsia-400" />
                  <span className="text-purple-200">Generating…</span>
                </div>
              </div>
            )}

            {/* Waiting for first token */}
            {isStreaming && !streamingContent && (
              <div className="flex gap-3 items-center">
                <img src="/assets/logo.png" alt="Lisichka" className="w-8 h-8 rounded-full object-cover" />
                <div className="flex items-center gap-1.5 px-4 py-3 rounded-2xl bg-purple-500/10 border border-purple-500/20 backdrop-blur-sm">
                  {[0, 1, 2].map((i) => (
                    <span
                      key={i}
                      className="w-1.5 h-1.5 rounded-full bg-fuchsia-400/80 animate-bounce"
                      style={{ animationDelay: `${i * 0.15}s` }}
                    />
                  ))}
                </div>
              </div>
            )}

            <div ref={bottomRef} />
          </div>
        )}
      </div>

      {/* Input area */}
      <div className="shrink-0 border-t border-purple-500/20 px-4 md:px-8 py-4 bg-slate-950/60 backdrop-blur-xl">
        {/* Image preview */}
        {imageAttachment && (
          <div className="mb-3 relative inline-block">
            <img
              src={imageAttachment.dataUrl}
              alt="Attachment"
              className="h-16 rounded-xl object-cover shadow-lg border border-purple-500/30"
            />
            <button
              onClick={() => setImageAttachment(null)}
              className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        )}

        <div className="flex items-end gap-2 rounded-2xl px-3 py-2 border border-purple-500/30 bg-purple-950/30 backdrop-blur-sm">
          {/* Image upload */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleImageSelect}
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="p-1.5 rounded-lg shrink-0 transition-colors mb-0.5 text-purple-300 hover:text-fuchsia-400"
            title="Attach image"
          >
            <Paperclip className="w-4 h-4" />
          </button>

          {/* Textarea */}
          <Textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={`Message ${model?.name ?? 'Lisichka'}…`}
            rows={1}
            disabled={isStreaming || isGenerating}
            className="flex-1 border-0 bg-transparent resize-none text-sm shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 min-h-0 py-1.5 text-white placeholder:text-purple-400/50"
          />

          {/* Generate media button */}
          <button
            onClick={() => setGenerateOpen(true)}
            disabled={isStreaming || isGenerating}
            className="p-1.5 rounded-lg shrink-0 transition-colors mb-0.5 text-purple-300 hover:text-pink-400"
            title="Generate image / audio / video"
          >
            <Sparkles className="w-4 h-4" />
          </button>

          {/* Send */}
          <Button
            onClick={handleSend}
            disabled={(!input.trim() && !imageAttachment) || isStreaming || isGenerating}
            size="sm"
            className="shrink-0 rounded-xl mb-0.5 px-3 bg-gradient-to-r from-purple-500 to-fuchsia-500 hover:from-purple-600 hover:to-fuchsia-600 text-white border-0 shadow-lg shadow-purple-500/25"
          >
            {isStreaming ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </Button>
        </div>

        <div className="flex items-center justify-center gap-1.5 mt-2">
          <Zap className="w-3 h-3 text-purple-500" />
          <p className="text-[10px] text-purple-400/60">
            puter.js · {PROVIDERS.reduce((s, p) => s + p.models.length, 0)} models · free · no API key needed
          </p>
        </div>
      </div>
    </div>
  );
}