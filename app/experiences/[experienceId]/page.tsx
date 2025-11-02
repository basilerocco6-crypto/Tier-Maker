import { headers } from "next/headers";
import { whopsdk } from "@/lib/whop-sdk";
import { TierListGallery } from "@/components/TierListGallery";
import { supabaseAdmin } from "@/lib/supabase";
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

	// Quick check: If user is the agent user (app developer), grant admin
	const agentUserId = process.env.NEXT_PUBLIC_WHOP_AGENT_USER_ID;
	if (agentUserId && userId === agentUserId) {
		console.log("[GET USER ROLE] User is agent user, granting admin");
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
			const ownerId = (company as any).owner_id || (company as any).owner?.id || (company as any).owner_id;
			
			console.log("[GET USER ROLE] Company owner check:", {
				userId,
				ownerId,
				companyId: whopCompanyId,
				match: ownerId === userId,
			});
			
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

export default async function ExperiencePage({
	params,
}: {
	params: Promise<{ experienceId: string }>;
}) {
	// Handle experienceId from params (Promise in Next.js 15)
	const { experienceId } = await params;

	// 1. Implement authentication
	// Use await whopsdk.verifyUserToken(await headers()) to get userId
	// Wrap in try-catch to handle missing token gracefully
	let userId: string;
	try {
		const result = await whopsdk.verifyUserToken(await headers());
		userId = result.userId;
	} catch (error: any) {
		// If token is missing, show a helpful error message
		return (
			<div className="min-h-screen flex items-center justify-center p-8 bg-gray-a1">
				<div className="max-w-md w-full bg-gray-a2 border border-gray-a4 rounded-lg p-8 text-center">
					<h1 className="text-9 font-bold text-gray-12 mb-4">
						Authentication Required
					</h1>
					<p className="text-4 text-gray-10 mb-4">
						Whop user token not found.
					</p>
					<p className="text-3 text-gray-9 mb-2">
						To fix this:
					</p>
					<ul className="text-2 text-gray-9 text-left space-y-2 mb-6">
						<li>• Ensure you're accessing this through the Whop iframe</li>
						<li>• Enable the dev proxy in your Whop app settings</li>
						<li>• Make sure your app is running with <code className="bg-gray-a3 px-1 rounded">pnpm dev</code></li>
						<li>• Check that your environment variables are set correctly</li>
					</ul>
					<p className="text-2 text-gray-8">
						If you're the app developer, see the Whop documentation for setting up local development.
					</p>
				</div>
			</div>
		);
	}

	// Use await whopsdk.users.checkAccess(experienceId, { id: userId }) to verify access
	const access = await whopsdk.users.checkAccess(experienceId, { id: userId });

	// Check if access.has_access is true
	// Note: The SDK uses snake_case, so it's `has_access` not `hasAccess`
	if (!access.has_access) {
		// If no access, return an access denied message
		return (
			<div className="min-h-screen flex items-center justify-center p-8 bg-gray-a1">
				<div className="max-w-md w-full bg-gray-a2 border border-gray-a4 rounded-lg p-8 text-center">
					<h1 className="text-9 font-bold text-gray-12 mb-4">
						Access Denied
					</h1>
					<p className="text-4 text-gray-10 mb-6">
						You don't have access to this experience.
					</p>
					<p className="text-2 text-gray-9">
						Please contact the experience owner for access.
					</p>
				</div>
			</div>
		);
	}

	// Get company ID from experience
	let companyId: string | undefined;
	try {
		const experience = await whopsdk.experiences.retrieve(experienceId);
		companyId = (experience as any).company_id || process.env.NEXT_PUBLIC_WHOP_COMPANY_ID;
		console.log("[EXPERIENCE PAGE] Company ID from experience:", companyId);
	} catch (error: any) {
		console.error("[EXPERIENCE PAGE] Failed to get experience:", error);
		companyId = process.env.NEXT_PUBLIC_WHOP_COMPANY_ID;
	}

	// Fetch tier list data and user role
	const userRole = await getUserRole(userId, companyId);
	console.log("[EXPERIENCE PAGE] Final user role:", userRole, "for userId:", userId);
	const tierLists = await getTierLists(userId, userRole);

	// Render the actual Tier List application
	return (
		<TierListGallery
			tierLists={tierLists}
			userRole={userRole}
			userId={userId}
		/>
	);
}
