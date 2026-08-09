import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Send, Loader2, Image, Code, Eye, MessageSquare, Sparkles, ChevronLeft, ChevronRight, Download, Copy, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { loadPuter } from '@/lib/puter-ai';

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || '';
const GEMINI_API_BASE = 'https://generativelanguage.googleapis.com/v1beta';

// Minimalist SVG icons for each tool
const ChatIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" stroke="currentColor" strokeWidth="1.5">
    <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2v10z" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const CodeIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" stroke="currentColor" strokeWidth="1.5">
    <path d="M16 18l6-6-6-6M8 6l-6 6 6 6" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const VisionIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" stroke="currentColor" strokeWidth="1.5">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" strokeLinecap="round"/>
    <circle cx="12" cy="12" r="3" strokeLinecap="round"/>
  </svg>
);

const ImageGenIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" stroke="currentColor" strokeWidth="1.5">
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" strokeLinecap="round"/>
    <circle cx="8.5" cy="8.5" r="1.5" fill="currentColor"/>
    <path d="M21 15l-5-5L5 21" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const ReasoningIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" stroke="currentColor" strokeWidth="1.5">
    <path d="M12 2a8 8 0 018 8c0 3.5-2 5.5-4 7l-1 3H9l-1-3c-2-1.5-4-3.5-4-7a8 8 0 018-8z" strokeLinecap="round"/>
    <path d="M9 22h6M10 18h4" strokeLinecap="round"/>
  </svg>
);

const SearchIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" stroke="currentColor" strokeWidth="1.5">
    <circle cx="11" cy="11" r="8"/>
    <path d="M21 21l-4.35-4.35" strokeLinecap="round"/>
  </svg>
);

type ToolId = 'chat' | 'code' | 'vision' | 'imagegen' | 'reasoning' | 'search';

interface ToolItem {
  id: ToolId;
  label: string;
  icon: React.FC;
  description: string;
  model: string;
}

const tools: ToolItem[] = [
  { id: 'chat', label: 'Chat', icon: ChatIcon, description: 'Conversational AI', model: 'gemini-2.5-flash' },
  { id: 'code', label: 'Code', icon: CodeIcon, description: 'Code generation & analysis', model: 'gemini-2.5-pro' },
  { id: 'vision', label: 'Vision', icon: VisionIcon, description: 'Image understanding', model: 'gemini-2.5-flash' },
  { id: 'imagegen', label: 'Image Gen', icon: ImageGenIcon, description: 'Generate images from text', model: 'gemini-2.5-flash' },
  { id: 'reasoning', label: 'Reasoning', icon: ReasoningIcon, description: 'Deep analysis & logic', model: 'gemini-2.5-pro' },
  { id: 'search', label: 'Search', icon: SearchIcon, description: 'Web-grounded answers', model: 'gemini-2.5-flash' },
];

interface Message {
  role: 'user' | 'assistant';
  content: string;
  image?: string;
  timestamp: number;
}

