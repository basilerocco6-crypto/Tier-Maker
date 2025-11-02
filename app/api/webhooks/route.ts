import { waitUntil } from "@vercel/functions";
import type { NextRequest } from "next/server";
import { whopsdk } from "@/lib/whop-sdk";
import { supabaseAdmin } from "@/lib/supabase";

/**
 * Webhook handler for Whop events
 * 
 * Handles:
 * - payment_succeeded / payment.succeeded: Grants access to paid tier lists
 * - invoice_paid: Grants access when invoice is paid
 * - invoice_voided: Revokes access when invoice is voided
 * - membership_activated / membership.activated: Activates membership access
 * - membership_deactivated / membership.deactivated: Deactivates membership access
 * 
 * Always returns 200 quickly to avoid retries.
 * Uses waitUntil() for async processing.
 */
export async function POST(request: NextRequest): Promise<Response> {
	try {
		// Validate WHOP_WEBHOOK_SECRET is set
		if (!process.env.WHOP_WEBHOOK_SECRET) {
			console.error("[WEBHOOK ERROR] WHOP_WEBHOOK_SECRET not set in environment variables");
			return new Response("Webhook secret not configured", { status: 500 });
		}

		// 1. Get request body as text
		const requestBodyText = await request.text();

		// 2. Get headers as object
		const headers = Object.fromEntries(request.headers);

		// 3. Unwrap webhook to validate and parse
		const webhookData = whopsdk.webhooks.unwrap(requestBodyText, { headers });

		// 4. Handle different webhook event types
		// Support both snake_case (from Whop dashboard) and dot notation formats
		const eventType = webhookData.type;

		if (eventType === "payment_succeeded" || eventType === "payment.succeeded") {
			// Use waitUntil for async processing without blocking response
			waitUntil(handlePaymentSucceeded(webhookData.data));
		} else if (eventType === "invoice_paid" || eventType === "invoice.paid") {
			waitUntil(handleInvoicePaid(webhookData.data));
		} else if (eventType === "invoice_voided" || eventType === "invoice.voided") {
			waitUntil(handleInvoiceVoided(webhookData.data));
		} else if (eventType === "membership_activated" || eventType === "membership.activated") {
			waitUntil(handleMembershipActivated(webhookData.data));
		} else if (eventType === "membership_deactivated" || eventType === "membership.deactivated") {
			waitUntil(handleMembershipDeactivated(webhookData.data));
		} else {
			// Log unhandled events for monitoring
			console.log(`[WEBHOOK] Unhandled event type: ${eventType}`, webhookData.data);
		}

		// 5. Always return 200 status quickly to avoid retries
		return new Response("OK", { status: 200 });
	} catch (error: any) {
		console.error("[WEBHOOK ERROR]", error);
		// Still return 200 to prevent webhook retries
		// Log error for debugging
		return new Response("Error processing webhook", { status: 200 });
	}
}

/**
 * Handle payment.succeeded event
 * Grants access to paid tier lists by creating user_paid_access record
 */
async function handlePaymentSucceeded(payment: any) {
	try {
		console.log("[PAYMENT SUCCEEDED]", {
			paymentId: payment.id,
			userId: payment.user_id,
			amount: payment.amount,
			metadata: payment.metadata,
		});

		// Access metadata from webhookData.data.metadata
		const metadata = payment.metadata || {};
		const templateId = metadata.templateId || metadata.template_id;

		// If metadata contains templateId, grant access to that tier list
		if (templateId && payment.user_id) {
			// Insert into user_paid_access table
			const { data, error } = await supabaseAdmin
				.from("user_paid_access")
				.upsert(
					{
						user_id: payment.user_id,
						template_id: templateId,
					},
					{
						onConflict: "user_id,template_id",
					}
				)
				.select()
				.single();

			if (error) {
				console.error("[PAYMENT SUCCEEDED ERROR] Failed to grant access:", error);
				throw error;
			}

			console.log("[PAYMENT SUCCEEDED] Access granted:", {
				userId: payment.user_id,
				templateId,
				accessId: data.id,
			});
		} else {
			console.warn("[PAYMENT SUCCEEDED] Missing templateId or userId in metadata:", {
				userId: payment.user_id,
				metadata,
			});
		}

		// Additional processing can go here:
		// - Send confirmation email
		// - Update analytics
		// - Notify user
	} catch (error: any) {
		console.error("[PAYMENT SUCCEEDED ERROR]", error);
		// Don't throw - we've already returned 200 to Whop
		// Log error for debugging and manual intervention
	}
}

/**
 * Handle membership.activated event
 * Activates membership access for a user
 */
async function handleMembershipActivated(membership: any) {
	try {
		console.log("[MEMBERSHIP ACTIVATED]", {
			membershipId: membership.id,
			userId: membership.user_id,
			companyId: membership.company_id,
			metadata: membership.metadata,
		});

		// Access metadata from webhookData.data.metadata
		const metadata = membership.metadata || {};
		const templateId = metadata.templateId || metadata.template_id;

		// If membership is for a specific tier list, grant access
		if (templateId && membership.user_id) {
			const { data, error } = await supabaseAdmin
				.from("user_paid_access")
				.upsert(
					{
						user_id: membership.user_id,
						template_id: templateId,
					},
					{
						onConflict: "user_id,template_id",
					}
				)
				.select()
				.single();

			if (error) {
				console.error("[MEMBERSHIP ACTIVATED ERROR] Failed to grant access:", error);
				throw error;
			}

			console.log("[MEMBERSHIP ACTIVATED] Access granted:", {
				userId: membership.user_id,
				templateId,
				accessId: data.id,
			});
		} else {
			console.log("[MEMBERSHIP ACTIVATED] No specific template access needed");
		}

		// Additional processing:
		// - Welcome user
		// - Send onboarding email
		// - Update user status
	} catch (error: any) {
		console.error("[MEMBERSHIP ACTIVATED ERROR]", error);
	}
}

