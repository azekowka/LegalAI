"use client";

import { cn } from "@/lib/utils";
import { type ComponentProps, memo } from "react";
import { Streamdown } from "streamdown";

type ResponseProps = ComponentProps<typeof Streamdown> & {
  className?: string;
};

export const Response = memo(
  ({ className, children, ...props }: ResponseProps) => (
    <Streamdown
      className={cn(
        "size-full prose prose-gray max-w-none [&>*:first-child]:mt-0 [&>*:last-child]:mb-0",
        "[&_h1]:text-2xl [&_h1]:font-bold [&_h1]:mb-4 [&_h1]:mt-6",
        "[&_h2]:text-xl [&_h2]:font-semibold [&_h2]:mb-3 [&_h2]:mt-5",
        "[&_h3]:text-lg [&_h3]:font-semibold [&_h3]:mb-2 [&_h3]:mt-4",
        "[&_p]:mb-4 [&_p]:leading-7",
        "[&_ul]:mb-4 [&_ul]:pl-6 [&_ul]:list-disc",
        "[&_ol]:mb-4 [&_ol]:pl-6 [&_ol]:list-decimal",
        "[&_li]:mb-1",
        "[&_code]:bg-gray-100 [&_code]:px-1 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-sm [&_code]:font-mono",
        "[&_pre]:bg-gray-100 [&_pre]:p-4 [&_pre]:rounded-lg [&_pre]:overflow-x-auto [&_pre]:mb-4",
        "[&_blockquote]:border-l-4 [&_blockquote]:border-gray-300 [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:mb-4",
        "[&_table]:mb-4 [&_table]:border-collapse [&_table]:w-full",
        "[&_th]:border [&_th]:border-gray-300 [&_th]:px-3 [&_th]:py-2 [&_th]:bg-gray-50 [&_th]:font-semibold",
        "[&_td]:border [&_td]:border-gray-300 [&_td]:px-3 [&_td]:py-2",
        "[&_a]:text-blue-600 [&_a]:hover:text-blue-800 [&_a]:underline",
        "[&_strong]:font-semibold",
        "[&_em]:italic",
        className
      )}
      parseIncompleteMarkdown={true}
      {...props}
    >
      {children}
    </Streamdown>
  ),
  (prevProps, nextProps) => prevProps.children === nextProps.children
);

Response.displayName = "Response";
