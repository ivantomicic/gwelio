import { Match, Set } from '../types';
import { supabase } from './supabase';

export const createMatch = async (
  player1Id: string,
  player2Id: string,
  player1Score: number,
  player2Score: number,
  sets: Set[]
): Promise<Match> => {
  // First insert the match
  const { data: match, error: matchError } = await supabase
    .from('matches')
    .insert({
      player1_id: player1Id,
      player2_id: player2Id,
      player1_score: player1Score,
      player2_score: player2Score,
      status: 'pending'
    })
    .select()
    .single();

  if (matchError) {
    console.error('Error creating match:', matchError);
    throw matchError;
  }

  // Then insert all sets
  const setsToInsert = sets.map((set, index) => ({
    match_id: match.id,
    player1_score: set.player1Score,
    player2_score: set.player2Score,
    set_number: index + 1
  }));

  const { error: setsError } = await supabase
    .from('match_sets')
    .insert(setsToInsert);

  if (setsError) {
    console.error('Error creating match sets:', setsError);
    throw setsError;
  }

  return {
    ...match,
    sets: sets
  };
};

export const getMatches = async (userId: string): Promise<Match[]> => {
  // First get all matches
  const { data: matches, error: matchesError } = await supabase
    .from('matches')
    .select(`
      *,
      player1:player1_id(full_name),
      player2:player2_id(full_name)
    `)
    .or(`player1_id.eq.${userId},player2_id.eq.${userId}`)
    .order('created_at', { ascending: false });

  if (matchesError) {
    console.error('Error fetching matches:', matchesError);
    throw matchesError;
  }

  // Then get all sets for these matches
  const matchIds = matches.map(m => m.id);
  const { data: sets, error: setsError } = await supabase
    .from('match_sets')
    .select('*')
    .in('match_id', matchIds)
    .order('set_number', { ascending: true });

  if (setsError) {
    console.error('Error fetching match sets:', setsError);
    throw setsError;
  }

  // Combine matches with their sets
  return matches.map(match => ({
    ...match,
    sets: sets
      .filter(set => set.match_id === match.id)
      .map(set => ({
        player1Score: set.player1_score,
        player2Score: set.player2_score
      }))
  }));
};

export const updateMatchStatus = async (
  matchId: string,
  status: 'confirmed' | 'rejected'
): Promise<Match> => {
  const { data: match, error } = await supabase
    .from('matches')
    .update({ status })
    .eq('id', matchId)
    .select()
    .single();

  if (error) {
    console.error('Error updating match status:', error);
    throw error;
  }

  return match;
};

export const deleteMatch = async (matchId: string): Promise<void> => {
  const { error } = await supabase
    .from('matches')
    .delete()
    .eq('id', matchId);

  if (error) {
    console.error('Error deleting match:', error);
    throw error;
  }
};