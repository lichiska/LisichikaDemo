import { Link } from 'react-router-dom';
import { ArrowLeft, Sparkles } from 'lucide-react';

// Minimalist monochrome tool icons
const ChatIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" className="w-7 h-7" stroke="currentColor" strokeWidth="1.5">
    <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2v10z" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const EditorIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" className="w-7 h-7" stroke="currentColor" strokeWidth="1.5">
    <path d="M15.5 2H8.6c-.4 0-.8.2-1.1.5l-5 5c-.3.3-.5.7-.5 1.1v12.8c0 .8.7 1.6 1.6 1.6h12.8c.9 0 1.6-.7 1.6-1.6V3.6c0-.9-.7-1.6-1.6-1.6z" strokeLinecap="round"/>
    <path d="M14 2v6h6M10 12l-2 6 6-2 7-7-4-4-7 7z" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const ImageIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" className="w-7 h-7" stroke="currentColor" strokeWidth="1.5">
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" strokeLinecap="round"/>
    <circle cx="8.5" cy="8.5" r="1.5" fill="currentColor"/>
    <path d="M21 15l-5-5L5 21" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const WritingIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" className="w-7 h-7" stroke="currentColor" strokeWidth="1.5">
    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" strokeLinecap="round"/>
    <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" strokeLinecap="round"/>
  </svg>
);

const WorldIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" className="w-7 h-7" stroke="currentColor" strokeWidth="1.5">
    <circle cx="12" cy="12" r="10"/>
    <path d="M2 12h20M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" strokeLinecap="round"/>
  </svg>
);

const AudioIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" className="w-7 h-7" stroke="currentColor" strokeWidth="1.5">
    <path d="M2 10v4M6 6v12M10 3v18M14 8v8M18 5v14M22 9v6" strokeLinecap="round"/>
  </svg>
);

const GeminiIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" className="w-7 h-7" stroke="currentColor" strokeWidth="1.5">
    <path d="M12 2L2 7l10 5 10-5-10-5z" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M2 17l10 5 10-5M2 12l10 5 10-5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const MusicIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" className="w-7 h-7" stroke="currentColor" strokeWidth="1.5">
    <path d="M9 18V5l12-2v13" strokeLinecap="round" strokeLinejoin="round"/>
    <circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>
  </svg>
);

const tools = [
  {
    id: 'chat',
    title: 'AI Chat',
    description: 'Chat with 350+ AI models including GPT-4, Claude, Gemini, and more.',
    icon: ChatIcon,
    link: '/ai/chat',
    badge: 'Most Popular',
  },
  {
    id: 'gemini',
    title: 'Gemini AI',
    description: 'Google\'s most capable AI. Text, code, vision, image generation, reasoning, and search.',
    icon: GeminiIcon,
    link: '/ai/gemini',
    badge: 'Full Suite',
  },
  {
    id: 'editor',
    title: 'Video Editor',
    description: 'Edit videos in your browser with OpenCut — free, open-source video editor.',
    icon: EditorIcon,
    link: '/ai/editor',
    badge: 'Free',
  },
  {
    id: 'elevenlabs',
    title: 'ElevenLabs Audio',
    description: 'Speech synthesis, voice cloning, sound effects, music, transcription, and dubbing.',
    icon: AudioIcon,
    link: '/ai/elevenlabs',
    badge: '8 Tools',
  },
  {
    id: 'image',
    title: 'Image Generation',
    description: 'Generate images, concept art, character designs using state-of-the-art AI models.',
    icon: ImageIcon,
    link: '/ai/chat',
    badge: 'Via Chat',
  },
  {
    id: 'writing',
    title: 'Script Writing',
    description: 'Write dialogue, screenplays, story outlines with AI creative writing assistance.',
    icon: WritingIcon,
    link: '/ai/chat',
    badge: 'Via Chat',
  },
  {
    id: 'worldbuilding',
    title: 'World Building',
    description: 'Design immersive universes with their own rules, geography, and cultures.',
    icon: WorldIcon,
    link: '/ai/chat',
    badge: 'Via Chat',
  },
  {
    id: 'music',
    title: 'Music & Sound',
    description: 'Compose background music, sound effects, and audio landscapes for your projects.',
    icon: MusicIcon,
    link: '/ai/elevenlabs',
    badge: 'Via ElevenLabs',
  },
];

const AIHub = () => {
  return (
    <div className="min-h-screen bg-black text-white overflow-x-hidden">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-black/80 backdrop-blur-xl border-b border-white/[0.06]">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              to="/"
              className="flex items-center gap-2 text-white/40 hover:text-white transition-colors group"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
              <span className="text-sm font-medium">Home</span>
            </Link>
            <div className="w-px h-5 bg-white/[0.08]" />
            <span className="text-sm font-semibold text-white">AI Tools</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.08]">
            <span className="text-[11px] font-medium text-white/50">350+ Models • Free</span>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative z-10 pt-20 pb-12 px-6">
        <div className="max-w-5xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold leading-tight mb-4 tracking-tight">
            AI Tools
          </h1>
          <p className="text-white/30 text-lg max-w-xl mx-auto leading-relaxed">
            Everything you need to create. All free, all powered by cutting-edge AI.
          </p>
        </div>
      </section>

      {/* Tools Grid */}
      <section className="relative z-10 pb-20 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {tools.map((tool) => (
              <Link
                key={tool.id}
                to={tool.link}
                className="group relative p-6 rounded-2xl bg-white/[0.02] border border-white/[0.06] hover:border-white/[0.15] transition-all duration-300 hover:bg-white/[0.04] hover:-translate-y-0.5"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center text-white/60 group-hover:text-white group-hover:bg-white/[0.08] transition-all">
                    <tool.icon />
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-medium bg-white/[0.04] border border-white/[0.06] text-white/40">
                    {tool.badge}
                  </span>
                </div>

                <h3 className="text-base font-semibold mb-1.5 text-white/90">
                  {tool.title}
                </h3>
                <p className="text-white/30 text-sm leading-relaxed">
                  {tool.description}
                </p>

                {/* Arrow hint */}
                <div className="absolute bottom-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity text-white/30">
                  <Sparkles className="w-4 h-4" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/[0.04] py-6 px-6 relative z-10">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <Link to="/" className="text-xs text-white/20 hover:text-white/60 transition-colors">
            ← Home
          </Link>
          <p className="text-[11px] text-white/15">© 2026 Foxy Code</p>
        </div>
      </footer>
    </div>
  );
};

export default AIHub;