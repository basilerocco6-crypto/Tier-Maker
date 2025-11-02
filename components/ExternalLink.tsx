"use client";

import { useIframeSdk } from "@whop/react";
import { useState } from "react";

interface ExternalLinkProps {
	href: string;
	children: React.ReactNode;
	className?: string;
	target?: string;
	onClick?: (e: React.MouseEvent<HTMLAnchorElement>) => void;
}

/**
 * ExternalLink component
 * 
 * Opens external URLs using iframe SDK's openExternalUrl() method
 * Falls back to regular link behavior if iframe SDK is not available
 * 
 * @example
 * <ExternalLink href="https://example.com">Visit Example</ExternalLink>
 */
export function ExternalLink({
	href,
	children,
	className,
	target,
	onClick,
}: ExternalLinkProps) {
	const iframeSdk = useIframeSdk();
	const [error, setError] = useState<string | null>(null);

	const handleClick = async (e: React.MouseEvent<HTMLAnchorElement>) => {
		e.preventDefault();

		// Call custom onClick if provided
		if (onClick) {
			onClick(e);
		}

		try {
			// Use iframe SDK if available
			if (iframeSdk?.openExternalUrl && typeof iframeSdk.openExternalUrl === "function") {
				await iframeSdk.openExternalUrl({ url: href });
			} else {
				// Fallback to regular link behavior
				if (target === "_blank") {
					window.open(href, target);
				} else {
					window.location.href = href;
				}
			}
		} catch (error: any) {
			console.error("[EXTERNAL LINK ERROR]", error);
			setError(error.message || "Failed to open external URL");
			
			// Fallback to regular link behavior on error
			setTimeout(() => {
				if (target === "_blank") {
					window.open(href, target);
				} else {
					window.location.href = href;
				}
			}, 100);
		}
	};

	return (
		<>
			<a
				href={href}
				onClick={handleClick}
				className={className}
				target={target}
				rel={target === "_blank" ? "noopener noreferrer" : undefined}
			>
				{children}
			</a>
			{error && (
				<span className="text-red-11 text-2 ml-2" title={error}>
					⚠️
				</span>
			)}
		</>
	);
}

