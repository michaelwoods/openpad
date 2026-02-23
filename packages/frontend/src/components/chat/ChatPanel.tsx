import { useRef, useEffect } from "react";
import { useStore } from "../../store";
import ChatMessage from "./ChatMessage";
import ChatInput from "./ChatInput";

export default function ChatPanel() {
  const { chatMessages, addChatMessage, isLoading, setPrompt } = useStore();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView?.({ behavior: "smooth" });
  }, [chatMessages]);

  const handleSend = (message: string) => {
    addChatMessage({
      role: "user",
      content: message,
    });

    addChatMessage({
      role: "assistant",
      content: "I'm analyzing your request and generating code...",
      isThinking: true,
    });

    setPrompt(message);
  };

  return (
    <div className="h-full flex flex-col bg-zinc-900/50">
      <div className="px-4 py-3 border-b border-white/10">
        <h2 className="text-sm font-semibold text-zinc-300">AI Chat</h2>
        <p className="text-xs text-zinc-500">
          Iterate on your design with natural language
        </p>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {chatMessages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-sm text-zinc-500 text-center">
              Start a conversation to iterate on your design
            </p>
          </div>
        ) : (
          chatMessages.map((message) => (
            <ChatMessage key={message.id} message={message} />
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      <ChatInput onSend={handleSend} disabled={isLoading} />
    </div>
  );
}
