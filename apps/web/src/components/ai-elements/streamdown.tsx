"use client";

import { cn } from "@/lib/utils";
import { type ComponentProps, memo } from "react";
import { Streamdown as StreamdownComponent } from "streamdown";

type StreamdownProps = ComponentProps<typeof StreamdownComponent>;

export const Streamdown = memo(
  ({ className, ...props }: StreamdownProps) => (
    <StreamdownComponent
      className={cn(
        "size-full [&>*:first-child]:mt-0 [&>*:last-child]:mb-0",
        className
      )}
      {...props}
    />
  ),
  (prevProps, nextProps) => prevProps.children === nextProps.children
);

Streamdown.displayName = "Streamdown";
