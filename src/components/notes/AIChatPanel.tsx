import { useState, useRef, useEffect } from "react";
import { Bot, Send, User } from "lucide-react";
import { chatWithAI } from "@/utils/chat.functions";

interface Message {
  id: string;
  role: "user" | "ai";
  content: string;
}

interface AIChatPanelProps {
  context: string;
}

export function AIChatPanel({ context }: AIChatPanelProps) {
  const [messages, setMessages] = useState<Message[]>([
    { id: "1", role: "ai", content: "Hi! Ask me anything about your note." }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg: Message = { id: Date.now().toString(), role: "user", content: input.trim() };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    const res = await chatWithAI({ prompt: userMsg.content, context });
    
    if (res.ok && res.result) {
      setMessages((prev) => [
        ...prev,
        { id: Date.now().toString(), role: "ai", content: res.result.answer }
      ]);
    } else {
      setMessages((prev) => [
        ...prev,
        { id: Date.now().toString(), role: "ai", content: "Sorry, I couldn't process that. Error: " + res.error }
      ]);
    }
    setIsLoading(false);
  };

  return (
    <div className="flex w-80 flex-col border-l border-white/5 bg-black/20">
      <div className="flex items-center gap-2 border-b border-white/5 p-4">
        <Bot className="h-5 w-5 text-ai" />
        <h2 className="text-sm font-semibold tracking-wide">AI Assistant</h2>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
            <div className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${msg.role === "user" ? "bg-primary/20 text-primary" : "bg-ai/20 text-ai"}`}>
              {msg.role === "user" ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
            </div>
            <div className={`rounded-lg px-3 py-2 text-sm ${msg.role === "user" ? "bg-primary/10 text-foreground" : "bg-white/5 text-foreground/90"} max-w-[85%] whitespace-pre-wrap`}>
              {msg.content}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex gap-3">
            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-ai/20 text-ai">
              <Bot className="h-4 w-4" />
            </div>
            <div className="flex items-center gap-1.5 rounded-lg bg-white/5 px-3 py-2">
              <span className="h-1.5 w-1.5 rounded-full bg-ai animate-pulse" />
              <span className="h-1.5 w-1.5 rounded-full bg-ai animate-pulse delay-75" />
              <span className="h-1.5 w-1.5 rounded-full bg-ai animate-pulse delay-150" />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="border-t border-white/5 p-4">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="relative flex items-center"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask AI..."
            className="w-full rounded-full border border-white/10 bg-black/40 py-2 pl-4 pr-10 text-sm text-foreground placeholder:text-muted-foreground focus:border-ai/50 focus:outline-none focus:ring-1 focus:ring-ai/50"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="absolute right-1.5 rounded-full p-1.5 text-muted-foreground hover:bg-white/10 hover:text-foreground disabled:opacity-50"
          >
            <Send className="h-4 w-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
