"use client";

import { useState, useEffect } from "react";
import { useIframeSdk } from "@whop/react";
import { Button } from "@whop/react/components";
import { TierListBoard } from "./TierListBoard";
import { ItemBank } from "./ItemBank";
import { PurchaseButton } from "./PurchaseButton";
import type {
	TierListTemplate,
	TierListSubmission,
	TierRow,
	TierListItem,
} from "@/lib/types";

interface MemberListPageProps {
	template: TierListTemplate;
	userId: string;
	hasAccess: boolean;
	existingSubmission: TierListSubmission | null;
}

export function MemberListPage({
	template,
	userId,
	hasAccess,
	existingSubmission,
}: MemberListPageProps) {
	const { navigate } = useIframeSdk();
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
		setPlacement(template.adminPlacement || {});
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

	const handleShare = async () => {
		// Share to Discord functionality
		// This would use html-to-image to capture the board
		alert("Share functionality coming soon!");
	};

	// State A: Locked, Published List (View-Only)
	if (template.status === "published" && !template.adminPlacement) {
		return (
			<div className="min-h-screen p-8 bg-gray-a1">
				<div className="max-w-7xl mx-auto">
					<h1 className="text-9 font-bold text-gray-12 mb-4">{template.title}</h1>
					<p className="text-3 text-gray-10">This list is view-only</p>
				</div>
			</div>
		);
	}

	// State B: Paid, Published List (Gated)
	if (template.accessType === "paid" && !hasAccess) {
		return (
			<PaidGatedView template={template} userId={userId} />
		);
	}

	// State C: Open for Community Submissions
	return (
		<div className="min-h-screen p-8 bg-gray-a1">
			<div className="max-w-7xl mx-auto">
				{/* Fixed Header */}
				<div className="flex justify-between items-center mb-6">
					<h1 className="text-9 font-bold text-gray-12">{template.title}</h1>
					<div className="flex gap-2">
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
					/>
				</div>

				{/* ItemBank */}
				<ItemBank
					items={template.itemBank}
					unplacedItems={unplacedItems}
					isEditable={true}
				/>
			</div>
		</div>
	);
}

/**
 * PaidGatedView component
 * Shows payment gate for paid tier lists
 */
function PaidGatedView({
	template,
	userId,
}: {
	template: TierListTemplate;
	userId: string;
}) {
	const [purchaseError, setPurchaseError] = useState<string | null>(null);
	const [purchaseSuccess, setPurchaseSuccess] = useState(false);

	const handlePurchaseSuccess = () => {
		setPurchaseSuccess(true);
		// Reload after a short delay to show updated access
		setTimeout(() => {
			window.location.reload();
		}, 1500);
	};

	const handlePurchaseError = (error: string) => {
		setPurchaseError(error);
		// Clear error after 5 seconds
		setTimeout(() => {
			setPurchaseError(null);
		}, 5000);
	};

	return (
		<div className="min-h-screen flex items-center justify-center p-8 bg-gray-a1">
			<div className="max-w-md w-full bg-gray-a2 border border-gray-a4 rounded-lg p-8 text-center">
				<h2 className="text-7 font-bold text-gray-12 mb-4">
					Pay to Unlock
				</h2>
				<p className="text-3 text-gray-10 mb-6">
					Pay ${((template.price || 0) / 100).toFixed(2)} to unlock this tier
					list
				</p>

				{purchaseSuccess ? (
					<div className="p-4 bg-green-2 border border-green-6 rounded text-green-11 text-3">
						Purchase successful! Unlocking access...
					</div>
				) : (
					<PurchaseButton
						templateId={template.id}
						price={template.price || 0}
						onPurchaseSuccess={handlePurchaseSuccess}
						onPurchaseError={handlePurchaseError}
						variant="classic"
						size="4"
						className="w-full"
					>
						Pay ${((template.price || 0) / 100).toFixed(2)} to Unlock
					</PurchaseButton>
				)}

				{purchaseError && (
					<div className="mt-4 p-3 bg-red-2 border border-red-6 rounded text-red-11 text-2">
						{purchaseError}
					</div>
				)}
			</div>
		</div>
	);
}

