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

	const handleConfirm = () => {
		onPublish({
			status,
			accessType: "free",
		});
	};

	return (
		<div
			className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
			onClick={onClose}
		>
			<div
				className="bg-black border border-gray-a4 rounded-lg max-w-md w-full p-6 space-y-6"
				style={{ backgroundColor: 'rgb(0, 0, 0)', opacity: 1 }}
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

					{/* Buttons */}
					<div className="flex gap-2 justify-end pt-4">
						<Button variant="ghost" size="3" onClick={onClose} disabled={isSaving}>
							Cancel
						</Button>
						<Button
							variant="classic"
							size="3"
							onClick={handleConfirm}
							disabled={isSaving}
						>
							{isSaving ? "Publishing..." : "Confirm Publish"}
						</Button>
					</div>
				</div>
			</div>
		</div>
	);
}

