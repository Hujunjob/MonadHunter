import React, { useState } from 'react';
import { useChainId, useSwitchChain } from 'wagmi';

export const AddMonadNetwork: React.FC = () => {
  const chainId = useChainId();
  const { switchChain } = useSwitchChain();
  const [isAdding, setIsAdding] = useState(false);
  
  const isOnMonad = chainId === 10143;

  const addMonadNetwork = async () => {
    if (!window.ethereum) {
      alert('Please install MetaMask or another Web3 wallet');
      return;
    }

    setIsAdding(true);
    
    try {
      // Try to switch to Monad first
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: '0x279F' }], // 10143 in hex
      });
    } catch (switchError: any) {
      // If the chain is not added, add it
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [
              {
                chainId: '0x279F', // 10143 in hex
                chainName: 'Monad Testnet',
                nativeCurrency: {
                  name: 'Monad',
                  symbol: 'MON',
                  decimals: 18,
                },
                rpcUrls: ['https://testnet-rpc.monad.xyz'],
                blockExplorerUrls: ['https://testnet-explorer.monad.xyz'],
                iconUrls: ['https://monad.xyz/favicon.ico'], // Optional
              },
            ],
          });
          console.log('Monad testnet added successfully');
        } catch (addError) {
          console.error('Failed to add Monad testnet:', addError);
          alert('Failed to add Monad testnet. Please add it manually.');
        }
      } else {
        console.error('Failed to switch to Monad testnet:', switchError);
        alert('Failed to switch to Monad testnet.');
      }
    } finally {
      setIsAdding(false);
    }
  };

  const switchToMonad = () => {
    if (switchChain) {
      switchChain({ chainId: 10143 });
    }
  };

  if (isOnMonad) {
    return (
      <div className="bg-green-100 border border-green-400 text-green-700 px-3 py-2 rounded mb-3">
        <div className="flex items-center">
          <span className="text-green-500 mr-2">✅</span>
          <span className="font-semibold text-sm">Connected to Monad Testnet</span>
        </div>
        <p className="text-xs mt-1">Ready to record your scores on-chain!</p>
      </div>
    );
  }

  return (
    <div className="bg-blue-100 border border-blue-400 text-blue-700 px-3 py-2 rounded mb-3">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center">
            <span className="text-blue-500 mr-2">ℹ️</span>
            <span className="font-semibold text-sm">Switch to Monad Testnet</span>
          </div>
          <p className="text-xs mt-1">
            For ultra-fast transactions and low fees
          </p>
        </div>
        <button
          onClick={addMonadNetwork}
          disabled={isAdding}
          className={`px-3 py-1.5 rounded-md text-sm font-semibold transition-colors ${
            isAdding
              ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700 text-white'
          }`}
        >
          {isAdding ? 'Adding...' : 'Add Monad'}
        </button>
      </div>
      
      {/* Manual instructions */}
      <details className="mt-2">
        <summary className="text-xs cursor-pointer hover:text-blue-800">
          Manual setup instructions
        </summary>
        <div className="mt-1 text-xs bg-blue-50 p-2 rounded">
          <p className="font-semibold mb-1">Add Monad Testnet manually:</p>
          <ul className="space-y-0.5">
            <li><strong>Network Name:</strong> Monad Testnet</li>
            <li><strong>RPC URL:</strong> https://testnet-rpc.monad.xyz</li>
            <li><strong>Chain ID:</strong> 10143</li>
            <li><strong>Currency Symbol:</strong> MON</li>
            <li><strong>Block Explorer:</strong> https://testnet-explorer.monad.xyz</li>
          </ul>
        </div>
      </details>
    </div>
  );
};