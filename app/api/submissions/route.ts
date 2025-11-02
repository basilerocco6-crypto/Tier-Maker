import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { whopsdk } from "@/lib/whop-sdk";
import { supabaseAdmin } from "@/lib/supabase";

export async function POST(request: Request) {
	try {
		const { userId } = await whopsdk.verifyUserToken(await headers());
		const body = await request.json();

		const { data, error } = await supabaseAdmin
			.from("tier_list_submissions")
			.upsert(
				{
					template_id: body.templateId,
					user_id: userId,
					user_placement: body.userPlacement,
				},
				{
					onConflict: "template_id,user_id",
				}
			)
			.select()
			.single();

		if (error) {
			return NextResponse.json({ error: error.message }, { status: 500 });
		}

		return NextResponse.json({ submission: data });
	} catch (error) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}
}

export async function GET(request: Request) {
	try {
		const { userId } = await whopsdk.verifyUserToken(await headers());
		const { searchParams } = new URL(request.url);
		const templateId = searchParams.get("templateId");

		if (!templateId) {
			return NextResponse.json({ error: "templateId required" }, { status: 400 });
		}

		const { data, error } = await supabaseAdmin
			.from("tier_list_submissions")
			.select("*")
			.eq("template_id", templateId)
			.order("created_at", { ascending: false });

		if (error) {
			return NextResponse.json({ error: error.message }, { status: 500 });
		}

		return NextResponse.json({ submissions: data });
	} catch (error) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}
}

