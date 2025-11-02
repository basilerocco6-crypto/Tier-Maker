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

export default async function AdminBuilderPage({
	params,
}: {
	params: Promise<{ listId: string }>;
}) {
	const { listId } = await params;
	const userId = await getUserId();

	// In development, allow access. In production, check if user is admin
	if (!userId && process.env.NODE_ENV !== "development") {
		return (
			<div className="min-h-screen flex items-center justify-center p-8">
				<div className="text-center">
					<h1 className="text-9 font-bold text-gray-12 mb-4">Access Denied</h1>
					<p className="text-3 text-gray-10">You must be an admin to access this page.</p>
				</div>
			</div>
		);
	}

	const template = await getTemplate(listId);

	return <AdminBuilder template={template} listId={listId} userId={userId || "dev-user"} />;
}

