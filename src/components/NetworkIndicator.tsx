import React from 'react';
import { useChainId, useChains } from 'wagmi';

export const NetworkIndicator: React.FC = () => {
  const chainId = useChainId();
  const chains = useChains();
  
  const currentChain = chains.find(chain => chain.id === chainId);
  
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
    <div className="network-indicator">
      <div className={`network-badge ${getNetworkColor(chainId).replace('bg-', '')}`}>
        <span>{getNetworkEmoji(chainId)}</span>
        <span className="network-name">{currentChain.name}</span>
        {currentChain.testnet && <span className="testnet-label">(Testnet)</span>}
      </div>
    </div>
  );
};