import { supabaseAdmin } from "@/lib/supabase";
import { CreateTierListButton } from "@/components/CreateTierListButton";
import { TierListGrid } from "@/components/TierListGrid";
import { getUserId } from "@/lib/auth-helper";
import type { TierListTemplate } from "@/lib/types";

async function getTierLists(userId: string | null) {
	// Fetch all published tier lists (everyone sees the same lists)
	const { data, error } = await supabaseAdmin
		.from("tier_list_templates")
		.select("*")
		.eq("status", "published")
		.order("created_at", { ascending: false });

	if (error) {
		console.error("Error fetching tier lists:", error);
		return [];
	}

	// Normalize snake_case from DB to camelCase
	return (data || []).map((item: any) => {
		const normalized = {
			...item,
			tierRows: item.tier_rows || [],
			itemBank: item.item_bank || [],
			adminPlacement: item.admin_placement || {},
			createdBy: item.created_by || item.createdBy || null,
			createdAt: item.created_at || item.createdAt,
			updatedAt: item.updated_at || item.updatedAt,
			accessType: item.access_type || item.accessType || "free",
		};
		// Debug: Log in development to help diagnose
		if (process.env.NODE_ENV === "development") {
			console.log("[getTierLists] Normalized:", {
				id: normalized.id,
				title: normalized.title,
				createdBy: normalized.createdBy,
				created_by: item.created_by,
				userId,
			});
		}
		return normalized;
	}) as TierListTemplate[];
}

export default async function ExperiencePage({
    params,
}: {
    params: Promise<{ experienceId: string }>;
}) {
    // We ignore access distinctions; everyone can see published lists
    await params; // ensure param promise resolves (unused)

    // Get userId for ownership checks
    const userId = await getUserId().catch(() => null);

    // Fetch tier list data - everyone uses the same member interface
    const tierLists = await getTierLists(userId);

	// Everyone uses the member interface - no admin/member distinction
	return (
		<div className="min-h-screen p-4 sm:p-6 md:p-8 bg-gray-a1">
			<div className="max-w-7xl mx-auto">
				<div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 sm:gap-0 mb-6 sm:mb-8">
					<h1 className="text-7 sm:text-8 md:text-9 font-bold text-gray-12">Tier Lists</h1>
					<CreateTierListButton />
				</div>
				
				<TierListGrid tierLists={tierLists} userId={userId} />
			</div>
		</div>
	);
}
