"use client";

import { DiscordIcon, GitHubIcon, LanguagesIcon, LogoIcon, XPlatformIcon } from "@/components/icons";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { ModeToggle } from "@/components/mode-toggle";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Header() {
	return (
		<header className="border-border bg-surface/80 fixed top-4 left-1/2 z-50 mx-auto flex w-full max-w-xs -translate-x-1/2 items-center justify-between rounded-lg border px-4 py-2 backdrop-blur-xs md:max-w-2xl">
			<h1>
				<Link href="/" className="hover:text-primary/80 flex items-center gap-2 font-bold transition-colors">
					<span>
						{/*<LogoIcon className="h-9 w-9" aria-hidden="true" />*/}
					</span>
					<span className="hidden md:inline">LEGAL AI</span>
				</Link>
			</h1>
			<div className="flex items-center gap-1">
				<Tooltip>
					<TooltipTrigger asChild>
						<Button variant="ghost" asChild aria-label="Languages" className="h-9 w-9">
							<Link href="#">
								<LanguagesIcon size={20} />
							</Link>
						</Button>
					</TooltipTrigger>
					<TooltipContent>Languages</TooltipContent>
				</Tooltip>
				<Tooltip>
					<TooltipTrigger asChild>
						<Button variant="ghost" aria-label="Discord" className="h-9 w-9">
							<a href="#" target="_blank" rel="noopener noreferrer">
								<DiscordIcon />
							</a>
						</Button>
					</TooltipTrigger>
					<TooltipContent>Discord</TooltipContent>
				</Tooltip>
				<Tooltip>
					<TooltipTrigger asChild>
						<Button variant="ghost" asChild className="h-9 w-9">
							<a href="#" target="_blank" rel="noopener noreferrer">
								<GitHubIcon />
							</a>
						</Button>
					</TooltipTrigger>
					<TooltipContent>Github</TooltipContent>
				</Tooltip>
				<Tooltip>
					<TooltipTrigger asChild>
						<Button variant="ghost" aria-label="X (Twitter)" className="h-9 w-9">
							<a href="#" target="_blank" rel="noopener noreferrer">
								<XPlatformIcon />
							</a>
						</Button>
					</TooltipTrigger>
					<TooltipContent>X (Twitter)</TooltipContent>
				</Tooltip>
				<ModeToggle />
			</div>
		</header>
	);
}
