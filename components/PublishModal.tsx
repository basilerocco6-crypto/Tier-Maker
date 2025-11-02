"use client";

import { useState } from "react";
import { Button } from "@whop/react/components";

interface PublishModalProps {
	onClose: () => void;
	onPublish: (data: {
		status: "published" | "open_for_submission";
		accessType: "free" | "paid";
		price?: number;
	}) => void;
	isSaving: boolean;
}

export function PublishModal({ onClose, onPublish, isSaving }: PublishModalProps) {
	const [status, setStatus] = useState<"published" | "open_for_submission">("published");
	const [accessType, setAccessType] = useState<"free" | "paid">("free");
	const [price, setPrice] = useState<string>("");

	const handleConfirm = () => {
		onPublish({
			status,
			accessType,
			price: accessType === "paid" ? Math.round(parseFloat(price) * 100) : undefined,
		});
	};

	return (
		<div
			className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
			onClick={onClose}
		>
			<div
				className="bg-gray-a2 border border-gray-a4 rounded-lg max-w-md w-full p-6 space-y-6"
				onClick={(e) => e.stopPropagation()}
			>
				<div className="mb-4">
					<h2 className="text-7 font-bold text-gray-12">Publish Tier List</h2>
				</div>
				<div className="space-y-6">
					{/* Status Selection */}
					<div>
						<label className="text-4 font-semibold text-gray-12 mb-2 block">
							Publication Type
						</label>
						<div className="space-y-2">
							<label className="flex items-center gap-2 cursor-pointer">
								<input
									type="radio"
									name="status"
									value="published"
									checked={status === "published"}
									onChange={(e) =>
										setStatus(e.target.value as "published" | "open_for_submission")
									}
									className="w-4 h-4"
								/>
								<span className="text-3 text-gray-10">
									Publish as Locked (View-Only)
								</span>
							</label>
							<label className="flex items-center gap-2 cursor-pointer">
								<input
									type="radio"
									name="status"
									value="open_for_submission"
									checked={status === "open_for_submission"}
									onChange={(e) =>
										setStatus(e.target.value as "published" | "open_for_submission")
									}
									className="w-4 h-4"
								/>
								<span className="text-3 text-gray-10">
									Open for Community Submissions
								</span>
							</label>
						</div>
					</div>

					{/* Access Type Selection */}
					<div>
						<label className="text-4 font-semibold text-gray-12 mb-2 block">
							Access Type
						</label>
						<div className="space-y-2">
							<label className="flex items-center gap-2 cursor-pointer">
								<input
									type="radio"
									name="accessType"
									value="free"
									checked={accessType === "free"}
									onChange={(e) =>
										setAccessType(e.target.value as "free" | "paid")
									}
									className="w-4 h-4"
								/>
								<span className="text-3 text-gray-10">Free</span>
							</label>
							<label className="flex items-center gap-2 cursor-pointer">
								<input
									type="radio"
									name="accessType"
									value="paid"
									checked={accessType === "paid"}
									onChange={(e) =>
										setAccessType(e.target.value as "free" | "paid")
									}
									className="w-4 h-4"
								/>
								<span className="text-3 text-gray-10">Paid</span>
							</label>
						</div>
					</div>

					{/* Price Input */}
					{accessType === "paid" && (
						<div>
							<label className="text-4 font-semibold text-gray-12 mb-2 block">
								Price (USD)
							</label>
							<input
								type="number"
								step="0.01"
								min="0"
								value={price}
								onChange={(e) => setPrice(e.target.value)}
								placeholder="0.00"
								className="w-full h-9 px-3 py-1 rounded-md border border-gray-a4 bg-gray-a1 text-gray-12 text-3 focus:outline-none focus:ring-2 focus:ring-blue-6 focus:border-blue-6"
							/>
						</div>
					)}

					{/* Buttons */}
					<div className="flex gap-2 justify-end pt-4">
						<Button variant="outline" size="3" onClick={onClose} disabled={isSaving}>
							Cancel
						</Button>
						<Button
							variant="classic"
							size="3"
							onClick={handleConfirm}
							disabled={isSaving || (accessType === "paid" && (!price || parseFloat(price) <= 0))}
						>
							{isSaving ? "Publishing..." : "Confirm Publish"}
						</Button>
					</div>
				</div>
			</div>
		</div>
	);
}

