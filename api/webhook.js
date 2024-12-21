import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
	"https://pulwkoymwvvdwmrhkcpa.supabase.co",
	"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB1bHdrb3ltd3Z2ZHdtcmhrY3BhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzMzOTk3MTksImV4cCI6MjA0ODk3NTcxOX0.ScJKBIiUmj8geWvI0ZDp_hJ3bgozvQ1Q_tn-9aNKQUk",
	{
		auth: {
			autoRefreshToken: true,
			persistSession: true,
			detectSessionInUrl: true,
		},
	}
);

export default async function handler(req, res) {
	// Basic CORS setup
	res.setHeader("Access-Control-Allow-Origin", "*");

	// Extract webhookName from URL or use a default
	const webhookName =
		req.query.webhookName || req.body?.webhookName || "default";

	try {
		// Get all webhooks first to debug
		const { data: allWebhooks, error: listError } = await supabase
			.from("webhooks")
			.select("*");

		// Now try the webhook query with both possible URL formats
		const possibleUrls = [
			`https://gweilo.vercel.app/api/webhook?webhookName=${webhookName}`,
			`https://gweilo.vercel.app/api/webhook`,
		];

		const { data: webhook, error: webhookError } = await supabase
			.from("webhooks")
			.select("*")
			.or(`url.eq.${possibleUrls[0]},url.eq.${possibleUrls[1]}`)
			.single();

		// ... rest of the existing logic ...
	} catch (error) {
		console.error("Webhook handler error:", error);
		return res.status(500).json({
			message: "An error occurred",
			error: error.message,
		});
	}
}
