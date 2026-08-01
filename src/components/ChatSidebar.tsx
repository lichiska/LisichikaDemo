import { useState, useEffect } from 'react';
import { Plus, Trash2, MessageSquare, Moon, Sun, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { listConversations, createConversation, deleteConversation, clearAllConversations, type StoredConversation } from '@/lib/storage';
import { useModel } from '@/contexts/ModelContext';

interface ChatSidebarProps {
  selectedConversationId: string | null;
  onSelectConversation: (id: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

export function ChatSidebar({ selectedConversationId, onSelectConversation, isOpen, onClose }: ChatSidebarProps) {
  const { selectedModel, darkMode, setDarkMode } = useModel();
  const [conversations, setConversations] = useState<StoredConversation[]>([]);

  useEffect(() => {
    setConversations(listConversations());
  }, [selectedConversationId]);

  const handleNew = () => {
    const conv = createConversation(selectedModel);
    setConversations(listConversations());
    onSelectConversation(conv.id);
  };

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    deleteConversation(id);
    setConversations(listConversations());
    if (selectedConversationId === id) {
      onSelectConversation('');
    }
  };

  const handleExport = () => {
    const data = JSON.stringify(conversations, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `lisichka-chats-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <aside
      className={`
        fixed md:relative z-30 h-full w-72 flex flex-col
        bg-slate-950/95 backdrop-blur-xl border-r border-purple-500/20
        transition-transform duration-200 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-4 border-b border-purple-500/20">
        <div className="flex items-center gap-2">
          <img src="/assets/logo.png" alt="Lisichka" className="w-8 h-8 rounded-full object-cover shadow-lg shadow-purple-500/30" />
          <h1 className="text-lg font-bold bg-gradient-to-r from-purple-400 to-fuchsia-400 bg-clip-text text-transparent" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
            Lisichka
          </h1>
        </div>
        <Button
          onClick={handleNew}
          size="sm"
          className="bg-gradient-to-r from-purple-500 to-fuchsia-500 hover:from-purple-600 hover:to-fuchsia-600 text-white font-medium border-0 shadow-lg shadow-purple-500/25"
        >
          <Plus className="w-4 h-4 mr-1" />
          New
        </Button>
      </div>

      {/* Conversation list */}
      <div className="flex-1 overflow-y-auto py-2 px-2 space-y-1">
        {conversations.length === 0 ? (
          <div className="text-center py-12 px-4">
            <div className="relative inline-block mb-3">
              <img src="/assets/logo.png" alt="Lisichka" className="w-14 h-14 mx-auto rounded-full object-cover opacity-70" />
              <div className="absolute inset-0 rounded-full bg-purple-500/20 animate-pulse-glow" />
            </div>
            <p className="text-sm text-purple-300/70">No conversations yet</p>
            <p className="text-xs text-purple-400/40 mt-1">Start a new chat to begin</p>
          </div>
        ) : (
          conversations.map((conv) => (
            <button
              key={conv.id}
              onClick={() => onSelectConversation(conv.id)}
              className={`
                w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-left transition-all group
                ${conv.id === selectedConversationId
                  ? 'bg-gradient-to-r from-purple-500/20 to-fuchsia-500/20 text-purple-200 border border-purple-500/40 shadow-lg shadow-purple-500/10'
                  : 'text-purple-200/70 hover:bg-purple-500/10 border border-transparent hover:border-purple-500/20'
                }
              `}
            >
              <MessageSquare className="w-4 h-4 shrink-0 opacity-60" />
              <span className="flex-1 text-sm truncate">{conv.title}</span>
              <button
                onClick={(e) => handleDelete(e, conv.id)}
                className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-red-500/20 hover:text-red-400 transition-all"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </button>
          ))
        )}
      </div>

      {/* Footer */}
      <div className="border-t border-purple-500/20 px-3 py-3 space-y-2">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setDarkMode(!darkMode)}
            className="flex-1 text-purple-300/70 hover:text-purple-200 hover:bg-purple-500/10"
          >
            {darkMode ? <Sun className="w-4 h-4 mr-1" /> : <Moon className="w-4 h-4 mr-1" />}
            {darkMode ? 'Light' : 'Dark'}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleExport}
            className="text-purple-300/70 hover:text-purple-200 hover:bg-purple-500/10"
            title="Export all chats"
          >
            <Download className="w-4 h-4" />
          </Button>
        </div>
        <p className="text-[10px] text-purple-500/40 text-center">
          puter.js · 350+ models · free · no API key
        </p>
      </div>
    </aside>
  );
}