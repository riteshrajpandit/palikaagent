"use client";

import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  Compass,
  Library,
  FolderOpen,
  History,
  MessageSquarePlus,
  MessageCircle,
  Menu,
  X,
} from "lucide-react";
import { useState } from "react";

interface SidebarProps {
  onNewChat: () => void;
  chatHistory: Array<{ id: string; title: string; preview: string }>;
  onSelectChat: (id: string) => void;
  currentChatId?: string;
}

export function Sidebar({
  onNewChat,
  chatHistory,
  onSelectChat,
  currentChatId,
}: SidebarProps) {
  const { language } = useLanguage();
  const [collapsed, setCollapsed] = useState(false);

  const menuItems = [
    {
      icon: Compass,
      label: language === "ne" ? "अन्वेषण गर्नुहोस्" : "Explore",
      id: "explore",
    },
    {
      icon: Library,
      label: language === "ne" ? "पुस्तकालय" : "Library",
      id: "library",
    },
    {
      icon: FolderOpen,
      label: language === "ne" ? "फाइलहरू" : "Files",
      id: "files",
    },
    {
      icon: History,
      label: language === "ne" ? "इतिहास" : "History",
      id: "history",
    },
  ];

  if (collapsed) {
    return (
      <div className="w-16 border-r bg-muted/30 backdrop-blur-sm flex flex-col items-center py-4 gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCollapsed(false)}
          className="h-10 w-10"
        >
          <Menu className="h-5 w-5" />
        </Button>
        <Separator className="w-8" />
        {menuItems.map((item) => (
          <Button
            key={item.id}
            variant="ghost"
            size="icon"
            className="h-10 w-10"
            title={item.label}
          >
            <item.icon className="h-5 w-5" />
          </Button>
        ))}
      </div>
    );
  }

  return (
    <aside className="w-64 border-r bg-muted/30 backdrop-blur-sm flex flex-col">
      <div className="p-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-9 w-9 rounded-lg bg-linear-to-br from-purple-500 to-pink-500 flex items-center justify-center">
            <MessageCircle className="h-5 w-5 text-white" />
          </div>
          <span className="font-semibold text-sm">
            {language === "ne" ? "पालिका एजेन्ट" : "Palika Agent"}
          </span>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCollapsed(true)}
          className="h-8 w-8 lg:hidden"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="px-3 pb-3">
        <input
          type="search"
          placeholder={
            language === "ne" ? "च्याट खोज्नुहोस्" : "Search chat"
          }
          className="w-full h-9 px-3 rounded-lg bg-background/50 border border-border/50 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
        />
      </div>

      <nav className="px-3 space-y-1">
        {menuItems.map((item) => (
          <Button
            key={item.id}
            variant="ghost"
            className="w-full justify-start h-9 px-3 text-sm font-normal"
          >
            <item.icon className="h-4 w-4 mr-2" />
            {item.label}
          </Button>
        ))}
      </nav>

      <Separator className="my-4" />

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
          {chatHistory.length === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-8">
              {language === "ne"
                ? "कुनै च्याट इतिहास छैन"
                : "No chat history"}
            </p>
          ) : (
            chatHistory.map((chat) => (
              <button
                key={chat.id}
                onClick={() => onSelectChat(chat.id)}
                className={`w-full text-left px-3 py-2.5 rounded-lg text-sm transition-colors hover:bg-accent group ${
                  currentChatId === chat.id ? "bg-accent" : ""
                }`}
              >
                <div className="flex items-start gap-2">
                  <MessageCircle className="h-4 w-4 mt-0.5 shrink-0 text-muted-foreground group-hover:text-foreground" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{chat.title}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {chat.preview}
                    </p>
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
      </ScrollArea>
    </aside>
  );
}
