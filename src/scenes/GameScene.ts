import Phaser from 'phaser';
import { Player } from '../entities/Player';
import { Enemy } from '../entities/Enemy';
import { Bullet } from '../entities/Bullet';
import { GameUI } from '../ui/GameUI';

export class GameScene extends Phaser.Scene {
  private player!: Player;
  private enemies!: Phaser.Physics.Arcade.Group;
  private bullets!: Phaser.Physics.Arcade.Group;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private gameUI!: GameUI;
  private spaceKey!: Phaser.Input.Keyboard.Key;
  private enterKey!: Phaser.Input.Keyboard.Key;
  
  private gameStats = {
    level: 1,
    experience: 0,
    experienceToNext: 100,
    health: 100,
    maxHealth: 100,
    killCount: 0,
    gameTime: 0,
    playerSpeed: 200
  };
  private maxEnemies: number = 20;
  private lastCleanupTime: number = 0;
  private gameStartTime!: number;
  private isGameOver: boolean = false;

  constructor() {
    super({ key: 'GameScene' });
  }

  preload() {
    // Create simple colored rectangles as placeholders
    this.add.graphics()
      .fillStyle(0x00ff00)
      .fillRect(0, 0, 32, 32)
      .generateTexture('player', 32, 32);
      
    this.add.graphics()
      .fillStyle(0xff0000)
      .fillRect(0, 0, 24, 24)
      .generateTexture('enemy', 24, 24);
      
    this.add.graphics()
      .fillStyle(0xffff00)
      .fillRect(0, 0, 8, 8)
      .generateTexture('bullet', 8, 8);
  }

