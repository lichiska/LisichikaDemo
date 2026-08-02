import { Link } from 'react-router-dom';
import { Play, Sparkles, Star, Heart, Film, Youtube, ExternalLink, Zap, ArrowRight, MessageSquare, Pencil, Clapperboard, Music, Wand2, Rocket, Globe, Palette, Camera } from 'lucide-react';
import { useEffect, useState, useRef } from 'react';

const IMAGES = {
  hero: 'https://mgx-backend-cdn.metadl.com/generate/images/1498224/2026-08-01/ttjdxeycajsa/hero-foxy-cosmic-world-2026.png',
  mascot: 'https://mgx-backend-cdn.metadl.com/generate/images/1498224/2026-08-01/ttjdxryaajqq/mascot-foxy-artist-2026.png',
  characters: 'https://mgx-backend-cdn.metadl.com/generate/images/1498224/2026-08-01/ttjdx6qcajta/characters-ensemble-cast-2026.png',
  studio: 'https://mgx-backend-cdn.metadl.com/generate/images/1498224/2026-08-01/ttjdylicajsa/studio-workspace-night-2026.png',
  aiBrain: 'https://mgx-backend-cdn.metadl.com/generate/images/1498224/2026-08-01/ttjdyyicajrq/ai-creative-brain-2026.png',
  youtube: 'https://mgx-backend-cdn.metadl.com/generate/images/1498224/2026-08-01/ttjdzfacajra/youtube-theater-clouds-2026.png',
  pattern: 'https://mgx-backend-cdn.metadl.com/generate/images/1498224/2026-08-01/ttjdzsacajqq/pattern-animation-tools-dark-2026.png',
  directing: 'https://mgx-backend-cdn.metadl.com/generate/images/1498224/2026-08-01/ttjdz6ycajta/behind-scenes-directing-2026.png',
};

