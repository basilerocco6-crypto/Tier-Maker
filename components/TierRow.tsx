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
	onItemRemove?: (itemId: string) => void;
}

// Draggable item component
function DraggableItem({ item, isEditable, onRemove }: { item: TierListItem; isEditable: boolean; onRemove?: () => void }) {
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
		<div ref={setNodeRef} style={style} {...listeners} {...attributes} className="relative group">
			<img
				src={item.imageUrl}
				alt="Tier item"
				className="w-16 h-16 object-cover rounded cursor-pointer hover:scale-110 transition-transform"
			/>
			{isEditable && onRemove && (
				<button
					onClick={(e) => {
						e.stopPropagation();
						onRemove();
					}}
					className="absolute -top-2 -right-2 w-6 h-6 bg-red-6 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-7 cursor-pointer"
					title="Remove item"
				>
					<svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
						<path d="M9 3L3 9M3 3L9 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
					</svg>
				</button>
			)}
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
	onItemRemove,
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
			className="flex items-stretch rounded-lg mb-2 overflow-hidden"
			suppressHydrationWarning
		>
			{/* Tier Label Section */}
			<div
				style={{ backgroundColor: tier.color }}
				className="flex items-center justify-center px-6 min-w-[80px]"
			>
				{isEditable ? (
					<input
						value={tier.name}
						onChange={(e) => onTierNameChange?.(tier.id, e.target.value)}
						className="w-12 font-bold text-gray-12 text-center bg-transparent border-none focus:outline-none focus:ring-2 focus:ring-gray-12 rounded px-1"
						style={{ color: tier.color === "#ffff7f" || tier.color === "#7fff7f" ? "#000" : "#fff" }}
					/>
				) : (
					<span
						className="font-bold text-6"
						style={{ color: tier.color === "#ffff7f" || tier.color === "#7fff7f" ? "#000" : "#fff" }}
					>
						{tier.name}
					</span>
				)}
			</div>

			{/* Items Area */}
			<div
				className="flex-1 bg-gray-a4 p-4 flex gap-2 flex-wrap items-center min-h-[80px]"
			>
				{items.length === 0 ? (
					<span className="text-gray-9 text-2">Drop items here</span>
				) : (
					items.map((item) => (
						<DraggableItem
							key={item.id}
							item={item}
							isEditable={isEditable || false}
							onRemove={() => onItemRemove?.(item.id)}
						/>
					))
				)}
			</div>

			{/* Settings and Reorder Icons */}
			{isEditable && (
				<div className="flex items-center gap-1 px-2 bg-black">
					{/* Settings Gear Icon - Color Picker */}
					<div className="relative">
						<input
							type="color"
							value={tier.color}
							onChange={(e) => onTierColorChange?.(tier.id, e.target.value)}
							className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
							title="Change color"
						/>
						<button
							type="button"
							className="p-2 hover:opacity-80 transition-opacity cursor-pointer"
							title="Settings - Click to change color"
						>
							<svg
								width="20"
								height="20"
								viewBox="0 0 20 20"
								fill="none"
								xmlns="http://www.w3.org/2000/svg"
								className="text-white"
							>
								<path
									d="M10 12.5C11.3807 12.5 12.5 11.3807 12.5 10C12.5 8.61929 11.3807 7.5 10 7.5C8.61929 7.5 7.5 8.61929 7.5 10C7.5 11.3807 8.61929 12.5 10 12.5Z"
									fill="currentColor"
								/>
								<path
									d="M15.6066 11.8182C15.5497 11.9554 15.4793 12.0874 15.3955 12.2123L15.3758 12.2425C15.2382 12.4567 15.0742 12.6576 14.8875 12.8388L14.8644 12.8619C14.7382 12.9837 14.6008 13.0938 14.4539 13.191L14.4189 13.2123C14.2939 13.2962 14.1619 13.3666 14.0247 13.4235L13.9927 13.4361C13.6584 13.5667 13.3079 13.6289 12.9545 13.6211H12.9091C12.5556 13.6289 12.2051 13.5667 11.8708 13.4361L11.8388 13.4235C11.7016 13.3666 11.5696 13.2962 11.4446 13.2123L11.4096 13.191C11.2627 13.0938 11.1253 12.9837 10.9991 12.8619L10.976 12.8388C10.7893 12.6576 10.6253 12.4567 10.4877 12.2425L10.468 12.2123C10.3842 12.0874 10.3138 11.9554 10.2569 11.8182L10.2443 11.7862C10.1137 11.4519 10.0515 11.1014 10.0593 10.748H10.0606C10.0528 10.3945 10.115 10.044 10.2456 9.70976L10.2582 9.67775C10.3151 9.54057 10.3855 9.40857 10.4693 9.28363L10.489 9.25343C10.6266 9.03923 10.7906 8.83831 10.9773 8.65711L11.0004 8.63401C11.1266 8.51223 11.264 8.40213 11.4109 8.30489L11.4459 8.28363C11.5709 8.19979 11.7029 8.12936 11.8401 8.07247L11.8721 8.05987C12.2064 7.92927 12.5569 7.86706 12.9103 7.87486H12.9557C13.3092 7.86706 13.6597 7.92927 13.994 8.05987L14.026 8.07247C14.1632 8.12936 14.2952 8.19979 14.4202 8.28363L14.4552 8.30489C14.6021 8.40213 14.7395 8.51223 14.8657 8.63401L14.8888 8.65711C15.0755 8.83831 15.2395 9.03923 15.3771 9.25343L15.3968 9.28363C15.4806 9.40857 15.551 9.54057 15.6079 9.67775L15.6205 9.70976C15.7511 10.044 15.8133 10.3945 15.8055 10.748H15.8068C15.8146 11.1014 15.7524 11.4519 15.6218 11.7862L15.6092 11.8182H15.6066Z"
									fill="currentColor"
								/>
							</svg>
						</button>
					</div>

					{/* Reorder Handle - Double-headed Arrow */}
					<div
						{...sortableAttributes}
						{...sortableListeners}
						className="cursor-grab active:cursor-grabbing p-2 hover:opacity-80 transition-opacity"
						title="Reorder"
					>
						<svg
							width="20"
							height="20"
							viewBox="0 0 20 20"
							fill="none"
							xmlns="http://www.w3.org/2000/svg"
							className="text-white"
						>
							{/* Up arrow */}
							<path
								d="M10 5L6 9M10 5L14 9"
								stroke="currentColor"
								strokeWidth="2"
								strokeLinecap="round"
								strokeLinejoin="round"
							/>
							{/* Down arrow */}
							<path
								d="M10 15L6 11M10 15L14 11"
								stroke="currentColor"
								strokeWidth="2"
								strokeLinecap="round"
								strokeLinejoin="round"
							/>
						</svg>
					</div>
				</div>
			)}
		</div>
	);
}