/**
 * Handle invoice_paid event
 * Grants access to paid tier lists when invoice is paid
 * This is often more reliable than payment_succeeded
 */
async function handleInvoicePaid(invoice: any) {
	try {
		console.log("[INVOICE PAID]", {
			invoiceId: invoice.id,
			userId: invoice.user_id,
			amount: invoice.amount,
			metadata: invoice.metadata,
		});

		// Access metadata from webhookData.data.metadata
		const metadata = invoice.metadata || {};
		const templateId = metadata.templateId || metadata.template_id;

		// If metadata contains templateId, grant access to that tier list
		if (templateId && invoice.user_id) {
			// Insert into user_paid_access table
			const { data, error } = await supabaseAdmin
				.from("user_paid_access")
				.upsert(
					{
						user_id: invoice.user_id,
						template_id: templateId,
					},
					{
						onConflict: "user_id,template_id",
					}
				)
				.select()
				.single();

			if (error) {
				console.error("[INVOICE PAID ERROR] Failed to grant access:", error);
				throw error;
			}

			console.log("[INVOICE PAID] Access granted:", {
				userId: invoice.user_id,
				templateId,
				accessId: data.id,
			});
		} else {
			console.warn("[INVOICE PAID] Missing templateId or userId in metadata:", {
				userId: invoice.user_id,
				metadata,
			});
		}

		// Additional processing:
		// - Send confirmation email
		// - Update analytics
		// - Notify user
	} catch (error: any) {
		console.error("[INVOICE PAID ERROR]", error);
	}
}

/**
 * Handle invoice_voided event
 * Optionally revokes access when invoice is voided
 */
async function handleInvoiceVoided(invoice: any) {
	try {
		console.log("[INVOICE VOIDED]", {
			invoiceId: invoice.id,
			userId: invoice.user_id,
			amount: invoice.amount,
			metadata: invoice.metadata,
		});

		// Access metadata from webhookData.data.metadata
		const metadata = invoice.metadata || {};
		const templateId = metadata.templateId || metadata.template_id;

		// Optionally revoke access when invoice is voided
		// Note: You may want to keep access for historical reasons
		if (templateId && invoice.user_id) {
			// Option 1: Remove access (uncomment to enable)
			// const { error } = await supabaseAdmin
			//   .from("user_paid_access")
			//   .delete()
			//   .eq("user_id", invoice.user_id)
			//   .eq("template_id", templateId);

			// if (error) {
			//   console.error("[INVOICE VOIDED ERROR] Failed to revoke access:", error);
			//   throw error;
			// }

			// Option 2: Keep access but mark as voided (recommended)
			// Add a status column to track voided invoices if needed

			console.log("[INVOICE VOIDED] Access handling:", {
				userId: invoice.user_id,
				templateId,
				note: "Access retained (historical records preserved)",
			});
		} else {
			console.warn("[INVOICE VOIDED] Missing templateId or userId in metadata:", {
				userId: invoice.user_id,
				metadata,
			});
		}

		// Additional processing:
		// - Send notification to user
		// - Update analytics
		// - Refund processing
	} catch (error: any) {
		console.error("[INVOICE VOIDED ERROR]", error);
	}
}

/**
 * Handle membership.deactivated event
 * Deactivates membership access for a user
 */
async function handleMembershipDeactivated(membership: any) {
	try {
		console.log("[MEMBERSHIP DEACTIVATED]", {
			membershipId: membership.id,
			userId: membership.user_id,
			companyId: membership.company_id,
			metadata: membership.metadata,
		});

		// Access metadata from webhookData.data.metadata
		const metadata = membership.metadata || {};
		const templateId = metadata.templateId || metadata.template_id;

		// If membership was for a specific tier list, optionally revoke access
		// Note: You may want to keep access even after deactivation for historical reasons
		// Adjust this logic based on your business requirements
		if (templateId && membership.user_id) {
			// Option 1: Remove access (uncomment to enable)
			// const { error } = await supabaseAdmin
			//   .from("user_paid_access")
			//   .delete()
			//   .eq("user_id", membership.user_id)
			//   .eq("template_id", templateId);

			// if (error) {
			//   console.error("[MEMBERSHIP DEACTIVATED ERROR] Failed to revoke access:", error);
			//   throw error;
			// }

			// Option 2: Keep access but mark as inactive (recommended)
			// Add a column to track active/inactive status if needed

			console.log("[MEMBERSHIP DEACTIVATED] Access handling:", {
				userId: membership.user_id,
				templateId,
				note: "Access retained (historical records preserved)",
			});
		} else {
			console.log("[MEMBERSHIP DEACTIVATED] No specific template access to revoke");
		}

		// Additional processing:
		// - Send cancellation email
		// - Update analytics
		// - Offer renewal discounts
	} catch (error: any) {
		console.error("[MEMBERSHIP DEACTIVATED ERROR]", error);
	}
}
