"use client";

import { useState, useEffect } from "react";
import { useIframeSdk } from "@whop/react";
import { Button } from "@whop/react/components";
import { TierListBoard } from "./TierListBoard";
import { ItemBank } from "./ItemBank";
import { NotificationModal } from "./NotificationModal";
import type {
	TierListTemplate,
	TierListSubmission,
	TierRow,
	TierListItem,
} from "@/lib/types";

interface MemberListPageProps {
	template: TierListTemplate;
	userId: string;
	existingSubmission: TierListSubmission | null;
}

export function MemberListPage({
	template,
	userId,
	existingSubmission,
}: MemberListPageProps) {
	const iframeSdk = useIframeSdk();
	const [placement, setPlacement] = useState<Record<string, string>>(
		existingSubmission?.userPlacement || template.adminPlacement || {}
	);
	const [saved, setSaved] = useState(false);

	// Determine which items are unplaced
	const unplacedItems = template.itemBank.filter(
		(item) => !placement[item.id]
	);

	const handleItemMove = async (
		itemId: string,
		_fromTierId: string | null,
		toTierId: string
	) => {
		setPlacement((prev) => ({
			...prev,
			[itemId]: toTierId,
		}));
		setSaved(false);
	};

	const handleReset = () => {
		// Reset to empty placement (clear all user placements)
		setPlacement({});
		setSaved(false);
	};

	const handleSave = async () => {
		try {
			const response = await fetch("/api/submissions", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					templateId: template.id,
					userPlacement: placement,
				}),
			});

			if (response.ok) {
				setSaved(true);
			}
		} catch (error) {
			console.error("Error saving submission:", error);
		}
	};

	const [notification, setNotification] = useState<{
		isOpen: boolean;
		message: string;
	}>({ isOpen: false, message: "" });

	const handleShare = async () => {
		// Share to Discord functionality
		// This would use html-to-image to capture the board
		setNotification({
			isOpen: true,
			message: "Share functionality coming soon!",
		});
	};

	// State A: Locked, Published List (View-Only)
	if (template.status === "published" && !template.adminPlacement) {
		return (
			<div className="min-h-screen p-4 sm:p-6 md:p-8 bg-gray-a1">
				<div className="max-w-7xl mx-auto">
					<h1 className="text-7 sm:text-8 md:text-9 font-bold text-gray-12 mb-4">{template.title}</h1>
					<p className="text-3 text-gray-10">This list is view-only</p>
				</div>
			</div>
		);
	}

	// All tier lists are now free - no paid gating
	return (
		<div className="min-h-screen p-4 sm:p-6 md:p-8 bg-gray-a1">
			<div className="max-w-7xl mx-auto">
				{/* Fixed Header */}
				<div className="flex flex-col gap-4 mb-6">
					{/* Top row: Back button and title */}
					<div className="flex items-center gap-2 sm:gap-3">
						<Button
							variant="ghost"
							size="3"
							onClick={() => {
								if (iframeSdk && typeof (iframeSdk as any).navigate === "function") {
									(iframeSdk as any).navigate("/");
								} else {
									window.location.href = "/";
								}
							}}
							className="flex-shrink-0"
						>
							{/* Left arrow icon */}
							<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" className="sm:mr-2">
								<path d="M9.5 3.5L5 8l4.5 4.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
							</svg>
							<span className="hidden sm:inline">Back to Dashboard</span>
						</Button>
						<h1 className="text-6 sm:text-7 md:text-9 font-bold text-gray-12 truncate">{template.title}</h1>
					</div>
					{/* Action buttons row */}
					<div className="flex flex-wrap gap-2">
						<Button variant="ghost" size="3" onClick={handleReset}>
							Reset
						</Button>
						<Button variant="classic" size="3" onClick={handleSave}>
							{saved ? "Saved!" : "Save My List"}
						</Button>
						{saved && (
							<Button variant="ghost" size="3" onClick={handleShare}>
								Share to Discord
							</Button>
						)}
					</div>
				</div>

				{/* TierListBoard */}
                <div className="mb-6">
                    <TierListBoard
                        tierRows={template.tierRows}
                        items={template.itemBank}
                        placement={placement}
                        isEditable={true}
                        onItemMove={handleItemMove}
                        onItemRemove={(itemId) =>
                            setPlacement((prev) => {
                                const next = { ...prev };
                                delete next[itemId];
                                return next;
                            })
                        }
                    />
                </div>

				{/* ItemBank */}
				<ItemBank
					items={template.itemBank}
					unplacedItems={unplacedItems}
					isEditable={true}
				/>

				{/* NotificationModal */}
				<NotificationModal
					isOpen={notification.isOpen}
					type="info"
					message={notification.message}
					onClose={() => setNotification({ isOpen: false, message: "" })}
					autoClose={true}
					autoCloseDelay={2000}
				/>
			</div>
		</div>
	);
}


