"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";

type Language = "en" | "ne";
type VoiceLanguage = "en" | "ne";

interface Translations {
  title: string;
  subtitle: string;
  placeholder: string;
  sendButton: string;
  voiceButton: string;
  clearChat: string;
  language: string;
  theme: string;
  light: string;
  dark: string;
  system: string;
  listening: string;
  speaking: string;
  stopSpeaking: string;
  errorMessage: string;
  noMicrophoneAccess: string;
}

const translations: Record<Language, Translations> = {
  en: {
    title: "Palika Agent",
    subtitle: "Your AI-powered municipal assistant",
    placeholder: "Type your message here...",
    sendButton: "Send",
    voiceButton: "Voice Input",
    clearChat: "Clear Chat",
    language: "Language",
    theme: "Theme",
    light: "Light",
    dark: "Dark",
    system: "System",
    listening: "Listening...",
    speaking: "Speaking...",
    stopSpeaking: "Stop Speaking",
    errorMessage: "An error occurred. Please try again.",
    noMicrophoneAccess: "Microphone access denied. Please enable microphone permissions.",
  },
  ne: {
    title: "पालिका एजेन्ट",
    subtitle: "तपाईंको AI-संचालित नगरपालिका सहायक",
    placeholder: "यहाँ आफ्नो सन्देश टाइप गर्नुहोस्...",
    sendButton: "पठाउनुहोस्",
    voiceButton: "आवाज इनपुट",
    clearChat: "च्याट सफा गर्नुहोस्",
    language: "भाषा",
    theme: "थिम",
    light: "उज्यालो",
    dark: "अँध्यारो",
    system: "प्रणाली",
    listening: "सुन्दै...",
    speaking: "बोल्दै...",
    stopSpeaking: "बोल्न रोक्नुहोस्",
    errorMessage: "त्रुटि भयो। कृपया फेरि प्रयास गर्नुहोस्।",
    noMicrophoneAccess: "माइक्रोफोन पहुँच अस्वीकृत। कृपया माइक्रोफोन अनुमति सक्षम गर्नुहोस्।",
  },
};

interface LanguageContextType {
  language: Language;
  voiceLanguage: VoiceLanguage;
  setLanguage: (lang: Language) => void;
  setVoiceLanguage: (lang: VoiceLanguage) => void;
  t: Translations;
}

const LanguageContext = createContext<LanguageContextType | undefined>(
  undefined
);

export function LanguageProvider({ children }: { children: ReactNode }) {
  // Initialize with localStorage value or default to Nepali
  const [language, setLanguageState] = useState<Language>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("ui-language") as Language;
      return saved || "ne";
    }
    return "ne";
  });

  // Voice language is always Nepali by default (independent of UI language)
  const [voiceLanguage, setVoiceLanguageState] = useState<VoiceLanguage>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("voice-language") as VoiceLanguage;
      return saved || "ne";
    }
    return "ne";
  });

  // Save language preference to localStorage when it changes
  const handleSetLanguage = (lang: Language) => {
    setLanguageState(lang);
    if (typeof window !== "undefined") {
      localStorage.setItem("ui-language", lang);
    }
  };

  const handleSetVoiceLanguage = (lang: VoiceLanguage) => {
    setVoiceLanguageState(lang);
    if (typeof window !== "undefined") {
      localStorage.setItem("voice-language", lang);
    }
  };

  const value = {
    language,
    voiceLanguage,
    setLanguage: handleSetLanguage,
    setVoiceLanguage: handleSetVoiceLanguage,
    t: translations[language],
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}