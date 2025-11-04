"use client";

import { useState, useEffect, useCallback } from "react";
import { Header } from "@/components/Header";
import { Sidebar } from "@/components/Sidebar";
import { MobileSidebar } from "@/components/MobileSidebar";
import { ChatInterface } from "@/components/ChatInterface";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { getChatHistory, deleteChat } from "@/lib/chatHistory";
import { toast } from "sonner";

export default function Home() {
  const [chatKey, setChatKey] = useState(0);
  const [currentChatId, setCurrentChatId] = useState<string>();
  const [chatHistory, setChatHistory] = useState<Array<{
    id: string;
    title: string;
    preview: string;
  }>>([]);
  const { user, isAuthenticated } = useAuth();
  const { language } = useLanguage();

  // Load chat history for authenticated users
  useEffect(() => {
    if (isAuthenticated && user) {
      const history = getChatHistory(user.user_id);
      const mappedHistory = history.map((chat) => ({
        id: chat.id,
        title: chat.title,
        preview: chat.preview,
      }));
      // This setState is intentional - loading from localStorage on auth change
      setChatHistory(mappedHistory);
    } else {
      // Clear history for guests
      setChatHistory([]);
      setCurrentChatId(undefined);
    }
  }, [isAuthenticated, user]);

  // Memoized function to refresh chat history
  const loadChatHistory = useCallback(() => {
    if (!user) return;
    
    const history = getChatHistory(user.user_id);
    setChatHistory(
      history.map((chat) => ({
        id: chat.id,
        title: chat.title,
        preview: chat.preview,
      }))
    );
  }, [user]);

  const handleNewChat = () => {
    setChatKey((prev) => prev + 1);
    setCurrentChatId(undefined);
  };

  const handleSelectChat = (id: string) => {
    setCurrentChatId(id);
    setChatKey((prev) => prev + 1); // Force re-render with new chat
  };

  const handleChatUpdate = useCallback(() => {
    // Refresh chat history when a chat is saved
    // Use requestAnimationFrame to batch updates and prevent excessive re-renders
    requestAnimationFrame(() => {
      loadChatHistory();
    });
  }, [loadChatHistory]);

  const handleDeleteChat = useCallback((chatId: string) => {
    if (!user) return;

    // Optimistic update - remove from UI immediately
    setChatHistory(prev => prev.filter(chat => chat.id !== chatId));

    // Delete from localStorage
    deleteChat(user.user_id, chatId);

    // If the deleted chat was active, clear the current chat
    if (currentChatId === chatId) {
      handleNewChat();
    }

    // Show success message
    toast.success(
      language === "ne" ? "मेटाइयो" : "Deleted",
      {
        description: language === "ne"
          ? "च्याट सफलतापूर्वक मेटाइयो"
          : "Chat deleted successfully",
      }
    );
  }, [user, currentChatId, language]);

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Desktop Sidebar - Full height, left side */}
      <div className="hidden lg:block">
        <Sidebar
          onNewChat={handleNewChat}
          chatHistory={chatHistory}
          onSelectChat={handleSelectChat}
          onDeleteChat={handleDeleteChat}
          currentChatId={currentChatId}
        />
      </div>

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header>
          {/* Mobile Hamburger Menu in Header */}
          <div className="lg:hidden">
            <MobileSidebar
              onNewChat={handleNewChat}
              chatHistory={chatHistory}
              onSelectChat={handleSelectChat}
              onDeleteChat={handleDeleteChat}
              currentChatId={currentChatId}
            />
          </div>
        </Header>
        
        {/* Main Content */}
        <main className="flex-1 flex flex-col overflow-hidden">
          <ChatInterface 
            key={chatKey} 
            currentChatId={currentChatId}
            onChatUpdate={handleChatUpdate}
          />
        </main>
      </div>
    </div>
  );
}
