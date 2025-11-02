import { headers } from "next/headers";
import { whopsdk } from "@/lib/whop-sdk";

/**
 * Helper function to safely verify user token
 * Returns userId or null if not available (development mode only)
 * In production/Whop iframe, requires valid token
 */
export async function getUserId(): Promise<string | null> {
	try {
		const { userId } = await whopsdk.verifyUserToken(await headers());
		return userId;
	} catch (error: any) {
		// Check if we're in development mode and allow null userId for local testing
		// In production or Whop iframe, this will throw an error (handled by caller)
		if (process.env.NODE_ENV === "development") {
			// Check if we can detect localhost from headers
			const headersList = await headers();
			const host = headersList.get("host") || "";
			const isLocalhost = host.includes("localhost") || host.includes("127.0.0.1");

			if (isLocalhost) {
				console.warn(
					"Whop user token not found. Running in localhost development mode without authentication."
				);
				return null;
			}
		}

		// In Whop iframe or production, if token is missing, re-throw the error
		// The caller will handle showing an appropriate error message
		throw error;
	}
}

