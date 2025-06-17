// @ts-ignore
declare const Multisynq: any;

export interface GameState {
  level: number;
  experience: number;
  experienceToNext: number;
  health: number;
  maxHealth: number;
  killCount: number;
  gameTime: number;
  playerSpeed: number;
  playerPosition: { x: number; y: number };
  enemies: Array<{
    id: string;
    x: number;
    y: number;
    health: number;
    maxHealth: number;
    speed: number;
  }>;
  bullets: Array<{
    id: string;
    x: number;
    y: number;
    targetX: number;
    targetY: number;
    speed: number;
  }>;
  gameStartTime: number;
  gameActive: boolean;
}

export interface PlayerInput {
  type: 'move' | 'shoot';
  direction?: { x: number; y: number };
  timestamp: number;
}

export class GameModel extends Multisynq.Model {
  private gameState: GameState = {
    level: 1,
    experience: 0,
    experienceToNext: 100,
    health: 100,
    maxHealth: 100,
    killCount: 0,
    gameTime: 0,
    playerSpeed: 200,
    playerPosition: { x: 400, y: 300 },
    enemies: [],
    bullets: [],
    gameStartTime: 0,
    gameActive: false
  };

  private enemySpawnTimer: number = 0;
  private enemySpawnInterval: number = 667; // milliseconds
  private enemyIdCounter: number = 0;
  private bulletIdCounter: number = 0;

  init() {
    this.subscribe('game', 'start', 'startGame');
    this.subscribe('game', 'restart', 'restartGame'); 
    this.subscribe('player', 'input', 'handlePlayerInput');
    this.subscribe('system', 'tick', 'gameTick');

    // Start game loop
    this.startGameLoop();
  }

  startGame() {
    this.gameState.gameStartTime = Date.now();
    this.gameState.gameActive = true;
    this.gameState.gameTime = 0;
    this.publish('game', 'state-update', this.gameState);
  }

  restartGame() {
    // Reset game state
    this.gameState = {
      level: 1,
      experience: 0,
      experienceToNext: 100,
      health: 100,
      maxHealth: 100,
      killCount: 0,
      gameTime: 0,
      playerSpeed: 200,
      playerPosition: { x: 400, y: 300 },
      enemies: [],
      bullets: [],
      gameStartTime: Date.now(),
      gameActive: true
    };
    
    this.enemyIdCounter = 0;
    this.bulletIdCounter = 0;
    this.enemySpawnTimer = 0;
    
    this.publish('game', 'state-update', this.gameState);
  }

  handlePlayerInput(input: PlayerInput) {
    if (!this.gameState.gameActive) return;

    const now = Date.now();
    
    // Validate input timing (prevent speed hacking)
    if (input.timestamp && Math.abs(now - input.timestamp) > 1000) {
      return; // Reject inputs with suspicious timestamps
    }

    switch (input.type) {
      case 'move':
        this.handlePlayerMove(input.direction!);
        break;
      case 'shoot':
        this.handlePlayerShoot();
        break;
    }
  }

  private handlePlayerMove(direction: { x: number; y: number }) {
    // Validate direction (prevent impossible movements)
    const magnitude = Math.sqrt(direction.x * direction.x + direction.y * direction.y);
    if (magnitude > 1.1) return; // Allow slight tolerance for floating point errors

    const deltaTime = 1/60; // Assume 60 FPS
    const moveDistance = this.gameState.playerSpeed * deltaTime;
    
    const newX = this.gameState.playerPosition.x + direction.x * moveDistance;
    const newY = this.gameState.playerPosition.y + direction.y * moveDistance;
    
    // Validate boundaries
    this.gameState.playerPosition.x = Math.max(16, Math.min(784, newX));
    this.gameState.playerPosition.y = Math.max(16, Math.min(584, newY));
    
    this.publish('player', 'position-update', this.gameState.playerPosition);
  }

  private handlePlayerShoot() {
    const nearestEnemy = this.findNearestEnemy();
    if (!nearestEnemy) return;

    const bullet = {
      id: `bullet_${this.bulletIdCounter++}`,
      x: this.gameState.playerPosition.x,
      y: this.gameState.playerPosition.y,
      targetX: nearestEnemy.x,
      targetY: nearestEnemy.y,
      speed: 400
    };

    this.gameState.bullets.push(bullet);
    this.publish('bullet', 'created', bullet);
  }

  private findNearestEnemy() {
    let nearest = null;
    let minDistance = Infinity;

    for (const enemy of this.gameState.enemies) {
      const distance = Math.sqrt(
        Math.pow(enemy.x - this.gameState.playerPosition.x, 2) +
        Math.pow(enemy.y - this.gameState.playerPosition.y, 2)
      );
      
      if (distance < minDistance) {
        minDistance = distance;
        nearest = enemy;
      }
    }

    return nearest;
  }

  private startGameLoop() {
    // Use Multisynq's future mechanism for game loop
    this.scheduleNextTick();
  }

  private scheduleNextTick() {
    this.future(16).publish('system', 'tick', {}); // ~60 FPS
  }

