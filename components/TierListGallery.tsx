"use client";

import { useState } from "react";
import { Button } from "@whop/react/components";
import { useIframeSdk } from "@whop/react";
import { TierListCard } from "@/components/TierListCard";
import { ConfirmModal } from "@/components/ConfirmModal";
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
	const [deleteConfirm, setDeleteConfirm] = useState<{
		isOpen: boolean;
		templateId: string | null;
	}>({ isOpen: false, templateId: null });
	
	// Helper function for navigation that works in both iframe and localhost
	const navigateTo = (path: string) => {
		if (iframeSdk && typeof (iframeSdk as any).navigate === "function") {
			(iframeSdk as any).navigate(path);
		} else {
			// Fallback to window.location for localhost/development
			window.location.href = path;
		}
	};

	const handleDeleteClick = (templateId: string) => {
		setDeleteConfirm({ isOpen: true, templateId });
	};

	const handleDeleteConfirm = async () => {
		if (deleteConfirm.templateId) {
			await fetch(`/api/templates/${deleteConfirm.templateId}`, {
				method: "DELETE",
			});
			setDeleteConfirm({ isOpen: false, templateId: null });
			window.location.reload();
		}
	};

	return (
		<div className="min-h-screen p-8 bg-gray-a1">
			<div className="max-w-7xl mx-auto">
				<div className="flex justify-between items-center mb-8">
					<h1 className="text-9 font-bold text-gray-12">Tier List Gallery</h1>
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
								onDelete={() => handleDeleteClick(template.id)}
								onViewSubmissions={() => navigateTo(`/admin/submissions/${template.id}`)}
								onView={() => navigateTo(`/list/${template.id}`)}
								onStart={() => navigateTo(`/list/${template.id}`)}
							/>
						))}
					</div>
				)}

				{/* Confirm Delete Modal */}
				<ConfirmModal
					isOpen={deleteConfirm.isOpen}
					title="Delete Tier List"
					message="Are you sure you want to delete this list? This action cannot be undone."
					confirmText="Delete"
					cancelText="Cancel"
					onConfirm={handleDeleteConfirm}
					onCancel={() => setDeleteConfirm({ isOpen: false, templateId: null })}
					variant="danger"
				/>
			</div>
		</div>
	);
}

