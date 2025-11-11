"use client";

import { useState } from "react";
import { Button } from "@whop/react/components";
import { useIframeSdk } from "@whop/react";
import type { TierListTemplate } from "@/lib/types";
import { ConfirmModal } from "@/components/ConfirmModal";
import { NotificationModal } from "@/components/NotificationModal";

interface TierListCardWithDeleteProps {
	template: TierListTemplate;
	userId: string | null;
	onDelete?: () => void;
}

export function TierListCardWithDelete({
	template,
	userId,
	onDelete,
}: TierListCardWithDeleteProps) {
	const iframeSdk = useIframeSdk();
	const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
	const [isDeleting, setIsDeleting] = useState(false);
	const [notification, setNotification] = useState<{
		isOpen: boolean;
		message: string;
		type: "success" | "error" | "info";
	}>({ isOpen: false, message: "", type: "info" });

	// Check if the current user created this tier list
	// Use strict comparison and handle null/undefined cases
	const isOwner = Boolean(
		userId && 
		template.createdBy && 
		String(userId).trim() === String(template.createdBy).trim()
	);

	const handleDelete = async () => {
		setIsDeleting(true);
		try {
			const response = await fetch(`/api/templates/${template.id}`, {
				method: "DELETE",
			});

			if (!response.ok) {
				const error = await response.json();
				throw new Error(error.error || "Failed to delete tier list");
			}

			setNotification({
				isOpen: true,
				message: "Tier list deleted successfully",
				type: "success",
			});

			// Call the onDelete callback to refresh the list
			if (onDelete) {
				onDelete();
			}

			// Refresh the page after a short delay
			setTimeout(() => {
				if (iframeSdk && typeof (iframeSdk as any).navigate === "function") {
					(iframeSdk as any).navigate("/");
				} else {
					window.location.href = "/";
				}
			}, 1000);
		} catch (error: any) {
			setNotification({
				isOpen: true,
				message: error.message || "Failed to delete tier list",
				type: "error",
			});
		} finally {
			setIsDeleting(false);
			setShowDeleteConfirm(false);
		}
	};

	const navigateTo = (path: string) => {
		if (iframeSdk && typeof (iframeSdk as any).navigate === "function") {
			(iframeSdk as any).navigate(path);
		} else {
			window.location.href = path;
		}
	};

	return (
		<>
			<div className="bg-gray-a2 border border-gray-a4 rounded-lg p-6 hover:border-gray-a6 transition-colors relative group">
				{/* Delete button - only show if user is the owner */}
				{isOwner && (
					<button
						onClick={(e) => {
							e.preventDefault();
							e.stopPropagation();
							setShowDeleteConfirm(true);
						}}
						className="absolute top-2 right-2 w-6 h-6 bg-red-6 text-white rounded-full flex items-center justify-center opacity-100 hover:opacity-90 transition-opacity hover:bg-red-7 cursor-pointer z-10 shadow-lg"
						title="Delete tier list"
					>
						<svg
							width="12"
							height="12"
							viewBox="0 0 12 12"
							fill="none"
							xmlns="http://www.w3.org/2000/svg"
						>
							<path
								d="M9 3L3 9M3 3L9 9"
								stroke="currentColor"
								strokeWidth="2"
								strokeLinecap="round"
								strokeLinejoin="round"
							/>
						</svg>
					</button>
				)}

				<a
					href={`/list/${template.id}`}
					onClick={(e) => {
						e.preventDefault();
						navigateTo(`/list/${template.id}`);
					}}
					className="block"
				>
					<h2 className="text-7 font-bold text-gray-12 mb-2">{template.title}</h2>
					<p className="text-3 text-gray-10 mb-4">
						{template.status === "published" ? "Published" : "Draft"}
					</p>
					<p className="text-2 text-gray-9">
						Click to view and create your tier list
					</p>
				</a>
			</div>

			{/* Delete Confirmation Modal */}
			<ConfirmModal
				isOpen={showDeleteConfirm}
				title="Delete Tier List"
				message={`Are you sure you want to delete "${template.title}"? This action cannot be undone.`}
				confirmText="Delete"
				cancelText="Cancel"
				onConfirm={handleDelete}
				onCancel={() => setShowDeleteConfirm(false)}
				variant="danger"
				isLoading={isDeleting}
			/>

			{/* Notification Modal */}
			<NotificationModal
				isOpen={notification.isOpen}
				type={notification.type}
				message={notification.message}
				onClose={() => setNotification({ isOpen: false, message: "", type: "info" })}
				autoClose={true}
				autoCloseDelay={3000}
			/>
		</>
	);
}

