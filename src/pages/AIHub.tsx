import { Link } from 'react-router-dom';
import { MessageSquare, Scissors, Image, Sparkles, ArrowLeft, Zap, Bot, Wand2, Film, Music, FileText, Globe, AudioLines } from 'lucide-react';

const IMAGES = {
  mascot: 'https://mgx-backend-cdn.metadl.com/generate/images/1498224/2026-08-01/ttjdxryaajqq/mascot-foxy-artist-2026.png',
  aiBrain: 'https://mgx-backend-cdn.metadl.com/generate/images/1498224/2026-08-01/ttjdyyicajrq/ai-creative-brain-2026.png',
};

const tools = [
  {
    id: 'chat',
    title: 'AI Chat',
    description: 'Chat with 350+ AI models including GPT-4, Claude, Gemini, and more. Brainstorm ideas, write scripts, get creative help.',
    icon: MessageSquare,
    color: 'from-purple-500 to-indigo-600',
    borderColor: 'hover:border-purple-500/40',
    bgGlow: 'group-hover:shadow-purple-500/10',
    iconBg: 'bg-purple-500/15',
    iconColor: 'text-purple-400',
    link: '/ai/chat',
    badge: 'Most Popular',
    badgeColor: 'bg-purple-500/20 text-purple-300',
  },
  {
    id: 'editor',
    title: 'Video Editor',
    description: 'Edit videos right in your browser with OpenCut — a powerful, free, open-source video editor for creators.',
    icon: Scissors,
    color: 'from-pink-500 to-rose-600',
    borderColor: 'hover:border-pink-500/40',
    bgGlow: 'group-hover:shadow-pink-500/10',
    iconBg: 'bg-pink-500/15',
    iconColor: 'text-pink-400',
    link: '/ai/editor',
    badge: 'Free & Open Source',
    badgeColor: 'bg-pink-500/20 text-pink-300',
  },
  {
    id: 'image',
    title: 'Image Generation',
    description: 'Generate stunning images, concept art, character designs, and backgrounds using state-of-the-art AI models.',
    icon: Image,
    color: 'from-orange-500 to-amber-600',
    borderColor: 'hover:border-orange-500/40',
    bgGlow: 'group-hover:shadow-orange-500/10',
    iconBg: 'bg-orange-500/15',
    iconColor: 'text-orange-400',
    link: '/ai/chat',
    badge: 'Via AI Chat',
    badgeColor: 'bg-orange-500/20 text-orange-300',
  },
  {
    id: 'writing',
    title: 'Script Writing',
    description: 'Write dialogue, screenplays, story outlines, and character backstories with AI-powered creative writing assistance.',
    icon: FileText,
    color: 'from-cyan-500 to-teal-600',
    borderColor: 'hover:border-cyan-500/40',
    bgGlow: 'group-hover:shadow-cyan-500/10',
    iconBg: 'bg-cyan-500/15',
    iconColor: 'text-cyan-400',
    link: '/ai/chat',
    badge: 'Via AI Chat',
    badgeColor: 'bg-cyan-500/20 text-cyan-300',
  },
  {
    id: 'worldbuilding',
    title: 'World Building',
    description: 'Design immersive universes with their own rules, geography, cultures, and lore. Let AI help expand your creative vision.',
    icon: Globe,
    color: 'from-emerald-500 to-green-600',
    borderColor: 'hover:border-emerald-500/40',
    bgGlow: 'group-hover:shadow-emerald-500/10',
    iconBg: 'bg-emerald-500/15',
    iconColor: 'text-emerald-400',
    link: '/ai/chat',
    badge: 'Via AI Chat',
    badgeColor: 'bg-emerald-500/20 text-emerald-300',
  },
  {
    id: 'elevenlabs',
    title: 'ElevenLabs AI Audio',
    description: 'Generate lifelike speech in 29+ languages, clone voices, create sound effects, and transcribe audio with ElevenLabs.',
    icon: AudioLines,
    color: 'from-blue-500 to-cyan-600',
    borderColor: 'hover:border-blue-500/40',
    bgGlow: 'group-hover:shadow-blue-500/10',
    iconBg: 'bg-blue-500/15',
    iconColor: 'text-blue-400',
    link: '/ai/elevenlabs',
    badge: 'New',
    badgeColor: 'bg-blue-500/20 text-blue-300',
  },
  {
    id: 'music',
    title: 'Music & Sound',
    description: 'Compose background music, sound effects, and audio landscapes for your animations and creative projects.',
    icon: Music,
    color: 'from-violet-500 to-purple-600',
    borderColor: 'hover:border-violet-500/40',
    bgGlow: 'group-hover:shadow-violet-500/10',
    iconBg: 'bg-violet-500/15',
    iconColor: 'text-violet-400',
    link: '/ai/chat',
    badge: 'Coming Soon',
    badgeColor: 'bg-violet-500/20 text-violet-300',
  },
];

