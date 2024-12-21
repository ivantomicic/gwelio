import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
	"https://pulwkoymwvvdwmrhkcpa.supabase.co",
	"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB1bHdrb3ltd3Z2ZHdtcmhrY3BhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzMzOTk3MTksImV4cCI6MjA0ODk3NTcxOX0.ScJKBIiUmj8geWvI0ZDp_hJ3bgozvQ1Q_tn-9aNKQUk"
);

export default async function handler(req, res) {
	const { webhookName } = req.query;

	if (req.method !== "POST") {
		return res.status(405).json({ message: "Only POST requests allowed" });
	}

	try {
		// 1. Find the corresponding webhook
		const { data: webhook, error: webhookError } = await supabase
			.from("webhooks")
			.select("id")
			.eq(
				"url",
				`https://gweilo.vercel.app/api/webhook?webhookName=${webhookName}`
			)
			.single();

		if (webhookError || !webhook) {
			console.error("Webhook error:", webhookError);
			return res.status(404).json({ message: "Webhook not found" });
		}

		const webhookId = webhook.id;

		// 2. Find the match associated with this webhook
		const { data: match, error: matchError } = await supabase
			.from("temp_matches")
			.select("id, player1_webhook_id, player2_webhook_id")
			.or(
				`player1_webhook_id.eq.${webhookId},player2_webhook_id.eq.${webhookId}`
			)
			.single();

		if (matchError || !match) {
			console.error("Match error:", matchError);
			return res.status(404).json({ message: "Match not found" });
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
