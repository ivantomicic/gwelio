export interface SetResult {
	isComplete: boolean;
	winner: "player1" | "player2" | null;
}

export function checkSetComplete(
	player1Score: number,
	player2Score: number
): SetResult {
	const WINNING_SCORE = 11;
	const MIN_DIFFERENCE = 2;

	// A set is won when a player:
	// 1. Has at least WINNING_SCORE points (11)
	// 2. Has at least MIN_DIFFERENCE more points than their opponent (2)
	if (
		(player1Score >= WINNING_SCORE || player2Score >= WINNING_SCORE) &&
		Math.abs(player1Score - player2Score) >= MIN_DIFFERENCE
	) {
		return {
			isComplete: true,
			winner: player1Score > player2Score ? "player1" : "player2",
		};
	}

	return {
		isComplete: false,
		winner: null,
	};
}
