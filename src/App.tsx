import React, { useState, useRef } from 'react';
import { useAccount } from 'wagmi';
import { Game } from './Game';
import { WalletConnect } from './components/WalletConnect';
import { GameModeSelection } from './components/GameModeSelection';
import { UpgradeModal } from './components/UpgradeModal';
import type { UpgradeOption } from './components/UpgradeModal';
import './App.css';

type AppState = 'wallet' | 'mode-selection' | 'playing';

function App() {
  const { isConnected, address } = useAccount();
  const gameRef = useRef<Game | null>(null);
  const [appState, setAppState] = useState<AppState>('wallet');
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
  const [upgradeOptions, setUpgradeOptions] = useState<UpgradeOption[]>([]);
  const [playerLevel, setPlayerLevel] = useState(1);

  const startGame = () => {
    if (!gameRef.current) {
      gameRef.current = new Game();
      setAppState('playing');
    }
  };

  const resetGame = () => {
    if (gameRef.current) {
      gameRef.current.destroy(true);
      gameRef.current = null;
    }
    
    // Clean up any remaining canvas elements
    const gameContainer = document.getElementById('game-container');
    if (gameContainer) {
      gameContainer.innerHTML = '';
    }
    
    setAppState('mode-selection');
  };

  const showUpgradeModal = (options: UpgradeOption[], level: number) => {
    setUpgradeOptions(options);
    setPlayerLevel(level);
    setIsUpgradeModalOpen(true);
  };

  const selectUpgrade = (option: UpgradeOption) => {
    // Call the game scene's selectUpgrade method
    if (gameRef.current && gameRef.current.scene.isActive('GameScene')) {
      const gameScene = gameRef.current.scene.getScene('GameScene') as any;
      if (gameScene && gameScene.selectUpgrade) {
        gameScene.selectUpgrade(option.id);
      }
    }
    setIsUpgradeModalOpen(false);
  };

  // Update app state based on wallet connection
  React.useEffect(() => {
    if (isConnected && appState === 'wallet') {
      setAppState('mode-selection');
    } else if (!isConnected && appState !== 'wallet') {
      setAppState('wallet');
      resetGame();
    }
    const appElement = document.querySelector('.App') as HTMLElement;
    if (appElement) {
      if (appState === "playing") {
        appElement.style.width = "25vw";
      } else {
        appElement.style.width = "100vw";
      }
    }
  }, [isConnected, appState]);

  // Update global wallet info for game access
  React.useEffect(() => {
    (window as any).__WALLET_INFO__ = {
      connected: isConnected,
      address: address
    };
  }, [isConnected, address]);

  // Provide global reset callback for game UI
  React.useEffect(() => {
    (window as any).__GAME_RESET_CALLBACK__ = resetGame;
    (window as any).__SHOW_UPGRADE_CALLBACK__ = showUpgradeModal;
    return () => {
      delete (window as any).__GAME_RESET_CALLBACK__;
      delete (window as any).__SHOW_UPGRADE_CALLBACK__;
    };
  }, []);

  return (
    <div className="App">
      <header className="app-header">
        <h1>
          <img src="/src/assets/horseicon.png" alt="MonadHunter" className="game-logo" />
          MonadHunter
        </h1>
        <p>使用方向键移动，空格键射击最近的敌人</p>
      </header>

      {/* Wallet Connection Phase */}
      {appState === 'wallet' && (
        <WalletConnect />
      )}

      {/* Game Mode Selection Phase */}
      {appState === 'mode-selection' && isConnected && (
        <GameModeSelection 
          onStartGame={startGame}
        />
      )}

      {/* Game Running Phase */}
      {appState === 'playing' && (
        <div className="game-section">
          <div className="game-controls">
            <button 
              className="reset-game-btn"
              onClick={resetGame}
            >
              Back to Menu
            </button>
          </div>
          <div id="game-container"></div>
        </div>
      )}

      {/* Upgrade Modal */}
      <UpgradeModal 
        isOpen={isUpgradeModalOpen}
        options={upgradeOptions}
        onSelectUpgrade={selectUpgrade}
        playerLevel={playerLevel}
      />
    </div>
  );
}

export default App