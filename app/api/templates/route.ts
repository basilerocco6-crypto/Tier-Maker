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
		
		if (!userId) {
			return NextResponse.json(
				{ error: "User authentication required" },
				{ status: 401 }
			);
		}

		const body = await request.json();

		// Validate required fields
		if (!body.title || typeof body.title !== "string" || body.title.trim() === "") {
			return NextResponse.json(
				{ error: "Title is required and must be a non-empty string" },
				{ status: 400 }
			);
		}

		if (!Array.isArray(body.tierRows)) {
			return NextResponse.json(
				{ error: "tierRows must be an array" },
				{ status: 400 }
			);
		}

		if (!Array.isArray(body.itemBank)) {
			return NextResponse.json(
				{ error: "itemBank must be an array" },
				{ status: 400 }
			);
		}

		const status = body.status || "draft";
		if (!["draft", "published", "open_for_submission"].includes(status)) {
			return NextResponse.json(
				{ error: "status must be one of: draft, published, open_for_submission" },
				{ status: 400 }
			);
		}

		const { data, error } = await supabaseAdmin
			.from("tier_list_templates")
			.insert({
				title: body.title.trim(),
				status: status,
				access_type: "free", // All tier lists are free
				tier_rows: body.tierRows || [],
				item_bank: body.itemBank || [],
				admin_placement: body.adminPlacement || {},
				created_by: userId, // Save the creator's user ID
			})
			.select()
			.single();

		if (error) {
			console.error("Supabase error:", error);
			return NextResponse.json(
				{
					error: error.message,
					details: "Database operation failed. Check if Supabase tables exist and RLS policies are configured correctly.",
				},
				{ status: 500 }
			);
		}

		return NextResponse.json({ template: data });
	} catch (error: any) {
		console.error("API error:", error);
		// Handle JSON parsing errors
		if (error instanceof SyntaxError) {
			return NextResponse.json(
				{ error: "Invalid JSON in request body" },
				{ status: 400 }
			);
		}
		return NextResponse.json(
			{ error: error?.message || "Unauthorized" },
			{ status: 401 }
		);
	}
}

