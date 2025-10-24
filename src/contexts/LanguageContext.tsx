"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";

type Language = "en" | "ne";

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
  },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: Translations;
}

const LanguageContext = createContext<LanguageContextType | undefined>(
  undefined
);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>("en");

  const value = {
    language,
    setLanguage,
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