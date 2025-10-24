"use client";

import { Card } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface SuggestionCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  onClick: () => void;
}

export function SuggestionCard({
  icon: Icon,
  title,
  description,
  onClick,
}: SuggestionCardProps) {
  return (
    <Card
      onClick={onClick}
      className="p-4 cursor-pointer transition-all hover:shadow-md hover:scale-[1.02] bg-linear-to-br from-purple-50/50 to-pink-50/50 dark:from-purple-950/20 dark:to-pink-950/20 border-purple-100 dark:border-purple-900/30 group"
    >
      <div className="flex flex-col gap-3">
        <div className="h-10 w-10 rounded-lg bg-linear-to-br from-purple-500 to-pink-500 flex items-center justify-center group-hover:scale-110 transition-transform">
          <Icon className="h-5 w-5 text-white" />
        </div>
        <div>
          <h3 className="font-semibold text-sm mb-1">{title}</h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            {description}
          </p>
        </div>
      </div>
    </Card>
  );
}
