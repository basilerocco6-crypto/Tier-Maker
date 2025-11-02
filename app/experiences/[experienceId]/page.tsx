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

async function getUserRole(userId: string | null): Promise<"admin" | "member"> {
	// In development without auth, default to admin for testing
	if (!userId) {
		return "admin";
	}

	// Check if user is admin (Whop company owner)
	// For now, you can check based on Whop user data
	// You might want to store this in Supabase or check via Whop API
	// This is a placeholder - adjust based on your needs
	return "member"; // Default to member, update based on your logic
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

	// Fetch tier list data and user role
	const userRole = await getUserRole(userId);
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
