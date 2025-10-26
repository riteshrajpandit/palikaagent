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
      className="p-4 cursor-pointer transition-all hover:shadow-md hover:scale-[1.02] bg-linear-to-br from-[#00a79d]/5 to-[#273b4b]/5 dark:from-[#00a79d]/10 dark:to-[#273b4b]/10 border-[#00a79d]/20 dark:border-[#00a79d]/30 group"
    >
      <div className="flex flex-col gap-3">
        <div className="h-10 w-10 rounded-lg bg-linear-to-br from-[#00a79d] to-[#273b4b] flex items-center justify-center group-hover:scale-110 transition-transform">
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
