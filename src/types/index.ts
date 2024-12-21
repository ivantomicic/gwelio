// Add to your existing types/index.ts
export interface Webhook {
	id: string;
	url: string;
	name: string;
	created_at: string;
}

// Add to your existing Match interface
export interface TempMatch {
	id: string;
	player1_id: string;
	player2_id: string;
	player1_webhook_id: string | null;
	player2_webhook_id: string | null;
	current_set: number;
	created_at: string;
	expires_at: string;
}

export interface MatchSet {
	player1Score: number;
	player2Score: number;
}

export interface Match {
	id: string;
	player1_id: string;
	player2_id: string;
	player1_score: number;
	player2_score: number;
	status: "pending" | "confirmed" | "rejected";
	created_at: string;
	sets: MatchSet[];
	player1?: {
		full_name: string;
	};
	player2?: {
		full_name: string;
	};
}

export interface User {
	id: string;
	full_name: string;
	email?: string;
}
