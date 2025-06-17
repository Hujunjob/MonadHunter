import Phaser from 'phaser';
import { Player } from '../entities/Player';
import { Enemy } from '../entities/Enemy';
import { Bullet } from '../entities/Bullet';
import { GameUI } from '../ui/GameUI';
import { MultiSynqManager } from '../sync/MultiSynqManager';
import { GameView } from '../sync/GameView';
import type { GameState } from '../sync/GameModel';

export class GameScene extends Phaser.Scene {
  private player!: Player;
  private enemies!: Phaser.Physics.Arcade.Group;
  private bullets!: Phaser.Physics.Arcade.Group;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private gameUI!: GameUI;
  private spaceKey!: Phaser.Input.Keyboard.Key;
  private enterKey!: Phaser.Input.Keyboard.Key;
  
  // MultiSynq integration
  private multiSynqManager!: MultiSynqManager;
  private gameView!: GameView;
  private isMultiSynqEnabled = false;
  
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
    // Initialize MultiSynq asynchronously
    this.initializeMultiSynq().then(() => {
      this.finishCreate();
    });
  }

  private async finishCreate() {
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
    
    // Record game start time
    this.gameStartTime = this.time.now;
    
    // Create player
    this.player = new Player(this, 400, 300, this.gameStats.playerSpeed);
    
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
    
    // Set initial anti-cheat status
    this.gameUI.setAntiCheatStatus(this.isMultiSynqEnabled);
    
    if (!this.isMultiSynqEnabled) {
      // Only set up local collisions if MultiSynq is not enabled
      this.physics.add.overlap(this.bullets, this.enemies, this.bulletHitEnemy, undefined, this);
      this.physics.add.overlap(this.player, this.enemies, this.playerHitEnemy, undefined, this);
      
      // Start local enemy spawning
      this.time.addEvent({
        delay: 667,
        callback: this.spawnEnemy,
        callbackScope: this,
        loop: true
      });
    } else {
      // Start synchronized game
      this.gameView.startGame();
    }
  }

  update() {
    if (this.isMultiSynqEnabled) {
      this.updateMultiSynq();
    } else {
      this.updateLocal();
    }
  }

  private updateLocal() {
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

  private updateMultiSynq() {
    // Send player input to MultiSynq model
    const direction = { x: 0, y: 0 };
    
    if (this.cursors.left.isDown) direction.x -= 1;
    if (this.cursors.right.isDown) direction.x += 1;
    if (this.cursors.up.isDown) direction.y -= 1;
    if (this.cursors.down.isDown) direction.y += 1;
    
    // Send movement input
    if (direction.x !== 0 || direction.y !== 0) {
      this.gameView.sendMoveInput(direction);
    }
    
    // Handle shooting input
    if (Phaser.Input.Keyboard.JustDown(this.spaceKey) || Phaser.Input.Keyboard.JustDown(this.enterKey)) {
      this.gameView.sendShootInput();
    }
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
    this.gameStats.playerSpeed += 25; // Increase speed by 25 each level
    
    // Update player speed
    this.player.setSpeed(this.gameStats.playerSpeed);
  }

  private gameOver() {
    // Stop enemy spawning and physics updates instead of pausing the whole scene
    this.physics.pause();
    
    // Add game over text
    this.add.text(400, 300, 'GAME OVER', {
      fontSize: '64px',
      color: '#ffffff'
    }).setOrigin(0.5);
    
    // Add restart instruction
    this.add.text(400, 370, 'Click Restart to play again', {
      fontSize: '24px',
      color: '#cccccc'
    }).setOrigin(0.5);
  }

  // MultiSynq initialization
  private async initializeMultiSynq() {
    try {
      // Ask user if they want to enable anti-cheat
      const enableAntiCheat = confirm(
        'Enable MultiSynq Anti-Cheat Protection?\n\n' +
        'This will prevent cheating by validating all game actions on the server.\n' +
        'Click OK to enable, or Cancel to play in local mode.'
      );

      if (!enableAntiCheat) {
        console.log('Playing in local mode');
        return;
      }

      const apiKey = await MultiSynqManager.getApiKey();
      this.multiSynqManager = new MultiSynqManager();
      
      const { view } = await this.multiSynqManager.initialize(apiKey);
      this.gameView = view;
      this.isMultiSynqEnabled = true;

      // Set up state update callback
      this.gameView.onStateChange((state: GameState) => {
        this.syncGameState(state);
      });

      // Set up game over callback
      this.gameView.onGameEnd((stats: any) => {
        console.log('Game ended with stats:', stats);
        this.gameOver();
      });

      console.log('MultiSynq anti-cheat enabled');
    } catch (error) {
      console.error('Failed to initialize MultiSynq, falling back to local mode:', error);
      this.isMultiSynqEnabled = false;
    }
  }

  // Sync game state from server
  private syncGameState(state: GameState) {
    // Update local game stats
    this.gameStats = {
      level: state.level,
      experience: state.experience,
      experienceToNext: state.experienceToNext,
      health: state.health,
      maxHealth: state.maxHealth,
      killCount: state.killCount,
      gameTime: state.gameTime,
      playerSpeed: state.playerSpeed
    };

    // Update player position
    this.player.setPosition(state.playerPosition.x, state.playerPosition.y);

    // Sync enemies
    this.syncEnemies(state.enemies);
    
    // Sync bullets
    this.syncBullets(state.bullets);

    // Update UI
    this.gameUI.update(this.gameStats);
  }

  private syncEnemies(serverEnemies: any[]) {
    // Clear existing enemies
    this.enemies.clear(true, true);

    // Create enemies from server state
    serverEnemies.forEach(enemyData => {
      const enemy = new Enemy(this, enemyData.x, enemyData.y, this.player, this.gameStats.level);
      enemy.setData('serverId', enemyData.id);
      enemy.setData('health', enemyData.health);
      this.enemies.add(enemy);
    });
  }

  private syncBullets(serverBullets: any[]) {
    // Clear existing bullets
    this.bullets.clear(true, true);

    // Create bullets from server state
    serverBullets.forEach(bulletData => {
      const bullet = new Bullet(this, bulletData.x, bulletData.y, { x: bulletData.targetX, y: bulletData.targetY } as any);
      bullet.setData('serverId', bulletData.id);
      bullet.setVelocity(
        (bulletData.targetX - bulletData.x) / Math.sqrt(Math.pow(bulletData.targetX - bulletData.x, 2) + Math.pow(bulletData.targetY - bulletData.y, 2)) * bulletData.speed,
        (bulletData.targetY - bulletData.y) / Math.sqrt(Math.pow(bulletData.targetX - bulletData.x, 2) + Math.pow(bulletData.targetY - bulletData.y, 2)) * bulletData.speed
      );
      this.bullets.add(bullet);
    });
  }
}