const AIHub = () => {
  return (
    <div className="min-h-screen bg-[#060411] text-white overflow-x-hidden">
      {/* Background effects */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full blur-[200px] opacity-10 bg-purple-600" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] rounded-full blur-[180px] opacity-10 bg-indigo-600" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full blur-[150px] opacity-5 bg-pink-500" />
      </div>

      {/* Subtle AI brain background */}
      <div className="fixed inset-0 pointer-events-none z-0 opacity-[0.03]">
        <img src={IMAGES.aiBrain} alt="" className="w-full h-full object-cover" />
      </div>

      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-[#060411]/80 backdrop-blur-xl border-b border-white/[0.04]">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              to="/"
              className="flex items-center gap-2 text-white/50 hover:text-white transition-colors group"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
              <span className="text-sm font-medium">Back to Home</span>
            </Link>
            <div className="w-px h-5 bg-white/10" />
            <div className="flex items-center gap-2.5">
              <img src={IMAGES.mascot} alt="Foxy" className="w-7 h-7 object-contain" />
              <span className="font-bold text-base" style={{ fontFamily: 'Fredoka' }}>
                <span className="text-orange-400">Foxy</span>{' '}
                <span className="text-white/80">AI Tools</span>
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20">
            <Zap className="w-3.5 h-3.5 text-purple-400" />
            <span className="text-xs font-bold text-purple-300">350+ Models • Free</span>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative z-10 pt-16 pb-8 px-6">
        <div className="max-w-6xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/[0.04] border border-white/[0.08] mb-8">
            <Bot className="w-4 h-4 text-purple-400" />
            <span className="text-sm text-white/60 font-medium">Powered by AI • Built for Creators</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-black leading-[0.9] mb-6" style={{ fontFamily: 'Fredoka' }}>
            <span className="text-white">Choose your </span>
            <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-orange-400 bg-clip-text text-transparent">
              creative tool.
            </span>
          </h1>
          <p className="text-white/40 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
            Everything you need to bring your animations to life — from brainstorming to final cut.
            All free, all powered by cutting-edge AI.
          </p>
        </div>
      </section>

      {/* Tools Grid */}
      <section className="relative z-10 py-12 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {tools.map((tool) => (
              <Link
                key={tool.id}
                to={tool.link}
                className={`group relative p-7 rounded-2xl bg-white/[0.02] border border-white/[0.06] ${tool.borderColor} transition-all duration-500 hover:bg-white/[0.04] hover:shadow-2xl ${tool.bgGlow} hover:-translate-y-1`}
              >
                {/* Badge */}
                <div className="flex items-center justify-between mb-5">
                  <div className={`w-14 h-14 rounded-xl ${tool.iconBg} flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}>
                    <tool.icon className={`w-7 h-7 ${tool.iconColor}`} />
                  </div>
                  <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide ${tool.badgeColor}`}>
                    {tool.badge}
                  </span>
                </div>

                <h3 className="text-xl font-bold mb-2.5" style={{ fontFamily: 'Fredoka' }}>
                  {tool.title}
                </h3>
                <p className="text-white/35 text-sm leading-relaxed mb-5">
                  {tool.description}
                </p>

                {/* Action hint */}
                <div className="flex items-center gap-2 text-xs font-medium text-white/30 group-hover:text-white/60 transition-colors">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Click to open</span>
                  <span className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity">→</span>
                </div>

                {/* Gradient border glow on hover */}
                <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${tool.color} opacity-0 group-hover:opacity-[0.03] transition-opacity duration-500 pointer-events-none`} />
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Bottom info */}
      <section className="relative z-10 py-16 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="rounded-2xl bg-white/[0.02] border border-white/[0.06] p-8 md:p-12 text-center">
            <Wand2 className="w-8 h-8 text-orange-400 mx-auto mb-4" />
            <h3 className="text-2xl font-bold mb-3" style={{ fontFamily: 'Fredoka' }}>
              More tools coming soon
            </h3>
            <p className="text-white/35 max-w-lg mx-auto text-sm leading-relaxed">
              We're constantly building new AI-powered tools for animators, storytellers, and creators.
              Subscribe to our YouTube to stay updated on new releases.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/[0.04] py-8 px-6 relative z-10">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link to="/" className="text-xs text-white/30 hover:text-orange-400 transition-colors font-medium">
            ← Back to Foxy Code
          </Link>
          <p className="text-[11px] text-white/20">© 2026 Foxy Code Animation Studio</p>
        </div>
      </footer>
    </div>
  );
};

export default AIHub;