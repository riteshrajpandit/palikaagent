/**
 * Chat History Manager
 * Handles localStorage operations for chat history (authenticated users only)
 */

export interface ChatMessage {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  audioUrl?: string;
  isVoiceInput?: boolean;
}

export interface Chat {
  id: string;
  title: string;
  preview: string;
  messages: ChatMessage[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ChatHistory {
  userId: string;
  chats: Chat[];
}

const CHAT_HISTORY_KEY = "palika_chat_history";

/**
 * Get all chat history for a user
 */
export function getChatHistory(userId: string): Chat[] {
  if (typeof window === "undefined") return [];

  try {
    const stored = localStorage.getItem(CHAT_HISTORY_KEY);
    if (!stored) return [];

    const allHistory: ChatHistory[] = JSON.parse(stored);
    const userHistory = allHistory.find((h) => h.userId === userId);

    if (!userHistory) return [];

    // Convert date strings back to Date objects
    return userHistory.chats.map((chat) => ({
      ...chat,
      createdAt: new Date(chat.createdAt),
      updatedAt: new Date(chat.updatedAt),
      messages: chat.messages.map((msg) => ({
        ...msg,
        timestamp: new Date(msg.timestamp),
      })),
    }));
  } catch (error) {
    console.error("Error loading chat history:", error);
    return [];
  }
}

/**
 * Save a chat to history
 */
export function saveChat(userId: string, chat: Chat): void {
  if (typeof window === "undefined") return;

  try {
    const stored = localStorage.getItem(CHAT_HISTORY_KEY);
    const allHistory: ChatHistory[] = stored ? JSON.parse(stored) : [];

    // Find or create user history
    const userHistoryIndex = allHistory.findIndex((h) => h.userId === userId);
    
    if (userHistoryIndex === -1) {
      // Create new user history
      allHistory.push({
        userId,
        chats: [chat],
      });
    } else {
      // Update existing user history
      const userHistory = allHistory[userHistoryIndex];
      const chatIndex = userHistory.chats.findIndex((c) => c.id === chat.id);

      if (chatIndex === -1) {
        // Add new chat at the beginning
        userHistory.chats.unshift(chat);
      } else {
        // Update existing chat
        userHistory.chats[chatIndex] = chat;
      }

      // Keep only last 50 chats per user
      if (userHistory.chats.length > 50) {
        userHistory.chats = userHistory.chats.slice(0, 50);
      }

      allHistory[userHistoryIndex] = userHistory;
    }

    localStorage.setItem(CHAT_HISTORY_KEY, JSON.stringify(allHistory));
  } catch (error) {
    console.error("Error saving chat history:", error);
  }
}

/**
 * Get a specific chat by ID
 */
export function getChatById(userId: string, chatId: string): Chat | null {
  const history = getChatHistory(userId);
  return history.find((chat) => chat.id === chatId) || null;
}

/**
 * Delete a chat from history
 */
export function deleteChat(userId: string, chatId: string): void {
  if (typeof window === "undefined") return;

  try {
    const stored = localStorage.getItem(CHAT_HISTORY_KEY);
    if (!stored) return;

    const allHistory: ChatHistory[] = JSON.parse(stored);
    const userHistoryIndex = allHistory.findIndex((h) => h.userId === userId);

    if (userHistoryIndex === -1) return;

    const userHistory = allHistory[userHistoryIndex];
    userHistory.chats = userHistory.chats.filter((c) => c.id !== chatId);

    allHistory[userHistoryIndex] = userHistory;
    localStorage.setItem(CHAT_HISTORY_KEY, JSON.stringify(allHistory));
  } catch (error) {
    console.error("Error deleting chat:", error);
  }
}

/**
 * Clear all chat history for a user
 */
export function clearChatHistory(userId: string): void {
  if (typeof window === "undefined") return;

  try {
    const stored = localStorage.getItem(CHAT_HISTORY_KEY);
    if (!stored) return;

    let allHistory: ChatHistory[] = JSON.parse(stored);
    allHistory = allHistory.filter((h) => h.userId !== userId);

    if (allHistory.length === 0) {
      localStorage.removeItem(CHAT_HISTORY_KEY);
    } else {
      localStorage.setItem(CHAT_HISTORY_KEY, JSON.stringify(allHistory));
    }
  } catch (error) {
    console.error("Error clearing chat history:", error);
  }
}

/**
 * Generate a title from the first message or first few words
 */
export function generateChatTitle(firstMessage: string, language: "en" | "ne" = "en"): string {
  if (!firstMessage) {
    return language === "ne" ? "नयाँ कुराकानी" : "New Chat";
  }

  // Take first 50 characters or first sentence
  const title = firstMessage.length > 50 
    ? firstMessage.substring(0, 47) + "..."
    : firstMessage;

  return title;
}

/**
 * Generate a preview from the last message
 */
export function generateChatPreview(messages: ChatMessage[]): string {
  if (messages.length === 0) return "";

  const lastMessage = messages[messages.length - 1];
  const preview = lastMessage.text.length > 60
    ? lastMessage.text.substring(0, 57) + "..."
    : lastMessage.text;

  return preview;
}
