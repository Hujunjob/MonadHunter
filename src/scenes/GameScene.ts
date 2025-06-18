import Phaser from 'phaser';
import { Player } from '../entities/Player';
import type { PlayerStats } from '../entities/Player';
import { Enemy } from '../entities/Enemy';
import { ShooterEnemy } from '../entities/ShooterEnemy';
import { BossEnemy } from '../entities/BossEnemy';
import { Bullet } from '../entities/Bullet';
import { EnemyBullet } from '../entities/EnemyBullet';
import { GameUI } from '../ui/GameUI';

export class GameScene extends Phaser.Scene {
  private player!: Player;
  private enemies!: Phaser.Physics.Arcade.Group;
  private bullets!: Phaser.Physics.Arcade.Group;
  private enemyBullets!: Phaser.Physics.Arcade.Group;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private gameUI!: GameUI;
  private spaceKey!: Phaser.Input.Keyboard.Key;
  private enterKey!: Phaser.Input.Keyboard.Key;
  private pKey!: Phaser.Input.Keyboard.Key;
  
  private gameStats = {
    level: 1,
    experience: 0,
    experienceToNext: 100,
    health: 100,
    maxHealth: 100,
    killCount: 0,
    coins: 0,
    gameTime: 0,
    playerStats: {
      speed: 200,
      bulletCount: 1,
      defense: 0,
      maxHealth: 100,
      health: 100,
      attack: 25
    } as PlayerStats
  };
  private maxEnemies: number = 20;
  private lastCleanupTime: number = 0;
  private gameStartTime!: number;
  private isGameOver: boolean = false;
  private isUpgradeModalOpen: boolean = false;
  private pendingUpgradeOptions: any[] = [];
  private circleBurstLevel: number = 0;
  private isPaused: boolean = false;
  private lastPauseToggleTime: number = 0;
  private itemPurchaseCounts: { [key: string]: number } = {};
  private currentBoss: BossEnemy | null = null;
  private bossDefeated: boolean = false;
  private enemySpawnTimer: Phaser.Time.TimerEvent | null = null;

  constructor() {
    super({ key: 'GameScene' });
  }

  preload() {
    // Load horse icon for player
    this.load.image('player', '/horseicon.png');
    
    // Load enemy sprites
    this.load.image('monad1', '/monad1.png');
    this.load.image('monad2', '/monad2.png');
    this.load.image('monadbullet', '/monadbullet.png');
    
    // Load gold coin
    this.load.image('gold', '/gold.png');
      
    this.add.graphics()
      .fillStyle(0xffff00)
      .fillRect(0, 0, 8, 8)
      .generateTexture('bullet', 8, 8);
      
    this.add.graphics()
      .fillStyle(0xff3300) // 改为鲜红色，更明显
      .fillRect(0, 0, 8, 8) // 增大尺寸
      .generateTexture('enemyBullet', 8, 8);
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
      coins: 0,
      gameTime: 0,
      playerStats: {
        speed: 200,
        bulletCount: 1,
        defense: 0,
        maxHealth: 100,
        health: 100,
        attack: 25
      }
    };
    
    // Reset game state flags
    this.isGameOver = false;
    this.isUpgradeModalOpen = false;
    this.pendingUpgradeOptions = [];
    this.circleBurstLevel = 0;
    
    // Adjust max enemies based on level for performance
    this.maxEnemies = Math.min(20 + this.gameStats.level * 2, 40);
    
    // Record game start time using real timestamp
    this.gameStartTime = Date.now();
    console.log("create time ",this.gameStartTime);
    
    
    // Create player
    this.player = new Player(this, 500, 350, this.gameStats.playerStats);
    
    // Create groups
    this.enemies = this.physics.add.group({
      classType: Enemy,
      runChildUpdate: true
    });
    
    this.bullets = this.physics.add.group({
      classType: Bullet,
      runChildUpdate: true
    });
    
    this.enemyBullets = this.physics.add.group({
      classType: EnemyBullet,
      runChildUpdate: true
    });
    
