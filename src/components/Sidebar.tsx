"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import {
  Compass,
  MessageSquarePlus,
  MessageCircle,
  Lock,
  Trash2,
} from "lucide-react";

interface SidebarProps {
  onNewChat: () => void;
  chatHistory: Array<{ id: string; title: string; preview: string }>;
  onSelectChat: (id: string) => void;
  onDeleteChat?: (id: string) => void;
  currentChatId?: string;
}

export function Sidebar({
  onNewChat,
  chatHistory,
  onSelectChat,
  onDeleteChat,
  currentChatId,
}: SidebarProps) {
  const { language } = useLanguage();
  const { isAuthenticated } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");

  const handleDelete = (e: React.MouseEvent, chatId: string) => {
    e.stopPropagation(); // Prevent chat selection when clicking delete
    if (onDeleteChat) {
      onDeleteChat(chatId);
    }
  };

  // Filter chat history based on search query
  const filteredChatHistory = searchQuery.trim()
    ? chatHistory.filter(
        (chat) =>
          chat.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          chat.preview.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : chatHistory;

  return (
    <aside className="w-70 h-screen border-r bg-muted/30 backdrop-blur-sm flex flex-col">
      {/* Logo Section */}
      <div className="p-3 border-b">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-linear-to-br from-[#00a79d] to-[#273b4b] flex items-center justify-center shrink-0">
            <MessageCircle className="h-4 w-4 text-white" />
          </div>
          <span className="font-semibold text-base">
            {language === "ne" ? "पालिका एजेन्ट" : "Palika Agent"}
          </span>
        </div>
      </div>

      {/* Search */}
      <div className="p-4">
        <input
          type="search"
          placeholder={
            language === "ne" ? "च्याट खोज्नुहोस्" : "Search chat"
          }
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full h-9 px-3 rounded-lg bg-background/50 border border-border/50 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
        />
      </div>

      {/* Explore Menu */}
      <nav className="px-3 mb-4">
        <Button
          variant="ghost"
          className="w-full justify-start h-9 px-3 text-sm font-normal"
        >
          <Compass className="h-4 w-4 mr-2" />
          {language === "ne" ? "अन्वेषण गर्नुहोस्" : "Explore"}
        </Button>
      </nav>

      <Separator className="mb-4" />

      <div className="px-3 mb-2 flex items-center justify-between">
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          {language === "ne" ? "हालका च्याटहरू" : "Recent Chats"}
        </span>
        <Button
          variant="ghost"
          size="icon"
          onClick={onNewChat}
          className="h-6 w-6"
          title={language === "ne" ? "नयाँ च्याट" : "New Chat"}
        >
          <MessageSquarePlus className="h-4 w-4" />
        </Button>
      </div>

      <ScrollArea className="flex-1 px-3">
        <div className="space-y-1 pb-4">
          {!isAuthenticated ? (
            <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
              <Lock className="h-8 w-8 text-muted-foreground/50 mb-3" />
              <p className="text-sm text-muted-foreground mb-1">
                {language === "ne" 
                  ? "च्याट इतिहास हेर्न लग इन गर्नुहोस्"
                  : "Login to see chat history"}
              </p>
              <p className="text-xs text-muted-foreground/70">
                {language === "ne"
                  ? "तपाईंको वार्तालापहरू सुरक्षित रूपमा सुरक्षित गरिनेछ"
                  : "Your conversations will be saved securely"}
              </p>
            </div>
          ) : filteredChatHistory.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
              <MessageCircle className="h-8 w-8 text-muted-foreground/50 mb-3" />
              <p className="text-sm text-muted-foreground">
                {searchQuery.trim() 
                  ? (language === "ne" ? "कुनै परिणाम फेला परेन" : "No results found")
                  : (language === "ne" ? "कुनै च्याट इतिहास छैन" : "No chat history yet")}
              </p>
              <p className="text-xs text-muted-foreground/70 mt-1">
                {searchQuery.trim()
                  ? (language === "ne" ? "फरक शब्द प्रयास गर्नुहोस्" : "Try different keywords")
                  : (language === "ne" ? "नयाँ कुराकानी सुरु गर्नुहोस्" : "Start a new conversation")}
              </p>
            </div>
          ) : (
            filteredChatHistory.map((chat) => (
              <div
                key={chat.id}
                className={`w-full rounded-lg text-sm transition-colors hover:bg-accent group ${
                  currentChatId === chat.id ? "bg-accent" : ""
                }`}
              >
                <div className="flex items-center gap-2 px-3 py-2.5">
                  <div 
                    onClick={() => onSelectChat(chat.id)}
                    className="flex items-center gap-2 flex-1 cursor-pointer"
                    style={{ minWidth: 0, maxWidth: '50%' }}
                  >
                    <MessageCircle className="h-4 w-4 shrink-0 text-muted-foreground group-hover:text-foreground" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate text-sm">{chat.title}</p>
                      <p className="text-xs text-muted-foreground truncate">
                        {chat.preview}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={(e) => handleDelete(e, chat.id)}
                    className="shrink-0 p-1.5 rounded-md bg-red-500/10 hover:bg-red-500 text-red-600 hover:text-white transition-all duration-200 group/delete"
                    title={language === "ne" ? "मेटाउनुहोस्" : "Delete"}
                    aria-label={language === "ne" ? "मेटाउनुहोस्" : "Delete"}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </ScrollArea>
    </aside>
  );
}
