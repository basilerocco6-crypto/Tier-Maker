"use client";

// Removed DndContext imports - using parent context instead
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
	parentDragStart?: (event: any) => void;
	parentDragEnd?: (event: any) => void;
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
	parentDragStart,
	parentDragEnd,
}: TierListBoardProps) {
	const [isMounted, setIsMounted] = useState(false);

	useEffect(() => {
		setIsMounted(true);
	}, []);

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

	// TierListBoard no longer creates its own DndContext - it uses the parent one
	return (
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
	);
}

