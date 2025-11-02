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
	} catch (error: any) {
		console.error("[EXPERIENCE PAGE] Failed to get experience:", error);
		companyId = process.env.NEXT_PUBLIC_WHOP_COMPANY_ID;
	}

	// Fetch tier list data and user role
	const userRole = await getUserRole(userId, companyId);
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
