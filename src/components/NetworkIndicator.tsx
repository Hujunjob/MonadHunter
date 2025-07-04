import React, { useState, useEffect, useRef } from 'react';
import { useChainId, useChains, useDisconnect } from 'wagmi';

export const NetworkIndicator: React.FC = () => {
  const chainId = useChainId();
  const chains = useChains();
  const { disconnect } = useDisconnect();
  const [showDisconnect, setShowDisconnect] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const currentChain = chains.find(chain => chain.id === chainId);

  const handleDisconnect = () => {
    disconnect();
    setShowDisconnect(false);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDisconnect(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  const getNetworkColor = (chainId: number) => {
    switch (chainId) {
      case 1: return 'bg-blue-600';      // Ethereum Mainnet
      case 11155111: return 'bg-purple-600'; // Sepolia
      case 10143: return 'bg-green-600';     // Monad Testnet
      case 137: return 'bg-purple-500';     // Polygon
      case 42161: return 'bg-blue-500';     // Arbitrum
      case 10: return 'bg-red-500';         // Optimism
      case 8453: return 'bg-blue-400';      // Base
      case 31337: return 'bg-gray-600';     // Local
      default: return 'bg-gray-500';
    }
  };
  
  const getNetworkEmoji = (chainId: number) => {
    switch (chainId) {
      case 1: return '🔷';        // Ethereum
      case 11155111: return '🧪'; // Sepolia (test tube)
      case 10143: return '⚡';     // Monad (lightning)
      case 137: return '🔮';      // Polygon
      case 42161: return '🏗️';   // Arbitrum
      case 10: return '🔴';       // Optimism
      case 8453: return '🔵';     // Base
      case 31337: return '🏠';    // Local
      default: return '🌐';
    }
  };
  
  if (!currentChain) {
    return (
      <div className="network-indicator unknown">
        <span>❓</span>
        <span>Unknown Network</span>
      </div>
    );
  }
  
  return (
    <div className="network-indicator-container" ref={dropdownRef}>
      <div 
        className={`network-badge ${getNetworkColor(chainId).replace('bg-', '')} clickable`}
        onClick={() => setShowDisconnect(!showDisconnect)}
      >
        <span>{getNetworkEmoji(chainId)}</span>
        <span className="network-name">{currentChain.name}</span>
        {currentChain.testnet && <span className="testnet-label">(Testnet)</span>}
        <span className="dropdown-arrow">▼</span>
      </div>
      
      {showDisconnect && (
        <div className="disconnect-dropdown">
          <button 
            className="disconnect-btn"
            onClick={handleDisconnect}
          >
            🔌 Disconnect Wallet
          </button>
        </div>
      )}
    </div>
  );
};