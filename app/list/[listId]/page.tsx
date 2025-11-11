import { notFound } from "next/navigation";
import { MemberListPage } from "@/components/MemberListPage";
import { getUserId } from "@/lib/auth-helper";
import { supabaseAdmin } from "@/lib/supabase";
import type { TierListTemplate, TierListSubmission } from "@/lib/types";

async function getTemplate(listId: string) {
	const { data, error } = await supabaseAdmin
		.from("tier_list_templates")
		.select("*")
		.eq("id", listId)
		.single();

	if (error || !data) {
		return null;
	}

    // Normalize snake_case from DB to camelCase expected by app
    const normalized: TierListTemplate = {
        id: (data as any).id,
        title: (data as any).title,
        status: (data as any).status,
        accessType: ((data as any).access_type || (data as any).accessType || "free") as "free",
        tierRows: (data as any).tier_rows || (data as any).tierRows || [],
        itemBank: (data as any).item_bank || (data as any).itemBank || [],
        adminPlacement: (data as any).admin_placement || (data as any).adminPlacement || {},
        createdBy: (data as any).created_by || (data as any).createdBy || null,
        createdAt: (data as any).created_at || (data as any).createdAt,
        updatedAt: (data as any).updated_at || (data as any).updatedAt,
    };

    return normalized;
}

async function getUserSubmission(
	templateId: string,
	userId: string
): Promise<TierListSubmission | null> {
	const { data, error } = await supabaseAdmin
		.from("tier_list_submissions")
		.select("*")
		.eq("template_id", templateId)
		.eq("user_id", userId)
		.single();

	if (error || !data) {
		return null;
	}

	return data as TierListSubmission;
}


export default async function ListPage({
	params,
}: {
	params: Promise<{ listId: string }>;
}) {
	const { listId } = await params;
	const userId = await getUserId();

	const template = await getTemplate(listId);
	if (!template) {
		notFound();
	}

	// Get user's submission if exists
	const submission = userId ? await getUserSubmission(listId, userId) : null;

	// All tier lists are free - no access checks needed
	return (
		<MemberListPage
			template={template}
			userId={userId || "dev-user"}
			existingSubmission={submission}
		/>
	);
}

