import { useState, memo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import { Copy, Check, Download } from 'lucide-react';
import 'highlight.js/styles/github-dark.css';

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(text).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };
  return (
    <button
      onClick={copy}
      className="flex items-center gap-1 text-xs px-2 py-1 rounded transition-colors text-purple-300 hover:text-white bg-purple-500/20"
      title="Copy code"
    >
      {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
      {copied ? 'Copied' : 'Copy'}
    </button>
  );
}

function CodeBlock({ language, code }: { language: string; code: string }) {
  return (
    <div className="my-3 rounded-xl overflow-hidden border border-purple-500/20 bg-[#0d0d1a]">
      <div className="flex items-center justify-between px-3 py-2 bg-purple-500/10 border-b border-purple-500/20">
        <span className="text-xs font-mono text-purple-400">{language || 'code'}</span>
        <CopyButton text={code} />
      </div>
      <pre className="overflow-x-auto text-sm p-4 m-0 bg-transparent">
        <code className={language ? `language-${language}` : ''}>{code}</code>
      </pre>
    </div>
  );
}

function MediaContent({ mediaType, mediaUrl, content }: { mediaType: string; mediaUrl: string; content: string }) {
  const download = (ext: string) => {
    const a = document.createElement('a');
    a.href = mediaUrl;
    a.download = `lisichka-${mediaType}-${Date.now()}.${ext}`;
    a.click();
  };

  if (mediaType === 'image') {
    return (
      <div className="space-y-2">
        <img
          src={mediaUrl}
          alt={content}
          className="rounded-xl max-w-full max-h-96 object-contain shadow-lg border border-purple-500/20"
        />
        <button
          onClick={() => download('png')}
          className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-purple-500/20 text-purple-300 hover:text-white transition-colors"
        >
          <Download className="w-3 h-3" />
          Download image
        </button>
      </div>
    );
  }

  if (mediaType === 'audio') {
    return (
      <div className="space-y-2">
        <audio src={mediaUrl} controls className="w-full rounded-xl" />
        <button
          onClick={() => download('mp3')}
          className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-purple-500/20 text-purple-300 hover:text-white transition-colors"
        >
          <Download className="w-3 h-3" />
          Download audio
        </button>
      </div>
    );
  }

  if (mediaType === 'video') {
    return (
      <div className="space-y-2">
        <video src={mediaUrl} controls className="rounded-xl max-w-full max-h-80 shadow-lg border border-purple-500/20" />
        <button
          onClick={() => download('mp4')}
          className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-purple-500/20 text-purple-300 hover:text-white transition-colors"
        >
          <Download className="w-3 h-3" />
          Download video
        </button>
      </div>
    );
  }

  return null;
}

interface MessageRendererProps {
  role: 'user' | 'assistant';
  content: string;
  mediaType?: string | null;
  mediaUrl?: string | null;
  attachmentData?: string | null;
  isStreaming?: boolean;
  reasoningText?: string;
}

export const MessageRenderer = memo(function MessageRenderer({
  role,
  content,
  mediaType,
  mediaUrl,
  attachmentData,
  isStreaming,
  reasoningText,
}: MessageRendererProps) {
  const isUser = role === 'user';

  return (
    <div className={`flex gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
      {/* Avatar */}
      {isUser ? (
        <div className="w-8 h-8 rounded-full shrink-0 flex items-center justify-center text-sm font-bold select-none mt-0.5 bg-gradient-to-br from-fuchsia-500 to-pink-500 text-white shadow-lg shadow-fuchsia-500/30">
          U
        </div>
      ) : (
        <img src="/assets/logo.png" alt="Lisichka" className="w-8 h-8 rounded-full shrink-0 object-cover mt-0.5 shadow-lg shadow-purple-500/30" />
      )}

      {/* Bubble */}
      <div className={`max-w-[80%] ${isUser ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
        {attachmentData && (
          <img
            src={attachmentData}
            alt="Attached"
            className="rounded-xl max-h-48 object-contain shadow-md mb-1 border border-purple-500/20"
          />
        )}

        <div
          className={`rounded-2xl px-4 py-3 text-sm leading-relaxed ${
            isUser
              ? 'bg-gradient-to-br from-fuchsia-500 to-purple-600 text-white shadow-lg shadow-fuchsia-500/20'
              : 'bg-slate-900/80 text-purple-100 border border-purple-500/20 backdrop-blur-sm'
          }`}
          style={{ maxWidth: '100%' }}
        >
          {reasoningText && (
            <div className="mb-3 p-3 rounded-xl text-xs italic bg-purple-500/10 text-purple-300 border border-purple-500/20">
              <div className="font-semibold mb-1 not-italic text-fuchsia-400">🧠 Reasoning</div>
              {reasoningText}
            </div>
          )}

          {mediaType && mediaUrl ? (
            <MediaContent mediaType={mediaType} mediaUrl={mediaUrl} content={content} />
          ) : isUser ? (
            <span className="whitespace-pre-wrap">{content}</span>
          ) : (
            <div className="prose prose-sm prose-invert max-w-none [&_pre]:bg-transparent [&_pre]:p-0 [&_pre]:m-0">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeHighlight]}
                components={{
                  code({ className, children, ...props }) {
                    const match = /language-(\w+)/.exec(className || '');
                    const code = String(children).replace(/\n$/, '');
                    if (match) {
                      return <CodeBlock language={match[1]} code={code} />;
                    }
                    return (
                      <code className="px-1.5 py-0.5 rounded text-sm font-mono bg-purple-500/20 text-fuchsia-300" {...props}>
                        {children}
                      </code>
                    );
                  },
                  a({ href, children }) {
                    return (
                      <a href={href} target="_blank" rel="noopener noreferrer" className="text-fuchsia-400 underline hover:text-fuchsia-300">
                        {children}
                      </a>
                    );
                  },
                }}
              >
                {content || (isStreaming ? '▌' : '')}
              </ReactMarkdown>
              {isStreaming && content && <span className="animate-pulse text-fuchsia-400">▌</span>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
});