import { notFound } from "next/navigation";
import { MemberListPage } from "@/components/MemberListPage";
import { getUserId } from "@/lib/auth-helper";
import { supabaseAdmin } from "@/lib/supabase";
import type { TierListTemplate, TierListSubmission, UserPaidAccess } from "@/lib/types";

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

async function hasPaidAccess(
	templateId: string,
	userId: string
): Promise<boolean> {
	const { data, error } = await supabaseAdmin
		.from("user_paid_access")
		.select("*")
		.eq("template_id", templateId)
		.eq("user_id", userId)
		.single();

	return !error && !!data;
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

	// Check payment access if needed
	let hasAccess = true;
	if (template.accessType === "paid" && userId) {
		hasAccess = await hasPaidAccess(listId, userId);
	}

	// Get user's submission if exists
	const submission = userId ? await getUserSubmission(listId, userId) : null;

	return (
		<MemberListPage
			template={template}
			userId={userId || "dev-user"}
			hasAccess={hasAccess}
			existingSubmission={submission}
		/>
	);
}

