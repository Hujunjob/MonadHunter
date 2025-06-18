import Phaser from 'phaser';

export class HealthBar {
  private background: Phaser.GameObjects.Graphics;
  private bar: Phaser.GameObjects.Graphics;
  private width: number;
  private height: number;
  private maxHealth: number;
  private currentHealth: number;

  constructor(scene: Phaser.Scene, x: number, y: number, width: number = 40, height: number = 6) {
    this.width = width;
    this.height = height;
    this.maxHealth = 100;
    this.currentHealth = 100;

    // Create background
    this.background = scene.add.graphics();
    this.background.fillStyle(0x000000, 0.6);
    this.background.fillRect(x - width / 2, y, width, height);

    // Create health bar
    this.bar = scene.add.graphics();
    this.updateHealthBar(x, y);
  }

  public setHealth(current: number, max: number): void {
    this.currentHealth = Math.max(0, current);
    this.maxHealth = Math.max(1, max);
  }

  public updatePosition(x: number, y: number): void {
    this.background.clear();
    this.background.fillStyle(0x000000, 0.6);
    this.background.fillRect(x - this.width / 2, y, this.width, this.height);
    
    this.updateHealthBar(x, y);
  }

  private updateHealthBar(x: number, y: number): void {
    this.bar.clear();
    
    const healthPercentage = this.currentHealth / this.maxHealth;
    const barWidth = this.width * healthPercentage;
    
    // Choose color based on health percentage
    let color = 0x00ff00; // Green
    if (healthPercentage < 0.6) {
      color = 0xffff00; // Yellow
    }
    if (healthPercentage < 0.3) {
      color = 0xff0000; // Red
    }
    
    this.bar.fillStyle(color);
    this.bar.fillRect(x - this.width / 2, y, barWidth, this.height);
  }

  public destroy(): void {
    if (this.background) {
      this.background.destroy();
    }
    if (this.bar) {
      this.bar.destroy();
    }
  }

  public setVisible(visible: boolean): void {
    this.background.setVisible(visible);
    this.bar.setVisible(visible);
  }
}