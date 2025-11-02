"use client";

import { useState } from "react";
import { useIframeSdk } from "@whop/react";
import { Button } from "@whop/react/components";

interface PurchaseButtonProps {
	templateId: string;
	price: number; // in cents
	onPurchaseSuccess?: () => void;
	onPurchaseError?: (error: string) => void;
	className?: string;
	variant?: "classic" | "outline" | "ghost";
	size?: "1" | "2" | "3" | "4";
	children?: React.ReactNode;
}

/**
 * PurchaseButton component for in-app purchases
 * 
 * Uses Whop's in-app purchase flow:
 * 1. Creates checkout configuration via API
 * 2. Opens in-app purchase modal using iframeSdk.inAppPurchase()
 * 3. Handles response and stores receipt_id
 * 4. Triggers webhook for verification
 */
export function PurchaseButton({
	templateId,
	price,
	onPurchaseSuccess,
	onPurchaseError,
	className,
	variant = "classic",
	size = "4",
	children,
}: PurchaseButtonProps) {
	const iframeSdk = useIframeSdk();
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const handlePurchase = async () => {
		setIsLoading(true);
		setError(null);

		try {
			// Step 1: Create checkout configuration via server action
			const checkoutResponse = await fetch("/api/checkout/create", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					templateId,
					price,
				}),
			});

			if (!checkoutResponse.ok) {
				const errorData = await checkoutResponse.json();
				throw new Error(errorData.error || "Failed to create checkout");
			}

			const { checkoutConfig } = await checkoutResponse.json();
			const { planId, id } = checkoutConfig;

			// Validate iframeSdk is available
			if (!iframeSdk || !iframeSdk.inAppPurchase) {
				throw new Error("In-app purchase not available. Please ensure you're in the Whop iframe.");
			}

			// Step 2: Open in-app purchase modal
			const res = await iframeSdk.inAppPurchase({
				planId: planId || id,
				id: id || planId,
			});

			// Step 3: Handle response
			if (res.status === "ok") {
				// Store receiptId for verification
				const receiptId = res.data?.receiptId || res.data?.receipt_id;
				if (receiptId) {
					console.log("[PURCHASE SUCCESS] Receipt ID:", receiptId);
					// Optionally store receiptId in localStorage for reference
					localStorage.setItem(
						`purchase_${templateId}`,
						JSON.stringify({
							receiptId,
							timestamp: new Date().toISOString(),
						})
					);
				}

				// Payment succeeded - webhook will grant access
				console.log("[PURCHASE SUCCESS] Payment completed:", res);
				
				// Call success callback
				if (onPurchaseSuccess) {
					onPurchaseSuccess();
				} else {
					// Default: reload page after a short delay to show updated access
					setTimeout(() => {
						window.location.reload();
					}, 1000);
				}
			} else if (res.status === "cancelled") {
				// User cancelled the purchase
				console.log("[PURCHASE CANCELLED] User cancelled purchase");
				setError(null); // No error for cancellation
			} else {
				// Purchase failed
				const errorMessage = res.error?.message || "Purchase failed";
				console.error("[PURCHASE ERROR]", res);
				throw new Error(errorMessage);
			}
		} catch (error: any) {
			console.error("[PURCHASE ERROR]", error);
			const errorMessage = error.message || "Failed to process purchase. Please try again.";
			setError(errorMessage);

			// Call error callback
			if (onPurchaseError) {
				onPurchaseError(errorMessage);
			}
		} finally {
			setIsLoading(false);
		}
	};

	const priceDisplay = `$${((price || 0) / 100).toFixed(2)}`;

	return (
		<div className={className}>
			<Button
				variant={variant}
				size={size}
				onClick={handlePurchase}
				disabled={isLoading || !iframeSdk?.inAppPurchase}
				className={className}
			>
				{isLoading
					? "Processing..."
					: children || `Pay ${priceDisplay} to Unlock`}
			</Button>

			{error && (
				<div className="mt-2 p-2 bg-red-2 border border-red-6 rounded text-red-11 text-2">
					{error}
				</div>
			)}

			{!iframeSdk?.inAppPurchase && (
				<div className="mt-2 p-2 bg-yellow-2 border border-yellow-6 rounded text-yellow-11 text-2">
					In-app purchase not available. Please access this through the Whop iframe.
				</div>
			)}
		</div>
	);
}

