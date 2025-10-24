"use client";

import { useState } from "react";
import { Header } from "@/components/Header";
import { Sidebar } from "@/components/Sidebar";
import { MobileSidebar } from "@/components/MobileSidebar";
import { ChatInterface } from "@/components/ChatInterface";

export default function Home() {
  const [chatKey, setChatKey] = useState(0);
  const [currentChatId, setCurrentChatId] = useState<string>();
  
  // Mock chat history
  const [chatHistory] = useState([
    {
      id: "1",
      title: "Brainstorming small business ideas",
      preview: "Help me come up with creative ideas...",
    },
    {
      id: "2",
      title: "The history of roman empire",
      preview: "Tell me about the rise and fall...",
    },
    {
      id: "3",
      title: "Crypto investment suggestions",
      preview: "What are the best cryptocurrencies...",
    },
  ]);

  const handleNewChat = () => {
    setChatKey((prev) => prev + 1);
    setCurrentChatId(undefined);
  };

  const handleSelectChat = (id: string) => {
    setCurrentChatId(id);
    // TODO: Load chat messages for the selected chat
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header
        userName="Marcus Aurelius"
        userEmail="Marcaurel@gmail.com"
        version="Valerio V 1.2"
      />
      <div className="flex flex-1 overflow-hidden">
        {/* Desktop Sidebar */}
        <div className="hidden lg:block">
          <Sidebar
            onNewChat={handleNewChat}
            chatHistory={chatHistory}
            onSelectChat={handleSelectChat}
            currentChatId={currentChatId}
          />
        </div>

        {/* Main Content */}
        <main className="flex-1 flex flex-col overflow-hidden">
          {/* Mobile Menu Button */}
          <div className="lg:hidden flex items-center gap-2 p-4 border-b">
            <MobileSidebar
              onNewChat={handleNewChat}
              chatHistory={chatHistory}
              onSelectChat={handleSelectChat}
              currentChatId={currentChatId}
            />
            <span className="text-sm font-medium">Palika Agent</span>
          </div>

          <ChatInterface key={chatKey} />
        </main>
      </div>
    </div>
  );
}
