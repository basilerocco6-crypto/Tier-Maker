import { supabaseAdmin } from "./supabase";

/**
 * User interface for Supabase users table
 */
export interface SupabaseUser {
	id: string;
	whop_user_id: string;
	whop_username: string | null;
	email: string | null;
	created_at: string;
	updated_at: string;
}

/**
 * Purchase interface for Supabase purchases table
 */
export interface Purchase {
	id: string;
	user_id: string;
	whop_payment_id: string;
	amount: number;
	status: "pending" | "completed" | "failed" | "refunded";
	metadata: Record<string, any>;
	created_at: string;
}

/**
 * User data for creating/updating users
 */
export interface UserData {
	whop_user_id: string;
	whop_username?: string;
	email?: string;
}

/**
 * Purchase data for creating purchases
 */
export interface PurchaseData {
	user_id: string; // UUID from users table
	whop_payment_id: string;
	amount: number;
	status: "pending" | "completed" | "failed" | "refunded";
	metadata?: Record<string, any>;
}

/**
 * Get user by Whop user ID
 * @param whopUserId - The Whop user ID
 * @returns User record or null if not found
 */
export async function getUserByWhopId(
	whopUserId: string,
): Promise<SupabaseUser | null> {
	try {
		const { data, error } = await supabaseAdmin
			.from("users")
			.select("*")
			.eq("whop_user_id", whopUserId)
			.single();

		if (error) {
			if (error.code === "PGRST116") {
				// No rows returned
				return null;
			}
			console.error("[GET USER BY WHOP ID ERROR]", error);
			throw error;
		}

		return data as SupabaseUser;
	} catch (error: any) {
		console.error("[GET USER BY WHOP ID ERROR]", error);
		throw error;
	}
}

/**
 * Create or update user record
 * Upserts user data based on whop_user_id
 * @param userData - User data to create/update
 * @returns Created or updated user record
 */
export async function createOrUpdateUser(
	userData: UserData,
): Promise<SupabaseUser> {
	try {
		const { data, error } = await supabaseAdmin
			.from("users")
			.upsert(
				{
					whop_user_id: userData.whop_user_id,
					whop_username: userData.whop_username || null,
					email: userData.email || null,
				},
				{
					onConflict: "whop_user_id",
				},
			)
			.select()
			.single();

		if (error) {
			console.error("[CREATE OR UPDATE USER ERROR]", error);
			throw error;
		}

		return data as SupabaseUser;
	} catch (error: any) {
		console.error("[CREATE OR UPDATE USER ERROR]", error);
		throw error;
	}
}

/**
 * Create purchase record
 * Links purchase to user via user_id (UUID from users table)
 * @param purchaseData - Purchase data to create
 * @returns Created purchase record
 */
export async function createPurchase(
	purchaseData: PurchaseData,
): Promise<Purchase> {
	try {
		const { data, error } = await supabaseAdmin
			.from("purchases")
			.insert({
				user_id: purchaseData.user_id,
				whop_payment_id: purchaseData.whop_payment_id,
				amount: purchaseData.amount,
				status: purchaseData.status,
				metadata: purchaseData.metadata || {},
			})
			.select()
			.single();

		if (error) {
			console.error("[CREATE PURCHASE ERROR]", error);
			throw error;
		}

		return data as Purchase;
	} catch (error: any) {
		console.error("[CREATE PURCHASE ERROR]", error);
		throw error;
	}
}

/**
 * Get user's purchase history
 * @param userId - UUID from users table (not whop_user_id)
 * @returns Array of purchase records
 */
export async function getUserPurchases(
	userId: string,
): Promise<Purchase[]> {
	try {
		const { data, error } = await supabaseAdmin
			.from("purchases")
			.select("*")
			.eq("user_id", userId)
			.order("created_at", { ascending: false });

		if (error) {
			console.error("[GET USER PURCHASES ERROR]", error);
			throw error;
		}

		return (data || []) as Purchase[];
	} catch (error: any) {
		console.error("[GET USER PURCHASES ERROR]", error);
		throw error;
	}
}

/**
 * Get user's purchase history by Whop user ID
 * Convenience function that looks up user first, then gets purchases
 * @param whopUserId - Whop user ID
 * @returns Array of purchase records
 */
export async function getUserPurchasesByWhopId(
	whopUserId: string,
): Promise<Purchase[]> {
	try {
		const user = await getUserByWhopId(whopUserId);
		if (!user) {
			return [];
		}
		return await getUserPurchases(user.id);
	} catch (error: any) {
		console.error("[GET USER PURCHASES BY WHOP ID ERROR]", error);
		throw error;
	}
}

