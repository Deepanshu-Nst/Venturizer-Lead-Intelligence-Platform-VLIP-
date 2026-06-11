
interface ChatbotMessageProps {
  role: "bot" | "user";
  content: string;
}

export function ChatbotMessage({ role, content }: ChatbotMessageProps) {
  if (role === "bot") {
    return (
      <div className="flex items-end gap-2.5 animate-chat-bubble">
        {/* Bot avatar */}
        <div
          className="flex h-7 w-7 flex-none items-center justify-center rounded-full bg-white/10"
          aria-hidden
        >
          <span className="text-[10px] font-bold text-white/70">V</span>
        </div>

        {/* Bot bubble */}
        <div className="max-w-[85%] rounded-2xl rounded-bl-sm bg-white/[0.06] px-4 py-3">
          <div className="text-[13px] text-white/85 leading-relaxed prose-chatbot">
            <SimpleMd content={content} />
          </div>
        </div>
      </div>
    );
  }

  // User message
  return (
    <div className="flex items-end justify-end animate-chat-bubble">
      <div className="max-w-[80%] rounded-2xl rounded-br-sm bg-white px-4 py-2.5">
        <p className="text-[13px] text-[#0c0c0c] leading-relaxed font-medium">{content}</p>
      </div>
    </div>
  );
}

/** Lightweight markdown renderer for bot messages — handles bold and line breaks */
function SimpleMd({ content }: { content: string }) {
  // Parse **bold** and newlines into React nodes
  const parts = content.split(/(\*\*[^*]+\*\*|\n)/g);

  return (
    <>
      {parts.map((part, i) => {
        if (part === "\n") {
          return <br key={i} />;
        }
        if (part.startsWith("**") && part.endsWith("**")) {
          return (
            <strong key={i} className="font-semibold text-white">
              {part.slice(2, -2)}
            </strong>
          );
        }
        return <span key={i}>{part}</span>;
      })}
    </>
  );
}
