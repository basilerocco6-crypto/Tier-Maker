"use client";

import { useSortable } from "@dnd-kit/sortable";
import { useDroppable } from "@dnd-kit/core";
import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { Button } from "@whop/react/components";
import { useEffect, useState } from "react";
import type { TierRow as TierRowType, TierListItem } from "@/lib/types";

interface TierRowProps {
	tier: TierRowType;
	items: TierListItem[];
	isEditable?: boolean;
	onTierNameChange?: (tierId: string, name: string) => void;
	onTierColorChange?: (tierId: string, color: string) => void;
	onTierDelete?: (tierId: string) => void;
	onItemClick?: (item: TierListItem) => void;
}

// Draggable item component
function DraggableItem({ item, isEditable }: { item: TierListItem; isEditable: boolean }) {
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
				className="w-16 h-16 object-cover rounded cursor-pointer hover:scale-110 transition-transform"
			/>
		);
	}

	return (
		<div ref={setNodeRef} style={style} {...listeners} {...attributes}>
			<img
				src={item.imageUrl}
				alt="Tier item"
				className="w-16 h-16 object-cover rounded cursor-pointer hover:scale-110 transition-transform"
			/>
		</div>
	);
}

export function TierRow({
	tier,
	items,
	isEditable = false,
	onTierNameChange,
	onTierColorChange,
	onTierDelete,
	onItemClick,
}: TierRowProps) {
	const [isMounted, setIsMounted] = useState(false);

	useEffect(() => {
		setIsMounted(true);
	}, []);

	const {
		attributes: sortableAttributes,
		listeners: sortableListeners,
		setNodeRef: setSortableRef,
		transform,
		transition,
		isDragging: isTierDragging,
	} = useSortable({ id: tier.id, disabled: !isEditable || !isMounted });

	const { setNodeRef: setDroppableRef, isOver } = useDroppable({
		id: tier.id,
		disabled: !isEditable,
	});

	const style = {
		transform: CSS.Transform.toString(transform),
		transition,
		opacity: isTierDragging ? 0.5 : 1,
		backgroundColor: tier.color,
		border: isOver && isEditable ? "2px solid #3b82f6" : "none",
	};

	return (
		<div
			ref={(node) => {
				setSortableRef(node);
				setDroppableRef(node);
			}}
			style={style}
			className="flex gap-4 p-4 rounded-lg mb-2"
			suppressHydrationWarning
		>
			{isEditable && (
				<div
					{...sortableAttributes}
					{...sortableListeners}
					className="cursor-grab active:cursor-grabbing flex items-center px-2"
					suppressHydrationWarning
				>
					<svg
						width="16"
						height="16"
						viewBox="0 0 16 16"
						fill="none"
						xmlns="http://www.w3.org/2000/svg"
					>
						<path
							d="M6 4H10M6 8H10M6 12H10"
							stroke="currentColor"
							strokeWidth="2"
							strokeLinecap="round"
						/>
					</svg>
				</div>
			)}

			<div className="flex-1 flex items-center gap-2">
				{isEditable ? (
					<input
						value={tier.name}
						onChange={(e) => onTierNameChange?.(tier.id, e.target.value)}
						className="w-24 font-bold text-gray-12 h-8 px-2 py-1 rounded border border-gray-a4 bg-gray-a1/20 focus:outline-none focus:ring-2 focus:ring-blue-6 focus:border-blue-6"
						style={{ backgroundColor: "rgba(255,255,255,0.2)" }}
					/>
				) : (
					<span className="font-bold text-4 text-gray-12">{tier.name}</span>
				)}

				{isEditable && (
					<>
						<input
							type="color"
							value={tier.color}
							onChange={(e) => onTierColorChange?.(tier.id, e.target.value)}
							className="w-12 h-8 rounded border border-gray-a4 cursor-pointer"
						/>
						<Button
							variant="classic"
							size="2"
							onClick={() => onTierDelete?.(tier.id)}
						>
							Delete
						</Button>
					</>
				)}
			</div>

			<div className="flex gap-2 flex-wrap">
				{items.map((item) => (
					<DraggableItem
						key={item.id}
						item={item}
						isEditable={isEditable || false}
					/>
				))}
			</div>
		</div>
	);
}

