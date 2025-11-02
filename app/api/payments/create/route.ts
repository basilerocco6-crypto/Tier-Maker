import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { whopsdk } from "@/lib/whop-sdk";
import { supabaseAdmin } from "@/lib/supabase";

export async function POST(request: Request) {
	try {
		const { userId } = await whopsdk.verifyUserToken(await headers());
		const body = await request.json();

		// Create payment checkout using Whop SDK
		// This is a placeholder - adjust based on Whop payment API
		const checkout = await whopsdk.checkouts.create({
			productId: body.templateId, // You'll need a Whop product ID
			amount: body.amount,
			userId: userId,
		});

		// Or use Whop's payment links
		// For now, create a checkout URL or payment link
		const checkoutUrl = checkout.url || `/checkout/${checkout.id}`;

		return NextResponse.json({ checkoutUrl, checkoutId: checkout.id });
	} catch (error: any) {
		console.error("Payment creation error:", error);
		return NextResponse.json(
			{ error: error.message || "Failed to create payment" },
			{ status: 500 }
		);
	}
}

