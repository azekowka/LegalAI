"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface WaitlistFormProps {
	className?: string;
}

export function WaitlistForm({ className }: WaitlistFormProps) {
	return (
		<div className={cn("mx-auto flex w-full max-w-3xl flex-col items-center justify-center gap-4", className)}>
			<form className="mx-auto flex w-full max-w-md flex-col gap-3 sm:flex-row">
				<Input
					placeholder="example@0.email"
					className="placeholder:text-muted-foreground h-11 w-full rounded-lg bg-white/50 px-4 text-base font-medium outline outline-neutral-200 backdrop-blur-3xl placeholder:font-medium md:text-base dark:bg-black/50"
				/>
				<Button
					className="relative h-11 w-full cursor-pointer overflow-hidden rounded-lg pr-3 pl-4 text-base drop-shadow-[0_0_8px_rgba(0,0,0,0.3)] transition-all duration-300 before:absolute before:inset-0 before:translate-x-[-100%] before:bg-gradient-to-r before:from-transparent before:via-white/10 before:to-transparent before:transition-transform before:duration-1000 before:ease-in-out hover:drop-shadow-[0_0_12px_rgba(0,0,0,0.4)] hover:before:translate-x-[100%] sm:w-fit dark:drop-shadow-[0_0_8px_rgba(255,255,255,0.3)] dark:hover:drop-shadow-[0_0_12px_rgba(255,255,255,0.4)]"
					type="submit"
				>
					Join Waitlist
				</Button>
			</form>
			<div className="relative mt-3 flex flex-row items-center justify-center gap-3 text-sm sm:text-base">
				<span className="size-2 animate-pulse rounded-full bg-green-600 dark:bg-green-400" />
				<span className="absolute left-0 size-2 animate-pulse rounded-full bg-green-600 blur-xs dark:bg-green-400" />
				0 people already joined the waitlist
			</div>
		</div>
	);
}
