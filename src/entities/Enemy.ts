import Phaser from 'phaser';
import { Player } from './Player';

export class Enemy extends Phaser.Physics.Arcade.Sprite {
  private speed: number;
  private health: number;
  private maxHealth: number;
  private player: Player;

  constructor(scene: Phaser.Scene, x: number, y: number, player: Player, level: number = 1) {
    super(scene, x, y, 'enemy');
    
    this.player = player;
    
    // Scale stats based on level
    this.speed = (80 + (level - 1) * 12) * 2; // Base 240, +45 per level (3x faster)
    this.maxHealth = 50 + (level - 1) * 15; // Base 50, +20 per level
    this.health = this.maxHealth;
    
    scene.add.existing(this);
    scene.physics.add.existing(this);
  }

  update() {
    if (this.player && this.active) {
      // Move towards player
      const angle = Phaser.Math.Angle.Between(this.x, this.y, this.player.x, this.player.y);
      this.setVelocity(
        Math.cos(angle) * this.speed,
        Math.sin(angle) * this.speed
      );
    }
  }

  takeDamage(damage: number) {
    this.health -= damage;
    
    // Flash red when hit
    this.setTint(0xff0000);
    this.scene.time.delayedCall(100, () => {
      this.clearTint();
    });
    
    if (this.health <= 0) {
      this.destroy();
    }
  }

  isDead(): boolean {
    return this.health <= 0;
  }
}