const Landing = () => {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const heroRef = useRef<HTMLDivElement>(null);
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleMouse = (e: MouseEvent) => {
      if (heroRef.current) {
        const rect = heroRef.current.getBoundingClientRect();
        setMousePos({
          x: (e.clientX - rect.left) / rect.width,
          y: (e.clientY - rect.top) / rect.height,
        });
      }
    };
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('mousemove', handleMouse);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('mousemove', handleMouse);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <div className="min-h-screen bg-[#060411] text-white overflow-x-hidden">
      {/* Animated grain texture */}
      <div className="fixed inset-0 pointer-events-none z-[1] opacity-[0.025]" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
      }} />

      {/* Floating particles */}
      <div className="fixed inset-0 pointer-events-none z-[0] overflow-hidden">
        {Array.from({ length: 20 }).map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full animate-float-random"
            style={{
              width: `${Math.random() * 4 + 2}px`,
              height: `${Math.random() * 4 + 2}px`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              background: ['#f97316', '#a855f7', '#ec4899', '#06b6d4', '#facc15'][Math.floor(Math.random() * 5)],
              opacity: Math.random() * 0.4 + 0.1,
              animationDelay: `${Math.random() * 8}s`,
              animationDuration: `${Math.random() * 10 + 8}s`,
            }}
          />
        ))}
      </div>

      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-[#060411]/80 backdrop-blur-xl border-b border-white/[0.03]">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3 group cursor-pointer">
            <img
              src={IMAGES.mascot}
              alt="Foxy Code"
              className="w-10 h-10 object-contain group-hover:rotate-12 transition-transform duration-300"
            />
            <span className="text-xl font-bold tracking-tight" style={{ fontFamily: 'Fredoka' }}>
              <span className="text-orange-400 group-hover:text-orange-300 transition-colors">Foxy</span>{' '}
              <span className="text-white/90">Code</span>
            </span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <a href="#work" className="text-[13px] text-white/40 hover:text-orange-400 transition-colors tracking-wide uppercase font-medium">Work</a>
            <a href="#characters" className="text-[13px] text-white/40 hover:text-purple-400 transition-colors tracking-wide uppercase font-medium">Characters</a>
            <a href="#studio" className="text-[13px] text-white/40 hover:text-pink-400 transition-colors tracking-wide uppercase font-medium">Studio</a>
            <a href="#tools" className="text-[13px] text-white/40 hover:text-cyan-400 transition-colors tracking-wide uppercase font-medium">AI Tools</a>
          </div>
          <a
            href="https://youtube.com/@foxycodename?si=oHcwbVmcMGMz4Xqo"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-5 py-2.5 bg-red-600/90 hover:bg-red-500 rounded-xl text-sm font-bold transition-all hover:scale-105 hover:shadow-lg hover:shadow-red-500/20"
          >
            <Youtube className="w-4 h-4" />
            <span className="hidden sm:inline">Subscribe</span>
          </a>
        </div>
      </nav>

      {/* Hero Section */}
      <section ref={heroRef} className="relative pt-24 pb-0 min-h-[100vh] flex flex-col">
        {/* Multi-layer animated gradient */}
        <div
          className="absolute w-[800px] h-[800px] rounded-full blur-[200px] opacity-15 transition-all duration-[3000ms] ease-out pointer-events-none"
          style={{
            background: 'radial-gradient(circle, #f97316 0%, #a855f7 40%, #ec4899 70%, #06b6d4 100%)',
            left: `${mousePos.x * 50}%`,
            top: `${mousePos.y * 50}%`,
          }}
        />
        <div className="absolute top-20 right-0 w-[400px] h-[400px] rounded-full blur-[150px] opacity-10 bg-cyan-500 animate-pulse" />
        <div className="absolute bottom-20 left-0 w-[300px] h-[300px] rounded-full blur-[120px] opacity-10 bg-purple-600 animate-pulse" style={{ animationDelay: '2s' }} />

        <div className="relative flex-1 flex items-center max-w-7xl mx-auto w-full px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center w-full">
            {/* Left: Text */}
            <div className="z-10">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-500/10 border border-orange-500/20 mb-8 animate-slide-up">
                <Rocket className="w-3.5 h-3.5 text-orange-400" />
                <span className="text-xs font-bold text-orange-300 tracking-wide">2026 • NEW SEASON DROPPING</span>
              </div>
              <h1 className="text-[clamp(2.8rem,7vw,6rem)] font-black leading-[0.88] tracking-tight mb-8 animate-slide-up" style={{ fontFamily: 'Fredoka' }}>
                <span className="block text-white">We bring</span>
                <span className="block bg-gradient-to-r from-orange-400 via-pink-500 to-purple-500 bg-clip-text text-transparent animate-gradient-shift">
                  imagination
                </span>
                <span className="block text-white/30 text-[0.55em] mt-2">to life.</span>
              </h1>
              <p className="text-white/40 text-lg max-w-md leading-relaxed mb-10 animate-slide-up" style={{ animationDelay: '150ms' }}>
                Handcrafted cartoons, bold characters, and worlds you'll want to live in.
                Made with obsessive love by dreamers who refuse to grow up.
              </p>
              <div className="flex flex-wrap gap-4 animate-slide-up" style={{ animationDelay: '300ms' }}>
                <a
                  href="https://youtube.com/@foxycodename?si=oHcwbVmcMGMz4Xqo"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center gap-3 px-7 py-4 bg-gradient-to-r from-orange-500 to-pink-500 rounded-xl font-bold text-white hover:shadow-xl hover:shadow-orange-500/20 hover:scale-105 transition-all"
                >
                  <Play className="w-5 h-5" />
                  Watch Our Work
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </a>
                <Link
                  to="/ai"
                  className="flex items-center gap-3 px-7 py-4 bg-white/[0.05] border border-white/[0.1] rounded-xl font-bold text-white/80 hover:bg-white/[0.1] hover:border-white/[0.2] transition-all"
                >
                  <Sparkles className="w-5 h-5 text-purple-400" />
                  AI Tools
                </Link>
              </div>
            </div>

            {/* Right: Hero image with parallax */}
            <div className="relative animate-slide-up" style={{ animationDelay: '400ms' }}>
              <div className="relative rounded-3xl overflow-hidden border border-white/[0.08] shadow-2xl shadow-purple-500/10">
                <img
                  src={IMAGES.hero}
                  alt="Foxy Code magical animation world"
                  className="w-full h-[55vh] object-cover"
                  style={{ transform: `translateY(${scrollY * 0.05}px)` }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#060411] via-transparent to-[#060411]/20" />
                <div className="absolute inset-0 bg-gradient-to-r from-[#060411]/40 to-transparent" />
              </div>
              {/* Floating badge */}
              <div className="absolute -bottom-4 -left-4 px-4 py-2 bg-[#0d0a1a] border border-white/[0.1] rounded-xl shadow-xl flex items-center gap-2 animate-bounce-slow">
                <div className="w-2.5 h-2.5 rounded-full bg-green-400 animate-pulse" />
                <span className="text-xs font-medium text-white/70">New episodes weekly</span>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="flex justify-center py-8 animate-bounce-slow">
          <div className="w-6 h-10 rounded-full border-2 border-white/20 flex justify-center pt-2">
            <div className="w-1.5 h-3 rounded-full bg-orange-400/60 animate-scroll-dot" />
          </div>
        </div>
      </section>

      {/* Decorative divider with pattern */}
      <div className="relative h-32 overflow-hidden opacity-30">
        <img src={IMAGES.pattern} alt="" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#060411] via-transparent to-[#060411]" />
      </div>

      {/* What We Do */}
      <section id="work" className="relative py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr,1.6fr] gap-20 items-start">
            <div className="lg:sticky lg:top-32">
              <span className="text-orange-400/70 text-xs font-mono tracking-widest uppercase">What we do</span>
              <h2 className="text-5xl md:text-6xl font-bold mt-4 leading-[0.95]" style={{ fontFamily: 'Fredoka' }}>
                Stories worth<br />
                <span className="bg-gradient-to-r from-orange-400 to-yellow-400 bg-clip-text text-transparent">telling.</span>
              </h2>
              <p className="text-white/35 mt-6 leading-relaxed max-w-sm text-lg">
                We don't just animate — we build worlds. Every project starts with a story
                that matters.
              </p>
              {/* Behind the scenes image */}
              <div className="mt-8 rounded-2xl overflow-hidden border border-white/[0.06] hidden lg:block">
                <img
                  src={IMAGES.directing}
                  alt="Behind the scenes directing"
                  className="w-full h-48 object-cover hover:scale-105 transition-transform duration-700"
                />
              </div>
            </div>

            <div className="space-y-5">
              {[
                {
                  icon: Pencil,
                  title: 'Original Series',
                  desc: 'From concept to screen — original animated series with characters that have real depth, real flaws, and real heart.',
                  gradient: 'from-orange-500/20 to-yellow-500/10',
                  iconColor: 'text-orange-400',
                  borderColor: 'hover:border-orange-500/30',
                },
                {
                  icon: Clapperboard,
                  title: 'Short Films',
                  desc: "Bite-sized stories that pack an emotional punch. Perfect for festivals, social media, or just making someone's day.",
                  gradient: 'from-purple-500/20 to-blue-500/10',
                  iconColor: 'text-purple-400',
                  borderColor: 'hover:border-purple-500/30',
                },
                {
                  icon: Music,
                  title: 'Music & Sound Design',
                  desc: 'Custom soundtracks and sound design that breathe life into every scene. Great animation is heard as much as seen.',
                  gradient: 'from-pink-500/20 to-rose-500/10',
                  iconColor: 'text-pink-400',
                  borderColor: 'hover:border-pink-500/30',
                },
                {
                  icon: Wand2,
                  title: 'AI-Powered Workflows',
                  desc: 'We use AI as a creative accelerator — not a replacement. It helps us iterate faster while keeping the human magic.',
                  gradient: 'from-cyan-500/20 to-teal-500/10',
                  iconColor: 'text-cyan-400',
                  borderColor: 'hover:border-cyan-500/30',
                },
                {
                  icon: Globe,
                  title: 'World Building',
                  desc: 'Every story needs a universe. We craft immersive worlds with their own rules, history, and secrets to discover.',
                  gradient: 'from-emerald-500/20 to-green-500/10',
                  iconColor: 'text-emerald-400',
                  borderColor: 'hover:border-emerald-500/30',
                },
              ].map((item, i) => (
                <div
                  key={i}
                  className={`group relative p-7 rounded-2xl bg-gradient-to-br ${item.gradient} border border-white/[0.04] ${item.borderColor} transition-all duration-500 hover:translate-x-1`}
                >
                  <div className="flex items-start gap-5">
                    <div className="w-12 h-12 rounded-xl bg-white/[0.05] flex items-center justify-center flex-shrink-0 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                      <item.icon className={`w-5 h-5 ${item.iconColor}`} />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold mb-2" style={{ fontFamily: 'Fredoka' }}>{item.title}</h3>
                      <p className="text-white/40 text-sm leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Characters Section */}
      <section id="characters" className="relative py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-purple-400/70 text-xs font-mono tracking-widest uppercase">Meet the cast</span>
            <h2 className="text-5xl md:text-6xl font-bold mt-4" style={{ fontFamily: 'Fredoka' }}>
              Characters with <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">soul.</span>
            </h2>
            <p className="text-white/35 mt-4 max-w-lg mx-auto text-lg">
              We design characters you'd want as friends — each with their own quirks, dreams, and reasons to root for them.
            </p>
          </div>

          {/* Full-bleed character showcase */}
          <div className="relative rounded-3xl overflow-hidden border border-white/[0.06] group">
            <img
              src={IMAGES.characters}
              alt="Foxy Code character ensemble cast"
              className="w-full h-[65vh] object-cover group-hover:scale-[1.02] transition-transform duration-1000"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#060411] via-[#060411]/10 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#060411]/50 to-transparent" />
            
            <div className="absolute bottom-0 left-0 right-0 p-8 md:p-14">
              <div className="max-w-2xl">
                <div className="flex items-center gap-3 mb-4">
                  <Star className="w-5 h-5 text-yellow-400" />
                  <span className="text-yellow-400/80 text-sm font-bold uppercase tracking-wide">Season 3 Cast Revealed</span>
                </div>
                <h3 className="text-3xl md:text-4xl font-bold mb-4" style={{ fontFamily: 'Fredoka' }}>
                  Every character has a story to tell
                </h3>
                <p className="text-white/50 leading-relaxed mb-8 text-lg">
                  No generic heroes here. Our cast is messy, lovable, and unforgettable.
                  They'll make you laugh, cry, and everything in between.
                </p>
                <a
                  href="https://youtube.com/@foxycodename?si=oHcwbVmcMGMz4Xqo"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-3 px-6 py-3 bg-purple-600/90 hover:bg-purple-500 rounded-xl font-bold transition-all hover:scale-105"
                >
                  <Play className="w-4 h-4" />
                  See them in action
                  <ArrowRight className="w-4 h-4" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Studio Section */}
      <section id="studio" className="relative py-32 px-6">
        {/* Background pattern layer */}
        <div className="absolute inset-0 opacity-5">
          <img src={IMAGES.pattern} alt="" className="w-full h-full object-cover" />
        </div>
        
        <div className="relative max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Studio image with overlay effects */}
            <div className="relative group">
              <div className="absolute -inset-4 bg-gradient-to-r from-pink-500/10 to-purple-500/10 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
              <div className="relative rounded-3xl overflow-hidden border border-white/[0.06]">
                <img
                  src={IMAGES.studio}
                  alt="Foxy Code studio workspace at night"
                  className="w-full h-[450px] object-cover group-hover:scale-[1.03] transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-tr from-[#060411]/70 via-transparent to-transparent" />
              </div>
            </div>

            <div>
              <span className="text-pink-400/70 text-xs font-mono tracking-widest uppercase">Behind the scenes</span>
              <h2 className="text-5xl md:text-6xl font-bold mt-4 mb-8 leading-[0.95]" style={{ fontFamily: 'Fredoka' }}>
                Small team,<br />
                <span className="bg-gradient-to-r from-pink-400 to-rose-400 bg-clip-text text-transparent">big dreams.</span>
              </h2>
              <p className="text-white/40 leading-relaxed mb-8 text-lg">
                We're not a massive corporate studio — and that's our superpower. Every decision
                is made by people who genuinely care about the craft. No committees, no focus groups,
                just pure creative passion.
              </p>
              
              {/* Stats grid */}
              <div className="grid grid-cols-2 gap-4 mb-10">
                {[
                  { num: '50+', label: 'Episodes Made', color: 'text-orange-400' },
                  { num: '4', label: 'Original Series', color: 'text-purple-400' },
                  { num: '1M+', label: 'Views & Growing', color: 'text-cyan-400' },
                  { num: '∞', label: 'Cups of Coffee', color: 'text-pink-400' },
                ].map((stat, i) => (
                  <div key={i} className="p-5 rounded-2xl bg-white/[0.03] border border-white/[0.05] hover:border-white/[0.12] transition-all group/stat">
                    <div className={`text-3xl font-black ${stat.color} group-hover/stat:scale-110 transition-transform inline-block`} style={{ fontFamily: 'Fredoka' }}>{stat.num}</div>
                    <div className="text-xs text-white/40 mt-1 font-medium">{stat.label}</div>
                  </div>
                ))}
              </div>

              <blockquote className="relative pl-6 border-l-2 border-orange-500/40">
                <div className="absolute -left-2 -top-2 text-4xl text-orange-500/20">"</div>
                <p className="italic text-white/50 text-lg leading-relaxed">
                  Animation is not about making drawings move. It's about making people feel.
                </p>
                <cite className="text-white/30 text-sm mt-2 block not-italic">— The Foxy Code Team</cite>
              </blockquote>
            </div>
          </div>
        </div>
      </section>

      {/* AI Tools Section */}
      <section id="tools" className="relative py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="relative rounded-3xl overflow-hidden border border-white/[0.06]">
            {/* Background image */}
            <div className="absolute inset-0">
              <img src={IMAGES.aiBrain} alt="" className="w-full h-full object-cover opacity-20" />
              <div className="absolute inset-0 bg-gradient-to-br from-[#060411]/95 via-[#0d0a1a]/90 to-[#060411]/95" />
            </div>

            <div className="relative p-8 md:p-16">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                <div>
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/20 mb-8">
                    <Zap className="w-3.5 h-3.5 text-purple-400" />
                    <span className="text-xs font-bold text-purple-300 tracking-wide">FREE • 350+ AI MODELS</span>
                  </div>
                  <h2 className="text-4xl md:text-5xl font-bold mb-6 leading-tight" style={{ fontFamily: 'Fredoka' }}>
                    AI chat for<br />
                    <span className="bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">creative minds.</span>
                  </h2>
                  <p className="text-white/40 leading-relaxed mb-8 text-lg">
                    We built an AI assistant that understands creative work.
                    Brainstorm characters, write dialogue, plan story arcs — powered by GPT-4, Claude, Gemini, and more.
                  </p>
                  <div className="flex flex-wrap gap-2 mb-10">
                    {['Story Ideas', 'Character Design', 'Script Writing', 'World Building', 'Dialogue', 'Storyboarding'].map((tag) => (
                      <span key={tag} className="px-4 py-1.5 rounded-full bg-white/[0.05] border border-white/[0.08] text-xs text-white/60 font-medium hover:border-purple-500/30 hover:text-purple-300 transition-all cursor-default">
                        {tag}
                      </span>
                    ))}
                  </div>
                  <Link
                    to="/ai"
                    className="inline-flex items-center gap-3 px-7 py-4 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 rounded-xl font-bold transition-all hover:scale-105 hover:shadow-xl hover:shadow-purple-500/20"
                  >
                    <MessageSquare className="w-5 h-5" />
                    Explore AI Tools
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>

                {/* Chat preview mockup */}
                <div className="relative">
                  <div className="absolute -inset-4 bg-gradient-to-r from-purple-500/10 to-cyan-500/10 rounded-3xl blur-xl" />
                  <div className="relative rounded-2xl bg-[#0a0818] border border-white/[0.08] p-6 shadow-2xl">
                    <div className="flex items-center gap-2 mb-6 pb-4 border-b border-white/[0.05]">
                      <div className="w-3 h-3 rounded-full bg-red-500/60" />
                      <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
                      <div className="w-3 h-3 rounded-full bg-green-500/60" />
                      <span className="ml-auto text-[11px] text-white/30 font-mono">foxy-ai-chat v2.0</span>
                    </div>
                    <div className="space-y-5">
                      <div className="flex gap-3">
                        <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                          <Sparkles className="w-4 h-4 text-purple-400" />
                        </div>
                        <div className="bg-white/[0.04] rounded-xl rounded-tl-sm px-4 py-3 max-w-[80%]">
                          <p className="text-sm text-white/70">What kind of story are you working on today? ✨</p>
                        </div>
                      </div>
                      <div className="flex gap-3 justify-end">
                        <div className="bg-orange-500/10 border border-orange-500/20 rounded-xl rounded-tr-sm px-4 py-3 max-w-[80%]">
                          <p className="text-sm text-white/70">A fox who discovers she can paint things into reality 🎨</p>
                        </div>
                      </div>
                      <div className="flex gap-3">
                        <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                          <Sparkles className="w-4 h-4 text-purple-400" />
                        </div>
                        <div className="bg-white/[0.04] rounded-xl rounded-tl-sm px-4 py-3 max-w-[80%]">
                          <p className="text-sm text-white/70">Love it! What if her paintings start developing minds of their own? The conflict between creator and creation could be powerful...</p>
                        </div>
                      </div>
                      <div className="flex gap-3 justify-end">
                        <div className="bg-cyan-500/10 border border-cyan-500/20 rounded-xl rounded-tr-sm px-4 py-3 max-w-[80%]">
                          <p className="text-sm text-white/70">Yes! And maybe she has to choose between erasing them or letting them be free 🦊</p>
                        </div>
                      </div>
                    </div>
                    {/* Typing indicator */}
                    <div className="mt-5 pt-4 border-t border-white/[0.05] flex items-center gap-2">
                      <div className="flex gap-1">
                        <div className="w-2 h-2 rounded-full bg-purple-400/60 animate-bounce" style={{ animationDelay: '0ms' }} />
                        <div className="w-2 h-2 rounded-full bg-purple-400/60 animate-bounce" style={{ animationDelay: '150ms' }} />
                        <div className="w-2 h-2 rounded-full bg-purple-400/60 animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                      <span className="text-[10px] text-white/30">AI is thinking...</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* YouTube CTA Section */}
      <section className="relative py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="relative rounded-3xl overflow-hidden border border-white/[0.06]">
            {/* YouTube background image */}
            <img
              src={IMAGES.youtube}
              alt="YouTube theater in the clouds"
              className="w-full h-[500px] object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#060411] via-[#060411]/60 to-[#060411]/30" />
            <div className="absolute inset-0 bg-[#060411]/40" />

            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center px-6">
                <div className="relative inline-block mb-10">
                  <div className="absolute inset-0 bg-red-500/30 rounded-full blur-3xl animate-pulse" />
                  <a
                    href="https://youtube.com/@foxycodename?si=oHcwbVmcMGMz4Xqo"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="relative w-28 h-28 rounded-full bg-red-600 flex items-center justify-center hover:scale-110 hover:bg-red-500 transition-all duration-300 shadow-2xl shadow-red-500/30 cursor-pointer"
                  >
                    <Play className="w-12 h-12 text-white ml-1" />
                  </a>
                </div>
                <h2 className="text-5xl md:text-7xl font-bold mb-6" style={{ fontFamily: 'Fredoka' }}>
                  See it all on <span className="text-red-400">YouTube.</span>
                </h2>
                <p className="text-white/50 text-xl mb-12 max-w-lg mx-auto">
                  New cartoons, behind-the-scenes, tutorials, and more.
                  Join the Foxy family — we're just getting started.
                </p>
                <a
                  href="https://youtube.com/@foxycodename?si=oHcwbVmcMGMz4Xqo"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-3 px-10 py-5 bg-red-600 hover:bg-red-500 rounded-2xl font-bold text-lg transition-all hover:scale-105 hover:shadow-2xl hover:shadow-red-500/30"
                >
                  <Youtube className="w-6 h-6" />
                  Subscribe to Foxy Codename
                  <ExternalLink className="w-4 h-4 opacity-60" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/[0.04] py-12 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex items-center gap-3">
            <img
              src={IMAGES.mascot}
              alt="Foxy Code"
              className="w-8 h-8 object-contain"
            />
            <span className="text-lg font-bold" style={{ fontFamily: 'Fredoka' }}>
              <span className="text-orange-400">Foxy</span>{' '}
              <span className="text-white/70">Code</span>
            </span>
          </div>
          <div className="flex items-center gap-8">
            <a href="#work" className="text-xs text-white/30 hover:text-orange-400 transition-colors font-medium">Work</a>
            <a href="#characters" className="text-xs text-white/30 hover:text-purple-400 transition-colors font-medium">Characters</a>
            <a href="#studio" className="text-xs text-white/30 hover:text-pink-400 transition-colors font-medium">Studio</a>
            <a href="#tools" className="text-xs text-white/30 hover:text-cyan-400 transition-colors font-medium">Tools</a>
            <a
              href="https://youtube.com/@foxycodename?si=oHcwbVmcMGMz4Xqo"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-white/30 hover:text-red-400 transition-colors flex items-center gap-1 font-medium"
            >
              <Youtube className="w-3.5 h-3.5" />
              YouTube
            </a>
          </div>
          <p className="text-[11px] text-white/20">© 2026 Foxy Code Animation Studio. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;