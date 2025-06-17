import React, { useState } from 'react';

interface ObserverModeProps {
  onStartObserving: (playerAddress: string) => void;
  onClose: () => void;
}

export const ObserverMode: React.FC<ObserverModeProps> = ({ onStartObserving, onClose }) => {
  const [playerAddress, setPlayerAddress] = useState('');
  const [isValidAddress, setIsValidAddress] = useState(false);

  const validateAddress = (address: string) => {
    // Basic Ethereum address validation
    const isValid = /^0x[a-fA-F0-9]{40}$/.test(address);
    setIsValidAddress(isValid);
    return isValid;
  };

  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const address = e.target.value;
    setPlayerAddress(address);
    validateAddress(address);
  };

  const handleStartObserving = () => {
    if (isValidAddress && playerAddress) {
      onStartObserving(playerAddress);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && isValidAddress) {
      handleStartObserving();
    }
  };

  return (
    <div className="observer-mode-overlay">
      <div className="observer-mode-modal">
        <div className="modal-header">
          <h2>👁️ Observer Mode</h2>
          <button className="close-button" onClick={onClose}>✕</button>
        </div>
        
        <div className="modal-content">
          <p>Enter a player's wallet address to watch their game in real-time</p>
          
          <div className="address-input-section">
            <label htmlFor="player-address">Player Wallet Address</label>
            <input
              id="player-address"
              type="text"
              value={playerAddress}
              onChange={handleAddressChange}
              onKeyPress={handleKeyPress}
              placeholder="0x1234567890123456789012345678901234567890"
              className={`address-input ${isValidAddress ? 'valid' : ''}`}
            />
            {playerAddress && !isValidAddress && (
              <p className="error-message">Please enter a valid Ethereum address</p>
            )}
          </div>
          
          <div className="modal-actions">
            <button 
              className="cancel-button" 
              onClick={onClose}
            >
              Cancel
            </button>
            <button 
              className="start-observing-button"
              onClick={handleStartObserving}
              disabled={!isValidAddress}
            >
              Start Observing
            </button>
          </div>
          
          <div className="observer-info">
            <h4>How Observer Mode Works:</h4>
            <ul>
              <li>View real-time gameplay of any connected player</li>
              <li>See their stats, position, and game progress</li>
              <li>Read-only mode - you cannot interact with the game</li>
              <li>Perfect for spectating friends or learning strategies</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};