interface ChatbotMessageProps {
  role: 'bot' | 'user';
  content: string;
}

export function ChatbotMessage({ role, content }: ChatbotMessageProps) {
  if (role === 'bot') {
    return (
      <div className="flex items-end gap-2.5 animate-chat-bubble">
        {/* Avatar */}
        <div
          className="flex h-7 w-7 flex-none items-center justify-center rounded-full bg-white/10 shrink-0"
          aria-hidden
        >
          <svg width="9" height="9" viewBox="0 0 32 32" fill="none">
            <path d="M8 8L14.5 22L16 18.5L11.5 8H8Z" fill="#dc2626"/>
            <path d="M24 8L17.5 22L16 18.5L20.5 8H24Z" fill="white" fillOpacity="0.9"/>
          </svg>
        </div>

        {/* Bubble */}
        <div className="max-w-[84%] rounded-2xl rounded-bl-sm bg-white/[0.08] border border-white/[0.06] px-4 py-3">
          <div className="text-[13px] text-white/85 leading-relaxed">
            <SimpleMd content={content} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-end justify-end animate-chat-bubble">
      <div className="max-w-[80%] rounded-2xl rounded-br-sm bg-white px-4 py-2.5 shadow-sm">
        <p className="text-[13px] text-[#0d1428] font-semibold leading-relaxed">{content}</p>
      </div>
    </div>
  );
}

function SimpleMd({ content }: { content: string }) {
  const parts = content.split(/(\*\*[^*]+\*\*|\n)/g);
  return (
    <>
      {parts.map((part, i) => {
        if (part === '\n') return <br key={i} />;
        if (part.startsWith('**') && part.endsWith('**')) {
          return <strong key={i} className="font-bold text-white">{part.slice(2, -2)}</strong>;
        }
        return <span key={i}>{part}</span>;
      })}
    </>
  );
}
