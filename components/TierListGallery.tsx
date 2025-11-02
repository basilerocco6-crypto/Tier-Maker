"use client";

import { Button } from "@whop/react/components";
import { useIframeSdk } from "@whop/react";
import { TierListCard } from "@/components/TierListCard";
import type { TierListTemplate } from "@/lib/types";

interface TierListGalleryProps {
	tierLists: TierListTemplate[];
	userRole: "admin" | "member";
	userId: string;
}

export function TierListGallery({
	tierLists,
	userRole,
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

	const handleDelete = async (templateId: string) => {
		if (confirm("Are you sure you want to delete this list?")) {
			await fetch(`/api/templates/${templateId}`, {
				method: "DELETE",
			});
			window.location.reload();
		}
	};

	return (
		<div className="min-h-screen p-8 bg-gray-a1">
			<div className="max-w-7xl mx-auto">
				<div className="flex justify-between items-center mb-8">
					<h1 className="text-9 font-bold text-gray-12">Tier List Gallery</h1>
					<div className="flex items-center gap-4">
						{/* Debug info - remove in production */}
						<span className="text-2 text-gray-9">
							Role: {userRole} | User: {userId.slice(0, 10)}...
						</span>
						{userRole === "admin" && (
							<Button
								variant="classic"
								size="4"
								onClick={() => navigateTo("/admin/builder/new")}
							>
								Create New List
							</Button>
						)}
					</div>
				</div>

				{tierLists.length === 0 ? (
					<div className="text-center py-16">
						<p className="text-4 text-gray-10 mb-4">
							No tier lists yet. {userRole === "admin" && "Create your first one!"}
						</p>
					</div>
				) : (
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
						{tierLists.map((template) => (
							<TierListCard
								key={template.id}
								template={template}
								userRole={userRole}
								onEdit={() => navigateTo(`/admin/builder/${template.id}`)}
								onDelete={() => handleDelete(template.id)}
								onViewSubmissions={() => navigateTo(`/admin/submissions/${template.id}`)}
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

