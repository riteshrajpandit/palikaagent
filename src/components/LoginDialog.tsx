"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { toast } from "sonner";
import { Loader2, Lock, Mail } from "lucide-react";

interface LoginDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function LoginDialog({ open, onOpenChange, onSuccess }: LoginDialogProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const { language } = useLanguage();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error(
        language === "ne" ? "त्रुटि" : "Error",
        {
          description: language === "ne"
            ? "कृपया सबै फिल्डहरू भर्नुहोस्"
            : "Please fill in all fields",
        }
      );
      return;
    }

    setIsLoading(true);

    try {
      await login({
        email_address: email,
        password: password,
      });

      // Show success message
      toast.success(
        language === "ne" ? "सफल" : "Success",
        {
          description: language === "ne"
            ? "सफलतापूर्वक लग इन भयो"
            : "Successfully logged in",
        }
      );

      // Reset form
      setEmail("");
      setPassword("");
      
      // Close dialog first
      onOpenChange(false);
      
      // Then call success callback if provided
      // Small delay to ensure dialog close animation completes
      if (onSuccess) {
        setTimeout(() => {
          onSuccess();
        }, 100);
      }
    } catch (error) {
      console.error("Login error:", error);
      
      // Determine error message based on error type
      let errorTitle = language === "ne" ? "लग इन असफल" : "Login Failed";
      let errorDescription = language === "ne"
        ? "कृपया आफ्नो इमेल र पासवर्ड जाँच गर्नुहोस्"
        : "Please check your email and password";
      
      if (error instanceof Error) {
        // Handle specific error cases
        if (error.message.includes("401") || error.message.includes("Unauthorized")) {
          errorTitle = language === "ne" ? "अधिकृत छैन" : "Unauthorized";
          errorDescription = language === "ne"
            ? "गलत इमेल वा पासवर्ड"
            : "Invalid email or password";
        } else if (error.message.includes("403") || error.message.includes("Forbidden")) {
          errorTitle = language === "ne" ? "पहुँच अस्वीकृत" : "Access Denied";
          errorDescription = language === "ne"
            ? "तपाईंसँग यो खाता पहुँच गर्ने अनुमति छैन"
            : "You don't have permission to access this account";
        } else if (error.message.includes("Network") || error.message.includes("Failed to fetch")) {
          errorTitle = language === "ne" ? "नेटवर्क त्रुटि" : "Network Error";
          errorDescription = language === "ne"
            ? "कृपया आफ्नो इन्टरनेट जडान जाँच गर्नुहोस्"
            : "Please check your internet connection";
        } else if (error.message) {
          errorDescription = error.message;
        }
      }
      
      toast.error(errorTitle, {
        description: errorDescription,
        duration: 5000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-center">
            {language === "ne" ? "लग इन गर्नुहोस्" : "Sign In"}
          </DialogTitle>
          <DialogDescription className="text-center">
            {language === "ne"
              ? "पालिका एजेन्ट प्रयोग गर्न लग इन गर्नुहोस्"
              : "Sign in to continue using Palika Agent"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <label
              htmlFor="email"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              {language === "ne" ? "इमेल" : "Email"}
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                placeholder={
                  language === "ne"
                    ? "तपाईंको इमेल"
                    : "your.email@example.com"
                }
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                className="pl-10"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label
              htmlFor="password"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              {language === "ne" ? "पासवर्ड" : "Password"}
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="password"
                type="password"
                placeholder={language === "ne" ? "••••••••" : "••••••••"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                className="pl-10"
                required
              />
            </div>
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {language === "ne" ? "लग इन हुँदै..." : "Signing in..."}
              </>
            ) : (
              language === "ne" ? "लग इन गर्नुहोस्" : "Sign In"
            )}
          </Button>
        </form>

        <div className="text-center text-xs text-muted-foreground mt-4">
          {language === "ne"
            ? "लग इन गरेर, तपाईं हाम्रो सेवा सर्तहरूमा सहमत हुनुहुन्छ"
            : "By signing in, you agree to our Terms of Service"}
        </div>
      </DialogContent>
    </Dialog>
  );
}
