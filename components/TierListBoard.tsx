"use client";

import {
	DndContext,
	DragOverlay,
	closestCenter,
	KeyboardSensor,
	PointerSensor,
	useSensor,
	useSensors,
} from "@dnd-kit/core";
import {
	arrayMove,
	SortableContext,
	sortableKeyboardCoordinates,
	verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useState, useEffect } from "react";
import { TierRow } from "./TierRow";
import type { TierRow as TierRowType, TierListItem } from "@/lib/types";

interface TierListBoardProps {
	tierRows: TierRowType[];
	items: TierListItem[];
	placement: Record<string, string>; // { itemId: tierId }
	isEditable?: boolean;
	onTierReorder?: (tiers: TierRowType[]) => void;
	onItemMove?: (itemId: string, fromTierId: string | null, toTierId: string) => void;
	onTierNameChange?: (tierId: string, name: string) => void;
	onTierColorChange?: (tierId: string, color: string) => void;
	onTierDelete?: (tierId: string) => void;
	onAddTier?: () => void;
}

export function TierListBoard({
	tierRows,
	items,
	placement,
	isEditable = false,
	onTierReorder,
	onItemMove,
	onTierNameChange,
	onTierColorChange,
	onTierDelete,
	onAddTier,
}: TierListBoardProps) {
	const [activeId, setActiveId] = useState<string | null>(null);
	const [isMounted, setIsMounted] = useState(false);

	useEffect(() => {
		setIsMounted(true);
	}, []);

	const sensors = useSensors(
		useSensor(PointerSensor),
		useSensor(KeyboardSensor, {
			coordinateGetter: sortableKeyboardCoordinates,
		})
	);

	function handleDragStart(event: any) {
		setActiveId(event.active.id);
	}

	function handleDragEnd(event: any) {
		const { active, over } = event;

		if (!over) {
			setActiveId(null);
			return;
		}

		if (active.id !== over.id) {
			// Check if we're dragging a tier row or an item
			const activeTier = tierRows.find((t) => t.id === active.id);
			if (activeTier && isEditable) {
				// Reordering tier rows
				const oldIndex = tierRows.findIndex((t) => t.id === active.id);
				const newIndex = tierRows.findIndex((t) => t.id === over.id);
				const newTiers = arrayMove(tierRows, oldIndex, newIndex);
				onTierReorder?.(newTiers);
			} else {
				// Moving items between tiers
				const activeItem = items.find((i) => i.id === active.id);
				if (activeItem) {
					const fromTierId = placement[active.id] || null;
					const toTierId = over.id as string;
					onItemMove?.(active.id, fromTierId, toTierId);
				}
			}
		}

		setActiveId(null);
	}

	function getItemsForTier(tierId: string): TierListItem[] {
		return items.filter((item) => placement[item.id] === tierId);
	}

	// Prevent hydration mismatch by only rendering DnD on client
	if (!isMounted) {
		return (
			<div className="flex flex-col gap-2 w-full">
				{tierRows.map((tier) => (
					<TierRow
						key={tier.id}
						tier={tier}
						items={getItemsForTier(tier.id)}
						isEditable={isEditable}
						onTierNameChange={onTierNameChange}
						onTierColorChange={onTierColorChange}
						onTierDelete={onTierDelete}
					/>
				))}
				{isEditable && (
					<button
						onClick={onAddTier}
						className="p-4 border-2 border-dashed border-gray-a4 rounded-lg text-gray-9 hover:border-gray-a6 hover:text-gray-10 transition-colors"
					>
						+ Add Tier Row
					</button>
				)}
			</div>
		);
	}

	return (
		<DndContext
			sensors={sensors}
			collisionDetection={closestCenter}
			onDragStart={handleDragStart}
			onDragEnd={handleDragEnd}
		>
			<div className="flex flex-col gap-2 w-full" suppressHydrationWarning>
				<SortableContext
					items={tierRows.map((t) => t.id)}
					strategy={verticalListSortingStrategy}
				>
					{tierRows.map((tier) => (
						<TierRow
							key={tier.id}
							tier={tier}
							items={getItemsForTier(tier.id)}
							isEditable={isEditable}
							onTierNameChange={onTierNameChange}
							onTierColorChange={onTierColorChange}
							onTierDelete={onTierDelete}
						/>
					))}
				</SortableContext>

				{isEditable && (
					<button
						onClick={onAddTier}
						className="p-4 border-2 border-dashed border-gray-a4 rounded-lg text-gray-9 hover:border-gray-a6 hover:text-gray-10 transition-colors"
					>
						+ Add Tier Row
					</button>
				)}
			</div>

			<DragOverlay>
				{activeId ? (
					<div className="w-16 h-16 bg-gray-a2 border border-gray-a4 rounded-lg shadow-lg">
						{/* Drag preview */}
					</div>
				) : null}
			</DragOverlay>
		</DndContext>
	);
}

