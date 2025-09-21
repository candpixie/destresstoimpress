import { useState } from 'react';

export const useGameStats = () => {
  const [gamesPlayed, setGamesPlayed] = useState(0);
  const [currentStreak, setCurrentStreak] = useState(0);

  const incrementGamePlayed = () => {
    setGamesPlayed(prev => prev + 1);
    setCurrentStreak(prev => prev + 1);
  };

  const resetStreak = () => {
    setCurrentStreak(0);
  };

  return {
    gamesPlayed,
    currentStreak,
    incrementGamePlayed,
    resetStreak
  };
};