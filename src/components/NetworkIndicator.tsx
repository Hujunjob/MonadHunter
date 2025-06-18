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
      <div className="flex items-center space-x-2 text-sm text-gray-500">
        <span>❓</span>
        <span>Unknown Network</span>
      </div>
    );
  }
  
  return (
    <div className="flex items-center space-x-2 text-sm">
      <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-white ${getNetworkColor(chainId)}`}>
        <span>{getNetworkEmoji(chainId)}</span>
        <span className="font-medium">{currentChain.name}</span>
        {currentChain.testnet && <span className="text-xs opacity-80">(Testnet)</span>}
      </div>
    </div>
  );
};