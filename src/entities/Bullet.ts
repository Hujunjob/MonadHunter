import Phaser from 'phaser';
import { Enemy } from './Enemy';

export class Bullet extends Phaser.Physics.Arcade.Sprite {
  constructor(scene: Phaser.Scene, x: number, y: number, _target: Enemy) {
    super(scene, x, y, 'bullet');
    
    scene.add.existing(this);
    scene.physics.add.existing(this);
    
    // Auto-destroy after 3 seconds
    scene.time.delayedCall(3000, () => {
      if (this.active) {
        this.destroy();
      }
    });
  }

  update() {
    // Remove if out of bounds
    if (this.x < -50 || this.x > 1050 || this.y < -50 || this.y > 750) {
      this.destroy();
    }
  }
}