  gameTick() {
    if (!this.gameState.gameActive) {
      this.scheduleNextTick();
      return;
    }

    const now = Date.now();
    this.gameState.gameTime = Math.floor((now - this.gameState.gameStartTime) / 1000);

    // Update enemies
    this.updateEnemies();
    
    // Update bullets
    this.updateBullets();
    
    // Spawn enemies
    this.updateEnemySpawning();
    
    // Check collisions
    this.checkCollisions();
    
    // Check game over
    if (this.gameState.health <= 0) {
      this.gameState.gameActive = false;
      this.publish('game', 'over', {
        killCount: this.gameState.killCount,
        gameTime: this.gameState.gameTime,
        level: this.gameState.level
      });
    }

    // Publish state update
    this.publish('game', 'state-update', this.gameState);
    
    // Schedule next tick
    this.scheduleNextTick();
  }

  private updateEnemies() {
    for (let i = this.gameState.enemies.length - 1; i >= 0; i--) {
      const enemy = this.gameState.enemies[i];
      
      // Move enemy towards player
      const dx = this.gameState.playerPosition.x - enemy.x;
      const dy = this.gameState.playerPosition.y - enemy.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      if (distance > 0) {
        const deltaTime = 1/60;
        enemy.x += (dx / distance) * enemy.speed * deltaTime;
        enemy.y += (dy / distance) * enemy.speed * deltaTime;
      }
      
      // Remove enemies that are too far offscreen
      if (enemy.x < -100 || enemy.x > 900 || enemy.y < -100 || enemy.y > 700) {
        this.gameState.enemies.splice(i, 1);
      }
    }
  }

  private updateBullets() {
    for (let i = this.gameState.bullets.length - 1; i >= 0; i--) {
      const bullet = this.gameState.bullets[i];
      
      // Move bullet towards target
      const dx = bullet.targetX - bullet.x;
      const dy = bullet.targetY - bullet.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      if (distance > 0) {
        const deltaTime = 1/60;
        bullet.x += (dx / distance) * bullet.speed * deltaTime;
        bullet.y += (dy / distance) * bullet.speed * deltaTime;
      }
      
      // Remove bullets that are offscreen
      if (bullet.x < -50 || bullet.x > 850 || bullet.y < -50 || bullet.y > 650) {
        this.gameState.bullets.splice(i, 1);
      }
    }
  }

  private updateEnemySpawning() {
    this.enemySpawnTimer += 16; // 16ms per tick
    
    if (this.enemySpawnTimer >= this.enemySpawnInterval) {
      this.spawnEnemy();
      this.enemySpawnTimer = 0;
    }
  }

  private spawnEnemy() {
    const side = Math.floor(Math.random() * 4);
    let x, y;
    
    switch (side) {
      case 0: // top
        x = Math.random() * 800;
        y = -50;
        break;
      case 1: // right
        x = 850;
        y = Math.random() * 600;
        break;
      case 2: // bottom
        x = Math.random() * 800;
        y = 650;
        break;
      case 3: // left
        x = -50;
        y = Math.random() * 600;
        break;
      default:
        x = 0;
        y = 0;
    }
    
    const enemy = {
      id: `enemy_${this.enemyIdCounter++}`,
      x,
      y,
      health: 25 + (this.gameState.level - 1) * 10,
      maxHealth: 25 + (this.gameState.level - 1) * 10,
      speed: 50 + (this.gameState.level - 1) * 10
    };
    
    this.gameState.enemies.push(enemy);
  }

  private checkCollisions() {
    // Bullet-enemy collisions
    for (let i = this.gameState.bullets.length - 1; i >= 0; i--) {
      const bullet = this.gameState.bullets[i];
      
      for (let j = this.gameState.enemies.length - 1; j >= 0; j--) {
        const enemy = this.gameState.enemies[j];
        
        const distance = Math.sqrt(
          Math.pow(bullet.x - enemy.x, 2) + Math.pow(bullet.y - enemy.y, 2)
        );
        
        if (distance < 20) { // Hit detection
          this.gameState.bullets.splice(i, 1);
          enemy.health -= 25;
          
          if (enemy.health <= 0) {
            this.gameState.enemies.splice(j, 1);
            this.gameState.killCount++;
            this.gameState.experience += 10;
            
            if (this.gameState.experience >= this.gameState.experienceToNext) {
              this.levelUp();
            }
          }
          break;
        }
      }
    }

    // Player-enemy collisions
    for (let i = this.gameState.enemies.length - 1; i >= 0; i--) {
      const enemy = this.gameState.enemies[i];
      
      const distance = Math.sqrt(
        Math.pow(this.gameState.playerPosition.x - enemy.x, 2) +
        Math.pow(this.gameState.playerPosition.y - enemy.y, 2)
      );
      
      if (distance < 25) { // Hit detection
        this.gameState.health -= 10;
        this.gameState.enemies.splice(i, 1);
        
        // Validate health doesn't go below 0
        this.gameState.health = Math.max(0, this.gameState.health);
      }
    }
  }

  private levelUp() {
    this.gameState.level++;
    this.gameState.experience = 0;
    this.gameState.experienceToNext = Math.floor(this.gameState.experienceToNext * 1.2);
    this.gameState.maxHealth += 20;
    this.gameState.health = this.gameState.maxHealth;
    this.gameState.playerSpeed += 25;
    
    this.publish('player', 'level-up', {
      level: this.gameState.level,
      speed: this.gameState.playerSpeed
    });
  }

  // Getter methods for state (read-only access)
  getGameState(): GameState {
    return { ...this.gameState }; // Return copy to prevent modification
  }
}