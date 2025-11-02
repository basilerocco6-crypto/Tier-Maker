"use client";

import { ExternalLink } from "./ExternalLink";
import { Button } from "@whop/react/components";

interface ExternalLinkButtonProps {
	href: string;
	children: React.ReactNode;
	variant?: "classic" | "ghost" | "solid" | "soft" | "surface";
	size?: "1" | "2" | "3" | "4";
	className?: string;
}

/**
 * ExternalLinkButton component
 * 
 * Wraps a Button component with ExternalLink for use in server components
 * 
 * @example
 * <ExternalLinkButton href="https://docs.whop.com/apps" variant="classic" size="3">
 *   Developer Docs
 * </ExternalLinkButton>
 */
export function ExternalLinkButton({
	href,
	children,
	variant = "classic",
	size = "3",
	className,
}: ExternalLinkButtonProps) {
	return (
		<ExternalLink href={href}>
			<Button variant={variant} size={size} className={className}>
				{children}
			</Button>
		</ExternalLink>
	);
}

