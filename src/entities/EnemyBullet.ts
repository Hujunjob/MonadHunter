import Phaser from 'phaser';

export class EnemyBullet extends Phaser.Physics.Arcade.Sprite {
  private speed: number;
  public damage: number;

  constructor(scene: Phaser.Scene, x: number, y: number, angle: number, speed: number = 200) {
    super(scene, x, y, 'enemyBullet');
    
    this.speed = speed;
    this.damage = 15; // 敌人子弹伤害
    
    scene.add.existing(this);
    scene.physics.add.existing(this);
    
    // 设置子弹速度方向
    this.setVelocity(
      Math.cos(angle) * this.speed,
      Math.sin(angle) * this.speed
    );
    
    // 子弹超出边界时自动销毁
    this.scene.time.delayedCall(3000, () => {
      if (this.active) {
        this.destroy();
      }
    });
  }

  update() {
    // 检查是否超出游戏边界
    if (this.x < -50 || this.x > 1050 || this.y < -50 || this.y > 750) {
      this.destroy();
    }
  }
}