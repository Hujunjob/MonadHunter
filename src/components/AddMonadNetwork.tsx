import React, { useState, useEffect } from 'react';
import { useChainId, useSwitchChain } from 'wagmi';

export const AddMonadNetwork: React.FC = () => {
  const chainId = useChainId();
  // const { switchChain } = useSwitchChain();
  const [isAdding, setIsAdding] = useState(false);
  const [hasAttemptedAutoSwitch, setHasAttemptedAutoSwitch] = useState(false);
  
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
      console.log('Successfully switched to Monad testnet');
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
          
          // After adding, try to switch to it
          await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: '0x279F' }],
          });
          console.log('Successfully switched to Monad testnet after adding');
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

  // const switchToMonad = () => {
  //   if (switchChain) {
  //     switchChain({ chainId: 10143 });
  //   }
  // };

  // Auto-switch to Monad when component mounts
  useEffect(() => {
    const autoSwitchToMonad = async () => {
      // Only attempt once and only if not already on Monad
      if (hasAttemptedAutoSwitch || isOnMonad) {
        return;
      }

      setHasAttemptedAutoSwitch(true);
      
      if (!window.ethereum) {
        console.log('No Web3 wallet detected for auto-switch');
        return;
      }

      console.log('Attempting auto-switch to Monad testnet...');
      setIsAdding(true);
      
      try {
        // Try to switch to Monad first
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: '0x279F' }], // 10143 in hex
        });
        console.log('Auto-switched to Monad testnet successfully');
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
            
            // After adding, try to switch to it
            await window.ethereum.request({
              method: 'wallet_switchEthereumChain',
              params: [{ chainId: '0x279F' }],
            });
            console.log('Auto-switched to Monad testnet after adding');
          } catch (addError) {
            console.log('Auto-switch failed, manual option available');
          }
        } else if (switchError.code === 4001) {
          console.log('User rejected auto-switch, manual option available');
        } else {
          console.log('Auto-switch failed, manual option available');
        }
      } finally {
        setIsAdding(false);
      }
    };

    // Add a small delay to ensure wallet is fully connected
    const timer = setTimeout(autoSwitchToMonad, 1000);
    return () => clearTimeout(timer);
  }, [hasAttemptedAutoSwitch, isOnMonad]);

  if (isOnMonad) {
    return (
      <div className="monad-network-card connected">
        <div className="network-status">
          <span className="status-icon">✅</span>
          <span className="status-text">Connected to Monad Testnet</span>
        </div>
      </div>
    );
  }

  if (isAdding) {
    return (
      <div className="monad-network-card auto-switching">
        <div className="network-status">
          <span className="status-icon">⚡</span>
          <span className="status-text">Auto-switching to Monad Testnet...</span>
        </div>
        <p className="network-description">
          Please confirm in your wallet if prompted
        </p>
      </div>
    );
  }

  return (
    <div className="monad-network-card">
      <div className="network-content">
        <div className="network-info">
          <div className="network-status">
            <span className="status-icon">ℹ️</span>
            <span className="status-text">Switch to Monad Testnet</span>
          </div>
          <p className="network-description">
            For ultra-fast transactions and low fees
          </p>
        </div>
        <button
          onClick={addMonadNetwork}
          disabled={isAdding}
          className={`add-monad-btn ${isAdding ? 'loading' : ''}`}
        >
          {isAdding ? 'Switching...' : 'Switch to Monad'}
        </button>
      </div>
      
      {/* Manual instructions */}
      <details className="manual-instructions">
        <summary className="instructions-summary">
          Manual setup instructions
        </summary>
        <div className="instructions-content">
          <p className="instructions-title">Add Monad Testnet manually:</p>
          <ul className="instructions-list">
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