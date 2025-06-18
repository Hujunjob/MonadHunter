import React from 'react';
import { useMonadHunterContract } from '../hooks/useMonadHunterContract';

export const PlayerStats: React.FC = () => {
  const {
    playerScore,
    hasPlayed,
    isLoadingScore,
    isConnected
  } = useMonadHunterContract();

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const formatDate = (timestamp: number): string => {
    if (timestamp === 0) return 'Never';
    return new Date(timestamp * 1000).toLocaleDateString();
  };

  if (!isConnected) {
    return (
      <div className="bg-gray-800 rounded-lg p-4 text-white">
        <h3 className="text-lg font-semibold mb-3 text-center">🔗 Blockchain Stats</h3>
        <p className="text-gray-400 text-center">Connect wallet to view your on-chain records</p>
      </div>
    );
  }

  if (isLoadingScore) {
    return (
      <div className="bg-gray-800 rounded-lg p-4 text-white">
        <h3 className="text-lg font-semibold mb-3 text-center">🔗 Blockchain Stats</h3>
        <p className="text-gray-400 text-center">Loading your records...</p>
      </div>
    );
  }

  if (!hasPlayed || !playerScore || playerScore.timestamp === 0) {
    return (
      <div className="bg-gray-800 rounded-lg p-4 text-white">
        <h3 className="text-lg font-semibold mb-3 text-center">🔗 Blockchain Stats</h3>
        <div className="text-center">
          <p className="text-gray-400 mb-2">No on-chain records yet</p>
          <p className="text-sm text-yellow-400">🏆 Play and upload your first score!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 rounded-lg p-4 text-white">
      <h3 className="text-lg font-semibold mb-3 text-center">🔗 Your Best On-Chain Score</h3>
      
      <div className="space-y-3">
        {/* Main Stats */}
        <div className="bg-gray-700 rounded-lg p-3">
          <div className="grid grid-cols-3 gap-3 text-center">
            <div>
              <div className="text-2xl font-bold text-yellow-400">{playerScore.level}</div>
              <div className="text-xs text-gray-400">Level</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-red-400">{playerScore.killCount}</div>
              <div className="text-xs text-gray-400">Kills</div>
            </div>
            <div>
              <div className="text-lg font-bold text-blue-400">{formatTime(playerScore.gameTime)}</div>
              <div className="text-xs text-gray-400">Time</div>
            </div>
          </div>
        </div>

        {/* Additional Info */}
        <div className="flex justify-between items-center text-sm">
          <span className="text-gray-400">Recorded:</span>
          <span className="text-gray-300">{formatDate(playerScore.timestamp)}</span>
        </div>

        {/* Blockchain Badge */}
        <div className="flex items-center justify-center space-x-2 text-xs">
          <span className="inline-block w-2 h-2 bg-green-400 rounded-full"></span>
          <span className="text-green-400">Verified on blockchain</span>
        </div>
      </div>
    </div>
  );
};