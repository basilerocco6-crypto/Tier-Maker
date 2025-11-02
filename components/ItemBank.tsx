"use client";

import { useDroppable } from "@dnd-kit/core";
import { Button } from "@whop/react/components";
import type { TierListItem } from "@/lib/types";

interface ItemBankProps {
	items: TierListItem[];
	unplacedItems: TierListItem[];
	isEditable?: boolean;
	onUploadClick?: () => void;
	onItemClick?: (item: TierListItem) => void;
}

export function ItemBank({
	items,
	unplacedItems,
	isEditable = false,
	onUploadClick,
	onItemClick,
}: ItemBankProps) {
	const { setNodeRef, isOver } = useDroppable({
		id: "item-bank",
	});

	return (
		<div
			ref={setNodeRef}
			className={`min-h-32 p-4 border-2 border-dashed rounded-lg transition-colors ${
				isOver ? "border-blue-6 bg-blue-1" : "border-gray-a4 bg-gray-a1"
			}`}
		>
			<div className="flex items-center justify-between mb-4">
				<h3 className="text-4 font-semibold text-gray-12">Item Bank</h3>
				{isEditable && (
					<Button variant="ghost" size="3" onClick={onUploadClick}>
						Upload Items
					</Button>
				)}
			</div>

			<div className="flex flex-wrap gap-2">
				{unplacedItems.length === 0 ? (
					<p className="text-2 text-gray-9">No unplaced items</p>
				) : (
					unplacedItems.map((item) => (
						<img
							key={item.id}
							src={item.imageUrl}
							alt="Tier item"
							className="w-16 h-16 object-cover rounded cursor-pointer hover:scale-110 transition-transform border-2 border-gray-a4"
							onClick={() => onItemClick?.(item)}
							draggable={isEditable}
						/>
					))
				)}
			</div>
		</div>
	);
}

