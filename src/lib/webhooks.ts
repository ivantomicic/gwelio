import { supabase } from "./supabase";
import { Webhook } from "../types";

export async function getWebhooks(): Promise<Webhook[]> {
	const { data, error } = await supabase
		.from("webhooks")
		.select("*")
		.order("name");

	if (error) throw error;
	return data || [];
}

export async function triggerWebhook(url: string, payload: any): Promise<void> {
	try {
		const response = await fetch(url, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(payload),
		});

		if (!response.ok) {
			throw new Error(`Webhook failed with status: ${response.status}`);
		}

		const data = await response.json().catch(() => null);
		console.log("Webhook triggered successfully:", data);
	} catch (error) {
		console.error("Error triggering webhook:", error);
		throw error;
	}
}

export async function updateWebhookUrls(baseUrl: string): Promise<void> {
	// Get your server's base URL (e.g., https://your-domain.com)
	const webhookEndpoint = `${baseUrl}/api/webhook`;

	const { error } = await supabase
		.from("webhooks")
		.update({ url: webhookEndpoint })
		.neq("id", ""); // Updates all records

	if (error) {
		console.error("Failed to update webhook URLs:", error);
		throw error;
	}
}
