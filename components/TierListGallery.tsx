"use client";

import { Button } from "@whop/react/components";
import { useIframeSdk } from "@whop/react";
import { TierListCard } from "@/components/TierListCard";
import type { TierListTemplate } from "@/lib/types";

interface TierListGalleryProps {
	tierLists: TierListTemplate[];
	userId: string;
}

export function TierListGallery({
	tierLists,
	userId,
}: TierListGalleryProps) {
	const iframeSdk = useIframeSdk();
	
	// Helper function for navigation that works in both iframe and localhost
	const navigateTo = (path: string) => {
		if (iframeSdk && typeof (iframeSdk as any).navigate === "function") {
			(iframeSdk as any).navigate(path);
		} else {
			// Fallback to window.location for localhost/development
			window.location.href = path;
		}
	};

	return (
		<div className="min-h-screen p-8 bg-gray-a1">
			<div className="max-w-7xl mx-auto">
				<div className="flex justify-between items-center mb-8">
					<h1 className="text-9 font-bold text-gray-12">Tier List Gallery</h1>
					<Button
						variant="classic"
						size="4"
						onClick={() => navigateTo("/admin/builder/new")}
					>
						Create New List
					</Button>
				</div>

				{tierLists.length === 0 ? (
					<div className="text-center py-16">
						<p className="text-4 text-gray-10 mb-4">
							No tier lists yet. Create your first one!
						</p>
					</div>
				) : (
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
						{tierLists.map((template) => (
							<TierListCard
								key={template.id}
								template={template}
								onView={() => navigateTo(`/list/${template.id}`)}
								onStart={() => navigateTo(`/list/${template.id}`)}
							/>
						))}
					</div>
				)}
			</div>
		</div>
	);
}

