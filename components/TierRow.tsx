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
							{/* Solid gear/cog icon */}
							<svg
								width="20"
								height="20"
								viewBox="0 0 20 20"
								fill="none"
								xmlns="http://www.w3.org/2000/svg"
							>
								<path
									d="M10 13C11.6569 13 13 11.6569 13 10C13 8.34315 11.6569 7 10 7C8.34315 7 7 8.34315 7 10C7 11.6569 8.34315 13 10 13Z"
									fill="white"
								/>
								<path
									d="M16.93 11.79C16.85 12.02 16.75 12.25 16.63 12.47L17.32 14.16C17.44 14.42 17.41 14.73 17.23 14.96C17.05 15.19 16.75 15.31 16.46 15.26L14.43 14.91C14.13 15.17 13.81 15.41 13.47 15.61L13.69 17.69C13.72 17.99 13.58 18.28 13.32 18.44C13.06 18.6 12.72 18.6 12.46 18.44L10.65 17.39C10.3 17.5 9.93 17.56 9.56 17.56C9.19 17.56 8.82 17.5 8.47 17.39L6.66 18.44C6.4 18.6 6.06 18.6 5.8 18.44C5.54 18.28 5.4 17.99 5.43 17.69L5.65 15.61C5.31 15.41 4.99 15.17 4.69 14.91L2.66 15.26C2.37 15.31 2.07 15.19 1.89 14.96C1.71 14.73 1.68 14.42 1.8 14.16L2.49 12.47C2.37 12.25 2.27 12.02 2.19 11.79L0.5 11.09C0.24 10.97 0.07 10.71 0.05 10.42C0.03 10.13 0.16 9.85 0.39 9.69L2.09 8.53C2.05 8.24 2.05 7.95 2.09 7.66L0.39 6.5C0.16 6.34 0.03 6.06 0.05 5.77C0.07 5.48 0.24 5.22 0.5 5.1L2.19 4.41C2.27 4.18 2.37 3.95 2.49 3.73L1.8 2.04C1.68 1.78 1.71 1.47 1.89 1.24C2.07 1.01 2.37 0.89 2.66 0.94L4.69 1.29C4.99 1.03 5.31 0.79 5.65 0.59L5.43 0.51C5.4 0.21 5.54 -0.08 5.8 -0.24C6.06 -0.4 6.4 -0.4 6.66 -0.24L8.47 0.81C8.82 0.7 9.19 0.64 9.56 0.64C9.93 0.64 10.3 0.7 10.65 0.81L12.46 -0.24C12.72 -0.4 13.06 -0.4 13.32 -0.24C13.58 -0.08 13.72 0.21 13.69 0.51L13.47 2.59C13.81 2.79 14.13 3.03 14.43 3.29L16.46 2.94C16.75 2.89 17.05 3.01 17.23 3.24C17.41 3.47 17.44 3.78 17.32 4.04L16.63 5.73C16.75 5.95 16.85 6.18 16.93 6.41L18.62 7.11C18.88 7.23 19.05 7.49 19.07 7.78C19.09 8.07 18.96 8.35 18.73 8.51L17.03 9.67C17.07 9.96 17.07 10.25 17.03 10.54L18.73 11.7C18.96 11.86 19.09 12.14 19.07 12.43C19.05 12.72 18.88 12.98 18.62 13.1L16.93 11.79Z"
									fill="white"
								/>
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
								d="M10 5L6 9L10 9L14 9L10 5Z"
								fill="white"
							/>
							{/* Down chevron */}
							<path
								d="M10 15L6 11L10 11L14 11L10 15Z"
								fill="white"
							/>
						</svg>
					</div>
				</div>
			)}
		</div>
	);
}

