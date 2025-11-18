"use client";

import { useState, KeyboardEvent, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Mic, Square } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  onVoiceInput: () => void;
  onTypingStart?: () => void;
  disabled?: boolean;
  isListening?: boolean;
}

export function ChatInput({
  onSendMessage,
  onVoiceInput,
  onTypingStart,
  disabled = false,
  isListening = false,
}: ChatInputProps) {
  const [message, setMessage] = useState("");
  const { t } = useLanguage();
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-focus input on mount and after sending messages
  useEffect(() => {
    if (!disabled && !isListening) {
      inputRef.current?.focus();
    }
  }, [disabled, isListening, message]); // Re-focus when message changes (after send)

  // Handle mobile keyboard - scroll to input when focused
  useEffect(() => {
    const input = inputRef.current;
    if (!input) return;

    const handleFocus = () => {
      // On mobile, scroll the input into view when keyboard opens
      if (window.innerWidth < 1024) {
        setTimeout(() => {
          input.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }, 300); // Delay to allow keyboard animation
      }
    };

    input.addEventListener('focus', handleFocus);

    return () => {
      input.removeEventListener('focus', handleFocus);
    };
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessage(e.target.value);
    // Notify parent that user is typing
    if (onTypingStart && e.target.value.length > 0) {
      onTypingStart();
    }
  };

  const handleSend = () => {
    if (message.trim() && !disabled) {
      onSendMessage(message.trim());
      setMessage("");
      // Focus will be restored automatically via useEffect when message state changes
    }
  };

  const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex gap-1.5 sm:gap-2 items-center">
      <div className="relative flex-1">
        <Input
          ref={inputRef}
          value={message}
          onChange={handleInputChange}
          onKeyPress={handleKeyPress}
          placeholder={t.placeholder}
          disabled={disabled}
          className="pr-11 sm:pr-12 h-11 sm:h-12 rounded-full bg-muted/50 border-muted focus-visible:ring-2 focus-visible:ring-primary text-sm sm:text-base"
          autoFocus
        />
        <Button
          type="button"
          size="icon"
          variant="ghost"
          onClick={onVoiceInput}
          disabled={disabled}
          className={`absolute right-1 top-1/2 -translate-y-1/2 h-9 w-9 sm:h-10 sm:w-10 rounded-full ${
            isListening
              ? "bg-red-500 hover:bg-red-600 text-white animate-pulse"
              : "hover:bg-primary/10"
          }`}
          title={isListening ? t.listening : t.voiceButton}
        >
          {isListening ? (
            <Square className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          ) : (
            <Mic className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          )}
        </Button>
      </div>
      <Button
        onClick={handleSend}
        disabled={!message.trim() || disabled}
        size="icon"
        className="h-11 w-11 sm:h-12 sm:w-12 rounded-full shadow-lg hover:shadow-xl transition-shadow"
      >
        <Send className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
      </Button>
    </div>
  );
}
