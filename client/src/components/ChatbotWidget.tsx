import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MessageCircle, X, Send, Loader2, Globe } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

interface ChatbotWidgetProps {
  sessionId: string;
  isOpen: boolean;
  onToggle: () => void;
}

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: number;
}

const LANGUAGES = [
  { code: "en", label: "English" },
  { code: "es", label: "Español" },
  { code: "fr", label: "Français" },
  { code: "de", label: "Deutsch" },
  { code: "it", label: "Italiano" },
  { code: "pt", label: "Português" },
  { code: "zh", label: "中文" },
  { code: "ja", label: "日本語" },
  { code: "ko", label: "한국어" },
  { code: "ar", label: "العربية" },
  { code: "hi", label: "हिन्दी" },
];

export default function ChatbotWidget({ sessionId, isOpen, onToggle }: ChatbotWidgetProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [language, setLanguage] = useState<string>(
    () => (typeof window !== "undefined" && localStorage.getItem("chatbot.lang")) || "en",
  );
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const sendMessageMutation = trpc.chatbot.sendMessage.useMutation();
  const { data: history } = trpc.chatbot.getHistory.useQuery(
    { sessionId },
    { enabled: isOpen }
  );

  // Load conversation history
  useEffect(() => {
    if (history && history.length > 0) {
      setMessages(history);
    } else {
      // Add welcome message
      setMessages([
        {
          role: "assistant",
          content:
            "Hello! I'm your TourMax assistant. I can help you find the perfect tour, answer questions about destinations, and guide you through the booking process. What are you looking for?",
          timestamp: Date.now(),
        },
      ]);
    }
  }, [history, isOpen]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      role: "user",
      content: input,
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await sendMessageMutation.mutateAsync({
        sessionId,
        message: input,
        language,
      });

      const assistantMessage: Message = {
        role: "assistant",
        content: typeof response.message === "string" ? response.message : "",
        timestamp: response.timestamp,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      toast.error("Failed to send message. Please try again.");
      console.error("Chatbot error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Floating Button */}
      {!isOpen && (
        <button
          onClick={onToggle}
          className="fixed bottom-6 right-6 w-14 h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg flex items-center justify-center transition-all duration-300 hover:scale-110 z-40"
        >
          <MessageCircle className="w-6 h-6" />
        </button>
      )}

      {/* Chat Widget */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 w-96 max-h-96 bg-white rounded-lg shadow-2xl flex flex-col z-50 border border-slate-200">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 rounded-t-lg flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <img src="/logo-icon.png" alt="TourMax" className="w-8 h-8 object-contain" />
              <div>
                <h3 className="font-semibold leading-tight">TourMax Assistant</h3>
                <p className="text-xs text-blue-100">AI-powered tour guide</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 opacity-80" />
              <Select
                value={language}
                onValueChange={(v) => {
                  setLanguage(v);
                  if (typeof window !== "undefined") localStorage.setItem("chatbot.lang", v);
                }}
              >
                <SelectTrigger className="h-7 w-[105px] bg-white/15 border-white/30 text-white text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {LANGUAGES.map((l) => (
                    <SelectItem key={l.code} value={l.code}>
                      {l.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <button
                onClick={onToggle}
                className="p-1 hover:bg-blue-500 rounded transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${
                  message.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-xs px-4 py-2 rounded-lg ${
                    message.role === "user"
                      ? "bg-blue-600 text-white rounded-br-none"
                      : "bg-slate-100 text-slate-900 rounded-bl-none"
                  }`}
                >
                  <p className="text-sm">{message.content}</p>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-slate-100 text-slate-900 px-4 py-2 rounded-lg rounded-bl-none flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-sm">Thinking...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <form
            onSubmit={handleSendMessage}
            className="border-t border-slate-200 p-4 flex gap-2"
          >
            <Input
              type="text"
              placeholder="Ask me anything..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={isLoading}
              className="flex-1"
            />
            <Button
              type="submit"
              disabled={isLoading || !input.trim()}
              size="sm"
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Send className="w-4 h-4" />
            </Button>
          </form>
        </div>
      )}
    </>
  );
}
