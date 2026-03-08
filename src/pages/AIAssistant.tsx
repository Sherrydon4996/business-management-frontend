// src/pages/ai-assistant/AIAssistant.tsx

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bot, Send, Sparkles, Trash2, User, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useAiAssistantApi, type Message } from "@/hooks/useAiAssistantApi";
import { PulseDots } from "@/loaders/spinner";

// ─── Quick chips ──────────────────────────────────────────────────────────────

const QUICK_QUESTIONS = [
  "How am I doing today?",
  "Most profitable service?",
  "Any overdue bookings?",
  "Best earning PS game?",
  "This week vs last week?",
  "Contributions status?",
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

const fmtTime = (d: Date) =>
  d.toLocaleTimeString("en-KE", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

// ─── Message bubble ───────────────────────────────────────────────────────────

function Bubble({ role, content, timestamp }: Message) {
  const isUser = role === "user";
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className={`flex items-end gap-2 ${isUser ? "justify-end" : "justify-start"}`}
    >
      {!isUser && (
        <div className="shrink-0 w-7 h-7 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center mb-1">
          <Bot className="w-3.5 h-3.5 text-primary" />
        </div>
      )}

      <div
        className={`flex flex-col gap-1 max-w-[80%] sm:max-w-[70%] ${isUser ? "items-end" : "items-start"}`}
      >
        <div
          className={`rounded-2xl px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap break-words ${
            isUser
              ? "gradient-profit text-white rounded-br-sm"
              : "bg-card border border-border text-foreground rounded-bl-sm"
          }`}
        >
          {content}
        </div>
        <span className="text-[10px] text-muted-foreground/50 px-1">
          {fmtTime(timestamp)}
        </span>
      </div>

      {isUser && (
        <div className="shrink-0 w-7 h-7 rounded-full bg-primary flex items-center justify-center mb-1">
          <User className="w-3.5 h-3.5 text-primary-foreground" />
        </div>
      )}
    </motion.div>
  );
}

// ─── Typing indicator ─────────────────────────────────────────────────────────

function TypingBubble() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="flex items-end gap-2"
    >
      <div className="shrink-0 w-7 h-7 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center">
        <Bot className="w-3.5 h-3.5 text-primary" />
      </div>
      <div className="bg-card border border-border rounded-2xl rounded-bl-sm px-4 py-3">
        <PulseDots />
      </div>
    </motion.div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function AIAssistant() {
  const { messages, isTyping, sendMessage, clearChat } = useAiAssistantApi();
  const [input, setInput] = useState("");
  const [showScrollBtn, setShowScrollBtn] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, isTyping]);

  const onScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    setShowScrollBtn(el.scrollHeight - el.scrollTop - el.clientHeight > 120);
  };

  const handleSend = () => {
    if (!input.trim() || isTyping) return;
    sendMessage(input.trim());
    setInput("");
    textareaRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-5rem)] sm:h-[calc(100vh-6.5rem)] max-w-3xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-3 shrink-0"
      >
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-foreground flex items-center gap-2">
            <Bot className="w-6 h-6 text-primary" /> AI Business Advisor
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Live data · remembers last 15 messages
          </p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={clearChat}
          className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 gap-1.5 text-xs"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Clear</span>
        </Button>
      </motion.div>

      {/* Quick chips */}
      <div
        className="flex gap-2 mb-3 overflow-x-auto pb-1 shrink-0"
        style={{ scrollbarWidth: "none" }}
      >
        {QUICK_QUESTIONS.map((q) => (
          <button
            key={q}
            onClick={() => sendMessage(q)}
            disabled={isTyping}
            className="shrink-0 flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium bg-secondary text-secondary-foreground hover:bg-accent border border-border transition-colors disabled:opacity-40 whitespace-nowrap"
          >
            <Sparkles className="w-3 h-3 text-primary" />
            {q}
          </button>
        ))}
      </div>

      {/* Messages */}
      <div
        ref={scrollRef}
        onScroll={onScroll}
        className="flex-1 overflow-y-auto space-y-4 py-2 px-0.5"
        style={{ scrollbarWidth: "thin" }}
      >
        {messages.map((m) => (
          <Bubble key={m.id} {...m} />
        ))}
        <AnimatePresence>{isTyping && <TypingBubble />}</AnimatePresence>
        <div ref={bottomRef} className="h-1" />
      </div>

      {/* Scroll-to-bottom button */}
      <AnimatePresence>
        {showScrollBtn && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={() =>
              bottomRef.current?.scrollIntoView({ behavior: "smooth" })
            }
            className="absolute bottom-28 right-4 sm:right-8 w-9 h-9 rounded-full bg-card border border-border shadow-md flex items-center justify-center hover:bg-accent transition-colors z-10"
          >
            <ChevronDown className="w-4 h-4 text-muted-foreground" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Input */}
      <div className="shrink-0 pt-3 border-t border-border mt-2">
        <div className="flex gap-2 items-end">
          <Textarea
            ref={textareaRef}
            placeholder="Ask about your finances… (Enter to send, Shift+Enter for new line)"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={1}
            className="flex-1 resize-none min-h-[40px] max-h-[120px] py-2.5 text-sm"
            style={{ scrollbarWidth: "thin" }}
          />
          <Button
            onClick={handleSend}
            disabled={!input.trim() || isTyping}
            className="gradient-profit border-0 text-white h-10 w-10 p-0 shrink-0 rounded-xl"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
        <p className="text-[10px] text-muted-foreground/40 mt-1.5 text-center">
          Powered by Google Gemini · Shift+Enter for new line
        </p>
      </div>
    </div>
  );
}
