"use client";

import { useState, KeyboardEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Mic } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  onVoiceInput: () => void;
  disabled?: boolean;
}

export function ChatInput({
  onSendMessage,
  onVoiceInput,
  disabled = false,
}: ChatInputProps) {
  const [message, setMessage] = useState("");
  const { t } = useLanguage();

  const handleSend = () => {
    if (message.trim() && !disabled) {
      onSendMessage(message.trim());
      setMessage("");
    }
  };

  const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex gap-2 items-center">
      <div className="relative flex-1">
        <Input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder={t.placeholder}
          disabled={disabled}
          className="pr-12 h-12 rounded-full bg-muted/50 border-muted focus-visible:ring-2 focus-visible:ring-primary"
        />
        <Button
          type="button"
          size="icon"
          variant="ghost"
          onClick={onVoiceInput}
          disabled={disabled}
          className="absolute right-1 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full hover:bg-primary/10"
          title={t.voiceButton}
        >
          <Mic className="h-4 w-4" />
        </Button>
      </div>
      <Button
        onClick={handleSend}
        disabled={!message.trim() || disabled}
        size="icon"
        className="h-12 w-12 rounded-full shadow-lg hover:shadow-xl transition-shadow"
      >
        <Send className="h-4 w-4" />
      </Button>
    </div>
  );
}
