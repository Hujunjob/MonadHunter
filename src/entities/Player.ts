import Phaser from 'phaser';

export interface PlayerStats {
  speed: number;
  bulletCount: number;
  defense: number;
  maxHealth: number;
  health: number;
}

export class Player extends Phaser.Physics.Arcade.Sprite {
  public stats: PlayerStats;

  constructor(scene: Phaser.Scene, x: number, y: number, initialStats?: Partial<PlayerStats>) {
    super(scene, x, y, 'player');
    
    this.stats = {
      speed: 200,
      bulletCount: 1,
      defense: 0,
      maxHealth: 100,
      health: 100,
      ...initialStats
    };
    
    scene.add.existing(this);
    scene.physics.add.existing(this);
    
    this.setCollideWorldBounds(true);
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
  }

  updateStats(newStats: Partial<PlayerStats>) {
    this.stats = { ...this.stats, ...newStats };
  }

  takeDamage(damage: number): number {
    const actualDamage = Math.max(1, damage - this.stats.defense);
    this.stats.health = Math.max(0, this.stats.health - actualDamage);
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
}