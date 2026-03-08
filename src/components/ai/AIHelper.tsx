// src/components/AIHelper.tsx

import React, { useState, useRef, useEffect } from "react";
import {
  MessageCircle,
  X,
  Send,
  Bot,
  User,
  AlertCircle,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { cn } from "@/lib/utils";
import {
  sendAIQuery,
  generateMessageId,
  getWelcomeMessage,
  validateQuery,
  clearAIConversation,
  type AIMessage,
} from "@/components/ai/utils";

export function AIHelper() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<AIMessage[]>([getWelcomeMessage()]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);

  const handleSend = async () => {
    setError(null);

    // Validate query
    const validation = validateQuery(input);
    if (!validation.valid) {
      setError(validation.error || "Invalid query");
      return;
    }

    const userMessage: AIMessage = {
      id: generateMessageId(),
      role: "user",
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      // Send query to backend
      const response = await sendAIQuery(userMessage.content);

      const assistantMessage: AIMessage = {
        id: generateMessageId(),
        role: "assistant",
        content: response,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err) {
      setError("Failed to get response. Please try again.");
      console.error("AI Helper Error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleClearChat = async () => {
    try {
      await clearAIConversation();
      setMessages([getWelcomeMessage()]);
      setError(null);
    } catch (err) {
      console.error("Error clearing chat:", err);
    }
  };

  return (
    <>
      {/* Floating Button */}
      <Button
        onClick={() => setIsOpen(true)}
        className={cn(
          "fixed bottom-6 right-6 w-14 h-14 rounded-full shadow-lg z-50",
          "bg-gradient-to-br from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70",
          "transition-all duration-300 hover:scale-110",
          isOpen && "scale-0 opacity-0",
        )}
        title="Open AI Assistant"
      >
        <MessageCircle className="w-6 h-6" />
      </Button>

      {/* Chat Panel */}
      <div
        className={cn(
          "fixed bottom-6 right-6 w-[90vw] sm:w-96 h-[70vh] sm:h-[600px] max-h-[600px]",
          "bg-card border border-border rounded-2xl shadow-2xl z-50",
          "flex flex-col transition-all duration-300 transform",
          isOpen
            ? "scale-100 opacity-100"
            : "scale-90 opacity-0 pointer-events-none",
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-3 sm:p-4 border-b border-border bg-gradient-to-r from-primary/10 to-primary/5 rounded-t-2xl shrink-0">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-primary rounded-full flex items-center justify-center shadow-md shrink-0">
              <Bot className="w-4 h-4 sm:w-6 sm:h-6 text-primary-foreground" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="font-semibold text-sm sm:text-base text-foreground truncate">
                AI Assistant
              </h3>
              <p className="text-xs text-muted-foreground truncate">
                Ask about properties & units
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleClearChat}
              className="hover:bg-primary/10 h-8 w-8"
              title="Clear conversation"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(false)}
              className="hover:bg-primary/10 h-8 w-8"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Messages */}
        <ScrollArea
          className="flex-1 p-3 sm:p-4 overflow-y-auto"
          ref={scrollAreaRef}
        >
          <div className="space-y-3 sm:space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  "flex gap-2 animate-fade-in",
                  message.role === "user" ? "justify-end" : "justify-start",
                )}
              >
                {message.role === "assistant" && (
                  <div className="w-6 h-6 sm:w-8 sm:h-8 bg-primary rounded-full flex items-center justify-center shrink-0 shadow-sm self-end">
                    <Bot className="w-3 h-3 sm:w-4 sm:h-4 text-primary-foreground" />
                  </div>
                )}
                <div
                  className={cn(
                    "max-w-[75%] sm:max-w-[80%] px-3 py-2 rounded-xl text-xs sm:text-sm shadow-sm",
                    "break-words overflow-wrap-anywhere leading-relaxed",
                    message.role === "user"
                      ? "bg-primary text-primary-foreground rounded-br-none"
                      : "bg-muted text-foreground rounded-bl-none",
                  )}
                  style={{
                    wordBreak: "break-word",
                    overflowWrap: "anywhere",
                    hyphens: "auto",
                  }}
                >
                  <div className="whitespace-pre-wrap">{message.content}</div>
                </div>
                {message.role === "user" && (
                  <div className="w-6 h-6 sm:w-8 sm:h-8 bg-muted rounded-full flex items-center justify-center shrink-0 shadow-sm self-end">
                    <User className="w-3 h-3 sm:w-4 sm:h-4 text-muted-foreground" />
                  </div>
                )}
              </div>
            ))}

            {/* Loading Indicator */}
            {isLoading && (
              <div className="flex gap-2 items-center animate-fade-in">
                <div className="w-6 h-6 sm:w-8 sm:h-8 bg-primary rounded-full flex items-center justify-center shadow-sm shrink-0">
                  <Bot className="w-3 h-3 sm:w-4 sm:h-4 text-primary-foreground" />
                </div>
                <div className="bg-muted px-3 py-2 rounded-xl shadow-sm">
                  <div className="flex gap-1">
                    <div
                      className="w-2 h-2 bg-primary rounded-full animate-bounce"
                      style={{ animationDelay: "0ms" }}
                    />
                    <div
                      className="w-2 h-2 bg-primary rounded-full animate-bounce"
                      style={{ animationDelay: "150ms" }}
                    />
                    <div
                      className="w-2 h-2 bg-primary rounded-full animate-bounce"
                      style={{ animationDelay: "300ms" }}
                    />
                  </div>
                </div>
              </div>
            )}

            <div ref={chatEndRef} />
          </div>
        </ScrollArea>

        {/* Error Alert */}
        {error && (
          <div className="px-3 sm:px-4 pb-2 shrink-0">
            <Alert variant="destructive" className="py-2">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-xs">{error}</AlertDescription>
            </Alert>
          </div>
        )}

        {/* Input */}
        <div className="p-3 sm:p-4 border-t border-border bg-muted/30 shrink-0">
          <div className="flex gap-2">
            <Input
              ref={inputRef}
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                setError(null);
              }}
              placeholder="Ask about vacant units..."
              onKeyDown={handleKeyPress}
              disabled={isLoading}
              className="flex-1 text-xs sm:text-sm"
              maxLength={500}
            />
            <Button
              onClick={handleSend}
              disabled={isLoading || !input.trim()}
              className="shrink-0 h-9 sm:h-10 w-9 sm:w-10 p-0"
            >
              <Send className="w-3 h-3 sm:w-4 sm:h-4" />
            </Button>
          </div>
          <p className="text-[10px] sm:text-xs text-muted-foreground mt-1.5 text-center">
            {input.length}/500 characters
          </p>
        </div>
      </div>
    </>
  );
}
