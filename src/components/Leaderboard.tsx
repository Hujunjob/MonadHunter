import React, { useState, useEffect } from 'react';
import { useAccount, useReadContract, useChainId } from 'wagmi';
import { CONTRACT_ABI, getContractAddress } from '../config/contracts';

interface LeaderboardEntry {
  address: string;
  level: number;
  killCount: number;
  gameTime: number;
  timestamp: number;
}

interface LeaderboardProps {
  onClose: () => void;
}

export const Leaderboard: React.FC<LeaderboardProps> = ({ onClose }) => {
  const { isConnected } = useAccount();
  const chainId = useChainId();
  const contractAddress = getContractAddress(chainId);
  const [leaderboardCount, setLeaderboardCount] = useState(10);

  const { 
    data: leaderboardData, 
    isLoading: isLoadingLeaderboard,
    refetch: refetchLeaderboard 
  } = useReadContract({
    address: contractAddress as `0x${string}`,
    abi: CONTRACT_ABI,
    functionName: 'getLeaderboard',
    args: [BigInt(leaderboardCount)],
    query: {
      enabled: !!contractAddress && isConnected
    }
  });

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const formatAddress = (address: string): string => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const formatDate = (timestamp: number): string => {
    return new Date(timestamp * 1000).toLocaleDateString();
  };

  const handleCountChange = (newCount: number) => {
    setLeaderboardCount(newCount);
  };

  useEffect(() => {
    if (contractAddress && isConnected) {
      refetchLeaderboard();
    }
  }, [leaderboardCount, contractAddress, isConnected, refetchLeaderboard]);

  const leaderboardEntries: LeaderboardEntry[] = leaderboardData ? 
    (leaderboardData[0] as string[]).map((address: string, index: number) => {
      const score = (leaderboardData[1] as any[])[index];
      return {
        address,
        level: Number(score.level),
        killCount: Number(score.killCount),
        gameTime: Number(score.gameTime),
        timestamp: Number(score.timestamp)
      };
    }) : [];

  return (
    <div className="leaderboard-overlay">
      <div className="leaderboard-modal">
        <div className="leaderboard-header">
          <h2>🏆 Leaderboard</h2>
          <button className="close-button" onClick={onClose}>×</button>
        </div>

        <div className="leaderboard-content">
          {!isConnected ? (
            <div className="leaderboard-message">
              <p>Connect your wallet to view the leaderboard</p>
            </div>
          ) : isLoadingLeaderboard ? (
            <div className="leaderboard-message">
              <p>Loading leaderboard...</p>
            </div>
          ) : (
            <>
              <div className="leaderboard-controls">
                <label>Show top:</label>
                <select 
                  value={leaderboardCount} 
                  onChange={(e) => handleCountChange(Number(e.target.value))}
                  className="count-selector"
                >
                  <option value={5}>5 players</option>
                  <option value={10}>10 players</option>
                  <option value={20}>20 players</option>
                  <option value={50}>50 players</option>
                </select>
              </div>

              {leaderboardEntries.length === 0 ? (
                <div className="leaderboard-message">
                  <p>No players have recorded scores yet</p>
                  <p className="hint">Be the first to upload your score!</p>
                </div>
              ) : (
                <div className="leaderboard-table">
                  <div className="table-header">
                    <div className="rank-col">Rank</div>
                    <div className="player-col">Player</div>
                    <div className="kills-col">Kills</div>
                    <div className="level-col">Level</div>
                    <div className="time-col">Time</div>
                    <div className="date-col">Date</div>
                  </div>
                  
                  <div className="table-body">
                    {leaderboardEntries.map((entry, index) => (
                      <div key={entry.address} className={`table-row ${index < 3 ? `top-${index + 1}` : ''}`}>
                        <div className="rank-col">
                          <span className="rank-number">#{index + 1}</span>
                          {index === 0 && <span className="trophy">🥇</span>}
                          {index === 1 && <span className="trophy">🥈</span>}
                          {index === 2 && <span className="trophy">🥉</span>}
                        </div>
                        <div className="player-col">
                          <span className="address">{formatAddress(entry.address)}</span>
                        </div>
                        <div className="kills-col">
                          <span className="kills">{entry.killCount}</span>
                        </div>
                        <div className="level-col">
                          <span className="level">{entry.level}</span>
                        </div>
                        <div className="time-col">
                          <span className="time">{formatTime(entry.gameTime)}</span>
                        </div>
                        <div className="date-col">
                          <span className="date">{formatDate(entry.timestamp)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        <div className="leaderboard-footer">
          <p>🔗 Rankings are based on highest kill count, then highest level, then fastest time</p>
        </div>
      </div>
    </div>
  );
};