import { NextResponse } from "next/server";
import { getUserId } from "@/lib/auth-helper";
import { supabaseAdmin } from "@/lib/supabase";

export async function GET(
	request: Request,
	{ params }: { params: Promise<{ id: string }> }
) {
	try {
		const userId = await getUserId();
		const { id } = await params;

		const { data, error } = await supabaseAdmin
			.from("tier_list_templates")
			.select("*")
			.eq("id", id)
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

export async function PUT(
	request: Request,
	{ params }: { params: Promise<{ id: string }> }
) {
	try {
		const userId = await getUserId();
		
		if (!userId) {
			return NextResponse.json(
				{ error: "User authentication required" },
				{ status: 401 }
			);
		}
		
		const { id } = await params;
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

		if (!body.status || !["draft", "published", "open_for_submission"].includes(body.status)) {
			return NextResponse.json(
				{ error: "status must be one of: draft, published, open_for_submission" },
				{ status: 400 }
			);
		}

		// First, fetch the existing template to preserve created_by
		const { data: existingTemplate, error: fetchError } = await supabaseAdmin
			.from("tier_list_templates")
			.select("created_by")
			.eq("id", id)
			.single();

		if (fetchError || !existingTemplate) {
			console.error("Error fetching existing template:", fetchError);
			return NextResponse.json(
				{ error: "Tier list not found" },
				{ status: 404 }
			);
		}

		// Preserve created_by if it exists, otherwise set it to current user (for backward compatibility)
		const createdBy = existingTemplate.created_by || userId;

		const { data, error } = await supabaseAdmin
			.from("tier_list_templates")
			.update({
				title: body.title.trim(),
				status: body.status,
				access_type: "free", // All tier lists are free
				tier_rows: body.tierRows,
				item_bank: body.itemBank,
				admin_placement: body.adminPlacement || {},
				created_by: createdBy, // Preserve the original creator
				updated_at: new Date().toISOString(),
			})
			.eq("id", id)
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

export async function DELETE(
	request: Request,
	{ params }: { params: Promise<{ id: string }> }
) {
	try {
		const userId = await getUserId();
		const { id } = await params;

		// First, check if the tier list exists and if the user is the creator
		const { data: template, error: fetchError } = await supabaseAdmin
			.from("tier_list_templates")
			.select("created_by")
			.eq("id", id)
			.single();

		if (fetchError || !template) {
			return NextResponse.json(
				{ error: "Tier list not found" },
				{ status: 404 }
			);
		}

		// Check ownership - only the creator can delete
		// If created_by is null, nobody can delete it (safety check)
		if (!template.created_by || template.created_by !== userId) {
			return NextResponse.json(
				{ error: "You can only delete tier lists you created" },
				{ status: 403 }
			);
		}

		// Delete the tier list
		const { error } = await supabaseAdmin
			.from("tier_list_templates")
			.delete()
			.eq("id", id);

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

		return NextResponse.json({ success: true });
	} catch (error: any) {
		console.error("API error:", error);
		return NextResponse.json(
			{ error: error?.message || "Unauthorized" },
			{ status: 401 }
		);
	}
}