const GeminiAI = () => {
  const [activeTool, setActiveTool] = useState<ToolId>('chat');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedModel, setSelectedModel] = useState('gemini-2.5-flash');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleToolChange = (id: ToolId) => {
    setActiveTool(id);
    const tool = tools.find(t => t.id === id);
    if (tool) setSelectedModel(tool.model);
    setMessages([]);
    setImageFile(null);
    setImagePreview(null);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const generateResponse = async () => {
    if (!input.trim() && !imageFile) { toast.error('Enter a message.'); return; }
    setIsGenerating(true);

    const userMessage: Message = {
      role: 'user',
      content: input,
      image: imagePreview || undefined,
      timestamp: Date.now(),
    };
    setMessages(prev => [...prev, userMessage]);
    setInput('');

    try {
      // Build system prompt based on active tool
      let systemPrompt = '';
      switch (activeTool) {
        case 'code':
          systemPrompt = 'You are an expert programmer. Provide clean, well-commented code solutions. Use markdown code blocks with language tags.';
          break;
        case 'vision':
          systemPrompt = 'You are an image analysis expert. Describe images in detail, identify objects, text, and provide insights.';
          break;
        case 'imagegen':
          systemPrompt = 'You are a creative image description generator. When asked to generate an image, create a detailed, vivid description that could be used as an image generation prompt.';
          break;
        case 'reasoning':
          systemPrompt = 'You are a deep reasoning AI. Break down complex problems step by step. Show your thought process clearly.';
          break;
        case 'search':
          systemPrompt = 'You are a knowledgeable AI assistant. Provide accurate, up-to-date information with sources when possible.';
          break;
        default:
          systemPrompt = 'You are Gemini, a helpful and creative AI assistant by Google. Be concise and helpful.';
      }

      // Try using puter.js first for broader model access
      let responseText = '';
      try {
        const ai = await loadPuter(5000);
        const puterModel = `google/${selectedModel}`;
        const chatMessages = [
          { role: 'system' as const, content: systemPrompt },
          ...messages.map(m => ({ role: m.role as 'user' | 'assistant', content: m.content })),
          { role: 'user' as const, content: input },
        ];
        const result = await ai.chat(chatMessages, { model: puterModel });
        if (result?.message?.content) {
          responseText = typeof result.message.content === 'string'
            ? result.message.content
            : Array.isArray(result.message.content)
              ? result.message.content.map((p: { text?: string }) => p.text || '').join('')
              : String(result.message.content);
        } else if (typeof result === 'string') {
          responseText = result;
        }
      } catch {
        // Fallback to direct Gemini API
        const url = `${GEMINI_API_BASE}/models/${selectedModel}:generateContent?key=${GEMINI_API_KEY}`;
        const parts: Array<{ text: string } | { inline_data: { mime_type: string; data: string } }> = [];

        if (systemPrompt) parts.push({ text: systemPrompt });
        if (input.trim()) parts.push({ text: input });

        if (imageFile && imagePreview) {
          const base64 = imagePreview.split(',')[1];
          parts.push({ inline_data: { mime_type: imageFile.type, data: base64 } });
        }

        const res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ contents: [{ parts }] }),
        });

        if (!res.ok) throw new Error('Gemini API request failed');
        const data = await res.json();
        responseText = data.candidates?.[0]?.content?.parts?.[0]?.text || 'No response generated.';
      }

      const assistantMessage: Message = {
        role: 'assistant',
        content: responseText,
        timestamp: Date.now(),
      };
      setMessages(prev => [...prev, assistantMessage]);
      setImageFile(null);
      setImagePreview(null);
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Generation failed');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      generateResponse();
    }
  };

  const copyMessage = (content: string) => {
    navigator.clipboard.writeText(content);
    toast.success('Copied!');
  };

  const clearMessages = () => {
    setMessages([]);
    toast.success('Cleared');
  };

  const currentTool = tools.find(t => t.id === activeTool)!;

  return (
    <div className="flex h-screen bg-black text-white overflow-hidden">
      {/* Dynamic Sidebar */}
      <aside
        className="h-full border-r border-white/[0.06] bg-[#0a0a0a] flex flex-col shrink-0 transition-[width] duration-300 ease-in-out"
        style={{ width: sidebarCollapsed ? '68px' : '240px' }}
      >
        {/* Sidebar Header */}
        <div className="p-4 border-b border-white/[0.06] flex items-center gap-3 min-h-[60px]">
          <div className="w-8 h-8 rounded-lg bg-white/[0.06] flex items-center justify-center shrink-0">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          {!sidebarCollapsed && (
            <div className="overflow-hidden whitespace-nowrap">
              <p className="text-sm font-semibold text-white truncate">Gemini AI</p>
              <p className="text-[10px] text-white/30 truncate">Google AI Studio</p>
            </div>
          )}
        </div>

        {/* Tool Navigation */}
        <nav className="flex-1 py-3 px-2 space-y-1 overflow-y-auto">
          {tools.map((tool) => {
            const isActive = activeTool === tool.id;
            return (
              <button
                key={tool.id}
                onClick={() => handleToolChange(tool.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group relative
                  ${isActive ? 'bg-white/[0.08]' : 'hover:bg-white/[0.04]'}`}
                title={sidebarCollapsed ? tool.label : undefined}
              >
                {isActive && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full bg-white" />
                )}
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-all duration-200
                  ${isActive ? 'bg-white/[0.1] text-white' : 'text-white/30 group-hover:text-white/60'}`}>
                  <tool.icon />
                </div>
                {!sidebarCollapsed && (
                  <span className={`text-[13px] font-medium truncate transition-colors ${isActive ? 'text-white' : 'text-white/40 group-hover:text-white/70'}`}>
                    {tool.label}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Sidebar Collapse Toggle */}
        <div className="p-3 border-t border-white/[0.06]">
          <button
            type="button"
            onClick={() => setSidebarCollapsed(prev => !prev)}
            className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-white/30 hover:text-white hover:bg-white/[0.06] transition-all text-xs cursor-pointer select-none"
          >
            {sidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <><ChevronLeft className="w-4 h-4" /><span className="font-medium">Collapse</span></>}
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col overflow-hidden min-w-0">
        {/* Top Bar */}
        <header className="h-14 border-b border-white/[0.06] flex items-center justify-between px-6 shrink-0 bg-black/80 backdrop-blur-sm">
          <div className="flex items-center gap-4">
            <Link to="/ai" className="flex items-center gap-1.5 text-white/30 hover:text-white transition-colors">
              <ArrowLeft className="w-3.5 h-3.5" />
              <span className="text-[11px] font-medium tracking-wide">Back</span>
            </Link>
            <div className="w-px h-4 bg-white/[0.08]" />
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-white" />
              <h1 className="text-sm font-semibold text-white">{currentTool.label}</h1>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Select value={selectedModel} onValueChange={setSelectedModel}>
              <SelectTrigger className="bg-white/[0.03] border-white/[0.08] text-white/80 rounded-lg h-8 text-xs w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[#111] border-white/[0.1] rounded-xl">
                <SelectItem value="gemini-2.5-pro" className="text-white/80 text-xs">Gemini 2.5 Pro</SelectItem>
                <SelectItem value="gemini-2.5-flash" className="text-white/80 text-xs">Gemini 2.5 Flash</SelectItem>
                <SelectItem value="gemini-2.5-flash-lite" className="text-white/80 text-xs">Gemini 2.5 Flash Lite</SelectItem>
              </SelectContent>
            </Select>
            {messages.length > 0 && (
              <Button variant="ghost" size="sm" onClick={clearMessages} className="text-white/30 hover:text-white h-8 w-8 p-0">
                <Trash2 className="w-3.5 h-3.5" />
              </Button>
            )}
          </div>
        </header>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full px-6">
              <div className="w-16 h-16 rounded-2xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center mb-6">
                <currentTool.icon />
              </div>
              <h2 className="text-xl font-semibold text-white mb-2">{currentTool.label}</h2>
              <p className="text-white/30 text-sm text-center max-w-md">{currentTool.description}</p>
              <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-3 max-w-lg w-full">
                {activeTool === 'chat' && (
                  <>
                    <button onClick={() => setInput('Explain quantum computing in simple terms')} className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06] text-left hover:bg-white/[0.04] transition-all">
                      <p className="text-xs text-white/60">Explain quantum computing</p>
                    </button>
                    <button onClick={() => setInput('Write a haiku about technology')} className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06] text-left hover:bg-white/[0.04] transition-all">
                      <p className="text-xs text-white/60">Write a haiku about tech</p>
                    </button>
                  </>
                )}
                {activeTool === 'code' && (
                  <>
                    <button onClick={() => setInput('Write a React hook for debouncing')} className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06] text-left hover:bg-white/[0.04] transition-all">
                      <p className="text-xs text-white/60">React debounce hook</p>
                    </button>
                    <button onClick={() => setInput('Implement a binary search in TypeScript')} className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06] text-left hover:bg-white/[0.04] transition-all">
                      <p className="text-xs text-white/60">Binary search in TS</p>
                    </button>
                  </>
                )}
                {activeTool === 'reasoning' && (
                  <>
                    <button onClick={() => setInput('If all roses are flowers and some flowers fade quickly, can we conclude that some roses fade quickly?')} className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06] text-left hover:bg-white/[0.04] transition-all">
                      <p className="text-xs text-white/60">Logic puzzle</p>
                    </button>
                    <button onClick={() => setInput('Analyze the trolley problem from multiple ethical frameworks')} className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06] text-left hover:bg-white/[0.04] transition-all">
                      <p className="text-xs text-white/60">Ethical analysis</p>
                    </button>
                  </>
                )}
                {activeTool === 'vision' && (
                  <div className="col-span-2 text-center">
                    <p className="text-xs text-white/40">Upload an image to analyze</p>
                  </div>
                )}
                {activeTool === 'imagegen' && (
                  <>
                    <button onClick={() => setInput('A serene Japanese garden at sunset with cherry blossoms')} className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06] text-left hover:bg-white/[0.04] transition-all">
                      <p className="text-xs text-white/60">Japanese garden sunset</p>
                    </button>
                    <button onClick={() => setInput('Futuristic city skyline with flying cars')} className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06] text-left hover:bg-white/[0.04] transition-all">
                      <p className="text-xs text-white/60">Futuristic city</p>
                    </button>
                  </>
                )}
                {activeTool === 'search' && (
                  <>
                    <button onClick={() => setInput('What are the latest developments in AI in 2026?')} className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06] text-left hover:bg-white/[0.04] transition-all">
                      <p className="text-xs text-white/60">Latest AI developments</p>
                    </button>
                    <button onClick={() => setInput('Compare the top programming languages in 2026')} className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06] text-left hover:bg-white/[0.04] transition-all">
                      <p className="text-xs text-white/60">Top languages 2026</p>
                    </button>
                  </>
                )}
              </div>
            </div>
          ) : (
            <div className="p-6 space-y-6 max-w-4xl mx-auto">
              {messages.map((msg, i) => (
                <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] ${msg.role === 'user' ? 'order-1' : ''}`}>
                    {msg.image && (
                      <img src={msg.image} alt="Uploaded" className="max-w-[200px] rounded-lg mb-2 border border-white/[0.08]" />
                    )}
                    <div className={`p-4 rounded-2xl ${msg.role === 'user' ? 'bg-white/[0.08] border border-white/[0.1]' : 'bg-white/[0.03] border border-white/[0.06]'}`}>
                      <p className="text-sm text-white/80 whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                    </div>
                    <div className="flex items-center gap-1 mt-1 px-1">
                      <span className="text-[10px] text-white/20">{new Date(msg.timestamp).toLocaleTimeString()}</span>
                      {msg.role === 'assistant' && (
                        <button onClick={() => copyMessage(msg.content)} className="p-1 rounded text-white/20 hover:text-white/60 transition-colors">
                          <Copy className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              {isGenerating && (
                <div className="flex gap-3">
                  <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.06]">
                    <Loader2 className="w-4 h-4 animate-spin text-white/40" />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="border-t border-white/[0.06] p-4 bg-black/80 backdrop-blur-sm">
          <div className="max-w-4xl mx-auto">
            {imagePreview && (
              <div className="mb-3 flex items-center gap-2">
                <img src={imagePreview} alt="Preview" className="w-12 h-12 rounded-lg object-cover border border-white/[0.1]" />
                <button onClick={() => { setImageFile(null); setImagePreview(null); }} className="text-xs text-white/30 hover:text-white">Remove</button>
              </div>
            )}
            <div className="flex items-end gap-3">
              {(activeTool === 'vision' || activeTool === 'imagegen') && (
                <>
                  <Button variant="ghost" size="sm" onClick={() => fileInputRef.current?.click()} className="text-white/30 hover:text-white h-10 w-10 p-0 shrink-0">
                    <Image className="w-4 h-4" />
                  </Button>
                  <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                </>
              )}
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={activeTool === 'vision' ? 'Describe what you want to know about the image...' : 'Type your message...'}
                className="flex-1 min-h-[44px] max-h-[200px] bg-white/[0.03] border-white/[0.08] text-white/90 placeholder:text-white/20 resize-none focus:border-white/30 rounded-xl text-sm"
                rows={1}
              />
              <Button
                onClick={generateResponse}
                disabled={isGenerating || (!input.trim() && !imageFile)}
                className="bg-white hover:bg-white/90 text-black font-semibold rounded-xl h-10 w-10 p-0 shrink-0"
              >
                {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default GeminiAI;