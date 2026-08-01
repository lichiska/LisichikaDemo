import { Link } from 'react-router-dom';
import { ArrowLeft, ExternalLink, Scissors, Github } from 'lucide-react';

const EditorPage = () => {
  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-3 border-b border-white/5 bg-[#0a0a0f]/90 backdrop-blur-xl">
        <div className="flex items-center gap-4">
          <Link to="/" className="flex items-center gap-2 text-white/60 hover:text-white transition-colors">
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">Back</span>
          </Link>
          <div className="w-px h-5 bg-white/10" />
          <div className="flex items-center gap-2">
            <Scissors className="w-4 h-4 text-pink-400" />
            <span className="font-semibold text-sm">OpenCut Video Editor</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <a 
            href="https://github.com/opencut-app/OpenCut" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-3 py-1.5 text-xs text-white/60 hover:text-white border border-white/10 rounded-lg transition-colors"
          >
            <Github className="w-3.5 h-3.5" />
            GitHub
          </a>
          <a 
            href="https://opencut.app" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-3 py-1.5 text-xs bg-pink-600 hover:bg-pink-500 rounded-lg font-medium transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            Open Full App
          </a>
        </div>
      </header>

      {/* Editor iframe */}
      <div className="flex-1 relative">
        <iframe
          src="https://opencut.app"
          className="w-full h-full absolute inset-0 border-0"
          title="OpenCut Video Editor"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    </div>
  );
};

export default EditorPage;
