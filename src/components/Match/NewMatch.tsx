import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../../store/authStore';
import { createMatch } from '../../lib/matches';
import { getAllUsers } from '../../lib/supabase';
import { Set, User } from '../../types';
import { SetInput } from './SetInput';
import { Plus } from 'lucide-react';
import toast from 'react-hot-toast';

interface NewMatchProps {
  onMatchCreated: (match: any) => void;
}

export function NewMatch({ onMatchCreated }: NewMatchProps) {
  const [opponent, setOpponent] = useState('');
  const [sets, setSets] = useState<Set[]>([{ player1Score: 0, player2Score: 0 }]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const user = useAuthStore((state) => state.user);

  useEffect(() => {
    async function fetchUsers() {
      if (!user) return;
      try {
        const allUsers = await getAllUsers();
        const opponents = allUsers.filter(u => u.id !== user.id);
        setUsers(opponents);
      } catch (error) {
        console.error('Error loading opponents:', error);
        toast.error('Failed to load opponents');
      } finally {
        setLoading(false);
      }
    }
    
    fetchUsers();
  }, [user]);

  const selectedOpponent = users.find(u => u.id === opponent);

  const handleSetChange = (index: number, updatedSet: Set) => {
    const newSets = [...sets];
    newSets[index] = updatedSet;
    setSets(newSets);
  };

  const addSet = () => {
    setSets([...sets, { player1Score: 0, player2Score: 0 }]);
  };

  const removeSet = (index: number) => {
    if (sets.length > 1) {
      const newSets = sets.filter((_, i) => i !== index);
      setSets(newSets);
    }
  };

  const calculateTotalScore = () => {
    return sets.reduce(
      (acc, set) => {
        if (set.player1Score > set.player2Score) acc.player1++;
        else if (set.player2Score > set.player1Score) acc.player2++;
        return acc;
      },
      { player1: 0, player2: 0 }
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const totalScore = calculateTotalScore();

    try {
      const newMatch = await createMatch(user.id, opponent, totalScore.player1, totalScore.player2, sets);
      onMatchCreated(newMatch);
      toast.success('Match submitted for confirmation');
      
      setOpponent('');
      setSets([{ player1Score: 0, player2Score: 0 }]);
    } catch (error) {
      console.error('Error submitting match:', error);
      toast.error('Failed to submit match');
    }
  };

  if (!user) {
    return (
      <div className="text-center text-gray-600 dark:text-gray-400">
        Please log in to create matches
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="text-gray-600 dark:text-gray-400">Loading opponents...</div>
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div className="text-center text-gray-600 dark:text-gray-400">
        No other players are available at the moment
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Opponent</label>
        <select
          value={opponent}
          onChange={(e) => setOpponent(e.target.value)}
          className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
          required
        >
          <option value="">Select opponent</option>
          {users.map(user => (
            <option key={user.id} value={user.id}>
              {user.full_name}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-2 pl-[72px] pr-[28px]">
          <div className="text-sm font-medium text-gray-500 dark:text-gray-400 text-center">Your Score</div>
          <div className="text-sm font-medium text-gray-500 dark:text-gray-400 text-center">
            {selectedOpponent ? `${selectedOpponent.full_name}'s Score` : 'Opponent Score'}
          </div>
        </div>
        
        {sets.map((set, index) => (
          <SetInput
            key={index}
            index={index}
            set={set}
            onChange={handleSetChange}
            onRemove={removeSet}
            opponentName={selectedOpponent?.full_name || 'Opponent'}
            showRemoveButton={sets.length > 1}
          />
        ))}

        <button
          type="button"
          onClick={addSet}
          className="flex items-center space-x-1 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
        >
          <Plus className="h-4 w-4" />
          <span>Add Set</span>
        </button>
      </div>

      <button
        type="submit"
        disabled={!opponent}
        className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Submit Match
      </button>
    </form>
  );
}