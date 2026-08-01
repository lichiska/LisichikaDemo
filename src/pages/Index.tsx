import { useState } from 'react';
import { ChatSidebar } from '@/components/ChatSidebar';
import { ChatPanel } from '@/components/ChatPanel';
import { ModelProvider } from '@/contexts/ModelContext';

export default function Index() {
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleSelectConversation = (id: string) => {
    setSelectedConversationId(id);
    setSidebarOpen(false);
  };

  return (
    <ModelProvider>
      <div className="flex h-screen overflow-hidden relative">
        {/* Background image - visible */}
        <div
          className="absolute inset-0 z-0"
          style={{
            backgroundImage: 'url(/assets/background.png)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
          }}
        />
        {/* Dark overlay to keep text readable but show background */}
        <div className="absolute inset-0 z-0 bg-gradient-to-br from-purple-950/80 via-slate-950/75 to-fuchsia-950/80" />
        
        {/* Animated gradient orbs for vibrancy */}
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse-glow" />
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-fuchsia-500/15 rounded-full blur-3xl animate-pulse-glow" style={{ animationDelay: '1s' }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-violet-500/10 rounded-full blur-3xl animate-pulse-glow" style={{ animationDelay: '2s' }} />
        </div>

        {/* Mobile overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-20 bg-black/60 md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        <ChatSidebar
          selectedConversationId={selectedConversationId}
          onSelectConversation={handleSelectConversation}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        <div className="flex-1 flex flex-col min-w-0 relative z-10">
          <ChatPanel
            conversationId={selectedConversationId}
            onNewConversation={(id) => setSelectedConversationId(id)}
            onToggleSidebar={() => setSidebarOpen((o) => !o)}
          />
        </div>
      </div>
    </ModelProvider>
  );
}