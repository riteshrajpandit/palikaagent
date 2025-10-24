"use client";

import { useState, useRef, useEffect } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChatMessage } from "@/components/ChatMessage";
import { ChatInput } from "@/components/ChatInput";
import { SuggestionCard } from "@/components/SuggestionCard";
import { LoginDialog } from "@/components/LoginDialog";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { sendMessageToBot } from "@/lib/api";
import { speechService } from "@/lib/speech";
import { toast } from "sonner";
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
  audioUrl?: string; // Cached audio URL for replay
  isVoiceInput?: boolean; // Track if message was sent via voice
}

export function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [speakingMessageId, setSpeakingMessageId] = useState<string | null>(null);
  const [isUserTyping, setIsUserTyping] = useState(false);
  const [showLoginDialog, setShowLoginDialog] = useState(false);
  const [pendingMessage, setPendingMessage] = useState<{ text: string; isVoice: boolean } | null>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const { language } = useLanguage();
  const { isAuthenticated, logout } = useAuth();
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

  const handleSendMessage = async (text: string, isVoiceInput: boolean = false) => {
    // Check if user is authenticated
    if (!isAuthenticated) {
      setPendingMessage({ text, isVoice: isVoiceInput });
      setShowLoginDialog(true);
      toast.info(
        language === "ne" ? "लग इन आवश्यक छ" : "Login Required",
        {
          description: language === "ne"
            ? "कृपया सन्देश पठाउन लग इन गर्नुहोस्"
            : "Please sign in to send messages",
        }
      );
      return;
    }

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
      let audioUrl: string | undefined;
      try {
        audioUrl = await speechService.synthesizeToAudio(response, language);
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
      
      // Check if it's a session expired error
      if (error instanceof Error && error.message.includes("Session expired")) {
        // Logout user
        logout();
        
        // Store message as pending and show login dialog
        setPendingMessage({ text, isVoice: isVoiceInput });
        setShowLoginDialog(true);
        
        toast.error(
          language === "ne" ? "सत्र समाप्त भयो" : "Session Expired",
          {
            description: language === "ne"
              ? "कृपया फेरि लग इन गर्नुहोस्"
              : "Please login again to continue",
          }
        );
      } else {
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
      }
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

      const recognizedText = await speechService.recognizeSpeech(language);
      
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
        // Generate and play
        const newAudioUrl = await speechService.synthesizeToAudio(text, language);
        
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

  // Handle successful login - send pending message
  const handleLoginSuccess = () => {
    if (pendingMessage) {
      // Send the pending message after successful login
      setTimeout(() => {
        handleSendMessage(pendingMessage.text, pendingMessage.isVoice);
        setPendingMessage(null);
      }, 300);
    }
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
    <div className="flex flex-col h-full w-full overflow-hidden">
      {/* Scrollable messages area */}
      <div className="flex-1 overflow-y-auto">
        <ScrollArea ref={scrollAreaRef} className="h-full">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center min-h-[calc(100vh-16rem)] text-center px-4 py-12">
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
            <div className="max-w-3xl mx-auto px-4 py-6 space-y-4 pb-8">
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
      </div>

      {/* Fixed input field at bottom */}
      <div className="shrink-0 border-t bg-background/95 backdrop-blur-lg p-4 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]">
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

      {/* Login Dialog */}
      <LoginDialog
        open={showLoginDialog}
        onOpenChange={setShowLoginDialog}
        onSuccess={handleLoginSuccess}
      />
    </div>
  );
}
