import React, { useState, useEffect } from 'react';
import { NewMatch } from '../Match/NewMatch';
import { MatchList } from '../Match/MatchList';
import { MatchStats } from '../Match/MatchStats';
import { useAuthStore } from '../../store/authStore';
import { getMatches } from '../../lib/matches';
import { Match } from '../../types';
import { Toaster } from 'react-hot-toast';
import { DashboardSection } from './DashboardSection';
import { useTheme } from '../../lib/theme';

export function DashboardLayout() {
  const user = useAuthStore((state) => state.user);
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  useTheme();

  const fetchMatches = async () => {
    if (!user) return;
    try {
      const userMatches = await getMatches(user.id);
      setMatches(userMatches);
    } catch (error) {
      console.error('Greška pri učitavanju mečeva:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMatches();
  }, [user]);

  const handleMatchCreated = (newMatch: Match) => {
    setMatches(prevMatches => [newMatch, ...prevMatches]);
  };

  const handleMatchUpdated = (updatedMatch: Match) => {
    setMatches(prevMatches => 
      prevMatches.map(match => 
        match.id === updatedMatch.id ? updatedMatch : match
      )
    );
  };

  return (
    <div className="space-y-6 md:space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 lg:gap-8">
        <DashboardSection title="Novi Meč">
          <NewMatch onMatchCreated={handleMatchCreated} />
        </DashboardSection>

        <DashboardSection title="Poslednji Mečevi">
          <MatchList 
            matches={matches} 
            onMatchUpdated={handleMatchUpdated}
          />
        </DashboardSection>
      </div>

      <DashboardSection title="Statistika">
        {loading ? (
          <p className="text-gray-600 dark:text-gray-400">Učitavanje statistike...</p>
        ) : user && matches ? (
          <MatchStats matches={matches} userId={user.id} />
        ) : null}
      </DashboardSection>
      <Toaster position="top-right" />
    </div>
  );
}