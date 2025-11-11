"use client";

import { useDroppable, useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { Button } from "@whop/react/components";
import type { TierListItem } from "@/lib/types";

interface ItemBankProps {
	items: TierListItem[];
	unplacedItems: TierListItem[];
	isEditable?: boolean;
	onUploadClick?: () => void;
	onItemClick?: (item: TierListItem) => void;
}

// Draggable item component for ItemBank
function DraggableBankItem({ item, isEditable }: { item: TierListItem; isEditable: boolean }) {
	const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
		id: item.id,
		disabled: !isEditable,
	});

	const style = {
		transform: CSS.Translate.toString(transform),
		opacity: isDragging ? 0.5 : 1,
	};

	if (!isEditable) {
		return (
			<img
				src={item.imageUrl}
				alt="Tier item"
				className="w-16 h-16 object-cover rounded cursor-pointer hover:scale-110 transition-transform border-2 border-gray-a4"
			/>
		);
	}

	return (
		<div ref={setNodeRef} style={style} {...listeners} {...attributes}>
			<img
				src={item.imageUrl}
				alt="Tier item"
				className="w-16 h-16 object-cover rounded cursor-pointer hover:scale-110 transition-transform border-2 border-gray-a4"
			/>
		</div>
	);
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
			<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0 mb-4">
				<h3 className="text-4 font-semibold text-gray-12">Item Bank</h3>
				{isEditable && (
					<Button variant="ghost" size="3" onClick={onUploadClick} className="w-full sm:w-auto">
						Upload Items
					</Button>
				)}
			</div>

			<div className="flex flex-wrap gap-2">
				{unplacedItems.length === 0 ? (
					<p className="text-2 text-gray-9">No unplaced items</p>
				) : (
					unplacedItems.map((item) => (
						<div key={item.id} onClick={() => onItemClick?.(item)}>
							<DraggableBankItem item={item} isEditable={isEditable || false} />
						</div>
					))
				)}
			</div>
		</div>
	);
}

