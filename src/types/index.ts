export interface User {
  id: string;
  email: string;
  full_name: string;
  is_admin: boolean;
  created_at: string;
}

export interface Set {
  player1Score: number;
  player2Score: number;
}

export interface Match {
  id: string;
  player1_id: string;
  player2_id: string;
  player1_score: number;
  player2_score: number;
  sets: Set[];
  status: 'pending' | 'confirmed' | 'rejected';
  created_at: string;
  updated_at: string;
}

export interface Profile {
  id: string;
  user_id: string;
  wins: number;
  losses: number;
  rating: number;
}