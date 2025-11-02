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
							className="p-1 hover:opacity-80 transition-opacity cursor-pointer flex items-center justify-center"
							title="Settings - Click to change color"
						>
							<svg
								width="24"
								height="24"
								viewBox="0 0 24 24"
								fill="none"
								xmlns="http://www.w3.org/2000/svg"
								className="text-white"
							>
								{/* Solid gear icon */}
								<path
									d="M12 15.5C13.933 15.5 15.5 13.933 15.5 12C15.5 10.067 13.933 8.5 12 8.5C10.067 8.5 8.5 10.067 8.5 12C8.5 13.933 10.067 15.5 12 15.5Z"
									fill="white"
								/>
								<path
									d="M18.728 14.1818C18.6597 14.3465 18.5752 14.5049 18.4747 14.6548L18.451 14.691C18.2858 14.948 18.089 15.1892 17.865 15.4066L17.8373 15.4339C17.6858 15.5804 17.521 15.7126 17.3447 15.8292L17.3027 15.8548C17.1527 15.9554 16.9943 16.0399 16.8296 16.1082L17.3331 17.8872C17.4543 18.3933 17.3841 18.9189 17.1386 19.371C16.8931 19.8231 16.4915 20.1674 16.0076 20.3377L15.9339 20.365C15.5249 20.5066 15.0927 20.5546 14.6654 20.5053H14.6091C14.1818 20.5546 13.7496 20.5066 13.3406 20.365L13.2669 20.3377C12.783 20.1674 12.3814 19.8231 12.1359 19.371C11.8904 18.9189 11.8202 18.3933 11.9414 17.8872L12.4449 16.1082C12.2802 16.0399 12.1218 15.9554 11.9718 15.8548L11.9298 15.8292C11.7535 15.7126 11.5887 15.5804 11.4372 15.4339L11.4095 15.4066C11.1855 15.1892 10.9887 14.948 10.8235 14.691L10.7998 14.6548C10.6993 14.5049 10.6148 14.3465 10.5465 14.1818L10.2931 12.4516C10.2267 12.1353 10.1942 11.8117 10.1964 11.4872H10.1983C10.1961 11.1626 10.2286 10.839 10.295 10.5227L10.5484 8.79255C10.6167 8.62785 10.7012 8.46945 10.8017 8.31955L10.8254 8.28335C10.9906 8.02635 11.1874 7.78515 11.4114 7.56775L11.4391 7.54045C11.5906 7.39395 11.7554 7.26175 11.9317 7.14515L11.9737 7.11955C12.1237 7.01895 12.2821 6.93445 12.4468 6.86615L11.9433 5.08715C11.8221 4.58105 11.8923 4.05545 12.1378 3.60335C12.3833 3.15125 12.7849 2.80695 13.2688 2.63665L13.3425 2.60935C13.7515 2.46775 14.1837 2.41975 14.611 2.46905H14.6673C15.0946 2.41975 15.5268 2.46775 15.9358 2.60935L16.0095 2.63665C16.4934 2.80695 16.895 3.15125 17.1405 3.60335C17.386 4.05545 17.4562 4.58105 17.335 5.08715L16.8315 6.86615C16.9962 6.93445 17.1546 7.01895 17.3046 7.11955L17.3466 7.14515C17.5229 7.26175 17.6877 7.39395 17.8392 7.54045L17.8669 7.56775C18.0909 7.78515 18.2877 8.02635 18.4529 8.28335L18.4766 8.31955C18.5771 8.46945 18.6616 8.62785 18.7299 8.79255L18.9833 10.5227C19.0497 10.839 19.0822 11.1626 19.08 11.4872H19.0781C19.0803 11.8117 19.0478 12.1353 18.9814 12.4516L18.728 14.1818Z"
									fill="white"
								/>
							</svg>
						</button>
					</div>

					{/* Reorder Handle - Double-headed Arrow */}
					<div
						{...sortableAttributes}
						{...sortableListeners}
						className="cursor-grab active:cursor-grabbing p-1 hover:opacity-80 transition-opacity flex items-center justify-center"
						title="Reorder"
					>
						<svg
							width="24"
							height="24"
							viewBox="0 0 24 24"
							fill="none"
							xmlns="http://www.w3.org/2000/svg"
							className="text-white"
						>
							{/* Up arrow */}
							<path
								d="M12 6L8 10L12 10L16 10L12 6Z"
								fill="white"
							/>
							{/* Small gap */}
							{/* Down arrow */}
							<path
								d="M12 18L8 14L12 14L16 14L12 18Z"
								fill="white"
							/>
						</svg>
					</div>
				</div>
			)}
		</div>
	);
}

