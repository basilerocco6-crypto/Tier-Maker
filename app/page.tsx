import { TierListGallery } from "@/components/TierListGallery";
import { getUserId } from "@/lib/auth-helper";
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
