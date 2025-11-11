"use client";

import { useIframeSdk } from "@whop/react";
import { TierListCardWithDelete } from "@/components/TierListCardWithDelete";
import type { TierListTemplate } from "@/lib/types";

interface TierListGridProps {
	tierLists: TierListTemplate[];
	userId: string | null;
}

export function TierListGrid({ tierLists, userId }: TierListGridProps) {
	const iframeSdk = useIframeSdk();

	const handleDelete = () => {
		// Refresh the page after deletion
		if (iframeSdk && typeof (iframeSdk as any).navigate === "function") {
			(iframeSdk as any).navigate("/");
		} else {
			window.location.reload();
		}
	};

	if (tierLists.length === 0) {
		return (
			<div className="text-center py-16">
				<p className="text-4 text-gray-10 mb-4">
					No tier lists yet. Create your first one!
				</p>
			</div>
		);
	}

	return (
		<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
			{tierLists.map((template) => (
				<TierListCardWithDelete
					key={template.id}
					template={template}
					userId={userId}
					onDelete={handleDelete}
				/>
			))}
		</div>
	);
}

