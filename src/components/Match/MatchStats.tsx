import React from 'react';
import { Match } from '../../types';
import { Trophy, Target, Minus } from 'lucide-react';
import { PlayerRankings } from './PlayerRankings';

interface MatchStatsProps {
  matches: Match[];
  userId: string;
}

export function MatchStats({ matches, userId }: MatchStatsProps) {
  const confirmedMatches = matches.filter(match => match.status === 'confirmed');
  
  const stats = confirmedMatches.reduce((acc, match) => {
    const isPlayer1 = match.player1_id === userId;
    const userScore = isPlayer1 ? match.player1_score : match.player2_score;
    const opponentScore = isPlayer1 ? match.player2_score : match.player1_score;
    
    if (userScore > opponentScore) acc.wins++;
    else if (userScore < opponentScore) acc.losses++;
    else acc.draws++;
    
    acc.totalGames++;
    acc.setsWon += userScore;
    acc.setsLost += opponentScore;

    // Calculate total points
    if (match.sets) {
      match.sets.forEach(set => {
        if (isPlayer1) {
          acc.pointsWon += set.player1Score;
          acc.pointsLost += set.player2Score;
        } else {
          acc.pointsWon += set.player2Score;
          acc.pointsLost += set.player1Score;
        }
      });
    }
    
    return acc;
  }, {
    wins: 0,
    losses: 0,
    draws: 0,
    totalGames: 0,
    setsWon: 0,
    setsLost: 0,
    pointsWon: 0,
    pointsLost: 0
  });

  const winRate = stats.totalGames > 0 
    ? ((stats.wins / stats.totalGames) * 100).toFixed(1) 
    : '0';

  const avgPointsPerMatch = stats.totalGames > 0
    ? (stats.pointsWon / stats.totalGames).toFixed(1)
    : '0';

  const avgPointsLostPerMatch = stats.totalGames > 0
    ? (stats.pointsLost / stats.totalGames).toFixed(1)
    : '0';

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-3 bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Win Rate</p>
              <p className="text-2xl font-bold text-gray-900">{winRate}%</p>
            </div>
            <Trophy className="h-8 w-8 text-blue-500" />
          </div>
          <div className="mt-4 grid grid-cols-3 gap-2 text-center">
            <div className="bg-green-50 rounded-md p-2">
              <p className="text-xs text-green-600">Wins</p>
              <p className="text-lg font-semibold text-green-700">{stats.wins}</p>
            </div>
            <div className="bg-orange-50 rounded-md p-2">
              <p className="text-xs text-orange-600">Draws</p>
              <p className="text-lg font-semibold text-orange-700">{stats.draws}</p>
            </div>
            <div className="bg-red-50 rounded-md p-2">
              <p className="text-xs text-red-600">Losses</p>
              <p className="text-lg font-semibold text-red-700">{stats.losses}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Sets Won</p>
              <p className="text-2xl font-bold text-gray-900">{stats.setsWon}</p>
            </div>
            <Target className="h-8 w-8 text-green-500" />
          </div>
          <div className="mt-4">
            <div className="bg-gray-50 rounded-md p-3">
              <p className="text-xs text-gray-600">Average per Match</p>
              <p className="text-lg font-semibold text-gray-700">
                {stats.totalGames > 0 ? (stats.setsWon / stats.totalGames).toFixed(1) : '0'}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Sets Lost</p>
              <p className="text-2xl font-bold text-gray-900">{stats.setsLost}</p>
            </div>
            <Minus className="h-8 w-8 text-red-500" />
          </div>
          <div className="mt-4">
            <div className="bg-gray-50 rounded-md p-3">
              <p className="text-xs text-gray-600">Average per Match</p>
              <p className="text-lg font-semibold text-gray-700">
                {stats.totalGames > 0 ? (stats.setsLost / stats.totalGames).toFixed(1) : '0'}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Points</p>
              <p className="text-2xl font-bold text-gray-900">{stats.pointsWon}</p>
            </div>
            <Target className="h-8 w-8 text-purple-500" />
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2">
            <div className="bg-gray-50 rounded-md p-2">
              <p className="text-xs text-gray-600">Won</p>
              <div className="space-y-1">
                <p className="text-lg font-semibold text-gray-700">{stats.pointsWon}</p>
                <p className="text-xs text-gray-500">Avg: {avgPointsPerMatch}/match</p>
              </div>
            </div>
            <div className="bg-gray-50 rounded-md p-2">
              <p className="text-xs text-gray-600">Lost</p>
              <div className="space-y-1">
                <p className="text-lg font-semibold text-gray-700">{stats.pointsLost}</p>
                <p className="text-xs text-gray-500">Avg: {avgPointsLostPerMatch}/match</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-xl font-semibold mb-6">Player Rankings</h3>
        <PlayerRankings 
          matches={matches} 
          currentUserId={userId}
        />
      </div>
    </div>
  );
}