import { NextResponse } from "next/server";

export async function POST(request: Request) {
	try {
		const payload = await request.json();

		// Add your score update logic here
		// Example:
		if (payload.playerId && payload.scoreChange) {
			// Update player score in database
			const { error } = await supabase
				.from("players")
				.update({
					score: supabase.rpc("increment_score", {
						amount: payload.scoreChange,
					}),
				})
				.eq("id", payload.playerId);

			if (error) throw error;
		}

		return NextResponse.json({ success: true });
	} catch (error) {
		console.error("Webhook processing error:", error);
		return NextResponse.json(
			{ error: "Failed to process webhook" },
			{ status: 500 }
		);
	}
}
