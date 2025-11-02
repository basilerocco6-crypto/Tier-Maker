"use client";

import { useEffect } from "react";
import { useIframeSdk } from "@whop/react";
import { Button } from "@whop/react/components";
import { UserProfileLink } from "./UserProfileLink";
interface TierMakerAppProps {
	experienceId: string;
	userId: string;
	experience: any; // Experience type from Whop SDK
	user: any; // User type from Whop SDK
}

/**
 * Main Tier Maker App Component
 * 
 * This redirects to the Tier List dashboard since that's the main entry point
 * for the Tier List application.
 */
export function TierMakerApp({
	experienceId,
	userId,
	experience,
	user,
}: TierMakerAppProps) {
	const iframeSdk = useIframeSdk();

	// Helper function for navigation
	const navigateTo = (path: string) => {
		if (iframeSdk && typeof (iframeSdk as any).navigate === "function") {
			(iframeSdk as any).navigate(path);
		} else {
			window.location.href = path;
		}
	};

	// Redirect to dashboard on mount
	useEffect(() => {
		navigateTo("/");
	}, []);

	return (
		<div className="min-h-screen flex items-center justify-center p-8">
			<div className="text-center">
				<h1 className="text-9 font-bold text-gray-12 mb-4">
					Redirecting to Tier List Gallery...
				</h1>
				<p className="text-3 text-gray-10 mb-4">
					Welcome, {user.name ? (
						user.name
					) : (
						<UserProfileLink username={user.username} showUsername />
					)}!
				</p>
				<Button variant="classic" size="4" onClick={() => navigateTo("/")}>
					Go to Dashboard
				</Button>
			</div>
		</div>
	);
}


