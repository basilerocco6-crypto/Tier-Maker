import { TierListGallery } from "@/components/TierListGallery";
import { getUserId } from "@/lib/auth-helper";
import { supabaseAdmin } from "@/lib/supabase";
import { whopsdk } from "@/lib/whop-sdk";
import type { TierListTemplate } from "@/lib/types";

async function getTierLists(userId: string | null, userRole: "admin" | "member") {
	// Fetch all tier lists based on user role
	const { data, error } = await supabaseAdmin
		.from("tier_list_templates")
		.select("*")
		.order("created_at", { ascending: false });

	if (error) {
		console.error("Error fetching tier lists:", error);
		return [];
	}

	return data as TierListTemplate[];
}

async function getUserRole(userId: string | null, companyId?: string): Promise<"admin" | "member"> {
	// In development without auth, default to admin for testing
	if (!userId) {
		return "admin";
	}

	// Check if user is admin (Owner or Admin role in Whop company)
	try {
		// Get company ID from environment or parameter
		const whopCompanyId = companyId || process.env.NEXT_PUBLIC_WHOP_COMPANY_ID;
		
		if (!whopCompanyId) {
			console.warn("[GET USER ROLE] Company ID not set, defaulting to member");
			return "member";
		}

		// Get user's company membership to check role
		// Check if user has Owner or Admin role in the company
		try {
			// Try to get company memberships for the user
			const memberships = await whopsdk.memberships.list({
				userId: userId,
				companyId: whopCompanyId,
			} as any);

			// Check if user has any membership with Owner or Admin role
			const membership = memberships.data?.[0];
			if (membership) {
				const role = (membership as any).role || (membership as any).user_role;
				// Map Whop roles to app roles
				// Owner and Admin = admin, others = member
				if (role === "Owner" || role === "owner" || role === "Admin" || role === "admin") {
					return "admin";
				}
			}
		} catch (error: any) {
			// If memberships API fails, try alternative: check if user is company owner
			try {
				const company = await whopsdk.companies.retrieve(whopCompanyId);
				if ((company as any).owner_id === userId) {
					return "admin";
				}
			} catch (companyError: any) {
				console.error("[GET USER ROLE] Failed to check company owner:", companyError);
			}
			console.error("[GET USER ROLE] Failed to get user memberships:", error);
		}
	} catch (error: any) {
		console.error("[GET USER ROLE] Error checking user role:", error);
	}

	// Default to member if we can't determine role
	return "member";
}

export default async function DashboardPage() {
	const userId = await getUserId();
	const userRole = await getUserRole(userId);
	const tierLists = await getTierLists(userId, userRole);

	return (
		<TierListGallery
			tierLists={tierLists}
			userRole={userRole}
			userId={userId || "dev-user"}
		/>
	);
}
