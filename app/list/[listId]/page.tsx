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

	return data as TierListTemplate;
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
			hasAccess={true}
			existingSubmission={submission}
		/>
	);
}

