import { NextResponse } from "next/server";
import { getUserId } from "@/lib/auth-helper";
import { supabaseAdmin } from "@/lib/supabase";
import type { TierListTemplate } from "@/lib/types";

export async function GET() {
	try {
		const userId = await getUserId();

		const { data, error } = await supabaseAdmin
			.from("tier_list_templates")
			.select("*")
			.order("created_at", { ascending: false });

		if (error) {
			console.error("Supabase error:", error);
			return NextResponse.json(
				{
					error: error.message,
					details: "Check if Supabase tables exist. Run lib/supabase-schema.sql in your Supabase SQL Editor.",
				},
				{ status: 500 }
			);
		}

		return NextResponse.json({ templates: data });
	} catch (error: any) {
		console.error("API error:", error);
		return NextResponse.json(
			{ error: error?.message || "Unauthorized" },
			{ status: 401 }
		);
	}
}

export async function POST(request: Request) {
	try {
		const userId = await getUserId();
		const body = await request.json();

		const { data, error } = await supabaseAdmin
			.from("tier_list_templates")
			.insert({
				title: body.title,
				status: body.status || "draft",
				access_type: body.accessType || "free",
				price: body.price,
				tier_rows: body.tierRows || [],
				item_bank: body.itemBank || [],
				admin_placement: body.adminPlacement || {},
			})
			.select()
			.single();

		if (error) {
			console.error("Supabase error:", error);
			return NextResponse.json(
				{
					error: error.message,
					details: "Check if Supabase tables exist. Run lib/supabase-schema.sql in your Supabase SQL Editor.",
				},
				{ status: 500 }
			);
		}

		return NextResponse.json({ template: data });
	} catch (error: any) {
		console.error("API error:", error);
		return NextResponse.json(
			{ error: error?.message || "Unauthorized" },
			{ status: 401 }
		);
	}
}

