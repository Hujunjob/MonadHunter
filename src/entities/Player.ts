import Phaser from 'phaser';
import { HealthBar } from '../components/HealthBar';

export interface PlayerStats {
  speed: number;
  bulletCount: number;
  defense: number;
  maxHealth: number;
  health: number;
  attack: number;
}

export class Player extends Phaser.Physics.Arcade.Sprite {
  public stats: PlayerStats;
  private invincible: boolean = false;
  private invincibilityEndTime: number = 0;
  private healthBar: HealthBar;

  constructor(scene: Phaser.Scene, x: number, y: number, initialStats?: Partial<PlayerStats>) {
    super(scene, x, y, 'player');
    
    this.stats = {
      speed: 200,
      bulletCount: 1,
      defense: 0,
      maxHealth: 100,
      health: 100,
      attack: 25,
      ...initialStats
    };
    
    scene.add.existing(this);
    scene.physics.add.existing(this);
    
    this.setCollideWorldBounds(true);
    
    // Create health bar
    this.healthBar = new HealthBar(scene, x, y - 45, 50, 6);
    this.healthBar.setHealth(this.stats.health, this.stats.maxHealth);
  }

  update(cursors: Phaser.Types.Input.Keyboard.CursorKeys) {
    this.setVelocity(0);

    if (cursors.left.isDown) {
      this.setVelocityX(-this.stats.speed);
    } else if (cursors.right.isDown) {
      this.setVelocityX(this.stats.speed);
    }

    if (cursors.up.isDown) {
      this.setVelocityY(-this.stats.speed);
    } else if (cursors.down.isDown) {
      this.setVelocityY(this.stats.speed);
    }

    // Check invincibility status
    this.updateInvincibility();
    
    // Update health bar position and health
    this.healthBar.updatePosition(this.x, this.y - 45);
    this.healthBar.setHealth(this.stats.health, this.stats.maxHealth);
  }

  updateStats(newStats: Partial<PlayerStats>) {
    this.stats = { ...this.stats, ...newStats };
    
    // Update health bar display immediately when stats change
    if (this.healthBar) {
      this.healthBar.setHealth(this.stats.health, this.stats.maxHealth);
      this.healthBar.updatePosition(this.x, this.y - 45);
    }
  }

  takeDamage(damage: number): number {
    // 如果处于无敌状态，不受任何伤害
    if (this.invincible) {
      return 0;
    }
    
    const actualDamage = Math.max(1, damage - this.stats.defense);
    this.stats.health = Math.max(0, this.stats.health - actualDamage);
    
    // Flash red when hit
    this.setTint(0xff0000);
    this.scene.time.delayedCall(100, () => {
      this.clearTint();
    });
    
    return actualDamage;
  }

  heal(amount: number): number {
    const healAmount = Math.min(amount, this.stats.maxHealth - this.stats.health);
    this.stats.health += healAmount;
    return healAmount;
  }

  isDead(): boolean {
    return this.stats.health <= 0;
  }

  // 激活无敌状态
  activateInvincibility(duration: number = 5000) {
    this.invincible = true;
    this.invincibilityEndTime = Date.now() + duration;
    
    // 添加视觉效果：闪烁
    this.scene.tweens.add({
      targets: this,
      alpha: 0.5,
      duration: 200,
      yoyo: true,
      repeat: Math.floor(duration / 400) - 1,
      onComplete: () => {
        this.setAlpha(1); // 确保最后恢复完全不透明
      }
    });
  }

  // 更新无敌状态
  private updateInvincibility() {
    if (this.invincible && Date.now() >= this.invincibilityEndTime) {
      this.invincible = false;
      this.setAlpha(1); // 确保恢复正常显示
    }
  }

  // 检查是否处于无敌状态
  isInvincible(): boolean {
    return this.invincible;
  }

  // 清理资源
  destroy(fromScene?: boolean): void {
    if (this.healthBar) {
      this.healthBar.destroy();
    }
    super.destroy(fromScene);
  }
}