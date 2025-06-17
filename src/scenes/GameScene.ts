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
    gameTime: 0
  };
  private gameStartTime!: number;

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
    // Record game start time
    this.gameStartTime = this.time.now;
    
    // Create player
    this.player = new Player(this, 400, 300);
    
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
    
    // Set up collisions
    this.physics.add.overlap(this.bullets, this.enemies, this.bulletHitEnemy, undefined, this);
    this.physics.add.overlap(this.player, this.enemies, this.playerHitEnemy, undefined, this);
    
    // Start spawning enemies
    this.time.addEvent({
      delay: 667,
      callback: this.spawnEnemy,
      callbackScope: this,
      loop: true
    });
  }

  update() {
    this.player.update(this.cursors);
    
    // Update game time
    this.gameStats.gameTime = Math.floor((this.time.now - this.gameStartTime) / 1000);
    
    // Handle shooting input
    if (Phaser.Input.Keyboard.JustDown(this.spaceKey) || Phaser.Input.Keyboard.JustDown(this.enterKey)) {
      this.shoot();
    }
    
    // Update UI
    this.gameUI.update(this.gameStats);
  }

  private spawnEnemy() {
    const side = Phaser.Math.Between(0, 3);
    let x, y;
    
    switch (side) {
      case 0: // top
        x = Phaser.Math.Between(0, 800);
        y = -50;
        break;
      case 1: // right
        x = 850;
        y = Phaser.Math.Between(0, 600);
        break;
      case 2: // bottom
        x = Phaser.Math.Between(0, 800);
        y = 650;
        break;
      case 3: // left
        x = -50;
        y = Phaser.Math.Between(0, 600);
        break;
      default:
        x = 0;
        y = 0;
    }
    
    const enemy = new Enemy(this, x, y, this.player, this.gameStats.level);
    this.enemies.add(enemy);
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
  }

  private gameOver() {
    this.scene.pause();
    this.add.text(400, 300, 'GAME OVER', {
      fontSize: '64px',
      color: '#ffffff'
    }).setOrigin(0.5);
  }
}