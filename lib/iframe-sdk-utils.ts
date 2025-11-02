/**
 * Utility functions for iframe SDK functionality
 * 
 * These utilities provide helper functions for common iframe SDK operations
 * All functions are designed to work both in iframe and non-iframe contexts
 */

/**
 * Opens an external URL using iframe SDK or fallback
 */
export async function openExternalUrl(
	iframeSdk: any,
	url: string
): Promise<void> {
	if (iframeSdk?.openExternalUrl && typeof iframeSdk.openExternalUrl === "function") {
		try {
			await iframeSdk.openExternalUrl({ url });
		} catch (error) {
			console.error("[EXTERNAL URL ERROR]", error);
			// Fallback to window.open
			window.open(url, "_blank", "noopener,noreferrer");
		}
	} else {
		// Fallback if iframe SDK not available
		window.open(url, "_blank", "noopener,noreferrer");
	}
}

/**
 * Opens a Whop user profile in modal
 * Uses format: https://whop.com/@username
 */
export async function openUserProfile(
	iframeSdk: any,
	username: string
): Promise<void> {
	const profileUrl = `https://whop.com/@${username.replace(/^@/, "")}`;
	await openExternalUrl(iframeSdk, profileUrl);
}

/**
 * Formats a Whop user profile URL
 */
export function formatUserProfileUrl(username: string): string {
	return `https://whop.com/@${username.replace(/^@/, "")}`;
}

/**
 * Checks if iframe SDK is available
 */
export function isIframeSdkAvailable(iframeSdk: any): boolean {
	return !!(
		iframeSdk &&
		typeof iframeSdk === "object" &&
		(typeof iframeSdk.navigate === "function" ||
			typeof iframeSdk.openExternalUrl === "function" ||
			typeof iframeSdk.inAppPurchase === "function")
	);
}

