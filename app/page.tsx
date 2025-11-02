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

		// Method 1: Check if user is company owner (most reliable)
		try {
			const company = await whopsdk.companies.retrieve(whopCompanyId);
			const ownerId = (company as any).owner_id || (company as any).owner?.id;
			if (ownerId === userId) {
				console.log("[GET USER ROLE] User is company owner");
				return "admin";
			}
		} catch (companyError: any) {
			console.error("[GET USER ROLE] Failed to retrieve company:", companyError);
		}

		// Method 2: Try to get user's role from company members
		try {
			// Alternative approach: check if we can get company members
			// This might not work depending on SDK version, so we'll catch and continue
			const members = await (whopsdk as any).companyMembers?.list?.(whopCompanyId);
			if (members?.data) {
				const userMember = members.data.find((m: any) => m.user_id === userId || m.id === userId);
				if (userMember) {
					const role = (userMember as any).role || (userMember as any).user_role;
					if (role === "Owner" || role === "owner" || role === "Admin" || role === "admin") {
						console.log("[GET USER ROLE] User has admin role:", role);
						return "admin";
					}
				}
			}
		} catch (memberError: any) {
			// This API might not exist, that's okay
			console.log("[GET USER ROLE] Member API not available, using owner check only");
		}

		// If we can't determine, default to member for safety
		console.log("[GET USER ROLE] Could not determine role, defaulting to member");
		return "member";
	} catch (error: any) {
		console.error("[GET USER ROLE] Error checking user role:", error);
		return "member";
	}
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