    // Create input
    this.cursors = this.input.keyboard?.createCursorKeys()!;
    this.spaceKey = this.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE)!;
    this.enterKey = this.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER)!;
    this.pKey = this.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.P)!;
    
    // Create UI
    this.gameUI = new GameUI(this, this.gameStats);
    
    // Set wallet status
    this.updateWalletStatus();
    
    // Set up collisions
    this.physics.add.overlap(this.bullets, this.enemies, this.bulletHitEnemy, undefined, this);
    this.physics.add.overlap(this.player, this.enemies, this.playerHitEnemy, undefined, this);
    this.physics.add.overlap(this.player, this.enemyBullets, this.playerHitByEnemyBullet, undefined, this);
    
    // 监听敌人射击事件
    this.events.on('enemy-shoot', this.createEnemyBullet, this);
    
    // Start enemy spawning with dynamic rate
    this.startEnemySpawning();
    
    // Add cleanup timer
    this.time.addEvent({
      delay: 5000,
      callback: this.cleanupObjects,
      callbackScope: this,
      loop: true
    });
  }

  update() {
    // Handle pause key with debounce
    if (Phaser.Input.Keyboard.JustDown(this.pKey)) {
      const currentTime = Date.now();
      if (currentTime - this.lastPauseToggleTime > 500) { // 500ms debounce
        this.lastPauseToggleTime = currentTime;
        this.togglePause();
      }
    }

    if (this.isGameOver || this.isUpgradeModalOpen || this.isPaused) {
      return;
    }
    
    this.player.update(this.cursors);
    
    // Sync game stats with player stats
    this.gameStats.health = this.player.stats.health;
    this.gameStats.maxHealth = this.player.stats.maxHealth;
    
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
    
    // Check boss status
    this.checkBossStatus();
    
    // Update UI
    this.gameUI.update({
      ...this.gameStats,
      circleBurstLevel: this.circleBurstLevel
    });
  }
  
  private quickCleanup() {
    // Quick cleanup of out-of-bounds objects
    this.bullets.children.entries.forEach((bullet) => {
      const b = bullet as Phaser.Physics.Arcade.Sprite;
      if (b.x < -100 || b.x > 1100 || b.y < -100 || b.y > 800) {
        b.destroy();
      }
    });
    
    this.enemyBullets.children.entries.forEach((bullet) => {
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
    
    // 随机决定敌人类型，射击敌人出现概率随等级增加
    const shooterChance = Math.min(0.3, 0.1 + (this.gameStats.level - 1) * 0.05); // 10%-30%
    let enemy;
    
    if (Math.random() < shooterChance) {
      // 射击敌人使用 monadbullet 头像
      enemy = new ShooterEnemy(this, x, y, this.player, this.gameStats.level, 'monadbullet');
    } else {
      // 普通敌人随机选择 monad1 或 monad2 头像
      const normalEnemyTextures = ['monad1', 'monad2'];
      const randomTexture = normalEnemyTextures[Math.floor(Math.random() * normalEnemyTextures.length)];
      enemy = new Enemy(this, x, y, this.player, this.gameStats.level, randomTexture);
    }
    
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
    // 检查是否触发环形弹幕
    if (this.circleBurstLevel > 0) {
      const circleBurstChance = this.circleBurstLevel * 5; // 每级5%概率
      if (Math.random() * 100 < circleBurstChance) {
        this.fireCircleBurst();
        return; // 发射环形弹幕时不发射普通子弹
      }
    }
    
    const nearestEnemy = this.findNearestEnemy();
    if (nearestEnemy) {
      // Fire multiple bullets based on bulletCount
      const bulletCount = this.player.stats.bulletCount;
      const angleSpread = bulletCount > 1 ? Math.PI / 6 : 0; // 30 degree spread for multiple bullets
      
      for (let i = 0; i < bulletCount; i++) {
        const bullet = new Bullet(this, this.player.x, this.player.y, nearestEnemy);
        this.bullets.add(bullet);
        
        // Calculate angle with spread for multiple bullets
        let baseAngle = Phaser.Math.Angle.Between(this.player.x, this.player.y, nearestEnemy.x, nearestEnemy.y);
        if (bulletCount > 1) {
          const offsetAngle = (i - (bulletCount - 1) / 2) * (angleSpread / (bulletCount - 1));
          baseAngle += offsetAngle;
        }
        
        bullet.setVelocity(
          Math.cos(baseAngle) * 400,
          Math.sin(baseAngle) * 400
        );
      }
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
    // Don't process collisions when game is paused
    if (this.isPaused || this.isUpgradeModalOpen) {
      return;
    }
    
    bullet.destroy();
    enemy.takeDamage(this.player.stats.attack);
    
    if (enemy.isDead()) {
      this.gameStats.killCount++;
      this.gameStats.coins++; // 击杀1获得金币1
      this.gameStats.experience += 10;
      
      // 显示金币弹出效果
      this.showCoinPopup(enemy.x, enemy.y, 1);
      
      if (this.gameStats.experience >= this.gameStats.experienceToNext) {
        this.levelUp();
      }
    }
  }

  private playerHitEnemy(_player: any, enemy: any) {
    // Don't process collisions when game is paused
    if (this.isPaused || this.isUpgradeModalOpen) {
      return;
    }
    
    // Boss不会被碰撞销毁，只有普通敌人才会
    if (enemy instanceof BossEnemy) {
      // Boss碰撞后短暂无敌，避免连续伤害
      if (!enemy.isInvulnerable) {
        this.player.takeDamage(enemy.damage || 10);
        enemy.isInvulnerable = true;
        // Boss变透明表示无敌状态
        enemy.setAlpha(0.5);
        this.time.delayedCall(1000, () => {
          if (enemy.active) {
            enemy.isInvulnerable = false;
            enemy.setAlpha(1);
          }
        });
      }
      // Boss在无敌状态时不造成伤害，直接返回
    } else {
      // 普通敌人造成伤害并销毁
      this.player.takeDamage(enemy.damage || 10);
      enemy.destroy();
    }
    
    if (this.player.isDead()) {
      this.gameOver();
    }
  }

  private playerHitByEnemyBullet(_player: any, enemyBullet: any) {
    // Don't process collisions when game is paused
    if (this.isPaused || this.isUpgradeModalOpen) {
      return;
    }
    
    this.player.takeDamage(enemyBullet.damage || 15);
    enemyBullet.destroy();
    
    if (this.player.isDead()) {
      this.gameOver();
    }
  }

  private createEnemyBullet(bulletData: any) {
    // 直接通过group创建bullet，这样可以确保正确的physics设置
    const enemyBullet = this.enemyBullets.create(bulletData.x, bulletData.y, 'enemyBullet') as EnemyBullet;
    
    // 设置bullet属性
    enemyBullet.damage = 20; // 提高敌人子弹伤害
    
    // 设置速度
    enemyBullet.setVelocity(
      Math.cos(bulletData.angle) * bulletData.speed,
      Math.sin(bulletData.angle) * bulletData.speed
    );
    
    // 设置自动销毁
    this.time.delayedCall(3000, () => {
      if (enemyBullet.active) {
        enemyBullet.destroy();
      }
    });
  }

  private levelUp() {
    this.gameStats.level++;
    this.gameStats.experience = 0;
    this.gameStats.experienceToNext = Math.floor(this.gameStats.experienceToNext * 1.2);
    
    // 升级时自动提升血量上限和回复血量
    const healthIncrease = 20;
    this.player.updateStats({ 
      maxHealth: this.player.stats.maxHealth + healthIncrease 
    });
    this.player.heal(healthIncrease); // 升级时恢复新增的血量
    this.gameStats.maxHealth = this.player.stats.maxHealth;
    this.gameStats.health = this.player.stats.health;
    
    // 更新敌人生成速度
    this.updateEnemySpawnRate();
    
    // 检查是否需要生成Boss（每4级）
    if (this.gameStats.level % 4 === 0) {
      // 重置Boss状态，允许生成新Boss
      this.bossDefeated = false;
      if (!this.currentBoss || this.currentBoss.isDead()) {
        this.spawnBoss();
      }
    }
    
    // Pause game and show upgrade options
    this.isUpgradeModalOpen = true;
    this.physics.pause(); // 暂停物理引擎
    this.time.paused = true; // 暂停定时器
    this.showUpgradeOptions();
  }

  private showUpgradeOptions() {
    // Generate 3 random upgrade options
    const allUpgrades = [
      {
        id: 'bullets',
        title: '增加子弹数量',
        description: '每次射击发射更多子弹',
        icon: '🔫',
        effect: () => {
          this.player.updateStats({ bulletCount: this.player.stats.bulletCount + 1 });
          this.gameStats.playerStats.bulletCount = this.player.stats.bulletCount;
        }
      },
      {
        id: 'speed',
        title: '提高移动速度',
        description: '角色移动更快',
        icon: '⚡',
        effect: () => {
          this.player.updateStats({ speed: this.player.stats.speed + 30 });
          this.gameStats.playerStats.speed = this.player.stats.speed;
        }
      },
      {
        id: 'heal',
        title: '回复血量',
        description: '恢复总血量的一半',
        icon: '❤️',
        effect: () => {
          const healAmount = Math.floor(this.player.stats.maxHealth / 2);
          this.player.heal(healAmount);
          this.gameStats.health = this.player.stats.health;
        }
      },
      {
        id: 'defense',
        title: '增加防御力',
        description: '减少受到的伤害',
        icon: '🛡️',
        effect: () => {
          this.player.updateStats({ defense: this.player.stats.defense + 2 });
          this.gameStats.playerStats.defense = this.player.stats.defense;
        }
      },
      {
        id: 'circle-burst',
        title: '环形弹幕',
        description: `升级环形弹幕等级 (当前${this.circleBurstLevel}级)`,
        icon: '💥',
        effect: () => {
          // 升级环形弹幕等级
          this.circleBurstLevel++;
          // 立即触发一次环形弹幕让玩家体验
          this.fireCircleBurst();
        }
      },
      {
        id: 'attack',
        title: '增加攻击力',
        description: '子弹造成更多伤害',
        icon: '⚔️',
        effect: () => {
          this.player.updateStats({ attack: this.player.stats.attack + 10 });
          this.gameStats.playerStats.attack = this.player.stats.attack;
        }
      }
    ];

    // Randomly select 3 upgrades
    const shuffled = allUpgrades.sort(() => 0.5 - Math.random());
    this.pendingUpgradeOptions = shuffled.slice(0, 3);

    // Show upgrade modal via global callback
    const showUpgradeCallback = (window as any).__SHOW_UPGRADE_CALLBACK__;
    if (showUpgradeCallback) {
      showUpgradeCallback(this.pendingUpgradeOptions, this.gameStats.level);
    }
  }

  public selectUpgrade(upgradeId: string) {
    const selectedUpgrade = this.pendingUpgradeOptions.find(u => u.id === upgradeId);
    if (selectedUpgrade) {
      selectedUpgrade.effect();
      this.isUpgradeModalOpen = false;
      this.pendingUpgradeOptions = [];
      
      // 激活玩家5秒无敌状态
      this.player.activateInvincibility(5000);
      
      // Resume game
      this.physics.resume(); // 恢复物理引擎
      this.time.paused = false; // 恢复定时器
    }
  }

  private gameOver() {
    // Set game over flag to stop timer and updates
    this.isGameOver = true;
    
    // Set player health to zero for display
    this.player.updateStats({ health: 0 });
    this.gameStats.health = 0;
    
    // Force update UI to show zero health immediately
    this.gameUI.update({
      ...this.gameStats,
      circleBurstLevel: this.circleBurstLevel
    });
    
    // Wait a brief moment for health bar to update to zero, then pause game
    this.time.delayedCall(100, () => {
      // Stop enemy spawning and physics updates instead of pausing the whole scene
      this.physics.pause();
      
      // Always show game over screen in game first
      this.showGameOverScreen();
      
      // Then show score upload modal via global callback immediately
      const showScoreUploadCallback = (window as any).__SHOW_SCORE_UPLOAD_CALLBACK__;
      if (showScoreUploadCallback) {
        showScoreUploadCallback({
          level: this.gameStats.level,
          killCount: this.gameStats.killCount,
          gameTime: this.gameStats.gameTime
        });
      }
    });
  }

  private showGameOverScreen() {
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



  // 发射环形弹幕
  private fireCircleBurst() {
    const bulletCount = 24; // 一圈24发子弹
    const angleStep = (Math.PI * 2) / bulletCount; // 每发子弹间隔的角度
    
    for (let i = 0; i < bulletCount; i++) {
      const angle = i * angleStep;
      const bullet = new Bullet(this, this.player.x, this.player.y, null); // 没有目标，直接按角度发射
      this.bullets.add(bullet);
      
      // 设置子弹速度
      const speed = 450; // 比普通子弹稍快
      bullet.setVelocity(
        Math.cos(angle) * speed,
        Math.sin(angle) * speed
      );
    }
  }

  private togglePause() {
    if (this.isGameOver || this.isUpgradeModalOpen) {
      return; // 游戏结束或升级界面时不能暂停
    }

    this.isPaused = !this.isPaused;
    
    if (this.isPaused) {
      // 暂停游戏物理和定时器
      this.physics.pause();
      this.time.paused = true;
      
      // 显示商店界面
      const showPauseShopCallback = (window as any).__SHOW_PAUSE_SHOP_CALLBACK__;
      if (showPauseShopCallback) {
        showPauseShopCallback(this.gameStats.coins, this.itemPurchaseCounts);
      }
    } else {
      // 恢复游戏物理和定时器
      this.physics.resume();
      this.time.paused = false;
    }
  }

  public resumeFromShop() {
    // 恢复游戏（从商店界面调用）
    this.isPaused = false;
    this.physics.resume();
    this.time.paused = false;
    // 更新最后暂停时间，防止立即再次暂停
    this.lastPauseToggleTime = Date.now();
  }

  public purchaseShopItem(itemId: string): boolean {
    // 基础价格
    const basePrices: { [key: string]: number } = {
      'health-potion': 10,
      'speed-boost': 15,
      'damage-boost': 20,
      'bullet-boost': 25,
      'defense-boost': 18,
      'max-health-boost': 22,
      'circle-burst': 30,
      'full-heal': 25
    };

    const basePrice = basePrices[itemId];
    if (!basePrice) return false;

    // 计算当前价格（100%递增）
    const purchaseCount = this.itemPurchaseCounts[itemId] || 0;
    const currentPrice = Math.floor(basePrice * Math.pow(2, purchaseCount));

    // 检查是否有足够金币
    if (this.gameStats.coins < currentPrice) {
      return false;
    }

    // 扣除金币并记录购买
    this.gameStats.coins -= currentPrice;
    this.itemPurchaseCounts[itemId] = purchaseCount + 1;

    // 应用道具效果
    switch (itemId) {
      case 'health-potion':
        const healAmount = Math.floor(this.player.stats.maxHealth * 0.5);
        this.player.heal(healAmount);
        this.gameStats.health = this.player.stats.health;
        return true;
      case 'speed-boost':
        this.player.updateStats({ speed: this.player.stats.speed + 30 });
        this.gameStats.playerStats.speed = this.player.stats.speed;
        return true;
      case 'damage-boost':
        this.player.updateStats({ attack: this.player.stats.attack + 10 });
        this.gameStats.playerStats.attack = this.player.stats.attack;
        return true;
      case 'bullet-boost':
        this.player.updateStats({ bulletCount: this.player.stats.bulletCount + 1 });
        this.gameStats.playerStats.bulletCount = this.player.stats.bulletCount;
        return true;
      case 'defense-boost':
        this.player.updateStats({ defense: this.player.stats.defense + 2 });
        this.gameStats.playerStats.defense = this.player.stats.defense;
        return true;
      case 'max-health-boost':
        this.player.updateStats({ maxHealth: this.player.stats.maxHealth + 20 });
        this.gameStats.maxHealth = this.player.stats.maxHealth;
        this.gameStats.playerStats.maxHealth = this.player.stats.maxHealth;
        return true;
      case 'circle-burst':
        this.circleBurstLevel++;
        return true;
      case 'full-heal':
        this.player.updateStats({ health: this.player.stats.maxHealth });
        this.gameStats.health = this.player.stats.health;
        return true;
    }
    return false;
  }

  public getItemPrice(itemId: string): number {
    const basePrices: { [key: string]: number } = {
      'health-potion': 10,
      'speed-boost': 15,
      'damage-boost': 20,
      'bullet-boost': 25,
      'defense-boost': 18,
      'max-health-boost': 22,
      'circle-burst': 30,
      'full-heal': 25
    };

    const basePrice = basePrices[itemId];
    if (!basePrice) return 0;

    const purchaseCount = this.itemPurchaseCounts[itemId] || 0;
    return Math.floor(basePrice * Math.pow(2, purchaseCount));
  }

  private spawnBoss() {
    // 在屏幕中央生成Boss
    const boss = new BossEnemy(this, 500, 350, this.player, this.gameStats.level, 'monad1');
    this.enemies.add(boss);
    this.currentBoss = boss;
    this.bossDefeated = false;
    
    console.log(`Level ${this.gameStats.level} Boss spawned!`);
  }

  private checkBossStatus() {
    if (this.currentBoss && this.currentBoss.isDead()) {
      if (!this.bossDefeated) {
        this.bossDefeated = true;
        // Boss被击败，给予大量奖励
        this.gameStats.coins += 10; // Boss奖励100金币
        this.gameStats.experience += 200; // 大量额外经验
        console.log(`Boss defeated! +100 coins, +200 exp`);
        
        // 显示Boss金币弹出效果
        this.showCoinPopup(this.currentBoss.x, this.currentBoss.y, 100);
        
        // 延迟一点时间再销毁Boss，让金币动画正常播放
        this.time.delayedCall(100, () => {
          if (this.currentBoss && this.currentBoss.active) {
            this.currentBoss.destroy();
          }
          this.currentBoss = null;
        });
      }
    }
    
    // 额外检查：如果currentBoss引用的对象已经不活跃，清理引用
    if (this.currentBoss && !this.currentBoss.active) {
      this.currentBoss = null;
    }
  }

  private startEnemySpawning() {
    const spawnDelay = this.getEnemySpawnDelay();
    this.enemySpawnTimer = this.time.addEvent({
      delay: spawnDelay,
      callback: this.spawnEnemy,
      callbackScope: this,
      loop: true
    });
  }

  private getEnemySpawnDelay(): number {
    // 基础延迟700ms，每级减少20ms，最低100ms
    const baseDelay = 700;
    const levelReduction = (this.gameStats.level - 1) * 20;
    return Math.max(100, baseDelay - levelReduction);
  }

  private updateEnemySpawnRate() {
    if (this.enemySpawnTimer) {
      this.enemySpawnTimer.destroy();
    }
    this.startEnemySpawning();
    console.log(`Level ${this.gameStats.level}: Enemy spawn delay = ${this.getEnemySpawnDelay()}ms`);
  }

  private showCoinPopup(x: number, y: number, amount: number) {
    // 创建金币图标
    const coinIcon = this.add.image(x, y, 'gold');
    coinIcon.setScale(0.4); // 调整金币大小
    
    // 创建金币数量文本
    const coinText = this.add.text(x + 25, y - 15, `+${amount}`, {
      fontSize: '24px', // 增大字体
      color: '#fbbf24',
      fontStyle: 'bold',
      stroke: '#000000', // 添加黑色描边
      strokeThickness: 2 // 描边厚度
    });
    
    // 金币弹出动画
    this.tweens.add({
      targets: [coinIcon, coinText],
      y: y - 60, // 向上移动更多
      alpha: { from: 1, to: 0 }, // 淡出
      duration: 1200, // 稍微延长动画时间
      ease: 'Power2',
      onComplete: () => {
        coinIcon.destroy();
        coinText.destroy();
      }
    });
    
    // 金币图标单独的缩放动画
    this.tweens.add({
      targets: coinIcon,
      scale: { from: 0.4, to: 0.6 }, // 金币放大效果
      duration: 600,
      ease: 'Back.easeOut'
    });
  }
}