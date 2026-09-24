import { useState } from 'react';
import type { ContestPrize } from '@/lib/api/contests';

export function useContestPrizesState() {
  const [prizes, setPrizes] = useState<ContestPrize[]>([
    { rank: 1, title: '1st Place Trophy & Certificate', rewardType: 'trophy', value: 'Winner' },
    { rank: 2, title: 'Runner-up Certificate', rewardType: 'certificate', value: '2nd Place' },
    { rank: 3, title: '3rd Place Certificate', rewardType: 'certificate', value: '3rd Place' },
  ]);

  const handleAddPrize = () => {
    const nextRank = prizes.length + 1;
    setPrizes((prev) => [...prev, { rank: nextRank, title: `Rank #${nextRank} Reward`, rewardType: 'certificate' }]);
  };

  const handleUpdatePrize = (index: number, field: keyof ContestPrize, value: unknown) => {
    setPrizes((prev) => prev.map((p, idx) => (idx === index ? { ...p, [field]: value } : p)));
  };

  const handleRemovePrize = (index: number) => {
    setPrizes((prev) => prev.filter((_, idx) => idx !== index));
  };

  return { prizes, setPrizes, handleAddPrize, handleUpdatePrize, handleRemovePrize };
}
