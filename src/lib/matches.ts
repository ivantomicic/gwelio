import { Match, TempMatch } from "../types";
import { supabase } from "./supabase";
import { checkSetComplete } from "./scoring";

export async function createTempMatch(
	player1Id: string,
	player2Id: string,
	player1WebhookId: string | null,
	player2WebhookId: string | null
): Promise<TempMatch> {
	const { data: match, error } = await supabase
		.from("temp_matches")
		.insert({
			player1_id: player1Id,
			player2_id: player2Id,
			player1_webhook_id: player1WebhookId,
			player2_webhook_id: player2WebhookId,
			current_set: 1,
		})
		.select()
		.single();

	if (error) {
		console.error("Error creating temp match:", error);
		throw error;
	}

	// Create initial set
	const { error: setError } = await supabase.from("temp_match_sets").insert({
		temp_match_id: match.id,
		set_number: 1,
		player1_score: 0,
		player2_score: 0,
	});

	if (setError) {
		console.error("Error creating initial set:", setError);
		throw setError;
	}

	return match;
}

export async function updateTempMatchSet(
	matchId: string,
	setNumber: number,
	player1Score: number,
	player2Score: number,
	isComplete: boolean = false
): Promise<void> {
	const { error } = await supabase.from("temp_match_sets").upsert(
		{
			temp_match_id: matchId,
			set_number: setNumber,
			player1_score: player1Score,
			player2_score: player2Score,
			is_complete: isComplete,
		},
		{
			onConflict: "temp_match_id,set_number",
		}
	);

	if (error) {
		console.error("Error updating match set:", error);
		throw error;
	}
}

export async function getMatches(userId: string): Promise<Match[]> {
	const { data: matches, error: matchesError } = await supabase
		.from("matches")
		.select(
			`
      *,
      player1:player1_id(full_name),
      player2:player2_id(full_name)
    `
		)
		.or(`player1_id.eq.${userId},player2_id.eq.${userId}`)
		.order("created_at", { ascending: false });

	if (matchesError) {
		console.error("Error fetching matches:", matchesError);
		throw matchesError;
	}

	const matchIds = matches.map((m) => m.id);
	const { data: sets, error: setsError } = await supabase
		.from("match_sets")
		.select("*")
		.in("match_id", matchIds)
		.order("set_number", { ascending: true });

	if (setsError) {
		console.error("Error fetching match sets:", setsError);
		throw setsError;
	}

	return matches.map((match) => ({
		...match,
		sets: sets
			.filter((set) => set.match_id === match.id)
			.map((set) => ({
				player1Score: set.player1_score,
				player2Score: set.player2_score,
			})),
	}));
}

export async function updateMatchStatus(
	matchId: string,
	status: "confirmed" | "rejected"
): Promise<Match> {
	const { data: match, error } = await supabase
		.from("matches")
		.update({ status })
		.eq("id", matchId)
		.select()
		.single();

	if (error) {
		console.error("Error updating match status:", error);
		throw error;
	}

	return match;
}

export async function deleteMatch(matchId: string): Promise<void> {
	const { error } = await supabase.from("matches").delete().eq("id", matchId);

	if (error) {
		console.error("Error deleting match:", error);
		throw error;
	}
}

export async function createMatch(
	player1Id: string,
	player2Id: string,
	player1Score: number,
	player2Score: number,
	sets: Array<{ player1Score: number; player2Score: number }>
) {
	try {
		// First create the match
		const { data: match, error: matchError } = await supabase
			.from("matches")
			.insert([
				{
					player1_id: player1Id,
					player2_id: player2Id,
					player1_score: player1Score,
					player2_score: player2Score,
					status: "pending", // Match needs to be confirmed by opponent
				},
			])
			.select()
			.single();

		if (matchError) throw matchError;

		// Then create the sets
		const setsToInsert = sets.map((set, index) => ({
			match_id: match.id,
			set_number: index + 1,
			player1_score: set.player1Score,
			player2_score: set.player2Score,
		}));

		const { error: setsError } = await supabase
			.from("match_sets")
			.insert(setsToInsert);

		if (setsError) throw setsError;

		// Return the match with sets
		return {
			...match,
			sets: sets,
		};
	} catch (error) {
		console.error("Error creating match:", error);
		throw error;
	}
}

export async function deleteTempMatch(matchId: string) {
	const { error } = await supabase
		.from("temp_match_sets")
		.delete()
		.eq("temp_match_id", matchId);

	if (error) {
		console.error("Error deleting temp match sets:", error);
		throw error;
	}

	const { error: matchError } = await supabase
		.from("temp_matches")
		.delete()
		.eq("id", matchId);

	if (matchError) {
		console.error("Error deleting temp match:", matchError);
		throw matchError;
	}
}

export async function getTempMatchSets(matchId: string) {
	const { data, error } = await supabase
		.from("temp_match_sets")
		.select("*")
		.eq("temp_match_id", matchId)
		.order("set_number", { ascending: true });

	if (error) {
		console.error("Error fetching temp match sets:", error);
		throw error;
	}

	// Temporarily determine completion based on scores
	const processedData = data.map((set) => ({
		...set,
		is_complete: checkSetComplete(set.player1_score, set.player2_score)
			.isComplete,
	}));

	return processedData;
}

export async function getTempMatch(matchId: string): Promise<TempMatch | null> {
	const { data, error } = await supabase
		.from("temp_matches")
		.select("*")
		.eq("id", matchId)
		.single();

	if (error) {
		if (error.code === "PGRST116") {
			// No rows returned
			return null;
		}
		console.error("Error fetching temp match:", error);
		throw error;
	}

	return data;
}
