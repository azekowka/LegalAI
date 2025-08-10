"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useWaitlist } from "@/hooks/use-waitlist";
import { useState, useEffect } from "react";
import { z } from "zod";

interface WaitlistFormProps {
	className?: string;
}

const emailSchema = z.string().email("Введите корректный email адрес");

export function WaitlistForm({ className }: WaitlistFormProps) {
	const { addToWaitlist, getWaitlistCount, isLoading, count } = useWaitlist();
	const [email, setEmail] = useState("");
	const [emailError, setEmailError] = useState("");

	useEffect(() => {
		getWaitlistCount();
	}, []);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		
		// Валидация email
		try {
			emailSchema.parse(email);
			setEmailError("");
		} catch (error) {
			if (error instanceof z.ZodError) {
				setEmailError(error.errors[0].message);
				return;
			}
		}

		const success = await addToWaitlist(email);
		if (success) {
			setEmail("");
		}
	};

	return (
		<div className={cn("mx-auto flex w-full max-w-3xl flex-col items-center justify-center gap-4", className)}>
			<form onSubmit={handleSubmit} className="mx-auto flex w-full max-w-md flex-col gap-3 sm:flex-row">
				<div className="flex flex-col gap-1 w-full">
					<Input
						type="email"
						value={email}
						onChange={(e) => setEmail(e.target.value)}
						placeholder="example@email.com"
						className="placeholder:text-muted-foreground h-11 w-full rounded-lg bg-white/50 px-4 text-base font-medium outline outline-neutral-200 backdrop-blur-3xl placeholder:font-medium md:text-base dark:bg-black/50"
						disabled={isLoading}
						required
					/>
					{emailError && (
						<span className="text-red-500 text-xs mt-1">{emailError}</span>
					)}
				</div>
				<Button
					className="relative h-11 w-full cursor-pointer overflow-hidden rounded-lg pr-3 pl-4 text-base drop-shadow-[0_0_8px_rgba(0,0,0,0.3)] transition-all duration-300 before:absolute before:inset-0 before:translate-x-[-100%] before:bg-gradient-to-r before:from-transparent before:via-white/10 before:to-transparent before:transition-transform before:duration-700 hover:before:translate-x-[100%] sm:w-auto"
					type="submit"
					disabled={isLoading || !email.trim()}
				>
					{isLoading ? "Добавление..." : "Присоединиться"}
				</Button>
			</form>
			<div className="relative mt-3 flex flex-row items-center justify-center gap-3 text-sm sm:text-base">
				<span className="size-2 animate-pulse rounded-full bg-green-600 dark:bg-green-400" />
				<span className="absolute left-0 size-2 animate-pulse rounded-full bg-green-600 blur-xs dark:bg-green-400" />
				{count} {count === 1 ? 'человек уже присоединился' : 'людей уже присоединились'} к списку ожидания
			</div>
		</div>
	);
}
