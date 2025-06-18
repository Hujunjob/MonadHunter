import Phaser from 'phaser';
import type { PlayerStats } from '../entities/Player';

interface GameStats {
  level: number;
  experience: number;
  experienceToNext: number;
  health: number;
  maxHealth: number;
  killCount: number;
  coins: number;
  gameTime: number;
  playerStats: PlayerStats;
  circleBurstLevel?: number;
}

interface WalletInfo {
  connected: boolean;
  address?: string;
}

export class GameUI {
  private scene: Phaser.Scene;
  private healthText!: Phaser.GameObjects.Text;
  private levelText!: Phaser.GameObjects.Text;
  private expBar!: Phaser.GameObjects.Graphics;
  private expBarBg!: Phaser.GameObjects.Graphics;
  private restartButton!: Phaser.GameObjects.Text;
  private killCountText!: Phaser.GameObjects.Text;
  private gameTimeText!: Phaser.GameObjects.Text;
  private walletStatus!: Phaser.GameObjects.Text;
  private coinsText!: Phaser.GameObjects.Text;
  private playerStatsText!: Phaser.GameObjects.Text;

  constructor(scene: Phaser.Scene, stats: GameStats) {
    this.scene = scene;
    this.createUI(stats);
  }

  private createUI(stats: GameStats) {
    // Health text
    this.healthText = this.scene.add.text(10, 10, `Health: ${stats.health}/${stats.maxHealth}`, {
      fontSize: '20px',
      color: '#ff0000'
    });

    // Level text
    this.levelText = this.scene.add.text(10, 40, `Level: ${stats.level}`, {
      fontSize: '20px',
      color: '#00ff00'
    });

    // Experience bar background
    this.expBarBg = this.scene.add.graphics();
    this.expBarBg.fillStyle(0x333333);
    this.expBarBg.fillRect(10, 70, 200, 20);

    // Experience bar
    this.expBar = this.scene.add.graphics();

    // Kill count text
    this.killCountText = this.scene.add.text(10, 100, `Kills: ${stats.killCount}`, {
      fontSize: '18px',
      color: '#ffff00'
    });

    // Game time text
    this.gameTimeText = this.scene.add.text(10, 125, `Time: ${this.formatTime(stats.gameTime)}`, {
      fontSize: '18px',
      color: '#00ffff'
    });

    // Restart button
    this.restartButton = this.scene.add.text(700, 10, 'Back to Menu', {
      fontSize: '20px',
      color: '#ffffff',
      backgroundColor: '#666666',
      padding: { x: 10, y: 5 }
    });
    this.restartButton.setInteractive();
    this.restartButton.on('pointerdown', () => {
      // Trigger the App's resetGame function via global callback
      const globalResetCallback = (window as any).__GAME_RESET_CALLBACK__;
      if (globalResetCallback) {
        globalResetCallback();
      }
    });

    // Wallet status indicator
    this.walletStatus = this.scene.add.text(700, 50, '', {
      fontSize: '14px',
      color: '#676FFF'
    });

    // Coins display (below wallet status)
    this.coinsText = this.scene.add.text(700, 75, `🪙 ${stats.coins}`, {
      fontSize: '16px',
      color: '#fbbf24',
      fontStyle: 'bold'
    });

    // Player stats display
    this.playerStatsText = this.scene.add.text(10, 150, '', {
      fontSize: '16px',
      color: '#ffffff',
      backgroundColor: 'rgba(0,0,0,0.5)',
      padding: { x: 10, y: 8 }
    });
  }

  setWalletStatus(walletInfo: WalletInfo) {
    if (walletInfo.connected && walletInfo.address) {
      const shortAddress = `${walletInfo.address.slice(0, 6)}...${walletInfo.address.slice(-4)}`;
      this.walletStatus.setText(`💳 ${shortAddress}`);
      this.walletStatus.setColor('#676FFF');
    } else {
      this.walletStatus.setText('❌ No Wallet');
      this.walletStatus.setColor('#ff6666');
    }
  }

  update(stats: GameStats) {
    this.healthText.setText(`Health: ${stats.health}/${stats.maxHealth}`);
    this.levelText.setText(`Level: ${stats.level}`);
    this.killCountText.setText(`Kills: ${stats.killCount}`);
    this.gameTimeText.setText(`Time: ${this.formatTime(stats.gameTime)}`);
    this.coinsText.setText(`🪙 ${stats.coins}`);

    // Update experience bar
    this.expBar.clear();
    this.expBar.fillStyle(0x00ff00);
    const expWidth = (stats.experience / stats.experienceToNext) * 200;
    this.expBar.fillRect(10, 70, expWidth, 20);

    // Update player stats display
    const statsLines = [
      `🔫 子弹数量: ${stats.playerStats.bulletCount}`,
      `⚔️ 攻击力: ${stats.playerStats.attack}`,
      `⚡ 移动速度: ${stats.playerStats.speed}`,
      `🛡️ 防御力: ${stats.playerStats.defense}`
    ];
    
    // Add circle burst probability (always show, even when 0)
    const circleBurstLevel = stats.circleBurstLevel || 0;
    const circleBurstChance = circleBurstLevel * 5;
    statsLines.push(`💥 环形弹幕: ${circleBurstChance}%`);
    
    this.playerStatsText.setText(statsLines.join('\n'));
  }

  private formatTime(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  }
}