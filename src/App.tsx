import React, { useState, useRef } from 'react';
import { useAccount } from 'wagmi';
import { Game } from './Game';
import { WalletConnect } from './components/WalletConnect';
import { GameModeSelection } from './components/GameModeSelection';
import { UpgradeModal } from './components/UpgradeModal';
import { ScoreUpload } from './components/ScoreUpload';
import { PlayerStats } from './components/PlayerStats';
import { NetworkIndicator } from './components/NetworkIndicator';
import { Leaderboard } from './components/Leaderboard';
import { PauseShop } from './components/PauseShop';
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
  const [isScoreUploadOpen, setIsScoreUploadOpen] = useState(false);
  const [gameStats, setGameStats] = useState<{level: number; killCount: number; gameTime: number} | null>(null);
  const [isLeaderboardOpen, setIsLeaderboardOpen] = useState(false);
  const [isPauseShopOpen, setIsPauseShopOpen] = useState(false);
  const [currentCoins, setCurrentCoins] = useState(0);
  const [purchaseCounts, setPurchaseCounts] = useState<{ [key: string]: number }>({});

  const startGame = () => {
    if (!gameRef.current) {
      // Clear any previous game over states
      setIsScoreUploadOpen(false);
      setGameStats(null);
      
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

  const showScoreUpload = (stats: {level: number; killCount: number; gameTime: number}) => {
    setGameStats(stats);
    setIsScoreUploadOpen(true);
  };

  const handleScoreUploadComplete = () => {
    // Could trigger a celebration animation or other effects
    console.log('Score uploaded successfully!');
  };

  const handleScoreUploadClose = () => {
    setIsScoreUploadOpen(false);
    setGameStats(null);
    // Return to menu after score upload
    resetGame();
  };

  const showLeaderboard = () => {
    setIsLeaderboardOpen(true);
  };

  const hideLeaderboard = () => {
    setIsLeaderboardOpen(false);
  };

  const showPauseShop = (coins: number, itemPurchaseCounts: { [key: string]: number }) => {
    setCurrentCoins(coins);
    setPurchaseCounts(itemPurchaseCounts);
    setIsPauseShopOpen(true);
  };

  const hidePauseShop = () => {
    setIsPauseShopOpen(false);
    // Resume game
    if (gameRef.current && gameRef.current.scene.isActive('GameScene')) {
      const gameScene = gameRef.current.scene.getScene('GameScene') as any;
      if (gameScene && gameScene.resumeFromShop) {
        gameScene.resumeFromShop();
      }
    }
  };

  const handlePurchase = (itemId: string): boolean => {
    // Call the game scene's purchase method
    if (gameRef.current && gameRef.current.scene.isActive('GameScene')) {
      const gameScene = gameRef.current.scene.getScene('GameScene') as any;
      if (gameScene && gameScene.purchaseShopItem) {
        const success = gameScene.purchaseShopItem(itemId);
        if (success) {
          // Update coins and purchase counts display
          setCurrentCoins(gameScene.gameStats.coins);
          setPurchaseCounts({...gameScene.itemPurchaseCounts});
        }
        return success;
      }
    }
    return false;
  };

  const getItemPrice = (itemId: string): number => {
    if (gameRef.current && gameRef.current.scene.isActive('GameScene')) {
      const gameScene = gameRef.current.scene.getScene('GameScene') as any;
      if (gameScene && gameScene.getItemPrice) {
        return gameScene.getItemPrice(itemId);
      }
    }
    return 0;
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
    (window as any).__SHOW_SCORE_UPLOAD_CALLBACK__ = showScoreUpload;
    (window as any).__SHOW_PAUSE_SHOP_CALLBACK__ = showPauseShop;
    return () => {
      delete (window as any).__GAME_RESET_CALLBACK__;
      delete (window as any).__SHOW_UPGRADE_CALLBACK__;
      delete (window as any).__SHOW_SCORE_UPLOAD_CALLBACK__;
      delete (window as any).__SHOW_PAUSE_SHOP_CALLBACK__;
    };
  }, []);

  return (
    <div className="App">
      <header className="app-header">
        <div className="header-top">
          <h1>
            <img src="/horseicon.png" alt="MonadHunter" className="game-logo" />
            保护小马
          </h1>
          {isConnected && appState !== 'playing' && <NetworkIndicator />}
        </div>
        <p>使用方向键移动，空格键射击最近的敌人</p>
        {appState === 'playing' && <p>按P暂停，购买道具提升能力</p>}
      </header>

      {/* Wallet Connection Phase */}
      {!isConnected && (
        <WalletConnect />
      )}

      {/* Game Mode Selection Phase */}
      {isConnected && appState === 'mode-selection' && (
        <div>
          <GameModeSelection 
            onStartGame={startGame}
            onShowLeaderboard={showLeaderboard}
          />
        </div>
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
          <div className="game-layout">
            <div className="game-stats-sidebar">
              <PlayerStats />
            </div>
            <div id="game-container"></div>
          </div>
        </div>
      )}

      {/* Upgrade Modal */}
      <UpgradeModal 
        isOpen={isUpgradeModalOpen}
        options={upgradeOptions}
        onSelectUpgrade={selectUpgrade}
        playerLevel={playerLevel}
      />

      {/* Score Upload Modal */}
      {isScoreUploadOpen && gameStats && (
        <ScoreUpload
          gameStats={gameStats}
          onUploadComplete={handleScoreUploadComplete}
          onClose={handleScoreUploadClose}
        />
      )}

      {/* Leaderboard Modal */}
      {isLeaderboardOpen && (
        <Leaderboard
          onClose={hideLeaderboard}
        />
      )}

      {/* Pause Shop Modal */}
      <PauseShop
        isOpen={isPauseShopOpen}
        coins={currentCoins}
        purchaseCounts={purchaseCounts}
        onPurchase={handlePurchase}
        onClose={hidePauseShop}
        onGetItemPrice={getItemPrice}
      />
    </div>
  );
}

export default App