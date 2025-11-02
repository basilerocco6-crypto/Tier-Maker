import { headers } from "next/headers";
import { whopsdk } from "@/lib/whop-sdk";
import {
	createOrUpdateUser,
	getUserByWhopId,
} from "@/lib/supabase-helpers";

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

/**
 * Helper function to ensure user exists in Supabase
 * Creates or updates user record when user authenticates
 * @param whopUserId - The Whop user ID
 * @returns Supabase user record
 */
export async function ensureUser(whopUserId: string) {
	try {
		// Check if user already exists
		let user = await getUserByWhopId(whopUserId);
		
		if (!user) {
			// Fetch user details from Whop API
			try {
				const whopUser = await whopsdk.users.retrieve(whopUserId);
				user = await createOrUpdateUser({
					whop_user_id: whopUserId,
					whop_username: whopUser.username || undefined,
					email: whopUser.email || undefined,
				});
				console.log("[ENSURE USER] Created user:", {
					whopUserId,
					supabaseUserId: user.id,
				});
			} catch (error: any) {
				console.error("[ENSURE USER ERROR] Failed to fetch user from Whop:", error);
				// Create user with minimal data if Whop API fails
				user = await createOrUpdateUser({
					whop_user_id: whopUserId,
				});
			}
		} else {
			// Update user if details have changed (optional - can be expensive)
			// For now, we only create on first access
			// You can add update logic here if needed
		}
		
		return user;
	} catch (error: any) {
		console.error("[ENSURE USER ERROR]", error);
		throw error;
	}
}

/**
 * Helper function to get user ID and ensure user exists in Supabase
 * Combines getUserId() and ensureUser() for convenience
 * @returns Whop user ID or null
 */
export async function getUserIdAndEnsureUser(): Promise<string | null> {
	try {
		const whopUserId = await getUserId();
		if (whopUserId) {
			// Ensure user exists in Supabase (non-blocking)
			ensureUser(whopUserId).catch((error) => {
				console.error("[GET USER ID AND ENSURE USER ERROR]", error);
				// Don't throw - user creation failure shouldn't block authentication
			});
		}
		return whopUserId;
	} catch (error: any) {
		throw error;
	}
}

