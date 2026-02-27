import { useRef, useEffect } from "react";
import { useStore } from "../../store";
import { handleGenerate } from "../../api";
import ChatMessage from "./ChatMessage";
import ChatInput from "./ChatInput";

export default function ChatPanel() {
  const {
    chatMessages,
    addChatMessage,
    updateChatMessage,
    isLoading,
    setIsLoading,
    setStlData,
    setGeneratedCode,
    setGenerationInfo,
    setPrompt,
    selectedModel,
    setSelectedModel,
    provider,
    setProvider,
    codeStyle,
    addToHistory,
    availableProviders,
  } = useStore();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const currentProvider = availableProviders.find((p) => p.id === provider);
  const configuredProviders = availableProviders.filter((p) => p.configured);

  const handleProviderChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newProviderId = e.target.value;
    setProvider(newProviderId);
    const newProvider = availableProviders.find((p) => p.id === newProviderId);
    if (newProvider && newProvider.models.length > 0) {
      setSelectedModel(newProvider.models[0]);
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView?.({ behavior: "smooth" });
  }, [chatMessages]);

  const handleSend = async (message: string) => {
    if (isLoading || !message.trim()) return;

    const userMessageId = crypto.randomUUID();
    const thinkingMessageId = crypto.randomUUID();

    addChatMessage({
      id: userMessageId,
      role: "user",
      content: message,
    });

    addChatMessage({
      id: thinkingMessageId,
      role: "assistant",
      content: "I'm analyzing your request and generating code...",
      isThinking: true,
    });

    setPrompt(message);

    const allMessages = [
      ...chatMessages,
      {
        role: "user" as const,
        content: message,
        id: userMessageId,
        timestamp: Date.now(),
      },
    ];
    const historyWithoutThinking = allMessages.filter((m) => !m.isThinking);

    let newCode = "";
    try {
      await handleGenerate(
        message,
        selectedModel,
        provider,
        setIsLoading,
        setStlData,
        setGeneratedCode,
        setGenerationInfo,
        undefined,
        codeStyle,
        undefined,
        (code: string) => {
          newCode = code;
          addToHistory({
            prompt: message,
            code,
            model: selectedModel,
            style: codeStyle,
            attachment: null,
          });
        },
        historyWithoutThinking,
      );

      updateChatMessage(thinkingMessageId, {
        content: "Here's the generated code based on your request:",
        code: newCode,
        isThinking: false,
      });
    } catch (error) {
      updateChatMessage(thinkingMessageId, {
        content: `Error: ${error instanceof Error ? error.message : "Failed to generate code"}`,
        isThinking: false,
      });
    }
  };

  return (
    <div className="h-full flex flex-col bg-zinc-900/50">
      <div className="px-4 py-3 border-b border-white/10 space-y-3">
        <div>
          <h2 className="text-sm font-semibold text-zinc-300">AI Chat</h2>
          <p className="text-xs text-zinc-500">
            Iterate on your design with natural language
          </p>
        </div>

        {configuredProviders.length > 0 && (
          <div className="flex items-center gap-2">
            <select
              value={provider}
              onChange={handleProviderChange}
              disabled={isLoading}
              className="bg-zinc-800 border border-zinc-700 rounded-md px-2 py-1.5 text-xs text-zinc-200 focus:outline-none focus:border-blue-500 disabled:opacity-50 flex-1"
            >
              {configuredProviders.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>

            {currentProvider &&
              (currentProvider.models.length > 0 ? (
                <select
                  value={selectedModel}
                  onChange={(e) => setSelectedModel(e.target.value)}
                  disabled={isLoading}
                  className="bg-zinc-800 border border-zinc-700 rounded-md px-2 py-1.5 text-xs text-zinc-200 focus:outline-none focus:border-blue-500 disabled:opacity-50 flex-1"
                >
                  {currentProvider.models.map((model) => (
                    <option key={model} value={model}>
                      {model}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type="text"
                  value={selectedModel}
                  onChange={(e) => setSelectedModel(e.target.value)}
                  placeholder="Model name"
                  disabled={isLoading}
                  className="bg-zinc-800 border border-zinc-700 rounded-md px-2 py-1.5 text-xs text-zinc-200 focus:outline-none focus:border-blue-500 disabled:opacity-50 flex-1"
                />
              ))}
          </div>
        )}
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
