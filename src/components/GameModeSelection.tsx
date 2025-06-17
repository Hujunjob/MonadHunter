import React from 'react';
import { useAccount } from 'wagmi';

interface GameModeSelectionProps {
  onStartGame: () => void;
  onOpenObserverMode: () => void;
}

export const GameModeSelection: React.FC<GameModeSelectionProps> = ({ 
  onStartGame, 
  onOpenObserverMode 
}) => {
  const { address } = useAccount();

  return (
    <div className="game-mode-selection">
      <div className="welcome-section">
        <h3>Welcome, {address ? `${address.slice(0, 6)}...${address.slice(-4)}` : 'Player'}!</h3>
        <p>Choose your game mode to begin</p>
      </div>
      
      <div className="mode-buttons">
        <button 
          className="game-mode-button start-game"
          onClick={onStartGame}
        >
          <div className="button-icon">🎮</div>
          <div className="button-content">
            <h4>Start Game</h4>
            <p>Begin your vampire hunting adventure</p>
          </div>
        </button>
        
        <button 
          className="game-mode-button observer-mode"
          onClick={onOpenObserverMode}
        >
          <div className="button-icon">👁️</div>
          <div className="button-content">
            <h4>Observer Mode</h4>
            <p>Watch another player's game in real-time</p>
          </div>
        </button>
      </div>
      
      <div className="game-info">
        <div className="info-item">
          <span className="info-icon">🛡️</span>
          <span>Anti-cheat protection enabled</span>
        </div>
        <div className="info-item">
          <span className="info-icon">⚡</span>
          <span>Real-time multiplayer synchronization</span>
        </div>
        <div className="info-item">
          <span className="info-icon">🌐</span>
          <span>Blockchain-verified player identity</span>
        </div>
      </div>
    </div>
  );
};