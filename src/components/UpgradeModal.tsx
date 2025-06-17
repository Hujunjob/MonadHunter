import React from 'react';

export interface UpgradeOption {
  id: string;
  title: string;
  description: string;
  icon: string;
  effect: () => void;
}

interface UpgradeModalProps {
  isOpen: boolean;
  options: UpgradeOption[];
  onSelectUpgrade: (option: UpgradeOption) => void;
  playerLevel: number;
}

export const UpgradeModal: React.FC<UpgradeModalProps> = ({
  isOpen,
  options,
  onSelectUpgrade,
  playerLevel
}) => {
  if (!isOpen) return null;

  return (
    <div className="upgrade-modal-overlay">
      <div className="upgrade-modal">
        <div className="upgrade-header">
          <h2>🎉 Level Up!</h2>
          <p>You've reached Level {playerLevel}! Choose your upgrade:</p>
        </div>
        
        <div className="upgrade-options">
          {options.map((option) => (
            <div
              key={option.id}
              className="upgrade-option"
              onClick={() => onSelectUpgrade(option)}
            >
              <div className="upgrade-icon">{option.icon}</div>
              <div className="upgrade-content">
                <h3>{option.title}</h3>
                <p>{option.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};