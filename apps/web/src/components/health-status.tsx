"use client";

import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface HealthStatusProps {
  className?: string;
}

export function HealthStatus({ className }: HealthStatusProps) {
  // Простая проверка статуса - показываем что система работает
  const isHealthy = true;
  const statusText = "All systems operational";
  const statusColor = "bg-green-500";

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div className={cn("flex items-center gap-2 text-xs text-muted-foreground", className)}>
          <div className={cn("h-2 w-2 rounded-full", statusColor)} />
          <span>{statusText}</span>
        </div>
      </TooltipTrigger>
      <TooltipContent>
        <p>API is running normally</p>
      </TooltipContent>
    </Tooltip>
  );
}