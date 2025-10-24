"use client";

import { useState, useRef, useEffect } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChatMessage } from "@/components/ChatMessage";
import { ChatInput } from "@/components/ChatInput";
import { SuggestionCard } from "@/components/SuggestionCard";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  Clock,
  TrendingUp,
  BookOpen,
  Building,
  FileText,
  Users,
} from "lucide-react";

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

export function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const { t, language } = useLanguage();

  const scrollToBottom = () => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector(
        "[data-radix-scroll-area-viewport]"
      );
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const suggestions = [
    {
      icon: Clock,
      title: language === "ne" ? "२४ घण्टामा के भयो?" : "What's Happen in 24 hours?",
      description:
        language === "ne"
          ? "पछिल्लो २४ घण्टामा विश्वमा भएका घटनाहरू हेर्नुहोस्"
          : "See what's been happening in the world over the last 24 hours",
    },
    {
      icon: Building,
      title: language === "ne" ? "नगरपालिका सेवाहरू" : "Municipal Services",
      description:
        language === "ne"
          ? "तपाईंको नगरपालिकाबाट उपलब्ध सेवाहरूको बारेमा जान्नुहोस्"
          : "Learn about services available from your municipality",
    },
    {
      icon: FileText,
      title: language === "ne" ? "कागजात अनुरोध" : "Document Request",
      description:
        language === "ne"
          ? "नागरिकता, सिफारिस र अन्य कागजातहरूको लागि आवेदन दिनुहोस्"
          : "Apply for citizenship, recommendations and other documents",
    },
    {
      icon: TrendingUp,
      title: language === "ne" ? "विकास परियोजनाहरू" : "Development Projects",
      description:
        language === "ne"
          ? "तपाईंको क्षेत्रमा चलिरहेका विकास कार्यहरू हेर्नुहोस्"
          : "View ongoing development work in your area",
    },
    {
      icon: Users,
      title: language === "ne" ? "सार्वजनिक सुनुवाइ" : "Public Hearing",
      description:
        language === "ne"
          ? "आगामी सार्वजनिक सुनुवाइ र बैठकहरूको जानकारी पाउनुहोस्"
          : "Get information about upcoming public hearings and meetings",
    },
    {
      icon: BookOpen,
      title: language === "ne" ? "ऐन र नियमहरू" : "Laws and Regulations",
      description:
        language === "ne"
          ? "स्थानीय ऐन र नियमहरूको बारेमा जान्नुहोस्"
          : "Learn about local laws and regulations",
    },
  ];

  const handleSuggestionClick = (title: string) => {
    handleSendMessage(title);
  };

  const handleSendMessage = async (text: string) => {
    const userMessage: Message = {
      id: Date.now().toString(),
      text,
      isUser: true,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        text:
          language === "ne"
            ? "नमस्ते! म पालिका एजेन्ट हुँ। म तपाईंलाई नगरपालिका सेवाहरूमा मद्दत गर्न यहाँ छु। तपाईं मलाई कसरी मद्दत गर्न सक्नुहुन्छ?"
            : "Hello! I'm Palika Agent. I'm here to help you with municipal services. How can I assist you today?",
        isUser: false,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, botResponse]);
      setIsTyping(false);
    }, 1000);
  };

  const handleVoiceInput = () => {
    // TODO: Implement voice input functionality
    console.log("Voice input clicked");
    alert(
      language === "ne"
        ? "आवाज इनपुट सुविधा चाँडै आउँदैछ!"
        : "Voice input feature coming soon!"
    );
  };

  return (
    <div className="flex flex-col h-full">
      <ScrollArea ref={scrollAreaRef} className="flex-1">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center min-h-[calc(100vh-12rem)] text-center px-4 py-12">
            <div className="max-w-2xl w-full space-y-8">
              <div className="space-y-3">
                <h1 className="text-4xl md:text-5xl font-bold bg-linear-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  {language === "ne" ? "नमस्ते" : "Hello"}
                </h1>
                <h2 className="text-3xl md:text-4xl font-semibold text-muted-foreground">
                  {language === "ne"
                    ? "आज म तपाईंलाई कसरी मद्दत गर्न सक्छु?"
                    : "How can i help you today?"}
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mt-12">
                {suggestions.map((suggestion, index) => (
                  <SuggestionCard
                    key={index}
                    icon={suggestion.icon}
                    title={suggestion.title}
                    description={suggestion.description}
                    onClick={() => handleSuggestionClick(suggestion.title)}
                  />
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="max-w-3xl mx-auto px-4 py-6 space-y-4">
            {messages.map((message) => (
              <ChatMessage
                key={message.id}
                message={message.text}
                isUser={message.isUser}
                timestamp={message.timestamp}
              />
            ))}
            {isTyping && (
              <div className="flex gap-3 mb-4">
                <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                  <div className="h-4 w-4 rounded-full bg-linear-to-br from-purple-500 to-pink-500" />
                </div>
                <div className="bg-muted rounded-2xl rounded-tl-sm px-4 py-3">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 rounded-full bg-muted-foreground/40 animate-bounce [animation-delay:-0.3s]" />
                    <div className="w-2 h-2 rounded-full bg-muted-foreground/40 animate-bounce [animation-delay:-0.15s]" />
                    <div className="w-2 h-2 rounded-full bg-muted-foreground/40 animate-bounce" />
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </ScrollArea>

      <div className="border-t bg-background/80 backdrop-blur-lg p-4">
        <div className="max-w-3xl mx-auto">
          <ChatInput
            onSendMessage={handleSendMessage}
            onVoiceInput={handleVoiceInput}
            disabled={isTyping}
          />
        </div>
      </div>
    </div>
  );
}
