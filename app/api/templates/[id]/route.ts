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
		const { id } = await params;
		const body = await request.json();

		const { data, error } = await supabaseAdmin
			.from("tier_list_templates")
			.update({
				title: body.title,
				status: body.status,
				access_type: body.accessType,
				price: body.price,
				tier_rows: body.tierRows,
				item_bank: body.itemBank,
				admin_placement: body.adminPlacement,
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

export async function DELETE(
	request: Request,
	{ params }: { params: Promise<{ id: string }> }
) {
	try {
		const userId = await getUserId();
		const { id } = await params;

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

