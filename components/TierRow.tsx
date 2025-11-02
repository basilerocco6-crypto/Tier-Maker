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
				<div className="flex items-center justify-center gap-3 px-3 bg-black min-w-[100px]">
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
							className="p-2 hover:opacity-80 transition-opacity cursor-pointer flex items-center justify-center"
							title="Settings - Click to change color"
						>
							{/* Solid gear icon with 8 teeth */}
							<svg
								width="20"
								height="20"
								viewBox="0 0 20 20"
								fill="none"
								xmlns="http://www.w3.org/2000/svg"
							>
								{/* 8-tooth gear shape */}
								<path
									d="M10 1L11.18 4.32L14.5 5.5L11.18 6.68L10 10L8.82 6.68L5.5 5.5L8.82 4.32L10 1Z"
									fill="white"
								/>
								<path
									d="M10 10L12.32 11.18L13.5 14.5L12.32 17.82L10 19L7.68 17.82L6.5 14.5L7.68 11.18L10 10Z"
									fill="white"
								/>
								{/* Center hole */}
								<circle cx="10" cy="10" r="3" fill="white"/>
								<circle cx="10" cy="10" r="2" fill="black"/>
							</svg>
						</button>
					</div>

					{/* Reorder Handle - Double-headed Arrow (up and down chevrons) */}
					<div
						{...sortableAttributes}
						{...sortableListeners}
						className="cursor-grab active:cursor-grabbing p-2 hover:opacity-80 transition-opacity flex items-center justify-center"
						title="Reorder"
					>
						<svg
							width="20"
							height="20"
							viewBox="0 0 20 20"
							fill="none"
							xmlns="http://www.w3.org/2000/svg"
						>
							{/* Up chevron */}
							<path
								d="M10 5L7 9L10 9L13 9L10 5Z"
								fill="white"
							/>
							{/* Down chevron - small gap between them */}
							<path
								d="M10 15L7 11L10 11L13 11L10 15Z"
								fill="white"
							/>
						</svg>
					</div>
				</div>
			)}
		</div>
	);
}

