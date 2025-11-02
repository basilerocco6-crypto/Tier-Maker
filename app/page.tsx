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
		console.log("[GET USER ROLE] No userId, defaulting to admin for dev");
		return "admin";
	}

	console.log("[GET USER ROLE] Checking role for userId:", userId);
	console.log("[GET USER ROLE] Agent userId from env:", process.env.NEXT_PUBLIC_WHOP_AGENT_USER_ID);

	// Quick check: If user is the agent user (app developer), grant admin
	const agentUserId = process.env.NEXT_PUBLIC_WHOP_AGENT_USER_ID;
	if (agentUserId && userId === agentUserId) {
		console.log("[GET USER ROLE] ✅ User is agent user, granting admin");
		return "admin";
	}

	// Check if user is admin (Owner or Admin role in Whop company)
	try {
		// Get company ID from environment or parameter
		const whopCompanyId = companyId || process.env.NEXT_PUBLIC_WHOP_COMPANY_ID;
		
		console.log("[GET USER ROLE] Company ID:", whopCompanyId);
		
		if (!whopCompanyId) {
			console.warn("[GET USER ROLE] ⚠️ Company ID not set, defaulting to member");
			return "member";
		}

		// Method 1: Check if user is company owner (most reliable)
		try {
			const company = await whopsdk.companies.retrieve(whopCompanyId);
			const ownerId = (company as any).owner_id || (company as any).owner?.id || (company as any).owner_id;
			
			console.log("[GET USER ROLE] Company owner check:", {
				userId,
				ownerId,
				companyId: whopCompanyId,
				match: ownerId === userId,
				fullCompanyData: JSON.stringify(company).slice(0, 200),
			});
			
			if (ownerId === userId) {
				console.log("[GET USER ROLE] ✅ User is company owner");
				return "admin";
			}
		} catch (companyError: any) {
			console.error("[GET USER ROLE] ❌ Failed to retrieve company:", companyError.message || companyError);
		}

		// Method 2: Try to get user's role from company members
		try {
			// Alternative approach: check if we can get company members
			// This might not work depending on SDK version, so we'll catch and continue
			const members = await (whopsdk as any).companyMembers?.list?.(whopCompanyId);
			if (members?.data) {
				console.log("[GET USER ROLE] Found company members:", members.data.length);
				const userMember = members.data.find((m: any) => m.user_id === userId || m.id === userId);
				if (userMember) {
					const role = (userMember as any).role || (userMember as any).user_role;
					console.log("[GET USER ROLE] User member found:", { role, userMember: JSON.stringify(userMember).slice(0, 200) });
					if (role === "Owner" || role === "owner" || role === "Admin" || role === "admin") {
						console.log("[GET USER ROLE] ✅ User has admin role:", role);
						return "admin";
					}
				} else {
					console.log("[GET USER ROLE] User not found in company members list");
				}
			}
		} catch (memberError: any) {
			// This API might not exist, that's okay
			console.log("[GET USER ROLE] Member API not available:", memberError.message || memberError);
		}

		// If we can't determine, default to member for safety
		console.log("[GET USER ROLE] ⚠️ Could not determine role, defaulting to member");
		return "member";
	} catch (error: any) {
		console.error("[GET USER ROLE] ❌ Error checking user role:", error.message || error);
		return "member";
	}
}

export default async function DashboardPage() {
	try {
		const userId = await getUserId();
		console.log("[DASHBOARD PAGE] Authenticated userId:", userId);
		
		// Try to get company ID from environment
		const companyId = process.env.NEXT_PUBLIC_WHOP_COMPANY_ID;
		console.log("[DASHBOARD PAGE] Company ID:", companyId);
		
		const userRole = await getUserRole(userId, companyId);
		console.log("[DASHBOARD PAGE] Final user role:", userRole);
		
		const tierLists = await getTierLists(userId, userRole);

		return (
			<TierListGallery
				tierLists={tierLists}
				userRole={userRole}
				userId={userId || "dev-user"}
			/>
		);
	} catch (error: any) {
		// Handle authentication errors gracefully
		console.error("[DASHBOARD PAGE] Error:", error);
		
		// If accessing directly (not through Whop iframe), show a helpful message
		return (
			<div className="min-h-screen flex items-center justify-center p-8 bg-gray-a1">
				<div className="max-w-md w-full bg-gray-a2 border border-gray-a4 rounded-lg p-8 text-center">
					<h1 className="text-9 font-bold text-gray-12 mb-4">
						Authentication Required
					</h1>
					<p className="text-4 text-gray-10 mb-4">
						This app must be accessed through the Whop platform.
					</p>
					<p className="text-3 text-gray-9 mb-2">
						To use this app:
					</p>
					<ul className="text-2 text-gray-9 text-left space-y-2 mb-6">
						<li>• Access it through your Whop experience</li>
						<li>• Ensure you're logged in to Whop</li>
						<li>• Use the Whop app iframe</li>
					</ul>
					<p className="text-2 text-gray-8">
						If you're the app developer, make sure your app is properly configured in the Whop dashboard.
					</p>
				</div>
			</div>
		);
	}
}
