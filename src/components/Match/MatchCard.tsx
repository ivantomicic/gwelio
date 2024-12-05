import React from 'react';
import { Match, User } from '../../types';
import { Check, X, AlertTriangle, ChevronDown, ChevronUp } from 'lucide-react';

interface MatchCardProps {
  match: Match;
  expanded: boolean;
  currentUser: User | null;
  onToggleExpand: () => void;
  onConfirm?: () => void;
  onReject?: () => void;
  getPlayerName: (id: string) => string;
}

export function MatchCard({
  match,
  expanded,
  currentUser,
  onToggleExpand,
  onConfirm,
  onReject,
  getPlayerName
}: MatchCardProps) {
  const isPlayer1 = currentUser?.id === match.player1_id;
  const userScore = isPlayer1 ? match.player1_score : match.player2_score;
  const opponentScore = isPlayer1 ? match.player2_score : match.player1_score;
  
  const result = userScore > opponentScore ? 'win' : userScore < opponentScore ? 'loss' : 'draw';
  const borderColorClass = result === 'win' 
    ? 'border-l-4 border-l-green-500 dark:border-l-green-500' 
    : result === 'loss'
    ? 'border-l-4 border-l-red-500 dark:border-l-red-500'
    : 'border-l-4 border-l-orange-500 dark:border-l-orange-500';

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 ${borderColorClass}`}>
      <div className="p-3 md:p-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
          <div className="space-y-1">
            <div className="font-medium text-sm md:text-base text-gray-900 dark:text-gray-100">
              {getPlayerName(match.player1_id)} vs {getPlayerName(match.player2_id)}
            </div>
            <div className="flex items-center">
              <span className="text-base md:text-lg font-semibold text-gray-900 dark:text-white">
                {match.player1_score} - {match.player2_score}
              </span>
              <button
                onClick={onToggleExpand}
                className="ml-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
              >
                {expanded ? (
                  <ChevronUp className="h-4 w-4 md:h-5 md:w-5" />
                ) : (
                  <ChevronDown className="h-4 w-4 md:h-5 md:w-5" />
                )}
              </button>
              <span className="ml-2 text-xs md:text-sm text-gray-500 dark:text-gray-400">
                {new Date(match.created_at).toLocaleDateString()}
              </span>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {match.status === 'pending' && match.player2_id === currentUser?.id && (
              <>
                <button
                  onClick={onConfirm}
                  className="p-1.5 md:p-2 text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-full transition-colors"
                >
                  <Check size={16} className="md:w-5 md:h-5" />
                </button>
                <button
                  onClick={onReject}
                  className="p-1.5 md:p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-colors"
                >
                  <X size={16} className="md:w-5 md:h-5" />
                </button>
              </>
            )}
            
            <MatchStatus status={match.status} />
          </div>
        </div>
      </div>
      
      {expanded && match.sets && (
        <div className="border-t border-gray-100 dark:border-gray-700 p-3 md:p-4 bg-gray-50 dark:bg-gray-800/50 rounded-b-lg">
          <div className="space-y-2">
            {match.sets.map((set, index) => (
              <div key={index} className="flex items-center space-x-4">
                <span className="text-xs md:text-sm text-gray-500 dark:text-gray-400 w-12 md:w-16">Set {index + 1}</span>
                <div className="text-xs md:text-sm font-medium text-gray-900 dark:text-gray-100">
                  {set.player1Score} - {set.player2Score}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function MatchStatus({ status }: { status: Match['status'] }) {
  switch (status) {
    case 'pending':
      return (
        <span className="flex items-center text-yellow-600 dark:text-yellow-400 text-xs md:text-sm">
          <AlertTriangle size={14} className="mr-1" />
          Pending
        </span>
      );
    case 'confirmed':
      return (
        <span className="flex items-center text-green-600 dark:text-green-400 text-xs md:text-sm">
          <Check size={14} className="mr-1" />
          Confirmed
        </span>
      );
    case 'rejected':
      return (
        <span className="flex items-center text-red-600 dark:text-red-400 text-xs md:text-sm">
          <X size={14} className="mr-1" />
          Rejected
        </span>
      );
  }
}