  create() {
    // Reset game stats
    this.gameStats = {
      level: 1,
      experience: 0,
      experienceToNext: 100,
      health: 100,
      maxHealth: 100,
      killCount: 0,
      gameTime: 0,
      playerSpeed: 200
    };
    
    // Reset game state flags
    this.isGameOver = false;
    
    // Adjust max enemies based on level for performance
    this.maxEnemies = Math.min(20 + this.gameStats.level * 2, 40);
    
    // Record game start time using real timestamp
    this.gameStartTime = Date.now();
    console.log("create time ",this.gameStartTime);
    
    
    // Create player
    this.player = new Player(this, 500, 350, this.gameStats.playerSpeed);
    
    // Create groups
    this.enemies = this.physics.add.group({
      classType: Enemy,
      runChildUpdate: true
    });
    
    this.bullets = this.physics.add.group({
      classType: Bullet,
      runChildUpdate: true
    });
    
    // Create input
    this.cursors = this.input.keyboard?.createCursorKeys()!;
    this.spaceKey = this.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE)!;
    this.enterKey = this.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER)!;
    
    // Create UI
    this.gameUI = new GameUI(this, this.gameStats);
    
    // Set wallet status
    this.updateWalletStatus();
    
    // Set up collisions
    this.physics.add.overlap(this.bullets, this.enemies, this.bulletHitEnemy, undefined, this);
    this.physics.add.overlap(this.player, this.enemies, this.playerHitEnemy, undefined, this);
    
    // Start enemy spawning with dynamic rate
    this.time.addEvent({
      delay: 500,
      callback: this.spawnEnemy,
      callbackScope: this,
      loop: true
    });
    
    // Add cleanup timer
    this.time.addEvent({
      delay: 5000,
      callback: this.cleanupObjects,
      callbackScope: this,
      loop: true
    });
  }

  update() {
    if (this.isGameOver) {
      return;
    }
    
    this.player.update(this.cursors);
    
    // Update game time using real timestamp
    this.gameStats.gameTime = Math.floor((Date.now() - this.gameStartTime) / 1000);
    
    // Handle shooting input with rate limiting
    if (Phaser.Input.Keyboard.JustDown(this.spaceKey) || Phaser.Input.Keyboard.JustDown(this.enterKey)) {
      this.shoot();
    }
    
    // Throttled cleanup every 2 seconds
    if (this.time.now - this.lastCleanupTime > 2000) {
      this.lastCleanupTime = this.time.now;
      this.quickCleanup();
    }
    
    // Update UI
    this.gameUI.update(this.gameStats);
  }
  
  private quickCleanup() {
    // Quick cleanup of out-of-bounds objects
    this.bullets.children.entries.forEach((bullet) => {
      const b = bullet as Phaser.Physics.Arcade.Sprite;
      if (b.x < -100 || b.x > 1100 || b.y < -100 || b.y > 800) {
        b.destroy();
      }
    });
  }

  private spawnEnemy() {
    // Limit enemy count for performance
    if (this.enemies.children.size >= this.maxEnemies) {
      return;
    }
    
    const side = Phaser.Math.Between(0, 3);
    let x, y;
    
    switch (side) {
      case 0: // top
        x = Phaser.Math.Between(0, 1000);
        y = -50;
        break;
      case 1: // right
        x = 1050;
        y = Phaser.Math.Between(0, 700);
        break;
      case 2: // bottom
        x = Phaser.Math.Between(0, 1000);
        y = 750;
        break;
      case 3: // left
        x = -50;
        y = Phaser.Math.Between(0, 700);
        break;
      default:
        x = 0;
        y = 0;
    }
    
    const enemy = new Enemy(this, x, y, this.player, this.gameStats.level);
    this.enemies.add(enemy);
  }
  
  private cleanupObjects() {
    // Clean up distant bullets
    this.bullets.children.entries.forEach((bullet) => {
      const b = bullet as Phaser.Physics.Arcade.Sprite;
      const distance = Phaser.Math.Distance.Between(
        this.player.x, this.player.y, b.x, b.y
      );
      if (distance > 1000) {
        b.destroy();
      }
    });
    
    // Clean up distant enemies if too many
    if (this.enemies.children.size > this.maxEnemies * 0.8) {
      const sortedEnemies = this.enemies.children.entries
        .map(e => {
          const enemy = e as Phaser.Physics.Arcade.Sprite;
          return { enemy, distance: Phaser.Math.Distance.Between(this.player.x, this.player.y, enemy.x, enemy.y) };
        })
        .sort((a, b) => b.distance - a.distance);
      
      // Remove the furthest 20% of enemies
      const toRemove = Math.floor(sortedEnemies.length * 0.2);
      for (let i = 0; i < toRemove; i++) {
        sortedEnemies[i].enemy.destroy();
      }
    }
  }

  private shoot() {
    const nearestEnemy = this.findNearestEnemy();
    if (nearestEnemy) {
      const bullet = new Bullet(this, this.player.x, this.player.y, nearestEnemy);
      this.bullets.add(bullet);
      
      // Ensure velocity is set after adding to group
      const angle = Phaser.Math.Angle.Between(this.player.x, this.player.y, nearestEnemy.x, nearestEnemy.y);
      bullet.setVelocity(
        Math.cos(angle) * 400,
        Math.sin(angle) * 400
      );
    }
  }

  private findNearestEnemy(): Enemy | null {
    let nearest: Enemy | null = null;
    let minDistance = Infinity;
    
    this.enemies.children.entries.forEach((enemy) => {
      const enemySprite = enemy as Enemy;
      const distance = Phaser.Math.Distance.Between(
        this.player.x, this.player.y,
        enemySprite.x, enemySprite.y
      );
      
      if (distance < minDistance) {
        minDistance = distance;
        nearest = enemySprite;
      }
    });
    
    return nearest;
  }

  private bulletHitEnemy(bullet: any, enemy: any) {
    bullet.destroy();
    enemy.takeDamage(25);
    
    if (enemy.isDead()) {
      this.gameStats.killCount++;
      this.gameStats.experience += 10;
      if (this.gameStats.experience >= this.gameStats.experienceToNext) {
        this.levelUp();
      }
    }
  }

  private playerHitEnemy(_player: any, enemy: any) {
    this.gameStats.health -= 10;
    enemy.destroy();
    
    if (this.gameStats.health <= 0) {
      this.gameOver();
    }
  }

  private levelUp() {
    this.gameStats.level++;
    this.gameStats.experience = 0;
    this.gameStats.experienceToNext = Math.floor(this.gameStats.experienceToNext * 1.2);
    this.gameStats.maxHealth += 20;
    this.gameStats.health = this.gameStats.maxHealth;
    this.gameStats.playerSpeed += 25; // Increase speed by 25 each level (more balanced)
    
    // Update player speed
    this.player.setSpeed(this.gameStats.playerSpeed);
  }

  private gameOver() {
    // Set game over flag to stop timer and updates
    this.isGameOver = true;
    
    // Stop enemy spawning and physics updates instead of pausing the whole scene
    this.physics.pause();
    
    // Add game over text
    this.add.text(500, 350, 'GAME OVER', {
      fontSize: '64px',
      color: '#ffffff'
    }).setOrigin(0.5);
    
    // Add restart instruction
    this.add.text(500, 420, 'Click Back to Menu to play again', {
      fontSize: '24px',
      color: '#cccccc'
    }).setOrigin(0.5);
  }

  private updateWalletStatus() {
    // Try to get wallet info from global window object (set by App component)
    const walletInfo = (window as any).__WALLET_INFO__;
    if (walletInfo) {
      this.gameUI.setWalletStatus({
        connected: walletInfo.connected,
        address: walletInfo.address
      });
    } else {
      // Fallback - no wallet connected
      this.gameUI.setWalletStatus({
        connected: false
      });
    }
  }
}