"use client";

import { trpc } from "@/utils/trpc";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface HealthStatusProps {
  className?: string;
}

export function HealthStatus({ className }: HealthStatusProps) {
  const { data, isLoading, error } = trpc.healthCheck.useQuery(undefined, {
    refetchInterval: 30000, // Проверяем каждые 30 секунд
    retry: 3,
  });

  const isHealthy = data === "OK" && !error;
  const statusText = isLoading 
    ? "Checking..." 
    : isHealthy 
    ? "All systems operational" 
    : "API unavailable";

  const statusColor = isLoading
    ? "bg-yellow-500"
    : isHealthy
    ? "bg-green-500"
    : "bg-red-500";

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div className={cn("flex items-center gap-2 text-xs text-muted-foreground", className)}>
          <div className={cn("h-2 w-2 rounded-full", statusColor)} />
          <span>{statusText}</span>
        </div>
      </TooltipTrigger>
      <TooltipContent>
        <p>
          {isLoading
            ? "Checking API status..."
            : isHealthy
            ? "Backend API is running normally"
            : "Backend API is currently unavailable"}
        </p>
      </TooltipContent>
    </Tooltip>
  );
}