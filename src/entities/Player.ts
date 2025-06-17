import Phaser from 'phaser';

export class Player extends Phaser.Physics.Arcade.Sprite {
  private speed = 200;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 'player');
    
    scene.add.existing(this);
    scene.physics.add.existing(this);
    
    this.setCollideWorldBounds(true);
  }

  update(cursors: Phaser.Types.Input.Keyboard.CursorKeys) {
    this.setVelocity(0);

    if (cursors.left.isDown) {
      this.setVelocityX(-this.speed);
    } else if (cursors.right.isDown) {
      this.setVelocityX(this.speed);
    }

    if (cursors.up.isDown) {
      this.setVelocityY(-this.speed);
    } else if (cursors.down.isDown) {
      this.setVelocityY(this.speed);
    }
  }
}