import React, { useState } from 'react';

interface ShopItem {
  id: string;
  name: string;
  description: string;
  cost: number;
  icon: string;
}

interface PauseShopProps {
  isOpen: boolean;
  coins: number;
  purchaseCounts: { [key: string]: number };
  onPurchase: (itemId: string) => boolean;
  onClose: () => void;
  onGetItemPrice: (itemId: string) => number;
}

export const PauseShop: React.FC<PauseShopProps> = ({
  isOpen,
  coins,
  purchaseCounts,
  onPurchase,
  onClose,
  onGetItemPrice
}) => {
  const [purchaseMessage, setPurchaseMessage] = useState<string>('');

  const shopItems: ShopItem[] = [
    {
      id: 'health-potion',
      name: '生命药水',
      description: '恢复50%血量',
      cost: 10,
      icon: '❤️'
    },
    {
      id: 'speed-boost',
      name: '速度提升',
      description: '增加移动速度+30',
      cost: 15,
      icon: '⚡'
    },
    {
      id: 'damage-boost',
      name: '攻击强化',
      description: '增加攻击力+10',
      cost: 20,
      icon: '⚔️'
    },
    {
      id: 'bullet-boost',
      name: '子弹增强',
      description: '增加子弹数量+1',
      cost: 25,
      icon: '🔫'
    },
    {
      id: 'defense-boost',
      name: '防御提升',
      description: '增加防御力+2',
      cost: 18,
      icon: '🛡️'
    },
    {
      id: 'max-health-boost',
      name: '血量上限',
      description: '增加最大血量+20',
      cost: 22,
      icon: '💪'
    },
    {
      id: 'circle-burst',
      name: '环形弹幕',
      description: '提升环形弹幕等级',
      cost: 30,
      icon: '💥'
    },
    {
      id: 'full-heal',
      name: '完全治疗',
      description: '恢复全部血量',
      cost: 25,
      icon: '✨'
    }
  ];

  const handlePurchase = (itemId: string) => {
    const success = onPurchase(itemId);
    if (success) {
      const item = shopItems.find(i => i.id === itemId);
      setPurchaseMessage(`✅ 购买成功: ${item?.name}`);
      setTimeout(() => setPurchaseMessage(''), 2000);
    } else {
      setPurchaseMessage('❌ 金币不足');
      setTimeout(() => setPurchaseMessage(''), 2000);
    }
  };

  const handleClose = () => {
    setPurchaseMessage('');
    onClose();
  };

  // Handle P key press to close shop
  React.useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.key === 'p' || event.key === 'P') {
        event.preventDefault();
        event.stopPropagation();
        handleClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyPress, true); // Use capture phase
    }

    return () => {
      document.removeEventListener('keydown', handleKeyPress, true);
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="pause-shop-overlay">
      <div className="pause-shop-modal">
        <div className="shop-header">
          <h2>⏸️ 游戏暂停 - 战利品商店</h2>
          <button className="close-button" onClick={handleClose}>×</button>
        </div>
        
        <div className="shop-content">
          <div className="currency-display">
            <div className="currency-info">
              <span className="currency-icon">🪙</span>
              <span className="currency-amount">{coins}</span>
              <span className="currency-label">金币</span>
            </div>
          </div>

          {purchaseMessage && (
            <div className="purchase-message">
              {purchaseMessage}
            </div>
          )}

          <div className="shop-grid">
            {shopItems.map((item) => {
              const currentPrice = onGetItemPrice(item.id);
              const purchaseCount = purchaseCounts[item.id] || 0;
              const canAfford = coins >= currentPrice;
              return (
                <div
                  key={item.id}
                  className={`shop-item ${canAfford ? 'affordable' : 'expensive'}`}
                  onClick={() => canAfford && handlePurchase(item.id)}
                >
                  <div className="item-icon">{item.icon}</div>
                  <div className="item-info">
                    <h3 className="item-name">
                      {item.name}
                      {purchaseCount > 0 && (
                        <span className="purchase-count"> (已购买{purchaseCount}次)</span>
                      )}
                    </h3>
                    <p className="item-description">{item.description}</p>
                    <div className="item-cost">
                      <span className="cost-icon">🪙</span>
                      <span className="cost-amount">{currentPrice}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="shop-instructions">
            <p>使用金币购买道具提升角色能力，道具价格会随购买次数递增50%</p>
            <p>按 P 键或点击关闭按钮继续游戏</p>
          </div>
        </div>
      </div>
    </div>
  );
};