import Phaser from 'phaser';
import { Enemy } from './Enemy';
import { Player } from './Player';
import { HealthBar } from '../components/HealthBar';

export class BossEnemy extends Enemy {
  private shootTimer: number = 0;
  private shootCooldown: number = 2000; // 2秒射击间隔
  private circularBurstTimer: number = 0;
  private circularBurstCooldown: number = 5000; // 5秒环形弹幕间隔
  private healthBar: HealthBar;

  constructor(scene: Phaser.Scene, x: number, y: number, player: Player, level: number, texture: string) {
    super(scene, x, y, player, level, texture);
    
    // Boss属性增强
    this.health = 200 + (level * 50); // 更高血量
    this.maxHealth = this.health;
    this.damage = 30 + (level * 5); // 更高攻击力
    this.speed = 40; // 稍慢但更强
    
    // 设置更大尺寸（2倍）
    this.setScale(2);
    
    // 创建血条
    this.healthBar = new HealthBar(scene, x, y - 80, 100, 8);
    this.healthBar.setHealth(this.health, this.maxHealth);
    
    // Boss特殊颜色效果
    this.setTint(0xff6b6b); // 红色调
  }

  update() {
    super.update();
    
    // Only perform boss actions if game is not paused
    if (!this.scene.physics.world.isPaused) {
      const currentTime = Date.now();
      
      // 更新血条位置
      this.healthBar.updatePosition(this.x, this.y - 80);
      this.healthBar.setHealth(this.health, this.maxHealth);
      
      // 普通射击
      if (currentTime - this.shootTimer > this.shootCooldown) {
        this.shootTimer = currentTime;
        this.shootAtPlayer();
      }
      
      // 10%概率发射环形弹幕
      if (currentTime - this.circularBurstTimer > this.circularBurstCooldown) {
        if (Math.random() < 0.1) { // 10%概率
          this.circularBurstTimer = currentTime;
          this.fireCircularBurst();
        }
      }
    }
  }

  private shootAtPlayer() {
    if (!this.player || !this.active) return;
    
    const angle = Phaser.Math.Angle.Between(this.x, this.y, this.player.x, this.player.y);
    
    // Boss发射3发子弹，呈扇形
    for (let i = -1; i <= 1; i++) {
      const spreadAngle = angle + (i * 0.2); // 扇形散布
      this.scene.events.emit('enemy-shoot', {
        x: this.x,
        y: this.y,
        angle: spreadAngle,
        speed: 200
      });
    }
  }

  private fireCircularBurst() {
    if (!this.active) return;
    
    const bulletCount = 16; // 环形弹幕数量
    const angleStep = (Math.PI * 2) / bulletCount;
    
    for (let i = 0; i < bulletCount; i++) {
      const angle = i * angleStep;
      this.scene.events.emit('enemy-shoot', {
        x: this.x,
        y: this.y,
        angle: angle,
        speed: 150
      });
    }
  }

  takeDamage(damage: number): boolean {
    const actualDamage = Math.max(1, damage);
    this.health -= actualDamage;
    
    // Boss受伤特效
    this.setTint(0xffffff);
    this.scene.time.delayedCall(100, () => {
      this.setTint(0xff6b6b);
    });
    
    return this.health <= 0;
  }

  isDead(): boolean {
    return this.health <= 0;
  }

  destroy(fromScene?: boolean): void {
    if (this.healthBar) {
      this.healthBar.destroy();
    }
    super.destroy(fromScene);
  }
}