"use client";

import { useState, useRef, useEffect } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChatMessage } from "@/components/ChatMessage";
import { ChatInput } from "@/components/ChatInput";
import { SuggestionCard } from "@/components/SuggestionCard";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { sendMessageToBot } from "@/lib/api";
import { speechService } from "@/lib/speech";
import { toast } from "sonner";
import {
  saveChat,
  getChatById,
  generateChatTitle,
  generateChatPreview,
  type Chat,
} from "@/lib/chatHistory";
import {
  Building,
  FileText,
  BookOpen,
} from "lucide-react";

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  audioUrl?: string; // Cached audio URL for replay
  isVoiceInput?: boolean; // Track if message was sent via voice
}

interface ChatInterfaceProps {
  currentChatId?: string;
  onChatUpdate?: () => void; // Callback to notify parent of chat changes
}

export function ChatInterface({ currentChatId, onChatUpdate }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [speakingMessageId, setSpeakingMessageId] = useState<string | null>(null);
  const [isUserTyping, setIsUserTyping] = useState(false);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const inputContainerRef = useRef<HTMLDivElement>(null);
  const { language, voiceLanguage } = useLanguage();
  const { user, isAuthenticated } = useAuth();
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

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

  // Handle mobile keyboard appearance - adjust scroll and input position
  useEffect(() => {
    // Only run on mobile browsers that support visualViewport
    if (typeof window === 'undefined' || !window.visualViewport) return;

    const handleResize = () => {
      const viewport = window.visualViewport;
      if (!viewport || !inputContainerRef.current) return;

      // When keyboard opens, viewport height decreases
      const viewportHeight = viewport.height;
      const isKeyboardOpen = window.innerHeight - viewportHeight > 150; // threshold for keyboard

      if (isKeyboardOpen) {
        // Scroll to show the latest message when keyboard opens
        setTimeout(scrollToBottom, 100);
      }
    };

    window.visualViewport.addEventListener('resize', handleResize);
    window.visualViewport.addEventListener('scroll', handleResize);

    return () => {
      if (window.visualViewport) {
        window.visualViewport.removeEventListener('resize', handleResize);
        window.visualViewport.removeEventListener('scroll', handleResize);
      }
    };
  }, [messages]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  // Load chat when currentChatId changes
  useEffect(() => {
    if (currentChatId && isAuthenticated && user) {
      const chat = getChatById(user.user_id, currentChatId);
      if (chat) {
        setMessages(chat.messages);
        setActiveChatId(chat.id);
      }
    } else if (!currentChatId) {
      // New chat - clear messages
      setMessages([]);
      setActiveChatId(null);
    }
  }, [currentChatId, isAuthenticated, user]);

  // Save chat to localStorage whenever messages change (for authenticated users only)
  useEffect(() => {
    if (!isAuthenticated || !user || messages.length === 0) return;

    const saveCurrentChat = () => {
      const chatId = activeChatId || `chat-${Date.now()}`;
      const isNewChat = !activeChatId;
      
      // Generate title from first user message
      const firstUserMessage = messages.find((m) => m.isUser);
      const title = firstUserMessage 
        ? generateChatTitle(firstUserMessage.text, language)
        : language === "ne" ? "नयाँ कुराकानी" : "New Chat";

      const preview = generateChatPreview(messages);

      const chat: Chat = {
        id: chatId,
        title,
        preview,
        messages,
        createdAt: isNewChat ? new Date() : new Date(), // Keep original if exists
        updatedAt: new Date(),
      };

      saveChat(user.user_id, chat);
      
      if (isNewChat) {
        setActiveChatId(chatId);
        // Only notify parent for NEW chats to add to sidebar
        if (onChatUpdate) {
          // Use requestIdleCallback or setTimeout to avoid blocking
          if (typeof requestIdleCallback !== 'undefined') {
            requestIdleCallback(() => onChatUpdate());
          } else {
            setTimeout(() => onChatUpdate(), 100);
          }
        }
      }
      // For existing chats, no need to refresh the entire sidebar
    };

    // Debounce save to avoid too many writes (increased to 1.5s for better performance)
    const timeoutId = setTimeout(saveCurrentChat, 1500);
    return () => clearTimeout(timeoutId);
  }, [messages, isAuthenticated, user, language, onChatUpdate, activeChatId]);

  const suggestions = [
   
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

  const handleSendMessage = async (text: string, isVoiceInput: boolean = false) => {
    // Guest users can now send messages without authentication
    // Stop any currently playing audio when sending a new message
    speechService.stopCurrentAudio();
    setSpeakingMessageId(null);

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      text,
      isUser: true,
      timestamp: new Date(),
      isVoiceInput,
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsTyping(true);

    try {
      // Call the actual API
      const response = await sendMessageToBot(text);
      
      const botResponse: Message = {
        id: `bot-${Date.now()}`,
        text: response,
        isUser: false,
        timestamp: new Date(),
        isVoiceInput: false,
      };

      // Generate audio for the response (but don't play yet)
      // Always use voiceLanguage for speech (Nepali by default)
      let audioUrl: string | undefined;
      try {
        audioUrl = await speechService.synthesizeToAudio(response, voiceLanguage);
        botResponse.audioUrl = audioUrl;
      } catch (audioError) {
        console.error("Error generating audio:", audioError);
        // Continue without audio
      }
      
      setMessages((prev) => [...prev, botResponse]);
      
      // Auto-play ONLY if the user's message was sent via voice
      if (isVoiceInput && audioUrl) {
        setTimeout(() => {
          handleSpeak(botResponse.id, response, audioUrl);
        }, 500);
      }
    } catch (error) {
      console.error("Error sending message:", error);
      
      const errorMessage: Message = {
        id: `error-${Date.now()}`,
        text: language === "ne" 
          ? "माफ गर्नुहोस्, म अहिले जवाफ दिन सक्दिन। कृपया फेरि प्रयास गर्नुहोस्।"
          : "Sorry, I couldn't process your request. Please try again.",
        isUser: false,
        timestamp: new Date(),
      };
      
      setMessages((prev) => [...prev, errorMessage]);
      
      toast.error(
        language === "ne" ? "त्रुटि" : "Error",
        {
          description: error instanceof Error ? error.message : "Failed to send message",
        }
      );
    } finally {
      setIsTyping(false);
    }
  };

  const handleVoiceInput = async () => {
    if (isListening) {
      // Stop listening
      speechService.stopRecognizing();
      setIsListening(false);
      return;
    }

    // Stop any currently playing audio when starting voice recording
    speechService.stopCurrentAudio();
    setSpeakingMessageId(null);

    try {
      setIsListening(true);
      
      toast.info(
        language === "ne" ? "सुन्दै..." : "Listening...",
        {
          description: language === "ne" 
            ? "कृपया बोल्नुहोस्..."
            : "Please speak now...",
        }
      );

      // Always use voiceLanguage for speech recognition (Nepali by default)
      const recognizedText = await speechService.recognizeSpeech(voiceLanguage);
      
      if (recognizedText && recognizedText.trim()) {
        // Pass true to indicate this is a voice input
        await handleSendMessage(recognizedText.trim(), true);
      }
    } catch (error) {
      console.error("Voice input error:", error);
      
      toast.error(
        language === "ne" ? "त्रुटि" : "Error",
        {
          description: error instanceof Error 
            ? error.message 
            : language === "ne"
              ? "आवाज पहिचान असफल भयो"
              : "Voice recognition failed",
        }
      );
    } finally {
      setIsListening(false);
    }
  };

  const handleSpeak = async (
    messageId: string, 
    text: string, 
    audioUrl?: string
  ) => {
    // If already speaking this message, stop it
    if (speakingMessageId === messageId) {
      speechService.stopCurrentAudio();
      setSpeakingMessageId(null);
      return;
    }

    try {
      // Stop any current speech
      if (speakingMessageId) {
        speechService.stopCurrentAudio();
      }

      setSpeakingMessageId(messageId);

      // Use cached audio if available, otherwise generate new
      if (audioUrl) {
        await speechService.playAudio(audioUrl, true);
      } else {
        // Generate and play (always use voiceLanguage for speech)
        const newAudioUrl = await speechService.synthesizeToAudio(text, voiceLanguage);
        
        // Update message with audio URL for future replays
        setMessages(prev => 
          prev.map(msg => 
            msg.id === messageId 
              ? { ...msg, audioUrl: newAudioUrl }
              : msg
          )
        );
        
        await speechService.playAudio(newAudioUrl, true);
      }
      
      setSpeakingMessageId(null);
    } catch (error) {
      console.error("Speech synthesis error:", error);
      setSpeakingMessageId(null);
      
      toast.error(
        language === "ne" ? "त्रुटि" : "Error",
        {
          description: language === "ne"
            ? "आवाज प्लेब्याक असफल भयो"
            : "Voice playback failed",
        }
      );
    }
  };

  // Handle typing detection to stop audio
  const handleTypingStart = () => {
    if (!isUserTyping) {
      setIsUserTyping(true);
      // Stop any playing audio when user starts typing
      if (speechService.isPlaying()) {
        speechService.stopCurrentAudio();
        setSpeakingMessageId(null);
      }
    }

    // Reset typing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      setIsUserTyping(false);
    }, 1000);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      speechService.stopCurrentAudio();
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div className="flex flex-col h-full w-full overflow-hidden touch-none">
      {/* Scrollable messages area - Full height minus input */}
      <div className="flex-1 overflow-hidden touch-pan-y">
        <ScrollArea ref={scrollAreaRef} className="h-full smooth-scroll">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center min-h-[calc(100vh-12rem)] sm:min-h-[calc(100vh-16rem)] text-center px-3 sm:px-4 py-6 sm:py-12">
              <div className="max-w-2xl w-full space-y-4 sm:space-y-8">
                <div className="space-y-2 sm:space-y-3">
                  <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold bg-linear-to-r from-[#00a79d] to-[#273b4b] bg-clip-text text-transparent">
                    {language === "ne" ? "नमस्ते" : "Hello"}
                  </h1>
                  <h2 className="text-2xl sm:text-3xl md:text-4xl font-semibold text-muted-foreground">
                    {language === "ne"
                      ? "आज म तपाईंलाई कसरी मद्दत गर्न सक्छु?"
                      : "How can i help you today?"}
                  </h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-3 mt-6 sm:mt-12">
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
            <div className="max-w-3xl mx-auto px-3 sm:px-4 py-4 sm:py-6 space-y-3 sm:space-y-4 pb-24 sm:pb-8">
              {messages.map((message) => (
                <ChatMessage
                  key={message.id}
                  message={message.text}
                  isUser={message.isUser}
                  timestamp={message.timestamp}
                  onSpeak={
                    !message.isUser
                      ? () => handleSpeak(message.id, message.text, message.audioUrl)
                      : undefined
                  }
                  isSpeaking={speakingMessageId === message.id}
                  hasAudio={!!message.audioUrl}
                />
              ))}
              {isTyping && (
                <div className="flex gap-3 mb-4">
                  <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                    <div className="h-4 w-4 rounded-full bg-linear-to-br from-[#00a79d] to-[#273b4b]" />
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
      </div>

      {/* Fixed input field at bottom - Mobile optimized with keyboard handling */}
      <div 
        ref={inputContainerRef}
        className="shrink-0 sticky bottom-0 lg:relative lg:bottom-auto border-t bg-background/98 backdrop-blur-lg px-3 py-3 sm:p-4 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] safe-area-inset-bottom z-50"
      >
        <div className="max-w-3xl mx-auto">
          <ChatInput
            onSendMessage={(text) => handleSendMessage(text, false)}
            onVoiceInput={handleVoiceInput}
            onTypingStart={handleTypingStart}
            disabled={isTyping}
            isListening={isListening}
          />
        </div>
      </div>
    </div>
  );
}
