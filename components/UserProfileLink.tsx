"use client";

import { useIframeSdk } from "@whop/react";
import { useState } from "react";

interface UserProfileLinkProps {
	username: string;
	children?: React.ReactNode;
	className?: string;
	showUsername?: boolean;
}

/**
 * UserProfileLink component
 * 
 * Opens Whop user profiles in a modal overlay using iframe SDK
 * Uses format: https://whop.com/@username
 * 
 * @example
 * <UserProfileLink username="johndoe">View Profile</UserProfileLink>
 * <UserProfileLink username="johndoe" showUsername />
 */
export function UserProfileLink({
	username,
	children,
	className,
	showUsername = false,
}: UserProfileLinkProps) {
	const iframeSdk = useIframeSdk();
	const [error, setError] = useState<string | null>(null);
	const [isLoading, setIsLoading] = useState(false);

	const profileUrl = `https://whop.com/@${username.replace(/^@/, "")}`;

	const handleClick = async (e: React.MouseEvent<HTMLAnchorElement>) => {
		e.preventDefault();
		setIsLoading(true);
		setError(null);

		try {
			// Use iframe SDK if available (opens in modal)
			if (iframeSdk?.openExternalUrl && typeof iframeSdk.openExternalUrl === "function") {
				await iframeSdk.openExternalUrl({ url: profileUrl });
			} else {
				// Fallback: open in new tab if iframe SDK not available
				console.warn("[USER PROFILE LINK] iframe SDK not available, opening in new tab");
				window.open(profileUrl, "_blank", "noopener,noreferrer");
			}
		} catch (error: any) {
			console.error("[USER PROFILE LINK ERROR]", error);
			setError(error.message || "Failed to open user profile");
			
			// Fallback to opening in new tab on error
			setTimeout(() => {
				window.open(profileUrl, "_blank", "noopener,noreferrer");
			}, 100);
		} finally {
			setIsLoading(false);
		}
	};

	const displayText = children || (showUsername ? `@${username}` : "View Profile");

	return (
		<>
			<a
				href={profileUrl}
				onClick={handleClick}
				className={className || "text-blue-11 hover:text-blue-10 underline cursor-pointer"}
				title={`View @${username}'s profile`}
			>
				{isLoading ? "Loading..." : displayText}
			</a>
			{error && (
				<span className="text-red-11 text-2 ml-2" title={error}>
					⚠️
				</span>
			)}
		</>
	);
}

