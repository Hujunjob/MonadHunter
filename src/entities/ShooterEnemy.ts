import Phaser from 'phaser';
import { Player } from './Player';
import { Enemy } from './Enemy';

export class ShooterEnemy extends Enemy {
  private lastShotTime: number = 0;
  private shootInterval: number = 800; // 每1.5秒射击一次
  private shootRange: number = 550; // 增加射击范围

  constructor(scene: Phaser.Scene, x: number, y: number, player: Player, level: number = 1, texture: string = 'monadbullet') {
    super(scene, x, y, player, level, texture);
    this.shootInterval = Math.max(800, 1500 - (level - 1) * 100); // 等级越高射击越频繁
  }

  update() {
    super.update();
    
    // Only shoot if game is not paused
    if (!this.scene.physics.world.isPaused && this.player && this.active) {
      const distance = Phaser.Math.Distance.Between(this.x, this.y, this.player.x, this.player.y);
      
      // 在射击范围内且冷却时间已过
      if (distance <= this.shootRange && this.scene.time.now - this.lastShotTime > this.shootInterval) {
        this.shoot();
        this.lastShotTime = this.scene.time.now;
      }
    }
  }

  private shoot() {
    // 创建敌人子弹
    const angle = Phaser.Math.Angle.Between(this.x, this.y, this.player.x, this.player.y);
    
    // 通知场景创建敌人子弹
    this.scene.events.emit('enemy-shoot', {
      x: this.x,
      y: this.y,
      angle: angle,
      speed: 350 // 提高子弹速度
    });
  }
}