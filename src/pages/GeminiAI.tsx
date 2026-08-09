import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Send, Loader2, Sparkles, ChevronLeft, Copy, Trash2, Menu, Paperclip, X, FileText, Film, Image } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

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

interface UploadedFile {
  file: File;
  preview: string | null;
  type: 'image' | 'video' | 'file';
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
  image?: string;
  files?: { name: string; type: string; preview?: string }[];
  timestamp: number;
}

const GeminiAI = () => {
  const [activeTool, setActiveTool] = useState<ToolId>('chat');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedModel, setSelectedModel] = useState('gemini-2.5-flash');
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
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
    setUploadedFiles([]);
    if (window.innerWidth < 768) {
      setSidebarOpen(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newFiles: UploadedFile[] = [];
    Array.from(files).forEach(file => {
      const isImage = file.type.startsWith('image/');
      const isVideo = file.type.startsWith('video/');
      const fileType: 'image' | 'video' | 'file' = isImage ? 'image' : isVideo ? 'video' : 'file';

      if (isImage) {
        const reader = new FileReader();
        reader.onload = () => {
          setUploadedFiles(prev => [...prev, { file, preview: reader.result as string, type: fileType }]);
        };
        reader.readAsDataURL(file);
      } else if (isVideo) {
        const url = URL.createObjectURL(file);
        setUploadedFiles(prev => [...prev, { file, preview: url, type: fileType }]);
      } else {
        newFiles.push({ file, preview: null, type: fileType });
      }
    });

    if (newFiles.length > 0) {
      setUploadedFiles(prev => [...prev, ...newFiles]);
    }

    e.target.value = '';
  };

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const generateResponse = async () => {
    if (!input.trim() && uploadedFiles.length === 0) { toast.error('Enter a message or upload a file.'); return; }
    if (!GEMINI_API_KEY) { toast.error('Gemini API key not configured. Set VITE_GEMINI_API_KEY in your environment.'); return; }
    setIsGenerating(true);

    const userMessage: Message = {
      role: 'user',
      content: input,
      image: uploadedFiles.find(f => f.type === 'image')?.preview || undefined,
      files: uploadedFiles.map(f => ({ name: f.file.name, type: f.file.type, preview: f.type === 'image' ? f.preview || undefined : undefined })),
      timestamp: Date.now(),
    };
    setMessages(prev => [...prev, userMessage]);
    setInput('');

    try {
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

      // Direct Gemini API call only
      const url = `${GEMINI_API_BASE}/models/${selectedModel}:generateContent?key=${GEMINI_API_KEY}`;
      const parts: Array<{ text: string } | { inline_data: { mime_type: string; data: string } }> = [];

      if (systemPrompt) parts.push({ text: systemPrompt });

      // Add conversation history for context
      for (const msg of messages) {
        parts.push({ text: `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}` });
      }

      if (input.trim()) parts.push({ text: `User: ${input}` });

      // Add all uploaded files as inline data
      for (const uploaded of uploadedFiles) {
        if (uploaded.type === 'image' && uploaded.preview) {
          const base64 = uploaded.preview.split(',')[1];
          parts.push({ inline_data: { mime_type: uploaded.file.type, data: base64 } });
        } else if (uploaded.type === 'video') {
          const base64 = await fileToBase64(uploaded.file);
          parts.push({ inline_data: { mime_type: uploaded.file.type, data: base64 } });
        } else {
          try {
            const text = await uploaded.file.text();
            parts.push({ text: `[File: ${uploaded.file.name}]\n${text}` });
          } catch {
            parts.push({ text: `[File: ${uploaded.file.name}] (binary file, cannot read as text)` });
          }
        }
      }

      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts }] }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => null);
        throw new Error(errData?.error?.message || `Gemini API request failed (${res.status})`);
      }
      const data = await res.json();
      const responseText = data.candidates?.[0]?.content?.parts?.[0]?.text || 'No response generated.';

      const assistantMessage: Message = {
        role: 'assistant',
        content: responseText,
        timestamp: Date.now(),
      };
      setMessages(prev => [...prev, assistantMessage]);
      setUploadedFiles([]);
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
    <div className="flex h-screen bg-white text-black overflow-hidden relative">
      {/* Mobile overlay when sidebar is open */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/20 z-30 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Dynamic Sidebar - closed by default */}
      <aside
        className={`h-full border-r border-black/[0.06] bg-gray-50 flex flex-col shrink-0 transition-all duration-300 ease-in-out z-40
          ${sidebarOpen ? 'w-[240px] translate-x-0' : 'w-0 -translate-x-full md:w-[68px] md:translate-x-0'}
          fixed md:relative`}
      >
        {/* Sidebar Header */}
        <div className="p-4 border-b border-black/[0.06] flex items-center gap-3 min-h-[60px]">
          <div className="w-8 h-8 rounded-lg bg-black/[0.04] flex items-center justify-center shrink-0">
            <Sparkles className="w-4 h-4 text-black" />
          </div>
          {sidebarOpen && (
            <div className="overflow-hidden whitespace-nowrap">
              <p className="text-sm font-semibold text-black truncate">Gemini AI</p>
              <p className="text-[10px] text-black/30 truncate">Google AI Studio</p>
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
                  ${isActive ? 'bg-black/[0.06]' : 'hover:bg-black/[0.03]'}`}
                title={!sidebarOpen ? tool.label : undefined}
              >
                {isActive && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full bg-black" />
                )}
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-all duration-200
                  ${isActive ? 'bg-black/[0.08] text-black' : 'text-black/30 group-hover:text-black/60'}`}>
                  <tool.icon />
                </div>
                {sidebarOpen && (
                  <span className={`text-[13px] font-medium truncate transition-colors ${isActive ? 'text-black' : 'text-black/40 group-hover:text-black/70'}`}>
                    {tool.label}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Sidebar Close Button */}
        {sidebarOpen && (
          <div className="p-3 border-t border-black/[0.06]">
            <button
              type="button"
              onClick={() => setSidebarOpen(false)}
              className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-black/30 hover:text-black hover:bg-black/[0.04] transition-all text-xs cursor-pointer select-none"
            >
              <ChevronLeft className="w-4 h-4" /><span className="font-medium">Close</span>
            </button>
          </div>
        )}
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col overflow-hidden min-w-0">
        {/* Top Bar */}
        <header className="h-14 border-b border-black/[0.06] flex items-center justify-between px-4 md:px-6 shrink-0 bg-white/80 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="w-9 h-9 rounded-xl flex items-center justify-center text-black/40 hover:text-black hover:bg-black/[0.04] transition-all"
              title="Open menu"
            >
              <Menu className="w-5 h-5" />
            </button>
            <Link to="/ai" className="flex items-center gap-1.5 text-black/30 hover:text-black transition-colors">
              <ArrowLeft className="w-3.5 h-3.5" />
              <span className="text-[11px] font-medium tracking-wide hidden sm:inline">Back</span>
            </Link>
            <div className="w-px h-4 bg-black/[0.08]" />
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-black" />
              <h1 className="text-sm font-semibold text-black">{currentTool.label}</h1>
            </div>
          </div>
          <div className="flex items-center gap-2 md:gap-3">
            <Select value={selectedModel} onValueChange={setSelectedModel}>
              <SelectTrigger className="bg-black/[0.02] border-black/[0.08] text-black/80 rounded-lg h-8 text-xs w-[120px] md:w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-white border-black/[0.1] rounded-xl">
                <SelectItem value="gemini-2.5-pro" className="text-black/80 text-xs">Gemini 2.5 Pro</SelectItem>
                <SelectItem value="gemini-2.5-flash" className="text-black/80 text-xs">Gemini 2.5 Flash</SelectItem>
                <SelectItem value="gemini-2.5-flash-lite" className="text-black/80 text-xs">Gemini 2.5 Flash Lite</SelectItem>
              </SelectContent>
            </Select>
            {messages.length > 0 && (
              <Button variant="ghost" size="sm" onClick={clearMessages} className="text-black/30 hover:text-black h-8 w-8 p-0">
                <Trash2 className="w-3.5 h-3.5" />
              </Button>
            )}
          </div>
        </header>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full px-4 md:px-6">
              <div className="w-16 h-16 rounded-2xl bg-black/[0.03] border border-black/[0.08] flex items-center justify-center mb-6">
                <currentTool.icon />
              </div>
              <h2 className="text-xl font-semibold text-black mb-2">{currentTool.label}</h2>
              <p className="text-black/40 text-sm text-center max-w-md">{currentTool.description}</p>
              <p className="text-black/25 text-xs text-center mt-2">Upload images, videos, or files with your message</p>
              <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-3 max-w-lg w-full">
                {activeTool === 'chat' && (
                  <>
                    <button onClick={() => setInput('Explain quantum computing in simple terms')} className="p-3 rounded-xl bg-black/[0.02] border border-black/[0.06] text-left hover:bg-black/[0.04] transition-all">
                      <p className="text-xs text-black/60">Explain quantum computing</p>
                    </button>
                    <button onClick={() => setInput('Write a haiku about technology')} className="p-3 rounded-xl bg-black/[0.02] border border-black/[0.06] text-left hover:bg-black/[0.04] transition-all">
                      <p className="text-xs text-black/60">Write a haiku about tech</p>
                    </button>
                  </>
                )}
                {activeTool === 'code' && (
                  <>
                    <button onClick={() => setInput('Write a React hook for debouncing')} className="p-3 rounded-xl bg-black/[0.02] border border-black/[0.06] text-left hover:bg-black/[0.04] transition-all">
                      <p className="text-xs text-black/60">React debounce hook</p>
                    </button>
                    <button onClick={() => setInput('Implement a binary search in TypeScript')} className="p-3 rounded-xl bg-black/[0.02] border border-black/[0.06] text-left hover:bg-black/[0.04] transition-all">
                      <p className="text-xs text-black/60">Binary search in TS</p>
                    </button>
                  </>
                )}
                {activeTool === 'reasoning' && (
                  <>
                    <button onClick={() => setInput('If all roses are flowers and some flowers fade quickly, can we conclude that some roses fade quickly?')} className="p-3 rounded-xl bg-black/[0.02] border border-black/[0.06] text-left hover:bg-black/[0.04] transition-all">
                      <p className="text-xs text-black/60">Logic puzzle</p>
                    </button>
                    <button onClick={() => setInput('Analyze the trolley problem from multiple ethical frameworks')} className="p-3 rounded-xl bg-black/[0.02] border border-black/[0.06] text-left hover:bg-black/[0.04] transition-all">
                      <p className="text-xs text-black/60">Ethical analysis</p>
                    </button>
                  </>
                )}
                {activeTool === 'vision' && (
                  <div className="col-span-2 text-center">
                    <p className="text-xs text-black/40">Upload an image to analyze</p>
                  </div>
                )}
                {activeTool === 'imagegen' && (
                  <>
                    <button onClick={() => setInput('A serene Japanese garden at sunset with cherry blossoms')} className="p-3 rounded-xl bg-black/[0.02] border border-black/[0.06] text-left hover:bg-black/[0.04] transition-all">
                      <p className="text-xs text-black/60">Japanese garden sunset</p>
                    </button>
                    <button onClick={() => setInput('Futuristic city skyline with flying cars')} className="p-3 rounded-xl bg-black/[0.02] border border-black/[0.06] text-left hover:bg-black/[0.04] transition-all">
                      <p className="text-xs text-black/60">Futuristic city</p>
                    </button>
                  </>
                )}
                {activeTool === 'search' && (
                  <>
                    <button onClick={() => setInput('What are the latest developments in AI in 2026?')} className="p-3 rounded-xl bg-black/[0.02] border border-black/[0.06] text-left hover:bg-black/[0.04] transition-all">
                      <p className="text-xs text-black/60">Latest AI developments</p>
                    </button>
                    <button onClick={() => setInput('Compare the top programming languages in 2026')} className="p-3 rounded-xl bg-black/[0.02] border border-black/[0.06] text-left hover:bg-black/[0.04] transition-all">
                      <p className="text-xs text-black/60">Top languages 2026</p>
                    </button>
                  </>
                )}
              </div>
            </div>
          ) : (
            <div className="p-4 md:p-6 space-y-6 max-w-4xl mx-auto">
              {messages.map((msg, i) => (
                <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] md:max-w-[80%] ${msg.role === 'user' ? 'order-1' : ''}`}>
                    {msg.image && (
                      <img src={msg.image} alt="Uploaded" className="max-w-[200px] rounded-lg mb-2 border border-black/[0.08]" />
                    )}
                    {msg.files && msg.files.length > 0 && !msg.image && (
                      <div className="flex flex-wrap gap-2 mb-2">
                        {msg.files.map((f, fi) => (
                          <div key={fi} className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-black/[0.03] border border-black/[0.08] text-[10px] text-black/50">
                            {f.type.startsWith('image') ? <Image className="w-3 h-3" /> : f.type.startsWith('video') ? <Film className="w-3 h-3" /> : <FileText className="w-3 h-3" />}
                            <span className="truncate max-w-[100px]">{f.name}</span>
                          </div>
                        ))}
                      </div>
                    )}
                    <div className={`p-4 rounded-2xl ${msg.role === 'user' ? 'bg-black/[0.06] border border-black/[0.08]' : 'bg-black/[0.02] border border-black/[0.06]'}`}>
                      <p className="text-sm text-black/80 whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                    </div>
                    <div className="flex items-center gap-1 mt-1 px-1">
                      <span className="text-[10px] text-black/25">{new Date(msg.timestamp).toLocaleTimeString()}</span>
                      {msg.role === 'assistant' && (
                        <button onClick={() => copyMessage(msg.content)} className="p-1 rounded text-black/20 hover:text-black/60 transition-colors">
                          <Copy className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              {isGenerating && (
                <div className="flex gap-3">
                  <div className="p-4 rounded-2xl bg-black/[0.02] border border-black/[0.06]">
                    <Loader2 className="w-4 h-4 animate-spin text-black/40" />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="border-t border-black/[0.06] p-3 md:p-4 bg-white/80 backdrop-blur-sm">
          <div className="max-w-4xl mx-auto">
            {/* File previews */}
            {uploadedFiles.length > 0 && (
              <div className="mb-3 flex flex-wrap gap-2">
                {uploadedFiles.map((uploaded, index) => (
                  <div key={index} className="relative group">
                    {uploaded.type === 'image' && uploaded.preview ? (
                      <img src={uploaded.preview} alt="Preview" className="w-14 h-14 rounded-lg object-cover border border-black/[0.1]" />
                    ) : uploaded.type === 'video' ? (
                      <div className="w-14 h-14 rounded-lg bg-black/[0.03] border border-black/[0.1] flex flex-col items-center justify-center">
                        <Film className="w-4 h-4 text-black/40" />
                        <span className="text-[8px] text-black/30 mt-0.5 truncate max-w-[48px]">{uploaded.file.name.split('.').pop()}</span>
                      </div>
                    ) : (
                      <div className="w-14 h-14 rounded-lg bg-black/[0.03] border border-black/[0.1] flex flex-col items-center justify-center">
                        <FileText className="w-4 h-4 text-black/40" />
                        <span className="text-[8px] text-black/30 mt-0.5 truncate max-w-[48px]">{uploaded.file.name.split('.').pop()}</span>
                      </div>
                    )}
                    <button
                      onClick={() => removeFile(index)}
                      className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-black/10 border border-black/20 flex items-center justify-center text-black/60 hover:text-black hover:bg-black/20 transition-all opacity-0 group-hover:opacity-100"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
            <div className="flex items-end gap-2 md:gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                className="text-black/30 hover:text-black h-10 w-10 p-0 shrink-0 rounded-xl"
                title="Upload image, video, or file"
              >
                <Paperclip className="w-4 h-4" />
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,video/*,.pdf,.txt,.md,.json,.csv,.py,.js,.ts,.tsx,.jsx,.html,.css,.xml,.yaml,.yml,.doc,.docx,.xls,.xlsx"
                multiple
                className="hidden"
                onChange={handleFileUpload}
              />
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={activeTool === 'vision' ? 'Describe what you want to know about the image...' : 'Type your message...'}
                className="flex-1 min-h-[44px] max-h-[200px] bg-black/[0.02] border-black/[0.08] text-black/90 placeholder:text-black/25 resize-none focus:border-black/30 rounded-xl text-sm"
                rows={1}
              />
              <Button
                onClick={generateResponse}
                disabled={isGenerating || (!input.trim() && uploadedFiles.length === 0)}
                className="bg-black hover:bg-black/90 text-white font-semibold rounded-xl h-10 w-10 p-0 shrink-0"
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

// Helper to convert file to base64
function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      resolve(result.split(',')[1]);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default GeminiAI;