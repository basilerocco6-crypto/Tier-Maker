"use client";

import { Button } from "@whop/react/components";
import { useEffect } from "react";

interface NotificationModalProps {
	isOpen: boolean;
	type?: "success" | "error" | "info";
	title?: string;
	message: string;
	onClose: () => void;
	autoClose?: boolean;
	autoCloseDelay?: number;
}

export function NotificationModal({
	isOpen,
	type = "info",
	title,
	message,
	onClose,
	autoClose = false,
	autoCloseDelay = 3000,
}: NotificationModalProps) {
	useEffect(() => {
		if (isOpen && autoClose) {
			const timer = setTimeout(() => {
				onClose();
			}, autoCloseDelay);
			return () => clearTimeout(timer);
		}
	}, [isOpen, autoClose, autoCloseDelay, onClose]);

	if (!isOpen) return null;

	const typeConfig = {
		success: {
			bgColor: "bg-green-a3",
			borderColor: "border-green-6",
			icon: (
				<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
					<path
						d="M20 6L9 17L4 12"
						stroke="currentColor"
						strokeWidth="2"
						strokeLinecap="round"
						strokeLinejoin="round"
						className="text-green-9"
					/>
				</svg>
			),
		},
		error: {
			bgColor: "bg-red-a3",
			borderColor: "border-red-6",
			icon: (
				<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
					<path
						d="M18 6L6 18M6 6L18 18"
						stroke="currentColor"
						strokeWidth="2"
						strokeLinecap="round"
						strokeLinejoin="round"
						className="text-red-9"
					/>
				</svg>
			),
		},
		info: {
			bgColor: "bg-blue-a3",
			borderColor: "border-blue-6",
			icon: (
				<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
					<circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" className="text-blue-9" />
					<path
						d="M12 16V12M12 8H12.01"
						stroke="currentColor"
						strokeWidth="2"
						strokeLinecap="round"
						className="text-blue-9"
					/>
				</svg>
			),
		},
	};

	const config = typeConfig[type];

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
			<div
				className={`relative ${config.bgColor} border ${config.borderColor} rounded-lg p-6 shadow-lg max-w-md w-full mx-4`}
			>
				<div className="flex items-start gap-4">
					<div className="flex-shrink-0 mt-0.5">{config.icon}</div>
					<div className="flex-1">
						{title && (
							<h3 className="text-5 font-semibold text-gray-12 mb-2">{title}</h3>
						)}
						<p className="text-3 text-gray-11">{message}</p>
					</div>
				</div>
				<div className="mt-6 flex justify-end">
					<Button variant="ghost" size="3" onClick={onClose}>
						OK
					</Button>
				</div>
			</div>
		</div>
	);
}
