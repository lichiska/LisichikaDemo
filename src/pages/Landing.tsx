import { Link } from 'react-router-dom';
import { MessageSquare, Film, Sparkles, Play, Scissors, Wand2, Bot, Video, ArrowRight, Star, Zap, Globe } from 'lucide-react';

const Landing = () => {
  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white overflow-x-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-[#0a0a0f]/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-white to-white/70 bg-clip-text text-transparent">
              Lisichka
            </span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <a href="#ai" className="text-sm text-white/60 hover:text-white transition-colors">AI Chat</a>
            <a href="#editor" className="text-sm text-white/60 hover:text-white transition-colors">Video Editor</a>
            <a href="#features" className="text-sm text-white/60 hover:text-white transition-colors">Features</a>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/ai" className="px-4 py-2 text-sm text-white/80 hover:text-white transition-colors">
              Sign In
            </Link>
            <Link to="/ai" className="px-4 py-2 text-sm bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg font-medium hover:opacity-90 transition-opacity">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-6">
        {/* Background effects */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-[128px]" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-pink-600/15 rounded-full blur-[128px]" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[200px]" />
        </div>
        
        <div className="relative max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-8">
            <Star className="w-4 h-4 text-yellow-400" />
            <span className="text-sm text-white/70">Powered by 350+ AI Models</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold leading-tight mb-6">
            <span className="bg-gradient-to-r from-white via-white to-white/60 bg-clip-text text-transparent">
              Create Without
            </span>
            <br />
            <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-orange-400 bg-clip-text text-transparent">
              Limits
            </span>
          </h1>
          
          <p className="text-lg md:text-xl text-white/50 max-w-2xl mx-auto mb-10 leading-relaxed">
            Your all-in-one creative platform. Chat with AI models, edit videos like a pro, 
            and bring your ideas to life — all in one place.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link 
              to="/ai" 
              className="group flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl font-semibold text-lg hover:shadow-lg hover:shadow-purple-500/25 transition-all"
            >
              <MessageSquare className="w-5 h-5" />
              Start Chatting
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link 
              to="/editor" 
              className="group flex items-center gap-2 px-8 py-4 bg-white/5 border border-white/10 rounded-xl font-semibold text-lg hover:bg-white/10 transition-all"
            >
              <Scissors className="w-5 h-5" />
              Open Editor
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>

        {/* Hero visual - floating cards */}
        <div className="relative max-w-6xl mx-auto mt-20">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* AI Chat Preview Card */}
            <div className="group relative p-6 rounded-2xl bg-gradient-to-b from-white/[0.08] to-white/[0.02] border border-white/10 hover:border-purple-500/30 transition-all duration-500 hover:-translate-y-1">
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-b from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative">
                <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center mb-4">
                  <Bot className="w-6 h-6 text-purple-400" />
                </div>
                <h3 className="text-lg font-semibold mb-2">AI Assistant</h3>
                <p className="text-sm text-white/50 leading-relaxed">Chat with GPT-4, Claude, Gemini, and 350+ models. Get answers, create content, solve problems.</p>
              </div>
            </div>

            {/* Video Editor Preview Card */}
            <div className="group relative p-6 rounded-2xl bg-gradient-to-b from-white/[0.08] to-white/[0.02] border border-white/10 hover:border-pink-500/30 transition-all duration-500 hover:-translate-y-1">
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-b from-pink-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative">
                <div className="w-12 h-12 rounded-xl bg-pink-500/10 flex items-center justify-center mb-4">
                  <Film className="w-6 h-6 text-pink-400" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Video Editor</h3>
                <p className="text-sm text-white/50 leading-relaxed">Professional video editing powered by OpenCut. Cut, trim, add effects — right in your browser.</p>
              </div>
            </div>

            {/* Creative Tools Card */}
            <div className="group relative p-6 rounded-2xl bg-gradient-to-b from-white/[0.08] to-white/[0.02] border border-white/10 hover:border-orange-500/30 transition-all duration-500 hover:-translate-y-1">
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-b from-orange-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative">
                <div className="w-12 h-12 rounded-xl bg-orange-500/10 flex items-center justify-center mb-4">
                  <Wand2 className="w-6 h-6 text-orange-400" />
                </div>
                <h3 className="text-lg font-semibold mb-2">AI Creative Tools</h3>
                <p className="text-sm text-white/50 leading-relaxed">Generate images, write scripts, create music — AI tools for every creative need.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* AI Section */}
      <section id="ai" className="relative py-24 px-6">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-purple-900/5 to-transparent" />
        <div className="relative max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 mb-6">
                <Bot className="w-3.5 h-3.5 text-purple-400" />
                <span className="text-xs font-medium text-purple-300">AI Chat Platform</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
                <span className="text-white">350+ AI Models.</span>
                <br />
                <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">One Interface.</span>
              </h2>
              <p className="text-white/50 text-lg mb-8 leading-relaxed">
                Access GPT-4o, Claude 3.5, Gemini Pro, Llama, Mistral, and hundreds more — all completely free. 
                Switch between models instantly, compare outputs, and find the perfect AI for any task.
              </p>
              <div className="space-y-4 mb-8">
                {[
                  'Unlimited conversations with all models',
                  'Image generation & analysis',
                  'Code assistance & debugging',
                  'Document analysis & summarization'
                ].map((feature, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                      <Zap className="w-3 h-3 text-purple-400" />
                    </div>
                    <span className="text-white/70 text-sm">{feature}</span>
                  </div>
                ))}
              </div>
              <Link 
                to="/ai" 
                className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-500 rounded-xl font-medium transition-colors"
              >
                <MessageSquare className="w-4 h-4" />
                Open AI Chat
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            
            {/* AI Chat mockup */}
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded-3xl blur-3xl" />
              <div className="relative rounded-2xl bg-[#12121a] border border-white/10 p-6 shadow-2xl">
                <div className="flex items-center gap-2 mb-4 pb-4 border-b border-white/5">
                  <div className="w-3 h-3 rounded-full bg-red-500/60" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
                  <div className="w-3 h-3 rounded-full bg-green-500/60" />
                  <span className="ml-3 text-xs text-white/40">Lisichka AI</span>
                </div>
                <div className="space-y-4">
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                      <Bot className="w-4 h-4 text-blue-400" />
                    </div>
                    <div className="bg-white/5 rounded-xl rounded-tl-sm px-4 py-3 max-w-[80%]">
                      <p className="text-sm text-white/80">Hello! I'm your AI assistant. I can help you with coding, writing, analysis, and much more. What would you like to explore?</p>
                    </div>
                  </div>
                  <div className="flex gap-3 justify-end">
                    <div className="bg-purple-600/20 rounded-xl rounded-tr-sm px-4 py-3 max-w-[80%]">
                      <p className="text-sm text-white/80">Help me write a Python script to analyze data</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                      <Bot className="w-4 h-4 text-blue-400" />
                    </div>
                    <div className="bg-white/5 rounded-xl rounded-tl-sm px-4 py-3 max-w-[80%]">
                      <p className="text-sm text-white/80">I'd be happy to help! Here's a data analysis script using pandas...</p>
                      <div className="mt-2 p-2 rounded bg-black/30 font-mono text-xs text-green-400">
                        import pandas as pd<br/>
                        df = pd.read_csv('data.csv')
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* OpenCut Video Editor Section */}
      <section id="editor" className="relative py-24 px-6">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-pink-900/5 to-transparent" />
        <div className="relative max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Editor mockup */}
            <div className="relative order-2 lg:order-1">
              <div className="absolute inset-0 bg-gradient-to-r from-pink-500/20 to-orange-500/20 rounded-3xl blur-3xl" />
              <div className="relative rounded-2xl bg-[#12121a] border border-white/10 overflow-hidden shadow-2xl">
                <div className="flex items-center gap-2 px-4 py-3 border-b border-white/5">
                  <div className="w-3 h-3 rounded-full bg-red-500/60" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
                  <div className="w-3 h-3 rounded-full bg-green-500/60" />
                  <span className="ml-3 text-xs text-white/40">OpenCut Editor</span>
                </div>
                {/* Timeline mockup */}
                <div className="p-4">
                  <div className="aspect-video bg-gradient-to-br from-gray-900 to-black rounded-lg mb-4 flex items-center justify-center relative overflow-hidden">
                    <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAwIDEwIEwgNDAgMTAgTSAxMCAwIEwgMTAgNDAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjAzKSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-50" />
                    <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center backdrop-blur-sm border border-white/20">
                      <Play className="w-6 h-6 text-white ml-1" />
                    </div>
                  </div>
                  {/* Timeline tracks */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-white/30 w-8">V1</span>
                      <div className="flex-1 h-8 rounded bg-purple-500/20 border border-purple-500/30 flex items-center px-2">
                        <div className="w-full h-4 rounded-sm bg-gradient-to-r from-purple-600/40 to-purple-400/40" />
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-white/30 w-8">V2</span>
                      <div className="flex-1 h-8 rounded bg-pink-500/20 border border-pink-500/30 flex items-center px-2">
                        <div className="w-2/3 h-4 rounded-sm bg-gradient-to-r from-pink-600/40 to-pink-400/40" />
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-white/30 w-8">A1</span>
                      <div className="flex-1 h-6 rounded bg-green-500/20 border border-green-500/30 flex items-center px-2">
                        <div className="w-full h-3 rounded-sm bg-gradient-to-r from-green-600/30 to-green-400/30 flex items-center justify-around">
                          {[...Array(20)].map((_, i) => (
                            <div key={i} className="w-0.5 bg-green-400/60" style={{ height: `${Math.random() * 100}%` }} />
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="order-1 lg:order-2">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-pink-500/10 border border-pink-500/20 mb-6">
                <Scissors className="w-3.5 h-3.5 text-pink-400" />
                <span className="text-xs font-medium text-pink-300">Video Editor</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
                <span className="text-white">Edit Videos.</span>
                <br />
                <span className="bg-gradient-to-r from-pink-400 to-orange-400 bg-clip-text text-transparent">Open Source.</span>
              </h2>
              <p className="text-white/50 text-lg mb-8 leading-relaxed">
                Powered by OpenCut — the open-source alternative to CapCut. Professional-grade video editing 
                directly in your browser. No downloads, no subscriptions.
              </p>
              <div className="space-y-4 mb-8">
                {[
                  'Multi-track timeline editing',
                  'AI-powered effects & transitions',
                  'Export in 4K quality',
                  'Completely free & open source'
                ].map((feature, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full bg-pink-500/20 flex items-center justify-center flex-shrink-0">
                      <Zap className="w-3 h-3 text-pink-400" />
                    </div>
                    <span className="text-white/70 text-sm">{feature}</span>
                  </div>
                ))}
              </div>
              <Link 
                to="/editor" 
                className="inline-flex items-center gap-2 px-6 py-3 bg-pink-600 hover:bg-pink-500 rounded-xl font-medium transition-colors"
              >
                <Video className="w-4 h-4" />
                Open Video Editor
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="relative py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              <span className="bg-gradient-to-r from-white to-white/70 bg-clip-text text-transparent">Everything You Need</span>
            </h2>
            <p className="text-white/40 text-lg max-w-xl mx-auto">One platform for all your creative and productivity needs</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: Globe, title: '350+ AI Models', desc: 'Access every major AI model from one interface', color: 'blue' },
              { icon: Film, title: 'Video Editing', desc: 'Professional timeline editor powered by OpenCut', color: 'pink' },
              { icon: Wand2, title: 'AI Generation', desc: 'Create images, music, and content with AI', color: 'purple' },
              { icon: MessageSquare, title: 'Smart Chat', desc: 'Context-aware conversations with memory', color: 'green' },
              { icon: Scissors, title: 'Quick Edits', desc: 'Trim, cut, and merge videos in seconds', color: 'orange' },
              { icon: Sparkles, title: 'Free Forever', desc: 'No subscriptions, no hidden fees, ever', color: 'yellow' },
            ].map((feature, i) => (
              <div key={i} className="group p-6 rounded-2xl bg-white/[0.03] border border-white/5 hover:border-white/10 transition-all duration-300">
                <div className={`w-10 h-10 rounded-lg bg-${feature.color}-500/10 flex items-center justify-center mb-4`}>
                  <feature.icon className={`w-5 h-5 text-${feature.color}-400`} />
                </div>
                <h3 className="text-base font-semibold mb-2 text-white/90">{feature.title}</h3>
                <p className="text-sm text-white/40 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-24 px-6">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-gradient-to-r from-purple-600/20 via-pink-600/20 to-orange-600/20 rounded-full blur-[120px]" />
        </div>
        <div className="relative max-w-3xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-orange-400 bg-clip-text text-transparent">
              Ready to Create?
            </span>
          </h2>
          <p className="text-white/50 text-lg mb-10">
            Join thousands of creators using Lisichka to chat with AI and edit videos — completely free.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link 
              to="/ai" 
              className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl font-semibold text-lg hover:shadow-lg hover:shadow-purple-500/25 transition-all"
            >
              Get Started Free
            </Link>
            <a 
              href="https://github.com/opencut-app/OpenCut" 
              target="_blank" 
              rel="noopener noreferrer"
              className="px-8 py-4 bg-white/5 border border-white/10 rounded-xl font-semibold text-lg hover:bg-white/10 transition-all"
            >
              View on GitHub
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-12 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
              <Sparkles className="w-3 h-3 text-white" />
            </div>
            <span className="text-sm font-semibold text-white/70">Lisichka</span>
          </div>
          <div className="flex items-center gap-6">
            <Link to="/ai" className="text-sm text-white/40 hover:text-white/70 transition-colors">AI Chat</Link>
            <Link to="/editor" className="text-sm text-white/40 hover:text-white/70 transition-colors">Video Editor</Link>
            <a href="https://github.com/opencut-app/OpenCut" target="_blank" rel="noopener noreferrer" className="text-sm text-white/40 hover:text-white/70 transition-colors">GitHub</a>
          </div>
          <p className="text-xs text-white/30">© 2024 Lisichka. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
