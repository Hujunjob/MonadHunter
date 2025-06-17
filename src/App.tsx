import React, { useState, useRef } from 'react';
import { useAccount } from 'wagmi';
import { Game } from './Game';
import { WalletConnect } from './components/WalletConnect';
import { GameModeSelection } from './components/GameModeSelection';
import { ObserverMode } from './components/ObserverMode';
import './App.css';

type AppState = 'wallet' | 'mode-selection' | 'playing' | 'observing';

function App() {
  const { isConnected, address } = useAccount();
  const gameRef = useRef<Game | null>(null);
  const [appState, setAppState] = useState<AppState>('wallet');
  const [showObserverModal, setShowObserverModal] = useState(false);
  const [observingAddress, setObservingAddress] = useState<string | null>(null);

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
    setAppState('mode-selection');
    setObservingAddress(null);
  };

  const openObserverMode = () => {
    setShowObserverModal(true);
  };

  const startObserving = (playerAddress: string) => {
    setObservingAddress(playerAddress);
    setShowObserverModal(false);
    
    // Initialize game in observer mode
    if (!gameRef.current) {
      gameRef.current = new Game();
      // Set observer mode flag in game
      (window as any).__OBSERVER_MODE__ = {
        enabled: true,
        targetAddress: playerAddress
      };
    }
    
    setAppState('observing');
  };

  const closeObserverModal = () => {
    setShowObserverModal(false);
  };

  // Update app state based on wallet connection
  React.useEffect(() => {
    if (isConnected && appState === 'wallet') {
      setAppState('mode-selection');
    } else if (!isConnected && appState !== 'wallet') {
      setAppState('wallet');
      resetGame();
    }
  }, [isConnected, appState]);

  // Update global wallet info for game access
  React.useEffect(() => {
    (window as any).__WALLET_INFO__ = {
      connected: isConnected,
      address: address
    };
  }, [isConnected, address]);

  return (
    <div className="App">
      <header className="app-header">
        <h1>🧛 MonadHunter</h1>
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
          onOpenObserverMode={openObserverMode}
        />
      )}

      {/* Game Running Phase */}
      {(appState === 'playing' || appState === 'observing') && (
        <div className="game-section">
          <div className="game-controls">
            {appState === 'observing' && observingAddress && (
              <div className="observer-info">
                <span className="observer-badge">👁️ Observer Mode</span>
                <span className="observing-address">
                  Watching: {observingAddress.slice(0, 6)}...{observingAddress.slice(-4)}
                </span>
              </div>
            )}
            <button 
              className="reset-game-btn"
              onClick={resetGame}
            >
              {appState === 'observing' ? 'Stop Observing' : 'Back to Menu'}
            </button>
          </div>
          <div id="game-container"></div>
        </div>
      )}

      {/* Observer Mode Modal */}
      {showObserverModal && (
        <ObserverMode 
          onStartObserving={startObserving}
          onClose={closeObserverModal}
        />
      )}
    </div>
  );
}

export default App
