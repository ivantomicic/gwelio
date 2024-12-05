import React, { useState, useEffect } from 'react';
import { Match, User } from '../../types';
import { Trophy, Target } from 'lucide-react';
import { getAllUsers } from '../../lib/supabase';

interface PlayerStats {
  id: string;
  name: string;
  wins: number;
  totalPoints: number;
  matches: number;
}

interface PlayerRankingsProps {
  matches: Match[];
  currentUserId: string;
}

export function PlayerRankings({ matches, currentUserId }: PlayerRankingsProps) {
  const [playerNames, setPlayerNames] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(true);
  const confirmedMatches = matches.filter(match => match.status === 'confirmed');

  useEffect(() => {
    async function loadPlayerNames() {
      try {
        const users = await getAllUsers();
        const namesMap = users.reduce((acc, user) => {
          acc[user.id] = user.full_name;
          return acc;
        }, {} as { [key: string]: string });
        setPlayerNames(namesMap);
      } catch (error) {
        console.error('Error loading player names:', error);
      } finally {
        setLoading(false);
      }
    }
    loadPlayerNames();
  }, []);

  const playerStats = confirmedMatches.reduce((acc: { [key: string]: PlayerStats }, match) => {
    // Initialize both players if they don't exist
    [match.player1_id, match.player2_id].forEach(playerId => {
      if (!acc[playerId]) {
        acc[playerId] = {
          id: playerId,
          name: playerNames[playerId] || 'Loading...',
          wins: 0,
          totalPoints: 0,
          matches: 0
        };
      }
    });

    // Update match count for both players
    acc[match.player1_id].matches++;
    acc[match.player2_id].matches++;

    // Update wins
    if (match.player1_score > match.player2_score) {
      acc[match.player1_id].wins++;
    } else if (match.player2_score > match.player1_score) {
      acc[match.player2_id].wins++;
    }

    // Calculate points from sets
    if (match.sets) {
      match.sets.forEach(set => {
        acc[match.player1_id].totalPoints += set.player1Score;
        acc[match.player2_id].totalPoints += set.player2Score;
      });
    }

    return acc;
  }, {});

  const playerStatsArray = Object.values(playerStats).map(stats => ({
    ...stats,
    name: playerNames[stats.id] || 'Loading...'
  }));

  const topWinners = [...playerStatsArray]
    .sort((a, b) => {
      const aWinRate = a.matches > 0 ? (a.wins / a.matches) : 0;
      const bWinRate = b.matches > 0 ? (b.wins / b.matches) : 0;
      return bWinRate - aWinRate || b.wins - a.wins;
    })
    .slice(0, 5);

  const topScorers = [...playerStatsArray]
    .sort((a, b) => {
      const aAvgPoints = a.matches > 0 ? (a.totalPoints / a.matches) : 0;
      const bAvgPoints = b.matches > 0 ? (b.totalPoints / b.matches) : 0;
      return bAvgPoints - aAvgPoints || b.totalPoints - a.totalPoints;
    })
    .slice(0, 5);

  if (loading) {
    return <div className="text-gray-600">Loading rankings...</div>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div>
        <div className="flex items-center space-x-2 mb-4">
          <Trophy className="h-5 w-5 text-yellow-500" />
          <h3 className="text-lg font-semibold">Top Winners</h3>
        </div>
        <div className="space-y-3">
          {topWinners.length === 0 ? (
            <p className="text-gray-500">No matches played yet</p>
          ) : (
            topWinners.map((player, index) => (
              <div 
                key={player.id}
                className={`flex items-center justify-between p-3 rounded-lg ${
                  player.id === currentUserId ? 'bg-blue-50 border border-blue-100' : 'bg-gray-50'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <span className="text-lg font-bold text-gray-400">#{index + 1}</span>
                  <div>
                    <p className="font-medium">{player.name}</p>
                    <p className="text-sm text-gray-500">
                      Win rate: {((player.wins / player.matches) * 100).toFixed(1)}%
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold">{player.wins} wins</p>
                  <p className="text-sm text-gray-500">{player.matches} matches</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div>
        <div className="flex items-center space-x-2 mb-4">
          <Target className="h-5 w-5 text-blue-500" />
          <h3 className="text-lg font-semibold">Top Scorers</h3>
        </div>
        <div className="space-y-3">
          {topScorers.length === 0 ? (
            <p className="text-gray-500">No matches played yet</p>
          ) : (
            topScorers.map((player, index) => (
              <div 
                key={player.id}
                className={`flex items-center justify-between p-3 rounded-lg ${
                  player.id === currentUserId ? 'bg-blue-50 border border-blue-100' : 'bg-gray-50'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <span className="text-lg font-bold text-gray-400">#{index + 1}</span>
                  <div>
                    <p className="font-medium">{player.name}</p>
                    <p className="text-sm text-gray-500">
                      {(player.totalPoints / player.matches).toFixed(1)} pts/match
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold">{player.totalPoints} points</p>
                  <p className="text-sm text-gray-500">{player.matches} matches</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}