// src/utils/aiHelper.utils.ts

import { api } from "@/Apis/axiosApi";

export interface AIMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export interface AIQueryResponse {
  success: boolean;
  response: string;
  timestamp: string;
}

/**
 * Generate or get session ID
 */
export const getSessionId = (): string => {
  let sessionId = sessionStorage.getItem("ai_session_id");

  if (!sessionId) {
    sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    sessionStorage.setItem("ai_session_id", sessionId);
  }

  return sessionId;
};

/**
 * Send query to AI backend with session memory
 */
export const sendAIQuery = async (query: string): Promise<string> => {
  try {
    const sessionId = getSessionId();

    const response = await api.post<AIQueryResponse>("/api/v1/ai/query", {
      query: query.trim(),
      sessionId,
    });

    if (response.data.success) {
      return response.data.response;
    }

    throw new Error("Failed to get AI response");
  } catch (error: any) {
    console.error("AI Query Error:", error);

    if (error.response?.status === 429) {
      return "I'm currently experiencing high demand. Please try again in a moment.";
    }

    if (error.response?.status === 400) {
      return "I couldn't understand your question. Could you rephrase it?";
    }

    return "I'm having trouble processing your request right now. Please try again later.";
  }
};

/**
 * Clear conversation history
 */
export const clearAIConversation = async (): Promise<void> => {
  try {
    const sessionId = getSessionId();
    await api.post("/api/v1/ai/clear", { sessionId });
    // Clear local session ID to start fresh
    sessionStorage.removeItem("ai_session_id");
  } catch (error) {
    console.error("Error clearing conversation:", error);
  }
};

/**
 * Generate a unique message ID
 */
export const generateMessageId = (): string => {
  return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Get welcome message
 */
export const getWelcomeMessage = (): AIMessage => {
  return {
    id: generateMessageId(),
    role: "assistant",
    content: `Hello! 👋 I'm your SmartRent AI assistant. I can help you with:

- Vacant units and their prices
- Late payment interest rates by building
- Building information and amenities
- Occupancy statistics

Ask me anything about your properties!`,
    timestamp: new Date(),
  };
};

/**
 * Validate query before sending
 */
export const validateQuery = (
  query: string,
): { valid: boolean; error?: string } => {
  const trimmed = query.trim();

  if (!trimmed) {
    return { valid: false, error: "Please enter a question" };
  }

  if (trimmed.length > 500) {
    return { valid: false, error: "Question is too long (max 500 characters)" };
  }

  return { valid: true };
};
