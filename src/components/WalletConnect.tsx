import React from 'react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount } from 'wagmi';
import { AddMonadNetwork } from './AddMonadNetwork';

interface WalletConnectProps {
  onWalletConnected?: () => void;
}

export const WalletConnect: React.FC<WalletConnectProps> = ({ onWalletConnected }) => {
  const { isConnected, address } = useAccount();

  React.useEffect(() => {
    if (isConnected && onWalletConnected) {
      onWalletConnected();
    }
  }, [isConnected, onWalletConnected]);

  return (
    <div className="wallet-connect">
      {!isConnected ? (
        <div className="wallet-connect-prompt">
          <div className="wallet-icon">🔐</div>
          <h2>Connect Your Wallet</h2>
          <p>You need to connect your wallet to start playing MonadHunter</p>
          <div className="connect-button-wrapper">
            <ConnectButton />
          </div>
          <div className="supported-wallets">
            <p>Supports MetaMask, WalletConnect, Coinbase Wallet, and more</p>
          </div>
        </div>
      ) : (
        <div className="wallet-connected">
          <div className="wallet-info">
            <div className="wallet-icon connected">✅</div>
            <div className="user-info">
              <h3>Wallet Connected</h3>
              <p className="wallet-address">
                {address ? `${address.slice(0, 6)}...${address.slice(-4)}` : 'Connected'}
              </p>
            </div>
          </div>
          
          {/* Monad Network Helper - only show when wallet is connected */}
          <div style={{ marginTop: '1rem' }}>
            <AddMonadNetwork />
          </div>
        </div>
      )}
    </div>
  );
};