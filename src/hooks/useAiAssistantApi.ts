// src/hooks/useAiAssistantApi.ts

import { useState, useCallback, useEffect } from "react";
import { api } from "@/Apis/axiosApi";
import { useToast } from "@/hooks/use-toast";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

// ─── API calls ────────────────────────────────────────────────────────────────

const sendChat = async (message: string) => {
  const res = await api.post<{
    success: boolean;
    reply: string;
    historyLength: number;
  }>("/api/v1/ai-assistant/chat", { message });
  return res.data;
};

const fetchHistory = async () => {
  const res = await api.get<{
    success: boolean;
    history: { user: string; assistant: string }[];
  }>("/api/v1/ai-assistant/history");
  return res.data;
};

const deleteHistory = async () => {
  await api.delete("/api/v1/ai-assistant/clear");
};

// ─── Hook ─────────────────────────────────────────────────────────────────────

const WELCOME: Message = {
  id: "welcome",
  role: "assistant",
  content:
    "👋 Hi! I'm your business advisor with live access to all your data — income, expenses, bookings, games, and more. What would you like to know?",
  timestamp: new Date(),
};

export const useAiAssistantApi = () => {
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([WELCOME]);
  const [isTyping, setIsTyping] = useState(false);

  // ── Restore server-side history on mount ──────────────────────────────────
  useEffect(() => {
    fetchHistory()
      .then((data) => {
        if (!data.history?.length) return;
        const restored: Message[] = [];
        data.history.forEach((turn, i) => {
          if (turn.user) {
            restored.push({
              id: `h-u-${i}`,
              role: "user",
              content: turn.user,
              timestamp: new Date(),
            });
          }
          if (turn.assistant) {
            restored.push({
              id: `h-a-${i}`,
              role: "assistant",
              content: turn.assistant,
              timestamp: new Date(),
            });
          }
        });
        if (restored.length) setMessages(restored);
      })
      .catch(() => {
        // silently ignore — history is optional
      });
  }, []);

  // ── Send ──────────────────────────────────────────────────────────────────
  const sendMessage = useCallback(
    async (text: string) => {
      if (!text.trim() || isTyping) return;

      const userMsg: Message = {
        id: `u-${Date.now()}`,
        role: "user",
        content: text.trim(),
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, userMsg]);
      setIsTyping(true);

      try {
        const data = await sendChat(text.trim());
        setMessages((prev) => [
          ...prev,
          {
            id: `a-${Date.now()}`,
            role: "assistant",
            content: data.reply,
            timestamp: new Date(),
          },
        ]);
      } catch (err: any) {
        const msg =
          err?.response?.data?.message ??
          "Something went wrong. Please try again.";
        toast({ title: "AI Error", description: msg, variant: "destructive" });
        setMessages((prev) => [
          ...prev,
          {
            id: `err-${Date.now()}`,
            role: "assistant",
            content: `⚠️ ${msg}`,
            timestamp: new Date(),
          },
        ]);
      } finally {
        setIsTyping(false);
      }
    },
    [isTyping, toast],
  );

  // ── Clear ─────────────────────────────────────────────────────────────────
  const clearChat = useCallback(async () => {
    try {
      await deleteHistory();
      setMessages([
        {
          ...WELCOME,
          id: `welcome-${Date.now()}`,
          timestamp: new Date(),
          content:
            "Chat cleared! Fresh start 🧹 — what would you like to know?",
        },
      ]);
    } catch {
      toast({
        title: "Error",
        description: "Could not clear history.",
        variant: "destructive",
      });
    }
  }, [toast]);

  return { messages, isTyping, sendMessage, clearChat };
};
