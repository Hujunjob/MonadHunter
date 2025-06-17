import Phaser from 'phaser';
import { Enemy } from './Enemy';

export class Bullet extends Phaser.Physics.Arcade.Sprite {
  private speed = 400;
  private target: Enemy;

  constructor(scene: Phaser.Scene, x: number, y: number, target: Enemy) {
    super(scene, x, y, 'bullet');
    
    this.target = target;
    
    scene.add.existing(this);
    scene.physics.add.existing(this);
    
    // Calculate direction to target
    const angle = Phaser.Math.Angle.Between(x, y, target.x, target.y);
    this.setVelocity(
      Math.cos(angle) * this.speed,
      Math.sin(angle) * this.speed
    );
    
    // Auto-destroy after 3 seconds
    scene.time.delayedCall(3000, () => {
      if (this.active) {
        this.destroy();
      }
    });
  }

  update() {
    // Remove if out of bounds
    if (this.x < -50 || this.x > 850 || this.y < -50 || this.y > 650) {
      this.destroy();
    }
  }
}