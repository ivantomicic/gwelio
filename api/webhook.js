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
	const { webhookName } = req.query;

	// Allow both GET and POST requests
	if (req.method !== "GET" && req.method !== "POST") {
		return res
			.status(405)
			.json({ message: "Only GET and POST requests allowed" });
	}

	try {
		// Add request body logging
		console.log("Incoming request body:", req.body);
		console.log("Incoming request query:", req.query);
		console.log("Incoming webhookName:", webhookName);

		// Test Supabase connection and table access
		console.log("Testing Supabase connection...");
		const { data: connectionTest, error: connectionError } = await supabase
			.from("webhooks")
			.select("*");

		if (connectionError) {
			console.error("Supabase connection error:", connectionError);
			return res.status(500).json({
				message: "Database connection error",
				error: connectionError,
				details: "Failed to connect to Supabase",
				debugInfo: {
					connectionTest,
					connectionError,
					timestamp: new Date().toISOString(),
				},
			});
		}

		console.log("Connection successful, all records:", connectionTest);

		// Get all webhooks first to debug
		const { data: allWebhooks, error: listError } = await supabase
			.from("webhooks")
			.select("*");

		// Now try the webhook query
		const webhookUrl = `https://gweilo.vercel.app/api/webhook?webhookName=${webhookName}`;
		console.log("Looking for webhook URL:", webhookUrl);

		const query = supabase
			.from("webhooks")
			.select("*")
			.eq("url", webhookUrl);

		const { data: webhook, error: webhookError } = await query.single();

		if (webhookError || !webhook) {
			console.error("Webhook not found or error occurred:");
			console.error("- Error:", webhookError);
			console.error("- Webhook data:", webhook);
			return res.status(404).json({
				message: "Webhook not found",
				error: webhookError,
				searchedUrl: webhookUrl,
				receivedQuery: req.query,
				debugInfo: {
					connectionStatus: "Connected",
					queryAttempted: query.toString(),
					allWebhooksInDB: allWebhooks, // This will show all webhooks
					searchingFor: webhookUrl,
					timestamp: new Date().toISOString(),
				},
			});
		}

		const webhookId = webhook.id;
		console.log("Found webhook ID:", webhookId);

		// Add this before the match query to debug
		const { data: allMatches, error: allMatchesError } = await supabase
			.from("temp_matches")
			.select("*");
		console.log("All matches:", allMatches);

		// 2. Find the match associated with this webhook
		const matchQuery = supabase
			.from("temp_matches")
			.select("id, player1_webhook_id, player2_webhook_id")
			.or(
				`player1_webhook_id.eq.${webhookId},player2_webhook_id.eq.${webhookId}`
			);

		// Debug the match query
		console.log("Match query:", matchQuery.toString());
		const { data: match, error: matchError } = await matchQuery.single();

		if (matchError || !match) {
			console.error("Match error:", matchError);
			// Enhanced error response
			return res.status(404).json({
				message: "Match not found",
				debugInfo: {
					webhookId,
					searchQuery: matchQuery.toString(),
					error: matchError,
					timestamp: new Date().toISOString(),
				},
			});
		}

		const matchId = match.id;
		const isPlayer1 = match.player1_webhook_id === webhookId;

		// 3. Get the latest incomplete set for this match
		const { data: latestSet, error: setError } = await supabase
			.from("temp_match_sets")
			.select("id, player1_score, player2_score")
			.eq("temp_match_id", matchId)
			.eq("is_complete", false)
			.order("set_number", { ascending: false })
			.limit(1)
			.single();

		if (setError || !latestSet) {
			console.error("Set error:", setError);
			return res.status(404).json({ message: "No active set found" });
		}

		const setId = latestSet.id;
		const newScore = isPlayer1
			? { player1_score: latestSet.player1_score + 1 }
			: { player2_score: latestSet.player2_score + 1 };

		// 4. Update the score
		const { error: updateError } = await supabase
			.from("temp_match_sets")
			.update(newScore)
			.eq("id", setId);

		if (updateError) {
			console.error("Update error:", updateError);
			throw updateError;
		}

		console.log(
			`Score updated successfully for match ${matchId}, set ${setId}`
		);
		return res.status(200).json({
			message: "Score updated successfully!",
			data: {
				matchId,
				setId,
				isPlayer1,
				newScore,
			},
		});
	} catch (error) {
		console.error("Webhook handler error:", error);
		return res.status(500).json({
			message: "An error occurred",
			error: error.message,
		});
	}
}
