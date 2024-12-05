import React, { useState, useEffect } from 'react';
import { Match, User } from '../../types';
import { useAuthStore } from '../../store/authStore';
import { Filter, ChevronLeft, ChevronRight } from 'lucide-react';
import { updateMatchStatus } from '../../lib/matches';
import { getAllUsers } from '../../lib/supabase';
import { MatchCard } from './MatchCard';
import toast from 'react-hot-toast';

interface MatchListProps {
  matches: Match[];
  onMatchUpdated: (match: Match) => void;
}

const MATCHES_PER_PAGE = 3;

export function MatchList({ matches, onMatchUpdated }: MatchListProps) {
  const [selectedPlayer, setSelectedPlayer] = useState<string>('');
  const [expandedMatch, setExpandedMatch] = useState<string | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [filteredMatches, setFilteredMatches] = useState<Match[]>(matches);
  const [currentPage, setCurrentPage] = useState(1);
  const user = useAuthStore((state) => state.user);

  useEffect(() => {
    async function fetchUsers() {
      try {
        const allUsers = await getAllUsers();
        setUsers(allUsers);
      } catch (error) {
        console.error('Error fetching users:', error);
        toast.error('Failed to load users');
      } finally {
        setLoading(false);
      }
    }
    fetchUsers();
  }, []);

  useEffect(() => {
    if (!selectedPlayer) {
      setFilteredMatches(matches);
    } else {
      setFilteredMatches(matches.filter(match => 
        match.player1_id === selectedPlayer || match.player2_id === selectedPlayer
      ));
    }
    setCurrentPage(1);
  }, [selectedPlayer, matches]);

  const handleMatchAction = async (matchId: string, action: 'confirmed' | 'rejected') => {
    try {
      const updatedMatch = await updateMatchStatus(matchId, action);
      if (updatedMatch) {
        onMatchUpdated(updatedMatch);
        toast.success(`Match ${action} successfully`);
      }
    } catch (error) {
      toast.error('Failed to update match status');
    }
  };

  const getPlayerName = (playerId: string) => {
    const player = users.find(u => u.id === playerId);
    return player?.full_name || 'Unknown Player';
  };

  const getPlayedAgainstUsers = () => {
    if (!user || !matches) return [];
    const uniquePlayerIds = new Set<string>();
    matches.forEach(match => {
      if (match.player1_id !== user.id) uniquePlayerIds.add(match.player1_id);
      if (match.player2_id !== user.id) uniquePlayerIds.add(match.player2_id);
    });
    return users.filter(u => uniquePlayerIds.has(u.id));
  };

  const totalPages = Math.ceil(filteredMatches.length / MATCHES_PER_PAGE);
  const startIndex = (currentPage - 1) * MATCHES_PER_PAGE;
  const paginatedMatches = filteredMatches.slice(startIndex, startIndex + MATCHES_PER_PAGE);

  const goToPage = (page: number) => {
    setCurrentPage(page);
    setExpandedMatch(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-4">
        <p className="text-gray-600 dark:text-gray-400">Loading matches...</p>
      </div>
    );
  }

  const playedAgainstUsers = getPlayedAgainstUsers();

  return (
    <div>
      {playedAgainstUsers.length > 1 && (
        <div className="flex items-center space-x-2 mb-4">
          <Filter className="h-4 w-4 md:h-5 md:w-5 text-gray-500 dark:text-gray-400" />
          <select
            value={selectedPlayer}
            onChange={(e) => setSelectedPlayer(e.target.value)}
            className="text-sm border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-md px-2 py-1"
          >
            <option value="">All Players</option>
            {playedAgainstUsers.map(player => (
              <option key={player.id} value={player.id}>
                {player.full_name}
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="space-y-3">
        {paginatedMatches.length === 0 ? (
          <p className="text-center text-gray-600 dark:text-gray-400">No matches found</p>
        ) : (
          <>
            {paginatedMatches.map((match) => (
              <MatchCard
                key={match.id}
                match={match}
                expanded={expandedMatch === match.id}
                currentUser={user}
                onToggleExpand={() => setExpandedMatch(
                  expandedMatch === match.id ? null : match.id
                )}
                onConfirm={() => handleMatchAction(match.id, 'confirmed')}
                onReject={() => handleMatchAction(match.id, 'rejected')}
                getPlayerName={getPlayerName}
              />
            ))}

            {totalPages > 1 && (
              <div className="flex items-center justify-center space-x-2 mt-4 pt-2 border-t border-gray-100 dark:border-gray-700">
                <button
                  onClick={() => goToPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="p-1 rounded-md text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Page {currentPage} of {totalPages}
                </span>

                <button
                  onClick={() => goToPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="p-1 rounded-md text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}