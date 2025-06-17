import Phaser from 'phaser';

interface GameStats {
  level: number;
  experience: number;
  experienceToNext: number;
  health: number;
  maxHealth: number;
  killCount: number;
  gameTime: number;
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
  private antiCheatStatus!: Phaser.GameObjects.Text;

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
    this.restartButton = this.scene.add.text(700, 10, 'Restart', {
      fontSize: '20px',
      color: '#ffffff',
      backgroundColor: '#666666',
      padding: { x: 10, y: 5 }
    });
    this.restartButton.setInteractive();
    this.restartButton.on('pointerdown', () => {
      this.scene.scene.restart();
    });

    // Anti-cheat status indicator
    this.antiCheatStatus = this.scene.add.text(700, 50, '', {
      fontSize: '16px',
      color: '#00ff00'
    });
  }

  setAntiCheatStatus(enabled: boolean) {
    if (enabled) {
      this.antiCheatStatus.setText('🛡️ Anti-Cheat: ON');
      this.antiCheatStatus.setColor('#00ff00');
    } else {
      this.antiCheatStatus.setText('⚠️ Anti-Cheat: OFF');
      this.antiCheatStatus.setColor('#ffaa00');
    }
  }

  update(stats: GameStats) {
    this.healthText.setText(`Health: ${stats.health}/${stats.maxHealth}`);
    this.levelText.setText(`Level: ${stats.level}`);
    this.killCountText.setText(`Kills: ${stats.killCount}`);
    this.gameTimeText.setText(`Time: ${this.formatTime(stats.gameTime)}`);

    // Update experience bar
    this.expBar.clear();
    this.expBar.fillStyle(0x00ff00);
    const expWidth = (stats.experience / stats.experienceToNext) * 200;
    this.expBar.fillRect(10, 70, expWidth, 20);
  }

  private formatTime(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  }
}