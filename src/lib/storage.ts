// localStorage-based conversation storage

export interface StoredMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  mediaType?: 'image' | 'audio' | 'video' | null;
  mediaUrl?: string | null;
  attachmentData?: string | null;
  timestamp: number;
}

export interface StoredConversation {
  id: string;
  title: string;
  model: string;
  messages: StoredMessage[];
  createdAt: number;
  updatedAt: number;
}

const STORAGE_KEY = 'lisichka_conversations';

function getAll(): StoredConversation[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function saveAll(conversations: StoredConversation[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(conversations));
  } catch {
    // Storage full - remove oldest conversations
    const sorted = [...conversations].sort((a, b) => b.updatedAt - a.updatedAt);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sorted.slice(0, 50)));
  }
}

export function listConversations(): StoredConversation[] {
  return getAll().sort((a, b) => b.updatedAt - a.updatedAt);
}

export function getConversation(id: string): StoredConversation | null {
  return getAll().find((c) => c.id === id) ?? null;
}

export function createConversation(model: string): StoredConversation {
  const conv: StoredConversation = {
    id: crypto.randomUUID(),
    title: 'New Chat',
    model,
    messages: [],
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
  const all = getAll();
  all.push(conv);
  saveAll(all);
  return conv;
}

export function addMessage(conversationId: string, message: Omit<StoredMessage, 'id' | 'timestamp'>): StoredMessage {
  const all = getAll();
  const conv = all.find((c) => c.id === conversationId);
  if (!conv) throw new Error('Conversation not found');

  const msg: StoredMessage = {
    ...message,
    id: crypto.randomUUID(),
    timestamp: Date.now(),
  };
  conv.messages.push(msg);
  conv.updatedAt = Date.now();

  // Auto-title from first user message
  if (conv.title === 'New Chat' && message.role === 'user' && message.content) {
    conv.title = message.content.slice(0, 50) + (message.content.length > 50 ? '…' : '');
  }

  saveAll(all);
  return msg;
}

export function updateConversationTitle(id: string, title: string) {
  const all = getAll();
  const conv = all.find((c) => c.id === id);
  if (conv) {
    conv.title = title;
    saveAll(all);
  }
}

export function deleteConversation(id: string) {
  const all = getAll().filter((c) => c.id !== id);
  saveAll(all);
}

export function clearAllConversations() {
  saveAll([]);
}