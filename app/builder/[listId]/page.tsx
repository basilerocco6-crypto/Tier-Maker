import { notFound } from "next/navigation";
import { AdminBuilder } from "@/components/AdminBuilder";
import { getUserId } from "@/lib/auth-helper";
import { supabaseAdmin } from "@/lib/supabase";
import type { TierListTemplate } from "@/lib/types";

async function getTemplate(listId: string): Promise<TierListTemplate | null> {
	if (listId === "new") {
		return null;
	}

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

export default async function BuilderPage({
	params,
}: {
	params: Promise<{ listId: string }>;
}) {
	const { listId } = await params;
	const userId = await getUserId();

	// No admin check - everyone can create tier lists
	const template = await getTemplate(listId);

	return <AdminBuilder template={template} listId={listId} userId={userId || "dev-user"} />;
}

