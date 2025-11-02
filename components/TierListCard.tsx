"use client";

import { Button } from "@whop/react/components";
import type { TierListTemplate } from "@/lib/types";

interface TierListCardProps {
	template: TierListTemplate;
	onView?: () => void;
	onStart?: () => void;
}

export function TierListCard({
	template,
	onView,
	onStart,
}: TierListCardProps) {
	const statusColor =
		template.status === "published"
			? "default"
			: template.status === "open_for_submission"
				? "secondary"
				: "outline";

	const statusBadgeClass =
		template.status === "published"
			? "bg-blue-2 text-blue-11"
			: template.status === "open_for_submission"
				? "bg-green-2 text-green-11"
				: "bg-gray-a3 text-gray-10";

	const accessBadgeClass =
		template.accessType === "free"
			? "bg-green-2 text-green-11"
			: "bg-blue-2 text-blue-11";

	return (
		<div className="bg-gray-a2 border border-gray-a4 rounded-lg p-6">
			<div className="mb-4">
				<h3 className="text-5 font-bold text-gray-12 mb-2">
					{template.title}
				</h3>
				<div className="flex gap-2 items-center">
					<span className={`px-2 py-1 rounded text-2 font-medium ${statusBadgeClass}`}>
						{template.status}
					</span>
					<span className={`px-2 py-1 rounded text-2 font-medium ${accessBadgeClass}`}>
					Free
					</span>
				</div>
			</div>
			<div>
				<div className="flex gap-2">
					{template.status === "published" && (
						<Button variant="classic" size="3" onClick={onView} className="w-full">
							View
						</Button>
					)}
					{template.status === "open_for_submission" && (
						<Button variant="classic" size="3" onClick={onStart} className="w-full">
							Start
						</Button>
					)}
				</div>
			</div>
		</div>
	);
}

