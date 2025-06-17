import Phaser from 'phaser';
import { Player } from './Player';

export class Enemy extends Phaser.Physics.Arcade.Sprite {
  private speed: number;
  private health: number;
  private maxHealth: number;
  protected player: Player;
  public damage: number;

  constructor(scene: Phaser.Scene, x: number, y: number, player: Player, level: number = 1) {
    super(scene, x, y, 'enemy');
    
    this.player = player;
    
    // Scale stats based on level
    this.speed = 100 + (level - 1) * 15; // Base 60, +10 per level
    this.maxHealth = 50 + (level - 1) * 15; // Base 50, +15 per level
    this.health = this.maxHealth;
    this.damage = 10 + (level - 1) * 3; // Base 10, +3 per level
    
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