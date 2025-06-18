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
      <div className="player-stats-card">
        <h3 className="player-stats-title">🔗 Blockchain Stats</h3>
        <p className="player-stats-message">Connect wallet to view your on-chain records</p>
      </div>
    );
  }

  if (isLoadingScore) {
    return (
      <div className="player-stats-card">
        <h3 className="player-stats-title">🔗 Blockchain Stats</h3>
        <p className="player-stats-message">Loading your records...</p>
      </div>
    );
  }

  if (!hasPlayed || !playerScore || playerScore.timestamp === 0) {
    return (
      <div className="player-stats-card">
        <h3 className="player-stats-title">🔗 Blockchain Stats</h3>
        <div className="player-stats-empty">
          <p className="player-stats-message">No on-chain records yet</p>
          <p className="player-stats-hint">🏆 Play and upload your first score!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="player-stats-card">
      <h3 className="player-stats-title">🔗 Your Best On-Chain Score</h3>
      
      <div className="player-stats-content">
        {/* Main Stats */}
        <div className="stats-grid">
          <div className="stat-item">
            <div className="stat-value yellow">{playerScore.level}</div>
            <div className="stat-label">Level</div>
          </div>
          <div className="stat-item">
            <div className="stat-value red">{playerScore.killCount}</div>
            <div className="stat-label">Kills</div>
          </div>
          <div className="stat-item">
            <div className="stat-value blue">{formatTime(playerScore.gameTime)}</div>
            <div className="stat-label">Time</div>
          </div>
        </div>

        {/* Additional Info */}
        <div className="record-info">
          <span>Recorded:</span>
          <span>{formatDate(playerScore.timestamp)}</span>
        </div>

        {/* Blockchain Badge */}
        <div className="blockchain-badge">
          <span className="status-dot"></span>
          <span>Verified on blockchain</span>
        </div>
      </div>
    </div>
  );
};