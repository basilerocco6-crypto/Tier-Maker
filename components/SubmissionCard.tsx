"use client";

import { UserProfileLink } from "./UserProfileLink";
import type { TierListSubmission } from "@/lib/types";

interface SubmissionCardProps {
	submission: TierListSubmission;
	username?: string; // Optional username if available
	onClick?: () => void;
}

/**
 * SubmissionCard component
 * 
 * Displays a tier list submission card with user profile link
 * Uses UserProfileLink to open user profiles in modal
 */
export function SubmissionCard({
	submission,
	username,
	onClick,
}: SubmissionCardProps) {
	const displayDate = new Date(submission.createdAt).toLocaleDateString("en-US", {
		year: "numeric",
		month: "short",
		day: "numeric",
	});

	return (
		<div
			className="bg-gray-a2 border border-gray-a4 rounded-lg p-6 cursor-pointer hover:border-gray-a6 transition-colors"
			onClick={onClick}
		>
			<div className="flex justify-between items-start mb-2">
				<div>
					{username ? (
						<UserProfileLink username={username} showUsername>
							<span className="text-5 font-semibold text-gray-12">
								@{username}
							</span>
						</UserProfileLink>
					) : (
						<span className="text-5 font-semibold text-gray-12">
							User {submission.userId.slice(0, 8)}
						</span>
					)}
				</div>
				<span className="text-2 text-gray-9">{displayDate}</span>
			</div>
			<div className="text-3 text-gray-10 mt-2">
				{submission.userPlacement && Object.keys(submission.userPlacement).length > 0
					? `${Object.keys(submission.userPlacement).length} items placed`
					: "No items placed"}
			</div>
		</div>
	);
}

