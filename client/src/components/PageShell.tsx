import { useState, ReactNode } from "react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import ChatbotWidget from "@/components/ChatbotWidget";

export default function PageShell({ children }: { children: ReactNode }) {
  const [sessionId] = useState(
    () => `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
  );
  const [showChatbot, setShowChatbot] = useState(false);

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Navigation sessionId={sessionId} />
      <main className="flex-1">{children}</main>
      <Footer sessionId={sessionId} />
      <ChatbotWidget
        sessionId={sessionId}
        isOpen={showChatbot}
        onToggle={() => setShowChatbot(!showChatbot)}
      />
    </div>
  );
}
