"use client";

import { useState } from "react";
import { Button } from "@whop/react/components";
import { TierListBoard } from "./TierListBoard";
import { ItemBank } from "./ItemBank";
import { PublishModal } from "./PublishModal";
import type { TierListTemplate, TierRow, TierListItem } from "@/lib/types";

interface AdminBuilderProps {
	template: TierListTemplate | null;
	listId: string;
	userId: string;
}

export function AdminBuilder({ template, listId, userId }: AdminBuilderProps) {
	const [title, setTitle] = useState(template?.title || "New Tier List");
	const [isEditingTitle, setIsEditingTitle] = useState(false);
	const [tierRows, setTierRows] = useState<TierRow[]>(
		template?.tierRows || [
			{ id: "t1", name: "S", color: "#ff7f7f" },
			{ id: "t2", name: "A", color: "#ffbf7f" },
			{ id: "t3", name: "B", color: "#ffff7f" },
			{ id: "t4", name: "C", color: "#7fff7f" },
			{ id: "t5", name: "D", color: "#7fbfff" },
		]
	);
	const [itemBank, setItemBank] = useState<TierListItem[]>(template?.itemBank || []);
	const [placement, setPlacement] = useState<Record<string, string>>(
		template?.adminPlacement || {}
	);
	const [isSaving, setIsSaving] = useState(false);
	const [showPublishModal, setShowPublishModal] = useState(false);

	const handleSaveDraft = async () => {
		setIsSaving(true);
		try {
			const payload = {
				title,
				status: "draft",
				accessType: "free",
				tierRows,
				itemBank,
				adminPlacement: placement,
			};

			const url = listId === "new" ? "/api/templates" : `/api/templates/${listId}`;
			const method = listId === "new" ? "POST" : "PUT";

			const response = await fetch(url, {
				method,
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(payload),
			});

			if (response.ok) {
				const data = await response.json();
				alert("Draft saved successfully!");
				// If this was a new template, redirect to edit mode
				if (listId === "new" && data.template?.id) {
					window.location.href = `/admin/builder/${data.template.id}`;
				}
			} else {
				const errorData = await response.json().catch(() => ({}));
				console.error("Save failed:", errorData);
				throw new Error(errorData.error || `Failed to save draft: ${response.statusText}`);
			}
		} catch (error) {
			console.error("Error saving draft:", error);
			alert("Failed to save draft. Please try again.");
		} finally {
			setIsSaving(false);
		}
	};

	const handlePublish = async (publishData: {
		status: "published" | "open_for_submission";
		accessType: "free" | "paid";
		price?: number;
	}) => {
		setIsSaving(true);
		try {
			const payload = {
				title,
				status: publishData.status,
				accessType: publishData.accessType,
				price: publishData.price,
				tierRows,
				itemBank,
				adminPlacement: placement,
			};

			const url = listId === "new" ? "/api/templates" : `/api/templates/${listId}`;
			const method = listId === "new" ? "POST" : "PUT";

			const response = await fetch(url, {
				method,
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(payload),
			});

			if (response.ok) {
				const data = await response.json();
				alert("Tier list published successfully!");
				// Redirect to dashboard
				window.location.href = "/";
			} else {
				throw new Error("Failed to publish");
			}
		} catch (error) {
			console.error("Error publishing:", error);
			alert("Failed to publish. Please try again.");
		} finally {
			setIsSaving(false);
			setShowPublishModal(false);
		}
	};

	const handleTierReorder = (newTiers: TierRow[]) => {
		setTierRows(newTiers);
	};

	const handleItemMove = (itemId: string, _fromTierId: string | null, toTierId: string) => {
		setPlacement((prev) => ({
			...prev,
			[itemId]: toTierId,
		}));
	};

	const handleTierNameChange = (tierId: string, name: string) => {
		setTierRows((prev) =>
			prev.map((tier) => (tier.id === tierId ? { ...tier, name } : tier))
		);
	};

	const handleTierColorChange = (tierId: string, color: string) => {
		setTierRows((prev) =>
			prev.map((tier) => (tier.id === tierId ? { ...tier, color } : tier))
		);
	};

	const handleTierDelete = (tierId: string) => {
		setTierRows((prev) => prev.filter((tier) => tier.id !== tierId));
		// Remove items from this tier
		setPlacement((prev) => {
			const newPlacement = { ...prev };
			Object.keys(newPlacement).forEach((itemId) => {
				if (newPlacement[itemId] === tierId) {
					delete newPlacement[itemId];
				}
			});
			return newPlacement;
		});
	};

	const handleAddTier = () => {
		const newTier: TierRow = {
			id: `t${Date.now()}`,
			name: "New",
			color: "#cccccc",
		};
		setTierRows((prev) => [...prev, newTier]);
	};

	const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
		const files = event.target.files;
		if (!files) return;

		Array.from(files).forEach((file) => {
			if (file.type.startsWith("image/")) {
				const reader = new FileReader();
				reader.onload = (e) => {
					const imageUrl = e.target?.result as string;
					const newItem: TierListItem = {
						id: `i${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
						imageUrl,
					};
					setItemBank((prev) => [...prev, newItem]);
				};
				reader.readAsDataURL(file);
			}
		});
	};

	const unplacedItems = itemBank.filter((item) => !placement[item.id]);

	return (
		<div className="min-h-screen p-8 bg-gray-a1">
			<div className="max-w-7xl mx-auto">
				{/* Fixed Header */}
				<div className="mb-6 flex items-center justify-between gap-4">
					<div className="flex-1">
					{isEditingTitle ? (
						<input
							value={title}
							onChange={(e) => setTitle(e.target.value)}
							onBlur={() => setIsEditingTitle(false)}
							onKeyDown={(e) => {
								if (e.key === "Enter") {
									setIsEditingTitle(false);
								}
							}}
							className="text-9 font-bold h-9 px-3 py-1 rounded-md border border-gray-a4 bg-gray-a1 text-gray-12 focus:outline-none focus:ring-2 focus:ring-blue-6 focus:border-blue-6"
							autoFocus
						/>
						) : (
							<h1
								className="text-9 font-bold text-gray-12 cursor-pointer hover:text-gray-10 transition-colors"
								onClick={() => setIsEditingTitle(true)}
							>
								{title}
							</h1>
						)}
					</div>
					<div className="flex gap-2">
						<Button
							variant="ghost"
							size="3"
							onClick={handleSaveDraft}
							disabled={isSaving}
						>
							{isSaving ? "Saving..." : "Save Draft"}
						</Button>
						<Button
							variant="classic"
							size="3"
							onClick={() => setShowPublishModal(true)}
							disabled={isSaving}
						>
							Publish
						</Button>
					</div>
				</div>

				{/* TierListBoard */}
				<div className="mb-6" suppressHydrationWarning>
					<TierListBoard
						tierRows={tierRows}
						items={itemBank}
						placement={placement}
						isEditable={true}
						onTierReorder={handleTierReorder}
						onItemMove={handleItemMove}
						onTierNameChange={handleTierNameChange}
						onTierColorChange={handleTierColorChange}
						onTierDelete={handleTierDelete}
						onAddTier={handleAddTier}
					/>
				</div>

				{/* ItemBank */}
				<ItemBank
					items={itemBank}
					unplacedItems={unplacedItems}
					isEditable={true}
					onUploadClick={() => {
						const input = document.createElement("input");
						input.type = "file";
						input.accept = "image/*";
						input.multiple = true;
						input.onchange = (e) => handleImageUpload(e as any);
						input.click();
					}}
				/>

				{/* PublishModal */}
				{showPublishModal && (
					<PublishModal
						onClose={() => setShowPublishModal(false)}
						onPublish={(data) => {
							handlePublish(data);
						}}
						isSaving={isSaving}
					/>
				)}
			</div>
		</div>
	);
}

