"use client";

import { Button } from "@whop/react/components";

interface ConfirmModalProps {
	isOpen: boolean;
	title?: string;
	message: string;
	confirmText?: string;
	cancelText?: string;
	onConfirm: () => void;
	onCancel: () => void;
	variant?: "danger" | "default";
	isLoading?: boolean;
}

export function ConfirmModal({
	isOpen,
	title,
	message,
	confirmText = "Confirm",
	cancelText = "Cancel",
	onConfirm,
	onCancel,
	variant = "default",
	isLoading = false,
}: ConfirmModalProps) {
	if (!isOpen) return null;

	const confirmButtonVariant = variant === "danger" ? "classic" : "classic";
	const confirmButtonColor = variant === "danger" ? "red" : undefined;

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
			<div className="relative bg-gray-a2 border border-gray-a4 rounded-lg p-6 shadow-lg max-w-md w-full mx-4">
				{title && (
					<h3 className="text-6 font-semibold text-gray-12 mb-4">{title}</h3>
				)}
				<p className="text-3 text-gray-11 mb-6">{message}</p>
				<div className="flex gap-3 justify-end">
					<Button 
						variant="ghost" 
						size="3" 
						onClick={onCancel}
						disabled={isLoading}
					>
						{cancelText}
					</Button>
					<Button
						variant={confirmButtonVariant}
						size="3"
						onClick={onConfirm}
						color={confirmButtonColor}
						disabled={isLoading}
					>
						{isLoading ? "Deleting..." : confirmText}
					</Button>
				</div>
			</div>
		</div>
	);
}
