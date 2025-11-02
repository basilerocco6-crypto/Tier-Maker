"use client";

import { useState } from "react";
import { DndContext, DragOverlay, closestCenter, PointerSensor, KeyboardSensor, useSensor, useSensors } from "@dnd-kit/core";
import { arrayMove, sortableKeyboardCoordinates } from "@dnd-kit/sortable";
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
	const [imageShape, setImageShape] = useState<"square" | "circle">("square");
	const [selectedFileName, setSelectedFileName] = useState<string>("");
	const [showTierSettings, setShowTierSettings] = useState<string | null>(null);
	const [activeDragId, setActiveDragId] = useState<string | null>(null);

	// DnD sensors for the parent context
	const sensors = useSensors(
		useSensor(PointerSensor),
		useSensor(KeyboardSensor, {
			coordinateGetter: sortableKeyboardCoordinates,
		})
	);

	// Handle drag and drop at the AdminBuilder level
	const handleDragStart = (event: any) => {
		setActiveDragId(event.active.id);
	};

	const handleDragEnd = (event: any) => {
		const { active, over } = event;
		setActiveDragId(null);

		if (!over) return;

		// Check if we're dragging a tier row (for reordering)
		const activeTier = tierRows.find((t) => t.id === active.id);
		if (activeTier) {
			// Check if over is also a tier row
			const overTier = tierRows.find((t) => t.id === over.id);
			if (overTier && active.id !== over.id) {
				// Reordering tier rows
				const oldIndex = tierRows.findIndex((t) => t.id === active.id);
				const newIndex = tierRows.findIndex((t) => t.id === over.id);
				const newTiers = arrayMove(tierRows, oldIndex, newIndex);
				handleTierReorder(newTiers);
				return;
			}
		}

		// Handle item moves from ItemBank to TierRows (or between TierRows)
		if (active.id !== over.id) {
			const activeItem = itemBank.find((i) => i.id === active.id);
			if (activeItem) {
				const fromTierId = placement[active.id] || null;
				const toTierId = over.id as string;
				
				// Check if over.id is a tier row or item-bank
				const isTierRow = tierRows.find((t) => t.id === toTierId);
				if (isTierRow || toTierId === "item-bank") {
					handleItemMove(active.id, fromTierId, toTierId);
				}
			}
		}
	};

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

		if (files.length > 0) {
			setSelectedFileName(files.length === 1 ? files[0].name : `${files.length} files selected`);
		}

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

	const handleDownload = () => {
		// TODO: Implement download functionality (export as image or JSON)
		alert("Download functionality coming soon!");
	};

	const unplacedItems = itemBank.filter((item) => !placement[item.id]);

	return (
		<div className="min-h-screen p-8 bg-gray-a2">
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

				{/* Wrap TierListBoard and ItemBank in a single DndContext */}
				<DndContext
					sensors={sensors}
					collisionDetection={closestCenter}
					onDragStart={handleDragStart}
					onDragEnd={handleDragEnd}
				>
					{/* TierListBoard */}
					<div className="mb-8" suppressHydrationWarning>
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
							parentDragStart={handleDragStart}
							parentDragEnd={handleDragEnd}
						/>
					</div>

					{/* Image Upload Section */}
					<div className="mb-8">
						<p className="text-3 text-gray-10 mb-4">
							Upload images to be used in your tier list. Images are not saved to the website, but will be included in your download.
						</p>
						<div className="flex items-center gap-4">
							<input
								type="file"
								accept="image/*"
								multiple
								onChange={handleImageUpload}
								className="hidden"
								id="image-upload-input"
							/>
							<label htmlFor="image-upload-input" className="cursor-pointer">
								<Button
									variant="ghost"
									size="3"
									type="button"
									onClick={() => document.getElementById("image-upload-input")?.click()}
								>
									Choose file
								</Button>
							</label>
							<span className="text-3 text-gray-9">
								{selectedFileName || "No file selected"}
							</span>
						</div>
					</div>

					{/* ItemBank - Hidden items area */}
					{unplacedItems.length > 0 && (
						<div className="mb-8">
							<ItemBank
								items={itemBank}
								unplacedItems={unplacedItems}
								isEditable={true}
								onUploadClick={() => {
									document.getElementById("image-upload-input")?.click();
								}}
							/>
						</div>
					)}

					<DragOverlay>
						{activeDragId ? (
							<div className="w-16 h-16 bg-gray-a2 border border-gray-a4 rounded-lg shadow-lg">
								{/* Drag preview */}
							</div>
						) : null}
					</DragOverlay>
				</DndContext>

				{/* Action Buttons */}
				<div className="flex items-center justify-center gap-4 mb-4">
					<select
						value={imageShape}
						onChange={(e) => setImageShape(e.target.value as "square" | "circle")}
						className="px-4 py-2 rounded-md border border-gray-a4 bg-gray-a1 text-gray-12 focus:outline-none focus:ring-2 focus:ring-blue-6"
					>
						<option value="square">Square Images</option>
						<option value="circle">Circle Images</option>
					</select>
					<Button
						variant="classic"
						size="4"
						onClick={handleDownload}
					>
						Download
					</Button>
				</div>

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

